// THE AVATAR SHEET — is the person on the board the same person on foot?
//
// The owner, 2026-08-04: "skating and walking different colour clothes like
// different person". He was right: the walker, the skater and the scooter
// rider were built in two files with three private palettes, so stepping off
// the board changed your shirt, your shoes and your hair. src/wardrobe.js is
// the single answer now, and this is the frame that proves it — the same
// figure shot from the same four angles in each mode, side by side.
//
// Run:  node data/avatar.mjs           -> shots/avatar/*.png
// The dev server on 8933 must be up.
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'shots', 'avatar');
const PORT = process.env.SG_PORT || 8933;
mkdirSync(OUT, { recursive: true });

// Open lawn beside the Sensoryscape avenue: flat ground, even light, nothing
// in the frame but the figure. A comparison shot taken in clutter compares
// the clutter.
const SPOT = [-1420, 12480, 0.6];
// eye offsets around the figure, in metres, and what each one is for
const ANGLES = [
  ['back', 0, 1.35, -2.6],     // what the player actually sees, every frame
  ['front', 0, 1.35, 2.6],     // the wardrobe read: shirt, legs, shoes
  ['side', 2.6, 1.35, 0],      // the silhouette
  ['high', 1.5, 3.0, -2.2],    // head and shoulders, where the hair/cap live
];

const browser = await chromium.launch({ headless: true, args: [
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
] });
// LANDSCAPE. A portrait viewport gets the "turn your phone sideways" gate and
// every frame comes back as that card — which is what the first run of this
// harness produced. A tight lens does the portrait framing instead.
const page = await browser.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { timeout: 300000, polling: 300 });
await page.evaluate(() => { window.__noArrive = true; });
await page.addStyleTag({ content:
  '#hud,#place,#map,#maphint,#big,#friendsbtn,#modebtn,#vehiclebtn,#stick,#lookhint,#nettoast{display:none!important}' });

// Where is the figure standing, in each mode? The rider state and the walker
// state are separate positions and the shot must aim at the one on screen.
// ...and which way are they FACING. The offsets below are relative to the
// figure, not to world north: shot in world axes, "front" came back as the
// back of the walker's head because the two modes hold their own heading.
const subject = () => page.evaluate(() => {
  const m = window.__mode();
  const w = window.__walker();
  const r = window.__ridePos();
  const st = window.__state();
  return m === 'walk' ? { m, x: w.x, z: w.z, h: w.h } : { m, x: r[0], z: r[1], h: st.h };
});

async function sheet(label) {
  const s = await subject();
  for (const [name, ox, oy, oz] of ANGLES) {
    await page.evaluate(({ s, ox, oy, oz }) => {
      const g = window.__terrain.at(s.x, s.z);
      // rotate the offset into the figure's own frame: +z is the way they face
      const fx = Math.sin(s.h), fz = Math.cos(s.h);
      const rx = Math.cos(s.h), rz = -Math.sin(s.h);
      // AIM AT THE WHOLE FIGURE, NOT AT ITS CHEST. This aimed at g + 0.95 with
      // a 26-degree lens, which frames a SKATER — he stands on a deck 16cm up
      // and the crop lands under his board. The WALKER stands on the ground, so
      // the same aim cut his head off in all four angles: the one sheet in this
      // repo whose whole job is "is the person on the board the same person on
      // foot" could not see one of the two faces. Found 2026-08-17, adding eyes.
      window.__cam(s.x + rx * ox + fx * oz, g + oy, s.z + rz * ox + fz * oz,
        s.x, g + 1.15, s.z, 32);
    }, { s, ox, oy, oz });
    await page.waitForTimeout(260);
    // page.screenshot, NOT locator('#c').screenshot() — Playwright's element
    // stability wait never settles on a canvas that repaints every frame, and
    // the call times out. golden.mjs learned this first; see the note there.
    const f = join(OUT, `${label}-${name}.png`);
    await page.screenshot({ path: f });
    console.log('  ' + f);
  }
}

await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), SPOT);
await page.waitForTimeout(500);

// ON THE BOARD first — skate is the default vehicle, so this is the figure
// that is on screen for most of the game.
if (await page.evaluate(() => window.__mode()) !== 'ride') await page.evaluate(() => window.__toggle());
await page.waitForTimeout(400);
console.log('skate:');
await sheet('skate');

// ON FOOT. Same person, ten seconds later.
await page.evaluate(() => window.__toggle());
await page.waitForTimeout(500);
console.log('walk:');
await sheet('walk');

await page.evaluate(() => window.__cam(null));
await browser.close();
console.log('\nshots/avatar/ — compare skate-* against walk-*, angle for angle.');
