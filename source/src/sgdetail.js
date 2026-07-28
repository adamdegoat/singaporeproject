// The details that make a street read as Singapore rather than generic Asia:
// an ERP gantry, an overhead pedestrian bridge, a planted central median,
// banner-hung lamp posts, a taxi stand, and building signage.
//
// No brand marks anywhere: signage is colour and form only.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance, SignAtlas } from './tex.js';
import { MAT, groundAt, Merger } from './city.js';

const SIGN_COLS = [0xb5372e, 0x1f4f7a, 0xd6a53c, 0x2f6b4f, 0x7a3f6d,
                   0xcf6b3a, 0x2b2f33, 0xa8324f, 0x3d6f8f];
const BANNER_COLS = [0xb23a2e, 0x2f6b8f, 0xd0a03a, 0x357a55, 0x8a3f70];

function yawMesh(geo, mat, x, y, z, ang) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = ang;
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ---------------- ERP gantry ---------------- */
// Two portal legs, a deep beam, the antenna heads and the camera box. Nothing
// else on a Singapore road looks like this.
function erpGantry(world, px, pz, ang, width, surveyed = false) {
  const g = new THREE.Group();
  const steel = MAT.metal, dark = MAT.darkMetal;

  // THE SPAN IS SURVEYED. THE LEG REACH IS NOT.
  //
  // LTA's line spans the CHARGED LANES, and a road is often wider than that —
  // a bus lane, a slip road, the flare into a junction. Planting the legs at a
  // fixed span/2 + 1.2 put 6 of 30 columns in live traffic. So the centre and
  // the bearing, which are real data, are kept exactly, and the only number
  // that was ever a construction detail is searched outward until both legs
  // stand clear. If nine metres of reach is not enough, nothing is built:
  // a failed search must skip, never fall back to the value it was asked to fix.
  let half = width / 2 + 1.2;
  if (window.__onRoad) {
    const legClear = (h) => ![-1, 1].every((sgn) => {
      const lx = px + Math.cos(ang) * sgn * h, lz = pz - Math.sin(ang) * sgn * h;
      return !window.__onRoad(lx, lz, 0);
    });
    if (legClear(half)) {
      let found = 0;
      for (let h = half + 0.4; h <= width / 2 + 9; h += 0.4) {
        if (!legClear(h)) { found = h; break; }
      }
      if (!found) return;
      half = found;
    }
  }
  // the beam has to reach whatever the legs did
  width = Math.max(width, half * 2 - 2.4);

  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.CylinderGeometry(0.22, 0.28, 7.4, 10), steel, sgn * half, 3.7, 0, 0));
    g.add(yawMesh(new THREE.BoxGeometry(1.2, 0.35, 1.2), MAT.conc, sgn * half, 0.18, 0, 0));
  }
  // main beam plus a lower service beam
  g.add(yawMesh(new THREE.BoxGeometry(width + 2.8, 0.85, 0.55), steel, 0, 7.2, 0, 0));
  g.add(yawMesh(new THREE.BoxGeometry(width + 2.8, 0.28, 0.32), steel, 0, 6.4, 0, 0));
  // antenna heads over each lane, angled down at the traffic
  const lanes = Math.max(3, Math.round(width / 3.4));
  for (let i = 0; i < lanes; i++) {
    const lx = -width / 2 + (i + 0.5) * (width / lanes);
    const head = yawMesh(new THREE.BoxGeometry(0.62, 0.3, 0.85), dark, lx, 6.75, 0.5, 0);
    head.rotation.x = 0.42;
    g.add(head);
  }
  // camera housings and the amber warning panel
  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.BoxGeometry(0.4, 0.4, 0.75), dark, sgn * (half - 1.4), 6.9, -0.5, 0));
  }
  const panel = yawMesh(new THREE.BoxGeometry(2.4, 0.9, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1c1f22, emissive: 0xc98a1e, emissiveIntensity: 0.55 }),
    0, 8.1, 0.1, 0);
  g.add(panel);

  // A SURVEYED gantry is not nudged. Every other structure here is pushed clear
  // of the carriageway, because its position came from a rule and a rule can put
  // it in the traffic. A gantry's whole job is to span the carriageway, and its
  // position now comes from LTA's own line across it: pushing that one 18m to
  // the kerb would take real data and make it wrong. Its legs stand at
  // width/2 + 1.2, which is outside the road by construction.
  let px2 = px, pz2 = pz;
  if (!surveyed) {
    const mv2 = window.__pushClear ? window.__pushClear(px, pz, -0.6, 18) : [px, pz];
    if (!mv2) return;
    [px2, pz2] = mv2;
  }
  g.position.set(px2, groundAt(px2, pz2), pz2);
  g.rotation.y = ang;
  world.add(g);
}

/* ---------------- overhead pedestrian bridge ---------------- */
function pedBridge(world, px, pz, ang, width) {
  const g = new THREE.Group();
  const steel = MAT.metal, deck = MAT.conc;
  const span = width + 14;
  g.add(yawMesh(new THREE.BoxGeometry(span, 0.42, 2.6), deck, 0, 6.0, 0, 0));
  g.add(yawMesh(new THREE.BoxGeometry(span, 0.16, 3.0), MAT.trim, 0, 8.6, 0, 0));   // roof
  // parapets and roof posts
  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.BoxGeometry(span, 1.05, 0.1), steel, 0, 6.75, sgn * 1.3, 0));
    for (let i = 0; i <= 10; i++) {
      const x = -span / 2 + (i / 10) * span;
      g.add(yawMesh(new THREE.CylinderGeometry(0.055, 0.055, 2.4, 6), steel, x, 7.4, sgn * 1.3, 0));
    }
  }
  // stair towers at each end
  for (const sgn of [-1, 1]) {
    const sx = sgn * (span / 2 - 1.0);
    g.add(yawMesh(new THREE.BoxGeometry(2.6, 6.0, 2.8), deck, sx, 3.0, sgn * 3.2, 0));
    for (let s = 0; s < 12; s++) {
      g.add(yawMesh(new THREE.BoxGeometry(2.2, 0.16, 0.34), deck,
        sx, 0.5 + s * 0.46, sgn * (1.9 + s * 0.2), 0));
    }
  }
  // real OSM coordinate, often mapped on the kerb line: nudge it clear of the
  // carriageway rather than dropping a shelter into the traffic
  const mv2 = window.__pushClear ? window.__pushClear(px, pz, -0.6, 18) : [px, pz];
  if (!mv2) return;
  const [px2, pz2] = mv2;
  g.position.set(px2, groundAt(px2, pz2), pz2);
  g.rotation.y = ang;
  world.add(g);
}

/* ---------------- MRT entrance ---------------- */
// A glazed canopy over a stair going down, the blue-and-red station totem, and
// a railed opening. Every Singaporean recognises this from fifty metres.
function mrtEntrance(world, px, pz, ang, label) {
  const g = new THREE.Group();
  const steel = MAT.metal, conc = MAT.conc;
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xa8c0cf, roughness: 0.12, metalness: 0.25,
    transparent: true, opacity: 0.62, side: THREE.DoubleSide,
  });

  // the opening in the pavement, with a stair running down into it
  g.add(yawMesh(new THREE.BoxGeometry(7.4, 0.4, 5.2), conc, 0, -0.2, 0, 0));
  for (let k = 0; k < 9; k++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.17, 0.42), conc);
    st.position.set(0, -0.28 - k * 0.17, -1.6 + k * 0.42);
    st.receiveShadow = true; g.add(st);
  }
  // a dark void under the canopy so it reads as going somewhere
  g.add(yawMesh(new THREE.BoxGeometry(4.8, 0.1, 3.2),
    new THREE.MeshBasicMaterial({ color: 0x0d1114 }), 0, -1.9, 1.4, 0));

  // railed edges around three sides
  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.BoxGeometry(0.07, 0.05, 5.0), steel, sgn * 2.6, 1.05, 0, 0));
    g.add(yawMesh(new THREE.BoxGeometry(0.06, 0.04, 5.0), steel, sgn * 2.6, 0.66, 0, 0));
    for (let k = 0; k < 4; k++) {
      g.add(yawMesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 6), steel,
        sgn * 2.6, 0.52, -2.2 + k * 1.5, 0));
    }
  }

  // the curved glass canopy
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 6.6, 16, 1, true, Math.PI * 0.08, Math.PI * 0.84),
    glassMat);
  shell.rotation.z = Math.PI / 2;
  shell.position.set(0, 2.5, 0);
  shell.castShadow = true;
  g.add(shell);
  for (let k = 0; k <= 5; k++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.05, 5, 12, Math.PI * 0.84), steel);
    rib.rotation.y = Math.PI / 2;
    rib.rotation.z = Math.PI * 0.08;
    rib.position.set(-3.3 + k * 1.32, 2.5, 0);
    g.add(rib);
  }

  // the station totem: red over blue, with the station name
  const totem = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.3, 1.05), MAT.darkMetal);
  totem.position.set(4.3, 1.65, 0); totem.castShadow = true; g.add(totem);
  const faceTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 400;
    const x = c.getContext('2d');
    x.fillStyle = '#c8102e'; x.fillRect(0, 0, 128, 130);
    x.fillStyle = '#00358e'; x.fillRect(0, 130, 128, 270);
    x.fillStyle = '#ffffff';
    x.font = '700 30px ui-sans-serif, system-ui, Helvetica, Arial';
    x.textAlign = 'center';
    x.fillText('MRT', 64, 82);
    x.save(); x.translate(64, 265); x.rotate(-Math.PI / 2);
    let size = 30;
    do { x.font = `600 ${size}px ui-sans-serif, system-ui, Helvetica, Arial`; size -= 2; }
    while (x.measureText(label.toUpperCase()).width > 230 && size > 12);
    x.fillText(label.toUpperCase(), 0, 8);
    x.restore();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  for (const sgn of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 3.15),
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 }));
    face.position.set(4.3 + sgn * 0.18, 1.65, 0);
    face.rotation.y = sgn > 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(face);
  }

  // real OSM coordinate, often mapped on the kerb line: nudge it clear of the
  // carriageway rather than dropping a shelter into the traffic
  const mv2 = window.__pushClear ? window.__pushClear(px, pz, -0.6, 18) : [px, pz];
  if (!mv2) return;
  const [px2, pz2] = mv2;
  g.position.set(px2, groundAt(px2, pz2), pz2);
  g.rotation.y = ang;
  world.add(g);
}

/* ---------------- main placement pass ---------------- */
export function buildSgDetail(world, axis, data, isBlocked) {
  const atlas = new SignAtlas(THREE);
  const signs = new Merger();
  // where is the street divided? one-way primary/secondary ways running as a
  // pair are how OSM records a dual carriageway
  const dualSegs = [];
  for (const r of (data.roads || [])) {
    if (!r.oneway) continue;
    if (!['primary', 'secondary', 'trunk', 'tertiary'].includes(r.k)) continue;
    for (let i = 0; i < r.p.length - 1; i++) dualSegs.push([r.p[i], r.p[i + 1]]);
  }
  const hasMedianAt = (x, z) => {
    for (const [a, b] of dualSegs) {
      const vx = b[0] - a[0], vz = b[1] - a[1];
      const L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const dx = x - (a[0] + vx * t), dz = z - (a[1] + vz * t);
      if (dx * dx + dz * dz < 26 * 26) return true;
    }
    return false;
  };
  window.__dualSegs = dualSegs.length;

  // direction of the road nearest a point, so things placed off the main axis
  // are still square to the street they belong to
  const nearestRoadDir = (x, z) => {
    let bd = Infinity, dir = [0, 1];
    for (const r of (data.roads || [])) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      const q2 = r.p;
      for (let i = 0; i < q2.length - 1; i++) {
        const [x1, z1] = q2[i], [x2, z2] = q2[i + 1];
        const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
        let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
        t = Math.max(0, Math.min(1, t));
        const d = (x - (x1 + vx * t)) ** 2 + (z - (z1 + vz * t)) ** 2;
        if (d < bd) { bd = d; dir = [vx, vz]; }
      }
    }
    return dir;
  };

  // MRT entrances at the coordinates OSM records for them, rather than at two
  // arbitrary points along the street.
  let realMrt = 0;
  for (const m of (data.mrt || [])) {
    if (m.kind !== 'subway_entrance') continue;
    const [mx, mz] = m.p;
    let bi = 0, bd = Infinity, bt = 0;
    const P = axis.p;
    for (let i = 0; i < P.length - 1; i++) {
      const [x1, z1] = P[i], [x2, z2] = P[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((mx - x1) * vx + (mz - z1) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const d = (mx - (x1 + vx * t)) ** 2 + (mz - (z1 + vz * t)) ** 2;
      if (d < bd) { bd = d; bi = i; bt = t; }
    }
    // Entrances up to the edge of the dressed area, not just the ones on the
    // main street: Dhoby Ghaut and Somerset put exits a long way down the side
    // roads, and they are real places you ride past.
    if (Math.sqrt(bd) > 230) continue;
    let vx, vz;
    if (Math.sqrt(bd) < 60) {
      const [x1, z1] = P[bi], [x2, z2] = P[bi + 1];
      vx = x2 - x1; vz = z2 - z1;
    } else {
      // far from the axis, face the street it actually sits on
      const seg = nearestRoadDir(mx, mz);
      vx = seg[0]; vz = seg[1];
    }
    const L = Math.hypot(vx, vz) || 1;
    const ang = Math.atan2(vx / L, vz / L);
    const label = (m.n || 'MRT').replace(/\s*(MRT|Station|Exit).*$/i, '') || 'MRT';

    // Most Orchard exits are INSIDE a mall — Orchard Exit C is inside ION,
    // Somerset Exit B inside 313, Dhoby Ghaut Exit E inside Plaza Singapura —
    // and the map node sits where the escalator is, not where the door is.
    // Drawing a glass street canopy there buries it in masonry: 43 of 62 were.
    // The door is on the facade, so walk outward until the point is clear of
    // buildings, and build nothing if there is nowhere clear, because an
    // entrance that is not on a pavement is not an entrance.
    let ex = mx, ez = mz;
    if (isBlocked && isBlocked(ex, ez)) {
      let ok = null;
      for (let r = 2; r <= 26 && !ok; r += 2) {
        for (let a2 = 0; a2 < 16; a2++) {
          const th = (a2 / 16) * Math.PI * 2;
          const tx = mx + Math.cos(th) * r, tz = mz + Math.sin(th) * r;
          if (isBlocked(tx, tz)) continue;
          ok = [tx, tz]; break;
        }
      }
      if (!ok) continue;
      [ex, ez] = ok;
    }
    mrtEntrance(world, ex, ez, ang, label);
    realMrt++;
  }
  window.__realMrt = realMrt;

  // Overhead bridges at the positions OSM records, spanning the way it maps.
  let realBridges = 0;
  for (const line of (data.bridges || [])) {
    if (line.length < 2) continue;
    let len = 0;
    for (let i = 0; i < line.length - 1; i++) {
      len += Math.hypot(line[i + 1][0] - line[i][0], line[i + 1][1] - line[i][1]);
    }
    const a = line[0], b = line[line.length - 1];
    const straight = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // a real overhead crossing spans the road: short or twisty ways are ramps,
    // stairs or kerb cuts, and building a bridge on them drops stair towers
    // into the carriageway
    if (straight < 22 || len > straight * 1.6) continue;
    // and it must actually cross a carriageway. A 37m footway bridge over a
    // canal is a bridge in the map's sense and not a pedestrian overpass, and
    // building an overpass on it puts a deck and two stair towers over water.
    // Sampled ALONG the span, because the deck crosses the road between its
    // supports and its end points are on the pavement either side.
    {
      let spans = false;
      const L2 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      for (let t = 0; t <= L2 && !spans; t += 1.5) {
        const x = a[0] + (b[0] - a[0]) * (t / L2), z = a[1] + (b[1] - a[1]) * (t / L2);
        if (window.__onRoad && window.__onRoad(x, z, 0)) spans = true;
      }
      if (!spans) continue;
    }
    const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2;
    const ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
    pedBridge(world, cx, cz, ang + Math.PI / 2, Math.max(16, straight - 14));
    realBridges++;
  }
  window.__realBridges = realBridges;

  // The real ERP gantries, from LTA's published layer.
  //
  // Placed here rather than in the axis walk because a gantry belongs to a
  // carriageway, not to the district's main street: three of the ten in this
  // region span Orchard Turn, Killiney Road and Clemenceau Avenue. Built once
  // for the whole scene, so the flag stops it being drawn twice when the region
  // has two axes.
  if (!window.__erpDone) {
    window.__erpDone = true;
    for (const g of (data.gantries || [])) {
      erpGantry(world, g.p[0], g.p[1], g.a, g.w, true);
      window.__realErp = (window.__realErp || 0) + 1;
    }
  }

  const pts = axis.p, half = axis.w / 2;
  const stats = { erp: 0, bridges: realBridges, banners: 0, medianPlants: 0, roofSigns: 0, banners2: 0, mrt: realMrt };

  const bannerT = [], medianKerb = [], medianShrub = [], medianPalm = [];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;

      // Planted median only where the street is actually a dual carriageway.
      // A continuous median down every metre was an invention; OSM maps the
      // divided sections as one-way pairs, so that is what we follow.
      if (hasMedianAt(px, pz)) {
        if (acc % 3 === 0) medianKerb.push([px, 0.14, pz, ang]);
        if (acc % 7 === 0) medianShrub.push([px + nx * rand(-0.45, 0.45), 0.72, pz + nz * rand(-0.45, 0.45), ang]);
        if (acc % 46 === 0) medianPalm.push([px, 0, pz, ang]);
      }

      // banners on the lamp columns
      if (acc % 34 === 8) {
        for (const sgn of [-1, 1]) {
          const bx = px + nx * (half + 0.4) * sgn, bz = pz + nz * (half + 0.4) * sgn;
          if (!isBlocked(bx, bz)) bannerT.push([bx + nx * 0.28 * sgn, 5.4, bz + nz * 0.28 * sgn, ang]);
        }
      }

      // one ERP gantry and two pedestrian bridges along the stretch
      // ERP gantries are no longer placed here. They used to go in at arclengths
      // 300 and 700 with the axis's own width, which are three invented numbers
      // per gantry. LTA publishes every one of them as a surveyed line across
      // the carriageway, so the position, the bearing AND the span are real now
      // — see the block after this loop, and data/gantries.py.

    }
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const cc = new THREE.Color();
  const emit = (geo, mat, list, fn, colFn) => {
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((r, i) => {
      fn(r); m.compose(p, q, s); im.setMatrixAt(i, m);
      if (colFn) im.setColorAt(i, colFn());
    });
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = false; im.receiveShadow = true;
    world.add(im);
  };
  const yaw = (r) => { p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };

  emit(new THREE.BoxGeometry(2.1, 0.34, 3.0), MAT.kerb, medianKerb, yaw);
  emit(new THREE.SphereGeometry(0.66, 7, 5),
    new THREE.MeshLambertMaterial({ color: 0x3f5c33 }), medianShrub, (r) => {
      p.set(r[0], groundAt(r[0], r[2]) + 0.72, r[2]); q.identity(); s.set(1, 0.78, 1);
    });
  s.set(1, 1, 1);
  stats.medianPlants = medianShrub.length;

  // slim median palms: trunk plus a fan of fronds
  emit(new THREE.CylinderGeometry(0.14, 0.2, 6.4, 7), MAT.trunk, medianPalm, (r) => {
    p.set(r[0], groundAt(r[0], r[2]) + 3.2, r[2]); q.identity();
  });
  const frond = [];
  for (const [x, , z] of medianPalm) {
    for (let k = 0; k < 7; k++) frond.push([x, 6.3, z, (k / 7) * Math.PI * 2]);
  }
  emit(new THREE.PlaneGeometry(3.2, 0.8), MAT.leaf, frond, (r) => {
    p.set(r[0] + Math.sin(r[3]) * 1.4,
          groundAt(r[0], r[2]) + r[1] - 0.35,
          r[2] + Math.cos(r[3]) * 1.4);
    e.set(-0.95, r[3] + Math.PI / 2, 0, 'YXZ'); q.setFromEuler(e);
  });

  // lamp-post banners, alternating colours
  emit(new THREE.BoxGeometry(0.06, 1.6, 0.62),
    new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }),
    bannerT, yaw, () => cc.setHex(pick(BANNER_COLS)));
  stats.banners = bannerT.length;

  /* ---------------- tenant signage: moved to shopfront.js ---------------- */
  // This used to draw a board at each tenant's own map coordinate, nudged 1.2m
  // toward the nearest road. A mall tenant's node is in the middle of the mall,
  // so 1,505 of the 1,642 boards were built inside the masonry — median 9.2m
  // past the facade — and every one of them was drawn whether the shop was on
  // the street, on the fourth floor or in the second basement.
  //
  // A tenant now goes on the facade its shop actually meets the street at, in
  // a real shop bay, or it is not drawn. See src/shopfront.js. It runs once for
  // the whole district rather than once per axis, which is also why it is not
  // here: this function is called for each axis in turn.

  /* ---------------- building signage ---------------- */
  // Rooftop sign boxes on the taller blocks and vertical banner signs down the
  // corners of the mid-rise ones. Colour and form only, no lettering.
  const roofSign = [], vertSign = [];
  for (const b of data.buildings) {
    if (b.a < 700) continue;
    let cx = 0, cz = 0;
    for (const q2 of b.p) { cx += q2[0]; cz += q2[1]; }
    cx /= b.p.length; cz /= b.p.length;

    // longest street-facing edge
    let bi = 0, bl = 0;
    for (let i = 0; i < b.p.length; i++) {
      const a = b.p[i], c = b.p[(i + 1) % b.p.length];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (L > bl) { bl = L; bi = i; }
    }
    const a = b.p[bi], c = b.p[(bi + 1) % b.p.length];
    const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2;
    const ang = Math.atan2(c[0] - a[0], c[1] - a[1]);
    const oX = mx - cx, oZ = mz - cz, oL = Math.hypot(oX, oZ) || 1;

    // named buildings get their name on the fascia, which is what actually
    // lets you tell where you are
    if (b.n && bl > 14) {
      const bgc = pick(SIGN_COLS);
      const boardW = Math.min(26, bl * 0.55), boardH = boardW * 0.25;
      const sy = Math.min(b.h - 2.2, 7.4);
      const rot = ang + Math.PI / 2;
      const uv = atlas.add(b.n, '#' + bgc.toString(16).padStart(6, '0'), '#f4f1ea');
      const face = atlas.plane(boardW, boardH, uv);
      face.rotateY(rot);
      face.translate(mx + (oX / oL) * 1.05, sy, mz + (oZ / oL) * 1.05);
      signs.add(face, uv.mat, mx, mz);
      const back = new THREE.BoxGeometry(boardW + 0.5, boardH + 0.5, 0.3);
      back.rotateY(rot);
      back.translate(mx + (oX / oL) * 0.85, sy, mz + (oZ / oL) * 0.85);
      signs.add(back, MAT.darkMetal, mx, mz);
      (window.__signage = window.__signage || [])
        .push({ kind: 'name', x: mx, z: mz, text: b.n });
      stats.nameSigns = (stats.nameSigns || 0) + 1;
    }

    if (b.h > 34 && chance(0.55)) {
      roofSign.push([mx + (oX / oL) * 0.6, b.h + 2.2, mz + (oZ / oL) * 0.6, ang + Math.PI / 2,
        Math.min(16, bl * 0.4)]);
    }
    if (b.h > 14 && bl > 12 && chance(0.7)) {
      const vx2 = mx + (oX / oL) * 1.1, vz2 = mz + (oZ / oL) * 1.1;
      // a banner hanging over the carriageway is something you ride into
      if (!isBlocked(vx2, vz2)) {
        vertSign.push([vx2, 9.5, vz2, ang + Math.PI / 2]);
      }
    }
  }
  // rooftop boxes vary in width, so scale per instance
  if (roofSign.length) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 3.2, 0.5),
      new THREE.MeshStandardMaterial({ roughness: 0.6 }), roofSign.length);
    roofSign.forEach((r, i) => {
      p.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
      s.set(r[4], 1, 1);
      m.compose(p, q, s); im.setMatrixAt(i, m);
      im.setColorAt(i, cc.setHex(pick(SIGN_COLS)));
    });
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = true; world.add(im);
    s.set(1, 1, 1);
  }
  emit(new THREE.BoxGeometry(0.9, 7.5, 0.35),
    new THREE.MeshStandardMaterial({ roughness: 0.55 }),
    vertSign, yaw, () => cc.setHex(pick(SIGN_COLS)));
  stats.roofSigns = roofSign.length;
  stats.banners2 = vertSign.length;

  stats.signPages = atlas.finish();
  stats.signMeshes = signs.flush(world);

  return stats;
}
