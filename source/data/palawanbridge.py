#!/usr/bin/env python3
"""THE PALAWAN SUSPENSION BRIDGE — the object that makes the spawn frame.

`research/palawan-spawn.md` §4.2: **"The single most recognisable object at
Palawan. Get this right and the frame is unmistakable."** It is 78 m from the
spawn point and we were drawing it as `pedBridge` — a plain white slab with a
box under it, vetted at `shots/street/islet.shot1`.

WHAT THE MAP GIVES US, AND IT IS THE WHOLE ROUTE. Three `bridges` entries chain
end to end, and every one matches a researched OSM way length to 0.2 m:

    63.9 m  (-1322,13111) -> (-1276,13067)   main suspended span  (research 64.1, way/42067600)
    10.0 m  (-1276,13067) -> (-1269,13060)   approach             (research 10.0, way/689911760)
    15.4 m  (-1269,13060) -> (-1258,13049)   approach             (research 15.5, way/689911755)
    ------------------------------------------------------------------------
    89.3 m end to end against a researched ~90 m, bearing 046 deg, islet to beach.

So the ROUTE is Layer 1 truth and is not touched. Everything below the deck is
Layer 2, authored from the photographs the research reads, and it says so.

WHY THIS FILE REMOVES THE WAYS FROM `bridges`. `sgdetail.js` builds an overhead
road crossing for any `bridges` entry between 22 m and 90 m that spans road or
water, which the 64 m main span does — the two approaches are already under the
22 m floor and were never drawn. Leaving it in would stand the generic slab
inside the real structure. The route is kept here instead, so nothing is lost.

WHAT IS PUBLISHED AND WHAT IS NOT — the research is explicit and so is this:

  * ROUTE, the three lengths, the bearing, the 1.2 m deck width and the ~1-1.5 m
    deck-to-water clearance are DERIVED from OSM and from measured photographs.
  * The catenary sag, the pylon height within the researched 5-8 m band, and
    every material is AUTHORED. No engineering drawing of this bridge exists;
    the research searched for the contractor, engineer and architect and found
    none in SDC, NAS, NLB, Roots or the press.
  * "250 metres long, 25 metres high" circulates on holidify.com and is FALSE —
    the towers behind it are 15 m and dwarf it in every photograph. Do not use it.

Run:  python3 data/palawanbridge.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# The three ways, identified by their endpoints rather than by index — an index
# into `bridges` is not stable across a rebuild.
ISLET_END = (-1322.0, 13111.0)
BEACH_END = (-1258.0, 13049.0)
# TWO TOLERANCES, AND THEY ARE NOT THE SAME QUESTION. Finding which way is the
# terminus is a fuzzy match against a coordinate typed into this file, so it is
# loose. JOINING one way to the next is not fuzzy at all — these ways share
# their end nodes exactly — and a loose join is a bug: at 12 m the walk stepped
# straight from the main span's end to the FAR end of the 10 m approach, 9.9 m
# away, and swallowed that approach whole. 89.3 m of chain out of 2 ways
# instead of 3, and the length still looked right.
TOL = 12.0
JOIN_TOL = 3.0

# DECK WIDTH — DERIVED. research §4.2: the bridge outline's perimeter (181.9 m)
# minus 2 x 90 m of side leaves ~1.2 m per end cap, corroborated against walkers
# in photographs.
DECK_W = 1.2
# CLEARANCE — DERIVED from a 2007 crowd photograph that puts deck-to-water well
# under one person-height, and from the sandbar under the span drying at low
# tide. The renderer holds the deck this far above the sheet it actually drew.
CLEAR = 1.25
# SAG — AUTHORED. "The deck follows the cable sag; there is no stiffening truss,
# and it sways." A shallow dip: enough to read as a catenary from the beach,
# not so much that the middle wades.
SAG = 1.45
# RAIL — DERIVED. Knotted rope net "about 0.9-1.1 m high" with a rope handrail
# along the top edge.
RAIL = 1.0
# PYLONS — DERIVED band, AUTHORED value. "Massive pale grey trunk-like columns,
# roughly 5-8 m tall, splayed like a candelabra", carrying a trunk lintel.
PYLON_H = 6.4
# HANGER SPACING — DERIVED. Counted against standing adults in a 2007 crowd
# photograph: about 2 m at deck level.
HANGER_D = 2.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    if a.id != "sentosa":
        return
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    print(f"== palawanbridge {a.id}")

    if d.get("palawanbridge"):
        print("   already authored — nothing to do")
        return

    # Collect the chain by walking endpoints from the islet end.
    pool = []
    for idx, line in enumerate(d.get("bridges") or []):
        if not line or len(line) < 2:
            continue
        pool.append((idx, [tuple(q) for q in line]))

    chain = None
    for idx, line in pool:
        if math.dist(line[0], ISLET_END) < TOL:
            chain = [(idx, line)]
            break
        if math.dist(line[-1], ISLET_END) < TOL:
            chain = [(idx, list(reversed(line)))]
            break
    if chain is None:
        print("   ! no bridge way starts at the islet end — refusing to guess")
        return

    used = {chain[0][0]}
    while True:
        tail = chain[-1][1][-1]
        if math.dist(tail, BEACH_END) < JOIN_TOL:
            break
        nxt = None
        for idx, line in pool:
            if idx in used:
                continue
            if math.dist(line[0], tail) < JOIN_TOL:
                nxt = (idx, line)
                break
            if math.dist(line[-1], tail) < JOIN_TOL:
                nxt = (idx, list(reversed(line)))
                break
        if nxt is None:
            print(f"   ! the chain stops at {tail} short of the beach — "
                  f"refusing to invent the rest")
            return
        chain.append(nxt)
        used.add(nxt[0])

    pts = list(chain[0][1])
    for _, line in chain[1:]:
        pts += line[1:]
    total = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    span = math.dist(chain[0][1][0], chain[0][1][-1])
    print(f"   chained {len(chain)} way(s), {len(pts)} points, "
          f"{total:.1f} m end to end (research ~90 m)")
    print(f"   main suspended span {span:.1f} m (research 64.1 m)")

    # The pylons stand at the two ends of the MAIN SPAN — that is where the
    # cables are anchored and what the photographs show.
    pyl = [list(chain[0][1][0]), list(chain[0][1][-1])]

    d["palawanbridge"] = {
        "p": [[round(x, 1), round(z, 1)] for x, z in pts],
        "nspan": len(chain[0][1]),          # how many points are the main span
        "w": DECK_W, "clear": CLEAR, "sag": SAG, "rail": RAIL,
        "pylon": PYLON_H, "hang": HANGER_D,
        "pyl": [[round(v, 1) for v in p] for p in pyl],
        "n": "Palawan Suspension Bridge",
        "src": ("route DERIVED from OSM ways 42067600/689911760/689911755; "
                "deck width and clearance DERIVED from research/palawan-spawn.md "
                "4.2; sag, pylon height and materials AUTHORED from its "
                "photographs — no engineering drawing of this bridge exists"),
    }

    # THE WAYS STAY IN `bridges`, AND THE FIRST VERSION REMOVED THEM.
    #
    # It looked right: the generic slab recipe must not stand inside the real
    # structure, so take its input away. But `data/navcheck.py` line 53 reads
    # `WALKABLE = ["roads", "steps", "bridges"]` — a bridge deck is something a
    # player crosses, and this crossing is not in `roads` at all. Removing the
    # three ways cut the islet off the walkable network: **N1 unreachable
    # 0.63% -> 0.82%, 3 stranded islands -> 4.** The data was telling the truth
    # and I deleted it to fix a drawing problem.
    #
    # So the suppression belongs where the drawing is. `src/sgdetail.js` skips
    # any `bridges` line this spec already covers, and the map keeps saying what
    # is true: you can walk to the Southernmost Point.

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
