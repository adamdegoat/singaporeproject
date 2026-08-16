#!/usr/bin/env node
// D3 WHITE-PLANE PHANTOM — name the merge, not the material.
//
// The banked evidence (sweep-2026-08-16-priorities.md) says the wedge is a mesh
// named `roadSurface`, material colour ffffff, 256x256 map — and that tinting
// "the three roadSurface materials" at the site never coloured it. But there
// are FOUR merge() calls that emit `roadSurface` (city.js:5351-5356), so a
// fourth mesh was never in that test. This probe enumerates EVERY roadSurface
// mesh in the scene, prints what each one is (material name, colour, roughness,
// map size AND the map's own average pixel), then raycasts the two witnessed
// phantom points straight down and says WHICH enumerated mesh answered.
//
//     SG_SCENE=sentosa node data/whiteplane.mjs
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PTS = [[-517, 13059], [-871, 12867], [-2296, 12135]];

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.setDefaultTimeout(180000);
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?raw=1&dpr=1&scene=${process.env.SG_SCENE || 'sentosa'}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 180000 });
const err = await page.evaluate(() => window.__bootError || null);
if (err) { console.error('boot failed: ' + String(err).slice(0, 600)); await browser.close(); process.exit(2); }
await page.waitForTimeout(600);

const out = await page.evaluate((PTS) => {
  const THREE = window.__THREE, scene = window.__scene;
  const meshes = [];
  scene.traverse((m) => { if (m.isMesh && m.name === 'roadSurface') meshes.push(m); });

  // What does the map ACTUALLY look like? A white material over a pale map is
  // a pale surface; over a dark asphalt map it is asphalt. The rendered pixel
  // is the material colour TIMES the texel, so read the texel.
  const avgOf = (tex) => {
    try {
      const img = tex && tex.image; if (!img) return null;
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let r = 0, g = 0, b = 0; const n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    } catch (e) { return 'unreadable:' + e.message; }
  };

  const desc = meshes.map((m, i) => {
    const mat = m.material, bb = m.geometry.boundingBox
      || (m.geometry.computeBoundingBox(), m.geometry.boundingBox);
    const map = mat.map;
    return {
      i,
      matName: mat.name || '(unnamed)',
      color: mat.color.getHexString(),
      rough: mat.roughness,
      mapSize: map && map.image ? `${map.image.width}x${map.image.height}` : 'none',
      mapRepeat: map ? [map.repeat.x, map.repeat.y] : null,
      mapAvg: avgOf(map),
      verts: m.geometry.attributes.position.count,
      bbox: [bb.min.x, bb.min.z, bb.max.x, bb.max.z].map((v) => Math.round(v)),
    };
  });

  // Raycast each witnessed phantom point straight down against ONLY the
  // roadSurface meshes, and say which enumerated index answered.
  const ray = new THREE.Raycaster();
  const hits = PTS.map(([x, z]) => {
    ray.set(new THREE.Vector3(x, 400, z), new THREE.Vector3(0, -1, 0));
    ray.far = 900;
    const h = ray.intersectObjects(meshes, false);
    if (!h.length) return { x, z, hit: null };
    return {
      x, z,
      hit: h.map((k) => ({
        i: meshes.indexOf(k.object),
        y: +k.point.y.toFixed(2),
        uv: k.uv ? [+k.uv.x.toFixed(3), +k.uv.y.toFixed(3)] : null,
      })).slice(0, 4),
    };
  });

  return { count: meshes.length, desc, hits };
}, PTS);

console.log(`roadSurface meshes in scene: ${out.count}`);
for (const d of out.desc) {
  console.log(`  [${d.i}] mat=${d.matName} color=${d.color} rough=${d.rough} `
    + `map=${d.mapSize} repeat=${JSON.stringify(d.mapRepeat)} mapAvg=${JSON.stringify(d.mapAvg)} `
    + `verts=${d.verts} bbox=${JSON.stringify(d.bbox)}`);
}
console.log('');
for (const h of out.hits) {
  console.log(`  (${h.x},${h.z}) -> ${h.hit ? JSON.stringify(h.hit) : 'NO roadSurface HIT'}`);
}
await browser.close();
