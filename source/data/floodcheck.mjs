// FLOODCHECK — the open sea is now a real sheet covering the whole grid, so
// anything the world seats BELOW sea level is underwater. Ask directly: how
// many roads and buildings sit under it, and did the swim flags (four failed
// approaches, all for want of a waterline) finally find one?
// Run: node data/floodcheck.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  let seaY = null;
  window.__scene.traverse((o) => {
    if (o.name === 'seaSurface' && o.geometry) seaY = o.geometry.attributes.position.getY(0);
  });
  const g = (x, z) => window.__terrain.at(x, z);
  const res = { seaY, drownedRoadPts: 0, roadPts: 0, drownedBuildings: [], buildings: 0 };
  if (seaY === null) return res;
  for (const r of (window.__data.roads || [])) {
    for (const [x, z] of (r.p || [])) {
      res.roadPts++;
      if (g(x, z) < seaY - 0.05) res.drownedRoadPts++;
    }
  }
  for (const b of (window.__data.buildings || [])) {
    res.buildings++;
    let mn = 1e9;
    for (const [x, z] of b.p) { const h = g(x, z); if (h < mn) mn = h; }
    if (mn < seaY - 0.05) res.drownedBuildings.push({ n: b.n || '-', h: +mn.toFixed(2) });
  }
  res.drownedBuildingsN = res.drownedBuildings.length;
  res.drownedBuildings = res.drownedBuildings.slice(0, 12);
  res.stats = {
    swimFlags: (window.__stats || {}).swimFlags,
    beachPalms: (window.__stats || {}).beachPalms,
    patrolTowers: (window.__stats || {}).patrolTowers,
  };
  return res;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
