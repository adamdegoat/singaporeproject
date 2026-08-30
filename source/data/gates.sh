#!/usr/bin/env bash
# Every gate, in one command, in the order the standard signs a district off.
#
#     bash data/gates.sh            # all four scenes
#     bash data/gates.sh orchard    # one scene, plus the region
#
# This exists because the sign-off steps were being hand-assembled into shell
# loops each time, and on 2026-07-29 two of the seven were found never to have
# been run at all: `check.py world` (the region has its own payload and its own
# axes) and `audit_roads.py` per district (it silently ignored its argument and
# audited Orchard three times). A procedure nobody can run in one command is a
# procedure that gets run in pieces, and the pieces that are awkward get
# skipped.
#
# It always finishes with tidy.sh: every gate drives a headless browser at
# 60fps and one that outlives its script holds two CPU cores indefinitely.
set -uo pipefail
cd "$(dirname "$0")/.."

# Same one list as deploy.sh, read from the registry rather than typed here:
# a district added in one place and missed in the other is how four of them
# went ungated once already.
# `world` USED TO BE APPENDED HERE UNCONDITIONALLY, and it no longer exists.
# The project is SENTOSA ONLY (the owner, 2026-08-20: "I already said only
# sentosa bro"), districts.json is down to one entry and there is no
# data/world.json for the region scene to load — so every run of this file
# spent its last and heaviest pass booting a scene whose payload 404s, and
# reported whatever that produced as a district result. Included only if its
# payload is actually on disk, so it comes back by itself if it ever returns.
_REG=""
[ -f "$(dirname "$0")/world.json" ] && _REG=" world"
SCENES=${1:-"$(python3 -c "import json,os,sys; h=os.path.dirname(os.path.abspath('$0')); print(' '.join(d['id'] for d in json.load(open(os.path.join(h,'districts.json')))['districts'] if (d.get('status') or '') not in ('planned',) and 'merged' not in (d.get('status') or '')))")$_REG"}
# the world scene streams SEVEN districts in SwiftShader during its audit —
# the drain alone runs past the old 600s default. Forgetting to pass this
# by hand refused an otherwise-green deploy on 2026-07-30.
export SG_STREAM_BUDGET=${SG_STREAM_BUDGET:-1500000}
FAILED=0
# EVERY gate below must record failure with `; [ ${PIPESTATUS[0]} -ne 0 ] &&
# FAILED=1`, NOT with `| tail -N || FAILED=1`. In a pipeline `$?` is the LAST
# command's status, so `|| FAILED=1` after a pipe tests `tail`, which succeeds
# whatever it was fed. Fixed 2026-08-26 after finding FIVE gates dead this way
# -- check.py, groundcheck.py, ride.test.mjs, behaviour.mjs and signcheck.mjs
# could not fail the run. behaviour.mjs was the worst of them: the comment
# above it already described this exact trap and said "counted in FAILED now",
# but the line under it still used the broken form, so the gate stayed dead
# while its own note claimed it was fixed. Proven before and after: a command
# exiting 3 through `| tail -3 || FAILED=1` leaves FAILED=0.

hr() { printf '\n== %s\n' "$1"; }

hr "is every gate wired to anything"
# ONE SECOND, NO BROWSER, AND IT RUNS FIRST because it answers the question
# every line below it assumes. On 2026-08-29 three rider checks and stuckcheck
# were found referenced by NOTHING that ships -- see the header of
# data/wiring.mjs. A check nobody runs is worse than no check: it is a line in
# a handover saying the ground is guarded.
node data/wiring.mjs 2>&1 | tail -20; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "does it even parse"
# ONE SECOND, AND IT WOULD HAVE SAVED TWO BROWSER ROUND TRIPS on 2026-08-27.
# A GLSL comment inside main.js's ground shader quoted a class name in
# BACKTICKS, the way every other comment in this project does — but that block
# lives inside a JS template literal, so each backtick closed the string. The
# page threw "missing ) after argument list" with no file and no line, and
# every gate below this one reports on a world that never booted, which reads
# as a hang rather than as a syntax error. `node --check` needs the file to be
# named .mjs to parse it as a module, which is why this copies first.
_TMP=$(mktemp -d)
for f in src/*.js; do
  cp "$f" "$_TMP/chk.mjs"
  # `; [ ${PIPESTATUS[0]} -ne 0 ]`, NOT `|| FAILED=1` — in a pipeline $? is
  # sed's, and sed always succeeds. This file's own header records five gates
  # found dead this exact way.
  node --check "$_TMP/chk.mjs" 2>&1 | sed "s|$_TMP/chk.mjs|$f|"
  [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1
done
rm -rf "$_TMP"

hr "data gate"
for s in $SCENES; do
  python3 data/check.py "$s" 2>&1 | tail -3; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1
done

hr "ground vs published levels"
python3 data/groundcheck.py 2>&1 | tail -3; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "road overlap (analytic)"
for s in $SCENES; do
  python3 data/audit_roads.py "$s" 2>&1 | grep -E "^==|building EDGES|NON-service" || true
done

hr "ride model"
node test/ride.test.mjs 2>&1 | tail -1; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "world audit"
for s in $SCENES; do
  printf '  %s: ' "$s"
  # ONE run, both outputs. This used to run the audit TWICE — summary from
  # the first, details from the second — so a load-sensitive check could
  # fail run one and pass run two, refusing the deploy with a nameless
  # "1 majors over budget" that no log anywhere could explain. It also paid
  # every scene's audit twice.
  _audit=$(SG_SCENE=$s node data/audit_run.mjs 2>&1)
  echo "$_audit" | grep -E "PASS +[0-9]+ checks|FAIL +[0-9]+ blocker|boot failed" | tail -1
  echo "$_audit" | grep -E "^   FAIL" | sed 's/^/      /' || true
done

hr "behaviour"
# SENTOSA, NOT world — the game has shipped one district since 2026-08-16 and
# deploy.sh already gates behaviour on sentosa. The world scene here booted
# seven districts in SwiftShader, timed out at the 900s guard TWICE on
# 2026-08-19, and `| tail -1` swallowed the non-zero status both times, so
# the only line anyone saw was "Node.js v25.9.0" and the run stayed green.
# A gate that cannot fail is not a gate — counted in FAILED now.
SG_SCENE=sentosa node data/behaviour.mjs 2>&1 | tail -3; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

echo "== determinism (streaming prerequisite)"
node data/determinism.mjs || exit 1

hr "exploratory defects (not a gate)"
# SENTOSA, for the same reason the behaviour gate above was repointed: there is
# no world payload left to boot, so this was an exploratory pass over nothing.
SG_SCENE=sentosa node data/defects.mjs 2>&1 | grep -E "FOUND|findings" | sed 's/^/  /' || true

hr "facade on the roof"
# The roof cap is the only thing between a flat top and its own wall texture,
# and it silently skipped 165 of them until 2026-08-24. Counted in FAILED: the
# defect is invisible from the street and only ever shows from above.
# NOT `| tail -6 || FAILED=1`: in a pipeline the status is tail's, and this
# file already records what that costs ("A gate that cannot fail is not a
# gate", the behaviour note above). Run it, keep the status, then trim.
_roof=$(SG_SCENE=sentosa node data/roofcheck.mjs 2>&1); [ $? -ne 0 ] && FAILED=1
echo "$_roof" | tail -6

hr "trees in the road, trees in the sea"
# Reported by the owner twice (2026-08-22, 2026-08-24). Same pipeline shape as
# the roof check above: ask the DRAWN world, not the index the placement guard
# already consults.
_tree=$(SG_SCENE=sentosa node data/treecheck.mjs 2>&1); [ $? -ne 0 ] && FAILED=1
echo "$_tree" | tail -6

hr "the rider, on her board"
# THE FIGURE IS THE ONE THING ON SCREEN IN EVERY FRAME AND NOTHING MEASURED IT.
# Three checks looked at the avatar and all three were blind to what the owner
# actually reported (2026-08-26/27): data/avatar.mjs poses her on a blank stage
# with NO BOARD, the 46 goldens show her a few dozen pixels tall, and
# window.__rider() was reading the OLD box rig so every pose field it printed
# was null. Between them they passed a rider standing 55mm ABOVE her deck with
# both shoes pointing along the plank instead of across it.
#
# stancecheck measures her against the grip-tape mesh itself: soles on the
# deck, shoes across it, toes on the rail, neck inside what a neck does.
_stance=$(node data/stancecheck.mjs 2>&1); [ $? -ne 0 ] && FAILED=1
echo "$_stance" | tail -24

# ...AND stancecheck CAN ONLY EVER SEE ONE INSTANT OF THE PUSH. The world is
# deterministic and its settle time is fixed, so three runs land on the same
# phase and report the same numbers — a stroke that is right there and frozen
# either side of it passes. strokecheck walks the phase instead of waiting for
# it: eleven samples, the foot down through the drive and lifting on the way
# home. Added 2026-08-28, when the push was found playing forwards and then
# backwards through two poses with stancecheck green throughout.
_stroke=$(node data/strokecheck.mjs 2>&1); [ $? -ne 0 ] && FAILED=1
echo "$_stroke" | tail -16

hr "the ground under the board"
# ...AND EVERY CHECK ABOVE THIS ONE JUDGES HER POSE AGAINST A DECK, never the
# deck against the ROAD. Both can be perfect while the road teleports: on
# 2026-08-29 the ride surface was found stepping 0.45m per 8m up every bridge
# approach (the deck registry stored one flat height per segment), and 12.3m
# in a single frame beside the cable-car station (the stair clause answers with
# the top tread when nobody hands it a height to judge reach against). The
# rider gates were green through all of it because a pose does not know what
# the ground is doing.
#
# joltcheck DRIVES six spots and reads the board's OWN y on the frame, so
# nothing about the seat has to be reconstructed -- two earlier versions of it
# walked road centrelines with an invented starting height and reported
# metre-scale steps no rider can experience. It ends both ways: the bump term
# must fire somewhere, and must be silent on a settled straight.
_jolt=$(node data/joltcheck.mjs 2>&1); [ $? -ne 0 ] && FAILED=1
echo "$_jolt" | tail -14

hr "the surfaces, the markings and the arc"
# SIX CHECKS THAT EXISTED AND RAN NOWHERE, all found by data/wiring.mjs on
# 2026-08-29 and all green the day they were wired. They are cheap and they
# guard things a player sees directly: what the board rolls on, whether paint
# and paving sit on the surface under them, and the shape of the jump arc.
#
# In gates.sh and NOT in deploy.sh, deliberately: six browser boots is about
# nine minutes on a thirty-minute deploy, and that is the owner's time to
# spend, not mine. data/wiring.mjs asks only that a gate be reachable from one
# runner; moving any of these into the deploy path is a separate decision with
# a measured price.
for _c in surfcheck standcheck pavecheck paintcheck kerbcheck jumpcheck; do
  # `[ ${PIPESTATUS[0]} -ne 0 ]`, never `|| FAILED=1` -- see this file's header.
  node "data/$_c.mjs" 2>&1 | tail -3; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1
done

hr "venue signs"
SG_SCENE=sentosa node data/edgecheck.mjs 2>&1 | tail -10; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "spincheck (turning does not leave a hole in the canopy)"
# The bearing cull in qtrees.js: the only gate that turns. See its header.
node data/spincheck.mjs 2>&1 | tail -6; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1
SG_SCENE=sentosa node data/stuckcheck.mjs 2>&1 | tail -8; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1
SG_SCENE=sentosa node data/signcheck.mjs 2>&1 | tail -12; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "blocked site data"
# iOS private browsing makes localStorage THROW. One unguarded read took the
# whole time-attack layer down silently on 2026-08-26. Asserts on a positive
# signal (4 courses build) with a storage-working control, because the failure
# mode is something NOT appearing and that produces no error.
SG_SCENE=sentosa node data/storagecheck.mjs 2>&1 | tail -5; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "foot through the board"
# The owner's "no clipping" rule, guarded for the case that is easy to get
# wrong and impossible to judge from a screenshot: side-on the deck OCCLUDES
# the far-side foot, so a correct push looks identical to a leg through the
# board. Tested in the DECK'S OWN space, deck identified by its grip-tape
# colour. See the header in data/footcheck.mjs.
SG_SCENE=sentosa node data/footcheck.mjs 2>&1 | tail -5; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "mobile frame rate"
# The mobile-first mandate's viewport, and the only honest fps number the
# project has: sweep.mjs measures the harness (it teleports and screenshots
# between samples, and prints "worst 20 median 20 best 20" for a world that
# actually runs at 60). This touches nothing while it counts. Fails under
# 50fps or on any console error.
SG_SCENE=sentosa node data/mobilefps.mjs 2>&1 | tail -11; [ ${PIPESTATUS[0]} -ne 0 ] && FAILED=1

hr "accuracy ledger"
python3 data/accuracy.py sentosa 2>/dev/null | tail -2

hr "tidy"
bash data/tidy.sh 2>&1 | tail -2

exit $FAILED
