// BLOCKWHO — for every blocked run on a footway, NAME THE THING THAT BLOCKS IT.
//
// This exists because "what is the wall here" has now been answered wrongly
// three times:
//   1. raycast said `busRest` at 1000,13278 and `carriage` at -2721,11967.
//      Both wrong. A bounding box cannot tell a thin diagonal rail from a wide
//      plate, and after the per-tile merge a hit names a mesh spanning 110m.
//   2. "street furniture standing on a footway" was the standing hypothesis
//      for five of these runs. It cannot be true: Solid.build() rasterises
//      `o.isMesh && !o.isInstancedMesh` only, and all street dressing is
//      instanced. Guarding the emitters changed the count from 8 to 8.
//
// So ask the grid itself. `?solidtrace=1` makes Solid remember which mesh
// marked each cell, and this walks each run cell by cell and prints it.
//
// Run: SG_SCENE=sentosa node data/blockwho.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.on('pageerror', (e) => console.log('  PAGE ERROR', e.message));
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}&solidtrace=1`,
                { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const MINRUN = +(process.env.SG_MINRUN || 3);
const out = await page.evaluate((MINRUN) => {
  const runs = [];
  const traced = typeof window.__solidWhat === 'function' && window.__solidWhat(0, 0) !== undefined;

  // Walk at 0.75m — the collision CELL size. trailcheck samples at 1.5m, which
  // is a stride and right for "can a walker get through", but it is two cells,
  // so the sample that reports a run is not necessarily a cell that is marked.
  // That is why three of the eight probed clear at the reported point: the
  // reported point is the START of the run, not the blocked cell.
  for (const r of (window.__data.roads || [])) {
    const k = r.k || '';
    if (k !== 'footway' && k !== 'pedestrian') continue;
    const p = r.p || [];
    if (p.length < 2) continue;

    let run = null;
    const close = () => {
      if (run && run.m > MINRUN && run.m <= 20) runs.push(run);
      run = null;
    };
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.ceil(L / 0.75));
      for (let s = 0; s <= n; s++) {
        const t = s / n;
        const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        if (window.__blocked(x, z)) {
          if (!run) run = { n: r.n || k, k, x0: x, z0: z, m: 0, cells: [] };
          run.m += 0.75;
          // Every predicate that can make __blocked true, so there is no
          // inference left to do. rideBlocked = arcade-open, then water-with-
          // a-deck, then blocked().
          const cell = {
            x: +x.toFixed(1), z: +z.toFixed(1),
            solid: !!(window.__solid && window.__solid(x, z)),
            water: !!(window.__inWater && window.__inWater(x, z)),
            deck: window.__anyDeckAt ? window.__anyDeckAt(x, z) !== null : null,
            fp: !!(window.__inFootprint && window.__inFootprint(x, z)),
            what: traced && window.__solidWhat ? window.__solidWhat(x, z) : null,
          };
          if (run.cells.length < 40) run.cells.push(cell);
        } else close();
      }
    }
    close();
  }
  return { runs, traced };
}, MINRUN);

console.log(`\n  trace ${out.traced ? 'ON' : 'OFF — ?solidtrace did not take'}`);
console.log(`  ${out.runs.length} blocked runs ${MINRUN}-20m on footways\n`);
for (const r of out.runs) {
  console.log(`  ${r.m.toFixed(1)}m  ${r.n}  from ${r.x0.toFixed(0)},${r.z0.toFixed(0)}`);
  // Collapse identical verdicts: a 9m run is 12 cells and they are usually the
  // same wall. Printing 12 lines per run buried the one that differed.
  const seen = new Map();
  for (const c of r.cells) {
    const key = `${c.solid}|${c.water}|${c.deck}|${c.fp}|${c.what}`;
    if (!seen.has(key)) seen.set(key, { c, n: 0 });
    seen.get(key).n++;
  }
  for (const { c, n } of seen.values()) {
    const why = [c.solid && 'SOLID', c.water && 'WATER', c.water && !c.deck && 'no-deck',
                 c.fp && 'FOOTPRINT'].filter(Boolean).join('+') || 'clear?';
    console.log(`      x${String(n).padStart(2)}  ${why.padEnd(24)} ${c.what || '(not traced)'}`);
  }
  console.log('');
}
await browser.close();
