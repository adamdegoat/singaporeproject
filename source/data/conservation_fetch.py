#!/usr/bin/env python3
"""Cache URA's gazetted conservation-area polygons.

    python3 data/conservation_fetch.py            # fetch if the cache is missing
    python3 data/conservation_fetch.py --force    # refetch over an existing cache

WHY THIS EXISTS. Little India carries a construction date on 2 buildings out of
2,087 and Robertson Quay on none, so every shophouse a rider passes in those
districts was being dealt a facade by hashing its footprint -- a pre-war
masonry terrace given eighties balconies and curtain wall at the same rate as
Marina Bay. The shape-based fallback in city.js was written to soften that, and
it says of itself that it is a rule we chose, not a surveyed fact.

There IS a surveyed fact available, and this is it. URA gazettes conservation
areas, publishes their boundaries as a Master Plan layer, and documents the
construction period of the stock inside each one. A shophouse inside the Little
India Conservation Area is a pre-war shophouse -- that is WHY it is conserved.
That is not the same as knowing the year that particular building went up, and
nothing downstream pretends it is: the band lands in `era`, not in `yr`, and
the ledger reports the two separately.

The layer is Master Plan 2025 SDCP Conservation Area, data.gov.sg dataset
d_71dde3cffb001759a26674bbde7d888b, 298 polygons nationally. The download is a
two-step poll-then-fetch against a signed S3 URL that expires, so the file has
to be cached rather than fetched at build time.

THE FETCH GUARD, same as data/hdb_fetch.py: a refetch that comes back short
overwrites a good cache with a bad one. It must return at least 95% of the
polygons the cache already holds or it is thrown away.
"""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "conservation.json")
DATASET = "d_71dde3cffb001759a26674bbde7d888b"
POLL = f"https://api-open.data.gov.sg/v1/public/api/datasets/{DATASET}/poll-download"

# The world's bounding box, generously padded. The national layer is 1 MB and
# 298 polygons; there is no reason to carry Sembawang around in a repo about
# the city centre, and a smaller cache is a faster point-in-polygon pass.
# WIDENED EAST 2026-08-02 for tanjongrhu, whose bbox reaches 103.8860 — 100m
# past the old 103.885 edge, so its conserved fabric would have fallen
# outside the cache and been silently treated as unconserved. The national
# layer is ~1MB, so a wider box costs nothing; kept ahead of the ring so
# marinasouth, keppel, harbourfront and sentosa are already inside it.
BOX = (103.780, 1.230, 103.900, 1.330)


def _get(url, timeout=90):
    # The signed S3 blob refuses urllib's default User-Agent with a 403 while
    # serving the identical URL to curl. Say who we are.
    req = urllib.request.Request(url, headers={
        "User-Agent": "orchard-sg/1.0 (3D city model; data.gov.sg open data)"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == 3:
                sys.exit(f"  ! download failed: {e}")
            time.sleep(2 + attempt * 3)


def bbox(geom):
    xs, ys = [], []

    def walk(a):
        if a and isinstance(a[0], (int, float)):
            xs.append(a[0]); ys.append(a[1])
        else:
            for q in a:
                walk(q)
    walk(geom["coordinates"])
    return min(xs), min(ys), max(xs), max(ys)


def main():
    force = "--force" in sys.argv
    old = None
    if os.path.exists(CACHE):
        old = json.load(open(CACHE))
        if not force:
            print(f"  cache hit: {len(old['areas'])} areas — pass --force to refetch")
            return

    poll = json.loads(_get(POLL, 60).decode())
    if poll.get("code") != 0 or not (poll.get("data") or {}).get("url"):
        sys.exit(f"  ! poll-download refused: {str(poll)[:200]}")
    gj = json.loads(_get(poll["data"]["url"], 180).decode())
    feats = gj.get("features") or []
    if not feats:
        sys.exit("  ! layer came back with no features; cache untouched")
    print(f"  {len(feats)} polygons nationally")

    areas = []
    for f in feats:
        g = f.get("geometry") or {}
        if g.get("type") not in ("Polygon", "MultiPolygon"):
            continue
        x0, y0, x1, y1 = bbox(g)
        if x1 < BOX[0] or x0 > BOX[2] or y1 < BOX[1] or y0 > BOX[3]:
            continue
        # Rings only, and only the OUTER ring of each part. A conservation area
        # with a hole in it is not a thing URA draws, and carrying holes we do
        # not test for would be a lie of precision.
        parts = ([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"])
        rings = []
        for p in parts:
            if p and p[0]:
                rings.append([[round(c[0], 6), round(c[1], 6)] for c in p[0]])
        if not rings:
            continue
        areas.append({"name": (f["properties"].get("NAME") or "").strip(),
                      "bbox": [round(v, 6) for v in (x0, y0, x1, y1)],
                      "rings": rings})

    if old and len(areas) < 0.95 * len(old["areas"]):
        sys.exit(f"  ! refetch kept {len(areas)} areas against {len(old['areas'])} cached. "
                 f"REFUSED — the cache is unchanged.")
    json.dump({"source": f"data.gov.sg dataset {DATASET} "
                         f"(URA Master Plan 2025 SDCP Conservation Area layer)",
               "fetched": time.strftime("%Y-%m-%d"),
               "licence": "Singapore Open Data Licence",
               "box": list(BOX), "areas": areas}, open(CACHE, "w"))
    names = sorted({a["name"] for a in areas})
    print(f"  wrote {CACHE}  {len(areas)} polygons in {len(names)} named areas  "
          f"{os.path.getsize(CACHE)/1024:.0f} KB")

    # SPOT CHECK. Three areas that must be present and must contain a point we
    # already know is inside them -- if the layer's projection or winding ever
    # changes, this fails here rather than silently dating nothing.
    want = ("LITTLE INDIA", "KAMPONG GLAM", "CHINATOWN (KRETA AYER)")
    missing = [w for w in want if w not in names]
    print("  spot check: " + ("PASS" if not missing
                              else f"FAIL — layer has no {missing}"))


main()
