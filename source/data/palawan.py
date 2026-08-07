#!/usr/bin/env python3
"""PALAWAN — the spawn, and the three things wrong with the first frame.

This is the frame the owner loads into. `research/palawan-spawn.md` was written
against dated first-party sources on 2026-08-07 and its own verdict names what
matters, in order: **the 25 m lifeguard mast, the 20 m Capella slabs**, the
missing palms, and the generic bridge. The first two are heights and are here.
The palms are authored planting and the suspension bridge is geometry; both are
their own jobs.

WHY A FILE AND NOT A ROW IN heights.py. That table is keyed on building NAMES
and every footprint below is anonymous — OSM gives them no name and no height,
so nothing there can reach them. They are keyed on POSITION instead, which is
what `data/cablestations.py` already does for the same reason and in the same
words: "a footprint band cannot know that a footprint is a station."

THE SAFETY RULE IS cablestations.py's AND IT IS ON THE SOURCE OF THE NUMBER,
NOT ON A NAME LIST: only a height this project INVENTED (`hs == "calib"`) is
ever changed, so a surveyed tag always wins, and the corrected ones are written
`hs = "research"` so the second heights.py pass leaves them alone. Idempotent.

Run:  python3 data/palawan.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
LAT0, LON0 = 1.366666, 103.833333
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))


def xz(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


# --- 1. THE BEACH PATROL TOWER, WHICH WE DRAW AS A 25 m MAST ----------------
#
# research/palawan-spawn.md §1-ledger row 3: live Overpass puts an
# `emergency=lifeguard` node INSIDE this exact polygon. It is a two-storey
# timber hut, 4.0 x 4.1 m, about 4.5-5.0 m to the ridge. We stand a 25 m mast
# on the open sand 156 m from the spawn point, in frame.
#
# 4.8 m is the middle of the researched 4.5-5.0 m. The radius comes from the
# measured footprint rather than from the mast: a 4.0 x 4.1 m plan is r ~= 2.05.
TOWER_AT = (1.24812, 103.82287)
TOWER_H = 4.8
TOWER_R = 2.05
TOWER_WHY = ("Beach Patrol lifeguard hut, 4.0x4.1 m, 4.5-5.0 m to the ridge "
             "(research/palawan-spawn.md ledger row 3)")

# --- 2. CAPELLA'S VILLA TERRACES, DRAWN AS A ROW OF SLABS -------------------
#
# Row 4 of the same ledger. Eight footprints carrying `h0: 20` — process.py's
# "no height, no storeys" default — identified by position against 2026
# satellite as Capella's villa terraces: long, low, TWO storeys, 8-9 m EST,
# stepping down a wooded slope. We draw 6-9 storey slabs on the ridge behind
# the beach, the nearest 74 m from where the player lands.
#
# 8.5 m is the middle of the researched 8-9 m, AND IT IS CORROBORATED IN OUR
# OWN DATA rather than only asserted: two footprints in the same cluster
# already sit at 8.5 m, and Capella's OSM-tagged blocks nearby read h: 10.2
# from `building:levels`. The fault is confined to the untagged ones, which is
# exactly what the `hs == "calib"` guard selects.
VILLA_BOX = (1.2511, 103.8221, 1.2495, 103.8230)   # lat0, lon0, lat1, lon1
VILLA_PAD = 50.0
VILLA_H = 8.5
VILLA_WHY = ("Capella villa terrace, 2 storeys, 8-9 m EST "
             "(research/palawan-spawn.md ledger row 4)")

# --- 3. THE PALAWAN KIDZ CITY / KIDZANIA HANGAR ----------------------------
#
# Row 5. One big volume with a broad seamed gable roof, 10-13 m to the ridge
# EST, carrying the same 20.4 m default. 11.5 m is the middle of that range.
#
# AND READ stale.py's HEADER NOTE ON KIDZANIA BEFORE TOUCHING THIS. The shed is
# OPEN — it reopened 16 May 2024 — and we were deleting its label on the
# authority of the very file that says to build it.
HANGAR_AT = (1.25130, 103.82032)
HANGAR_MIN_AREA = 2000
HANGAR_H = 11.5
HANGAR_WHY = ("Palawan Kidz City / KidZania shed, one volume, 10-13 m to the "
              "ridge EST (research/palawan-spawn.md ledger row 5)")


def centroid(ring):
    return (sum(q[0] for q in ring) / len(ring),
            sum(q[1] for q in ring) / len(ring))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    if a.id != "sentosa":
        return
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    print(f"== palawan {a.id}")
    changed = 0

    # 1. the mast
    tgt = xz(*TOWER_AT)
    for t in d.get("towers") or []:
        p = t.get("p")
        if not p or math.dist(p, tgt) > 25.0:
            continue
        if t.get("hs") == "research":
            continue                       # already corrected; idempotent
        old_h, old_r = t.get("h"), t.get("r")
        if old_h is None or old_h <= TOWER_H + 0.1:
            continue                       # nothing to lower
        t["h"], t["r"] = TOWER_H, TOWER_R
        t["h0"], t["r0"] = old_h, old_r
        t["hs"] = "research"
        t["hsrc"] = TOWER_WHY
        print(f"   tower    {old_h:.1f}m r{old_r:.1f} -> {TOWER_H:.1f}m "
              f"r{TOWER_R:.2f}  — {TOWER_WHY}")
        changed += 1

    # 2. the villa terraces
    c0 = xz(VILLA_BOX[0], VILLA_BOX[1])
    c1 = xz(VILLA_BOX[2], VILLA_BOX[3])
    lo_x, hi_x = min(c0[0], c1[0]) - VILLA_PAD, max(c0[0], c1[0]) + VILLA_PAD
    lo_z, hi_z = min(c0[1], c1[1]) - VILLA_PAD, max(c0[1], c1[1]) + VILLA_PAD
    hangar = xz(*HANGAR_AT)
    villas = 0
    for b in d.get("buildings") or []:
        ring = b.get("p") or []
        if not ring or not isinstance(ring[0], list):
            continue
        cx, cz = centroid(ring)
        if not (lo_x <= cx <= hi_x and lo_z <= cz <= hi_z):
            continue
        # ONLY A HEIGHT WE INVENTED. A surveyed tag wins, always.
        if b.get("hs") != "calib" or b.get("h0") != 20:
            continue
        if (b.get("h") or 0) <= VILLA_H + 0.1:
            continue
        old = b["h"]
        b["h"] = VILLA_H
        b["hs"] = "research"
        b["hsrc"] = VILLA_WHY
        print(f"   villa    {old:5.1f}m -> {VILLA_H:.1f}m  "
              f"a={b.get('a')}  at ({cx:.0f},{cz:.0f})")
        villas += 1
        changed += 1
    if villas:
        print(f"   {villas} Capella villa terrace(s) — {VILLA_WHY}")

    # 3. the hangar
    for b in d.get("buildings") or []:
        ring = b.get("p") or []
        if not ring or not isinstance(ring[0], list):
            continue
        if (b.get("a") or 0) < HANGAR_MIN_AREA:
            continue
        cx, cz = centroid(ring)
        if math.dist((cx, cz), hangar) > 70.0:
            continue
        if b.get("hs") != "calib":
            continue
        if (b.get("h") or 0) <= HANGAR_H + 0.1:
            continue
        old = b["h"]
        b["h"] = HANGAR_H
        b["hs"] = "research"
        b["hsrc"] = HANGAR_WHY
        print(f"   hangar   {old:5.1f}m -> {HANGAR_H:.1f}m  a={b.get('a')}"
              f"  — {HANGAR_WHY}")
        changed += 1

    print(f"   {changed} corrected")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    if changed:
        json.dump(d, open(path, "w"), separators=(",", ":"))
        print(f"   written: {path}")


if __name__ == "__main__":
    main()
