#!/bin/bash
# Leave nothing running. A headless WebGL page holds two CPU cores at 60fps and
# a browser that outlives its script keeps doing it, which cooks the laptop
# overnight for no reason. Run this after any batch of checks.
pkill -f "data/sweep.mjs"        2>/dev/null
pkill -f "Chromium --headless"   2>/dev/null
pkill -f "chrome_crashpad"       2>/dev/null
sleep 1
n=$(pgrep -c -f "Chromium|chrome_crashpad" 2>/dev/null || echo 0)
echo "  browsers still running: $n"

# ...and the wait-loops that never end.
#
# A `pgrep -f "probe.mjs"` loop matches its OWN command line -- the pattern is
# in it -- so the shell finds itself, concludes the probe is still running and
# sleeps forever. Twenty-three of them were found after fourteen hours, each
# waking every 8 to 12 seconds. They are invisible to a browser sweep.
STUCK=$(pgrep -f 'until ! pgrep' 2>/dev/null | tr '\n' ' ')
if [ -n "$STUCK" ]; then
  # shellcheck disable=SC2086
  kill $STUCK 2>/dev/null
  echo "  killed $(echo $STUCK | wc -w | tr -d ' ') stuck wait-loop(s)"
fi
echo "  stuck wait-loops: $(pgrep -f 'until ! pgrep' 2>/dev/null | wc -l | tr -d ' ')"
