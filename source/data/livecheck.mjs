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
  args: [
    // so the heap can be measured after a collection rather than before one —
    // see the note at the info evaluate below
    '--js-flags=--expose-gc',
    // --use-gl=angle IS THE REAL GPU HERE, and its absence is why this file was
    // the slowest thing in the project. Measured 2026-07-30 by reading
    // UNMASKED_RENDERER_WEBGL under five flag sets on this machine:
    //   --use-gl=angle      -> ANGLE Metal Renderer: Intel Iris Plus 645
    //   --use-angle=metal   -> ANGLE Metal Renderer: Intel Iris Plus 645
    //   --use-gl=egl        -> SwiftShader
    //   (no flags)          -> SwiftShader
    // behaviour.mjs and defects.mjs already passed it; audit_run and livecheck
    // did not, so the eight scene audits every deploy runs — the dominant cost
    // of shipping anything — were software-rasterising a world the machine can
    // draw in hardware. The audits gate on SCENE FACTS (draw calls, triangles,
    // positions), never on frame rate, so the renderer cannot change a single
    // number; only how long it takes to get them. Verified by diffing a full
    // district audit before and after.
    '--use-gl=angle',
    '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
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
  // streamall: by default districts build by rider proximity and the far
  // ones legitimately never load — the check builds EVERYTHING so the drain
  // assertion and the frame loop cover the whole world
  // THIS NOW LOADS WHAT A PLAYER LOADS, AND THAT IS WHY THE GATE USED TO FLAP.
  //
  // It used to fetch `?streamall=1`, the LEGACY ALL-DISTRICTS path from before
  // the 2026-08-03 pivot to one island. That world STREAMS districts in
  // progressively, so the heap at sample time depended on how many had arrived
  // — measured on one unchanged build, three runs read 307, 347 and 415 MB.
  // The gate refused two deploys at random on that spread, including one whose
  // entire content was a de-duplication of the travel list.
  //
  // Forcing a collection (below) removed one source of noise and could never
  // have removed this one: the variance was a genuinely different amount of
  // world being loaded each time, not garbage.
  //
  // A player gets ONE district and a phone gets the phone branch, so that is
  // what is asked for here. Deterministic, and it is the thing the failure line
  // has always claimed to be checking.
  await page.goto(`${URL_BASE}/?district=sentosa&nostream&touch=1&cb=${Date.now()}`, { waitUntil: 'load', timeout: BUDGET_MS });
  // POLL ON AN INTERVAL, not on requestAnimationFrame. waitForFunction defaults
  // to rAF polling and rAF is throttled in a spawned window, so the default
  // times the poller rather than the boot.
  await page.waitForFunction('window.__ready === true || window.__bootError',
    null, { timeout: BUDGET_MS, polling: 100 });
  // HEAP, MEASURED AFTER A COLLECTION, BECAUSE THE RAW NUMBER IS BIMODAL.
  //
  // This read usedJSHeapSize the instant the world came up, which counts
  // everything the collector has not got to yet — and on this build that is a
  // coin flip between 307 MB and 391 MB with NOTHING CHANGED in the world.
  // Measured 2026-08-06: the gate refused a deploy whose only content was a
  // de-duplication of the travel list, at 391MB, while the settled heap sat at
  // 218MB before and after. It had already refused a deploy the same way once
  // before. A gate that fails at random is a gate people learn to ignore.
  //
  // --expose-gc (in the launch args above) lets us ask for a collection first,
  // so this measures LIVE memory. Three reads, take the lowest: consecutive
  // settled reads agree exactly, so a high one means the collection had not
  // finished. If the flag is ever missing the raw value is used and says so,
  // rather than silently reporting a different quantity than the budget means.
  info = await page.evaluate(async () => {
    let mem = null, settled = false;
    if (performance.memory) {
      if (window.gc) {
        const reads = [];
        for (let i = 0; i < 3; i++) {
          window.gc(); window.gc();
          await new Promise((r) => setTimeout(r, 500));
          reads.push(performance.memory.usedJSHeapSize);
        }
        mem = Math.round(Math.min(...reads) / 1048576);
        settled = true;
      } else {
        mem = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }
    }
    return {
      ready: window.__ready === true,
      bootError: window.__bootError ? String(window.__bootError).slice(0, 300) : null,
      hud: (document.querySelector('#hud') || {}).textContent || '',
      mem, memSettled: settled,
    };
  });
  // the loading overlay removes itself 600ms after ready; still standing
  // means the page is stuck behind it even though the world came up
  await page.waitForTimeout(1200);

  // WAIT FOR STREAMING TO SETTLE BEFORE BELIEVING THE TRIANGLE COUNT.
  //
  // `__ready` means the BOOT district is up. The streamer keeps building
  // neighbouring chunks for many seconds after that, and the HUD sampled at
  // ready reported 1,849k triangles when the settled figure on the very same
  // build was 2,593k. Every deploy log this project has ever printed has
  // understated its own world by about 700k, which is exactly the number
  // anyone would reach for when asking whether it still fits on a phone.
  //
  // Settle on the count itself rather than on a fixed sleep: same trick as
  // streetshot.mjs, and it stops as soon as the world stops growing.
  await page.waitForFunction(() => {
    const t = ((document.querySelector('#hud') || {}).textContent || '')
      .match(/(\d+)k tris/);
    const n = t ? +t[1] : -1;
    const prev = window.__triPrev;
    window.__triPrev = n;
    window.__triHits = (n >= 0 && prev === n) ? (window.__triHits || 0) + 1 : 0;
    return window.__triHits >= 4;
  }, null, { polling: 700, timeout: 45000 }).catch(() => {});
  info.hud = await page.evaluate(() =>
    (document.querySelector('#hud') || {}).textContent || '');
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
  // streamed scenes keep building after ready; a healthy stream must DRAIN.
  // 120s covers a phone-slow machine; the flat path has no __streamState and
  // skips this entirely.
  if (info.ready) {
    const streaming = await page.evaluate(() => !!window.__streamState);
    if (streaming) {
      await page.waitForFunction(
        'window.__streamState.pending.length === 0 && !window.__streamState.building',
        null, { timeout: +(process.env.SG_STREAM_BUDGET || 600000), polling: 500 });
      const st = await page.evaluate(() => window.__streamState.done.join(','));
      console.log(`   streamed in: ${st}`);
    }
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
console.log(`   boot ${bootMs} ms   ready ${ready}   heap ${info.mem ?? '?'} MB`
  + (info.memSettled ? ' (settled)' : ' (NOT settled — --expose-gc missing)'));
if (info.hud) console.log(`   hud "${info.hud.slice(0, 70)}"`);
if (info.bootError) console.log(`   boot error: ${info.bootError}`);

// The HUD still showing the loading text after ready is the exact signature of
// a render loop that died on its first frame.
if (ready && /loading/i.test(info.hud || '')) {
  errors.push('HUD still reads "loading" after __ready — the render loop is dead');
}

// PERF BUDGETS, ASSERTED — F1-F4 were declared BLOCKER in SENTOSA.md and had
// never run anywhere (the workflow audit's finding #4). fps is deliberately
// NOT here: this browser is throttled behind a terminal and its frame rate is
// meaningless (it read 5fps at Ocean Drive where the phone reads 60). What IS
// meaningful in this environment and cannot drift silently: boot wall-clock,
// JS heap, and the settled triangle/draw counts. Budgets live in
// data/perfbudget.json, committed — raising one is a diff someone reviews,
// never a drift. Values sized off 260804 measurements with honest headroom:
// boot ~12-15s here, heap 326MB, 1282k tris, 494 draws.
try {
  const { readFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const here = dirname(fileURLToPath(import.meta.url));
  const budget = JSON.parse(readFileSync(join(here, 'perfbudget.json'), 'utf8'));
  const tris = +((info.hud || '').match(/(\d+)k tris/) || [])[1] || null;
  const draws = +((info.hud || '').match(/(\d+) draws/) || [])[1] || null;
  const perf = { bootMs, heapMB: info.mem, trisK: tris, draws };
  console.log(`   PERF ${JSON.stringify(perf)}`);        // parsed by data/ledger.py
  const over = [];
  if (bootMs > budget.bootMs) over.push(`boot ${bootMs}ms > ${budget.bootMs}`);
  if (info.mem !== null && info.mem > budget.heapMB) over.push(`heap ${info.mem}MB > ${budget.heapMB}`);
  if (tris !== null && tris > budget.trisK) over.push(`tris ${tris}k > ${budget.trisK}k`);
  if (draws !== null && draws > budget.draws) over.push(`draws ${draws} > ${budget.draws}`);
  if (over.length) errors.push('over perf budget (data/perfbudget.json): ' + over.join('; '));
  else console.log('   PASS  perf within budget');
} catch (e) {
  console.log(`   perf budget skipped: ${String(e.message).slice(0, 80)}`);
}

if (errors.length) {
  console.log('   FAIL  the deployed site does not run cleanly on a phone:');
  for (const e of errors.slice(0, 8)) console.log(`         ${e}`);
  await browser.close();
  process.exit(1);
}
console.log('   PASS  loads and runs, no exceptions');
await browser.close();
