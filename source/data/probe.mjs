#!/usr/bin/env node
// A one-off look at a built world: stats, draw calls, triangles, and whatever
// expression is passed in. For measuring a change, not for gating one.
//
//     SG_SCENE=world node data/probe.mjs "window.__shopBays.length"
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
page.setDefaultTimeout(120000);
const q = process.env.SG_QUERY || 'dpr=1';
await page.goto(`http://localhost:8933/?${q}&scene=${process.env.SG_SCENE || 'orchard'}`,
  { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
const err = await page.evaluate(() => window.__bootError || null);
if (err) { console.error('boot failed: ' + String(err).slice(0, 600)); await browser.close(); process.exit(2); }
await page.waitForTimeout(1200);

const out = await page.evaluate(() => {
  const p = window.__probe || {};
  // stats carries live meshes on some keys, and a mesh has a parent, so a
  // straight stringify walks the whole scene graph and never comes back
  const flat = {};
  for (const [k, v] of Object.entries(window.__stats || {})) {
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') flat[k] = v;
    else if (Array.isArray(v)) flat[k] = `[${v.length}]`;
  }
  return { stats: flat, render: { fps: p.fps, tris: p.tris, calls: p.calls, px: p.px } };
});
console.log('stats:', JSON.stringify(out.stats, null, 1));
console.log('render:', JSON.stringify(out.render));

for (const expr of process.argv.slice(2)) {
  const v = await page.evaluate(`(() => { try { return ${expr}; } catch (e) { return 'ERR ' + e.message; } })()`);
  console.log(`${expr} =`, typeof v === 'object' ? JSON.stringify(v).slice(0, 2000) : v);
}
await browser.close();
