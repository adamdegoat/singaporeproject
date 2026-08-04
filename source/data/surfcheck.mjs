// DOES THE SURFACE MODEL FIRE IN THE REAL WORLD?
//
// test/ride.test.mjs asserts the physics in isolation. This asserts the part
// the unit tests cannot see: that surfaceKindAt() actually names the ground a
// player is standing on, across the real island. A perfect physics model fed
// 'road' everywhere is a physics model that does nothing.
//
//   node data/surfcheck.mjs
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;

// Places chosen because we KNOW what they are: the beach is sand, the golf
// course is grass, Siloso Beach Walk is a carriageway, the boardwalk is timber.
const SPOTS = [
  ['Siloso Beach sand',      -2380, 12290, 'sand'],
  ['Palawan Beach sand',     -1520, 12960, 'sand'],
  ['Siloso Beach Walk',      -2231, 12610, null],
  ['Sentosa Gateway',        -1050, 11700, 'road'],
  ['Serapong golf',            300, 12900, null],   // wooded there; greenAt picks the smallest ring
  ['Imbiah forest',          -2070, 12300, null],
  ['Sensoryscape avenue',    -1420, 12480, null],
  ['Beach Arrival Plaza',    -1616, 12694, null],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { timeout: 300000, polling: 300 });
await page.evaluate(() => { window.__noArrive = true; });

// WHERE THE GAME ACTUALLY STARTS YOU, read before anything teleports. You
// land here every session, so if the classifier calls it slow ground the game
// opens with the board at half speed before the player has touched anything.
// The golden frame named 'spawn' is a CAMERA viewpoint, not the spawn — using
// its coordinates here asserted the wrong thing (it is a lawn, correctly).
let bad = 0;
{
  await page.waitForTimeout(1400);
  const at = await page.evaluate(() => window.__ridePos());
  const s0 = await page.evaluate(() => window.__surface());
  const ok = s0.kind === 'road' || s0.kind === 'paved';
  if (!ok) bad++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${'THE REAL SPAWN'.padEnd(22)} ${s0.kind.padEnd(7)}`
    + `at (${at[0].toFixed(0)},${at[1].toFixed(0)})` + (ok ? '' : '  expected road or paved'));
}
const seen = {};
for (const [name, x, z, expect] of SPOTS) {
  await page.evaluate(([a, b]) => window.__teleport(a, b, 0), [x, z]);
  // the profile BLENDS over ~0.28s (see surfaceNow) — a short wait reads a
  // half-transitioned profile and every number looks wrong
  await page.waitForTimeout(1400);
  const s = await page.evaluate(() => window.__surface());
  seen[s.kind] = (seen[s.kind] || 0) + 1;
  const ok = !expect || s.kind === expect;
  if (!ok) bad++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${s.kind.padEnd(7)}`
    + `vMax x${s.vMax.toFixed(2)} coast x${s.coast.toFixed(2)} pump x${s.pump.toFixed(2)}`
    + (expect && !ok ? `  expected ${expect}` : ''));
}

// AND THE ISLAND IS NOT ALL ONE THING. A classifier that answers 'grass'
// everywhere would pass every spot check above that expects grass.
const spread = await page.evaluate(() => {
  const out = {};
  for (let x = -3000; x <= 1400; x += 60) {
    for (let z = 11600; z <= 13800; z += 60) {
      const k = window.__surfaceKindAt ? window.__surfaceKindAt(x, z) : null;
      if (k) out[k] = (out[k] || 0) + 1;
    }
  }
  return out;
});
console.log('  island spread: ' + JSON.stringify(spread));
console.log('  spot kinds:    ' + JSON.stringify(seen));
await browser.close();
if (bad) { console.log(`  surfcheck FAIL (${bad})`); process.exit(1); }
console.log('  surfcheck ok');
