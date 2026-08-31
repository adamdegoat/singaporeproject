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
//
// A STATION'S OWN LINE IS NOT INVENTED COPY, AND THIS CHECK HAD BEEN RED SINCE
// THE CABLE CAR WENT IN. Found 2026-08-17: the five cable-car stations added on
// 2026-08-06 each carry the literal 'Cable-car station.', written in buildPins
// because a station has no entrance record to quote — and this check counted
// that as fabricated flavour text and failed, every run, for eleven days.
// Nobody had waved it off; nobody had read it either.
//
// The rule the check is actually FOR is that no attraction gets a sentence
// somebody made up about it. A station saying it is a station states its kind
// and claims nothing, so it is excluded structurally, by kind, rather than by
// listing the two strings — a third station type would otherwise turn this red
// again for the same non-reason.
const copy = await page.evaluate(() => {
  const w = window.__wayfinder;
  const ents = new Set((w.data.entrances || []).map((e) => (e.t || '').trim()).filter(Boolean));
  const withText = (w._pins || []).filter((p) => p.t && p.kind !== 'station');
  return { n: withText.length,
    bad: withText.filter((p) => !ents.has(p.t.trim())).map((p) => p.n) };
});
for (const n of copy.bad) console.log(`    invented copy on: ${n}`);
check(copy.bad.length === 0, `${copy.n} descriptions, all from the researched data`);

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

// EVERY DESTINATION, NOT THE ONE THAT HAPPENED TO BE TAPPED.
//
// The owner, 2026-08-17: "can just teleport to all the attractions or things
// that can play or interact ... now need everything in the teleport map". That
// took the list from ~40 places to ~95, and the new ones are mostly INSIDE
// Universal Studios and Adventure Cove — walled, courtyarded geometry, which is
// the exact shape that produced "i went to some teleport locations and I cant
// even move" the first time round. One sampled tap cannot see that.
//
// So: land at every pin the travel list offers and ask whether the player could
// walk away from it, using __landAudit — the app's OWN flood, not a copy of it.
const audit = await page.evaluate(() => {
  const w = window.__wayfinder;
  const pins = w._travelPins();
  const stuck = [];
  for (const p of pins) {
    const a = window.__landAudit(p.x, p.z);
    if (!a.open) stuck.push({ n: p.n, x: Math.round(p.x), z: Math.round(p.z) });
  }
  return { total: pins.length, stuck };
});
console.log(`  ${audit.total} destinations on the travel map`);
// The list is the FEATURE now: if a rule change quietly halves it, that is a
// regression even though every remaining pin still works.
check(audit.total >= 70, `the travel list offers ${audit.total} places`);
for (const s of audit.stuck) console.log(`    stranded: ${s.n} (${s.x},${s.z})`);
check(audit.stuck.length === 0,
  `every destination can be walked away from (${audit.stuck.length} stranded)`);

// TRAVEL MUST TAKE THE PERSON, NOT JUST THE BOARD.
//
// The owner, 2026-08-20: "Once i tele to tanjong beach i cannot teleport
// away." Every check above this line passed while that was true, because every
// one of them travelled IN THE SADDLE. `__teleport` set the ride state and
// never touched `walker`, so on foot the skateboard crossed the island alone
// and the player did not move a metre — and a beach is exactly where somebody
// gets off to walk about, which is why it surfaced at Tanjong.
//
// Both modes a player can be in when they open the map now get asked the only
// question that matters: DID YOU END UP THERE.
const modeTravel = await page.evaluate(async () => {
  const W = window.__wayfinder;
  const out = {};
  const dest = W._travelPins().find((p) => /siloso beach/i.test(p.n || '')) || W._travelPins()[0];
  const q = window.__landNear(dest.x, dest.z);

  // --- on foot
  if (window.__mode() !== 'walk') window.__toggleMode();
  await new Promise((r) => setTimeout(r, 600));
  out.modeBefore = window.__mode();
  window.__teleport(q.x, q.z, 0);
  await new Promise((r) => setTimeout(r, 900));
  let w = window.__walkState();
  out.walk = { off: Math.round(Math.hypot(w.x - q.x, w.z - q.z)), mode: window.__mode() };

  // --- sitting on a ride: travelling means getting off and going
  const rides = window.__rides ? window.__rides() : [];
  if (rides.length) {
    window.__board(0);
    await new Promise((r) => setTimeout(r, 1200));
    out.boarded = window.__mode();
    window.__teleport(q.x, q.z, 0);
    await new Promise((r) => setTimeout(r, 900));
    w = window.__walkState();
    out.onride = { off: Math.round(Math.hypot(w.x - q.x, w.z - q.z)), mode: window.__mode() };
  }
  return out;
});
check(modeTravel.walk && modeTravel.walk.off <= 3,
  `travelling ON FOOT moves the player (${modeTravel.walk ? modeTravel.walk.off : '?'} m off target)`);
if (modeTravel.onride) {
  check(modeTravel.onride.off <= 3,
    `travelling while ON A RIDE moves the player (${modeTravel.onride.off} m off target)`);
  check(modeTravel.onride.mode !== 'onride',
    `travelling while on a ride gets you off it (mode "${modeTravel.onride.mode}")`);
}

// THE RUNS MUST BE FINDABLE. Time Attack shipped with four arches and nothing
// anywhere naming them — "arches alone are silent" — so being ON the travel
// map is now part of the feature, not decoration. This also pins the flying
// start: the pin must NOT sit on the gate, because a run only begins above
// 2.5 m/s and travel arrives stationary, so a pin on the arch would hand the
// player a start line they cannot trigger.
const races = await page.evaluate(() => {
  const pins = window.__wayfinder._travelPins().filter((p) => p.race);
  const ta = (window.__ta && window.__ta.runs) || [];
  return pins.map((p) => {
    const r = ta.find((q) => q.label.toLowerCase().startsWith(p.n.split(' ')[0].toLowerCase()));
    return { n: p.n, t: p.t || '',
             fromGate: r ? Math.round(Math.hypot(p.x - r.gates[0].x, p.z - r.gates[0].z)) : -1 };
  });
});
check(races.length >= 4, `${races.length} time attack run(s) on the travel map`);
check(races.every((r) => /\d+ m along /.test(r.t)),
  'each run card states its length and the way it runs on');
check(races.every((r) => r.fromGate >= 8 && r.fromGate <= 40),
  'each run pin lands SHORT of its arch, not on it '
  + `(${races.map((r) => r.fromGate + 'm').join(', ')})`);

// A TAP ON EMPTY SEA MUST NOT TELEPORT YOU INTO IT.
await page.evaluate(() => window.__wayfinder.setOpen(true));
await page.waitForTimeout(500);
await page.touchscreen.tap(60, 340);
await page.waitForTimeout(300);
check(await page.evaluate(() => !document.getElementById('mapcard').classList.contains('on')),
  'tapping empty water selects nothing');

// AND THE WORLD MUST STOP DRAWING BEHIND IT, IN EVERY MODE.
//
// The map is an opaque full-screen canvas. The ride paths skip the world
// render while it is up — it is not only waste, it starved the place card's
// slide-in (50ms of CSS over 700ms of wall clock) and it cooks a phone while
// somebody reads the map. **The WALK branch did not**, and nothing noticed
// until the three render paths were audited on 2026-08-31: over 30 animation
// frames with the map open, riding rendered 0 and walking rendered 10.
//
// COUNT RENDERS, NOT DRAW CALLS. `info.render.calls` keeps whatever the last
// render left in it, so a frame that draws nothing reports the same number as
// one that draws everything — the first version of this measurement could not
// tell the two apart. `info.render.frame` increments once per render.
for (const mode of ['ride', 'walk']) {
  const r = await page.evaluate(async (m) => {
    if (window.__walkState().mode !== m) window.__toggleMode();
    await new Promise((s) => setTimeout(s, 700));
    document.body.classList.add('mapopen');
    await new Promise((s) => setTimeout(s, 500));
    const f0 = window.__renderer.info.render.frame;
    for (let k = 0; k < 30; k++) await new Promise((res) => requestAnimationFrame(res));
    const drawn = window.__renderer.info.render.frame - f0;
    document.body.classList.remove('mapopen');
    return { drawn, mode: window.__walkState().mode };
  }, mode);
  check(r.mode === mode && r.drawn === 0,
    `the world stops drawing behind an open map in ${mode} mode `
    + `(${r.drawn} renders over 30 frames)`);
}

await browser.close();
if (bad) { console.log(`  mapcheck FAIL (${bad})`); process.exit(1); }
console.log('  mapcheck ok');
