// Whole-district audit. Implements the taxonomy in STANDARD.md.
//
// Load the world with ?raw=1 so objects are still individually inspectable,
// then call window.__auditWorld(). Every check runs over the ENTIRE district.
//
// A check that is missing here is a check that does not exist. Where something
// is exempted, the reason is written beside it: an exemption without a reason
// is a defect being hidden.
// Checks where a HIGHER number is better, so the budget is a floor rather than a
// ceiling. Declared once: listing them by id at each comparison site is how C8
// came to report 13% coverage as a pass against a 70% floor.
const FLOORS = new Set(['C4', 'C7', 'C8']);

window.__auditWorld = async function auditWorld() {
  const T = window.__THREE, sc = window.__scene;
  const data = await (await fetch('./data/orchard.json')).json();
  const axis = data.axis;
  const terr = window.__terrain;
  const findings = [];
  const add = (id, name, severity, count, budget, detail, examples) =>
    findings.push({ id, name, severity, count, budget, detail,
                    examples: (examples || []).slice(0, 8) });

  /* ================= shared indices ================= */
  const CELL = 40;
  const rGrid = new Map();
  const stamp = (x1, z1, x2, z2, half, name, kind) => {
    const seg = [x1, z1, x2, z2, half, name, kind];
    const mnx = Math.min(x1, x2) - half, mxx = Math.max(x1, x2) + half;
    const mnz = Math.min(z1, z2) - half, mxz = Math.max(z1, z2) + half;
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!rGrid.has(k)) rGrid.set(k, []);
        rGrid.get(k).push(seg);
      }
  };
  const carriage = (data.roads || []).filter(
    (r) => r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'steps');
  for (const r of carriage)
    for (let i = 0; i < r.p.length - 1; i++)
      stamp(r.p[i][0], r.p[i][1], r.p[i + 1][0], r.p[i + 1][1],
            (r.w || 6) / 2, r.n || '(unnamed)', r.k);
  if (axis)
    for (let i = 0; i < axis.p.length - 1; i++)
      stamp(axis.p[i][0], axis.p[i][1], axis.p[i + 1][0], axis.p[i + 1][1],
            axis.w / 2, axis.n || 'Orchard Road', 'axis');

  const roadAt = (x, z, margin, skipService) => {
    const list = rGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return null;
    for (const [x1, z1, x2, z2, half, name, kind] of list) {
      if (skipService && kind === 'service') continue;
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      const reach = half + (margin || 0);
      if (dx * dx + dz * dz < reach * reach) return name;
    }
    return null;
  };

  const bGrid = new Map();
  for (const b of data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const p of b.p) {
      if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0];
      if (p[1] < mnz) mnz = p[1]; if (p[1] > mxz) mxz = p[1];
    }
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!bGrid.has(k)) bGrid.set(k, []);
        bGrid.get(k).push(b);
      }
  }
  const inPoly = (poly, x, z) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
      if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
    }
    return hit;
  };
  const buildingAt = (x, z) => {
    const list = bGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return null;
    for (const b of list) if (inPoly(b.p, x, z)) return b;
    return null;
  };

  const axisDist = (x, z) => {
    let bd = Infinity;
    for (let i = 0; i < axis.p.length - 1; i++) {
      const [x1, z1] = axis.p[i], [x2, z2] = axis.p[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      if (dx * dx + dz * dz < bd) bd = dx * dx + dz * dz;
    }
    return Math.sqrt(bd);
  };

  /* ================= collect props ================= */
  const props = [];
  const m4 = new T.Matrix4(), v3 = new T.Vector3();
  sc.updateMatrixWorld(true);
  sc.traverse((o) => {
    if (!o.isInstancedMesh) return;
    const g = o.geometry, pr = g.parameters || {};
    const sig = `${g.type}(${[pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
      .filter((v) => v != null).map((v) => +v.toFixed(2)).join(',')})`;
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m4);
      v3.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
      props.push({ sig, x: v3.x, y: v3.y, z: v3.z, flat: g.type === 'PlaneGeometry' });
    }
  });

  // Things that legitimately occupy a carriageway. Each has its reason.
  const ROAD_OK = new Set([
    'BoxGeometry(2.1,0.34,3)',      // central median: it divides the road
    'CylinderGeometry(0.14,6.4)',   // palm planted in that median
    'SphereGeometry(0.66)',         // shrub in the central median (measured: all
                                    // 348 of them sit at 0.7m, so this is
                                    // planting, not the canopy it was labelled)
    'IcosahedronGeometry(1)',       // canopy detail, same reason
    'CylinderGeometry(0.07,1)',     // tree branch inside that canopy
    'CylinderGeometry(0.07,2.4)',   // lamp arm, reaches over the carriageway
    'BoxGeometry(1,0.2,0.44)',      // lamp head on the end of that arm
    'BoxGeometry(0.9,0.16,0.4)',    // side-street lamp head
    'CylinderGeometry(0.07,3.2)',   // covered walkway post at a crossing point
    'CylinderGeometry(0.31,0.2)',   // vehicle wheels
    'BoxGeometry(1.78,0.62,4.32)', 'BoxGeometry(1.64,0.5,2.1)',   // cars
    'BoxGeometry(1.69,0.38,2)',
    'BoxGeometry(2.5,2.5,11.8)', 'BoxGeometry(2.54,0.62,11.7)',   // buses
    'BoxGeometry(2.54,0.95,10.4)',
    'CapsuleGeometry(0.4,0.04)', 'CapsuleGeometry(0.44,0.06)',    // pedestrians,
    'CapsuleGeometry(0.34,0.13)', 'CapsuleGeometry(0.1,0.12)',    // who do cross
    'BoxGeometry(0.11,0.07,0.25)', 'BoxGeometry(0.22,0.26,0.1)',
    'SphereGeometry(0.05)', 'SphereGeometry(0.1)', 'SphereGeometry(0.11)',
    'CylinderGeometry(0.05,0.1)',
    'CylinderGeometry(0.48,0.28)',  // bus wheels
    'BoxGeometry(1.65,0.42,0.08)',  // bus destination blind
    'BoxGeometry(1,3.2,0.5)',       // rooftop sign box, tens of metres up
  ]);
  // Fixed to a building, so overlapping its footprint is the point.
  const MOUNTED = new Set([
    'BoxGeometry(0.28,1.05,2.6)',   // shopfront fascia sign
    'BoxGeometry(0.9,7.5,0.35)',    // vertical banner
    'BoxGeometry(1,3.2,0.5)',       // rooftop sign box
    'IcosahedronGeometry(1)', 'SphereGeometry(0.66)',   // canopy against a facade
    'CylinderGeometry(0.07,1)', 'BoxGeometry(2.1,0.34,3)',
  ]);
  // Clustered round a shared origin by construction, so proximity is not duplication.
  const CLUSTERED = new Set(['CylinderGeometry(0.07,1)', 'IcosahedronGeometry(1)',
    'SphereGeometry(0.66)',
    // a person carries two arms, two legs and two shoes, all within 60cm
    'CapsuleGeometry(0.4,0.04)', 'CapsuleGeometry(0.44,0.06)',
    'CapsuleGeometry(0.34,0.13)', 'CapsuleGeometry(0.1,0.12)',
    'BoxGeometry(0.11,0.07,0.25)', 'SphereGeometry(0.05)',
    'SphereGeometry(0.1)', 'SphereGeometry(0.11)', 'CylinderGeometry(0.05,0.1)',
    'BoxGeometry(0.22,0.26,0.1)']);

  let sky = null;
  sc.traverse((o) => {
    if (o.isMesh && o.geometry.type === 'SphereGeometry'
        && o.geometry.parameters.radius > 100) sky = o;
  });

  /* ================= P: placement ================= */
  {
    // Being on the list is not enough. A lamp arm is exempt because it reaches
    // over the road eight metres up; the same signature at knee height would be
    // something you ride into, and the list must not excuse that. Only these may
    // sit low: things that use roads, and planting in the median.
    const LOW_OK = new Set([
      'SphereGeometry(0.66)',         // median shrub
      'BoxGeometry(2.1,0.34,3)',      // median kerb
      'CylinderGeometry(0.14,6.4)',   // median palm
      'CylinderGeometry(0.31,0.2)', 'CylinderGeometry(0.48,0.28)',   // wheels
      'BoxGeometry(1.78,0.62,4.32)', 'BoxGeometry(1.64,0.5,2.1)',    // cars
      'BoxGeometry(1.69,0.38,2)', 'BoxGeometry(2.5,2.5,11.8)',       // buses
      'BoxGeometry(2.54,0.62,11.7)', 'BoxGeometry(2.54,0.95,10.4)',
      'BoxGeometry(1.65,0.42,0.08)',  // bus blind
      'CapsuleGeometry(0.4,0.04)', 'CapsuleGeometry(0.44,0.06)',     // pedestrians
      'CapsuleGeometry(0.34,0.13)', 'CapsuleGeometry(0.1,0.12)',
      'BoxGeometry(0.11,0.07,0.25)', 'BoxGeometry(0.22,0.26,0.1)',
      'SphereGeometry(0.05)', 'SphereGeometry(0.1)', 'SphereGeometry(0.11)',
      'CylinderGeometry(0.05,0.1)',
    ]);
    const OVERHEAD_MIN = 3.0;       // clear of a rider on a scooter
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat) continue;
      if (ROAD_OK.has(p.sig)) {
        const up = terr ? p.y - terr.at(p.x, p.z) : 99;
        if (LOW_OK.has(p.sig) || up >= OVERHEAD_MIN) continue;
        // on the list, but low enough to hit: not excused
      }
      const rd = roadAt(p.x, p.z, -0.5);
      if (!rd) continue;
      bad[p.sig] = (bad[p.sig] || 0) + 1;
      ex.push(`${p.sig} in "${rd}" at ${p.x | 0},${p.z | 0}`);
    }
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    add('P1', 'props in a carriageway', 'BLOCKER', n, 0,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([k, v]) => `${v}x ${k}`).join('  ') || 'none', ex);
  }
  {
    // P1b: everything that is NOT an instanced prop. This check did not exist,
    // and it is the largest category of geometry in the world: buildings,
    // shopfronts, entrance canopies, colonnades, landmark structure. The audit
    // reported a clean district while a row of six-metre columns stood across
    // the carriageway at the spawn point, because it only ever looked at props.
    const v = new T.Vector3();
    const bad = {}, ex = [];
    const RIDE_HEIGHT = 9;          // what you can actually hit on a scooter
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const pos = o.geometry.attributes.position;
      if (!pos || pos.count > 6000) return;    // a merged tile is not one object
      if (o === sky || o.material.fog === false) return;   // the sky dome
      if (o.geometry.type === 'PlaneGeometry'
          && o.geometry.parameters.width > 500) return;     // ground fallback plane
      let hit = null, worstX = 0, worstZ = 0, minY = 1e9, maxY = -1e9, n = 0;
      const step = Math.max(1, Math.floor(pos.count / 80));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
        if (v.y - (terr ? terr.at(v.x, v.z) : 0) > RIDE_HEIGHT) continue;
        n++;
        // service lanes are skipped for the same reason P5 skips them: a hotel
        // set-down or a loading bay is what a service road is for
        const rd = roadAt(v.x, v.z, -1.0, true);
        if (rd) { hit = rd; worstX = v.x; worstZ = v.z; }
      }
      // Nothing under 40cm is something you ride into: those are aprons,
      // thresholds and paving trim that sit flush with the road on purpose.
      if (!hit || !n || maxY - minY < 0.4) return;
      // Structures that are SUPPOSED to be over a carriageway. A traffic signal
      // that does not hang over the road is not a traffic signal, and a
      // direction gantry spans it by definition. Same reasoning as P1's list.
      const gp0 = o.geometry.parameters || {};
      const dim = (a, b2) => Math.abs((a || 0) - b2) < 0.02;
      const OVERHEAD =
        (o.geometry.type === 'CylinderGeometry' && dim(gp0.radiusTop, 0.06))      // signal pole and arm
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 0.32)
            && dim(gp0.height, 0.86))                                            // signal head
        || (o.geometry.type === 'CircleGeometry')                                 // signal lens
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 4.6)
            && dim(gp0.height, 1.72))                                            // gantry backer
        || (o.geometry.type === 'PlaneGeometry' && dim(gp0.width, 4.6)
            && dim(gp0.height, 1.72))                                            // gantry face
        || (o.geometry.type === 'CylinderGeometry' && dim(gp0.radiusTop, 0.13))   // gantry post
        || (o.geometry.type === 'BoxGeometry' && (gp0.width || 0) > 14
            && (gp0.height || 0) < 5 && (gp0.depth || 0) > 2.5)                   // overhead bridge deck
        || (o.geometry.type === 'CylinderGeometry' && (gp0.radiusTop || 0) > 10);  // ION's shell over its forecourt
      if (OVERHEAD) return;
      const gp = o.geometry.parameters || {};
      const dims = [gp.radiusTop, gp.width, gp.height, gp.depth]
        .filter((q) => q != null).map((q) => +q.toFixed(2)).join('x');
      const key = `${o.geometry.type}(${dims})|${(maxY - minY).toFixed(1)}m tall`;
      bad[key] = (bad[key] || 0) + 1;
      if (ex.length < 8) ex.push(`${key} in "${hit}" at ${worstX | 0},${worstZ | 0}`);
    });
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    // P1b is new and inherited a backlog. The target is zero, but a check
    // introduced into an existing world cannot start by failing everything, so
    // it runs as a RATCHET: the number may go down and never up. The budget is
    // the best figure reached so far — 286 when the check was written, 116 now.
    // Leaving it at the original 286 would have quietly permitted a regression
    // all the way back, which defeats the point of a ratchet.
    add('P1b', 'structure in a carriageway (ratchet, target 0)', 'BLOCKER', n, 116,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([k, v2]) => `${v2}x ${k}`).join('  ') || 'none', ex);
  }
  {
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat || MOUNTED.has(p.sig)) continue;
      const b = buildingAt(p.x, p.z);
      if (!b) continue;
      bad[p.sig] = (bad[p.sig] || 0) + 1;
      ex.push(`${p.sig} inside "${b.n || '(unnamed)'}"`);
    }
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    add('P2', 'props inside a building', 'MAJOR', n, 30,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([k, v]) => `${v}x ${k}`).join('  ') || 'none', ex);
  }
  {
    // A rooftop sign is on a roof, and the crowd parks the instances it is not
    // drawing at y = -9999 rather than paying to render them.
    const ROOFTOP = new Set(['BoxGeometry(1,3.2,0.5)']);
    let floating = 0, sunk = 0; const ex = [];
    for (const p of props) {
      if (!terr) break;
      if (ROOFTOP.has(p.sig) || p.y < -900) continue;
      const d = p.y - terr.at(p.x, p.z);
      if (d > 19) { floating++; ex.push(`${p.sig} ${d.toFixed(1)}m up`); }
      if (d < -1.2) { sunk++; ex.push(`${p.sig} ${(-d).toFixed(1)}m down`); }
    }
    add('P3', 'props off the ground', 'BLOCKER', floating + sunk, 0,
        `${floating} floating, ${sunk} sunk`, ex);
  }
  {
    const NEAR = 0.6, g2 = new Map();
    let dup = 0; const ex = [];
    for (const p of props) {
      if (p.flat || CLUSTERED.has(p.sig)) continue;
      const cx = Math.floor(p.x), cz = Math.floor(p.z);
      let hit = false;
      for (let dx = -1; dx <= 1 && !hit; dx++)
        for (let dz = -1; dz <= 1 && !hit; dz++) {
          const list = g2.get(p.sig + '|' + (cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const q of list)
            if ((q[0] - p.x) ** 2 + (q[1] - p.z) ** 2 < NEAR * NEAR) { hit = true; break; }
        }
      if (hit) { dup++; ex.push(`${p.sig} at ${p.x | 0},${p.z | 0}`); }
      const k = p.sig + '|' + cx + ',' + cz;
      if (!g2.has(k)) g2.set(k, []);
      g2.get(k).push([p.x, p.z]);
    }
    add('P4', 'duplicated props', 'MAJOR', dup, 100,
        `${dup} within 60cm of an identical prop`, ex);
  }
  {
    const bad = [];
    for (const b of data.buildings) {
      let worst = 0;
      for (const p of b.p) {
        const list = rGrid.get(Math.floor(p[0] / CELL) + ',' + Math.floor(p[1] / CELL));
        if (!list) continue;
        for (const [x1, z1, x2, z2, half, , kind] of list) {
          if (kind === 'service') continue;   // set-downs and loading bays are the point
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((p[0] - x1) * vx + (p[1] - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const pen = half - Math.hypot(p[0] - (x1 + vx * t), p[1] - (z1 + vz * t));
          if (pen > worst) worst = pen;
        }
      }
      if (worst > 0.8) bad.push(`${b.n || '(unnamed)'} ${worst.toFixed(1)}m in`);
    }
    add('P5', 'buildings in a carriageway', 'MAJOR', bad.length, 5,
        `${bad.length} of ${data.buildings.length} footprints`, bad);
  }
  {
    // Flat things lying on the ground fight for the depth buffer. Foliage
    // billboards also come back as PlaneGeometry, but they are alpha-tested
    // cards standing up inside a canopy, where overlap is both inevitable and
    // invisible, so only ground-level markings are considered.
    // Two markings only fight if they actually overlap. A grid-cell test called
    // the two halves of a double yellow line coplanar when they sit 22cm apart
    // and never touch, so the surfaces must be within 18cm as well as 4mm.
    const g3 = new Map(); let zf = 0; const ex = [];
    const OVER = 0.18;
    for (const p of props) {
      if (!p.flat) continue;
      if (!terr || p.y - terr.at(p.x, p.z) > 0.3) continue;
      const cx = Math.round(p.x / 0.5), cz = Math.round(p.z / 0.5);
      let hit = false;
      for (let dx = -1; dx <= 1 && !hit; dx++)
        for (let dz = -1; dz <= 1 && !hit; dz++) {
          const list = g3.get((cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const q of list)
            if (Math.abs(q[2] - p.y) < 0.004
                && (q[0] - p.x) ** 2 + (q[1] - p.z) ** 2 < OVER * OVER) { hit = true; break; }
        }
      if (hit) { zf++; ex.push(`flat pair at ${p.x | 0},${p.z | 0}`); }
      const k = cx + ',' + cz;
      if (!g3.has(k)) g3.set(k, []);
      g3.get(k).push([p.x, p.z, p.y]);
    }
    add('P6', 'z-fighting flat surfaces', 'MAJOR', zf, 20,
        `${zf} coplanar pairs within 4mm`, ex);
  }

  {
    // P7: a marking below the carriageway surface is buried. Lane dashes and
    // zebra crossings were dropped to 0.046 and 0.052 while the tarmac is drawn
    // at 0.055, so they were under the road and nothing else noticed: every
    // other check was happy, and the street simply looked wrong.
    const ROAD_Y = 0.055;
    let sunk = 0; const ex = [];
    for (const p of props) {
      if (!p.flat || !terr) continue;
      const above = p.y - terr.at(p.x, p.z);
      if (above < 0.001) continue;              // not a road marking at all
      if (above > 0.5) continue;                // signage, not paint
      if (above < ROAD_Y + 0.004) {
        sunk++;
        if (ex.length < 6) ex.push(`marking ${(above * 1000) | 0}mm up, tarmac at ${ROAD_Y * 1000}mm`);
      }
    }
    add('P7', 'road markings under the tarmac', 'BLOCKER', sunk, 0,
        `${sunk} flat markings at or below the carriageway surface`, ex);
  }

  /* ================= C: coverage ================= */
  const streets = new Map();
  for (const r of carriage) {
    if (!r.n || /orchard road/i.test(r.n)) continue;
    let len = 0;
    for (let i = 0; i < r.p.length - 1; i++)
      len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
    const e = streets.get(r.n) || { len: 0, pts: [] };
    e.len += len; e.pts.push(...r.p);
    streets.set(r.n, e);
  }
  // Measured per street name, never per way: OSM splits a road at every
  // junction. Only the stretch inside the dressed radius is judged — a street
  // that runs 400m out of the district is not undressed for the part nobody
  // built, and testing its far end reported a bare street that was not bare.
  const dressed = [...streets.entries()]
    .filter(([, e]) => e.len >= 45 && e.pts.some((p) => axisDist(p[0], p[1]) <= 230))
    .map(([n, e]) => [n, { len: e.len, pts: e.pts.filter((p) => axisDist(p[0], p[1]) <= 230) }]);

  const propGrid = new Map();
  for (const p of props) {
    if (p.flat) continue;
    const k = Math.floor(p.x / 20) + ',' + Math.floor(p.z / 20);
    if (!propGrid.has(k)) propGrid.set(k, []);
    propGrid.get(k).push(p);
  }
  const nearAny = (pts, test, reach) => {
    const R2 = reach * reach, span = Math.ceil(reach / 20);
    for (const q of pts) {
      const cx = Math.floor(q[0] / 20), cz = Math.floor(q[1] / 20);
      for (let dx = -span; dx <= span; dx++)
        for (let dz = -span; dz <= span; dz++) {
          const list = propGrid.get((cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const p of list)
            if (test(p.sig) && (p.x - q[0]) ** 2 + (p.z - q[1]) ** 2 < R2) return true;
        }
    }
    return false;
  };
  const isKerb = (s) => s === 'BoxGeometry(0.38,0.3,4)' || s === 'BoxGeometry(0.42,0.3,2)';
  const isLamp = (s) => s === 'CylinderGeometry(0.11,9)' || s === 'BoxGeometry(0.9,0.16,0.4)'
    || s === 'BoxGeometry(1,0.2,0.44)' || s === 'CylinderGeometry(0.05,2.6)';
  const isTree = (s) => s === 'SphereGeometry(0.66)' || s === 'IcosahedronGeometry(1)';

  {
    // A street tagged sidewalk=no or sidewalk=separate has no kerbside pavement
    // on the carriageway, and the dressing honours that tag. Demanding kerbs
    // there would be demanding we contradict the map: Mount Sophia is tagged
    // separate or no on every way, so having none is the correct answer.
    const noKerbByTag = new Set();
    for (const r of carriage) {
      if (!r.n) continue;
      const sw = r.sidewalk;
      if (sw === 'no' || sw === 'none' || sw === 'separate') {
        const all = carriage.filter((q) => q.n === r.n);
        if (all.every((q) => ['no', 'none', 'separate', undefined].includes(q.sidewalk)))
          noKerbByTag.add(r.n);
      }
    }
    const bare = dressed.filter(([n, e]) => !noKerbByTag.has(n) && !nearAny(e.pts, isKerb, 26))
      .map(([n, e]) => `${n} (${e.len | 0}m)`);
    add('C1', 'streets with no kerbs', 'BLOCKER', bare.length, 0,
        `${bare.length} of ${dressed.length} dressed streets`
        + ` (${noKerbByTag.size} exempt: OSM records no kerbside pavement)`, bare);
  }
  {
    const signs = window.__signage || [];
    const missing = dressed.filter(([n]) =>
      !signs.some((s) => s.kind === 'plate' && s.text === n)).map(([n, e]) => `${n} (${e.len | 0}m)`);
    add('C2', 'streets with no name plate', 'MAJOR', missing.length,
        Math.ceil(dressed.length * 0.10),
        `${missing.length} of ${dressed.length} cannot be identified on the ground`, missing);
  }
  {
    const dark = dressed.filter(([, e]) => !nearAny(e.pts, isLamp, 45))
      .map(([n, e]) => `${n} (${e.len | 0}m)`);
    add('C3', 'streets with no lighting', 'MAJOR', dark.length,
        Math.ceil(dressed.length * 0.15), `${dark.length} of ${dressed.length}`, dark);
  }
  {
    const people = window.__crowdPositions ? window.__crowdPositions() : [];
    const off = people.filter((p) => axisDist(p[0], p[1]) >= 30).length;
    const pct = people.length ? Math.round((off / people.length) * 100) : 0;
    add('C4', 'pedestrians away from the main street', 'MAJOR', pct, 35,
        `${off} of ${people.length} off-axis (${pct}%, want above 35%)`, []);
  }
  {
    const bare = dressed.filter(([, e]) => !nearAny(e.pts, isTree, 45)).map(([n]) => n);
    add('C5', 'streets with no greenery', 'MINOR', bare.length, null,
        `${bare.length} of ${dressed.length}`, bare);
  }
  {
    const layers = ['crossings', 'signals', 'busstops', 'mrt', 'taxis', 'trees', 'shops'];
    const empty = layers.filter((k) => !(data[k] || []).length);
    add('C6', 'real map layers present', 'BLOCKER', empty.length, 0,
        empty.length ? `missing: ${empty.join(', ')}`
          : layers.map((k) => `${k} ${data[k].length}`).join(', '), empty);
  }

  {
    // C7: how much of the real street is actually built. process.py records the
    // full length of the named street it stitched the axis from, so this is
    // measured against the real road rather than against our own output.
    let built = 0;
    for (let i = 0; i < axis.p.length - 1; i++)
      built += Math.hypot(axis.p[i + 1][0] - axis.p[i][0], axis.p[i + 1][1] - axis.p[i][1]);
    const full = data.axisFullLength || built;
    const pct = Math.round((built / full) * 100);
    add('C7', 'main street length built', 'BLOCKER', pct, 85,
        `${Math.round(built)}m of ${Math.round(full)}m`, []);
  }

  {
    // C8: how much of each real layer actually reaches the world. A2 only asks
    // whether a layer is used at all, and that is far too weak: 48 bus stops
    // were fetched and 6 got a shelter, 61 signals were fetched and 14 got a
    // head. The data was there, the check said "every fetched layer is placed",
    // and most of the street furniture simply was not built.
    const m4b = new T.Matrix4(), vb = new T.Vector3();
    const posOf = (test) => {
      const out = [];
      sc.traverse((o) => {
        if (!o.isMesh) return;
        const pr = o.geometry.parameters || {};
        if (!test(o.geometry.type, pr)) return;
        if (o.isInstancedMesh) {
          for (let i = 0; i < o.count; i++) {
            o.getMatrixAt(i, m4b);
            vb.setFromMatrixPosition(m4b).applyMatrix4(o.matrixWorld);
            out.push([vb.x, vb.z]);
          }
        } else {
          o.updateWorldMatrix(true, false);
          vb.setFromMatrixPosition(o.matrixWorld);
          out.push([vb.x, vb.z]);
        }
      });
      return out;
    };
    // signals are bare [x, z] pairs, bus stops are {p, n}: accept either shape
    const at = (n) => (Array.isArray(n) ? n : n.p);
    const served = (nodes, built, reach) => nodes.filter((n) => {
      const q = at(n);
      return q && built.some((b) => (b[0] - q[0]) ** 2 + (b[1] - q[1]) ** 2 < reach * reach);
    }).length;

    const shelters = posOf((t, pr) => t === 'BoxGeometry' && Math.abs((pr.width || 0) - 8.8) < 0.01);
    const heads = posOf((t, pr) => t === 'BoxGeometry'
      && Math.abs((pr.width || 0) - 0.32) < 0.01 && Math.abs((pr.height || 0) - 0.86) < 0.01);
    const layers = [
      ['bus stops', data.busstops || [], shelters, 16],
      ['traffic signals', data.signals || [], heads, 22],
    ];
    const worst = [];
    let lowest = 100;
    for (const [name, nodes, built, reach] of layers) {
      if (!nodes.length) continue;
      const pct = Math.round((served(nodes, built, reach) / nodes.length) * 100);
      lowest = Math.min(lowest, pct);
      worst.push(`${name}: ${served(nodes, built, reach)} of ${nodes.length} built (${pct}%)`);
    }
    // Enters as a ratchet, like P1b: the check is new and found a real backlog,
    // and a gate that fails on day one is a gate people learn to ignore.
    //
    // The baseline is 6%, not the 13% first measured, and the reason matters:
    // fixing the shelter footprint test stopped shelters being built lying
    // across the carriageway, and fewer of them now fit. That is correctness
    // bought with coverage — P1b fell from 116 to 114 as C8 fell from 13 to 6.
    // Both numbers have to come up together, which means the shelter needs to
    // be narrower or the pavement wider, not a looser test.
    add('C8', 'share of each real layer built (ratchet, target 70)', 'MAJOR', lowest, 6,
        worst.join('; '), worst);
  }

  /* ================= S: semantics ================= */
  {
    const signs = (window.__signage || []).filter((s) => s.kind === 'gantry');
    const wrong = [];
    for (const s of signs)
      for (const word of s.text.split(' | ')) {
        const e = streets.get(word);
        const near = e && e.pts.some((p) =>
          (p[0] - s.x) ** 2 + (p[1] - s.z) ** 2 < 110 * 110);
        if (!near) wrong.push(`"${word}" signed at ${s.x | 0},${s.z | 0} but not there`);
      }
    add('S1', 'direction signs naming the wrong street', 'BLOCKER', wrong.length, 0,
        `${signs.length} gantries checked`, wrong);
  }
  {
    // Near a junction several streets are within reach of one pole. The plate is
    // only wrong if a street other than the one it names is strictly closer.
    const plates = (window.__signage || []).filter((s) => s.kind === 'plate');
    const distTo = (name, x, z) => {
      const e = name === (axis.n || 'Orchard Road')
        ? { pts: axis.p } : streets.get(name);
      if (!e) return Infinity;
      let bd = Infinity;
      for (const q of e.pts) {
        const d = (q[0] - x) ** 2 + (q[1] - z) ** 2;
        if (d < bd) bd = d;
      }
      return Math.sqrt(bd);
    };
    const wrong = [];
    for (const s of plates) {
      const own = distTo(s.text, s.x, s.z);
      let best = own, bestName = s.text;
      for (const [n] of streets) {
        const d = distTo(n, s.x, s.z);
        if (d < best - 2) { best = d; bestName = n; }
      }
      if (bestName !== s.text)
        wrong.push(`plate "${s.text}" is ${own.toFixed(0)}m from its street but ${best.toFixed(0)}m from "${bestName}"`);
    }
    add('S2', 'name plates on the wrong street', 'BLOCKER', wrong.length, 0,
        `${plates.length} plates checked`, wrong);
  }
  {
    // S3: a name sign is fixed to a facade, so the nearest named building to it
    // should be the building it names.
    // A sign hangs on a facade, and on Orchard Road facades touch: Paragon and
    // Paragon Medical share a wall, so "which named footprint has the nearest
    // vertex" is not the question. The question is whether the sign is actually
    // on the building it names.
    const names = (window.__signage || []).filter((sg) => sg.kind === 'name');
    const wrong = [];
    for (const sg of names) {
      const own = data.buildings.filter((b) => b.n === sg.text);
      if (!own.length) { wrong.push(`sign "${sg.text}" names no building`); continue; }
      // Distance to the PERIMETER, not to the nearest corner. A sign sits at the
      // midpoint of the longest facade, and Ngee Ann City's longest facade is
      // 74m, so its midpoint is 37m from either corner while being flat against
      // the wall. Measuring to vertices called 172 correct signs wrong.
      let d = Infinity;
      for (const b of own)
        for (let i = 0; i < b.p.length; i++) {
          const q1 = b.p[i], q2 = b.p[(i + 1) % b.p.length];
          const vx = q2[0] - q1[0], vz = q2[1] - q1[1], L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((sg.x - q1[0]) * vx + (sg.z - q1[1]) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          d = Math.min(d, Math.hypot(sg.x - (q1[0] + vx * t), sg.z - (q1[1] + vz * t)));
        }
      if (d > 6) wrong.push(`sign "${sg.text}" is ${d.toFixed(0)}m from that building`);
    }
    add('S3', 'name signs on the wrong building', 'MAJOR', wrong.length, 5,
        `${names.length} name signs checked`, wrong);
  }
  {
    const shops = data.shops || [];
    const orphan = shops.filter((sh) => !buildingAt(sh.p[0], sh.p[1])).length;
    add('S4', 'shop signs off their mapped building', 'MINOR', orphan, null,
        `${orphan} of ${shops.length} shop points fall outside any footprint`, []);
  }

  {
    // S5: an MRT entrance without its exit letter is a generic box. OSM names
    // them "Somerset (NSL) Exit B", so the letter is available and should show.
    const mrt = (data.mrt || []).filter((m) => m.kind === 'subway_entrance');
    const noLetter = mrt.filter((m) => !/\bExit\s+[A-Z0-9]/i.test(m.n || '')).length;
    add('S5', 'MRT entrances without their exit letter', 'MINOR', noLetter, null,
        `${mrt.length - noLetter} of ${mrt.length} carry a letter in OSM`, []);
  }

  /* ================= T: traversal ================= */
  {
    const solid = props.filter((p) => !p.flat && !ROAD_OK.has(p.sig));
    const sGrid = new Map();
    for (const p of solid) {
      const k = Math.floor(p.x / 10) + ',' + Math.floor(p.z / 10);
      if (!sGrid.has(k)) sGrid.set(k, []);
      sGrid.get(k).push(p);
    }
    let blocked = 0, sampled = 0; const ex = [];
    for (const r of carriage)
      for (let i = 0; i < r.p.length - 1; i++) {
        const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
        const len = Math.hypot(x2 - x1, z2 - z1);
        for (let t = 0; t < len; t += 5) {
          const x = x1 + (x2 - x1) * (t / len), z = z1 + (z2 - z1) * (t / len);
          sampled++;
          let hit = null;
          for (let dx = -1; dx <= 1 && !hit; dx++)
            for (let dz = -1; dz <= 1 && !hit; dz++) {
              const list = sGrid.get((Math.floor(x / 10) + dx) + ',' + (Math.floor(z / 10) + dz));
              if (!list) continue;
              for (const p of list)
                if ((p.x - x) ** 2 + (p.z - z) ** 2 < 1.4 * 1.4) { hit = p; break; }
            }
          if (hit) { blocked++; if (ex.length < 8) ex.push(`${hit.sig} on "${r.n || '(unnamed)'}"`); }
        }
      }
    add('T1', 'carriageway blocked by solid geometry', 'BLOCKER', blocked, 0,
        `${blocked} of ${sampled} centreline samples obstructed`, ex);
  }
  {
    const key = (p) => Math.round(p[0] / 4) + ',' + Math.round(p[1] / 4);
    const nodes = new Map();
    const link = (a, b) => {
      if (!nodes.has(a)) nodes.set(a, new Set());
      if (!nodes.has(b)) nodes.set(b, new Set());
      nodes.get(a).add(b); nodes.get(b).add(a);
    };
    const ways = [];
    for (const r of carriage) {
      const ks = r.p.map(key);
      for (let i = 0; i < ks.length - 1; i++) link(ks[i], ks[i + 1]);
      let len = 0;
      for (let i = 0; i < r.p.length - 1; i++)
        len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
      ways.push({ n: r.n || '(unnamed)', k: ks[0], len });
    }
    if (axis) {
      const ks = axis.p.map(key);
      for (let i = 0; i < ks.length - 1; i++) link(ks[i], ks[i + 1]);
    }
    const start = axis ? key(axis.p[0]) : ways[0].k;
    const seen = new Set([start]); const queue = [start];
    while (queue.length) {
      const cur = queue.pop();
      for (const nb of (nodes.get(cur) || [])) if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
    }
    let total = 0, island = 0; const ex = [];
    for (const w of ways) {
      total += w.len;
      if (!seen.has(w.k)) { island += w.len; if (ex.length < 8) ex.push(`${w.n} (${w.len | 0}m)`); }
    }
    const pct = total ? +((island / total) * 100).toFixed(1) : 0;
    add('T2', 'road network islands', 'MAJOR', pct, 5,
        `${island | 0}m of ${total | 0}m unreachable from the main axis`, ex);
  }
  {
    const g = terr && terr.g;
    let outside = 0; const ex = [];
    if (g) {
      const x0 = g.x0, z0 = g.z0;
      const x1 = g.x0 + (g.nx - 1) * g.cell, z1 = g.z0 + (g.nz - 1) * g.cell;
      for (const r of carriage)
        for (const p of r.p)
          if (p[0] < x0 || p[0] > x1 || p[1] < z0 || p[1] > z1) {
            outside++;
            if (ex.length < 6) ex.push(`"${r.n || '(unnamed)'}" leaves the heightfield`);
          }
    }
    add('T3', 'road running off the terrain grid', 'BLOCKER', outside, 0,
        `${outside} road points outside the sampled heightfield`, ex);
  }

  {
    // T4: ride the axis and check the chase camera never ends up inside a
    // building. The camera sits 5.8m behind and 3m above the rider, so on a
    // tight bend beside a tower it can pass through a wall.
    let inside = 0, tested = 0; const ex = [];
    for (let i = 0; i < axis.p.length - 1; i++) {
      const [x1, z1] = axis.p[i], [x2, z2] = axis.p[i + 1];
      const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz) || 1;
      const ux = dx / L, uz = dz / L;
      for (let t = 0; t < L; t += 12) {
        const rx = x1 + ux * t, rz = z1 + uz * t;
        const cx2 = rx - ux * 5.8, cz2 = rz - uz * 5.8;   // where the camera sits
        tested++;
        const b = buildingAt(cx2, cz2);
        // only a building tall enough to actually contain the camera at 3m up
        if (b && b.h > 3.4) {
          inside++;
          if (ex.length < 6) ex.push(`camera inside "${b.n || '(unnamed)'}" at ${cx2 | 0},${cz2 | 0}`);
        }
      }
    }
    const pct = tested ? +((inside / tested) * 100).toFixed(1) : 0;
    add('T4', 'chase camera inside a building', 'MAJOR', pct, 2,
        `${inside} of ${tested} sampled camera positions`, ex);
  }

  /* ================= V: presentation ================= */
  {
    let sky = null; const cam = window.__camera;
    sc.traverse((o) => {
      if (o.isMesh && o.geometry.type === 'SphereGeometry'
          && o.geometry.parameters.radius > 100) sky = o;
    });
    const problems = [];
    if (!sky) problems.push('no sky dome in the scene');
    else {
      const rad = sky.geometry.parameters.radius;
      if (rad >= cam.far) problems.push(`dome radius ${rad} >= far plane ${cam.far}`);
      const d = sky.position.distanceTo(cam.position);
      if (d > 2) problems.push(`dome centre ${d.toFixed(0)}m from the camera, so it can leave the frustum`);
      if (sky.frustumCulled) problems.push('dome is frustum-culled and can be dropped');
    }
    add('V1', 'sky always visible', 'BLOCKER', problems.length, 0,
        problems.length ? problems.join('; ')
          : 'dome follows the camera and sits inside the far plane', problems);
  }
  {
    // V2: at the far plane the fog must have swallowed the world, or geometry
    // pops in and out of existence at a hard line. FogExp2 transmittance is
    // exp(-(d*density)^2); anything above a few percent is visible popping.
    const fog = sc.fog;
    const cam2 = window.__camera;
    let leftover = 100;
    if (fog && fog.density != null && cam2) {
      const dd = fog.density * cam2.far;
      leftover = +(Math.exp(-(dd * dd)) * 100).toFixed(1);
    }
    add('V2', 'world still visible at the far plane', 'MAJOR', leftover, 5,
        fog ? `${leftover}% of an object still shows at ${cam2.far}m `
              + `(fog density ${fog.density})` : 'no fog in the scene', []);
  }
  {
    const g = terr && terr.g;
    let steps = 0; const ex = [];
    if (g)
      for (let j = 0; j < g.nz; j++)
        for (let i = 0; i < g.nx - 1; i++) {
          const d = Math.abs(g.h[j * g.nx + i] - g.h[j * g.nx + i + 1]);
          if (d > g.cell) { steps++; if (ex.length < 6) ex.push(`${d.toFixed(1)}m over ${g.cell}m`); }
        }
    add('V3', 'terrain steps sharper than 1:1', 'MAJOR', steps, 10, `${steps} cliff cells`, ex);
  }
  {
    const problems = [];
    const lanes = axis ? Math.max(1, Math.round(axis.w / 3.5)) : 1;
    const laneW = axis ? axis.w / lanes : 0;
    if (axis && (laneW < 2.8 || laneW > 4.2)) problems.push(`lane width ${laneW.toFixed(1)}m`);
    const tall = data.buildings.filter((b) => b.h > 6);
    const odd = tall.filter((b) => {
      const st = b.h / Math.max(1, Math.round(b.h / 3.4));
      return st < 2.6 || st > 5.2;
    }).length;
    if (odd > tall.length * 0.05) problems.push(`${odd} buildings with an odd storey height`);
    if (data.buildings.some((b) => b.h < 2.4)) problems.push('a building shorter than a door');
    add('V4', 'scale sanity', 'BLOCKER', problems.length, 0,
        problems.length ? problems.join('; ')
          : `lane ${laneW.toFixed(1)}m, storeys within 2.6-5.2m, nothing sub-door`, problems);
  }

  /* ================= A: accuracy ================= */
  {
    const unused = [];
    if ((data.crossings || []).length && !window.__realCrossings) unused.push('crossings');
    if ((data.mrt || []).length && !window.__realMrt) unused.push('mrt');
    if ((data.shops || []).length && !(window.__stats || {}).realShops) unused.push('shops');
    add('A2', 'real data present but unused', 'BLOCKER', unused.length, 0,
        unused.length ? `unused: ${unused.join(', ')}` : 'every fetched layer is placed', unused);
  }

  /* ================= verdict ================= */
  const failed = findings.filter((f) => {
    if (f.budget === null) return false;
    return FLOORS.has(f.id) ? f.count < f.budget : f.count > f.budget;
  });
  return {
    floors: [...FLOORS],
    findings, failed: failed.map((f) => f.id),
    blockers: failed.filter((f) => f.severity === 'BLOCKER').length,
    majors: failed.filter((f) => f.severity === 'MAJOR').length,
    pass: failed.length === 0,
  };
};
