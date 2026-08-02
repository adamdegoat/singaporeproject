// Ground-floor shopfronts.
//
// Two things were wrong with what this replaces, and neither was visible from
// any single frame:
//
// 1. A sign was drawn at the tenant's own map coordinate, nudged 1.2m toward
//    the nearest road. A mall tenant's node sits in the middle of the mall, so
//    1,505 of the 1,642 signs were built INSIDE the masonry — median 9.2m past
//    the facade, worst case 66.6m. The street read blank while the count read
//    1,642 placed.
// 2. OSM tags `level` on 1,043 of the 1,718 named tenants and the scene file
//    was throwing it away, so a shop in the second basement of Ngee Ann City
//    got a board on the street facade six metres up. 253 of them are below the
//    street and 376 above it.
//
// So a tenant is drawn where its shop actually meets the street, or it is not
// drawn at all. It qualifies for a street bay when it is on the ground floor
// AND its node is either its own small building or within 8m of its host's
// facade. A node 30m inside a mall is in the atrium: there is no street
// frontage for it, and inventing one is inventing a shop.
//
// The rest of the ground floor is not left blank either. Every facade that
// faces a street this world actually builds gets glazed bays — a lit panel, a
// glass plane 34cm proud of it with real reveals so it reads as depth rather
// than as a printed band, a stall riser, mullions and a fascia. Tenants take
// the bay their node projects onto; the others are generic glazing.
//
// Text only, neutral typeface, no brand marks: this labels a place the way a
// map labels it.
import * as THREE from '../lib/three.module.js';
import { Merger, onCarriageway, groundAt, streetY } from './city.js';
import { SignAtlas } from './tex.js';
import { hasShopfront } from './landmarks.js';
import { TOUCH as SHOP_TOUCH } from './input.js';

/* ---------------- what a kind of shop looks like ---------------- */
// Colour and light only. A bakery is warm and bright, a bank is cool and even,
// a watch shop is dark with its cases picked out. Skipping this is what makes a
// row of six shops read as one length of wallpaper.
const WARM = 0xffcf9a, COOL = 0xe4eef6, BRIGHT = 0xfff4de, DIM = 0xd6c0a0;
const KIND = {
  restaurant:    { sign: '#8f3226', light: WARM,   lit: 0.62, awning: true },
  cafe:          { sign: '#6d4a2c', light: WARM,   lit: 0.58, awning: true },
  fast_food:     { sign: '#c2452c', light: BRIGHT, lit: 0.78, awning: true },
  bakery:        { sign: '#a86a2a', light: WARM,   lit: 0.72, awning: true },
  pastry:        { sign: '#a86a2a', light: WARM,   lit: 0.72, awning: true },
  confectionery: { sign: '#a8563a', light: WARM,   lit: 0.68, awning: true },
  ice_cream:     { sign: '#b8506a', light: BRIGHT, lit: 0.72, awning: true },
  bar:           { sign: '#4a2f3a', light: WARM,   lit: 0.40 },
  pub:           { sign: '#4a2f3a', light: WARM,   lit: 0.40 },
  bank:          { sign: '#1f4f7a', light: COOL,   lit: 0.52 },
  pharmacy:      { sign: '#2f6b4f', light: COOL,   lit: 0.70 },
  convenience:   { sign: '#c04a2a', light: BRIGHT, lit: 0.82 },
  supermarket:   { sign: '#2f6b4f', light: BRIGHT, lit: 0.80 },
  clothes:       { sign: '#2b2f33', light: BRIGHT, lit: 0.62 },
  shoes:         { sign: '#2b2f33', light: BRIGHT, lit: 0.60 },
  bag:           { sign: '#3a2f2a', light: BRIGHT, lit: 0.58 },
  jewelry:       { sign: '#3a2c1e', light: DIM,    lit: 0.46 },
  watches:       { sign: '#28211a', light: DIM,    lit: 0.46 },
  optician:      { sign: '#2b4f6b', light: COOL,   lit: 0.66 },
  cosmetics:     { sign: '#a8325f', light: BRIGHT, lit: 0.72 },
  beauty:        { sign: '#93386a', light: BRIGHT, lit: 0.66 },
  hairdresser:   { sign: '#5a3a5a', light: WARM,   lit: 0.54 },
  massage:       { sign: '#4a5a3a', light: WARM,   lit: 0.44 },
  electronics:   { sign: '#2b3f6b', light: COOL,   lit: 0.70 },
  mobile_phone:  { sign: '#2b3f6b', light: COOL,   lit: 0.72 },
  hifi:          { sign: '#2b3138', light: DIM,    lit: 0.52 },
  books:         { sign: '#6b3a2a', light: WARM,   lit: 0.56 },
  stationery:    { sign: '#6b3a2a', light: BRIGHT, lit: 0.60 },
  variety_store: { sign: '#c26a1e', light: BRIGHT, lit: 0.74 },
  mall:          { sign: '#2b2f33', light: BRIGHT, lit: 0.66 },
  department_store: { sign: '#2b2f33', light: BRIGHT, lit: 0.68 },
};
const KIND_DEFAULT = { sign: '#33383d', light: BRIGHT, lit: 0.60 };
function styleOf(k) { return KIND[k] || KIND_DEFAULT; }

/* ---------------- geometry profiles ---------------- */
// Heights are measured from the PAVEMENT IN FRONT OF EACH BAY — see the note in
// emitBay. They were measured from the building's footing first, to match the
// ground-floor band, and that buried Plaza Singapura's shopfronts 1.5m under
// the pavement: its footprint spans fourteen metres of grade and the footing
// takes the lowest ground under all of it.
//
// GROUND is the 0.9m a footing is sunk by, used only as a floor on how far a
// bay may sit below its building.
const GROUND = 0.9;
// big: the band is 5.4m tall with its awning trim at 5.3 above the footing, so
// on level ground nothing here reaches past 4.4.
const BIG = { riser: 0.52, head: 3.86, fascia: 3.94, fasciaH: 0.44, depth: 0.34 };
// shophouse: the ground floor is 4.2m from the footing with its trim at 3.86,
// so the whole shopfront has 2.96m to live in. A five-foot-way is that tight.
const SHOP = { riser: 0.42, head: 2.52, fascia: 2.58, fasciaH: 0.34, depth: 0.26 };

const BAY_PITCH = 5.6;      // nominal shop width; a run divides evenly into it
const BAY_MIN = 3.4;
const RUN_MIN = 4.2;        // a facade shorter than this is a return, not a frontage
const ROAD_NEAR = 11;       // how close a facade must be to a street to be a frontage
const TENANT_REACH = 8;     // how far inside its host a tenant may be and still front the street
const SMALL_UNIT = 600;     // a footprint under this IS one shop, wherever its node sits

function centroidOf(pts) {
  let x = 0, z = 0;
  for (const p of pts) { x += p[0]; z += p[1]; }
  return [x / pts.length, z / pts.length];
}

// Distance from the centroid to an edge's LINE. `grow(pts, f)` scales the
// footprint about its centroid, so that edge moves outward by exactly (f-1)
// times this — which is where the drawn ground-floor band actually is, and so
// where the glass has to sit. A fixed offset guessed instead puts the glass
// inside the wall of a mall and floating off a kiosk.
function perpFromCentroid(c, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1];
  const L = Math.hypot(vx, vz) || 1;
  return Math.abs((c[0] - a[0]) * (vz / L) - (c[1] - a[1]) * (vx / L));
}

function hashAt(x, z, salt = 0) {
  let h = (salt * 374761393) | 0;
  h = (h + Math.round(x * 13.7) * 668265263) | 0;
  h ^= h >>> 13;
  h = (h + Math.round(z * 13.7) * 2246822519) | 0;
  h ^= h >>> 16;
  return Math.abs(h | 0);
}

function pointIn(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

function distToRing(x, z, poly) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz;
    let t = L2 < 1e-9 ? 0 : ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t));
    if (d < best) best = d;
  }
  return best;
}

/* ---------------- the street network that actually exists ---------------- */
// A bay goes on a facade that faces a street this world BUILDS, not any way in
// the extract. Same rule the kerbs, trees and markings use: the axes, plus
// named non-footway streets over 45m within reach of one. Everything else is a
// service lane behind a block whose back nobody will ever see — and glazing all
// of it would be 15,000 bays instead of 4,000.
class StreetGrid {
  constructor(data, axes, reach = DRESS_REACH) {
    this.reach = reach;
    this.CELL = 40;
    this.g = new Map();
    this.streets = 0;
    const add = (a, b, w) => {
      const minx = Math.min(a[0], b[0]) - 26, maxx = Math.max(a[0], b[0]) + 26;
      const minz = Math.min(a[1], b[1]) - 26, maxz = Math.max(a[1], b[1]) + 26;
      for (let cx = Math.floor(minx / this.CELL); cx <= Math.floor(maxx / this.CELL); cx++)
        for (let cz = Math.floor(minz / this.CELL); cz <= Math.floor(maxz / this.CELL); cz++) {
          const k = cx + ',' + cz;
          if (!this.g.has(k)) this.g.set(k, []);
          this.g.get(k).push([a, b, w]);
        }
    };
    const nearAxis = (x, z) => {
      for (const ax of axes) {
        const A = ax.p;
        for (let i = 0; i < A.length - 1; i++) {
          const [x1, z1] = A[i], [x2, z2] = A[i + 1];
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
          // DRESS_REACH, not a private copy of it — this held a literal 230
          // while the dressing moved to 1200, and the comment above the class
          // kept claiming they were the same rule. See the note at the export.
          if (dx * dx + dz * dz < this.reach * this.reach) return true;
        }
      }
      return false;
    };
    for (const ax of axes) {
      for (let i = 0; i < ax.p.length - 1; i++) add(ax.p[i], ax.p[i + 1], ax.w);
    }
    // Length per STREET NAME, not per way: OSM splits Orchard Boulevard into 21
    // fragments and not one of them is 45m long.
    const byName = new Map();
    for (const r of data.roads || []) {
      if (!r.n) continue;
      // Footways are the pavement beside a road and would make every wall in
      // the district a frontage. A named PEDESTRIAN way is the opposite: it is
      // a street you walk down, and Bugis Street, Albert Street, Cuppage Road
      // and Emerald Hill are exactly the rows of shophouses this is for.
      // Leaving them out left 251 tenants with nowhere to be.
      if (r.k === 'footway') continue;
      let len = 0;
      for (let i = 0; i < r.p.length - 1; i++) {
        len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
      }
      const e = byName.get(r.n) || { len: 0, ways: [] };
      e.len += len; e.ways.push(r);
      byName.set(r.n, e);
    }
    for (const [, e] of byName) {
      if (e.len < 45) continue;
      for (const r of e.ways) {
        if (!r.p.some((q) => nearAxis(q[0], q[1]))) continue;
        this.streets++;
        for (let i = 0; i < r.p.length - 1; i++) add(r.p[i], r.p[i + 1], r.w || 10);
      }
    }
  }

  // distance to the nearest kerb line; negative inside a carriageway
  dist(x, z) {
    let best = Infinity;
    const cx = Math.floor(x / this.CELL), cz = Math.floor(z / this.CELL);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const list = this.g.get((cx + i) + ',' + (cz + j));
      if (!list) continue;
      for (const [a, b, w] of list) {
        const vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz;
        let t = L2 < 1e-9 ? 0 : ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const d = Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)) - w / 2;
        if (d < best) best = d;
      }
    }
    return best;
  }
}

/* ---------------- building lookup ---------------- */
class BuildingIndex {
  constructor(buildings) {
    this.CELL = 60;
    this.g = new Map();
    this.bb = new Map();
    for (const b of buildings) {
      let mnx = Infinity, mnz = Infinity, mxx = -Infinity, mxz = -Infinity;
      for (const [x, z] of b.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      this.bb.set(b, [mnx, mnz, mxx, mxz]);
      for (let cx = Math.floor(mnx / this.CELL); cx <= Math.floor(mxx / this.CELL); cx++)
        for (let cz = Math.floor(mnz / this.CELL); cz <= Math.floor(mxz / this.CELL); cz++) {
          const k = cx + ',' + cz;
          if (!this.g.has(k)) this.g.set(k, []);
          this.g.get(k).push(b);
        }
    }
  }

  near(x, z) {
    return this.g.get(Math.floor(x / this.CELL) + ',' + Math.floor(z / this.CELL)) || [];
  }

  at(x, z) {
    for (const b of this.near(x, z)) {
      const [mnx, mnz, mxx, mxz] = this.bb.get(b);
      if (x < mnx - 1 || x > mxx + 1 || z < mnz - 1 || z > mxz + 1) continue;
      if (pointIn(x, z, b.p)) return b;
    }
    return null;
  }

  // nearest footprint whose edge is within `reach`; for the tenants whose node
  // sits just outside the wall it was surveyed against
  nearest(x, z, reach) {
    let best = null, bd = reach;
    for (const b of this.near(x, z)) {
      const d = distToRing(x, z, b.p);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }

  // The building this one sits inside, if any.
  //
  // OSM maps a named shop that occupies a unit as its own way, and that way is
  // often drawn INSIDE the block that contains it — so is a building:part, and
  // so is a food court inside a hawker centre. The unit's own facade then has
  // another building 2.5m off every side of it and it fronts nothing. 162
  // tenants were dropped for exactly this: they do have a frontage, it belongs
  // to the block they are a unit of.
  enclosing(b) {
    const c = centroidOf(b.p);
    let best = null;
    for (const o of this.near(c[0], c[1])) {
      if (o === b || o.a <= b.a) continue;
      if (!pointIn(c[0], c[1], o.p)) continue;
      if (!best || o.a < best.a) best = o;
    }
    return best;
  }
}

/* ---------------- the build ---------------- */
// ASYNC for the same reason dressSideStreets is: one uninterrupted pass over
// every building that fronts a street, and the worst single freeze left in a
// district build once the side streets were broken up. Y is optional.
export async function buildShopfronts(world, data, axes, wallAt, neighbours, Y = null) {
  const stats = {
    shopRuns: 0, bays: 0, realShops: 0, glazedFrontage: 0, shopAwnings: 0,
    // why a tenant got nothing, split out rather than pooled, because "382 have
    // no frontage" hides whether the rule is right or the rule is too tight
    shopsUpstairs: 0,      // OSM says a floor that is not the street
    shopsInside: 0,        // in the atrium of a big footprint, not on the wall
    shopsNoHost: 0,        // no footprint under or within 8m of the node
    shopsBackBlock: 0,     // host fronts no street this world builds
    shopsFarFromRun: 0,    // host has frontage, but not near this tenant
    shopsNoBay: 0,         // frontage full: every bay already claimed
    baysOnPodium: 0,       // moved out to the drawn face because the footprint was inside it
  };
  if (!data.buildings || !data.buildings.length) return stats;

  const atlas = new SignAtlas(THREE);
  const merger = new Merger();
  // `?shopreach=` A/Bs the shop grid alone; `?reach=` moves dressing AND shops
  // together, which is the shipped relationship.
  //
  // STILL 230, DELIBERATELY, WITH THE FULL-REACH WORK BANKED — measured
  // 2026-08-03 and PARKED, not forgotten:
  //  - at DRESS_REACH the world gains real tenants everywhere (+284 drawn in
  //    chinatown, 376 -> 660; +8 in robertson; the whole Siloso strip),
  //  - but the ELIGIBLE pool grows faster than the placed count, because a
  //    tenant whose street is finally admitted still fails at bay generation
  //    on small terrace hosts (robertson's 11 restaurants on 149m2 units all
  //    land in shopsNoBay), so S8's ratio FALLS while the absolute number
  //    rises: robertson 67 -> 64, littleindia 71 -> 70, harbourfront 39.
  //    Five ratchet floors would need lowering to ship it, which is the
  //    wrong side of "teach the check, do not loosen".
  //  - phones must ALSO keep 230 regardless: full reach costs chinatown
  //    +21.6MB of bay geometry (92.9 -> 114.5MB) against the ~206MB ceiling
  //    the rider's iPhone measurably survives.
  // THE NEXT STEP IS THE noBay FIX, not the floors: make bays buildable on
  // short terrace-unit frontages, re-measure, and the ratios clear their
  // floors with room to spare. `?shopreach=1200` A/Bs it live any time.
  const _q = new URLSearchParams(location.search);
  const streets = new StreetGrid(data, axes || [],
    +_q.get('shopreach') || +_q.get('reach') || 230);
  // THE INDEX MUST SEE THE NEIGHBOURS, EVEN THE ONES IN ANOTHER CHUNK.
  //
  // A bay is only built where the pavement in front of it is not another
  // building, and that question was asked of `data.buildings` — which, for a
  // streamed district, is that district's buildings and nothing else. The
  // dedup partition splits adjacent buildings across chunks by design:
  // "Bugis Junction" belongs to brasbasah and "Bugis Junction Tower" to bugis,
  // so the tower's bays were sited facing into a mall the index could not see
  // and S6 caught twelve of them inside a building. This is the seam lesson
  // the region already learned for ROADS ("a chunk build that could not see a
  // neighbour's roads laid kerbs in Waterloo Close at the seam") — the same
  // union was simply never handed to the shopfront pass.
  //
  // Hosts still come from `data`, so a chunk builds only its OWN frontages;
  // only the "is something already there" question widens.
  const index = new BuildingIndex((neighbours || data).buildings);

  // The walled-bay ray pass below runs BEFORE the first render, and a
  // positioned recipe mesh has a stale identity matrixWorld until someone
  // updates it — the raycaster read Newport Tower's setback at the origin
  // and every build-time ray sailed through where the wall would be
  // (measured 2026-08-03: 4 kills at draw, the 4 real ones untouched, and
  // the same ray AFTER a render hits at 0.3m). One update, once per pass.
  //
  // AND THE RAYS GET A SPATIAL GRID, NOT THE SCENE. intersectObjects on the
  // scene root traverses every mesh per ray; per district that is seconds,
  // but behaviour.mjs builds the WHOLE WORLD inline and its 20,000 bays
  // against 40,000 meshes hung the gate for half an hour, twice. Meshes are
  // bucketed once by bounding-sphere centre into 24m cells; each ray then
  // tests the few dozen nearby.
  let rayGrid = null;
  const buildRayGrid = () => {
    if (SHOP_TOUCH || typeof window === 'undefined' || !window.__scene) return;
    window.__scene.updateMatrixWorld(true);
    rayGrid = new Map();
    const _c3 = new THREE.Vector3();
    window.__scene.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || !o.visible || !o.geometry) return;
      if (o.material && o.material.transparent) return;
      const g2 = o.geometry;
      if (!g2.boundingSphere) g2.computeBoundingSphere();
      if (!g2.boundingSphere) return;
      _c3.copy(g2.boundingSphere.center).applyMatrix4(o.matrixWorld);
      const rad = g2.boundingSphere.radius;
      const span = Math.ceil(rad / 24);
      const cx = Math.floor(_c3.x / 24), cz = Math.floor(_c3.z / 24);
      // big merged meshes land in every cell their sphere covers, capped so a
      // district-wide mesh does not flood the grid
      const s2 = Math.min(span, 8);
      for (let i = -s2; i <= s2; i++) for (let j = -s2; j <= s2; j++) {
        const k = (cx + i) + ',' + (cz + j);
        if (!rayGrid.has(k)) rayGrid.set(k, []);
        rayGrid.get(k).push(o);
      }
    });
  };
  buildRayGrid();
  const rayCandidates = (x, z) => {
    if (!rayGrid) return null;
    const cx = Math.floor(x / 24), cz = Math.floor(z / 24);
    const out = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const c = rayGrid.get((cx + i) + ',' + (cz + j));
      if (c) out.push(...c);
    }
    return out;
  };

  window.__shopBays = [];
  // Front faces only for the two planes that cover the most screen. Glass and
  // the lit panel behind it are only ever seen from the street, and a
  // transparent material already costs blending and a lost early-z; paying
  // twice for a back face nothing can stand behind is the kind of fill-rate
  // waste that took four frames off the trees.
  // Opacity 0.26, not 0.38. buildEnvironment gives anything under roughness
  // 0.45 the sky cube map at nearly full intensity, so at 0.38 the reflection
  // and the pale tint together turned every window into a flat lightbox: the
  // lit interior behind it may as well not have been drawn.
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7f929c, roughness: 0.10, metalness: 0.30,
    transparent: true, opacity: 0.26,
  });
  const revealMat = new THREE.MeshStandardMaterial({
    color: 0x282420, roughness: 0.88, side: THREE.DoubleSide,
  });
  const riserMat = new THREE.MeshStandardMaterial({ color: 0x585049, roughness: 0.9 });
  // Mid tones, not the near-black of the reveals. Anything this dark inside a
  // lit window reads as a hole rather than as a thing standing in a shop.
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x4d463d, roughness: 0.9 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x66707a, roughness: 0.45, metalness: 0.25 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.55, metalness: 0.4 });
  const fasciaMat = new THREE.MeshStandardMaterial({ color: 0x2e2c2a, roughness: 0.7 });
  const awningMat = new THREE.MeshStandardMaterial({ color: 0x8a3a2e, roughness: 0.85, side: THREE.DoubleSide });
  // one material per (colour, brightness) pair actually used; consolidate.js
  // then dedupes anything identical across the district
  const interiorCache = new Map();
  const interior = (col, lit) => {
    const k = col + '|' + lit.toFixed(2);
    if (!interiorCache.has(k)) {
      interiorCache.set(k, new THREE.MeshStandardMaterial({
        color: 0x16130f, roughness: 0.85, emissive: col, emissiveIntensity: lit,
      }));
    }
    return interiorCache.get(k);
  };

  /* --- 1. every facade run that faces a street --- */
  const runsOf = new Map();
  // how close the closest facade of each building got, so a tenant that was
  // dropped can say whether its building is genuinely on a back lane or the
  // frontage test is simply too tight
  const nearestStreet = new Map();
  let _st = performance.now();
  for (const b of data.buildings) {
    if (Y && performance.now() - _st > 6) { await Y(); _st = performance.now(); }
    if (!b.p || b.p.length < 3) continue;
    // the same test buildBuildings uses to send a footprint to the shophouse
    // recipe, because the two have completely different ground floors
    // A cathedral does not have shop windows, and neither does the National
    // Museum, the National Gallery, CHIJMES or St Andrew's. landmarks.js has
    // kept a NO_SHOPFRONT set for this since the civic district was built and
    // the bay builder was not asking it: 77 bays of retail glazing went onto
    // museums and churches. Ask the one list rather than keeping a second.
    if (!hasShopfront(b.n)) continue;
    const isShophouse = !b.k && b.a < 520 && b.h <= 20 && b.p.length <= 64;
    const prof = isShophouse ? SHOP : BIG;
    // addShopfront's own test for whether a ground-floor band was drawn
    const banded = !isShophouse && b.a > 600 && b.h > 7;
    const c = centroidOf(b.p);
    // The ground floor rides the STREET datum, the same one addShopfront's
    // band now uses. These bays sit IN that band — if they take a different
    // seat they float in front of it or sink behind it on every slope.
    const base = streetY(b) + GROUND;
    const runs = [];
    for (let i = 0; i < b.p.length; i++) {
      const a = b.p[i], d = b.p[(i + 1) % b.p.length];
      const vx = d[0] - a[0], vz = d[1] - a[1];
      const L = Math.hypot(vx, vz);
      if (L < RUN_MIN) continue;
      const ux = vx / L, uz = vz / L;
      const mx = (a[0] + d[0]) / 2, mz = (a[1] + d[1]) / 2;
      // Outward normal, decided by stepping off the edge and asking the
      // footprint which side it is on. Comparing against the CENTROID instead
      // is only right for a convex plan: an L, a U or a courtyard has edges
      // whose midpoint sits on the far side of its own centroid, and the
      // normal comes out pointing into the building. That put 162 tenants in
      // "fronts no street" — the test 2.5m "outside" the wall was landing
      // inside the shop it belonged to, and shophouse terraces are nothing but
      // this shape.
      let nx = -uz, nz = ux;
      if (pointIn(mx + nx * 0.6, mz + nz * 0.6, b.p)) { nx = -nx; nz = -nz; }
      // both sides inside means the edge is a spur across the interior
      if (pointIn(mx + nx * 0.6, mz + nz * 0.6, b.p)) continue;
      // Is this facade on a street? Test at three points along it, 2.5m out,
      // and require that the pavement in front is not another building.
      let facing = 0, blockedBy = 0;
      for (const t of [0.2, 0.5, 0.8]) {
        const px = a[0] + vx * t + nx * 2.5, pz = a[1] + vz * t + nz * 2.5;
        const other = index.at(px, pz);
        if (other && other !== b) { blockedBy++; continue; }
        // recorded even when it is Infinity, because "no street was found at
        // all" and "the nearest one is 14m away" are different answers and
        // pooling them as a missing value sent half an hour after a bug that
        // was not there
        const sd = streets.dist(px, pz);
        if (sd < (nearestStreet.get(b) ?? Infinity)) nearestStreet.set(b, sd);
        else if (!nearestStreet.has(b)) nearestStreet.set(b, sd);
        if (sd < ROAD_NEAR) facing++;
      }
      if (facing < 2) continue;
      // how far the drawn ground floor stands from the footprint line
      const perp = perpFromCentroid(c, a, d);
      const off = isShophouse ? -0.14 * perp : (banded ? 0.012 * perp : 0);
      runs.push({ b, a, ux, uz, nx, nz, L, off, prof, base, tenants: [] });
      stats.shopRuns++;
    }
    if (runs.length) runsOf.set(b, runs);
  }

  /* --- 2. which tenants have a street frontage at all --- */
  // Every tenant that gets nothing is recorded with the reason, because the
  // interesting number here is not how many were drawn but which ones were
  // dropped and whether dropping them was right.
  window.__shopSkips = [];
  const skip = (sh, why, host) => {
    stats[why]++;
    const sd = host ? nearestStreet.get(host) : undefined;
    window.__shopSkips.push({ n: sh.n, k: sh.k, lv: sh.lv, why,
      x: sh.p[0], z: sh.p[1], host: host ? (host.n || `(${Math.round(host.a)}m2)`) : '',
      host_a: host ? Math.round(host.a) : 0,
      sd: sd === undefined ? null : (Number.isFinite(sd) ? +sd.toFixed(1) : -1) });
  };
  for (const sh of data.shops || []) {
    const [sx, sz] = sh.p;
    // A floor that is not the street is not a street frontage. `lv` absent
    // means OSM does not say, and 630 of them do not: those are judged on
    // where the node sits, below.
    if (sh.lv !== undefined && sh.lv !== 0) { skip(sh, 'shopsUpstairs'); continue; }
    let host = index.at(sx, sz);
    // 12m, not 8: a node mapped on the five-foot-way of the shop it belongs to
    // is still that shop. Beyond that it is in a forecourt and there is nothing
    // honest to attach it to.
    if (!host) host = index.nearest(sx, sz, 12);
    if (!host) { skip(sh, 'shopsNoHost'); continue; }
    // A unit drawn as its own way inside a block has no frontage of its own;
    // the block it is part of has one. Step out to it before judging.
    let runs = runsOf.get(host);
    if (!runs) {
      const outer = index.enclosing(host);
      if (outer && runsOf.get(outer)) { host = outer; runs = runsOf.get(outer); }
    }
    // A tenant deep inside a big footprint is in the atrium, not on the street.
    // Its own small building is one unit however far in the node was dropped.
    if (host.a >= SMALL_UNIT && distToRing(sx, sz, host.p) > TENANT_REACH) {
      skip(sh, 'shopsInside', host); continue;
    }
    if (!runs) { skip(sh, 'shopsBackBlock', host); continue; }
    // the run its door would be on: nearest, measured to the run itself
    let best = null, bd = Infinity, bs = 0;
    for (const r of runs) {
      const rx = sx - r.a[0], rz = sz - r.a[1];
      let s = rx * r.ux + rz * r.uz;
      s = s < 0 ? 0 : s > r.L ? r.L : s;
      const px = r.a[0] + r.ux * s, pz = r.a[1] + r.uz * s;
      const d = Math.hypot(sx - px, sz - pz);
      if (d < bd) { bd = d; best = r; bs = s; }
    }
    if (!best || bd > 40) { skip(sh, 'shopsFarFromRun', host); continue; }
    best.tenants.push({ sh, s: bs });
  }

  // One wall, one set of bays.
  //
  // OSM maps a block and a building:part over each other often enough that two
  // footprints share a wall, and each of them then glazes it: two lots of glass
  // z-fighting, two fascias one behind the other, two names on the same shop.
  // Claimed on a 1.2m grid keyed by position AND facing, so a corner where two
  // frontages genuinely meet at right angles is not mistaken for a duplicate.
  const claimed = new Set();
  const claimKey = (x, z, nx, nz, dx = 0, dz = 0, da = 0) =>
    `${Math.round(x / 1.2) + dx},${Math.round(z / 1.2) + dz},`
    + `${Math.round(Math.atan2(nx, nz) / (Math.PI / 3)) + da}`;
  const deferredBays = [];
  // drawn bays on a 2m grid, for the duplicate-twin test in drawBay — the
  // claim grid alone lets two bays 1.39m apart straddle its 1.2m cells two
  // cells apart, outside the +/-1 window (both D25 pairs did exactly that).
  const drawnBayGrid = new Map();
  const drawnBayAdd = (x, z, nx, nz) => {
    const k = Math.floor(x / 2) + ',' + Math.floor(z / 2);
    if (!drawnBayGrid.has(k)) drawnBayGrid.set(k, []);
    drawnBayGrid.get(k).push([x, z, nx, nz]);
  };
  const drawnBayTwin = (x, z, nx, nz) => {
    const cx = Math.floor(x / 2), cz = Math.floor(z / 2);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      for (const [ox, oz, onx, onz] of drawnBayGrid.get((cx + i) + ',' + (cz + j)) || []) {
        if (Math.hypot(ox - x, oz - z) < 1.6 && (onx * nx + onz * nz) > 0.5) return true;
      }
    }
    return false;
  };
  // An OPPOSITE-facing bay standing 0.5-3.6m dead ahead makes this bay one
  // wall of a canyon two shopfronts wide and no street deep — the facing
  // glass was often podium-pushed off its own ring, so no ring test can see
  // it, and the merger holds its geometry as raw arrays until flush, so no
  // ray can either. The drawn-bay grid is the one witness that always knows.
  const facingBayAhead = (x, z, nx, nz) => {
    const px = x + nx * 2.0, pz = z + nz * 2.0;
    const cx = Math.floor(px / 2), cz = Math.floor(pz / 2);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      for (const [ox, oz, onx, onz] of drawnBayGrid.get((cx + i) + ',' + (cz + j)) || []) {
        if ((onx * nx + onz * nz) > -0.5) continue;
        const along = (ox - x) * nx + (oz - z) * nz;      // how far AHEAD it stands
        const across = Math.abs(-(ox - x) * nz + (oz - z) * nx);
        if (along > 0.5 && along < 3.6 && across < 3.0) return true;
      }
    }
    return false;
  };

  /* --- 3. bays --- */
  for (const runs of runsOf.values()) for (const r of runs) {
    let n = Math.max(1, Math.round(r.L / BAY_PITCH));
    if (r.L / n < BAY_MIN) n = Math.max(1, Math.floor(r.L / BAY_MIN));
    const bw = r.L / n;
    // WHICH BAYS CAN EXIST IS SETTLED BEFORE ANY TENANT IS GIVEN ONE.
    //
    // Tenants used to be assigned first and the bay built second, so a tenant
    // whose bay then failed a placement test — in a carriageway, solid all the
    // way out — vanished silently: out of the numerator, out of the
    // denominator, out of every skip bucket, and coverage fell without anything
    // saying why. Site the bays, then hand out the ones that are real.
    const site = new Array(n);
    for (let i = 0; i < n; i++) site[i] = siteBay(r, i, n, bw);
    const usable = [];
    for (let i = 0; i < n; i++) if (site[i]) usable.push(i);

    const claim = new Array(n).fill(null);
    r.tenants.sort((p, q) => p.s - q.s);
    for (const t of r.tenants) {
      if (!usable.length) { skip(t.sh, 'shopsNoBay'); continue; }
      // the usable bay nearest where the tenant's own door projects
      let best = -1, bd = Infinity;
      for (const i of usable) {
        if (claim[i]) continue;
        const d = Math.abs((i + 0.5) * bw - t.s);
        if (d < bd) { bd = d; best = i; }
      }
      if (best < 0) { skip(t.sh, 'shopsNoBay'); continue; }   // frontage full
      claim[best] = t.sh;
    }
    for (const i of usable) {
      if (claim[i]) { drawBay(r, i, n, bw, claim[i], site[i]); stats.bays++; }
      else deferredBays.push([r, i, n, bw, site[i]]);
    }
  }
  // UNTENANTED BAYS DRAW SECOND, in one pass after every tenant in the
  // district is on its wall. Two of the last defects on the board needed the
  // ordering: a duplicate-frontage twin (two overlapped footprints glazing
  // one wall) must lose to the tenant whichever run came first, and the
  // slot-canyon test below can only defer to bays that already exist.
  // FLUSH THE TENANTED FABRIC FIRST, so the untenanted pass's rays can see
  // it: the merger holds geometry as raw arrays until flush, which is why
  // six rounds of build-time tests could never see the shop fabric that
  // walls the last slot bays. The flush clears its buckets, so the final
  // flush below carries only this pass — the cost is a second set of merged
  // shop meshes per district, a handful of draw calls.
  merger.flush(world, { cast: false });
  buildRayGrid();
  for (const [r2, i2, n2, bw2, s2] of deferredBays) {
    drawBay(r2, i2, n2, bw2, null, s2);
    stats.bays++;
  }

  // Where this bay would stand, or null if it cannot. Every placement test
  // lives here and NOTHING is drawn, so the answer can be had before a tenant
  // is committed to it.
  function siteBay(r, i, n, bw) {
    const { prof, off, ux, uz, nx, nz } = r;
    const s = (i + 0.5) * bw;
    const px = r.a[0] + ux * s, pz = r.a[1] + uz * s;
    let fx = px + nx * off, fz = pz + nz * off;
    let onPodium = false;

    // THE GLASS GOES ON THE FACE THAT IS DRAWN, NOT ON THE FOOTPRINT LINE.
    //
    // A mall with a landmark recipe has a podium wider than its footprint —
    // Ngee Ann City's, ION's, Orchard Central's — so a bay placed on the
    // footprint line is inside masonry, invisible, with the podium wall a metre
    // in front of it. 794 bays were built that way, including most of the
    // Orchard Road frontages that are the entire point of this file, and no
    // check could see it: S6 asks about FOOTPRINTS and the podium has none.
    //
    // So walk outward until the wall grid says the wall has ended, and put the
    // shopfront there. This is the same offset problem the ground-floor band
    // solves with `grow()`, except the amount cannot be computed from the
    // footprint because it is whatever the recipe drew. Ask the world.
    //
    // Refusing instead is what the first version did, and losing a third of the
    // named tenants to avoid drawing them wrongly is not a fix, it is a smaller
    // world.
    if (wallAt) {
      const clearAt = (d) => ![-bw * 0.34, 0, bw * 0.34]
        .some((du) => wallAt(fx + ux * du + nx * d, fz + uz * du + nz * d));
      if (!clearAt(0.7)) {
        let push = 0;
        for (let d = 0.5; d <= 9; d += 0.4) {
          // Clear here AND still clear well beyond, so the search cannot stop
          // in a doorway, a light well or a recess inside the podium. Two
          // samples were not enough: a wall reappearing 2m further out left 48
          // bays glazing the back of a niche.
          // ...and clear one step deeper still: at three samples the search
          // settled bays into 3m-deep slots with a podium setback face just
          // past the last sample (Onze and Newport Tower, D26 2026-08-03).
          if (clearAt(d + 0.7) && clearAt(d + 1.5) && clearAt(d + 2.6) && clearAt(d + 3.4)) { push = d; break; }
        }
        if (!push) return null;           // solid all the way out: no frontage here
        fx += nx * push; fz += nz * push;
        onPodium = true;
      }
      // A refusal for bays still behind something after the push was tried and
      // REMOVED. It threw away 202 bays and 11 named tenants and D26 did not
      // move: the residual findings are not walls. They are the 42cm awning
      // trim of the building NEXT DOOR, which sits 5.3m above its own footing
      // and therefore at eye level from here wherever the ground steps down
      // between the two. The collision grid correctly ignores it — 5m up is not
      // an obstacle where it stands — and a raycast at eye height correctly
      // hits it. Both are right; the thing itself is a grade artefact, not a
      // shopfront defect. A fix that costs 11 tenants and moves no number is
      // not a fix.
    }
    // Nothing may lean into the traffic. Checked where the glass actually
    // stands, not on the centreline of the frontage: a run skewed to the kerb
    // is clear at one end and in the road at the other.
    // At its CORNERS, not just at its middle. A bay is up to eight metres wide
    // and a frontage is rarely parallel to the kerb it faces, so the centre can
    // be clear while an end is in the traffic — the same mistake that once put
    // 59 canopy columns in the road, tested outward from a midpoint. Costs
    // fourteen findings on P1b and five on T1 to skip; both are ratchets at
    // zero and neither may go up.
    const reachOut = prof.depth + 0.26;
    for (const du of [-bw / 2, 0, bw / 2]) {
      const cx2 = fx + ux * du + nx * reachOut, cz2 = fz + uz * du + nz * reachOut;
      if (onCarriageway(cx2, cz2, 0)) return null;
    }
    // and the bay must still be on a street once it is placed
    if (streets.dist(fx + nx * 2.5, fz + nz * 2.5) > ROAD_NEAR + 4) return null;
    // A run is judged at three points along it and accepted on two of them,
    // which says nothing about any particular bay. 271 bays at the ends of
    // otherwise good runs were facing straight into the neighbouring block —
    // OSM footprints on a terrace touch, and a corner return can end up nose to
    // nose with the building next door. Every bay is now tested where it
    // stands, at the glass and again on the pavement.
    // ANY footprint in front, including this bay's own. A concave plan folds
    // back on itself: an L, a courtyard or a service notch has edges whose
    // outward side re-enters the same building a metre or two further out, and
    // 236 bays were glazing the inside of their own light well. Allowing the
    // host through was the whole difference between 236 and zero.
    //
    // HEIGHT-AWARE and DEEPER since 2026-08-03. Two blind spots measured by
    // D26: the 2.4m reach stopped short of podium setbacks 2.9-3.2m out
    // (Onze, Newport Tower, Michael Kors on Mandarin Gallery all kept their
    // bays behind a mass the test never sampled), and the 2D ring test was
    // height-blind, so a CANOPY part (mh well above head height) killed the
    // bay under it as if it were masonry. A ring only blocks if its mass is
    // actually solid across the glazing band where this bay stands.
    // Depths start at 1.2 ON PURPOSE: the glass is recessed into the ring by
    // its profile depth, so a shallower sample lands inside the HOST's own
    // facade and reads it as a wall — measured 2026-08-03: an 0.8m sample
    // killed keppel 164 -> 15 tenants before it was caught here.
    // The 3.1m sample runs only for bays still ON the footprint line: a
    // podium-pushed bay stands in found space the wall grid cleared, and
    // sampling deep from THERE read plinths and columns as walls (86 orchard
    // bays died for 1 real finding). An unpushed bay with a solid ring 3m out
    // is Onze/Newport's setback face — glazing aimed at its own podium.
    // 1.2 AND 2.4 EXACTLY, measured three ways on 2026-08-03 before being
    // left alone. A height-aware version (skip canopy parts overhead) cost
    // brasbasah two real tenants by re-shuffling bay claims and needed S6
    // weakened to agree; a third sample at 3.1m — aimed at podium setback
    // faces 3m out (Onze, Newport Tower, 4 invisible D26 bays) — killed the
    // same two tenants; 0.8m sampled inside the host's own glass recess and
    // killed keppel 164 -> 15. The four bays it would have cleared are
    // glazing no rider can see behind a setback, and D26 documents them;
    // two real tenants outrank them. S8 is the ratchet that enforces this
    // trade — respect it before "improving" this loop again.
    for (const dv of [1.2, 2.4]) {
      if (index.at(fx + nx * dv, fz + nz * dv)) return null;
    }
    // and this wall has not already been glazed by an overlapping footprint.
    // Checked over the whole 3x3 neighbourhood: two bays 1.16m apart landed in
    // different cells of a 1.2m grid and both were built, which is how eleven
    // duplicate frontages survived the first pass.
    // Neighbouring cells AND neighbouring facings: the heading is bucketed into
    // sixths of a circle, and two bays on the same wall can fall either side of
    // a bucket edge. Two pairs survived the first version for exactly that.
    for (const dx of [-1, 0, 1]) for (const dz of [-1, 0, 1]) for (const da of [-1, 0, 1]) {
      if (claimed.has(claimKey(fx, fz, nx, nz, dx, dz, da))) return null;
    }
    claimed.add(claimKey(fx, fz, nx, nz));
    if (onPodium) stats.baysOnPodium++;
    return { fx, fz };
  }

  function drawBay(r, i, n, bw, tenant, site) {
    const { prof, ux, uz, nx, nz } = r;
    const { fx, fz } = site;

    // The bay stands on the PAVEMENT IN FRONT OF IT, not on the building's
    // footing.
    //
    // Everything else about a building is measured from the footing, which is
    // the lowest ground under the whole footprint sunk 0.9m, and that is right
    // for masonry: on a slope the uphill end is buried and nobody can tell.
    // A shopfront is the one part of a building that meets the ground where a
    // person is standing. Datumed to the footing, Plaza Singapura's bays sat
    // 1.5m below the pavement in front of them — its footprint spans fourteen
    // metres of grade — and the glass was a strip at ankle height. This is the
    // same distinction as the ride: the height a thing is DRAWN at and the
    // height a thing STANDS on are two different numbers.
    //
    // Floored at 1.5m below the run's footing so a hole in the heightfield
    // cannot drop one bay through the floor while its neighbours stay put.
    const gy = groundAt(fx + nx * 1.0, fz + nz * 1.0) - 0.06;
    const base = Math.max(gy, r.base - 1.5);

    // TWO MORE KILL-ONLY TESTS FOR UNTENANTED BAYS (tenants are exempt by
    // construction, so S8 cannot move):
    // 1. THE DUPLICATE TWIN. Overlapped footprints glaze one wall twice; the
    //    claim grid's ±1 window can be straddled by two bays 1.39m apart (both
    //    D25 pairs did). Untenanted bays draw AFTER every tenant, so a
    //    same-facing bay within 1.6m of one already on the wall is a
    //    duplicate and dies.
    // 2. THE SLOT CANYON. A ring EDGE crossing the bay's forecourt within
    //    3.4m means the glass faces another building's wall across a gap no
    //    street runs through — keppel's Newport/Onze slots. Point sampling
    //    missed these; a segment-edge crossing cannot.
    if (!tenant) {
      if (drawnBayTwin(fx, fz, nx, nz) || facingBayAhead(fx, fz, nx, nz)) {
        stats.baysWalledSkipped = (stats.baysWalledSkipped || 0) + 1;
        return;
      }
      const sx0 = fx + nx * 0.6, sz0 = fz + nz * 0.6;
      const sx1 = fx + nx * 3.4, sz1 = fz + nz * 3.4;
      const cross = (ax, az, bx, bz) => {
        const d1 = (bx - ax) * (sz0 - az) - (bz - az) * (sx0 - ax);
        const d2 = (bx - ax) * (sz1 - az) - (bz - az) * (sx1 - ax);
        const d3 = (sx1 - sx0) * (az - sz0) - (sz1 - sz0) * (ax - sx0);
        const d4 = (sx1 - sx0) * (bz - sz0) - (sz1 - sz0) * (bx - sx0);
        return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
      };
      let slot = false;
      for (const f of index.near(fx + nx * 2.0, fz + nz * 2.0)) {
        for (let ii = 0; ii < f.p.length && !slot; ii++) {
          const a1 = f.p[ii], a2 = f.p[(ii + 1) % f.p.length];
          if (cross(a1[0], a1[1], a2[0], a2[1])) slot = true;
        }
        if (slot) break;
      }
      if (slot) {
        stats.baysWalledSkipped = (stats.baysWalledSkipped || 0) + 1;
        return;
      }
    }

    // AN UNTENANTED BAY FACING MASONRY IS NOT DRAWN. The last ten D26
    // findings were bays behind RECIPE geometry — podium setbacks drawn by
    // the facade family with no footprint ring (measured 2026-08-03: zero
    // data rings in front of any flagged bay), so no data-level test can see
    // them and every attempt to catch them by widening siteBay's ring test
    // cost real tenants. So ask the WORLD, with D26's own instrument: one
    // ray from the street at mid-glazing. Untenanted bays only — killing one
    // cannot move S8 (its ratio counts tenants alone) and cannot displace a
    // tenant. Desktop only: the buildings a phone draws are identical either
    // way (these bays are invisible by definition), and the ray pass is boot
    // time a phone does not have.
    if (!tenant && !SHOP_TOUCH && typeof window !== 'undefined' && window.__scene) {
      const rc = (drawBay._rc = drawBay._rc || new THREE.Raycaster());
      rc.far = 3.4;
      const ry = base + (prof.head + prof.riser) / 2;
      rc.set(new THREE.Vector3(fx + nx * 3.2, ry, fz + nz * 3.2),
             new THREE.Vector3(-nx, 0, -nz).normalize());
      const cands = rayCandidates(fx, fz);
      const hits = rc.intersectObjects(cands || window.__scene.children, !cands)
        .filter((hh) => hh.distance > 0.02 && hh.object.visible)
        .filter((hh) => !hh.object.isInstancedMesh)   // a tree or a prop is not a wall
        .filter((hh) => !(hh.object.material && hh.object.material.transparent))  // glass is see-through
        .filter((hh) => !(hh.object.material && hh.object.material.userData
          && hh.object.material.userData.furniture))  // street furniture is not a wall
        .filter((hh) => !(hh.object.geometry.type === 'SphereGeometry'
          && (hh.object.geometry.parameters || {}).radius > 100))
        .filter((hh) => {
          const g2 = hh.object.geometry;
          if (!g2.boundingBox) g2.computeBoundingBox();
          const s2 = g2.boundingBox.getSize(new THREE.Vector3());
          return !(Math.min(s2.x, s2.z) < 0.3 && s2.y < 4);   // signage is not a wall
        });
      if (hits.length && hits[0].distance < 3.2 - prof.depth - 0.6) {
        stats.baysWalledSkipped = (stats.baysWalledSkipped || 0) + 1;
        return;
      }
    }

    const yaw = Math.atan2(nx, nz);
    const wInner = bw - 0.22;
    const gh = prof.head - prof.riser;
    const yMid = base + (prof.head + prof.riser) / 2;
    const st = tenant ? styleOf(tenant.k) : KIND_DEFAULT;
    const h = hashAt(fx, fz, 7);

    // A blank panel every so often: a service door, a fire exit, a lift lobby.
    // A frontage that is glass end to end for four hundred metres is its own
    // kind of wrong.
    const blank = !tenant && (h % 9) === 0;

    // Local frame: +x along the frontage, +z outward. rotateY(yaw) sends local
    // +z to the outward normal; it sends local +x to (nz, -nx), which is the
    // frontage direction only up to a sign — the normal was flipped to point
    // away from the centroid and half of them are. Fold that sign into `du` so
    // "left along the run" means the same thing on every facade.
    const sgnU = nz * ux - nx * uz < 0 ? -1 : 1;
    const put = (geo, mat) => {
      geo.rotateY(yaw);
      geo.translate(fx, 0, fz);
      merger.add(geo, mat, fx, fz);
    };
    const at = (geo, dv, dy, du = 0) => {
      geo.translate(du * sgnU, dy, dv);
      return geo;
    };

    if (blank) {
      // A blank panel in the reveal colour reads as a hole punched in the
      // frontage. It is a service door or a fire exit: a wall, in the wall's
      // own tone, not a void.
      const panel = new THREE.BoxGeometry(wInner, gh, prof.depth * 0.5);
      put(at(panel, prof.depth * 0.25, yMid), riserMat);
    } else {
      // The lit inside, right behind the glass — and dimmer than the fitting
      // that lights it, with a per-bay wobble. At full brightness every window
      // was a flat pale slab and a terrace of six read as one lightbox: the
      // ceiling strip has to be the brightest thing in the bay or there is
      // nothing for the eye to read as light.
      const back = new THREE.PlaneGeometry(wInner, gh);
      const wob = ((h % 7) - 3) * 0.025;
      put(at(back, 0.02, yMid), interior(st.light, Math.max(0.20, st.lit * 0.62 + wob)));

      // One flat lit panel is a lightbox, not a shop. Three quads at three
      // different depths give it a foreground, and that is all the eye needs at
      // walking pace: a bright strip where the ceiling lights are, a dark
      // counter across the bottom, and a door panel to one side. Quads and not
      // boxes because a shopfront is only ever seen from the street, and six
      // triangles a bay over four thousand bays is a cost worth being careful
      // about.
      const strip = new THREE.PlaneGeometry(wInner * 0.98, gh * 0.14);
      put(at(strip, 0.10, base + prof.head - gh * 0.10), interior(BRIGHT, 1.0));
      // The door goes to one side and the counter fills what is left, side by
      // side rather than overlapping. Drawn on top of each other they read as
      // one black L and the bay looks like a hole in the wall, which is what
      // the first pass looked like.
      const side = h % 2 ? 1 : -1;
      const doorW = Math.min(1.15, wInner * 0.3);
      const door = new THREE.PlaneGeometry(doorW, gh * 0.96);
      put(at(door, 0.30, base + prof.riser + gh * 0.48,
             side * (wInner / 2 - doorW / 2 - 0.1)), doorMat);
      const cw = wInner - doorW - 0.34;
      if (cw > 0.8) {
        const counter = new THREE.PlaneGeometry(cw, gh * 0.26);
        put(at(counter, 0.16, base + prof.riser + gh * 0.13, -side * (doorW / 2 + 0.17)), counterMat);
      }

      // the glass
      const glass = new THREE.PlaneGeometry(wInner, gh);
      put(at(glass, prof.depth, yMid), glassMat);
      // reveals down both sides, so the depth is real and not a printed shadow
      for (const sgn of [-1, 1]) {
        const side = new THREE.PlaneGeometry(prof.depth, gh);
        side.rotateY(Math.PI / 2);
        put(at(side, prof.depth / 2, yMid, sgn * wInner / 2), revealMat);
      }
      // head and sill
      const soffit = new THREE.PlaneGeometry(wInner, prof.depth);
      soffit.rotateX(Math.PI / 2);
      put(at(soffit, prof.depth / 2, base + prof.head), revealMat);
      const sill = new THREE.PlaneGeometry(wInner, prof.depth);
      sill.rotateX(-Math.PI / 2);
      put(at(sill, prof.depth / 2, base + prof.riser + 0.01), revealMat);
    }

    // stall riser under the glass
    const riser = new THREE.BoxGeometry(bw, prof.riser, prof.depth + 0.06);
    put(at(riser, (prof.depth + 0.06) / 2, base + prof.riser / 2), riserMat);

    // one mullion per bay edge, plus the closing one at the end of the run, so
    // neighbours share theirs instead of each drawing both
    const mull = (du) => {
      const g = new THREE.BoxGeometry(0.13, gh + 0.12, prof.depth + 0.1);
      put(at(g, (prof.depth + 0.1) / 2, yMid, du), frameMat);
    };
    mull(-bw / 2);
    if (i === n - 1) mull(bw / 2);

    // the fascia, and the tenant's name on it
    const fas = new THREE.BoxGeometry(bw, prof.fasciaH, prof.depth + 0.12);
    put(at(fas, (prof.depth + 0.12) / 2, base + prof.fascia + prof.fasciaH / 2), fasciaMat);

    // How far this bay actually reaches out from the facade. The frame is the
    // fascia at depth + 0.12; an awning adds 1.45m of sheet and its valance.
    // Recorded rather than assumed, because a check that tests every bay at the
    // awning's reach reports 445 failures for geometry that was never built.
    let reach = prof.depth + 0.14;

    if (tenant) {
      const fy = base + prof.fascia + prof.fasciaH / 2;
      const fv = prof.depth + 0.13;
      const th = prof.fasciaH * 0.74;
      // Bilingual where OSM has it: 177 of these tenants carry name:zh, and a
      // Singapore fascia with both scripts on it is the single most local
      // detail available for free in the data.
      const zh = tenant.zh;
      const enW = Math.min(bw - 0.3, (zh ? 0.60 : 0.94) * bw);
      const zw = zh ? Math.min(bw * 0.30, bw - enW - 0.26) : 0;
      const uvEn = atlas.add(tenant.n, st.sign, '#f6f3ec');
      const en = atlas.plane(enW, th, uvEn);
      put(at(en, fv, fy, zw > 0.6 ? -(bw / 2 - 0.14 - enW / 2) : 0), uvEn.mat);
      if (zw > 0.6) {
        const uvZh = atlas.add(zh, st.sign, '#f6f3ec');
        const zhp = atlas.plane(zw, th, uvZh);
        put(at(zhp, fv, fy, bw / 2 - 0.14 - zw / 2), uvZh.mat);
      }
      // Somewhere to eat outside. Only where the pavement can take it, which on
      // Orchard it usually cannot: the awning is checked where its front edge
      // lands, not at the wall.
      // At its CORNERS. An awning is 96% of a bay wide and reaches 1.5m out,
      // and it was checked on the centreline only — the third time in this file
      // that a wide thing was tested at one point, after the bays themselves
      // and the canopy columns before them. Worth exactly one finding on
      // Orchard's P1b ratchet, which is a gate, so it is worth fixing.
      const awnClear = st.awning && prof === BIG && [-bw * 0.48, 0, bw * 0.48].every((du) => {
        const ax = fx + ux * du + nx * 1.55, az = fz + uz * du + nz * 1.55;
        if (onCarriageway(ax, az, 0) || streets.dist(ax, az) <= 0.8) return false;
        // and it must HANG like an awning: between head height and first
        // storey above the LOCAL ground. On Chinatown's hills a bay whose
        // footing sat below the street put the red sheet in the pavement,
        // and a flipped frontage floated one mid-air over the carriageway —
        // the district reviews photographed both. Skip, never substitute.
        const gAt = groundAt(ax, az);
        const awnY = base + prof.fascia - 0.14;
        return awnY - gAt > 2.2 && awnY - gAt < 6.5;
      });
      if (awnClear) {
        // A 9cm slab read as a plank stuck to the wall. An awning is a sloped
        // sheet with a valance hanging off its front edge, and the valance is
        // the part you actually see from the pavement.
        const aw = new THREE.BoxGeometry(bw * 0.96, 0.07, 1.45);
        aw.rotateX(-0.20);
        put(at(aw, prof.depth + 0.72, base + prof.fascia - 0.14), awningMat);
        const val = new THREE.PlaneGeometry(bw * 0.96, 0.32);
        put(at(val, prof.depth + 1.42, base + prof.fascia - 0.44), awningMat);
        reach = prof.depth + 1.48;
        stats.shopAwnings++;
      }
      stats.realShops++;
    }
    // Every bay, tenanted or not, so a check can ask where the glass ended up
    // rather than where the map said a shop was. That distinction is the whole
    // reason this file exists.
    drawnBayAdd(fx, fz, nx, nz);
    (window.__shopBays = window.__shopBays || []).push({
      x: fx, z: fz, nx, nz, w: +bw.toFixed(2), tenanted: !!tenant, name: tenant ? tenant.n : '',
      kind: tenant ? tenant.k : '', y: +(base + prof.riser).toFixed(2),
      top: +(base + prof.fascia + prof.fasciaH).toFixed(2),
      depth: prof.depth, reach: +reach.toFixed(2), building: r.b.n || '',
    });
    stats.glazedFrontage += bw;
  }

  // Bays are fabric on a wall that already casts, and they are the most
  // numerous geometry in the district. Keeping them out of the shadow map is
  // the same trade the kerbs and railings took: 4,000 of them, no visible loss.
  const meshes = merger.flush(world, { cast: false });
  atlas.finish();
  stats.shopMeshes = meshes;
  stats.shopPages = atlas.pages.length;
  stats.glazedFrontage = Math.round(stats.glazedFrontage);
  return stats;
}
