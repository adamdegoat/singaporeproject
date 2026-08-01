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
