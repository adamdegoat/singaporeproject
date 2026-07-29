#!/usr/bin/env node
// DOES THE DEPLOYED SITE ACTUALLY RUN, ON A PHONE?
//
// Every other gate in this project inspects a BUILT SCENE. None of them
// renders a frame and watches for an exception, and on 2026-07-29 that gap let
// a world ship that sat on "loading Orchard" forever on mobile: the traffic
// signal lenses threw from inside the render loop on every frame, so the world
// built fine, `__ready` went true, and the HUD was never repainted past its
// loading text. 40/40 checks on four scenes, behaviour, ride and defects were
// all green while the live site was unusable.
//
// So this asks the only question they cannot: load the URL people actually
// open, at the size they actually open it, and require that it becomes ready
// AND that nothing threw.
//
//     node data/livecheck.mjs                       # the deployed site
//     node data/livecheck.mjs http://localhost:8933 # before publishing
//
// Exits non-zero on a boot error, a timeout, or ANY page exception.
const URL_BASE = process.argv[2] || 'https://adamdegoat.github.io/singaporeproject';
const BUDGET_MS = +(process.env.SG_BOOT_BUDGET || 60000);

const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
// the reference platform: landscape phone at real pixel density, touch on
const ctx = await browser.newContext({
  viewport: { width: 844, height: 390 }, deviceScaleFactor: 2,
  isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push('exception: ' + String(e.message).slice(0, 200)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200));
});

const t0 = Date.now();
let ready = false, info = {};
try {
  await page.goto(`${URL_BASE}/?cb=${Date.now()}`, { waitUntil: 'load', timeout: BUDGET_MS });
  // POLL ON AN INTERVAL, not on requestAnimationFrame. waitForFunction defaults
  // to rAF polling and rAF is throttled in a spawned window, so the default
  // times the poller rather than the boot.
  await page.waitForFunction('window.__ready === true || window.__bootError',
    null, { timeout: BUDGET_MS, polling: 100 });
  info = await page.evaluate(() => ({
    ready: window.__ready === true,
    bootError: window.__bootError ? String(window.__bootError).slice(0, 300) : null,
    hud: (document.querySelector('#hud') || {}).textContent || '',
    mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
  }));
  // the loading overlay removes itself 600ms after ready; still standing
  // means the page is stuck behind it even though the world came up
  await page.waitForTimeout(1200);
  const bootLeft = await page.evaluate(() => !!document.getElementById('boot'));
  if (info.ready && bootLeft) errors.push('loading overlay still covering the page after ready');
  // The HUD was sampled AT the ready instant, before the loop had drawn a
  // single frame — on SwiftShader under load the first frame alone can take
  // seconds, which read as a dead loop and produced a flaky refusal. Give the
  // loop an honest window to prove itself: poll until the HUD text changes.
  if (info.ready && /loading/i.test(info.hud || '')) {
    try {
      await page.waitForFunction(
        () => !/loading/i.test((document.querySelector('#hud') || {}).textContent || ''),
        null, { timeout: 15000, polling: 250 });
      info.hud = await page.evaluate(() => (document.querySelector('#hud') || {}).textContent || '');
    } catch (e) { /* still loading after 15s: the assertion below fires */ }
  }
  ready = info.ready;
} catch (e) {
  errors.push('never became ready: ' + String(e.message).slice(0, 160));
}
const bootMs = Date.now() - t0;

// Let it run a moment. The failure this exists to catch happens in the FRAME
// LOOP, not during boot, so a check that stops the instant __ready flips would
// have sailed straight past it.
await page.waitForTimeout(2500);

console.log(`   live check   ${URL_BASE}`);
console.log(`   boot ${bootMs} ms   ready ${ready}   heap ${info.mem ?? '?'} MB`);
if (info.hud) console.log(`   hud "${info.hud.slice(0, 70)}"`);
if (info.bootError) console.log(`   boot error: ${info.bootError}`);

// The HUD still showing the loading text after ready is the exact signature of
// a render loop that died on its first frame.
if (ready && /loading/i.test(info.hud || '')) {
  errors.push('HUD still reads "loading" after __ready — the render loop is dead');
}

if (errors.length) {
  console.log('   FAIL  the deployed site does not run cleanly on a phone:');
  for (const e of errors.slice(0, 8)) console.log(`         ${e}`);
  await browser.close();
  process.exit(1);
}
console.log('   PASS  loads and runs, no exceptions');
await browser.close();
