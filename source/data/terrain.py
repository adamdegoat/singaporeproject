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
    """The one scene file for a district.

    There used to be two candidates, districts/<id>.json and <id>.json, tried in
    that order. terrain.py then loaded whichever it found first and wrote the
    result to BOTH, so a stale copy could be written over a fresh reprocess: a
    run that had just dropped three underground footprints came back with them.
    There is one file now, and a leftover duplicate is a hard error rather than a
    silent preference.
    """
    canonical = os.path.join(HERE, f"{did}.json")
    stale = os.path.join(HERE, "districts", f"{did}.json")
    if os.path.exists(stale) and os.path.exists(canonical):
        sys.exit(f"two scene files for '{did}': delete {stale}")
    if os.path.exists(canonical):
        return canonical
    if os.path.exists(stale):
        return stale
    sys.exit(f"no scene for '{did}'; run build_district.py first")


def drop_roofed(pts, data, keep_min=0.30):
    """Discard samples whose cell is contaminated by a building.

    Every global elevation dataset available here is a SURFACE model, not bare
    earth: srtm30m, mapzen and aster30m all report about 104m at Raffles Place,
    where the ground is around 5m. They are reading the roofs of a canyon of
    280m towers, and a 30m cell straddling a road and a tower returns the tower.
    A local median cannot repair it because every neighbour is on a roof too --
    the whole quarter is elevated together.

    What we do have is the footprints. A sample inside or beside a mapped
    building is a sample of that building, so it is dropped and the ground there
    is interpolated from open land instead: the waterfront, the park, the river
    mouth. For flat reclaimed ground around a reservoir that is the right
    answer, and it is derived rather than assumed.

    The guard matters. In a dense district this could throw away nearly
    everything and leave the grid interpolating from four points on the edge, so
    if fewer than `keep_min` of the samples survive the filter is abandoned and
    the district keeps its contaminated field, loudly. A worse ground is better
    than no ground.
    """
    polys = [b["p"] for b in data.get("buildings", []) if len(b.get("p", [])) > 2]
    if not polys:
        return list(range(len(pts))), len(pts), len(pts), False
    CELLB = 60.0
    grid = {}
    for idx, ring in enumerate(polys):
        xs = [q[0] for q in ring]; zs = [q[1] for q in ring]
        for gx in range(int((min(xs) - 22) // CELLB), int((max(xs) + 22) // CELLB) + 1):
            for gz in range(int((min(zs) - 22) // CELLB), int((max(zs) + 22) // CELLB) + 1):
                grid.setdefault((gx, gz), []).append(idx)

    # 34m, not 22: the DEM cell is 30m across, so a sample has to be more than
    # half a cell clear of a footprint before the cell stops containing it.
    # At 22m Collyer Quay still read 50m against a real ground of about 5m.
    def near_building(x, z, pad=34.0):
        for idx in grid.get((int(x // CELLB), int(z // CELLB)), ()):
            ring = polys[idx]
            # inside?
            c = False
            j = len(ring) - 1
            for i in range(len(ring)):
                xi, zi = ring[i]; xj, zj = ring[j]
                if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
                    c = not c
                j = i
            if c:
                return True
            # or within pad of an edge, because the DEM cell is 30m across
            for i in range(len(ring)):
                ax, az = ring[i]; bx, bz = ring[(i + 1) % len(ring)]
                vx, vz = bx - ax, bz - az
                L2 = vx * vx + vz * vz
                t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, ((x - ax) * vx + (z - az) * vz) / L2))
                if math.dist((x, z), (ax + vx * t, az + vz * t)) < pad:
                    return True
        return False

    keep = [i for i, (x, z) in enumerate(pts) if not near_building(x, z)]
    applied = len(keep) >= keep_min * len(pts)
    return (keep if applied else list(range(len(pts)))), len(keep), len(pts), applied


def road_samples(data):
    """Points along every road of reasonable length, plus the main axis."""
    pts = []
    # A BRIDGE DECK IS NOT THE GROUND. An elevated way returns its own deck
    # height from the elevation service, and Marina Bay is crossed by the
    # Benjamin Sheares Bridge about 30m up: sampling it as ground put a 53m
    # ridge across a district whose real relief is a few metres, and every
    # building near it would have been seated on the side of that ridge.
    lines = [r["p"] for r in data["roads"]
             if r.get("k") not in ("footway", "pedestrian") and not r.get("bridge")]
    if data.get("axis"):
        lines.append(data["axis"]["p"])
    # A 25m minimum per WAY throws away the short fragments OSM splits streets
    # into, and the grid is then built from the bbox of what survived: 1,002m of
    # roads at the west end of the district ended up outside the heightfield
    # entirely, where height falls back to the clamped edge value and the ground
    # goes flat. Short ways are sampled at their midpoint instead of dropped.
    for line in lines:
        total = sum(math.dist(line[i], line[i + 1]) for i in range(len(line) - 1))
        if total < 25:
            mid = line[len(line) // 2]
            pts.append((mid[0], mid[1]))
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


USED_SOURCE = [None]


def fetch_elev(latlons, source_idx=0):
    """Batched elevation lookup, falling back to the second source.

    On a failure this restarts the WHOLE district on the next source rather than
    splicing two datasets together, which is right. What it cannot do on its own
    is keep NEIGHBOURING districts on the same one, and they disagree: Orchard
    came back from open-elevation and Bras Basah, after a fallback, from
    opentopodata, and where the two districts overlap their ground heights differ
    by a median of 3.5m and up to 16.6m. Loaded side by side that is a cliff
    along the seam.

    So the source is recorded in the scene, and can be pinned with --source, to
    build a neighbour on the same dataset as the district it joins.
    """
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
                USED_SOURCE[0] = name
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


def _hash_points(pts, cell):
    """Bucket sample indices by grid cell, so neighbour queries stop being a
    scan over every sample. At 3,420 samples the naive form is 11.7 million
    distance tests per pass and the two passes dominated the whole script."""
    grid = {}
    for i, (x, z) in enumerate(pts):
        grid.setdefault((int(x // cell), int(z // cell)), []).append(i)
    return grid


def despike(pts, elev, radius=110.0, tol=4.5, tol_down=7.0):
    """Replace any sample that sits far from its neighbours: far ABOVE is a
    rooftop or a bridge deck, far BELOW is a nodata hole or bathymetry.

    This only ever looked upward -- `elev[i] - med > tol` -- which is why it is
    called despike and not something honest. Marina Bay is the district that
    exposed it: the elevation service returns values as low as -38m over open
    water, and every one of them survived a function whose name says it removes
    outliers. The downward tolerance is looser than the upward one because real
    ground does dip under a flyover, while nothing legitimately rises 4.5m above
    its neighbours within 110m on a road.

    Uses a local median, which ignores outliers by construction."""
    grid = _hash_points(pts, radius)
    kept, fixed = [], 0
    r2 = radius * radius
    for i, (x, z) in enumerate(pts):
        gx, gz = int(x // radius), int(z // radius)
        near = []
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                for j in grid.get((gx + dx, gz + dz), ()):
                    x2, z2 = pts[j]
                    if (x - x2) ** 2 + (z - z2) ** 2 < r2:
                        near.append(elev[j])
        med = statistics.median(near) if near else elev[i]
        # DOWNWARD only where the value is impossible, not merely low.
        #
        # The first version repaired any sample more than tol_down below its
        # neighbours, which also flattened every real dip -- an underpass, a
        # road running down beside a canal -- and P8 ("ground standing through
        # the carriageway") went from 10 to 216 on Orchard, a district that was
        # not even the reason for the change. Singapore has essentially no land
        # below sea level, so a sample under -2m is the dataset returning
        # bathymetry or nodata, and that is the only downward case worth
        # touching.
        if elev[i] - med > tol or (elev[i] < -2.0 and med - elev[i] > tol_down):
            kept.append(med); fixed += 1
        else:
            kept.append(elev[i])
    return kept, fixed


REACH = 240.0     # how far a road sample influences a grid cell


def build_grid(pts, elev, pad=90.0):
    shash = _hash_points(pts, REACH)
    minx = min(p[0] for p in pts) - pad; maxx = max(p[0] for p in pts) + pad
    minz = min(p[1] for p in pts) - pad; maxz = max(p[1] for p in pts) + pad
    nx = int((maxx - minx) / CELL) + 1
    nz = int((maxz - minz) / CELL) + 1
    grid = []
    for row in range(nz):
        for i in range(nx):
            gx, gz = minx + i * CELL, minz + row * CELL
            # inverse distance weighting over nearby road samples, found
            # through the hash rather than by scanning all of them
            num = den = 0.0
            cgx, cgz = int(gx // REACH), int(gz // REACH)
            for dx in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    # `k`, NOT `j`. The row counter used to be called j and so
                    # did this point index, so the inner loop overwrote the row
                    # the outer loop was on: every cell after the first in a row
                    # was sampled at a z of minz + (a point index) * 35 metres,
                    # tens of kilometres away, found nothing, and was written as
                    # zero. It survived because the district happened to sit
                    # near the origin, where a wrong row index still landed on
                    # real ground often enough to look plausible. Moving the
                    # origin seven kilometres exposed it: the heightfield came
                    # back flat along the whole street.
                    for k in shash.get((cgx + dx, cgz + dz), ()):
                        px, pz = pts[k]
                        d2 = (gx - px) ** 2 + (gz - pz) ** 2
                        if d2 > REACH * REACH:
                            continue
                        w = 1.0 / (d2 + 25.0)
                        num += elev[k] * w; den += w
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


def grid_at(grid, x, z):
    """Height at a world point, from the grid, clamped at the edges. Used to
    measure the rim of a water polygon before sinking what is inside it."""
    fx = (x - grid["x0"]) / CELL
    fz = (z - grid["z0"]) / CELL
    i = max(0, min(grid["nx"] - 1, int(fx)))
    j = max(0, min(grid["nz"] - 1, int(fz)))
    return grid["h"][j * grid["nx"] + i]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="orchard")
    ap.add_argument("--source", help="pin an elevation source by name, so a "
                                     "district matches the one it joins")
    a = ap.parse_args()
    d = district(a.id)
    path = scene_path(a.id)
    data = json.load(open(path))

    lat0, lon0 = REG["island_origin"]
    m_lat = 110574.0
    m_lon = 111320.0 * math.cos(math.radians(lat0))

    pts = road_samples(data)
    print(f"== terrain: {a.id}")
    print(f"   {len(pts)} road samples at {SAMPLE_EVERY:.0f}m spacing")

    latlons = [(lat0 - z / m_lat, lon0 + x / m_lon) for x, z in pts]
    start = 0
    if a.source:
        names = [n for n, _ in SOURCES]
        if a.source not in names:
            sys.exit(f"   unknown source '{a.source}'. Known: {', '.join(names)}")
        start = names.index(a.source)
    elev = fetch_elev(latlons, start)
    if len(elev) != len(pts):
        sys.exit(f"   got {len(elev)} elevations for {len(pts)} points")

    raw_range = (min(elev), max(elev))
    keep, n_clean, n_all, applied = drop_roofed(pts, data)
    if applied:
        # CORRECT them, do not DELETE them.
        #
        # Dropping 893 of Marina Bay's 1,428 samples removed the rooftop bias
        # and took the ground under its roads with it: the grid then
        # interpolated those roads from whatever was left hundreds of metres
        # away, and P8 ("ground standing through the carriageway") went to 197.
        # A sample's POSITION is good even when its VALUE is a roof, so the
        # position is kept and the value is replaced by the nearest clean
        # ground. Density is what makes a road sit on its own terrain.
        clean = set(keep)
        chash = _hash_points([pts[i] for i in keep], 220.0)
        cpts = [pts[i] for i in keep]
        cel = [elev[i] for i in keep]
        fixed_roof = 0
        for i in range(len(pts)):
            if i in clean:
                continue
            x, z = pts[i]
            gx, gz = int(x // 220.0), int(z // 220.0)
            near = []
            for dx in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    for j in chash.get((gx + dx, gz + dz), ()):
                        near.append(cel[j])
            if near:
                elev[i] = statistics.median(near)
                fixed_roof += 1
            else:
                elev[i] = None
        drop = [i for i, v in enumerate(elev) if v is None]
        if drop:
            dset = set(drop)
            pts = [p for i, p in enumerate(pts) if i not in dset]
            elev = [v for i, v in enumerate(elev) if i not in dset]
        print(f"   {n_all - n_clean} of {n_all} samples were on a building (the DEM "
              f"is a surface model): {fixed_roof} re-read from the nearest clean "
              f"ground, {len(drop)} dropped with none in reach")
    else:
        print(f"   NOT correcting roofed samples: only {n_clean} of {n_all} "
              f"({100*n_clean/max(1,n_all):.0f}%) are clean, below the 30% floor")
    elev, fixed = despike(pts, elev)
    print(f"   raw range {raw_range[0]:.0f}-{raw_range[1]:.0f}m; "
          f"despiked {fixed} rooftop samples")
    print(f"   ground range {min(elev):.0f}-{max(elev):.0f}m "
          f"(relief {max(elev)-min(elev):.0f}m)")

    grid = build_grid(pts, elev)

    # ---- SINK THE GROUND UNDER WATER ---------------------------------------
    # The heightfield is interpolated from samples taken along ROADS, and there
    # are no roads in a reservoir, so the ground under Marina Bay is whatever
    # the surrounding quays extrapolate to -- which is above the waterline. The
    # bay would be a flat surface with terrain poking through it.
    #
    # So every grid cell inside a water polygon is pushed below the rim it sits
    # in. The rim, not a constant sea level: the elevation dataset has no idea
    # where the shoreline is, and hard-coding zero either floods the promenade
    # or leaves the bay as a pit. This mirrors what buildWater does to find the
    # surface, so the two cannot disagree about where the waterline is.
    rings = [w["p"] for w in data.get("water", []) if len(w.get("p", [])) > 3]
    if rings:
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

        sunk = 0
        for ring in rings:
            rim = min((grid_at(grid, x, z) for x, z in ring), default=None)
            if rim is None:
                continue
            floor = rim - 2.0
            rx0 = min(p[0] for p in ring); rx1 = max(p[0] for p in ring)
            rz0 = min(p[1] for p in ring); rz1 = max(p[1] for p in ring)
            for j in range(grid["nz"]):
                gz = grid["z0"] + j * CELL
                if gz < rz0 - CELL or gz > rz1 + CELL:
                    continue
                for i in range(grid["nx"]):
                    gx = grid["x0"] + i * CELL
                    if gx < rx0 - CELL or gx > rx1 + CELL:
                        continue
                    k = j * grid["nx"] + i
                    if grid["h"][k] > floor and inside(gx, gz, ring):
                        grid["h"][k] = floor
                        sunk += 1
        if sunk:
            print(f"   sank {sunk} grid cells under {len(rings)} water polygons")

    # store relative to the lowest point, so the world sits near y=0
    base = min(grid["h"])
    grid["h"] = [round(v - base, 2) for v in grid["h"]]
    grid["base"] = round(base, 2)
    grid["src"] = USED_SOURCE[0]      # which dataset this district's ground came from
    data["terrain"] = grid
    json.dump(data, open(path, "w"), separators=(",", ":"))
    # deliberately no second write: one file, one source of truth
    print(f"   grid {grid['nx']}x{grid['nz']} @ {CELL:.0f}m, "
          f"rise 0-{max(grid['h']):.1f}m above base {base:.0f}m")
    print(f"   wrote {path} ({os.path.getsize(path)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
