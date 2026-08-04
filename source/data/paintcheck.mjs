// IS THE ROAD PAINT ON THE ROAD?
//
// The owner's 2026-08-05 frame: double-yellow lines drawn across a standing
// figure's chest, 30m from Beach Arrival Plaza. Measured cause — bridge ways
// painted their yellows with a bare `flat = true`, which sends ribbon() down
// its fallback (max terrain along the way + 1.2m) while the TARMAC on the same
// way takes the measured deck height out of BRDECK. Two rules for one surface.
// The paint stood 1.11m proud of the ground at (-1580,12729) and was buried
// 1.27m under the deck at the causeway.
//
// FIND THEM BY MATERIAL, NOT BY NAME. The merged layers are named
// ('roadMarking'), but consolidate re-merges them into tileBatch meshes and
// the name does not survive — a scan keyed on the name reported a clean island
// while the defect was in the frame. Colour survives; PAL.yellow is 0xd8b44a
// and the centre line is 0xdedad0.
//
// WHAT IT ACTUALLY MEASURES, stated honestly after the 2026-08-05 run: paint
// height against the WALKING SURFACE. That is the player's question — a line
// at chest height is a line at chest height whatever drew it — but it is not
// only a paint check, because the follow-up measurement showed the paint is
// usually innocent:
//
//   (-1559.8,12729)  walkable 10.71, road DRAWN at 11.52, paint 11.56
//       the paint is correctly on its road; the ROAD is 0.8m in the air
//   (589.8,13723.3)  the road is drawn TWICE, a bridge deck at 8.44 and a
//       second copy at grade 7.00, each with its own yellows
//
// So a failure here means one of: paint at the wrong height (fixed 2026-08-05,
// the BRDECK note in city.js), a drawn deck that disagrees with the deck the
// player stands on, or a way drawn twice. All three put a line through a
// standing figure, which is how this got found.
//
// REPORT-ONLY, per the RETIRED-set argument in data/audit_world.js: the
// remaining offenders are the deck-vs-surface family and that is its own piece
// of work, not something to block a deploy on.
//
//   node data/paintcheck.mjs          prints offenders, exits 1 if any
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
const LIMIT = +(process.env.PAINT_LIMIT || 0.35);   // metres out of plane we tolerate

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=${SCENE}&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { timeout: 300000, polling: 300 });

const res = await page.evaluate((limit) => {
  const T = window.__THREE;
  const v = new T.Vector3();
  let checked = 0;
  const bad = [];
  window.__scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const c = o.material && o.material.color;
    if (!c) return;
    const hex = c.getHexString();
    if (hex !== 'd8b44a' && hex !== 'dedad0') return;   // PAL.yellow, centre line
    // NOT THE PLAYER'S OWN KIT. Matching on colour also matches the parked
    // scooter and the hidden walker rig, which are authored at their local
    // origin and only moved when they are in use — so they sit at world (0,0)
    // and reported as a road marking 'buried 1.17m' at the world origin. The
    // island is kilometres from (0,0) and nothing real is ever drawn there,
    // so anything that close is a rig, not a road (measured 2026-08-05: 51
    // meshes at the origin, every one of them a body part, a wheel or a deck).
    const pos = o.geometry?.attributes?.position;
    if (!pos) return;
    o.updateWorldMatrix(true, false);
    // ...and test the GEOMETRY's centre, not the object's transform. The
    // merged marking layers sit at a transform of (0,0,0) with their vertices
    // spread across the island, so excluding by world POSITION excluded every
    // real marking mesh and the check cheerfully reported '0 of 0'.
    {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const c = o.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld);
      if (Math.hypot(c.x, c.z) < 50) return;
    }
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      checked++;
      const gap = v.y - window.__surfaceAt(v.x, v.z);
      if (Math.abs(gap) > limit) {
        bad.push({ x: +v.x.toFixed(1), z: +v.z.toFixed(1), gap: +gap.toFixed(2), hex });
      }
    }
  });
  bad.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  const seen = [], clusters = [];
  for (const b of bad) {
    if (seen.some((q) => Math.hypot(q.x - b.x, q.z - b.z) < 40)) continue;
    seen.push(b); clusters.push(b);
    if (clusters.length >= 20) break;
  }
  return { checked, bad: bad.length, clusters };
}, LIMIT);

console.log(`  paintcheck: ${res.bad} of ${res.checked} marking vertices sit more than ${LIMIT}m off the surface under them`);
for (const c of res.clusters) console.log(`     ${c.gap > 0 ? 'proud' : 'buried'} ${Math.abs(c.gap)}m  at (${c.x},${c.z})  #${c.hex}`);
await browser.close();
if (res.bad) { console.log('  paintcheck FAIL'); process.exit(1); }
console.log('  paintcheck ok');
