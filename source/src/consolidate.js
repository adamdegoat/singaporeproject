// One pass over the finished world that collapses small static meshes.
//
// The district is built by a dozen independent modules, each adding meshes as
// it goes. That is the right way to write them, but it leaves thousands of
// tiny objects on screen: 1,018 signboards holding 1,018 separate materials
// that wrap only 58 textures between them, 1,300 lamp posts sharing 4
// materials and still costing 1,300 draws. Rather than teach every builder to
// batch, fix it once here, after the fact.
//
// Two steps:
//   1. dedupe materials  — identical descriptors become one instance, so the
//                          meshes using them can share a batch at all
//   2. merge by tile     — meshes with the same material and the same 110m
//                          tile become one mesh
//
// Tiles matter. Merging the district into a handful of giant meshes is worse
// than not merging: a mesh spanning the whole map is never frustum-culled, so
// every triangle in it draws no matter which way you face.
import * as THREE from '../lib/three.module.js';
import { TOUCH } from './input.js';

// TILE SIZE IS THE PHONE'S FRAME RATE, and 110 was costing a quarter of it.
//
// The user's phone starts at 60fps and settles at ~30 after a few minutes. His
// two HUD readings at the fast and slow moments are identical in every quantity
// -- 1,907k vs 1,897k triangles, 740 vs 761 draws, same resolution -- so the
// work never changed and the phone is THERMALLY THROTTLING. `?dpr=1` (2.25x
// fewer pixels) changed nothing for him either, which rules out fill rate and
// leaves the CPU: JS plus draw-call submission.
//
// So draw calls are the lever, and tile size is what sets them. Measured at
// 844x390, TOUCH forced, 4x CPU throttle, scene=world:
//
//     tile 110m   19 fps   1,903k tris   723 draws     <- was
//     tile 170m   21 fps   1,908k tris   690 draws
//     tile 240m   24 fps   1,912k tris   638 draws     <- knee
//     tile 320m   23 fps   1,914k tris   614 draws
//     tile 420m   23 fps   1,925k tris   624 draws
//
// +26% frame rate for 0.5% more triangles, and NOTHING LOOKS DIFFERENT --
// consolidation only decides how meshes are grouped. Coarser frustum culling
// costs almost nothing here because the city is dense in every direction
// anyway: 1,888k of the 1,903k triangles are already within 320m of the rider.
// Boot is unchanged (9.2s vs 9.0s), which was the risk worth checking -- a
// bigger merge is a longer uninterrupted call, see the freeze note below.
//
// Desktop stays at 110: it is not draw-call bound, so the trade buys nothing
// there and finer culling is the better default. ?tile=N overrides both.
const TILE = +new URLSearchParams(location.search).get('tile') || (TOUCH ? 240 : 110);
// THE TWO BATCHING KNOBS, MEASURED ON THE ISLAND 2026-08-23 at the coverage
// sweep's worst view (Tanjong Beach Walk, -885/13290) with touch forced —
// the deploy gate only ever reads the SPAWN frame, and spawn was 237 draws
// while that view was 1,630 against a 680 budget.
//
//   flatten  vcap  csmall   spawn          Tanjong Beach Walk
//   off      3000  2        245d/ 690k     1630d/1445k   <- shipped until now
//   on       3000  2        171d/ 692k     1093d/1479k
//   on       3000  6        196d/ 842k      781d/1559k
//   on       3000 12        196d/ 941k      699d/1629k
//   on       3000 20        190d/ 956k      682d/1642k   <- TAKEN
//   on       3000 32        192d/1008k      672d/1652k   knee passed
//   on       3000 48        191d/1056k      661d/1655k
//   on      20000  2        155d/ 719k      951d/1484k
//   on      20000  6        180d/ 896k      646d/1577k   REJECTED, see below
//
// csmall costs TRIANGLES to buy DRAWS — a coarse batch carries geometry that
// is off screen — and it costs ZERO pixels: an A/B at csmall 2 vs 6 moved
// not one golden frame. Past 20 the curve is flat (11 more draws for another
// 50k triangles at spawn), so 20 is the knee. Spawn triangles rise 690k ->
// 956k, which is real and comes out of the asset headroom; it buys the worst
// view going from 1,630 draws to 682, and on this device draw submission is
// the phone's bottleneck (the owner's own report: ?dpr=1 changed nothing,
// which ruled out fill rate).
//
// VCAP WAS TRIED AT 20000 AND REJECTED ON THE PICTURE, not on the numbers.
// Letting meshes of 3000-20000 vertices bake is worth another ~135 draws at
// the worst view, and it visibly RUINS the big low-poly boulders: at skypark
// the rock facets collapse from a dozen distinctly-lit planes into a nearly
// uniform blob (golden skypark moved 10.9%, eyeballed side by side at 3x).
// Whatever the mechanism — three candidates were measured and disproved:
// negative-determinant mirroring (there are ZERO in the scene), Int8 normal
// packing (an A/B with Float32 moved MORE frames, because it also un-blesses
// the meshes that were already baked), and shiny Standard materials — the
// trade is a worse-looking island for 8% fewer draws, so it is not taken.
// Left at 3000. If someone finds the mechanism, this is worth revisiting.
//
// csmall 6 is the last row where BOTH budgets hold at the worst view. TILE
// is deliberately NOT touched: its 110/240 split carries a real measured
// table from July (+26% fps on a throttled phone) and re-tuning it needs a
// real device, which this environment is not — a 4x-throttled headless run
// read 0.74 / 0.63 / 0.75 / 0.25 fps across four configs, which is noise, not
// evidence. Left as the next session's lever.
const VCAP = +new URLSearchParams(location.search).get('vcap') || 3000;
const CSMALL = +new URLSearchParams(location.search).get('csmall') || 20;

// Everything that changes how a material renders. Two materials with the same
// signature are interchangeable, so one can stand in for all of them.
function sig(m) {
  return [
    m.type,
    m.color ? m.color.getHexString() : '-',
    m.map ? m.map.uuid : '-',
    m.emissive ? m.emissive.getHexString() : '-',
    m.emissiveIntensity ?? '-', m.emissiveMap ? m.emissiveMap.uuid : '-',
    m.roughness ?? '-', m.metalness ?? '-',
    m.roughnessMap ? m.roughnessMap.uuid : '-',
    m.normalMap ? m.normalMap.uuid : '-',
    m.alphaMap ? m.alphaMap.uuid : '-',
    m.envMap ? m.envMap.uuid : '-', m.envMapIntensity ?? '-',
    m.transparent ? 1 : 0, m.opacity, m.alphaTest,
    m.side, m.depthWrite ? 1 : 0, m.depthTest ? 1 : 0,
    m.blending, m.vertexColors ? 1 : 0, m.flatShading ? 1 : 0,
    m.toneMapped ? 1 : 0, m.fog ? 1 : 0, m.wireframe ? 1 : 0,
  ].join('|');
}

// CHEAPEN THE SHADER ON PHONES, WHICH IS WHERE THE HEAT IS.
//
// MeshStandardMaterial is physically-based: roughness, metalness and an
// environment term evaluated PER PIXEL. MeshLambertMaterial lights per vertex
// and is several times cheaper to shade. Measured in chinatown: 2,337 distinct
// materials, of which 1,359 are matte Standard — plaster, concrete, tarmac,
// kerbs, tile — and 618 are genuinely shiny.
//
// On a fill-rate-bound device that difference is most of the GPU cost, and
// sustained GPU cost is what makes a phone hot: the rider's report was "after
// play short time heat up already". A matte surface under one directional
// light looks near-identical either way; glass, polished metal and water do
// not, so anything with metalness, a low roughness, transparency or an
// environment map is LEFT ALONE.
//
// PHONE ONLY, deliberately. The desktop keeps the richer picture, and — just
// as important — every vet frame and every gate is taken on desktop, so the
// world the checks judge is unchanged by this.
//
// Converted materials keep their `name`, because several checks identify
// geometry by it (busLane, centreLine, streetLamp, quayCrane, bridgeDeck).
export function lambertise(root, THREE) {
  const swap = new Map();
  let done = 0, kept = 0;
  const conv = (m) => {
    if (!m || m.type !== 'MeshStandardMaterial') return m;
    if (swap.has(m.uuid)) return swap.get(m.uuid);
    const shiny = (m.metalness || 0) > 0.05
      || (m.roughness !== undefined && m.roughness < 0.7)
      || m.envMap || m.transparent;
    if (shiny) { kept++; return m; }
    const l = new THREE.MeshLambertMaterial({
      color: m.color, map: m.map || null,
      emissive: m.emissive, emissiveIntensity: m.emissiveIntensity,
      side: m.side, opacity: m.opacity, alphaTest: m.alphaTest,
      vertexColors: m.vertexColors, fog: m.fog,
    });
    l.name = m.name;
    // AND ITS CUSTOM SHADER, WHICH THIS SILENTLY THREW AWAY.
    //
    // The ground's procedural detail is injected through onBeforeCompile on a
    // Standard material. This function rebuilt it as Lambert and copied only
    // the uniforms a constructor takes, so the hook was dropped and the whole
    // island rendered as one flat untextured colour — on EVERY device, because
    // this runs everywhere despite the phone-only reasoning above it. Editing
    // the ground shader then changed nothing at all, which is what sent the
    // hunt for "a giant blank untextured mass" off into the geometry twice.
    //
    // Both materials' shaders include <begin_vertex> and <color_fragment>, so
    // a hook written against one compiles against the other unchanged.
    if (m.onBeforeCompile) {
      l.onBeforeCompile = m.onBeforeCompile;
      // distinct cache key, or three.js reuses the un-hooked program
      if (m.customProgramCacheKey) l.customProgramCacheKey = m.customProgramCacheKey;
      else l.customProgramCacheKey = () => 'hooked:' + (m.name || m.uuid);
    }
    swap.set(m.uuid, l);
    done++;
    return l;
  };
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    if (Array.isArray(o.material)) o.material = o.material.map(conv);
    else o.material = conv(o.material);
  });
  return { lambertised: done, keptStandard: kept };
}

// COLOUR IS THE REASON THE ISLAND DRAWS 1,630 TIMES AT TANJONG BEACH.
//
// consolidate() merges meshes that share a material AND a tile. Measured at
// the sweep's worst view (2026-08-23): 1,585 meshes in frustum wearing 469
// DISTINCT MATERIALS — 292 of them flat untextured Lambert covering 1,023 of
// those meshes, differing from each other by nothing but a colour hex
// (#928b7e, #8a8377, #b0a898, #a9a498 ... the island's wall greys). No tile
// size can fix that: raising TILE from 240 to 640 only took the view from
// 1,630 draws to 1,166, because the groups were never split by geometry in
// the first place. They were split by paint.
//
// So take the colour out of the material and put it in the mesh. A flat
// colour baked into a per-vertex colour attribute, with one shared
// `vertexColors: true` material standing in for all of them, renders
// IDENTICALLY — three's Lambert shader does `diffuseColor.rgb *= vColor`, so
// white * colour is the colour — and it lets the existing tile merge collapse
// a thousand meshes into a handful of draws. The merge already carries a
// colour attribute through (see the note in consolidate); this pass is what
// gives it one to carry.
//
// WHAT IS DELIBERATELY LEFT ALONE:
//   * anything textured, transparent, or carrying an onBeforeCompile hook —
//     the ground's procedural shader lives on one of those, and lambertise()
//     already paid for dropping it once.
//   * anything not `bakeable()`: instanced, skinned, dyn-flagged, or already
//     a big batch. Those never merge, so a colour attribute would be pure
//     memory for no draw saved.
//   * the material NAME is part of the bucket key. Several checks identify
//     geometry by it (busLane, centreLine, streetLamp, quayCrane,
//     bridgeDeck) and lambertise() guards the same thing — collapsing two
//     differently-named materials together would blind those checks.
//
// Vertex colours are consumed LINEAR (the stage-1 washed-pastel lesson), and
// Color.r/g/b are already the working-space components three hands the
// shader, so they are copied straight across with no conversion.
export function flattenFlatColours(root, THREE) {
  const shared = new Map();
  let flattened = 0, verts = 0;
  // `!m.onBeforeCompile` IS ALWAYS FALSE. three.js defines the hook as a
  // no-op on Material.prototype, so every material has one and the first
  // version of this predicate matched NOTHING — the pass ran, reported
  // nothing flattened, and the draw counts did not move by a single call.
  // A hooked material is one that does not inherit the prototype's.
  const DEFAULT_HOOK = THREE.Material.prototype.onBeforeCompile;
  // Standard and Phong are in as well as Lambert. lambertise() only converts
  // MATTE Standard — anything shiny stays Standard on purpose — and at the
  // worst view those shiny leftovers were still 60 materials over 213 meshes.
  // They flatten exactly the same way; the shading terms that make them
  // shiny just have to be part of the bucket key below, not thrown away.
  const TYPES = new Set(['MeshLambertMaterial', 'MeshBasicMaterial',
    'MeshStandardMaterial', 'MeshPhongMaterial']);
  const flat = (m) => !!m && TYPES.has(m.type)
    && !m.map && !m.emissiveMap && !m.alphaMap && !m.normalMap && !m.roughnessMap
    && !m.metalnessMap && !m.aoMap && !m.lightMap && !m.specularMap
    && !m.envMap && !m.transparent && !m.vertexColors
    && m.onBeforeCompile === DEFAULT_HOOK
    && (!m.emissive || m.emissive.getHex() === 0);
  root.traverse((o) => {
    if (!bakeable(o)) return;
    const m = o.material;
    if (!flat(m)) return;
    const key = [m.type, m.name || '-', m.side, m.opacity, m.alphaTest,
      m.depthWrite ? 1 : 0, m.depthTest ? 1 : 0, m.blending,
      m.flatShading ? 1 : 0, m.toneMapped ? 1 : 0, m.fog ? 1 : 0,
      m.wireframe ? 1 : 0,
      // everything that makes a surface shine: two materials only share a
      // batch if the light does the same thing to both of them
      m.roughness ?? '-', m.metalness ?? '-', m.envMapIntensity ?? '-',
      m.shininess ?? '-', m.specular ? m.specular.getHexString() : '-',
      m.reflectivity ?? '-'].join('|');
    let sm = shared.get(key);
    if (!sm) {
      sm = m.clone();
      sm.color.setRGB(1, 1, 1);
      sm.vertexColors = true;
      sm.name = m.name;
      shared.set(key, sm);
    }
    const n = o.geometry.attributes.position.count;
    const c = new Float32Array(n * 3);
    const { r, g, b } = m.color;
    for (let i = 0; i < n; i++) { c[i * 3] = r; c[i * 3 + 1] = g; c[i * 3 + 2] = b; }
    o.geometry.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    o.material = sm;
    flattened++; verts += n;
  });
  return { flattened, shared: shared.size, verts };
}

export function dedupeMaterials(root) {
  const canon = new Map();
  // sig() builds a 25-field string; computed per MESH it ran 7,000+ times
  // for ~1,200 distinct materials, a measurable slice of the boot's
  // dedupe+consolidate second. A material's signature cannot change between
  // meshes in one pass, so it is cached by uuid.
  const sigCache = new Map();
  const sigOf = (m) => {
    let s = sigCache.get(m.uuid);
    if (s === undefined) { s = sig(m); sigCache.set(m.uuid, s); }
    return s;
  };
  let before = new Set(), after = new Set();
  root.traverse((o) => {
    if (!o.isMesh && !o.isPoints && !o.isLine) return;
    if (Array.isArray(o.material)) { o.material.forEach((m) => before.add(m.uuid)); return; }
    const m = o.material;
    if (!m) return;
    before.add(m.uuid);
    // A material that gets repainted at runtime must stay private to its mesh.
    // Traffic light lenses look identical at boot (all unlit) and would collapse
    // into three shared materials, after which every junction on the street
    // would change colour together.
    if (o.userData && o.userData.dyn) { after.add(m.uuid); return; }
    // instanceColor tints per instance, so those materials are not interchangeable
    if (o.isInstancedMesh && o.instanceColor) { after.add(m.uuid); return; }
    const k = sigOf(m);
    if (!canon.has(k)) canon.set(k, m);
    else o.material = canon.get(k);
    after.add(o.material.uuid);
  });
  return { before: before.size, after: after.size };
}

// A mesh is safe to bake into a shared buffer only if nothing will move it or
// repaint it later. Builders flag the exceptions with userData.dyn.
function bakeable(o) {
  if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return false;
  if (o.userData && o.userData.dyn) return false;
  if (Array.isArray(o.material) || !o.material) return false;
  if (!o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return false;
  if (o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length) return false;
  if (o.children.length) return false;           // keep parents, they carry children
  // ALREADY A BIG BATCH — but 3000 was never measured against this island.
  // At the sweep's worst view 147 meshes clear the old cap and cost 147 draws
  // for 384k triangles, which is the worst draws-per-triangle ratio in the
  // frame. The tile key bounds how far a batch can span whatever this is set
  // to, so the only real cost of raising it is a longer merge. ?vcap=N.
  if (o.geometry.attributes.position.count > VCAP) return false;
  return true;
}

// TAKES A YIELD FUNCTION. This merges every mesh in a district by material and
// tile, and on a big district it is one uninterrupted call — a 500ms freeze two
// seconds after the loading screen clears, which is exactly what the rider
// feels as "stuck". The work cannot be made much smaller, but it can be spread:
// the group loop is where nearly all of it goes, so that is where it breathes.
// Y is optional so every existing caller keeps working unchanged.
export async function consolidate(root, Y = null) {
  root.updateMatrixWorld(true);

  const targets = [];
  root.traverse((o) => { if (bakeable(o)) targets.push(o); });
  // the matrix update + traverse + grouping above/below ran as one unyielded
  // prefix before the merge loop's own pacing began
  if (Y) await Y();

  const groups = new Map();
  const _wp = new THREE.Vector3();
  for (const o of targets) {
    // Tile by where the GEOMETRY is, not where the object's origin is. Many
    // builders write world-space vertices into a mesh parked at (0,0,0), so
    // keying on getWorldPosition put every such mesh in tile 0,0 — measured
    // 2026-08-23: 160 "tile" batches with bounding radii of 400-2961m, all
    // origin-anchored, carrying 939k of the 916k drawn tile triangles. A
    // batch spanning the island is never frustum-culled, which defeats the
    // whole point of tiling (see the header note).
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const p = _wp.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld);
    const key = [
      Math.floor(p.x / TILE), Math.floor(p.z / TILE),
      o.material.uuid,
      o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0,
      o.renderOrder, o.frustumCulled ? 1 : 0,
    ].join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  }

  // Second pass, coarser: geometry-true tiling leaves thousands of SINGLETON
  // groups (one bench per tile, one sign per tile...) that the old origin
  // keying used to sweep into the giant batches — measured 2026-08-23: fixing
  // the key alone took the spawn frame 1670k->778k tris but 249->370 draws.
  // Singletons re-group at 5x the tile and merge there: still coarse enough
  // to frustum-cull as a block, small enough never to span the island. It is
  // also what keeps the batch draw order close to the blessed look — an A/B
  // with this pass off moved pixels in 31 of 43 goldens (z-fight winners on
  // coplanar trim re-rolled); with it on, 13 frames of edge noise, eyeballed
  // and re-blessed. ?nocoarse disables for A/B.
  // SMALL GROUPS, not just singletons. The original test was `length >= 2`,
  // i.e. only a group of one went to the coarse tier. But a tile holding
  // three benches is the same problem as a tile holding one: it is a draw
  // call for almost no triangles. CSMALL is the size below which a group is
  // better off merged coarsely. ?csmall=N to A/B.
  const coarse = new Map();
  for (const [key, list] of (new URLSearchParams(location.search).has('nocoarse') ? [] : groups)) {
    if (list.length >= CSMALL) continue;
    groups.delete(key);
    const parts = key.split(',');
    parts[0] = Math.floor(+parts[0] / 5); parts[1] = Math.floor(+parts[1] / 5);
    const ck = parts.join(',');
    if (!coarse.has(ck)) coarse.set(ck, []);
    for (const o of list) coarse.get(ck).push(o);
  }
  for (const [ck, list] of coarse) groups.set('c' + ck, list);

  let merged = 0, removed = 0;
  let _ct = performance.now();
  for (const list of groups.values()) {
    if (Y && performance.now() - _ct > 6) { await Y(); _ct = performance.now(); }
    if (list.length < 2) continue;               // nothing to gain

    const parts = [];
    let total = 0;
    // vertices per provenance label, tallied while the sources are still here
    // to be asked — see the kindVerts note at the mesh below
    const kinds = {};
    for (const o of list) {
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      if (!g.attributes.normal) g.computeVertexNormals();
      parts.push(g);
      const n = g.attributes.position.count;
      total += n;
      const k = o.userData.kind || '-';
      kinds[k] = (kinds[k] || 0) + n;
    }

    // VERTEX COLOUR SURVIVES THE MERGE.
    //
    // This copied position, normal and uv and silently dropped everything else.
    // The moment the ground started carrying its green space as vertex colour,
    // every park in the world vanished the instant consolidate() ran — the raw
    // scene showed 12,032 tinted vertices and the shipped one showed a mesh
    // with no colour attribute at all. A merge that drops an attribute it does
    // not recognise is a merge that decides what the world is allowed to have.
    //
    // Batched by material, and `vertexColors` is part of the material key, so
    // every part in a batch either has colour or none does; the fallback fills
    // white, which multiplies to no change.
    // ...AND SO DOES THE PAVING FLAG, for exactly the reason written above.
    // The note about colour ends "a merge that drops an attribute it does not
    // recognise is a merge that decides what the world is allowed to have",
    // and then the fix was applied to colour ALONE. `aPaved` (terrain.js, the
    // slab joints) is the next attribute that had to come through here, and it
    // did not: the ground kept its colour, lost its paving byte, and the slab
    // grid drew on nothing anywhere in the world while the shader that draws
    // it compiled perfectly. Carried the same way, one byte a vertex.
    const anyCol = parts.some((g) => g.attributes.color);
    const anyPav = parts.some((g) => g.attributes.aPaved);
    const pos = new Float32Array(total * 3);
    const nor = new Float32Array(total * 3);
    const uv = new Float32Array(total * 2);
    const col = anyCol ? new Float32Array(total * 3) : null;
    const pav = anyPav ? new Uint8Array(total) : null;
    let o3 = 0, o2 = 0;
    for (const g of parts) {
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array, o3);
      if (g.attributes.normal) nor.set(g.attributes.normal.array, o3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, n * 2), o2);
      if (col) {
        if (g.attributes.color) col.set(g.attributes.color.array.subarray(0, n * 3), o3);
        else col.fill(1, o3, o3 + n * 3);
      }
      // a part with no flag is not paved — 0 is the same answer the missing
      // attribute would have given the shader, so nothing changes for it
      if (pav && g.attributes.aPaved) pav.set(g.attributes.aPaved.array.subarray(0, n), o3 / 3);
      o3 += n * 3; o2 += n * 2;
      g.dispose();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    // NORMALS PACKED TO INT8. Measured on the phone profile: geometry is
    // 91.7MB and NORMALS ARE 31.7MB OF IT — exactly as much as positions —
    // against a heap of ~347MB and an iOS ceiling near 206MB. A unit vector
    // does not need 32-bit floats per axis; normalised Int8 is 3 bytes
    // instead of 12 and is what glTF quantisation has used for years.
    //
    // Vetted, not assumed: the same three viewpoints were rendered before
    // and after (beach walk, Resorts World, deep forest) and compared,
    // because the failure mode of this change is banded or blotchy shading
    // across the whole island rather than an error anybody would catch.
    const _n8 = new Int8Array(nor.length);
    for (let i = 0; i < nor.length; i++) {
      const v = nor[i];
      _n8[i] = Math.max(-127, Math.min(127, Math.round(v * 127)));
    }
    geo.setAttribute('normal', new THREE.Int8BufferAttribute(_n8, 3, true));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    // COLOUR PACKED TO UINT16, for the same reason normals are packed to
    // Int8 above. flattenFlatColours() moves the island's wall greys out of
    // 292 materials and into a per-vertex attribute, and that attribute is
    // real memory: measured with a forced-GC A/B, three runs each, +15 MB
    // (242/242/242 -> 257/257/257). The live island settles near a ~206 MB
    // iOS ceiling, so 15 MB is not free. Float32 is 12 bytes a vertex for a
    // value that started life as a 24-bit hex; normalised Uint16 is 6, half
    // the memory, and its 1/65535 step is ~0.004 of a 0-255 channel — three
    // orders below the golden comparer's 0.1 threshold, so nothing moves.
    if (col) {
      const c16 = new Uint16Array(col.length);
      for (let i = 0; i < col.length; i++) {
        c16[i] = Math.max(0, Math.min(65535, Math.round(col[i] * 65535)));
      }
      geo.setAttribute('color', new THREE.Uint16BufferAttribute(c16, 3, true));
    }
    if (pav) geo.setAttribute('aPaved', new THREE.Uint8BufferAttribute(pav, 1, true));
    geo.computeBoundingSphere();

    const first = list[0];
    const mesh = new THREE.Mesh(geo, first.material);
    mesh.userData.tileBatch = true;   // the LOD pass culls far tiles of small detail
    // PROVENANCE, CARRIED WITHOUT CHANGING WHAT MERGES WITH WHAT.
    //
    // A merged mesh has no name, no primitive type and a material it shares
    // with whatever else wears it, so after this pass nothing can ask "is this
    // batch buildings?" without sniffing — the trap `tacheck`'s A8 fell into.
    // The builders that KNOW now label what they emit (`userData.kind`, see
    // Merger's constructor note) and the label is carried through here.
    //
    // IT IS NOT PART OF THE GROUP KEY, and that was tried first: keying on it
    // splits batches that used to merge, and it cost 613 -> 638 draws and
    // 1716k -> 1732k triangles at the five hot views (measured 2026-08-31)
    // against a 1750k budget already 98% used. It also moved golden
    // `rws-roofs` by 1.05% — same geometry, same material, same face normals
    // at the moved pixels, only the batch around them different — a mechanism
    // that was never explained, and an unexplained pixel change is not worth
    // paying draws for.
    //
    // So a batch records what went INTO it instead: `kindVerts` counts
    // vertices per label, and a consumer asks whether a batch is ALL one thing
    // rather than being told it is. Costs nothing and cannot lie: a mixed
    // batch reports itself mixed instead of taking its first part's word.
    // an all-unlabelled batch says nothing, so it carries nothing
    if (!(Object.keys(kinds).length === 1 && kinds['-'])) mesh.userData.kindVerts = kinds;
    mesh.castShadow = first.castShadow;
    mesh.receiveShadow = first.receiveShadow;
    mesh.renderOrder = first.renderOrder;
    mesh.frustumCulled = first.frustumCulled;
    mesh.matrixAutoUpdate = false;
    root.add(mesh);
    merged++;

    for (const o of list) {
      if (o.parent) o.parent.remove(o);
      o.geometry.dispose();
      removed++;
    }
  }

  // drop groups left empty by the pass, so traversal stays cheap
  const empties = [];
  root.traverse((o) => {
    if (o !== root && o.isGroup && o.children.length === 0) empties.push(o);
  });
  for (const g of empties) if (g.parent) g.parent.remove(g);

  return { candidates: targets.length, merged, removed, groupsDropped: empties.length };
}

// Rendering the shadow map is a second pass over the whole caster set, and it
// costs more than anything else in the frame. Most of the casters are things
// whose shadow nobody can see: kerbs, road markings, bin lids, name plates,
// the plinths under bollards. Anything shorter than a person keeps its
// received shading but stops being drawn into the shadow map.
export function trimShadowCasters(root, minHeight = 3.0) {
  const bb = new THREE.Box3();
  let dropped = 0, kept = 0;
  root.traverse((o) => {
    if (!o.isMesh || !o.castShadow) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    bb.copy(o.geometry.boundingBox);
    const h = (bb.max.y - bb.min.y) * Math.abs(o.scale.y || 1);
    if (h < minHeight) { o.castShadow = false; dropped++; } else kept++;
  });
  return { dropped, kept };
}

// Remove building and landmark geometry that stands in a carriageway.
//
// The recipes place masses by offsets from a footprint's oriented bounding box,
// and for an irregular plan that box lies outside the walls — which is how seven
// 79m facade fins came to stand across Orchard Road. Guarding each recipe
// individually kept missing paths: cones, shells, ribs, crowns and columns are
// all placed directly. So this runs once over everything the building pass just
// added, which is a complete and checkable scope, rather than trusting a dozen
// call sites to remember.
//
// Run it immediately after buildBuildings and before any street furniture, so
// the only things present are buildings. Vehicles, gantries and overhead bridges
// are added later and are never seen by this.
//
// That scope is also its limit: the street furniture built afterwards — traffic
// signal poles, arms, heads and lenses — is outside its reach, and those make up
// most of what P1b still counts. Widening the pass to run later would mean
// re-deciding, for every kind of furniture, what is allowed to sit over a road,
// which is the allowlist problem again rather than a prune problem.
// ASYNC. Measured at 133ms of solid freeze while the rider is moving, which is
// four dropped frames on a phone. It walks every mesh in the district testing
// whether it stands in a carriageway, and did all of them without a pause.
export async function pruneCarriageway(root, onRoad, groundAt, Y = null) {
  const v = new THREE.Vector3();
  const doomed = [];
  root.updateMatrixWorld(true);
  // traverse() cannot be paused from inside its callback, so collect first.
  const list = [];
  root.traverse((o) => { if (o.isMesh && !o.isInstancedMesh) list.push(o); });
  let _pt = performance.now();
  for (const o of list) {
    if (Y && performance.now() - _pt > 6) { await Y(); _pt = performance.now(); }
    const pos = o.geometry.attributes.position;
    if (!pos) continue;
    // a merged tile is many buildings at once and must not be judged as one
    if (pos.count > 6000) continue;
    const gp = o.geometry.parameters || {};
    // anything this wide spans the street on purpose: canopies over a forecourt,
    // ION's shell, a porte-cochere
    if (Math.max(gp.width || 0, gp.depth || 0, (gp.radiusTop || 0) * 2) > 12) continue;
    // A WHOLE BUILDING MASS MEETS ROADS ON PURPOSE. The widened Sentosa box
    // brought resort-interior service roads that thread THROUGH their own
    // hotels' mapped rings (a drop-off is a road through a building), and one
    // clipped vertex doomed the ENTIRE mass: Equarius Hotel (5,857 m2), Beach
    // Arrival Plaza and two more stood invisible while their collision
    // stayed — the owner rode into them ("buildings on map but invisible").
    // Extruded masses carry no geometry.parameters, so the primitive-width
    // exemption above never reached them: measure the world bbox instead.
    // Small fittings (fins, trim, bollard-scale pieces) stay prunable.
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox;
    if ((bb.max.x - bb.min.x) * (bb.max.z - bb.min.z) > 250) continue;

    const step = Math.max(1, Math.floor(pos.count / 60));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const up = v.y - groundAt(v.x, v.z);
      // Up to the height P1b judges, not just rider height. Most of the backlog
      // was never something you would hit: it was cladding, trim courses and
      // fascia bands sitting four to eight metres up and hanging over the
      // carriageway, which is wrong to look at even if you can ride under it.
      if (up < 0.3 || up > 8.5) continue;
      if (onRoad(v.x, v.z, -1.0)) { doomed.push(o); break; }
    }
  }
  for (const o of doomed) {
    // THE OTHER HALF OF THE GHOST BUG: pruning removed the DRAWN mesh while
    // the data footprint kept blocking in colGrid — an invisible wall by
    // construction. Record where each doomed mesh stood so the caller can
    // release its collision too.
    if (!window.__prunedAt) window.__prunedAt = [];
    const bb2 = new THREE.Box3().setFromObject(o);
    window.__prunedAt.push([(bb2.min.x + bb2.max.x) / 2, (bb2.min.z + bb2.max.z) / 2]);
    if (o.parent) o.parent.remove(o);
    o.geometry.dispose();
  }
  return doomed.length;
}
