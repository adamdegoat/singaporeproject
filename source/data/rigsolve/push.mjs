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
const STAND=[-0.45,-0.7078,0.4016,0.6609,0.3719,0.0016,0.525,-0.5125,-0.1641,0.0422,1.0719,0.1281,-0.0453,0.0703,-0.325,0.0422,0.0531,-0.0703,-0.1266,-0.0594,0.1203,-0.3281];
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
const plant = run('PLANT', [0.030, DECK+0.023, 0.285], [-0.230, ROAD+0.036, -0.060], 0.255);
run('DRIVE', [0.030, DECK+0.023, 0.285], [-0.215, ROAD+0.036, -0.400], 0.230, plant);
