#!/usr/bin/env python3
"""The golf courses, from the map, instead of one flat green blanket.

    python3 data/golf.py            # writes into data/sentosa.json

WHY THIS EXISTS

Sentosa's two courses — The Serapong and The Tanjong — are **a quarter of the
island's land**: 1.25 km2 of the 2.49 km2 of mapped green. Until now the whole
lot drew as ONE tint. `data/sentosa.json` carried exactly TWO golf records, and
from any height (the cable car, Imbiah, the bungy tower) the east half of
Sentosa was an undifferentiated green carpet with a cart path drawn on it.

It was not missing from the map. Inside the Sentosa bbox the extract carries
**565 surveyed golf features**:

    172  bunker          area      (surface=sand)
    151  tee             area
     72  path            line
     44  green           area
     38  cartpath        line
     36  hole            line      (carries `ref` = hole number and `par`)
     25  fairway         area
     21  rough           area
      4  lateral_water_hazard      (one is named: Serapong Lake)
      1  driving_range   area

`data/unused.py` did report `golf` on 111 ROAD ways and it was deferred with a
reason — but that count only ever saw the LINE features that reached the roads
layer. The 438 AREAS — every bunker, green, tee and fairway — reached nothing at
all: process.py maps `leisure=golf_course` to one `golf` kind and the holes
inside it were never looked for. Ninth instance in this project of real
surveyed data sitting unread while the thing it describes was drawn as a guess.

HOW IT DRAWS, AND WHY THAT COSTS ALMOST NOTHING

These go in as `green` records with their own kinds, which means the TERRAIN
paints them (terrain.js TINT + greenAt) rather than any new mesh. Three things
fall out of that for free:

  * no geometry cost for 438 areas — the ground is already being coloured;
  * they cannot float or fence anybody in, because they ARE the ground. The
    apron slab of 2026-08-20 became an invisible wall precisely because it was
    a mesh laid over terrain; a tint cannot do that;
  * greenAt's smallest-ring-wins rule is exactly right here — a bunker inside
    a fairway inside the course paints bunker, without any nesting logic.

The pins are the one thing that is a prop, and they are 44 small meshes.

WHAT THIS DOES NOT DO. It does not invent a hole layout, a clubhouse, or a
single dimension. Every polygon here is a surveyed way; the hole numbers and
pars are the map's own `ref` and `par` tags. Where the map is silent this file
is silent.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"][0], REG["island_origin"][1]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))

PBF = os.path.join(HERE, "osm", "singapore.osm.pbf")
# Sentosa and its golf headland, generously bounded. The courses run east to
# Tanjong Rimau and the Serapong ridge, well past the resort core.
LATMIN, LATMAX = 1.240, 1.268
LONMIN, LONMAX = 103.800, 103.850

# OSM `golf` value -> the green kind the terrain paints. Names chosen so they
# cannot collide with the existing kinds (`green` alone would shadow the layer
# name, and `sand` already means beach — a bunker is NOT beach sand and must
# not be swum off).
KIND = {
    "fairway": "fairway",
    "rough": "grough",
    "green": "ggreen",
    "tee": "gtee",
    "bunker": "gbunker",
    "driving_range": "fairway",
    "lateral_water_hazard": "ghazard",
    "water_hazard": "ghazard",
}


def proj(lat, lon):
    return [round((lon - LON0) * M_LON, 1), round((LAT0 - lat) * M_LAT, 1)]


def area_of(pts):
    a = 0.0
    for i in range(len(pts)):
        j = (i - 1) % len(pts)
        a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1])
    return abs(a / 2.0)


def main():
    try:
        import osmium
    except ImportError:
        print("golf: osmium not available — nothing written", file=sys.stderr)
        return 1
    if not os.path.exists(PBF):
        print(f"golf: no extract at {PBF} — nothing written", file=sys.stderr)
        return 1

    areas, lines, holes = [], [], []

    class H(osmium.SimpleHandler):
        def way(self, w):
            t = dict(w.tags)
            g = t.get("golf")
            if not g:
                return
            try:
                pts = [(n.lat, n.lon) for n in w.nodes if n.location.valid()]
            except Exception:
                return
            if len(pts) < 2:
                return
            la = sum(p[0] for p in pts) / len(pts)
            lo = sum(p[1] for p in pts) / len(pts)
            if not (LATMIN <= la <= LATMAX and LONMIN <= lo <= LONMAX):
                return
            xz = [proj(a, b) for a, b in pts]
            closed = (len(xz) > 3 and abs(xz[0][0] - xz[-1][0]) < 0.05
                      and abs(xz[0][1] - xz[-1][1]) < 0.05)
            if g == "hole":
                # the hole's own centreline: carries the NUMBER and the PAR
                holes.append({"p": xz, "ref": t.get("ref"), "par": t.get("par"),
                              "n": t.get("name")})
                return
            if closed and g in KIND:
                rec = {"k": KIND[g], "p": xz[:-1]}
                if t.get("name"):
                    rec["n"] = t["name"]
                areas.append(rec)
            elif not closed and g in ("cartpath", "path"):
                lines.append({"k": "cartpath", "p": xz})

    h = H()
    h.apply_file(PBF, locations=True)

    if not areas:
        # AN EMPTY RESULT IS A FAILURE, NOT AN ANSWER. Saying so beats writing
        # a scene file that quietly lost its golf course.
        print("golf: found NO golf areas in the bbox — refusing to write",
              file=sys.stderr)
        return 1

    # THE PIN GOES IN THE MIDDLE OF THE PUTTING GREEN, and the hole number
    # comes from whichever mapped `hole` centreline ENDS nearest that green —
    # which is what a hole line is: tee to green. Where no hole is near enough
    # the pin still stands and simply carries no number, because inventing one
    # would put a wrong number on a real green.
    pins = []
    for a in areas:
        if a["k"] != "ggreen":
            continue
        cx = sum(p[0] for p in a["p"]) / len(a["p"])
        cz = sum(p[1] for p in a["p"]) / len(a["p"])
        best, bd = None, 60.0
        for ho in holes:
            end = ho["p"][-1]
            d = math.hypot(end[0] - cx, end[1] - cz)
            if d < bd:
                bd, best = d, ho
        pin = {"p": [round(cx, 1), round(cz, 1)]}
        if best is not None and best.get("ref"):
            pin["ref"] = best["ref"]
            if best.get("par"):
                pin["par"] = best["par"]
        pins.append(pin)

    path = os.path.join(HERE, "sentosa.json")
    scene = json.load(open(path))
    # ITS OWN KEY, **NOT** `green`, AND THAT IS THE WHOLE POINT.
    #
    # The first cut of this appended straight into `scene["green"]` and the
    # deploy refused it: P3, two tree leaf-cards 1.9m underground. main.js says
    # exactly why, in a note written the day the same trap was found for the
    # paved-canopy layer:
    #
    #     "PUSHED INTO allGreen AND NOT INTO data.green, deliberately. The
    #      planting's `claimed` list reads data.green directly, so writing
    #      there would silently move thousands of trees; this array only ever
    #      reaches setGreen, which paints. ONE EFFECT, NOT TWO."
    #
    # A golf course is exactly the case that warning is about: 418 new polygons
    # over a quarter of the island moved the planting under them, and the two
    # sunk cards were the visible tip of it. main.js pushes this key into
    # allGreen, which paints and nothing else. Ordering does not matter —
    # greenAt is smallest-BBOX-wins, so a bunker inside a fairway still reads
    # as bunker however the list is arranged.
    areas.sort(key=lambda a: -area_of(a["p"]))
    scene["golfareas"] = areas
    scene["golfpins"] = pins
    scene["golfpaths"] = lines
    json.dump(scene, open(path, "w"), separators=(",", ":"))

    from collections import Counter
    c = Counter(a["k"] for a in areas)
    print(f"golf: {len(areas)} areas " + ", ".join(f"{k} {n}" for k, n in c.most_common()))
    print(f"golf: {len(pins)} pins ({sum(1 for p in pins if 'ref' in p)} numbered), "
          f"{len(lines)} cart paths, {len(holes)} mapped holes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
