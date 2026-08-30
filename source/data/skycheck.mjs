#!/usr/bin/env node
// DOES THE SKY FOLLOW YOU IN EVERY MODE?
//
//     node data/skycheck.mjs
//
// The dome is a 480m sphere that has to sit on the camera; walk out of it and
// the sky is #000000. This has now been the same bug twice, in two of the frame
// loop's THREE render paths:
//
//   2026-08-17  every one of the fifteen RIDES had a black sky, because the
//               `onride` branch renders and returns and never moved the dome.
//               Fixed there, in that branch, by hand.
//   2026-08-31  the WALK branch never had the line at all — and walking is what
//               the owner calls the point of this world. Measured: riding, the
//               dome sits on the camera to the metre; walking, it stays where
//               you got off the board. **1,233m behind at the luge station,
//               1,755m at Siloso.** Half the footpath sweep has a black sky in
//               it and no gate in this repo could see it: the goldens shoot 46
//               fixed poses and every one of them is close to where the dome
//               happened to be.
//
// The fix is `sky.onBeforeRender`, which no branch can forget. This gate is
// here because the CLASS keeps coming back, and because it costs one boot and
// no screenshots: read the dome's position against the camera's, in each mode,
// far from spawn.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('skycheck.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
const BUDGET = +(process.env.SG_SKY_GAP || 5);      // metres
const SPOTS = [
  ['Tanjong Beach Walk', -885, 13290],
  ['Imbiah / the luge', -1829, 12498],
  ['Siloso bridge', -2345, 12315],
];

const browser = await chromium.launch({ args: [
  '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/?cb=${Date.now()}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 400 });
await page.evaluate(() => { window.__noArrive = true; });

// IT ASKS FOR THE DOME, IT DOES NOT GO LOOKING FOR ONE. The first version of
// this file found it by "the biggest bounding sphere in the scene" and picked
// up a 1,000,000m one — reporting a 13km gap on a build where the dome sits
// exactly on the camera. It failed loudly rather than passing, which is the
// only reason that is a story and not a shipped bug. main.js publishes
// `window.__sky`.
const gapAt = (mode, x, z) => page.evaluate(async ([mode, x, z]) => {
  if (window.__walkState().mode !== mode) window.__toggleMode();
  await new Promise((r) => setTimeout(r, 300));
  window.__teleport(x, z, 0);
  await new Promise((r) => setTimeout(r, 1200));
  const sky = window.__sky;
  if (!sky) return { err: 'window.__sky is not published — see its note in main.js' };
  if (!sky.geometry.boundingSphere) sky.geometry.computeBoundingSphere();
  const cam = window.__camera;
  return { gap: +Math.hypot(cam.position.x - sky.position.x,
                            cam.position.z - sky.position.z).toFixed(1),
           radius: Math.round(sky.geometry.boundingSphere.radius),
           mode: window.__walkState().mode };
}, [mode, x, z]);

let worst = 0, worstAt = '', err = null;
for (const mode of ['ride', 'walk']) {
  for (const [name, x, z] of SPOTS) {
    const r = await gapAt(mode, x, z);
    if (r.err) { err = r.err; break; }
    console.log(`   ${(name + ' [' + mode + ']').padEnd(30)} dome ${r.gap} m from the camera `
      + `(dome radius ${r.radius} m)`);
    if (r.gap > worst) { worst = r.gap; worstAt = `${name} [${mode}]`; }
  }
}
await browser.close();
if (err) { console.log(`   FAIL  ${err}`); process.exit(1); }
console.log(`   SKY {"worstGapM":${worst}}`);
if (worst > BUDGET) {
  console.log(`   FAIL  the sky dome does not follow the camera: ${worst} m at ${worstAt} `
    + `(budget ${BUDGET} m) — a render path is not repositioning it, see sky.onBeforeRender`);
  process.exit(1);
}
console.log(`   PASS  the dome follows the camera in both modes (worst ${worst} m)`);
