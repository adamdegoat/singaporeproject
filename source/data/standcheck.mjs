// WHERE THE PLAYER STANDS vs WHERE THE GROUND IS DRAWN.
//
// This is the defect family behind every one of the owner's recurring reports
// — "that area it's like the road is floating up in the air", "im in the
// ground" — and behind the double-yellow line that crossed a standing figure's
// chest on 2026-08-05. In each case the paint and the walls were innocent:
// surfaceAt (the height the player is placed at, and the height collision and
// props are seated from) disagreed with the surface actually DRAWN under them.
//
// A gap either way is a bug the player sees:
//   drawn ABOVE surfaceAt  -> you are inside the road; the kerb is at your hip
//   drawn BELOW surfaceAt  -> you hover; your shadow is on nothing
//
// Sampled where players actually go — along the carriageways and footways,
// plus their verges — rather than over open jungle, because a gap in a place
// nobody can reach is not a defect anyone meets.
//
// NO RAYCASTS. The first two versions of this check raycast down onto the
// scene and neither ever finished: the ground layers are merged per-tile
// meshes of tens of thousands of triangles with no spatial index, so every ray
// tests every triangle, tens of thousands of times over.
//
// AND NOT vertexY EITHER, which was the third mistake. vertexY is the drawn
// GROUND height and it sits a deliberate 0.51m BELOW at() under a road, so the
// terrain does not z-fight through the tarmac laid on it. Comparing standing
// height to it reported 65% of the island defective at a suspiciously
// constant 0.51-0.57m — a designed offset, measured as a bug.
//
// The real question is narrower: does the height a player is SEATED at match
// the logical ground at that point? Everywhere without a deck or an open
// ground storey those two must agree, and where they do not the player hovers
// or sinks. That is the class that produced "im in the ground" and the NW
// shore strip that stood 6-10m over a drawn sea (session 4f).
//
//   node data/standcheck.mjs            report, exit 1 if any cluster
//   STAND_LIMIT=0.6 node data/...       loosen the tolerance
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const SCENE = process.env.SG_SCENE || 'sentosa';
const LIMIT = +(process.env.STAND_LIMIT || 0.4);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error: ' + e.message));
await page.goto(`http://localhost:${PORT}/?district=${SCENE}&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000, polling: 300 });

const res = await page.evaluate((limit) => {
  const T = window.__terrain;
  const out = [];
  let sampled = 0;

  const pts = [];
  for (const r of (window.__data.roads || [])) {
    if (!r.p || r.p.length < 2) continue;
    for (let i = 0; i < r.p.length - 1; i++) {
      const a = r.p[i], b = r.p[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const L = Math.hypot(dx, dz) || 1;
      const nx = -dz / L, nz = dx / L;
      for (let t = 0; t < L; t += 8) {
        const x = a[0] + (dx / L) * t, z = a[1] + (dz / L) * t;
        const half = (r.w || 6) / 2;
        pts.push([x, z], [x + nx * (half + 1.5), z + nz * (half + 1.5)]);
      }
    }
  }

  for (const [x, z] of pts) {
    // ASKED THE WAY A PLAYER ASKS IT. __surfaceAt with no height answers with
    // the HIGHEST registered surface at that point whatever the walker is
    // standing on, so the moment the island grew raised decks — the cable car
    // station platforms, 12m up — this reported the deck as the ground under
    // the footway running beneath it. Two of the worst offenders were exactly
    // that: 12.15m of "hover" at Siloso Point and 11.91m at Sentosa station.
    //
    // No player can reach those: walkSurfaceAt is height-aware and refuses a
    // surface that is not within a step of where the walker already is. So ask
    // from the LOGICAL GROUND here, which is where a player on this way is.
    // Same fix trailcheck's N3 got, for the same reason, on the same day.
    const g0 = window.__terrain ? window.__terrain.at(x, z) : null;
    const s = window.__surfaceAtFrom && g0 != null
      ? window.__surfaceAtFrom(x, z, g0)
      : window.__surfaceAt(x, z);
    if (!Number.isFinite(s)) continue;
    // A DECK IS ALLOWED TO BE ABOVE THE GROUND — that is what a deck is. Only
    // ask the question where the player is standing on the ground itself.
    if (window.__anyDeckAt && window.__anyDeckAt(x, z) !== null) continue;
    // ...AND ONLY WHERE A PLAYER CAN ACTUALLY STAND.
    //
    // The first run of this reported 64% of samples "hovering", which is not a
    // defect rate, it is a broken measurement. Most of them were the verge
    // offsets beside the causeways: 1.5m outside the deck is open SEA, where
    // vertexY is the sunk sea bed (-1.75) and surfaceAt is the road you are
    // on. Nobody can stand there and nothing is wrong. Water and solid walls
    // are both excluded, so what is left is ground a player can be on.
    if (window.__inWater && window.__inWater(x, z)) continue;
    if (window.__blockedAt && window.__blockedAt(x, z)) continue;
    // an open ground storey is a floor above the ground, on purpose
    if (window.__openGround && window.__openGround(x, z)) continue;
    sampled++;
    const drawn = T.at(x, z);
    if (!Number.isFinite(drawn)) continue;
    const gap = drawn - s;
    if (Math.abs(gap) <= limit) continue;
    out.push({ x: Math.round(x), z: Math.round(z), gap: +gap.toFixed(2),
      drawn: +drawn.toFixed(2), stand: +s.toFixed(2), name: '' });
  }
  out.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  const seen = [], clusters = [];
  for (const o of out) {
    if (seen.some((q) => Math.hypot(q.x - o.x, q.z - o.z) < 60)) continue;
    seen.push(o); clusters.push(o);
    if (clusters.length >= 24) break;
  }
  return { sampled, bad: out.length, clusters };
}, LIMIT);

const pct = res.sampled ? (100 * res.bad / res.sampled).toFixed(2) : '0';
console.log(`  standcheck: ${res.bad} of ${res.sampled} points on and beside the ways `
  + `(${pct}%) stand more than ${LIMIT}m off the logical ground under them`);
for (const c of res.clusters) {
  console.log(`     ${c.gap > 0 ? 'SUNK  (ground above you)' : 'HOVER (ground below you)'}`
    + ` ${Math.abs(c.gap).toFixed(2)}m  at (${c.x},${c.z})  drawn ${c.drawn} stand ${c.stand} ${c.name}`);
}
await browser.close();
if (res.bad) { console.log('  standcheck FAIL'); process.exit(1); }
console.log('  standcheck ok');
