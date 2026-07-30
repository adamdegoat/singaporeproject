#!/usr/bin/env node
// THE DETERMINISM GATE for the streaming design (WORKFLOW.md): a district
// built after arbitrary prior stream consumption must equal the district
// built clean, once ?reseed pins the placement stream. Two loads:
//   A: ?scene=<id>&reseed          B: ?scene=<id>&reseed&burn=5000
// Their placement fingerprints must MATCH. A third load without reseed but
// with burn must DIFFER (proving the fingerprint can see reshuffles at all
// — a gate that cannot fail is not a gate).
const SCENE = process.env.SG_SCENE || 'orchard';
const BASE = process.argv[2] || `http://localhost:${process.env.SG_PORT || 8933}`;
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const browser = await chromium.launch({ args: ['--disable-backgrounding-occluded-windows'] });
async function hashOf(params) {
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  await page.goto(`${BASE}/?scene=${SCENE}&raw=1&nostream=1&${params}&cb=${Date.now()}`, { waitUntil: 'commit', timeout: 200000 });
  await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 200000, polling: 100 });
  const h = await page.evaluate(() => window.__bootError ? 'BOOTERR' : window.__placementHash);
  await page.close();
  return h;
}
const a = await hashOf('reseed');
const b = await hashOf('reseed&burn=5000');
const c = await hashOf('burn=5000');
await browser.close();
console.log(`   determinism [${SCENE}]  clean+reseed ${a}   burnt+reseed ${b}   burnt-only ${c}`);
if (a === 'BOOTERR' || b === 'BOOTERR' || c === 'BOOTERR') { console.log('   FAIL  a build errored'); process.exit(1); }
if (a !== b) { console.log('   FAIL  reseed does not erase prior stream consumption'); process.exit(1); }
if (a === c) { console.log('   FAIL  fingerprint cannot see a reshuffle — the gate is blind'); process.exit(1); }
console.log('   PASS  district build is order-independent under reseed, and the gate can see');
