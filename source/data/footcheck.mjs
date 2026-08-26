// THE PUSHING FOOT MUST NOT PASS THROUGH THE BOARD.
//
// The owner's standing rule for anything physical is "no clipping", and the
// avatar is the thing he looks at most. This is the regression guard for the
// one case that is easy to get wrong: during the push the rear foot reaches
// PAST the deck to the ground, so it legitimately drops below the deck's top
// surface. The defect would be it dropping below the deck while still
// horizontally over it -- a leg through the board.
//
// WHY IT IS WRITTEN THIS WAY. Judging this from a screenshot does not work:
// side-on, the deck OCCLUDES the far-side foot, so a perfectly correct push
// looks exactly like a leg passing through the board. That misread cost a
// full investigation on 2026-08-26. Two other instruments failed before this
// one:
//   * "largest flat mesh under the rig" picked something whose top sat 0.3m
//     ABOVE the planted front foot -- not the deck -- and duly reported both
//     feet inside the board.
//   * a world-space Y comparison cannot answer it at all, because the board
//     tilts and the test has to be in the DECK'S OWN space.
// So the deck is identified POSITIVELY by the grip-tape colour #1e2024, and
// feet are transformed into deck-local space before being tested. Both parts
// are load-bearing.
//
// MEASURED 2026-08-26 (throttle 0.5, ~2s of push cycles, 121 frames):
//   Foot.L  +0.266..+0.280 above deck top   (planted, never near it)
//   Foot.R  -0.018..+0.125                  (dips past the deck's height)
//   frames below the deck AND inside its footprint: 0 of 121
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
const BUDGET = +(process.env.SG_CLIP_BUDGET || 0);

const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 700, height: 600 } });
await page.goto(`http://localhost:${PORT}/?scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
await page.waitForTimeout(3000);
await page.evaluate(() => window.__teleport(-885, 13290, -2.67));
await page.waitForTimeout(1200);
// throttle held so the push cycle runs; the push is the only state that
// reaches past the deck, so it is the only one that can produce this defect
await page.evaluate(() => { window.__force = { throttle: 0.5, steer: 0, brake: 0 }; });
await page.waitForTimeout(2500);

const r = await page.evaluate(() => new Promise((res) => {
  const THREE = window.__THREE;
  let rig = null;
  for (const root of [window.__scene, window.__world]) if (root && !rig)
    root.traverse((o) => { if (o.name === 'playerRig') rig = o; });
  if (!rig) return res({ error: 'playerRig not found' });
  let deck = null;
  rig.traverse((o) => {
    if (o.isMesh && !o.isSkinnedMesh && o.material?.color?.getHexString() === '1e2024') deck = o;
  });
  if (!deck) return res({ error: 'deck mesh (#1e2024) not found — was the board re-coloured?' });
  const feet = [];
  rig.traverse((o) => { if (/^Foot\.(L|R)$/.test(o.name || '')) feet.push(o); });
  if (!feet.length) return res({ error: 'no Foot.L/Foot.R bones found' });

  const v = new THREE.Vector3(), inv = new THREE.Matrix4();
  const bad = []; let frames = 0; const range = {};
  const t0 = performance.now();
  const tick = () => {
    deck.updateMatrixWorld(true);
    inv.copy(deck.matrixWorld).invert();
    deck.geometry.computeBoundingBox();
    const bb = deck.geometry.boundingBox;
    frames++;
    for (const f of feet) {
      f.getWorldPosition(v); v.applyMatrix4(inv);
      const overDeck = v.x > bb.min.x && v.x < bb.max.x && v.z > bb.min.z && v.z < bb.max.z;
      const dy = v.y - bb.max.y;
      const e = range[f.name] || (range[f.name] = { lo: 9, hi: -9 });
      if (dy < e.lo) e.lo = dy; if (dy > e.hi) e.hi = dy;
      // through the board: under the deck's underside while still over it
      if (overDeck && dy < -0.06) bad.push({ f: f.name, dy: +dy.toFixed(3) });
    }
    if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
    else res({ frames, bad, range });
  };
  requestAnimationFrame(tick);
}));

console.log('   foot through the board   push cycle, tested in deck-local space');
if (r.error) {
  console.log(`   FAIL  ${r.error}`);
  await browser.close();
  process.exit(1);
}
for (const [n, e] of Object.entries(r.range))
  console.log(`     ${n.padEnd(7)} ${e.lo >= 0 ? '+' : ''}${e.lo.toFixed(3)}..${e.hi >= 0 ? '+' : ''}${e.hi.toFixed(3)} relative to deck top`);
console.log(`   FOOTCLIP ${JSON.stringify({ frames: r.frames, through: r.bad.length })}`);
const ok = r.bad.length <= BUDGET;
console.log(ok
  ? `   PASS  no foot through the deck in ${r.frames} frames`
  : `   FAIL  ${r.bad.length} of ${r.frames} frames have a foot under the deck while over it (budget ${BUDGET}) — worst ${r.bad[0].f} ${r.bad[0].dy}m`);
await browser.close();
process.exit(ok ? 0 : 1);
