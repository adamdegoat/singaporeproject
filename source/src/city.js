// Build the street from real OSM geometry: extruded footprints, road ribbons,
// pavements, canopy trees, covered walkway, crossings, street furniture.
import * as THREE from '../lib/three.module.js';
import { PAL, R, rand, pick, chance, hex, texAsphalt, texPaving, texConcrete, texCurtain, texShopfront, texGranite, texTowerGlass, texPunched, texBalcony, texShophouse, texLeaves, texAO, rng } from './tex.js';
import { recipeFor, shophouse } from './landmarks.js';

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
  // A little emissive on the foliage. Leaf cards are double-sided, so from the
  // pavement you are looking at the UNLIT back of half the crown above you, and
  // a Lambert backface with no light on it is black. Real foliage seen from
  // below is translucent, not black; this stands in for that without the cost
  // of a transmission material. Keep it low, or the canopy glows at dusk.
  leaf: new THREE.MeshLambertMaterial({
    map: TEX.leaf, transparent: false, alphaTest: 0.42, side: THREE.DoubleSide,
    emissive: 0x24331a, emissiveIntensity: 0.55,
  }),
  canopy: new THREE.MeshLambertMaterial({ color: 0x3a4f24, emissive: 0x1d2812, emissiveIntensity: 0.4 }),
  trunk: new THREE.MeshStandardMaterial({ color: PAL.trunk, roughness: 0.95 }),
  ao: new THREE.MeshBasicMaterial({
    map: TEX.ao, transparent: true, blending: THREE.MultiplyBlending,
    premultipliedAlpha: true, depthWrite: false,
  }),
};

const SHOPHOUSE_COLS = [0xd8cbb4, 0xbfd2c4, 0xd9c39a, 0xc9d3dd, 0xd6b6a8, 0xe0d6bd, 0xb9c9bd];
const AWNING_COLS = [0x8c4a3f, 0x2f5f52, 0x8a7433, 0x3f5570, 0x6e4a63, 0x9a5f36];
const shopHouseMats = new Map();
const awningMats = new Map();

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
  clayTile: new THREE.MeshStandardMaterial({ color: 0x9c5a44, roughness: 0.82 }),
  awning(b) {
    let h = 0;
    for (const [x, z] of b.p) h = (h * 29 + ((x * 9) | 0) + ((z * 7) | 0)) | 0;
    const col = AWNING_COLS[Math.abs(h) % AWNING_COLS.length];
    if (!awningMats.has(col)) {
      awningMats.set(col, new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }));
    }
    return awningMats.get(col);
  },
  // one shared material per shophouse colour, keyed off the footprint so a
  // given house keeps its colour between reloads
  shophouse(b) {
    let h = 0;
    for (const [x, z] of b.p) h = (h * 31 + ((x * 5) | 0) + ((z * 11) | 0)) | 0;
    const col = SHOPHOUSE_COLS[Math.abs(h) % SHOPHOUSE_COLS.length];
    if (!shopHouseMats.has(col)) {
      shopHouseMats.set(col, new THREE.MeshStandardMaterial({
        map: texShophouse(col), roughness: 0.88,
      }));
    }
    return shopHouseMats.get(col);
  },
};

const up = new THREE.Vector3(0, 1, 0);

// Set by main once the district's heightfield is loaded. Everything that used
// to assume ground at zero asks this instead.
let TERRAIN = { at: () => 0 };
export function setTerrain(t) { TERRAIN = t; }

// Is this point inside a carriageway? Structural pieces are placed by offsets
// from a facade, and an offset sideways along the frontage can put a column in
// the middle of the street even when the outward projection was checked.
export function onCarriageway(x, z, margin = -0.6) {
  return window.__onRoad ? window.__onRoad(x, z, margin) : false;
}
export function groundAt(x, z) { return TERRAIN.at(x, z); }

// The height of the surface you stand ON, which is not the terrain height. The
// carriageway is drawn at terrain + 0.055 plus up to 5mm of per-road offset, and
// footways at terrain + 0.02. Anything placed at the raw terrain height is under
// the road: the bike, the traffic and the crowd all were.
const SURFACE_ROAD = 0.061;      // clears the highest per-road offset
const SURFACE_PATH = 0.024;
export function surfaceAt(x, z) {
  const g = TERRAIN.at(x, z);
  if (window.__onRoad && window.__onRoad(x, z, 0.4)) return g + SURFACE_ROAD;
  return g + SURFACE_PATH;
}

// Every building used to get its own cloned texture, which meant its own
// material, which meant its own draw call. Instead: share a small set of
// materials, bake the tiling into each geometry's UVs, and concatenate all the
// geometries that share a material into one mesh. ~600 draws becomes ~15.
// Merging EVERYTHING into a handful of meshes backfires: one mesh spanning the
// whole map is never frustum-culled, so all million triangles draw every frame
// no matter where you look. Merge per material AND per spatial tile instead, so
// each merged mesh stays local and cullable.
const TILE = 110;
export class Merger {
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

// How far can something project outward from (x,z) along (nx,nz) before it
// enters a carriageway? Plazas, porte-cocheres and entrance canopies were being
// placed a fixed distance out, which put 36 of them in the road — including Ngee
// Ann City's civic plaza 8.5m into Orchard Road.
class Clearance {
  constructor(roads, axis) {
    this.CELL = 44;
    this.grid = new Map();
    const add = (a, b, clear) => {
      const minx = Math.min(a[0], b[0]) - clear, maxx = Math.max(a[0], b[0]) + clear;
      const minz = Math.min(a[1], b[1]) - clear, maxz = Math.max(a[1], b[1]) + clear;
      for (let cx = Math.floor(minx / this.CELL); cx <= Math.floor(maxx / this.CELL); cx++)
        for (let cz = Math.floor(minz / this.CELL); cz <= Math.floor(maxz / this.CELL); cz++) {
          const k = cx + ',' + cz;
          if (!this.grid.has(k)) this.grid.set(k, []);
          this.grid.get(k).push([a, b, clear]);
        }
    };
    for (const r of roads || []) {
      if (r.k === 'footway' || r.k === 'pedestrian' || r.k === 'service') continue;
      for (let i = 0; i < r.p.length - 1; i++) add(r.p[i], r.p[i + 1], r.w / 2 + 0.7);
    }
    if (axis) for (let i = 0; i < axis.p.length - 1; i++) add(axis.p[i], axis.p[i + 1], axis.w / 2 + 0.7);
  }

  inRoad(x, z) {
    const list = this.grid.get(Math.floor(x / this.CELL) + ',' + Math.floor(z / this.CELL));
    if (!list) return false;
    for (const [a, b, clear] of list) {
      const vx = b[0] - a[0], vz = b[1] - a[1];
      const L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const dx = x - (a[0] + vx * t), dz = z - (a[1] + vz * t);
      if (dx * dx + dz * dz < clear * clear) return true;
    }
    return false;
  }

  // largest safe projection up to `want`, stepping outward
  outward(x, z, nx, nz, want, halfWidth = 0) {
    for (let d = want; d > 0.4; d -= 0.5) {
      if (this.rectClear(x, z, nx, nz, halfWidth * 2, d)) return d;
    }
    return 0;
  }

  // Is the whole rectangle clear, not just its centreline? A 62m-wide plaza can
  // have a clear centre and still cross a side road at its corners, which is
  // exactly how Ngee Ann City's forecourt ended up 8.5m into Orchard Road.
  rectClear(x, z, nx, nz, width, depth) {
    const tx = -nz, tz = nx;
    const hw = width / 2;
    const across = Math.max(3, Math.ceil(width / 6));
    const along = Math.max(2, Math.ceil(depth / 4));
    for (let i = 0; i <= across; i++) {
      const w = -hw + (i / across) * width;
      for (let j = 0; j <= along; j++) {
        const d = (j / along) * depth;
        if (this.inRoad(x + nx * d + tx * w, z + nz * d + tz * w)) return false;
      }
    }
    return true;
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

// The ground a footprint actually sits on.
//
// Both extrusions used to seat a building at the terrain height under its
// CENTROID and sink it 0.9m, which is fine on the flat and wrong on a hill.
// Orchard and Bras Basah are not flat: 230 footprints span more than three
// metres of ground, and Plaza Singapura spans fourteen. Seated on the middle,
// its downhill end floated about seven metres in the air.
//
// Seat on the LOWEST ground under the footprint instead. Nothing can then
// float; the uphill end is buried deeper, which is what a building cut into a
// slope actually looks like and is invisible from outside.
function footingY(pts) {
  let lo = Infinity;
  for (const [x, z] of pts) {
    const g = TERRAIN.at(x, z);
    if (g < lo) lo = g;
  }
  // and sample the middle too, in case a long edge dips between its ends
  const c = centroid(pts);
  lo = Math.min(lo, TERRAIN.at(c[0], c[1]));
  // 0.9, the same sink as before, so a footprint on FLAT ground is seated exactly
  // where it always was and only sloped ones move. Changing both at once made
  // every building in the district 40cm higher for no reason and muddied what
  // the slope fix was actually responsible for.
  return lo - 0.9;
}

// the raw geometry, without wrapping it in a Mesh
function extrudeGeo(pts, h, y0 = 0) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(pts), {
    depth: h, bevelEnabled: false, curveSegments: 1,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, footingY(pts) + y0 + h, 0);
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
  geo.translate(0, footingY(pts) + y0 + h, 0);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ---------------- buildings ---------------- */
// Scale a footprint about its centroid. Shopfront bands, trim courses and
// awnings are all built from a grown ring, and a 5.5% growth on a 60m frontage
// pushes the ring 1.65m past the wall. Where that lands in a carriageway the
// result is a pale band lying across the road, which reads as the road itself
// being drawn wrongly. Any vertex that ends up in a carriageway is pulled back
// along its own outward direction until it is clear.
function grow(pts, f) {
  const c = centroid(pts);
  return pts.map(([x, z]) => {
    const ox = x - c[0], oz = z - c[1];
    let gx = c[0] + ox * f, gz = c[1] + oz * f;
    if (!onCarriageway(gx, gz, 0.2)) return [gx, gz];
    // walk back toward the original vertex, then just inside it if need be
    for (let t = f; t >= 0.92; t -= 0.01) {
      gx = c[0] + ox * t; gz = c[1] + oz * t;
      if (!onCarriageway(gx, gz, 0.2)) return [gx, gz];
    }
    return [x, z];
  });
}

export function buildBuildings(world, data) {
  const stats = { count: 0, tall: 0, bespoke: 0 };
  const merger = new Merger();
  const clearance = new Clearance(data.roads, data.axis);
  const api = {
    clearance,
    world, extrude, grow, axis: data.axis || null,
    extrudeGeo, scaleUV,
    merge: (geo, mat, x, z) => merger.add(geo, mat, x, z),
    mat: { ...LMAT, trim: MAT.trim, conc: MAT.conc, paving: MAT.paving, metal: MAT.metal },
  };
  for (const b of data.buildings) {
    const pts = b.p;
    if (pts.length < 3) continue;

    // small and low with no name: a shophouse, which is what fills the lanes
    if (!b.k && b.a < 520 && b.h <= 20 && b.p.length <= 64) {
      shophouse(api, b);
      stats.count++; stats.shophouses = (stats.shophouses || 0) + 1;
      continue;
    }

    // the buildings people navigate by get their real arrangement, not a box
    const recipe = recipeFor(b.n);
    if (recipe) {
      recipe(api, b);
      addShopfront(world, b, perimeter(pts), merger, clearance);
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

    addShopfront(world, b, per, merger, clearance);

    // rooftop plant on the bigger flat roofs: plant boxes, a stair housing,
    // water tanks and a run of ducting, so no two roofs read the same
    if (b.a > 900 && h > 12) {
      const c = centroid(pts);
      for (let i = 0; i < 3; i++) {
        const g2 = new THREE.BoxGeometry(rand(3, 7), rand(1.6, 3.4), rand(3, 6));
        g2.translate(c[0] + rand(-8, 8), h + rand(1, 1.8), c[1] + rand(-8, 8));
        merger.add(g2, MAT.conc, c[0], c[1]);
      }
      // lift and stair housing
      const sh = new THREE.BoxGeometry(rand(4, 7), rand(3.2, 4.6), rand(4, 6));
      sh.translate(c[0] + rand(-6, 6), h + 2.2, c[1] + rand(-6, 6));
      merger.add(sh, MAT.trim, c[0], c[1]);
      // water tanks
      if (chance(0.6)) {
        for (let i = 0; i < 2; i++) {
          const tk = new THREE.CylinderGeometry(rand(0.9, 1.4), rand(0.9, 1.4), 1.7, 10);
          tk.translate(c[0] + rand(-9, 9), h + 0.9, c[1] + rand(-9, 9));
          merger.add(tk, MAT.trim, c[0], c[1]);
        }
      }
      // duct run
      if (chance(0.5)) {
        const dz = new THREE.BoxGeometry(rand(9, 16), 0.7, 0.7);
        dz.translate(c[0] + rand(-4, 4), h + 0.9, c[1] + rand(-7, 7));
        merger.add(dz, MAT.metal, c[0], c[1]);
      }
    }
    stats.count++;
  }
  stats.mergedMeshes = merger.flush(world);
  return stats;
}

// Ground floor is what you actually see from a scooter: glazed shopfront band,
// an awning line above it, and a deeper canopy where the entrance would be.
function addShopfront(world, b, per, merger, clearance) {
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
    // A recessed lobby only makes sense behind the facade. Where the building
    // stands hard against the kerb the recess lands in the carriageway, and a
    // glowing back wall then hangs in the traffic.
    if (b.a > 1200 && !onCarriageway(mx - ux * 5.2, mz - uz * 5.2, 0)
        && !onCarriageway(mx + ux * 0.35, mz + uz * 0.35, 0)) {
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
    // never project into the carriageway
    const reach = clearance
      ? clearance.outward(mx, mz, ux, uz, 3.6, cw * 0.5)
      : 3.6;
    if (reach > 1.0) {
      // The canopy is as wide as the frontage, and its posts stand at the ends
      // of that width. `clearance.outward` only checked the projection straight
      // out from the middle, so on a skewed frontage a post could end up in the
      // carriageway: 59 six-metre columns were standing in roads, including the
      // row you meet at the spawn point. Every post is now tested where it
      // actually stands, and the canopy narrows until both of its ends are clear.
      let w = cw;
      const postAt = (width, s2) => [
        mx + ux * reach * 0.9 + Math.sin(ang) * s2 * width * 0.42,
        mz + uz * reach * 0.9 + Math.cos(ang) * s2 * width * 0.42,
      ];
      while (w > 4 && [-1, 1].some((s2) => {
        const [px2, pz2] = postAt(w, s2); return onCarriageway(px2, pz2);
      })) w *= 0.75;
      const clear = ![-1, 1].some((s2) => {
        const [px2, pz2] = postAt(w, s2); return onCarriageway(px2, pz2);
      });
      if (clear) {
        const can = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, reach * 1.15), MAT.trim);
        can.position.set(mx + ux * reach * 0.5, 6.1, mz + uz * reach * 0.5);
        can.rotation.y = ang + Math.PI / 2;
        can.castShadow = true; world.add(can);
        for (const s2 of [-1, 1]) {
          const [px2, pz2] = postAt(w, s2);
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8), MAT.metal);
          col.position.set(px2, 3.0, pz2);
          col.castShadow = true; world.add(col);
        }
      }
    }
  }
}

/* ---------------- roads and pavements ---------------- */
// A road is a ribbon: for each segment emit a quad of the tagged width.
// A road is a ribbon along a polyline. Two things used to leave holes in it: at
// a bend the two segments' corners land in different places, and at a junction
// each way stops at the node so nothing covers the middle. Both read as pale
// gaps in the tarmac from the saddle.
//
// Bends are closed by MITRING — each interior vertex uses the bisector of its
// two segments, so the surface is continuous with no overlap. Overlapping it
// instead (the obvious fix, and the one tried first) doubles the geometry at
// every bend and the two coplanar copies then fight for the depth buffer.
//
// Junctions are covered by extending the two ENDS of a way past its node, where
// overlapping a crossing road is unavoidable. Each road carries a deterministic
// sub-centimetre height offset so those overlaps have a stable winner instead of
// shimmering.
function ribbon(pts, width, y) {
  const g = new THREE.BufferGeometry();
  const pos = [], uv = [];
  const H = (x, z) => TERRAIN.at(x, z) + y;
  const half = width / 2;

  // drop repeated points, then work out each vertex's offset direction
  const raw = [];
  for (const q of pts) {
    if (!raw.length || Math.hypot(q[0] - raw[raw.length - 1][0], q[1] - raw[raw.length - 1][1]) > 0.01) {
      raw.push([q[0], q[1]]);
    }
  }
  if (raw.length < 2) return g;

  // SUBDIVIDE long segments so the tarmac follows the ground.
  //
  // A ribbon takes its height from the terrain at each centreline vertex and is
  // flat in between. OSM road vertices sit up to thirty metres apart and the
  // heightfield is bilinear over 35m cells, so wherever a road crosses a cell
  // with any curvature the ground rose straight through the tarmac: measured at
  // 16.6% of the whole road surface, worst case 4.9 METRES of hillside standing
  // in the middle of a carriageway. It reads as the road simply stopping.
  //
  // Three metres, more than ten times finer than the 35m heightfield, so the
  // ribbon tracks every cell it crosses. Measured: 16.6% of the road surface had
  // ground standing through it before, 0.05% at six metres, 0.01% at three, and
  // the worst case fell from 4.91m to 0.40m. It costs vertices on a layer that
  // is already one draw call and nothing measurable in frame rate.
  //
  // KEEP THIS IN STEP with the check in audit_world.js (P8), which reproduces
  // this subdivision to know where the drawn surface is.
  const STEP = 3;
  const p = [];
  for (let i = 0; i < raw.length - 1; i++) {
    const a = raw[i], c = raw[i + 1];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const n = Math.max(1, Math.ceil(L / STEP));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      p.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t]);
    }
  }
  p.push(raw[raw.length - 1]);

  const dir = [];
  for (let i = 0; i < p.length - 1; i++) {
    const dx = p[i + 1][0] - p[i][0], dz = p[i + 1][1] - p[i][1];
    const L = Math.hypot(dx, dz) || 1;
    dir.push([dx / L, dz / L]);
  }
  // push the two ends out past the node so junctions are covered
  const EXT = half * 1.1;
  p[0] = [p[0][0] - dir[0][0] * EXT, p[0][1] - dir[0][1] * EXT];
  const dl = dir[dir.length - 1];
  p[p.length - 1] = [p[p.length - 1][0] + dl[0] * EXT, p[p.length - 1][1] + dl[1] * EXT];

  // per-vertex offset: segment normal at the ends, mitred bisector between
  const off = [];
  for (let i = 0; i < p.length; i++) {
    const a = dir[Math.max(0, i - 1)], b = dir[Math.min(dir.length - 1, i)];
    let mx = -(a[1] + b[1]), mz = a[0] + b[0];
    const mL = Math.hypot(mx, mz);
    if (mL < 1e-4) { mx = -b[1]; mz = b[0]; }            // doubled back on itself
    else { mx /= mL; mz /= mL; }
    // the mitre has to reach further than the normal on a bend, but a hairpin
    // must not throw the corner out to infinity
    const cosHalf = Math.max(0.35, Math.abs(mx * -b[1] + mz * b[0]));
    const k = half / cosHalf;
    off.push([mx * k, mz * k]);
  }

  let run = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [x1, z1] = p[i], [x2, z2] = p[i + 1];
    const o1 = off[i], o2 = off[i + 1];
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.01) continue;
    const a = [x1 - o1[0], H(x1 - o1[0], z1 - o1[1]), z1 - o1[1]];
    const b = [x1 + o1[0], H(x1 + o1[0], z1 + o1[1]), z1 + o1[1]];
    const c = [x2 + o2[0], H(x2 + o2[0], z2 + o2[1]), z2 + o2[1]];
    const d = [x2 - o2[0], H(x2 - o2[0], z2 - o2[1]), z2 - o2[1]];
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
    // Ways overlap where they meet, and two carriageways at exactly the same
    // height speckle. A stable sub-centimetre offset per road, derived from its
    // own geometry, gives every overlap a consistent winner.
    const seed = Math.abs(Math.round(r.p[0][0] * 7 + r.p[0][1] * 13)) % 5;
    const y = isPath ? 0.02 : 0.055 + seed * 0.0012;
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

/* ---------------- the Angsana avenue, as one instanced field ---------------- */
//
// These are the most characteristic thing on Orchard Road and they were the
// most wrong thing in the world. The street is an Angsana avenue (Pterocarpus
// indicus, with Rain Trees mixed in): a dense DOME crown, wider than the tree
// is tall, on a stout trunk, with branches that spread nearly horizontally and
// then droop. NParks gives the crown as 12 to 34 metres across.
//
// What was here before was a 10 to 14 metre crown of thin scattered foliage on
// a bare 8 to 12 metre trunk, which reads as a palm, and read as a palm in
// every one of fourteen review frames. The fix is mostly proportion:
//
//   crown radius   5.2 - 7.2 m   ->   8.0 - 12.0 m   (16-24m across, in range)
//   crown depth    flat scatter  ->   dome, deepest at the centre
//   rim           level          ->   drooping, the Angsana's signature
//   trunk         0.24 / 0.52    ->   0.34 / 0.78, a stout bole
//   crown base    at 0.92 h      ->   from 0.52 h, so the canopy is a canopy
//
// Leaf cards scale WITH the crown radius, so a 1.7x wider crown is covered by
// the same 30 cards at 1.7x the size. Widening the trees costs no extra
// geometry; it costs fill rate, which is the right thing to spend it on.
//
// Every repeated thing is one InstancedMesh: as separate Groups this would be
// about ten draw calls per tree.
export class TreeField {
  constructor() { this.items = []; }
  add(x, z, scale = 1) { this.items.push([x, z, scale]); }
  build(world) {
    const n = this.items.length;
    if (!n) return 0;
    const CARDS = 40, BLOBS = 7, BRANCH = 5;
    const trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.30, 0.62, 1, 8), MAT.trunk, n);
    const branches = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.06, 0.22, 1, 5), MAT.trunk, n * BRANCH);
    const blobs = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0), MAT.canopy, n * BLOBS);
    const cards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 0.55), MAT.leaf, n * CARDS);
    trunks.castShadow = branches.castShadow = blobs.castShadow = cards.castShadow = true;

    const m = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion();
    const p = new THREE.Vector3(), sc = new THREE.Vector3();
    let bi = 0, li = 0, ci = 0;

    this.items.forEach(([x, z, scale], i) => {
      // total height and crown radius. A mature roadside Angsana is about as
      // wide as it is tall, which is what makes the avenue meet overhead.
      let h = rand(13.0, 17.5) * scale;
      const rad = rand(8.0, 12.0) * scale;
      const gy = TERRAIN.at(x, z);
      // where the crown starts, and how deep the dome is from top to rim
      let crownBase = h * rand(0.50, 0.60);
      // Lift the crown clear of the traffic envelope. A crown eight to twelve
      // metres across reaches well past the kerb, so on a smaller side-street
      // tree the limbs came down to about four metres over a live lane, which a
      // double-decker at 4.3m would take off. Real street trees are pruned up
      // for precisely this reason, so lift the whole crown rather than shrink
      // it, and grow the tree by the same amount so the dome keeps its depth.
      // 6.0, not 5.2. The branches jitter up to 0.4m BELOW the crown base, so a
      // 5.2m lift put the lowest limb at exactly 4.8m, sitting precisely on the
      // clearance the audit requires rather than clearing it. Any change in the
      // ground under a tree then tipped it over, and one did. Size the lift so
      // the lowest branch clears, not so the crown base does.
      const LIFT = 6.0;
      if (crownBase < LIFT) { h += LIFT - crownBase; crownBase = LIFT; }
      const crownTop = h;
      const domeDepth = crownTop - crownBase;

      p.set(x, gy + h * 0.5, z); q.identity(); sc.set(scale, h, scale);
      m.compose(p, q, sc); trunks.setMatrixAt(i, m);

      // Main limbs: they leave the bole low, run out almost flat, and the
      // Angsana's droop comes from tilting them back down past horizontal at
      // the tip. A steep branch reads as a conifer.
      //
      // They must also finish INSIDE the foliage. Set at a shallower tilt they
      // rose above the leaf layer and the tree read as a bare umbrella frame
      // with green clumped on the spokes, which was worse than the palm it
      // replaced. Two things keep them hidden: they are shorter than the crown
      // radius, and they carry no vertical lift, so the tip is never higher
      // than where the leaf cards sit.
      for (let k = 0; k < BRANCH; k++) {
        const a = (k / BRANCH) * Math.PI * 2 + rand(-0.35, 0.35);
        const L = rad * rand(0.40, 0.62);
        const tilt = rand(1.32, 1.52);          // radians from vertical: near flat
        p.set(x + Math.cos(a) * L * 0.42,
              gy + crownBase + rand(-0.4, 0.6),
              z + Math.sin(a) * L * 0.42);
        e.set(Math.cos(a) * tilt, 0, -Math.sin(a) * tilt);
        q.setFromEuler(e); sc.set(scale, L, scale);
        m.compose(p, q, sc); branches.setMatrixAt(bi++, m);
      }

      // Solid mass inside the dome so the crown is not see-through from below.
      // Sitting these at the centre and squashing them vertically is what makes
      // it read as one canopy rather than a cloud of separate leaves.
      for (let k = 0; k < BLOBS; k++) {
        const rr = rad * rand(0.0, 0.60);
        const a = R() * Math.PI * 2;
        const t = rr / rad;
        const r = rad * rand(0.26, 0.42);
        // spread them down through the crown, not just under its skin, so the
        // limbs below the leaf shell sit in foliage instead of in daylight
        p.set(x + Math.cos(a) * rr,
              gy + crownTop - domeDepth * (t * t * 0.8 + rand(0.05, 0.55)) - r * 0.30,
              z + Math.sin(a) * rr);
        q.identity(); sc.set(r, r * 0.52, r);
        m.compose(p, q, sc); blobs.setMatrixAt(li++, m);
      }

      // Leaf cards over the dome surface. The height falls off with the SQUARE
      // of the distance from the trunk, which is what makes a dome instead of a
      // disc, and the outermost cards get an extra drop for the droop.
      for (let k = 0; k < CARDS; k++) {
        const a = R() * Math.PI * 2;
        // Biased slightly inward of even-area coverage (which is sqrt). Even
        // coverage leaves the middle of the crown thin, and the middle is
        // exactly where the limbs are.
        const t = Math.pow(R(), 0.70);
        const rr = rad * t;
        const droop = domeDepth * t * t * 0.72 + t * t * t * rad * 0.30;
        p.set(x + Math.cos(a) * rr,
              gy + crownTop - droop + rand(-0.5, 0.5),
              z + Math.sin(a) * rr);
        // cards near the rim hang steeper, following the drooping branch
        e.set(rand(-1.5, -0.75) - t * 0.35, a + rand(-0.7, 0.7), rand(-0.4, 0.4));
        q.setFromEuler(e);
        const v = rad * rand(0.42, 0.72); sc.set(v, v, v);
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
  m.rotation.x = -Math.PI / 2; m.position.set(x, TERRAIN.at(x, z) + 0.17, z);
  world.add(m);
}

// The city beyond the district.
//
// Orchard Road sits in the middle of a dense city, but the world stops at the
// edge of the fetched bounding box: ride far enough and you are on an empty
// plain with a road running to the horizon. That reads as a bug even though
// every building inside the box is correct.
//
// This fills the surround with plain massing out to the far plane — no detail,
// no windows, one instanced mesh, and nothing inside the built area where the
// real buildings are. It is explicitly NOT a claim about what stands there: it
// is a horizon, the same way a matte painting is, and it is deliberately grey
// and featureless so it never reads as surveyed geometry.
export function buildSurround(world, data, reach = 470) {
  const built = [];
  for (const b of data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const p of b.p) {
      if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0];
      if (p[1] < mnz) mnz = p[1]; if (p[1] > mxz) mxz = p[1];
    }
    built.push([mnx, mnz, mxx, mxz]);
  }
  // The extent of the real district. Measured from the ROADS as well as the
  // buildings: the road network runs about 500m further out than the last
  // building, and sizing the surround to the buildings alone left the far tips
  // of the network standing on bare ground, which is the defect this is for.
  let dx0 = 1e9, dz0 = 1e9, dx1 = -1e9, dz1 = -1e9;
  for (const [a, b, c, d] of built) {
    if (a < dx0) dx0 = a; if (b < dz0) dz0 = b;
    if (c > dx1) dx1 = c; if (d > dz1) dz1 = d;
  }
  for (const r of (data.roads || [])) {
    for (const p2 of r.p) {
      if (p2[0] < dx0) dx0 = p2[0]; if (p2[0] > dx1) dx1 = p2[0];
      if (p2[1] < dz0) dz0 = p2[1]; if (p2[1] > dz1) dz1 = p2[1];
    }
  }

  const rnd = rng(20260727);
  const put = [];
  const CELL = 78;
  for (let x = dx0 - reach; x < dx1 + reach; x += CELL) {
    for (let z = dz0 - reach; z < dz1 + reach; z += CELL) {
      // Keep out of the BUILT core, where the real buildings are. The area
      // between the last building and the end of the road network is fair game:
      // that is real city in life, and empty ground here.
      let inCore = false;
      for (const [a, b, c, d] of built) {
        if (x > a - 70 && x < c + 70 && z > b - 70 && z < d + 70) { inCore = true; break; }
      }
      if (inCore) continue;
      if (rnd() > 0.72) continue;                       // not a solid carpet
      const jx = x + (rnd() - 0.5) * CELL * 0.6;
      const jz = z + (rnd() - 0.5) * CELL * 0.6;
      // taller nearer the middle of town, lower out at the fringes
      const away = Math.hypot(jx - (dx0 + dx1) / 2, jz - (dz0 + dz1) / 2);
      const fade = Math.max(0.25, 1 - away / (reach * 2.2));
      const bw = 22 + rnd() * 26, bd = 20 + rnd() * 24;
      // Never near a road. This is a horizon, and standing next to one shows it
      // for what it is: a featureless grey slab — anything you can ride up to
      // should be real geometry. Tested at the JITTERED position and against the
      // block's own footprint: testing the grid point left 48m-wide blocks
      // straddling carriageways 20m away.
      const keepOut = 40 + Math.max(bw, bd) / 2;
      if (window.__onRoad && window.__onRoad(jx, jz, keepOut)) continue;
      put.push([jx, jz, 16 + rnd() * 62 * fade, bw, bd, rnd() * Math.PI]);
    }
  }
  if (!put.length) return 0;

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: 0xa9a69c });
  const im = new THREE.InstancedMesh(geo, mat, put.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3();
  const cc = new THREE.Color();
  put.forEach(([x, z, h, w, d, yaw], i) => {
    p.set(x, TERRAIN.at(x, z) + h / 2, z);
    e.set(0, yaw, 0); q.setFromEuler(e);
    s.set(w, h, d);
    m.compose(p, q, s);
    im.setMatrixAt(i, m);
    // a narrow spread of greys, so it reads as haze-flattened distance
    const t = 0.86 + rnd() * 0.2;
    im.setColorAt(i, cc.setRGB(0.66 * t, 0.65 * t, 0.61 * t));
  });
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.castShadow = false;              // never in the shadow map: it is scenery
  im.receiveShadow = false;
  world.add(im);
  return put.length;
}
