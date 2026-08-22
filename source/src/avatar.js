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
  root.scale.setScalar(1.72 / 4.841);
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
  // the rig is a Blender IK export: Foot.L/R are SIBLINGS of the leg
  // chain, parented to the root bone. Clips animate them directly; any
  // hand pose must move them too or the feet stay nailed to the floor
  // while the legs swing (the first swim vet's "bowing on all fours").
  const mov = (name, x, y = 0, z = 0) => {
    const bn = byName[name];
    if (bn) bn.position.set(bn.position.x + x, bn.position.y + y,
      bn.position.z + z);
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
      rot('LowerArm.L', -0.15 - pull * 0.7);
      rot('LowerArm.R', -0.15 - pull * 0.7);
      // legs stay LOW amplitude: the IK feet are root-parented, so big leg
      // swings would leave them behind; the kick is underwater anyway and
      // the breaststroke read lives in the arm sweep + head
      rot('UpperLeg.L', -draw * 0.3);
      rot('UpperLeg.R', -draw * 0.3);
      rot('LowerLeg.L', draw * 0.55);
      rot('LowerLeg.R', draw * 0.55);
      rot('Head', -1.0);
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
    skatePose(lean = 0, crouch = 0) {
      resetPose();
      // side-on stance comes from yawing the WHOLE figure: the rest-pose
      // feet then point across the deck, which is the read that matters
      // (vespa.js's old skater note: feet ACROSS the deck over the trucks).
      // Regular stance, left foot to the nose (+z of the board).
      root.rotation.y = -1.18;
      const c = 0.2 + crouch * 0.45;
      // the IK feet are Bone-parented; Bone space ~ character space
      // (0.01 units ~ 0.355m). Spread the stance along the board line —
      // after the yaw that is mostly the character's local x.
      mov('Foot.L', 0.0032, 0, 0.0008);         // front foot to the nose
      mov('Foot.R', -0.0026, 0, 0.0004);
      // knees bend and the torso drops + counter-rotates back to the nose
      rot('UpperLeg.L', -0.35 - c * 0.5, 0.25, 0);
      rot('LowerLeg.L', 0.6 + c * 0.7);
      rot('UpperLeg.R', -0.3 - c * 0.5, -0.25, 0);
      rot('LowerLeg.R', 0.55 + c * 0.7);
      mov('Body', 0, -c * 0.003, 0);            // hips ride down with the bend
      rot('Torso', 0.22 + c * 0.3, 0.75, 0);    // shoulders open to the nose
      rot('Head', -0.15, 0.4, 0);               // eyes down the road
      rot('UpperArm.L', -0.3, 0, 0.45 + lean);  // arms out, surf style
      rot('UpperArm.R', -0.28, 0, -0.5 + lean);
      rot('LowerArm.L', -0.3);
      rot('LowerArm.R', -0.25);
    },
  };
}
