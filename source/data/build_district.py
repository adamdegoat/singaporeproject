#!/usr/bin/env python3
"""Build one district end to end: fetch OSM, project, correct, clear roads, write.

    python3 build_district.py orchard
    python3 build_district.py somerset --force

Everything district-specific lives in districts.json, so adding a new part of
Singapore is an entry in that file plus a run of this script. Overpass is the
slow and flaky part, so raw responses are cached per district and reused unless
--force is given.
"""
import argparse, json, math, os, re, subprocess, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
RAW_DIR = os.path.join(HERE, "raw")
# The canonical scene path is data/<id>.json, the same one terrain.py and the
# app use. This wrote to data/districts/<id>.json, so building any new
# district would have produced a SECOND scene file for it, which is the exact
# duplicate terrain.py already hard-errors on.
OUT_DIR = HERE

MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.osm.jp/api/interpreter",
]


def district(did):
    for d in REG["districts"]:
        if d["id"] == did:
            return d
    sys.exit(f"no district '{did}' in districts.json. Known: "
             + ", ".join(x["id"] for x in REG["districts"]))


def fetch_part(bbox, body, label, attempts=8, expect=True):
    """One Overpass query, retried across mirrors. Small pieces succeed where a
    single combined query times out — that is not optional, it is how this works."""
    q = f"[out:json][timeout:120];\n({body}\n);\nout geom;"
    for a in range(attempts):
        mirror = MIRRORS[a % len(MIRRORS)]
        host = mirror.split("//")[1].split("/")[0]
        try:
            req = urllib.request.Request(
                mirror, data=q.encode(), headers={"User-Agent": "sgproject/1.0"})
            with urllib.request.urlopen(req, timeout=150) as r:
                data = json.loads(r.read().decode())
            n = len(data.get("elements", []))
            # A part returning zero must be loud. A silent empty once produced a
            # whole district with no real street furniture positions at all, and
            # it only surfaced because the counts were checked by hand.
            if n == 0 and expect and a < attempts - 1:
                print(f"    {label:10s}     0 via {host} — suspicious, retrying elsewhere",
                      flush=True)
                time.sleep(3)
                continue
            print(f"    {label:10s} {n:5d} elements via {host}", flush=True)
            return data["elements"]
        except Exception as e:
            print(f"    {label:10s} attempt {a+1} failed on {host}: {type(e).__name__}", flush=True)
            time.sleep(5 + a * 7)
    print(f"    {label:10s} GAVE UP", flush=True)
    return []


def fetch(d, force=False):
    os.makedirs(RAW_DIR, exist_ok=True)
    path = os.path.join(RAW_DIR, f"{d['id']}.json")
    if os.path.exists(path) and not force:
        size = os.path.getsize(path) / 1024
        print(f"  raw cache hit ({size:.0f} KB) — pass --force to refetch")
        return path
    bbox = d["bbox"]
    parts = {
        "buildings": f'way["building"]({bbox});',
        "roads": (f'way["highway"~"^(trunk|primary|secondary|tertiary|residential|'
                  f'service|unclassified|living_street|pedestrian)$"]({bbox});'),
        "paths": f'way["highway"="footway"]({bbox});',
        # Real positions for everything we were previously placing at invented
        # intervals. This is the difference between a plausible street and an
        # accurate one, and it scales to every district for free.
        "trees": f'node["natural"="tree"]({bbox});way["natural"="tree_row"]({bbox});',
        "crossings": f'node["highway"="crossing"]({bbox});',
        "signals": f'node["highway"="traffic_signals"]({bbox});',
        "busstops": f'node["highway"="bus_stop"]({bbox});node["public_transport"="platform"]({bbox});',
        "mrt": (f'node["railway"="subway_entrance"]({bbox});'
                f'node["railway"="station"]({bbox});'
                f'way["railway"="subway_entrance"]({bbox});'),
        "taxi": f'node["amenity"="taxi"]({bbox});way["amenity"="taxi"]({bbox});',
        # real overhead bridges and covered walkways, and the actual tenants at
        # street level — the names people navigate by
        "bridges": f'way["highway"="footway"]["bridge"]({bbox});',
        "covered": f'way["highway"="footway"]["covered"]({bbox});',
        "shops": (f'node["shop"]({bbox});way["shop"]({bbox});'
                  f'node["amenity"~"^(restaurant|cafe|bank|fast_food|pharmacy|cinema)$"]({bbox});'),
        "water": f'way["natural"="water"]({bbox});way["waterway"]({bbox});',
    }
    merged, seen = [], set()
    empty = []
    for label, body in parts.items():
        got = fetch_part(bbox, body, label, expect=label not in ("water",))
        if not got and label not in ("water", "taxi"):
            empty.append(label)
        for e in got:
            k = (e["type"], e["id"])
            if k not in seen:
                seen.add(k)
                merged.append(e)
    if empty:
        print(f"  ! these parts came back EMPTY and probably should not have: "
              f"{', '.join(empty)}")
        print(f"  ! rerun with --force before trusting this district")
    json.dump({"elements": merged}, open(path, "w"))
    print(f"  raw: {len(merged)} elements -> {path} ({os.path.getsize(path)/1024:.0f} KB)")
    if not merged:
        sys.exit("  ! nothing fetched; Overpass may be down. Try again later.")
    return path


def process(d, raw_path):
    """Reuse process.py, which holds all the correction logic, by pointing it at
    this district's raw file and origin. One code path for every district."""
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, f"{d['id']}.json")
    env = dict(os.environ)
    env["SG_RAW"] = raw_path
    env["SG_OUT"] = out_path
    env["SG_LAT0"] = str(REG["island_origin"][0])
    env["SG_LON0"] = str(REG["island_origin"][1])
    env["SG_AXIS"] = d.get("axis", "")
    r = subprocess.run([sys.executable, os.path.join(HERE, "process.py")],
                       env=env, capture_output=True, text=True)
    print(r.stdout.rstrip())
    if r.returncode != 0:
        print(r.stderr[-2000:])
        sys.exit(f"  ! process.py failed for {d['id']}")
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--force", action="store_true", help="refetch from Overpass")
    a = ap.parse_args()
    d = district(a.id)

    print(f"== {d['name']}  [{d['id']}]  bbox {d['bbox']}")
    raw = fetch(d, a.force)
    out = process(d, raw)
    print(f"  scene: {out} ({os.path.getsize(out)/1024:.0f} KB)")
    print(f"\nNext: python3 check.py {d['id']}")


if __name__ == "__main__":
    main()
