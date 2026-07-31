#!/usr/bin/env python3
"""Cache HDB Property Information locally.

    python3 data/hdb_fetch.py            # fetch if the cache is missing
    python3 data/hdb_fetch.py --force    # refetch over an existing cache

WHY THIS EXISTS. Until now every HDB block in the world whose OSM way carried a
junk `height=0` tag fell through to `TYPE_DEFAULT["residential"] = 40`, so a
25-storey slab and a 12-storey one were drawn at the same 40m. Little India
carries a real height on 4 buildings out of 2,087 and Robertson on 18 out of
558; both districts are full of HDB. That is not a Little India problem, it is
one missing join.

HDB publishes `max_floor_lvl` and `year_completed` for all 13,357 blocks in
Singapore, free, under the Singapore Open Data Licence. Both fields are
authoritative -- they come from HDB's own building records, not from a survey
of the map -- and they are keyed by the block number and street, which is
exactly what OSM already tags on these ways as `addr:housenumber` and
`addr:street`.

WHAT THIS DOES NOT GIVE US. There is no height field of any kind in the
dataset; the full field list is checked below and the check is not decorative.
A storey count times an assumed floor height is a DERIVATION, and this project
has a standing rule against passing those off as measurements, so everything
downstream records it as such. What is NOT derived is `year_completed`, which
is a published fact and is worth as much as the storeys: it dates thousands of
buildings that carried no date at all.

THE FETCH GUARD. A refetch that comes back short is worse than no refetch,
because it overwrites a good cache with a bad one -- that already happened once
here with Overpass and cost 172 buildings and 573 roads. So a --force refetch
must return at least 95% of the rows the existing cache holds, or it is thrown
away and the old cache is left exactly where it was.
"""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "hdb_blocks.json")
RESOURCE = "d_17f5382f26140b1fdae0ba2ef6239d2f"
URL = "https://data.gov.sg/api/action/datastore_search"
PAGE = 2000

# The fields this project actually joins on or reads. If HDB ever drops one,
# the fetch should fail loudly here rather than silently produce a cache with a
# missing column that a downstream `.get()` turns into a default.
# `market_hawker`, `miscellaneous` and `precinct_pavilion` are not decoration:
# they say what KIND of block this is, and a 2-storey wet market is not two
# residential floors tall. Without them, a single-storey hawker centre came out
# at 2.9m -- shorter than its own doorway.
NEEDED = ("blk_no", "street", "max_floor_lvl", "year_completed",
          "residential", "commercial", "market_hawker", "miscellaneous",
          "multistorey_carpark", "precinct_pavilion", "total_dwelling_units")


def fetch_all():
    out, offset, total = [], 0, None
    while True:
        url = f"{URL}?resource_id={RESOURCE}&limit={PAGE}&offset={offset}"
        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=60) as r:
                    d = json.loads(r.read().decode())
                break
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
                if attempt == 3:
                    sys.exit(f"  ! data.gov.sg failed at offset {offset}: {e}")
                time.sleep(2 + attempt * 3)
        if not d.get("success"):
            sys.exit(f"  ! data.gov.sg returned success=false at offset {offset}")
        res = d["result"]
        if total is None:
            total = res.get("total")
            have = {f["id"] for f in res.get("fields", [])}
            missing = [k for k in NEEDED if k not in have]
            if missing:
                sys.exit(f"  ! dataset no longer carries {missing}; the join cannot be trusted")
            print(f"  {total} blocks published")
        recs = res.get("records") or []
        if not recs:
            break
        out.extend(recs)
        offset += len(recs)
        print(f"  {len(out)}/{total}", end="\r", flush=True)
        if total and len(out) >= total:
            break
    return out


def main():
    force = "--force" in sys.argv
    old = None
    if os.path.exists(CACHE):
        old = json.load(open(CACHE))
        if not force:
            print(f"  cache hit: {len(old['blocks'])} blocks — pass --force to refetch")
            return
    rows = fetch_all()
    print()
    if not rows:
        sys.exit("  ! fetch returned nothing; cache untouched")
    if old and len(rows) < 0.95 * len(old["blocks"]):
        sys.exit(f"  ! refetch returned {len(rows)} against {len(old['blocks'])} cached "
                 f"({100*len(rows)/len(old['blocks']):.0f}%). REFUSED — the cache is "
                 f"unchanged. A short fetch is not an update, it is data loss.")
    blocks = [{k: r.get(k) for k in NEEDED} for r in rows]
    json.dump({"source": f"data.gov.sg resource {RESOURCE} (HDB Property Information)",
               "fetched": time.strftime("%Y-%m-%d"),
               "licence": "Singapore Open Data Licence",
               "blocks": blocks}, open(CACHE, "w"))
    print(f"  wrote {CACHE}  {len(blocks)} blocks  "
          f"{os.path.getsize(CACHE)/1024:.0f} KB")

    # SPOT CHECK against five blocks whose storeys were established independently
    # in research/littleindia-hdb-towers.md from the same API a day earlier. If
    # the shape of the data has moved under us, this says so at fetch time
    # rather than at render time.
    want = {("661", "BUFFALO RD"): 23, ("662", "BUFFALO RD"): 25,
            ("663", "BUFFALO RD"): 21, ("664", "BUFFALO RD"): 4,
            ("665", "BUFFALO RD"): 2}
    got = {(b["blk_no"], b["street"]): b["max_floor_lvl"] for b in blocks}
    bad = [k for k, v in want.items() if got.get(k) != str(v)]
    print("  spot check on Tekka blocks 661-665: "
          + ("PASS" if not bad else f"FAIL on {bad} — got "
             + str({k: got.get(k) for k in bad})))


main()
