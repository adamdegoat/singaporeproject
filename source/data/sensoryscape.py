"""SENTOSA SENSORYSCAPE — a landscape, drawn as a 27m office block.

Checked in the scene: "Sentosa Sensoryscape" exists as a single 826 m2 BUILDING
standing 27.2m high. It is not a building. It is a 350m landscaped connector
from Resorts World down to the beaches, opened March 2024, and our own height
calibration made it a tower because a rule that bands buildings by footprint
has no idea what it is looking at.

PUBLISHED (archdaily.com, sensoryscape.sentosa.com.sg, timeout.com; retrieved
2026-08-04):

    length      350 m, about 30,000 m2
    role        links Resorts World in the north to the beaches in the south
    architects  Serie Architects + Multiply Architects, completed 2024
    form        sensory gardens "framed by THREE intricate diagrid structures",
                described as basket-inspired woven structures that enclose the
                visitor
    gardens     six: Lookout Loop, Tactile Trellis, Scented Sphere, Symphony
                Streams, Palate Playground, Glow Garden

AND FIVE OF THOSE GARDENS ARE ALREADY SURVEYED IN OUR OWN DATA, in order along
the ridge:

    Lookout Loop      -1598, 12440
    Tactile Trellis   -1615, 12516
    Scented Sphere    -1644, 12566
    Symphony Streams  -1678, 12615
    Glow Garden       -1695, 12665

which is a 246m run — the published 350m continues north into Resorts World.
So the corridor is MEASURED, not drawn by hand.

WHICH three gardens carry the diagrid vessels is not published. They go on the
three middle ones, which keeps them along the spine and away from the ends, and
that choice is recorded here as authored. The vessel geometry — an elliptical
woven basket of crossing arcs — is authored from the description, since no
dimension of it is published either.

Run:  python3 data/sensoryscape.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# the gardens, north to south along the ridge
ORDER = ["Lookout Loop", "Tactile Trellis", "Scented Sphere",
         "Symphony Streams", "Glow Garden"]
# authored: which gardens are enclosed, and the basket's proportions
VESSELS = ["Tactile Trellis", "Scented Sphere", "Symphony Streams"]
VESSEL_RX = 11.0
VESSEL_RZ = 7.5
VESSEL_H = 9.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    pts = {}
    for layer in ("attractions", "buildings"):
        for o in (d.get(layer) or []):
            if not isinstance(o, dict):
                continue
            n = str(o.get("n") or "").strip()
            if n not in ORDER:
                continue
            p = o.get("p")
            if isinstance(p, list) and len(p) == 2 and isinstance(p[0], (int, float)):
                pts[n] = (p[0], p[1])
            elif isinstance(p, list) and p and isinstance(p[0], list):
                pts[n] = (sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p))

    have = [n for n in ORDER if n in pts]
    if len(have) < 3:
        print(f"  ! only {len(have)} Sensoryscape gardens mapped — not built")
        return

    spine = [[round(pts[n][0], 1), round(pts[n][1], 1)] for n in have]
    run = sum(math.dist(spine[i], spine[i + 1]) for i in range(len(spine) - 1))

    vessels = []
    for n in VESSELS:
        if n not in pts:
            continue
        # face the vessel along the spine, so the basket runs with the walk
        i = have.index(n)
        j = min(len(have) - 1, max(1, i))
        ax, az = pts[have[j - 1]]
        bx, bz = pts[have[j]]
        ang = math.atan2(bx - ax, bz - az)
        vessels.append({"n": n, "p": [round(pts[n][0], 1), round(pts[n][1], 1)],
                        "a": round(ang, 3),
                        "rx": VESSEL_RX, "rz": VESSEL_RZ, "h": VESSEL_H})

    d["sensoryscape"] = {
        "spine": spine,
        "gardens": have,
        "vessels": vessels,
        "src": "spine measured from the surveyed garden nodes; vessel form and "
               "which gardens carry one are authored (not published)",
    }

    # ...and it is not a 27m building.
    fixed = 0
    for b in (d.get("buildings") or []):
        if str(b.get("n") or "").strip() == "Sentosa Sensoryscape":
            if (b.get("h") or 0) > 8:
                b["h0"] = b.get("h0", b.get("h"))
                b["h"] = 6.0
                b["hs"] = "research"
                b["low"] = 1
                fixed += 1

    print(f"== sensoryscape {a.id}")
    print(f"   {len(have)} of 6 gardens mapped: {', '.join(have)}")
    print(f"   spine {run:.0f} m (published connector is 350 m, continuing into RWS)")
    print(f"   {len(vessels)} diagrid vessel(s) at: {', '.join(v['n'] for v in vessels)}")
    if fixed:
        print(f"   and the Sensoryscape 'building' dropped from a 27.2m block to 6m "
              f"— it is a landscape, not a tower")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
