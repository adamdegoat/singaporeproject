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
  const midU = (maxU + minU) / 2, midV = (maxV + minV) / 2;
  return {
    // cx, cz is the VERTEX MEAN. It is NOT the centre of the box, and on a long
    // or an L-shaped footprint the two are far apart -- measured 8.9m and 9.7m
    // on two of Mustafa Centre's four ways, which is most of the way off a mass
    // 20m wide. A 26.5m dome placed on cx,cz there hangs over open ground, and
    // that is what it looked like: a recipe whose mass had failed to draw.
    //
    // Same family as every other bug this project keeps finding: two things
    // describe one fact and the proxy one is wrong. So the real box centre is
    // returned too, and anything CENTRED on the building -- a dome, a drum, a
    // rotunda, a spire -- must use bx,bz. cx,cz stays for what it is honestly
    // good for: a stable per-building key for the merger's spatial tiles, and a
    // reasonable anchor on compact footprints.
    cx, cz, ux, uz, ang,
    bx: cx + midU * ux - midV * uz,
    bz: cz + midU * uz + midV * ux,
    halfLong: (maxU - minU) / 2, halfShort: (maxV - minV) / 2,
    midU, midV,
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

// A ROOF IS NOT A FACADE. An extruded mass carries its wall texture on its
// cap faces too, so from the air every roof showed a window grid lying flat --
// invisible from the saddle, glaring in the vantage sheet's aerial frame.
// Collapsing the cap's UVs to one spandrel texel (u 0.5, v 0.10 of the tile)
// renders it as the texture's flat band colour: no new material, no extra
// draw call, and the parapet trim already gives the edge a line.
export function flattenRoofUV(meshOrGeo) {
  const geo = meshOrGeo.isMesh ? meshOrGeo.geometry : meshOrGeo;
  const uv = geo.attributes.uv, n = geo.attributes.normal;
  if (!uv || !n) return meshOrGeo;
  for (let i = 0; i < uv.count; i++) {
    if (n.getY(i) > 0.9) uv.setXY(i, 0.5, 0.10);
  }
  uv.needsUpdate = true;
  return meshOrGeo;
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
  const r = boxy ? uvMetres(mesh, tile[0], tile[1]) : uvMetresExtruded(mesh, tile[0], tile[1]);
  if (!boxy) flattenRoofUV(geo);
  return r;
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

// direction from the building centroid toward the nearest CARRIAGEWAY —
// probed radially with the road index. The axis version below aims at the
// district's main street, which put Emerald Hill's shophouse doors on the
// Orchard-facing flanks of rows that front their own road.
function localStreetward(ob, walkways) {
  if (!window.__onRoad) return null;
  let best = null, bd = 1e9;
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const dx = Math.cos(a), dz = Math.sin(a);
    for (let m = 2; m <= 24; m += 1.5) {
      if (window.__onRoad(ob.cx + dx * m, ob.cz + dz * m, 0)) {
        if (m < bd) { bd = m; best = { nx: dx, nz: dz, dist: m }; }
        break;
      }
    }
  }
  if (best) return best;
  // PEDESTRIANISED streets carry no carriageway for the index to find —
  // Emerald Hill's lower stretch since 1981 (it is in our own research
  // notes). Fall back to the nearest walkable way's nearest point.
  if (walkways && walkways.length) {
    // nearest point on the SEGMENTS, not the vertices: a sparse polyline's
    // nearest vertex sits far along the street, aiming the frontage down
    // the row and putting every door on the end walls (measured: three
    // invisible iterations before this line existed)
    let wx = 0, wz = 0, wd = 1e9;
    for (const w of walkways) {
      for (let i = 0; i < w.p.length - 1; i++) {
        const [x1, z1] = w.p[i], [x2, z2] = w.p[i + 1];
        const dx = x2 - x1, dz = z2 - z1, L2 = dx * dx + dz * dz || 1;
        let t = ((ob.cx - x1) * dx + (ob.cz - z1) * dz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const px = x1 + dx * t, pz = z1 + dz * t;
        const d = (px - ob.cx) ** 2 + (pz - ob.cz) ** 2;
        if (d < wd) { wd = d; wx = px; wz = pz; }
      }
    }
    if (wd < 30 * 30) {
      const L = Math.sqrt(wd) || 1;
      return { nx: (wx - ob.cx) / L, nz: (wz - ob.cz) / L, dist: L };
    }
  }
  return null;
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
  // The shell's CENTER was clearance-checked but its 17m RADIUS never was,
  // so the rim stood across Orchard Road as a grey wall swallowing cars
  // (sweep-2 frames 072/111, probed). Walk the actual clear distance to the
  // carriageway and pull the centre back so the rim stops a metre short —
  // negative offsets are correct: the real canopy oversails the forecourt
  // and the podium, not the road.
  let clearD = 0;
  while (clearD < 26 && !onCarriageway(ob.cx + sw.nx * (ob.halfShort + clearD), ob.cz + sw.nz * (ob.halfShort + clearD), 0.3)) clearD += 0.5;
  const centerOff = Math.min(reach, clearD - 1 - 17);
  const fx = ob.cx + sw.nx * (ob.halfShort + centerOff);
  const fz = ob.cz + sw.nz * (ob.halfShort + centerOff);
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

// ONE OSM FOOTPRINT, TWO BUILDINGS: a low retail podium filling the plot with a
// slim office tower standing on part of it. Singapore is full of these and OSM
// almost always draws the whole complex as a single way, so the height that
// reaches this world is either the mall's (and the tower vanishes) or the
// tower's (and a 6,570 m2 plot becomes a 68m glass wall — which is exactly what
// Valley Point looked like before this existed).
//
// Valley Point, 491/491B River Valley Road: "a 20-storey office tower" over "a
// 2-storey shopping centre", both from Frasers Property's own portfolio page
// and the building's own site (research/heights-mixed.md section 7). No metre
// height is published for either part, so b.h is the storey count times the
// usual floor height and the podium is measured in storeys too.
function mallPodiumTower(api, b) {
  const ob = orientedBox(b.p);
  const POD = 7.4;                              // two retail storeys and the slab over them
  api.world.add(api.extrude(b.p, POD, api.mat.paleStone));
  // the capping band a mall roof always has, and which reads as the podium
  // edge from the street
  api.world.add(api.extrude(api.grow(b.p, 1.014), 0.9, api.mat.trim, POD));
  // The tower sits toward one end rather than centred: it is an office block
  // on a corner of the site, not a spire on a plinth. Bounded by the plot's
  // short side so it can never overhang its own podium.
  const tw = Math.min(36, ob.halfShort * 1.35);
  const td = Math.min(22, ob.halfShort * 0.85);
  const u = ob.midU - ob.halfLong * 0.30;
  const top = Math.max(POD + 12, b.h);
  slab(api, ob, u, ob.midV, tw, td, POD, top - POD, api.mat.towerGlass);
  crown(api, ob, u, ob.midV, tw, td, top, api.mat.paleStone);
}

// THE 2010s FREEHOLD BOUTIQUE APARTMENT BLOCK — the dominant building type on
// the western reach of River Valley Road, and a type this world did not have.
//
// research/rivervalley-road-frontage.md corrected the premise this was built
// on: these seven-storey blocks are NOT 1970s walk-ups that happen to be short.
// Every one of them was completed 2011-2015 (RV Suites ~2011, RV Edge ~2013,
// Loft @ Nathan 2014, Stellar RV 2015, RV Residences 2015), and they are seven
// storeys because that is the URA height control for this pocket of District
// 10 — the "shoebox" boom built out to the exact limit, block after block.
//
// What that produces on the street, and what this draws: a painted render
// frame, one continuous balcony band per floor with a GLASS balustrade set
// slightly proud of the wall, a recessed ground floor (car park and lobby,
// always in shadow), and a flat roof with a low parapet and a lift overrun.
// No podium, no crown, no curtain wall — the whole type is horizontal lines.
//
// Heights here are storeys x 3.4, never metres: no one publishes metres for
// any of them. See OSM_WAY in data/process.py.
function boutiqueApartment(api, b) {
  const ob = orientedBox(b.p);
  // A STABLE PER-BUILDING PICK, the same idea the shophouse recipe uses for its
  // roof variant: hash the footprint so a rebuild deals the same street.
  let vh = 0;
  for (const [x, z] of b.p) vh = (vh * 33 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
  const vi = Math.abs(vh) % api.mat.rvRender.length;
  const wall = api.mat.rvRender[vi], glass = api.mat.rvRail[vi];
  const floors = Math.max(3, Math.round(b.h / 3.4));
  const g = 3.9;                                  // recessed ground floor
  // The ground floor is INSET, not flush: it is a car park behind a screen and
  // it reads as a dark undercroft from the road. Drawn first so the mass above
  // visibly overhangs it.
  api.world.add(api.extrude(api.grow(b.p, 0.94), g, api.mat.conc));
  api.world.add(api.extrude(b.p, b.h - g, wall, g));
  // FIRST ATTEMPT READ AS A MULTI-STOREY CAR PARK and was rejected on sight:
  // a 0.22m slab edge plus a 1.05m balustrade is 1.27m of band on a 3.4m
  // floor, so more than a third of the facade was horizontal white stripe --
  // and the balustrade was a WHITE glass against a WHITE wall, which removed
  // the only cue that the band is glazing rather than concrete deck.
  //
  // What reads correctly at riding speed is a THIN slab edge and a rail that
  // is visibly darker than the wall it stands on. The wall is ivory, the rail
  // is blue-grey glass; the eye reads render + glazing, not deck + deck.
  for (let f = 1; f < floors; f++) {
    const y = g + (f - 1) * 3.4;
    api.world.add(api.extrude(api.grow(b.p, 1.018), 0.16, api.mat.trim, y));       // slab edge
    api.world.add(api.extrude(api.grow(b.p, 1.014), 0.92, glass, y + 0.16));       // rail
  }
  // parapet, then the lift overrun at the short end — the only thing that
  // breaks the roofline on any of these blocks
  api.world.add(api.extrude(api.grow(b.p, 1.01), 0.9, wall, b.h));
  const lw = Math.min(4.2, ob.halfShort * 0.7);
  slab(api, ob, ob.midU + ob.halfLong * 0.62, ob.midV, lw, lw * 1.2, b.h + 0.9, 2.6, wall);
}

// NOT WIRED UP — JUDGED WORSE THAN THE GENERIC AND HELD BACK, which is what
// this project does with a recipe that fails its own test (see the header of
// data/landmark.mjs). Compared side by side on 2026-08-01: the generic facade
// family gives this block three storeys of real windows and a warm painted
// wall; this recipe replaced all of that with a blank ivory box whose access
// galleries did not survive the carriageway test, so it read as a warehouse.
// A single 662 m2 building is not worth losing the window grid for. Kept here,
// with its research intact, for whoever gives it windows of its own.
//
// THE 1970 WALK-UP. River Valley Apartments, 400 River Valley Road, TOP 1970 —
// the ONLY genuine walk-up among the seventeen, which is why it does not share
// the family above. Four storeys, painted concrete, an open access gallery on
// the street face with a solid balustrade rather than glass, and projecting
// concrete sun ledges over the windows. Nothing glazed, nothing proud.
function walkupApartment(api, b) {
  const ob = orientedBox(b.p);
  const wall = api.mat.ivory;
  const floors = Math.max(2, Math.round(b.h / 3.4));
  api.world.add(api.extrude(b.p, b.h, wall));
  const sw = streetward(api, ob);
  const facing = (sw.nx * -Math.sin(ob.ang) + sw.nz * Math.cos(ob.ang)) >= 0 ? 1 : -1;
  for (let f = 1; f < floors; f++) {
    const y = f * 3.4;
    // access gallery: a solid concrete balustrade, street face only
    slab(api, ob, ob.midU, ob.midV + facing * (ob.halfShort + 0.45),
         ob.halfLong * 1.9, 0.9, y, 0.95, api.mat.conc);
    // the deck it stands on
    slab(api, ob, ob.midU, ob.midV + facing * (ob.halfShort + 0.32),
         ob.halfLong * 1.9, 0.7, y - 0.18, 0.18, api.mat.conc);
  }
  // a flat roof with a plain parapet, and nothing else
  api.world.add(api.extrude(api.grow(b.p, 1.012), 0.7, api.mat.conc, b.h));
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
  // EVERY y BELOW IS FROM g0. This recipe placed its pockets at y=12..50 and
  // its roof bushes at b.h+2 ABSOLUTE while the ground here is ~24m up -- the
  // slab-vs-footing trap this file documents for Lucky Plaza and Ngee Ann,
  // hit again. The aerial vet frame showed seven topiary balls hovering 30m
  // over Somerset in open sky; they were this roof garden, 22m below its own
  // roof and thrown clear of the walls by oriented-box offsets an irregular
  // plan does not contain.
  const g0 = api.footingY(b.p);
  api.world.add(api.extrude(b.p, b.h, glass));
  // recessed pockets carved out of the facade. The facade is found by walking
  // from the centroid toward the street until the walk leaves the FOOTPRINT --
  // the oriented box's face is open air for this plan, and hanging the
  // verandahs on it left three floor plates floating in the sky beside the
  // building (the aerial vet frame's "dark chips").
  const sw = streetward(api, ob);
  let fc = 0;
  while (fc < 80 && pointInRing(ob.cx + sw.nx * fc, ob.cz + sw.nz * fc, b.p)) fc += 0.5;
  for (let k = 0; k < 5; k++) {
    const y = g0 + 12 + k * 9.5;
    if (y > g0 + b.h - 8) break;
    const rec = new THREE.Mesh(
      new THREE.BoxGeometry(Math.min(20, ob.halfLong * 0.9), 4.2, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x2c3339, roughness: 0.6 }));
    rec.position.set(ob.cx + sw.nx * (fc - 1.6), y, ob.cz + sw.nz * (fc - 1.6));
    rec.rotation.y = Math.atan2(sw.nx, sw.nz);
    api.world.add(rec);
    // the verandah slab that pokes out of each pocket
    const sh = new THREE.Mesh(new THREE.BoxGeometry(Math.min(20, ob.halfLong * 0.9), 0.35, 4.6), stone);
    sh.position.set(ob.cx + sw.nx * (fc + 0.7), y - 2.0, ob.cz + sw.nz * (fc + 0.7));
    sh.rotation.y = Math.atan2(sw.nx, sw.nz);
    sh.castShadow = true; api.world.add(sh);
  }
  // landscaped roof deck: bushes ON the deck, and only where the deck is --
  // a random point in the oriented box is tested against the FOOTPRINT
  api.world.add(api.extrude(api.grow(b.p, 1.02), 1.0, stone, b.h));
  let planted = 0;
  for (let tries = 0; tries < 30 && planted < 7; tries++) {
    const bx = ob.cx + rand(-ob.halfLong * 0.6, ob.halfLong * 0.6);
    const bz = ob.cz + rand(-ob.halfShort * 0.6, ob.halfShort * 0.6);
    if (!pointInRing(bx, bz, b.p)) continue;
    const bush = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0x3f5c33 }));
    bush.position.set(bx, g0 + b.h + 1.9, bz);
    bush.scale.y = 0.7; bush.castShadow = true;
    api.world.add(bush);
    planted++;
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
    // far edge stays inside the measured clearance: depth*1.12 centred at
    // depth/2 reaches depth*1.06 ≈ room*1.11, which is IN the road when the
    // forecourt is tight (Carlton City Hotel poked 0.1m into Tras Link)
    const apronD = Math.min(depth * 1.12, (room - 0.3) * 2 - depth);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(24, 0.12, apronD), api.mat.paving);
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
  const sw = localStreetward(ob, api.walkways) || streetward(api, ob);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.86), groundH), api.mat.warmStone, cx0, cz0);
  // metre UVs (see the UV RULE in city.js): texShophouse is 3 floors x 3 bays
  // per tile, so 1/8 x 1/11 is a 2.7m bay on a 3.7m floor
  api.merge(api.scaleUV(api.extrudeGeo(b.p, upper, groundH),
    1 / 8, 1 / 11), wall, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.34, groundH - 0.34), trim, cx0, cz0);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.04), 0.5, b.h), trim, cx0, cz0);

  // THE GROUND FLOOR IS INHABITED. The set-back base rendered as a blank
  // warmStone band, which the sweep reviewers read as a burying plinth
  // (Emerald Hill, item 14c) — a shophouse ground floor is doors, shuttered
  // windows and shadow. One door + shutters per bay, merged like everything
  // else, each piece footing at its own ground so a terrace stepping down a
  // hill steps its doorways with it.
  {
    const angF = Math.atan2(sw.nx, sw.nz);
    const tX = Math.cos(angF), tZ = -Math.sin(angF);
    let fd = 0;
    while (fd < 40 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.4;
    const face = fd * 0.86 + 0.06;          // just proud of the set-back wall
    // Bays run ALONG THE STREET, so the span must be the footprint's extent
    // in that direction — it was halfLong*1.6, and a conservation shophouse
    // is a DEEP NARROW lot (6m frontage, 25m deep), so the bays scattered
    // along the depth, failed the in-ring test, and whole terraces on Amoy
    // and Telok Ayer kept blank ground floors (the 274-frame review's
    // loudest finding). Project the ring instead.
    let uMin = Infinity, uMax = -Infinity;
    for (const [vx2, vz2] of b.p) {
      const u2 = (vx2 - ob.cx) * tX + (vz2 - ob.cz) * tZ;
      if (u2 < uMin) uMin = u2;
      if (u2 > uMax) uMax = u2;
    }
    const uMid = (uMin + uMax) / 2;
    const span0 = (uMax - uMin) * 0.90;
    const bays = Math.max(1, Math.round(span0 / 3.0));
    // the signboard band over the openings — the five-foot-way lintel that
    // makes an inhabited ground floor read from across the street
    {
      const bx = ob.cx + tX * uMid + sw.nx * face, bz = ob.cz + tZ * uMid + sw.nz * face;
      // centre AND both ends stay inside the lot, and no end hangs over a
      // carriageway — a corner lot's projected frontage can run past the
      // party wall (one band crossed into Hullet Road; the deploy refused)
      const endOK = (sgn) => {
        const ex2 = bx + tX * sgn * span0 / 2, ez2 = bz + tZ * sgn * span0 / 2;
        return pointInRing(ex2 - sw.nx * 1.2, ez2 - sw.nz * 1.2, b.p)
            && !onCarriageway(ex2, ez2, 0.2);
      };
      if (pointInRing(bx - sw.nx * 1.2, bz - sw.nz * 1.2, b.p) && endOK(1) && endOK(-1)) {
        const rect2 = [
          [bx - tX * span0 / 2 - sw.nx * 0.05, bz - tZ * span0 / 2 - sw.nz * 0.05],
          [bx + tX * span0 / 2 - sw.nx * 0.05, bz + tZ * span0 / 2 - sw.nz * 0.05],
          [bx + tX * span0 / 2 + sw.nx * 0.05, bz + tZ * span0 / 2 + sw.nz * 0.05],
          [bx - tX * span0 / 2 + sw.nx * 0.05, bz - tZ * span0 / 2 + sw.nz * 0.05],
        ];
        api.merge(api.extrudeGeo(rect2, 0.55, 2.75), api.mat.darkTimber, ob.cx, ob.cz);
      }
    }
    for (let bi = 0; bi < bays; bi++) {
      const u = uMid - span0 / 2 + (bi + 0.5) * (span0 / bays);
      const px = ob.cx + tX * u + sw.nx * face;
      const pz = ob.cz + tZ * u + sw.nz * face;
      if (!pointInRing(px - sw.nx * 1.2, pz - sw.nz * 1.2, b.p)) continue;
      const isDoor = ((hh >> bi) & 1) === 0;
      const w2 = isDoor ? 1.05 : 1.5, h2 = isDoor ? 2.5 : 1.7, y2 = isDoor ? 0 : 0.95;
      const rect = [
        [px - tX * w2 / 2 - sw.nx * 0.06, pz - tZ * w2 / 2 - sw.nz * 0.06],
        [px + tX * w2 / 2 - sw.nx * 0.06, pz + tZ * w2 / 2 - sw.nz * 0.06],
        [px + tX * w2 / 2 + sw.nx * 0.06, pz + tZ * w2 / 2 + sw.nz * 0.06],
        [px - tX * w2 / 2 + sw.nx * 0.06, pz - tZ * w2 / 2 + sw.nz * 0.06],
      ];
      api.merge(api.extrudeGeo(rect, h2, y2), isDoor ? api.mat.darkTimber : api.mat.shutterGreen, ob.cx, ob.cz);
      window.__shDoors = (window.__shDoors || 0) + 1;
    }
    window.__shBays = (window.__shBays || 0) + bays;
    window.__shHouses = (window.__shHouses || 0) + 1;
  }

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
  // SEGMENT THE RIDGE. THE GUARD WAS FAILING ON LENGTH, NOT WIDTH.
  //
  // Measured in Chinatown: 893 shophouses pitched, 497 deliberately flat
  // later-infill, and 416 that wanted a pitch and were refused -- nearly a
  // quarter of the district standing under an office block's flat cap on the
  // most photographed conserved streets in Singapore.
  //
  // Two wrong diagnoses first, both disproved by measurement:
  //   * "the guard is unnecessary" -- removing it put clay tile over Cecil
  //     Street within one audit, so it is catching something real;
  //   * "the roofs are too WIDE" -- shrinking the pitch to 66% and then 45%
  //     of full depth rescued SEVEN of the 416 (6,188 -> 6,272 clay-tile
  //     triangles). Width was never the problem.
  //
  // The test is rectClear over `span * 0.51` ALONG the building. For a long
  // terrace that reach crosses a side street the building itself never
  // touches, so the whole roof is refused because of a road forty metres away
  // at the far end. `rad` is at most halfShort * 0.77, so the roof is strictly
  // narrower than the footprint carrying it; across the depth it cannot
  // overhang anything the walls do not.
  //
  // So the ridge is now built in segments and each one is tested on its own,
  // exactly as crystalMesh's facade panels were fixed in this same session.
  // A terrace whose middle passes a lane keeps the roof over the rest of
  // itself instead of losing all of it. P1b remains the arbiter.
  const rad = variant < 3 ? Math.min(3.4, ob.halfShort * (0.5 + variant * 0.09)) : 0;
  // ~9m of ridge per segment, so a single shop is one piece and a terrace is
  // several; never fewer than one, never so many that the merge cost matters.
  const RSEG = rad > 0 ? Math.max(1, Math.min(14, Math.round(span / 9))) : 0;
  const segLen = RSEG ? (span * 1.02) / RSEG : 0;
  let anyRoof = false;
  for (let i = 0; i < RSEG; i++) {
    const off = (i + 0.5) / RSEG * span * 1.02 - span * 0.51;
    const sx = ob.cx + ob.ux * off, sz = ob.cz + ob.uz * off;
    if (!rectClear(sx, sz, ob.ux, ob.uz, segLen * 0.5, rad)) continue;
    anyRoof = true;
    const roofMat = b.rcol ? api.mat.roofTint(b.rcol) : tile;
    const rg = new THREE.CylinderGeometry(rad, rad, segLen, 3, 1, false);
    rg.rotateZ(Math.PI / 2);
    rg.rotateY(-ob.ang);
    rg.translate(sx, b.h + rad * 0.30, sz);
    api.merge(rg, roofMat, cx0, cz0);
  }
  const pitched = anyRoof;
  if (pitched) {
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

// THE ISTANA. Government House, 1867-69, by Colonial Engineer J F A McNair and
// built by Indian convict labour: Neo-Palladian, two principal storeys over a
// raised basement, WHITE PLASTERED MASONRY, deep columned verandahs on both
// floors, a low-pitched overhanging roof and a central tower. It sits on a rise
// in 43 hectares of grounds.
//
// It was drawing as a blue glass-and-slab office block, which is what the
// generic facade family gives any unrecipe'd 16m mass. The grounds around it
// are the thing the rider actually sees from Orchard Road, and they now have
// their trees; the house behind them should not be an office.
//
// The plan is a 54-point cross, so the roof CANNOT be colonialHotel's cylinder
// -- that spans the bounding box and would roof the courtyards between the
// wings. A stepped inset extrusion follows the real ring instead and reads as a
// hipped roof from any angle a rider can reach.
function istana(api, b) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const white = new THREE.MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.88 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a5f5c, roughness: 0.7 });
  const h = Math.max(12, Math.min(b.h, 17));
  // EVERY OFFSET IN THIS RECIPE IS IN METRES, VIA inset() BELOW.
  //
  // CORRECTED 2026-08-01. The note that stood here blamed mitering: it said
  // grow() offsets each edge along its normal, that a miter between two
  // near-collinear edges is arbitrarily long, and that this ring's 54 points
  // around a cross plan were full of such pairs. Every clause of that is wrong,
  // and the real cause is simpler and worse.
  //
  // `grow(pts, f)` in city.js:949 IS ALREADY A CENTROID SCALE. It miters
  // nothing. Its second argument is a FACTOR, not a distance -- every other
  // caller in the tree passes 1.008, 1.012, 1.055. So `grow(b.p, 1.9)` did not
  // ask for a 1.9m eaves overhang; it asked for a ring NINETY PER CENT BIGGER,
  // and on a 45m mean radius that is a 40m overhang. Two roof planes over half
  // of Orchard is exactly the right answer to the question that was asked.
  // colonialHotel is not saved by Raffles Hotel being a rectangle either -- it
  // is saved by passing 1.008.
  //
  // So the rule is NOT "never grow() a complex ring". It is the one city.js
  // already applies to every shophouse roof in the city (see the `kIn` note at
  // city.js:1174): DECIDE THE OFFSET IN METRES, then convert it to the ratio
  // grow wants using the footprint's own mean radius, and CAP IT IN METRES.
  // inset() below is that conversion written locally.
  //
  // What survives from the old note is its last paragraph, which was right: a
  // scale about the centroid is proportional rather than uniform, so wing tips
  // move further than flanks. Under a metre of difference at 1.5m on a 45m mean
  // radius, and invisible -- but see the roof note in civicPalladian(), where
  // the same proportionality at 7m was very visible indeed.
  let rsum = 0;
  for (const [x, z] of b.p) rsum += Math.hypot(x - cx0, z - cz0);
  const R = Math.max(8, rsum / b.p.length);
  const inset = (d) => b.p.map(([x, z]) =>
    [cx0 + (x - cx0) * (1 + d / R), cz0 + (z - cz0) * (1 + d / R)]);
  // raised basement: the house stands on a plinth, which is why the entrance
  // has a flight of steps under its portico
  api.merge(api.extrudeGeo(inset(1.6), 1.5), api.mat.paleStone, cx0, cz0);
  api.merge(api.extrudeGeo(b.p, h, 1.5), white, cx0, cz0);
  // The two verandahs. A projecting slab plus a rail above it is the same
  // device colonialHotel uses and it is what reads at riding distance: the
  // column shafts behind are lost in shadow long before the shadow line is.
  for (let f = 1; f <= 2; f++) {
    const y = 1.5 + (h / 2.35) * f;
    if (y > h) break;
    api.merge(api.extrudeGeo(inset(1.5), 0.32, y), api.mat.trim, cx0, cz0);
    api.merge(api.extrudeGeo(inset(1.35), 0.16, y + 1.1), api.mat.trim, cx0, cz0);
  }
  // Low hipped roof, stepped in twice so the silhouette falls away from the
  // eaves instead of ending in a parapet.
  //
  const top = 1.5 + h;
  api.merge(api.extrudeGeo(inset(1.9), 0.4, top), roofMat, cx0, cz0);
  api.merge(api.extrudeGeo(inset(-2.6), 1.5, top + 0.4), roofMat, cx0, cz0);
  api.merge(api.extrudeGeo(inset(-8.0), 1.3, top + 1.9), roofMat, cx0, cz0);
  // the central tower, on the centroid of the cross
  const g0 = api.groundAt(cx0, cz0);
  const tw = new THREE.BoxGeometry(7.5, 6.0, 7.5);
  tw.rotateY(-ob.ang);
  tw.translate(cx0, g0 + top + 3.0, cz0);
  api.merge(tw, white, cx0, cz0);
  const cap = new THREE.ConeGeometry(6.2, 3.4, 4);
  cap.rotateY(-ob.ang + Math.PI / 4);
  cap.translate(cx0, g0 + top + 7.7, cz0);
  api.merge(cap, roofMat, cx0, cz0);
}

// THE CIVIC DISTRICT'S COLONIAL SET. Three white neoclassical landmarks stand
// on the north bank of the Singapore River and all three were drawing as modern
// glass-and-panel blocks:
//
//   The Arts House            1827, the old Parliament House, oldest surviving
//                             government building in Singapore; Palladian, by
//                             G D Coleman, two storeys over a rusticated base.
//   Victoria Theatre          1862 Town Hall + 1905 Memorial Hall, joined by a
//                             CLOCK TOWER; Victorian classical, white plaster.
//   Empress Place Building    1860s-1900s, now the Asian Civilisations Museum;
//                             Neo-Palladian, deep columned verandahs, long
//                             frontage to the river.
//
// One recipe because they ARE one idiom -- white plastered masonry, a plinth,
// verandah bands at each floor, a low pitched roof -- and the differences that
// matter at riding distance are height, and whether there is a tower.
//
// Offsets are in METRES, via the local inset(). api.grow()'s second argument is
// a FACTOR, not a distance, and passing metres to it is what put two roof planes
// over half of Orchard on the Istana -- see the corrected note in istana().
function civicPalladian(api, b, opts = {}) {
  const ob = orientedBox(b.p);
  const cx0 = ob.cx, cz0 = ob.cz;
  const white = new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.88 });
  const roofMat = api.mat.clayTile || new THREE.MeshStandardMaterial({ color: 0x9c5a44, roughness: 0.82 });
  const h = Math.max(10, Math.min(b.h, opts.cap || 18));

  let rsum = 0;
  for (const [x, z] of b.p) rsum += Math.hypot(x - cx0, z - cz0);
  const R = Math.max(8, rsum / b.p.length);
  const inset = (d) => b.p.map(([x, z]) =>
    [cx0 + (x - cx0) * (1 + d / R), cz0 + (z - cz0) * (1 + d / R)]);

  // rusticated plinth: these all stand a step above the promenade
  api.merge(api.extrudeGeo(inset(1.3), 1.2), api.mat.paleStone, cx0, cz0);
  api.merge(api.extrudeGeo(b.p, h, 1.2), white, cx0, cz0);

  // Verandah bands. The colonnade shafts behind them are lost in shadow at any
  // distance a rider sees this from; the shadow LINE is what reads, and that is
  // what a projecting slab plus a rail gives. Same device colonialHotel uses.
  const floors = h > 13 ? 2 : 1;
  for (let f = 1; f <= floors; f++) {
    const y = 1.2 + (h / (floors + 0.35)) * f;
    if (y > h) break;
    api.merge(api.extrudeGeo(inset(1.4), 0.30, y), api.mat.trim, cx0, cz0);
    api.merge(api.extrudeGeo(inset(1.25), 0.15, y + 1.05), api.mat.trim, cx0, cz0);
  }

  // LOW HIPPED ROOF. Round 1 of the vet drew this as two steps -- inset(-2.4)
  // under a 1.4m riser, then inset(-7.0) under a 1.2m riser -- and all three
  // buildings came back as ORANGE LAYER CAKES. Two things were wrong and they
  // compounded:
  //
  //   * a 1.4m riser is a TERRACE, not a pitch. At any distance a rider sees
  //     this from, two risers that tall read as two flat platforms stacked, and
  //     the shadow each one casts on the tray below it opens a dark slot.
  //   * the inset was uncapped in METRES. `inset(d)` moves a vertex at radius r
  //     by r*d/R, so on the ACM's 40-point cross plan -7.0 at a 28m mean radius
  //     pulls the wing tips in eleven metres and the arms collapse into each
  //     other, which is where the notches came from.
  //
  // Six thin lifts instead, and the run capped in metres. city.js already
  // solved exactly this for every shophouse in the city -- see the `kIn` note
  // at the pitched-roof branch, which caps its inset at 3.2m for the same
  // reason -- and the fix is to follow it, not to reinvent it.
  // Round 2 tried six thin lifts and it came back RIBBED: `inset` scales about
  // the centroid, so along a long flank (small radius) six rings land almost on
  // top of each other and read as corduroy, while at the ends (large radius)
  // they fan out. Stepping is the wrong instrument here whatever the step size.
  //
  // So: TWO pieces, exactly what city.js draws on every shophouse in the city
  // and what has looked right there for weeks -- a tiled lip proud of the wall,
  // and one inset cap above it. The lip is the line that reads at street level;
  // the cap only has to close the silhouette.
  const top = 1.2 + h;
  const RUN = Math.min(3.0, R * 0.15);
  api.merge(api.extrudeGeo(inset(0.9), 0.34, top), roofMat, cx0, cz0);
  api.merge(api.extrudeGeo(inset(-RUN), 1.7, top + 0.34), roofMat, cx0, cz0);

  // VICTORIA'S CLOCK TOWER. 54m to the finial; the mass below is already `h`,
  // so the tower carries the rest.
  //
  // Round 1 drew it as one 9m box under a cone and it read as a GRAIN SILO --
  // no cornice to break the shaft, no clock, and a slenderness that belongs to
  // a chimney. What makes a clock tower legible at 150m is three things in this
  // order: a broader pier at the bottom, a horizontal cornice line under the
  // belfry, and a DARK DISC high on each face. The disc does the most work.
  //
  // Centred on ob.bx,bz, NOT cx0,cz0: the vertex mean of a 31-point ring is not
  // the middle of the building, and this is the trap orientedBox's own comment
  // documents (Mustafa's dome, 8.9m off over a 20m mass).
  if (opts.tower) {
    const tx = ob.bx, tz = ob.bz;
    const g0 = api.groundAt(tx, tz);
    const base = g0 + 1.2 + h;
    const H = opts.tower - (1.2 + h);
    const put = (geo, m, y) => {
      geo.rotateY(-ob.ang); geo.translate(tx, y, tz); api.merge(geo, m, cx0, cz0);
    };
    const sq = (w, y0, hh, m) => put(new THREE.BoxGeometry(w, hh, w), m, y0 + hh / 2);
    sq(12.4, base, H * 0.34, white);                       // pier
    sq(13.3, base + H * 0.34, 0.6, api.mat.paleStone);     // string course
    sq(10.6, base + H * 0.34 + 0.6, H * 0.46, white);      // shaft
    const clockY = base + H * 0.80 + 0.6;
    sq(11.4, clockY, H * 0.17, white);                     // clock stage
    // One clock per side. Round 2 drew these at 2.5m radius in near-black and
    // two of them in one frame read as a pair of eyes; a real dial on an 11m
    // face is about a third of it. Pale stone surround, dark hands-and-numerals
    // disc inside it -- the contrast ring is what says CLOCK rather than PORTHOLE.
    for (let s = 0; s < 4; s++) {
      const a = ob.ang + s * Math.PI / 2;
      const nx = Math.cos(a), nz = Math.sin(a);
      // rotateX puts the disc's axis on +Z; rotateY(PI/2 - a) then swings that
      // axis onto (cos a, sin a). rotateY(-a) -- the rotation every BOX in this
      // file uses -- would leave it ninety degrees out, edge-on to the street.
      const dial = (r, t, off, m) => {
        const d = new THREE.CylinderGeometry(r, r, t, 16);
        d.rotateX(Math.PI / 2); d.rotateY(Math.PI / 2 - a);
        d.translate(tx + nx * off, clockY + H * 0.085, tz + nz * off);
        api.merge(d, m, cx0, cz0);
      };
      dial(2.0, 0.30, 5.76, api.mat.paleStone);
      dial(1.55, 0.34, 5.84, api.mat.darkMetal || api.mat.trim);
    }
    sq(12.6, clockY + H * 0.17, 0.55, api.mat.paleStone);  // cornice
    const cap = new THREE.ConeGeometry(8.6, 6.4, 4);
    cap.rotateY(-ob.ang + Math.PI / 4);
    cap.translate(tx, clockY + H * 0.17 + 0.5 + 3.2, tz);
    api.merge(cap, roofMat, cx0, cz0);
  }
}

// Named wrappers, NOT inline arrows in the RECIPES table: NO_SHOPFRONT tests
// membership by function identity, and an arrow declared in the table is a
// different object every time it is read. An arrow there would have glazed
// retail bays onto all three.
const artsHouse = (api, b) => civicPalladian(api, b, { cap: 15 });
const victoriaTheatre = (api, b) => civicPalladian(api, b, { cap: 16, tower: 54 });
const empressPlace = (api, b) => civicPalladian(api, b, { cap: 16 });

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

// THE NATIONAL STADIUM — the largest single object in this world, and the
// generic fabric was drawing it as a 310m glazed office drum with a flat top.
//
// PUBLISHED, and every figure here is sourced (research/coastal-expansion.md
// addendum, 2026-08-02): dome INTERNAL height 83m over a 310m clear span, the
// world's largest free-spanning dome; 20,000 m2 of ultra-thin steel roof
// weighing 8,057 tonnes; arch trusses 5m deep at the crown tapering to 2.5m at
// the base, carried on a post-tensioned concrete ring beam. About a third of
// the roof retracts, in two segments. Arup (structure) with DP Architects.
//
// Two things make it read, and neither is detail:
//   1. IT HAS NO WINDOWS. A stadium bowl is precast concrete and metal
//      cladding. The curtain-wall grid was the single most wrong thing about
//      it -- at 310m across, an office window pattern reads as an office block
//      the size of a district.
//   2. THE DOME IS THE BUILDING. 83m of it, and the bowl below is barely a
//      third of that. A flat top loses the only silhouette anyone recognises.
//
// The cladding colour is UNPUBLISHED in every source read -- the roof is
// described only as insulated metal "to reflect sunlight" -- so this is a pale
// warm grey, chosen to read as bright metal against sky and explicitly NOT
// presented as researched.
function nationalStadium(api, b) {
  const ob = orientedBox(b.p);
  const cx = ob.cx, cz = ob.cz;
  const g = api.groundAt(cx, cz);
  const H = b.h || 83;                       // published dome height
  const BOWL = Math.min(H * 0.42, 34);       // the concrete bowl under the roof

  const shell = new THREE.MeshStandardMaterial({
    color: 0xd9d7d0, roughness: 0.62, metalness: 0.22,
  });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xc9c5bb, roughness: 0.9 });

  // the bowl, and a shadow gap at its foot so it does not read as one poured mass
  api.merge(api.extrudeGeo(b.p, BOWL), concrete, cx, cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.006), 1.6), concrete, cx, cz);

  // THE DOME. An ellipsoid cap, not a sphere: the footprint is a 35-point ring
  // about 310 x 250m, and a spherical cap sized to the long axis would stand
  // proud of the short one by thirty metres. Scaled per axis from the oriented
  // box, which is the same thing every other recipe in this file uses to find a
  // building's real extents.
  const ry = H - BOWL;
  // SCALE, THEN ROTATE, THEN TRANSLATE — in that order. Rotating after the
  // translate spins the dome about the world origin and throws it kilometres
  // off the building; the same ordering trap the stair cheeks hit with
  // rotateX/rotateY two sessions ago.
  const dome = new THREE.SphereGeometry(1, 48, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
  dome.scale(ob.halfLong * 1.005, ry, ob.halfShort * 1.005);
  dome.rotateY(Math.atan2(ob.ux, ob.uz));
  dome.translate(cx, g + BOWL, cz);
  const mesh = new THREE.Mesh(dome, shell);
  mesh.castShadow = true;
  api.world.add(mesh);

  // The ring beam the dome sits on: a band of shadow between bowl and roof,
  // which is what separates the two in every photograph of the building.
  const beam = new THREE.CylinderGeometry(1, 1, 2.4, 48, 1, true);
  beam.scale(ob.halfLong * 1.012, 1, ob.halfShort * 1.012);
  beam.rotateY(Math.atan2(ob.ux, ob.uz));
  beam.translate(cx, g + BOWL - 0.6, cz);
  api.merge(beam, api.mat.metal, cx, cz);
}

// The Singapore Indoor Stadium, Kenzo Tange, opened December 1989. 47m, and
// NLB calls it one of the tallest single-storey buildings in Asia. Its roof is
// a CONE modelled on a Shinto temple, not a dome -- the distinction is the
// whole building, and it was drawing as a flat-topped block.
function indoorStadium(api, b) {
  const ob = orientedBox(b.p);
  const cx = ob.cx, cz = ob.cz;
  const g = api.groundAt(cx, cz);
  const H = b.h || 47;
  const BASE = H * 0.54;
  const wall = new THREE.MeshStandardMaterial({ color: 0xd2cec4, roughness: 0.86 });
  const roof = new THREE.MeshStandardMaterial({
    color: 0x8d9298, roughness: 0.55, metalness: 0.3,
  });
  api.merge(api.extrudeGeo(b.p, BASE), wall, cx, cz);
  const cone = new THREE.ConeGeometry(1, H - BASE, 4, 1);
  // four-sided and turned 45 degrees so the ridges face the corners, which is
  // what gives the Tange roof its folded-plate look rather than a tent.
  //
  // ROUND 1 SCALED THIS 1.34 AND IT WAS A MARQUEE. A cone scaled 34% past the
  // footprint on a 150m building is a fifty-metre eaves overhang: the roof came
  // down to ground level on both flanks and swallowed the neighbouring plots.
  // Same failure as the Istana's grow(1.9) -- a RATIO applied to a large
  // footprint is a distance nobody intended. 1.05 is about a four-metre eave,
  // which is what the photographs show.
  cone.scale(ob.halfLong * 1.05, 1, ob.halfShort * 1.05);
  cone.rotateY(Math.atan2(ob.ux, ob.uz) + Math.PI / 4);
  cone.translate(cx, g + BASE + (H - BASE) / 2, cz);
  api.merge(cone, roof, cx, cz);
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
  // A SOURCED CHURCH HEIGHT IS NOT A GUESS AND SHOULD NOT BE CAPPED AT 30m.
  // The cap exists because a church footprint with a type-default height would
  // otherwise grow a 55m spire out of a parish hall. But St Andrew's spire is
  // 63m — 207 feet, published by the cathedral itself — and the cap silently
  // cut a third off the tallest thing in the City Hall skyline. Where `hs`
  // says the height came from a source, trust it; where it does not, keep the
  // old ceiling.
  const towerH = Math.max(wall + 4, Math.min(b.h, b.hs ? 70 : 30));
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


// BUDDHA TOOTH RELIC TEMPLE, 288 South Bridge Road. Researched 2026-07-30 by
// agent; SIXTEEN false premises corrected across the two temples, the big
// ones here: there is NO golden stupa outside (it is interior, 4th floor);
// the tiles are COOL BLUE-GREY, not gold or terracotta; it is not a pagoda
// but a rectangular block, 66.7m DEEP and only 31.5m wide to the street,
// with stacked skirt roofs; the recognisable "twin towers" are the two
// street-side ROOF-GARDEN PAVILIONS. Height UNPUBLISHED: the estimate ~29m
// brackets the mapped 30 and the mapped value stands for the core.
function buddhaTooth(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const tile = new THREE.MeshStandardMaterial({ color: 0x7d828b, roughness: 0.72 });
  const red = new THREE.MeshStandardMaterial({ color: 0x7e3f3a, roughness: 0.8 });
  const white = new THREE.MeshStandardMaterial({ color: 0xe6e4dc, roughness: 0.85 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.4, metalness: 0.55 });
  // ONE clean frame: local Z runs along the LONG axis (the 66.7m depth,
  // perpendicular to South Bridge Rd), local X across the 31.5m frontage.
  const yawL = Math.atan2(ob.ux, ob.uz);
  const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
  const zA = { x: ob.ux, z: ob.uz };
  const sDot = Math.sign(sw.nx * ob.ux + sw.nz * ob.uz) || 1;  // +z toward street?
  const at = (mesh, lx, y, lz) => {
    mesh.position.set(ob.cx + xA.x * lx + zA.x * lz, y, ob.cz + xA.z * lx + zA.z * lz);
    mesh.castShadow = true;
    api.world.add(mesh);
  };
  // roof rectangles sized to the RING's real extents in the local frame,
  // not the oriented box: the footprint is notched, and box-sized roofs
  // sailed metres past the street-side wall (round 3 vet)
  let uMn = 1e9, uMx = -1e9, vMn = 1e9, vMx = -1e9;
  for (const [rx2, rz2] of b.p) {
    const dx2 = rx2 - ob.cx, dz2 = rz2 - ob.cz;
    const u2 = dx2 * xA.x + dz2 * xA.z, v2 = dx2 * zA.x + dz2 * zA.z;
    if (u2 < uMn) uMn = u2;
    if (u2 > uMx) uMx = u2;
    if (v2 < vMn) vMn = v2;
    if (v2 > vMx) vMx = v2;
  }
  const uC = (uMn + uMx) / 2, vC = (vMn + vMx) / 2;
  const W = uMx - uMn, D = vMx - vMn;
  // the red body STEPS BACK as it rises (wedding-cake, per the photos) so
  // each skirt roof wraps a real step instead of slicing through a
  // monolith — round 2's remaining fault. White spandrel band at each
  // step head, granite plinth below.
  api.world.add(api.extrude(api.grow(b.p, 1.004), 1.0, api.mat.conc, 0));
  api.world.add(api.extrude(b.p, 11.0, red, 1.0));
  api.world.add(api.extrude(api.grow(b.p, 1.006), 1.1, white, 10.4));
  api.world.add(api.extrude(api.grow(b.p, 0.93), 6.2, red, 12.0));
  api.world.add(api.extrude(api.grow(b.p, 0.936), 1.0, white, 17.3));
  api.world.add(api.extrude(api.grow(b.p, 0.85), 5.6, red, 18.4));
  api.world.add(api.extrude(api.grow(b.p, 0.856), 1.0, white, 23.0));
  // stacked hip roofs: 4-gon frusta in BLUE-GREY (researched: not gold, not
  // terracotta), thin gilt strip along each eave. R3 slightly wider than R2
  // by publication — no uniform pagoda taper.
  const roof = (w, d, hgt, y, lx = 0, lz = 0) => {
    // rotate the 4-gon to a square IN GEOMETRY, then scale to the rectangle
    // — rotating at the MESH level and then scaling non-uniformly SHEARS
    // the roof into a sail (round 1's failure, vetted and diagnosed)
    const geo = new THREE.CylinderGeometry(0.30, 0.71, 1, 4);
    geo.rotateY(Math.PI / 4);
    geo.scale(w, hgt, d);   // bottom radius 0.71 -> unit edge span after the 45-deg bake
    const r = new THREE.Mesh(geo, tile);
    r.rotation.y = yawL;
    at(r, lx, g0 + y + hgt / 2, lz);
    for (const [gx2, gz2, ln, axis] of [[0, d * 0.5, w, 'x'], [0, -d * 0.5, w, 'x'],
                                        [w * 0.5, 0, d, 'z'], [-w * 0.5, 0, d, 'z']]) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(axis === 'x' ? ln : 0.2, 0.15, axis === 'x' ? 0.2 : ln), gold);
      strip.rotation.y = yawL;
      at(strip, lx + gx2, g0 + y + 0.06, lz + gz2);
    }
  };
  roof(W * 1.08, D * 1.02, 2.6, 12.0, uC, vC);   // skirt over the base
  roof(W * 0.99, D * 0.94, 2.4, 18.4, uC, vC);   // over step 2
  roof(W * 0.92, D * 0.87, 2.6, 24.0, uC, vC);   // crown over step 3

  // entrance porch projecting toward the street, low, its own roof
  {
    // the annex projects toward the street but its ROOF must stay off the
    // public pavement (round 2 hung it over the kerb — vetted from the
    // rider's seat). Centre 2.4m out, roof 8.5 deep: reach ~6.7m.
    const plz = (sDot > 0 ? vMx : vMn) + sDot * 2.4;
    const px2 = ob.cx + zA.x * plz, pz2 = ob.cz + zA.z * plz;
    const rimX = ob.cx + zA.x * (plz + sDot * 4.4), rimZ = ob.cz + zA.z * (plz + sDot * 4.4);
    if (!onCarriageway(px2, pz2, 0.3) && !onCarriageway(rimX, rimZ, 0.2)) {
      const porch = new THREE.Mesh(new THREE.BoxGeometry(W * 0.60, 6.4, 4.8), red);
      porch.rotation.y = yawL;
      at(porch, 0, g0 + 3.2, plz);
      roof(W * 0.64, 8.5, 2.0, 7.4, 0, plz);
    }
  }
  // roof-garden pavilions: 4 corners + centre; the street-side PAIR is the
  // skyline signature (researched: there is NO golden stupa outside)
  const pav = (lx, lz) => {
    // base ABOVE the crown roof's apex (24 + 2.6): round 3 had the bodies
    // starting inside it, poking red through the grey
    const body = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.4, 7.4), red);
    body.rotation.y = yawL;
    at(body, lx, g0 + 28.5, lz);
    roof(9.2, 9.2, 1.7, 30.2, lx, lz);
    roof(6.4, 6.4, 1.5, 31.9, lx, lz);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), gold);
    at(knob, lx, g0 + 33.7, lz);
  };
  const uO = W * 0.25, vO = D * 0.31;
  pav(uC - uO, vC + vO * sDot); pav(uC + uO, vC + vO * sDot);
  pav(uC - uO, vC - vO * sDot); pav(uC + uO, vC - vO * sDot);
  pav(uC, vC);
}

function sriMariamman(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const cream = new THREE.MeshStandardMaterial({ color: 0xefe0c6, roughness: 0.9 });
  const terra = new THREE.MeshStandardMaterial({ color: 0xb0512f, roughness: 0.85 });
  const greyStone = new THREE.MeshStandardMaterial({ color: 0x5e6266, roughness: 0.8 });
  const poly = new THREE.MeshStandardMaterial({ color: 0xb9c3cb, roughness: 0.9 });
  const green = new THREE.MeshStandardMaterial({ color: 0x585f4e, roughness: 0.9 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9ae52, roughness: 0.4, metalness: 0.5 });
  const cow = new THREE.MeshStandardMaterial({ color: 0xdcdcd6, roughness: 0.85 });
  // the low hall: cream walls with green shallow barrel-vault roofs
  api.world.add(api.extrude(b.p, 8.6, cream, 0));
  api.world.add(api.extrude(api.grow(b.p, 1.005), 0.5, terra, 8.6));
  // street frame from the SURVEYED street, not from a guessed edge: the
  // gopuram stands flush with the South Bridge Road boundary, ~60% along
  // the frontage from the SSW end (researched; NOT centred)
  const yawS = Math.atan2(sw.nx, sw.nz);           // facing the street
  const tX = -sw.nz, tZ = sw.nx;                   // along the street
  // march from the centre toward the street to find the property edge
  let edge = 0;
  for (let d2 = 1; d2 < 40; d2 += 0.5) {
    if (!pointInRing(ob.cx + sw.nx * d2, ob.cz + sw.nz * d2, b.p)) { edge = d2 - 0.5; break; }
  }
  const bl = Math.max(16, ob.halfShort * 2);
  // (the green barrel vaults were cut in round 3: modelled as half-
  // cylinders they read as giant claws from the street, and the research
  // says the recognition lives in the gopuram, the cream wall and the
  // cows — not the court roofs. Flat roof + terracotta coping stay.)
  // Nandi cows: the dotted white line along the street coping
  for (let u = -bl / 2 + 1.5; u < bl / 2 - 1.5; u += 3.5) {
    const cx2 = ob.cx + sw.nx * edge + tX * u, cz2 = ob.cz + sw.nz * edge + tZ * u;
    if (onCarriageway(cx2, cz2, 0.25)) continue;
    if (!pointInRing(cx2 - sw.nx * 0.5, cz2 - sw.nz * 0.5, b.p)) continue;
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.42), cow);
    c.rotation.y = yawS + Math.PI / 2;
    c.position.set(cx2, g0 + 9.35, cz2);
    api.world.add(c);
  }
  // THE GOPURAM: grey portal 39%, polychrome tower 61%, FIVE tiers +
  // flattened barrel crest (roots.gov.sg/NLB: five, not six), ~16m total
  // (the published "5m" is wrong by 3x — see the research note)
  const gu = bl * 0.10;
  const gx = ob.cx + sw.nx * (edge - 1.9) + tX * gu;
  const gz = ob.cz + sw.nz * (edge - 1.9) + tZ * gu;
  const H = 16.0, portalH = H * 0.39, towerH = H * 0.61;
  const portal = new THREE.Mesh(new THREE.BoxGeometry(6.4, portalH, 3.5), greyStone);
  portal.rotation.y = yawS;
  portal.position.set(gx, g0 + portalH / 2, gz);
  portal.castShadow = true;
  api.world.add(portal);
  const tierFrac = [0.23, 0.18, 0.16, 0.14, 0.13];
  const widFrac = [1.0, 0.90, 0.81, 0.71, 0.62];
  const T1W = 7.5;
  let ty = portalH;
  tierFrac.forEach((f, i) => {
    const th = towerH * f, tw = T1W * widFrac[i];
    const tier = new THREE.Mesh(new THREE.BoxGeometry(tw, th, 3.4 * widFrac[i]), poly);
    tier.rotation.y = yawS;
    tier.position.set(gx, g0 + ty + th / 2, gz);
    tier.castShadow = true;
    api.world.add(tier);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(tw * 1.07, 0.28, 3.4 * widFrac[i] * 1.07), terra);
    c2.rotation.y = yawS;
    c2.position.set(gx, g0 + ty + th, gz);
    api.world.add(c2);
    ty += th;
  });
  const crest = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, T1W * 0.53, 10, 1, false, 0, Math.PI), terra);
  crest.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(tX, 0, tZ));
  crest.rotateY(Math.PI / 2);
  crest.scale.set(1, 1, 0.8);
  crest.position.set(gx, g0 + ty, gz);
  api.world.add(crest);
  for (let k = -2; k <= 2; k++) {
    const kal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 6), gold);
    kal.position.set(gx + tX * k * 0.85, g0 + ty + 1.6, gz + tZ * k * 0.85);
    api.world.add(kal);
  }
}


// LAU PA SAT, 18 Raffles Quay. Researched 2026-07-30 (research/
// laupasat-peoplespark.md). Corrections that shaped this: the roof is TWO
// tiers + a lantern/clock tower, not one; the ironwork is TWO-colour —
// green columns/arches but CREAM valance, cresting, lantern and the whole
// clock tower (all-green is the classic error); the "125 ft across" figure
// describes Coleman's demolished 1838 market — the real 1894 octagon is
// ~70m across flats (our footprint agrees); height UNPUBLISHED, apex ~24m
// photogrammetric estimate. Fully open sides: columns + shadow, no walls.
function lauPaSat(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const cx = ob.cx, cz = ob.cz;
  const green = new THREE.MeshStandardMaterial({ color: 0x3a5c48, roughness: 0.6, metalness: 0.35 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xeae6dc, roughness: 0.7 });
  const tiles = new THREE.MeshStandardMaterial({ color: 0xb4785e, roughness: 0.85 });
  const dial = new THREE.MeshStandardMaterial({ color: 0xf2efe7, roughness: 0.6 });
  // octagon sized from the REAL footprint: area = 2*sqrt(2) * Rcirc^2
  const R = Math.sqrt((b.a || 3800) / 2.8284);
  const oct = (rTop, rBot, h, mat, y, open4 = false) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 8, 1, open4), mat);
    m.rotation.y = ob.ang + Math.PI / 8;   // flats toward the streets
    m.position.set(cx, g0 + y + h / 2, cz);
    m.castShadow = true;
    api.world.add(m);
    return m;
  };
  // dark interior mass so the open hall reads as columns + SHADOW, not as
  // a see-through void with the far street visible inside it
  oct(R * 0.92, R * 0.92, 7.2, new THREE.MeshStandardMaterial({ color: 0x241f19, roughness: 1 }), 0.1);
  // the perimeter colonnade: 5 bays per face, green columns at the
  // column-line octagon
  for (let f = 0; f < 8; f++) {
    const a0 = ob.ang + Math.PI / 8 + (f / 8) * Math.PI * 2;
    const v0x = cx + Math.cos(a0) * R, v0z = cz + Math.sin(a0) * R;
    const a1 = a0 + Math.PI / 4;
    const v1x = cx + Math.cos(a1) * R, v1z = cz + Math.sin(a1) * R;
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      const px = v0x + (v1x - v0x) * t, pz = v0z + (v1z - v0z) * t;
      if (onCarriageway(px, pz, 0.2)) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 7.5, 8), green);
      col.position.set(px, g0 + 3.75, pz);
      col.castShadow = true;
      api.world.add(col);
    }
  }
  // cream eave valance ring: the iron lace, as a thin banded octagon
  oct(R * 1.045, R * 1.045, 0.55, cream, 7.0);
  // lower tiled roof: wide frustum with ~4m eaves, then cream cresting
  oct(R * 0.66, R * 1.11, 4.0, tiles, 7.5);
  oct(R * 0.655, R * 0.655, 0.5, cream, 11.5);
  // inner skylight ring rising to the drum
  oct(R * 0.24, R * 0.65, 3.0, tiles, 11.7);
  oct(R * 0.24, R * 0.24, 1.2, cream, 14.6);
  // lantern, clock stage with four dials, ogee-ish crown, finial — CREAM
  oct(2.9, 3.2, 4.0, cream, 15.8);
  {
    const clock = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.6, 4.2), cream);
    clock.rotation.y = ob.ang + Math.PI / 8;
    clock.position.set(cx, g0 + 19.8 + 2.3, cz);
    clock.castShadow = true;
    api.world.add(clock);
    for (let f = 0; f < 4; f++) {
      const a2 = ob.ang + Math.PI / 8 + (f / 4) * Math.PI * 2;
      const d = new THREE.Mesh(new THREE.CircleGeometry(1.35, 20), dial);
      d.position.set(cx + Math.cos(a2) * 2.13, g0 + 22.1, cz + Math.sin(a2) * 2.13);
      d.rotation.y = -a2 + Math.PI / 2;
      api.world.add(d);
    }
  }
  const crown = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.6, 8), cream);
  crown.rotation.y = ob.ang + Math.PI / 8;
  crown.position.set(cx, g0 + 24.4 + 1.3, cz);
  crown.castShadow = true;
  api.world.add(crown);
  const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 6), cream);
  fin.position.set(cx, g0 + 26.9, cz);
  api.world.add(fin);
  // eight gabled entrance porches, one per face centre: green fan window,
  // cream bargeboard
  for (let f = 0; f < 8; f++) {
    const aM = ob.ang + Math.PI / 8 + ((f + 0.5) / 8) * Math.PI * 2;
    const fx2 = Math.cos(aM), fz2 = Math.sin(aM);
    const gx2 = cx + fx2 * (R * 0.924 + 2.0), gz2 = cz + fz2 * (R * 0.924 + 2.0);
    if (onCarriageway(gx2, gz2, 0.2)) continue;
    const gab = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 3.1, 3.4, 3), tiles);
    gab.rotation.y = -aM + Math.PI / 2;
    gab.rotation.x = 0;
    gab.position.set(gx2, g0 + 9.2, gz2);
    gab.castShadow = true;
    api.world.add(gab);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(1.5, 14, 0, Math.PI), green);
    fan.position.set(gx2 + fx2 * 1.3, g0 + 7.9, gz2 + fz2 * 1.3);
    fan.rotation.y = -aM - Math.PI / 2;
    api.world.add(fan);
  }
}

// PEOPLE'S PARK COMPLEX, 1 Park Road. Researched 2026-07-30 — the finding
// that matters: it is RED AND WHITE TODAY (repainted 2025; verified against
// photographs dated Feb 2026). Raw grey concrete died in 1989 and the
// yellow+green scheme in 2025 — every older source is stale. 6-storey
// podium (~25m, the mapped height) + 25-storey slab to 103m (published),
// slab ~96x15m along the podium's long axis, five service shafts with RED
// water tanks above the roofline — the skyline signature.
function peoplesPark(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const red = new THREE.MeshStandardMaterial({ color: 0xc0281e, roughness: 0.8 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf0efeb, roughness: 0.8 });
  const crownM = new THREE.MeshStandardMaterial({ color: 0xb9b7b2, roughness: 0.85 });
  const win = new THREE.MeshStandardMaterial({ color: 0x3b4145, roughness: 0.5 });
  // podium: the real footprint, red, with a white frieze band at its head
  api.world.add(api.extrude(b.p, 25.0, red, 0));
  api.world.add(api.extrude(api.grow(b.p, 1.005), 1.4, white, 21.6));
  // the slab: 96 x 15 along the long axis, base at the podium head
  const yawL = Math.atan2(ob.ux, ob.uz);
  const at = (mesh, lx, y, lz) => {
    const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
    mesh.position.set(ob.cx + xA.x * lx + ob.ux * lz, y, ob.cz + xA.z * lx + ob.uz * lz);
    mesh.castShadow = true;
    api.world.add(mesh);
  };
  const SL = Math.min(96, ob.halfLong * 2 * 0.72), SD = 15, SH = 78;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(SD, SH, SL), red);
  slab.rotation.y = yawL;
  at(slab, -ob.halfShort * 0.22, g0 + 25 + SH / 2, 0);
  // banding: dark window strips, with a WHITE corridor band every 5th floor
  for (let fl = 0; fl < 25; fl++) {
    const y = g0 + 25 + fl * 3.1 + 1.55;
    const corridor = fl % 5 === 4;
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(SD + 0.14, corridor ? 1.5 : 1.4, SL * 0.98),
      corridor ? white : win);
    band.rotation.y = yawL;
    at(band, -ob.halfShort * 0.22, y, 0);
  }
  // porthole crown band
  const crown = new THREE.Mesh(new THREE.BoxGeometry(SD - 1.2, 3.2, SL - 1.6), crownM);
  crown.rotation.y = yawL;
  at(crown, -ob.halfShort * 0.22, g0 + 25 + SH + 1.6, 0);
  // five service shafts + RED cylindrical water tanks over the roofline
  for (let k = -2; k <= 2; k++) {
    const lz = k * (SL / 5.2);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(5, SH + 8, 7), white);
    shaft.rotation.y = yawL;
    at(shaft, -ob.halfShort * 0.22 - SD / 2 - 2.2, g0 + 25 + (SH + 8) / 2, lz);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 2.8, 14), red);
    at(tank, -ob.halfShort * 0.22 - SD / 2 - 2.2, g0 + 25 + SH + 8 + 1.4, lz);
  }
}


// THIAN HOCK KENG, 158 Telok Ayer Street — Singapore's oldest Hokkien
// temple (1839-42), National Monument. Researched 2026-07-30 (research/
// thianhockkeng-clarkequay.md). Corrections that shaped this: the street
// front is THREE sections (raised centre + two lower sides), each with its
// own swallowtail ridge — not one sweeping curve; the ridge tips are
// plastered SWALLOWTAIL forks, not dragons (the dragons are separate roof
// sculptures); the roofs read GREEN-AND-TERRACOTTA striped (green glazed
// cover tiles over terracotta pans — a documented change from the
// original); single-storey halls throughout, main hall DOUBLE-EAVED and
// taller than the entrance hall; flush to the street behind a granite
// plinth with a pale-jade cast-iron railing. Heights UNPUBLISHED — the
// proportion table is photogrammetric, anchored to the 2,807 m2 footprint.
function thianHockKeng(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const roofM = new THREE.MeshStandardMaterial({ color: 0x7e8c63, roughness: 0.8 });
  const drip = new THREE.MeshStandardMaterial({ color: 0x5f7f52, roughness: 0.7 });
  const spineM = new THREE.MeshStandardMaterial({ color: 0xc9ccc8, roughness: 0.8 });
  const granite = new THREE.MeshStandardMaterial({ color: 0xa9a6a0, roughness: 0.85 });
  const wallG = new THREE.MeshStandardMaterial({ color: 0x8e8b82, roughness: 0.9 });
  const oxblood = new THREE.MeshStandardMaterial({ color: 0x7c2e22, roughness: 0.8 });
  const jade = new THREE.MeshStandardMaterial({ color: 0x6fbfb0, roughness: 0.6, metalness: 0.3 });
  const yawL = Math.atan2(ob.ux, ob.uz);
  const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
  const zA = { x: ob.ux, z: ob.uz };
  const at = (mesh, lx, y, lz, cast = true) => {
    mesh.position.set(ob.cx + xA.x * lx + zA.x * lz, y, ob.cz + xA.z * lx + zA.z * lz);
    mesh.castShadow = cast;
    api.world.add(mesh);
  };
  // ring extents in the local frame; the street side by sw
  let uMn = 1e9, uMx = -1e9, vMn = 1e9, vMx = -1e9;
  for (const [rx2, rz2] of b.p) {
    const dx2 = rx2 - ob.cx, dz2 = rz2 - ob.cz;
    const u2 = dx2 * xA.x + dz2 * xA.z, v2 = dx2 * zA.x + dz2 * zA.z;
    uMn = Math.min(uMn, u2); uMx = Math.max(uMx, u2);
    vMn = Math.min(vMn, v2); vMx = Math.max(vMx, v2);
  }
  const uC = (uMn + uMx) / 2;
  const sDot = Math.sign(sw.nx * zA.x + sw.nz * zA.z) || 1;
  const vStreet = sDot > 0 ? vMx : vMn;
  const W = Math.min(43, uMx - uMn);
  // plinth + the dark courtyard interior mass (so the compound reads
  // enclosed, not hollow)
  api.world.add(api.extrude(b.p, 0.45, granite, 0));
  api.world.add(api.extrude(api.grow(b.p, 0.94), 3.4,
    new THREE.MeshStandardMaterial({ color: 0x2a241d, roughness: 1 }), g0 + 0.45));
  // one hall: walls + striped hip roof + pale ridge spine + upturned
  // swallowtail fork tips
  const hall = (lx, lz, w, d, wallH, ridgeH, tips = true) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, wallH, d * 0.86), wallG);
    wall.rotation.y = yawL;
    at(wall, lx, g0 + 0.45 + wallH / 2, lz);
    const roofG = new THREE.CylinderGeometry(0.10, 0.71, 1, 4);
    roofG.rotateY(Math.PI / 4);
    roofG.scale(w * 1.12, ridgeH - wallH, d * 1.18);
    const roof = new THREE.Mesh(roofG, roofM);
    roof.rotation.y = yawL;
    at(roof, lx, g0 + 0.45 + wallH + (ridgeH - wallH) / 2, lz);
    // green glazed drip course along the eave, oxblood fascia under it
    const dripB = new THREE.Mesh(new THREE.BoxGeometry(w * 1.12, 0.22, d * 1.18), drip);
    dripB.rotation.y = yawL;
    at(dripB, lx, g0 + 0.45 + wallH + 0.05, lz, false);
    const fas = new THREE.Mesh(new THREE.BoxGeometry(w * 1.06, 0.3, d * 1.10), oxblood);
    fas.rotation.y = yawL;
    at(fas, lx, g0 + 0.45 + wallH - 0.2, lz, false);
    // ridge spine with the forked tips rising at both ends
    const spine = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.55, 0.35), spineM);
    spine.rotation.y = yawL;
    at(spine, lx, g0 + 0.45 + ridgeH + 0.2, lz, false);
    if (tips) {
      for (const sgn of [-1, 1]) {
        const tip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.3), spineM);
        tip.rotation.y = yawL;
        tip.rotation.z = sgn * 0.5;
        at(tip, lx + sgn * w * 0.37, g0 + 0.45 + ridgeH + 0.75, lz, false);
      }
    }
  };
  // entrance row on the street: raised centre + two lower sides
  const dEntr = 11.0;
  const lzE = vStreet - sDot * (dEntr / 2 + 0.6);
  hall(uC, lzE, W * 0.38, dEntr, 4.3, 8.15);
  hall(uC - W * 0.345, lzE, W * 0.27, dEntr, 3.9, 6.55);
  hall(uC + W * 0.345, lzE, W * 0.27, dEntr, 3.9, 6.55);
  // main hall behind the courtyard: double-eaved, taller
  const lzM = vStreet - sDot * (dEntr + 14);
  hall(uC, lzM, W * 0.42, 14, 4.6, 7.6, false);
  hall(uC, lzM, W * 0.34, 10.5, 6.8, 10.1);
  // granite veranda columns + the pale-jade railing along the street
  const railZ = vStreet - sDot * 0.7;
  for (let k = -3; k <= 3; k++) {
    const lx = uC + k * (W * 0.94 / 7);
    const px = ob.cx + xA.x * lx + zA.x * railZ, pz = ob.cz + xA.z * lx + zA.z * railZ;
    if (onCarriageway(px, pz, 0.2)) continue;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 3.9, 8), granite);
    at(col, lx, g0 + 0.45 + 1.95, railZ);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 1.1, 0.08), jade);
  rail.rotation.y = yawL;
  at(rail, uC, g0 + 0.45 + 0.55, railZ, false);
}


// CLARKE QUAY BLOCKS, researched 2026-07-30 (research/thianhockkeng-
// clarkequay.md). The finding that matters: after the 2022-24 works the
// WAREHOUSES (Foundry, Cannery) are NOT pastel — cream walls, dark-green
// and blue timber doors, dark grey-brown roofs, seven parallel gabled
// ranges with reinstated jack-roof monitors. The PASTEL lives on the
// shophouse blocks (Merchants' Court): one colour per ~7m bay from the
// documented set, white trim, terracotta pantile roofs. Angels/bluebell
// canopies are noted in NEXT.md as riverside props, not building fabric.
function cqWarehouse(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const cream = new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.9 });
  const roofM = new THREE.MeshStandardMaterial({ color: 0x4a4340, roughness: 0.9 });
  const doorG = new THREE.MeshStandardMaterial({ color: 0x1f4a3e, roughness: 0.8 });
  const doorB = new THREE.MeshStandardMaterial({ color: 0x2c6fbf, roughness: 0.8 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xf7f5ee, roughness: 0.85 });
  const yawL = Math.atan2(ob.ux, ob.uz);
  const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
  const at = (mesh, lx, y, lz, cast = true) => {
    mesh.position.set(ob.cx + xA.x * lx + ob.ux * lz, y, ob.cz + xA.z * lx + ob.uz * lz);
    mesh.castShadow = cast;
    api.world.add(mesh);
  };
  // cream body to the tall-godown eave, white barge trim at the head
  api.world.add(api.extrude(b.p, 8.5, cream, 0));
  api.world.add(api.extrude(api.grow(b.p, 1.005), 0.4, trim, 8.2));
  // RING extents, not the oriented box: The Foundry's ground footprint is
  // a chunky pentagon and box-extent ranges landed outside the walls
  // (round 1's failure, same lesson as buddhaTooth's roofs)
  const yawL2 = Math.atan2(ob.ux, ob.uz);
  const xA2 = { x: Math.cos(yawL2), z: -Math.sin(yawL2) };
  let uMn = 1e9, uMx = -1e9, vMn = 1e9, vMx = -1e9;
  for (const [rx2, rz2] of b.p) {
    const dx2 = rx2 - ob.cx, dz2 = rz2 - ob.cz;
    const u2 = dx2 * xA2.x + dz2 * xA2.z, v2 = dx2 * ob.ux + dz2 * ob.uz;
    uMn = Math.min(uMn, u2); uMx = Math.max(uMx, u2);
    vMn = Math.min(vMn, v2); vMx = Math.max(vMx, v2);
  }
  const uC2 = (uMn + uMx) / 2, vC2 = (vMn + vMx) / 2;
  const W2 = (uMx - uMn) * 0.9, L2 = (vMx - vMn) * 0.9;
  const ranges = Math.max(3, Math.round(L2 / 16));
  const rw = (L2 * 0.94) / ranges;
  for (let k = 0; k < ranges; k++) {
    const lz = vC2 - L2 * 0.47 + (k + 0.5) * rw;
    const g = new THREE.CylinderGeometry(0.02, 0.71, 1, 4);
    g.rotateY(Math.PI / 4);
    g.scale(W2 * 0.96, 3.5, rw * 0.96);
    const roof = new THREE.Mesh(g, roofM);
    roof.rotation.y = yawL;
    at(roof, uC2, g0 + 8.5 + 1.75, lz);
    const jack = new THREE.Mesh(new THREE.BoxGeometry(W2 * 0.4, 1.1, rw * 0.3), roofM);
    jack.rotation.y = yawL;
    at(jack, uC2, g0 + 12.2, lz);
  }
  // tall timber double doors along both long faces, alternating green/blue
  for (const sgn of [-1, 1]) {
    for (let k = 0; k < ranges; k++) {
      const lz = vC2 - L2 * 0.47 + (k + 0.5) * rw;
      const lu = uC2 + sgn * W2 * 0.485;
      const px = ob.cx + xA.x * lu + ob.ux * lz;
      const pz = ob.cz + xA.z * lu + ob.uz * lz;
      if (onCarriageway(px, pz, 0.15)) continue;
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.2, 3.0), k % 3 === 1 ? doorB : doorG);
      d.rotation.y = yawL;
      at(d, lu, g0 + 2.1, lz, false);
    }
  }
}

function cqShophouses(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const PASTELS = [0xe9a8ab, 0x86d3c2, 0xf1ede1, 0xe5b63c, 0xbbd1ba, 0xafc8dc, 0xefc09b, 0xc9b6d4];
  const trim = new THREE.MeshStandardMaterial({ color: 0xfbf9f4, roughness: 0.85 });
  const tile = new THREE.MeshStandardMaterial({ color: 0xc25a31, roughness: 0.85 });
  const yawL = Math.atan2(ob.ux, ob.uz);
  const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
  // deterministic per-building colour stream (never the global placement one)
  let hh = 0;
  for (const [x, z] of b.p) hh = (hh * 31 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
  // body: pastel segments along the long axis, one colour per ~7m bay
  const L2 = ob.halfLong * 2, W2 = ob.halfShort * 2;
  const bays = Math.max(3, Math.round(L2 / 7));
  const bw = (L2 * 0.96) / bays;
  for (let k = 0; k < bays; k++) {
    const lz = -L2 * 0.48 + (k + 0.5) * bw;
    const col = PASTELS[Math.abs(hh + k * 2654435761) % PASTELS.length];
    const seg = new THREE.Mesh(new THREE.BoxGeometry(W2 * 0.92, 7.0, bw * 0.99),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }));
    seg.rotation.y = yawL;
    seg.position.set(ob.cx + ob.ux * lz, g0 + 3.5, ob.cz + ob.uz * lz);
    seg.castShadow = true;
    api.world.add(seg);
  }
  // white trim band + the continuous terracotta pantile roof
  api.world.add(api.extrude(api.grow(b.p, 1.008), 0.5, trim, 6.6));
  const g = new THREE.CylinderGeometry(0.05, 0.71, 1, 4);
  g.rotateY(Math.PI / 4);
  g.scale(W2 * 1.02, 3.2, L2 * 1.0);
  const roof = new THREE.Mesh(g, tile);
  roof.rotation.y = yawL;
  roof.position.set(ob.cx, g0 + 7.0 + 1.6, ob.cz);
  roof.castShadow = true;
  api.world.add(roof);
}


// SULTAN MOSQUE (Masjid Sultan), 3 Muscat Street — Denis Santry, 1932,
// National Monument. Researched 2026-07-30 (research/sultanmosque-
// cbdtrio.md). Corrections built in: the dome is 12.19m diameter with its
// crown at 30.48m (the touristic "27m diameter, 36m high" is impossible);
// FOUR minarets, not six, topping out BELOW the domes; the famous band is
// glass BOTTLE ENDS at the dome NECK (a dark specular collar), not caps
// over the surface; both domes are EQUAL; the facade is warm cream, not
// white. The dome is a plump ogee bulb overhanging its drum — profile
// from the research's lathe table.
function sultanMosque(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const cream = new THREE.MeshStandardMaterial({ color: 0xede6d3, roughness: 0.85 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.30, metalness: 0.85 });
  const bottle = new THREE.MeshStandardMaterial({ color: 0x1e1c1f, roughness: 0.15, metalness: 0.4 });
  const drum = new THREE.MeshStandardMaterial({ color: 0xb08e82, roughness: 0.8 });
  const stoneT = new THREE.MeshStandardMaterial({ color: 0x8c8578, roughness: 0.85 });
  const trimG = new THREE.MeshStandardMaterial({ color: 0xc39b4e, roughness: 0.6, metalness: 0.3 });
  const yawL = Math.atan2(ob.ux, ob.uz);
  const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
  const at = (mesh, lx, y, lz, cast = true) => {
    mesh.position.set(ob.cx + xA.x * lx + ob.ux * lz, y, ob.cz + xA.z * lx + ob.uz * lz);
    mesh.castShadow = cast;
    api.world.add(mesh);
  };
  const sDot = Math.sign(sw.nx * ob.ux + sw.nz * ob.uz) || 1;  // +lz toward the street?
  // the massing rectangles, scaled to THIS footprint's oriented box
  const L = ob.halfLong * 2, W = ob.halfShort * 2;
  const main = new THREE.Mesh(new THREE.BoxGeometry(W * 0.72, 15.5, L * 0.70), cream);
  main.rotation.y = yawL;
  at(main, 0, g0 + 7.75, 0);
  const entr = new THREE.Mesh(new THREE.BoxGeometry(W * 0.46, 18.5, L * 0.10), cream);
  entr.rotation.y = yawL;
  at(entr, 0, g0 + 9.25, sDot * L * 0.40);
  const mihrab = new THREE.Mesh(new THREE.BoxGeometry(W * 0.24, 15.5, L * 0.10), cream);
  mihrab.rotation.y = yawL;
  at(mihrab, 0, g0 + 7.75, -sDot * L * 0.40);
  // gold-ochre string courses on the entrance pavilion
  for (const y2 of [12.6, 17.8]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(W * 0.47, 0.5, L * 0.105), trimG);
    band.rotation.y = yawL;
    at(band, 0, g0 + y2, sDot * L * 0.40, false);
  }
  // merlon cresting: a thin toothed parapet ring, instanced as one strip
  const cres = new THREE.Mesh(new THREE.BoxGeometry(W * 0.73, 0.8, L * 0.71), stoneT);
  cres.rotation.y = yawL;
  at(cres, 0, g0 + 15.9, 0, false);
  // ONE DOME (equal pair): stepped base, drum collar, dark bottle band,
  // gold ogee lathe, finial. R = 6.1m per the published 40ft.
  const R = 6.1;
  const domeAt = (lz) => {
    const base = new THREE.Mesh(new THREE.BoxGeometry(14, 4.0, 14), cream);
    base.rotation.y = yawL;
    at(base, 0, g0 + 18.0, lz);
    const dc = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.92, R * 0.845, 1.6, 24), drum);
    at(dc, 0, g0 + 20.8, lz);
    const bb = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.98, R * 0.92, 1.5, 24), bottle);
    at(bb, 0, g0 + 22.35, lz);
    // the researched ogee profile: (h/R, r/R) pairs
    const prof = [[0, 0.98], [0.26, 1.0], [0.52, 0.99], [0.69, 0.95], [0.86, 0.88],
                  [1.03, 0.79], [1.21, 0.61], [1.32, 0.42], [1.42, 0.001]];
    const pts = prof.map(([h2, r2]) => new THREE.Vector2(r2 * R, h2 * R));
    const dome = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), gold);
    at(dome, 0, g0 + 23.1, lz);
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 3.4, 8), gold);
    at(fin, 0, g0 + 33.0, lz);
    // chhatris: four small gold-capped pavilions at the base corners
    for (const [cx2, cz2] of [[-5.6, -5.6], [5.6, -5.6], [-5.6, 5.6], [5.6, 5.6]]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 8), cream);
      at(post, cx2, g0 + 20.6, lz + cz2);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1.05, 10, 8), gold);
      cap.scale.y = 0.85;
      at(cap, cx2, g0 + 22.1, lz + cz2);
    }
  };
  domeAt(sDot * L * 0.30);
  domeAt(-sDot * L * 0.30);
  // four corner minarets: octagonal cream shafts, gallery ring, gold cap —
  // tips BELOW the dome crowns (researched)
  for (const [mu, mv] of [[-W * 0.36, L * 0.31], [W * 0.36, L * 0.31],
                          [W * 0.36, -L * 0.31], [-W * 0.36, -L * 0.31]]) {
    const px = ob.cx + xA.x * mu + ob.ux * mv, pz = ob.cz + xA.z * mu + ob.uz * mv;
    if (onCarriageway(px, pz, 0.2)) continue;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, 22, 8), cream);
    at(shaft, mu, g0 + 11, mv);
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.2, 8), stoneT);
    at(gal, mu, g0 + 22.6, mv);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 8), gold);
    cap.scale.y = 0.9;
    at(cap, mu, g0 + 24.2, mv);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.6, 6), gold);
    at(tip, mu, g0 + 25.8, mv);
  }
}


// MASJID JAMAE (CHULIA), 218 South Bridge Road. 1830-35, National Monument.
// research/chinatown-littleindia-landmarks.md section 1.
//
// WHY IT NEEDED A RECIPE AT ALL. OSM tags it `height=10, building:levels=2,
// source=Kaart Ground Survey 2017` and that survey is of the LOW MASS. The
// minarets are roughly 40% taller than the whole building we were drawing, so
// the one thing on South Bridge Road that everybody recognises was a 10m box.
//
// AND IT IS GREEN. Pale olive with white trim, and has been since the early
// 1990s; the generic fabric painted it beige, which is thirty years out of
// date.
//
// No metre height is published for the gateway, the minarets or the halls —
// the figures below are photo-estimates scaled against the adjoining
// two-storey shophouse parapet (taken at 8.5-9.0m) and are labelled as such in
// the research file. What IS published is the composition: a pair of octagonal
// minarets of SEVEN tiers of double arch-shaped niches, a "miniature palace"
// screen on the gateway roof, and terracotta-tiled hipped halls behind.
function masjidJamae(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const green = new THREE.MeshStandardMaterial({ color: 0x7e8c6a, roughness: 0.9 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2efe4, roughness: 0.85 });
  const terra = new THREE.MeshStandardMaterial({ color: 0xa8543a, roughness: 0.9 });
  const domeM = new THREE.MeshStandardMaterial({ color: 0xdfe3cf, roughness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3b3f36, roughness: 0.95 });

  // the street edge, walked out from the centroid exactly as sriMariamman does
  let edge = 0;
  for (let d = 1; d < 45; d += 0.5) {
    if (!pointInRing(ob.cx + sw.nx * d, ob.cz + sw.nz * d, b.p)) { edge = d - 0.5; break; }
  }
  const yaw = Math.atan2(sw.nx, sw.nz);       // facing the street
  const tX = -sw.nz, tZ = sw.nx;              // along the street
  const put = (mesh, u, y, into, cast = true) => {
    mesh.rotation.y = yaw;
    mesh.position.set(ob.cx + sw.nx * (edge - into) + tX * u,
                      y, ob.cz + sw.nz * (edge - into) + tZ * u);
    mesh.castShadow = cast;
    api.world.add(mesh);
  };

  // THE COMPOUND. A low green perimeter — wall to the street, arcaded halls
  // behind — rather than one solid mass: the whole ground floor of this site
  // is a courtyard entered through the gateway arch, and extruding the ring
  // solid would fill it in.
  // NO api.extrude FOR THE COMPOUND WALL. Round 2 called
  // `api.extrude(b.p, 2.6, green, g0)` — the same call sriMariamman makes — and
  // INSTRUMENTING the result (rather than looking at another frame and
  // guessing, which is how Clarke Quay burned three rounds) showed it landing
  // at y 18.1 to 20.7 on ground of 9.0: a 63x43m green slab floating nine
  // metres up over the whole site, which is what made both vet frames read as a
  // green blob. Whatever that call resolves to on this footprint, it is not the
  // seat this recipe wants, and every piece placed through put() below measured
  // exactly where it was asked to be. So the wall is a placed box like
  // everything else here.
  const CW = ob.halfShort * 2 * 0.96, CD = ob.halfLong * 2 * 0.90;
  put(new THREE.Mesh(new THREE.BoxGeometry(CW, 2.6, CD), green), 0, g0 + 1.3, CD * 0.5, false);
  // The halls: a single arcaded storey in the rear of the compound under a
  // terracotta hipped roof. Kept LOW and kept BACK on purpose — the whole
  // identity of this site is that the gateway and its minarets are the tallest
  // thing on it, and round 1 built a hall so large it read as the building.
  const HW = ob.halfShort * 2 * 0.55, HL = ob.halfLong * 2 * 0.34;
  const HH = 5.6, HY = g0 + HH / 2;
  const HINTO = edge * 0.62 + HL * 0.5;
  put(new THREE.Mesh(new THREE.BoxGeometry(HW, HH, HL), white), 0, HY, HINTO);
  // ...and the roof SITS ON IT. Round 1 put the cap at an absolute y that had
  // nothing to do with the hall's top and it floated 2.6m clear of it — two
  // red shelves in the sky, which is the same "a mass and its cap chose
  // different datums" family the extrudeGeo footing bug came from.
  const roof = new THREE.Mesh(new THREE.BoxGeometry(HW * 1.08, 1.3, HL * 1.08), terra);
  put(roof, 0, g0 + HH + 0.65, HINTO, false);

  // THE GATEWAY: a solid green block standing hard on the pavement, 5.5m to a
  // deep white cornice. ~9m of street frontage — OSM traces the PASSAGE (5.9m),
  // not the gateway wall, so the traced width is not the built width.
  const GW = 9.0, GD = 3.6, GH = 5.5;
  put(new THREE.Mesh(new THREE.BoxGeometry(GW, GH, GD), green), 0, g0 + GH / 2, GD / 2);
  // the pointed-arch opening, as a recessed dark reveal with a white surround
  put(new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.0, 0.35), white), 0, g0 + 2.0, GD - 0.12);
  put(new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.5, 0.3), dark), 0, g0 + 1.75, GD - 0.30);
  // THREE white horizontal mouldings on each pier — the strongest small-scale
  // rhythm on the whole thing, and the one that reads at riding speed
  for (const y of [1.7, 3.1, 4.5]) {
    for (const sgn of [-1, 1]) {
      put(new THREE.Mesh(new THREE.BoxGeometry(GW / 2 - 1.6, 0.22, GD + 0.14),
                         white), sgn * (GW / 4 + 0.8), g0 + y, GD / 2, false);
    }
  }
  // the deep projecting cornice, green over a white lower moulding
  put(new THREE.Mesh(new THREE.BoxGeometry(GW + 0.7, 0.28, GD + 0.7), white),
      0, g0 + GH - 0.16, GD / 2, false);
  put(new THREE.Mesh(new THREE.BoxGeometry(GW + 0.6, 0.5, GD + 0.6), green),
      0, g0 + GH + 0.25, GD / 2, false);

  // THE MINIATURE PALACE on the gateway deck: two tiers of tiny arched
  // openings, a balustraded parapet, and a row of about six small onion domes.
  const PW = 6.0, PH = 2.2, PY = g0 + GH + 0.5;
  put(new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 1.1), white), 0, PY + PH / 2, GD / 2 + 0.2);
  for (const ty of [0.55, 1.45]) {
    for (let k = -4; k <= 4; k++) {
      put(new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.46, 0.10), dark),
          k * 0.62, PY + ty, GD / 2 + 0.75, false);
    }
  }
  put(new THREE.Mesh(new THREE.BoxGeometry(PW + 0.3, 0.30, 1.3), white),
      0, PY + PH + 0.15, GD / 2 + 0.2, false);
  for (let k = -2.5; k <= 2.5; k += 1) {
    const kiosk = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), domeM);
    kiosk.scale.y = 1.25;
    put(kiosk, k * 1.05, PY + PH + 0.55, GD / 2 + 0.2, false);
  }

  // THE TWO MINARETS. Octagonal, seven tiers divided by white bands, each
  // pierced by double arch-shaped niches, capped by a ribbed onion dome with a
  // spike finial. ~14m to the finial, which is the whole point of the recipe.
  const MR = 0.85, TOP = 13.2;
  for (const sgn of [-1, 1]) {
    const u = sgn * (GW / 2 - 0.9);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(MR * 0.86, MR, TOP, 8), green);
    put(shaft, u, g0 + TOP / 2, GD / 2);
    for (let t = 1; t <= 7; t++) {
      const y = g0 + TOP * (t / 7.6);
      put(new THREE.Mesh(new THREE.CylinderGeometry(MR * 1.06, MR * 1.06, 0.22, 8), white),
          u, y, GD / 2, false);
      // the double niche: two dark slots per tier on the street face
      for (const o of [-0.28, 0.28]) {
        put(new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.62, 0.10), dark),
            u + o, y + 0.62, GD / 2 + MR * 0.92, false);
      }
    }
    // ribbed onion dome + finial
    const prof = [[0, 0.92], [0.30, 1.06], [0.62, 1.02], [0.88, 0.86],
                  [1.12, 0.60], [1.30, 0.30], [1.42, 0.001]];
    const dome = new THREE.Mesh(
      new THREE.LatheGeometry(prof.map(([h, r]) => new THREE.Vector2(r * MR * 1.25, h * MR * 1.25)), 12),
      domeM);
    put(dome, u, g0 + TOP, GD / 2);
    put(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.0, 6), domeM),
        u, g0 + TOP + 1.9, GD / 2, false);
  }
}


// CENTRIUM SQUARE, 320 Serangoon Road. 19 storeys, completed 2020 on the site
// of the former Serangoon Plaza. research/chinatown-littleindia-landmarks.md
// section 3.
//
// THE FOOTPRINT IS THE PODIUM. OSM's ring is 3,699 m2 against a published site
// area of 6,365.8 m2 — the missing 2,667 m2 is the forecourt and vehicle
// drop-off — and the office plate is a published 9,731 sq ft (~904 m2), about a
// QUARTER of the ring. Extruding the ring to 19 storeys draws an 80m-wide tower
// that does not exist, which is what the generic family was doing.
//
// NO METRE HEIGHT IS PUBLISHED. `b.h` is our own 19 x 3.4 and carries `levels`
// provenance; this recipe divides that height by the published floor stack
// rather than inventing a new figure: L1-2 retail, L3-4 car park, L5 facilities
// deck, L6-8 medical suites, L9-19 offices.
//
// WHAT A RIDER ACTUALLY SEES is not the tower at all — it is the podium's
// tessellated isometric-cube "tumbling blocks" cladding, and above all the
// CANOPY SOFFIT, which is the same pattern at its densest in vermillion-red and
// mustard-yellow, ten metres over their head. That is built here as panels
// rather than as a texture: a seam in a tiled cube pattern reads as a mistake,
// and the cubes are a metre across, which is geometry scale.
function centriumSquare(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const H = b.h || 64.6;
  const POD = H * 5 / 19;                      // five levels to the facilities deck
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x2e3134, roughness: 0.75 });
  const midGrey = new THREE.MeshStandardMaterial({ color: 0x8d9296, roughness: 0.8 });
  const offWhite = new THREE.MeshStandardMaterial({ color: 0xe8e6e1, roughness: 0.8 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.7 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xd8a72b, roughness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x3d4750, roughness: 0.18, metalness: 0.55,
  });

  // the podium, on the ring, and the tower set back on top of it
  api.world.add(api.extrude(b.p, POD, charcoal, 0));
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = -sw.nz, tZ = sw.nx;
  const at = (mesh, u, y, into, cast = true) => {
    mesh.rotation.y = yaw;
    mesh.position.set(ob.cx + tX * u - sw.nx * into, y, ob.cz + tZ * u - sw.nz * into);
    mesh.castShadow = cast;
    api.world.add(mesh);
  };
  // A SLIM SLAB, sized from the published plate rather than from the ring:
  // ~904 m2 over a 3,699 m2 podium. Set BACK from the street so the podium and
  // its canopy are what the frontage reads as, which is how it is built.
  const TW = ob.halfShort * 2 * 0.62, TD = ob.halfLong * 2 * 0.30;
  const TH = H - POD;
  at(new THREE.Mesh(new THREE.BoxGeometry(TW, TH, TD), glass), 0, g0 + POD + TH / 2,
     ob.halfLong * 0.30);
  // the A/C condenser ledges the owner's own page describes, as slab bands
  for (let y = POD + 3.4; y < H - 2; y += 3.4) {
    at(new THREE.Mesh(new THREE.BoxGeometry(TW + 0.5, 0.25, TD + 0.5), midGrey),
       0, g0 + y, ob.halfLong * 0.30, false);
  }

  // THE CANOPY over the drop-off, and its soffit. Projecting past the podium
  // face, which is what puts it over a rider's head at the kerb.
  const CY = g0 + POD * 0.56;
  // THE FRONTAGE IS MEASURED, NOT ASSUMED. Round 1 took the street face as
  // `halfShort * 2`, and Centrium Square's street face is its LONG side — 80.1m
  // to Serangoon Road — so the cube panels covered the middle quarter of the
  // facade and left the rest bare. An oriented box has two dimensions and
  // nothing about the box says which one meets the road; the street direction
  // does. Project the ring onto the along-street axis and use its real extent.
  let fu0 = Infinity, fu1 = -Infinity;
  for (const q of b.p) {
    const u = (q[0] - ob.cx) * tX + (q[1] - ob.cz) * tZ;
    if (u < fu0) fu0 = u;
    if (u > fu1) fu1 = u;
  }
  const CW = (fu1 - fu0) * 0.94;
  const CU = (fu0 + fu1) / 2;                 // the frontage is not centred on ob
  let edge = 0;
  for (let d = 1; d < 60; d += 0.5) {
    if (!pointInRing(ob.cx + sw.nx * d, ob.cz + sw.nz * d, b.p)) { edge = d - 0.5; break; }
  }
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(CW, 0.55, 5.0), charcoal);
  at(canopy, CU, CY, -(edge - 1.4));
  // the soffit, in cubes: the densest red and yellow in the whole composition
  // A TESSELLATION, NOT CONFETTI. Round 2 picked every cube's colour at random
  // and the facade read as noise with far too much red in it. Tumbling blocks
  // is a REGULAR pattern — three faces of one cube, three tones, repeating —
  // so the tone comes from the cell's own coordinates and only a small,
  // deterministic minority are swapped for the vermillion and mustard accents
  // that the research describes as "scattered through it".
  const TONES = [charcoal, midGrey, offWhite];
  const accent = (i, j) => {
    const h = ((i * 73856093) ^ (j * 19349663)) & 0x7fffffff;
    const r = (h % 1000) / 1000;
    return r < 0.07 ? red : r < 0.12 ? yellow : null;
  };
  let ci = 0;
  for (let u = CU - CW / 2 + 0.6; u < CU + CW / 2 - 0.6; u += 1.05, ci++) {
    let cj = 0;
    for (let v = -1.6; v <= 1.6; v += 1.05, cj++) {
      // the soffit is where the red and yellow are densest — the one thing a
      // rider passes directly under
      const a = accent(ci, cj);
      const m = a || (accent(ci + 7, cj + 3) ? red : TONES[(ci + cj) % 3]);
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.92), m);
      at(tile, u, CY - 0.32, -(edge - 1.4) - v, false);
    }
  }
  // and the same pattern on the podium's street face, quieter
  // FOLLOW THE WALL, COLUMN BY COLUMN — same fix as tekkaPlace, and for the same
  // reason. The cladding was drawn on ONE plane at a single `edge` distance, so
  // on a ring with a published 26.5 x 11.6m notch cut out of it, every column
  // that did not lie on that plane was buried inside the mass and the facade
  // appeared to stop halfway along.
  // PER-COLUMN WALL FOLLOWING WAS TRIED HERE AND REVERTED, 2026-08-01.
  //
  // tekkaPlace does follow its wall column by column and it works there, but
  // this recipe's `at()` helper measures `into` in the MINUS-normal direction
  // while the march measures it in the plus direction, and two attempts at
  // reconciling that produced three narrow strips and then four. The cladding
  // on one plane covers most of this frontage and reads correctly from the
  // street, which is the bar; a sign convention that has already eaten two
  // rounds is not worth a third without instrumenting the frame directions
  // first. The notch means the far end of the podium stays bare.
  let fi = 0;
  for (let u = CU - CW / 2 + 0.7; u < CU + CW / 2 - 0.7; u += 1.05, fi++) {
    const e2 = edge;
    let fj = 0;
    for (let y = 1.2; y < POD - 0.8; y += 1.05, fj++) {
      const m = accent(fi, fj) || TONES[(fi + fj) % 3];
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.10), m);
      at(tile, u, g0 + y, -(e2 + 0.06), false);
    }
  }
  // free-standing columns under the canopy, clad in the same cubes
  for (const u of [CU - CW * 0.34, CU, CU + CW * 0.34]) {
    const cxp = ob.cx + tX * u - sw.nx * (-(edge - 3.0));
    const czp = ob.cz + tZ * u - sw.nz * (-(edge - 3.0));
    if (onCarriageway(cxp, czp, 0.3)) continue;
    at(new THREE.Mesh(new THREE.BoxGeometry(0.75, CY - g0 - 0.3, 0.75), offWhite),
       u, g0 + (CY - g0) / 2, -(edge - 3.0));
  }
}


// FOOK HAI BUILDING, 150 South Bridge Road. A 1970s strata mall.
// research/chinatown-littleindia-landmarks.md section 2.
//
// THE STOREY COUNT IN CIRCULATION IS WRONG. SkyDB says "21 floors, completed
// 1974"; photographs show nine to eleven, and 21 floors inside OSM's 32m would
// be 1.5m per floor. Completion is disputed three ways (1974 / 1976 / 1977) and
// no source is preferred here because the recipe does not need one.
//
// OSM's height=32 is kept — it is the only figure available and it is
// consistent with 9-10 storeys at 3.2-3.5m — but it is NOT a survey: it was
// hand-entered in 2020 by a mapper with sixteen changesets, comment "Height
// Info", imagery "Bing", no source tag. Recorded so nobody later mistakes it
// for one.
//
// WHAT MAKES IT READ is not the height at all. It is a horizontal building:
// a stack of deeply recessed access-corridor bands, projecting slabs with dark
// voids between them, unbroken across the full width, with no vertical order
// anywhere — over a canopy with a ribbed soffit. And BOTH STREET CORNERS ARE
// CHAMFERED (9.0m and 9.1m), which the OSM ring already carries, so the mass
// gets that for free; it is what makes the block read as 1970s rather than as
// a box.
function fookHai(api, b) {
  const H = b.h || 32;
  const pale = new THREE.MeshStandardMaterial({ color: 0xcfcabf, roughness: 0.85 });
  const slate = new THREE.MeshStandardMaterial({ color: 0x3f4a52, roughness: 0.7 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.85 });

  // the mass, with its chamfers, and a plain parapet — flat top, no setback.
  // The tall slabs behind it in photographs are the 20-storey HDB blocks at
  // 533/535 Upper Cross Street, 54m away, and are a different building.
  api.world.add(api.extrude(b.p, H, pale, 0));
  api.world.add(api.extrude(api.grow(b.p, 1.006), 0.8, pale, H));

  // L1 shopfronts sit under a projecting canopy with a ribbed soffit
  const CAN = 4.4;
  api.world.add(api.extrude(api.grow(b.p, 1.035), 0.45, cream, CAN));
  api.world.add(api.extrude(api.grow(b.p, 1.030), 0.22, slate, CAN - 0.22));
  // L2, the near-blank mezzanine: a dark spandrel with one narrow glazing strip
  api.world.add(api.extrude(api.grow(b.p, 1.004), 2.6, slate, CAN + 0.45));
  // L3 is deliberately nothing — a large blank pale wall, because the mall
  // floors behind it are internalised. That blankness is half the building.

  // L4 upward: the corridor bands. A projecting slab edge, then a recessed
  // void, repeating to the parapet. Six or seven of them across the full width.
  const START = CAN + 0.45 + 2.6 + 3.2;
  const STEP = (H - 1.2 - START) / 6;
  for (let y = START; y < H - 1.4; y += STEP) {
    // DEEP ENOUGH TO CAST A SHADOW. Round 1 recessed the void by 1.2% of a 45m
    // plan — about 27cm — and the bands read as pencil lines instead of the
    // horizontal shadow-slots that are the whole character of the block. A
    // proportional inset needs to be checked against the real metres it makes.
    // A RECESS CUT INTO A SOLID MASS IS INVISIBLE. Round 2 deepened the inset
    // to 4.5% and nothing changed, because the full-height mass is already
    // drawn and anything grown INWARD from it is buried inside it — the same
    // trap that hid the second face of the direction gantries (a plane at the
    // backer's own centre is inside the backer). The void is drawn slightly
    // PROUD instead, so the elevation reads as what it is from the street:
    // alternating projecting slab and dark band.
    api.world.add(api.extrude(api.grow(b.p, 1.022), 0.34, pale, y));
    api.world.add(api.extrude(api.grow(b.p, 1.004), STEP - 0.34, slate, y + 0.34));
  }
}


// TEKKA PLACE — PARKED AT ROUND 3, 2026-08-01, AND DELIBERATELY NOT WIRED UP.
//
// The rule in this project is that a bespoke recipe which does not beat the
// generic is a regression, and after three rounds this one does not: the
// ninety-metre lotus screen keeps landing on the annex's twenty-metre END face
// instead of its long flank, and what is left is a bare charcoal slab, which is
// worse than the glazed block the generic draws.
//
// DIAGNOSED, so the next attempt does not start from zero. The face chooser
// offers three candidates — the streetward normal and the two normals
// perpendicular to the oriented box's long axis — and scores them by the extent
// of the ring projected onto each tangent. Removing the 1.15x "prefer the
// street" bias changed NOTHING, which means the long-flank candidates are being
// dropped before scoring: the only way out of that loop is `e <= 0`, i.e. the
// outward march from the centroid never leaves the ring. This annex's ring is
// long, thin and concave, so its centroid is very likely OUTSIDE it — the same
// concavity that D38 had to nudge around an hour earlier in the same session.
//
// THE NEXT STEP IS TO INSTRUMENT, NOT TO LOOK: print the three candidates'
// (extent, edge) pairs for both footprints before changing anything. That is
// what broke the Masjid Jamae loop after two wasted rounds, and it is written
// in WORKFLOW.md as the rule for exactly this situation.
//
// TEKKA PLACE, 2 Serangoon Road. ONG&ONG, 2019.
// research/chinatown-littleindia-landmarks.md section 4.
//
// TWO FOOTPRINTS, ONE NAME, AND THEY ARE DIFFERENT BUILDINGS. A 10-storey main
// block on the Serangoon Road corner with Citadines Rochor above it (2,446 m2),
// and a 7-storey car-park annex running about ninety metres along Rochor Canal
// (3,083 m2). They touch at one corner: an L, not one mass. Told apart by area
// here, because that is the only thing the recipe is handed — and the heights
// themselves were the wrong way round in the data until 2026-08-01, when OSM's
// own `parking=multi-storey` tag on the larger ring settled it.
//
// THE IDENTITY IS THE SCREEN: a perforated facade standing off the structure,
// square panels each cut with a four-petal lotus, referencing the louvred
// windows of the Little India shophouses. Terracotta and rust-clay, checkered
// with charcoal and cream. Ninety metres of it, with planting spilling over the
// top — which is what a rider actually gets, not the tower.
function tekkaPlace(api, b) {
  const H = b.h || 24;
  const ANNEX = (b.a || 0) > 2700;
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const sw = streetward(api, ob);
  const rust = new THREE.MeshStandardMaterial({ color: 0xa8552f, roughness: 0.85 });
  const clay = new THREE.MeshStandardMaterial({ color: 0x8d4526, roughness: 0.85 });
  const char = new THREE.MeshStandardMaterial({ color: 0x3a3a38, roughness: 0.8 });
  const creamM = new THREE.MeshStandardMaterial({ color: 0xded6c6, roughness: 0.85 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x35393d, roughness: 0.2, metalness: 0.5 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x4d6b3c, roughness: 0.95 });

  api.world.add(api.extrude(b.p, H, char, 0));

  // THE SCREEN GOES ON THE WIDEST FACE, WHICH IS NOT ALWAYS THE ONE FACING THE
  // DISTRICT AXIS. `streetward` measures to the nearest point of the district's
  // MAIN street, and the annex's ninety-metre flank runs along Rochor Canal,
  // roughly perpendicular to Serangoon Road. Taking that as the frontage put
  // the whole screen in one 1.5m-wide stripe on the short end. So both
  // candidate faces are measured and the wider one wins — which is also the
  // right answer for the main block, whose widest face IS the Serangoon corner.
  const faces = [
    { nx: sw.nx, nz: sw.nz },
    { nx: -ob.uz, nz: ob.ux },
    { nx: ob.uz, nz: -ob.ux },
  ];
  // MARCH FROM A POINT THAT IS ACTUALLY INSIDE THE RING.
  //
  // This marched outward from the oriented box's CENTRE, and a long thin
  // concave footprint — which is exactly what a ninety-metre car-park annex
  // wrapped round a corner is — does not contain its own centre. The march then
  // left the ring on its very first step, every long-flank candidate scored
  // `e = 0.5` or was dropped outright, and the screen ended up on the twenty-
  // metre END face three rounds running. D38 had to nudge around the same
  // concavity an hour earlier in the same session; this is the same nudge.
  let ix = ob.cx, iz = ob.cz;
  if (!pointInRing(ix, iz, b.p)) {
    let found = false;
    for (let i = 0; i < b.p.length && !found; i++) {
      const q1 = b.p[i], q2 = b.p[(i + 1) % b.p.length];
      const mx = (q1[0] + q2[0]) / 2, mz = (q1[1] + q2[1]) / 2;
      for (const t of [0.2, 0.4, 0.6, 0.8]) {
        const px = mx + (ob.cx - mx) * t, pz = mz + (ob.cz - mz) * t;
        if (pointInRing(px, pz, b.p)) { ix = px; iz = pz; found = true; break; }
      }
    }
  }
  let best = null;
  for (const f of faces) {
    const ax = -f.nz, az = f.nx;
    let a0 = Infinity, a1 = -Infinity;
    for (const q of b.p) {
      const u = (q[0] - ix) * ax + (q[1] - iz) * az;
      if (u < a0) a0 = u;
      if (u > a1) a1 = u;
    }
    let e = 0;
    for (let d = 1; d < 90; d += 0.5) {
      if (!pointInRing(ix + f.nx * d, iz + f.nz * d, b.p)) { e = d - 0.5; break; }
    }
    // a face is only a candidate if it actually faces outward from the block
    if (e <= 0) continue;
    // NO "PREFER THE STREET" BIAS. It was 1.15x and it beat a face four times
    // wider: the annex's ninety-metre lattice went onto its twenty-metre END,
    // because the district axis happens to lie off that end. The screen is the
    // long elevation by definition — ONG&ONG's own description is a facade
    // that wraps the flank — so the widest face wins outright.
    const score = (a1 - a0);
    if (!best || score > best.score) best = { f, ax, az, a0, a1, e, score };
  }
  if (!best) return;
  const yaw = Math.atan2(best.f.nx, best.f.nz);
  const tX = best.ax, tZ = best.az;
  const nX = best.f.nx, nZ = best.f.nz;
  const at = (mesh, u, y, into, cast = true) => {
    mesh.rotation.y = yaw;
    mesh.position.set(ix + tX * u - nX * into, y, iz + tZ * u - nZ * into);
    mesh.castShadow = cast;
    api.world.add(mesh);
  };
  const edge = best.e;
  const FW = (best.a1 - best.a0) * 0.96, FU = (best.a0 + best.a1) / 2;

  // THE SCREEN. Panels standing 30cm off the wall with a gap between them, so
  // it reads as a lattice rather than as cladding. On the annex it runs the
  // whole height; on the main block it stops at the podium and the scalloped
  // Citadines bands take over.
  const TOP = ANNEX ? H - 1.2 : H * 0.45;
  const tone = (i, j) => {
    const h = ((i * 73856093) ^ (j * 19349663)) & 0x7fffffff;
    const r = (h % 1000) / 1000;
    return r < 0.14 ? char : r < 0.22 ? creamM : r < 0.60 ? rust : clay;
  };
  // THE SCREEN FOLLOWS THE WALL, COLUMN BY COLUMN.
  //
  // INSTRUMENTED at round 5 rather than guessed at again: the face chooser was
  // never the problem. Logging its candidates showed it picking the annex's
  // long flank correctly — extent 145.5m against 38.7m for the street face.
  // What was wrong is that the screen was then drawn as ONE FLAT PLANE at a
  // single `edge` distance across that whole 145m, and this footprint is an L.
  // Every panel whose column does not happen to lie on that plane is buried
  // inside the mass, invisible, which is why three rounds of frames showed a
  // small patch of lattice and a bare slab — the panels were all being built,
  // just not on the wall.
  //
  // So each column marches out to find the wall AT ITS OWN u. A column that
  // finds nothing (past the end of the L) simply gets no panels.
  const wallAt = (u) => {
    const bx = ix + tX * u, bz = iz + tZ * u;
    for (let d = 90; d > 0; d -= 0.5) {
      if (pointInRing(bx + nX * d, bz + nZ * d, b.p)) return d;
    }
    return null;
  };
  let pi = 0;
  for (let u = FU - FW / 2 + 0.8; u < FU + FW / 2 - 0.8; u += 1.55, pi++) {
    const e2 = wallAt(u);
    if (e2 === null) continue;
    let pj = 0;
    for (let y = 1.6; y < TOP; y += 1.55, pj++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.34, 1.34, 0.16), tone(pi, pj));
      at(panel, u, g0 + y, -(e2 + 0.30), false);
    }
    if (pi % 2 === 0) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), leaf);
      bush.scale.set(1.25, 0.8, 0.9);
      at(bush, u, g0 + TOP + 0.5, -(e2 + 0.25), false);
    }
  }

  if (!ANNEX) {
    // CITADINES ROCHOR above: continuous curved balcony bands in the same
    // terracotta alternating with dark glass, strongly horizontal.
    for (let y = TOP + 0.6; y < H - 1.0; y += 3.2) {
      api.world.add(api.extrude(api.grow(b.p, 1.016), 0.55, rust, y));
      api.world.add(api.extrude(api.grow(b.p, 1.002), 2.6, glass, y + 0.55));
    }
  } else {
    // the annex's roof is a planted DECK, not a lid
    api.world.add(api.extrude(api.grow(b.p, 1.004), 0.5, creamM, H));
    for (let u = FU - FW / 2 + 2.0; u < FU + FW / 2 - 2.0; u += 3.4) {
      const t = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), leaf);
      t.scale.y = 0.75;
      at(t, u, g0 + H + 1.2, -(edge - 4.0), false);
    }
  }
}


// THE CBD TRIO, researched 2026-07-30 (research/sultanmosque-cbdtrio.md).
// The regulatory fact that shapes the skyline: UOB Plaza One, Republic
// Plaza and One Raffles Place are ALL exactly 280m (the CBD cap from Paya
// Lebar flight ops) — three flat-topped peaks at identical altitude,
// distinguished only by crown and material. Research also corrected the
// brief itself: the rotating-plan trick is REPUBLIC PLAZA's (Kurokawa),
// not UOB's — Tange's UOB is a classical base-shaft-capital octagon with
// blank chamfer piers and the great arched crown it shares with its
// smaller twin.
function uobPlaza(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const granite = new THREE.MeshStandardMaterial({ color: 0xc6c3bc, roughness: 0.75 });
  const crownM = new THREE.MeshStandardMaterial({ color: 0xcdcac2, roughness: 0.75 });
  const win = new THREE.MeshStandardMaterial({ color: 0x41505a, roughness: 0.35, metalness: 0.3 });
  const voidM = new THREE.MeshStandardMaterial({ color: 0x20262e, roughness: 0.9 });
  const H = Math.max(120, b.h || 280);
  const isOne = H > 200;
  const yawL = Math.atan2(ob.ux, ob.uz);
  const R0 = Math.min(ob.halfShort, ob.halfLong) * 1.1;
  // the shaft: stacked octagonal stages stepping IN as it rises (the
  // steps bite the chamfers), dense punched-stone read = granite body with
  // thin dark window bands
  const stages = [[0, 0.30, 1.0], [0.30, 0.55, 0.95], [0.55, 0.78, 0.90], [0.78, 0.955, 0.85]];
  for (const [f0, f1, wF] of stages) {
    const oct = new THREE.Mesh(new THREE.CylinderGeometry(R0 * wF, R0 * wF, H * (f1 - f0), 8), granite);
    oct.rotation.y = yawL + Math.PI / 8;
    oct.position.set(ob.cx, g0 + H * (f0 + (f1 - f0) / 2), ob.cz);
    oct.castShadow = true;
    api.world.add(oct);
    // window banding: a slightly inset dark octagon every ~8 floors
    const bands = Math.max(4, Math.round((H * (f1 - f0)) / 12));
    for (let k2 = 0; k2 < bands; k2++) {
      const wb = new THREE.Mesh(new THREE.CylinderGeometry(R0 * wF * 1.004, R0 * wF * 1.004, 1.6, 8), win);
      wb.rotation.y = yawL + Math.PI / 8;
      wb.position.set(ob.cx, g0 + H * f0 + (k2 + 0.5) * (H * (f1 - f0) / bands), ob.cz);
      api.world.add(wb);
    }
  }
  // THE CROWN: cantilevered block wider than the top stage, a dark
  // semi-elliptical arch on each main face, chamfer piers as square horns
  const cw = R0 * 0.86;
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(cw, cw, H * 0.045, 8), crownM);
  crown.rotation.y = yawL + Math.PI / 8;
  crown.position.set(ob.cx, g0 + H * 0.978, ob.cz);
  crown.castShadow = true;
  api.world.add(crown);
  for (let f = 0; f < 4; f++) {
    const a2 = yawL + (f / 4) * Math.PI * 2;
    const arch = new THREE.Mesh(new THREE.CircleGeometry(cw * 0.52, 18, 0, Math.PI), voidM);
    arch.position.set(ob.cx + Math.sin(a2) * cw * 0.93, g0 + H * 0.955, ob.cz + Math.cos(a2) * cw * 0.93);
    arch.rotation.y = a2;
    api.world.add(arch);
    const arch2 = arch.clone();
    arch2.rotation.y = a2 + Math.PI;
    api.world.add(arch2);
  }
}

// OCBC CENTRE — I.M. Pei, 1976, 197.7m: two vast semicircular concrete
// cores bracketing three DEEPLY RECESSED window bands at the researched
// heights (the upper two verified to ~1m against OSM building:parts).
function ocbcCentre(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const conc = new THREE.MeshStandardMaterial({ color: 0xbdb4a8, roughness: 0.88 });
  const band = new THREE.MeshStandardMaterial({ color: 0x5a5c60, roughness: 0.45, metalness: 0.25 });
  const H = 197.7;
  const yawL = Math.atan2(ob.ux, ob.uz);
  const xA = { x: Math.cos(yawL), z: -Math.sin(yawL) };
  const at = (mesh, lx, y, lz) => {
    mesh.position.set(ob.cx + xA.x * lx + ob.ux * lz, y, ob.cz + xA.z * lx + ob.uz * lz);
    mesh.castShadow = true;
    api.world.add(mesh);
  };
  const L = ob.halfLong * 2, W = Math.min(36.5, ob.halfShort * 2);
  const coreW = L * 0.24;
  // the two end cores: box + half-cylinder ends, full height, bare concrete
  for (const sgn of [-1, 1]) {
    const core = new THREE.Mesh(new THREE.BoxGeometry(W, H, coreW), conc);
    core.rotation.y = yawL;
    at(core, 0, g0 + H / 2, sgn * (L / 2 - coreW / 2));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, H, 18, 1, false,
      yawL, Math.PI), conc);
    at(cap, 0, g0 + H / 2, sgn * (L / 2 - coreW / 2) + sgn * coreW / 2);
  }
  // three recessed bands at the RESEARCHED heights, set back behind the
  // core plane so the concrete lips cast the shadow that makes it read
  const midL = L - 2 * coreW;
  for (const [y0, y1] of [[25, 78.6], [87, 133], [143, 189]]) {
    const wb = new THREE.Mesh(new THREE.BoxGeometry(W * 0.86, y1 - y0, midL * 0.98), band);
    wb.rotation.y = yawL;
    at(wb, 0, g0 + (y0 + y1) / 2, 0);
  }
  // the plain concrete belts between and the parapet
  for (const [y0, y1] of [[78.6, 87], [133, 143], [189, H]]) {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, y1 - y0, midL), conc);
    belt.rotation.y = yawL;
    at(belt, 0, g0 + (y0 + y1) / 2, 0);
  }
}

// REPUBLIC PLAZA — Kurokawa, 280m: the octagon whose long and short faces
// TRADE PLACES as it rises (the plan appears to rotate 45 degrees between
// street and crown — this is its identity, wrongly attributed to UOB by
// the brief). Warm brown-rose granite + saturated teal ribbon glazing;
// blunt flat crown; glazed atrium wedge cut into the Raffles Place corner.
function republicPlaza(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const granite = new THREE.MeshStandardMaterial({ color: 0x8a736e, roughness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x2e7a96, roughness: 0.2, metalness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.9 });
  const H = 280;
  const yawL = Math.atan2(ob.ux, ob.uz);
  const R0 = Math.min(ob.halfShort, ob.halfLong) * 0.98;
  // three stacked octagonal stages, each rotated 22.5 degrees from the
  // last — the discrete steps that read as the 45-degree spiral
  const stages = [[0, 0.38, 0], [0.38, 0.72, Math.PI / 8], [0.72, 0.985, Math.PI / 4]];
  for (const [f0, f1, rot] of stages) {
    const oct = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 0.96, R0, H * (f1 - f0), 8), granite);
    oct.rotation.y = yawL + rot;
    oct.position.set(ob.cx, g0 + H * (f0 + (f1 - f0) / 2), ob.cz);
    oct.castShadow = true;
    api.world.add(oct);
    // teal ribbon glazing bands
    const bands = Math.max(3, Math.round((H * (f1 - f0)) / 24));
    for (let k2 = 0; k2 < bands; k2++) {
      const g2 = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 1.002, R0 * 1.002, 2.2, 8), glass);
      g2.rotation.y = yawL + rot;
      g2.position.set(ob.cx, g0 + H * f0 + (k2 + 0.5) * (H * (f1 - f0) / bands), ob.cz);
      api.world.add(g2);
    }
  }
  // the two dark mechanical slots in the upper third + the blunt parapet
  for (const fy of [0.80, 0.90]) {
    const slot = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 0.965, R0 * 0.965, 3.2, 8), dark);
    slot.rotation.y = yawL + Math.PI / 4;
    slot.position.set(ob.cx, g0 + H * fy, ob.cz);
    api.world.add(slot);
  }
  // glazed atrium wedge at the base corner toward the street
  const sw = streetward(api, ob);
  const wx = ob.cx + sw.nx * R0 * 0.72, wz = ob.cz + sw.nz * R0 * 0.72;
  if (!onCarriageway(wx, wz, 0.3)) {
    const wedge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, R0 * 0.34, 26, 4), glass);
    wedge.rotation.y = Math.atan2(sw.nx, sw.nz) + Math.PI / 4;
    wedge.position.set(wx, g0 + 13, wz);
    api.world.add(wedge);
  }
}


// OLD HILL STREET POLICE STATION (MICA Building), 140 Hill Street — the
// 1934 neoclassical block whose 927 louvred window shutters were painted
// in rainbow colours for the 2000s MICA conversion; one of the most
// photographed facades in Singapore, read from across the river at Clarke
// Quay. The identity IS the shutters: cream walls, white surrounds, and
// colour cycling window by window, most saturated on the upper floors.
function oldHillStreet(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const cream = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.88 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf7f4ec, roughness: 0.85 });
  const base = new THREE.MeshStandardMaterial({ color: 0xcfc5b4, roughness: 0.9 });
  const RAINBOW = [0xd9342b, 0xe8862c, 0xe5c02e, 0x4d9a4a, 0x3f6fb5, 0x7a4f9e];
  const mats = RAINBOW.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
  const H = Math.min(30, b.h || 30);
  // the body: arcade base, cream shaft, white parapet
  api.world.add(api.extrude(b.p, 4.5, base, 0));
  api.world.add(api.extrude(b.p, H - 6.5, cream, 4.5));
  api.world.add(api.extrude(api.grow(b.p, 1.006), 2.0, white, H - 2.0));
  // the rainbow shutters: window rows along every facade edge, colour
  // cycling per window, five upper floors
  let wi = 0;
  for (let e = 0; e < b.p.length; e++) {
    const a2 = b.p[e], c2 = b.p[(e + 1) % b.p.length];
    const dx = c2[0] - a2[0], dz = c2[1] - a2[1];
    const eL = Math.hypot(dx, dz);
    if (eL < 6) continue;
    const ux = dx / eL, uz = dz / eL;
    const nx = -uz, nz = ux;
    // outward test: step off the edge midpoint; if inside the ring, flip
    const mx = (a2[0] + c2[0]) / 2 + nx * 1.2, mz = (a2[1] + c2[1]) / 2 + nz * 1.2;
    const flip = pointInRing(mx, mz, b.p) ? -1 : 1;
    const bays = Math.floor(eL / 3.2);
    for (let k2 = 0; k2 < bays; k2++) {
      const t = (k2 + 0.5) / bays;
      const px = a2[0] + dx * t + nx * flip * 0.12;
      const pz = a2[1] + dz * t + nz * flip * 0.12;
      for (let fl = 0; fl < 5; fl++) {
        const geo = new THREE.BoxGeometry(1.5, 2.1, 0.12);
        geo.rotateY(Math.atan2(nx * flip, nz * flip));
        geo.translate(px, g0 + 6.4 + fl * 4.4, pz);
        api.merge(geo, mats[(wi + fl) % 6], ob.cx, ob.cz);
      }
      wi++;
    }
  }
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

// The National Library. T.R. Hamzah & Ken Yeang: two blocks split by a
// full-height naturally-ventilated atrium, the larger regular one over an open
// civic plaza, the second one curved.
//
// Researched 2026-07-31, research/bugis-brasbasah-landmarks.md, which settled
// three things this comment used to get wrong or leave open:
//   - HEIGHT IS 102.8m, published by CTBUH and corroborated by a 2006
//     peer-reviewed article. OSM's 90 is a Bing guess and the competing 98 is
//     the architect's SUPERSEDED 15-storey scheme. Set in process.py, not here.
//   - "two 16-storey blocks" was wrong: the blocks are not equal, and the
//     rectilinear one is the LIBRARY while the curved one is the DRAMA CENTRE.
//     This recipe already builds them that way round, which is lucky rather
//     than researched, and is now on the record as correct.
//   - The atrium is AIMED AT ST JOSEPH'S CHURCH, bearing 303.7 degrees at 145m,
//     and the measured roof seam matches the architect's stated intent to
//     within 0.4 degrees. The split here is taken from the footprint's own
//     short axis instead. Re-cutting it on the true bearing is a real
//     improvement and NOT a safe one: the carriageway pull-back below exists
//     because this very split once pushed a wall four metres into North Bridge
//     Road, and a slot on a fixed compass bearing would not respect the
//     footprint it is cutting. Left alone deliberately.
//
// Also corrected, for whoever adds detail later: the big curved elements are
// the roof canopy and the atrium bridges, NOT facade louvres. There is no red
// brick on the facade -- it is at B1. There is no link bridge to Bugis.
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
// Researched 2026-07-31, research/bugis-brasbasah-landmarks.md. Three
// corrections that were all being got wrong at once:
//   - THIS RECIPE USED TO CLAIM BUGIS JUNCTION AND BUGIS STREET TOO. They are
//     different buildings on opposite sides of Victoria Street -- measured 41m
//     NW and 69m SE of the centreline -- linked by one 2012 overhead bridge.
//     The crystal mesh is Bugis+ (201 Victoria St). The glazed shophouse
//     streets are Bugis Junction (200). Bugis Street is a third thing again.
//   - The mesh is deep-drawn POLYCARBONATE, not glass: >3,000 hexagonal
//     faceted caps over >5,000 m2, ~1,900 of them lit by compact fluorescent
//     tubes, 6,069 pixels.
//   - It covers ONLY the curved block. The rectilinear block is a red, orange
//     and charcoal patchwork box and should not wear a lattice at all.
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
  // PLACED FROM THE BOX CENTRE, not from cx0/cz0. orientedBox's cx,cz is the
  // VERTEX MEAN and on an irregular footprint it is nowhere near the middle of
  // the box -- this recipe predates ob.bx/bz existing, and the result was a
  // lattice standing clear of the building with its far end out over the road.
  const bx0 = ob.bx, bz0 = ob.bz;
  for (let i = 0; i < N; i++) {
    const t = ob.midU + (i / (N - 1) - 0.5) * ob.halfLong * 1.75;
    const px = ob.cx + ob.ux * t - ob.uz * ob.midV + sw.nx * (ob.halfShort + 0.7);
    const pz = ob.cz + ob.uz * t + ob.ux * ob.midV + sw.nz * (ob.halfShort + 0.7);
    // CLEARANCE FOR THE LEAN, not just for the base. These bars rake +-0.3 rad
    // over a 26m height, so a bar whose foot is comfortably on the pavement has
    // its head about 4m out -- and it was over Cheng Yan Place. The old -0.3
    // margin actually RELAXED the test, which is the wrong direction for a
    // piece that grows sideways as it rises.
    if (onCarriageway(px, pz, 2.4)) continue;
    for (const lean of [0.30, -0.30]) {
      const bar = new THREE.BoxGeometry(0.22, h * 1.12, 0.22);
      bar.rotateZ(lean);
      bar.rotateY(-ob.ang);
      bar.translate(px, api.footingY(b.p) + h / 2, pz);
      api.merge(bar, mesh, cx0, cz0);
    }
  }
  // Horizontal courses, so it is a mesh and not a picket fence -- but ONLY
  // along the face that carries the mesh. A grown ring wraps all four sides and
  // put the lattice on the rectilinear block too, which is exactly the thing
  // the research says is wrong: the caps cover the CURVED block, and the other
  // one is a flat patchwork box.
  const P = (u, v) => [cx0 + u * ob.ux - v * ob.uz, cz0 + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];
  const side = ((sw.nx * -ob.uz + sw.nz * ob.ux) > 0) ? 1 : -1;
  // TEST THE PANEL, NOT ITS CENTRE POINT.
  //
  // Both loops below asked onCarriageway about ONE point and then built a
  // panel metres wide around it, so a panel whose middle clears the kerb still
  // hung over Manila Street by half its width. P1b found it in the merged
  // patchwork tile, and it is the same mistake this project already fixed for
  // shopfront bays -- "one point per bay was tested while a bay is up to eight
  // metres wide" (see the T1 note in data/audit_world.js).
  //
  // Checking both ends as well as the middle costs two extra road lookups per
  // panel and is the difference between a guard and a gesture.
  const panelClear = (u0, v0, hu) => {
    for (const du of [-hu, 0, hu]) {
      const [qx, qz] = P(u0 + du, v0);
      if (onCarriageway(qx, qz, 0.2)) return false;
    }
    return true;
  };
  // SEGMENTED, so each piece can be tested against the road. As one 135m strip
  // this stood in Manila Street and P1b caught it -- the bars beside it check
  // onCarriageway individually and the courses did not.
  const SEG = 12;
  for (let k = 1; k <= 5; k++) {
    for (let j = 0; j < SEG; j++) {
      const u = ob.midU + ((j + 0.5) / SEG - 0.5) * ob.halfLong * 1.9;
      const v = ob.midV + side * (ob.halfShort + 0.7);
      if (!panelClear(u, v, (ob.halfLong * 1.9) / (SEG * 2))) continue;
      api.merge(api.extrudeGeo(rect(u, v, (ob.halfLong * 1.9) / (SEG * 2), 0.22),
        0.18, (h / 6) * k), mesh, cx0, cz0);
    }
  }

  // THE OTHER BLOCK: red, orange and charcoal panels, not glass and not
  // lattice. Hashed off each panel's own position so a rebuild deals the same
  // patchwork rather than reshuffling it.
  const PATCH = [0xa8402f, 0xc9762a, 0x3b3d40, 0x8d3326, 0x4a4d51];
  for (let k = 0; k < 5; k++) {
    for (let j = 0; j < 7; j++) {
      const u = ob.midU + (j / 6 - 0.5) * ob.halfLong * 1.8;
      const hsh = Math.abs(((u * 31) | 0) + k * 97);
      const vv = ob.midV - side * (ob.halfShort + 0.25);
      if (!panelClear(u, vv, ob.halfLong * 0.13)) continue;
      api.merge(api.extrudeGeo(rect(u, vv, ob.halfLong * 0.13, 0.22),
        h / 5.6, (h / 5.2) * k), signMat(PATCH[hsh % PATCH.length]), cx0, cz0);
    }
  }
}

// The Centrepoint. Researched 2026-07-28 (agent report; sources in NEXT.md)
// plus Wikipedia 2026-07-29: opened Nov 1983, 6 retail storeys and 2
// basements, a FULL-PLOT SLAB rather than tower-on-podium, 66 apartments on
// floors 4-7 of the rear block, white-painted concrete on the Cuppage
// elevation. The street face is the one element people name it by: a red
// gridded cladding panel about three storeys tall with an ELLIPTICAL window,
// over a recessed ground floor under a flat canopy soffit. Height is NOT
// published anywhere found; 6 retail floors at 4.6m plus plant is ~30m, used
// here instead of the mapped 20.4 the way other recipes carry their own
// researched figures.
function theCentrepoint(api, b) {
  const ob = orientedBox(b.p);
  const H = Math.max(b.h, 30);
  const g0 = api.footingY(b.p);
  // recessed ground floor, then the slab in dark tinted curtain wall
  api.world.add(api.extrude(api.grow(b.p, 0.965), 5.0, api.mat.darkCurtain));
  api.world.add(api.extrude(api.grow(b.p, 1.035), 0.55, api.mat.trim, 5.0));   // canopy soffit line
  api.world.add(api.extrude(b.p, H - 5.4, api.mat.darkCurtain, 5.4));
  api.world.add(api.extrude(api.grow(b.p, 1.008), 0.8, api.mat.conc, H));      // parapet
  // the red panel, hung proud of the facade that faces Orchard Road: walk
  // from the centroid toward the street until the walk leaves the footprint,
  // which is the facade -- the oriented box lies for a plan this irregular
  // (pattern recorded for Lucky Plaza's fins and the church roof)
  const sw = streetward(api, ob);
  let f = 0;
  while (f < 80 && pointInRing(ob.cx + sw.nx * f, ob.cz + sw.nz * f, b.p)) f += 0.5;
  const px = ob.cx + sw.nx * (f + 0.45), pz = ob.cz + sw.nz * (f + 0.45);
  if (!onCarriageway(px, pz, 0.3)) {
    const panelW = 24, panelH = 13.5;
    const m = new THREE.Mesh(new THREE.BoxGeometry(panelW, panelH, 0.6), api.mat.centrePanel);
    m.position.set(px, g0 + 6.2 + panelH / 2, pz);
    m.rotation.y = Math.atan2(sw.nx, sw.nz);
    m.castShadow = true; m.receiveShadow = true;
    uvMetres(m, panelW, panelH);              // ONE tile over the panel: the ellipse must not repeat
    api.world.add(m);
  }
  // the Cuppage elevation is white-painted concrete: a pale skin on the rear
  // face, found the same way in the opposite direction
  let r = 0;
  while (r < 80 && pointInRing(ob.cx - sw.nx * r, ob.cz - sw.nz * r, b.p)) r += 0.5;
  const rx = ob.cx - sw.nx * (r - 0.1), rz = ob.cz - sw.nz * (r - 0.1);
  if (!onCarriageway(rx, rz, 0.3)) {
    const skin = new THREE.Mesh(new THREE.BoxGeometry(ob.halfLong * 1.2, H - 6, 0.4), api.mat.paleStone);
    skin.position.set(rx, g0 + 5.4 + (H - 6) / 2, rz);
    skin.rotation.y = Math.atan2(sw.nx, sw.nz);
    skin.castShadow = false; skin.receiveShadow = true;
    autoUV(skin, api.mat.paleStone);
    api.world.add(skin);
  }
}

// THE CATHAY, 2 Handy Road. Researched 2026-07-29 by agent against
// roots.gov.sg, Wikipedia (The Cathay / Cathay Building), rdca.sg (RDC
// Architects, with Paul Tange), fantabulousfour and Commons photographs. The
// research CORRECTED five things this project would otherwise have built
// wrong, which is the whole argument for researching before modelling:
//
//   It is a gazetted NATIONAL MONUMENT (Cat 2, 2003), and only the PODIUM'S
//   FRONT FACADE is protected -- a free-standing screen, not a conserved
//   building.
//   The vertical element is a STEPPED ZIGGURAT PYLON, broad and wall-like,
//   symmetrical in plan and elevation. Drawn as the thin blade fin the brief
//   assumed, it would read as the wrong building entirely.
//   The render is SHANGHAI PLASTER, pale warm grey-cream and matte. The
//   widely-repeated "brown tiles" belong to a 1978 refacing that was REMOVED.
//   There is NO CINEMA (closed 2022) and NO STREET CORNER: the frontage is
//   symmetrical onto Cathay Forecourt, a plaza, so it is always seen across
//   open paving.
//   The new build is a CURVED GLASS DRUM rising directly behind the screen,
//   published at 40m -- about twice the height of the retained facade.
//
// Published metres: the 40m glass, 17 floors, 76 flats. Facade dimensions are
// UNPUBLISHED; the proportions below (pylon ~1.5x the wing parapet, facade
// ~half the drum) come from the report's photogrammetric estimates and are
// marked as such rather than presented as survey.
function theCathay(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const pale = api.mat.paleStone, glass = api.mat.blueGlass, trim = api.mat.trim;
  const H = Math.max(b.h, 40);                 // the drum is published at 40m

  // the mass behind: the curved glass drum plus the residential block
  api.world.add(api.extrude(b.p, H, glass));
  api.world.add(api.extrude(api.grow(b.p, 1.012), 1.1, trim, H));   // oversailing eave

  // THE SCREEN GOES ON A REAL EDGE OF THE PLAN, not on a ray from the
  // centroid. Walking outward from the centroid finds A point on the
  // boundary, which for this 24-sided plan is wherever the ray happens to
  // cross -- the first build put a 57m screen wall standing beside the
  // building in open air. The longest edge facing away from the centroid IS
  // the frontage, which is how the building signage already picks one.
  // ...and it must be the longest edge ON THE STREET SIDE. Longest alone put
  // the monument facade round the back: this plan's longest run is the rear
  // elevation up Mount Sophia. Score every edge by length times how squarely
  // its outward normal faces the street, so the two signals have to agree.
  const swd = streetward(api, ob);
  let bi = 0, best = -Infinity, bl = 0;
  for (let i = 0; i < b.p.length; i++) {
    const a = b.p[i], c = b.p[(i + 1) % b.p.length];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (L < 4) continue;
    const emx = (a[0] + c[0]) / 2, emz = (a[1] + c[1]) / 2;
    const ox = emx - ob.cx, oz = emz - ob.cz, ol = Math.hypot(ox, oz) || 1;
    const faces = (ox / ol) * swd.nx + (oz / ol) * swd.nz;    // -1 .. 1
    if (faces <= 0.15) continue;                              // points away from the street
    const score = L * faces;
    if (score > best) { best = score; bi = i; bl = L; }
  }
  if (best === -Infinity) return;                             // no street frontage: mass only
  const ea = b.p[bi], ec = b.p[(bi + 1) % b.p.length];
  const mx = (ea[0] + ec[0]) / 2, mz = (ea[1] + ec[1]) / 2;
  const oX = mx - ob.cx, oZ = mz - ob.cz, oL = Math.hypot(oX, oZ) || 1;
  const nX = oX / oL, nZ = oZ / oL;              // outward, from the plan itself
  const fx = mx + nX * 1.2, fz = mz + nZ * 1.2;
  if (onCarriageway(fx, fz, 0.3)) return;      // no room for the screen: leave the mass
  const yaw = Math.atan2(nX, nZ);
  // along the edge, which is perpendicular to the outward normal
  const tX = -nZ, tZ = nX;
  // THE FRONTAGE IS WIDER THAN ANY ONE EDGE. This plan has 24 sides, so its
  // longest street-facing edge is about 20m while the real monument frontage
  // measures ~57m across -- built from one edge the screen read as a kiosk in
  // front of a tower. Span every vertex on the street half of the plan,
  // projected onto the frontage direction.
  let uMin = Infinity, uMax = -Infinity;
  for (const [px, pz] of b.p) {
    const dx = px - ob.cx, dz = pz - ob.cz;
    if (dx * nX + dz * nZ < oL * 0.25) continue;      // rear half of the plan
    const u = dx * tX + dz * tZ;
    if (u < uMin) uMin = u;
    if (u > uMax) uMax = u;
  }
  // Widen toward the real ~57m frontage, but stay ANCHORED ON THE CHOSEN
  // EDGE. Re-centring on the span's midpoint slid the screen off the plan
  // (the span includes vertices that wrap round the sides), so the edge
  // midpoint stays the origin and only the width grows -- and it grows to
  // 80% of the span so the wings cannot overhang the frontage they sit on.
  const span = (uMin === Infinity) ? bl : (uMax - uMin);
  const W = Math.max(bl, Math.min(48, span * 0.8));
  const uMid = 0;
  const wingH = 13.5, pylonH = 21.0;           // ESTIMATED, see the note above

  const place = (mesh, u, y, out) => {
    // u is measured from the FRONTAGE centre (uMid), which is not the chosen
    // edge's midpoint once the screen spans several edges
    const uu = u + uMid;
    mesh.position.set(fx + tX * uu + nX * out, y, fz + tZ * uu + nZ * out);
    mesh.rotation.y = yaw;
    mesh.castShadow = true; mesh.receiveShadow = true;
    api.world.add(mesh);
    return mesh;
  };
  // the flanking wings, one screen wall either side of the pylon
  const pylonW = 10.5, wingW = (W - pylonW) / 2;
  for (const side of [-1, 1]) {
    const u = side * (pylonW / 2 + wingW / 2);
    place(new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, 0.9), pale), u, g0 + wingH / 2, 0);
    // Streamline Moderne: stacked semi-circular ledges on cylindrical drum
    // piers, three tiers. The report calls this the signature non-signage
    // feature, so it is built rather than implied.
    for (let k = 0; k < 3; k++) {
      const y = g0 + 4.6 + k * 3.4;
      const led = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.34, 14, 1, false, 0, Math.PI), pale);
      place(led, u + side * wingW * 0.24, y, 0.6);
      led.rotation.y = yaw + Math.PI;
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.4, 10), pale);
      place(pier, u + side * wingW * 0.24 - 2.2, y - 1.7, 0.6);
    }
  }
  // the stepped ziggurat pylon: a tall centre slab with two pairs of lower
  // stepped uprights, each capped flat
  place(new THREE.Mesh(new THREE.BoxGeometry(pylonW * 0.42, pylonH, 1.1), pale), 0, g0 + pylonH / 2, 0.1);
  for (let k = 1; k <= 2; k++) {
    const h = pylonH - k * 3.2, w = pylonW * 0.19;
    for (const side of [-1, 1]) {
      place(new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.0), pale),
            side * (pylonW * 0.21 + (k - 0.5) * w), g0 + h / 2, 0.05);
    }
  }
  // the marquee band over the recessed entrance
  place(new THREE.Mesh(new THREE.BoxGeometry(pylonW * 1.5, 1.15, 2.2), api.mat.darkMetal || trim),
        0, g0 + 5.0, 1.0);
  // the vertical CATHAY lettering, six letters stacked down the pylon face:
  // raised pale letters on pale render, so it is built as relief, not paint
  for (let k = 0; k < 6; k++) {
    place(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.18), trim),
          0, g0 + pylonH - 2.6 - k * 2.2, 0.62);
  }
}

// LIAT TOWERS, 541 Orchard Road. Researched 2026-07-29 by agent against
// roots.gov.sg (NHB surveyed site), Wikipedia, Bonvests (the owner), RDAI /
// Alucobond / DDG Glass / Vertilux trade records for the 2016 Hermes facade,
// and Commons photographs. Four premises in the brief were WRONG and the
// report said so rather than answering around them:
//
//   NO CURVED CORNER. Nothing published or photographed shows one; every
//   corner is square or chamfered. The brief assumed a curve.
//   HERMES IS FOUR STOREYS, not a ground-floor shopfront -- three retail plus
//   the 4th-floor "Aloft" art space, 670 m2, and the 2016 cladding wraps all
//   four and turns the corner into Angullia Park.
//   It is a 1979 building with a 2016 face, not a 1965 modernist tower. The
//   1965 phase was 17 storeys; the 1977-79 rebuild made it 21.
//   The tower's signature is HORIZONTAL: one stone spandrel and one recessed
//   dark ribbon window per floor, with the slab edge PROJECTING as an eyebrow
//   that throws a hard shadow -- about twenty stacked stripes, no vertical
//   expression at all.
//
// Published: 21 storeys, Hermes 670 m2 over four floors, 34 blinds dropping
// to 4.5m (so the retail floor-to-floor is ~4.5-5m, taller than the office
// floors above). HEIGHT IN METRES IS UNPUBLISHED -- not in Wikipedia, Roots,
// Bonvests, CTBUH or any leasing database -- so the mapped 45m stands and the
// recipe does NOT invent one from the 21 storeys.
// VOCO ORCHARD (ex-Hilton Singapore), 581 Orchard Road. research/voco.md.
// White slab, 26 storeys published (metres unpublished, mapped 80 kept): a
// deep egg-crate grid of recessed dark window bays — NOT balconies — blank
// sheer end walls, top two floors stepped back under a heavy double white
// fascia, and the gold Henderson relief-mural band over the 2-storey arcade.
function vocoOrchard(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const white = api.mat.paintedWhite, dark = api.mat.darkCurtain;
  const H = b.h, podium = 9;
  const c = [ob.cx, ob.cz];

  // podium: boutique glazing at street, the gold mural band above it
  api.world.add(api.extrude(api.grow(b.p, 0.99), 5.0, dark));
  api.world.add(api.extrude(b.p, podium - 5.0, api.mat.bronzeRelief, 5.0));

  // slab in white with the egg-crate carried by per-floor dark inset bands
  // crossed by white mullion ribs — reads as the waffle at street distance
  api.world.add(api.extrude(b.p, H - podium, white, podium));
  const crownY = H - 7.0;
  const floors = 17, fh = (crownY - podium) / floors;
  for (let k = 0; k < floors; k++) {
    // PROUD of the white wall (1.006), not sunk inside it (0.985 buried the
    // whole egg-crate and the slab rendered as a blank monolith)
    api.merge(api.extrudeGeo(api.grow(b.p, 1.006), fh * 0.55, podium + k * fh), dark, c[0], c[1]);
  }
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let fd = 0;
  while (fd < 60 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  const span = Math.min(ob.halfLong * 1.7, 70);
  const nRib = Math.max(10, Math.round(span / 3.4));
  for (let i = 0; i <= nRib; i++) {
    const u = -span / 2 + i * (span / nRib);
    for (const s of [1, -1]) {
      const rx = ob.cx + tX * u + sw.nx * s * (fd - 0.15), rz = ob.cz + tZ * u + sw.nz * s * (fd - 0.15);
      if (!pointInRing(rx - sw.nx * s * 1.2, rz - sw.nz * s * 1.2, b.p)) continue;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.5, crownY - podium, 0.55), white);
      rib.position.set(rx, g0 + podium + (crownY - podium) / 2, rz);
      rib.rotation.y = yaw;
      rib.castShadow = false; rib.receiveShadow = true;
      api.world.add(rib);
    }
  }
  // the crown: stepped-back top band under a double oversailing fascia
  api.merge(api.extrudeGeo(api.grow(b.p, 0.93), 5.4, crownY), dark, c[0], c[1]);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.015), 0.8, H - 1.6), white, c[0], c[1]);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.015), 0.8, H - 0.2), white, c[0], c[1]);
}

// FORUM THE SHOPPING MALL, 583 Orchard Road. research/forum.md. One dark
// blue-green mirror-glass complex (podium AND 17-storey tower, h=56 derived)
// with THE white postmodern arch portal — frame, fanlight arch, clock ring,
// gold FORUM band — proud of the glass at the centre of the frontage.
function forumMall(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const navy = api.mat.navyGlass, white = api.mat.paintedWhite;
  const H = b.h, podium = 17;
  const c = [ob.cx, ob.cz];

  api.world.add(api.extrude(b.p, podium, navy));
  const inset = b.p.map(([x, z]) => [c[0] + (x - c[0]) * 0.72, c[1] + (z - c[1]) * 0.72]);
  api.world.add(api.extrude(inset, H - podium, navy, podium));
  api.merge(api.extrudeGeo(api.grow(inset, 1.01), 0.9, H), api.mat.trim, c[0], c[1]);

  // the arch portal, centred on the street frontage
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  let fd = 0;
  while (fd < 60 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  const px = ob.cx + sw.nx * (fd + 0.6), pz = ob.cz + sw.nz * (fd + 0.6);
  if (!onCarriageway(px, pz, 0.5)) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(13, podium - 1, 1.4), white);
    frame.position.set(px, g0 + (podium - 1) / 2, pz);
    frame.rotation.y = yaw;
    frame.castShadow = true;
    api.world.add(frame);
    // the arch: a white half-cylinder lying in the portal top
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 1.5, 20, 1, false, 0, Math.PI), white);
    arch.position.set(px + sw.nx * 0.2, g0 + podium - 5.4, pz + sw.nz * 0.2);
    arch.rotation.z = Math.PI / 2;
    arch.rotation.y = yaw + Math.PI / 2;
    api.world.add(arch);
    // clock ring: a dark torus-read disc centred in the arch
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.35, 18), api.mat.darkMetal);
    ring.position.set(px + sw.nx * 0.75, g0 + podium - 6.2, pz + sw.nz * 0.75);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = yaw;
    api.world.add(ring);
    // gold FORUM band across the portal
    const band = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.2, 0.3), api.mat.goldSign);
    band.position.set(px + sw.nx * 0.75, g0 + podium - 9.6, pz + sw.nz * 0.75);
    band.rotation.y = yaw;
    api.world.add(band);
  }
}

// PALAIS RENAISSANCE, 390 Orchard Road. research/palais.md. 17 storeys
// published, metres not; 55 kept flagged. Beige waffle tower with three
// barrel-capped crown bays; the Orchard podium face is the 2008 suspended
// GLASS VEIL (blue, leaning, with the PALAiS supergraphic band).
function palaisRenaissance(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = b.h, podium = 20;
  const c = [ob.cx, ob.cz];

  api.world.add(api.extrude(api.grow(b.p, 0.99), 6.0, api.mat.darkCurtain));
  api.world.add(api.extrude(b.p, podium - 6.0, api.mat.palaisWaffle, 6.0));
  const inset = b.p.map(([x, z]) => [c[0] + (x - c[0]) * 0.74, c[1] + (z - c[1]) * 0.74]);
  api.world.add(api.extrude(inset, H - podium, api.mat.palaisWaffle, podium));
  // the three barrel crown bays
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  for (const u of [-9, 0, 9]) {
    // on the STREET-facing roof edge, not the parapet centre where the
    // first render hid them entirely
    const bx = ob.cx + tX * u * 0.6 + sw.nx * ob.halfShort * 0.34;
    const bz = ob.cz + tZ * u * 0.6 + sw.nz * ob.halfShort * 0.34;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 7.5, 16, 1, false, 0, Math.PI), api.mat.paleStone);
    barrel.position.set(bx, g0 + H + 0.3, bz);
    barrel.rotation.z = Math.PI / 2;
    barrel.rotation.y = yaw + Math.PI / 2;
    barrel.castShadow = true;
    api.world.add(barrel);
  }
  // the veil: a leaning blue glass sheet proud of the Orchard face with the
  // white supergraphic band (the lettering itself is polish debt)
  let fd = 0;
  while (fd < 60 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  // flush against the podium face — the leaned version floated free of the
  // wall and read as a billboard standing in the forecourt
  // centre the veil on the REAL face span, scanned in the ob frame — the
  // centroid's street projection sat beside this small irregular plan and
  // hung the veil off the corner
  let sMin = 1e9, sMax = -1e9;
  for (let d2 = -ob.halfLong - 1; d2 <= ob.halfLong + 1; d2 += 0.5) {
    if (pointInRing(ob.cx + tX * d2 + sw.nx * (fd - 1.5), ob.cz + tZ * d2 + sw.nz * (fd - 1.5), b.p)) {
      if (d2 < sMin) sMin = d2; if (d2 > sMax) sMax = d2;
    }
  }
  const uMid = (sMin + sMax) / 2, faceW = Math.max(8, sMax - sMin - 2);
  const vx = ob.cx + tX * uMid + sw.nx * (fd + 0.45), vz = ob.cz + tZ * uMid + sw.nz * (fd + 0.45);
  if (!onCarriageway(vx, vz, 0.5)) {
    const veil = new THREE.Mesh(new THREE.BoxGeometry(Math.min(34, faceW), podium - 6.5, 0.35), api.mat.blueGlass);
    veil.position.set(vx, g0 + 6.0 + (podium - 6.5) / 2, vz);
    veil.rotation.y = yaw;
    veil.castShadow = false;
    api.world.add(veil);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(Math.min(26, faceW * 0.8), 2.2, 0.2), api.mat.paintedWhite);
    strip.position.set(vx + sw.nx * 0.35, g0 + podium * 0.62, vz + sw.nz * 0.35);
    strip.rotation.y = yaw;
    api.world.add(strip);
  }
}

// ORCHARD RENDEZVOUS HOTEL, 1 Tanglin Road. research/orchard-rendezvous.md.
// 17 storeys published (h=55 kept, a fallback within 3m of Emporis' own
// estimate). Pale peach slab with a dark flat eave cap; the junction corner
// is a ~5-tier terracotta wedding cake; terracotta porte-cochere + turret.
function orchardRendezvous(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const peach = api.mat.peachStucco, tile = api.mat.clayTile;
  const H = b.h;
  const c = [ob.cx, ob.cz];

  // the slab, peach, with recessed dark window bands and the dark eave cap
  api.world.add(api.extrude(b.p, H, peach));
  const floors = 13, fh = (H - 16) / floors;
  for (let k = 0; k < floors; k++) {
    // proud of the stucco (the voco lesson: sunk bands render as a monolith)
    api.merge(api.extrudeGeo(api.grow(b.p, 1.006), fh * 0.42, 16 + k * fh), api.mat.darkCurtain, c[0], c[1]);
  }
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.9, H), api.mat.darkMetal, c[0], c[1]);

  // the tiered corner: stepped peach drums wrapped in terracotta eave bands,
  // at the frontage corner nearest the junction
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let fd = 0;
  while (fd < 60 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  let ce = 0;
  for (let d2 = 0; d2 <= ob.halfLong + 1; d2 += 0.5) {
    if (pointInRing(ob.cx + tX * d2 + sw.nx * (fd - 6), ob.cz + tZ * d2 + sw.nz * (fd - 6), b.p)) ce = d2;
  }
  const kx = ob.cx + tX * (ce - 7) + sw.nx * (fd - 7), kz = ob.cz + tZ * (ce - 7) + sw.nz * (fd - 7);
  if (!onCarriageway(kx, kz, 0.5)) {
    for (let t = 0; t < 5; t++) {
      const r = 13 - t * 2.1, y = t * 3.6, th = 3.2;
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(r, r, th, 22), peach);
      drum.position.set(kx, g0 + y + th / 2, kz);
      drum.receiveShadow = true;
      api.world.add(drum);
      const eave = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.8, r + 1.1, 0.7, 22), tile);
      eave.position.set(kx, g0 + y + th + 0.35, kz);
      eave.castShadow = true;
      api.world.add(eave);
    }
    // the turret: small drum + pyramidal terracotta roof
    const tur = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 4.5, 14), peach);
    tur.position.set(kx, g0 + 5 * 3.6 + 2.25, kz);
    api.world.add(tur);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.8, 14), tile);
    cone.position.set(kx, g0 + 5 * 3.6 + 4.5 + 1.4, kz);
    cone.castShadow = true;
    api.world.add(cone);
  }
}

// SCHOOL OF THE ARTS (SOTA), 1 Zubir Said Drive. research/sota.md. 56m/10
// floors (CTBUH). Two strata: the "Backdrop" podium (~26m, leaning brown
// piers, three-grey striped fascia) and the "Blank Canvas" — THREE parallel
// 6-storey bars (depth ~14m, pitch ~28.5m, staggered ends, centre bar
// longest) wearing the green ribbon curtain, fin-comb gable ends, dark glass
// boxes bridging the slots. Bar dims are measured-from-plans, ±6%, labelled
// derived; the split of 56 into 26+30 is measured from dated photos.
function sota(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const white = api.mat.paintedWhite, ribbons = api.mat.sotaRibbons;
  const H = b.h;                                    // 56 published
  const podium = H * 0.46;                          // ~26m measured split
  const c = [ob.cx, ob.cz];

  // the Backdrop: dark plinth, white walls, striped fascia crown
  api.world.add(api.extrude(api.grow(b.p, 0.99), 3.0, api.mat.darkCurtain));
  api.world.add(api.extrude(b.p, podium - 7.0, white, 3.0));
  api.merge(api.extrudeGeo(api.grow(b.p, 1.005), 1.4, podium - 4.0), api.mat.paleStone, c[0], c[1]);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.005), 1.3, podium - 2.6), api.mat.warmStone, c[0], c[1]);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.005), 1.3, podium - 1.3), api.mat.darkCurtain, c[0], c[1]);

  // leaning board-marked piers on the street faces
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let fd = 0;
  while (fd < 70 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  const pn = 6, span = Math.min(ob.halfLong * 1.5, 70);
  for (let i = 0; i < pn; i++) {
    const u = -span / 2 + (i + 0.5) * (span / pn) + (i % 2 ? 2.2 : -1.6);
    const px = ob.cx + tX * u + sw.nx * (fd - 0.4), pz = ob.cz + tZ * u + sw.nz * (fd - 0.4);
    if (onCarriageway(px, pz, 0.4)) continue;
    if (!pointInRing(px - sw.nx * 1.6, pz - sw.nz * 1.6, b.p)) continue;
    const pier = new THREE.Mesh(new THREE.BoxGeometry(2.3, podium - 6.5, 1.1), api.mat.boardConc);
    pier.position.set(px, g0 + 3.0 + (podium - 6.5) / 2, pz);
    pier.rotation.y = yaw;
    pier.rotation.z = (i % 2 ? 1 : -1) * 0.16;      // the 10-20 degree lean
    pier.castShadow = true;
    api.world.add(pier);
  }

  // the Blank Canvas: three bars along the long axis, staggered at one end.
  // slab() places boxes in the oriented-box frame: u along, v across.
  const barH = H - podium, dep = Math.min(14, ob.halfShort * 0.42);
  const pitch = Math.min(28.5, ob.halfShort * 0.9);
  // Each bar is CONSTRAINED TO THE FOOTPRINT along its own centreline — the
  // oriented box is the SITE's box and centring published lengths in it hung
  // bar ends over Zubir Said Drive, where pruneCarriageway rightly ate them
  // and left the gable panels floating. Scan the ring in the OB FRAME (the
  // same mapping slab() uses), and pass g0 into every slab: slab y is
  // ABSOLUTE, the orchardCentral trap.
  const stag = [0.86, 1.0, 0.92];                    // centre bar projects
  const obPt = (u, v) => [ob.cx + ob.ux * u - ob.uz * v, ob.cz + ob.uz * u + ob.ux * v];
  for (let bi = 0; bi < 3; bi++) {
    const v = (bi - 1) * pitch;
    let uMin = 1e9, uMax = -1e9;
    for (let d2 = -ob.halfLong - 2; d2 <= ob.halfLong + 2; d2 += 0.5) {
      const [ux2, uz2] = obPt(d2, v);
      if (pointInRing(ux2, uz2, b.p)) { if (d2 < uMin) uMin = d2; if (d2 > uMax) uMax = d2; }
    }
    if (uMax - uMin < 20) continue;
    const flush = uMax - 1.0;
    const L = (flush - (uMin + 1.0)) * stag[bi];
    const u0 = flush - L / 2;
    slab(api, ob, u0, v, L, dep, g0 + podium, barH, white);
    // green ribbon curtain proud of both long faces
    for (const s2 of [-1, 1]) {
      slab(api, ob, u0, v + s2 * (dep / 2 + 0.18), L * 0.96, 0.14, g0 + podium + 0.5, barH - 1.6, ribbons);
    }
    // per-floor slab bands so the curtain hangs off real edges
    for (let k = 1; k <= 6; k++) {
      slab(api, ob, u0, v, L * 1.005, dep * 1.06, g0 + podium + k * (barH / 6) - 0.4, 0.42, white);
    }
    // fin-comb gable at the staggered (-u) end: glazed panel overshooting the
    // roof, white frame, and the COMB — thin white uprights over the glass
    slab(api, ob, u0 - L / 2 - 0.3, v, 0.5, dep * 0.9, g0 + podium, barH + 1.0, api.mat.blueGlass);
    slab(api, ob, u0 - L / 2 - 0.42, v, 0.24, dep * 0.98, g0 + podium, barH + 1.2, white);
    const fins = 9;
    for (let fi = 0; fi < fins; fi++) {
      const fv = v - dep * 0.42 + (fi + 0.5) * (dep * 0.84 / fins);
      slab(api, ob, u0 - L / 2 - 0.55, fv, 0.18, 0.3, g0 + podium, barH + 1.3, white);
    }
  }
  // dark glass boxes bridging the slots at mid height
  for (const s of [-0.5, 0.5]) {
    slab(api, ob, ob.halfLong * 0.18, s * pitch, 16, pitch - dep, g0 + podium + barH * 0.35, barH * 0.38, api.mat.darkCurtain);
  }
}

// SHAW HOUSE, 350 Orchard Road x Scotts. research/shaw-house.md. Height
// UNPUBLISHED anywhere (OSM says 0) — 90 kept as a flagged estimate. The
// signature is the ~6-storey convex granite DRUM addressing the junction
// diagonally, roof garden spilling over its parapet, over black columns and
// a glazed base; the office slab rises set back behind with white spandrel /
// blue-green ribbon banding.
function shawHouse(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const granite = api.mat.shawGranite, glass = api.mat.blueGlass, white = api.mat.paintedWhite;
  const H = b.h;
  const podium = 24;                               // 6 storeys
  const c = [ob.cx, ob.cz];

  // podium on the footprint, granite, over a double-height glazed base
  api.world.add(api.extrude(api.grow(b.p, 0.985), 6.5, api.mat.darkCurtain));
  api.world.add(api.extrude(b.p, podium - 6.5, granite, 6.5));

  // office slab set back above, banded: white spandrels / blue-green ribbons
  const inset = b.p.map(([x, z]) => [c[0] + (x - c[0]) * 0.7, c[1] + (z - c[1]) * 0.7]);
  const floors = Math.max(8, Math.round((H - podium) / 3.7));
  const fh = (H - podium) / floors;
  for (let k = 0; k < floors; k++) {
    const y = podium + k * fh;
    api.merge(api.extrudeGeo(inset, fh * 0.5, y + fh * 0.5), white, c[0], c[1]);
    api.merge(api.extrudeGeo(api.grow(inset, 0.985), fh * 0.5, y), glass, c[0], c[1]);
  }

  // THE DRUM at the junction corner: the corner of the frontage nearest a
  // second street. Approximated as a granite cylinder proud of the podium
  // corner, with a dark recessed slot near its top, the SHAW fascia band,
  // and greenery over the parapet.
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let fd = 0;
  while (fd < 60 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  // scan the frontage for the corner: last along-street point still inside
  let ce = 0, cs = 1;
  for (const s of [-1, 1]) {
    let e2 = 0;
    for (let d2 = 0; d2 <= ob.halfLong + 1; d2 += 0.5) {
      if (pointInRing(ob.cx + tX * s * d2 + sw.nx * (fd - 3), ob.cz + tZ * s * d2 + sw.nz * (fd - 3), b.p)) e2 = d2;
    }
    if (e2 > ce) { ce = e2; cs = s; }
  }
  const dr = 11;                                   // drum radius
  const dx = ob.cx + tX * cs * (ce - dr * 0.4) + sw.nx * (fd - dr * 0.45);
  const dz = ob.cz + tZ * cs * (ce - dr * 0.4) + sw.nz * (fd - dr * 0.45);
  const drumH = podium + 2.5;
  if (!onCarriageway(dx, dz, 0.5)) {
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(dr, dr, drumH - 6.5, 28), granite);
    drum.position.set(dx, g0 + 6.5 + (drumH - 6.5) / 2, dz);
    drum.castShadow = true; drum.receiveShadow = true;
    api.world.add(drum);
    // glazed base under the drum with black columns
    const base = new THREE.Mesh(new THREE.CylinderGeometry(dr * 0.96, dr * 0.96, 6.5, 28), api.mat.darkCurtain);
    base.position.set(dx, g0 + 3.25, dz);
    api.world.add(base);
    for (let a = 0; a < 6; a++) {
      const th = yaw + (a / 6) * Math.PI * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 6.5, 10), api.mat.darkMetal || api.mat.darkCurtain);
      col.position.set(dx + Math.sin(th) * dr * 0.82, g0 + 3.25, dz + Math.cos(th) * dr * 0.82);
      api.world.add(col);
    }
    // the recessed dark slot near the drum top
    const slot = new THREE.Mesh(new THREE.CylinderGeometry(dr * 1.005, dr * 1.005, 1.6, 28), api.mat.darkCurtain);
    slot.position.set(dx, g0 + drumH - 4.2, dz);
    api.world.add(slot);
    // roof garden spilling over the parapet: a green ring
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(dr * 1.04, dr * 1.04, 1.1, 28), api.mat.jadeRoof);
    ring.position.set(dx, g0 + drumH + 0.4, dz);
    ring.castShadow = false;
    api.world.add(ring);
  }
}

// PULLMAN SINGAPORE ORCHARD, 270 Orchard Road. research/pullman.md. A dark
// rectilinear prism, ~48m/14 storeys (Emporis, as Crown Prince Hotel) — NOT
// 92m, NOT a diagrid: the "crystal" is a herringbone chevron EMBOSSED in
// dark glass, so it is a texture on a plain box. 4-storey Knightsbridge
// podium flush to the pavement with Apple's 36.5m clear-glass storefront and
// thin white canopy; an 8-storey media wall over the podium on the Orchard
// face.
function pullmanOrchard(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const chev = api.mat.chevronGlass;
  const H = b.h;
  const podium = Math.min(16, H * 0.34);           // 4 storeys
  const c = [ob.cx, ob.cz];

  // one dark prism, podium and tower in the same skin (the real building
  // reads as a single monolith), Apple's bright base cut into the front
  api.world.add(api.extrude(b.p, H, chev));

  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let fd = 0;
  while (fd < 60 && pointInRing(ob.cx + sw.nx * fd, ob.cz + sw.nz * fd, b.p)) fd += 0.5;
  const bx = ob.cx + sw.nx * (fd + 0.12), bz = ob.cz + sw.nz * (fd + 0.12);

  // Apple storefront: published 36.5m of clear glass under a thin white
  // stone canopy projecting 7.6m — capped here by what stays clear of the
  // carriageway, because a published canopy and an invented road width can
  // still disagree
  const aw = Math.min(36.5, ob.halfLong * 1.4);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(aw, 6.2, 0.6), api.mat.brightGlass);
  glass.position.set(bx, g0 + 3.1, bz);
  glass.rotation.y = yaw;
  api.world.add(glass);
  let reach = 7.6;
  while (reach > 1.2 && onCarriageway(bx + sw.nx * reach, bz + sw.nz * reach, 0.4)) reach -= 0.4;
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(aw * 0.72, 0.35, reach), api.mat.paintedWhite);
  canopy.position.set(bx + sw.nx * (reach / 2), g0 + 6.4, bz + sw.nz * (reach / 2));
  canopy.rotation.y = yaw;
  canopy.castShadow = true;
  api.world.add(canopy);

  // the media wall: 8 storeys of glowing panel over the podium, Orchard face
  const mh = Math.min(H - podium - 1.5, 8 * 3.2);
  const media = new THREE.Mesh(new THREE.BoxGeometry(Math.min(15, aw * 0.5), mh, 0.4), api.mat.mediaWall);
  media.position.set(bx - tX * aw * 0.2, g0 + podium + mh / 2, bz - tZ * aw * 0.2);
  media.rotation.y = yaw;
  api.world.add(media);
}

// CONCORDE HOTEL, 100 Orchard Road. research/concorde.md. NOT a tower: 9
// storeys (3-storey podium + hotel L4-9), and NOT curved in plan — a straight
// slab parallel to the road whose SECTION rakes back: each hotel floor steps
// away from Orchard like ship decks, every band edge trailing green. East
// gable is a blank white gridded wall with the black logo panel — the first
// thing a rider sees coming from Dhoby Ghaut. h=30 derived from storeys.
function concordeHotel(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const white = api.mat.paintedWhite, dark = api.mat.darkCurtain;
  const green = api.mat.canopyFringe || api.mat.paintedWhite;
  const H = b.h;
  const podium = Math.min(11, H * 0.37);           // 3 storeys
  const c = [ob.cx, ob.cz];

  // podium: dark glazed shopfront strip at street level, white tile above
  api.world.add(api.extrude(api.grow(b.p, 0.985), 4.2, dark));
  api.world.add(api.extrude(b.p, podium - 4.2, white, 4.2));

  // the raked slab: six hotel floors, each inset a step further from the
  // street side. The step is applied by shrinking toward a line BEHIND the
  // centroid so only the street face retreats — shrinking to the centroid
  // pulled all four faces in and made a ziggurat, which the real slab is not.
  const sw = streetward(api, ob);
  // distance from centroid to the street face, walked once — the rake CAPS
  // vertices at a receding front plane. Translating the whole ring instead
  // marched the rear face out over the neighbours and left the street face
  // flush, which the first render showed.
  let fd0 = 0;
  while (fd0 < 80 && pointInRing(ob.cx + sw.nx * fd0, ob.cz + sw.nz * fd0, b.p)) fd0 += 0.5;
  const floors = 6, fh = (H - podium) / floors;
  for (let k = 0; k < floors; k++) {
    const y = podium + k * fh;
    const back = k * 1.15;                          // metres of step, per floor
    const cap = fd0 - back;
    const p2 = b.p.map(([x, z]) => {
      const d = (x - ob.cx) * sw.nx + (z - ob.cz) * sw.nz;
      if (d <= cap) return [x, z];
      return [x - sw.nx * (d - cap), z - sw.nz * (d - cap)];
    });
    // white fascia band with the dark ribbon glazing recessed under it
    api.merge(api.extrudeGeo(p2, fh * 0.42, y + fh * 0.58), white, c[0], c[1]);
    api.merge(api.extrudeGeo(api.grow(p2, 0.985), fh * 0.58, y), dark, c[0], c[1]);
    // trailing planting over each band edge, street side only: a slim green
    // strip lying along the fascia, built with extrudeGeo like every other
    // merged piece (a raw Box merged via a mesh matrix never rendered — the
    // matrix was identity until updateMatrix, and the footing offset is
    // extrudeGeo's job anyway)
    {
      const gx = ob.cx + sw.nx * (cap - 0.55), gz = ob.cz + sw.nz * (cap - 0.55);
      const lx2 = -sw.nz, lz2 = sw.nx, hl = ob.halfLong * 0.8, dp = 0.3;
      const strip = [
        [gx - lx2 * hl - sw.nx * dp, gz - lz2 * hl - sw.nz * dp],
        [gx + lx2 * hl - sw.nx * dp, gz + lz2 * hl - sw.nz * dp],
        [gx + lx2 * hl + sw.nx * dp, gz + lz2 * hl + sw.nz * dp],
        [gx - lx2 * hl + sw.nx * dp, gz - lz2 * hl + sw.nz * dp],
      ];
      api.merge(api.extrudeGeo(strip, 0.55, y + fh * 0.99), api.mat.jadeRoof, c[0], c[1]);
    }
  }

  // the gable logo panels, one per slab end, proud of the end face. Anchored
  // to the ORIENTED BOX extremes — a ring-walk from the centroid stopped at
  // an interior notch of this 9,500m2 plan and hung the panel mid-roof — and
  // kept below the raked top storey so it reads on the wall, not the sky.
  const lx = -sw.nz, lz = sw.nx;                   // along-street direction
  for (const s of [-1, 1]) {
    // the oriented box of this irregular plan reaches past the walls (the
    // documented ob trap) — scan for the LAST point inside the ring instead,
    // which also steps over interior notches
    let eEnd = 0;
    for (let d2 = 0; d2 <= ob.halfLong + 1; d2 += 0.5) {
      if (pointInRing(ob.cx + lx * s * d2, ob.cz + lz * s * d2, b.p)) eEnd = d2;
    }
    if (eEnd < 4) continue;
    const ex = ob.cx + lx * s * (eEnd + 0.3);
    const ez = ob.cz + lz * s * (eEnd + 0.3);
    if (onCarriageway(ex, ez, 0.3)) continue;
    const logo = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.4, 0.3), api.mat.darkMetal || dark);
    logo.position.set(ex, g0 + podium + (H - podium) * 0.62, ez);
    logo.rotation.y = Math.atan2(lx, lz);
    api.world.add(logo);
  }
}

// FAR EAST SHOPPING CENTRE, 545 Orchard Road. research/far-east-shopping-centre.md.
// 1974, BEP Akitek. Everything painted white. 5-storey podium with rounded
// vertical ribs over a recessed dark arcade; 10-storey office block above as
// stacked white trays with dark recessed glass strips; curved corner blade
// with gold Chinese characters at the Orchard/Angullia corner. h=51 is
// DERIVED (15 storeys) — metres unpublished; the old 75 was the frontage
// length mis-tagged as height.
function farEastShopping(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const white = api.mat.paintedWhite, dark = api.mat.darkCurtain;
  const H = b.h;
  const podium = Math.min(19, H * 0.38);           // 5 storeys
  const c = [ob.cx, ob.cz];

  // podium: the full footprint, white, with a dark recessed arcade at street
  // level (the shaded jeweller row) read as a 3.4m dark band under the mass
  api.world.add(api.extrude(b.p, podium - 3.4, white, 3.4));
  api.world.add(api.extrude(api.grow(b.p, 0.965), 3.4, dark));

  // rounded vertical ribs along the street frontage — the podium signature.
  // Thin white uprights proud of the wall; the bullnose cannot read at ride
  // speed, the RHYTHM can.
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let f = 0;
  while (f < 60 && pointInRing(ob.cx + sw.nx * f, ob.cz + sw.nz * f, b.p)) f += 0.5;
  const bx = ob.cx + sw.nx * (f + 0.12), bz = ob.cz + sw.nz * (f + 0.12);
  const bandW = Math.min(64, ob.halfLong * 1.8);
  const nRib = Math.max(8, Math.round(bandW / 4.2));
  for (let i = 0; i < nRib; i++) {
    const u = -bandW / 2 + (i + 0.5) * (bandW / nRib);
    const rx = bx + tX * u, rz = bz + tZ * u;
    if (onCarriageway(rx, rz, 0.3)) continue;
    // a rib must have podium wall behind it — the frontage line runs past
    // the building's own corner and the overhang stood ribs on nothing
    if (!pointInRing(rx - sw.nx * 1.6, rz - sw.nz * 1.6, b.p)) continue;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(1.0, podium - 4.2, 0.5), white);
    rib.position.set(rx, g0 + 3.4 + (podium - 4.2) / 2, rz);
    rib.rotation.y = yaw;
    rib.castShadow = false; rib.receiveShadow = true;
    api.world.add(rib);
  }

  // office block: inset, stacked trays — thick white band, thin dark strip,
  // ten repeats. The faceted-corner silhouette comes free from the inset
  // footprint keeping the plan's own corner cuts.
  const inset = b.p.map(([x, z]) => [c[0] + (x - c[0]) * 0.6, c[1] + (z - c[1]) * 0.6]);
  const floors = 10, fh = (H - podium) / floors;
  for (let k = 0; k < floors; k++) {
    const y = podium + k * fh;
    api.merge(api.extrudeGeo(inset, fh * 0.6, y + fh * 0.4), white, c[0], c[1]);
    api.merge(api.extrudeGeo(api.grow(inset, 0.965), fh * 0.4, y), dark, c[0], c[1]);
  }
  // low stepped parapet
  api.merge(api.extrudeGeo(api.grow(inset, 1.01), 1.1, H), white, c[0], c[1]);

  // the corner blade: a curved white panel at the frontage end carrying the
  // gold 遠東 characters — the most photographed identifier. A flat blade
  // with an emissive gold strip reads correctly at street distance.
  const cu = bandW / 2 + 1.2;
  const cxp = bx + tX * cu, czp = bz + tZ * cu;
  if (!onCarriageway(cxp, czp, 0.4)) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(3.2, podium + 6, 1.0), white);
    blade.position.set(cxp, g0 + (podium + 6) / 2, czp);
    blade.rotation.y = yaw + 0.5;
    blade.castShadow = true;
    api.world.add(blade);
    const goldStrip = new THREE.Mesh(new THREE.BoxGeometry(1.1, podium + 1, 0.24), api.mat.goldSign);
    goldStrip.position.set(cxp + sw.nx * 0.55, g0 + (podium + 6) / 2 + 1.4, czp + sw.nz * 0.55);
    goldStrip.rotation.y = yaw + 0.5;
    api.world.add(goldStrip);
  }
}

function liatTowers(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const stone = api.mat.paleStone, glass = api.mat.towerGlass, trim = api.mat.trim;
  const H = b.h;
  const podium = Math.min(15.5, H * 0.34);

  // podium, then the tower set back above it
  api.world.add(api.extrude(b.p, podium, stone));
  const c = [ob.cx, ob.cz];
  const inset = b.p.map(([x, z]) => [c[0] + (x - c[0]) * 0.82, c[1] + (z - c[1]) * 0.82]);
  api.world.add(api.extrude(inset, H - podium, stone, podium));

  // THE EYEBROWS. One projecting slab edge per office floor is the whole
  // character of this tower, and it is cheap: a thin ring per floor, grown
  // slightly proud of the inset mass, merged so it costs no draw call.
  const floors = Math.max(6, Math.round((H - podium) / 3.6));
  for (let k = 1; k <= floors; k++) {
    const y = podium + k * ((H - podium) / (floors + 1));
    if (y > H - 1.2) break;
    api.merge(api.extrudeGeo(api.grow(inset, 1.035), 0.34, y), trim, c[0], c[1]);
    // the recessed dark ribbon window under each eyebrow
    // 1.4m of a ~3.6m floor: the published description is a light stone
    // spandrel WITH a recessed ribbon under it, and at 1.9m the glass ate the
    // spandrel and the tower read as a dark slab instead of a striped one
    api.merge(api.extrudeGeo(api.grow(inset, 0.99), 1.4, y - 1.9), glass, c[0], c[1]);
  }

  // the sloping car-park louvre band over the podium: narrow vertical slots,
  // and the band FOLLOWS THE RAMP, which is the detail everyone misses
  const sw = streetward(api, ob);
  const yaw = Math.atan2(sw.nx, sw.nz);
  const tX = Math.cos(yaw), tZ = -Math.sin(yaw);
  let f = 0;
  while (f < 60 && pointInRing(ob.cx + sw.nx * f, ob.cz + sw.nz * f, b.p)) f += 0.5;
  const bx = ob.cx + sw.nx * (f - 0.2), bz = ob.cz + sw.nz * (f - 0.2);
  const bandW = Math.min(46, ob.halfLong * 1.7);
  const n = Math.max(6, Math.round(bandW / 1.15));
  for (let i = 0; i < n; i++) {
    const u = -bandW / 2 + (i + 0.5) * (bandW / n);
    const y = g0 + podium - 4.6 + (i / n) * 2.4;          // the ramp's slope
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.6, 0.5), trim);
    sl.position.set(bx + tX * u, y, bz + tZ * u);
    sl.rotation.y = yaw;
    sl.castShadow = false; sl.receiveShadow = true;
    api.world.add(sl);
  }

  // THE HERMES BOX, 2016: ivory Alucobond, four storeys, a grid of deep
  // rectangular openings each with ONE JAMB SPLAYED DIAGONALLY so they read
  // as angled slots rather than punched holes. Built at the corner of the
  // frontage, extending toward Angullia Park the way the real extension does.
  const hw = Math.min(21, ob.halfLong * 0.8), hh = 18.0, hd = 12.0;
  const hu = bandW * 0.22;
  const hx = bx + tX * hu + sw.nx * 1.4, hz = bz + tZ * hu + sw.nz * 1.4;
  if (!onCarriageway(hx, hz, 0.4)) {
    const shell = new THREE.Mesh(new THREE.BoxGeometry(hw, hh, hd), api.mat.ivory);
    shell.position.set(hx, g0 + hh / 2, hz);
    shell.rotation.y = yaw;
    shell.castShadow = true; shell.receiveShadow = true;
    uvMetres(shell, 9, 9);
    api.world.add(shell);
    // the openings: 5 bays x 3 rows on the street face
    for (let r = 0; r < 3; r++) {
      for (let bcol = 0; bcol < 5; bcol++) {
        const u = -hw / 2 + (bcol + 0.5) * (hw / 5);
        const y = g0 + 6.4 + r * 3.9;
        const op = new THREE.Mesh(new THREE.BoxGeometry(hw / 5 * 0.52, 2.5, 0.7), glass);
        op.position.set(hx + tX * u + sw.nx * (hd / 2 - 0.2), y, hz + tZ * u + sw.nz * (hd / 2 - 0.2));
        op.rotation.y = yaw;
        api.world.add(op);
        // the splayed jamb, one side only
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.5, 0.85), api.mat.ivory);
        jamb.position.set(hx + tX * (u - hw / 5 * 0.32) + sw.nx * (hd / 2 - 0.1), y,
                          hz + tZ * (u - hw / 5 * 0.32) + sw.nz * (hd / 2 - 0.1));
        jamb.rotation.y = yaw + 0.42;
        jamb.castShadow = true;
        api.world.add(jamb);
      }
    }
    // dark recessed display band at street level, under the ivory grid
    const disp = new THREE.Mesh(new THREE.BoxGeometry(hw * 0.94, 4.4, 0.5), api.mat.darkMetal);
    disp.position.set(hx + sw.nx * (hd / 2 + 0.1), g0 + 2.4, hz + sw.nz * (hd / 2 + 0.1));
    disp.rotation.y = yaw;
    api.world.add(disp);
    // THE BRONZE RIDER on the roof of the shop box -- the report's #1
    // recognition cue, and Singapore is only the second store in the world to
    // carry it outside. A silhouette at this scale, not a sculpture.
    const rider = new THREE.Group();
    const horse = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.15, 0.5), api.mat.bronze);
    horse.position.y = 1.5; rider.add(horse);
    for (const lx of [-0.7, -0.2, 0.35, 0.8]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.5, 0.16), api.mat.bronze);
      leg.position.set(lx, 0.75, 0); rider.add(leg);
    }
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.36), api.mat.bronze);
    body.position.set(0.15, 2.6, 0); rider.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), api.mat.bronze);
    head.position.set(0.15, 3.35, 0); rider.add(head);
    rider.position.set(hx, g0 + hh, hz);
    rider.rotation.y = yaw + Math.PI / 2;
    rider.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    api.world.add(rider);
  }
}

// MACDONALD HOUSE, 40A Orchard Road. Researched 2026-07-29 by agent against
// roots.gov.sg (NHB), Wikipedia, and the 1949 Singapore Free Press coverage
// cited there. Gazetted NATIONAL MONUMENT No. 50 (10 Feb 2003) with the
// EXTERIOR FACADE protected -- so the outside is the accurate reference and
// the renovated interior is irrelevant.
//
// The report also caught a bad figure in circulation: summaries calling this
// "79.5m, 17 storeys, the first skyscraper in Southeast Asia" have confused it
// with the CATHAY BUILDING. MacDonald House is 10 storeys and its height is
// UNPUBLISHED, so the mapped 40m stands.
//
// Published: 10 storeys, completed 2 July 1949, Reginald Eyre of Palmer &
// Turner for the Hongkong & Shanghai Bank, site 140ft x 100ft = 43m x 30m,
// sand-faced red brick from Alexandra Brickworks, flat roof laid with GREEN
// GLAZED CHINESE TILES. The strongest street cues, in the report's order: the
// only large red-brick high-rise on Orchard Road; the rooftop lettering; the
// white HSBC coat-of-arms plaque centred on the brick; two full-height white
// stair strips cutting the front into three panels; the cream stone colonnade.
function macdonaldHouse(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = b.h;
  const GROUND = 5.6;                       // the rendered podium band
  const brick = api.mat.redBrick, pale = api.mat.paleStone, trim = api.mat.trim;

  // cream rendered ground-floor podium, visually detached from the brick above
  api.world.add(api.extrude(b.p, GROUND, pale));
  // the brick slab
  api.world.add(api.extrude(b.p, H - GROUND, brick, GROUND));
  // projecting cornice, then the parapet, then the green-tiled eaves band
  api.merge(api.extrudeGeo(api.grow(b.p, 1.022), 0.55, H - 0.9), pale, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.006), 0.9, H - 0.35), api.mat.jadeRoof, ob.cx, ob.cz);

  // the street front, found from the plan rather than the oriented box
  const swd = streetward(api, ob);
  let bi = -1, best = -Infinity, bl = 0;
  for (let i = 0; i < b.p.length; i++) {
    const a = b.p[i], c2 = b.p[(i + 1) % b.p.length];
    const L = Math.hypot(c2[0] - a[0], c2[1] - a[1]);
    if (L < 6) continue;
    const emx = (a[0] + c2[0]) / 2, emz = (a[1] + c2[1]) / 2;
    const ox = emx - ob.cx, oz = emz - ob.cz, ol = Math.hypot(ox, oz) || 1;
    const faces = (ox / ol) * swd.nx + (oz / ol) * swd.nz;
    if (faces <= 0.2) continue;
    if (L * faces > best) { best = L * faces; bi = i; bl = L; }
  }
  if (bi < 0) return;
  const ea = b.p[bi], ec = b.p[(bi + 1) % b.p.length];
  const mx = (ea[0] + ec[0]) / 2, mz = (ea[1] + ec[1]) / 2;
  const oX = mx - ob.cx, oZ = mz - ob.cz, oL = Math.hypot(oX, oZ) || 1;
  const nX = oX / oL, nZ = oZ / oL, tX = -nZ, tZ = nX;
  const yaw = Math.atan2(nX, nZ);
  const at = (mesh, u, y, out) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // a facade piece must never stand in the road the frontage faces: the
    // frontage edge CAN lie on the kerb line (Raffles Arcade after the
    // streamed build handed it its own district axis), so every piece is
    // checked at the audit's margin, not placed on faith
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = true; mesh.receiveShadow = true;
    api.world.add(mesh);
  };

  // The two full-height white stair strips, splitting the front into thirds --
  // and the hood and balcony that belong to each one.
  //
  // THEY ARE BUILT AS A SET OR NOT AT ALL. This building has about a 4m
  // setback, so on one side the strip's own footprint lies over the
  // carriageway and pruneCarriageway correctly deletes it -- while the hood,
  // 49m up, survived and was left projecting over nothing. A composition
  // element whose parts are filtered independently comes apart: same family as
  // the taxi rank that kept its sign and lost its rail, except here the
  // leftover is the part that makes no sense alone.
  for (const side of [-1, 1]) {
    const u = side * bl / 6;
    if (onCarriageway(mx + tX * u + nX * 0.5, mz + tZ * u + nZ * 0.5, 0.3)) continue;
    at(new THREE.Mesh(new THREE.BoxGeometry(2.6, H - GROUND - 0.6, 0.5), pale),
       u, g0 + GROUND + (H - GROUND - 0.6) / 2, 0.24);
    // the small projecting hood each strip carries at parapet level
    at(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.0), pale),
       u, g0 + H - 0.5, 0.45);
    // and the pavement-level balcony carrying the HSBC monogram
    at(new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.34, 1.5), pale),
       u, g0 + GROUND + 1.6, 0.75);
  }
  // the colonnade of square piers carrying the covered walkway
  const piers = Math.max(4, Math.round(bl / 4.2));
  for (let i = 0; i <= piers; i++) {
    const u = -bl / 2 + (i * bl) / piers;
    if (onCarriageway(mx + tX * u + nX * 1.5, mz + tZ * u + nZ * 1.5, 0.3)) continue;
    at(new THREE.Mesh(new THREE.BoxGeometry(0.72, GROUND - 0.35, 0.72), pale),
       u, g0 + (GROUND - 0.35) / 2, 1.5);
  }
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.98, 0.45, 3.2), pale),
     0, g0 + GROUND - 0.2, 1.1);                      // the walkway soffit
  // the HSBC coat of arms, white stone, centred on the brick
  at(new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.28), trim),
     0, g0 + GROUND + 4.2, 0.3);
  // rooftop lettering, metal capitals along the parapet
  for (let i = 0; i < 9; i++) {
    at(new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.0, 0.16), api.mat.darkMetal),
       -bl * 0.24 + i * (bl * 0.48 / 8), g0 + H + 1.2, 0.2);
  }
}

// PERANAKAN PLACE, 180 Orchard Road. Researched 2026-07-29 by agent against
// URA's Conservation Portal, NLB Infopedia, and three DATED Wikimedia
// photographs (5 Apr 2024) read directly for the paint -- because the written
// repaint history is mostly uncited and the sources disagree. Corrections the
// report made to its own brief, all of which change what gets built:
//
//   It is CHINESE BAROQUE commercial shophouse, c.1902, not vernacular
//   Peranakan housing. "Peranakan Place" is a 1984 commercial rename.
//   The ground floor is a true ARCADE -- round-headed arches springing from
//   square fluted piers -- not a post-and-lintel five-foot way.
//   Emerald Hill Road was PEDESTRIANISED in 1981, so there is no junction
//   here: the terrace turns a corner onto a paved lane.
//   The parapet is an OPEN BALUSTRADE of dark bottle-green vase balusters
//   between cream piers, with the terracotta roof visible THROUGH it.
//   Only the facade and tilework are original; the 1985 restoration replaced
//   up to 70% of the decorative work and gutted the interiors.
//
// Published: 6 two-storey shophouses fronting Orchard Road, c.1902. Widths
// and heights are UNPUBLISHED -- the 24.8m frontage and ~8.7m height below are
// the report's OSM-derived and photogrammetric figures, used because there is
// nothing better and marked as estimates rather than dressed up as survey.
function peranakanPlace(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const GROUND = 4.1, UPPER = 4.6;            // photogrammetric, +/-0.5m
  const cream = api.mat.paleStone, green = api.mat.jadeRoof;

  // ground: the arcade wall, set back so the covered walk runs in front of it
  api.world.add(api.extrude(api.grow(b.p, 0.94), GROUND, cream));
  // upper storey in the painted bay texture
  api.world.add(api.extrude(b.p, UPPER, api.mat.peranakan, GROUND));
  // the moulded cornice between the floors, and the pitched clay roof behind
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.42, GROUND - 0.1), cream, ob.cx, ob.cz);
  // The roof sits LOW and inset: the report has the terracotta visible
  // THROUGH the balustrade, so a tall slab standing proud of it inverts the
  // relationship and reads as a lid.
  api.merge(api.extrudeGeo(api.grow(b.p, 0.90), 0.85, GROUND + UPPER), api.mat.clayTile, ob.cx, ob.cz);

  // the street frontage, from the plan
  const swd = streetward(api, ob);
  let bi = -1, sc = -Infinity, bl = 0;
  for (let i = 0; i < b.p.length; i++) {
    const a = b.p[i], c2 = b.p[(i + 1) % b.p.length];
    const L = Math.hypot(c2[0] - a[0], c2[1] - a[1]);
    if (L < 4) continue;
    const emx = (a[0] + c2[0]) / 2, emz = (a[1] + c2[1]) / 2;
    const ox = emx - ob.cx, oz = emz - ob.cz, ol = Math.hypot(ox, oz) || 1;
    const faces = (ox / ol) * swd.nx + (oz / ol) * swd.nz;
    if (faces <= 0.2) continue;
    if (L * faces > sc) { sc = L * faces; bi = i; bl = L; }
  }
  if (bi < 0) return;
  const ea = b.p[bi], ec = b.p[(bi + 1) % b.p.length];
  const mx = (ea[0] + ec[0]) / 2, mz = (ea[1] + ec[1]) / 2;
  const oX = mx - ob.cx, oZ = mz - ob.cz, oL = Math.hypot(oX, oZ) || 1;
  const nX = oX / oL, nZ = oZ / oL, tX = -nZ, tZ = nX;
  const yaw = Math.atan2(nX, nZ);
  const at = (mesh, u, y, out, cast = true) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // see the guard note on the first at(): the frontage edge can lie on
    // the kerb line, so no piece goes down without a carriageway check
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = cast; mesh.receiveShadow = true;
    api.world.add(mesh);
  };

  // THE ARCADE: one round arch per bay on square fluted piers. Built as a
  // pier plus a half-cylinder head, because the arch is what the report calls
  // the only arcaded ground floor on this stretch of Orchard Road.
  const bays = Math.max(3, Math.round(bl / 4.5));
  const bw = bl / bays;
  for (let i = 0; i <= bays; i++) {
    const u = -bl / 2 + i * bw;
    if (onCarriageway(mx + tX * u + nX * 1.9, mz + tZ * u + nZ * 1.9, 0.3)) continue;
    at(new THREE.Mesh(new THREE.BoxGeometry(0.62, GROUND - 1.0, 0.62), cream),
       u, g0 + (GROUND - 1.0) / 2, 1.9);
  }
  for (let i = 0; i < bays; i++) {
    const u = -bl / 2 + (i + 0.5) * bw;
    if (onCarriageway(mx + tX * u + nX * 1.9, mz + tZ * u + nZ * 1.9, 0.3)) continue;
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(bw * 0.44, bw * 0.44, 0.6, 12, 1, false, 0, Math.PI), cream);
    at(arch, u, g0 + GROUND - 1.0, 1.9);
    arch.rotation.set(Math.PI / 2, 0, 0);
    arch.rotation.y = 0;
    arch.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
  }
  // the covered walkway's soffit over the arcade
  at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.34, 2.4), cream),
     0, g0 + GROUND - 0.25, 1.35);

  // THE PARAPET BALUSTRADE: dark bottle-green vase balusters between cream
  // piers, open, with the terracotta roof showing through. This dark dashed
  // line at eaves level against pale pink is the terrace's signature.
  const top = g0 + GROUND + UPPER;
  const nb = Math.max(10, Math.round(bl / 0.62));
  for (let i = 0; i < nb; i++) {
    const u = -bl / 2 + (i + 0.5) * (bl / nb);
    at(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.72, 7), green),
       u, top + 0.36, 0.12, false);
  }
  at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.16, 0.5), cream), 0, top + 0.80, 0.12);
  at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.18, 0.55), cream), 0, top + 0.02, 0.12);
  for (let i = 0; i <= bays; i++) {
    at(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.15, 0.5), cream),
       -bl / 2 + i * bw, top + 0.58, 0.12);
  }
}

// TONG BUILDING, 302 Orchard Road. Researched 2026-07-29 by agent against
// Archello, Wikipedia (Timothy Seow), OneMap and 2024 transaction reporting.
// The brief was wrong twice and the report said so: the building was NEVER
// demolished or replaced (September 2024 sales describe the same 1978 tower),
// and it is at the Orchard / Mount Elizabeth junction wedged between Lucky
// Plaza and Paragon, not at Claymore.
//
// Published: 19 storeys, 1978, Timothy Seow & Partners, site 2,265 m2, GFA
// 11,094 m2, typical floor ~638 m2. Height UNPUBLISHED (one listing site says
// 182ft, single low-quality source, not used) so the mapped 64.6m stands.
//
// The published DESIGN IDEA is the whole recipe: four tile-clad corner
// service cores read as solid vertical shafts with curtain wall infilling
// between them, which is what gives column-free floors. So each elevation is
// solid band | glass | solid band, and it is the only pure office tower with
// no shopping podium on this stretch -- a plain glazed box standing back
// behind a forecourt between two malls.
function tongBuilding(api, b) {
  const ob = orientedBox(b.p);
  const H = b.h;
  const glass = api.mat.towerGlass, core = api.mat.warmStone;
  // NO PODIUM. The forecourt onto Orchard Road replaces it, so the mass runs
  // straight to the ground at one footprint.
  api.world.add(api.extrude(b.p, H, glass));
  // the four corner cores, as solid shafts on the corners of the plan
  const c = [ob.cx, ob.cz];
  for (let i = 0; i < b.p.length; i++) {
    const [px, pz] = b.p[i];
    const dx = px - c[0], dz = pz - c[1], dl = Math.hypot(dx, dz) || 1;
    // a shaft centred slightly inboard of each vertex, so it reads as part of
    // the mass rather than as a pier bolted to it
    const sx = px - (dx / dl) * 1.7, sz = pz - (dz / dl) * 1.7;
    if (onCarriageway(sx, sz, 0.3)) continue;
    const sh = new THREE.Mesh(new THREE.BoxGeometry(4.6, H, 4.6), core);
    sh.position.set(sx, api.footingY(b.p) + H / 2, sz);
    sh.rotation.y = -ob.ang;
    sh.castShadow = true; sh.receiveShadow = true;
    autoUV(sh, core);
    api.world.add(sh);
  }
  // horizontal floor-line mullions across the glazed field
  const floors = Math.max(8, Math.round(H / 3.5));
  for (let k = 1; k < floors; k++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.012), 0.16, k * (H / floors)),
              api.mat.trim, c[0], c[1]);
  }
}

// THE NCO CLUB, 32 Beach Road. Researched 2026-07-29 by agent against
// BiblioAsia (NLB), roots.gov.sg, thencoclub.com and Wikipedia. Corrections
// the report made, unprompted: it is the former NAAFI BRITANNIA CLUB, renamed
// SAF NCO Club in 1974 -- "Nissen" in the brief was a confusion with the
// Nuffield Swimming Pool it overlooked -- and it is at Beach Road / Bras
// Basah, 2.5km from Orchard. That last one it flagged as out of scope; it is
// NOT, because this world covers Bras Basah, which is why the building is in
// the scene file at all.
//
// Published: 3 storeys (NLB Infopedia says two; BiblioAsia and the operator
// both say three, so three), built 1951-52, opened 17 Dec 1952, Palmer &
// Turner -- the same firm as MacDonald House. Gazetted 9 Oct 2002, one of the
// first post-war Modern buildings conserved here. Height UNPUBLISHED.
//
// The form is deliberately LOW and horizontal: a rust-tiled corner block with
// a pitched GREEN roof and an open terrace running the entire length, built
// as a counterpoint to Raffles Hotel across the road. The mapped 30m is a
// three-storey building, so the recipe overrides it the way The Centrepoint's
// does -- a storey count is a fact and a default is not.
function ncoClub(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const FLOOR = 4.0, H = FLOOR * 3;
  const rust = api.mat.clayTile, green = api.mat.jadeRoof, pale = api.mat.paleStone;
  api.world.add(api.extrude(b.p, H, rust));
  // the pitched green roof, low and oversailing
  api.merge(api.extrudeGeo(api.grow(b.p, 1.04), 0.5, H), green, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.84), 1.4, H + 0.5), green, ob.cx, ob.cz);
  // THE TERRACES, running the entire length on every floor: a slab and a rail
  // per storey, which is what makes the elevation read as horizontal bands
  // rather than as a punched-window grid.
  for (let k = 1; k <= 2; k++) {
    const y = g0 + k * FLOOR;
    api.merge(api.extrudeGeo(api.grow(b.p, 1.055), 0.28, k * FLOOR), pale, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(api.grow(b.p, 1.052), 0.12, k * FLOOR + 0.95), pale, ob.cx, ob.cz);
    // the balusters between slab and rail
    const per = perimeterOf(b.p);
    const n = Math.max(12, Math.round(per / 1.6));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const p2 = alongRing(b.p, t, 1.052, ob);
      if (!p2) continue;
      const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 5), pale);
      bal.position.set(p2[0], y + 0.55, p2[1]);
      bal.castShadow = false; bal.receiveShadow = true;
      api.world.add(bal);
    }
  }
}

// perimeter of a ring, and a point a fraction of the way round it -- used by
// the NCO Club's terrace rails, which follow the plan rather than a box
function perimeterOf(p) {
  let d = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], c = p[(i + 1) % p.length];
    d += Math.hypot(c[0] - a[0], c[1] - a[1]);
  }
  return d;
}
function alongRing(p, t, grow, ob) {
  const total = perimeterOf(p);
  let want = t * total, acc = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], c = p[(i + 1) % p.length];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (acc + L >= want) {
      const f = (want - acc) / (L || 1);
      const x = a[0] + (c[0] - a[0]) * f, z = a[1] + (c[1] - a[1]) * f;
      return [ob.cx + (x - ob.cx) * grow, ob.cz + (z - ob.cz) * grow];
    }
    acc += L;
  }
  return null;
}

// TEMASEK SHOPHOUSE, 28 Orchard Road. Researched 2026-07-29 by agent against
// URA's Conservation Portal (archived), the PMO launch release, Indesign,
// and dated photographs. Corrections it made to its own brief: it is NOT on a
// corner (mid-block, next to MacDonald House); it launched 3 June 2019, not
// 2020; it is a URA-CONSERVED building, not a National Monument; and the
// address covers a 1928 block, not the ornate Dutch-gabled No. 22 beside it.
//
// Published: 3 storeys, built 1928, Westerhout & Oman, 2,316 m2 GFA.
// HEIGHT IS UNPUBLISHED and the OSM tag says 40m -- which is MacDonald House's
// number copied onto a three-storey shophouse, and the report says in as many
// words not to use it. Storey math gives ~18m: a double-height five-foot way,
// two upper floors and a stepped parapet.
function temasekShophouse(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const GROUND = 6.0, F2 = 6.0, F3 = 3.7, PARA = 2.0;
  const H = GROUND + F2 + F3;
  const render = api.mat.paleStone, trim = api.mat.trim, dark = api.mat.darkMetal;

  api.world.add(api.extrude(b.p, H, render));
  // the stepped Art Deco parapet, and the flat roof terrace behind it
  api.merge(api.extrudeGeo(api.grow(b.p, 1.015), PARA * 0.55, H), trim, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.99), PARA, H), trim, ob.cx, ob.cz);
  // the bold projecting main cornice, and the secondary one over the walkway
  api.merge(api.extrudeGeo(api.grow(b.p, 1.05), 0.5, H - 0.6), trim, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.04), 0.4, GROUND - 0.4), trim, ob.cx, ob.cz);

  const fr = frontage(api, ob, b.p);
  if (!fr) return;
  const { mx, mz, nX, nZ, tX, tZ, yaw, bl } = fr;
  const at = (mesh, u, y, out, cast = true) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // see the guard note on the first at(): the frontage edge can lie on
    // the kerb line, so no piece goes down without a carriageway check
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = cast; mesh.receiveShadow = true;
    api.world.add(mesh);
  };
  // THE DEEP DOUBLE-HEIGHT FIVE-FOOT WAY, which is the restoration's most
  // cited move: square rendered piers at the pavement edge, the shopfront
  // line set back behind them.
  const piers = Math.max(4, Math.round(bl / 5.0));
  for (let i = 0; i <= piers; i++) {
    const u = -bl / 2 + (i * bl) / piers;
    if (onCarriageway(mx + tX * u + nX * 3.2, mz + tZ * u + nZ * 3.2, 0.3)) continue;
    at(new THREE.Mesh(new THREE.BoxGeometry(0.85, GROUND - 0.5, 0.85), render),
       u, g0 + (GROUND - 0.5) / 2, 3.2);
  }
  at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.5, 3.6), render), 0, g0 + GROUND - 0.3, 1.7);
  // black-framed shopfront glazing, recessed behind the piers
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.94, GROUND - 1.2, 0.3), dark),
     0, g0 + (GROUND - 1.2) / 2, 0.35, false);

  // TWO PROJECTING END PAVILIONS, each carrying a PAIR of two-storey
  // giant-order engaged columns in a deep recess, and a projecting central
  // pier between the recessed loggia bays.
  const colH = F2 + F3 - 0.8;
  for (const side of [-1, 1]) {
    const u0 = side * bl * 0.40;
    at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.17, H - GROUND, 1.1), render),
       u0, g0 + GROUND + (H - GROUND) / 2, 0.5);
    for (const d of [-1, 1]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, colH, 10), trim);
      at(col, u0 + d * bl * 0.05, g0 + GROUND + colH / 2, 0.95);
      // the simplified Corinthian capital
      at(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 1.1), trim),
         u0 + d * bl * 0.05, g0 + GROUND + colH + 0.25, 0.95);
    }
  }
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.10, H - GROUND, 0.9), render),
     0, g0 + GROUND + (H - GROUND) / 2, 0.45);
  // the 2nd-storey open balcony with its turned-baluster balustrade, and the
  // recessed 3rd-storey loggia above it
  for (const [y, dep] of [[g0 + GROUND + 0.1, 1.5], [g0 + GROUND + F2 + 0.1, 1.1]]) {
    at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.62, 0.3, dep), trim), 0, y, 0.9);
    const nb = Math.max(10, Math.round(bl * 0.62 / 0.5));
    for (let i = 0; i < nb; i++) {
      const u = -bl * 0.31 + (i + 0.5) * (bl * 0.62 / nb);
      at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 0.75, 6), trim),
         u, y + 0.53, 0.9, false);
    }
    at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.62, 0.12, dep * 0.8), trim), 0, y + 0.95, 0.9);
  }
  // the oval cartouche medallions between the 2nd-storey windows
  for (let i = -2; i <= 2; i++) {
    at(new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), trim),
       i * bl * 0.11, g0 + GROUND + F2 * 0.72, 0.62);
  }
}

// CALDWELL HOUSE, inside CHIJMES, 30 Victoria Street. Researched 2026-07-29 by
// agent against roots.gov.sg (NHB), Wikipedia and dated photographs.
//
// The report carries an explicit WARNING worth keeping: AI-generated
// encyclopedia pages describe this building with "a pedimented portico with
// sturdy Doric columns" and "verandas wrapping the structure". Photographs and
// NHB both contradict that -- the ornament is "simple and subdued, with DORIC
// PILASTERS INSTEAD OF DETACHED COLUMNS", and no open verandah survives. So
// the recipe builds pilasters flat against the wall and no portico at all.
//
// Published: 2 storeys, built 1840-41, George Drumgoole Coleman, National
// Monument gazetted 26 Oct 1990 jointly with the CHIJ Chapel, with the WHOLE
// FABRIC protected rather than just the facade. Height UNPUBLISHED; the OSM
// tag of 24m is impossible for two storeys and is not used.
//
// The two things that identify it: a two-storey SEMICIRCULAR ROTUNDA bay on
// the front -- nothing else in the compound has a curved plan -- and a
// prominent JACK ROOF, the raised ventilating clerestory over a terracotta
// hipped roof.
function caldwellHouse(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const F = 4.6, H = F * 2;
  const cream = api.mat.paleStone, white = api.mat.trim, tile = api.mat.clayTile;

  api.world.add(api.extrude(b.p, H, cream));
  // string course between the floors, and the bracketed cornice above
  api.merge(api.extrudeGeo(api.grow(b.p, 1.02), 0.28, F - 0.14), white, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.045), 0.55, H - 0.25), white, ob.cx, ob.cz);
  // the hipped terracotta roof, then THE JACK ROOF above its ridge
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 1.5, H + 0.3), tile, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.52), 0.9, H + 1.8), cream, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.58), 0.7, H + 2.7), tile, ob.cx, ob.cz);

  const fr = frontage(api, ob, b.p);
  if (!fr) return;
  const { mx, mz, nX, nZ, tX, tZ, yaw } = fr;
  // THE ROTUNDA: a half-round two-storey drum on the front, three window bays
  // per floor between flat pilasters, capped by a curved entablature and a low
  // flat parapet -- the drum reads flat-roofed, unlike the tiled roof behind.
  const R = Math.min(5.2, ob.halfShort * 0.75);
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, H, 20, 1, false, 0, Math.PI), cream);
  drum.position.set(mx + nX * (R * 0.45), g0 + H / 2, mz + nZ * (R * 0.45));
  drum.rotation.y = yaw + Math.PI;
  drum.castShadow = true; drum.receiveShadow = true;
  api.world.add(drum);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.09, R * 1.09, 0.55, 20, 1, false, 0, Math.PI), white);
  cap.position.set(mx + nX * (R * 0.45), g0 + H - 0.1, mz + nZ * (R * 0.45));
  cap.rotation.y = yaw + Math.PI;
  cap.castShadow = true;
  api.world.add(cap);
  // DORIC PILASTERS, flat against the drum -- not detached columns
  for (let k = 0; k <= 4; k++) {
    const a = Math.PI * (k / 4);
    const px = mx + nX * (R * 0.45) - Math.cos(a + yaw) * R * 0.99;
    const pz = mz + nZ * (R * 0.45) + Math.sin(a + yaw) * R * 0.99;
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.55, H - 0.6, 0.28), white);
    pil.position.set(px, g0 + (H - 0.6) / 2, pz);
    pil.rotation.y = yaw - a;
    pil.castShadow = true;
    api.world.add(pil);
  }
}

// The street frontage of a plan: the longest edge whose outward normal faces
// the street, with the along-edge and outward unit vectors. Every recipe that
// puts something ON a facade needs this, and each was deriving it slightly
// differently -- the oriented box lies for an irregular plan, and a ray from
// the centroid lands on an arbitrary edge.
function frontage(api, ob, ring) {
  const swd = streetward(api, ob);
  let bi = -1, best = -Infinity, bl = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], c = ring[(i + 1) % ring.length];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (L < 4) continue;
    const emx = (a[0] + c[0]) / 2, emz = (a[1] + c[1]) / 2;
    const ox = emx - ob.cx, oz = emz - ob.cz, ol = Math.hypot(ox, oz) || 1;
    const faces = (ox / ol) * swd.nx + (oz / ol) * swd.nz;
    if (faces <= 0.15) continue;
    if (L * faces > best) { best = L * faces; bi = i; bl = L; }
  }
  if (bi < 0) return null;
  const ea = ring[bi], ec = ring[(bi + 1) % ring.length];
  const mx = (ea[0] + ec[0]) / 2, mz = (ea[1] + ec[1]) / 2;
  const oX = mx - ob.cx, oZ = mz - ob.cz, oL = Math.hypot(oX, oZ) || 1;
  const nX = oX / oL, nZ = oZ / oL;
  return { mx, mz, nX, nZ, tX: -nZ, tZ: nX, yaw: Math.atan2(nX, nZ), bl };
}

// ONE RAFFLES LINK, 1 Raffles Link. Researched 2026-07-29 by agent against
// KPF's own project page, Gammon (main contractor), Meinhardt (engineer) and
// photographs. It is in MARINA CENTRE, not Bras Basah as the brief assumed.
//
// Published: Kohn Pedersen Fox with Liang Peddle Thorp, completed 2000 for
// Hongkong Land, 30,800 m2, a near-column-free 48,000 sq ft floor plate. KPF
// call it a deliberately LOW HORIZONTAL SLAB in a city where "most office
// buildings are towers", with "a static barrel dome on the west and a dynamic
// triangular louvred roof on the east". Storey count conflicts across sources
// (six or seven); photographs reconcile it as six glazed office levels over a
// stone base. Height UNPUBLISHED, so the mapped 40m stands.
//
// The recognition is the WHITE STEEL EXOSKELETON standing proud of the glass,
// with horizontal louvre blades at every floor -- the shading, not the glazing,
// is what you read.
function oneRafflesLink(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = b.h, BASE = 7.0;
  const glass = api.mat.towerGlass, stone = api.mat.warmStone, white = api.mat.trim;

  api.world.add(api.extrude(b.p, BASE, stone));            // the granite base
  api.world.add(api.extrude(b.p, H - BASE, glass, BASE));  // the glazed slab
  // the shallow curved roof edge, and the sawtooth of triangular rooflights
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.7, H), white, ob.cx, ob.cz);

  const fr = frontage(api, ob, b.p);
  if (!fr) return;
  const { mx, mz, nX, nZ, tX, tZ, yaw, bl } = fr;
  const at = (mesh, u, y, out, cast = true) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // see the guard note on the first at(): the frontage edge can lie on
    // the kerb line, so no piece goes down without a carriageway check
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = cast; mesh.receiveShadow = true;
    api.world.add(mesh);
  };
  // THE EXOSKELETON: square vertical fins about one structural bay apart,
  // crossed by a transom at each floor, standing clear of the glass line.
  const bays = Math.max(6, Math.round(bl / 7.5));
  for (let i = 0; i <= bays; i++) {
    const u = -bl / 2 + (i * bl) / bays;
    at(new THREE.Mesh(new THREE.BoxGeometry(0.5, H - BASE + 1.2, 0.5), white),
       u, g0 + BASE + (H - BASE) / 2, 0.75);
  }
  const floors = Math.max(4, Math.round((H - BASE) / 4.2));
  for (let k = 0; k <= floors; k++) {
    const y = g0 + BASE + k * ((H - BASE) / floors);
    at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.32, 0.42), white), 0, y, 0.75, false);
    // the horizontal louvre blade / light shelf spanning between the fins
    if (k < floors)
      at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.09, 0.95), white), 0, y + 0.55, 0.62, false);
  }
  // the projecting entrance canopy over the drop-off
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.3, 0.45, 4.2), white), 0, g0 + 5.4, 2.2);
}

// RAFFLES ARCADE, 328 North Bridge Road. Researched 2026-07-29 by agent, and
// the finding that matters is that it is NOT what it looks like:
//
//   It is a 1991 BLOCK, built new in the S$160m restoration by Architects 61,
//   in matching Neo-Renaissance idiom -- not 1899 fabric. Its address is 328
//   North Bridge Road, not 1 Beach Road (that is the hotel's). Refitted, not
//   demolished, by Aedas in 2017-19.
//
// So the monument is the hotel behind it; this wing is a street wall that
// reads as part of it. Published: three storeys, opened November 1991 with 65
// shops, the Raffles Hotel Museum and Jubilee Hall. Height UNPUBLISHED.
//
// Photographed, not published: brilliant white painted plaster; GIANT-ORDER
// fluted Corinthian pilasters spanning levels 2-3; each bay a deeply RECESSED
// loggia so the elevation reads as shadow behind a white frame; dark
// bottle-green turned balustrades; a continuous ground-level ARCADE of round
// arches on square piers; an open balustraded parapet with no visible roof.
function rafflesArcade(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const GROUND = 5.4, UPPER = 8.6, H = GROUND + UPPER;
  // "Uniform brilliant white painted plaster" -- paleStone is a grey concrete
  // and rendered the whole wing the colour of a car park. Raffles is white.
  const white = api.mat.trim, green = api.mat.jadeRoof, plaster = api.mat.trim;

  // the block, set back so the ground-floor arcade stands in front of it
  api.world.add(api.extrude(api.grow(b.p, 0.965), GROUND, plaster));
  api.world.add(api.extrude(b.p, UPPER, plaster, GROUND));
  // the moulded frieze at first-floor level, the strongest horizontal here
  api.merge(api.extrudeGeo(api.grow(b.p, 1.035), 0.5, GROUND - 0.2), white, ob.cx, ob.cz);
  // the open balustraded parapet: no pitched roof is visible on this wing
  api.merge(api.extrudeGeo(api.grow(b.p, 1.025), 0.3, H), white, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.02), 0.22, H + 1.05), white, ob.cx, ob.cz);

  const fr = frontage(api, ob, b.p);
  if (!fr) return;
  const { mx, mz, nX, nZ, tX, tZ, yaw, bl } = fr;
  const at = (mesh, u, y, out, cast = true) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // see the guard note on the first at(): the frontage edge can lie on
    // the kerb line, so no piece goes down without a carriageway check
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = cast; mesh.receiveShadow = true;
    api.world.add(mesh);
  };
  const bays = Math.max(5, Math.round(bl / 6.5));
  const bw = bl / bays;
  // THE GROUND ARCADE: round arches on square piers, forming the covered
  // five-foot way. Nothing glazed ever meets the kerb on this frontage.
  for (let i = 0; i <= bays; i++) {
    const u = -bl / 2 + i * bw;
    if (onCarriageway(mx + tX * u + nX * 2.4, mz + tZ * u + nZ * 2.4, 0.3)) continue;
    at(new THREE.Mesh(new THREE.BoxGeometry(0.8, GROUND - 1.1, 0.8), white),
       u, g0 + (GROUND - 1.1) / 2, 2.4);
  }
  for (let i = 0; i < bays; i++) {
    const u = -bl / 2 + (i + 0.5) * bw;
    if (onCarriageway(mx + tX * u + nX * 2.4, mz + tZ * u + nZ * 2.4, 0.3)) continue;
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(bw * 0.42, bw * 0.42, 0.75, 14, 1, false, 0, Math.PI), white);
    at(arch, u, g0 + GROUND - 1.1, 2.4);
    arch.rotation.set(Math.PI / 2, 0, 0);
    arch.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
  }
  at(new THREE.Mesh(new THREE.BoxGeometry(bl, 0.42, 2.9), white), 0, g0 + GROUND - 0.35, 1.6);
  // GIANT-ORDER fluted Corinthian pilasters spanning the two upper levels,
  // with the recessed green-balustraded loggia between each pair
  for (let i = 0; i <= bays; i++) {
    const u = -bl / 2 + i * bw;
    at(new THREE.Mesh(new THREE.BoxGeometry(1.0, UPPER - 0.8, 0.42), white),
       u, g0 + GROUND + (UPPER - 0.8) / 2, 0.32);
    at(new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.6, 0.6), white),
       u, g0 + GROUND + UPPER - 0.65, 0.36);       // the foliate capital
  }
  for (let i = 0; i < bays; i++) {
    const u = -bl / 2 + (i + 0.5) * bw;
    const nb = Math.max(4, Math.round(bw / 0.45));
    for (let k = 0; k < nb; k++) {
      const uu = u - bw * 0.36 + (k + 0.5) * (bw * 0.72 / nb);
      at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.8, 6), green),
         uu, g0 + GROUND + 0.5, 0.30, false);
    }
    at(new THREE.Mesh(new THREE.BoxGeometry(bw * 0.76, 0.14, 0.4), white),
       u, g0 + GROUND + 0.94, 0.30, false);
  }
}

// SMA HOUSE, 20 Orchard Road -- the building the scene file calls "MDIS
// House". Researched 2026-07-29 by agent, and the first finding is that the
// NAME IS WRONG: there is no building called MDIS House, and MDIS has no
// Orchard Road address at all (its campus is Stirling Road, moving to Changi
// Road in 2027). MDIS was a TENANT here from 2002 to 2020, and the tenant's
// name stuck to the building in the map data.
//
// What it actually is: the former MALAYAN MOTORS SHOWROOM, built for Wearne
// Brothers by SWAN & MACLAREN, dated 1925 by roots.gov.sg and 1927 by the
// heritage record. A showroom until 1980, then the Singapore Manufacturers'
// Association (hence SMA House), gazetted for conservation in 2000, and since
// September 2025 the No. 16 component of the expanded Temasek Shophouse.
//
// The scene file carries this footprint TWICE, at 10.2m and at 40m. A 40m
// two-storey showroom is impossible, so the recipe builds its own height from
// the storey count and ignores both.
//
// The elevation, from roots.gov.sg and the heritage record: a long low
// horizontal block with a SCALLOP-SHAPED CENTRAL ARCH over a two-storey
// projecting window bay, a continuous run of windows either side, and a
// SCALLOPED SEMI-CIRCULAR GABLE AT EACH END of the roof -- three scalloped
// events across the front. Shanghai plaster, so pale stone-toned render.
function smaHouse(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = 10.5;                       // two showroom storeys, not the mapped 40
  const render = api.mat.paleStone, white = api.mat.trim, glassM = api.mat.towerGlass;

  api.world.add(api.extrude(b.p, H, render));
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 0.45, H - 0.5), white, ob.cx, ob.cz);

  const fr = frontage(api, ob, b.p);
  if (!fr) return;
  const { mx, mz, nX, nZ, tX, tZ, yaw, bl } = fr;
  const at = (mesh, u, y, out, cast = true) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // see the guard note on the first at(): the frontage edge can lie on
    // the kerb line, so no piece goes down without a carriageway check
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = cast; mesh.receiveShadow = true;
    api.world.add(mesh);
  };
  // the continuous showroom glazing at ground level
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.92, 3.8, 0.3), glassM),
     0, g0 + 2.2, 0.28, false);
  // THE CENTRAL SCALLOP ARCH over a two-storey projecting window bay
  const bayW = Math.min(7.5, bl * 0.26);
  at(new THREE.Mesh(new THREE.BoxGeometry(bayW, H - 1.2, 1.0), render), 0, g0 + (H - 1.2) / 2, 0.5);
  at(new THREE.Mesh(new THREE.BoxGeometry(bayW * 0.66, H - 3.4, 0.35), glassM),
     0, g0 + 1.9 + (H - 3.4) / 2, 1.05, false);
  const arch = new THREE.Mesh(
    new THREE.CylinderGeometry(bayW * 0.5, bayW * 0.5, 0.9, 16, 1, false, 0, Math.PI), white);
  at(arch, 0, g0 + H - 1.0, 0.55);
  arch.rotation.set(Math.PI / 2, 0, 0);
  arch.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
  // A SCALLOPED SEMI-CIRCULAR GABLE AT EACH END of the roof
  for (const side of [-1, 1]) {
    const gb = new THREE.Mesh(
      new THREE.CylinderGeometry(bl * 0.11, bl * 0.11, 0.7, 14, 1, false, 0, Math.PI), white);
    at(gb, side * bl * 0.40, g0 + H - 0.2, 0.35);
    gb.rotation.set(Math.PI / 2, 0, 0);
    gb.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), yaw);
  }
}

// NOMAD SINGAPORE, 230 Orchard Road, on the former Faber House site.
// Researched 2026-07-29 by agent against WOHA's own project page, UOL's media
// releases and trade press. UNDER CONSTRUCTION: WOHA list completion April
// 2026 and the opening has been pulled forward to late 2026, so by the date
// this world represents the building stands.
//
// Published: WOHA for UOL, 18 storeys per WOHA and UOL's 2021 announcement,
// 19 per UOL's 2025 release -- carried as a range, not resolved. 173 keys,
// GFA 11,025 m2. Height in metres UNPUBLISHED, so the mapped 63m stands.
//
// The design move, and the only thing worth building: a CLIFF-LIKE VERDANT
// VERTICAL LANDSCAPE set INTO the facade, with a FIFTEEN-STOREY WATERFALL in
// the recess, threaded with pavilions and decks. It is a planted canyon carved
// out of the street elevation, not a flat green wall, and WOHA designed it to
// read as continuous with their Design Orchard terraces opposite. Cladding
// material and panel module are UNPUBLISHED and are not invented here.
function nomadSingapore(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = b.h;
  const pale = api.mat.paleStone, glassM = api.mat.towerGlass, leaf = api.mat.jadeRoof;

  api.world.add(api.extrude(b.p, H, glassM));
  api.merge(api.extrudeGeo(api.grow(b.p, 1.015), 0.6, H), pale, ob.cx, ob.cz);

  const fr = frontage(api, ob, b.p);
  if (!fr) return;
  const { mx, mz, nX, nZ, tX, tZ, yaw, bl } = fr;
  const at = (mesh, u, y, out, cast = true) => {
    const px = mx + tX * u + nX * out, pz = mz + tZ * u + nZ * out;
    // see the guard note on the first at(): the frontage edge can lie on
    // the kerb line, so no piece goes down without a carriageway check
    if (onCarriageway(px, pz, 0.25)) return;
    mesh.position.set(px, y, pz);
    mesh.rotation.y = yaw;
    mesh.castShadow = cast; mesh.receiveShadow = true;
    api.world.add(mesh);
  };
  // THE CANYON: a deep recess cut into the street face, dark inside so it
  // reads as a void rather than as applied decoration
  const cw = Math.min(11, bl * 0.36);
  const top = g0 + H - 5;
  at(new THREE.Mesh(new THREE.BoxGeometry(cw, H - 8, 1.2), api.mat.darkMetal),
     bl * 0.10, g0 + 6 + (H - 8) / 2, 0.2, false);
  // the waterfall itself, a pale sheet falling the height of the recess
  at(new THREE.Mesh(new THREE.BoxGeometry(cw * 0.34, H - 10, 0.35), api.mat.glass),
     bl * 0.10, g0 + 7 + (H - 10) / 2, 0.75, false);
  // planting shelves stepping up the canyon, with pavilion decks between
  const steps = Math.max(6, Math.round((H - 10) / 4.2));
  for (let k = 0; k < steps; k++) {
    const y = g0 + 7 + k * ((H - 10) / steps);
    const u = bl * 0.10 + (k % 2 ? -1 : 1) * cw * 0.26;
    at(new THREE.Mesh(new THREE.BoxGeometry(cw * 0.42, 0.34, 1.6), pale), u, y, 0.95);
    at(new THREE.Mesh(new THREE.SphereGeometry(1.05, 8, 6), leaf), u, y + 0.9, 1.15, false);
  }
  // L5 sky terrace with the infinity pool that overlooks Orchard Road
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.55, 0.4, 3.4), pale), -bl * 0.16, g0 + 19.5, 1.5);
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.38, 0.3, 2.2), api.mat.water || api.mat.glass),
     -bl * 0.16, g0 + 19.95, 1.6, false);
  // the rooftop bar level
  at(new THREE.Mesh(new THREE.BoxGeometry(bl * 0.5, 0.35, 2.6), pale), 0, g0 + H - 1.2, 1.0);
}

// ---------------------------------------------------------------------------
// RESORTS WORLD SENTOSA, AND THE TWO RIDES THAT CARRY THE SKYLINE
//
// Researched 2026-08-03 for the owner's "i think the island got alot of
// attractions and all you got make it look like them". Sources and their
// limits, kept here because they are part of the fact:
//
// - Michael Graves was RWS's master planner and his practice publishes the
//   shared DNA in words: an "undulating profile and verdigris copper color"
//   for the roofs, "regular, evenly spaced elements" for the facades, and a
//   palette of "terracotta, marine blues, and earthy reds and oranges".
//   THE ROOFS ARE VERDIGRIS TEAL-GREEN, NOT GREY, and that one fact changes
//   the whole harbour silhouette. There is no gold glass anywhere on the site;
//   the gold people remember is night floodlighting.
// - NO METRE HEIGHT IS PUBLISHED FOR ANY RWS HOTEL. Checked against Michael
//   Graves Architecture, CTBUH, SkyscraperPage and Wikipedia and it is simply
//   absent, so every height here is the MAPPED tag and nothing is invented.
//   Floor counts are published and are used only to divide the mapped height.
// - Battlestar Galactica IS published: 42.5m, the world's tallest duelling
//   coasters. HUMAN is a red sit-down train, CYLON a dark grey inverted one —
//   REPAINTED FROM BLUE IN 2017, so any blue here would be a decade stale —
//   on white supports.
// - SkyHelix Sentosa is published at 35m above ground, open-air, 16 people.
//   The map tags it 35 too, which is a rare case of the two agreeing.
//
// Every recipe below takes its plan from the surveyed footprint and only its
// FORM from the research, which is the division this file has always used.
const VERDIGRIS = new THREE.MeshStandardMaterial({ color: 0x4e8f81, roughness: 0.52, metalness: 0.22 });
const RWS_WALL = new THREE.MeshStandardMaterial({ color: 0xd9cdb4, roughness: 0.82 });
const RWS_FRAME = new THREE.MeshStandardMaterial({ color: 0x2f6b63, roughness: 0.6 });
const COASTER_RED = new THREE.MeshStandardMaterial({ color: 0xb3241f, roughness: 0.5, metalness: 0.3 });
const COASTER_GREY = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.55, metalness: 0.35 });
const COASTER_WHITE = new THREE.MeshStandardMaterial({ color: 0xe6e4dd, roughness: 0.7 });

// A barrel vault along the footprint's long axis, drawn as a half-cylinder.
// Shared by Hotel Michael's row of vaults and the Oceanarium's caterpillar
// range, because they are the same move at two scales.
function barrelVault(api, ob, cx, cz, len, rad, y, mat, segs = 14) {
  const g = new THREE.CylinderGeometry(rad, rad, len, segs, 1, false, 0, Math.PI);
  // lay the cylinder down along the long axis, flat side up
  g.rotateZ(Math.PI / 2);
  g.rotateY(-ob.ang);
  g.translate(cx, y, cz);
  api.merge(g, mat, ob.cx, ob.cz);
}

// HOTEL MICHAEL — 11 storeys, 470 rooms. Its roof is a ROW OF GIANT BARREL
// VAULTS of varying heights in verdigris, and its walls carry square and round
// portholes stacked in columns. The mapped height (55m) is kept; the vault
// count comes from the footprint's own length so a small annexe piece gets one
// vault and the main mass gets five or six.
function hotelMichael(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(8, b.h || 55);
  api.world.add(api.extrude(b.p, H, RWS_WALL));
  // a shallow cornice band, the "regular, evenly spaced elements" reading
  api.merge(api.extrudeGeo(api.grow(b.p, 1.02), 0.5, H - 0.5), RWS_FRAME, ob.cx, ob.cz);
  const span = ob.halfLong * 2, rad = Math.min(ob.halfShort * 0.92, 9);
  const n = Math.max(1, Math.min(6, Math.round(span / Math.max(12, rad * 2.2))));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    const u = t * span;
    // varying heights: the published description is a row of DIFFERENT vaults
    const r = rad * (i % 2 ? 0.82 : 1.0);
    barrelVault(api, ob, ob.bx + u * ob.ux, ob.bz + u * ob.uz,
      span / n * 0.94, r, g0 + H, VERDIGRIS);
  }
}

// CROCKFORDS TOWER — 11 storeys, a faceted curved drum crowned by a ribbed
// dome of pointed-arch openwork with six small turrets, all verdigris. The
// casino sits three levels beneath it and is not drawn.
function crockfordsTower(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(10, b.h || 55);
  const rad = Math.max(6, Math.min(ob.halfLong, ob.halfShort) * 0.98);
  // the faceted drum: a low-segment cylinder reads as facets, which is what
  // the building is — not a smooth curtain-wall tube
  const drum = new THREE.CylinderGeometry(rad, rad * 1.04, H, 14);
  drum.translate(ob.bx, g0 + H / 2, ob.bz);
  api.merge(drum, RWS_WALL, ob.cx, ob.cz);
  // the ribbed dome crown
  const dome = new THREE.SphereGeometry(rad * 1.02, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.translate(ob.bx, g0 + H, ob.bz);
  api.merge(dome, VERDIGRIS, ob.cx, ob.cz);
  // six turrets round the crown, the detail that makes it read as Crockfords
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tx = ob.bx + Math.cos(a) * rad * 0.96, tz = ob.bz + Math.sin(a) * rad * 0.96;
    const t1 = new THREE.CylinderGeometry(rad * 0.11, rad * 0.11, 4.2, 8);
    t1.translate(tx, g0 + H + 2.1, tz);
    api.merge(t1, RWS_WALL, ob.cx, ob.cz);
    const t2 = new THREE.ConeGeometry(rad * 0.14, 2.6, 8);
    t2.translate(tx, g0 + H + 5.5, tz);
    api.merge(t2, VERDIGRIS, ob.cx, ob.cz);
  }
}

// SINGAPORE OCEANARIUM — opened 23 July 2025 in the S.E.A. Aquarium's shell.
// A long repeated barrel-vault range, VERDIGRIS GREEN rather than the
// terracotta the rest of the resort uses, right on the harbour edge.
function oceanarium(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(6, b.h || 20);
  api.world.add(api.extrude(b.p, H, RWS_WALL));
  const span = ob.halfLong * 2, rad = Math.min(ob.halfShort * 0.55, 7.5);
  const n = Math.max(3, Math.min(10, Math.round(span / Math.max(10, rad * 2.1))));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    const u = t * span;
    barrelVault(api, ob, ob.bx + u * ob.ux, ob.bz + u * ob.uz,
      span / n * 0.92, rad, g0 + H, VERDIGRIS);
  }
}

// BATTLESTAR GALACTICA — 42.5m, Vekoma, the world's tallest duelling
// coasters. The mapped footprint is the ride's PLAN, tagged 20m, which is the
// station building and not the ride: the 42.5m is published and is used for
// the lift hill. Two tracks, HUMAN red and CYLON dark grey, on white supports.
function battlestar(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const LIFT = 42.5;                    // published
  const span = ob.halfLong * 2;
  // the station shed keeps the mapped height
  api.world.add(api.extrude(b.p, Math.max(6, Math.min(b.h || 20, 12)), COASTER_WHITE));
  // the two tracks, side by side across the short axis, rising to the lift
  // hill and falling away — a profile, not a simulation of the real layout
  for (const [off, mat] of [[-ob.halfShort * 0.42, COASTER_RED], [ob.halfShort * 0.42, COASTER_GREY]]) {
    const px = -ob.uz * off, pz = ob.ux * off;
    const N = 26;
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const prof = (t) => g0 + 6 + (LIFT - 6) * Math.sin(Math.PI * Math.min(1, t * 1.25)) ** 1.4;
      const u0 = (t0 - 0.5) * span, u1 = (t1 - 0.5) * span;
      const x0 = ob.bx + u0 * ob.ux + px, z0 = ob.bz + u0 * ob.uz + pz;
      const x1 = ob.bx + u1 * ob.ux + px, z1 = ob.bz + u1 * ob.uz + pz;
      const y0 = prof(t0), y1 = prof(t1);
      const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
      const seg = new THREE.CylinderGeometry(0.45, 0.45, len, 6);
      // point the segment along the run
      const dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0).normalize();
      const qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      seg.applyQuaternion(qq);
      seg.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      api.merge(seg, mat, ob.cx, ob.cz);
      // white support columns down to the ground, every other bay
      if (i % 2 === 0 && y0 > g0 + 7) {
        const col = new THREE.CylinderGeometry(0.34, 0.34, y0 - g0, 6);
        col.translate(x0, g0 + (y0 - g0) / 2, z0);
        api.merge(col, COASTER_WHITE, ob.cx, ob.cz);
      }
    }
  }
}

// SKYHELIX SENTOSA — 35m above ground, open-air, 16 people with their feet
// dangling, opened 15 Dec 2021 on the site of the demolished Tiger Sky Tower.
// Published height, and the map agrees with it. A slim mast and an open ring
// gondola; nothing enclosed, because the whole point of it is that it is open.
function skyHelix(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = 35;                          // published
  const mast = new THREE.CylinderGeometry(0.9, 1.5, H, 12);
  mast.translate(ob.bx, g0 + H / 2, ob.bz);
  api.merge(mast, COASTER_WHITE, ob.cx, ob.cz);
  // the ring gondola, parked near the top
  const ring = new THREE.TorusGeometry(4.6, 0.42, 6, 20);
  ring.rotateX(Math.PI / 2);
  ring.translate(ob.bx, g0 + H * 0.78, ob.bz);
  api.merge(ring, COASTER_RED, ob.cx, ob.cz);
  // the canopy over it
  const cap = new THREE.ConeGeometry(5.4, 2.2, 14);
  cap.translate(ob.bx, g0 + H + 1.1, ob.bz);
  api.merge(cap, COASTER_WHITE, ob.cx, ob.cz);
  // hanger arms from mast to ring
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const arm = new THREE.BoxGeometry(4.4, 0.14, 0.14);
    arm.rotateY(-a);
    arm.translate(ob.bx + Math.cos(a) * 2.3, g0 + H * 0.86, ob.bz + Math.sin(a) * 2.3);
    api.merge(arm, COASTER_WHITE, ob.cx, ob.cz);
  }
}

// AJ HACKETT SENTOSA (Skypark) — the bungy tower. 47m is published and the
// map tags it 47 too, so the two agree and neither is invented. A steel lattice
// tower with a cantilevered jump platform; the giant swing and the skybridge
// share its structure. Kept as structure, not styled: the colour scheme is not
// published anywhere the research could reach.
function bungyTower(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(20, b.h || 47);        // published 47
  const half = Math.max(3.5, Math.min(ob.halfLong, ob.halfShort) * 0.8);
  const steel = COASTER_WHITE, dark = COASTER_GREY;
  // four legs, slightly battered so it reads as a tower and not a box
  const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [sx, sz] of legs) {
    const bx = ob.bx + (sx * half) * ob.ux - (sz * half) * ob.uz;
    const bz = ob.bz + (sx * half) * ob.uz + (sz * half) * ob.ux;
    const tx = ob.bx + (sx * half * 0.55) * ob.ux - (sz * half * 0.55) * ob.uz;
    const tz = ob.bz + (sx * half * 0.55) * ob.uz + (sz * half * 0.55) * ob.ux;
    const len = Math.hypot(tx - bx, H, tz - bz);
    const leg = new THREE.CylinderGeometry(0.34, 0.42, len, 8);
    const dir = new THREE.Vector3(tx - bx, H, tz - bz).normalize();
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
    leg.translate((bx + tx) / 2, g0 + H / 2, (bz + tz) / 2);
    api.merge(leg, steel, ob.cx, ob.cz);
  }
  // bracing rings up the tower
  for (let k = 1; k <= 5; k++) {
    const y = g0 + (k / 6) * H;
    const r = half * (1 - 0.45 * (k / 6)) * 1.42;
    const ring = new THREE.TorusGeometry(r, 0.11, 5, 4);
    ring.rotateX(Math.PI / 2);
    ring.rotateY(-ob.ang + Math.PI / 4);
    ring.translate(ob.bx, y, ob.bz);
    api.merge(ring, dark, ob.cx, ob.cz);
  }
  // the jump platform, cantilevered off one face at the top
  const deck = new THREE.BoxGeometry(half * 2.6, 0.4, half * 1.5);
  deck.rotateY(-ob.ang);
  deck.translate(ob.bx + ob.ux * half * 1.1, g0 + H, ob.bz + ob.uz * half * 1.1);
  api.merge(deck, dark, ob.cx, ob.cz);
}

// SINGAPORE CABLE CAR STATION — published description, and an unusually
// specific one: a WHITE PEDIMENT carried on FOUR FAT COLUMNS under TERRACOTTA
// PANTILES. That is a real portico, and it is what makes the building
// recognisable from Siloso Road, so it is drawn rather than approximated by a
// box with a pitched lid.
function cableCarStation(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(8, b.h || 20);
  const pale = api.mat.paleStone, tile = api.mat.clayTile;
  api.world.add(api.extrude(b.p, H, pale));
  // the pantile roof, oversailing
  api.merge(api.extrudeGeo(api.grow(b.p, 1.10), 0.45, H), tile, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.86), 1.7, H + 0.45), tile, ob.cx, ob.cz);
  // the portico: four fat columns on the long face, carrying a pediment
  const fx = ob.bx - ob.uz * ob.halfShort * 1.16;
  const fz = ob.bz + ob.ux * ob.halfShort * 1.16;
  for (let i = 0; i < 4; i++) {
    const t = (i - 1.5) / 3 * (ob.halfLong * 1.35);
    const cxp = fx + ob.ux * t, czp = fz + ob.uz * t;
    const col = new THREE.CylinderGeometry(0.85, 0.95, H * 0.72, 12);
    col.translate(cxp, g0 + H * 0.36, czp);
    api.merge(col, pale, ob.cx, ob.cz);
  }
  // The pediment: a SHALLOW gable over the columns. A three-sided
  // CylinderGeometry takes its triangle size from the RADIUS and its span from
  // the LENGTH, and the first version passed halfLong (about 20m here) as the
  // radius — which drew a 25m pyramid standing over the station like a tent,
  // vetted at shots/street/ccs.shot1. Radius is the gable's HEIGHT.
  const pedH = Math.min(3.2, H * 0.16);
  const ped = new THREE.CylinderGeometry(pedH, pedH, ob.halfLong * 2.7, 3);
  ped.rotateZ(Math.PI / 2);          // lay the prism down along its span
  ped.rotateY(-ob.ang);
  ped.translate(fx, g0 + H * 0.76 + pedH * 0.5, fz);
  api.merge(ped, pale, ob.cx, ob.cz);
}

// EQUARIUS HOTEL — 7 storeys, 172 keys, set against the rainforest slope in
// the west zone. Its published reading is WARM TIMBER-TONED HORIZONTAL BANDS,
// which is the opposite of the rest of the resort's masonry: a stack of
// balcony decks with timber soffits, not a punched wall.
function equariusHotel(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(6, b.h || 24);
  const FLOORS = Math.max(2, Math.round(H / 3.4));
  api.world.add(api.extrude(b.p, H, RWS_WALL));
  const timber = new THREE.MeshStandardMaterial({ color: 0x8a6a49, roughness: 0.78 });
  for (let k = 1; k <= FLOORS; k++) {
    const y = (k / FLOORS) * H - 0.35;
    if (y <= 0.5) continue;
    api.merge(api.extrudeGeo(api.grow(b.p, 1.07), 0.26, y), timber, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(api.grow(b.p, 1.065), 0.1, y + 0.95), timber, ob.cx, ob.cz);
  }
}

// WEAVE — 3 levels, over 20,000 m2, on the site of the old Forum. Published
// description of the cladding: brown and yellow, "rough grainy textures"
// referencing "sedimentary rocks along Siloso Headlands' coast", under an ETFE
// pillow canopy. The strata are the wall; the pillow canopy is the roof.
const WEAVE_ROCK = new THREE.MeshStandardMaterial({ color: 0x8f7047, roughness: 0.92 });
const WEAVE_OCHRE = new THREE.MeshStandardMaterial({ color: 0xc4a05a, roughness: 0.9 });
const ETFE = new THREE.MeshStandardMaterial({
  color: 0xeef0ea, roughness: 0.42, metalness: 0.05,
  transparent: true, opacity: 0.72, side: THREE.DoubleSide,
});
function weave(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(4, b.h || 5);
  api.world.add(api.extrude(b.p, H, WEAVE_ROCK));
  // sedimentary banding: alternating strata round the whole mass
  const bands = Math.max(3, Math.round(H / 1.6));
  for (let k = 0; k < bands; k++) {
    const y = (k / bands) * H;
    api.merge(api.extrudeGeo(api.grow(b.p, 1.02), H / bands * 0.45, y),
      k % 2 ? WEAVE_OCHRE : WEAVE_ROCK, ob.cx, ob.cz);
  }
  // the ETFE pillow canopy above it, a shallow inflated dome per bay
  const span = ob.halfLong * 2;
  const n = Math.max(2, Math.min(7, Math.round(span / 22)));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    const u = t * span * 0.92;
    const px = ob.bx + u * ob.ux, pz = ob.bz + u * ob.uz;
    const r = Math.min(ob.halfShort * 0.95, span / n * 0.52);
    const pillow = new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    pillow.scale(1, 0.34, 1);
    pillow.translate(px, g0 + H + 0.4, pz);
    api.merge(pillow, ETFE, ob.cx, ob.cz);
  }
}

// THE LAURUS — and the map still calls it Hard Rock Hotel.
//
// Hard Rock Hotel Singapore CLOSED 2 March 2024; The Laurus opened 1 Oct 2025
// in the same shell, 183 all-suites over FIVE STOREYS, 7,650 m2, P49 Deesign.
// There is NO guitar sculpture any more, so nothing here draws one.
//
// The mapped height is 55m, which cannot be right for a five-storey building
// and is the old tag for the whole RWS block. Five storeys IS published, so
// the height is taken from it at 3.4m floor to floor — the SAME stated
// assumption Bras Basah Complex uses, and flagged here the same way so nobody
// later mistakes 17m for a surveyed figure. Published form: grey pitched roofs
// with red-orange monitors and vermilion pilasters.
function theLaurus(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const FLOORS = 5;                       // published
  const H = FLOORS * 3.4;                 // ASSUMPTION: 3.4m floor to floor
  const grey = new THREE.MeshStandardMaterial({ color: 0x8d9095, roughness: 0.7 });
  const vermilion = new THREE.MeshStandardMaterial({ color: 0xb4502c, roughness: 0.72 });
  api.world.add(api.extrude(b.p, H, RWS_WALL));
  // the pilasters: vermilion piers up the elevation, the thing you actually
  // recognise it by from the pool deck
  const per = perimeterOf(b.p);
  const n = Math.max(8, Math.round(per / 7));
  for (let i = 0; i < n; i++) {
    const p2 = alongRing(b.p, (i + 0.5) / n, 1.03, ob);
    if (!p2) continue;
    const pier = new THREE.BoxGeometry(0.7, H * 0.92, 0.5);
    pier.rotateY(-ob.ang);
    pier.translate(p2[0], g0 + H * 0.46, p2[1]);
    api.merge(pier, vermilion, ob.cx, ob.cz);
  }
  // grey pitched roof with red-orange monitors along the ridge
  api.merge(api.extrudeGeo(api.grow(b.p, 1.06), 0.4, H), grey, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.8), 1.6, H + 0.4), grey, ob.cx, ob.cz);
  const span = ob.halfLong * 2;
  const m = Math.max(2, Math.min(6, Math.round(span / 16)));
  for (let i = 0; i < m; i++) {
    const u = ((i + 0.5) / m - 0.5) * span * 0.8;
    const mon = new THREE.BoxGeometry(span / m * 0.42, 1.5, ob.halfShort * 0.5);
    mon.rotateY(-ob.ang);
    mon.translate(ob.bx + u * ob.ux, g0 + H + 2.3, ob.bz + u * ob.uz);
    api.merge(mon, vermilion, ob.cx, ob.cz);
  }
}

// HOTEL ORA (ex-Festive Hotel) — about 7 storeys on the inland spine, with the
// Festive Grand's 1,600-seat theatre beneath it. Published reading: grey
// hipped roofs, DEEP EAVES, terracotta roof monitors.
function hotelOra(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const H = Math.max(8, b.h || 23.8);
  const grey = new THREE.MeshStandardMaterial({ color: 0x8d9095, roughness: 0.7 });
  api.world.add(api.extrude(b.p, H, RWS_WALL));
  // deep eaves: the overhang is the whole character, so it oversails hard
  api.merge(api.extrudeGeo(api.grow(b.p, 1.14), 0.38, H), grey, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.84), 1.9, H + 0.38), grey, ob.cx, ob.cz);
  const span = ob.halfLong * 2;
  const m = Math.max(2, Math.min(5, Math.round(span / 18)));
  for (let i = 0; i < m; i++) {
    const u = ((i + 0.5) / m - 0.5) * span * 0.76;
    const mon = new THREE.BoxGeometry(span / m * 0.4, 1.3, ob.halfShort * 0.45);
    mon.rotateY(-ob.ang);
    mon.translate(ob.bx + u * ob.ux, g0 + H + 2.4, ob.bz + u * ob.uz);
    api.merge(mon, api.mat.clayTile, ob.cx, ob.cz);
  }
}

// ---- THE SILOSO BEACH VENUES (research/siloso-venues.md, per-venue) -------
// Every dimension below is EST-PHOTO unless the brief marks it published; the
// brief is explicit that none of these buildings publish a metre figure.
// Sea direction on this strip: the sand and water lie toward (-2231, 12550)
// from every venue, so props orient by that bearing — authored, like all
// Layer-2 detail.
const SEAWARD = (ob) => {
  const dx = -2231 - ob.cx, dz = 12550 - ob.cz;
  const L = Math.hypot(dx, dz) || 1;
  return [dx / L, dz / L];
};

// EMERALD PAVILION, 40 Siloso Beach Walk — ONE building through four tenants
// (Café del Mar, Mambo, Rumours, Baristart — all gone by 2026; the PAVILION
// is what stands): a tall single volume under a dark bottle-green barrel
// vault on cream columns, a big arched opening at each end so the sea shows
// straight through.
function emeraldPavilion(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const cream = new THREE.MeshStandardMaterial({ color: 0xe2dac6, roughness: 0.8 });
  const green = new THREE.MeshStandardMaterial({ color: 0x1f4a37, roughness: 0.55 });
  const slab = api.extrudeGeo(b.p, 0.35, g0);
  api.merge(slab, cream, ob.cx, ob.cz);
  // columns down both long sides, spring line ~4.6m
  const SPRING = 4.6;
  const n = Math.max(4, Math.round(ob.halfLong / 3.2));
  for (const sgn of [-1, 1]) {
    for (let i = 0; i < n; i++) {
      const u = ((i + 0.5) / n - 0.5) * 2 * ob.halfLong * 0.94;
      const col = new THREE.BoxGeometry(0.6, SPRING, 0.6);
      col.rotateY(-ob.ang);
      col.translate(ob.bx + u * ob.ux + sgn * ob.halfShort * 0.9 * -ob.uz,
                    g0 + SPRING / 2,
                    ob.bz + u * ob.uz + sgn * ob.halfShort * 0.9 * ob.ux);
      api.merge(col, cream, ob.cx, ob.cz);
    }
  }
  // the vault: a half-cylinder along the long axis, radius the short half
  const R = Math.min(ob.halfShort * 0.98, (b.h || 8) - SPRING + 1.2);
  const vault = new THREE.CylinderGeometry(R, R, ob.halfLong * 2 * 0.98, 22, 1,
                                           true, 0, Math.PI);
  vault.rotateZ(Math.PI / 2);              // axis along X
  vault.rotateX(Math.PI / 2);              // opening downward, crown up
  vault.rotateY(-ob.ang + Math.PI / 2);
  vault.translate(ob.bx, g0 + SPRING, ob.bz);
  api.merge(vault, green, ob.cx, ob.cz);
  // cream ring beams the vault springs from
  for (const sgn of [-1, 1]) {
    const beam = new THREE.BoxGeometry(ob.halfLong * 2 * 0.98, 0.5, 0.5);
    beam.rotateY(-ob.ang);
    beam.translate(ob.bx + sgn * ob.halfShort * 0.9 * -ob.uz,
                   g0 + SPRING - 0.25,
                   ob.bz + sgn * ob.halfShort * 0.9 * ob.ux);
    api.merge(beam, cream, ob.cx, ob.cz);
  }
}

// COASTES + BIKINI BAR terrace — single-storey open verandah: white
// weatherboard back-of-house on the inland edge, deep timber deck, a flat
// pale roof of exposed rafters floating on timber posts, navy accents.
function coastesBar(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const [sx, sz] = SEAWARD(ob);
  const white = new THREE.MeshStandardMaterial({ color: 0xf0ede4, roughness: 0.75 });
  const timber = new THREE.MeshStandardMaterial({ color: 0x9a8264, roughness: 0.9 });
  const paleRoof = new THREE.MeshStandardMaterial({ color: 0xd8d2c2, roughness: 0.8 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x24344d, roughness: 0.7 });
  api.merge(api.extrudeGeo(b.p, 0.4, g0), timber, ob.cx, ob.cz);   // the deck
  // back-of-house: a low white box hugging the INLAND long edge
  const backW = ob.halfShort * 0.55;
  const back = new THREE.BoxGeometry(ob.halfLong * 2 * 0.9, 3.1, backW);
  back.rotateY(Math.atan2(sx, sz));
  back.translate(ob.cx - sx * (ob.halfShort - backW / 2) * 0.9,
                 g0 + 0.4 + 1.55,
                 ob.cz - sz * (ob.halfShort - backW / 2) * 0.9);
  api.merge(back, white, ob.cx, ob.cz);
  // posts + the floating flat roof over everything
  const RH = 4.6;
  const n = Math.max(4, Math.round(ob.halfLong / 3.5));
  for (const sgn of [-1, 1]) {
    for (let i = 0; i < n; i++) {
      const u = ((i + 0.5) / n - 0.5) * 2 * ob.halfLong * 0.92;
      const post = new THREE.BoxGeometry(0.22, RH, 0.22);
      post.rotateY(-ob.ang);
      post.translate(ob.bx + u * ob.ux + sgn * ob.halfShort * 0.86 * -ob.uz,
                     g0 + 0.4 + RH / 2,
                     ob.bz + u * ob.uz + sgn * ob.halfShort * 0.86 * ob.ux);
      api.merge(post, timber, ob.cx, ob.cz);
    }
  }
  api.merge(api.extrudeGeo(api.grow(b.p, 1.06), 0.28, g0 + 0.4 + RH), paleRoof, ob.cx, ob.cz);
  // the navy fascia line, the brand accent
  api.merge(api.extrudeGeo(api.grow(b.p, 1.062), 0.14, g0 + 0.4 + RH + 0.28), navy, ob.cx, ob.cz);
}

// OLA BEACH CLUB — two storeys + open roof deck: weathered grey vertical
// timber below, a navy louvre band the length of the upper level, external
// beach stair, white rail on the deck.
function olaBeachClub(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const [sx, sz] = SEAWARD(ob);
  const grey = new THREE.MeshStandardMaterial({ color: 0xa7a49b, roughness: 0.85 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x22334e, roughness: 0.7 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.6 });
  api.merge(api.extrudeGeo(b.p, 3.1, g0), grey, ob.cx, ob.cz);
  // navy louvre band, slightly oversailing
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 2.1, g0 + 3.1), navy, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(b.p, 0.25, g0 + 5.2), grey, ob.cx, ob.cz);   // deck slab
  // white deck rail
  api.merge(api.extrudeGeo(api.grow(b.p, 1.0), 0.08, g0 + 6.25), white, ob.cx, ob.cz);
  const per = perimeterOf(b.p);
  const np = Math.max(10, Math.round(per / 2.2));
  for (let i = 0; i < np; i++) {
    const p2 = alongRing(b.p, (i + 0.5) / np, 1.0, ob);
    if (!p2) continue;
    const post = new THREE.BoxGeometry(0.07, 0.85, 0.07);
    post.translate(p2[0], g0 + 5.45 + 0.42, p2[1]);
    api.merge(post, white, ob.cx, ob.cz);
  }
  // external stair block on the beach side
  const stair = new THREE.BoxGeometry(1.6, 3.1, 3.4);
  stair.rotateY(Math.atan2(sx, sz));
  stair.translate(ob.cx + sx * (ob.halfShort + 0.9), g0 + 1.55,
                  ob.cz + sz * (ob.halfShort + 0.9));
  api.merge(stair, grey, ob.cx, ob.cz);
}

// TRAPIZZA — Palm Springs one-storey: apricot render, a very deep flat
// cantilevered eave faced cream (the breeze-block screen), open to the sand.
function trapizza(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const apricot = new THREE.MeshStandardMaterial({ color: 0xc98d68, roughness: 0.85 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.8 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x93a7b4, roughness: 0.75 });
  api.merge(api.extrudeGeo(b.p, 3.6, g0), apricot, ob.cx, ob.cz);
  // the deep eave: oversails a metre and a half, faced cream
  api.merge(api.extrudeGeo(api.grow(b.p, 1.22), 0.75, g0 + 3.6), cream, ob.cx, ob.cz);
  // pale grey-blue panel band under the eave
  api.merge(api.extrudeGeo(api.grow(b.p, 1.005), 0.7, g0 + 2.8), blue, ob.cx, ob.cz);
}

export const RECIPES = [
  [/^emerald pavilion/i, emeraldPavilion],
  [/^coastes/i, coastesBar],
  [/^ola beach club/i, olaBeachClub],
  [/^trapizza/i, trapizza],
  [/^aj hackett/i, bungyTower],
  [/^hard rock hotel|^the laurus/i, theLaurus],
  [/^hotel ora|^festive hotel/i, hotelOra],
  [/^equarius hotel/i, equariusHotel],
  [/^weave$/i, weave],
  [/^singapore cable car station/i, cableCarStation],
  // SENTOSA — see the research block above this table. Hotel Michael's name is
  // carried by the main mass AND several small annexe footprints, which is
  // correct: they are one hotel and must share a family.
  [/^hotel michael/i, hotelMichael],
  [/^crockfords tower/i, crockfordsTower],
  [/^singapore oceanarium/i, oceanarium],
  [/^battlestar galactica/i, battlestar],
  [/^skyhelix/i, skyHelix],
  // River Valley Road's western frontage. RV Residences is six blocks under one
  // name and they MUST share a family — the research is explicit that they are
  // one development stepping down the slope.
  [/valley point/i, mallPodiumTower],
  [/rv suites|rv residences|rv edge|stellar rv|loft @ nathan|oxley thanksgiving/i, boutiqueApartment],
  [/far east shopping/i, farEastShopping],
  [/^concorde hotel/i, concordeHotel],
  [/pullman singapore orchard/i, pullmanOrchard],
  [/^shaw house/i, shawHouse],
  [/school of the arts/i, sota],
  [/voco orchard/i, vocoOrchard],
  [/forum the shopping|^the forum$/i, forumMall],
  [/palais renaissance/i, palaisRenaissance],
  [/orchard rendezvous/i, orchardRendezvous],
  [/^sma house|^mdis house/i, smaHouse],
  [/nomad singapore|faber house/i, nomadSingapore],
  [/one raffles link/i, oneRafflesLink],
  [/raffles arcade|raffles hotel arcade/i, rafflesArcade],
  [/temasek shophouse/i, temasekShophouse],
  [/caldwell house/i, caldwellHouse],
  [/^tong building/i, tongBuilding],
  [/nco club/i, ncoClub],
  [/peranakan place/i, peranakanPlace],
  [/^macdonald house|^macdonald hse/i, macdonaldHouse],
  [/^liat tower/i, liatTowers],
  [/^the cathay$|^cathay building|cathay building/i, theCathay],
  [/the centrepoint|^centrepoint/i, theCentrepoint],
  [/raffles city|swissotel|fairmont singapore|westin plaza/i, rafflesCity],
  // PARKED 2026-07-30 morning, NOT wired: both South Bridge Road temple
  // recipes exist below with full research (16 corrected premises) but the
  // first build round failed its vet — the rectangular hip roofs SHEAR
  // (a 4-gon frustum rotated 45° cannot then be non-uniformly scaled at
  // the MESH level; bake rotateY(PI/4)+scale into the GEOMETRY, then yaw
  // the mesh), and the gopuram edge-march needs verifying against the
  // real South Bridge Road side. A recipe that reads worse than the
  // generic does not ship. Next session: buildup playbook, staged gates.
  // STILL PARKED after round 2 (2026-07-30 ~09:45): the roof shear is FIXED
  // (rotation baked into geometry — keep that), and the massing now reads
  // from the air, but at STREET level the porch roof hangs over the public
  // pavement (span W*0.66 x 12 deep from a centre 5.2m out reaches ~11m),
  // R2/R3 roofs are swallowed by the full-height core (needs stepped
  // set-backs: full footprint to ~12m, 0.9 to ~18, 0.8 to ~24 so each roof
  // wraps a step), and the SMT gopuram has never been verified visible from
  // South Bridge Road. Round 3: fix those three, then judge from the
  // RIDER'S seat before wiring.
  [/^buddha tooth relic temple/i, buddhaTooth],
  [/^sri mariamman temple$/i, sriMariamman],
  [/^lau pa sat$/i, lauPaSat],
  [/^people's park complex$/i, peoplesPark],
  [/^thian hock keng$/i, thianHockKeng],
  [/^masjid sultan$/i, sultanMosque],
  // "Masjid Jamae (Chulia)" is the OSM name. Anchored to the start so it cannot
  // also take "Jamae Chulia Heritage", a separate 155 m2 footprint next door.
  [/^masjid jamae/i, masjidJamae],
  [/^centrium square$/i, centriumSquare],
  [/^fook hai building$/i, fookHai],
  [/^tekka place$/i, tekkaPlace],
  [/^uob plaza/i, uobPlaza],
  [/^ocbc bank$/i, ocbcCentre],
  [/^republic plaza$/i, republicPlaza],
  [/^old hill street police station$/i, oldHillStreet],
  [/bras basah complex/i, brasBasahComplex],
  [/^tekka centre$/i, tekkaCentre],
  [/lasalle/i, lasalle],
  [/^sim lim square$/i, simLimSquare],
  [/veeramakaliamman/i, veeramakaliamman],
  [/abdul gafoor/i, abdulGafoor],
  [/angullia/i, angullia],
  [/masjid malabar|malabar muslim/i, masjidMalabar],
  [/lakshmi ?narayan/i, lakshminarayan],
  [/^the warehouse$/i, warehouseGodowns],
  [/^golden mile complex$/i, goldenMileComplex],
  [/^raffles hotel$/i, rafflesHotel],
  // Anchored so "Istana Heritage Gallery" and "Istana Park" keep the
  // generic treatment: only the house itself gets the house.
  [/^istana$/i, istana],
  // The Civic District colonial set — see civicPalladian(). Anchored tightly so
  // "Parliament Secretariat's Office" (1999, next door) keeps generic fabric.
  [/^the arts house$/i, artsHouse],
  [/^victoria theatre and concert hall$/i, victoriaTheatre],
  [/^asian civilisations museum$/i, empressPlace],
  [/srinivasa perumal/i, perumalGopuram],
  // Matched on the full name because "Pickering" alone also hits "Pickering
  // Operation Complex" and "One Upper Pickering", two different buildings on
  // the same street. research/heights-cbd.md TRAP 5 warns that two footprints
  // share the PARKROYAL name.
  [/parkroyal collection pickering/i, parkroyalPickering],
  // kampongKaporChurch IS WRITTEN AND IS DELIBERATELY NOT WIRED. See the note
  // at the head of the function. It would belong here, before the generic
  // gothicChurch pattern that matches /methodist church/.
  // PARKED 2026-07-30 midday after round 1: The Foundry's OSM footprint is
  // a chunky pentagon, not the 115x57 slab the research measured (the
  // research measured the ROOF outline from satellite; the ground footprint
  // differs), so the gabled ranges and doors placed off the oriented box
  // land wrong, and the trim extrude caps the whole top white. Round 2:
  // derive ranges from the RING extents (the buddhaTooth lesson), vet from
  // the river, and only then wire. Recipes + research stay banked.
  // PARKED again after round 2 (2026-07-30 ~13:55): ring-extent ranges
  // STILL don't land on The Foundry's pentagon — the roofs are absent from
  // the aerial while the extrude renders, and no exception fires. Round 3
  // must INSTRUMENT (log uC2/vC2/W2/L2 and one roof's world position vs
  // the ring) before placing anything. Do not burn vet rounds guessing.
  // [/^the foundry$|^the cannery$/i, cqWarehouse],
  // [/^merchants' court$/i, cqShophouses],

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
  [/bugis\+/i, crystalMesh],
  [/^bugis junction$/i, bugisJunction],

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
  // ANCHORED, because "Singapore Flyer Car Park" contains "Singapore Flyer" and
  // was being handed its own 165m observation wheel. Two wheels stood side by
  // side 125m apart in every frame looking north up Temasek Avenue — the single
  // most recognisable object in Marina Bay, duplicated, and no check could see
  // it because both were built exactly as the recipe intended. Fourth time a
  // recipe pattern has over-matched (Grand Park City Hall, Esplanade Theatre,
  // ArtScience Museum were the others): a landmark name is a WHOLE name.
  [/^singapore flyer$/i, singaporeFlyer],
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
  [/plaza singapura|the cathay|orchard gateway|holland/i,
   glassBoxPodiumTower],
  // hotels whose names do not contain the word "hotel", so the pattern above
  // never matched them
  [/conrad|the elizabeth|grand park|orchard grand|orchard parade|york |goodwood park|quincy|oasia|jen |m social|parkroyal|swissotel|carlton|peninsula|excelsior/i,
   hotel],
  // offices, schools and civic blocks: concrete frames with vertical fins, which
  // is what most of this stock actually is
  // `istana` REMOVED 2026-08-01: this family draws vertical concrete fins and
  // the Istana is an 1869 colonial palace. It now has its own recipe, anchored
  // as /^istana$/ further up so the Heritage Gallery still lands here.
  [/waterloo centre|wilkie edge|one sophia|penang road|lazada|cuppage|school of|lasalle|singapore management|nanyang academy|the atrium|manulife|winsland|somerset house|orchard shopping/i,
   finnedSlab],
  // KALLANG. Anchored with ^ and $ so "Singapore Sports Museum" and
  // "Sports Hub Library" keep the generic fabric -- the same containment trap
  // that gave the Singapore Flyer Car Park the wheel's 165m.
  [/^national stadium$/i, nationalStadium],
  [/^singapore indoor stadium$/i, indoorStadium],
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
                              // A stadium bowl has no street-level retail bays.
                              nationalStadium, indoorStadium,
                              gothicChurch, colonialHotel, artScienceMuseum,
                              // The President's residence has no shops in it.
                              istana,
                              artsHouse, victoriaTheatre, empressPlace,
                              merlion, singaporeFlyer,
                              // Tekka Centre's ground floor is an OPEN market -- columns and
                              // louvres, 284 wet stalls and 119 hawker stalls straight off the
                              // pavement. Glazed retail bays are the wrong idiom for exactly the
                              // reason lau pa sat is already in NEVER_SHOPFRONT below.
                              tekkaCentre,
                              // LASALLE's ground floor is studios and a colonnade behind a
                              // base flare, not a retail frontage.
                              lasalle]);
// Buildings that never have a shopfront whether or not a recipe knows them.
// Maghain Aboth Synagogue has no recipe, so the set above let it through and it
// was given a row of glazed retail bays. Only words that cannot be anything
// else: "gallery" is Mandarin Gallery, a mall, and "court" is a block of flats.
const NEVER_SHOPFRONT =
  /synagogue|mosque|masjid|gurdwara|temple|cathedral|chapel|church|monastery|convent|cenotaph|parliament|embassy|high commission|museum|memorial|merlion|observatory|supertree|lau pa sat|thian hock keng|old hill street/i;
export function hasShopfront(name) {
  if (name && NEVER_SHOPFRONT.test(name)) return false;
  const fn = recipeFor(name);
  return !fn || !NO_SHOPFRONT.has(fn);
}

// The OUTWARD normal of a footprint edge. Guessing it as (-dz, dx) is a coin
// flip: it depends entirely on which way the ring is wound, and OSM rings are
// not consistently wound. Guessed wrong, everything a recipe hangs on a facade
// -- window bays, sign boards, awnings -- is built INSIDE the mass, where it is
// either invisible or z-fighting with the wall it is supposed to sit on. Both
// of those were seen on Abdul Gafoor within one render of each other.
function outwardSign(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, z0] = ring[i], [x1, z1] = ring[(i + 1) % ring.length];
    a += x0 * z1 - x1 * z0;
  }
  return a > 0 ? -1 : 1;
}

export function recipeFor(name) {
  if (!name) return null;
  for (const [re, fn] of RECIPES) if (re.test(name)) return fn;
  return null;
}


// BRAS BASAH COMPLEX, 231/232/233 Bain Street — "Book City", 1979-80.
// Researched 2026-07-31, spec in research/bras-basah-complex.md.
//
// WHY THIS RECIPE EXISTS. The map gives this site ONE polygon with height=20,
// and 20m is the tag for the SHOPPING PODIUM sitting on a polygon that covers
// the whole block — so the generic family drew an 8,700 m2 slab five storeys
// high where the real thing is a podium carrying TWO 25-STOREY RESIDENTIAL
// SLABS. From North Bridge Road a rider saw a long low box instead of the two
// towers that are the whole silhouette of this corner, opposite the National
// Library. HDB's own dataset settles it: block 231 max_floor_lvl 5, blocks 232
// and 233 max_floor_lvl 25, 120 four-room flats each.
//
// HEIGHT IS A STATED ASSUMPTION, NOT A FACT. No metre height is published for
// this complex in HDB, URA, Roots, Wikipedia, EdgeProp or the press — the
// research went looking and came back empty, which is recorded rather than
// papered over. The podium keeps the MAPPED 20m, because that tag genuinely
// describes the podium. The slabs are drawn from the storey count at 2.9m
// floor to floor for levels 6-25, and that multiplication is an assumption of
// this file, flagged here so nobody later mistakes it for a surveyed figure.
function brasBasahComplex(api, b) {
  const ob = orientedBox(b.p);
  const g0 = api.footingY(b.p);
  const render = api.mat.paleStone;
  const accent = new THREE.MeshStandardMaterial({ color: 0xa8503a, roughness: 0.82 });
  const deck = api.mat.warmStone;

  const PODIUM = Math.min(22, b.h || 20);          // the mapped tag's own subject
  const FLOORS = 20;                               // levels 6-25
  const FLOOR = 2.9;                               // ASSUMPTION, see note above
  const TOP = PODIUM + FLOORS * FLOOR;

  // box space -> world. u runs along the long axis (Bain Street, ~114m), v
  // across it toward North Bridge Road.
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];

  // 1. the commercial podium, the whole footprint
  api.merge(api.extrudeGeo(b.p, PODIUM), render, ob.cx, ob.cz);
  // a low parapet, because the podium roof is an OCCUPIED deck — HDB put the
  // void deck on level 5 so the shops could have the base, and from the street
  // that roofline reads as an edge, not as the top of the building
  api.merge(api.extrudeGeo(api.grow(b.p, 1.012), 0.9, PODIUM - 0.9), deck, ob.cx, ob.cz);

  // 2. the two slabs, parallel to Bain Street with the full-length atrium
  //    between them. Staggered in plan — each slab is a run of offset segments
  //    with the service cores standing proud between, which is what gives the
  //    serrated silhouette and the stepped roofline rather than one flat line.
  const slabHV = ob.halfShort * 0.30;
  const SEG = 3;
  for (const side of [-1, 1]) {
    const vC = side * ob.halfShort * 0.44;
    for (let i = 0; i < SEG; i++) {
      const hu = (ob.halfLong * 0.86) / SEG;
      const u0 = ob.midU - ob.halfLong * 0.86 + hu * (2 * i + 1);
      const jog = (i % 2 ? 1 : -1) * slabHV * 0.16;      // the stagger
      const top = TOP - (i % 2 ? 0 : 2.4);               // stepped roofline
      api.merge(api.extrudeGeo(rect(u0, vC + jog, hu * 0.94, slabHV), top - PODIUM, PODIUM),
        render, ob.cx, ob.cz);
      // terracotta accent panel on the end wall of each segment, the colour
      // the complex was repainted (off-white with red panels, Aug 2023)
      api.merge(api.extrudeGeo(rect(u0, vC + jog + slabHV * side, hu * 0.42, 0.35),
        top - PODIUM - 3.0, PODIUM + 1.5), accent, ob.cx, ob.cz);

      // 3. the projecting service core between segments, and the lift-motor
      //    box standing proud of the parapet above it
      if (i < SEG - 1) {
        const uc = u0 + hu;
        api.merge(api.extrudeGeo(rect(uc, vC + jog, hu * 0.20, slabHV * 1.22), top - PODIUM, PODIUM),
          render, ob.cx, ob.cz);
        api.merge(api.extrudeGeo(rect(uc, vC + jog, hu * 0.15, slabHV * 0.8), 3.2, top),
          deck, ob.cx, ob.cz);
      }
    }
  }
}

// Tekka Centre — the market podium on the Serangoon Road / Buffalo Road corner.
// Researched 2026-07-30, research/tekka-centre.md.
//
// THREE THINGS THE GENERIC GETS WRONG, all from one cause: it reads h=10 as
// "a 10m glazed commercial block", and that is not what this is.
//   1. The ground floor is OPEN to the street for its full length. Wet market
//      (284 stalls) AND hawker centre (119 stalls) are both at L1, behind
//      nothing but columns and louvres — the widely repeated "hawker centre on
//      the first floor" is wrong. A glazed shopfront band is the wrong idiom.
//   2. It is PURPLE. #957D96 with yellow-ochre accents since Oct 2023; it was
//      orange/yellow/teal 2009-2023 and teal/peach before 2008. OSM's
//      building:colour=grey and roof:colour=cyan are BOTH wrong and the
//      research flags them do-not-use. Every source that describes this
//      building describes its colour — it is the recognisable feature.
//   3. The barrel-vault roof, the feature everyone names, sits ~13m INBOARD of
//      the Buffalo Road parapet behind flat deck and cannot be seen from the
//      pavement at all. So it is built — 14 shallow vaults, 3.8m pitch, 17m
//      run — but set in, and deliberately not the silhouette.
//
// NO HEIGHT IS PUBLISHED for any part of this complex. h=10 is OSM's own
// untraceable tag; it is used here as a height CLASS for a two-storey podium,
// not as a measurement, the same footing as lau pa sat in process.py.
//
// The four residential towers (661 = 23 storeys, 662 = 25, 663 = 21, 664 = 4,
// HDB's own figures) are NOT built here. OSM maps none of them, and inventing
// four tower footprints would put real buildings in guessed places — which is
// a worse error than leaving them out. Logged in NEXT.md instead.
function tekkaCentre(api, b) {
  const ob = orientedBox(b.p);
  const H = Math.max(8.5, Math.min(12.5, b.h || 10));
  const L1 = H * 0.54;                       // market level, open to the street

  const body = new THREE.MeshStandardMaterial({ color: 0x957d96, roughness: 0.88 });
  const ochre = new THREE.MeshStandardMaterial({ color: 0xc08a2e, roughness: 0.8 });
  const vaultM = new THREE.MeshStandardMaterial({ color: 0x4a544d, roughness: 0.7, metalness: 0.16 });
  const shade = api.mat.conc;

  // L2 — the sari and textile floor, solid, roller shutters set behind the line
  api.merge(api.extrudeGeo(b.p, H - L1, L1), body, ob.cx, ob.cz);
  // the ochre fascia band that runs the whole way round under it
  api.merge(api.extrudeGeo(api.grow(b.p, 1.015), 1.15, L1 - 0.2), ochre, ob.cx, ob.cz);
  // parapet
  api.merge(api.extrudeGeo(api.grow(b.p, 1.008), 0.9, H - 0.9), body, ob.cx, ob.cz);
  // L2 is not a blank wall. Behind the line it is a run of roller shutters
  // over the sari and textile units, with louvre panels on the long Buffalo
  // Road face -- so the level reads as a recessed dark band under a purple
  // spandrel, not as one flat mass. Recessed rather than applied, because a
  // shutter sits BEHIND its frame.
  api.merge(api.extrudeGeo(api.grow(b.p, 0.994), (H - L1) * 0.52, L1 + 1.15),
    api.mat.darkMetal, ob.cx, ob.cz);

  // L1 — NOT a wall. A shaded hall set back, the slab above carried on a
  // colonnade standing at the property line.
  api.merge(api.extrudeGeo(api.grow(b.p, 0.955), L1, 0), shade, ob.cx, ob.cz);

  // the coloured columns along the open market edge, walked round the real
  // perimeter rather than round the oriented box, because this footprint is a
  // 30-vertex polygon on a 38.7-degree grid and its box corners are not on it
  const p = b.p;
  const colGeo = [];
  for (let i = 0; i < p.length; i++) {
    const [x0, z0] = p[i], [x1, z1] = p[(i + 1) % p.length];
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    const n = Math.max(1, Math.round(len / 6.4));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const cx = x0 + dx * t, cz = z0 + dz * t;
      const g = new THREE.CylinderGeometry(0.34, 0.40, L1, 8);
      g.translate(cx, api.groundAt(cx, cz) + L1 * 0.5, cz);
      colGeo.push(g);
    }
  }
  for (const g of colGeo) api.merge(g, ochre, ob.cx, ob.cz);

  // the barrel vaults, INBOARD. 14 shallow lights at a 3.8m pitch running 17m,
  // a 52m array, axes along the long side. Shallow: rise is [EST] in the
  // research, so this is the flattest reading that still reads as a vault.
  const RISE = 1.6, PITCH = 3.8, RUN = Math.min(17, ob.halfShort * 1.3);
  const N = Math.min(14, Math.max(6, Math.floor((ob.halfLong * 1.05) / PITCH)));
  const rad = ((PITCH * PITCH) / 4 + RISE * RISE) / (2 * RISE);
  const roofY = api.groundAt(ob.cx, ob.cz) + H - 0.9;   // the deck, parapet rises 0.9 around it
  for (let i = 0; i < N; i++) {
    const u = (i - (N - 1) / 2) * PITCH;
    const cx = ob.cx + u * ob.ux, cz = ob.cz + u * ob.uz;
    const g = new THREE.CylinderGeometry(rad, rad, RUN, 9, 1, false);
    g.rotateZ(Math.PI / 2);
    g.rotateY(-ob.ang + Math.PI / 2);
    g.translate(cx, roofY - (rad - RISE), cz);
    api.merge(g, vaultM, ob.cx, ob.cz);
  }

  // the 10.5m entrance rotunda, put on the street side rather than guessed:
  // streetward() points at the nearest point of the district axis, which for
  // Little India IS Serangoon Road, and that is the end the MRT entrance and
  // the quadrilingual sign are on.
  const sw = streetward(api, ob);
  const rx = ob.cx + sw.nx * (ob.halfLong * 0.62), rz = ob.cz + sw.nz * (ob.halfLong * 0.62);
  const rg = new THREE.CylinderGeometry(5.25, 5.25, H + 1.4, 20);
  rg.translate(rx, api.groundAt(rx, rz) + (H + 1.4) * 0.5, rz);
  api.merge(rg, body, ob.cx, ob.cz);
  const rc = new THREE.CylinderGeometry(5.6, 5.6, 0.7, 20);
  rc.translate(rx, api.groundAt(rx, rz) + H + 1.4, rz);
  api.merge(rc, ochre, ob.cx, ob.cz);
}

// Mustafa Centre — the 24-hour department store on Syed Alwi Road.
// Researched 2026-07-30, research/mustafa-centre.md.
//
// THE PREMISE MOST PEOPLE BUILD FROM IS WRONG. Mustafa is described everywhere
// as a signage-covered box. The research measured it: signage occupies only the
// bottom 25-35% of the elevation, and above roughly 8m it is quiet architectural
// wall. Skinning the whole thing in signs would be the caricature, not the
// building.
//
// It is also not one building. It is TWO street blocks on the NE side of Syed
// Alwi Road split by Verdun Road, four registered addresses, four mapped
// footprints, ~279m of frontage — and it carries FOUR distinct facade languages
// in that one run:
//   1. cream stucco with teal arched windows (the 1995 block)
//   2. dark polished granite with one monumental arched teal window
//   3. a teal glass corner drum
//   4. a stainless fish-scale "wave" wing (~2017-18)
// Capturing that variety is the whole point of a recipe here. WHICH mapped
// footprint carries WHICH language is an ASSUMPTION — the research could not
// tie language to way, and it separately proved OSM way 178437069 ("171") is
// wrong on the ground. So the four languages are dealt out by footprint size,
// largest first, and that assignment is a guess stated as one.
//
// NO HEIGHT IN METRES IS PUBLISHED for any part of this building, including in
// OSM. h=17 is a height class for the B2-L4 blocks. The ONE published dimension
// of any part of it is the rooftop dome's 720 m2 of glass (Geometrica), which
// the research fitted on imagery at 26.5m diameter reconciling to a 7.3m rise —
// two independent numbers that agree, so those are the numbers used here.
// STILL NOT WIRED. Reworked 2026-07-31 -- shoelace areas, the seat fix and
// board-style signage all landed, and the remaining version renders cleanly --
// but it is not CLEARLY BETTER than the generic, and 'not clearly better' is
// not the bar. The generic is a clean banded 4-storey run with glazed
// shopfronts. Originally rendered against it and LOST, so by this
// project's own rule it stays out of the pattern table until it wins. Three
// named faults, all diagnosable, none of them reasons to throw the research
// away:
//   a) `area` below is the ORIENTED BOX area, not the polygon area, so the
//      size-rank that deals out the four facade languages is measured off the
//      wrong number and every footprint may fall into the same branch. Use a
//      shoelace area of b.p.
//   b) On the largest footprint the parapet and the dome drew but the MASS
//      under them did not, so a 26.5m dome floats over open ground. Find out
//      why before touching anything else -- a mass that silently fails to draw
//      is a bug that would not be confined to this recipe.
//   c) The sign band is one flat saturated red covering 30% of the elevation,
//      which produces exactly the signage-dominated caricature the research
//      set out to disprove. 30% was the right NUMBER and the wrong RENDERING:
//      real signage is many small differently-coloured boards, not one wall.
// The generic it lost to is a clean banded 4-storey run with glazed shopfronts
// -- unremarkable, but not wrong, and not wrong beats wrong.
// MATERIALS AT MODULE SCOPE, created once. They were created inside the recipe
// on every call, and Mustafa is called once PER FOOTPRINT -- so three separate
// "cream" objects existed for one cream wall, and the masses using them did not
// render at all while smaller geometry on the same materials did. Swapping in a
// shared api.mat.* made them appear immediately, which is the whole diagnosis.
// Every well-behaved material in this file already lives at module scope (see
// LMAT in city.js); this recipe was the exception, and it paid for it.
const MUSTAFA_MAT = {
  cream: new THREE.MeshStandardMaterial({ color: 0xd8cdb6, roughness: 0.84 }),
  teal: new THREE.MeshStandardMaterial({ color: 0x2c6d6a, roughness: 0.3, metalness: 0.24 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb9bcbd, roughness: 0.34, metalness: 0.55 }),
};
const _signMats = new Map();
function signMat(c) {
  if (!_signMats.has(c)) {
    _signMats.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
  }
  return _signMats.get(c);
}
function mustafaCentre(api, b) {
  const ob = orientedBox(b.p);
  // THE SEAT, once, for every hand-placed piece. api.groundAt() is the TERRAIN
  // and api.footingY() is where this building actually sits, and on this site
  // they differ by ~2.7m -- the mass runs 10.3..33.1 while groundAt reads 13.
  // The dome was placed off groundAt and floated clear of its own roof, which
  // is the exact trap api.footingY's comment in city.js already warns about:
  // mix the two and the podium sits on the hill while the tower sits at sea
  // level. One building, one number.
  const SEAT = api.footingY(b.p);
  const H = Math.max(14, b.h || 17);
  // SHOELACE, not the box. The box area of these four ways is 2123 / 2073 /
  // 881 / 517 against real areas of 1912 / 1757 / 743 / 358, which put TWO of
  // them in the same branch and left one facade language unbuilt.
  let area = 0;
  for (let i = 0; i < b.p.length; i++) {
    const [x0, z0] = b.p[i], [x1, z1] = b.p[(i + 1) % b.p.length];
    area += x0 * z1 - x1 * z0;
  }
  area = Math.abs(area) / 2;

  const { cream, teal, steel } = MUSTAFA_MAT;

  // Which of the four this footprint is, by size rank. The thresholds are the
  // measured areas of the four mapped ways, not round numbers.
  const lang = area > 1850 ? 0 : area > 1400 ? 1 : area > 550 ? 2 : 3;   // the four measured way areas

  // the mass. The new wing carries unit numbers up to #07, so it is taller than
  // the B2-L4 blocks; the corner drum is the short one.
  const top = lang === 0 ? H * 1.34 : lang === 3 ? H * 0.86 : H;
  const skin = lang === 0 ? steel : lang === 1 ? cream : lang === 2 ? api.mat.granite : teal;
  api.merge(api.extrudeGeo(b.p, top), skin, ob.cx, ob.cz);

  // THE SIGN BAND, and only the bottom third of it. Applied as a proud fascia
  // over the ground and first floors, which is where the research put it, and
  // stopping there.
  // THE SIGN BAND, bottom third only, and as BOARDS. One flat red wall covering
  // 30% of the elevation was the first attempt and it produced exactly the
  // signage-dominated caricature the research set out to disprove: 30% was the
  // right NUMBER and the wrong RENDERING. Real signage on this street is many
  // small differently-coloured boards at slightly different heights, so that is
  // what is built, and the wall behind them stays visible between them.
  const SIGNC = [0xb8352c, 0xc9962b, 0x2f5d86, 0x2b6b46, 0xe4e0d6, 0x8d3a6d];
  for (let i = 0; i < b.p.length; i++) {
    const [x0, z0] = b.p[i], [x1, z1] = b.p[(i + 1) % b.p.length];
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    const n = Math.max(1, Math.round(len / 5.2));
    for (let k = 0; k < n; k++) {
      // hashed off the board's own position so a rebuild deals the same colours
      const hsh = Math.abs(((x0 + k * 31) * 7919 + (z0 + i * 17) * 104729) | 0);
      if (hsh % 5 === 0) continue;                       // gaps: not a solid run
      const t0 = (k + 0.10) / n, t1 = (k + 0.90) / n;
      const q0 = [x0 + dx * t0, z0 + dz * t0], q1 = [x0 + dx * t1, z0 + dz * t1];
      const _os = outwardSign(b.p);
      const nx = _os * -dz / (len || 1), nz = _os * dx / (len || 1);
      // clear of the wall for the same reason the Gafoor bays are: a face flush
      // with the facade z-fights against it
      const o0 = 0.05, o1 = 0.36;
      const ring = [[q0[0] + nx * o0, q0[1] + nz * o0], [q1[0] + nx * o0, q1[1] + nz * o0],
                    [q1[0] + nx * o1, q1[1] + nz * o1], [q0[0] + nx * o1, q0[1] + nz * o1]];
      const bh = H * (0.16 + (hsh % 7) * 0.018);
      const by = H * (0.17 + (hsh % 4) * 0.028);
      api.merge(api.extrudeGeo(ring, bh, by),
        signMat(SIGNC[hsh % SIGNC.length]), ob.cx, ob.cz);
    }
  }
  // the parapet the quiet wall runs up to
  api.merge(api.extrudeGeo(api.grow(b.p, 1.006), 1.0, top - 1.0), api.mat.trim, ob.cx, ob.cz);

  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];

  if (lang === 0) {
    // 1. the stainless fish-scale wave wing: a run of shallow vertical bulges
    //    down the long face, which is what makes it read as a wave rather than
    //    as a flat metal box.
    // THE WAVE WING IS NOT BUILT, and this is the note for whoever tries next.
    // A loop of ~22 small bulges merged into the same tile-and-material bucket
    // as this footprint's mass makes THE MASS STOP RENDERING. Verified by
    // deleting only the loop: a 22.8m mass reappears immediately, dome seated
    // on its roof. Ruled out, each by a separate test: an exception (no
    // pageerror fires), CylinderGeometry (rebuilt with extrudeGeo, same
    // result), an attribute-length overflow in Merger.flush, and non-finite
    // coordinates (the merger now drops those per-geometry and the mass still
    // did not come back). The geometry is correct and its bounds are correct.
    // Unexplained. Do not re-add the loop without a test that shows the mass
    // survives it.
    // 2. THE DOME. 26.5m across, 7.3m rise — the only published-adjacent
    //    dimension on the whole building, so it is built to those numbers and
    //    not scaled off the footprint like everything else here.
    const R = 26.5 / 2, RISE = 7.3;
    const sr = (R * R + RISE * RISE) / (2 * RISE);
    const th = Math.asin(Math.min(1, R / sr));
    const dg = new THREE.SphereGeometry(sr, 22, 10, 0, Math.PI * 2, 0, th);
    dg.translate(ob.bx, SEAT + top - (sr - RISE), ob.bz);
    api.merge(dg, api.mat.towerGlass, ob.cx, ob.cz);
  } else if (lang === 1) {
    // the 1995 block: cream stucco pierced by tall teal arched windows
    const N = Math.max(4, Math.min(14, Math.round(ob.halfLong * 2 / 6.5)));
    for (let i = 0; i < N; i++) {
      const u = (i - (N - 1) / 2) * (ob.halfLong * 2 * 0.88 / N);
      for (const side of [-1, 1]) {
        const y0 = H * 0.50;
        api.merge(api.extrudeGeo(rect(u, side * ob.halfShort * 0.995, 1.5, 0.30),
          top - y0 - 2.0, y0), teal, ob.cx, ob.cz);
        const [ax, az] = P(u, side * ob.halfShort * 0.995);
        const ag = new THREE.CylinderGeometry(1.5, 1.5, 0.6, 12, 1, false, 0, Math.PI);
        ag.rotateX(Math.PI / 2);
        ag.rotateY(-ob.ang + (side < 0 ? Math.PI : 0));
        ag.translate(ax, SEAT + top - 2.0, az);
        api.merge(ag, teal, ob.cx, ob.cz);
      }
    }
  } else if (lang === 2) {
    // the granite block and its ONE monumental arched teal window
    const sw = streetward(api, ob);
    const v = (sw.nx * -ob.uz + sw.nz * ob.ux) > 0 ? 1 : -1;
    const w = Math.min(ob.halfLong * 0.5, 9);
    api.merge(api.extrudeGeo(rect(ob.midU, v * ob.halfShort * 0.99, w, 0.35),
      top * 0.52, H * 0.34), teal, ob.cx, ob.cz);
    const [ax, az] = P(ob.midU, v * ob.halfShort * 0.99);
    const ag = new THREE.CylinderGeometry(w, w, 0.7, 18, 1, false, 0, Math.PI);
    ag.rotateX(Math.PI / 2);
    ag.rotateY(-ob.ang + (v < 0 ? Math.PI : 0));
    ag.translate(ax, SEAT + H * 0.34 + top * 0.52, az);
    api.merge(ag, teal, ob.cx, ob.cz);
  } else {
    // the teal glass corner drum
    const R = Math.min(ob.halfShort, ob.halfLong) * 0.92;
    const dg = new THREE.CylinderGeometry(R, R, top + 1.6, 20);
    dg.translate(ob.bx, SEAT + (top + 1.6) * 0.5, ob.bz);
    api.merge(dg, teal, ob.cx, ob.cz);
  }
}

// LASALLE College of the Arts, McNally campus (RSP, 2007).
// Researched 2026-07-31, research/lasalle-simlim.md.
//
// THE GENERIC GETS THIS AS WRONG AS IT IS POSSIBLE TO GET A BUILDING: it
// extrudes the 9,285 m2 rhombus as ONE SOLID. The building is SIX separate
// faceted blocks arranged around a carved internal canyon, and that void is its
// entire identity. A slab here is not a coarse version of the building, it is
// the opposite of it.
//
// Six things the research corrected, all load-bearing for what is built below:
//   - Six blocks, not one, separated by SIX CONCAVE SCALLOPS about 3m deep at
//     measured bearings, which is what makes the outside read as faceted.
//   - Block heights are NOT uniform: tallest is the McNally/west block, at
//     least two others sit at 0.62-0.70 of it.
//   - The canyon is NOT open to the sky. A run of white tensile sails covers
//     it, and from the street that white sail floating in a black slot is the
//     hero element. Leaving it off would lose the building twice.
//   - Canyon walls CORBEL OUT over the void as they rise, so the slot narrows
//     upward, over a ground-floor colonnade of round white columns.
//   - External faces are near-vertical (0-4 degrees) with a base flare.
//   - OSM's own tags are wrong twice: building:levels=5 against a published 7,
//     and building:colour #7B7F7A against a real base nearer #3C424A.
//
// The blocks are cut as SECTORS OF THE REAL FOOTPRINT rather than as boxes laid
// over it. A box ring on a rhombus overhangs its corners and stands in the
// street; a sector is bounded by the footprint's own edge, so it cannot.
const LASALLE_MAT = {
  skin: new THREE.MeshStandardMaterial({ color: 0x3c424a, roughness: 0.72 }),
  panel: new THREE.MeshStandardMaterial({ color: 0x6b727b, roughness: 0.7 }),
  sail: new THREE.MeshStandardMaterial({ color: 0xe8e6dc, roughness: 0.62 }),
  canyon: new THREE.MeshStandardMaterial({
    color: 0x6e7a70, roughness: 0.22, metalness: 0.22,
  }),
};
function lasalle(api, b) {
  const ob = orientedBox(b.p);
  const H = Math.max(20, b.h || 26);
  const SEAT = api.footingY(b.p);
  const M = LASALLE_MAT;
  const C = [ob.bx, ob.bz];

  // where the footprint's own boundary sits along a ray from the centre
  const edgeAt = (a) => {
    const dx = Math.cos(a), dz = Math.sin(a);
    let best = null;
    for (let i = 0; i < b.p.length; i++) {
      const [x0, z0] = b.p[i], [x1, z1] = b.p[(i + 1) % b.p.length];
      const ex = x1 - x0, ez = z1 - z0;
      const den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((x0 - C[0]) * ez - (z0 - C[1]) * ex) / den;
      const u = ((x0 - C[0]) * dz - (z0 - C[1]) * dx) / den;
      if (t > 0 && u >= 0 && u <= 1 && (best === null || t < best)) best = t;
    }
    return best === null ? Math.max(ob.halfLong, ob.halfShort) : best;
  };
  const at = (a, r) => [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r];

  // six sectors, with a gap at each joint: those gaps ARE the scallops
  const N = 6, GAP = 0.085, INNER = 0.40;
  // tallest first at the McNally/west block, then the measured spread
  const HK = [1.00, 0.68, 0.90, 0.65, 0.86, 0.70];
  const base0 = Math.atan2(-1, -0.35);              // west-ish, the McNally side

  for (let i = 0; i < N; i++) {
    const a0 = base0 + (i / N) * Math.PI * 2 + GAP;
    const a1 = base0 + ((i + 1) / N) * Math.PI * 2 - GAP;
    const ring = [];
    const STEP = 10;
    for (let k = 0; k <= STEP; k++) {
      const a = a0 + (a1 - a0) * (k / STEP);
      ring.push(at(a, edgeAt(a)));
    }
    // and back along the canyon face, which is what makes it a ring segment
    for (let k = STEP; k >= 0; k--) {
      const a = a0 + (a1 - a0) * (k / STEP);
      ring.push(at(a, edgeAt(a) * INNER));
    }
    const top = H * HK[i];
    api.merge(api.extrudeGeo(ring, top), M.skin, ob.cx, ob.cz);
    // base flare: the cladding splays outward over the bottom 0.15H
    api.merge(api.extrudeGeo(api.grow(ring, 1.012), H * 0.15), M.skin, ob.cx, ob.cz);
    // The punched slots, LOOSELY BANDED TO FLOOR LEVELS, which is how the
    // research describes them. Built as thin recessed bands rather than as
    // individual openings: at any distance a rider ever sees this from, a band
    // at each floor line is what the scattered slots actually read as, and a
    // bare dark face reads as an untextured box. Six above-ground levels.
    for (let f = 1; f <= 6; f++) {
      const y = top * (f / 7) - top * 0.028;
      if (y + top * 0.05 > top) break;
      // PROUD, not inset. Inset by 0.4% they sat inside the mass and were
      // invisible -- the block stayed a bare dark box. A band has to break the
      // surface to read at all; the shadow line it throws is the detail.
      api.merge(api.extrudeGeo(api.grow(ring, 1.006), top * 0.045, y),
        f % 2 === 0 ? M.panel : M.skin, ob.cx, ob.cz);
    }

    // CANYON GLAZING, corbelling out over the void as it rises. Three stacked
    // bands, each projecting further in than the one below, which is the
    // narrowing-upward slot the research measured.
    for (let k = 1; k <= 3; k++) {
      const f = INNER - k * 0.035;
      const band = [];
      for (let q = 0; q <= STEP; q++) {
        const a = a0 + (a1 - a0) * (q / STEP);
        band.push(at(a, edgeAt(a) * f));
      }
      for (let q = STEP; q >= 0; q--) {
        const a = a0 + (a1 - a0) * (q / STEP);
        band.push(at(a, edgeAt(a) * (f + 0.030)));
      }
      const y0 = top * (0.22 + (k - 1) * 0.25);
      api.merge(api.extrudeGeo(band, top * 0.20, y0), M.canyon, ob.cx, ob.cz);
    }
  }

  // the ground-floor colonnade the canyon walls stand back behind
  for (let i = 0; i < 22; i++) {
    const a = base0 + (i / 22) * Math.PI * 2;
    const [px, pz] = at(a, edgeAt(a) * (INNER + 0.045));
    api.merge(api.extrudeGeo(
      [[px - 0.4, pz - 0.4], [px + 0.4, pz - 0.4], [px + 0.4, pz + 0.4], [px - 0.4, pz + 0.4]],
      H * 0.20), M.sail, ob.cx, ob.cz);
  }

  // THE TENSILE SAILS over the canyon: white, above the roofline, spanning the
  // slot. Flat rather than saddle-shaped -- the silhouette from the street is a
  // white plane floating in a dark slot, and that reads without the curvature.
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];
  // SIZED TO THE SLOT, NOT TO THE SITE. The first version took its span from
  // the footprint and produced 57m planks reaching past the blocks on both
  // sides, hovering clear of every roof -- which reads as scaffolding over the
  // building rather than a roof inside it. The canyon is 14-18m wide, and the
  // sails sit just BELOW the tallest parapet so the slot still reads as a slot.
  const span = Math.min(ob.halfShort, ob.halfLong) * INNER * 0.85;
  for (let i = 0; i < 5; i++) {
    const u = ob.midU + (i - 2) * (ob.halfLong * 0.22);
    api.merge(api.extrudeGeo(rect(u, ob.midV, ob.halfLong * 0.075, span), 0.45,
      H * (0.90 + (i % 2) * 0.05)), M.sail, ob.cx, ob.cz);
  }
  // the white stair core standing in the canyon
  api.merge(api.extrudeGeo(rect(ob.midU + ob.halfLong * 0.20, ob.midV, 3.0, 3.0), H * 0.92),
    M.sail, ob.cx, ob.cz);
}

// Sim Lim Square, 1 Rochor Canal Road. Researched 2026-07-31,
// research/lasalle-simlim.md.
//
// THE PREMISE I BRIEFED WAS WRONG AND THE RESEARCH SAID SO FIRST. I expected a
// signage band at the bottom with plain wall above -- the Mustafa assumption
// again. It is not that. It is a FULL-HEIGHT DEEP-BLUE MIRROR-GLASS curtain
// wall, and the banners are stuck onto the glass at whatever height a tenant
// chose. The only non-glass is the warm pale-grey concrete: corner pylons and
// an attic band.
//
// And it is not a simple block. It is a STEPPED INVERTED ZIGGURAT: every glazed
// tray cantilevers forward about 1.0-1.2m over the one below and widens by
// ~0.072 of the face width per storey, so the building leans out over its own
// pavement as it rises. That overhang is the whole silhouette.
//
// Two more corrections worth keeping: there was NO 2018 repaint (dated photos
// 2002-2025 show the same blue glass and oatmeal concrete; only the forecourt
// air intakes changed colour), and there are NO car-park decks -- the car park
// is underground at B2, so nothing on this building should read as a parking
// deck. h=20.4 is the roof of the six retail storeys and is FINE; the corner
// pylons and attic stand 1.19x higher, so capping everything at 20.4 loses
// them. That ratio is measured and scale-free, which is why it is used here
// rather than a metre figure -- no height is published for this building.
const SIMLIM_MAT = {
  glass: new THREE.MeshStandardMaterial({
    color: 0x2b4a72, roughness: 0.16, metalness: 0.42,
  }),
  conc: new THREE.MeshStandardMaterial({ color: 0xa69f94, roughness: 0.82 }),
  soffit: new THREE.MeshStandardMaterial({ color: 0x2a2c2e, roughness: 0.9 }),
};
function simLimSquare(api, b) {
  const ob = orientedBox(b.p);
  const H = Math.max(16, b.h || 20.4);
  const M = SIMLIM_MAT;
  const S = H / 6;                                   // six equal retail storeys

  // 1. plinth: the full footprint, one storey, with its projecting canopy
  api.merge(api.extrudeGeo(b.p, S), M.conc, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.022), 0.5, S - 0.5), M.conc, ob.cx, ob.cz);

  // 2-3. the glazed box, and the trays that step OUT as they rise. Each tray is
  //      a grown copy of the inset box, so the overhang follows the real plan
  //      instead of a rectangle laid over it.
  const inset = api.grow(b.p, 0.94);
  for (let k = 1; k <= 5; k++) {
    const out = 0.94 + 0.030 * (k - 1);              // ~1.0-1.2m per storey
    const ring = api.grow(b.p, out);
    const y0 = S * k;
    api.merge(api.extrudeGeo(ring, S * 0.86, y0 + S * 0.14), M.glass, ob.cx, ob.cz);
    // the dark recessed soffit under each tray, full depth of the step
    api.merge(api.extrudeGeo(ring, S * 0.14, y0), M.soffit, ob.cx, ob.cz);
  }
  api.merge(api.extrudeGeo(inset, S * 0.9, S * 0.1), M.glass, ob.cx, ob.cz);

  // 4. the attic band above the sixth storey
  api.merge(api.extrudeGeo(api.grow(b.p, 1.06), S * 0.34, H), M.conc, ob.cx, ob.cz);

  // 5. corner pylons, standing 1.19H -- the measured ratio, not a guessed metre
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];
  for (const su of [-1, 1]) {
    for (const sv of [-1, 1]) {
      // at the corners of the plan, not 90% of the way there: the attic band is
      // grown to 1.06 and swallowed them whole at the shorter offset.
      const u = ob.midU + su * ob.halfLong * 0.99, v = ob.midV + sv * ob.halfShort * 0.99;
      api.merge(api.extrudeGeo(rect(u, v, 3.2, 4.2), H * 1.19), M.conc, ob.cx, ob.cz);
    }
  }
}

// THE TWO GOPURAMS OF SERANGOON ROAD, and they are opposite shapes.
// Researched 2026-07-30/31: research/littleindia-temples.md and
// research/sri-veeramakaliamman.md.
//
// The research says this outright and it is the reason this is written as a
// parameterised tower and not as one mesh used twice: Sri Veeramakaliamman's
// gopuram is SQUAT, about 1.1:1 and overtopped by the block behind it, while
// Sri Srinivasa Perumal's is TALL, about 1:1.6, standing on a slate blue-grey
// base. Building them from one silhouette would make Little India's two most
// recognisable objects into the same object.
//
// NO HEIGHT IS PUBLISHED FOR EITHER, from any authoritative source. The "18m
// gopuram, 600 stucco deities" figure that circulates for Veeramakaliamman
// traces to a single unsourced site and was fabricated; a matching "20m, built
// 1966" for Vadapathira Kaliamman is falsely attributed to Lonely Planet, whose
// page contains neither number. Veeramakaliamman is a URA-conserved building,
// NOT a National Monument. Heights here come from the footprint and the
// measured PROPORTIONS, which is the only honest way to size them.
//
// The tier taper is measured, not invented: 1.00 / 0.875 / 0.75 / 0.625 / 0.52
// of the base width, a clean ~12.5%-per-stage step. Four receding sculpted
// talas plus one crowning barrel-vaulted shala -- that is what "five-tiered"
// means here, counted from three photographs rather than taken on trust. Five
// gold kalasams on the ridge, and two flared makara horn-scrolls that give the
// crown its "W".
const GOPURAM_MAT = {
  // pastel polychrome, softened visibly since 2017
  pale: new THREE.MeshStandardMaterial({ color: 0xe8ddd0, roughness: 0.88 }),
  rose: new THREE.MeshStandardMaterial({ color: 0xd9a9a4, roughness: 0.86 }),
  mint: new THREE.MeshStandardMaterial({ color: 0xa8c6b4, roughness: 0.86 }),
  sky: new THREE.MeshStandardMaterial({ color: 0xa9bed4, roughness: 0.86 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.5 }),
  slate: new THREE.MeshStandardMaterial({ color: 0x6b7681, roughness: 0.8 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xe2e0da, roughness: 0.9 }),
  stripe: new THREE.MeshStandardMaterial({ color: 0xa8443a, roughness: 0.85 }),
};

// One gopuram, built from measured proportions. `slender` is the height-to-base
// ratio: ~1.1 for Veeramakaliamman (squat), ~1.6 for Perumal (tall).
function gopuram(api, ob, cx, cz, baseW, baseD, y0, slender, opts) {
  const G = GOPURAM_MAT;
  const TAPER = [1.00, 0.875, 0.75, 0.625, 0.52];
  const H = baseW * slender;
  const tierH = H / 5.4;
  const band = [G.rose, G.mint, G.sky, G.rose];
  const rect = (hw, hd) => [[cx - hw, cz - hd], [cx + hw, cz - hd],
                            [cx + hw, cz + hd], [cx - hw, cz + hd]];
  let y = y0;
  for (let t = 0; t < 5; t++) {
    const f = TAPER[t];
    const hw = baseW * 0.5 * f, hd = baseD * 0.5 * f;
    // the tala itself, then the projecting cornice that separates it from the
    // next -- without the cornice a stack of five boxes reads as a stepped
    // pyramid, not as a tower of storeys
    api.merge(api.extrudeGeo(rect(hw, hd), tierH * 0.86, y), G.pale, cx, cz);
    api.merge(api.extrudeGeo(rect(hw * 1.06, hd * 1.06), tierH * 0.14, y + tierH * 0.86),
      band[t % band.length], cx, cz);
    // the central nasika opening, on talas 2-4 only, which is what the
    // photographs show
    if (t >= 1 && t <= 3) {
      api.merge(api.extrudeGeo(rect(hw * 0.20, hd * 1.10), tierH * 0.5, y + tierH * 0.2),
        band[(t + 1) % band.length], cx, cz);
    }
    y += tierH;
  }
  // the crowning barrel-vaulted shala, laid along the facade
  const cw = baseW * 0.5 * 0.52, cd = baseD * 0.5 * 0.52;
  api.merge(api.extrudeGeo(rect(cw * 1.04, cd * 0.72), tierH * 0.30, y), G.pale, cx, cz);
  // FIVE gold kalasams on the ridge -- counted, not assumed
  for (let k = 0; k < 5; k++) {
    const u = cx + (k - 2) * (cw * 0.42);
    api.merge(api.extrudeGeo([[u - 0.22, cz - 0.22], [u + 0.22, cz - 0.22],
                              [u + 0.22, cz + 0.22], [u - 0.22, cz + 0.22]],
      tierH * 0.34, y + tierH * 0.30), G.gold, cx, cz);
  }
  // the two flared makara horn-scrolls that give the crown its "W"
  for (const sx of [-1, 1]) {
    const u = cx + sx * cw * 1.08;
    api.merge(api.extrudeGeo([[u - 0.5, cz - cd * 0.5], [u + 0.5, cz - cd * 0.5],
                              [u + 0.5, cz + cd * 0.5], [u - 0.5, cz + cd * 0.5]],
      tierH * 0.55, y + tierH * 0.16), G.gold, cx, cz);
  }
  return y0 + H;
}

// Sri Veeramakaliamman, 141 Serangoon Road. SQUAT gopuram (~1.1:1), overtopped
// by the block behind it, on a CORNER site at Belilios Road with the gopuram
// directly over the street entrance and only a shallow forecourt. The boundary
// is a tiled wall with vertical RED stripes under a continuous sculpture
// parapet, standing hard on the property line. Eight main domes on the
// roofscape -- the temple's own site is the only authority for that, and it
// does not say where they sit, so two are placed on the hall behind and the
// rest are not invented.
function veeramakaliamman(api, b) {
  const ob = orientedBox(b.p);
  const G = GOPURAM_MAT;
  const H = Math.max(9, b.h || 12);
  // shoelace: this temple is mapped as TWO footprints and it has ONE gopuram.
  // Built on both, the tower appeared twice side by side.
  let area = 0;
  for (let k = 0; k < b.p.length; k++) {
    const [x0, z0] = b.p[k], [x1, z1] = b.p[(k + 1) % b.p.length];
    area += x0 * z1 - x1 * z0;
  }
  area = Math.abs(area) / 2;

  // WHICH FOOTPRINT IS THIS? The name covers two: the street compound that
  // carries the gopuram, and a tall plain rear block that OSM tags six storeys
  // and that the research says stands TALLER than the gopuram itself. Decided
  // by distance to the district axis -- which for Little India IS Serangoon
  // Road -- rather than by footprint area, because the geometry knows and the
  // area does not. The rear block is drawn plain and at its full height; only
  // the street compound gets a low hall and a tower.
  const _sw0 = streetward(api, ob);
  if (_sw0.dist >= 46) {
    api.merge(api.extrudeGeo(b.p, H), G.wall, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(api.grow(b.p, 1.008), 0.7, H - 0.7), G.pale, ob.cx, ob.cz);
    return;
  }
  // the prayer hall, DELIBERATELY LOW. The gopuram has to clear it or the
  // building loses the only thing anyone recognises it by; at 0.62H the tower
  // was buried to its shoulders and read as two stubs on a roof.
  api.merge(api.extrudeGeo(b.p, H * 0.45), G.wall, ob.cx, ob.cz);
  // the boundary wall standing hard on the property line: tiled, with the
  // vertical red stripes, under a continuous sculpture parapet
  api.merge(api.extrudeGeo(api.grow(b.p, 1.03), 2.3), G.wall, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.038), 0.5, 2.3), G.stripe, ob.cx, ob.cz);

  // THE EIGHT DOMES ARE NOT BUILT. The temple's own site is the only authority
  // that mentions them and it does not say where they sit; the research lists
  // that under "could not establish". Two guessed boxes on the roof read as two
  // guessed boxes, so they are gone rather than invented.

  const sw = streetward(api, ob);
  if (sw.dist < 46) {
    const gx = ob.bx + sw.nx * (ob.halfShort * 0.42);
    const gz = ob.bz + sw.nz * (ob.halfShort * 0.42);
    const w = Math.max(9, Math.min(ob.halfShort * 1.5, 12));
    gopuram(api, ob, gx, gz, w, w * 0.40, 0, 1.15, {});   // y0 RELATIVE to the seat
  }
}

// Sri Srinivasa Perumal, 397 Serangoon Road. TALL gopuram (~1:1.6) on a slate
// blue-grey base block, pale chalky polychrome. Five tiers, not six.
//
// Its OSM footprint is only ~218 m2 -- that is THE GOPURAM BLOCK ALONE, not the
// temple compound, which is why this recipe builds a tower on a base and does
// not try to put a hall behind it. Building a compound here would be inventing
// a footprint OSM does not have.
//
// The gopuram was ADDED to the 1966 temple, not built with it: NHB says 1975,
// NLB says 1977-79. The "20m, built 1966" line repeated everywhere is an
// uncited Wikipedia sentence.
function perumalGopuram(api, b) {
  const ob = orientedBox(b.p);
  const G = GOPURAM_MAT;
  const baseH = Math.max(3.0, (b.h || 14) * 0.24);
  api.merge(api.extrudeGeo(b.p, baseH), G.slate, ob.cx, ob.cz);
  const w = Math.min(ob.halfLong * 1.7, 13);
  gopuram(api, ob, ob.bx, ob.bz, w, Math.min(ob.halfShort * 1.7, w * 0.5),
    baseH, 1.6, {});   // RELATIVE to the seat, not SEAT + baseH
}

// Abdul Gafoor Mosque, 41 Dunlop Street. National Monument, gazetted 1979.
// Researched 2026-07-30, research/littleindia-temples.md §3.
//
// IT IS NOT YELLOW. Almost every photograph online, and every travel article,
// shows the yellow-and-green scheme from the 2003 restoration. It was repainted
// WHITE AND GREEN in 2021 and October 2025 photographs confirm white walls with
// sage-green trim. The research calls this the single highest-value correction
// in its section, and it is the kind of thing that is wrong everywhere at once
// because everyone is looking at the same old photographs.
//
// It is also NOT on Serangoon Road: 310m off it, ~250m in along Dunlop Street,
// hemmed in by shophouses and invisible from the main road. It is a Dunlop
// Street event. Nothing here is sized for a long view.
//
// AND IT IS NOT A GREAT DOMED MOSQUE. There is ONE dome and no free-standing
// minaret. The dome is a compact octagonal LANTERN -- a drum roughly as tall as
// it is wide, pierced by eight coloured-glass windows, capped by an ogee onion
// in pale sage and a crescent-and-star finial. The research is explicit that
// this must never be modelled as a Sultan Mosque-type golden hemisphere. What
// reads as minarets are four turrets at the roof corners, a ring of small ones
// round the drum base, and a continuous line of slim pinnacles along the
// parapet -- and EVERY one of them sits BELOW the dome. The crescent is the
// highest point of the building, full stop.
//
// A NOTE ON THE TWO CONTRADICTORY HEIGHT TAGS. OSM carries height=20 and
// building:levels=1 on the same feature, which cannot both be right for a
// two-storey mosque. Built as specified here -- a 12m two-storey mass with a
// drum and onion above it -- the crescent lands near 21m. So the 20 was
// probably always a measurement TO THE DOME, and the mass was never 20m tall.
// That reconciles both tags without either being junk.
const GAFOOR_MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.86 }),
  sage: new THREE.MeshStandardMaterial({ color: 0x8fa383, roughness: 0.72 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x3f6d5e, roughness: 0.28, metalness: 0.3,
  }),
};
function abdulGafoor(api, b) {
  const ob = orientedBox(b.p);
  const G = GAFOOR_MAT;
  const H = Math.max(9, b.h || 12);          // the TWO-STOREY mass, not the dome

  // the mass, and the sage parapet band it runs up to
  api.merge(api.extrudeGeo(b.p, H), G.white, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.012), 0.8, H - 0.8), G.sage, ob.cx, ob.cz);
  // the boundary wall, low, with its own line of piers
  api.merge(api.extrudeGeo(api.grow(b.p, 1.055), 2.1), G.white, ob.cx, ob.cz);

  // THE CONTINUOUS LINE OF PINNACLES along the parapet: a slim white shaft with
  // a miniature ogee and a crescent. Walked round the real perimeter, because
  // this footprint is 39.8 x 30.2m and its box corners are not on it.
  for (let i = 0; i < b.p.length; i++) {
    const [x0, z0] = b.p[i], [x1, z1] = b.p[(i + 1) % b.p.length];
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    // A LINE, NOT A PICKET FENCE. At 4.2m spacing this produced ~33 shafts
    // round a 140m perimeter and the roof read as fencing. Slimmer and much
    // further apart: the eye wants a rhythm along the parapet, not a crowd.
    const n = Math.max(1, Math.round(len / 8.0));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const px = x0 + dx * t, pz = z0 + dz * t;
      const sq = (r) => [[px - r, pz - r], [px + r, pz - r], [px + r, pz + r], [px - r, pz + r]];
      api.merge(api.extrudeGeo(sq(0.22), 1.5, H), G.white, ob.cx, ob.cz);
      api.merge(api.extrudeGeo(sq(0.30), 0.45, H + 1.5), G.sage, ob.cx, ob.cz);
    }
  }

  // TWO STOREYS OF OPENINGS. A blank white box with a dome on it is a mosque
  // only in outline; the arcade is what makes it read at the 30m this building
  // is ever seen from, hemmed in as it is by Dunlop Street shophouses.
  for (let i = 0; i < b.p.length; i++) {
    const [x0, z0] = b.p[i], [x1, z1] = b.p[(i + 1) % b.p.length];
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    const n = Math.max(1, Math.round(len / 3.6));
    const _os = outwardSign(b.p);
    const nx = _os * -dz / (len || 1), nz = _os * dx / (len || 1);
    for (let k = 0; k < n; k++) {
      const t0 = (k + 0.26) / n, t1 = (k + 0.74) / n;
      const q0 = [x0 + dx * t0, z0 + dz * t0], q1 = [x0 + dx * t1, z0 + dz * t1];
      // CLEAR OF THE WALL, not flush with it. Built from the wall plane
      // outward, the bay's inner face is exactly coplanar with the facade and
      // the two z-fight -- which renders as a moire streak down every opening
      // and looks like a texture bug rather than a depth one.
      const o0 = 0.04, o1 = 0.26;
      const bay = [[q0[0] + nx * o0, q0[1] + nz * o0], [q1[0] + nx * o0, q1[1] + nz * o0],
                   [q1[0] + nx * o1, q1[1] + nz * o1], [q0[0] + nx * o1, q0[1] + nz * o1]];
      for (const f of [0, 1]) {
        api.merge(api.extrudeGeo(bay, H * 0.30, H * (0.10 + f * 0.45)), G.glass, ob.cx, ob.cz);
        // the sage arch head over each opening
        api.merge(api.extrudeGeo(bay, H * 0.06, H * (0.40 + f * 0.45)), G.sage, ob.cx, ob.cz);
      }
    }
  }

  // THE LANTERN. Drum roughly as tall as it is wide, eight coloured-glass
  // windows, ring of small turrets at its base.
  const R = Math.min(ob.halfShort * 0.42, 3.0);
  const DRUM = R * 1.9;
  const oct = (r, y0, h, mat) => {
    const ring = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      ring.push([ob.bx + Math.cos(a) * r, ob.bz + Math.sin(a) * r]);
    }
    api.merge(api.extrudeGeo(ring, h, y0), mat, ob.cx, ob.cz);
  };
  oct(R, H, DRUM, G.white);
  oct(R * 1.02, H + DRUM * 0.34, DRUM * 0.26, G.glass);      // the eight windows
  for (let k = 0; k < 8; k++) {                              // turrets at its base
    const a = (k / 8) * Math.PI * 2;
    const tx = ob.bx + Math.cos(a) * R * 1.24, tz = ob.bz + Math.sin(a) * R * 1.24;
    api.merge(api.extrudeGeo(
      [[tx - 0.3, tz - 0.3], [tx + 0.3, tz - 0.3], [tx + 0.3, tz + 0.3], [tx - 0.3, tz + 0.3]],
      DRUM * 0.55, H), G.white, ob.cx, ob.cz);
  }
  // the ogee onion, in pale sage: a sphere pinched at the top rather than a
  // hemisphere, which is the whole difference between this and a golden dome
  const og = new THREE.SphereGeometry(R * 1.06, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62);
  og.scale(1, 1.15, 1);
  og.translate(ob.bx, api.footingY(b.p) + H + DRUM, ob.bz);
  api.merge(og, G.sage, ob.cx, ob.cz);
  // the crescent-and-star finial: the highest point of the building
  api.merge(api.extrudeGeo(
    [[ob.bx - 0.16, ob.bz - 0.16], [ob.bx + 0.16, ob.bz - 0.16],
     [ob.bx + 0.16, ob.bz + 0.16], [ob.bx - 0.16, ob.bz + 0.16]],
    R * 1.3, H + DRUM + R * 0.7), G.sage, ob.cx, ob.cz);

  // four minaret turrets at the roof corners, ALL BELOW THE DOME
  for (const su of [-1, 1]) {
    for (const sv of [-1, 1]) {
      const u = ob.midU + su * ob.halfLong * 0.86, v = ob.midV + sv * ob.halfShort * 0.86;
      const cx2 = ob.cx + u * ob.ux - v * ob.uz, cz2 = ob.cz + u * ob.uz + v * ob.ux;
      const sq = (r) => [[cx2 - r, cz2 - r], [cx2 + r, cz2 - r],
                         [cx2 + r, cz2 + r], [cx2 - r, cz2 + r]];
      api.merge(api.extrudeGeo(sq(0.55), DRUM * 0.80, H), G.white, ob.cx, ob.cz);
      api.merge(api.extrudeGeo(sq(0.68), 0.8, H + DRUM * 0.80), G.sage, ob.cx, ob.cz);
    }
  }
}

// Masjid Angullia, 265 Serangoon Road.
// Researched 2026-07-30, research/littleindia-temples.md §4.
//
// THE ADDRESS IS RIGHT AND THE BUILDING IS WRONG in every brief I have seen.
// The mosque a rider passes today is NOT a historic mosque: the 1970 building
// was DEMOLISHED and a new four-storey block put up 2018-2020 under the Mosque
// Upgrading Programme. Only the 1890s gatehouse is historic.
//
// So: NO street-visible dome. What is sometimes called a "lattice steel dome"
// is a roof lantern, not a dome on the skyline. ONE square clock-tower minaret.
// And it is DUSTY TERRACOTTA-ROSE, not the beige of MUIS's own render. Model a
// white domed mosque here and you are wrong by a whole building -- the
// research's words, and it is the reason this recipe exists at all.
const ANGULLIA_MAT = {
  // dusty terracotta-ROSE, not brick. 0xb08274 rendered as dark brick red.
  rose: new THREE.MeshStandardMaterial({ color: 0xc4988c, roughness: 0.86 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xe6ddd4, roughness: 0.8 }),
  lantern: new THREE.MeshStandardMaterial({
    color: 0x8d9aa2, roughness: 0.4, metalness: 0.45,
  }),
};
function angullia(api, b) {
  const ob = orientedBox(b.p);
  const A = ANGULLIA_MAT;
  const H = Math.max(13, b.h || 20);
  const FL = H / 4;                                  // four storeys

  api.merge(api.extrudeGeo(b.p, H), A.rose, ob.cx, ob.cz);
  // pale floor bands: a 2020 block reads by its horizontals, not by ornament
  for (let f = 1; f < 4; f++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.010), 0.45, FL * f), A.trim, ob.cx, ob.cz);
  }
  // a recessed glazing strip in each storey, under its band
  for (let f = 0; f < 4; f++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 0.995), FL * 0.42, FL * f + FL * 0.34),
      A.lantern, ob.cx, ob.cz);
  }
  api.merge(api.extrudeGeo(api.grow(b.p, 1.014), 0.9, H - 0.9), A.trim, ob.cx, ob.cz);

  // the ROOF LANTERN -- low, set in, and emphatically not a dome on the skyline
  const R = Math.min(ob.halfShort * 0.34, 3.4);
  api.merge(api.extrudeGeo(
    [[ob.bx - R, ob.bz - R], [ob.bx + R, ob.bz - R],
     [ob.bx + R, ob.bz + R], [ob.bx - R, ob.bz + R]], 1.9, H), A.lantern, ob.cx, ob.cz);

  // THE ONE SQUARE CLOCK-TOWER MINARET, on the street corner
  const sw = streetward(api, ob);
  const mx = ob.bx + sw.nx * (ob.halfShort * 0.80) + (-sw.nz) * (ob.halfLong * 0.62);
  const mz = ob.bz + sw.nz * (ob.halfShort * 0.80) + (sw.nx) * (ob.halfLong * 0.62);
  const sq = (r) => [[mx - r, mz - r], [mx + r, mz - r], [mx + r, mz + r], [mx - r, mz + r]];
  api.merge(api.extrudeGeo(sq(1.7), H * 1.42), A.rose, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(sq(1.9), 1.0, H * 1.42), A.trim, ob.cx, ob.cz);
  // the clock faces, near the top of the shaft on all four sides
  api.merge(api.extrudeGeo(sq(1.76), 1.5, H * 1.42 - 3.4), A.trim, ob.cx, ob.cz);
}

// The Warehouse Hotel, 320 / 326 / 332 Havelock Road — three conserved godowns.
// Researched 2026-07-30, research/robertson-rivervalley.md §1.
//
// TWO FALSE PREMISES CORRECTED BEFORE ANY GEOMETRY. It is NOT on Robertson
// Quay: Wikipedia says it was gazetted in the Robertson Quay conservation area
// and it does not appear in URA's list for it. Havelock Road, SOUTH bank. And
// it is not one building: THREE identical two-storey volumes shoulder to
// shoulder, each with its own triangular pediment gable facing the river, each
// pediment carrying a circular oculus.
//
// THE COLOUR IS THE POINT OF THIS WHOLE DISTRICT. The research calls it the
// single biggest colour error available here: there are TWO committed schemes
// on this reach of river and they are opposites. This group, on Havelock Road,
// is FLAT WHITE with pale shutters. The Watermark / Rodyk Street row on the
// other bank is NEAR-BLACK with vermilion joinery. Painting the whole godown
// family white is exactly why the district reads wrong, so this recipe paints
// the one that IS white and says so, rather than generalising.
//
// A godown is not a shophouse. What makes it read as a godown is the JACKROOF,
// a raised ventilated ridge running the length of the pitch, plus a deep plan
// and a heavy cornice. Facades are divided by flat pilaster strips into three
// bays per unit with paired shuttered windows on both floors.
const GODOWN_MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xeae7df, roughness: 0.88 }),
  shutter: new THREE.MeshStandardMaterial({ color: 0xb9bcb4, roughness: 0.84 }),
  tile: new THREE.MeshStandardMaterial({ color: 0x8a5b46, roughness: 0.86 }),
  granite: new THREE.MeshStandardMaterial({ color: 0x7d7b75, roughness: 0.95 }),
};
function warehouseGodowns(api, b) {
  const ob = orientedBox(b.p);
  const W = GODOWN_MAT;
  const H = Math.max(7, b.h || 9.5);
  const UNITS = 3;

  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];
  const hu = (ob.halfLong * 0.98) / UNITS;

  for (let i = 0; i < UNITS; i++) {
    const u0 = ob.midU + (i - (UNITS - 1) / 2) * (hu * 2);
    // the two-storey volume
    api.merge(api.extrudeGeo(rect(u0, ob.midV, hu * 0.97, ob.halfShort * 0.98), H),
      W.white, ob.cx, ob.cz);
    // the heavy cornice between the storeys, and the pilaster strips that cut
    // each unit into three bays
    api.merge(api.extrudeGeo(rect(u0, ob.midV, hu * 1.00, ob.halfShort * 1.01), 0.45, H * 0.50),
      W.white, ob.cx, ob.cz);
    for (let p = -1; p <= 1; p++) {
      api.merge(api.extrudeGeo(rect(u0 + p * hu * 0.62, ob.midV, hu * 0.055,
        ob.halfShort * 1.01), H), W.white, ob.cx, ob.cz);
    }
    // paired shuttered windows, both floors, on the gable (river) end
    const _os = outwardSign(b.p);
    for (const f of [0, 1]) {
      for (const s2 of [-1, 1]) {
        api.merge(api.extrudeGeo(
          rect(u0 + s2 * hu * 0.30, ob.midV + ob.halfShort * 1.005, hu * 0.17, 0.16),
          H * 0.30, H * (0.10 + f * 0.48)), W.shutter, ob.cx, ob.cz);
      }
    }
    // THE PITCHED ROOF, gable end facing the river. Three radial segments is
    // the idiom the shophouse roof already uses here, and its radius sets its
    // height as well as its span, so it is capped for the same reason.
    // THE RIDGE RUNS DOWN THE DEPTH, not across the frontage. A godown is a deep
    // plan -- 26 to 46m deep for a 12 to 15m frontage -- with the GABLE facing
    // the river. Run along the frontage instead and each roof becomes a short
    // wedge stranded in the middle of a flat roof, which is what it looked
    // like: three brown trenches rather than three pitched roofs.
    // RADIUS SETS THE HEIGHT; A SCALE SETS THE SPAN. A three-sided cylinder's
    // radius controls both at once -- the trap the shophouse roof above is
    // already commented for -- so sizing the radius to cover a 15m unit gives a
    // 12m-tall roof on a 9.5m building, and capping the radius instead leaves
    // white flat roof showing either side of the ridge. Pick the radius for the
    // pitch you want, then scale the SECTION out to the full width.
    const rad = 3.0;                                   // ~4.5m to the ridge
    const rg = new THREE.CylinderGeometry(rad, rad, ob.halfShort * 2 * 0.98, 3, 1, false);
    rg.rotateZ(Math.PI / 2);
    rg.scale(1, 1, (hu * 1.02) / (rad * 0.866));       // section is in Y-Z here
    rg.rotateY(-ob.ang + Math.PI / 2);
    const [rx, rz] = P(u0, ob.midV);
    rg.translate(rx, api.footingY(b.p) + H + rad * 0.5, rz);
    api.merge(rg, W.tile, ob.cx, ob.cz);
    // THE JACKROOF: the raised ventilated ridge that makes it a godown
    api.merge(api.extrudeGeo(rect(u0, ob.midV, hu * 0.16, ob.halfShort * 0.86),
      0.85, H + rad * 1.15), W.white, ob.cx, ob.cz);
    // the triangular pediment gable, with its circular oculus
    api.merge(api.extrudeGeo(rect(u0, ob.midV + ob.halfShort * 0.99, hu * 0.90, 0.22),
      rad * 1.05, H), W.white, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(rect(u0, ob.midV + ob.halfShort * 1.02, hu * 0.13, 0.13),
      rad * 0.34, H + rad * 0.30), W.shutter, ob.cx, ob.cz);
  }
  // the rough grey granite rubble river wall in front of the group
  api.merge(api.extrudeGeo(rect(ob.midU, ob.midV + ob.halfShort * 1.30,
    ob.halfLong * 1.02, 0.5), 1.1), W.granite, ob.cx, ob.cz);
}

// Golden Mile Complex, 5001 Beach Road (1973, Design Partnership) — the
// terraced "Batman building". Authored, not mapped: see data/authored.json.
// Researched 2026-07-31, research/authored-footprints.md.
//
// IT WAS MISSING FROM THE WORLD FOR TWO INDEPENDENT REASONS, and either alone
// would have hidden it. OSM way 47126585 exists but carries construction=yes
// and NO building tag, so the fetch's way["building"] query never sees it; and
// it sits east of the bugis bbox edge anyway. The most famous building on Beach
// Road was simply absent.
//
// It is NOT demolished. URA gazetted it for conservation in Oct 2021 and that
// was the condition of the 2022 en-bloc; it stands, gutted and hoarded, being
// restored, with a 45-storey tower going up alongside for 2029. That tower is
// NOT built here -- nothing about its footprint is measured.
//
// THE SECTION IS THE BUILDING. A flat slab of the right size in the right place
// is still the wrong building: what everyone recognises is the stepped terrace
// stack facing SE toward Nicoll Highway, against a sheer flat back wall on the
// Beach Road side. Which of the two long faces is the front cannot be recovered
// from a rectangle, so it is carried on the record as `ter` -- measured from a
// perpendicular luminance profile, not assumed.
//
// The height is built at the architect's published 89m and the doubt is on the
// record: 89 over 16 storeys is 5.56m a floor, which no residential-over-retail
// building has. See data/authored.json h_src. For a 178 x 64m slab a height
// error reads far less badly than a wrong orientation, which is why the
// orientation got the measurement effort.
const GMC_MAT = {
  wall: new THREE.MeshStandardMaterial({ color: 0xbdb7a8, roughness: 0.88 }),
  back: new THREE.MeshStandardMaterial({ color: 0x9b968a, roughness: 0.9 }),
  deck: new THREE.MeshStandardMaterial({ color: 0xd6d1c4, roughness: 0.85 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x53707a, roughness: 0.26, metalness: 0.3,
  }),
};
function goldenMileComplex(api, b) {
  const ob = orientedBox(b.p);
  const M = GMC_MAT;
  const H = Math.max(40, b.h || 89);
  const t = b.ter || {};
  const LV = Math.max(6, t.levels || 16);
  const FROM = Math.max(1, t.from || 4);
  const STEP = t.step || 3.0;
  const FL = H / LV;

  // the measured SE-facing normal, or the box's own short axis if a future
  // entry omits it
  let nx = t.nx, nz = t.nz;
  if (nx === undefined) { nx = -ob.uz; nz = ob.ux; }

  // Work in the slab's own frame: `u` along the 178m length, `v` across the
  // depth, with v = 0 at the BACK face and v growing toward the terraces.
  const backX = ob.bx - nx * ob.halfShort, backZ = ob.bz - nz * ob.halfShort;
  const ux = -nz, uz = nx;
  const D = ob.halfShort * 2;
  const HU = ob.halfLong;
  const face = (v0, v1, y0, h, mat) => {
    const ring = [
      [backX + ux * -HU + nx * v0, backZ + uz * -HU + nz * v0],
      [backX + ux * HU + nx * v0, backZ + uz * HU + nz * v0],
      [backX + ux * HU + nx * v1, backZ + uz * HU + nz * v1],
      [backX + ux * -HU + nx * v1, backZ + uz * -HU + nz * v1],
    ];
    api.merge(api.extrudeGeo(ring, h, y0), mat, ob.cx, ob.cz);
  };

  // 1. the podium: full depth, straight up, the retail levels everyone walks
  face(0, D, 0, FL * FROM, M.wall);
  // 2. THE TERRACE STACK. Each level above the podium is one step shallower, so
  //    the SE face rakes back and the roofline of every floor is an open deck.
  for (let i = FROM; i < LV; i++) {
    const cut = Math.min(D * 0.62, (i - FROM + 1) * STEP);
    const y = FL * i;
    face(0, D - cut, y, FL, M.wall);
    // the deck edge of the terrace below, projecting into the open air
    face(D - cut, D - cut + Math.min(STEP, 2.4), y, 0.5, M.deck);
    // glazing set back under the terrace above
    face(D - cut - 1.2, D - cut - 0.2, y + FL * 0.15, FL * 0.62, M.glass);
  }
  // 3. THE BACK WALL: sheer, flat, full height, no terracing at all. It is what
  //    Beach Road sees and it is the reason the building reads as a wedge.
  face(-0.6, 0.6, 0, H, M.back);
  // 4. the two-storey maisonette crown, so the top tread reads double height
  face(0, D - Math.min(D * 0.62, (LV - FROM) * STEP), H, FL * 0.55, M.deck);
}

// A SITE, NOT A BUILDING. Drawn for footprints OSM tags building=construction.
//
// 72 of them across these districts, none carrying a height, so every one was
// falling through to a type default and standing as a finished block. IR2 and
// NS Square are the worst: 32,610 and 28,118 m2 of Marina Bay drawn as 18m
// slabs where the real sites are hoarding, piling rigs and cranes. A rider
// crossing Bayfront Avenue was passing two invented buildings.
//
// What this draws is deliberately modest: hoarding at the property line, an
// open interior, and for anything big enough to warrant one, a tower crane and
// a partial frame. The point is to stop asserting a building that is not there,
// not to guess what will eventually stand.
const SITE_MAT = {
  hoard: new THREE.MeshStandardMaterial({ color: 0x7d94a6, roughness: 0.85 }),
  post: new THREE.MeshStandardMaterial({ color: 0x8a8f92, roughness: 0.8 }),
  dirt: new THREE.MeshStandardMaterial({ color: 0x9d8f76, roughness: 0.98 }),
  frame: new THREE.MeshStandardMaterial({ color: 0xa6a29a, roughness: 0.9 }),
  crane: new THREE.MeshStandardMaterial({ color: 0xd8b13a, roughness: 0.6, metalness: 0.3 }),
};
export function constructionSite(api, b) {
  const ob = orientedBox(b.p);
  const M = SITE_MAT;
  const area = b.a || (ob.halfLong * ob.halfShort * 4);

  // A RING, NOT A SLAB. The first version extruded the whole footprint to 3m
  // and capped it with dirt, which buried a road: P7 ("road markings under the
  // tarmac") went from 0 to 1 in River Valley the moment sites were switched
  // on. A construction footprint is not guaranteed clear of a carriageway the
  // way a building's is, so this walks the perimeter and SKIPS any panel whose
  // midpoint stands in the road, and never covers the ground between.
  const _os = outwardSign(b.p);
  for (let i = 0; i < b.p.length; i++) {
    const [x0, z0] = b.p[i], [x1, z1] = b.p[(i + 1) % b.p.length];
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    if (len < 0.4) continue;
    const n = Math.max(1, Math.round(len / 6.0));
    const nx = _os * -dz / len, nz = _os * dx / len;
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n, tm = (k + 0.5) / n;
      if (onCarriageway(x0 + dx * tm, z0 + dz * tm, 0.4)) continue;
      const q0 = [x0 + dx * t0, z0 + dz * t0], q1 = [x0 + dx * t1, z0 + dz * t1];
      const o = 0.3;
      const panel = [[q0[0], q0[1]], [q1[0], q1[1]],
                     [q1[0] + nx * o, q1[1] + nz * o], [q0[0] + nx * o, q0[1] + nz * o]];
      api.merge(api.extrudeGeo(panel, 3.0), M.hoard, ob.cx, ob.cz);
      api.merge(api.extrudeGeo(panel, 0.26, 3.0), M.post, ob.cx, ob.cz);
    }
  }

  if (area < 900) return;                 // a small site is a hoarded gap, no more

  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];

  // NOTHING BIG GOES DOWN WITHOUT CHECKING THE ROAD FIRST. A construction
  // footprint is not pushed clear of carriageways the way a building's is --
  // these polygons are whole development plots and they routinely span a
  // street. The first version dropped a 141 x 128m frame across Raffles Avenue
  // and P1b caught it. Same rule slab() uses: if the piece stands in a road, it
  // is not built.
  const clearRect = (u0, v0, hu, hv) => {
    for (const [du, dv] of [[0, 0], [-1, -1], [1, -1], [1, 1], [-1, 1],
                            [-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const [px, pz] = P(u0 + du * hu, v0 + dv * hv);
      if (onCarriageway(px, pz, 0.5)) return false;
    }
    return true;
  };

  // a partial concrete frame: a few floor plates on part of the site, which is
  // what a site this size looks like part-way up
  const FL = 3.4;
  const n = Math.min(7, Math.max(2, Math.round(Math.sqrt(area) / 22)));
  const fu = ob.halfLong * 0.36, fv = ob.halfShort * 0.40;
  const fU = ob.midU - ob.halfLong * 0.22;
  if (clearRect(fU, ob.midV, fu, fv)) {
  for (let i = 0; i < n; i++) {
    api.merge(api.extrudeGeo(rect(ob.midU - ob.halfLong * 0.22, ob.midV, fu, fv), 0.35, FL * i),
      M.frame, ob.cx, ob.cz);
  }
  for (const su of [-1, 1]) {
    for (const sv of [-1, 1]) {
      api.merge(api.extrudeGeo(rect(fU + su * fu * 0.88,
        ob.midV + sv * fv * 0.88, 0.5, 0.5), FL * n), M.frame, ob.cx, ob.cz);
    }
  }
  }

  // THE TOWER CRANE. One mast, one jib, one counter-jib -- the silhouette that
  // says "site" from three streets away.
  const cu = ob.midU + ob.halfLong * 0.30, cv = ob.midV + ob.halfShort * 0.18;
  if (!clearRect(cu, cv, 1.6, 1.6)) return;
  const MAST = Math.min(78, 26 + Math.sqrt(area) * 0.42);
  api.merge(api.extrudeGeo(rect(cu, cv, 1.1, 1.1), MAST), M.crane, ob.cx, ob.cz);
  const JIB = Math.min(58, ob.halfLong * 0.95);
  api.merge(api.extrudeGeo(rect(cu + JIB * 0.42, cv, JIB * 0.5, 0.7), 1.3, MAST),
    M.crane, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(rect(cu - JIB * 0.16, cv, JIB * 0.18, 0.7), 1.1, MAST - 0.2),
    M.crane, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(rect(cu, cv, 1.6, 1.6), 2.2, MAST + 1.3), M.crane, ob.cx, ob.cz);
}

// Bugis Junction, 200 Victoria Street — the glazed shophouse streets.
// Researched 2026-07-31, research/bugis-brasbasah-landmarks.md.
//
// This building was wearing Bugis+'s crystal-mesh lattice, which belongs to a
// different building on the other side of Victoria Street. What is actually
// here is the opposite idea: three restored SHOPHOUSE STREETS roofed over in
// glass, air-conditioned, with a domed rotunda where they cross.
//
// FOUR STREETS, NOT THREE — Malay, Hylam, Bugis and Malabar, all tagged in OSM
// as building passages, and their measured widths differ street by street
// (Hylam 13.1m, Malay 9.5m, Malabar 9.2m) rather than being one module
// repeated. The vaults here are sized from those numbers.
const BJ_MAT = {
  shop: new THREE.MeshStandardMaterial({ color: 0xe4d9c4, roughness: 0.88 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.8 }),
  vault: new THREE.MeshStandardMaterial({
    color: 0xa9c3d2, roughness: 0.16, metalness: 0.24,
  }),
  rib: new THREE.MeshStandardMaterial({ color: 0x8d9298, roughness: 0.6, metalness: 0.35 }),
};
function bugisJunction(api, b) {
  const ob = orientedBox(b.p);
  const M = BJ_MAT;
  const H = Math.max(9, b.h || 10.2);

  // the shophouse fabric: a low mass with a strong cornice, because that is
  // what the glass sits ON -- the streets are cut through a block of restored
  // two- and three-storey shophouses, not through a modern mall floor plate
  api.merge(api.extrudeGeo(b.p, H), M.shop, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.012), 0.7, H * 0.52), M.trim, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.008), 0.9, H - 0.9), M.trim, ob.cx, ob.cz);

  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];
  const SEAT = api.footingY(b.p);

  // THE GLAZED STREETS. Measured widths, not one repeated module.
  const WID = [13.1, 9.5, 9.2];
  const vs = [-0.46, 0.02, 0.48];
  for (let i = 0; i < 3; i++) {
    const hw = Math.min(WID[i], ob.halfShort * 0.5) / 2;
    const v = ob.midV + vs[i] * ob.halfShort;
    // A FULL CYLINDER, SUNK TO ITS AXIS. A half-cylinder cut with thetaStart
    // puts the open side wherever the rotations happen to leave it, and here
    // that was face down -- the vaults were built underneath the roof and
    // nothing showed but the ribs. Burying the axis at roof level shows exactly
    // the top half and needs no angle bookkeeping. Same idiom as the godown
    // roofs, which work.
    const rad = hw * 1.05;
    // LENGTH MATTERS, and not for a reason I can explain. A long merged cylinder
    // does not render AT ALL: created, merged, no exception, nothing drawn --
    // the same silent failure as Mustafa Centre's wave bulges, which is still
    // unexplained there too. MEASURED HERE by bisection: 34m draws, 45m draws,
    // 60m draws, 92m does not, 141m does not. So the threshold sits somewhere
    // between 60 and 92 and 60 is used with room to spare.
    //
    // The cap is also just correct on its own terms, which is why it is not a
    // workaround: a covered street runs the length of its own block, not the
    // diagonal of a bounding box that happens to span the building next door.
    // If a future recipe needs a long merged tube, split it into segments and
    // expect this.
    const VL = Math.min(ob.halfLong * 1.7, 60);
    const g = new THREE.CylinderGeometry(rad, rad, VL, 14, 1, false);
    g.rotateZ(Math.PI / 2);
    g.rotateY(-ob.ang);
    const [gx, gz] = P(ob.midU, v);
    g.translate(gx, SEAT + H, gz);
    api.merge(g, M.vault, ob.cx, ob.cz);
    // NO RIBS. Two attempts: slabs standing beside the vault read as walls, and
    // thin cylinders read as dark discs because a cylinder has END CAPS and at
    // this scale the cap is most of what you see. The vault alone reads as a
    // glazed street; the ribs only added grey.
  }

  // THE DOMED ROTUNDA HUB where the streets cross
  const R = Math.min(ob.halfShort * 0.30, 9.0);
  const dg = new THREE.SphereGeometry(R, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  dg.scale(1, 0.78, 1);
  dg.translate(ob.bx, SEAT + H + 0.6, ob.bz);
  api.merge(dg, M.vault, ob.cx, ob.cz);
  const dr = new THREE.CylinderGeometry(R * 1.04, R * 1.04, 1.0, 18);
  dr.translate(ob.bx, SEAT + H + 0.4, ob.bz);
  api.merge(dr, M.rib, ob.cx, ob.cz);
}

// Raffles Hotel, 1 Beach Road. National Monument.
// Researched 2026-07-31: research/bugis-brasbasah-landmarks.md (elevation and
// paint) and research/raffles-parkview.md (geometry and OSM identification).
//
// IT WAS INVISIBLE TO EVERY RECIPE UNTIL TODAY. OSM maps it as a multipolygon
// RELATION carrying wikidata=Q1538837 and no `name`, so it stood here as an
// unnamed 3,742 m2 block; the only OSM nodes actually called "Raffles Hotel"
// nearby are BUS STOPS. Naming it (see NAMED_BY_WIKIDATA in process.py) then
// handed it to the generic colonialHotel recipe, whose roof cylinders sized
// themselves off a 125m-deep footprint and floated two enormous clay tubes past
// both ends of the building. This exists because BOTH of those were wrong.
//
// WHAT THE RESEARCH CORRECTED:
//   - The famous portico is a 1989-91 REPRODUCTION; the 1913 original was
//     dismantled in 1920. Build it, but it is not the ancient part.
//   - The Beach Road elevation is the 44.6m SE END, not the long side. The
//     125m dimension is DEPTH. Getting this backwards puts the hotel's face on
//     the wrong street.
//   - Beach Road's upper verandahs are GLAZED loggias. The open,
//     green-balustered verandahs face the COURTYARDS.
//   - No cupolas and no turrets. The roof is mixed hipped plus flat planted
//     terraces.
//   - Paint is KEIM Royalan white, scaffolding off June 2019; dark green is on
//     the BALUSTRADES and the shutters are pale cream -- not the reverse.
//
// The roof is built as stepped inward extrusions rather than as cylinders. A
// three-sided cylinder's radius sets its height AND its span, which is what
// produced the floating tubes, and this footprint is far too irregular to take
// one safely.
const RAFFLES_MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.86 }),
  green: new THREE.MeshStandardMaterial({ color: 0x2f4c3a, roughness: 0.78 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xe6ddc6, roughness: 0.84 }),
  tile: new THREE.MeshStandardMaterial({ color: 0x8f5340, roughness: 0.9 }),
};
function rafflesHotel(api, b) {
  const ob = orientedBox(b.p);
  const M = RAFFLES_MAT;
  const H = Math.max(12, b.h || 20);
  const WALL = H * 0.74;                 // three storeys under a deep roof
  const FL = WALL / 3;

  api.merge(api.extrudeGeo(b.p, WALL), M.white, ob.cx, ob.cz);

  // THE VERANDAH RHYTHM. What makes this building read is a stack of deep
  // shaded galleries with a green balustrade at every floor, not a window grid.
  for (let f = 1; f < 3; f++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.018), 0.34, FL * f - 0.34),
      M.white, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(api.grow(b.p, 1.022), 0.62, FL * f), M.green, ob.cx, ob.cz);
  }
  // the shaded gallery behind each balustrade, set back so it reads as depth
  for (let f = 0; f < 3; f++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 0.992), FL * 0.52, FL * f + FL * 0.30),
      M.cream, ob.cx, ob.cz);
  }
  // a strong cornice at the eaves
  api.merge(api.extrudeGeo(api.grow(b.p, 1.030), 0.55, WALL - 0.55), M.white, ob.cx, ob.cz);

  // THE HIPPED ROOF, as inward steps. Deep, but it cannot overhang or float:
  // every course is the footprint itself, drawn smaller.
  // TWO COURSES, NOT FIVE. api.grow() is a CENTROID SCALE, so a uniform shrink
  // cannot cut a true hip on a plan 125m deep and 34m wide -- the short axis
  // collapses long before the long one has moved. Five courses read as a
  // ziggurat. A deep projecting eave and one shallow cap is what this building
  // actually shows from the street, and it is honest about what the geometry
  // can express.
  const RH = H - WALL;
  api.merge(api.extrudeGeo(api.grow(b.p, 1.045), RH * 0.30, WALL), M.tile, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 0.965), RH * 0.72, WALL + RH * 0.28),
    M.tile, ob.cx, ob.cz);

  // THE PORTICO, on the Beach Road end -- the SE short face, found by walking
  // out from the box centre toward the street rather than assumed.
  const sw = streetward(api, ob);
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const px = ob.bx + sw.nx * (ob.halfShort * 0.92);
  const pz = ob.bz + sw.nz * (ob.halfShort * 0.92);
  const sq = (cx2, cz2, r) => [[cx2 - r, cz2 - r], [cx2 + r, cz2 - r],
                               [cx2 + r, cz2 + r], [cx2 - r, cz2 + r]];
  if (!onCarriageway(px, pz, 0.5)) {
    api.merge(api.extrudeGeo(sq(px, pz, 5.2), FL * 1.35), M.white, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(sq(px, pz, 5.9), 0.5, FL * 1.35), M.white, ob.cx, ob.cz);
    for (const dx of [-1, 1]) {
      for (const dz of [-1, 1]) {
        api.merge(api.extrudeGeo(sq(px + dx * 4.3, pz + dz * 4.3, 0.42), FL * 1.35),
          M.white, ob.cx, ob.cz);
      }
    }
  }
}

// Masjid Malabar (Malabar Muslim Jama-Ath Mosque), 471 Victoria Street at
// Jalan Sultan. Researched 2026-07-31, research/littleindia-worship-2.md.
//
// THE TWO THINGS EVERY DESCRIPTION OF THIS BUILDING GETS WRONG:
//
//   1. THE DOME IS GOLD, NOT BLUE. It is known locally as both the "Golden
//      Dome Mosque" and the "Blue Mosque" -- every dome and finial is gold and
//      the blue is the WALL TILING. There are FOUR gold onion domes, counted on
//      a 2025 aerial, not the two or three that get published.
//   2. THE MINARET IS THE TALLEST ELEMENT, not the dome. Its crescent stands
//      ~18% above the dome's crescent and ~40% above the dome's apex. Lead with
//      the dome and the silhouette is wrong.
//
// AND THE BLUE IS NOT LAPIS. "Lapis lazuli" is the literature's phrase, not the
// built colour: sampled off a dated 2023 photograph the tile field is a LIGHT
// POWDER BLUE, #8AAABA to #8CB5CB, scored by a darker slate lattice. Skinning
// this navy would be wrong by a mile at street distance.
//
// The tiling is also not the whole building. The 1963 main complex is tiled top
// to parapet; the REAR north-west block is plain white render under large
// ORANGE pitched clay-tile roofs, and it reads pale and blank behind the blue
// from the street. Tile the whole footprint and about a third of it is wrong.
//
// Heights are RATIOS of the minaret tip, measured off a dated frontal
// photograph with the scale set two independent ways that agree. NO height is
// published by MUIS, NHB, NLB, URA or the mosque's own heritage site, so h is
// taken as the minaret tip and everything hangs off it.
const MALABAR_MAT = {
  tile: new THREE.MeshStandardMaterial({ color: 0x8aaaba, roughness: 0.42, metalness: 0.08 }),
  lattice: new THREE.MeshStandardMaterial({ color: 0x3f5867, roughness: 0.5 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.3, metalness: 0.62 }),
  white: new THREE.MeshStandardMaterial({ color: 0xece9e0, roughness: 0.88 }),
  clay: new THREE.MeshStandardMaterial({ color: 0xb5633a, roughness: 0.86 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x345060, roughness: 0.55, metalness: 0.2 }),
};
function masjidMalabar(api, b) {
  const ob = orientedBox(b.p);
  const M = MALABAR_MAT;
  const H = Math.max(12, b.h || 20);            // = the MINARET CRESCENT TIP
  const SEAT = api.footingY(b.p);

  // which way the street is: the tiled faces front it, the white block is behind
  const sw = streetward(api, ob);
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];
  const side = ((sw.nx * -ob.uz + sw.nz * ob.ux) > 0) ? 1 : -1;   // +v faces the street
  // THE ORIENTED BOX IS MUCH BIGGER THAN THE BUILDING. This footprint is 33.8 x
  // 14.1m of building, but its box is 38.8 x 29.4 with the vertex mean 5.7m off
  // centre across -- it wraps a courtyard. Sizing sub-blocks off halfShort made
  // both the rear block and the prayer hall span the WHOLE plan and bury the
  // tiled base that is most of what you see. Everything below is sized off the
  // SHORT half only, and modestly.

  // 1. the two-storey Victoria Street wing, tiled, at 0.35H
  api.merge(api.extrudeGeo(b.p, H * 0.35), M.tile, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(api.grow(b.p, 1.012), 0.4, H * 0.35 - 0.4), M.lattice, ob.cx, ob.cz);

  // 2. the main prayer-hall block, tiled, at 0.53H, on the street half
  const hallV = ob.midV + side * ob.halfShort * 0.40;
  api.merge(api.extrudeGeo(rect(ob.midU, hallV, ob.halfLong * 0.40, ob.halfShort * 0.22),
    H * 0.53), M.tile, ob.cx, ob.cz);
  api.merge(api.extrudeGeo(rect(ob.midU, hallV, ob.halfLong * 0.42, ob.halfShort * 0.24),
    0.45, H * 0.53 - 0.45), M.lattice, ob.cx, ob.cz);

  // 3. THE REAR BLOCK IS NOT BLUE. Plain white render under big orange pitched
  //    clay roofs -- about a third of the complex, and visible over the wing.
  const backV = ob.midV - side * ob.halfShort * 0.46;
  api.merge(api.extrudeGeo(rect(ob.midU, backV, ob.halfLong * 0.38, ob.halfShort * 0.20),
    H * 0.44), M.white, ob.cx, ob.cz);
  // The orange pitched roofs, sitting ON the white block rather than beside it.
  // The first version ran them off the block's ends, where a three-sided
  // cylinder seen end-on reads as an arrowhead floating in space.
  {
    const rad = Math.min(ob.halfShort * 0.11, 2.0);
    const g = new THREE.CylinderGeometry(rad, rad, ob.halfLong * 0.74, 3, 1, false);
    g.rotateZ(Math.PI / 2);
    g.scale(1, 1, (ob.halfShort * 0.20) / (rad * 0.866));
    g.rotateY(-ob.ang);
    const [rx, rz] = P(ob.midU, backV);
    g.translate(rx, SEAT + H * 0.44 + rad * 0.5, rz);
    api.merge(g, M.clay, ob.cx, ob.cz);
  }

  // 4. the dome pavilion and FOUR gold onion domes. Apex 0.71H, crescent 0.85H.
  const onion = (cx2, cz2, r, baseY) => {
    const dg = new THREE.SphereGeometry(r, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.60);
    dg.scale(1, 1.42, 1);
    dg.translate(cx2, SEAT + baseY, cz2);
    api.merge(dg, M.gold, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(
      [[cx2 - 0.14, cz2 - 0.14], [cx2 + 0.14, cz2 - 0.14],
       [cx2 + 0.14, cz2 + 0.14], [cx2 - 0.14, cz2 + 0.14]],
      r * 1.5, baseY + r * 1.30), M.gold, ob.cx, ob.cz);
  };
  const [dx, dz] = P(ob.midU, hallV);
  const R = Math.min(ob.halfShort * 0.24, 3.6);
  onion(dx, dz, R, H * 0.53);                       // the main dome
  for (const su of [-1, 1]) {                       // three subsidiary domes
    const [sx, sz] = P(ob.midU + su * ob.halfLong * 0.40, hallV);
    onion(sx, sz, R * 0.44, H * 0.53);
  }
  const [ax, az] = P(ob.midU, hallV - side * ob.halfShort * 0.42);
  onion(ax, az, R * 0.40, H * 0.44);

  // 5. THE OCTAGONAL MINARET, tallest thing here. Tiled shaft to 0.65H, banded
  //    collar, gold dome apex at 0.89H, crescent tip at H.
  const [mx, mz] = P(ob.midU - ob.halfLong * 0.42, ob.midV + side * ob.halfShort * 0.46);
  const oct = (r, y0, h2, mat) => {
    const ring = [];
    for (let k = 0; k < 8; k++) {
      const a2 = (k / 8) * Math.PI * 2 + Math.PI / 8;
      ring.push([mx + Math.cos(a2) * r, mz + Math.sin(a2) * r]);
    }
    api.merge(api.extrudeGeo(ring, h2, y0), mat, ob.cx, ob.cz);
  };
  const MR = Math.min(ob.halfShort * 0.11, 1.7);
  oct(MR, 0, H * 0.65, M.tile);
  oct(MR * 1.12, H * 0.60, H * 0.05, M.lattice);        // the banded collar
  oct(MR * 0.92, H * 0.65, H * 0.10, M.tile);           // the open lantern stage
  onion(mx, mz, MR * 1.15, H * 0.75);                   // gold dome + crescent

  // 6. the 2023 annexe screen: perforated turquoise, not mosaic
  api.merge(api.extrudeGeo(rect(ob.midU + ob.halfLong * 0.66,
    ob.midV + side * ob.halfShort * 0.30, ob.halfLong * 0.22, 0.30),
    H * 0.40, H * 0.06), M.screen, ob.cx, ob.cz);
}

// Siddh Peeth Shree Lakshminarayan Temple, 5 Chander Road.
// Researched 2026-07-31, research/littleindia-worship-2.md.
//
// IT IS A SHIKHARA, NOT A GOPURAM, and this is the easiest thing in Little
// India to get wrong. The two Serangoon Road temples are Dravidian, with tiered
// gopurams covered in sculpted figures. This is North Indian: THREE smooth,
// bulbous, WAISTED spires — a bell profile that swells near the base, narrows
// to a waist, then carries a stack of flattened lotus-petal discs and a kalasha
// bulb. NO tiers, no niches, no sculpture, no figures. It reads closer to a
// Thai chedi than to anything on Serangoon Road, and building it from the
// gopuram helper would be wrong in kind, not just in detail.
//
// ROOTS SAYS "bright red pointed domes". THEY ARE NOT RED. Sampled off the
// 2026 consecration close-ups and confirmed on a 2016 photograph, they are a
// strong chrome yellow (#FDE751) with rose-pink bands on the discs and gold
// leaf on the bulbs. In no dated photograph are they red.
//
// AND EVERY PHOTO ONLINE IS OUT OF DATE. The temple reopened after a seven-year
// renovation and was reconsecrated on 25 February 2026 — five months before
// this was written, the first consecration in 56 years.
//
// No height is published by NHB, NLB, URA, the temple or the press, so h is
// taken as the central finial tip and the parapet hangs off it at the measured
// ratio: parapet 0.82, flanking finials 0.85.
const SHIKHARA_MAT = {
  yellow: new THREE.MeshStandardMaterial({ color: 0xfde751, roughness: 0.55 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd8a93a, roughness: 0.32, metalness: 0.55 }),
  rose: new THREE.MeshStandardMaterial({ color: 0xd98fa0, roughness: 0.72 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xefe7d8, roughness: 0.87 }),
  trim: new THREE.MeshStandardMaterial({ color: 0xc9b79a, roughness: 0.8 }),
  om: new THREE.MeshStandardMaterial({ color: 0xb02f26, roughness: 0.6 }),
};
function lakshminarayan(api, b) {
  const ob = orientedBox(b.p);
  const M = SHIKHARA_MAT;
  const H = Math.max(10, b.h || 18);          // = the central Om finial tip
  const PARAPET = H * 0.82;
  const SEAT = api.footingY(b.p);

  // the block: a double-height ground floor, three upper storeys, and a
  // screened roof terrace. Storeys are photographic, not published.
  api.merge(api.extrudeGeo(b.p, PARAPET), M.wall, ob.cx, ob.cz);
  for (let f = 1; f <= 4; f++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.014), 0.3, PARAPET * (0.28 + f * 0.145)),
      M.trim, ob.cx, ob.cz);
  }
  // the screened terrace parapet
  api.merge(api.extrudeGeo(api.grow(b.p, 1.006), PARAPET * 0.10, PARAPET * 0.90),
    M.trim, ob.cx, ob.cz);

  // ONE SPIRE. A waisted bell of revolution, built as stacked rings so the
  // profile is explicit and cheap: swell near the base, pull in to a waist,
  // then the amalaka discs, the kalasha and the Om.
  const spire = (cx2, cz2, R0, baseY, tipY) => {
    const top = tipY - baseY;
    const ringAt = (r, y0, h2, mat) => {
      const ring = [];
      for (let k = 0; k < 12; k++) {
        const a2 = (k / 12) * Math.PI * 2;
        ring.push([cx2 + Math.cos(a2) * r, cz2 + Math.sin(a2) * r]);
      }
      api.merge(api.extrudeGeo(ring, h2, y0), mat, ob.cx, ob.cz);
    };
    const BODY = top * 0.70, N = 14;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      // swells to 1.12 R0 at a fifth of the way up, then waists to 0.52
      const r = R0 * (t < 0.2 ? 1.0 + t * 0.6
        : 1.12 - Math.pow((t - 0.2) / 0.8, 0.85) * 0.60);
      ringAt(r, baseY + (BODY / N) * k, BODY / N + 0.06, M.yellow);
    }
    // the amalaka: flattened lotus-petal discs of decreasing diameter
    for (let k = 0; k < 3; k++) {
      ringAt(R0 * (0.60 - k * 0.11), baseY + BODY + k * (top * 0.055),
        top * 0.048, k % 2 ? M.yellow : M.rose);
    }
    // the kalasha bulb, gold
    const kb = new THREE.SphereGeometry(R0 * 0.32, 12, 8);
    kb.translate(cx2, SEAT + baseY + BODY + top * 0.20, cz2);
    api.merge(kb, M.gold, ob.cx, ob.cz);
    // neck, then the Om disc — a FLAT circular disc mounted VERTICALLY
    ringAt(R0 * 0.10, baseY + BODY + top * 0.22, top * 0.06, M.gold);
    const dR = R0 * 0.44;
    api.merge(api.extrudeGeo(
      [[cx2 - dR, cz2 - 0.09], [cx2 + dR, cz2 - 0.09],
       [cx2 + dR, cz2 + 0.09], [cx2 - dR, cz2 + 0.09]],
      dR * 1.9, baseY + BODY + top * 0.27), M.yellow, ob.cx, ob.cz);
    api.merge(api.extrudeGeo(
      [[cx2 - dR * 0.5, cz2 - 0.13], [cx2 + dR * 0.5, cz2 - 0.13],
       [cx2 + dR * 0.5, cz2 + 0.13], [cx2 - dR * 0.5, cz2 + 0.13]],
      dR * 0.9, baseY + BODY + top * 0.27 + dR * 0.5), M.om, ob.cx, ob.cz);
  };

  // three spires: one large central, two smaller flanking at 0.85H
  // THE SPIRES RISE THROUGH THE TERRACE, NOT OFF IT — a judgement, flagged.
  // The measured ratios are parapet 0.82H, central finial 1.00H, flanking
  // finials 0.85H. Taken literally that makes the flanking shikharas 0.03H tall
  // — half a metre — which cannot be right for something plainly visible as a
  // pair in both the 2016 photograph and the 2026 aerial. The research itself
  // puts +-15% on these and says the ratios, not the absolutes, are the
  // deliverable. So the spires are based at 0.72H and keep their published TIP
  // heights: central to 1.00H, flanking to 0.85H. The order and the tips are
  // the measured facts; the base is mine.
  // ON the terrace, and the flanking pair proportioned to the central spire.
  //
  // The measured ratios are parapet 0.82H, central finial 1.00H, flanking
  // 0.85H. The central one is right and is used as measured. The flanking pair
  // is NOT: 0.85H against a 0.82H parapet leaves them half a metre tall, and
  // they are plainly a visible pair in both the 2016 photograph and the 2026
  // aerial. Basing them lower was tried and does not help -- the block simply
  // hides them. So they are built at 60% of the central spire's height, which
  // is a JUDGEMENT, and the thing the research is confident about (three
  // spires, one large and two smaller, all bulbous and waisted) survives.
  const R = Math.min(ob.halfShort * 0.46, 3.6);
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  spire(ob.bx, ob.bz, R, PARAPET, H);
  for (const su of [-1, 1]) {
    const [sx, sz] = P(ob.midU + su * ob.halfLong * 0.50, ob.midV);
    spire(sx, sz, R * 0.60, PARAPET, PARAPET + (H - PARAPET) * 0.60);
  }
}


// KAMPONG KAPOR METHODIST CHURCH (Bishop Bickley Memorial), 1 Kampong Kapor Road.
// Swan and Maclaren, foundation stone 3 June 1929, dedicated 1930. URA conserved
// 1989. Spec in research/littleindia-worship-2.md section 3.
//
// WHY IT NEEDS A RECIPE. The generic church family draws a Gothic mass, and this
// is not Gothic — Roots calls it "quasi-Art Deco" and Wikipedia "stripped-back
// Art Deco". What actually identifies it from Kampong Kapor Road is a pair of
// multi-curved Dutch-Deco PARAPET GABLES stepping down to square pinnacle
// finials, and a square bell tower with a shallow DOMED CUPOLA — not a spire,
// which is what Wikipedia calls it and what the photographs disprove.
//
// THE ONE HEIGHT IS WEAK AND IS TREATED AS SUCH. "The tower is eighty-eight feet
// tall" (26.82m) appears only in an uncited Wikipedia sentence in an article
// carrying a primary-sources banner. It is used here because a SECOND,
// independent route agrees with it: the tower reads as roughly twice the
// sanctuary gable in the 2018 aerial, and the gable is about the data's own
// 16m, which lands at 28-30m. Two routes agreeing is the best evidence there is
// for this building, and it is still not a citation — so the tower is derived
// from b.h rather than hard-coded, and if the height data ever improves the
// whole composition follows it.
//
// EVERY ORNAMENT ON THIS BUILDING IS A CROSS. Wikipedia: "the finials, tower
// windows and exterior walls' ornament all derived from it", and the
// photographs bear it out — circle-with-inscribed-cross reliefs on the fence
// piers, quatrefoil roundels in the gable, cross-patterned louvres in the
// belfry. That is the motif system, and dropping it would lose the building.
const KKAPOR_MAT = {
  // Warm off-white render. Sampled #88959A raw off the 2018-08-19 aerial and
  // white-balanced to about #F2F2F2; drawn a shade warm so it does not read as
  // a modern white box beside the shophouses.
  white: new THREE.MeshStandardMaterial({ color: 0xefece5, roughness: 0.9 }),
  // Red-terracotta clay tile, #9C4334 to #A04B3C with weathered #6A1F11.
  clay: new THREE.MeshStandardMaterial({ color: 0x9c4334, roughness: 0.88 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.5, metalness: 0.25 }),
  rail: new THREE.MeshStandardMaterial({ color: 0x8d9195, roughness: 0.55, metalness: 0.35 }),
  // The Methodist flame emblem on the front wall, and the belfry lit warm gold
  // through its louvres.
  flame: new THREE.MeshStandardMaterial({ color: 0xb03a2e, roughness: 0.6 }),
  belfry: new THREE.MeshStandardMaterial({
    color: 0x6b5a3a, emissive: 0xc79a4a, emissiveIntensity: 0.5, roughness: 0.6 }),
  brick: new THREE.MeshStandardMaterial({ color: 0xa8705a, roughness: 0.92 }),
};

// NOT WIRED, 2026-07-31. Two vetting rounds and it still loses to the generic:
//
//   1. The two masses come out as one white cube. Sanctuary and education block
//      are both at 0.70 of the gable height and abut, so from the street they
//      read as a single 25m box with a tower stuck on it. The research is
//      explicit that they are different heights and different characters.
//   2. The clay roof reads as a red STRIPE, not a roof. Thickening the courses
//      and oversailing the eaves (round two) moved the stripe rather than
//      fixing it -- the courses are sitting visually below the block top and I
//      have not established why. Something about the seat the merged extrusion
//      takes versus the seat slab() takes needs bottoming out first.
//   3. The parapet crosses photographed as a row of TV aerials in round one.
//      Round two made them masonry-thick and dropped the second pinnacle pair,
//      which helped, but the parapet still does not read as the multi-curved
//      Dutch-Deco gable that is the whole point of the building.
//
// What DOES work and is worth keeping: the bell tower. Stepped Deco shaft,
// gold-lit belfry with cross louvres, shallow domed cupola, cross finial —
// that composition is right and is the one thing the generic church cannot do.
//
// The research (research/littleindia-worship-2.md section 3) is good and is not
// the problem. The next attempt should start from the mass heights: build the
// sanctuary LOW with a steep visible roof, the education block a clear storey
// taller and flat, and only then hang the parapet on the sanctuary.
function kampongKaporChurch(api, b) {
  const ob = orientedBox(b.p);
  const M = KKAPOR_MAT;
  const SEAT = api.footingY(b.p);
  // T is the cross tip. The data's h is the GABLE, and the research's own
  // cross-check is that the tower is about twice it.
  const gable = Math.max(11, b.h || 16);
  const T = gable / 0.53;
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];

  const sw = streetward(api, ob);
  // +v toward the street, so the two ceremonial gables land on the right faces.
  const side = ((sw.nx * -ob.uz + sw.nz * ob.ux) > 0) ? 1 : -1;
  const L = ob.halfLong, S = ob.halfShort;

  // The complex is a THROUGH-BLOCK with a ceremonial gable at BOTH ends: the
  // street front on Kampong Kapor Road and a second, symmetrical one on Cuff
  // Road with no tower. Missing that turns a two-fronted building into a
  // building with a back.

  // 1. the sanctuary hall, the south-west third of the frontage
  const sanU = ob.midU - L * 0.42;
  const sanHU = L * 0.32;
  api.merge(api.extrudeGeo(rect(sanU, ob.midV, sanHU, S * 0.94), gable * 0.70, SEAT),
    M.white, ob.cx, ob.cz);
  // Pitched clay roof, ridge running back from the street. Built as four thick
  // narrowing courses rather than a dozen thin ones: thin steps read as red
  // pinstripes sandwiched in the white wall from the street, which is what the
  // first version did. The lowest course OVERSAILS the wall, because the eaves
  // overhang is most of what says "tiled roof" at a distance.
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const w = sanHU * 2 * (1.06 - t * 0.80);
    slab(api, ob, sanU, ob.midV, w, S * 1.88 * (1.05 - t * 0.04),
      SEAT + gable * 0.70 + t * gable * 0.145, gable * 0.155, M.clay);
  }

  // 2. the education block, 1987, the north-east half. Three storeys, wider
  //    than the sanctuary front, flat white with horizontal window bands —
  //    the giveaway that it is modern — and its own matched Deco gables.
  const eduU = ob.midU + L * 0.36;
  const eduHU = L * 0.44;
  api.merge(api.extrudeGeo(rect(eduU, ob.midV, eduHU, S * 0.94), gable * 0.70, SEAT),
    M.white, ob.cx, ob.cz);
  for (let f = 0; f < 3; f++) {
    slab(api, ob, eduU, ob.midV + side * S * 0.95, eduHU * 1.9, 0.30,
      SEAT + gable * (0.16 + f * 0.19), gable * 0.09, M.dark);
  }
  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    slab(api, ob, eduU, ob.midV, eduHU * 2 * (1.05 - t * 0.72), S * 1.88 * (1.04 - t * 0.03),
      SEAT + gable * 0.70 + t * gable * 0.13, gable * 0.14, M.clay);
  }

  // 3. THE PARAPET GABLES. A raised central bay, ogee curves stepping down to
  //    square stepped pinnacle finials, then a second lower pair beyond, with
  //    crosses in relief on the central bay and the pinnacle caps. Built as a
  //    stepped profile because that is what a Dutch-Deco parapet reads as at
  //    riding speed, and drawn on BOTH the Kampong Kapor and the Cuff Road
  //    face of the sanctuary.
  const gableAt = (u, hu, vSign) => {
    const v = ob.midV + vSign * S * 0.96;
    // central raised bay to 0.53T
    slab(api, ob, u, v, hu * 0.46, 0.55, SEAT + gable * 0.62, gable * 0.38, M.white);
    // ogee shoulders, stepping down
    for (const s of [-1, 1]) {
      slab(api, ob, u + s * hu * 0.40, v, hu * 0.34, 0.5,
        SEAT + gable * 0.62, gable * 0.20, M.white);
      // stepped pinnacle finial at 0.37T
      slab(api, ob, u + s * hu * 0.62, v, hu * 0.14, 0.62,
        SEAT + gable * 0.62, gable * 0.32, M.white);
      slab(api, ob, u + s * hu * 0.62, v, hu * 0.09, 0.45,
        SEAT + gable * 0.94, gable * 0.10, M.white);
      // The second, lower pinnacle pair the research describes is deliberately
      // NOT built. With crosses on it too, the parapet came out as six thin
      // verticals in a row and read as a rank of TV aerials rather than as
      // masonry. The central cross and the two pinnacle caps carry the motif.
      slab(api, ob, u + s * hu * 0.84, v, hu * 0.11, 0.55,
        SEAT + gable * 0.62, gable * 0.16, M.white);
    }
    // the tall narrow glazed strip under its flat hood — the enlarged
    // stained-glass window that replaced the demolished central portal
    slab(api, ob, u, v + vSign * 0.30, hu * 0.15, 0.22,
      SEAT + gable * 0.24, gable * 0.50, M.dark);
    slab(api, ob, u, v + vSign * 0.55, hu * 0.26, 0.5,
      SEAT + gable * 0.76, gable * 0.05, M.white);
    // round quatrefoil windows flanking it, a circle with a cross inscribed
    for (const s of [-1, 1]) {
      const rx = u + s * hu * 0.36;
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(gable * 0.075, gable * 0.075, 0.30, 18), M.dark);
      const p0 = P(rx, v + vSign * 0.34);
      disc.position.set(p0[0], SEAT + gable * 0.44, p0[1]);
      disc.rotation.x = Math.PI / 2;
      disc.rotation.y = -ob.ang;
      disc.castShadow = true;
      api.world.add(disc);
    }
    cross(u, v, gable * 0.10, SEAT + gable * 1.00);
  };

  // Masonry crosses, not metal ones: a relief cross on a 1929 parapet is a
  // chunky moulded thing. The first version used 0.24m bars and photographed
  // as wire.
  function cross(u, v, size, y) {
    slab(api, ob, u, v, size * 0.38, 0.46, y, size * 1.45, M.white);
    slab(api, ob, u, v, size * 1.05, 0.46, y + size * 0.80, size * 0.36, M.white);
  }

  gableAt(sanU, sanHU, side);        // Kampong Kapor Road
  gableAt(sanU, sanHU, -side);       // Cuff Road, symmetrical, no tower
  // the education block's own matched gables, smaller and plainer
  gableAt(eduU, eduHU * 0.52, side);

  // 4. THE BELL TOWER, attached to the north-east side of the sanctuary,
  //    immediately beside the street gable and projecting about a metre
  //    forward of it. Square in plan at roughly 0.15T.
  const twU = sanU + sanHU * 1.02;
  const twV = ob.midV + side * (S * 0.96 + 0.9);
  const tw = Math.max(2.6, T * 0.15);
  // stepped Art Deco shaft to 0.855T
  slab(api, ob, twU, twV, tw, tw, SEAT, T * 0.60, M.white);
  slab(api, ob, twU, twV, tw * 0.92, tw * 0.92, SEAT + T * 0.60, T * 0.255, M.white);
  // stepped pinnacle finials on the shaft shoulders
  for (const s of [-1, 1]) {
    slab(api, ob, twU + s * tw * 0.52, twV, tw * 0.16, tw * 0.16,
      SEAT + T * 0.80, T * 0.09, M.white);
  }
  // the open belfry: tall arched louvre panels whose louvres form cross
  // patterns, lit warm gold from inside at night
  slab(api, ob, twU, twV, tw * 0.86, tw * 0.86, SEAT + T * 0.855, T * 0.075, M.belfry);
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    const du = Math.cos(a) * tw * 0.44, dv = Math.sin(a) * tw * 0.44;
    slab(api, ob, twU + du, twV + dv, tw * 0.62, 0.20,
      SEAT + T * 0.855, T * 0.075, M.dark, a);
  }
  // moulded cornice, then the SHALLOW DOMED CUPOLA — not a spire
  slab(api, ob, twU, twV, tw * 1.10, tw * 1.10, SEAT + T * 0.930, T * 0.022, M.white);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(tw * 0.52, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.46), M.white);
  const dp = P(twU, twV);
  dome.position.set(dp[0], SEAT + T * 0.952, dp[1]);
  dome.castShadow = true;
  api.world.add(dome);
  cross(twU, twV, T * 0.045, SEAT + T * 0.965);

  // 5. the low white front wall on its plinth: square piers carrying the
  //    circle-and-cross relief, railings between, red brick forecourt behind.
  //    Same treatment at the Cuff Road end.
  for (const vs of [side, -side]) {
    const v = ob.midV + vs * S * 1.30;
    if (Math.abs(S * 1.30) > Math.abs(S) + 6) continue;
    const piers = 7;
    for (let i = 0; i <= piers; i++) {
      const u = ob.midU - L * 0.82 + (i / piers) * L * 1.64;
      slab(api, ob, u, v, 0.52, 0.52, SEAT, 1.55, M.white);
    }
    slab(api, ob, ob.midU, v, L * 1.66, 0.16, SEAT + 0.55, 0.85, M.rail);
    slab(api, ob, ob.midU, v, L * 1.66, 0.30, SEAT, 0.45, M.white);
  }
  // the Methodist flame emblem, red, on the street wall
  slab(api, ob, sanU, ob.midV + side * (S * 1.30 + 0.18), 0.5, 0.14, SEAT + 0.75, 0.55, M.flame);
  // red brick forecourt
  api.merge(api.extrudeGeo(rect(ob.midU, ob.midV + side * S * 1.12, L * 0.86, S * 0.16),
    0.12, SEAT), M.brick, ob.cx, ob.cz);
}


// PARKROYAL COLLECTION PICKERING, 3 Upper Pickering Street. WOHA, 2013.
// 89.00m architectural, highest occupied floor 78.60m, 16 floors — CTBUH 14115
// corroborated by the Skyscraper Museum's WOHA exhibition data, and OSM's
// 89/78.6 pair reproduces CTBUH's architectural/highest-occupied pair exactly.
// Spec in research/cbd-podium-geometry.md.
//
// WHY THIS NEEDS A RECIPE, in the research's own words: "If you model this as
// one 159 x 34 m block at 89 m you destroy the building." OSM gives one
// polygon for the whole site and our data carried it at the 20m retail
// default, so the choice was a 20m box or a 159m-long 89m slab. Both are
// wrong, and the slab is the worse of the two.
//
// IT IS AN E, AND THREE PUBLISHED SOURCES SAY SO. Bingham-Hall: "placed on an
// E plan". Nixon and the AIA 2014 award citation: "a hotel of three linked
// towers in an E-shaped plan". WOHA's own wording is different but compatible,
// "attenuated into an open-sided courtyard configuration, breaking down the
// 'wall of buildings' effect". So: a spine on the south-east carrying services,
// three parallel room-wings projecting north-west toward Hong Lim Park, and the
// two gaps between them filled by the sky gardens.
//
// min_level=6 IS THE KEY NUMBER. The guest-room wings start at level 6, so the
// plane at 5-6 is the open sky-garden and pool deck over the car park. The
// famous planted terraces happen in the VOIDS BETWEEN THE WINGS and at that
// deck, not as a continuous green podium roof — which is how this building is
// usually drawn wrong.
const PARKROYAL_MAT = {
  // The podium's "geological" contour bands: WOHA's cast concrete striations.
  // OSM tags the car-park parts #6e6b6a, which is the mid-grey of that concrete.
  rock: new THREE.MeshStandardMaterial({ color: 0x6e6b6a, roughness: 0.94 }),
  band: new THREE.MeshStandardMaterial({ color: 0x817d78, roughness: 0.92 }),
  // The room wings read as pale horizontal bands of balcony and glazing.
  wing: new THREE.MeshStandardMaterial({ color: 0xdfdcd4, roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x9fb3ba, roughness: 0.22, metalness: 0.18 }),
  // 15,000 m2 of planting, "around double the area of the site" (WOHA).
  green: new THREE.MeshStandardMaterial({ color: 0x4f7a43, roughness: 0.95 }),
};

function parkroyalPickering(api, b) {
  const ob = orientedBox(b.p);
  const M = PARKROYAL_MAT;
  const SEAT = api.footingY(b.p);
  const TOP = 89.0, SPINE = 78.6;
  const DECK = 21.0;            // level 6, where the wings spring from
  const P = (u, v) => [ob.cx + u * ob.ux - v * ob.uz, ob.cz + u * ob.uz + v * ob.ux];
  const rect = (u0, v0, hu, hv) => [P(u0 - hu, v0 - hv), P(u0 + hu, v0 - hv),
                                    P(u0 + hu, v0 + hv), P(u0 - hu, v0 + hv)];

  // 1. THE PODIUM, five levels, covering essentially the whole site. Built off
  //    the real footprint rather than a rectangle so it keeps the site's shape.
  api.merge(api.extrudeGeo(b.p, DECK, SEAT), M.rock, ob.cx, ob.cz);
  // the contour banding, which is only the L3-L4 zone and not the whole podium
  for (let i = 0; i < 3; i++) {
    api.merge(api.extrudeGeo(api.grow(b.p, 1.008 + i * 0.004), 1.1,
      SEAT + DECK * 0.42 + i * 2.2), M.band, ob.cx, ob.cz);
  }
  // the sky-garden and pool deck ON TOP of the podium, at the springing plane
  api.merge(api.extrudeGeo(api.grow(b.p, 0.97), 0.6, SEAT + DECK), M.green, ob.cx, ob.cz);

  // 2. THE THREE ROOM WINGS. Spread along the site's 159m length at roughly
  //    E -48, E -8 and E +34 from the centroid, each plate about 33.5 x 17.3m,
  //    running PERPENDICULAR to the site's long axis. The oriented box's own
  //    frame already gives that: u is the long axis, so a wing is short in u
  //    and long in v.
  const L = ob.halfLong, S = ob.halfShort;
  const wingU = Math.min(9.0, L * 0.115);      // half of ~17.3m
  const wingV = Math.min(17.0, S * 0.98);      // half of ~33.5m
  const at = [-0.60, -0.10, 0.42];             // fractions of halfLong
  for (const f of at) {
    const u = ob.midU + f * L;
    slab(api, ob, u, ob.midV, wingU * 2, wingV * 2, SEAT + DECK, TOP - DECK, M.wing);
    // horizontal glazing bands: every guest room has a garden view, and the
    // elevation reads as stacked bands rather than as a curtain wall
    for (let k = 0; k < 9; k++) {
      slab(api, ob, u, ob.midV, wingU * 2.04, wingV * 2.04,
        SEAT + DECK + 2.2 + k * 7.2, 2.4, M.glass);
    }
  }
  // 3. THE TWO LINK BARS between the wings, the spine of the E, stopping at
  //    78.6m — the highest occupied floor, which is why the silhouette steps.
  for (let i = 0; i < at.length - 1; i++) {
    const u = ob.midU + (at[i] + at[i + 1]) / 2 * L;
    slab(api, ob, u, ob.midV + S * 0.42, Math.abs(at[i + 1] - at[i]) * L * 0.62,
      Math.min(9.3, S * 0.5), SEAT + DECK, SPINE - DECK, M.wing);
    // the sky gardens live in the voids between the wings, at the deck and
    // again partway up — this is where the planting actually is
    for (const y of [SEAT + DECK + 0.7, SEAT + DECK + 26, SEAT + DECK + 48]) {
      slab(api, ob, u, ob.midV - S * 0.30, Math.abs(at[i + 1] - at[i]) * L * 0.58,
        Math.min(11.0, S * 0.55), y, 1.5, M.green);
    }
  }
}
