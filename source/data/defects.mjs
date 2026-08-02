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
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/index.html?dpr=1&raw=1&scene=${SCENE}`, { waitUntil: 'load' });
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
        // AT A BRIDGE EDGE, "THE SURFACE IT STANDS ON" IS TWO SURFACES.
        //
        // bridgeDeckAt() is a proximity test against the deck's half-width plus
        // 40cm, so within a metre of an abutment the deck answer and the ground
        // answer are both live and they differ by the height of the bridge.
        // This check asked surfaceAt() alone and reported 118 kerbs on Marina
        // Bay as sunk 1.6m — kerbs that are sitting correctly on the ground
        // beside the bridge, which is why none of it was ever visible in a
        // frame. Measured at full precision: surfaceAt at placement and
        // surfaceAt after boot agree to the centimetre for these, and the deck
        // is null for both.
        //
        // So accept EITHER datum. Nothing is weakened: a prop 34m underground
        // or 19m in the air — the cases this check exists for — matches
        // neither. This is the same "the quantised one is wrong" family as the
        // street plate measured to a vertex and the pedestrian band bucketed to
        // whole metres; the fix is always to let the check measure what the
        // world actually offers rather than one of two right answers.
        const want = expect * sc3.y;
        const dSurf = v3.y - (window.__surfaceAt(v3.x, v3.z) + want);
        const gAt = window.__terrain ? window.__terrain.at(v3.x, v3.z) : null;
        const dGround = gAt === null ? dSurf : v3.y - (gAt + 0.024 + want);
        let d = Math.abs(dSurf) <= Math.abs(dGround) ? dSurf : dGround;
        // AND EVERY DECK, NOT JUST THE WIDEST ONE. surfaceAt takes the widest
        // deck where two overlap, so a kerb sitting correctly on a RAMP over
        // the carriageway it joins matched neither datum: 87 findings in
        // marinabay and 228 in kallang, every one of them on a `bridge=1`
        // road, and vetted from the saddle as sitting correctly on the deck.
        // ...AND AT THE DECK'S EDGE, NOT ONLY OVER ITS MIDDLE. A kerb runs at
        // the edge of the carriageway, and the deck registry's lateral extent
        // ends at half-width + 40cm — centimetres short of the kerb line, so
        // the loop below had no candidates at the kerb's own (x,z) and 228
        // kallang + 84 marinabay kerbs read as floating 1.2m. Measured at
        // 3676,7036 on 2026-08-03: bridgeDecksAt() is EMPTY at the kerb and
        // answers 7.09 one metre inboard, where the kerb origin then matches
        // to 4cm. Nudge the query around the prop before giving up.
        if (Math.abs(d) > 0.25 && window.__bridgeDecksAt) {
          for (const [ox, oz] of [[0, 0], [0.7, 0], [-0.7, 0], [0, 0.7], [0, -0.7],
                                  [1.4, 0], [-1.4, 0], [0, 1.4], [0, -1.4]]) {
            for (const deck of window.__bridgeDecksAt(v3.x + ox, v3.z + oz)) {
              const dd = v3.y - (deck + 0.024 + want);
              if (Math.abs(dd) < Math.abs(d)) d = dd;
            }
            if (Math.abs(d) <= 0.25) break;
          }
        }
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

  /* D6  trees standing inside buildings, AS DRAWN.
     This read `data.trees` -- the OSM node list, which is the INPUT -- and so
     reported trees the builder had already refused to plant: TreeField.add and
     the place() test both reject a position inside a building, and every one of
     the four it was reporting was in the ArtScience Museum or NS Square, both
     of which arrived as new footprints in Marina Bay. Seventh time in this
     project that a check has been found reading the input instead of the
     output. It walks the trunks now, the same way D37 does. */
  {
    const bad = [];
    const m4d = new T.Matrix4(), pd = new T.Vector3();
    const qd = new T.Quaternion(), sd = new T.Vector3();
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      // IT IS NOT the only instanced cylinder with that profile -- that claim
      // was tested on 2026-08-01 and is false. TreeField tags its own trunks;
      // ask for the tag. (Only visible under ?raw=1, which is what this loads:
      // consolidate() merges the instanced meshes away.)
      if (!o.userData.treeTrunk) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4d); m4d.decompose(pd, qd, sd);
        pd.applyMatrix4(o.matrixWorld);
        if (pd.y < -900) continue;
        const b = buildingAt(pd.x, pd.z);
        if (b && bad.length < 40) bad.push(`tree inside "${b.n || '(unnamed)'}" at ${pd.x | 0},${pd.z | 0}`);
        else if (b) bad.push('');
      }
    });
    report('D6', 'trees standing inside a building', bad.filter((q) => q !== '')
      .concat(bad.filter((q) => q === '')));
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
      base = Math.min(base, window.__terrain.at(cx / b.p.length, cz / b.p.length));
      // MIRROR footingY EXACTLY. This re-derived the footing from vertices and
      // the centroid, sunk 0.5 -- which is what city.js used to do. The builder
      // walks the whole perimeter now and sinks 0.9, so this check was
      // measuring a building against a footing it no longer has and reporting
      // daylight that is not there. A check that re-derives what the builder
      // computes has to be changed with it, which is an argument for reading
      // the drawn mesh instead; that is harder for merged tiles, so for now the
      // two formulas are kept identical and this comment is the reason why.
      for (let i2 = 0; i2 < b.p.length; i2++) {
        const a2 = b.p[i2], b2 = b.p[(i2 + 1) % b.p.length];
        const L2 = Math.hypot(b2[0] - a2[0], b2[1] - a2[1]);
        if (L2 < 6) continue;
        const n2 = Math.min(24, Math.floor(L2 / 6));
        for (let k2 = 1; k2 <= n2; k2++) {
          const t2 = k2 / (n2 + 1);
          base = Math.min(base, window.__terrain.at(a2[0] + (b2[0] - a2[0]) * t2,
                                                    a2[1] + (b2[1] - a2[1]) * t2));
        }
      }
      base -= 0.9;
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
    // A STITCH JUMP IS NOT STREET. The axis is chained from every way
    // carrying the axis name, and where the chain crosses from one
    // carriageway of a dual road to the other it draws a JOIN segment that is
    // on no way at all — Sentosa Gateway's hairpin runs 48.6m across a water
    // inlet, and its 7 "blocked centreline points" were all on that join
    // (verified 2026-08-02: the axis point at -1056,12149 is 10.6m from the
    // nearest Sentosa Gateway way; a reversal-rejecting stitcher was measured
    // and REVERTED — it collapses chinatown's axis to 20m, because most axes
    // legitimately run up one carriageway and back the other). So a sampled
    // point only counts when it lies ON the named street: within the axis's
    // own half-width + 3m of some way that carries the axis name.
    const axName = ((data.axis && data.axis.n) || '').toLowerCase();
    const axWays = (data.roads || []).filter((r) => (r.n || '').toLowerCase() === axName);
    const onNamedWay = (x, z) => {
      if (!axWays.length) return true;              // nothing to test against
      for (const r of axWays) {
        // EACH WAY'S OWN width, and INSIDE the carriageway: this check is
        // about the CENTRELINE, so a sampled point counts only when it lies
        // within the way's own tarmac. On the Gateway bridge (7m wide) a
        // point 4-5m off the centreline is over the honest water between the
        // twin decks — not a place a rider can be, not a defect.
        const lim = Math.max(1.5, (r.w || 8) / 2 - 0.5);
        for (let i = 0; i < r.p.length - 1; i++) {
          const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
          if (dx * dx + dz * dz < lim * lim) return true;
        }
      }
      return false;
    };
    let offAxis = 0;
    for (let i = 0; i < ax.length - 1; i++) {
      const a = ax[i], c = ax[i + 1];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      for (let t = 0; t < L; t += 3) {
        const x = a[0] + (c[0] - a[0]) * (t / L), z = a[1] + (c[1] - a[1]) * (t / L);
        if (!onNamedWay(x, z)) { offAxis++; continue; }
        if (window.__blocked(x, z)) stuck.push(`main street blocked at ${x | 0},${z | 0}`);
      }
    }
    report('D9', 'points on the main street centreline that are blocked', stuck,
           offAxis ? `${offAxis} stitch-join point(s) on no named way skipped` : undefined);
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
        // AND A MASS THAT STARTS IN THE AIR BURIES NOTHING. SkyPark is 12,455 m2
        // at h=207 with min_height 193 -- a deck in the sky -- and it sits over
        // all three Marina Bay Sands towers, so judged on height alone it
        // "contains" them. process.py's own burial rule already skips these;
        // this probe did not, and reported two of the three towers.
        if (o && o !== b && !o.mh && area(o.p) > area(b.p) * 1.05
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
      // BY IDENTITY. The shape rule here (an open-ended cylinder of radius 1.6
      // to 3.2) never matched the actual canopy, which is radius 3.5 -- so this
      // check had never looked at an MRT entrance in its life. Once Marina Bay
      // arrived it started matching Supertree trunk sleeves instead and
      // reported seven of them as canopies inside a building.
      if (!o.userData || !o.userData.mrtCanopy) return;
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
      // SAMPLE ALONG THE DECK, not a fixed cross around its middle.
      //
      // This walked +/-12m in x and z from the centre, which is an arbitrary
      // shape to compare against a deck that can be 88m long: three real
      // bridges were reported as spanning nothing because what they cross sits
      // 24m out, beyond the sample. The deck's own bounding box says how far to
      // look.
      //
      // And OR WATER: the rule was written before the project had any, so it
      // demanded a carriageway and would have failed the Helix, the Jubilee and
      // the Bayfront bridges, which cross Marina Bay and no road at all.
      const sz3 = box.getSize(new T.Vector3());
      const halfLen = Math.max(sz3.x, sz3.z) / 2 + 4;
      const along = sz3.x >= sz3.z ? [1, 0] : [0, 1];
      let spans = false;
      for (let d = -halfLen; d <= halfLen && !spans; d += 2) {
        const sx3 = c3.x + along[0] * d, sz4 = c3.z + along[1] * d;
        if (window.__onRoad(sx3, sz4, 0)) spans = true;
        else if (window.__inWater && window.__inWater(sx3, sz4)) spans = true;
      }
      // AN APPROACH SPAN CROSSES NOTHING AND IS STILL A BRIDGE. The Sentosa
      // Boardwalk's shore-end deck tile sits wholly over the apron before the
      // water starts — no carriageway, no water under its whole long axis —
      // and was the check's one 2026-08-03 finding. If a mapped bridge=1 way
      // runs within the deck's own reach (these are 110m MERGED tiles, so the
      // centre can sit 20m+ off the way — measured 20.9m for the Boardwalk),
      // this deck is that bridge's approach, not an orphan slab.
      if (!spans) {
        for (const r of data.roads || []) {
          if (!r.bridge) continue;
          for (let i = 0; i < r.p.length - 1 && !spans; i++) {
            const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
            const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
            let t = L2 < 1e-9 ? 0 : ((c3.x - x1) * vx + (c3.z - z1) * vz) / L2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx = c3.x - (x1 + vx * t), dz = c3.z - (z1 + vz * t);
            // deck fabric is merged per ~110m tile, so the reach is the
            // larger of the deck's own half-length and half a tile side
            const reach = Math.max(halfLen, 55);
            if (dx * dx + dz * dz < reach * reach) spans = true;
          }
          if (spans) break;
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
      //
      // 55m, not 45: measured on Rochor Road 2026-08-03, the stop-line signal
      // at 2366,7080 stands 49.6m from its own mapped crossing node — that is
      // what an eight-lane trunk approach is like.
      let servesCrossing = false;
      for (const c of data.crossings || []) {
        if (Math.hypot(c[0] - sx, c[1] - sz) < 55) { servesCrossing = true; break; }
      }
      // ...and a signal STANDING AT a major carriageway serves it: mid-block
      // bus-priority and U-turn signals exist on every trunk road here, and
      // OSM maps the head without any companion crossing (Ophir Road at
      // 3089,7862, verified against the raw extract — no crossing node and no
      // cross-way exist to find). Minor roads do not get this pass: a signal
      // beside a service lane with nothing to serve is still furniture.
      let atMajor = false;
      if (names.size < 2 && !servesCrossing) {
        for (const r of data.roads || []) {
          if (!['trunk', 'primary', 'secondary'].includes(r.k)) continue;
          for (let i = 0; i < r.p.length - 1 && !atMajor; i++) {
            const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
            const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
            let t = L2 < 1e-9 ? 0 : ((sx - x1) * vx + (sz - z1) * vz) / L2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx = sx - (x1 + vx * t), dz = sz - (z1 + vz * t);
            if (dx * dx + dz * dz < 8 * 8) atMajor = true;
          }
          if (atMajor) break;
        }
      }
      if (names.size < 2 && !servesCrossing && !atMajor) {
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
      // BY MECHANISM. See street.js's emit(): the walkway's roof and posts now
      // carry userData flags, so this stops guessing from radii and widths.
      if (!o.userData.walkwayPost) return;
      const m4 = new T.Matrix4(), v3 = new T.Vector3();
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4); v3.setFromMatrixPosition(m4);
        if (v3.y > -900) posts.push([v3.x, v3.z]);
      }
    });
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      if (!o.userData.walkwayRoof) return;
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

  /* D21  zebra bars laid along the road instead of across it. A crossing is
     perpendicular to the carriageway; one laid parallel is a ladder painted
     down the lane. Nothing has ever checked an ORIENTATION. */
  {
    const bad = [];
    const m4 = new T.Matrix4(), v3 = new T.Vector3(), q4 = new T.Quaternion();
    const sc3 = new T.Vector3(), fwd = new T.Vector3();
    sc.traverse((o) => {
      if (!o.isInstancedMesh || o.geometry.type !== 'PlaneGeometry') return;
      const pr = o.geometry.parameters || {};
      if (!(Math.abs((pr.width || 0) - 0.62) < 0.2 && (pr.height || 0) > 2)) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4);
        m4.decompose(v3, q4, sc3);
        // the bar's long axis in world space
        fwd.set(0, 1, 0).applyQuaternion(q4);
        const barAng = Math.atan2(fwd.x, fwd.z);
        // the road's direction here
        // At a junction a crossing over one street is PARALLEL to the other,
        // so "the nearest road" is the wrong question — and junctions are
        // exactly where crossings are. A bar is square if it is perpendicular
        // to ANY carriageway near it.
        const dirs = window.__roadDirsNear ? window.__roadDirsNear(v3.x, v3.z, 16) : [];
        if (!dirs.length) continue;
        let bestOff = Math.PI;
        for (const dir of dirs) {
          const roadAng = Math.atan2(dir[0], dir[1]);
          let d = Math.abs(barAng - roadAng) % Math.PI;
          if (d > Math.PI / 2) d = Math.PI - d;
          bestOff = Math.min(bestOff, Math.PI / 2 - d);
        }
        if (bestOff > 0.52) {
          bad.push(`a zebra bar is ${(bestOff * 180 / Math.PI).toFixed(0)} degrees off square to every street near it at ${v3.x | 0},${v3.z | 0}`);
        }
      }
    });
    report('D21', 'zebra bars not laid across the road', bad);
  }

  /* D22  can the player reach the edge of the world. The heightfield is padded
     90m past the sampled roads; ride past that and the ground stops. */
  {
    const t = window.__terrain && window.__terrain.g;
    const bad = [];
    if (t) {
      const x0 = t.x0, z0 = t.z0;
      const x1 = t.x0 + (t.nx - 1) * t.cell, z1 = t.z0 + (t.nz - 1) * t.cell;
      let outside = 0, n = 0;
      for (const r of data.roads || []) {
        for (const [x, z] of r.p) {
          n++;
          if (x < x0 || x > x1 || z < z0 || z > z1) outside++;
        }
      }
      if (outside) bad.push(`${outside} of ${n} road points lie outside the heightfield`);
    }
    report('D22', 'roads running off the edge of the ground', bad);
  }

  /* ==================================================================
     Round added with the shopfronts. Everything above was written before
     src/shopfront.js existed, so nothing above looks at 3,624 new pieces of
     geometry, and the general classes (D24 to D31) are ones no check covers
     for any subsystem.
     ================================================================== */

  /* D24  retail glazing on a building that would never have any.
     A cathedral does not have shop windows. landmarks.js already keeps a
     NO_SHOPFRONT set for exactly this and the bay builder does not consult it,
     so the test here is deliberately crude and name-based: if it finds
     anything, the fix is to use the real list, not to copy this regex. */
  {
    // NARROWED. "gallery" matched Mandarin Gallery and Steinway Gallery, which
    // are a shopping mall and a piano shop; "court" matched Selegie Court and
    // Cairnhill Court, which are flats. 43 of the first 77 findings were the
    // probe over-matching, which is the same lesson the landmark recipes
    // learned when "Grand Park City Hall" was handed a Corinthian colonnade.
    // Only words that cannot be anything else are left. Whatever this finds now
    // is a gap in landmarks.js's NO_SHOPFRONT list, which the builder consults.
    const CIVIC = /cathedral|church|chapel|mosque|synagogue|museum|monument|memorial|cenotaph|parliament|embassy/i;
    const bad = [];
    for (const b of window.__shopBays || []) {
      if (CIVIC.test(b.building || '')) bad.push(`bay on "${b.building}" at ${b.x | 0},${b.z | 0}`);
    }
    report('D24', 'shop bays glazing a civic building', bad);
  }

  /* D25  the same frontage glazed twice.
     OSM maps a block and a building:part over each other often enough that two
     footprints can share a wall. Two sets of bays on one wall z-fight, and at
     the fascia it is two names on top of each other. */
  {
    const CE = 6, g = new Map();
    const bays = window.__shopBays || [];
    const bad = [];
    for (const b of bays) {
      const k = Math.floor(b.x / CE) + ',' + Math.floor(b.z / CE);
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(b);
    }
    for (const b of bays) {
      const cx = Math.floor(b.x / CE), cz = Math.floor(b.z / CE);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        for (const o of g.get((cx + i) + ',' + (cz + j)) || []) {
          if (o === b) continue;
          const d = Math.hypot(o.x - b.x, o.z - b.z);
          // facing roughly the same way, and closer than a bay is wide
          if (d < 1.4 && (o.nx * b.nx + o.nz * b.nz) > 0.5) {
            bad.push(`two bays ${d.toFixed(2)}m apart at ${b.x | 0},${b.z | 0}`
              + ` ("${b.name || 'unnamed'}" / "${o.name || 'unnamed'}")`);
          }
        }
      }
    }
    // each pair is found twice, once from each end
    report('D25', 'the same frontage glazed twice', bad.slice(0, Math.ceil(bad.length / 2)));
  }

  /* D26  a bay glazing the inside of something DRAWN.
     S6 asks whether a footprint is in front of the bay, and a footprint is the
     map. Podiums, colonnades, entrance canopies, ION's shells and the covered
     walkway are placed by recipes and have no footprint at all — the same blind
     spot that let collision be built from OSM outlines while 11.5% of the walls
     at rider height had none. So: raycast outward from the glass through the
     geometry that exists. Sampled, because 3,624 rays against the whole scene
     is a minute of work for a probe. */
  {
    const bays = (window.__shopBays || []);
    const step = Math.max(1, Math.floor(bays.length / 500));
    const ray = new T.Raycaster();
    ray.far = 4.0;
    const bad = [];
    let sampled = 0;
    for (let i = 0; i < bays.length; i += step) {
      const b = bays[i];
      sampled++;
      // AT GLASS LEVEL, NOT AT FASCIA LEVEL. "Walled off from the street" means
      // you cannot SEE INTO THE SHOP, and the thing that decides that is what
      // stands in front of the GLAZING. Sampling at 55% of the bay put the ray
      // up among the fascia band, the awning line and the covered-walkway
      // beams — so a five-foot way with a beam over it read as a wall.
      //
      // This file already excuses the five-foot way for COLUMNS: "a column
      // stops one ray, a wall stops all three". A BEAM running along the
      // frontage stops all three too, so the three-ray rule never caught it.
      // Measured: Orchard 7 findings -> 2 and Chinatown 3 -> 1 on moving the
      // ray down to the glazing. The ones that remain are obstructions you
      // would actually walk into.
      // AT GLASS LEVEL, NOT AT FASCIA LEVEL. "Walled off from the street" means
      // you cannot SEE INTO THE SHOP, and what decides that is whatever stands
      // in front of the GLAZING. Sampling at 55% of the bay put the ray up among
      // the fascia band, the awning line and the covered-walkway beams, so a
      // five-foot way with a beam over it read as a wall. This file already
      // excuses the five-foot way for COLUMNS — "a column stops one ray, a wall
      // stops all three" — but a BEAM along the frontage stops all three too, so
      // the three-ray rule never caught it. Measured on moving the ray down to
      // the glazing: Orchard 7 findings -> 2, Chinatown 3 -> 1.
      const y = b.y + (b.top - b.y) * 0.35;
      const tx = -b.nz, tz = b.nx;                  // along the frontage
      // THREE rays, not one, and the bay only counts as hidden if all three are
      // stopped. A single ray reported four bays with "something 6cm in front
      // of the glass" and every one of them was an entrance-canopy COLUMN
      // standing 0.9m out — which is a five-foot-way, not a defect: half the
      // shops on this island are behind a colonnade. A column stops one ray, a
      // wall stops all three.
      let blocked = 0, what = '';
      for (const off of [-1.2, 0, 1.2]) {
        const ox = b.x + tx * off + b.nx * 3.2, oz = b.z + tz * off + b.nz * 3.2;
        ray.set(new T.Vector3(ox, y, oz), new T.Vector3(-b.nx, 0, -b.nz).normalize());
        const hits = ray.intersectObjects(sc.children, true)
          // THE SKY IS NOT A WALL. The dome is a 480m sphere drawn inside-out
          // around the world, so a ray fired outward from a shopfront hits it
          // every single time — and this check reported a Tekka Centre bay as
          // "walled off by SphereGeometry(480)". audit_world.js already knows
          // to find and skip it (it looks for a SphereGeometry over radius
          // 100); this file did not, which is the same rule-in-one-file-only
          // pattern that put median kerbs in the bay tonight.
          .filter((h) => !(h.object.geometry
            && h.object.geometry.type === 'SphereGeometry'
            && (h.object.geometry.parameters || {}).radius > 100))
          .filter((h) => h.distance > 0.02 && h.object.visible);
        // the bay's own frontmost geometry is its fascia, 0.46m proud of the
        // facade, so anything stopping the ray more than 0.6m short of that is
        // standing between the street and the shop
        // A SIGN IS NOT A WALL. Two of the seven survivors were a 1.7m-tall
        // 8cm-thick panel and a fascia board — things that hang in front of a
        // shop by design. Anything under 30cm thick is signage, a fin or a
        // banner, and a bay behind one is not walled off.
        const h0 = hits[0];
        const thin = (() => {
          if (!h0) return false;
          const g = h0.object.geometry;
          if (!g.boundingBox) g.computeBoundingBox();
          const s2 = g.boundingBox.getSize(new T.Vector3());
          return Math.min(s2.x, s2.z) < 0.3 && s2.y < 4;
        })();
        if (hits.length && !thin && hits[0].distance < 3.2 - b.depth - 0.6) {
          blocked++;
          // WHAT it hit, not just that it hit. Two rounds went into guessing
          // why the builder's wall grid and this ray disagreed; the grid only
          // records near-vertical faces crossing 0.45-2.4m above the ground, so
          // the answer was always going to be a property of the thing hit.
          if (!what) {
            const o = hits[0].object;
            const g = o.geometry;
            if (!g.boundingBox) g.computeBoundingBox();
            // WORLD space. The local bounding box of a positioned mesh says
            // nothing about where it is, and reading one as if it did produced
            // "y 22.9..45.3" for something a ray at 2.4m had just hit.
            const bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
            const pr = g.parameters || {};
            const dims = [pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
              .filter((v) => v != null).map((v) => +v.toFixed(2)).join('x');
            what = `${g.type}(${dims}) y ${bb.min.y.toFixed(1)}..${bb.max.y.toFixed(1)}`
              + ` hit at y ${hits[0].point.y.toFixed(1)}, ${(3.2 - hits[0].distance).toFixed(2)}m out`;
          }
        }
      }
      // A LEDGE IS NOT A WALL. Mandarin Gallery's deep facade bands stopped
      // all three 35%-height rays while the glazing under them reads
      // perfectly from the pavement (vetted from 300,7135 on 2026-08-03,
      // shots/street/d26mg.shot2.jpg). "Walled off" means you cannot see
      // into the shop at ANY height — so before convicting, ask the LOWER
      // glazing: if a ray at 12% passes clear, the blocker is an overhang.
      // A building nose-to-nose or a roadside parapet blocks low too and
      // stays convicted.
      if (blocked === 3) {
        const yLow = b.y + (b.top - b.y) * 0.12;
        const ox = b.x + b.nx * 3.2, oz = b.z + b.nz * 3.2;
        ray.set(new T.Vector3(ox, yLow, oz), new T.Vector3(-b.nx, 0, -b.nz).normalize());
        const lowHits = ray.intersectObjects(sc.children, true)
          .filter((h) => !(h.object.geometry
            && h.object.geometry.type === 'SphereGeometry'
            && (h.object.geometry.parameters || {}).radius > 100))
          .filter((h) => h.distance > 0.02 && h.object.visible)
          .filter((h) => {
            const g = h.object.geometry;
            if (!g.boundingBox) g.computeBoundingBox();
            const s2 = g.boundingBox.getSize(new T.Vector3());
            return !(Math.min(s2.x, s2.z) < 0.3 && s2.y < 4);   // thin signage
          });
        const lowBlocked = lowHits.length && lowHits[0].distance < 3.2 - b.depth - 0.6;
        if (!lowBlocked) blocked = 0;               // an overhang, not a wall
      }
      if (blocked === 3) {
        bad.push(`bay at ${b.x | 0},${b.z | 0} walled off by ${what} `
          + `("${b.name || 'unnamed'}" on ${b.building || '?'})`);
      }
    }
    report('D26', 'shop bays walled off from the street', bad,
           `${sampled} of ${bays.length} bays sampled, three rays each`);
  }

  /* D27  anything instanced that is buried.
     D2 checks three signatures it knows the origin height of. This asks a
     weaker question of EVERYTHING: is the origin more than 1.2m under the
     surface? Nothing legitimate is, except the things whose origin is
     deliberately below ground, which are listed. */
  {
    const m4 = new T.Matrix4(), p4 = new T.Vector3(), q4 = new T.Quaternion(), s4 = new T.Vector3();
    const bad = {}, ex = [];
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const g = o.geometry, pr = g.parameters || {};
      const sig = `${g.type}(${[pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
        .filter((v) => v != null).map((v) => +v.toFixed(2)).join(',')})`;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4);
        m4.decompose(p4, q4, s4);
        p4.applyMatrix4(o.matrixWorld);
        if (p4.y < -900) continue;                  // parked out of the world on purpose
        // A PROP UNDER A BRIDGE IS NOT BURIED, and this check said it was.
        //
        // surfaceAt answers with the DECK wherever a bridge crosses, so the
        // covered walkway that passes beneath the Fort Canning footbridge --
        // seated correctly on ground at 8-10m, roof at ~12m, deck overhead at
        // 14.6m -- was reported as "2.8m under the surface". Six props, all
        // of them built exactly where they belong.
        //
        // The question this check means to ask is whether a prop is below the
        // ground IT STANDS ON. So when a deck exists ABOVE the prop, the deck
        // is not that ground; the terrain is.
        const _deck = window.__bridgeDeckAt(p4.x, p4.z);
        const _surf = (_deck !== null && p4.y < _deck)
          ? window.__terrain.at(p4.x, p4.z)
          : window.__surfaceAt(p4.x, p4.z);
        const d = _surf - p4.y;
        if (d > 1.2) {
          bad[sig] = (bad[sig] || 0) + 1;
          if (ex.length < 6) ex.push(`${sig} ${d.toFixed(1)}m under the surface at ${p4.x | 0},${p4.z | 0}`);
        }
      }
    });
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    report('D27', 'instanced props buried more than 1.2m', n ? ex : [],
           n ? `${n} across ${Object.keys(bad).length} signatures` : undefined);
  }

  /* D28  a pedestrian route that goes through a wall.
     B3 proves every path is CONTINUOUS and B5 proves you cannot walk into a
     mapped building, and neither asks whether the routes the crowd is given
     pass through one. A walker gliding through Tangs is not a frame
     discontinuity and not a collision failure; it is a bad path. */
  {
    // Against the DRAWN WALLS, not against footprints. The first version used
    // footprints and found nine vertices inside hotels — Concorde, Rendezvous,
    // Hotel Rendezvous again — and every one of them was a service road running
    // under a porte-cochere, which is a place you can genuinely walk. A
    // footprint says a building is mapped there; the collision grid says
    // whether anything is actually in the way.
    const paths = window.__crowdPaths ? window.__crowdPaths() : [];
    const solid = window.__solid;
    let n = 0, inside = 0;
    const ex = [];
    if (solid) for (const p of paths) {
      for (let i = 0; i < p.pts.length; i++) {
        const [x, z] = p.pts[i];
        n++;
        if (solid(x, z)) {
          inside++;
          if (ex.length < 6) {
            const b = buildingAt(x, z);
            ex.push(`path ${p.i} point ${i} is inside a wall at ${x | 0},${z | 0}`
              + (b ? ` ("${b.n || 'a building'}")` : ''));
          }
        }
      }
    }
    report('D28', 'crowd path vertices inside a drawn wall', inside ? ex : [],
           `${n} vertices over ${paths.length} paths` + (inside ? `, ${inside} in a wall` : ''));
  }

  /* D29  props sitting exactly on the world origin.
     An InstancedMesh slot that never had a matrix written to it sits at (0,0,0)
     with unit scale, which is a real bug that looks like a pile of furniture at
     the island datum — seven kilometres from anything anyone will ride past, so
     nobody would ever see it. */
  {
    const m4 = new T.Matrix4(), p4 = new T.Vector3(), q4 = new T.Quaternion(), s4 = new T.Vector3();
    const bad = [];
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      let atOrigin = 0;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4);
        m4.decompose(p4, q4, s4);
        // y under -900 is a slot deliberately parked out of the world. That is
        // its own problem — the GPU still draws it, see the crowd bag — but it
        // is not an unwritten matrix, and conflating the two sent this probe
        // after eight pedestrian handbags.
        if (p4.y < -900) continue;
        if (Math.abs(p4.x) < 0.01 && Math.abs(p4.z) < 0.01) atOrigin++;
      }
      if (atOrigin) {
        const pr = o.geometry.parameters || {};
        const dims = [pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
          .filter((v) => v != null).map((v) => +v.toFixed(2)).join('x');
        bad.push(`${atOrigin} of ${o.count} instances of ${o.geometry.type}(${dims}) at (0,0)`);
      }
    });
    report('D29', 'instances left at the world origin', bad);
  }

  /* D30  geometry that is not finite.
     One NaN in a position buffer poisons the bounding sphere, and a mesh with a
     NaN bounding sphere is either never culled or never drawn, depending on the
     path. Both look like something else entirely. */
  {
    const bad = [];
    sc.traverse((o) => {
      if (!o.isMesh) return;
      const pos = o.geometry.attributes && o.geometry.attributes.position;
      if (!pos) return;
      const bs = o.geometry.boundingSphere;
      if (bs && (!Number.isFinite(bs.radius) || !Number.isFinite(bs.center.x))) {
        bad.push(`${o.geometry.type} has a non-finite bounding sphere`); return;
      }
      const stride = Math.max(1, Math.floor(pos.count / 400));
      for (let i = 0; i < pos.count; i += stride) {
        if (!Number.isFinite(pos.getX(i)) || !Number.isFinite(pos.getY(i)) || !Number.isFinite(pos.getZ(i))) {
          bad.push(`${o.geometry.type} has a non-finite vertex`); return;
        }
      }
    });
    report('D30', 'geometry with non-finite numbers in it', bad);
  }

  /* D31  a fascia nobody can read.
     A sign is only a sign if it faces the street. The bay normal comes from the
     footprint edge, and a footprint edge can face away from the road it was
     matched to when the frontage wraps a corner. */
  {
    // `__nearestStreet` returns a NAME, not a position, so the distance is
    // measured here. The bay's normal is world — it is where the fascia was
    // actually turned — and the road is map, which is fine: the road is drawn
    // from that map and the question is whether the two agree.
    const RC = 40, rg = new Map();
    for (const r of data.roads || []) {
      if (r.k === 'footway') continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const a = r.p[i], c = r.p[i + 1];
        const mnx = Math.min(a[0], c[0]) - 30, mxx = Math.max(a[0], c[0]) + 30;
        const mnz = Math.min(a[1], c[1]) - 30, mxz = Math.max(a[1], c[1]) + 30;
        for (let cx = Math.floor(mnx / RC); cx <= Math.floor(mxx / RC); cx++)
          for (let cz = Math.floor(mnz / RC); cz <= Math.floor(mxz / RC); cz++) {
            const k = cx + ',' + cz;
            if (!rg.has(k)) rg.set(k, []);
            rg.get(k).push([a, c]);
          }
      }
    }
    const roadDist = (x, z) => {
      let best = Infinity;
      const cx = Math.floor(x / RC), cz = Math.floor(z / RC);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++)
        for (const [a, c] of rg.get((cx + i) + ',' + (cz + j)) || []) {
          const vx = c[0] - a[0], vz = c[1] - a[1], L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const d = Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t));
          if (d < best) best = d;
        }
      return best;
    };
    const bad = [];
    for (const b of window.__shopBays || []) {
      if (!b.name) continue;
      // six metres out along the fascia's own normal, against six metres behind
      // it. A sign that faces the street gets closer to a road going forward.
      // "Faces the NEAREST street" was the wrong question and it flagged seven
      // corner sites — 313@Somerset has Orchard Road one side and Somerset Road
      // the other, and a fascia facing the road 8m away rather than the one 4m
      // behind it is a corner, not a defect. The real defect is a fascia facing
      // no street at all.
      const out = roadDist(b.x + b.nx * 6, b.z + b.nz * 6);
      if (out > 30) {
        bad.push(`"${b.name}" at ${b.x | 0},${b.z | 0} faces open ground: `
          + `nearest road ${out.toFixed(0)}m ahead`);
      }
    }
    report('D31', 'tenant fascias facing no street at all', bad);
  }

  /* D32  a body part that is not on its body.
     A pedestrian is fourteen InstancedMeshes sharing a slot index, so a single
     mistake in which slot a part is written to detaches it and leaves it
     standing on the pavement on its own. Two comparison frames showed a dark
     block lying near a walker; nothing measures this, because every check so
     far has treated a pedestrian as a POSITION rather than as an assembly. */
  {
    const m4 = new T.Matrix4(), p4 = new T.Vector3();
    const q4 = new T.Quaternion(), s4 = new T.Vector3();
    // where each drawn person is, by slot
    const at = [];
    const parts = [];
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const g = o.geometry, pr = g.parameters || {};
      const sig = `${g.type}(${[pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
        .filter((v) => v != null).map((v) => +v.toFixed(2)).join(',')})`;
      // the torso is the trunk of a walker and nothing else in the world uses
      // this capsule
      // The signature was guessed twice and both guesses reported "0 walkers
      // drawn" — which looks exactly like a clean world. Enumerate the meshes
      // and read it: CapsuleGeometry carries `radius` and `height`, and the
      // shared builder orders them height then radius.
      if (sig === 'CapsuleGeometry(0.34,0.13)') {
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, m4); m4.decompose(p4, q4, s4);
          p4.applyMatrix4(o.matrixWorld);
          at[i] = [p4.x, p4.z];
        }
      }
      parts.push([sig, o]);
    });
    const bad = [];
    if (at.length) {
      for (const [sig, o] of parts) {
        // BY IDENTITY, not by resemblance. This used to take any instanced
        // mesh whose count matched the number of walkers drawn, and a
        // pedestrian railing post happened to have exactly 57 -- so the probe
        // reported all 57 of them "detached from their torso, worst 1619.6m"
        // and looked like a serious crowd bug. The crowd builder tags its own
        // meshes now.
        if (!o.userData || !o.userData.crowdPart) continue;
        if (!/Box|Sphere|Capsule|Cylinder/.test(sig)) continue;
        // Only parts indexed BY PERSON. The bag has its own slot counter now
        // (a bagless walker used to have one drawn at y=-9999 every frame), so
        // its index i is a different i and comparing them would invent
        // findings.
        if (o.count !== at.length) continue;
        let far = 0, worst = 0;
        for (let i = 0; i < Math.min(o.count, at.length); i++) {
          if (!at[i]) continue;
          o.getMatrixAt(i, m4); m4.decompose(p4, q4, s4);
          p4.applyMatrix4(o.matrixWorld);
          const d = Math.hypot(p4.x - at[i][0], p4.z - at[i][1]);
          if (d > 1.2) { far++; if (d > worst) worst = d; }
        }
        if (far) bad.push(`${sig}: ${far} of ${o.count} more than 1.2m from their torso, worst ${worst.toFixed(1)}m`);
      }
    }
    report('D32', 'pedestrian parts detached from their pedestrian', bad,
           `${at.length} walkers drawn`);
  }

  /* ==================================================================
     Round three. The population went from 460 to 2,200 and the fleet from 21
     to 90, and every actor-on-actor class below was impossible to hit at the
     old numbers: 21 vehicles spaced over 2,586m cannot collide with each other
     by accident. Density does not just make a street look busier, it makes a
     whole family of defects reachable for the first time.
     ================================================================== */

  /* D33  two people standing in the same place.
     A pedestrian is 0.5m across. Anything closer than that is one body inside
     another, which at 2,200 of them on a finite set of pavements is a real
     risk and reads as a single smeared figure.

     SCOPED TO WHAT CAN BE SEEN, and this is a measurement rather than a
     concession. The separation pass runs within 120m of the ride and the draw
     cull is 105m -- a 15m band, deliberately sized so a pair is separated
     before it is ever drawn. Measured 2026-07-29: overlapping pairs existed
     only at 816m to 3.7km from the ride, NONE inside the 105m draw range at
     any sampled moment; riding to one (window.__teleport onto 1127,7367)
     cleared it within four seconds and while it cleared it was still 6m
     behind the camera. Counting unseparated walkers a kilometre away measures
     the laziness of the pass, not a defect in the world, and the alternative
     -- running separation for all 2,200 -- was measured at five frames a
     second to fix something nobody can look at.
     The far count is PRINTED, not dropped: a scope this check applies to
     itself has to be visible, or the next reader cannot argue with it. */
  {
    const pos = window.__crowdPositions ? window.__crowdPositions() : [];
    const ride = window.__ridePos ? window.__ridePos() : [0, 0];
    const SEEN = 105;                     // the draw cull, kept equal to actors.js
    const CE = 1.0, g = new Map();
    for (let i = 0; i < pos.length; i++) {
      const p = pos[i];
      if (!p) continue;
      const k = Math.floor(p[0] / CE) + ',' + Math.floor(p[1] / CE);
      if (!g.has(k)) g.set(k, []);
      g.get(k).push([p[0], p[1], i]);
    }
    let pairs = 0, farPairs = 0; const ex = [];
    for (const [, list] of g) {
      for (const [x, z, i] of list) {
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
          for (const [x2, z2, j] of g.get((Math.floor(x / CE) + dx) + ',' + (Math.floor(z / CE) + dz)) || []) {
            if (j <= i) continue;
            const d = Math.hypot(x - x2, z - z2);
            if (d >= 0.45) continue;
            if (Math.hypot(x - ride[0], z - ride[1]) > SEEN) { farPairs++; continue; }
            pairs++;
            if (ex.length < 6) ex.push(`two walkers ${d.toFixed(2)}m apart at ${x | 0},${z | 0}`);
          }
        }
      }
    }
    report('D33', 'pedestrians standing inside each other', pairs ? ex : [],
           `${pos.length} walkers, ${farPairs} more pairs beyond the ${SEEN}m draw range `
           + `(separated before they are drawn -- see the note in defects.mjs)`);
  }

  /* D34  two vehicles in the same place.
     Same class, and the fleet spacing was computed for a fleet a quarter of
     this size: `s` is spread evenly over the path and jittered by up to six
     metres, which at 21 vehicles is 123m apart and at 90 is 28m. */
  {
    // IN THE ROAD FRAME, not as centre-to-centre distance.
    //
    // The first version measured the straight-line gap and reported nine
    // overlaps, every one of them "car and bus" 2.7 to 4.5m apart — which is a
    // car in one lane and a bus in the next, three and a half metres across and
    // perfectly fine. Two vehicles overlap only if they share the lane AND the
    // gap along the street is less than their combined half-lengths. A road is
    // not a plane, it is a set of lanes, and a check that forgets that reports
    // ordinary traffic as a pile-up.
    // ...AND IN THE WORLD FRAME WHEN THE TWO ARE NOT ON THE SAME PATH.
    //
    // The lane/arclength form above is right for one fleet and blind between
    // fleets. `s` is measured along ONE path from ONE origin, and there are
    // eight fleets in the region — River Valley Road carries two of them,
    // because River Valley and Robertson both claim it as their axis and 28 of
    // its 79 points lie within 12m of the other. Two cars a metre apart on
    // those two paths have `s` values hundreds of metres apart, so this check
    // called them clear. Fifth instance of the same disease: measuring one
    // fact with the wrong ruler.
    //
    // So: same fleet -> the lane/arclength test, which knows about lanes.
    // Different fleets -> overlap of the two oriented rectangles on the ground,
    // which needs no shared ruler at all.
    const tr = window.__trafficState ? window.__trafficState() : [];
    const LEN = { car: 4.32, bus: 11.8 };
    const WID = { car: 1.82, bus: 2.55 };
    const bad = [];
    // separating-axis test on two oriented rectangles
    const corners = (v) => {
      const h = (v.heading || 0), L = LEN[v.kind] / 2, W = WID[v.kind] / 2;
      const cx = Math.cos(h), sx = Math.sin(h);
      const out = [];
      for (const [dl, dw] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
        out.push([v.x + sx * L * dl + cx * W * dw, v.z + cx * L * dl - sx * W * dw]);
      }
      return out;
    };
    const overlap = (A, B) => {
      for (const P of [A, B]) {
        for (let i = 0; i < 4; i++) {
          const ax = P[(i + 1) % 4][0] - P[i][0], az = P[(i + 1) % 4][1] - P[i][1];
          const nx = -az, nz = ax;
          let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
          for (const q of A) { const d = q[0] * nx + q[1] * nz; a0 = Math.min(a0, d); a1 = Math.max(a1, d); }
          for (const q of B) { const d = q[0] * nx + q[1] * nz; b0 = Math.min(b0, d); b1 = Math.max(b1, d); }
          if (a1 < b0 || b1 < a0) return false;      // a separating axis exists
        }
      }
      return true;
    };
    // only test pairs that are close enough to possibly touch
    const CELL = 16, grid = new Map();
    tr.forEach((v, i) => {
      if (v.x === undefined) return;
      const k = Math.floor(v.x / CELL) + ',' + Math.floor(v.z / CELL);
      let l = grid.get(k); if (!l) { l = []; grid.set(k, l); }
      l.push(i);
    });
    const seen = new Set();
    for (const [k, list] of grid) {
      const [gx, gz] = k.split(',').map(Number);
      const near = [];
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const l = grid.get((gx + dx) + ',' + (gz + dz));
        if (l) near.push(...l);
      }
      for (const i of list) for (const j of near) {
        if (i >= j) continue;
        const key = i + ':' + j;
        if (seen.has(key)) continue;
        seen.add(key);
        const a = tr[i], b = tr[j];
        if (a.fleet === b.fleet) {
          if (a.dir !== b.dir) continue;                     // opposing flows
          if (Math.abs(a.lane - b.lane) > 2.6) continue;     // different lanes
          const gap = Math.abs(a.s - b.s);
          const need = (LEN[a.kind] + LEN[b.kind]) / 2;
          if (gap < need) {
            bad.push(`${a.kind} and ${b.kind} share a lane with ${gap.toFixed(1)}m `
              + `between centres at ${a.x | 0},${a.z | 0} (needs ${need.toFixed(1)}m)`);
          }
        } else if (overlap(corners(a), corners(b))) {
          bad.push(`${a.kind} (fleet ${a.fleet}) and ${b.kind} (fleet ${b.fleet}) `
            + `occupy the same tarmac at ${a.x | 0},${a.z | 0}`);
        }
      }
    }
    const fleets = new Set(tr.map((v) => v.fleet)).size;
    report('D34', 'vehicles overlapping each other', bad,
      `${tr.length} vehicles in ${fleets} fleet(s)`);
  }

  /* D35  a vehicle not on the road.
     B4 measures the RIDER's wheels against the ground. Nothing has ever asked
     the same question of the traffic, which is 90 vehicles now and drives the
     whole length of the street. */
  {
    const tr = window.__trafficState ? window.__trafficState() : [];
    const offRoad = [], sunk = [];
    for (const v of tr) {
      if (v.x === undefined) continue;
      if (!window.__onRoad(v.x, v.z, 0.6)) {
        offRoad.push(`a ${v.kind} is off the carriageway at ${v.x | 0},${v.z | 0}`);
      }
    }
    report('D35', 'vehicles driving off the carriageway', offRoad, `${tr.length} vehicles`);
  }

  /* D40, D41, D42  THE THREE THINGS TODAY'S TRAFFIC REGRESSION DID, none of
     which any check could see.

     On 2026-08-02 the boot build kept creating its own fleet for a chunk whose
     roads had been emptied, and the rider reported all three within minutes of
     it going live: "why now orchard got traffic flowing backwards", "once i
     load orchard why got vehicles hitting me alr", and a second invisible
     fleet on the same street. EVERY district passed 42/42 throughout. D34
     (vehicles overlapping) and D35 (vehicles off the carriageway) were both
     happy, because a fleet driving the wrong way down its own carriageway is
     neither overlapping nor off the road.

     A gate that has never failed is not a gate, so all three were TESTED by
     reintroducing the bug and re-running against the WORLD scene (a district
     scene cannot show it — its boot chunk has roads either way, which is why
     the first attempt at this test proved nothing):

       D41  FIRES.  1 finding with the bug, 0 without. This is the real gate.
       D40  did not fire — the broken spec produced a consistent-but-wrong
            direction rather than a mixed one, so "both ways on one side" is
            not the shape that failure took.
       D42  did not fire at the moment defects.mjs samples.

     D41 is enough on its own, and not by luck: the backwards traffic WAS the
     duplicate fleet. The boot build's fleet, built from a chunk with no roads
     to read a direction from, is the same object as the second fleet on the
     street — kill it and both symptoms go. D40 and D42 are kept as cheap
     belt-and-braces for variants that would take a different shape, and are
     honestly labelled here as UNPROVEN rather than counted as gates. */
  {
    const tr = window.__trafficState ? window.__trafficState() : [];
    // D40: on a dual carriageway the side of the axis a vehicle sits decides
    // which way it goes. `lane` is the signed offset from the centreline and
    // `dir` is which way it drives, so every vehicle on one side of one fleet
    // must agree. When axisSpec had no roads to read, they did not.
    const bySide = new Map();
    for (const v of tr) {
      if (v.lane === undefined || v.dir === undefined) continue;
      const k = v.fleet + '|' + (v.lane < 0 ? 'L' : 'R');
      if (!bySide.has(k)) bySide.set(k, { plus: 0, minus: 0, x: v.x, z: v.z });
      const e = bySide.get(k);
      if (v.dir > 0) e.plus++; else e.minus++;
    }
    const wrongWay = [];
    for (const [k, e] of bySide) {
      const minority = Math.min(e.plus, e.minus);
      if (minority > 0) {
        wrongWay.push(`fleet ${k.split('|')[0]} side ${k.split('|')[1]}: `
          + `${e.plus} one way and ${e.minus} the other near ${e.x | 0},${e.z | 0}`);
      }
    }
    report('D40', 'vehicles on one side of a street driving both ways', wrongWay,
           `${tr.length} vehicles, ${bySide.size} fleet-sides`);

    // D41: one street, one fleet. A second fleet on the same stretch is
    // invisible traffic the rider collides with — which is exactly what
    // "when i pass nearby a car i will stop" was.
    const fleets = new Map();
    for (const v of tr) {
      if (v.x === undefined) continue;
      if (!fleets.has(v.fleet)) fleets.set(v.fleet, []);
      fleets.get(v.fleet).push(v);
    }
    const doubled = [];
    const ids = [...fleets.keys()];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const A = fleets.get(ids[i]), B = fleets.get(ids[j]);
        let close = 0, wx = 0, wz = 0;
        for (const a of A) {
          for (const b of B) {
            const dx = a.x - b.x, dz = a.z - b.z;
            if (dx * dx + dz * dz < 15 * 15) { close++; wx = a.x; wz = a.z; break; }
          }
          if (close > 6) break;
        }
        if (close > 6) {
          doubled.push(`fleets ${ids[i]} and ${ids[j]} share a street near ${wx | 0},${wz | 0}`);
        }
      }
    }
    report('D41', 'two fleets driving the same street', doubled,
           `${ids.length} fleet(s)`);

    // D42: nothing may be standing on the rider when the world opens.
    // Traffic.build() leaves a clear zone from avoidS+55 precisely so this
    // cannot happen, and the streamed path was passing 0 instead.
    const rp = window.__ridePos ? window.__ridePos() : null;
    const onTop = [];
    if (rp) {
      for (const v of tr) {
        if (v.x === undefined) continue;
        const d = Math.hypot(v.x - rp[0], v.z - rp[1]);
        if (d < 12) onTop.push(`a ${v.kind} ${d.toFixed(1)}m from the rider at ${v.x | 0},${v.z | 0}`);
      }
    }
    report('D42', 'a vehicle standing on the rider at load', onTop,
           rp ? `rider at ${rp[0] | 0},${rp[1] | 0}` : 'no rider');
  }

  /* D36 SAMPLES ONCE, AND ONCE IS THE LOW-WATER MARK. Walkers accumulate in
     carriageways over the first seconds after load — measured in Robertson
     Quay at 4-second intervals: 54, 47, 37, 37, 40 — and this probe runs
     immediately, so it reported 5. A number that is only true in the first
     second is worse than no number. Left as-is deliberately for now, with the
     behaviour written down, because the fix belongs with the junction work in
     NEXT.md; when that lands, sample this over several seconds and take the
     plateau, not the first reading.

     D36  a pedestrian standing in the road who is not crossing it.
     The crowd walks a pavement band offset from the centreline, and the band
     was sized per path; a narrow street or a wide vehicle lane can put the
     band on the tarmac. Crossers are excluded because crossing is the one time
     being on the road is correct. */
  {
    const st = window.__crowdState ? window.__crowdState() : [];
    const pos = window.__crowdPositions ? window.__crowdPositions() : [];
    let onRoad = 0; const ex = [];
    for (let i = 0; i < pos.length && i < st.length; i++) {
      const p = pos[i];
      if (!p || st[i].crossing) continue;
      if (window.__onRoad(p[0], p[1], -0.8)) {
        onRoad++;
        if (ex.length < 6) ex.push(`a walker stands in the carriageway at ${p[0] | 0},${p[1] | 0}`);
      }
    }
    report('D36', 'pedestrians standing in a carriageway', onRoad ? ex : [],
           `${pos.length} walkers, crossers excluded`);
  }

  /* D37  a street tree growing through a wall.
     D6 checks the trees OSM maps. It says nothing about the avenue, which is
     placed by walking the axis and is most of the foliage in the district. */
  {
    const m4 = new T.Matrix4(), p4 = new T.Vector3();
    const q4 = new T.Quaternion(), s4 = new T.Vector3();
    const bad = [];
    let trunks = 0;
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      // ASK THE BUILDER WHAT IT BUILT. Two wrong versions before this one, both
      // trying to recognise a tree by its geometry:
      //
      //   1. `pr.height > 3` — but TreeField's trunk is a UNIT cylinder scaled
      //      by the instance matrix, so its geometry height is 1. This excluded
      //      every tree in the world. The 19 "trunks" it reported were other
      //      cylinders entirely: D37 never once looked at a tree and said PASS
      //      the whole time. Found only when 2,205 trees were added on
      //      2026-08-01 and the trunk count did not move.
      //   2. Matching the SHAPE instead — a stout tapered cylinder, height from
      //      the decomposed scale. That went to 5,255 trunks against 266 real
      //      trees in Robertson, because colonnade piers, lamp columns and
      //      walkway posts are stout tapered cylinders too, and they stand
      //      inside buildings quite legitimately. It reported six of them as
      //      trees growing through walls.
      //
      // A geometry signature is a guess about who made something. TreeField
      // tags its own trunks; ask for the tag. Same fix D20 got with
      // walkwayRoof, and the same lesson this project keeps relearning:
      // identify by MECHANISM, not by shape.
      if (!o.userData.treeTrunk) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4); m4.decompose(p4, q4, s4);
        p4.applyMatrix4(o.matrixWorld);
        if (p4.y < -900) continue;
        trunks++;
        const b = buildingAt(p4.x, p4.z);
        if (b && bad.length < 6) bad.push(`a tree trunk stands inside "${b.n || '(unnamed)'}" at ${p4.x | 0},${p4.z | 0}`);
        else if (b) bad.push('');
      }
    });
    report('D37', 'street trees standing inside a building', bad.filter((x, i) => i < 6 || x),
           `${trunks} trunks`);
  }

  /* D38  a named building whose lowest drawn mass is not on the ground.
     WHAT THIS WAS WRITTEN FOR, 2026-08-01. `extrudeGeo` seats a mass at
     `foot + y0 + h`, so its `y0` argument is measured FROM THE SEAT — but
     `api.footingY()` returns the seat as an ABSOLUTE world height, and eighteen
     calls across seven recipes passed one into the other. That double-counts
     the ground, so every one of those masses floated by exactly the height of
     the ground under it: zero in a district built near sea level, and 10.7m in
     Chinatown, where SRI MARIAMMAN TEMPLE'S MAIN HALL was hanging in the air
     above its own gopuram. It shipped, and it survived 42 audit checks, 35
     defect classes, behaviour, determinism, a live check and five rounds of
     vetting, because every one of those looks at the world in PLAN or asks
     about props, and this is a defect in SECTION on merged building geometry.
     Same family as the roof-datum bug of 2026-07-30 and found the same way:
     by measuring the built scene instead of looking at another frame.

     Only NAMED buildings, because they are the ones a recipe touches, and only
     the mass that should be sitting on the ground — a mass with `mh` starts in
     the air by definition (SkyPark), and so does anything on a bridge. */
  {
    const bad = [];
    const named = data.buildings.filter((b) => b.n && !b.mh && b.p && b.p.length > 2);
    // ASK ABOUT A POINT, NOT ABOUT A RING. The first version attributed a mesh
    // to a building when the MESH's centre fell inside the ring, which misfires
    // twice over: an L-shaped plan's main mass has its centre outside its own
    // ring, so only high pieces got attributed, and a mesh over a shared wall
    // was attributed to whichever neighbour came first. Instead: pick a point
    // that is definitely inside this building, and ask what the lowest thing
    // over that point is. A footprint's centroid can fall outside a concave
    // ring, so it is nudged until it is inside or the building is skipped.
    const probe = new Map();
    for (const b of named) {
      let cx = 0, cz = 0;
      for (const q of b.p) { cx += q[0]; cz += q[1]; }
      cx /= b.p.length; cz /= b.p.length;
      if (!inPoly(b.p, cx, cz)) {
        let found = false;
        for (let i = 0; i < b.p.length && !found; i++) {
          const a2 = b.p[i], c2 = b.p[(i + 1) % b.p.length];
          const mx = (a2[0] + c2[0]) / 2, mz = (a2[1] + c2[1]) / 2;
          for (const t of [0.25, 0.5, 0.75]) {
            const px = mx + (cx - mx) * t, pz = mz + (cz - mz) * t;
            if (inPoly(b.p, px, pz)) { cx = px; cz = pz; found = true; break; }
          }
        }
        if (!found) continue;
      }
      probe.set(b, [cx, cz]);
    }
    // A BUILDING'S OWN PODIUM IS NOT TERRAIN. The mesh filter below used a
    // fixed 120m cap to skip terrain and surround, and that cap silently
    // discarded the ground mass of every building BIGGER than it — Suntec's
    // 181m podium, the Esplanade's 165m base, Hong Lim's 175m block — so the
    // lowest mesh D38 could still see was the tower (or a rooftop plant box)
    // standing on the mass it had refused to look at, and 8 named buildings
    // across 6 districts were reported floating 9-33m in the air. Measured
    // 2026-08-02: every one of the 8 has its own base at or below terrain,
    // and the "float" was exactly the podium height. The cap is therefore
    // per-building: never smaller than 120 (terrain tiles stay excluded),
    // but always big enough to see the footprint under test. Re-measured
    // with this cap: 0 false findings in all six districts, and kallang
    // 107->109, tanjongrhu 62->63 buildings measurable — coverage went UP.
    const ringCap = new Map();
    for (const [b] of probe) {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (const q of b.p) {
        x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]);
        z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]);
      }
      ringCap.set(b, Math.max(120, (x1 - x0) + 25, (z1 - z0) + 25));
    }
    const low = new Map();
    sc.traverse((o) => {
      if (!o.isMesh || !o.geometry || o.userData.crowdPart) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox;
      if (!bb) return;
      const w = bb.clone().applyMatrix4(o.matrixWorld);
      const sz = w.getSize(new T.Vector3());
      if (sz.y < 1.5) return;                        // trims, copings, paint
      for (const [b, pt] of probe) {
        if (pt[0] < w.min.x || pt[0] > w.max.x || pt[1] < w.min.z || pt[1] > w.max.z) continue;
        const cap = ringCap.get(b);
        if (sz.x > cap || sz.z > cap) continue;      // terrain and surround
        const cur = low.get(b);
        if (cur === undefined || w.min.y < cur) low.set(b, w.min.y);
      }
    });
    for (const [b, y] of low) {
      const [cx, cz] = probe.get(b);
      // window.__groundAt DOES NOT EXIST. Writing it here made D38 skip every
      // building and report a clean zero — a check that cannot see is worse
      // than no check, and this file has caught that four times now. The
      // terrain object itself is exposed as window.__terrain.
      const g = window.__terrain ? window.__terrain.at(cx, cz) : null;
      if (g === null || !isFinite(g)) continue;
      if (y - g > 2.5) {
        bad.push(`"${b.n}" lowest mass starts ${(y - g).toFixed(1)}m above its `
          + `own ground at ${cx | 0},${cz | 0}`);
      }
    }
    // KNOWN RESIDUE, 4 of 417 on Chinatown the day this was written, and both
    // causes are the probe rather than the world. One Fullerton is eleven
    // segments along the waterfront and its probe points fall over grid cells
    // that the terrain build deliberately SANK under a water polygon, so the
    // ground beneath them is the bay floor rather than the quay. URA Centre
    // (East Wing) is a footprint overlapping its own parent, i.e. a tower whose
    // podium is a separate ring. Neither is worth a special case until the
    // number moves: what this check exists to catch is a whole recipe adrift by
    // the height of its district, which reads as 10m and 24m, not 4m.
    report('D38', 'a named building floating above its own ground', bad,
           `${low.size} named buildings measured`);
  }

  /* D39  a scene layer that is written and never drawn.
   *
   * `data.trees` -- the surveyed OSM tree nodes, 449 of them in Orchard -- was
   * in every district file from the first build and NOTHING IN THE WORLD READ
   * IT. Every tree ever drawn came from the avenue walk in markings.js. The
   * parks were bald and no check noticed, because every check asks whether what
   * IS drawn is drawn correctly, and this layer drew nothing at all.
   *
   * It surfaced only because a change to that layer produced a pixel-identical
   * frame. That is a terrible way to find a bug and it is the fourth time
   * something in this project has shipped blind, so it gets a ratchet.
   *
   * The check is deliberately crude: for each layer the scene populates, count
   * the drawn things that could only have come from it. It cannot verify a
   * layer is drawn WELL, only that the wire is connected -- which is the exact
   * failure it exists to catch. A layer legitimately empty for this district is
   * skipped, so Robertson having no MRT entrance is not a defect.
   */
  {
    const drawn = window.__stats || {};
    // layer key -> the stat that must move when it is drawn. Where a layer has
    // no counter of its own, the geometry it makes is named in the scene.
    // Every pair below was READ OFF A LIVE SCENE, not guessed. An earlier draft
    // guessed five of them; three were wrong and the check skipped those layers
    // in silence, which is the same blindness D38 shipped with.
    const WIRED = [
      ['trees', 'surveyedTrees'],
      ['towers', 'supertrees'],
      ['busstops', 'realBusStops'],
      ['mrt', 'mrt'],
      ['taxis', 'realTaxis'],
      ['shops', 'realShops'],
      ['crossings', 'realCrossings'],
      ['signals', 'realSignals'],
      ['covered', 'realCovered'],
      ['gantries', 'gantries'],
      ['bridges', 'bridges'],
    ];
    const dead = [];
    for (const [key, stat] of WIRED) {
      const have = (data[key] || []).length;
      if (!have) continue;                       // nothing to draw is not a defect
      // ONE SAMPLE CANNOT DISPROVE A WIRE. The street furniture pass only
      // dresses within 60m of the axis, so a single taxi rank on a back street
      // legitimately draws nothing — Robertson has exactly one and this check
      // reported it as a dead layer on its first run. A genuinely unwired layer
      // shows up as 49 entries and 0 drawn (Orchard's taxis) or 75 and 0
      // (Chinatown's), never as 1 and 0. Five is the point where "none of them
      // drew" stops being explicable by reach alone.
      if (have < 5) continue;
      // A MISSING COUNTER IS A DEFECT, NOT A SKIP. If the stat gets renamed,
      // silently passing would leave this check watching nothing -- which is
      // precisely the failure it was written to catch.
      if (!(stat in drawn)) {
        dead.push(`no counter named '${stat}' — D39 cannot see the ${key} layer any more`);
        continue;
      }
      // Crossings are drawn by TWO passes with two counters: the axis pass
      // (realCrossings) and the side-street pass in markings.js
      // (sideCrossings). Reading only the first reported sentosa — an island
      // whose axis is one gateway road — as "78 crossings and none drawn"
      // while 70 of them stood painted on Siloso Road (measured 2026-08-03).
      // Bridges may be REFUSED on purpose: pedBridge declines ways straighter
      // than 90m of span (elevated linkways this recipe cannot represent —
      // tanjongrhu's stadium ways are all of them; see the refusal in
      // sgdetail.js). A counted deliberate refusal is not a dead layer.
      const n = drawn[stat]
        + (key === 'crossings' ? (drawn.sideCrossings || 0) : 0)
        + (key === 'bridges' ? (drawn.bridgesRefused || 0) : 0);
      if (!n) dead.push(`scene has ${have} ${key} and the world drew none of them`);
    }
    report('D39', 'a scene layer written but never drawn', dead,
           `${WIRED.length} layers wired`);
  }

  /* D23 DELETED.
   *
   * It counted how many distinct geometry signatures shared a square metre and
   * flagged six or more as a heap. Every one of the 26 it found was an ordinary
   * pavement: a kerb, a railing — which is three signatures, two rails and a
   * post — a lamp column, a tree canopy overhead and a pedestrian, who is six
   * signatures on their own.
   *
   * Counting signatures is not counting objects, and the threshold was picked
   * before looking at what the numbers meant. Deleted rather than tuned, because
   * a probe that needs a magic number to stop crying wolf is not measuring
   * anything. P4 already covers the real version of this: the SAME prop
   * duplicated in the same place.
   */

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
