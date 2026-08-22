// STAGE 2 of the pack restyle (owner-approved direction, 2026-08-22):
// ground life along the walked paths — flower clumps, grass tufts, small
// plants scattered beside footway verges. Placement is fully deterministic
// from position hashes (no shared-RNG involvement), and every candidate
// passes the caller's blocked() guard plus the water/footprint chokepoint
// guards, the same rules every planting pass obeys.
import * as THREE from '../lib/three.module.js';
import { QGROUND } from './qground_data.js';

const geoCache = new Map();
function geoFor(name) {
  if (geoCache.has(name)) return geoCache.get(name);
  const d = QGROUND[name];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(d.c, 3));
  g.setIndex(d.i);
  g.computeVertexNormals();
  geoCache.set(name, g);
  return g;
}

// batch 10: fern + tall grass join, and the flowers grow to FIVE bright
// recolors of the proven model (the atlas clump pack was tried and
// REJECTED — its gradient atlas bakes muddy; glbground.py records it).
// Same placement hash, richer draw.
const KINDS = [[0.20, 'grass', 0.5], [0.32, 'tallgrass', 0.55],
               [0.44, 'plant', 0.55], [0.56, 'fern', 0.5],
               [0.66, 'flowerP', 0.55], [0.76, 'flowerG', 0.5],
               [0.85, 'flowerW', 0.5], [0.93, 'flowerB', 0.5],
               [1.01, 'flowerR', 0.5]];

// Walk the footway segments; every ~11m of arc, offset to one verge and, if
// every guard passes, place one clump. `blocked` is plantSurveyed's own
// blocked() (roads, buildings, water); the window guards cover the rest.
export function scatterVerges(world, trailSegs, blocked, groundAt) {
  const spots = [];
  let acc = 0;
  for (const [ax, az, bx, bz] of trailSegs) {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.5) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    let s = 11 - acc;
    for (; s <= L; s += 11) {
      const px = ax + ux * s, pz = az + uz * s;
      const h = (Math.imul(Math.round(px * 4) | 0, 0x9E3779B1)
               ^ Math.imul(Math.round(pz * 4) | 0, 0x85EBCA77)) >>> 0;
      const side = (h & 1) ? 1 : -1;
      const off = 1.5 + ((h >>> 3) % 90) / 100;      // 1.5 - 2.4m off the path
      const x = px - uz * side * off, z = pz + ux * side * off;
      if (blocked && blocked(x, z)) continue;
      if (window.__inWater && window.__inWater(x, z)) continue;
      if (window.__inFootprint && window.__inFootprint(x, z)) continue;
      if (window.__onRoad && window.__onRoad(x, z, 0.4)) continue;
      const r = ((h >>> 8) % 1000) / 1000;
      const [, kind, base] = KINDS.find(([p]) => r < p);
      spots.push([x, z, kind, base + ((h >>> 12) % 30) / 100, ((h >>> 5) % 628) / 100]);
    }
    acc = (acc + L) % 11;
  }
  return instantiate(world, spots, groundAt);
}

// the shared instancing tail — scatterVerges and scatterFoundations both
// place [x, z, kind, scale, yaw] spot lists
function instantiate(world, spots, groundAt) {
  const byKind = new Map();
  for (const sp of spots) {
    let a = byKind.get(sp[2]);
    if (!a) byKind.set(sp[2], a = []);
    a.push(sp);
  }
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  const q = new THREE.Quaternion(), sc = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let total = 0;
  for (const [kind, list] of byKind) {
    const inst = new THREE.InstancedMesh(geoFor(kind), mat, list.length);
    inst.castShadow = false;                    // ankle-high; a shadow costs more than it shows
    inst.userData.treeFoliage = true;           // low leafy card exemption, same mechanism
    list.forEach(([x, z, , s2, yaw], i) => {
      p.set(x, groundAt(x, z), z);
      q.setFromAxisAngle(up, yaw);
      sc.set(s2, s2, s2);
      m.compose(p, q, sc);
      inst.setMatrixAt(i, m);
    });
    world.add(inst);
    total += list.length;
  }
  return total;
}

// B13 FOUNDATION GREENING (research/beauty-sweep-2026-08-23.md): all five
// sweep reviewers said the same thing — blank walls meeting bare grass is
// the island's most repeated sterile look. Bushes/ferns/flowers along
// building wall bases, ONLY inside the flagged zones (the tris budget has
// ~75k headroom; dressing every wall on the island would cost megatris).
const ZONES = [
  // FOUR zones only this batch — the tris budget allows ~450 plants and
  // nine zones diluted to specks (vet 2026-08-23). The other five
  // (Sandy/Pearl, Ocean Dr east, RWS lanes, Knolls, khaki belt) are in
  // the research file, queued behind the perf work that frees budget.
  [-1070, 12900, 160, 180],   // Ironside estate (frames 178-182, 192)
  [-845, 12900, 90, 90],      // sunken corridor (071/072, the worst pair)
  [-1360, 12865, 120, 90],    // Palawan Beach Walk village (218, 219)
  [610, 13250, 200, 200],     // Cove Way colonnade + Carrhill (008, 012, 177)
];

const inRing = (ring, x, z) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if ((zi > z) !== (zj > z)
        && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};

export function scatterFoundations(world, buildings, blocked, groundAt) {
  const inZone = (x, z) => ZONES.some(([zx, zz, hw, hh]) =>
    Math.abs(x - zx) <= hw && Math.abs(z - zz) <= hh);
  const spots = [];
  for (const b of (buildings || [])) {
    if (!b.p || b.p.length < 3) continue;
    if (!inZone(b.p[0][0], b.p[0][1])) continue;
    for (let i = 0; i < b.p.length; i++) {
      const [ax, az] = b.p[i], [bx, bz] = b.p[(i + 1) % b.p.length];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 3.5) continue;                     // estate cottages have short walls
      const ux = (bx - ax) / L, uz = (bz - az) / L;
      // outward side DERIVED per edge, never argued (the coastline
      // winding lesson): probe both normals against this ring
      let nx = uz, nz = -ux;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      if (inRing(b.p, mx + nx * 1.2, mz + nz * 1.2)) { nx = -nx; nz = -nz; }
      for (let s = 3; s <= L - 3; s += 5) {
        const h = (Math.imul(Math.round((ax + ux * s) * 4) | 0, 0x9E3779B1)
                 ^ Math.imul(Math.round((az + uz * s) * 4) | 0, 0x85EBCA77)) >>> 0;
        if ((h % 10) < 3) continue;              // ~70% fill
        // 1.7-2.6m out: SOLID rasterizes drawn walls with margin and ate
        // everything closer (Ironside vet x3, 2026-08-23)
        const px = ax + ux * s + nx * (1.7 + ((h >>> 4) % 9) / 10);
        const pz = az + uz * s + nz * (1.7 + ((h >>> 7) % 9) / 10);
        if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
        if (blocked && blocked(px, pz)) continue;
        if (window.__inWater && window.__inWater(px, pz)) continue;
        if (window.__onRoad && window.__onRoad(px, pz, 0.4)) continue;
        if (window.__onPath && window.__onPath(px, pz)) continue;
        const r = ((h >>> 8) % 1000) / 1000;
        const kind = r < 0.38 ? 'fern' : r < 0.58 ? 'plant'
          : r < 0.72 ? 'flowerP' : r < 0.86 ? 'flowerR' : 'flowerB';
        spots.push([px, pz, kind, 0.55 + ((h >>> 12) % 25) / 100,
          ((h >>> 5) % 628) / 100]);
      }
    }
  }
  // hard tris cap: keep ~520 spots, dropped deterministically
  const kept = spots.length > 450
    ? spots.filter((_, i) => i % Math.ceil(spots.length / 450) === 0)
    : spots;
  return instantiate(world, kept, groundAt);
}
