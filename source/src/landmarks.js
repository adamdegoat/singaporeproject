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

/* ---------------- texture scale ---------------- */
// Map a mesh's texture at a REAL SIZE, in metres.
//
// Measured 2026-07-28, and it was wrong in both directions at once:
//
//   BoxGeometry (every slab, so every tower)  UVs run 0..1 per face, so one
//     tile is stretched over the WHOLE face. Ngee Ann City's towers are 38m by
//     107m and texTowerGlass draws 12 floors, so each "floor" band was 8.9m
//     tall. The tower read as a dozen enormous stripes.
//   ExtrudeGeometry (every recipe podium)     three.js generates side-wall UVs
//     from raw vertex POSITIONS, which here are metres from the island origin.
//     Measured uSpan 7147 across a 236m building: the tile repeats once per
//     metre. On a 30m podium that is 240 floor lines over 7 storeys, which
//     averages out to flat colour and is why the podium looked untextured.
//
// This is the project's pattern #2 -- two numbers that should be compared and
// are not. The size a texture is DRAWN at and the size the thing IS were never
// the same number. Both fixes are the same one line: put the UVs in metres,
// then divide by the metres one tile is meant to cover.
//
// It takes an explicit size rather than guessing one, because "how big is a
// window" is a fact about the building, not about the geometry.
export function uvMetres(mesh, mH, mV) {
  const geo = mesh.isMesh ? mesh.geometry : mesh;
  const uv = geo.attributes.uv, pos = geo.attributes.position;
  if (!uv || !pos) return mesh;
  // Already mapped once (autoUV runs inside slab/extrude/merge). A researched
  // size overrides the material default by RATIO rather than compounding: the
  // UVs are metres/oldTile, so multiplying by oldTile/newTile lands them at
  // metres/newTile whatever came first.
  if (geo.userData.uvTile) {
    const [tw, th] = geo.userData.uvTile;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (tw / mH), uv.getY(i) * (th / mV));
    uv.needsUpdate = true;
    geo.userData.uvTile = [mH, mV];
    return mesh;
  }
  geo.userData.uvTile = [mH, mV];
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const sx = bb.max.x - bb.min.x, sy = bb.max.y - bb.min.y, sz = bb.max.z - bb.min.z;
  for (let i = 0; i < uv.count; i++) {
    // Which way is this vertex's face looking? A box has three pairs and the
    // horizontal run differs per pair, so scaling by one number stretches four
    // of the six faces. Pick the horizontal extent from the axis the face does
    // NOT face, using the normal where there is one.
    const n = geo.attributes.normal;
    const nx = n ? Math.abs(n.getX(i)) : 0;
    const ny = n ? Math.abs(n.getY(i)) : 0;
    const nz = n ? Math.abs(n.getZ(i)) : 1;
    let run = sx, rise = sy;
    if (ny > nx && ny > nz) { rise = sz; }        // a roof: v runs in z, not y
    else if (nx > nz) { run = sz; }               // a side face: u runs in z
    uv.setXY(i, uv.getX(i) * (run / mH), uv.getY(i) * (rise / mV));
  }
  uv.needsUpdate = true;
  return mesh;
}

// The same, for an extruded footprint, whose UVs are already in metres and
// offset by the district origin. Dividing puts one tile on mH by mV metres; the
// offset only shifts which part of the pattern lands where, which for a tiling
// stone is not something anyone can see.
export function uvMetresExtruded(mesh, mH, mV) {
  const geo = mesh.isMesh ? mesh.geometry : mesh;
  const uv = geo.attributes.uv;
  if (!uv) return mesh;
  const prior = geo.userData.uvTile;
  const [dw, dh] = prior ? [prior[0] / mH, prior[1] / mV] : [1 / mH, 1 / mV];
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * dw, uv.getY(i) * dh);
  }
  uv.needsUpdate = true;
  geo.userData.uvTile = [mH, mV];
  return mesh;
}

// The default texture scale for everything a recipe builds, applied inside
// slab(), api.extrude and api.merge so no recipe can forget it. Each material
// carries its tile size in metres (userData.tile, set beside the material);
// a researched size stated in the recipe still wins through uvMetres above.
// Before this, only Ngee Ann and Hilton were mapped at a real size and every
// other bespoke building had 8.9m floor bands or per-metre noise.
export function autoUV(mesh, mat) {
  const geo = mesh.isMesh ? mesh.geometry : mesh;
  const m = mat || (mesh.isMesh && mesh.material);
  if (!geo || !geo.attributes || !geo.attributes.uv) return mesh;
  if (geo.userData.uvTile) return mesh;
  if (!m || !m.map) return mesh;
  const tile = (m.userData && m.userData.tile) || [12, 12];
  const boxy = geo.type === 'BoxGeometry';
  return boxy ? uvMetres(mesh, tile[0], tile[1]) : uvMetresExtruded(mesh, tile[0], tile[1]);
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
  autoUV(m, mat);
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

// Ngee Ann City. Researched 2026-07-28 against archify.com/sg,
// raymondwoo.com/project/33 and eresources.nlb.gov.sg (Infopedia), which
// corrected two things this recipe had wrong and one thing NEXT.md had wrong:
//
//   The TOWERS are granite, not glass. "Twin brown polished granite towers";
//   the whole complex is "totally faced with granite as a finish". They were
//   drawn as a pale grey-blue curtain wall. On the widest frontage on Orchard
//   Road that is the biggest recognition error in the district.
//   The 3.8m x 3.2m panels are the TOWERS' module, not the podium's. NEXT.md
//   recorded them as podium cladding. The podium is pre-cast wall clad with
//   granite in situ; the towers are "3.8m by 3.2m granite pre-finished
//   concrete wall panels" over 28 floors.
//   The Great Wall is the architect's stated intent for the massing -- Raymond
//   Woo, "to reflect the dignity, solidity and strength of the Ngee Ann
//   Kongsi" -- which is a heavy battered wall with a projecting cap and a
//   buttress rhythm, not crenellation.
//
// And the recipe was 14m too tall: it hardcoded a 107m tower on top of a 31.6m
// podium, reaching 142.8m with the crown, for a building VERIFIED at 128.4m.
// Everything is derived from b.h now, so the researched figure is what gets
// built.
function ngeeAnnCity(api, b) {
  const ob = orientedBox(b.p);
  const granite = api.mat.granite, panel = api.mat.granitePanel, stone = api.mat.paleStone;
  const PANEL_W = 3.8, PANEL_H = 3.2;    // the real tower panel, in metres

  // THE GROUND THIS SITS ON. slab() and crown() take an ABSOLUTE y0 while every
  // extruded mass is seated on footingY, and this recipe mixed the two: the
  // towers were started at y=31.6 absolute while Orchard's ground here is 37m
  // above the datum, so they were embedded 27m into the podium and topped out
  // at 123.8m for a building verified at 128.4m above its own pavement. The
  // trap is already written up in NEXT.md from Lucky Plaza's bubble lift, and
  // this recipe has had it since the day it was written.
  const base = api.footingY(b.p);

  // deep granite podium, the widest single mass on the street. 7 retail floors.
  const podium = b.pod || 30;
  api.world.add(uvMetresExtruded(api.extrude(b.p, podium, granite), 34.2, podium));
  // the cap: the Great Wall reference is a heavy projecting course closing the
  // top of the wall, and it is what makes the podium read as a rampart rather
  // than a box with a lid
  api.world.add(api.extrude(api.grow(b.p, 1.004), 1.6, stone, podium));

  // two square towers set along the long axis, stepped back from the podium edge
  const tw = Math.min(38, ob.halfShort * 1.05);
  const towerH = Math.max(20, b.h - podium - 1.6 - 4.2);   // 4.2 = the crown
  for (const side of [-1, 1]) {
    const u = ob.midU + side * ob.halfLong * 0.40;
    const t = slab(api, ob, u, ob.midV, tw, tw, base + podium + 1.6, towerH, panel);
    if (t) uvMetres(t, PANEL_W, PANEL_H);
    crown(api, ob, u, ob.midV, tw, tw, base + podium + 1.6 + towerH, stone);
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
  // It is used properly now (it sets fx/fz above); the discard statement that
  // survived the fix has been removed, because a dead `void x` sitting under a
  // comment warning about dead `void x` is how the next reader concludes the
  // bug is still live.
  for (const sgn of [-1, 1]) {
    let off = 17;
    while (off > 7 && onCarriageway(fx - sw.nz * sgn * off, fz + sw.nx * sgn * off)) off -= 2.5;
    if (onCarriageway(fx - sw.nz * sgn * off, fz + sw.nx * sgn * off)) continue;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.9, 20, 10), shellMat);
    col.position.set(fx - sw.nz * sgn * off, 10, fz + sw.nx * sgn * off);
    col.castShadow = true; api.world.add(col);
  }
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

// PLAZA SINGAPURA. Researched 2026-07-28; sources in NEXT.md.
//
// The 2012 Benoy/RSP revamp is what it looks like now, and its whole identity is
// one move: undulating WHITE ALUMINIUM RIBBON BANDS curving around the building
// with unitised glass between them. MERO, who built the facade, list about
// 6,000 m2 of white aluminium coil "curving around the building" against
// 9,100 m2 of glass-and-metal panel. Seven retail floors above ground and two
// below; a 170m frontage to Orchard Road.
//
// Height in metres is genuinely not published anywhere — no skyscraper database
// entry, nothing in the Wikipedia infobox — so this is seven retail floors at
// mall height, and it is recorded as a storey-derived figure, not a surveyed one.
function plazaSingapura(api, b) {
  const ob = orientedBox(b.p);
  const glass = api.mat.blueGlass;
  const white = api.mat.paleStone;
  // the glazed mass
  api.world.add(api.extrude(b.p, b.h, glass));
  // The ribbons. Seven of them, alternating deep and shallow so the band
  // spacing reads as the wave it is rather than as floor lines — a constant
  // pitch would just look like the storey banding every other mall here has.
  const bands = 7;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const y = 2.2 + t * (b.h - 5.0);
    const out = 1.010 + (i % 2 ? 0.006 : 0.014);
    const th = i % 2 ? 0.55 : 0.95;
    api.world.add(api.extrude(api.grow(b.p, out), th, white, y));
  }
  // the triangular-grid glass entrance canopy, on the street face
  const sw = streetward(api, ob);
  const cw = Math.min(26, ob.halfLong * 1.1);
  const cx = ob.cx + sw.nx * (ob.halfShort + 1.4);
  const cz = ob.cz + sw.nz * (ob.halfShort + 1.4);
  if (!onCarriageway(cx, cz, 0.3)) {
    const can = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.4, 5.0), api.mat.towerGlass);
    can.position.set(cx, 7.4, cz);
    can.rotation.y = Math.atan2(sw.nx, sw.nz) + Math.PI / 2;
    can.castShadow = true;
    api.world.add(can);
  }
}

// LUCKY PLAZA. Researched 2026-07-28; sources in NEXT.md.
//
// Tower on podium, and the two halves look nothing alike: a six-storey retail
// podium in matte warm grey-beige panel grid, and a slender residential slab
// running to level 30, off-white, set well back at the rear so from across
// Orchard Road it reads as a wide box with a thin pale slab rising behind it.
//
// The signature is the BUBBLE LIFT: a projecting blue-glass shaft climbing the
// front facade with a faceted pointed base. Singapore's first glass lifts, and
// the one thing on this building nobody mistakes for anything else.
//
// Height in metres is not published either. 30 storeys, podium 1977, apartments
// 1981, BEP Akitek. No brand marks: the Far East rooftop logo and the gold
// lettering are deliberately not reproduced, the same rule the rest of the
// signage follows.
function luckyPlaza(api, b) {
  const ob = orientedBox(b.p);
  const podium = Math.min(26, b.h * 0.3);
  const beige = api.mat.warmStone;
  // the podium, and the horizontal slot-vent band above the shopfronts that
  // gives away the car park stacked inside it
  api.world.add(api.extrude(b.p, podium, beige));
  api.world.add(api.extrude(api.grow(b.p, 1.012), 0.5, api.mat.trim, podium - 3.2));
  api.world.add(api.extrude(api.grow(b.p, 1.006), 1.6, api.mat.darkMetal || api.mat.trim, podium - 2.6));
  // GROUND LEVEL HERE. Not zero — Lucky Plaza stands 26m up, and everything
  // below was drawn from y=0 while the podium was correctly seated, so the
  // bubble lift was buried with three metres showing. slab() and crown() take
  // an ABSOLUTE y0; the extruded masses use footingY. Mixing them is the same
  // "drawn at versus stands on" mistake that had the bike under the road.
  const base = api.footingY(b.p);

  // the residential slab, set BACK: the tower does not sit over the frontage.
  //
  // Positioned from the FOOTPRINT, not from the oriented box. The first version
  // offset from ob.midU/midV, and for a plan this irregular the box centre sits
  // outside the walls and over Orchard Road, so slab() refused it and the tower
  // silently never appeared. This is the trap already written down for the
  // church roof and the library slab, hit a third time.
  const sw = streetward(api, ob);
  const tw = Math.min(22, ob.halfShort * 0.9);
  let bestU = ob.midU, bestV = ob.midV, found = false;
  for (const fu of [-0.18, 0, 0.18, -0.34, 0.34]) {
    for (const fv of [-0.3, 0, 0.3]) {
      const u = ob.midU + ob.halfLong * fu, v = ob.midV + ob.halfShort * fv;
      const x = ob.cx + ob.ux * u - ob.uz * v, z = ob.cz + ob.uz * u + ob.ux * v;
      if (onCarriageway(x, z, 0.3)) continue;
      if (!pointInRing(x, z, b.p)) continue;          // must be over the plan
      bestU = u; bestV = v; found = true; break;
    }
    if (found) break;
  }
  if (found) {
    slab(api, ob, bestU, bestV, tw, tw * 0.62,
         base + podium, Math.max(18, b.h - podium), api.mat.paleStone);
  }

  // THE BUBBLE LIFT, on the street face, running the height of the podium and
  // a little above it
  //
  // Walked out from the centroid until it LEAVES the footprint, rather than
  // guessed at halfShort from the oriented box. For an irregular plan the box's
  // short half-width stops well inside the walls, and the lift ended up buried
  // in the podium with its cap showing above the roof.
  let lx = ob.cx, lz = ob.cz;
  for (let d = 2; d <= ob.halfLong + 20; d += 1.5) {
    const x = ob.cx + sw.nx * d, z = ob.cz + sw.nz * d;
    if (!pointInRing(x, z, b.p)) { lx = x + sw.nx * 1.0; lz = z + sw.nz * 1.0; break; }
  }
  if (!onCarriageway(lx, lz, 0.3)) {
    const gy = api.groundAt(lx, lz);
    const shaftH = podium + 3.0;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, shaftH, 7),
      api.mat.blueGlass);
    shaft.position.set(lx, gy + shaftH / 2, lz);
    shaft.castShadow = true;
    api.world.add(shaft);
    // the faceted pointed base it stands on
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 3.2, 7), api.mat.blueGlass);
    cone.position.set(lx, gy + 1.6, lz);
    cone.rotation.x = Math.PI;
    api.world.add(cone);
  }
}

// THE SINGAPORE FLYER. singaporeflyer.com publishes 165m overall, a 150m wheel
// and 28 capsules. The 15m difference is the clearance under the rim, which is
// the three-storey terminal building the wheel is mounted over -- so the wheel
// is NOT a 165m circle sitting on the ground, and drawing it that way buries a
// quarter of it. Capsules ride OUTBOARD of a slim ladder-truss rim.
function singaporeFlyer(api, b) {
  const ob = orientedBox(b.p);
  const base = api.footingY(b.p);
  const steel = api.mat.metal, glass = api.mat.blueGlass, pale = api.mat.paleStone;
  const TOTAL = Math.max(90, b.h);            // 165m
  const R = TOTAL * (150 / 165) / 2;          // 75m wheel radius
  const HUB = TOTAL - R;                      // rim clearance + radius

  // the three-storey terminal the wheel stands on
  api.world.add(api.extrude(b.p, Math.min(15, TOTAL * 0.09), pale));

  // the wheel sits in a plane; face it across the footprint's short axis so it
  // reads broadside from the bay, which is how it is always seen
  const nx = -ob.uz, nz = ob.ux;
  const cx = ob.cx, cz = ob.cz, cy = base + HUB;
  const ring = (rad, tube) => {
    const g = new THREE.TorusGeometry(rad, tube, 6, 44);
    g.rotateY(Math.atan2(nx, nz));
    g.translate(cx, cy, cz);
    api.merge(g, steel, cx, cz);
  };
  ring(R, 0.9);
  ring(R * 0.955, 0.55);
  // spokes as a cable fan, and the hub
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const ex = cx + ob.ux * Math.cos(a) * R, ez = cz + ob.uz * Math.cos(a) * R;
    const ey = cy + Math.sin(a) * R;
    const dx = ex - cx, dy = ey - cy, dz = ez - cz;
    const L = Math.hypot(dx, dy, dz) || 1;
    const g = new THREE.CylinderGeometry(0.16, 0.16, L, 4);
    g.translate(0, L / 2, 0);
    const m = new THREE.Mesh(g, steel);
    m.position.set(cx, cy, cz);
    m.lookAt(ex, ey, ez);
    m.rotateX(Math.PI / 2);
    api.world.add(m);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 5, 12), steel);
  hub.rotation.z = Math.PI / 2;
  hub.rotation.y = Math.atan2(ob.ux, ob.uz);
  hub.position.set(cx, cy, cz);
  api.world.add(hub);
  // 28 capsules, outboard of the rim
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rr = R + 2.6;
    const g = new THREE.CapsuleGeometry(1.9, 2.4, 4, 8);
    g.rotateZ(Math.PI / 2);
    g.rotateY(Math.atan2(ob.ux, ob.uz));
    g.translate(cx + ob.ux * Math.cos(a) * rr, cy + Math.sin(a) * rr,
                cz + ob.uz * Math.cos(a) * rr);
    api.merge(g, glass, cx, cz);
  }
  // the two A-frame legs carrying the hub
  for (const sgn of [-1, 1]) {
    for (const spread of [-1, 1]) {
      const fx = cx + nx * sgn * 5 + ob.ux * spread * (R * 0.5);
      const fz = cz + nz * sgn * 5 + ob.uz * spread * (R * 0.5);
      const dx = cx - fx, dy = cy - (base + 2), dz = cz - fz;
      const L = Math.hypot(dx, dy, dz) || 1;
      const g = new THREE.CylinderGeometry(1.0, 1.5, L, 7);
      g.translate(0, L / 2, 0);
      const m = new THREE.Mesh(g, steel);
      m.position.set(fx, base + 2, fz);
      m.lookAt(cx, cy, cz);
      m.rotateX(Math.PI / 2);
      m.castShadow = true;
      api.world.add(m);
    }
  }
}

// THE FULLERTON HOTEL. Wikipedia and fullertonhotels.com: 36.6m (120ft), 8
// storeys above ground, neoclassical/Palladian, GREY ABERDEEN GRANITE with
// Shanghai plaster, and a TWO-STOREY FLUTED DORIC COLONNADE running across its
// five frontages with a lofty portico over the entrance. The colonnade is the
// whole building -- without it this is a grey box.
function fullerton(api, b) {
  const ob = orientedBox(b.p);
  const base = api.footingY(b.p);
  const stone = api.mat.paleStone, trim = api.mat.trim;
  const H = Math.max(24, b.h);
  const COL = H * 0.42;                       // the two-storey order

  api.world.add(api.extrude(b.p, H, stone));
  // the heavy base the order stands on
  api.world.add(api.extrude(api.grow(b.p, 1.012), COL * 0.24, trim, 0));
  // the cornice, and a parapet above it
  api.world.add(api.extrude(api.grow(b.p, 1.03), 1.5, trim, H - 1.5));
  api.world.add(api.extrude(api.grow(b.p, 1.01), 2.2, stone, H));

  // THE COLONNADE, on every frontage rather than only the street one: this
  // building is free-standing and its five faces all carry the order.
  const ring = b.p;
  const plinth = COL * 0.24;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], c = ring[(i + 1) % ring.length];
    const dx = c[0] - a[0], dz = c[1] - a[1];
    const L = Math.hypot(dx, dz);
    if (L < 6) continue;
    const ux = dx / L, uz = dz / L;
    // outward normal, found by stepping off the edge rather than by comparing
    // against the centroid -- this plan is not convex
    let nx = -uz, nz = ux;
    if (pointInRing(a[0] + (dx / 2) + nx * 1.5, a[1] + (dz / 2) + nz * 1.5, ring)) {
      nx = -nx; nz = -nz;
    }
    const n = Math.max(2, Math.round(L / 4.2));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const px = a[0] + dx * t + nx * 1.1, pz = a[1] + dz * t + nz * 1.1;
      if (onCarriageway(px, pz, 0.2)) continue;
      const g = new THREE.CylinderGeometry(0.62, 0.68, COL, 12);
      g.translate(px, base + plinth + COL / 2, pz);
      api.merge(g, stone, ob.cx, ob.cz);
      // a Doric capital: a plain square abacus, which is what makes it Doric
      const cap = new THREE.BoxGeometry(1.6, 0.45, 1.6);
      cap.translate(px, base + plinth + COL + 0.22, pz);
      api.merge(cap, trim, ob.cx, ob.cz);
    }
  }
}

// THE MERLION. 8.6m, concrete on a steel frame, skinned in porcelain plates,
// and it FACES EAST -- a deliberate geomancy decision preserved through the
// 2002 move (roots.gov.sg), not an accident of siting. Small, and the single
// most photographed object in Singapore.
function merlion(api, b) {
  const ob = orientedBox(b.p);
  const base = api.footingY(b.p);
  const white = api.mat.paleStone;
  const H = 8.6;
  // the promontory it stands on
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.5, 2.2, 16), api.mat.conc);
  plinth.position.set(ob.cx, base + 1.1, ob.cz);
  plinth.receiveShadow = true; api.world.add(plinth);
  // EAST is +x in this projection, which is why the head, chest and jet are all
  // offset in +x below. It used to be held in a `face` constant that nothing
  // read and a `void face` at the end -- the exact dead-variable pattern this
  // file warns about three lines from here in ionOrchard.
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.6, H * 0.62, 12), white);
  body.position.set(ob.cx, base + 2.2 + H * 0.31, ob.cz);
  body.castShadow = true; api.world.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(1.9, 12, 10), white);
  chest.position.set(ob.cx + 0.6, base + 2.2 + H * 0.58, ob.cz);
  chest.castShadow = true; api.world.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.35, 12, 10), white);
  head.position.set(ob.cx + 1.0, base + 2.2 + H * 0.82, ob.cz);
  head.castShadow = true; api.world.add(head);
  // the mane
  for (let i = 0; i < 9; i++) {
    const a = -1.1 + (i / 8) * 2.2;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.5, 6), white);
    sp.position.set(ob.cx + 1.0 - Math.cos(a) * 1.2, base + 2.2 + H * 0.82 + Math.sin(a) * 1.2, ob.cz + Math.sin(a) * 1.0);
    sp.rotation.z = a - Math.PI / 2;
    api.world.add(sp);
  }
  // the jet, which is why anybody stands there
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 7.0, 8),
    new THREE.MeshStandardMaterial({ color: 0xdfeef0, roughness: 0.1, metalness: 0.2,
                                     transparent: true, opacity: 0.55 }));
  jet.position.set(ob.cx + 1.0 + 3.4, base + 2.2 + H * 0.78, ob.cz);
  jet.rotation.z = Math.PI / 2 - 0.16;
  api.world.add(jet);
}

// MARINA BAY SANDS. The building the whole city is recognised by, so the
// massing has to be right rather than approximately right.
//
// Sources (2026-07-28): Moshe Safdie's own case study in CTBUH Journal 2011-I,
// Arup's engineering account in STRUCTURE June 2011, and CTBUH's per-tower
// entries. Three things are widely got wrong and every one changes the shape:
//
//   THE TOWERS ARE NOT 207m. That is the top of the SkyPark. The concrete tower
//   roofs are about 194m and MBS's own site says 191m. Building 207m towers
//   lifts the deck into the sky above where it actually sits.
//
//   THE TOWERS DO NOT LEAN. Each tower is a PAIR OF LEGS: the west leg is
//   vertical and the east leg is curved and inclined, leaning against it. They
//   spread apart at the base -- that gap is the hotel atrium -- and CONVERGE as
//   they rise. A tower modelled as a single leaning slab is the opposite shape.
//
//   THE THREE ARE NOT IDENTICAL. Safdie: "as the parcel varies in width, the
//   cross section is decreased from one tower to the next", and each slab is
//   twisted slightly against its pair, "resulting in the appearance of six
//   towers, rather than three".
//
// The SkyPark is 340m long and at most 40m wide, its deck 200m up, cantilevering
// 66.5m past the NORTHERN tower. Safdie and CTBUH both publish 66.5m; Arup's
// body text says 64.9m while its own figure caption says 218ft, so the engineer
// contradicts himself in one document and the architect is the better source.
//
// What is NOT published, and is therefore taken from the OSM footprint rather
// than invented: the centre-to-centre spacing of the towers and their plan
// dimensions. No source gives either.
function marinaBaySands(api, b) {
  const ob = orientedBox(b.p);
  const base = api.footingY(b.p);
  const glass = api.mat.towerGlass, stone = api.mat.warmStone, pale = api.mat.paleStone;

  // ONE FOOTPRINT IS ONE TOWER. OSM maps "Marina Bay Sands Tower 1/2/3"
  // separately at about 3,000 m2 each, and SkyPark separately again with
  // min_height 193 -- so the deck is already built by the min_height path and
  // this must not build a second one. The first version of this recipe assumed
  // a single footprint containing all three towers and would have produced NINE
  // towers and three stacked SkyParks.
  const ROOF = Math.max(120, b.h);          // ~194m, the concrete tower roof
  const PODIUM = Math.min(24, ROOF * 0.12);

  // the base the pair spreads from
  api.world.add(api.extrude(b.p, PODIUM, pale));

  // TWO LEGS. West vertical, east inclined and leaning against it; they spread
  // at the base -- that gap is the hotel atrium -- and CONVERGE as they rise.
  const legD = Math.max(7, ob.halfShort * 0.52);
  const gap = ob.halfShort * 0.55;
  const towerW = ob.halfLong * 1.55;
  for (const leg of [-1, 1]) {
    const inclined = leg > 0;
    const vBase = ob.midV + leg * (gap / 2 + legD / 2);
    const vTop = inclined ? ob.midV + leg * (legD * 0.30) : vBase;
    const steps = 10;
    for (let k = 0; k < steps; k++) {
      const f0 = k / steps, f1 = (k + 1) / steps;
      const y0 = PODIUM + (ROOF - PODIUM) * f0, y1 = PODIUM + (ROOF - PODIUM) * f1;
      const v0 = vBase + (vTop - vBase) * f0, v1 = vBase + (vTop - vBase) * f1;
      // the WEST face is a reflective curtain wall, the EAST face is planted
      // terraces -- two different materials, which is what Safdie describes
      const seg = slab(api, ob, ob.midU, (v0 + v1) / 2, towerW, legD,
                       base + y0, y1 - y0, inclined ? stone : glass);
      if (seg) uvMetres(seg, 12, 3.0);      // 3.0m floor to floor, published
    }
  }
  crown(api, ob, ob.midU, ob.midV, towerW * 0.9, gap + legD * 2, base + ROOF, pale);
}

// THE ARTSCIENCE MUSEUM. Ten petals of varying height on a circular base,
// "reaching as high as 60m" -- Safdie Architects. White joint-less
// fibre-reinforced polymer, with bead-blasted stainless steel on the VERTICAL
// sides of each petal, which is a second material and is why the thing reads as
// a hand rather than as a white blob.
//
// Its diameter is genuinely not published anywhere, so it is taken from the OSM
// footprint. It is not literally a lotus: Safdie's office calls it a hand.
function artScienceMuseum(api, b) {
  const ob = orientedBox(b.p);
  const base = api.footingY(b.p);
  const R = Math.max(14, Math.min(ob.halfLong, ob.halfShort) * 0.95);
  const TOP = Math.max(30, b.h);
  // Joint-less white FRP, which is the whole point of the building: the first
  // attempt alternated pale stone and metal up each petal and came out as a
  // cluster of concrete stumps.
  const skin = new THREE.MeshStandardMaterial({
    color: 0xeceae4, roughness: 0.34, metalness: 0.06,
  });
  const steelBase = new THREE.MeshStandardMaterial({
    color: 0xb9bcc0, roughness: 0.28, metalness: 0.55,   // bead-blasted stainless
  });

  // THE DISH. A shallow bowl the petals rise out of, not a plinth: the roof is
  // dish-shaped and drains through a central oculus into the atrium.
  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.02, R * 0.62, 6.5, 26), steelBase);
  dish.position.set(ob.cx, base + 3.2, ob.cz);
  dish.castShadow = true; dish.receiveShadow = true;
  api.world.add(dish);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.5, 6, 28), skin);
  lip.rotation.x = Math.PI / 2;
  lip.position.set(ob.cx, base + 6.4, ob.cz);
  api.world.add(lip);

  // TEN PETALS of varying height. Slender and tapering, splaying outward as
  // they rise, each crowned by a small skylight -- not a sphere the size of the
  // finger, which is what made the first version look like a bunch of balloons.
  const F = [1.0, 0.62, 0.84, 0.47, 0.93, 0.55, 0.97, 0.51, 0.76, 0.60];
  for (let i2 = 0; i2 < 10; i2++) {
    const a = (i2 / 10) * Math.PI * 2 + 0.31;
    const h = 9 + (TOP - 9) * F[i2];
    const ca = Math.cos(a), sa = Math.sin(a);
    const r0 = R * 0.30, r1 = R * 0.30 + R * 0.52 * F[i2];   // splay
    const steps = 10;
    for (let k = 0; k < steps; k++) {
      const t0 = k / steps, t1 = (k + 1) / steps;
      const y0 = 5 + (h - 5) * t0, y1 = 5 + (h - 5) * t1;
      const rr = r0 + (r1 - r0) * ((t0 + t1) / 2);
      // a finger is fat at the base and narrow at the tip
      const w0 = R * 0.30 * (1 - 0.62 * t0), w1 = R * 0.30 * (1 - 0.62 * t1);
      // the SAME floor at both ends, or each segment is fractionally wider at
      // its base than the one below is at its top and the petal reads as a
      // stack of cups rather than a taper
      const g = new THREE.CylinderGeometry(Math.max(0.55, w1), Math.max(0.55, w0),
                                           y1 - y0, 9);
      g.translate(ob.cx + ca * rr, base + (y0 + y1) / 2, ob.cz + sa * rr);
      api.merge(g, skin, ob.cx, ob.cz);
    }
    // the skylight: a small cap, not a ball
    const capR = Math.max(0.7, R * 0.30 * 0.42);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(capR, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xcfe2ea, roughness: 0.12, metalness: 0.3 }));
    cap.position.set(ob.cx + ca * r1, base + h - 0.3, ob.cz + sa * r1);
    api.world.add(cap);
  }
}

// Hilton Singapore Orchard, 333 Orchard Road. TWO towers, and which one is// Hilton Singapore Orchard, 333 Orchard Road. TWO towers, and which one is
// which is a researched fact rather than a choice.
//
// en.wikipedia.org/wiki/Hilton_Singapore_Orchard, checked 2026-07-28: it opened
// in 1971 as The Mandarin Singapore, "occupying a single 36-storey block facing
// Orchard Road"; "a second block, Tower Two, standing 40 storeys and 152m high,
// was added IN THE REAR in 1973". Tower One is 36 floors at 144m.
//
// So the pair splits along the axis that points at the street, not along the
// footprint's long side, and the TALLER one is the one further from Orchard
// Road. Getting that backwards would put the wrong silhouette over the street
// from every vantage on the north side. The generic `hotel` recipe drew the
// whole 4,869 m2 site as one 152m mass.
function hiltonOrchard(api, b) {
  const ob = orientedBox(b.p);
  const stone = api.mat.warmStone, pale = api.mat.paleStone, glass = api.mat.towerGlass;
  const FRONT_H = 144, REAR_H = Math.max(b.h, 152);   // 36 and 40 storeys

  // slab() takes an ABSOLUTE y0 and the extrude below is seated on footingY --
  // the trap NEXT.md records from Lucky Plaza. Hilton's ground is 37m up, so
  // without this the towers start at y=14 and top out 38m short.
  const base = api.footingY(b.p);
  const podium = Math.min(14, b.h * 0.11);
  api.world.add(uvMetresExtruded(api.extrude(b.p, podium, stone), 16, 13));
  api.world.add(api.extrude(api.grow(b.p, 1.03), 0.9, pale, podium - 0.9));

  // which box axis points at Orchard Road?
  const sw = streetward(api, ob);
  const uc = sw.nx * ob.ux + sw.nz * ob.uz;         // streetward, in the box frame
  const vc = -sw.nx * ob.uz + sw.nz * ob.ux;
  const alongU = Math.abs(uc) > Math.abs(vc);
  const half = alongU ? ob.halfLong : ob.halfShort;
  const cross = alongU ? ob.halfShort : ob.halfLong;
  const sgn = alongU ? Math.sign(uc) || 1 : Math.sign(vc) || 1;

  // a tower each side of the middle, along that axis
  // Depth is what sets the GAP between the pair, and at 24m they nearly
  // touched and read as one slab with a seam. Tower Two was built two years
  // later on the land behind, so there is a real gap and it should be legible.
  const depth = Math.min(19, half * 0.62);          // front-to-back, per tower
  const width = Math.min(46, cross * 1.55);         // face width
  for (const [towerH, place] of [[FRONT_H, 1], [REAR_H, -1]]) {
    // Search inward for a stand that is over the plan and out of the road. The
    // Lucky Plaza trap was a tower silently never drawn because slab() refused
    // one offset and said nothing, so this reports what it could not place.
    let u = 0, v = 0, ok = false;
    for (const f of [0.52, 0.44, 0.36, 0.28, 0.20, 0.12, 0]) {
      const o = place * sgn * half * f;
      u = ob.midU + (alongU ? o : 0);
      v = ob.midV + (alongU ? 0 : o);
      const x = ob.cx + ob.ux * u - ob.uz * v, z = ob.cz + ob.uz * u + ob.ux * v;
      if (onCarriageway(x, z, 0.3)) continue;
      if (!pointInRing(x, z, b.p)) continue;
      ok = true; break;
    }
    if (!ok) { console.warn('hilton: no stand for the', place > 0 ? 'front' : 'rear', 'tower'); continue; }
    const w = alongU ? depth : width, d = alongU ? width : depth;
    const t = slab(api, ob, u, v, w, d, base + podium, towerH - podium - 4.2, stone);
    if (!t) continue;
    uvMetres(t, 14, 3.3);          // a hotel room bay is about 3.5m wide

    // banded balconies on the two long faces, the giveaway that it is rooms
    const bh = towerH - podium - 4.2;
    const floors = Math.max(4, Math.round(bh / 3.3));
    for (let f = 1; f < floors; f += 2) {
      const y = base + podium + f * (bh / floors);
      if (y > base + podium + bh - 2) break;
      for (const s2 of [-1, 1]) {
        const bu = u + (alongU ? s2 * (w / 2 + 0.18) : 0);
        const bv = v + (alongU ? 0 : s2 * (d / 2 + 0.18));
        slab(api, ob, bu, bv,
             alongU ? 0.42 : w * 0.96, alongU ? d * 0.96 : 0.42, y - 0.2, 0.28, pale);
      }
    }
    // One continuous glazed band per long face. It runs 0.62 of the face, not
    // 0.94: this opened in 1971 and the towers are concrete with solid end
    // walls, so a sheet of glass corner to corner reads as a 2010s office
    // block. The banded balconies above are what should carry the face.
    for (const s2 of [-1, 1]) {
      const gu = u + (alongU ? s2 * (w / 2 + 0.06) : 0);
      const gv = v + (alongU ? 0 : s2 * (d / 2 + 0.06));
      const g = slab(api, ob, gu, gv,
                     alongU ? 0.1 : w * 0.62, alongU ? d * 0.62 : 0.1,
                     base + podium + 1.2, bh - 2.4, glass);
      if (g) uvMetres(g, 14, 3.3);
    }
    crown(api, ob, u, v, w, d, base + podium + bh, pale);
  }

  // the porte-cochere over the set-down, same idiom as every other hotel here
  const ang = Math.atan2(sw.nx, sw.nz);
  const ex = ob.cx + sw.nx * ob.halfShort, ez = ob.cz + sw.nz * ob.halfShort;
  const room = api.clearance ? api.clearance.outward(ex, ez, sw.nx, sw.nz, 11, 13) : 7;
  if (room > 6.5) {
    const dp = Math.min(13, room * 1.05);
    const px = ex + sw.nx * (dp / 2), pz = ez + sw.nz * (dp / 2);
    // on the GROUND under the set-down, not on y=0. Same two-numbers trap.
    const gy = api.groundAt(px, pz);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, dp), pale);
    canopy.position.set(px, gy + 6.0, pz);
    canopy.rotation.y = ang;
    canopy.castShadow = true; api.world.add(canopy);
    for (const ax of [-9, 9]) {
      for (const az of [-dp / 2.6, dp / 2.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 6.0, 10), pale);
        const colX = px - sw.nz * ax + sw.nx * az, colZ = pz + sw.nx * ax + sw.nz * az;
        col.position.set(colX, api.groundAt(colX, colZ) + 3.0, colZ);
        col.castShadow = true; api.world.add(col);
      }
    }
  }
}

// Is a rotated rectangle clear of every carriageway?
//
// The shophouse is placed almost entirely from its ORIENTED BOX -- the roof and
// its gables from the box centre, the awning from `halfShort + 0.9` -- and for
// an irregular plan that box lies outside the walls. This is the trap already
// recorded in NEXT.md three times over (Lucky Plaza's facade fins, the church
// roof, the library slab) and slab() refuses to build in a carriageway because
// of it; these pieces are constructed directly and handed to the merger, so
// they never met that guard. Then they are merged into a 110m tile, which puts
// them out of pruneCarriageway's reach too -- it will not delete a tile holding
// twenty other buildings to remove one eave.
//
// Corners AND edge midpoints, because a 40m awning tested only at its centre is
// the same mistake as the canopy posts, the shopfront bays and the colonnade.
function rectClear(cx, cz, ux, uz, halfU, halfV, margin = 0.2) {
  const vx = -uz, vz = ux;
  for (const a of [-1, 0, 1])
    for (const b of [-1, 0, 1]) {
      if (a === 0 && b === 0) continue;
      const x = cx + ux * (a * halfU) + vx * (b * halfV);
      const z = cz + uz * (a * halfU) + vz * (b * halfV);
      if (onCarriageway(x, z, margin)) return false;
    }
  return true;
}

// is a point inside a footprint ring
function pointInRing(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
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
  // metre UVs (see the UV RULE in city.js): texShophouse is 3 floors x 3 bays
  // per tile, so 1/8 x 1/11 is a 2.7m bay on a 3.7m floor
  api.merge(api.scaleUV(api.extrudeGeo(b.p, upper, groundH),
    1 / 8, 1 / 11), wall, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.34, groundH - 0.34), trim, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.04), 0.5, b.h), trim, cx0, cz0);

  // colonnade: columns on the street edge carrying the upper floors
  const ang = Math.atan2(sw.nx, sw.nz);
  const span = ob.halfLong * 2;
  const n = Math.max(2, Math.round(span / 3.6));
  // A COLUMN IN THE ROAD IS NOT A FIVE-FOOT WAY.
  //
  // These are offset by `ob.halfShort * 0.94` from the ORIENTED BOX, and for an
  // irregular plan that box lies outside the walls -- the trap already recorded
  // in NEXT.md for Lucky Plaza's facade fins, the church roof and the library
  // slab. slab() refuses to build in a carriageway for exactly this reason, but
  // these columns are constructed directly and handed to the merger, so they
  // never went past that guard. They are then merged into a 110m tile, which
  // puts them out of pruneCarriageway's reach as well: it will not delete a
  // tile of many buildings to remove one column.
  //
  // Four of them were the last building geometry standing in a carriageway
  // anywhere in the region, on North Bridge Road, Armenian Street and Niven
  // Road -- which is shophouse country, so this is where it would show.
  for (let i = 0; i <= n; i++) {
    const u = ob.midU - ob.halfLong + (i / n) * span;
    const cx = ob.cx + ob.ux * u - ob.uz * ob.midV;
    const cz = ob.cz + ob.uz * u + ob.ux * ob.midV;
    const px = cx + sw.nx * (ob.halfShort * 0.94);
    const pz = cz + sw.nz * (ob.halfShort * 0.94);
    // its own footprint, not its centre: a 0.34m column tested at one point is
    // the same mistake as the canopy posts and the shopfront bays before it
    let clear = true;
    for (const ox of [-0.17, 0.17])
      for (const oz of [-0.17, 0.17])
        if (onCarriageway(px + ox, pz + oz, 0.2)) clear = false;
    if (!clear) continue;
    const g = new THREE.BoxGeometry(0.34, groundH, 0.34);
    g.translate(px, groundH / 2, pz);
    api.merge(g, trim, cx0, cz0);
  }

  // roof: mostly pitched clay, occasionally a flat-roofed later infill. A
  // shallow pitch — the first attempt used the full half-depth as the radius
  // and the roof came out taller than a storey.
  // A pitched roof whose eaves reach over the road becomes the flat-roofed
  // later-infill variant instead of being drawn into the traffic. The flat one
  // is built from grow(), which pulls its ring back out of a carriageway.
  let pitched = false;
  if (variant < 3) {
    const rad = Math.min(3.4, ob.halfShort * (0.5 + variant * 0.09));
    pitched = rectClear(ob.cx, ob.cz, ob.ux, ob.uz, span * 0.51, rad);
  }
  if (pitched) {
    const rad = Math.min(3.4, ob.halfShort * (0.5 + variant * 0.09));
    // A SURVEYED ROOF COLOUR beats the default clay. `roof:colour` is tagged on
    // 29 footprints in Bras Basah, which is conservation shophouse country, and
    // it was being carried into the scene file and then ignored -- which is the
    // same sin as not carrying it at all.
    const roofMat = b.rcol ? api.mat.roofTint(b.rcol) : tile;
    const rg = new THREE.CylinderGeometry(rad, rad, span * 1.02, 3, 1, false);
    rg.rotateZ(Math.PI / 2);
    rg.rotateY(-ob.ang);
    rg.translate(ob.cx, b.h + rad * 0.30, ob.cz);
    api.merge(rg, roofMat, cx0, cz0);
    // gable ends, so a row is read as separate houses rather than one long shed
    for (const sgn of [-1, 1]) {
      const gx = ob.cx + ob.ux * sgn * (span / 2), gz = ob.cz + ob.uz * sgn * (span / 2);
      if (!rectClear(gx, gz, ob.ux, ob.uz, 0.15, rad * 1.03)) continue;
      const gable = new THREE.CylinderGeometry(rad * 1.03, rad * 1.03, 0.3, 3, 1, false);
      gable.rotateZ(Math.PI / 2);
      gable.rotateY(-ob.ang);
      gable.translate(gx, b.h + rad * 0.30, gz);
      api.merge(gable, trim, cx0, cz0);
    }
  } else {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.05), 0.8, b.h + 0.5), trim, cx0, cz0);
  }

  // a canvas awning over the five-foot-way on most of them
  if (hasAwning) {
    const ax2 = ob.cx + sw.nx * (ob.halfShort + 0.9), az2 = ob.cz + sw.nz * (ob.halfShort + 0.9);
    if (rectClear(ax2, az2, ob.ux, ob.uz, span * 0.46, 1.0)) {
      const aw = new THREE.BoxGeometry(span * 0.92, 0.16, 2.0);
      aw.rotateY(-ob.ang);
      aw.translate(ax2, groundH - 0.55, az2);
      api.merge(aw, api.mat.awning(b), cx0, cz0);
    }
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

// Raffles City. I.M. Pei: a nine-square plan carved away and rotated 45 degrees
// so it angles back from the street instead of presenting a 600-foot broadside,
// and towers that read cylindrical from one direction and rectangular from
// another. The 226m Swissotel The Stamford was the tallest hotel in the world
// when it opened in 1986.
function rafflesCity(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const g0 = api.groundAt(cx0, cz0);
  const glass = api.mat.towerGlass, stone = api.mat.warmStone;
  const pod = Math.min(30, Math.max(16, b.h * 0.16));
  api.merge(api.extrudeGeo(b.p, pod), stone, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.02), 1.0, pod - 1.2), api.mat.trim, cx0, cz0);

  // the tall slab, turned 45 degrees to the plan, and rounded on its ends so it
  // reads round from one side and flat from the other
  const tall = Math.max(120, b.h);
  const tw = Math.min(ob.halfShort * 0.62, 21);
  const td = tw * 0.55;
  const core = new THREE.BoxGeometry(tw * 2, tall - pod, td * 2);
  core.rotateY(-ob.ang + Math.PI / 4);
  core.translate(cx0, g0 + pod + (tall - pod) / 2, cz0);
  api.merge(core, glass, cx0, cz0);
  for (const sgn of [-1, 1]) {
    const rx = Math.cos(-ob.ang + Math.PI / 4) * tw * sgn;
    const rz = -Math.sin(-ob.ang + Math.PI / 4) * tw * sgn;
    const round = new THREE.CylinderGeometry(td, td, tall - pod, 16);
    round.translate(cx0 + rx, g0 + pod + (tall - pod) / 2, cz0 + rz);
    api.merge(round, glass, cx0, cz0);
  }
  // the two shorter hotel towers alongside
  for (const sgn of [-1, 1]) {
    const ux = ob.ux * ob.halfLong * 0.52 * sgn, uz = ob.uz * ob.halfLong * 0.52 * sgn;
    const px = cx0 + ux, pz = cz0 + uz;
    if (onCarriageway(px, pz, -1)) continue;
    const hh = (tall - pod) * 0.52;
    const t2 = new THREE.CylinderGeometry(td * 0.82, td * 0.82, hh, 14);
    t2.translate(px, api.groundAt(px, pz) + pod + hh / 2, pz);
    api.merge(t2, glass, cx0, cz0);
  }
}

// The National Library. T.R. Hamzah & Ken Yeang: two 16-storey blocks split by a
// full-height atrium, the larger regular one over an open civic plaza, the
// second one curved.
//
// The first attempt was one flat grey ninety-metre slab, and the reason is worth
// keeping: at that scale a subtle concrete texture reads as nothing at all. What
// makes a tall building legible is HORIZONTAL ARTICULATION — floor bands, a
// visible split, a setback — not the material on its walls.
function nationalLibrary(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const g0 = api.groundAt(cx0, cz0);
  const glass = api.mat.blueGlass, stone = api.mat.paleStone;
  const h = Math.max(58, b.h);
  const nx = -ob.uz, nz = ob.ux;

  api.merge(api.extrudeGeo(b.p, 7), stone, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.9, 6.4), api.mat.trim, cx0, cz0);

  // the two halves, split wide enough that the atrium is visible from the street
  const GAP = Math.max(4, ob.halfShort * 0.22);
  // A DERIVED RING IS NOT A SURVEYED ONE.
  //
  // This slides every footprint vertex sideways by up to GAP (4m or more) to
  // split the block into two halves. process.py has pushed the FOOTPRINT clear
  // of every carriageway, but nothing has ever checked the ring that comes out
  // of here -- so a wall that was correctly on the pavement could be moved four
  // metres into North Bridge Road, and one was: the last piece of structure
  // standing in a carriageway anywhere in the region.
  //
  // grow() cannot catch it downstream either. Its own pull-back gives up at
  // t = 0.92 and then returns the vertex it was handed, which by then is the
  // moved one. So walk each moved vertex back toward the surveyed vertex it
  // came from until it is clear, and fall back to the surveyed one, which is
  // known good. That is a fallback to a CORRECT value, not to the broken one.
  const side = (sgn) => b.p.map(([x, z]) => {
    const d = (x - cx0) * nx + (z - cz0) * nz;
    const keep = sgn > 0 ? Math.max(d, GAP) : Math.min(d, -GAP);
    let mx = x + nx * (keep - d), mz = z + nz * (keep - d);
    if (!onCarriageway(mx, mz, 0.2)) return [mx, mz];
    for (let t = 0.9; t >= 0; t -= 0.1) {
      mx = x + nx * (keep - d) * t; mz = z + nz * (keep - d) * t;
      if (!onCarriageway(mx, mz, 0.2)) return [mx, mz];
    }
    return [x, z];
  });

  const big = side(1), curved = side(-1);
  api.merge(api.extrudeGeo(big, h - 7, 7), glass, cx0, cz0);
  // FLOOR BANDS. Sixteen storeys of them, projecting past the wall, which is the
  // single thing that stops a tall block reading as a blank slab.
  const storeys = 16;
  for (let i = 1; i <= storeys; i++) {
    const y = 7 + ((h - 7) / storeys) * i;
    if (y > h - 1) break;
    api.merge(api.extrudeGeo(api.grow(big, 1.02), 0.55, y - 0.55), stone, cx0, cz0);
  }
  // the curved block: stepped back three times so its plan bows away
  for (const [f, y, t] of [[1.0, 7, 0.40], [0.9, 7 + (h - 7) * 0.40, 0.32], [0.76, 7 + (h - 7) * 0.72, 0.26]]) {
    const ring = api.grow(curved, f);
    api.merge(api.extrudeGeo(ring, (h - 7) * t, y), stone, cx0, cz0);
    api.merge(api.extrudeGeo(api.grow(ring, 1.03), 0.7, y + (h - 7) * t - 0.7), api.mat.trim, cx0, cz0);
  }
  // and the atrium roof bridging the gap
  const roof = new THREE.BoxGeometry(ob.halfLong * 1.6, 0.6, GAP * 2 * 0.9);
  roof.rotateY(-ob.ang);
  roof.translate(cx0, g0 + h * 0.74, cz0);
  api.merge(roof, glass, cx0, cz0);
}

// South Beach. Foster + Partners: the identity is the CANOPY — ribbons of steel
// and aluminium louvres flexing above the public route and dipping at the edges.
//
// First attempt made nine 45cm ribs, which at street scale is a handful of white
// sticks. A canopy has to read as a canopy: a continuous arched surface with the
// louvre lines ON it, not a few bars floating in the air.
function southBeach(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const g0 = api.groundAt(cx0, cz0);
  const glass = api.mat.towerGlass;
  const louvre = new THREE.MeshStandardMaterial({
    color: 0xc2bcb1, roughness: 0.35, metalness: 0.55, side: THREE.DoubleSide,
  });
  const podium = Math.max(10, b.h * 0.7);
  api.merge(api.extrudeGeo(b.p, podium), api.mat.paleStone, cx0, cz0);

  // The canopy, built from the FOOTPRINT so it cannot overhang the neighbours.
  // Sized off the oriented box the ribbons ran out over the adjoining plots and
  // the road, which is the third time that box has been mistaken for the site.
  // Each ribbon is a thin slab on a shrunk ring of the real plan, stepping up
  // toward the middle so the whole thing arches the way the real canopy does.
  const RIB = 9;
  for (let i = 0; i < RIB; i++) {
    const f = 1.0 - i * 0.085;                  // successively smaller rings
    const rise = podium + 6 + i * 1.35;         // and successively higher
    api.merge(api.extrudeGeo(api.grow(b.p, f), 0.45, rise), louvre, cx0, cz0);
  }

  // No towers. The first version put two 70m slabs here because South Beach has
  // towers, but this footprint is the AVENUE — the map gives it a height of ten
  // metres and an area of 20,000 square metres. Inventing towers on a podium
  // footprint is making the map say something it does not say, and they read as
  // two thin poles anyway. The towers are separate footprints and get whatever
  // their own height earns them.
}

// Bugis+. WOHA with realities:united: a "crystal mesh" facade wrapping the
// convex side, with lit billboards on the flatter faces.
//
// First attempt used a 55%-opaque dark material and 28 bars, which read as dark
// panels. A mesh is bright, fine and dense, and it has to be in front of a lit
// wall for the lattice to show at all.
function crystalMesh(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const h = Math.max(20, b.h);
  // a bright backing wall, so the lattice reads against something
  api.merge(api.extrudeGeo(b.p, h), api.mat.blueGlass, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.01), 0.8, h - 0.8), api.mat.trim, cx0, cz0);
  const mesh = new THREE.MeshStandardMaterial({
    color: 0xe8ecef, roughness: 0.3, metalness: 0.45,
    emissive: 0x6e7d88, emissiveIntensity: 0.25,
  });
  const sw = streetward(api, ob);
  const N = 30;
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1) - 0.5) * ob.halfLong * 1.9;
    const px = cx0 + ob.ux * t + sw.nx * (ob.halfShort + 0.7);
    const pz = cz0 + ob.uz * t + sw.nz * (ob.halfShort + 0.7);
    if (onCarriageway(px, pz, -0.3)) continue;
    for (const lean of [0.30, -0.30]) {
      const bar = new THREE.BoxGeometry(0.22, h * 1.12, 0.22);
      bar.rotateZ(lean);
      bar.rotateY(-ob.ang);
      bar.translate(px, api.groundAt(px, pz) + h / 2, pz);
      api.merge(bar, mesh, cx0, cz0);
    }
  }
  // horizontal courses, so it is a mesh and not a picket fence
  for (let k = 1; k <= 5; k++) {
    const y = (h / 6) * k;
    api.merge(api.extrudeGeo(api.grow(b.p, 1.04), 0.18, y), mesh, cx0, cz0);
  }
}

export const RECIPES = [
  [/raffles city|swissotel|fairmont singapore|westin plaza/i, rafflesCity],

  // THESE THREE ARE WIRED UP, and the comment that used to sit here said the
  // opposite: "WRITTEN AND NOT WIRED UP ... they stay here, unreferenced".
  // They were never unreferenced -- the entries below have always been live
  // members of this array, so the file has been documenting a decision it was
  // not enforcing. Found on 2026-07-28 while tracing the last piece of
  // structure standing in a carriageway, which was the library's.
  //
  // Re-judged with data/landmark.mjs rather than from the note: the library's
  // recipe is CLEARLY better than the generic. It reads as a blue block with
  // sixteen projecting floor bands and a split atrium, where the generic gives
  // it a featureless pale slab -- which is what the old note actually described.
  // So they stay, and the comment now matches the code.
  //
  // The rule itself stands: a recipe exists to make a building more
  // recognisable than the generic treatment, and one that does not is a
  // regression. Judge it with the vet tool, not from memory of an old render.
  [/national library/i, nationalLibrary],
  [/south beach/i, southBeach],
  [/bugis\+|bugis junction|bugis street/i, crystalMesh],

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
  // Old St Joseph's Institution is the Singapore Art Museum: a colonial school
  // with a domed central block and two curved wings, which is the civic
  // arrangement rather than the church one despite the name.
  [/st\.? ?joseph's institution|singapore art museum/i, nationalMuseum],

  [/plaza singapura/i, plazaSingapura],
  [/lucky plaza/i, luckyPlaza],
  [/ngee ann city|takashimaya/i, ngeeAnnCity],
  [/ion orchard|orchard residences/i, ionOrchard],
  [/tang plaza|singapore marriott|^tangs/i, tangPlaza],
  [/paragon/i, paragon],
  [/wheelock/i, wheelockPlace],
  [/orchard central/i, orchardCentral],
  [/wisma atria|313|orchard gateway|shaw (house|centre)|mandarin gallery|the heeren/i, glassBoxPodiumTower],
  // ABOVE the generic hotel, which matches "hilton" and would win: the first
  // pattern to match is the one that runs.
  // Marina Bay. ABOVE the generic patterns, and ArtScience before the museum
  // rule, or "ArtScience Museum" is built as a civic rotunda.
  // Tower footprints ONLY. "Apple Marina Bay Sands" is a glass dome on the
  // water and "Marina Bay Sands Theatres" is a hall inside the podium; both
  // contain the name and neither is a hotel tower.
  [/marina bay sands tower/i, marinaBaySands],
  [/singapore flyer/i, singaporeFlyer],
  [/fullerton hotel|^the fullerton$|fullerton building/i, fullerton],
  [/^merlion|merlion park/i, merlion],
  [/artscience/i, artScienceMuseum],

  [/hilton singapore orchard|mandarin orchard/i, hiltonOrchard],
  [/hotel|hyatt|hilton|marriott|four seasons|pullman|voco|royal plaza|pan pacific|regent|shangri|holiday inn|ibis|orchard rendezvous|concorde/i, hotel],
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
// Recipes whose buildings never carry retail glazing. artScienceMuseum joined
// on 2026-07-28: 21 shop bays were glazed onto a museum whose whole form is ten
// unbroken white petals, which is the same mistake the Esplanade and the
// National Gallery are already in this set for.
const NO_SHOPFRONT = new Set([esplanade, nationalMuseum, nationalGallery,
                              gothicChurch, colonialHotel, artScienceMuseum,
                              merlion, singaporeFlyer]);
// Buildings that never have a shopfront whether or not a recipe knows them.
// Maghain Aboth Synagogue has no recipe, so the set above let it through and it
// was given a row of glazed retail bays. Only words that cannot be anything
// else: "gallery" is Mandarin Gallery, a mall, and "court" is a block of flats.
const NEVER_SHOPFRONT =
  /synagogue|mosque|masjid|gurdwara|temple|cathedral|chapel|church|monastery|convent|cenotaph|parliament|embassy|high commission|museum|memorial|merlion|observatory|supertree/i;
export function hasShopfront(name) {
  if (name && NEVER_SHOPFRONT.test(name)) return false;
  const fn = recipeFor(name);
  return !fn || !NO_SHOPFRONT.has(fn);
}

export function recipeFor(name) {
  if (!name) return null;
  for (const [re, fn] of RECIPES) if (re.test(name)) return fn;
  return null;
}
