#!/usr/bin/env python3
"""Build a ground heightfield for a district, and write it into the scene.

    python3 terrain.py orchard

Orchard Road climbs about 14m over its length, and a flat world gets that wrong
in a way you feel on a scooter.

Free global elevation data is a SURFACE model: in a dense city it reads rooftops,
not ground. So we sample along road centrelines only — roads are open sky, so the
reading there is close to the ground — then median-filter out the spikes where a
sample still caught a building, and interpolate a smooth grid from what is left.
"""
import argparse, json, math, os, statistics, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))

SOURCES = [
    ("open-elevation", "https://api.open-elevation.com/api/v1/lookup?locations={}"),
    ("opentopodata", "https://api.opentopodata.org/v1/srtm30m?locations={}"),
]
CELL = 35.0          # grid resolution in metres
SAMPLE_EVERY = 45.0  # along-road sampling interval


def district(did):
    for d in REG["districts"]:
        if d["id"] == did:
            return d
    sys.exit(f"no district '{did}'")


def scene_path(did):
    for p in (os.path.join(HERE, "districts", f"{did}.json"), os.path.join(HERE, f"{did}.json")):
        if os.path.exists(p):
            return p
    sys.exit(f"no scene for '{did}'; run build_district.py first")


def road_samples(data):
    """Points along every road of reasonable length, plus the main axis."""
    pts = []
    lines = [r["p"] for r in data["roads"]
             if r.get("k") not in ("footway", "pedestrian")]
    if data.get("axis"):
        lines.append(data["axis"]["p"])
    for line in lines:
        total = sum(math.dist(line[i], line[i + 1]) for i in range(len(line) - 1))
        if total < 25:
            continue
        s, acc, i = 0.0, 0.0, 0
        while s <= total and i < len(line) - 1:
            seg = math.dist(line[i], line[i + 1])
            if acc + seg < s:
                acc += seg; i += 1; continue
            t = 0 if seg < 1e-6 else (s - acc) / seg
            pts.append((line[i][0] + (line[i + 1][0] - line[i][0]) * t,
                        line[i][1] + (line[i + 1][1] - line[i][1]) * t))
            s += SAMPLE_EVERY
    return pts


def fetch_elev(latlons, source_idx=0):
    """Batched elevation lookup, falling back to the second source."""
    out = []
    name, tmpl = SOURCES[source_idx]
    B = 90
    for i in range(0, len(latlons), B):
        chunk = latlons[i:i + B]
        locs = "|".join(f"{la:.6f},{lo:.6f}" for la, lo in chunk)
        url = tmpl.format(urllib.parse.quote(locs, safe="|,"))
        for attempt in range(3):
            try:
                with urllib.request.urlopen(url, timeout=90) as r:
                    res = json.load(r)["results"]
                out.extend(float(x["elevation"]) for x in res)
                print(f"    {name}: {len(out)}/{len(latlons)}", flush=True)
                break
            except Exception as e:
                if attempt == 2:
                    if source_idx + 1 < len(SOURCES):
                        print(f"    {name} failed ({type(e).__name__}); trying next source")
                        return fetch_elev(latlons, source_idx + 1)
                    sys.exit(f"    elevation lookup failed: {e}")
                time.sleep(4 + attempt * 5)
        time.sleep(1.1)          # be polite to a free API
    return out


def despike(pts, elev, radius=110.0, tol=4.5):
    """Replace any sample that sits far above its neighbours: that is a rooftop,
    not the road. Uses a local median, which ignores outliers by construction."""
    kept, fixed = [], 0
    for i, (x, z) in enumerate(pts):
        near = [elev[j] for j, (x2, z2) in enumerate(pts)
                if (x - x2) ** 2 + (z - z2) ** 2 < radius * radius]
        med = statistics.median(near) if near else elev[i]
        if elev[i] - med > tol:
            kept.append(med); fixed += 1
        else:
            kept.append(elev[i])
    return kept, fixed


def build_grid(pts, elev, pad=90.0):
    minx = min(p[0] for p in pts) - pad; maxx = max(p[0] for p in pts) + pad
    minz = min(p[1] for p in pts) - pad; maxz = max(p[1] for p in pts) + pad
    nx = int((maxx - minx) / CELL) + 1
    nz = int((maxz - minz) / CELL) + 1
    grid = []
    for j in range(nz):
        for i in range(nx):
            gx, gz = minx + i * CELL, minz + j * CELL
            # inverse distance weighting over nearby road samples
            num = den = 0.0
            for (px, pz), e in zip(pts, elev):
                d2 = (gx - px) ** 2 + (gz - pz) ** 2
                if d2 > 240 * 240:
                    continue
                w = 1.0 / (d2 + 25.0)
                num += e * w; den += w
            grid.append(round(num / den, 2) if den else 0.0)
    # one smoothing pass, so buildings never sit on a step
    sm = list(grid)
    for j in range(nz):
        for i in range(nx):
            acc = n = 0
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    a, b = i + di, j + dj
                    if 0 <= a < nx and 0 <= b < nz:
                        acc += grid[b * nx + a]; n += 1
            sm[j * nx + i] = round(acc / n, 2)
    return dict(x0=round(minx, 1), z0=round(minz, 1), cell=CELL, nx=nx, nz=nz, h=sm)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="orchard")
    a = ap.parse_args()
    d = district(a.id)
    path = scene_path(a.id)
    data = json.load(open(path))

    lat0, lon0 = d["origin"]
    m_lat = 110574.0
    m_lon = 111320.0 * math.cos(math.radians(lat0))

    pts = road_samples(data)
    print(f"== terrain: {a.id}")
    print(f"   {len(pts)} road samples at {SAMPLE_EVERY:.0f}m spacing")

    latlons = [(lat0 - z / m_lat, lon0 + x / m_lon) for x, z in pts]
    elev = fetch_elev(latlons)
    if len(elev) != len(pts):
        sys.exit(f"   got {len(elev)} elevations for {len(pts)} points")

    raw_range = (min(elev), max(elev))
    elev, fixed = despike(pts, elev)
    print(f"   raw range {raw_range[0]:.0f}-{raw_range[1]:.0f}m; "
          f"despiked {fixed} rooftop samples")
    print(f"   ground range {min(elev):.0f}-{max(elev):.0f}m "
          f"(relief {max(elev)-min(elev):.0f}m)")

    grid = build_grid(pts, elev)
    # store relative to the lowest point, so the world sits near y=0
    base = min(grid["h"])
    grid["h"] = [round(v - base, 2) for v in grid["h"]]
    grid["base"] = round(base, 2)
    data["terrain"] = grid
    json.dump(data, open(path, "w"), separators=(",", ":"))
    alt = os.path.join(HERE, f"{a.id}.json")
    if os.path.exists(alt) and alt != path:
        json.dump(data, open(alt, "w"), separators=(",", ":"))
    print(f"   grid {grid['nx']}x{grid['nz']} @ {CELL:.0f}m, "
          f"rise 0-{max(grid['h']):.1f}m above base {base:.0f}m")
    print(f"   wrote {path} ({os.path.getsize(path)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
