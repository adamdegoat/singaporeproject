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
        # Moved out of INVENTED on 2026-07-28. The old line read "NOT MAPPED in
        # OSM here (checked barrier=toll_booth): needs imagery" and it was
        # wrong: LTA publishes every gantry in Singapore on data.gov.sg as a
        # surveyed LINE across the carriageway, so the position, the bearing and
        # the span are all real. Checking one tag in one source is not checking.
        (f"ERP gantries ({n('gantries')})",
         "LTA Gantry layer, data.gov.sg, cross-checked against OSM toll=yes"),
        # Also moved out of INVENTED on 2026-07-28, and for the same reason: the
        # old line said "NOT MAPPED in OSM here (checked highway=street_lamp)"
        # and a lamp went in every 96m. LTA publishes all 126,144 lamp posts in
        # Singapore. Two entries in this ledger were wrong in the same way on
        # the same day, both concluded from one tag in one source.
        (f"street lamps ({n('lamps')})", "LTA Lamp Post layer, data.gov.sg"),
        (f"street trees ({n('trees')})", "OSM natural=tree and tree_row"),
        (f"overhead bridges ({n('bridges')})", "OSM footway + bridge=yes"),
        (f"covered walkways ({n('covered')})", "OSM footway + covered=yes"),
        # The count is the tenants in the file, not the shopfronts built from
        # them. Those are different numbers on purpose: 629 of these are on a
        # floor OSM says is not the street and 399 sit in an atrium, and the
        # builder draws no street frontage for either. Reporting the file's
        # count as the built count is exactly the lie this ledger exists to
        # stop — it is what let 1,505 signs inside the masonry read as placed.
        (f"shopfront names ({n('shops')} tenants, with floor and cuisine)",
         "OSM shop/amenity name + level/addr:unit + cuisine + name:zh"),
        (f"building names ({named})", "OSM name tags"),
        (f"building heights ({real_h} of {len(B)})",
         f"{hs['osm']} from OSM tags, {hs['named']} hand-entered from published storey counts"),
        (f"lane counts ({lanes} of {len(R)} roads)", "OSM lanes / turn:lanes"),
        (f"pavement sides ({sw_tagged} of {len(R)} roads)",
         "OSM sidewalk=both/left/right/no, so kerbs only go where a pavement exists"),
        # This sat under INVENTED reading "continuous down the axis; needs
        # dual-carriageway tags" long after the code stopped doing that.
        # `hasMedianAt` follows the one-way pairs OSM maps, which IS the
        # dual-carriageway tag the fix asked for. A ledger that is hand-typed
        # goes stale in the other direction too: it can under-report as easily
        # as it flatters.
        ("central median", "only where OSM maps a one-way pair, not continuous"),
        (f"landmark massing ({massed})", "researched descriptions"),
        ("terrain", "elevation sampled along road centrelines, rooftop spikes filtered"),
    ]

    guessed = len(B) - real_h
    inv = [
        (f"building heights ({guessed} of {len(B)})",
         "type default by footprint area",
         "OSM tags cover the rest; needs hand entry or imagery"),
        (f"building appearance ({len(B) - massed})",
         "facade family from era and material where the map says, hash elsewhere",
         "247 of 532 generic facades now come from start_date or "
         "building:material; the rest is still a hash. Research each, or accept "
         "as background fabric"),
        (f"road widths ({len(R) - widths} of {len(R)})",
         "inferred from lane count, or a default per road class",
         f"only {widths} roads carry an OSM width tag; the rest needs imagery"),
        ("pedestrian railings", "continuous along both kerbs",
         "VERIFIED unmapped 2026-07-29, properly this time: Overpass over the "
         "live bboxes for barrier=fence|railing|guard_rail|wall|handrail found "
         "orchard 85 fence + 8 wall, brasbasah 11 + 15, and ZERO railing or "
         "guard_rail anywhere -- the mapped ways are property boundaries, not "
         "kerbside railings. This claim expires like the others: re-run the "
         "query before trusting it next year"),
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
