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

  const add = (x1, z1, x2, z2, half) => {
    const seg = [x1, z1, x2, z2, half];
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
      add(r.p[i][0], r.p[i][1], r.p[i + 1][0], r.p[i + 1][1], half);
    }
  }
  // the stitched main axis is wider than the fragments it was built from
  if (axis) {
    const half = axis.w / 2;
    for (let i = 0; i < axis.p.length - 1; i++) {
      add(axis.p[i][0], axis.p[i][1], axis.p[i + 1][0], axis.p[i + 1][1], half);
    }
  }

  // is this point inside any carriageway, allowing a margin outside the kerb?
  const onRoad = (x, z, margin = 0) => {
    const list = grid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return false;
    for (const [x1, z1, x2, z2, half] of list) {
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      const reach = half + margin;
      if (dx * dx + dz * dz < reach * reach) return true;
    }
    return false;
  };

  return { onRoad, segments: segs };
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
export function resetClaims() { claimed.clear(); }
