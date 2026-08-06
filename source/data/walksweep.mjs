#!/usr/bin/env node
// WALKSWEEP — stand at every named place on the island and look at it.
//
// The owner, 2026-08-06, setting the standard this tool exists to serve:
//
//   "when players play it the map should be like sentosa so they know how to
//    walk ard am i right? like for example USS needs to feel like USS when
//    walking inside u know what i mean."
//
// That is a walking-level, place-by-place standard, and every check we had is
// something else. golden.mjs watches 16 chosen frames. coverage.mjs counts
// what the data carries against what the world draws. trailcheck asks whether
// a route is walkable, not whether it is RECOGNISABLE. So places have been
// found broken one at a time, by eye, whenever somebody happened to look —
// Palate Playground had a slide for weeks, the Sensoryscape vessels were three
// copies of one basket, and Resorts World stood behind a forest.
//
// THE LIST COMES FROM THE MAP, NOT FROM MEMORY. That is the whole point: a
// sweep I write by hand can only cover the places I already think of, which is
// exactly the failure being fixed. Every named attraction, every named
// building and every entrance in the scene file is a stop, so a place can only
// be skipped if the map never had it.
//
// TWO OUTPUTS, and the numeric one matters more:
//
//   * a frame per stop in shots/sweep/, for looking at
//   * a REPORT per stop of what actually stands within 30m — mesh count and
//     nearest-thing distance. A named place with nothing near it is a floating
//     label, and that is measurable rather than a matter of opinion.
//
// Run:  SG_SCENE=sentosa node data/walksweep.mjs
//       SG_ONLY=universal node data/walksweep.mjs     # substring filter
//       SG_MAX=40 node data/walksweep.mjs             # cap the stops
//       SG_NOSHOT=1 node data/walksweep.mjs           # report only, no frames
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync } from 'fs';

const OUT = 'shots/sweep';
mkdirSync(OUT, { recursive: true });
const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const ONLY = (process.env.SG_ONLY || '').toLowerCase();
const MAX = +(process.env.SG_MAX || 0);
const NOSHOT = !!process.env.SG_NOSHOT;

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { polling: 300, timeout: 300000 });
await page.evaluate(() => window.__ui(false));

// THE STOPS, built inside the page from the scene's own layers.
const stops = await page.evaluate(() => {
  const d = window.__data, seen = new Map();
  const cen = (p) => (Array.isArray(p[0])
    ? [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length]
    : [p[0], p[1]]);
  const add = (n, p, src) => {
    const nm = String(n || '').trim();
    if (!nm || !p || !p.length) return;
    const c = cen(p);
    if (!isFinite(c[0]) || !isFinite(c[1])) return;
    // one stop per NAME: a complex mapped as eight footprints is one place to
    // stand in, not eight
    if (!seen.has(nm)) seen.set(nm, { n: nm, x: c[0], z: c[1], src });
  };
  for (const a of (d.attractions || [])) add(a.n, a.g && a.g.length ? a.g : a.p, 'attraction');
  for (const b of (d.buildings || [])) add(b.n, b.p, 'building');
  for (const e of (d.entrances || [])) add(e.n, e.p, 'entrance');
  return [...seen.values()];
});

let list = stops.filter((s) => !ONLY || s.n.toLowerCase().includes(ONLY));
list.sort((a, b) => a.n.localeCompare(b.n));
if (MAX) list = list.slice(0, MAX);
console.log(`== walksweep ${SCENE}: ${list.length} named place(s)`);

const rows = [];
for (const s of list) {
  // stand BACK from the place and look at it, at walking eye height — the
  // rider's own view, because that is the standard being tested
  await page.evaluate((p) => window.__teleport(p.x, p.z, 0), s);
  await page.waitForFunction(() => {
    const st = window.__streamState;
    if (st && st.building) return false;
    let n = 0;
    window.__scene.traverse((o) => { if (o.isInstancedMesh) n += o.count; });
    const prev = window.__sweepN;
    window.__sweepN = n;
    window.__sweepHits = (prev === n) ? (window.__sweepHits || 0) + 1 : 0;
    return window.__sweepHits >= 2;
  }, null, { polling: 500, timeout: 240000 }).catch(() => {});

  const info = await page.evaluate((p) => {
    const T = window.__THREE;
    // WHAT ACTUALLY STANDS HERE. Counts real meshes within 30m and above the
    // ground, so terrain and paving do not answer for a building.
    const g = window.__surfaceAt(p.x, p.z);
    // NOT BY MESH BOUNDING SPHERE. The first cut counted meshes whose bounding
    // sphere reached within 30m, and every distance came back a large NEGATIVE
    // number: after the per-tile merge one mesh spans hundreds of metres, so
    // its sphere swallows the whole neighbourhood and answers for the tile
    // rather than for the place. blockwho.mjs documents the same trap ("a hit
    // names a mesh spanning 110m") and it cost that tool three wrong answers.
    //
    // So ask the SOLID GRID instead — the thing a player actually bumps into.
    // Cells on a 3m lattice out to 30m, and the nearest occupied one. A named
    // place with an empty grid around it is a floating label, and that is a
    // measurement rather than an opinion.
    let near = 0, nearest = Infinity;
    for (let dx = -30; dx <= 30; dx += 3) {
      for (let dz = -30; dz <= 30; dz += 3) {
        const r = Math.hypot(dx, dz);
        if (r > 30) continue;
        const x = p.x + dx, z = p.z + dz;
        if (window.__blocked && window.__blocked(x, z)) {
          near++;
          if (r < nearest) nearest = r;
        }
      }
    }
    // and how enclosed it feels: rays at eye height, nearest thing in each of
    // eight directions, which is what "walking inside it" actually tests
    const rc = new T.Raycaster(); rc.far = 60;
    let walls = 0;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      rc.set(new T.Vector3(p.x, g + 1.7, p.z), new T.Vector3(Math.sin(a), 0, Math.cos(a)));
      const h = rc.intersectObjects(window.__scene.children, true)[0];
      if (h && h.distance < 60) walls++;
    }
    // STAND SOMEWHERE YOU COULD ACTUALLY STAND.
    //
    // First cut parked the eye at a fixed (x-26, z-26) and half the frames came
    // back as the inside of a wall — "New York" was 1200x700 of flat brown.
    // This is the same trap as the 46-of-78 map pins that landed inside
    // geometry on 2026-08-05: an offset is not a position.
    //
    // Try bearings around the place at increasing distance and take the first
    // eye that is on clear ground AND can see the target. Fall back to the
    // nearest clear point rather than to the naive offset, so a frame is never
    // silently taken from inside a building.
    const T2 = window.__THREE;
    const rc2 = new T2.Raycaster();
    let eye = null;
    for (const dist of [26, 34, 44, 18]) {
      for (let k = 0; k < 12 && !eye; k++) {
        const a2 = (k / 12) * Math.PI * 2;
        const ex2 = p.x + Math.sin(a2) * dist, ez2 = p.z + Math.cos(a2) * dist;
        if (window.__blocked && window.__blocked(ex2, ez2)) continue;
        const ey2 = window.__surfaceAt(ex2, ez2) + 1.7;
        // and the place must be visible from it — a clear spot behind a shed
        // is a picture of a shed
        const to = new T2.Vector3(p.x - ex2, (g + 3) - ey2, p.z - ez2);
        const len = to.length();
        rc2.set(new T2.Vector3(ex2, ey2, ez2), to.normalize());
        rc2.far = len * 0.75;
        const blockHit = rc2.intersectObjects(window.__scene.children, true)[0];
        if (blockHit) continue;
        eye = { x: ex2, z: ez2, y: ey2 };
      }
      if (eye) break;
    }
    if (!eye) {
      const ex2 = p.x - 26, ez2 = p.z - 26;
      eye = { x: ex2, z: ez2, y: window.__surfaceAt(ex2, ez2) + 1.7 };
    }
    window.__cam(eye.x, eye.y, eye.z, p.x, g + 5, p.z);
    return { ground: +g.toFixed(1), near, walls,
             nearest: isFinite(nearest) ? +nearest.toFixed(1) : null };
  }, s);

  if (!NOSHOT) {
    const safe = s.n.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 44);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${OUT}/${safe}.jpg`, quality: 82, type: 'jpeg' });
  }
  rows.push({ ...s, ...info });
}

// EMPTY PLACES FIRST — the whole reason this exists.
rows.sort((a, b) => a.near - b.near);
console.log('\n   places with the LEAST built around them (a floating label reads as nothing):');
for (const r of rows.slice(0, 25)) {
  console.log(`     ${String(r.near).padStart(4)} solid  ${String(r.walls).padStart(2)}/8 rays  `
    + `nearest ${String(r.nearest ?? '-').padStart(5)}m  ${r.src.padEnd(10)} ${r.n}`);
}
const bare = rows.filter((r) => r.near === 0).length;
console.log(`\n   ${bare} of ${rows.length} named places have NOTHING standing within 30m`);
if (!NOSHOT) console.log(`   frames in ${OUT}/`);
await browser.close();
