#!/usr/bin/env node
// Judge a landmark recipe against the generic facade it replaces.
//
//     node data/landmark.mjs "lucky plaza" "plaza singapura"
//
// This project's rule is that a bespoke recipe exists to make a building more
// recognisable than the generic facade family, and one that does not is a
// REGRESSION that must not be wired up. Three recipes have already been built,
// judged worse, and held back under it. But the rule needs a way to actually
// look, and the earlier attempts at that all failed the same way: the camera
// went inside the building, or behind the block opposite, or framed the wrong
// mass. Judging a recipe inside a full street means fighting the street.
//
// So: `?solo=` builds ONLY that building, `?norecipe` forces it through the
// generic family, and this renders the same camera twice. Two frames of the
// same thing, one variable. That is the whole trick.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync } from 'fs';

const OUT = 'shots/landmark';
mkdirSync(OUT, { recursive: true });
const SCENE = process.env.SG_SCENE || 'world';
const names = process.argv.slice(2);
if (!names.length) { console.error('usage: node data/landmark.mjs "<name>" ...'); process.exit(1); }

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows'],
});

for (const name of names) {
  const slug = name.replace(/\W+/g, '_');
  for (const variant of ['recipe', 'generic']) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 760 } });
    page.on('pageerror', (e) => console.log('    PAGEERROR ' + String(e.message).slice(0,200)));
    const q = `dpr=1&scene=${SCENE}&solo=${encodeURIComponent(name)}`
      // nofoliage matters as much as the rest: the Angsana avenue is between
      // the camera and every building on this street, and a crown is 34m across
      + `&nopeople&notraffic&nofurniture&noside&nosg&nosigns&nomarks&nosurround`
      + `&noshops&nofoliage`
      + (variant === 'generic' ? '&norecipe' : '');
    await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?${q}`, { waitUntil: 'load' });
    await page.waitForFunction('window.__ready === true || window.__bootError', null, { timeout: 120000 });
    const err = await page.evaluate(() => window.__bootError || null);
    if (err) { console.error(`  ${name} (${variant}) boot failed: ${String(err).slice(0, 200)}`); await page.close(); continue; }
    await page.waitForTimeout(900);
    await page.evaluate(() => window.__ui(false));

    // Frame it from its own geometry: everything else in the world is gone, so
    // the only thing that can be in shot is the thing being judged.
    const info = await page.evaluate((n) => {
      const b = (window.__data.buildings || []).find(
        (x) => (x.n || '').toLowerCase().includes(n.toLowerCase()));
      if (!b) return null;
      let cx = 0, cz = 0;
      for (const q2 of b.p) { cx += q2[0]; cz += q2[1]; }
      cx /= b.p.length; cz /= b.p.length;
      let rad = 0;
      for (const q2 of b.p) rad = Math.max(rad, Math.hypot(q2[0] - cx, q2[1] - cz));
      // three quarter view from the side the street is on
      let sx = cx, sz = cz + 1, best = Infinity;
      for (const ax of (window.__data.axes || [window.__data.axis]).filter(Boolean))
        for (const q2 of ax.p) {
          const d = (q2[0] - cx) ** 2 + (q2[1] - cz) ** 2;
          if (d < best) { best = d; sx = q2[0]; sz = q2[1]; }
        }
      let dx = sx - cx, dz = sz - cz;
      const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      // swing 35 degrees off dead-on so the frame shows two faces, not one
      const a = Math.atan2(dx, dz) + 0.61;
      const ux = Math.sin(a), uz = Math.cos(a);
      // THE GROUND IS NOT AT ZERO. Both the eye and the look-at were absolute
      // heights, so on Orchard -- where the ground runs 26m to 50m above the
      // datum -- the camera was framing the BASE of a 152m tower and calling it
      // a portrait of the building. Same two-numbers trap as the recipes that
      // seated a slab at y0 instead of footingY. Add the ground under the
      // subject to both.
      const g = window.__terrain ? window.__terrain.at(cx, cz) : 0;
      const dist = Math.max(rad * 1.9, b.h * 1.6, 70);
      const eye = g + Math.max(b.h * 0.55, 18);
      window.__cam(cx + ux * dist, eye, cz + uz * dist, cx, g + b.h * 0.42, cz, 40);
      return { n: b.n, h: b.h, a: Math.round(b.a), rad: Math.round(rad), ground: Math.round(g) };
    }, name);
    if (!info) { console.error(`  "${name}" is not in this scene`); await page.close(); break; }
    await page.waitForTimeout(500);
    const file = `${OUT}/${slug}.${variant}.jpg`;
    await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
    console.log(`  ${file}   ${info.n}  h=${info.h}  ${info.a}m2  r=${info.rad}  ground=${info.ground}`);
    await page.close();
  }
}
await browser.close();
