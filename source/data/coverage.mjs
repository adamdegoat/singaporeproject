// COVERAGE — what does sentosa.json CARRY versus what does the world DRAW?
// The owner's asks: buildings must read as Sentosa, trees must be the surveyed
// ones (not invented), and the forest trails must be walkable. All three are
// "is this layer wired?" questions, and the honest answer is a count each way.
// Run: node data/coverage.mjs
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=sentosa`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 240000, polling: 250 });

const out = await page.evaluate(() => {
  const d = window.__data, S = window.__stats || {};
  const ways = d.roads || [];
  const kind = (k) => ways.filter((w) => (w.k || '') === k).length;
  // how many trees are SURVEYED (in the data) vs invented by a builder
  const surveyed = (d.trees || []).length;
  // named buildings: the ones that can read as a real place
  const named = (d.buildings || []).filter((b) => b.n).length;
  // which builders left a counter behind
  const counters = {};
  for (const [k, v] of Object.entries(S)) if (typeof v === 'number' && v) counters[k] = v;
  return {
    data: {
      buildings: (d.buildings || []).length, namedBuildings: named,
      footway: kind('footway'), pedestrian: kind('pedestrian'), steps: (d.steps || []).length,
      trees: surveyed, piers: (d.piers || []).length,
      monorail: (d.monorail || []).length, cableway: (d.cableway || []).length,
      shops: (d.shops || []).length, parkfurn: (d.parkfurn || []).length,
      coast: (d.coast || []).length, green: (d.green || []).length,
    },
    drawnCounters: counters,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
