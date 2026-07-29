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

SCENES=${1:-"orchard brasbasah marinabay world"}
FAILED=0

hr() { printf '\n== %s\n' "$1"; }

hr "data gate"
for s in $SCENES; do
  python3 data/check.py "$s" 2>&1 | tail -3 || FAILED=1
done

hr "road overlap (analytic)"
for s in $SCENES; do
  python3 data/audit_roads.py "$s" 2>&1 | grep -E "^==|building EDGES|NON-service" || true
done

hr "ride model"
node test/ride.test.mjs 2>&1 | tail -1 || FAILED=1

hr "world audit"
for s in $SCENES; do
  printf '  %s: ' "$s"
  SG_SCENE=$s node data/audit_run.mjs 2>&1 | grep -E "PASS +[0-9]+ checks|FAIL +[0-9]+ blocker|boot failed" | tail -1
  SG_SCENE=$s node data/audit_run.mjs 2>&1 | grep -E "^   FAIL" | sed 's/^/      /' || true
done

hr "behaviour"
SG_SCENE=world node data/behaviour.mjs 2>&1 | tail -1

hr "exploratory defects (not a gate)"
SG_SCENE=world node data/defects.mjs 2>&1 | grep -E "FOUND|findings" | sed 's/^/  /'

hr "accuracy ledger"
python3 data/accuracy.py world 2>/dev/null | tail -2

hr "tidy"
bash data/tidy.sh 2>&1 | tail -2

exit $FAILED
