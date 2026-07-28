# World standard

What a district must satisfy before it is called done, and before any other
district is started.

This exists because the previous way of working was: build, look at one camera
angle, declare it finished, and wait for someone to ride around and find the
holes. That found real defects — things standing in the road, a black sky, empty
side streets — but it found them one at a time, in no order, and only the ones
someone happened to ride past.

The rule that replaces it: **you cannot find a defect class you have not named.**
So every class is named here first, the audit implements this list, and the list
is what a district is measured against. A check that is missing from `TAXONOMY`
below is a check that does not exist, and saying "it looked fine" is not
evidence about the 2,384 metres nobody looked at.

## Severity

| level | meaning | exit criterion |
|---|---|---|
| **BLOCKER** | You ride into it, fall through it, or it is plainly broken | must be **0** |
| **MAJOR** | Wrong, but does not stop you moving | must be under the stated budget |
| **MINOR** | Noticeable on inspection, tracked not gated | recorded, no gate |

A district ships when every BLOCKER is 0 and every MAJOR is inside budget, on
the whole district, measured by tooling — not by looking.

## Taxonomy

### P — Placement: is every object somewhere legal

| id | check | severity | budget |
|---|---|---|---|
| P1 | Upright **props** standing in a carriageway | BLOCKER | 0 |
| P1b | **Structure** standing in a carriageway: buildings, canopies, colonnades, landmark pieces | BLOCKER | **ratchet, now 286, target 0** |
| P2 | Props inside a building footprint | MAJOR | < 30 |
| P3 | Props floating above, or sunk below, the ground | BLOCKER | 0 |
| P4 | Identical props within 60cm of each other | MAJOR | < 100 |
| P5 | Building footprint crossing a non-service carriageway | MAJOR | < 5 |
| P6 | Coplanar surfaces that will z-fight | MAJOR | < 20 |
| P7 | Road markings at or below the carriageway surface | BLOCKER | 0 |

P7 exists because separating the markings by height to satisfy P6 pushed two of
them **under** the road: the tarmac is drawn at 0.055 and the zebra crossings
ended up at 0.046. Every other check stayed green and the street just looked
wrong. Fixing one check's complaint can create a defect no check is watching for.

P1 and P1b are separate because they were not. The audit checked only instanced
props and reported a clean district while a row of six-metre entrance-canopy
columns stood across the carriageway at the spawn point: buildings and landmark
structure, the largest body of geometry in the world, were never tested at all.
A check that covers "props" is not a check that covers the world.

Some things belong in the road and are not defects: the central median, lamp
arms reaching over the carriageway, vehicles, pedestrians on a crossing, and
tree canopies overhanging a kerb. Each exemption is listed in the audit with
the reason. An exemption without a reason is a bug being hidden.

### C — Coverage: is anything missing

| id | check | severity | budget |
|---|---|---|---|
| C1 | Named streets inside the dressed radius with no kerbs | BLOCKER | 0 |
| C2 | Dressed streets with no name plate anywhere on them | MAJOR | < 10% |
| C3 | Dressed streets with no lighting | MAJOR | < 15% |
| C4 | Share of pedestrians away from the main axis | MAJOR | > 35% |
| C5 | Dressed streets with no greenery | MINOR | — |
| C6 | Real POI layers present (crossings, signals, bus stops, MRT, taxi) | BLOCKER | all present |
| C7 | Main street length built vs the real street | BLOCKER | > 85% |
| C8 | Share of each real map layer actually built | MAJOR | **ratchet, now 6%, target 70%** |

C8 exists because A2 was far too weak. A2 asks whether a fetched layer is used
at all, and answered yes while **6 of 48 bus stops had a shelter and 14 of 61
traffic signals had a head**. Fetching real positions and then building a
fraction of them is the same defect as inventing them, and "every fetched layer
is placed" hid it completely.

Street length is measured **per street name, not per way**. OSM splits a road at
every junction: Orchard Boulevard is 21 fragments, none of them 45m, and a
per-way test discarded the entire 1,376m street.

### S — Semantics: does it say what is true

| id | check | severity | budget |
|---|---|---|---|
| S1 | Direction signs naming streets that are not at that junction | BLOCKER | 0 |
| S2 | Street name plates naming a street other than the one they stand on | BLOCKER | 0 |
| S3 | Building name signs attached to a different building | MAJOR | < 5 |
| S4 | Shop signs further than 46m from their mapped position | MAJOR | < 5 |
| S5 | MRT entrances without their real exit letter | MINOR | — |
| S6 | Shopfront bays built inside a building | BLOCKER | 0 |
| S7 | Shopfront bays reaching into a carriageway | BLOCKER | 0 |
| S8 | Share of street-level tenants given a shopfront | MAJOR | floor 76% |
| S9 | Shopfront bays of an impossible height | MAJOR | 0 |

This is the category geometry checks are blind to. An overhead gantry can be
perfectly placed, perfectly lit and perfectly modelled while pointing to a
street picked at random, and no amount of collision checking will notice.

S6 to S9 read `window.__shopBays`, which is where the builder actually put each
bay, and never `data.shops`. A tenant board used to be drawn at the tenant's own
OSM coordinate, and a mall tenant's coordinate is in the middle of the mall:
1,505 of 1,642 signs stood inside the masonry, median 9.2m past the facade,
while every count reported them placed. A check reading the same list would have
agreed with the bug.

S7 tests each bay at the reach that bay RECORDS — 48cm to the face of the fascia,
1.8m for a tenanted bay with an awning — not at one number for all of them.
Judging all 3,624 at the awning's reach reported 445 failures against geometry
that was never built.

S8's floor was RE-BASELINED 85 to 76 the day bays started being sited before
they were handed to tenants. More tenants are placed than before, not fewer —
257 against 252. What changed is the denominator: a tenant whose bay then failed
a placement test used to disappear from the numerator, the denominator and every
skip bucket, so 35 of them were being ignored and the ratio flattered itself.
A ratchet on a measurement that has become honest is reset to the honest number.

S8's denominator is deliberately not every named shop. 629 tenants are upstairs
or in a basement, 399 are in an atrium and 226 front streets this world does not
build; counting those as missing coverage would make a correct world read as 15%
done for ever. Each exclusion is counted separately in `window.__stats`, so every
one of them is a rule that can be argued with.

### T — Traversal: can you actually ride it

| id | check | severity | budget |
|---|---|---|---|
| T1 | Carriageway metres blocked by solid geometry | BLOCKER | **ratchet, now 11, target 0** |
| T2 | Road network islands unreachable from the main axis | MAJOR | < 5% of length |
| T3 | Places the player can leave the world or fall through it | BLOCKER | 0 |
| T5 | The ride sitting below the surface it is riding on | BLOCKER | 0 |
| T4 | Camera positions inside solid geometry along the route | MAJOR | < 2% |

T5 exists because the bike was placed at the raw terrain height for the whole
project while the tarmac is drawn 5.5cm above it. Its wheels were under the road
down the entire street, every other check was green, and it took someone riding
it to notice. **The height something is drawn at and the height something stands
on are two different numbers, and nothing was comparing them.**

### V — Presentation: does it read correctly

| id | check | severity | budget |
|---|---|---|---|
| V1 | Sample points where the sky renders as the black clear colour | BLOCKER | 0 |
| V2 | Geometry crossing the far plane without fog cover | MAJOR | < 5% |
| V3 | Terrain holes or steps sharper than 1:1 | MAJOR | < 10 |
| V4 | Scale sanity: lane width, storey height, door height, kerb height | BLOCKER | all in range |

### F — Performance: does it run on a phone

| id | check | severity | budget |
|---|---|---|---|
| F1 | Worst fps across sampled points, 844x390 at dpr 2 | BLOCKER | > 30 |
| F2 | Median fps across sampled points | MAJOR | > 45 |
| F3 | Draw calls, worst sampled point | MAJOR | < 900 |
| F4 | Scene payload | MAJOR | < 1400 KB |

Measured at points spread across the whole district, not at the spawn. A single
reading at one camera position is how "48fps" got reported for a world that had
never been measured anywhere else.

**Frame rate cannot be measured in a spawned browser.** A window launched by a
script sits behind the terminal and is throttled whatever anti-throttling flags
are passed: the same spot reads 51fps in a focused browser and 23 in the
spawned one, at an identical 1688x780 and an identical 550 draw calls. So
`sweep.mjs` gates on F3 and F4, which are properties of the world and identical
either way, prints the heaviest views it found, and F1/F2 are confirmed at those
views in a focused browser.

### A — Accuracy: is it the real place

| id | check | severity | budget |
|---|---|---|---|
| A1 | Feature classes sourced from real data | MAJOR | > 60% |
| A2 | Invented positions where real data existed and was not used | BLOCKER | 0 |
| A3 | Landmark stretch matches reference imagery on massing and material | MAJOR | reviewed |

A2 is the one that has been wrong twice: pedestrian crossings were tagged in OSM
the whole time while being placed at invented intervals, and `sidewalk=left/
right/no` sat unused in the scene file while kerbs went down both sides of every
street. Before accepting anything as "not available", grep the raw OSM for the
tag and record the count.

## How a district is signed off

1. `python3 data/check.py <id>` — the data gate, must PASS
2. `node test/ride.test.mjs` — the ride model, must pass
3. `python3 data/audit_roads.py <id>` — analytic road overlap
4. **World audit** over the whole district: every BLOCKER 0, every MAJOR in budget
5. **Contact sheet**: a bot drives every street, one frame per ~60m, reviewed as
   a grid. Coverage, not sampling.
6. `python3 data/accuracy.py <id>` — the real-vs-invented ledger
7. **Reference comparison** on the landmark stretch

Only then is the district done, and only then does the next one start.

## Ratchets

A check added to a world that already exists will fail on day one, and a gate
that always fails is a gate everyone learns to ignore. So a new check may enter
as a **ratchet**: its budget is set to the count on the day it was written, and
that number may go down and never up. Lowering it is progress; raising it blocks
the deploy. A ratchet is not a pass — the district does not meet the standard
until the target is reached, and the open number is stated plainly rather than
hidden behind a green tick.

Open ratchets:

| id | baseline | target | what it is |
|---|---|---|---|
| T1 | 11 | 0 | Obstructions a rider would hit, seen from the traversal side. Was scoped to instanced props only and reported zero while building corners and landmark columns stood across carriageways — the same backlog P1b counts. Falls as P1b falls. |
| C8 | 6% | 70% | Only 6 of 48 mapped bus stops carry a shelter and 14 of 61 signals a head. Cause: `buildFurniture` matches them against the main axis alone and discards anything more than 60m from it, so every stop and signal on a side street is thrown away. Placing them network-wide lifted coverage to 90% but pushed 58 more shelters into carriageways, because the shelter is 8.8m by 2.8m and a side-street pavement will not take it. Both numbers have to rise together. |
| P1b | 286 | 0 | Landmark and facade structure standing in carriageways. The spawn-point pillars were seven of these; the rest are tower masses and facade elements placed by recipe from a footprint's oriented bounding box, which for an irregular plan lies outside the building. |

## Regression

`deploy.sh` runs the audit and refuses to publish if any BLOCKER is above zero
or any MAJOR is over budget. The numbers may go down and never up. Without this
the same defect comes back the next time somebody optimises something, which is
exactly how the sky ended up black: a far-plane change made for performance
silently broke a dome nobody was checking.

## What is not yet checked

Named here so the gaps are visible rather than implied. A district can pass
every check above and still be wrong in these ways.

| area | why it is not covered |
|---|---|
| Does it look like the real place | Only reference comparison answers this, and that is a human judgement on matched-angle photographs. A3 is reviewed, not measured. |
| Interiors | Nothing is modelled inside any building. Every entrance is a facade. |
| Night, weather, time of day | Deliberately out of scope: one sun lights the district for free and night has to be authored per district. |
| Sound coverage | The engine, wind and traffic beds are synthesised, but nothing checks that a given street sounds like anywhere in particular. |
| Building appearance | Facade family is chosen by footprint hash for all but 8 landmarks. The ledger records this as INVENTED; no check can call it wrong. |
| Pavement width | No OSM tag records it. Sides are real where tagged, widths are a fixed offset. |
| Crowd and traffic behaviour | Plausible simulation, not a mapping question. |
