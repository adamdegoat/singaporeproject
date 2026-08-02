# Building Singapore, one district at a time

The goal: a real, navigable 3D Singapore you can ride and walk through, accurate
to the actual map, with detail that reads as the real place. Grown outward from
Orchard rather than blocked out all at once.

This file is the repeatable process. Orchard was built by hand and cost a lot of
rediscovery; nothing after it should.

---

## The operating loop (written 2026-07-29, after auditing a day of it)

The rhythm that turned out to work, one batch at a time:

1. **Start from NEXT.md's top block.** Do not re-derive state.
2. **Research runs one batch AHEAD of building.** Fire research agents for
   the NEXT batch of landmarks while building the current one; the moment a
   report lands, persist a compact build spec to `research/<name>.md` —
   reports that live only in a conversation die with it. Prompts must
   demand published figures, UNPUBLISHED labels, and explicit correction of
   false premises; 9 of 9 reports so far corrected something, four of five
   mapped heights were wrong.
3. **Build with inline vets, not gates.** While coding: `landmark.mjs` solo
   comparisons for recipes, targeted probe scripts for placement, one
   screenshot per iteration. The gates stay untouched during building.
4. **One deploy per batch, and deploy IS the gate.** `deploy.sh` runs the
   whole suite internally and refuses to publish on a regression — running
   `gates.sh` first and then deploying pays the same 10 minutes twice.
   Reserve a bare `gates.sh` for diagnosing a failure someone already found.
5. **Sweep-review after CONTENT batches only.** Regenerate
   `data/sweep.mjs --shots` and fan review agents over the 220 frames after
   changes a rider can see; skip it for infra/boot/tooling work. Findings
   are CLAIMS: verify with a probe before fixing, and triage into NEXT.md
   so they survive the session.
6. **Agents for research and mass review; everything else inline.** A grep,
   a probe, a vet render is faster and cheaper done directly.
7. **Batch the bookkeeping.** NEXT.md and the memory update once per batch,
   at the end, not per edit.
8. **Tidy between batches, never during one.** `bash data/tidy.sh` after any
   probe/vet session — it kills EVERY headless browser, including a deploy's
   own gate-runners, so it only runs when nothing is in flight. gates.sh
   already tidies at its own end, so deploys self-clean; the strays to
   worry about are crashed probe scripts. A cooked MacBook builds no city.

What this optimises: wall-clock (the laptop's browser runs are the scarce
resource, not tokens), attribution (a red check points at one small batch),
and durability (specs and triage live in files, not in a chat).

## Streaming design (drafted 2026-07-29 while districts 4+5 fetched — the
## "world comes up faster" architecture; implement when world5's measurement
## demands it, which it almost certainly will)

The app builds the whole region in one ~13s CPU pass and boots O(districts).
The island is 83x the current load. The design that fixes both:

1. **Boot ONE district — the spawn's — and nothing else.** Per-district scene
   JSONs already exist and already gate individually. Boot cost becomes O(1):
   roughly 5s CPU + warm-up, whatever the world grows to.
2. **Stream neighbours at runtime, in idle slices.** When the rider is within
   ~400m of a district boundary, fetch that district's JSON and run its build
   CHUNKED over idle frames (~8ms budget per frame; a 4-5s district build
   spreads over 10-20s of riding, invisible at 41.8 km/h ceiling). The
   existing builders stay untouched; a scheduler wraps them per subsystem —
   the per-axis loop is already conveniently step-shaped.
3. **THE BLOCKER TO SOLVE FIRST, and it is RNG, not rendering:** placement
   draws from the module-level seeded `R`, so build ORDER changes every
   invented placement — lazy loading would reshuffle the world per ride.
   Fix: seed a PRIVATE stream per district at district-build start (the
   texture-stream rule, applied to placement). Costs one final sanctioned
   reshuffle + re-baseline, and makes district builds order-independent
   forever — which batch-baking also needs, so it is not throwaway.
4. **Merge rules become runtime rules:** cross-district dedupe and heightfield
   blending currently live in merge.py; the runtime loader needs the same two
   (drop a neighbour's copy of shared buildings; blend terrain at the seam
   band). Both are already written as algorithms — port, don't reinvent.
5. **Unload behind the rider** past ~800m: dispose geometries, keep the
   scene JSON cached. Heap then plateaus at ~3 districts regardless of world
   size.
6. **Gates:** livecheck gains a ride-across-a-seam scenario; the audits stay
   per-district (they already are); add a determinism check — build district
   A alone vs A-after-B, diff placements, must be byte-identical (this is
   what the per-district RNG buys and the check that keeps it bought).

## Quality tiers for weaker phones (committed 2026-07-29 — the user wants
## the project excellent on lousy hardware, and that is a quality bar like
## accuracy is)

The order of work: streaming (heat stays flat as the world grows) -> LOD
(heat drops below today) -> adaptive tiers (every phone lands on its best
settings without menus). Milestones, each gated like content:

1. **Adaptive tier detection.** Sample real fps over the first ~5 seconds
   of riding. Sustained < 24 -> drop to dpr 1.25 and cap 24fps; sustained
   at cap with headroom -> allow dpr 1.75. No settings screen — the phone
   declares itself. Persist the verdict in localStorage so the second boot
   starts right. (?dpr / ?fps stay as overrides.)
2. **Streaming** per the design above — RNG-per-district first, then the
   idle-slice loader. Gate: the determinism check plus a ride across every
   seam under livecheck.
3. **LOD**, in the same "what deserves residence" machinery:
   - buildings: past ~350m swap facade-textured extrudes for flat-colour
     massing (the surround already proves the look reads fine far away);
     recipes keep full form to ~500m because silhouettes are identity.
   - trees: past ~250m the Angsana collapses to 6 cards instead of 30.
   - crowd/traffic already cull at 105m/draw range — no change.
   - shadows: only the near ~150m casts at all on phones.
   Gate: the sweep at the usual vantage points must show no visible pop
   at riding speed, and the fps floor on the Iris-645 reference must rise.
4. **The thermal ledger stays honest:** every tier change lands with a
   measured before/after (draws, tris, and where possible on-device
   sustained fps), recorded here, not vibes.

## Adding a district

**1. Register it.** Add an entry to `data/districts.json`:

```json
{
  "id": "bugis",
  "name": "Bugis / Rochor",
  "bbox": "1.2960,103.8520,1.3030,103.8620",
  "origin": [1.29950, 103.85700],
  "axis": "victoria street",
  "status": "planned",
  "notes": "Shophouse-heavy"
}
```

- `bbox` is OSM order: **south,west,north,east**. Keep the long side under about
  1.2km or Overpass times out.
- `origin` is the local coordinate origin, ideally on the main street mid-way
  along it. Everything in that district is metres from this point.
- `axis` is the street the district is organised around, lowercase substring
  match. The whole dressing pass walks this axis, so pick the one you would ride.

**2. Build it.**

```
cd data && python3 build_district.py bugis
```

Fetches OSM in five small pieces with retries across four mirrors (a single
combined query times out — this is not optional), caches the raw response, then
runs the same `process.py` that built Orchard. Add `--force` to refetch.

**3. Gate it.**

```
python3 check.py bugis
```

Exits non-zero if it is not fit to ship. Every check exists because the matching
mistake actually shipped once:

| Check | The mistake it catches |
|---|---|
| No building under 3m | Four Seasons was tagged height 0 and lay flat on the ground |
| No 600 m²+ footprint under 8m | Liat Tower and Far East Shopping Centre were 3.5m |
| No sub-230 m² footprint over 16m | Untagged small footprints became a forest of needles through every back lane |
| Axis exists and is 250m+ | OSM splits streets into fragments; a failed stitch leaves nothing to dress and nowhere to spawn |
| Nothing in a real carriageway | 36 pieces of geometry sat in the road, including Ngee Ann City's plaza 8.5m into Orchard Road |
| Payload under 900 KB | It ships to a phone on mobile data |

**4. Correct what the gate cannot see.** Heights are the weak point: OSM tags are
missing or wrong for most buildings. Add real ones to `LANDMARKS` in
`process.py` for anything that carries recognition, then rebuild.

**5. Give the landmarks their real form.** Generic extrusions get the footprint
right and the silhouette wrong. Add a recipe in `src/landmarks.js` keyed by name.
**Research the building first** — published descriptions catch material, massing
and named features. That method corrected Ngee Ann City to African Red granite,
found its missing civic forecourt, and gave Wheelock Place its glass cone. It
cannot catch proportion or facade subdivision; that needs a photo or the user's
eye.

---

## The rules that keep it fast

Measured on a 2019 MacBook Pro with Iris Plus 645, which is the floor case. If it
runs there it runs anywhere.

- **The scene is fill-rate bound, not geometry bound.** Cutting pixels helps;
  cutting triangles barely does.
- **The shadow pass is where the frames go.** Kerbs, railings, road markings,
  planters and banners must have `castShadow = false`. That alone was 143k
  triangles a frame and 4fps.
- **Anything repeated is one `InstancedMesh`.** Per-object groups blew past 800
  draw calls immediately.
- **Parking an instance off-screen does not cull it.** The GPU draws every
  instance up to `.count`. Pack the visible ones into the front of the buffer and
  set `.count`. This halved triangles and gained 12fps. Per-instance colours must
  then be written per *slot*, not per entity index.
- **Merge geometry per material AND per ~110m spatial tile.** Merging globally
  defeats frustum culling: one mesh spanning the map is never culled, and
  framerate fell from 51 to 33.
- **Run `consolidate.js` over the finished world.** A dozen builders each adding
  meshes as they go is the right way to write them and the wrong way to render
  them. One pass afterwards dedupes identical materials and batches small static
  meshes per tile: 1,236 materials became 155, 7,045 meshes became 845, and draw
  calls fell from 1,372 to 513. Anything repainted at runtime must be flagged
  `userData.dyn` — the traffic light lenses look identical at boot and would
  otherwise collapse into three shared materials, making every junction on the
  street change colour together.
- **Text goes in an atlas, never one canvas per label.** 992 shop signs and 266
  building names meant 1,018 materials wrapping 58 textures, and nothing could
  batch. `SignAtlas` packs them into 2048px pages of 256x64 cells; the whole
  district's signage is then 2 pages and a handful of draws.
- **Dress what can be seen from the route, not what is in the bbox.** Orchard's
  full box holds 46.8km of side street. Kerbing and planting all of it produced
  23,000 kerbs and 2,100 trees, most of them hundreds of metres from anywhere
  you can ride. Dressing is limited to 230m from the axis.
- **Shadow casting is a height test, not a taste call.** `trimShadowCasters`
  drops anything under 3m from the shadow map: kerbs, markings, plates, bins.
  343 of 880 casters went, and it was worth 6fps on its own.
- **`envMap` per material, never `scene.environment`.** Scene-wide makes tarmac
  and concrete sample the cube map for nothing.
- **Stay in daylight.** One sun lights the whole island for free. Night has to be
  authored per district, and realtime lights are the most expensive thing
  available here — 70 point lights once blew the shader's uniform budget and
  surfaces silently rendered black.

## Verifying

- Ride model: `node test/ride.test.mjs` — 18 assertions, no browser needed.
- Never trust a screenshot for behaviour. **Count the thing.** Zero pedestrians
  ever used a crossing while the code looked correct, because the handover ran
  one line before the crowd existed and the `if` guard swallowed it.
- Phone is the reference platform: 844x390 landscape, `?dpr=2` to force real
  phone pixel count, `?touch=1` to force touch.
- Useful flags: `?spec=x,y,z,tx,ty,tz` free camera, `?nofoliage`, `?nopeople`,
  `?notraffic`, `?noshadow`, `?nobuild` for bisecting a performance problem.
- **Profile before optimising, by tallying the frame.** Walk the scene against
  the camera frustum and group visible meshes by geometry, material and
  triangle count. Every fix in the 24 -> 49fps batch came from that tally
  naming the culprit; none came from guessing.
- **Check placement analytically, not by eye.** After painting 172 side-street
  crossings, every one of the 1,525 bars was tested against the nearest road
  centreline: 1,525 on carriageway, 0 overhanging. A screenshot cannot tell you
  that, and cannot tell you about the ones off screen.

## Harness gotchas

- **Chrome throttles occluded windows to ~0fps**, which looks exactly like a
  catastrophic performance bug. Launch with
  `--disable-backgrounding-occluded-windows --disable-renderer-backgrounding
  --disable-features=CalculateNativeWinOcclusion`. Before blaming the scene, load
  a page that *was* fast.
- **A 60fps WebGL loop pegs two CPU cores.** Park the tab on `about:blank`
  between test rounds and kill the dev server. The page stops rendering when
  `document.hidden`.
- **Web Audio needs a buffer actually played inside a gesture on iOS**, not just
  `resume()`. Synthetic DOM events do not grant user activation; drive a real CDP
  mouse click to test it.
- Don't raycast to audit: it pegged a core for minutes and only sampled points.
  `audit_roads.py` tests whole edges against whole corridors, analytically.

## Deploying

```
./deploy.sh "what changed"
```

It runs the gates, builds, mirrors the sources into `source/`, pushes, and then
verifies by hash rather than by eye — comparing the local bundle against
`https://adamdegoat.github.io/singaporeproject/app.js` with a cache-buster until
they match. It exits non-zero if they never do.

## The whole-map audit

`data/audit_world.js`, loaded into the page with `?raw=1` (which skips batching
so objects are still individually inspectable). It walks the ENTIRE district and
reports: props standing in carriageways, props inside buildings, props off the
ground, named streets with nothing on them, where the pedestrians actually are,
building footprints crossing a road, and duplicated props.

Run it before saying anything is finished. Checking one camera angle and a few
frame counters missed all of this at once:

- **5,804 props buried, some 34.6m underground.** The street furniture was
  authored before the heightfield existed and kept absolute Y. Anything placed
  in the world goes through `groundAt(x, z)`, with no exceptions.
- **4,582 props standing in carriageways.** The placement test only knew about
  building footprints, so a tree in the middle of a back road passed: it was not
  inside a building, so it was fair game. `src/roads.js` supplies the other half.
  The bike and the walker keep the raw building test — they belong on the road.
- **Every pedestrian on the main street.** `Crowd` was built around one path, so
  the side streets could not have people no matter what. It takes a list now.
- **A 1,376m street with nothing on it.** OSM splits a road at every junction:
  Orchard Boulevard is 21 fragments, none of them 45m, so a per-way length test
  discarded the whole street. Measure length per NAME, not per way. This is the
  same lesson as stitching the axis, in a place nobody thought to look.
- **The sky went black off-axis.** A fixed 900m dome at the world origin fell
  outside a 520m far plane. There is no clear colour set, so the result is
  black. The dome follows the camera's position now — never its rotation.

When the audit reports something, check whether it is really a defect before
"fixing" it. The central median, lamp arms reaching over the road, vehicles,
tree canopies overhanging a kerb and pedestrians on a crossing all belong where
they are. The allowlists at the top of each check say which, and why.

## Before calling a district done

Run `python3 data/accuracy.py <id>`. It reads the counts out of the scene rather
than from a hand-written list, because a ledger typed in by hand goes stale the
moment the district grows, and a stale ledger reports a district as finished
when it is not. Orchard is 18/28 feature classes from real data.

Then re-read the INVENTED half and ask, for each line, whether the data really
is missing. Twice now it was not: pedestrian crossings were tagged in OSM all
along while being placed at invented intervals, and `sidewalk=left/right/no` sat
unused in the scene file while kerbs went down both sides of every street.

Equal means the served bundle is the one you built. Pages usually lands in under
a minute.

## The deploy takes five minutes, not fifty (2026-07-30)

Every headless tool here launches Playwright's Chromium, and whether that gets
the GPU depends on ONE FLAG. Measured on this machine by reading
`UNMASKED_RENDERER_WEBGL` under five flag sets:

    --use-gl=angle      ANGLE Metal Renderer: Intel Iris Plus 645   (real GPU)
    --use-angle=metal   ANGLE Metal Renderer: Intel Iris Plus 645   (real GPU)
    --enable-gpu        ANGLE Metal Renderer: Intel Iris Plus 645   (real GPU)
    --use-gl=egl        SwiftShader                                 (software)
    (no flags)          SwiftShader                                 (software)

`behaviour.mjs` and `defects.mjs` passed the flag. `audit_run.mjs` and
`livecheck.mjs` did NOT — and those are the eight scene audits plus the live
check that every deploy runs, i.e. nearly all of it. They were software-
rasterising a world this machine draws in hardware.

Result of adding the flag: a full `./deploy.sh` went from about fifty minutes
to **five**, the world audit from a 25-minute budget (which had twice refused
a green deploy by timing out) to **60 seconds**, and the live check's reported
boot from 391,945ms to 27,644ms.

Nothing was traded for it. The audits gate on SCENE FACTS — draw calls,
triangle counts, positions — never on frame rate, so the renderer cannot move
a single number; verified by diffing a full world audit before and after.

TWO THINGS THAT FOLLOW:
- "Headless falls back to software GL" is written in several comments in this
  repo. It is only true WITHOUT the flag. Do not repeat it as a general fact.
- SwiftShader is no longer inflating timings in the gated tools, so a slow
  audit now means something is actually slow. The old advice to never diagnose
  performance from headless numbers still holds for FRAME RATE, which is still
  measured in a focused real browser (`fps.mjs`, headless: false).

Any new tool that opens a browser: pass `--use-gl=angle`.

## A process.py override only reaches the world if EVERY scene holding that
## building is rebuilt

Found 2026-07-31, the hard way. The district bboxes OVERLAP, so one real
building lives in two or three scene files at once. LASALLE is in
`orchard.json`, `bugis.json` AND `littleindia.json`. merge.py dedupes across the
seam and keeps ONE copy — and it is not necessarily the one you just rebuilt.

So: set a height in `data/process.py`, rebuild only the district you were
thinking about, merge, deploy — and the world still ships the OLD number, with a
deploy that passes every gate and verifies clean by SHA. The tell is
`data/world.json`'s hash not changing when it obviously should have. LASALLE
shipped at 17m from `orchard.json` while `littleindia.json` said 26m.

The HDB blocks in the same batch got through only because littleindia's copy
happened to win their seam. Luck, not design.

    # after ANY process.py change, find every scene that holds the building:
    python3 - <<'PY'
    import json
    ids=[d['id'] for d in json.load(open('data/districts.json'))['districts']
         if (d.get('status') or '') not in ('planned',)
         and 'merged' not in (d.get('status') or '')]
    for i in ids:
        d=json.load(open(f'data/{i}.json'))
        hits=[b.get('h') for b in d['buildings'] if 'NAME' in (b.get('n') or '').lower()]
        if hits: print(i, hits)
    PY
    # then rebuild each one (cached raw, no Overpass refetch) before merge.py
    python3 data/build_district.py <id>

Same bug family as everything else in this file: two things describe one fact,
and the one you did not update is the one that ships.

## One frame is not evidence

Three "defects" chased and disproved in a single session on 2026-07-31, all of
them read off one screenshot:

  - **"Orchard Road has no traffic."** It was the spawn clearance zone.
    `Traffic.build(world, avoidS)` places its fleet from `avoidS + 55` over
    `path.len - 110`, deliberately leaving ~110m clear around the player's spawn
    so nothing materialises on top of the rider. The frame was taken AT the
    spawn point. Raising density did not move the number and never would have.
  - **"Vehicles are simulated but never drawn."** A probe found cars 19m away
    that were absent from the frame. They were drawn; the two runs sampled
    different moments, and the cars had moved. A second run with the count read
    in the SAME page as the screenshot showed 31 within 260m and cars plainly
    in shot.
  - **"A sign is floating in the sky over Little India."** A lamp-post banner
    whose thin dark pole disappeared against a dark tree canopy. Re-shooting the
    same spot showed the bracket.

The cost of each was several probes. The cheap check that would have settled all
three in one step, and now goes first:

    RE-SHOOT THE SAME SPOT, then probe in the SAME page as the screenshot.

Frames sample one instant of a world where traffic moves, crowds move and
streaming is still settling. A thing seen once is a hypothesis. This does not
argue for ignoring what you see -- the gantry "blank sign" and the floating
parapet were both spotted this way and both real -- only for confirming it
before building a theory on top of it.

## A long merged cylinder silently does not render

Measured 2026-07-31 on Bugis Junction's glazed street vaults, by bisection:
**34m draws, 45m draws, 60m draws, 92m does not, 141m does not.** No exception,
no warning; the geometry is created, `api.merge` is called, and nothing appears.

This is almost certainly the same failure that ate Mustafa Centre's wave-wing
bulges, where a loop of extra geometry in one tile-and-material bucket made the
BUILDING MASS stop rendering. Both were ruled out as: an exception (no
pageerror), CylinderGeometry specifically (an extrudeGeo rebuild failed the same
way), an attribute-length overflow in `Merger.flush`, and non-finite coordinates
(the merger now drops those per-geometry and it changed nothing).

Not understood. What is known:
  - It is silent, so it will be mistaken for "my recipe didn't run".
  - The cheap first test is to SHORTEN the piece or split it into segments.
  - The bucket key is NOT it. `Merger.add` files buckets under
    `(tile of x,z | material)` with TILE = 110m, so the obvious suspect was a
    mesh whose extent dwarfs the tile it is filed under. TESTED 2026-07-31 by
    re-running the 141m vault with the bucket keyed on the CYLINDER'S OWN centre
    instead of the building's: no change, still invisible. Ruled out.

If you are chasing a recipe whose geometry will not appear, check this first.

## The fetch decides what can ever exist

`build_district.py`'s buildings query asked for `way["building"]` and
`rel["building"]`. It did NOT ask for `building:part`, and a way tagged ONLY
`building:part` therefore never entered this world at all — no error, no gap in
any count, just a building that is not there.

That is why One Raffles Place Tower 1 looked like it had no footprint. It has
two, both mapped, both carrying their own heights (283m and 215m), and the
research that first looked at it concluded "OSM has no way for Tower 1" because
the fetch had never delivered one. A second pass caught it.

The comment already sitting above that query says relations were added because a
way-only query "loses them all and looks like a clean fetch". Exactly the same
sentence applies one step further out, and it took two months to notice.

WHEN A BUILDING IS MISSING, CHECK THE QUERY BEFORE CHECKING THE DATA. The chain
is: Overpass query -> raw/<district>.json -> process.py -> scene. A thing absent
from step 1 is invisible at every later step, and every later step will look
healthy.

Also unlocked by asking for parts: Lucky Plaza Residence, Ngee Ann City Tower
A/B's stepped massing (which the recipe currently invents), the Grand Hyatt
tower, and Masjid Al-Falah inside the Cairnhill site.

REFETCHING IS NOT FREE, AND IT WAS TRIED AND REVERTED. 2026-07-31: Orchard was
refetched with the parts query added, backed up first. Result:

    BEFORE  6,661 elements  1,602 buildings  3,865 highways  4 parts
    AFTER   6,059 elements  1,430 buildings  3,292 highways  200 parts

It gained the 196 parts it was sent for and LOST 172 buildings and 573 roads.
That is not OSM changing — that is flaky mirrors returning partial layers, and
the fetch log is full of `attempt N failed ... HTTPError` with per-layer
fallbacks. The scene came out 848 KB against 984 KB. Backup restored, Orchard
rebuilt, verified back at 1,626 buildings and 985 KB.

THE QUERY CHANGE IS KEPT because it is correct; the refetch is not. Whoever
does it next:
  - back up `data/raw/*.json` (that is what made this reversible),
  - refetch ONE district,
  - COMPARE ELEMENT COUNTS PER LAYER before rebuilding anything,
  - treat any layer that lost elements as a failed fetch and retry it, not as
    news about the world.
Overpass mirrors are flaky — run it with nohup, never through a pipe that can
SIGPIPE it, and never inside a tool timeout shorter than the fetch.

## The gates read one file and the rider loads another (2026-07-31)

`data/merge.py` writes TWO things from the same districts:

  - `data/world.json`, one flat file, and
  - `data/world.d.<id>.json` + `world.manifest.json`, the streaming chunks.

Every gate in this project reads the flat file. `check.py`, `audit_run.mjs`,
`accuracy.py`, `progress.py`, `defects.mjs` — all of them open `world.json`.
**No rider ever fetches it.** The world scene streams the chunks; the flat file
is only the `?nostream` fallback.

Writing the chunks used to be opt-in, behind `--stream`. A merge without the
flag refreshed the file the gates inspect and left the chunks where they were.

So on 2026-07-31 the pipeline reported PASS, twice, on data the live site was
not serving. The HDB storey join, three thousand conservation-area era bands,
Shaw Tower's 200m and the sky-bridge fix all went green through `./deploy.sh`
and none of them reached the world; the chunks on the CDN were four hours old.
Nothing in the deploy noticed, because `cp data/world.d.*.json` copies a stale
file exactly as happily as a fresh one, and the SHA verify afterwards confirmed
the stale file had arrived intact.

Two changes, and the second matters more than the first:

  1. merge.py writes the chunks every time. `--no-stream` is the opt-out and
     has to be asked for. **An opt-in flag on the correctness-critical half of
     the output is not a flag, it is a way to be wrong quietly.**
  2. deploy.sh refuses if any `world.d.<id>.json` is older than the
     `<id>.json` it was built from, and refuses if the manifest is missing.

THE GENERAL SHAPE, which is the third time this project has hit it: when one
artefact is DERIVED from another, the gate must read the derived one. Gating
the source and shipping the derivative tests nothing. It is the same failure as
"a process.py override only reaches the world if every scene holding that
building is rebuilt", two sections above, and the same as the district list
that lived in three files until four districts shipped ungated.

When you add an output, ask which file the USER's browser opens, and gate that.

## How to measure performance here, and three ways I got it wrong (2026-07-31)

The world is CPU-bound, not fill-rate bound. Dropping the pixel ratio from 3 to
1 at the worst spot in the world — nine times fewer pixels — bought one frame
per second. Shadows off bought 5%. If a frame is slow here, the answer is
almost always in JavaScript, and the way to find it is a CPU profile, not a
guess about the renderer.

**1. Counting requestAnimationFrame ticks is not counting frames.** rAF keeps
firing at display rate through every frame the app deliberately skips, so an
rAF counter measures MAIN-THREAD LOAD and silently ignores any frame cap. It is
a useful load proxy and it is not a frame rate. Count
`renderer.info.render.frame` instead; it increments once per real render.

**2. Comparing two browser launches on a working machine measures the machine.**
The same uncapped configuration measured 34.3 and then 17.3 rendered fps twenty
minutes apart, because the second run shared the machine with an Overpass
refetch. Every cross-launch conclusion drawn that afternoon was worthless. The
only method that produced repeatable answers was: ONE page, ONE settled
location, toggle the variable underneath it, alternate passes, take medians.
`window.__fpsCap` and the sim-freeze probe exist for exactly that.

**3. A parked phone is capped at ~24fps by the idle cooler, by design.** Every
reading in one A/B came back as exactly 20.0 because of it, and four different
levers all looked identical. Dispatch a touch every couple of seconds while
measuring, which is what a rider's hand does anyway.

**And check what the profile actually says before optimising.** The largest
single application cost in this world was `walkBlocked` at 9.7% of all samples
— the crowd asking, for all 2,200 pedestrians every frame, whether someone
beyond the 105m draw cull was standing inside a building. Moving the cull three
lines earlier removed it from the profile entirely and took idle headroom from
37% to 50%. Nobody would have guessed that; the profile said it in one line.

## The first ten seconds: it was never the size of the work

Six separate rounds of breaking build loops into smaller slices did not fix
"the first ten seconds of riding is glitchy and stuck stuck stuck", and a CPU
profile of those seconds showed no idle time to reclaim. The reason none of it
worked is that the work was not too chunky. It was happening at the wrong time.

Measured, 2026-07-31, phone viewport:

- The loading screen came off at **13.6s with ZERO of the seven neighbouring
  districts built**. The streamer then spent **9.7 more seconds** building one
  of them — while the rider was already moving. That is the ten seconds.
- The first throttle press cost a further **303ms** in `audio.js`, because
  `Sound.start()` is wired to the first gesture and opens the audio hardware
  and generates a two-second noise bed. For someone who loads the game and
  rides off, the first gesture IS riding off.

Two fixes, both about timing rather than size:

1. Boot now runs the first streaming wave BEHIND the loading screen, with
   `ARRIVING` set so `Y()` builds at full speed instead of politely handing
   frames back to a ride nobody is watching. Boot 13.6s → 16.6s.
2. `Sound.prewarm()` builds the whole synth graph at boot on a suspended
   context. Only the unlock — `resume()` plus a buffer played from inside the
   gesture — still waits for the gesture, and that is cheap.

Result riding from the instant the screen clears: **60fps, zero hitches over
100ms, worst frame 50ms**. Before: 12–36fps for six seconds, worst 500ms.

### The same fix for teleports, and the trade inside it

`__teleportTo` (the in-game district list, which is the jump riders actually
use) set the position and returned, dropping the rider into an unbuilt
district. It now raises the same arrival panel — and **the ride is frozen while
the panel is up**. A cosmetic panel is worthless: the first version left the
ride running underneath, so the rider still crossed a half-built district and
still met every stutter, they simply could not see where.

How long to hold the panel was measured both ways, teleporting to Bugis:

| release when | panel | then |
|---|---|---|
| the district underfoot exists | 3.3s | 28–45fps for 10s, 5 hitches, worst 400ms |
| the streamer goes quiet | 10.3s | flat 60fps, no hitch at all |

A longer honest wait beats a shorter dishonest one. The panel waits on
`window.__streamIdle`, NOT on "every district containing me is built" — the
district boxes overlap by design and a phone caps residency at three, so where
four boxes meet that test can never be satisfied and the panel times out.

### Two traps this touched

- **`let` has a temporal dead zone.** `ARRIVING` was declared beside the overlay
  that sets it, far down the file. The world is built during module evaluation,
  so `Y()` read the flag before that line had run and boot died with a
  ReferenceError before `__ready` was ever set. Flags read by the build belong
  at the top of the module.
- **A gate's boot timeout is not a performance budget.** `?nostream` builds all
  eight districts inline: 115s and 140s on two consecutive clean runs. The 90s
  limit in `behaviour.mjs` and `vantage.mjs` was under that, so the gate started
  failing on the build rather than on anything it checks. Raised to 300s and
  named `BOOT_MS`, with the measurement written down beside it.

## The frame cap ate half of real time, and no frame-rate measurement could see it

2026-08-01. The rider spent an entire evening reporting "the first 15-20 seconds
lag", "slowmo", "moving off fucking slow", "laggy and glitchy I can tell". Six
theories were measured and disproved here — build stutter, streaming under the
rider, resolution, shader warm-up, traffic density, scene traversal. All wrong.

The bug was four lines apart in the frame loop:

```js
const dt = Math.min(DT_CLAMP, rawDt); last = now;     // line 2712: clock advances
...
if (capSkip > 1 && capTick % capSkip) { rAF(loop); return; }   // line 2781: frame skipped
```

`last = now` had ALREADY RUN. So every skipped frame threw away the time it
represented. At a 30fps cap on a 60Hz screen that is every other frame, so **the
world advanced by half of real time**. Not "felt slow" — ran at half speed.
Measured: 0 to 42 km/h took 17s against a physics model that does it in 4.2s.
With the cap removed and the clock restored on an early return, 4.3s.

Three lessons, in order of how much time each would have saved:

1. **Any early return from the frame loop must give the clock back.**
   `last = lastFrameT` before `return`. The idle-cooling skip a few lines above
   had the identical defect and was fixed at the same time.
2. **Frames-per-second cannot detect a wrong clock.** The `?diag` panel reported
   a rock-steady 30 drawn frames a second with a worst frame of 30ms — a
   perfectly healthy world — while it ran at half speed. The number that would
   have found this in one minute was SPEED, and it only got measured because the
   rider kept using the word "slowmo" instead of "lag". A user's exact wording is
   data; "slow motion" and "low frame rate" are different faults.
3. **A saving nobody asked for is not worth a defect the user can see.** The cap
   existed to reduce heat. It was never requested, it was never A/B'd against a
   real device, and it cost more than the heat did. It is gone; nothing sets
   FPS_CAP now except an explicit `?fps=`.

Corollary on instruments: the same panel measured `requestAnimationFrame` ticks
and I read them as rendered frames — the fourth time that specific mistake has
been made in this project. It now reports both, plus speed, plus the worst gap.

## A cleanup that deletes a building is not a cleanup

The ring work above (dedupe, despike, uncross) repaired nine broken footprints
across five districts and cleared three defect classes. It also silently deleted
a building, and the only thing that noticed was a ratchet: Chinatown's S8 fell
from 63 street-level tenants with a shopfront to 62, and deploy refused.

The deleted footprint was a 35m x 2m party wall, 78 m2, ten vertices. To
`despike_ring` it looked exactly like a rounding artefact — the outline runs out
along one side and comes back along the other, reversing direction at each end —
so the rule "drop any vertex where the ring doubles straight back" unwound the
whole thing until it had no area left to keep.

The fix is one extra condition: a reversal only counts as an artefact if one of
its two edges is SHORT (under 0.6m). That is what a rounding artefact actually
is — `subdivide()` landing several interpolated points on the same decimetre.
A real narrow building reverses across edges metres long.

Three things worth keeping from this:

1. **Measure the cleanup, don't argue about it.** `SG_NO_FINAL_RINGS=1` now
   rebuilds without every ring pass, the same switch `SG_NO_RING_REPAIR` gives
   the greedy repair. Two builds and one audit run turned "is this fix safe?"
   into a number. The first two guesses about which pass caused it were both
   wrong, and the switch is what showed that.
2. **A geometric rule needs a scale, not just an angle.** "Doubles back" is a
   shape; "doubles back over 20cm" is an artefact. The first version had no
   length in it anywhere, which is why it could not tell a defect from a wall.
3. **The ratchet earned its keep.** Nothing else in the suite noticed: the ring
   checks were happy (that was the point), the defect hunt was at zero, and the
   world looked right. A count of shopfronts, three steps removed from the
   change, is what caught a missing building.

### Do not rebuild a district while a deploy is auditing

A deploy reported `FAIL 1 blockers` in the world audit; run again by hand a minute
later, the same audit passed 42/42 with nothing changed. The difference was that
the first run had a `build_district.py chinatown` finishing underneath it, so the
audit read a world.json that was mid-rewrite.

The stale-chunk guard catches the ordering mistake it was built for (chunks older
than their district file). It cannot catch a district being rewritten DURING the
audit, because the timestamps end up in the right order anyway.

Deploy is a read-only operation on the data. Nothing that writes `data/*.json`
may run at the same time — check with `pgrep -f build_district` first.

### The live-check triangle count is not a measurement

deploy.sh prints a HUD line from one page load at the spawn. Between two deploys
it read 2,382k then 2,753k triangles and it looked like the shophouse roofs had
added 15%. They had not: an A/B on one page, same position, same load, put the
roofs at **+2,400 triangles (0.12%) and zero extra draw calls**.

That line samples whenever the check happens to look, with whichever districts
are resident and wherever the camera has settled. It is a smoke test — "does it
load and run" — and it is good at that. It is not a budget, and comparing it
across deploys will send you chasing regressions that do not exist.

Controlled comparisons only: one page load, one position, toggle the thing under
test, read both numbers. Same rule as the frame-rate work earlier the same day.

## Two things built this session and deliberately not shipped

Both were withdrawn under rules this project had already written down, and both
are worth more as records than they would have been as commits.

**A 1970s walk-up recipe for River Valley Apartments.** Judged side by side
against the generic facade family it would replace (data/landmark.mjs exists for
exactly this): the generic gives the block three storeys of real windows and a
warm painted wall; the recipe replaced all of it with a blank ivory box whose
access galleries did not survive the carriageway test. One 662 m2 building is
not worth losing a window grid. Held back, kept in the file with its research.

**The Pinnacle@Duxton's two 500m sky gardens.** Genuinely missing and genuinely
the building's signature. Published: floors 26 and 50, 500m each, all seven
towers linked, 156m over 50 storeys. NOT published: the gardens' plan. The
attempt chained the seven surveyed tower centres along the shortest route
reaching all of them and rendered as stubs poking out of tower faces and
stopping in mid-air — because a centre-to-centre chain spends most of each span
inside a tower. Withdrawn under authored.json's own rule: "if that claim is
wrong the world is worse than the hole was."

The capability built for it was KEPT: `shape: "deck"` takes a polyline, a width
and a `min_h`, and emits geometry lifted clear of the ground through the same
`mh` path city.js uses for SkyPark. Tested, unused, and there when someone has
the actual plan.

**The pattern worth keeping:** build it, render it, judge it against what it
replaces, and be willing to throw it away. Three of this session's changes
survived that test and two did not, and the two that did not cost an hour
between them — far less than shipping either would have cost later.

## Measure the DATA before you design a filter for it (2026-08-01)

Marina Bay's ground was twenty-five metres too high and the write-up in NEXT.md
had it diagnosed, with three ranked candidate fixes, none of which would have
worked. The whole day turned on one measurement that nobody had made: what does
the elevation dataset actually say, binned by distance to the nearest building?

    dist   0- 10m  median 17.0m      dist  55- 80m  median 11.5m
    dist  10- 34m  median 13.0m      dist  80-131m  median 11.0m, range -19 to +32

The proposed fix was "filter samples by distance to the nearest building". The
table says a sample 130m clear of every footprint is still wrong by the same
amount as one standing on a roof, and open water in the middle of the bay read
6m and 16m against a datum of zero. There was nothing to filter FOR. Every
free web API here returns the same SRTM, so no amount of cleverness above it
would have helped, and a lower-envelope estimator was tried across four
percentiles and three radii to be sure before the dataset was replaced.

**The general form:** when a derived value is wrong, measure the INPUT
distribution before designing anything that processes it. A filter is a theory
about where the signal is, and a theory deserves a measurement first.

## A gate that has never failed is not a gate (2026-08-01)

`data/groundcheck.py` (check A4) compares the modelled ground against published
levels. Before wiring it into deploy.sh it was run against the PRE-FIX terrain,
where it reported Raffles Avenue at 21.6m and Temasek Avenue at 20.3m against a
published 3-5m and exited non-zero. Only then was it trusted.

This costs about two minutes — keep a copy of the broken artefact, point the new
check at it, watch it fail — and it is the difference between a check and a
decoration. Related: A4 is the FIRST check in this project that compares the
world against something outside it. Everything else compares the world with
itself, which is precisely why a ground that was smooth, self-consistent and
twenty-five metres wrong passed 42 audit checks, 35 defect classes, behaviour,
determinism and a live check for the entire life of the district.

## Count what you suppress, and read the count (2026-08-01)

Lane lines were being painted straight across junction mouths. The first fix
asked "is this mark inside some other street's carriageway" — which sounds
exactly right and is not, because OSM maps an arterial with slip roads, bus-lane
ways and unnamed fragments running alongside it for its whole length. It dropped
**80% of Bras Basah Road's lane marks and 68% of Orchard's**.

Nothing on screen said so. A street with no lane lines still looks like a
street, and the vet frame of the junction looked BETTER, because the defect
being fixed was genuinely gone. What caught it was a counter printed beside the
mark total. The corrected version finds where roads actually CROSS the axis
(with a 25-degree angle gate, so a parallel way is never a junction) and drops
6-11%, which is what junctions cost.

**Any rule that removes things must report how many**, next to the total, every
build. "No silent caps" is not a style preference — an over-broad filter and a
correct one produce frames that look the same, and only the number tells them
apart.

## A POINT GUARD CANNOT POLICE A SLAB (2026-08-01, evening)

This one cost a whole session before it was found, and it is the FIFTH time
"a geometric rule needs a SCALE" has been the answer here — the third in
`sgdetail.js` alone.

`buildWalkable()` refused to draw a stair tread standing in a carriageway by
asking `anyRoad(centreX, centreZ)`. P1b kept reporting one flight in Cross
Street anyway. Five attempts went into reconciling the two — widening the
margin, testing `surfaceAt - groundAt` at one end, at both ends, against a
bridge-deck threshold, and computing a second road predicate from the chunk's
own roads. Every one of them was aimed at the theory that "`__onRoad` and P1b
disagree about where Cross Street is."

**They did disagree, and it was not the cause.** The flight carries a surveyed
`step_count` of FOUR over a way 25.1m long, so `depth = total / n` made each
drawn tread a slab **6.28 metres deep**. Its centre stood 9.6m clear of the
road and passed. Its leading edge was 3.7m from the centreline of a road 14.8m
wide. P1b was reporting the corner, and P1b was right every time.

The guard now walks the box's own footprint at 2m spacing (`boxClear`), which
is the same figure the barrier walk arrived at, for the same reason, two
sessions earlier.

**The generalisation, and it is worth applying by hand to every guard in this
repo:** a predicate that samples ONE POINT can only ever be correct about
geometry smaller than the thing it is guarding against. Before trusting any
placement guard, ask what the largest object it must refuse actually measures.
The three earlier instances — a spur test with no length, a road check with no
width, a roof eave sized as a percentage — all read as correct code.

**And the process lesson, which is the expensive half:** five of the six
attempts changed code without first proving which branch ran. The finding came
from printing the check's own example line and reading the numbers in it. When
a fix does not take, instrument before editing.

## `Terrain.at()` IS HIGH INSIDE A WATER RING ON PURPOSE (2026-08-01, evening)

The Singapore River fix cut the riverbed into `vertexY()` — what is DRAWN —
and deliberately NOT into `at()`, so the quay beside the river keeps its
ground. That decision is right and is documented at the top of NEXT.md.

The consequence is not documented anywhere, and it bit immediately: **anything
seated with `surfaceAt()` inside a water ring is placed on a surface that is
not drawn.** A flight of eleven steps at 1697-1704, 8507-8512 in brasbasah
shares a node with the river's own bank ring — a real landing stair down to the
water — and was drawn at `at()` = 14.7m while the water surface there is at
-0.05m. Sixteen metres of stair, cheek and handrail standing in mid-air.

Any layer seated on `surfaceAt` needs a `dryHere()` guard: not in open water,
unless a bridge deck is over it. Exempt by MECHANISM, not by signature — the
same sentence W2's own comment already argues for.

It also shows how these hide. W2 counts a mesh only when most of its sampled
vertices are over water, and everything here goes through the Merger — so while
the offending treads shared a merged tile with geometry on dry land, the tile
did not qualify and the defect was invisible to the check that was built to
find it. It surfaced only when an unrelated fix changed which treads were drawn
and therefore how the tiles packed. **A merged-geometry check can be masked by
what a mesh happens to be packed with.**

## THE ONE TOOL THAT WAS STILL ON SwiftShader (2026-08-01, evening)

"The deploy takes five minutes, not fifty" above says any new tool that opens a
browser must pass `--use-gl=angle`. `data/probe.mjs` never got it. Every
measurement taken through the project's main ad-hoc measuring tool was
software-rasterised, and the tell was printed in its own output on every run:
`render: {"fps":1,...}` on a scene the gated audits draw in hardware.

Fixed. **If a diagnostic prints `fps: 1`, suspect the harness before the world.**

## A FAILING DEPLOY MUST NAME WHAT FAILED (2026-08-01, evening)

`deploy.sh`'s per-district audit loop pipes each run through `tail -2`, so a
refused deploy prints:

    FAIL  0 blockers, 1 majors over budget

— no check id, no place, no count. Diagnosing it meant re-running the whole
district by hand. `gates.sh` has printed the failing lines for weeks
(`grep -E "^   FAIL"`); deploy.sh simply never got the same treatment, and the
two have drifted the way every duplicated list in this file eventually does.

Same family as B2's "a bare number cannot be diagnosed", and as W2's example
line, which said only `BufferGeometry entirely over water` — and since
everything the Merger emits is a `BufferGeometry`, that named neither the place
nor the layer. It now prints position, colour and bbox, and that single change
turned a blind diagnosis into a five-minute one.

**A gate's failure message is part of the gate.** If it cannot be acted on
without re-running the thing that produced it, it is not finished.

## MEASURE BEFORE YOU LOG IT, NOT AFTER (2026-08-02)

Two "defects" were written into the task list from vet frames this session and
both turned out not to exist.

"Paved paths stand about a metre proud of the ground on slopes", from a frame at
Fort Canning. It sat in the notes as an open defect, and TWO further hypotheses
were built on top of it — a flat-across-the-width ribbon, then a bridge-tagged
footway drawn flat — before anyone measured the thing itself. When it was
finally measured: 1,084 `pavementSurface` vertices, height above `TERRAIN.at()`
**mean 0.02m, maximum 0.02m**. That is `SURFACE_PATH` exactly. The pavement is
flush everywhere and always was. Both hypotheses were also false, and each cost
a round of code reading to disprove.

**This is the FOURTH time this project has chased a shallow camera angle.** The
rule is already written in two places — HANDOFF's "A FRAME IS NOT A DEFECT UNTIL
IT HAS SETTLED" (a gold banner over Little India, chased three times before
someone re-shot it and found it attached to a lamp-post arm) and NEXT.md's
Robertson riverbed entry, where the first frame "looked like catastrophic
terrain corruption" and instrumenting showed the cut was correct and narrow.

So the rule is not new. What is new is WHERE it failed: not at the fixing stage
but at the LOGGING stage. A frame is enough to say "look at this". It is not
enough to write a cause into the notes — and once a cause is written down, the
next person inherits it as a premise and starts building on it. A wrong entry in
the notes costs more than the bug would have.

**Before a frame becomes a logged defect, get one number.** A probe that reads
the geometry's own height against the terrain takes two minutes and is the
difference between "there is a defect at Fort Canning" and "there is nothing
here". Log the number, not the impression — and if the number contradicts the
frame, say so in the entry so nobody re-opens it.

## RESEARCH IS ALWAYS ALLOWED — GO AND LOOK IT UP (owner, 2026-08-02)

Standing instruction from the owner, in his own words: *"rmb to update the
workflow to rmb that research anytime is allowed too. I want the workflow to be
able to access anything it needs."*

**So: never guess a real-world fact that is published somewhere.** Web search,
WebFetch, Overpass, OneMap, URA, NLB, Roots, data.gov.sg, archive.org, a
published architect's page — all of it is fair game, at any point, without
asking. There is no budget to protect and no permission to seek. If a number
about the real Singapore would change what gets built, go and find it.

This is not a small licence. Every landmark this project has got right came from
looking something up, and **every recipe brief written so far has corrected at
least one false premise the moment someone actually checked**:

- The National Stadium is tagged `height=10` in OSM against a published **83m**
  dome, and its 310m span was carried as UNVERIFIED for a whole brief until one
  search confirmed it.
- Golden Mile Complex was being drawn at 22m against a published **89m**.
- The Concourse is tagged `height=0` and is **175m**.
- Tekka Place's two blocks were the wrong way round in our data.
- "Raffles Hospital 44.2m" turned out to be our own `levels x 3.4` laundered
  into a brief as if it were a survey.
- kallang's axis, "Stadium Boulevard", is a road that does not exist.

**The discipline that goes with the licence, and it is the important half:**

1. **Say what tier it is.** PUBLISHED / MEASURED / UNVERIFIED / UNPUBLISHED, and
   name the source. A figure without a source is a guess wearing a number.
2. **UNPUBLISHED is a real and final answer.** URA publishes no storey count and
   no metre height for a single one of 996 conserved buildings that were
   checked. Record the absence and stop looking, rather than leaving it to be
   re-researched by the next session.
3. **Never launder a derivation into a survey.** If a height came from
   `levels x floor-to-floor`, `hs` must say so. This has bitten twice.
4. **Re-measure the claim you are about to depend on.** The kallang height
   suppression was re-checked against live Overpass before being relied upon and
   the real numbers were worse than the brief said.
5. **A search limit is a session limit, not a project limit.** If the budget is
   exhausted, SAY SO in the handoff so a fresh session can finish the job — one
   session ended with 200/200 used and left named open items, all of which were
   closed in minutes the next day.

## `pgrep -f X` MATCHES ITSELF — AND IT BIT AGAIN, FOURTEEN TIMES (2026-08-02)

HANDOFF has warned about this for weeks, in the specific: *"check with
`ps ax -o args= | grep -E 'MacOS/Python data/build_district\.py'` — and NOT with
`pgrep -f build_district`, which matches its own command line and hangs forever
(that trap cost six stuck processes and eight hours)."*

Tonight it cost **fourteen** stuck shells, some looping for over an hour and a
half, because the warning was read as being about `build_district` rather than
about `pgrep -f`. Every one of these never terminates:

    until ! pgrep -f "bash ./deploy.sh" >/dev/null; do sleep 20; done
    until ! pgrep -f "topup.py" >/dev/null; do sleep 30; done

The waiter's OWN command line contains the pattern, so `pgrep -f` finds itself,
the condition is never false, and it loops until something kills it. It looks
correct, it runs silently, and the only symptom is a machine slowly filling with
`sleep` processes — 31 of them here.

**Write the pattern so it cannot match itself.** Any of these work:

    until ! pgrep -f "[b]ash ./deploy.sh" >/dev/null; do sleep 20; done   # bracket trick
    until [ ! -d /proc/$PID ]; ...                                        # wait on a PID
    CMD & PID=$!; wait $PID                                               # just wait(1)

**And the general rule, which is the reusable half:** a check whose own
existence changes the thing it checks is not a check. This is the same shape as
`__onRoad` being asked about a district it cannot see, and as A2 reading a
global that every chunk overwrites — all three found in one session. When a
predicate is about the state of the system, ask whether running it is part of
that state.

## THE MAP IS A 36MB FILE ON DISK NOW — STOP QUEUING FOR OVERPASS (2026-08-02)

`data/osmlocal.py` answers this project's OSM queries from a local
`Singapore.osm.pbf` instead of the network. Measured reasons, from the night
kallang was built:

    one district's fetch          15 queries + 16 RETRIES = 31 round trips
    one layer across 9 districts  27 minutes (the parkfurn topup)
    mirrors alive in that hour    1 of 4 answering, 2 dead, 1 rate-limited

Six districts remain in the ring at ~28 queries each: about 170 more throttled
round trips, any of which can time out at 180s and any of which can trip the
loss guard.

**The whole island is 36MB.** `download.bbbike.org/osm/bbbike/Singapore/`.
One pass over it answers EVERY layer of a district in about 95 seconds.

**Ask for all layers together, never one at a time.** A scan costs ~95s
whatever you ask, so fifteen separate calls is twenty-four minutes and one
`fetch_many()` is ninety-five seconds. `build_district.py` and `topup.py` both
go through it and fall back to Overpass per-layer for anything the reader
cannot parse, so nothing that used to succeed can now fail.

**IT ALSO FIXES A CORRECTNESS BUG, WHICH WAS NOT THE POINT AND IS THE BEST PART.**
merge.py's dedupe comment records Funan, Old City Hall, Bugis+, Peninsula Plaza
and NAFA all sitting at a consistent ~11m offset across the seam, "because the
two district fetches happened at different times and OSM had been edited in
between". One snapshot makes a build REPRODUCIBLE: two districts read from the
same file cannot disagree about where a building is. That class of seam defect
stops existing.

**TWO THINGS TO KNOW BEFORE TOUCHING IT.**

1. **It is validated against Overpass, not assumed equal.** Diffed id-for-id and
   vertex-for-vertex against the cached responses. The first version returned
   **1,245 building relations** for a bbox Overpass answers with **three**,
   because relations were matched on tags with no spatial test at all. A
   relation has no geometry — `rel(bbox)` means "has a member in the box" — so
   the in-box node and way ids have to be collected on the way past. A .pbf is
   ordered nodes, ways, relations, so one pass suffices. **Diff any new backend
   against a known-good response; plausible counts prove nothing.**
2. **`data/osm` is a CACHE and must never be committed.** Excluded from the
   deploy snapshot and from `source/`, exactly like `data/dem` and `data/raw`.
   data/dem was committed once at 80MB and is still in the git history because
   only a rewrite could reclaim it.

And one process note worth more than the feature: `bash -n` passed a `tar`
command this change had broken, because an edit left a BLANK LINE inside a
backslash continuation — syntactically fine, and it silently ends the command.
It was caught by actually running the pipeline into a temp dir and checking
what came out. **Syntax checks do not test behaviour.**

## PRINT THE COORDINATE AT FULL PRECISION (2026-08-02)

Sentosa's 114 "things built in open water" were diagnosed wrong TWICE — once as
an unimplemented island hole, once as a three-way coastline junction — and both
readings came from the same habit: printing lat/lon at five decimal places.

At 5dp, two clipped runs ending at `1.26010,103.82419` and beginning at
`1.26010,103.82419` look like two fragments meeting at a junction. At full
precision they are `1.260097,103.8241852` twice: **the start and end of ONE
CLOSED RING** — Pulau Brani, OSM way 16691602. `clip_chain` begins at the ring's
seam vertex, so a closed island whose seam falls inside the bbox comes out as
two runs, each with one end in open space rather than on the perimeter, and the
assembly discards both. Three lines sew the seam back up. W2 114 -> 17.

5dp is 1.1 metres. That is fine for saying WHERE something is and useless for
saying whether two things are the SAME POINT — which is the question every
stitch, every dedupe and every "did these join" test is really asking. **When
comparing positions rather than reporting them, print `repr()`.**

## THE EVIDENCE A CHECK COLLECTS IS WORTH MORE THAN THE BYTES (2026-08-02)

Three separate caps sat between a failing check and its own examples:

    exW2 in audit_world.js .................. 6
    the reporter in audit_run.mjs ........... 4
    add() itself ............ window.__auditEx || 8

A 114-finding failure printed four lines. Raising the first two changed nothing,
because `add()` truncates on the way out — so the count never matched the
examples, and that mismatch drove THREE failed attempts to rebuild the check's
filters in a probe. Every one of them got the filters subtly wrong and I spent
the time debugging my reconstruction rather than the world.

**Never reconstruct a check in a probe. Make the check tell you.** All three
caps are tunable now: `SG_EX_CAP=40 SG_SCENE=<id> node data/audit_run.mjs`.

And the general form, which cost this project a night: a gate that reports a
number it cannot evidence forces everyone who meets it to guess.

## READ-AND-DECLINED IS NOT UNREAD (2026-08-02)

A2 ("real data present but unused") asked "did the layer produce output", which
is right for a layer nobody wired up and wrong for one that was fully considered
and correctly refused. It called three things blockers that were correct:

- marinaeast's 21 shops — all inside conservatories or upstairs, each with a
  recorded reason in `__shopSkips`
- sentosa's 3 `mrt` records — all `kind: "station"`, Sentosa Express monorail
  stops with no subway entrance to draw
- sentosa's 78 crossings — all further from the axis than half a carriageway

The fix is the same each time: **make the decline visible**, then let the check
accept "the builder looked" as evidence of reading. A silent `continue` is
indistinguishable from never having asked, and the next person cannot tell
either.

## A BLOCKER CAN EXPIRE WHILE NOBODY IS LOOKING (2026-08-02, afternoon)

The top item on the open list was "fix island holes FIRST, THEN land the
end-to-start stitch", with a measured regression behind it: end-to-start grew
harbourfront's sea from 866,710 to 913,164 m2, which covered islands the
assembly could not cut out, W2 3 -> 13 on a shipped district. A careful,
correctly-ordered plan.

**It was re-measured before it was worked on, and every part of it had expired.**
Across all five coastal districts:

    district      ways  chains  edge-runs  islands  reversal joins used
    marinaeast       5       1          1        0        0
    marinasouth      7       1          1        0        0
    keppel           1       1          1        0        0
    harbourfront    16       4          5        0        0
    sentosa         24       7          7        0        0

Not one reversal fires anywhere in this world, not one interior island survives,
and end-to-start produces BYTE-IDENTICAL rings to the code it was supposed to
replace — harbourfront included. The seam repair in `clip_chain`, which landed
after that measurement, was what manufactured the islands the larger ring could
not cut out. Fix the cause and the ordering argument it forced simply stops
existing.

`_punch` was the same story. The note at its call site said "the next attempt
should test it against a hand-made square-with-a-square-hole, which is what I
did not do". Doing that took four minutes: **it passes every point, in both hole
windings.** The splice was never the bug; its INPUT was half-rings.

So both were landed as hardening rather than as a fix — end-to-start preferred
and a reversal announced when it happens, `_punch` re-enabled behind a
self-check that discards a splice which does not verify. Zero geometry moved.

**The rule: re-measure a blocker before you plan around it.** A measurement is
true of the world on the day it was taken, and this repo fixes root causes
fast enough that an unworked item can be obsolete within a day. The cost of
re-measuring was twenty minutes; the plan it replaced was a session.

The same applies to the note that crossings and MRT are "matched against the
AXIS only". `markings.js` has matched crossings against every DRESSED road for
some time, and the dressing reach went from 230m to **1200m — the whole
district — on 2026-07-29**. What is left of that item is much smaller than it
reads: sentosa's furthest crossings sit 1,242m from its axis, past the 1,200m
reach.

## READING `building:min_level` (2026-08-02, afternoon)

`min_height` was read from the day SkyPark needed it. `building:min_level` —
the same fact in storeys, and how OSM actually records it here — was read by
nothing: **63 footprints in this world carry `min_height` and 880 carry
`building:min_level`, 817 of them with no `min_height` at all.** The metres path
was seeing 7% of what the map says about masses that begin in the air.

564 sat at level 3 or higher and every one was extruded from the ground. The
clearest case is in bugis: a tower crown mapped as six stacked parts (levels
38-44, areas 251-2,168 m2) drew as six solid columns standing in the street, the
smallest a 259 m2 white shaft 108.8m tall where a 2.5m cap belongs.

**TWO THINGS MADE IT SAFE, AND BOTH ARE GENERAL.**

1. **Convert as a FRACTION of the footprint's own height, never `min_level x
   3.4`.** `h` may have come from a surveyed `height=`, from HDB's storey table
   at its own rate, or from levels x 3.4. A cap derived at a different rate from
   the mass it caps floats above it or sinks into it. `min_level/levels` lands
   correctly whichever path produced `h`, and reduces to `min_level x 3.4`
   exactly when `h` came from levels.

2. **A mass that starts in the air needs something under it, and that cannot be
   known until the whole district is read.** Lifting a footprint with nothing
   beneath trades a needle in the street for a slab hanging over it, which is
   worse and looks deliberate. So the candidates are stashed at tag-read time
   and resolved by `_lift_air_parts()` once every building exists: lift it where
   another footprint contains its centroid and reaches that height, leave it on
   the ground where nothing does, and PRINT the count left behind. Measured
   across four districts: 251 lifted, 5 declined, 7 with no thickness to draw.

Set before `_drop_buried` deliberately — the burial rule already knows a
footprint with `mh` occupies none of the ground beneath it, so lifting first
stops a sky deck from swallowing the towers it floats over.

## I TYPED BBOXES FROM MEMORY INTO RESEARCH BRIEFS, AND TWO OF FOUR WERE WRONG (2026-08-02)

This file already says **NEVER TYPE THE DISTRICT LIST BY HAND** — read the
registry. That rule was written about the list of district IDs. It applies just
as hard to every bbox, axis and district fact that goes into a research brief,
and on 2026-08-02 I broke it twice in one batch:

- the **kallang** brief carried **bugis's bbox** verbatim. Four of the named
  targets (Dakota Crescent, Old Airport Road, Shaw Towers, Guoco Midtown) are
  not in kallang at all — two of them 400-690m outside the east and west edges.
- the **tanjongrhu** brief said `1.2740-1.2920 N`, which is very nearly the
  **marinaeast** bbox. It overlaps the real district by 17%, and its centre is
  1.7 km south, in the Straits.

Both were caught by the agents, because every brief this project sends demands
"if a premise in this prompt is WRONG, say so LOUDLY at the top". That
instruction has now corrected something ten times out of ten and it has just
paid for itself twice in one afternoon — a brief that had not carried it would
have come back with confident research about the wrong square kilometre.

**Two rules, and the second is the general one:**

1. Build a brief's facts by READING `data/districts.json` in the same breath as
   writing the prompt. It costs one line:
   `python3 -c "import json;[print(d['id'],d['bbox'],d.get('axis')) for d in json.load(open('data/districts.json'))['districts']]"`
2. **The instruction that makes a subagent argue with you is the most valuable
   line in the prompt.** It is worth more than any amount of detail, because
   detail you got wrong is worse than detail you left out.

## FOUR SEARCH-HEAVY AGENTS SHARE ONE WEB-SEARCH BUDGET (2026-08-02)

Four research agents were fired in parallel. The budget is **per SESSION and
shared across every subagent**, not per agent: 200 calls total. The first agent
alone made 83 tool calls and the session hit 200/200 while three were still
working. Three of the four finished anyway; the fourth (keppel) produced
nothing and has to be redone.

Before dispatching a fan-out of research agents, decide the search budget per
agent and say so in the prompt, or dispatch them in waves. The cap is raisable
with `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` (set to 2000 in the owner's
`~/.claude/settings.json` on 2026-08-02) but it only applies to NEW sessions.

## A HAND-RESEARCHED TABLE ROW THAT NEVER FIRES IS WORSE THAN NO ROW (2026-08-02)

`height_for()` matches the LANDMARKS table against `tags["name"]`. A footprint
with **no `name` tag at all** gets its name much later, from `addr:housename`,
from `NAMED_BY_WIKIDATA`, or from OneMap's answer for its postcode — long after
the height has been decided. So for every building named that way, LANDMARKS was
consulted with an EMPTY STRING and could not match.

Found by chasing one building and it was not the one I expected. Concourse
Skyline, 298-300 Beach Road, 40 storeys: OSM gives it `height=0` and no `name`,
only `addr:neighbourhood=Concourse Skyline`. Its LANDMARKS row had been
researched and written on an earlier day, with a careful comment noting that the
type default of 40m "happened to equal the storey count". **That row had never
once fired.** The tower stood at 40m against a published 150m, `hs="guess"`,
with the right answer sitting in the table.

The old comment even saw the symptom and misread it as the cause: it treated
the 40m as a unit confusion (storeys read as metres) when the real story is that
LANDMARKS could not see the building's name. `hs` said `guess`, not `levels`,
and that one field would have settled it. **Check the provenance field before
believing any story about where a number came from.**

Re-looking-up LANDMARKS after the late name is known, restricted to heights not
already hand-set, immediately turned up more of the same in one district:

    Concourse Skyline ....................  40   -> 150 m
    The Ritz-Carlton, Millenia Singapore .  10.2 -> 130 m
    Customs House ........................   3.5 ->  14 m
    Marina Square ........................  55   ->  40 m

A five-star hotel was being drawn three storeys tall. The count is printed every
build now, because the failure mode here is SILENCE: a table row that does
nothing looks exactly like a table row that works.

**The general form, and it is the third instance of this shape in this repo**
(after `api.grow()`'s misdiagnosis and the "unapplied research" grep): work that
was done correctly can be disconnected from the thing it was meant to affect,
and nothing will say so. Prefer a check that asserts the row CHANGED something
over a comment asserting that it should.
