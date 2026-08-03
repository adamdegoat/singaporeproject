// SEA PROBE — is the open-sea sheet in the scene at all, and where does the
// heightfield actually put sea level? terrain.py sinks open water to -2.0 and
// then REBASES the whole grid so min(h) == 0, which means the runtime test in
// buildSea (`h < -0.4`) may never be true. Measure, do not reason.
// Run: node data/seaprobe.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  const names = [];
  window.__scene.traverse((o) => { if (o.isMesh && /sea|water/i.test(o.name || '')) names.push(o.name); });
  const g = window.__terrain.grid && window.__terrain.grid();
  let mn = 1e9, mx = -1e9, below = 0, atMin = 0;
  const hist = {};
  if (g) {
    for (const v of g.h) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
      if (v < -0.4) below++;
      const b = Math.floor(v * 2) / 2;
      hist[b] = (hist[b] || 0) + 1;
    }
    for (const v of g.h) if (v <= mn + 0.001) atMin++;
  }
  const top = Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return {
    seaMeshes: names,
    grid: g ? { n: g.h.length, min: +mn.toFixed(2), max: +mx.toFixed(2),
                belowMinus04: below, atMin, base: g.base,
                pctBelow: +(100 * below / g.h.length).toFixed(2) } : null,
    topBuckets: top,
    // what buildSea would decide, in its own terms
    buildSeaWouldRun: g ? (below / g.h.length >= 0.04) : false,
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
