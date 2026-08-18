#!/usr/bin/env node
// WHY IS THE SAND GREEN? — the owner, 2026-08-18, and this is the third time
// he has reported it.
//
//     SG_SCENE=sentosa node data/sandcolour.mjs
//
// groundtruth.mjs already counts green ON the beach and answers "5 of 733 on
// Siloso", which is a clean bill of health for a beach he can see is olive.
// When a check disagrees with the render, suspect the check: groundtruth asks
// whether a sample is GREEN, a yes/no against a threshold, and a beach that is
// uniformly a bit green passes every one of those tests while looking wrong.
//
// So this measures the thing the eye actually reports: the COLOUR of the drawn
// sand, vertex by vertex, against the tint the sand is supposed to be. It
// reads the ground mesh's own colour attribute inside the named beach rings,
// which is the number the renderer starts from, and reports the distribution
// rather than a pass.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
         '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
page.setDefaultTimeout(180000);
const SCENE = process.env.SG_SCENE || 'sentosa';
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?dpr=1&scene=${SCENE}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 180000 });
await page.waitForTimeout(1200);

const rows = await page.evaluate(async (scene) => {
  const data = await (await fetch(`data/${scene}.json`)).json();
  const beaches = (data.green || []).filter((g) => /beach/i.test(g.n || '') && g.p && g.p.length > 2);
  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  // every ground mesh that carries per-vertex colour
  const meshes = [];
  window.__scene.traverse((o) => {
    if (o.isMesh && o.geometry && o.geometry.attributes &&
        o.geometry.attributes.color && o.geometry.attributes.position) meshes.push(o);
  });
  const out = [];
  for (const b of beaches) {
    const acc = [];
    for (const m of meshes) {
      const P = m.geometry.attributes.position, C = m.geometry.attributes.color;
      for (let i = 0; i < P.count; i++) {
        const x = P.getX(i) + m.position.x, z = P.getZ(i) + m.position.z;
        if (!inRing(x, z, b.p)) continue;
        acc.push([C.getX(i), C.getY(i), C.getZ(i)]);
      }
    }
    if (!acc.length) { out.push({ n: b.n, n_verts: 0 }); continue; }
    // GREENNESS IS G ABOVE THE MEAN OF R AND B. A cream sand has G between R
    // and B and this number is near zero; lawn has it strongly positive. It is
    // a continuous measure, which is the point -- the yes/no test is what let
    // a uniformly olive beach pass.
    const gr = acc.map(([r, g, bl]) => g - (r + bl) / 2).sort((p, q) => p - q);
    const q = (f) => gr[Math.min(gr.length - 1, Math.floor(f * gr.length))];
    const mean = (k) => acc.reduce((s, c) => s + c[k], 0) / acc.length;
    out.push({
      n: b.n, n_verts: acc.length,
      mean_rgb: [mean(0), mean(1), mean(2)].map((v) => +v.toFixed(3)),
      green_p50: +q(0.5).toFixed(4), green_p90: +q(0.9).toFixed(4), green_max: +gr[gr.length - 1].toFixed(4),
      frac_over_02: +(gr.filter((v) => v > 0.02).length / gr.length).toFixed(3),
    });
  }
  return out;
}, SCENE);

console.log('sand vertex colour, per named beach ring');
console.log('  green = G - (R+B)/2 ; TINT.sand itself is the reference below\n');
for (const r of rows) console.log(' ', JSON.stringify(r));
await browser.close();
