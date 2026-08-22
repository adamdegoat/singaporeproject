// SKY TRIAL (?clouds=1): stylized low-poly clouds floating over the
// island — the Quaternius look the trees already wear, applied to the
// sky. TRIAL ONLY until the owner approves: the sky is in every frame,
// and mood is his call (the lighting-grade rule). Placement is a
// position-hashed grid, fully deterministic, no RNG streams touched.
import * as THREE from '../lib/three.module.js';
import { QSKY } from './qsky_data.js';

const hash2 = (x, z) => ((Math.imul(Math.round(x) | 0, 0x9E3779B1)
  ^ Math.imul(Math.round(z) | 0, 0x85EBCA77)) >>> 0);

export function buildClouds(world) {
  const kinds = ['cloudA', 'cloudB', 'cloudC'];
  const lists = { cloudA: [], cloudB: [], cloudC: [] };
  // the island envelope; 340m cells, ~40% occupied
  for (let x = -3200; x <= 1700; x += 340) {
    for (let z = 11400; z <= 14300; z += 340) {
      const h = hash2(x, z);
      if ((h % 10) >= 4) continue;
      const px = x + ((h >>> 4) % 240) - 120;
      const pz = z + ((h >>> 12) % 240) - 120;
      const py = 105 + ((h >>> 8) % 55);          // 105-160m up
      const kind = kinds[(h >>> 6) % 3];
      const sc = 26 + ((h >>> 16) % 26);          // 26-52m wide puffs
      lists[kind].push([px, py, pz, ((h >>> 3) % 628) / 100, sc]);
    }
  }
  const geoFor = (name) => {
    const d = QSKY[name];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
    g.setIndex(d.i);
    g.computeVertexNormals();
    return g;
  };
  // soft white, a touch emissive so the shadow side stays cloud-bright,
  // never fully opaque against the dome
  let total = 0;
  for (const kind of kinds) {
    const list = lists[kind];
    if (!list.length) continue;
    const mat = new THREE.MeshLambertMaterial({ color: 0xf4f6f8,
      emissive: 0x6a707a, transparent: true, opacity: 0.92 });
    const inst = new THREE.InstancedMesh(geoFor(kind), mat, list.length);
    inst.castShadow = false;                       // a 50m cloud shadow would
    const m = new THREE.Matrix4(), p = new THREE.Vector3();  // repaint the town
    const q = new THREE.Quaternion(), s = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    list.forEach(([x, y, z, yaw, sc], i) => {
      p.set(x, y, z);
      q.setFromAxisAngle(up, yaw);
      s.set(sc, sc * 0.5, sc);                     // flattened puffs
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
    });
    world.add(inst);
    total += list.length;
  }
  return total;
}
