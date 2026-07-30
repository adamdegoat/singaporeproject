#!/usr/bin/env node
// Rider's-eye frames at named spots.
//
//     node data/streetshot.mjs canyon
//     node data/streetshot.mjs 1948,9113,0 2100,9200,1.6
//
// The sweep visits every street and is slow and headed; the comparison sheet
// places cameras from the Orchard axis. Neither is any use for "go and look at
// THAT corner", which is what most vets actually need, so this does only that:
// teleport, settle, shoot, from the seat height a rider actually occupies.
//
// Passing `--use-gl=angle` because that is the real GPU on this machine and
// its absence is what made every headless tool here slow (see WORKFLOW.md).
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync } from 'fs';

const OUT = 'shots/street';
mkdirSync(OUT, { recursive: true });
const SCENE = process.env.SG_SCENE || 'world';
const TAG = process.env.SG_TAG || 'now';

// Named sets, so a vet can be repeated exactly rather than re-typed from memory.
const SETS = {
  // Raffles Place and the streets around it: the deepest canyons in the world,
  // and where the road surface was reported as a navy-vs-grey patchwork.
  canyon: [
    { id: 'raffles-place', x: 1948, z: 9113, h: 0.0 },
    { id: 'collyer-quay', x: 2180, z: 9010, h: 2.4 },
    { id: 'church-st', x: 1900, z: 9180, h: 1.6 },
    { id: 'cecil-st', x: 1980, z: 9330, h: 3.1 },
  ],
  // ON THE AXIS, taken from orchard.json rather than typed from memory — the
  // first pair of these were guessed and put the camera inside a wall, which
  // photographs a facade texture and looks exactly like a rendering bug.
  orchard: [
    { id: 'orchard-west', x: -116, z: 6842, h: 1.06 },
    { id: 'orchard-mid', x: 462, z: 7156, h: 1.06 },
    { id: 'orchard-east', x: 1185, z: 7406, h: 1.25 },
  ],
};

const args = process.argv.slice(2);
const spots = (SETS[args[0]] || null)
  || args.map((a, i) => {
    const [x, z, h] = a.split(',').map(Number);
    return { id: 'spot' + (i + 1), x, z, h: h || 0 };
  });
if (!spots.length) { console.error('usage: streetshot.mjs <set|x,z,heading ...>'); process.exit(1); }

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 800 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:8933/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { polling: 300, timeout: 300000 });
await page.evaluate(() => window.__ui(false));

for (const s of spots) {
  await page.evaluate((sp) => window.__teleport(sp.x, sp.z, sp.h), s);
  // WAIT FOR WHAT YOU CAME TO SEE. The world streams around the ride, so the
  // first second after a teleport is a district that has not been built yet —
  // and a frame of that is a photograph of nothing, which has already been
  // mistaken for a defect once today.
  await page.waitForFunction(
    () => { const st = window.__streamState; return !st || !st.building; },
    null, { polling: 500, timeout: 300000 });
  await page.waitForTimeout(2500);
  const info = await page.evaluate((sp) => {
    // rider's seat: 1.4m, looking along the heading, slightly down the street
    const g = window.__surfaceAt(sp.x, sp.z);
    const fx = Math.sin(sp.h), fz = Math.cos(sp.h);
    window.__cam(sp.x - fx * 2.2, g + 1.55, sp.z - fz * 2.2,
      sp.x + fx * 60, g + 6, sp.z + fz * 60, 62);
    return { ground: +g.toFixed(1), street: window.__nearestStreet
      ? window.__nearestStreet(sp.x, sp.z) : null };
  }, s);
  await page.waitForTimeout(400);
  const file = `${OUT}/${TAG}.${s.id}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
  console.log(`  ${file}   ground ${info.ground}m  ${info.street || ''}`);
}

await browser.close();
