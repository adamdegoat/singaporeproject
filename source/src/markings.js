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
  zebra: ROAD_Y + 0.020, dash: ROAD_Y + 0.026, yellow: ROAD_Y + 0.032,
  edge: ROAD_Y + 0.038, stop: ROAD_Y + 0.044, arrow: ROAD_Y + 0.050,
  arrowHead: ROAD_Y + 0.056,
};

const WHITE = new THREE.MeshStandardMaterial({ color: 0xdedad0, roughness: 0.86 });
const YELLOW = new THREE.MeshStandardMaterial({ color: 0xd6ae44, roughness: 0.86 });

function emitFlat(world, list, w, l, mat) {
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

export function buildMarkings(world, axis, data = {}) {
  const pts = axis.p, half = axis.w / 2;
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

      // dashed lane dividers: 3m mark, 6m gap, at the real lane positions
      if (acc % 9 < 3) {
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
  n += emitFlat(world, dash, 0.14, 1.0, WHITE);
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
          if (acc % 96 === 0 && !isBlocked(kx, kz) && claim('lamp', kx, kz, 6)) {
            lamp.push([kx, 3.6, kz, ang]);
            lampArm.push([kx - nx * 0.9 * sgn, 7.0, kz - nz * 0.9 * sgn, ang, sgn]);
          }
        }
      }
    }
  }

  // OSM maps a node for every pedestrian crossing in the district, and only the
  // 35 on Orchard Road itself were being used. The other 465 are on the streets
  // running off it, which is exactly where you meet them when you turn a corner.
  const zebra = [];
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
    const bars = Math.max(3, Math.round(hw * 1.6));
    for (let k = -bars; k <= bars; k += 2) {
      if (claim('zebra', ox + ux * k * 0.42, oz + uz * k * 0.42, 0.5))
        zebra.push([ox + ux * k * 0.42, MARK.zebra, oz + uz * k * 0.42, ang, hw * 2]);
    }
    sideCrossings++;
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const emit = (geo, mat, list, fn) => {
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((r, i) => { fn(r); m.compose(p, q, s); im.setMatrixAt(i, m); });
    im.castShadow = false; im.receiveShadow = true;
    world.add(im);
  };
  const yaw = (r) => { p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };
  emit(new THREE.BoxGeometry(0.38, 0.3, 4.0), MAT.kerb, kerb, yaw);

  // one bar geometry, stretched per crossing to the width of its own road
  if (zebra.length) {
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
