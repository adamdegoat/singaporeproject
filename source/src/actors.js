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
    // A route may not run through a wall.
    //
    // These paths are road and footway centrelines, and seven of them had a
    // vertex inside drawn geometry that has no footprint — a podium, a hotel's
    // structure, the underpass at SOTA. A walker offset from such a vertex
    // walks through the wall, and neither B3 (which asks whether the frame is
    // continuous) nor B5 (which asks about MAPPED buildings) can see it.
    //
    // The blocked vertex is not moved, it is cut out, and the polyline is split
    // there into the runs either side of it. Dragging it clear would put a bend
    // in a street that has none, and a fix that invents geometry to hide a
    // defect is how the kerb-snap bug got into the path frames.
    const clearRuns = (pts) => {
      if (!isBlocked) return [pts];
      const runs = [];
      let cur = [];
      for (const q of pts) {
        if (isBlocked(q[0], q[1])) {
          if (cur.length > 1) runs.push(cur);
          cur = [];
        } else cur.push(q);
      }
      if (cur.length > 1) runs.push(cur);
      return runs;
    };
    this.paths = []; this.halves = [];
    for (const run of clearRuns(axis.p)) {
      this.paths.push(new Path(run)); this.halves.push(axis.w / 2);
    }
    // the main street must exist even if its centreline crosses something, or
    // the crossings, which are measured along path 0, have nothing to attach to
    if (!this.paths.length) { this.paths.push(new Path(axis.p)); this.halves.push(axis.w / 2); }
    for (const r of sideStreets) {
      for (const run of clearRuns(r.p)) {
        this.paths.push(new Path(run));
        this.halves.push((r.w || 6) / 2);
      }
    }
    this.path = this.paths[0];
    this.half = this.halves[0];

    // HOW FAR OUT THE PAVEMENT ACTUALLY STARTS, ALONG EACH PATH.
    //
    // `halves` is one number per road, taken from that road's own width. But
    // __onRoad answers about EVERY road, so a walker holding a perfectly good
    // offset for its own street is in the carriageway the moment its path
    // passes a junction, a slip road or a bus bay. That is why five people were
    // standing in live traffic at any given instant.
    //
    // There is already a runtime correction and it is right to keep: it walks
    // them out at 1.1 m/s rather than teleporting, because a correction applied
    // as a position change is a teleport however good the reason, and that
    // exact mistake once had pedestrians moving sideways at 17.6 m/s. But it is
    // REACTIVE -- it cannot fire until someone is already on the tarmac, and it
    // is sampled one person in eight per frame on top of that.
    //
    // So measure it once, at build: walk each path and record the smallest
    // clear offset per 10m bucket. The walker then starts moving out BEFORE it
    // reaches the narrow stretch instead of after, and the smooth walk-out does
    // the moving. Predictive, not reactive; nothing teleports.
    // A BITMASK OF WHICH OFFSETS ARE CLEAR, not a single threshold.
    //
    // The first version stored one number per bucket: the smallest offset that
    // is off the road. That is wrong whenever there is a SECOND carriageway
    // further out -- a slip road, a dual carriageway, a service lane behind the
    // pavement -- because it stops at the first clear metre and never sees the
    // blockage beyond it. Measured: walkers sitting at 12.1m with a "need" of
    // 11.7m and still standing in traffic.
    //
    // So record one bit per metre, per side, per 10m of path: bit k set means
    // an offset of k metres on that side is clear here. The walker then asks
    // about ITS OWN offset instead of comparing against a threshold, and steps
    // to the nearest clear metre if its own is not.
    this.clearBucket = 10;
    this.clearMask = [];
    const OFFMAX = 32;                      // bits 0..31, one per metre
    for (let pi = 0; pi < this.paths.length; pi++) {
      const path = this.paths[pi], half0 = this.halves[pi];
      const nb = Math.max(1, Math.ceil(path.len / this.clearBucket));
      const arr = new Uint32Array(nb * 2);
      const tp = [0, 0, 0, 0];
      for (let bkt = 0; bkt < nb; bkt++) {
        for (let si = 0; si < 2; si++) {
          const side = si ? 1 : -1;
          let mask = 0;
          for (let o = 0; o < OFFMAX; o++) {
            if (o < half0) continue;        // never inside the kerb of its own street
            let clear = true;
            // both ends of the bucket, so a band that narrows inside it counts
            // as narrow for the whole bucket
            for (const frac of [0.1, 0.5, 0.9]) {
              path.at(Math.min(path.len, (bkt + frac) * this.clearBucket), tp);
              const x = tp[0] - tp[3] * (o * side), z = tp[1] + tp[2] * (o * side);
              if (window.__onRoad && window.__onRoad(x, z, -0.8)) { clear = false; break; }
              if (this.isBlocked && this.isBlocked(x, z)) { clear = false; break; }
            }
            if (clear) mask |= (1 << o);
          }
          arr[bkt * 2 + si] = mask;
        }
      }
      this.clearMask.push(arr);
    }
    this.isBlocked = isBlocked;
    this.count = count;
    this.people = [];
    this.crossings = [];        // arclengths of the zebra crossings
  }

  setCrossings(list) { this.crossings = list || []; }

  // every pedestrian's world position, whether or not they are being drawn.
  // The audit needs all of them, and the instance buffers only ever hold the
  // few dozen currently in view.
  // WHERE EACH WALKER IS DRAWN, not where its path parameters say it should be.
  //
  // This recomputed the position from `pr.off` alone and ignored `shift`, the
  // per-frame sidestep for avoiding other people -- so every check reading it
  // was told about a place the walker was not. D36 spent three rounds reporting
  // walkers "standing in a carriageway" whose drawn position was on the
  // pavement, and reporting nothing about ones the dodge had pushed onto the
  // tarmac. This project's own rule, for the fifth time: test the world, not
  // the input to the world.
  //
  // The update loop stores the drawn position now and this reports it. The
  // fallback path is only for a walker that has not been stepped yet.
  positions() {
    const tmp = [0, 0, 0, 0], out = [];
    for (const pr of this.people) {
      if (pr.dx !== undefined) { out.push([pr.dx, pr.dz]); continue; }
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
      // Marked as part of a PERSON, and indexed by person, so a check can tell
      // a walker's arm from anything else that happens to have the same
      // instance count. D32 identified body parts by `o.count === walkersDrawn`
      // and reported "57 of 57 detached, worst 1619.6m" against a pedestrian
      // RAILING POST from street.js, which had 57 instances by coincidence.
      // Counting things that resemble the target is not counting the target.
      im.userData.crowdPart = true;
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

    // WHERE A PERSON IS ALLOWED TO START.
    //
    // The pavement band is an offset from a centreline and a carriageway is not
    // the same width along its whole length, so an offset that is on the
    // pavement at one end is on the tarmac at the other: six people were
    // standing in live traffic without crossing. And at 2,200 of them, six
    // pairs were spawning inside one another — a body is half a metre across
    // and two in the same place read as one smeared figure.
    //
    // Both are fixed by rejecting the position rather than by nudging it. A
    // rejected sample costs nothing; a nudged one invents a walker standing
    // somewhere the rule said no.
    const tmpP = [0, 0, 0, 0];
    const takenCell = new Map();
    const where = (pi, sVal, off) => {
      this.paths[pi].at(sVal, tmpP);
      return [tmpP[0] + -tmpP[3] * off, tmpP[1] + tmpP[2] * off];
    };
    const freeAt = (x, z) => {
      const cx = Math.floor(x / 1), cz = Math.floor(z / 1);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const list = takenCell.get((cx + dx) + ',' + (cz + dz));
        if (!list) continue;
        for (let q = 0; q < list.length; q += 2) {
          if ((list[q] - x) ** 2 + (list[q + 1] - z) ** 2 < 0.55 * 0.55) return false;
        }
      }
      return true;
    };
    const take = (x, z) => {
      const k = Math.floor(x / 1) + ',' + Math.floor(z / 1);
      let list = takenCell.get(k);
      if (!list) { list = []; takenCell.set(k, list); }
      list.push(x, z);
    };

    for (let i = 0; i < n; i++) {
      const dir = chance(0.5) ? 1 : -1;
      let pi = 0, sVal = 0, off = 0, ok = false;
      for (let tries = 0; tries < 12 && !ok; tries++) {
        const side = chance(0.5) ? 1 : -1;
        pi = pickPath();
        const half0 = this.halves[pi];
        sVal = R() * this.paths[pi].len;
        off = side * (half0 + (pi === 0 ? rand(3.2, 10.5) : rand(1.4, 3.4)));
        const [wx, wz] = where(pi, sVal, off);
        // not in the traffic, not inside anyone else, not inside a wall
        if (window.__onRoad && window.__onRoad(wx, wz, -0.8)) continue;
        if (!freeAt(wx, wz)) continue;
        if (this.isBlocked && this.isBlocked(wx, wz)) continue;
        take(wx, wz);
        ok = true;
      }
      if (!ok) continue;              // twelve tries and nowhere to stand: skip
      const half = this.halves[pi];
      const p = {
        pi,
        s: sVal,
        off,
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
    // slot is the write index into the instance buffers: only visible people get
    // one, and .count is set to however many were written, so the GPU never sees
    // the rest at all
    let slot = 0, bagSlot = 0;
    const seen = [];
    const tick = (this._tick = ((this._tick || 0) + 1) & 7);
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
      // Each other, not just the player.
      //
      // At 460 people this could not happen often enough to notice; at 2,200 on
      // a finite set of pavements six pairs were standing inside one another at
      // any moment, which reads as one smeared figure. Resolved against the
      // positions from the PREVIOUS frame — the same one-frame lag the gait
      // already uses — so it stays a single pass and costs a grid lookup.
      let crowdPush = 0;
      // Only for people who will actually be drawn. Run for all 2,200 it cost
      // five frames a second — nine map lookups each, twenty thousand a frame —
      // to separate people nobody can see. The draw cull is 105m; this uses 120
      // so someone is already separated by the time they come into range.
      const prev = near < 120 ? this._seen : null;
      if (prev) {
        const k = Math.floor(baseX / 2) + ',' + Math.floor(baseZ / 2);
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
          const list = prev.get((Math.floor(baseX / 2) + dx) + ',' + (Math.floor(baseZ / 2) + dz));
          if (!list) continue;
          for (let q = 0; q < list.length; q += 3) {
            if (list[q + 2] === i) continue;
            const sx = baseX - list[q], sz = baseZ - list[q + 1];
            const d2 = sx * sx + sz * sz;
            if (d2 > 0.7 * 0.7 || d2 < 1e-6) continue;
            // push along the pavement's normal, which is the only direction a
            // walker has room to move in
            const along = sx * nx + sz * nz;
            crowdPush += (along >= 0 ? 1 : -1) * (0.7 - Math.sqrt(d2)) * 0.9;
          }
        }
        if (crowdPush > 0.5) crowdPush = 0.5;
        else if (crowdPush < -0.5) crowdPush = -0.5;
      }
      if (near < 2.6) {
        const push = (2.6 - near) / 2.6;
        pr.dodge = (pr.dodge || 0) + (push * 1.5 - (pr.dodge || 0)) * Math.min(1, dt * 5);
      } else if (pr.dodge) {
        pr.dodge += (0 - pr.dodge) * Math.min(1, dt * 2.2);
        if (Math.abs(pr.dodge) < 0.01) pr.dodge = 0;
      }
      const dodgeSign = pr.off >= 0 ? 1 : -1;
      let shift = (pr.dodge || 0) * dodgeSign + crowdPush;

      // THE DODGE MAY NOT PUSH SOMEONE INTO THE ROAD.
      //
      // A walker is drawn at `off + shift`, where shift is the per-frame
      // sidestep for avoiding other people. Every rule about where the pavement
      // is was applied to `off` alone, so a crowded stretch could shove a
      // correctly-placed walker onto the tarmac.
      //
      // The fix is to CANCEL the dodge, not to relocate the walker. The first
      // version snapped `shift` to the nearest clear metre, which is a jump of
      // several metres in one frame: B1 caught a pedestrian at 135 m/s. That is
      // the third time in this file that a correction applied as a position
      // change has turned into a teleport, after the 17.6 m/s sidestep and the
      // 11m tangent flip. Winding shift down to zero moves them by at most the
      // dodge itself, which is centimetres.
      //
      // If the walker's OWN offset is the problem, that is offWant's job above
      // and it is rate-limited to 1.1 m/s.
      if (!pr.crossing && this.clearMask && shift !== 0) {
        const arr = this.clearMask[pr.pi];
        if (arr) {
          const nb2 = arr.length >> 1;
          const bkt2 = Math.min(nb2 - 1, Math.max(0, (pr.s / this.clearBucket) | 0));
          const eff = pr.off + shift;
          const sgn2 = eff >= 0 ? 1 : -1;
          const mask2 = arr[bkt2 * 2 + (sgn2 > 0 ? 1 : 0)];
          const k2 = Math.round(Math.abs(eff));
          if (mask2 && k2 < 32 && !(mask2 & (1 << k2))) shift = 0;
        }
      }
      // AND EASE INTO IT. Setting shift to 0 the instant the effective offset
      // enters a blocked bucket is a jump of the whole dodge in one frame:
      // measured, a walker's parameters moved 0.25m while its DRAWN position
      // moved 0.59m, and B1 read 4.75 m/s. That is the same teleport this file
      // has now produced three times -- the 17.6 m/s sidestep, the 135 m/s
      // snap-to-metre, and this -- every time from applying a correction as a
      // position change instead of as a rate.
      //
      // So `shift` itself is rate-limited. Whatever any guard above decides,
      // the walker can only move toward it at a walking pace.
      {
        const cap = 1.2 * dt;
        if (pr.shPrev === undefined) pr.shPrev = shift;
        const d5 = shift - pr.shPrev;
        pr.shPrev += Math.abs(d5) <= cap ? d5 : Math.sign(d5) * cap;
        shift = pr.shPrev;
      }
      const x = baseX + nx * shift;
      const z = baseZ + nz * shift;
      pr.dx = x; pr.dz = z;             // what positions() reports: where it IS

      // Standing in the road when not crossing it. The pavement band is an
      // offset from the centreline and the carriageway is not the same width
      // everywhere, so a band that is on the pavement at one end is on the
      // tarmac at the other. Walk outward until off it rather than blinking
      // out of existence: a failed placement should move, not vanish, when
      // there is somewhere to move to.
      // Standing in the road when not crossing: aim for the pavement, then
      // WALK there.
      //
      // The test is sampled one person in eight per frame, staggered by index,
      // because asking 2,200 people every frame is a grid lookup and a run of
      // segment tests each and cost three frames a second on its own. The first
      // version compensated by multiplying the step by eight — which made it a
      // 17.6 m/s sideways jump, and B1 caught a pedestrian doing 7.2 m/s. That
      // is the same bug as the walkers who were thrown eleven metres sideways
      // by a flipped tangent: a correction applied as a POSITION CHANGE is a
      // teleport, however good the reason.
      //
      // So the sampled test only sets a target, and the movement toward it is
      // capped at a walking pace on every frame.
      // PREDICTIVE: the measured clear offset for where this walker is now, so
      // it starts stepping out before the carriageway reaches it. Costs one
      // array lookup per person per frame, not a road query.
      if (!pr.crossing) {
        const arr = this.clearMask && this.clearMask[pr.pi];
        if (arr) {
          const nb = arr.length >> 1;
          const sgn0 = pr.off >= 0 ? 1 : -1;
          const si0 = sgn0 > 0 ? 1 : 0;
          const bktOf = (sv) => Math.min(nb - 1, Math.max(0, (sv / this.clearBucket) | 0));
          // LOOK AHEAD as well as underfoot. The walk-out is capped at 1.1 m/s
          // and a walker moves at up to 1.65, so someone entering a narrowing
          // stretch is inside it before a here-and-now test can finish moving
          // them. Twelve metres is about nine seconds of correction.
          const here = arr[bktOf(pr.s) * 2 + si0];
          const soon = arr[bktOf(pr.s + pr.dir * 12) * 2 + si0];
          const mask = (here & soon) || here || soon;
          const k = Math.round(Math.abs(pr.off));
          if (mask && k < 32 && !(mask & (1 << k))) {
            // nearest clear metre on this side, outward first: stepping toward
            // the buildings is the pavement, stepping inward is the road
            let best = -1;
            for (let d3 = 1; d3 < 32 && best < 0; d3++) {
              if (k + d3 < 32 && (mask & (1 << (k + d3)))) best = k + d3;
              else if (k - d3 >= 0 && (mask & (1 << (k - d3)))) best = k - d3;
            }
            if (best >= 0) pr.offWant = best * sgn0;
          }
          // NO PAVEMENT ON THIS SIDE AT ALL, here or ahead. There is nowhere on
          // this side of this stretch that is not road or wall, so the walker
          // turns round -- which is what a person does when a footway ends, and
          // it reuses the reflection the path ends already use rather than
          // teleporting anyone. The cooldown stops a walker oscillating on the
          // spot at the boundary of the dead stretch.
          if (!here && !soon) {
            pr.uturn = (pr.uturn || 0) - dt;
            if (pr.uturn <= 0) { pr.dir = -pr.dir; pr.uturn = 4.0; }
          } else if (pr.uturn > 0) {
            pr.uturn -= dt;
          }
        }
      }
      // and the reactive test stays as a backstop, for anything the buckets
      // cannot see (a walker mid-cross, a path end, a bucket boundary)
      if (!pr.crossing && window.__onRoad && ((i + tick) & 7) === 0
          && window.__onRoad(x, z, -0.8)) {
        const sgn = pr.off >= 0 ? 1 : -1;
        pr.offWant = Math.min(26, Math.abs(pr.off) + 3.0) * sgn;
      }
      if (pr.offWant !== undefined) {
        const step = 1.1 * dt;                     // slower than the walk itself
        const d2 = pr.offWant - pr.off;
        if (Math.abs(d2) <= step) { pr.off = pr.offWant; pr.offWant = undefined; }
        else pr.off += Math.sign(d2) * step;
      }

      // a pedestrian standing inside a building is worse than a missing one
      if (this.isBlocked(x, z)) continue;

      // Only animate and draw the people you could actually see. With 260 of
      // them spread over 1.2km, roughly forty are ever in range, so this is the
      // difference between 44fps and 55 at no visual cost.
      const ddx2 = x - playerX, ddz2 = z - playerZ;
      if (ddx2 * ddx2 + ddz2 * ddz2 > 105 * 105) continue;
      const idx = slot++;
      seen.push(x, z, i);

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

      // `at` is the write index, which is the person's packed slot for every
      // part they always have and the bag's own counter for the one they may not
      const put = (part, lx, ly, lz, rx, rz, at) => {
        // local offsets are in the walker's frame, then rotated into the street
        const wx = x + (nx * lx + ux * lz), wz = z + (nz * lx + uz * lz);
        p.set(wx, surfaceAt(wx, wz) + ly * sc + bob, wz);
        e.set(rx || 0, heading, rz || 0, 'YXZ');
        q.setFromEuler(e);
        s.set(sc, sc, sc);
        m.compose(p, q, s);
        part.setMatrixAt(at === undefined ? idx : at, m);
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
      // Bags get their OWN slot counter. Parking a bagless person's bag at
      // y=-9999 does not cull it — the GPU draws every instance up to .count,
      // which is the lesson already written down for the crowd itself and not
      // applied to the one part only some of them carry. Two thirds of the bag
      // instances were being submitted every frame to draw nothing.
      if (pr.hasBag) put(this.bag, pr.bagSide * 0.26, 1.02, -0.06, 0, 0, bagSlot);

      // instance colours must follow the person into their packed slot,
      // otherwise everyone swaps clothes as they move in and out of range
      const cc = this._cc || (this._cc = new THREE.Color());
      const setC = (part, hx, at) => {
        if (!part.instanceColor) return;
        cc.setHex(hx); part.setColorAt(at === undefined ? idx : at, cc);
      };
      setC(this.torso, pr.cTop); setC(this.armL, pr.cTop); setC(this.armR, pr.cTop);
      setC(this.hips, pr.cBot); setC(this.legL, pr.cBot); setC(this.legR, pr.cBot);
      if (pr.hasBag) { setC(this.bag, pr.cBot, bagSlot); bagSlot++; }
      setC(this.head, pr.cSkin); setC(this.handL, pr.cSkin);
      setC(this.handR, pr.cSkin); setC(this.neck, pr.cSkin);
      setC(this.hair, pr.cHair);
    }
    // buckets of [x, z, index] for the next frame's separation pass
    {
      const g = new Map();
      for (let q = 0; q < seen.length; q += 3) {
        const k = Math.floor(seen[q] / 2) + ',' + Math.floor(seen[q + 1] / 2);
        let list = g.get(k);
        if (!list) { list = []; g.set(k, list); }
        list.push(seen[q], seen[q + 1], seen[q + 2]);
      }
      this._seen = g;
    }
    for (const part of parts) {
      part.count = part === this.bag ? bagSlot : slot;
      part.instanceMatrix.needsUpdate = true;
      if (part.instanceColor) part.instanceColor.needsUpdate = true;
    }
  }
}

/* ---------------- traffic ---------------- */
// Lengths, used by both the following rule and the boot-time spacing pass, so
// the two cannot disagree about how much room a bus needs.
const VLEN = { car: 4.32, bus: 11.8 };
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

    // NOSE TO TAIL, BY LENGTH.
    //
    // `s` is spread evenly over the path and jittered by up to fifteen metres,
    // which at 21 vehicles left 123m between them and could not go wrong. At 90
    // it leaves 28m, and a bus is 11.8m long while a car is 4.3m: eight pairs
    // were sharing a lane with 2.3m between their centres, which is one vehicle
    // inside another. Buses are put in the two nearside lanes and cars anywhere,
    // so the two kinds share lanes by construction.
    //
    // Sorted per (direction, lane) and pushed forward until each gap clears the
    // two half-lengths plus a car's worth of daylight.
    {
      const LEN = VLEN;
      const lanes = new Map();
      for (const it of this.items) {
        const k = it.dir + ',' + Math.round(it.lane * 2);
        let list = lanes.get(k);
        if (!list) { list = []; lanes.set(k, list); }
        list.push(it);
      }
      for (const [, list] of lanes) {
        list.sort((a, b) => a.s - b.s);
        for (let k = 1; k < list.length; k++) {
          const a = list[k - 1], b = list[k];
          const need = (LEN[a.kind] + LEN[b.kind]) / 2 + 4.0;
          if (b.s - a.s < need) b.s = a.s + need;
        }
      }
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

    // NO VEHICLE INSIDE ANOTHER, resolved per lane in the order they queue.
    //
    // The follow rule only reduces a speed, and a queue at a red light gives it
    // unlimited time at zero speed to settle in the wrong place — eight pairs
    // were overlapping, every one of them at a signal. Clamping each vehicle
    // against "the nearest thing in front" instead produced something worse:
    // three followers all clamped to the SAME leader and stacked at one point,
    // 0.0m apart. A queue has an order and the fix has to respect it, so this
    // sorts the lane and walks it from the front.
    //
    // Runs before integration, so it corrects last frame's positions — the same
    // one-frame lag the gait and the crowd separation already use.
    {
      const lanes = this._lanes || (this._lanes = new Map());
      for (const [, list] of lanes) list.length = 0;
      for (const it of this.items) {
        const k = it.dir + ',' + Math.round(it.lane * 2);
        let list = lanes.get(k);
        if (!list) { list = []; lanes.set(k, list); }
        list.push(it);
      }
      for (const [, list] of lanes) {
        if (list.length < 2) continue;
        // leader first: furthest along in the direction of travel
        list.sort((a, b) => (b.s - a.s) * a.dir);
        for (let k = 1; k < list.length; k++) {
          const lead = list[k - 1], back = list[k];
          const stop = (VLEN[lead.kind] + VLEN[back.kind]) / 2 + 1.6;
          if ((lead.s - back.s) * back.dir < stop) {
            back.s = lead.s - back.dir * stop;
            if (back.speed > 0) back.speed = 0;
          }
        }
      }
    }

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
      // and do not drive into the vehicle in front, in the same lane.
      //
      // This braked to a standstill at a gap of 4.5m BETWEEN CENTRES, which for
      // a bus 11.8m long is a car parked inside it. Eight pairs were overlapping
      // at any moment and all of them were queues at a red light, where the
      // controller has all the time in the world to settle into the wrong place.
      // The stopping distance is the two half-lengths plus a bumper's gap.
      for (const o of this.items) {
        if (o === it || o.dir !== it.dir || Math.abs(o.lane - it.lane) > 1.6) continue;
        const gap = (o.s - it.s) * it.dir;
        const stop = (VLEN[it.kind] + VLEN[o.kind]) / 2 + 1.6;
        const need = stop + (it.kind === 'bus' || o.kind === 'bus' ? 9 : 6);
        if (gap > 0 && gap < need) {
          want = Math.min(want, it.base * Math.max(0, (gap - stop) / (need - stop)));
        }
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
