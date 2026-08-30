#!/usr/bin/env node
// CAN YOU SPIN ON THE SPOT WITHOUT A WEDGE OF THE ISLAND MISSING?
//
//     node data/spincheck.mjs
//
// qtrees.js stopped drawing the trees behind you on 2026-08-31 (the bearing
// note in that file: 23% of the heaviest frame was canopy nobody could see).
// The set it draws is rebuilt at most every REPART_MS, so between two rebuilds
// a turning camera sweeps into ground that was culled — and HALF_COS's margin
// is what has to cover that sweep. Get it wrong and a hard spin leaves a bare
// wedge at the leading edge of the turn.
//
// NO STATIC GATE CAN SEE THIS. The golden suite shoots 46 FIXED poses and all
// 46 are 0.000% with the cull on, because a pose that never changes never
// outruns its own partition.
//
// TWO EARLIER SHAPES OF THIS GATE MEASURED THE CAMERA, NOT THE CANOPY, and
// both are worth knowing about before anyone rewrites it a fourth time.
//
//   1. "spin to a heading, compare with the settled frame at that heading."
//      The chase camera SMOOTHS — two frames after a heading change it is
//      still swinging — so a spun frame differs from a settled one by ~3% of
//      pixels **with the cull turned off**. The control killed it.
//   2. "same spin twice, one flag apart, with __teleport." The smoothing is a
//      function of wall-clock dt, and two browser runs do not get the same dt
//      sequence, so half the steps came back at 2.5% and half at 0.03% —
//      binary noise, which is the camera landing in a different phase, not a
//      wedge of missing trees.
//
// So the pose is set DIRECTLY, with window.__cam, the free camera the golden
// suite's rws-roofs frame uses. No smoothing, no dt, the same pose in both
// runs by construction — and the partition still sees a camera that is turning
// 15 degrees a frame, which is the thing being tested.
//
// Needs the dev server on :8933 (or SG_PORT) and Playwright's chromium.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('spincheck.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync } from 'child_process';

const PORT = process.env.SG_PORT || 8933;
// Two viewpoints with open canopy all the way round — a spin here sweeps
// through trees the whole way, which is the case the margin exists for.
// ON FOOT AS WELL AS ON THE BOARD, and that is not thoroughness — it is the
// bug this gate missed once. The frame loop has THREE render paths: `walk` and
// `onride` each end in their own render and `return`, and the first version of
// the bearing cull was called only from the shared ride tail, so the canopy
// partition froze the moment you got off. Every spot runs in both modes.
const SPOTS = [
  ['Tanjong Beach Walk', -885, 13290],
  ['Imbiah slope', -1560, 12500],
];
const MODES = ['ride', 'walk'];
const STEP = 0.26;          // radians per frame — ~15 degrees, faster than the game turns
const STEPS = 14;           // a bit more than half a turn, shot at every step
const BUDGET = +(process.env.SG_SPIN_BUDGET || 0.05);   // % of pixels

async function shoot(xparams) {
  const browser = await chromium.launch({ headless: true, args: [
    '--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1, hasTouch: true });
  // THE FROZEN PATH, the same one the golden suite boots. The game path has
  // LIVE things in it — qlifeTick's fish, moored boats and creatures move, and
  // they are deliberately frozen under `?district=` "to keep the golden/perf
  // gates pixel-stable" (main.js). Two browser runs of a live world differ by
  // themselves: this file read a flat 0.45% at Tanjong Beach Walk and 0.04%
  // inland on the game path, at every heading, which is sea life swimming and
  // not a wedge of missing canopy.
  await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&touch${xparams}`
    + `&cb=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => {
    const b = document.getElementById('boot');
    return window.__teleport && (!b || b.classList.contains('off') || b.style.display === 'none');
  }, null, { timeout: 300000, polling: 400 });
  await page.evaluate(() => { window.__noArrive = true; });
  // THE DEV HUD PRINTS THE TRIANGLE COUNT, and the whole point of this change
  // is that the triangle count differs — so leaving the interface up compares
  // the two runs' own scoreboards and calls the difference a defect. Same trap
  // the golden suite avoids by shooting the #c canvas only.
  await page.evaluate(() => window.__ui && window.__ui(false));
  const shots = [];
  for (const modeWanted of MODES) {
  const got = await page.evaluate((want) => {
    let m = window.__mode();
    if (m !== want) m = window.__toggleMode();
    return m;
  }, modeWanted);
  if (got !== modeWanted) throw new Error(`could not reach ${modeWanted} mode (got ${got})`);
  for (const [name0, x, z] of SPOTS) {
    const name = `${name0} [${modeWanted}]`;
    // stand there first, so the ground under the free camera is the ground a
    // rider would be standing on
    await page.evaluate(async ({ x, z }) => {
      window.__teleport(x, z, 0);
      await new Promise((s) => setTimeout(s, 1400));
    }, { x, z });
    const eye = await page.evaluate(() => {
      const c = window.__camera;
      return [c.position.x, c.position.y, c.position.z];
    });
    for (let k = 1; k <= STEPS; k++) {
      await page.evaluate(async ({ eye, a }) => {
        window.__cam(eye[0], eye[1], eye[2],
          eye[0] + Math.cos(a) * 100, eye[1] - 4, eye[2] + Math.sin(a) * 100, 45);
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));
      }, { eye, a: k * STEP });
      shots.push([`${name} step ${k}`, await page.screenshot({ timeout: 120000 })]);
    }
    await page.evaluate(() => window.__cam(null));
  }
  }
  await browser.close();
  return shots;
}

// The cull first, then the control: the same motion, one flag apart.
const withCull = await shoot('');
const noCull = await shoot('&nofcull');

const dir = mkdtempSync(join(tmpdir(), 'spincheck-'));
const a = join(dir, 'a.png'), b = join(dir, 'b.png');
let worst = 0, worstAt = '';
for (let i = 0; i < withCull.length; i++) {
  writeFileSync(a, withCull[i][1]); writeFileSync(b, noCull[i][1]);
  const pct = +execFileSync('python3', ['-c', `
import sys
from PIL import Image
import numpy as np
a=np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
b=np.asarray(Image.open(sys.argv[2]).convert('RGB')).astype(int)
print(round(float((np.abs(a-b).max(axis=2)>25).mean()*100), 3))
`, a, b], { encoding: 'utf8' }).trim();
  console.log(`   ${withCull[i][0].padEnd(28)} ${pct.toFixed(3)}%`);
  if (pct > worst) {
    worst = pct; worstAt = withCull[i][0];
    writeFileSync(join(dir, 'worst-cull.png'), withCull[i][1]);
    writeFileSync(join(dir, 'worst-nocull.png'), noCull[i][1]);
  }
}
console.log(`   (worst pair written to ${dir})`);
console.log(`   SPIN {"worstPct":${worst}}`);
if (worst > BUDGET) {
  console.log(`   FAIL  the bearing cull changes a spinning frame: ${worst.toFixed(3)}% of pixels `
    + `at ${worstAt} (budget ${BUDGET}%) — see HALF_COS / REPART_MS in src/qtrees.js`);
  process.exit(1);
}
console.log(`   PASS  ${withCull.length} spun frames identical with the cull on and off `
  + `(worst ${worst.toFixed(3)}%)`);
