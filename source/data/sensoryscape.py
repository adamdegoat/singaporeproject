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

# THE SPINE IS CONFIRMED AGAINST PUBLISHED SPACINGS, 2026-08-06.
#
# research/rws-architecture.md 4.2 lists node-to-node distances measured off
# the architects' plan. Ours, from the surveyed garden nodes, against theirs:
#
#     Lookout Loop    -> Tactile Trellis    78.4 m   published 79 m   -0.6
#     Tactile Trellis -> Scented Sphere     57.4 m   published 58 m   -0.6
#     Scented Sphere  -> Symphony Streams   60.5 m   published 61 m   -0.5
#     Symphony Streams-> Glow Garden        52.5 m   published 53 m   -0.5
#
# Four independent agreements inside a metre. The POSITIONS are true, and
# everything below is therefore only about FORM.

# WHICH THREE GARDENS CARRY A VESSEL IS NOW PUBLISHED, not a guess.
#
# The original note here said "WHICH three gardens carry the diagrid vessels is
# not published... they go on the three middle ones, which keeps them along the
# spine". That guess was RIGHT, and it is no longer a guess: AECOM and Serie
# both name them — touch, smell and sound — and research/rws-architecture.md
# 4.4 carries the naming with sources. Palate Playground and Glow Garden are
# explicitly NOT vessels and not diagrids.
#
# AND THEY WERE THREE COPIES OF ONE TAN BASKET. Rendered from the promenade,
# 2026-08-06: three identical wicker domes in three different gardens, at
# 22 x 15 m where the published pair of diameters is about 27 m, and carrying
# none of the identity that makes each one the thing it is. The published
# descriptions are specific, they differ from each other in material, colour,
# profile and infill, and every one of those differences was being thrown away.
#
# DIAMETERS are DERIVED from satellite in the research file at +/-15%, so the
# radii below are the midpoint of a stated range, not an invention. HEIGHTS are
# EST-PHOTO for the Trellis (8-12 m, so 10) and UNPUBLISHED for the other two,
# where the Trellis's rim is taken as the family's scale — the three read as
# one system in every photograph, which is the point of the sage steel being
# shared with the deck.
#
# `kind` is what the renderer switches on. Each is a bowl or basket OPEN TO THE
# SKY -- not a dome, not a tunnel, not a tower -- scooped into the hillside,
# with the walkway passing THROUGH it on a chord.
VESSEL_SPEC = {
    # AESS steel grid shell, ovoid, WIDEST AT MID-HEIGHT, with cantilevered
    # stalks reaching inward that end in hung bowl planters. Pale sage/celadon
    # -- deliberately the same green as the deck steel, so vessel and walkway
    # read as one system.
    "Scented Sphere": {"kind": "ovoid", "r": 13.5, "h": 10.0},
    # 3D-curved reinforced granolithic CONCRETE diagrid, saddle/hyperbolic:
    # the rim DIPS where the walkway crosses and RISES at the flanks. Bone
    # white. Each cell holds a conical petal scoop pointing down and inward;
    # toward the top the scoops fall away and the cells open to sky.
    "Tactile Trellis": {"kind": "saddle", "r": 13.75, "h": 10.0},
    # Steel bowl: an outward-FLARING rim over an inward-curving base, resolving
    # to a ring-shaped POOL at the bottom you can wade to. Cerulean/teal on the
    # pails and inner faces with darker navy straps behind.
    #
    # "Satellite and night photography make it look white or silver. It is not.
    # Do not model it white." -- research/rws-architecture.md 4.4. The old tan
    # basket was the closest thing this world had to that mistake.
    "Symphony Streams": {"kind": "bowl", "r": 13.25, "h": 10.0,
                         # central pool disc, DERIVED 9-10 m +/-20%
                         "pool": 4.75},
}
# north to south along the spine, whatever order the table above is written in
VESSELS = [n for n in ORDER if n in VESSEL_SPEC]

# GLOW GARDEN — the south terminus, and NOT a vessel or a diagrid.
#
# It had a floating label and bare ground under it. It is the gate you arrive
# through from Beach Station, so it is the first thing a player walking up from
# the beaches sees, and it was nothing.
#
# research/rws-architecture.md 4.3, with sources: "a wide flight of steps plus
# stepped amphitheatre seating rising from Beach Plaza, flanked by TWO long
# arcing colonnades of tubular 'flower stalks' that curve inward over the space
# like giant grass blades, each tipped with a translucent white flower-bud
# luminaire." Stalks in pale mint/teal, dusty rose-pink and white — a
# deliberately sun-bleached pastel palette. Paving cream and pale-grey banded
# terrazzo.
#
# WHAT IS PUBLISHED HERE IS THE FORM, NOT THE NUMBERS. The research is explicit
# that stalk count and height are UNPUBLISHED and that its EST-PHOTO figures
# are unreliable: "roughly 25-35 stalks per side, tallest arcs 8-14 m (+/-25%,
# perspective makes this unreliable — TREAT AS A RANGE, NOT A NUMBER)". So the
# midpoints below are AUTHORED off a stated range and this file says so, rather
# than quoting 30 and 11 as though they were measurements.
#
# The 2026 Disney "Gallop into Spring" installation that appears in the most
# findable night photograph of this spot RAN 30 JAN - 3 MAR 2026 AND IS GONE.
# No horse, no Mickey figures, no red lanterns. The research flags it because
# it is exactly the trap a photo-led build falls into.
GLOW = {
    "stalks": 30,       # authored midpoint of a published 25-35 range, per side
    "hi": 12.0,         # authored midpoint of a published 8-14 m range
    "lo": 7.0,          # the near end of each colonnade, so it ARCS
    "half": 11.0,       # authored: colonnade offset either side of the axis
    "run": 44.0,        # authored: length of the flanked space along the spine
    # NOT HERE YET, AND NOT WRITTEN AS THOUGH IT WERE: the published form also
    # has "a wide flight of steps plus stepped amphitheatre seating rising from
    # Beach Plaza". A flight of steps is a WALKABLE SURFACE, and this repo's
    # rule is that drawing treads is not the same as being able to climb them —
    # it wants addWalkSurface per tread the way the cable-car stair does, or it
    # is a picture of a stair that also blocks the route. A `steps` count sat
    # here for one revision, emitted and ignored by the renderer, which is the
    # kind of dead field that later reads as a promise. Removed until it is
    # built.
}


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
        spec = VESSEL_SPEC[n]
        # CIRCULAR, NOT ELLIPTICAL. rx/rz are kept as a pair because the
        # renderer reads them, but the published figure is a single "outer
        # diameter" for each vessel — these are baskets on a round plan. The
        # old 11.0 x 7.5 squashed them along the spine and is most of why they
        # read as small props rather than as buildings you walk through.
        v = {"n": n, "p": [round(pts[n][0], 1), round(pts[n][1], 1)],
             "a": round(ang, 3), "k": spec["kind"],
             "rx": spec["r"], "rz": spec["r"], "h": spec["h"]}
        if "pool" in spec:
            v["pool"] = spec["pool"]
        vessels.append(v)

    # GLOW GARDEN — the south gate, see the GLOW table above for what is
    # published (the form) and what is authored (every number).
    glow = None
    if "Glow Garden" in pts:
        i = have.index("Glow Garden")
        # the colonnades flank the arrival axis, so the axis is the last leg of
        # the walk INTO the garden — the direction a player is facing when they
        # come up from Beach Station
        if i > 0:
            ax, az = pts[have[i - 1]]
        else:
            ax, az = pts[have[1]]
        bx, bz = pts["Glow Garden"]
        glow = {"p": [round(bx, 1), round(bz, 1)],
                "a": round(math.atan2(bx - ax, bz - az), 3)}
        glow.update(GLOW)

    d["sensoryscape"] = {
        "spine": spine,
        "gardens": have,
        "vessels": vessels,
        "glow": glow,
        "src": "spine measured from the surveyed garden nodes; vessel form and "
               "which gardens carry one are authored (not published)",
    }

    # THE PROMENADE MUST BE CARVED THROUGH WHATEVER IT CROSSES.
    #
    # The owner, 2026-08-06: "walking up all the sensory scape attractions...
    # will stuck when i try to walk there." Measured: a 3m blocked run at
    # -1598,12442 — which is INSIDE the cable-car station's 1,016 m2 footprint.
    # The Sensoryscape boardwalk runs straight through that building, and you
    # walk into a wall.
    #
    # data/arcade.py already solves this class: a mapped route that runs
    # through a footprint is carved out of the collision grid so the arcade is
    # walkable. It only ever considers `roads` — and the Sensoryscape spine is
    # NOT a road, it is this file's own `spine`. So it was never a candidate.
    #
    # Emitted as an arcade record at the boardwalk's own drawn width (9.2m),
    # which is the width sgdetail actually lays, not OSM's 3.4m footway idea.
    arcs = d.setdefault("arcades", [])
    arcs = [o for o in arcs if o.get("n") != "Sensoryscape promenade"]
    arcs.append({"p": spine, "w": 9.2, "k": "walk",
                 "n": "Sensoryscape promenade",
                 "h": 4.6, "L": round(run, 1)})
    d["arcades"] = arcs

    # PALATE PLAYGROUND IS NOT A PLAYGROUND, AND WE HAD IT ALL ALONG.
    #
    # This file printed "5 of 6 gardens mapped" for weeks and the sixth was
    # written off as missing from the data. It is not missing. It is in
    # `parkfurn` as k='playground', named, 4m from its published position,
    # carrying a real measured radius of 14.0m (the other playgrounds on the
    # island carry 10.8 and 11.4, so this is a number off our own polygon and
    # not a default). It was never missing — it was in a LAYER THIS FILE DOES
    # NOT READ, and "not found" was a statement about the search, not the data.
    # That is the fifth time in this project that "no data exists" has been
    # false, and the count is in data/attractions.py's header.
    #
    # And because the tag said playground, the renderer gave the TASTE GARDEN
    # OF THE SENSORYSCAPE a swing frame, a crossbar and a slide.
    #
    # Same shape as every other bug today: a proxy stands in for the fact and
    # the proxy is wrong. `building` made a cable-car station an office block;
    # `leisure=playground` makes an edible garden a climbing frame. OSM's tag
    # is not wrong — there is no better tag for it — but it is a tag about
    # LAND USE and the renderer read it as a statement about FURNITURE.
    #
    # PUBLISHED (research/rws-architecture.md 4.3): "PALATE PLAYGROUND (taste).
    # Not a vessel. An amoeba-shaped paved pocket EAST of the spine, 47 x 34 m
    # DERIVED. Edible and aromatic planting; log seats cut from recycled
    # Tembusu trees felled on the island — warm brown timber rounds on pale
    # paving." At night an interactive floor projection reacts to footfall.
    #
    # The kind is retagged HERE rather than special-cased by name in the
    # renderer, because the data layer's job is to say what a thing IS and the
    # renderer's is to say how it looks. `r` is left exactly as fetched.
    palate = 0
    for f in (d.get("parkfurn") or []):
        if str(f.get("n") or "").strip() == "Palate Playground":
            f["k"] = "taste_garden"
            # the published 47 x 34 bbox is a 1.38:1 proportion. Our own
            # measured r stays the SIZE; the published figure supplies only the
            # SHAPE, so the two sources are each used for what they actually
            # know and neither is overridden by the other.
            f["ar"] = 1.38
            palate += 1

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
    # "5 of 6" was printed here for weeks and read as "one garden is missing
    # from the data". It never was. The sixth is Palate Playground, which is in
    # `parkfurn` and not on the spine (it is a pocket EAST of the walk), so it
    # is correctly absent from `have` — `have` is the SPINE, not the garden
    # count. Saying which is which stops the next person re-deriving it.
    print(f"   {len(have)} gardens on the spine: {', '.join(have)}")
    print(f"   6th is Palate Playground, off-spine in parkfurn "
          f"({'retagged' if palate else 'NOT FOUND — check the parkfurn layer'})")
    print(f"   spine {run:.0f} m (published connector is 350 m, continuing into RWS)")
    print(f"   {len(vessels)} diagrid vessel(s) at: {', '.join(v['n'] for v in vessels)}")
    if fixed:
        print(f"   and the Sensoryscape 'building' dropped from a 27.2m block to 6m "
              f"— it is a landscape, not a tower")
    if palate:
        print(f"   Palate Playground retagged taste_garden — it is the sixth "
              f"garden, it was in parkfurn all along, and it had a slide")
    if glow:
        print(f"   Glow Garden: {glow['stalks']} stalks a side, "
              f"{glow['lo']:.0f}-{glow['hi']:.0f} m arcs (authored off published ranges)")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
