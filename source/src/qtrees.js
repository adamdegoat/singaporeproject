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

// ?inear= and ?imax= override these, so the two distances can be A/B'd from
// the same camera without editing the source — the ?rich / ?noflat idiom.
const _P = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new Map();
const IMPOSTER_NEAR = +(_P.get && _P.get('inear') || 0) || 260;   // metres; beyond this a tree is a card
// THE ISLAND USED TO GO BALD AT 700m, and from anywhere with a view that is
// most of it (2026-08-30). Measured from 34m over the Tanjong ridge looking
// west: at 700 the far shore is a pale ridge of buildings with no green on it;
// at 2600 the canopy runs to the horizon, which is what Sentosa is.
//
// WHY IT WAS 700, AND WHY THAT PREMISE IS GONE. The note above says the swap
// "hides inside the haze" because "FogExp2 0.0038: ~17% visible at 350m". The
// scene's fog density is **0.0012**, not 0.0038 — it was lowered at some point
// and this file was never re-derived. At the real density 350m is 84% visible,
// 700m is 49% and 900m is 31%. Nothing was hiding in any haze.
//
// AND THE THIRD TIER IS WHAT MAKES IT AFFORDABLE. Between 700m and HAZE_MAX a
// tree is a SIX-triangle card instead of a twenty: no trunk (a trunk is under
// a pixel out there) and a three-segment crown instead of six. Measured at
// Tanjong Beach Walk, the heaviest view on the island: pushing the 20-tri card
// to 2600 costs +287k triangles, the 6-tri one costs about a third of that and
// stays inside the hot budget.
//
// The cards stay CROSSED rather than becoming single billboards. A single quad
// has to face the camera to exist at all, and the 2026-08-23 headland-sea
// golden already recorded what flat rectangles look like across open water:
// "a hillside of rectangular cards read as green boxes".
//
// AND THE HAZE TIER ONLY EXISTS WHEN THE CAMERA CAN SEE FAR, which is the
// difference between a nice-to-have and something that fits. Measured with a
// screenshot diff at the Tanjong Beach Walk hot view, rider height, 700 against
// 2600: **0 of 1,120,000 pixels differ.** From down there the near canopy hides
// the whole far island, so every one of those triangles is submitted, paid for,
// and occluded. The hot-view budget guards exactly those ground-level frames.
//
// The gate is height above SEA LEVEL, not above local ground. Above local
// ground is wrong in the one place it matters most: a rider on Imbiah's summit
// stands 2m above the ground and 60m above the sea, and the summit is where
// somebody goes precisely to look at the island. Above sea level a beach rider
// is 2m (no tier, nothing to see) and the summit rider is 60m (full tier).
//
// It stays a pure function of the camera position, so a golden's fixed pose
// still partitions identically.
const IMPOSTER_MAX = +(_P.get && _P.get('imax') || 0) || 700;     // beyond this the cheap card
const HAZE_MAX = +(_P.get && _P.get('ihaze') || 0) || 2600;       // ...as far as the tier ever reaches
// 25, AND THE NUMBER WAS MEASURED, NOT PICKED. 12 was the first cut and it let
// the tier in at Tanjong Beach Walk — whose "ground level" is 15.7m above the
// sea — for 39k triangles that the pixel diff says change nothing there. The
// island's beach walks and coast roads all sit under ~20m; its viewpoints
// (Imbiah's summit, the cable car, Fort Siloso's ridge, Skypark) are all well
// over 30m. 25 puts the line in the gap.
const HAZE_Y0 = 25;        // metres above sea before any haze tier at all
const HAZE_PER_M = 120;    // ...and how much further per metre of height above that
const NEAR2 = IMPOSTER_NEAR * IMPOSTER_NEAR;
const MAX2 = IMPOSTER_MAX * IMPOSTER_MAX;
// how far the haze tier reaches from this camera height, squared
function haze2For(camY) {
  const seaY = (typeof window !== 'undefined' && window.__seaY) || 0;
  const up = (camY - seaY) - HAZE_Y0;
  if (up <= 0) return MAX2;                       // nothing beyond the near card
  const r = Math.min(HAZE_MAX, IMPOSTER_MAX + up * HAZE_PER_M);
  return r * r;
}

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

// THE HAZE CARD: the same crossed silhouette with everything that cannot be
// seen at 700m taken out of it. No trunk strip — a 0.14-wide trunk at 700m is
// well under a pixel and it is the darkest part of the card, so dropping it
// also stops far woodland reading as a grey smear. Three crown segments per
// plane instead of six: 6 triangles against 20.
const hazeCache = new Map();
function hazeFor(name) {
  if (hazeCache.has(name)) return hazeCache.get(name);
  const d = QTREES[name];
  let cr = [0, 0, 0], cn = 0;
  for (let i = 0; i < d.c.length; i += 3) {
    if (d.p[i + 1] < 0.25) continue;
    cr[0] += d.c[i]; cr[1] += d.c[i + 1]; cr[2] += d.c[i + 2]; cn++;
  }
  cr = cn ? cr.map((v) => v / cn) : [0.05, 0.12, 0.02];
  const w = (d.ax || 0.8) / 2;
  const P = [], C = [], I = [];
  let vi = 0;
  for (const [ax, az2] of [[1, 0], [0, 1]]) {
    // THE CROWN SITS LOWER AND TALLER than the near card's, because the trunk
    // is gone: the silhouette has to cover the same height on screen or a
    // hillside of these reads as floating pom-poms above the ridge.
    const cyc = 0.55;
    P.push(0, cyc, 0);
    C.push(cr[0], cr[1], cr[2]);
    const ci = vi; vi++;
    for (let k = 0; k <= 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      P.push(Math.cos(a) * w * ax, cyc + Math.sin(a) * 0.45,
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
  hazeCache.set(name, g);
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
// { mats: Float32Array (16/instance), xs, zs, nearMesh, farMesh, hazeMesh }
const SETS = [];
let _camX = Infinity, _camZ = Infinity, _camY = Infinity;

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
    const hazeMesh = new THREE.InstancedMesh(hazeFor(t), mat, n);
    for (const mesh of [nearMesh, farMesh, hazeMesh]) {
      // NAMED, for the same reason the kerbs now are: audit_world's C5
      // ("streets with no greenery") recognised a tree by SphereGeometry(0.66)
      // / IcosahedronGeometry(1), and the Quaternius pack that replaced the
      // procedural shapes on 2026-08-22 is all anonymous BufferGeometry. A
      // check that cannot see the thing it counts reports zero and passes.
      mesh.name = 'qtree';
      mesh.castShadow = mesh === nearMesh;
      mesh.frustumCulled = false;
      mesh.userData.treeTrunk = true;
      mesh.userData.treeFoliage = true;
      mesh.userData.lodRegistered = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      world.add(mesh);
    }
    SETS.push({ mats, xs, zs, nearMesh, farMesh, hazeMesh, n });
    total += n;
  }
  _camX = Infinity;                  // force a partition on the next tick
  return total;
}

// re-partition when the camera has moved; pure function of (camX, camZ),
// so a golden's fixed pose always produces the same split. ~2ms for 30k
// trees, every 40m of travel — not per frame.
export function qtreesTick(camX, camZ, camY = 0) {
  const dx = camX - _camX, dz = camZ - _camZ, dy = camY - _camY;
  // HEIGHT COUNTS AS MOVEMENT, and it has to: the haze tier's reach is a
  // function of it, and the cable car climbs 60m without covering 40m of
  // ground. 6m of climb re-partitions, which is ~540m of extra reach.
  if (dx * dx + dz * dz < 1600 && dy * dy < 36) return;
  _camX = camX; _camZ = camZ; _camY = camY;
  const HAZE2 = haze2For(camY);
  for (const S of SETS) {
    const { mats, xs, zs, nearMesh, farMesh, hazeMesh, n } = S;
    const nearA = nearMesh.instanceMatrix.array;
    const farA = farMesh.instanceMatrix.array;
    const hazeA = hazeMesh.instanceMatrix.array;
    let ni = 0, fi = 0, hi = 0;
    for (let i = 0; i < n; i++) {
      const ddx = xs[i] - camX, ddz = zs[i] - camZ;
      const d2 = ddx * ddx + ddz * ddz;
      if (d2 < NEAR2) {
        nearA.set(mats.subarray(i * 16, i * 16 + 16), ni * 16); ni++;
      } else if (d2 < MAX2) {
        farA.set(mats.subarray(i * 16, i * 16 + 16), fi * 16); fi++;
      } else if (d2 < HAZE2) {
        hazeA.set(mats.subarray(i * 16, i * 16 + 16), hi * 16); hi++;
      }
    }
    nearMesh.count = ni;
    farMesh.count = fi;
    hazeMesh.count = hi;
    nearMesh.instanceMatrix.needsUpdate = true;
    farMesh.instanceMatrix.needsUpdate = true;
    hazeMesh.instanceMatrix.needsUpdate = true;
  }
}
