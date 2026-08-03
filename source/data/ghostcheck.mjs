// INVISIBLE-BUILDING PROBE (owner's ride report, 2026-08-03: "seeing
// buildings on map but its invisible so i will hit them"). For every mapped
// building: find an interior point, ray straight down from above it, and ask
// whether ANY drawn mesh answers above the terrain. A footprint that blocks
// (map + collision) with nothing drawn is the Mustafa class — geometry
// silently dropped while its collision stayed.
// Run: SG_SCENE=sentosa node data/ghostcheck.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}${process.env.SG_FLAGS || ''}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  const T = window.__THREE;
  const ray = new T.Raycaster();
  const down = new T.Vector3(0, -1, 0);
  const ghosts = [];
  let tested = 0;
  const inPoly = (poly, x, z) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
    }
    return hit;
  };
  for (const b of window.__data.buildings) {
    if (b.roof) continue;                       // canopies are open by design
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const q of b.p) {
      if (q[0] < mnx) mnx = q[0]; if (q[0] > mxx) mxx = q[0];
      if (q[1] < mnz) mnz = q[1]; if (q[1] > mxz) mxz = q[1];
    }
    let px = null, pz = null;
    for (let a = 1; a < 8 && px === null; a++) {
      for (let c = 1; c < 8; c++) {
        const x = mnx + (mxx - mnx) * a / 8, z = mnz + (mnz - mxz ? (mxz - mnz) * c / 8 : 0);
        if (inPoly(b.p, x, z)) { px = x; pz = z; break; }
      }
    }
    if (px === null) continue;
    tested++;
    const gy = window.__terrain ? window.__terrain.at(px, pz) : 0;
    ray.set(new T.Vector3(px, gy + 200, pz), down);
    ray.far = 250;
    const hits = ray.intersectObjects(window.__scene.children, true)
      .filter((h) => h.object.name !== 'terrainSurface' && h.object.name !== 'seaSurface'
                     && h.object.name !== 'waterSurface' && h.point.y > gy + 1.5);
    if (!hits.length) {
      ghosts.push({ n: b.n || '-', x: px | 0, z: pz | 0, h: b.h, a: b.a });
    }
  }
  return { tested, badGeo: (window.__badGeo || 0), ghosts: ghosts.slice(0, 30), total: ghosts.length };
});
console.log(`tested ${out.tested} buildings; INVISIBLE: ${out.total}`);
for (const g of out.ghosts) console.log(`  ${g.n} at ${g.x},${g.z} h=${g.h} a=${g.a}`);
await browser.close();
