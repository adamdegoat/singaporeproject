#!/usr/bin/env node
// TIME ATTACK gate: RIDE a run, end to end, and check what only a complete
// lap can show.
//
//     node data/tacheck.mjs               # all four runs
//     SG_TA=siloso node data/tacheck.mjs  # one run
//
// WHY THIS EXISTS. Time Attack shipped on 2026-08-20 with the arches placed,
// the HUD drawn, the runs built and the bundle compiling — and NOBODY HAD
// RIDDEN ONE. Every piece was verified in isolation: the run geometry by a
// probe on __ta, the arch by a screenshot, the clock by watching the HUD tick
// for a second. None of that touches the four things that only exist at the
// END of a run: the checkpoint sequence, the finish, the best-time write, and
// the ghost. A game whose finish line has never been crossed is not a game
// that has been tested.
//
// The rider here is an AUTOPILOT, not a teleport chain: __teleport cancels a
// live run by design, so a probe that hops from gate to gate would prove
// nothing. It drives — full throttle, steering at a lookahead point on the
// run's own polyline — which means this gate also fails when something is
// STANDING IN the run (the oldest defect class on this project) because the
// board stalls against it and the stall is reported with its coordinates.
//
// Named checks:
//   A1  run starts        flying start through the arch sets the clock going
//   A2  checkpoints       CP 1 then CP 2, in order, no skips
//   A3  finish            the chequered arch ends the run and prints a time
//   A4  best time saved   localStorage sg_ta_<id> holds that time
//   A5  ghost saved       sg_ta_ghost_<id> holds the samples, >1 of them
//   A6  ghost replays     a second lap shows the translucent rig, moving
//   A7  no stall          the board never sits still for 3s mid-run
//   A8  nothing in the road  no gate post stands in a carriageway
//
// Needs the dev server on :8933 and Playwright's chromium.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('tacheck.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
const ONLY = (process.env.SG_TA || '').split(',').filter(Boolean);
const LAP_MS = +(process.env.SG_LAP_MS || 240000);   // hang guard for one lap

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
         '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.setDefaultTimeout(180000);
page.on('pageerror', (e) => console.log('  page error:', e.message));
page.on('console', (m) => { const t = m.text(); if (/timeattack|time attack/i.test(t)) console.log('  ' + t); });
// A CLEAN SLATE, before the module reads it. buildTimeAttack loads the best
// time at build, so clearing storage after boot would leave a stale best in
// memory and A4 would compare against a number the run never set.
await page.addInitScript(() => {
  try { for (const k of Object.keys(localStorage)) if (k.startsWith('sg_ta_')) localStorage.removeItem(k); }
  catch (e) { /* private mode: the probe still rides */ }
});
await page.goto(`http://localhost:${PORT}/?dpr=1&noaudio&scene=sentosa`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 180000 });
const boot = await page.evaluate(() => window.__bootError || null);
if (boot) { console.error('boot failed: ' + String(boot).slice(0, 600)); await browser.close(); process.exit(2); }
await page.waitForTimeout(1500);

const runs = await page.evaluate(() => (window.__ta ? window.__ta.runs.map((r) => ({
  id: r.id, label: r.label, length: Math.round(r.length), gates: r.gates.length })) : null));
if (!runs) { console.error('no window.__ta — time attack did not build'); await browser.close(); process.exit(2); }
console.log(`  ${runs.length} run(s): ` + runs.map((r) => `${r.id} ${r.length}m`).join(', '));

// A8 — NOTHING THIS GAME BUILDS MAY STAND IN A CARRIAGEWAY.
//
// The module shipped with a hardcoded 3.2m post offset and a comment claiming
// the runs were footpaths so it could never happen; all four beach walks are
// EIGHT METRE roads and 24 of 32 posts were in the road the next morning. It is
// the oldest defect class on this project and the game layer walked straight
// into it, so it gets a check that asks the road index rather than a comment
// that asserts. Runs first — it needs nothing but the built world.
// IT READS A PUBLISHED LIST, NOT THE GEOMETRY (2026-08-30). This used to find
// the posts with `o.geometry.type === 'CylinderGeometry'` and walk the
// timeattack group. The day that group was baked into merged buffers for the
// draw-call win, the test matched NOTHING and this line printed `ok A8 posts
// clear of the road 0/0 clear` — green, and checking nothing. That is this
// project's oldest failure and it nearly shipped inside the very change that
// caused it.
//
// `window.__taPosts` is written by buildTimeAttack at the moment each post is
// placed, so it cannot drift with how the geometry is stored. AN EMPTY OR
// MISSING LIST IS A FAILURE, not a pass: a check that finds nothing to check
// must say so.
const posts = await page.evaluate(() => {
  const list = window.__taPosts;
  if (!Array.isArray(list) || !list.length) {
    return { n: 0, bad: ['window.__taPosts missing or empty — A8 checked nothing'] };
  }
  const bad = [];
  for (const [x, z] of list) {
    if (window.__onRoad && window.__onRoad(x, z, 0)) {
      bad.push(`${window.__nearestStreet(x, z)} (${x.toFixed(0)},${z.toFixed(0)})`);
    }
  }
  return { n: list.length, bad };
});
console.log(`  ${posts.bad.length ? 'FAIL' : 'ok  '} A8 posts clear of the road  ` +
  `${posts.n - posts.bad.length}/${posts.n} clear` +
  (posts.bad.length ? ` — IN THE ROAD: ${posts.bad.slice(0, 6).join('; ')}` : ''));
const postFails = posts.bad.length ? [`A8: ${posts.bad.length} gate post(s) stand in a carriageway`] : [];

// ---- the autopilot. Runs inside the page: a rAF loop that steers toward a
// lookahead point on the run's polyline and reports what the HUD said.
async function ride(id, lapMs) {
  return await page.evaluate(async ([id, lapMs]) => {
    let runup = 0;                        // measured below, reported in out
    const run = window.__ta.runs.find((r) => r.id === id);
    const line = run.line;
    // arc-length table, so the lookahead can walk the line instead of the
    // rider guessing which segment they are on
    const cum = [0];
    for (let i = 1; i < line.length; i++)
      cum.push(cum[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
    const total = cum[cum.length - 1];
    const at = (s) => {
      s = Math.max(0, Math.min(total, s));
      let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
      const f = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      return [line[i - 1][0] + (line[i][0] - line[i - 1][0]) * f,
              line[i - 1][1] + (line[i][1] - line[i - 1][1]) * f];
    };
    // nearest arc-length to a point, searched forward from the last one so a
    // hairpin cannot throw the rider back to the start of the line
    const nearestS = (x, z, from) => {
      let best = from, bd = Infinity;
      for (let s = Math.max(0, from - 6); s <= Math.min(total, from + 60); s += 1) {
        const p = at(s); const d = (p[0] - x) ** 2 + (p[1] - z) ** 2;
        if (d < bd) { bd = d; best = s; }
      }
      return best;
    };

    // A RUN-UP BEFORE THE ARCH, along the line's own backward tangent, so the
    // rider arrives at the gate ALREADY MOVING — the flying-start rule needs
    // >2.5 m/s through the circle, and a standing start on the gate does not
    // begin a run at all. This probe honours that rule rather than working
    // around it.
    //
    // The run-up LENGTH IS MEASURED, not assumed. A fixed 30m put the board
    // behind a wall at the head of Siloso Beach Walk (blockers at 28m and 32m
    // back — the line before a run is the open world, not the path) and the
    // whole gate read as "the run never started" when what had happened was
    // that the rider never left the spot. So: walk back a metre at a time and
    // take the longest stretch that is clear the whole way to the arch.
    const p0 = at(0), p1 = at(8);
    const tx = (p1[0] - p0[0]) / 8, tz = (p1[1] - p0[1]) / 8;
    const heading = Math.atan2(tx, tz);
    for (let d = 1; d <= 34; d++) {
      if (window.__blocked(p0[0] - tx * d, p0[1] - tz * d)) break;
      runup = d;
    }
    window.__teleport(p0[0] - tx * runup, p0[1] - tz * runup, heading);
    await new Promise((r) => setTimeout(r, 400));

    // WAIT FOR THE PREVIOUS LAP'S BANNER TO CLEAR BEFORE JUDGING THIS ONE.
    //
    // Finishing sets `flash = 4` and the HUD holds the finish line for about
    // four seconds. A second lap started inside that window read the FIRST
    // lap's "· NEW BEST" as its own finish and broke out of the drive loop in
    // the first three frames — so the ghost check saw nothing, and the lap
    // check went GREEN on a lap that was never ridden, reporting a time to the
    // tenth identical to the one before it. That tell (two identical times) is
    // what gave it away; without it this probe would have been lying.
    for (let w = 0; w < 200; w++) {
      const e = document.getElementById('ta');
      if (!e || e.style.display === 'none') break;
      await new Promise((r) => setTimeout(r, 50));
    }

    const hud = () => { const e = document.getElementById('ta');
      return (e && e.style.display !== 'none') ? e.textContent : ''; };

    const out = { id, hudSeen: [], cps: [], startedAt: null, finishText: null,
                  stall: null, offcourse: false, samples: 0, ghostMoved: 0, ghostSeen: 0,
                  // HOW FAR ALONG IT GOT, AND HOW FAR OFF THE LINE IT STRAYED.
                  // A3 said "no finish in 240s" and A2 said "saw CP 0", which
                  // between them describe the SYMPTOM twice and the cause not
                  // at all: a board that never finishes may be stuck, lost,
                  // slow or driving in a circle, and nothing here could tell
                  // those apart. Same fix as __lampRej / __plateRej /
                  // __roofCapWhy — record the thing, not a verdict about it.
                  maxS: 0, worstOff: 0, worstOffAt: null, endS: 0,
                  // THE LAST FEW SECONDS BEFORE IT DIED. Three different sets
                  // of driving parameters put the board at the SAME stall
                  // coordinate to the decimal, which is not what momentum
                  // looks like — something steers it there. A verdict cannot
                  // say which; a trace can.
                  tail: [] };
    let s = 0, last = performance.now(), t0 = performance.now();
    let stillSince = null, prevHud = '', prevGhost = null;
    // the ghost rig is the one translucent skater in the scene; find it once
    let ghostObj = null;
    window.__scene.traverse((o) => {
      if (ghostObj || !o.isGroup || o.parent !== window.__scene) return;
      let translucent = false, meshes = 0;
      o.traverse((m) => { if (m.isMesh) { meshes++; if (m.material && m.material.opacity === 0.32) translucent = true; } });
      if (translucent && meshes > 3) ghostObj = o;
    });

    while (performance.now() - t0 < lapMs) {
      await new Promise((r) => requestAnimationFrame(r));
      const st = window.__state();
      const now = performance.now();
      const dt = (now - last) / 1000; last = now;
      s = nearestS(st.x, st.z, s);
      // LOOKAHEAD SHORTENS INTO A BEND. A fixed 14m aim point steers the board
      // STRAIGHT AT a spot 14m along the line, so on a curve it travels inside
      // the arc — and Siloso Beach Walk is 8m wide, which gives 4m of room.
      // Measured 2026-08-26: on the siloso lap the board ended up 6.95m from
      // its own centreline at 774m, nearly 3m beyond the edge of the tarmac,
      // and stopped against a retail unit that is 2m CLEAR of the road. A7
      // duly reported "board stopped 3s" and every conclusion drawn from that
      // was about the world, which was innocent.
      //
      // So the aim point walks back when the line bends: compare the heading
      // of the next 7m with the 7m after it, and halve the lookahead when they
      // disagree by more than ~20 degrees. A7 then means what it says — "a
      // board sitting still mid-run is something standing in the way" — rather
      // than "our robot cannot drive".
      const a0 = at(s), a1 = at(s + 7), a2 = at(s + 14);
      const h1 = Math.atan2(a1[0] - a0[0], a1[1] - a0[1]);
      const h2 = Math.atan2(a2[0] - a1[0], a2[1] - a1[1]);
      let db = h2 - h1;
      while (db > Math.PI) db -= 2 * Math.PI;
      while (db < -Math.PI) db += 2 * Math.PI;
      // CONTINUOUS, NOT A STEP. The first version used `|db| > 0.35` as a
      // boolean, and the failure that survived it landed on a bend of almost
      // exactly 0.35 rad (the line runs 37deg then 17deg around s=755): just
      // under the threshold, so the board took it at full lookahead and full
      // throttle and ran 7m wide — three metres outside its own 8m road — into
      // the shopfront at 774m. A threshold on a continuous quantity always has
      // a case sitting on it. Ramp everything off the same number instead.
      // ...AND IT LOOKS PAST THE NEXT 14 METRES. Traced 2026-08-26: the board
      // enters the siloso bend at 57 km/h with a heading error of only 0.13
      // rad, so neither the `e` rule nor a 14m-window bend asks it to slow,
      // and it then TRANSLATES sideways off the line — 0.8m, 1.7m, 3.5m, 5m,
      // 6.8m — while still pointed roughly the right way. That is understeer,
      // not mis-steering, and no amount of extra steer fixes it: at 10 m/s it
      // has 12m of travel to recover 7m of lateral error. The cure is to
      // arrive slower, which means seeing the bend from further out.
      // Take the worst of the next 14m and the 14m after that.
      const a3 = at(s + 28);
      const h3 = Math.atan2(a3[0] - a2[0], a3[1] - a2[1]);
      let db2 = h3 - h2;
      while (db2 > Math.PI) db2 -= 2 * Math.PI;
      while (db2 < -Math.PI) db2 += 2 * Math.PI;
      const bend = Math.min(1, Math.max(Math.abs(db), Math.abs(db2) * 0.8) / 0.55);
      const aim = at(s + (14 - 8 * bend));
      const want = Math.atan2(aim[0] - st.x, aim[1] - st.z);
      let e = want - st.h;
      while (e > Math.PI) e -= 2 * Math.PI;
      while (e < -Math.PI) e += 2 * Math.PI;
      // heading DECREASES with positive steer (ride.js: s.heading -= yawRate)
      const steer = Math.max(-1, Math.min(1, -e * 1.6));
      // ease off the throttle in a hard correction so the board does not
      // understeer straight past a bend at full speed
      // AND IT SLOWS BEFORE THE CORNER, NOT DURING IT. Throttling on the
      // CURRENT heading error only reacts once the board is already pointing
      // the wrong way, which on a board with momentum is too late: it
      // overshoots the elbow, ends up OUTSIDE it, and then `nearestS` pins the
      // arc-length to the corner vertex for good — the board keeps moving
      // (A7 passes) while `s` never advances again. Measured on siloso: the
      // run stops progressing at 57m of 921m, which is exactly the first
      // 50-degree elbow.
      //
      // The run lines are coarse: siloso is 154 points over 921m with NINE
      // segments longer than 25m, so a bend arrives as a sudden corner rather
      // than a curve. `db` already looks 14m ahead; use it.
      window.__force = {
        throttle: Math.min(Math.abs(e) > 0.5 ? 0.35 : 1, 1 - 0.7 * bend),
        steer,
        brake: bend > 0.25 && st.kmh > 18 ? 0.7 * bend : 0,
      };

      {
        const on = at(s);
        const off = Math.hypot(st.x - on[0], st.z - on[1]);
        // SAMPLED BY DISTANCE, NOT BY FRAME. Ninety frames of a board that has
        // been stationary for three seconds is ninety copies of the stall and
        // nothing about how it got there — the first version of this trace
        // printed the same line twelve times.
        const prev = out.tail[out.tail.length - 1];
        if (!prev || Math.hypot(st.x - prev[1], st.z - prev[2]) > 2) {
          out.tail.push([Math.round(s), +st.x.toFixed(1), +st.z.toFixed(1),
                         +st.kmh.toFixed(1), +bend.toFixed(2), +e.toFixed(2),
                         +off.toFixed(1), +aim[0].toFixed(0), +aim[1].toFixed(0)]);
          if (out.tail.length > 40) out.tail.shift();
        }
        if (s > out.maxS) out.maxS = Math.round(s);
        if (off > out.worstOff) {
          out.worstOff = +off.toFixed(1);
          out.worstOffAt = { x: Math.round(st.x), z: Math.round(st.z), s: Math.round(s) };
        }
        out.endS = Math.round(s);
      }

      // A7: a board sitting still mid-run is something standing in the way
      if (st.kmh < 1.5) { if (stillSince == null) stillSince = now; }
      else stillSince = null;
      if (stillSince != null && now - stillSince > 3000 && !out.stall)
        out.stall = { x: st.x, z: st.z, s: Math.round(s) };

      const h = hud();
      if (h && h !== prevHud) { prevHud = h; if (out.hudSeen.length < 400) out.hudSeen.push(h); }
      if (h) {
        // A LIVE run is the only thing that prints a CP counter, so that line
        // — not the mere presence of the HUD — is the proof this lap started.
        // Nothing after it is believed until it has been seen.
        const cp = h.match(/CP (\d+)\/(\d+)/);
        if (cp) {
          if (out.startedAt == null) out.startedAt = Math.round(now - t0);
          const n = +cp[1]; if (!out.cps.includes(n)) out.cps.push(n);
        }
        if (out.startedAt != null) {
          if (/·\s*(NEW BEST|best )/.test(h) && !/CP /.test(h)) { out.finishText = h; break; }
          if (/run left/.test(h)) { out.offcourse = true; out.finishText = h; break; }
        }
      }
      // ghost: is it visible, and does it MOVE?
      if (ghostObj && ghostObj.visible) {
        out.ghostSeen++;
        const p = ghostObj.position;
        if (prevGhost && Math.hypot(p.x - prevGhost[0], p.z - prevGhost[1]) > 0.05) out.ghostMoved++;
        prevGhost = [p.x, p.z];
      }
      out.samples++;
    }
    window.__force = null;
    out.elapsed = Math.round(performance.now() - t0);
    out.runup = runup;
    out.best = localStorage.getItem('sg_ta_' + id);
    let g = null;
    try { g = JSON.parse(localStorage.getItem('sg_ta_ghost_' + id) || 'null'); } catch (e) { g = 'corrupt'; }
    out.ghostSamples = Array.isArray(g) ? g.length : g;
    return out;
  }, [id, lapMs]);
}

const fails = [...postFails];
const note = (ok, name, msg) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}  ${msg}`);
  if (!ok) fails.push(`${name}: ${msg}`);
};

for (const r of runs) {
  if (ONLY.length && !ONLY.includes(r.id)) continue;
  console.log(`\n--- ${r.label} (${r.length}m)`);
  const a = await ride(r.id, LAP_MS);
  note(a.startedAt != null, `A1 ${r.id} start`,
    a.startedAt != null ? `clock running ${a.startedAt}ms after teleport (${a.runup}m run-up)`
      : `HUD never appeared — run did not start (${a.runup}m run-up)`);
  // the HUD counts checkpoints PASSED, so an honest lap shows 0, then 1, then
  // 2, and never shows 3 — crossing the third gate IS the finish and the line
  // is replaced by the time. Out of order or short means a gate was skipped.
  note(a.cps.join(',') === '0,1,2', `A2 ${r.id} checkpoints`,
    `saw CP ${a.cps.join(' -> ') || 'none'} (want 0 -> 1 -> 2)`);
  note(!!a.finishText && !a.offcourse, `A3 ${r.id} finish`,
    a.finishText || `no finish in ${(a.elapsed / 1000).toFixed(0)}s`
      + (a.offcourse ? ' (went off course)' : '')
      + ` — reached ${a.maxS}m of ${Math.round(r.length)}m, ended at ${a.endS}m,`
      + ` worst ${a.worstOff}m off the line`
      + (a.worstOffAt ? ` at ${a.worstOffAt.x},${a.worstOffAt.z} (${a.worstOffAt.s}m)` : ''));
  if (!a.finishText && a.tail && a.tail.length) {
    console.log('         last samples  s / x,z / kmh / bend / err / off-line / aim');
    for (const t of a.tail.slice(-16)) {
      console.log(`           ${String(t[0]).padStart(4)}  ${t[1]},${t[2]}`
        + `  ${String(t[3]).padStart(5)}km/h  bend ${t[4]}  e ${t[5]}`
        + `  off ${t[6]}m  aim ${t[7]},${t[8]}`);
    }
  }
  note(!!a.best, `A4 ${r.id} best saved`, a.best ? `${a.best}ms in localStorage` : 'nothing written');
  note(typeof a.ghostSamples === 'number' && a.ghostSamples > 1, `A5 ${r.id} ghost saved`,
    `${a.ghostSamples} samples`);
  note(!a.stall, `A7 ${r.id} no stall`,
    a.stall ? `board stopped 3s at (${a.stall.x}, ${a.stall.z}), ${a.stall.s}m along` : 'kept moving');

  // A6: the SECOND lap, where the ghost of the first is supposed to skate
  if (!fails.some((f) => f.startsWith(`A5 ${r.id}`))) {
    const b = await ride(r.id, LAP_MS);
    note(b.ghostSeen > 30 && b.ghostMoved > 20, `A6 ${r.id} ghost replays`,
      `visible ${b.ghostSeen} frames, moved on ${b.ghostMoved}`);
    note(!!b.finishText, `A3b ${r.id} second lap`, b.finishText || 'no finish');
  }
}

console.log('');
if (fails.length) { console.log(`tacheck: ${fails.length} FAIL`); fails.forEach((f) => console.log('  - ' + f)); }
else console.log('tacheck: all green');
await browser.close();
process.exit(fails.length ? 1 : 0);
