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
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
page.setDefaultTimeout(120000);
await page.goto('http://localhost:8933/?dpr=1&raw=1', { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
const bootErr = await page.evaluate(() => window.__bootError || null);
if (bootErr) { console.error('boot failed: ' + String(bootErr).slice(0, 300)); await browser.close(); process.exit(2); }
await page.waitForTimeout(1500);
await page.addScriptTag({ content: readFileSync('data/audit_world.js', 'utf8') });
const r = await page.evaluate(() => window.__auditWorld());
await browser.close();

console.log('== world audit');
for (const f of r.findings) {
  const gated = f.budget !== null;
  // C4 and C7 are floors: more is better
  const floor = f.id === 'C4' || f.id === 'C7';
  const ok = !gated || (floor ? f.count >= f.budget : f.count <= f.budget);
  console.log(`   ${gated ? (ok ? 'PASS' : 'FAIL') : ' -  '} ${f.id.padEnd(3)} `
    + `${String(f.count).padStart(5)}/${String(f.budget ?? '-').padStart(5)}  ${f.name}`);
  if (!ok) for (const e of f.examples.slice(0, 4)) console.log(`        ${e}`);
}
console.log(r.pass
  ? `   PASS  ${r.findings.length} checks, no blockers, nothing over budget`
  : `   FAIL  ${r.blockers} blockers, ${r.majors} majors over budget`);
process.exit(r.pass ? 0 : 1);
