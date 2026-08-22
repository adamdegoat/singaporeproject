// STAGE 2 of the pack restyle (owner-approved direction, 2026-08-22):
// ground life along the walked paths — flower clumps, grass tufts, small
// plants scattered beside footway verges. Placement is fully deterministic
// from position hashes (no shared-RNG involvement), and every candidate
// passes the caller's blocked() guard plus the water/footprint chokepoint
// guards, the same rules every planting pass obeys.
import * as THREE from '../lib/three.module.js';
import { QGROUND } from './qground_data.js';

const geoCache = new Map();
function geoFor(name) {
  if (geoCache.has(name)) return geoCache.get(name);
  const d = QGROUND[name];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(d.c, 3));
  g.setIndex(d.i);
  g.computeVertexNormals();
  geoCache.set(name, g);
  return g;
}

const KINDS = [[0.30, 'grass', 0.5], [0.48, 'plant', 0.55], [0.66, 'flowerP', 0.55],
               [0.84, 'flowerG', 0.5], [1.01, 'flowerW', 0.5]];

// Walk the footway segments; every ~11m of arc, offset to one verge and, if
// every guard passes, place one clump. `blocked` is plantSurveyed's own
// blocked() (roads, buildings, water); the window guards cover the rest.
export function scatterVerges(world, trailSegs, blocked, groundAt) {
  const spots = [];
  let acc = 0;
  for (const [ax, az, bx, bz] of trailSegs) {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    let s = 11 - acc;
    for (; s <= L; s += 11) {
      const px = ax + ux * s, pz = az + uz * s;
      const h = (Math.imul(Math.round(px * 4) | 0, 0x9E3779B1)
               ^ Math.imul(Math.round(pz * 4) | 0, 0x85EBCA77)) >>> 0;
      const side = (h & 1) ? 1 : -1;
      const off = 1.5 + ((h >>> 3) % 90) / 100;      // 1.5 - 2.4m off the path
      const x = px - uz * side * off, z = pz + ux * side * off;
      if (blocked && blocked(x, z)) continue;
      if (window.__inWater && window.__inWater(x, z)) continue;
      if (window.__inFootprint && window.__inFootprint(x, z)) continue;
      if (window.__onRoad && window.__onRoad(x, z, 0.4)) continue;
      const r = ((h >>> 8) % 1000) / 1000;
      const [, kind, base] = KINDS.find(([p]) => r < p);
      spots.push([x, z, kind, base + ((h >>> 12) % 30) / 100, ((h >>> 5) % 628) / 100]);
    }
    acc = (acc + L) % 11;
  }
  const byKind = new Map();
  for (const sp of spots) {
    let a = byKind.get(sp[2]);
    if (!a) byKind.set(sp[2], a = []);
    a.push(sp);
  }
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  const q = new THREE.Quaternion(), sc = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let total = 0;
  for (const [kind, list] of byKind) {
    const inst = new THREE.InstancedMesh(geoFor(kind), mat, list.length);
    inst.castShadow = false;                    // ankle-high; a shadow costs more than it shows
    inst.userData.treeFoliage = true;           // low leafy card exemption, same mechanism
    list.forEach(([x, z, , s2, yaw], i) => {
      p.set(x, groundAt(x, z), z);
      q.setFromAxisAngle(up, yaw);
      sc.set(s2, s2, s2);
      m.compose(p, q, sc);
      inst.setMatrixAt(i, m);
    });
    world.add(inst);
    total += list.length;
  }
  return total;
}
