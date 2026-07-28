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
    "towers": 'way["man_made"="tower"]({bbox});node["man_made"="tower"]({bbox});',
    "water": ('way["natural"="water"]({bbox});rel["natural"="water"]({bbox});'
              'way["landuse"="reservoir"]({bbox});rel["landuse"="reservoir"]({bbox});'
              'way["waterway"~"^(riverbank|dock|canal|river|stream)$"]({bbox});'
              'rel["waterway"="riverbank"]({bbox});'),
    "coast": 'way["natural"="coastline"]({bbox});',
    "buildrel": 'rel["building"]({bbox});',
}


def main():
    did, layer = sys.argv[1], sys.argv[2]
    d = next(x for x in REG["districts"] if x["id"] == did)
    bbox = d["bbox"]
    body = LAYERS[layer].format(bbox=bbox)
    q = f"[out:json][timeout:120];\n({body}\n);\nout geom;"
    got = None
    for attempt, url in enumerate([m for m in MIRRORS for _ in (0, 1)]):
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
