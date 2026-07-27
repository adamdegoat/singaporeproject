#!/usr/bin/env python3
"""How much of a district comes from the real map, and how much did we invent?

    python3 accuracy.py orchard

The point of this project is riding the real city, so "does it look good" is the
wrong question to stop on. Every feature is classified REAL (a surveyed position
or a published figure) or INVENTED (placed by a rule we chose). Anything invented
is a known gap, listed with what would fix it.

The counts are read out of the scene, not typed in here. A hand-written ledger
goes stale the moment the district grows, and a stale ledger is worse than none:
it reports a district as finished that is not.
"""
import json, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))


def load(did):
    for p in (os.path.join(HERE, "districts", f"{did}.json"), os.path.join(HERE, f"{did}.json")):
        if os.path.exists(p):
            return json.load(open(p)), p
    sys.exit(f"no scene for '{did}'")


def build_ledger(d):
    B = d.get("buildings", [])
    R = d.get("roads", [])
    hs = collections.Counter(b.get("hs", "guess") for b in B)
    real_h = hs["osm"] + hs["named"]
    named = sum(1 for b in B if b.get("n"))
    massed = sum(1 for b in B if b.get("k"))
    lanes = sum(1 for r in R if r.get("lanes"))
    widths = sum(1 for r in R if r.get("wtag"))
    sw_tagged = sum(1 for r in R if r.get("sidewalk"))

    def n(k):
        return len(d.get(k) or [])

    real = [
        (f"building footprints ({len(B)})", "OSM surveyed traces"),
        (f"road network ({len(R)} ways)", "OSM centrelines"),
        ("main street axis", "stitched from OSM fragments"),
        (f"pedestrian crossings ({n('crossings')})", "OSM highway=crossing"),
        (f"traffic signals ({n('signals')})", "OSM highway=traffic_signals"),
        (f"bus stops ({n('busstops')})", "OSM highway=bus_stop, with names"),
        (f"MRT entrances ({n('mrt')})", "OSM railway=subway_entrance, with exit letters"),
        (f"taxi ranks ({n('taxis')})", "OSM amenity=taxi"),
        (f"street trees ({n('trees')})", "OSM natural=tree and tree_row"),
        (f"overhead bridges ({n('bridges')})", "OSM footway + bridge=yes"),
        (f"covered walkways ({n('covered')})", "OSM footway + covered=yes"),
        (f"shopfront names ({n('shops')})", "OSM shop/amenity names"),
        (f"building names ({named})", "OSM name tags"),
        (f"building heights ({real_h} of {len(B)})",
         f"{hs['osm']} from OSM tags, {hs['named']} hand-entered from published storey counts"),
        (f"lane counts ({lanes} of {len(R)} roads)", "OSM lanes / turn:lanes"),
        (f"pavement sides ({sw_tagged} of {len(R)} roads)",
         "OSM sidewalk=both/left/right/no, so kerbs only go where a pavement exists"),
        (f"landmark massing ({massed})", "researched descriptions"),
        ("terrain", "elevation sampled along road centrelines, rooftop spikes filtered"),
    ]

    guessed = len(B) - real_h
    inv = [
        (f"building heights ({guessed} of {len(B)})",
         "type default by footprint area",
         "OSM tags cover the rest; needs hand entry or imagery"),
        (f"building appearance ({len(B) - massed})",
         "facade family chosen by footprint hash",
         "research each, or accept as background fabric"),
        (f"road widths ({len(R) - widths} of {len(R)})",
         "inferred from lane count, or a default per road class",
         f"only {widths} roads carry an OSM width tag; the rest needs imagery"),
        ("ERP gantries", "2, placed at chosen arclengths",
         "NOT MAPPED in OSM here (checked barrier=toll_booth): needs imagery"),
        ("street lamps", "at intervals along each road",
         "NOT MAPPED in OSM here (checked highway=street_lamp)"),
        ("pedestrian railings", "continuous along both kerbs",
         "OSM barrier=fence/guard_rail where mapped"),
        ("central median and planting", "continuous down the axis",
         "real Orchard has median only in parts; needs dual-carriageway tags or imagery"),
        (f"pavement widths, and sides on the other {len(R) - sw_tagged} roads",
         "fixed offset from the kerb, assumed both sides where untagged",
         "no OSM tag records pavement WIDTH; sides are now real where tagged"),
        ("planters, bins, banners, bollards", "regular intervals",
         "mostly unmapped; acceptable as dressing"),
        ("traffic and crowd behaviour", "plausible simulation",
         "not a mapping question"),
    ]
    return real, inv


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "orchard"
    d, path = load(did)
    real, inv = build_ledger(d)

    print(f"== accuracy report: {did}")
    print()
    print(f"REAL - from surveyed data or published figures  ({len(real)})")
    for name, src in real:
        print(f"   + {name:38s} {src}")
    print()
    print(f"INVENTED - placed by a rule we chose  ({len(inv)})")
    for name, src, fix in inv:
        print(f"   - {name:38s} {src}")
        print(f"     {'':38s} fix: {fix}")
    print()
    pct = 100 * len(real) / (len(real) + len(inv))
    print(f"   {len(real)}/{len(real)+len(inv)} feature classes come from real data ({pct:.0f}%).")
    print("   Anything under INVENTED is a known gap, not a finished feature.")


if __name__ == "__main__":
    main()
