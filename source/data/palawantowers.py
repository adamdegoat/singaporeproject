#!/usr/bin/env python3
"""THE TWO PALAWAN VIEWING TOWERS — "the identity of this place".

`research/palawan-spawn.md` §4.3. They stand on the islet at the Southernmost
Point of Continental Asia, at the far end of the suspension bridge, and `towers`
had no entry for either of them. What we did have was ONE 242 m2 footprint drawn
as a 6.8 m box — and that footprint is not a building at all: OSM `way/163201852`
is the two towers' ROOF OUTLINES plus the neck between them (perimeter 98.8 m,
bbox 31.4 x 24.7 m; our 242 m2 = two 10.7 m squares plus the link). So the box
is REMOVED here and the towers are built in its place — see the note on V4 below.

POSITIONS ARE DERIVED AND THEY CHECK OUT: tower A (NW) 1.2480413/103.8212808 and
tower B (SE) 1.2479552/103.8214270 come out 18.85 m apart against the research's
own 18.86 m.

HEIGHT — AND THE RESEARCH ARGUES WITH ITSELF, HONESTLY, SO THIS FILE FOLLOWS THE
HALF THAT IS MEASURED. "15 m, spanning three storeys" is PUBLISHED (Straits
Times, 18 July 2021) and traced to source, and it is the figure to QUOTE. But the
same section adds: "my own photogrammetry off the Commons frames gives ~11-13 m
to the roof apex, with the viewing deck ~5-7 m above ground. So 15 m is the
figure to quote, and it is probably generous." A published number is exact in
this project (SENTOSA.md, Layer 1) — but here the person who published the
research also measured the object and flagged the conflict, so the GEOMETRY takes
the measurement and the RECORD keeps the publication. 13.5 m apex, 6.5 m deck.

DO NOT CITE sentosa.com.sg FOR THESE. Its "Lookout Towers" page has a CMS bug,
live and verified 2026-08-07: the accordion headed "SOUTHERNMOST POINT
CONTINENTAL ASIA TOWER" serves the FORT SILOSO SKYWALK copy verbatim —
"11-storeys high, 181-metres long, opened in 2015". Broken since at least Oct
2021. An official page is not automatically about the thing it is titled after.

FORM, all PHOTO from Sentosa's own hero image and the 2023 Wikimedia set:
heavy timber stained dark chocolate, four chunky round columns plus a core on
masonry bases; a square hipped pyramidal crown in TWO TIERS with a ventilated
clerestory gap between them and very deep overhanging eaves, over a third wider
low hipped skirt at mid level; rectangular shingles; closely spaced plain
vertical balusters over a solid boarded fascia; switchback timber stair flights
wrapping the frame — NOT spiral, one listicle says spiral and is wrong. The link
is an elevated boardwalk at an INTERMEDIATE level, ~8 m long and ~1.6 m wide:
you cannot cross between the top decks. "Covered" is unconfirmed, so it is not
roofed here.

Run:  python3 data/palawantowers.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

TOWER_A = (-1341.3, 13116.8)          # NW
TOWER_B = (-1325.0, 13126.3)          # SE
ROOF = 10.7        # DERIVED — eaves to eaves, square, rotated ~45 deg to the axis
DECK = 6.5         # DERIVED (photogrammetry) — viewing deck above ground, 5-7 m
APEX = 13.5        # DERIVED (photogrammetry) — 11-13 m; PUBLISHED figure is 15 m
SKIRT = 4.6        # the third, wider low hipped skirt over the mid level
LINK_Y = 4.2       # the boardwalk is at an INTERMEDIATE level, not the top deck
LINK_W = 1.6
# THE 242 m2 FOOTPRINT IS REMOVED, NOT SHRUNK, AND THE GATE IS WHY.
# The first version lowered it to a 0.35 m base slab, on the reasoning that a
# surveyed outline should be kept. `audit_world.js` V4 "scale sanity" refused
# the build: **"a building shorter than a door"**, 1 blocker. It is right, and
# it points at the real answer — the thing is not a building at ANY height.
# OSM way/163201852 is the two towers' ROOF OUTLINES plus their link, and the
# towers now stand there, so the footprint has been modelled rather than
# deleted. This is NOT stale.py's case ("a closed ride's building is still a
# building"): there the structure survives and only the name is false; here
# there was never a building.


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    if a.id != "sentosa":
        return
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    print(f"== palawantowers {a.id}")

    mid = ((TOWER_A[0] + TOWER_B[0]) / 2, (TOWER_A[1] + TOWER_B[1]) / 2)
    ang = math.atan2(TOWER_B[0] - TOWER_A[0], TOWER_B[1] - TOWER_A[1])

    # The roof-outline footprint stops being a 6.8 m box.
    removed = 0
    drop = []
    for b in d.get("buildings") or []:
        p = b.get("p") or []
        if not p or not isinstance(p[0], list):
            continue
        cx = sum(q[0] for q in p) / len(p)
        cz = sum(q[1] for q in p) / len(p)
        if math.dist((cx, cz), mid) > 25.0:
            continue
        if b.get("hs") not in (None, "calib"):
            continue                       # never override a surveyed height
        drop.append(b)
        print(f"   removed the {b.get('h'):.1f} m 'building' (a={b.get('a')}) — "
              f"it is the towers' roof outline, and they are built now")
        removed += 1

    if drop:
        d["buildings"] = [b for b in d["buildings"] if b not in drop]

    d["palawantowers"] = {
        "p": [[round(v, 1) for v in TOWER_A], [round(v, 1) for v in TOWER_B]],
        "roof": ROOF, "deck": DECK, "apex": APEX, "skirt": SKIRT,
        "linkY": LINK_Y, "linkW": LINK_W,
        "ang": round(ang, 4),
        "n": "Southernmost Point of Continental Asia",
        "src": ("positions DERIVED from OSM nodes, 18.85 m apart against a "
                "researched 18.86; roof plan 10.7 m DERIVED from way/163201852; "
                "deck 6.5 m and apex 13.5 m from the research's own "
                "photogrammetry (its PUBLISHED figure is 15 m and it flags that "
                "as probably generous); all form PHOTO"),
    }
    print(f"   two towers authored, {math.dist(TOWER_A, TOWER_B):.2f} m apart "
          f"(research 18.86 m), {removed} footprint(s) removed")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
