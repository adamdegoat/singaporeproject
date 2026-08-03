#!/usr/bin/env python3
"""Add ONE missing layer to a raw extract that has already been fetched.

    python3 data/topup.py marinabay towers

Overpass is the slow and flaky part of this pipeline -- a district takes tens of
minutes and fails over between four mirrors -- so discovering a missing layer
after the fetch must not mean paying for the whole thing again. This fetches
just the named layer and merges it into the cached raw file, deduping by
(type, id) exactly as build_district does.
"""
import json, os, sys, time, urllib.request, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
MIRRORS = ["https://overpass-api.de/api/interpreter",
           "https://overpass.private.coffee/api/interpreter",
           "https://overpass.kumi.systems/api/interpreter"]

LAYERS = {
    # THE SAME QUERY build_district.py USES, not a second copy of it.
    #
    # These two files each held their own `towers` string, so adding
    # `man_made=crane` to the fetch in build_district.py left this one asking
    # for towers alone — and topup is the ONLY way to get a new layer into a
    # district whose cached raw the loss guard will not let you replace. The
    # crane fix would have looked applied and quietly done nothing for keppel,
    # which is the one district it exists for. One fact, one place.
    "towers": ('way["man_made"="tower"]({bbox});node["man_made"="tower"]({bbox});'
               'way["man_made"="crane"]({bbox});node["man_made"="crane"]({bbox});'),
    "water": ('way["natural"="water"]({bbox});rel["natural"="water"]({bbox});'
              'way["landuse"="reservoir"]({bbox});rel["landuse"="reservoir"]({bbox});'
              'way["waterway"~"^(riverbank|dock|canal|river|stream)$"]({bbox});'
              'rel["waterway"="riverbank"]({bbox});'),
    "coast": 'way["natural"="coastline"]({bbox});',
    "mrt": ('node["railway"="subway_entrance"]({bbox});'
            'node["railway"="station"]({bbox});'
            'way["railway"="subway_entrance"]({bbox});'),
    "buildrel": 'rel["building"]({bbox});',
    # A tower on a podium is TWO shapes, and OSM maps the second one as
    # building:part. Orchard and River Valley were fetched before this layer
    # existed and carry 4 and 1 of them against Chinatown's 505, so every
    # podium-and-tower up there is drawn as one box to the tower's height.
    # Topped up rather than refetched: a full refetch has been refused seven
    # times by the loss guard and there is no reason to risk an eighth.
    "buildpart": ('way["building:part"]({bbox});'
                  'rel["building:part"]({bbox});'),
    # GREEN SPACE, which this pipeline has never fetched. Singapore is a garden
    # city and every park, garden, field and the whole of the Istana grounds was
    # being drawn as bare terrain the colour of sand — the user's own words,
    # riding Orchard Road: "istana all still empty place". The extract carries
    # 72 individual trees and not one park polygon.
    # SAND. `natural=beach` and `natural=sand` are fetched by nothing and read
    # by nothing anywhere in this pipeline — the gap research/coastal-expansion.md
    # 0.3 flags as "one that no code path anywhere touches". It did not matter
    # while every district was inland; Sentosa's Siloso, Palawan and Tanjong
    # beaches are the reason the island is famous and would have drawn as the
    # world's neutral fallback ground.
    "beach": ('way["natural"~"^(beach|sand|shingle)$"]({bbox});'
              'rel["natural"~"^(beach|sand|shingle)$"]({bbox});'),
    "green": ('way["leisure"~"^(park|garden|pitch|golf_course|common)$"]({bbox});'
              'rel["leisure"~"^(park|garden|pitch|golf_course|common)$"]({bbox});'
              'way["landuse"~"^(grass|forest|recreation_ground|cemetery|village_green|meadow|greenfield)$"]({bbox});'
              'rel["landuse"~"^(grass|forest|recreation_ground|cemetery|village_green|meadow|greenfield)$"]({bbox});'
              'way["natural"~"^(wood|scrub|grassland|heath)$"]({bbox});'
              'rel["natural"~"^(wood|scrub|grassland|heath)$"]({bbox});'),
    # THE OTHER 55%. With green space in, a sampled grid over Orchard still came
    # back 55% neither building, park nor road — the sand between everything.
    # In the real city that is residential compounds, car parks, plazas and
    # forecourts, and OSM maps most of it as landuse. Without it the ground has
    # one colour for a condo garden, a multi-storey car park apron and a
    # shopping-mall forecourt.
    "landuse": ('way["landuse"~"^(residential|commercial|retail|industrial|institutional|education|religious|construction|brownfield|railway)$"]({bbox});'
                'rel["landuse"~"^(residential|commercial|retail|industrial|institutional|education|religious|construction|brownfield|railway)$"]({bbox});'
                'way["amenity"="parking"]({bbox});rel["amenity"="parking"]({bbox});'
                'way["highway"="pedestrian"]["area"="yes"]({bbox});'
                'way["place"="square"]({bbox});'),
    # The waterfront and the rail. Clarke Quay, Robertson Quay and Marina Bay
    # are quays with jetties and pontoons on them, and none of it existed.
    "marine": ('way["man_made"~"^(pier|breakwater|groyne)$"]({bbox});'
               'way["waterway"="dock"]({bbox});'
               'way["amenity"="ferry_terminal"]({bbox});'
               'node["amenity"="ferry_terminal"]({bbox});'),
    "rail": ('way["railway"~"^(rail|light_rail|subway|monorail|tram)$"]({bbox});'
             'way["railway"="platform"]({bbox});'
             'rel["railway"="platform"]({bbox});'),
    # The cable car (Sentosa first: the Mount Faber and Sentosa lines). Never
    # fetched by anything before 2026-08-03 — the only aerialway element in any
    # raw cache arrived by accident, because the Imbiah station also carries
    # building=yes. Ways are the cables, nodes are the pylons and stations.
    "aerialway": ('way["aerialway"]({bbox});'
                  'node["aerialway"~"^(station|pylon)$"]({bbox});'),
    "sport": ('way["leisure"~"^(sports_centre|stadium|track|swimming_pool|fitness_station)$"]({bbox});'
              'rel["leisure"~"^(sports_centre|stadium|track|swimming_pool)$"]({bbox});'),
    # ---- THE WALKABLE WORLD, added 2026-08-01.
    #
    # Everything this pipeline fetches was chosen for a RIDER: carriageways,
    # traffic signals, bus stops, gantries, street trees. The owner's goal is
    # bigger than that — "it is not just driving around and seeing things from a
    # vehicle point of view ... I must be able to walk around" — and measured
    # against that the extract has never been asked for the things a person on
    # foot actually meets.
    #
    # Counted in the brasbasah bbox alone, none of which anything draws today:
    #
    #     steps 107 · bench 60 · barrier ways 29 · memorial/monument 17
    #     fountain 15 · playground 6 · shelter 6 · path 2
    #
    # STEPS IS THE ONE THAT MATTERS MOST and 107 is not a rounding error: it is
    # every staircase on Fort Canning and up Mount Sophia. Without them the
    # hills have no way up, so a walker cannot reach the top of either — the
    # single biggest hole in a world you are meant to be able to explore.
    #
    # Two layers rather than ten so a throttled Overpass is asked twice per
    # district instead of ten times. `barrier` rides with the network because it
    # is the same question from the other side: where you may NOT walk.
    "steps": ('way["highway"~"^(steps|path)$"]({bbox});'
              'way["barrier"~"^(wall|fence|hedge|retaining_wall|handrail|guard_rail)$"]({bbox});'
              'node["barrier"~"^(gate|bollard|lift_gate)$"]({bbox});'),
    # The things worth WALKING TO. The Cenotaph, the Lim Bo Seng Memorial and
    # the Tan Kim Seng Fountain all stand on ground we currently draw as empty
    # grass, and they are exactly the "iconic places" the goal names.
    "parkfurn": ('node["historic"~"^(memorial|monument)$"]({bbox});'
                 'way["historic"~"^(memorial|monument)$"]({bbox});'
                 'node["tourism"="artwork"]({bbox});way["tourism"="artwork"]({bbox});'
                 'node["amenity"~"^(bench|fountain|shelter)$"]({bbox});'
                 'way["amenity"~"^(fountain|shelter)$"]({bbox});'
                 'node["leisure"="playground"]({bbox});'
                 'way["leisure"="playground"]({bbox});'),
}


def main():
    did = sys.argv[1]
    layers = sys.argv[2:]
    d = next(x for x in REG["districts"] if x["id"] == did)
    bbox = d["bbox"]

    # SEVERAL LAYERS IN ONE PASS, BECAUSE A PASS IS THE COST.
    #
    # `topup.py <id> <layer>` took one layer, which was right when every layer
    # was an Overpass round trip and wrong the moment the local extract landed:
    # a scan of the 36MB island costs ~95s WHATEVER you ask it for, so six
    # layers across five districts one-at-a-time is thirty scans and about
    # forty-seven minutes. Asked together it is five scans and eight minutes.
    #
    # Same shape as the fix in build_district.py, and the same lesson: with a
    # local file the per-QUERY cost is nil and the per-PASS cost is everything.
    if len(layers) > 1:
        try:
            sys.path.insert(0, HERE)
            import osmlocal
            bodies = {L: LAYERS[L].format(bbox=bbox) for L in layers}
            res = osmlocal.fetch_many(bbox, bodies)
            if res:
                path = os.path.join(HERE, "raw", f"{did}.json")
                raw = json.load(open(path))
                seen = {(e["type"], e["id"]) for e in raw["elements"]}
                total = 0
                for L in layers:
                    got = res.get(L)
                    if got is None:
                        print(f"  {L}  not answerable locally — rerun alone for Overpass")
                        continue
                    added = [e for e in got if (e["type"], e["id"]) not in seen]
                    for e in added:
                        seen.add((e["type"], e["id"]))
                    raw["elements"].extend(added)
                    total += len(added)
                    print(f"  {L:10s} {len(got):5d} found, {len(added):5d} new  (LOCAL)")
                json.dump(raw, open(path, "w"))
                print(f"  merged {total} new elements into {path} "
                      f"({len(raw['elements'])} total)")
                return
        except Exception as exc:
            print(f"  batch topup failed ({type(exc).__name__}); "
                  f"falling back to one layer at a time")
        for L in layers:
            os.system(f'python3 {os.path.join(HERE, "topup.py")} {did} {L}')
        return

    layer = layers[0]
    body = LAYERS[layer].format(bbox=bbox)
    q = f"[out:json][timeout:120];\n({body}\n);\nout geom;"
    got = None

    # THE LOCAL EXTRACT FIRST, THE NETWORK ONLY IF IT CANNOT ANSWER.
    #
    # Measured the night this was written: this one layer across nine districts
    # took 27 MINUTES over Overpass, with two of four mirrors dead and a third
    # rate-limiting. The same answer comes out of a 36MB local file in seconds,
    # and it is BYTE-IDENTICAL — validated id-by-id and vertex-by-vertex against
    # the cached Overpass responses before this was wired up.
    #
    # osmlocal returns None when it cannot parse the query or the extract is
    # missing, and the mirror loop below runs exactly as it always did. Nothing
    # here can make a fetch fail that used to succeed.
    try:
        sys.path.insert(0, HERE)
        import osmlocal
        got = osmlocal.fetch(bbox, body)
        if got is not None:
            print(f"  {layer}  {len(got)} elements via LOCAL extract")
    except Exception as exc:                     # never let the fast path break the slow one
        print(f"  {layer}  local extract unavailable ({type(exc).__name__}); using Overpass")
        got = None

    for attempt, url in enumerate([] if got is not None else [m for m in MIRRORS for _ in (0, 1)]):
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": q}).encode())
            with urllib.request.urlopen(req, timeout=180) as r:
                got = json.loads(r.read())["elements"]
            print(f"  {layer}  {len(got)} elements via {url.split('/')[2]}")
            break
        except Exception as e:
            print(f"  {layer}  attempt {attempt+1} failed on {url.split('/')[2]}: {type(e).__name__}")
            time.sleep(4)
    if got is None:
        sys.exit("  ! every mirror failed")

    path = os.path.join(HERE, "raw", f"{did}.json")
    raw = json.load(open(path))
    seen = {(e["type"], e["id"]) for e in raw["elements"]}
    added = [e for e in got if (e["type"], e["id"]) not in seen]
    raw["elements"].extend(added)
    json.dump(raw, open(path, "w"))
    print(f"  merged {len(added)} new elements into {path} "
          f"({len(raw['elements'])} total)")


if __name__ == "__main__":
    main()
