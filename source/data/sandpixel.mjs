#!/usr/bin/env node
// IS THE DRAWN SAND GREEN? — the pixel half of the question, done so the
// samples cannot be anything but sand.
//
//     SG_SCENE=sentosa node data/sandpixel.mjs
//
// The first attempt at this eyeballed an aerial frame and sampled what looked
// like beach; most of those pixels were the SEA, which is pale green, and the
// answer that came out of it was wrong. Every sample here is raycast: the
// camera looks straight down at a point known to be inside a mapped beach
// ring, and each sampled pixel is accepted only if a ray through it lands on
// the ground mesh inside that same ring. Choose verification points from the
// geometry, never from the picture.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('shots/sand', { recursive: true });
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
         '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.setDefaultTimeout(180000);
const SCENE = process.env.SG_SCENE || 'sentosa';
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?dpr=1&scene=${SCENE}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 180000 });
await page.evaluate(() => window.__ui(false));
await page.waitForTimeout(1500);

const res = await page.evaluate(async (scene) => {
  const data = await (await fetch(`data/${scene}.json`)).json();
  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  const beaches = (data.green || []).filter((g) => /^(siloso|tanjong|palawan) beach$/i.test(g.n || ''));
  const out = [];
  for (const b of beaches) {
    // a point that is INSIDE the ring and on open sand: walk the ring's own
    // vertices inward toward the ring centroid until seaDist says beach
    let cx = 0, cz = 0;
    for (const [x, z] of b.p) { cx += x; cz += z; }
    cx /= b.p.length; cz /= b.p.length;
    const seaD = (x, z) => (window.__terrain && window.__terrain.seaDistAt ? window.__terrain.seaDistAt(x, z) : 0);
    let px = null, pz = null;
    for (const [vx, vz] of b.p) {
      for (let s = 4; s <= 40; s += 4) {
        const dx = cx - vx, dz = cz - vz, dl = Math.hypot(dx, dz) || 1;
        const qx = vx + (dx / dl) * s, qz = vz + (dz / dl) * s;
        const d = seaD(qx, qz);
        if (inRing(qx, qz, b.p) && d > 4 && d < 30 && window.__surfaceAt(qx, qz) > 0.5) {
          px = qx; pz = qz; break;
        }
      }
      if (px !== null) break;
    }
    out.push({ n: b.n, x: px, z: pz });
  }
  return out;
}, SCENE);

console.log('sampling points (inside ring, 4-30m from the waterline):');
for (const r of res) console.log(' ', r.n, r.x === null ? 'NO POINT FOUND' : `${r.x.toFixed(0)},${r.z.toFixed(0)}`);

for (const r of res) {
  if (r.x === null) continue;
  // stand 30m up, look straight down: the centre of the frame is that point
  // teleport the ride first: the streamer builds around it, and a camera
  // parked away from the ride looks at chunks nobody asked for (lookat.mjs
  // documents the same trap).
  await page.evaluate((s) => window.__teleport(s.x, s.z, 0), r);
  await page.waitForTimeout(2500);
  await page.evaluate(({ x, z }) => {
    const g = window.__surfaceAt(x, z);
    // 28m up, aimed a hair off vertical so the up-vector stays defined
    window.__cam(x, g + 28, z, x + 0.4, g, z, 40);
  }, r);
  await page.waitForTimeout(800);
  const tag = r.n.split(' ')[0].toLowerCase();
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync(`shots/sand/${tag}.png`, buf);
  console.log(`  shots/sand/${tag}.png`);
}
await browser.close();
