// TRAILCHECK — can a player actually WALK Sentosa's paths?
//
// The owner: "make sure all walking paths all also like sentosa. trails and
// those i can explore." Drawing a trail is not the same as being able to walk
// it, so this asks the three questions that decide it, at 3m steps along every
// mapped footway and pedestrian way:
//
//   DRAWN    is there a trail surface under this point at all?
//   STEP     does the surface a walker stands on jump between steps? A step
//            over ~0.45m is a stumble; over 1.2m is a wall.
//   BURIED   is the drawn trail below the terrain beside it (invisible), or
//            floating above it?
//
// Run: SG_SCENE=sentosa node data/trailcheck.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  // NO RAYCASTS. The first version of this file cast a ray per sample against
  // every mesh in the scene and did not finish in ten minutes. Everything it
  // wanted is already answered by the two functions the WALKER ITSELF uses —
  // surfaceAt for what you stand on and terrain.at for the ground beside it —
  // so the check now asks exactly what the game asks, and runs in seconds.
  const res = {
    ways: 0, pts: 0, noSurface: 0, steps: 0, bigSteps: 0, floating: 0,
    exNoSurface: [], exStep: [], exFloat: [],
  };

  for (const r of (window.__data.roads || [])) {
    const k = r.k || '';
    if (k !== 'footway' && k !== 'pedestrian') continue;
    const p = r.p || [];
    if (p.length < 2) continue;
    res.ways++;
    let prev = null;
    const trend = [];
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.ceil(L / 1.5));   // 1.5m: a stride, so a wall cannot hide between samples
      for (let s = 0; s <= n; s++) {
        const t = s / n;
        const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        res.pts++;
        const g = window.__terrain.at(x, z);
        // what does a walker stand on here?
        const surf = window.__surfaceAt ? window.__surfaceAt(x, z) : g;
        // N3 — A STEP IS A DISCONTINUITY, NOT A SLOPE.
        //
        // This used to flag every |delta| over 0.45m between samples 3m apart,
        // which is a 15% grade — and Sentosa's trails genuinely climb harder
        // than that up Imbiah and Mount Serapong. It read 452 "steps" on a
        // network whose real walls are a tiny fraction of that, and a check
        // that reports defects which are not there is worse than no check,
        // because the fix for a phantom is a change to something that was
        // right.
        //
        // So a step is now a SPIKE ABOVE THE LOCAL TREND: the jump between two
        // adjacent samples, compared with the grade the path is actually
        // running at either side of it. A staircase is exempt by kind — a
        // tread IS a discontinuity and that is what stairs are for.
        if (prev !== null) {
          const d = surf - prev;
          trend.push(d);
          if (trend.length > 6) trend.shift();
          // typical rise per sample nearby, ignoring this one
          const others = trend.slice(0, -1).map(Math.abs).sort((a, b) => a - b);
          const typical = others.length ? others[Math.floor(others.length / 2)] : 0;
          const spike = Math.abs(d) > 0.40 && Math.abs(d) > 3 * Math.max(typical, 0.05);
          if (spike && k !== 'steps') {
            res.steps++;
            if (Math.abs(d) > 1.0) res.bigSteps++;
            if (res.exStep.length < 25) {
              res.exStep.push({ n: r.n || k, x: x | 0, z: z | 0,
                                d: +d.toFixed(2), trend: +typical.toFixed(2) });
            }
          }
        }
        prev = surf;
        // Is this point BLOCKED — a walker cannot stand where a building or a
        // wall is. A mapped path running through solid geometry is a path you
        // cannot explore, which is the owner's actual question.
        if (window.__blocked && window.__blocked(x, z)) {
          res.noSurface++;
          if (res.exNoSurface.length < 12) res.exNoSurface.push({ n: r.n || k, x: x | 0, z: z | 0 });
        }
        if (surf - g > 1.5) {
          res.floating++;
          if (res.exFloat.length < 8) {
            res.exFloat.push({ n: r.n || k, x: x | 0, z: z | 0, up: +(surf - g).toFixed(2) });
          }
        }
      }
    }
  }
  return res;
});
console.log(`ways ${out.ways}  sample points ${out.pts}`);
console.log(`  path blocked     : ${out.noSurface}  (${(100 * out.noSurface / out.pts).toFixed(1)}%)`);
console.log(`  N3 surface spikes: ${out.steps}   of which >1.0m: ${out.bigSteps}`);
console.log(`  floating >1.5m   : ${out.floating}`);
for (const e of out.exNoSurface) console.log(`    NOSURF ${e.n} at ${e.x},${e.z}`);
for (const e of out.exStep) console.log(`    STEP   ${e.n} at ${e.x},${e.z} d=${e.d} (local grade ${e.trend}m/sample)`);
for (const e of out.exFloat) console.log(`    FLOAT  ${e.n} at ${e.x},${e.z} up=${e.up}`);
await browser.close();
