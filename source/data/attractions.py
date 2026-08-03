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


def fetch(bbox, query=None):
    body = (query or QUERY).format(bbox=bbox)
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
    # NOT sys.exit. The site-naming pass below reads the LOCAL cache and is the
    # most valuable thing this script does; killing the run because a public
    # server is busy would throw that away for no reason. Return nothing and
    # let the caller keep whatever the scene already had.
    print("  every Overpass mirror refused — keeping the existing layer")
    return None


# THE ROCK GROYNES. Reference photographs of Siloso Beach show the thing that
# actually shapes it: boulder groynes and rocky outcrops running out into the
# water, which is what makes the swimming lagoon a lagoon. They are mapped
# (natural=bare_rock / rock / reef, man_made=breakwater / groyne) and, like the
# attractions, nothing in this pipeline had ever asked for them.
ROCK_QUERY = ('[out:json][timeout:120];('
              'nwr["man_made"="breakwater"]({bbox});'
              'nwr["man_made"="groyne"]({bbox});'
              'nwr["natural"~"^(bare_rock|rock|reef|shingle)$"]({bbox});'
              ');out tags geom;')


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    d = district(did)
    path = os.path.join(HERE, f"{did}.json")
    if not os.path.exists(path):
        sys.exit(f"no scene file for '{did}'")
    scene = json.load(open(path))

    print(f"== attractions: {did}")
    raw = fetch(d["bbox"])
    els = (raw or {}).get("elements", [])
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
    if out or "attractions" not in scene:
        scene["attractions"] = out
    else:
        out = scene["attractions"]        # fetch failed; keep what we had
    json.dump(scene, open(path, "w"), separators=(",", ":"))

    named = sum(1 for r in out if r.get("n"))
    kinds = {}
    for r in out:
        kinds[r["k"]] = kinds.get(r["k"], 0) + 1
    print(f"  {len(out)} attractions written to {did}.json "
          f"({named} named, {unnamed} unnamed, {skipped} skipped as hotels/info)")
    print("  by kind: " + ", ".join(f"{k} {v}" for k, v in sorted(kinds.items(), key=lambda kv: -kv[1])))

    # NAME THE BUILDING FROM THE SITE IT STANDS IN.
    #
    # The owner: "cannot tell any landmark rlly at all" — and here is a large
    # part of why. Shangri-La's Rasa Sentosa Resort & Spa IS in our raw cache,
    # OSM way 595202369, with its name, phone number and star rating. It is
    # tagged `tourism=hotel` and `landuse=commercial` and carries NO `building`
    # tag at all, because it is the SITE boundary, not the footprint. The
    # building pass correctly ignores it — and nothing anywhere then hands that
    # name to the 5,898 m2 building standing ten metres away inside it.
    #
    # So the island was full of landmarks whose names we held and never used.
    # This transfers a surveyed name onto the surveyed footprint it encloses:
    # for each named site polygon that is not itself a building, the LARGEST
    # unnamed building whose centre falls inside it takes the name. Largest,
    # because a resort site contains its plant rooms and pool bars too and the
    # name belongs to the main mass. Nothing named is ever overwritten.
    # READ FROM THE LOCAL RAW CACHE, NOT THE NETWORK. Every one of these names
    # was already downloaded and sitting on disk — 715 named non-building
    # polygons in data/raw/sentosa.json — and re-asking Overpass for them was
    # both pointless and, on the day this was written, impossible: three
    # mirrors returned 504s and a bad certificate in a row. A pass that works
    # off data we already hold cannot be blocked by a busy server.
    sites = []
    raw_path = os.path.join(HERE, "raw", f"{did}.json")
    if os.path.exists(raw_path):
        for e in json.load(open(raw_path)).get("elements", []):
            t = e.get("tags") or {}
            if t.get("building") or not t.get("name"):
                continue
            geom = e.get("geometry") or []
            if len(geom) < 4:
                continue
            sites.append((t["name"], [proj(g["lat"], g["lon"]) for g in geom]))
        print(f"  {len(sites)} named site polygons in the local raw cache")

    def inside(px, pz, ring):
        c = False
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, zi = ring[i]
            xj, zj = ring[j]
            if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                c = not c
            j = i
        return c

    named_now = 0
    for site_name, ring in sites:
        best, best_a = None, 0
        for b in scene.get("buildings", []):
            if b.get("n") or not b.get("p"):
                continue
            xs = [q[0] for q in b["p"]]
            zs = [q[1] for q in b["p"]]
            cx, cz = (min(xs) + max(xs)) / 2, (min(zs) + max(zs)) / 2
            if not inside(cx, cz, ring):
                continue
            if (b.get("a") or 0) > best_a:
                best, best_a = b, b.get("a") or 0
        if best is not None and best_a > 120:
            best["n"] = site_name
            named_now += 1
    if named_now:
        print(f"  {named_now} buildings took the name of the site they stand in")

    # ...and the rock groynes, in the same pass so one run does both
    rocks = []
    for e in ((fetch(d["bbox"], ROCK_QUERY) or {}).get("elements", [])):
        t = e.get("tags") or {}
        geom = e.get("geometry") or []
        if len(geom) < 3:
            continue
        pts = [[round(v[0], 1), round(v[1], 1)]
               for v in (proj(g["lat"], g["lon"]) for g in geom)]
        rocks.append({"k": t.get("man_made") or t.get("natural") or "rock", "g": pts,
                      **({"n": t["name"]} if t.get("name") else {})})
    if rocks or "rocks" not in scene:
        scene["rocks"] = rocks
    else:
        rocks = scene["rocks"]            # fetch failed; keep what we had
    json.dump(scene, open(path, "w"), separators=(",", ":"))
    print(f"  {len(rocks)} rock groynes / outcrops written")


if __name__ == "__main__":
    main()
