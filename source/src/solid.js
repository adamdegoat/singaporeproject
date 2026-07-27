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

  at(x, z) { return this.g.has(this._key(x, z)); }

  // Rasterise a line segment in XZ. A wall is a thin thing; stepping along it
  // at half a cell guarantees no gap a rider could squeeze through.
  _segment(x1, z1, x2, z2) {
    const d = Math.hypot(x2 - x1, z2 - z1);
    const steps = Math.max(1, Math.ceil(d / (CELL * 0.5)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.mark(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t);
    }
  }

  build(root, groundAt, opts = {}) {
    // The band a rider and a walker occupy. Below LOW is a kerb you ride over;
    // above HIGH is a canopy you pass under.
    const LOW = opts.low ?? 0.45;
    const HIGH = opts.high ?? 2.4;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    const ab = new THREE.Vector3(), ac = new THREE.Vector3(), nrm = new THREE.Vector3();
    let tris = 0, walls = 0, meshes = 0;

    root.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const geo = o.geometry;
      const pos = geo && geo.attributes && geo.attributes.position;
      if (!pos) return;
      if (o.userData && o.userData.nosolid) return;
      meshes++;
      const idx = geo.index;
      const count = idx ? idx.count : pos.count;
      for (let i = 0; i < count; i += 3) {
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
        this._segment(a.x, a.z, b.x, b.z);
        this._segment(b.x, b.z, c.x, c.z);
        this._segment(c.x, c.z, a.x, a.z);
      }
    });
    this.n = this.g.size;
    return { meshes, tris, walls, cells: this.n };
  }
}
