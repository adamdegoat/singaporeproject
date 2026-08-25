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

// THE DRAWN TARMAC IS WIDER THAN THE WAYS IT IS DRAWN FROM, and these are the
// two numbers by which. city.js lays a DISC at every node two or more ways
// share, radius = the widest half-width meeting there + ROAD_JUNCTION_PAD, and
// re-lays a narrow way's first ROAD_TAPER_LEN metres at the wide width where
// the widths differ by more than a metre. Neither exists in `data.roads`, so
// an index built from the ways alone reports "not a road" for ground the
// player can plainly see is road.
//
// That gap is what put eighteen full-size trees on the tarmac — the owner's
// "trees in middle of roads", 2026-08-24, and the SECOND time this has been
// reported (2026-08-22 was answered by nudging a margin from 0 to 0.5, which
// is what you do when you have not measured the cause). Measured this time:
// every one of the eighteen reads onRoad(margin 0) NO and onRoad(margin 2)
// YES, which is the disc and the taper exactly.
//
// They live HERE and city.js imports them, so the shape that is drawn and the
// shape that is tested cannot drift apart again.
export const ROAD_JUNCTION_PAD = 0.6;
export const ROAD_TAPER_LEN = 9;
export const ROAD_NODE_SNAP = 0.5;
// ...AND THE THIRD NUMBER, WHICH IS THE ONE THE FIRST PASS MISSED.
//
// ribbon() in city.js pushes BOTH ends of every way out past its own terminal
// node by `half * ROAD_END_EXT`, so junction mouths are covered. The index
// stopped at the node, so a strip of drawn tarmac up to 6.3m long on an 11.4m
// way — and 8.1m on the 14.8m Sentosa Gateway — was road that no test knew
// about.
//
// THAT IS BOTH OF THE TWO TREES treecheck has been carrying as a named
// residue since 2026-08-24 ("cause not pinned down; someone should"). Pinned
// down 2026-08-25 by REPRODUCING ribbon()'s own polygon — subdivision, end
// extension, mitred offsets — and testing the trunk against each quad of the
// strip: (-891.3,12376.4) is inside segment 28 of 29 of an 11.4m service way,
// (-1063.7,12181.3) inside segment 0 of 17 of Sentosa Gateway. Both END
// segments, both the extension, neither a disc, a taper or a mitre. Guessing
// from distances had suggested the mitre and would have been wrong.
//
// city.js imports this rather than keeping its own literal, for the reason the
// block above already gives: the shape that is drawn and the shape that is
// tested may not drift apart again.
export const ROAD_END_EXT = 1.1;

// `opts.paths` builds the MIRROR of this index: the footways, pedestrian
// streets and steps that the carriageway index deliberately excludes. The
// surface model needs both — a paved footpath rolls like a road, and without
// this index every path on the island classified as whatever ground lay under
// it, which is usually grass. Paths are how you get around Sentosa; making
// them feel like grass would have been worse than having no surfaces at all.
export function buildRoadIndex(data, axis, opts = {}) {
  const PATHS = !!opts.paths;
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
    const isPath = r.k === 'footway' || r.k === 'pedestrian' || r.k === 'steps';
    if (isPath !== PATHS) continue;
    const half = (r.w || (PATHS ? 2.4 : 6)) / 2;
    for (let i = 0; i < r.p.length - 1; i++) {
      add(r.p[i][0], r.p[i][1], r.p[i + 1][0], r.p[i + 1][1], half, r.n || null);
    }
  }
  // ...AND THE JUNCTION DISCS AND WIDTH TAPERS, when asked for the DRAWN road
  // rather than the mapped one. `opts.drawn` builds the index a placement test
  // wants: the surface as it appears, not the centreline data it came from.
  // Kept opt-in so the carriageway index that every existing pass is tuned
  // against does not silently move under it.
  if (opts.drawn && !PATHS) {
    const nodes = new Map();
    for (const r of (data.roads || [])) {
      if (r.k === 'pedestrian' || r.k === 'footway' || r.bridge) continue;
      const p = r.p || [];
      if (p.length < 2) continue;
      const hw = (r.w || 6) / 2;
      for (const [x, z] of p) {
        const k = Math.round(x / ROAD_NODE_SNAP) + ',' + Math.round(z / ROAD_NODE_SNAP);
        const e = nodes.get(k);
        if (!e) nodes.set(k, { x, z, hw, ways: new Set([r]) });
        else { e.hw = Math.max(e.hw, hw); e.ways.add(r); }
      }
    }
    for (const e of nodes.values()) {
      if (e.ways.size < 2) continue;
      // the disc, as a zero-length segment: onRoad measures distance to the
      // segment, so a point-segment of radius R IS the disc
      add(e.x, e.z, e.x, e.z, e.hw + ROAD_JUNCTION_PAD, null);
      const wide = Math.max(...[...e.ways].map((r) => (r.w || 6)));
      for (const r of e.ways) {
        const w = r.w || 6;
        if (wide - w <= 1.0) continue;
        const p = r.p || [];
        if (p.length < 2) continue;
        const dStart = Math.hypot(p[0][0] - e.x, p[0][1] - e.z);
        const dEnd = Math.hypot(p[p.length - 1][0] - e.x, p[p.length - 1][1] - e.z);
        if (Math.min(dStart, dEnd) > ROAD_NODE_SNAP * 4) continue;
        const seq = dStart <= dEnd ? p : [...p].reverse();
        let run = 0;
        for (let i = 1; i < seq.length && run < ROAD_TAPER_LEN; i++) {
          const d = Math.hypot(seq[i][0] - seq[i - 1][0], seq[i][1] - seq[i - 1][1]);
          const t = run + d <= ROAD_TAPER_LEN ? 1 : (ROAD_TAPER_LEN - run) / d;
          add(seq[i - 1][0], seq[i - 1][1],
              seq[i - 1][0] + (seq[i][0] - seq[i - 1][0]) * t,
              seq[i - 1][1] + (seq[i][1] - seq[i - 1][1]) * t,
              wide / 2, r.n || null);
          run += d;
        }
      }
    }
    // THE END EXTENSION, on every way including bridges. The disc/taper block
    // above skips bridge ways because city.js's disc pass does; the extension
    // is not a junction treatment, it is part of every ribbon ever laid, and
    // Sentosa Gateway's is what the second stray tree was standing on.
    for (const r of (data.roads || [])) {
      if (r.k === 'footway' || r.k === 'pedestrian' || r.k === 'steps') continue;
      const p = r.p || [];
      if (p.length < 2) continue;
      const half = (r.w || 6) / 2;
      const ext = half * ROAD_END_EXT;
      // tip, and the point just inside it: the extension runs from the tip
      // AWAY from the way, which is the direction ribbon() sends it
      for (const [tip, inner] of [[p[0], p[1]], [p[p.length - 1], p[p.length - 2]]]) {
        const dx = tip[0] - inner[0], dz = tip[1] - inner[1];
        const L = Math.hypot(dx, dz);
        if (L < 1e-6) continue;
        add(tip[0], tip[1], tip[0] + (dx / L) * ext, tip[1] + (dz / L) * ext,
            half, r.n || null);
      }
    }
  }

  // the stitched main axis is wider than the fragments it was built from
  if (axis && !PATHS) {
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

    // Straight out from the nearest centreline first, since that is the shortest
    // way off this road. But at a junction that heading runs into the crossing
    // street, so fan out around it: one direction alone left a third of the
    // furniture with nowhere to stand.
    const fan = [0, 0.4, -0.4, 0.85, -0.85, 1.35, -1.35, Math.PI / 2, -Math.PI / 2];
    for (let step = 0.8; step <= limit; step += 0.8) {
      for (const turn of fan) {
        const c = Math.cos(turn), s2 = Math.sin(turn);
        const dx2 = ax * c - az * s2, dz2 = ax * s2 + az * c;
        const nx2 = x + dx2 * step, nz2 = z + dz2 * step;
        if (!onRoad(nx2, nz2, margin)) return [nx2, nz2];
      }
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
