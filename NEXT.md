# Start here

Read this, then `STANDARD.md`, then work. Current as of 2026-07-28, deployed and
hash-verified live.

## Where it stands

Live: https://adamdegoat.github.io/singaporeproject/ — **two districts**, Orchard
Road and Bras Basah, merged into one region you can ride between. 1,918
buildings, 4,392 roads, 43fps at 844x390 dpr2, ~4s to load.

Everything green:

| gate | what it covers | state |
|---|---|---|
| `node data/audit_run.mjs` | 32 snapshot checks, per scene | pass, both scenes |
| `node data/behaviour.mjs` | 5 checks on how things MOVE | pass, both scenes |
| `SG_SCENE=world node data/defects.mjs` | 21 exploratory classes | 0 findings |
| `node test/ride.test.mjs` | the ride model, no browser | 18 pass |
| `python3 data/check.py <id>` | the data gate, per district | pass, both |

Start the dev server first (`node server.cjs`), and run `bash data/tidy.sh` after
any batch — every gate drives a headless browser rendering at 60fps and one that
outlives its script holds two CPU cores indefinitely.

Done and from real data: layout, road widths from lane tags, one-way traffic,
terrain under every road, 671 crossings, bus stops, signals, MRT exits with their
real exit letters, 3,624 glazed shopfront bays carrying 252 named tenants at the
floor OSM puts them on, the Angsana avenue, 460 pedestrians, collision built from
the drawn geometry, and about two dozen buildings with a researched design.

**What is NOT done**, in the order worth doing:

1. **Density.** 460 pedestrians and 21 vehicles over 2.6km. The systems are
   correct; there are simply not enough of them for a Saturday on Orchard.
2. **Heights.** 917 of 1,557 are still a type default. Most sit behind something
   and never matter; the ones visible from the road do.
3. **More districts.** The pipeline is proven and the seam holds. Little India is
   directly connected. But the app loads the whole region at once, so streaming
   has to come before the world gets much bigger.
4. **The 226 tenants off the built street network.** Little India, Selegie and
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

Now: **3,624 glazed bays over 20.4km of frontage, 252 of them a named tenant**,
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
