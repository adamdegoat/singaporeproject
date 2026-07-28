#!/usr/bin/env node
// The "yellow patches" hunt, from the saddle instead of from the map. An
// eye-level camera is walked along the main axis; at each stop it photographs
// the view AND raycasts a grid through the lower half of the frame against the
// ground layers only (road / pavement / terrain), so every pale pixel gets a
// name: which mesh, which material, at what height, over which street.
//
// A full-map raycast sweep was tried first and is exactly what WORKFLOW.md
// says it is: minutes of pegged core for a sample. 6 cameras x ~600 rays is
// the same question asked only where an eye can actually be.
//
//     SG_SCENE=orchard node data/patchprobe.mjs
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.setDefaultTimeout(180000);
await page.goto(`http://localhost:8933/?raw=1&dpr=1&scene=${process.env.SG_SCENE || 'orchard'}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 180000 });
const err = await page.evaluate(() => window.__bootError || null);
if (err) { console.error('boot failed: ' + String(err).slice(0, 600)); await browser.close(); process.exit(2); }
await page.waitForTimeout(800);

// Six stops along the axis, both directions, eye height.
const stops = await page.evaluate(() => {
  const a = window.__axis;
  const pts = a.p, out = [];
  // arclength-parameterised stops at 1/6 .. 5/6
  let L = 0; const seg = [0];
  for (let i = 0; i < pts.length - 1; i++) {
    L += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(L);
  }
  const at = (s) => {
    for (let i = 0; i < seg.length - 1; i++) if (seg[i + 1] >= s) {
      const t = (s - seg[i]) / (seg[i + 1] - seg[i]);
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
      const z = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      const dx = pts[i + 1][0] - pts[i][0], dz = pts[i + 1][1] - pts[i][1];
      const dl = Math.hypot(dx, dz);
      return { x, z, tx: dx / dl, tz: dz / dl };
    }
    return null;
  };
  for (const f of [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6]) {
    const p = at(L * f);
    if (p) out.push(p);
  }
  return { stops: out, L };
});
console.log(`axis ${stops.L.toFixed(0)}m, ${stops.stops.length} stops`);

const report = [];
for (let si = 0; si < stops.stops.length; si++) {
  for (const dir of [1, -1]) {
    const s = stops.stops[si];
    const r = await page.evaluate(([s, dir]) => {
      const THREE = window.__THREE, scene = window.__scene, cam = window.__camera;
      const gy = window.__surfaceAt(s.x, s.z);
      const ex = s.x - s.tx * dir * 2, ez = s.z - s.tz * dir * 2;
      const ax = s.x + s.tx * dir * 60, az = s.z + s.tz * dir * 60;
      const ay = window.__surfaceAt(ax, az) + 1.2;
      cam.position.set(ex, gy + 1.65, ez);
      cam.lookAt(ax, ay, az);
      cam.fov = 55; cam.updateProjectionMatrix();
      cam.updateMatrixWorld(true);

      const targets = [];
      scene.traverse((m) => {
        if (m.isMesh && /^(roadSurface|pavementSurface|terrainSurface)$/.test(m.name)) targets.push(m);
      });
      const tag = (m) => m.name === 'roadSurface'
        ? `roadSurface#${m.material.color.getHexString()}` : m.name;
      const ray = new THREE.Raycaster();
      const found = {};
      let n = 0, asphalt = 0, none = 0;
      // lower 45% of the frame, 36 x 14 grid
      for (let iy = 0; iy < 14; iy++) for (let ix = 0; ix < 36; ix++) {
        const ndcX = -1 + 2 * (ix + 0.5) / 36;
        const ndcY = -1 + 0.9 * (iy + 0.5) / 14;   // -1 .. -0.1
        ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);
        const hits = ray.intersectObjects(targets, false);
        if (!hits.length) { none++; continue; }
        n++;
        const top = hits[0];
        const tt = tag(top.object);
        const onRoad = window.__onRoad(top.point.x, top.point.z, -0.2);
        if (!onRoad) continue;                      // pavement being pavement
        // MAT.asphalt sets no colour, so its tint is the default white; the
        // darkness is all in the texture map
        if (tt === 'roadSurface#ffffff') { asphalt++; continue; }
        const F = found[tt] || (found[tt] = { n: 0, ex: [] });
        F.n++;
        if (F.ex.length < 4) F.ex.push({
          x: +top.point.x.toFixed(1), z: +top.point.z.toFixed(1),
          y: +top.point.y.toFixed(3),
          street: window.__nearestStreet(top.point.x, top.point.z),
          under: hits.slice(1, 3).map(h => tag(h.object) + '@' + h.point.y.toFixed(3)),
        });
      }
      return { at: [ +s.x.toFixed(0), +s.z.toFixed(0) ], dir, n, asphalt, none, found,
               street: window.__nearestStreet(s.x, s.z) };
    }, [s, dir]);
    report.push(r);
    const shot = `shots/patch-${si}-${dir > 0 ? 'f' : 'b'}.png`;
    await page.screenshot({ path: shot });
    console.log(JSON.stringify(r));
  }
}
await browser.close();
