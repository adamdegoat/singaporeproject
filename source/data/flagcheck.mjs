// FLAGCHECK — the swim flags place at last (0 -> 260 once the sea existed).
// Now ask the quality question: do they stand AT the waterline, or out in the
// sea? Reads the placer's own recorder plus the drawn sea level.
// Run: node data/flagcheck.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.addInitScript(() => { window.__flagDbg = []; });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=sentosa`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  // THE PUBLISHED NUMBER FIRST, the mesh only as a fallback. Finding the sea
  // by `o.name === 'seaSurface'` is the same shape as tacheck's A8 finding gate
  // posts by CylinderGeometry: one batching pass from matching nothing, and
  // this file then measured every flag's depth against `null` — which coerces
  // to 0 — and reported a plausible sheet. `window.__seaY` is what the game
  // itself reads (city.js publishes it), so it cannot drift from the water.
  let seaY = typeof window.__seaY === 'number' ? +window.__seaY.toFixed(2) : null;
  if (seaY === null) {
    window.__scene.traverse((o) => {
      if (o.name === 'seaSurface' && o.geometry) seaY = +o.geometry.attributes.position.getY(0).toFixed(2);
    });
  }
  const d = window.__flagDbg || [];
  const placed = d.filter((r) => r.found);
  const depth = placed.map((r) => +(r.endH - seaY).toFixed(2)).sort((a, b) => a - b);
  const q = (f) => depth.length ? depth[Math.min(depth.length - 1, Math.floor(depth.length * f))] : null;
  return {
    seaY,
    stations: d.length,
    placed: placed.length,
    failed: d.length - placed.length,
    whyFailed: d.filter((r) => !r.found).reduce((a, r) => (a[r.why] = (a[r.why] || 0) + 1, a), {}),
    // height of the flag's ground RELATIVE TO THE SEA: 0 is the waterline,
    // negative is standing in the water, positive is up the dry sand
    depthMin: depth[0], depthP25: q(0.25), depthMedian: q(0.5), depthP75: q(0.75), depthMax: depth[depth.length - 1],
    underWater: depth.filter((v) => v < -0.15).length,
    atWaterline: depth.filter((v) => v >= -0.15 && v <= 0.9).length,
    upTheBeach: depth.filter((v) => v > 0.9).length,
    sample: placed.slice(0, 6).map((r) => ({ x: r.fx, z: r.fz, h: r.endH })),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
