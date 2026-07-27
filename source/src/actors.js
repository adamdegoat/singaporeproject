// Living street: walking pedestrians and moving traffic.
//
// Both are built as one InstancedMesh per body part across every actor, so 110
// people cost about seven draw calls, and the walk cycle is just a matrix
// rewrite per part per frame — cheap in JS, free on the GPU.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance } from './tex.js';
import { groundAt, surfaceAt } from './city.js';

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

  // position only, at arclength d (wraps)
  _point(d, out) {
    d = ((d % this.len) + this.len) % this.len;
    let lo = 0, hi = this.cum.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (this.cum[mid] <= d) lo = mid; else hi = mid;
    }
    const j = Math.min(lo + 1, this.pts.length - 1);
    const a = this.pts[lo], b = this.pts[j];
    const segLen = Math.max(1e-4, (this.cum[j] ?? this.cum[lo]) - this.cum[lo]);
    const t = Math.min(1, Math.max(0, (d - this.cum[lo]) / segLen));
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    return out;
  }

  // returns [x, z, ux, uz] at arclength s (wraps)
  //
  // The tangent is a CENTRAL DIFFERENCE over a few metres, not the direction of
  // the segment s happens to land on. Everything that travels this path —
  // pedestrians, cars, buses — is drawn at a lateral offset from the centreline,
  // and a per-segment tangent flips direction the instant s crosses a vertex.
  // The offset then swings by (offset x the turn angle) in a single frame.
  //
  // That is where the teleporting pedestrians came from. Someone walking 17m
  // out on the pavement, passing a bend of 37 degrees, was thrown 11 metres
  // sideways between two frames: measured at 75 m/s while their arclength moved
  // 24 centimetres. It was never the crossing code, and the same pop was
  // hitting every vehicle in the outer lanes.
  //
  // A central difference rotates the frame smoothly through a bend because both
  // sample points move continuously as s does.
  at(s, out) {
    this._point(s, out);
    // The window is CLAMPED to the ends of the path, never wrapped. Wrapping it
    // was worse than the bug it replaced: on a twenty-metre side street the
    // sample at s+2.5 fell off the end and came back at the far end, so the
    // tangent pointed at the other side of the street and a pedestrian standing
    // twelve metres out was thrown across it. Measured at 184 m/s.
    const d = ((s % this.len) + this.len) % this.len;
    const D = Math.min(2.5, this.len / 3);
    // The upper sample stops just SHORT of the end. Clamping it to exactly
    // this.len hands _point a value that its own wrap turns into 0, so the
    // forward sample came back from the start of the street and the tangent
    // pointed backwards. The offset then mirrored to the far side, a jump of
    // exactly twice the offset: a pedestrian 14m out on an 18m stub moved 28m.
    const EPS = 1e-3;
    const lo = Math.max(0, d - D), hi = Math.min(this.len - EPS, d + D);
    const a = this._tmpA || (this._tmpA = [0, 0]);
    const b = this._tmpB || (this._tmpB = [0, 0]);
    this._point(lo, a);
    this._point(hi, b);
    let ux = b[0] - a[0], uz = b[1] - a[1];
    let L = Math.hypot(ux, uz);
    if (L < 1e-6) {
      // degenerate: a path shorter than any usable window, or a duplicated
      // vertex. Fall back to the local segment rather than to a zero vector,
      // which would collapse every lateral offset onto the centreline.
      this._point(d, a); this._point(Math.min(this.len, d + 0.05), b);
      ux = b[0] - a[0]; uz = b[1] - a[1];
      L = Math.hypot(ux, uz) || 1;
    }
    out[2] = ux / L; out[3] = uz / L;
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
  // Pedestrians used to live on one path, the main axis, so every side street
  // in the district was deserted no matter how much frontage it had. They now
  // walk any pavement we hand them; path 0 is the main street, which keeps the
  // crossing behaviour because the crossing arclengths are measured along it.
  constructor(axis, isBlocked, count = 150, sideStreets = []) {
    this.paths = [new Path(axis.p)];
    this.halves = [axis.w / 2];
    for (const r of sideStreets) {
      this.paths.push(new Path(r.p));
      this.halves.push((r.w || 6) / 2);
    }
    this.path = this.paths[0];
    this.half = this.halves[0];
    this.isBlocked = isBlocked;
    this.count = count;
    this.people = [];
    this.crossings = [];        // arclengths of the zebra crossings
  }

  setCrossings(list) { this.crossings = list || []; }

  // every pedestrian's world position, whether or not they are being drawn.
  // The audit needs all of them, and the instance buffers only ever hold the
  // few dozen currently in view.
  positions() {
    const tmp = [0, 0, 0, 0], out = [];
    for (const pr of this.people) {
      const path = this.paths ? this.paths[pr.pi] : this.path;
      path.at(pr.s, tmp);
      const [cx, cz, ux, uz] = tmp;
      out.push([cx + -uz * pr.off, cz + ux * pr.off]);
    }
    return out;
  }

  _nearCrossing(s) {
    for (const c of this.crossings) {
      let d = c - ((s % this.path.len) + this.path.len) % this.path.len;
      if (Math.abs(d) < 2.0) return c;
    }
    return null;
  }

  // pedestrians get their green when the traffic has red
  _pedGreen(crossS, time, signals) {
    if (!signals) return true;
    for (const sig of signals.list) {
      if (Math.abs(sig.s - crossS) < 70) return signals.stateAt(sig, time) === 2;
    }
    return true;
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
    // Orchard Road carries the crowd, but the side streets should not be
    // empty. Weight by length, then trebled for the main street.
    const weights = this.paths.map((pt, i) => pt.len * (i === 0 ? 3.0 : 1.0));
    const wTotal = weights.reduce((a, b) => a + b, 0);
    const pickPath = () => {
      let r = R() * wTotal;
      for (let k = 0; k < weights.length; k++) { r -= weights[k]; if (r <= 0) return k; }
      return 0;
    };

    for (let i = 0; i < n; i++) {
      const side = chance(0.5) ? 1 : -1;
      const dir = chance(0.5) ? 1 : -1;
      const pi = pickPath();
      const half = this.halves[pi];
      const p = {
        pi,
        s: R() * this.paths[pi].len,
        // narrow streets get a narrower pavement band, or people walk in mid-air
        off: side * (half + (pi === 0 ? rand(3.2, 10.5) : rand(1.4, 3.4))),
        dir,
        speed: rand(0.95, 1.65) * (chance(0.12) ? 0 : 1),   // some stand still
        phase: R() * Math.PI * 2,
        scale: rand(0.92, 1.08),
        hasBag: chance(0.38),
        bagSide: chance(0.5) ? 1 : -1,
        crosser: chance(0.34),
        crossing: false, crossT: 0, crossFrom: 0, crossTo: 0,
      };
      p.cTop = pick(TOPS); p.cBot = pick(BOTTOMS);
      p.cSkin = pick(SKIN); p.cHair = pick(HAIR);
      this.people.push(p);
      cTop.setHex(p.cTop); cBot.setHex(p.cBot);
      cSkin.setHex(p.cSkin); cHair.setHex(p.cHair);
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

  update(time, dt, playerX = 1e9, playerZ = 1e9, signals = null) {
    const { _m: m, _q: q, _e: e, _p: p, _s: s, _tmp: tmp } = this;
    const hidden = this._hidden || (this._hidden = new THREE.Matrix4().makeTranslation(0, -9999, 0));
    // slot is the write index into the instance buffers: only visible people get
    // one, and .count is set to however many were written, so the GPU never sees
    // the rest at all
    let slot = 0;
    const parts = this._parts || (this._parts = [this.head, this.hair, this.torso,
      this.hips, this.armL, this.armR, this.legL, this.legR, this.bag,
      this.shoeL, this.shoeR, this.handL, this.handR, this.neck]);

    for (let i = 0; i < this.people.length; i++) {
      const pr = this.people[i];

      // Crossing: wait at the kerb, cross on the pedestrian green, carry on
      // along the other pavement.
      //
      // This used to take a FIXED 5.2 seconds no matter how far it was. The
      // lateral move ran from `off` to `-off`, and off is the kerb plus 3.2 to
      // 10.5 metres of pavement, so the trip was 25 to 39 metres. Twenty-five
      // metres in 5.2 seconds is 4.8 m/s average, and the ease-in-out doubles
      // that at the midpoint: measured peaks of 9 to 13 m/s, which is 32 to 47
      // km/h. That is the sprinting the user saw.
      //
      // Two fixes. The distance is now the carriageway plus a step onto each
      // pavement, not the full width of both pavements. And the duration comes
      // from that distance at a real crossing pace, so it is a walk however far
      // it is.
      if (pr.crossing) {
        pr.crossT += dt / pr.crossDur;
        const e2 = pr.crossT < 0.5
          ? 2 * pr.crossT * pr.crossT
          : 1 - 2 * (1 - pr.crossT) * (1 - pr.crossT);
        pr.off = pr.crossFrom + (pr.crossTo - pr.crossFrom) * Math.min(1, e2);
        if (pr.crossT >= 1) { pr.crossing = false; pr.off = pr.crossTo; pr.waited = 0; }
      } else if (pr.crosser && pr.pi === 0 && pr.speed > 0.1) {
        const c = this._nearCrossing(pr.s);
        if (c === null) {
          pr.s += pr.dir * (pr.speed / (pr.arc || 1)) * dt;
        } else if (this._pedGreen(c, time, signals)) {
          const half = this.halves[pr.pi];
          const sgn = pr.off >= 0 ? 1 : -1;
          // Start from where the person actually is. Snapping them to the kerb
          // line first looked tidier in the code and moved them up to nine
          // metres in a single frame, which measured as a 30 m/s pedestrian —
          // the same class of bug as the one being fixed, introduced by the
          // fix. They walk in from wherever they are.
          //
          // The far side IS capped: they finish a stride onto the far pavement
          // rather than mirroring a ten-metre offset, which is what made the
          // trip 39 metres long.
          const from = pr.off;
          const to = -sgn * (half + 1.6 + rand(0, 1.8));
          pr.crossing = true; pr.crossT = 0;
          pr.crossFrom = from; pr.crossTo = to;
          // A crossing is walked a little faster than a stroll, not sprinted.
          // The ease-in-out peaks at twice the average, so size the average to
          // keep the PEAK at a plausible pace rather than the mean.
          const dist = Math.abs(to - from);
          pr.crossDur = Math.max(2.5, (dist / 1.45) * 1.35);
          pr.waited = 0;
        } else {
          // Red for pedestrians. The comment here always claimed they wait at
          // the kerb and the code walked them straight past it. Now they stop,
          // with a patience limit so nobody stands at a junction forever.
          pr.waited = (pr.waited || 0) + dt;
          if (pr.waited > 26) { pr.waited = 0; pr.s += pr.dir * (pr.speed / (pr.arc || 1)) * dt; }
        }
      } else {
        pr.s += pr.dir * (pr.speed / (pr.arc || 1)) * dt;
      }

      // Turn round at the end of the street instead of wrapping to the other
      // end of it. Path.at() takes s modulo the path length, so a pedestrian
      // who walked off the east end reappeared at the west end: on a short side
      // street that is a visible pop, and it measured as 35 to 39 m/s.
      {
        const L = this.paths[pr.pi].len;
        // Reflect strictly INSIDE the path. Landing on s === L exactly is not
        // safe: _point takes s modulo the length, so the end of the street and
        // the start of it are the same value, and a walker standing on it is
        // rendered at the far end.
        const EDGE = 0.01;
        if (pr.s < EDGE) { pr.s = EDGE + (EDGE - pr.s); pr.dir = 1; }
        else if (pr.s > L - EDGE) { pr.s = (L - EDGE) - (pr.s - (L - EDGE)); pr.dir = -1; }
        pr.s = Math.max(EDGE, Math.min(L - EDGE, pr.s));
      }

      this.paths[pr.pi].at(pr.s, tmp);
      const [cx, cz, ux, uz] = tmp;

      // How much ground a metre of arclength covers AT THIS OFFSET. On the
      // outside of a bend it is more than a metre, so someone walking eleven
      // metres out on the pavement was covering three metres of pavement for
      // every one the centreline advanced, and broke into a run at every kink
      // in the road. A real person walks at their own pace round a corner and
      // simply takes longer to get round it.
      //
      // Measured once per person per frame and used on the NEXT step, which is
      // a frame of lag nobody can see and avoids evaluating the path twice
      // before we know where they are.
      {
        // Centred on where they are and measured over a short window. Half a
        // metre LOOKING AHEAD averaged the rate over ground they had not
        // reached, and near a tight kink the rate changes faster than that:
        // the correction lagged and one walker still hit 3.3 m/s rounding it.
        const t1 = this._t1 || (this._t1 = [0, 0, 0, 0]);
        const t2 = this._t2 || (this._t2 = [0, 0, 0, 0]);
        const H = 0.15;
        this.paths[pr.pi].at(pr.s - H, t1);
        this.paths[pr.pi].at(pr.s + H, t2);
        const ax = t1[0] - t1[3] * pr.off, az = t1[1] + t1[2] * pr.off;
        const bx = t2[0] - t2[3] * pr.off, bz = t2[1] + t2[2] * pr.off;
        const k = Math.hypot(bx - ax, bz - az) / (2 * H);
        // The upper clamp has to be generous. Held at 3 the correction ran out
        // on the tightest kink in the axis and a pedestrian eleven metres out
        // still broke into a 3.3 m/s jog rounding it. Slowing to an eighth of
        // pace on the outside of a hairpin is not a bug, it is what walking
        // round a hairpin at a fixed pace looks like.
        pr.arc = Math.max(0.35, Math.min(8.0, k)) || 1;
      }
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
      if (this.isBlocked(x, z)) continue;

      // Only animate and draw the people you could actually see. With 260 of
      // them spread over 1.2km, roughly forty are ever in range, so this is the
      // difference between 44fps and 55 at no visual cost.
      const ddx2 = x - playerX, ddz2 = z - playerZ;
      if (ddx2 * ddx2 + ddz2 * ddz2 > 105 * 105) continue;
      const idx = slot++;

      // Face the way you are actually going, and walk at the rate you are
      // actually covering ground. Both used to come from the along-street
      // values: heading was always parallel to the road, so a pedestrian
      // crossing it slid sideways like a crab, and the leg cycle was driven by
      // `pr.speed`, the along-path speed, which is zero during a crossing — so
      // the fastest thing on the street was moving with its legs barely
      // turning over. Deriving both from the real displacement fixes the two
      // together and keeps working for the dodge as well.
      let vx = 0, vz = 0;
      if (pr.px !== undefined && dt > 0) { vx = (x - pr.px) / dt; vz = (z - pr.pz) / dt; }
      pr.px = x; pr.pz = z;
      const ground = Math.hypot(vx, vz);
      // A teleport, a respawn or the first frame is not a stride. Ignore it for
      // the gait, and keep the previous facing rather than snapping.
      const real = ground > 0.05 && ground < 6;
      if (real) {
        const want = Math.atan2(vx, vz);
        if (pr.head === undefined) pr.head = want;
        else {
          // shortest way round, then ease, so a turn is a turn and not a snap
          let d = want - pr.head;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          pr.head += d * Math.min(1, dt * 7);
        }
      }
      if (pr.head === undefined) pr.head = Math.atan2(ux * pr.dir, uz * pr.dir);
      const heading = pr.head;
      const sc = pr.scale;
      const gait = real ? ground : 0;
      const moving = gait > 0.1;
      const walk = moving ? Math.sin(time * 5.2 * (gait / 1.3) + pr.phase) : 0;
      const bob = moving ? Math.abs(Math.cos(time * 5.2 + pr.phase)) * 0.022 : 0;

      const put = (part, lx, ly, lz, rx, rz) => {
        // local offsets are in the walker's frame, then rotated into the street
        const wx = x + (nx * lx + ux * lz), wz = z + (nz * lx + uz * lz);
        p.set(wx, surfaceAt(wx, wz) + ly * sc + bob, wz);
        e.set(rx || 0, heading, rz || 0, 'YXZ');
        q.setFromEuler(e);
        s.set(sc, sc, sc);
        m.compose(p, q, s);
        part.setMatrixAt(idx, m);
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
      else this.bag.setMatrixAt(idx, hidden);

      // instance colours must follow the person into their packed slot,
      // otherwise everyone swaps clothes as they move in and out of range
      const cc = this._cc || (this._cc = new THREE.Color());
      const setC = (part, hx) => {
        if (!part.instanceColor) return;
        cc.setHex(hx); part.setColorAt(idx, cc);
      };
      setC(this.torso, pr.cTop); setC(this.armL, pr.cTop); setC(this.armR, pr.cTop);
      setC(this.hips, pr.cBot); setC(this.legL, pr.cBot); setC(this.legR, pr.cBot);
      setC(this.bag, pr.cBot);
      setC(this.head, pr.cSkin); setC(this.handL, pr.cSkin);
      setC(this.handR, pr.cSkin); setC(this.neck, pr.cSkin);
      setC(this.hair, pr.cHair);
    }
    for (const part of parts) {
      part.count = slot;
      part.instanceMatrix.needsUpdate = true;
      if (part.instanceColor) part.instanceColor.needsUpdate = true;
    }
  }
}

/* ---------------- traffic ---------------- */
const CAR_COLS = [0xd8dade, 0x2b3038, 0x8f959c, 0x7a2f2a, 0x27405e, 0xb9bcc0, 0x3d4a3f];

export class Traffic {
  // `spec` comes from axisSpec() in markings.js: the real lane count, the real
  // lane centres, and whether the street is one-way. Passing it in rather than
  // guessing here is the whole point — the lane a car drives in and the dashed
  // line painted beside it are now the same number.
  constructor(axis, cars = 16, buses = 3, spec = null) {
    this.path = new Path(axis.p);
    this.half = axis.w / 2;
    this.nCars = cars;
    this.nBuses = buses;
    this.spec = spec;
    this.items = [];
  }

  // Which way a vehicle faces, and which lane it sits in.
  //
  // On a one-way street every vehicle runs with the way direction and may use
  // any lane. On a two-way street the direction picks the half of the
  // carriageway. Orchard Road is the first kind, and drawing it as the second
  // put half the fleet driving straight up the street the wrong way.
  _assign(i, kind) {
    const sp = this.spec;
    if (sp && sp.oneway) {
      // keep buses in the two nearside lanes, where they actually stop
      const lanes = sp.centres;
      const idx = kind === 'bus'
        ? lanes.length - 1 - (i % 2)
        : i % lanes.length;
      return { dir: 1, lane: lanes[idx] };
    }
    const dir = i % 2 === 0 ? 1 : -1;
    return kind === 'bus'
      ? { dir, lane: dir * 5.4 }
      : { dir, lane: dir * (1.9 + (i % 4 < 2 ? 0 : 3.4)) };
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
      const { dir, lane } = this._assign(i, 'car');
      const base = rand(7, 12);
      this.items.push({
        kind: 'car', i,
        s: avoidS + 55 + ((this.path.len - 110) / n) * i + rand(-6, 6),
        lane, dir, speed: base, base,
      });
      col.setHex(pick(CAR_COLS));
      this.body.setColorAt(i, col); this.roof.setColorAt(i, col);
    }
    if (this.body.instanceColor) this.body.instanceColor.needsUpdate = true;
    if (this.roof.instanceColor) this.roof.instanceColor.needsUpdate = true;
    const BUS_LIVERY = [0x3f7d46, 0x3f7d46, 0xc4342f];   // LTA green, green, SBS red
    const bcol = new THREE.Color();
    for (let i = 0; i < b; i++) {
      const { dir, lane } = this._assign(i, 'bus');
      bcol.setHex(BUS_LIVERY[i % BUS_LIVERY.length]);
      this.busBody.setColorAt(i, bcol);
      const base = rand(6, 9);
      this.items.push({
        kind: 'bus', i,
        s: avoidS + 140 + ((this.path.len - 200) / b) * i + rand(-15, 15),
        lane, dir, speed: base, base,
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

  // metres to the closest vehicle, for the audio bed
  nearest(px, pz) {
    let best = 1e9;
    for (const it of this.items) {
      if (!it.wx) continue;
      const d = (px - it.wx) ** 2 + (pz - it.wz) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
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

  // playerX/playerZ are only used to decide where a vehicle may be recycled.
  update(time, dt, signals, playerX = 1e9, playerZ = 1e9) {
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

      // Recycling at the end of the street.
      //
      // Path.at() takes s modulo the length, so a car that reached Dhoby Ghaut
      // silently reappeared at the Tanglin end: measured as one sample at
      // 15,500 m/s. Orchard Road is one-way, so it cannot simply turn round the
      // way a pedestrian does. It has to be a different car arriving at the top
      // of the street, and that swap must not happen where anyone can watch it.
      //
      // So it waits: past the end it holds at the last few metres, as if queuing
      // at the junction, and only jumps back to the start once it is far enough
      // from the player that the jump is off screen.
      {
        const L = this.path.len, EDGE = 4;
        const past = it.dir > 0 ? it.s > L - EDGE : it.s < EDGE;
        if (past) {
          const far = (it.wx === undefined)
            || ((it.wx - playerX) ** 2 + (it.wz - playerZ) ** 2) > 190 * 190;
          // Spread them on re-entry. Sending every recycled vehicle to exactly
          // s = EDGE stacked them one inside another at the top of the street,
          // which the audit correctly reported as duplicated props: four cars
          // at the same coordinate. A deterministic per-vehicle offset keeps
          // the fleet apart without needing to look at where the others are.
          const spread = EDGE + ((it.i * 53) % 260);
          if (far) it.s = it.dir > 0 ? spread : L - spread;
          else { it.s = it.dir > 0 ? L - EDGE : EDGE; it.speed = 0; }
        }
      }
      this.path.at(it.s, tmp);
      const [cx, cz, ux, uz] = tmp;
      const nx = -uz, nz = ux;
      const x = cx + nx * it.lane, z = cz + nz * it.lane;
      const heading = Math.atan2(ux * it.dir, uz * it.dir);
      it.wx = x; it.wz = z; it.heading = heading;       // for collision queries
      e.set(0, heading, 0); q.setFromEuler(e);

      if (it.kind === 'car') {
        const gy = surfaceAt(x, z);
        p.set(x, gy + 0.62, z); m.compose(p, q, s); this.body.setMatrixAt(it.i, m);
        p.set(x - ux * 0.35 * it.dir, gy + 1.14, z - uz * 0.35 * it.dir);
        m.compose(p, q, s); this.roof.setMatrixAt(it.i, m);
        m.compose(p, q, s); this.glaze.setMatrixAt(it.i, m);
        for (let w = 0; w < 4; w++) {
          const along = (w < 2 ? 1.4 : -1.4) * it.dir;
          const across = (w % 2 ? 0.86 : -0.86);
          // Ground height under THIS WHEEL, not under the middle of the car.
          // A wheel sits up to 1.4m fore and aft of the body centre and a bus
          // wheel 3.6m, and Orchard Road falls 46 metres over its length, so on
          // any grade the downhill wheels were buried and the uphill ones
          // hovered. Same rule the bike needed: the height a thing is drawn at
          // and the height the ground is under it are different numbers.
          const wx2 = x + ux * along + nx * across, wz2 = z + uz * along + nz * across;
          p.set(wx2, surfaceAt(wx2, wz2) + 0.31, wz2);
          e.set(0, heading, Math.PI / 2, 'YXZ');
          this._q2 = this._q2 || new THREE.Quaternion();
          this._q2.setFromEuler(e);
          m.compose(p, this._q2, s);
          this.wheel.setMatrixAt(it.i * 4 + w, m);
        }
      } else {
        const gyb = surfaceAt(x, z);
        p.set(x, gyb + 1.55, z); m.compose(p, q, s); this.busBody.setMatrixAt(it.i, m);
        p.set(x, gyb + 0.62, z); m.compose(p, q, s); this.busSkirt.setMatrixAt(it.i, m);
        p.set(x, gyb + 2.05, z); m.compose(p, q, s); this.busGlaze.setMatrixAt(it.i, m);
        p.set(x + ux * 5.95 * it.dir, gyb + 2.42, z + uz * 5.95 * it.dir);
        m.compose(p, q, s); this.busBlind.setMatrixAt(it.i, m);
        for (let w = 0; w < 4; w++) {
          const along = (w < 2 ? 3.6 : -3.6) * it.dir;
          const across = (w % 2 ? 1.2 : -1.2);
          const wx2 = x + ux * along + nx * across, wz2 = z + uz * along + nz * across;
          p.set(wx2, surfaceAt(wx2, wz2) + 0.48, wz2);
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
