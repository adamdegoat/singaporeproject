#!/usr/bin/env node
// Defect hunt: classes of wrongness that nothing currently looks for.
//
//     SG_SCENE=world node data/defects.mjs
//
// This is NOT the gate. audit_world.js is the gate and its checks are named,
// budgeted and enforced. This is the thing that runs BEFORE a check exists, to
// find out what the next check should be, because the governing rule of the
// project is that you cannot find a defect class you have not named — and every
// defect a person has found by riding was in a class nobody had named.
//
// Anything here that turns out to be real gets fixed and then promoted into
// audit_world.js or behaviour.mjs with a budget. Anything that turns out to be
// the probe being wrong gets deleted, loudly.
//
// Needs the dev server on :8933.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const SCENE = process.env.SG_SCENE || 'world';
const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:8933/index.html?dpr=1&raw=1&scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { timeout: 180000 });

const found = await page.evaluate(() => {
  const T = window.__THREE, sc = window.__scene, data = window.__data;
  const out = [];
  const report = (id, what, list, note) =>
    out.push({ id, what, n: list.length, note, ex: list.slice(0, 6) });

  const inPoly = (poly, x, z) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
      if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
    }
    return hit;
  };
  // buildings by cell, for "is this point inside a building"
  const BC = 40, bGrid = new Map();
  for (const b of data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const q of b.p) {
      if (q[0] < mnx) mnx = q[0]; if (q[0] > mxx) mxx = q[0];
      if (q[1] < mnz) mnz = q[1]; if (q[1] > mxz) mxz = q[1];
    }
    b._bb = [mnx, mnz, mxx, mxz];
    for (let cx = Math.floor(mnx / BC); cx <= Math.floor(mxx / BC); cx++)
      for (let cz = Math.floor(mnz / BC); cz <= Math.floor(mxz / BC); cz++) {
        const k = cx + ',' + cz;
        if (!bGrid.has(k)) bGrid.set(k, []);
        bGrid.get(k).push(b);
      }
  }
  const buildingAt = (x, z) => {
    for (const b of bGrid.get(Math.floor(x / BC) + ',' + Math.floor(z / BC)) || []) {
      if (x < b._bb[0] || x > b._bb[2] || z < b._bb[1] || z > b._bb[3]) continue;
      if (inPoly(b.p, x, z)) return b;
    }
    return null;
  };

  /* D1  numbers that are not numbers */
  {
    const bad = [];
    const scan = (label, arr, get) => {
      for (const it of arr || []) {
        const p = get(it);
        if (!p) continue;
        for (const q of (Array.isArray(p[0]) ? p : [p])) {
          if (!Number.isFinite(q[0]) || !Number.isFinite(q[1])) {
            bad.push(`${label} has a non-finite coordinate`); return;
          }
        }
      }
    };
    scan('buildings', data.buildings, (b) => b.p);
    scan('roads', data.roads, (r) => r.p);
    scan('trees', data.trees, (t) => t);
    scan('crossings', data.crossings, (c) => c);
    report('D1', 'non-finite coordinates in the scene data', bad);
  }

  /* D2  street furniture floating above, or sunk into, the ground it stands on.
     P3 only catches things more than 19m out, which is a teleport. A lamp post
     30cm in the air is the thing you actually notice. */
  {
    const m4 = new T.Matrix4(), v3 = new T.Vector3(), sc3 = new T.Vector3();
    const q4 = new T.Quaternion(), p4 = new T.Vector3();
    // signatures whose origin sits ON the ground, so the offset is readable
    const GROUNDED = {
      'CylinderGeometry(0.09,3.1)': 1.55,     // sign pole, centred
      'CylinderGeometry(0.05,2.6)': 1.30,     // name plate pole
      'BoxGeometry(0.42,0.3,2)': 0.15,        // kerb
    };
    const bad = [];
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const g = o.geometry, pr = g.parameters || {};
      const sig = `${g.type}(${[pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
        .filter((v) => v != null).map((v) => +v.toFixed(2)).join(',')})`;
      const expect = GROUNDED[sig];
      if (expect === undefined) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4);
        m4.decompose(p4, q4, sc3);
        v3.copy(p4).applyMatrix4(o.matrixWorld);
        if (v3.y < -900) continue;
        const d = v3.y - (window.__surfaceAt(v3.x, v3.z) + expect * sc3.y);
        if (Math.abs(d) > 0.25) bad.push(`${sig} ${d > 0 ? 'floating' : 'sunk'} ${Math.abs(d).toFixed(2)}m at ${v3.x | 0},${v3.z | 0}`);
      }
    });
    report('D2', 'street furniture off the ground it stands on', bad, 'tolerance 25cm');
  }

  /* D3 and D5  BUS STOP POLES AS BUILT.
     Both of these tested the map's stop positions, which is the input. The
     builder pushes a stop off the carriageway and now also out of any building,
     so where the map put it says nothing about where the pole stands. Third
     time today I have written a check against the source instead of the world;
     it is the single most common way a check lies. */
  {
    const notRoad = [], inBuilding = [];
    const box = new T.Box3(), c3 = new T.Vector3();
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const pr = o.geometry.parameters || {};
      if (o.geometry.type !== 'CylinderGeometry') return;
      if (Math.abs((pr.radiusTop || 0) - 0.085) > 0.005) return;
      if (Math.abs((pr.height || 0) - 3.1) > 0.05) return;
      box.setFromObject(o); box.getCenter(c3);
      const b = buildingAt(c3.x, c3.z);
      if (b) inBuilding.push(`a bus stop pole stands inside "${b.n || '(unnamed)'}"`);
      if (!window.__onRoad(c3.x, c3.z, 16)) notRoad.push(`a bus stop pole is nowhere near a road at ${c3.x | 0},${c3.z | 0}`);
    });
    report('D3', 'bus stop poles not beside a road', notRoad);
    report('D5', 'bus stop poles standing inside a building', inBuilding);
  }

  /* D6  trees standing inside buildings */
  {
    const bad = [];
    for (const t of data.trees || []) {
      const b = buildingAt(t[0], t[1]);
      if (b) bad.push(`tree inside "${b.n || '(unnamed)'}" at ${t[0] | 0},${t[1] | 0}`);
    }
    report('D6', 'mapped trees standing inside a building', bad);
  }

  /* D7  a building FLOATING: daylight under its base.

     Two wrong versions before this one. The first measured how much SLOPE a
     footprint spanned, which is a fact about the terrain and not a defect. The
     second sampled the bounding box corners, which for an L-shaped or angled
     plan sit outside the building entirely, often over a road.

     This walks the real perimeter at three-metre steps and compares the ground
     there against the base the builder computes, which is the lowest ground at
     any vertex or the centroid, sunk half a metre. A long edge can still cross
     a dip that no vertex samples, and that is exactly the case that leaves a
     visible gap. */
  {
    const bad = [];
    for (const b of data.buildings) {
      let base = Infinity;
      for (const [x, z] of b.p) base = Math.min(base, window.__terrain.at(x, z));
      let cx = 0, cz = 0;
      for (const q of b.p) { cx += q[0]; cz += q[1]; }
      base = Math.min(base, window.__terrain.at(cx / b.p.length, cz / b.p.length)) - 0.5;
      let gap = 0, at = null;
      for (let i = 0; i < b.p.length; i++) {
        const a = b.p[i], c = b.p[(i + 1) % b.p.length];
        const L = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
        for (let t = 0; t <= L; t += 3) {
          const x = a[0] + (c[0] - a[0]) * (t / L), z = a[1] + (c[1] - a[1]) * (t / L);
          const g = base - window.__terrain.at(x, z);
          if (g > gap) { gap = g; at = [x | 0, z | 0]; }
        }
      }
      if (gap > 0.4) bad.push(`"${b.n || '(unnamed)'}" has ${gap.toFixed(1)}m of daylight under it at ${at}`);
    }
    report('D7', 'building masses with daylight under them', bad, 'tolerance 40cm, walked around the real perimeter');
  }

  /* D8  materials that will render black or invisible */
  {
    const bad = new Set();
    sc.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of (Array.isArray(o.material) ? o.material : [o.material])) {
        if (!m) { bad.add('a mesh with no material'); continue; }
        if (m.map && m.map.image && m.map.image.width === 0) bad.add(`${m.type} has a zero-size texture`);
        if (m.opacity === 0) bad.add(`${m.type} is fully transparent`);
      }
    });
    report('D8', 'materials that cannot render', [...bad]);
  }

  /* D9  the ride can reach places it should not: is the whole main street
     actually rideable end to end without hitting solid geometry */
  {
    const ax = window.__axis.p;
    const stuck = [];
    for (let i = 0; i < ax.length - 1; i++) {
      const a = ax[i], c = ax[i + 1];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      for (let t = 0; t < L; t += 3) {
        const x = a[0] + (c[0] - a[0]) * (t / L), z = a[1] + (c[1] - a[1]) * (t / L);
        if (window.__blocked(x, z)) stuck.push(`main street blocked at ${x | 0},${z | 0}`);
      }
    }
    report('D9', 'points on the main street centreline that are blocked', stuck);
  }

  return out;
});

await browser.close();

console.log(`== defect hunt: ${SCENE}\n`);
let total = 0;
for (const f of found) {
  total += f.n;
  const flag = f.n === 0 ? '  ok  ' : ' FOUND';
  console.log(`${flag} ${f.id.padEnd(4)} ${String(f.n).padStart(6)}  ${f.what}`);
  if (f.note) console.log(`              ${f.note}`);
  for (const e of f.ex) console.log(`              ${e}`);
}
console.log(`\n${total} findings across ${found.length} classes`);
