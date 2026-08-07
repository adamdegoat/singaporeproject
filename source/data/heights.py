"""HEIGHTS — calibrate the guess against the district's OWN surveyed buildings.

The owner: "make the entire sentosa like real sentosa ya meaning the buildings
too everything need research."

Some of that is research one building at a time, and that work is real (see
research/). But the biggest single error on this island is not any one
building, it is the DEFAULT, and it is measurable:

    sourced heights (OSM building:levels)   n=580   median  6.8 m
    guessed heights                         n=501   median 14.4 m

The guess is more than twice as tall as the reality standing next to it. 119
buildings sit at exactly 20m — six storeys — on an island whose surveyed
median is two. That single number is most of why Sentosa reads as a wall of
mid-rise blocks instead of a low-rise resort island.

And the map already contains the answer. 580 buildings HERE carry a real levels
tag, so the district can calibrate its own guess: band the surveyed ones by
footprint, take the median of each band, and give unsourced buildings the
figure their neighbours of the same size actually have. Measured on Sentosa:

    footprint < 300 m2    median  6.8 m
    300 - 1,000 m2        median  6.8 m
    1,000 - 3,000 m2      median 20.4 m
    3,000 m2 +            median 23.8 m

so footprint genuinely predicts height here, and the bands are not invented —
each is the median of real tagged buildings in the same place.

THIS IS STILL A GUESS AND IT SAYS SO. Every building it touches is marked
`hs: "calib"`, never "levels". The accuracy ledger counts a rule as INVENTED no
matter how well founded, which is correct and must not be laundered: this
replaces a bad guess with a defensible one, it does not turn a guess into a
measurement.

A band needs MIN_SAMPLE surveyed buildings before it is trusted; below that it
falls back to the district median, because a "median" of three buildings is an
anecdote.

Run:  python3 data/heights.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
# IMPORTED, NOT RE-TYPED — and from buildtypes.py rather than from process.py,
# which is where this import was first written and where it silently killed
# this whole script. See the note at the top of data/buildtypes.py.
from buildtypes import SELF_SCALED                         # noqa: E402

# footprint bands, in m2
# FINER BANDS. 300-1000 m2 is far too coarse a bucket to carry one median: it
# lumps a 320 m2 villa in with a 950 m2 hall, and giving both the villa's 6.8m
# put fifty large footprints under 8m — which data/check.py refuses, correctly,
# because a 600 m2 building three metres high is a shed and not a building.
BANDS = [(0, 150), (150, 400), (400, 700), (700, 1200),
         (1200, 3000), (3000, 1e12)]
# ...AND A HARD FLOOR TIED TO FOOTPRINT, which is the same rule check.py
# enforces. Calibration may make a building shorter than its neighbours; it may
# not make it a shed.
BIG_AREA, BIG_MIN_H = 600.0, 8.5
MIN_SAMPLE = 12
SOURCED = {"levels", "osm", "site", "named"}
# a storey, for rounding to something a building could actually be
STOREY = 3.4


# RESEARCHED HEIGHTS BEAT THE CALIBRATION, and a published figure beats both.
#
# The bands above are a defensible guess for a building nobody has written
# about. Where somebody HAS, the fact wins. Keyed on a lowercase substring of
# the mapped name; `floors` is multiplied by STOREY, `m` is used as given.
# Every entry carries its source, and an entry without one does not belong here.
RESEARCHED = [
    # RESORTS WORLD SENTOSA. The owner: "that place got alot of levels and
    # different architectures. So must do properly please." Researched
    # 2026-08-04; each figure published.
    #
    # Hotel Michael — 11 storeys, 470 rooms, by Michael Graves. e-architect /
    # RWS. (The site data already gives its outbuildings 36.6m, which is
    # 11 storeys, so this agrees with the survey rather than overriding it.)
    ("hotel michael", {"floors": 11}),
    # Crockfords Tower — 9 storeys, 120 all-suite keys with mansions on the
    # penthouse level. rwsentosa.com.
    ("crockfords", {"floors": 9}),
    # The Laurus (Hard Rock Hotel until July 2025, reopened October 2025) —
    # 183 suites across FIVE storeys. asgam.com / rwsentosa.com. Ours stood at
    # 55m before any of this, which is three times the real building.
    ("hard rock", {"floors": 5}),
    ("laurus", {"floors": 5}),
    # The Barracks Hotel Sentosa — a restored 1940 British barracks, two
    # storeys. fareasthospitality.com / thebarrackshotel.com.sg, 2026-08-04.
    ("barracks hotel", {"floors": 2}),
    # Oasia Resort Sentosa — a three-storey 1940 heritage barracks block with a
    # six-storey modern annexe. The mapped footprints are separate, so the
    # taller figure goes to the larger one. oasiahotels.com / Far East
    # Hospitality, 2026-08-04.
    ("oasia resort", {"floors": 6}),
    ("oasis resort", {"floors": 3}),
]


def researched_for(name):
    low = (name or "").lower()
    for (needle, spec) in RESEARCHED:
        if needle in low:
            return spec
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    blds = d.get("buildings") or []

    # undo a previous run so this is idempotent
    for b in blds:
        if b.get("hs") in ("calib", "research"):
            b.pop("hs", None)
            b.pop("low", None)
            if "h0" in b:
                b["h"] = b.pop("h0")

    sourced = [b for b in blds if b.get("hs") in SOURCED and b.get("h")]
    # A BUILDING'S OWN NAME KNOWS BETTER THAN A BAND.
    #
    # A complex is mapped as many footprints under one name, and the survey
    # often tags only some of them. Resorts World is the case that made this
    # obvious: Hotel Michael's outbuildings carry a surveyed 36.6m — eleven
    # storeys, exactly what the research says — while its MAIN 4,169 m2
    # footprint had no tag and got a 27.2m band median, so one hotel stood at
    # two different heights. Equarius, Crockfords and the Hard Rock block all
    # did the same.
    #
    # So before falling back to a footprint band, ask whether anything else
    # wearing this name was actually surveyed, and match it.
    by_name = {}
    for b in sourced:
        n = (b.get("n") or "").strip().lower()
        if n:
            by_name.setdefault(n, []).append(b["h"])
    name_h = {n: statistics.median(v) for n, v in by_name.items() if v}
    if len(sourced) < 40:
        print(f"  ! only {len(sourced)} surveyed heights — too few to calibrate, "
              "leaving the guess alone")
        return
    overall = statistics.median([b["h"] for b in sourced])

    band_h = []
    for (lo, hi) in BANDS:
        got = [b["h"] for b in sourced if lo <= (b.get("a") or 0) < hi]
        if len(got) >= MIN_SAMPLE:
            band_h.append((lo, hi, statistics.median(got), len(got)))
        else:
            band_h.append((lo, hi, overall, len(got)))

    print(f"== heights {a.id}")
    print(f"   {len(sourced)} surveyed, district median {overall:.1f} m")
    for (lo, hi, med, n) in band_h:
        tag = "" if n >= MIN_SAMPLE else f"  (only {n} surveyed — using district median)"
        his = "+" if hi > 1e11 else f"-{hi:.0f}"
        print(f"     footprint {lo:.0f}{his:<8} median {med:5.1f} m from {n:4d} surveyed{tag}")

    changed = 0
    before = []
    after = []
    for b in blds:
        if b.get("hs") in SOURCED or not b.get("h"):
            continue
        # A CANOPY'S HEIGHT IS A CLEARANCE, NOT A STOREY COUNT.
        #
        # `building=roof` is a slab on columns — city.js draws it that way and
        # its "height" is how far off the ground the slab sits. Banding it by
        # footprint like a storeyed building took the canopy over the Universal
        # Studios forecourt from 5m to 20.4m, and standing by the globe the sky
        # was replaced by a dark textured slab across the whole frame. The most
        # photographed spot on the island, ruined by a rule that had no business
        # touching it.
        #
        # Same for anything already lifted (`og`/`mh`): openground.py computed
        # that clearance against the ground under a real road, and a median has
        # nothing to add.
        if b.get("roof") or b.get("og") or (b.get("mh") or 0) > 1:
            continue
        # ...AND THE SAME FOR EVERY OTHER TYPE THAT IS ITS OWN HEIGHT
        # STATEMENT. The `roof` guard above was written for one canopy and left
        # the rest of the family behind: a `building=hut` and a
        # `building=grandstand` — the Wings of Time stage set and its 2,712 m2
        # seating bank, the two nearest structures to the spawn point — were
        # both banded up to 20.4 m off their footprint area and both shipped as
        # solid slabs in the first frame of the world. A hut is single-storey
        # because it is a hut. The list lives in process.py beside the defaults
        # it belongs to, so the two cannot drift apart.
        if b.get("bt") in SELF_SCALED:
            continue
        area = b.get("a") or 0
        med = overall
        nm = (b.get("n") or "").strip().lower()
        inherited = name_h.get(nm) if nm else None
        if inherited is not None:
            med = inherited
        else:
            for (lo, hi, m, n) in band_h:
                if lo <= area < hi:
                    med = m
                    break
        # A LITTLE VARIATION, FROM THE POSITION, NEVER FROM AN RNG STREAM.
        # 442 identical boxes is its own kind of wrong, and this project's rule
        # is that a cosmetic choice must not be able to move a bus stop.
        p = b.get("p") or [[0, 0]]
        hx = (abs(p[0][0]) * 7.31 + abs(p[0][1]) * 3.17) % 1.0
        # an inherited height is a fact about THIS building, so it is taken as
        # given; only a band median gets the spread
        h = med if inherited is not None else med * (0.82 + 0.36 * hx)
        # round to a storey, floor at one
        if inherited is None:
            h = max(STOREY, round(h / STOREY) * STOREY)
        if area > BIG_AREA and not researched_for(b.get("n")):
            h = max(h, BIG_MIN_H)
        spec = researched_for(b.get("n"))
        if spec:
            h = spec["m"] if "m" in spec else spec["floors"] * STOREY
            # A RESEARCHED FACT IS NOT A SHED. check.py refuses a footprint over
            # 600 m2 standing under 8m, which is the right guard against the
            # pipeline guessing a big hall short — and The Barracks Hotel really
            # is a two-storey 1940 barracks on a 1,930 m2 plan. check.py already
            # has the mechanism for this: `low` means A SOURCE SAYS SO, as
            # opposed to the pipeline having guessed it. So say so.
            if h < 8.0:
                b["low"] = 1
        elif b.pop("low", None):
            pass
        before.append(b["h"])
        b["h0"] = b["h"]
        b["h"] = round(h, 1)
        b["hs"] = "research" if spec else "calib"
        after.append(b["h"])
        changed += 1

    if before:
        print(f"   recalibrated {changed} guessed heights: "
              f"median {statistics.median(before):.1f} m -> "
              f"{statistics.median(after):.1f} m")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
