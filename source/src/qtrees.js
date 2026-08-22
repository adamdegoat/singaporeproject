// TRIAL: Quaternius pack trees behind ?qtrees=1 (owner decision pending,
// 2026-08-22 — "pic 2 is awesome"). Replaces the procedural trunk/blob/card
// draw with instanced whole-tree meshes; placement, guards and the RNG
// stream are untouched (TreeField._tree still runs in full — only what is
// ADDED to the world differs), so with the flag off the world is
// byte-identical and no golden can move.
import * as THREE from '../lib/three.module.js';
import { QTREES } from './qtrees_data.js';

const geoCache = new Map();
function geoFor(name) {
  if (geoCache.has(name)) return geoCache.get(name);
  const d = QTREES[name];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(d.c, 3));
  g.setIndex(d.i);
  g.computeVertexNormals();
  geoCache.set(name, g);
  return g;
}

// deterministic type from position — no RNG stream involvement. Near a
// carriageway only types whose lowest green vertex clears the 4.8m traffic
// envelope at this height are allowed (the procedural trees got the same
// rule as a 6m crown lift — a double-decker is 4.3m).
// plain-color models only: the UV-atlas ones (normal/palmA/palmB) bake to
// shattered white crowns — vertex-point sampling lands on the atlas
// background between colour islands. Fix is face-centroid sampling; until
// then the four solid models + footprint jitter carry the variety.
const MIX = [[0.35, 'round'], [0.60, 'common'], [0.85, 'tall'], [1.01, 'palm']];
function typeAt(x, z, low, h) {
  if (low) return 'bush';                     // undergrowth: 120-tri round bush
  const hs = (Math.imul(Math.round(x * 4) | 0, 0x9E3779B1)
            ^ Math.imul(Math.round(z * 4) | 0, 0x85EBCA77)) >>> 0;
  const r = (hs % 1000) / 1000;
  let t = MIX.find(([p]) => r < p)[1];
  const nearRoad = typeof window !== 'undefined' && window.__onRoad
    && window.__onRoad(x, z, 6);
  if (nearRoad && QTREES[t].gm * h < 4.8) {
    // walk the mix for the first type that clears; 'common' (gm .573) always
    // does at street heights, so this cannot fail to land
    for (const [, name] of MIX) {
      if (QTREES[name].gm * h >= 4.8) { t = name; break; }
    }
  }
  return t;
}

export function buildQTrees(world, items, terrainAt) {
  const byType = new Map();
  for (const [x, z, scale, low] of items) {
    const h = (13.5 + ((Math.imul(Math.round(x * 8) | 0, 0x85EBCA77) >>> 0) % 40) / 10) * scale;
    const t = typeAt(x, z, low, h);
    if (!t) continue;
    let a = byType.get(t);
    if (!a) byType.set(t, a = []);
    a.push([x, z, scale, low]);
  }
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  const q = new THREE.Quaternion(), s = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let total = 0;
  for (const [t, list] of byType) {
    const inst = new THREE.InstancedMesh(geoFor(t), mat, list.length);
    inst.castShadow = true;
    inst.userData.treeTrunk = true;
    inst.userData.treeFoliage = true;
    list.forEach(([x, z, scale, low], i) => {
      const gy = terrainAt(x, z);
      // unit-height model; match the procedural sizing band (13-17.5m).
      // UNDERGROWTH IS A BUSH, NOT A MINI TREE: drawn at tree proportions a
      // kerb-side bush (which the looser road rule legally allows at the
      // edge) read as "trees in middle of road" — the owner's 2026-08-22
      // report from his phone. Bushes hug the ground the way the old
      // procedural undergrowth did.
      const h = low
        ? 1.1 + 3.4 * scale
        : (13.5 + ((Math.imul(Math.round(x * 8) | 0, 0x85EBCA77) >>> 0) % 40) / 10) * scale;
      const hz = (Math.imul(Math.round(z * 8) | 0, 0x9E3779B1) >>> 0);
      const yaw = ((hz % 628) / 100);
      // slight non-uniform footprint so twins standing together read apart
      const wj = 0.88 + ((hz >>> 10) % 28) / 100;
      p.set(x, gy, z);
      q.setFromAxisAngle(up, yaw);
      s.set(h * wj, h, h * (1.76 - wj));
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
    });
    world.add(inst);
    total += list.length;
  }
  return total;
}
