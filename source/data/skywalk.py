"""FORT SILOSO SKYWALK — a real landmark this world does not build at all.

The owner: "make the entire sentosa like real sentosa." Checked: the Skywalk is
absent from every layer — not an attraction, not a building, not a tower. It is
free, it is one of the things people go to the west of the island FOR, and a
player exploring Fort Siloso currently walks past nothing.

PUBLISHED (sentosa.com.sg, timeout.com, tripadvisor; retrieved 2026-08-04):

    length      181 m
    height      11 storeys, about 43 m
    route       connects Siloso Point to Fort Siloso, through the treetops
    access      an 11-storey lift at the Siloso Point end

ANCHORED TO MEASURED POINTS, like data/zipline.py. Both ends exist in the scene
already as surveyed attraction nodes:

    Fort Siloso            -2787, 11883
    Siloso Point Station   -2481, 12088

They are 368m apart, and the Skywalk is 181m of that — the rest of the walk is
at grade — so the deck is laid along the bearing between them, ending AT the
fort, with the lift tower 181m back toward Siloso Point. That is the way round
the sources describe it: you ride the lift up at the Point end and arrive at
the beginning of the fort.

WHAT IS NOT PUBLISHED IS NOT INVENTED. The deck width, the railing height and
the tower's plan are not published anywhere; they are authored at walkway
scale and recorded here as authored, not slipped in as if measured.

Run:  python3 data/skywalk.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

LENGTH = 181.0        # published
HEIGHT = 43.0         # published (11 storeys)
DECK_W = 2.6          # authored: walkway scale
RAIL_H = 1.25         # authored


class Ground:
    def __init__(self, t):
        self.x0, self.z0 = t["x0"], t["z0"]
        self.cell, self.nx, self.nz = t["cell"], t["nx"], t["nz"]
        self.h = t["h"]

    def at(self, x, z):
        fx = (x - self.x0) / self.cell
        fz = (z - self.z0) / self.cell
        i = max(0, min(self.nx - 2, int(fx)))
        j = max(0, min(self.nz - 2, int(fz)))
        tx, tz = fx - i, fz - j
        a = self.h[j * self.nx + i]
        b = self.h[j * self.nx + i + 1]
        c = self.h[(j + 1) * self.nx + i]
        e = self.h[(j + 1) * self.nx + i + 1]
        return ((a * (1 - tx) + b * tx) * (1 - tz)
                + (c * (1 - tx) + e * tx) * tz)


def find(d, name, kind=None):
    for a in (d.get("attractions") or []):
        if str(a.get("n") or "").strip().lower() != name.lower():
            continue
        p = a.get("p")
        if isinstance(p, list) and len(p) == 2 and isinstance(p[0], (int, float)):
            return (p[0], p[1])
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    g = Ground(d["terrain"])

    fort = find(d, "Fort Siloso")
    point = find(d, "Siloso Point Station")
    if not fort or not point:
        print("  ! Fort Siloso or Siloso Point Station missing — skywalk not placed")
        return

    span = math.dist(fort, point)
    # unit vector from the fort back toward Siloso Point
    ux = (point[0] - fort[0]) / span
    uz = (point[1] - fort[1]) / span
    far = fort                                   # the deck ends AT the fort
    near = (fort[0] + ux * LENGTH, fort[1] + uz * LENGTH)

    gl = g.at(near[0], near[1])
    gf = g.at(far[0], far[1])
    # THE PUBLISHED 43m CANNOT BE HONOURED HERE, AND THAT IS A TERRAIN FAULT.
    #
    # The real Skywalk runs from a lift at beach level to Fort Siloso, which
    # stands on a hill of roughly forty metres — so 43m of deck arrives close
    # to the fort's own ground. Our heightfield does not have that hill:
    # profiled along this exact line, the ground runs 6.0m at the fort node,
    # peaks at 18.8m in the middle and is 13.7m at Siloso Point, and the
    # highest cell within 220m of the fort is 19.0m. Copernicus GLO-30 is
    # accurate to about a metre in low-rise Singapore but this headland is
    # small, steep and wooded, which is exactly where a 30m DEM flattens.
    #
    # Building a 43m deck on a 19m hill would leave a landmark floating
    # twenty-four metres in the air. This project's own rule is that a recipe
    # which looks worse than the generic does not get wired up, so the
    # PROPORTION is kept and the absolute is not: a level deck clearing the
    # canopy over the highest ground it crosses. The published figure stays
    # recorded here so the day the terrain is corrected, this is a one-line fix.
    samples = 40
    peak = max(g.at(far[0] + (near[0] - far[0]) * i / samples,
                    far[1] + (near[1] - far[1]) * i / samples)
               for i in range(samples + 1))
    CANOPY = 12.0
    deck = peak + CANOPY

    print(f"== skywalk {a.id}")
    print(f"   Fort Siloso        {fort[0]:.0f},{fort[1]:.0f}   ground {gf:5.1f} m")
    print(f"   Siloso Point       {point[0]:.0f},{point[1]:.0f}   {span:.0f} m away")
    print(f"   deck {LENGTH:.0f} m along that bearing, lift tower at "
          f"{near[0]:.0f},{near[1]:.0f} (ground {gl:.1f} m)")
    print(f"   ground along the run peaks at {peak:.1f} m; deck laid level at "
          f"{deck:.1f} m ({CANOPY:.0f} m of canopy clearance)")
    print(f"   lift {deck - gl:.1f} m at the Point end, {deck - gf:.1f} m at the fort end")
    print(f"   NOTE: published height is {HEIGHT:.0f} m over a ~40 m hill; our DEM "
          f"gives that hill {peak:.1f} m, so the absolute is not used — see the "
          f"comment in this file")

    d["skywalk"] = {
        "n": "Fort Siloso Skywalk",
        "p": [[round(near[0], 1), round(near[1], 1)],
              [round(far[0], 1), round(far[1], 1)]],
        "y": round(deck, 2),
        "w": DECK_W,
        "rail": RAIL_H,
        "tower": round(deck - gl, 2),
        "src": "authored: ends measured in-scene, 181m/43m published",
    }
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
