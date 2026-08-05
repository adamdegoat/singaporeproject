// KERB GEOMETRY STANDING IN A CARRIAGEWAY.
//
// The 2026-08-04 sweep reported "crossing-refuge kerb stubs sitting detached in
// carriageways" and named two coordinates. One of them (-816,12571) still shows
// it: a pale kerb block lying across the tarmac with nothing attached to it,
// and a stepped run of slabs beside it. A kerb is the EDGE of a carriageway; a
// kerb in the middle of one is something a rider hits.
//
// Measured by material colour (PAL.kerb 0xb5b0a4) against the road index,
// because the kerb layers are merged per tile and their names do not survive.
//
//   node data/kerbcheck.mjs
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });

const res = await page.evaluate(() => {
  const T = window.__THREE;
  const v = new T.Vector3();
  const bad = [];
  let checked = 0;
  // KERBS ARE INSTANCED PROPS. The first cut of this check skipped
  // InstancedMeshes — the same reflex that made paintcheck report a clean
  // island — and duly reported "0 of 0" and passed. A check that passes by
  // measuring nothing is worse than no check.
  const m4 = new T.Matrix4();
  window.__scene.traverse((o) => {
    if (!o.isMesh) return;
    const c = o.material && o.material.color;
    if (!c || c.getHexString() !== 'b5b0a4') return;
    o.updateWorldMatrix(true, false);
    if (o.isInstancedMesh) {
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4);
        v.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
        checked++;
        if (!window.__onRoad || !window.__onRoad(v.x, v.z, -1.2)) continue;
        bad.push({ x: +v.x.toFixed(1), z: +v.z.toFixed(1), y: +v.y.toFixed(2) });
      }
      return;
    }
    const pos = o.geometry?.attributes?.position;
    if (!pos) return;
    // every 6th vertex is plenty: a kerb block is a box
    for (let i = 0; i < pos.count; i += 6) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      checked++;
      // INSIDE the carriageway, not merely at its edge: a kerb IS the edge, so
      // a negative margin is what separates "the kerb line" from "a block in
      // the road". 1.2m in from the kerb face.
      if (!window.__onRoad || !window.__onRoad(v.x, v.z, -1.2)) continue;
      bad.push({ x: +v.x.toFixed(1), z: +v.z.toFixed(1), y: +v.y.toFixed(2) });
    }
  });
  const seen = [], clusters = [];
  for (const b of bad) {
    if (seen.some((q) => Math.hypot(q.x - b.x, q.z - b.z) < 25)) continue;
    seen.push(b); clusters.push(b);
    if (clusters.length >= 20) break;
  }
  return { checked, bad: bad.length, clusters };
});

console.log(`  kerbcheck: ${res.bad} of ${res.checked} sampled kerb vertices sit more than 1.2m inside a carriageway`);
for (const c of res.clusters) console.log(`     kerb in the road at (${c.x},${c.z}) y=${c.y}`);
await browser.close();
if (res.bad) { console.log('  kerbcheck FAIL'); process.exit(1); }
console.log('  kerbcheck ok');
