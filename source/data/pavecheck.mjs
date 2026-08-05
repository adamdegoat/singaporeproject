// PAVEMENT DRAWN OVER THE CARRIAGEWAY.
//
// Found 2026-08-05 chasing what the older sweep had called a "crossing-refuge
// kerb stub" at (-816,12571). It is not a kerb — data/kerbcheck.mjs measures
// 2,410 kerb instances and ZERO inside a carriageway. The pale slab lying
// across the tarmac there is the PAVING layer, drawn proud of the road.
//
// IDENTIFY BY MATERIAL IDENTITY, NOT BY APPEARANCE. Two wrong populations were
// measured before this one:
//   * by mesh NAME ('pavementSurface') — consolidate re-merges the named
//     layers into tileBatch meshes and the name does not survive. Reports a
//     clean island.
//   * by "white with a map" — that is also every road marking and every zebra
//     crossing, which are ON the carriageway because that is where they go.
//     Reported 13% of the layer defective, which is a broken measurement.
// The map OBJECT survives both merges, so compare against window.__MAT.paving.
//
//   node data/pavecheck.mjs
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
// 1.5m INSIDE the kerb face. A pavement legitimately meets the carriageway at
// its edge; what is wrong is pavement out in the running lane.
const MARGIN = -(+(process.env.PAVE_MARGIN || 1.5));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });

const res = await page.evaluate((margin) => {
  const T = window.__THREE;
  const v = new T.Vector3();
  if (!window.__MAT || !window.__MAT.paving) return { error: 'no __MAT.paving — cannot identify the layer' };
  const pavingMap = window.__MAT.paving.map;
  let meshes = 0, sampled = 0, bad = 0;
  const hits = [];
  window.__scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    if (!o.material || o.material.map !== pavingMap) return;
    meshes++;
    const pos = o.geometry?.attributes?.position;
    if (!pos) return;
    o.updateWorldMatrix(true, false);
    for (let i = 0; i < pos.count; i += 3) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      sampled++;
      if (!window.__onRoad || !window.__onRoad(v.x, v.z, margin)) continue;
      bad++;
      if (hits.length < 4000) hits.push({ x: +v.x.toFixed(1), z: +v.z.toFixed(1) });
    }
  });
  const seen = [], clusters = [];
  for (const h of hits) {
    if (seen.some((q) => Math.hypot(q.x - h.x, q.z - h.z) < 35)) continue;
    seen.push(h); clusters.push(h);
    if (clusters.length >= 20) break;
  }
  return { meshes, sampled, bad, clusters };
}, MARGIN);

if (res.error) { console.log('  pavecheck: ' + res.error); await browser.close(); process.exit(1); }
const pct = res.sampled ? (100 * res.bad / res.sampled).toFixed(2) : '0';
console.log(`  pavecheck: ${res.bad} of ${res.sampled} paving vertices (${pct}%) across ${res.meshes} meshes `
  + `sit more than ${-MARGIN}m inside a carriageway`);
for (const c of res.clusters) console.log(`     pavement in the road at (${c.x},${c.z})`);
await browser.close();
if (res.bad) { console.log('  pavecheck FAIL (report-only — see the handover)'); process.exit(1); }
console.log('  pavecheck ok');
