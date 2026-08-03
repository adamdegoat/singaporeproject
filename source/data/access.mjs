// THE ACCESSIBILITY SWEEP (owner's mandate, 2026-08-03: "entire island is
// accessible, no weird bugs causing invisible walls"). Walks every road AND
// footpath centreline at 1.5m steps asking the collision grid the question a
// moving player asks: is this blocked? A blocked sample on a centreline is
// either an invisible wall (defect) or unmapped construction (also a defect —
// players cannot read our excuses). Clusters within 25m collapse to one
// finding. Exploratory, not a gate; findings get fixed then this promotes.
// Run: SG_SCENE=sentosa node data/access.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}${process.env.SG_FLAGS || ''}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000, polling: 250 });

const hits = await page.evaluate(() => {
  const out = [];
  const roads = (window.__data && window.__data.roads) || [];
  for (const r of roads) {
    const pts = r.p;
    if (!pts || pts.length < 2) continue;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      for (let t = 0; t <= L; t += 1.5) {
        const x = x0 + (x1 - x0) * (t / L || 0), z = z0 + (z1 - z0) * (t / L || 0);
        if (window.__blocked && window.__blocked(x, z)) {
          out.push({ n: r.n || r.k, k: r.k, x: +x.toFixed(0), z: +z.toFixed(0) });
        }
      }
    }
  }
  return out;
});
const clusters = [];
for (const h of hits) {
  const c = clusters.find((c) => Math.hypot(c.x - h.x, c.z - h.z) < 25);
  if (c) c.count++;
  else clusters.push({ ...h, count: 1 });
}
clusters.sort((a, b) => b.count - a.count);
console.log(`blocked centreline samples: ${hits.length}, clusters: ${clusters.length}`);
for (const c of clusters.slice(0, 25)) {
  console.log(`  ${String(c.count).padStart(4)}x  ${c.n} (${c.k}) at ${c.x},${c.z}`);
}
await browser.close();
