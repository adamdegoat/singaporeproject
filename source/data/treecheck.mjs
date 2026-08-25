#!/usr/bin/env node
// TREES IN THE ROAD, AND TREES IN THE SEA.
//
//     node data/treecheck.mjs
//     TREE_XPARAMS=oldroadguard node data/treecheck.mjs    # proves it can fail
//
// The owner has reported "trees in middle of roads" twice — 2026-08-22 and
// again 2026-08-24. The first answer nudged a margin from 0 to 0.5 and shipped;
// this gate exists because a number nudged by feel is not a fix and there was
// nothing that could tell anyone it had not worked.
//
// HOW IT DECIDES. Not `__onRoad` — that is the index the placement guard
// already consults, so asking it is asking the accused. It reads the trunk
// list `window.__treeIx` (every full-size tree, written at the one planting
// choke point) and DROPS A RAY on each one, then reads the name of the mesh it
// lands on. `roadSurface` under a trunk is a tree in the road no matter what
// any index believes, and `seaSurface` under a trunk is a tree in the sea.
//
// TWO PROBE TRAPS PAID FOR HERE, both of which produced a confident zero:
//   * reading positions from the tree InstancedMeshes instead of __treeIx.
//     qtrees.js re-partitions near/far every tick and zeroes the slots it is
//     not using, so the same probe read 4,253 trees on one run and 1 on the
//     next. Read the placement list, never the GPU buffer.
//   * skipping meshes with `visible === false`. District culling toggles that
//     per camera position: 18 trees on tarmac became 0 between two runs of an
//     unchanged probe. Ask the geometry, not the culler.
//
// Needs the dev server on :8933 and Playwright's chromium.
import { refuseUnderDeploy } from './deploylock.mjs';
refuseUnderDeploy('treecheck.mjs');
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const SCENE = process.env.SG_SCENE || 'sentosa';
const PORT = process.env.SG_PORT || 8933;
const XP = process.env.TREE_XPARAMS ? '&' + process.env.TREE_XPARAMS : '';
// 0. IT WAS 2, THE TWO WERE NAMED, AND NAMING THEM IS WHAT GOT THEM FIXED.
//
// (-891.3,12376.4) and (-1063.7,12181.3), each ~2.0m outside the nearest
// mapped way's edge, carried here since 2026-08-24 as "cause not pinned down;
// someone should". Pinned down 2026-08-25, and NOT by reasoning from the
// distances — that pointed at the mitre and was wrong. By REPRODUCING
// ribbon()'s own polygon in a probe (3m subdivision, end extension, mitred
// per-vertex offsets) and asking which quad of which strip contains the trunk:
// segment 28 of 29 of an 11.4m service way, and segment 0 of 17 of Sentosa
// Gateway. Both END segments. `ribbon()` pushes every way's tarmac
// `half * ROAD_END_EXT` past its own terminal node and the drawn-road index
// stopped at the node. The index carries it now (roads.js), and the constant
// is exported from there so the drawn shape and the tested shape cannot drift.
//
// A budget you can hold at zero is worth more than a residue you can name, and
// the residue is what named the cause. 64 -> 2 -> 0.
const ROAD_BUDGET = +(process.env.TREE_ROAD_BUDGET || 0);
const SEA_BUDGET = +(process.env.TREE_SEA_BUDGET || 0);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
let road = [], sea = [], total = 0;
try {
  await page.goto(`http://localhost:${PORT}/index.html?dpr=1&raw=1&streamall=1&scene=${SCENE}${XP}&cb=${Date.now()}`,
    { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null,
    { timeout: +(process.env.SG_BOOT_BUDGET || 300000), polling: 400 });

  const out = await page.evaluate(() => {
    const T = window.THREE || window.__THREE;
    const scene = window.__scene || window.__world;
    const IX = window.__treeIx;
    if (!IX) return { err: 'no window.__treeIx — the planting choke point did not run' };
    const pts = [];
    for (const a of IX.values()) for (let i = 0; i < a.length; i += 3) pts.push([a[i], a[i + 1], a[i + 2]]);
    const rc = new T.Raycaster(); rc.far = 60;
    const road = [], sea = [], tally = {};
    for (const [x, z, sc] of pts) {
      const g = window.__terrainAt(x, z);
      rc.set(new T.Vector3(x, g + 25, z), new T.Vector3(0, -1, 0));
      let name = '(nothing)';
      for (const hit of rc.intersectObjects(scene.children, true)) {
        const o = hit.object;
        if (!o.isMesh || o.isInstancedMesh) continue;
        if (o.userData.treeTrunk || o.userData.treeFoliage) continue;
        // `roadSurface` covers four materials: asphalt and busLane are traffic
        // lanes, unitPave is a pedestrian square and roadConc is an apron. A
        // tree in a paved plaza is a tree in a planter; only the lanes are the
        // defect this gate is named after.
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        name = o.name || '(unnamed)';
        if (name === 'roadSurface') {
          const mn = (m && m.name) || '?';
          name = (mn === 'asphalt' || mn === 'busLane') ? 'roadSurface' : 'paving:' + mn;
        }
        break;
      }
      tally[name] = (tally[name] || 0) + 1;
      // exact coordinates, not rounded: three "offenders" were re-probed at
      // their rounded position, landed on grass a metre away, and wasted a
      // round of diagnosis
      const row = [+x.toFixed(1), +z.toFixed(1), +sc.toFixed(2),
        window.__nearestStreet ? window.__nearestStreet(x, z) : null];
      if (name === 'roadSurface') road.push(row);
      else if (name === 'seaSurface') sea.push(row);
    }
    return { total: pts.length, tally, road, sea };
  });
  if (out.err) { console.log(`   FAIL  ${out.err}`); await browser.close(); process.exit(1); }
  ({ road, sea, total } = out);
  console.log(`   tree check   ${SCENE}${XP ? '  ' + XP : ''}`);
  console.log(`     ${total} full-size trunks; what each one stands on:`);
  for (const [k, v] of Object.entries(out.tally).sort((a, b) => b[1] - a[1]))
    console.log(`       ${String(v).padStart(5)}  ${k}`);
  for (const [label, list] of [['ON THE TARMAC', road], ['IN THE SEA', sea]]) {
    if (!list.length) continue;
    console.log(`     ${label}: ${list.length}`);
    for (const r of list.slice(0, 12)) console.log(`       ${r[0]},${r[1]}  scale ${r[2]}  near ${r[3]}`);
  }
  console.log(`   TREE {"onRoad":${road.length},"inSea":${sea.length},"total":${total}}`);
} finally {
  await browser.close();
}
if (errors.length) { console.log(`   FAIL  page errors: ${errors[0]}`); process.exit(1); }
const over = [];
if (road.length > ROAD_BUDGET) over.push(`${road.length} trees on the tarmac, budget ${ROAD_BUDGET}`);
if (sea.length > SEA_BUDGET) over.push(`${sea.length} trees in the sea, budget ${SEA_BUDGET}`);
if (over.length) { console.log(`   FAIL  ${over.join('; ')}`); process.exit(1); }
console.log(`   PASS  no full-size tree stands on drawn tarmac or drawn sea (${total} checked)`);
