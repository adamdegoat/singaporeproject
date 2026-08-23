// THE RIGGED AVATAR (owner mandate 2026-08-22: full revamp, "even
// avatars"). One skinned figure replaces the three hand-built models
// (walker / skater / rider) so the player is ONE person by construction —
// the same argument wardrobe.js won for colors, now won for the body.
//
// Determinism: clips are sampled by a phase the GAME advances (distance /
// state time), never wall clock. Everything is data from
// src/avatar_data.js (baked by research/qlifegen/glbavatar.py — the
// qtrees/qlife pattern, no runtime GLB loader, no async boot path).
//
// Colors come from src/wardrobe.js via per-vertex GROUP indices; there is
// still nowhere else to put a clothing color. Vertex colors are LINEAR
// (the stage-1 washed-pastel lesson).
import * as THREE from '../lib/three.module.js';
import { AVATAR } from './avatar_data.js';
import { WARDROBE } from './wardrobe.js';

const lin = (hex) => [((hex >> 16 & 255) / 255) ** 2.2,
                      ((hex >> 8 & 255) / 255) ** 2.2,
                      ((hex & 255) / 255) ** 2.2];

export function buildAvatar(hat) {
  // ---- bones: the armature subtree verbatim, so clips need no retarget
  const bones = AVATAR.bones.map((b) => {
    const bn = new THREE.Bone();
    bn.name = b.n;
    bn.position.fromArray(b.t);
    bn.quaternion.fromArray(b.r);
    return bn;
  });
  const roots = [];
  AVATAR.bones.forEach((b, i) => {
    if (b.p >= 0) bones[b.p].add(bones[i]);
    else roots.push(bones[i]);
  });
  const byName = {};
  bones.forEach((bn) => { byName[bn.name] = bn; });

  // ---- geometry: merged primitives, wardrobe-group vertex colors
  const M = AVATAR.mesh;
  const nv = M.p.length / 3;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(M.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(M.n, 3));
  const groupLin = AVATAR.groups.map((k) => lin(WARDROBE[k]));
  const cols = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    const c = groupLin[M.g[i]];
    cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2];
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(M.j, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(M.w, 4));
  g.setIndex(M.i);

  const mesh = new THREE.SkinnedMesh(g,
    new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.castShadow = true;
  // glTF skinning IGNORES the skinned mesh node's own transform: world =
  // sum(w * jointWorld * IBM) * vertex. So the Blender pre-transform
  // (-90degX, x100) goes on the bones' ANCESTOR group, the mesh stays at
  // identity, and the bind matrix is identity. Putting the pre-transform
  // on the mesh instead rendered a 180m giant (vet 2026-08-22).
  const arm = new THREE.Group();
  arm.quaternion.fromArray(AVATAR.pre.r);
  arm.scale.setScalar(AVATAR.pre.s);
  roots.forEach((r) => arm.add(r));

  const inverses = [];
  for (let j = 0; j < AVATAR.joints.length; j++) {
    inverses.push(new THREE.Matrix4().fromArray(
      AVATAR.ibm.slice(j * 16, j * 16 + 16)));
  }
  const root = new THREE.Group();
  // the pack character is authored 4.84 units tall (measured in
  // glbavatar.py's source GLB); the player is 1.72m like the old figures —
  // one uniform scale on the root, poses and clips untouched
  // 1.60 not 1.72: the old skater CROUCHES to ~1.45m head height and the
  // first trial read a full head too tall beside the 0.85m board (owner:
  // "too big", then still tall at 1.60) — 1.55 standing + the stance
  // crouch matches the old rider's presence.
  // WIDER than authored: the pack figure is lanky with a small head and
  // the owner read it as "weird alien" — 14% broader in x/z plus a
  // bigger head (below) puts him back at the old rider's chunky presence.
  const K = 1.55 / 4.841;
  root.scale.set(K * 1.14, K, K * 1.14);
  byName.Head.scale.setScalar(1.16);
  // and the twig ARMS fill out a touch: bones run +Y so x/z is thickness.
  // 1.18 with the palms counter-scaled — the scale rides down the chain
  // and unchecked it ballooned the hands into mitts; legs were tried at
  // 1.18 too and REVERTED (the skinned shorts balloon into capris).
  for (const s of ['L', 'R']) {
    byName['UpperArm.' + s].scale.set(1.18, 1, 1.18);
    byName['Palm.' + s].scale.set(1 / 1.18, 1, 1 / 1.18);
  }
  root.add(arm);
  root.add(mesh);

  // HEADGEAR keeps the wardrobe's one rule that may differ per figure:
  // cap on foot and on the board, helmet on the scooter (wardrobe.js).
  // Parented to the Head bone; the bone's accumulated scale is
  // 100 * (1.72/4.841) = 35.53, so headgear authored in metres divides it
  // back out.
  if (hat) {
    const hg = new THREE.Group();
    const inv = 1 / (100 * (1.72 / 4.841));
    hg.scale.setScalar(inv);
    const col = hat === 'helmet' ? WARDROBE.helmet : WARDROBE.cap;
    const hmat = new THREE.MeshStandardMaterial({ color: col,
      roughness: hat === 'helmet' ? 0.3 : 0.6 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(
      hat === 'helmet' ? 0.125 : 0.115, 14, 10, 0, Math.PI * 2, 0,
      Math.PI * 0.55), hmat);
    dome.castShadow = true;
    hg.add(dome);
    if (hat === 'cap') {
      const peak = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.09), hmat);
      peak.position.set(0, -0.01, 0.12);
      peak.castShadow = true;
      hg.add(peak);
    }
    byName.Head.add(hg);
    // hg position is in Head-BONE units (the full figure is 0.048 of
    // them): ~0.002 puts the dome on the crown. Tuned by vet.
    hg.position.set(0, 0.0029, 0.0002);
    hg.rotation.x = 0.1;
  }
  root.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(AVATAR.joints.map((j) => bones[j]), inverses),
    new THREE.Matrix4());

  // ---- deterministic clip sampler (no AnimationMixer: sampling is a
  // pure function of (clip, t), which is the property the goldens need)
  const rest = AVATAR.bones.map((b) => ({ t: b.t, r: b.r }));
  const resetPose = () => {
    bones.forEach((bn, i) => {
      bn.position.fromArray(rest[i].t);
      bn.quaternion.fromArray(rest[i].r);
    });
  };
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
  const sample = (name, t) => {
    const clip = AVATAR.clips[name];
    const tt = ((t % clip.dur) + clip.dur) % clip.dur;
    for (const tr of clip.tracks) {
      const times = tr.t;
      let k = 0;
      while (k < times.length - 1 && times[k + 1] < tt) k++;
      const k1 = Math.min(k + 1, times.length - 1);
      const span = times[k1] - times[k];
      const f = span > 0 ? (tt - times[k]) / span : 0;
      const bn = bones[tr.b];
      if (tr.p === 'rotation') {
        _qa.fromArray(tr.v, k * 4);
        _qb.fromArray(tr.v, k1 * 4);
        bn.quaternion.copy(_qa).slerp(_qb, f);
      } else if (tr.p === 'translation') {
        bn.position.set(
          tr.v[k * 3] + (tr.v[k1 * 3] - tr.v[k * 3]) * f,
          tr.v[k * 3 + 1] + (tr.v[k1 * 3 + 1] - tr.v[k * 3 + 1]) * f,
          tr.v[k * 3 + 2] + (tr.v[k1 * 3 + 2] - tr.v[k * 3 + 2]) * f);
      }
    }
  };

  const rot = (name, x, y = 0, z = 0) => {
    const bn = byName[name];
    if (bn) bn.rotation.set(bn.rotation.x + x, bn.rotation.y + y,
      bn.rotation.z + z);
  };
  // ADDING TO AN EULER ONLY WORKS FROM THE REST POSE, AND THAT IS A TRAP.
  //
  // `rot` above adds to bone.rotation, which three.js derives from the
  // quaternion in XYZ order. From the rest pose that is fine and it is what
  // swimPose and skatePose have always done. Applied ON TOP OF A SAMPLED
  // CLIP it silently does the wrong thing: the jump clip leaves UpperArm at
  // a quaternion whose XYZ decomposition is nothing like a single X angle,
  // so `rot('UpperArm.L', -1.3)` moved the arm barely at all while the same
  // call on LowerArm (near-zero y/z) worked — which is exactly what the vet
  // frame showed, forearms folding and the shoulders still overhead.
  //
  // Post-multiplying a quaternion turns the correction in the bone's OWN
  // frame after whatever the clip said, which is what "bend this joint
  // further" actually means, and it is correct from any starting pose.
  const _qd = new THREE.Quaternion(), _ax = new THREE.Vector3();
  const qrot = (name, ax, ay, az, angle) => {
    const bn = byName[name];
    if (!bn || !angle) return;
    bn.quaternion.multiply(_qd.setFromAxisAngle(_ax.set(ax, ay, az), angle));
  };
  // the rig is a Blender IK export: Foot.L/R are SIBLINGS of the leg
  // chain, parented to the root bone. Clips animate them directly; any
  // hand pose must move them too or the feet stay nailed to the floor
  // while the legs swing (the first swim vet's "bowing on all fours").
  const mov = (name, x, y = 0, z = 0) => {
    const bn = byName[name];
    if (bn) bn.position.set(bn.position.x + x, bn.position.y + y,
      bn.position.z + z);
  };

  // SNAP THE FEET TO THE SHINS. The rig has no runtime IK: rotating the
  // leg chains moves the shins but the root-parented Foot bones stay put,
  // so the shoes detach from the legs (the owner's "not stepping properly
  // on the board"). After any hand-posed legs, put each Foot bone exactly
  // at its shin's end. Bones extend along local +Y; shin length measured
  // from the rest pose at build time.
  const _w = new THREE.Vector3(), _w2 = new THREE.Vector3();
  const _q = new THREE.Quaternion();
  const shinLen = {};
  for (const s of ['L', 'R']) {
    byName['LowerLeg.' + s].getWorldPosition(_w);
    byName['Foot.' + s].getWorldPosition(_w2);
    shinLen[s] = _w.distanceTo(_w2);
  }
  const snapFeet = () => {
    root.updateMatrixWorld(true);
    for (const s of ['L', 'R']) {
      const low = byName['LowerLeg.' + s];
      const foot = byName['Foot.' + s];
      low.getWorldPosition(_w);
      low.getWorldQuaternion(_q);
      _w2.set(0, 1, 0).applyQuaternion(_q).multiplyScalar(shinLen[s]);
      _w.add(_w2);
      foot.parent.worldToLocal(_w);
      foot.position.copy(_w);
    }
  };

  return {
    group: root,
    bones: byName,
    sample,
    resetPose,
    // walking / running — the embedded clips, phase-driven like the old
    // figure (phase advances by speed*dt*2.4 in main.js; one walk cycle
    // was 2*PI of phase there, one clip is clip.dur seconds here)
    pose(phase, speed) {
      resetPose();
      if (speed <= 0.1) { sample('idle', phase * 0.35); return; }
      const run = speed > 2.6;
      const clip = run ? 'run' : 'walk';
      sample(clip, (phase / (Math.PI * 2)) * AVATAR.clips[clip].dur);
    },
    // breaststroke — no swim clip exists in the pack; the owner picked
    // breaststroke on the OLD figure (2026-08-14) and this ports that
    // exact cycle onto the bones: arms reach-sweep together, frog kick
    // half a cycle behind, head up, prone pitch handled by main.js on the
    // group as before.
    swimPose(phase) {
      resetPose();
      // prone pitch on the ROOT bone (parents the whole figure including
      // the IK feet); the old walker pitched its body group the same way
      rot('Bone', 1.45);
      const t = phase * 1.35;
      const s = Math.sin(t);
      const pull = Math.max(0, s);
      const draw = Math.max(0, Math.sin(t - Math.PI * 0.15));
      const reach = -2.35 + pull * 1.45;
      rot('UpperArm.L', reach, 0, 0.28 + pull * 0.5);
      rot('UpperArm.R', reach, 0, -0.28 - pull * 0.5);
      rot('LowerArm.L', 0.15 + pull * 0.7);
      rot('LowerArm.R', 0.15 + pull * 0.7);
      // legs stay LOW amplitude: the IK feet are root-parented, so big leg
      // swings would leave them behind; the kick is underwater anyway and
      // the breaststroke read lives in the arm sweep + head
      rot('UpperLeg.L', -draw * 0.3);
      rot('UpperLeg.R', -draw * 0.3);
      rot('LowerLeg.L', draw * 0.55);
      rot('LowerLeg.R', draw * 0.55);
      rot('Head', -1.0);
      snapFeet();
    },
    // JUMPING — the pack's jump clip, but the GAME owns the height.
    //
    // The clip carries no root translation (checked: zero translation tracks
    // on `Bone`), so it is a pure pose cycle and the physics in main.js is
    // free to decide how high and how long. That is the whole reason a
    // game-driven jump works here at all: an AnimationMixer playing the clip
    // at its own 1.04s would fight the arc every time the hop was shorter or
    // longer than the animator's.
    //
    // The clip's own phases, read off its Body:translation curve:
    //     0.00-0.21  crouch (anticipation)
    //     0.21-0.29  extend, feet leave the floor
    //     0.29-0.54  airborne, knees tucking up
    //     0.54-0.66  falling, legs reaching down
    //     0.66-0.71  contact
    //     0.71-0.83  settle
    // `u` is the airborne progress the physics reports: 0 at launch, ~0.5 at
    // apex, 1 at touchdown, then past 1 for the short settle. The crouch is
    // deliberately NOT played — a hop that waits 0.2s for the anticipation
    // before it leaves the ground feels like lag, and the owner asked for a
    // hop you can chain.
    jumpPose(u) {
      resetPose();
      const air = Math.max(0, Math.min(1, u));
      const settle = Math.min(0.5, Math.max(0, u - 1));
      // The settle stops SHORT of the clip's own recovery: past 0.75 the
      // clip swings the arms behind the back on its way to rest, and the
      // owner has already rejected one avatar pose for "arms folded
      // backwards". 0.20 keeps the landing inside the reach-down.
      sample('jump', 0.29 + air * 0.33 + settle * 0.20);
      // THE PACK'S JUMP IS A CHEER, AND A HOP IS NOT.
      //
      // Read off the clip's own curves: the arms throw overhead at 0.29 and
      // then HOLD at 121 degrees for the entire airborne stretch, only
      // dropping at 0.75 — an animator's big celebratory leap. Played
      // straight it gave the vet frame a stiff Y-pose floating across the
      // beach walk, arms up, legs dead straight, which is exactly the
      // "weird alien" register the owner rejected the avatar for in August.
      //
      // The legs are RIGHT (crouch, tuck at the apex, reach down to land),
      // so the clip keeps the legs and the arms get corrected on top of it:
      // they swing up on the launch as the clip says, then come down through
      // the flight to a low forward guard by touchdown. `rot` ADDS to
      // whatever sample() set — three.js keeps rotation and quaternion in
      // sync both ways — so this rides the clip rather than replacing it.
      //
      // THE SHOULDER'S SWING AXIS ON THIS RIG IS LOCAL Z, NOT X, and it is
      // MIRRORED: +Z lowers the left arm, -Z the right. Measured, not
      // guessed — an X rotation moved the hand 10cm and a Z rotation moved
      // it 54cm from the same pose (scratchpad axis probe). The X guess
      // shipped a frame with the forearms folding and the shoulders still
      // overhead, which is what sent me to measure.
      //
      // A constant trim at u=0 as well as a ramp: the clip's launch throws
      // the arms to 104 degrees on the first airborne frame, and taking 29
      // of those off keeps the energy of the throw without the cheer.
      const down = 0.50 + air * 0.95 + settle * 0.70;
      qrot('UpperArm.L', 0, 0, 1, down);
      qrot('UpperArm.R', 0, 0, 1, -down);
      // ...and a little elbow, because the clip's arms are poker-straight
      // and a straight arm on a low-poly figure reads as a mannequin
      const el = 0.30 * air + 0.25 * settle;
      qrot('LowerArm.L', 0, 0, 1, el);
      qrot('LowerArm.R', 0, 0, 1, -el);
      // the IK feet are root-parented siblings of the leg chain (see the
      // note on `mov`): the clip animates them directly, so they travel with
      // the tuck on their own and must NOT be snapped to the shins here.
    },
    // seated on the vespa — the sit clip held at its settled frame, knees
    // and arms then pulled to the bars/floorboard by main.js offsets
    sitPose() {
      resetPose();
      sample('sit', 2.0);
    },
    // surf-skate stance — side-on crouch, front foot forward. Hand-posed
    // on the bones (no clip); the lean/pump comes from main.js rotating
    // the group, exactly as the old skater worked.
    // THE SKATE STANCE, REBUILT 2026-08-23 on the owner's report: "the
    // avatar arms when skating why like backwards? the animation of skating
    // can be more natural like longboarder or surfskaters? also the body
    // positions all."
    //
    // He was right on every count, and measuring the old pose in the BOARD'S
    // OWN FRAME (+z nose, +x toe side) said why:
    //
    //     Foot.L  (-0.230, 0.147, -0.161)   Foot.R (0.181, 0.138, -0.147)
    //     Palm.L  ( 0.276, 0.772, -0.262)   Palm.R (-0.345, 0.727, 0.055)
    //
    // The feet were 0.41m apart ACROSS the deck and 0.01m apart ALONG it —
    // he was standing astride the board with his feet side by side, not
    // riding it. And the left hand sat 27cm BEHIND its own shoulder, which is
    // the "arms backwards".
    //
    // THE CAUSE was the trick the old pose was built on: yaw the whole root
    // by -1.18 so the figure faces across the deck. It does give a side-on
    // torso, and it takes the FEET across the deck with it, because the legs
    // hang off the same root. A real rider is the other way round — feet
    // square to the board, upper body twisted open. So the root now stays
    // facing the nose and the TORSO does the turning: `Body`/`Torso` local Y
    // is the twist axis (measured — rotating it moves the head almost not at
    // all, which is exactly what a twist looks like on a landmark that sits
    // on the axis).
    //
    // AXES ARE MEASURED, NEVER NAMED. On this rig, from the rest pose:
    //     shoulder swing  = local Z, MIRRORED (L -Z forward, R +Z forward)
    //     shoulder raise  = local X, mirrored
    //     elbow flex      = local Z, mirrored (X only splays it sideways)
    //     hip swing       = local X, NOT mirrored (+X sends the knee back)
    //     hip spread      = local Z, NOT mirrored (+Z moves the knee to -x)
    //     torso twist     = local Y;  pitch = X;  side bend = Z
    // The old pose wrote the arms as X-and-Z Euler adds and got a scarecrow.
    skatePose(lean = 0, crouch = 0, kick = 0, reach = 0) {
      resetPose();
      // FEET SQUARE TO THE BOARD. The old -1.18 root yaw is gone; anything
      // that reads this rig gets a figure facing the nose.
      root.rotation.y = 0;
      const c = Math.max(0, Math.min(1, crouch));

      // ---- legs: SOLVED, not chosen ----
      //
      // The two feet have to sit on the SAME deck while the knees stay bent,
      // and the only shared control over that is how far the hips sit down —
      // which is why picking hip angles by hand cannot work and did not
      // (first attempt: back foot 0.54m out to the side and 0.38m in the
      // air). These six angles and the hip drop come from a coordinate
      // descent (scratchpad stancesolve.mjs) against foot targets 0.035m
      // either side of the deck centreline and 0.50m apart along it, run
      // twice: once standing and once at full crouch. Interpolating between
      // two solved poses is what keeps the shoes ON the board through the
      // whole crouch range instead of only at one end of it.
      //
      //   standing  hipX -0.820 / +0.126   hipZ +0.194 / -0.222   knee 0.61 / 0.40
      //   crouched  hipX -1.189 / -0.040   hipZ +0.291 / -0.288   knee 1.08 / 0.77
      //
      // Re-solve rather than nudge if the stance targets ever change.
      const lx = -0.820 + c * -0.369, lz = 0.194 + c * 0.097, lk = 0.613 + c * 0.468;
      const rx = 0.126 + c * -0.166, rz = -0.222 + c * -0.066, rk = 0.402 + c * 0.372;
      qrot('UpperLeg.L', 1, 0, 0, lx);
      qrot('UpperLeg.L', 0, 0, 1, lz);
      qrot('LowerLeg.L', 1, 0, 0, lk);
      qrot('UpperLeg.R', 1, 0, 0, rx);
      qrot('UpperLeg.R', 0, 0, 1, rz);
      qrot('LowerLeg.R', 1, 0, 0, rk);
      mov('Body', 0, -(0.00281 + c * 0.00279), 0);   // the solved hip drop

      // ---- upper body: chest opens, HIPS DO NOT ----
      //
      // The twist goes on `Torso` and nothing goes on `Body`, and that is a
      // hierarchy fact, not a style choice: UpperLeg.L/R are CHILDREN OF
      // BODY, so a Body rotation swings the solved legs with it and the feet
      // leave the deck (measured: a 0.62 Body twist moved the back foot
      // 0.25m off its mark). Torso hangs off Abdomen and carries the chest,
      // arms and head only — which is also what a rider actually does: the
      // hips stay square to the board and the shoulders open.
      qrot('Torso', 0, 1, 0, 0.92);             // chest opens toward the toe side
      qrot('Torso', 1, 0, 0, 0.16 + c * 0.22);  // and folds down into the ride
      qrot('Torso', 0, 0, 1, lean * 0.55);      // carve leans the chest in
      // eyes down the road: the twist turned his chest across the deck, so
      // the head has to come BACK toward the nose by most of it
      qrot('Head', 0, 1, 0, -0.80);
      qrot('Head', 1, 0, 0, -0.12 - c * 0.08);

      // ---- arms: SOLVED to a surf carry, not hand-picked ----
      //
      // The first rebuild fixed "backwards" — both hands ended up ahead of
      // their shoulders — and still looked wrong in the render: they hung
      // together near the centreline at hip height and read as CLASPED
      // HANDS. Numbers being right is necessary and not sufficient; the
      // frame is the check.
      //
      // So the arms are solved the same way the legs were, against the carry
      // a longboarder actually rides with: leading arm out over the nose at
      // chest height, trailing arm out behind at hip height. Solved twice,
      // standing and crouched, with the crouched target dropped by the
      // 0.107m the shoulders themselves drop — hold the target still and the
      // solver reaches for it with a wrenched shoulder (-2.27 rad) instead.
      //
      // AND THE ELBOW ANGLE IS PART OF THE OBJECTIVE, not a by-product.
      // Solving for the hand alone let the trailing arm stay LOCKED STRAIGHT
      // — measured 172 degrees — and still hit its target: a plank that ends
      // in the right place. The eye reads the bend, so the solve carries a
      // penalty on missing it (128 deg leading, 148 deg trailing; a walk
      // swings through 124-136, idle sits at 161-169).
      //
      //   standing  L shX -1.275 shZ -0.708 elZ -0.562 | R -0.696 -0.140 -0.604
      //   crouched  L shX -1.694 shZ -0.698 elZ -0.570 | R -0.607  0.011 -0.612
      //
      // `lean` then swings both arms as a counterweight, which is the thing a
      // carve actually looks like from the chase camera.
      const alx = -1.275 + c * -0.419, alz = -0.708 + c * 0.010, ale = -0.562 + c * -0.008;
      const arx = -0.696 + c * 0.089, arz = -0.140 + c * 0.151, are = -0.604 + c * -0.008;
      qrot('UpperArm.L', 1, 0, 0, alx);
      qrot('UpperArm.L', 0, 0, 1, alz - lean * 0.30);
      qrot('LowerArm.L', 0, 0, 1, ale);
      qrot('UpperArm.R', 1, 0, 0, arx);
      qrot('UpperArm.R', 0, 0, 1, arz - lean * 0.30);
      qrot('LowerArm.R', 0, 0, 1, are);

      // ---- the push, SOLVED onto the road (ride.js: "a push runs out") ----
      //
      // Measured, the old push sent the back foot BEHIND correctly and then
      // UP: 0.287m above the deck at full drive. That is a backwards
      // air-kick, not a push. A push puts the shoe DOWN — the rig rides
      // 0.16m over the deck top, so the road is y = -0.16 here.
      //
      // Solved as a WHOLE BODY, because the back foot cannot reach the road
      // from the cruise hip height (it fell 15cm short) and that shortfall is
      // exactly why a real push drops deep on the standing leg. Front foot
      // pinned to its deck mark, back foot to the road, hip drop and both
      // knees free:
      //
      //   PLANT  L[-1.231, 0.308, 1.129]  R[-0.054, -0.508, 0.246]  drop .00596
      //   DRIVE  L[-1.044, 0.243, 0.910]  R[ 0.410, -0.445, 0.024]  drop .00443
      //
      // HONEST LIMIT: at full drive the shoe trails at DECK level, not on the
      // road (solved error 0.19m). This figure is 1.55m with short legs and
      // cannot reach 0.38m back AND 0.15m down without dragging the front
      // foot off the board. It reads as a foot skimming just behind the tail,
      // which is the best the proportions allow; a longer reach needs the
      // stance shortened, and the stance is what the owner actually sees.
      if (kick !== 0 || reach > 0) {
        // RECOVER THE STROKE PHASE. main.js hands over two derived numbers —
        // reach = 0.5 - 0.5cos(2*pi*p) and kick = sin(2*pi*p) — and blending
        // on them directly gets the timing wrong: the foot is most extended
        // when it is only half off the deck. Both come from one phase, and
        // cos/sin of it are recoverable exactly, so recover it and drive a
        // real cycle: down to the PLANT, sweep back to the DRIVE, return.
        const ph = Math.atan2(kick, 1 - 2 * reach) / (Math.PI * 2);
        const p01 = ph - Math.floor(ph);
        const t = Math.sin(Math.PI * p01);        // 0 on the deck, 1 committed
        // the stance angles this pose already applied, to blend away from
        const cur = [lx, lz, lk, rx, rz, rk, 0.00281 + c * 0.00279];
        const PLANT = [-1.231, 0.308, 1.129, -0.054, -0.508, 0.246, 0.00596];
        const DRIVE = [-1.044, 0.243, 0.910, 0.410, -0.445, 0.024, 0.00443];
        // first half of the commitment lifts the shoe off the deck and puts
        // it DOWN beside the board; the second half sweeps it back
        const d = cur.map((cv, i) => (t < 0.5
          ? (PLANT[i] - cv) * (t * 2)
          : (PLANT[i] - cv) + (DRIVE[i] - PLANT[i]) * ((t - 0.5) * 2)));
        qrot('UpperLeg.L', 1, 0, 0, d[0]);
        qrot('UpperLeg.L', 0, 0, 1, d[1]);
        qrot('LowerLeg.L', 1, 0, 0, d[2]);
        qrot('UpperLeg.R', 1, 0, 0, d[3]);
        qrot('UpperLeg.R', 0, 0, 1, d[4]);
        qrot('LowerLeg.R', 1, 0, 0, d[5]);
        mov('Body', 0, -d[6], 0);
        qrot('Torso', 1, 0, 0, t * 0.14);         // body dips over the plant
      }

      // the IK feet are root-parented siblings of the leg chain, so they
      // must be bolted to the shin ends AFTER the legs move (see snapFeet)
      snapFeet();
      // ...and only THEN can they be turned across the deck, which is how a
      // rider's shoes actually sit: the front foot angled toward the nose,
      // the back foot much closer to square across the tail.
      byName['Foot.L'].rotation.y += 0.62;
      byName['Foot.R'].rotation.y += 1.15;
    },
  };
}
