#!/usr/bin/env node
// WHERE DO THE BOOT SECONDS GO? Loads the game at phone size with ?boot=1 and
// prints window.__bootMarks sorted by cost. Exists because the boot budget has
// been failing (33-34s vs 30,000ms) and every prior optimisation of it that
// was not preceded by this table optimised the wrong phase.
//
//     node data/bootprobe.mjs                    # dev tree on 8933
//     node data/bootprobe.mjs http://localhost:8935   # a built dist
const URL_BASE = process.argv[2] || `http://localhost:${process.env.SG_PORT || 8933}`;
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('bootprobe.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--js-flags=--expose-gc',
         '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const ctx = await browser.newContext({
  viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();
const t0 = Date.now();
await page.goto(`${URL_BASE}/?district=sentosa&nostream&touch=1&boot=1&cb=${Date.now()}`,
  { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
const bootMs = Date.now() - t0;
const marks = await page.evaluate(() => window.__bootMarks || []);
await browser.close();
const total = marks.reduce((s, [, ms]) => s + ms, 0);
console.log(`boot ${bootMs} ms wall, ${total} ms marked  (${URL_BASE})`);
// sg: sub-marks live INSIDE the sgdetail phase — print them indented, not
// double-counted in the top-level ranking
const top = marks.filter(([n]) => !n.startsWith('sg:') && !n.endsWith('-count')).sort((a, b) => b[1] - a[1]);
const sg  = marks.filter(([n]) => n.startsWith('sg:')).sort((a, b) => b[1] - a[1]);
for (const [n, ms] of top) console.log(`  ${String(ms).padStart(6)} ms  ${n}`);
console.log('  -- inside sgdetail --');
for (const [n, ms] of sg.slice(0, 15)) console.log(`  ${String(ms).padStart(6)} ms  ${n}`);
