// Where the carriageways are.
//
// Street dressing used to be placed with a test that only knew about building
// footprints, so a tree could sit in the middle of a back road and nothing in
// the code objected: it was not inside a building, so it was fair game. This
// gives the placement code the other half of the picture.
//
// A spatial hash over road segments, because the district has 3,185 ways and
// tens of thousands of props get tested against them at build time.

const CELL = 40;

export function buildRoadIndex(data, axis) {
  const grid = new Map();
  let segs = 0;

  const add = (x1, z1, x2, z2, half, name) => {
    const seg = [x1, z1, x2, z2, half, name];
    segs++;
    // stamp the segment into every cell its swept width can touch
    const minx = Math.min(x1, x2) - half, maxx = Math.max(x1, x2) + half;
    const minz = Math.min(z1, z2) - half, maxz = Math.max(z1, z2) + half;
    for (let cx = Math.floor(minx / CELL); cx <= Math.floor(maxx / CELL); cx++) {
      for (let cz = Math.floor(minz / CELL); cz <= Math.floor(maxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(seg);
      }
    }
  };

  for (const r of (data.roads || [])) {
    // footways and pedestrian streets are places you walk, not carriageways
    if (r.k === 'footway' || r.k === 'pedestrian' || r.k === 'steps') continue;
    const half = (r.w || 6) / 2;
    for (let i = 0; i < r.p.length - 1; i++) {
      add(r.p[i][0], r.p[i][1], r.p[i + 1][0], r.p[i + 1][1], half, r.n || null);
    }
  }
  // the stitched main axis is wider than the fragments it was built from
  if (axis) {
    const half = axis.w / 2;
    for (let i = 0; i < axis.p.length - 1; i++) {
      add(axis.p[i][0], axis.p[i][1], axis.p[i + 1][0], axis.p[i + 1][1], half, axis.n || 'Orchard Road');
    }
  }

  // is this point inside any carriageway, allowing a margin outside the kerb?
  // `except` names a street whose own carriageway is ignored. Mount Sophia is
  // mapped as ten ways of three different widths running alongside each other,
  // so the kerb line of the narrow one falls inside the wide one and every
  // kerb on the street was refused, leaving it bare.
  const onRoad = (x, z, margin = 0, except = null) => {
    const list = grid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return false;
    for (const [x1, z1, x2, z2, half, nm] of list) {
      if (except && nm === except) continue;
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      const reach = half + margin;
      if (dx * dx + dz * dz < reach * reach) return true;
    }
    return false;
  };

  // which named street is nearest to a point. Used so a name plate is never
  // planted where a different street is closer than the one it names.
  const nearestName = (x, z, reach = 60) => {
    let best = Infinity, name = null;
    const span = Math.ceil(reach / CELL);
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    for (let dx = -span; dx <= span; dx++)
      for (let dz = -span; dz <= span; dz++) {
        const list = grid.get((cx + dx) + ',' + (cz + dz));
        if (!list) continue;
        for (const [x1, z1, x2, z2, , nm] of list) {
          if (!nm || nm === '(unnamed)') continue;
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const d = (x - (x1 + vx * t)) ** 2 + (z - (z1 + vz * t)) ** 2;
          if (d < best) { best = d; name = nm; }
        }
      }
    return name;
  };

  // Move a point out of any carriageway it is standing in, pushing away from
  // the nearest road centreline. Bus stops, taxi ranks and MRT entrances come
  // from real OSM coordinates that are often mapped on the kerb line or a
  // little inside it: those are real things and should be nudged onto the
  // pavement, not deleted. Returns the original point if it was already clear,
  // or null if no clear spot is found within `limit`.
  const pushClear = (x, z, margin = -0.6, limit = 7) => {
    if (!onRoad(x, z, margin)) return [x, z];
    // direction away from the nearest carriageway centre
    let bx = x, bz = z, bd = Infinity;
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) {
        const list = grid.get((cx + dx) + ',' + (cz + dz));
        if (!list) continue;
        for (const [x1, z1, x2, z2] of list) {
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const px = x1 + vx * t, pz = z1 + vz * t;
          const d = (x - px) ** 2 + (z - pz) ** 2;
          if (d < bd) { bd = d; bx = px; bz = pz; }
        }
      }
    let ax = x - bx, az = z - bz;
    const L = Math.hypot(ax, az);
    if (L < 1e-6) { ax = 1; az = 0; } else { ax /= L; az /= L; }
    for (let step = 0.8; step <= limit; step += 0.8) {
      const nx2 = x + ax * step, nz2 = z + az * step;
      if (!onRoad(nx2, nz2, margin)) return [nx2, nz2];
    }
    return null;
  };

  return { onRoad, nearestName, pushClear, segments: segs };
}

// One prop per spot. OSM splits streets into fragments that overlap at every
// junction, and dressing each fragment independently laid the same kerb, tree
// or lamp two and three times in the same place: 2,963 duplicates across the
// district, all of them z-fighting with each other.
const claimed = new Set();
export function claim(kind, x, z, cell = 1.6) {
  const k = kind + '|' + Math.round(x / cell) + ',' + Math.round(z / cell);
  if (claimed.has(k)) return false;
  claimed.add(k);
  return true;
}
