"""LOOKOUT LOOP — surveyed all along, and in the scene with its name cut off.

The north terminus of the Sensoryscape, and the first thing a player arriving
from Resorts World walks into. It rendered as bare ground under a floating
label, and a whole "we must choose where to put it" argument was written about
it (see HANDOVER SESSION 8, struck) before anybody looked in the raw cache.

IT IS FULLY SURVEYED. Four ways NAMED "Lookout Loop", plus two unnamed
companions, all `highway=footway bridge=yes`, at `layer=1` and `layer=2` — the
two-level loop the research describes:

    way/1272842499   65.9m  layer 1 level 1   "Lookout Loop"
    way/1272842498   26.2m  layer 1           "Lookout Loop"
    way/1162545207   57.2m  layer 1 level 1   "Lookout Loop"
    way/1272842497   79.6m  layer 2           "Lookout Loop"
    way/1272842500   48.4m  layer 1 level 1   (approach)
    way/1162545217   44.5m  layer 1           (approach)

AND THE TOPOLOGY CLOSES, which is the proof this is really the loop and not six
unrelated footbridges. The three layer-1 ways chain end-to-end:

    (-1549,12434) -> (-1584,12451) -> (-1560,12458) -> (-1568,12420)

a 149.3m run — and way/1272842497, the layer-2 one, spans (-1549,12434) ->
(-1568,12420), i.e. between EXACTLY the two ends the lower chain leaves open.
Lower deck round one way, upper deck back the other. Extents 34x35m against a
published 33-35m outer diameter, arriving independently.

WHY IT WAS INVISIBLE, in two steps, and neither is a bug on its own:

  1. data/process.py sends any `highway=footway` carrying a `bridge` tag to the
     `bridges` layer as a BARE COORDINATE LIST and `continue`s — so the name,
     the layer and the level are dropped on the floor, and it never reaches
     `roads`. Nothing downstream can know it is walkable or what it is called.
  2. src/sgdetail.js then draws `bridges` with the pedestrian-OVERPASS recipe,
     which refuses anything twisty (`len > straight * 1.6`) or short. A ring is
     nothing but twisty, so all six were correctly refused. **The overpass
     recipe is not at fault — a loop is not an overpass.** It needs its own
     recipe, exactly as the Fort Siloso Skywalk did.

So this file does what data/relgeom.py does for relations: it is ADDITIVE. It
reads the ways out of the raw cache and writes one new key. Nothing already in
the scene is replaced, and `bridges` is left exactly as it is.

HEIGHTS ARE AUTHORED, AND `layer` IS NOT USED AS METRES.
**This is the monorail lesson and it is the most expensive mistake in this
repo's history:** data/monorail.py once read OSM's `layer` as an altitude
(`5 + 2.6*layer`), which put the guideway at 18.0m, then 7.6m forty metres
later, and that step was the "solid beam across Siloso Beach Walk at head
height". LAYER IS CROSSING ORDER, NOT ALTITUDE. It is used here for one thing
only: to decide which deck passes OVER the other. The metres below are authored
from the published EST-PHOTO range and say so.

    published   "Height above plaza UNPUBLISHED; EST-PHOTO 5-6 m"
    authored    lower deck 5.5m (midpoint of that range)
                upper deck 9.3m (lower + a 3.8m storey, so a walker clears the
                deck below with headroom — unpublished, and derived from what
                a person needs rather than from a tag)

Run:  python3 data/lookoutloop.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"][0], REG["island_origin"][1]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))

# AUTHORED — see the header. Never derived from `layer`.
LOWER_H = 5.5
UPPER_H = 9.3
DECK_W = 3.6      # authored: the published spine walkway is 4m, this is a loop


def proj(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    rawp = os.path.join(HERE, "raw", f"{a.id}.json")
    if not os.path.exists(rawp):
        print(f"  ! no raw cache at {rawp} — nothing to recover")
        return
    raw = json.load(open(rawp))
    els = raw.get("elements") or raw

    # Found BY NAME AND TAG, not by a hardcoded id list. The ids are in the
    # header so a reader can check the work, but pinning them here would mean a
    # single OSM re-split silently empties this file.
    decks = []
    for e in els:
        if e.get("type") != "way" or not e.get("geometry"):
            continue
        t = e.get("tags") or {}
        if t.get("highway") != "footway" or not t.get("bridge"):
            continue
        pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
        cx = sum(p[0] for p in pts) / len(pts)
        cz = sum(p[1] for p in pts) / len(pts)
        # the loop's own neighbourhood; the RWS footbridge 73m away is a
        # different structure and stays out
        if math.dist((cx, cz), (-1571.0, 12448.0)) > 55:
            continue
        try:
            layer = int(t.get("layer") or 1)
        except ValueError:
            layer = 1
        decks.append({
            "id": e["id"],
            "n": t.get("name") or "",
            # ORDER, NOT ALTITUDE. See the header.
            "up": 1 if layer >= 2 else 0,
            "p": [[round(x, 1), round(z, 1)] for x, z in pts],
        })

    # WHICH WAYS ARE THE LOOP, AND WHICH ARE THE WAY UP.
    #
    # First cut built every lower way level at 5.5m — including the two spurs —
    # so the ring was a walkable deck WITH NO WAY ONTO IT, floating over its own
    # plaza. "A walkway you can only look at is a picture of one" is this
    # repo's rule and it applies to its own approaches.
    #
    # The signal is in the data and needs no guessing: the four ways OSM NAMES
    # "Lookout Loop" are the loop; the two unnamed ones are the approaches.
    # Each approach is marked with WHICH END is the high one — the end nearer
    # the loop's centre — so the renderer ramps it from the ground up rather
    # than hanging it in the air.
    if decks:
        cx0 = sum(sum(p[0] for p in d["p"]) / len(d["p"]) for d in decks) / len(decks)
        cz0 = sum(sum(p[1] for p in d["p"]) / len(d["p"]) for d in decks) / len(decks)
        for x in decks:
            if x["n"] or x["up"]:
                x["ramp"] = 0
                continue
            x["ramp"] = 1
            d0 = math.dist(x["p"][0], (cx0, cz0))
            d1 = math.dist(x["p"][-1], (cx0, cz0))
            # 1 = the LAST vertex is the high end, 0 = the first one is
            x["hiEnd"] = 1 if d1 < d0 else 0

    if not decks:
        print("  ! no Lookout Loop ways found in the raw cache")
        return

    named = [d for d in decks if d["n"]]
    lower = [d for d in decks if not d["up"]]
    upper = [d for d in decks if d["up"]]

    def run(d):
        return sum(math.dist(d["p"][i], d["p"][i + 1]) for i in range(len(d["p"]) - 1))

    d = json.load(open(os.path.join(HERE, f"{a.id}.json")))
    d["lookoutloop"] = {
        "decks": decks,
        "lowerH": LOWER_H,
        "upperH": UPPER_H,
        "w": DECK_W,
        "src": "ways surveyed (OSM footway+bridge, layer 1/2, four named "
               "'Lookout Loop'); deck heights and width AUTHORED — layer is "
               "crossing order, never metres (see data/monorail.py)",
    }

    print(f"== lookoutloop {a.id}")
    print(f"   {len(decks)} ways recovered, {len(named)} of them named")
    print(f"   lower deck {len(lower)} way(s), {sum(run(x) for x in lower):5.1f} m at {LOWER_H} m")
    print(f"   upper deck {len(upper)} way(s), {sum(run(x) for x in upper):5.1f} m at {UPPER_H} m")
    for x in decks:
        print(f"     way/{x['id']:<11} {'upper' if x['up'] else 'lower'} "
              f"{run(x):5.1f} m  {x['n']}")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(os.path.join(HERE, f"{a.id}.json"), "w"), separators=(",", ":"))
    print(f"   written: {os.path.join(HERE, f'{a.id}.json')}")


if __name__ == "__main__":
    main()
