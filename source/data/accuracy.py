#!/usr/bin/env python3
"""How much of a district comes from the real map, and how much did we invent?

    python3 accuracy.py orchard

The point of this project is riding the real city, so "does it look good" is the
wrong question to stop on. Every feature is classified REAL (a surveyed position
or a published figure) or INVENTED (placed by a rule we chose). Anything invented
is a known gap, listed with what would fix it.
"""
import json, math, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))


def load(did):
    for p in (os.path.join(HERE, "districts", f"{did}.json"), os.path.join(HERE, f"{did}.json")):
        if os.path.exists(p):
            return json.load(open(p)), p
    sys.exit(f"no scene for '{did}'")


# feature -> (source, fix if invented)
LEDGER = [
    ("building footprints", "REAL", "OSM surveyed traces", None),
    ("road network + centrelines", "REAL", "OSM ways", None),
    ("Orchard Road axis", "REAL", "stitched from OSM fragments", None),
    ("pedestrian crossings", "REAL", "OSM highway=crossing", None),
    ("traffic signals", "REAL", "OSM highway=traffic_signals", None),
    ("bus stops", "REAL", "OSM highway=bus_stop, with names", None),
    ("MRT entrances", "REAL", "OSM railway=subway_entrance, with exit letters", None),
    ("taxi ranks", "REAL", "OSM amenity=taxi", None),
    ("street trees", "REAL", "OSM natural=tree and tree_row", None),
    ("landmark heights (~40)", "REAL", "published storey counts, hand-entered", None),
    ("landmark massing (39 buildings)", "REAL", "researched descriptions", None),
    ("overhead pedestrian bridges", "REAL", "OSM footway + bridge=yes", None),
    ("covered walkways", "REAL", "OSM footway + covered=yes", None),
    ("shopfront signage", "REAL", "OSM shop/amenity names, 472 tenants", None),

    ("road WIDTHS", "INVENTED", "inferred from lane tags or a default per class",
     "use OSM width=* where tagged; measure the rest from imagery"),
    ("most building heights (~200)", "INVENTED", "type defaults, not surveyed",
     "OSM building:levels where present; hand-enter the rest by area"),
    ("most building APPEARANCE (~200)", "INVENTED", "facade family chosen by footprint hash",
     "research each, or accept as background fabric"),
    ("ERP gantries", "INVENTED", "2, placed at chosen arclengths",
     "NOT MAPPED in OSM for this bbox (checked barrier=toll_booth): needs imagery"),
    ("street lamps", "INVENTED", "every 34m along the axis",
     "NOT MAPPED in OSM for this bbox (checked highway=street_lamp)"),
    ("pedestrian railings", "INVENTED", "continuous along both kerbs",
     "OSM barrier=fence/guard_rail where mapped"),
    ("central median + planting", "INVENTED", "continuous down the axis",
     "real Orchard has median only in parts; needs imagery or dual-carriageway tags"),
    ("road markings", "INVENTED", "generic lane pattern",
     "derive lane count and turn arrows from OSM lanes / turn:lanes"),
    ("pavement widths", "INVENTED", "fixed offset from the kerb",
     "OSM sidewalk tags, or footway ways where separately mapped"),

    ("terrain", "INVENTED", "completely flat",
     "Orchard Road genuinely slopes; needs an elevation source"),
    ("planters, bins, banners, bollards", "INVENTED", "regular intervals",
     "mostly unmapped; acceptable as dressing"),
    ("traffic and crowd behaviour", "INVENTED", "plausible simulation",
     "not a mapping question"),
]


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "orchard"
    data, path = load(did)

    counts = {
        "crossings": len(data.get("crossings", [])),
        "signals": len(data.get("signals", [])),
        "busstops": len(data.get("busstops", [])),
        "mrt": len(data.get("mrt", [])),
        "taxis": len(data.get("taxis", [])),
        "trees": len(data.get("trees", [])),
        "buildings": len(data.get("buildings", [])),
        "roads": len(data.get("roads", [])),
    }
    print(f"== accuracy report: {did}")
    print("   real positions in the scene: "
          + ", ".join(f"{k} {v}" for k, v in counts.items()))
    print()

    real = [r for r in LEDGER if r[1] == "REAL"]
    inv = [r for r in LEDGER if r[1] == "INVENTED"]
    print(f"REAL — from surveyed data or published figures  ({len(real)})")
    for name, _, src, _ in real:
        print(f"   + {name:36s} {src}")
    print()
    print(f"INVENTED — placed by a rule we chose  ({len(inv)})")
    for name, _, src, fix in inv:
        print(f"   - {name:36s} {src}")
        if fix:
            print(f"     {'':36s} fix: {fix}")
    print()
    pct = 100 * len(real) / (len(real) + len(inv))
    print(f"   {len(real)}/{len(real)+len(inv)} feature classes come from real data ({pct:.0f}%).")
    print("   Anything under INVENTED is a known gap, not a finished feature.")


if __name__ == "__main__":
    main()
