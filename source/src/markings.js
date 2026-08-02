// Road markings and side-street dressing.
//
// Markings are what make tarmac read as a road rather than a grey plane, and
// they are almost free: flat instanced quads a few centimetres above the
// surface, all in two draw calls.
import * as THREE from '../lib/three.module.js';
import { R, rand, chance } from './tex.js';
// surfaceAt as well as groundAt. This file's own note says a bridge deck "would
// need the same treatment threaded through four placement paths", and that was
// true when it was written — surfaceAt() is exported now and answers both the
// 6cm road offset and the deck in one call, so the threading is an import.
import { MAT, groundAt, surfaceAt } from './city.js';
import { claim } from './roads.js';
import { texStreetName, plateTaken } from './wayfind.js';

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
    p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
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


// Distance from a point to its own named street versus to any other named
// street, by segment -- the measure S2 uses. Built once per call over the
// road list, which is a few hundred plates against a few thousand segments and
// costs nothing next to the dressing itself.
function nearerOtherStreet(data, name, x, z) {
  let own = Infinity, other = Infinity;
  for (const r of (data.roads || [])) {
    const n = r.n;
    if (!n) continue;
    const mine = n === name;
    const cur = mine ? own : other;
    for (let i = 0; i < r.p.length - 1; i++) {
      const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const d = (x - (x1 + vx * t)) ** 2 + (z - (z1 + vz * t)) ** 2;
      if (mine) { if (d < own) own = d; }
      else if (d < other) other = d;
    }
  }
  return other < own;
}


// Drop props sitting within `lim` metres of one already kept, checking the 3x3
// cell neighbourhood so a pair straddling a cell boundary cannot slip through.
export function dedupeProps(list, lim) {
  const CELL = Math.max(0.4, lim), L2 = lim * lim, grid = new Map(), out = [];
  for (const r of list) {
    const cx = Math.round(r[0] / CELL), cz = Math.round(r[2] / CELL);
    let dup = false;
    for (let dx = -1; dx <= 1 && !dup; dx++)
      for (let dz = -1; dz <= 1 && !dup; dz++) {
        const l2 = grid.get((cx + dx) + ',' + (cz + dz));
        if (!l2) continue;
        for (const q of l2)
          if ((q[0] - r[0]) ** 2 + (q[1] - r[2]) ** 2 < L2) { dup = true; break; }
      }
    if (dup) continue;
    const k = cx + ',' + cz;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push([r[0], r[2]]);
    out.push(r);
  }
  return out;
}

export function buildMarkings(world, axis, data = {}) {
  const pts = axis.p;
  const widthAt = widthProbe(axis, data);
  let half = axis.w / 2;
  const dash = [], edge = [], yellowL = [], stopL = [], arrowShaft = [], arrowHead = [];

  // A LANE LINE STOPS AT THE JUNCTION MOUTH.
  //
  // The dashes and the edge line were emitted every few metres along the whole
  // axis with nothing to say about junctions, so at every crossroads the axis
  // painted its lane lines straight across the other street's carriageway and
  // the other street painted its centre line back — a grid of white dashes
  // filling the junction box, which is not how any Singapore junction is
  // marked. Bras Basah Road at the Victoria Street junction is the clearest
  // frame of it.
  //
  // The double yellows and the side-street centre lines were fixed for exactly
  // this in the streetRuns rewrite (city.js) and this emitter was missed
  // because it walks the axis directly instead of going through runs.
  //
  // -0.6m of margin: strictly INSIDE the other carriageway, so a mark merely
  // touching a kerb line at a tangent junction is not suppressed.
  const axisName = (axis.n || '').toLowerCase();
  // A JUNCTION IS WHERE A ROAD CROSSES YOU, not where one overlaps you.
  //
  // The first version asked `__onRoad(x, z, -0.6, axisName)` — "is this mark
  // inside some other street's carriageway" — and the counter below said it
  // dropped 80% of Bras Basah Road's lane marks and 68% of Orchard's. That is
  // not a junction rule, it is a description of how OSM maps an arterial:
  // slip roads, bus-lane ways, service roads and unnamed fragments run
  // alongside and overlap the axis for its whole length, and every one of them
  // is "some other street". The number is what caught it — the frame looked
  // fine because a street with no lane lines still looks like a street.
  //
  // So: find where other carriageways actually CROSS the axis, once, and break
  // only within the crossing street's own half-width of those points. Angle
  // gate of 25 degrees so a way running parallel is never a junction.
  const JX = [];
  {
    const A = axis.p;
    const CELL = 60, agrid = new Map();
    for (let i = 0; i < A.length - 1; i++) {
      const x0 = Math.min(A[i][0], A[i + 1][0]), x1 = Math.max(A[i][0], A[i + 1][0]);
      const z0 = Math.min(A[i][1], A[i + 1][1]), z1 = Math.max(A[i][1], A[i + 1][1]);
      for (let gx = Math.floor(x0 / CELL); gx <= Math.floor(x1 / CELL); gx++) {
        for (let gz = Math.floor(z0 / CELL); gz <= Math.floor(z1 / CELL); gz++) {
          const k = gx + ',' + gz;
          let l = agrid.get(k); if (!l) { l = []; agrid.set(k, l); }
          l.push(i);
        }
      }
    }
    const seg = (ax, az, bx, bz, cx, cz, dx2, dz2) => {
      const r1 = bx - ax, r2 = bz - az, s1 = dx2 - cx, s2 = dz2 - cz;
      const den = r1 * s2 - r2 * s1;
      if (Math.abs(den) < 1e-9) return null;              // parallel
      const t = ((cx - ax) * s2 - (cz - az) * s1) / den;
      const u = ((cx - ax) * r2 - (cz - az) * r1) / den;
      if (t < 0 || t > 1 || u < 0 || u > 1) return null;
      // angle between them; a way that merely grazes the axis is not a junction
      const l1 = Math.hypot(r1, r2) || 1, l2 = Math.hypot(s1, s2) || 1;
      const cos = Math.abs((r1 * s1 + r2 * s2) / (l1 * l2));
      if (cos > 0.906) return null;                       // within 25 degrees
      return [ax + r1 * t, az + r2 * t];
    };
    for (const r of (data.roads || [])) {
      if (!r.p || r.p.length < 2) continue;
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      if ((r.n || '').toLowerCase() === axisName) continue;
      const rad = Math.max(3.5, (r.w || 6) / 2 + 1.0);
      for (let j = 0; j < r.p.length - 1; j++) {
        const c = r.p[j], d = r.p[j + 1];
        const gx0 = Math.floor(Math.min(c[0], d[0]) / CELL), gx1 = Math.floor(Math.max(c[0], d[0]) / CELL);
        const gz0 = Math.floor(Math.min(c[1], d[1]) / CELL), gz1 = Math.floor(Math.max(c[1], d[1]) / CELL);
        for (let gx = gx0; gx <= gx1; gx++) {
          for (let gz = gz0; gz <= gz1; gz++) {
            for (const i of (agrid.get(gx + ',' + gz) || [])) {
              const hit = seg(A[i][0], A[i][1], A[i + 1][0], A[i + 1][1], c[0], c[1], d[0], d[1]);
              if (hit) JX.push([hit[0], hit[1], rad * rad]);
            }
          }
        }
      }
    }
  }
  // COUNTED, not silent. A break that quietly ate half the street's lane lines
  // would look like a rendering bug and read like a design decision, so the
  // number goes on the console beside the mark total.
  let junctionBreaks = 0, junctionCandidates = 0;
  const inJunction = (x, z) => {
    junctionCandidates++;
    for (const [jx, jz, r2] of JX) {
      const dx2 = x - jx, dz2 = z - jz;
      if (dx2 * dx2 + dz2 * dz2 < r2) { junctionBreaks++; return true; }
    }
    return false;
  };

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
      // LTA SDRE Ch.8 Type B, the standard lane line on every non-expressway
      // road: **100mm wide, 2m MARK, 4m GAP** (RMS1, figures pixel-verified
      // against the sheet by the 2026-07-29 research pass). This block once
      // drew 3m/6m, was then "fixed" to 4m mark / 2m gap — which is Type C,
      // the INVERTED pattern LTA reserves for signalised junction approaches
      // ("generally 7 to 10 markings" before the stop line) — so every street
      // carried the junction-approach line down its whole length. The most
      // repeated marking in the district has now been wrong in both
      // directions; the figures above are from the published sheet, not from
      // memory. (Type B1, 2m/10m, is expressway only and we have none.)
      if (acc % 6 < 2) {
        for (const off of dividers) {
          const dx2 = px + nx * off, dz2 = pz + nz * off;
          if (inJunction(dx2, dz2)) continue;
          if (claim('dash', dx2, dz2, 1.2))
            dash.push([dx2, MARK.dash, dz2, ang]);
        }
      }
      // solid white edge line just inside the kerb
      if (acc % 2 === 0) {
        for (const sgn of [-1, 1]) {
          const ex2 = px + nx * (half - 0.55) * sgn, ez2 = pz + nz * (half - 0.55) * sgn;
          if (inJunction(ex2, ez2)) continue;
          if (claim('edge', ex2, ez2, 1.2))
            edge.push([ex2, MARK.edge, ez2, ang]);
        }
      }
      // The kerbside double yellow is NOT painted here any more. Since
      // 2026-07-29 the streetRuns ribbons in city.js own the yellows on
      // EVERY street including the axes — junction-broken and verified
      // against the road index — and both systems painted the axis kerbs
      // at the identical 0.087, which z-fought as a stipple across ~28
      // frames of the Orchard sweep. Two systems, one fact: the ribbons
      // won. (yellowL stays declared for anything else that emits it.)
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
  if (junctionBreaks) {
    console.log(`  markings ${axis.n || '?'}: ${n} marks, ${junctionBreaks} of `
      + `${junctionCandidates} lane marks dropped at junction mouths `
      + `(${(100 * junctionBreaks / junctionCandidates).toFixed(0)}%)`);
  }
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
// ASYNC, AND IT PAUSES BETWEEN STREETS. This dresses every side street in the
// district with kerbs, lamps, trees, crossings and name plates, and it did all
// of them in one go. Instrumenting the yield helper to record the longest gap
// between pauses in each build phase put THIS phase at 502ms — by far the worst
// single freeze in the world, and the actual cause of the "first ten seconds
// lag". Four other phases were optimised before this one was identified, which
// is what guessing costs.
//
// Y is optional so the boot-time call, which happens behind the loading screen,
// is unaffected.
const LAMPS_DONE = new WeakSet();

export async function dressSideStreets(world, data, axis, blockedIn, TreeField, done = null, reachOverride = 0, Y = null) {
  const trees = new TreeField();
  const kerb = [], lamp = [], lampArm = [];
  let roads = 0, skipped = 0;
  const segs = [];          // every dressed road segment, for matching crossings
  let sideCrossings = 0, sidewalkReal = 0, sidewalkNone = 0;
  const plated = new Set();

  // HOW FAR FROM THE ROUTE THE WORLD GETS DRESSED.
  //
  // Set to 230m when the full district's 46.8km of side street produced 23,000
  // kerbs and 2,100 trees and cost too much. Everything about that calculation
  // has since changed: kerbs, lamps, trees and furniture are all instanced,
  // consolidate.js batches per tile, and on 2026-07-29 the terrain and road
  // surfaces were tiled too, so distant dressing frustum-culls instead of
  // being submitted from everywhere.
  //
  // Measured 2026-07-29 at 230m: only 34% of Orchard's carriageway, 42% of
  // Bras Basah's and 33% of Marina Bay's is dressed -- about 105km of street
  // in the three districts has no kerb, lamp, tree or sign on it at all.
  //
  // `?reach=N` overrides it so the cost curve can be MEASURED rather than
  // guessed, which is how the number should have been chosen the first time.
  // 1200m DRESSES THE WHOLE DISTRICT -- measured, 100% of Orchard's and Bras
  // Basah's carriageway and 99% of Marina Bay's, against 34/42/33% at 230m.
  //
  // The cost, measured at the street sweep's heaviest view rather than
  // guessed: triangles 2.75M -> 3.47M (+26%), and DRAW CALLS 899 -> 906, which
  // is the number that matters and barely moves. That is the whole argument:
  // the 230m cap dates from before kerbs, lamps, trees and furniture were
  // instanced, before consolidate.js batched per tile, and before the terrain
  // and road surfaces were tiled -- so distant dressing now culls instead of
  // being submitted from every camera in the world.
  // `reachOverride` lets the caller dress the near streets first and the rest
  // after the first frame -- see the deferred pass in main.js.
  const REACH = reachOverride
    || +(new URLSearchParams(location.search).get('reach')) || 1200;
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
  let _dt = performance.now();
  for (const r of chosen) {
    if (Y && performance.now() - _dt > 6) { await Y(); _dt = performance.now(); }
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
        // A PLATE MUST BE NEARER ITS OWN STREET THAN ANY OTHER, measured the
        // way S2 measures it.
        //
        // The guard here asked window.__nearestStreet, which answers a
        // different question from S2's -- and the two disagreed on exactly the
        // streets you would expect: parallel dual-carriageway pairs. Eu Tong
        // Sen Street's plate stood 19m from Eu Tong Sen and 10m from New
        // Bridge Road; likewise Raffles Quay against Telegraph Street and
        // Shenton Way against Boon Tat Street. Two measures of one fact is the
        // most repeated bug in this project, so this now computes the same
        // distance S2 does and cannot disagree with it.
        if (nearerOtherStreet(data, r.n, sx, sz)) continue;
        // see plateTaken() in wayfind.js: `plated` above is local to this
        // call, so a street reached from two chunks was plated twice
        if (plateTaken(r.n, sx, sz)) continue;
        const g = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), MAT.metal);
        pole.position.y = 1.3; g.add(pole);
        // TWO BACK-TO-BACK FACES, not one DoubleSide plane.
        //
        // A DoubleSide plane shows the SAME texture from behind, which means
        // mirrored lettering -- so every name plate in the world read
        // backwards from one side, and with the dressing reach raised there
        // are now 288 of them. A real plate is printed on both faces. Found by
        // riding Tew Chew Street, which no camera had ever visited.
        for (const face of [1, -1]) {
          const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.38),
            new THREE.MeshBasicMaterial({ map: texStreetName(r.n) }));
          plate.position.set(0, 2.5, 0.012 * face);
          if (face < 0) plate.rotation.y = Math.PI;
          g.add(plate);
        }
        g.position.set(sx, surfaceAt(sx, sz), sz);
        g.rotation.y = Math.atan2(u0x, u0z) + Math.PI / 2;
        world.add(g);
        (window.__signage = window.__signage || [])
          .push({ kind: 'plate', x: sx, z: sz, text: r.n, obj: g });
        plated.add(r.n);
        break outer;
      }
    }
    if (sw) sidewalkReal++;
    if (!doLeft && !doRight) sidewalkNone++;

    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      // AND INSIDE THE STREET, not only between streets. The budget check at
      // the top of the loop cannot help when a SINGLE street costs 200ms — and
      // one long street does, because every four metres of it plants kerbs,
      // lamps, trees and crossings down both sides. Measured while RIDING (the
      // test that sits still says this phase is fine, which is how it was
      // declared fixed twice), `side` was still freezing for 202ms.
      if (Y && performance.now() - _dt > 6) { await Y(); _dt = performance.now(); }
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
      // CLAIM THE CROSSING, NOT EACH SQUARE.
      //
      // Claiming per square with a 0.44m cell thinned the lines at RANDOM --
      // `claim` is a grid hash, so two squares 0.5m apart sometimes land in
      // one cell and one is dropped. A dotted line with holes punched in it
      // at irregular intervals reads as scatter across the tarmac, which is
      // exactly what a junction looked like. The line is already regularly
      // spaced by construction; the only thing claim is needed for is to stop
      // the axis pass and the side-street pass both painting one crossing.
      if (!claim('xing', ox, oz, 4.0)) { sideCrossings++; continue; }
      // the two boundary lines, each a dotted run ACROSS the carriageway at
      // +/-1.5m of the crossing centre
      for (const side of [-1.5, 1.5]) {
        const bx = ox + ux * side, bz = oz + uz * side;
        const n = Math.max(4, Math.round((hw * 2) / 0.5));
        for (let k = 0; k < n; k++) {
          // 200mm square, 300mm gap = one mark per 500mm across the road
          const f = -hw + (k + 0.5) * ((hw * 2) / n);
          const px2 = bx - uz * f, pz2 = bz + ux * f;
          dots.push([px2, MARK.dots, pz2, ang]);
        }
      }
    }
    sideCrossings++;
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  // `name` is optional and exists so a CHECK can find a thing by IDENTITY
  // rather than by geometry signature. C3 ("streets with no lighting") matched
  // lamps as `CylinderGeometry(0.11,9)` / `BoxGeometry(0.9,0.16,0.4)`, which
  // works only while the mesh still carries its parameters — the streamed
  // district path runs consolidate, the LOD compactor and a material dedupe
  // over its group, and a merged mesh has no parameters left. This is the
  // fifth geometry-signature allowlist in this project to rot the same way.
  const emit = (geo, mat, list, fn, name) => {
    list = dry(list);                     // kerbs and lamps are not built on water either
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((r, i) => { fn(r); m.compose(p, q, s); im.setMatrixAt(i, m); });
    im.castShadow = false; im.receiveShadow = true;
    if (name) im.name = name;
    world.add(im);
  };
  const yaw = (r) => { p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };
  // DEDUPE KERBS BEFORE EMITTING. With the dressing reach raised to cover the
  // whole district, three times as many streets are kerbed and every junction
  // where two of them meet can lay two kerbs on one spot. `claim` cannot stop
  // it: it is a single-cell hash, so a pair either side of a cell boundary
  // both survive. P4 counts identical props within 60cm, so this measures the
  // same 60cm, over the 3x3 neighbourhood.
  // ...and NO KERB STANDS IN A TRAFFIC LANE. A side street's kerb run
  // reaches its centreline node, which at a junction is inside the MAIN
  // road's carriageway (the last Grange Road bar, sweep-2 frame 207). The
  // -0.35 margin shrinks the road for the test, so kerbs sitting on the
  // legitimate edge stay; only pieces genuinely in a lane are dropped.
  // centre AND both ends: the surviving Grange bar had its centre 25cm
  // outside the shrunken road while its 4m body crossed into the lane
  const kerbClear = kerb.filter((r) => {
    if (!window.__onRoad) return true;
    for (const off of [0, 1.9, -1.9]) {
      if (window.__onRoad(r[0] + Math.sin(r[3]) * off, r[2] + Math.cos(r[3]) * off, -0.3)) return false;
    }
    return true;
  });
  emit(new THREE.BoxGeometry(0.38, 0.3, 4.0), MAT.kerb, dedupeProps(kerbClear, 0.6), yaw);

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
      p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
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
  // ONCE PER DISTRICT, WHICH IS WHAT THE COMMENT ABOVE ALWAYS SAID AND WHAT
  // THE FLAG NEVER DID.
  //
  // `window.__lampsDone` was a single global boolean, so the FIRST district to
  // dress the world consumed it and every other district was skipped — with
  // its own `data.lamps` never read. Measured 2026-08-02: orchard placed its
  // 1,839 lamps at boot and the other fourteen districts placed NONE, leaving
  // 8,282 surveyed lamp positions unbuilt and every street outside Orchard
  // unlit. It stayed hidden because the world scene's C3 only measures streets
  // within 230m of the PRIMARY axis — Orchard Road — so the one district that
  // did get lamps was the only one ever checked.
  //
  // Keyed on the data object rather than a district id: buildRegion calls this
  // once PER AXIS with the same chunk, which is the double-lamp case the
  // original guard existed to stop, and addChunk calls it once per district
  // with a different chunk each time. One WeakSet answers both.
  if (!LAMPS_DONE.has(data)) {
    LAMPS_DONE.add(data);
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
    // Every street lamp in the district in one pass. LTA publishes 126,144 lamp
    // posts island-wide and a district's share is thousands, each doing a grid
    // lookup plus a road test — the last unbroken block in this phase, which is
    // why `side` still froze for 199ms after the street loop was already
    // pausing.
    let _lt = performance.now();
    for (const [lx, lz] of (data.lamps || [])) {
      if (Y && performance.now() - _lt > 6) { await Y(); _lt = performance.now(); }
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
      let sgn2 = window.__onRoad && window.__onRoad(lx + nx2 * 4, lz + nz2 * 4, 0) ? -1 : 1;
      // AND THE ARM HAS TO STAND CLEAR TOO. Only the POST was ever tested for
      // clearance; the arm was then offset 0.9m and whatever it hit, it hit.
      // With lamps building in all fifteen districts instead of one, that put
      // four luminaires inside facades — Pacific Plaza, Farrer Square, the SMU
      // law library — which P2 caught. Try the other side before giving up,
      // and drop the lamp entirely if neither side is clear: a post with its
      // luminaire buried in a wall is worse than no post.
      const armClear = (sg) => !blockedIn(lx - nx2 * 0.9 * sg, lz - nz2 * 0.9 * sg);
      if (!armClear(sgn2)) {
        if (armClear(-sgn2)) sgn2 = -sgn2;
        else continue;
      }
      lamp.push([lx, 3.6, lz, ang2]);
      // the arm grounds at the POLE (lx, lz), not at its own offset — the
      // Leonie Hill floating-luminaire class
      lampArm.push([lx - nx2 * 0.9 * sgn2, 7.0, lz - nz2 * 0.9 * sgn2, ang2, sgn2, lx, lz]);
    }
  }

  emit(new THREE.CylinderGeometry(0.09, 0.13, 7.2, 8), MAT.metal, lamp, yaw, 'streetLamp');
  emit(new THREE.BoxGeometry(0.9, 0.16, 0.4), MAT.trim, lampArm, (r) => {
    p.set(r[0], surfaceAt(r[5], r[6]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  }, 'streetLamp');
  const treeCount = trees.build(world);
  return { sideRoads: roads, sideSkipped: skipped, sideTrees: treeCount,
           sideKerbs: kerb.length, sideCrossings, sidewalkReal, sidewalkNone,
           sidePlates: plated.size,
           sideNames: [...new Set(chosen.map((r) => r.n))] };
}
