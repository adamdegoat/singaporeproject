#!/usr/bin/env python3
"""Put the ATTRACTIONS into a district's scene file.

    python3 attractions.py sentosa

THE ATTRACTIONS OF AN ATTRACTIONS ISLAND WERE NEVER FETCHED.

The owner, riding Sentosa: "cannot tell any landmark rlly at all". The reason
turned out to be neither modelling nor technique. This pipeline's fetch asks
for buildings, roads, paths, trees, water, coastline, shops, bus stops, taxis,
towers and cranes -- and has never once asked OSM for `tourism`, `historic` or
`attraction`. So Fort Siloso, its fourteen guns, the Universal Studios globe,
the luge, the coasters, MegaZip, the Southernmost Point of Continental Asia,
Sensoryscape's installations and the Imbiah bunkers were not missing from the
DRAWING. They were missing from the DATA.

Measured on the first fetch: 157 elements, 108 of them named, inside the same
bbox the district already uses. That is the fifth time "no data exists" has
been false in this project -- crossings, sidewalks, gantries, lamps, and now
the attractions -- and every one of them was concluded from checking one tag.

Written as a standalone layer script for the same reason lamps.py and
gantries.py are: it adds ONE key to an existing scene file, so nothing else in
the district has to be reprocessed and the terrain already written into that
file survives untouched.

WHAT THIS DOES NOT DO. It does not decide what anything looks like. Each record
carries a position, a name, a kind and the raw tags that justify it; the form
is the renderer's business, and where a dimension is unpublished it stays
unpublished. It also does not filter for staleness -- OSM still tags
Madagascar and its rides on Sentosa, which closed in March 2022 and became
Minion Land in February 2025, so the DRAW side must check what it builds
against the research rather than trusting a name here.
"""
import json, math, os, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"][0], REG["island_origin"][1]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))

# The same mirrors and the same failover the rest of the pipeline uses: a
# single endpoint rate-limited this fetch twice while it was being written.
MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.jp/api/interpreter",
]

# nwr = nodes, ways AND relations in one pass. Resorts World is a relation and
# would be invisible to a node+way query.
# out tags geom, NOT center: a luge run, a fort's rampart and a coaster's
# track are LINES, and a centre point throws away the only thing that makes
# them recognisable. Nodes still return their own position; ways and relations
# now carry their full geometry, and 160 elements is a small enough response
# to ask for it.
QUERY = ('[out:json][timeout:180];('
         'nwr["tourism"]({bbox});'
         'nwr["historic"]({bbox});'
         'nwr["attraction"]({bbox});'
         ');out tags geom;')

# tourism=hotel and tourism=information are already covered by the building and
# signage layers and would only duplicate them; everything else here is a thing
# a visitor goes to Sentosa FOR.
SKIP_KINDS = {"hotel", "information", "guest_house", "hostel", "apartment"}


def proj(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


def district(did):
    for d in REG["districts"]:
        if d["id"] == did:
            return d
    sys.exit(f"no district '{did}'")


def fetch(bbox):
    body = QUERY.format(bbox=bbox)
    for m in MIRRORS:
        try:
            print(f"  asking {m.split('/')[2]}")
            req = urllib.request.Request(
                m, data=urllib.parse.urlencode({"data": body}).encode(),
                headers={"User-Agent": "orchard-attractions/1.0"})
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.loads(r.read().decode())
        except Exception as e:                       # noqa: BLE001 - any failure fails over
            print(f"    failed: {type(e).__name__} {e}")
            time.sleep(3)
    sys.exit("every Overpass mirror refused; try again later")


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    d = district(did)
    path = os.path.join(HERE, f"{did}.json")
    if not os.path.exists(path):
        sys.exit(f"no scene file for '{did}'")
    scene = json.load(open(path))

    print(f"== attractions: {did}")
    raw = fetch(d["bbox"])
    els = raw.get("elements", [])
    print(f"  {len(els)} elements from Overpass")

    out, skipped, unnamed = [], 0, 0
    for e in els:
        t = e.get("tags") or {}
        kind = t.get("tourism") or t.get("historic") or t.get("attraction")
        if not kind or kind in SKIP_KINDS:
            skipped += 1
            continue
        geom = e.get("geometry") or []
        if geom:
            pts = [[round(v[0], 1), round(v[1], 1)]
                   for v in (proj(g["lat"], g["lon"]) for g in geom)]
            # the anchor is the ring/line centroid, which is what a point-form
            # recipe wants; `g` keeps the shape for anything that draws a line
            x = sum(p[0] for p in pts) / len(pts)
            z = sum(p[1] for p in pts) / len(pts)
        else:
            c = e.get("center") or e
            lat, lon = c.get("lat"), c.get("lon")
            if lat is None or lon is None:
                continue
            x, z = proj(lat, lon)
            pts = None
        name = t.get("name")
        if not name:
            unnamed += 1
        rec = {"p": [round(x, 1), round(z, 1)], "k": kind}
        if pts and len(pts) >= 2:
            rec["g"] = pts
        if name:
            rec["n"] = name
        # carried through because the DRAW side needs them to tell a 42.5m
        # coaster from a carousel, and because a height a source published is
        # worth more than any rule we could invent
        for key in ("height", "ele", "attraction", "man_made", "operator"):
            if t.get(key):
                rec[key[0] if key == "height" else key] = t[key]
        out.append(rec)

    out.sort(key=lambda r: (r.get("n") or "~", r["p"][0]))
    scene["attractions"] = out
    json.dump(scene, open(path, "w"), separators=(",", ":"))

    named = sum(1 for r in out if r.get("n"))
    kinds = {}
    for r in out:
        kinds[r["k"]] = kinds.get(r["k"], 0) + 1
    print(f"  {len(out)} attractions written to {did}.json "
          f"({named} named, {unnamed} unnamed, {skipped} skipped as hotels/info)")
    print("  by kind: " + ", ".join(f"{k} {v}" for k, v in sorted(kinds.items(), key=lambda kv: -kv[1])))


if __name__ == "__main__":
    main()
