// BATCH 3 of the pack restyle — THE ISLAND COMES ALIVE (owner mandate,
// 2026-08-22: full revamp, "add like monsters in areas where can captivate
// ppl imaginations"). Three systems, all deterministic in PLACEMENT
// (position hashes, no shared RNG):
//   * BOATS moored beside the mapped marina piers (ONE°15 and the Cove
//     berths are surveyed data that held nothing).
//   * FISH schools in the swimming lagoons, visible from the boardwalk and
//     while swimming.
//   * CREATURES — friendly Quaternius monsters hand-placed at real places
//     with a story fit: a ghost at Fort Siloso's WWII fort, a mushroom
//     fellow on the Imbiah jungle trail, a dino by the Lost World, a squid
//     on the lagoon groyne, blobs hiding in the MegaZip forest.
// ANIMATION is a gentle bob/turn on a ~15Hz tick, DISABLED under
// ?district= boots so the golden/perf gates stay pixel-deterministic; the
// phone (plain boot) and scene= vets see it move.
import * as THREE from '../lib/three.module.js';
import { QLIFE } from './qlife_data.js';

const geoCache = new Map();
function geoFor(name) {
  if (geoCache.has(name)) return geoCache.get(name);
  const d = QLIFE[name];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(d.c, 3));
  g.setIndex(d.i);
  g.computeVertexNormals();
  geoCache.set(name, g);
  return g;
}
const hash2 = (x, z) => ((Math.imul(Math.round(x * 4) | 0, 0x9E3779B1)
  ^ Math.imul(Math.round(z * 4) | 0, 0x85EBCA77)) >>> 0);

// registry the per-frame tick walks; entries carry their rest pose
const ANIM = [];

function addInstanced(world, kind, list, opts = {}) {
  if (!list.length) return null;
  const mat = new THREE.MeshLambertMaterial(Object.assign(
    { vertexColors: true }, opts.mat || {}));
  const inst = new THREE.InstancedMesh(geoFor(kind), mat, list.length);
  inst.castShadow = !!opts.shadow;
  if (opts.tag) inst.userData[opts.tag] = true;
  if (opts.afloat) inst.userData.afloat = true;
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  const q = new THREE.Quaternion(), s = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  list.forEach(([x, y, z, yaw, sc], i) => {
    p.set(x, y, z); q.setFromAxisAngle(up, yaw); s.set(sc, sc, sc);
    m.compose(p, q, s);
    inst.setMatrixAt(i, m);
    if (opts.anim) ANIM.push({ inst, i, x, y, z, yaw, sc, kind: opts.anim,
      ph: (hash2(x, z) % 628) / 100 });
  });
  world.add(inst);
  return inst;
}

// WATER IS THE POLYGON'S CALL, NOT THE HEIGHTFIELD'S. at() land-smears over
// real water (measured 7.37 over the Cove berths — the Copernicus smear the
// handoff documents); waterFloor answers from the mapped water polygon and
// is the same oracle W2 trusts. The height test only backstops open sea
// outside any polygon.
const isWater = (T, x, z) => {
  const wf = T.waterFloor ? T.waterFloor(x, z) : null;
  if (wf !== null) return true;
  return T.at(x, z) < 0.25;
};

export function buildQLife(world, data, T) {
  const at = (x, z) => T.at(x, z);
  let boats = 0, fish = 0, creatures = 0;
  // ---- BOATS at the piers -------------------------------------------------
  const boatKinds = ['sailboat', 'boatA', 'boatB', 'raft'];
  const boatList = { sailboat: [], boatA: [], boatB: [], raft: [] };
  for (const pier of (data.piers || [])) {
    const pts = pier.p || [];
    if (pts.length < 3) continue;
    let cx = 0, cz = 0;
    for (const [qx, qz] of pts) { cx += qx; cz += qz; }
    cx /= pts.length; cz /= pts.length;
    const h = hash2(cx, cz);
    if ((h % 10) < 4) continue;               // ~60% of piers get a boat
    // pier long axis from its longest edge
    let best = 0, ux = 1, uz = 0;
    for (let i = 0; i < pts.length; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % pts.length];
      const L = Math.hypot(bx - ax, bz - az);
      if (L > best) { best = L; ux = (bx - ax) / L; uz = (bz - az) / L; }
    }
    const side = (h & 1) ? 1 : -1;
    const off = 3.6 + ((h >>> 4) % 20) / 10;
    const bx2 = cx - uz * side * off, bz2 = cz + ux * side * off;
    if (!isWater(T, bx2, bz2)) continue;     // only moor on real water
    const kind = boatKinds[(h >>> 6) % boatKinds.length];
    const len = 6.5 + ((h >>> 9) % 30) / 10;  // 6.5-9.5m hulls
    const yaw = Math.atan2(ux, uz) + ((h & 2) ? Math.PI : 0);
    boatList[kind].push([bx2, 0.35, bz2, yaw, len / (QLIFE[
      kind === 'sailboat' ? 'sailhull' : kind].az || 4.5)]);
    boats++;
  }
  // hull only — a moored boat's sails are furled, and the separately
  // normalized sail mesh would come out hull-sized anyway
  // userData.afloat is P3's own moored-boat exemption ("placed on water
  // PROVEN wet, the terrain is the bank") — the audit caught exactly the
  // smear this batch's isWater already handles, 10 findings on the first
  // gate run.
  const boatOpts = { anim: 'boat', shadow: true, tag: 'moored', afloat: true };
  addInstanced(world, 'sailhull', boatList.sailboat, boatOpts);
  addInstanced(world, 'boatA', boatList.boatA, boatOpts);
  addInstanced(world, 'boatB', boatList.boatB, boatOpts);
  addInstanced(world, 'raft', boatList.raft, { anim: 'boat', tag: 'moored', afloat: true });

  // ---- FISH schools in the lagoons ---------------------------------------
  // anchors near the swimming lagoons; each anchor scans a small ring for
  // real water and seeds a school there
  const anchors = [[-2350, 12430], [-2180, 12520], [-950, 13140]];
  const fishKinds = ['clown', 'redfish', 'puffer', 'butter', 'tang', 'grouper'];
  const fishList = { clown: [], redfish: [], puffer: [], butter: [], tang: [], grouper: [] };
  for (const [ax, az] of anchors) {
    const wfAt = (x, z) => (T.waterFloor ? T.waterFloor(x, z) : null);
    let wx = null, wz = null;
    for (let r = 6; r <= 60 && wx === null; r += 6) {
      for (let a = 0; a < 6.28; a += 0.8) {
        const x = ax + Math.cos(a) * r, z = az + Math.sin(a) * r;
        if (wfAt(x, z) !== null) { wx = x; wz = z; break; }
      }
    }
    if (wx === null) continue;
    const h0 = hash2(wx, wz);
    const n = 10 + (h0 % 6);
    for (let k = 0; k < n; k++) {
      const hk = hash2(wx + k * 7, wz - k * 5);
      const rr = 2 + (hk % 90) / 10;
      const aa = ((hk >>> 8) % 628) / 100;
      const x = wx + Math.cos(aa) * rr, z = wz + Math.sin(aa) * rr;
      const wf = wfAt(x, z);
      if (wf === null) continue;
      // cruise between just under the surface and just off the drawn bed
      const y = Math.min(-0.35, Math.max(wf + 0.4, -0.4 - (hk % 10) / 10));
      const kind = fishKinds[(hk >>> 5) % fishKinds.length];
      fishList[kind].push([x, y, z, aa, 0.55 + (hk % 30) / 100]);
      fish++;
    }
  }
  for (const k of fishKinds) addInstanced(world, k, fishList[k], { anim: 'fish', afloat: true });

  // ---- CREATURES at real places ------------------------------------------
  // world-space spots (sentosa frame); the once-set stops chunk duplicates.
  const SPOTS = [
    ['ghost',   -2748, 11940, 2.2],   // Fort Siloso, in the fort greens
    ['mushnub', -2052, 12328, 1.5],   // beside the Imbiah trail
    ['dino',    -1085, 12492, 3.4],   // Lost World's back fence
    ['squid',   -2452, 12395, 1.7],   // the lagoon groyne rocks
    ['blob',    -1918, 12238, 1.1],   // MegaZip forest clearing
    ['spiky',   -1620, 13480, 1.0],   // Tanjong ridge scrub
  ];
  // a spot belongs to the chunk whose CONTENT covers it — a global once-set
  // would lose the creature forever when its chunk unloads and rebuilds
  let bx0 = Infinity, bz0 = Infinity, bx1 = -Infinity, bz1 = -Infinity;
  for (const layer of [data.roads, data.buildings]) {
    for (const r of (layer || [])) {
      for (const p of (r.p || [])) {
        if (p[0] < bx0) bx0 = p[0]; if (p[0] > bx1) bx1 = p[0];
        if (p[1] < bz0) bz0 = p[1]; if (p[1] > bz1) bz1 = p[1];
      }
    }
  }
  const creatureLists = new Map();
  for (const [kind, x, z, sc] of SPOTS) {
    if (x < bx0 || x > bx1 || z < bz0 || z > bz1) continue;   // not this chunk's ground
    const gy = at(x, z);
    if (gy < 0.25) continue;
    if (window.__onRoad && window.__onRoad(x, z, 0.4)) continue;
    if (window.__inFootprint && window.__inFootprint(x, z)) continue;
    let a = creatureLists.get(kind);
    if (!a) creatureLists.set(kind, a = []);
    const yaw = ((hash2(x, z) % 628) / 100);
    a.push([x, kind === 'ghost' ? gy + 0.9 : gy, z, yaw, sc]);
    creatures++;
  }
  for (const [kind, list] of creatureLists) {
    addInstanced(world, kind, list, { anim: kind === 'ghost' ? 'ghost' : 'creature',
      shadow: true, tag: 'creature' });
  }

  // ---- THE TANJONG RIMAU ROCKY SHORE --------------------------------------
  // The one stretch of NATURAL rocky coast on the island (research/
  // tanjong-rimau.md: the arc from the Jetty Ruin side x-2837,z11799 round
  // the cape node x-2968,z11858 to x-2836,z12018 is published natural
  // shore; everything else is engineered sand or seawall). Boulders walk
  // that arc, INSTANCED so Solid never rasterizes them — a rock line that
  // cannot wall the shore, the same safety argument the drains use.
  const RIMAU = [[-2837, 11799], [-2905, 11822], [-2955, 11852], [-2960, 11895],
                 [-2925, 11945], [-2870, 11990], [-2836, 12018]];
  const shoreRocks = { rockA: [], rockB: [] };
  let shore = 0;
  for (let i = 0; i < RIMAU.length - 1; i++) {
    const [ax, az] = RIMAU[i], [bx, bz] = RIMAU[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    for (let s = 0; s < L; s += 6.5) {
      const t = s / L;
      const h = hash2(ax + (bx - ax) * t, az + (bz - az) * t);
      const px = ax + (bx - ax) * t + ((h % 90) / 10 - 4.5);
      const pz = az + (bz - az) * t + (((h >>> 7) % 90) / 10 - 4.5);
      const gy = at(px, pz);
      if (gy < -0.6 || gy > 4.5) continue;           // intertidal / low bank only
      if (px < bx0 - 40 || px > bx1 + 40 || pz < bz0 - 40 || pz > bz1 + 40) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      const kind = (h & 1) ? 'rockA' : 'rockB';
      const sc = 0.9 + ((h >>> 10) % 25) / 10;       // 0.9 - 3.3m rocks
      shoreRocks[kind].push([px, Math.max(gy - sc * 0.18, -0.6), pz,
        ((h >>> 4) % 628) / 100, sc]);
      shore++;
    }
  }
  addInstanced(world, 'rockA', shoreRocks.rockA, { shadow: true });
  addInstanced(world, 'rockB', shoreRocks.rockB, { shadow: true });

  // ---- BEACH-BAR PROPS ----------------------------------------------------
  // barrels and buckets beside the named beach bars' own drawn buildings —
  // the venues are surveyed footprints, the dressing sits on their apron.
  const BARS = /coastes|ola beach|tanjong beach club|sand bar|rumours|bikini/i;
  const props = { barrel: [], bucket: [] };
  let barProps = 0;
  for (const b of (data.buildings || [])) {
    if (!b.n || !BARS.test(b.n) || !b.p || b.p.length < 3) continue;
    let cx = 0, cz = 0;
    for (const [qx, qz] of b.p) { cx += qx; cz += qz; }
    cx /= b.p.length; cz /= b.p.length;
    const h0 = hash2(cx, cz);
    for (let k = 0; k < 3; k++) {
      const hk = hash2(cx + k * 11, cz - k * 7);
      const aa = ((hk >>> 3) % 628) / 100;
      const rr = 7 + (hk % 40) / 10;
      const px = cx + Math.cos(aa) * rr, pz = cz + Math.sin(aa) * rr;
      const gy = at(px, pz);
      if (gy < 0.5) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      if (window.__onRoad && window.__onRoad(px, pz, 0.4)) continue;
      const kind = (hk & 2) ? 'barrel' : 'bucket';
      props[kind].push([px, gy, pz, ((hk >>> 6) % 628) / 100,
        kind === 'barrel' ? 0.9 : 0.45]);
      barProps++;
    }
  }
  addInstanced(world, 'barrel', props.barrel, { shadow: true });
  addInstanced(world, 'bucket', props.bucket, { shadow: true });

  // ---- PIGEON FLOCKS (animals approved in the owner's revamp mandate; a
  // true peacock has no CC0 model yet and is queued as custom work) — small
  // flocks at the walked plazas, idle-bobbing on the creature tick.
  const FLOCKS = [[-1700, 12722], [-1085, 12760], [530, 13700], [-2180, 12480]];
  const pigeons = [];
  for (const [fx, fz] of FLOCKS) {
    if (fx < bx0 || fx > bx1 || fz < bz0 || fz > bz1) continue;
    const h0 = hash2(fx, fz);
    const n = 3 + (h0 % 3);
    for (let k = 0; k < n; k++) {
      const hk = hash2(fx + k * 13, fz + k * 9);
      const px = fx + ((hk % 120) / 10 - 6), pz = fz + (((hk >>> 8) % 120) / 10 - 6);
      const gy = at(px, pz);
      if (gy < 0.4) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      if (window.__inWater && window.__inWater(px, pz)) continue;
      pigeons.push([px, gy, pz, ((hk >>> 5) % 628) / 100, 0.28]);
    }
  }
  addInstanced(world, 'pigeon', pigeons, { anim: 'creature' });

  return { boats, fish, creatures, shoreRocks: shore, barProps, pigeons: pigeons.length };
}

// ~15Hz gentle life: fish cruise a small circle, boats heave, creatures
// bob and slowly turn, the ghost floats. Zero allocations in the loop.
const _m = typeof THREE !== 'undefined' ? new THREE.Matrix4() : null;
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
let _lastTick = 0;
export function qlifeTick(nowMs) {
  if (!ANIM.length || nowMs - _lastTick < 66) return;
  _lastTick = nowMs;
  const t = nowMs / 1000;
  const dirty = new Set();
  for (const e of ANIM) {
    let x = e.x, y = e.y, z = e.z, yaw = e.yaw;
    if (e.kind === 'fish') {
      const w = 0.5 + (e.ph % 1) * 0.3;
      const r = 1.1;
      x += Math.cos(t * w + e.ph) * r;
      z += Math.sin(t * w + e.ph) * r;
      yaw = -(t * w + e.ph) - Math.PI / 2;
      y += Math.sin(t * 1.7 + e.ph) * 0.08;
    } else if (e.kind === 'boat') {
      y += Math.sin(t * 0.9 + e.ph) * 0.09;
      yaw += Math.sin(t * 0.23 + e.ph) * 0.02;
    } else if (e.kind === 'ghost') {
      y += Math.sin(t * 1.1 + e.ph) * 0.35;
      yaw += Math.sin(t * 0.4 + e.ph) * 0.5;
    } else {                                  // creature: idle bob + look-around
      y += Math.abs(Math.sin(t * 1.6 + e.ph)) * 0.10;
      yaw += Math.sin(t * 0.5 + e.ph) * 0.35;
    }
    _p.set(x, y, z); _q.setFromAxisAngle(_up, yaw); _s.set(e.sc, e.sc, e.sc);
    _m.compose(_p, _q, _s);
    e.inst.setMatrixAt(e.i, _m);
    dirty.add(e.inst);
  }
  for (const inst of dirty) inst.instanceMatrix.needsUpdate = true;
}
