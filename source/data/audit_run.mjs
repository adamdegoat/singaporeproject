#!/usr/bin/env node
// Run the whole-district audit and fail if the district is not to standard.
//
//     node data/audit_run.mjs
//
// Exits non-zero on any BLOCKER above zero or any MAJOR over budget, so a
// district that has regressed cannot be published. Without this the same
// defect returns the next time somebody optimises something, which is exactly
// how the sky ended up black: a far-plane change made for performance quietly
// broke a dome nobody was checking.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { readFileSync } from 'fs';

const browser = await chromium.launch({
  args: [
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
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
page.setDefaultTimeout(120000);
// SG_EXTRA appends query flags (?nofoliage, ?noshops...) so a check's count can
// be attributed to one subsystem by building the world without it. Never used
// by deploy.sh: the gate always runs the whole world.
// THE THIRD CAP. add() in audit_world.js truncates every finding's examples
// to `window.__auditEx || 8` on the way out, so raising the two caps inside
// the checks changed nothing and a 114-finding failure still printed eight
// lines. Three caps sat between a failing check and its evidence.
await page.addInitScript((c) => { window.__auditEx = c; },
  +(process.env.SG_EX_CAP || 8));
// SG_XPARAMS appends URL params, so a pass can be run as an A/B of one flag
// and a moved defect count attributed instead of guessed at.
const XPARAMS = process.env.SG_XPARAMS ? '&' + process.env.SG_XPARAMS : '';
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?dpr=1&raw=1&streamall=1&scene=${process.env.SG_SCENE || 'sentosa'}${XPARAMS}`
  + (process.env.SG_EXTRA ? '&' + process.env.SG_EXTRA : ''), { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
const bootErr = await page.evaluate(() => window.__bootError || null);
if (bootErr) { console.error('boot failed: ' + String(bootErr).slice(0, 300)); await browser.close(); process.exit(2); }
// A streamed scene keeps building after __ready; auditing before the queue
// drains judges a half-built world (C8 read 60% the day this was learned).
await page.waitForFunction(
  '!window.__streamState || (window.__streamState.pending.length === 0 && !window.__streamState.building)',
  null, { timeout: +(process.env.SG_STREAM_BUDGET || 600000), polling: 500 });
await page.waitForTimeout(1500);
await page.addScriptTag({ content: readFileSync('data/audit_world.js', 'utf8') });
const r = await page.evaluate(() => window.__auditWorld());
await browser.close();

console.log('== world audit');
for (const f of r.findings) {
  const gated = f.budget !== null;
  const floor = (r.floors || []).includes(f.id);   // higher is better
  const ok = !gated || (floor ? f.count >= f.budget : f.count <= f.budget);
  console.log(`   ${gated ? (ok ? 'PASS' : 'FAIL') : ' -  '} ${f.id.padEnd(3)} `
    + `${String(f.count).padStart(5)}/${String(f.budget ?? '-').padStart(5)}  ${f.name}`);
  // FOUR EXAMPLES CANNOT CHARACTERISE A HUNDRED-FINDING FAILURE. Two caps
  // sat between a failing check and its own evidence — this one and
  // exW2's — so diagnosing sentosa's W2 meant rebuilding the check's
  // filters in a probe and getting them subtly wrong twice.
  const EXN = +(process.env.SG_EX_CAP || 4);
  // THE FOURTH CAP, and the one that hurt most: `if (!ok)`. An UNGATED check
  // (budget null) is always "ok", so a retired check that had found thirteen
  // named streets printed the number and not one name — the exact shape this
  // file's other three comments are about. Every C-family finding since the
  // family was retired had to be re-derived in a hand probe to learn what it
  // was pointing at. A finding with a nonzero count prints its evidence
  // whether or not anything is gating it.
  // THE FIFTH CAP: `f.detail` was NEVER PRINTED, by any path. Every check
  // builds a sentence explaining its own number and all of them went to the
  // JSON and nowhere a human looks. That matters most for a check that
  // reports ZERO because it EXEMPTED something -- C2 exempts the three
  // bridge-only streets that have no verge to stand a plate on, and without
  // this line the exemption is indistinguishable from the check simply
  // passing, which is how a silent exemption turns into a lie later.
  // Printed when the finding is worth reading: it failed, it counted
  // something, or it earned its zero by excusing something.
  if (f.detail && (!ok || f.count > 0 || /exempt/i.test(f.detail)))
    console.log(`        ${f.detail}`);
  if (!ok || f.count > 0) for (const e of f.examples.slice(0, EXN)) console.log(`        ${e}`);
}
console.log(r.pass
  ? `   PASS  ${r.findings.length} checks, no blockers, nothing over budget`
  : `   FAIL  ${r.blockers} blockers, ${r.majors} majors over budget`);
process.exit(r.pass ? 0 : 1);
