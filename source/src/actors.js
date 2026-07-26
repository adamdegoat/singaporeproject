// Living street: walking pedestrians and moving traffic.
//
// Both are built as one InstancedMesh per body part across every actor, so 110
// people cost about seven draw calls, and the walk cycle is just a matrix
// rewrite per part per frame — cheap in JS, free on the GPU.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance } from './tex.js';

/* ---------------- path helper along the street axis ---------------- */
export class Path {
  constructor(pts) {
    this.pts = pts;
    this.cum = [0];
    for (let i = 0; i < pts.length - 1; i++) {
      this.cum.push(this.cum[i] + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
    }
    this.len = this.cum[this.cum.length - 1];
  }
  // nearest arclength to a world point (coarse scan, called once at boot)
  nearestS(x, z) {
    let bestS = 0, bestD = Infinity;
    for (let i = 0; i < this.pts.length; i++) {
      const d = (this.pts[i][0] - x) ** 2 + (this.pts[i][1] - z) ** 2;
      if (d < bestD) { bestD = d; bestS = this.cum[i]; }
    }
    return bestS;
  }

  // returns [x, z, ux, uz] at arclength s (wraps)
  at(s, out) {
    let d = ((s % this.len) + this.len) % this.len;
    let lo = 0, hi = this.cum.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (this.cum[mid] <= d) lo = mid; else hi = mid;
    }
    const a = this.pts[lo], b = this.pts[Math.min(lo + 1, this.pts.length - 1)];
    const segLen = Math.max(1e-4, this.cum[lo + 1] - this.cum[lo]);
    const t = (d - this.cum[lo]) / segLen;
    const ux = (b[0] - a[0]) / segLen, uz = (b[1] - a[1]) / segLen;
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = ux; out[3] = uz;
    return out;
  }
}

/* ---------------- pedestrians ---------------- */
const SKIN = [0x8d6b4e, 0xa8825e, 0x6f5138, 0xc39a72, 0x7d5c40];
const HAIR = [0x1c1712, 0x2a211a, 0x120f0c, 0x3d2f22, 0x554438];
const TOPS = [
  0xc9553f, 0xe8e2d4, 0x2f4d6e, 0xd9c489, 0x8a8f96, 0x6d7f5a,
  0xb5a0c4, 0x3b4a52, 0xd58a6a, 0x4a6f74, 0xe0d2b8, 0x8c4a55,
];
const BOTTOMS = [0x33383f, 0x2b3340, 0x4a4740, 0x59535c, 0x726a5e, 0x1f242b];

export class Crowd {
  constructor(axis, isBlocked, count = 150) {
    this.path = new Path(axis.p);
    this.half = axis.w / 2;
    this.isBlocked = isBlocked;
    this.count = count;
    this.people = [];
  }

  build(world) {
    const n = this.count;
    const mk = (geo, mat) => {
      const im = new THREE.InstancedMesh(geo, mat, n);
      im.castShadow = true;
      im.frustumCulled = false;
      world.add(im);
      return im;
    };
    const lam = (c) => new THREE.MeshLambertMaterial(c ? { color: c } : {});

    // proportions of a ~1.7m adult, not a bollard
    this.head = mk(new THREE.SphereGeometry(0.105, 12, 10), lam());
    this.hair = mk(new THREE.SphereGeometry(0.112, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), lam());
    this.torso = mk(new THREE.CapsuleGeometry(0.125, 0.34, 4, 10), lam());
    this.hips = mk(new THREE.CapsuleGeometry(0.115, 0.10, 3, 8), lam());
    this.armL = mk(new THREE.CapsuleGeometry(0.045, 0.40, 3, 7), lam());
    this.armR = mk(new THREE.CapsuleGeometry(0.045, 0.40, 3, 7), lam());
    this.legL = mk(new THREE.CapsuleGeometry(0.058, 0.44, 3, 7), lam());
    this.legR = mk(new THREE.CapsuleGeometry(0.058, 0.44, 3, 7), lam());
    this.bag = mk(new THREE.BoxGeometry(0.22, 0.26, 0.10), lam());
    this.shoeL = mk(new THREE.BoxGeometry(0.11, 0.07, 0.25), lam(0x2b2723));
    this.shoeR = mk(new THREE.BoxGeometry(0.11, 0.07, 0.25), lam(0x2b2723));
    this.handL = mk(new THREE.SphereGeometry(0.052, 7, 6), lam());
    this.handR = mk(new THREE.SphereGeometry(0.052, 7, 6), lam());
    this.neck = mk(new THREE.CylinderGeometry(0.052, 0.06, 0.1, 7), lam());

    const cTop = new THREE.Color(), cBot = new THREE.Color();
    const cSkin = new THREE.Color(), cHair = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const side = chance(0.5) ? 1 : -1;
      const dir = chance(0.5) ? 1 : -1;
      const p = {
        s: R() * this.path.len,
        off: side * (this.half + rand(3.2, 10.5)),
        dir,
        speed: rand(0.95, 1.65) * (chance(0.12) ? 0 : 1),   // some stand still
        phase: R() * Math.PI * 2,
        scale: rand(0.92, 1.08),
        hasBag: chance(0.38),
        bagSide: chance(0.5) ? 1 : -1,
      };
      this.people.push(p);
      cTop.setHex(pick(TOPS)); cBot.setHex(pick(BOTTOMS));
      cSkin.setHex(pick(SKIN)); cHair.setHex(pick(HAIR));
      this.torso.setColorAt(i, cTop);
      this.armL.setColorAt(i, cTop); this.armR.setColorAt(i, cTop);
      this.hips.setColorAt(i, cBot);
      this.legL.setColorAt(i, cBot); this.legR.setColorAt(i, cBot);
      this.head.setColorAt(i, cSkin);
      this.hair.setColorAt(i, cHair);
      this.bag.setColorAt(i, cBot);
      this.handL.setColorAt(i, cSkin); this.handR.setColorAt(i, cSkin);
      this.neck.setColorAt(i, cSkin);
    }
    for (const m of [this.torso, this.armL, this.armR, this.hips, this.legL,
      this.legR, this.head, this.hair, this.bag, this.handL, this.handR, this.neck]) {
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._p = new THREE.Vector3();
    this._s = new THREE.Vector3(1, 1, 1);
    this._tmp = [0, 0, 0, 0];
    this.update(0, 0);
    return n;
  }

  update(time, dt, playerX = 1e9, playerZ = 1e9) {
    const { _m: m, _q: q, _e: e, _p: p, _s: s, _tmp: tmp } = this;
    const hidden = this._hidden || (this._hidden = new THREE.Matrix4().makeTranslation(0, -9999, 0));

    for (let i = 0; i < this.people.length; i++) {
      const pr = this.people[i];
      pr.s += pr.dir * pr.speed * dt;
      this.path.at(pr.s, tmp);
      const [cx, cz, ux, uz] = tmp;
      const nx = -uz, nz = ux;
      // sidestep the player instead of walking through them
      const baseX = cx + nx * pr.off, baseZ = cz + nz * pr.off;
      const ddx = baseX - playerX, ddz = baseZ - playerZ;
      const near = Math.hypot(ddx, ddz);
      if (near < 2.6) {
        const push = (2.6 - near) / 2.6;
        pr.dodge = (pr.dodge || 0) + (push * 1.5 - (pr.dodge || 0)) * Math.min(1, dt * 5);
      } else if (pr.dodge) {
        pr.dodge += (0 - pr.dodge) * Math.min(1, dt * 2.2);
        if (Math.abs(pr.dodge) < 0.01) pr.dodge = 0;
      }
      const dodgeSign = pr.off >= 0 ? 1 : -1;
      const x = baseX + nx * (pr.dodge || 0) * dodgeSign;
      const z = baseZ + nz * (pr.dodge || 0) * dodgeSign;

      // a pedestrian standing inside a building is worse than a missing one
      if (this.isBlocked(x, z)) {
        for (const part of [this.head, this.hair, this.torso, this.hips,
          this.armL, this.armR, this.legL, this.legR, this.bag,
          this.shoeL, this.shoeR, this.handL, this.handR, this.neck]) {
          part.setMatrixAt(i, hidden);
        }
        continue;
      }

      const heading = Math.atan2(ux * pr.dir, uz * pr.dir);
      const sc = pr.scale;
      const walk = pr.speed > 0.1 ? Math.sin(time * 5.2 * (pr.speed / 1.3) + pr.phase) : 0;
      const bob = pr.speed > 0.1 ? Math.abs(Math.cos(time * 5.2 + pr.phase)) * 0.022 : 0;

      const put = (part, lx, ly, lz, rx, rz) => {
        // local offsets are in the walker's frame, then rotated into the street
        const wx = x + (nx * lx + ux * lz), wz = z + (nz * lx + uz * lz);
        p.set(wx, ly * sc + bob, wz);
        e.set(rx || 0, heading, rz || 0, 'YXZ');
        q.setFromEuler(e);
        s.set(sc, sc, sc);
        m.compose(p, q, s);
        part.setMatrixAt(i, m);
      };

      put(this.neck, 0, 1.47, 0.005);
      put(this.head, 0, 1.615, 0.01);
      put(this.hair, 0, 1.635, 0.005);
      put(this.torso, 0, 1.22, 0);
      put(this.hips, 0, 0.94, 0);
      put(this.armL, -0.19, 1.20, 0, walk * 0.62);
      put(this.armR, 0.19, 1.20, 0, -walk * 0.62);
      put(this.legL, -0.085, 0.52, 0, -walk * 0.72);
      put(this.legR, 0.085, 0.52, 0, walk * 0.72);
      // feet swing with the legs, hands with the arms
      put(this.shoeL, -0.085, 0.06, 0.02 - walk * 0.30);
      put(this.shoeR, 0.085, 0.06, 0.02 + walk * 0.30);
      put(this.handL, -0.205, 0.99, walk * 0.27);
      put(this.handR, 0.205, 0.99, -walk * 0.27);
      if (pr.hasBag) put(this.bag, pr.bagSide * 0.26, 1.02, -0.06);
      else this.bag.setMatrixAt(i, hidden);
    }
    for (const part of [this.head, this.hair, this.torso, this.hips,
      this.armL, this.armR, this.legL, this.legR, this.bag,
      this.shoeL, this.shoeR, this.handL, this.handR, this.neck]) {
      part.instanceMatrix.needsUpdate = true;
    }
  }
}

/* ---------------- traffic ---------------- */
const CAR_COLS = [0xd8dade, 0x2b3038, 0x8f959c, 0x7a2f2a, 0x27405e, 0xb9bcc0, 0x3d4a3f];

export class Traffic {
  constructor(axis, cars = 16, buses = 3) {
    this.path = new Path(axis.p);
    this.half = axis.w / 2;
    this.nCars = cars;
    this.nBuses = buses;
    this.items = [];
  }

  build(world, avoidS = 0) {
    const n = this.nCars, b = this.nBuses;
    const mk = (geo, mat, count) => {
      const im = new THREE.InstancedMesh(geo, mat, count);
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
      world.add(im);
      return im;
    };
    const paint = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x2a323a, roughness: 0.12, metalness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x24272b, roughness: 0.85 });

    this.body = mk(new THREE.BoxGeometry(1.78, 0.62, 4.32), paint, n);
    this.roof = mk(new THREE.BoxGeometry(1.64, 0.50, 2.10), paint, n);
    this.glaze = mk(new THREE.BoxGeometry(1.69, 0.38, 2.00), glass, n);
    this.wheel = mk(new THREE.CylinderGeometry(0.31, 0.31, 0.2, 10), dark, n * 4);

    // Singapore liveries: the LTA green most of the fleet wears, and SBS red
    this.busBody = mk(new THREE.BoxGeometry(2.5, 2.5, 11.8),
      new THREE.MeshStandardMaterial({ roughness: 0.5 }), b);
    this.busSkirt = mk(new THREE.BoxGeometry(2.54, 0.62, 11.7),
      new THREE.MeshStandardMaterial({ color: 0xf0efe9, roughness: 0.6 }), b);
    this.busGlaze = mk(new THREE.BoxGeometry(2.54, 0.95, 10.4), glass, b);
    this.busBlind = mk(new THREE.BoxGeometry(1.65, 0.42, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1a1d20, emissive: 0xd8a23c, emissiveIntensity: 0.5 }), b);
    this.busWheel = mk(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 10), dark, b * 4);

    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const base = rand(7, 12);
      this.items.push({
        kind: 'car', i,
        s: avoidS + 55 + ((this.path.len - 110) / n) * i + rand(-6, 6),
        lane: dir * (1.9 + (i % 4 < 2 ? 0 : 3.4)),
        dir, speed: base, base,
      });
      col.setHex(pick(CAR_COLS));
      this.body.setColorAt(i, col); this.roof.setColorAt(i, col);
    }
    if (this.body.instanceColor) this.body.instanceColor.needsUpdate = true;
    if (this.roof.instanceColor) this.roof.instanceColor.needsUpdate = true;
    const BUS_LIVERY = [0x3f7d46, 0x3f7d46, 0xc4342f];   // LTA green, green, SBS red
    const bcol = new THREE.Color();
    for (let i = 0; i < b; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      bcol.setHex(BUS_LIVERY[i % BUS_LIVERY.length]);
      this.busBody.setColorAt(i, bcol);
      const base = rand(6, 9);
      this.items.push({
        kind: 'bus', i,
        s: avoidS + 140 + ((this.path.len - 200) / b) * i + rand(-15, 15),
        lane: dir * 5.4, dir, speed: base, base,
      });
    }

    // flag AFTER the bus liveries have actually been written
    if (this.busBody.instanceColor) this.busBody.instanceColor.needsUpdate = true;

    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion();
    this._e = new THREE.Euler(); this._p = new THREE.Vector3();
    this._s = new THREE.Vector3(1, 1, 1); this._tmp = [0, 0, 0, 0];
    this.update(0, 0);
    return n + b;
  }

  // axis-aligned-ish blocker test: treat each vehicle as an oriented box
  hits(px, pz, radius = 0.85) {
    for (const it of this.items) {
      if (!it.wx) continue;
      const dx = px - it.wx, dz = pz - it.wz;
      if (dx * dx + dz * dz > 60) continue;            // cheap reject
      const c = Math.cos(-it.heading), sn = Math.sin(-it.heading);
      const lx = dx * c - dz * sn;                      // into the vehicle frame
      const lz = dx * sn + dz * c;
      const halfW = (it.kind === 'bus' ? 1.35 : 0.95) + radius;
      const halfL = (it.kind === 'bus' ? 6.0 : 2.25) + radius;
      if (Math.abs(lx) < halfW && Math.abs(lz) < halfL) return it;
    }
    return null;
  }

  update(time, dt, signals) {
    const { _m: m, _q: q, _e: e, _p: p, _s: s, _tmp: tmp } = this;
    for (const it of this.items) {
      // slow for a red or amber signal ahead, and hold at the line
      let want = it.base;
      if (signals) {
        const d = signals.nextStop(it.s, it.dir, time, 34);
        if (d !== null) {
          const STOP = 3.0;
          want = d <= STOP ? 0 : it.base * Math.min(1, (d - STOP) / 22);
        }
      }
      // and do not drive into the vehicle in front, in the same lane
      for (const o of this.items) {
        if (o === it || o.dir !== it.dir || Math.abs(o.lane - it.lane) > 1.6) continue;
        const gap = (o.s - it.s) * it.dir;
        const need = (it.kind === 'bus' || o.kind === 'bus') ? 15 : 9;
        if (gap > 0 && gap < need) want = Math.min(want, it.base * Math.max(0, (gap - 4.5) / (need - 4.5)));
      }
      const rate = want < it.speed ? 7.0 : 2.2;      // brakes harder than it pulls away
      it.speed += (want - it.speed) * Math.min(1, rate * dt);
      it.s += it.dir * it.speed * dt;
      this.path.at(it.s, tmp);
      const [cx, cz, ux, uz] = tmp;
      const nx = -uz, nz = ux;
      const x = cx + nx * it.lane, z = cz + nz * it.lane;
      const heading = Math.atan2(ux * it.dir, uz * it.dir);
      it.wx = x; it.wz = z; it.heading = heading;       // for collision queries
      e.set(0, heading, 0); q.setFromEuler(e);

      if (it.kind === 'car') {
        p.set(x, 0.62, z); m.compose(p, q, s); this.body.setMatrixAt(it.i, m);
        p.set(x - ux * 0.35 * it.dir, 1.14, z - uz * 0.35 * it.dir);
        m.compose(p, q, s); this.roof.setMatrixAt(it.i, m);
        m.compose(p, q, s); this.glaze.setMatrixAt(it.i, m);
        for (let w = 0; w < 4; w++) {
          const along = (w < 2 ? 1.4 : -1.4) * it.dir;
          const across = (w % 2 ? 0.86 : -0.86);
          p.set(x + ux * along + nx * across, 0.31, z + uz * along + nz * across);
          e.set(0, heading, Math.PI / 2, 'YXZ');
          this._q2 = this._q2 || new THREE.Quaternion();
          this._q2.setFromEuler(e);
          m.compose(p, this._q2, s);
          this.wheel.setMatrixAt(it.i * 4 + w, m);
        }
      } else {
        p.set(x, 1.55, z); m.compose(p, q, s); this.busBody.setMatrixAt(it.i, m);
        p.set(x, 0.62, z); m.compose(p, q, s); this.busSkirt.setMatrixAt(it.i, m);
        p.set(x, 2.05, z); m.compose(p, q, s); this.busGlaze.setMatrixAt(it.i, m);
        p.set(x + ux * 5.95 * it.dir, 2.42, z + uz * 5.95 * it.dir);
        m.compose(p, q, s); this.busBlind.setMatrixAt(it.i, m);
        for (let w = 0; w < 4; w++) {
          const along = (w < 2 ? 3.6 : -3.6) * it.dir;
          const across = (w % 2 ? 1.2 : -1.2);
          p.set(x + ux * along + nx * across, 0.48, z + uz * along + nz * across);
          e.set(0, heading, Math.PI / 2, 'YXZ');
          this._q2 = this._q2 || new THREE.Quaternion();
          this._q2.setFromEuler(e);
          m.compose(p, this._q2, s);
          this.busWheel.setMatrixAt(it.i * 4 + w, m);
        }
      }
    }
    for (const part of [this.body, this.roof, this.glaze, this.wheel,
      this.busBody, this.busSkirt, this.busGlaze, this.busBlind, this.busWheel]) {
      part.instanceMatrix.needsUpdate = true;
    }
  }
}
