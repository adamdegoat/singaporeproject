// CAN YOU ACTUALLY RIDE IT? A stall detector, not a spot check.
//
// Written 2026-08-05 after a night in which every defect I found by SAMPLING
// coordinates turned out to be a probe artefact, while both defects that
// mattered came from the owner PLAYING. So this plays: it puts the rider on
// the road network and drives at full throttle, and reports every place the
// board stops moving while the throttle is still down.
//
// A stall is objective — no visual judgement, no material identity, no
// raycast. It is also exactly the owner's ask: "fully explorable... no bugs
// that jeopardize the user experience."
//
// IT MEASURED NOTHING UNTIL 2026-08-05. `window.__drive` returned undefined,
// so `await window.__drive(1,0,1)` passed zero milliseconds and all ten samples
// of a "ten-second drive" were one instant 260ms after the teleport. Three of
// twenty stretches read 0 km/h and were reported as stalls; they were stretches
// where no animation frame happened to land in that settle. __drive now
// resolves when the throttle lifts, so the loop below waits for real. If this
// check ever passes on its first run after an edit, BREAK IT ON PURPOSE (drop
// the throttle to 0) before believing it — four checks in this repo have
// passed by measuring nothing.
//
//   node data/stuckcheck.mjs            ~20 runs
//   STUCK_N=60 node data/stuckcheck.mjs
//   STUCK_THROTTLE=0 node data/stuckcheck.mjs   proves it can still fail
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const N = +(process.env.STUCK_N || 20);
const SECS = +(process.env.STUCK_SECS || 8);
const THR = process.env.STUCK_THROTTLE == null ? 1 : +process.env.STUCK_THROTTLE;

const browser = await chromium.launch({ headless: true, args: [
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
] });
const page = await browser.newPage({ viewport: { width: 640, height: 380 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message.slice(0, 140)));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });
await page.evaluate(() => { window.__noArrive = true; });

// start points spread along the carriageways, heading ALONG the way
const starts = await page.evaluate((want) => {
  const out = [];
  for (const r of (window.__data.roads || [])) {
    if (!r.p || r.p.length < 3) continue;
    if (r.k === 'footway' || r.k === 'pedestrian' || r.k === 'steps') continue;
    const i = Math.floor(r.p.length / 2);
    const a = r.p[i - 1], b = r.p[i];
    const h = Math.atan2(b[0] - a[0], b[1] - a[1]);
    if (window.__blocked && window.__blocked(a[0], a[1])) continue;
    out.push([a[0], a[1], h, r.n || '(unnamed)']);
  }
  const step = Math.max(1, Math.floor(out.length / want));
  return out.filter((_, i) => i % step === 0).slice(0, want);
}, N);

console.log(`  driving ${starts.length} stretches, ${SECS}s each at full throttle`);
const stalls = [];
for (const [x, z, h, name] of starts) {
  const r = await page.evaluate(async ({ x, z, h, SECS, THR }) => {
    window.__teleport(x, z, h);
    await new Promise((s) => setTimeout(s, 400));
    const samples = [];
    for (let t = 0; t < SECS; t++) {
      await window.__drive(THR, 0, 1);          // full throttle, straight, 1s
      const p = window.__ridePos();
      samples.push({ kmh: window.__kmh(), x: p[0], z: p[1] });
    }
    return samples;
  }, { x, z, h, SECS, THR });
  // a stall: three consecutive seconds under 2 km/h with the throttle down
  let run = 0, worst = null;
  for (const s of r) {
    if (s.kmh < 2) { run++; if (run >= 3 && !worst) worst = s; } else run = 0;
  }
  const moved = Math.hypot(r[r.length - 1].x - x, r[r.length - 1].z - z);
  if (worst) {
    stalls.push({ name, at: [Math.round(worst.x), Math.round(worst.z)], from: [Math.round(x), Math.round(z)], moved: Math.round(moved) });
    console.log(`  STALL  ${name} — stopped at (${Math.round(worst.x)},${Math.round(worst.z)}), `
      + `${Math.round(moved)}m from the start after ${SECS}s`);
  }
}
console.log(`\n  stuckcheck: ${stalls.length} of ${starts.length} stretches stalled`);
await browser.close();
if (stalls.length) { console.log('  stuckcheck FAIL'); process.exit(1); }
console.log('  stuckcheck ok');
