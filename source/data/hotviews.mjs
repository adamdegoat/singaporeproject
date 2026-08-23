#!/usr/bin/env node
// THE ISLAND'S HEAVIEST VIEWS, GATED — because the deploy only ever measured
// the arrival point, and the arrival point is the cheapest place on Sentosa.
//
//     node data/hotviews.mjs
//     HOT_URL=https://adamdegoat.github.io/singaporeproject node data/hotviews.mjs
//
// Written 2026-08-23 after the coverage sweep found the worst view at 1,630
// draw calls while livecheck.mjs was passing the same build at 237. Every
// deploy for weeks had read one frame at spawn, called it the world, and
// waved through a view seven times heavier a two-minute walk away. A budget
// that samples one spot is not a budget, it is a spot check.
//
// WHY THESE SPOTS. They are the five heaviest of the 220 the coverage sweep
// visits (data/sweep.mjs prints them under "heaviest views"), plus spawn as
// the control. They are long coastal sightlines — the island curves, so from
// Tanjong you see two kilometres of it with nothing in the way, and fog
// never opacifies over water. Re-derive the list from a fresh sweep if the
// world's shape changes; do not add spots because they feel busy.
//
// WHY THE GAME PATH AND NOT ?district=. The audit path keeps the whole island
// resident and frozen so gates stay pixel-stable; a bare URL is what a player
// loads. TOUCH is forced because consolidate.js's TILE is 240 on touch and
// 110 on desktop, so a probe without it measures a tile size the owner's
// phone never uses — that mistake cost an hour of this session.
//
// Needs the dev server on :8933 (or HOT_URL) and Playwright's chromium.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('hotviews.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const URL_BASE = process.env.HOT_URL || `http://localhost:${process.env.SG_PORT || 8933}`;
const budget = JSON.parse(readFileSync(join(HERE, 'perfbudget.json'), 'utf8'));

const SPOTS = [
  ['spawn (control)',   null,  null,  null],
  ['Tanjong Beach Walk', -885, 13290, -2.67],
  ['Sentosa Gateway',   -1038, 11795, -0.02],
  ['Tanjong headland',   -895, 13358,  3.10],
  ['Tanjong promenade',  -827, 13358, -2.35],
  ['Tanjong east',       -771, 13427, -2.53],
];

const browser = await chromium.launch({ headless: true, args: [
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
] });
const page = await browser.newPage({ viewport: { width: 844, height: 390 },
  deviceScaleFactor: 1, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
// HOT_XPARAMS appends URL params, for A/B runs and for proving this gate can
// still fail (HOT_XPARAMS='noflat&csmall=2' restores the batching the island
// shipped before 2026-08-23 and must go red).
const XP = process.env.HOT_XPARAMS ? '&' + process.env.HOT_XPARAMS : '';
await page.goto(`${URL_BASE}/?touch${XP}&cb=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null,
  { timeout: +(process.env.SG_BOOT_BUDGET || 300000), polling: 400 });
await page.evaluate(() => { window.__noArrive = true; });

console.log(`   hot views   ${URL_BASE}   844x390, touch forced`);
const rows = [];
for (const [name, x, z, h] of SPOTS) {
  const r = await page.evaluate(async ({ x, z, h }) => {
    if (x != null) {
      window.__teleport(x, z, h);
      // the teleport has to SETTLE: district culling, the tree partition and
      // the per-instance compactor all re-decide on camera position, and a
      // reading taken mid-settle is a reading of the previous view
      await new Promise((s) => setTimeout(s, 1500));
    }
    for (let k = 0; k < 10; k++) await new Promise((r) => requestAnimationFrame(r));
    const i = window.__renderer.info.render;
    return { draws: i.calls, trisK: Math.round(i.triangles / 1000) };
  }, { x, z, h });
  rows.push([name, r.draws, r.trisK]);
  console.log(`     ${name.padEnd(20)} ${String(r.draws).padStart(5)} draws  ${String(r.trisK).padStart(5)}k tris`);
}
await browser.close();

// spawn is the control and is judged by livecheck's own budget; the rest are
// judged by the hot-view budget, which is necessarily looser
const hot = rows.slice(1);
const worstD = Math.max(...hot.map((r) => r[1]));
const worstT = Math.max(...hot.map((r) => r[2]));
const over = [];
if (errors.length) over.push(`page errors: ${errors[0]}`);
if (budget.hotDraws && worstD > budget.hotDraws) over.push(`worst draws ${worstD} > ${budget.hotDraws}`);
if (budget.hotTrisK && worstT > budget.hotTrisK) over.push(`worst tris ${worstT}k > ${budget.hotTrisK}k`);
console.log(`   HOT {"worstDraws":${worstD},"worstTrisK":${worstT}}`);
if (over.length) {
  console.log(`   FAIL  over the hot-view budget (data/perfbudget.json): ${over.join('; ')}`);
  process.exit(1);
}
console.log(`   PASS  worst view ${worstD} draws / ${worstT}k tris, within budget`);
