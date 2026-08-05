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
    // raw grid accessor for coastal logic (buildSea, shoreline sand): reads
    // only — nothing may write the heightfield through this
    this.grid = () => this.g;
    // metres to the nearest open-sea cell, lazy multi-source BFS
    // over the grid on first call. Feeds the shoreline sand blend; an inland
    // district computes it once, finds no sea, and answers Infinity forever.
    this._seaD = null;
    this.seaDistAt = (x, z) => {
      const g2 = this.g;
      if (!g2) return Infinity;
      if (!this._seaD) {
        const n = g2.nx * g2.nz;
        const d = new Float32Array(n).fill(1e9);
        const q = [];
        // SEA IS ZERO HERE, NOT NEGATIVE, AND IT REACHES THE EDGE OF THE MAP.
        //
        // Two bugs, one after the other. This first tested `h < -0.4`, and the
        // heightfield's minimum on Sentosa is exactly 0.00 — the pipeline
        // clamps the sea to sea level — so the BFS found no sources, answered
        // Infinity everywhere, and the shoreline sand blend that depends on it
        // HAD NEVER ONCE RUN. Failing silently, because Infinity is also the
        // right answer for an inland district.
        //
        // Then `h <= 0.05` alone was too generous the other way: 7,932 of
        // 14,210 cells sit at that height, including flat INLAND ground, so
        // the sand blend spread across the middle of the island and painted
        // Palawan's hinterland as beach. Rendered, it was a pale desert.
        //
        // The sea is the zero region that REACHES THE EDGE OF THE MAP. An
        // inland flat does not. So flood in from the border through zero cells
        // and take that, and only that, as open water.
        const SEA_Y = 0.05;
        const isSea = new Uint8Array(n);
        const stack = [];
        const pushIf = (idx) => {
          if (idx >= 0 && idx < n && !isSea[idx] && g2.h[idx] <= SEA_Y) {
            isSea[idx] = 1; stack.push(idx);
          }
        };
        for (let i = 0; i < g2.nx; i++) { pushIf(i); pushIf((g2.nz - 1) * g2.nx + i); }
        for (let j = 0; j < g2.nz; j++) { pushIf(j * g2.nx); pushIf(j * g2.nx + g2.nx - 1); }
        while (stack.length) {
          const c = stack.pop();
          const ci = c % g2.nx, cj = (c / g2.nx) | 0;
          if (ci > 0) pushIf(c - 1);
          if (ci < g2.nx - 1) pushIf(c + 1);
          if (cj > 0) pushIf(c - g2.nx);
          if (cj < g2.nz - 1) pushIf(c + g2.nx);
        }
        for (let i = 0; i < n; i++) if (isSea[i]) { d[i] = 0; q.push(i); }
        if (!q.length) { this._seaD = d; return Infinity; }
        for (let head = 0; head < q.length; head++) {
          const c = q[head];
          const ci = c % g2.nx, cj = (c / g2.nx) | 0;
          const nd = d[c] + g2.cell;
          if (nd > 160) continue;                 // the blend only needs ~80m
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const ni = ci + di, nj = cj + dj;
            if (ni < 0 || nj < 0 || ni >= g2.nx || nj >= g2.nz) continue;
            const nc = nj * g2.nx + ni;
            if (d[nc] > nd) { d[nc] = nd; q.push(nc); }
          }
        }
        this._seaD = d;
      }
      const i = Math.max(0, Math.min(g2.nx - 1, Math.round((x - g2.x0) / g2.cell)));
      const j = Math.max(0, Math.min(g2.nz - 1, Math.round((z - g2.z0) / g2.cell)));
      return this._seaD[j * g2.nx + i];
    };
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

  // THE RIVERBED, CUT AT MESH RESOLUTION INSTEAD OF GRID RESOLUTION.
  //
  // The Singapore River was buried under five metres of ground. Its water plane
  // was drawn correctly at 0.57m (Marina Barrage holds the whole basin at one
  // level) and the terrain over it stood at 3-8m, so Boat Quay, Clarke Quay and
  // Robertson Quay were a dry canyon.
  //
  // data/terrain.py DOES try to sink water, and it is not the sink rule that is
  // wrong — it is the SCALE. Measured 2026-08-01 on Robertson's ring: the river
  // is 1,786m long and its widest point is 11.1m from a bank, i.e. about 22m
  // across. The height grid is 35m. Seventeen cells do get sunk, but they are
  // isolated islands among cells that were not, and the bilinear read in at()
  // pulls the surface straight back up between them. A grid coarser than the
  // river cannot hold the river, and no tuning of the inset changes that.
  //
  // The drawn MESH is subdivided 24 ways per cell — about 1.46m — which is
  // twenty times finer than the grid and comfortably finer than the river. So
  // the cut belongs here, on the vertex, and NOT in at(): at() is what
  // placement, collision and every check measure against, and dropping it under
  // the water would move the ground out from under the quay beside it. Only
  // what is DRAWN goes down.
  //
  // The step from bank to bed lands in one mesh interval, which reads as a
  // vertical quay wall — which is what the Singapore River actually has.
  setWaterRings(rings) {
    this.wr = [];
    this.wrGrid = new Map();
    this.wrCell = 60;
    for (const ring of rings || []) {
      if (!ring || ring.length < 4) continue;
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity, lo = Infinity;
      for (const [x, z] of ring) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
        const g = this.at(x, z);       // the UNCLAMPED grid, exactly as buildWater reads it
        if (g < lo) lo = g;
      }
      if (!isFinite(lo)) continue;
      // buildWater() puts the surface at rim - 0.35. Sit the bed 1.4m under it
      // so there is visible depth rather than z-fighting.
      const id = this.wr.length;
      this.wr.push({ ring, floor: lo - 0.35 - 1.4, bb: [mnx, mnz, mxx, mxz] });
      for (let cx = Math.floor(mnx / this.wrCell); cx <= Math.floor(mxx / this.wrCell); cx++)
        for (let cz = Math.floor(mnz / this.wrCell); cz <= Math.floor(mxz / this.wrCell); cz++) {
          const k = cx + ',' + cz;
          let l = this.wrGrid.get(k);
          if (!l) { l = []; this.wrGrid.set(k, l); }
          l.push(id);
        }
    }
  }

  // the bed height under a point inside a water ring, or null on dry land
  waterFloor(x, z) {
    if (!this.wrGrid) return null;
    const l = this.wrGrid.get(Math.floor(x / this.wrCell) + ',' + Math.floor(z / this.wrCell));
    if (!l) return null;
    let best = null;
    for (const id of l) {
      const w = this.wr[id];
      if (x < w.bb[0] || x > w.bb[2] || z < w.bb[1] || z > w.bb[3]) continue;
      let hit = false;
      const r = w.ring;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const xi = r[i][0], zi = r[i][1], xj = r[j][0], zj = r[j][1];
        if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
      }
      // deepest wins where two rings overlap, so a river mouth meeting the bay
      // does not leave a ridge on the seam
      if (hit && (best === null || w.floor < best)) best = w.floor;
    }
    return best;
  }

  // the height a DRAWN terrain vertex takes at a point: the bilinear ground,
  // dropped 6cm so props seat into it, and carved under roads
  vertexY(x, z) {
    const y = this.at(x, z) - (this.inRoad(x, z) ? 0.51 : 0.06);
    const bed = this.waterFloor(x, z);
    if (bed === null) return y;
    // A RING EDGE THAT OVERREACHES ONTO FIRM LAND DOES NOT SINK A HILL.
    // The grid's own data-side passes already sank every genuine water cell,
    // so a drawn sink deeper than ~7m below the logical ground is the water
    // POLYGON being sloppy at its edge, not the world having water there.
    // Measured 2026-08-04 NW of Beach Station: a 40m shore strip stood
    // 6-10m of standing height over a drawn sea at 0.2 (gaps -5..-9m) —
    // the owner's "road floating up in the air" — because the strait ring
    // cuts inland of the surveyed coastline there while the sea pass had
    // rightly kept those cells as land. Rivers and quays sink 2-6m and are
    // untouched by this gate.
    if (y - bed > 7) return y;
    return Math.min(y, bed);
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
    let n0 = 12;
    for (const n of [1, 2, 3, 4, 6, 8, 12]) { if (n >= need) { n0 = n; break; } }
    // THE WATERLINE NEEDS RESOLUTION THAT TWIST WILL NEVER ASK FOR.
    //
    // subdiv measures CURVATURE alone, and a shore is a smooth ramp with almost
    // no twist, so the sand met the sea in a 35m staircase in every view from
    // the beaches — which is where a player spawns. Curvature is the right
    // question for a hillside and the wrong one for an edge.
    //
    // BUT THE WATERLINE IS NOT WHERE THE HEIGHTFIELD CROSSES ZERO, and the
    // first version of this rule assumed it was. Measured: `lo < 0.35 &&
    // hi > -0.35` matched 8,271 of 13,968 cells — FIFTY-NINE PER CENT of the
    // grid, because the seabed is flat near zero, and it put 543k triangles on
    // the open sea. The apparently-correct tightening (`lo < 0 < hi`) matches
    // ZERO cells, because no cell straddles exactly zero.
    //
    // This project already knew that: "the DEM smears coasts — absolute
    // elevation can NEVER find a waterline". So ask the thing that does know.
    // seaDistAt is a BFS out from genuinely-submarine cells, so a cell that
    // HAS land in it and sits within a cell's reach of open sea is the shore,
    // and nothing else is.
    // Measured on this heightfield: min 0.00, max 81.09 — the pipeline CLAMPS
    // the sea to exactly zero and never goes below it. So the shore is a cell
    // holding both a zero corner and a land corner, and that matches 1,019 of
    // 13,968 cells (7.3%), about 71k triangles. The rejected alternatives, for
    // whoever tunes this next: "near zero" caught 59% of the grid and 543k
    // triangles of open sea; "straddles zero" caught none.
    const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
    if (lo <= 0.05 && hi > 0.5) n0 = Math.max(n0, 6);
    return n0;
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
  // WHAT IS ACTUALLY GROWING OVERHEAD, not what the map drew a polygon around.
  //
  // "Forest trails must feel like forest, not a path with trees beside it" —
  // the owner. The reason they did not is that the floor under Sentosa's jungle
  // is not painted as jungle: most of the island's tree cover has no `wood`
  // landuse polygon over it, so those vertices fall through to the green-island
  // fallback, which is a pale sage LAWN colour. Trees were being planted on a
  // mown field.
  //
  // The trees themselves are the honest source — 3,700 of them, positioned. So
  // count how many stand within a canopy radius of each ground vertex and shade
  // the floor by it: deep shade and leaf litter under a closed canopy, the
  // ordinary surface out in the open, and a real gradient at the edge where a
  // clearing opens. Built once into a coarse grid, so the colour loop pays one
  // lookup per vertex and nothing per tree.
  setCanopy(trees) {
    this.cCell = 12;
    this.cGrid = new Map();
    let n = 0;
    for (const t of (trees || [])) {
      // trees arrive as [x, z, ...] or {p:[x,z]}; accept both rather than
      // assuming, because this list is shared with the instancing pass
      const x = Array.isArray(t) ? t[0] : (t && t.p ? t.p[0] : null);
      const z = Array.isArray(t) ? t[1] : (t && t.p ? t.p[1] : null);
      if (x === null || z === null || !isFinite(x) || !isFinite(z)) continue;
      const k = Math.floor(x / this.cCell) + ',' + Math.floor(z / this.cCell);
      this.cGrid.set(k, (this.cGrid.get(k) || 0) + 1);
      n++;
    }
    this.canopyN = n;
    return n;
  }

  // 0 = open ground, 1 = closed canopy. Counts the 3x3 block of cells around
  // the point — a 36m window, which is about the width at which a Sentosa
  // trail stops feeling enclosed.
  canopyAt(x, z) {
    if (!this.cGrid || !this.canopyN) return 0;
    const cx = Math.floor(x / this.cCell), cz = Math.floor(z / this.cCell);
    let n = 0;
    for (let ix = cx - 1; ix <= cx + 1; ix++) {
      for (let iz = cz - 1; iz <= cz + 1; iz++) n += this.cGrid.get(ix + ',' + iz) || 0;
    }
    // 9 cells of 12m hold roughly 14 trees at Sentosa's densest; saturate a
    // little below that so the deep jungle is uniformly dark rather than
    // shading right up to its own maximum
    return Math.min(1, n / 11);
  }

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
    // HOW GREEN IS THIS DISTRICT? Measured once, on the grid the ground is
    // actually drawn from, and used to decide what UNCLASSIFIED ground should
    // look like (see the vertex colour in build()). Sentosa reads about 57%;
    // the CBD districts read a few per cent.
    this.greenFrac = 0;
    if (this.g) {
      const g = this.g;
      // COUNT LAND, NOT SEA. This asked every cell in the grid, and on an
      // ISLAND most of the grid is water — so Sentosa's own green fraction came
      // out at 0.18 against a threshold of 0.35, the "on a green island,
      // unknown ground is vegetation" rule NEVER FIRED, and every unmapped
      // cell fell through to pale khaki.
      //
      // That one number is why bare pale ground kept turning up all over the
      // island: the whole Fort Siloso headland, which is dense jungle in life,
      // rendered as an empty beige plain (45 of 48 sampled cells there are
      // unmapped). Measured: 650 of 3,577 cells are green — 0.18 — but 650 of
      // the 1,582 LAND cells are, which is 0.41 and the truth about the place.
      //
      // A district's greenness is a fact about its GROUND. The sea is not
      // ungreen land, it is not land.
      let hit = 0, n = 0;
      for (let j = 0; j < g.nz; j += 2) {
        for (let i = 0; i < g.nx; i += 2) {
          if (g.h[j * g.nx + i] <= 0.05) continue;      // sea
          n++;
          const k = this.greenAt(g.x0 + i * g.cell, g.z0 + j * g.cell);
          if (k && k !== 'pool') hit++;
        }
      }
      this.greenFrac = n ? hit / n : 0;
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
  // THE FLOOR UNDER THE FOREST, applied after the forest exists.
  //
  // build() records each ground vertex's canopy class and leaves it unshaded;
  // this darkens it once city.js has planted, so the ~6,600 trees the forest
  // fill invents count toward the shade exactly as the surveyed ones do. Call
  // it ONCE, after plantSurveyed. If it is never called the ground is simply
  // not shaded, which is loud rather than subtle — the golden frames catch it.
  applyCanopy(extraTrees) {
    if (extraTrees && extraTrees.length) this.addCanopy(extraTrees);
    if (!this.tiles || !this.tiles.length) return 0;
    const LITTER = [0.098, 0.090, 0.058];
    let shaded = 0;
    for (const t of this.tiles) {
      const pos = t.geo.attributes.position.array;
      const col = t.geo.attributes.color.array;
      const cls = t.cls;
      let touched = false;
      for (let v = 0; v < cls.length; v++) {
        const code = cls[v];
        if (code === 255) continue;                 // paving, sand, water: never
        const x = pos[v * 3], z = pos[v * 3 + 2];
        // 0.85, not the 0.5 this rule was written with. That discount existed
        // because canopyAt could only ever see `data.trees` — 3,713 surveyed
        // trees over the whole island, one per ~2,150 m2 — so a full reading
        // meant "a clump of specimen trees", not "closed canopy", and shading
        // it like a mapped wood would have been a lie. With the forest fill
        // counted the grid holds 15,823 trees and a reading of 1.0 IS closed
        // canopy: the unmapped slopes at Fort Siloso and Imbiah are jungle in
        // life and OSM simply never classified them. A lone clump still reads
        // low and still shades only a little.
        const cn = Math.min(1, (code === 2 ? 1 : code === 1 ? 0.45 : 0)
          + this.canopyAt(x, z) * 0.85);
        if (cn <= 0.02) continue;
        const f = cn * 0.62;                        // never all the way to black
        const i0 = v * 3;
        for (let ci = 0; ci < 3; ci++) col[i0 + ci] = col[i0 + ci] * (1 - f) + LITTER[ci] * f;
        touched = true;
        shaded++;
      }
      if (touched) t.geo.attributes.color.needsUpdate = true;
    }
    return shaded;
  }

  // add trees to the canopy density grid without rebuilding it
  addCanopy(trees) {
    if (!this.cGrid) { this.cGrid = new Map(); this.canopyN = 0; }
    for (const t of trees) {
      const x = Array.isArray(t) ? t[0] : (t && t.p ? t.p[0] : null);
      const z = Array.isArray(t) ? t[1] : (t && t.p ? t.p[1] : null);
      if (x === null || z === null || !isFinite(x) || !isFinite(z)) continue;
      const k = Math.floor(x / this.cCell) + ',' + Math.floor(z / this.cCell);
      this.cGrid.set(k, (this.cGrid.get(k) || 0) + 1);
      this.canopyN++;
    }
    return this.canopyN;
  }

  build(material) {
    this.tiles = [];
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
        const clsOf = [];          // canopy class per vertex, for applyCanopy()
        // one tint per green kind; white leaves the ground material untouched
        // Green reads as green; the built-up kinds only shift the sand a little,
        // because the point is to stop a condo garden, a car-park apron and a
        // mall forecourt all being the same colour — not to paint the city.
        const TINT = {
          park:  [0.52, 0.78, 0.46],
          grass: [0.58, 0.80, 0.50],
          pitch: [0.46, 0.74, 0.42],
          // A golf fairway is its own green: brighter and yellower than jungle,
          // more manicured than a pitch. Sentosa's two courses (The Tanjong,
          // The Serapong) were drawing as football fields.
          golf:  [0.55, 0.76, 0.40],
          // A running track is red-brown rubber and a pool is blue, and both
          // are read from a bridge before anything else on the ground is: they
          // are the only two surfaces in the city with a colour nothing else
          // has. Jalan Besar, Farrer Park and the River Valley complex all sit
          // inside these districts and were drawing as ordinary green.
          track: [0.72, 0.36, 0.28],
          pool:  [0.36, 0.62, 0.76],
          wood:  [0.34, 0.55, 0.32],
          scrub: [0.62, 0.72, 0.46],
          // Beach sand. Warm and pale, and deliberately not the old ground
          // fallback colour — that was warm sand too, and it was the
          // BRIGHTEST surface in the world because land tints multiply
          // downward. This one is a real surface being painted, not a
          // stand-in for one that is missing.
          // Warmed and brightened for the island pass (2026-08-03): beside
          // real sea the old value read as pale concrete from the beach walk;
          // golden enough to say "beach" at a glance, still shy of cartoon.
          // Cooled back toward cream for the Siloso pass (2026-08-04): every
          // reference frame (research/ref-siloso/strip.jpg clearest) shows
          // pale cream-white sand, not gold — Siloso's sand is imported pale.
          // The old fear was reading as concrete, but that came from the flat
          // grey sea beside it; with the jade lagoon in, cream reads as beach.
          sand:  [0.94, 0.89, 0.74],
          resi:  [0.86, 0.86, 0.78],
          comm:  [0.90, 0.89, 0.86],
          civic: [0.88, 0.87, 0.82],
          indus: [0.80, 0.79, 0.76],
          works: [0.84, 0.80, 0.72],
          parking: [0.70, 0.70, 0.70],
          // A PLAZA IS PAVING, AND PAVING IS COOL GREY.
          //
          // This was 0.93,0.91,0.87 — a warm near-white, brighter than the
          // beaches. Standing at the Universal Studios globe, which sits on a
          // mapped 9,350 m2 plaza outside the park entrance, the forecourt read
          // as SAND: the owner saw the render and said the globe looked like it
          // was on the beach. The globe is in the right place (confirmed: it
          // stands outside the USS main entrance inside Resorts World) — the
          // ground under it was the lie.
          //
          // Cool and a shade darker, so paving reads as paving and the sand
          // beside it is the brightest thing on the island again, which is what
          // sand actually is.
          plaza: [0.80, 0.80, 0.79],
        };
        // GROUND VARIATION, FROM A POSITION HASH — never from an RNG stream.
        //
        // Every tint above is a single flat colour for a whole class, so all of
        // Sentosa's jungle was one green, all its sand one beige, and the
        // island read as poster paint: the owner's "empty car park with trees
        // on it" survived even after the classes were right, because a real
        // hillside is never one colour.
        //
        // The variation is hashed off the VERTEX POSITION, deliberately, and
        // not drawn from the shared sequence: this project's rule is that a
        // texture must not be able to move a bus stop, and the determinism
        // gates compare builds vertex for vertex. Same position, same colour,
        // every build, forever.
        //
        // Two bands, because one is a regular grid you can see: a broad one
        // for patchiness at ~40m and a fine one at ~7m for break-up.
        // Shade + leaf litter under a canopy. Browner than the greens above on
        // purpose: a forest floor is not dark grass, it is dead leaves.
        // These are LINEAR values, and that is the whole reason the first two
        // attempts at a forest floor looked like a lawn. Vertex colours are not
        // gamma-encoded: a component of 0.26 leaves the renderer at about 0.55
        // in sRGB, so "dark brown" written as 0.26 arrives on screen as mid
        // sage. Deep shade under a closed tropical canopy is roughly 0.30 sRGB,
        // which is 0.075 linear — a quarter of what reads as dark on paper.
        const LITTER = [0.098, 0.090, 0.058];
        // classes a canopy is allowed to darken. Everything paved, plus sand
        // and water surfaces, is excluded — see the note at the call site.
        const CANOPYABLE = new Set(['wood', 'scrub', 'grass', 'park', 'golf']);
        const hash2 = (a, b) => {
          const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
          return n - Math.floor(n);
        };
        const smoothNoise = (x, z, scale) => {
          const fx = x / scale, fz = z / scale;
          const ix = Math.floor(fx), iz = Math.floor(fz);
          let tx = fx - ix, tz = fz - iz;
          tx = tx * tx * (3 - 2 * tx); tz = tz * tz * (3 - 2 * tz);
          const a = hash2(ix, iz), b = hash2(ix + 1, iz);
          const c = hash2(ix, iz + 1), d2 = hash2(ix + 1, iz + 1);
          return (a + (b - a) * tx) * (1 - tz) + (c + (d2 - c) * tx) * tz;
        };
        // how much a class is allowed to vary. Paving barely moves; vegetation
        // moves a lot, because it genuinely does.
        const VARY = {
          wood: 0.115, scrub: 0.10, grass: 0.085, park: 0.085, golf: 0.05,
          sand: 0.055, pitch: 0.05, track: 0.02, pool: 0.012,
          resi: 0.022, comm: 0.02, civic: 0.02, indus: 0.028, works: 0.03,
          parking: 0.025, plaza: 0.018,
        };
        const varied = (c, x, z, amt, vy) => {
          const n = smoothNoise(x, z, 41) * 0.65 + smoothNoise(x, z, 7.3) * 0.35;
          let f = 1 + (n - 0.5) * 2 * amt;
          // STEEP GROUND SHOWS ITS BONES. A slope holds less soil and less
          // planting, so it reads browner and darker — which is also what
          // makes Imbiah and Serapong read as hills rather than green domes.
          // slopeAlong is the method this class actually has (slopeAt was a
          // name I assumed and it does not exist); the steepest gradient is
          // the larger of the two axis slopes, which is close enough here and
          // costs two heightfield reads instead of a gradient solve.
          const sl = Math.max(Math.abs(this.slopeAlong(x, z, 1, 0, 6)),
                              Math.abs(this.slopeAlong(x, z, 0, 1, 6)));
          const rock = Math.min(0.5, Math.max(0, (sl - 0.22) * 1.5));
          const out = [c[0] * f, c[1] * f, c[2] * f];
          if (rock > 0) {
            out[0] = out[0] * (1 - rock) + 0.52 * rock;
            out[1] = out[1] * (1 - rock) + 0.46 * rock;
            out[2] = out[2] * (1 - rock) + 0.38 * rock;
          }
          return out;
        };
        const LANDUSE = new Set(['resi', 'comm', 'civic', 'indus', 'works']);
        const vid = (qx, qz) => {
          const k = qx + ',' + qz;
          let id = verts.get(k);
          if (id === undefined) {
            id = pos.length / 3;
            const x = g.x0 + (qx / 24) * g.cell, z = g.z0 + (qz / 24) * g.cell;
            const vy = this.vertexY(x, z);
            pos.push(x, vy, z);
            let t = this.gGrid ? TINT[this.greenAt(x, z)] : null;
            // A LANDUSE PARCEL ON A RESORT ISLAND IS GROUNDS, NOT CONCRETE.
            //
            // The paved tints are right in the CBD, where a `comm` polygon is
            // a block of buildings and apron. On Sentosa they are badly wrong:
            // the parcel behind Palawan is a SINGLE `comm` polygon of 57,255
            // m2 and it was painted 0.90,0.89,0.86 — five and a half hectares
            // of near-white, which from the ground reads as an airport apron
            // with palm trees on it. That one polygon is most of why the
            // middle of the island looked empty.
            //
            // Landuse says who OWNS the ground, not what is on it. What is
            // actually on a resort parcel is lawn, planting and driveway, and
            // the driveways and buildings are drawn on top of this anyway. So
            // on a district whose own measured green fraction says it is a
            // green place, these blend most of the way to vegetation.
            if (t && this.greenFrac > 0.35 && LANDUSE.has(this.greenAt(x, z))) {
              const G = [0.60, 0.69, 0.51];
              t = [t[0] * 0.32 + G[0] * 0.68,
                   t[1] * 0.32 + G[1] * 0.68,
                   t[2] * 0.32 + G[2] * 0.68];
            }
            // Untinted ground used to push (1,1,1) — the material colour
            // straight through, which made UNCLASSIFIED ground the brightest
            // surface in the world. It is the one thing we know least about, so
            // it should be the quietest. A faint grey-green knocks it back
            // behind the paved tints and reads as the scrubby concrete-and-
            // grass mix that unmapped ground in this city actually is.
            // WET SAND IS ITS OWN COLOUR. The waterline band in every
            // reference frame is distinctly darker and warmer than the dry
            // beach above it, and that band is most of what says "tide" at a
            // glance. Keyed to height above sea within mapped sand, gated on
            // coastal distance like the shoreline blend below, so an inland
            // sand pit (a bunker is `sand` too) stays dry.
            if (t && this.greenAt(x, z) === 'sand') {
              const sdw = this.seaDistAt ? this.seaDistAt(x, z) : Infinity;
              if (sdw < 70 && vy < 1.1) {
                const w = Math.max(0, 1 - Math.max(0, vy) / 1.1) * 0.85;
                t = [t[0] + (0.72 - t[0]) * w,
                     t[1] + (0.63 - t[1]) * w,
                     t[2] + (0.48 - t[2]) * w];
              }
              // ...AND THE BACK-BEACH IS PLANTED. OSM's beach polygons on
              // Sentosa run far inland of the sand a visitor sees — Siloso's
              // reaches 100m+ up the slope, and painting all of it sand is
              // most of why the strip read as a pale apron (spec item 3).
              // The open sand in every reference is a ~40m band at the water;
              // behind that it is lawn, planting beds and palms. Blend with
              // distance from the sea, so the mapped extent stays and only
              // the READ changes.
              if (sdw > 45) {
                const f = Math.min(1, (sdw - 45) / 40) * 0.8;
                t = [t[0] + (0.50 - t[0]) * f,
                     t[1] + (0.60 - t[1]) * f,
                     t[2] + (0.42 - t[2]) * f];
              }
            }
            if (t) {
              const k = this.greenAt(x, z);
              const v = varied(t, x, z, VARY[k] !== undefined ? VARY[k] : 0.05, vy);
              col.push(v[0], v[1], v[2]);
            }
            else {
              // THE SHORELINE PAINTS ITSELF (2026-08-03). Untinted low ground
              // near open sea IS beach — that is what a shoreline is — so it
              // blends toward sand by ELEVATION: full sand at the waterline,
              // fading out by +2.4m. Gated on coastal distance (seaDist, a
              // grid BFS from below-sea cells) so a low inland plaza stays
              // concrete, and only where the district HAS open sea at all.
              const sd = this.seaDistAt ? this.seaDistAt(x, z) : Infinity;
              // ONLY LAND GETS A BEACH. The blend's own test was `vy > -0.5`,
              // written when seaDistAt was broken and the branch never ran; the
              // moment it started working, every SEA cell qualified — they are
              // low by definition and zero metres from the sea by definition —
              // and the harbour by the Gateway bridge, which is the first thing
              // a player sees driving onto the island, came out as pale sand
              // bands laid over the water. A shoreline is the LAND at the
              // water's edge, so the floor is the sea clamp, not below it.
              if (sd < 80 && vy > 0.06 && vy < 2.4) {
                const f = Math.max(0, 1 - Math.max(0, vy) / 2.4) * Math.max(0, 1 - sd / 80);
                // endpoint matches the cream TINT.sand above, or the painted
                // shoreline and the mapped beach beside it disagree by a hue
                col.push(0.84 + (0.91 - 0.84) * f, 0.87 + (0.86 - 0.87) * f, 0.80 + (0.70 - 0.80) * f);
              } else if (this.greenFrac > 0.35) {
                // ON A GREEN ISLAND, UNKNOWN GROUND IS VEGETATION.
                //
                // The pale grey-green below is the right answer in the CBD,
                // where unmapped ground genuinely is apron and kerb. It is the
                // wrong answer on Sentosa, and satellite imagery of the island
                // makes that plain: between the built pockets it is continuous
                // dark canopy, with almost no bare pale ground anywhere. Ours
                // was painting every unclassified cell pale khaki, which is
                // most of why the island read as an empty car park with trees
                // on it — the owner, repeatedly, and he was right.
                //
                // Keyed on the district's OWN measured green fraction rather
                // than on its name, so it follows the data: a district that is
                // more than a third mapped-green treats the gaps as green too.
                // ...AND VEGETATION IS NOT A FAIRWAY. Measured off the drawn
                // vertices: this fallback, not any mapped class, is what most
                // of Imbiah's slopes actually render as, and at 0.58,0.68,0.50
                // it leaves the renderer near 0.79,0.85,0.74 in sRGB — lighter
                // than the mapped `wood` beside it and reading as mown grass.
                // The island looked like a golf course with jungle at the edges
                // because, in the places you walk, it was one.
                const v = varied([0.40, 0.50, 0.33], x, z, 0.10, vy);
                col.push(v[0], v[1], v[2]);
              } else {
                const v = varied([0.84, 0.87, 0.80], x, z, 0.03, vy);
                col.push(v[0], v[1], v[2]);
              }
            }
            // UNDER A CLOSED CANOPY THE FLOOR IS DARK AND BROWN.
            //
            // Applied here, after every branch, because it is true whichever
            // colour the ground started from. Vegetation and unclassified
            // ground ONLY: street trees line half the roads on this island and
            // shading by tree count alone turned pavements, plazas and the
            // beach itself into mud.
            // DEFERRED, AND HERE IS WHY (2026-08-05). The darkening below is
            // applied at BUILD time, and the ground mesh is built BEFORE
            // plantSurveyed runs — so `canopyAt` can only ever see the trees
            // that exist yet, which is `data.trees`, the SURVEYED ones.
            // city.js then invents about 6,600 more (the wood-edge halo and the
            // unmapped-slope fill) and the floor never hears about them. At
            // Imbiah, where the slopes are unmapped and almost every tree IS the
            // fill, canopyAt read ~0 and a closed jungle floor was painted
            // lawn-green. The owner saw it; so did every render.
            //
            // So the class is REMEMBERED here (one byte a vertex) and the shade
            // is applied by applyCanopy() after the planting, when the canopy
            // grid is complete. Storing the class rather than re-asking greenAt
            // matters: greenAt walks candidate rings and is already the
            // expensive call in this loop; asking it twice would put seconds on
            // the boot.
            const cls = this.gGrid ? this.greenAt(x, z) : null;
            clsOf.push(cls === 'wood' ? 2 : cls === 'scrub' ? 1
              : (!cls || CANOPYABLE.has(cls)) ? 0 : 255);
            if (false) {
              // THE CANOPY IS THE WOOD POLYGON, NOT THE SURVEYED TREES.
              //
              // First attempt counted `data.trees` — 3,713 of them, one per
              // ~2,150 m2 of island — and shaded almost nothing, because that
              // list is only the individually-surveyed trees. The jungle a
              // player actually walks under is GENERATED, planted by city.js
              // on an 11m grid inside every k='wood' polygon. So the honest
              // canopy test is the one the planting itself uses: is this ground
              // inside a wood?
              //
              // The surveyed trees still contribute, at a fraction, so a lone
              // clump of specimen trees outside a mapped wood still casts a
              // little floor shade instead of none.
              const cn = Math.min(1,
                (cls === 'wood' ? 1 : cls === 'scrub' ? 0.45 : 0)
                + this.canopyAt(x, z) * 0.5);
              if (cn > 0.02) {
                const i0 = col.length - 3;
                const f = cn * 0.62;              // never all the way to black
                for (let ci = 0; ci < 3; ci++) {
                  col[i0 + ci] = col[i0 + ci] * (1 - f) + LITTER[ci] * f;
                }
              }
            }
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
        // kept so applyCanopy() can shade this tile once the forest exists
        this.tiles.push({ geo, cls: Uint8Array.from(clsOf) });
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
    // THE APRON CONTINUES THE EDGE OF THE MAP, NOT THE MIDDLE OF THE ARRAY.
    //
    // This took its height from `g.h[floor(h.length/2)]` — one arbitrary cell,
    // the middle of a flat array, which on an island is somewhere inland. On
    // Sentosa that cell is 3.9m, so a FOUR KILOMETRE plane sat at 3.5m across
    // the entire world INCLUDING the harbour, floating three and a half metres
    // above the sea and hiding it. Ridden, it is the first thing you see coming
    // over the Sentosa Gateway: the water replaced by a grey shelf to the
    // horizon. The project notes had this parked as "grey shelf from sky view,
    // riders never see it" — riders do see it, from the island's front door.
    //
    // What is beyond the edge of the map is whatever the edge is, so take the
    // MEDIAN OF THE BORDER CELLS. Sentosa's border is open water, so the apron
    // drops to sea level and the sea sheet covers it; an inland district's
    // border is ground, so it still continues the ground.
    const border = [];
    for (let i = 0; i < g.nx; i++) {
      border.push(g.h[i], g.h[(g.nz - 1) * g.nx + i]);
    }
    for (let j = 0; j < g.nz; j++) {
      border.push(g.h[j * g.nx], g.h[j * g.nx + g.nx - 1]);
    }
    border.sort((a, b) => a - b);
    const edge = border[Math.floor(border.length / 2)];
    m.position.set(g.x0 + (g.nx * g.cell) / 2, edge - 0.4, g.z0 + (g.nz * g.cell) / 2);
    m.receiveShadow = true;
    return m;
  }
}
