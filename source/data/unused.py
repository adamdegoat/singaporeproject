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
    # Little India 2026-07-30: the operator's own naming for a transit stop,
    # not a fact about where anything is or what it looks like. "SBS Transit",
    # its abbreviation and its wikidata id tell a rider nothing they can see
    # from the seat, and we already carry the stop's NAME and position, which
    # are what the wayfinder reads.
    # kallang 2026-08-02, 6% of its roads -- Nicoll Highway and the park
    # connectors carry it. It is an ACCESS permission for horse riding,
    # and it changes nothing about geometry, width, surface or what is
    # drawn. This world has vehicles only, by the owner's explicit
    # instruction, so there is nothing it could ever steer.
    "horse": "access permission for horse riding; no geometry, and this "
             "world has no horses",
    "network": "transit operator name on a stop; carries no geometry and "
               "nothing visible from the street",
    "network:short": "abbreviation of the same",
    "network:wikidata": "identifier for the same",
    "crossing_ref":   "UK-style duplicate of crossing=; the classifier reads crossing=, and both say 'zebra' about the same node",
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
    "parking:condition:left:vehicles":
        "who may park in the marked bays (Bugis surfaced it, 2026-07-30); no "
        "parked-vehicle system reads bay eligibility yet — the double yellows "
        "already carry the no-parking fact that shows on the street",

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
    "tunnel":          "underground ways are DROPPED in process.py, not drawn",
    "traffic_signals": "the signal's own sub-type; the signal itself is the node",
    "crossing:signals": "whether a crossing is signalised; the signal node says so",
}

# Tags carried in a structure the field scan cannot see -- a positional array
# rather than a dict -- with where they live.
CARRIED_ELSEWHERE = {
    "tactile_paving": "crossings[] third element; drawn as the yellow kerb pad",
    "crossing:island": "crossings[] fourth element; drawn as a raised refuge",
    # READ, JUST NOT VISIBLE TO THIS SCAN. process.py falls back to
    # `addr:housename` when a building carries no `name`, and the value lands
    # in the scene's generic `n` field, so nothing here can tell it apart from
    # a name that came from `name`. Verified rather than assumed on
    # 2026-08-02: tanjongrhu flagged it at 9%, and all seven of its
    # addr:housename developments -- The Waterside, Emerald East, De
    # Centurion, Crystal Rhu, Fulcrum, Riveredge, The Line @ Tanjong Rhu --
    # are in the built scene under exactly those names. It is a FALSE
    # POSITIVE in this check, not a gap in the pipeline, and it belongs here
    # rather than in IGNORED, which would have said the opposite of the truth.
    "addr:housename": "building name fallback when `name` is absent; lands in the scene's `n` field so this scan cannot see it (process.py, _nm)",
}

# Tags we SHOULD read and have not yet. These print every run and do not fail
# the gate, because a deferral with a date and a reason is a decision, while
# quietly folding them into IGNORED is how this project lost seven of them in
# the first place. Empty this list, do not grow it.
DEFERRED = {
    # Surfaced by Little India 2026-07-30. Kerbside parking is a REAL and
    # visible feature of Serangoon Road and the lanes around Tekka — cars
    # nose-in along the kerb are half of what that street looks like — and it
    # is mapped on roughly one way in eleven here, which is far more than any
    # district we had. Deferred rather than ignored because the day the traffic
    # system learns to park, this is the data that says where: it is not noise,
    # it is a feature waiting for its system.
    "parking:lane:left": "kerbside parking, real and unmodelled; the data that "
                         "will place parked cars when traffic learns to park",
    "parking:lane:right": "same",
    "parking:lane:both": "same",
    "parking:condition:right:vehicles": "which vehicles may park there; same "
                                        "deferral as parking:lane",
    "parking:condition:both:vehicles": "same",
    # carried into the scene and read by nothing YET, which is a different
    # state from unread: the bus lane is drawn behind a DRAW_BUS_LANES flag
    # that is off because per-fragment ribbons render as stains. See city.js.
    "busway": "carried as r.bus; drawing is written and switched off, see city.js",
    # surfaced by River Valley 2026-07-29 — both real features waiting for
    # their systems, not noise:
    "residential": "building use; should eventually steer the facade family "
                   "toward the balcony/condo look (River Valley is condo "
                   "country) the way amenity should steer retail — same "
                   "deferral class as amenity",
    "maxheight": "height-restricted ways — River Valley's CTE underpasses. "
                 "Nothing models clearance signage or low decks yet; when "
                 "bridges get real clearances this is the source",
    "turn:lanes:forward":  "per-direction turn arrows; we use the undirected turn:lanes",
    "turn:lanes:backward": "same",
    "addr:housenumber":    "no building-number signage is modelled anywhere yet",
    "addr:street":         "same",
    "kerb":                "lowered/flush/raised; every kerb is drawn the same",
    "crossing:markings":   "zebra vs ladder vs dashes; all drawn as zebra",
    "amenity":             "building use; the facade family uses material and era instead",
    "roof:material":       "roof surfaces are only modelled on shophouses so far",
    # kallang 2026-08-02, 12% of its buildings. Same deferral as
    # roof:material and for the same reason -- but worth more than that
    # sibling when it is picked up: `dome`, `pyramidal`, `gabled` and
    # `hipped` are the SILHOUETTE, which is what a rider sees from four
    # hundred metres, and the National Stadium recipe written this session
    # had to hand-carry a shape the map was already telling us.
    "roof:shape":          "roof surfaces are only modelled on shophouses so far; the shape is the more valuable half of this pair and should be read first",
    # marinaeast 2026-08-02, 11% of its buildings. The parkfurn layer added
    # the same night DOES draw shelters, but as one generic form -- this tag
    # says whether a thing is a bus shelter, a picnic shelter, a gazebo or a
    # sun shelter, and those are four different silhouettes. Worth reading
    # when the shelter form is next touched; deferred, not ignored, because
    # it would change what is drawn rather than merely describe it.
    "shelter_type":        "shelters are drawn as one generic form; this would give bus / picnic / gazebo / sun their own shapes",
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
        "min_height": "mh", "footway": "fw",
        "maxspeed": "kmh", "busway:left": "bus", "busway:right": "bus",
        "lanes:bus": "bus", "lanes:bus:conditional": "bus",
        "route_ref": "rr", "shelter": "sh", "bench": "be", "bin": "bi",
        "lanes:forward": "lf", "lanes:backward": "lb",
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
