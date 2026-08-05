// THE SHARE CARD PICTURE — what a chat app shows when the link is pasted.
//
// The owner, 2026-08-05: "the whatsapp share link the description is not updated
// to sentosa this concept." The text was the easy half; the half that decides
// whether anyone taps it is the PICTURE. WhatsApp, Telegram and iMessage all
// render og:image at roughly 1200x630, and without one the link is a grey box
// with two lines of type under it.
//
// The frame is taken from the game itself, at a real place, through the game's
// own camera with the HUD hidden — not a mock-up. Siloso's lagoon because it is
// the most recognisably Sentosa view on the island and it reads at thumbnail
// size: jade water, pale sand, the palm islet, the rider in shot for scale.
//
//   node data/sharecard.mjs            writes share.jpg at 1200x630
//   SHARE_AT=x,z,heading node data/...  somewhere else
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
const [AX, AZ, AH] = (process.env.SHARE_AT || '-2231,12500,3.14').split(',').map(Number);

const browser = await chromium.launch({
  channel: process.env.SWEEP_CHANNEL || 'chrome', headless: false,
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
// 1200x630 exactly, so no chat app has to crop and guess
const page = await browser.newPage({ viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message.slice(0, 160)));
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError',
  null, { polling: 400, timeout: 300000 });
const boot = await page.evaluate(() => window.__bootError || null);
if (boot) { console.log('  BOOT FAILED: ' + String(boot).slice(0, 300)); await browser.close(); process.exit(2); }
// __ui(false) leaves the Friends button up — it is chrome, not HUD, and a
// share card with a UI button in it looks like a screenshot rather than a view.
await page.evaluate(() => {
  window.__ui(false);
  for (const el of document.querySelectorAll('button, #friends, #place, #hud')) {
    el.style.visibility = 'hidden';
  }
});
await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), [AX, AZ, AH]);
await page.waitForTimeout(2600);
// COMPOSE IT. The chase camera puts the rider dead centre with a third of the
// frame empty water below him, which is the right camera for playing and the
// wrong one for a thumbnail. A low camera ALONG the beach fills the frame with
// the thing worth showing: sand, lagoon, palms, the strip behind.
await page.evaluate(() => {
  const ex = -2180, ez = 12428, ax = -2470, az = 12330;
  const ge = window.__surfaceAt(ex, ez), ga = window.__surfaceAt(ax, az);
  window.__cam(ex, ge + 4.2, ez, ax, ga + 7, az, 58);
});
await page.waitForTimeout(700);
const where = await page.evaluate(() => {
  const p = window.__ridePos();
  return { at: [Math.round(p[0]), Math.round(p[1])],
    ground: +window.__surfaceAt(p[0], p[1]).toFixed(1),
    kind: window.__surface().kind };
});
await page.screenshot({ path: 'share.jpg', type: 'jpeg', quality: 88 });
console.log(`  share.jpg  1200x630  from ${JSON.stringify(where)}`);
console.log('  it is published by deploy.sh; og:image points at it');
await browser.close();
