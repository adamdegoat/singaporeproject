// EDGECHECK — HOW DOES THE DRAWN LAND MEET THE DRAWN WATER?
//
//     node data/edgecheck.mjs                  # report
//     SG_XPARAMS=noedge node data/edgecheck.mjs   # ...with the feather off
//
// The handover of 2026-08-29 measured 313 water-boundary crossings by hand and
// found two-thirds of them stepping 1.5m or more, a fifth of them sheer faces
// over 6m — "the bank going into the water as a row of angular vertical green
// wedges rather than a shore". That measurement lived in a paragraph. This is
// it as a script, so the next change to `vertexY` can be judged against it
// instead of against a memory of it.
//
// WHAT IT MEASURES, AND WHY AT 1.5m. A crossing is found on a coarse 8m walk —
// one sample inside a sea ring, its neighbour outside — and then the step is
// measured at 1.5m, which is the drawn mesh's OWN vertex spacing (terrain.js:
// "subdivided 24 ways per cell — about 1.46m"). Measuring the step at 8m reads
// a smooth eight-metre ramp as an eight-metre cliff and would have called the
// shelf a failure. The number reported is the WORST adjacent pair within +-6m
// of the crossing, which is the tallest single face a player can see there.
//
// IT IS A GATE, AND THE BUDGET IS AN ABSOLUTE COUNT, NOT A RATIO. The first
// draft of this file argued itself out of being a gate on the grounds that "a
// budget here would be a budget on how much of the island is a marina" — the
// >6m band is 930 crossings and EVERY ONE of them is in Sentosa Cove (clustered
// by 200m cell, the top twelve cells are all x -200..800, z 13200..14000), and
// terrain.js's own note says the real Sentosa Cove is walled, so those are
// correct. That argument is right about the ratio and wrong about the gate: the
// thing worth guarding is that the BEACHES keep shelving, and that is a count
// of crossings under 1.5m, which a new marina can only ever push UP.
//
// The floor is 3,100 against 3,432 measured on 2026-08-30 — about 10% of slack,
// the same shape of margin as perfbudget.json. With the edge feather off it
// reads 2,189, so this gate fails hard if the feather is ever lost.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('edgecheck.mjs');
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const XP = process.env.SG_XPARAMS ? '&' + process.env.SG_XPARAMS : '';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}${XP}`,
  { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  const T = window.__terrain;
  const g = T.grid();
  const wet = (x, z) => { const b = T.waterFloor(x, z); return b !== null && b < 0.2; };
  const COARSE = 8, FINE = 1.5, REACH = 6;
  const res = { crossings: 0, buckets: {}, worst: 0, worstAt: null, ex: [] };
  const B = ['<0.5', '0.5-1.5', '1.5-3', '3-6', '>6'];
  for (const b of B) res.buckets[b] = 0;
  const x0 = g.x0, z0 = g.z0;
  const X1 = g.x0 + g.cell * (g.nx - 1), Z1 = g.z0 + g.cell * (g.nz - 1);
  for (let x = x0; x <= X1; x += COARSE) {
    for (let z = z0; z <= Z1; z += COARSE) {
      const a = wet(x, z);
      for (const [dx, dz] of [[COARSE, 0], [0, COARSE]]) {
        if (x + dx > X1 || z + dz > Z1) continue;
        if (wet(x + dx, z + dz) === a) continue;
        // a crossing. walk it at the mesh's own spacing and take the tallest
        // single face within reach of it.
        const ux = dx / COARSE, uz = dz / COARSE;
        const mx = x + dx / 2, mz = z + dz / 2;
        let worst = 0;
        let prev = T.vertexY(mx - ux * REACH, mz - uz * REACH);
        for (let s = -REACH + FINE; s <= REACH; s += FINE) {
          const h = T.vertexY(mx + ux * s, mz + uz * s);
          const d = Math.abs(h - prev);
          if (d > worst) worst = d;
          prev = h;
        }
        res.crossings++;
        const k = worst < 0.5 ? B[0] : worst < 1.5 ? B[1] : worst < 3 ? B[2] : worst < 6 ? B[3] : B[4];
        res.buckets[k]++;
        if (worst > res.worst) { res.worst = worst; res.worstAt = [mx | 0, mz | 0]; }
        if (worst > 6 && res.ex.length < 10) res.ex.push([mx | 0, mz | 0, +worst.toFixed(2)]);
      }
    }
  }
  return res;
});
await browser.close();

console.log(`edgecheck  ${out.crossings} water-boundary crossings, step measured at 1.5m`);
let cum = 0;
for (const [k, n] of Object.entries(out.buckets)) {
  cum += n;
  const pct = ((n / out.crossings) * 100).toFixed(1);
  console.log(`    ${k.padEnd(9)} ${String(n).padStart(5)}   ${pct.padStart(5)}%   `
    + `(${((cum / out.crossings) * 100).toFixed(1)}% cumulative)`);
}
console.log(`  worst face ${out.worst.toFixed(2)}m at ${out.worstAt}`);
for (const e of out.ex) console.log(`    OVER6  ${e[0]},${e[1]}  ${e[2]}m`);
const gentle = out.buckets['<0.5'] + out.buckets['0.5-1.5'];
const FLOOR = +(process.env.SG_EDGE_FLOOR || 3100);
if (gentle < FLOOR) {
  console.log(`   FAIL  only ${gentle} crossings shelve under 1.5m (floor ${FLOOR})`);
  process.exit(1);
}
console.log(`   PASS  ${gentle} crossings shelve under 1.5m (floor ${FLOOR})`);
