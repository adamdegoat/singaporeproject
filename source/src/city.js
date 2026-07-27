// Build the street from real OSM geometry: extruded footprints, road ribbons,
// pavements, canopy trees, covered walkway, crossings, street furniture.
import * as THREE from '../lib/three.module.js';
import { PAL, R, rand, pick, chance, hex, texAsphalt, texPaving, texConcrete, texCurtain, texShopfront, texGranite, texTowerGlass, texPunched, texBalcony, texLeaves, texAO } from './tex.js';
import { recipeFor } from './landmarks.js';

export const TEX = {
  asphalt: texAsphalt(),
  paving: texPaving(),
  leaf: texLeaves(),
  ao: texAO(),
};

// A handful of curtain-wall variants, reused across buildings so the street
// reads as varied without a texture per building.
const CURTAINS = [
  texCurtain(0x7d94a6, 0x5b656e, 8),   // cool blue-grey
  texCurtain(0x8b98a2, 0x6b7278, 7),   // pale silver
  texCurtain(0x6f8f8a, 0x4d5f5c, 9),   // green-tinted, very Orchard
  texCurtain(0x9a9384, 0x6d6a62, 6),   // bronze
  texCurtain(0x84939f, 0x3f4750, 10),  // dark mullion, tall floors
];
const SHOPS = [texShopfront(), texShopfront(), texShopfront()];
const STONE = [
  texConcrete(0xb3aa9a, 0.5), texConcrete(0x9c948a, 0.6),
  texConcrete(0xc2b5a0, 0.45), texConcrete(0x8d8a86, 0.7),
];
// Facade families, so the 180-odd background buildings are not one material.
// Chosen by a stable hash of the footprint, which keeps a building looking the
// same between reloads.
const PUNCHED = [texPunched(0xa8a091), texPunched(0xbdb3a0), texPunched(0x938c82)];
const BALCONY = [texBalcony(0xc6bda9), texBalcony(0xada596)];
function familyFor(b) {
  let h = 0;
  for (const [x, z] of b.p) h = (h * 31 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
  h = Math.abs(h);
  if (b.a > 1400 || b.k) return { pool: CURTAINS, rough: 0.34, metal: 0.08 };
  const pickN = h % 100;
  if (pickN < 34) return { pool: PUNCHED, rough: 0.86, metal: 0.0 };
  if (pickN < 52) return { pool: BALCONY, rough: 0.8, metal: 0.0 };
  if (pickN < 74) return { pool: STONE, rough: 0.88, metal: 0.0 };
  return { pool: CURTAINS, rough: 0.36, metal: 0.06 };
}

export const MAT = {
  asphalt: new THREE.MeshStandardMaterial({ map: TEX.asphalt, roughness: 0.95 }),
  paving: new THREE.MeshStandardMaterial({ map: TEX.paving, roughness: 0.9 }),
  kerb: new THREE.MeshStandardMaterial({ color: PAL.kerb, roughness: 0.86 }),
  conc: new THREE.MeshStandardMaterial({ map: texConcrete(PAL.conc, 0.7), roughness: 0.92 }),
  trim: new THREE.MeshStandardMaterial({ color: PAL.trim, roughness: 0.8 }),
  white: new THREE.MeshStandardMaterial({ color: 0xdedad0, roughness: 0.85 }),
  yellow: new THREE.MeshStandardMaterial({ color: PAL.yellow, roughness: 0.85 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x8b8f93, roughness: 0.5, metalness: 0.4 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x3b3f44, roughness: 0.6, metalness: 0.3 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x53616d, roughness: 0.14, metalness: 0.18 }),
  leaf: new THREE.MeshLambertMaterial({
    map: TEX.leaf, transparent: false, alphaTest: 0.42, side: THREE.DoubleSide,
  }),
  canopy: new THREE.MeshLambertMaterial({ color: 0x24311a }),
  trunk: new THREE.MeshStandardMaterial({ color: PAL.trunk, roughness: 0.95 }),
  ao: new THREE.MeshBasicMaterial({
    map: TEX.ao, transparent: true, blending: THREE.MultiplyBlending,
    premultipliedAlpha: true, depthWrite: false,
  }),
};

// materials the landmark recipes draw on
const LMAT = {
  granite: new THREE.MeshStandardMaterial({ map: texGranite(), roughness: 0.30, metalness: 0.12 }),
  towerGlass: new THREE.MeshStandardMaterial({ map: texTowerGlass(), roughness: 0.22, metalness: 0.16 }),
  blueGlass: new THREE.MeshStandardMaterial({
    map: texTowerGlass(), color: 0x9fc4dd, roughness: 0.18, metalness: 0.2,
  }),
  paleStone: new THREE.MeshStandardMaterial({ map: texConcrete(0xc4bdae, 0.35), roughness: 0.78 }),
  warmStone: new THREE.MeshStandardMaterial({ map: texConcrete(0xb2a48f, 0.5), roughness: 0.85 }),
  jadeRoof: new THREE.MeshStandardMaterial({ color: 0x2f5f4a, roughness: 0.45, metalness: 0.2 }),
};

const up = new THREE.Vector3(0, 1, 0);

// Every building used to get its own cloned texture, which meant its own
// material, which meant its own draw call. Instead: share a small set of
// materials, bake the tiling into each geometry's UVs, and concatenate all the
// geometries that share a material into one mesh. ~600 draws becomes ~15.
// Merging EVERYTHING into a handful of meshes backfires: one mesh spanning the
// whole map is never frustum-culled, so all million triangles draw every frame
// no matter where you look. Merge per material AND per spatial tile instead, so
// each merged mesh stays local and cullable.
const TILE = 110;
class Merger {
  constructor() { this.groups = new Map(); this.mats = new Map(); }
  add(geo, mat, x = 0, z = 0) {
    const key = `${Math.floor(x / TILE)},${Math.floor(z / TILE)}|${this.matKey(mat)}`;
    if (!this.groups.has(key)) { this.groups.set(key, []); this.mats.set(key, mat); }
    this.groups.get(key).push(geo.index ? geo.toNonIndexed() : geo);
  }
  matKey(mat) {
    if (!this._ids) { this._ids = new Map(); this._next = 0; }
    if (!this._ids.has(mat)) this._ids.set(mat, this._next++);
    return this._ids.get(mat);
  }
  flush(world) {
    let meshes = 0;
    for (const [key, list] of this.groups) {
      const mat = this.mats.get(key);
      let n = 0;
      for (const g of list) n += g.attributes.position.count;
      const pos = new Float32Array(n * 3);
      const nor = new Float32Array(n * 3);
      const uv = new Float32Array(n * 2);
      let o3 = 0, o2 = 0;
      for (const g of list) {
        pos.set(g.attributes.position.array, o3);
        if (g.attributes.normal) nor.set(g.attributes.normal.array, o3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, o2);
        o3 += g.attributes.position.count * 3;
        o2 += g.attributes.position.count * 2;
        g.dispose();
      }
      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      world.add(mesh);
      meshes++;
    }
    this.groups.clear(); this.mats.clear();
    return meshes;
  }
}

// scale a geometry's UVs in place, so one shared material can tile correctly
// across buildings of very different sizes
function scaleUV(geo, sx, sy) {
  const uv = geo.attributes.uv;
  if (!uv) return geo;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy);
  }
  uv.needsUpdate = true;
  return geo;
}

// one shared material per facade texture, built lazily
const sharedMats = new Map();
function sharedMat(tex, rough, metal) {
  if (!sharedMats.has(tex)) {
    sharedMats.set(tex, new THREE.MeshStandardMaterial({
      map: tex, roughness: rough, metalness: metal,
    }));
  }
  return sharedMats.get(tex);
}

// the raw geometry, without wrapping it in a Mesh
function extrudeGeo(pts, h, y0 = 0) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(pts), {
    depth: h, bevelEnabled: false, curveSegments: 1,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, y0 + h, 0);
  return geo;
}

/* ---------------- footprint helpers ---------------- */
function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
    a += x1 * z2 - x2 * z1;
  }
  return a / 2;
}
function shapeFrom(ptsIn) {
  const pts = signedArea(ptsIn) < 0 ? [...ptsIn].reverse() : ptsIn;
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}
function centroid(pts) {
  let x = 0, z = 0;
  for (const p of pts) { x += p[0]; z += p[1]; }
  return [x / pts.length, z / pts.length];
}
function perimeter(pts) {
  let d = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    d += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return d;
}

// Extrude a footprint upward. Extrusion happens in XY then the mesh is laid
// flat, which is the cheapest way to get real building masses from OSM rings.
function extrude(pts, h, mat, y0 = 0) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(pts), {
    depth: h, bevelEnabled: false, curveSegments: 1,
  });
  geo.rotateX(Math.PI / 2);      // +Z extrusion becomes +Y
  geo.translate(0, y0 + h, 0);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ---------------- buildings ---------------- */
function grow(pts, f) {
  const c = centroid(pts);
  return pts.map(([x, z]) => [c[0] + (x - c[0]) * f, c[1] + (z - c[1]) * f]);
}

export function buildBuildings(world, data) {
  const stats = { count: 0, tall: 0, bespoke: 0 };
  const merger = new Merger();
  const api = {
    world, extrude, grow, axis: data.axis || null,
    mat: { ...LMAT, trim: MAT.trim, conc: MAT.conc, paving: MAT.paving, metal: MAT.metal },
  };
  for (const b of data.buildings) {
    const pts = b.p;
    if (pts.length < 3) continue;

    // the buildings people navigate by get their real arrangement, not a box
    const recipe = recipeFor(b.n);
    if (recipe) {
      recipe(api, b);
      addShopfront(world, b, perimeter(pts), merger);
      stats.count++; stats.bespoke++;
      continue;
    }
    const fam = familyFor(b);
    const wallTex = pick(fam.pool);
    const mat = sharedMat(wallTex, fam.rough, fam.metal);
    const per = perimeter(pts);
    const h = b.h;
    // Landmarks are podium + tower, which is what the Orchard skyline is made of
    if (b.k && h > 70) {
      const podium = Math.min(34, h * 0.28);
      world.add(extrude(pts, podium, new THREE.MeshStandardMaterial({
        map: pick(STONE), roughness: 0.8,
      })));
      const c = centroid(pts);
      const inset = pts.map(([x, z]) => [c[0] + (x - c[0]) * 0.62, c[1] + (z - c[1]) * 0.62]);
      world.add(extrude(inset, h - podium, mat, podium));
      stats.tall++;
    } else {
      const cB = centroid(pts);
      merger.add(scaleUV(extrudeGeo(pts, h), Math.max(1, per / 26), Math.max(1, h / 28)), mat, cB[0], cB[1]);
      // parapet cap so roofs are not a raw extruded edge
      if (h > 8) {
        const c = centroid(pts);
        const out = pts.map(([x, z]) => [c[0] + (x - c[0]) * 1.008, c[1] + (z - c[1]) * 1.008]);
        merger.add(extrudeGeo(out, 0.7, h), MAT.trim, c[0], c[1]);
      }
    }

    addShopfront(world, b, per, merger);

    // rooftop plant on the bigger flat roofs
    if (b.a > 900 && h > 12) {
      const c = centroid(pts);
      for (let i = 0; i < 3; i++) {
        const g2 = new THREE.BoxGeometry(rand(3, 7), rand(1.6, 3.4), rand(3, 6));
        g2.translate(c[0] + rand(-8, 8), h + rand(1, 1.8), c[1] + rand(-8, 8));
        merger.add(g2, MAT.conc, c[0], c[1]);
      }
    }
    stats.count++;
  }
  stats.mergedMeshes = merger.flush(world);
  return stats;
}

// Ground floor is what you actually see from a scooter: glazed shopfront band,
// an awning line above it, and a deeper canopy where the entrance would be.
function addShopfront(world, b, per, merger) {
  if (b.a <= 600 || b.h <= 7) return;
  const pts = b.p;
  const sf = pick(SHOPS);
  const sfMat = sharedMat(sf, 0.32, 0.05);
  if (merger) {
    const cS = centroid(pts);
    merger.add(scaleUV(extrudeGeo(grow(pts, 1.012), 5.4), Math.max(2, per / 15), 1), sfMat, cS[0], cS[1]);
    merger.add(extrudeGeo(grow(pts, 1.055), 0.42, 5.3), MAT.trim, cS[0], cS[1]);
  } else {
    world.add(extrude(grow(pts, 1.012), 5.4, sfMat));
    world.add(extrude(grow(pts, 1.055), 0.42, MAT.trim, 5.3));
  }
  // entrance canopy: a deeper projection on the longest edge
  let bi = 0, bl = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], c = pts[(i + 1) % pts.length];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (L > bl) { bl = L; bi = i; }
  }
  if (bl > 16) {
    const a = pts[bi], c = pts[(bi + 1) % pts.length];
    const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2;
    const ang = Math.atan2(c[0] - a[0], c[1] - a[1]);
    const cen = centroid(pts);
    const outX = mx - cen[0], outZ = mz - cen[1];
    const oL = Math.hypot(outX, outZ) || 1;
    const ux = outX / oL, uz = outZ / oL;

    // A lobby you can actually see into. Recess a lit volume behind glass doors
    // so the ground floor stops reading as a printed band.
    if (b.a > 1200) {
      const lw = Math.min(14, bl * 0.3);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(lw, 4.4),
        new THREE.MeshStandardMaterial({
          color: 0x2b2620, roughness: 0.7,
          emissive: 0xd9b477, emissiveIntensity: 0.55,
        }));
      back.position.set(mx - ux * 5.2, 2.5, mz - uz * 5.2);
      back.rotation.y = ang + Math.PI / 2;
      world.add(back);
      // side walls, so it reads as depth rather than a glowing sticker
      for (const sgn of [-1, 1]) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 4.4),
          new THREE.MeshStandardMaterial({ color: 0x3a332b, roughness: 0.8, side: THREE.DoubleSide }));
        side.position.set(mx - ux * 2.5 + Math.sin(ang) * sgn * lw / 2, 2.5,
                          mz - uz * 2.5 + Math.cos(ang) * sgn * lw / 2);
        side.rotation.y = ang;
        world.add(side);
      }
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(lw, 5.6),
        new THREE.MeshStandardMaterial({ color: 0x4a423a, roughness: 0.8, side: THREE.DoubleSide }));
      ceil.rotation.x = Math.PI / 2;
      ceil.rotation.z = -ang;
      ceil.position.set(mx - ux * 2.5, 4.7, mz - uz * 2.5);
      world.add(ceil);
      // glass doors across the opening
      const doors = new THREE.Mesh(new THREE.PlaneGeometry(lw, 4.2),
        new THREE.MeshStandardMaterial({
          color: 0xbcd0da, roughness: 0.08, metalness: 0.2,
          transparent: true, opacity: 0.34, side: THREE.DoubleSide,
        }));
      doors.position.set(mx + ux * 0.35, 2.4, mz + uz * 0.35);
      doors.rotation.y = ang + Math.PI / 2;
      world.add(doors);
    }
    const cw = Math.min(18, bl * 0.34);
    const can = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.5, 4.4), MAT.trim);
    can.position.set(mx + (outX / oL) * 1.9, 6.1, mz + (outZ / oL) * 1.9);
    can.rotation.y = ang + Math.PI / 2;
    can.castShadow = true; world.add(can);
    for (const s2 of [-1, 1]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8), MAT.metal);
      col.position.set(
        mx + (outX / oL) * 3.6 + Math.sin(ang) * s2 * cw * 0.42,
        3.0,
        mz + (outZ / oL) * 3.6 + Math.cos(ang) * s2 * cw * 0.42
      );
      col.castShadow = true; world.add(col);
    }
  }
}

/* ---------------- roads and pavements ---------------- */
// A road is a ribbon: for each segment emit a quad of the tagged width.
function ribbon(pts, width, y) {
  const g = new THREE.BufferGeometry();
  const pos = [], uv = [];
  let run = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.01) continue;
    const nx = (-dz / len) * width / 2, nz = (dx / len) * width / 2;
    const a = [x1 - nx, y, z1 - nz], b = [x1 + nx, y, z1 + nz];
    const c = [x2 + nx, y, z2 + nz], d = [x2 - nx, y, z2 - nz];
    pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    const u0 = run / width, u1 = (run + len) / width;
    uv.push(0, u0, 1, u0, 1, u1, 0, u0, 1, u1, 0, u1);
    run += len;
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function polyLen(pts) {
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++)
    d += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  return d;
}

export function buildRoads(world, data) {
  const roadGeos = [], paveGeos = [];
  let mainAxis = null, bestLen = Infinity;
  for (const r of data.roads) {
    const isPath = r.k === 'footway' || r.k === 'pedestrian';
    const y = isPath ? 0.02 : 0.055;
    const g = ribbon(r.p, r.w, y);
    if (!g.attributes.position || g.attributes.position.count === 0) continue;
    (isPath ? paveGeos : roadGeos).push(g);
    if (/orchard road/i.test(r.n || '') && polyLen(r.p) > 120) {
      let near = Infinity;
      for (const [x, z] of r.p) near = Math.min(near, x * x + z * z);
      if (near < bestLen) { bestLen = near; mainAxis = r; }
    }
  }
  const merge = (geos, mat) => {
    if (!geos.length) return;
    // one draw call for the whole layer
    let total = 0;
    for (const g of geos) total += g.attributes.position.count;
    const pos = new Float32Array(total * 3), uv = new Float32Array(total * 2);
    let o = 0, ou = 0;
    for (const g of geos) {
      pos.set(g.attributes.position.array, o); o += g.attributes.position.array.length;
      uv.set(g.attributes.uv.array, ou); ou += g.attributes.uv.array.length;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    m.computeVertexNormals();
    const mesh = new THREE.Mesh(m, mat);
    mesh.receiveShadow = true;
    world.add(mesh);
  };
  merge(roadGeos, MAT.asphalt);
  merge(paveGeos, MAT.paving);
  return mainAxis;
}

/* ---------------- rain trees, as one instanced field ---------------- */
// Every tree as its own Group would be ~10 draw calls each. Collect them and
// emit three InstancedMeshes for the whole street instead.
export class TreeField {
  constructor() { this.items = []; }
  add(x, z, scale = 1) { this.items.push([x, z, scale]); }
  build(world) {
    const n = this.items.length;
    if (!n) return 0;
    const CARDS = 30, BLOBS = 3, BRANCH = 4;
    const trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.24, 0.52, 1, 8), MAT.trunk, n);
    const branches = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.07, 0.2, 1, 5), MAT.trunk, n * BRANCH);
    const blobs = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0), MAT.canopy, n * BLOBS);
    const cards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 0.55), MAT.leaf, n * CARDS);
    trunks.castShadow = branches.castShadow = blobs.castShadow = cards.castShadow = true;

    const m = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion();
    const p = new THREE.Vector3(), sc = new THREE.Vector3();
    let bi = 0, li = 0, ci = 0;

    this.items.forEach(([x, z, scale], i) => {
      const h = rand(8.5, 12.5) * scale;
      const rad = rand(5.2, 7.2) * scale;
      p.set(x, h / 2, z); q.identity(); sc.set(scale, h, scale);
      m.compose(p, q, sc); trunks.setMatrixAt(i, m);

      for (let k = 0; k < BRANCH; k++) {
        const a = (k / BRANCH) * Math.PI * 2 + rand(-0.3, 0.3);
        const L = rand(1.8, 3.0) * scale;
        p.set(x + Math.cos(a) * L * 0.22, h * rand(0.80, 0.96), z + Math.sin(a) * L * 0.22);
        e.set(Math.cos(a) * 0.55, 0, -Math.sin(a) * 0.55);
        q.setFromEuler(e); sc.set(scale, L, scale);
        m.compose(p, q, sc); branches.setMatrixAt(bi++, m);
      }
      for (let k = 0; k < BLOBS; k++) {
        const r = rad * rand(0.16, 0.24);
        p.set(x + rand(-0.45, 0.45) * rad, h * rand(0.94, 1.06), z + rand(-0.45, 0.45) * rad);
        q.identity(); sc.set(r, r * 0.5, r);
        m.compose(p, q, sc); blobs.setMatrixAt(li++, m);
      }
      for (let k = 0; k < CARDS; k++) {
        const a = R() * Math.PI * 2;
        const rr = rad * Math.sqrt(R()) * 1.12;
        p.set(x + Math.cos(a) * rr,
              h * rand(0.92, 1.06) - rr * 0.13 + rand(-0.4, 0.4),
              z + Math.sin(a) * rr);
        e.set(rand(-1.5, -0.7), a + rand(-0.7, 0.7), rand(-0.4, 0.4));
        q.setFromEuler(e);
        const v = rad * rand(0.45, 0.8); sc.set(v, v, v);
        m.compose(p, q, sc); cards.setMatrixAt(ci++, m);
      }
    });
    branches.count = bi; blobs.count = li; cards.count = ci;
    world.add(trunks, branches, blobs, cards);
    return n;
  }
}

export function aoPatch(world, x, z, size) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), MAT.ao);
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.17, z);
  world.add(m);
}
