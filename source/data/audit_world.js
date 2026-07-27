// Whole-district audit. Implements the taxonomy in STANDARD.md.
//
// Load the world with ?raw=1 so objects are still individually inspectable,
// then call window.__auditWorld(). Every check runs over the ENTIRE district.
//
// A check that is missing here is a check that does not exist. Where something
// is exempted, the reason is written beside it: an exemption without a reason
// is a defect being hidden.
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

  const roadAt = (x, z, margin) => {
    const list = rGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return null;
    for (const [x1, z1, x2, z2, half, name] of list) {
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
    'SphereGeometry(0.66)',         // tree canopy overhanging the kerb
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

  /* ================= P: placement ================= */
  {
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat || ROAD_OK.has(p.sig)) continue;
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
    const shops = data.shops || [];
    const orphan = shops.filter((sh) => !buildingAt(sh.p[0], sh.p[1])).length;
    add('S4', 'shop signs off their mapped building', 'MINOR', orphan, null,
        `${orphan} of ${shops.length} shop points fall outside any footprint`, []);
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
    return f.id === 'C4' ? f.count < f.budget : f.count > f.budget;
  });
  return {
    findings, failed: failed.map((f) => f.id),
    blockers: failed.filter((f) => f.severity === 'BLOCKER').length,
    majors: failed.filter((f) => f.severity === 'MAJOR').length,
    pass: failed.length === 0,
  };
};
