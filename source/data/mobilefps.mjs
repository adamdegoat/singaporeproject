// REAL FRAME RATE AT PHONE SIZE, measured by wall clock.
//
// WHY THIS EXISTS. data/sweep.mjs reports fps and its own comments say not to
// trust the number: "the same spot reads 51fps in a focused browser and 23
// here". It is labelled "(indicative)" and on sentosa it prints `worst 20
// median 20 best 20` across 220 stops -- identical three ways, which is not a
// distribution. The counter in main.js is CORRECT (frames counted over a real
// second); the page really does render ~20 frames in a second while a harness
// is teleporting the camera and taking screenshots between every sample. So
// the sweep measures the harness, not the game, and the island had no honest
// frame-rate number at phone size at all.
//
// This probe changes one thing: it touches nothing while it counts. No
// teleport, no screenshot, no evaluate() during the window -- just
// requestAnimationFrame timestamps collected in the page and returned once.
// 844x390 landscape with touch forced, which is the mobile-first mandate's
// viewport.
//
// MEASURED 2026-08-26: 60.0 fps, median frame 16.8ms, worst frame 28ms.
//
// This is still a desktop GPU running a phone-sized canvas -- it proves the
// SCENE is not the bottleneck, not that his iPhone hits 60. His phone remains
// the only truth for that.
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
const SECONDS = +(process.env.SG_FPS_SECONDS || 4);
const FLOOR = +(process.env.SG_FPS_FLOOR || 50);

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

await page.goto(`http://localhost:${PORT}/?scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
// let the first-frame and warm-up spikes drain before counting
await page.waitForTimeout(5000);

const r = await page.evaluate((secs) => new Promise((res) => {
  const times = []; const t0 = performance.now();
  const tick = () => {
    const t = performance.now(); times.push(t);
    if (t - t0 < secs * 1000) requestAnimationFrame(tick);
    else {
      const gaps = [];
      for (let i = 1; i < times.length; i++) gaps.push(times[i] - times[i - 1]);
      gaps.sort((a, b) => a - b);
      const at = (q) => gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * q))];
      res({
        frames: times.length, dur: t - t0,
        median: at(0.5), p95: at(0.95), worst: gaps[gaps.length - 1],
        janks: gaps.filter((g) => g > 33).length,
      });
    }
  };
  requestAnimationFrame(tick);
}), SECONDS);

const fps = +(r.frames / (r.dur / 1000)).toFixed(1);
console.log('   mobile fps   844x390, touch forced, nothing else touching the page');
console.log(`     sustained    ${fps} fps over ${(r.dur / 1000).toFixed(1)}s (${r.frames} frames)`);
console.log(`     frame time   median ${r.median.toFixed(1)}ms · p95 ${r.p95.toFixed(1)}ms · worst ${r.worst.toFixed(1)}ms`);
console.log(`     janks        ${r.janks} frame(s) over 33ms`);
if (errors.length) console.log(`     CONSOLE ERRORS ${errors.length}: ${errors[0]}`);
console.log(`   MOBILEFPS ${JSON.stringify({ fps, medianMs: +r.median.toFixed(1), janks: r.janks })}`);

const bad = fps < FLOOR || errors.length > 0;
console.log(bad
  ? `   FAIL  ${fps} fps (floor ${FLOOR})${errors.length ? ` · ${errors.length} console error(s)` : ''}`
  : `   PASS  ${fps} fps at phone size, no console errors`);
await browser.close();
process.exit(bad ? 1 : 0);
