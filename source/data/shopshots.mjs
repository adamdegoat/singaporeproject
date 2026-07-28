#!/usr/bin/env node
// Eye-level frames of the shopfronts themselves.
//
//     node data/shopshots.mjs [count]
//
// The comparison sheet frames a street; a shopfront is 5m wide and 4m tall and
// is a smudge at that distance. These stand a person on the pavement 9m out
// from a bay that was actually built, looking straight at it, so the glass, the
// reveals, the fascia and the lettering can be judged rather than assumed.
//
// Cameras come from the built bays — position and normal — not from a spot that
// framed well.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { writeFileSync, mkdirSync } from 'fs';

const OUT = 'shots/shopfront';
const W = 1400, H = 800;
const N = +(process.argv[2] || 8);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.setDefaultTimeout(120000);
await page.goto(`http://localhost:8933/?dpr=1&scene=${process.env.SG_SCENE || 'world'}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
await page.waitForTimeout(1200);
await page.evaluate(() => window.__ui(false));

// Spread the picks along the axis rather than taking the first N, which would
// all be the same fifty metres of one street.
const bays = await page.evaluate((n) => {
  const named = (window.__shopBays || []).filter((b) => b.name);
  const step = Math.max(1, Math.floor(named.length / n));
  const out = [];
  for (let i = 0; i < named.length && out.length < n; i += step) out.push(named[i]);
  return out;
}, N);

const shots = [];
for (let i = 0; i < bays.length; i++) {
  const b = bays[i];
  // 9m back, a little to one side so the glass is seen at an angle as well as
  // straight on, eye height 1.65
  const off = (i % 2 ? 1 : -1) * 2.4;
  const tx = -b.nz, tz = b.nx;
  const cx = b.x + b.nx * 9 + tx * off, cz = b.z + b.nz * 9 + tz * off;
  await page.evaluate(([x, y, z, ax, ay, az]) => window.__cam(x, y, z, ax, ay, az, 44),
    [cx, b.y + 1.65, cz, b.x, b.y + 1.5, b.z]);
  await page.waitForTimeout(420);
  const file = `${OUT}/${String(i + 1).padStart(2, '0')}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 88 });
  shots.push({ file, name: b.name, kind: b.kind, building: b.building, w: b.w });
  console.log(`  ${file}  ${b.name}  (${b.kind}) on ${b.building || '(unnamed)'}`);
}
writeFileSync(`${OUT}/shots.json`, JSON.stringify(shots, null, 1));
await browser.close();
console.log(`${shots.length} frames → ${OUT}`);
