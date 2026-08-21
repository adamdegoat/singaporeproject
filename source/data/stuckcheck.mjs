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
// AND THEN IT SPENT TWO WEEKS MEASURING NOTHING, THE OTHER WAY ROUND.
//
// Found 2026-08-21: this file reported "20 of 20 stretches stalled" on a world
// where the stretches ride perfectly. Teleporting to the exact coordinate it
// flagged on Ocean Drive and driving by hand: 0 -> 44.7 km/h, 19.3m in six
// seconds. The island was never stuck.
//
// WHAT ACTUALLY HAPPENS, from the per-second trace that settled it:
//
//   Brani Causeway  17/ride 28/ride 42/ride 53/ride 0/walk 0/walk+swim ...
//   Imbiah Road     0/walk 0/walk 0/walk 0/walk 0/walk 0/walk ...
//   Ocean Way       0/walk 0/walk ...
//
// Brani Causeway is a 70m stub clipped at the map edge. The FIRST stretch
// floors the throttle at a dead end, rides off into the channel at 53 km/h,
// and the player is dropped off the vehicle and starts SWIMMING — which is
// correct game behaviour and swimcheck gates it deliberately.
//
// `window.__teleport` then moves the walker and the vehicle to the next
// stretch but DOES NOT PUT THE PLAYER BACK ON THE VEHICLE, and it is right not
// to: travelling must not force you into a saddle (that rule was written the
// day "Once i tele to tanjong beach i cannot teleport away" was fixed). So
// every stretch after the first swim measured `__kmh()` — the VEHICLE's speed
// — while the player stood somewhere else on foot. Of course it read 0.
//
// ONE BAD STRETCH POISONED EVERY STRETCH AFTER IT, and the failure presented
// as the whole island being stuck rather than as a broken harness. The header
// above warns about a check that PASSES by measuring nothing; this is the
// same disease wearing the other face, and it is the more dangerous one,
// because a red gate that is lying teaches everyone to ignore a red gate.
//
// THE FIX, and why it is shaped this way:
//   * remount before every stretch (`window.__toggleMode()`), and ABORT the
//     whole run if the remount fails — a check that cannot establish its own
//     preconditions must stop, not report findings it cannot support.
//   * a stretch that ends in the water is a SWIM, not a stall. Reported
//     separately and counted separately, because "you rode off the end of a
//     pier" is a thing this world lets you do on purpose.
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
const swims = [];
for (const [x, z, h, name] of starts) {
  const r = await page.evaluate(async ({ x, z, h, SECS, THR }) => {
    window.__teleport(x, z, h);
    await new Promise((s) => setTimeout(s, 400));
    // BACK IN THE SADDLE, EVERY TIME. See the note at the top: without this
    // the first ride into the water turns every later stretch into a reading
    // of a parked vehicle, and the file reports the island as stuck.
    if (window.__walkState().mode !== 'ride') window.__toggleMode();
    await new Promise((s) => setTimeout(s, 120));
    const mode0 = window.__walkState().mode;
    const samples = [];
    for (let t = 0; t < SECS; t++) {
      await window.__drive(THR, 0, 1);          // full throttle, straight, 1s
      const p = window.__ridePos();
      const ws = window.__walkState();
      samples.push({ kmh: window.__kmh(), x: p[0], z: p[1], mode: ws.mode, swim: !!ws.swim });
    }
    return { mode0, samples };
  }, { x, z, h, SECS, THR });
  if (r.mode0 !== 'ride') {
    // PRECONDITION FAILED: stop, do not report stalls we cannot stand behind.
    console.log(`  ABORT  could not put the player back on the vehicle at ${name}`
      + ` (mode "${r.mode0}") — every reading after this would be of a parked`
      + ' vehicle, which is the exact bug this check was fixed for');
    await browser.close();
    process.exit(2);
  }
  const samples = r.samples;
  // A STRETCH THAT ENDS IN THE WATER IS A SWIM, NOT A STALL. Riding off the
  // end of a pier or a map-clipped stub is something this world lets you do,
  // and swimcheck gates the loop it drops you into. Counting it as "stuck"
  // is what turned one dead-end causeway into twenty stuck roads.
  if (samples.some((s) => s.swim || s.mode !== 'ride')) {
    const i = samples.findIndex((s) => s.swim || s.mode !== 'ride');
    swims.push({ name, after: i });
    console.log(`  swim   ${name} — rode into the water after ${i}s `
      + '(not a stall; the road ends there)');
    continue;
  }
  // a stall: three consecutive seconds under 2 km/h with the throttle down
  let run = 0, worst = null;
  for (const s of samples) {
    if (s.kmh < 2) { run++; if (run >= 3 && !worst) worst = s; } else run = 0;
  }
  const moved = Math.hypot(samples[samples.length - 1].x - x, samples[samples.length - 1].z - z);
  if (worst) {
    stalls.push({ name, at: [Math.round(worst.x), Math.round(worst.z)], from: [Math.round(x), Math.round(z)], moved: Math.round(moved) });
    console.log(`  STALL  ${name} — stopped at (${Math.round(worst.x)},${Math.round(worst.z)}), `
      + `${Math.round(moved)}m from the start after ${SECS}s`);
  }
}
console.log(`\n  stuckcheck: ${stalls.length} of ${starts.length} stretches stalled`
  + (swims.length ? `, ${swims.length} rode into the water (not counted)` : ''));
await browser.close();
if (stalls.length) { console.log('  stuckcheck FAIL'); process.exit(1); }
console.log('  stuckcheck ok');
