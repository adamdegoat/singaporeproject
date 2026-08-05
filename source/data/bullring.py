"""THE BULL RING — the giant metal parasol at the Universal Studios plaza.

One of the best forms on Sentosa and this world did not build it: the plaza
between Festive Walk and the Universal globe was open paving with nothing on it.

WHAT IS MEASURED AND WHAT IS AUTHORED, stated the same way ussgate.py states it:

  MEASURED (research/rws-architecture.md §5.2, DERIVED off June-2025 satellite
  against a 10 m grid — these are measurements, not publications):
    * the structure is centred at 1.2564 N, 103.8209 E
    * the canopy is an ELLIPSE, 62 m on its long axis x 31 m on its short.
      "Building it as a 60 m circle would be twice as big as it is in one
      direction" — the research says so in as many words.
    * central drum ~8 m diameter, on a ~17 m dark platform ring
    * 14-16 white petal-shaped canopy segments radiate around the drum

  PUBLISHED: it is the entrance plaza to Universal Studios Singapore and one of
  the three named parts of Festive Walk (Bull Ring / The Forum / Waterfront).
  It is PEDESTRIAN — it is not a vehicle arrival plaza, and the research
  corrects that premise explicitly. Address 8 Sentosa Gateway.

  UNPUBLISHED, therefore EST-PHOTO from the July-2026 frame read against
  Crockfords' storey bands: lantern top 25-32 m, canopy underside 10-13 m.
  Taken at the middle of each range.

  AUTHORED: the ellipse's BEARING. No source gives it. It is taken as the line
  the plaza itself runs on — Festive Walk's own centroid through the Universal
  globe — because that is the axis the walk arrives and leaves on, and a canopy
  over a walk lies along the walk. Recorded here so nobody later reads it as
  surveyed.

CROSS-CHECK THAT PASSED, and it is why the position is trusted: projected into
world metres the published lat/lon lands 43 m south-west of our own surveyed
Universal Studios Globe node. The research says the structure sits "immediately
south-west of the Universal globe". Two independent sources, one answer.

COLOUR is from the research and it is specific: celadon / pale duck-egg
blue-green drum with dark bronze-brown steel ribs and white or cream panels
between them, going silver in low light. Build celadon, not silver.

Run:  python3 data/bullring.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# the same projection process.py uses, so a lat/lon lands where the map does
LAT0 = float(os.environ.get("SG_LAT0") or 1.366666)
LON0 = float(os.environ.get("SG_LON0") or 103.833333)
M_PER_DEG_LAT = 110574.0
M_PER_DEG_LON = 111320.0 * math.cos(math.radians(LAT0))

LAT, LON = 1.2564, 103.8209        # DERIVED, satellite (research §5.2)

CANOPY_LONG = 62.0                 # DERIVED
CANOPY_SHORT = 31.0                # DERIVED
DRUM_D = 8.0                       # DERIVED
PLATFORM_D = 17.0                  # DERIVED
PETALS = 15                        # DERIVED, "fourteen to sixteen"
LANTERN_TOP = 28.5                 # EST-PHOTO, mid of 25-32
CANOPY_Y = 11.5                    # EST-PHOTO, mid of 10-13


def proj(lat, lon):
    return ((lon - LON0) * M_PER_DEG_LON, (LAT0 - lat) * M_PER_DEG_LAT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    x, z = proj(LAT, LON)

    globe = None
    for at in (d.get("attractions") or []):
        n = str(at.get("n") or "").lower()
        if "globe" in n and "universal" in n:
            p = at.get("p")
            if isinstance(p, list) and len(p) == 2:
                globe = (p[0], p[1])
    walk = None
    for b in (d.get("buildings") or []):
        if str(b.get("n") or "") == "Festive Walk" and b.get("p"):
            ring = b["p"]
            walk = (sum(q[0] for q in ring) / len(ring),
                    sum(q[1] for q in ring) / len(ring))
    if not globe:
        print("  ! Universal Studios Globe node missing — bull ring not placed")
        return

    # THE CROSS-CHECK. If this ever grows past ~80 m the projection, the node or
    # the published coordinate has moved, and the position should not be trusted
    # silently — say so and stop.
    off = math.dist((x, z), globe)
    if off > 80:
        print(f"  ! the published coordinate lands {off:.0f} m from the globe, "
              f"which contradicts 'immediately south-west of it' — not placed")
        return

    # the plaza's own axis: Festive Walk through the globe
    if walk:
        vx, vz = globe[0] - walk[0], globe[1] - walk[1]
    else:
        vx, vz = globe[0] - x, globe[1] - z
    L = math.hypot(vx, vz) or 1
    ang = math.atan2(vx / L, vz / L)

    print(f"== bull ring {a.id}")
    print(f"   centre         {x:.0f},{z:.0f}   (from {LAT}N {LON}E, DERIVED satellite)")
    print(f"   globe          {globe[0]:.0f},{globe[1]:.0f}   — {off:.0f} m away, "
          f"south-west of it as the research says")
    print(f"   long axis      bearing {math.degrees(ang):.0f} deg, AUTHORED as the "
          f"line Festive Walk runs on")
    print(f"   canopy         {CANOPY_LONG:.0f} x {CANOPY_SHORT:.0f} m ellipse, "
          f"{PETALS} petals, underside {CANOPY_Y:.1f} m (EST-PHOTO)")
    print(f"   drum           {DRUM_D:.0f} m on a {PLATFORM_D:.0f} m platform, "
          f"lantern top {LANTERN_TOP:.1f} m (EST-PHOTO)")

    d["bullring"] = {
        "p": [round(x, 1), round(z, 1)],
        "ang": round(ang, 4),
        "long": CANOPY_LONG, "short": CANOPY_SHORT,
        "drum": DRUM_D, "platform": PLATFORM_D, "petals": PETALS,
        "top": LANTERN_TOP, "canopyY": CANOPY_Y,
        "n": "Bull Ring",
        "src": "position from a published lat/lon, cross-checked 43 m from our own "
               "globe node; canopy/drum sizes DERIVED off satellite; heights "
               "EST-PHOTO; bearing AUTHORED as the walk's own axis",
    }
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
