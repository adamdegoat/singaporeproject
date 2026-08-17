// The player on foot: a walking figure and a small walk model.
// Kept separate from the ride model so both stay simple.
import * as THREE from '../lib/three.module.js';
import { wardrobeMats } from './wardrobe.js';

export const WALK = {
  speed: 1.85,
  runSpeed: 4.1,
  accel: 9.0,
  turnRate: 9.0,
};

export function newWalker(x = 0, z = 0, heading = 0) {
  // seat: the footbridge way this walker is ON, if any, and the direction
  // they are travelling — surfaceAt reads and writes it (directional
  // seating). Cleared with walker.y wherever the walker is placed rather
  // than walked.
  return { x, z, heading, speed: 0, phase: 0, seat: { id: null, hx: 0, hz: 0 } };
}

// move is a vector in world space (already rotated by the camera yaw)
export function stepWalk(w, dt, moveX, moveZ, running) {
  const mag = Math.min(1, Math.hypot(moveX, moveZ));
  const target = mag * (running ? WALK.runSpeed : WALK.speed);
  w.speed += (target - w.speed) * Math.min(1, WALK.accel * dt);
  if (mag > 0.05) {
    const want = Math.atan2(moveX, moveZ);
    let d = want - w.heading;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    w.heading += d * Math.min(1, WALK.turnRate * dt);
  }
  w.phase += w.speed * dt * 2.4;
  w.x += Math.sin(w.heading) * w.speed * dt;
  w.z += Math.cos(w.heading) * w.speed * dt;
  return w;
}

export function buildWalker() {
  // A figure reads as a person when its limbs HINGE. The previous one rotated a
  // whole capsule about its own centre, so an arm swung like a propeller from
  // the middle of the upper arm and a leg had no knee at all — which is exactly
  // what makes a figure look like a stick. Everything here pivots at the joint:
  // shoulder, elbow, hip, knee and ankle are nested groups, and the limb hangs
  // downward from each one.
  //
  // This is the player, so there is one of it and detail is affordable. The
  // crowd is 460 instanced figures and deliberately stays simple.
  const g = new THREE.Group();
  // ONE WARDROBE — see src/wardrobe.js. This figure used to wear a terracotta
  // shirt and near-black shoes while the skater wore teal and white, so the
  // player changed clothes every time they stepped off the board.
  const W = wardrobeMats(THREE);
  const shirt = W.shirt, jeans = W.legs, skin = W.skin, hair = W.hair, shoe = W.shoe;

  // a limb segment hanging from a pivot: the group sits at the joint, the mesh
  // is offset half its length below, so rotating the group swings it correctly
  const segment = (parent, len, rTop, rBot, mat, y0) => {
    const pivot = new THREE.Group();
    pivot.position.y = y0;
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, len, 12, 1, false), mat);
    m.position.y = -len / 2;
    m.castShadow = true;
    pivot.add(m);
    parent.add(pivot);
    return pivot;
  };
  const blob = (parent, r, mat, x, y, z, squashY = 1) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat);
    m.position.set(x, y, z);
    m.scale.y = squashY;
    m.castShadow = true;
    parent.add(m);
    return m;
  };

  /* ---- body ---- */
  const body = new THREE.Group();
  g.add(body);

  // torso tapers: wider at the chest than the waist, which the single capsule
  // could not do and which is most of the silhouette
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.125, 0.40, 16), shirt);
  chest.position.y = 1.26; chest.castShadow = true; body.add(chest);
  blob(body, 0.155, shirt, 0, 1.45, 0, 0.62);            // shoulder mass
  blob(body, 0.128, jeans, 0, 1.01, 0, 0.78);            // hips
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.115, 0.16, 14), jeans);
  pelvis.position.y = 1.0; pelvis.castShadow = true; body.add(pelvis);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.06, 0.11, 10), skin);
  neck.position.y = 1.50; neck.castShadow = true; body.add(neck);

  /* ---- head ---- */
  const headPivot = new THREE.Group();
  headPivot.position.y = 1.56;
  body.add(headPivot);
  const head = blob(headPivot, 0.108, skin, 0, 0.07, 0, 1.06);
  // hair with a shape rather than a bare hemisphere: a cap plus a back mass
  blob(headPivot, 0.113, hair, 0, 0.085, -0.006, 0.92);
  blob(headPivot, 0.082, hair, 0, 0.055, -0.055, 0.8);
  blob(headPivot, 0.03, skin, -0.104, 0.06, 0, 1.1);     // ears
  blob(headPivot, 0.03, skin, 0.104, 0.06, 0, 1.1);
  // EYES, because the head was a bare skin sphere and that is a mannequin the
  // moment anything gets close. Two 1.6cm marks set into the front of the
  // face, squashed to a lid shape rather than left as balls. The SAME pair the
  // skater wears — one wardrobe, one person (src/wardrobe.js).
  for (const sx of [-0.042, 0.042]) blob(headPivot, 0.016, W.eye, sx, 0.042, 0.100, 0.72);
  // THE CAP COMES OFF THE BOARD WITH YOU. The skater wore one and the walker
  // did not, which is half of why the two read as different people. Radius
  // clears the hair mass (0.113) so it sits ON the head rather than inside it;
  // the hemisphere puts the brim line where a hairline is.
  const capM = new THREE.Mesh(
    new THREE.SphereGeometry(0.119, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), W.cap);
  capM.position.set(0, 0.082, -0.004);
  capM.rotation.x = -0.14;
  capM.castShadow = true;
  headPivot.add(capM);
  const peak = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.019, 0.088), W.cap);
  peak.position.set(0, 0.064, 0.108);
  peak.rotation.x = -0.18;
  peak.castShadow = true;
  headPivot.add(peak);

  /* ---- arms: shoulder then elbow ---- */
  const arm = (side) => {
    const sh = segment(body, 0.26, 0.052, 0.045, shirt, 1.42);
    sh.position.x = side * 0.185;
    blob(sh, 0.058, shirt, 0, 0, 0);                     // deltoid
    const el = segment(sh, 0.25, 0.044, 0.038, skin, -0.26);
    blob(el, 0.045, skin, 0, -0.25, 0);                  // hand
    return { sh, el };
  };
  const armL = arm(-1), armR = arm(1);

  /* ---- legs: hip, knee, then a foot ---- */
  const leg = (side) => {
    const hip = segment(body, 0.45, 0.072, 0.058, jeans, 0.98);
    hip.position.x = side * 0.085;
    const kn = segment(hip, 0.44, 0.056, 0.045, jeans, -0.45);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.07, 0.25), shoe);
    foot.position.set(0, -0.47, 0.05);
    foot.castShadow = true;
    kn.add(foot);
    return { hip, kn, foot };
  };
  const legL = leg(-1), legR = leg(1);

  return {
    group: g,
    pose(phase, speed) {
      const moving = speed > 0.1;
      const t = phase * 2.4;
      const sw = moving ? Math.sin(t) : 0;

      // shoulders swing, elbows trail and always bend the same way.
      // The z sweeps, head pitch and surge belong to the swim pose — reset
      // here or the walker leaves the water with arms stuck out sideways.
      armL.sh.rotation.z = 0; armR.sh.rotation.z = 0;
      headPivot.rotation.x = 0;
      body.position.z = 0;
      legL.foot.rotation.z = 0; legR.foot.rotation.z = 0;
      armL.sh.rotation.x = sw * 0.62;
      armR.sh.rotation.x = -sw * 0.62;
      armL.el.rotation.x = -0.25 - Math.max(0, sw) * 0.55;
      armR.el.rotation.x = -0.25 - Math.max(0, -sw) * 0.55;

      // hips swing; the knee bends on the back half of the stride, which is
      // what actually sells a walk
      legL.hip.rotation.x = -sw * 0.72;
      legR.hip.rotation.x = sw * 0.72;
      legL.kn.rotation.x = Math.max(0, sw) * 0.95;
      legR.kn.rotation.x = Math.max(0, -sw) * 0.95;
      // toes stay flat to the ground instead of pointing wherever the shin goes
      legL.foot.rotation.x = -legL.hip.rotation.x - legL.kn.rotation.x;
      legR.foot.rotation.x = -legR.hip.rotation.x - legR.kn.rotation.x;

      // the whole body rises and falls, and leans a little into the walk
      const bob = moving ? Math.abs(Math.cos(t)) * 0.028 : 0;
      body.position.y = bob;
      body.rotation.z = moving ? Math.sin(t) * 0.022 : 0;
      body.rotation.x = moving ? 0.045 : 0;
      headPivot.rotation.y = moving ? Math.sin(t * 0.5) * 0.06 : 0;
      void head;
    },
    // BREASTSTROKE (the owner's pick, 2026-08-14 — over freestyle, because
    // it reads clean on a low-poly figure). The body lies prone at the
    // surface; both arms work TOGETHER — reach forward, sweep out and back,
    // recover — and the legs frog-kick half a cycle behind the arms, which
    // is the timing that makes it read as breaststroke rather than flailing.
    // The whole figure is pitched prone around the HIPS (the group origin is
    // at the feet), so the head ends up forward and just clear of the water.
    swimPose(phase, speed) {
      const t = phase * 1.35;                    // strokes, slower than steps
      const s = Math.sin(t);                     // arm cycle
      const pull = Math.max(0, s);               // the power half
      const k = Math.max(0, Math.sin(t - Math.PI * 0.55));   // kick trails
      // prone: rotate the body group nearly flat, nose down a touch
      body.rotation.x = 1.38;
      body.rotation.z = 0;
      body.position.y = 0;
      // arms: extended ahead at recovery (shoulder swung far forward), then
      // sweeping down/back together during the pull; elbows soften mid-pull
      const reach = -2.55 + pull * 1.55;
      armL.sh.rotation.x = reach;
      armR.sh.rotation.x = reach;
      armL.sh.rotation.z = 0.28 + pull * 0.55;   // sweep outward
      armR.sh.rotation.z = -0.28 - pull * 0.55;
      armL.el.rotation.x = -0.15 - pull * 0.75;
      armR.el.rotation.x = -0.15 - pull * 0.75;
      // legs: draw up (hip + knee flex), then snap straight for the kick
      const draw = Math.max(0, Math.sin(t - Math.PI * 0.15));
      legL.hip.rotation.x = -0.15 - draw * 0.62;
      legR.hip.rotation.x = -0.15 - draw * 0.62;
      legL.kn.rotation.x = draw * 1.35 - k * 0.2;
      legR.kn.rotation.x = draw * 1.35 - k * 0.2;
      legL.foot.rotation.x = 0.5;                // toes trail in the water
      legR.foot.rotation.x = 0.5;
      // head up out of the water, breathing forward; a light surge with the
      // pull so the figure visibly travels on the stroke
      headPivot.rotation.x = -1.05;
      headPivot.rotation.y = 0;
      body.position.z = pull * 0.06 * Math.min(1, speed);
      void head;
    },
  };
}
