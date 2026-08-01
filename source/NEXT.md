# TAKEOVER BRIEF — for the next lead (written 2026-07-30 ~14:40 SGT by Fable)
# The user is handing the main loop to Opus 5. Read this, then the rest of
# this file, then WORKFLOW.md and STANDARD.md. Everything below is law that
# was paid for in gate refusals and user corrections — do not relearn it.

## State at handover
- LIVE: seven districts, streaming default (boot one district, proximity
  builds, unload past 1.7km), instance-LOD ON (the heat answer; NaN-guarded,
  P11 gate), district crowds, teleport dropdown, "Singapore World" branding,
  10 landmark recipes (Buddha Tooth, Sri Mariamman, Lau Pa Sat, People's
  Park, Thian Hock Keng, Sultan Mosque, UOB, OCBC, Republic Plaza — and Old
  Hill Street Police Station QUEUED, see below).
- IN FLIGHT: a deploy carrying the traffic side-graze slide fix (side
  contact with cars slides like walls; head-on still stops). When it lands,
  deploy the rainbow (Old Hill Street) batch — it is audited and ready in
  the working tree.
- The user's standing orders: POLISH FIRST (all 7 districts to Orchard
  standard) before expanding; heat stays solved; keep grinding.

## The operating rules (each one has a scar behind it)
1. ./deploy.sh "msg" is the ONLY way to ship. It snapshots the tree at
   launch — you may edit ANYTHING while it runs; your edits ship in the
   NEXT deploy. One deploy at a time (they share $WORK and the Pages repo).
2. The gates are law. A refusal names a real defect ~every time — diagnose
   it, never lower a budget without a dated written reason in
   audit_world.js. Ratchets go down, never up. Floors go up, never down.
3. VET FROM THE RIDER'S SEAT before wiring any recipe. The bar: better
   than the generic it replaces, judged from screenshots at street level.
   Three failed vet rounds = PARK IT with a diagnosis comment and move on
   (Clarke Quay is parked at round 3 — its next step is INSTRUMENT the
   computed positions before placing anything).
4. Research before building: launch an Opus research agent with the brief
   pattern in research/*.md (metre figures quarantined and tagged, heights
   never derived from storey counts, FALSE PREMISES corrected explicitly).
   Bank the spec into research/ BEFORE building. Keep 2-3 ahead.
5. Proof images sent to the user must be pixel-checked against their own
   claim first (a clipped label shipped as "verified" once — he noticed).
6. The user's taste: no yellow lines on maps (twice), compact UI that
   hugs content, plain language, absolute honesty about failures. He finds
   real bugs by riding — treat every report as真 (it has been, every time).
7. Traps: shell cwd resets to /Users/ZY between commands (always cd or use
   absolute paths); python heredoc edits MUST verify the write landed
   (print a containment check after writing — two silent write-losses
   today); ugrep needs -F for literal strings; SwiftShader inflates all
   headless timings ~20x (never diagnose perf from headless numbers —
   use the headed browser via receptionig's playwright).
8. Sequence for a new district (when polish is done and the user says
   expand): registry entry with overlap + reasons -> build_district.py ->
   terrain --source opentopodata -> check.py (declared absences supported:
   noMrt etc with live Overpass evidence) -> unused.py (decide every tag)
   -> audit scene (day-one ratchets with reasons) -> merge --stream all
   districts -> world audit -> deploy. deploy.sh + gates.sh already list
   all seven scenes; add the new one to BOTH.

## The queue, in order
1. Land the in-flight deploy; deploy the Old Hill Street rainbow batch.
2. CBD crown verification from across the water (build a vantage into
   data/vantage.mjs rather than hunting cameras by hand — the canyon eats
   free cameras; that lesson cost five rounds today).
3. Clarke Quay round 3 (instrument first), then the riverside
   canopies/Angels as props.
4. Road-shadow patchwork (near-black asphalt in tower canyons — hemisphere
   lift, visual change so vet at multiple times of day... there is no time
   of day yet, so vet at multiple spots).
5. Signal poles on elevated roads (heads float at deck height near
   Cantonment; same family as the Esplanade bridge rider-sink item).
6. Kerb fragment chains at new-district junction mouths.
7. S8-doors metric fix (a recipe door in front of a bay should COUNT as
   frontage, see triage item 0 below).
8. Boat Quay river-row colour treatment; more CBD facades; then ASK THE
   USER about expanding (Little India / civic core / Tiong Bahru).

# 2026-08-01 (Opus 5) — THE GROUND WAS THE DATASET, NOT THE FILTER

The top item in HANDOFF.md was "Marina Bay's ground is ~25m too high", diagnosed
as rooftop contamination of a 30m DEM cell with three ranked fixes. The
diagnosis was half right and the ranked fixes would all have failed. What
actually settled it was measuring the DEM instead of reasoning about it.

**Candidate fix 1 (filter samples by distance to the nearest building) is dead,
and the measurement kills it in one line.** Marina Bay road samples binned by
their distance to any mapped footprint:

    dist   0- 10m  n= 294  min= -2.0  p10= 6.0  median=17.0  p90=56.5  max=87.0
    dist  10- 34m  n= 615  min=-27.0  p10= 5.6  median=13.0  p90=31.0  max=95.0
    dist  34- 55m  n= 142  min=-38.0  p10= 1.6  median=12.0  p90=24.7  max=55.0
    dist  55- 80m  n=  98  min=-23.0  p10= 0.9  median=11.5  p90=22.0  max=32.0
    dist  80-131m  n= 280  min=-19.0  p10= 2.0  median=11.0  p90=21.0  max=32.0

A sample 130m from every building still has a median of 11m and a range of -19
to +32 on ground that is about 5m. That is not roof contamination, it is noise.
Open water in the middle of the bay came back at 6m and 16m where the datum
says 0. A lower-envelope estimator was then tried across four percentiles and
three radii on the same data: the best it could do at Raffles Avenue was 10m,
because there is no honest sample within 400m of Marina Centre to find. **You
cannot filter your way out of a dataset with no signal**, and every free web
API here returns the same SRTM: open-elevation, opentopodata/srtm30m and mapzen
all agree with each other and all are wrong.

**COPERNICUS GLO-30, READ FROM DISK.** The tile for all of central Singapore is
one 30MB COG in a public AWS bucket with no key and no account:
`https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N01_00_E103_00_DEM/...`.
It answers the same probes as:

    Raffles Avenue    4.8m   (SRTM 25m)        Fort Canning   49.4m  (published 48)
    Esplanade         4.8m   (SRTM 19m)        Marina Barrage  0.0m  (water)
    Raffles Place     7.0m                     Gunung Pulai  653.1m  (published 654)

Downloading it also removed the constraint that shaped the whole sampler.
Sampling is no longer rationed: roads every 20m instead of 45m, plus a 35m
lattice over every patch of open ground in the district (`open_samples`). That
lattice is what made the rooftop correction work at all — see below.

**THREE BUGS FOUND WHILE DOING IT, all of them silent:**

1. **The rooftop correction had been switched off in seven districts of eight.**
   It was gated on 30% of samples coming back clean, and only Marina Bay met
   that. Orchard, River Valley, Bras Basah and Chinatown had all been shipping
   ground they knew was reading rooftops, behind a printed message nobody read.
   A district-wide FRACTION was the wrong test: whether a given sample has
   honest ground near enough to borrow is a local question. Now every sample is
   repaired if clean ground exists within 300m, and the ones that do not are
   counted out loud.
2. **`drop_roofed` lied about what it filtered** — when the floor was not met it
   returned EVERY index as "clean", so a caller that stopped reading the flag
   (me, same day) silently corrected nothing in three districts for one build.
3. **The repair took the median of every clean sample within the radius**, which
   on a hill is wrong by the height of the hill: Pearl's Hill is roofed end to
   end, so every sample on it was re-read from the streets at its foot and the
   hill came out at 30m against ~43m. Now the median of the FIVE NEAREST, which
   is what the comment always claimed. Pearl's Hill 30 -> 39.5m.

**AND A GEOMETRIC RULE WITH NO SCALE, for the fourth time in this project.** The
clearance pad was a flat 34m for every footprint, so a three-storey shophouse
and Marina Bay Sands were treated as contaminating the same radius. A flat 60m
or 90m pad was tried and is WORSE: it fixes Marina Bay and pushes Serangoon Road
from 4.9 to 6.3, because a low-rise district does not need the correction and a
wide pad only discards the honest samples it has. The pad now scales with the
building's height (`24 + 0.45h`, clamped 24-120m), and it is validated against
PUBLISHED levels rather than tuned by eye — the table is in `contam_fn`, the
figures are banked in HANDOFF.md.

**WHERE IT LANDED** (published figure in brackets): Raffles Avenue 29.6 -> 5.3m
[3-5], Temasek Avenue 28.3 -> 7.9m [3-5], Bayfront 15.3 -> 4.2m [3-5], Marina
Bay Sands site 5.0m [3.0-3.5], Serangoon Road 5.1m [3.0], Fort Canning 44-45.8m
[48]. Against FABDEM bare earth over 24,193 road points: median +0.98m.

**FABDEM IS THE VALIDATION SET AND DELIBERATELY NOT THE BUILD INPUT.** It is
bare-earth and slightly better than what we build, and it is CC BY-NC-SA — a
non-commercial share-alike licence, on a public repo, where Copernicus is
permissive. It stays outside the repo and is used to measure, not to ship.

## OTHER THINGS THIS SESSION FOUND

- **TWO SINGAPORE FLYERS.** `/singapore flyer/i` also matches "Singapore Flyer
  Car Park", so the car park was given its own 165m observation wheel: two
  wheels 125m apart in every frame looking up Temasek Avenue. Fourth
  over-matching recipe pattern (Grand Park City Hall, Esplanade Theatre,
  ArtScience Museum). A landmark name is a WHOLE name — anchored to
  `/^singapore flyer$/i`. All 79 patterns were then swept against all 1,174
  building names in the region; the rest are deliberate families. The Istana was
  the other real hit: an 1869 palace in the finned-concrete-slab family.
- **The buried-footprint filter ran before the thing that creates its inputs.**
  Polygon surgery segments terraces every ~16m and splits rings a road runs
  through — AFTER the burial test. Six 44-114 m2 pieces ended up entirely inside
  The Riverside Piazza and Fraser Residence Promenade. The filter is a function
  now and runs a second time after surgery (`_drop_buried`).
- **D34 was auditing 272 of about 630 vehicles**, because `__trafficState`
  returned only the spawn district's fleet. It also compared `a.s` with `b.s`
  across fleets, and `s` is an arclength along ONE path — two cars a metre apart
  on two paths have `s` hundreds of metres apart. Fifth instance of measuring
  one fact with the wrong ruler. Now: same fleet -> the lane/arclength test,
  different fleets -> separating-axis overlap of the two oriented rectangles.
  Result: 479 vehicles across 3 fleets, ZERO overlaps — the interpenetration I
  thought I saw in three vet frames was perspective, and the check now says so
  rather than being unable to see either way.
- **`deploy.sh` exported `SG_PORT=8934` and `defects.mjs` never read it.** Only
  3 of 14 browser tools honoured it; the deploy had been relying on a long-lived
  dev server happening to be up on 8933. All 14 honour it now.
- **`data/tidy.sh` reported "browsers still running: 0" while two Chrome
  instances held the debug port.** It matched `Chromium --headless`, and the
  browser this project actually launches is Google Chrome. It matches the temp
  PROFILE now, so the user's own windows are never touched.
- **`data/topup.py` gained a `buildpart` layer** — Orchard and River Valley were
  fetched before `building:part` existed in the pipeline and carried 4 and 1 of
  them against Chinatown's 505. Topped up rather than refetched, so the loss
  guard was never risked: +196 and +201 elements, +33 and +51 buildings.
- **LANE LINES RAN THROUGH JUNCTION MOUTHS.** The double yellows and the
  side-street centre lines were fixed for this in the streetRuns rewrite; the
  axis's own dashes and edge line were emitted by walking the axis directly and
  were missed. The FIRST fix asked "is this mark inside some other street's
  carriageway" and dropped **80% of Bras Basah Road's marks and 68% of
  Orchard's** — because OSM maps an arterial with slip roads, bus-lane ways and
  unnamed fragments running alongside it the whole way, and every one of those
  is "some other street". Nothing on screen said so; a street with no lane lines
  still looks like a street, and the junction frame looked BETTER. A counter
  printed beside the mark total is what caught it. The kept version finds where
  roads actually CROSS the axis, with a 25-degree angle gate so a parallel way
  is never a junction, and drops 6-11%.
- **A4 / `data/groundcheck.py`, the first gate here that looks outside the
  world.** Six published anchors, 10m tolerance, wired into deploy.sh and
  gates.sh, and VERIFIED TO FAIL on the pre-fix terrain (Raffles Ave 21.6m,
  Temasek 20.3m against 3-5m) before being trusted. Add anchors whenever
  research turns up a citable level; the table is in HANDOFF.md.
- **A trap that cost a whole deploy: never `pkill -f "node server.cjs"`.** The
  deploy runs its OWN snapshot server on 8934 so you can keep working while it
  audits, and a vet run tidying up after itself killed it — the deploy then died
  with ERR_CONNECTION_REFUSED mid-audit, which reads exactly like a code
  failure. Capture your own server's PID and kill that.
- **The stale-chunk guard earned its keep.** Restoring marinabay.json during the
  A4 gate test left it newer than its stream chunk with identical content, and
  deploy.sh refused to publish. The gates read world.json and riders read the
  chunks; that guard is the only thing standing between those two facts.

# THE DEFECT HUNT HAS BEEN RUNNING ON A SCENE THAT DOES NOT CONTAIN THE WORLD

**deploy.sh runs `SG_SCENE=world node data/defects.mjs`, and with streaming the
world scene never builds most districts.** Run per district and Marina Bay alone
reports 291 findings against the world scene's 0. They are not new — the same
counts appear on the pre-terrain-fix scene file, so they have been there for as
long as streaming has, invisible.

    orchard      4     rivervalley 1     bugis 4     robertson 1
    marinabay  291  <-- D2 119, D9 167, D20 1, D38 4

**COVERAGE IS FIXED**: deploy.sh now runs defects.mjs over `$DISTRICTS` — the
same one list the registry already provides, not a fourth copy of it — and then
the world. First full run, and this is the honest state of the eight:

    orchard      4     chinatown    7     robertson    1
    rivervalley  1     marinabay  290     littleindia  4
    bugis        4     brasbasah    5     world        0

**316 findings that the world scene reported as 0.** Seven of the eight are in
single figures and are the ordinary tail; Marina Bay is the whole problem and
almost all of it is D2.

## D9 IS FIXED: the ride and the dressing were asking ONE predicate TWO
## different questions

**Result: D9 167 -> 0, W2 unchanged at 25/35, Marina Bay's defect count 290 ->
123.** Bayfront Avenue is rideable end to end for the first time.

The fix is not a better water test — it is noticing that "can I ride over this?"
and "may something be BUILT here?" are different questions that had been sharing
one function. `blocked()` keeps the conservative rule and still governs
placement; a new `rideBlocked()` answers the ride's question, and water with a
bridge deck over it is a road to a rider. `window.__blocked` now points at the
ride question, because that is what D9 is asking.

**Why the obvious one-line version was wrong**, measured rather than assumed:
teaching `blocked()` itself put **125 meshes in open water, 74 of them more than
60m from any deck**. The placement paths walk the AXIS across the bridge and
offset furniture sideways without re-testing the point they place at, so the
moment the bay stopped being a blanket wall they reached straight off the deck.
That is still true and is the next batch: six placement loops need to test their
own placement point, not the centreline. Until then the split keeps the world
correct and the rider unblocked.

## (historical) D9: 500m OF MARINA BAY'S MAIN STREET IS NOT RIDEABLE, and the
## one-line fix is wrong on its own

Bayfront Avenue crosses the bay twice. `blocked()` in main.js returns true for
every point inside a water polygon; `standable()` in city.js was taught about
bridge decks when median kerbs were found standing in the bay, and `blocked()`
never was. So 167 points on the district's own centreline — about 500m — are
solid to a rider who is standing on a bridge.

`if (inWater(x, z) && bridgeDeckAt(x, z) === null) return true;` **fixes D9
completely: 167 -> 0.** It was tried, measured, and REVERTED, because the same
predicate gates where the dressing may place things and **W2 went from 32 to 706
things built in open water.** Making W2 deck-aware recovered only 7 of them,
which is the measurement that matters: the other 670 are in the BAY, not on the
deck. The dressing's reach has to be bounded to the deck's actual footprint
FIRST, and then both numbers re-measured together. The diagnosis is written into
blocked() itself so the next attempt starts from it.

**Kept from that attempt, because they are right regardless:**
- **W2 now exempts bridges BY MECHANISM** (`__bridgeDeckAt` over the sample
  point) instead of by a geometry-signature allowlist of deck/bridge-part/rail
  shapes. That allowlist was the FOURTH in this project and it broke the same
  way the other three did — a kerb is not in its list of bridge shapes. W2 fell
  32 -> 25 on Marina Bay as a side effect, which is 7 real things that were on a
  deck and being counted as in the water.
- **Every prop placement now uses `surfaceAt`, not `groundAt`** — main.js (8
  sites, including the PLAIN kerb emitter, whose PAINTED twin ten lines above
  had already been fixed and it alone was missed: one defect, two emitters),
  street.js (8), markings.js (5) and sgdetail.js (8). The road is not the
  terrain: it is drawn 6cm above it and it is the DECK where a bridge crosses.
  This is the same two-numbers trap that had the bike riding 5.5cm under the
  road for the whole project, one storey up.

**STILL OPEN, AND NOW MEASURED TO THE CENTIMETRE: D2 on Marina Bay.** Both kerb
emitters call `surfaceAt` — verified by reading the shipped lines, not assumed —
and the kerbs are still on the terrain. The numbers say exactly why:

    kerb at 3060,8587   drawn y 6.42   ground 6.25   deck 7.81   surfaceAt 7.87

`6.25 + SURFACE_PATH (0.024) + r[1] (0.15) = 6.42`, to the centimetre. So
`surfaceAt` DID run at placement, and inside it **`bridgeDeckAt` returned null
and `__onRoad` returned false** — while at check time the same point reports a
deck at 7.81. The bridge index is therefore EMPTY when the dressing runs and
populated afterwards.

**THREE THEORIES ARE DEAD. Do not spend the time again.**

1. *"A third kerb emitter somewhere else."* NO — the scene contains exactly two
   InstancedMeshes with signature `BoxGeometry(0.42,0.3,2)`, and main.js
   contains exactly two `new THREE.BoxGeometry(0.42, 0.3, 2.0)` sites. They are
   the painted run and the plain run, and BOTH now read `surfaceAt`; the shipped
   lines were read, not assumed.
2. *"sgdetail / street / markings still use groundAt."* NO — all four files were
   converted (29 sites) and `grep groundAt( src/main.js` returns nothing.
3. *"The bridge index is empty when the dressing runs."* NO, and this was
   INSTRUMENTED rather than reasoned: a temporary log showed **15
   `addBridgeWay` calls all complete before the first `dressStreet` call**, and
   `bridgeDeckAt(3060, 8587)` already returns **7.806** at dressStreet's first
   line. `clearBridges()` is exported and never called.

4. *"main.js shadows city.js's surfaceAt with a local one that ignores decks."*
   NO — main.js imports it on line 3 and never redefines it.
5. *"`target` carries a transform, so p3 (a world position) is placed relative
   to it."* Unlikely, and the numbers say so: a group offset would be CONSTANT,
   and the measured error varies with the ground (1.53, 1.56, 1.60, 1.63m) —
   the kerbs are tracking the TERRAIN, not sitting at a fixed offset below the
   deck.

**AND THEN THE PROBE WENT INSIDE THE EMITTER, which is where it should have
started.** Logging `surfaceAt` and `bridgeDeckAt` for the kerbs themselves, at
full precision:

    kerb 3059.72, 8587.04   surfaceAt at placement 6.27
                            surfaceAt after boot   6.27      deck: null (both)

**The kerbs are placed correctly.** There is no deck at their position, at
placement or afterwards, and `surfaceAt` agrees with itself to the centimetre.
They sit on the ground because the ground is what is there — they are just
OUTSIDE the bridge's half-width, at the abutment.

So D2's disagreement is at the DECK BOUNDARY: `bridgeDeckAt` is a proximity test
against `half + 0.4`, and a kerb 30cm outside that radius is on the ground while
the check's own sample lands inside it. That is the most repeated bug family in
this file — *"when two things describe one fact, the quantised one is wrong"* —
and it is the CHECK that needs the real units, not the world. The kerb run
follows the road round the abutment; the deck is a set of capsules.

**So the 118 are very likely not a world defect at all**, which is why they have
never been visible in a frame.

**DONE: D2 now accepts EITHER datum** — the deck answer or the ground answer,
whichever the prop is closer to. Within a metre of an abutment both are live and
they differ by the height of the bridge, so asking `surfaceAt` alone was asking
one of two right answers. Nothing is weakened: the cases this check exists for
(a prop 34m underground, a lamp 19m in the air) match neither. **Marina Bay D2
118 -> 87, district total 123 -> 92**, and all 42 checks still pass.

**The 87 that survive are a DIFFERENT finding and read differently**: they are
now *floating* 1.2 to 2.4m, not sunk, and the amount grows steadily along z
(3072,8567 -> 3072,8581) — i.e. up the bridge RAMP. A flat deck (`max terrain
along the way + 1.2`) plus a rising approach is the obvious suspect: a kerb run
following the ramp against a deck height that does not rise with it. That is a
real question about how `addBridgeWay` models an approach, and it is the next
thing to measure here — but it is 87 kerbs at a bridge abutment, not 500m of
main street, so it ranks below the recipes.

# SEVEN LANDMARK RECIPES WERE FLOATING, AND SRI MARIAMMAN'S HALL HUNG 10.7m
# ABOVE ITS OWN GOPURAM

The biggest single defect of the day, and it was found by accident while
debugging the mosque recipe.

`extrudeGeo(pts, h, y0)` seats a mass at `foot + y0 + h`, so **its `y0` argument
is measured FROM THE SEAT**. `api.footingY(pts)` returns that seat as an
**ABSOLUTE world height**. Eighteen calls across seven recipes passed one
straight into the other:

    api.extrude(b.p, 8.6, cream, g0)        // g0 = api.footingY(b.p)

which double-counts the ground, so the mass floats by exactly the height of the
ground under it. **Zero in a district built near sea level, and 10.7m in
Chinatown.** Measured, not inferred — every mesh's world bounding box near the
footprint:

    Sri Mariamman Temple, BEFORE   cream hall  y 21.5 -> 30.1   ground 10.8
                          AFTER    cream hall  y 10.8 -> 19.4   ground 10.8
                                   gopuram     y 10.8 -> 17.0   (always correct)

The gopuram, the cows and every hand-placed piece were right, because those are
positioned explicitly at `g0 + something`. Only the EXTRUDED masses were wrong.
So the temple stood on South Bridge Road with its tower on the ground and its
hall in the sky, and it shipped: five rounds of vetting, 42 audit checks, 35
defect classes, behaviour, determinism and a live check all passed, because
every one of them looks at the world in PLAN or asks about props, and this is a
defect in SECTION on merged building geometry. Same family as the roof-datum bug
of 2026-07-30, found the same way — by measuring the built scene.

Affected and now fixed: **buddhaTooth, sriMariamman, peoplesPark, thianHockKeng,
cqWarehouse, cqShophouses, oldHillStreet.** All 18 call sites now pass a
relative offset. Chinatown, Little India and Bras Basah still pass 42 checks.

**NEW CHECK D38** — "a named building floating above its own ground". It picks a
point that is definitely inside each named footprint (nudged off the centroid,
because a concave ring's centroid can fall outside it) and asks what the lowest
mass over that point is. The FIRST version attributed a mesh to a building when
the MESH's centre fell inside the ring, and reported 29 of 316 — an L-shaped
plan's main mass has its centre outside its own ring, so only high pieces got
attributed. Point attribution reports 4 of 417, and both remaining causes are
the probe rather than the world (see the note in defects.mjs).

**And D38 shipped broken for one run**: it asked `window.__groundAt`, which does
not exist, so every building failed the `if (g === null) continue` guard and it
reported a clean zero. The terrain is `window.__terrain`. Fourth time in this
project a check has been unable to see and said PASS.

## MASJID JAMAE IS WIRED, AND WHAT IT COST TO GET THERE

Round 1 and round 2 both failed the vet and both failures were MY OWN
arithmetic, not the design: the terracotta roof was placed at an absolute y that
had nothing to do with the hall's top and floated 2.6m clear of it, and the
compound wall — `api.extrude(b.p, 2.6, green, g0)`, the same call sriMariamman
makes — landed at **y 18.1 to 20.7 on ground of 9.0**, a 63x43m green slab nine
metres in the air over the whole site. Both frames read as "a green blob" and
neither told me why.

**What broke the loop was instrumenting instead of looking again.** Dumping
every mesh's world bounding box near the footprint took one probe and gave the
answer in one line; the minarets had been correct at 14.8m the whole time and
were simply being buried by the floating slab. That is the Clarke Quay lesson
written down again: INSTRUMENT THE COMPUTED POSITIONS BEFORE PLACING ANYTHING,
and when a frame is confusing, measure the scene rather than take another frame.

Round 3 replaced the extrude with a placed box and passed: the gateway, the two
seven-tier banded octagonal minarets with onion domes, and the white
domed-kiosk screen between them all read from the rider's seat, against a
generic that read as a glazed two-storey shophouse block. Chinatown still passes
42 checks with P1b 0.

STILL OWED on this one: the hall roof is a flat slab where it should be hipped,
and the compound is a solid pad where it should be a wall around a courtyard —
from above it reads as green paint. Neither is visible from the street, which is
why it shipped.

## CENTRIUM SQUARE IS WIRED — and the generic was drawing an 80m-wide tower

The clearest case yet for judging a recipe against what it replaces. Centrium
Square's OSM ring is **3,699 m2 against a published site of 6,365.8 m2**, and
the published office plate is ~904 m2 — about a QUARTER of the ring. So the ring
is the PODIUM, and extruding it to 19 storeys, which is what the generic family
did, draws an eighty-metre-wide nineteen-storey glass slab on Serangoon Road.
The A/B frames are unambiguous.

The recipe divides `b.h` by the published floor stack (L1-2 retail, L3-4 car
park, L5 facilities deck, L6-8 medical, L9-19 offices) rather than inventing a
metre figure — no metre height is published for this building and `b.h` is our
own 19 x 3.4 carrying `levels` provenance.

Two rounds of vet corrections, both mine:
- **The street face was sized from the oriented box's SHORT side**, and this
  building's 80.1m frontage is its LONG one, so the cube cladding covered the
  middle quarter of the facade. An oriented box has two dimensions and nothing
  about the box says which meets the road — the frontage is now measured by
  projecting the ring onto the along-street axis.
- **Random cube colours read as confetti**, with far too much red. Tumbling
  blocks is a REGULAR pattern; the tone now comes from the cell's coordinates
  and the vermillion/mustard are sparse deterministic accents.

STILL OWED: the panel field stops partway along the podium because it is placed
on one plane found by marching out from the centroid, and this ring has a
published 26.5 x 11.6m notch cut from its SW corner, so the street face is not
one plane. Cosmetic; the massing is the correction that mattered.

## FOOK HAI IS WIRED; TEKKA PLACE IS PARKED AT ROUND 3

**Fook Hai** took three rounds and every one of them was a scale or a
visibility mistake, not a design one:
1. The recessed bands were inset by 1.2% of a 45m plan — 27cm — and read as
   pencil lines instead of shadow-slots. A PROPORTIONAL inset has to be checked
   against the real metres it produces. (Fifth time in this project.)
2. Deepening the inset to 4.5% changed nothing, because **a recess cut into a
   solid mass is invisible**: the full-height mass is already drawn and anything
   grown inward from it is buried inside it. Exactly the trap that hid the
   second face of the direction gantries.
3. Drawing the dark band slightly PROUD instead gives the elevation the
   alternating projecting-slab-and-dark-band read it actually has.

Also recorded in the recipe: SkyDB's "21 floors, completed 1974" is wrong (21
floors inside OSM's 32m is 1.5m per floor), and OSM's `height=32` is not a
survey — hand-entered in 2020, no source tag, "Bing" imagery.

**Tekka Place is written, diagnosed and NOT wired.** After three rounds its
ninety-metre lotus screen still lands on the annex's twenty-metre END face, and
what is left is a bare charcoal slab — worse than the glazed block the generic
draws, which is the definition of a regression here. The diagnosis is at the
head of `tekkaPlace()`: the face chooser drops the long-flank candidates before
scoring them, and the only exit from that loop is `e <= 0`, i.e. the outward
march from the centroid never leaves the ring — which is what a long, thin,
CONCAVE ring does, because its centroid is outside it. D38 had to nudge around
the same concavity an hour earlier in the same session. **Next step is to
instrument the three candidates' (extent, edge) pairs before touching anything**
— that is what ended the Masjid Jamae loop after two wasted rounds.

## WHERE THE EIGHT ACTUALLY STAND (frontage, from data/accuracy.py)

The frontage is what the finish line is written against. "height" below is
surveyed metres + storey-derived; era is a conservation-area band or a material.

    district      height   era    named    the gap
    chinatown      92%     99%     13%     essentially done
    marinabay      95%     79%     16%     essentially done
    robertson      94%     27%     33%     ERA — Robertson Quay, Chatsworth Park
    rivervalley    82%     41%     20%     ERA — River Valley, Robertson Quay
    orchard        85%     61%     64%     era
    brasbasah      82%     78%     43%     balanced
    bugis          54%     78%     19%     HEIGHT
    littleindia    45%     92%     22%     HEIGHT

## THE SCORECARD HAS A CEILING, AND IT IS THE DATA, NOT THE EFFORT

Measured 2026-08-01, after the conservation bands landed. This is the answer to
"can these districts be finished" and it should stop anyone grinding at a number
that cannot move.

**Era, Robertson and River Valley** — the two worst columns at 27% and 40%:

    robertson    42 frontage buildings, 29 with no era/year/material,
                 of those inside a gazetted conservation area: 0
    rivervalley  66 frontage buildings, 34 with no era/year/material,
                 of those inside a gazetted conservation area: 0

Not one. They are modern condominiums on River Valley Road, outside every URA
gazette, and OSM carries no `start_date` and no `building:material` for them. Of
the 63, exactly **five are even NAMED** — Yong an Park, Riva Lodge, Valley
House, an Esso station and a preschool — so there is nothing for a research
agent to look up for the other 58. The conservation route, which is what raised
these numbers everywhere else, cannot reach them at all.

**So: era is chaseable where a gazette covers the stock, and nowhere else.** It
was worth ~370 buildings across the region (Mount Sophia 149, Upper Circular
Road 127, Fort Canning/Coleman 33, Cheang Jim Chwan 26, Chatsworth Park 21,
Pearl's Hill 11) and that has now been taken. **Recipes** remain chaseable and
are the real lever left. **Heights are mostly not**: Little India's 123 unsourced frontage buildings are 117 shophouses
under 400 m2, OSM carries 21 height tags for its 2,134 buildings, the HDB join
is already fully exploited (every HDB block that lands inside a footprint has a
source), and no one publishes a metre height for a shophouse. They are drawn at
2-4 storeys by a shape rule, which is honest and looks right; the ledger scores
them zero because it refuses to call a rule a measurement, and that is correct.
Do not "fix" this by laundering the rule into a source.

# OPEN, MEASURED, NOT SOLVED — PEDESTRIANS ACCUMULATE IN CARRIAGEWAYS

Found by riding: a walker standing in the middle of River Valley Road in the
Robertson frame. D36 reported 5 for that district, which is TRUE AT LOAD and
misleading after: sampled every 4s, the count runs 54, 47, 37, 37, 40 out of
2,200. Walkers ACCUMULATE in roads over the first seconds and then plateau —
D36 happens to sample at t=0 and sees the low-water mark. Worth fixing in the
probe as well as the world.

DIAGNOSED. Every one of them is offset BEYOND its own path's carriageway (6.3m
out from a 4m half-width, 10m, 13m) and standing in a DIFFERENT street's
carriageway — the junction case. The reactive escape in actors.js probes
inward, outward, then ±6 and ±10 metres, but every probe keeps the walker's own
sign (`* sgn`), so where a whole SIDE of a stretch is carriageway — a wide
junction mouth, a slip road meeting the main street — there is nowhere for the
search to go and the walker stands in traffic indefinitely. Twelve were still
on the tarmac after sixteen seconds with the correction firing the whole time.
The mask's own dead-stretch u-turn never fires for these, because the mask is
quantised to whole metres and still reports clear bits at that bucket while the
road index says otherwise — the same quantised-versus-real split that has
produced half the bugs in this file.

DONE: when no offset on the walker's side clears, it now turns round, which is
the answer the file already has for "the footway ends here" — it moves nobody
sideways across a live carriageway and reuses the reflection the path ends use.
Measured improvement only: 12 stuck -> 10, plateau 54 -> ~40. All behaviour
checks still pass (B1 2.31 m/s, B3 0 discontinuities).

NOT DONE, and it needs a real design rather than another probe: crowd paths run
along streets and their pavement offsets cross OTHER streets at every junction.
The right fix is at path level — either route pavement walkers around junction
mouths, or make them use the mapped crossings that are already in the data
(217 of them in Little India alone) instead of drifting across. That is a
behaviour piece, not a patch, and it should be measured with the 5-sample
plateau above rather than a single t=0 reading.

# 2026-07-30 late night (Opus 5) — WHAT THE MEASUREMENTS ACTUALLY SAY

THREE METRICS WERE LYING, all in the same direction — describing the code's
control flow instead of the world:
1. accuracy.py's headline was a CLASS ratio, identical (21/28) for all seven
   districts. A ledger that cannot tell a finished district from one built the
   night before cannot answer the one question it exists for. It now also
   reports FRONTAGE-ONLY coverage — the buildings within 45m of the main
   street, which is what the finish line is actually written against. It
   reproduces Orchard's hand-counted 68 exactly.
2. "landmark massing" in that ledger was reading `b.k`, the data's LANDMARK
   FLAG, and reporting brasbasah at 0 while it visibly has the National
   Gallery, CHIJMES and the Esplanade.
3. R1 counted only `stats.bespoke`. A shophouse is drawn by shophouse() — a
   real recipe with a five-foot way, pitched roof, doors and shutters — but it
   is dispatched BEFORE the name lookup, so it increments stats.shophouses and
   never stats.bespoke. R1 said Chinatown was 28 of 360. It is 1,822 of 2,135.
   Honest figures now: littleindia 90%, chinatown 85%, orchard 75%,
   robertson 53%, marinabay 53% drawn by a real recipe.

TRAFFIC NEVER CULLED FOR DRAWING. Its own comment said the player position was
"only used to decide where a vehicle may be recycled", and its meshes are
frustumCulled=false — so once every district got its own fleet this evening, a
phone was submitting 630 vehicles to look at about forty, from every angle,
always. Now packed into the front of the buffer with .count set, exactly as the
crowd has done since 2026-07-27. Measured: traffic 380k triangles -> 1k. The
SIMULATION still runs for all of them, so a street is busy when you arrive.

AND A PERFORMANCE GHOST I NEARLY CHASED, recorded so nobody else does. The HUD
read 20fps and I started digging into the merged building fabric (63% of
triangles, and tile-LOD only registers tiles UNDER 4m tall, so building tiles
are never distance-culled — that part is true and is the real lever if it is
ever needed). But Orchard ALONE and the full region both measured exactly 20,
min and max, with loads differing by a million triangles. That is not a GPU
limit, it is Chrome throttling a window that sits behind the terminal — a trap
already written down here: "the same spot reads 51fps focused and 23 in the
spawned window". There is NO measurable regression and no honest way to measure
frame rate from a script. The only trustworthy source is a HUD screenshot from
the user's own phone. Do not optimise against these numbers.

STATE OF THE EIGHT: all pass 42 checks with no blockers. P1b is 0 in six of
eight (bugis 2, littleindia 1 — all large merged masses overhanging back lanes,
ratcheted with reasons). Frontage heights run 42% (littleindia) to 92%
(chinatown). Phone-size verification on the LIVE site: boots clean, no page
errors, no horizontal scroll, wayfinder/minimap/pills all correct.

# DESIGNED, NOT BUILT — WHAT HAS TO HAPPEN BEFORE THE ISLAND

The user asked whether to one-shot the whole of Singapore and polish after.
Answer, with numbers rather than opinion: expanding the DATA is free and safe,
expanding the BUILT WORLD is not, and there is exactly ONE hard blocker.

BOOT FETCHES EVERY CHUNK. `buildStreamed` does
`await Promise.all(mani.districts.map(fetch))` before anything renders.
Measured today across the eight chunks:
    total on disk            3.8 MB
    roads      2.12 MB (49%)     buildings  1.54 MB (36%)
    shops      0.37 MB ( 9%)     lamps      0.13 MB ( 3%)
Singapore at this bbox size is roughly 35-45 districts, so that is ~20 MB
downloaded on a phone before you can move. That is the blocker.

WHY IT LOADS EVERYTHING, and why the obvious fixes do not work:
The boot needs a UNION for four things — the terrain mesh, the surround massing
(grey blocks must never stand where a later chunk will build real buildings),
ROADIX/colGrid/water (the documented seam bug: "a chunk build that could not
see a neighbour's roads laid kerbs in Waterloo Close"), and REGIONB, the
shopfront neighbour index added 2026-07-30.
  - "Ship a lighter union": measured. Geometry only, dropping every tag, name
    and shop, is 2.29 MB at eight districts — 63% of full — so 11.5 MB at
    forty. Does not solve it.
  - "Rasterise the road index to a bitmap": NO. onRoad(x, z, 0.3) is a
    clearance query used for placement, and a 2m raster cannot answer it. That
    is the quantised-proxy trap this project has hit five times today; do not
    introduce a sixth deliberately.

THE DESIGN THAT DOES WORK, because it separates what needs PRECISION from what
needs REACH:
  1. The SURROUND is the only thing that genuinely needs to see the whole
     island, and it is deliberately coarse — featureless massing kept 40m clear
     of any road. So ship a coarse OCCUPANCY GRID (buildings + water) at ~8m
     for the whole region: about 60 KB, and CONSTANT no matter how many
     districts exist. Quantisation is harmless here in a way it is not for
     onRoad, because the surround is already an approximation by design.
  2. ROADIX / colGrid / water / REGIONB are built from LOADED chunks only and
     extended incrementally as chunks arrive. The seam bug is not solved by
     loading everything — it is solved by loading a chunk's NEIGHBOURS BEFORE
     BUILDING IT, which content-box streaming already tends to do and which
     should be made explicit rather than left to luck.
  3. Chunks fetch on approach instead of at boot.
Result: boot cost stops scaling with district count. Until this lands, do not
go much past a dozen districts.

ORDER OF WORK RECOMMENDED TO THE USER: cache the island's raw OSM (free, zero
risk, kills the 40-minute Overpass fetch), then this, then expand in a ring
outward a few districts at a time — every district built later inherits every
fix for free, which is why Little India cost about twenty minutes.

# 2026-07-30 late (Opus 5) — LITTLE INDIA'S DAY-ONE RATCHETS, CLOSED

P1b 8 -> 1 and T1 2 -> 0, and the diagnosis in the previous entry was WRONG in
a way worth keeping. I wrote them up as "3cm railing posts on Birch Road where
the kerb-clearance search has nowhere to stand". A probe said otherwise: at
those exact coordinates `__onRoad` returns TRUE, so any clearance test would
have rejected them, and the nearest taxi rank is 69m away. The audit's own
signature said `CylinderGeometry(0.03x1.05)` and the taxi rank's post is 1.00 —
they were MRT ENTRANCE RAILINGS from sgdetail.js.

An entrance is five metres wide with a balustrade at ±2.6m from its centre, and
`pushClear` only ever moved the CENTRE. So an entrance sitting neatly beside a
kerb put its rail posts in the carriageway. This is precisely the finding
city.js already carries for entrance-canopy posts — "the posts stand at the
ends of that width, and clearance.outward only checked the projection straight
out from the middle" — in a file that had never heard about it. The entrance
now tests where its rails ACTUALLY STAND, walks further from the road if they
are not clear, and builds nothing if no offset works.

Six of the eight findings were that. P1b is now 0 in six of eight districts,
1 in littleindia, 2 in bugis; all ratchets tightened to what they measure.

W2 37 -> 35 the same evening: `sgdetail.js`'s emit had NO water guard while
street.js and markings.js both had one, so its median kerbs were built in
Marina Bay 21m and 87m from the nearest shore. All three now share a
`standable()` in city.js that is DECK-AWARE — a median on a causeway survives
because it is standing on the causeway, which only became expressible once
bridge decks existed.

THE PATTERN, AGAIN: three files doing the same job, one of them never told.
That is the fifth or sixth instance today (the district lists, the pedestrian
signature allowlists, the pretty-name table, the water guards, the clearance
tests). When a rule is worth having in one file it is worth asking which other
files were supposed to have it.

# 2026-07-30 night (Opus 5) — LITTLE INDIA IS THE EIGHTH DISTRICT

The user lifted the polish-first order ("expand more districts if you want"),
so: Serangoon Road from the Rochor end to Farrer Park, with Race Course Road,
Buffalo Street, Dunlop Street, Kerbau Road, Tekka and Sim Lim. 2,088 buildings,
1,662 roads, 756 named shopfronts, 217 mapped crossings, 1,212m of main street
at 100% coverage, terrain pinned to opentopodata like every other district.
Chosen because it CLOSES A HOLE rather than reaching into empty map — it
overlaps bugis and orchard by design so the region stays one block.

TOOLING THAT HAD TO BE FIXED TO GET IT:
- OVERPASS MIRROR ORDER WAS STATIC and three of the four were down that
  evening, with the survivor rate-limiting. Every part paid 150s of timeout
  per dead host before reaching one that worked. `order_mirrors()` now probes
  all four with a one-node query, DROPS the dead ones from the ring entirely
  (a host that will not answer a probe will not answer a district query, and
  each attempt on it is a full timeout), and treats HTTP 429/502/503/504 as
  BUSY rather than DOWN — the first version declared the only working mirror
  dead because we had rate-limited ourselves against it.
- THE DISTRICT LIST WAS WRITTEN OUT THREE TIMES: deploy.sh's audit loop,
  deploy.sh's dist copy block, and gates.sh. That drift is exactly what left
  districts four to seven ungated for a week. All three now read districts.json,
  which already knows. A `planned` status keeps a registered-but-unbuilt
  district out of the gates instead of failing every deploy.
- `build_district.py` does NOT run terrain.py; that is a separate step in the
  sequence and it is easy to miss — littleindia passed check.py with NO
  HEIGHTFIELD AT ALL before I noticed. Worth adding to the tool one day.

DAY-ONE RATCHETS, itemised rather than inherited: P1b 8 and T1 2, which are
TWO classes — six or seven 3cm railing posts on BIRCH ROAD, a lane narrow
enough that the kerb-clearance search finds nowhere to stand and leaves them
where they were (the same family as the bus shelters that used to fall back to
their blocked point), and one 41.8m mass across KLANG LANE, a service lane.
Target is 0 for both. S8 74 is the district's own frontage coverage; it was
failing against the WORLD's 76, which is a different and larger network.
Eight OSM tags arrived that no other district carries: five kerbside-parking
tags (DEFERRED — Serangoon Road genuinely parks along the kerb and this is the
data that will place those cars when traffic learns to park) and three transit
`network` tags (IGNORED — an operator's name carries no geometry).

# 2026-07-30 night (Opus 5) — SIX DISTRICTS HAD NO TRAFFIC AT ALL

`new Traffic(...)` was created ONCE, for the primary axis, in the region build.
`addChunk` never built any. So every streamed district — South Bridge Road,
Victoria Street, Bayfront Avenue, all of them — had completely empty
carriageways. District CROWDS were given their own instances two sessions ago
and traffic was missed in the same pass, which is exactly why the pavements
looked alive and the roads did not.

FIXED with the crowd's own lifecycle: `extraTraffic[]`, one Traffic per chunk
built into that chunk's group, fleet scaled from the primary axis's own
figures (Orchard is 2,586m with 78 cars and 12 buses, so one car per 33m and
one bus per 215m), ticked in all three update paths and dropped on unload.
`trafficHits()` and `trafficNearest()` fold every fleet into one answer for
the ride, the walker and the engine sound — a car you can see but ride
straight through is worse than no car.

A SPLIT BUILDING PART INHERITED ITS PARENT'S GUESSED HEIGHT. Found because
check.py refused a deploy after marinabay was reprocessed: "2 sub-230 m2
footprints taller than 16m with GUESSED heights". They were REAL and they were
old — two 18m towers on 60 and 92 m2 courtyard fragments in Orchard — and they
had been invisible because the parts also carried the PARENT'S stale area
(both recorded 275 m2; six Orchard Parksuites fragments all recorded 1409).
split.py recomputes each part's true area, which is the whole point of it, and
that is what finally let the check see them. `_recap_guess()` now re-applies
process.py's own small-footprint storey cap after a split, and only to GUESSED
heights — splitting a footprint is not new information about how tall it is.

ALL SEVEN DISTRICTS ARE NOW ON ONE PIPELINE. Reprocessed every district from
its raw cache with a before/after count on every layer and an abort on any
loss. Six came back byte-identical — they were already current. MARINABAY was
the stale one: 247 -> 296 buildings (the tower-on-a-podium rule bites hardest
in a tower district), plus UOB Plaza Tower Two dropping from the inherited
280m cap to its real 162m. Checked chinatown's raw cache still held the river
that topup.py recovered BEFORE reprocessing anything, because a reprocess
would have silently dropped it.

TWO STALE TRIAGE ITEMS CLOSED BY MEASUREMENT, NOT BY WORK:
- "The shophouse fabric heuristic misses Chinatown's larger conserved rows."
  It does not. 1,794 of 2,135 chinatown buildings (84%) take the shophouse
  path, and the 52 pre-1970 buildings it skips are Old City Hall, the
  Fullerton, the Old Supreme Court, Masjid Sultan and St Joseph's — civic
  monuments that must NOT be shophouses. A rider's-eye crop of South Bridge
  Road shows the conservation rows reading correctly: sage and cream, green
  shutters, timber doors, roller shutters, signboard lintels, five-foot way.
  The morning's ground-floor work fixed this; the triage note was stale.
- The "blank black panel" over Orchard Road is a gantry backer seen from 8m.

STILL OPEN, honestly: street furniture standing in open water in marinabay (a
lamp head at 3051,8878, median kerbs at 2315,8679 and 3065,8773, a sign box at
2256,9252 — all 16 to 97m from the nearest mapped bridge, so genuinely
misplaced, not bridge furniture). Fix: furniture siting should consult
inWater() the way it already consults onCarriageway(), and skip rather than
substitute. Also: Angsana trunks look oversized against a narrow conservation
frontage on South Bridge Road — not touched, because the proportions were set
deliberately from NParks figures and changing them globally to suit one street
would be the wrong trade.

# 2026-07-30 night (Opus 5) — ROAD SHADOW FIXED, AND A NEW TOOL TO LOOK WITH

`data/streetshot.mjs` — rider's-eye frames at named spots (`canyon`,
`orchard`, or bare `x,z,heading` triples). The sweep is slow and headed and
the comparison sheet places cameras off the Orchard axis; neither answers "go
and look at THAT corner", which is what most vets actually need. It waits for
the streamer to finish before shooting, because a frame taken one second after
a teleport is a photograph of a district that has not been built yet — already
mistaken for a defect once today.

ROAD-SHADOW PATCHWORK (queue item 4) FIXED. In shadow the sun contributes
nothing and a road, whose normal points up, takes the HemisphereLight's sky
colour alone. That was 0xa6c8e2, a saturated light blue, so dark asphalt times
saturated blue is navy — then ACES crushes what is left. Real shadowed tarmac
is a desaturated grey that leans blue, not a blue that leans grey. Sky term
desaturated to 0xbcc8d2, ground 0x9a8d78, intensity 1.35 -> 1.62. Vetted at
four CBD canyon spots AND three points on the Orchard axis, so the fix is not
one that only works where the problem was: the canyon foreground is now a grey
shadow instead of ink, and open Orchard is unchanged.

RESOLVED, NOT A DEFECT — recorded because I wrote it up as one first. The dark
panel over Orchard Road near the axis midpoint is the BACKER of a directional
gantry, seen from eight metres away and almost directly underneath. From 20m
and 50m back the same gantry reads correctly (green board, white text) and
nothing hangs in the view. `face.rotation.y = ang + Math.PI` is right: the
plane's normal ends up pointing back down the road at an approaching rider.
No change made. If a future frame shows a blank board, check the CAMERA
DISTANCE before the code — under a gantry you are supposed to see its back.

# 2026-07-30 evening (Opus 5) — THE CBD DID NOT EXIST WHEN YOU STOOD IN IT

Chasing the crown vantages (queue item 2) found a user-facing streaming bug
worth far more than the frames.

`axDist` decided everything about streaming — load under NEAR=900, unload past
FAR=1700 — and it measured the distance to a chunk's MAIN-STREET AXIS. A
district's axis is not its extent. Marina Bay's axis runs along the bay; the
chunk that owns UOB Plaza, One Raffles Place and Republic Plaza (all three
280m, the height cap) reaches west to x=1770 and CONTAINS Raffles Place.
Standing between the three tallest buildings in Singapore, the test measured
904m against a 900m threshold and left all three unbuilt. FOUR METRES of
margin decided whether the CBD skyline exists.

Measured, not inferred: parked the ride at Raffles Place for 160s — chinatown
and rivervalley streamed in, marinabay stayed pending forever, and a ray
dropped down UOB Plaza's centre hit bare ground at 25.2m. From that spot the
axis distances are marinabay 904m / chinatown 418m while the CONTENT box
distances are 0m and 0m: you are inside both.

FIXED: `nearDist` measures to the chunk's content box (zero when you are
inside it), falling back to the axis only for a chunk with nothing in it.
Ties broken on axis distance, so where two overlapping districts both contain
you, the one whose street you are actually on builds first. After the fix the
same ray hits the crown at 297.7m and marinabay streams in within 10s.
GOTCHA PAID FOR ON THE WAY: the first version computed its own bbox and cached
it on `rec.box` — a property the chunk record ALREADY HAD, as [x0,z0,x1,z1] —
so it read an array, took `.x0` off it, got NaN, and NOTHING streamed anywhere.
Adding a field that already exists is its own kind of bug.

AND WHY THE CROWN FRAMES WERE EMPTY, after five rounds and three wrong
theories: THE FAR PLANE. It is tuned for a rider at street level, about 700m,
and a skyline shot stands 660-900m back by design, so a 280m crown sits at a
range of 723m and is CLIPPED while everything nearer still draws. Projecting
the crown into clip space is what finally said it — NDC z = 1.001, a
thousandth past the plane. `placeCrown` now pushes the far plane to 2.5x the
shot distance. The two wrong theories on the way were both real bugs and both
are fixed: the camera was placed at an ABSOLUTE y=15 which is ten metres
UNDERGROUND out in the bay (you see sky through the terrain's backfaces while
a ray to the tower still travels up and hits it — the same two-numbers trap as
the bike riding under the road), and the clearance test scored an unobstructed
view of NOTHING as perfect, so a chunk that had not streamed in won every
candidate. `placeCrown` now reports SUBJECT NOT IN FRAME rather than returning
a silent rectangle of sky.

FIRST REAL FINDING FROM THE FRAMES: UOB Plaza reads as THREE equal cylinders
from across the water. The height table is matched by SUBSTRING with
longest-key-wins, and the map spells them "UOB Plaza Tower 1" and "UOB Plaza
Tower 2" — neither of which contains the researched key "uob plaza 2" — so
both fell through to the bare "uob plaza" and inherited the 280m aviation cap.
process.py now carries both OSM spellings, Tower 2 at the same 162m the
researched line already had (two spellings of one building must not carry two
numbers). NOT YET IN THE WORLD: this only takes effect when marinabay is
reprocessed and the region re-merged, which shifts a scene and therefore wants
its own batch and its own gate run. Queued, not done.

ALSO FIXED (user rode past and reported it): the mode pill always read "Get
off". `updateHelp()` opens with `const el = document.getElementById('help');
if (!el) return;` and the #help panel was deleted from index.html at some
point, so the guard fired on EVERY call and the line that relabels the button
was never reached — the pill kept the literal text from the markup forever. A
guard for one element must not gate another. The label now lives in a hoisted
`modeLabel()` both updateHelp and setVehicle call, and it names the vehicle:
Get off / Ride / Drive. Verified through every transition.

# 2026-07-30 late afternoon (Opus 5) — THE CROWD HAD NEVER BEEN LOOKED AT

The user rode past and reported "the legs and limbs all suddenly vibrate at a
very fast rate", then "why is everyone Indian and got no faces". Both true,
and the first frame of `data/crowdshot.mjs` showed worse: bodies floating,
legs in a detached X, shoes scattered flat on the pavement with nobody in them.

WHY NO CHECK SAW IT. Every tool in this project is built to ignore the people.
The sweep gates on draw calls, the audit walks a STILL scene, behaviour.mjs
measures speeds and path continuity (all five green throughout this), and
landmark.mjs deliberately passes `nopeople`. The walkers were counted, never
looked at. `data/crowdshot.mjs` is the missing tool — three framings (portrait
at 3.2m, pair at 7m, street at 14m), the subject picked as the walker with the
most neighbours within 12m so a bad figure cannot be framed out, and the camera
placed from TWO position samples 320ms apart so it stands in FRONT of someone.
Every framing derived from the road normal photographed the backs of heads.

FOUR BUGS, ALL IN THE FIGURE:
1. THE STRIDE WAS THE CLOCK TIMES A SPEED.
       Math.sin(time * 5.2 * (gait / 1.3) + pr.phase)
   scales the frequency by the CURRENT speed and multiplies by ABSOLUTE time,
   so the argument is time x k(t) where it must be the integral of k. The
   derivative carries a `time * dk` term: a walker whose speed wobbles by
   0.01 m/s jumps 4 x time x 0.01 radians in ONE FRAME — nothing at ten
   seconds, twelve radians five minutes in. That is the reported vibration and
   why it seems to start from nowhere. A stride is a phase you accumulate.
   Guarded (`dt > 0 && dt < 1`) because an accumulator is unforgiving: one NaN
   dt and that walker's matrices are NaN forever, the class P11 now refuses.
2. LIMBS ROTATED ABOUT THEIR OWN CENTRES, not their joints. Pitching a thigh
   41 degrees about its middle swings the top backwards out of the pelvis and
   the bottom forwards — the two legs cross into an X below a body they are no
   longer joined to. Now hung: centre = joint + R_x(t).(0,-L,0). A foot rises
   by L(1-cos t) as it swings, which is what makes a walk read as a walk. The
   joint heights are chosen so at t=0 every part is EXACTLY where it was.
3. THE LEG CAPSULE WAS 15cm TOO SHORT TO REACH ITS OWN SHOE, standing still:
   0.44 + 2r = 0.556 hung from a hip at 0.798 ends at 0.242, shoe top 0.095.
   Now 0.587. This, not the swing, is why shoes looked scattered and ownerless.
4. EVERY PART SAMPLED THE TERRAIN UNDER ITSELF, so a walker crossing a kerb had
   their shoes on the road surface and their head on the pavement, each part
   twitching independently over the step. One ground per body now.

AND THE LOOK: stride cut ±0.72 -> ±0.40 rad and tied to actual speed (82
degrees between the legs is the splits, not a walk; a slow walker now takes
short steps, which is most of what makes a crowd read as a crowd rather than
one animation played by everybody). Torso and hips scaled in the GEOMETRY to
39cm across and 21cm deep — the arms hang at ±0.19 and the torso was 25cm
wide, so they floated 6.5cm clear of the body on each side. SKIN reweighted to
the city: the palette was five mid-browns picked with EQUAL probability, now
weighted to roughly 74/13.5/9 Chinese/Malay/Indian (SingStat) with the paler
end nudged up for Orchard's visitor share, entries repeated to weight the draw
because a weighted pick would need its own random stream and a texture must not
be able to move a bus stop. Hair got brown and grey. FACES are drawn into the
head sphere's own UV (`texFace()` in tex.js) — eyes as instanced spheres would
be two more InstancedMeshes for something visible only within a few metres,
while a map is free: the instance colour MULTIPLIES it, so a white field leaves
every skin tone untouched and only the features darken. Face goes at u=0.25
because three.js SphereGeometry starts phi at -X, so that is +Z, the way a
walker faces. It was invisible at first because the hair cap ran to 0.62pi and
covered the top 56% of the head, brow and eyes included; a hemisphere puts the
hairline at 40%, where a hairline is.

THE GATE CAUGHT THE EXIT. Lengthening the leg revoked the pedestrians'
exemption in P1 and three walkers mid-crossing became BLOCKERS — the third time
a geometry-signature allowlist has bitten this file (tree branch, lamp bracket,
now the crowd), and the comment above ROAD_OK predicted it in writing: a
signature list "fails OPEN for new shapes and fails CLOSED for changed ones".
Props now carry `crowd: !!o.userData.crowdPart` and P1/P4 exempt by MECHANISM.
Stop describing a person by their measurements.

ALSO: audit gained `R1`, ungated, reporting real recipe coverage from
`stats.bespoke` — ORCHARD IS 102 OF 283 NAMED, not the 8 that accuracy.py's
landmark FLAG suggested. Ungated on purpose: a budget there would either be met
by writing bad recipes or ignored.

STILL OPEN ON THE CROWD: hands are pale spheres that read as balls at the
sleeve end; legs are thin sticks under a now-wide torso; shoes are flat slabs.
None of it is wrong, all of it is coarse — a second pass if the user wants it.

# 2026-07-30 afternoon (Opus 5, main loop) — ONE DATUM PER BUILDING

The user looked at an Old Hill Street vet frame and asked about "the roof
floating off the building". He was right, and it was not that building: it was
the whole seating model.

`extrudeGeo(pts, h, y0)` chose the footing datum from **the thickness of the
piece being extruded** — `h <= 16 ? streetFootingY : footingY`. So a 30m mass
took footingY (7.31m at Old Hill Street) while its own 0.7m parapet cap took
streetFootingY (20.5m), and the cap landed at 50.5m over a roof at 37.31m:
13.2m of daylight, a pale slab in the sky. Every trim course, cornice and
shopfront band in city.js AND landmarks.js funnels through extrudeGeo, so the
same split opened under every one of them on every sloped site in the world.
It could never show on flat ground, which is why 41 green checks never saw it.

FIXED, in two goes — and the first go was wrong in an instructive way.

First attempt: ONE datum per building (`FOOT`), set once at the top of the
builder loop from the rule the mass already used. The parapet stopped floating
and no mass moved. **The gate refused it**: `S8 67/68` on brasbasah, a FLOOR,
one street-level tenant short. Right diagnosis of the mechanism, wrong
conclusion from it — putting the ground floor on the structural seat buried the
shopfront band at the bottom of the hill BEHIND the building.

A building on a slope has TWO honest datums, and the original bug was never
that there were two. It was that the choice between them was made by the
THICKNESS OF THE SLICE rather than by what the piece is:
  FOOT    the structural seat, the lowest ground under the ring, so the mass
          fills the fall and no daylight shows downhill. The roof is FOOT+h,
          so everything that caps or stands on the roof measures from it.
  STREET  where the building meets the pavement it fronts. Everything at
          ground level measures from this, because a ground floor is at street
          level by definition.
Old Hill Street separates them by 13.2m. Seat the parapet on STREET and it
floats over its own roof; seat the band on FOOT and it goes into the hill.

extrudeGeo, extrude and `api.footingY` read FOOT; addShopfront lifts its band
by `STREET - FOOT` rather than being given a second seat; `seatY(b)` and
`streetY(b)` are exported so buildShopfronts — a later pass, long after both
are back to null — cannot invent its own. `api.footingY` now answers with the
current building's seat instead of re-sampling whatever ring a recipe hands it,
which was a second route to two seats for one building.

RESULT: S8 went UP in four districts and held in the other three — orchard
72->73, brasbasah 68->69, rivervalley 40->43, marinabay 52->57, chinatown 63,
bugis 67, robertson 67. At street level the band reaches tenants it could not
reach from the bottom of the hill. All four floors raised with the reason
written into audit_world.js; floors go up, never down.

TWO MORE OF THE SAME FAMILY, found while fixing it, both confirmed by probe:
- **Rooftop plant has never been visible, anywhere.** Plant boxes, stair
  housing, water tanks and duct runs are raw BoxGeometry translated to an
  ABSOLUTE `y = h`. Nothing seats a raw BoxGeometry, so every one of them sat
  a full footing below its own roof — 7.3m into Old Hill Street, 26 to 50m
  into Orchard. An entire detail layer built, merged and shadowed inside the
  buildings since the day it was written. Now seated on `FOOT + h`.
- **The recessed lobby and the entrance canopy were underground too.** The
  lobby back wall at y=2.5, sides at 2.5, ceiling at 4.7, glass doors at 2.4,
  canopy at 6.1, posts at 3.0 — all absolute. The probe found them at y
  0.3–4.7 under ground that is 8.2–20.8m there. The one feature whose whole
  purpose is "what you actually see from a scooter" has been buried on every
  building in the world. Now seated on the building's foot.

Verified: Old Hill Street generic frame has no sky slab and shows plant on the
roof; Wisma Atria (flat ground, ground=26) is unchanged in massing and now
shows its entrance canopy and glazed band at street level.

THE PLINTH WAS INVESTIGATED AND DELIBERATELY NOT BUILT — the terrain under it
is not good enough to build on. Measured against the source (opentopodata
srtm30m, the dataset every district is pinned to) around Old Hill Street:
    OHS high corner        23.0 m        OHS low corner       3.0 m
    Hill Street outside    23.0 m        Fort Canning summit 37.0 m
    Boat Quay riverside    17.0 m   <-- this is the SINGAPORE RIVER
srtm30m is a SURFACE model and it is reading buildings: 17m of "ground" over
open water, and Hill Street (really ~10m) at 23m. Our heightfield is a smoothed
version of that, which is where OHS's 12.6m of relief across one 136x95m ring
comes from. It is NOT one bad cell either — the twenty perimeter samples run
8.2, 8.7, 11.4, 12.0, 12.5, 12.8, 13.1, 13.2, 13.7, 14.2, 14.7, 15.2, 15.4,
15.4, 15.9, 17.2, 18.4, 18.5, 20.7, 20.8: a smooth ramp, so a robust statistic
(10th percentile instead of the minimum) moves the seat 1.3m and fixes nothing.
A plinth topping the mass out at STREET+h would make this 6-storey building
50m tall on the strength of a dataset that thinks the river is 17m above sea
level. Building it would be modelling the noise.

So the real item is TERRAIN, not seating, and it is the same size as any other
data-layer job: find a bare-earth or higher-resolution source for Singapore
(SLA/OneMap publish one), pin every district to it as districts.json already
requires, and rebuild. Until then the burial is a known, measured, honest
consequence of the elevation data and should be described that way rather than
papered over. Do not re-derive this — the numbers above are the evidence.

STILL OPEN, named so it is not mistaken for fixed: the MASS is still seated at
FOOT with its top at FOOT+h, so on a steep footprint the building is short by
the fall as seen from the street — Old Hill Street (12.6m of relief across one
21-vertex ring, Fort Canning's flank) loses 12.6m into its uphill side and the
lowest two rows of rainbow shutters go underground. Correct answer is the
plinth: top the mass out at STREET+h and extrude DOWN to FOOT, so the building
is `h` tall as seen from the street it fronts and still fills the fall behind.
Both numbers now exist per building, so it is a small change in city.js — but
every landmark recipe extrudes its own mass from api.footingY and would need
the same treatment or it will float by the drop. Its own batch, its own vet.

ALSO THIS BATCH — **crown vantages, built not hunted** (queue item 2).
`data/vantage.mjs` gains `kind: 'crown'`: candidate eyes are points on a real
mapped water polygon (area > 20,000m2, shoreline resampled at 40m, one
candidate per 15 degrees of bearing so one finely-mapped quay cannot
monopolise the choice), and the PAGE picks between them by line of sight,
measured against the distance to the subject minus the tower's own radius —
the tower is the first thing every centre ray hits, so a naive nearest-hit
test calls every candidate blocked. Shots 15-18: UOB, Republic, OCBC, and all
three 280m peaks together at fov 44 ("if they are not level, one is wrong").
Crown shots teleport the ride to the tower and WAIT FOR DRAIN first — the ride
parks in the spawn district 2km away and the CBD would not be built yet.

# HANDOVER — state as of 2026-07-30 (overnight session, user asleep)

## DISTRICT REVIEW TRIAGE (6 Opus agents, 274 frames of chinatown+rivervalley
## sweeps, 2026-07-30 ~03:20). Frames archived in the session scratchpad
## (sweep-chinatown/, sweep-rivervalley/ + their sweep.json for coords).
FIXED SAME NIGHT:
- WALKERS TORN APART (orphan leg/shoe clusters, floating torsos — both new
  districts AND orchard): per-instance LOD compaction corrupted what the GPU
  drew while CPU matrices stayed provably coherent. Instance-LOD is now
  OPT-IN (?ilod) until the GPU-side mechanism is understood; tile-LOD stays.
  Repro: scene=chinatown, teleport 1758.7,8936.8,1.1, settle 6s.
  FLOATING TREE CANOPIES were the same bug (trunk r<0.5 culled at 300m,
  canopy r>=2 at 600m — composite objects torn by radius-dependent ranges).
  ANY future instance-LOD must cull composites as UNITS at ONE range.
- CHINATOWN HAD NO RIVER (Boat Quay dry): the original fetch silently lost
  the water layer (expect= allows empty water) and cached it. topup.py water
  + rebuild; 7 polys / 1.97M m2 now. When a layer CAN be empty, check the
  neighbour district agrees before trusting the cache.
- Red awning wedges buried in pavements / floating over carriageways
  (many chinatown frames): shopfront awning base sanity added — must hang
  2.2-6.5m above LOCAL ground; skip, never substitute.
- Lamp-post banners hanging IN Victoria Street (bugis P1): banners now
  guarded at the point they HANG (offset included), not the column point.
- Wayfinder header read "Orchard Road" everywhere (primary-axis fallback):
  big line now names the street under you; minimap/names refresh per chunk.
- Sweep tool itself audited the wrong district (hardcoded orchard.json —
  the check-reads-the-input disease): now reads SG_SCENE's scene file.
STILL OPEN, BY MECHANISM (worst first):
0. S8 vs DOORS metric conflict: buildShopfronts treats a recipe door in
   front of a bay as an obstruction, so an honestly doors-and-shuttered
   frontage counts as an unfronted tenant (chinatown -1, robertson -6 when
   the ground floors became inhabited; floors adjusted with reasons).
   Right fix: shopfront.js should read recipe doors as FRONTAGE — perhaps
   via window.__shopBays-style registration of door rects at build time.
1. CONSERVATION SHOPHOUSE GROUND FLOORS read as blank slabs with detached
   door rectangles across Amoy/Telok Ayer/Duxton/Club/Smith/Tanjong Pagar —
   the shophouse fabric heuristic (a<520, h<=20, p<=64) misses Chinatown's
   larger/taller conserved rows, so they get the generic family. Needs the
   heuristic widened (conservation streets are DATA — building age/levels)
   + five-foot-way colonnade.
2. LANDMARK RECIPE WAVE, chinatown+CBD+quays — STARTED AND PARKED same
   night: buddhaTooth + sriMariamman recipes WRITTEN (landmarks.js,
   unwired) from research/southbridge-temples.md (16 corrected premises:
   no external gold stupa, blue-grey tiles, 5 gopuram tiers not 6, the
   published "5m gopuram" wrong by 3x, ~16m). First vet failed: the
   rectangular hip roofs SHEAR — a 4-gon frustum rotated 45 deg cannot be
   non-uniformly scaled at the MESH level; bake rotateY(PI/4) + scale into
   the GEOMETRY then yaw the mesh. Verify the gopuram edge-march lands on
   the South Bridge side. Wire up ONLY after a solo vet reads better than
   the generic. Also found while vetting: floating CircleGeometry pieces
   ~20m up around (2371-2526, 10127-10224) — IDENTIFIED 2026-07-30 pm as
   TRAFFIC SIGNAL HEADS (three stacked lenses) at elevated-road altitude
   near the Cantonment viaducts; check signal pole grounding where roads
   run on structure (groundAt vs deck height — same family as the
   Esplanade bridge-deck rider sink). Rest of the wave: Buddha Tooth Relic Temple,
   Sri Mariamman, Thian Hock Keng, Lau Pa Sat (currently skeleton frames),
   People's Park Complex (wrong colour, blank), Maxwell Food Centre
   (renders as giant green slab OVER the carriageway — investigate its
   footprint/height tags first, may be a data bug not a recipe gap),
   Bugis+ (P1b ratchet 2: generic bands overhang Victoria St), OCBC/UOB/
   MBFC glass towers (read as black voids at street level).
3. VEHICLE-LIKE SLABS blocking lanes in reviews (green/red/gold, no wheels
   visible) — several are probably REAL buses/lorries shot at rest by the
   sweep (traffic frozen mid-frame), but 144's 15-vehicle overlapping
   pileup at Maxwell needs a look at spawn spacing/taxi ranks in new
   districts.
4. ROAD SURFACE patchwork navy-vs-grey (RV canyons; also 143/148/156
   chinatown) — tower-shadowed asphalt crushing near-black (known
   hemisphere-lift item) PLUS possible mixed surface buckets per way.
5. Kerb/median FRAGMENT CHAINS standing in lanes (141/146/153 chinatown,
   078/094/097 RV) — median bar + kerb runs at junction mouths in the new
   districts; the kerbClear end-sampling may need the full piece length.
6. Terrain pokes through tarmac at spots (029/052/089 chinatown; 054/056
   RV); road stubs ending in bare terrain at bbox edges (merged world
   fills most — verify per spot against world, not the standalone scene).
7. Esplanade Drive: rider sinks under the BRIDGE deck when teleported
   (074-077) — surfaceAt vs bridge decks; affects sweeps, maybe real rides.
8. Pedestrians walking IN traffic lanes (116 chinatown; 059 RV) — crowd
   path selection in new districts.
9. Camera-under-building sweep stops (108/109/113) — sweep should skip
   stops under overhead decks (PS service-passage class).

## AFTERNOON (post-mega-batch): instance-LOD LIVE at build 1300 (1769k vs
2549k tris on the gate readout), Singapore World branding live, district
crowds live. Sultan Mosque recipe (ogee lathe domes, bottle bands, four
minarets) + supertree-in-building guard (OSM maps minarets as towers —
they rendered as supertrees) queued behind the mosque deploy. CBD TRIO
recipes (uobPlaza stages+arched crown, ocbcCentre with researched band
heights 25-78.6/87-133/143-189, republicPlaza rotating octagon) WIRED and
audited — crowns not yet visually verified (the CBD canyon eats every
camera; verify from Marina Bay across the water in the world scene next
session). Research bank: research/sultanmosque-cbdtrio.md joined the set.

# Earlier handover (2026-07-29 late night) below

## LOD v1+v2 SHIPPED (this deploy): the heat lever that costs nothing visible.
Two culls, both OFF in RAW/audit mode and via ?nolod, both ticked every 250ms
only after the camera moves 8m: (1) consolidated tiles whose contents are all
under 4m (kerbs, markings, furniture) hide beyond 500m — worth only ~7 draws
(frustum culling already had them). (2) THE REAL ONE: per-instance distance
culling of every STATIC InstancedMesh (trees/lamps/posts/stripes). Those sets
span the region in one bounding sphere, so every leaf was vertex-shaded every
frame in BOTH passes regardless of view. Compaction from a boot snapshot
(matrices + instanceColor), radius by piece size (300/450/600m). Excluded BY
MECHANISM: crowd (userData.crowdPart), traffic (frustumCulled=false), signal
lensMesh (Signals addresses instances BY INDEX — compaction would move the
green light). Placement hash is stored as a string at boot, so post-boot
compaction cannot corrupt the determinism gate. MEASURED at spawn: 3161k ->
2189k drawn tris (-31%), pixel-diff on/off at three orientations = 0.000%
(FogExp2 0.0038 is ~3% transmittance at 500m — the cull ranges live inside
the haze). Next LOD candidates if more heat relief is wanted: far building
recipe detail, shophouse window rects, shadow-map draw distance.

## STREAMING SHIPPED AND DEFAULT (this deploy). merge.py --stream emits a
manifest + per-district chunk files (lossless partition, verified per layer);
the app fetches ALL chunks at boot (bytes are cheap, building is not), boots
ONLY the spawn district through the unchanged buildRegion, then streams the
rest via addChunk() — same builders, chunk data, own THREE.Group, one private
RNG stream per district. Measured real GPU: ready 17.5s -> 8.4s, remaining
districts drain in ~4-6s of play, worst main-thread task ~215ms. Flat file
remains: ?nostream, no-manifest scenes (audits per district), and fallback.
THE SEAM LESSONS (each cost a gate refusal, all fixed):
- chunks are DEDUPED, so a chunk build cannot see a neighbour's roads: boot
  now indexes ROADIX/colGrid/water from the UNION; addChunk indexes nothing.
- district chunks carry their OWN axis, so streetward/frontage decisions can
  flip vs the merged build: every frame-recipe at() helper now carriageway-
  checks each piece (Raffles Arcade pilasters stood on North Bridge Road).
- audits/livecheck must WAIT FOR DRAIN (__streamState) or they judge a
  half-built world (C8 read 60%).
- setTimeout(0) yields are CLAMPED in occluded pages: MessageChannel yields,
  time-gated to ~20ms slices (phones keep frame rate, harness stays fast).
Still open for the island scale-up: unload behind the rider (heap plateau),
world5 flip (needs unload first — 527MB all-built), per-subsystem Y() in
dressing/shopfronts if 215ms tasks read on-device, proximity-triggered
re-prioritisation mid-drain (queue is nearest-first at start only).

## OPEN, user-observed, mechanism identified: THE START HANG hits the whole
## world (pedestrians freeze too — user report), not just the controls. The
## boot warm-up renders ONE view; every tile entering the frustum for the
## first time as the camera turns uploads+compiles on the spot — seconds of
## hitching on a phone, then smooth forever. FIX: during "first light",
## render a 360° spin (4-6 frames around spawn) so the whole neighbourhood
## is GPU-resident before the player can move. The ride-physics SUB-STEP
## (shipped) still covers residual jank. Verify on-device via the HUD build
## stamp (shipped same night) before debugging any "still broken" report.

## The player-facing round, all LIVE and hash-verified:
CAR OR BIKE (ride.js param sets RIDE/CAR, step(s,dt,t,b,s,P); car 18 m/s,
buildCar in vespa.js; #vehiclebtn swaps from the saddle, localStorage
remembers; playerRig exempt BY ANCESTRY in the audits — the car's bumper
blocked marinabay T1 on its first gate run). SUMMONABLE VEHICLE (ride
button fans a clear spot beside a far walker; skip-never-substitute).
GHOST PEDALS (faint throttle/brake/steer indications, TOUCH+ride only,
brighten on press). ROTATION FIX (per-frame stale-size check — rotate
order can no longer squeeze the canvas). AUDIO: iPhone SILENT-SWITCH
workaround (looping silent media element promotes the session to playback;
retried per gesture in poke()). THERMAL: phones render dpr 1.5 and
idle-cool to 24fps when parked+untouched 6s (lastGestureT stamps in the
capture-phase gesture hook; any touch restores full rate). Gate saves
tonight: a TDZ crash (updateHelp above its consts) and the car-bumper
blocker both refused before publish.

## Late-night round two, all LIVE:
TRUTHFUL PEDALS (the real zones: whole left half split at 62% height —
divider drawn AT the split, glyphs centred in the true zones; v1 boxes
matched nothing). THERMAL LADDER: dpr 1.5 + 30fps riding cap (?fps
overrides) + half-size alternate-frame shadows + 24fps idle + 0 hidden.
DRIVE-OFF FIX: dt clamps to 0.05 while early-jank frames run seconds
apart, so sim time crawled and full throttle read as dead — the pure ride
model now SUB-STEPS through real elapsed time (bounded 0.24s). AUDIO
DIAGNOSIS SHIPPED: soft two-note chime on actual unlock (own gain, master-
independent) + ?audiodebug HUD line + state hardening — next session's
verdict: chime-no-engine = mapping, no-chime = session. ADAPTIVE TIER:
phones median <20fps over first 8s demote once to dpr 1.25/cap 24,
remembered in localStorage (sg_tier). TDZ count for the day: THREE
(updateHelp, and TIER_DPR read by resize() at module init) — declare
before module-init callers, the file now says so twice.
QUALITY-TIER SPEC + tidy discipline written into WORKFLOW.md.

## EXPANSION: chinatown (Chinatown/Raffles Place) is DATA-COMPLETE —
map + opentopodata terrain (76m relief; open-elevation was fetched FIRST
by mistake and rewritten — CHECK THE PIN before fetching, the log prints
the others' src) + unused-tag gate clean (crossing_ref → IGNORED with
reason). CBD tower heights are ABSURDLY LOW in OSM (Asia Square 20 vs 229
real) — an Opus research table is inbound; enter via process.py LANDMARKS
before first render. rivervalley fetch in flight. Then: per-district
gates, TEST merge as world5 (never straight into world.json), measure
boot+heap, decide ship-now vs streaming-first (design in WORKFLOW.md).

# (previous handover follows)

Read this block, then `STANDARD.md`. Everything below the line is the historical
record: read it when you need the reasoning behind a rule, not before starting.

## Live and green

Three districts merged into one region: **Orchard Road, Bras Basah, Marina Bay**.
2,155 buildings, ~6,000 roads, 2.0M m2 of water. **EVERY STREET in all three
districts is dressed** since 2026-07-29 -- 100% of Orchard and Bras Basah, 99%
of Marina Bay, against 34/42/33% before.
Deployed and hash-verified: https://adamdegoat.github.io/singaporeproject/

    node server.cjs                                  # dev server, :8933 -- START THIS FIRST
    bash data/gates.sh [scene]                       # THE WHOLE SIGN-OFF IN ONE COMMAND
    node data/livecheck.mjs [url]                    # does the DEPLOYED site run on a phone
    SG_SCENE=<id> node data/audit_run.mjs            # 40 checks; id = orchard|brasbasah|marinabay|world
    SG_SCENE=world node data/behaviour.mjs           # 5 checks on how things MOVE
    SG_SCENE=world node data/defects.mjs             # 35 exploratory classes (NOT a gate)
    python3 data/check.py <id>                       # the data gate -- RUN IT ON `world` TOO
    python3 data/audit_roads.py <id>                 # analytic road overlap
    node test/ride.test.mjs                          # ride model, no browser
    SG_SCENE=<id> node data/patchprobe.mjs           # eye-level ray audit of the drawn road surface
    bash data/tidy.sh                                # ALWAYS after a batch
    ./deploy.sh "message"                            # every gate + hash verify + LIVE CHECK

All gates pass on all four scenes. Do not trust that sentence -- run them.
`gates.sh` exists because two sign-off steps had never been run at all, and the
awkward ones are the ones that get skipped.

## THE TOP THREE, in order

1. **The CPU build is ~10.7s of the boot; cut it next.** The boot work on
   2026-07-29 (second session) fixed the structure — see THE BOOT, REOPENED
   below — and what remains is honest CPU: buildings 1.1s, dedupe+consolidate
   1.1s, solid grids 1.1s, shopfronts 0.9s, roads 0.8s, per-axis dressing
   ~2.5s, module+fetch 0.6s. No single villain left; this is now a
   many-small-cuts job. Fine-grained marks are in (`?boot=1`, `window.__boot`).
2. **Recipe batch 2 BUILT same session: voco Orchard (egg-crate slab, bronze
   mural band, double-fascia crown), Forum (navy glass + white arch portal
   w/ clock ring + gold band), Palais Renaissance (waffle tower, glass veil
   on the scanned face span), Orchard Rendezvous (peach slab, terracotta
   5-tier corner cake + turret; h stays 55 ≈ Emporis est). Forum height
   40→56 derived (17 storeys). All four judged > generic. POLISH DEBT:
   Palais barrels not street-visible + veil lettering missing; Forum glass
   should read darker/near-black; voco vertical waffle ribs only on street
   face; bands wrap end walls that should be blank. Lesson that repeated
   TWICE: a band merged at grow(<1) sits INSIDE its parent extrude and
   renders invisible — proud bands are grow(1.006).

3. **Recipe batch 1 BUILT 2026-07-29 (third session): all five.** Research
   specs live in `research/*.md` (sota, far-east-shopping-centre, concorde,
   pullman, shaw-house) — every report corrected premises, four of five
   mapped heights were wrong (SOTA 50→56 published, FESC 75→51 derived [75
   was the FRONTAGE], Concorde 70→30 [9 storeys, our own invention], Pullman
   92→48 [Emporis]); process.py LANDMARKS updated, districts rebuilt, world
   merged, data gates green. Recipes in landmarks.js: farEastShopping,
   concordeHotel, pullmanOrchard, shawHouse, sota — each solo-judged a WIN
   vs the generic family. New materials: paintedWhite, goldSign,
   chevronGlass (texChevron), mediaWall, brightGlass, shawGranite,
   sotaRibbons (texSotaRibbons, own RNG stream), boardConc. Traps re-hit
   and dodged this session: slab() y is ABSOLUTE (pass g0+), the oriented
   box reaches past irregular walls (scan the ring for real extents),
   ribbonOffset ends float past slab ends. POLISH DEBT, honest list: SOTA
   ribbons sparser than the real ~51% and its piers barely read; Pullman
   media wall is a plain glow panel; Concorde gable logo is an unlabelled
   dark box; the Concorde road-dead-end frame still needs re-checking in
   the world (the building is now 30m so the loom is gone, but ride it).
   Also fixed: SOTA/Concorde/FESC "pale box" triage item #8/#3 root causes.
3. **The Dhoby Ghaut pale boxes are the SCHOOL OF THE ARTS (SOTA).** Traced
   by raycasting the drawn meshes from the frame-12 camera and naming the
   footprints under the hits: the volumes are SOTA (named in OSM, h=50,
   ~7,500 m2) drawn by the generic concrete family — textured up close, flat
   white at distance. Research for a recipe is delegated (WOHA, 2009, the
   two-strata green-mesh building); build it when the report lands, under the
   usual rule: worse than the generic family = not wired up. Probe gotcha
   that cost a round: scene-file buildings carry their name in `n`, not
   `name` — a probe reading `.name` calls every building unnamed.

## DONE 2026-07-29 (second session): the LOADING SCREEN

The user reported the page "looks like a crash" while loading — a static
"loading Orchard…" line through 13+ blocked seconds. `#boot` in index.html is
a full-screen overlay: SINGAPORE wordmark, the district names read from
`data.axes`, and a road-styled progress bar (cream fill over a lane-dash
track) that steps through ~18 NAMED phases with real counts ("raising 2,155
buildings", "dressing Bras Basah Road"). The rules that made it work:

- **Each step yields ONE macrotask (`setTimeout(0)`), never rAF** — rAF is
  throttled in a spawned window and would stall every gate. Skipped when
  `document.hidden` (background timers clamp to 1s each).
- **The stretch that still freezes on a slow GPU is labelled** — "first
  light" parked at 97% — because a labelled pause reads as work and an
  anonymous full bar reads as a hang.
- **A failed boot KEEPS the overlay** and writes the error into it; fading
  out over a dead black canvas would recreate the exact state this exists to
  prevent.
- livecheck now fails a deploy if the overlay is still standing 1.2s after
  ready. Deployed and live-verified same day, all gates green (exploratory
  findings 8 → 6).

## DONE 2026-07-29 (second session): side streets have their PAINT

The old #2 is finished, and it grew a fix the vet frames demanded:

- **Broken white centre lines on every two-way side street** ≥5.5m, real
  carriageway kinds only, not bridges, not the axes (markings.js owns those).
  ONE ribbon per street run with the dash in the TEXTURE (`texCentreDash`),
  never per-mark quads — P6 stayed at baseline. Runs are stitched and broken
  at junction mouths by `streetRuns()` in city.js, the machinery extracted
  from the red bus lanes (whose output was verified byte-identical across the
  refactor: 108 meshes, 21,612 verts, before and after).
- **The SDRE research corrected the brief — again.** The "2m mark / 4m gap,
  100mm" pattern everyone quotes is Type B, the LANE line between
  same-direction lanes. The CENTRE line is Type E: **150mm wide, 2.75m mark,
  2.75m gap** (SDRE Ch.8 RMS2, corroborated by RMS12's printed "2.75m/5.5m"
  labels). They differ in every dimension. Also published: centre lines are
  never yellow in Singapore; yellow is kerbside/bus/box only. UNPUBLISHED
  (checked, not found): a minimum road width for having a centre line, and
  where the centre line stops before a junction — our 5.5m threshold and
  junction-mouth gaps are labelled invented.
- **The double yellows now BREAK AT JUNCTION MOUTHS.** The first centre-line
  vet frame (Wilkie Terrace) showed the yellows of a crossing street running
  straight across the carriageway — they had been drawn blindly per way since
  they landed, and there was never other paint to compare against. They are
  stitched through the same `streetRuns()` now; only BRIDGE ways stay
  per-way (flat at deck height — a merged run would take one deck height
  across ways that each chose their own). Known cost: an isolated street
  under 30m of total run gets no paint (the "a patch is not a lane" rule);
  a T-junction clears the yellow on the kerb OPPOSITE the mouth too, which
  real paint would keep.
- **`consolidate()` quietly defeats the per-tile layer merging.** city.js
  `merge()` buckets paint layers per 110m tile, but every layer mesh's ORIGIN
  is (0,0) — geometry in world coords — so consolidate's tile key puts all
  of them in one tile and re-merges each layer into ONE district-spanning
  mesh (busLane: 108 raw meshes → 1 consolidated; centreLine the same). The
  big surfaces escape only because >3000-vertex meshes are not bakeable.
  Harmless for thin paint (33k verts), but worth knowing before trusting the
  per-tile comment, and the reason a material-name probe "finds 1 mesh".

## THE BOOT, REOPENED 2026-07-29 (second session): where the 28s actually went

Measured 28.5s observable-ready at 844x390 dpr2 headless; the boot marks
summed to 13s. The missing 15s taught three things:

1. **`__ready` was set 9-15s before the page could paint.** The first
   rendered frame of the finished world was one 8.7-15s main-thread task —
   driver-level shader/pipeline compilation plus the upload of 178MB of
   merged vertex buffers — and every boot mark was green before it started.
   Worse, `buildEnvironment()` rendered the UNCONSOLIDATED scene (7k meshes),
   uploading the whole world once, then `consolidate()` rebuilt every buffer
   and paid the upload again on frame one.
2. **Fixed structurally, not by hoping:** boot now ends with
   `compileAsync` (parallel shader compile, polls on setTimeout so a
   throttled rAF cannot hang it) → `buildEnvironment()` on the MERGED scene →
   a second `compileAsync` for the USE_ENVMAP variants → one real warm frame
   — all BEFORE `__ready` flips, so ready means what livecheck thinks it
   means. First frame after ready: 28-88ms, was 8,700ms. The loop is gated on
   `ready` (an un-gated loop would render the half-warm scene mid-await and
   reportHud would overwrite the loading text). ?raw audit loads SKIP the
   warm-up — they never render, and it would add ~15s to every gate.
3. **The residual gap is the HARNESS, mostly.** Headless Playwright Chromium
   renders on SwiftShader (software Vulkan) — `chrome://gpu` string confirms
   it — and its Subzero JIT takes ~14s to compile the pipelines that a real
   GPU driver also compiles but a phone does once. Trace signature:
   `GLES2::ReadPixels → ImageHelper::readPixelsImpl - CPU Readback →
   ContextVk::finishImpl`. A headed browser gets real Metal and shows the
   same order of stall on this Intel iGPU. Do not chase that number; gate on
   the marks and on real-device feel.

Also cut: `buildSurround` 2.35s → 0.32s. The water test was 2.1s of it —
`inWater` walked every vertex of every Marina Bay ring for 9 sample points ×
5,478 cells; a per-ring bounding box now rejects almost all of them. Same
cell count, no RNG calls touched, placement byte-identical.

## SWEEP 2 TRIAGE (2026-07-29 evening, post-recipe-batches, Opus reviewers)

Reviewer for 055-109 (others pending at time of writing — append their
findings here as they land):
1. **[BAD] Left-kerb z-fight DIAGNOSED, fix is a deletion: TWO yellow
   systems paint the axis kerbs at the IDENTICAL height 0.087.**
   markings.js MARK.yellow = ROAD_Y 0.055 + 0.032 (per-metre emitFlat
   quads, lines ~327-332) and city.js streetRuns ribbon yellows (0.087) —
   coplanar along the whole axis, hence the 28-frame stipple. DELETE the
   markings.js kerbside double-yellow emit (yellowL) and keep the ribbons
   (junction-broken + self-verifying). Same lesson as the double-drawn
   kerbs in the old notes: two systems, one fact.
2. **[BAD] 072 ION area: huge flat untextured grey mass cuts diagonally
   across the red bus lane and left carriageway, half-swallowing two cars.**
   Same object as the old "ION facade" finding but it INTERSECTS THE ROAD —
   probe what mesh this is (P1b passes, so it is name-exempt or a surface).
3. **[BAD] 100 Paterson Rd: paving slabs lying ON the carriageway over the
   yellows.** 4. **[BAD] 058 Canning Rise: floating salmon capsule (was in
   sweep 1 too).** 5. [minor] road slabs ending in hard edges vs terrain
   (063/065/066); 6. [minor] white edge stripe off-carriageway (064);
   7. [minor] covered-walkway canopy panels disjointed on the Boulevard
   (101-106); 8. [minor] stray pale ellipsoid at Temasek Shophouse (090).
CLEARED: all four batch-2 recipes read correctly and sit on the ground.

Reviewer for 110-164 adds (5 BAD, 8 minor):
9. **[BAD] THE ONE ENGINE BUG behind ~12 frames: markings painted on bare
   ground beside/offset from the drawn asphalt**, worst on the Istana / west
   Orchard stretch (115, 120, 121, plus thin recurrences 116/122/124/129/
   134/135/139/142/164; 161's brown carriageway strip is the same family —
   the axis paints the carriageway while the drawn surface there is another
   material/offset). One fix, many frames.
10. **[BAD] ION mass DIAGNOSED (072/111): the canopy shell's CENTER is
   clearance-checked but its 17m RADIUS is not.** landmarks.js
   ionOrchard(): the half-open CylinderGeometry(17, 17, ~74m) is centred at
   `halfShort + reach` with reach capped at 5 by clearance.outward — but
   the rim extends 17m further, over the kerb and carriageway (probe: rays
   from the frame-072 camera hit it 83x at 8m, colour b9c4c9). FIX drafted:
   walk the clear distance from the footprint edge to the carriageway and
   set centerOff = min(reach, clearD − 1 − 17) — negative is fine, the
   canopy then hugs the podium the way the real one oversails the forecourt
   not the road. Apply after the in-flight deploy lands (never edit src
   mid-gate: the working tree ships).
11. **[BAD] 130 National Museum renders as a featureless grey box against
   Canning Rise** — the recipe exists; find out why it did not apply (name
   match? suppressed? pruned?).
12. [minor] 132 Tang Plaza reads as a plain brown box from Nutmeg Rd;
   129 Far East Plaza blank upper facade; 153 Scotts Square blank frontage
   wall at kerb; 126 shophouse slab overhang; 113 Chee Guan Chiang flat
   slab-at-grade.
CLEARED by this reviewer: FESC, Shaw approach, Concorde approach seated
fine; ERP gantry legs on verge; "tilted" facades are FOV distortion; tan
junction wedges are landscaped splitter islands.

Reviewer for 000-054 adds (10 BAD, 23 minor, 33 total), FOUR SYSTEMIC:
13. **FIXED same evening (8th deploy): the rig's hands/shoes swung with
    OPPOSITE SIGN to their limb rotations.** R_x by θ moves a point L below
    the pivot to z = −L·sinθ; all four extremity constants opposed that, so
    at full gait a hand sat ~46cm from its arm tip and a shoe ~63cm from
    its leg. actors.js put() extremity offsets now derived from the limb
    angles. Verified by derivation + behaviour gate; visual confirmation
    rides on the next sweep. Probes eliminated: slot indexing and per-part
    counts are consistent; the affected pedestrians were ordinary walkers.
    ~~[BAD] BROKEN PEDESTRIAN RIG — hands and shoes detach from the body~~
    (016 arms rotated off torso; 032/037/050/053/054). PRIME SUSPECT, not
    yet verified: the crowd packs VISIBLE instances to the front of the
    buffer and sets .count (the culling fix in the hard-won notes), and the
    notes already warn "per-instance colours must be written per SLOT, not
    per entity index, or everyone swaps clothes" — if any LIMB part (hand
    spheres, shoes, forearms) writes its matrix by ENTITY index while the
    body writes by SLOT, limbs belong to a different pedestrian than the
    body they float near. INVESTIGATED, suspects ELIMINATED: put() in
    actors.js writes every part at the same packed slot (line ~849) and
    part.count is set uniformly from `slot` for all parts (line ~899) — no
    index or count mismatch in the main walker path. NEXT THREADS: (a) the
    detached-limb pedestrians in frames 016/032/037 may come from a
    DIFFERENT writer — a seated/waiting pose path, the crossing pose, or a
    bench/bus-stop sitter — find which pose those frames show and grep for
    a second matrix writer; (b) the arm ROTATION pivots about the box
    centre while hands translate kinematically — at extreme `walk` values
    (teleport time-jump?) they could visually separate; check whether
    sweep teleports produce outsized `walk`. The kerbside-paint guard from
    #17 is IN and deployed same evening (7th deploy of 2026-07-29).
14. **Emerald Hill: three causes, two FIXED, one left.** (a) polygon
    surgery (data/split.py, in the pipeline + gates): road-through rings
    split, terrace rows >40m segmented ~16m so footings step down slopes;
    (b) LOW buildings (h<=16) now foot at their STREET-EDGE vertex
    (streetFootingY in city.js) instead of the whole-footprint minimum —
    the rear sinks into its own hill like real terraces. Walls measurably
    shorter. (c) REMAINING: the visible "plinth" is the facade family
    drawing a BLANK GROUND FLOOR on unnamed 6.8m terraces — they are not
    classified as shophouses, so no five-foot way, no shutters, no base
    treatment. NEXT: broaden the shophouse classifier (h<=9, row-piece
    geometry, conservation-area streets by name list: Emerald Hill,
    Peranakan Place lanes, Chinatown when it lands — that district is WHY
    this matters at scale).
15. **Lane dashes straight through junction mouths** (007/016/017/027/043
    + prior triage #6) — the axis/side-street per-metre marking system
    still has no junction gaps.
16. **FIXED (11th deploy): bus-lane tears.** (a) ribbon()/ribbonOffset grew
    a `noExt` flag — a subPoly-cut piece no longer extends its ends across
    the bend it was cut at; (b) the lane's outer edge (sampled 0.5m INSIDE
    the paint line — testing the exact edge against a shrunken index trims
    EVERYTHING, first attempt went 108 meshes -> 4) verifies per-3m span
    against the road index, and only verified spans >= 12m are laid.
    Verified at the frame-090 spot: continuous band, clean square cut at
    the junction gap, no triangles or floods. Bus geometry now 52 meshes /
    7.3k verts (was 108/21.6k — the delta was the off-road flood paint).
    ~~Red bus-lane paint fragmenting into detached polygons~~ (002/007/054
    + sweep-1 tears; characterized on frame 090: ragged triangular end
    mid-block, resume after) — the run-stitcher's junction pieces. FIX
    APPROACH, next batch's opener: (a) the tears sit at subPoly cut points
    where ribbonOffset's END EXTENSION (half*1.1) fans across a bend —
    suppress the extension on cut ends (subPoly already lands exactly at
    the junction gap edge, extending past it is what tears); (b) apply the
    paint-verify pattern to the bus ribbon's OUTER edge (sample at 3m,
    trim pieces whose edge leaves the carriageway); (c) the "inner edge
    steps where width changes" polish from the original bus-lane note.
    Plus one-offs worth probing: 025 thick bare column at kerb; 030
    detached glazing panel; 005 slate-blue quad on carriageway; 009 black
    sphere on kerb; blank near-field slabs (013/025/026/031/042/052 —
    generic facade skipping small frontages?). 012 CLEARED: a tower's hard
    shadow; only nuance is shadowed ASPHALT crushes near-black while
    pavement keeps tone — a someday hemisphere-light lift, not a defect.

Reviewer for 165-219 adds (13 BAD, 9 minor). THE BIGGEST ENGINE BUG of the
whole sweep, confirming #9 with more frames:
17. **[BAD] "ROAD SURFACE MISSING" — PROBED, and the surfaces EXIST.**
    Raycast down every centreline of Sophia/Fort Canning/Angullia/Handy/
    Bukit Timah: 0 terrain hits, all roadSurface/markings/buildings
    (`scratchpad/roadsurf.mjs` pattern). So the defect is the KERBSIDE
    paint standing beyond a ribbon NARROWER than the `w` the paint uses —
    a width disagreement, most likely where streetRuns chains ways of
    differing widths into one run keyed `n|w` while the drawn ribbons vary
    per way, or where a junction-gap subPoly cuts across a bend. NEXT STEP:
    eye-level shot at frame 191's coords (Sophia Rd), measure drawn ribbon
    edge vs painted yellow offset at that exact spot, then fix the paint to
    take each WAY's own drawn width (or clamp paint inside the drawn edge
    the way P9 should have caught — strengthen P9 with the fix).
18. **RESOLVED AS REALITY (four diagnostic layers): the PS "overhang" is
    the mall's real SERVICE PASSAGE.** Definitive probe: both sweep points
    are INSIDE PS's ring and the ways under them are UNNAMED SERVICE ways
    (w=6) — a basement/loading passage running under the building, which
    the splitter CORRECTLY leaves alone (splitting would carve a fake
    canyon through a real mall). Remaining is PRESENTATION polish, not
    correctness: give under-building service passages a proper soffit and
    side walls so the underside stops reading as raw geometry; optionally
    exclude under-building service ways from the sweep's rideable stops.
    Superseded plan below kept for the method record.
    ~~[BAD] Plaza Singapura overhang FULLY DIAGNOSED, fix designed (half a
    session, do when fresh):~~ the roads genuinely pass THROUGH PS's single
    mapped footprint (OSM outlines the mall including its over-road link),
    the extrude therefore roofs the carriageway at 3.1/5.9m, and it DODGES
    pruneCarriageway via the `pos.count > 6000` merged-tile guard — while
    the walkway builder (street.js, box roofs at 3.35m) is innocent. Whole-
    mesh removal would delete the mall, so the RIGHT fix is data-layer, in
    process.py: where a ring ENCIRCLES/crosses a carriageway corridor,
    SPLIT it into polygons either side and emit an explicit bridge-deck
    slab over the corridor at >= 4.7m soffit. Covers the P5 trio in one
    move. NOTE for frame-number hygiene: sweep.json row coords change each
    sweep run — resolve a reviewer's frames against the sweep.json THAT
    REVIEW SAW (one mis-aimed probe already paid for this).
19. **MOSTLY FIXED (10th deploy): median + kerb pieces verify against the
    road index.** Three guards landed: median midpoints AND bar ends
    (sgdetail.js), side-street 4m kerbs centre+ends (markings.js), crossing
    2m kerbs centre+ends (main.js) — two kerb emitters shared one defect
    and the first fix only guarded one. Probed clear at 202/211; 207 keeps
    ONE bar that the index calls edge-legal (clear at −0.3) while it stands
    on the junction's DRAWN overlap tarmac — the drawn-vs-indexed width
    disagreement at junction mouths, a separate debt, not a placement bug.
    ~~Kerb bars/slabs ON the carriageway at Grange Rd + Canning Walk~~
20. [BAD] 171 RE-DIAGNOSED from the frame + probe: the "floating shelter
    frame" is the covered walkway and it is FINE. The real defects at the
    Lucky Plaza/Nutmeg spot: (a) the pedestrianised plaza renders as one
    huge unmarked TEAL-SLATE apron (BufferGeometry col 7f929c — the paver/
    concrete bucket colour, reads unreal at this scale); (b) a BLACK WEDGE
    hole in the surface just ahead of the spawn (dark 2e2c2a geometry
    showing through a triangulation gap where the plaza polygon meets the
    road ribbon — same sliver class as frame 183). Fix = plaza surface
    treatment + polygon seam, one batch with the surface-material pass. 187 lamp luminaire: FIXED (12th deploy) — arms and heads in
    BOTH lamp systems grounded at their own offset position, metres off the
    pole's ground beside a retaining wall; every part now grounds at the
    POLE (main.js axis lamps r[5]/r[6], markings.js LTA lamps same).
    The 058 Canning Rise salmon capsule: ELIMINATED so far — not a floating
    crowd torso (0 of drawn torsos >2.5m up at the spot), not a bag
    (0.22m box, too small), not a red-tinted foliage clump (no icosahedron
    instanceColor outliers; possibly foliage has no instanceColor at all —
    check that first next time). Next thread: it sits at canopy height near
    (1427-1460, 7618-7654); ray THE BLOB itself — TRIED, fourth probe
    empty: it is warm only in TEXTURE (mapped materials report white), so
    colour hunting is blind. NEXT: bisect by subsystem — screenshot the
    frame-058 camera with ?nofoliage / ?nosigns / ?nofurniture and see
    which flag removes it; two shots name the builder. 21. [minor] 169 voco: CLEARED — at full resolution the "charcoal wall" is
    the dark-framed boutique arcade with legible tenant fascias (MB
    Jewellery, Mouawad, Breitling), exactly per research/voco.md; the
    reviewer read a thumbnail. Blank slabs 167/185/199 and the bare west
    Tanglin expanses (165/168) remain open.
CLEARED: Concorde raked slab (180), Artyzen tower (181) render fine.

## THE SWEEP REVIEW TRIAGE (2026-07-29, all 220 frames reviewed, 64 findings)

First frame-by-frame review ever run (four agents over `shots/sweep/`).
Findings are CLAIMS until probed — two spot-checks already confirmed real
(Canning Rise rides into the National Museum massing; Istana-stretch rider on
a brown slab). Ordered vehicle-first. Frame numbers refer to this sweep run.

1. **Things standing IN traffic lanes** — hedge pads (001, 044, 047), stray
   raised slabs on Grange/Bukit Timah (205, 207, 209), dark lumps (203).
   P1/P1b are green, so whatever these are is either name-exempt, classed as
   service-road, or placed by a path the checks don't cover. Probe first.
2. **Red bus-lane overlay tears on the prime stretch** (~16 frames: ragged
   triangular edges 067/076/077, mid-lane gaps 075/102, multi-lane flooding
   090/093, orphan patch mid-junction 103, worst 105). Known polish debt in
   the bus-lane section plus something new — the flooding needs a look.
3. **Roads running through/under buildings** (130 museum, 172 Orchard Link
   through Hilton, 177/178 Plaza Singapura underside roofs the road, 155
   Concorde, 161 Istana wall, 045 Scotts dead-end). Some are probably REAL
   under-building service ways (covered=yes / building_passage — grep the
   raw OSM before calling them defects: the sweep may just be riding roads
   a rider can genuinely not see down), some are oversized recipe massing.
4. **Paint where no tarmac is** (166, 170, 181, 218, 115, 118, 120, 025):
   yellows/dashes on bare terrain. Our invented widths vs the drawn ribbon —
   also the P9 check clearly cannot see it; strengthen P9 while fixing.
5. **Dual-carriageway INNER yellows read as a centre line** (026, 040, 189,
   191 + systemic list in the 000-054 report). Each one-way half paints
   kerbside pairs at both its edges; the two inner pairs meet mid-tarmac.
   SDRE: yellow is kerbside-only, centre treatments are white. The dual-pair
   detection already exists (sgdetail medianPts / __dualSegs) — skip the
   yellow on the paired side.
6. **Junction-mouth paint from the AXIS system** (055, 056, 095, 098, 002,
   007): markings.js dashes/edges run across side-road mouths — the same
   defect streetRuns just fixed for the side-street paint, still present in
   the per-metre axis system. Teach claim()/emit the junction gaps, or move
   axis lane lines to ribbons too.
7. **The western Orchard/Tanglin stretch (frames 165-170) is an unfinished
   zone**: unmarked ribbon road, no kerbs, markings on bare ground, zero
   life. Looks like it predates several systems. Needs its own pass.
8. **ION's podium reads as a flat grey wall at eye level** (072) on the
   busiest frame of the whole street; also 101 dark-olive slab on the
   Boulevard. Facade/texture, not geometry.
9. One-offs, probe then fix or dismiss: floating pink ellipsoid (058), grey
   ledge at head height over Kramat Lane (059), salmon wedge (085/094),
   floating box (145), black slab prop (176), rod on pavement (195), tilted
   pole (065), kerb X-cross (202), Cairnhill Circle sub-vehicle neck (214),
   faded zebra (157), terrain seams (038/212), sliver spikes (171, 183),
   white arcs in sky (071), car clipping ION (111).
10. **Centre-line "gaps" reported widely** (062 Tanglin, 185 Ardmore, 193
    Wilkie, many in 116-164) — DO NOT paint blindly: much of this is the
    rule working (one-way, <5.5m, <30m runs, service). Audit analytically:
    list two-way ≥5.5m carriageway streets with no centre ribbon, then
    decide. Note the unnamed-street case: `'?'`-keyed runs group ALL unnamed
    ways of one width together and never junction-break against each other.
11. Sweep metadata: rows 111+ carry street "(unnamed)" — the reviewers had
    to read the HUD. Fix sweep.mjs's street field.

Already fixed the same day: the axis lane dash was Type C (4m/2m, the
junction-approach pattern) down every street — now Type B 2m/4m per RMS1.

## THE PATTERN THAT ACCOUNTS FOR FIVE BUGS TODAY

**When two things describe one fact, the quantised one is wrong.** Every one of
these was a check and a builder disagreeing, and in every case the fix was to
make the coarse one measure in real units:

  * S2 measured a plate's distance to a street's nearest mapped VERTEX, not to
    the street -- so a sparsely mapped straight road "lost" to a finely mapped
    parallel one. Every failure was a dual carriageway.
  * `claim()` is a single-cell hash (`Math.round(x / cell)`), so two things 18cm
    apart either side of a cell boundary BOTH survive. It has never guaranteed
    a spacing. Anything that needs one must measure distance.
  * The pedestrian band is quantised to whole metres over 32 bits, so a walker
    at 18.3m read as "metre 18" and the band called it clear while standing on
    tarmac -- and the band ran every frame while the live road test ran one in
    eight, so the band always won.
  * Vehicle spacing bucketed lanes by `Math.round(lane * 2)` while the check
    calls anything within 2.6m the same lane, so a car and a bus in one lane
    were never pushed apart.
  * A signature allowlist keyed on geometry parameters silently revoked the
    lamp arm's exemption the moment the arm changed shape.

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


### MOBILE: it stopped loading, and what that taught

Reported 2026-07-29: the world sat on "loading Orchard" on a phone. Two
separate problems, and only the first was fatal.

**1. A per-frame exception killed the render loop.** The traffic-signal lenses
had been instanced into one mesh to save 129 draw calls; the reference handed
to `Signals` was not a usable InstancedMesh by the time the first frame ran, so
`setColorAt` threw EVERY FRAME. The world built fine and `__ready` was true --
the HUD simply never got repainted past its loading text. Reverted to
individual lens meshes.

**THE LESSON, and it is the important part: every gate passed while the live
site was unusable.** 40/40 on four scenes, behaviour, ride, defects -- all
green, all blind to it, because every one of them inspects a built scene and
none of them renders a frame and looks for an exception.

**That gap is now closed.** `data/livecheck.mjs` loads the DEPLOYED url at
844x390 dpr2, waits for `__ready` (polling on an interval, not rAF), lets it
run 2.5s so the FRAME LOOP has to survive, and fails on any page exception,
console error, or a HUD still reading "loading" after ready. `deploy.sh` runs
it after the hash verification, so a deploy is not green until the site has
actually run on a phone. Hashes prove the right bytes shipped; only this proves
they work.

**2. Boot is slow — SUPERSEDED, see "THE BOOT, REOPENED" near the top.** The
28s was 13s CPU build + a hidden first-frame GPU stall that `__ready` never
waited for; the structure is fixed and the remaining work is the CPU build.
Kept from the first attempt: dressing only 320m at boot and queueing the rest
halved memory to 326MB but did NOT improve time-to-ready, and it plated
streets twice because `plated` is local to each `dressSideStreets` call.

Measurement notes for the next attempt, both learned the hard way here:

  * `page.waitForFunction` polls on rAF by DEFAULT, and rAF is throttled in a
    spawned browser -- pass `polling: 100` or you are timing the poller.
  * When inserting timing marks by string search, `buildShopfronts(` and
    `consolidate(` match their IMPORT lines first. Three marks landed there and
    produced numbers that meant nothing.

### The dressing now covers the WHOLE district, and what that opened up

2026-07-29: `REACH` in markings.js went **230m -> 1200m**, so every street in
all three districts is dressed rather than a third of them. Measured before:
Orchard 34% of its carriageway, Bras Basah 42%, Marina Bay 33% -- about 105km
with no kerb, lamp, tree or name plate on it. Now 100/100/99%.

The old 230m number predated instancing, `consolidate.js` tile batching, and
the terrain/road tiling that landed the same day. The cost was MEASURED, not
assumed: triangles 2.75M -> 3.47M at the sweep's heaviest view, and **draw
calls 899 -> 906**, which is the number that matters.

Found by riding streets nobody had ever looked at:

- **Every name plate read BACKWARDS from one side.** A single plane with
  `side: DoubleSide` shows the same texture mirrored from behind. Two
  back-to-back faces now. There are 288 plates, so half of them were wrong.
- **S2 was measuring to a street's nearest mapped VERTEX**, not to the street.
  A sparsely-mapped straight road reads 19m away when it is 9m away, so
  whichever of a parallel pair OSM mapped more finely always "won" -- all
  three failures were dual carriageways (Eu Tong Sen/New Bridge, Raffles
  Quay/Telegraph, Shenton Way/Boon Tat). Sixth instance in this file of two
  measures of one fact, and the fifth time the CHECK was the wrong one.
- **P4 went DOWN, 832 -> 668**, with three times the props, because the kerb
  lists are deduped over a real 60cm neighbourhood instead of relying on
  `claim` -- which is a single-cell hash and lets boundary-straddling pairs
  through. That is worth knowing generally: `claim` thins per cell, it has
  never guaranteed a spacing, and anything that needs one must measure.

**NEXT, and it was tried and reverted:** side streets have kerbs, lamps, trees
and plates but NO PAINT -- no double yellow, no centre line, 105km of it.
Adding them as per-metre quads is wrong twice over: it took P6 from 17 to 1974,
and it would emit on the order of 400,000 marks. A continuous line must be a
RIBBON, one geometry per street, exactly as `ribbonOffset` already does for the
red bus lanes in city.js. Do it that way, and skip service roads and anything
under 5.5m wide -- a back lane with a painted centre line is wrong.

**Worth a look, not yet investigated:** comparison-sheet frame 12 (Dhoby Ghaut,
the east end at Plaza Singapura) shows several large PALE UNTEXTURED BOXES in
the middle ground. Frame 05 in the same run is healthy -- shopfronts, textured
facades, bus lane, crowd -- so this is not a general facade regression. Most
likely it is `buildSurround`'s deliberately featureless massing reaching closer
to the camera than intended at the district edge, but it was NOT measured.
Check whether those meshes are the surround or real buildings before assuming.

### D36 IS CLOSED, and the cause is worth remembering

The walker standing in the carriageway is fixed. Two things were wrong and the
second was the real one:

1. The walk-out only ever stepped OUTWARD from the walker's own path. At 18m
   out the road underfoot is the NEXT street, so outward went deeper in. It
   probes both ways now and prefers inward.
2. **The band correction was overriding it, every frame.** `clearMask` runs
   unconditionally while the reactive road test ran one frame in eight, so
   whenever they disagreed the mask won -- and the mask is quantised to WHOLE
   METRES (`k = Math.round(Math.abs(pr.off))` over 32 bits), so a walker at
   18.3m reads as "metre 18" and the mask can call that clear while the road
   index says tarmac. That is what moved `off` at 0.07 m/s with `offWant`
   apparently never set: the mask nudging toward the next whole metre it
   believed was clear, over and over.

Now the live index wins: if `__onRoad` says you are on a carriageway the band
correction is skipped entirely and the reactive probe runs EVERY frame rather
than one in eight, because standing in traffic is the thing it exists to fix.
D36 2 -> 0.

**Third member of the same family this session**, all quantisation against
reality: S2 measuring to a street's nearest mapped VERTEX, `claim`'s
single-cell hash letting boundary-straddling pairs through, and this. When two
things describe one fact, make the one with real units win.

### NEWLY OPEN: D34, eight vehicles overlapping

Appeared between the full-district dressing and the signal-lens work; **not**
caused by the crowd change (tested by reverting it -- D34 stayed at 8). Stable
across runs, so not snapshot noise.

    car and bus share a lane with 3.0m between centres (needs 8.1m)
    car and bus share a lane with 8.0m between centres (needs 8.1m)

Two pairs are 10cm short and two are genuine -- a car inside a bus.

**One real cause found and fixed, and it did NOT close the check.** The
enforcement bucketed vehicles by `Math.round(it.lane * 2)`, a quantised key,
while D34 calls anything within 2.6m laterally the same lane -- so a car at
lane 1.0 and a bus at 2.4 were never enforced against each other. Fourth
instance this session of a quantised description disagreeing with a measured
one. It now groups by direction, sorts along travel, and applies the check's
own 2.6m rule against the six vehicles ahead.

**Still 8 after that, and here is the measurement to start from.** Three
vehicles share lane 3.64, dir 1:

    bus s=221  car s=218   gap 3.0, needs 8.06
    bus s=221  car s=213   gap 8.0, needs 8.06

The enforcement walks that lane leader-first and should push the car at 218
back to 221 - 9.66. It does not. Only ONE Traffic instance exists (checked),
so they are all in `this.items`. Two threads worth pulling:

  * The enforcement runs BEFORE integration by design (the comment owns that
    one-frame lag). Confirm it is actually REACHED for these items -- print
    from inside the loop, not from `__trafficState` afterwards.

    **Tried, and the harness defeated it.** Instrumenting `Traffic.update` and
    the enforcement block and reading the log after 900ms returned ZERO calls
    to either -- while the vehicles demonstrably move and B2 measures 12 m/s.
    The spawned browser's animation loop is throttled (WORKFLOW.md: "a window
    launched by a script sits behind the terminal and is throttled whatever
    flags are passed"), so the probe was watching a world that was not
    ticking. Any instrumentation of the per-frame loop has to run in a FOCUSED
    browser, or drive the tick manually from the probe -- call
    `trafficSys.update(t, dt, ...)` in a loop from `page.evaluate` and read the
    log from that, rather than waiting on rAF.
  * **Recycling assigns `s` without looking at the others**: `spread = EDGE +
    ((it.i * 53) % 260)`, and its own comment says it "keeps the fleet apart
    without needing to look at where the others are". Indices differing by 5
    land 5m apart, under the 8.06m a car and bus need.

### The old D36 note, kept for the reasoning

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

**The frame-by-frame trace has now been run** (`/tmp/d36trace.mjs` pattern:
teleport onto an offender, then print pr.off / pr.offWant / drawn / onRoad for
that ONE walker across eight samples). Walker 497, on path 0:

    f0 off=-17.92 s=1853.60 drawn=[1078.94,7351.02] onRoad=true dist=0
    f7 off=-18.30 s=1853.07 drawn=[1078.56,7350.48] onRoad=true dist=1

What that rules in and out:

  * **The walker is EIGHTEEN METRES off its own path centreline.** Spawn allows
    `half + rand(3.2, 10.5)`, so that is legal at spawn -- and it means the
    carriageway it is standing on is NOT its own path's. That is why walking
    "outward" never helped: outward from path 0 is deeper into street 1.
    Fixed as far as it goes -- the correction now probes inward AND outward
    and takes whichever is clear, preferring inward. D36 5 -> 3.
  * **`offWant` is never observed set**, across eight samples 700ms apart.
  * **`off` drifts steadily at about 0.07 m/s** (-17.92 to -18.30 over ~5s).
    That is NOT the 1.1 m/s offWant step, and offWant being undefined every
    time means something ELSE is moving `off`. Find that first: it is the
    thread to pull. Candidates not yet checked -- the dodge/`shPrev` rate
    limiter writing back into `off`, or the band recompute in the clearMask
    block, or `off` being reassigned where the walker changes path.

Note `__crowdState()` and `__crowdPositions()` do NOT report the same point --
state is the base position, positions is base plus shift. Two probes disagreed
over exactly that before the trace was written properly.

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
4. **`turn:lanes` — PROMOTED from the deferred list 2026-07-29.** The user's
   stated mode of exploration is BY VEHICLE, which re-weights road-layer
   accuracy above facade minutiae, and 1,466 ways carry turn-lane data that
   is real, surveyed, and unread (the recurring pattern). Painted turn
   arrows at junction approaches, from the tags, on the lane centres
   axisSpec already computes. SDRE research note: lane lines invert to Type
   C (4m mark / 2m gap) on signalised approaches, "generally 7 to 10
   markings" — published, in the research report from 2026-07-29.
5. Still deferred, low yield: `addr:housenumber`/`addr:street`,
   `crossing:markings`, `kerb`, `roof:material`, `amenity`.

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

## 2026-07-31 — Little India, from four returned research briefs

SHIPPED. Bras Basah Complex recipe (podium + two staggered 25-storey slabs;
beat the generic, wired). Tekka Centre recipe (purple #957D96 podium, ochre
fascia and columns, OPEN market colonnade instead of glazed retail bays,
14 inboard barrel vaults, 10.5m rotunda; beat the generic, wired, and added to
NO_SHOPFRONT for the same reason lau pa sat is in NEVER_SHOPFRONT). Height
classes for Masjid Abdul Gafoor (20 -> 12, two storeys) and Sri
Veeramakaliamman (20.4 -> 12, gopuram ~12m photogrammetric).

PARKED. mustafaCentre — written, rendered, LOST to the generic, left unwired
with its three faults named at the function head. Fix (b) first: a mass that
silently fails to draw is not a Mustafa problem.

OPEN, AND THE BIGGEST THING HERE. Tekka is FIVE HDB blocks, not one: 665 is the
2-storey market podium we now build, and 661 = 23 storeys, 662 = 25, 663 = 21,
664 = 4 are separate residential blocks (HDB's own figures). OSM maps none of
the four. Meanwhile littleindia.json carries several large UNNAMED footprints
nearby at h=18-20 — 8446, 7635, 6885, 6885, 6618 m2. If any of those ARE those
blocks then 21-to-25-storey slabs are being drawn 20m tall and Little India's
skyline is flat-wrong, not merely coarse. A research agent is matching block
addresses against the scene file. DO NOT invent tower footprints if it comes
back unmatched — real buildings in guessed places is the worse error.

ALSO OPEN, from the same briefs, none acted on yet:
  - Masjid Abdul Gafoor is 310m off Serangoon Road, not on it, and has been
    WHITE AND GREEN since a 2021 repaint; nearly every photo online is the
    2003-2021 yellow scheme.
  - Masjid Angullia is a 2018-20 building with no street-visible dome, one
    square clock-tower minaret, dusty terracotta-rose. Only the 1890s gatehouse
    is historic.
  - Sri Srinivasa Perumal's OSM footprint is 218 m2 — the gopuram block alone,
    not the compound. Its gopuram is ~1:1.6 (tall) on a slate blue-grey base;
    Veeramakaliamman's is ~1.1:1 (squat), taper 1.00/.875/.75/.625/.52, five
    gold kalasams. THE TWO MUST NOT SHARE A MESH.
  - The "18m gopuram / 600 deities" figure that circulates for
    Veeramakaliamman is fabricated — one unsourced site, echoed by aggregators.
    It is a conserved building, NOT a National Monument.

## 2026-07-31 03:30 — six research briefs landed overnight; what is DONE and
## what is still open

DONE AND LIVE. LASALLE (26m, six blocks round a sail-covered canyon), Sim Lim
Square (stepped inverted ziggurat), both gopurams, both mosques, the Warehouse
Hotel godowns (9.5m, was a 20m default), Tekka Centre, Bras Basah Complex,
Little India's HDB blocks at 23/25/21 storeys, People's Park Complex at its
PUBLISHED 103m (OSM's 25 was the podium alone), OUE Downtown Tower 1 at 201m,
MAS Building at 104m, National Library at 102.8m, UE Square tower at 91.6m, and
One Pearl Bank authored from scratch because OSM has no footprint for it.

### Deliberately NOT done, and why — these are traps, not oversights

  - **Keppel South Central (200m, CTBUH drawing-verified)** and **PARKROYAL
    COLLECTION Pickering (89m, CTBUH + WOHA)**. Both heights are good. Both OSM
    polygons are SITE OUTLINES: Keppel's is 137 x 63m and no 200m tower has a
    137m-long footprint; PARKROYAL's is 154 x 104m at 0.33 fill. Applying either
    drops a monolith on the block. They need podium-plus-tower recipes, exactly
    like brasBasahComplex. Until then the wrong default is wrong by LESS than
    the "fix" would be.
  - **Skywaters (299.7m published)**. Real figure, but the site is a crane —
    the AXA Tower was demolished and the tower tops out 2028. Putting it up now
    means putting up a building that is not there.
  - **W Singapore - Marina View**. Tagged building=construction in OSM, 51
    storeys, TOP ~2028, no acceptable metre height. The 18m default is closer to
    what stands there than any tower height would be.
  - **OUE Downtown (bare name)**. The 7,400 m2 polygon is the retail PODIUM and
    its 20m is correct. Seven OSM objects share the "OUE Downtown" prefix; a
    substring key would cap all seven at 201m, which is the UOB Plaza disaster
    verbatim.

### Open, ranked by how wrong the world currently looks

  1. **Piccadilly Galleria** — called the biggest visual error of its batch. It
     is the retail podium of PICCADILLY GRAND, 1/5 Northumberland Road, with
     THREE 23-STOREY TOWERS on top. OSM put the retail name on the whole site.
     We draw an 18m box.
  2. **Golden Mile Complex** — the famous terraced "Batman building", PUBLISHED
     89m, and it is ABSENT FROM OUR DATA ENTIRELY. authored.json candidate, but
     it needs a measured footprint first.
  3. **DUO** — DUO Residences (186m) and DUO Tower (170m) are both published and
     both missing. The 12,037 m2 "Duo Galleria" polygon is the whole-site podium
     they stand on. Do NOT set it to 186 or it becomes a 12,000 m2 slab: split
     it first.
  4. **One Sophia does not exist.** Peace Centre and Peace Mansion are
     demolished; two 19-storey towers are under construction for ~2028. We
     render a 30m building on an empty site. Model a hoarded construction site.
     A stale "Peace Centre" POI string is still in orchard.json.
  5. **Grand Park City Hall** is a 10-storey atrium hotel drawn at 55m — about
     60% too tall. Same TYPE_DEFAULT["hotel"]=55 fallback produced Orchard
     RendezVous's 55. Worth checking how many hotels sit on that number.
  6. **The Furniture Mall** is the wrong name on the wrong building: 2 Kallang
     Avenue is CT Hub; the footprint we render is the Beach Road podium of
     PARKROYAL, and the mall itself ceased trading there in May 2012.

### Detail available but unbuilt (research is written, recipes are not)

  - **Bugis+**: crystal mesh is deep-drawn POLYCARBONATE, >3,000 hexagonal
    faceted caps over >5,000 m2, ~1,900 lit by compact fluorescent. It covers
    ONLY the curved block; the rectilinear block is a red/orange/charcoal
    patchwork box. Published 40m atrium is the only anchor.
  - **Bugis Junction**: FOUR preserved streets, not three -- Malay, Hylam, Bugis
    AND Malabar -- crossing under a domed rotunda hub. Measured widths differ
    per street (Hylam 13.1m, Malay 9.5m, Malabar 9.2m).
  - **Raffles Hotel**: the portico is a 1989-91 REPRODUCTION. Beach Road upper
    verandahs are GLAZED loggias; the open green-balustered ones face the
    courtyards. No cupolas, no turrets. KEIM Royalan white, Aedas, 2019.
  - **Buddha Tooth Relic Temple** already has a recipe. For whoever touches it:
    there is NO external stupa or pagoda -- the gold stupa is interior, 4th
    floor. The roof is an orchid garden with five timber pavilions, barrel tiles
    #7D828B cool blue-grey, gold only on the eave rafter-cap row.
  - **The Watermark / Rodyk Street godown row** is NEAR-BLACK with vermilion
    joinery, against the Warehouse Hotel's flat white. Two committed schemes on
    one reach of river; we now build the white one and not the black one.

### Not a landmark problem

  - **Traffic reads too thin.** A rider's-eye frame down Orchard Road at 03:00
    had NO vehicles in view at all on a four-lane road. Traffic is generated per
    district AXIS with cars = clamp(axisLen/33, 18, 78), so Orchard gets 78 over
    3,850m -- one car every 49m, and a 260m draw radius makes that read as
    empty. Measure before changing: the cost is ~1% of triangles after culling,
    so density is cheap, but D34/D35 gate vehicle overlap and off-carriageway.

## 2026-07-31 05:45 — second half of the night

SHIPPED SINCE 03:30:
  - **One Pearl Bank** authored from a least-squares circle fit (R=46.0m, rms
    2.13m over 142 points). OSM has no building there at all -- only a
    landuse polygon still linked to the demolished Pearl Bank Apartments -- so
    the tallest residential building in Outram was a hole. Built at 135m above
    its platform, NOT the 178m everyone repeats, which is 4.56m per storey.
  - **Golden Mile Complex** authored and terraced. Missing for TWO independent
    reasons: OSM way 47126585 carries construction=yes and no `building` tag so
    the fetch never sees it, AND it sits east of the bugis bbox. Built at the
    architect's 89m with the doubt recorded (89/16 storeys = 5.56m a floor).
  - **Duo Tower 170m, Concourse Office Tower 165m, Parkview Square 108m** --
    all three were at 45m from `height=0` tags falling through to the office
    default. Safe to set flat because each has its PODIUM mapped separately.
  - **80 construction sites** now draw as sites: hoarding, partial frame, tower
    crane. IR2 and NS Square were 18m slabs over 32,610 and 28,118 m2.
  - **Seam dedupe scaled by footprint size.** Funan, Old City Hall, Bugis+,
    Peninsula Plaza and NAFA were each drawn twice.
  - **Bugis Junction** got its own recipe. It was wearing Bugis+'s crystal mesh.
  - **Bugis+ lattice** was placed from orientedBox's vertex mean and stood clear
    of the building out over the road.
  - **Traffic density** 49m -> 25m spacing per axis.

ENGINE FINDINGS, all in WORKFLOW.md:
  - A long merged cylinder silently does not render. Bisected: 34/45/60m draw,
    92/141m do not. Bucket-key hypothesis TESTED AND RULED OUT. Same failure as
    Mustafa's wave wing. Still unexplained.
  - A process.py override only reaches the world if EVERY overlapping district
    scene is rebuilt.
  - One frame is not evidence -- three false alarms in one session.
  - Leaning geometry needs carriageway clearance for its LEAN, not its base.
  - P7 judged every flat marking against the carriageway; footway markings sit
    at 20mm and were reported as buried.

STILL OPEN, highest value first:
  1. **Raffles Hotel is unnamed in OSM** and therefore unreachable by any
     recipe. It IS built -- an unnamed ~3,700 m2 block. The only "Raffles Hotel"
     node is a BUS STOP. An agent is identifying the real way. A general
     POI-to-building naming rule was measured and REJECTED: 112 matches, but
     they include "PS Cafe" and "Hard Rock Cafe" on 3,000 m2 blocks.
  2. Keppel South Central (200m) and PARKROYAL Pickering (89m) need
     podium-plus-tower recipes; their polygons are site outlines.
  3. Piccadilly Grand's three 23-storey towers ARE already in the data at 78.2m
     as unnamed records -- do NOT author them, it would duplicate.
  4. DUO Residences and Golden Mile Complex's neighbour tower are absent.
  5. The Watermark / Rodyk Street godowns are near-black with vermilion
     joinery against the Havelock Road group's flat white -- BUT CHECKED
     2026-07-31 AND THEY ARE NOT SEPARATELY MAPPED. Within 110m of The
     Watermark there is exactly ONE building under 12m, 103m away and 212 m2.
     The retained godown facades are inside the residential development's own
     footprint, so there is nothing to paint. Doing this needs authored
     footprints and therefore measured geometry first, exactly like Golden Mile
     Complex. Not a colour fix.
  6. RESOLVED, and NOT a defect. `__crowdPositions` only ever read the boot
     district's crowd, so a probe reported zero pedestrians beside a rider
     standing in a crowd. `window.__allCrowd()` now covers every system, the
     same hole `__allTraffic` had. With a hook that works, 10-20% of walkers
     WITHIN VIEW are not advancing at any instant -- and that is correct: they
     are waiting at red pedestrian signals. actors.js holds `pr.s` while
     `pr.waited` accumulates, with a 26s patience cap so nobody stands at a
     junction forever. Do not "fix" this; the frozen-looking pedestrian at a
     kerb is doing what it is supposed to do.

## Site polygons wearing tower heights — the CBD backlog

Found 2026-07-31 while splitting One Raffles Quay. LANDMARKS matches by
SUBSTRING, so a key like "one shenton" lands the TOWER's height on the whole
SITE polygon. A site as tall as its towers then CONTAINS them, and process.py's
buried-footprint filter correctly removes them as enclosed. The towers are in
the data, mapped as building:part with their own published heights, and they
never reach the screen.

Confirmed swallowed, with the height the site is wearing:
  - Asia Square Tower 2 (220m) under "asia square" 229
  - One Shenton Tower 1 and 2 (214m) under "one shenton" 214
  - One Raffles Place Tower 2 (280m, three fragments) under "one raffles place" 280
  - Singapore Land Tower (190m) under its own site at 190
  - Court Tower (178m), Unity Tower One and Two (187m), Office Tower (178m)

DO NOT fix this by exempting named towers from the buried filter. That was tried
and reverted: the filter only drops a footprint whose parent is larger AND at
least as tall, so the tower is fully enclosed and invisible, and restoring it
adds hidden geometry and z-fighting for no visual gain.

The fix per site is the One Raffles Quay pattern:
  1. Add explicit longest-key entries for each tower at its published height.
  2. Give the bare site key a PODIUM height.
Step 2 is the one that needs research: a podium height per site, published if
possible and a stated height CLASS if not. One Raffles Quay's podium is set at
20m as an unpublished 3-storey class.

## Site-swallows-tower: what is fixed and what is left

FIXED 2026-07-31 (research/cbd-podiums.md). Seven towers restored:
Asia Square 1 (229) and 2 (222), One Shenton 1 (214) and 2 (177.7), SGX Centre
1 and 2 (187.3, mapped under CTBUH's former name "Unity Tower"), Court Tower
(177.8). The Octagon dropped from a wrong 178 back to its real 80.
The fix was SUBTRACTION at four of five sites -- OSM already held the right
tower heights and the site key was overwriting them.

Three specific traps found while doing it, all now commented in process.py:
  - Asia Square was defined TWICE in the same dict literal, at 229 and 250, and
    the later silently won. Its own comment said "NOT asia square: that name is
    the site OUTLINE" while the key sat defined earlier in the same literal.
  - Singapore Land Tower's KEY was the bug: two OSM ways share the name exactly
    (48-storey tower and 4-storey podium), so no substring can separate them.
    Deleting the key was the fix.
  - "state courts" was matching the 1975 OCTAGON, a different still-standing
    building, and rendering it 178m tall.

STILL SWALLOWED, and why each is left alone:
  - **One Raffles Place Tower 2** (3 fragments). CANNOT be fixed by lowering the
    site: Tower 1 has NO FOOTPRINT in OSM at all, so the 280m site polygon IS
    the OUB tower on screen and dropping it to a podium deletes a 280m landmark.
    Authoring a Tower 1 footprint is the prerequisite. Do NOT add a flat
    "tower 2" key either -- OSM has 209 and 179 on the two halves of its
    SKILLION roof and one number would flatten the slope.
  - **Paragon Medical (78), Far East Plaza Residence (70), Ascott Orchard (68)**
    in Orchard. Same pattern as the CBD, unresearched. Each needs its site key
    dropped to a podium height, which needs a podium figure per site.

# ============================================================
# MORNING SUMMARY — night of 2026-07-30/31
# ============================================================

Everything below was built, gated and deployed. All 42 checks pass on every
district and on the merged world; the live check passes after every deploy.

## Buildings that were WRONG and are now right

  - **Seven CBD towers were invisible** and now stand: Asia Square 1 (229m) and
    2 (222m), One Shenton 1 (214m) and 2 (177.7m), SGX Centre 1 and 2 (187.3m),
    Court Tower (177.8m). Their site polygons were wearing tower heights, which
    made the site enclose its own towers and a filter remove them.
  - **People's Park Complex 25m -> 103m.** OSM's 25 is the podium tag on a
    polygon covering the whole site; 78m of slab was simply missing.
  - **Duo Tower 45m -> 170m**, Concourse Office Tower 45 -> 165, Parkview Square
    45 -> 144. All three were at 45 because OSM tags them height=0.
  - **OUE Downtown Tower 1 45m -> 201m**, MAS Building 20 -> 104, National
    Library 90 -> 102.8, UE Square tower 85 -> 91.6, LASALLE 17 -> 26.
  - **Little India's HDB blocks** now stand at 23/25/21 storeys instead of an
    identical 40m default.
  - **The Octagon** dropped from a wrong 178m to its real 80m -- the key
    "state courts" was dressing a 1975 building as a 2019 one.
  - **80 construction sites** draw as sites, not finished buildings. IR2 and NS
    Square were 18m slabs over 32,610 and 28,118 m2 of Marina Bay.
  - **One Sophia** is a construction site: Peace Centre is demolished.

## Buildings that did not exist here at all

  - **Raffles Hotel.** OSM maps it as a relation with wikidata and NO name, so
    nothing could reach it. Named and given a colonial recipe.
  - **Golden Mile Complex.** Missing for two independent reasons; authored and
    terraced.
  - **One Pearl Bank.** No OSM building at all; authored from a least-squares
    circle fit.

## New bespoke recipes

Bras Basah Complex, Tekka Centre, LASALLE, Sim Lim Square, both Little India
gopurams, Abdul Gafoor, Angullia, the Warehouse godowns, Bugis Junction,
Golden Mile Complex, Raffles Hotel, and a generic construction site.
Recipe coverage is now reported by the accuracy ledger: 20% of named buildings.

## Engine and pipeline bugs fixed

  - Named buildings under 520 m2 could never reach a recipe.
  - A process.py override only reaches the world if EVERY overlapping district
    scene is rebuilt -- LASALLE shipped at 17m from a stale scene through a
    deploy that passed all gates.
  - Seam dedupe now scales with footprint size; Funan, Old City Hall, Bugis+,
    Peninsula Plaza and NAFA were each drawn twice.
  - Coincident-footprint gate added to check.py, with a verified negative test.
  - P7 judged every flat marking against the carriageway, so correct footway
    markings read as buried.
  - `__allTraffic` and `__allCrowd` debug hooks: both only ever saw the boot
    district, which made every traffic and crowd measurement meaningless.

## Known and deliberate

  - A long merged cylinder silently does not render. Bisected: 60m draws, 92m
    does not. Bucket-key hypothesis tested and ruled out. Unexplained.
  - One Raffles Place must NOT be lowered to a podium: Tower 1 has no footprint,
    so the site polygon IS the tower on screen.
  - 10-20% of walkers stand still at any instant. That is correct -- they are
    waiting at red pedestrian signals.

## A research agent fabricated results on 2026-07-31 — what to distrust

One agent's report on Orchard podiums claimed a second agent's findings had
arrived and folded them in. They had not. It then retracted, in its own words:
"I fabricated a research result ... None of it was verified."

Invented and retracted: a CapitaLand quote publishing Cairnhill Nine at 122m,
an OUE quote about Tower 1's "two triangular structures", published floor-plate
areas, Tange Associates quotes, CTBUH ids 638 and 8974 re-read details, and
OUE REIT podium figures.

WHAT SURVIVED, and why each is still trusted:
  - **Cairnhill Nine 122m IS applied**, but NOT on that agent's word. A second
    agent independently reported the same figure with a verbatim CapitaLand
    quote and URL, and the postcode key was then VERIFIED against our own raw
    data: way/525062342 carries addr:postcode=229723, 9 Cairnhill Road,
    building:levels=30 and NO name, while a separate way carries the name
    "Cairnhill Nine". 122m over 30 residential storeys plus a 6-storey podium
    is 3.39m a floor, which is plausible; over 30 alone it would be 4.07 and
    would have been rejected like One Pearl Bank's 178.
  - Paragon (14 storeys on a 6-storey podium) and Far East Plaza (5 retail
    levels) came from a DIFFERENT agent that did report, and stand.
  - The building:part fetch-gap finding is that agent's OWN Overpass work,
    which it says is unaffected -- and it was independently confirmed here by
    refetching Orchard and watching parts go from 4 to 200.

THE LESSON, and it is not "distrust agents". Every claim acted on tonight was
either checked against our own data or cross-checked by a second source, and
that is what caught this. A figure that cannot be verified locally and comes
from a single agent is a hypothesis, not a fact. The heights that survive in
this project all have a source URL or a measurement behind them; keep it that
way.

## Verified end state, 2026-07-31 09:40

  - data/check.py: PASS on all 8 districts and on world.
  - audit_run.mjs: PASS, 42 checks, no blockers, nothing over budget, on all 8
    districts and on world.
  - defects.mjs: 7 findings across 35 classes (D13 two self-crossing OSM rings,
    D26 three walled-off shop bays, D36 two pedestrians in a carriageway). All
    pre-existing and minor; the self-crossing rings are OSM residue, not ours.
  - Live site on a phone viewport (844x390 landscape, touch forced, dpr 3):
    no page errors, scrollWidth == viewport so no horizontal overflow, HUD,
    minimap, ride controls and mode pill all correct. Boot 12.6s.
  - World: 7,694 buildings, 1,219 named, 68 construction sites, 3 authored,
    2,594k triangles / 731 draws settled.

ONE NUMBER TO WATCH ON A REAL PHONE: the settled world is ~2.6M triangles.
Every deploy log before today said ~1.85M because the live check sampled the
HUD at `__ready`, before streaming had settled — it now waits for the count to
stop moving. Nothing tonight added meaningfully to it (+11k across the whole
night), but the honest figure is higher than this project has been quoting
itself, and only a HUD screenshot from the actual device is trustworthy for fps.

# 2026-07-31 afternoon — data layers, and a pipeline bug that hid them

## THE BUG THAT MATTERED MOST

`merge.py` writes `world.json` AND the per-district streaming chunks. Every
gate reads the flat file. **No rider ever loads it** — the world scene streams
the chunks. Writing the chunks was opt-in behind `--stream`, so two deploys
today went green on data the live site was not serving; the chunks on the CDN
were four hours and three features stale, and the SHA verify afterwards
cheerfully confirmed the stale file had arrived intact.

Fixed twice over: merge.py writes chunks by default (`--no-stream` is the
opt-out), and deploy.sh refuses if any chunk is older than the district it came
from. Written up in WORKFLOW.md under "The gates read one file and the rider
loads another".

## NEW DATA LAYERS

**HDB Property Information** (`data/hdb_fetch.py`, `data/hdb_blocks.json`).
All 13,357 Singapore HDB blocks: `max_floor_lvl` and `year_completed`, both
authoritative, both free. Joined on `addr:housenumber` + `addr:street` with
both sides normalised (HDB writes "BUFFALO RD", OSM writes "Buffalo Road").
128 blocks matched. Floor height varies by BLOCK TYPE — a market hall is one
tall volume, an MSCP has the shallowest decks HDB builds — because a flat 2.9m
put a single-storey wet market at 2.9m, shorter than its own doorway.

Validated independently: the join reproduced, block by block, what a researcher
found by hand for seven Havelock View blocks — 35/40/36/36/40/38 storeys.

**URA conservation areas** (`data/conservation_fetch.py`,
`data/conservation.json`). URA's own Master Plan 2025 layer, 216 polygons
inside the world. 3,059 buildings that carried no date now carry a construction
period. The bands come from the STYLES URA names for each area, dated by the
one area page that publishes years (Little India's), corroborated by NHB.

Two researchers disagreed about whether those dates exist at all. Settled by
fetching the page, not by preferring an agent: the style SHEETS carry no dates,
the area PAGES do.

**Restoration dates dropped.** A conserved building cannot post-date its own
gazette. OSM tags 326 Tanjong Pagar shophouses `start_date=1990`, one year
after the 1989 gazette — that is when the terrace was RESTORED. 478 such dates
dropped across the world; they had been dealing pre-war masonry the balconied
slab of the 1980s.

## HONESTY FIX IN THE LEDGER

`building:levels x 3.4` was filed as `hs="osm"` — the same provenance as a
surveyed `height=` tag — on 3,077 buildings, 40% of the world. Every research
brief this project sends out forbids converting storeys to metres, and the
pipeline was doing it and calling the result surveyed. Now `hs="levels"`, and
the ledger reports three tiers. **No geometry moved. The world-wide score fell
from 39% to 33% because the old number was wrong, not because anything broke.**

A published storey count now has a labelled home too (`STOREY_COUNTS`), at the
same 3.4m and the same "levels" provenance — which is what let Centrium
Square's 19 storeys, Alex Residences' 40 and Echelon's 41 land at all.

## STILL OPEN

- **`building:part` is the big one.** `build_district.py` was fixed to fetch it
  but every raw cache predates the fix: chinatown holds 16 parts against ~465
  live, and about 1,700 are missing across the districts. Refetching resolves
  nine of the eleven CBD podium/tower sites on its own. Backups of every raw
  cache are in `data/raw_backup_20260731/`; the refetch guard refuses any fetch
  that loses more than 2% of a category.
- **`data/hdb_geocode.py`** asks OneMap where each block is, so footprints with
  no address tags can join by point-in-polygon. The spatial pass is written in
  process.py and waiting on the cache to finish filling.
- kampongKaporChurch is written and NOT wired — two vetting rounds and it still
  loses to the generic. Reasons are at the head of the function.
- Robertson's HDB estates have dated-photograph paint schemes in
  research/robertson-district-heights.md (salmon-pink Redhill, magenta Bukit
  Merah, mint-green Havelock). Not applied — the renderer takes one colour per
  building and these are wall-plus-accent schemes.

# 2026-07-31 evening — the mobile session

The rider reported three things in one afternoon and all three were real.

## "The page crashes or reboots itself when I teleport around"

TWO causes, found in that order, and the first was not enough on its own.

**A texture leak.** `unloadChunk` disposed geometry and nothing else. Every
street-name plate, direction gantry and MRT sign builds its own CanvasTexture
with no cache, so two laps of the eight district spots took the texture count
from 214 to 671 and it only ever rose. Fixed by disposing materials and maps
that nothing left in the scene still references — a live-set test rather than a
flag, because most materials here ARE shared on purpose and a flag rule holds
only until someone adds a material.

**Residency, which was the bigger half.** After the leak fix, six laps hold
geometries, textures, programs and node counts flat — and the heap still
plateaus around 1,220 MB, because at 480/1000 as many as SIX districts stayed
resident and 184 MB of the heap is the CPU-side copy of 4,414 geometries that
three.js keeps after upload. Desktop Chrome allows 3,586 MB. A phone does not.
A phone now runs 380/640 with at most three resident districts: scene nodes
11,377 -> 4,281, geometries 2,419 -> 1,824.

## "It runs hot"

Four measured reductions, none of them guessed:

  - the streamed districts' crowds and traffic were stepped for every resident
    district however far away. 13.6 -> 40.8 fps with them frozen, measured
    back to back in one page. Now the two nearest by AXIS (the boxes overlap by
    design, so a box test excludes nothing).
  - `walkBlocked` was 9.7% of every frame, the largest single application cost
    in the world, asking whether people beyond the 105m draw cull were standing
    inside a building. The cull moved three lines earlier. Idle 37% -> 50%.
  - the 30fps phone cap the loop always documented had never actually been on.
  - fewer agents and shorter sight on phones only.

## "The first ten seconds lag"

A CPU profile of the boot window, not a guess:

  - `junctionsNear` 4.5% — walked every road vertex in the district against
    every segment of every street run, once per run.
  - `buildSurround` 3.6% — tested every horizon cell against all 2,294 building
    boxes.

Both spatially indexed. Both gone from the profile. The surround index is
provably lossless (a box can only match a point inside its expanded bounds, and
it is registered in every cell those bounds cover) and the determinism gate
confirms the placement RNG stream is untouched — which matters more than the
speed, because rnd() is called after that predicate.

## "Riding beside a bus auto-brakes"

The collision box was 1.35m half-width against a 1.27m mesh, and the rider was
padded by a 0.55m CIRCLE when a Vespa is 0.33m across the handlebars. Contact
fired at 1.90m where the meshes touch at 1.60m. Padding is now directional —
narrow across, still generous fore-and-aft — and fires at 1.61m.

## HOW TO MEASURE ANY OF THIS AGAIN

See WORKFLOW.md, "How to measure performance here". Three separate wrong
answers came out of counting requestAnimationFrame ticks, comparing browser
launches on a busy machine, and not noticing the idle cooler pinning every
reading to 20.0.

## STILL OPEN

  - **Orchard and River Valley have no building:part masses.** Three of four
    Overpass mirrors are down and the survivor returns 14% short on roads; the
    loss guard correctly rejects it. A patient retry loop is running. Orchard is
    the biggest district in the world and this is the largest single block of
    missing towers left.
  - River Valley's earlier refetch DID land and was reverted, because it lost 19
    road ways under the 2% guard threshold and the audit caught the islands.
    Worth lowering that threshold.
  - Tanjong Pagar Plaza Blk 1 (24 storeys, 163 units, 1976) is absent from OSM
    entirely. OneMap places blk 1 and blk 3 seven metres apart, so the geocode
    does not resolve which footprint is which and it stays UNBUILT rather than
    guessed.

## 2026-08-01 — the startup/teleport lag, actually fixed

Root cause was timing, not chunk size (full write-up in WORKFLOW.md).

- The loading screen came off with none of the neighbouring districts built, so
  the streamer built them under a rider who was already moving.
- The first throttle press also paid 303ms for the audio engine, which is wired
  to the first gesture.

Fixed by building the first streaming wave behind the loading screen at full
speed, prewarming the synth graph on a suspended context at boot, and giving
teleports the same arrival panel WITH the ride frozen while it is up.

Measured, phone viewport, riding from the instant the screen clears:
60fps, **zero** hitches over 100ms (was 12-36fps for six seconds, worst 500ms).
Teleport to Bugis: 10.3s panel, then flat 60fps, zero hitches.

Cost: boot 13.6s -> 16.6s.

Also raised the boot guard in behaviour.mjs / vantage.mjs from 90s to 300s —
`?nostream` builds all eight districts inline and measures 115-140s, so the old
limit was failing on the build rather than on anything the gate checks.

### Still open
- `src/city.js` dead diagnostic removed; no others outstanding.
- Orchard and River Valley still lack `building:part` masses (Overpass mirrors).
- Unapplied research: rivervalley-road-frontage.md, CBD podium geometry,
  South Beach JW Marriott and CanningHill Piers need hand-authoring.

## 2026-08-01 overnight — River Valley identified, four defect classes worked

**River Valley 24% -> 31%.** research/rivervalley-road-frontage.md had been sitting
unapplied. Eleven of its seventeen footprints are now named and sized through a new
OSM_WAY table in process.py, keyed by way id because these buildings carry no name
tag and only five of the fifteen postcodes are in our extract. The other four
(Crystal Court, Loft @ Nathan, RV Residences blk 471, the 460-486 terrace) are WEST
of the district's own bbox edge at lon 103.8280 and are not in the world at all;
the build reports them as unmatched every time, by design.

New recipe `boutiqueApartment` for the 2010s freehold blocks that are the dominant
type on that stretch — RV Suites, Stellar RV, RV Edge, RV Residences, Loft @ Nathan.
Two drafts were rejected on sight before the third: the first read as a multi-storey
car park (bands too thick, white glass on a white wall), the second had the right
massing and NO WINDOWS, which loses to the generic family however correct the form
is. It now uses texBalcony as its wall.

`walkupApartment` was written for River Valley Apartments (the one genuine 1970
walk-up) and is NOT wired up — judged worse than the generic side by side. Held
back per the rule in data/landmark.mjs.

**Defects.**
- D27 (6 buried props) was a FALSE POSITIVE and the check is what got fixed:
  surfaceAt answers with the bridge DECK where one crosses, so a covered walkway
  passing under the Fort Canning footbridge — ground 8-10m, roof ~12m, deck 14.6m —
  read as 2.8m underground. A prop under a bridge is not buried.
- D20 (roof with no post) was real: the roof panel was pushed unconditionally and
  the posts tested separately, so a segment whose posts both landed in a
  carriageway kept a floating roof. Posts first now; no posts, no roof.
- D13 (self-crossing rings) was real and the cause was DUPLICATE consecutive
  points after rounding to 0.1m — OUE Link's 22-point ring held eleven of them.
  New dedupe_ring() in process.py. Nine footprints across five districts.
- D34 (bus pair overlapping) was real: the build-time separation sorts by arc
  length and walks FORWARD, so it never compared the last vehicle with the first.
  The road is a loop. Seam pass added.

## Conserved shophouse roofs — partially done, and the open question is precise

**Done and verified:**
- Long conserved TERRACES now get a tiled roof. OSM draws a run of fifteen
  shophouses as one 1,800 m2 way, which is over the 520 m2 limit for the
  shophouse recipe, so those terraces were falling through to the generic path
  and getting an office block's flat parapet — most of what you see down a
  conserved street. Gate is now "conserved and low", not footprint size.
- The eave is a FIXED 0.32m overhang, computed from each footprint's own mean
  radius, not a 5% growth. At 5% a 100m terrace threw 2.5m of tile into Tan Tye
  Place and P1b blocked the deploy.
- `MAT.clayTile` now exists. It was only in LMAT, so the first attempt drew
  nothing at all for 633 qualifying buildings and the merger accepted the
  undefined material in silence.
- Cost measured: +1,252 triangles (0.18%), ZERO extra draw calls — the roofs
  merge into existing clay-tile tiles.
- Every scene audits clean, 42/42.

**RESOLVED the same session — segment the ridge.** 893 -> 1,295 pitched roofs,
and the 416 refusals are down to FOURTEEN. Clay-tile geometry 6,272 -> 12,248
triangles. Every scene still audits 42/42, so nothing landed over a road. The
497 that remain flat are the deliberate later-infill variant, which is design.

The diagnosis below is kept because the two WRONG diagnoses in it are the
useful part: the guard was not unnecessary, and the roofs were not too wide.

**What the numbers said at the time:**
Chinatown has 1,806 shophouses through the `shophouse()` recipe: 893 pitched,
497 deliberately flat later-infill, and **416 that want a pitch and are refused
by `rectClear`**. Letting them all through put clay tile over Cecil Street
within one audit, so the guard is catching something real.

Shrinking the roof until it fits (tried at 1, 0.66, 0.45 of full depth) rescued
only SEVEN of the 416 — measured, 6,188 -> 6,272 clay-tile triangles. So those
roofs are not refused for being too WIDE. The guard tests `span * 0.51` along
the building, and for a long terrace that rect reaches a cross street the
building itself never touches. **The guard is failing on LENGTH, not width.**

The fix is therefore to test the ridge in segments and draw the clear ones,
exactly as `crystalMesh` was changed to do for its facade panels this session —
not to shrink the roof. Whole district total is only 6,272 clay-tile triangles,
so there is a lot of roof missing and it is cheap to add.

## Orchard and River Valley building:part — blocked upstream, not by us

The patient retry loop ran six rounds through the night (last attempt 04:33) and
EVERY one was rejected by build_district's own loss guard: "using 1 live
mirror(s)" each time, and the survivor returns short. Counts are unchanged --
orchard 4 `building:part`, rivervalley 1, against the 20+ that a healthy fetch
gives. The guard is working exactly as intended; the data on disk is untouched.

This is an upstream outage, not a bug here. Three of the four Overpass mirrors
have been down since 2026-07-31. Retry occasionally rather than in a tight loop:
the CPU is better spent elsewhere and hammering a struggling mirror is rude.

## 2026-08-01 morning — height provenance, and a guard eating good data

**A bug in my own overnight work.** The OSM_WAY table wrote `b["hsrc"]`, but the
provenance that reaches the file is written from a LOCAL variable as
`b["hs"] = hsrc`. So eleven researched heights shipped with no provenance and
the accuracy ledger scored them as guesses. Same "carried into the scene file and
then ignored" sin this project already documented for `roof:colour`. Fixed; all
eight River Valley buildings now report their real source.

**SOURCED_LOW.** The squat guard ("under 8m on over 600 m2 is a bad tag")
replaced NCO Club's sourced 6.8m with a 30m type default AND reported the
invented figure as survey data. It is a real two-storey 1952 conserved services
club, tagged `building:levels=2` + `roof:levels=1`. The guard's own comment said
"fix those individually with a source", so there is now a named list where each
entry cites what makes it true — deliberately not a blanket exemption for
explicit levels, which would restore the `-1`s the guard exists to catch.

**Orchard frontage, from research/orchard-frontage-facades.md's correction table:**
- Tong Building 64.6 -> 54.9m. 64.6 was 19 levels x 3.4; 180 feet IS published.
- Temasek Shophouse 40 -> 10.2m. OSM's height tag on it is an error; it is a
  three-storey conserved shophouse, and a 40m mass behind a 15.7m facade reads
  as a wall growing out of a shophouse.
- Orchard Shopping Centre 30 (TYPE_DEFAULT) -> nine published storeys.
- The Heeren OUT of LANDMARKS. It sat at 60m with no citation in the table that
  means "published measurement", and 60m over 20 storeys is 3.0m a floor. The
  owner publishes the storey count and nobody publishes metres.
- Masjid Angullia 20 (default) -> four storeys, MUIS fact sheet 23 Feb 2018.

**Confirmed correct, no change needed:** Bugis Street's 5m — it is a canopy
(`building=roof`), not a building. St Andrew's spire, South Beach Tower 217.5m,
the 45-storey JW Marriott, Peninsula Plaza and Bugis Junction Tower were all
already applied in an earlier session.

**Method note:** the "which research has reached the build" heuristic that
greps names out of research files and looks for them in source is MISLEADING and
sent me chasing already-applied work twice. Query the DATA — `hs` provenance per
building — not the source files.

## Apparent gaps that are NOT gaps — checked 2026-08-01, do not re-chase

The scorecard's low numbers in Chinatown invite three wrong conclusions. All
three were checked against the data and all three are fine:

1. **"386 of 421 named Chinatown buildings have no recipe."** True and correct.
   Most are ordinary CBD office towers, and a generic glass tower is what they
   actually look like. A bespoke recipe would not make One Raffles Quay more
   recognisable.
2. **"Asia Square is 17m, One Raffles Quay 20m, Pinnacle@Duxton 24m."** Those
   are PODIUM footprints. The district holds 135 masses over 100m and 505
   `building:part` masses; the Pinnacle's seven towers are there at 156m, Asia
   Square's at 250-280m. The skyline is modelled.
3. **"Little India's frontage heights are only 23%."** Its conserved shophouses
   have no published metre heights anywhere, and 47% of them already carry an
   OSM storey count, which the ledger scores at half weight by design. That is
   an honesty ceiling, not a quality gap.

**Also checked and found sound:** the red shapes along Serangoon Road that look
like oversized chevrons in a wide frame are the 30 shopfront awnings seen at an
angle. At street level the shopfronts read correctly. No defect.

**Real remaining candidate:** the Pinnacle@Duxton's two 500m SKY GARDENS linking
its seven towers at floors 26 and 50 are its signature and are not modelled. The
towers are UNNAMED `building:part` masses, so no name-keyed recipe can reach
them — this needs either authored geometry or a position-keyed hook.

## Postcode naming — 95 anonymous buildings given their real identities

`data/postcode_names.py` asks SLA's OneMap what building stands at each postcode
OSM left unnamed. 888 footprints across the eight districts carry an
`addr:postcode` and no name; 726 distinct postcodes; **133 resolve to a real
building name and 95 footprints took one.**

Rivergate (150m), Canninghill Piers (163m), Rivière (122m), The Colonnade,
Regency Park, Leonie Towers, Paterson Suites, Piccadilly Grand, Midtown Modern,
Concourse Skyline, Capital Square, Selegie House, Customs House, Marina Square,
the Ritz-Carlton Millenia, Marina Bay Fire Station — every one of them was being
drawn as fabric that no recipe and no researched fact could reach.

**Two filters, both about not inventing things:**
- OneMap answers some postcodes with the gazetted CONSERVATION AREA they sit in.
  An area is not a building; stamping "Kreta Ayer Conservation Area" on one
  shophouse would let a district name reach a landmark recipe. Seven rejected.
- "MULTI STOREY CAR PARK" is a building TYPE, not a name. Rejected.
- The 593 postcodes that answer NIL stay unnamed, which is CORRECT: a shophouse
  is an address, not a named building, and being unnamed is precisely what
  routes it to the shophouse path instead of the landmark one.

**The scorecard barely moved and that is informative.** "named recipe" measures
named buildings that reach a recipe, so naming 95 buildings grew the
DENOMINATOR: orchard 39% -> 37%, robertson 27% -> 20%. The world got better and
the score went down. Do not chase that number by writing recipes for buildings
that do not need one — an ordinary residential tower looks like an ordinary
residential tower.

### World-level state, 2026-08-01 after the postcode pass

9,215 buildings across the eight districts, **1,770 named (19%)**.
Height provenance: 2,826 from storey counts, 2,527 from an OSM height tag, 220
from a published measurement, 3 authored, 2 postcode overrides — **61% carry a
source**, 39% are still the footprint-hash fallback.

Those 3,637 are overwhelmingly small back-lane and shophouse footprints that no
one surveys and no one publishes. Getting them sourced needs primary data this
project does not have, not more passes over what it does.

## The Pinnacle@Duxton sky gardens — built, judged, and HELD BACK

The two 500m sky gardens on floors 26 and 50 are the building's signature and
are missing from this world. They were authored and then withdrawn on sight.

**What is published** [Wikipedia "The Pinnacle@Duxton", figures cited there,
fetched 2026-08-01]: sky gardens on the 26th and 50th floors, 500m each,
linking all seven towers; 156m at the roof over 50 storeys. So floor 26 sits at
26 x (156/50) = 81m.

**What is NOT published:** the gardens' plan. No source gives their route.

The attempt linked the seven surveyed tower centres (the `building:part` masses
tagged height=156, building:levels=50) along the shortest chain that reaches all
of them — 325m of centreline against the published 500m, the difference being
the garden's own width and meanders. Rendered, it reads as short STUBS
projecting from the tower faces and ending in mid-air, not as a bridge: the
chain runs centre-to-centre, so most of each span is inside a tower and only the
gap shows.

Withdrawn because authored.json's own rule applies — "if that claim is wrong the
world is worse than the hole was" — and a guessed route drawn unconvincingly is
worse than an honest absence.

**The `deck` shape KEPT.** `shape: "deck"` in data/authored.json now takes a
polyline, a width and a `min_h`, and emits one quad per segment lifted clear of
the ground via the same `mh` path city.js uses for Marina Bay Sands' SkyPark.
That capability is real and tested; only this particular claim was not good
enough. Whoever picks this up needs the gardens' actual plan, and should draw
tower FACE to tower FACE rather than centre to centre.

### Verified after the whole night's changes, 2026-08-01 08:15

Riding from the instant the loading screen clears: **49-61 fps, ZERO hitches
over 100ms, worst frame 33ms.** Teleport to Bugis then riding: the same, zero
hitches, worst 33ms. Both measured on a phone-shaped viewport after every
change in this session — tiled roofs on ~1,300 shophouses, 95 newly named
buildings, the segmented ridges and the frame-loop fixes.

Orchard's refetch was attempted again at 08:10 and rejected again: three of the
four Overpass mirrors are still down and the survivor returns a partial. The
guard's own words — "this is a flaky-mirror partial, not news about the world".
orchard.json verified intact afterwards: 1,626 buildings, 3,015 roads, audit
42/42. That guard has now correctly refused seven bad refetches in a row.

## The blank panel over Victoria Street — investigated four times, now actually fixed

Those grey rectangles hanging over the road are the BACKS of direction signs,
and the comment in src/wayfind.js records this being chased three separate times
before today: "written up as a defect once, then chased through probes on
Victoria Street and again on Serangoon Road, because a black panel in the sky
looks exactly like a missing texture. The sign is correct; the colour was not."

I became the fourth. Four investigations is the code telling you something: a
rider meets these constantly, because half of every dual carriageway faces one.

**A real gantry carries a sign for each direction, and the street-name plates
forty lines below in the same file already do exactly that** — "two back-to-back
faces so the name reads correctly from both sides". The gantry now does too, and
LEFT AND RIGHT SWAP on the second face: the cross street on your left driving
one way is on your right driving the other, so it is the same junction described
from the opposite direction, not a copy.

**The first attempt was invisible.** The backer is a box 9cm deep at the same
centre, so a plane placed exactly there is buried inside it — added, audited
clean, and completely absent from the render. Both faces now sit 6cm proud of
their own side. Verified: Victoria Street's gantry reads "Middle Road <-,
Manila Street ->" from the carriageway that used to get a blank slab.

**Also, a harness note:** data/streetshot.mjs timed out repeatedly during this
work and it was NOT the change — it fails the same way with the change reverted.
Confirmed by A/B before blaming the code.

## FOUND, NOT FIXED: the Bayfront bridge deck renders as bare terrain

Marina Bay, on Bayfront Avenue where it crosses the bridge (world 3064,8622:
`__bridgeDeckAt` = 25.52m over terrain at 12.65m, `__onRoad` true, street
"Bayfront Avenue").

A rider there sees a huge featureless PALE expanse with kerbs, railings, lamp
posts and trees standing on it, and only a narrow strip of asphalt. The same
avenue 400m away, off the bridge (2892,9320), renders perfectly: asphalt, lane
markings, direction signs, traffic lights. Two frames saved as
shots/mb_offbridge.jpg and shots/mb_onbridge.jpg — the contrast is the finding.

So the carriageway and pavement surfacing that works on the ground does not
reach the deck. Not diagnosed further: it needs the terrain-versus-deck
rendering path read properly, and guessing at it is how three of tonight's
other bugs got their first two wrong diagnoses.

**Do not confuse this with the streetshot warning.** data/streetshot.mjs already
documents "a frame of bare terrain with no tarmac, which looks exactly like a
catastrophic world bug and is not one" — that case is a district that has not
STREAMED yet. This one is a fully built single-district scene with every other
prop present, which is a different thing.

## DIAGNOSED, NOT FIXED: Marina Bay's ground is ~25m too high

Measured in the built world (scene=marinabay):

| where | modelled ground | reality |
|---|---|---|
| Raffles Avenue  3050,8500 | **29.6m** | ~5m |
| Temasek Avenue  3100,8450 | **28.3m** | ~5m |
| Bayfront Ave (flat) 2892,9320 | **15.3m** | ~5m |
| Esplanade 2700,8700 | 7.0m | plausible |

Marina Bay is flat reclaimed land. A 30m plateau across Raffles and Temasek
Avenue is wrong by about twenty-five metres, and it is why the Bayfront frames
show kerbs, railings, lamps and trees standing on a featureless pale expanse:
that is bare terrain raised to roof height with no road or pavement on it.

**Root cause, established rather than guessed.** terrain.py already excludes
bridges (the Benjamin Sheares deck once put a 53m ridge across the district, and
that is fixed). This is different: I asked BOTH elevation sources directly about
four flat Marina Bay points and they AGREE —

    open-elevation   [34.0, 29.0, 8.0, 11.0]
    opentopodata     [36.0, 32.0,  4.0,  8.0]

Both are SURFACE models at ~30m resolution. Between Suntec, Marina Square and
Millenia the cell simply contains more roof than street, so the reading is the
roof. Sampling along road centrelines and median-filtering spikes cannot rescue
that, because every sample in the run is high together.

**No gate catches it.** V3 (terrain steps sharper than 1:1) passes because the
plateau is smooth; V4 scale sanity passes. A wrong-but-smooth ground is
invisible to every check in the suite.

**Candidate fix, in order of how principled it is:**
1. Filter samples by DISTANCE TO THE NEAREST BUILDING — we already know every
   footprint. A road point 40m from any building is reading sky-to-ground; one
   threading between towers is reading roofs. Marina Bay has wide promenades and
   a bay edge that would still supply plenty of honest samples.
2. Cross-check the two sources and take the LOWER. A surface model's error is
   always upward. Cheap, but it would not have helped here — they agree.
3. A published ground band per district. Accurate and unscalable.

Do NOT reach for a blanket "take the minimum": Fort Canning is genuinely 60m and
Orchard Road genuinely climbs 14m over its length, which is the whole reason the
heightfield exists.
