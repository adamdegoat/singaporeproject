// The furniture that makes a Singapore street read as one: covered walkway,
// bus shelters, pedestrian railings, traffic lights, fascia signage, planters.
// Everything is instanced and placed by walking the street axis.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance } from './tex.js';
import { MAT } from './city.js';

const SIGN_COLS = [0xb5372e, 0x1f4f7a, 0xd6a53c, 0x2f6b4f, 0x7a3f6d, 0xcf6b3a, 0x2b2f33];

export function buildFurniture(world, axis, isBlocked) {
  const pts = axis.p, half = axis.w / 2;
  const railT = [], postT = [], shelterAt = [], lightAt = [], signT = [], planterT = [], binT = [];

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;
      for (const sgn of [-1, 1]) {
        const railOff = (half + 1.1) * sgn;
        const rx = px + nx * railOff, rz = pz + nz * railOff;

        // pedestrian railing along the kerb, in 2m bays with a post each end
        if (acc % 2 === 0 && !isBlocked(rx, rz)) {
          railT.push([rx, 1.0, rz, ang]);
          if (acc % 4 === 0) postT.push([rx, 0.55, rz, ang]);
        }
        // bus shelters
        if (acc % 260 === 120) {
          const sx = px + nx * (half + 5.6) * sgn, sz = pz + nz * (half + 5.6) * sgn;
          if (!isBlocked(sx, sz)) shelterAt.push([sx, sz, ang, sgn]);
        }
        // traffic light heads at intervals, facing oncoming traffic
        if (acc % 190 === 30) {
          const lx = px + nx * (half + 1.6) * sgn, lz = pz + nz * (half + 1.6) * sgn;
          if (!isBlocked(lx, lz)) lightAt.push([lx, lz, ang, sgn, acc]);
        }
        // planters and bins
        if (acc % 46 === 12) {
          const qx = px + nx * (half + 6.4) * sgn, qz = pz + nz * (half + 6.4) * sgn;
          if (!isBlocked(qx, qz)) planterT.push([qx, 0.32, qz, ang]);
        }
        if (acc % 120 === 60) {
          const bx = px + nx * (half + 4.2) * sgn, bz = pz + nz * (half + 4.2) * sgn;
          if (!isBlocked(bx, bz)) binT.push([bx, 0.46, bz, ang]);
        }
        // fascia sign boxes above the shopfront line, facing the street
        if (acc % 26 === 8) {
          const gx = px + nx * (half + 12.5) * sgn, gz = pz + nz * (half + 12.5) * sgn;
          if (isBlocked(gx, gz)) {
            signT.push([px + nx * (half + 11.4) * sgn, rand(6.2, 7.6),
                        pz + nz * (half + 11.4) * sgn, ang, sgn]);
          }
        }
      }
    }
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const emit = (geo, mat, list, fn, colFn) => {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((rec, i) => {
      fn(rec); m.compose(p, q, s); im.setMatrixAt(i, m);
      if (colFn) im.setColorAt(i, colFn(rec, i));
    });
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = true; im.receiveShadow = true;
    world.add(im);
    return im;
  };
  const yaw = (r) => { p.set(r[0], r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };

  // railing: a top rail and a lower rail, the classic grey tube barrier
  emit(new THREE.BoxGeometry(0.06, 0.05, 2.0), MAT.metal, railT, yaw);
  emit(new THREE.BoxGeometry(0.05, 0.04, 2.0), MAT.metal, railT, (r) => {
    p.set(r[0], 0.62, r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  emit(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 6), MAT.metal, postT, yaw);

  // planters and bins
  emit(new THREE.CylinderGeometry(0.55, 0.46, 0.64, 10), MAT.conc, planterT, yaw);
  emit(new THREE.SphereGeometry(0.52, 8, 6), MAT.canopy, planterT, (r) => {
    p.set(r[0], 0.86, r[2]); q.identity();
  });
  emit(new THREE.CylinderGeometry(0.24, 0.2, 0.9, 8), MAT.darkMetal, binT, yaw);

  // fascia signage: colour blocks over the shopfront, no brand marks
  const cc = new THREE.Color();
  emit(new THREE.BoxGeometry(0.28, 1.05, 2.6),
    new THREE.MeshStandardMaterial({ roughness: 0.55 }), signT,
    (r) => { p.set(r[0], r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); },
    () => cc.setHex(pick(SIGN_COLS)));

  // bus shelters
  for (const [sx, sz, ang, sgn] of shelterAt) {
    const g = new THREE.Group();
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 3.1), MAT.trim);
    roof.position.y = 3.0; roof.castShadow = true; g.add(roof);
    for (let k = 0; k < 4; k++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 8), MAT.metal);
      post.position.set(-4.1 + k * 2.7, 1.5, 1.35); post.castShadow = true; g.add(post);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.7, 0.08), MAT.glass);
    back.position.set(0, 1.95, -1.4); g.add(back);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.09, 0.46), MAT.metal);
    bench.position.set(0, 0.62, -1.1); bench.castShadow = true; g.add(bench);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x27313a, roughness: 0.3 }));
    panel.position.set(4.4, 1.7, -1.0); g.add(panel);
    g.position.set(sx, 0, sz); g.rotation.y = ang;
    world.add(g);
  }

  // traffic lights. Each junction shares one signal state, keyed by its
  // distance along the street, so vehicles can look it up.
  const signals = new Map();     // arclength -> {lenses:[red,amber,green], phase}
  for (const [lx, lz, ang, sgn, atS] of lightAt) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 5.4, 8), MAT.darkMetal);
    pole.position.y = 2.7; pole.castShadow = true; g.add(pole);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 6), MAT.darkMetal);
    arm.position.set(-1.5 * sgn, 5.2, 0); arm.rotation.z = Math.PI / 2; arm.castShadow = true; g.add(arm);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.86, 0.3), MAT.darkMetal);
    box.position.set(-2.9 * sgn, 4.9, 0); box.castShadow = true; g.add(box);
    const lenses = [];
    for (let k = 0; k < 3; k++) {
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10),
        new THREE.MeshStandardMaterial({
          color: [0x5a1f18, 0x5a441a, 0x1b3f27][k],
          emissive: 0x000000, emissiveIntensity: 1.0,
        }));
      lens.position.set(-2.9 * sgn, 5.18 - k * 0.27, 0.16);
      g.add(lens);
      lenses.push(lens);
    }
    g.position.set(lx, 0, lz); g.rotation.y = ang;
    world.add(g);

    if (!signals.has(atS)) signals.set(atS, { s: atS, lenses: [], phase: signals.size * 5.5 });
    signals.get(atS).lenses.push(lenses);
  }

  // covered walkway: continuous roof on slim columns, set at the shopfront line
  const linkPost = [], linkRoof = [], linkBeam = [];
  let acc2 = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);
    for (let t = 0; t < len; t += 1, acc2++) {
      if (acc2 % 4 !== 0) continue;
      const px = x1 + ux * t, pz = z1 + uz * t;
      for (const sgn of [-1, 1]) {
        const cxp = px + nx * (half + 9.0) * sgn, czp = pz + nz * (half + 9.0) * sgn;
        // only where there is actually a frontage to walk along
        if (!isBlocked(px + nx * (half + 13.5) * sgn, pz + nz * (half + 13.5) * sgn)) continue;
        linkRoof.push([cxp, 3.35, czp, ang]);
        linkBeam.push([cxp, 3.12, czp, ang]);
        linkPost.push([cxp + nx * 1.5 * sgn, 1.6, czp + nz * 1.5 * sgn, ang]);
        linkPost.push([cxp - nx * 1.5 * sgn, 1.6, czp - nz * 1.5 * sgn, ang]);
      }
    }
  }
  emit(new THREE.BoxGeometry(3.4, 0.13, 4.1), MAT.trim, linkRoof, yaw);
  emit(new THREE.BoxGeometry(0.18, 0.22, 4.1), MAT.metal, linkBeam, yaw);
  emit(new THREE.CylinderGeometry(0.075, 0.075, 3.2, 8), MAT.metal, linkPost, yaw);

  const signalList = [...signals.values()];

  return {
    signals: signalList,
    linkway: linkRoof.length,
    rails: railT.length, shelters: shelterAt.length,
    lights: lightAt.length, signs: signT.length, planters: planterT.length,
  };
}
