#!/usr/bin/env python3
"""Put the REAL street lamps into a district's scene file.

    python3 lamps.py orchard

Same story as the ERP gantries, and the same mistake underneath it. The accuracy
ledger said: *street lamps — NOT MAPPED in OSM here (checked highway=street_lamp)*
and placed a lamp every 96 metres along each road. LTA publishes all 126,144 lamp
posts in Singapore on data.gov.sg under the Open Data Licence, as points with a
lamp post number.

That is the FOURTH time "no data exists" has been false here — crossings,
`sidewalk=`, the gantries, now this — and every one of them was concluded from
checking a single tag in a single source.

Only lamps within the dressing band are kept: the rest of the bbox is 3,700 more
lamps on streets this world does not build, which is the same rule the kerbs and
the trees already follow.
"""
import json, math, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATASET = "d_ca109de3e83efdd9a10bc5f3dda70a98"          # LTA Lamp Post (GEOJSON)
CACHE = os.path.join(HERE, "raw", "lamps.geojson")
POLL = f"https://api-open.data.gov.sg/v1/public/api/datasets/{DATASET}/poll-download"
REACH = 230.0            # the dressing band, same as selectSideStreets

REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"][0], REG["island_origin"][1]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))


def proj(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


def fetch():
    if os.path.exists(CACHE):
        return json.load(open(CACHE))
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with urllib.request.urlopen(POLL, timeout=60) as r:
        url = json.load(r)["data"]["url"]
    with urllib.request.urlopen(url, timeout=300) as r:
        data = json.loads(r.read().decode())
    json.dump(data, open(CACHE, "w"))
    return data


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "orchard"
    path = os.path.join(HERE, f"{did}.json")
    scene = json.load(open(path))

    # every road this district actually dresses, as segments
    segs = []
    for r in scene.get("roads", []):
        if r.get("k") in ("footway", "steps"):
            continue
        p = r["p"]
        segs += list(zip(p, p[1:]))
    axis = scene.get("axis")
    if axis:
        segs += list(zip(axis["p"], axis["p"][1:]))

    CELL = 60.0
    grid = {}
    for a, b in segs:
        mnx, mxx = sorted((a[0], b[0]))
        mnz, mxz = sorted((a[1], b[1]))
        for cx in range(int((mnx - REACH) // CELL), int((mxx + REACH) // CELL) + 1):
            for cz in range(int((mnz - REACH) // CELL), int((mxz + REACH) // CELL) + 1):
                grid.setdefault((cx, cz), []).append((a, b))

    def near_road(x, z):
        """distance to the nearest road this district builds, or None if far"""
        best = REACH
        cx, cz = int(x // CELL), int(z // CELL)
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                for a, b in grid.get((cx + dx, cz + dz), ()):
                    vx, vz = b[0] - a[0], b[1] - a[1]
                    l2 = vx * vx + vz * vz
                    t = 0 if l2 < 1e-9 else max(0, min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l2))
                    d = math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t))
                    if d < best:
                        best = d
        return best if best < REACH else None

    xs = [q[0] for b in scene["buildings"] for q in b["p"]]
    zs = [q[1] for b in scene["buildings"] for q in b["p"]]
    pad = 80
    bb = (min(xs) - pad, min(zs) - pad, max(xs) + pad, max(zs) + pad)

    out, far = [], 0
    for ft in fetch()["features"]:
        g = ft["geometry"]
        if g["type"] != "Point":
            continue
        x, z = proj(g["coordinates"][1], g["coordinates"][0])
        if not (bb[0] <= x <= bb[2] and bb[1] <= z <= bb[3]):
            continue
        # A lamp more than 22m from any road we build belongs to a car park, a
        # back lane or a service yard that is not part of this world.
        d = near_road(x, z)
        if d is None or d > 22:
            far += 1
            continue
        out.append([round(x, 1), round(z, 1)])

    scene["lamps"] = out
    json.dump(scene, open(path, "w"), separators=(",", ":"))
    print(f"  {len(out)} real lamp posts written to {did}.json ({far} skipped: not on a built road)")


if __name__ == "__main__":
    main()
