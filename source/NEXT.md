# Start here

Read this, then `STANDARD.md`, then work. Everything below is current as of
2026-07-27 and is deployed and hash-verified live.

## Where it stands

Live: https://adamdegoat.github.io/singaporeproject/ — the full 2,586m of Orchard
Road. **31 checks pass, no blockers, nothing over budget.** 41–58fps at 844x390
dpr 2, 4s to load, 1,565 buildings.

Done: layout, road widths from lane tags, terrain covering every road, 500
crossings, 47 bus stops, 61 signals, 43 MRT exits with real exit letters, 992
named shopfronts, 460 pedestrians across 68 streets, the distant-city surround,
and 87 buildings with designed massing.

**How much is left, in real numbers.** Only **68 buildings front Orchard Road**
(a corner within 45m of the centreline); 47 are named, 43 are 20m or taller.
Eight have a researched design. Everything else — the other ~1,500 — sits behind
those and cannot be seen from the street, so a guessed height there is fine
permanently. The remaining job is about **60 frontages**, not 917 buildings.

**The finish line, written down so "done" means something:** you can ride the
full 2,586m and every building visible from the road is the right height, shape
and material; everything you cannot see is honest background; nothing moves in a
way it could not.

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

## Commands

```
node server.cjs                  # dev server on :8933
node data/vantage.mjs [ids...]   # comparison sheet, 14 matched-angle frames
node data/sheet.mjs > sheet.html # standalone page of them, lat/lon per frame
node data/audit_run.mjs          # the 31 snapshot checks; needs the server
node data/behaviour.mjs         # B1-B3: how things MOVE; needs the server
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
