#!/usr/bin/env node
// REAL FRAME RATE AT PHONE SIZE — RENDERED FRAMES, WHILE MOVING.
//
//     node data/mobilefps.mjs
//     SG_CPU=1 node data/mobilefps.mjs        # no CPU throttle, for an A/B
//     SG_PARKED=1 node data/mobilefps.mjs     # measure the idle cooler instead
//
// EVERY FRAME-RATE NUMBER THIS PROJECT HAS EVER PUBLISHED WAS ONE OF TWO
// WRONG NUMBERS, AND THEY DISAGREE BY THREE TIMES (found 2026-08-30).
//
//   * `20 fps` — the HUD, the deploy log, and data/sweep.mjs across all 220
//     stops ("worst 20 median 20 best 20 — identical three ways, which is not
//     a distribution", its own note). That is the IDLE COOLDOWN in main.js:
//     on touch, parked and ungestured for six seconds, the loop renders only
//     if 41ms have passed, which on a 16.7ms vsync means every third frame,
//     which is exactly 20.00. Every probe here parks the rider and waits, so
//     every probe here has been measuring the cooler.
//
//   * `60 fps` — this file, since 2026-08-26. It counted requestAnimationFrame
//     CALLBACKS, and rAF keeps firing at 60 while the loop declines to render.
//     Measured side by side on the same page: 60.0 callbacks/s and 20.0
//     rendered frames/s. The scene had nothing to do with either number.
//
// Both were measured with the same care and both were measuring the harness.
// The methodology that IS right is already written down, in main.js's own
// third-attempt note beside the frame cap: "one page, one settled location, a
// touch every two seconds so the idle cooler stays off, medians of rendered
// frames counted from renderer.info.render.frame". Nothing had ever used it.
//
// So this file now:
//
//   1. BOOTS THE TOUCH PATH (`?touch`), which is the configuration the owner's
//      phone actually runs — consolidate.js's TILE is 240 on touch and 110 on
//      desktop, and the riding frame cap is 30 on touch and off on desktop.
//      hotviews.mjs's note says a probe without it "measures a tile size the
//      owner's phone never uses"; this one was making that mistake.
//   2. COUNTS renderer.info.render.frame, not callbacks. That is the number of
//      times the world was actually drawn.
//   3. KEEPS THE RIDER MOVING with a held throttle key. A synthetic keydown
//      also stamps `lastGestureT` through main.js's own capture-phase gesture
//      listener, so the cooler stays off — the moving case is both the honest
//      one and the only one the cooler does not swallow.
//   4. THROTTLES THE CPU 4x by default. A desktop GPU at 844x390 is not his
//      phone and the standing rule is that perf is measured on a slow device.
//   5. WALKS THE SAME SIX SPOTS data/hotviews.mjs walks, because spawn is the
//      cheapest place on Sentosa (204 draws against 666 at Tanjong Beach Walk)
//      and hotviews counts draws and triangles but never a frame.
//
// WHAT TO EXPECT. The riding cap is 30 on touch, so a healthy reading is ~30
// and the question this gate asks is whether the device HOLDS it. A number far
// under 30 is the world being too heavy; **a number OVER 30 means the cap is
// not applying**, which is not a pass — it is the defect this file found on the
// day it was rewritten. See the capHz note in main.js: the refresh rate was
// being measured below the idle cooldown, so eight seconds of standing still
// disabled the phone frame cap for the whole session.
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
const SECONDS = +(process.env.SG_FPS_SECONDS || 4);
const CPU = +(process.env.SG_CPU || 4);
const PARKED = !!process.env.SG_PARKED;
// THE FLOOR. Riding, capped at 30, on a quarter-speed CPU. Measured 2026-08-30:
//
//     spawn (control)      30.0    Tanjong promenade    28.4
//     Tanjong Beach Walk   27.5    Tanjong east         28.7
//     Sentosa Gateway      27.7    Tanjong headland     28.0
//
// Spawn holds the 30 cap exactly and the heaviest views give up two and a half
// frames to it, on a quarter-speed CPU. 22 leaves the ~20% margin
// perfbudget.json uses AND sits above the 20.00 the idle cooldown produces, so
// a regression that lets the cooldown govern a moving rider — which is what
// this file was measuring for weeks — reads as a FAIL and not as a pass.
const FLOOR = +(process.env.SG_FPS_FLOOR || 22);

// COPIED FROM data/hotviews.mjs ON PURPOSE. Two files measuring "the heaviest
// views" must measure the SAME views or neither number means anything. Its
// note says to re-derive the list from a fresh sweep when the world's shape
// changes — re-derive both together.
const SPOTS = [
  ['spawn (control)',    null,  null,  null],
  ['Tanjong Beach Walk', -885, 13290, -2.67],
  ['Sentosa Gateway',   -1038, 11795, -0.02],
  ['Tanjong headland',   -895, 13358,  3.10],
  ['Tanjong promenade',  -827, 13358, -2.35],
  ['Tanjong east',       -771, 13427, -2.53],
];

const browser = await chromium.launch({ args: [
  '--use-gl=angle', '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
] });
const ctx = await browser.newContext({
  viewport: { width: 844, height: 390 }, deviceScaleFactor: 3,
  hasTouch: true, isMobile: true,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

// SG_XPARAMS appends URL flags, so a change can be A/B'd from the same six
// spots without editing the source — the ?rich / ?noflat idiom every other
// harness here uses.
const XP = process.env.SG_XPARAMS ? `&${process.env.SG_XPARAMS}` : '';
await page.goto(`http://localhost:${PORT}/?touch&scene=${SCENE}${XP}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
// let the first-frame and warm-up spikes drain before counting
await page.waitForTimeout(5000);
await page.evaluate(() => { window.__noArrive = true; });

const cdp = await ctx.newCDPSession(page);
if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });

// THE MEASUREMENT TOUCHES NOTHING WHILE IT COUNTS. It reads the renderer's own
// frame counter at both ends of a real interval and returns once; no
// screenshot, no teleport, no per-frame evaluate. That was the one thing the
// old version of this file got right and it is kept.
//
// The throttle is held down INSIDE the page for the whole window, so the rider
// is moving the entire time and the gesture that stamp brings with it lands
// well inside the cooler's six seconds.
const measure = () => page.evaluate((secs) => new Promise((res) => {
  dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
  const R = window.__renderer.info.render;
  const f0 = R.frame, t0 = performance.now();
  setTimeout(() => {
    const rendered = R.frame - f0, dur = performance.now() - t0;
    dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp' }));
    res({ rendered, secs: dur / 1000, calls: R.calls, tris: R.triangles,
          speed: window.__rideSpeed ? window.__rideSpeed() : null });
  }, secs * 1000);
}), SECONDS);

console.log(`   mobile fps   844x390, ?touch, CPU x${CPU}, `
  + `${PARKED ? 'PARKED (the idle cooler)' : 'riding, throttle held'}`);
const rows = [];
for (const [name, x, z, h] of SPOTS) {
  if (x !== null) {
    await page.evaluate(([x2, z2, h2]) => window.__teleport(x2, z2, h2), [x, z, h]);
    // the same settle hotviews takes: district culling, the tree partition and
    // the instanced LOD all re-decide after a jump, and counting through that
    // measures the settle rather than the view.
    await page.waitForTimeout(2500);
  }
  const r = PARKED
    ? await page.evaluate((secs) => new Promise((res) => {
      const R = window.__renderer.info.render;
      const f0 = R.frame, t0 = performance.now();
      setTimeout(() => res({ rendered: R.frame - f0, secs: (performance.now() - t0) / 1000,
                             calls: R.calls, tris: R.triangles }), secs * 1000);
    }), SECONDS)
    : await measure();
  const fps = +(r.rendered / r.secs).toFixed(1);
  rows.push([name, fps, r.calls, r.tris]);
  console.log(`     ${name.padEnd(20)} ${String(fps).padStart(5)} rendered fps   `
    + `${String(r.calls).padStart(4)} draws   ${Math.round(r.tris / 1000)}k tris`);
}

const worst = Math.min(...rows.map((r) => r[1]));
const worstName = (rows.find((r) => r[1] === worst) || ['?'])[0];
console.log(`   MOBILEFPS ${JSON.stringify({ cpu: CPU, worst, at: worstName,
  parked: PARKED || undefined })}`);
if (errors.length) console.log(`     CONSOLE ERRORS ${errors.length}: ${errors[0]}`);

const bad = worst < FLOOR || errors.length > 0;
console.log(bad
  ? `   FAIL  ${worst} rendered fps at ${worstName} (floor ${FLOOR})`
    + `${errors.length ? ` · ${errors.length} console error(s)` : ''}`
  : `   PASS  ${worst} rendered fps at ${worstName} on a x${CPU} CPU, no console errors`);
await browser.close();
process.exit(bad ? 1 : 0);
