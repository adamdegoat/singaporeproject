#!/usr/bin/env node
// DOES THE ISLAND LEAK WHILE YOU PLAY?
//
//     node data/soakcheck.mjs            # ~6 minutes of riding
//     SG_SOAK_MIN=12 node data/soakcheck.mjs
//
// Every memory number this project has ever taken is a SNAPSHOT at boot, and a
// snapshot cannot see the failure that actually kills a phone: a heap that
// climbs while somebody plays. The owner plays on an iPhone, where the limit is
// process-wide and the tab is killed without a message — which reads to him as
// "it crashed", with nothing in any log here to show for it.
//
// So this rides. Throttle held, steering swept so the route is not a straight
// line down one street, sampling the SETTLED heap (forced GC, three readings)
// every 30 seconds. The verdict is the SLOPE, not any single reading: garbage
// collection makes the raw figure saw-tooth by tens of megabytes, and a run
// that reads the peak of one tooth against the trough of another can call a
// flat heap a leak or a leak flat.
//
// Needs the dev server on :8933 (or SG_PORT) and Playwright's chromium.
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { refuseUnderDeploy } from './deploylock.mjs';
const HERE = dirname(fileURLToPath(import.meta.url));
refuseUnderDeploy('soakcheck.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
const MINUTES = +(process.env.SG_SOAK_MIN || 6);
const STEP_MS = 30000;
// megabytes per minute. A real leak on this world climbs far faster; this is
// set to catch a trend, not to police GC noise.
const BUDGET = +(process.env.SG_SOAK_SLOPE || 1.5);

const browser = await chromium.launch({ headless: true, args: [
  '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist',
  '--js-flags=--expose-gc',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const page = await browser.newPage({ viewport: { width: 844, height: 390 },
  deviceScaleFactor: 1, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
await page.goto(`http://localhost:${PORT}/?touch&cb=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 400 });
await page.evaluate(() => { window.__noArrive = true; });

// SETTLE FIRST. livecheck's own note: the world is still allocating after
// __ready, and a stability test passes on a quiet stretch inside a climb. A
// baseline taken at second zero is a baseline taken mid-boot.
await page.waitForTimeout(20000);

const settled = () => page.evaluate(async () => {
  const read = async () => {
    if (window.gc) { window.gc(); await new Promise((r) => setTimeout(r, 350)); }
    return performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0;
  };
  const a = await read(), b = await read(), c = await read();
  return +Math.min(a, b, c).toFixed(1);      // the trough, consistently
});

console.log(`   soak   ${MINUTES} min of riding, settled heap every ${STEP_MS / 1000}s`);
// PROVE SHE MOVES, or this file is a six-minute gate that measures a parked
// board. `window.__rider()` carries speed and the ride state carries position;
// distance is accumulated per step and the run FAILS if it did not travel.
// This project's own history is full of checks that passed while doing nothing
// (tacheck's A8 printed "0/0 clear"), and a soak test is the easiest of all to
// write that way: park the rider, watch a flat heap, call it green.
const posOf = () => page.evaluate(() => {
  const w = window.__walkState ? window.__walkState() : null;
  const r = window.__rider ? window.__rider() : null;
  const c = window.__camera;
  return { x: (w && w.x) ?? (c ? +c.position.x.toFixed(1) : null),
           z: (w && w.z) ?? (c ? +c.position.z.toFixed(1) : null),
           kmh: r ? r.kmh : null };
});
let travelled = 0, movedFrames = 0;
let prev = await posOf();

const samples = [[0, await settled()]];
console.log(`     0:00   ${samples[0][1].toFixed(1)} MB   (baseline, after a 20s settle)`);
const steps = Math.max(1, Math.round((MINUTES * 60000) / STEP_MS));
// A TOUR, not one street. Read from the coverage sweep's own stop list so the
// route is the island the sweep judges and not a hand-typed corner of it.
const TOUR = (() => {
  try {
    const rows = JSON.parse(readFileSync(join(HERE, '..', 'shots', 'sweep', 'sweep.json'), 'utf8')).rows;
    const pick = rows.filter((_, k) => k % 11 === 0).map((r) => ({ x: r.x, z: r.z, heading: r.heading }));
    if (pick.length >= 4) return pick;
  } catch (e) { /* no sweep on disk: fall through */ }
  // the five hot views, which are on disk in every checkout
  return [{ x: -885, z: 13290, heading: -2.67 }, { x: -1038, z: 11795, heading: -0.02 },
          { x: -895, z: 13358, heading: 3.10 }, { x: -827, z: 13358, heading: -2.35 },
          { x: -771, z: 13427, heading: -2.53 }];
})();
console.log(`   tour   ${TOUR.length} stops`);
for (let i = 1; i <= steps; i++) {
  // RIDE A ROAD, DO NOT HOLD A STEER. The first version of this swept the steer
  // through +/-0.55 on a timer, and its own motion check caught it: 126 metres
  // in three minutes at 5 km/h against a 41.8 km/h ceiling, because a held lock
  // drives her into the nearest wall and she scrubs along it. It aims at a
  // point ~18m ahead on the way she is on — the same idiom stuckcheck settled
  // on for the same reason — and hops to a fresh stop each interval, which is
  // also the churn a leak would live in: districts culled in and out, LOD sets
  // recompacted, the whole world re-decided.
  await page.evaluate(async ([ms, stop]) => {
    if (window.__walkState && window.__walkState().mode !== 'ride') window.__toggleMode();
    window.__teleport(stop.x, stop.z, stop.heading);
    await new Promise((r) => setTimeout(r, 400));
    const secs = Math.round(ms / 1000) - 1;
    for (let t = 0; t < secs; t++) {
      let steer = 0;
      const hd = window.__rideHeading ? window.__rideHeading() : null;
      const p = window.__ridePos ? window.__ridePos() : null;
      if (hd && p) {
        // hold the heading she arrived on, correcting drift — no map needed,
        // and it keeps her on the carriageway she was teleported onto
        let d = stop.heading - hd.heading;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        steer = Math.max(-1, Math.min(1, d * 1.6));
      }
      await window.__drive(1, steer, 1);
    }
  }, [STEP_MS, TOUR[i % TOUR.length]]);
  const mb = await settled();
  const here = await posOf();
  if (prev.x != null && here.x != null) {
    const d = Math.hypot(here.x - prev.x, here.z - prev.z);
    travelled += d;
    if (d > 5) movedFrames++;
  }
  prev = here;
  samples.push([i * STEP_MS / 1000, mb]);
  const t = i * STEP_MS / 1000;
  console.log(`     ${String(Math.floor(t / 60))}:${String(t % 60).padStart(2, '0')}   ${mb.toFixed(1)} MB`
    + `   ${Math.round(travelled)} m travelled   ${here.kmh == null ? '' : here.kmh + ' km/h'}`);
}
await page.evaluate(() => { window.__force = null; });
await browser.close();

// least-squares slope in MB per minute
const n = samples.length;
const mx = samples.reduce((a, s) => a + s[0], 0) / n;
const my = samples.reduce((a, s) => a + s[1], 0) / n;
let num = 0, den = 0;
for (const [x, y] of samples) { num += (x - mx) * (y - my); den += (x - mx) ** 2; }
const slope = den ? (num / den) * 60 : 0;
const first = samples[0][1], last = samples[n - 1][1];
console.log(`   SOAK {"slopeMBmin":${slope.toFixed(2)},"first":${first},"last":${last},`
  + `"minutes":${MINUTES},"metres":${Math.round(travelled)}}`);
if (travelled < MINUTES * 200) {
  console.log(`   FAIL  the rider barely moved: ${Math.round(travelled)} m in ${MINUTES} min `
    + `(${movedFrames} of ${steps} intervals covered ground) — this measured a PARKED board, `
    + `not a session. Check window.__force reaches the ride branch.`);
  process.exit(1);
}
if (errors.length) {
  console.log(`   FAIL  page errors while riding: ${errors[0]}`);
  process.exit(1);
}
if (slope > BUDGET) {
  console.log(`   FAIL  the heap climbs while riding: ${slope.toFixed(2)} MB/min over ${MINUTES} min `
    + `(${first} -> ${last} MB, budget ${BUDGET}) — something is retained per frame or per district`);
  process.exit(1);
}
console.log(`   PASS  heap flat while riding: ${slope.toFixed(2)} MB/min over ${MINUTES} min `
  + `(${first} -> ${last} MB)`);
