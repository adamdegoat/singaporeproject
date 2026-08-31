#!/usr/bin/env node
// WALK SWEEP — the coverage sweep for the half of Sentosa nobody rides.
//
//     node data/walksweep.mjs            # ~90 frames into shots/walk
//     SG_WALK_N=200 node data/walksweep.mjs
//
// `data/sweep.mjs` visits 33 STREETS at rider height, looking along the road.
// Sentosa's character is its beaches, boardwalks and jungle trails, and until
// 2026-08-31 the only eyes ever on those were 46 fixed golden frames — all of
// them near where the sky dome happened to be sitting.
//
// The first run of this file found that **the sky was BLACK on foot**: the walk
// branch never moved the 480m dome, so it stayed where you got off the board,
// 1,755m behind. 61 of 92 frames had more than 5% pure black in them. Not one
// gate in this repo could see it. That is what this file is for, and why it
// shoots pictures for a person to look at rather than printing a verdict.
//
// It is a TOOL, not a gate: it has no budget and no exit code, because "does
// this trail read as a trail" is not a number. Build contact sheets from
// shots/walk and look at them.
//
// Needs the dev server on :8933 and Playwright's chromium.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync, writeFileSync } from 'fs';
const OUT = process.env.SG_OUT || 'shots/walk';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: [
  '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist',
  '--disable-background-timer-throttling'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 592 } });
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?cb=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 400 });
await page.evaluate(() => { window.__noArrive = true; window.__ui && window.__ui(false); });
// switch to walking — these are footpaths
await page.evaluate(() => { if (window.__walkState().mode !== 'walk') window.__toggleMode(); });

const stops = await page.evaluate((STRIDE) => {
  const out = [];
  for (const r of (window.__data.roads || [])) {
    const k = (r.k || '').toLowerCase();
    if (k !== 'footway' && k !== 'pedestrian' && k !== 'path' && k !== 'steps') continue;
    const p = r.p || [];
    let acc = 1e9;
    for (let i = 0; i < p.length - 1; i++) {
      const d = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
      acc += d;
      if (acc < STRIDE) continue;
      acc = 0;
      out.push({ name: r.n || '(unnamed)', x: p[i][0], z: p[i][1],
        h: Math.atan2(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]) });
    }
  }
  return out;
}, 120);
console.log(`   ${stops.length} footpath stops`);
const WANT = +(process.env.SG_WALK_N || 92);
const pick = stops.filter((_, i) => i % Math.max(1, Math.ceil(stops.length / WANT)) === 0);
console.log(`   shooting ${pick.length}`);
const rows = [];
for (let i = 0; i < pick.length; i++) {
  const s = pick[i];
  await page.evaluate(async (s) => {
    window.__teleport(s.x, s.z, s.h);
    await new Promise((r) => setTimeout(r, 620));
  }, s);
  await page.screenshot({ path: `${OUT}/${String(i).padStart(3, '0')}.jpg`, quality: 78, type: 'jpeg' });
  rows.push({ i, ...s });
  if (i % 20 === 0) process.stdout.write(`${i} `);
}
writeFileSync(`${OUT}/stops.json`, JSON.stringify(rows));
console.log(`\n   wrote ${pick.length} frames to ${OUT}`);
await browser.close();
