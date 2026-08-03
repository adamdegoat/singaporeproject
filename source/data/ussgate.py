"""THE UNIVERSAL STUDIOS SINGAPORE ENTRANCE ARCH — built from a photograph.

The most recognisable structure on Sentosa after the globe, and this world did
not build it: the park boundary ran past a gap and a player walked into the
theme park through nothing.

NO DIMENSION OF IT IS PUBLISHED. Searched; the entrance is described ("a
classical monument at the entrance", "Hollywood-inspired architecture") and
never measured. So this is NOT a case where a number can be looked up, and the
project rule is that a figure which cannot be sourced is never written down as
if it were. Everything below is AUTHORED PROPORTION, taken off the reference
photograph and stated as such.

THE REFERENCE (Wikimedia Commons, Universal_Studios_Singapore_Gate.jpg, read
2026-08-04 — this file exists because the project's own hardest-won lesson is
"look first, and check the toolbox before declaring a limit"). What the photo
shows, and what this therefore builds:

  * TWO MASSIVE PIERS in coursed ashlar, pale warm stone, roughly a quarter of
    the total width each.
  * A TALL ROUND-HEADED ARCH between them, banded archivolt, filling the
    middle half.
  * A DEEP FLARED CORNICE over the whole thing, oversailing well past the
    piers, with a row of VERTICAL FINS on its underside — the single most
    distinctive feature, and the thing that makes the silhouette read as USS
    rather than as a generic gate.
  * A DARK SIGN PANEL between the piers above the arch, carrying the name.

Scale is set from the people in the photograph: they stand about a ninth of the
pier height, which puts the piers near 15m and the cornice top near 18m.

POSITION IS MEASURED, not authored. The gate stands on the park boundary point
nearest the Universal Studios Globe — the globe marks the entrance, which is
the one thing every source agrees on — and faces out along the line from the
park centroid through that point, so it faces the arriving visitor.

Run:  python3 data/ussgate.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# authored from the photograph, in metres
PIER_W = 4.6
PIER_D = 3.4
PIER_H = 15.0
GAP = 9.4          # clear opening between the piers
CORNICE_H = 2.9
CORNICE_OUT = 3.2  # how far the cornice oversails on every side
FINS = 9


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    uss = None
    globe = None
    for at in (d.get("attractions") or []):
        n = str(at.get("n") or "")
        if n == "Universal Studios Singapore" and at.get("g"):
            uss = at
        if "globe" in n.lower() and "universal" in n.lower():
            p = at.get("p")
            if isinstance(p, list) and len(p) == 2:
                globe = (p[0], p[1])
    if not uss or not globe:
        print("  ! Universal Studios park ring or globe missing — gate not placed")
        return

    ring = uss["g"]
    cx = sum(q[0] for q in ring) / len(ring)
    cz = sum(q[1] for q in ring) / len(ring)
    # the boundary point nearest the globe IS the entrance
    gate = min(ring, key=lambda q: math.dist((q[0], q[1]), globe))
    vx, vz = gate[0] - cx, gate[1] - cz
    L = math.hypot(vx, vz) or 1
    # facing outward, away from the park
    fx, fz = vx / L, vz / L

    print(f"== uss gate {a.id}")
    print(f"   park centroid  {cx:.0f},{cz:.0f}")
    print(f"   globe          {globe[0]:.0f},{globe[1]:.0f}")
    print(f"   gate on the boundary nearest the globe: {gate[0]:.0f},{gate[1]:.0f} "
          f"({math.dist((gate[0], gate[1]), globe):.0f} m from it)")
    print(f"   faces {fx:+.2f},{fz:+.2f} (outward)")
    print(f"   AUTHORED from the reference photo: piers {PIER_W:.1f} x {PIER_D:.1f} "
          f"x {PIER_H:.1f} m, opening {GAP:.1f} m, cornice {CORNICE_H:.1f} m "
          f"oversailing {CORNICE_OUT:.1f} m, {FINS} fins")

    d["ussgate"] = {
        "p": [round(gate[0], 1), round(gate[1], 1)],
        "f": [round(fx, 3), round(fz, 3)],
        "pierW": PIER_W, "pierD": PIER_D, "pierH": PIER_H, "gap": GAP,
        "corniceH": CORNICE_H, "corniceOut": CORNICE_OUT, "fins": FINS,
        "n": "Universal Studios Singapore",
        "src": "position measured (park boundary nearest the globe); "
               "proportions authored from a reference photograph — nothing published",
    }
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
