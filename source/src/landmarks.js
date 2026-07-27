// Bespoke massing for the buildings that carry the recognition.
//
// A generic extrusion gets the footprint right and the silhouette wrong. These
// recipes rebuild the handful of buildings people actually navigate by, from
// their real footprint, with the podium-and-tower arrangement each one has.
// Architecture is approximated for silhouette; no brand marks are reproduced.
import * as THREE from '../lib/three.module.js';
import { rand, R } from './tex.js';

// Is this point inside a carriageway? Asked through the window rather than
// imported from city.js, which already imports this module.
const onCarriageway = (x, z, margin = -0.6) =>
  (window.__onRoad ? window.__onRoad(x, z, margin) : false);

/* ---------------- footprint analysis ---------------- */
// principal axis of the footprint, so towers can be laid out along the long side
export function orientedBox(pts) {
  let cx = 0, cz = 0;
  for (const [x, z] of pts) { cx += x; cz += z; }
  cx /= pts.length; cz /= pts.length;
  let sxx = 0, sxz = 0, szz = 0;
  for (const [x, z] of pts) {
    const dx = x - cx, dz = z - cz;
    sxx += dx * dx; sxz += dx * dz; szz += dz * dz;
  }
  const ang = 0.5 * Math.atan2(2 * sxz, sxx - szz);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  let minU = 1e9, maxU = -1e9, minV = 1e9, maxV = -1e9;
  for (const [x, z] of pts) {
    const dx = x - cx, dz = z - cz;
    const u = dx * ux + dz * uz, v = -dx * uz + dz * ux;
    minU = Math.min(minU, u); maxU = Math.max(maxU, u);
    minV = Math.min(minV, v); maxV = Math.max(maxV, v);
  }
  return {
    cx, cz, ux, uz, ang,
    halfLong: (maxU - minU) / 2, halfShort: (maxV - minV) / 2,
    midU: (maxU + minU) / 2, midV: (maxV + minV) / 2,
  };
}

// a box placed in the footprint's own frame
// Every slab is positioned by an offset in the footprint's oriented frame. For
// an irregular footprint that frame is bigger than the building, so an offset
// of "half the short side plus a bit" can land outside the walls and in the
// street: Lucky Plaza's seven 79m facade fins were standing across Orchard Road,
// which is the row of pillars you meet at the spawn point. Any slab whose own
// footprint sits in a carriageway is not built.
function slab(api, ob, u, v, w, d, y0, h, mat, yaw = 0) {
  const x0 = ob.cx + ob.ux * u - ob.uz * v;
  const z0 = ob.cz + ob.uz * u + ob.ux * v;
  if (onCarriageway(x0, z0, 0.3)) return null;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const x = x0, z = z0;
  m.position.set(x, y0 + h / 2, z);
  m.rotation.y = -ob.ang + yaw;
  m.castShadow = true; m.receiveShadow = true;
  api.world.add(m);
  return m;
}

function crown(api, ob, u, v, w, d, y0, mat) {
  slab(api, ob, u, v, w * 1.06, d * 1.06, y0, 1.2, mat);
  slab(api, ob, u, v, w * 0.55, d * 0.55, y0 + 1.2, 3.0, mat);
}

// direction from the building centroid toward the nearest point on Orchard Road
function streetward(api, ob) {
  if (!api.axis) return { nx: 0, nz: 1, dist: 30 };
  let bx = 0, bz = 0, bd = Infinity;
  for (const [x, z] of api.axis.p) {
    const d = (x - ob.cx) ** 2 + (z - ob.cz) ** 2;
    if (d < bd) { bd = d; bx = x; bz = z; }
  }
  const dx = bx - ob.cx, dz = bz - ob.cz, L = Math.hypot(dx, dz) || 1;
  return { nx: dx / L, nz: dz / L, dist: L };
}

/* ---------------- recipes ---------------- */
// Each recipe: (api, b) => void. api gives extrude/materials/world.

function ngeeAnnCity(api, b) {
  const ob = orientedBox(b.p);
  const granite = api.mat.granite, glassT = api.mat.towerGlass, stone = api.mat.paleStone;
  // deep granite podium, the widest single mass on the street
  api.world.add(api.extrude(b.p, 30, granite));
  api.world.add(api.extrude(api.grow(b.p, 1.004), 1.6, stone, 30));
  // two square towers set along the long axis, stepped back from the podium edge
  const tw = Math.min(38, ob.halfShort * 1.05);
  for (const side of [-1, 1]) {
    const u = ob.midU + side * ob.halfLong * 0.40;
    slab(api, ob, u, ob.midV, tw, tw, 31.6, 107, granite);
    // vertical glazing strips on the two long faces
    for (const s2 of [-1, 1]) {
      slab(api, ob, u, ob.midV + s2 * (tw / 2 + 0.15), tw * 0.82, 0.4, 34, 100, glassT);
    }
    crown(api, ob, u, ob.midV, tw, tw, 138.6, stone);
  }

  // The civic forecourt: a raised granite plaza fronting Orchard Road that
  // holds 4,000 people and is where every event on this street happens. It is
  // as recognisable as the towers.
  const sw = streetward(api, ob);
  const ang = Math.atan2(sw.nx, sw.nz);
  const ex = ob.cx + sw.nx * ob.halfShort, ez = ob.cz + sw.nz * ob.halfShort;
  // how much pavement is actually there before the kerb? The first version
  // projected a fixed 17m and put the plaza 8.5m into Orchard Road.
  // try the full forecourt, then progressively narrower ones, until the whole
  // rectangle sits clear of every carriageway
  let width = 62, depth = 0;
  if (api.clearance) {
    for (const w of [62, 52, 44, 36, 28]) {
      const d = api.clearance.outward(ex, ez, sw.nx, sw.nz, 22, w / 2);
      if (d >= 6) { width = w; depth = Math.min(30, d); break; }
    }
  } else { depth = 17; }
  const px = ex + sw.nx * (depth / 2);
  const pz = ez + sw.nz * (depth / 2);
  if (depth >= 6) {
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, depth), api.mat.paving);
    plaza.position.set(px, 0.25, pz);
    plaza.rotation.y = ang;
    plaza.receiveShadow = true; api.world.add(plaza);
    for (let k = 0; k < 3; k++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, 1.1), api.mat.paleStone);
      st.position.set(px + sw.nx * (depth / 2 + k * 1.1), 0.42 - k * 0.16,
                      pz + sw.nz * (depth / 2 + k * 1.1));
      st.rotation.y = ang;
      st.receiveShadow = true; st.castShadow = true; api.world.add(st);
    }
    for (const sgn of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, depth * 0.88), granite);
      w.position.set(px - sw.nz * sgn * (width / 2 - 2), 0.68, pz + sw.nx * sgn * (width / 2 - 2));
      w.rotation.y = ang;
      w.castShadow = true; w.receiveShadow = true; api.world.add(w);
    }
  }
}

function ionOrchard(api, b) {
  const ob = orientedBox(b.p);
  const glass = api.mat.towerGlass, stone = api.mat.paleStone;
  // glazed podium with a deep projecting canopy over the frontage
  api.world.add(api.extrude(b.p, 34, glass));
  api.world.add(api.extrude(api.grow(b.p, 1.05), 1.1, stone, 20.5));
  api.world.add(api.extrude(api.grow(b.p, 1.02), 1.4, stone, 34));
  // the residential tower is slim and set well back
  const tw = Math.min(30, ob.halfShort * 0.75);
  slab(api, ob, ob.midU - ob.halfLong * 0.12, ob.midV, tw, tw * 0.78, 35.4, 176, glass);
  crown(api, ob, ob.midU - ob.halfLong * 0.12, ob.midV, tw, tw * 0.78, 211, stone);

  // The free-form canopy: a curved glass-and-metal shell wrapping the podium
  // frontage, carried on two 'tree columns'. Approximated as an open cylinder
  // section, which reads as the same sweep from the street.
  const sw = streetward(api, ob);
  const ang = Math.atan2(sw.nx, sw.nz);
  const ex2 = ob.cx + sw.nx * ob.halfShort, ez2 = ob.cz + sw.nz * ob.halfShort;
  const reach = api.clearance ? Math.min(5, api.clearance.outward(ex2, ez2, sw.nx, sw.nz, 5, 22)) : 4;
  const fx = ob.cx + sw.nx * (ob.halfShort + reach);
  const fz = ob.cz + sw.nz * (ob.halfShort + reach);
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xb9c4c9, roughness: 0.28, metalness: 0.45, side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(17, 17, Math.min(74, ob.halfLong * 1.9), 22, 1, true,
      Math.PI * 0.06, Math.PI * 0.62),
    shellMat);
  shell.rotation.z = Math.PI / 2;
  shell.rotation.y = ang;
  shell.position.set(fx, 20.5, fz);
  shell.castShadow = true;
  api.world.add(shell);
  // The two tree columns stand 17m either side of the entrance. That offset runs
  // along the frontage, and on this site part of it lands in Orchard Road, so
  // each one is tested where it actually stands. `reach` was being discarded
  // here with `void reach`, which is how they came to be in the carriageway.
  for (const sgn of [-1, 1]) {
    let off = 17;
    while (off > 7 && onCarriageway(fx - sw.nz * sgn * off, fz + sw.nx * sgn * off)) off -= 2.5;
    if (onCarriageway(fx - sw.nz * sgn * off, fz + sw.nx * sgn * off)) continue;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.9, 20, 10), shellMat);
    col.position.set(fx - sw.nz * sgn * off, 10, fz + sw.nx * sgn * off);
    col.castShadow = true; api.world.add(col);
  }
  void reach;
  // the LED media wall, one of the largest in Asia and the thing people photograph
  const media = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(58, ob.halfLong * 1.5), 13),
    new THREE.MeshStandardMaterial({
      color: 0x11161c, roughness: 0.25,
      emissive: 0x2f6fa8, emissiveIntensity: 0.85,
    }));
  media.position.set(ob.cx + sw.nx * (ob.halfShort + 0.4), 12.5,
                     ob.cz + sw.nz * (ob.halfShort + 0.4));
  media.rotation.y = ang;
  api.world.add(media);
}

function tangPlaza(api, b) {
  const ob = orientedBox(b.p);
  const jade = api.mat.jadeRoof, stone = api.mat.warmStone, glass = api.mat.towerGlass;
  // low retail podium under a green pitched roof — the most quoted silhouette
  api.world.add(api.extrude(b.p, 19, stone));
  const w = ob.halfShort * 2 * 0.98, l = ob.halfLong * 2 * 0.98;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, l) * 0.62, 9.5, 4), jade);
  roof.position.set(ob.cx, 23.6, ob.cz);
  roof.rotation.y = -ob.ang + Math.PI / 4;
  roof.castShadow = true;
  api.world.add(roof);
  // hotel tower behind, with its own small pitched cap
  const tw = Math.min(26, ob.halfShort * 0.9);
  const u = ob.midU + ob.halfLong * 0.42;
  slab(api, ob, u, ob.midV, tw, tw * 0.72, 19, 121, stone);
  for (let f = 0; f < 30; f++) {
    slab(api, ob, u, ob.midV - tw * 0.36, tw * 0.9, 0.25, 22 + f * 3.9, 2.3, glass);
  }
  // the "top knot": a finial spike above the pagoda roof
  const knob = new THREE.Mesh(new THREE.SphereGeometry(1.05, 10, 8), jade);
  knob.position.set(ob.cx, 28.9, ob.cz); knob.castShadow = true; api.world.add(knob);
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.4, 8), jade);
  spike.position.set(ob.cx, 31.0, ob.cz); spike.castShadow = true; api.world.add(spike);
  // a second, smaller tier so it reads as a pagoda rather than a single pitch
  const tier2 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, l) * 0.40, 6.0, 4), jade);
  tier2.position.set(ob.cx, 27.2, ob.cz);
  tier2.rotation.y = -ob.ang + Math.PI / 4;
  tier2.castShadow = true; api.world.add(tier2);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(tw * 0.75, 7, 4), jade);
  cap.position.set(
    ob.cx + ob.ux * u - ob.uz * ob.midV,
    143.5,
    ob.cz + ob.uz * u + ob.ux * ob.midV
  );
  cap.rotation.y = -ob.ang + Math.PI / 4;
  cap.castShadow = true;
  api.world.add(cap);
}

function paragon(api, b) {
  const ob = orientedBox(b.p);
  const stone = api.mat.paleStone, glass = api.mat.towerGlass;
  // redeveloped in the late 1990s into a glass-covered building, so the podium
  // is glazed with slim white mullion bands rather than clad in stone
  api.world.add(api.extrude(b.p, 26, glass));
  for (let f = 0; f < 7; f++) {
    api.world.add(api.extrude(api.grow(b.p, 1.008), 0.32, api.mat.trim, 4 + f * 3.4));
  }
  const tw = Math.min(30, ob.halfShort * 0.95);
  slab(api, ob, ob.midU + ob.halfLong * 0.25, ob.midV, tw, tw * 0.8, 26, 44, glass);
  crown(api, ob, ob.midU + ob.halfLong * 0.25, ob.midV, tw, tw * 0.8, 70, stone);
}

function glassBoxPodiumTower(api, b) {
  const ob = orientedBox(b.p);
  let glass = api.mat.towerGlass;
  const stone = api.mat.paleStone;
  // Wisma Atria's frontage reads distinctly light blue against its neighbours
  if (/wisma atria/i.test(b.n || '')) glass = api.mat.blueGlass;
  const podium = Math.min(30, b.h * 0.42);
  api.world.add(api.extrude(b.p, podium, glass));
  api.world.add(api.extrude(api.grow(b.p, 1.03), 1.0, stone, podium - 1.0));
  if (b.h > podium + 12) {
    const tw = Math.min(28, ob.halfShort * 0.85);
    slab(api, ob, ob.midU, ob.midV, tw, tw * 0.8, podium, b.h - podium, glass);
    crown(api, ob, ob.midU, ob.midV, tw, tw * 0.8, b.h, stone);
  }
}

function finnedSlab(api, b) {
  // older Orchard blocks: concrete frame, vertical fins, no curtain wall
  const ob = orientedBox(b.p);
  api.world.add(api.extrude(b.p, b.h, api.mat.warmStone));
  // fins on the street face only: the back of these blocks is never seen
  const sw = streetward(api, ob);
  const facing = (sw.nx * -Math.sin(ob.ang) + sw.nz * Math.cos(ob.ang)) >= 0 ? 1 : -1;
  const n = Math.max(5, Math.round(ob.halfLong * 2 / 6.0));
  for (let i = 0; i <= n; i++) {
    const u = ob.midU - ob.halfLong + (i / n) * ob.halfLong * 2;
    slab(api, ob, u, ob.midV + facing * (ob.halfShort + 0.2), 0.5, 0.9, 5, b.h - 6, api.mat.paleStone);
  }
  api.world.add(api.extrude(api.grow(b.p, 1.02), 1.1, api.mat.trim, b.h));
}

function wheelockPlace(api, b) {
  const ob = orientedBox(b.p);
  const glass = api.mat.towerGlass, stone = api.mat.paleStone;
  api.world.add(api.extrude(b.p, 22, glass));
  const tw = Math.min(26, ob.halfShort * 0.9);
  slab(api, ob, ob.midU, ob.midV, tw, tw * 0.82, 22, 66, glass);
  crown(api, ob, ob.midU, ob.midV, tw, tw * 0.82, 88, stone);

  // Kisho Kurokawa's cone-shaped glass atrium over the entrance — the single
  // thing that identifies this building from anywhere on the street
  const sw = streetward(api, ob);
  const cx = ob.cx + sw.nx * (ob.halfShort * 0.62);
  const cz = ob.cz + sw.nz * (ob.halfShort * 0.62);
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x9fb6c6, roughness: 0.12, metalness: 0.25,
    transparent: true, opacity: 0.72, side: THREE.DoubleSide,
  });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(11.5, 27, 18, 6, true), coneMat);
  cone.position.set(cx, 13.5, cz);
  cone.castShadow = true;
  api.world.add(cone);
  // ribs, so it reads as a glazed frame rather than a plain cone
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.22, 27.4, 0.22), api.mat.metal);
    rib.position.set(cx + Math.cos(a) * 5.6, 13.6, cz + Math.sin(a) * 5.6);
    rib.rotation.z = Math.cos(a) * 0.2;
    rib.rotation.x = -Math.sin(a) * 0.2;
    rib.castShadow = true;
    api.world.add(rib);
  }
}

// Singapore's first vertical mall: 12 glazed levels, a sculptural exterior with
// carved-out verandahs, and landscaped roof decks
function orchardCentral(api, b) {
  const ob = orientedBox(b.p);
  const glass = api.mat.towerGlass, stone = api.mat.paleStone;
  api.world.add(api.extrude(b.p, b.h, glass));
  // recessed pockets carved out of the facade
  const sw = streetward(api, ob);
  for (let k = 0; k < 5; k++) {
    const y = 12 + k * 9.5;
    if (y > b.h - 8) break;
    const rec = new THREE.Mesh(
      new THREE.BoxGeometry(Math.min(20, ob.halfLong * 0.9), 4.2, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x2c3339, roughness: 0.6 }));
    rec.position.set(ob.cx + sw.nx * (ob.halfShort - 0.6), y, ob.cz + sw.nz * (ob.halfShort - 0.6));
    rec.rotation.y = Math.atan2(sw.nx, sw.nz);
    api.world.add(rec);
    // the verandah slab that pokes out of each pocket
    const sh = new THREE.Mesh(new THREE.BoxGeometry(Math.min(20, ob.halfLong * 0.9), 0.35, 4.6), stone);
    sh.position.set(ob.cx + sw.nx * (ob.halfShort + 0.9), y - 2.0, ob.cz + sw.nz * (ob.halfShort + 0.9));
    sh.rotation.y = Math.atan2(sw.nx, sw.nz);
    sh.castShadow = true; api.world.add(sh);
  }
  // landscaped roof deck
  api.world.add(api.extrude(api.grow(b.p, 1.02), 1.0, stone, b.h));
  for (let k = 0; k < 7; k++) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0x3f5c33 }));
    bush.position.set(ob.cx + rand(-ob.halfLong * 0.6, ob.halfLong * 0.6), b.h + 2.0,
                      ob.cz + rand(-ob.halfShort * 0.6, ob.halfShort * 0.6));
    bush.scale.y = 0.7; bush.castShadow = true;
    api.world.add(bush);
  }
}

// Hotels read differently from malls: a slab tower of banded rooms sitting on a
// low podium, with a porte-cochere over a set-down driveway at the entrance.
// One recipe covers the eight hotels on this stretch.
function hotel(api, b) {
  const ob = orientedBox(b.p);
  const stone = api.mat.paleStone, warm = api.mat.warmStone, glass = api.mat.towerGlass;
  const podium = Math.min(14, b.h * 0.24);
  api.world.add(api.extrude(b.p, podium, warm));
  api.world.add(api.extrude(api.grow(b.p, 1.03), 0.9, stone, podium - 0.9));

  // the room tower: narrow, long, set back from the podium edge
  const tw = Math.min(20, ob.halfShort * 0.78);
  const tl = Math.min(ob.halfLong * 1.5, 54);
  const towerH = Math.max(12, b.h - podium);
  slab(api, ob, ob.midU, ob.midV, tl, tw, podium, towerH, warm);

  // banded balconies, the giveaway that it is rooms rather than offices
  // every other floor is enough to read as banded, at a fraction of the cost
  const floors = Math.max(4, Math.round(towerH / 3.3));
  for (let f = 1; f < floors; f += 2) {
    const y = podium + f * (towerH / floors);
    if (y > podium + towerH - 2) break;
    for (const sgn of [-1, 1]) {
      slab(api, ob, ob.midU, ob.midV + sgn * (tw / 2 + 0.18), tl * 0.96, 0.42, y - 0.2, 0.28, stone);
    }
  }
  // one continuous glazed band per face instead of one per floor
  for (const sgn of [-1, 1]) {
    slab(api, ob, ob.midU, ob.midV + sgn * (tw / 2 + 0.06), tl * 0.94, 0.1, podium + 1.2, towerH - 2.4, glass);
  }
  crown(api, ob, ob.midU, ob.midV, tl, tw, podium + towerH, stone);

  // porte-cochere: a deep flat canopy on columns over the set-down
  const sw = streetward(api, ob);
  const ang = Math.atan2(sw.nx, sw.nz);
  const ex = ob.cx + sw.nx * ob.halfShort, ez = ob.cz + sw.nz * ob.halfShort;
  // only build a set-down if there is forecourt to build it on
  const room = api.clearance ? api.clearance.outward(ex, ez, sw.nx, sw.nz, 11, 13) : 7;
  if (room > 6.5) {
    const depth = Math.min(13, room * 1.05);
    const px = ex + sw.nx * (depth / 2), pz = ez + sw.nz * (depth / 2);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, depth), stone);
    canopy.position.set(px, 6.0, pz);
    canopy.rotation.y = ang;
    canopy.castShadow = true; api.world.add(canopy);
    for (const ax of [-9, 9]) {
      for (const az of [-depth / 2.6, depth / 2.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 6.0, 10), stone);
        col.position.set(px - sw.nz * ax + sw.nx * az, 3.0, pz + sw.nx * ax + sw.nz * az);
        col.castShadow = true; api.world.add(col);
      }
    }
    const apron = new THREE.Mesh(new THREE.BoxGeometry(24, 0.12, depth * 1.12), api.mat.paving);
    apron.position.set(px, 0.2, pz);
    apron.rotation.y = ang;
    apron.receiveShadow = true; api.world.add(apron);
  }
}

// A shophouse: party walls, a five-foot-way colonnade at the ground floor, tall
// shuttered upper storeys and a pitched clay roof. 140-odd of these are what
// actually fills the back lanes.
export function shophouse(api, b) {
  const ob = orientedBox(b.p);
  const wall = api.mat.shophouse(b);
  const trim = api.mat.trim;
  const tile = api.mat.clayTile;
  // a stable per-building variant, so a terrace reads as individual houses
  let hh = 0;
  for (const [x, z] of b.p) hh = (hh * 33 + ((x * 3) | 0) + ((z * 17) | 0)) | 0;
  hh = Math.abs(hh);
  const variant = hh % 4;          // 0-2 pitched, 3 flat-roofed infill
  const hasAwning = (hh % 5) < 3;
  const groundH = 4.2;
  const upper = Math.max(3.4, b.h - groundH);
  const cx0 = ob.cx, cz0 = ob.cz;

  // the mass, set back at the ground floor to leave a covered walkway.
  // Everything here shares a material, so it all goes through the merger:
  // 139 shophouses as loose meshes cost 850 draw calls on their own.
  const sw = streetward(api, ob);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.86), groundH), api.mat.warmStone, cx0, cz0);
  api.merge(api.scaleUV(api.extrudeGeo(b.p, upper, groundH),
    Math.max(1, ob.halfLong / 4), Math.max(1, upper / 11)), wall, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.34, groundH - 0.34), trim, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.04), 0.5, b.h), trim, cx0, cz0);

  // colonnade: columns on the street edge carrying the upper floors
  const ang = Math.atan2(sw.nx, sw.nz);
  const span = ob.halfLong * 2;
  const n = Math.max(2, Math.round(span / 3.6));
  for (let i = 0; i <= n; i++) {
    const u = ob.midU - ob.halfLong + (i / n) * span;
    const cx = ob.cx + ob.ux * u - ob.uz * (ob.midV + sw.dist * 0);
    const cz = ob.cz + ob.uz * u + ob.ux * (ob.midV);
    const g = new THREE.BoxGeometry(0.34, groundH, 0.34);
    g.translate(cx + sw.nx * (ob.halfShort * 0.94), groundH / 2,
                cz + sw.nz * (ob.halfShort * 0.94));
    api.merge(g, trim, cx0, cz0);
  }

  // roof: mostly pitched clay, occasionally a flat-roofed later infill. A
  // shallow pitch — the first attempt used the full half-depth as the radius
  // and the roof came out taller than a storey.
  if (variant < 3) {
    const rad = Math.min(3.4, ob.halfShort * (0.5 + variant * 0.09));
    const rg = new THREE.CylinderGeometry(rad, rad, span * 1.02, 3, 1, false);
    rg.rotateZ(Math.PI / 2);
    rg.rotateY(-ob.ang);
    rg.translate(ob.cx, b.h + rad * 0.30, ob.cz);
    api.merge(rg, tile, cx0, cz0);
    // gable ends, so a row is read as separate houses rather than one long shed
    for (const sgn of [-1, 1]) {
      const gable = new THREE.CylinderGeometry(rad * 1.03, rad * 1.03, 0.3, 3, 1, false);
      gable.rotateZ(Math.PI / 2);
      gable.rotateY(-ob.ang);
      gable.translate(
        ob.cx + ob.ux * sgn * (span / 2), b.h + rad * 0.30, ob.cz + ob.uz * sgn * (span / 2));
      api.merge(gable, trim, cx0, cz0);
    }
  } else {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.05), 0.8, b.h + 0.5), trim, cx0, cz0);
  }

  // a canvas awning over the five-foot-way on most of them
  if (hasAwning) {
    const aw = new THREE.BoxGeometry(span * 0.92, 0.16, 2.0);
    aw.rotateY(-ob.ang);
    aw.translate(
      ob.cx + sw.nx * (ob.halfShort + 0.9), groundH - 0.55, ob.cz + sw.nz * (ob.halfShort + 0.9));
    api.merge(aw, api.mat.awning(b), cx0, cz0);
  }
}

/* ============ the Civic District ============
 *
 * Bras Basah arrived with no recipe coverage at all: every one of its landmarks
 * fell through to a facade picked by hashing the footprint, so the most
 * recognisable buildings in Singapore were grey boxes. These are built from
 * published descriptions, the same method as the Orchard recipes, and the same
 * caveat applies: a written description fixes material, massing and named
 * features, and cannot fix proportion or facade subdivision.
 */

// Esplanade. Two rounded space frames of triangulated glass, covered in more
// than 7,000 triangular aluminium sunshades: DP Architects with Michael Wilford
// & Partners. The shades are the entire identity of the building, and they are
// angled plates over a dome rather than spikes sticking out of one.
function esplanade(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.groundAt(ob.cx, ob.cz);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9db4c4, roughness: 0.12, metalness: 0.3,
    transparent: true, opacity: 0.66, side: THREE.DoubleSide,
  });
  const shade = new THREE.MeshStandardMaterial({ color: 0xa9a49a, roughness: 0.42, metalness: 0.55 });
  // the podium the two shells sit on
  api.world.add(api.extrude(b.p, Math.max(9, b.h * 0.55), api.mat.paleStone));
  const base = g0 + Math.max(9, b.h * 0.55);
  const rad = Math.min(ob.halfShort * 0.82, ob.halfLong * 0.34);

  for (const sgn of [-1, 1]) {
    const cx = ob.cx + ob.ux * sgn * ob.halfLong * 0.42;
    const cz = ob.cz + ob.uz * sgn * ob.halfLong * 0.42;
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(rad, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), glass);
    shell.position.set(cx, base, cz);
    shell.castShadow = true;
    api.world.add(shell);
    // The sunshades. MERGED GEOMETRY, not instances: as an InstancedMesh the
    // audit counted all 300 of them as street props and reported them inside a
    // building, off the ground and duplicated — 756 findings for something that
    // is building fabric, not furniture. Merged, they fall under the structure
    // checks where they belong, and cost no extra draw call.
    const N = 150;
    const up = new THREE.Vector3(0, 1, 0), nv = new THREE.Vector3();
    const q = new THREE.Quaternion();
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      const phi = Math.acos(1 - u * 0.9);
      const th = i * 2.399963;
      nv.set(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
      q.setFromUnitVectors(up, nv);
      const cone = new THREE.ConeGeometry(rad * 0.085, rad * 0.16, 3);
      cone.applyQuaternion(q);
      cone.translate(cx + nv.x * rad * 1.02, base + nv.y * rad * 1.02, cz + nv.z * rad * 1.02);
      api.merge(cone, shade, cx, cz);
    }
  }
}

// Raffles Hotel. Three storeys, white neo-Renaissance, verandahs on every
// floor, pitched roof, opened 1887 and a national monument.
function colonialHotel(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const white = new THREE.MeshStandardMaterial({ color: 0xece7dc, roughness: 0.86 });
  const h = Math.max(11, Math.min(b.h, 16));
  api.merge(api.extrudeGeo(b.p, h), white, cx0, cz0);
  // a verandah band at each floor, which is what reads from the street
  for (let f = 1; f <= 3; f++) {
    const y = (h / 3.4) * f;
    if (y > h - 1) break;
    api.merge(api.extrudeGeo(api.grow(b.p, 0.9), 0.26, y), api.mat.trim, cx0, cz0);
    api.merge(api.extrudeGeo(api.grow(b.p, 0.75), 0.14, y + 1.05), api.mat.metal, cx0, cz0);
  }
  // Pitched roof over the whole plan. CAPPED, because a three-sided cylinder's
  // radius sets its height as well as its span: sized straight off the
  // footprint, a wide building grew a roof taller than the building. The
  // shophouse recipe next door caps its own at 3.4m for the same reason.
  const rad = Math.min(ob.halfShort * 0.95, 5.5);
  const rg = new THREE.CylinderGeometry(rad, rad, ob.halfLong * 2 * 0.98, 3, 1, false);
  rg.rotateZ(Math.PI / 2);
  rg.rotateY(-ob.ang);
  rg.translate(cx0, api.groundAt(cx0, cz0) + h + rad * 0.26, cz0);
  api.merge(rg, api.mat.clayTile, cx0, cz0);
}

// The neoclassical civic set: the National Museum's rotunda under a fish-scale
// dome, and the National Gallery, which is the former Supreme Court's
// copper-green dome beside City Hall's row of Corinthian columns facing the
// Padang. Eighteen columns on City Hall, twenty-eight on the Supreme Court.
function civicDome(api, b, opts = {}) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const g0 = api.groundAt(cx0, cz0);
  const stone = new THREE.MeshStandardMaterial({ color: 0xe0dacb, roughness: 0.82 });
  const h = Math.max(14, Math.min(b.h, 26));
  api.merge(api.extrudeGeo(b.p, h), stone, cx0, cz0);
  // cornice
  api.merge(api.extrudeGeo(api.grow(b.p, 1.1), 0.9, h - 1.2), api.mat.trim, cx0, cz0);

  // the colonnade along the street frontage
  const sw = streetward(api, ob);
  const n = opts.columns || 18;
  const span = ob.halfLong * 2 * 0.86;
  const colH = h * 0.72;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1) - 0.5) * span;
    const px = cx0 + ob.ux * t + sw.nx * (ob.halfShort + 0.55);
    const pz = cz0 + ob.uz * t + sw.nz * (ob.halfShort + 0.55);
    if (onCarriageway(px, pz, -0.4)) continue;
    const col = new THREE.CylinderGeometry(0.62, 0.72, colH, 10);
    col.translate(px, api.groundAt(px, pz) + colH / 2, pz);
    api.merge(col, stone, cx0, cz0);
  }
  // the dome over the central rotunda
  const rad = Math.min(ob.halfShort * 0.55, 13);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(rad, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    new THREE.MeshStandardMaterial({
      color: opts.domeColor || 0x76a894, roughness: 0.44, metalness: 0.35,
    }));
  dome.position.set(cx0, g0 + h, cz0);
  dome.castShadow = true;
  api.world.add(dome);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.04, rad * 1.04, 3.2, 20), stone);
  drum.position.set(cx0, g0 + h + 1.6, cz0);
  api.world.add(drum);
}

function nationalMuseum(api, b) {
  // fish-scale tiles on the original dome, not the copper of the Supreme Court
  civicDome(api, b, { columns: 12, domeColor: 0xb9b2a4 });
}
function nationalGallery(api, b) { civicDome(api, b, { columns: 22, domeColor: 0x6f9e8b }); }

// A church or chapel: white walls, a steep roof, and the spire that is the only
// part visible from any distance. St Andrew's Cathedral and CHIJMES.
//
// The first version sized the roof from the footprint width, and since a
// three-sided cylinder's radius sets its HEIGHT as well as its span, St
// Andrew's grew a thirty-metre green prism that swallowed the whole block. Both
// the roof and the spire are proportioned from the building's own height now
// and capped, and the tower is seated on the ground rather than floated at a
// fraction of the wall.
function gothicChurch(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const white = new THREE.MeshStandardMaterial({ color: 0xf0ece1, roughness: 0.88 });
  // the nave itself is low; anything tall in a church is the tower
  const wall = Math.max(10, Math.min(b.h * 0.72, 17));
  api.merge(api.extrudeGeo(b.p, wall), white, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.5), 0.4, wall - 0.5), api.mat.trim, cx0, cz0);

  // The roof is built from the FOOTPRINT, as stepped insets, not as a prism
  // sized off the oriented bounding box. A box around an angled or cruciform
  // plan is longer than the plan itself, so the prism hung out over the
  // neighbours and read as a detached green tube floating above the walls.
  // Built from the footprint it cannot leave the building it belongs to.
  // grow() takes a SCALE, not an offset: a negative would mirror the polygon
  // through its own centre and put the roof on the wrong side of the church.
  let ring = b.p;
  for (const [f, y] of [[0.90, 0], [0.74, 1.35], [0.56, 2.7]]) {
    ring = api.grow(b.p, f);
    api.merge(api.extrudeGeo(ring, 1.5, wall + y), api.mat.jadeRoof, cx0, cz0);
  }

  // the tower at the street end of the nave, standing on the ground
  const sx = cx0 + ob.ux * ob.halfLong * 0.72, sz = cz0 + ob.uz * ob.halfLong * 0.72;
  const gs = api.groundAt(sx, sz);
  const tw = Math.min(3.2, ob.halfShort * 0.5);
  const towerH = Math.max(wall + 4, Math.min(b.h, 30));
  // A spire is the tallest thing a church has and it must not stand in the road.
  // The nave is inside its own footprint by construction; the tower is placed by
  // an offset along the long axis, which for a church set at an angle to the
  // street runs straight out into it.
  if (onCarriageway(sx, sz, -0.5)) return;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(tw * 2, towerH, tw * 2), white);
  tower.position.set(sx, gs + towerH / 2, sz);
  tower.rotation.y = -ob.ang;
  tower.castShadow = true;
  api.world.add(tower);
  const spireH = Math.min(towerH * 0.8, 16);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(tw * 1.2, spireH, 4), white);
  spire.position.set(sx, gs + towerH + spireH / 2, sz);
  spire.rotation.y = -ob.ang + Math.PI / 4;
  spire.castShadow = true;
  api.world.add(spire);
}

export const RECIPES = [
  // the Civic District.
  //
  // The patterns are narrower than they look, and each exclusion is a mistake
  // that was actually made: "Esplanade Theatre" and "Esplanade Concert Hall" are
  // halls INSIDE the complex, and matching them gave the building three separate
  // pairs of shells; "Grand Park City Hall" is a hotel that happens to carry the
  // words city hall, and it was handed a Corinthian colonnade and a copper dome.
  [/esplanade theatres on the bay/i, esplanade],
  [/raffles hotel|raffles singapore/i, colonialHotel],
  [/national museum/i, nationalMuseum],
  [/national gallery|(?<!grand park )(old )?city hall|supreme court/i, nationalGallery],
  [/cathedral|chijmes|st\.? ?andrew|church of|methodist church|saint joseph|presbyterian/i, gothicChurch],

  [/ngee ann city|takashimaya/i, ngeeAnnCity],
  [/ion orchard|orchard residences/i, ionOrchard],
  [/tang plaza|singapore marriott|^tangs/i, tangPlaza],
  [/paragon/i, paragon],
  [/wheelock/i, wheelockPlace],
  [/orchard central/i, orchardCentral],
  [/wisma atria|313|orchard gateway|shaw (house|centre)|mandarin gallery|the heeren/i, glassBoxPodiumTower],
  [/hotel|hyatt|hilton|marriott|four seasons|pullman|voco|royal plaza|pan pacific|regent|shangri|holiday inn|ibis|orchard rendezvous|concorde|mandarin orchard/i, hotel],
  [/lucky plaza|far east plaza|orchard towers|midpoint|palais|delfi|orchard plaza|cairnhill|tripleone|far east shopping|international building|liat|pacific plaza|scotts square|orchard building|forum the shopping|268 orchard|scape|design orchard|cathay cineleisure/i, finnedSlab],

  // Everything below was falling through to a facade picked by hashing the
  // footprint, which is how Plaza Singapura and The Centrepoint — two of the
  // malls people actually name when they describe Orchard Road — ended up as
  // generic blocks. 197 of the 264 named buildings had no recipe at all.
  [/plaza singapura|the centrepoint|centrepoint|the cathay|orchard gateway|holland/i,
   glassBoxPodiumTower],
  // hotels whose names do not contain the word "hotel", so the pattern above
  // never matched them
  [/conrad|the elizabeth|grand park|orchard grand|orchard parade|york |goodwood park|quincy|oasia|jen |m social|parkroyal|swissotel|carlton|peninsula|excelsior/i,
   hotel],
  // offices, schools and civic blocks: concrete frames with vertical fins, which
  // is what most of this stock actually is
  [/waterloo centre|wilkie edge|one sophia|penang road|lazada|cuppage|school of|lasalle|singapore management|nanyang academy|istana|the atrium|manulife|winsland|somerset house|orchard shopping/i,
   finnedSlab],
];

// Recipes whose buildings have no shopfront. A cathedral, a museum, a national
// gallery and a concert hall do not have a row of shop awnings along the
// pavement, and adding them was both wrong to look at and the source of 13
// duplicated props where two civic frontages met.
const NO_SHOPFRONT = new Set([esplanade, nationalMuseum, nationalGallery, gothicChurch, colonialHotel]);
export function hasShopfront(name) {
  const fn = recipeFor(name);
  return !fn || !NO_SHOPFRONT.has(fn);
}

export function recipeFor(name) {
  if (!name) return null;
  for (const [re, fn] of RECIPES) if (re.test(name)) return fn;
  return null;
}
