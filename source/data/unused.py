#!/usr/bin/env python3
"""Every tag the map gives us, and whether we read it.

    python3 data/unused.py            # all live districts
    python3 data/unused.py orchard

WHY THIS EXISTS

Seven times now this project has found real surveyed data sitting in the extract
unread while the thing it describes was being invented instead:

    crossings        placed at invented intervals while OSM had the positions
    sidewalk=        kerbs went down both sides of every street regardless
    oneway=          traffic spawned half its fleet head-on
    level=           1,043 tenants' floor numbers, all put on the ground floor
    surface=         1,986 ways, every one drawn as asphalt
    maxspeed=        1,254 ways, traffic speed invented anyway
    lanes:forward=   546 ways, the exact split inferred instead

There WAS a check for this -- A2, "real data present but unused" -- and it read
a hand-typed list of three items (crossings, mrt, shops) and passed at zero
through every one of the seven. A hand-typed list of what to look for cannot
find the thing nobody thought to list. The accuracy ledger had exactly this
disease and was fixed by reading the scene file; this does the same for tags.

HOW IT WORKS

It enumerates what the RAW extract actually carries, then requires every tag
above a usage threshold to be either carried into the scene file or named in
IGNORED with a reason. Silence is not an option: a tag nobody has decided about
fails the gate. That is the whole point -- the failure mode is always a tag
nobody thought about, so the default has to be loud.
"""
import json, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))

# A tag is worth an opinion once this share of its element class carries it.
THRESHOLD = 0.05

# Tags we have deliberately decided not to read, each with the reason. Adding a
# line here is a decision and should look like one; leaving a tag out of both
# this and the scene file is what the gate is for.
IGNORED = {
    "highway":        "IS the road class; carried as `k`",
    "building":       "IS the building; carried by existing at all",
    "source":         "provenance of the OSM edit, not of the thing",
    "source:date":    "provenance",
    "note":           "mapper's note to other mappers",
    "fixme":          "mapper's note to other mappers",
    "created_by":     "editor software",
    "attribution":    "licence metadata",
    "ref":            "route number; no signage renders it yet",
    "int_ref":        "international route number",
    "old_name":       "historic name; the district is present-day",
    "alt_name":       "secondary name; `name` is what the signs show",
    "name:ms": "other-language name", "name:ta": "other-language name",
    "name:zh": "carried on shopfront fascias where present",
    "wikidata":       "external identifier",
    "wikipedia":      "external identifier",
    "addr:postcode":  "not shown anywhere in the world",
    "addr:city":       "the whole scene is one city",
    "addr:country":    "the whole scene is one country",
    "operator":       "who runs it; not visible from the street",
    "opening_hours":  "not modelled; nothing in the world is ever shut",
    "phone":          "not visible from the street",
    "website":        "not visible from the street",
    "smoothness":     "ride model does not simulate surface quality",
    "lit":            "street lamps come from the surveyed LTA layer instead",
    "foot": "access flag", "bicycle": "access flag", "motor_vehicle": "access flag",
    "access": "access flag", "motorcar": "access flag", "psv": "access flag",
    "bus": "access flag", "taxi": "access flag", "hgv": "access flag",
    "oneway:bicycle": "access flag",
    "check_date":     "survey date",
    "building:levels": "carried into the height via `h`",
    "height":          "carried into `h`",
    "layer":           "read when dropping underground footprints",
    "covered":         "read for the covered walkway",
    "area":            "geometry hint, not appearance",
    "barrier":         "read where mapped as a railing",
    "service":         "sub-class of a service road; all service roads look alike",
    "junction":        "roundabout handling is geometric, from the way itself",
    "footway":         "sidewalk-vs-crossing sub-class; both come from the node layer",
    "public_transport": "schema tag; the thing itself is highway=bus_stop",
    "traffic_signals:sound":     "audio cue for the visually impaired; no audio cue is modelled",
    "traffic_signals:vibration": "tactile cue on the button; not visible",
    "button_operated": "the push button is on the pole and is 4cm across",
    "location":        "underground/overground hint on a node",
    "name:en":         "English name; `name` is already English in Singapore",
    "crossing":        "crossing TYPE; carried via the marked/unmarked split",
    "wikimedia_commons": "a photo link", "image": "a photo link",
    "mapillary":       "a street-level photo id",
    "wheelchair":      "accessibility of the interior; nothing has an interior",
}

# Tags carried in a structure the field scan cannot see -- a positional array
# rather than a dict -- with where they live.
CARRIED_ELSEWHERE = {
    "tactile_paving": "crossings[] third element; drawn as the yellow kerb pad",
}

# Tags we SHOULD read and have not yet. These print every run and do not fail
# the gate, because a deferral with a date and a reason is a decision, while
# quietly folding them into IGNORED is how this project lost seven of them in
# the first place. Empty this list, do not grow it.
DEFERRED = {
    "maxspeed":            "traffic speed is invented; 1,254 ways carry a real limit",
    "lanes:forward":       "exact directional split; we infer it from lanes + oneway",
    "lanes:backward":      "same",
    "turn:lanes:forward":  "per-direction turn arrows; we use the undirected turn:lanes",
    "turn:lanes:backward": "same",
    "addr:housenumber":    "no building-number signage is modelled anywhere yet",
    "addr:street":         "same",
    "route_ref":           "the real bus numbers at each stop; the flag shows none",
    "kerb":                "lowered/flush/raised; every kerb is drawn the same",
    "crossing:island":     "a pedestrian refuge is real geometry we do not build",
    "crossing:markings":   "zebra vs ladder vs dashes; all drawn as zebra",
    "shelter":             "OSM says WHICH stops have one; we decide by frontage width",
    "bench":               "same, for benches",
    "bin":                 "same, for bins",
    "busway:left":         "Singapore's red bus lanes; markings work, very visible",
    "busway:right":        "same",
    "lanes:bus":           "same",
    "lanes:bus:conditional": "same, with the hours they apply",
    "amenity":             "building use; the facade family uses material and era instead",
}


def scene_fields(scene):
    """Every field name the scene file actually carries, per collection."""
    out = collections.defaultdict(set)
    for key, items in scene.items():
        if not isinstance(items, list):
            continue
        for it in items[:4000]:
            if isinstance(it, dict):
                out[key].update(it.keys())
    return out


def audit(did):
    raw_path = os.path.join(HERE, "raw", f"{did}.json")
    scene_path = os.path.join(HERE, f"{did}.json")
    if not (os.path.exists(raw_path) and os.path.exists(scene_path)):
        print(f"  {did}: no raw extract or scene file, skipped")
        return 0
    raw = json.load(open(raw_path))
    scene = json.load(open(scene_path))
    carried = scene_fields(scene)
    # everything the scene carries anywhere, plus the short names we use for
    # tags whose value is folded into another field
    flat = set()
    for v in carried.values():
        flat |= v
    ALIAS = {
        "lanes": "lanes", "oneway": "oneway", "name": "n", "surface": "surface",
        "maxspeed": "maxspeed", "turn:lanes": "turns", "sidewalk": "sidewalk",
        "width": "w", "level": "lvl", "cuisine": "cuisine", "brand": "brand",
        "addr:unit": "unit", "shop": "shop", "amenity": "amenity",
        "tunnel": "tunnel", "bridge": "bridge", "start_date": "yr",
        "building:material": "mat", "name:zh": "nzh",
        # tags folded into a field of a different name
        "sidewalk:left": "sidewalk", "sidewalk:right": "sidewalk",
        "sidewalk:both": "sidewalk",
        "building:colour": "col", "roof:colour": "rcol",
    }

    groups = collections.defaultdict(lambda: [0, collections.Counter()])
    for el in raw.get("elements", []):
        t = el.get("tags") or {}
        if not t:
            continue
        if "highway" in t:
            g = "road" if t["highway"] not in ("bus_stop", "crossing", "traffic_signals") else "node"
        elif "building" in t:
            g = "building"
        else:
            g = "other"
        groups[g][0] += 1
        for k in t:
            groups[g][1][k] += 1

    bad, deferred = [], []
    for g, (total, tags) in sorted(groups.items()):
        if g == "other" or total < 40:
            continue
        for k, n in tags.most_common():
            share = n / total
            if share < THRESHOLD:
                continue
            if k in IGNORED:
                continue
            if k in CARRIED_ELSEWHERE:
                continue
            if k in DEFERRED:
                deferred.append((g, k, n, total, share))
                continue
            field = ALIAS.get(k)
            if field and field in flat:
                continue
            bad.append((g, k, n, total, share))

    if bad:
        print(f"  {did}: {len(bad)} tag(s) present and unread")
        for g, k, n, total, share in sorted(bad, key=lambda r: -r[4]):
            print(f"     {g:9s} {k:22s} {n:6d} of {total:6d}  ({share*100:4.0f}%)  "
                  f"not carried, not in IGNORED")
    else:
        print(f"  {did}: every tag above {THRESHOLD*100:.0f}% is read, ignored "
              f"with a reason, or deferred with one")
    for g, k, n, total, share in sorted(deferred, key=lambda r: -r[4]):
        print(f"     DEFERRED  {g:9s} {k:22s} {n:6d} of {total:6d} ({share*100:4.0f}%)"
              f"  -- {DEFERRED[k]}")
    return len(bad)


def main():
    ids = sys.argv[1:]
    if not ids:
        dj = json.load(open(os.path.join(HERE, "districts.json")))
        ids = [d["id"] for d in dj["districts"]
               if os.path.exists(os.path.join(HERE, "raw", d["id"] + ".json"))]
    print("== tags the map gives us that nothing reads")
    bad = sum(audit(i) for i in ids)
    if bad:
        print(f"   FAIL  {bad} unread tag(s). Read it, or add it to IGNORED with a reason.")
        sys.exit(1)
    print("   PASS")


if __name__ == "__main__":
    main()
