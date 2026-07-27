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
