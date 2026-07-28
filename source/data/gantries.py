#!/usr/bin/env python3
"""Put the REAL ERP gantries into a district's scene file.

    python3 gantries.py orchard

The accuracy ledger called ERP gantries "genuinely unmapped" and placed two per
axis at arclengths 300 and 700, which are numbers nobody measured. LTA publishes
every gantry in Singapore on data.gov.sg under the Open Data Licence, as
LINESTRINGS: the line is the span across the carriageway, so it carries the
position, the orientation AND the width, all three of which were being invented.

That is the third time "no data exists" has turned out to be false on this
project, after the pedestrian crossings and the `sidewalk=` tags. Grep before
accepting an INVENTED line.

The dataset does not say which gantries are ERP and which carry EMAS signs — the
only attribute is a mostly-empty GNTRY_NUM. So each one is cross-checked against
the `toll=yes` ways in our own OSM extract, which is the tag Singapore uses to
mark an ERP-charged segment: all ten in the district sit within five metres of
one, which is what makes them ERP rather than signage.
"""
import json, math, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATASET = "d_753090823cc9920ac41efaa6530c5893"          # LTA Gantry (GEOJSON)
CACHE = os.path.join(HERE, "raw", "gantry.geojson")
POLL = f"https://api-open.data.gov.sg/v1/public/api/datasets/{DATASET}/poll-download"

REG = json.load(open(os.path.join(HERE, "districts.json")))
ORIGIN = REG["island_origin"]
LAT0, LON0 = ORIGIN[0], ORIGIN[1]      # [lat, lon] in districts.json
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))


def proj(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


def fetch(force=False):
    if os.path.exists(CACHE) and not force:
        return json.load(open(CACHE))
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with urllib.request.urlopen(POLL, timeout=60) as r:
        url = json.load(r)["data"]["url"]
    with urllib.request.urlopen(url, timeout=120) as r:
        data = json.loads(r.read().decode())
    json.dump(data, open(CACHE, "w"))
    return data


def toll_segments(district_id):
    """Every `toll=yes` way in this district's raw extract, projected."""
    path = os.path.join(HERE, "raw", f"{district_id}.json")
    if not os.path.exists(path):
        return []
    segs = []
    for e in json.load(open(path)).get("elements", []):
        t = e.get("tags", {}) or {}
        if t.get("toll") == "yes" and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            segs += list(zip(pts, pts[1:]))
    return segs


def near_toll(x, z, segs, reach=25.0):
    for a, b in segs:
        vx, vz = b[0] - a[0], b[1] - a[1]
        l2 = vx * vx + vz * vz
        t = 0 if l2 < 1e-9 else max(0, min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l2))
        if math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)) < reach:
            return True
    return False


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "orchard"
    scene_path = os.path.join(HERE, f"{did}.json")
    scene = json.load(open(scene_path))

    # the district's own extent, from the geometry already in the scene
    xs = [q[0] for b in scene["buildings"] for q in b["p"]]
    zs = [q[1] for b in scene["buildings"] for q in b["p"]]
    pad = 60
    bb = (min(xs) - pad, min(zs) - pad, max(xs) + pad, max(zs) + pad)

    segs = toll_segments(did)
    out, skipped = [], 0
    for ft in fetch()["features"]:
        g = ft["geometry"]
        if g["type"] != "LineString":
            continue
        pts = [proj(c[1], c[0]) for c in g["coordinates"]]
        cx = sum(p[0] for p in pts) / len(pts)
        cz = sum(p[1] for p in pts) / len(pts)
        if not (bb[0] <= cx <= bb[2] and bb[1] <= cz <= bb[3]):
            continue
        if segs and not near_toll(cx, cz, segs):
            skipped += 1        # a sign or EMAS gantry, not an ERP one
            continue
        dx, dz = pts[-1][0] - pts[0][0], pts[-1][1] - pts[0][1]
        span = math.hypot(dx, dz)
        if span < 4:
            continue
        # The structure is built along its local +X and then turned by `a`.
        # rotateY sends +X to (cos a, -sin a), so to lay it along the surveyed
        # line, a = atan2(-dz, dx). Getting this wrong puts the gantry ALONG the
        # road instead of across it, which is the one thing it must not do.
        ang = math.atan2(-dz, dx)
        out.append({"p": [round(cx, 1), round(cz, 1)],
                    "a": round(ang, 4), "w": round(span, 1)})

    scene["gantries"] = out
    json.dump(scene, open(scene_path, "w"), separators=(",", ":"))
    print(f"  {len(out)} real ERP gantries written to {did}.json"
          + (f" ({skipped} gantries skipped: not on a tolled road)" if skipped else ""))


if __name__ == "__main__":
    main()
