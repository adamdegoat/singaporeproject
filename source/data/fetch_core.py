#!/usr/bin/env python3
"""Overpass is flaky under load, so fetch in small pieces with retries across
mirrors and merge. Writes raw_core.json in the same shape as one combined query."""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
BBOX = "1.3015,103.8310,1.3058,103.8368"
MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.osm.jp/api/interpreter",
]
PARTS = {
    "buildings": f'way["building"]({BBOX});',
    "roads": f'way["highway"~"^(trunk|primary|secondary|tertiary|residential|service|unclassified|living_street|pedestrian)$"]({BBOX});',
    "paths": f'way["highway"="footway"]({BBOX});',
    "trees": f'node["natural"="tree"]({BBOX});',
}


def run(part, body, attempts=4):
    q = f"[out:json][timeout:120];\n({body}\n);\nout geom;"
    for a in range(attempts):
        mirror = MIRRORS[a % len(MIRRORS)]
        try:
            req = urllib.request.Request(
                mirror, data=q.encode(), headers={"User-Agent": "orchard-lookdev/1.0"})
            with urllib.request.urlopen(req, timeout=150) as r:
                data = json.loads(r.read().decode())
            n = len(data.get("elements", []))
            print(f"  {part:10s} ok  {n:5d} elements  via {mirror.split('//')[1].split('/')[0]}", flush=True)
            return data["elements"]
        except Exception as e:
            print(f"  {part:10s} attempt {a+1} failed on {mirror.split('//')[1].split('/')[0]}: "
                  f"{type(e).__name__}", flush=True)
            time.sleep(6 + a * 8)
    print(f"  {part:10s} GAVE UP", flush=True)
    return []


def main():
    merged, seen = [], set()
    for part, body in PARTS.items():
        for e in run(part, body):
            k = (e["type"], e["id"])
            if k not in seen:
                seen.add(k)
                merged.append(e)
    out = {"elements": merged}
    path = os.path.join(HERE, "raw_core.json")
    json.dump(out, open(path, "w"))
    print(f"\nmerged {len(merged)} elements -> {path} ({os.path.getsize(path)/1024:.0f} KB)")
    return 0 if merged else 1


if __name__ == "__main__":
    sys.exit(main())
