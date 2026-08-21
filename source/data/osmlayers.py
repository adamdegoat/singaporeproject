"""EVERY OSM LAYER THIS PIPELINE ASKS FOR, IN ONE PLACE.

Split out of topup.py on 2026-08-21, because the two files that fetch had
drifted into asking for DIFFERENT WORLDS and nothing said so.

Measured that day: build_district.py's fresh fetch knew fourteen layers.
topup.py knew sixteen, and **twelve of topup's were not in the fresh fetch at
all** -- green, beach, landuse, steps, parkfurn, marine, rail, aerialway,
sport, buildrel, buildpart and shops. So `build_district.py <id> --force`
would have rebuilt a Sentosa with no beaches, no parks, no staircases, no
piers, no cable car, no street furniture and no shops mapped as footprints,
and reported a clean fetch while doing it. Nothing was broken only because
nobody ever forced a refetch -- the loss guard has refused one seven times,
and the cache has been carrying those twelve layers since the day each was
topped up.

That is the same disease as the `towers` copy this file already documents and
the `bar` omission of the same morning, at the next size up: not one tag
missing from one query, but twelve whole layers missing from the query that
builds a district from nothing.

THE RULE: a layer defined here is asked for by BOTH paths. Add one here and
nowhere else. Queries carry a `{bbox}` PLACEHOLDER and are `.format()`ed by
the caller -- build_district.py substitutes at build time, topup.py at run
time -- so never bake a bbox into a string in this file.
"""

# WHY THE AMENITY LIST IS LONGER THAN IT LOOKS. It was
# restaurant|cafe|bank|fast_food|pharmacy|cinema, and `bar` was not on
# it, so TANJONG BEACH CLUB -- amenity=bar, node 512090623, the identity
# of that beach and a Conde Nast world's-best -- has never been fetched
# on any run of this pipeline. research/tanjong-beach.md concluded from
# the cache that "OSM does not carry the club": OSM carries it fine, we
# never asked. Eighteen named venues island-wide were behind this one
# omission, including two (Ola Beach Club, Bikini Bar) that SESSION 30j
# authored BY HAND into authored.json off a published address because
# they appeared to be missing from the map. They were not missing.
#
# The lesson is the general one: an absence in a CACHE is evidence about
# the QUERY first and about the world second. Check what you asked for
# before you conclude what is there.
#
# `way["amenity"]` is asked for too -- Rumours Beach Club, Koufu and
# Bora Bora are mapped as building outlines, not points, and a
# node-only query drops every venue big enough to have a footprint.
SHOPS_Q = ('node["shop"]({bbox});way["shop"]({bbox});'
           'node["amenity"~"^(restaurant|cafe|bank|fast_food|pharmacy|'
           'cinema|bar|pub|nightclub|biergarten|food_court|ice_cream)$"]({bbox});'
           'way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|nightclub|'
           'biergarten|food_court|ice_cream)$"]({bbox});')

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
    # SHOPS, and IMPORTED rather than copied. `towers` above is a cautionary
    # tale: it was written out twice, build_district.py grew `man_made=crane`
    # and this copy did not, so the only district the fix existed for would
    # have silently kept its old answer. The shops query is the one layer most
    # likely to grow again -- it just did, by six amenity values -- so it lives
    # in build_district.py and is imported here. One fact, one place.
    "shops": SHOPS_Q,
    # ---- THE SERVICE LAYER A PERSON ON FOOT ACTUALLY MEETS, added 2026-08-21.
    #
    # `parkfurn` below fetches the things you look AT -- memorials, artwork,
    # fountains, playgrounds. This is the things you USE, and the pipeline had
    # never asked for any of them.
    #
    # Counted live in the sentosa bbox the day it was written: 91 surveyed
    # points, of which 90 were absent from our cache -- 28 toilets, 22
    # information boards, 11 vending machines, 11 waste baskets, 7 bicycle
    # parking stands, 6 drinking-water points, 4 showers and the island's one
    # `emergency=lifeguard` node. research/palawan-spawn.md 6.3 had already
    # spotted this and written the warning: "None of these amenity nodes are in
    # data/raw/sentosa.json -- the cache predates the December 2025 survey. A
    # refetch would hand us the whole service layer for free." It sat unread.
    #
    # WHY IT MATTERS MORE THAN ITS SIZE. The owner's goal is a WALKABLE island,
    # and the toilets, showers and water points on a beach are the difference
    # between sand you look at and sand you can spend a day on. Every one of
    # these has a real surveyed position, so none of it has to be invented --
    # which is the whole argument for fetching rather than authoring.
    #
    # `emergency=lifeguard` rides here rather than in `towers` because it is a
    # POST, not a structure: OSM puts one node inside Palawan's patrol-tower
    # footprint, which is what settled that the footprint IS a lifeguard tower
    # (palawan-spawn.md 6.3). One node island-wide, so it names a tower we
    # already have rather than placing three we do not.
    "services": ('node["amenity"~"^(toilets|shower|drinking_water|'
                 'bicycle_parking|vending_machine|bbq)$"]({bbox});'
                 'way["amenity"~"^(toilets|shower|drinking_water|'
                 'bicycle_parking)$"]({bbox});'
                 'node["amenity"="waste_basket"]({bbox});'
                 'node["emergency"="lifeguard"]({bbox});'
                 'way["emergency"="lifeguard"]({bbox});'
                 'node["tourism"="information"]({bbox});'),
    "parkfurn": ('node["historic"~"^(memorial|monument)$"]({bbox});'
                 'way["historic"~"^(memorial|monument)$"]({bbox});'
                 'node["tourism"="artwork"]({bbox});way["tourism"="artwork"]({bbox});'
                 'node["amenity"~"^(bench|fountain|shelter)$"]({bbox});'
                 'way["amenity"~"^(fountain|shelter)$"]({bbox});'
                 'node["leisure"="playground"]({bbox});'
                 'way["leisure"="playground"]({bbox});'),
}

