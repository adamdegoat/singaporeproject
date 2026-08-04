// THE MAP IS THE TRAVEL INTERFACE NOW, so it gets a check.
//
// The old TELEPORT pill was replaced (owner, 2026-08-05) by tapping the map:
// pin -> card -> Go here. That is three pieces of wiring and a hit test, and a
// rendered map that LOOKS right proves none of it. This drives it with real
// touch events at the phone viewport and asserts the player actually moved.
//
//   node data/mapcheck.mjs
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;

const browser = await chromium.launch({ headless: true });
// the owner's phone: 844x390 landscape, touch forced
const page = await browser.newPage({ viewport: { width: 844, height: 390 },
  deviceScaleFactor: 2, hasTouch: true, isMobile: true });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });
await page.waitForTimeout(700);

let bad = 0;
const check = (ok, msg) => { if (!ok) bad++; console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

// THE PILL IS GONE. If it comes back, the map is no longer the only way to
// travel and the two will drift.
check(await page.evaluate(() => !document.getElementById('tpbtn')),
  'no district teleport pill');

await page.evaluate(() => window.__wayfinder.setOpen(true));
await page.waitForTimeout(700);

const pins = await page.evaluate(() => (window.__wayfinder._shown || []).length);
check(pins >= 8, `${pins} pins on screen at island zoom`);

// every pin the map shows must be tappable and must carry a real place name
const named = await page.evaluate(() => (window.__wayfinder._shown || [])
  .every((p) => p.n && p.n.trim().length > 1));
check(named, 'every pin carries a name');

// NO INVENTED COPY: a description, where present, must have come from the
// researched entrance lines rather than been written here.
const copy = await page.evaluate(() => {
  const w = window.__wayfinder;
  const ents = new Set((w.data.entrances || []).map((e) => (e.t || '').trim()).filter(Boolean));
  const withText = (w._pins || []).filter((p) => p.t);
  return { n: withText.length, allFromData: withText.every((p) => ents.has(p.t.trim())) };
});
check(copy.allFromData, `${copy.n} descriptions, all from the researched data`);

// TAP A PIN with a real touch, at its real screen position.
const target = await page.evaluate(() => {
  const w = window.__wayfinder;
  const p = (w._shown || []).find((q) => q.t) || (w._shown || [])[0];
  if (!p) return null;
  const r = w.bigMap.getBoundingClientRect();
  const dpr = w._proj.dpr;
  return { n: p.n, x: p.x, z: p.z, cx: r.left + p.px / dpr, cy: r.top + p.py / dpr };
});
check(!!target, 'found a pin to tap');

const before = await page.evaluate(() => window.__ridePos());
await page.touchscreen.tap(target.cx, target.cy);
// WAIT FOR THE CARD TO SETTLE, do not guess at it. The slide-in is a 180ms
// CSS transition and it measured over 700ms of wall clock while the world was
// still rendering behind the map; a fixed 400ms wait read the card at its
// PRE-transition position and every coordinate taken from it was ~150px low.
await page.waitForFunction(() => {
  const e = document.getElementById('mapcard');
  return e.classList.contains('on') && getComputedStyle(e).opacity === '1'
    && (!e.getAnimations || e.getAnimations().length === 0);
}, null, { timeout: 15000 });

const card = await page.evaluate(() => {
  const el = document.getElementById('mapcard');
  return { on: el.classList.contains('on'),
    name: document.getElementById('mapcardn').textContent,
    dist: document.getElementById('mapcardd').textContent };
});
check(card.on, 'tapping a pin opens the card');
check(card.name === target.n, `card names the place tapped (${card.name})`);
check(/\d+ m away/.test(card.dist), `card shows the distance (${card.dist})`);

// GO THERE. The button must be inside the viewport to be tappable at all —
// asserted, because an off-screen button renders perfectly and does nothing.
const goRect = await page.evaluate(() => {
  const r = document.getElementById('mapcardgo').getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, h: innerHeight };
});
check(goRect.bottom <= goRect.h && goRect.top >= 0,
  `the Go button is on screen (${goRect.top.toFixed(0)}..${goRect.bottom.toFixed(0)} of ${goRect.h})`);
const go = await page.evaluate(() => {
  const r = document.getElementById('mapcardgo').getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
});
await page.touchscreen.tap(go.cx, go.cy);
await page.waitForTimeout(1200);

const after = await page.evaluate(() => window.__ridePos());
const moved = Math.hypot(after[0] - before[0], after[1] - before[1]);
const landed = Math.hypot(after[0] - target.x, after[1] - target.z);
check(moved > 20, `the player moved (${moved.toFixed(0)} m from where they were)`);
check(landed < 30, `the player arrived at ${target.n} (${landed.toFixed(0)} m off)`);
check(await page.evaluate(() => !document.getElementById('big').classList.contains('on')),
  'the map closes after travelling');

// A TAP ON EMPTY SEA MUST NOT TELEPORT YOU INTO IT.
await page.evaluate(() => window.__wayfinder.setOpen(true));
await page.waitForTimeout(500);
await page.touchscreen.tap(60, 340);
await page.waitForTimeout(300);
check(await page.evaluate(() => !document.getElementById('mapcard').classList.contains('on')),
  'tapping empty water selects nothing');

await browser.close();
if (bad) { console.log(`  mapcheck FAIL (${bad})`); process.exit(1); }
console.log('  mapcheck ok');
