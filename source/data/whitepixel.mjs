#!/usr/bin/env node
// D3 WHITE-PLANE PHANTOM, second probe: an IDENTITY MAP of the frame.
//
// The first probe (data/whiteplane.mjs) settled that every `roadSurface` mesh
// on Sentosa belongs to one of three material families and that the phantom's
// ground coordinate answers with ASPHALT — a white material over a map whose
// average texel is (78,80,85). Dark map times white material is dark, so
// "material colour is ffffff" never identified anything: EVERY road here is
// white-over-a-map, and so are most surfaces in this renderer. That line of
// evidence is a dead end and this file exists so nobody walks it again.
//
// Reading the framebuffer back does not work either: the WebGL canvas has no
// preserveDrawingBuffer, so drawImage() of it into a 2d canvas yields a blank
// image and every "whitest pixel" search returns zero candidates. (It did.)
//
// So: raycast a grid over the WHOLE frame and print one character per cell,
// keyed to a legend of distinct meshes. The white plane is plainly visible in
// a screenshot; this says what occupies those cells.
//
//     SG_SCENE=sentosa node data/whitepixel.mjs [frameIndex...]
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const fs = await import('node:fs');

const sweep = JSON.parse(fs.readFileSync(new URL('../shots/sweep/sweep.json', import.meta.url)));
const rows = sweep.rows || sweep;
const FRAMES = (process.argv.slice(2).length ? process.argv.slice(2) : ['72', '71', '174'])
  .map(Number);

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
ctx.setDefaultTimeout(180000);
const page = await ctx.newPage();
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?dpr=1&touch=1&streamall=1&scene=${process.env.SG_SCENE || 'sentosa'}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 180000 });
const err = await page.evaluate(() => window.__bootError || null);
if (err) { console.error('boot failed: ' + String(err).slice(0, 600)); await browser.close(); process.exit(2); }
await page.waitForTimeout(2000);

for (const fi of FRAMES) {
  const s = rows[fi];
  if (!s) { console.log(`frame ${fi}: not in sweep.json`); continue; }
  console.log(`\n=== frame ${String(fi).padStart(3, '0')}  (${s.x.toFixed(0)},${s.z.toFixed(0)}) h=${s.heading.toFixed(2)}  ${s.street} ===`);
  await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), [s.x, s.z, s.heading]);
  await page.waitForTimeout(1400);

  const out = await page.evaluate(() => {
    const THREE = window.__THREE, scene = window.__scene, cam = window.__camera;
    const W = 56, H = 22;
    const ray = new THREE.Raycaster();
    cam.updateMatrixWorld(true);
    const legend = new Map();          // key -> {ch, n, sample}
    const CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const grid = [];
    for (let iy = 0; iy < H; iy++) {
      let line = '';
      for (let ix = 0; ix < W; ix++) {
        const ndcX = -1 + 2 * (ix + 0.5) / W;
        const ndcY = 1 - 2 * (iy + 0.5) / H;
        ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);
        const hits = ray.intersectObjects(scene.children, true)
          .filter((h) => h.object.visible && h.object.material
                      && h.object.material.visible !== false && h.object.type !== 'Sprite');
        if (!hits.length) { line += '.'; continue; }
        const o = hits[0].object, m = o.material;
        const key = `${o.name || '(anon)'} | mat=${m.name || '(unnamed)'} `
          + `col=${m.color ? m.color.getHexString() : '-'} `
          + `map=${m.map ? (m.map.image ? m.map.image.width + 'x' + m.map.image.height : 'yes') : 'NONE'} `
          + `vcol=${!!m.vertexColors} ${m.type}`;
        if (!legend.has(key)) {
          legend.set(key, {
            ch: CH[legend.size % CH.length], n: 0,
            pt: [Math.round(hits[0].point.x), Math.round(hits[0].point.y * 10) / 10, Math.round(hits[0].point.z)],
            dist: Math.round(hits[0].distance),
            parent: o.parent ? (o.parent.name || o.parent.type) : '-',
            verts: o.geometry && o.geometry.attributes.position
              ? o.geometry.attributes.position.count : -1,
          });
        }
        const e = legend.get(key); e.n++; line += e.ch;
      }
      grid.push(line);
    }
    return { grid, legend: [...legend.entries()].map(([k, v]) => ({ k, ...v })) };
  });

  for (const line of out.grid) console.log('  ' + line);
  console.log('  legend (by cell count):');
  for (const e of out.legend.slice().sort((a, b) => b.n - a.n)) {
    console.log(`   ${e.ch} ${String(e.n).padStart(4)}  ${e.k}`);
    console.log(`        first hit ${JSON.stringify(e.pt)} d=${e.dist}m parent=${e.parent} verts=${e.verts}`);
  }
}
await browser.close();
