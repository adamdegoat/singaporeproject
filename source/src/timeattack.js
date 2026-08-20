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
// Everything here is placed through groundAt and casts no shadow; a whole
// run's furniture is ~10 small meshes, far below any perf line worth
// measuring.

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

  const poleM = new THREE.MeshLambertMaterial({ color: 0x1f6f6b });   // the banner-pole teal
  const flagM = new THREE.MeshLambertMaterial({ color: 0xc4442f });   // the board-rail red
  const white = new THREE.MeshLambertMaterial({ color: 0xf2efe8 });
  const dark  = new THREE.MeshLambertMaterial({ color: 0x22242a });

  const noShadow = (m) => { m.castShadow = false; m.receiveShadow = false; return m; };

  // an arch: two slim poles either side of the path plus a crossbar. The
  // finish crossbar is chequered (alternating boxes), the start bar is teal.
  function arch(p, chequered) {
    const g = new THREE.Group();
    const half = 3.2;                  // clears the widest beach walk
    for (const side of [-1, 1]) {
      const x = p.x + -p.tz * half * side, z = p.z + p.tx * half * side;
      const pole = noShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), poleM));
      pole.position.set(x, groundAt(x, z) + 1.7, z);
      g.add(pole);
    }
    const span = half * 2;
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
  function flag(p) {
    const g = new THREE.Group();
    const x = p.x + -p.tz * -3.2, z = p.z + p.tx * -3.2;
    const y = groundAt(x, z);
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
    group.add(arch(gates[0], false));
    group.add(flag(gates[1]));
    group.add(flag(gates[2]));
    group.add(arch(gates[3], true));
    runs.push({ id, label, wayName, line, length, gates,
      best: +(localStorage.getItem('sg_ta_' + id) || 0) || null });
    console.log(`timeattack: ${label} on "${wayName}" ${Math.round(length)}m` +
      (dropped ? ` (${dropped} spur fragment${dropped > 1 ? 's' : ''} dropped)` : ''));
  }
  if (skipped) console.log(`timeattack: ${skipped} run(s) skipped — way missing or short`);
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
