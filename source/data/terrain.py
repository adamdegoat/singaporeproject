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
    # LOCAL FIRST, and it is not a preference — it is a different quality of data.
    # See local_elev() for the measurements that put it here.
    ("cop30", None),
    ("open-elevation", "https://api.open-elevation.com/api/v1/lookup?locations={}"),
    ("opentopodata", "https://api.opentopodata.org/v1/srtm30m?locations={}"),
]
DEM_DIR = os.path.join(HERE, "dem")
COP30_URL = ("https://copernicus-dem-30m.s3.amazonaws.com/"
             "{name}/{name}.tif")
CELL = 35.0          # grid resolution in metres
# 45m was the spacing a free web API could afford: 1,429 points for Marina Bay
# was already sixteen requests and a polite sleep between each. The DEM is read
# from disk now, so density costs nothing but a second of arithmetic, and
# density is what makes a road sit on its own terrain rather than on its
# neighbour's.
SAMPLE_EVERY = 20.0  # along-road sampling interval
# Where open water is pushed to, in ABSOLUTE metres, before the grid is rebased
# at the end of build_terrain(). Exported into the grid as `sea` (post-rebase)
# because the runtime cannot recover it otherwise — see the note at the rebase.
SEA_SINK = -2.0


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
    """Discard samples whose cell is contaminated by a building OR by water.

    WATER, added 2026-08-01. A radar DEM over water returns whatever the water
    scattered, which is nothing useful: Kim Seng Road sampled the Singapore
    River at -16.2m and Delta Road at -7.0m, and both are ordinary streets about
    five metres above the sea. The river is MAPPED, so a sample standing on it
    is as knowably contaminated as one standing on a roof, and it takes the same
    treatment -- position kept, value re-read from the nearest clean ground.

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
    near_building = contam_fn(data)
    if near_building is None:
        return list(range(len(pts))), len(pts), len(pts), False, None
    keep = [i for i, (x, z) in enumerate(pts) if not near_building(x, z)]
    # Returns the REAL clean list, always. It used to hand back every index when
    # the clean fraction fell under keep_min, which made "correction abandoned"
    # indistinguishable from "nothing needed correcting" to the caller — and the
    # caller stopped reading the flag on 2026-08-01 and silently corrected
    # nothing in three districts for one build. A filter that lies about what it
    # filtered is worse than no filter.
    # The contamination fn rides along so the caller can ask what CAUSED a
    # sample's contamination — the repair cap needs the building's height.
    return keep, len(keep), len(pts), len(keep) >= keep_min * len(pts), near_building


def contam_fn(data):
    """`near(x, z)` -> is this sample's DEM cell contaminated by a building or
    standing on water? Returns None when the district has neither."""
    # HOW FAR A BUILDING REACHES DEPENDS ON HOW TALL IT IS.
    #
    # This was a flat 34m for every footprint, which is the same mistake this
    # project has now made four times: a geometric rule with no SCALE. A
    # three-storey shophouse and Marina Bay Sands do not contaminate the same
    # radius of a surface model, and treating them alike is why Marina Bay was
    # still reading 7.7m at Raffles Avenue after the dataset was fixed.
    #
    # Measured 2026-08-01 against PUBLISHED ground levels rather than tuned by
    # eye. Published anchors: Marina Bay Sands site +3.0 to +3.5m (Arup Journal,
    # Pappin 2013), Thomson Line contract T228 across Marina Bay RL+103 to +105
    # i.e. +3 to +5m, Serangoon Road +3.0m (Halim 2008, NEL Farrer Park-KK
    # CH 31+895), and PUB's Code of Practice on Surface Water Drainage minimum
    # platform level of 4.0m SHD on the southern coast.
    #
    #                        flat 34m      24 + 0.45h
    #   Marina Bay Sands       7.1            5.0        published 3.0-3.5
    #   Raffles Avenue         7.7            5.3        published 3-5
    #   Bayfront Avenue        5.4            4.2        published 3-5
    #   Serangoon Road         4.9            5.1        published 3.0
    #   Fort Canning          44.0           44.0        published 48
    #
    # A flat 60m or 90m pad was tried first and is WORSE, not better: it fixes
    # Marina Bay and pushes Serangoon Road from 4.9 to 6.3, because a low-rise
    # district does not need the correction at all and a wide pad only throws
    # away the honest samples it has. That is the research's own finding --
    # every DEM is within about a metre in low-rise Singapore and runs +2 to +6
    # high under megastructures -- so the pad has to scale, not grow.
    polys = [b["p"] for b in data.get("buildings", []) if len(b.get("p", [])) > 2]
    pads = [max(24.0, min(120.0, 24.0 + 0.45 * (b.get("h") or 12.0)))
            for b in data.get("buildings", []) if len(b.get("p", [])) > 2]
    bh = [b.get("h") or 12.0
          for b in data.get("buildings", []) if len(b.get("p", [])) > 2]
    # A water ring contaminates the reading INSIDE it, not for 34m around it:
    # the quay beside the river is real ground. So water rings are carried in
    # the same index but tested with a zero pad.
    nb = len(polys)
    polys += [w["p"] for w in data.get("water", []) if len(w.get("p", [])) > 2]
    pads += [0.0] * (len(polys) - nb)
    if not polys:
        return None
    CELLB = 80.0
    grid = {}
    for idx, ring in enumerate(polys):
        xs = [q[0] for q in ring]; zs = [q[1] for q in ring]
        m = pads[idx]
        for gx in range(int((min(xs) - m) // CELLB), int((max(xs) + m) // CELLB) + 1):
            for gz in range(int((min(zs) - m) // CELLB), int((max(zs) + m) // CELLB) + 1):
                grid.setdefault((gx, gz), []).append(idx)

    def near_building(x, z, pad=None):
        for idx in grid.get((int(x // CELLB), int(z // CELLB)), ()):
            ring = polys[idx]
            # a LOCAL name: reassigning `pad` itself would leak one ring's rule
            # onto every ring later in the same cell
            rpad = pads[idx] if pad is None else (0.0 if idx >= nb else pad)
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
                if math.dist((x, z), (ax + vx * t, az + vz * t)) < rpad:
                    return True
        return False

    def contam_h(x, z):
        """(tallest contaminating BUILDING height, water-contaminated?) —
        what the repair loop needs to decide HOW MUCH a reading can be wrong.
        A surface model over a building reads at most that building's height
        too high; over water it reads garbage in the other direction."""
        best = 0.0
        wat = False
        for idx in grid.get((int(x // CELLB), int(z // CELLB)), ()):
            ring = polys[idx]
            rpad = pads[idx]
            c = False
            j = len(ring) - 1
            for i in range(len(ring)):
                xi, zi = ring[i]; xj, zj = ring[j]
                if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
                    c = not c
                j = i
            hit = c
            if not hit:
                for i in range(len(ring)):
                    ax, az = ring[i]; bx, bz = ring[(i + 1) % len(ring)]
                    vx, vz = bx - ax, bz - az
                    L2 = vx * vx + vz * vz
                    t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, ((x - ax) * vx + (z - az) * vz) / L2))
                    if math.dist((x, z), (ax + vx * t, az + vz * t)) < rpad:
                        hit = True
                        break
            if hit:
                if idx >= nb:
                    wat = True               # water ring
                else:
                    best = max(best, bh[idx])
        return best, wat

    near_building.contam_h = contam_h
    return near_building


def open_samples(data, extent, step=35.0):
    """Every patch of OPEN GROUND in the district, on a lattice.

    Roads were the only thing sampled for as long as elevation cost a web
    request each: 1,429 points was already sixteen calls and a polite sleep.
    That made the correction for rooftop contamination fragile, because a dense
    district has almost no clean ROAD -- River Valley came out at 371 clean
    samples of 2,844 (13%), under the 30% floor, so the correction was abandoned
    and the district kept a ground it knew was wrong.

    Reading the DEM from disk removes the reason for the restriction. The car
    parks, the padang, the river banks, the school fields, the reservoir edge
    and the gaps between blocks are all open sky and all real ground, and they
    are exactly where the honest samples live. They are only used where they are
    CLEAN, so this adds anchors without adding assumptions.
    """
    near = contam_fn(data)
    xs = [p[0] for p in extent]; zs = [p[1] for p in extent]
    x0, x1 = min(xs), max(xs)
    z0, z1 = min(zs), max(zs)
    out = []
    z = z0
    while z <= z1:
        x = x0
        while x <= x1:
            if near is None or not near(x, z):
                out.append((x, z))
            x += step
        z += step
    return out


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
_TILES = {}


def _tile_name(lat_deg, lon_deg):
    ns = "N" if lat_deg >= 0 else "S"
    ew = "E" if lon_deg >= 0 else "W"
    return (f"Copernicus_DSM_COG_10_{ns}{abs(lat_deg):02d}_00_"
            f"{ew}{abs(lon_deg):03d}_00_DEM")


def _tile(lat_deg, lon_deg):
    """Load one 1x1 degree Copernicus tile, downloading it once if needed.

    Cached as .npy beside the .tif because decoding a 30MB float predictor
    TIFF takes seconds and every district would pay it again.
    """
    key = (lat_deg, lon_deg)
    if key in _TILES:
        return _TILES[key]
    import numpy as np
    os.makedirs(DEM_DIR, exist_ok=True)
    name = _tile_name(lat_deg, lon_deg)
    npy = os.path.join(DEM_DIR, name + ".npy")
    meta = os.path.join(DEM_DIR, name + ".json")
    if not (os.path.exists(npy) and os.path.exists(meta)):
        tif = os.path.join(DEM_DIR, name + ".tif")
        if not os.path.exists(tif):
            url = COP30_URL.format(name=name)
            print(f"    downloading {name} ...", flush=True)
            urllib.request.urlretrieve(url, tif)
        try:
            import tifffile
        except ImportError:
            sys.exit("    cop30 needs tifffile + imagecodecs: "
                     "python3 -m pip install --user tifffile imagecodecs")
        with tifffile.TiffFile(tif) as f:
            page = f.pages[0]
            tie = page.tags["ModelTiepointTag"].value
            scale = page.tags["ModelPixelScaleTag"].value
            arr = page.asarray().astype(np.float32)
        # Copernicus COGs are RasterPixelIsPoint: the tiepoint is the CENTRE of
        # pixel (0,0), not its corner. Half a pixel is 15m, which is a kerb.
        info = dict(lon0=float(tie[3]), lat0=float(tie[4]),
                    dlon=float(scale[0]), dlat=float(scale[1]),
                    h=int(arr.shape[0]), w=int(arr.shape[1]))
        np.save(npy, arr)
        json.dump(info, open(meta, "w"))
    info = json.load(open(meta))
    arr = np.load(npy, mmap_mode="r")
    _TILES[key] = (arr, info)
    return _TILES[key]


def local_elev(latlons):
    """Sample Copernicus GLO-30 from disk. No key, no rate limit, no batching.

    WHY THIS REPLACED THE WEB APIS, measured 2026-08-01 rather than assumed.
    Marina Bay modelled its ground about 25m too high and the diagnosis in
    NEXT.md blamed rooftops in a 30m cell. That was only half of it: SRTM (which
    is what open-elevation, opentopodata/srtm30m and mapzen all return here) is
    simply NOISE over this city. Road samples 80-130m from ANY mapped building
    ran min -19m, median 11m, max +32m, and open water in the middle of Marina
    Bay came back at 6m and 16m where the datum says 0. A lower-envelope
    estimator was tried against that noise across four percentiles and three
    radii and the best it could do at Raffles Avenue was 10m against a real ~5m,
    because there is no clean sample within 400m of Marina Centre to find.
    You cannot filter your way out of a dataset that has no signal.

    Copernicus GLO-30, read at full resolution, answers the same probes:

        Raffles Avenue    4.8m   (SRTM 25m, reality ~5m)
        Esplanade         4.8m   (SRTM 19m)
        Raffles Place     7.0m   (SRTM's own docs' example failure, 104m)
        Fort Canning     49.4m   (published summit 48m)
        Marina Barrage    0.0m   (water, datum 0)
        Gunung Pulai    653.1m   (Johor, in the same tile; published 654m)

    It is still a SURFACE model, so drop_roofed() below still earns its keep --
    but it starts from ground that is right rather than ground that is 20m out.
    Heights are orthometric (EGM2008), which is what the world wants: a metre
    here is a metre above the sea you can see from the promenade.
    """
    import numpy as np
    out = []
    for lat, lon in latlons:
        arr, info = _tile(math.floor(lat), math.floor(lon))
        c = (lon - info["lon0"]) / info["dlon"]
        r = (info["lat0"] - lat) / info["dlat"]
        c = max(0.0, min(info["w"] - 1.001, c))
        r = max(0.0, min(info["h"] - 1.001, r))
        c0, r0 = int(c), int(r)
        fc, fr = c - c0, r - r0
        a = float(arr[r0, c0]); b = float(arr[r0, c0 + 1])
        d = float(arr[r0 + 1, c0]); e = float(arr[r0 + 1, c0 + 1])
        # a tile has no explicit nodata; anything this far below the geoid is
        # the ocean mask, and nearest-real is better than blending with it
        vals = [v for v in (a, b, d, e) if v > -100.0]
        if not vals:
            out.append(0.0); continue
        if len(vals) < 4:
            out.append(float(np.median(vals))); continue
        out.append((a * (1 - fc) + b * fc) * (1 - fr) +
                   (d * (1 - fc) + e * fc) * fr)
    USED_SOURCE[0] = "cop30"
    print(f"    cop30 (local Copernicus GLO-30): {len(out)}/{len(latlons)}",
          flush=True)
    return out


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
    if tmpl is None:
        return local_elev(latlons)
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
        # THE MEDIAN OF A DISK IS THE WRONG EXPECTATION ON A HILL. "Nothing
        # legitimately rises 4.5m above its neighbours within 110m" is a rule
        # about FLAT urban Singapore, and it beheaded Fort Siloso: a 52.5m
        # summit against a disk median of ~30m reads as a rooftop and was cut
        # to the median, sample after sample, until the headland was gone.
        # Same default-from-the-wrong-kind-of-place as greenFrac counting the
        # sea. So: where the disk itself says the ground is steep (its p10-p90
        # span beats 10m), a sample is a spike only if it beats EVERY
        # neighbour by the tolerance — a summit legitimately tops the median,
        # but even a summit sits within a grade of its own hillside, while a
        # needle tops everything at once. Flat ground keeps the strict rule.
        up = elev[i] - med > tol
        if up and len(near) >= 8:
            srt = sorted(near)
            n9 = len(srt) - 1
            if srt[int(n9 * 0.9)] - srt[int(n9 * 0.1)] > 10.0:
                up = elev[i] - srt[-2] > tol
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
        if up or (elev[i] < -2.0 and med - elev[i] > tol_down):
            kept.append(med); fixed += 1
        else:
            kept.append(elev[i])
    return kept, fixed


# How far a sample influences a grid cell. 240m was sized for road samples 45m
# apart bought one web request at a time; with the DEM on disk the world is
# sampled every 20m along every road plus a 35m lattice over all open ground, so
# a 240m reach now averages a hill flat against hundreds of neighbours. Cells
# with nothing in reach widen their search rather than falling back to zero —
# the interior of a large mall has neither road nor open ground in it.
#
# 140 STILL DID THE SAME THING, just less: with 1/(d^2+25) weights, the ~40
# samples in the outer disk collectively outweigh the one 25m away, so every
# cell is a ~100m low-pass filter and any hill narrower than the disk loses
# its top (the Fort Canning "7m short" note at the smoothing pass below was
# this, compensated instead of cured). Samples are never further than ~25m
# apart now, so 70 keeps every cell genuinely local. A/B measured on sentosa,
# 140 vs 70: Fort Imbiah 56.7 -> 62.6 against 65.6 raw, Mount Serapong 75.9 ->
# 78.6 against 83.1 raw; flat ground moved under a metre (median cell delta
# 0.54m, and the moved cells are the hills).
REACH = 70.0


def build_grid(pts, elev, pad=90.0, extent=None):
    """`pts`/`elev` are the SAMPLES the surface is interpolated from; `extent`
    is any extra geometry the grid must merely COVER.

    Bridges are deliberately not sampled — reading the Benjamin Sheares deck as
    ground put a 53m ridge across a flat district — but they are still roads,
    and a road outside the grid falls back to the clamped edge value. Little
    India's canal crossings put 27 road points off the heightfield that way.
    Sized to cover them, still not sampled from them.
    """
    shash = _hash_points(pts, REACH)
    span = list(pts) + list(extent or [])
    minx = min(p[0] for p in span) - pad; maxx = max(p[0] for p in span) + pad
    minz = min(p[1] for p in span) - pad; maxz = max(p[1] for p in span) + pad
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
            ring = 1
            while den == 0.0 and ring < 8:
                # widen a ring at a time. A zero here used to be written as a
                # literal 0.0m of ground, which is a hole the size of a city
                # block, so this cannot be allowed to give up quietly.
                ring += 1
                for dx in range(-ring, ring + 1):
                    for dz in range(-ring, ring + 1):
                        if max(abs(dx), abs(dz)) != ring:
                            continue
                        for k in shash.get((cgx + dx, cgz + dz), ()):
                            px, pz = pts[k]
                            d2 = (gx - px) ** 2 + (gz - pz) ** 2
                            w = 1.0 / (d2 + 25.0)
                            num += elev[k] * w; den += w
            grid.append(round(num / den, 2) if den else 0.0)
    # One smoothing pass, so buildings never sit on a step — but WEIGHTED to the
    # centre. A flat 3x3 box over a 35m grid is a 105m window, and a 105m window
    # takes the top off any hill smaller than itself: Pearl's Hill came out 13m
    # short and Fort Canning 7m short of its published 48m, while flat ground was
    # accurate to a metre or two. Weighting the centre four times keeps the step
    # removal (the thing this pass exists for) and gives the peaks back.
    sm = list(grid)
    for j in range(nz):
        for i in range(nx):
            acc = w = 0.0
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    a, b = i + di, j + dj
                    if 0 <= a < nx and 0 <= b < nz:
                        k = 4.0 if (di == 0 and dj == 0) else 1.0
                        acc += grid[b * nx + a] * k; w += k
            sm[j * nx + i] = round(acc / w, 2)
    return dict(x0=round(minx, 1), z0=round(minz, 1), cell=CELL, nx=nx, nz=nz, h=sm)


def grid_at(grid, x, z):
    """Height at a world point, from the grid, clamped at the edges. Used to
    measure the rim of a water polygon before sinking what is inside it."""
    fx = (x - grid["x0"]) / CELL
    fz = (z - grid["z0"]) / CELL
    i = max(0, min(grid["nx"] - 1, int(fx)))
    j = max(0, min(grid["nz"] - 1, int(fz)))
    return grid["h"][j * grid["nx"] + i]


def probe(grid, label):
    """TERRAIN_PROBE="x,z;x,z" prints the grid height at each point after every
    stage of main(). This exists because a 39m terrain error at Fort Siloso
    shipped with no way to say WHICH of six ground passes had flattened it —
    the answer is one env var and one rerun, never a bisect."""
    spec = os.environ.get("TERRAIN_PROBE")
    if not spec:
        return
    vals = []
    for part in spec.split(";"):
        x, z = (float(v) for v in part.split(","))
        vals.append(f"({x:.0f},{z:.0f})={grid_at(grid, x, z):.1f}")
    print(f"   PROBE {label:<14} {'  '.join(vals)}")


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
    extent_pts = [tuple(q) for r in data["roads"] for q in r["p"]]
    # The grid must cover the SCENERY, not just the playable roads. The far
    # shore keeps its buildings (bg:1) for the view across the water, and a
    # building past the grid's edge stands in open sea: the roads that used to
    # stretch the extent to HarbourFront were dropped from the extract, and
    # the Keppel blocks spent a rebuild afloat before anyone looked north.
    # Coverage only — nothing here is SAMPLED from a building.
    for b in data.get("buildings", []):
        extent_pts += [tuple(q) for q in b.get("p", [])]
    for w in data.get("piers", []):
        extent_pts += [tuple(q) for q in w.get("p", [])]
    opens = open_samples(data, extent_pts)
    n_road = len(pts)
    pts = pts + opens
    print(f"   + {len(opens)} open-ground samples on a {35:.0f}m lattice")

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
    keep, n_clean, n_all, _, near_fn = drop_roofed(pts, data)
    # CORRECT them, do not DELETE them.
    #
    # Dropping 893 of Marina Bay's 1,428 samples removed the rooftop bias
    # and took the ground under its roads with it: the grid then
    # interpolated those roads from whatever was left hundreds of metres
    # away, and P8 ("ground standing through the carriageway") went to 197.
    # A sample's POSITION is good even when its VALUE is a roof, so the
    # position is kept and the value is replaced by the nearest clean
    # ground. Density is what makes a road sit on its own terrain.
    #
    # THE ALL-OR-NOTHING FLOOR IS GONE, 2026-08-01, and it had been costing the
    # whole world. The correction used to be abandoned unless 30% of samples
    # came back clean; measured on this build, that floor was met by exactly ONE
    # district of eight (Marina Bay). Orchard, River Valley, Bras Basah and
    # Chinatown had all been shipping ground they knew was reading rooftops,
    # silently, behind a message nobody was reading. A district-wide fraction
    # was the wrong test anyway: what matters is whether THIS sample has honest
    # ground near enough to borrow, which is a local question with a local
    # answer. A roofed sample with no clean ground within REPAIR keeps its own
    # value and stays visible in the count below, rather than the fix being
    # switched off everywhere because one quarter is dense.
    REPAIR = 300.0
    clean = set(keep)
    chash = _hash_points([pts[i] for i in keep], REPAIR)
    cpts = [pts[i] for i in keep]
    cel = [elev[i] for i in keep]
    fixed_roof = orphan = 0
    for i in range(len(pts)):
        if i in clean:
            continue
        x, z = pts[i]
        gx, gz = int(x // REPAIR), int(z // REPAIR)
        near = []
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                for j in chash.get((gx + dx, gz + dz), ()):
                    d = math.dist(cpts[j], (x, z))
                    if d <= REPAIR:
                        near.append((d, cel[j]))
        if near:
            # THE NEAREST clean ground, which is what this always claimed to do.
            # It took the median of EVERY clean sample within the radius, and on
            # a hill that is the wrong answer by the height of the hill: Pearl's
            # Hill is roofed almost end to end, so every sample on it was
            # re-read from the flat streets at its foot and the hill came out at
            # 30m against a real 43m. A slope needs its LOCAL neighbours; the
            # median of the five nearest still ignores an outlier without
            # dragging the sample down to the district's average ground.
            near.sort(key=lambda t: t[0])
            med = statistics.median([v for _, v in near[:5]])
            # HOW WRONG CAN THIS READING BE? A building can only have LIFTED
            # it by its own height. Fort Siloso is why the correction is now
            # bounded by that: its loop road reads 26-45m, is "contaminated"
            # by 3-7m casemates, and the nearest clean ground is the beach
            # BELOW the hill — so the repair rewrote a real 40m headland at
            # 10-30m and every later pass inherited the loss, until the model
            # sat 29-39m under raw Copernicus and passed every gate (a
            # flattened hill is smooth).
            #
            # Two rules, both scaled by the contaminating building itself:
            # - shorter than 8m (a 30m DEM's own noise): the reading cannot
            #   be materially wrong, so it is KEPT — any correction here is
            #   pure damage on a slope.
            # - taller: repaired from donors, but never deeper than raw minus
            #   the building minus a cell of smear. In town the cap sits far
            #   below the donors and never fires (MBS: 55 - 200 - 6 is
            #   negative); on a hill it is the floor that keeps the hill.
            # Water contamination always repairs — a reading over water is
            # garbage in the other direction and raw is no anchor at all.
            hmax, wat = near_fn.contam_h(x, z) if near_fn else (0.0, True)
            if not wat and hmax < 8.0:
                continue                     # reading kept; error <= 8m
            if hmax > 0.0:
                med = max(med, elev[i] - hmax - 6.0)
            elev[i] = med
            fixed_roof += 1
        else:
            orphan += 1        # keep the raw value; it is all we have here
    print(f"   {n_all - n_clean} of {n_all} samples read a building or water "
          f"({100*n_clean/max(1,n_all):.0f}% clean): {fixed_roof} re-read from "
          f"clean ground within {REPAIR:.0f}m, {orphan} left uncorrected")
    elev, fixed = despike(pts, elev)
    # A LAND SAMPLE BELOW THE SEA IS NOT A MEASUREMENT.
    #
    # Central Singapore has no land below mean sea level -- the lowest reclaimed
    # ground is held at about +4m and the Marina Barrage keeps the reservoir near
    # 0 -- so a road sample at -16.2m (Kim Seng Road, over the river) or -7.0m
    # (Delta Road) is the radar returning what water scattered. Mapped water is
    # already excluded above; this catches the water that is NOT mapped, which is
    # most canals and every river drawn as a centreline rather than an area.
    # This is a floor on an impossible value, not the blanket "take the minimum"
    # that NEXT.md warns against: Fort Canning stays at 48m and Orchard still
    # climbs, because nothing up there is negative.
    below = sum(1 for v in elev if v < 0.0)
    if below:
        elev = [max(0.0, v) for v in elev]
    print(f"   raw range {raw_range[0]:.0f}-{raw_range[1]:.0f}m; "
          f"despiked {fixed} rooftop samples; "
          f"{below} below sea level clamped to 0")
    print(f"   ground range {min(elev):.0f}-{max(elev):.0f}m "
          f"(relief {max(elev)-min(elev):.0f}m)")

    # every road point, bridges included, purely so the grid REACHES them —
    # bridges are still excluded from the samples above (extent_pts is built
    # once, above, because the open-ground lattice is laid over the same span)
    grid = build_grid(pts, elev, extent=extent_pts)
    probe(grid, "grid")

    # WHAT THIS DISTRICT HAS BUILT ON IT, IN GRID CELLS. Shared by BOTH sinking
    # passes below (mapped water polygons, then everything outside the
    # coastline), because a cell that carries a road or a building is land no
    # matter which pass is looking at it.
    #
    # This exists because the open sea was finally drawn on 2026-08-03 and 41
    # buildings and 966 road points on sentosa turned out to be under it — the
    # Police Coast Guard Brani base, the SCDF Marine Command and most of the
    # Brani container terminal. Two separate holes caused it: the mapped-water
    # pass protected only by a geometric inset, and the coastline pass protected
    # only cells whose CENTRE was within 12m of a footprint.
    #
    # A cell is marked if any surveyed built thing overlaps the cell or lies
    # within one cell of it — one cell, because bilinear sampling reads the four
    # cell centres bracketing a point, each up to CELL away in x and in z, so
    # anything closer than that leaks a sunk height into a built thing's ground.
    # Whole footprints and whole road spans, not vertices: a 87m-wide terminal
    # shed has no corner within 35m of its own middle.
    _built = {}
    def _mark_cell(px, pz):
        _built[(int(math.floor(px / CELL)), int(math.floor(pz / CELL)))] = True
    def _mark_span(ax, az, bx, bz):
        n = int(math.hypot(bx - ax, bz - az) / (CELL * 0.5)) + 1
        for s in range(n + 1):
            t = s / n
            _mark_cell(ax + (bx - ax) * t, az + (bz - az) * t)
    for _b in data.get("buildings", []):
        _p = _b.get("p", [])
        if len(_p) < 3:
            continue
        _xs = [q[0] for q in _p]; _zs = [q[1] for q in _p]
        for _ci in range(int(math.floor(min(_xs) / CELL)), int(math.floor(max(_xs) / CELL)) + 1):
            for _cj in range(int(math.floor(min(_zs) / CELL)), int(math.floor(max(_zs) / CELL)) + 1):
                _built[(_ci, _cj)] = True
    for _r in data.get("roads", []):
        _p = _r.get("p", [])
        for _s in range(len(_p) - 1):
            _mark_span(_p[_s][0], _p[_s][1], _p[_s + 1][0], _p[_s + 1][1])

    def carries_built(px, pz):
        ci, cj = int(math.floor(px / CELL)), int(math.floor(pz / CELL))
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                if (ci + di, cj + dj) in _built:
                    return True
        return False

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
    # The coastline ring is assembled BEFORE the water sink because the sink
    # needs it as a judge: OSM carries the surrounding STRAIT as a water
    # polygon too, and treating the sea as a lake is how two cells of the
    # Imbiah hillside spent every build floored at rim-2 — a 715-vertex ring
    # spanning the whole district passed even-odd containment at a concavity,
    # and the "pond floor" it wrote sat 21m below the restored hill beside it.
    # A ring that mostly lies OUTSIDE the coast is the sea, and the sea has
    # its own pass below.
    cw = [c["p"] for c in data.get("coast", []) if len(c.get("p", [])) >= 2]
    coast_rings = []
    if cw:
        def _keyp(p):
            return (round(p[0] / 1.5), round(p[1] / 1.5))
        ways2 = [list(w) for w in cw]
        changed = True
        while changed and len(ways2) > 1:
            changed = False
            for a in range(len(ways2)):
                for b in range(a + 1, len(ways2)):
                    A, B = ways2[a], ways2[b]
                    if _keyp(A[-1]) == _keyp(B[0]):
                        ways2[a] = A + B[1:]
                    elif _keyp(A[-1]) == _keyp(B[-1]):
                        ways2[a] = A + list(reversed(B))[1:]
                    elif _keyp(A[0]) == _keyp(B[-1]):
                        ways2[a] = B + A[1:]
                    elif _keyp(A[0]) == _keyp(B[0]):
                        ways2[a] = list(reversed(B)) + A[1:]
                    else:
                        continue
                    del ways2[b]
                    changed = True
                    break
                if changed:
                    break
        for w in ways2:
            if len(w) >= 8 and math.hypot(w[0][0] - w[-1][0], w[0][1] - w[-1][1]) < 30:
                coast_rings.append(w)
        # refuse rather than guess: unclosed fragments sink nothing

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

        def edge_dist(px, pz, ring):
            best = 1e9
            for i in range(len(ring)):
                ax, az = ring[i]
                bx, bz = ring[(i + 1) % len(ring)]
                vx, vz = bx - ax, bz - az
                L2 = vx * vx + vz * vz
                t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, ((px - ax) * vx + (pz - az) * vz) / L2))
                d = math.dist((px, pz), (ax + vx * t, az + vz * t))
                if d < best:
                    best = d
            return best

        # Sink the OPEN water, not the shoreline cell.
        #
        # A grid cell is 35m across and the quay is a line, so a cell whose
        # centre is just inside the ring is half road. Sinking it to rim-2 drags
        # the promenade under with it through the bilinear read: with the ground
        # finally correct at Marina Bay (2026-08-01), Esplanade Drive came out at
        # -1.7m — a carriageway below sea level, beside the water it runs along.
        # An inset of a cell and a bit keeps the edge at land height, which is
        # what a quay wall IS, and still sinks everything you can see water on.
        # ...but an inset needs a SCALE, which is the mistake this file has made
        # in three other places. A flat 42m inset sinks nothing at all in the
        # Singapore River, which is about 50m wide: every cell in it is within
        # 42m of a bank. So the inset is capped at a fraction of how wide the
        # ring actually is, measured from the cells inside it.
        INSET = CELL * 1.2
        sunk = 0
        kept_w = 0
        skipped_sea = 0
        for ring in rings:
            if coast_rings:
                inn = sum(1 for p in ring[::max(1, len(ring)//60)]
                          if any(inside(p[0], p[1], cr) for cr in coast_rings))
                tot = len(ring[::max(1, len(ring)//60)])
                if inn * 2 < tot:
                    skipped_sea += 1     # mostly outside the coast: the sea
                    continue
            rim = min((grid_at(grid, x, z) for x, z in ring), default=None)
            if rim is None:
                continue
            floor = rim - 2.0
            rx0 = min(p[0] for p in ring); rx1 = max(p[0] for p in ring)
            rz0 = min(p[1] for p in ring); rz1 = max(p[1] for p in ring)
            # first pass: how wide is this ring, in cells that are inside it
            widest = 0.0
            for j in range(grid["nz"]):
                gz = grid["z0"] + j * CELL
                if gz < rz0 - CELL or gz > rz1 + CELL:
                    continue
                for i in range(grid["nx"]):
                    gx = grid["x0"] + i * CELL
                    if gx < rx0 - CELL or gx > rx1 + CELL:
                        continue
                    if inside(gx, gz, ring):
                        widest = max(widest, edge_dist(gx, gz, ring))
            inset = min(INSET, widest * 0.45)
            for j in range(grid["nz"]):
                gz = grid["z0"] + j * CELL
                if gz < rz0 - CELL or gz > rz1 + CELL:
                    continue
                for i in range(grid["nx"]):
                    gx = grid["x0"] + i * CELL
                    if gx < rx0 - CELL or gx > rx1 + CELL:
                        continue
                    k = j * grid["nx"] + i
                    if (grid["h"][k] > floor and inside(gx, gz, ring)
                            and edge_dist(gx, gz, ring) >= inset):
                        if carries_built(gx, gz):
                            kept_w += 1
                            continue
                        grid["h"][k] = floor
                        sunk += 1
        if skipped_sea:
            print(f"   {skipped_sea} water ring(s) mostly outside the coast — "
                  f"left to the sea pass")
        if sunk:
            print(f"   sank {sunk} grid cells under {len(rings)} water polygons")
        if kept_w:
            print(f"   kept {kept_w} of those dry — they carry a road or a building")
        probe(grid, "water-sink")

    # ---- THE SEA IS EVERYTHING OUTSIDE THE COASTLINE (2026-08-03) ---------
    # Copernicus smears the shore: a 35m cell blending jungle hill into beach
    # reads 5-16m over the SAND and stays positive over near-shore water, so
    # the drawn sea never reached the south beaches — from a boat, Siloso was
    # a bare 15m cliff (vetted, shots beach_life3). OSM's natural=coastline is
    # the survey of exactly this boundary; process.py now carries it as the
    # `coast` layer in metre space. The ways chain into the island's closed
    # ring; every grid cell OUTSIDE every ring sinks to sea floor, with a
    # one-cell lip at land height so the coast slopes rather than steps.
    if coast_rings:
        def _inside(px, pz, ring):
            c = False
            j = len(ring) - 1
            for i in range(len(ring)):
                xi, zi = ring[i]
                xj, zj = ring[j]
                if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                    c = not c
                j = i
            return c

        def _edge_dist(px, pz, ring):
            best = 1e18
            j = len(ring) - 1
            for i in range(len(ring)):
                ax, az = ring[j]
                bx, bz = ring[i]
                vx, vz = bx - ax, bz - az
                L2 = vx * vx + vz * vz or 1.0
                t = max(0.0, min(1.0, ((px - ax) * vx + (pz - az) * vz) / L2))
                dx, dz = px - (ax + vx * t), pz - (az + vz * t)
                d = math.hypot(dx, dz)
                if d < best:
                    best = d
                j = i
            return best

        # A MAPPED BUILDING IS LAND, whatever the ring granularity says: the
        # first pass sank the ground under a Siloso beachfront block and it
        # stood ten metres deep in the sea (vetted, beach_sea2). Cells within
        # a pad of any footprint keep their ground.
        bpolys = [b["p"] for b in data.get("buildings", [])
                  if len(b.get("p", [])) > 2]
        bboxes = []
        for bp in bpolys:
            xs = [q[0] for q in bp]; zs = [q[1] for q in bp]
            bboxes.append((min(xs) - 12, min(zs) - 12, max(xs) + 12, max(zs) + 12))

        def on_building(px, pz):
            for (x0b, z0b, x1b, z1b), bp in zip(bboxes, bpolys):
                if x0b <= px <= x1b and z0b <= pz <= z1b:
                    if _inside(px, pz, bp) or _edge_dist(px, pz, bp) < 12:
                        return True
            return False

        INSET_C = CELL * 0.9
        sunk_sea = 0
        kept_built = 0
        for j in range(grid["nz"]):
            gz = grid["z0"] + j * CELL
            for i in range(grid["nx"]):
                gx = grid["x0"] + i * CELL
                k = j * grid["nx"] + i
                if grid["h"][k] <= -1.9:
                    continue
                if any(_inside(gx, gz, r) for r in coast_rings):
                    continue
                if min(_edge_dist(gx, gz, r) for r in coast_rings) < INSET_C:
                    continue                       # the beach lip keeps its height
                if on_building(gx, gz):
                    continue
                if carries_built(gx, gz):
                    kept_built += 1
                    continue
                grid["h"][k] = SEA_SINK
                sunk_sea += 1
        if kept_built:
            print(f"   kept {kept_built} cells dry — they carry a road or a building")
        if sunk_sea:
            print(f"   sank {sunk_sea} cells outside {len(coast_rings)} coastline ring(s) — the open sea")
        probe(grid, "sea-sink")

        # A BLUFF IS NOT A BEACH. Every pass below exists to fix LOW coast —
        # DEM smear over sand reads 5-16m and must be eased, cut and smoothed
        # into the beach the survey says is there. Fort Siloso is why they must
        # not touch HIGH coast: the headland's western arm is narrower than the
        # beach reach, so all three passes ran over a real 40-50m hill and
        # carved it to 2.5-8m — a 39m error that passed every gate, because a
        # flattened hill is smooth. The test is the 3x3 MEDIAN of the cell's
        # own neighbourhood before any shore pass runs: an isolated 20m
        # building spike amid sand keeps a low median and is still smoothed
        # away (the torn-cardboard fix stays), but a cell whose whole
        # neighbourhood is high is a hill, and the sea meets it as a cliff —
        # which is what Siloso Point IS.
        CLIFF_H = 18.0
        Hpre = list(grid["h"])
        bluff = [False] * len(Hpre)
        for j in range(grid["nz"]):
            for i in range(grid["nx"]):
                k = j * grid["nx"] + i
                if Hpre[k] <= CLIFF_H:
                    continue
                neigh = []
                for dj in (-1, 0, 1):
                    for di in (-1, 0, 1):
                        ni, nj = i + di, j + dj
                        if 0 <= ni < grid["nx"] and 0 <= nj < grid["nz"]:
                            neigh.append(Hpre[nj * grid["nx"] + ni])
                if statistics.median(neigh) > CLIFF_H:
                    bluff[k] = True
        if any(bluff):
            print(f"   {sum(bluff)} cells classified bluff — shore passes keep off")

        # THE SHORE SLOPES. Sinking only the outside leaves the DEM's smeared
        # 10-35m coast standing as a one-cell CLIFF into the water. A shore is
        # a ramp: land cells near the sea are pulled DOWN (never up) toward a
        # gentle profile — ~0.8m one cell out, ~3m at two, ~5.5m at three —
        # which is what lets a beach meet its own water and a swim flag stand
        # at a real waterline. Cells under buildings keep their ground (the
        # block above), so nothing re-drowns.
        eased = 0
        H0 = list(grid["h"])
        for j in range(grid["nz"]):
            gz = grid["z0"] + j * CELL
            for i in range(grid["nx"]):
                k = j * grid["nx"] + i
                if H0[k] <= -1.9 or bluff[k]:
                    continue
                gx = grid["x0"] + i * CELL
                if on_building(gx, gz):
                    continue
                best = 99
                for dj in range(-3, 4):
                    for di in range(-3, 4):
                        ni, nj = i + di, j + dj
                        if ni < 0 or nj < 0 or ni >= grid["nx"] or nj >= grid["nz"]:
                            continue
                        if H0[nj * grid["nx"] + ni] <= -1.9:
                            best = min(best, max(abs(di), abs(dj)))
                if best > 3:
                    continue
                target = [0.0, 0.8, 3.0, 5.5][best]
                if grid["h"][k] > target:
                    grid["h"][k] = target
                    eased += 1
        if eased:
            print(f"   eased {eased} shore cells into a beach profile")
        probe(grid, "shore-ease")

        # THE BEACH IS CUT FROM THE SURVEYED COASTLINE, NOT FROM THE DEM.
        #
        # Everything above works outward from cells the DEM happens to have put
        # under water, and it cannot draw a coast: the grid is 35m and a
        # coastline is a fine curve, so the waterline lands on cell boundaries
        # and the shore breaks into the flat sandy tongues with sea showing
        # between them that the owner reported ("now the beaches i find dont
        # really look like the real sentosa") and that are plainly visible from
        # the harbour (shots/street/cst2.shot1).
        #
        # But we HOLD the real thing. `coast_rings` is OSM's natural=coastline
        # for this district — 71 ways and 31.8km of it on sentosa — and it says
        # exactly where land meets sea. So the profile is keyed to DISTANCE
        # FROM THAT LINE rather than to the heightfield's own guess: at the
        # coast the ground sits just under the waterline, and it climbs inland
        # on a gentle beach grade until it meets whatever the terrain already
        # had. min() only, so this can lower a shore into a beach and can never
        # raise ground anywhere; the building floor is the same one the
        # smoothing pass uses, so a waterfront block cannot be cut adrift.
        #
        # This is the fix that answers "are your data sources ideal for
        # sentosa" honestly: the elevation source is a 30m global surface model
        # and is not, but the COASTLINE is surveyed, and where the two disagree
        # about where the sea starts, the survey wins.
        BEACH_REACH = 110.0        # how far inland the cut can reach
        BEACH_GRADE = 0.085        # ~8.5%, a walkable Singapore beach
        BEACH_TOE = SEA_SINK + 0.25
        cut = 0
        for j in range(grid["nz"]):
            gz = grid["z0"] + j * CELL
            for i in range(grid["nx"]):
                k = j * grid["nx"] + i
                if grid["h"][k] <= SEA_SINK or bluff[k]:
                    continue                     # already sea, or a real hill
                gx = grid["x0"] + i * CELL
                if not any(_inside(gx, gz, r) for r in coast_rings):
                    continue                     # seaward of the coast
                d = min(_edge_dist(gx, gz, r) for r in coast_rings)
                if d > BEACH_REACH:
                    continue
                target = BEACH_TOE + d * BEACH_GRADE
                if on_building(gx, gz):
                    target = max(target, SEA_SINK + 1.2)
                if grid["h"][k] > target:
                    grid["h"][k] = target
                    cut += 1
        if cut:
            print(f"   cut {cut} cells to a beach profile off the surveyed coastline")
        probe(grid, "beach-cut")

        # THE COAST WAS SCALLOPED INTO CLIFFS, and the easing above is why.
        # It pulls open shore down to a ramp but SKIPS cells under buildings —
        # correctly, or a beachfront block ends up ten metres under water. On
        # Siloso, where the beach clubs sit right on the sand, that leaves
        # protected cells at 10-20m standing beside eased neighbours at 3-4m,
        # and the drawn terrain reads as a torn cardboard edge dropping into
        # the sea (vetted from the water, shots/street/trail.shot3).
        #
        # Measured across the Siloso shore: a clean transect ran 16.0 12.2 9.8
        # 8.5 6.0 3.4 3.0 2.4 1.3 0.7 0.4 0.0 — a real beach. A spoiled one ran
        # 22.8 14.6 14.5 20.7 14.1 5.3 10.7 12.7 6.9 3.8, which is the same
        # coast with building cells punched through it.
        #
        # So: SMOOTH the shore band rather than move any building. A few box
        # passes over cells near the sea, reading building cells but never
        # writing them, so a protected spike is averaged INTO its neighbours
        # and the ramp closes over it while the building keeps its own ground.
        # Never below the local sea, so this can create no new underwater land.
        SHORE_BAND = 6
        near_sea = [False] * len(grid["h"])
        for j in range(grid["nz"]):
            for i in range(grid["nx"]):
                k = j * grid["nx"] + i
                if grid["h"][k] <= -1.9:
                    continue
                found = False
                for dj in range(-SHORE_BAND, SHORE_BAND + 1):
                    if found:
                        break
                    for di in range(-SHORE_BAND, SHORE_BAND + 1):
                        ni, nj = i + di, j + dj
                        if 0 <= ni < grid["nx"] and 0 <= nj < grid["nz"] \
                                and grid["h"][nj * grid["nx"] + ni] <= -1.9:
                            found = True
                            break
                near_sea[k] = found
        smoothed = 0
        for _pass in range(5):
            src = list(grid["h"])
            for j in range(grid["nz"]):
                gz = grid["z0"] + j * CELL
                for i in range(grid["nx"]):
                    k = j * grid["nx"] + i
                    if not near_sea[k] or src[k] <= -1.9 or bluff[k]:
                        continue
                    gx = grid["x0"] + i * CELL
                    # BUILDING CELLS SMOOTH TOO, WITHIN LIMITS — and the first
                    # version of this pass skipping them outright is why the
                    # Resorts World waterfront still tore into shards after
                    # Siloso's cliffs were fixed (vetted from the harbour,
                    # shots/street/rws.shot1). Siloso has open sand between its
                    # beach clubs, so smoothing the gaps closed the coast; at
                    # RWS the buildings ARE the waterfront, every cell for
                    # hundreds of metres is within the 12m pad, and the pass
                    # had nothing left it was allowed to touch. Probed at
                    # -1500,11880: terrain at y=1.1, 1.6 and 4.0 within one
                    # cell — a near-vertical face, which is exactly the shard.
                    #
                    # Two guards make this safe, and they are the two failure
                    # modes this file has already paid for: a building may
                    # never be taken under the sea (the whole reason building
                    # cells were protected), and no cell may move far in one
                    # rebuild, so a spike relaxes into its neighbours instead
                    # of a block dropping off a hill.
                    on_b = on_building(gx, gz)
                    tot = 0.0
                    wsum = 0.0
                    for dj in (-1, 0, 1):
                        for di in (-1, 0, 1):
                            ni, nj = i + di, j + dj
                            if not (0 <= ni < grid["nx"] and 0 <= nj < grid["nz"]):
                                continue
                            v = src[nj * grid["nx"] + ni]
                            if v <= -1.9:
                                v = SEA_SINK      # the sea pulls the ramp down into itself
                            w = 2.0 if (di == 0 and dj == 0) else 1.0
                            tot += v * w
                            wsum += w
                    nv = tot / wsum
                    # THE FLOOR IS THE GUARD; A MOVEMENT CLAMP IS NOT.
                    # A ±3m clamp was tried here first and it did almost
                    # nothing (10,359 writes, the RWS shards unchanged in the
                    # frame), because the shards are exactly the cells that
                    # need to move FURTHEST: the coastline inset keeps a "beach
                    # lip" cell at the DEM's smeared 15-20m and the cell beside
                    # it is sunk to -2, so the face between them is the full
                    # drop and a 3m allowance cannot begin to close it. What
                    # actually has to hold is that nothing ends up under water,
                    # and that is the floor's job — so the floor stays and the
                    # clamp goes.
                    floor = (SEA_SINK + 1.2) if on_b else SEA_SINK
                    nv = max(nv, floor)
                    if abs(nv - grid["h"][k]) > 0.01:
                        grid["h"][k] = nv
                        smoothed += 1
        if smoothed:
            print(f"   smoothed {smoothed} shore-band cell writes into a coast")
        probe(grid, "shore-smooth")

    # store relative to the lowest point, so the world sits near y=0
    #
    # THIS REBASE SILENTLY DISABLED THE OPEN SEA FOR THE WHOLE PROJECT'S LIFE.
    # Everything above sinks open water to SEA_SINK and eases the shore into a
    # beach profile in ABSOLUTE metres, and then this line moves the entire
    # world up by -min(h) — so the runtime, which tested for "cells below
    # -0.4", found none and drew no sea on any district, ever. The sunk cells
    # were still there; they were just dry land at +2.0 with beaches rising off
    # them. Ship the sea level in the grid's OWN post-rebase terms so nothing
    # downstream has to rediscover this.
    base = min(grid["h"])
    grid["h"] = [round(v - base, 2) for v in grid["h"]]
    grid["base"] = round(base, 2)
    grid["sea"] = round(SEA_SINK - base, 2)
    grid["src"] = USED_SOURCE[0]      # which dataset this district's ground came from
    data["terrain"] = grid
    json.dump(data, open(path, "w"), separators=(",", ":"))
    # deliberately no second write: one file, one source of truth
    print(f"   grid {grid['nx']}x{grid['nz']} @ {CELL:.0f}m, "
          f"rise 0-{max(grid['h']):.1f}m above base {base:.0f}m")
    print(f"   wrote {path} ({os.path.getsize(path)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
