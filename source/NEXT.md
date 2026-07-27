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

## Do this first

1. **The comparison sheet.** Render 10–12 matched-angle views (Tanglin junction,
   ION/Wheelock, Ngee Ann City forecourt, Somerset, Dhoby Ghaut) and put them in
   front of the user next to real photographs. **This is the only remaining test
   of whether it looks like Orchard Road, and it is the thing the whole project
   is for.** It cannot be self-assessed: nobody working on this has seen the
   street. Build the sheet, ask what is wrong, fix that.

2. **Two researched facts not yet built.** Both verified from sources, see the
   comment block above `LANDMARKS` in `data/process.py`:
   - Ngee Ann City's podium is modelled on the Great Wall and clad in 3.8m by
     3.2m African Red polished granite panels. We draw a plain podium.
   - Hilton Singapore Orchard is **two** towers, 36 storeys at 144m and 40 at
     152m. We draw one mass.

3. **The open ratchets.** `P1b` 97 and `T1` 7, both target 0. Mostly traffic
   signal poles, arms and heads over carriageways. `pruneCarriageway` cannot
   reach them because street furniture is built after it runs — see the comment
   on that function. Closing this means deciding, deliberately, what each kind of
   furniture may hang over a road. Do not do it by loosening an allowlist.

## Three bug patterns worth hunting on sight

Every defect found in six review loops was one of these. Grep for them before
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
   "blocked by solid geometry" and looked only at instanced props. `A2` claimed
   "real data present but unused" while 6 of 48 bus stops were built. If a check
   is green, confirm what it actually looks at.

## Commands

```
node server.cjs                  # dev server on :8933
node data/audit_run.mjs          # the 31 checks; needs the server
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
