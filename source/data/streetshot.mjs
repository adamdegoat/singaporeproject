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
  // ONE POINT ON EACH DISTRICT'S MAIN STREET, taken from the middle of its own
  // axis in its own scene file. `node data/streetshot.mjs all` is the fastest
  // honest answer to "what does each district actually look like from the
  // seat right now", which beats working from a triage list written two
  // sessions ago.
  all: [
    { id: '1-orchard', x: 315, z: 7075, h: 1.06 },
    { id: '2-brasbasah', x: 1976, z: 7736, h: 0.89 },
    { id: '3-marinabay', x: 3078, z: 8534, h: 0.05 },
    { id: '4-chinatown', x: 1364, z: 9280, h: -0.54 },
    { id: '5-rivervalley', x: 66, z: 7798, h: 1.43 },
    { id: '6-bugis', x: 2152, z: 7715, h: 2.46 },
    { id: '7-robertson', x: -805, z: 8140, h: 2.21 },
    { id: '8-littleindia', x: 2261, z: 6336, h: 2.56 },
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
  // WAIT FOR THE ROAD TO EXIST, not for the streamer to be idle. `!st.building`
  // is true both when nothing is building AND when nothing has STARTED, so this
  // shot Victoria Street before bugis had loaded and produced a frame of bare
  // terrain with no tarmac — which looks exactly like a catastrophic world bug
  // and is not one. Same mistake as the crown vantages waiting on a ray that
  // hit the terrain. Ask the question you actually mean: is the carriageway
  // drawn under the camera?
  await page.waitForFunction((sp) => {
    const st = window.__streamState;
    if (st && st.building) return false;
    // Not by mesh name — consolidate() merges the district's meshes and the
    // names do not survive it (the audit only sees them because it loads
    // ?raw=1). The district RECORD is the honest signal: every chunk whose
    // content box contains this point must have been built.
    const recs = window.__streamRecs || [];
    const covering = recs.filter((r) => {
      const b2 = r.box;
      return b2 && b2.length === 4
        && sp.x >= b2[0] && sp.x <= b2[2] && sp.z >= b2[1] && sp.z <= b2[3];
    });
    return covering.every((r) => !!r.group);
  }, s, { polling: 700, timeout: 300000 });
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
