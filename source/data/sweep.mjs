#!/usr/bin/env node
// Coverage sweep. Visits every street in the district, measures performance at
// each stop, captures a frame, and writes a contact sheet.
//
//     node data/sweep.mjs [--stride 90] [--shots]
//
// This is the piece that replaces spot-checking. A single reading at the spawn
// point is how "48fps" got reported for a world that had never been measured
// anywhere else, and looking at one camera angle is how a black sky and trees
// standing in back roads survived a "finished" district.
//
// Needs the dev server on :8933 and Playwright's chromium.
// Playwright lives in another project here rather than being a dependency of
// this one, which has no package.json and ships as plain ES modules.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const args = process.argv.slice(2);
const stride = Number((args.find((a) => a.startsWith('--stride')) || '').split('=')[1] || 90);
const wantShots = args.includes('--shots');
const OUT = 'shots/sweep';
// Re-baselined 2026-07-29: the old 900/1.6M predated three ACCEPTED costs —
// full-district dressing (2.75M -> 3.47M tris, 899 -> 906 draws, measured in
// NEXT.md), the terrain twist subdivision + road cross-strips from the
// yellow-patches fix (~+100k tris), and the paint layers (~+22k tris, +1
// draw per layer). Worst view measured 934 draws / 3.64M tris the day of the
// re-baseline; margins are thin ON PURPOSE so growth is a decision, not a
// drift. Draw calls are the number that matters on this fill-rate-bound GPU.
const BUDGET = { worstFps: 30, medianFps: 45, calls: 960, tris: 3_800_000 };

mkdirSync(OUT, { recursive: true });
// the SAME scene the page will load — this was hardcoded to orchard.json,
// and a chinatown sweep teleported through orchard coordinates inside a
// chinatown world: 220 frames of empty terrain, measured and budgeted.
// The check-reads-the-input disease, again.
const data = JSON.parse(readFileSync(`data/${process.env.SG_SCENE || 'world'}.json`, 'utf8'));

// one stop every `stride` metres along every carriageway, plus the main axis
function stops() {
  const out = [];
  const lines = data.roads
    .filter((r) => !['footway', 'pedestrian', 'steps'].includes(r.k))
    .map((r) => ({ n: r.n || '(unnamed)', p: r.p }));
  if (data.axis) lines.unshift({ n: data.axis.n || 'Orchard Road', p: data.axis.p });
  for (const line of lines) {
    let carried = 0;
    for (let i = 0; i < line.p.length - 1; i++) {
      const [x1, z1] = line.p[i], [x2, z2] = line.p[i + 1];
      const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz);
      if (L < 1e-6) continue;
      let t = stride - carried;
      while (t < L) {
        out.push({ street: line.n, x: x1 + (dx * t) / L, z: z1 + (dz * t) / L,
                   heading: Math.atan2(dx / L, dz / L) });
        t += stride;
      }
      carried = (carried + L) % stride;
    }
  }
  return out;
}

const all = stops();
// one stop per street minimum, then spread the rest evenly, capped so the sweep
// finishes in minutes rather than hours
const byStreet = new Map();
for (const s of all) {
  if (!byStreet.has(s.street)) byStreet.set(s.street, []);
  byStreet.get(s.street).push(s);
}
const CAP = Number((args.find((a) => a.startsWith('--cap')) || '').split('=')[1] || 220);
const picked = [];
for (const [, list] of byStreet) picked.push(list[Math.floor(list.length / 2)]);
for (const [, list] of byStreet)
  for (const s of list) if (picked.length < CAP && !picked.includes(s)) picked.push(s);

console.log(`== coverage sweep`);
console.log(`   ${byStreet.size} streets, ${all.length} candidate stops at ${stride}m`);
console.log(`   visiting ${picked.length}${picked.length < all.length ? ` (capped from ${all.length})` : ''}`);

const browser = await chromium.launch({
  // Playwright's bundled Chromium takes a slower GL path on this machine: the
  // same spot reads 51fps in Chrome and 25 here. Draw calls and triangles are
  // scene facts and match either way, but an fps budget has to be measured on
  // the engine people actually use.
  channel: process.env.SWEEP_CHANNEL || 'chrome',
  // Headless falls back to software GL, which renders at a few frames a second
  // and makes every performance reading meaningless.
  headless: false,
  // Chrome throttles occluded windows to almost nothing, which looks exactly
  // like a catastrophic performance bug in the scene.
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
         '--disable-features=CalculateNativeWinOcclusion'],
});
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 },
                                       deviceScaleFactor: 2 });
ctx.setDefaultTimeout(120000);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));

// SG_SCENE picks the district (flat path — single-district scenes have no
// manifest); streamall makes a manifest scene build fully before the sweep
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?dpr=2&touch=1&streamall=1&scene=${process.env.SG_SCENE || 'world'}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true || window.__bootError',
                           null, { timeout: 120000 });
const bootErr = await page.evaluate(() => window.__bootError || null);
if (bootErr) { console.error('   boot failed: ' + String(bootErr).slice(0, 300)); process.exit(2); }
await page.waitForTimeout(2500);

const rows = [];
for (let i = 0; i < picked.length; i++) {
  const s = picked[i];
  await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), [s.x, s.z, s.heading]);
  // fps is averaged over a whole second by the HUD, so a shorter wait reports
  // the second that contained the teleport rather than the second after it
  await page.waitForTimeout(1250);
  const m = await page.evaluate(() => ({
    fps: window.__probe.fps, calls: window.__probe.calls, tris: window.__probe.tris,
    px: window.__probe.px, dpr: window.__probe.dpr,
  }));
  let shot = null;
  if (wantShots) {
    shot = `${OUT}/${String(i).padStart(3, '0')}.jpg`;
    await page.screenshot({ path: shot, type: 'jpeg', quality: 62 });
  }
  rows.push({ ...s, ...m, shot });
  if (i % 25 === 0) process.stdout.write(`   ${i}/${picked.length}\r`);
}
await browser.close();

const fps = rows.map((r) => r.fps).sort((a, b) => a - b);
const median = fps[Math.floor(fps.length / 2)];
const worst = fps[0];
const worstCalls = Math.max(...rows.map((r) => r.calls));
const worstAt = rows.filter((r) => r.fps === worst).slice(0, 3);

const verdict = [];
const check = (id, name, value, budget, cmp) => {
  const ok = cmp === '>' ? value > budget : value < budget;
  verdict.push({ id, name, value, budget, ok });
};
// Only scene facts are gated here. A browser launched by a script sits behind
// the terminal window and gets throttled no matter which anti-throttling flags
// are passed: the same spot reads 51fps in a focused browser and 23 here, at
// an identical 1688x780 and an identical 550 draw calls. Draw calls and
// triangles are properties of the world and are the same either way, so those
// are the budget; the frame rate is reported as indicative and confirmed at
// the worst spots in a focused browser.
check('F3', 'worst draws', worstCalls, BUDGET.calls, '<');
check('F4', 'worst tris',  Math.max(...rows.map((r) => r.tris)), BUDGET.tris, '<');

console.log(`\n   render target     ${rows[0].px} at dpr ${rows[0].dpr}`);
console.log(`   stops visited     ${rows.length}`);
console.log(`   fps (indicative)  worst ${worst}  median ${median}  best ${fps[fps.length - 1]}`);
console.log(`   worst draw calls  ${worstCalls}`);
const heaviest = rows.slice().sort((a, b) => b.calls - a.calls).slice(0, 5);
console.log(`   heaviest views    ${heaviest.map((r) => `${r.street} ${r.calls}d`).join(', ')}`);
// The emptiest views are as interesting as the heaviest: a stop that draws
// almost nothing is a stretch of the district with nothing built on it, and
// that is what a bare street looks like from the saddle.
const emptiest = rows.slice().sort((a, b) => a.calls - b.calls).slice(0, 5);
console.log(`   emptiest views    ${emptiest.map((r) => `${r.street} ${r.calls}d`).join(', ')}`);
console.log('   review these frames:');
for (const r of emptiest)
  console.log(`     ${String(rows.indexOf(r)).padStart(3)}  ${r.street.padEnd(24)} ${r.calls} draws`);
console.log('   confirm fps here:');
for (const r of heaviest)
  console.log(`     ${r.street.padEnd(26)} __teleport(${r.x.toFixed(0)}, ${r.z.toFixed(0)}, ${r.heading.toFixed(2)})`);
if (errors.length) console.log(`   page errors       ${errors.length}: ${errors[0]}`);
console.log();
for (const v of verdict)
  console.log(`   ${v.ok ? 'PASS' : 'FAIL'} ${v.id}  ${v.name} ${v.value} (budget ${v.budget})`);

// contact sheet, so a human can review coverage instead of trusting a number
if (wantShots) {
  const cells = rows.map((r, i) => `
    <figure>
      <img src="${r.shot.replace('shots/sweep/', '')}" loading="lazy" alt="">
      <figcaption>${i}. ${r.street}<br><span>${r.fps}fps · ${r.calls} draws</span></figcaption>
    </figure>`).join('');
  writeFileSync(`${OUT}/index.html`, `<!doctype html><meta charset="utf-8">
<title>Orchard coverage sweep</title>
<style>
  body{margin:0;padding:18px;background:#14171a;color:#e8e2d4;
       font:13px/1.5 ui-monospace,Menlo,monospace}
  h1{font-size:15px;font-weight:600;margin:0 0 4px}
  p{color:#9aa0a6;margin:0 0 18px}
  .grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
  figure{margin:0}
  img{width:100%;display:block;border-radius:3px;background:#000}
  figcaption{padding-top:5px;font-size:12px}
  figcaption span{color:#9aa0a6}
</style>
<h1>Orchard Road coverage sweep</h1>
<p>${rows.length} stops across ${byStreet.size} streets ·
   fps worst ${worst} / median ${median} · worst ${worstCalls} draws</p>
<div class="grid">${cells}</div>`);
  console.log(`\n   contact sheet     ${OUT}/index.html`);
}

writeFileSync(`${OUT}/sweep.json`, JSON.stringify({ verdict, rows }, null, 1));
process.exit(verdict.every((v) => v.ok) ? 0 : 1);
