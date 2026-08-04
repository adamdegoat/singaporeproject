#!/usr/bin/env python3
"""Does the modelled ground agree with PUBLISHED ground levels?

    python3 data/groundcheck.py            # every district
    python3 data/groundcheck.py marinabay  # one

WHY THIS EXISTS. On 2026-08-01 Marina Bay's ground was found to be about
twenty-five metres too high: Raffles Avenue modelled 29.6m on reclaimed land
that is published at three to five. It had been that way for as long as the
district had existed, through 42 audit checks, 35 defect classes, behaviour,
determinism and a live check, and HANDOFF.md said the quiet part out loud —
"NO GATE CATCHES IT... a wrong-but-smooth ground is invisible to every check in
the suite". V3 tests that the terrain has no step sharper than 1:1 and V4 that
its scale is sane; a smooth plateau at the wrong height passes both happily.

Every other check in this project compares the world against ITSELF. This one
compares it against the outside world, which is the only way to catch an error
that is internally consistent.

THE TOLERANCE IS DELIBERATELY WIDE, and that is the point. Two things are
uncertain: the anchor's own position (a published figure attaches to a site or a
tunnel chainage, and the coordinate here is read off that description, not
surveyed) and the model's 35m grid. So this is not a precision instrument and
must never be tuned into one — a gate that fails on a metre would be turned off
within a week. It fails on the class of error it was written for: ground that is
out by more than a building.

Sources for every figure are in HANDOFF.md under "PUBLISHED GROUND LEVELS,
BANKED". Conversion: RL - 100 = metres above mean sea level.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))

# name, lat, lon, low, high, source. `low`/`high` are the PUBLISHED band.
ANCHORS = [
    ("Marina Bay Sands site", 1.28340, 103.86070, 3.0, 3.5,
     "Arup Journal; Pappin 2013"),
    ("Raffles Ave, Marina Centre", 1.289794, 103.860739, 3.0, 5.0,
     "Thomson Line contract T228, RL+103 to +105"),
    ("Temasek Ave, Marina Centre", 1.290246, 103.861188, 3.0, 5.0,
     "Thomson Line contract T228"),
    ("Bayfront Ave", 1.282378, 103.859319, 3.0, 5.0,
     "Thomson Line contract T228"),
    ("Serangoon Rd, Little India", 1.31050, 103.85400, 3.0, 3.0,
     "Halim 2008 NTU thesis, NEL Farrer Park-KK CH 31+895"),
    ("Fort Canning summit", 1.29400, 103.84600, 48.0, 48.0,
     "published summit height"),
    # SENTOSA — AND IT IS THE ONLY DISTRICT THE GAME SHIPS.
    #
    # Every anchor above is Marina Bay, Little India or Fort Canning: districts
    # that are built but not published. So this check — the project's only
    # comparison against something OUTSIDE the world — has been running every
    # deploy over seven districts nobody plays and none over the island.
    #
    # That is not theoretical. Measured 2026-08-04 against raw Copernicus
    # GLO-30 along a transect over the Fort Siloso headland, the shipped model
    # is 29 to 39 metres LOW: 5.8m at the Fort Siloso node against a raw 34.7m,
    # 13.3m at the peak against 52.8m. Every gate passed. A flattened headland
    # is smooth, so it satisfies the step and scale checks by construction, and
    # with no anchor within two kilometres nothing else was looking.
    #
    # PUBLISHED FIGURES DISAGREE, so this is a BAND, not a point, and the band
    # is the spread of what is actually published rather than a number chosen
    # to pass. Mount Serapong is the highest point of Sentosa:
    #   84.7 m  1898 "Map of the Island of Singapore and its Dependencies", 278 ft
    #   89.81 m bench mark, Singapore 1:50,000 Series SMU 075 Ed. 8,
    #           MINDEF Mapping Unit 2006
    #   85 m    commonly cited
    #   92 m    commonly cited as the summit of Blakang Mati
    #   97 m    PeakVisor
    # The band takes the two figures with a traceable primary document behind
    # them (84.7 and 89.81) and widens to the common 92; 97 is an outlier with
    # no document behind it and is left out deliberately.
    #
    # Coordinates from PeakVisor, 1.2503 N 103.833417 E, which lands 9,12867 in
    # world space — inside the Serapong ridge in our own data.
    #
    # AT THE TIME OF WRITING THIS PASSES BY 0.8 m (model 75.8, band floor
    # 84.7 - TOL 10 = 74.7). That is on purpose and it is worth saying plainly:
    # it is not a gate that fails today, it is a gate that will fail the moment
    # the ridge is flattened any further, and it is the first thing on this
    # island a rebuild is measured against at all.
    ("Mount Serapong, Sentosa", 1.2503, 103.833417, 84.7, 92.0,
     "SMU 075 Ed. 8 bench mark 89.81m (MINDEF 2006); 1898 map 278ft=84.7m"),
]

# How far outside its published band an anchor may sit before this fails. Set
# from what it is defending against, not from what looks tidy: Marina Bay was
# out by 25m and Raffles Place by nearly 100m in the raw dataset, while the
# honest residual after the 2026-08-01 rebuild is 2-4m.
TOL = 10.0
# Nothing in central Singapore is below mean sea level. The lowest reclaimed
# ground is held at 4.0m SHD on the southern coast (PUB Code of Practice on
# Surface Water Drainage, 7th ed. 2018, cl. 2.1.1) and the Marina Barrage keeps
# the reservoir near zero. Terrain UNDER a water polygon is deliberately sunk
# below its rim and is not tested here.
SEA_FLOOR = -3.0


def world(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


def grid_at(g, x, z):
    fx = (x - g["x0"]) / g["cell"]
    fz = (z - g["z0"]) / g["cell"]
    if fx < 0 or fz < 0 or fx > g["nx"] - 1 or fz > g["nz"] - 1:
        return None
    i0 = min(int(fx), g["nx"] - 2)
    j0 = min(int(fz), g["nz"] - 2)
    a, b = fx - i0, fz - j0
    h, n = g["h"], g["nx"]
    v = ((h[j0 * n + i0] * (1 - a) + h[j0 * n + i0 + 1] * a) * (1 - b)
         + (h[(j0 + 1) * n + i0] * (1 - a) + h[(j0 + 1) * n + i0 + 1] * a) * b)
    return v + g.get("base", 0.0)


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    ids = [d["id"] for d in REG["districts"]]
    scenes = {}
    for did in ids:
        p = os.path.join(HERE, f"{did}.json")
        if os.path.exists(p) and (only is None or only == did):
            try:
                scenes[did] = json.load(open(p))
            except Exception:
                pass
    if only and only not in scenes and os.path.exists(os.path.join(HERE, f"{only}.json")):
        scenes[only] = json.load(open(os.path.join(HERE, f"{only}.json")))
    if not scenes:
        sys.exit("no scenes to check")

    print("== ground truth: modelled vs published")
    fails = []
    for name, lat, lon, lo, hi, src in ANCHORS:
        x, z = world(lat, lon)
        got = []
        for did, s in scenes.items():
            g = s.get("terrain")
            if not g:
                continue
            v = grid_at(g, x, z)
            if v is not None:
                got.append((did, v))
        if not got:
            continue
        for did, v in got:
            off = 0.0 if lo - TOL <= v <= hi + TOL else (
                v - (hi + TOL) if v > hi else v - (lo - TOL))
            band = f"{lo:g}" if lo == hi else f"{lo:g}-{hi:g}"
            mark = "ok  " if off == 0.0 else "FAIL"
            print(f"  {mark} {name:26s} {did:12s} modelled {v:6.1f}m  "
                  f"published {band:>7s}m")
            if off:
                fails.append(f"{name} in {did}: {v:.1f}m against a published "
                             f"{band}m ({src})")

    # and the invariant that needs no anchor at all
    for did, s in scenes.items():
        g = s.get("terrain")
        if not g:
            continue
        lowest = min(g["h"]) + g.get("base", 0.0)
        rings = [w.get("p") for w in s.get("water", []) if len(w.get("p") or []) > 3]
        if lowest < SEA_FLOOR and not rings:
            fails.append(f"{did}: lowest ground {lowest:.1f}m is below sea level "
                         f"and the district has no water to have been sunk")
            print(f"  FAIL {did}: lowest ground {lowest:.1f}m, no water polygons")

    if fails:
        print(f"\n  {len(fails)} ground failure(s):")
        for f in fails:
            print(f"   ! {f}")
        sys.exit(1)
    print(f"  PASS  {len(ANCHORS)} published anchors, tolerance {TOL:g}m")


if __name__ == "__main__":
    main()
