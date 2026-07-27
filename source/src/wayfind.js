// Knowing where you are: a place readout, a minimap, and street signage.
// All three lean on the names already in the OSM data, so nothing is invented.
import * as THREE from '../lib/three.module.js';
import { rand, pick } from './tex.js';
import { MAT, groundAt } from './city.js';

/* ---------------- sign textures ---------------- */
function signCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// LTA-style directional gantry: green ground, white text and arrow
function texDirection(lines) {
  return signCanvas(512, 192, (x, w, h) => {
    x.fillStyle = '#0f6b3f'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#f2f4f0'; x.lineWidth = 5;
    x.strokeRect(9, 9, w - 18, h - 18);
    x.fillStyle = '#f2f4f0';
    x.font = '600 44px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial';
    x.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      const y = lines.length === 1 ? h / 2 : 58 + i * 62;
      x.fillText(ln.text, 34, y);
      // arrow
      x.save();
      x.translate(w - 66, y);
      if (ln.dir === 'left') x.rotate(Math.PI);
      x.beginPath();
      x.moveTo(-20, 0); x.lineTo(14, 0);
      x.moveTo(2, -12); x.lineTo(14, 0); x.lineTo(2, 12);
      x.lineWidth = 7; x.strokeStyle = '#f2f4f0'; x.lineJoin = 'round';
      x.stroke();
      x.restore();
    });
  });
}

// street name plate: white ground, black text, the small blue cap SG uses
export function texStreetName(name) {
  return signCanvas(512, 128, (x, w, h) => {
    x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#20477e'; x.fillRect(0, 0, w, 22);
    x.fillStyle = '#1b1d1f';
    x.font = '700 52px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial';
    x.textBaseline = 'middle'; x.textAlign = 'center';
    let size = 52;
    while (x.measureText(name.toUpperCase()).width > w - 46 && size > 22) {
      size -= 2;
      x.font = `700 ${size}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;
    }
    x.fillText(name.toUpperCase(), w / 2, h / 2 + 10);
  });
}

/* ---------------- place the signage ---------------- */
export function buildSignage(world, axis, data, isBlocked) {
  const pts = axis.p, half = axis.w / 2;
  const placed = { gantries: 0, plates: 0 };

  // Every signpost records what it says and where it stands, so the audit can
  // check the words against the map rather than only the geometry.
  const said = (window.__signage = window.__signage || []);

  // The cross streets, kept as geometry rather than as a list of names. A
  // gantry used to pick two names at random out of this list: it looked
  // perfect and pointed at streets that were nowhere near the junction.
  const crossWays = data.roads.filter(
    (r) => r.n && !/orchard road/i.test(r.n)
        && r.k !== 'footway' && r.k !== 'pedestrian');

  // nearest named street on each side of a point, out to `reach`
  const crossAt = (px, pz, nx, nz, reach = 90) => {
    let left = null, right = null, dl = Infinity, dr = Infinity;
    for (const r of crossWays) {
      for (const q of r.p) {
        const dx = q[0] - px, dz = q[1] - pz;
        const d2 = dx * dx + dz * dz;
        if (d2 > reach * reach) continue;
        // which side of the main street it lies on
        const side = dx * nx + dz * nz;
        if (side > 0) { if (d2 < dr) { dr = d2; right = r.n; } }
        else { if (d2 < dl) { dl = d2; left = r.n; } }
      }
    }
    return { left, right };
  };

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;

      // overhead directional gantry every ~230m
      const crossHere = (acc % 230 === 90)
        ? crossAt(px, pz, nx, nz) : null;
      // A sign with nothing true to say is not built. Inventing a destination
      // is worse than leaving the junction unsigned.
      if (crossHere && (crossHere.left || crossHere.right)) {
        const g = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 7.2, 8), MAT.darkMetal);
        post.position.set(nx * (half + 1.0), 3.6, nz * (half + 1.0));
        post.castShadow = true; g.add(post);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(half * 1.1, 0.16, 0.16), MAT.darkMetal);
        arm.position.set(nx * (half * 0.45), 7.0, nz * (half * 0.45));
        arm.rotation.y = ang; arm.castShadow = true; g.add(arm);

        const rows = [];
        if (crossHere.left) rows.push({ text: crossHere.left.slice(0, 16), dir: 'left' });
        if (crossHere.right) rows.push({ text: crossHere.right.slice(0, 16), dir: 'right' });
        said.push({ kind: 'gantry', x: px, z: pz,
                    text: rows.map((r2) => r2.text).join(' | ') });
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(4.6, 1.72),
          new THREE.MeshBasicMaterial({ map: texDirection(rows) })
        );
        face.position.set(nx * (half * 0.42), 5.9, nz * (half * 0.42));
        face.rotation.y = ang + Math.PI;
        g.add(face);
        const backer = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.72, 0.09), MAT.darkMetal);
        backer.position.copy(face.position);
        backer.position.y -= 0.0;
        backer.rotation.y = ang;
        backer.castShadow = true; g.add(backer);

        g.position.set(px, groundAt(px, pz), pz);
        world.add(g);
        placed.gantries++;
      }

      // street name plate on a short pole, both sides, every ~150m
      if (acc % 150 === 40) {
        for (const sgn of [-1, 1]) {
          const sx = px + nx * (half + 2.4) * sgn, sz = pz + nz * (half + 2.4) * sgn;
          if (isBlocked(sx, sz)) continue;
          // near a junction the pole can end up closer to the cross street than
          // to the one it names, which makes the plate a lie
          const own = axis.n || 'Orchard Road';
          if (window.__nearestStreet && window.__nearestStreet(sx, sz) !== own) continue;
          const g = new THREE.Group();
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), MAT.metal);
          pole.position.y = 1.3; pole.castShadow = true; g.add(pole);
          const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.38),
            new THREE.MeshBasicMaterial({ map: texStreetName(axis.n || 'Orchard Road'), side: THREE.DoubleSide })
          );
          plate.position.y = 2.5; g.add(plate);
          said.push({ kind: 'plate', x: sx, z: sz, text: axis.n || 'Orchard Road' });
          g.position.set(sx, groundAt(sx, sz), sz);
          g.rotation.y = ang + Math.PI / 2;
          world.add(g);
          placed.plates++;
        }
      }
    }
  }
  return placed;
}

/* ---------------- place readout + minimap ---------------- */
export class Wayfinder {
  constructor(data, axis) {
    // named buildings with a centroid, for the "you are here" readout
    this.places = [];
    for (const b of data.buildings) {
      if (!b.n) continue;
      let x = 0, z = 0;
      for (const p of b.p) { x += p[0]; z += p[1]; }
      this.places.push({ n: b.n, x: x / b.p.length, z: z / b.p.length, a: b.a });
    }
    this.axis = axis;
    this.current = '';
    this.el = document.getElementById('place');
    this.map = document.getElementById('map');
    this.mapCtx = this.map ? this.map.getContext('2d') : null;
    this.bounds = this._bounds(data);
    this.base = this._renderBase(data);
    this._t = 0;
  }

  _bounds(data) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const b of data.buildings) for (const [x, z] of b.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    return { mnx, mxx, mnz, mxz };
  }

  // static layer drawn once: footprints + the Orchard Road spine
  _renderBase(data) {
    if (!this.map) return null;
    const S = this.map.width;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const { mnx, mxx, mnz, mxz } = this.bounds;
    const span = Math.max(mxx - mnx, mxz - mnz) || 1;
    const px = (wx) => ((wx - mnx) / span) * S * 0.94 + S * 0.03;
    const pz = (wz) => ((wz - mnz) / span) * S * 0.94 + S * 0.03;
    this.px = px; this.pz = pz;

    x.fillStyle = 'rgba(12,16,20,0.72)'; x.fillRect(0, 0, S, S);
    x.fillStyle = 'rgba(198,205,212,0.30)';
    for (const b of data.buildings) {
      x.beginPath();
      b.p.forEach(([wx, wz], i) => (i ? x.lineTo(px(wx), pz(wz)) : x.moveTo(px(wx), pz(wz))));
      x.closePath(); x.fill();
    }
    x.strokeStyle = 'rgba(255,214,150,0.95)'; x.lineWidth = 2.2;
    x.beginPath();
    this.axis.p.forEach(([wx, wz], i) => (i ? x.lineTo(px(wx), pz(wz)) : x.moveTo(px(wx), pz(wz))));
    x.stroke();
    return c;
  }

  update(S, dt) {
    this._t += dt;
    if (this._t < 0.25) return;         // a quarter-second is plenty for a label
    this._t = 0;

    // nearest named building, weighted so a big mall wins over a small shophouse
    let best = null, bestD = Infinity;
    for (const p of this.places) {
      const d = Math.hypot(p.x - S.x, p.z - S.z) - Math.min(60, Math.sqrt(p.a) * 0.5);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (this.el) {
      const label = best && bestD < 90 ? best.n : 'Orchard Road';
      if (label !== this.current) { this.current = label; this.el.textContent = label; }
    }

    if (this.mapCtx && this.base) {
      const S2 = this.map.width;
      const g = this.mapCtx;
      g.clearRect(0, 0, S2, S2);
      g.drawImage(this.base, 0, 0);
      const x = this.px(S.x), z = this.pz(S.z);
      // heading wedge
      g.save(); g.translate(x, z); g.rotate(-S.heading);
      g.fillStyle = 'rgba(255,214,150,0.28)';
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 16, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5); g.closePath(); g.fill();
      g.restore();
      g.fillStyle = '#ffd696';
      g.beginPath(); g.arc(x, z, 3.4, 0, Math.PI * 2); g.fill();
    }
  }
}
