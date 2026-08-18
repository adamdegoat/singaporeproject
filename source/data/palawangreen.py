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
CX, CZ = -1244.4, 13035.6      # the landing loop's own centre
RX, RZ = 15.0, 13.5            # 30 x 27 m, SAT
ROT = math.radians(35)         # long axis along the shore

ring = []
for i in range(16):
    t = 2 * math.pi * i / 16
    ex, ez = RX * math.cos(t), RZ * math.sin(t)
    ring.append([round(CX + ex * math.cos(ROT) - ez * math.sin(ROT), 1),
                 round(CZ + ex * math.sin(ROT) + ez * math.cos(ROT), 1)])

greens = d.get("green") or []
# reconcile: exactly one authored clump at this landing. An identical ring is
# left alone (idempotent); a ring from an older centre is replaced.
def _cc(g):
    return (sum(p[0] for p in g["p"]) / len(g["p"]),
            sum(p[1] for p in g["p"]) / len(g["p"]))
near = [g for g in greens
        if g.get("k") == "scrub" and g.get("p")
        and math.hypot(_cc(g)[0] - CX, _cc(g)[1] - CZ) < 40]
if any(g.get("p") == ring for g in near):
    print("  palawan green island already present — nothing to do")
else:
    for g in near:
        greens.remove(g)
    if near:
        print(f"  replaced {len(near)} stale clump ring(s) near the landing")
    greens.append({"k": "scrub", "p": ring, "n": None,
                   "a": round(math.pi * RX * RZ)})
    d["green"] = greens
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"  authored: the bridge-landing green island ({round(math.pi*RX*RZ)} m2 scrub) into {did}.json")
