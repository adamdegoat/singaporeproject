// TIME ATTACK — the first game layer (owner's call, 2026-08-20: Time Attack
// plus sound back on). Four signature runs, each hung on a REAL named way so
// a gate can never float off the map: the route IS the stitched polyline of
// the named fragments, the same per-NAME stitch city.js's streetRuns does
// (that stitcher lives inside city.js's build closure; the chain step is
// re-stated here rather than exported because it is ~20 lines and this module
// must not reach into a builder's scope. If the join tolerance ever changes,
// change it in both — grep CHAIN_JOIN_M).
//
// The game: skate through the start arch, the clock runs, hit every
// checkpoint flag in order, cross the chequered finish. Best time and the
// best run's path are kept in localStorage; the best run skates beside you
// as a translucent ghost. Sound cues come through Sound.cue() and are never
// load-bearing — the HUD line carries the same information.
//
// Everything here is placed through groundAt and casts no shadow.
//
// "A WHOLE RUN'S FURNITURE IS ~10 SMALL MESHES, FAR BELOW ANY PERF LINE WORTH
// MEASURING" — that is what this line said until 2026-08-30, and it was wrong
// by five times. Counted in the frame `hotviews` and `mobilefps` both judge
// (Tanjong Beach Walk): **56 draw calls under this group, for 1,000
// triangles** — about eighteen triangles per draw, 8% of the whole frame's
// draw calls for 0.06% of its geometry.
//
// The cause is call ORDER, not this file: `consolidate(world)` — the batcher —
// runs at main.js:4332 and `buildTimeAttack` at 4699, and this module adds to
// `scene` rather than `world`, so the layer is built after the only pass that
// would have merged it and outside the tree it walks. Rather than move a game
// layer's construction to satisfy a batcher, it bakes itself: see bakeStatic
// below. Nothing here is animated (only the ghost rig is, and it is added
// separately), so the furniture is static geometry the moment it is placed.

import { sharedSignAtlas } from './tex.js';

const CHAIN_JOIN_M = 1.5;              // same figure as city.js streetRuns
const GATE_R = 11;                     // metres: a path-width crossing circle
const OFF_COURSE_M = 70;               // this far from the next gate's line = run over
const RUNS = [
  // id, display name, way name in the data, minimum stitched length to count.
  // FOOTPATHS ONLY: an arch pole stands 3.2m off the centreline, which is IN
  // the carriageway on any real road (the world audit's oldest defect class).
  // Cove Drive was dropped from the first draft for exactly that.
  ['siloso',  'SILOSO RUN',  'Siloso Beach Walk',  400],
  ['tanjong', 'TANJONG RUN', 'Tanjong Beach Walk', 250],
  ['palawan', 'PALAWAN RUN', 'Palawan Beach Walk', 250],
  ['imbiah',  'IMBIAH RUN',  'Imbiah Walk',        250],
];

function chainByName(roads, name) {
  const chains = [];
  for (const r of roads) {
    if ((r.n || '') !== name || !r.p || r.p.length < 2) continue;
    chains.push(r.p.map((q) => [q[0], q[1]]));
  }
  const J2 = CHAIN_JOIN_M * CHAIN_JOIN_M;
  const near2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 <= J2;
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < chains.length; i++) {
      for (let j = i + 1; j < chains.length; j++) {
        const a = chains[i], b = chains[j];
        let joined = null;
        if (near2(a[a.length - 1], b[0])) joined = a.concat(b.slice(1));
        else if (near2(b[b.length - 1], a[0])) joined = b.concat(a.slice(1));
        else if (near2(a[a.length - 1], b[b.length - 1])) joined = a.concat(b.slice(0, -1).reverse());
        else if (near2(a[0], b[0])) joined = a.slice(1).reverse().concat(b);
        if (joined) { chains[i] = joined; chains.splice(j, 1); merged = true; break outer; }
      }
    }
  }
  // the LONGEST chain is the run; spurs and orphans are dropped, counted
  let best = null, bestLen = 0, dropped = 0;
  for (const c of chains) {
    let L = 0;
    for (let i = 1; i < c.length; i++) L += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]);
    if (L > bestLen) { if (best) dropped++; bestLen = L; best = c; }
    else dropped++;
  }
  return { line: best, length: bestLen, dropped };
}

// walk the polyline and return the point (and tangent) at arc-length s
function pointAt(line, s) {
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const dx = line[i][0] - line[i - 1][0], dz = line[i][1] - line[i - 1][1];
    const seg = Math.hypot(dx, dz);
    if (acc + seg >= s) {
      const f = (s - acc) / seg;
      return { x: line[i - 1][0] + dx * f, z: line[i - 1][1] + dz * f,
               tx: dx / seg, tz: dz / seg };
    }
    acc += seg;
  }
  const n = line.length;
  const dx = line[n - 1][0] - line[n - 2][0], dz = line[n - 1][1] - line[n - 2][1];
  const seg = Math.hypot(dx, dz) || 1;
  return { x: line[n - 1][0], z: line[n - 1][1], tx: dx / seg, tz: dz / seg };
}

export function buildTimeAttack({ THREE, scene, data, groundAt, sound, ghostRig }) {
  const runs = [];
  let skipped = 0;
  const group = new THREE.Group();
  group.name = 'timeattack';

  const signAtlas = sharedSignAtlas(THREE);
  const poleM = new THREE.MeshLambertMaterial({ color: 0x1f6f6b });   // the banner-pole teal
  const flagM = new THREE.MeshLambertMaterial({ color: 0xc4442f });   // the board-rail red
  const white = new THREE.MeshLambertMaterial({ color: 0xf2efe8 });
  const dark  = new THREE.MeshLambertMaterial({ color: 0x22242a });

  const noShadow = (m) => { m.castShadow = false; m.receiveShadow = false; return m; };

  // WHERE EVERY POST STANDS, PUBLISHED, because a check must not have to guess
  // from geometry. data/tacheck.mjs's A8 — "nothing this game builds may stand
  // in a carriageway", written the morning 24 of 32 posts were found in the
  // road — found the posts by `o.geometry.type === 'CylinderGeometry'`. The
  // moment the furniture was baked into merged buffers (see bakeStatic) that
  // test matched NOTHING and A8 passed 0/0: the project's oldest failure, a
  // detector that can no longer see the thing it was written for, and it would
  // have shipped green. The positions are the ground truth whatever the
  // geometry ends up as, so they are published instead.
  const posts = [];

  // an arch: two slim poles either side of the path plus a crossbar. The
  // finish crossbar is chequered (alternating boxes), the start bar is teal.
  // HOW FAR OUT A POST HAS TO STAND, MEASURED, NOT ASSUMED.
  //
  // This module shipped with `half = 3.2` and a comment claiming the runs were
  // "FOOTPATHS ONLY" so a post could never land in a carriageway — Cove Drive
  // was dropped from the first draft for exactly that reason. THE PREMISE WAS
  // FALSE. All four beach walks are `unclassified` or `residential` ways EIGHT
  // METRES WIDE in the extract, so half the carriageway is 4m and a post at
  // 3.2m stands INSIDE it. Measured the morning after it shipped: 24 of 32
  // posts were in the road — the oldest defect class on this project,
  // reintroduced by the check that was supposed to prevent it.
  //
  // So ask the road how wide it is and step outside it, then ask __onRoad —
  // the same index the rest of the world uses — and keep stepping until the
  // spot is clear. Capped, because a post 9m out is no longer a gate; if
  // nothing clear is found the widest tried is used and the run still works.
  function clearHalf(p, wayHalf) {
    let h = Math.max(3.2, wayHalf + 0.7);
    if (!(typeof window !== 'undefined' && window.__onRoad)) return h;
    for (let k = 0; k < 8; k++) {
      const bad = [-1, 1].some((side) =>
        window.__onRoad(p.x + -p.tz * h * side, p.z + p.tx * h * side, 0));
      if (!bad) return h;
      h += 0.6;
    }
    return h;
  }

  function arch(p, chequered, half, label) {
    const g = new THREE.Group();
    for (const side of [-1, 1]) {
      const x = p.x + -p.tz * half * side, z = p.z + p.tx * half * side;
      posts.push([x, z]);
      const pole = noShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), poleM));
      pole.position.set(x, groundAt(x, z) + 1.7, z);
      g.add(pole);
    }
    const span = half * 2;
    // THE START ARCH SAYS WHAT IT IS.
    //
    // Four of these went up on four beaches with nothing anywhere naming them,
    // so two teal poles and a crossbar were a start line only to someone who
    // already knew. The map now lists the runs, but a player who simply rides
    // past one should still be told — a game you can walk through without
    // noticing is not discoverable, it is merely documented.
    //
    // Facing BACK down the approach, so it reads to a rider arriving, and hung
    // under the bar rather than over it: above the crossbar it competes with
    // the sky and the tree line, under it the bar itself is the backdrop.
    // sharedSignAtlas marks its page needsUpdate on every add, so adding text
    // here — long after sgdetail has uploaded the page — is safe (that trap
    // was found and closed by the floating place names).
    if (!chequered && label) {
      const uv = signAtlas.add(label, '#1f6f6b', '#f4f0e6');
      const w = Math.min(span * 0.82, 5.2);
      const plate = new THREE.Mesh(signAtlas.plane(w, w * 0.17, uv), uv.mat);
      plate.rotation.y = Math.atan2(-p.tx, -p.tz);
      plate.position.set(p.x, groundAt(p.x, p.z) + 3.12, p.z);
      plate.castShadow = false; plate.receiveShadow = false;
      g.add(plate);
    }
    if (chequered) {
      const n = 8, w = span / n;
      for (let i = 0; i < n; i++) {
        const f = -half + w * (i + 0.5);
        const box = noShadow(new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, 0.1), i % 2 ? dark : white));
        const x = p.x + -p.tz * f, z = p.z + p.tx * f;
        box.position.set(x, groundAt(p.x, p.z) + 3.4, z);
        box.rotation.y = Math.atan2(p.tx, p.tz) + Math.PI / 2;
        g.add(box);
      }
    } else {
      const bar = noShadow(new THREE.Mesh(new THREE.BoxGeometry(span, 0.22, 0.1), poleM));
      bar.position.set(p.x, groundAt(p.x, p.z) + 3.4, p.z);
      bar.rotation.y = Math.atan2(p.tx, p.tz) + Math.PI / 2;
      g.add(bar);
    }
    return g;
  }

  // a checkpoint: one pole with a small red pennant, on the left of travel
  function flag(p, half) {
    const g = new THREE.Group();
    const x = p.x + -p.tz * -half, z = p.z + p.tx * -half;
    const y = groundAt(x, z);
    posts.push([x, z]);
    const pole = noShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6), poleM));
    pole.position.set(x, y + 1.4, z);
    const pen = noShadow(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.04), flagM));
    pen.position.set(x + 0.35, y + 2.5, z);
    g.add(pole, pen);
    return g;
  }

  for (const [id, label, wayName, minLen] of RUNS) {
    const { line, length, dropped } = chainByName(data.roads || [], wayName);
    if (!line || length < minLen) { skipped++; continue; }
    // gates: start, two checkpoints at thirds, finish
    const gates = [0, length / 3, (2 * length) / 3, length].map((s) => pointAt(line, s));
    // the WIDEST fragment carrying this name — a run stitched from an 8m
    // stretch and a 3.8m one has to clear the 8m
    let wayW = 0;
    for (const rr of (data.roads || [])) {
      if ((rr.n || '') === wayName && (rr.w || 0) > wayW) wayW = rr.w || 0;
    }
    // AND IF NO OFFSET IS CLEAR, MOVE THE GATE, NOT THE POST.
    //
    // Four posts survived the clearance step above, all of them at JUNCTIONS —
    // the Tanjong start where the walk meets Artillery Avenue South, the
    // Imbiah gates on Siloso Road. At a crossroads there is no sideways offset
    // that is not in some carriageway, so pushing the post further out only
    // makes a wider gate that is still in a road. Slide the GATE along the run
    // instead: it stays on the same named way, the run is the same run, and a
    // few metres of arc-length is not a thing a player can notice. Tried
    // nearest-first, and the original position is kept if nothing is better.
    const anchors = [0, 8, -8, 16, -16, 24, -24];
    for (let gi = 0; gi < gates.length; gi++) {
      const s0 = [0, length / 3, (2 * length) / 3, length][gi];
      for (const d of anchors) {
        const s = Math.max(0, Math.min(length, s0 + d));
        const cand = pointAt(line, s);
        const h = clearHalf(cand, wayW / 2);
        const clear = !(typeof window !== 'undefined' && window.__onRoad)
          || ![-1, 1].some((side) =>
               window.__onRoad(cand.x + -cand.tz * h * side, cand.z + cand.tx * h * side, 0));
        if (clear) { gates[gi] = cand; break; }
      }
    }
    const halves = gates.map((g) => clearHalf(g, wayW / 2));
    group.add(arch(gates[0], false, halves[0], label));
    group.add(flag(gates[1], halves[1]));
    group.add(flag(gates[2], halves[2]));
    group.add(arch(gates[3], true, halves[3]));
    // GUARDED, like the ghost read and the two writes below. This one read
    // was the only unguarded localStorage access left in the file, and it sat
    // inside the run-BUILDING loop: on iOS private browsing (and anywhere the
    // user has blocked site data) `getItem` throws, the first course aborted
    // the loop, and **the entire time-attack layer silently did not exist** --
    // no start arches, no clock, no ghosts, and NOT ONE console error. Proved
    // by A/B with the same harness: storage working builds 4 courses, storage
    // throwing builds 0. A missing best time just means no best time yet.
    let best = null;
    try { best = +(localStorage.getItem('sg_ta_' + id) || 0) || null; } catch (e) { /* private mode */ }
    runs.push({ id, label, wayName, line, length, gates, best });
    console.log(`timeattack: ${label} on "${wayName}" ${Math.round(length)}m` +
      (dropped ? ` (${dropped} spur fragment${dropped > 1 ? 's' : ''} dropped)` : ''));
  }
  if (skipped) console.log(`timeattack: ${skipped} run(s) skipped — way missing or short`);

  // BAKE THE COURSE FURNITURE INTO ONE MESH PER MATERIAL.
  //
  // Every piece above is placed once and never moved, so its world transform
  // can go into the vertices and the whole layer collapses to a handful of
  // draws. The buckets are keyed by MATERIAL IDENTITY, not by colour: the four
  // Lambert materials and the sign atlas are each shared across every run
  // already, so this is four or five buckets whatever the island grows to.
  //
  // COPIED BY POSITION COUNT, NOT BY ARRAY LENGTH — the same rule city.js's
  // Merger._bucket states and for the same reason: one geometry without a uv
  // (or with a differently-sized one) makes `set()` write past the end of the
  // destination, which throws mid-build. Anything missing is zero-filled.
  function bakeStatic(root) {
    root.updateMatrixWorld(true);
    const buckets = new Map();
    const drop = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m) return;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      if (!buckets.has(m)) buckets.set(m, []);
      buckets.get(m).push(g);
      drop.push(o);
    });
    for (const o of drop) if (o.parent) o.parent.remove(o);
    let made = 0;
    for (const [mat, list] of buckets) {
      let n = 0;
      for (const g of list) n += g.attributes.position.count;
      const pos = new Float32Array(n * 3);
      const nor = new Float32Array(n * 3);
      const uv = new Float32Array(n * 2);
      let o3 = 0, o2 = 0;
      for (const g of list) {
        const c = g.attributes.position.count;
        pos.set(g.attributes.position.array.subarray(0, c * 3), o3);
        if (g.attributes.normal) nor.set(g.attributes.normal.array.subarray(0, c * 3), o3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, c * 2), o2);
        o3 += c * 3; o2 += c * 2;
        g.dispose();
      }
      const bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      bg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      bg.computeBoundingSphere();
      const mesh = new THREE.Mesh(bg, mat);
      mesh.castShadow = false; mesh.receiveShadow = false;
      mesh.name = 'taFurniture';
      root.add(mesh);
      made++;
    }
    console.log(`timeattack: ${drop.length} pieces baked into ${made} draw call(s)`);
  }
  bakeStatic(group);
  if (typeof window !== 'undefined') window.__taPosts = posts;

  scene.add(group);

  // ---- the HUD line. One element, created here, hidden when no run is live.
  const el = document.createElement('div');
  el.id = 'ta';
  el.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);' +
    'font:600 15px/1.3 -apple-system,system-ui,sans-serif;color:#fff;' +
    'background:rgba(20,24,28,.72);padding:6px 14px;border-radius:8px;' +
    'letter-spacing:.4px;display:none;z-index:30;pointer-events:none;white-space:nowrap';
  document.body.appendChild(el);
  const fmt = (ms) => {
    const s = ms / 1000;
    return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
  };

  // ---- the ghost: the best run's recorded path, played back as a
  // translucent copy of the skater. ghostRig is a fresh buildSkate/buildSkater
  // pair handed in by main.js; its materials are made see-through here.
  let ghost = null;
  if (ghostRig) {
    ghost = ghostRig;
    ghost.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone();
        o.material.transparent = true;
        o.material.opacity = 0.32;
        o.material.depthWrite = false;
        o.castShadow = false;
      }
    });
    ghost.visible = false;
    scene.add(ghost);
  }

  // ---- run state
  let live = null;       // { run, t0clock, nextGate, samples }
  let ghostTrack = null; // samples of the best run while one is live
  let flash = 0;         // HUD flash timer after finish/cancel

  const dist2 = (x, z, g) => (x - g.x) ** 2 + (z - g.z) ** 2;

  // squared distance from (x,z) to the nearest point of the run's own line —
  // the off-course test. Distance to a GATE cannot be the test: gates sit a
  // third of the run apart, so the middle of an honest run is far from both.
  function lineDist2(line, x, z) {
    let best = Infinity;
    for (let i = 1; i < line.length; i++) {
      const ax = line[i - 1][0], az = line[i - 1][1];
      const bx = line[i][0], bz = line[i][1];
      const dx = bx - ax, dz = bz - az;
      const L2 = dx * dx + dz * dz || 1e-9;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      const px = ax + dx * f, pz = az + dz * f;
      const d = (x - px) ** 2 + (z - pz) ** 2;
      if (d < best) best = d;
    }
    return best;
  }

  function startRun(run, clock, S) {
    live = { run, t0: clock, nextGate: 1,
             samples: [[0, +S.x.toFixed(2), +S.z.toFixed(2), +S.heading.toFixed(3)]] };
    ghostTrack = null;
    try { ghostTrack = JSON.parse(localStorage.getItem('sg_ta_ghost_' + run.id) || 'null'); } catch (e) { /* corrupt = no ghost */ }
    if (ghost) ghost.visible = !!(ghostTrack && ghostTrack.length > 1);
    sound && sound.cue('go');
  }

  function endRun(clock, finished) {
    if (!live) return;
    const run = live.run;
    if (finished) {
      const ms = Math.round((clock - live.t0) * 1000);
      const isBest = !run.best || ms < run.best;
      if (isBest) {
        run.best = ms;
        try {
          localStorage.setItem('sg_ta_' + run.id, String(ms));
          localStorage.setItem('sg_ta_ghost_' + run.id, JSON.stringify(live.samples));
        } catch (e) { /* private mode: the run still counts on screen */ }
      }
      sound && sound.cue(isBest ? 'best' : 'finish');
      el.textContent = `${run.label} ${fmt(ms)}` + (isBest ? ' · NEW BEST' : ` · best ${fmt(run.best)}`);
      flash = 4;
    } else {
      el.textContent = `${run.label} · run left`;
      flash = 2;
    }
    live = null;
    if (ghost) ghost.visible = false;
  }

  // called every frame in ride mode; S is the ride state, clock in seconds
  function update(S, clock) {
    if (flash > 0) {
      flash -= 1 / 60;
      el.style.display = '';
      if (flash <= 0) el.style.display = 'none';
      if (live === null && flash > 0) return;
    }
    if (!live) {
      // crossing a start circle AT SPEED starts the run — a flying start.
      // Without the speed gate, teleporting to a beach from the travel map
      // landed ON the gate and the clock ran while the rider stood still.
      if (Math.abs(S.speed) > 2.5) {
        for (const run of runs) {
          if (dist2(S.x, S.z, run.gates[0]) < GATE_R * GATE_R) { startRun(run, clock, S); break; }
        }
      }
      if (!live) { if (flash <= 0) el.style.display = 'none'; return; }
    }
    const t = clock - live.t0;
    const run = live.run;
    const gate = run.gates[live.nextGate];
    // record for the ghost at ~7Hz
    const last = live.samples[live.samples.length - 1];
    if (t - last[0] > 0.14) live.samples.push([+t.toFixed(2), +S.x.toFixed(2), +S.z.toFixed(2), +S.heading.toFixed(3)]);
    // gate crossing
    if (dist2(S.x, S.z, gate) < GATE_R * GATE_R) {
      live.nextGate++;
      if (live.nextGate >= run.gates.length) { endRun(clock, true); return; }
      sound && sound.cue('check');
    } else if (lineDist2(run.line, S.x, S.z) > OFF_COURSE_M * OFF_COURSE_M) {
      // this far off the route's own line, the rider has left the run
      endRun(clock, false); return;
    }
    // ghost playback
    if (ghost && ghostTrack && ghost.visible) {
      let i = 1;
      while (i < ghostTrack.length && ghostTrack[i][0] < t) i++;
      if (i >= ghostTrack.length) { ghost.visible = false; }
      else {
        const a = ghostTrack[i - 1], b = ghostTrack[i];
        const f = (t - a[0]) / Math.max(0.01, b[0] - a[0]);
        const gx = a[1] + (b[1] - a[1]) * f, gz = a[2] + (b[2] - a[2]) * f;
        ghost.position.set(gx, groundAt(gx, gz), gz);
        // shortest-angle lerp: a raw lerp across the +-PI wrap spins the ghost
        let dh = b[3] - a[3];
        if (dh > Math.PI) dh -= 2 * Math.PI;
        else if (dh < -Math.PI) dh += 2 * Math.PI;
        ghost.rotation.y = a[3] + dh * f;
      }
    }
    el.style.display = '';
    el.textContent = `${run.label} ${fmt(t * 1000)} · CP ${live.nextGate - 1}/${run.gates.length - 2}` +
      (run.best ? ` · best ${fmt(run.best)}` : '');
  }

  // stepping off the board or teleporting away abandons the run quietly
  function cancel(clock) { if (live) endRun(clock || 0, false); }

  return { update, cancel, runs, group };
}
