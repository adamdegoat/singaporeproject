// Quaternius pack trees — the world's trees since 2026-08-22 (owner art
// direction). Placement, guards and the RNG stream are untouched
// (TreeField._tree still runs in full — only what is DRAWN differs).
//
// FAR-TREE IMPOSTERS since 2026-08-23 (the perf session): trees were 40%
// of the drawn frame (measured 872k of 2203k at the spawn, category
// toggle probe). Beyond IMPOSTER_NEAR a tree draws as an 8-tri crossed
// card in the tree's own average canopy/trunk colors; the fog is
// near-opaque out there (FogExp2 0.0038: ~17% visible at 350m), so the
// swap hides inside the haze. Partitioning is a pure function of the
// camera position (deterministic per pose — goldens stay reproducible),
// re-run only when the camera has moved 40m.
import * as THREE from '../lib/three.module.js';
import { QTREES } from './qtrees_data.js';

const IMPOSTER_NEAR = 260;          // metres; beyond this a tree is a card
const IMPOSTER_MAX = 700;           // beyond this not even the card draws
                                    // (the compactor used to cull at 600;
                                    // these sets opted out of it)
const NEAR2 = IMPOSTER_NEAR * IMPOSTER_NEAR;
const MAX2 = IMPOSTER_MAX * IMPOSTER_MAX;

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

// the imposter card: two crossed quads, unit height like the models.
// Bottom quarter wears the trunk color, the rest the canopy color —
// computed as the model's own average LINEAR vertex colors so the card
// is the tree's silhouette-in-fog, not a guess.
const cardCache = new Map();
function cardFor(name) {
  if (cardCache.has(name)) return cardCache.get(name);
  const d = QTREES[name];
  let tr = [0, 0, 0], tn = 0, cr = [0, 0, 0], cn = 0;
  for (let i = 0; i < d.c.length; i += 3) {
    const y = d.p[i + 1];
    const b = y < 0.25 ? tr : cr;
    b[0] += d.c[i]; b[1] += d.c[i + 1]; b[2] += d.c[i + 2];
    if (y < 0.25) tn++; else cn++;
  }
  if (tn) { tr = tr.map((v) => v / tn); } else { tr = [0.08, 0.05, 0.03]; }
  if (cn) { cr = cr.map((v) => v / cn); } else { cr = [0.05, 0.12, 0.02]; }
  // TREE-SHAPED, not a rectangle: across open water the fog never gets
  // opaque and a hillside of rectangular cards read as green boxes
  // (headland-sea golden, 2026-08-23). Each crossed plane is a trunk
  // strip + an octagonal crown fan — 20 tris, still 25x under the mesh.
  const w = (d.ax || 0.8) / 2;
  const P = [], C = [], I = [];
  let vi = 0;
  const tw = w * 0.14;
  for (const [ax, az2] of [[1, 0], [0, 1]]) {
    // trunk strip
    P.push(-tw * ax, 0, -tw * az2, tw * ax, 0, tw * az2,
           tw * ax, 0.5, tw * az2, -tw * ax, 0.5, -tw * az2);
    for (let k = 0; k < 4; k++) C.push(tr[0], tr[1], tr[2]);
    I.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
    vi += 4;
    // octagonal crown fan, centre (0, 0.68), radius w tall / 0.34 vert
    const cyc = 0.68;
    P.push(0, cyc, 0);
    C.push(cr[0], cr[1], cr[2]);
    const ci = vi; vi++;
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      P.push(Math.cos(a) * w * ax, cyc + Math.sin(a) * 0.34,
             Math.cos(a) * w * az2);
      C.push(cr[0], cr[1], cr[2]);
      if (k > 0) I.push(ci, vi - 1, vi);
      vi++;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.setIndex(I);
  g.computeVertexNormals();
  cardCache.set(name, g);
  return g;
}

// deterministic type from position — no RNG stream involvement. Near a
// carriageway only types whose lowest green vertex clears the 4.8m traffic
// envelope at this height are allowed (the procedural trees got the same
// rule as a 6m crown lift — a double-decker is 4.3m).
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

// the partitioned sets, one entry per tree type per build:
// { mats: Float32Array (16/instance), xs, zs, nearMesh, farMesh }
const SETS = [];
let _camX = Infinity, _camZ = Infinity;

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
    const n = list.length;
    const mats = new Float32Array(n * 16);
    const xs = new Float32Array(n), zs = new Float32Array(n);
    list.forEach(([x, z, scale, low], i) => {
      const gy = terrainAt(x, z);
      // unit-height model; match the procedural sizing band (13-17.5m).
      // UNDERGROWTH IS A BUSH, NOT A MINI TREE (owner's 2026-08-22 phone
      // report) — bushes hug the ground.
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
      m.toArray(mats, i * 16);
      xs[i] = x; zs[i] = z;
    });
    // near = the real mesh, far = the card. Both sized for the full count
    // (worst case: standing at the island's corner). frustumCulled stays
    // OFF and lodRegistered ON so the per-instance compactor (main.js
    // LODI) leaves them to this module's own partitioning.
    const nearMesh = new THREE.InstancedMesh(geoFor(t), mat, n);
    const farMesh = new THREE.InstancedMesh(cardFor(t), mat, n);
    for (const mesh of [nearMesh, farMesh]) {
      mesh.castShadow = mesh === nearMesh;
      mesh.frustumCulled = false;
      mesh.userData.treeTrunk = true;
      mesh.userData.treeFoliage = true;
      mesh.userData.lodRegistered = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      world.add(mesh);
    }
    SETS.push({ mats, xs, zs, nearMesh, farMesh, n });
    total += n;
  }
  _camX = Infinity;                  // force a partition on the next tick
  return total;
}

// re-partition when the camera has moved; pure function of (camX, camZ),
// so a golden's fixed pose always produces the same split. ~2ms for 30k
// trees, every 40m of travel — not per frame.
export function qtreesTick(camX, camZ) {
  const dx = camX - _camX, dz = camZ - _camZ;
  if (dx * dx + dz * dz < 1600) return;
  _camX = camX; _camZ = camZ;
  for (const S of SETS) {
    const { mats, xs, zs, nearMesh, farMesh, n } = S;
    const nearA = nearMesh.instanceMatrix.array;
    const farA = farMesh.instanceMatrix.array;
    let ni = 0, fi = 0;
    for (let i = 0; i < n; i++) {
      const ddx = xs[i] - camX, ddz = zs[i] - camZ;
      const d2 = ddx * ddx + ddz * ddz;
      if (d2 < NEAR2) {
        nearA.set(mats.subarray(i * 16, i * 16 + 16), ni * 16); ni++;
      } else if (d2 < MAX2) {
        farA.set(mats.subarray(i * 16, i * 16 + 16), fi * 16); fi++;
      }
    }
    nearMesh.count = ni;
    farMesh.count = fi;
    nearMesh.instanceMatrix.needsUpdate = true;
    farMesh.instanceMatrix.needsUpdate = true;
  }
}
