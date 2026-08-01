// The ground. Everything else asks this module how high it is at a point.
//
// The heightfield comes from elevation sampled along road centrelines (roads are
// open sky, so the reading is close to the ground) with rooftop spikes filtered
// out. See data/terrain.py.
import * as THREE from '../lib/three.module.js';

// How closely the drawn ground has to track the bilinear surface, in metres.
//
// 1.5cm, and it MUST stay there. It was relaxed to 3cm to buy triangles after
// the street sweep failed F4, on the reasoning that carve() is what keeps the
// ground out of the road so the surface itself could be coarser. Measured, that
// reasoning is wrong: Marina Bay's P8 went 19 -> 24 at 3cm and 19 -> 21 at 2cm,
// and sits exactly on its budget of 19 at 1.5cm. Marina Bay's DEM is the one
// contaminated by tower roofs, so it has the least headroom anywhere and it is
// the district that decides this number.
//
// The triangles were bought back by TILING instead, which costs no accuracy at
// all: at the sweep's heaviest view the road surface went from 279k visible
// triangles to 2.6k, and the terrain culls entirely.
const TARGET = 0.015;
// Terrain is emitted in tiles of this many grid cells so it FRUSTUM-CULLS.
// One mesh spanning the district is never culled -- WORKFLOW.md records this
// costing 51fps to 33 when building geometry was merged globally, and the same
// trap caught the ground the moment subdivision made it big.
const TILE = 3;                        // 3 x 35m cells ~ 105m, the merger's tile size

export class Terrain {
  constructor(grid) {
    this.g = grid || null;
    this.flat = !grid;
    this.rg = null;        // road-corridor hash, set by carve()
  }

  // THE GROUND GIVES WAY TO THE ROAD. A road ribbon samples the ground at its
  // own vertices and is planar between them, while the drawn terrain now
  // follows the bilinear surface faithfully -- so wherever the bilinear ground
  // BULGES between two road vertices (measured at 0.40m on Empress Place,
  // whose DEM grade is contaminated by the towers around it), the ground stood
  // up through the road no matter how finely either was subdivided. Chasing it
  // with subdivision is an arms race; every game engine instead carves the
  // terrain under the carriageway. Vertices inside a road corridor drop 0.45m
  // below the local ground: far enough that no ribbon sag reaches them,
  // shallow enough that the dip never shows past the kerb, and applied
  // identically in build() and atDrawn() so the audit measures the same skin
  // that renders.
  carve(roads) {
    const CELL = 12;
    const rg = new Map();
    for (const r of roads) {
      if (r.bridge) continue;              // a deck has open ground under it
      const half = (r.w || 6) / 2 + 0.3;
      for (let i = 0; i < r.p.length - 1; i++) {
        const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
        const minx = Math.floor(Math.min(x1, x2) - half) , maxx = Math.ceil(Math.max(x1, x2) + half);
        const minz = Math.floor(Math.min(z1, z2) - half), maxz = Math.ceil(Math.max(z1, z2) + half);
        for (let cx = Math.floor(minx / CELL); cx <= Math.floor(maxx / CELL); cx++) {
          for (let cz = Math.floor(minz / CELL); cz <= Math.floor(maxz / CELL); cz++) {
            const k = cx + ',' + cz;
            if (!rg.has(k)) rg.set(k, []);
            rg.get(k).push([x1, z1, x2, z2, half]);
          }
        }
      }
    }
    this.rg = rg;
    this.rgCell = CELL;
  }

  inRoad(x, z) {
    const rg = this.rg;
    if (!rg) return false;
    const list = rg.get(Math.floor(x / this.rgCell) + ',' + Math.floor(z / this.rgCell));
    if (!list) return false;
    for (const [x1, z1, x2, z2, half] of list) {
      const dx = x2 - x1, dz = z2 - z1;
      const L2 = dx * dx + dz * dz || 1;
      let t = ((x - x1) * dx + (z - z1) * dz) / L2;
      t = Math.max(0, Math.min(1, t));
      const px = x1 + dx * t, pz = z1 + dz * t;
      if ((x - px) ** 2 + (z - pz) ** 2 <= half * half) return true;
    }
    return false;
  }

  // the height a DRAWN terrain vertex takes at a point: the bilinear ground,
  // dropped 6cm so props seat into it, and carved under roads
  vertexY(x, z) {
    return this.at(x, z) - (this.inRoad(x, z) ? 0.51 : 0.06);
  }

  // bilinear height at a world point; 0 everywhere if the district has no grid
  at(x, z) {
    const g = this.g;
    if (!g) return 0;
    const fx = (x - g.x0) / g.cell;
    const fz = (z - g.z0) / g.cell;
    let i = Math.floor(fx), j = Math.floor(fz);
    // clamp to the edge rather than dropping to zero outside the grid
    if (i < 0) i = 0; if (j < 0) j = 0;
    if (i > g.nx - 2) i = g.nx - 2;
    if (j > g.nz - 2) j = g.nz - 2;
    const tx = Math.min(1, Math.max(0, fx - i));
    const tz = Math.min(1, Math.max(0, fz - j));
    const h = g.h;
    const a = h[j * g.nx + i], b = h[j * g.nx + i + 1];
    const c = h[(j + 1) * g.nx + i], d = h[(j + 1) * g.nx + i + 1];
    return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  }

  // slope, for tilting the scooter and the camera into a hill
  slopeAlong(x, z, ux, uz, span = 3) {
    return (this.at(x + ux * span, z + uz * span) - this.at(x - ux * span, z - uz * span))
      / (2 * span);
  }

  // How finely a cell must be drawn to stay true to at(). One vertex per grid
  // node draws each 35m cell as two flat triangles, and a flat triangle can sit
  // up to |twist|/4 ABOVE the bilinear surface everything else in the world is
  // built against -- measured at 26cm over Orchard Road, which put the beige
  // ground THROUGH the tarmac in smooth blobs and cut the lane lines. That was
  // the user's "yellow patches on the road". The error of an n-subdivided cell
  // falls as 1/n^2, so n comes from the cell's own twist and a 1.5cm target.
  // Divisors of 24 only, so shared edge points between neighbouring cells land
  // on identical keys and weld -- a T-vertex on a coarser neighbour's edge is
  // still ON that edge, because bilinear restricted to a cell edge is linear.
  subdiv(i, j) {
    const g = this.g, h = g.h;
    const a = h[j * g.nx + i], b = h[j * g.nx + i + 1];
    const c = h[(j + 1) * g.nx + i], d = h[(j + 1) * g.nx + i + 1];
    const twist = Math.abs(a + d - b - c) / 4;
    const need = Math.sqrt(twist / TARGET);
    for (const n of [1, 2, 3, 4, 6, 8, 12]) if (n >= need) return n;
    return 12;
  }

  // the height of the DRAWN ground at a point, which is not at(): the mesh is
  // piecewise flat between its vertices. The audit measures the world that is
  // rendered, not the function it was sampled from -- P8 compared at() with a
  // road built from at() and stayed green while the drawn skin bulged 26cm.
  atDrawn(x, z) {
    const g = this.g;
    if (!g) return -0.05;
    const fx = (x - g.x0) / g.cell, fz = (z - g.z0) / g.cell;
    let i = Math.floor(fx), j = Math.floor(fz);
    if (i < 0) i = 0; if (j < 0) j = 0;
    if (i > g.nx - 2) i = g.nx - 2;
    if (j > g.nz - 2) j = g.nz - 2;
    const n = this.subdiv(i, j);
    const u = Math.min(1, Math.max(0, fx - i)) * n, v = Math.min(1, Math.max(0, fz - j)) * n;
    let si = Math.floor(u), sj = Math.floor(v);
    if (si > n - 1) si = n - 1; if (sj > n - 1) sj = n - 1;
    const X = (ii, jj) => g.x0 + (i + ii / n) * g.cell;
    const Z = (ii, jj) => g.z0 + (j + jj / n) * g.cell;
    const H = (ii, jj) => this.vertexY(X(ii, jj), Z(ii, jj));
    const tu = u - si, tv = v - sj;
    const h00 = H(si, sj), h10 = H(si + 1, sj), h01 = H(si, sj + 1), h11 = H(si + 1, sj + 1);
    // triangles (00,10,01) and (10,11,01) -- KEEP IN STEP with build()
    if (tu + tv <= 1) return h00 + (h10 - h00) * tu + (h01 - h00) * tv;
    return h11 + (h01 - h11) * (1 - tu) + (h10 - h11) * (1 - tv);
  }

  // GREEN SPACE, PAINTED ONTO THE GROUND ITSELF.
  //
  // Singapore is a garden city and this world drew none of it: every park,
  // garden, field and the whole of the Istana grounds was bare terrain the
  // colour of sand. The rider's words, riding Orchard Road: "istana all still
  // empty place". Orchard alone turns out to hold 986,000 m2 of mapped green
  // space and Marina Bay 2.2 km2, none of which had ever been fetched.
  //
  // Painted as VERTEX COLOUR on the ground mesh rather than laid over it as a
  // second surface. A park is not a plane — it climbs Fort Canning and rolls
  // through the Botanic Gardens — so an overlay would have to match the
  // terrain's own tessellation exactly or z-fight it. Tinting the ground costs
  // no extra draw call, no extra triangle, and follows the land by
  // construction.
  setGreen(list) {
    this.green = [];
    this.gGrid = new Map();
    this.gCell = 60;
    for (const p of (list || [])) {
      if (!p.p || p.p.length < 4) continue;
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of p.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      const rec = { ring: p.p, k: p.k || 'grass', bb: [mnx, mnz, mxx, mxz] };
      const id = this.green.length;
      this.green.push(rec);
      for (let cx = Math.floor(mnx / this.gCell); cx <= Math.floor(mxx / this.gCell); cx++) {
        for (let cz = Math.floor(mnz / this.gCell); cz <= Math.floor(mxz / this.gCell); cz++) {
          const k = cx + ',' + cz;
          let l = this.gGrid.get(k);
          if (!l) { l = []; this.gGrid.set(k, l); }
          l.push(id);
        }
      }
    }
  }

  // which green kind covers this point, or null. Smallest-ring-wins so a pitch
  // inside a park reads as a pitch.
  greenAt(x, z) {
    if (!this.gGrid) return null;
    const l = this.gGrid.get(Math.floor(x / this.gCell) + ',' + Math.floor(z / this.gCell));
    if (!l) return null;
    let best = null, bestA = Infinity;
    for (const id of l) {
      const r = this.green[id];
      const [mnx, mnz, mxx, mxz] = r.bb;
      if (x < mnx || x > mxx || z < mnz || z > mxz) continue;
      let hit = false;
      const ring = r.ring;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], zi = ring[i][1], xj = ring[j][0], zj = ring[j][1];
        if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
      }
      if (!hit) continue;
      const a = (mxx - mnx) * (mxz - mnz);
      if (a < bestA) { bestA = a; best = r.k; }
    }
    return best;
  }

  // the visible ground mesh
  build(material) {
    const g = this.g;
    if (!g) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2600), material);
      m.rotation.x = -Math.PI / 2;
      m.position.y = -0.05;
      m.receiveShadow = true;
      return m;
    }
    // Adaptive grid in SPATIAL TILES, each cell subdivided per its twist, and
    // vertices welded on a 1/24-cell key so each tile is indexed and its
    // normals are smooth.
    //
    // Tiles share their edge vertices by VALUE rather than by index -- two
    // neighbouring tiles compute the same vertexY() at the same key, so the
    // seam closes exactly even though each tile owns its own buffer. Normals
    // are computed per tile, so a seam vertex has only its own tile's faces
    // and its normal differs slightly across the join; on a ground plane lit
    // by one sun that is invisible, and it is the price of culling.
    const group = new THREE.Group();
    group.name = 'terrainSurface';
    for (let tj = 0; tj < g.nz - 1; tj += TILE) {
      for (let ti = 0; ti < g.nx - 1; ti += TILE) {
        const verts = new Map();   // "qx,qz" -> index within THIS tile
        const pos = [], idx = [], col = [];
        // one tint per green kind; white leaves the ground material untouched
        // Green reads as green; the built-up kinds only shift the sand a little,
        // because the point is to stop a condo garden, a car-park apron and a
        // mall forecourt all being the same colour — not to paint the city.
        const TINT = {
          park:  [0.52, 0.78, 0.46],
          grass: [0.58, 0.80, 0.50],
          pitch: [0.46, 0.74, 0.42],
          wood:  [0.34, 0.55, 0.32],
          scrub: [0.62, 0.72, 0.46],
          resi:  [0.86, 0.86, 0.78],
          comm:  [0.90, 0.89, 0.86],
          civic: [0.88, 0.87, 0.82],
          indus: [0.80, 0.79, 0.76],
          works: [0.84, 0.80, 0.72],
          parking: [0.72, 0.71, 0.70],
          plaza: [0.93, 0.91, 0.87],
        };
        const vid = (qx, qz) => {
          const k = qx + ',' + qz;
          let id = verts.get(k);
          if (id === undefined) {
            id = pos.length / 3;
            const x = g.x0 + (qx / 24) * g.cell, z = g.z0 + (qz / 24) * g.cell;
            pos.push(x, this.vertexY(x, z), z);
            const t = this.gGrid ? TINT[this.greenAt(x, z)] : null;
            if (t) col.push(t[0], t[1], t[2]); else col.push(1, 1, 1);
            verts.set(k, id);
          }
          return id;
        };
        const jEnd = Math.min(tj + TILE, g.nz - 1), iEnd = Math.min(ti + TILE, g.nx - 1);
        for (let j = tj; j < jEnd; j++) {
          for (let i = ti; i < iEnd; i++) {
            const n = this.subdiv(i, j), q = 24 / n;
            for (let sj = 0; sj < n; sj++) {
              for (let si = 0; si < n; si++) {
                const x0 = i * 24 + si * q, z0 = j * 24 + sj * q;
                const v00 = vid(x0, z0), v10 = vid(x0 + q, z0);
                const v01 = vid(x0, z0 + q), v11 = vid(x0 + q, z0 + q);
                // KEEP IN STEP with atDrawn()
                idx.push(v00, v01, v10, v10, v01, v11);
              }
            }
          }
        }
        if (!idx.length) continue;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, material);
        // Every tile keeps the NAME, because the audit identifies the ground by
        // it. P1b was reporting the heightfield as "structure in a carriageway"
        // wherever the ground surfaces within 6cm of the tarmac -- the ground is
        // not structure, and P8 owns that question. A rename here silently
        // turns the ground back into structure for every check in the file.
        mesh.name = 'terrainSurface';
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    }
    return group;
  }

  // a skirt beyond the sampled area, so the world does not end in a cliff
  buildApron(material) {
    const g = this.g;
    if (!g) return null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), material);
    m.rotation.x = -Math.PI / 2;
    const mid = g.h[Math.floor(g.h.length / 2)];
    m.position.set(g.x0 + (g.nx * g.cell) / 2, mid - 0.4, g.z0 + (g.nz * g.cell) / 2);
    m.receiveShadow = true;
    return m;
  }
}
