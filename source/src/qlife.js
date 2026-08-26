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
  // B14 (beauty sweep): hand-anchored boats where the reviewers found dead
  // water — the causeway channel both sides (the island's front door was
  // its emptiest view), Brani pier, Ocean Drive offshore. Same isWater
  // proof, same afloat exemption; ring-scan finds the wet cell so a
  // slightly-off anchor cannot beach a hull.
  const MOORINGS = [[-1130, 11900], [-1140, 12030], [-980, 11880],
    [-975, 12060], [-920, 11960], [1180, 13470], [1250, 13430],
    [-1160, 12150]];
  for (const [mx, mz] of MOORINGS) {
    if (mx < bx0 - 60 || mx > bx1 + 60 || mz < bz0 - 60 || mz > bz1 + 60) continue;
    const h = hash2(mx, mz);
    let wet = null;
    for (let rr = 0; rr <= 60 && !wet; rr += 12) {
      for (let aa = 0; aa < 6.28; aa += 0.8) {
        const x = mx + Math.cos(aa) * rr, z = mz + Math.sin(aa) * rr;
        if (isWater(T, x, z)) { wet = [x, z]; break; }
      }
    }
    if (!wet) continue;
    const kind = boatKinds[(h >>> 6) % boatKinds.length];
    const len = 6.5 + ((h >>> 9) % 30) / 10;
    boatList[kind].push([wet[0], 0.35, wet[1], ((h >>> 3) % 628) / 100,
      len / (QLIFE[kind === 'sailboat' ? 'sailhull' : kind].az || 4.5)]);
    boats++;
  }
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
  // four boulder shapes since batch 9: the two Quaternius greys + two
  // MegaKit atlas-browns (the photo survey's cobble is #58432E brown —
  // the mix is truer than all-grey; atlas bake = glbatlas.py)
  const SHORE_KINDS = ['rockA', 'rockB', 'mkrockA', 'mkrockB'];
  const shoreRocks = { rockA: [], rockB: [], mkrockA: [], mkrockB: [] };
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
      const sc = 0.9 + ((h >>> 10) % 25) / 10;       // 0.9 - 3.3m rocks
      // MegaKit shapes only at boulder size: a small rock shows ONE atlas
      // face and pops as a solid red lump (vet 2026-08-22)
      const kind = sc >= 1.8 ? SHORE_KINDS[h & 3]
        : SHORE_KINDS[h & 1];
      shoreRocks[kind].push([px, Math.max(gy - sc * 0.18, -0.6), pz,
        ((h >>> 4) % 628) / 100, sc]);
      shore++;
    }
  }
  for (const k of SHORE_KINDS) {
    addInstanced(world, k, shoreRocks[k], { shadow: true });
  }

  // ---- THE SILOSO CLIFF FACE (batch 8) ------------------------------------
  // The published rock section runs from the Siloso Jetty ruin round the
  // cape and down the EIA arc (research/tanjong-rimau.md: Tanjong Rimau
  // Formation, "reddish to pale-pink" sub-vertical banded sandstone, logged
  // "from the Siloso Jetty to Sarang Rimau"; cliff band ~5-10m under a
  // wooded crest). Authored strata slabs (crag/ledge, authored_rocks.py in
  // research/qlifegen) walk the shore-boulder polyline EXTENDED north-east
  // to the jetty, then march INLAND to seat only where the bank is
  // genuinely cliff-steep. Inland direction is DERIVED per segment (the
  // side that climbs at 15m), never argued — the coastline-winding lesson.
  const CLIFF = [[-2623, 11799], [-2700, 11796], [-2770, 11797], ...RIMAU];
  const cliffRocks = { crag: [], ledge: [] };
  let cliff = 0;
  for (let i = 0; i < CLIFF.length - 1; i++) {
    const [ax, az] = CLIFF[i], [bx, bz] = CLIFF[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    let nx = -uz, nz = ux;
    const midx = (ax + bx) / 2, midz = (az + bz) / 2;
    if (at(midx + nx * 15, midz + nz * 15) < at(midx - nx * 15, midz - nz * 15)) {
      nx = -nx; nz = -nz;
    }
    for (let s = 0; s < L; s += 6) {
      const t = s / L;
      const sx = ax + (bx - ax) * t, sz = az + (bz - az) * t;
      const h = hash2(sx + 3, sz - 3);
      // dStart hash-varies where the march begins so the found seats spread
      // instead of chaining one level row (the first vet's giveaway rhythm)
      const dStart = (h % 4) - 6;                    // may start seaward: the
      let seated = 0;                                // hand polyline is ±10m off
      for (let d = dStart; d <= 24 && seated < 2; d += 2) {  // march up the bank
        const px = sx + nx * d + ((h % 30) / 10 - 1.5);
        const pz = sz + nz * d + (((h >>> 6) % 30) / 10 - 1.5);
        const gy = at(px, pz);
        // TOE BAND ONLY, gy 2.8-6.5. Two failed vets taught this: a band up
        // to gy 12-15 colonises the SAME steep grass the skater bombs down
        // (the rimau-shore golden camera stands at gy 7.9 mid-slope and
        // twice ended up inside a crag). The published geology agrees — the
        // outcrop "crops out along the TIDAL TERRACE", i.e. the base, with
        // wooded slope above. Only break once genuinely past the band (the
        // north-shore stations START above it — bank rises ~2m per 5m there).
        if (gy > 6.5) { if (d > 2) break; else continue; }
        if (gy < 2.8) continue;                      // shore flat: boulders' turf
        const slope = (at(px + nx * 3, pz + nz * 3) - at(px - nx * 3, pz - nz * 3)) / 6;
        if (slope < 0.3) continue;                   // only the climbing bank
        if (px < bx0 - 40 || px > bx1 + 40 || pz < bz0 - 40 || pz > bz1 + 40) break;
        if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
        if (window.__onPath && window.__onPath(px, pz)) continue;
        if (window.__onRoad && window.__onRoad(px, pz, 0.4)) continue;
        // a crag wall chunk with a toe ledge below it on the second seat —
        // pairs chain into a broken wall band rather than lone lumps
        const hk = hash2(px, pz);
        const kind = (seated === 0 && (hk & 3) !== 0) ? 'crag' : 'ledge';
        const sc = kind === 'crag'
          ? 2.6 + ((hk >>> 10) % 16) / 10            // 2.6-4.2m wall chunks
          : 1.6 + ((hk >>> 10) % 16) / 10;           // 1.6-3.2m toe ledges
        // crag's authored lean is local +x: yaw it INTO the hill so the
        // slab reads embedded, with a small along-shore jitter
        // embed into the slope, but P3 calls a prop sunk past 1.2m a
        // blocker (first gate run: 24 crags at 0.25*sc) — cap the sink
        cliffRocks[kind].push([px, gy - Math.min(1.1, sc * 0.25), pz,
          Math.atan2(-nz, nx) + ((hk >>> 4) % 100) / 100 - 0.5, sc]);
        cliff++;
        seated++;
        d += 3;                                      // hop before the second seat
      }
    }
  }
  addInstanced(world, 'crag', cliffRocks.crag, { shadow: true });
  addInstanced(world, 'ledge', cliffRocks.ledge, { shadow: true });

  // ---- BEACH-BAR PROPS ----------------------------------------------------
  // barrels and buckets beside the named beach bars' own drawn buildings —
  // the venues are surveyed footprints, the dressing sits on their apron.
  const BARS = /coastes|ola beach|tanjong beach club|sand bar|rumours|bikini/i;
  const props = { barrel: [], bucket: [], crate: [], lantern: [] };
  let barProps = 0;
  for (const b of (data.buildings || [])) {
    if (!b.n || !BARS.test(b.n) || !b.p || b.p.length < 3) continue;
    let cx = 0, cz = 0;
    for (const [qx, qz] of b.p) { cx += qx; cz += qz; }
    cx /= b.p.length; cz /= b.p.length;
    const h0 = hash2(cx, cz);
    // batch 12 widens the dressing: crates + standing lanterns join the
    // barrels/buckets on the same apron ring (crate CC0 Quaternius,
    // lantern CC0 KayKit — atlas-baked)
    for (let k = 0; k < 5; k++) {
      const hk = hash2(cx + k * 11, cz - k * 7);
      const aa = ((hk >>> 3) % 628) / 100;
      const rr = 7 + (hk % 40) / 10;
      const px = cx + Math.cos(aa) * rr, pz = cz + Math.sin(aa) * rr;
      const gy = at(px, pz);
      if (gy < 0.5) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      // LEFT AT 0.4 DELIBERATELY. A size-aware margin was tried here while
      // chasing the P1 lantern (0.4 + sc*0.6) and REVERTED: the lantern turned
      // out to come from the viewpoint bench block further down, not from
      // here, so this was a speculative change fixing nothing -- and it
      // silently deleted two bar props from the Central Beach plaza that no
      // check had complained about (caught by the beach-walk golden, which is
      // what that frame is for). Bar clutter sitting at the edge of a plaza
      // outside a beach bar is wanted; do not tighten this without a defect
      // that names it.
      if (window.__onRoad && window.__onRoad(px, pz, 0.4)) continue;
      const kind = ['barrel', 'bucket', 'crate', 'lantern', 'crate'][k % 5];
      const sc = { barrel: 0.9, bucket: 0.45, crate: 0.75, lantern: 0.85 }[kind];
      props[kind].push([px, gy, pz, ((hk >>> 6) % 628) / 100, sc]);
      barProps++;
    }
  }
  addInstanced(world, 'barrel', props.barrel, { shadow: true });
  addInstanced(world, 'bucket', props.bucket, { shadow: true });
  addInstanced(world, 'crate', props.crate, { shadow: true });
  addInstanced(world, 'lantern', props.lantern, { shadow: true });

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
      // NO ROAD GUARD HERE, AND THAT IS DELIBERATE. One was added while
      // clearing audit P1 ("props in a carriageway") and REVERTED the same
      // hour: `__onRoad` also matches the paved plazas, so the guard deleted
      // the flocks from the walked plazas this feature exists to populate --
      // caught by the beach-walk golden, where two birds simply vanished from
      // the Central Beach pavement. A pigeon standing on tarmac is not a
      // defect, it is a pigeon; P1 is about street furniture left in the
      // road, and it now exempts anything tagged `creature` instead.
      pigeons.push([px, gy, pz, ((hk >>> 5) % 628) / 100, 0.28]);
    }
  }
  // tag: 'creature' to match the peacocks and monitors. `anim` never reaches
  // userData (it only feeds the ANIM list), so the pigeons were the one
  // living thing in the world carrying no creature flag for a check to read.
  addInstanced(world, 'pigeon', pigeons, { anim: 'creature', tag: 'creature' });

  // ---- PEAFOWL + WATER MONITORS (batch 7) --------------------------------
  // Sentosa's real free-roaming animals, authored meshes (no CC0 peacock
  // exists — scratchpad authored_fauna.py). Spots are the real roam places:
  // the Capella lawns (home of the famous white peacock), the Palawan
  // Amphitheatre greens, Sentosa Nature Discovery, Tanjong Beach. All
  // hand-probed clear of roads/footprints, code-guarded anyway.
  const PEAS = [
    ['peacock',  -1000, 12990, 0.92], ['peacock', -1018, 12983, 0.88],
    ['peawhite', -1005, 12998, 0.95],
    ['peafan',   -1012, 13006, 1.50],
    ['peacock',  -1360, 12845, 0.90], ['peacock', -1349, 12836, 0.86],
    ['peafan',   -1382, 12820, 1.45],
    ['peacock',  -1755, 12250, 0.90], ['peawhite', -1748, 12262, 0.93],
    ['peacock',   -590, 13620, 0.90], ['peacock',  -585, 13598, 0.87],
    // B14: the sweep's 220 frames showed ZERO animals — spawns were all
    // tucked away. These face the reviewers' open-lawn frames.
    ['peacock',  -1045, 12255, 0.90], ['peawhite', -1055, 12242, 0.93],
    ['peacock',    330, 13318, 0.89], ['peafan',    342, 13306, 1.45],
  ];
  const peaLists = new Map();
  let peas = 0;
  for (const [kind, x, z, sc] of PEAS) {
    if (x < bx0 || x > bx1 || z < bz0 || z > bz1) continue;
    const gy = at(x, z);
    if (gy < 0.4) continue;
    if (window.__onRoad && window.__onRoad(x, z, 0.4)) continue;
    if (window.__inFootprint && window.__inFootprint(x, z)) continue;
    if (window.__onPath && window.__onPath(x, z)) continue;   // lawns, not paths
    let a = peaLists.get(kind);
    if (!a) peaLists.set(kind, a = []);
    a.push([x, gy, z, ((hash2(x, z) % 628) / 100), sc]);
    peas++;
  }
  for (const [kind, list] of peaLists) {
    addInstanced(world, kind, list, { anim: 'strut', shadow: true, tag: 'creature',
      mat: kind === 'peafan' ? { side: THREE.DoubleSide } : {} });
  }

  // monitors sun themselves on the lagoon banks: from each lagoon anchor,
  // ring-scan outward for the first LAND point (the anchors themselves read
  // as water — probed) and lay the lizard along the bank there.
  // maxG: the Cove/ONE°15 quays read 7-10m (the documented land-smear plus
  // genuinely raised quaysides), so the otter scan accepts higher ground and
  // takes the LOWEST land point found — the closest thing to the waterline.
  const bankNear = (mx, mz, maxG = 2.2) => {
    if (mx < bx0 || mx > bx1 || mz < bz0 || mz > bz1) return null;
    let best = null;
    for (let rr = 4; rr <= 80; rr += 4) {
      for (let aa = 0; aa < 6.28; aa += 0.6) {
        const x = mx + Math.cos(aa) * rr, z = mz + Math.sin(aa) * rr;
        const gy = at(x, z);
        if (gy < 0.35 || gy > maxG) continue;
        if (T.waterFloor && T.waterFloor(x, z) !== null) continue;
        if (window.__onRoad && window.__onRoad(x, z, 0.4)) continue;
        if (window.__inFootprint && window.__inFootprint(x, z)) continue;
        if (gy < 2.2) return [x, gy, z];        // true low bank: take it
        if (!best || gy < best[1]) best = [x, gy, z];
      }
    }
    return best;
  };
  const MONS = [[-2350, 12430], [-2180, 12520], [-950, 13140]];
  const monitors = [];
  for (const [mx, mz] of MONS) {
    const found = bankNear(mx, mz);
    if (!found) continue;
    const h = hash2(found[0], found[2]);
    monitors.push([found[0], found[1], found[2], (h % 628) / 100,
      0.18 + (h % 5) / 100]);
  }
  addInstanced(world, 'monitor', monitors, { anim: 'strut', shadow: true, tag: 'creature' });

  // otters — Sentosa Cove's famous smooth-coated romp, loping on the marina
  // banks with one lookout periscoping. Same bank-scan as the monitors.
  const OTTS = [[490, 13710], [1180, 12850]];
  const otters = [], lookouts = [];
  for (const [mx, mz] of OTTS) {
    const found = bankNear(mx, mz, 12);
    if (!found) continue;
    const [fx, fy, fz] = found;
    const h0 = hash2(fx, fz);
    const n = 2 + (h0 % 2);
    for (let k = 0; k < n; k++) {
      const hk = hash2(fx + k * 17, fz - k * 11);
      const px = fx + ((hk % 70) / 10 - 3.5), pz = fz + (((hk >>> 8) % 70) / 10 - 3.5);
      const gy = at(px, pz);
      if (gy < 0.3 || Math.abs(gy - fy) > 1.2) continue;   // stay on the quay level
      if (T.waterFloor && T.waterFloor(px, pz) !== null) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      otters.push([px, gy, pz, ((hk >>> 5) % 628) / 100, 0.27 + (hk % 4) / 100]);
    }
    lookouts.push([fx, fy, fz, (h0 % 628) / 100, 0.5]);
  }
  addInstanced(world, 'otter', otters, { anim: 'strut', shadow: true, tag: 'creature' });
  addInstanced(world, 'otterup', lookouts, { anim: 'strut', shadow: true, tag: 'creature' });

  // kingfishers (batch 9, the first atlas-baked fauna — collared
  // kingfishers are all over Sentosa's shorelines): perched on the banks
  // near water, same bankNear scan as the monitors.
  const KFS = [[-1368, 12852], [-2350, 12430], [490, 13710], [-600, 13640],
    [-1674, 12906]];   // B14: the beach-bend viewpoint frame
  const kingfishers = [];
  for (const [mx, mz] of KFS) {
    const found = bankNear(mx, mz, 6);
    if (!found) continue;
    const h = hash2(found[0], found[2]);
    kingfishers.push([found[0], found[1], found[2], (h % 628) / 100,
      0.26 + (h % 4) / 100]);
  }
  addInstanced(world, 'kingfisher', kingfishers,
    { anim: 'strut', shadow: true, tag: 'creature' });

  // macaque troops (batch 11 — Sentosa's actual long-tailed macaques;
  // AUTHORED, no CC0 monkey exists). Small troops at jungle anchors:
  // Imbiah trail, Fort Siloso greens, Mount Serapong forest edge.
  const TROOPS = [[-1790, 12290], [-2740, 11950], [700, 12930]];
  const macs = { macaque: [], macsit: [] };
  let macCount = 0;
  for (const [mx, mz] of TROOPS) {
    if (mx < bx0 || mx > bx1 || mz < bz0 || mz > bz1) continue;
    const h0 = hash2(mx, mz);
    const n = 2 + (h0 % 3);
    for (let k = 0; k < n; k++) {
      const hk = hash2(mx + k * 13, mz - k * 9);
      const px = mx + ((hk % 90) / 10 - 4.5), pz = mz + (((hk >>> 7) % 90) / 10 - 4.5);
      const gy = at(px, pz);
      if (gy < 0.5) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      if (window.__onRoad && window.__onRoad(px, pz, 0.4)) continue;
      if (window.__onPath && window.__onPath(px, pz)) continue;
      const kind = (hk & 3) === 0 ? 'macsit' : 'macaque';
      // unit height ~0.6/0.5: sc 0.55 = a half-metre monkey
      macs[kind].push([px, gy, pz, ((hk >>> 5) % 628) / 100,
        0.5 + (hk % 3) / 20]);
      macCount++;
    }
  }
  addInstanced(world, 'macaque', macs.macaque, { anim: 'strut', shadow: true, tag: 'creature' });
  addInstanced(world, 'macsit', macs.macsit, { anim: 'strut', shadow: true, tag: 'creature' });

  // ---- B14 VIEWPOINTS + LAWN BREAKERS (beauty sweep, research/
  // beauty-sweep-2026-08-23.md) — a bench+lantern pair at each scenic
  // spot the reviewers said "nothing invites you to stop", and rock
  // clusters breaking the flattest lawns. All existing models.
  const VIEWS = [[-2838, 11869], [-2098, 12014], [-1674, 12906],
    [1190, 13420], [-98, 14169], [-825, 13349]];
  const vBench = [], vLant = [];
  for (const [vx, vz] of VIEWS) {
    if (vx < bx0 || vx > bx1 || vz < bz0 || vz > bz1) continue;
    const h = hash2(vx, vz);
    // ring-scan for open standable ground near the anchor
    let seat = null;
    for (let rr = 0; rr <= 24 && !seat; rr += 4) {
      for (let aa = 0; aa < 6.28; aa += 0.7) {
        const x = vx + Math.cos(aa) * rr, z = vz + Math.sin(aa) * rr;
        const gy = at(x, z);
        if (gy < 0.6) continue;
        if (window.__inFootprint && window.__inFootprint(x, z)) continue;
        // 1.2, not 0.4: the bench MODEL is 2.11m long by 0.77m deep, so a
        // seat centred 0.4m off the tarmac still has half a bench lying in
        // it. That is what put the Tanjong pair in the middle of Tanjong
        // Beach Walk (audit P1) with both spots passing their checks
        // honestly. Clearance has to be measured against the thing being
        // placed, not against a number that predates it.
        if (window.__onRoad && window.__onRoad(x, z, 1.2)) continue;
        if (window.__onPath && window.__onPath(x, z)) continue;
        seat = [x, gy, z];
        break;
      }
    }
    if (!seat) continue;
    const yaw = ((h >>> 3) % 628) / 100;
    vBench.push([seat[0], seat[1], seat[2], yaw, 1.0]);
    // THE LANTERN GOT NO CHECKS AT ALL. The seat was ring-scanned against
    // footprints, roads and paths, and then the lantern was dropped 1.6m in
    // front of it with nothing tested -- the anchor was validated and its
    // satellite was assumed to be fine, the same shape of mistake as the
    // pigeon flocks scattered +-6m from a validated centre. Try in front,
    // then behind, and if neither is clear the bench simply stands alone.
    const lampOk = (x, z) => !(window.__inFootprint && window.__inFootprint(x, z))
      && !(window.__onRoad && window.__onRoad(x, z, 0.9))
      && !(window.__onPath && window.__onPath(x, z));
    for (const sgn of [1, -1]) {
      const lx = seat[0] + Math.cos(yaw) * 1.6 * sgn;
      const lz = seat[2] - Math.sin(yaw) * 1.6 * sgn;
      if (!lampOk(lx, lz)) continue;
      vLant.push([lx, at(lx, lz), lz, yaw, 0.85]);
      break;
    }
  }
  addInstanced(world, 'bench', vBench, { shadow: true });
  addInstanced(world, 'lantern', vLant, { shadow: true });

  const LAWNS = [[-891, 12469], [-1049, 12249], [334, 13312],
    [309, 13103], [-691, 13154]];
  const lawnRocks = { rockA: [], mkrockA: [], mkrockB: [] };
  for (const [lx2, lz2] of LAWNS) {
    if (lx2 < bx0 || lx2 > bx1 || lz2 < bz0 || lz2 > bz1) continue;
    const h0 = hash2(lx2, lz2);
    const n = 3 + (h0 % 3);
    for (let k = 0; k < n; k++) {
      const hk = hash2(lx2 + k * 19, lz2 - k * 13);
      const px = lx2 + ((hk % 240) / 10 - 12), pz = lz2 + (((hk >>> 8) % 240) / 10 - 12);
      const gy = at(px, pz);
      if (gy < 0.6) continue;
      if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
      if (window.__onRoad && window.__onRoad(px, pz, 0.4)) continue;
      if (window.__onPath && window.__onPath(px, pz)) continue;
      const kind = ['rockA', 'mkrockA', 'mkrockB'][hk % 3];
      lawnRocks[kind].push([px, gy - 0.15, pz, ((hk >>> 5) % 628) / 100,
        0.8 + ((hk >>> 10) % 14) / 10]);
    }
  }
  for (const k of Object.keys(lawnRocks)) {
    addInstanced(world, k, lawnRocks[k], { shadow: true });
  }

  // ---- B15 ARRIVAL FLAGS (beauty sweep: the causeway was the island's
  // barest, most-seen stretch — 12+ frames). Authored pennant poles
  // (authored_props.py) along both parapet lines, seated on the DECK via
  // __surfaceAt (the two-datums lesson: at() answers the SEA under a
  // bridge), plus the blank RWS park wall line the reviewers flagged.
  // the causeway CENTERLINE is hand-known; the deck EDGE is found per
  // station by scanning outward — a guessed parapet line missed the deck
  // (vet 2026-08-23: one pole out of thirty)
  const FLAGAXES = [
    { a: [-1056, 11810], b: [-1046, 12148], step: 35, edge: true },
    { a: [-950, 12310], b: [-1065, 12470], step: 28, edge: false },
  ];
  const flags = { flagT: [], flagC: [] };
  for (const { a, b, step, edge } of FLAGAXES) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (let s = 0; s <= L; s += step) {
      const cx2 = a[0] + ux * s, cz2 = a[1] + uz * s;
      if (cx2 < bx0 - 40 || cx2 > bx1 + 40 || cz2 < bz0 - 40 || cz2 > bz1 + 40) continue;
      const sides = edge ? [1, -1] : [0];
      for (const side of sides) {
        let placed = false;
        const offs = edge ? [11, 10, 9, 8, 7] : [0];
        for (const off of offs) {
          const px = cx2 - uz * side * off, pz = cz2 + ux * side * off;
          const h = hash2(px, pz);
          const gy = window.__surfaceAt ? window.__surfaceAt(px, pz) : at(px, pz);
          if (gy === null || gy === undefined || gy < 0.3) continue;
          if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
          if (window.__onRoad && window.__onRoad(px, pz, 0.2)) continue;
          const kind = (h & 1) ? 'flagT' : 'flagC';
          flags[kind].push([px, gy, pz, ((h >>> 3) % 628) / 100, 6.0]);
          placed = true;
          break;
        }
        void placed;
      }
    }
  }
  addInstanced(world, 'flagT', flags.flagT, { shadow: true });
  addInstanced(world, 'flagC', flags.flagC, { shadow: true });

  return { boats, fish, creatures, shoreRocks: shore, cliffRocks: cliff,
    barProps, pigeons: pigeons.length, peas, monitors: monitors.length,
    otters: otters.length + lookouts.length };
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
    } else if (e.kind === 'strut') {          // ground animal: slow look-around,
      yaw += Math.sin(t * 0.35 + e.ph) * 0.55; // no hop (a peacock struts, a
      y += Math.abs(Math.sin(t * 1.2 + e.ph)) * 0.015; // monitor never hops)
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
