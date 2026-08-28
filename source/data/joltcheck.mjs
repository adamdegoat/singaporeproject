#!/usr/bin/env node
// WHAT THE GROUND ACTUALLY DOES TO THE DECK, AND WHETHER THE RIDER SHOULD CARE.
//
//     node data/joltcheck.mjs
//     SG_SECONDS=40 node data/joltcheck.mjs
//
// main.js splits the deck's vertical speed into the GRADE (sustained) and the
// SHOCK (sudden), and the shock drives a transient crouch so a kerb is
// something that happens TO the rider instead of a photograph on a stick. Both
// numbers in that gain were guesses until this file measured the ground they
// are meant to describe.
//
// TWO THINGS HAVE TO BE TRUE AT ONCE and one of them is easy to forget:
//   * the term must FIRE. A bump reaction nobody ever sees is dead code with a
//     comment on it.
//   * ...and it must be SILENT on a road. This island's terrain is a sampled
//     heightfield: if the sampler's own noise clears the threshold, she twitches
//     her way down every straight, which is worse than not reacting at all.
// So the run reports both ends -- the quiet floor and the loud tail -- and
// fails on either.
//
// It drives a REAL ROUTE rather than teleporting to a kerb: a teleport lands
// her ON the far side of the step, which is the one place the step cannot be
// measured.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const SECONDS = +(process.env.SG_SECONDS || 30);
// The 393m straight -- the same vantage the rider's other gates use.
const START = (process.env.SG_START || '-1037,11775,-0.0222').split(',').map(Number);

const BUD = {
  quiet: 0.12,     // |jolt| on a settled straight: anything above this is a twitch
  fireAt: 0.30,    // ...and over the whole drive the term must reach this
  // THE RIDE SURFACE ITSELF, which is the thing the bump term reacts TO and
  // has to be sane before any reaction to it means anything.
  //
  // WHAT THE BOARD'S OWN SEAT MAY DO IN ONE FRAME. At 60 km/h a frame carries
  // her 0.28m, and the steepest road on the island is well under 45 degrees,
  // so honest ground moves the seat by centimetres. 0.20m is far above
  // anything a slope can produce and far below every teleport this pass was
  // written to catch (0.45, 0.72, 4.7, 12.3).
  seat: 0.20,
};

const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:${PORT}/?scene=sentosa&reseed=1`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { polling: 300, timeout: 300000 });
await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), START);
await page.waitForTimeout(2500);

// SAMPLED PAGE-SIDE, ON THE FRAME. Polling from node samples at whatever the
// round trip allows -- about 8 Hz -- and a shock lasts a tenth of a second, so
// the peak that matters is exactly what a polled sample misses. This records
// every frame and hands the whole trace over at the end.
await page.evaluate(() => {
  window.__joltTrace = [];
  window.__joltStop = false;
  const tick = () => {
    const P = window.__avPose;
    if (P && P.shock != null) {
      window.__joltTrace.push([P.shock, P.jolt, P.grade, P.crouch,
        window.__surface ? window.__surface().kind : '?']);
    }
    if (!window.__joltStop) requestAnimationFrame(tick);
  };
  tick();
});

// PHASE 1: a settled straight. Full throttle, no steer, on the longest road on
// the island -- the quietest ground the game has.
await page.evaluate(() => { window.__force = { throttle: 1, steer: 0, brake: 0 }; });
await page.waitForTimeout(6000);
const quiet = await page.evaluate(() => {
  const t = window.__joltTrace.slice(-120);   // the last ~2s, well settled
  window.__joltTrace = [];
  return t;
});

// PHASE 2: ride the island. Weave so she crosses kerbs, verges and ramps
// rather than tracking one lane -- the steer is a slow sine, not a hold, so
// she leaves the carriageway and comes back.
const t0 = Date.now();
while (Date.now() - t0 < SECONDS * 1000) {
  const st = Math.sin((Date.now() - t0) / 1400) * 0.75;
  await page.evaluate(([s]) => { window.__force = { throttle: 1, steer: s, brake: 0 }; }, [st]);
  await page.waitForTimeout(120);
}
const trace = await page.evaluate(() => {
  window.__joltStop = true;
  window.__force = null;
  return window.__joltTrace;
});
await browser.close();

// ---- AND THE SURFACE UNDER ALL OF IT ---------------------------------------
//
// THE BOARD'S OWN SEAT, FRAME BY FRAME, WHILE SHE ACTUALLY RIDES.
//
// The first version of this pass walked every road centreline calling the
// ride's surface function with a carried height, and it could not be made
// sound. `fromY` is a HISTORY, and a walk that starts at a way's first vertex
// has to invent one: seeded from the terrain it put her under every bridge,
// seeded from the ungated answer it put her ON every viaduct her road passes
// beneath. Both produce metre-scale "steps" at the point the invented seat
// meets the real world -- it reported 14.582m at -1549,12432 and 4.723m at
// -1034,12090, and neither is reachable by a rider. Two rounds of trying to
// separate the artefacts by sign (a lift is an invariant, a drop is gravity)
// narrowed it and did not fix it, because the seed can be wrong in either
// direction.
//
// So it does not guess. It DRIVES: the game supplies the seat, every frame,
// and the only thing measured is what the board's own y does between two
// consecutive frames. A jump there is a jump the player sees.
const SPOTS = (process.env.SG_SPOTS || [
  '-1037,11775,-0.0222',   // the 393m straight, the flattest road on the island
  '320,13760,0.288',       // the bridge crest whose deck was an 8m staircase
  '-1757,12240,0',         // the cable-car station road, the 12.3m stair launch
  '-1050,12060,0',         // the Boardwalk landings, SESSION 17's shore steps
  '-1560,12400,0',         // under the viaduct at the west end
  '-1241.6,12973,-0.4363', // the spawn, Palawan Beach
].join(';')).split(';');
const surf = await (async () => {
  const b2 = await chromium.launch({ args: ['--use-gl=angle'] });
  const p2 = await b2.newPage({ viewport: { width: 800, height: 600 } });
  p2.on('pageerror', (e) => console.log('  page error:', e.message));
  await p2.goto(`http://localhost:${PORT}/?scene=sentosa&reseed=1`, { waitUntil: 'load' });
  await p2.waitForFunction(() => window.__teleport && window.__ready === true,
    null, { polling: 300, timeout: 300000 });
  const runs = [];
  for (const spot of SPOTS) {
    const [x, z, h] = spot.split(',').map(Number);
    await p2.evaluate(([a, b3, c]) => window.__teleport(a, b3, c), [x, z, h]);
    await p2.waitForTimeout(2200);
    // RECORDED ON THE FRAME, not polled. A one-frame teleport is exactly the
    // event a round-trip poll steps over.
    await p2.evaluate(() => {
      window.__seatTrace = []; window.__seatStop = false;
      const tick = () => {
        let rig = null;
        window.__scene.traverse((o) => { if (o.name === 'playerRig') rig = o; });
        const R = window.__rider();
        if (rig) window.__seatTrace.push([+rig.position.y.toFixed(4), +window.__kmh().toFixed(1),
          R.fall || 0, (window.__avPose || {}).jolt || 0]);
        if (!window.__seatStop) requestAnimationFrame(tick);
      };
      tick();
    });
    await p2.evaluate(() => { window.__force = { throttle: 1, steer: 0, brake: 0 }; });
    await p2.waitForTimeout(6000);
    const t = await p2.evaluate(() => {
      window.__seatStop = true; window.__force = null;
      return window.__seatTrace;
    });
    // the first ~10 frames are the teleport settling, not riding
    // FALLING FRAMES ARE NOT STEPS. Off the end of the Boardwalk she drops
    // several metres at g, and a frame of that legitimately moves the seat
    // further than any budget for a teleport should allow. Gravity is measured
    // by its own rule, not by this one.
    let worst = 0, worstKmh = 0, fell = 0, maxFall = 0;
    for (let i = 11; i < t.length; i++) {
      if (t[i][2] > 0 || t[i - 1][2] > 0) { fell++; maxFall = Math.max(maxFall, t[i][2]); continue; }
      const d = Math.abs(t[i][0] - t[i - 1][0]);
      if (d > worst) { worst = d; worstKmh = t[i][1]; }
    }
    runs.push({ spot, frames: t.length, worst: +worst.toFixed(4), kmh: worstKmh, fell, maxFall: +maxFall.toFixed(1),
      jolt: +Math.max(0, ...t.map((r) => Math.abs(r[3]))).toFixed(3),
      topKmh: Math.max(0, ...t.map((r) => r[1])) });
  }
  await b2.close();
  return { runs };
})();

const pct = (a, p) => a.length ? a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0;
const absOf = (rows, i) => rows.map((r) => Math.abs(r[i]));

const qJolt = absOf(quiet, 1), qShock = absOf(quiet, 0);
const rJolt = absOf(trace, 1), rShock = absOf(trace, 0);
const kinds = {};
for (const r of trace) kinds[r[4]] = (kinds[r[4]] || 0) + 1;

console.log(`\n  the bump term, over ${trace.length} frames of riding + ${quiet.length} settled`);
console.log(`    settled straight   shock p95 ${pct(qShock, 0.95).toFixed(3)} m/s   |jolt| p95 ${pct(qJolt, 0.95).toFixed(3)}   max ${Math.max(0, ...qJolt).toFixed(3)}`);
console.log(`    riding the island  shock p95 ${pct(rShock, 0.95).toFixed(3)} m/s  max ${Math.max(0, ...rShock).toFixed(3)}`);
console.log(`                       |jolt| p50 ${pct(rJolt, 0.50).toFixed(3)}  p95 ${pct(rJolt, 0.95).toFixed(3)}  max ${Math.max(0, ...rJolt).toFixed(3)}`);
console.log(`                       frames over 0.30: ${rJolt.filter((x) => x > 0.30).length}  (${(100 * rJolt.filter((x) => x > 0.30).length / Math.max(1, rJolt.length)).toFixed(1)}%)`);
console.log(`    surfaces ridden    ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join('  ')}`);
console.log('    the board\'s own seat, driven:');
for (const r of surf.runs) {
  console.log(`      ${r.spot.padEnd(24)} ${String(r.frames).padStart(4)} frames  top ${String(r.topKmh).padStart(5)} km/h`
    + `   seat step ${r.worst.toFixed(4)}m${r.worst > BUD.seat ? ' <-- OVER' : ''}`
    + `   falling ${String(r.fell).padStart(3)} frames (to ${r.maxFall} m/s)   peak |jolt| ${r.jolt}`);
}

const say = [];
if (!trace.length) say.push('no frames recorded -- __avPose.shock is missing, so nothing below means anything');
const qMax = Math.max(0, ...qJolt);
if (qMax > BUD.quiet) say.push(`she twitches on a straight: |jolt| reached ${qMax.toFixed(3)} with no bump in sight (budget ${BUD.quiet})`);
const rMax = Math.max(0, ...rJolt);
// THE BUMP TERM IS JUDGED ACROSS EVERYTHING DRIVEN, not just the weave. The
// weave runs on the flattest road on the island by design (it is the quiet
// control), and after the bridge decks were made to interpolate this island's
// roads really are smooth -- 98.4% of road samples move the seat under 5mm in
// half a metre. The places a body has something to absorb are the landings.
const joltMax = Math.max(rMax, ...surf.runs.map((r) => r.jolt));
if (joltMax < BUD.fireAt) say.push(`the bump term never fires: worst |jolt| anywhere in this run was ${joltMax.toFixed(3)} (needs ${BUD.fireAt})`);
if (!surf.runs.length) say.push('the ride surface was not measured at all: no runs completed');
for (const r of surf.runs) {
  if (r.frames < 60) say.push(`${r.spot}: only ${r.frames} frames recorded -- the run did not happen`);
  else if (r.worst > BUD.seat) say.push(`${r.spot}: the board's seat moved ${r.worst.toFixed(3)}m in ONE frame at ${r.kmh} km/h (budget ${BUD.seat})`);
}
for (const s of say) console.log('      - ' + s);
console.log(say.length ? `\n  FAIL  ${say.length} finding(s)` : '\n  PASS  the rider absorbs bumps and is still on a straight');
process.exit(say.length ? 1 : 0);
