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

What this optimises: wall-clock (the laptop's browser runs are the scarce
resource, not tokens), attribution (a red check points at one small batch),
and durability (specs and triage live in files, not in a chat).

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
