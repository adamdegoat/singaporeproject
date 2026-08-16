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
  // THE KNOWN DEFECT IN THIS FRAME IS FIXED, 2026-08-16 (same day it was
  // recorded). The grey wedge was Beach Station: FOUR overlapping footprints
  // all named "Beach Lrt Station (s4)", each growing its own pitched roof at
  // its own oriented-box angle, and the ridges collided. Segments of one
  // building that the map gives one NAME no longer roof themselves
  // independently — see the note at `_overlapped` in city.js. This baseline is
  // the clean one; the station reads as a building and the promenade behind it
  // is visible again.
  ['beach-walk',     -1700, 12722, -1.6],
  // RE-AIMED 2026-08-16: the old spot's view of the globe had been walled
  // in by later builds — the frame showed a service wall and monorail and
  // NO globe, so the one landmark this frame is named for was unwatched
  // (a duplicate silver globe shipped over the real one and every golden
  // passed; found by eye, not by the gate). This stands on the plaza with
  // the globe's basin, sphere and gold ring in frame.
  ['rws-globe',      -1330, 12192, -2.45],
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
  // THE COVE CANAL, shipped WITH its pass (2026-08-15, the standing habit).
  // The moats around Pearl and Sandy Island draw as tidal water at last —
  // the DEM-witnessed carve in terrain.js vertexY — and not one of the 24
  // frames above so much as glances at Sentosa Cove: all 24 came back
  // 0.000% through the change that turned 850,000 m2 of drawn grass into
  // sea. Stands mid-crossing on the Sandy Island access bridge, deck
  // underfoot, canal both sides, the island's bungalow bank ahead — the
  // geometry and the water this batch moved, all in one frame.
  ['cove-canal', 745, 13460, 1.5708],
  // THE USS RELIEF VOCABULARY, shipped WITH its pass (2026-08-15). The
  // harlequin lamps line Far Far Away's paths and no frame watched that
  // zone's interior at street level; the Egypt obelisk shows in uss-lagoon
  // at 0.087% — inside the 0.1% gate, which batch 2 already ruled is not a
  // watchdog. This stands on the FFA path among the lamps, facades behind,
  // where the zone's next vocabulary (battlements, beanstalks, the castle)
  // will also land in frame.
  ['ffa-street', -1066, 12372, -1.83],
  // MINION LAND, shipped WITH its rebuild (2026-08-15, the standing habit).
  // The zone went from stale Madagascar boxes in banana-yellow to the
  // researched build: Gru's navy crooked gable against the sky-blue cloud
  // wall, the cream neighbour row, the lilac castle arch with white-tipped
  // teal spires, the rainbow carousel canopy on the old King Julien
  // footprint, Silly Swirly on the lagoon shore and the balloon masses.
  // This stands on the Fun Land grass east of the carousel and reads all
  // of it in one frame — the vetted d-lagoon vantage. uss-lagoon sees the
  // zone only across 200m of water; this is the watchdog AT the zone.
  ['minion-land', -1120, 12345, -2.0],
  // ANCIENT EGYPT'S §4.8/§4.10 INCREMENTS, shipped WITH their pass
  // (2026-08-15): the Anubis parapet heads, the excavation camp (crates,
  // jeep, jib crane) and the papyrus shore. The 'ancient-egypt' frame came
  // back 0.000% through the whole batch — it looks down the avenue and
  // none of the new pieces enter it — the standing lesson, again. This
  // stands west of the zone with the camp, the parapet line and the
  // obelisk shore all in frame (the vetted e-far vantage).
  ['egypt-camp', -1290, 12420, 0.87],
  // THE COLOSSI COLONNADE (§4.B, "the shot people take"), shipped WITH its
  // pass (2026-08-15). All 28 frames above passed at gate level through
  // the batch that built six atlantid figures — egypt-camp stands 165m
  // away and cannot resolve them. This stands on the walk at the Lost
  // World boundary looking back along the file of figures, with the
  // parapet heads and the obelisk behind — the vetted c2-fromlw vantage.
  ['egypt-colossi', -1098, 12488, -1.75],
  // THE FFA CASTLE REWORK (§6.A), shipped WITH its pass (2026-08-15):
  // drum towers with machicolation bands, terracotta cones, gold finials,
  // scarlet pennants, and the crowned central tower on Lord Farquaad's
  // Castle. Only uss-lagoon saw it, at 0.34% across 200m of water. This
  // stands on the lagoon's south-west shore with the whole castle skyline
  // in frame. The first two placements were IN the lagoon (the rider on
  // water, chest-deep camera — the waterline lesson again); this point is
  // point-in-polygon-tested dry.
  ['ffa-castle', -1145, 12428, 2.39],
  // THE LOST WORLD §5A OPENING INCREMENTS, shipped WITH their pass
  // (2026-08-15): the lashed X-brace pole facades (the zone's single
  // strongest motif), the giant hollow trunk in the Canopy Flyer plaza,
  // the teal ventilator cupola on Discovery Food Court. ALL 30 frames
  // above passed through the batch — nothing watches this zone's
  // interior. (A Jurassic timber gate was built and REMOVED: the boundary
  // walk gave its guards no clear site — the pylon precedent.) This
  // stands inside the zone with the braced Rapids frontage in view.
  ['lostworld-timber', -1075, 12520, 0.7],
  // SCI-FI CITY §3, shipped WITH its pass (2026-08-15): the canted wedge
  // overhangs with safety-orange soffits, mid-face ports and louvre
  // groups on Battlestar Galactica — the only zone mass both in-park and
  // tall enough to take them (Mess Hall sits outside the surveyed park
  // ring; the ring guard exists because 240m from this zone's anchor is
  // the Amara Sanctuary Resort). Stands on the avenue facing the station.
  ['scifi-station', -1300, 12590, 2.74],
  // THE BOULEVARD AWNING RHYTHM (§1 Hollywood teal / §2 New York red) and
  // §2.4's arcaded loggia, shipped WITH their pass (2026-08-15). This
  // stands square to the Transformers block's return, both awning rows
  // across the brick in frame — the vetted bw2-tf-short vantage. The
  // loggia edge carries NO awnings (the first build interleaved them).
  ['newyork-awnings', -1413, 12430, 0.87],
  // WATERWORLD §5B, shipped WITH its pass (2026-08-15): the skyline
  // catwalk gantries, the flared watchtower + fabric canopy, the rusted
  // fuel tank, against the verdigris arena. The arena is CLOSED in life
  // through 2026 — the venue is built, the show is not. Stands SE of the
  // stadium with the gantries on the skyline — the ww2-se vantage.
  ['waterworld-arena', -880, 12580, -2.27],
  // EGYPT'S WALL VOCABULARY (§4.4/§4.6/§4.7 — lotus columns, niche
  // pharaoh, winged sun-disc), shipped WITH its pass (2026-08-15). All 34
  // frames above passed through the batch: the columns stand on each
  // mass's LONGEST face and neither Egypt frame looks at one. Stands at
  // the 1408 show building's east face where the colonnade reads — the
  // vetted e-1408 vantage.
  ['egypt-columns', -1120, 12500, -1.24],
  // THE TANJONG RIMAU INTERTIDAL FLAT (research/tanjong-rimau.md §6.3),
  // shipped WITH its pass (2026-08-15): boulder and cobble scatter, algal
  // pads and outcrop clusters in the measured water fringe along the EIA
  // arc — drawn dressing only, heights untouched per the brief's verdict.
  // No frame watched this coast (waterline stands 600m east at Siloso).
  // Stands on the cliff over the arc's south stretch. KNOWN IN-FRAME:
  // grey background masses across the strait float at the horizon — a
  // PRE-EXISTING background-layer artifact (A/B'd against the pre-batch
  // world), not part of this pass.
  ['rimau-shore', -2860, 11990, -2.2],
  // SERAPONG/TANJONG GOLF FURNITURE, shipped WITH its pass (2026-08-16):
  // greens with flags and sand bunkers inside the club's mapped polygon —
  // the sweep's likeness verdict was "never reads as a golf course". All
  // 36 frames above passed through the batch; nothing watches the course.
  // Stands on the cart path with a flagged green across the fairway.
  ['serapong-golf', -450, 13120, 0.46],
  // THE PALE-STONE PHANTOM, shipped WITH its fix (2026-08-16). `MAT.paleStone`
  // never existed — paleStone is on LMAT — so three.js drew every piece that
  // asked for it with its DEFAULT material: unlit, unmapped white. That is two
  // of every three Sentosa Cove villa roof slabs and every solid fence and
  // garden wall on the island, wrong for as long as the Cove has been built.
  //
  // ALL 37 FRAMES ABOVE PASSED THROUGH THE FIX AT 0.000%. An island-wide white
  // defect, filed by three separate sweeps as "raw white placeholder
  // geometry", was invisible to every golden this project owns — because not
  // one of them looks at a Cove villa or at a garden wall. These two do.
  //
  // `cove-villa` stands in the villa street between two oversailing slabs,
  // with a third villa's terracotta pitch across the way (the 1-in-3 branch of
  // the same recipe, so both roof forms are in one frame).
  ['cove-villa', 1300, 12620, 0.6],
  // `tanjong-wall` fills a third of frame with the solid boundary wall that
  // was the other half of the same bug — this is sweep frame 072's own
  // vantage, the one whose white slab opened the hunt.
  ['tanjong-wall', -871, 12867, -2.12],
  // THE COVE BERTHS, and this frame exists because the gate MISSED them.
  //
  // 2026-08-16: the Cove's private jetties were seated on TERRAIN.at(), which
  // SESSION 20 leaves uncarved across the whole district, so 88 of them stood
  // on a bank that is not drawn — measured at 15-20m over their own water. The
  // fix moved 88 decks and **all 39 goldens passed it, 0.000%**: not one frame
  // looked at a berth. `cove-canal` sees the two nearest and did not move.
  //
  // That is the same hole the pale-stone phantom fell through this morning, so
  // it gets closed the same way. Stands on the bank of the Cove channel with
  // the berth row in view — 18 of them within this reach, the densest run on
  // the island — where a deck back on the wrong datum would be unmissable.
  ['cove-berths', 530, 13700, -0.4],
  // SKYPARK SENTOSA, and it is here because NOTHING WATCHED IT. A 50m landmark
  // stood behind Siloso Beach as a featureless tan box for the life of this
  // project — its recipe never matched its name — and all 40 frames passed the
  // day it was replaced by two lattice towers and a skybridge, at 0.000%. A
  // gate that cannot see the biggest object on the beach is not watching the
  // beach. Looking inland from the sand, which is the tourist's own view of it.
  ['skypark', -2270, 12380, 2.50],
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
