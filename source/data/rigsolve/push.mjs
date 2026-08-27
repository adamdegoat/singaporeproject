import { buildRig } from './rig.mjs';
import { solve } from './solve.mjs';
const r0 = buildRig(); r0.reset();
const P=(n)=>{const v=r0.world(n);return [v.x,v.y,v.z];};
const HIPY=P('Hips')[1];
const UNIT=(()=>{const r=buildRig();r.reset();const a=r.world('Hips').y;r.mov('Body',0,0.001,0);return (r.world('Hips').y-a)/0.001;})();
const ang=(a,b,c)=>{const u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],w=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
 const d=u[0]*w[0]+u[1]*w[1]+u[2]*w[2];return Math.acos(Math.max(-1,Math.min(1,d/(Math.hypot(...u)*Math.hypot(...w)))));};
// the SIX leg knobs and the hip drop, exactly the vector the push blends
const KNOBS=[
 ['UpperLeg.L',1,0,0,-2.0,2.0],['UpperLeg.L',0,0,1,-1.3,1.3],['LowerLeg.L',1,0,0,-0.2,2.4],
 ['UpperLeg.R',1,0,0,-2.2,2.2],['UpperLeg.R',0,0,1,-1.3,1.3],['LowerLeg.R',1,0,0,-0.2,2.4],
];
// the rest of the stance is held at its cruising value so the push is solved
// ON the pose it blends out of, not on a rest figure
// THE CRUISING POSE THE PUSH BLENDS OUT OF — and it has to be the SHIPPED one.
// This was a stale copy of the pre-2026-08-27 table, so the push was solved on
// a rider standing 55mm above her board and then blended onto one standing on
// it. Keep it in step with SKATE_STAND in src/avatar.js.
const STAND=[-0.4625,-0.332,0.2965,0.1355,0.5793,-0.0047,-0.0609,-0.6051,-0.1074,0.048,0.9719,0.0664,-0.1461,-0.0508,-0.1125,0.0934,0.0488,-0.2461,-0.1176,1.0047,-0.1059,-0.5789];
const SK=[['Body',0,1,0],['UpperLeg.L',1,0,0],['UpperLeg.L',0,0,1],['LowerLeg.L',1,0,0],['UpperLeg.R',1,0,0],['UpperLeg.R',0,0,1],['LowerLeg.R',1,0,0],['Torso',0,1,0],['Torso',1,0,0],['Torso',0,0,1],['Head',0,1,0],['Head',1,0,0],['UpperArm.L',1,0,0],['UpperArm.L',0,0,1],['UpperArm.L',0,1,0],['LowerArm.L',1,0,0],['LowerArm.L',0,0,1],['UpperArm.R',1,0,0],['UpperArm.R',0,0,1],['UpperArm.R',0,1,0],['LowerArm.R',1,0,0],['LowerArm.R',0,0,1]];
const NONLEG = SK.map((k,i)=>[k,STAND[i]]).filter(([k])=>!/Leg/.test(k[0]));

const run=(tag, tgtL, tgtR, drop, seed) => {
  const knobs = seed? KNOBS.map((k,i)=>k.concat([seed[i]])) : KNOBS;
  const res = solve(buildRig, knobs, (r)=>{
    let e=0;
    for (const [n,t] of [['LowerLeg.L_end',tgtL],['LowerLeg.R_end',tgtR]]) {
      const w=r.world(n); e += ((w.x-t[0])**2+(w.y-t[1])**2+(w.z-t[2])**2) * (n.includes('L_')?18:8);
    }
    for (const s of ['L','R']) {
      const kn=ang(r.world('UpperLeg.'+s).toArray(),r.world('LowerLeg.'+s).toArray(),r.world('LowerLeg.'+s+'_end').toArray());
      e += Math.max(0, kn - 2.85)**2 * 1.5;    // never lock straight
    }
    return e;
  }, { passes:120, step:0.45,
       pre: (r)=>{ for(const [k,v] of NONLEG) r.qrot(k[0],k[1],k[2],k[3],v); r.mov('Body',0,-drop/UNIT,0); } });
  const r=res.rig; res.apply();
  const f=(n)=>r.world(n).toArray().map(x=>x.toFixed(3)).join(',');
  console.log(`\n${tag} cost ${res.cost.toFixed(4)}  drop ${drop}`);
  console.log('   L', f('LowerLeg.L_end'), ' want', tgtL.join(','));
  console.log('   R', f('LowerLeg.R_end'), ' want', tgtR.join(','));
  console.log('   '+tag+' =', JSON.stringify(res.v.map(x=>+x.toFixed(4))));
  return res.v;
};
// FRONT FOOT PINNED TO ITS DECK MARK; BACK FOOT DOWN ON THE ROAD — both
// heights MEASURED (data/stancecheck.mjs) rather than assumed.
//
// The line this replaces read "the deck top is +0.037 and the ROAD is -0.160":
// 197mm apart. Measured against the grip-tape mesh and __surfaceAt in the
// board's own frame, the deck sits 135mm over the road, and the deck itself is
// at -0.018 here, not +0.037. So the old solve aimed the pushing shoe 62mm
// BELOW the road it was reaching for — unreachable by construction, which is
// exactly why the shipped comment had to apologise that the shoe "skims just
// behind the tail rather than planting". That was never a proportions limit.
// It was a wrong target, and it is worth saying plainly: an honest-sounding
// note about an engine limit hid a plain arithmetic error for a fortnight.
//
// Targets are LowerLeg_end (the ANKLE), so each is the surface plus that
// shoe's ankle rise: front 0.023 over the deck, back 0.036 over the road.
const DECK = -0.018, ROAD = DECK - 0.135;
// TWO CORRECTIONS, 2026-08-27 evening, both found by looking at the frame.
//
// 1. THE FRONT FOOT MOVED AND THIS DID NOT. The stance brought the feet in to
//    0.235/-0.245 (they were 0.300/-0.330 and reading as a lunge), and this
//    file went on pinning the standing foot at 0.285 — so a push dragged her
//    front foot 50mm forward of where she had just been standing.
// 2. THE CROUCH WAS TUNED AGAINST A CROUCHED STANCE. 0.255 was set when the
//    cruising pelvis sat 160mm down; it now sits 35mm down, so the same
//    number asked her to drop 220mm to push and folded the standing knee to
//    a right angle — shots/ridecam/vet.push.heel.jpg is a knee-lift, not a
//    push. 0.190 still lets the plant reach the road exactly (cost 0.0000);
//    the drive gives up about 30mm at full stretch, which is the honest
//    trade and is inside the check's 45mm float budget.
// THE PUSHING FOOT GOES DOWN ON THE HEEL SIDE. The owner's call, 2026-08-27,
// answering the open question the previous handover left him: "heel pushing
// foot." It was on the TOE side (x -0.230) and it is on the heel side (+x) now.
//
// WHAT THAT COSTS AND WHY THE CHEST HAD TO CHANGE WITH IT, because the two are
// one decision and splitting them is how this file gets a wrong number in it.
// In the board's frame +x is the heel rail and -x is the toe rail, which is
// the side her chest faces (measured: data/stancecheck.mjs, and the corrected
// axis note at the top of stance.mjs). So the heel side is the side her BACK
// faces while she is cruising. A leg reaching there is reaching BEHIND her,
// which a person does easily — but only if the chest stays roughly across the
// deck. Unwinding the chest 41 deg toward the nose first, as the shipped push
// did, turns the same reach into a cross-body one and folds her up. So
// PUSH_OPEN comes down with this (src/avatar.js) rather than being left to
// fight it: she stays surf-side-on and kicks back off her heel edge.
// AND THE HIPS DO NOT BOB UP MID-STROKE. The drive's pelvis drop was 0.230
// against the plant's 0.255 — she sank onto the planted foot and then ROSE
// 25mm while still driving it backwards, which is both wrong to watch and the
// reason the shoe could not reach: measured on the shipped figure, the drive
// left the sole floating 22mm over the road (data/stancecheck.mjs, push row).
// It is not a proportions limit, it is the same arithmetic mistake this file
// already records once. Held at the plant's own depth the solver lands it at
// cost 0.0002 — the shoe stays down through the whole sweep, which is what a
// push looks like. You rise as the foot RETURNS, and that is the blend's job.
const plant = run('PLANT', [0.030, DECK+0.038, 0.265], [ 0.235, ROAD+0.036, -0.075], 0.190);
run('DRIVE', [0.030, DECK+0.038, 0.265], [ 0.220, ROAD+0.036, -0.400], 0.190, plant);
