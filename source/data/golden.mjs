// GOLDEN IMAGES — the only audit that catches a VISUAL regression without a
// human looking at the right frame at the right moment. The ground shader
// silently never ran for the project's whole life (consolidate dropped
// onBeforeCompile) and "a giant blank untextured mass" was hunted in the
// geometry twice; this gate would have failed the first deploy that shipped it.
//
// Cheap here because the world is deterministic for a fixed camera: no time
// uniforms, no scrolling textures, position-hashed clouds, RNG seeded, people
// and traffic opt-in, and the #c canvas carries no HUD. Twelve fixed
// viewpoints, canvas-only PNGs, compared by data/golden_compare.py (PIL +
// numpy: per-pixel threshold 0.1, fail when >0.1% of pixels differ — the
// three.js e2e constants). Baselines live in golden/, committed; update them
// only with --bless, which is a diff someone reviews.
//
//   node data/golden.mjs            shoot + compare, exit 1 on any mismatch
//   node data/golden.mjs --bless    shoot + adopt as the new baselines
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const GOLD = join(ROOT, 'golden');
const ACT = join(GOLD, 'actual');
const BLESS = process.argv.includes('--bless');
const PORT = process.env.SG_PORT || 8933;

// the money shots: every big authored read and every place a regression has
// actually happened. Add a spot when a new pass ships; bless updates follow.
const SPOTS = [
  // `central-beach` WAS CALLED `spawn` UNTIL 2026-08-07, and the name had been
  // wrong since 2026-08-05, when the player's start moved to Palawan Beach on
  // the owner's ask. A frame named for the first thing a player sees, pointed
  // somewhere no player starts, is the kind of stale label this project keeps
  // paying for — every note about it in this file since then reasons about
  // "the spawn frame" and means this one. It is a good viewpoint and it stays;
  // it just says what it is. The real start now has its own frame, below.
  ['central-beach',  -1800, 12740, -0.6],
  ['siloso-letters', -2410, 12190, -2.1],
  ['siloso-lagoon',  -2231, 12610, 0.6],
  ['groyne-islet',   -2450, 12420, -0.9],
  ['arrival-causeway', -1050, 11700, 0.02],
  ['fort-siloso',    -2721, 11967, -0.8],
  ['headland-sea',   -3150, 11700, 1.12],
  ['imbiah-trail',   -2070, 12300, 0.4],
  ['beach-walk',     -1700, 12722, -1.6],
  ['rws-globe',      -1349, 12210, -0.2],
  ['sensoryscape',   -1420, 12480, 0.6],
  ['serapong',       7, 12890, 2.4],
  // the owner's own 2026-08-04 screenshot spot: the guideway must never fly
  // unsupported down Gateway Avenue again
  ['gateway-viaduct', -1700, 12690, -0.5],
  // ...and his 2026-08-05 one. Siloso Beach Walk is tagged bridge=yes in OSM
  // over what is really a culvert, so it was drawn as a flat deck at
  // max-terrain+1.2 with no piers under it: a tan carriageway and its double
  // yellows floating a metre over the grass, which is the frame he sent. None
  // of the thirteen viewpoints above covered it and all thirteen passed while
  // it was broken.
  ['beachwalk-grade', -1580, 12729, 0.9],
  // THE THREE VESSELS HAD NO GOLDEN AT ALL. They were rebuilt on 2026-08-06 —
  // three distinct materials, profiles and infills replacing one tan basket
  // repeated three times — and all fourteen frames above passed at 0.000%
  // through every step of it, because not one of them can see a vessel. The
  // 'sensoryscape' spot looks down the AVENUE, 200m short of the first one.
  // Same argument, and the same wording, as beachwalk-grade directly above.
  ['sensory-vessels', -1629, 12541, -0.53],
  // the south gate, looking back up the walk — same reason as the line above,
  // and it is the first thing a player coming up from Beach Station sees
  ['glow-garden', -1707, 12698, 2.80],
  // NO FRAME COULD SEE THE WATERLINE, and the owner is the one who found that.
  //
  // 2026-08-06: "all the coast touching water are jagged?" — and he was right,
  // and it had been that way for as long as the island had existed. The drawn
  // skin fell off a 3 m cliff at the 1.2 m contour, so the sea met the land in
  // a staircase of mesh triangles. Fixing it changed the look of every coast
  // on the island and ALL SIXTEEN FRAMES ABOVE STAYED AT 0.000%: every one of
  // them is a ground-level view pointed inland or along the shore, and not one
  // of them has the water's edge in it.
  //
  // Third time this argument has been written in this file (beachwalk-grade,
  // sensory-vessels, and now this), so it is worth stating as a rule: A GOLDEN
  // SET IS ONLY AS GOOD AS WHAT ITS CAMERAS CAN SEE, and "all frames passed"
  // means nothing about a thing none of them is looking at. This one stands on
  // Siloso and looks down the waterline, which is where the staircase was.
  // MOVED 15 m LANDWARD 2026-08-07, and it is the same correction
  // `wings-grandstand` took the day before. This stood 14 m OUTSIDE the
  // surveyed coastline and only ever photographed dry sand because the
  // heightfield kept a 31.5 m lip of Copernicus's smeared shore above sea
  // level out there; with the lip gone the camera is chest-deep in the strait
  // and the frame is a wall of water. It now stands on Siloso Beach's own
  // mapped sand, which is 100% inside the ring, and still looks down the
  // waterline — which is the whole point of it.
  ['waterline', -2226, 12447, -1.05],
  // ...AND NOTHING COULD SEE UNIVERSAL'S SHOW BUILDINGS EITHER. Ancient Egypt
  // got a cavetto cornice and a battered plinth on 2026-08-06 — seven crowned
  // buildings, new geometry on the largest footprint in the park — and all
  // seventeen frames stayed at 0.000%. `rws-globe` looks at the globe from the
  // Waterfront and no camera stands inside the park. Written the same day as
  // the waterline note above, which makes it the FOURTH time, so the habit is
  // now: ship a frame WITH the pass, not after somebody notices.
  // Stood 5 m from a 24 m wall on the first attempt and came back SOLID BLACK
  // across two thirds of the frame — which is not a broken build, it is this
  // file's own oldest trap: a surface closer than the near plane is a black
  // wall, and main.js's _BOOM_MIN note records the 2025-08-05 RWS golden that
  // taught it. A golden vantage has to stand where a VISITOR stands.
  ['ancient-egypt', -1232, 12468, 0.86],
  // THE LAGOON UNIVERSAL IS BUILT AROUND, invisible until 2026-08-07: the
  // `y > 1.2` guard handed back the LAND height inside every inland water ring,
  // so 87% of the island's ponds were drawn as ground over their own water.
  // Eighteen frames passed at 0.000% through the fix. Fifth time this file has
  // needed the same sentence in one night, so: SHIP THE FRAME WITH THE PASS.
  ['uss-lagoon', -1250, 12340, 1.14],
  // SIXTH AND SEVENTH TIME, so these two ship WITH their pass rather than
  // after it (2026-08-07).
  //
  // `adventure-cove` stands on the water park's deck. Adventure Cove is one
  // OSM way carrying both `leisure=water_park` and `landuse=recreation_ground`
  // and it was read as the landuse: 50,434 m2 of it drew as a bright green
  // LAWN with 126 scattered trees, slides standing in grass and three ride
  // labels floating over it. No existing camera can see the RWS quarter's
  // ground at all — `rws-globe` looks at the globe from the Waterfront.
  ['adventure-cove', -1760, 12060, 2.28],
  // `wings-grandstand` stands on the beach in front of the Wings of Time
  // seating bank and looks up it. `building=grandstand` had been in the scene
  // data since the building layer was written and was read by NOTHING, so the
  // second-nearest structure to the spawn point drew as a 20.4 m solid slab.
  // `spawn` DOES see it — that frame went 45% red the moment a rebuild removed
  // the stale open-ground storey that had been half-hiding it — but the spawn
  // camera looks past its end. This one looks AT it.
  // Stands at the LOW (south-east) end of the bank and looks up the whole
  // 140 m arc. The first placement stood square to mid-span and put the
  // structure at the right-hand edge with a grass slope filling the middle:
  // the chase camera sits behind and above the rider, so a spot chosen by
  // "square to the thing" is not the view it gives you. Looking ALONG a long
  // structure fills the frame however the camera trails.
  // KEPT HERE after the 2026-08-07 terrain fix, having tried twice to re-aim
  // it. With the bank now level at beach height this frame shows its REAR
  // elevation rather than the rows, so two seaward spots were shot to get the
  // rake in view: (-1880,12820,2.32) put the Wings of Time stage block across
  // the whole frame, and (-1902,12774,1.72) pushed the bank into the top-left
  // corner. Both were measured with lookat.mjs first and both still came back
  // wrong, because THE CHASE CAMERA TRAILS FURTHER THAN A FREE CAMERA AT THE
  // SAME POINT — the same trap as the original "square to the thing" placement
  // noted above. This spot does photograph the structure. Re-aim it when the
  // stage is rebuilt from the block it is now, and shoot it through golden.mjs
  // rather than lookat.mjs.
  // MOVED 2026-08-07 because the old spot is now IN THE SEA, and that is the
  // survey's answer rather than a bug: the beach in front of this bank is only
  // ~35 m deep, and the camera stood 40 m out. It photographed dry sand only
  // while the stage's footprint was holding a grid cell dry that OSM's
  // coastline calls water. The rider came back submerged to the helmet.
  // This one stands on the sand at the bank's own foot and looks up the rows.
  ['wings-grandstand', -1830, 12780, 2.554],
  // THE FIRST FRAME OF THE GAME, and it had no golden at all until now.
  // main.js SPAWNS is {sentosa: [-1241.7, 12973]}, snapped to Palawan Beach
  // Walk's carriageway; this stands on that point with the heading the road
  // gives it. Twenty-one frames watched the island while the one view every
  // single player is guaranteed to load into was covered by none of them.
  ['spawn', -1241.7, 12973, 0.365],
  // THE WINGS OF TIME STAGE, shipped with its pass. Nothing could see it: the
  // nearest camera is `central-beach`, which stands BEHIND the seating bank
  // with the bank filling the frame, so the set the whole venue points at was
  // off-screen the entire time it was a 4 m tan box on the water. Stands on
  // the sand at Central Beach and looks straight out at it.
  // MOVED 2026-08-07, same reason as `waterline` above: it stood 5 m outside
  // the surveyed coastline, on lip, and is now in the strait. Moved NW along
  // the beach rather than straight back, because straight back is the rock
  // revetment the research says this corner pinches out on and the boulders
  // filled the frame. It now stands on the deep end of centralbeach.py's own
  // authored sand and still looks straight out at the stage.
  ['wings-stage', -1858, 12757, 0.15],
  // NO FRAME COULD SEE A BRIDGE ABUTMENT, and that is the fifth time this
  // argument has been written in this file. On 2026-08-14 the approach-ramp
  // rule changed — a run's own highest landing had been exempt from its ramp
  // by construction, so 60 abutments on sentosa, 26 on marinabay, 9 on
  // harbourfront and 5 on keppel all changed shape in one batch — and ALL
  // TWENTY-THREE FRAMES ABOVE CAME BACK AT 0.000%. Not one of them has a deck
  // meeting the ground in it. `arrival-causeway` stands mid-channel and looks
  // along the water; `gateway-viaduct` watches the guideway from 900 m away.
  //
  // The abutment had to be vetted by hand instead (shots/street/ramp-*), which
  // is exactly the thing the golden set exists to stop being necessary. This
  // stands ON the causeway deck AT the Sentosa landing and looks down it, so
  // both carriageways and the point where the deck comes down to grade are in
  // frame — the geometry a ramp change moves.
  //
  // THE VANTAGE WAS CHOSEN BY MEASURING IT, not by looking at it. Five
  // candidates were shot with the old rule restored and again with the new
  // one, and the differences are not close: 54 m back up the deck reads
  // 0.119% — INSIDE the 0.1% gate by a hair, which is a frame that would have
  // shipped the regression back. From the landing itself it is 24.5%. The
  // others: 0.611%, 0.374%, 1.206%. A watchdog whose margin is 0.019% is not a
  // watchdog. Standing ON the surface under test means the camera moves when
  // the deck does, which is the same thing `beachwalk-grade` and `spawn` do
  // and is the whole point of it.
  ['gateway-landing', -1063, 12145, 0],
];

mkdirSync(ACT, { recursive: true });
const browser = await chromium.launch({ headless: true, args: [
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
] });
const page = await browser.newPage({ viewport: { width: 1152, height: 648 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.log('  page error during golden run: ' + e.message); });
// SG_XPARAMS appends extra URL params for A/B runs (e.g. planthash=1) —
// the baselines never change under it; compare the actual/ dirs instead.
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1`
  + (process.env.SG_XPARAMS ? `&${process.env.SG_XPARAMS}` : ''), { waitUntil: 'load' });
await page.waitForFunction(() => {
  const b = document.getElementById('boot');
  return window.__teleport && (!b || b.classList.contains('off') || b.style.display === 'none');
}, undefined, { timeout: 300000 });
await page.waitForTimeout(4000);
// the HUD carries fps and a build stamp — different every run by nature —
// so the UI chrome is hidden and the shot is the viewport (the #c canvas
// fills it). locator('#c').screenshot() also trips Playwright's stability
// wait on a live-repainting canvas; a viewport shot does not.
await page.addStyleTag({ content:
  '#hud,#place,#map,#maphint,#big,#friendsbtn,#modebtn,#vehiclebtn,#stick,#lookhint,#nettoast{display:none!important}' });

for (const [name, x, z, h] of SPOTS) {
  await page.evaluate(([x2, z2, h2]) => window.__teleport(x2, z2, h2), [x, z, h]);
  await page.waitForTimeout(1100);
  // Playwright's 30s default is a DEV-MACHINE timeout, not a world timeout.
  // On 2026-08-07 this threw four times in a row — an uncaught TimeoutError
  // that kills the process and takes every already-shot frame with it — while
  // the machine sat at load 14 with another browser and the window server
  // ahead of it. A gate that CRASHES under load is indistinguishable from a
  // gate that FAILED, and the run before it had passed at 0.000%. The frame is
  // still deterministic; it just has to wait its turn for a GPU that something
  // else is using.
  await page.screenshot({ path: join(ACT, `${name}.png`), timeout: 180000 });
}
await browser.close();

if (BLESS) {
  for (const f of readdirSync(ACT)) copyFileSync(join(ACT, f), join(GOLD, f));
  console.log(`   blessed ${SPOTS.length} golden baselines into golden/ — commit them`);
  process.exit(0);
}
// "HAS THIS SET EVER BEEN BLESSED", asked of the set and not of one spot's
// filename. It tested for spawn.png, so renaming that one spot on 2026-08-07
// made a set of twenty-one baselines report itself as no baselines at all and
// skip the comparison entirely — a gate that turns itself off when a camera is
// renamed, which is this project's own favourite bug wearing a new hat.
// A spot with no baseline yet is not an error either: golden_compare.py already
// reports it, and the whole point of adding a frame WITH its pass is that the
// other twenty still guard the build on the run that introduces it.
const haveBaselines = readdirSync(GOLD).some((f) => f.endsWith('.png'));
if (!haveBaselines) {
  console.log('   no baselines yet — run with --bless once, then commit golden/');
  process.exit(1);
}
try {
  execFileSync('python3', [join(HERE, 'golden_compare.py'), GOLD], { stdio: 'inherit' });
} catch {
  process.exit(1);
}
