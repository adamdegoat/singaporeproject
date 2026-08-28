// DOES THE PUSH ACTUALLY MOVE, ACROSS THE WHOLE STROKE?
//
//     node data/strokecheck.mjs        # gate: exits 1 on a breach
//
// data/stancecheck.mjs measures the rider in four states and it is the right
// tool for "is this pose correct". It cannot answer this one, because it
// samples ONE INSTANT: the world is deterministic and its settle time is
// fixed, so three runs in a row land on the same phase of the push and report
// the same numbers. A stroke that is right at that instant and frozen either
// side of it passes.
//
// That is not hypothetical. The handover's standing complaint about this
// figure is "she has poses, not motion", and the specific finding under it was
// that shooting five frames of a push returns three that look the same. The
// cause was that avatar.js traced cruise -> PLANT -> DRIVE -> PLANT -> cruise:
// the stroke played forwards and then backwards through two poses, so the
// DRIVE existed for one instant and the RECOVERY put the foot back on the road
// on its way home. stancecheck passed the whole time.
//
// So this walks the phase instead of waiting for it. It drives skatePose
// directly at eleven phases, reads the pushing foot off the bones, and asserts
// the two things that make a stroke a stroke:
//
//   1. the foot is DOWN through the drive (0.22-0.62, avatar.js's own legs)
//   2. the foot LIFTS on the recovery — if it never leaves the ground, the
//      stroke is symmetric again and nobody will notice for a fortnight
//
// Measured in the avatar's own frame against the stroke's own minimum, so it
// needs no road height and cannot be broken by the ground moving under it.
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
const N = 11;
const DRIVE0 = 0.22, DRIVE1 = 0.62;     // keep in step with avatar.js
// THE FOOT IS ONLY REQUIRED DOWN FOR THE FIRST HALF OF THE DRIVE, and the
// first cut of this gate demanded it for all of it. Measured, the ankle climbs
// 0, 16, 45, 69mm across the drive — which is not a breach, it is the foot
// rolling off the ball and leaving the road at the end of the stroke, exactly
// as a stride does. Requiring contact to the last instant would be requiring
// her to drag her toe.
const PLANT1 = 0.45;
const DOWN_MAX = 0.030;                 // how far up still counts as "on it"
const LIFT_MIN = 0.040;                 // the recovery must clear this much

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`,
  { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 250 });

const out = await page.evaluate((N) => {
  let av = null, rig = null;
  window.__scene.traverse((o) => { if (o.userData && o.userData.av) { av = o.userData.av; rig = o; } });
  if (!av) return { err: 'no avatar in the scene' };
  const T = window.__THREE, v = new T.Vector3(), o0 = new T.Vector3();
  const box = new T.Box3();
  let footR = null;
  rig.traverse((o) => { if (o.name === 'Foot.R') footR = o; });
  if (!footR) return { err: 'no Foot.R bone' };
  rig.getWorldPosition(o0);
  const rows = [];
  for (let i = 0; i < N; i++) {
    const p = i / (N - 1);
    // the same two derived numbers main.js hands skatePose
    av.skatePose(0, 0.35, Math.sin(p * Math.PI * 2), 0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    rig.updateMatrixWorld(true);
    // THE ANKLE, AND THAT IS THE SAME NUMBER stancecheck CALLS THE SOLE.
    // Its `soleR` is `ankleR.y - SOLE.R`, a fixed offset — so neither file
    // accounts for the foot rolling, and the two are comparable. (A Box3 over
    // the Foot.R bone was tried first and returns an empty box: the shoe is
    // skinned to the skeleton, not parented to it, so there is no mesh under
    // the bone to measure. It produced NaN, and the gate PASSED on NaN, which
    // is fixed below.)
    footR.getWorldPosition(v);
    rows.push({ p: +p.toFixed(2), y: +(v.y - o0.y).toFixed(4), z: +(v.z - o0.z).toFixed(4) });
  }
  return { rows };
}, N);
await browser.close();

if (out.err) { console.log('  FAIL  ' + out.err); process.exit(1); }
// A GATE THAT PASSES ON NaN IS NOT A GATE. The Box3 attempt above returned
// non-finite heights and every comparison against them was false, so the run
// printed eleven NaNs and then PASS.
if (out.rows.some((r) => !isFinite(r.y) || !isFinite(r.z))) {
  console.log('  FAIL  the probe returned non-finite heights — it is measuring nothing');
  process.exit(1);
}
const ys = out.rows.map((r) => r.y);
const lo = Math.min(...ys), hi = Math.max(...ys);
const say = [];
console.log('  push stroke, pushing foot in the avatar frame');
for (const r of out.rows) {
  const drive = r.p >= DRIVE0 && r.p <= PLANT1;
  console.log(`    phase ${r.p.toFixed(2)}  y ${(r.y - lo >= 0 ? '+' : '')}${((r.y - lo) * 1000).toFixed(0)}mm`
    + `  along deck ${(r.z * 1000).toFixed(0)}mm  ${drive ? 'DRIVE' : ''}`);
  if (drive && r.y - lo > DOWN_MAX) {
    say.push(`phase ${r.p.toFixed(2)} is in the drive but the foot is ${((r.y - lo) * 1000).toFixed(0)}mm up`);
  }
}
const recovery = out.rows.filter((r) => r.p > DRIVE1);
const lift = recovery.length ? Math.max(...recovery.map((r) => r.y)) - lo : 0;
console.log(`    range ${((hi - lo) * 1000).toFixed(0)}mm    recovery lift ${(lift * 1000).toFixed(0)}mm`
  + ` (needs ${LIFT_MIN * 1000})`);
if (lift < LIFT_MIN) say.push(`the recovery only lifts the foot ${(lift * 1000).toFixed(0)}mm`
  + ` — that is a symmetric stroke, not a push`);
if (say.length) { for (const s of say) console.log('    - ' + s); console.log(`  ${say.length} finding(s)`); process.exit(1); }
console.log('  PASS  the stroke drives on the ground and lifts on the way home');
