#!/usr/bin/env node
// CAN A PERSON STANDING IN FRONT OF A VENUE ACTUALLY READ ITS NAME?
//
//     SG_SCENE=sentosa node data/readcheck.mjs
//
// signcheck.mjs already asks the PLACEMENT questions — does every venue get a
// name, is a board in the carriageway, does it face something walkable — and
// on 2026-08-21 it passed 142 of 142 while Tanjong Beach Club's plate had the
// top half of its letters cut off by the awning directly above it. Placement
// was correct. The name was still unreadable.
//
// So this asks the other question, and it asks it the only way that cannot be
// argued with: put an eye where a reader stands and cast a ray at the plate.
// Nine sightlines per band — three distances (8, 14, 20 m) by three lateral
// offsets (-3, 0, +3 m) — because ONE ray is brittle. A tree trunk blocking a
// single line is scenery, not a defect.
//
// THE CLASSIFICATION IS THE WHOLE POINT. A blocker within 1.2 m of the plate
// is the BUILDING'S OWN trim — awning, canopy, cornice — and that is there
// from every angle, so it is a defect. A blocker further out is the world
// standing in front of a sign, which is what worlds do.
//
// WHY THIS IS A DIAGNOSTIC AND NOT A DEPLOY GATE: it currently reports two
// genuine failures (7-Eleven, hidden on 9 lines of 9; "beaute love" on 7 of
// 9). Wiring a known-red check into deploy.sh would either block every deploy
// or teach everyone to ignore it, and "a red that lies" is a disease this
// project has already paid for once (SESSION 30i, stuckcheck). It becomes a
// gate on the day the count is zero, and not before.
//
// A FIX WAS ATTEMPTED AND REVERTED, 2026-08-21 — read this before trying the
// obvious one. The arithmetic looks damning: sgdetail clamps the plate to
// footing+4.2 on any wall over ~5.1 m, and shopfront.js's BIG fascia runs
// footing+3.94 to +4.38, so the plate lands in the trim by construction.
// Lifting the plate clear of that band made it WORSE — 2 self-blocked became
// 3, and Billabong went from 0/9 to 9/9. The fascia is therefore NOT the (only)
// blocker; the awning projects 0.34 m FORWARD of the wall and the ground-floor
// band has its own geometry, so a plate moved up can end up behind an eave it
// previously cleared. Whatever the fix is, measure it with this tool before
// believing it.
import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.on('pageerror', (e) => console.log('  page error:', e.message));
// three.js reports a shader failure to console.error, not as an exception —
// the SESSION 30i lesson, and the reason a probe that only watches pageerror
// can call a dead world a clean boot.
page.on('console', (m) => { if (m.type() === 'error') console.log('  console:', m.text().slice(0, 200)); });
await page.goto(`http://localhost:${PORT}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });

const rows = await page.evaluate(() => {
  const T = window.__THREE, ray = new T.Raycaster(), out = [];
  for (const s of (window.__venueSigns || [])) {
    if (s.nx == null) { out.push({ n: s.n, noNormal: true }); continue; }
    const tx = -s.nz, tz = s.nx;                       // along the wall
    let self = 0, scenery = 0, clear = 0, nearest = null;
    for (const D of [8, 14, 20]) {
      for (const off of [-3, 0, 3]) {
        const ex = s.x + s.nx * D + tx * off, ez = s.z + s.nz * D + tz * off;
        const eye = new T.Vector3(ex, window.__surfaceAt(ex, ez) + 1.6, ez);
        const tgt = new T.Vector3(s.x, s.y, s.z);
        const dir = tgt.clone().sub(eye); const dist = dir.length(); dir.normalize();
        ray.set(eye, dir); ray.far = dist - 0.05;
        const hit = ray.intersectObject(window.__scene, true).find((q) => q.distance < dist - 0.2);
        if (!hit) { clear++; continue; }
        const gap = dist - hit.distance;
        if (gap <= 1.2) { self++; if (nearest === null || gap < nearest) nearest = gap; } else scenery++;
      }
    }
    out.push({ n: s.n, self, scenery, clear, nearest: nearest === null ? null : +nearest.toFixed(2) });
  }
  return out;
});
await browser.close();

const bad = rows.filter((r) => r.self >= 5).sort((a, b) => b.self - a.self);
const dim = rows.filter((r) => r.self < 5 && r.clear === 0);
console.log(`  ${rows.length} wall bands, 9 sightlines each`);
for (const r of bad) {
  console.log(`  FAIL  ${r.n.padEnd(30)} hidden by its own building on ${r.self}/9`
    + ` (nearest blocker ${r.nearest}m in front)`);
}
for (const r of dim) {
  console.log(`  note  ${r.n.padEnd(30)} never clear on any of 9 — ${r.scenery} blocked by scenery`);
}
console.log(`  ${rows.length - bad.length} of ${rows.length} readable; ${bad.length} hidden by their own building`);
process.exit(0);      // diagnostic, not a gate — see the header
