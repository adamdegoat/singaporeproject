# Start here

Read this, then `STANDARD.md`, then work. Current as of 2026-07-28, deployed and
hash-verified live.

## Where it stands

Live: https://adamdegoat.github.io/singaporeproject/ — **two districts**, Orchard
Road and Bras Basah, merged into one region you can ride between. 1,918
buildings, 4,392 roads, 38fps at 844x390 dpr2, ~5s to load.

Everything green:

| gate | what it covers | state |
|---|---|---|
| `node data/audit_run.mjs` | 36 snapshot checks, per scene | pass, both scenes |
| `node data/behaviour.mjs` | 5 checks on how things MOVE | pass, both scenes |
| `SG_SCENE=world node data/defects.mjs` | 29 exploratory classes | 5, all D26, diagnosed below |
| `node test/ride.test.mjs` | the ride model, no browser | 18 pass |
| `python3 data/check.py <id>` | the data gate, per district | pass, both |

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

3. **Two researched facts not yet built.** Both verified from sources, see the
   comment block above `LANDMARKS` in `data/process.py`:
   - Ngee Ann City's podium is modelled on the Great Wall and clad in 3.8m by
     3.2m African Red polished granite panels. We draw a plain podium.
   - Hilton Singapore Orchard is **two** towers, 36 storeys at 144m and 40 at
     152m. We draw one mass.

4. **The open ratchets.** `P1b` 97 and `T1` 7, both target 0. Mostly traffic
   signal poles, arms and heads over carriageways. `pruneCarriageway` cannot
   reach them because street furniture is built after it runs — see the comment
   on that function. Closing this means deciding, deliberately, what each kind of
   furniture may hang over a road. Do not do it by loosening an allowlist.

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
