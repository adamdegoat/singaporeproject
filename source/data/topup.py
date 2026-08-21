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
sys.path.insert(0, HERE)
REG = json.load(open(os.path.join(HERE, "districts.json")))
MIRRORS = ["https://overpass-api.de/api/interpreter",
           "https://overpass.private.coffee/api/interpreter",
           "https://overpass.kumi.systems/api/interpreter"]

# THE LAYER TABLE LIVES IN osmlayers.py, and its header says why: this file
# and build_district.py had drifted into asking for different worlds, twelve
# layers apart, with nothing to say so. One table, both callers.
from osmlayers import LAYERS  # noqa: E402  (after HERE is on sys.path)


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
