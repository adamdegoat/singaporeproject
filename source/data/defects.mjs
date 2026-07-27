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

  /* D10  buildings standing inside each other. OSM traces a mall and its own
     annex as separate ways that share a wall, which is fine; what is not fine
     is one footprint largely inside another, which draws two masses in the same
     place and z-fights the whole facade. */
  {
    const bad = [];
    const area = (p2) => {
      let a2 = 0;
      for (let i = 0; i < p2.length; i++) {
        const q1 = p2[i], q2 = p2[(i + 1) % p2.length];
        a2 += q1[0] * q2[1] - q2[0] * q1[1];
      }
      return Math.abs(a2) / 2;
    };
    for (const b of data.buildings) {
      // how much of this footprint's own area sits inside a DIFFERENT one
      let inside = 0, n = 0;
      const [mnx, mnz, mxx, mxz] = b._bb;
      for (let i = 1; i < 5; i++) for (let j = 1; j < 5; j++) {
        const x = mnx + (mxx - mnx) * i / 5, z = mnz + (mxz - mnz) * j / 5;
        if (!inPoly(b.p, x, z)) continue;
        n++;
        const o = buildingAt(x, z);
        // A TALLER inner footprint is a tower on a podium and is meant to be
        // there: 16 of the 28 this first reported were exactly that, including
        // The Atrium @ Orchard standing above Plaza Singapura. Only a mass that
        // is buried inside something at least as tall is invisible duplication.
        if (o && o !== b && area(o.p) > area(b.p) * 1.05
            && (o.h || 0) >= (b.h || 0)) inside++;
      }
      if (n >= 4 && inside / n > 0.8) {
        bad.push(`"${b.n || '(unnamed)'}" sits almost entirely inside another building`);
      }
    }
    report('D10', 'building footprints buried inside a larger one', bad);
  }

  /* D11  a kerb with no pavement behind it, which reads as a raised line across
     bare ground. Every kerb should have walkable surface on its outer side. */
  {
    const m4 = new T.Matrix4(), v3 = new T.Vector3();
    let bad = 0, n = 0;
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const pr = o.geometry.parameters || {};
      if (!(Math.abs((pr.width || 0) - 0.42) < 0.01 && Math.abs((pr.depth || 0) - 2) < 0.01)) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4); v3.setFromMatrixPosition(m4);
        n++;
        // a kerb standing in the middle of a carriageway is the failure case
        if (window.__onRoad(v3.x, v3.z, -1.2)) bad++;
      }
    });
    report('D11', 'kerbs standing inside a carriageway', bad ? [`${bad} of ${n} kerbs`] : []);
  }

  /* D12  the walker can leave the world: is there anywhere on a pavement from
     which every direction is blocked, trapping them */
  {
    const stuck = [];
    const ax = window.__axis.p;
    for (let i = 0; i < ax.length - 1; i += 3) {
      const a = ax[i], c = ax[i + 1];
      const dx = c[0] - a[0], dz = c[1] - a[1], L = Math.hypot(dx, dz) || 1;
      const nx = -dz / L, nz = dx / L;
      for (const off of [-12, 12]) {
        const x = a[0] + nx * off, z = a[1] + nz * off;
        if (window.__blocked(x, z)) continue;
        let openDirs = 0;
        for (let k = 0; k < 8; k++) {
          const th = (k / 8) * Math.PI * 2;
          if (!window.__blocked(x + Math.cos(th) * 1.5, z + Math.sin(th) * 1.5)) openDirs++;
        }
        if (openDirs === 0) stuck.push(`walled in at ${x | 0},${z | 0}`);
      }
    }
    report('D12', 'spots on the pavement with no way out', stuck);
  }

  /* D13  footprints that are not shapes: zero area, or a ring that crosses
     itself, both of which extrude into folded geometry with inside-out faces */
  {
    const bad = [];
    const cross = (a, b, c, d) => {
      const s1 = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
      const s2 = (b[0]-a[0])*(d[1]-a[1]) - (b[1]-a[1])*(d[0]-a[0]);
      const s3 = (d[0]-c[0])*(a[1]-c[1]) - (d[1]-c[1])*(a[0]-c[0]);
      const s4 = (d[0]-c[0])*(b[1]-c[1]) - (d[1]-c[1])*(b[0]-c[0]);
      return (s1 > 0) !== (s2 > 0) && (s3 > 0) !== (s4 > 0);
    };
    for (const b of data.buildings) {
      let a2 = 0;
      for (let i = 0; i < b.p.length; i++) {
        const q1 = b.p[i], q2 = b.p[(i + 1) % b.p.length];
        a2 += q1[0] * q2[1] - q2[0] * q1[1];
      }
      if (Math.abs(a2) / 2 < 4) { bad.push(`"${b.n || '(unnamed)'}" has no area`); continue; }
      if (b.p.length > 40) continue;                 // O(n^2), and long rings are traced curves
      let self = false;
      for (let i = 0; i < b.p.length && !self; i++) {
        for (let j = i + 2; j < b.p.length; j++) {
          if (i === 0 && j === b.p.length - 1) continue;
          if (cross(b.p[i], b.p[(i + 1) % b.p.length], b.p[j], b.p[(j + 1) % b.p.length])) { self = true; break; }
        }
      }
      if (self) bad.push(`"${b.n || '(unnamed)'}" has a ring that crosses itself`);
    }
    report('D13', 'footprints that are not valid shapes', bad);
  }

  /* D14  MRT entrances AS DRAWN. Testing the map node was wrong for the fifth
     time today: most Orchard exits genuinely sit inside a mall, because that is
     where the escalator is. What matters is where the canopy was built. */
  {
    const bad = [];
    const box = new T.Box3(), c3 = new T.Vector3();
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const pr = o.geometry.parameters || {};
      // the entrance canopy: a wide shallow arch
      if (o.geometry.type !== 'CylinderGeometry') return;
      if (!(pr.radiusTop > 1.6 && pr.radiusTop < 3.2 && (pr.openEnded || pr.thetaLength))) return;
      box.setFromObject(o); box.getCenter(c3);
      const b2 = buildingAt(c3.x, c3.z);
      if (b2) bad.push(`an MRT canopy stands inside "${b2.n || '(unnamed)'}"`);
    });
    report('D14', 'MRT entrance canopies built inside a building', bad);
  }

  /* D15  bridges AS BUILT. The data list is not the built list: the builder
     already skips anything under 22m or too twisty, so testing data/bridges
     reported ramps and kerb cuts that were never built. Sixth time today a check
     read the input instead of the output. */
  {
    const bad = [];
    const box = new T.Box3(), c3 = new T.Vector3();
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const pr = o.geometry.parameters || {};
      // the deck: a long thin box high off the ground
      if (o.geometry.type !== 'BoxGeometry') return;
      // the deck EXACTLY: pedBridge builds it 0.42 thick and 2.6 deep. The first
      // version matched "long, thin, elevated", which is also every covered
      // walkway roof, awning and sign gantry in the district: 238 findings, none
      // of them bridges.
      if (Math.abs((pr.height || 0) - 0.42) > 0.01) return;
      if (Math.abs((pr.depth || 0) - 2.6) > 0.01) return;
      box.setFromObject(o); box.getCenter(c3);
      if ((c3.y - window.__terrain.at(c3.x, c3.z)) < 3) return;   // not elevated
      let spans = false;
      for (let d = -12; d <= 12 && !spans; d += 1.5) {
        for (const [ux, uz] of [[1, 0], [0, 1]]) {
          if (window.__onRoad(c3.x + ux * d, c3.z + uz * d, 0)) { spans = true; break; }
        }
      }
      if (!spans) bad.push(`a bridge deck at ${c3.x | 0},${c3.z | 0} spans no carriageway`);
    });
    report('D15', 'built bridge decks spanning nothing', bad);
  }

  /* D16  geometry with inside-out faces. An extruded ring wound the wrong way
     produces normals pointing into the solid, so the building is lit as if it
     were a hole and looks black from outside. */
  {
    const T2 = window.__THREE;
    const a3 = new T2.Vector3(), b3 = new T2.Vector3(), c3 = new T2.Vector3();
    const ab3 = new T2.Vector3(), ac3 = new T2.Vector3(), n3 = new T2.Vector3();
    const ctr = new T2.Vector3(), box = new T2.Box3();
    let bad = 0, checked = 0;
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      if (o.geometry.type !== 'ExtrudeGeometry') return;
      const pos = o.geometry.attributes.position;
      if (!pos || pos.count < 9) return;
      box.setFromObject(o); box.getCenter(ctr);
      let out = 0, tot = 0;
      const step = Math.max(3, Math.floor(pos.count / 30) * 3);
      for (let i = 0; i + 2 < pos.count; i += step) {
        a3.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        b3.fromBufferAttribute(pos, i + 1).applyMatrix4(o.matrixWorld);
        c3.fromBufferAttribute(pos, i + 2).applyMatrix4(o.matrixWorld);
        ab3.subVectors(b3, a3); ac3.subVectors(c3, a3);
        n3.crossVectors(ab3, ac3);
        if (Math.abs(n3.y) > n3.length() * 0.8) continue;   // skip caps
        // does the face point away from the mass's own centre
        const away = (a3.x - ctr.x) * n3.x + (a3.z - ctr.z) * n3.z;
        tot++; if (away < 0) out++;
      }
      if (tot >= 6) { checked++; if (out / tot > 0.7) bad++; }
    });
    report('D16', 'extruded masses with inside-out walls',
           bad ? [`${bad} of ${checked} extruded meshes face inward`] : []);
  }

  /* D17  two carriageways drawn on top of each other. OSM maps a street as
     several ways of different widths, and where one runs inside another both
     ribbons are drawn: the wider one wins the depth test in patches and the
     road speckles. */
  {
    const bad = [];
    const carr = (data.roads || []).filter((r) => r.k !== 'footway' && r.k !== 'pedestrian');
    const CELL = 30, grid = new Map();
    for (const r of carr) {
      for (const q of r.p) {
        const k = Math.floor(q[0] / CELL) + ',' + Math.floor(q[1] / CELL);
        if (!grid.has(k)) grid.set(k, new Set());
        grid.get(k).add(r);
      }
    }
    const seen = new Set();
    let redundant = 0;
    for (const r of carr) {
      let inside = 0, n = 0;
      for (const q of r.p) {
        n++;
        const near = grid.get(Math.floor(q[0] / CELL) + ',' + Math.floor(q[1] / CELL));
        if (!near) continue;
        for (const o of near) {
          if (o === r || (o.w || 0) <= (r.w || 0)) continue;
          // is this point inside the OTHER way's carriageway
          for (let i = 0; i < o.p.length - 1; i++) {
            const a = o.p[i], c = o.p[i + 1];
            const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1;
            const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dz) / l2));
            const d = Math.hypot(q[0] - (a[0] + dx * t), q[1] - (a[1] + dz * t));
            if (d < (o.w || 6) / 2 - 1.5) { inside++; i = o.p.length; break; }
          }
        }
      }
      const key = `${r.n || '?'}|${Math.round(r.p[0][0])}`;
      if (n >= 3 && inside / n > 0.85 && !seen.has(key)) {
        seen.add(key);
        redundant++;
      }
    }
    // INFORMATION, not a defect. OSM maps a street as many overlapping ways of
    // different widths — Grange Road alone is 48 ways at six widths — so narrow
    // ones sit inside wide ones by design. The visible symptom would be
    // speckling where two ribbons meet, and buildRoads already prevents that by
    // giving each way a stable sub-centimetre height offset derived from its own
    // geometry; P6 gates the result. What is left is redundant vertices on a
    // layer that is a single draw call, which is not worth the risk of dropping
    // ways the road index and the street naming depend on.
    report('D17', `carriageways drawn inside wider ones (redundant, not a defect): ${redundant}`, []);
  }

  /* D18  buildings at implausible heights. Not a tag check — the tags were
     cleaned already — but a check on what was BUILT, including everything the
     recipes and the type defaults put there. */
  {
    const bad = [];
    const box = new T.Box3();
    let tallest = 0, tallestAt = null;
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      if (o.geometry.type !== 'ExtrudeGeometry') return;
      box.setFromObject(o);
      const h = box.max.y - window.__terrain.at((box.min.x + box.max.x) / 2, (box.min.z + box.max.z) / 2);
      if (h > tallest) { tallest = h; tallestAt = [box.min.x | 0, box.min.z | 0]; }
      // Guoco Tower is 290m and is the tallest thing in Singapore; nothing in
      // these two districts comes close, so anything over 300 is a bug
      if (h > 300) bad.push(`a mass ${h.toFixed(0)}m tall at ${box.min.x | 0},${box.min.z | 0}`);
    });
    report('D18', 'buildings taller than anything in Singapore', bad,
      `tallest built mass is ${tallest.toFixed(0)}m at ${tallestAt}`);
  }

  /* D19  traffic signals standing where no two streets meet. A signal head in
     the middle of a block is furniture nobody put there. */
  {
    const bad = [];
    for (const sgp of data.signals || []) {
      const [sx, sz] = sgp;
      const names = new Set();
      for (const r of data.roads || []) {
        if (!r.n || r.k === 'footway' || r.k === 'pedestrian') continue;
        for (const q of r.p) {
          if (Math.hypot(q[0] - sx, q[1] - sz) < 45) { names.add(r.n); break; }
        }
      }
      // A signal does not need a junction. Singapore signalises mid-block
      // pedestrian crossings, and all three this first reported sit within 21m
      // of a mapped crossing. The real question is whether a signal serves
      // ANYTHING — a junction or a crossing — and one that serves neither is
      // furniture nobody put there.
      let servesCrossing = false;
      for (const c of data.crossings || []) {
        if (Math.hypot(c[0] - sx, c[1] - sz) < 45) { servesCrossing = true; break; }
      }
      if (names.size < 2 && !servesCrossing) {
        bad.push(`a signal at ${sx | 0},${sz | 0} serves neither a junction nor a crossing`);
      }
    }
    report('D19', 'traffic signals serving nothing', bad,
      'two named streets, or a mapped crossing, within 45m');
  }

  /* D20  covered walkways with no posts reaching the ground. A canopy floating
     on nothing is the classic tell of a roof placed by height rather than by
     what holds it up. */
  {
    const bad = [];
    const box = new T.Box3(), c3 = new T.Vector3();
    const posts = [];
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const pr = o.geometry.parameters || {};
      if (o.geometry.type !== 'CylinderGeometry') return;
      if (Math.abs((pr.radiusTop || 0) - 0.07) > 0.02) return;
      const m4 = new T.Matrix4(), v3 = new T.Vector3();
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4); v3.setFromMatrixPosition(m4);
        if (v3.y > -900) posts.push([v3.x, v3.z]);
      }
    });
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const pr = o.geometry.parameters || {};
      // the walkway roof panel
      if (o.geometry.type !== 'BoxGeometry') return;
      if (!((pr.width || 0) > 2.4 && (pr.width || 0) < 4.2 && (pr.height || 0) < 0.35)) return;
      const m4 = new T.Matrix4(), v3 = new T.Vector3();
      let orphan = 0;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4); v3.setFromMatrixPosition(m4);
        if (v3.y < -900) continue;
        if (v3.y - window.__terrain.at(v3.x, v3.z) < 2) continue;
        let near = false;
        for (const [px, pz] of posts) {
          if ((px - v3.x) ** 2 + (pz - v3.z) ** 2 < 10 * 10) { near = true; break; }
        }
        if (!near) orphan++;
      }
      if (orphan) bad.push(`${orphan} covered-walkway roof panels with no post within 10m`);
    });
    report('D20', 'covered walkway roofs with nothing holding them up', bad);
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
