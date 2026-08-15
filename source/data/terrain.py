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

    A BUILDING PAD DELETES A SAMPLE; WATER DELETES A SAMPLE; THEY ARE NOT THE
    SAME THING, and treating them alike wiped a headland off the island.

    Fifty lines below, in capitals, this file says CORRECT THEM, DO NOT DELETE
    THEM — a sample's POSITION is good even when its VALUE is a roof — and the
    repair loop in main() has carried that rule for road samples since
    2026-08-01. This lattice was the one place still deleting, and the cost was
    measured on 2026-08-07:

      Session 12 gave Shangri-La's Rasa Sentosa its RESEARCHED height (37.4m,
      up from a band median). The contamination pad is 24 + 0.45h, so a correct
      height grew that resort's pad to 41m, and 41m was enough to swallow the
      last lattice point on Tanjong Rimau. The cape then had NO sample within
      REACH (70m) at all, build_grid fell into its ring-widening fallback, and
      that fallback inverse-distance-weights an unbounded annulus — 37 samples
      90-220m away, every one of them up on the Fort Siloso ridge. It wrote
      22.4m of hill onto a cape where raw Copernicus reads 2.04m.

      Nothing had broken yet ONLY because terrain.py is not in the build chain
      (process.py carries the heightfield forward), so the grid had not been
      rebuilt since. It was a landmine, not a bug: armed by a correct fix, in a
      pass nobody re-runs, waiting for the next person to run it.

    So a building-contaminated lattice point is KEPT, and the repair loop does
    what it already does for a road: re-read from the nearest clean ground,
    floored at raw minus the building (which keeps a hill), and capped at raw
    (`a building lifts; it never digs`, which keeps a beach). At Tanjong Rimau
    that cap is what answers it — the donors are the ridge at ~15m, raw is
    2.04m, and min() holds the cape at 2.04.

    WATER STILL DELETES, and the asymmetry is the same one the repair loop is
    already written around: a building can only have LIFTED a reading, so the
    error is bounded and one-directional and raw is still an anchor. A radar
    return off water is garbage in BOTH directions, so water repairs in both
    directions — and this lattice covers 800 hectares of open sea, every point
    of which would then be repaired UP to the nearest dry land. Keeping those
    would not fix a cape; it would build a continent.
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
            elif not near.contam_h(x, z)[1]:
                out.append((x, z))           # a roof, not water — repairable
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
            # AND THE SAME SENTENCE HAS A SECOND HALF THAT WAS NEVER WRITTEN:
            # a building can only have LIFTED the reading, so removing the lift
            # can only LOWER it. A building repair that RAISES a sample is
            # inventing ground out of the donors' neighbourhood, and on a coast
            # backed by a hill the donors ARE the hill.
            #
            # This is what put a 20m bank across Siloso. Central Beach is built
            # end to end, so nearly every sample there is "contaminated"; the
            # clean donors within 300m are up on Mount Imbiah's slope; and four
            # samples reading a correct 6.7-7.8m were rewritten to 27-39m. The
            # grid then interpolated 22.9m at the Wings of Time grandstand,
            # where raw Copernicus says 3.9m — a 19m error with no bad input
            # anywhere, made entirely by the repair. 582 of Sentosa's 1,256
            # repairs were raising a sample, by a median 4.2m and a worst 30.9m.
            #
            # The floor above keeps a hill; this ceiling keeps a beach. Both are
            # the same fact about what a surface model does to a building.
            # Water still repairs in both directions — a reading over water is
            # garbage in the other direction and raw is no anchor at all.
            hmax, wat = near_fn.contam_h(x, z) if near_fn else (0.0, True)
            if not wat and hmax < 8.0:
                continue                     # reading kept; error <= 8m
            if hmax > 0.0:
                med = max(med, elev[i] - hmax - 6.0)
            if not wat:
                med = min(med, elev[i])      # a building lifts; it never digs
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
    #
    # AND EACH MARK CARRIES WHO MADE IT. The two passes below report a COUNT of
    # cells they kept dry, and a count cannot be argued with — it says the
    # guard fired, not which surveyed thing it fired for. Queue item 2 was
    # carried for three sessions as "the 1,050 m footway holds the Gateway
    # channel dry" on nothing but the fact that a footway is near the channel
    # and the channel is dry. `_built` is a dict whose VALUES nothing reads, so
    # the attribution is free: the membership test is unchanged and the print
    # can finally name the feature. Do not turn this into a fix — it is the
    # measurement that decides whether there is one.
    _built = {}
    _mark_who = [None]                  # set by each emitter before it marks
    def _mark_cell(px, pz):
        _built.setdefault(
            (int(math.floor(px / CELL)), int(math.floor(pz / CELL))), set()
        ).add(_mark_who[0])
    def _mark_span(ax, az, bx, bz):
        n = int(math.hypot(bx - ax, bz - az) / (CELL * 0.5)) + 1
        for s in range(n + 1):
            t = s / n
            _mark_cell(ax + (bx - ax) * t, az + (bz - az) * t)
    # ...EXCEPT A STRUCTURE THAT STANDS ON LEGS OVER THE WATER, which is not a
    # building holding its ground up. Holding its cell dry builds it an island.
    #
    # The Wings of Time stage found this: way/116818158, 677 m2 of surveyed
    # framework standing in the Singapore Strait 77 m off Central Beach,
    # published by its contractor as "mounted on a framework six meters above
    # the sea level" and "constructed in the ocean". Its cells stayed dry, the
    # sea around them sank to -2, and the stage sat on a 3.4 m plateau of land
    # with its own beach edge — in full view from the seating bank the entire
    # show is watched from (shots/street/stage2.shot2).
    #
    # A GENERAL RULE WAS WRITTEN FIRST, AND MEASURING IT IS WHY IT IS NOT HERE.
    # "Every vertex inside mapped water" sounds like exactly the discriminator —
    # a waterfront block only ever meets the ring at its edge. On sentosa it
    # matched 79 footprints, and 78 of them are OUR data gaps rather than the
    # world:
    #   * 40 are `bg:1` on Pulau Brani and the Keppel shore — the Police Coast
    #     Guard base, the Brani Terminal Building, the SCDF Marine Command. They
    #     read as "in water" because our sea polygon is everything outside
    #     SENTOSA's coastline and the far shore is inside it. Sinking those is
    #     the exact regression the protection above was written for on
    #     2026-08-03.
    #   * 38 are the Pearl Island and Sandy Island bungalows at Sentosa Cove.
    #     They are on reclaimed islands INSIDE the marina, and the islands are
    #     holes in the water polygon that we do not model — the demoted `hp`
    #     item. The rule would have dropped 38 real houses into the sea.
    # So the general-looking rule was a rule about two unfixed data gaps, and a
    # measurement caught it before it shipped. This is a NAMED exception, which
    # is what an authored fact is in this project, and it says why.
    OVER_WATER = {("hut", "Wings of Time")}      # the show's set, on stilts

    _afloat = 0
    for _bi, _b in enumerate(data.get("buildings", [])):
        _p = _b.get("p", [])
        if len(_p) < 3:
            continue
        if (_b.get("bt"), _b.get("n")) in OVER_WATER:
            _afloat += 1
            continue
        _who = "bld#%d %s %s" % (_bi, _b.get("bt") or "-", _b.get("n") or "")
        _xs = [q[0] for q in _p]; _zs = [q[1] for q in _p]
        for _ci in range(int(math.floor(min(_xs) / CELL)), int(math.floor(max(_xs) / CELL)) + 1):
            for _cj in range(int(math.floor(min(_zs) / CELL)), int(math.floor(max(_zs) / CELL)) + 1):
                _built.setdefault((_ci, _cj), set()).add(_who)
    if _afloat:
        print(f"   {_afloat} structure(s) stand on legs over the water — "
              f"their cells are left to the sea")
    # A BRIDGE DECK IS NOT THE GROUND — AND THIS FILE ALREADY SAYS SO, 600
    # LINES UP, IN THE OTHER DIRECTION.
    #
    # `road_samples` refuses to SAMPLE a bridge, in those words, because an
    # elevated way returns its own deck height and put a 53 m ridge across
    # Marina Bay. The same fact decides this question too and was never applied
    # here: a deck on piers does not hold its ground up, so marking its cells
    # `_built` keeps the sea out from under a structure whose whole point is
    # that the sea runs under it. The Sentosa Boardwalk is 395 m of `bridge=1`
    # walking over Keppel Harbour, and it was drawing the harbour as land.
    #
    # This is the same shape as the `OVER_WATER` exception above, which is a
    # NAMED list because the discriminator for buildings had to be authored —
    # a waterfront block only meets the water at its edge and nothing in the
    # data separates it from a stage on stilts. Ways need no list: OSM tags the
    # bridge, and the tag is already carried through the pipeline and already
    # trusted for exactly this fact.
    #
    # Over LAND this changes nothing at all — a viaduct's cells are land
    # whether or not the deck marks them, because only the water and coastline
    # passes read `_built`, and neither fires on dry ground.
    _bridged = 0
    for _ri, _r in enumerate(data.get("roads", [])):
        if _r.get("bridge"):
            _bridged += 1
            continue
        _p = _r.get("p", [])
        _len = sum(math.hypot(_p[_s + 1][0] - _p[_s][0], _p[_s + 1][1] - _p[_s][1])
                   for _s in range(len(_p) - 1))
        _mark_who[0] = "road#%d %s w%.1f %.0fm %s" % (
            _ri, _r.get("k") or "-", _r.get("w") or 0.0, _len, _r.get("n") or "")
        for _s in range(len(_p) - 1):
            _mark_span(_p[_s][0], _p[_s][1], _p[_s + 1][0], _p[_s + 1][1])
    _mark_who[0] = None
    if _bridged:
        print(f"   {_bridged} bridge way(s) hold no ground up — their decks "
              f"are on piers and the water runs under them")

    def carries_built(px, pz):
        ci, cj = int(math.floor(px / CELL)), int(math.floor(pz / CELL))
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                if (ci + di, cj + dj) in _built:
                    return True
        return False

    # The 3x3 above exists for the bilinear leak — but it also lets a bank
    # footway hold a 105 m band of open sea dry: the Sentosa Cove moats were
    # never sunk because the waterside promenades stand one cell from every
    # cell in them (SESSION 18; the moats read 6-9 m grass under mapped
    # water). This answers the narrower question — does a surveyed thing
    # actually CROSS this cell — so a sinking pass can treat "held only by a
    # neighbour" differently when the raw DEM testifies the cell is sea.
    def carries_built_here(px, pz):
        return (int(math.floor(px / CELL)), int(math.floor(pz / CELL))) in _built

    def built_why(px, pz):
        """Every surveyed thing in the 3x3 that `carries_built` answers TRUE
        for. Same neighbourhood, same order of scan — if this returns empty,
        `carries_built` returned False."""
        ci, cj = int(math.floor(px / CELL)), int(math.floor(pz / CELL))
        out = set()
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                out |= _built.get((ci + di, cj + dj), set())
        out.discard(None)
        return out

    _dry_log = []                       # (pass, gx, gz, frozenset(reasons))

    def _report_dry(tag):
        """Name the features that held cells out of the water, worst first.
        A count says the guard fired; this says what it fired FOR."""
        rows = [r for r in _dry_log if r[0] == tag]
        if not rows:
            return
        tally = {}
        for _, gx, gz, why in rows:
            for w in (why or {"(no attribution)"}):
                e = tally.setdefault(w, [0, gx, gx, gz, gz])
                e[0] += 1
                e[1] = min(e[1], gx); e[2] = max(e[2], gx)
                e[3] = min(e[3], gz); e[4] = max(e[4], gz)
        order = sorted(tally.items(), key=lambda kv: -kv[1][0])
        print(f"   why those {len(rows)} stayed dry ({tag}) — "
              f"{len(order)} feature(s), the top {min(12, len(order))}:")
        for w, (n, x0, x1, z0, z1) in order[:12]:
            print(f"     {n:5d} cell(s)  x {x0:.0f}..{x1:.0f}  z {z0:.0f}..{z1:.0f}  {w}")
        # Island-wide it ranks by count, and the thing you are chasing is
        # rarely the biggest. `SG_DRYWHY=x0,z0,x1,z1` asks the same question of
        # one corridor and lists EVERY cell in it, because when the answer is
        # "nothing holds that dry" only the empty list says so.
        box = os.environ.get("SG_DRYWHY")
        if box:
            try:
                bx0, bz0, bx1, bz1 = [float(v) for v in box.split(",")]
            except ValueError:
                print(f"   SG_DRYWHY={box!r} is not x0,z0,x1,z1 — ignored")
                return
            hits = [r for r in rows if bx0 <= r[1] <= bx1 and bz0 <= r[2] <= bz1]
            print(f"   SG_DRYWHY x {bx0:.0f}..{bx1:.0f} z {bz0:.0f}..{bz1:.0f}: "
                  f"{len(hits)} of the {len(rows)} kept-dry cells are in that box")
            for _, gx, gz, why in sorted(hits, key=lambda r: (r[2], r[1])):
                for w in sorted(why) or ["(no attribution)"]:
                    print(f"     {gx:8.0f} {gz:8.0f}  {w}")

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
        sunk_dem = 0
        kept_w = 0
        skipped_sea = 0
        # AN INLAND CHANNEL BANK IS A QUAY, NOT A BEACH. Cells the DEM-witness
        # clauses carve (SG_CARVE) are collected here, and the shore-ease and
        # shore-smooth passes below refuse to treat them as "sea": without
        # this, carving the Cove moats pulled Sandy Island down four metres —
        # every island cell sat within the ease pass's three-cell reach of a
        # newly-sunk moat cell and was graded to a beach ramp (SESSION 18
        # part 5, measured). The real Cove banks are vertical quay walls; the
        # water steps down at them, the land does not ramp in. Empty without
        # the flag, so the default build is untouched.
        _quay = set()
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
            # Rings are processed SEQUENTIALLY off the live grid, so a ring
            # whose lowest vertex lands on a cell an earlier ring already sank
            # reads rim -2 and writes floor -4 — the whole grid datum shifted
            # (base -2 -> -4) the first time the carve ran. A rim is a
            # WATERLINE; it is never below the sea.
            floor = max(rim, 0.0) - 2.0
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
            # THE INSET STARVES A NARROW CHANNEL, AND THE DEM IS THE WITNESS
            # THAT REOPENS IT (2026-08-14). The Sentosa Cove waterway arms are
            # 40-80 m wide on a 35 m grid: nearly every cell inside them sits
            # within the inset of a bank, so this pass sank nothing there and
            # the moats around Pearl and Sandy Island stayed drawn as 6-9 m
            # grass under a mapped water polygon — the invisible walls of
            # SESSION 18. The raw Copernicus DEM is the non-circular judge
            # this file already trusts (batch 5): where a cell inside a water
            # ring reads UNDER 0.8 m in the raw array, the channel is really
            # there at sea level, and the cell sinks to SEA_SINK whatever the
            # inset says. An elevated pond never triggers (its DEM reads its
            # own surface height), an overreaching polygon on a hill never
            # triggers (DEM high) — the discriminator is per cell, so the
            # Cruise-Centre class of mistake cannot come back through here. A
            # small margin (0.35 cells) still keeps the quay-edge cell at
            # land height, and carries_built keeps every crossing.
            demwet_cand = []
            for j in range(grid["nz"]):
                gz = grid["z0"] + j * CELL
                if gz < rz0 - CELL or gz > rz1 + CELL:
                    continue
                for i in range(grid["nx"]):
                    gx = grid["x0"] + i * CELL
                    if gx < rx0 - CELL or gx > rx1 + CELL:
                        continue
                    k = j * grid["nx"] + i
                    if grid["h"][k] <= floor or not inside(gx, gz, ring):
                        continue
                    ed = edge_dist(gx, gz, ring)
                    if ed >= inset:
                        if carries_built(gx, gz):
                            kept_w += 1
                            _dry_log.append(("water-sink", gx, gz, built_why(gx, gz)))
                            continue
                        grid["h"][k] = floor
                        sunk += 1
                    elif (os.environ.get("SG_CARVE")
                          and ed >= CELL * 0.35 and grid["h"][k] > SEA_SINK):
                        demwet_cand.append((k, gx, gz))
            if demwet_cand:
                lls = [(lat0 - gz / m_lat, lon0 + gx / m_lon)
                       for _, gx, gz in demwet_cand]
                dems = local_elev(lls)
                for (k, gx, gz), dv in zip(demwet_cand, dems):
                    if dv is None or dv >= 0.8:
                        continue
                    # held by a feature ON the cell: genuinely built ground.
                    # Held only by a NEIGHBOUR's feature: the 3x3 smear, and
                    # the DEM has already testified this cell is sea.
                    if carries_built_here(gx, gz):
                        kept_w += 1
                        _dry_log.append(("water-sink", gx, gz, built_why(gx, gz)))
                        continue
                    grid["h"][k] = SEA_SINK
                    _quay.add(k)
                    sunk_dem += 1
        if skipped_sea:
            print(f"   {skipped_sea} water ring(s) mostly outside the coast — "
                  f"left to the sea pass")
        if sunk:
            print(f"   sank {sunk} grid cells under {len(rings)} water polygons")
        if sunk_dem:
            print(f"   sank {sunk_dem} more inside the bank inset — "
                  f"the raw DEM reads under 0.8m there (a real channel)")
        if kept_w:
            print(f"   kept {kept_w} of those dry — they carry a road or a building")
            _report_dry("water-sink")
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

        # THE BEACH LIP IS GONE, AND IT WAS DRAWING 69 HECTARES OF SEA AS LAND.
        #
        # This pass used to keep any cell within INSET_C = 31.5 m OUTSIDE the
        # coastline at whatever the DEM said, "with a one-cell lip at land
        # height so the coast slopes rather than steps". That was written on
        # 2026-08-03, when sinking the outside was ALL this file did about the
        # shore and a bare sink really did leave a cliff at the ring.
        #
        # The beach cut below now grades the LANDWARD side off the surveyed
        # coastline — the ground sits just under the waterline at the ring and
        # climbs inland at 8.5% — so the slope the lip existed to provide is
        # already there, and better, and keyed to the survey rather than to a
        # cell size. What the lip does now is hold 31.5 m of Copernicus's
        # SMEARED SHORE above sea level, and this file already knows what that
        # reads: "a 35 m cell blending jungle hill into beach reads 5-16 m over
        # the SAND and stays positive over near-shore water". The shore-smooth
        # pass names it as its own worst case in so many words — "the coastline
        # inset keeps a 'beach lip' cell at the DEM's smeared 15-20 m and the
        # cell beside it is sunk to -2, so the face between them is the full
        # drop".
        #
        # MEASURED 2026-08-07, on the world as it shipped, and this is the
        # defect the handover filed as "a coastline question":
        #
        #   surveyed island (islandRing)     4.89 km2   (published Sentosa ~5.0)
        #   DRAWN land (vertexY > 0)         5.58 km2
        #     drawn land that is sea          69.3 ha
        #     sea that should be land          0.0 ha   <- one-directional
        #   drawn waterline seaward of the survey, over 13.67 km of coast:
        #     p25 31 m   MEDIAN 46 m   p90 158 m
        #
        # The p25 IS this constant. Then at() is bilinear over 35 m cells, so
        # the lip bleeds another cell seaward, and terrain.js's overreach guard
        # keeps anything above 1.2 m on the island mask as land — a guard whose
        # own written premise is "the grid's own data-side passes already sank
        # every genuine water cell". This was the pass that didn't. Central
        # Beach measured 80 m from drawn water on a 30 m beach because the water
        # genuinely was that far away in what we drew.
        #
        # A cell outside the survey is sea. Buildings and roads still hold their
        # ground (the two guards below, unchanged) — that is what keeps a pier,
        # a stilted deck and the Keppel wharves out of the water.
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
                if on_building(gx, gz):
                    continue
                if carries_built(gx, gz):
                    # The 3x3 keep is generous — and on the beaches it is
                    # CORRECT: the drawn sand legitimately stands seaward of
                    # the surveyed coastline (the beach cut builds it there),
                    # and it is the beach-walk's own features that hold it.
                    # A DEM-witnessed carve was tried here (SESSION 18) and
                    # ate Palawan Beach whole — the waterline golden showed
                    # the rider floating on open water where the sand was.
                    # Channel carving belongs to the WATER-SINK pass, whose
                    # rings say where a channel actually is.
                    kept_built += 1
                    _dry_log.append(("sea-sink", gx, gz, built_why(gx, gz)))
                    continue
                grid["h"][k] = SEA_SINK
                sunk_sea += 1
        if kept_built:
            print(f"   kept {kept_built} cells dry — they carry a road or a building")
            _report_dry("sea-sink")
        if sunk_sea:
            print(f"   sank {sunk_sea} cells outside {len(coast_rings)} coastline ring(s) — the open sea")

        probe(grid, "sea-sink")

        # ...AND THE WATER UNDER A STRUCTURE ON LEGS GOES BACK BEFORE THE SHORE
        # PASSES RUN, NOT AFTER THEM.
        #
        # Not marking the Wings of Time stage as built (see OVER_WATER above)
        # was necessary and not sufficient. Its cell still came out dry, at
        # +0.1 m, for two reasons stacked on each other: `carries_built` reads a
        # 3x3 neighbourhood, and a footprint marks its BOUNDING BOX rather than
        # its ring — so the seating bank 78 m away, whose bbox corner just
        # clips this cell, held the sea out from under the stage. Then every
        # shore pass has SEA_SINK as its floor and can only approach it.
        #
        # The result is what the frame showed: pale peaks on a dark deck with
        # its legs planted in SAND (shots/street/stage5.shot1). A stage
        # published as "constructed in the ocean" needs the ocean drawn under
        # it.
        #
        # DOING IT LAST WAS THE OBVIOUS PLACE AND IT WAS WRONG. Set after every
        # shore pass, where nothing could raise them again, the sunk cells stood
        # as a 3 m VERTICAL STEP against their neighbours and the ground shader
        # drew that face as grey rock — a flat slab standing on the beach beside
        # the stage, in frame in `wings-stage` and `wings-grandstand`. (It is
        # also, finally, the answer to an artefact that had been in every shot
        # of this quarter all session and survived being blamed on the beach
        # furniture, the arcade, the seating bank's own skirt and a place label,
        # each ruled out by tinting its material: a heightfield step IS a wall,
        # and no object had to exist to draw one.)
        #
        # So it goes in HERE instead, straight after the sea sink, and the same
        # ease / beach-cut / smooth passes that grade every other waterline
        # grade this one. Their floor is SEA_SINK, so nothing can lift a sunk
        # cell back into the air; all they can do is slope its neighbours in.
        if OVER_WATER:
            _ow_rings = [b["p"] for b in data.get("buildings", [])
                         if (b.get("bt"), b.get("n")) in OVER_WATER
                         and len(b.get("p", [])) >= 3]
            # A PAD, because a 35 m grid cannot follow a 10 m-wide frame. The
            # first cut sank only the cells whose sample point fell inside the
            # ring, and that ring is a thin chevron: it caught every other cell
            # and left a checkerboard of 2-4 m stubs between them, which the
            # ground shader drew as grey rock faces beside the deck. Cells
            # WITHIN the pad go too — but only where the water polygon already
            # says water, so the beach behind can never be sunk by this.
            OW_PAD = 12.0
            def _near_ring(px, pz, ring):
                for a in range(len(ring)):
                    ax_, az_ = ring[a]; bx_, bz_ = ring[(a + 1) % len(ring)]
                    vx, vz = bx_ - ax_, bz_ - az_
                    L2 = vx * vx + vz * vz
                    t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, ((px - ax_) * vx + (pz - az_) * vz) / L2))
                    if math.dist((px, pz), (ax_ + vx * t, az_ + vz * t)) < OW_PAD:
                        return True
                return False
            _wet = [w["p"] for w in data.get("water", []) if len(w.get("p", [])) >= 3]
            _forced = 0
            for _r in _ow_rings:
                for j in range(grid["nz"]):
                    gz = grid["z0"] + j * CELL
                    for i in range(grid["nx"]):
                        k = j * grid["nx"] + i
                        if grid["h"][k] <= SEA_SINK:
                            continue
                        gx = grid["x0"] + i * CELL
                        if not (_inside(gx, gz, _r) or _near_ring(gx, gz, _r)):
                            continue
                        if not any(_inside(gx, gz, _w) for _w in _wet):
                            continue          # never sink ground the map calls land
                        grid["h"][k] = SEA_SINK
                        _forced += 1
            if _forced:
                print(f"   put {_forced} cell(s) back under the sea — a structure "
                      f"on legs stands in the water it was built in")
            probe(grid, "over-water")

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
        # THE MASK MUST ASK THE SOURCE, NOT OUR OWN COPY OF IT.
        #
        # This test read `Hpre` alone — the INTERPOLATED grid — and Hpre is the
        # thing under suspicion. Our 35 m cells smear a ridge downhill, so the
        # slope BELOW a real cliff reads high in our grid, passes the test, and
        # is protected from the very shore passes that would have brought it
        # back to the ground. The mask was defending the error.
        #
        # Measured at (-2102,11930), the biggest entry on the manufactured-cliff
        # list and carried in the handover since SESSION 14 as "the mask's other
        # half". Its own 3x3, hpre against Copernicus GLO-30:
        #
        #     -2137,11895  hpre 20.9 B   DEM  3.4    +17.5
        #     -2102,11930  hpre 22.8 B   DEM 10.9    +11.9
        #     -2137,11965  hpre 35.1 B   DEM 39.2     -4.1
        #     hpre median 22.8  ->  bluff        DEM median 10.9  ->  not a cliff
        #
        # The top row is a genuine cliff and the DEM says so; the bottom row is
        # our smear of it and the DEM says that too. One test could not tell
        # them apart because it only ever looked at the smear.
        #
        # So BOTH must agree: the cell is high in our grid AND the source's own
        # neighbourhood is a cliff. Every cell the DEM confirms is untouched —
        # Fort Siloso and Serapong keep their protection, which is what this
        # mask was built for and what the standing "DO NOT TUNE IT BY EYE"
        # instruction on that headland is about. Only the cells our own
        # interpolation invented lose it, which is the entire point.
        _dem_cell = local_elev([(lat0 - (grid["z0"] + j * CELL) / m_lat,
                                 lon0 + (grid["x0"] + i * CELL) / m_lon)
                                for j in range(grid["nz"])
                                for i in range(grid["nx"])])
        bluff = [False] * len(Hpre)
        _src_refused = 0
        for j in range(grid["nz"]):
            for i in range(grid["nx"]):
                k = j * grid["nx"] + i
                if Hpre[k] <= CLIFF_H:
                    continue
                neigh, dneigh = [], []
                for dj in (-1, 0, 1):
                    for di in (-1, 0, 1):
                        ni, nj = i + di, j + dj
                        if 0 <= ni < grid["nx"] and 0 <= nj < grid["nz"]:
                            neigh.append(Hpre[nj * grid["nx"] + ni])
                            dneigh.append(_dem_cell[nj * grid["nx"] + ni])
                if statistics.median(neigh) > CLIFF_H:
                    if statistics.median(dneigh) > CLIFF_H:
                        bluff[k] = True
                    else:
                        _src_refused += 1
        if any(bluff):
            print(f"   {sum(bluff)} cells classified bluff — shore passes keep off")
        if _src_refused:
            print(f"   {_src_refused} cell(s) looked like bluff in our grid and the "
                  f"source says otherwise — not protected")

        # A MASK WITHOUT A MARGIN IS HALF A MASK, and its own edge is the cliff.
        #
        # The bluff test above is a BINARY laid across a CONTINUOUS slope, so
        # the shore passes stop dead at it: the hill is protected and the hill's
        # TOE is cut to the beach profile, and the discontinuity lands on the
        # boundary of the mask rather than on any landform. Measured on the
        # shipped grid 2026-08-08, against the DEM as referee — "did a pass
        # invent a step the source data does not have?", which needs no opinion
        # about the true height of a wooded ridge:
        #
        #   116 adjacent land-cell pairs where OUR step exceeds the DEM's by
        #   more than 4m. THE TOP 20 ARE EVERY ONE OF THEM A BLUFF/NON-BLUFF
        #   PAIR. At (-2312,11930), Fort Siloso: we drew 0.6 beside 23.8 where
        #   the DEM reads 15.6 beside 20.8.
        #
        # That pair is the N3 regression the owner has had live since
        # 260807-2354 (spikes 20 -> 79): the footway over it went from a 14%
        # grade to 63%. The 3x3 there is 10.3 14.1 18.5 / 12.4 17.6 23.8 /
        # 17.0 23.4 29.6 — an unbroken monotonic hillside, and the cell fails
        # BOTH halves of the CLIFF_H test by 0.4m. A threshold on a continuum
        # will always cut somewhere; the answer is not to move it (this
        # headland has been mis-modelled twice by hand-picked constants and the
        # standing instruction is DO NOT TUNE IT BY EYE) but to stop the mask
        # having an edge at all.
        #
        # So a bluff casts a FLOOR onto the ground around it, falling away at
        # the rate ground on this island actually falls. BLUFF_FALL is the p90
        # of the DEM's own cell-to-cell grade over the pairs that touch the
        # bluff (median 0.113, p90 0.265, p95 0.318 — measured, not chosen), so
        # the feather is as steep as real steep ground here and no steeper.
        # It is capped at the cell's own pre-shore height, so it can only ever
        # withhold a cut and never invent ground; on a beach the nearest bluff
        # is far outside REACH and it never fires at all.
        # ...AND WHERE THE SURVEY SAYS THERE IS A BEACH, THE BEACH CUT GOVERNS
        # AND THE FEATHER STANDS DOWN. This is not an exemption, it is this
        # file's own hierarchy applied one level further: the beach cut exists
        # because "the elevation source is a 30m global surface model and the
        # COASTLINE is surveyed, and where the two disagree about where the sea
        # starts, the survey wins." The feather is DEM-derived. Mapped sand is
        # survey. So sand wins over the feather for the same reason.
        #
        # WITHOUT THIS IT BURIED SILOSO BEACH, and the render is the only thing
        # that said so — the grid-cell check passed (6 sand cells moved, by at
        # most 0.20m) because the DRAWN sand interpolates from the cells OUTSIDE
        # the ring, and those rose 7m. Rendered at Coastes from the water: the
        # sand and the waterline were gone and the beach read as a green bank
        # with the sign buried behind it. That is the owner's "greenish thing in
        # the sand", which he has now had to report twice, arriving a third time
        # by a new route. VERIFY AT THE END OF THE PIPELINE THE USER LOOKS AT —
        # this file already carried that sentence and I still paid for it.
        #
        # The separation is not close, so this costs the fix nothing: the Fort
        # Siloso cell this whole batch is for is 265 m from the nearest mapped
        # sand, and the cells that buried Siloso were 50-56 m. The radius is
        # BEACH_REACH, the constant already defined below for exactly "how far
        # inland a beach's influence runs" — not a new number chosen to fit.
        BLUFF_FALL = 0.28
        BLUFF_REACH = 3          # cells — the same reach the ease itself has
        SAND_KEEPOUT = 110.0     # = BEACH_REACH, defined below
        _sand = [w["p"] for w in data.get("green", [])
                 if w.get("k") == "sand" and len(w.get("p", [])) >= 3]
        bluff_floor = [-1e9] * len(Hpre)
        for j in range(grid["nz"]):
            for i in range(grid["nx"]):
                if not bluff[j * grid["nx"] + i]:
                    continue
                hb = Hpre[j * grid["nx"] + i]
                for dj in range(-BLUFF_REACH, BLUFF_REACH + 1):
                    for di in range(-BLUFF_REACH, BLUFF_REACH + 1):
                        ni, nj = i + di, j + dj
                        if not (0 <= ni < grid["nx"] and 0 <= nj < grid["nz"]):
                            continue
                        d = math.hypot(di, dj) * CELL
                        k2 = nj * grid["nx"] + ni
                        v = hb - d * BLUFF_FALL
                        if v > bluff_floor[k2]:
                            bluff_floor[k2] = v
        # ...AND THE DEM IS THE CEILING ON THE FEATHER, because Hpre alone is
        # not a safe cap: the interpolated grid is exactly what is wrong on a
        # cape. At Tanjong Rimau (-2531,11852) Hpre is 15.3 where the DEM reads
        # 4.33, so capping at Hpre held 9.9m of invented ground that the shore
        # passes had been correctly cutting away. The referee that diagnosed
        # this defect is "our step against the DEM's step", so the repair is
        # keyed to the same referee: a bluff may withhold a cut only up to the
        # height the source data itself reports. Over a roof or under canopy
        # the DEM reads HIGH, which cannot bite; over water it reads garbage,
        # and a lower cap only means the existing passes proceed untouched.
        # the same samples the bluff test above already took: one DEM pass per
        # grid, not two
        _cell_dem = _dem_cell
        _onsand = 0
        for k in range(len(bluff_floor)):
            # never above what the cell already had, and never above the source:
            # a floor withholds a cut, it does not build a hill
            bluff_floor[k] = min(bluff_floor[k], Hpre[k], _cell_dem[k])
            if bluff_floor[k] <= SEA_SINK:
                continue
            gx = grid["x0"] + (k % grid["nx"]) * CELL
            gz = grid["z0"] + (k // grid["nx"]) * CELL
            for _s in _sand:
                if _inside(gx, gz, _s) or _edge_dist(gx, gz, _s) < SAND_KEEPOUT:
                    bluff_floor[k] = -1e9      # the survey says beach
                    _onsand += 1
                    break
        if _onsand:
            print(f"   {_onsand} of those stand down — mapped sand within "
                  f"{SAND_KEEPOUT:.0f}m, and the survey outranks the DEM")
        _feathered = sum(1 for k in range(len(bluff_floor))
                         if not bluff[k] and Hpre[k] > SEA_SINK
                         and bluff_floor[k] > SEA_SINK)
        if _feathered:
            print(f"   {_feathered} cells on a bluff's flank — the shore passes "
                  f"feather out of it at {BLUFF_FALL:.2f}")

        # TERRAIN_BLUFF_DUMP=<path> writes the PRE-SHORE grid and this
        # classification out, so a threshold here can be chosen from the
        # measured distribution rather than by eye. Fort Siloso has been
        # mis-modelled twice by hand-picked constants and the standing
        # instruction on this headland is DO NOT TUNE IT BY EYE.
        _dump = os.environ.get("TERRAIN_BLUFF_DUMP")
        if _dump:
            json.dump({"x0": grid["x0"], "z0": grid["z0"], "cell": CELL,
                       "nx": grid["nx"], "nz": grid["nz"],
                       "hpre": Hpre, "bluff": bluff}, open(_dump, "w"))
            print(f"   wrote pre-shore grid + bluff mask to {_dump}")

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
                        _nk = nj * grid["nx"] + ni
                        # a carved channel cell is a QUAY edge — the bank
                        # holds its height, the ramp rule is for open coast
                        if H0[_nk] <= -1.9 and _nk not in _quay:
                            best = min(best, max(abs(di), abs(dj)))
                if best > 3:
                    continue
                target = [0.0, 0.8, 3.0, 5.5][best]
                target = max(target, bluff_floor[k])    # feather out of a bluff
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
        # THE TARGET IS KEPT, because the smoothing pass below has to honour it.
        # See the ceiling there: this profile is the survey's answer for the
        # shore band, and a box blur that may raise a cell will otherwise walk
        # the waterline back out to sea, which is what it was doing.
        cut_target = [None] * len(grid["h"])
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
                # ...and the same feather, BEFORE cut_target is stored, so the
                # smoothing pass's ceiling honours the flank too. A ceiling set
                # from a cut this pass was not allowed to make would put the
                # cliff straight back on the next blur.
                target = max(target, bluff_floor[k])
                cut_target[k] = target
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
                        # quay cells are not "sea" here either, or the blur
                        # drags the whole Cove into the shore band
                        if 0 <= ni < grid["nx"] and 0 <= nj < grid["nz"] \
                                and grid["h"][nj * grid["nx"] + ni] <= -1.9 \
                                and (nj * grid["nx"] + ni) not in _quay:
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
                    # ...AND A CEILING, WHICH IS THE OTHER HALF OF THE SAME
                    # SENTENCE THE REPAIR LOOP LEARNED IN main().
                    #
                    # That loop's note reads: "a building repair that RAISES a
                    # sample is inventing ground out of the donors' neighbourhood,
                    # and on a coast backed by a hill the donors ARE the hill."
                    # This blur is the same shape of rule with the same donors,
                    # and it had a floor and no ceiling — so on every shore with
                    # ground rising behind it, five passes lifted the graded
                    # waterline cells back toward that ground.
                    #
                    # Measured 2026-08-07 on the Central Beach transects, in the
                    # probe's own words: beach-cut 0.9 -> shore-smooth 2.1 at the
                    # back of the beach, and -0.7 -> 0.7 at the surveyed
                    # waterline. A cell the survey had just put UNDER the water
                    # came back out of it. That is why removing the 31.5 m lip
                    # above only took the drawn coastline from 46 m out to 30 m
                    # instead of to the survey: this pass was putting it back.
                    #
                    # So the beach cut's own target is the ceiling wherever it
                    # set one. Spike-lowering — the entire reason this pass
                    # exists — is untouched, because a protected building spike
                    # is ABOVE its target and still falls. Beyond BEACH_REACH
                    # there is no target and no ceiling, so nothing inland moves.
                    if cut_target[k] is not None:
                        nv = min(nv, cut_target[k])
                    if abs(nv - grid["h"][k]) > 0.01:
                        grid["h"][k] = nv
                        smoothed += 1
        if smoothed:
            print(f"   smoothed {smoothed} shore-band cell writes into a coast")
        probe(grid, "shore-smooth")


    # ---- THE WET WITNESS: WHERE MAPPED WATER LIES OVER DRAWN LAND AND THE
    # ---- RAW DEM TESTIFIES THE CHANNEL IS REAL (2026-08-15, the Cove canal)
    #
    # The data-side carve stays parked (SG_CARVE, SESSION 18 part 11): at 35m
    # the waterfront houses' own footprints hold the moat cells, and carving
    # at() puts their feet in the sea through the bilinear. This block changes
    # NO height. It ships the part-4 DISCRIMINATION per cell, so the DRAWN
    # skin (terrain.js vertexY, which already cuts the Singapore River at
    # mesh resolution while at() keeps the quay) can sink the channels the
    # picture owes while every check and every house keeps its ground.
    #
    # A cell is witnessed when: a mapped water polygon covers its centre
    # (holes are land — the relparcels lesson), the raw Copernicus DEM reads
    # under 0.8m (the SG_CARVE clause's own threshold), the grid still calls
    # it land above 1.2m absolute, and the drawn ground exceeds the DEM by
    # 2.5m. The last two tests are what keep every beach out: near the
    # waterline the grid is under 1.2, and mid-beach Copernicus smears the
    # shore HIGH ("a 35m cell blending jungle hill into beach reads 5-16m
    # over the SAND") so dem < 0.8 fails — while a moat stands 5-7m of drawn
    # grass over a DEM of 0.0-0.7.
    def _wc_in(px, pz, ring):
        c = False
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, zi = ring[i]
            xj, zj = ring[j]
            if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                c = not c
            j = i
        return c

    _wet_polys = [(w["p"], w.get("hp") or []) for w in data.get("water", [])
                  if len(w.get("p", [])) > 3]
    _wet_cand = []
    for j in range(grid["nz"]):
        gz = grid["z0"] + j * CELL
        for i in range(grid["nx"]):
            k = j * grid["nx"] + i
            if grid["h"][k] <= 1.2:
                continue
            gx = grid["x0"] + i * CELL
            hit = False
            for rp, hp in _wet_polys:
                if _wc_in(gx, gz, rp) and not any(_wc_in(gx, gz, h) for h in hp):
                    hit = True
                    break
            if hit:
                _wet_cand.append((k, gx, gz))
    grid["wet"] = []
    if _wet_cand:
        _wet_dems = local_elev([(lat0 - gz / m_lat, lon0 + gx / m_lon)
                                for _, gx, gz in _wet_cand])
        _wet_set = set()
        for (k, gx, gz), dv in zip(_wet_cand, _wet_dems):
            if dv is None or dv >= 0.8:
                continue
            if grid["h"][k] - dv < 2.5:
                continue
            _wet_set.add(k)
        # THE JUDGEMENT IS PER CLUSTER, THE CARVE IS PER RING — part 4's own
        # method. The per-cell witness establishes WHICH rings are real
        # channels, but Copernicus smear leaves gaps along a narrow moat
        # (Pearl's ring came out 22 cells of 35 and rendered as flooded
        # marsh, vetted canal-pearl-air). A ring that qualifies — three or
        # more witnessed cells and 30% of its over-land interior — floods
        # its WHOLE interior (holes stay land). The sea mega-ring can never
        # qualify: its over-land interior is the 69-hectare overreach class,
        # far more than 3.3x its witnessed moat cells, and it is skipped by
        # name besides.
        _n_seed = len(_wet_set)
        for w in data.get("water", []):
            if w.get("k") == "sea":
                continue
            rp = w.get("p") or []
            if len(rp) < 4:
                continue
            hp = w.get("hp") or []
            cells = [(k, gx, gz) for (k, gx, gz) in _wet_cand
                     if _wc_in(gx, gz, rp)
                     and not any(_wc_in(gx, gz, h) for h in hp)]
            wet_in = sum(1 for (k, _, _) in cells if k in _wet_set)
            flood = wet_in >= 3 and wet_in * 10 >= len(cells) * 3
            # THE COVE'S INNER CANAL ARMS CANNOT SEED: raw Copernicus reads
            # 2.8-7.7m ACROSS a 40m canal between two bungalow rows — pure
            # smear — so the DEM can neither witness nor refute them, and a
            # per-ring DEM-median judgement was measured 2026-08-15 to
            # flood NOTHING (every arm fails on the smeared median). The
            # published master plan settles it instead: Sentosa Cove is a
            # Port Grimaud marina-canal estate with "a fully tidal marina
            # and semi-tidal canal precincts", bungalows berthing yachts
            # on the waterways — research/cove-arms.md carries the sources
            # and the rule that applies ("survey outranks derived DEM",
            # the beach precedent). One authored interior anchor per arm;
            # a candidate ring containing an anchor floods. The golf ponds
            # are deliberately NOT anchored — their DEM medians are their
            # own elevated surfaces, and carving them to sea is the
            # Cruise-Centre mistake.
            if not flood:
                # (-142, 13225), the west Cove Drive arm, was anchored and
                # WITHDRAWN on its own vet: poly 5 is a 5-10m snake of 237
                # points and at mesh resolution it renders as angular teal
                # confetti through a lawn, worse than the grass it replaced
                # — and it sealed a 56 m2 pocket the opencheck gate refused
                # (the gate was right). Its polygon needs repair or a finer
                # mesh before it can carve; research/cove-arms.md stands.
                for ax_, az_ in ((383, 13575),
                                 (173, 13435), (-2, 13960)):
                    if _wc_in(ax_, az_, rp) \
                            and not any(_wc_in(ax_, az_, h) for h in hp):
                        flood = True
                        break
            if os.environ.get("SG_WETWHY") and not flood and cells:
                xs = [gx for (_, gx, _) in cells]
                zs = [gz for (_, _, gz) in cells]
                print(f"      ring not flooded: cells={len(cells)} "
                      f"wet_in={wet_in} "
                      f"bbox={min(xs):.0f},{min(zs):.0f}.."
                      f"{max(xs):.0f},{max(zs):.0f}")
            if flood:
                for (k, _, _) in cells:
                    _wet_set.add(k)
        grid["wet"] = sorted(_wet_set)
        print(f"   wet witness: {_n_seed} DEM-witnessed cells -> "
              f"{len(grid['wet'])} after flooding qualifying rings "
              f"({len(_wet_cand)} candidates) — heights untouched, the "
              f"DRAWN skin consumes this")

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
