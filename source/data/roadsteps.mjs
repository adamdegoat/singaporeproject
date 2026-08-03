// Walk every road of a scene at 2m steps; report height DISCONTINUITIES in
// the ride surface (surfaceAt) — the class the owner found riding Sentosa
// ("roads in the air then suddenly drop": a 6.5m cliff mid-Gateway, fixed
// 2026-08-03 by bridge-run deck sharing + terminal ramps in city.js).
// Exploratory, not a gate: SG_SCENE=<id> SG_PORT=<port> node data/roadsteps.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/index.html?dpr=1&scene=${process.env.SG_SCENE || 'sentosa'}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 150000, polling: 250 });

const steps = await page.evaluate(() => {
  const out = [];
  const roads = (window.__data && window.__data.roads) || [];
  for (const r of roads) {
    const pts = r.p;
    if (!pts || pts.length < 2) continue;
    let prevH = null, prevX = 0, prevZ = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      for (let t = 0; t <= L; t += 2) {
        const x = x0 + (x1 - x0) * (t / L || 0), z = z0 + (z1 - z0) * (t / L || 0);
        const h = window.__surfaceAt(x, z);
        if (prevH != null && Math.abs(h - prevH) > 1.2) {
          out.push({ n: r.n || r.k || '?', k: r.k, x: +x.toFixed(0), z: +z.toFixed(0),
                     from: +prevH.toFixed(1), to: +h.toFixed(1), d: +(h - prevH).toFixed(1) });
        }
        prevH = h;
      }
    }
  }
  return out;
});
// cluster by proximity (30m) so one broken ramp is one finding
const clusters = [];
for (const s of steps) {
  const c = clusters.find((c) => Math.hypot(c.x - s.x, c.z - s.z) < 30);
  if (c) { c.count++; c.maxD = Math.abs(s.d) > Math.abs(c.maxD) ? s.d : c.maxD; }
  else clusters.push({ ...s, count: 1, maxD: s.d });
}
clusters.sort((a, b) => Math.abs(b.maxD) - Math.abs(a.maxD));
console.log(`raw step events: ${steps.length}, clusters: ${clusters.length}`);
for (const c of clusters.slice(0, 20)) {
  console.log(`  ${String(c.maxD).padStart(6)}m  ${c.n} (${c.k}) at ${c.x},${c.z}  [${c.count} samples]`);
}
await browser.close();
