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

# ATTRACTIONS THE MAP DOES NOT CARRY, WITH THE RESEARCH THAT PLACES THEM.
# Same bar as names.py's ADDS and authored.json: a citation per entry, nothing
# on a hunch, and a position somebody measured. `--authored-only` appends these
# to an already-written scene without touching the fetched layer — the fetch
# rewrites the whole layer from Overpass, which is not a 3am operation.
AUTHORED = [
    # research/palawan-spawn.md §3.5: faint court markings on the sand in the
    # 2026 satellite at 1.2483, 103.8226 (SAT). SDC published 141 bookable
    # courts across the beaches (2020-22 regime, free since 14 Mar 2022); no
    # Palawan count is published, so ONE court, at the measured markings.
    {"n": "Beach volleyball", "k": "beachcourt", "lat": 1.2483, "lon": 103.8226,
     "src": "research/palawan-spawn.md §3.5 (SAT court markings)"},
]


def authored_only(did):
    path = os.path.join(HERE, f"{did}.json")
    d = json.load(open(path))
    recs = d.get("attractions") or []
    added = 0
    for e in AUTHORED:
        x = (e["lon"] - LON0) * M_LON
        z = (LAT0 - e["lat"]) * M_LAT
        dup = any(r.get("k") == e["k"]
                  and (r["p"][0] - x) ** 2 + (r["p"][1] - z) ** 2 < 100
                  for r in recs)
        if dup:
            continue
        recs.append({"p": [round(x, 1), round(z, 1)], "k": e["k"], "n": e["n"]})
        added += 1
    d["attractions"] = recs
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"  authored: +{added} attraction(s) into {did}.json ({len(recs)} total)")


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


# THIS FETCH IS CACHED TO DISK, AND THE REASON IS A BUILD THAT SHIPPED EMPTY.
#
# Every other input to a district build comes off local disk — data/raw/<id>.json
# or the osmlocal extract; "THE MAP IS A FILE NOW" is one of this project's own
# headline notes. This pass is the single exception: a live Overpass call in the
# middle of build_district.py. On 2026-08-07 all three mirrors refused at once
# (504, then an SSL hostname mismatch on overpass.osm.jp) and the consequences
# ran a long way:
#
#   * process.py rewrites the scene file from scratch at the start of a build,
#     so `attractions` was ABSENT rather than stale — and the "keep what we
#     had" fallback below had nothing to keep. It wrote ZERO.
#   * four passes read that layer. sensoryscape, ussgate, bullring and skywalk
#     each printed "not built" and the SCENTED SPHERE, the diagrid vessels, the
#     Universal gate, the Bull Ring and the Fort Siloso Skywalk all vanished.
#   * the golden frames caught it at 50.4% (sensory-vessels) — the whole
#     Sensoryscape boardwalk replaced by grass.
#
# It also explains something noticed earlier the same day and written off as
# OSM churn: three consecutive builds returned 110, 115 and 117 attractions
# from the same query. That was never the map changing. It was the mirrors
# answering differently, and a WORLD THAT CHANGES WHEN A PUBLIC SERVER HICCUPS
# IS NOT REPRODUCIBLE.
#
# So: a good response is written to data/raw/attr.<id>.json, and a failed fetch
# reads it back. Delete the file to force a genuine refetch.
def cache_path(did, tag):
    return os.path.join(HERE, "raw", f"attr.{tag}.{did}.json")


def fetch(bbox, query=None, did=None, tag="main"):
    body = (query or QUERY).format(bbox=bbox)
    for m in MIRRORS:
        try:
            print(f"  asking {m.split('/')[2]}")
            req = urllib.request.Request(
                m, data=urllib.parse.urlencode({"data": body}).encode(),
                headers={"User-Agent": "orchard-attractions/1.0"})
            with urllib.request.urlopen(req, timeout=240) as r:
                data = json.loads(r.read().decode())
            if did and (data.get("elements") or []):
                try:
                    os.makedirs(os.path.join(HERE, "raw"), exist_ok=True)
                    json.dump(data, open(cache_path(did, tag), "w"),
                              separators=(",", ":"))
                except OSError as e:                 # noqa: BLE001
                    print(f"    (could not cache: {type(e).__name__})")
            return data
        except Exception as e:                       # noqa: BLE001 - any failure fails over
            print(f"    failed: {type(e).__name__} {e}")
            time.sleep(3)
    if did and os.path.exists(cache_path(did, tag)):
        data = json.load(open(cache_path(did, tag)))
        n = len(data.get("elements") or [])
        print(f"  every Overpass mirror refused — REPLAYING THE CACHE "
              f"({n} elements, {cache_path(did, tag).split('/')[-1]})")
        return data
    # NOT sys.exit. The site-naming pass below reads the LOCAL cache and is the
    # most valuable thing this script does; killing the run because a public
    # server is busy would throw that away for no reason. Return nothing and
    # let the caller keep whatever the scene already had.
    print("  every Overpass mirror refused AND NO CACHE EXISTS — keeping the "
          "existing layer, which on a fresh build is nothing at all")
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
    raw = fetch(d["bbox"], did=did, tag="main")
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

    # THE PLAY AREA IS THE ISLAND; THE VIEW IS NOT (SENTOSA.md).
    #
    # This fetch is a live Overpass call over the DISTRICT BBOX, and the bbox
    # reaches across the strait. Two consecutive runs a day apart returned 110
    # and 119 attractions from the same query — the count is not stable — and
    # the nine that arrived the second time included Berlayer Point Lighthouse
    # and Dragon's Teeth Gate, both in Labrador Park on the MAINLAND. Nothing
    # downstream clips this layer (island.py runs before it), so they would
    # have shipped as named labels floating over the far shore, on ground the
    # player cannot reach.
    #
    # The cut is by DISTANCE OUTSIDE THE RING, not by inside/outside, because
    # inside/outside deletes the right things too. Measured, this run:
    #
    #     14 m  Jetty Ruin                              Sentosa's own shore
    #     72 m  "Sentosa" artwork
    #     85 m  Southernmost Point of Continental Asia  Palawan islet, and you
    #     87 m    (the same point, twice, two kinds)    walk to it on a bridge
    #    122 m  Reverie - Musical Journey               the boardwalk
    #    ----  200 m  ------------------------------------------------------
    #    324 m  Berlayer Point Lighthouse               MAINLAND
    #    368 m  Dragon's Teeth Gate                     MAINLAND
    #    456 m  Cycling Track Sentosa                   MAINLAND
    #    527 m  (unnamed) train                         MAINLAND
    #
    # The gap either side of 200 m is wide (122 -> 324) and it is the strait.
    # Only applied where the scene HAS an island ring, so every other district
    # is untouched.
    ring = scene.get("islandRing")
    if ring and len(ring) >= 3:
        def _d2ring(px, pz):
            best = float("inf")
            for i in range(len(ring)):
                ax, az = ring[i]
                bx, bz = ring[(i + 1) % len(ring)]
                dx, dz = bx - ax, bz - az
                L2 = dx * dx + dz * dz
                t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / L2))
                best = min(best, math.hypot(px - (ax + dx * t), pz - (az + dz * t)))
            return best

        def _inside(px, pz):
            c = False
            j = len(ring) - 1
            for i in range(len(ring)):
                xi, zi = ring[i]
                xj, zj = ring[j]
                if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                    c = not c
                j = i
            return c

        OFFSHORE_M = 200.0
        keep, cut = [], []
        for r in out:
            px, pz = r["p"]
            if _inside(px, pz) or _d2ring(px, pz) <= OFFSHORE_M:
                keep.append(r)
            else:
                cut.append((round(_d2ring(px, pz)), r.get("n") or "(unnamed)", r["k"]))
        if cut:
            print(f"  {len(cut)} across the water, dropped — this district's play "
                  f"area is the island (>{OFFSHORE_M:.0f}m outside the ring):")
            for dist, nm, k in sorted(cut, reverse=True):
                print(f"     {dist:5d} m   {nm}  [{k}]")
        out = keep

    out.sort(key=lambda r: (r.get("n") or "~", r["p"][0]))
    if out or "attractions" not in scene:
        scene["attractions"] = out
    else:
        out = scene["attractions"]        # fetch failed; keep what we had
    json.dump(scene, open(path, "w"), separators=(",", ":"))
    # AN EMPTY ATTRACTIONS LAYER IS A BUILD FAILURE, NOT A RESULT. Four passes
    # read this layer and each of them politely prints "not built" and exits 0
    # when it is empty, so a build with no attractions at all still reported
    # success while the Sensoryscape, the Universal gate, the Bull Ring and the
    # Fort Siloso Skywalk quietly stopped existing. With the cache above this
    # should now be unreachable — which is exactly when a guard is worth having.
    _empty = not out
    if _empty:
        print("  ! ZERO attractions in the scene. sensoryscape, ussgate, "
              "bullring, skywalk and entrances all read this layer and will "
              "each build NOTHING. Exiting non-zero so the build says so.")

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
        # A SITE IS AN AREA. THIS NEVER CHECKED, AND ROADS WERE NAMING
        # BUILDINGS (found 2026-08-07, research/sentosa-heights.md §4).
        #
        # The rule below says "named site polygon" and the filter only ever
        # tested "not a building, and has a name". A named `highway` way with
        # four or more nodes passed, and `inside()` then treated its node list
        # as a closed ring — so a road that curves, and above all a road that
        # LOOPS, donated its name to whatever stood inside the loop.
        #
        # Measured on Sentosa: SEVENTEEN footprints were wearing the name of a
        # road in our own road layer. `Woolwich Road` was a 2,152 m2 building.
        # The Cove is the worst of it and the mechanism is plainest there — the
        # residential streets ring their own islands, so every house inside
        # came out called `Treasure Island`, `Paradise Island`, `Coral Island`,
        # `Sandy Island` or `Pearl Island`, which read as five islands' worth of
        # confidently wrong labels floating over Sentosa Cove.
        #
        # Two tests, because either alone lets it through:
        #   * the way must be CLOSED — an area's ring starts where it ends;
        #   * and must not be a LINEAR feature, because closed linear ways are
        #     real (a roundabout, a loop road, a ring path) and are still not
        #     sites. `area=yes` is OSM's own override and is honoured.
        LINEAR = ("highway", "barrier", "waterway", "railway", "aerialway",
                  "route", "power", "man_made" )
        skipped_line = skipped_open = 0
        for e in json.load(open(raw_path)).get("elements", []):
            t = e.get("tags") or {}
            if t.get("building") or not t.get("name"):
                continue
            geom = e.get("geometry") or []
            if len(geom) < 4:
                continue
            if t.get("area") != "yes":
                if any(t.get(k) for k in LINEAR):
                    skipped_line += 1
                    continue
                a, b = geom[0], geom[-1]
                if abs(a["lat"] - b["lat"]) > 1e-9 or abs(a["lon"] - b["lon"]) > 1e-9:
                    skipped_open += 1
                    continue
            sites.append((t["name"], [proj(g["lat"], g["lon"]) for g in geom]))
        print(f"  {len(sites)} named site polygons in the local raw cache"
              f"  (skipped {skipped_line} linear + {skipped_open} unclosed — "
              f"a site is an area, and roads were naming buildings)")

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
    for e in ((fetch(d["bbox"], ROCK_QUERY, did=did, tag="rock") or {}).get("elements", [])):
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
    if _empty:
        sys.exit(1)


if __name__ == "__main__":
    if "--authored-only" in sys.argv:
        authored_only(next((a for a in sys.argv[1:] if not a.startswith("-")), "sentosa"))
    else:
        main()
