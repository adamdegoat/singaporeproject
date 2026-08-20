// DOES EVERY NAMED VENUE SAY ITS OWN NAME, AND DOES ITS SIGN STAND SOMEWHERE
// A PERSON COULD STAND?
//
// 127 shops on Sentosa are mapped with real names. Two systems put those names
// into the world and neither had a gate: the WALL BANDS (SESSION 30f) went in
// on a screenshot and a hand-typed probe, and the STANDING DIRECTORIES that
// followed would have gone in the same way. Both place geometry by asking the
// road and path indexes where it is safe to stand, and that is exactly the
// family of rule that has quietly put six-metre columns in a carriageway, an
// entrance canopy over the sea, and an apron across a race line.
//
// So this asks three questions of the finished world, not of the source:
//
//   1. COVERAGE — is every named venue named somewhere? A shop that is on
//      neither a wall band nor a directory is a shop the world is silent
//      about, and the count of those is ratcheted so it can only go down.
//   2. PLACEMENT — is any sign standing in a carriageway, on a footway, or
//      inside a building? A directory is 1.9m of solid wall in the collision
//      grid; one on a path is a thing you cannot get past, which is the
//      "i cant even move" family.
//   3. LEGIBILITY — is any directory so close to another that the two read as
//      one object, and is every one of them within reach of the way it faces?
//
//     node data/signcheck.mjs             report; exit 1 on any failure
//     SIGN_UNNAMED=4 node data/...        loosen the coverage ratchet
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
// 2 today: Harry's and Twelve Cupcakes sit in footprints whose every side
// either faces no way within 30m or steps out into another building. Written
// as a ceiling rather than a target so the number can only be improved.
const UNNAMED = +(process.env.SIGN_UNNAMED || 2);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=${SCENE}&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });

const r = await page.evaluate(() => {
  const bands = window.__venueSigns || [];
  const pylons = window.__venuePylons || [];
  const shops = (window.__data.shops || []).filter((s) => (s.n || '').trim().length >= 2 && s.p);
  const said = new Set();
  for (const b of bands) said.add(b.n);
  for (const p of pylons) for (const n of p.n) said.add(n);
  const silent = shops.filter((s) => !said.has(s.n.trim())).map((s) => s.n);

  const inside = (x, z, p) => {
    let h = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const xi = p[i][0], zi = p[i][1], xj = p[j][0], zj = p[j][1];
      if (((zi > z) !== (zj > z))
          && (x < ((xj - xi) * (z - zi)) / ((zj - zi) || 1e-9) + xi)) h = !h;
    }
    return h;
  };
  const B = (window.__data.buildings || []).filter((b) => b.p && b.p.length >= 3);

  const onRoad = [], onPath = [], inBuilding = [], crowded = [], stranded = [];
  for (const p of pylons) {
    const who = p.n[0];
    if (window.__onRoad(p.x, p.z, 0)) onRoad.push(who);
    if (window.__onPath(p.x, p.z, 0)) onPath.push(who);
    for (const b of B) if (inside(p.x, p.z, b.p)) { inBuilding.push(who); break; }
    // it must FACE something walkable, or it is a board in a field
    let reach = 0;
    for (let d = 0.5; d <= 6; d += 0.5) {
      if (window.__onRoad(p.x + p.nx * d, p.z + p.nz * d, 0)
          || window.__onPath(p.x + p.nx * d, p.z + p.nz * d, 0)) { reach = d; break; }
    }
    if (!reach) stranded.push(who);
  }
  // the wall bands answer the same placement question against the wall they
  // are hung on, and only the carriageway one applies to them
  const bandOnRoad = bands.filter((b) => window.__onRoad(b.x, b.z, 0)).map((b) => b.n);
  for (let i = 0; i < pylons.length; i++) {
    for (let j = i + 1; j < pylons.length; j++) {
      const d = Math.hypot(pylons[i].x - pylons[j].x, pylons[i].z - pylons[j].z);
      if (d < 12) crowded.push(`${pylons[i].n[0]} / ${pylons[j].n[0]} ${d.toFixed(1)}m`);
    }
  }
  const listed = pylons.reduce((a, p) => a + p.n.length, 0);
  const widest = pylons.reduce((a, p) => Math.max(a, p.n.length), 0);
  return { shops: shops.length, bands: bands.length, pylons: pylons.length, listed, widest,
    silent, onRoad, onPath, inBuilding, crowded, stranded, bandOnRoad };
});
await browser.close();

let fail = 0;
const say = (ok, line) => { if (!ok) fail = 1; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${line}`); };
console.log(`  ${r.shops} named venues: ${r.bands} on their own wall, `
  + `${r.listed} on ${r.pylons} standing directories (widest ${r.widest} names)`);
say(r.silent.length <= UNNAMED,
  `${r.silent.length} venues say nothing (ceiling ${UNNAMED})` + (r.silent.length ? ': ' + r.silent.join(', ') : ''));
say(!r.onRoad.length, `no directory in a carriageway` + (r.onRoad.length ? ': ' + r.onRoad.join(', ') : ''));
say(!r.bandOnRoad.length, `no wall band in a carriageway` + (r.bandOnRoad.length ? ': ' + r.bandOnRoad.join(', ') : ''));
say(!r.onPath.length, `no directory standing on a footway` + (r.onPath.length ? ': ' + r.onPath.join(', ') : ''));
say(!r.inBuilding.length, `no directory inside a building` + (r.inBuilding.length ? ': ' + r.inBuilding.join(', ') : ''));
say(!r.crowded.length, `no two directories within 12m` + (r.crowded.length ? ': ' + r.crowded.join(' | ') : ''));
say(!r.stranded.length, `every directory faces a way within 6m` + (r.stranded.length ? ': ' + r.stranded.join(', ') : ''));
say(r.widest <= 9, `no directory carries more than 9 names (widest ${r.widest})`);
console.log(fail ? '  FAIL  signcheck' : '  PASS  signcheck');
process.exit(fail);
