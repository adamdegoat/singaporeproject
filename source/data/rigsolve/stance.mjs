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
// RAISED 15mm, 2026-08-27 evening. With the pelvis brought up to a standing
// height the legs run near full extension and both soles settled 10-20mm
// THROUGH the grip tape (data/stancecheck.mjs). The file's own loop applies:
// solve -> paste -> stancecheck -> adjust, and this is the adjust.
const DECK_L = 0.020, DECK_R = 0.029;
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

// ---- THE STANCE, as world targets in the board's frame ---------------------
// AND THE AXES, MEASURED, BECAUSE THE LINE THIS REPLACES HAD THEM BACKWARDS.
// It read "(+z nose, +x toe)". +z IS the nose (data/footcheck2.mjs dots the
// travel vector against the rig's own axes: dotZ = 1.000). But +x is the HEEL
// side, not the toe side: data/stancecheck.mjs says so in its own header and
// then RELIES on it -- its toes-over-the-rail test is `-toeX - rail`, which
// only means anything if the toes are at negative x. The foot targets below
// have always been at POSITIVE x with the shoes aimed across to negative,
// i.e. ankles on the heel rail and toes on the toe rail, which is what the
// note beside them says. So the numbers were right and the axis legend on top
// of them was wrong -- the exact failure mode the handover keeps recording.
// Regular footed: LEFT foot forward. `c` is the crouch, 0 cruising, 1 working.
// HOW LOW THE PELVIS RIDES, and it is arithmetic, not taste. This rig's leg
// is 0.79m from hip to ankle. With the feet 0.30m either side of centre and
// the hips at their REST height of 0.809 the leg has to span 0.807m — longer
// than it is — so the solver could only answer by straightening the knees to
// 148 deg and refusing to crouch at all (hips moved 0.000m at full crouch).
// A skater with a wide stance rides LOW; that is the same fact from the other
// end. So the pelvis starts 55mm down and drops another 95mm into the carve.
const STANCE = (c) => {
  // ================= REBUILT FROM PHOTOGRAPHS, 2026-08-27 =================
  //
  // Every version of this stance before now was built from PROSE — coaching
  // articles read and turned into numbers — because I believed I could not
  // look at a picture. I can: an image fetched to disk can be viewed like any
  // render. Months of this project have done exactly that with its own frames.
  // The whole afternoon of "stiff and contorted" came out of that one wrong
  // belief, and the owner had to say so four times.
  //
  // The two references, both photographs, in scratchpad/ref/:
  //
  //   CRUISING (a man rolling on a longboard, side-on)
  //     * legs very nearly STRAIGHT. Not a crouch. He is standing.
  //     * spine UPRIGHT — no forward lean at all
  //     * arms HANGING at his sides, elbows almost straight, hands by the
  //       thigh. The "dead arm" I kept designing away from is what cruising
  //       actually looks like.
  //     * feet close together and well INBOARD of the trucks
  //
  //   CARVING (a slalom rider between cones, from behind)
  //     * knees deeply bent, hips low, the whole body compressed
  //     * torso inclined and twisted into the turn
  //     * arms STRAIGHT OUT AND WIDE, near shoulder height, one leading one
  //       trailing — wings, not the bent guard I built
  //
  // So the pose is not one shape with a crouch dialled in. It is two shapes,
  // and `c` walks between them. That is also exactly what the owner said when
  // asked which he wanted: "both".
  const hipDrop = 0.035 + c * 0.235;
  // ARMS. Cruise: hanging, a hand's width off the thigh, elbow all but
  // straight. Carve: thrown out along the shoulder line, nearly horizontal.
  // `side` is along the shoulder axis (+ toward the leading side), `drop` is
  // below the shoulder, `fwd` is out in front of the chest — small at both
  // ends, because in neither photograph does a hand sit in front of the body.
  const dropC = ARM * (0.94 - c * 0.72);
  const sideC = ARM * (0.12 + c * 0.74);
  const fwdC  = ARM * (0.04 + c * 0.10);
  const SAX = nrm([0.55 + c * 0.55, -0.05 - c * 0.30, 1]);
  const CF  = [-SAX[2], 0, SAX[0]];
  const hand = (fwd, side, drop) => [CF[0] * fwd + SAX[0] * side, -drop,
                                     CF[2] * fwd + SAX[2] * side];
  return {
    pts: {
      // FEET CLOSER TOGETHER. 0.30/-0.33 put them 630mm apart on a 1.55m
      // figure, out over the trucks — and at that spread one leg has to lock
      // straight while the other folds, which is the lunge the owner kept
      // seeing. The photographs have both feet well inboard. 480mm apart.
      // 550mm apart, not 480. 480 read beautifully but put the back foot
      // 178mm from its own truck, and data/stancecheck.mjs budgets 140 —
      // a rider stands OVER the trucks or the board does not turn. The
      // photograph's feet are inboard because a cruiser deck is long; this
      // deck's trucks are 750mm apart, so 550 is as close in as the check
      // allows and still far tighter than the 630 that lunged.
      'LowerLeg.L_end': [ 0.030, DECK_L,  0.265],
      'LowerLeg.R_end': [ 0.055, DECK_R, -0.285],
      // ...AND THE HIPS END UP BETWEEN THEM. There is no knob that moves the
      // pelvis along the deck — `Body` translates in y only — so pinning it in
      // z just buys unreachable cost. Narrowing the feet is what centres it:
      // at 630mm apart the back leg had to reach 400mm behind the pelvis and
      // locked straight (the lunge); at 480mm both knees share the bend.
      'Hips':           [ null, HIPY - hipDrop, null ],
      // Upright over the board when cruising; inclines forward and out over
      // the toe rail only as she works.
      // THE CARVE FOLDS AT THE KNEES, NOT AT THE WAIST. First cut put the head
      // 150mm forward and 55mm lower at full carve on top of a 270mm hip drop,
      // and she came out bent double, face over the nose, diving off the front
      // (shots/ridecam/t6.carve-hard.*). In the slalom photograph the rider's
      // torso is inclined maybe 30 degrees off vertical, no more — the height
      // he loses is ALL knee. So the head barely travels: it stays near the
      // shoulders' own line and the legs do the compressing.
      // ...and 0.055 of forward travel still pitched the chest about 40 deg
      // off vertical at full lock where the slalom rider sits nearer 30.
      'Head': [-0.010 - c * 0.045, HEADY - hipDrop * 0.94 - c * 0.010,
               0.020 + c * 0.032],
    },
    hang: { L: hand(fwdC,        sideC,         dropC),
            // ...and the trailing hand rides HIGH. In the slalom photograph
            // both arms are up around shoulder height; ours came out 43mm
            // below its own target and angled at the tarmac, which is the
            // limb that kept reading as a lunging leg. 0.55 puts it level
            // with the leading one.
            // ...and the multiplier has to RIDE ON c, not sit flat. At a
            // flat 0.55 it also lifted the cruising hand off her thigh, where
            // the photograph plainly has it hanging — cruise cost went 0.02
            // -> 0.17 in one edit. Level with the leading hand at full carve,
            // identical to it at rest.
            R: hand(fwdC * 0.85, -sideC * 0.95, dropC * (1.0 - c * 0.62)) },
    shoulderAxis: [0.55 + c * 0.55, -0.05 - c * 0.30, 1],
    // KNEES: a ceiling, and at cruise it is nearly straight because the
    // photograph is nearly straight. 168 standing, 104 in the carve.
    knee: { L: D(168 - c * 64), R: D(166 - c * 62) },
    // ELBOWS STAY LONG AT BOTH ENDS. Hanging arms are straight; thrown-wide
    // arms are straight. The 118-degree floor I put under them was invented
    // to stop a fold that only existed because the hands were being asked to
    // sit in front of the chest, which no reference does.
    // ELBOWS: long at cruise, ALLOWED TO BEND in the carve. The 150-degree
    // floor held at both ends was wrong and it is what pointed the trailing
    // hand at the tarmac: the thrown-wide target sits about 0.87 of full reach
    // away, which a straight arm cannot land on — it needs roughly 140 — so
    // the solver obeyed the floor, kept the arm straight, and let the hand
    // fall where it fell. A floor that forbids the target is not a limit on
    // the pose, it is a bug in the constraint.
    elbow: { L: D(174 - c * 10), R: D(174 - c * 10) },
    elbowMin: { L: D(152 - c * 30), R: D(152 - c * 32) },
    headFwd: [-0.10, -0.06 - c * 0.16, 1.0],
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
    // ...AND THE FLOOR, added 2026-08-27. Without it the hand target is the
    // only thing the arm answers to, and a folded elbow reaches any point a
    // straight one can — so raising the hands to waist level bought itself an
    // 88-degree elbow instead of a shoulder that moved. Weighted the same as
    // the ceiling: this is one band, not a preference.
    if (S.elbowMin) e += Math.max(0, S.elbowMin[s] - el)**2 * 0.8;
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
  // THE FACE IS LOCAL +Z, NOT +Y — the same measurement bug the cost function
  // above records having made once already, still live in the REPORT: this
  // line printed the top of her skull and captioned it "head fwd", so every
  // solve since has been signed off against a number that described which way
  // she was standing up. Read the same axis the cost is graded on.
  console.log('    Head', f('Head'), ' want', (S.pts.Head||[]).map(x=>x.toFixed(3)).join(','));
  { const h=r.world('Hips'), hd=r.world('Head');
    const dx=hd.x-h.x, dy=hd.y-h.y, dz=hd.z-h.z;
    console.log('    spine tilt', (Math.atan2(Math.hypot(dx,dz), dy)*180/Math.PI).toFixed(1),
      'deg off vertical  (dx',dx.toFixed(3),'dz',dz.toFixed(3),')'); }
  const hq = r.worldQ('Head'); const fv = new r.THREE.Vector3(0,0,1).applyQuaternion(hq);
  console.log('    head fwd', fv.toArray().map(x=>x.toFixed(2)).join(','),
    ' want', nrm(S.headFwd).map(x=>x.toFixed(2)).join(','));
};

console.log('UNIT (m per bone unit)', UNIT.toFixed(2), ' ARM', ARM.toFixed(3));
const S0 = STANCE(0);
// THE PELVIS DROPS WITH THE FEET. Lowering the deck target 55mm and leaving
// the hips where they were straightened the knees to 142/149 deg -- a rider
// standing to attention on a moving board. It is the same coupling this file
// already documents from the other direction: feet and pelvis have to move
// together or the knees pay for it. Both figures below are the old ones plus
// the 55mm the feet came down.
const A = solve(buildRig, KNOBS, cost(S0), { passes: 110, step: 0.4, pre: pre(0.035) });
report('crouch 0', A, S0);
const S1 = STANCE(1);
const B = solve(buildRig, KNOBS.map((k,i)=>k.concat([A.v[i]])), cost(S1, A.v, 0.05), { passes: 110, step: 0.3, pre: pre(0.270) });
report('crouch 1', B, S1);
console.log('\nSTAND', JSON.stringify(A.v.map(x=>+x.toFixed(4))));
console.log('DELTA', JSON.stringify(B.v.map((x,i)=>+(x-A.v[i]).toFixed(4))));
console.log('KNOBS', JSON.stringify(KNOBS.map(k=>k.slice(0,4))));
