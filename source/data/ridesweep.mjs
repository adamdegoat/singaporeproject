#!/usr/bin/env node
// RIDE SWEEP — what each ride LOOKS like from inside it.
//
//     node data/ridesweep.mjs            # 5 frames per ride into shots/ride
//     SG_RIDE_N=8 node data/ridesweep.mjs
//
// `ridecheck` rides every ride at wall clock and checks NUMBERS. The goldens
// shoot 46 fixed poses and not one of them is on a ride. `onride` is the third
// of this loop's render paths, and the footpath sweep already showed what
// happens to a mode nobody photographs — the sky had been black on foot for
// months with every gate green.
//
// Its first run found the entrance panel still on screen during a ride, telling
// a passenger to "Press Ride on the deck" while they were already on it.
//
// SAMPLED BY PROGRESS, NOT BY A TIMER. The first version shot four frames 3.5s
// apart, which on a 1,734m cable car is the first 110 metres and nothing else —
// twelve rides photographed at their launch pads. `__rideState().s` is the
// distance travelled and `s1` is where the ride ends, so the frames are spread
// across what a passenger actually sees.
//
// It is a TOOL, not a gate: no budget, no exit code. Build contact sheets from
// shots/ride and look at them.
//
// Needs the dev server on :8933 (or SG_PORT) and Playwright's chromium.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync, writeFileSync } from 'fs';
const OUT = process.env.SG_OUT || 'shots/ride';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: [
  '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 592 } });
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?cb=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 400 });
await page.evaluate(() => { window.__noArrive = true; window.__ui && window.__ui(false); });
const rides = await page.evaluate(() => window.__rides());
console.log(`   ${rides.length} rides`);
const rows = [];
let n = 0;
for (const r of rides) {
  const ok = await page.evaluate((i) => window.__board(i), r.i);
  if (!ok) { console.log(`   could not board ${r.kind} ${r.name || ''}`); continue; }
  await page.waitForTimeout(900);
  // SPREAD ACROSS THE RIDE, by progress. `s1` is where the ride ends (which is
  // NOT `len` — the cable car stops at its last station, see window.__rides).
  const WANT = +(process.env.SG_RIDE_N || 5);
  for (let k = 0; k < WANT; k++) {
    const target = ((k + 0.5) / WANT);
    const reached = await page.evaluate(async (frac) => {
      for (let tries = 0; tries < 900; tries++) {
        const st = window.__rideState ? window.__rideState() : null;
        if (!st) return null;                       // ride ended early
        const end = st.s1 != null ? st.s1 : st.len;
        const s0 = st.s0 || 0;
        if ((st.s - s0) / Math.max(1, end - s0) >= frac) return st;
        await new Promise((r) => setTimeout(r, 100));
      }
      return window.__rideState ? window.__rideState() : null;
    }, target);
    if (!reached) break;
    await page.screenshot({ path: `${OUT}/${String(n).padStart(3, '0')}.jpg`, quality: 78, type: 'jpeg' });
    rows.push({ i: n, kind: r.kind, name: r.name || '', at: +target.toFixed(2), st: reached });
    n++;
  }
  // get off however the game allows, then carry on
  await page.evaluate(() => { const b = document.getElementById('modebtn'); if (b) b.click(); });
  await page.waitForTimeout(1200);
}
writeFileSync(`${OUT}/rides.json`, JSON.stringify(rows));
console.log(`   wrote ${n} frames`);
await browser.close();
