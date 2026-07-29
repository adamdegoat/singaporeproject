// Road markings and side-street dressing.
//
// Markings are what make tarmac read as a road rather than a grey plane, and
// they are almost free: flat instanced quads a few centimetres above the
// surface, all in two draw calls.
import * as THREE from '../lib/three.module.js';
import { R, rand, chance } from './tex.js';
import { MAT, groundAt } from './city.js';
import { claim } from './roads.js';
import { texStreetName } from './wayfind.js';

// The carriageway surface is drawn at this height (see buildRoads in city.js).
// Every marking is stacked above it: lowering them below the tarmac buries them,
// which is what happened when they were separated for z-fighting and the road's
// own height was forgotten. Each class is 6mm clear of the next so no two are
// ever coplanar.
const ROAD_Y = 0.055;
const MARK = {
  // dots sit BELOW the zebra layer: they are the same class of marking and
  // sharing a height made every overlap a coplanar pair (P6 11 -> 50)
  dots: ROAD_Y + 0.014,
  zebra: ROAD_Y + 0.020, dash: ROAD_Y + 0.026, yellow: ROAD_Y + 0.032,
  edge: ROAD_Y + 0.038, stop: ROAD_Y + 0.044, arrow: ROAD_Y + 0.050,
  arrowHead: ROAD_Y + 0.056,
};

const WHITE = new THREE.MeshStandardMaterial({ color: 0xdedad0, roughness: 0.86 });
const YELLOW = new THREE.MeshStandardMaterial({ color: 0xd6ae44, roughness: 0.86 });

// NOTHING PAINTED ON WATER.
//
// Road markings are placed by walking an axis at a lateral offset, and Marina
// Bay's axis is Bayfront Avenue, which runs along the waterfront: at half a
// carriageway out, the offset lands in the reservoir. 1,900 lane lines were
// drawn on the bay, which the new W2 check caught the first time it ran against
// real water. One guard at the emit point covers every marking type, rather
// than threading a water test through six placement loops.
function dry(list) {
  if (!window.__inWater) return list;
  return list.filter((r) => !window.__inWater(r[0], r[2]));
}

// A ROAD MARKING BELONGS ON THE ROAD.
//
// Markings are laid out from the axis at a lateral offset, and the tarmac is
// drawn per way at that way's own width -- two different sources for the same
// edge. Measured: 483 of 28,967 markings were painted past the kerb, onto the
// pavement, which is what "yellow patches on the road" and "lines cut off" both
// look like from the saddle. The local-width probe above fixes most of it; this
// guarantees the rest, by asking the SAME road index the tarmac comes from.
function onTarmac(list) {
  if (!window.__onRoad) return list;
  return list.filter((r) => window.__onRoad(r[0], r[2], 0.15));
}

// TWO MARKINGS MAY NOT LIE ON THE SAME GROUND.
//
// `claim` is a single-cell hash -- Math.round(x/cell) -- so it thins markings
// per cell but never guarantees a spacing: two points 18cm apart that straddle
// a cell boundary both succeed. That was tolerable while dashes covered 3
// metres in 9; at the real LTA proportion of 4 in 6 there are twice as many of
// them, and every street seam where two axes dress the same tarmac started
// producing pairs 2mm apart in height (P6 11 -> 41).
//
// Deduped here, at the point P6 measures, rather than by making `claim`
// neighbourhood-aware: that would change every placement decision in the world
// -- trees, lamps, kerbs, furniture -- and is a deliberate reshuffle owed its
// own batch and its own re-baselining, not a side effect of painting lines.
function dedupeFlat(list) {
  // Checks the 3x3 CELL NEIGHBOURHOOD, not one cell. The first version of this
  // function hashed a single rounded cell -- and so reproduced, exactly, the
  // `claim` bug it was written to work around: two marks 18cm apart either
  // side of a cell boundary hash differently and both survive. P6 measures a
  // real distance, so the dedupe has to as well.
  const CELL = 0.25, LIM = 0.18 * 0.18;
  const grid = new Map();
  const out = [];
  for (const r of list) {
    const cx = Math.round(r[0] / CELL), cz = Math.round(r[2] / CELL);
    let dup = false;
    for (let dx = -1; dx <= 1 && !dup; dx++)
      for (let dz = -1; dz <= 1 && !dup; dz++) {
        const list2 = grid.get((cx + dx) + ',' + (cz + dz));
        if (!list2) continue;
        for (const q of list2)
          if (Math.abs(q[2] - r[1]) < 0.006
              && (q[0] - r[0]) ** 2 + (q[1] - r[2]) ** 2 < LIM) { dup = true; break; }
      }
    if (dup) continue;
    const k = cx + ',' + cz;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push([r[0], r[2], r[1]]);
    out.push(r);
  }
  return out;
}

function emitFlat(world, list, w, l, mat) {
  list = dedupeFlat(onTarmac(dry(list)));
  if (!list.length) return 0;
  const geo = new THREE.PlaneGeometry(w, l);
  const im = new THREE.InstancedMesh(geo, mat, list.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  list.forEach((r, i) => {
    p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]);
    e.set(-Math.PI / 2, r[3], 0, 'YXZ');
    q.setFromEuler(e);
    m.compose(p, q, s);
    im.setMatrixAt(i, m);
  });
  im.receiveShadow = true;
  world.add(im);
  return list.length;
}

// How the main street actually works, read off the map rather than assumed.
//
// Orchard Road has been one-way since 1974: five lanes all running south-east
// toward Dhoby Ghaut. Every Orchard Road way in the OSM extract carries
// oneway=yes, and the flag was already sitting unused in the scene file while
// the traffic system spawned half its vehicles head-on up the street. That is
// the same failure as the crossings and the sidewalk tags before it: the data
// was there, nothing read it.
//
// Both the lane markings and the traffic take their geometry from here, so they
// cannot disagree about where a lane is.
export function axisSpec(axis, data = {}) {
  const name = (axis.n || '').toLowerCase();
  const ways = (data.roads || []).filter((r) => (r.n || '').toLowerCase() === name);
  let lanes = 0, tagged = 0, ow = 0, owTagged = 0;
  for (const r of ways) {
    if (r.lanes) { lanes += r.lanes; tagged++; }
    if (r.oneway != null) { owTagged++; if (r.oneway) ow++; }
  }
  const half = axis.w / 2;
  // A street is one-way only if the map says so everywhere it says anything.
  // A majority vote would let a handful of mis-tagged slip roads flip a street
  // that is one-way along its whole length, or the reverse.
  const oneway = owTagged > 0 && ow === owTagged;
  const count = tagged ? Math.max(2, Math.round(lanes / tagged)) : (oneway ? 3 : 6);
  const laneW = (half * 2) / count;
  // lane centres, offset from the centreline
  const centres = [];
  for (let i = 0; i < count; i++) centres.push(-half + laneW * (i + 0.5));
  return { count, laneW, half, oneway, centres, ways: ways.length, tagged, owTagged };
}

// THE STREET IS NOT ONE WIDTH.
//
// `axis.w` is a single number for the whole street, and the markings were laid
// out from it, but Orchard Road's own ways run from 7.0m to 25.0m: 39 at 18.2m,
// ten at 14.8m, and a handful at 7m, 8m, 11.4m, 21.6m and 25m. The TARMAC is
// drawn per way at that way's width, so wherever the road narrows the markings
// were painted metres beyond the kerb -- lane lines lying on the pavement, and
// stretches of road with no lines on them at all because the ones that belonged
// there had been thrown outside it.
//
// This returns the width of the real way NEAREST a point, so the markings and
// the tarmac are taken from the same source and cannot disagree.
function widthProbe(axis, data) {
  const name = (axis.n || '').toLowerCase();
  const segs = [];
  for (const r of (data.roads || [])) {
    if ((r.n || '').toLowerCase() !== name) continue;
    for (let i = 0; i < r.p.length - 1; i++) segs.push([r.p[i], r.p[i + 1], r.w || axis.w, !!r.bridge, r.lf || 0, r.lb || 0]);
  }
  if (!segs.length) return () => ({ w: axis.w, bridge: false, lf: 0, lb: 0 });
  const CELL = 60;
  const grid = new Map();
  for (const sg of segs) {
    const [a, b] = sg;
    for (let gx = Math.floor(Math.min(a[0], b[0]) / CELL); gx <= Math.floor(Math.max(a[0], b[0]) / CELL); gx++)
      for (let gz = Math.floor(Math.min(a[1], b[1]) / CELL); gz <= Math.floor(Math.max(a[1], b[1]) / CELL); gz++) {
        const k = gx + ',' + gz;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(sg);
      }
  }
  return (x, z) => {
    let best = axis.w, bestBr = false, bestF = 0, bestB = 0, bd = Infinity;
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) {
        const list = grid.get((Math.floor(x / CELL) + dx) + ',' + (Math.floor(z / CELL) + dz));
        if (!list) continue;
        for (const [a, b, w, br, lf, lb] of list) {
          const vx = b[0] - a[0], vz = b[1] - a[1];
          const L2 = vx * vx + vz * vz;
          const t = L2 < 1e-9 ? 0 : Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / L2));
          const d = (x - (a[0] + vx * t)) ** 2 + (z - (a[1] + vz * t)) ** 2;
          if (d < bd) { bd = d; best = w; bestBr = br; bestF = lf; bestB = lb; }
        }
      }
    return { w: best, bridge: bestBr, lf: bestF, lb: bestB };
  };
}

export function buildMarkings(world, axis, data = {}) {
  const pts = axis.p;
  const widthAt = widthProbe(axis, data);
  let half = axis.w / 2;
  const dash = [], edge = [], yellowL = [], stopL = [], arrowShaft = [], arrowHead = [];

  const spec = axisSpec(axis, data);
  const laneCount = spec.count, laneW = spec.laneW;
  // divider offsets: evenly split the carriageway by the real lane count
  const dividers = [];
  for (let i = 1; i < laneCount; i++) {
    const off = -half + i * laneW;
    // On a two-way street the middle line is the median and is drawn
    // differently; on a one-way street it is an ordinary lane divider like any
    // other and skipping it leaves a five-lane road looking like four.
    if (!spec.oneway && Math.abs(off) < 1.6) continue;
    dividers.push(off);
  }
  window.__laneCount = laneCount;
  window.__oneway = spec.oneway;

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;
      // the width of the real carriageway HERE, not the street's average
      const wh = widthAt(px, pz);
      // A BRIDGE DECK IS NOT AT GROUND LEVEL, and markings are placed at
      // groundAt(): on the causeways across Marina Bay they end up under the
      // deck. The per-road loop already skips bridges; the AXIS walk did not,
      // and Bayfront Avenue crosses two.
      if (wh.bridge) continue;
      half = wh.w / 2;
      // THE EXACT DIRECTIONAL SPLIT, where the map gives it. 768 ways carry
      // lanes:forward and lanes:backward and we were halving the total instead,
      // which is right only when the split is even: on a 3-lane road with two
      // lanes one way and one the other, the centre line was drawn down the
      // middle of a lane. The median sits at the real boundary now.
      const nF = wh.lf, nB = wh.lb;
      const nTot = (nF && nB) ? nF + nB : laneCount;
      const lw2 = (half * 2) / nTot;
      const medianOff = (nF && nB) ? (-half + nF * lw2) : 0;
      const dividers2 = [];
      for (let i2 = 1; i2 < nTot; i2++) {
        const off2 = -half + i2 * lw2;
        // the median is drawn separately as a double yellow, not as a divider
        if (!spec.oneway && Math.abs(off2 - medianOff) < 0.4) continue;
        dividers2.push(off2);
      }
      dividers.length = 0;
      for (const d2 of dividers2) dividers.push(d2);

      // Dashed lane dividers at the real lane positions.
      //
      // LTA SDRE Ch.8 Type B, which is the standard lane line on every road in
      // Singapore that is not an expressway: **100mm wide, 4m mark, 2m gap.**
      // This was drawn 140mm wide with a 3m mark and a 6m GAP -- the inverse
      // proportion -- so every street in the world read as sparse short ticks
      // where the real thing is a long dash with a short break. It is the most
      // repeated single marking in the district, so it was also the most
      // repeated error. (Type B1, 10m/2m, is expressway only and we have none.)
      if (acc % 6 < 4) {
        for (const off of dividers) {
          if (claim('dash', px + nx * off, pz + nz * off, 1.2))
            dash.push([px + nx * off, MARK.dash, pz + nz * off, ang]);
        }
      }
      // solid white edge line just inside the kerb
      if (acc % 2 === 0) {
        for (const sgn of [-1, 1]) {
          if (claim('edge', px + nx * (half - 0.55) * sgn, pz + nz * (half - 0.55) * sgn, 1.2))
            edge.push([px + nx * (half - 0.55) * sgn, MARK.edge, pz + nz * (half - 0.55) * sgn, ang]);
        }
      }
      // double yellow along the kerb — no parking, and unmistakably local
      if (acc % 2 === 0) {
        for (const sgn of [-1, 1]) {
          if (claim('yellow', px + nx * (half - 0.12) * sgn, pz + nz * (half - 0.12) * sgn, 1.2)) {
            yellowL.push([px + nx * (half - 0.12) * sgn, MARK.yellow, pz + nz * (half - 0.12) * sgn, ang]);
            yellowL.push([px + nx * (half - 0.34) * sgn, MARK.yellow, pz + nz * (half - 0.34) * sgn, ang]);
          }
        }
      }
      // stop line and a straight-ahead arrow before each crossing
      if (acc % 190 === 24) {
        for (const sgn of [-1, 1]) {
          stopL.push([px + nx * (half * 0.5) * sgn, MARK.stop, pz + nz * (half * 0.5) * sgn, ang + Math.PI / 2]);
        }
      }
      if (acc % 190 === 60 || acc % 190 === 140) {
        for (const off of spec.centres) {
          arrowShaft.push([px + nx * off, MARK.arrow, pz + nz * off, ang]);
          arrowHead.push([px + nx * off + ux * 1.9, MARK.arrowHead, pz + nz * off + uz * 1.9, ang]);
        }
      }
    }
  }

  let n = 0;
  n += emitFlat(world, dash, 0.10, 1.0, WHITE);   // LTA Type B is 100mm
  n += emitFlat(world, edge, 0.12, 2.0, WHITE);
  n += emitFlat(world, yellowL, 0.10, 2.0, YELLOW);
  n += emitFlat(world, stopL, 0.42, half * 0.92, WHITE);
  n += emitFlat(world, arrowShaft, 0.28, 3.2, WHITE);
  n += emitFlat(world, arrowHead, 0.92, 0.9, WHITE);
  return n;
}

/* ---------------- side streets ---------------- */
// The back streets were bare tarmac. They get kerbs, lamps and a thinner tree
// line so the world does not stop existing one block off Orchard.
// The streets we treat as part of the world: named, long enough to be a street
// rather than a slip, and close enough to the route to be worth building. The
// crowd uses the same list, so people appear exactly where pavements do.
export function selectSideStreets(data, axis, reach = 230) {
  const A = axis.p;
  const near = (x, z) => {
    for (let i = 0; i < A.length - 1; i++) {
      const [x1, z1] = A[i], [x2, z2] = A[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      if (dx * dx + dz * dz < reach * reach) return true;
    }
    return false;
  };
  // Length is measured per STREET, not per way. OSM splits a road at every
  // junction and tag change: Orchard Boulevard is 21 fragments, none of them
  // 45m long, so testing each one on its own threw away the entire 1,376m
  // street and left it bare.
  // service ways are included when they carry a name. OSM tags Cuppage Road,
  // Canning Rise and Edinburgh Road as service, and they are real streets with
  // frontages on them; an UNNAMED service way is a car park aisle or a loading
  // bay and stays out.
  const byName = new Map();
  for (const r of data.roads) {
    if (!r.n || /orchard road/i.test(r.n)) continue;
    if (r.k === 'footway' || r.k === 'pedestrian') continue;
    // NOT ON A BRIDGE DECK. Markings are placed at groundAt(), and a bridge
    // deck is by definition not at ground level -- so every causeway across
    // Marina Bay had its lane lines painted on the seabed. 1,900 of them, which
    // is what the new W2 check caught on its first run against real water.
    // The ribbon itself is drawn flat at bank height; the markings would need
    // the same treatment threaded through four placement paths, and an unmarked
    // bridge deck is a far smaller defect than a painted reservoir.
    if (r.bridge) continue;
    let len = 0;
    for (let i = 0; i < r.p.length - 1; i++) {
      len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
    }
    const e = byName.get(r.n) || { len: 0, ways: [] };
    e.len += len; e.ways.push(r);
    byName.set(r.n, e);
  }
  const out = [];
  for (const [, e] of byName) {
    if (e.len < 45) continue;
    // A long way can have its midpoint outside the radius while most of it is
    // inside. Judge on any point, which is also how the audit judges it: the
    // builder and the check must not disagree about what the world contains.
    for (const r of e.ways) {
      if (!r.p.some((q) => near(q[0], q[1]))) continue;
      out.push(r);
    }
  }
  return out;
}

// `done` is a Set of road objects already dressed by an earlier axis. A region
// has one axis per district, and a side street within reach of BOTH was dressed
// twice: two sets of kerbs and two sets of lamps in the same place, which is
// where 245 of the region's 333 duplicated props and most of its z-fighting
// came from. The set is shared across the calls rather than rebuilt per axis,
// because the whole point is what a PREVIOUS axis already did.
export function dressSideStreets(world, data, axis, blockedIn, TreeField, done = null) {
  const trees = new TreeField();
  const kerb = [], lamp = [], lampArm = [];
  let roads = 0, skipped = 0;
  const segs = [];          // every dressed road segment, for matching crossings
  let sideCrossings = 0, sidewalkReal = 0, sidewalkNone = 0;
  const plated = new Set();

  // Dress what can be seen from the route. The full district holds 46.8km of
  // side street, which produced 23,000 kerbs and 2,100 trees — most of it
  // hundreds of metres from anywhere the player goes.
  const REACH = 230;
  const A = axis.p;
  const nearAxis = (x, z, reach = REACH) => {
    for (let i = 0; i < A.length - 1; i++) {
      const [x1, z1] = A[i], [x2, z2] = A[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      if (dx * dx + dz * dz < reach * reach) return true;
    }
    return false;
  };

  let chosen = selectSideStreets(data, axis, REACH);
  // Never dress a street a previous axis already dressed. A region has one axis
  // per district and their 230m catchments overlap, so the streets between them
  // were being kerbed, lamped and treed twice over.
  if (done) {
    chosen = chosen.filter((r) => !done.has(r));
    for (const r of chosen) done.add(r);
  }
  // Drop ways that lie inside another carriageway. Mount Sophia is mapped as
  // ten ways of three widths, some running inside the others; dressing the
  // inner one puts its kerb line in the middle of the outer one, and every
  // kerb is then correctly refused, leaving the street with nothing on it.
  const onRoadRaw = window.__onRoad || (() => false);
  chosen = chosen.filter((r) => {
    let inside = 0, n = 0;
    for (const q of r.p) {
      n++;
      // is this centreline point inside some OTHER street's carriageway
      if (onRoadRaw(q[0], q[1], -(r.w || 6) / 2 - 0.5, r.n)) inside++;
    }
    return n === 0 || inside / n < 0.7;
  });
  skipped = data.roads.length - chosen.length;
  for (const r of chosen) {
    const pts = r.p, half = r.w / 2;
    const isBlocked = blockedIn;
    for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1], half]);

    // OSM records which side of a street actually has a pavement. In this
    // district 404 roads carry the tag; laying a kerb down both sides of every
    // one of them puts pavements where there are none. The map's left/right is
    // relative to the way direction: heading east, the right-hand side is
    // south, which is +z here, and that is the +1 side below.
    let doLeft = true, doRight = true;
    const sw = r.sidewalk;
    if (sw === 'left') doRight = false;
    else if (sw === 'right') doLeft = false;
    else if (sw === 'no' || sw === 'none' || sw === 'separate') { doLeft = doRight = false; }
    const sides = [];
    if (doLeft) sides.push(-1);
    if (doRight) sides.push(1);

    roads++;

    // C2: a street with no name plate is a street you cannot identify. One
    // plate per named street, at its first clear kerbside spot, reading the
    // name OSM records for it.
    if (!plated.has(r.n)) {
      // walk along the street looking for a clear kerbside spot. One attempt at
      // the very first metre failed on 12 streets, which is how a street ends
      // up with no name on it anywhere.
      const spots = [];
      for (const along of [16, 34, 58, 90, 130]) {
        let acc2 = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const ax = pts[i + 1][0] - pts[i][0], az = pts[i + 1][1] - pts[i][1];
          const L = Math.hypot(ax, az) || 1;
          if (acc2 + L < along) { acc2 += L; continue; }
          const t2 = (along - acc2) / L;
          spots.push([pts[i][0] + ax * t2, pts[i][1] + az * t2, ax / L, az / L]);
          break;
        }
      }
      outer:
      for (const [bx0, bz0, u0x, u0z] of spots)
      for (const sgn of [1, -1]) {
        const sx = bx0 + -u0z * (half + 2.2) * sgn;
        const sz = bz0 + u0x * (half + 2.2) * sgn;
        if (isBlocked(sx, sz)) continue;
        if (window.__nearestStreet && window.__nearestStreet(sx, sz) !== r.n) continue;
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), MAT.metal);
        pole.position.y = 1.3; g.add(pole);
        const plate = new THREE.Mesh(
          new THREE.PlaneGeometry(1.5, 0.38),
          new THREE.MeshBasicMaterial({ map: texStreetName(r.n), side: THREE.DoubleSide }));
        plate.position.y = 2.5; g.add(plate);
        g.position.set(sx, groundAt(sx, sz), sz);
        g.rotation.y = Math.atan2(u0x, u0z) + Math.PI / 2;
        world.add(g);
        (window.__signage = window.__signage || [])
          .push({ kind: 'plate', x: sx, z: sz, text: r.n });
        plated.add(r.n);
        break outer;
      }
    }
    if (sw) sidewalkReal++;
    if (!doLeft && !doRight) sidewalkNone++;

    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
      const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
      if (len < 0.5) continue;
      const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
      const ang = Math.atan2(ux, uz);
      for (let t = 0; t < len; t += 4, acc += 4) {
        const px = x1 + ux * t, pz = z1 + uz * t;
        for (const sgn of sides) {
          // Where two OSM ways of the same street run side by side, the kerb
          // line of one falls inside the other and every kerb is refused,
          // leaving the street bare. Step outward before giving up.
          let kx = 0, kz = 0, ok = false;
          for (const out2 of [0.4, 1.4, 2.6]) {
            kx = px + nx * (half + out2) * sgn; kz = pz + nz * (half + out2) * sgn;
            if (!isBlocked(kx, kz)) { ok = true; break; }
          }
          if (ok && claim('kerb', kx, kz)) kerb.push([kx, 0.15, kz, ang]);
          if (acc % 44 === 0) {
            const tx = px + nx * (half + 2.8) * sgn, tz = pz + nz * (half + 2.8) * sgn;
            if (!isBlocked(tx, tz) && claim('tree', tx, tz, 3.0)) trees.add(tx, tz, rand(0.6, 0.9));
          }
          // Lamps used to go in here, every 96 metres. They come from LTA's
          // published lamp-post layer now — see the block below, and
          // data/lamps.py. 96 was a number nobody measured.
        }
      }
    }
  }

  // OSM maps a node for every pedestrian crossing in the district, and only the
  // 35 on Orchard Road itself were being used. The other 465 are on the streets
  // running off it, which is exactly where you meet them when you turn a corner.
  let zebra = [];
  const dots = [];          // signalised-crossing boundary squares
  const axisHalf = axis.w / 2;
  for (const c of (data.crossings || [])) {
    const [cx, cz] = c;
    if (nearAxis(cx, cz, axisHalf + 7)) continue;    // already painted on the main street
    let best = null, bd = Infinity, bt = 0;
    for (const [a1, a2, hw] of segs) {
      const vx = a2[0] - a1[0], vz = a2[1] - a1[1], L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((cx - a1[0]) * vx + (cz - a1[1]) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const d = (cx - (a1[0] + vx * t)) ** 2 + (cz - (a1[1] + vz * t)) ** 2;
      if (d < bd) { bd = d; best = [a1, a2, hw]; bt = t; }
    }
    if (!best) continue;
    const [a1, a2, hw] = best;
    if (Math.sqrt(bd) > hw + 5) continue;            // belongs to a street we did not dress
    const vx = a2[0] - a1[0], vz = a2[1] - a1[1], L = Math.hypot(vx, vz) || 1;
    const ux = vx / L, uz = vz / L;
    const ox = a1[0] + vx * bt, oz = a1[1] + vz * bt;
    const ang = Math.atan2(ux, uz) + Math.PI / 2;
    // WHAT KIND OF CROSSING, from the map (process.py element 4):
    //   0 unmarked -- nothing is painted, so paint nothing
    //   1 signalised -- LTA SDRE TMM4: TWO DOTTED WHITE BOUNDARY LINES and no
    //     bars, a 3m corridor (1.5m either side of the centreline), squares
    //     200mm with 300mm gaps. This is most of Orchard Road and Bras Basah.
    //   2 zebra -- the bars, which belong only on an UNSIGNALISED crossing
    const kind = c.length > 4 ? c[4] : 1;
    if (kind === 0) { sideCrossings++; continue; }
    if (kind === 2) {
      const bars = Math.max(3, Math.round(hw * 1.6));
      for (let k = -bars; k <= bars; k += 2) {
        if (claim('zebra', ox + ux * k * 0.42, oz + uz * k * 0.42, 0.5))
          zebra.push([ox + ux * k * 0.42, MARK.zebra, oz + uz * k * 0.42, ang, hw * 2]);
      }
    } else {
      // the two boundary lines, each a dotted run ACROSS the carriageway at
      // +/-1.5m of the crossing centre
      for (const side of [-1.5, 1.5]) {
        const bx = ox + ux * side, bz = oz + uz * side;
        const n = Math.max(4, Math.round((hw * 2) / 0.5));
        for (let k = 0; k < n; k++) {
          // 200mm square, 300mm gap = one mark per 500mm across the road
          const f = -hw + (k + 0.5) * ((hw * 2) / n);
          const px2 = bx - uz * f, pz2 = bz + ux * f;
          // SAME CLAIM KEY as the axis pass in main.js. Two different keys
          // meant the axis and the side streets could each paint the same
          // junction's boundary line, and 40 squares per crossing made every
          // one of those overlaps a coplanar pair (P6 11 -> 50).
          if (claim('xdot', px2, pz2, 0.44))
            dots.push([px2, MARK.dots, pz2, ang]);
        }
      }
    }
    sideCrossings++;
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const emit = (geo, mat, list, fn) => {
    list = dry(list);                     // kerbs and lamps are not built on water either
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((r, i) => { fn(r); m.compose(p, q, s); im.setMatrixAt(i, m); });
    im.castShadow = false; im.receiveShadow = true;
    world.add(im);
  };
  const yaw = (r) => { p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };
  emit(new THREE.BoxGeometry(0.38, 0.3, 4.0), MAT.kerb, kerb, yaw);

  // The signalised crossings' boundary squares: 200mm, flat, one instanced
  // mesh for the whole district. There are far more of these than zebras --
  // 416 signalised nodes against 33 zebras -- so this is now the marking a
  // rider meets at almost every junction.
  emitFlat(world, dots, 0.20, 0.20, WHITE);

  // one bar geometry, stretched per crossing to the width of its own road
  if (zebra.length) {
    zebra = dry(zebra);
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.62, 1), WHITE, zebra.length);
    zebra.forEach((r, i) => {
      p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]);
      e.set(-Math.PI / 2, r[3], 0, 'YXZ'); q.setFromEuler(e);
      s.set(1, r[4], 1);
      m.compose(p, q, s); im.setMatrixAt(i, m);
    });
    s.set(1, 1, 1);
    im.castShadow = false; im.receiveShadow = true;
    world.add(im);
  }
  // THE REAL LAMP POSTS.
  //
  // LTA publishes all 126,144 of them, so the position is surveyed and the only
  // thing left to work out is which way the arm points — over the nearest road,
  // which is what a street lamp is for. Done once for the district, not once per
  // axis, and only for lamps this pass has not already placed, so a region with
  // two axes does not get two lamps in every hole.
  if (!window.__lampsDone) {
    window.__lampsDone = true;
    // Its own spatial index. `__roadDirsNear` walks every road in the district
    // on every call, which is fine for the handful of things that used it and
    // is fifty million iterations across 2,669 lamps.
    const LC = 50, lgrid = new Map();
    for (const r of (data.roads || [])) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const a = r.p[i], c = r.p[i + 1];
        const mnx = Math.min(a[0], c[0]), mxx = Math.max(a[0], c[0]);
        const mnz = Math.min(a[1], c[1]), mxz = Math.max(a[1], c[1]);
        for (let cx = Math.floor((mnx - LC) / LC); cx <= Math.floor((mxx + LC) / LC); cx++)
          for (let cz = Math.floor((mnz - LC) / LC); cz <= Math.floor((mxz + LC) / LC); cz++) {
            const k = cx + ',' + cz;
            if (!lgrid.has(k)) lgrid.set(k, []);
            lgrid.get(k).push([a, c]);
          }
      }
    }
    const dirAt = (x, z) => {
      let best = null, bd = Infinity;
      const cx = Math.floor(x / LC), cz = Math.floor(z / LC);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        for (const [a, c] of lgrid.get((cx + i) + ',' + (cz + j)) || []) {
          const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1;
          const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
          const d = (x - (a[0] + dx * t)) ** 2 + (z - (a[1] + dz * t)) ** 2;
          if (d < bd) { bd = d; const L = Math.sqrt(l2); best = [dx / L, dz / L]; }
        }
      }
      return best;
    };
    for (const [lx, lz] of (data.lamps || [])) {
      // `blockedIn` is the parameter; `isBlocked` is an alias declared inside
      // the per-road loop and is not in scope out here.
      if (blockedIn(lx, lz)) continue;
      if (!claim('lamp', lx, lz, 3)) continue;
      // the arm reaches toward the carriageway: take the road direction here and
      // decide the side from which way the road actually lies
      const dir = dirAt(lx, lz);
      if (!dir) continue;
      const [ux2, uz2] = dir;
      const ang2 = Math.atan2(ux2, uz2);
      const nx2 = -uz2, nz2 = ux2;
      // whichever side of the lamp the road is on is the side the arm reaches
      const sgn2 = window.__onRoad && window.__onRoad(lx + nx2 * 4, lz + nz2 * 4, 0) ? -1 : 1;
      lamp.push([lx, 3.6, lz, ang2]);
      lampArm.push([lx - nx2 * 0.9 * sgn2, 7.0, lz - nz2 * 0.9 * sgn2, ang2, sgn2]);
    }
  }

  emit(new THREE.CylinderGeometry(0.09, 0.13, 7.2, 8), MAT.metal, lamp, yaw);
  emit(new THREE.BoxGeometry(0.9, 0.16, 0.4), MAT.trim, lampArm, (r) => {
    p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  const treeCount = trees.build(world);
  return { sideRoads: roads, sideSkipped: skipped, sideTrees: treeCount,
           sideKerbs: kerb.length, sideCrossings, sidewalkReal, sidewalkNone,
           sidePlates: plated.size,
           sideNames: [...new Set(chosen.map((r) => r.n))] };
}
