import { buildRig } from './rig.mjs';
import { solve } from './solve.mjs';

const r0 = buildRig(); r0.reset();
const P = (n) => { const v = r0.world(n); return [v.x, v.y, v.z]; };
// THE PIVOT IS UpperArm, NOT Shoulder. Shoulder is the clavicle: measuring
// reach from it says the arm is 0.366m long when the part that actually
// swings is 0.30m, and a target set 0.300m "below the shoulder" then FORCES a
// 108-degree elbow — the solver was obeying an instruction that could only be
// obeyed with a folded arm. Anchor and length both measured here.
const shL = P('UpperArm.L'), shR = P('UpperArm.R');
// FULL REACH IS THE TWO SEGMENTS ADDED, not the rest-pose shoulder-to-wrist
// distance: this rig rests in an A-pose with the elbow already bent, so that
// measurement is 0.377 against a true reach of the sum below — and a "hang"
// set to 0.94 of the short number still needs a 132-degree elbow to reach.
const ARM = Math.hypot(...P('LowerArm.L').map((v,i)=>v-shL[i]))
          + Math.hypot(...P('Wrist.L').map((v,i)=>v-P('LowerArm.L')[i]));
// THE DECK, MEASURED IN THE GAME, PER FOOT. `DECKY` used to be the rest
// ankle height (0.019) for both feet, which is not the deck and is not even
// the same number for the two shoes: measured in-scene, the deck top sits at
// 0.037 in this frame, and the ankle rides 0.023 above the sole on the front
// foot and 0.036 on the back one, because snapFeet turns them to different
// angles (Foot.L +0.62 rad, Foot.R +1.15) and the shoe is longer than it is
// wide. Solving both to one number sank the front shoe 11mm into the board.
// CORRECTED 2026-08-27 AFTER MEASURING THE SHIPPED FIGURE ON THE ACTUAL
// BOARD. The numbers above are right arithmetic on a WRONG deck height. "The
// deck top sits at 0.037 in this frame" was never measured against the board
// mesh -- the avatar group is offset inside the skate rig (main.js:1239) and
// the offset was never taken off, so the whole stance solved ~55mm too high.
// data/stancecheck.mjs put a number on it against the grip-tape mesh itself:
// the front sole floated 55mm over the grip and the back sole 59mm, in every
// non-push state. She was riding above her board.
//
// THE CORRECTION IS EMPIRICAL AND DELIBERATELY SO. Deriving a new constant
// through the avatar's own frame is exactly how 0.037 got in: that frame has
// a pre-rotation and a scale on it and I could not verify it end to end. The
// solver's y and the board's y are both metres on the finished figure, so the
// honest move is to subtract the float that was MEASURED in the board frame
// and then re-measure. Loop: solve -> paste -> stancecheck -> adjust.
//   pass 1: DECK 0.060/0.073 -> float +55/+59mm
const DECK_L = 0.005, DECK_R = 0.014;
const HIPY  = P('Hips')[1];
const HEADY = P('Head')[1];
const nrm = (v) => { const L = Math.hypot(...v); return v.map(x=>x/L); };
const at = (s, dir, len) => { const d = nrm(dir); return [s[0]+d[0]*len, s[1]+d[1]*len, s[2]+d[2]*len]; };
const ang = (a,b,cc) => {
  const u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]], w=[cc[0]-b[0],cc[1]-b[1],cc[2]-b[2]];
  const d=u[0]*w[0]+u[1]*w[1]+u[2]*w[2];
  return Math.acos(Math.max(-1,Math.min(1,d/(Math.hypot(...u)*Math.hypot(...w)))));
};
const D = (x)=>x*Math.PI/180;

// ---- THE STANCE, as world targets in the board's frame (+z nose, +x toe) --
// Regular footed: LEFT foot forward. `c` is the crouch, 0 cruising, 1 working.
// HOW LOW THE PELVIS RIDES, and it is arithmetic, not taste. This rig's leg
// is 0.79m from hip to ankle. With the feet 0.30m either side of centre and
// the hips at their REST height of 0.809 the leg has to span 0.807m — longer
// than it is — so the solver could only answer by straightening the knees to
// 148 deg and refusing to crouch at all (hips moved 0.000m at full crouch).
// A skater with a wide stance rides LOW; that is the same fact from the other
// end. So the pelvis starts 55mm down and drops another 95mm into the carve.
const STANCE = (c) => {
  // MUST MATCH THE `pre(...)` DROPS AT THE FOOT OF THIS FILE. The pre imposes
  // the pelvis height and this target grades it; when the feet came down 55mm
  // the pre was updated and this was not, so the cost spent every pass pulling
  // the hips back UP against the pre that had just put them down (cost 0.007
  // -> 0.291, hips 55mm off target in the report). Two places, one number.
  // DEEPER 2026-08-27. A surfskate is ridden LOW — the whole point of the
  // front truck is that you pump it, and you pump from bent knees. At a 110mm
  // drop the knees solved to 121/135 deg, and 135 on the back leg reads as a
  // straight leg in a side frame: standing on a board rather than riding one.
  // 160mm brings both nearer 110 and puts her weight where a surfskater's is.
  const hipDrop = 0.160 + c * 0.095;
  // ---- THE ARMS HANG AT HER SIDES. ----------------------------------------
  // Checked against how it is actually taught, after the owner rejected the
  // first two attempts ("the arms still like forward and backward in such
  // fucking weird positions"): Sikana's skater stance and the beginner guides
  // all say the same thing — "your arms usually stay by your sides", hanging
  // naturally, extending only SLIGHTLY for balance, shoulders relaxed.
  //
  // Both previous solves reached the hands out to 0.285-0.300m from a 0.37m
  // shoulder — near full extension, one forward over the nose and one back
  // past the hip. That is a surf-dance pose, not a cruise, and it is exactly
  // what he kept seeing. The hands now hang about 0.30m BELOW the shoulder,
  // barely off the hip, and only open out into the carve.
  // as a FRACTION OF ARM LENGTH, so "hanging" means hanging on any figure:
  // 0.94 of full reach is a soft-elbowed hang (~160 deg), 0.80 is the bent,
  // slightly-open arm of a balancing carve (~125 deg).
  const outC  = ARM * (0.16 + c * 0.22);   // how far the hands swing off the body
  const dropC = ARM * (0.94 - c * 0.14);   // ...and lift a little as they do
  return {
    pts: {
      // over the trucks, which sit at z +/-0.375 on a 1.18m deck
      // ACROSS the deck as well as along it. The ankle sits toward the HEEL
      // rail so that the shoe — aimed 62/88 deg across by aimFoot() — reaches
      // the toe rail without hanging over it ("your toes should be placed
      // right on the edge of the board rather than hanging off",
      // surfskate.love). The back foot also goes further back: a surfskate's
      // back foot lives on the tail pocket, and -0.300 left it 121mm forward
      // of its own truck.
      'LowerLeg.L_end': [ 0.030, DECK_L,  0.300],
      'LowerLeg.R_end': [ 0.055, DECK_R, -0.330],
      'Hips':           [ null, HIPY - hipDrop, null ],
      // leading hand a touch forward of the hip, trailing hand a touch behind:
      // the small natural offset of a body turned across the deck, NOT a reach
      // (the wrists are NOT here: they hang off wherever the shoulder ends
      //  up, which is a relative offset — see `hang` below)
      // AND WHERE THE HEAD ENDS UP, not only where it points. Without this
      // the solver was free to buy head-direction with a 36-degree fold at
      // the waist, and did: the first vet frame was a woman bent double.
      'Head': [0.045, HEADY - hipDrop*0.85 - c*0.02, 0.075 + c*0.055],
    },
    // WHERE EACH HAND SITS RELATIVE TO ITS OWN SHOULDER, in world axes.
    // Absolute points fixed to the REST shoulder position were the second
    // mistake: once the chest turns, a hand pinned in space is no longer at
    // the side of the body it belongs to, and the arm folds to reach it
    // (elbow 114 deg on what is meant to be a hanging arm).
    hang: { L: [ outC, -dropC, ARM * (0.20 + c * 0.10)],
            R: [-outC, -dropC, -ARM * (0.14 + c * 0.10)] },
    // SHOULDERS IN LINE WITH THE FEET — the one thing every guide says and
    // the thing both earlier solves lost. Left foot forward, so the left
    // shoulder leads: the shoulder line runs along the deck and the chest
    // faces the toe side. With the arms no longer reaching for anything the
    // solver had no reason to turn the chest at all and left it square to the
    // nose, which is a scooter rider, not a skater.
    // OPENED 2026-08-27, and this is a correction to how the guide was READ.
    // "Shoulders in line with your feet" is right, and [0.30, 0, 1] obeyed it
    // almost exactly — 16.7 deg off the deck's long axis. But a shoulder line
    // along the deck puts the CHEST square across it, and a rider still has to
    // look where she is going: measured on the shipped build, chest -73.3 deg,
    // head +5.7, so the NECK was carrying 79 degrees. No neck turns 79 degrees,
    // and it is why the owner said he could not tell which way she was facing —
    // from behind the body reads sideways and the head reads forward, two
    // contradictory cues on one figure.
    //
    // A cruising skater does not hold the photo-pose 90 deg; the chest is
    // QUARTERED toward the direction of travel and the neck does the rest. So
    // the shoulder line opens to 35 deg off the deck, which puts the chest near
    // -55 and the neck around 60 — inside what a neck actually does — while
    // still reading as a stance across the board rather than a scooter rider's
    // square-on shoulders. The stance is unchanged from the waist down.
    shoulderAxis: [0.70, 0, 1],
    // knees: a CEILING, not a target — pinning the feet and the pelvis
    // already decides how far they fold. All that is left to say is "do not
    // lock straight", which is the thing the eye reads.
    knee: { L: D(150 - c*28), R: D(148 - c*28) },
    // a hanging arm is nearly straight; a balancing one is not. Ceilings, so
    // the solver may bend more but never lock out.
    elbow: { L: D(168 - c*38), R: D(168 - c*38) },
    // the head looks down the road however far the chest has turned away
    headFwd: [0.10, -0.10 - c*0.10, 1.0],
  };
};

const KNEE = { L: ['UpperLeg.L','LowerLeg.L','LowerLeg.L_end'],
               R: ['UpperLeg.R','LowerLeg.R','LowerLeg.R_end'] };
// METRES PER BONE UNIT for a Body translation, measured rather than derived
// from pre.s and K by hand.
const UNIT = (() => { const r = buildRig(); r.reset();
  const a = r.world('Hips').y; r.mov('Body', 0, 0.001, 0); return (r.world('Hips').y - a) / 0.001; })();

const KNOBS = [
  ['Body',       0,1,0, -1.2, 1.2],
  ['UpperLeg.L', 1,0,0, -1.8, 1.8], ['UpperLeg.L', 0,0,1, -1.3, 1.3],
  ['LowerLeg.L', 1,0,0, -0.2, 2.4],
  ['UpperLeg.R', 1,0,0, -1.8, 1.8], ['UpperLeg.R', 0,0,1, -1.3, 1.3],
  ['LowerLeg.R', 1,0,0, -0.2, 2.4],
  ['Torso',      0,1,0, -1.4, 1.4], ['Torso', 1,0,0, -0.9, 0.9], ['Torso', 0,0,1, -0.6, 0.6],
  ['Head',       0,1,0, -1.4, 1.4], ['Head', 1,0,0, -0.8, 0.8],
  ['UpperArm.L', 1,0,0, -2.2, 1.2], ['UpperArm.L', 0,0,1, -2.2, 1.4], ['UpperArm.L', 0,1,0, -1.2, 1.2],
  ['LowerArm.L', 1,0,0, -2.4, 0.6], ['LowerArm.L', 0,0,1, -2.4, 0.6],
  ['UpperArm.R', 1,0,0, -2.2, 1.2], ['UpperArm.R', 0,0,1, -1.4, 2.2], ['UpperArm.R', 0,1,0, -1.2, 1.2],
  ['LowerArm.R', 1,0,0, -2.4, 0.6], ['LowerArm.R', 0,0,1, -0.6, 2.4],
];

const cost = (S, seed, wReg) => (r, v) => {
  let e = 0;
  for (const n in S.pts) {
    const t = S.pts[n]; const w = r.world(n);
    if (t[0] !== null) e += (w.x-t[0])**2 * (n.startsWith('LowerLeg') ? 12 : 3);
    // THE FOOT HEIGHT IS NOT NEGOTIABLE. At weight 12 the crouch bought its
    // pelvis drop by pulling both feet 50mm THROUGH the deck; a shoe inside
    // the board is the single most visible thing on this figure.
    e += (w.y-t[1])**2 * (n === 'Hips' ? 90 : n.startsWith('LowerLeg') ? 60 : 3);
    if (t[2] !== null) e += (w.z-t[2])**2 * (n.startsWith('LowerLeg') ? 12 : 3);
  }
  for (const s of ['L','R']) {
    const sh = r.world('UpperArm.'+s), wr = r.world('Wrist.'+s);
    const h = S.hang[s];
    e += ((wr.x-sh.x-h[0])**2 + (wr.y-sh.y-h[1])**2 + (wr.z-sh.z-h[2])**2) * 6;
    const el = ang(r.world('UpperArm.'+s).toArray(), r.world('LowerArm.'+s).toArray(), r.world('Wrist.'+s).toArray());
    e += Math.max(0, el - S.elbow[s])**2 * 0.8;
    // THE KNEE IS NOT GIVEN AN ANGLE, IT IS GIVEN A FLOOR. Pinning the feet
    // AND the pelvis already determines how far the knee has to fold — an
    // independent angle target just fights them, and it won: the pelvis
    // stayed at its rest height through a full carve because dropping it
    // cost knee-target error. All that is left to say is "do not lock
    // straight", which is the thing the eye actually reads.
    const kn = ang(r.world(KNEE[s][0]).toArray(), r.world(KNEE[s][1]).toArray(), r.world(KNEE[s][2]).toArray());
    e += Math.max(0, kn - S.knee[s])**2 * 1.2;
  }
  {
    const a = r.world('Shoulder.L'), b = r.world('Shoulder.R');
    const v = [a.x-b.x, a.y-b.y, a.z-b.z]; const L = Math.hypot(...v);
    const w = nrm(S.shoulderAxis);
    e += ((v[0]/L-w[0])**2 + (v[1]/L-w[1])**2 + (v[2]/L-w[2])**2) * 2.2;
  }
  // the head looks down the road
  const hq = r.worldQ('Head');
  // THE FACE LOOKS ALONG THE HEAD'S LOCAL +Z. Bones run +Y, so the first
  // version aimed the TOP OF HER SKULL down the road and the vet frame came
  // back with her staring at the tarmac, folded double. Measured: local +Z
  // maps to world (-0.005,-0.072,0.997) at rest, +Y to (0.001,0.997,0.072).
  const f = new r.THREE.Vector3(0,0,1).applyQuaternion(hq);
  const want = nrm(S.headFwd);
  e += ((f.x-want[0])**2 + (f.y-want[1])**2 + (f.z-want[2])**2) * 0.9;
  // KEEP THE CROUCHED SOLVE NEAR THE STANDING ONE. The pose ships as a lerp
  // between the two, and two independent solves can land in different basins
  // (Torso twist +1.31 vs -0.23 on the first run) — the lerp then swings the
  // chest through the body on its way across. Regularised, not re-solved.
  if (seed) for (let i = 0; i < v.length; i++) e += (v[i]-seed[i])**2 * wReg;
  return e;
};
// THE PELVIS HEIGHT IS IMPOSED, NOT SOLVED. As a knob it never moved: this is
// a coordinate descent, and lowering the hips ON ITS OWN always scores worse
// (the feet come down with them) — the knees have to bend in the same step for
// it to pay, and one-at-a-time cannot see that. Three solves in a row reported
// the pelvis at its rest height through a full carve. Set it, then let the
// legs answer for it.
const pre = (drop) => (r) => { r.mov('Body', 0, -drop / UNIT, 0); };

const report = (tag, res, S) => {
  const r = res.rig; res.apply();
  const f = (n) => r.world(n).toArray().map(x=>x.toFixed(3)).join(',');
  console.log(`\n--- ${tag}  cost ${res.cost.toFixed(5)}`);
  for (const n of ['LowerLeg.L_end','LowerLeg.R_end','Hips'])
    console.log('   ', n.padEnd(16), f(n), ' want', (S.pts[n]||[]).map(x=>x===null?'-':x.toFixed(3)).join(','));
  for (const sd of ['L','R']) {
    const sh=r.world('UpperArm.'+sd), wr=r.world('Wrist.'+sd);
    console.log('    hang'+sd, [wr.x-sh.x,wr.y-sh.y,wr.z-sh.z].map(x=>x.toFixed(3)).join(','),
                ' want', S.hang[sd].map(x=>x.toFixed(3)).join(','));
  }
  { const a=r.world('Shoulder.L'), b=r.world('Shoulder.R');
    const v=[a.x-b.x,a.y-b.y,a.z-b.z], L=Math.hypot(...v);
    console.log('    shoulder axis', v.map(x=>(x/L).toFixed(2)).join(','), ' want', nrm(S.shoulderAxis).map(x=>x.toFixed(2)).join(',')); }
  for (const s of ['L','R'])
    console.log(`    elbow${s} ${(ang(r.world('UpperArm.'+s).toArray(), r.world('LowerArm.'+s).toArray(), r.world('Wrist.'+s).toArray())*180/Math.PI).toFixed(0)}deg  knee${s} ${(ang(r.world(KNEE[s][0]).toArray(), r.world(KNEE[s][1]).toArray(), r.world(KNEE[s][2]).toArray())*180/Math.PI).toFixed(0)}deg`);
  const hq = r.worldQ('Head'); const fv = new r.THREE.Vector3(0,1,0).applyQuaternion(hq);
  console.log('    head fwd', fv.toArray().map(x=>x.toFixed(2)).join(','));
};

console.log('UNIT (m per bone unit)', UNIT.toFixed(2), ' ARM', ARM.toFixed(3));
const S0 = STANCE(0);
// THE PELVIS DROPS WITH THE FEET. Lowering the deck target 55mm and leaving
// the hips where they were straightened the knees to 142/149 deg -- a rider
// standing to attention on a moving board. It is the same coupling this file
// already documents from the other direction: feet and pelvis have to move
// together or the knees pay for it. Both figures below are the old ones plus
// the 55mm the feet came down.
const A = solve(buildRig, KNOBS, cost(S0), { passes: 110, step: 0.4, pre: pre(0.160) });
report('crouch 0', A, S0);
const S1 = STANCE(1);
const B = solve(buildRig, KNOBS.map((k,i)=>k.concat([A.v[i]])), cost(S1, A.v, 0.05), { passes: 110, step: 0.3, pre: pre(0.255) });
report('crouch 1', B, S1);
console.log('\nSTAND', JSON.stringify(A.v.map(x=>+x.toFixed(4))));
console.log('DELTA', JSON.stringify(B.v.map((x,i)=>+(x-A.v[i]).toFixed(4))));
console.log('KNOBS', JSON.stringify(KNOBS.map(k=>k.slice(0,4))));
