// WHAT IS THAT — point a ray from an eye toward a subject and name every mesh
// it passes through, with material colour/map. For "there is a giant blank
// wall in my frame and I do not know what built it".
// Run: SG_SCENE=sentosa node data/whatisthat.mjs 900,13300,5 750,13400,15
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const args = process.argv.slice(2);
const [ex, ez, ey] = args[0].split(',').map(Number);
const [ax, az, ay] = args[1].split(',').map(Number);

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(({ ex, ez, ey, ax, az, ay }) => {
  const T = window.__THREE;
  const g = (x, z) => window.__terrain.at(x, z);
  const eye = new T.Vector3(ex, g(ex, ez) + ey, ez);
  const at = new T.Vector3(ax, g(ax, az) + ay, az);
  const base = at.clone().sub(eye).normalize();
  // FAN across the frame: a blank mass filling one side is not on the centre
  // ray, which is how the first version of this probe reported "nothing there"
  const hits = [];
  for (let yaw = -0.5; yaw <= 0.5001; yaw += 0.1) {
    for (const pitch of [-0.12, 0, 0.12, 0.25]) {
      const d = base.clone().applyAxisAngle(new T.Vector3(0, 1, 0), yaw);
      d.y += pitch; d.normalize();
      const r = new T.Raycaster(eye, d, 0.1, 900);
      for (const h of r.intersectObjects(window.__scene.children, true).slice(0, 3)) {
        h.__yaw = yaw.toFixed(1); h.__pitch = pitch;
        hits.push(h);
      }
    }
  }
  hits.sort((a, b) => a.distance - b.distance);
  const seen = [];
  const key = new Set();
  for (const h of hits) {
    const k = (h.object.name || h.object.id) + '|' + (h.distance | 0);
    if (key.has(k)) continue;
    key.add(k);
    if (seen.length >= 25) break;
    const o = h.object;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    seen.push({
      d: +h.distance.toFixed(1),
      name: o.name || '(unnamed)',
      parent: (o.parent && o.parent.name) || '-',
      type: o.type,
      mat: m ? (m.type + ' #' + (m.color ? m.color.getHexString() : '?') + (m.map ? ' MAP' : ' no-map')) : '-',
      ud: JSON.stringify(o.userData || {}).slice(0, 90),
      y: +h.point.y.toFixed(1),
      verts: o.geometry && o.geometry.attributes.position ? o.geometry.attributes.position.count : 0,
      yaw: h.__yaw, pitch: h.__pitch,
    });
  }
  return { eyeY: +eye.y.toFixed(1), seen };
}, { ex, ez, ey, ax, az, ay });

console.log('eye y', out.eyeY);
for (const s of out.seen) {
  console.log(`  ${String(s.d).padStart(6)}m  y=${String(s.y).padStart(6)}  ${s.name.padEnd(20)} parent=${s.parent.padEnd(16)} ${s.mat.padEnd(38)} v=${s.verts} yaw=${s.yaw} ${s.ud}`);
}
await browser.close();
