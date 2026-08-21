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
    ("foc sentosa", "FOC by the Beach",
     "Renamed: focsentosa.com 301-redirects to focbythebeach.com (verified "
     "live 2026-08-21; research/sentosa-inventory-2026.md records it three "
     "times, HIGH). Same venue, 110 Tanjong Beach Walk."),
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
    # Found 2026-08-19, closing sweep item 7's other half. Sand Bar has no OSM
    # node at all, so the anchor is SLA's own geocode for its published address
    # — OneMap search '52 Siloso Beach Walk' returns S099012 at
    # 1.252044/103.816420, and the ONLY building within 15m of that point is
    # an unnamed 60 m2 5-vert footprint 8m away (world -1887,12673, h 3.4).
    # The Coastes/Sand Bar roof mass the satellite pass could not split at z19
    # turned out to be COASTES ALONE — both halves of it sit inside Coastes'
    # own mapped footprint (Wayback 2026-08-05 z19, watershed test in
    # research/bikini-sandbar-measured.md).
    ("Sand Bar", 1.252044, 103.816420, 15,
     "research/bikini-sandbar-measured.md §SAND BAR RESOLVED — SLA OneMap "
     "geocode of 52 Siloso Beach Walk S099012 (1.252044/103.816420); unnamed "
     "60 m2 footprint 8m from the official address point."),
    # Found 2026-08-22, closing the openground queue's largest unnamed entry.
    # The 2,174 m2 footprint at Crockfords Tower's south-west foot is the
    # CASINO PODIUM — ESRI z19 (fetched 2026-08-22, tiles 413341/260315-6)
    # shows its brown tortoise-shell dome range cascading from the drum, and
    # research/rws-architecture.md §1.8 places the casino "beneath Crockfords
    # Tower", entered from the Festive Walk arcade — which is exactly the
    # 139m mapped footway running through this footprint. The name is what
    # its own fascia says in life ("CASINO", §1.8's 2023 photograph); the
    # coordinate is the footprint's own centroid inverted through proj()
    # (no OSM node exists — the ring is unnamed in OSM).
    ("Resorts World Casino", 1.255311, 103.819288, 20,
     "research/rws-architecture.md §1.8 + ESRI z19 2026-08-22 — the domed "
     "casino podium under Crockfords; 139m of Festive Walk-level footway "
     "runs through it (openground queue's unnamed 2,174 m2 entry)."),
]

# Names that must NOT survive: things that have closed.
#
# EMPTY ON PURPOSE, AND IT SHOULD STAY EMPTY. data/stale.py is where a closure
# lives: it carries a source and a date per entry, it distinguishes a building
# (keep the shell, drop the name) from a label (remove the record), and every
# check that audits provenance reads it.
#
# This list held one entry -- "rumours beach club", with no date and no source
# -- and having two homes for the same fact cost exactly what two homes always
# cost. names.py runs BEFORE stale.py, so it stripped the name first and left
# `{"p": [-2082.5, 12458.1], "k": "bar"}` sitting in `shops`: a nameless record
# that draws nothing, means nothing, and is invisible to the closure audit
# because the audit looks for the NAME. stale.py's entry for the same venue
# then matched nothing and reported nothing, so the log said the closure had
# not been applied while the name was already gone.
#
# A closure goes in stale.py. If you are about to add one here, that is the
# signal you have not read stale.py.
CLOSED = []


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
