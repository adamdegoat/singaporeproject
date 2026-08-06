"""THE SENTOSA EXPRESS STATIONS — the main way around the island, and absent.

The owner, 2026-08-06: "u better check all the places that are in sentosa are
there and also can be explore ya."

Cross-checking our 193 named places against the island's real ones turned up
Beach Station, Imbiah and Resorts World as missing. They are not missing from
OSM — they are three tagged nodes in the raw cache:

    node  railway=station, public_transport=station, station=monorail  "Imbiah"
    node  railway=station, public_transport=station, station=monorail  "Beach"
    node  railway=station, public_transport=station                    "Resorts World"

WHAT WENT WRONG IS WORSE THAN A DROPPED LAYER. src/wayfind.js reads
`data.termini` for "the monorail stations, because 'how do I get to the other
end' is the first thing anyone asks about Sentosa" — and `termini` is a ROAD
GEOMETRY layer: 27 records shaped `{p, k:"turn", w:3.0}`, not one of which has
a name. So `if (!t.n) continue` dropped all 27, every time, and the comment
described an intention that the code could never carry out.

That is the same shape as the cable-car platform remap (SESSION 8): code that
reads plausibly, was reasoned about, and never once did anything.

Monorail stations go in `attractions` with `k="station"` so they get a floating
label, an arrival panel and a travel pin — the three things that make a place
somewhere you can go to rather than something you ride past.

Run:  python3 data/railstations.py sentosa [--dry-run]
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

# OSM names the stops as they are signed; the Sentosa Express calls them
# "<name> Station" on every map and every platform sign.
SUFFIX = " Station"
LINES = {
    "Beach": "Sentosa Express, the beach end of the line.",
    "Imbiah": "Sentosa Express, for the luge, Fort Siloso and Imbiah Lookout.",
    "Resorts World": "Sentosa Express, for Resorts World and Universal Studios.",
    "Waterfront": "Sentosa Express, on the Waterfront promenade.",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    raw = json.load(open(os.path.join(HERE, "raw", f"{a.id}.json")))
    els = raw.get("elements") or raw

    have = {str(o.get("n") or "") for o in (d.get("attractions") or [])}
    add = []
    for e in els:
        t = e.get("tags") or {}
        if t.get("railway") != "station" or not t.get("name"):
            continue
        if "lat" not in e or "lon" not in e:
            continue
        nm = str(t["name"]).strip()
        full = nm if nm.endswith("Station") else nm + SUFFIX
        if full in have:
            continue
        x = (e["lon"] - LON0) * M_LON
        z = (LAT0 - e["lat"]) * M_LAT
        add.append({"n": full, "k": "station",
                    "p": [round(x, 1), round(z, 1)],
                    "t": LINES.get(nm, "Sentosa Express station.")})

    print(f"== railstations {a.id}")
    if not add:
        print("   nothing to add — every station is already a place")
        return
    for s in add:
        print(f"   {s['n']:<26} at {s['p'][0]:8.1f},{s['p'][1]:8.1f}   {s['t']}")
    d.setdefault("attractions", []).extend(add)
    print(f"   {len(add)} station(s) added as places")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
