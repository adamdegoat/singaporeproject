// Headless rig harness: build the baked avatar's bone tree in three.js, apply a
// pose, read world positions. No browser, no renderer — so a stance can be
// SOLVED in milliseconds instead of vetted one screenshot at a time.
import * as THREE from '/Users/ZY/orchard/lib/three.module.js';
import { AVATAR } from '/Users/ZY/orchard/src/avatar_data.js';

export function buildRig() {
  const bones = AVATAR.bones.map((b) => {
    const bn = new THREE.Bone();
    bn.name = b.n;
    bn.position.fromArray(b.t);
    bn.quaternion.fromArray(b.r);
    return bn;
  });
  const roots = [];
  AVATAR.bones.forEach((b, i) => { if (b.p >= 0) bones[b.p].add(bones[i]); else roots.push(bones[i]); });
  const byName = {}; bones.forEach((b) => { byName[b.name] = b; });
  const rest = AVATAR.bones.map((b) => ({ t: b.t.slice(), r: b.r.slice() }));
  const arm = new THREE.Group();
  arm.quaternion.fromArray(AVATAR.pre.r);
  arm.scale.setScalar(AVATAR.pre.s);
  roots.forEach((r) => arm.add(r));
  const root = new THREE.Group();
  const K = 1.55 / AVATAR.h;
  root.scale.set(K * 1.14, K, K * 1.14);
  byName.Head.scale.setScalar(1.16);
  for (const s of ['L','R']) {
    byName['UpperArm.'+s].scale.set(1.18,1,1.18);
    const w = byName[AVATAR.hand+'.'+s]; if (w) w.scale.set(1/1.18,1,1/1.18);
  }
  root.add(arm);
  const reset = () => { bones.forEach((b,i) => { b.position.fromArray(rest[i].t); b.quaternion.fromArray(rest[i].r); }); };
  const _q = new THREE.Quaternion(), _v = new THREE.Vector3();
  const qrot = (n,x,y,z,a) => { const b=byName[n]; if(!b) return; b.quaternion.multiply(_q.setFromAxisAngle(_v.set(x,y,z),a)); };
  const mov = (n,x,y=0,z=0) => { const b=byName[n]; if(!b) return; b.position.set(b.position.x+x,b.position.y+y,b.position.z+z); };
  const world = (n) => { root.updateMatrixWorld(true); const v=new THREE.Vector3(); byName[n].getWorldPosition(v); return v; };
  const worldQ = (n) => { root.updateMatrixWorld(true); const q=new THREE.Quaternion(); byName[n].getWorldQuaternion(q); return q; };
  return { THREE, bones, byName, root, reset, qrot, mov, world, worldQ, K };
}
