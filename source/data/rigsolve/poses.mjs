import { buildRig } from './rig.mjs';
import { solve } from './solve.mjs';
const r0 = buildRig(); r0.reset();
const P=(n)=>{const v=r0.world(n);return [v.x,v.y,v.z];};
const HIPY=P('Hips')[1], DECKY=P('LowerLeg.L_end')[1];
const shL=P('UpperArm.L'), shR=P('UpperArm.R');
// full reach = the two segments added; the rest pose already has a bent elbow
const ARM = Math.hypot(...P('LowerArm.L').map((v,i)=>v-shL[i]))
          + Math.hypot(...P('Wrist.L').map((v,i)=>v-P('LowerArm.L')[i]));
const UNIT=(()=>{const r=buildRig();r.reset();const a=r.world('Hips').y;r.mov('Body',0,0.001,0);return (r.world('Hips').y-a)/0.001;})();
const ang=(a,b,c)=>{const u=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],w=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
 const d=u[0]*w[0]+u[1]*w[1]+u[2]*w[2];return Math.acos(Math.max(-1,Math.min(1,d/(Math.hypot(...u)*Math.hypot(...w)))));};
const D=(x)=>x*Math.PI/180;
const nrm=(v)=>{const L=Math.hypot(...v);return v.map(x=>x/L);};
const KNEE={L:['UpperLeg.L','LowerLeg.L','LowerLeg.L_end'],R:['UpperLeg.R','LowerLeg.R','LowerLeg.R_end']};
const KNOBS = [
  ['Body',0,1,0,-0.8,0.8],
  ['UpperLeg.L',1,0,0,-2.2,2.2],['UpperLeg.L',0,0,1,-1.0,1.0],['LowerLeg.L',1,0,0,-0.2,2.6],
  ['UpperLeg.R',1,0,0,-2.2,2.2],['UpperLeg.R',0,0,1,-1.0,1.0],['LowerLeg.R',1,0,0,-0.2,2.6],
  ['Torso',0,1,0,-0.8,0.8],['Torso',1,0,0,-1.0,1.0],['Torso',0,0,1,-0.5,0.5],
  ['Head',0,1,0,-0.8,0.8],['Head',1,0,0,-0.8,0.8],
  ['UpperArm.L',1,0,0,-2.4,1.4],['UpperArm.L',0,0,1,-2.4,1.6],['UpperArm.L',0,1,0,-1.2,1.2],
  ['LowerArm.L',1,0,0,-2.4,0.6],['LowerArm.L',0,0,1,-2.4,0.6],
  ['UpperArm.R',1,0,0,-2.4,1.4],['UpperArm.R',0,0,1,-1.6,2.4],['UpperArm.R',0,1,0,-1.2,1.2],
  ['LowerArm.R',1,0,0,-2.4,0.6],['LowerArm.R',0,0,1,-0.6,2.4],
];
// pts: absolute world targets (feet, hips). hang: wrist offset FROM ITS OWN
// SHOULDER — the fix that stopped the skate arms folding to reach a point
// pinned to a shoulder that had since turned away.
const mk = (S, seed, wReg) => (r,v) => {
  let e=0;
  for (const n in S.pts) { const t=S.pts[n], w=r.world(n);
    const wt = n.startsWith('LowerLeg')?10:3;
    if(t[0]!==null) e+=(w.x-t[0])**2*wt; e+=(w.y-t[1])**2*(n==='Hips'?12:wt); if(t[2]!==null) e+=(w.z-t[2])**2*wt; }
  for (const s of ['L','R']) {
    const sh=r.world('UpperArm.'+s), wr=r.world('Wrist.'+s), h=S.hang[s];
    e += ((wr.x-sh.x-h[0])**2+(wr.y-sh.y-h[1])**2+(wr.z-sh.z-h[2])**2)*6;
    const el=ang(sh.toArray(),r.world('LowerArm.'+s).toArray(),wr.toArray());
    e += Math.max(0, el - S.elbow[s])**2*0.8;
    const kn=ang(r.world(KNEE[s][0]).toArray(),r.world(KNEE[s][1]).toArray(),r.world(KNEE[s][2]).toArray());
    e += Math.max(0, kn - S.knee[s])**2*1.2;
  }
  if (S.headFwd) { const q=r.worldQ('Head'); const f=new r.THREE.Vector3(0,0,1).applyQuaternion(q);
    const w0=nrm(S.headFwd);
    e += ((f.x-w0[0])**2+(f.y-w0[1])**2+(f.z-w0[2])**2)*0.8; }
  if (seed) for (let i=0;i<v.length;i++) e += (v[i]-seed[i])**2*wReg;
  return e;
};
const run = (tag, S, drop, seed, wReg) => {
  const knobs = seed ? KNOBS.map((k,i)=>k.concat([seed[i]])) : KNOBS;
  const res = solve(buildRig, knobs, mk(S,seed,wReg||0),
    {passes:120, step: seed?0.3:0.45, pre: (r)=>{ if(drop) r.mov('Body',0,-drop/UNIT,0); }});
  const r=res.rig; res.apply();
  console.log(`\n${tag}  cost ${res.cost.toFixed(4)}`);
  for (const n in S.pts) console.log('   ',n.padEnd(16), r.world(n).toArray().map(x=>x.toFixed(3)).join(','), ' want', S.pts[n].map(x=>x===null?'-':x.toFixed(3)).join(','));
  for (const s of ['L','R']) { const sh=r.world('UpperArm.'+s), wr=r.world('Wrist.'+s);
    console.log('    hang'+s, [wr.x-sh.x,wr.y-sh.y,wr.z-sh.z].map(x=>x.toFixed(3)).join(','), ' want', S.hang[s].map(x=>x.toFixed(3)).join(','));
    console.log(`    elbow${s} ${(ang(sh.toArray(),r.world('LowerArm.'+s).toArray(),wr.toArray())*180/Math.PI).toFixed(0)}  knee${s} ${(ang(r.world(KNEE[s][0]).toArray(),r.world(KNEE[s][1]).toArray(),r.world(KNEE[s][2]).toArray())*180/Math.PI).toFixed(0)}`); }
  console.log('  '+tag+' =', JSON.stringify(res.v.map(x=>+x.toFixed(4))));
  return res.v;
};

// ---- THE HOP -------------------------------------------------------------
// animationmentor / endlessreference: the arms LEAD upward and forward on the
// take-off and drive the momentum; on the landing they TRAIL the body — down
// and behind — while the knees absorb. The version this replaces had them
// straight overhead at the apex (a cheer) and straight out in front on the
// landing (leading, not trailing), both with locked elbows.
const tuck = run('TUCK', {
  pts: {
    'LowerLeg.L_end':[ 0.085, HIPY-0.50, 0.15], 'LowerLeg.R_end':[-0.085, HIPY-0.53, 0.10],
    'Hips':[null, HIPY+0.02, null],
  },
  // up and FORWARD, close to the body, elbows well bent
  hang: { L: [ ARM*0.30, ARM*0.34, ARM*0.52], R: [-ARM*0.30, ARM*0.34, ARM*0.52] },
  elbow: { L: D(104), R: D(104) },
  knee:  { L: D(96),  R: D(100) },
  headFwd: [0,-0.05,1],
}, 0);
run('REACH', {
  pts: {
    'LowerLeg.L_end':[ 0.090, DECKY-0.05, 0.10], 'LowerLeg.R_end':[-0.090, DECKY-0.05, 0.05],
    'Hips':[null, HIPY-0.02, null],
  },
  // TRAILING: down and a little behind, elbows soft
  hang: { L: [ ARM*0.26, -ARM*0.86, -ARM*0.20], R: [-ARM*0.26, -ARM*0.86, -ARM*0.20] },
  elbow: { L: D(150), R: D(150) },
  knee:  { L: D(168), R: D(168) },
  headFwd: [0,-0.12,1],
}, 0, tuck, 0.02);

// ---- SIT (the vespa; parked on Sentosa but ride.js still builds it) -------
run('SIT', {
  pts: {
    'LowerLeg.L_end':[ 0.115, HIPY-0.40, 0.30], 'LowerLeg.R_end':[-0.115, HIPY-0.40, 0.30],
    'Hips':[null, HIPY, null],
  },
  hang: { L: [ ARM*0.30, -ARM*0.40, ARM*0.70], R: [-ARM*0.30, -ARM*0.40, ARM*0.70] },
  elbow: { L: D(146), R: D(146) },
  knee:  { L: D(96),  R: D(96) },
  headFwd: [0,-0.15,1],
}, 0);
