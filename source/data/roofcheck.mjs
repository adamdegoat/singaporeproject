#!/usr/bin/env node
// IS THE FACADE LYING FLAT ON THE ROOF?
//
//     node data/roofcheck.mjs
//     ROOF_XPARAMS=noroofcap node data/roofcheck.mjs     # proves it can fail
//
// Written 2026-08-24. The 2026-08-23 aerial over the Ocean Drive east grid
// reported "a regular grid of dark ovals" lying flat on two or three roofs,
// guessed at coordinates twice and missed both times, and left the note "find
// them by hit-testing the roof cap from directly overhead, not by eye". This
// is that hit test, and it found 179 of them, not three.
//
// HOW IT DECIDES, and why the obvious test is wrong. The first version flagged
// any roof whose material carried a texture — and 224 of its 355 "defects"
// were beach pavilions wearing a perfectly correct timber shingle. A roof is
// ALLOWED to be textured. What is never allowed is the BUILDING'S OWN WALL
// texture on its top face, so each footprint is probed twice and the two are
// compared:
//
//   * a ray straight DOWN from 120 m over an interior point (above anything
//     the hillside rule can grow a mass to, below the cloud deck — an earlier
//     attempt started at 200 m over the top and 1,017 of 1,095 rays came back
//     holding a cloud), taking the first face whose normal points up;
//   * a ray INWARD at mid-height from 40 m outside, which lands on the wall.
//     Fired from outside because extrusions are FrontSide and a ray cast from
//     within the building passes straight through its own walls.
//
// Same texture on both = the facade is the roof. Different, or the roof has no
// texture at all, = the top is closed by something that means to be a roof.
//
// Needs the dev server on :8933 and Playwright's chromium.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('roofcheck.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const XP = process.env.ROOF_XPARAMS ? '&' + process.env.ROOF_XPARAMS : '';
// how many footprints may wear their own facade on top.
//
// 30 -> 0 on 2026-08-26. The old note here said "0 is not reachable"; it was
// reachable, and what made it so was the check learning to say WHY rather than
// only WHICH (window.__roofCapWhy, and _capSkip on the eight branches that
// never reach the cap). Four distinct defects came out of that:
//   the shophouse pitch covering two-thirds of its own roof;
//   every roof piece in that recipe laid at b.h while the mass rose to topY;
//   EVERY flat deck on the island coplanar with the wall top and z-fighting;
//   Hotel Michael's barrel vaults, and a Cove villa whose concave plan does
//   not contain the centroid `grow()` scales about.
// 20 roofs / 2,609 m2 -> 0 / 0.
//
// A BUDGET YOU CAN HOLD AT ZERO IS WORTH MORE THAN A RESIDUE YOU CAN NAME —
// the same argument treecheck's road budget won on 2026-08-25. If this ever
// fails, something put a facade back on a roof; read the reason it prints.
const BUDGET = +(process.env.ROOF_BUDGET || 0);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
let bad = [];
try {
  await page.goto(`http://localhost:${PORT}/index.html?dpr=1&raw=1&streamall=1&scene=${SCENE}${XP}&cb=${Date.now()}`,
    { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null,
    { timeout: +(process.env.SG_BOOT_BUDGET || 300000), polling: 400 });

  const data = JSON.parse(readFileSync(join(HERE, `${SCENE}.json`), 'utf8'));
  // AN INTERIOR POINT, NOT THE CENTROID. A C-shaped block's centroid is in the
  // courtyard, and a ray dropped there measures the ground.
  const inside = (p, x, z) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      if ((p[i][1] > z) !== (p[j][1] > z)
          && x < (p[j][0] - p[i][0]) * (z - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    }
    return c;
  };
  const probes = [];
  data.buildings.forEach((b, i) => {
    let cx = 0, cz = 0;
    for (const [x, z] of b.p) { cx += x; cz += z; }
    cx /= b.p.length; cz /= b.p.length;
    if (!inside(b.p, cx, cz)) {
      let ok = false;
      for (const [vx, vz] of b.p) {
        for (const t of [0.3, 0.5, 0.7]) {
          const tx = cx + (vx - cx) * t, tz = cz + (vz - cz) * t;
          if (inside(b.p, tx, tz)) { cx = tx; cz = tz; ok = true; break; }
        }
        if (ok) break;
      }
      if (!ok) return;
    }
    probes.push({ i, cx, cz, h: b.h || 0, a: b.a || 0, mh: b.mh || 0,
      roof: !!b.roof, n: b.n || null, bt: b.bt || null,
      // the far side of the longest edge, for the inward ray
      ex: b.p[0][0], ez: b.p[0][1],
      // the key city.js's cap decision is filed under (window.__roofCapWhy)
      key: `${Math.round(b.p[0][0])},${Math.round(b.p[0][1])}`,
      // and this footprint's own bounds, so a wall sample that lands on the
      // NEIGHBOUR is thrown away rather than compared. The facade pool is a
      // handful of textures shared across hundreds of buildings, so a
      // neighbour's wall matches by coincidence often enough to matter — and
      // an open canopy, which has no walls of its own at all, matched every
      // single time.
      bb: [Math.min(...b.p.map((q) => q[0])), Math.min(...b.p.map((q) => q[1])),
           Math.max(...b.p.map((q) => q[0])), Math.max(...b.p.map((q) => q[1]))] });
  });

  const out = await page.evaluate((probes) => {
    const T = window.THREE || window.__THREE;
    const scene = window.__scene || window.__world;
    const down = new T.Raycaster(); down.far = 130;
    const side = new T.Raycaster(); side.far = 60;
    const n = new T.Vector3(), dir = new T.Vector3(), from = new T.Vector3();
    const mapOf = (o) => {
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      return m && m.map ? m.map.uuid : null;
    };
    return probes.map((p) => {
      const g = window.__terrainAt ? window.__terrainAt(p.cx, p.cz) : 0;
      down.set(new T.Vector3(p.cx, g + 120, p.cz), new T.Vector3(0, -1, 0));
      let roofMap = null, roofY = null;
      for (const hit of down.intersectObjects(scene.children, true)) {
        if (!hit.object.isMesh || !hit.object.visible || !hit.face) continue;
        n.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        if (n.y < 0.9) continue;
        roofY = hit.point.y - g; roofMap = mapOf(hit.object);
        break;
      }
      if (roofY === null || roofY <= Math.max(2, p.h * 0.6)) return { ...p, skip: true };
      // A CANOPY IS NOT JUDGED HERE, and the reason is a limit of the method
      // rather than a decision about canopies. `building=roof` is a slab on
      // columns with NO WALLS OF ITS OWN, so the inward ray keeps sampling
      // whatever stands underneath it — the shops under WEAVE, the concourse
      // under Festive Walk — and the facade pool is small enough that one of
      // them matches the slab's material often enough to report every canopy
      // on the island as defective. Restricting the sample to the canopy's own
      // bounding box did not help: the buildings it covers are inside it.
      // Their tops are drawn by the canopy branch in city.js, which uses
      // MAT.conc and a named recipe, never a facade family.
      if (p.roof) return { ...p, skip: true };
      if (!roofMap) return { ...p, bad: false, roofY: +roofY.toFixed(2) };
      // THE WALL IS THE MODE, NOT ONE SAMPLE. One inward ray at mid height
      // called 255 Cove villas defective: at 0.52h every one of them carries a
      // TERRACE SLAB, and the ray landed on its edge and reported the terrace
      // material as the facade — which happens to be the same paleStone that
      // is correctly on the roof. Four heights, and the texture that appears
      // most often is the wall; a terrace exists at exactly one of them.
      const votes = {};
      for (const frac of [0.25, 0.45, 0.65, 0.85]) {
        dir.set(p.cx - p.ex, 0, p.cz - p.ez);
        if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
        dir.normalize();
        from.set(p.cx - dir.x * 40, g + Math.max(1.2, p.h * frac), p.cz - dir.z * 40);
        side.set(from, dir);
        for (const hit of side.intersectObjects(scene.children, true)) {
          if (!hit.object.isMesh || !hit.object.visible || !hit.face) continue;
          n.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
          if (Math.abs(n.y) > 0.5) continue;          // a wall, not a deck edge
          const m = mapOf(hit.object);
          if (!m) continue;                            // trim, glass, a plain band
          if (hit.point.x < p.bb[0] - 2 || hit.point.x > p.bb[2] + 2
              || hit.point.z < p.bb[1] - 2 || hit.point.z > p.bb[3] + 2) break;   // not its wall
          votes[m] = (votes[m] || 0) + 1;
          break;
        }
      }
      let wallMap = null, best = 0;
      for (const k in votes) if (votes[k] > best) { best = votes[k]; wallMap = k; }
      return { ...p, bad: wallMap !== null && wallMap === roofMap, roofY: +roofY.toFixed(2) };
    });
  }, probes);
  const capWhy = await page.evaluate(() => window.__roofCapWhy || null);

  const judged = out.filter((r) => !r.skip);
  bad = judged.filter((r) => r.bad);
  const area = Math.round(bad.reduce((s, r) => s + r.a, 0));
  console.log(`   roof check   ${SCENE}${XP ? '  ' + XP : ''}`);
  console.log(`     ${judged.length} footprints resolved to a top surface, ${out.length - judged.length} unresolved`);
  console.log(`     FACADE ON THE ROOF: ${bad.length} roofs, ${area} m2`);
  const kind = (r) => (r.roof ? 'canopy' : r.mh > 1 ? 'lifted' : r.a <= 90 ? 'tiny' : r.a <= 300 ? 'small' : 'large');
  const by = {};
  for (const r of bad) by[kind(r)] = (by[kind(r)] || 0) + 1;
  console.log(`     by kind: ${JSON.stringify(by)}`);
  // WHY, from the cap itself. This printed a size, a height and a coordinate
  // and left "so why is the facade on it?" to be re-derived by hand every
  // time — the same gap __lampRej and __plateRej were built to close.
  // city.js keys its decision by the footprint's first vertex; so do we, out
  // of the same sentosa.json, so the join is exact.
  for (const r of bad.sort((x, y) => y.a - x.a).slice(0, 10)) {
    const why = (capWhy && capWhy[r.key]) || 'no cap decision recorded';
    console.log(`       a=${String(Math.round(r.a)).padStart(5)} h=${String(r.h).padStart(5)}`
      + ` ${kind(r).padEnd(6)} ${String(r.n || r.bt || '').padEnd(16)} at ${r.cx.toFixed(0)},${r.cz.toFixed(0)}`);
    console.log(`             ${why}`);
  }
  console.log(`   ROOF {"bad":${bad.length},"areaM2":${area}}`);
} finally {
  await browser.close();
}
if (errors.length) { console.log(`   FAIL  page errors: ${errors[0]}`); process.exit(1); }
if (bad.length > BUDGET) {
  console.log(`   FAIL  ${bad.length} roofs wear their own facade, budget ${BUDGET}`);
  process.exit(1);
}
console.log(`   PASS  ${bad.length} of budget ${BUDGET}`);
