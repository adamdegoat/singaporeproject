#!/usr/bin/env python3
"""The green islands in Palawan's sand — authored, with the research that saw them.

research/palawan-spawn.md §3.4 (SAT): "Isolated round clumps of shrub sitting
out in the sand: one at the bridge landing is ~30 x 27 m ... These green
islands in the middle of the sand are a real and distinctive feature."

OSM has no polygon for it — the sand ring runs straight through — so this is
the same class of add as centralbeach.py's sand and authored.json's buildings:
a measured real feature the map simply lacks. Only the BRIDGE-LANDING clump is
authored; the mid-beach one has a size but no measured anchor, and a guessed
position is worse than the hole (see the note in sweep-2026-08-16).

The anchor: the suspension bridge's mainland landing, which is in the data as
the `palawanbridge` authored footway — its shoreward end is (-1268.6, 13059.7).
The clump sits on the open sand just north-east of it, clear of the footways.

`k: scrub` because that is what the pipeline already knows how to draw: the
terrain paints scrub ground with canopy speckle (terrain.js CANOPYABLE), which
from the beach walk reads exactly as the SAT's green island.

Run:  python3 data/palawangreen.py sentosa     (idempotent)
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
did = next((a for a in sys.argv[1:] if not a.startswith("-")), "sentosa")
path = os.path.join(HERE, f"{did}.json")
d = json.load(open(path))

# THE LOOP IS THE ANCHOR, NOT THE BRIDGE END. The landing carries a closed
# circular boardwalk (12-vertex footway, centre -1244.4/13035.6, centreline
# radius 7.3m) and the render shows a palm standing inside it: the walk LOOPS
# AROUND the green island — that is what the ring is for. The first cut put
# the ellipse 15m away on a guessed "clear of the footways" spot and it read
# as a dark smear beside the ring (shots/street/clump2.shot1.jpg).
# BOTH clumps are measured now. The mid-beach one was "a size but no
# measured anchor" until 2026-08-19: masked dark-vegetation-on-sand in the
# ESRI Wayback 2026-08-05 z19 capture (release 26334, 0.299 m/px — the same
# source as the Bikini Bar and lagoon-bridge passes) and PCA-boxed it at
# 26.7 x 17.0 m, centroid 1.24839 N / 103.82264 E -> world (-1189.6,
# 13078.5), long axis ~10.5 deg off +x. It sits ON the mapped sand ring,
# 18.9 m clear of the nearest way. The research's "~20 x 15" was an older,
# blurrier capture of the same clump.
CLUMPS = [
    # (cx, cz, rx, rz, rot_deg, label)
    (-1244.4, 13035.6, 15.0, 13.5, 35.0, "bridge-landing"),   # 30 x 27, SAT
    (-1189.6, 13078.5, 13.3, 8.5, 10.5, "mid-beach"),          # 26.7 x 17.0, SAT 2026-08-05
]

def _cc(g):
    return (sum(p[0] for p in g["p"]) / len(g["p"]),
            sum(p[1] for p in g["p"]) / len(g["p"]))

greens = d.get("green") or []
wrote = False
for (CX, CZ, RX, RZ, ROTD, label) in CLUMPS:
    ROT = math.radians(ROTD)
    ring = []
    for i in range(16):
        t = 2 * math.pi * i / 16
        ex, ez = RX * math.cos(t), RZ * math.sin(t)
        ring.append([round(CX + ex * math.cos(ROT) - ez * math.sin(ROT), 1),
                     round(CZ + ex * math.sin(ROT) + ez * math.cos(ROT), 1)])
    # reconcile: exactly one authored clump per anchor. An identical ring is
    # left alone (idempotent); a ring from an older centre is replaced.
    near = [g for g in greens
            if g.get("k") == "scrub" and g.get("p")
            and math.hypot(_cc(g)[0] - CX, _cc(g)[1] - CZ) < 40]
    if any(g.get("p") == ring for g in near):
        print(f"  {label} clump already present — nothing to do")
        continue
    for g in near:
        greens.remove(g)
    if near:
        print(f"  replaced {len(near)} stale ring(s) at {label}")
    greens.append({"k": "scrub", "p": ring, "n": None,
                   "a": round(math.pi * RX * RZ)})
    wrote = True
    print(f"  authored: the {label} green island ({round(math.pi*RX*RZ)} m2 scrub)")
if wrote:
    d["green"] = greens
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"  written: {path}")
