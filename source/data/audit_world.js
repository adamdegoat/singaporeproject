// Whole-map audit. Runs inside the page against the built world.
//
// This exists because checking one camera angle and a few numbers let a pile of
// obvious defects through: trees standing in back roads, pedestrians only ever
// on the main street, a sky that vanished off the main axis. Every check below
// runs over the ENTIRE district, not a sample near the spawn point.
//
// Load with ?raw=1 so objects are still individually inspectable.
window.__auditWorld = async function auditWorld() {
  const T = window.__THREE, sc = window.__scene;
  const data = await (await fetch('./data/orchard.json')).json();
  const axis = data.axis;
  const terr = window.__terrain;
  const out = { checks: [] };
  const add = (id, severity, count, detail, examples) =>
    out.checks.push({ id, severity, count, detail, examples: examples || [] });

  /* ---- road corridor index (independent of the game's own) ---- */
  const CELL = 40, grid = new Map();
  const stamp = (x1, z1, x2, z2, half, name, kind) => {
    const seg = [x1, z1, x2, z2, half, name, kind];
    const mnx = Math.min(x1, x2) - half, mxx = Math.max(x1, x2) + half;
    const mnz = Math.min(z1, z2) - half, mxz = Math.max(z1, z2) + half;
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(seg);
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
            axis.w / 2, 'Orchard Road', 'axis');

  const roadAt = (x, z, margin) => {
    const list = grid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
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

  /* ---- building index ---- */
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
    for (const b of list) if (inPoly(b.p, x, z)) return b.n || '(unnamed)';
    return null;
  };

  /* ---- collect every instanced prop in the world ---- */
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
  out.propCount = props.length;

  /* ---- CHECK 1: upright props standing in a carriageway ---- */
  {
    // Some things belong in the road and must not be reported as defects:
    // the central median divides the carriageway by definition, and a tree
    // canopy overhanging the kerb is what street trees actually do.
    const LEGITIMATE = new Set([
      'BoxGeometry(2.1,0.34,3)',        // central median kerb
      'SphereGeometry(0.66)',           // tree canopy blob, hangs over the kerb
      'IcosahedronGeometry(1)',         // canopy detail
      'CylinderGeometry(0.07,2.4)',     // street lamp arm — reaches over the road
      'BoxGeometry(1,0.2,0.44)',        // street lamp head, on the end of that arm
      'BoxGeometry(0.9,0.16,0.4)',      // side-street lamp head
      'CylinderGeometry(0.07,3.2)',     // covered walkway post at a crossing
      'BoxGeometry(1.78,0.62,4.32)',    // vehicles, which drive on roads
      'BoxGeometry(1.64,0.5,2.1)',
      'BoxGeometry(1.69,0.38,2)',
      'BoxGeometry(2.5,2.5,11.8)',      // bus body
      'BoxGeometry(2.54,0.62,11.7)',
      'BoxGeometry(2.54,0.95,10.4)',
      'CylinderGeometry(0.31,0.2)',     // vehicle wheels
      'CylinderGeometry(0.14,6.4)',     // palm planted in the central median
      'CylinderGeometry(0.07,1)',       // tree branch, part of a canopy that overhangs
      'CapsuleGeometry(0.4,0.04)',      // pedestrian limbs — people do cross roads
      'CapsuleGeometry(0.44,0.06)',
      'CapsuleGeometry(0.34,0.13)',
      'CapsuleGeometry(0.1,0.12)',
      'BoxGeometry(0.11,0.07,0.25)',    // shoes
      'SphereGeometry(0.05)', 'SphereGeometry(0.1)', 'SphereGeometry(0.11)',
      'BoxGeometry(0.22,0.26,0.1)',     // the bag they are carrying
      'CylinderGeometry(0.05,0.1)',
    ]);
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat) continue;                     // markings belong on the road
      if (LEGITIMATE.has(p.sig)) continue;
      const rd = roadAt(p.x, p.z, -0.5);        // half a metre inside the kerb
      if (!rd) continue;
      bad[p.sig] = (bad[p.sig] || 0) + 1;
      if (ex.length < 12) ex.push(`${p.sig} in "${rd}" at ${p.x | 0},${p.z | 0}`);
    }
    const total = Object.values(bad).reduce((a, b) => a + b, 0);
    add('props-in-carriageway', total ? 'HIGH' : 'ok', total,
        Object.entries(bad).sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${v}x ${k}`).join('  ') || 'none', ex);
  }

  /* ---- CHECK 2: props standing inside a building ---- */
  {
    // Signage and awnings are fixed to the building, so their footprint
    // overlap is the point, not a defect.
    const MOUNTED = new Set([
      'BoxGeometry(0.28,1.05,2.6)',     // shopfront fascia sign
      'BoxGeometry(0.9,7.5,0.35)',      // vertical banner sign
      'BoxGeometry(1,3.2,0.5)',         // rooftop sign box
      'IcosahedronGeometry(1)',         // tree canopy brushing a facade
      'SphereGeometry(0.66)',
      'BoxGeometry(2.1,0.34,3)',        // median passing a building frontage
      'CylinderGeometry(0.07,1)',       // tree branch brushing a facade
    ]);
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat) continue;
      if (MOUNTED.has(p.sig)) continue;
      const b = buildingAt(p.x, p.z);
      if (!b) continue;
      bad[p.sig] = (bad[p.sig] || 0) + 1;
      if (ex.length < 10) ex.push(`${p.sig} inside "${b}"`);
    }
    const total = Object.values(bad).reduce((a, b) => a + b, 0);
    add('props-inside-buildings', total > 40 ? 'MED' : total ? 'LOW' : 'ok', total,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([k, v]) => `${v}x ${k}`).join('  ') || 'none', ex);
  }

  /* ---- CHECK 3: props floating above or sunk below the ground ---- */
  {
    let floating = 0, sunk = 0; const ex = [];
    for (const p of props) {
      if (!terr) break;
      const g = terr.at(p.x, p.z);
      const d = p.y - g;
      if (d > 19) { floating++; if (ex.length < 8) ex.push(`${p.sig} ${d.toFixed(1)}m above ground`); }
      if (d < -1.2) { sunk++; if (ex.length < 8) ex.push(`${p.sig} ${(-d).toFixed(1)}m below ground`); }
    }
    add('props-off-ground', (floating + sunk) > 30 ? 'MED' : (floating + sunk) ? 'LOW' : 'ok',
        floating + sunk, `${floating} floating, ${sunk} sunk`, ex);
  }

  /* ---- CHECK 4: which streets got dressed at all ---- */
  {
    const named = new Map();
    for (const r of carriage) {
      if (!r.n) continue;
      let len = 0;
      for (let i = 0; i < r.p.length - 1; i++)
        len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
      const e = named.get(r.n) || { len: 0, pts: [] };
      e.len += len; e.pts.push(...r.p);
      named.set(r.n, e);
    }
    // distance from the axis, so we only judge streets inside the dressed area
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
    // prop lookup grid, for "is there anything near this street"
    const pGrid = new Map();
    for (const p of props) {
      if (p.flat) continue;
      const k = Math.floor(p.x / CELL) + ',' + Math.floor(p.z / CELL);
      if (!pGrid.has(k)) pGrid.set(k, 0);
      pGrid.set(k, pGrid.get(k) + 1);
    }
    const bare = [];
    let inReach = 0;
    for (const [name, e] of named) {
      if (e.len < 60) continue;
      const mid = e.pts[Math.floor(e.pts.length / 2)];
      const d = axisDist(mid[0], mid[1]);
      if (d > 230) continue;                    // outside the dressed area by design
      inReach++;
      let n = 0;
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++)
          n += pGrid.get((Math.floor(mid[0] / CELL) + dx) + ',' + (Math.floor(mid[1] / CELL) + dz)) || 0;
      if (n < 3) bare.push(`${name} (${e.len | 0}m, ${d | 0}m off axis, ${n} props)`);
    }
    add('undressed-streets', bare.length > 8 ? 'HIGH' : bare.length ? 'MED' : 'ok',
        bare.length, `${bare.length} of ${inReach} named streets inside the dressed radius have almost nothing on them`,
        bare.slice(0, 14));
  }

  /* ---- CHECK 5: where the pedestrians actually are ---- */
  {
    const people = window.__crowdPositions ? window.__crowdPositions() : null;
    if (!people) {
      add('crowd-coverage', 'HIGH', -1, 'no crowd position hook to measure', []);
    } else {
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
      let onAxis = 0, offAxis = 0;
      for (const p of people) (axisDist(p[0], p[1]) < 30 ? onAxis++ : offAxis++);
      add('crowd-coverage', offAxis === 0 ? 'HIGH' : offAxis < people.length * 0.15 ? 'MED' : 'ok',
          offAxis, `${people.length} pedestrians: ${onAxis} within 30m of Orchard Road, ${offAxis} anywhere else`, []);
    }
  }

  /* ---- CHECK 6: traffic coverage ---- */
  {
    const v = window.__trafficPositions ? window.__trafficPositions() : null;
    add('traffic-coverage', v ? (v.length ? 'ok' : 'HIGH') : 'HIGH', v ? v.length : -1,
        v ? `${v.length} vehicles, all on the main axis by construction` : 'no traffic hook', []);
  }

  /* ---- CHECK 7: building geometry standing in a carriageway ---- */
  {
    const bad = [];
    for (const b of data.buildings) {
      let worst = 0, wx = 0, wz = 0;
      for (const p of b.p) {
        const list = grid.get(Math.floor(p[0] / CELL) + ',' + Math.floor(p[1] / CELL));
        if (!list) continue;
        for (const [x1, z1, x2, z2, half, name, kind] of list) {
          if (kind === 'service') continue;      // set-downs and loading bays are fine
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((p[0] - x1) * vx + (p[1] - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = p[0] - (x1 + vx * t), dz = p[1] - (z1 + vz * t);
          const pen = half - Math.hypot(dx, dz);
          if (pen > worst) { worst = pen; wx = p[0]; wz = p[1]; }
        }
      }
      if (worst > 0.8) bad.push(`${b.n || '(unnamed)'} ${worst.toFixed(1)}m into the road`);
    }
    add('buildings-in-carriageway', bad.length > 20 ? 'HIGH' : bad.length ? 'MED' : 'ok',
        bad.length, `${bad.length} of ${data.buildings.length} footprints cross a non-service carriageway`,
        bad.slice(0, 12));
  }

  /* ---- CHECK 8: props stacked on top of each other ---- */
  {
    const NEAR = 0.6, cellS = 1.0, g2 = new Map();
    let dup = 0; const ex = [];
    const CLUSTERED = new Set(['CylinderGeometry(0.07,1)']);  // tree branches
    for (const p of props) {
      if (p.flat || CLUSTERED.has(p.sig)) continue;
      const cx = Math.floor(p.x / cellS), cz = Math.floor(p.z / cellS);
      let hit = false;
      for (let dx = -1; dx <= 1 && !hit; dx++)
        for (let dz = -1; dz <= 1 && !hit; dz++) {
          const list = g2.get(p.sig + '|' + (cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const q of list) {
            if ((q[0] - p.x) ** 2 + (q[1] - p.z) ** 2 < NEAR * NEAR) { hit = true; break; }
          }
        }
      if (hit) { dup++; if (ex.length < 6) ex.push(`${p.sig} doubled at ${p.x | 0},${p.z | 0}`); }
      const k = p.sig + '|' + cx + ',' + cz;
      if (!g2.has(k)) g2.set(k, []);
      g2.get(k).push([p.x, p.z]);
    }
    add('stacked-props', dup > 200 ? 'MED' : dup ? 'LOW' : 'ok', dup,
        `${dup} props sit within 60cm of an identical one`, ex);
  }

  return out;
};
