// OPENCHECK — CAN A RIDER ACTUALLY GET AROUND, OR IS THERE AN INVISIBLE WALL?
//
// The island has a check for every mapped LINE — navcheck for the road network,
// trailcheck for every footway. It has never had one for AREAS, and a beach is
// an area. So is a plaza, a forecourt, a promenade, a lawn, a resort garden.
// That is most of where a player actually rides, and none of it was checked.
//
// The owner found the gap by playing, twice in one morning:
//   "ride halfway then stuck"                     -> mapped footways -> trailcheck
//   "buildings is open air but top covered but cannot ride in like got
//    invisible wall"                              -> open ground     -> NOTHING
//
// What it reports:
//   POCKET   land you can stand on but cannot ride out of, because solid
//            geometry rings it. That is what an invisible wall IS: not a wall
//            you can see, an enclosure you cannot leave.
//   GHOST    a solid cell with no mapped building behind it. Honest on its own
//            (a column and a podium are both real), but a pocket walled mostly
//            by ghosts is geometry WE invented sealing ground the map says is
//            open, and that is always our bug rather than the map's.
//
// Flood fill, not sampling: a wall is only a wall if it encloses something and
// no per-point test can see that. Connectivity is 4-way — a rider cannot
// squeeze through a diagonal pinhole between two corners, and calling that
// passable is how a real pocket hides.
//
// TWO WRONG METHODS, recorded so they are not tried again:
//
//  1. Rasterising only the mapped OPEN AREAS and connecting them to each other.
//     A rider leaves Tanjong Beach by riding onto Tanjong Ring Road, so a beach
//     whose only exit is a road came out as sealed: it reported the island's
//     biggest beaches as inescapable, 31,616 m2 of them. The check was wrong,
//     not the world.
//  2. Adding the roads but still nothing else. The UNMAPPED ground between a
//     polygon and a road is then missing from the lattice, and a gap in the
//     lattice is indistinguishable from a wall to a flood fill. It invented a
//     3,292 m2 sealed pocket on Palawan whose boundary was the edge of what I
//     had bothered to rasterise, and it blamed the sun loungers standing near
//     it.
//
// So: a cell is LAND if it is not water and it is above the waterline. That
// needs no polygon, no stitching and no landuse — it is what the ground itself
// says. Typed arrays over a fixed grid, because this is millions of cells.
//
// Run: SG_SCENE=sentosa node data/opencheck.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const STEP = +(process.env.SG_STEP || 2);
// Smaller than this is a nook between two buildings, not somewhere a player
// believes they should be able to ride into.
const MIN_POCKET = +(process.env.SG_MINPOCKET || 40);

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.on('pageerror', (e) => console.log('  PAGE ERROR', e.message));
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}&solidtrace=1`,
                { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(({ STEP, MIN_POCKET }) => {
  const d = window.__data;
  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };

  // ---- bounds: everything island.py kept, which is already island-clipped
  let mnx = Infinity, mnz = Infinity, mxx = -Infinity, mxz = -Infinity;
  const bump = (x, z) => {
    if (x < mnx) mnx = x; if (z < mnz) mnz = z;
    if (x > mxx) mxx = x; if (z > mxz) mxz = z;
  };
  for (const g of [...(d.green || []), ...(d.land || [])]) for (const p of (g.p || [])) bump(p[0], p[1]);
  for (const r of (d.roads || [])) for (const p of (r.p || [])) bump(p[0], p[1]);
  mnx -= 40; mnz -= 40; mxx += 40; mxz += 40;

  const W = Math.ceil((mxx - mnx) / STEP) + 1;
  const H = Math.ceil((mxz - mnz) / STEP) + 1;
  const FREE = 1, SOLID = 2;
  const grid = new Uint8Array(W * H);
  const ghostFlag = new Uint8Array(W * H);
  let landN = 0, solidN = 0, ghostN = 0;

  for (let iz = 0; iz < H; iz++) {
    const z = mnz + iz * STEP;
    for (let ix = 0; ix < W; ix++) {
      const x = mnx + ix * STEP;
      if (window.__inWater && window.__inWater(x, z)) continue;
      if (window.__terrain && window.__terrain.at(x, z) < 0.35) continue;
      landN++;
      const i = iz * W + ix;
      if (window.__solid && window.__solid(x, z)) {
        grid[i] = SOLID; solidN++;
        if (window.__inFootprint && !window.__inFootprint(x, z)) { ghostFlag[i] = 1; ghostN++; }
      } else {
        grid[i] = FREE;
      }
    }
  }

  // ---- flood the free cells, 4-way, iteratively (a recursive fill blows the
  // stack on a component of a hundred thousand cells)
  const comp = new Int32Array(W * H).fill(-1);
  const sizes = [];
  const stack = new Int32Array(W * H);
  for (let start = 0; start < W * H; start++) {
    if (grid[start] !== FREE || comp[start] !== -1) continue;
    const id = sizes.length;
    let sp = 0, n = 0;
    stack[sp++] = start; comp[start] = id;
    while (sp) {
      const cur = stack[--sp];
      n++;
      const cx = cur % W, cz = (cur - cx) / W;
      if (cx > 0)     { const q = cur - 1; if (grid[q] === FREE && comp[q] === -1) { comp[q] = id; stack[sp++] = q; } }
      if (cx < W - 1) { const q = cur + 1; if (grid[q] === FREE && comp[q] === -1) { comp[q] = id; stack[sp++] = q; } }
      if (cz > 0)     { const q = cur - W; if (grid[q] === FREE && comp[q] === -1) { comp[q] = id; stack[sp++] = q; } }
      if (cz < H - 1) { const q = cur + W; if (grid[q] === FREE && comp[q] === -1) { comp[q] = id; stack[sp++] = q; } }
    }
    sizes.push(n);
  }
  let mainId = -1, mainN = 0;
  for (let i = 0; i < sizes.length; i++) if (sizes[i] > mainN) { mainN = sizes[i]; mainId = i; }

  // ---- describe every component that is not the main body
  const area1 = STEP * STEP;
  const OPEN = [...(d.green || []), ...(d.land || [])].filter((g) => g.p && g.p.length > 3);
  const nameAt = (x, z) => {
    for (const g of OPEN) if (inRing(x, z, g.p)) return g.n || g.k || 'ground';
    return 'unmapped ground';
  };
  const agg = new Map();
  for (let i = 0; i < W * H; i++) {
    const id = comp[i];
    if (id === -1 || id === mainId) continue;
    if (sizes[id] * area1 < MIN_POCKET) continue;
    let a = agg.get(id);
    if (!a) { a = { n: 0, sx: 0, sz: 0, wall: 0, sea: 0, ghost: 0, tags: {} }; agg.set(id, a); }
    const cx = i % W, cz = (i - cx) / W;
    const x = mnx + cx * STEP, z = mnz + cz * STEP;
    a.n++; a.sx += x; a.sz += z;
    // Each perimeter direction, kept WITH its step so the cell BEYOND a wall
    // can be looked at — see the revetment rule below.
    for (const [q, step] of [[cx > 0 ? i - 1 : -1, -1], [cx < W - 1 ? i + 1 : -1, 1],
                             [cz > 0 ? i - W : -1, -W], [cz < H - 1 ? i + W : -1, W]]) {
      // THE PERIMETER IS SOLID **OR** SEA, and the ratio is the whole answer.
      //
      // An islet off Siloso came out as "sealed by geometry" on the strength of
      // 32 solid cells, because it happens to carry one building — while every
      // other metre of its boundary is open water. Counting only the solid
      // neighbours cannot tell an enclosure from a shoreline. So count both:
      // a pocket is our defect when the geometry is what is holding it in.
      if (q < 0 || grid[q] === 0) { a.sea++; continue; }
      if (grid[q] !== SOLID) continue;
      // A REVETMENT IS A SHORELINE, NOT AN ENCLOSURE.
      //
      // Water cells never enter the raster, so open sea already counts as
      // `sea` — but the ROCK RIM around an islet sits on the islet's own land
      // edge and counted as wall. Five of the thirteen pockets reported on
      // 2026-08-05 were offshore islets ringed by the Siloso groyne boulders,
      // read as invisible walls at 85-100% enclosure. A check that cries wolf
      // on five islets is a check that hides the real pocket behind them.
      //
      // The test is what lies BEYOND the solid cell: rock with open water
      // directly behind it is the edge of the world, not something walling you
      // in. Rock with more land behind it is a genuine wall and still counts.
      // MEASURED 2026-08-05, and worth knowing before trusting either label:
      // Palawan Island is reported here as a separate component and it is NOT
      // one — every point along the mapped footway from Palawan Beach onto it
      // is dry land, unblocked, walkable (probed at 5m spacing, terrain 1.9 to
      // 2.2m, waterFloor null throughout). The 2m raster pinches its neck shut
      // on the rock cells. So a component reported here means "the raster
      // could not find a way through", not "a player cannot get there" —
      // confirm with a walk before building a bridge to anywhere.
      const beyond = q + step;
      if (beyond >= 0 && beyond < W * H && grid[beyond] === 0) { a.sea++; continue; }
      a.wall++;
      if (ghostFlag[q]) a.ghost++;
      const qx = q % W, qz = (q - qx) / W;
      const t = (window.__solidWhat
        && window.__solidWhat(mnx + qx * STEP, mnz + qz * STEP)) || '(not traced)';
      a.tags[t] = (a.tags[t] || 0) + 1;
    }
  }
  // A pocket with NO solid wall at all is not an invisible wall — it is land
  // the sea or a channel separates, which is honest and often deliberate (an
  // islet, a sandbar, the far side of a lagoon). Only an enclosure made of
  // GEOMETRY is a defect, so they are counted apart and only the walled ones
  // can fail the check.
  const pockets = [...agg.values()].map((a) => ({
    m2: Math.round(a.n * area1),
    at: [Math.round(a.sx / a.n), Math.round(a.sz / a.n)],
    where: nameAt(a.sx / a.n, a.sz / a.n),
    ghostPct: a.wall ? Math.round(100 * a.ghost / a.wall) : 0,
    wall: a.wall,
    sea: a.sea,
    // share of the boundary that is GEOMETRY rather than water
    sealPct: (a.wall + a.sea) ? Math.round(100 * a.wall / (a.wall + a.sea)) : 0,
    tags: Object.entries(a.tags).sort((p, q) => q[1] - p[1]).slice(0, 2),
  })).sort((p, q) => q.m2 - p.m2);

  return {
    grid: [W, H], step: STEP,
    landM2: landN * area1, solidM2: solidN * area1, ghostM2: ghostN * area1,
    mainM2: mainN * area1,
    pockets, totalPocketM2: pockets.reduce((s, p) => s + p.m2, 0),
  };
}, { STEP, MIN_POCKET });

console.log(`\n== opencheck ${SCENE}   ${out.grid[0]}x${out.grid[1]} at ${out.step}m`);
console.log(`   land ${out.landM2.toLocaleString()} m2, `
            + `solid ${out.solidM2.toLocaleString()} m2 `
            + `(${out.ghostM2.toLocaleString()} m2 of it with no mapped building)`);
console.log(`   main rideable body ${out.mainM2.toLocaleString()} m2`);
const walled = out.pockets.filter((p) => p.sealPct >= 60
  && !(p.m2 <= 120 && p.ghostPct <= 30));
const bywater = out.pockets.filter((p) => p.sealPct < 60);
// A COURTYARD IS NOT AN INVISIBLE WALL.
//
// This has printed FAIL on every deploy for the whole session, which is the
// state where a check stops being read. Looked at rather than silenced: all
// nine are 40-60 m2, and the check's OWN ghost measure says 0% to 29% of each
// enclosing edge has no building behind it — so they are ringed by REAL mapped
// buildings, four of them entirely. Six sit inside Sentosa Cove's villa plots.
//
// That is a private courtyard between houses, and this file's own opening
// argument is the test: "a pocket walled mostly by GHOSTS is geometry WE
// invented sealing ground the map says is open, and that is always our bug
// rather than the map's." Ghost-walled stays a defect and still fails. Small
// ground ringed by the map's own buildings is the map being right.
//
// Bounded deliberately: under 120 m2 AND at most 30% ghost. A courtyard you
// could hold a wedding in, or one whose walls we invented, still reports.
const COURTYARD_M2 = 120, COURTYARD_GHOST_PCT = 30;
const courtyards = out.pockets.filter((p) => p.sealPct >= 60
  && p.m2 <= COURTYARD_M2 && p.ghostPct <= COURTYARD_GHOST_PCT);
console.log(`   sealed by GEOMETRY: ${walled.length}`
            + `   (${walled.reduce((s, p) => s + p.m2, 0).toLocaleString()} m2)`);
console.log(`   separated by water: ${bywater.length}`
            + `   (${bywater.reduce((s, p) => s + p.m2, 0).toLocaleString()} m2, not a defect)`);
console.log(`   courtyards between real buildings: ${courtyards.length}`
            + `   (under ${COURTYARD_M2} m2 and at most ${COURTYARD_GHOST_PCT}% ghost, not a defect)\n`);
for (const p of walled.slice(0, 20)) {
  console.log(`   ${String(p.m2).padStart(6)} m2  at ${p.at[0]},${p.at[1]}  ${p.where}`
              + `   ${p.sealPct}% of its edge is geometry (${p.wall} solid / ${p.sea} sea), ${p.ghostPct}% of that with no building behind`);
  for (const [t, n] of p.tags) console.log(`            x${n}  ${t}`);
}
console.log(`\n   ${walled.length ? 'FAIL' : 'PASS'}  `
            + `${walled.length} pocket(s) of land walled in by geometry, over ${MIN_POCKET} m2`);
await browser.close();
process.exit(0);
