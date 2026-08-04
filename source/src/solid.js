// What you can actually walk into.
//
// Collision used to be tested against the OSM building footprints, which is a
// list of what the map says is there. It is not a list of what is DRAWN. A
// measurement over 3,800 points along Orchard Road found 11.5% of the solid
// walls standing at rider height had no footprint behind them at all: landmark
// podiums, entrance canopies, colonnades, ION's shell columns, the covered
// walkway, shophouse frontages and the distant massing are all placed by
// recipes rather than extruded from a footprint. You rode straight through
// every one of them.
//
// This is the same mistake the audit made when it checked only instanced props
// and called itself an audit of the world: the source list was mistaken for the
// thing itself. So build the collision from the geometry that exists.
//
// The method is a 2D occupancy grid rasterised from the WALLS in the band a
// rider occupies. Only near-vertical triangles count, so road surfaces,
// pavements, kerbs, roofs and canopies overhead do not block, and only
// triangles that actually cross the band count, so an awning three metres up is
// not a wall. Built once, after the district is finished and before the meshes
// are batched together, because after batching a mesh spans a whole tile and
// tells you nothing about where its walls are.
import * as THREE from '../lib/three.module.js';

const CELL = 0.75;              // metres; finer than a doorway, coarser than a mullion

export class Solid {
  constructor() { this.g = new Set(); this.n = 0; }

  // A NUMBER, not a string. 288,825 keys as "1234,5678" strings is tens of
  // megabytes of JS string on a phone; as integers it is a fraction of that.
  // The district spans a few thousand metres either side of the island origin,
  // so a 2^15 offset keeps both axes positive and the pair packs into an
  // ordinary 32-bit int.
  _key(x, z) {
    const ix = (Math.floor(x / CELL) + 32768) | 0;
    const iz = (Math.floor(z / CELL) + 32768) | 0;
    return ix * 65536 + iz;
  }

  mark(x, z) { this.g.add(this._key(x, z)); }

  // WHICH MESH MARKED THIS CELL. Opt-in only (`?solidtrace=1`), because a
  // second Map over ~290k cells is real phone memory and this is a diagnostic,
  // not a runtime need.
  //
  // It exists because the question "what is the wall at this point" has now
  // been answered wrongly twice by raycasting: a bounding box cannot tell a
  // thin diagonal rail from a wide plate, and after the per-tile merge a hit
  // names a mesh that spans 110m. The grid is rasterised from triangles, so
  // the grid is the only thing that knows the truth — ask it directly.
  what(x, z) { return this.why ? (this.why.get(this._key(x, z)) || null) : null; }

  // OPEN A WALKING ROUTE THAT RUNS THROUGH A BUILDING.
  //
  // Twenty-four mapped walking routes on Sentosa are blocked for more than 20m
  // at a stretch, the worst 226m, and none of them is a mapping error: OSM maps
  // the pedestrian way through Resorts World, Festive Walk and WEAVE because in
  // life you walk through them. We model no interiors, so the wall the facade
  // rasterised here is a dead end on a route the map says is a route — the
  // owner's "halfway will stuck", exactly.
  //
  // Carving AFTER build() rather than skipping the walls during it, because the
  // facade genuinely IS a wall everywhere else along the same mesh; what is
  // open is the corridor, not the building. data/arcade.py computes the
  // corridors, clipped to the footprint and padded past each face.
  carve(list) {
    let cleared = 0;
    for (const arc of (list || [])) {
      const pts = arc.p || [];
      const half = (arc.w || 3.6) / 2;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
        const L = Math.hypot(x2 - x1, z2 - z1);
        const steps = Math.max(1, Math.ceil(L / (CELL * 0.5)));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const cx = x1 + (x2 - x1) * t, cz = z1 + (z2 - z1) * t;
          // clear a disc, not a line: a 0.75m grid rasterised from a 3.6m
          // corridor needs its full width or a walker catches the edge
          for (let ox = -half; ox <= half; ox += CELL * 0.5) {
            for (let oz = -half; oz <= half; oz += CELL * 0.5) {
              if (ox * ox + oz * oz > half * half) continue;
              if (this.g.delete(this._key(cx + ox, cz + oz))) cleared++;
            }
          }
        }
      }
    }
    this.n = this.g.size;
    return cleared;
  }

  at(x, z) { return this.g.has(this._key(x, z)); }

  // Rasterise a line segment in XZ. A wall is a thin thing; stepping along it
  // at half a cell guarantees no gap a rider could squeeze through.
  _segment(x1, z1, x2, z2, tag) {
    const d = Math.hypot(x2 - x1, z2 - z1);
    const steps = Math.max(1, Math.ceil(d / (CELL * 0.5)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t, z = z1 + (z2 - z1) * t;
      this.mark(x, z);
      if (this.why && tag && !this.why.has(this._key(x, z))) {
        this.why.set(this._key(x, z), tag);
      }
    }
  }

  // TAKES A YIELD FUNCTION, because this is the single longest uninterrupted
  // call in a district build. A CPU profile of the freeze window — 1.2s to 4.5s
  // after the loading screen clears, which is exactly when the rider says the
  // game goes "stuck stuck stuck" — put `_segment` at 12.9% of all samples,
  // more than three times the next item. It walks every triangle of every mesh
  // in the district and marks the collision grid, and it did all of it without
  // once letting the browser draw a frame.
  //
  // Y is optional: the boot-time build happens behind the loading screen where
  // a freeze is invisible and nobody needs to pass one.
  async build(root, groundAt, opts = {}) {
    // The band a rider and a walker occupy. Below LOW is a kerb you ride over;
    // above HIGH is a canopy you pass under.
    const LOW = opts.low ?? 0.45;
    const HIGH = opts.high ?? 2.4;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    const ab = new THREE.Vector3(), ac = new THREE.Vector3(), nrm = new THREE.Vector3();
    let tris = 0, walls = 0, meshes = 0;

    // Collect first, then walk with a time budget: traverse() takes a callback
    // and cannot be paused from inside one.
    const Y = opts.yield || null;
    if (opts.trace) this.why = new Map();
    const meshList = [];
    root.traverse((o) => { if (o.isMesh && !o.isInstancedMesh) meshList.push(o); });
    let _st = performance.now();
    for (const o of meshList) {
      if (Y && performance.now() - _st > 6) { await Y(); _st = performance.now(); }
      const geo = o.geometry;
      const pos = geo && geo.attributes && geo.attributes.position;
      if (!pos) continue;
      if (o.userData && o.userData.nosolid) continue;
      meshes++;

      // A merged tile mesh is usually unnamed, so the useful identity is the
      // chain of parents plus whatever the recipe stashed in userData. Built
      // once per mesh, never in the triangle loop.
      // A NAME IS NOT AVAILABLE HERE AND THAT IS NOT A REASON TO GIVE UP.
      //
      // Buildings are merged per material and per tile by Merger BEFORE this
      // runs, so almost every mesh reaching this point is an unnamed tile
      // batch: a chain-of-parents tag answers "(unnamed)" for the entire
      // island and identifies nothing. What survives the merge is the
      // MATERIAL — merging is grouped BY material, so the material is a true
      // statement about what the geometry is — plus the geometry's own shape.
      // Together those name a thing well enough to go and fix it.
      let tag = null;
      if (this.why) {
        const chain = [];
        for (let p = o; p && chain.length < 4; p = p.parent) {
          if (p.name) chain.push(p.name);
        }
        const ud = o.userData ? Object.keys(o.userData).filter((k) => k !== 'nosolid') : [];
        const m = o.material;
        const bits = [];
        if (chain.length) bits.push(chain.join('<'));
        if (ud.length) bits.push('{' + ud.join(',') + '}');
        if (m) {
          if (m.name) bits.push('mat:' + m.name);
          if (m.color) bits.push('#' + m.color.getHexString());
          if (m.map) bits.push('MAP');
          if (m.transparent) bits.push('transparent');
          bits.push(m.type.replace('Mesh', '').replace('Material', ''));
        }
        bits.push('v=' + (geo.attributes.position ? geo.attributes.position.count : 0));
        tag = bits.join(' ') || '(unidentifiable)';
      }
      const idx = geo.index;
      const count = idx ? idx.count : pos.count;
      for (let i = 0; i < count; i += 3) {
        // AND INSIDE THE TRIANGLE LOOP, not just between meshes. Buildings are
        // merged per material and per 110m tile before this runs, so ONE mesh
        // can carry hundreds of thousands of triangles — pausing between meshes
        // bounds nothing when a single mesh is the whole half-second. Checked
        // every 4,096 triangles so the clock read costs nothing measurable.
        if (Y && (i & 4095) === 0 && performance.now() - _st > 6) {
          await Y(); _st = performance.now();
        }
        const i0 = idx ? idx.getX(i) : i;
        const i1 = idx ? idx.getX(i + 1) : i + 1;
        const i2 = idx ? idx.getX(i + 2) : i + 2;
        a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld);
        b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld);
        c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
        tris++;

        // near-vertical only: a face whose normal points up is a floor or a
        // roof, and you walk on those rather than into them
        ab.subVectors(b, a); ac.subVectors(c, a);
        nrm.crossVectors(ab, ac);
        const len = nrm.length();
        if (len < 1e-6) continue;
        if (Math.abs(nrm.y / len) > 0.6) continue;

        // and it has to cross the band, measured against the ground beneath it
        const gy = groundAt((a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3);
        const lo = Math.min(a.y, b.y, c.y) - gy;
        const hi = Math.max(a.y, b.y, c.y) - gy;
        if (hi < LOW || lo > HIGH) continue;

        walls++;
        this._segment(a.x, a.z, b.x, b.z, tag);
        this._segment(b.x, b.z, c.x, c.z, tag);
        this._segment(c.x, c.z, a.x, a.z, tag);
      }
    }
    this.n = this.g.size;
    return { meshes, tris, walls, cells: this.n };
  }
}
