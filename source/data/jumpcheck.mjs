#!/usr/bin/env node
// DOES THE JUMP DO WHAT THE JUMP SAYS IT DOES?
//
//     node data/jumpcheck.mjs
//     JUMP_N=8 node data/jumpcheck.mjs
//     JUMP_BREAK=1 node data/jumpcheck.mjs    prove it can still fail
//
// Written with the jump itself (2026-08-23). Every walk-side check in this
// directory before it teleported somewhere and measured a STANDING frame,
// because there was no way to press the stick from a script. A jump is
// nothing but motion: an arc, a flight time and a landing. None of that
// exists in one frame and none of it can be eyeballed in a screenshot, so it
// gets a gate of its own rather than a look.
//
// The checks, each with a budget and a reason:
//
//   J1  apex height        WALK.jumpV^2 / (2*WALK.gravity), +/- 12cm
//   J2  flight time        2*WALK.jumpV / WALK.gravity, +/- 12%
//   J3  landing            comes back to the surface it left, +/- 6cm
//   J4  momentum           a running jump travels further than a standing one
//   J5  released stick     letting go mid-air does NOT brake the arc
//   J6  no double jump     a second press in the air is ignored
//   J7  chainable          a press on the landing frame fires
//
// J4 and J5 are the owner's actual ask ("jumping at speed carries
// momentum"). J6 and J7 are the pair that make a hop feel like a control
// rather than a toggle, and they pull in opposite directions, which is why
// both are measured: fixing one by hand tends to break the other.
//
// Needs the dev server on :8933 and Playwright's chromium.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const N = +(process.env.JUMP_N || 6);
// Deliberately breaks the arc, to prove the budgets below can fail. Four
// checks in this repo passed on their first run and were measuring nothing;
// see the note at the top of stuckcheck.mjs. `window.__WALK` is the live
// constants object, so weakening gravity by a third after the spec has been
// read moves the real hop and nothing else: J1 and J2 must both go red.
const BREAK = process.env.JUMP_BREAK === '1';

const browser = await chromium.launch({ headless: true, args: [
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
] });
const page = await browser.newPage({ viewport: { width: 640, height: 380 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message.slice(0, 140)));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });
await page.evaluate(() => { window.__noArrive = true; });

// FLAT, OPEN, WALKABLE GROUND. An arc measured on a slope is not an arc: the
// surface under the feet moves while the walker is in the air, so the apex
// reads high on the way down a hill and the landing reads early on the way
// up. The sites are picked by sampling the walkable network and keeping only
// spots whose ground is level within 6cm across a 3m box.
const sites = await page.evaluate((want) => {
  const flat = (x, z) => {
    let lo = Infinity, hi = -Infinity;
    for (const [dx, dz] of [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) {
      if (window.__moveBlocked(x + dx, z + dz)) return false;
      const y = window.__surfaceAt(x + dx, z + dz);
      if (y < lo) lo = y; if (y > hi) hi = y;
    }
    return hi - lo < 0.06 && lo > 1.0;      // above the tideline, not in the sea
  };
  const out = [];
  for (const r of (window.__data.roads || [])) {
    if (!r.p || r.p.length < 3) continue;
    const i = Math.floor(r.p.length / 2);
    const a = r.p[i - 1], b = r.p[i];
    const h = Math.atan2(b[0] - a[0], b[1] - a[1]);
    // stand a few metres off the centreline so the walker is not in traffic
    const ox = Math.cos(h) * 5, oz = -Math.sin(h) * 5;
    if (!flat(a[0] + ox, a[1] + oz)) continue;
    out.push([a[0] + ox, a[1] + oz, h, r.n || '(unnamed)']);
    if (out.length > want * 6) break;
  }
  const step = Math.max(1, Math.floor(out.length / want));
  return out.filter((_, i) => i % step === 0).slice(0, want);
}, N);

if (!sites.length) { console.log('  FAIL: found no flat walkable site'); await browser.close(); process.exit(1); }
let usable = null;
console.log(`  jumping at ${sites.length} flat sites`);

// One flight, sampled every animation frame.  `hold` is the stick during the
// jump; `release` drops it the moment the feet leave the ground.
//
// FLIGHT TIME IS READ OFF THE SIMULATION, NOT THE WALL CLOCK, and the first
// version of this file got that wrong: it timed the samples with
// performance.now() and reported 1.06s to 2.48s for a 0.594s hop. Headless
// chromium renders this world at 4-10fps, the loop clamps dt to 0.1s, so
// simulated time runs at a fraction of real time and every arc looked
// enormously long. `walker.airT` is the walker's own accumulated dt and is
// the only honest answer. (The measurement that was NOT an artefact came out
// of the same run: apex read exactly 0.500m at the clamp, which is Euler
// integration losing a third of the height on a slow frame. That one was a
// real defect and is fixed in main.js.)
const flight = async (x, z, h, hold, release, doubleTap) => page.evaluate(
  async ({ x, z, h, hold, release, doubleTap }) => {
    window.__teleport(x, z, h);
    await new Promise((s) => setTimeout(s, 350));
    if (window.__walkState().mode !== 'walk') window.__toggleMode();
    await new Promise((s) => setTimeout(s, 250));
    // run up (or stand) until the ground speed has settled
    window.__forceWalk = { moveX: 0, moveY: hold ? -1 : 0, run: !!hold };
    await new Promise((s) => setTimeout(s, hold ? 1400 : 250));
    const s0 = window.__airState();
    const p0 = window.__walker();
    const y0 = s0.y;
    window.__jump();
    const samples = [];
    let released = false, doubled = false, t0 = performance.now();
    let pLand = null;
    await new Promise((done) => {
      const tick = () => {
        const a = window.__airState();
        const w = window.__walker();
        samples.push({ t: a.airT, y: a.y, air: a.air, vy: a.vy, sp: a.sp });
        // WHERE THE FEET CAME DOWN. Measuring travel at the end of the probe
        // instead counted the run-on after landing — a running jump scored
        // 115% of run-speed-x-flight, which is impossible and was the tell.
        if (!pLand && samples.length > 2 && !a.air && samples[1].air) pLand = w;
        if (release && a.air && !released) { released = true; window.__forceWalk = { moveX: 0, moveY: 0, run: false }; }
        if (doubleTap && a.air && !doubled && a.vy < 1.0) { doubled = true; window.__jump(); }
        // stop one beat after the feet are down again
        if (samples.length > 4 && !a.air && samples[2].air) return done();
        if (performance.now() - t0 > 4000) return done();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    // CHAINABILITY IS MEASURED ON THE LANDING FRAME, not after a pause: the
    // whole point of the owner's "light hop" is that the next press works
    // immediately, and a recovery lockout would only show up here.
    //
    // POLLED, NOT SLEPT. A fixed 90ms wait failed this check on a build where
    // chaining worked perfectly: headless renders at 4-10fps, so 90ms is
    // often less than ONE frame and the press had simply not been read yet.
    // Six frames is the budget; a real lockout would outlast all of them.
    window.__jump();
    let chained = false;
    for (let k = 0; k < 6 && !chained; k++) {
      await new Promise((r) => requestAnimationFrame(r));
      chained = window.__airState().air;
    }
    window.__forceWalk = null;
    const p1 = pLand || window.__walker();
    return {
      y0, samples, chained,
      dist: Math.hypot(p1.x - p0.x, p1.z - p0.z),
      sp0: s0.sp,
      // a site is only usable if the walker was actually standing on dry
      // land in walk mode: teleporting 5m off a causeway centreline can put
      // them in the sea, where jumping is correctly refused
      ok: !s0.swim && !s0.air && window.__walkState().mode === 'walk',
      flew: samples.some((q) => q.air),
    };
  }, { x, z, h, hold, release, doubleTap });

// the constants the arc is supposed to hit, read from the source of truth
const WALKC = await page.evaluate(() => window.__WALK && { ...window.__WALK });
if (!WALKC) { console.log('  FAIL: window.__WALK missing'); await browser.close(); process.exit(1); }
const SPEC = { apex: (WALKC.jumpV * WALKC.jumpV) / (2 * WALKC.gravity),
  air: (2 * WALKC.jumpV) / WALKC.gravity };
if (BREAK) { await page.evaluate(() => { window.__WALK.gravity *= 0.66; }); console.log('  JUMP_BREAK: gravity weakened, J1/J2 must fail'); }

const fails = [];
const say = (ok, tag, msg) => { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${tag}  ${msg}`); if (!ok) fails.push(tag); };

let apexes = [], airs = [], lands = [], good = 0;
let standDist = 0, runDist = 0, runHeldDist = 0;

for (const [i, [x, z, h, name]] of sites.entries()) {
  const r = await flight(x, z, h, false, false, false);
  if (!r.ok || !r.flew) {
    console.log(`      ${name.slice(0, 22).padEnd(22)} skipped (${!r.ok ? 'not standing on land' : 'no flight'})`);
    continue;
  }
  const apex = Math.max(...r.samples.map((s) => s.y)) - r.y0;
  // TOTAL flight time, read at the FIRST GROUNDED sample after the launch.
  // `walker.airT` is not cleared on landing, so that sample still carries the
  // whole accumulated dt; taking the last AIRBORNE sample instead undercounts
  // by up to one frame, which at the 0.1s dt clamp is a sixth of the hop and
  // failed this check on a correct build.
  const iUp = r.samples.findIndex((s) => s.air);
  const iDown = r.samples.findIndex((s, k) => k > iUp && !s.air);
  const airT = iDown > 0 ? r.samples[iDown].t : Math.max(0, ...r.samples.map((s) => s.t));
  const land = r.samples[r.samples.length - 1].y - r.y0;
  apexes.push(apex); airs.push(airT); lands.push(land);
  if (!good++) {
    usable = [x, z, h];
    standDist = r.dist;
    say(r.chained, 'J7 chainable', 'a press on the landing frame fires again');
  }
  console.log(`      ${name.slice(0, 22).padEnd(22)} apex ${apex.toFixed(3)}m  air ${airT.toFixed(3)}s  land ${land >= 0 ? '+' : ''}${land.toFixed(3)}m`);
}
if (good < 3) { console.log(`\n  FAIL: only ${good} usable sites`); await browser.close(); process.exit(1); }

const med = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
say(Math.abs(med(apexes) - SPEC.apex) < 0.12, 'J1 apex',
  `median ${med(apexes).toFixed(3)}m vs spec ${SPEC.apex.toFixed(3)}m (+/- 0.12)`);
say(Math.abs(med(airs) - SPEC.air) < SPEC.air * 0.12, 'J2 flight',
  `median ${med(airs).toFixed(3)}s vs spec ${SPEC.air.toFixed(3)}s (+/- 12%)`);
say(Math.max(...lands.map(Math.abs)) < 0.06, 'J3 landing',
  `worst return-to-surface ${Math.max(...lands.map(Math.abs)).toFixed(3)}m (< 0.06)`);

// momentum, at one site, three ways — the FIRST USABLE one
const [mx, mz, mh] = usable;
runHeldDist = (await flight(mx, mz, mh, true, false, false)).dist;
runDist = (await flight(mx, mz, mh, true, true, false)).dist;
// TWO-SIDED, because "further than standing" is free when standing travels
// zero metres. A hop taken at a run has to carry very nearly the full run
// speed across the whole flight, and a standing hop has to go nowhere.
const carried = runHeldDist / (WALKC.runSpeed * med(airs));
say(carried > 0.8 && standDist < 0.35, 'J4 momentum',
  `running jump ${runHeldDist.toFixed(2)}m = ${(carried * 100) | 0}% of run speed x flight (> 80%), standing ${standDist.toFixed(2)}m (< 0.35)`);
say(runDist > runHeldDist * 0.75, 'J5 released',
  `stick released mid-air still travels ${runDist.toFixed(2)}m of ${runHeldDist.toFixed(2)}m (> 75%)`);

// no double jump: a second press near the apex must not add height
const dbl = await flight(mx, mz, mh, false, false, true);
const dblApex = Math.max(...dbl.samples.map((s) => s.y)) - dbl.y0;
say(dblApex < med(apexes) + 0.06, 'J6 no double',
  `apex with a mid-air second press ${dblApex.toFixed(3)}m vs ${med(apexes).toFixed(3)}m`);

await browser.close();
if (fails.length) { console.log(`\n  ${fails.length} FAILED: ${fails.join(', ')}`); process.exit(1); }
console.log('\n  jump: all checks pass');
