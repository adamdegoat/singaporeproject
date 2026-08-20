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

hr() { printf '\n== %s\n' "$1"; }

hr "data gate"
for s in $SCENES; do
  python3 data/check.py "$s" 2>&1 | tail -3 || FAILED=1
done

hr "ground vs published levels"
python3 data/groundcheck.py 2>&1 | tail -3 || FAILED=1

hr "road overlap (analytic)"
for s in $SCENES; do
  python3 data/audit_roads.py "$s" 2>&1 | grep -E "^==|building EDGES|NON-service" || true
done

hr "ride model"
node test/ride.test.mjs 2>&1 | tail -1 || FAILED=1

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
SG_SCENE=sentosa node data/behaviour.mjs 2>&1 | tail -3 || FAILED=1

echo "== determinism (streaming prerequisite)"
node data/determinism.mjs || exit 1

hr "exploratory defects (not a gate)"
# SENTOSA, for the same reason the behaviour gate above was repointed: there is
# no world payload left to boot, so this was an exploratory pass over nothing.
SG_SCENE=sentosa node data/defects.mjs 2>&1 | grep -E "FOUND|findings" | sed 's/^/  /' || true

hr "accuracy ledger"
python3 data/accuracy.py sentosa 2>/dev/null | tail -2

hr "tidy"
bash data/tidy.sh 2>&1 | tail -2

exit $FAILED
