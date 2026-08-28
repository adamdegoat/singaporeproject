#!/usr/bin/env node
// THE RIDER, IN MOTION, FROM ANGLES YOU CHOOSE.
//
//     node data/ridecam.mjs                    # the default sheet
//     SG_TAG=fix2 node data/ridecam.mjs        # name the run
//     SG_STATES=cruise,carve node data/ridecam.mjs
//
// WHY THIS EXISTS AND WHY data/avatar.mjs IS NOT ENOUGH. avatar.mjs poses the
// rig directly and photographs it against a blank stage: it OVERRIDES
// skatePose(), so what it shows is the pose FUNCTION's output, not the pose
// the game actually puts on screen. Three things it therefore cannot see:
//   * the board (it has no board rig -- the handover records a whole false
//     alarm about "her feet are off the deck" that was this artefact),
//   * the physics driving lean/crouch/push-phase every frame,
//   * the CHASE CAMERA, which is the only view the owner ever has.
// A pose that reads beautifully side-on in a harness still can be illegible
// from behind at 30 km/h, and "illegible from behind" is a real defect --
// it is the one the owner reported on 2026-08-26 ("cannot tell which side
// facing, the body all contorted").
//
// HOW IT TRACKS. The handover's three failed attempts, so nobody repeats them:
//   1. window.__freecam DOES NOT EXIST. Writing camera.position is overwritten
//      by the follow every frame and you silently shoot the spawn view.
//   2. The rig is on window.__scene, NOT window.__world (bike.name =
//      'playerRig', main.js:1366). Traversing __world finds nothing.
//   3. A camera PARKED beside the road loses her in under a second.
// What works: a page-side rAF loop that reads the rig's world position and
// quaternion EVERY FRAME and re-aims window.__cam from it. Angles are given in
// the RIG'S OWN FRAME (right / up / back in metres), so "the heel side" stays
// the heel side through a corner.
import { mkdirSync } from 'fs';
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const OUT = 'shots/ridecam';
mkdirSync(OUT, { recursive: true });
const TAG = process.env.SG_TAG || 'ride';
const PORT = process.env.SG_PORT || 8933;

// WHICH WAY THE RIG FACES — MEASURED, NOT READ. data/footcheck2.mjs samples
// the rig's world position two frames apart and dots the travel vector against
// the rig's own axes: dotZ = 1.000, dotX = 0.000. The board's nose is +Z (as
// vespa.js:297 says), so BEHIND her is -Z. This file first shipped assuming
// the opposite and every label was mirrored — the frame captioned 'chase' was
// shot from in front of her face, which is exactly the kind of evidence that
// invents a facing bug that does not exist. `b` below is metres BEHIND.
//
// A skater rides with the shoulder line ALONG the deck, so the two views that
// decide whether the figure reads are the ones ACROSS the deck: heel side (the
// side her heels point to, +X) and toe side (-X, the side her chest faces).
// `chase` is the owner's actual view and is shot first for that reason.
const ANGLES = [
  { id: 'chase', r: 0.0, u: 1.55, b: -5.2, at: [0, 0.95, 0], fov: 46 },
  { id: 'chase-near', r: 0.0, u: 1.30, b: -3.1, at: [0, 0.95, 0], fov: 46 },
  { id: 'toe', r: -3.4, u: 1.15, b: -0.2, at: [0, 0.85, 0], fov: 40 },
  { id: 'heel', r: 3.4, u: 1.15, b: -0.2, at: [0, 0.85, 0], fov: 40 },
  { id: 'front', r: 0.0, u: 1.45, b: 4.4, at: [0, 0.90, 0], fov: 44 },
  { id: 'q-front-toe', r: -2.6, u: 1.35, b: 2.6, at: [0, 0.90, 0], fov: 44 },
  { id: 'q-back-heel', r: 2.6, u: 1.40, b: -3.0, at: [0, 0.90, 0], fov: 44 },
  { id: 'above', r: 0.1, u: 3.4, b: -1.6, at: [0, 0.55, 0], fov: 46 },
];

// THE STATES. Each is a throttle/steer hold, plus how long to settle before
// the shutter. `push` is deliberately a LOW-SPEED throttle hold, because the
// push stroke only runs under 66% of vMax (main.js:6197) -- shooting it at
// cruising speed photographs a rider who is not pushing.
// THE STATES — AND THE PUSH WINDOW IS THE REASON THEY LOOK LIKE THIS.
// main.js:6164 runs the push stroke whenever `throttle > 0.15 && speed <
// 0.66 * SKATE.vMax`, and SKATE.vMax is 16.667 m/s (60 km/h), so the push is
// live at ANY speed below 39.6 km/h. Holding the throttle therefore does NOT
// photograph a cruise — it photographs a rider kicking, at every speed this
// world is normally ridden at. The first sheet from this file was eight push
// frames all captioned 'cruise'.
//
// So a true cruise has to be reached and then COASTED: run up under throttle,
// drop the stick, and shoot while she rolls. `runup` is the throttle hold
// before the shutter; `th` is what is held during the shot itself.
const STATES = {
  cruise: { runup: [1.0, 0, 5.0], th: 0.0, st: 0.0, warm: 1.0, note: 'rolling, no input — the real cruise' },
  carve: { runup: [1.0, 0, 5.0], th: 0.0, st: 0.7, warm: 1.1, note: 'coasting turn, no push' },
  'carve-hard': { runup: [1.0, 0, 5.0], th: 0.0, st: 1.0, warm: 1.1, note: 'full lock, coasting' },
  push: { runup: [0, 0, 0.2], th: 1.0, st: 0.0, warm: 1.2, note: 'the push stroke, from a near stop' },
  fast: { runup: [1.0, 0, 12.0], th: 1.0, st: 0.0, warm: 0.8, note: 'above the push window' },
};
const WANT = (process.env.SG_STATES || 'cruise,carve,push,fast').split(',');

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error:', e.message));
const XPARAMS = process.env.SG_XPARAMS ? '&' + process.env.SG_XPARAMS : '';
// `?scene=` IS THE PARAMETER (main.js:1913 reads `P.get('scene') || 'sentosa'`).
// Copying lookat.mjs's line cost one 5-minute timeout, because ITS default was
// `scene=world` and there is no district called world. `?district=` is not read
// at all — tools that pass it work only on the sentosa default, which is a
// coincidence worth not relying on. Streaming stays ON (no `nostream`) because
// she has to RIDE through the world, not stand in a pre-built cube.
await page.goto(`http://localhost:${PORT}/?scene=sentosa&reseed=1${XPARAMS}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { polling: 300, timeout: 300000 });
await page.evaluate(() => window.__ui(false));

// A LONG STRAIGHT WITH ROOM TO CARVE. Teleporting per state would re-stream
// the world four times; one settle here and she rides from it.
// THE VANTAGE, AND IT WAS THE SEA. `1180,7250` was this file's default until
// 2026-08-29 and it is a point in OPEN WATER: terrain.at returns 0.00 there,
// which is this project's stored datum for open sea (see the datum note in the
// handover), and __surfaceAt returns 0.024. Nothing failed -- the pose numbers
// are all measured in the BOARD's frame and do not care what is under it, and
// `deckToRoad` is the deck's own height so it reads the same over water. What
// broke was the PICTURE: every ridecam frame for at least two days showed the
// rider against an empty blue void with no road, no kerb and no island, and
// the last session judged the stance from those frames by eye. A vantage with
// nothing in it is the same class of blind instrument as a check that returns
// NaN and passes.
//
// It is the 393m straight at the west end now -- the longest single road
// segment on the island, found by measuring every segment in data.roads rather
// than by picking somewhere that looked open. She reaches 49 km/h on it under
// a 5s run-up (8 km/h at the spawn, which is a beach lane full of furniture),
// so the fast states are actually fast, and there is road either side of her
// in every frame.
const START = (process.env.SG_START || '-1037,11775,-0.0222').split(',').map(Number);
await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), START);
await page.waitForFunction(() => {
  const st = window.__streamState;
  if (st && st.building) return false;
  let n = 0;
  window.__scene.traverse((o) => { if (o.isInstancedMesh) n += o.count; });
  const prev = window.__settleN;
  window.__settleN = n;
  window.__settleHits = (prev === n) ? (window.__settleHits || 0) + 1 : 0;
  return window.__settleHits >= 3;
}, null, { polling: 600, timeout: 300000 }).catch(() => {});
await page.waitForTimeout(1500);

// Install the tracker once. It owns the camera until stopped.
await page.evaluate(() => {
  window.__rcStop = () => { if (window.__rcRaf) cancelAnimationFrame(window.__rcRaf); window.__rcRaf = 0; window.__cam(null); };
  window.__rcTrack = (a) => {
    let rig = null;
    window.__scene.traverse((o) => { if (o.name === 'playerRig') rig = o; });
    if (!rig) { console.warn('no playerRig'); return false; }
    const T = window.__THREE || THREE;
    const p = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3();
    const off = new T.Vector3(), at = new T.Vector3();
    const tick = () => {
      rig.updateWorldMatrix(true, false);
      rig.matrixWorld.decompose(p, q, s);
      // rig-local -> world. x right, y up, z FORWARD (the nose, measured).
      off.set(a.r, a.u, a.b).applyQuaternion(q);
      at.set(a.at[0], a.at[1], a.at[2]).applyQuaternion(q);
      window.__cam(p.x + off.x, p.y + off.y, p.z + off.z,
        p.x + at.x, p.y + at.y, p.z + at.z, a.fov);
      window.__rcRaf = requestAnimationFrame(tick);
    };
    tick();
    return true;
  };
});
const hasThree = await page.evaluate(() => typeof THREE !== 'undefined' || !!window.__THREE);
if (!hasThree) { console.log('  FAIL: THREE not reachable from the page'); await browser.close(); process.exit(1); }

let shots = 0;
for (const name of WANT) {
  const st = STATES[name];
  if (!st) { console.log(`  skip unknown state ${name}`); continue; }
  console.log(`\n  ${name}  (${st.note})`);
  for (const a of ANGLES) {
    // RUN UP FIRST, with the camera already tracking so nothing is shot
    // during the teleport settle. The run-up is what gets her out of (or
    // deliberately into) the push window before the shutter.
    await page.evaluate((a) => window.__rcTrack(a), a);
    if (st.runup && st.runup[2] > 0) {
      await page.evaluate(([t, s2, sec]) => window.__drive(t, s2, sec), st.runup);
    }
    // Then the shot hold. __drive resolves when it lets go, so the hold must
    // outlast the settle AND the shutter or she coasts to a stop between
    // frames and every 'carve' is a stationary rider.
    const hold = page.evaluate(([th, sSt, secs]) => window.__drive(th, sSt, secs),
      [st.th, st.st, st.warm + 1.8]);
    await page.waitForTimeout(st.warm * 1000);
    const r = await page.evaluate(() => window.__rider());
    const file = `${OUT}/${TAG}.${name}.${a.id}.jpg`;
    await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
    shots++;
    console.log(`    ${a.id.padEnd(12)} ${String(r.kmh).padStart(5)} km/h  push ${r.pushing ? 'YES' : ' no'}`
      + `  lean ${String(r.lean).padStart(6)}  crouch ${r.crouch}  phase ${r.phase}`);
    await hold;
    await page.evaluate(() => window.__rcStop());
    await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), START);
    await page.waitForTimeout(500);
  }
}
console.log(`\n  ${shots} frames -> ${OUT}/${TAG}.*`);
await browser.close();
