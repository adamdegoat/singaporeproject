// THE GAME MUST SURVIVE BLOCKED SITE DATA.
//
// On iOS private browsing -- and anywhere the user has blocked site data --
// `localStorage.getItem` THROWS a QuotaExceededError rather than returning
// null. On 2026-08-26 one unguarded read in `timeattack.js` sat inside the
// run-BUILDING loop, so the first course threw, the loop aborted, and **the
// entire time-attack layer did not exist**: no arches, no clock, no ghosts,
// no checkpoints, and NOT ONE console error. The island looked completely
// normal. That is the failure mode this gate exists for.
//
// HOW IT ASSERTS, AND WHY THAT MATTERS. The first version of this test
// checked "did it boot, were there errors" and reported a clean pass on the
// broken build -- because the failure was the ABSENCE of something, and
// absence produces no error. "No errors" is not "it works". This asserts on a
// POSITIVE signal (the four courses announce themselves on the console) and
// runs the same harness with storage WORKING as a control, so a signal that
// stops appearing for an unrelated reason fails honestly instead of looking
// like a storage bug.
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';

const run = async (blockStorage) => {
  const browser = await chromium.launch({ args: ['--use-gl=angle'] });
  const ctx = await browser.newContext({
    viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  const errors = [], courses = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') errors.push(t.slice(0, 160));
    if (t.includes('timeattack:') && t.includes('RUN on')) courses.push(t.slice(0, 90));
  });
  if (blockStorage) {
    await page.addInitScript(() => {
      const boom = () => { throw new DOMException('quota', 'QuotaExceededError'); };
      const fake = { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom };
      try {
        Object.defineProperty(window, 'localStorage', { get: () => fake, configurable: true });
        Object.defineProperty(window, 'sessionStorage', { get: () => fake, configurable: true });
      } catch (e) { /* nothing to do; the assert below catches it */ }
    });
  }
  await page.goto(`http://localhost:${PORT}/?scene=${SCENE}`, { waitUntil: 'load' });
  let ready = true;
  try { await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 }); }
  catch (e) { ready = false; }
  // prove the override actually took, or the whole test is meaningless
  const throws = blockStorage ? await page.evaluate(() => {
    try { localStorage.getItem('x'); return false; } catch (e) { return true; }
  }) : null;
  await browser.close();
  return { ready, courses: courses.length, errors, throws };
};

console.log('   blocked site data   iOS private browsing, localStorage throws');
const ctrl = await run(false);
console.log(`     control    ready=${ctrl.ready} courses=${ctrl.courses} errors=${ctrl.errors.length}`);
const blocked = await run(true);
console.log(`     blocked    ready=${blocked.ready} courses=${blocked.courses} errors=${blocked.errors.length} (storage really throws: ${blocked.throws})`);

const problems = [];
if (!ctrl.ready) problems.push('control build did not become ready');
if (!ctrl.courses) problems.push('control built NO time-attack courses — the signal this gate reads is gone, fix the gate');
if (blocked.throws === false) problems.push('the localStorage override did not apply — test proves nothing');
if (!blocked.ready) problems.push('did not boot with site data blocked');
if (blocked.courses < ctrl.courses) problems.push(`${ctrl.courses - blocked.courses} time-attack course(s) vanished with site data blocked`);
if (blocked.errors.length) problems.push(`${blocked.errors.length} console error(s) with site data blocked: ${blocked.errors[0]}`);

console.log(`   STORAGE ${JSON.stringify({ control: ctrl.courses, blocked: blocked.courses })}`);
console.log(problems.length
  ? `   FAIL  ${problems.join(' · ')}`
  : `   PASS  boots and builds all ${blocked.courses} courses with site data blocked`);
process.exit(problems.length ? 1 : 0);
