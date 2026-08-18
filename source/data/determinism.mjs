#!/usr/bin/env node
// THE DETERMINISM GATE for the streaming design (WORKFLOW.md): a district
// built after arbitrary prior stream consumption must equal the district
// built clean, once ?reseed pins the placement stream. Two loads:
//   A: ?scene=<id>&reseed          B: ?scene=<id>&reseed&burn=5000
// Their placement fingerprints must MATCH. A third load without reseed but
// with burn must DIFFER (proving the fingerprint can see reshuffles at all
// — a gate that cannot fail is not a gate).
const SCENE = process.env.SG_SCENE || 'sentosa';
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
// THE BLINDNESS PROBE MOVED TO THE LEGACY STREAM MODE — 2026-08-19.
//
// Since 2026-08-14 position-keyed looks are the DEFAULT (main.js: every crown
// and facade draws from a hash of its own position, ?noplanthash restores the
// stream). Under that default `burn` has nothing left to reshuffle, so the
// old sanity check `a !== c` became impossible and this gate sat FAILING on a
// world that had actually gotten MORE deterministic: burnt-only now equals
// clean WITHOUT reseed, which is the streaming property holding
// unconditionally. Found 2026-08-19 when the gate refused a green tree — the
// live site failed it identically.
//
// The probe still matters (a fingerprint that cannot fail proves nothing), so
// it runs where the stream is still live: under ?noplanthash, burn MUST
// visibly reshuffle, or the fingerprint has gone blind for real.
// ...AND EVEN THE STREAM MODE IS BURN-PROOF NOW: measured 2026-08-19, a
// noplanthash+burn build fingerprints identically too — every instanced
// matrix in this world is survey- or position-derived. That is the streaming
// property holding at full strength, and it leaves burn with no way to prove
// the fingerprint is alive. So the liveness probe uses a parameter that
// LEGITIMATELY changes the world instead: a ?nofoliage build must hash
// differently from the default one, or the fingerprint is a constant and
// every PASS above is vacuous.
const d = await hashOf('reseed&nofoliage');
await browser.close();
console.log(`   determinism [${SCENE}]  clean+reseed ${a}   burnt+reseed ${b}   burnt-only ${c}`);
console.log(`   liveness probe  nofoliage ${d} (must differ from ${a})`);
if ([a, b, c, d].includes('BOOTERR')) { console.log('   FAIL  a build errored'); process.exit(1); }
if (a !== b) { console.log('   FAIL  reseed does not erase prior stream consumption'); process.exit(1); }
if (a !== c) { console.log('   note  burnt-only differs — some placement still reads the shared stream (allowed)'); }
if (a === d) { console.log('   FAIL  the fingerprint is blind — a world without foliage hashed the same'); process.exit(1); }
console.log('   PASS  district build is order-independent, and the fingerprint is alive');
