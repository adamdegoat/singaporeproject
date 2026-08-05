// SKID MARKS. The board already knows when its tail has broken away, so the
// marks hang off that rather than guessing from speed: cruise leaves nothing,
// a committed slide leaves a pair of curved lines that fade out behind you.
//
// The owner asked for it and set the budget in the same breath: "Subtle can alr.
// Dont need heavy effects over budget." This world is fill-rate bound on a phone
// and its heap is the one number over budget, so the whole effect is:
//
//   * ONE mesh, ONE draw call, ONE material — never a mesh per mark.
//   * a FIXED ring buffer. Old segments are overwritten, so the cost is the
//     same after ten minutes of drifting as after ten seconds. 180 segments at
//     two lines is 34 KB of buffers, allocated once at boot and never grown.
//   * nothing at all on surfaces that would not take a mark.
//
// SURFACE-AWARE, because the ride model already classifies the ground under the
// wheels every frame and it costs nothing to ask: a dark scuff on tarmac, a pale
// scuffed line on sand, and NOTHING on grass, water or a boardwalk — rubber does
// not mark a lawn, and a black streak across the sea is the kind of thing that
// gets reported as a bug.
//
// It draws with depthWrite off and a polygon offset, so it can never z-fight
// with the surface it lies on — this project has just spent a morning on two
// ground layers laid at the same height.
export class SkidMarks {
  constructor(THREE, scene, opts = {}) {
    this.THREE = THREE;
    this.MAX = opts.max || 180;         // segments in the ring
    this.LIFE = opts.life || 7.0;       // seconds to fade out
    this.WIDTH = opts.width || 0.11;    // one wheel line
    this.TRACK = opts.track || 0.21;    // half the distance between the lines
    this.MIN_V = opts.minV || 2.0;      // slower than this leaves nothing
    this.STEP = opts.step || 0.45;      // metres between segments
    this.LIFT = 0.025;                  // above whatever it lies on

    const N = this.MAX * 2;             // two lines
    this.pos = new Float32Array(N * 4 * 3);
    this.col = new Float32Array(N * 4 * 4);   // rgba — alpha is the fade
    const idx = new Uint16Array(N * 6);
    for (let i = 0; i < N; i++) {
      const o = i * 4;
      idx[i * 6] = o; idx[i * 6 + 1] = o + 1; idx[i * 6 + 2] = o + 2;
      idx[i * 6 + 3] = o; idx[i * 6 + 4] = o + 2; idx[i * 6 + 5] = o + 3;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 4));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    // never culled: the marks are wherever the rider has been, and a bounding
    // sphere that has to be recomputed every frame is a cost for nothing
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    const m = new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
      toneMapped: false, fog: true,
    });
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 3;
    this.mesh.name = 'skidMarks';
    this.geo = g;
    scene.add(this.mesh);

    this.head = 0;                      // next ring slot
    this.age = new Float32Array(this.MAX).fill(1e9);
    this.bite = new Float32Array(this.MAX);   // the opacity each slot was laid at
    this.last = null;                   // last laid position
    this.live = 0;
  }

  // what colour does a mark take on this ground, or null for "leaves nothing"?
  // Tuned dark-but-not-black: a tyre scuff is the surface rubbed, not paint.
  // The kinds are ride.js's own SURFACES keys — road, paved, timber, dirt,
  // grass, sand — asked of the classifier the physics already uses, so the mark
  // can never disagree with what the board is doing.
  static tint(kind) {
    switch (kind) {
      case 'road': case 'paved':
        return [0.15, 0.14, 0.13];      // rubber on tarmac
      case 'sand':
        return [0.66, 0.60, 0.46];      // sand scuffed, not blackened
      case 'dirt':
        return [0.28, 0.22, 0.16];
      default:
        return null;                    // grass and timber take no mark
    }
  }

  // s: the ride state (x, z, heading, speed, drifting)
  // kind: the surface classification under the wheels
  // surfaceAt: what the rider is standing on
  update(s, kind, surfaceAt, dt) {
    const tint = SkidMarks.tint(kind);
    const laying = !!(s && s.drifting) && s.speed > this.MIN_V && tint;
    if (!laying) {
      this.last = null;                 // break the ribbon; do not join across
    } else {
      const p = this.last;
      const moved = p ? Math.hypot(s.x - p[0], s.z - p[1]) : Infinity;
      if (moved >= this.STEP) {
        if (p) this._lay(p[0], p[1], p[2], s.x, s.z, s.heading, tint, surfaceAt, s);
        this.last = [s.x, s.z, s.heading];
      }
    }
    this._fade(dt);
  }

  _lay(x0, z0, h0, x1, z1, h1, tint, surfaceAt, s) {
    const slot = this.head;
    this.head = (this.head + 1) % this.MAX;
    this.age[slot] = 0;
    if (this.live < this.MAX) this.live++;
    // ACROSS THE BOARD, NOT ACROSS THE PATH. In a slide the board points a long
    // way off its direction of travel — that is the whole point of the drift
    // model — so the two lines are offset along the BOARD's axis. Offsetting
    // along the travel direction would draw one line down the middle of a
    // sideways slide, which is exactly what a skid is not.
    const c0 = Math.cos(h0), s0 = Math.sin(h0);
    const c1 = Math.cos(h1), s1 = Math.sin(h1);
    for (let line = 0; line < 2; line++) {
      const sgn = line ? 1 : -1;
      const ax = x0 + c0 * this.TRACK * sgn, az = z0 - s0 * this.TRACK * sgn;
      const bx = x1 + c1 * this.TRACK * sgn, bz = z1 - s1 * this.TRACK * sgn;
      const dx = bx - ax, dz = bz - az;
      const L = Math.hypot(dx, dz) || 1;
      const nx = (-dz / L) * this.WIDTH, nz = (dx / L) * this.WIDTH;
      const i = (slot * 2 + line) * 4;
      const ya = surfaceAt(ax, az) + this.LIFT;
      const yb = surfaceAt(bx, bz) + this.LIFT;
      const P = this.pos;
      P[i * 3 + 0] = ax - nx; P[i * 3 + 1] = ya; P[i * 3 + 2] = az - nz;
      P[i * 3 + 3] = ax + nx; P[i * 3 + 4] = ya; P[i * 3 + 5] = az + nz;
      P[i * 3 + 6] = bx + nx; P[i * 3 + 7] = yb; P[i * 3 + 8] = bz + nz;
      P[i * 3 + 9] = bx - nx; P[i * 3 + 10] = yb; P[i * 3 + 11] = bz - nz;
      // darker the harder the slide: |slip| is the angle between where the
      // board points and where it is going, which IS how hard it is scrubbing
      const bite = Math.min(0.72, 0.30 + Math.abs(s.slip || 0) * 0.7);
      this.bite[slot] = bite;
      const C = this.col;
      for (let v = 0; v < 4; v++) {
        C[(i + v) * 4 + 0] = tint[0];
        C[(i + v) * 4 + 1] = tint[1];
        C[(i + v) * 4 + 2] = tint[2];
        C[(i + v) * 4 + 3] = bite;
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.color.needsUpdate = true;
  }

  // Alpha is always the slot's LAID opacity times its own fade curve, never a
  // value read back from the buffer and multiplied again — the first version did
  // that and every mark decayed at a rate that depended on the frame rate.
  _fade(dt) {
    if (!this.live) return;
    let any = false;
    const C = this.col;
    for (let slot = 0; slot < this.MAX; slot++) {
      const a = this.age[slot];
      if (a > this.LIFE) continue;
      this.age[slot] = a + dt;
      // full for the first fifth of its life, then out
      const t = (a + dt) / this.LIFE;
      const k = t < 0.2 ? 1 : Math.max(0, 1 - (t - 0.2) / 0.8);
      const al = this.bite[slot] * k;
      for (let line = 0; line < 2; line++) {
        const i = (slot * 2 + line) * 4;
        for (let v = 0; v < 4; v++) C[(i + v) * 4 + 3] = al;
      }
      any = true;
    }
    if (any) this.geo.attributes.color.needsUpdate = true;
  }

  clear() {
    this.age.fill(1e9);
    this.col.fill(0);
    this.last = null;
    this.live = 0;
    this.geo.attributes.color.needsUpdate = true;
  }
}
