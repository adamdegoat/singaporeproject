// SWIMCHECK — the swim loop, walked end to end by the player's own inputs.
//
// The owner's feature (2026-08-14): "when the avatar goes into water then can
// realistically start swimming... so ppl can swim off to the islets", and
// "ppl get out of water must be realistic" — exits are WALKING, never back on
// the board. This drives a real browser through the whole loop and fails
// loudly at the step that breaks:
//
//   1. WALK IN:  get off at the Siloso shore, walk north — wade (depth under
//                0.75 m, still on foot) then SWIM (breaststroke sub-state).
//   2. WALK OUT: swim back south until the feet find ground — the sub-state
//                must clear while still in the shallows, exiting on foot.
//   3. RIDE IN:  skate a measured open corridor at the waterline — the board
//                must AUTO-DISMOUNT at the wet-sand line (never pinned, never
//                carried into the sea) and the walk must reach swim depth.
//
// The two entry points are MEASURED, not scenic: the walk line crosses the
// deep channel at x -1950 (depth 1.9), the ride corridor at x -2040 is the
// one whose first blocker is walkable sand rather than the beach fence.
// Run: node data/swimcheck.mjs   (SG_PORT to override)
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
page.on('pageerror', (e) => console.log('  PAGE ERROR', e.message));
const load = async () => {
  await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=sentosa`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });
};
const state = () => page.evaluate(() => window.__walkState());
const key = (code, down) => page.evaluate(({ code, down }) =>
  dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code })), { code, down });
let fails = 0;
const expect = (ok, what) => {
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) fails++;
};

console.log('== swimcheck');
await load();

// -- 1+2: walk in, swim, turn round, walk out --------------------------------
await page.evaluate(() => window.__teleport(-1950, 12694, 0));
await page.waitForTimeout(2500);
await page.click('#modebtn');
await page.waitForTimeout(400);
let st = await state();
expect(st.mode === 'walk' && !st.swim, 'off the board, on foot at the shore');
await key('KeyW', true);
let swam = false, waded = false;
for (let s = 0; s < 30 && !swam; s++) {
  await page.waitForTimeout(1000);
  st = await state();
  const d = await page.evaluate((p) => window.__seaDepthAt(p.x, p.z), st);
  if (!st.swim && d !== null && d > 0.1) waded = true;
  if (st.swim) swam = true;
}
await key('KeyW', false);
expect(waded, 'waded through the shallows on foot first');
expect(swam, 'swimming at depth');
await key('KeyS', true);
let out = false;
for (let s = 0; s < 30 && !out; s++) {
  await page.waitForTimeout(1000);
  st = await state();
  if (!st.swim) out = true;
}
await key('KeyS', false);
expect(out && st.mode === 'walk', 'feet found ground — WALKED out, not boarded');

// -- 3: ride the corridor into the waterline ---------------------------------
await load();
await page.evaluate(() => window.__teleport(-2040, 12580, 0));
await page.waitForTimeout(6000);
await key('KeyW', true);
let dismounted = false, swamFromRide = false;
for (let s = 0; s < 35; s++) {
  await page.waitForTimeout(1000);
  st = await state();
  if (st.mode === 'walk') dismounted = true;
  if (dismounted && st.swim) { swamFromRide = true; break; }
}
await key('KeyW', false);
expect(dismounted, 'the board auto-dismounted at the wet-sand line');
expect(swamFromRide, 'and the walk carried on into a swim');

console.log(`   ${fails ? 'FAIL' : 'PASS'}  swim loop ${fails ? `— ${fails} step(s) broke` : 'end to end'}`);
await browser.close();
process.exit(fails ? 1 : 0);
