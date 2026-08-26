#!/usr/bin/env node
// WHERE ARE HER FEET, REALLY — measured against the deck IDENTIFIED POSITIVELY.
//
//     node data/footcheck2.mjs
//
// The handover (2026-08-26) left this open on purpose: two frames looked like
// the rear foot passing THROUGH the deck, and the probe written to settle it
// picked "the largest flat mesh under the rig" as the deck. That mesh's top
// sat 0.3m ABOVE the standing front foot, so it was not the deck, and both
// feet registered as "inside" it. A test that cannot tell a foot resting ON
// the board from one passing through it settles nothing.
//
// POSITIVE IDENTIFICATION INSTEAD. The board is built in vespa.js:206-214 as
// boxes at a known local height (DECK_Y 0.115, deck box 0.028 tall, grip
// 0.006 on top at +0.017) inside the group named 'playerRig'. So the deck is
// found by walking THAT group for the mesh whose local geometry matches the
// deck plank's footprint, and its top surface is computed, not guessed.
//
// It also answers the question this file was really written for: WHICH LOCAL
// AXIS OF THE RIG POINTS THE WAY SHE IS TRAVELLING. vespa.js:297 says "the
// board's nose is +z"; data/ridecam.mjs was first written assuming -z and
// every camera label in it was mirrored. Measure it, do not read it.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:${PORT}/?district=sentosa&reseed=1`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { polling: 300, timeout: 300000 });
await page.evaluate(() => window.__ui(false));

const START = (process.env.SG_START || '1180,7250,0').split(',').map(Number);
await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), START);
await page.waitForTimeout(2500);

const out = await page.evaluate(async ({ th, secs }) => {
  const T = window.__THREE;
  let rig = null;
  window.__scene.traverse((o) => { if (o.name === 'playerRig') rig = o; });
  if (!rig) return { err: 'no playerRig' };

  // roll, so the pose is the MOVING one and not a parked idle
  const hold = window.__drive(th, 0, secs);
  await new Promise((s) => setTimeout(s, (secs - 1.2) * 1000));

  rig.updateWorldMatrix(true, true);
  const p = new T.Vector3(), q = new T.Quaternion(), s3 = new T.Vector3();
  rig.matrixWorld.decompose(p, q, s3);

  // WHICH WAY IS SHE GOING. Sample the rig's world position twice a frame
  // apart and compare the travel vector against the rig's own +z and +x.
  const p0 = p.clone();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  rig.updateWorldMatrix(true, true);
  const p1 = new T.Vector3().setFromMatrixPosition(rig.matrixWorld);
  const travel = p1.clone().sub(p0);
  const axZ = new T.Vector3(0, 0, 1).applyQuaternion(q);
  const axX = new T.Vector3(1, 0, 0).applyQuaternion(q);
  const moved = travel.length();
  const dotZ = moved > 1e-5 ? travel.clone().normalize().dot(axZ) : null;
  const dotX = moved > 1e-5 ? travel.clone().normalize().dot(axX) : null;

  // THE DECK, POSITIVELY. Walk the rig for meshes whose LOCAL geometry is the
  // deck plank: box params width ~0.245, depth ~0.94 (vespa.js:207). The grip
  // tape (0.235 x 0.92) sits 0.017 above it and is the real top surface.
  const decks = [];
  rig.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.parameters) return;
    const g = o.geometry.parameters;
    if (g.width == null || g.depth == null) return;
    decks.push({
      w: +g.width.toFixed(3), h: +g.height.toFixed(3), d: +g.depth.toFixed(3),
      name: o.name || '(unnamed)', obj: o,
    });
  });
  // MORE THAN ONE BOARD EXISTS. `bike` carries the vespa, the car AND the
  // skate rig, the ghost gets its own buildSkate(), and a dismount leaves a
  // board parked on the kerb — so "the mesh whose box matches the deck" can
  // match several, and the first one is not necessarily the one under her.
  // Take every match, report all of them with their world centre and their
  // parent chain, and pick the one NEAREST THE RIG. The first version of this
  // probe took .find() and reported a deck 1.95m ahead of her feet.
  const near = (d, w, dep) => Math.abs(d.w - w) < 0.01 && Math.abs(d.d - dep) < 0.02;
  const chain = (o) => { const n = []; let c = o; while (c && n.length < 6) { n.push(c.name || '·'); c = c.parent; } return n.join('<'); };
  const centre = (o) => { const b = new T.Box3().setFromObject(o); const c = b.getCenter(new T.Vector3()); return c; };
  const rank = (list) => list.map((d) => ({ d, c: centre(d.obj) }))
    .map((e) => ({ ...e, dist: e.c.distanceTo(p) }))
    .sort((a, b) => a.dist - b.dist);
  const planks = rank(decks.filter((d) => near(d, 0.245, 0.94)));
  const grips = rank(decks.filter((d) => near(d, 0.235, 0.92)));
  const plank = planks[0] && planks[0].d;
  const grip = grips[0] && grips[0].d;
  const candidates = {
    plank: planks.map((e) => ({ dist: +e.dist.toFixed(2), at: [+e.c.x.toFixed(2), +e.c.y.toFixed(2), +e.c.z.toFixed(2)], path: chain(e.d.obj) })),
    grip: grips.map((e) => ({ dist: +e.dist.toFixed(2), at: [+e.c.x.toFixed(2), +e.c.y.toFixed(2), +e.c.z.toFixed(2)], path: chain(e.d.obj) })),
  };
  const topOf = (d) => {
    if (!d) return null;
    const box = new T.Box3().setFromObject(d.obj);
    return { top: +box.max.y.toFixed(4), min: +box.min.y.toFixed(4),
      x: [+box.min.x.toFixed(3), +box.max.x.toFixed(3)],
      z: [+box.min.z.toFixed(3), +box.max.z.toFixed(3)] };
  };

  // THE FEET. Bone world positions, plus the world bbox of every mesh the
  // shoe material is on, so "the shoe" is a measured volume not a bone point.
  const av = null;
  const bones = {};
  rig.traverse((o) => { if (o.isBone && /Foot|LowerLeg|UpperLeg|Toe/.test(o.name)) bones[o.name] = o; });
  const bpos = {};
  for (const k of Object.keys(bones)) {
    const v = new T.Vector3();
    bones[k].getWorldPosition(v);
    bpos[k] = [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
  }
  // skinned mesh bounds cannot be read from geometry (the CPU never sees the
  // skinned vertices), so report the bone points and let the frame judge the
  // shoe. What IS decidable here: the ankle height above the deck top.
  window.__force = null;
  await hold.catch(() => {});
  return {
    kmh: +(window.__kmh()).toFixed(1),
    rigPos: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)],
    moved: +moved.toFixed(4), dotZ: dotZ == null ? null : +dotZ.toFixed(3),
    dotX: dotX == null ? null : +dotX.toFixed(3),
    boxes: decks.map((d) => ({ name: d.name, w: d.w, h: d.h, d: d.d })).slice(0, 14),
    plank: topOf(plank), grip: topOf(grip), candidates,
    vehicle: window.__state ? (window.__state().vehicle || null) : null,
    bones: bpos,
  };
}, { th: 0.55, secs: 5.0 });

console.log(JSON.stringify(out, null, 2));
await browser.close();
