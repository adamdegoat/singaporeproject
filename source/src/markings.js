// Road markings and side-street dressing.
//
// Markings are what make tarmac read as a road rather than a grey plane, and
// they are almost free: flat instanced quads a few centimetres above the
// surface, all in two draw calls.
import * as THREE from '../lib/three.module.js';
import { R, rand, chance } from './tex.js';
import { MAT, groundAt } from './city.js';
import { claim } from './roads.js';

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

export function buildMarkings(world, axis, data = {}) {
  const pts = axis.p, half = axis.w / 2;
  const dash = [], edge = [], yellowL = [], stopL = [], arrowShaft = [], arrowHead = [];

  // Lane count from the map, not from a number we picked. OSM tags lanes on
  // just over half the roads here, so where it is tagged the dividers land
  // where the real ones do.
  let lanes = 0, tagged = 0;
  for (const r of (data.roads || [])) {
    if (!/orchard road/i.test(r.n || '') || !r.lanes) continue;
    lanes += r.lanes; tagged++;
  }
  const laneCount = tagged ? Math.max(2, Math.round(lanes / tagged)) : 6;
  // divider offsets: evenly split the carriageway by the real lane count
  const laneW = (half * 2) / laneCount;
  const dividers = [];
  for (let i = 1; i < laneCount; i++) {
    const off = -half + i * laneW;
    if (Math.abs(off) < 1.6) continue;     // that one is the median, not a divider
    dividers.push(off);
  }
  window.__laneCount = laneCount;

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
          dash.push([px + nx * off, 0.075, pz + nz * off, ang]);
        }
      }
      // solid white edge line just inside the kerb
      if (acc % 2 === 0) {
        for (const sgn of [-1, 1]) {
          edge.push([px + nx * (half - 0.55) * sgn, 0.075, pz + nz * (half - 0.55) * sgn, ang]);
        }
      }
      // double yellow along the kerb — no parking, and unmistakably local
      if (acc % 2 === 0) {
        for (const sgn of [-1, 1]) {
          yellowL.push([px + nx * (half - 0.12) * sgn, 0.078, pz + nz * (half - 0.12) * sgn, ang]);
          yellowL.push([px + nx * (half - 0.34) * sgn, 0.078, pz + nz * (half - 0.34) * sgn, ang]);
        }
      }
      // stop line and a straight-ahead arrow before each crossing
      if (acc % 190 === 24) {
        for (const sgn of [-1, 1]) {
          stopL.push([px + nx * (half * 0.5) * sgn, 0.08, pz + nz * (half * 0.5) * sgn, ang + Math.PI / 2]);
        }
      }
      if (acc % 190 === 60 || acc % 190 === 140) {
        const lanesMid = dividers.map((d, i) => d - laneW / 2)
          .concat([half - laneW / 2]);
        for (const off of lanesMid) {
          arrowShaft.push([px + nx * off, 0.08, pz + nz * off, ang]);
          arrowHead.push([px + nx * off + ux * 1.9, 0.08, pz + nz * off + uz * 1.9, ang]);
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
  const byName = new Map();
  for (const r of data.roads) {
    if (!r.n || /orchard road/i.test(r.n)) continue;
    if (r.k === 'footway' || r.k === 'pedestrian' || r.k === 'service') continue;
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
    for (const r of e.ways) {
      const mid = r.p[Math.floor(r.p.length / 2)];
      if (!near(mid[0], mid[1])) continue;
      out.push(r);
    }
  }
  return out;
}

export function dressSideStreets(world, data, axis, isBlocked, TreeField) {
  const trees = new TreeField();
  const kerb = [], lamp = [], lampArm = [];
  let roads = 0, skipped = 0;
  const segs = [];          // every dressed road segment, for matching crossings
  let sideCrossings = 0, sidewalkReal = 0, sidewalkNone = 0;

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

  const chosen = selectSideStreets(data, axis, REACH);
  skipped = data.roads.length - chosen.length;
  for (const r of chosen) {
    const pts = r.p, half = r.w / 2;
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
          const kx = px + nx * (half + 0.4) * sgn, kz = pz + nz * (half + 0.4) * sgn;
          if (!isBlocked(kx, kz) && claim('kerb', kx, kz)) kerb.push([kx, 0.15, kz, ang]);
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
      zebra.push([ox + ux * k * 0.42, 0.035, oz + uz * k * 0.42, ang, hw * 2]);
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
           sideKerbs: kerb.length, sideCrossings, sidewalkReal, sidewalkNone };
}
