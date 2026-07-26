// The player on foot: a walking figure and a small walk model.
// Kept separate from the ride model so both stay simple.
import * as THREE from '../lib/three.module.js';

export const WALK = {
  speed: 1.85,
  runSpeed: 4.1,
  accel: 9.0,
  turnRate: 9.0,
};

export function newWalker(x = 0, z = 0, heading = 0) {
  return { x, z, heading, speed: 0, phase: 0 };
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
  const g = new THREE.Group();
  const shirt = new THREE.MeshLambertMaterial({ color: 0xc9553f });
  const jeans = new THREE.MeshLambertMaterial({ color: 0x38414f });
  const skin = new THREE.MeshLambertMaterial({ color: 0x8a6a52 });
  const hair = new THREE.MeshLambertMaterial({ color: 0x241c16 });

  const part = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    return m;
  };

  const torso = part(new THREE.CapsuleGeometry(0.135, 0.36, 4, 10), shirt, 0, 1.24, 0);
  const hips = part(new THREE.CapsuleGeometry(0.125, 0.10, 3, 8), jeans, 0, 0.95, 0);
  const head = part(new THREE.SphereGeometry(0.112, 14, 12), skin, 0, 1.62, 0);
  part(new THREE.SphereGeometry(0.119, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hair, 0, 1.64, 0);
  const armL = part(new THREE.CapsuleGeometry(0.048, 0.42, 3, 8), shirt, -0.2, 1.22, 0);
  const armR = part(new THREE.CapsuleGeometry(0.048, 0.42, 3, 8), shirt, 0.2, 1.22, 0);
  const legL = part(new THREE.CapsuleGeometry(0.062, 0.46, 3, 8), jeans, -0.09, 0.53, 0);
  const legR = part(new THREE.CapsuleGeometry(0.062, 0.46, 3, 8), jeans, 0.09, 0.53, 0);

  return {
    group: g,
    pose(phase, speed) {
      const sw = speed > 0.1 ? Math.sin(phase * 2.4) : 0;
      armL.rotation.x = sw * 0.7;
      armR.rotation.x = -sw * 0.7;
      legL.rotation.x = -sw * 0.8;
      legR.rotation.x = sw * 0.8;
      const bob = speed > 0.1 ? Math.abs(Math.cos(phase * 2.4)) * 0.03 : 0;
      torso.position.y = 1.24 + bob;
      head.position.y = 1.62 + bob;
      hips.position.y = 0.95 + bob;
    },
  };
}
