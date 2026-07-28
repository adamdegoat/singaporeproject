# HANDOVER — state as of 2026-07-29

Read this block, then `STANDARD.md`. Everything below the line is the historical
record: read it when you need the reasoning behind a rule, not before starting.

## Live and green

Three districts merged into one region: **Orchard Road, Bras Basah, Marina Bay**.
2,155 buildings, ~6,000 roads, 2.0M m2 of water, ~30fps at 844x390 dpr2.
Deployed and hash-verified: https://adamdegoat.github.io/singaporeproject/

    node server.cjs                                  # dev server, :8933 -- START THIS FIRST
    SG_SCENE=<id> node data/audit_run.mjs            # 40 checks; id = orchard|brasbasah|marinabay|world
    SG_SCENE=world node data/behaviour.mjs           # 5 checks on how things MOVE
    SG_SCENE=world node data/defects.mjs             # 35 exploratory classes (NOT a gate)
    python3 data/unused.py                           # every OSM tag must be read/ignored/deferred
    python3 data/check.py <id>                       # the data gate
    node test/ride.test.mjs                          # ride model, no browser
    SG_SCENE=<id> node data/patchprobe.mjs           # eye-level ray audit of the drawn road surface
    bash data/tidy.sh                                # ALWAYS after a batch
    ./deploy.sh "message"                            # runs every gate, refuses to publish on regression

All gates pass on all four scenes. Do not trust that sentence -- run them.

## RESOLVED 2026-07-29: "yellow patches on the road" was the TERRAIN

The user could see it and four probes could not, because every probe compared
the bilinear height function `terr.at()` with a road built FROM `terr.at()` --
the input against the input -- and only ever at the CENTRELINE. The probe that
found it in one run raycast the DRAWN meshes from an eye-level camera
(`data/patchprobe.mjs`, kept).

It was three defects stacked, all the same disease -- **two different
approximations of the same surface drift apart between their shared sample
points**:

  1. **The drawn terrain diverged from `at()` by up to 32cm.** One vertex per
     35m cell, and a flat triangle sits up to |twist|/4 above the bilinear
     surface everything else is built against. The beige ground surfaced
     through the tarmac in smooth mid-cell blobs and swallowed the lane lines.
     Fixed in terrain.js: each cell subdivides by its own twist (1.5cm target,
     divisors of 24 so shared edges weld); `atDrawn()` replicates the drawn
     triangulation exactly and P8 now measures THAT, across the width, not the
     function it was sampled from.
  2. **The road ribbon was one flat quad across an 18m carriageway**, pinned to
     the ground only at its kerbs, so the (now accurate) ground still crowned
     through mid-width. ribbon() subdivides ACROSS into <=6m strips now, same
     as the 3m along-length rule.
  3. **On violently-curved DEM (Empress Place, tower-contaminated grade) no
     finite subdivision wins the arms race**, so the ground now GIVES WAY:
     Terrain.carve() drops drawn-terrain vertices inside any road corridor
     0.45m below the ground line, applied identically in build() and atDrawn().
     Invisible past the kerb; measured sag never exceeded 0.40m.

Fallout, all verified: P8 went 202-537 over budget the day it could see, then
to 0/0/19/(world remeasuring) once the world was fixed. **Orchard's T1
disagreement is resolved** -- the "190k-vertex merged tile 1.3m over Orchard
Boulevard" was the ROAD SURFACE (a deck over a dip), S7 was right to ignore it,
and T1 now carries the same by-name surface exemption P1b has; its ratchet is
CLOSED at 0 for orchard. Cost: ~+100k tris (terrain subdivision + road strips),
draw calls unchanged -- the scene is fill-rate bound and these add no fill.

NOTE, still true: three meshes are named `roadSurface` (asphalt at colour
#ffffff-with-dark-map, unit-paving #9a9184, concrete). Filter by material
colour, not by the first name match. That cost an hour twice.

## Also landed 2026-07-29, same session

- **Facade textures are mapped at real metre sizes EVERYWHERE.** The generic
  path multiplied metre UVs by metres (windows at 10/metre, averaging to flat
  colour); the tall-tower branch never scaled at all. Constant 1/(tile metres)
  now, autoUV() applies each material's `userData.tile` inside slab/extrude/
  merge so no recipe can forget, and an explicit uvMetres overrides by RATIO.
  Verified with landmark.mjs: Wisma Atria went from flat colour to a readable
  curtain wall.
- **A roof is not a facade**: flattenRoofUV() collapses extrude cap UVs to one
  spandrel texel; the aerial frame no longer shows window grids lying flat.
- **THE RED BUS LANES ARE IN.** Stitched per (street, side, width) into
  continuous runs (108 sub-30m fragments join their neighbours), one ribbon
  per run at 0.068 -- above every carriageway seed, below every marking, so
  dashes and arrows paint ON the red. Drawn red, not tinted: tinting the grey
  asphalt map topped out at maroon (texAsphalt takes a base colour now). No
  bridge decks. Polish left: break runs at junction mouths; the inner edge
  steps where a street's width changes.
- **Every texture has its own RNG stream** (the granite-panel rule, applied
  file-wide; parameterised textures fold args into the seed). Cost the
  sanctioned one-time reshuffle: W2 +2 per water scene, a crowd slot's shoes
  snapshotted at the imprecise Boat Quay bank -- no live walker is wet at any
  settled moment (measured 0 of 2,200 at t=0/6/14s) and spawn + walk-out
  guards now refuse water, so it cannot recur for a real reason.
- **The Centrepoint is built** (recipe wins its solo comparison): ~30m from
  storey math, dark mullioned curtain wall, the red gridded feature panel
  with the elliptical window on the Orchard face, white Cuppage skin.
- **orchardCentral placed its pockets and roof garden at ABSOLUTE y** -- the
  slab-vs-footing trap again, found because the aerial vet frame showed seven
  topiary balls hovering 30m over Somerset. All from footingY now, and bushes
  are rejected outside the FOOTPRINT (the oriented box lies; same as the fins).
- **Pedestrian railings verified unmapped, properly**: Overpass for five
  barrier values over the live bboxes -- 85 fence + 8 wall in Orchard, zero
  railing/guard_rail anywhere. The mapped ways are property boundaries. The
  claim is dated in accuracy.py and expires like the others.
### Overnight 2026-07-29: three landmarks researched by agent, two built

Research was run by Opus 5 subagents against published sources. **All three
reports corrected false premises in their own briefs**, which is the argument
for researching before modelling rather than after:

- **The Cathay — BUILT.** Gazetted National Monument (Cat 2, 2003); only the
  PODIUM'S FRONT FACADE is protected, so it is a free-standing screen. The
  vertical element is a **stepped ziggurat pylon**, broad and wall-like, NOT
  the thin blade fin the brief assumed. Render is **Shanghai plaster**, pale
  warm grey-cream — the widely-repeated "brown tiles" are a 1978 refacing that
  was REMOVED. No cinema (closed 2022), no street corner: symmetrical onto
  Cathay Forecourt, always seen across open paving. New build is a curved
  glass drum, published at **40m**, about twice the screen's height.
- **Liat Towers — BUILT.** **No curved corner** (nothing published or
  photographed shows one). **Hermès is FOUR storeys**, not a shopfront — 670m2,
  and RDAI's 2016 ivory ALUCOBOND shell ("Beige" + "Sparkling Ivory") wraps all
  four and turns the corner. It is a 1979 building with a 2016 face, not a 1965
  modernist tower. Tower signature is HORIZONTAL: a stone spandrel and a
  recessed dark ribbon per floor with the slab edge **projecting as an eyebrow**.
  The **bronze rider on the shop-box roof** is the #1 recognition cue (Singapore
  is only the second store worldwide to carry it outside). Height UNPUBLISHED
  in every source checked, so the mapped 45m stands — the recipe does NOT
  invent one from the 21 storeys.
- **313@Somerset — RESEARCHED, NOT BUILT.** Architect **Aedas** (not Broadway
  Malyan, who did the later lobby). **NO FINS and no angled panels** — the
  brief's premise was wrong. It is a strictly orthogonal flat grid of **fritted
  glass panels, pale silvery grey-green**, ~2 courses per storey, scattered
  with an **irregular field of small horizontal light slots** (1:4 to 1:5, at
  randomised offsets, only on a subset of panels) — these are 1,500+ LED light
  boxes, cool white, lighting by Speirs + Major. **7 above-grade storeys** (5
  retail + 2 car park behind the same skin), not 8. Ground floor is a **recessed
  colonnade of fat round columns** with a blue LED cove along the soffit.
  Identifiers: the **magenta "313 @somerset" panel at L2**, the L5 **Sky Terrace
  recessed slot** with hanging green columns and the "food republic" sign, and
  the **LED media screen at L2, west end**. Frontages **95m Orchard / 70m
  Somerset** are published; overall height is UNPUBLISHED (~35-40m derived).
  To build it: a mosaic texture with its own RNG stream is the whole job.

- **MacDonald House — BUILT.** National Monument No. 50 (10 Feb 2003) with the
  EXTERIOR FACADE protected. The report caught a bad figure in circulation:
  summaries calling it "79.5m, 17 storeys, first skyscraper in Southeast Asia"
  have confused it with the CATHAY BUILDING. It is **10 storeys, completed 2
  July 1949**, Reginald Eyre of Palmer & Turner for HSBC, site **140ft x 100ft
  = 43m x 30m**, sand-faced red brick from Alexandra Brickworks, flat roof laid
  with **green glazed Chinese tiles**. Height UNPUBLISHED, so the mapped 40m
  stands. Cues: the only large red-brick high-rise on Orchard Road; rooftop
  lettering; the white HSBC coat-of-arms centred on the brick; two full-height
  white stair strips; the cream stone colonnade. Its own texture
  (`texRedBrick`) maps one tile to one 3.9m bay by a 3.5m floor.
- **Peranakan Place — BUILT.** Researched partly from **three dated Wikimedia
  photographs (5 Apr 2024)**, because the written repaint history is mostly
  uncited and the sources disagree. Corrections that changed the build: it is
  **Chinese Baroque commercial shophouse, c.1902**, not vernacular Peranakan
  ("Peranakan Place" is a 1984 rename); the ground floor is a true **ARCADE**
  of round-headed arches on square fluted piers, not a five-foot way; Emerald
  Hill Road was **pedestrianised in 1981** so there is no junction; the parapet
  is an **open balustrade of dark bottle-green vase balusters** with the
  terracotta roof visible THROUGH it. Published: 6 two-storey shophouses
  fronting Orchard Road. Widths/heights UNPUBLISHED — the 24.8m frontage and
  ~8.7m height are OSM-derived and photogrammetric, and are labelled as such
  in the recipe rather than dressed up as survey. Two colourways exist (pink on
  Orchard, near-white up the lane) and `texPeranakan(white)` carries both.
- **A composition must be filtered as a SET.** MacDonald House has a ~4m
  setback, so one of its two stair strips stood over the carriageway and
  pruneCarriageway correctly deleted it — leaving its hood projecting 49m up
  over nothing. Each strip now tests its own ground and takes its hood and
  balcony with it. Same family as the taxi rank that kept its sign and lost
  its rail, except the leftover here is the part that makes no sense alone.
- **My own probe lied, the usual way.** The strip looked missing because the
  probe capped its output at 30 meshes and the traversal order cut the rest.
  Filter the probe, do not truncate it — "print the thing, not a number near
  the thing" applies to the harness as much as to the world.

### THE ONE OPEN BUG, found and NOT fixed: D36, and it is user-visible

**A pedestrian stands in the carriageway, right beside you, and stays there.**
Diagnosed 2026-07-29, unfixed, and this is the first thing to pick up.

D36 has been dismissed in this file before as "walkers mid-walk-out at the
instant of the snapshot, which is the correction working". **That is wrong, and
the test that proves it is the same one that cleared D33:** ride to one.

    node /tmp/d36b.mjs style probe -- window.__teleport onto the walker, then
    watch window.__crowdPositions() and window.__onRoad over five seconds

D33's overlaps clear within four seconds of the ride arriving. **D36's do
not.** Walker index 12 at 823,7271 on Orchard Road sat on the tarmac at 0-1m
from the ride for the whole five seconds and drifted 0.9m, when the walk-out
correction should move 1.1 m/s. The count also GROWS with time (7 to 18 over
7.5s), so it is accumulating, not settling.

What is ruled out, by measurement:

  * It is not the dodge/separation shift. Cancelling `shift` outright against
    a live road test changed nothing for walker 12.
  * It is not the clear-mask being coarse -- though that WAS a real second
    defect and is now fixed (see below). Fixing it did not move D36.

Where to go next: `pr.offWant` is set by the walk-out test and consumed by a
rate-limited step on `pr.off`. The walker is not moving at anything like
1.1 m/s, so either the test is not firing for this walker (check the
`(i + tick) & 7` stagger against however far `tick` has advanced) or `pr.off`
is being overwritten each frame by whatever recomputes the band. **Print
pr.off, pr.offWant and the drawn position for ONE walker across consecutive
frames** -- this file's own rule, print the thing rather than a number near
it, and note that `__crowdState()` and `__crowdPositions()` do NOT report the
same point, which is what made the first two probes disagree.

**Fixed on the way past:** the dodge guard trusted a clearance mask
precomputed at WHOLE-METRE offsets (`k2` is rounded and capped at 32), so a
kerb falling between two metres read as clear. It now also asks the road index
about the previous frame's DRAWN position, one-frame lag, target only -- the
rate limiter still owns the speed, so it cannot become the fourth teleport in
that file. Verified: B1 2.73 m/s, B3 0, 40/40 on orchard and world.

- **D33 is scoped to what can be seen, and it is a measurement.** Overlapping
  walkers existed only 816m-3.7km from the ride, NONE inside the 105m draw
  range; riding onto one cleared it in four seconds while it was still behind
  the camera. Separation runs at 120m against a 105m cull by design, and
  running it for all 2,200 was measured at five frames a second. The far count
  is PRINTED rather than dropped.

- **Next accuracy candidate, not started:** derive the street-tree species
  mix and spacing STATISTICS from trees.sg (cheeaun/sgtreesdata scrape is
  (c) NParks -- statistics are defensible, shipping their coordinates is not)
  and vary the side-street trees accordingly. Also: C8 reads 97% -- the
  STANDARD.md ratchet table was stale in both directions and is rewritten.

## Next after that

1. **D26 at 6 and D36 at 3** in `defects.mjs` -- both diagnosed and documented
   below; neither is worth another attempt without a new idea. (Orchard's old
   T1-vs-S7 disagreement is resolved -- see the top of this file.)
2. **Finish the bus lanes.** Data is carried on 274 ways. Drawn per-way they are
   red stains, because OSM fragments streets. Merge a street's tagged ways into
   continuous runs first -- the way process.py stitches Orchard Road's 28
   fragments into one centreline -- then lay one ribbon per run.
3. **Streaming and LOD before any fourth district.** The app loads the whole
   region at once. Measured: the island is 158,682 OSM buildings, ~83x what is
   loaded now. The plan and the numbers are in the expansion section below.
4. Still deferred, low yield: `addr:housenumber`/`addr:street`,
   `crossing:markings`, `kerb`, `roof:material`, `amenity`, `turn:lanes:*`.

## How this project works, in four rules

1. **Test the world, not the input to the world.** Seven checks have been found
   reading `data/*.json` instead of the built scene. If a check is green,
   confirm what it looks at.
2. **A failed search must skip, never substitute.** Returning the value you were
   asked to fix is the single most repeated bug here.
3. **A correction applied as a position change is a teleport.** Three times:
   17.6 m/s, 135 m/s, 4.75 m/s. Rate-limit it.
4. **Real data is usually already there.** `python3 data/unused.py` gates this
   now; it found 24 unread tags in Orchard on its first run.

---

# Start here

Read this, then `STANDARD.md`, then work. Current as of 2026-07-28, deployed and
hash-verified live.

## Where it stands

Live: https://adamdegoat.github.io/singaporeproject/ — **three districts**,
Orchard Road, Bras Basah and Marina Bay, merged into one region you can ride
between. 2,155 buildings, ~6,000 roads, **2.0M m2 of water**, 35fps at 844x390
dpr2. Marina Bay landed 2026-07-28 and brought the first WATER this project has
had, plus Marina Bay Sands, the ArtScience Museum, the Singapore Flyer, the
Merlion, the Fullerton and seven Supertrees.

Everything green:

| gate | what it covers | state |
|---|---|---|
| `SG_SCENE=orchard node data/audit_run.mjs` | 36 snapshot checks | pass |
| `SG_SCENE=world node data/audit_run.mjs` | the same 36, region budgets | pass |
| `node data/behaviour.mjs` | 5 checks on how things MOVE | pass, both scenes |
| `SG_SCENE=world node data/defects.mjs` | 35 exploratory classes | 16, diagnosed below |
| `node test/ride.test.mjs` | the ride model, no browser | 18 pass |
| `python3 data/check.py <id>` | the data gate, per district | pass, both |

**Pass `SG_SCENE` explicitly.** A bare `node data/audit_run.mjs` defaults to
`scene=orchard` and prints the header "== world audit" anyway, which reads as
though the region was gated when only one district was. deploy.sh has always run
both; a hand-run of the bare command has not.

Start the dev server first (`node server.cjs`), and run `bash data/tidy.sh` after
any batch — every gate drives a headless browser rendering at 60fps and one that
outlives its script holds two CPU cores indefinitely.

Done and from real data: layout, road widths from lane tags, one-way traffic,
terrain under every road, 671 crossings, bus stops, signals, MRT exits with their
real exit letters, 3,398 glazed shopfront bays carrying 257 named tenants at the
floor OSM puts them on, the Angsana avenue, 2,200 pedestrians and 90 vehicles,
collision built from the drawn geometry, and about two dozen buildings with a
researched design.

**What is NOT done**, in the order worth doing:

1. **Heights — the visible ones are DONE, and the headline number was a lie.**
   961 of 1,918 are still a type default, which sounds like the biggest gap in
   the project and is not. Only **23 of them front a main street at all**; the
   rest sit behind something and are never seen. Of those 23, only 7 are named,
   and a nameless footprint has nothing to look up.
   
   Four were researched and entered on 2026-07-28: 268 Orchard 30 -> **70m**
   (published as 69.60m), South Beach Residences 40 -> **153m** (45 storeys),
   Carlton Hotel 55 -> **83m** (26 floors), NoMad Singapore 18 -> **63m** (19
   storeys, WOHA, on the former 8-storey Faber House site, opening 2027).
   Orchard Rendezvous was checked and left alone: 17 storeys is about 54m and it
   already carried 55.
   
   What is left is Orchard Shopping Centre and Claymore Connect, for which no
   reliable figure could be found, and 16 unnamed footprints. **Measure which
   guesses are VISIBLE before treating a guess count as a backlog.**
2. **More districts.** The pipeline is proven and the seam holds. Little India is
   directly connected. But the app loads the whole region at once, so streaming
   has to come before the world gets much bigger.
3. **The 226 tenants off the built street network.** Little India, Selegie and
   Killiney have real shops in the scene file and no street to put them on,
   because the dressing stops 230m from an axis. That is a district-expansion
   job, not a shopfront one.

Everything above the line is correctness. Everything below it is making it look
more like Singapore. They are different jobs.

## The two researched landmarks, and a texture that could move a bus stop

**Ngee Ann City and Hilton Singapore Orchard are built.** Both were sitting in
this file as "researched but not built"; the research was re-checked before
building, and it corrected two things this file had recorded wrongly.

- **The 3.8m x 3.2m granite panels are the TOWERS' module, not the podium's.**
  archify.com/sg and raymondwoo.com: the podium is pre-cast wall clad with
  granite in situ, while "the 28 floors of twin towers are constructed of 3.8m
  by 3.2m granite pre-finished concrete wall panels".
- **The towers are granite, not glass.** "Twin brown polished granite towers";
  the complex is "totally faced with granite as a finish". They were being drawn
  as a pale grey-blue curtain wall, which on the widest frontage on Orchard Road
  was the single biggest recognition error in the district.
- The Great Wall is the architect's stated intent for the massing (Raymond Woo,
  "to reflect the dignity, solidity and strength of the Ngee Ann Kongsi") --
  a heavy wall with a projecting cap, not crenellation.
- **Hilton is two towers and which is which is a fact.** Wikipedia: it opened in
  1971 as The Mandarin, "a single 36-storey block facing Orchard Road", and
  "Tower Two, standing 40 storeys and 152m high, was added in the rear in 1973".
  So the TALLER one is further from Orchard Road. Verified after building: the
  144m tower measures 70.2m from the axis and the 152m one 99.6m.

**Ngee Ann City was also 14m too tall and its towers 33m too low, at once.** The
recipe hardcoded a 107m tower on a 31.6m podium, reaching 142.8m for a building
verified at 128.4m -- and it passed `31.6` as an ABSOLUTE y0 while the ground
here is 37m up, so the towers were embedded 27m into their own podium and topped
out at 123.8m. Both numbers are derived from `b.h` and `api.footingY(b.p)` now.
This is the slab-vs-footing trap already written up for Lucky Plaza's bubble
lift; **the same trap was in the vet tool itself**, which framed every building
as if the ground were at zero and so photographed the base of a 152m tower.

### Textures were never mapped at a real size, anywhere

Measured, not guessed, and wrong in both directions at once:

- **`slab()` boxes** carry 0..1 UVs per face, so one tile stretches over the
  WHOLE face. Ngee Ann's towers are 38m by 107m and texTowerGlass draws 12
  floors, so each "floor" band was **8.9m tall**.
- **`api.extrude()` masses** get three.js side-wall UVs, which come from raw
  vertex POSITIONS -- metres from the island origin. Measured uSpan **7147**
  across a 236m building: the tile repeats **once per metre**, so a 30m podium
  carried 240 floor lines and averaged out to flat colour.

`uvMetres(mesh, mH, mV)` and `uvMetresExtruded(...)` in landmarks.js fix it by
taking the size in metres explicitly, because "how big is a window" is a fact
about the building and not about the geometry. **Only Ngee Ann City and Hilton
use them so far.** Every other recipe is still mapped at the wrong scale, and
the generic facade path is worse -- `scaleUV(geo, per/26, h/28)` multiplies
UVs that are already in metres. That is the biggest open cosmetic item in the
project and it is a one-line change per call site.

### A texture must not be able to move a bus stop

Adding one procedural texture moved **T1 from 10 to 13** with no geometry
anywhere near the change: the three new findings were in Bras Basah, 1.5km from
the building the texture was for. Two rounds went into looking for what had
moved. Nothing had.

`tex.js` exports a single module-level seeded PRNG `R`, and `rand`/`pick`/
`chance` come off it -- but so does every placement decision in city.js,
street.js, actors.js, shopfront.js, markings.js, wayfind.js and sgdetail.js.
`texGranitePanel()` draws ~3,600 numbers at module load, **before any of them
run**, so the entire district reshuffled. It has its own stream now
(`rng(0x6e676163)`) and the ratchets went straight back to baseline.

**This is unfixed in general.** Every other texture still draws from the shared
`R`, so editing any one of them silently relocates street furniture across two
districts. The real fix is a private stream per texture, which costs a ONE-TIME
reshuffle of the whole world and a re-baseline of P1b, P4, P6 and T1 -- worth
doing deliberately, not as a side effect of someone retouching a facade.

### P1b 211 -> 76 and T1 10 -> 5, from three placement bugs

The note that P1b was "mostly traffic signal poles, arms and heads" was wrong.
Listing all 72 classes instead of the top 6 showed it was **MRT entrances**, and
one misplaced entrance is about twenty findings because its apron, glass shell,
six ribs, eight balusters and totem are each counted.

- **MRT entrances were walked out of malls and into the road.** The escape
  search asked only `isBlocked`, which is buildings and walls, and never asked
  about the carriageway -- the exact mirror of the bus-stop bug already recorded
  here as "pushClear knows roads, not walls". It also only searched when the
  ORIGINAL point was blocked, so an exit whose OSM node is in the road was built
  there untested, and it tested ONE point for a structure 8.6m across. **108 of
  the 211. All 19 entrances still get built and none was dropped to buy the
  number** (`window.__droppedMrt` is 0).
- **Footbridge stair towers** were laid out at a fixed `span/2 - 1.0` with
  nothing under them checked. The deck over the road is correct and stays
  exempt; the towers now search outward, per end, until their own footprint is
  clear. The first version searched both ends together and, when an end never
  cleared, left it at the LARGEST distance tried -- extending a 92m parapet
  across more road than it started with. A fallback that returns something worse
  than what it was asked to fix is pattern #1 in this file, and I wrote a fresh
  one into the fix for it.
- **The waiting cab at a taxi rank** was hung 2.6m toward the road, unchecked. A
  rank is a lay-by, so the cab is sited at the kerb or the rank is built without
  it (`ranksWithNoCab`).

Cost: **1740k triangles and 603 draw calls, against 1742k and 613 before** --
ten fewer draw calls, because entrances that used to be built in the road are
now built where they can be batched with their neighbours.

### Then P1b 76 -> 28, and most of that was the check, not the world

The "53 building masses standing in carriageways" turned out to be almost
entirely an artefact of the check, and finding that out cost two wrong theories
that are worth writing down so nobody pays for them again.

**Wrong theory 1: the edges were never cleared.** True, and nearly useless.
process.py clears VERTICES in three passes and nothing looks at the wall
BETWEEN two cleared vertices; audit_roads.py has printed "building EDGES inside
a carriageway: 106" the whole time. Clearing them the obvious way -- walk each
edge at a metre, push what is inside out to the kerb, insert it into the ring --
made things worse: 2,230 vertices across 125 buildings, the scene file 4%
bigger, and self-crossing footprints from 6 to 68 with 31 beyond a
single-vertex repair. **383 of the 413 crossings are into SERVICE roads**, which
is a hotel set-down or a loading bay under a porte-cochere, and the audit has
always skipped service roads while the fix did not. So it was shoving buildings
out of their own driveways. Scoped to real carriageways it inserts 144 vertices
across 5 buildings, keeps the ring-fold count at the baseline 6 by reverting any
building whose repair would fold it, and moves P1b by **2**.

**Wrong theory 2: our invented road widths are too wide.** Plausible -- the
accuracy ledger lists road width under INVENTED, there are three width tags in
the whole bbox and all three are on footpaths. It measures as false: only 2 road
samples in the region are drawn wider than the gap between the buildings either
side. **The test was also circular** and would have been worth little either
way, because the vertex passes have already pushed every vertex out to the
corridor boundary, so the gap is clear by construction. A measurement taken
after the thing that would hide the effect is not a measurement.

**What it actually was: P1b had a ceiling and no floor.** It skipped vertices
ABOVE ride height and never skipped ones below the ground. Buildings are seated
on `footingY` -- the lowest ground under the whole footprint, sunk 0.9m -- so on
a grade the uphill end is deliberately buried, a decision this file already
defends as "invisible from outside", and Orchard falls 46m. So the buried BASE
of a building was being counted as structure standing in a road: measured, **45
of the 51 building masses were underground, 36 of them by more than three metres
and one by 20.6m.** `pruneCarriageway` has always had that floor (`up < 0.3`)
and P1b never did, so the two have been disagreeing about the same geometry for
as long as both existed, and the prune is the one that is right.

Getting there took three passes of "print the thing, not a number near the
thing". The finding list is capped at 8 examples, so the first look at 13 T1
hits saw 8 and concluded none were near the changed buildings. Then a parallel
probe was written that measured 131 where the check said 53, because it was not
the check. Only reading the check's OWN hit heights answered it.

### P1b and T1 are CLOSED at 0, both scenes

Not ratchets any more: plain BLOCKERS at zero, so anything that puts structure
back in a carriageway fails the deploy. The last 28 was half world and half
check, and both halves are worth reading.

**The world half — five more places that placed geometry without asking.** Each
is the same shape as bugs already in this file, which is the point: the pattern
list works, it just had not been applied everywhere.

- **The taxi rank's queue rail**, six metres of it, hung off the sign at a fixed
  -0.9 and laid out before the rank was positioned. Third instance of
  build-then-place after the footbridge and the rank's own cab. It picks the
  pavement side now and tests the whole run; a rank with nowhere for it keeps
  its sign and loses its rail.
- **Footbridge stair towers** that could not land. Searching only outward
  dropped all 15 bridges, because several cross the Singapore River at Boat Quay
  where the clear ground is INBOARD -- their ends come down beside a road, not
  their middles. Searching both ways within 10m of the mapped end lands 13 and
  drops 2, and those 2 cross dual carriageways (New Bridge Road plus Eu Tong Sen
  Street 20m away) and would need 36m and 43m of invented deck.
- **Shophouse roofs, gables, awnings and colonnade columns**, all placed from
  the ORIENTED BOX, which for an irregular plan lies outside the walls. Fourth,
  fifth and sixth instance of the trap already recorded for Lucky Plaza's facade
  fins, the church roof and the library slab. A pitched roof whose eaves would
  reach over the road becomes the flat-roofed variant, which is built from
  grow() and pulls itself back.
- **The National Library's derived ring.** `side()` slides every footprint
  vertex sideways by 4m or more to split the block in two, and process.py had
  cleared the FOOTPRINT, not the ring that comes out of that. grow() cannot save
  it downstream either: its pull-back gives up at t=0.92 and then returns the
  vertex it was handed, which by then is the moved one.
- **And those three "held back" recipes were wired up all along.** The comment
  above them said "WRITTEN AND NOT WIRED UP ... they stay here, unreferenced"
  while the entries sat in the live `RECIPES` array. Re-judged with
  data/landmark.mjs rather than from the note: the library's recipe is clearly
  BETTER than the generic -- a blue block with sixteen projecting floor bands
  against a featureless pale slab, which is what the old note was actually
  describing. They stay, and the comment now matches the code. **A file that
  documents a decision it does not enforce is worse than one that says nothing.**

**The check half — it was counting four things that are not defects.** P1b
reported the ROAD SURFACE, the PAVEMENT, the TERRAIN and the PLAYER'S OWN
SCOOTER as structure standing in a carriageway. The scooter alone was nine
findings, for being on Orchard Road, in a project about riding a scooter down
Orchard Road. T1 had always said "a vehicle is not an obstruction" and P1b never
had the sentence; T1 in turn was the only check in the file that had never been
told service roads are set-downs, which was all four of its Orchard findings.
Each exclusion is by NAME (`playerRig`, `terrainSurface`, `roadSurface`,
`pavementSurface`) rather than by geometry signature, because this file already
records that a signature allowlist stops applying the moment a shape is retuned.

## Shopfronts, and the count that was lying

`src/shopfront.js`. The ground floor was a flat coloured band with a tenant name
board floating over it, and the stats said 1,642 named shopfronts were placed.
Two things were wrong with that, and neither could be seen in a single frame:

- **1,505 of the 1,642 boards were inside the masonry.** Each was drawn at the
  tenant's own map coordinate nudged 1.2m toward the nearest road, and a mall
  tenant's node is in the middle of the mall: median **9.2m past the facade**,
  p90 26.6m, worst 66.6m. 137 shop points fall outside a footprint at all. So
  the street read blank while the count read complete.
- **`level` was in the raw OSM on 1,043 of 1,718 tenants and was never carried
  into the scene file.** 253 are below the street and 376 above it, and all of
  them were handed a board on the street facade six metres up. **Fourth time**
  real data was present and unused: crossings, `sidewalk=`, `oneway=`, now this.
  `cuisine` (473), `brand` (469), `name:zh` (177) and `addr:unit` were sitting
  there too — `#01-15` is Singapore's way of writing the same floor number.

Now: **3,398 glazed bays over 19.1km of frontage, 257 of them a named tenant**,
with `name:zh` on the fascia where OSM has it. A bay is a lit panel, a bright
ceiling strip, a counter, a door, glass 34cm proud of it with real reveals, a
stall riser, mullions and a fascia. A tenant qualifies only if OSM puts it on the
ground floor AND its node is either its own small building or within 8m of its
host's facade; deeper than that it is in the atrium, and inventing a frontage for
it is inventing a shop. Everything dropped is counted by REASON in
`window.__stats` — 629 upstairs, 399 in an atrium, 226 off the built street
network, 50 with no footprint — because "382 have no frontage" hides whether the
rule is right or merely tight.

Cost: **+207k triangles, +47 draw calls, 38 to 36fps** at 844x390 dpr2 in a
spawned window. Bays stay out of the shadow map (`Merger.flush(world, {cast:
false})`) — they are fabric on a wall that already casts.

Four bugs found by the new checks, all the same shape as ones already in this
file:

- **The outward normal was chosen by comparing against the centroid**, which is
  only right for a convex plan. An L, a U or a courtyard has edges whose midpoint
  sits the far side of its own centroid, so the normal pointed INTO the building
  and the test "2.5m outside the wall" landed inside the shop. It steps off the
  edge and asks the footprint which side it is on now.
- **236 bays glazed the inside of their own light well.** The skip was written
  `if (o && o !== r.b)` — any building in front except this one, which is exactly
  backwards for a concave plan that folds back on itself.
- **One point per bay was tested against the carriageway while a bay is up to
  eight metres wide.** Centre clear, end in the traffic: 14 findings on P1b and
  5 on T1. Tested at its corners now. Identical to the canopy-post bug that put
  59 columns in the road.
- **S7 first tested every bay at the awning's reach**, and only a tenanted F&B
  bay has an awning: 445 failures against geometry that does not exist. Each bay
  records its own reach.
- **The bays were datumed to the building's footing and Plaza Singapura's sat
  1.5m under the pavement.** A footing is the lowest ground under the WHOLE
  footprint, sunk 0.9m, which is right for masonry — on a slope the uphill end
  is buried and nobody can tell. A shopfront is the one part of a building that
  meets the ground where a person is standing, so it takes the pavement in front
  of each bay. Same family as the bike sitting at terrain height while the
  tarmac is drawn 5.5cm above it: **the height a thing is DRAWN at and the height
  a thing STANDS on are two different numbers.**

  This one is worth dwelling on because no check caught it and no check could
  have: every gate was green, the count was right, S9 measures the profile's own
  internal height and a buried bay has a perfectly good one. It was found by
  fixing the CAMERA in `shopshots.mjs`, which had the same bug — the eye was set
  from the bay's sill rather than from the ground, so the harness was buried
  alongside the thing it was photographing and the two errors cancelled. A vet
  tool that shares a datum with the thing it is vetting cannot see that datum
  being wrong.

`data/shopshots.mjs` is the vet loop for this: it stands a person 9m in front of
bays that were actually built and photographs them. Three rounds of it fixed a
window that was a flat lightbox (one lit panel, no foreground), a black L where
the counter and the door were drawn on top of each other, and an awning that
read as a plank because it had no valance. **A shopfront cannot be judged from a
street-level frame** — at 30m it is a smudge, and the comparison sheet said it
was fine while it was a lightbox.

`data/fps.mjs` and `SG_EXTRA=noshops` on the audit runner are how the cost above
was attributed: build the world without one subsystem and diff the numbers.

## Street lamps too, and a ledger entry that was stale rather than wrong

Straight after the gantries, the same audit was run over every remaining
INVENTED line, because the gantry entry failed in a way that could not be a
one-off: it had concluded "not mapped" from checking ONE tag in ONE source.

- **Street lamps.** The ledger said *NOT MAPPED in OSM here (checked
  highway=street_lamp)* and put a lamp every 96 metres. **LTA publishes all
  126,144 lamp posts in Singapore** on data.gov.sg. 2,441 are in this region;
  1,881 are built, the rest skipped because they fall inside a carriageway we
  drew too wide or inside other geometry. `data/lamps.py`, wired into
  `build_district.py` exactly like the gantries. +60k triangles, draw calls
  unchanged at 603, P1 "props in a carriageway" still zero.
- **The central median entry was STALE, not wrong.** It read *continuous down
  the axis; needs dual-carriageway tags* long after `hasMedianAt` started
  following the one-way pairs OSM maps, which IS that fix. A hand-typed ledger
  goes stale in BOTH directions: it can under-report a finished feature as
  easily as it can flatter an unfinished one. The counts in this file are read
  from the scene for exactly that reason; these prose lines are not, and that is
  now the weakest part of it.

**Ledger: 21 of 28 feature classes real, up from 18 at the start of the day.**

The rule this establishes, and it is the important part: **"we checked and there
is no data" is a claim that expires.** Two of the three entries audited today
were false and one was stale. Re-audit the INVENTED list whenever you touch it.

## ERP gantries are REAL now, and "not mapped" was wrong a third time

The accuracy ledger said, in writing: *ERP gantries — NOT MAPPED in OSM here
(checked barrier=toll_booth): needs imagery*. Two were placed per axis at
arclengths 300 and 700, which is three invented numbers per gantry — where, which
way round, and how wide.

**LTA publishes every gantry in Singapore** on data.gov.sg under the Open Data
Licence (`d_753090823cc9920ac41efaa6530c5893`), and publishes them as
**LINESTRINGS** — the line is the span across the carriageway, so it carries the
position, the bearing AND the width. 15 of them are in this region.
`data/gantries.py` fetches and clips them; `build_district.py` runs it.

That is the third time "no data exists" has been false here, after the crossings
and the `sidewalk=` tags — and the ledger line records exactly why it was wrong:
**it had checked ONE tag in ONE source.** `barrier=toll_booth` is not in OSM, so
the conclusion was "not mapped". Checking one tag is not checking.

The dataset does not say which gantries are ERP and which carry EMAS signs — the
only attribute is a mostly-empty GNTRY_NUM. So each is cross-checked against the
`toll=yes` ways in our OWN extract, which is a fourth piece of real data that was
sitting unread: all ten near a built axis are within five metres of one. Nine in
Bras Basah failed that test and were skipped as sign gantries.

**Two things this round got right that are worth copying:**

- **The surveyed position is not nudged.** `erpGantry` pushes itself 18m clear of
  the carriageway, which was correct while its position came from a rule. A
  gantry's whole purpose is to span the carriageway, so a surveyed one skips
  that: pushing real data to the kerb is taking a fact and making it wrong.
- **But the LEGS are not surveyed.** LTA's line spans the CHARGED LANES and the
  road is often wider — a bus lane, a slip road, a junction flare — so legs
  planted at span/2 + 1.2 put six of thirty columns in live traffic. The centre
  and bearing are kept exactly; only the leg reach, which was always a
  construction detail, searches outward until clear, and builds nothing if nine
  metres is not enough. **Keep what is surveyed, adjust only what never was.**

P1b then jumped 135 to 179 because the antenna heads and the amber panel are now
over carriageways — which is what they are FOR. They join the exemption list
beside the traffic signal heads and the direction gantries, with the reason
written, and the legs deliberately do NOT. Net effect: Orchard's P1b ratchet
tightens **135 -> 124** and the region's **234 -> 211**, because fifteen surveyed
gantries with clear legs are cleaner than the two invented ones they replaced.

Ledger: **19 of 28 feature classes real, up from 18.**

## Other data sources: tested, and mostly a dead end. Do not redo this.

The 917 guessed building heights are the biggest remaining accuracy gap, so the
obvious question is whether a Singapore government source can fill them. The
answer, measured rather than assumed:

**URA's SDCP Building Height Control layer (data.gov.sg, Open Data Licence,
`d_ee8e2e0d13a50a699f9100029b8c0b0a`) is NOT a height source.** It is a planning
CONTROL, and it was tested against the 413 buildings in this district whose
height we already know from an OSM tag or a published figure:

- only **30% of real heights fall within +/-25% of the control**
- median error -12.2m: real buildings are usually well under what is permitted
- and **16% are TALLER than the control**, so it is not even a safe upper bound.
  Hilton Singapore Orchard is 152m in a 102m zone, Cairnhill Nine 130m in a 68m
  zone, Scotts Square 150m in a 102m zone.
- it covers only 32% of the guessed heights anyway

Using it would make the world less accurate AND would record a guess as real
data, which is the exact failure the accuracy ledger exists to prevent.

**The rest of the landscape, checked at the same time:**
- URA Master Plan building footprints and HDB Property Information: HDB only.
  Orchard Road and Bras Basah have essentially none. No use here.
- OneMap 3D: a viewer. The model cannot be downloaded.
- Google Maps / Earth / 3D Tiles: terms forbid extracting or deriving a model
  from them. Street View is legitimate as VISUAL REFERENCE by eye, which is what
  the comparison sheet already links to, and that is the only allowed use.
- No open LiDAR or aerial imagery exists for Singapore at all.
- trees.sg has real per-tree species, girth and height, but the only downloadable
  copy is a scrape (`cheeaun/sgtreesdata`) carrying "(c) NParks" and no reuse
  licence. Deriving the species mix and spacing from it and encoding that
  ourselves is defensible; shipping their coordinates is not.

**So OSM plus researched published figures is the best available source for this
district, and that is a finding, not a default.** The Urban Analytics Lab's own
guide to Singapore open data says OSM here has a relatively high level of
completeness for building heights and floor counts by international standards.
The way to close the remaining 917 is one building at a time from published
sources, the way the 49 hand-entered ones were done.

## A vet tool for landmark recipes, and the bug it found in all of them

`node data/landmark.mjs "lucky plaza"` renders the SAME building twice from the
SAME camera — once with its recipe, once with `?norecipe` forcing it through the
generic facade family — with `?solo=` building nothing else at all.

It exists because the rule needed a way to look. The rule is that a bespoke
recipe must be more recognisable than the generic family or it is a regression
and does not get wired up, and three recipes have been held back under it. But
judging a recipe inside a full street means fighting the street: four attempts
put the camera INSIDE the building, then BEHIND the block opposite, then on the
wrong mass, then behind the Angsana canopy. Every one of those was the harness,
not the world. **A vet tool that has to fight the scene will lose to it.**

It found real bugs immediately, and one is not confined to my recipes:

- **`slab()` and `crown()` take an ABSOLUTE y0** while every extruded mass is
  seated on `footingY`. Lucky Plaza's ground is 26m up, so its podium sat
  correctly on the hill and its bubble lift was drawn from y=0 — buried, with
  three metres showing. `api.footingY` is exposed now. **Any recipe mixing an
  extrude with a slab on sloped ground has this**, and Orchard falls 46m.
- **The tower was silently never drawn.** It was positioned from the oriented
  box, and for a plan this irregular the box centre lies outside the walls and
  over Orchard Road, so `slab()` refused it and said nothing. Third time this
  trap has been hit after the church roof and the library slab. It now searches
  candidate offsets and requires the point to be inside the FOOTPRINT.
- **The bubble lift was inside the podium.** `ob.halfShort` stops well short of
  the real facade on an irregular plan; it walks out from the centroid until it
  leaves the footprint now.

**And a measurement of mine was wrong in the same old way.** I counted "28 meshes
near Lucky Plaza, 5 above 40m" in the FULL world and concluded the recipe worked.
Those were its neighbours. The solo view showed a bare podium. Counting things
near a target is not counting the target.

## Two recipes, researched by agent and judged against the generic

**Plaza Singapura** and **Lucky Plaza**, from published sources; the reports and
their URLs are in the recipe comments in `src/landmarks.js`. Both were rendered
against their generic twin and both are clearly more recognisable, so both are
wired up.

Notable: height in metres is NOT published for any of the three buildings
researched — no skyscraper-database entry exists for a Singapore mall. Storey
counts are. And the research agent for The Centrepoint **corrected a false
premise in the prompt** rather than answering around it: there is no "Centrepoint
Suites", the residential is 66 apartments on floors 4-7 of the rear block.

**The Centrepoint is researched but NOT built.** Red gridded cladding panel about
three storeys tall with an elliptical window cut into it, dark tinted curtain
wall in a strong mullion grid, ground floor recessed under a flat canopy soffit,
white-painted concrete on the Cuppage elevation, tree-planted forecourt. 6
storeys plus 2 basements, opened Nov 1983, full-plot slab and NOT tower-on-
podium.

## Density: 460 to 2,200 people, 21 to 90 vehicles

Fourteen matched-angle frames of Orchard Road had ONE pedestrian visible between
them. The geometry can be right to the metre and an empty Orchard Road on a
Saturday afternoon still obviously is not Orchard Road, and this was the loudest
remaining thing in the comparison sheet by a distance.

**It cost nothing.** 36 to 38fps at 844x390 dpr2, 1.607M to 1.684M triangles,
draw calls unchanged at 610. Two reasons, both already in the code and neither
of them obvious: everyone beyond 105m is skipped before a matrix is written, so
a bigger population costs a path evaluation and one grid lookup per person per
frame and no draw work at all; and the whole fleet lives in seven InstancedMeshes
whatever its size, so 90 vehicles is the same seven draw calls as 21 was.

The population had been sized when the world was one district and 1.2km long. It
was never re-sized for 2.6km plus Bras Basah plus the side streets.

**The vantage frames cannot judge traffic density.** Vehicles recycle by distance
from the PLAYER, and `vantage.mjs` teleports the CAMERA while the player stays at
the spawn point — so every frame shows an empty carriageway however many vehicles
exist. The count is real (`window.__traffic().length` is 90); the frames just
cannot see it. Do not tune traffic from that sheet.

## The density round: five actor classes nothing could reach before

Raising the crowd from 460 to 2,200 and the fleet from 21 to 90 did not just
make the street busier, it made a whole family of defects REACHABLE. 21 vehicles
spaced over 2,586m cannot collide with each other by accident; 90 can. D33-D37
are that family, and four of the five found something.

- **Six pairs of pedestrians standing inside one another.** A body is half a
  metre across and two in the same place read as one smeared figure. Fixed at
  SPAWN by rejection sampling — twelve tries for a spot that is not in a road,
  not inside anyone else and not inside a wall, and no spawn at all if all
  twelve fail — plus a separation nudge at runtime against the previous frame's
  drawn positions.
- **Six pedestrians standing in live traffic without crossing.** The pavement
  band is an offset from a centreline and a carriageway is not the same width
  along its length, so a band that is on the pavement at one end is on the
  tarmac at the other. Same spawn rejection, plus a walk-outward correction for
  anyone the road widens under.
- **Eight vehicles inside other vehicles, every one of them at a red light.**
  The follow rule braked to a standstill at a gap of 4.5m BETWEEN CENTRES, which
  for an 11.8m bus is a car parked inside it. **A queue is where a controller
  that only reduces a speed goes wrong: unlimited time at zero speed to settle
  into the wrong position.** The stopping distance is the two half-lengths now,
  and the no-overlap invariant is ENFORCED after integration rather than braked
  towards.
- The first attempt at that enforcement was worse than the bug: each vehicle
  clamped against "the nearest thing in front", so three followers all clamped
  to the same leader and stacked at one point, 0.0m apart. **A queue has an
  order and the fix has to respect it** — sort the lane, walk it from the front.

And one probe was wrong before it was right, the usual way: **D34 measured
centre-to-centre distance and reported nine overlaps, every one of them a car in
one lane and a bus in the next.** A road is not a plane, it is a set of lanes.
It compares along-street gap and lane separately now.

**Cost of the fixes: 38 to 35fps**, and about two of those three came back by
noticing what was being computed for people nobody can see. The separation scan
ran for all 2,200 when 54 are drawn (nine map lookups each, twenty thousand a
frame); the "am I standing in a road" test ran sixty times a second for a
correction that takes a second to complete. Gated to 120m and staggered one
person in eight. The measurement noise in a spawned window is about +/-3fps, so
treat 35 and 38 as the same number until a focused browser says otherwise.

## The defect hunt after the shopfronts: 113 findings to 5

Eight new probe classes (D24-D31), ten rounds. Everything above D24 was written
before `src/shopfront.js` existed, so nothing was looking at 3,400 new pieces of
geometry, and D27-D31 are general classes no check covered for any subsystem.

**The one that mattered: 1,436 bays were built inside masonry.** A mall with a
landmark recipe has a podium drawn WIDER than its footprint — Ngee Ann City's,
ION's, Orchard Central's — so a bay placed on the footprint line sits inside the
podium with its wall a metre in front of the glass. Nothing could see it: S6 asks
about FOOTPRINTS and a podium has none. The bay now walks outward until the wall
grid says the wall has ended and puts the glass on the face that is drawn. The
amount cannot be computed — it is whatever the recipe drew — so it is measured.

Getting there took three wrong answers, all recorded in the file:

- **Refusing those bays instead of moving them** cost 78 of 252 named tenants,
  a third of the point of the file. A smaller world is not a fix.
- **A refusal for bays still behind something after the move** threw away 202
  bays and 11 tenants and moved D26 by zero. Removed. A fix that costs eleven
  tenants and no findings is not a fix.
- **The wall grid was the SHARED collision grid**, so building it before the
  dressing meant the street furniture could suddenly see building walls, which
  moved the furniture, which moved Orchard's P1b ratchet 135 to 136. The bays
  get their own grid now and `blocked()` is untouched. A ratchet may not go up
  because of a change that was not about it.

Also fixed, each its own class:

- **77 bays of retail glazing on museums and churches.** `landmarks.js` has kept
  a NO_SHOPFRONT set since the civic district was built and the bay builder was
  not asking it. A synagogue with no recipe got through even then, so there is
  now a name test beside it — one authority, not two.
- **18 frontages glazed twice**, from footprints that share a wall: two lots of
  glass z-fighting and two names on one shop. Claimed on a grid keyed by
  position and facing; the first version missed pairs 1.16m apart because the
  cell was 1.2m and they landed either side of it.
- **236 bays glazing the inside of their own light well.** The skip read `if (o
  && o !== r.b)` — any building in front except this one — which is exactly
  backwards for a concave plan that folds back on itself.
- **Seven crowd routes ran through drawn walls.** Paths are road centrelines and
  the crowd's only idea of an obstacle was the footprint list, the same list
  that was wrong for the rider. A blocked vertex is CUT and the path split
  there, not dragged clear: inventing a bend to hide a defect is what put the
  kerb-snap into the path frames.
- **Two thirds of the pedestrian handbags were drawn at y=-9999 every frame.**
  Parking an instance out of the world does not cull it — the lesson was already
  written down for the crowd and not applied to the one part only some of them
  carry. Bags have their own slot counter now.
- **Tenants assigned to bays that then failed to build vanished silently**, out
  of the numerator, the denominator and every skip bucket. Bays are sited first
  and handed out second. This is why S8's floor moved 85 to 76 while the number
  of tenants actually placed went 252 to 257: the metric became honest, and 35
  tenants that were being ignored are now counted as `shopsNoBay`.

**Three probes were wrong before they were right**, and all three the same way —
measuring something adjacent to the thing they claimed:

- D24 matched "gallery" and "court", so Mandarin Gallery, Steinway Gallery and
  Selegie Court were civic buildings. 43 of the first 77 findings were the regex.
- D26 with one ray found entrance-canopy COLUMNS 0.9m out and called them walls.
  Half the shops on this island are behind a colonnade. Three rays now, and a
  bay only counts as walled off if all three are stopped.
- D28 used footprints and found nine vertices inside hotels, every one a service
  road under a porte-cochere, which is a place you can walk. It asks the
  collision grid now.

**Two rounds were spent guessing why the wall grid and the raycast disagreed**
before the probe was made to print WHAT it hit — and then it printed the LOCAL
bounding box of a positioned mesh, which said y 22.9..45.3 for something a ray at
2.4m had just hit. Print world coordinates. Print the thing, not a number near
the thing.

**D26's residual 5 findings are diagnosed and left.** They are the 42cm awning
trim of the building NEXT DOOR, which sits 5.3m above its own footing and
therefore at eye level from here wherever the ground steps down between the two.
The collision grid correctly ignores it (5m up is not an obstacle where it
stands) and a raycast at eye height correctly hits it. Both are right. It is a
grade artefact, not a shopfront defect, and it is written here rather than tuned
away.

## Emptying the DEFERRED list

`data/unused.py` printed a list of tags that were carried or ignored with a
reason but genuinely SHOULD be read. Most of it is now read:

- **`maxspeed`** on 1,987 ways -- the posted limit, carried as `kmh`.
- **`lanes:forward` / `lanes:backward`** on 768 ways. We were halving the total
  lane count, which is right only when the split is even: on a 3-lane road with
  two lanes one way and one the other, the centre line was drawn down the middle
  of a lane. The median now sits at the real boundary.
- **`shelter`, `bench`, `bin`** on 94 stops, and **`route_ref`** on 97 -- the
  actual bus numbers. The shelter was being decided by whether a 9.2m roof
  happened to fit; where the map has an opinion it now wins, and where it is
  silent the frontage test still decides.
- **`crossing:island`** -- and reading it is a good example of why carrying data
  is worth it even when it changes almost nothing. 95 crossings carry the tag
  and **89 of them say `no`**: only six real refuges exist across three
  districts. A rule that put an island on every wide crossing would have been
  wrong 94% of the time.
- **`tactile_paving`**, **`surface`**, **`sidewalk:left/right/both`**,
  **`building:colour`**, **`roof:colour`**, **`min_height`**, **`tunnel`**,
  **`footway`** -- all landed earlier in the same sweep.

### The bus lanes are written and deliberately switched off

`r.bus` is carried from 274 ways and Singapore's red kerbside lanes are one of
the most recognisable things about its streets. Drawn per way they are not a
lane: OSM splits a street into fragments, 108 of the 274 are under 30m, and the
result is isolated red patches that read as STAINS on the tarmac. Filtering to
runs over 30m did not fix it. Verified by rendering with and without -- the road
is cleaner without -- so `DRAW_BUS_LANES` is false and the reason is in the code
beside it.

Same rule as the three landmark recipes held back for looking worse than the
generic family, with one difference that matters: **this comment matches the
code.** The landmark one claimed those recipes were unreferenced while they sat
in the live array, and that went unnoticed for weeks.

**To finish it:** merge a street's tagged ways into continuous runs first -- the
way process.py already stitches Orchard Road's 28 fragments into one centreline
-- then lay one ribbon per run.

**Still deferred, all low-yield:** `addr:housenumber`/`addr:street` (no
building-number signage is modelled anywhere), `crossing:markings` (zebra vs
ladder), `kerb` (lowered/flush/raised), `roof:material`, `amenity`, and
`turn:lanes:forward`/`backward`.

## The defect loop after Marina Bay: 60 findings to 9

Marina Bay took the exploratory hunt from 16 to 60. Working it down was mostly
NOT fixing the world -- **five of the nine classes were the CHECK being wrong**,
which is the same ratio this project has hit every time it has looked.

The world was wrong three times:

- **Bridges were nudged.** pedBridge ran its surveyed centre through pushClear,
  which moved the deck up to 18m and slid it off the very thing it spans -- the
  caller was satisfied because it tested the MAPPED line while D15 tested the
  BUILT deck. A bridge's position is surveyed; it is not nudged.
- **Museums were given retail glazing.** 21 shop bays on the ArtScience Museum,
  whose whole form is ten unbroken white petals. artScienceMuseum, merlion and
  singaporeFlyer joined NO_SHOPFRONT, and the never-shopfront word list gained
  museum, memorial, observatory and supertree.
- **A building floated.** footingY sampled only the vertices and the centroid,
  so a dip along an 82m edge left 1.6m of daylight under Six Battery Road. It
  walks the whole perimeter at 6m now, which is finer than the 35m heightfield
  cell, so nothing can hide between two samples.

The checks were wrong six times, and each is a named pattern from this file:

- **D6 read `data.trees`** -- the OSM node list, the INPUT -- and reported four
  trees the builder had already refused to plant. **Seventh instance** of "a
  check that reads the source data instead of the built world is not a check."
- **D14 had never once looked at an MRT canopy.** It matched an open-ended
  cylinder of radius 1.6-3.2; the canopy is radius 3.5. It matched nothing for
  months, then Marina Bay arrived and it started reporting **Supertree trunk
  sleeves** instead. Pattern #6: a signature rule is exempt by omission until a
  new shape wanders into it. Tagged by identity now.
- **D15 sampled a 12m cross around the centre of a deck up to 88m long**, so
  three real bridges "spanned nothing" because what they cross sits 24m out. It
  samples along the deck's own bounding box now -- and accepts WATER, which the
  rule pre-dated.
- **D7 re-derived the footing with the OLD formula** (vertices and centroid,
  sunk 0.5) while the builder had moved on to the perimeter sunk 0.9. A check
  that re-derives what the builder computes has to be changed with it.
- **D10 let a sky deck bury a tower.** SkyPark is 12,455 m2 at h=207 with
  min_height 193, so on height alone it "contains" all three Marina Bay Sands
  towers. process.py's own rule already skipped these; the probe did not.
- **W2 counted tree branches and bridges.** A tree on the bank overhangs the
  water -- that is what a tree by a river does -- and a bridge over the bay is
  entirely over water by design. The comment in the code already said so and the
  code counted them anyway. W2 went 580 to 0 on Orchard and Bras Basah.

**P1b is back to 0 on every scene.** Its last finding was a footbridge PARAPET
over Sheares Avenue: the deck is exempt as legitimately-overhead and its
handrail, 10cm deep, did not match the deck's signature. Exempting a deck and
then reporting the railing bolted to it is the same object described twice.

**Still open and diagnosed, not tuned away:** D26 at 6 (a neighbour's fabric at
eye level where the ground steps down between two buildings; both previous
attempts to refuse those bays cost 78 and then 11 tenants for nothing), D36 at 3
(walkers mid-walk-out at the instant of the snapshot, which is the correction
working), and Orchard's T1 at 1 -- a 190k-vertex merged tile 1.3m above Orchard
Boulevard, which pruneCarriageway will not touch by design and which S7 reads as
0, so two checks disagree and the disagreement is unresolved.

## The interface, and three bugs found by riding it on a phone

- **Audio did not start.** The unlock listeners were on `window` in the BUBBLE
  phase, and the ride controls call `stopPropagation()` on touchstart, so a
  thumb on the throttle never reached them. Opening the map DID work, because
  that touch lands on a different element -- which is exactly how it was
  reported: "no volume until I toggle the map". They are on `document` in the
  CAPTURE phase now, where nothing downstream can swallow them.
- **The open map closed on any tap**, "so there is no hunting for a button" --
  which meant the first touch aimed AT the map dismissed it and it could never
  be zoomed. It pinches, drags and has +/- buttons now, and closes only on Close
  or M. A full-screen map you cannot zoom is a picture.
- **The mute button is gone.** It used to read "Sound on" while the sound was
  already on, so the first tap silenced the ride and looked like a fault. A
  phone has a volume rocker.

Also: the control legend is gone and the minimap moved to the top right.

**The minimap's yellow line was one unexplained stripe.** It drew the PRIMARY
axis only, so in a three-district region Orchard Road was highlighted and Bras
Basah Road and Bayfront Avenue were not. All main streets are drawn now, and the
one you are ON is brighter and thicker -- which is what makes the colour mean
something.

## Markings painted where there is no road

Reported as "yellow patches on the roads" and "road lines cut off, sometimes no
lines at all". Both are the same defect and it is not a gap in the tarmac --
measured, **0% of the axis lacks tarmac**.

`axis.w` is ONE number for a whole street, and markings were laid out from it,
but the tarmac is drawn per way at that way's own width. Orchard Road's ways run
**7.0m to 25.0m**: 39 at 18.2m, ten at 14.8m, and singles at 7m, 8m, 11.4m,
21.6m and 25m. Wherever the street narrowed, the lines were painted metres past
the kerb onto the pavement -- and the stretches that looked unmarked were road
whose markings had been thrown outside it.

Markings now take the width of the real way NEAREST each point, so they and the
tarmac come from the same source. Two more followed: a guard that refuses to
emit a marking the road index does not agree is on a road, and skipping the axis
walk over BRIDGE sections, whose deck is not at ground level (the per-road loop
already skipped bridges; the axis walk did not, and Bayfront Avenue crosses two).

**P9 is the new check** -- "road markings painted off the tarmac", by raycast
against the drawn road mesh. It went 1.7% to **0% on every scene**. Nothing had
ever measured this.

## Marina Bay, and the first water

Chosen over Chinatown deliberately: it is the skyline everyone recognises, and
it is the only district so far that is mostly **not land**.

**The planned bbox was wrong before a byte was fetched.** It was 1.18 km2,
reached none of the Flyer, the Esplanade or the Supertrees, and stopped 275m
short of Bras Basah in latitude -- so the two districts would never have touched
and the seam would have been a hole. Widened to 3.54 km2 with a 390m x 620m
overlap. Check the bbox against the landmarks AND against its neighbour before
fetching; Overpass took about an hour and failed over four mirrors.

### Water, which nothing had ever drawn

It was FETCHED from the very first district and thrown away in process.py --
invisible even to the new tag gate, because the tag was on an element class the
scene file had no collection for at all. Now: 24 polygons, 2.0M m2, drawn as one
flat surface per polygon at a level taken from the terrain at its own RIM.

Four things had to be learned to get it in:

- **A bay is a multipolygon RELATION whose outer ring is split across many
  ways.** Marina Reservoir arrives as 40 open segments; treating each as a ring
  gives 40 slivers of no area, which the area filter drops, so the bay silently
  did not exist. Stitched now, and the same stitcher found that **11 of Marina
  Bay's buildings are relations too** -- the ArtScience Museum, The Shoppes,
  Victoria Theatre, Parliament House, Clifford Pier -- which a way-only query
  had been losing in every district since the project started.
- **`waterway=canal` on a plain way is a CENTRELINE, not an outline.** Reading
  it as a polygon turned Stamford Canal into a 222,000 m2 blob lying across
  Orchard, and W2 duly reported 5,447 things built in open water three
  kilometres from the nearest water.
- **A relation can be `type=building` rather than `type=multipolygon`**, with
  roles `outline`/`part` instead of `outer`. The ArtScience Museum is one.
- **Water must be built FIRST.** Everything downstream asks "is this spot free",
  and until the reservoir is registered the answer is yes: trees were planted in
  Marina Bay because TreeField.add ran during buildRoads, which used to happen
  before the water existed. A guard installed after the thing it guards is not a
  guard -- the same mistake put `window.__inWater` at the end of boot, which
  made every `dry()` filter in markings.js a no-op and left 2,064 lane lines
  painted on the bay.

**W1/W2/W3 were written before the water was.** A new subsystem gets its checks
first, because you cannot find a defect class you have not named. They found
every one of the failures above.

### Terrain: the DEM is a surface model and nobody had noticed

Marina Bay is where this finally mattered. **srtm30m, mapzen and aster30m all
report about 104m at Raffles Place, where the ground is about 5m** -- they are
reading the roofs of a canyon of 280m towers, and a local median cannot repair
it because every neighbour is on a roof too.

We do have the footprints, so a sample within 34m of a building is a sample OF
that building. First attempt DELETED those, which removed the bias and took the
ground under the roads with it: P8 went to 197 because the grid then
interpolated roads from hundreds of metres away. They are **corrected, not
deleted** now -- position kept, value re-read from the nearest clean ground.
Density is what makes a road sit on its own terrain. The filter abstains
entirely below a 30% clean floor, which is why Orchard (13% clean) and Bras
Basah (12%) are untouched by it.

Two more terrain bugs fell out: **`despike` only ever looked upward** despite
its name, so nodata holes at -38m sailed through -- now repaired downward too,
but ONLY below -2m, because a symmetric rule flattened every real dip and took
Orchard's P8 from 10 to 216. And **a bridge deck is not the ground**: sampling
the Benjamin Sheares Bridge put a 53m ridge across flat reclaimed land.

### Landmarks, researched

Marina Bay Sands from Safdie's own CTBUH case study and Arup in STRUCTURE:
**207m is the top of the SkyPark, not the towers** (roofs ~194m); **the towers
do not lean** -- each is a pair of legs, west vertical and east inclined,
spreading at the base and converging as they rise; and the three are not
identical. OSM maps each tower separately and SkyPark separately again with
`min_height 193`, which had to be read or the deck became a solid 207m block
standing in the atrium.

**The Float @ Marina Bay was demolished in March 2023** and NS Square completes
in 2027, so in 2026 it is a construction site. Not built, deliberately.

**The 280m aviation ceiling** means One Raffles Place, UOB Plaza One and
Republic Plaza are all exactly 280m -- three different heights would be visibly
wrong to any Singaporean.

**Substring matching bit four times** (Grand Park City Hall, Esplanade Theatre,
"Singapore Flyer Car Park" given the wheel's 165m, "The Shoppes at Marina Bay
Sands" given a tower's 194m). Each time the repair was to reorder the dict and
each time the next entry broke it. **Longest match wins now**, which is a rule
rather than a coincidence.

### And three teleports, all mine

Every correction applied as a POSITION CHANGE became a teleport: the water clamp
snapped `shift` to the nearest clear metre (135 m/s), then to zero in one frame
(4.75 m/s). `shift` is rate-limited now, so whatever any guard decides, a walker
moves toward it at a walking pace. That is the third instance in this file.

## The check that was supposed to catch all of this, and didn't

After the median bug the question was not "is that fixed" but "why did 36 checks
miss it, and what else is like it". The answer is that **A2, "real data present
but unused", read a hand-typed list of three items** — crossings, mrt, shops —
and passed at zero through all seven instances of the pattern it is named after.
A list of what to look for cannot find the thing nobody thought to list. The
accuracy ledger had exactly this disease and was fixed by reading the scene file
instead; A2 never was.

**`data/unused.py` enumerates the raw extract and runs in deploy.sh.** Every tag
above 5% of its element class must be one of three things: carried into the
scene file, in `IGNORED` with a reason, or in `DEFERRED` with a reason. A tag in
none of them fails the gate. Silence is impossible, which matters because the
failure mode is always a tag nobody thought about.

It found **24 unread tags in Orchard and 36 in Bras Basah** on the first run.
What that turned into:

- **`surface`** — 61% of ways, and 293 of them are paving stones, concrete,
  cobblestone or sett while every single one was drawn as asphalt. Roads now
  sort into three buckets, which is all a rider can tell apart at speed.
- **`sidewalk:left` / `sidewalk:right` / `sidewalk:both`** — the CURRENT OSM
  schema, on 356 ways in Bras Basah. We read only the old `sidewalk=` form, so
  those streets had their footway information ignored and got kerbs on both
  sides by default. Sidewalk coverage went 404 ways to 880.
- **`tactile_paving`** — 34% of crossing nodes in Orchard, 62% in Bras Basah.
  The yellow studded pad at the kerb, which is on essentially every modern
  Singapore crossing and is exactly the sort of thing whose absence reads wrong
  to someone who has stood on one. Drawn at both kerbs of a crossing, not at its
  centre, so it reads as a kerb ramp rather than a yellow patch in the road.
- **`building:colour` and `roof:colour`** — 33 and 51 footprints with a SURVEYED
  colour that a hash of the footprint was overriding. Same mistake
  `building:material` already fixed once: "a hash was overriding a surveyed
  fact".

**And I got `separate` wrong on the way**, which is worth recording because it
is a data-meaning bug rather than a code bug. `sidewalk:left=separate` does NOT
mean there is a pavement on the left; it means the footway is mapped as its own
way elsewhere, so this carriageway has no kerbside pavement. Reading it as "yes"
put Mount Sophia back into C1 and failed the gate — which is the gate doing its
job, since C1's own comment has said for weeks that Mount Sophia correctly has
no kerbs.

**Still DEFERRED, printed on every run so they cannot go quiet:** `maxspeed`
(1,254 ways carry a real limit and traffic speed is invented), `lanes:forward` /
`lanes:backward` (546 ways, exact split inferred), bus lanes (`busway:*`,
`lanes:bus` — Singapore's red bus lanes, very visible, markings work),
`route_ref` (the real bus numbers at each stop), `crossing:island` (pedestrian
refuges we do not build), `crossing:markings`, `kerb`, `shelter` / `bench` /
`bin` (OSM says WHICH stops have them; we decide by frontage width), and
`addr:housenumber` / `addr:street`.

## The median down the middle of a one-way street

**The user found it by riding, and asked whether Orchard Road has a divider.**
It does not: it is one-way, five lanes, all going the same direction, and there
is nothing to divide. We were drawing **506 kerbs, 221 shrubs and 29 palms down
the middle of it** — 43% of every piece of median furniture in the world.

The cause was `oneway=` read wrongly for the FOURTH time. `dualSegs` collected
any one-way primary/secondary/trunk/tertiary way and called it a dual
carriageway; Orchard Road is a one-way primary, so it matched ITSELF at distance
zero and `hasMedianAt` (a 26m radius) returned true for all 2,586m. The comment
above it claimed the opposite — "only where the street is actually a dual
carriageway" — so this is the second place in two days where the file documented
a rule it was not enforcing.

**A dual carriageway is a PAIR**: two one-way ways of the same name running
ANTI-PARALLEL within a few tens of metres. Measured against that: Orchard Road
has 9 divided segments of 103, Bras Basah Road has 0, and River Valley Road
(85/87), Killiney Road (82/88), Grange Road, Victoria Street, Hill Street,
Paterson Road, Scotts Road and Middle Road genuinely are divided. The median now
goes on the line BETWEEN the pair rather than on whichever street the axis
happens to be — placing it at the axis point put planters in a live lane even
where the division was real. Orchard went 756 pieces to 2.

Three bugs of my own on the way, all previously recorded classes:

- **It was placed twice.** `buildSgDetail` runs once per axis and the region has
  two, and the new median is world-wide rather than axis-derived, so it was laid
  down on top of itself: 768 kerbs where there should be 384, and P4 went to 710
  against a budget of 360. The ERP gantries have carried a `__erpDone` flag for
  this exact reason since the region shipped.
- **Spacing by grid key rather than by distance** left kerbs centimetres apart.
- **The jitter came off the shared PRNG**, so changing how many median plants
  exist relocated street trees and pedestrians elsewhere in the district (D33
  and D37 moved for no reason). Its own stream now, same as the granite texture.

### What else the road data says that we still ignore

Asked how many roads are wrong, so: measured against the raw extract, 3,256
highway ways.

| tag | ways | % | state |
|---|---|---|---|
| `surface` | 1,986 | 61% | **UNUSED.** 293 ways are paving_stones, concrete, cobblestone or sett and every one is drawn as asphalt |
| `lanes` | 1,671 | 51% | used |
| `oneway` | 1,491 | 46% | used |
| `name` | 1,355 | 42% | used |
| `maxspeed` | 1,254 | 39% | **UNUSED.** 50/60/40/15 km/h are tagged; traffic speed is invented |
| `turn:lanes` | 608 | 19% | used |
| `lanes:forward`/`backward` | 546 | 17% | **UNUSED.** exact directional split; we infer it |
| `sidewalk` | 404 | 12% | used |
| `tunnel` | 113 | 3% | handled — only 5 footway tunnels still surface |
| `width` | 3 | 0% | all three are on footpaths, so every carriageway width is inferred |

So: **centrelines and layout are surveyed and right. Widths are inferred and
always were. Surface, speed limit and directional lane split are real data
sitting unread — the fifth, sixth and seventh instances of that pattern.**

## The crowd, and a position that was not where anyone was

`positions()` recomputed each walker from `pr.off` alone and ignored `shift`,
the per-frame sidestep for avoiding other people. **So every check reading it
was told about a place the walker was not.** D36 spent three rounds reporting
people "standing in a carriageway" whose drawn position was on the pavement, and
saying nothing about the ones the dodge had pushed onto the tarmac. Fifth
instance of this project's oldest rule: test the world, not the input to it.

With honest positions, three real fixes took it 5 to 2 of 2,200:

- **A bitmask of which offsets are clear**, one bit per metre per side per 10m
  of path, measured once at build. The first version stored a single "smallest
  clear offset" per bucket and was wrong wherever a SECOND carriageway lies
  further out: walkers sat at 12.1m against a "need" of 11.7m and were still in
  traffic. A threshold cannot describe clear-blocked-clear.
- **Look ahead twelve metres**, because the walk-out is capped at 1.1 m/s and a
  walker moves at up to 1.65, so a here-and-now test cannot finish moving anyone
  before they are inside the narrowing.
- **Where a side has no clear offset at all, the walker turns round**, which is
  what a person does when a footway ends, and reuses the reflection the path
  ends already use rather than teleporting anyone.

**And I wrote the teleport bug into it myself, again.** Clamping `shift` to the
nearest clear metre is a several-metre jump in one frame: B1 caught a pedestrian
at **135 m/s**. Third time in this file after the 17.6 m/s sidestep and the 11m
tangent flip. Cancelling the dodge to zero instead moves them by centimetres and
B1 reads 2.41 m/s. **A correction applied as a position change is a teleport,
however good the reason.**

**D32 was a false positive and the probe was the bug.** It identified pedestrian
body parts as "any instanced mesh whose count equals the number of walkers
drawn", and a pedestrian RAILING POST from street.js had exactly 57 instances --
so it reported all 57 "detached from their torso, worst 1619.6m", which reads
like a serious crowd bug. The crowd builder tags its own meshes
(`userData.crowdPart`) now. Counting things that resemble the target is not
counting the target.

**Still open: D26 at 6, and it stays open deliberately.** Six of 570 sampled
bays have a neighbour's fabric at eye level in front of them, on stretches where
the ground steps down between two buildings. Both previous attempts to refuse
those bays are recorded above: one cost 78 of 252 named tenants, the other cost
202 bays and 11 tenants and moved the number by zero. A smaller world is not a
fix. D36's residual 2 are walkers mid-walk-out at the moment of the snapshot,
which is the correction working rather than failing.

## One origin for the island

`districts.json` holds `island_origin` (the SVY21 datum point, 1.366666,
103.833333) and **every district projects from it**. Each district used to carry
its own origin, so two districts built side by side would each be measured from a
different zero and would not line up at the seam. Nothing caught it because only
one district was ever built.

Moving Orchard into that frame flushed out four bugs that had been invisible
while the district happened to sit near (0,0):

- **`build_grid` in terrain.py shadowed its row counter.** The inner loop over
  nearby road samples used `j`, and so did the outer loop over grid rows, so
  every cell after the first in a row was sampled at a z of `minz + (a point
  index) x 35m`, found nothing, and was written as zero. Near the old origin a
  wrong row index still landed on real ground often enough to look plausible.
  Seven kilometres out it came back flat: the heightfield read 0.0m along the
  whole street.
- **`carry_terrain` in process.py** copied the old heightfield across a
  reprocess without checking the origin. It compares them now and refuses.
- **The spawn point** was the axis vertex nearest the WORLD ORIGIN, which worked
  only because the old origin sat in the middle of Orchard. It is the midpoint of
  the street by arclength now.
- **Traffic was built before the spawn was set**, so it was avoiding a
  placeholder at (0,0). Spawn is computed first now.
- `build_district.py` wrote to `data/districts/<id>.json` while terrain.py treats
  `data/<id>.json` as canonical, so the next district would have produced the
  duplicate scene file terrain.py already hard-errors on. Both write canonical
  now, and check.py hard-errors on a duplicate too.

**P1b and T1 were re-baselined 97 to 99 and 7 to 8, and that is not a regression
waved through.** The building geometry is identical, every count matches to the
unit. The ground under it changed: correcting the heightfield moved the terrain
under Scotts Road from 27.1m to 41.5m, so two pieces of structure that were
always in a carriageway are now measured as such. Verified by running the same
audit against the previous scene file, which still reports 97.

## The region ships

Live: Orchard Road **and** Bras Basah, merged into `data/world.json` by
`python3 data/merge.py world orchard brasbasah`. 1,932 buildings, 4,392 roads,
41-60fps at 844x390 dpr2, 4.3s to load. `?scene=orchard` still loads the single
district, and BOTH are gated on every deploy so a regression in Orchard cannot
hide inside a bigger world's budgets.

Five of the seven failures the region opened with were the CHECKS, not the world:

- `audit_world.js` fetched `./data/orchard.json` unconditionally, whatever the
  app had loaded. Auditing the region compared its geometry against one
  district's list of buildings and streets, so every Bras Basah sign "named no
  building" and every plate was "on the wrong street": 177 failures that were
  entirely the check reading the wrong source. It uses `window.__data` now.
- `P3` called the distant massing "props off the ground". A block is a unit cube
  scaled to its size, so its origin sits at half its height by construction and a
  40m block reads as 20m up while its underside is on the ground. It asks where
  the BOTTOM is now, using the instance scale.
- `P1b`, `T1`, `P4`, `P6` were Orchard's numbers applied to a world 40% bigger.
  Budgets are per scene now; the region's are its ratchet baseline on the day it
  was first measured, and Orchard's are untouched. A shared budget loosened to
  fit the region would have hidden a real Orchard regression the next day.

**And `deploy.sh` published the region as a 404.** The build step wrote three
scene files into `dist/` and the publish step copied one of them by name, so the
moment the site started loading `world.json` the live page fetched GitHub's 404
page and failed to boot. It copies `dist/data/*.json` now and verifies every one
of them against the live site. Two lists of the same files, one updated.

## The defect hunt

`SG_SCENE=world node data/defects.mjs` — 21 named classes, all at zero. It is
NOT the gate; it is where the next gate comes from. Every finding ends one of
three ways: fixed, promoted into `audit_world.js` with a budget, or the probe is
deleted loudly for measuring the wrong thing.

**Six of the twenty-one probes were wrong before they were right, and always the
same way: they read the map data instead of the world built from it.** Crossings
"not on a road" were nodes the builder correctly never draws. Bus stops "inside
buildings" were map points, not the poles that get pushed clear of them. Bridges
"spanning nothing" were ramps the builder already skips. MRT entrances "inside a
mall" is where the escalator actually is. If a check reads `data.*` and the thing
it judges is drawn, it is testing the input, not the output.

One probe was deleted outright: it counted distinct geometry signatures per
square metre and called six a heap, and every one it found was an ordinary
pavement — a kerb, a railing (three signatures), a lamp, a canopy overhead and a
pedestrian (six on their own). A probe that needs a magic number to stop crying
wolf is not measuring anything.

Real defects it found and that are now fixed:

- **MRT entrance canopies built inside masonry.** 43 of 62. Most Orchard exits
  genuinely sit inside a mall because that is where the escalator is; the door is
  on the facade, so they are pushed out to it and skipped if there is nowhere.
- **Overhead bridges over nothing.** A 37m footway bridge over a canal was
  getting a deck and two stair towers. A bridge is only built where it spans a
  carriageway, sampled along the deck rather than at its ends.
- **Nine self-crossing footprints and four with no area.** A ring that crosses
  itself extrudes into folded geometry and confuses every point-in-polygon test
  built on it, including collision. Repaired greedily by dropping the vertex that
  removes the most crossings; a footprint with no area is dropped.
- **65 road points outside the merged heightfield.** Each district padded its
  grid 90m past its OWN roads, and a road crossing the seam runs past both. The
  merged grid now covers every road and the apron takes the nearest edge value,
  so the ground runs out flat instead of dropping to sea level.
- **Zebra bars up to 50 degrees off square.** A crossing used one angle for all
  its bars, taken at the centre, while the bars spread four metres along a street
  that bends — and junctions are exactly where crossings are. Each bar takes the
  street's direction at its own position now.

**And `P1b` and `T1` are deterministic.** Both skipped any mesh over 6,000
vertices and took a fixed number of samples from the rest, so the answer depended
on how the merger packed its tiles that run: the number moved 99 to 124 after
dropping two zero-area footprints and half an hour went into looking for geometry
that had not moved. Constant stride, nothing skipped. The numbers went up because
more is looked at, and they no longer move unless the world does.



`SG_SCENE=world node data/defects.mjs` is the exploratory pass: eleven classes
nothing has a gate for. It is NOT the gate. Anything it finds is either a defect
to fix and then promote into `audit_world.js` with a budget, or a probe that was
measuring the wrong thing and should be deleted loudly.

Two loops of it found four real defects, all of them world-wide and none of them
visible to any of the 31 checks, because every one of those asks where things
are in PLAN and these are defects in SECTION:

- **The ground stood through the tarmac over 16.6% of the road surface, worst
  case 4.9 METRES.** A ribbon takes its height from the terrain at each
  centreline vertex and is flat in between; OSM vertices sit up to thirty metres
  apart and the heightfield is bilinear over 35m cells. `ribbon()` subdivides at
  3m now, which takes it to 0.01% over 5cm, and `P8` gates it. **The check
  reproduces the subdivision, so the two STEP values must be kept equal.**
- **Buildings were seated on the ground under their CENTROID.** On a slope the
  downhill end floated: Plaza Singapura spans fourteen metres of grade. They sit
  on the lowest ground under the footprint now, same 0.9m sink on the flat.
- **Bus stops were pushed out of carriageways into buildings.** `pushClear`
  knows about roads and nothing about walls, so 24 stops stood inside masonry,
  and raising the search stranded two more with no road near them. It now needs
  somewhere that is both clear and beside a road, or it builds nothing.
- **13 footprints were buried inside taller buildings**, invisible except for
  z-fighting. Dropped in `process.py`. A TALLER inner footprint is a tower on a
  podium and is kept: 16 of the 28 first flagged were exactly that.

**The recurring lesson from this session, four separate times: a check that
reads the source data instead of the built world is not a check.** The audit
fetched `orchard.json` whatever the app had loaded; D3, D4 and D5 tested map
positions rather than where the builder put things; and the first road-surface
probe compared two numbers computed from the data, so it could not see the fix
that had already landed. Test the world, not the input to the world.

## Landmark recipes: the loop, and the rule

`src/landmarks.js` holds the recipes. Two batches done for the Civic District,
which arrived with zero coverage: **Esplanade** (two shells with the aluminium
sunshades, merged as geometry not instances), **Raffles City** (Pei's plan turned
45 degrees, tall slab rounded on its ends, two shorter towers), the **National
Museum** and **National Gallery** (rotunda, dome, Corinthian colonnade), and
**churches** (white walls, stepped roof, tower and spire), which covers St
Andrew's, CHIJMES and five more in Orchard.

Then the three that were held back were fixed and shipped: the **National
Library** (two blocks split by a visible atrium, sixteen projecting floor bands),
**South Beach** (Foster's canopy as stepped ribbons) and **Bugis+** (WOHA's
crystal mesh as a diagonal lattice over a lit wall).

**THE RULE, and it held:** a recipe exists to make a building more recognisable
than the generic facade family, and one that does not is a regression. All three
of those were built, judged WORSE than the generic, and left unwired until they
were fixed. Judge by rendering the same building both ways and looking at them
side by side; judging a recipe on its own tells you nothing.

What made each of them work in the end:
- **Horizontal articulation, not material.** The library was a flat grey slab
  because at ninety metres a subtle concrete texture reads as nothing. Sixteen
  projecting floor bands fixed it; the material never mattered.
- **A mesh needs something behind it.** The Bugis+ lattice was invisible against
  a dark wall and reads clearly against a bright one.
- **Do not invent what the map does not say.** South Beach first got two 70m
  towers because the real complex has towers — but this footprint is the AVENUE,
  ten metres tall over 20,000 square metres. The towers are their own footprints.

Mistakes worth not repeating, all of them the same shape:

- **Size massing from the FOOTPRINT, not from the oriented bounding box.** A box
  around an angled or cruciform plan is bigger than the plan, so the church roof
  hung out over the neighbours as a detached green tube and the library filled
  its whole site as one slab. Building from the footprint cannot leave the
  building.
- A three-sided cylinder's radius sets its HEIGHT as well as its span. Sized off
  the footprint width, St Andrew's grew a thirty-metre roof.
- **Patterns match more than you think.** "Grand Park City Hall" is a hotel and
  was handed a Corinthian colonnade and a copper dome; "Esplanade Theatre" and
  "Esplanade Concert Hall" are halls INSIDE the complex and each grew their own
  pair of shells.
- Building fabric belongs in merged geometry, not in an InstancedMesh. The 300
  Esplanade sunshades as instances were counted as street props and produced 756
  findings for something that is part of the building.
- Civic buildings get no shopfront. A cathedral does not have shop awnings, and
  adding them was also the source of 13 duplicated props.
- `orientedBox` returns `ux/uz`, and the normal is `(-uz, ux)`. There is no
  `ob.nx`; using it writes NaN and the building silently vanishes.

Next batch: Lucky Plaza, The Centrepoint, 313, Plaza Singapura on the Orchard
side; Funan, Marina Square, Bras Basah Complex on the other. Roughly 96 of the
116 street-facing buildings still have no recipe of their own.

## Do this first

1. **RESEARCH THE STREET BEFORE ASKING ABOUT IT.** The comparison sheet exists
   now (`node data/vantage.mjs` renders it, `node data/sheet.mjs` publishes it),
   and the first instinct was to hand it to the user and ask what was wrong. The
   user's answer was: shouldn't you know this already, you have sources. He was
   right. One hour of searching found two errors nobody had to have stood on
   Orchard Road to catch:
   - **Orchard Road is ONE-WAY**, five lanes, south-east to Dhoby Ghaut, since
     1974. Every Orchard Road way in `data/raw.json` carries `oneway=yes` and the
     flag was already in the scene file. The traffic system spawned half its
     fleet head-on. **Third time** real data sat unused (crossings, sidewalk
     tags, now this). `axisSpec()` in markings.js is the single reader now, and
     both the markings and the traffic take their lane geometry from it.
   - **Orchard Road is an Angsana avenue.** NParks: crown 12 to 34m across,
     dense, dome-shaped, drooping. The trees were 10 to 14m crowns of thin
     foliage on bare trunks and read as palms in all fourteen frames.

   Ask the user for what only he can give: proportion, facade subdivision,
   whether a place feels right. Everything factual is researchable.

2. **The comparison sheet is the review loop.** `node data/vantage.mjs` for the
   frames, `node data/sheet.mjs > x.html` for a standalone page with each
   camera's real lat/lon linked to Street View. Fourteen vantage points, all
   derived from surveyed geometry so none of them flatter.

3. **Both of those researched facts are BUILT** as of 2026-07-28, and checking
   the sources again corrected two things this file had recorded wrongly — the
   granite panels are the towers' module, not the podium's, and the towers are
   granite rather than glass. See the section above. The next researched-but-
   unbuilt item is **The Centrepoint**, described further down.

4. **The ratchets are closed.** `P1b` and `T1` are 0 on both scenes and are
   plain BLOCKERS now, not ratchets. Read the section above before touching
   process.py's corridor push: two obvious theories about it were built,
   measured and thrown away.

## Six bug patterns worth hunting on sight

Every defect found in seven review loops was one of these. Grep for them before
looking for anything cleverer.

1. **A fallback that returns the value it was asked to fix.** `pushClear`
   returned the blocked point when it failed. `deploy.sh` verified only `app.js`,
   so a data-only deploy compared the unchanged bundle and reported MATCH. A
   shelter search fell back to the original coordinate. Failure must skip, not
   substitute.
2. **Two numbers that should be compared and are not.** The bike was placed at
   terrain height while the tarmac is drawn 5.5cm above it, so its wheels were
   under the road for the whole project. Markings were pushed below the surface
   while satisfying a different check. **The height a thing is drawn at and the
   height a thing stands on are different numbers.**
3. **A check scoped narrower than its own name.** `P1` claimed "props in a
   carriageway" and skipped all buildings and landmark structure. `T1` claimed
   "blocked by solid geometry" and looked only at instanced props — and it also
   ignored HEIGHT for those props, so a branch 7m over the road counted as
   blocking it. `A2` claimed "real data present but unused" while 6 of 48 bus
   stops were built. `P3` claimed "props off the ground" and was really a flat
   19m ceiling calibrated to the old 12.5m trees; it now tests whether a trunk
   stands under the foliage. If a check is green, confirm what it looks at.

4. **A number in a check that nobody sized from anything.** `P1`'s carriageway
   clearance was 3.0m, "clear of a rider on a scooter", on a street that carries
   double-decker buses at 4.3m. It is 4.8m now, which is stricter, and it
   immediately found seven tree limbs hanging into the traffic envelope over
   side streets. Size a threshold from the tallest thing that has to pass under
   it, not from the thing the player happens to be driving.

5. **A snapshot cannot see motion.** All 31 checks passed while pedestrians
   crossed Orchard Road at 39 m/s, because every one of them looks at a single
   frame. The user found it by riding. `data/behaviour.mjs` is the missing
   category: B1/B2 sample the world moving, B3 walks every path at a lateral
   offset and asserts the frame never jumps. B3 is the one that matters, because
   it measures the CAUSE and does not need an actor standing on the defect.

   The cause was worth the trip: everything that travels a street is drawn at an
   offset from the centreline, and the tangent came from whichever polyline
   segment the arclength landed on, so it flipped at every vertex. A walker 17m
   out passing a 37-degree bend was thrown 11 metres sideways in one frame. Four
   more of the same family were behind it, two of them introduced by my own
   fixes: a snap to the kerb, and a sampling window that wrapped round the end of
   a short street. Fix a discontinuity by making the frame continuous, not by
   clamping the symptom.

6. **A signature allowlist fails closed when a shape changes.** The audit
   exempts geometry by `Type(params)`, so retuning the tree branch from
   radiusTop 0.07 to 0.06 silently revoked its exemption and 409 branches
   appeared as blockers. That direction is safe. The dangerous direction is a
   NEW shape that no rule mentions, which is exempt by omission.

## Leave nothing running

**A `pgrep -f` wait-loop can match ITSELF and never exit.** Twenty-three shells
were found spinning after fourteen hours, each one

    until ! pgrep -f "probe.mjs|defects.mjs"; do sleep 8; done

waiting for a probe that had finished long before. `pgrep -f` matches against a
full command line, and the pattern string is IN the waiting shell's own command
line, so the shell finds itself, decides the probe is still running, and sleeps
again forever. Every one of them woke every 8 to 12 seconds all night.

Use a marker the pattern cannot contain -- match on the interpreter and script
path (`pgrep -f "node .*defects\.mjs"`), or wait on the PID, or just run the
thing in the foreground. `bash data/tidy.sh` kills stray BROWSERS and knew
nothing about these.


`bash data/tidy.sh` after any batch of checks. Every gate here drives a headless
browser rendering a 60fps WebGL page, which holds two CPU cores, and a browser
that outlives its script keeps doing it. Left overnight it cooks the laptop.

## Commands

```
node server.cjs                  # dev server on :8933
node data/vantage.mjs [ids...]   # comparison sheet, 14 matched-angle frames
node data/sheet.mjs > sheet.html # standalone page of them, lat/lon per frame
node data/audit_run.mjs          # the 36 snapshot checks; needs the server
SG_EXTRA=noshops node data/audit_run.mjs   # build without a subsystem, to attribute a count
node data/shopshots.mjs 6        # eye-level frames OF THE SHOPFRONTS, 9m out
node data/fps.mjs 6              # headed fps at 844x390 dpr2; a floor, not the number
SG_SCENE=world node data/probe.mjs "expr"  # stats + draw calls, plus any expression
node data/behaviour.mjs         # B1-B5: how things MOVE; needs the server
SG_SCENE=world node data/defects.mjs   # the exploratory hunt, 15 classes
bash data/tidy.sh               # kill stray browsers; ALWAYS after a batch
node data/sweep.mjs --shots      # 220 stops, contact sheet in shots/sweep/
node test/ride.test.mjs          # ride model, no browser
python3 data/check.py orchard    # data gate
python3 data/accuracy.py orchard # real vs invented ledger, 18/28
./deploy.sh "message"            # gates, builds, pushes, verifies both files
```

Load with `?raw=1` for the audit (objects unbatched), `?dpr=2&touch=1` for phone
conditions, `?nosurround`, `?nofoliage`, `?nopeople` to bisect.

## Rules that cost something to learn

- **Do not expand to another district yet.** The pipeline works, but building
  wide before verifying what exists is what produced every defect above.
- Verify by measuring, not by looking. A screenshot cannot tell you about the
  2,384 metres off screen.
- A ratchet is not a pass. State the open number plainly.
- When a check fails, first ask whether the check is wrong. Three were.
- Never rebuild subsystems in a teleport hook: `trafficSys.build()` adds a fleet
  each call, and a sweep once blamed the district for 1,618 draw calls the
  harness had created.
- One scene file per district. Two copies with a preference order let a stale one
  be written over a fresh reprocess.
