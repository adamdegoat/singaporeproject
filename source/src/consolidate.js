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

const TILE = 110;

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
  if (o.geometry.attributes.position.count > 3000) return false;  // already a big batch
  return true;
}

export function consolidate(root) {
  root.updateMatrixWorld(true);

  const targets = [];
  root.traverse((o) => { if (bakeable(o)) targets.push(o); });

  const groups = new Map();
  for (const o of targets) {
    const p = o.getWorldPosition(new THREE.Vector3());
    const key = [
      Math.floor(p.x / TILE), Math.floor(p.z / TILE),
      o.material.uuid,
      o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0,
      o.renderOrder, o.frustumCulled ? 1 : 0,
    ].join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  }

  let merged = 0, removed = 0;
  for (const list of groups.values()) {
    if (list.length < 2) continue;               // nothing to gain

    const parts = [];
    let total = 0;
    for (const o of list) {
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      if (!g.attributes.normal) g.computeVertexNormals();
      parts.push(g);
      total += g.attributes.position.count;
    }

    const pos = new Float32Array(total * 3);
    const nor = new Float32Array(total * 3);
    const uv = new Float32Array(total * 2);
    let o3 = 0, o2 = 0;
    for (const g of parts) {
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array, o3);
      if (g.attributes.normal) nor.set(g.attributes.normal.array, o3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, n * 2), o2);
      o3 += n * 3; o2 += n * 2;
      g.dispose();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeBoundingSphere();

    const first = list[0];
    const mesh = new THREE.Mesh(geo, first.material);
    mesh.userData.tileBatch = true;   // the LOD pass culls far tiles of small detail
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
export function pruneCarriageway(root, onRoad, groundAt) {
  const v = new THREE.Vector3();
  const doomed = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const pos = o.geometry.attributes.position;
    if (!pos) return;
    // a merged tile is many buildings at once and must not be judged as one
    if (pos.count > 6000) return;
    const gp = o.geometry.parameters || {};
    // anything this wide spans the street on purpose: canopies over a forecourt,
    // ION's shell, a porte-cochere
    if (Math.max(gp.width || 0, gp.depth || 0, (gp.radiusTop || 0) * 2) > 12) return;

    const step = Math.max(1, Math.floor(pos.count / 60));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const up = v.y - groundAt(v.x, v.z);
      // Up to the height P1b judges, not just rider height. Most of the backlog
      // was never something you would hit: it was cladding, trim courses and
      // fascia bands sitting four to eight metres up and hanging over the
      // carriageway, which is wrong to look at even if you can ride under it.
      if (up < 0.3 || up > 8.5) continue;
      if (onRoad(v.x, v.z, -1.0)) { doomed.push(o); return; }
    }
  });
  for (const o of doomed) {
    if (o.parent) o.parent.remove(o);
    o.geometry.dispose();
  }
  return doomed.length;
}
