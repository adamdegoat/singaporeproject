"""CURRENT NAMES — the map is not always up to date, and this world is dated.

The owner: "it needs to be fucking sentosa." A player reads names off gates,
facades and floating labels, so a name that changed two years ago is as visible
a defect as a wrong roof.

OpenStreetMap is edited by volunteers and lags rebrandings, and Sentosa
rebrands constantly. Each entry here is a rename that HAS HAPPENED, with the
date and the source; nothing is renamed on a hunch, and nothing is renamed
because a newer name sounds better.

This runs on the built scene, so it also catches the name in the shopfront
signage, the entrance gates and the 3D place labels, all of which read the same
field.

Run:  python3 data/names.py sentosa [--dry-run]
"""
import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# (match, new name, why)
RENAMES = [
    ("hard rock hotel", "The Laurus",
     "Hard Rock Hotel Singapore closed July 2025 and reopened October 2025 as "
     "The Laurus, a Luxury Collection Resort — 183 suites over five storeys. "
     "asgam.com 2025-10-02, rwsentosa.com/en/the-laurus-singapore."),
    ("the forum", "WEAVE",
     "RWS's Forum retail street was rebuilt and reopened as WEAVE in July 2025. "
     "rwsentosa.com."),
]
# NAMES THE MAP IS MISSING — a building that stands, with a documented
# business in it, and no name on its OSM footprint. A rename cannot reach it
# (there is nothing to match) and authored.json cannot either (that file is
# for footprints that do not exist; this one does). Matched by PLACE: the
# nearest UNNAMED building footprint within max_m of the entry's own OSM
# node, projected with the island origin. Same bar as every list in this
# file: a citation per entry, nothing added on a hunch.
#
# Found 2026-08-18: Tanjong Beach Club is in the world as an unnamed 1,154 m2
# building 12m from its own OSM node (published floor area 1,114.84 m2 — a
# 3.5% match), so the beachVenue recipe written FOR it had never once run.
ADDS = [
    ("Tanjong Beach Club", 1.24338, 103.82803, 30,
     "research/sentosa-inventory-2026.md — 120 Tanjong Beach Walk S098942, "
     "OSM node 1.24338/103.82803, floor area 1,114.84 m2, reopened Feb 2025. "
     "Footprint exists unnamed; measured 12m from the node, area within 3.5%."),
]

# Names that must NOT survive: things that have closed. Kept as a list rather
# than deleted silently, because a demolished thing and a renamed thing are
# different facts and the next person needs to see which is which.
CLOSED = [
    ("rumours beach club",
     "Closed January 2026. Do not build; do not label."),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    hits, closed = {}, {}
    layers = ["buildings", "attractions", "shops", "green", "mrt", "parkfurn"]
    for layer in layers:
        v = d.get(layer)
        if not isinstance(v, list):
            continue
        keep = []
        for o in v:
            if not isinstance(o, dict) or not o.get("n"):
                keep.append(o)
                continue
            low = str(o["n"]).lower()
            gone = False
            for (needle, why) in CLOSED:
                if needle in low:
                    closed[needle] = closed.get(needle, 0) + 1
                    gone = True
                    break
            if gone:
                # keep the building, lose the name: the structure may still
                # stand, the business does not
                o.pop("n", None)
                keep.append(o)
                continue
            for (needle, new, why) in RENAMES:
                if needle in low:
                    o["n"] = new
                    hits[needle] = hits.get(needle, 0) + 1
                    break
            keep.append(o)
        d[layer] = keep
    # the cableway stations carry names too
    for s in (((d.get("cableway") or {}).get("stations")) or []):
        if not isinstance(s, dict) or not s.get("n"):
            continue
        low = str(s["n"]).lower()
        for (needle, new, why) in RENAMES:
            if needle in low:
                s["n"] = new
                hits[needle] = hits.get(needle, 0) + 1

    # missing names: nearest unnamed building within max_m of the entry's node
    import math
    LAT0, LON0 = 1.366666, 103.833333
    M_LAT = 110574.0
    M_LON = 111320.0 * math.cos(math.radians(LAT0))
    added = []
    for (name, lat, lon, max_m, why) in ADDS:
        ex, ez = (lon - LON0) * M_LON, (LAT0 - lat) * M_LAT
        best, bd = None, max_m
        already = False
        for b in (d.get("buildings") or []):
            if not isinstance(b, dict) or not b.get("p"):
                continue
            pts = b["p"]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            dist = math.hypot(cx - ex, cz - ez)
            if b.get("n"):
                # the name is already there (a re-run, or OSM caught up)
                if str(b["n"]).lower() == name.lower() and dist < max_m:
                    already = True
                continue
            if dist < bd:
                best, bd = b, dist
        if already:
            continue
        if best is not None:
            best["n"] = name
            added.append((name, bd))

    print(f"== names {a.id}")
    if not hits and not closed and not added:
        print("   nothing to rename (already current)")
    for (name, dist) in added:
        print(f"   named  \"{name}\" onto its unnamed footprint ({dist:.0f} m from node)")
    for (needle, new, why) in RENAMES:
        if needle in hits:
            print(f"   {hits[needle]:3d} x  \"{needle}\" -> \"{new}\"")
    for (needle, why) in CLOSED:
        if needle in closed:
            print(f"   {closed[needle]:3d} x  \"{needle}\" name removed (closed)")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
