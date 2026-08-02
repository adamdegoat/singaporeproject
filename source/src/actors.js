// Living street: walking pedestrians and moving traffic.
//
// Both are built as one InstancedMesh per body part across every actor, so 110
// people cost about seven draw calls, and the walk cycle is just a matrix
// rewrite per part per frame — cheap in JS, free on the GPU.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance, texFace } from './tex.js';
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
// SKIN, WEIGHTED TO THE CITY THIS IS. The old list was five mid-to-dark
// browns picked with equal probability, so every walker on Orchard Road read
// as the same person and the crowd looked nothing like Singapore. Resident
// population is about 74% Chinese, 13.5% Malay, 9% Indian and 3.4% other
// (Singapore Department of Statistics), and Orchard Road in particular also
// carries a heavy visitor share, so the paler end is weighted up a little
// beyond the resident figure rather than matching it exactly. Entries are
// repeated to weight the pick — the same trick the livery and facade pools
// use — because a weighted draw here would need its own random stream and a
// texture must not be able to move a bus stop.
const SKIN = [
  // East Asian, ~55% of the draw
  0xefcdaa, 0xe8c39a, 0xe2b98f, 0xdcb185, 0xefcdaa, 0xe8c39a, 0xe2b98f,
  0xdcb185, 0xf2d3b4, 0xd9ab7e, 0xefcdaa,
  // Malay / Southeast Asian, ~15%
  0xc79066, 0xbc8659, 0xc79066,
  // South Asian, ~13%
  0x9b7351, 0x8d6b4e, 0x7d5c40,
  // paler visitors and Eurasians, ~17%
  0xf5dcc4, 0xf0d2b6, 0xf5dcc4,
];
// Mostly black, because it is, with brown and a little grey so a crowd is not
// all one age.
const HAIR = [
  0x1c1712, 0x1c1712, 0x120f0c, 0x120f0c, 0x2a211a, 0x2a211a, 0x1c1712,
  0x3d2f22, 0x4a3a2b, 0x6b6259, 0x8c857c,
];
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
      im.userData.actor = true;      // moves; see the traffic mk() note
      world.add(im);
      return im;
    };
    const lam = (c) => new THREE.MeshLambertMaterial(c ? { color: c } : {});
    const scaleGeo = (g, gx, gy2, gz) => { g.scale(gx, gy2, gz); return g; };

    // proportions of a ~1.7m adult, not a bollard
    // The head carries the face map; every other skin part stays plain, so
    // one texture serves the whole crowd and the per-instance skin colour
    // still multiplies straight through it.
    this.head = mk(new THREE.SphereGeometry(0.105, 16, 12),
      new THREE.MeshLambertMaterial({ map: texFace() }));
    // The cap ran to 0.62pi, which put the hairline 56% of the way down the
    // head — over the brow and over the eyes, so a face drawn on the head was
    // invisible no matter where it went. A hemisphere puts the hairline at
    // about 40%, which is where a hairline is.
    this.hair = mk(new THREE.SphereGeometry(0.112, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), lam());
    // A PERSON IS WIDER THAN THEY ARE DEEP, AND HAS SHOULDERS. The torso was a
    // capsule of radius 0.125 — 25cm across — while the arms hang at ±0.19,
    // 38cm apart, so the arms floated 6.5cm clear of the body on each side and
    // the figure read as a bollard with sticks. Scaling the GEOMETRY (once, at
    // build) rather than the instance costs nothing per walker and no extra
    // triangle: 39cm across the shoulders and 21cm front to back, which is an
    // adult, and the arms now land ON the shoulder instead of beside it.
    this.torso = mk(scaleGeo(new THREE.CapsuleGeometry(0.125, 0.34, 4, 10), 1.55, 1, 0.85), lam());
    this.hips = mk(scaleGeo(new THREE.CapsuleGeometry(0.115, 0.10, 3, 8), 1.30, 1, 0.92), lam());
    this.armL = mk(new THREE.CapsuleGeometry(0.045, 0.40, 3, 7), lam());
    this.armR = mk(new THREE.CapsuleGeometry(0.045, 0.40, 3, 7), lam());
    // THE LEGS WERE 15cm TOO SHORT AND IT SHOWED AS A HOLE AT THE ANKLE.
    // A 0.44 capsule of radius 0.058 is 0.556 long and hung from the hip at
    // 0.798 it ends at 0.242, while the shoe top sits at 0.095 — a gap that is
    // there when the figure is STANDING STILL, and that opens into daylight
    // the moment the leg swings. It read as scattered shoes with nobody
    // standing in them. 0.587 + two radii reaches the ankle exactly.
    // 11.6cm thick legs under a 39cm torso read as stilts. A thigh is about
    // 15cm and a calf 11cm; one capsule has to be both, so 13.4cm splits it.
    this.legL = mk(new THREE.CapsuleGeometry(0.067, 0.569, 3, 8), lam());
    this.legR = mk(new THREE.CapsuleGeometry(0.067, 0.569, 3, 8), lam());
    this.bag = mk(new THREE.BoxGeometry(0.22, 0.26, 0.10), lam());
    this.shoeL = mk(new THREE.BoxGeometry(0.11, 0.07, 0.25), lam(0x2b2723));
    this.shoeR = mk(new THREE.BoxGeometry(0.11, 0.07, 0.25), lam(0x2b2723));
    // A hand is longer than it is wide and flatter than it is either. As a
    // plain sphere it read as a ball stuck on the end of a sleeve, which is
    // the first thing the eye lands on at arm's length.
    this.handL = mk(scaleGeo(new THREE.SphereGeometry(0.052, 8, 6), 0.82, 1.35, 1.05), lam());
    this.handR = mk(scaleGeo(new THREE.SphereGeometry(0.052, 8, 6), 0.82, 1.35, 1.05), lam());
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
        // not in the traffic, not inside anyone else, not inside a wall --
        // and not in the river. Water was missing from this list for as long
        // as the list existed, and the texture-RNG cutover proved it: the
        // reshuffled sequence stood one walker in the Singapore River at Boat
        // Quay, shoes and hands showing above the surface. A spawn test that
        // omits a refusal the world knows about is a defect waiting for the
        // right random number.
        if (window.__onRoad && window.__onRoad(wx, wz, -0.8)) continue;
        if (window.__inWater && window.__inWater(wx, wz)) continue;
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
      // AND ASK THE ROAD ITSELF, not only the mask.
      //
      // The mask is precomputed per bucket at WHOLE-METRE offsets (k2 is
      // rounded, capped at 32), so a kerb line that falls between two metres
      // reads as clear when it is not: measured 2026-07-29, walkers whose own
      // offset was legitimately on the pavement were drawn on the tarmac by
      // their dodge, and riding right up to one it stayed there -- unlike the
      // D33 overlaps, which clear as soon as anyone is near enough to see.
      // Same family as every other bug in this file where two descriptions of
      // one thing disagree: the mask says where the walker MAY stand, the road
      // index says where it IS.
      //
      // Tested against the PREVIOUS frame's drawn position, the same one-frame
      // lag the gait and the crowd separation already use, and it only sets
      // the target -- the rate limiter below still owns how fast shift moves,
      // so this cannot become the fourth teleport in this file.
      if (!pr.crossing && shift !== 0 && pr.dx !== undefined
          && window.__onRoad && window.__onRoad(pr.dx, pr.dz, -0.8)) {
        shift = 0;
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
      // IS THE WALKER ON A ROAD RIGHT NOW, by the live index rather than by the
      // precomputed band. Asked once here and used by both corrections below.
      //
      // The clearMask block runs EVERY frame and the reactive test below runs
      // one frame in eight, so whenever they disagreed the mask won -- and the
      // mask is quantised to WHOLE METRES (`k = Math.round(Math.abs(pr.off))`,
      // 32 bits), so a walker at 18.3m reads as "metre 18" and the mask can
      // call that clear while the road index says tarmac. Traced: walker 497
      // sat on a carriageway drifting outward at 0.07 m/s, which is the mask
      // nudging it toward the next whole metre it believes is clear, over and
      // over. Same quantisation-versus-reality family as the street-name plate
      // measured to a vertex and `claim`'s single-cell hash.
      //
      // So the live answer wins: if we are ON a road, skip the band correction
      // entirely and let the reactive probe below choose the direction.
      const onRoadNow = !pr.crossing && near < 140 && window.__onRoad
        ? window.__onRoad(x, z, -0.8) : false;
      if (!pr.crossing && !onRoadNow) {
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
      // cannot see (a walker mid-cross, a path end, a bucket boundary).
      // Water joined the test with the spawn fix -- but the correction runs
      // the OTHER way: a walker on the tarmac steps away from the centreline,
      // a walker in the river steps back toward it. Pushing outward for both
      // would walk the wet one deeper, which is a fallback worse than the
      // defect -- pattern #1 in NEXT.md.
      // Staggered one in eight normally -- a road query per person per frame
      // costs three frames a second -- but NOT when the walker is already on a
      // carriageway. Standing in traffic is the thing this exists to fix, so
      // it corrects every frame until it is out.
      if (!pr.crossing && (onRoadNow || ((i + tick) & 7) === 0)) {
        const sgn = pr.off >= 0 ? 1 : -1;
        if (onRoadNow || (window.__onRoad && window.__onRoad(x, z, -0.8))) {
          // WALK WHICHEVER WAY ACTUALLY LEAVES THE ROAD.
          //
          // This only ever walked OUTWARD, away from the walker's own path. On
          // a narrow band that is right; at eighteen metres out it is not,
          // because the road under the walker is no longer its own path's --
          // it is the next street over, and stepping further from path 0 walks
          // deeper into street 1. Traced frame by frame: walker 497 sat at
          // off=-17.9 drifting to -18.3, on a carriageway the whole time, with
          // the correction firing and achieving nothing. The spawn allows up
          // to half-width + 10.5m, so a walker can legitimately start that far
          // out and only meet the other road later as the geometry changes.
          //
          // So probe BOTH ways and take the one that is clear, preferring
          // inward when both are, because inward is back toward its own
          // pavement. Still a target for the rate-limited step below -- never
          // a position change, which is the teleport this file has produced
          // three times.
          const at = (o) => {
            const ox = cx + nx * o, oz = cz + nz * o;
            return !window.__onRoad(ox, oz, -0.8);
          };
          const outward = Math.min(26, Math.abs(pr.off) + 3.0) * sgn;
          const inward = Math.max(1.2, Math.abs(pr.off) - 3.0) * sgn;
          if (at(inward)) pr.offWant = inward;
          else if (at(outward)) pr.offWant = outward;
          else {
            // neither 3m step clears it: try further, inward first
            const far = [-6, 6, -10, 10].map((d) =>
              Math.max(1.2, Math.min(26, Math.abs(pr.off) + d)) * sgn);
            const hit = far.find(at);
            if (hit !== undefined) pr.offWant = hit;
            else {
              // TRIED AND REJECTED, 2026-07-30: sending them to the FAR
              // pavement when their own side is blocked. It reduced the number
              // permanently stuck (10 -> 8) and made the visible problem WORSE
              // — the instantaneous count rose from ~40 to ~52, because a
              // walker crossing a road is, for those seconds, a walker standing
              // in a road. What the rider sees is the instant, not the average.
              // Do not re-add it without measuring the plateau.
              //
              // NOTHING ON THIS SIDE CLEARS, ANYWHERE. Every probe above keeps
              // the walker's own sign, so where a whole side of a stretch is
              // carriageway — a wide junction mouth, a slip road meeting the
              // main street — the search has nowhere to go and the walker
              // stands in traffic forever. Measured in Robertson Quay: twelve
              // of them still on the tarmac after sixteen seconds, with the
              // correction firing the whole time and achieving nothing. The
              // mask's own dead-stretch u-turn never fires for these because
              // the mask (quantised to whole metres) still reports clear bits
              // at that bucket while the road index says otherwise — the same
              // quantised-versus-real split that has produced half the bugs in
              // this file.
              //
              // So use the answer the file already has for "the footway ends":
              // turn round. It moves nobody sideways across a live carriageway,
              // it reuses the reflection the path ends use, and the cooldown
              // stops it oscillating on the spot.
              pr.uturn = (pr.uturn || 0) - dt;
              if (pr.uturn <= 0) { pr.dir = -pr.dir; pr.uturn = 4.0; }
            }
          }
        } else if (window.__inWater && window.__inWater(x, z)) {
          pr.offWant = Math.max(1.2, Math.abs(pr.off) - 3.0) * sgn;
        }
      }
      if (pr.offWant !== undefined) {
        const step = 1.1 * dt;                     // slower than the walk itself
        const d2 = pr.offWant - pr.off;
        if (Math.abs(d2) <= step) { pr.off = pr.offWant; pr.offWant = undefined; }
        else pr.off += Math.sign(d2) * step;
      }

      // THE DRAW CULL MOVED ABOVE THESE TWO TESTS, and that is the whole
      // change. Both of them exist to decide whether to DRAW a person, and
      // both were being asked about all 2,200 of them every frame while only
      // the forty within 105m can ever be drawn. A CPU profile of a settled
      // phone frame put `walkBlocked` — the wall-and-footprint lookup behind
      // isBlocked — at 9.7% of all samples, the largest single application
      // cost in the world, spent almost entirely on people nobody can see.
      //
      // Nothing about the simulation moves: everyone still walks, dodges,
      // crosses and u-turns exactly as before, because all of that happens
      // above this line. Only the question "should this one be drawn" is now
      // asked of the ones near enough to draw.
      const ddx2 = x - playerX, ddz2 = z - playerZ;
      if (ddx2 * ddx2 + ddz2 * ddz2 > 105 * 105) continue;

      // a pedestrian standing inside a building is worse than a missing one
      if (this.isBlocked(x, z)) continue;

      // AND SO IS ONE STANDING IN LIVE TRAFFIC. Same rule, same reason, one
      // line apart — it just was never applied to the carriageway.
      //
      // About 38 of 2,200 are on tarmac at any moment in Robertson Quay, and
      // they are not transient: the reactive escape probes only its own side of
      // the path, so at a wide junction mouth there is nowhere to go, and the
      // u-turn added tonight only paces them back into the same blocked
      // stretch. Until the junction work lands (see NEXT.md — pavement offsets
      // are per-street and cross OTHER streets, which needs a path-level fix,
      // not another probe) the honest thing is to not draw them.
      //
      // DELIBERATELY NOT hidden from the MEASUREMENT: __crowdPositions still
      // reports every walker, so D36 and the defect hunt keep counting these
      // and the ledger keeps saying the simulation needs work. The world stops
      // showing a person standing in traffic; the numbers do not stop
      // admitting it.
      if (!pr.crossing && window.__onRoad && window.__onRoad(x, z, -0.8)) continue;

      // Only animate and draw the people you could actually see. With 260 of
      // them spread over 1.2km, roughly forty are ever in range, so this is the
      // difference between 44fps and 55 at no visual cost. (The cull itself now
      // happens a few lines earlier, before the two expensive draw filters —
      // see the note there.)
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
      // INTEGRATE THE STRIDE, DO NOT MULTIPLY BY THE CLOCK. This read
      //     Math.sin(time * 5.2 * (gait / 1.3) + pr.phase)
      // which scales the stride frequency by the CURRENT speed and then
      // multiplies it by ABSOLUTE time — so the argument is time x k(t) when
      // it has to be the integral of k. The derivative of that expression
      // carries a `time * dk` term, so a walker whose speed wobbles by
      // 0.01 m/s jumps 4 x time x 0.01 radians in one frame: harmless in the
      // first seconds, twelve radians of jump five minutes in. That is the
      // limbs "suddenly vibrating very fast" the user reported, and it gets
      // worse the longer the page has been open, which is why it looks like it
      // starts out of nowhere. A stride is a phase you accumulate, exactly
      // like an odometer; the clock never appears in it.
      //
      // `pr.phase` starts as the random per-person offset it always was and is
      // now that same phase carried forward, so nobody is in step with anybody.
      // Guarded because an accumulator is unforgiving in a way an expression is
      // not: one NaN dt and this person's phase is NaN for the rest of the
      // session, which writes NaN matrices — the exact class the instance
      // compactor now refuses outright. A bad frame must cost one frame.
      if (moving && dt > 0 && dt < 1) pr.phase += dt * 5.2 * (gait / 1.3);
      const walk = moving ? Math.sin(pr.phase) : 0;
      // The bob is the same stride seen at twice the rate — one dip per foot
      // fall — so it comes off the SAME accumulated phase. It used to run at a
      // flat 5.2 rad/s off the clock, which meant it was only ever in step with
      // the legs at exactly 1.3 m/s and drifted against them at every other
      // speed, on top of carrying the same jump.
      const bob = moving ? Math.abs(Math.cos(pr.phase)) * 0.022 : 0;

      // `at` is the write index, which is the person's packed slot for every
      // part they always have and the bag's own counter for the one they may not
      // ONE GROUND FOR THE WHOLE BODY. Every part used to sample the terrain
      // under ITSELF, so a walker striding over a kerb had their shoes on the
      // road surface and their head on the pavement, and each part twitched
      // independently as they crossed the step. A person stands on one spot.
      const gy = surfaceAt(x, z);

      const put = (part, lx, ly, lz, rx, rz, at) => {
        // local offsets are in the walker's frame, then rotated into the street
        const wx = x + (nx * lx + ux * lz), wz = z + (nz * lx + uz * lz);
        p.set(wx, gy + ly * sc + bob, wz);
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
      // A LIMB HANGS FROM A JOINT.
      //
      // Every limb was positioned at a FIXED point and then rotated about its
      // OWN CENTRE, which is not how a leg works. Pitching a thigh 41 degrees
      // about its middle swings the top of it backwards out of the pelvis and
      // the bottom forwards, so at full stride the two legs cross into an X
      // hanging below a body they are visibly no longer joined to. The shoes
      // were then placed by a hand-linearised forward offset (0.33 x walk) at
      // a FIXED height, so they sat 25cm below and 15cm in front of the leg
      // they belong to — scattered flat across the pavement with nobody
      // standing on them. Two symptoms, one mistake.
      //
      // Both go away by hanging each part from its joint. For a part whose
      // centre sits L below a joint, pitched by t about x:
      //     centre = joint + R_x(t) . (0, -L, 0) = joint + (0, -L cos t, -L sin t)
      // A foot then RISES by L(1 - cos t) as it swings, which is the thing
      // that makes a walk read as a walk instead of a slide.
      //
      // The joint heights and lengths are chosen so that at t = 0 every part
      // lands EXACTLY where it used to: hip 0.798 is the old leg top, shoulder
      // 1.445 the old arm top. A standing figure is therefore unchanged and
      // only the moving one is corrected.
      const HIP_Y = 0.798, LEG_L = 0.3515, FOOT_L = 0.738;
      const SHO_Y = 1.445, ARM_L = 0.245, HAND_L = 0.455;
      const hang = (part, lx, jy, L, t, rot) =>
        put(part, lx, jy - L * Math.cos(t), -L * Math.sin(t),
            rot === undefined ? t : rot, 0);

      // AMPLITUDE, AND IT SCALES WITH SPEED. 0.72 rad at the hip is 41 degrees
      // each way — 82 degrees between the legs, which is not a walk, it is the
      // splits, and it was applied at full size whether someone was strolling
      // or hurrying. A walking gait is about 20 degrees of hip flexion and a
      // little less at the shoulder. Tying the amplitude to how fast they are
      // actually covering ground costs nothing and means a slow walker takes
      // short steps, which is most of what makes a crowd read as a crowd
      // rather than as one animation played by everybody.
      const amp = Math.min(1, gait / 1.4);
      const tL = -walk * 0.40 * amp, tR = walk * 0.40 * amp;   // legs, opposed
      const aL = walk * 0.30 * amp, aR = -walk * 0.30 * amp;   // arms, counter-swung
      hang(this.armL, -0.19, SHO_Y, ARM_L, aL);
      hang(this.armR, 0.19, SHO_Y, ARM_L, aR);
      hang(this.legL, -0.085, HIP_Y, LEG_L, tL);
      hang(this.legR, 0.085, HIP_Y, LEG_L, tR);
      // The foot hangs from the same hip and travels the whole leg length, but
      // it does NOT pitch with the leg: an ankle keeps the sole roughly level,
      // and a boot rotated 41 degrees reads as a broken foot. A third of the
      // leg's angle is what a real stride shows.
      hang(this.shoeL, -0.085, HIP_Y, FOOT_L, tL, tL * 0.3);
      hang(this.shoeR, 0.085, HIP_Y, FOOT_L, tR, tR * 0.3);
      hang(this.handL, -0.205, SHO_Y, HAND_L, aL);
      hang(this.handR, 0.205, SHO_Y, HAND_L, aR);
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
// SINGAPORE ROADS ARE MOSTLY WHITE, SILVER AND BLACK. The COE market pushes
// buyers toward resale-safe colours, and a street of evenly-mixed maroon and
// olive reads as generic Europe. Weighted by repeating the common ones rather
// than carrying a weights table.
const CAR_COLS = [
  0xe8eaec, 0xe8eaec, 0xe8eaec,       // white, the most common car here by far
  0xb9bcc0, 0xb9bcc0, 0x8f959c,       // silver and grey
  0x2b3038, 0x2b3038,                 // black
  0x27405e, 0x7a2f2a, 0x3d4a3f, 0xd8dade,
];

// FOUR BODY TYPES FROM ONE SET OF PARTS, which is why this costs nothing. Every
// car already places each part individually per instance, so a different set of
// offsets and scales is a different car — no extra geometry, no extra draw
// call, no extra material. What makes traffic read as fake is not the polygon
// count, it is every vehicle being the same silhouette.
//
// `k` scales a part, `d` shifts it along the car. Proportions are eyeballed
// against the real thing: an SUV is taller and its cabin sits higher and
// squarer, a hatchback loses most of its boot and pushes the cabin back, a van
// is taller again with a long flat roof and almost no bonnet.
const CAR_TYPES = [
  // saloon — the reference
  { w: 1.00, h: 1.00, len: 1.00, cabZ: -0.22, cabH: 1.00, roofY: 1.38, bootK: 1.00, wheel: 1.00 },
  // small SUV, the other half of Singapore's fleet
  { w: 1.06, h: 1.16, len: 1.02, cabZ: -0.10, cabH: 1.18, roofY: 1.56, bootK: 0.86, wheel: 1.12 },
  // hatchback
  { w: 0.97, h: 0.98, len: 0.90, cabZ: -0.34, cabH: 1.04, roofY: 1.38, bootK: 0.44, wheel: 0.96 },
  // small van, the ones with a company name down the side
  { w: 1.04, h: 1.30, len: 1.00, cabZ: -0.26, cabH: 1.46, roofY: 1.74, bootK: 0.30, wheel: 1.04 },
];

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
      // Marked as something that MOVES. A car crossing the Bayfront bridge is
      // over open water for as long as it takes to cross, and W2 — which asks
      // what we BUILT in open water — was counting the fleet, so its value
      // depended on where the traffic happened to be when the audit sampled.
      // A MAJOR gate that flaps with the signal cycle is not a gate.
      im.userData.actor = true;
      world.add(im);
      return im;
    };
    const paint = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x2a323a, roughness: 0.12, metalness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x24272b, roughness: 0.85 });

    // A CAR MADE OF FOUR BOXES READS AS A BRICK. It was body, roof, one pane of
    // glass and four wheels — no bonnet, no boot, no lights, nothing to catch
    // the sun. Every extra part costs ONE draw call for the whole fleet, not
    // one per car, and the 2,200 pedestrians that came out of this world on
    // 2026-07-31 freed far more than this spends.
    //
    // The shape now steps: a low full-length sill, a wider mid body, a shorter
    // cabin set back off centre, a raked windscreen and backlight, and lit
    // lamps at both ends. Lights are emissive so they read at dusk and in the
    // shade of the towers, which is most of this city at street level.
    const lamp = new THREE.MeshStandardMaterial({
      color: 0xfff4dc, emissive: 0xffe9b8, emissiveIntensity: 0.85, roughness: 0.3 });
    const tail = new THREE.MeshStandardMaterial({
      color: 0x8c1a17, emissive: 0xd83a2c, emissiveIntensity: 0.7, roughness: 0.35 });
    const trim = new THREE.MeshStandardMaterial({
      color: 0x1e2124, roughness: 0.55, metalness: 0.45 });

    this.sill = mk(new THREE.BoxGeometry(1.84, 0.24, 4.34), trim, n);
    this.body = mk(new THREE.BoxGeometry(1.78, 0.54, 4.32), paint, n);
    this.bonnet = mk(new THREE.BoxGeometry(1.68, 0.18, 1.46), paint, n);
    this.boot = mk(new THREE.BoxGeometry(1.68, 0.20, 1.10), paint, n);
    // THE CABIN IS A GLASS BAND WITH A THIN PAINTED CAP, not a painted box with
    // a glass box inside it. The first attempt made the roof and the glaze
    // almost the same size at almost the same height, so the dark glass won
    // every pixel and the car photographed as a pickup with a black canopy.
    this.roof = mk(new THREE.BoxGeometry(1.56, 0.09, 1.74), paint, n);
    this.glaze = mk(new THREE.BoxGeometry(1.62, 0.40, 1.78), glass, n);
    this.wind = mk(new THREE.BoxGeometry(1.58, 0.46, 0.09), glass, n);
    this.rear = mk(new THREE.BoxGeometry(1.54, 0.42, 0.09), glass, n);
    this.lampL = mk(new THREE.BoxGeometry(0.42, 0.15, 0.09), lamp, n * 2);
    this.tailL = mk(new THREE.BoxGeometry(0.40, 0.14, 0.09), tail, n * 2);
    this.mirror = mk(new THREE.BoxGeometry(0.20, 0.09, 0.09), trim, n * 2);
    // TAXI ROOF SIGN. One more instanced mesh for the whole fleet, and the
    // single cheapest thing that says Singapore rather than generic city — a
    // rider clocks a taxi rank before they read a street name. Drawn for every
    // car and simply parked flat inside the roof on the ones that are not
    // taxis, which costs nothing and avoids a second count to keep in step.
    this.taxiTop = mk(new THREE.BoxGeometry(0.52, 0.13, 0.20),
      new THREE.MeshStandardMaterial({
        color: 0xf2ede2, emissive: 0xd8c58e, emissiveIntensity: 0.35, roughness: 0.5 }), n);
    this.wheel = mk(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12), dark, n * 4);
    this.hub = mk(new THREE.CylinderGeometry(0.17, 0.17, 0.24, 10),
      new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.4, metalness: 0.6 }), n * 4);

    // Singapore liveries: the LTA green most of the fleet wears, and SBS red
    this.busBody = mk(new THREE.BoxGeometry(2.5, 2.5, 11.8),
      new THREE.MeshStandardMaterial({ roughness: 0.5 }), b);
    this.busSkirt = mk(new THREE.BoxGeometry(2.54, 0.62, 11.7),
      new THREE.MeshStandardMaterial({ color: 0xf0efe9, roughness: 0.6 }), b);
    this.busGlaze = mk(new THREE.BoxGeometry(2.54, 0.95, 10.4), glass, b);
    this.busBlind = mk(new THREE.BoxGeometry(1.65, 0.42, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1a1d20, emissive: 0xd8a23c, emissiveIntensity: 0.5 }), b);
    this.busWheel = mk(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 10), dark, b * 4);
    // A SINGAPORE BUS IS NOT A PLAIN BOX. What identifies one at a glance is the
    // deep raked windscreen, the pair of doors on the kerb side, the rear engine
    // bay standing proud of the body, and the red lamps at the back. Six more
    // instanced meshes for the whole fleet, which is six draw calls, not six per
    // bus.
    this.busWind = mk(new THREE.BoxGeometry(2.42, 1.30, 0.10), glass, b);
    this.busDoor = mk(new THREE.BoxGeometry(0.10, 1.85, 1.15), glass, b * 2);
    this.busEngine = mk(new THREE.BoxGeometry(2.44, 1.05, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x3a3f43, roughness: 0.75 }), b);
    this.busTail = mk(new THREE.BoxGeometry(0.34, 0.30, 0.10), tail, b * 2);
    this.busLamp = mk(new THREE.BoxGeometry(0.36, 0.16, 0.10), lamp, b * 2);
    // the roof-line band every operator paints above the windows
    this.busBand = mk(new THREE.BoxGeometry(2.56, 0.22, 11.4),
      new THREE.MeshStandardMaterial({ color: 0xf0efe9, roughness: 0.6 }), b);

    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const { dir, lane } = this._assign(i, 'car');
      const base = rand(7, 12);
      this.items.push({
        kind: 'car', i,
        s: avoidS + 55 + ((this.path.len - 110) / n) * i + rand(-6, 6),
        lane, dir, speed: base, base,
      });
      const cc = pick(CAR_COLS);
      const it0 = this.items[this.items.length - 1];
      it0.col = cc;                                  // follows a packed slot
      // saloons and SUVs dominate; hatchbacks and vans are the seasoning
      it0.ty = [0, 0, 0, 1, 1, 2, 3][i % 7];
      // ROUGHLY ONE CAR IN NINE IS A TAXI, which is about right for a weekday
      // Orchard Road. Liveries are the real operators: ComfortDelGro blue,
      // CityCab yellow, Trans-Cab red, Premier silver-black, SMRT green. A taxi
      // is always a saloon here.
      if (i % 9 === 4) {
        it0.taxi = 1; it0.ty = 0;
        it0.col = [0x2f6fb0, 0xe8b21f, 0xc23b30, 0x4c5359, 0x2e7d5b][(i / 9 | 0) % 5];
      }
      col.setHex(cc);
      this.body.setColorAt(i, col); this.roof.setColorAt(i, col);
    }
    for (const mesh of [this.body, this.roof, this.bonnet, this.boot]) {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    const BUS_LIVERY = [0x3f7d46, 0x3f7d46, 0xc4342f];   // LTA green, green, SBS red
    const bcol = new THREE.Color();
    for (let i = 0; i < b; i++) {
      const { dir, lane } = this._assign(i, 'bus');
      const bc = BUS_LIVERY[i % BUS_LIVERY.length];
      this.items[this.items.length - 1].col = bc;
      bcol.setHex(bc);
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
      // SAME LATERAL RULE AS THE CHECK, not a quantised lane key.
      //
      // This bucketed by `Math.round(it.lane * 2)`, so a car and a bus in one
      // lane could hash to different buckets and never be spaced apart -- and
      // D34 calls anything within 2.6m laterally the same lane. That is why
      // the check reported eight overlaps on a freshly built world: they are
      // the BUILD-TIME positions. The running enforcement resolves them within
      // a frame or two (verified by driving 120 ticks manually: zero
      // overlaps), so this was never visible to a rider -- but the first frame
      // should still be clean, and a defect probe should not have to know that
      // the world needs a few frames before it is true.
      const LEN = VLEN, LANE_SAME = 2.6;
      const byDir = new Map();
      for (const it of this.items) {
        const k = String(it.dir);
        let list = byDir.get(k);
        if (!list) { list = []; byDir.set(k, list); }
        list.push(it);
      }
      for (const [, list] of byDir) {
        list.sort((a, b) => a.s - b.s);
        // WALK BACK BY DISTANCE, NOT BY A COUNT OF SIX.
        //
        // A fixed six-entry window is not a rule about the road, it is a guess
        // about density. The list is sorted by arc length across ALL lanes, so
        // where traffic bunches, six entries can span less than one bus: two
        // buses 10.6m apart with six cars between them in s-order never got
        // compared at all, and D34 reported that same pair on Orchard Road
        // through every other fix in this file.
        //
        // The furthest any pair can need is a bus against a bus, so walking
        // back while the gap is under that is both correct and bounded -- it
        // stops at the first vehicle too far away to matter, which in ordinary
        // traffic is the first or second one.
        const MAXNEED = LEN.bus + 4.0;
        for (let k = 1; k < list.length; k++) {
          const b = list[k];
          for (let m = 1; k - m >= 0; m++) {
            const a = list[k - m];
            if (b.s - a.s > MAXNEED) break;
            if (Math.abs(a.lane - b.lane) > LANE_SAME) continue;
            const need = (LEN[a.kind] + LEN[b.kind]) / 2 + 4.0;
            if (b.s - a.s < need) b.s = a.s + need;
          }
        }
        // THE ROAD IS A LOOP AND THIS PASS WAS A LINE.
        //
        // Sorting by s and walking forward never compares the LAST vehicle
        // with the FIRST, but they are neighbours: s wraps at the end of the
        // axis. One bus pair survived every other separation rule and sat
        // 10.6m apart across that seam on Orchard Road (defect D34), because
        // no rule in this file had ever looked at it.
        //
        // Nothing is pushed here -- pushing at the seam would cascade back
        // through a queue that is already spaced. The trailing vehicle is
        // pulled BACK instead, into the gap it came from.
        const L = this.path && this.path.len;
        if (L) {
          for (let pass = 0; pass < 2; pass++) {
            for (let k = list.length - 1; k >= 0 && list.length > 1; k--) {
              const b = list[k], a = list[(k + 1) % list.length];
              if (a === b) continue;
              const ahead = k === list.length - 1 ? a.s + L : a.s;
              if (Math.abs(a.lane - b.lane) > LANE_SAME) continue;
              const need = (LEN[a.kind] + LEN[b.kind]) / 2 + 4.0;
              if (ahead - b.s < need) b.s = ahead - need;
            }
          }
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
  // COLLIDING WITH AIR BESIDE A BUS. Reported by the rider, 2026-07-31, and the
  // numbers said the same thing:
  //
  //   the bus MESH is 2.54m across its widest part (the skirt) -- half 1.27 --
  //   and 11.8m long, half 5.90. The box tested here was half 1.35 by 6.00.
  //
  //   the RIDER was then padded by a single circular radius of 0.55m, but a
  //   Vespa is 0.66m across the handlebars: half 0.33. Laterally that padding
  //   was two thirds too generous.
  //
  // Together the box fired at 1.35 + 0.55 = 1.90m from the bus centreline. The
  // two meshes actually touch at 1.27 + 0.33 = 1.60m. THIRTY CENTIMETRES of
  // invisible bus on each side, which at lane spacing is exactly the "braking
  // beside it" the rider felt.
  //
  // Measured after the fix by stepping laterally out of the box: contact now
  // fires at 1.61m against a 1.60m touch. One centimetre.
  //
  // (The probe that measured this got the perpendicular direction backwards
  // first time and reported 2.68m -- the lateral unit vector in world space is
  // (cos h, sin h), not (cos h, -sin h), because of how the world->vehicle
  // rotation below is signed. Worth knowing if anyone re-measures.)
  //
  // THE PADDING IS NOW DIRECTIONAL, because a scooter is not a circle. One
  // radius has to be the worst case in BOTH axes, so a value narrow enough to
  // ride past a bus would also let the front wheel enter one before stopping.
  // `lat` defaults to `radius`, so every existing caller keeps its old
  // behaviour until it opts in.
  hits(px, pz, radius = 0.85, lat = radius) {
    for (const it of this.items) {
      if (!it.wx) continue;
      const dx = px - it.wx, dz = pz - it.wz;
      if (dx * dx + dz * dz > 60) continue;            // cheap reject
      // INTO THE VEHICLE FRAME, AND THIS WAS ROTATING THE WRONG WAY.
      //
      // Forward in this world is (sin h, cos h) and right is (cos h, -sin h),
      // so resolving a world offset onto the vehicle's own axes is cos(h) and
      // sin(h) — NOT cos(-h) and sin(-h). With the sign flipped the transform
      // is correct only when a vehicle happens to point along an axis, and at
      // 45 degrees it SWAPS the two: a point three metres directly ahead of a
      // car came out as three metres ACROSS it and zero along.
      //
      // What that felt like, and what the rider reported: "when i pass nearby
      // a car i will stop... like the car got invisible side doors". A car is
      // 4.32m long and 1.78m wide, so a diagonally-oriented one was testing
      // its LENGTH as its width and shoving the rider away from 2.5m to the
      // side instead of 1.2m. Every junction approach and every bend in the
      // road is a diagonal heading, so this fired constantly.
      const c = Math.cos(it.heading), sn = Math.sin(it.heading);
      const lx = dx * c - dz * sn;                      // across the vehicle
      const lz = dx * sn + dz * c;                      // along it
      // Both figures now come from the meshes built above: bus body 2.5 wide
      // with a 2.54 skirt by 11.8 long; car body 1.78 by 4.32.
      const halfW = (it.kind === 'bus' ? 1.27 : 0.89) + lat;
      const halfL = (it.kind === 'bus' ? 5.90 : 2.16) + radius;
      if (Math.abs(lx) < halfW && Math.abs(lz) < halfL) return it;
    }
    return null;
  }

  // playerX/playerZ are only used to decide where a vehicle may be recycled.
  update(time, dt, signals, playerX = 1e9, playerZ = 1e9) {
    const { _m: m, _q: q, _e: e, _p: p, _s: s, _tmp: tmp } = this;
    // PACK WHAT IS DRAWN INTO THE FRONT OF THE BUFFER, exactly as the crowd
    // does. Traffic never culled for drawing — the comment below says the
    // player position is "only used to decide where a vehicle may be recycled"
    // — and its meshes are frustumCulled=false, so every vehicle in every fleet
    // was submitted every frame from every angle. That cost nothing when there
    // was ONE fleet on the spawn axis; on 2026-07-30 every district got its
    // own, so a phone was drawing 630 vehicles to look at about forty. The
    // simulation still runs for all of them, which is what keeps a street busy
    // when you arrive; only the DRAWING is culled.
    let carSlot = 0, busSlot = 0;
    const DRAW2 = 260 * 260;      // vehicles read further than pedestrians do

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
      // "SAME LANE" MEANS THE SAME THING HERE AS IT DOES TO THE CHECK.
      //
      // This bucketed by `Math.round(it.lane * 2)`, a quantised key -- so a car
      // at lane 1.0 and a bus at 2.4 landed in different buckets and were never
      // enforced against each other, while D34 calls anything within 2.6m
      // laterally the same lane and duly reported them 3.0m apart needing 8.1m.
      // Two descriptions of one fact, and the quantised one was wrong: the
      // FOURTH time this session, after the street-name plate measured to a
      // vertex, `claim`'s single-cell hash, and the pedestrian band's
      // whole-metre buckets.
      //
      // Grouped by DIRECTION only now, sorted along travel, and each vehicle is
      // tested against the few ahead of it with the same 2.6m lateral rule the
      // check uses. Sorting is O(n log n) on 45 vehicles a side and the inner
      // walk is bounded, so this is cheaper than the map it replaces.
      const LANE_SAME = 2.6, LOOK = 6;
      const lanes = this._lanes || (this._lanes = new Map());
      for (const [, list] of lanes) list.length = 0;
      for (const it of this.items) {
        const k = String(it.dir);
        let list = lanes.get(k);
        if (!list) { list = []; lanes.set(k, list); }
        list.push(it);
      }
      for (const [, list] of lanes) {
        if (list.length < 2) continue;
        // leader first: furthest along in the direction of travel
        list.sort((a, b) => (b.s - a.s) * a.dir);
        for (let k = 1; k < list.length; k++) {
          const back = list[k];
          for (let m = 1; k - m >= 0; m++) {
            const lead = list[k - m];
            // Same reasoning as the build-time pass above: bounded by the
            // furthest a pair can possibly need, not by a count.
            if ((lead.s - back.s) * back.dir > VLEN.bus + 1.6) break;
            if (m > LOOK * 4) break;                    // hard stop, never hot
            if (Math.abs(lead.lane - back.lane) > LANE_SAME) continue;
            const stop = (VLEN[lead.kind] + VLEN[back.kind]) / 2 + 1.6;
            if ((lead.s - back.s) * back.dir < stop) {
              back.s = lead.s - back.dir * stop;
              if (back.speed > 0) back.speed = 0;
            }
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
          // 240m, RAISED FROM 190m ON 2026-08-01, and the number is not free.
          // data/behaviour.mjs judges a vehicle's frame-to-frame movement out
          // to VISIBLE = 200m, so at 190 there was a TWENTY-METRE BAND -- 190 to
          // 200 from the player -- in which a car was far enough to recycle and
          // near enough to be watched doing it. A recycle moves a vehicle up to
          // 260m along its path in one frame, so any sample that lands in that
          // band is a 1,700 m/s teleport, and B2 has no way to tell it from a
          // real one. The band is also visible to a RIDER: the camera's far
          // plane is 520m, and 190m up Orchard Road is a car you can still see.
          //
          // Any future change to VISIBLE must move this with it, and this must
          // stay the larger of the two.
          const far = (it.wx === undefined)
            || ((it.wx - playerX) ** 2 + (it.wz - playerZ) ** 2) > 240 * 240;
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

      const ddx = x - playerX, ddz = z - playerZ;
      if (ddx * ddx + ddz * ddz > DRAW2) continue;    // simulated, not drawn
      const si = it.kind === 'car' ? carSlot++ : busSlot++;
      if (it.col !== undefined) {
        this._cv = this._cv || new THREE.Color();
        this._cv.setHex(it.col);
        if (it.kind === 'car') {
          if (this.body.instanceColor) {
            this.body.setColorAt(si, this._cv); this.roof.setColorAt(si, this._cv);
            this.bonnet.setColorAt(si, this._cv); this.boot.setColorAt(si, this._cv);
          }
        } else if (this.busBody.instanceColor) {
          this.busBody.setColorAt(si, this._cv);
        }
      }
      if (it.kind === 'car') {
        const gy = surfaceAt(x, z);
        const fwd = it.dir;                       // +1 nose along the path
        // FOUR SILHOUETTES FROM ONE SET OF PARTS. Each part is already placed
        // per instance, so scaling and shifting them by body type costs nothing
        // — no extra geometry, no extra draw call. A street where every vehicle
        // is the same outline is what reads as fake, not the polygon count.
        const T = CAR_TYPES[it.ty || 0];
        this._cs = this._cs || new THREE.Vector3();
        const put = (mesh, idx, along, across, up, rot, kx, ky, kz) => {
          this._cs.set(kx === undefined ? T.w : kx, ky === undefined ? T.h : ky,
                       kz === undefined ? T.len : kz);
          p.set(x + ux * along * T.len * fwd + nx * across * T.w,
                gy + up, z + uz * along * T.len * fwd + nz * across * T.w);
          if (rot === undefined) { m.compose(p, q, this._cs); } else {
            e.set(rot, heading, 0, 'YXZ');
            this._q3 = this._q3 || new THREE.Quaternion();
            this._q3.setFromEuler(e);
            m.compose(p, this._q3, this._cs);
          }
          mesh.setMatrixAt(idx, m);
        };
        put(this.sill, si, 0, 0, 0.33 * T.h);
        put(this.body, si, 0, 0, 0.68 * T.h);
        put(this.bonnet, si, 1.36, 0, 0.99 * T.h);
        put(this.boot, si, -1.56, 0, 1.00 * T.h, undefined, T.w, T.h, T.len * T.bootK);
        // cabin a little behind centre, which is what makes a car read as a car
        put(this.glaze, si, T.cabZ, 0, 1.14 * T.h, undefined, T.w, T.cabH, T.len);
        put(this.roof, si, T.cabZ, 0, T.roofY, undefined, T.w, 1, T.len);
        // raked screens at both ends of the cabin
        put(this.wind, si, 0.72, 0, 1.14 * T.h, -0.58, T.w, T.cabH, 1);
        put(this.rear, si, T.cabZ - 0.94, 0, 1.14 * T.h, 0.66, T.w, T.cabH, 1);
        for (let k = 0; k < 2; k++) {
          const side = k ? 0.60 : -0.60;
          put(this.lampL, si * 2 + k, 2.12, side, 0.82 * T.h, undefined, 1, 1, 1);
          put(this.tailL, si * 2 + k, -2.12, side, 0.90 * T.h, undefined, 1, 1, 1);
          put(this.mirror, si * 2 + k, 0.66, k ? 0.97 : -0.97, 1.10 * T.h, undefined, 1, 1, 1);
        }
        // the roof sign sits on the cabin; a non-taxi gets it buried inside
        put(this.taxiTop, si, T.cabZ + 0.30, 0,
            it.taxi ? T.roofY + 0.10 : T.roofY - 0.30, undefined, 1, it.taxi ? 1 : 0.01, 1);
        for (let w = 0; w < 4; w++) {
          const along = (w < 2 ? 1.4 : -1.4) * it.dir;
          const across = (w % 2 ? 0.86 : -0.86);
          // Ground height under THIS WHEEL, not under the middle of the car.
          // A wheel sits up to 1.4m fore and aft of the body centre and a bus
          // wheel 3.6m, and Orchard Road falls 46 metres over its length, so on
          // any grade the downhill wheels were buried and the uphill ones
          // hovered. Same rule the bike needed: the height a thing is drawn at
          // and the height the ground is under it are different numbers.
          const wx2 = x + ux * along * T.len + nx * across * T.w;
          const wz2 = z + uz * along * T.len + nz * across * T.w;
          p.set(wx2, surfaceAt(wx2, wz2) + 0.32 * T.wheel, wz2);
          e.set(0, heading, Math.PI / 2, 'YXZ');
          this._q2 = this._q2 || new THREE.Quaternion();
          this._q2.setFromEuler(e);
          this._ws = this._ws || new THREE.Vector3();
          this._ws.set(T.wheel, 1, T.wheel);
          m.compose(p, this._q2, this._ws);
          this.wheel.setMatrixAt(si * 4 + w, m);
          this.hub.setMatrixAt(si * 4 + w, m);
        }
      } else {
        const gyb = surfaceAt(x, z);
        p.set(x, gyb + 1.55, z); m.compose(p, q, s); this.busBody.setMatrixAt(si, m);
        p.set(x, gyb + 0.62, z); m.compose(p, q, s); this.busSkirt.setMatrixAt(si, m);
        p.set(x, gyb + 2.05, z); m.compose(p, q, s); this.busGlaze.setMatrixAt(si, m);
        p.set(x + ux * 5.95 * it.dir, gyb + 2.42, z + uz * 5.95 * it.dir);
        m.compose(p, q, s); this.busBlind.setMatrixAt(si, m);
        const bput = (mesh, idx, along, across, up, rot) => {
          p.set(x + ux * along * it.dir + nx * across, gyb + up,
                z + uz * along * it.dir + nz * across);
          if (rot === undefined) { m.compose(p, q, s); } else {
            e.set(rot, heading, 0, 'YXZ');
            this._qb = this._qb || new THREE.Quaternion();
            this._qb.setFromEuler(e);
            m.compose(p, this._qb, s);
          }
          mesh.setMatrixAt(idx, m);
        };
        bput(this.busWind, si, 5.82, 0, 2.05, -0.16);      // raked screen
        bput(this.busBand, si, 0, 0, 2.86);                // roof-line band
        bput(this.busEngine, si, -5.85, 0, 1.35);          // rear engine bay
        for (let k = 0; k < 2; k++) {
          // doors on the kerb side only, which is the left in Singapore
          bput(this.busDoor, si * 2 + k, k ? 3.60 : -0.40, -1.27, 1.42);
          bput(this.busTail, si * 2 + k, -5.94, k ? 0.86 : -0.86, 1.05);
          bput(this.busLamp, si * 2 + k, 5.94, k ? 0.92 : -0.92, 0.95);
        }
        for (let w = 0; w < 4; w++) {
          const along = (w < 2 ? 3.6 : -3.6) * it.dir;
          const across = (w % 2 ? 1.2 : -1.2);
          const wx2 = x + ux * along + nx * across, wz2 = z + uz * along + nz * across;
          p.set(wx2, surfaceAt(wx2, wz2) + 0.48, wz2);
          e.set(0, heading, Math.PI / 2, 'YXZ');
          this._q2 = this._q2 || new THREE.Quaternion();
          this._q2.setFromEuler(e);
          m.compose(p, this._q2, s);
          this.busWheel.setMatrixAt(si * 4 + w, m);
        }
      }
    }
    // .count is what actually culls: the GPU draws every instance up to it,
    // whatever the matrices say. Parking a far vehicle off-screen would have
    // cost exactly as much as drawing it — the lesson already written down for
    // the crowd.
    for (const part of [this.body, this.roof, this.glaze, this.sill,
      this.bonnet, this.boot, this.wind, this.rear, this.lampL, this.tailL,
      this.mirror, this.hub, this.taxiTop,
      this.busBody, this.busSkirt, this.busGlaze, this.busBlind,
      this.busWind, this.busDoor, this.busEngine, this.busTail, this.busLamp,
      this.busBand]) {
      part.instanceMatrix.needsUpdate = true;
    }
    // EVERY new part needs its count set too, or it draws the whole buffer
    // including the slots this frame never wrote — cars stacked at the origin.
    this.body.count = this.roof.count = this.glaze.count = carSlot;
    this.sill.count = this.bonnet.count = this.boot.count = carSlot;
    this.wind.count = this.rear.count = carSlot;
    this.lampL.count = this.tailL.count = this.mirror.count = carSlot * 2;
    this.taxiTop.count = carSlot;
    this.wheel.count = this.hub.count = carSlot * 4;
    this.busBody.count = this.busSkirt.count = this.busGlaze.count
      = this.busBlind.count = this.busWind.count = this.busEngine.count
      = this.busBand.count = busSlot;
    this.busDoor.count = this.busTail.count = this.busLamp.count = busSlot * 2;
    this.busWheel.count = busSlot * 4;
    this.wheel.instanceMatrix.needsUpdate = true;
    this.busWheel.instanceMatrix.needsUpdate = true;
    for (const mesh of [this.body, this.roof, this.bonnet, this.boot]) {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    if (this.busBody.instanceColor) this.busBody.instanceColor.needsUpdate = true;
  }
}
