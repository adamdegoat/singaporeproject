#!/usr/bin/env node
// Frame rate at the spawn point, phone conditions, in a HEADED browser.
//
//     SG_SCENE=world node data/fps.mjs [seconds]
//
// A browser launched by a script sits behind the terminal and gets throttled
// however many anti-throttling flags are passed — the same spot has read 51fps
// focused and 23 in a spawned window. So this is a FLOOR, not the number: if it
// is healthy here it is healthy in front of you, and if it is not, check by
// hand before believing it. Draw calls and triangles are properties of the
// world and are true either way.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const SECS = +(process.argv[2] || 6);
const browser = await chromium.launch({
  headless: false,
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion', '--window-position=0,0'],
});
const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
page.setDefaultTimeout(120000);
await page.goto(`http://localhost:8933/?dpr=2&touch=1&scene=${process.env.SG_SCENE || 'world'}`
  + (process.env.SG_EXTRA ? '&' + process.env.SG_EXTRA : ''), { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
await page.waitForTimeout(2500);

const samples = [];
for (let i = 0; i < SECS; i++) {
  await page.waitForTimeout(1000);
  samples.push(await page.evaluate(() => {
    const p = window.__probe || {};
    return { fps: p.fps, tris: p.tris, calls: p.calls, px: p.px };
  }));
}
await browser.close();
const fps = samples.map((s) => s.fps).filter((v) => v > 0).sort((a, b) => a - b);
const last = samples[samples.length - 1];
console.log(`fps  min ${fps[0]}  median ${fps[(fps.length / 2) | 0]}  max ${fps[fps.length - 1]}`);
console.log(`${last.px}  ${(last.tris / 1000) | 0}k triangles  ${last.calls} draw calls`);
