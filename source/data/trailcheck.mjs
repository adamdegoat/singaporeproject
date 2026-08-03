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
    longBlocks: 0, midBlocks: 0, tinyBlocks: 0, exBlock: [], exMid: [],
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
    let blockRun = 0, runX = 0, runZ = 0;
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
        // BLOCKED RUN LENGTH, NOT BLOCKED SAMPLE COUNT.
        //
        // The raw percentage was 2.0% and it meant nothing: measured, 122 of
        // the 184 blocked runs on Sentosa are under 3m — a path clipping a
        // building corner, which a walker simply steps around. What the owner
        // means by "halfway will stuck" is a LONG run, and there are 21 of
        // those over 20m. One number hid the other completely.
        if (window.__blocked && window.__blocked(x, z)) {
          res.noSurface++;
          if (!blockRun) { runX = x; runZ = z; }
          blockRun++;
          if (res.exNoSurface.length < 12) res.exNoSurface.push({ n: r.n || k, x: x | 0, z: z | 0 });
        } else if (blockRun) {
          const m = blockRun * 1.5;
          if (m > 20) {
            res.longBlocks++;
            if (res.exBlock.length < 12) {
              res.exBlock.push({ n: r.n || k, x: runX | 0, z: runZ | 0, m: +m.toFixed(0) });
            }
          } else if (m > 3) {
            res.midBlocks++;
            if (res.exMid.length < 14) {
              res.exMid.push({ n: r.n || k, x: runX | 0, z: runZ | 0, m: +m.toFixed(0) });
            }
          }
          else res.tinyBlocks++;
          blockRun = 0;
        }
        if (surf - g > 1.5) {
          res.floating++;
          if (res.exFloat.length < 8) {
            res.exFloat.push({ n: r.n || k, x: x | 0, z: z | 0, up: +(surf - g).toFixed(2) });
          }
        }
      }
    }
    // FLUSH A RUN STILL OPEN AT THE END OF THE WAY. Without this, a path that
    // is blocked all the way to its last sample — which is precisely the worst
    // case, a way that lies entirely inside a building — is never counted at
    // all. It under-reported 21 long blocks as 11 and hid a 226m one.
    if (blockRun) {
      const m = blockRun * 1.5;
      if (m > 20) {
        res.longBlocks++;
        if (res.exBlock.length < 12) {
          res.exBlock.push({ n: r.n || k, x: runX | 0, z: runZ | 0, m: +m.toFixed(0) });
        }
      } else if (m > 3) {
        res.midBlocks++;
        if (res.exMid.length < 14) {
          res.exMid.push({ n: r.n || k, x: runX | 0, z: runZ | 0, m: +m.toFixed(0) });
        }
      }
      else res.tinyBlocks++;
      blockRun = 0;
    }
  }
  return res;
});
console.log(`ways ${out.ways}  sample points ${out.pts}`);
console.log(`  BLOCKED runs >20m: ${out.longBlocks}   3-20m: ${out.midBlocks}   under 3m (walk around): ${out.tinyBlocks}`);
console.log(`  N3 surface spikes: ${out.steps}   of which >1.0m: ${out.bigSteps}`);
console.log(`  floating >1.5m   : ${out.floating}`);
for (const e of out.exBlock) console.log(`    BLOCKED ${e.m}m of ${e.n} from ${e.x},${e.z}`);
// N4 IS A GATE NOW, not a printout. Reached 0 on 2026-08-04 (from 24) and the
// owner's rule is that nothing may be blocked halfway — so it may go to zero
// and never back up. The short runs are NOT gated: 124 of them are under 3m,
// which is a path clipping a corner that a walker steps around, and gating
// noise is how a gate gets ignored.
const N4_BUDGET = +(process.env.SG_N4 || 0);
if (out.longBlocks > N4_BUDGET) {
  console.log(`   FAIL  ${out.longBlocks} walking route(s) blocked for over 20m `
    + `(budget ${N4_BUDGET})`);
  await browser.close();
  process.exit(1);
}
console.log(`   PASS  no walking route blocked for over 20m`);
for (const e of out.exMid) console.log(`    MID ${e.m}m of ${e.n} from ${e.x},${e.z}`);
for (const e of out.exStep) console.log(`    STEP   ${e.n} at ${e.x},${e.z} d=${e.d} (local grade ${e.trend}m/sample)`);
for (const e of out.exFloat) console.log(`    FLOAT  ${e.n} at ${e.x},${e.z} up=${e.up}`);
await browser.close();
