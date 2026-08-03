// SHORE LATTICE — the swim-flag probe (parked diagnosis, 2026-08-03).
// Four placement approaches found ZERO waterline: gradient walks stall on the
// shore profile's stepped plateaus, and an 8-dir 88m line probe found no
// sub-1.0 band either. Rather than guess a fifth walk, DUMP the drawn ground
// height on a lattice across the beaches and LOOK at where low ground exists.
// Reads groundAt (the carved/drawn terrain), the same function the placer uses.
// Run: node data/shorelattice.mjs   (dev server on 8933)
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const STEP = +(process.env.SG_STEP || 6);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=sentosa`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate((STEP) => {
  const g = (x, z) => window.__terrain.at(x, z);
  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  const sands = (window.__data.green || []).filter((s) => s.k === 'sand' && s.p && s.p.length >= 4);
  const res = [];
  for (const sand of sands) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const [x, z] of sand.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    // lattice over the ring's bbox PLUS 60m seaward margin in every direction:
    // the flags live at the water, which may be outside the mapped sand ring
    const pad = 60;
    const hist = {};       // height bucket -> count, inside the ring only
    const histOut = {};    // same, in the padded margin
    let lowIn = [], lowOut = [];
    let minIn = 1e9, minOut = 1e9;
    let nIn = 0, nOut = 0;
    for (let x = mnx - pad; x <= mxx + pad; x += STEP) {
      for (let z = mnz - pad; z <= mxz + pad; z += STEP) {
        const h = g(x, z);
        const inside = inRing(x, z, sand.p);
        const b = Math.floor(h * 2) / 2;   // 0.5m buckets
        if (inside) {
          nIn++; hist[b] = (hist[b] || 0) + 1;
          if (h < minIn) minIn = h;
          if (h < 1.0) lowIn.push([x | 0, z | 0, +h.toFixed(2)]);
        } else {
          nOut++; histOut[b] = (histOut[b] || 0) + 1;
          if (h < minOut) minOut = h;
          if (h < 1.0) lowOut.push([x | 0, z | 0, +h.toFixed(2)]);
        }
      }
    }
    res.push({
      n: sand.n || '-',
      bbox: [mnx | 0, mxx | 0, mnz | 0, mxz | 0],
      nIn, nOut,
      minIn: +minIn.toFixed(2), minOut: +minOut.toFixed(2),
      hist: Object.entries(hist).map(([k, v]) => [+k, v]).sort((a, b) => a[0] - b[0]).slice(0, 12),
      histOut: Object.entries(histOut).map(([k, v]) => [+k, v]).sort((a, b) => a[0] - b[0]).slice(0, 12),
      lowIn: lowIn.length, lowOut: lowOut.length,
      lowInEx: lowIn.slice(0, 8), lowOutEx: lowOut.slice(0, 8),
    });
  }
  // ALSO: what does the sea/coast layer itself say? the drawn world's water
  const seaInfo = [];
  window.__scene.traverse((o) => {
    if (/sea|water|coast/i.test(o.name || '') && o.geometry) {
      const bb = new window.__THREE.Box3().setFromObject(o);
      seaInfo.push({ name: o.name, y: +(bb.min.y.toFixed(2)) + '..' + bb.max.y.toFixed(2),
                     x: (bb.min.x | 0) + '..' + (bb.max.x | 0), z: (bb.min.z | 0) + '..' + (bb.max.z | 0) });
    }
  });
  return { res, seaInfo: seaInfo.slice(0, 10), seaLevel: window.__seaLevel };
}, STEP);

console.log('SEA LAYER:', JSON.stringify(out.seaInfo, null, 1), 'seaLevel=', out.seaLevel);
for (const r of out.res) {
  console.log(`\n=== ${r.n}  bbox x ${r.bbox[0]}..${r.bbox[1]}  z ${r.bbox[2]}..${r.bbox[3]}`);
  console.log(`  inside ring: ${r.nIn} samples, min h ${r.minIn}, sub-1.0: ${r.lowIn}`);
  console.log(`  hist in : ${r.hist.map(([k, v]) => k + ':' + v).join(' ')}`);
  console.log(`  margin  : ${r.nOut} samples, min h ${r.minOut}, sub-1.0: ${r.lowOut}`);
  console.log(`  hist out: ${r.histOut.map(([k, v]) => k + ':' + v).join(' ')}`);
  if (r.lowInEx.length) console.log(`  low IN  ex: ${r.lowInEx.map((p) => p.join('/')).join('  ')}`);
  if (r.lowOutEx.length) console.log(`  low OUT ex: ${r.lowOutEx.map((p) => p.join('/')).join('  ')}`);
}
await browser.close();
