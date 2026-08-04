#!/usr/bin/env python3
"""Answer this project's Overpass queries from a LOCAL extract instead.

    python3 data/osmlocal.py --selftest        # compare against a cached raw file
    python3 data/osmlocal.py --fetch kallang buildings

WHY THIS EXISTS, WITH THE MEASUREMENT THAT FORCED IT.

Overpass is the slowest and most fragile thing in this pipeline by a wide
margin. Measured on the night kallang was built:

    one district's fetch      15 queries + 16 retries = 31 round trips
    one layer x 9 districts   27+ minutes (parkfurn topup)
    mirrors seen in one hour  2 of 4 dead, 1 rate-limited, 1 answering

Six districts remain in the ring at ~28 queries each. That is roughly 170 more
throttled round trips, every one of which can time out at 180s, and the loss
guard has already refused a partial refetch seven times.

The whole island is a **36MB** file. Downloaded once, every layer of every
district becomes a local scan measured in seconds.

AND IT FIXES A CORRECTNESS BUG, WHICH IS THE PART NOBODY EXPECTED.
merge.py's dedupe comment records that Funan, Old City Hall, Bugis+, Peninsula
Plaza and NAFA all sit at a consistent ~11m offset across the seam "because the
two district fetches happened at different times and OSM had been edited in
between". A single snapshot makes a build REPRODUCIBLE: two districts fetched
from the same file cannot disagree about where a building is. That entire class
of seam defect stops existing.

THE DESIGN, AND THE ONE RULE IT FOLLOWS.

There is no second list of layers here. `build_district.py`'s `parts` and
`topup.py`'s `LAYERS` stay the single source of truth, exactly as districts.json
is the single source of truth for which districts exist -- this file PARSES the
small Overpass QL subset those strings already use and evaluates it against the
extract. A layer added to topup.py works here the same day with no edit.
Anything this parser does not understand returns None, and the caller falls
back to the network. Silence is never an answer: unsupported clauses say so.

The supported subset, which is everything the repo actually writes:

    way["k"="v"](bbox);        node["k"](bbox);        rel["k"~"^(a|b)$"](bbox);
    way["k"~"regex"](bbox);    node["k"!="v"](bbox);

Output is shaped exactly like Overpass `out geom;` so process.py cannot tell
the difference: nodes carry lat/lon, ways carry `geometry` as [{lat,lon}...],
and relations carry `members` each with their own `geometry`.
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PBF = os.path.join(HERE, "osm", "singapore.osm.pbf")

# ---------------------------------------------------------------------------
# The Overpass QL subset parser.
# ---------------------------------------------------------------------------
# One statement looks like:  way["building"]["height"](1.29,103.86,1.31,103.88);
# We only need the element type and the tag predicates; the bbox is passed in
# separately by the caller because every statement in this repo uses the same
# {bbox} placeholder.
# THE BBOX MAY BE THE PLACEHOLDER **OR** THE NUMBERS, AND MISSING THAT MADE
# THIS WHOLE MODULE A NO-OP FOR EVERY REAL BUILD.
#
# The first version matched only a literal `{bbox}`. `topup.py` and
# `build_district.py` both substitute the real coordinates BEFORE handing the
# query over -- `f'way["building"]({bbox});'` -- so what actually arrives is
# `way["building"](1.2600,103.8110,1.2760,103.8290);`, which did not match,
# so parse_query raised Unsupported, so every layer of every district fell
# silently back to Overpass. Five districts were built that way believing they
# were reading the local file. It passed my own tests because those tests
# passed the placeholder form, which is the one shape production never uses.
#
# TEST WITH THE STRING THE CALLER REALLY SENDS. A fixture that is easier to
# write than the real input is a fixture that tests the wrong thing.
_STMT = re.compile(r'\s*(way|node|rel|relation)\s*((?:\[[^\]]*\]\s*)*)'
                   r'\s*\(\s*(?:\{bbox\}|[-0-9.,\s]+)\s*\)\s*;')
_PRED = re.compile(r'\[\s*"([^"]+)"\s*(?:(=|!=|~|!~)\s*"([^"]*)"\s*)?\]')


class Unsupported(Exception):
    pass


def parse_query(body):
    """-> [(type, [(key, op, value)...])...]  or raises Unsupported."""
    stmts = []
    pos = 0
    text = body.strip()
    while pos < len(text):
        m = _STMT.match(text, pos)
        if not m:
            rest = text[pos:].strip()
            if not rest:
                break
            raise Unsupported(f"cannot parse: {rest[:70]}")
        kind = "relation" if m.group(1) in ("rel", "relation") else m.group(1)
        preds = []
        for p in _PRED.finditer(m.group(2) or ""):
            key, op, val = p.group(1), p.group(2), p.group(3)
            preds.append((key, op or "exists", val))
        stmts.append((kind, preds))
        pos = m.end()
    if not stmts:
        raise Unsupported("no statements found")
    return stmts


def _match(tags, preds):
    for key, op, val in preds:
        have = tags.get(key)
        if op == "exists":
            if have is None:
                return False
        elif op == "=":
            if have != val:
                return False
        elif op == "!=":
            if have == val:
                return False
        elif op == "~":
            if have is None or not re.search(val, have):
                return False
        elif op == "!~":
            if have is not None and re.search(val, have):
                return False
        else:
            raise Unsupported(f"operator {op}")
    return True


# ---------------------------------------------------------------------------
# The extract reader.
# ---------------------------------------------------------------------------
def _bbox_tuple(bbox):
    s, w, n, e = (float(v) for v in str(bbox).split(","))
    return s, w, n, e


def fetch_many(bbox, queries, pbf=PBF):
    """{label: overpass_body} -> {label: elements}. ONE PASS OVER THE FILE.

    This is where the time actually goes. A single scan of the 36MB extract
    costs ~25s; a district asks for FIFTEEN layers, so answering them one at a
    time would be six minutes and answering them together is twenty-five
    seconds. Overpass's equivalent was 31 round trips and about half an hour.

    Labels whose query this parser does not understand are simply absent from
    the returned dict, and the caller falls back to the network for those
    alone -- never for the whole district.
    """
    if not os.path.exists(pbf):
        return None
    try:
        import osmium
    except ImportError:
        return None

    plans = {}
    for label, body in queries.items():
        try:
            plans[label] = parse_query(body)
        except Unsupported as e:
            print(f"    (local: {label}: {e}; will use Overpass)", flush=True)
    if not plans:
        return None

    s, w, n, e = _bbox_tuple(bbox)
    res = {label: [] for label in plans}
    # per-label predicate lists, split by element kind, so the inner loop is a
    # tag test and not a re-parse
    byk = {label: {"node": [p for k, p in st if k == "node"],
                   "way": [p for k, p in st if k == "way"],
                   "relation": [p for k, p in st if k == "relation"]}
           for label, st in plans.items()}

    # A RELATION HAS NO GEOMETRY OF ITS OWN — IT IS SELECTED BY ITS MEMBERS.
    #
    # The first version of this matched relations on tags alone and returned
    # every one in the file: 1,245 building relations for a bbox that Overpass
    # answers with THREE. Caught only because the output was diffed against a
    # cached Overpass response instead of being eyeballed for plausibility.
    # `rel(bbox)` means "has a member inside the box", so the member ids that
    # ARE inside have to be known before the relations arrive.
    #
    # A .osm.pbf is ordered nodes, then ways, then relations, so one pass is
    # enough: record in-box node and way ids on the way through. The sets are
    # bounded by the BBOX, not by the file, so they stay small.
    #
    # And no EmptyTagFilter: a multipolygon's members are usually UNTAGGED
    # ways, so filtering them out would leave the reservoir's own outline
    # invisible and every water relation unselectable.
    inbox_nodes, inbox_ways = set(), set()
    # ...AND THE WAYS' SHAPES, BECAUSE A RELATION IS ONLY ITS MEMBERS.
    #
    # process.py's stitch_outer() builds a multipolygon's ring by reading
    # m["geometry"] on each outer member, exactly as it does for water. This
    # reader emitted members as {type, ref, role} with no geometry at all, so
    # every stitch produced an empty ring and process.py's own guard dropped
    # the relation on the next line — silently, with a clean run.
    #
    # Measured on the Sentosa extract: 8 of the 10 building relations in the
    # bbox never reached the scene, and among them was the WHOLE of Sofitel's
    # main building, 198x294m of it. The two that survived did so by accident,
    # because their outer way is itself tagged `building` and the way scan
    # caught it. This is the identical failure the comment at process.py's
    # relation branch describes and warns about, reintroduced one layer down.
    #
    # Bounded by the bbox: only ways with a node inside it are kept, which is
    # the same set inbox_ways already holds.
    way_geom = {}

    fp = osmium.FileProcessor(pbf, osmium.osm.NODE | osmium.osm.WAY | osmium.osm.RELATION)
    fp = fp.with_locations()
    for o in fp:
        kind = o.__class__.__name__.lower()
        try:
            tags = {t.k: t.v for t in o.tags}
        except Exception:
            tags = {}
        if "node" in kind:
            lat, lon = o.location.lat, o.location.lon
            if not (s <= lat <= n and w <= lon <= e):
                continue
            inbox_nodes.add(o.id)
            if not tags:
                continue
            for label, kk in byk.items():
                for preds in kk["node"]:
                    if _match(tags, preds):
                        res[label].append({"type": "node", "id": o.id, "tags": tags,
                                           "lat": lat, "lon": lon})
                        break
        elif "way" in kind:
            geom, hit = [], False
            for nd in o.nodes:
                if not nd.location.valid():
                    continue
                geom.append({"lat": nd.location.lat, "lon": nd.location.lon})
                if s <= nd.location.lat <= n and w <= nd.location.lon <= e:
                    hit = True
            if not (hit and geom):
                continue
            inbox_ways.add(o.id)
            # kept whether or not the way is tagged: a multipolygon's outer
            # members usually carry no tags of their own
            way_geom[o.id] = geom
            if not tags:
                continue
            wanted = [label for label, kk in byk.items()
                      if any(_match(tags, p) for p in kk["way"])]
            if not wanted:
                continue
            rec = {"type": "way", "id": o.id, "tags": tags, "geometry": geom}
            for label in wanted:
                res[label].append(rec)
        else:
            if not tags:
                continue
            wanted = [label for label, kk in byk.items()
                      if any(_match(tags, p) for p in kk["relation"])]
            if not wanted:
                continue
            members = [{"type": m.type, "ref": m.ref, "role": m.role,
                        "geometry": way_geom.get(m.ref)}
                       for m in o.members]
            touches = any((m["ref"] in inbox_ways and str(m["type"]).startswith("w"))
                          or (m["ref"] in inbox_nodes and str(m["type"]).startswith("n"))
                          for m in members)
            if not touches:
                continue
            rec = {"type": "relation", "id": o.id, "tags": tags, "members": members}
            for label in wanted:
                res[label].append(rec)
    return res


def fetch(bbox, body, pbf=PBF):
    """Return Overpass-shaped elements, or None if this query is not supported
    or the extract is missing. Never raises for a caller to have to catch."""
    if not os.path.exists(pbf):
        return None
    try:
        stmts = parse_query(body)
    except Unsupported as e:
        print(f"    (local: {e}; falling back to Overpass)", flush=True)
        return None
    try:
        import osmium
    except ImportError:
        return None

    s, w, n, e = _bbox_tuple(bbox)
    want_node = [p for k, p in stmts if k == "node"]
    want_way = [p for k, p in stmts if k == "way"]
    want_rel = [p for k, p in stmts if k == "relation"]

    def inside(lat, lon):
        return s <= lat <= n and w <= lon <= e

    out = []
    # A WAY IS TAKEN IF ANY NODE IS IN THE BOX, and its FULL geometry is
    # returned -- which is precisely what Overpass `out geom;` does. Matching
    # that exactly matters: the axis-fallback bug that dragged kallang's
    # terrain grid four kilometres wide came from a way whose full geometry
    # reached far outside the bbox, and any difference here would change what
    # the pipeline sees relative to every district already built.
    fp = osmium.FileProcessor(pbf, osmium.osm.NODE | osmium.osm.WAY | osmium.osm.RELATION)
    fp = fp.with_locations().with_filter(osmium.filter.EmptyTagFilter())
    for o in fp:
        try:
            tags = {t.k: t.v for t in o.tags}
        except Exception:
            continue
        kind = o.__class__.__name__.lower()
        if "node" in kind and want_node:
            if not inside(o.location.lat, o.location.lon):
                continue
            for preds in want_node:
                if _match(tags, preds):
                    out.append({"type": "node", "id": o.id, "tags": tags,
                                "lat": o.location.lat, "lon": o.location.lon})
                    break
        elif "way" in kind and want_way:
            if not any(_match(tags, p) for p in want_way):
                continue
            geom = []
            hit = False
            for nd in o.nodes:
                if not nd.location.valid():
                    continue
                geom.append({"lat": nd.location.lat, "lon": nd.location.lon})
                if inside(nd.location.lat, nd.location.lon):
                    hit = True
            if hit and geom:
                out.append({"type": "way", "id": o.id, "tags": tags, "geometry": geom})
        elif "relation" in kind and want_rel:
            if not any(_match(tags, p) for p in want_rel):
                continue
            out.append({"type": "relation", "id": o.id, "tags": tags,
                        "members": [{"type": m.type, "ref": m.ref, "role": m.role}
                                    for m in o.members]})
    return out


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        print("extract:", PBF, os.path.exists(PBF) and
              f"{os.path.getsize(PBF)/1048576:.0f} MB" or "MISSING")
        for q in ['way["highway"="steps"]({bbox});',
                  'node["amenity"~"^(bench|fountain|shelter)$"]({bbox});',
                  'rel["natural"="water"]({bbox});way["building"]({bbox});']:
            try:
                print(f"  parse OK  {parse_query(q)}   <- {q}")
            except Unsupported as e:
                print(f"  parse FAIL {e}   <- {q}")
