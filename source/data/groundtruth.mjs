// DOES THE GROUND AGREE WITH THE MAP? A whole-island surface audit.
//
// The owner, 2026-08-05: "check when i free if all the terrain are correct
// logically with sentosa. Like some part of the beach i see green grass."
//
// He was right to ask and the answer turned out to be TWO different things, so
// this check separates them rather than lumping them together:
//
//  1. A DESIGNED BLEND is not a defect. terrain.js deliberately fades mapped
//     sand back to lawn beyond 45m from the water, because OSM's beach polygons
//     on Sentosa run 100m+ inland — Siloso's reaches up the slope — and the open
//     sand in every reference photograph is a ~40m band at the waterline. Green
//     at the back of a beach is CORRECT. Green at the waterline is not.
//  2. A MISMATCH is a defect: the map says one surface and the ground is painted
//     as something else, with no rule in between saying why.
//
// So every sample is judged against what the ground SHOULD be at that point
// given every rule terrain.js applies, not against the raw map class. The check
// reads the rules from the world itself — it asks `__terrain.greenAt` for the
// class and reads the DRAWN vertex colour — so it cannot drift away from the
// renderer the way a reimplementation would.
//
//   node data/groundtruth.mjs            the whole island
//   GT_N=4000 node data/groundtruth.mjs  denser
//
// REPORT-ONLY. It prints coordinates; go and look at them.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { writeFileSync, mkdirSync } from 'fs';

const PORT = process.env.SG_PORT || 8933;
const N = +(process.env.GT_N || 2200);
const SCENE = process.env.SG_SCENE || 'sentosa';

const browser = await chromium.launch({
  channel: process.env.SWEEP_CHANNEL || 'chrome', headless: false,
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message.slice(0, 160)));
await page.goto(`http://localhost:${PORT}/?district=${SCENE}&nostream&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError',
  null, { polling: 400, timeout: 300000 });
const boot = await page.evaluate(() => window.__bootError || null);
if (boot) { console.log('  BOOT FAILED: ' + String(boot).slice(0, 300)); await browser.close(); process.exit(2); }

const out = await page.evaluate((N) => {
  const T = window.__THREE;
  const terrain = window.__terrain;
  const data = window.__data;
  const g = terrain.g;
  const res = { samples: 0, byClass: {}, findings: [], notes: [] };

  // the same expectation terrain.js paints with, asked of the world itself
  const seaD = (x, z) => (terrain.seaDistAt ? terrain.seaDistAt(x, z) : Infinity);

  // sample INSIDE each mapped surface, proportional to its area, so a 5ha beach
  // gets more looks than a 200m2 pond and nothing is judged on one point
  const rings = (data.green || []).filter((q) => q.p && q.p.length > 3);
  const area = (p) => {
    let a = 0;
    for (let i = 0; i < p.length; i++) {
      const [x1, z1] = p[i], [x2, z2] = p[(i + 1) % p.length];
      a += x1 * z2 - x2 * z1;
    }
    return Math.abs(a) / 2;
  };
  const inRing = (x, z, p) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, zi] = p[i], [xj, zj] = p[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const total = rings.reduce((s, q) => s + area(q.p), 0) || 1;

  // a deterministic sampler: same points every run, so two runs are comparable
  let seed = 20260805;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const ray = new T.Raycaster();
  const down = new T.Vector3(0, -1, 0);

  for (const r of rings) {
    const share = Math.max(4, Math.round((area(r.p) / total) * N));
    let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const [x, z] of r.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    let placed = 0, tries = 0;
    while (placed < share && tries < share * 40) {
      tries++;
      const x = mnx + rnd() * (mxx - mnx), z = mnz + rnd() * (mxz - mnz);
      if (!inRing(x, z, r.p)) continue;
      placed++;
      res.samples++;
      const k = r.k || 'grass';
      res.byClass[k] = res.byClass[k] || { n: 0, agree: 0, covered: 0, mismatch: 0 };
      res.byClass[k].n++;

      // what does the world say is here?
      const said = terrain.greenAt(x, z);
      // SMALLEST RING WINS in greenAt, so a pitch inside a park answers 'pitch'
      // and that is correct, not a mismatch — only count a disagreement when the
      // answer is not this ring's class AND not a smaller class covering it.
      if (said !== k) {
        const smaller = rings.some((q) => q !== r && q.k === said && q.p
          && inRing(x, z, q.p) && area(q.p) <= area(r.p));
        if (smaller) { res.byClass[k].covered++; continue; }
      }

      // is the ground UNDER something built? then its colour is not the point
      const built = (window.__inFootprint && window.__inFootprint(x, z))
        || (window.__onRoad && window.__onRoad(x, z, 0));
      if (built) { res.byClass[k].covered++; continue; }

      if (said === k) { res.byClass[k].agree++; continue; }

      res.byClass[k].mismatch++;
      if (res.findings.length < 300) {
        res.findings.push({ k, said, x: Math.round(x), z: Math.round(z),
          seaD: Math.round(seaD(x, z)), y: +terrain.at(x, z).toFixed(1) });
      }
    }
  }

  // THE SAND QUESTION, ASKED PROPERLY: sample the AREA, not the ring.
  //
  // The first cut walked the polygon's own vertices and reported 16 points for
  // three beaches, and the per-beach colour section came back EMPTY — a check
  // measuring nothing, which is the failure this repo has paid for four times.
  // Two reasons, both worth writing down:
  //
  //  * seaDistAt is a BFS over 35m GRID CELLS, so its answers come in steps of
  //    35: a point 20m inland reads 35, not 20. "Within 45m of water" is
  //    therefore about one cell, and only a handful of ring vertices qualify.
  //    That is fine for terrain.js, which uses the same coarse metric to blend
  //    with, but it is useless as a sampling rule.
  //  * the ring vertices ARE the waterline, so stepping 12m in still left the
  //    samples below the 0.2m floor and every one was skipped.
  //
  // So: a real grid over each beach, classified by distance from the water, and
  // the DRAWN vertex colour read at each point — because "I see green grass on
  // the beach" is a question about colour, not about classes.
  const sands = rings.filter((q) => q.k === 'sand');
  const beachShade = [];
  let openN = 0, openBad = 0;
  const openBadAt = [];
  for (const s of sands) {
    let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const [x, z] of s.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    const band = { near: { n: 0, green: 0 }, mid: { n: 0, green: 0 }, back: { n: 0, green: 0 },
      notSand: 0 };
    let missed = 0;
    for (let x = mnx; x <= mxx; x += 6) {
      for (let z = mnz; z <= mxz; z += 6) {
        if (!inRing(x, z, s.p)) continue;
        const y = terrain.at(x, z);
        if (y < 0.05) continue;                    // in the water
        if (window.__inFootprint && window.__inFootprint(x, z)) continue;
        if (window.__onRoad && window.__onRoad(x, z, 0)) continue;
        // ONLY WHERE THE GROUND IS ACTUALLY CLASSED AS SAND. A beach polygon
        // overlaps car parks, plazas, lawns and buildings' aprons, and greenAt
        // hands the smallest ring the answer — so a point inside the beach ring
        // that the world calls 'grass' or 'plaza' is painted green CORRECTLY
        // and counting it as a beach defect is measuring the wrong population.
        // The first run reported Siloso 45% green near the water on exactly
        // that mistake.
        if (terrain.greenAt(x, z) !== 'sand') { band.notSand = (band.notSand || 0) + 1; continue; }
        const d = seaD(x, z);
        const b = d <= 40 ? band.near : d <= 90 ? band.mid : band.back;
        ray.set(new T.Vector3(x, y + 40, z), down);
        const hit = ray.intersectObjects(window.__scene.children, true)
          .find((q) => q.object.geometry && q.object.geometry.attributes.color && q.face);
        if (!hit) { missed++; continue; }
        const c = hit.object.geometry.attributes.color;
        const R = c.getX(hit.face.a), G = c.getY(hit.face.a), B = c.getZ(hit.face.a);
        b.n++;
        // sand is warm and pale — red leads and blue trails. Lawn is green:
        // G above R. This is the same distinction the eye makes at a glance.
        const isGreen = G > R;
        if (isGreen) b.green++;
        if (d <= 40) {
          openN++;
          if (isGreen) {
            openBad++;
            if (openBadAt.length < 40) openBadAt.push([Math.round(x), Math.round(z)]);
          }
        }
      }
    }
    beachShade.push({ beach: s.n || '(unnamed)', missed, notSand: band.notSand,
      near: band.near, mid: band.mid, back: band.back });
  }
  res.openSand = { n: openN, notSand: openBad, at: openBadAt };
  res.beachShade = beachShade;
  return res;
}, N);

mkdirSync('shots', { recursive: true });
console.log(`== ground truth ${SCENE}: ${out.samples} samples inside mapped surfaces\n`);
console.log('   class      samples   agree  under something  DISAGREE');
for (const [k, v] of Object.entries(out.byClass).sort((a, b) => b[1].n - a[1].n)) {
  const pct = v.n ? (100 * v.mismatch / v.n).toFixed(1) : '0.0';
  console.log(`   ${k.padEnd(10)} ${String(v.n).padStart(7)} ${String(v.agree).padStart(7)}`
    + ` ${String(v.covered).padStart(16)} ${String(v.mismatch).padStart(9)}  (${pct}%)`);
}

console.log(`\n   OPEN SAND (within 45m of open water — where green WOULD be a defect)`);
console.log(`     ${out.openSand.n} points, ${out.openSand.notSand} not reading as sand`);
for (const [x, z] of out.openSand.at.slice(0, 10)) console.log(`       ${x},${z}`);

console.log(`\n   WHAT EACH BEACH ACTUALLY LOOKS LIKE (drawn ground colour, % reading GREEN)`);
console.log(`     beach                  <40m from water    40-90m        back`);
const pc = (o) => (o.n ? `${String(o.green).padStart(4)}/${String(o.n).padEnd(4)} ${(100 * o.green / o.n).toFixed(0).padStart(3)}%` : '        -   ');
for (const b of out.beachShade) {
  console.log(`     ${String(b.beach).padEnd(22)} ${pc(b.near)}  ${pc(b.mid)}  ${pc(b.back)}`
    + (b.notSand ? `   ${b.notSand} pts inside the ring are not sand ground` : '')
    + (b.missed ? `   (${b.missed} rays missed)` : ''));
}
console.log(`     green near the water is a DEFECT; green at the back is the designed blend`);

if (out.findings.length) {
  console.log(`\n   DISAGREEMENTS, first ${Math.min(20, out.findings.length)} of ${out.findings.length}:`);
  for (const f of out.findings.slice(0, 20)) {
    console.log(`     map says ${String(f.k).padEnd(7)} ground says ${String(f.said).padEnd(7)}`
      + ` at ${String(f.x).padStart(6)},${f.z}   ${f.seaD}m from sea, ${f.y}m up`);
  }
}
writeFileSync('shots/groundtruth.json', JSON.stringify(out, null, 1));
console.log('\n   full report: shots/groundtruth.json   (report-only — go and look)');
await browser.close();
