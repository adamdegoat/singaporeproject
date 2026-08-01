#!/usr/bin/env python3
"""Merge districts into one region the app can load.

    python3 merge.py world orchard brasbasah

Writes data/<out>.json. The output is a DERIVED file: it is rebuilt from the
districts every time and is never edited by hand, because the one thing this
project has repeatedly got wrong is two files describing the same ground with a
preference order between them.

Why a merge rather than the app loading two files: everything downstream — the
road index, the collision grid, the crowd's list of pavements, the traffic, the
consolidation pass — takes one scene and walks it. Handing it a region instead
of a district changes nothing in any of them. Streaming districts in and out
around the player is the thing that will eventually be needed for the whole
island, and it is a different and much larger job; this is what makes two
neighbouring districts rideable today.

Three things have to be reconciled at the seam.

FEATURES IN BOTH. Districts are fetched with overlapping boxes, so 52 buildings
appear in both Orchard and Bras Basah. Drawn twice they z-fight, and they are
not identical copies: process.py pushes building vertices out of road corridors,
and each district has a different set of roads, so the same building can come
out up to 5m apart in the two files. Deduplicated on position and size, keeping
the copy from the district whose centre it is nearer, because that is the
district that had the fuller road picture around it.

THE GROUND. Each district builds its own heightfield by inverse-distance
weighting from its own road samples, so at the edge of a grid the weighting has
samples on one side only and the value drifts. Measured between these two: 0.39m
median well inside both grids, and over 12m within a cell of an edge. The merged
grid therefore blends the two, weighted by how far inside each grid a point sits,
so the seam has no step in it.

THE MAIN STREET. One axis, from the first district named. The others' roads
become part of the general network, which is where the crowd, the markings and
the signage already look for them.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))


def load(did):
    p = os.path.join(HERE, f"{did}.json")
    if not os.path.exists(p):
        sys.exit(f"no scene for '{did}'. Run: python3 build_district.py {did}")
    return json.load(open(p))


def centroid(pts):
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))


def extent(pts):
    xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
    return min(xs), max(xs), min(zs), max(zs)


def as_pts(it):
    """Layers are not all shaped the same: buildings and roads are dicts with a
    'p' ring, bridges and covered walkways are bare polylines, trees and
    crossings are bare points, bus stops and shops are dicts with a point 'p'.
    One accessor, so the dedupe does not have to know which is which."""
    if isinstance(it, dict):
        p = it.get("p")
    else:
        p = it
    if not p:
        return None
    if isinstance(p[0], (int, float)):
        return [p]                      # a single point
    return p


def dedupe_polys(groups, key_area=True, tol=8.0, area_tol=0.12):
    """One entry per real thing. Two footprints are the same thing when their
    centres are within `tol` metres and their areas agree; a hash grid keeps this
    from being a comparison of every item against every other.

    TOLERANCE SCALES WITH THE BUILDING. A flat 8m missed 143 same-name pairs
    across the seam, including Funan (8,918 and 8,866 m2, 24.6m apart), Old City
    Hall, Bugis+, Peninsula Plaza and NAFA -- all sitting at a consistent ~11m
    offset because the two district fetches happened at different times and OSM
    had been edited in between. Two 8,900 m2 polygons 24m apart overlap by about
    three quarters: that is one building drawn twice, z-fighting over its whole
    surface and costing double.

    Raising the flat tolerance is exactly what the note below says destroyed 301
    real buildings, and it would do it again: "The Plaza" and "One Fullerton"
    are genuine RUNS of similar units about 15m apart. The distinguishing fact
    is SIZE -- 15m between 570 m2 units is a street, 15m between 8,900 m2
    footprints is the same building twice. So the threshold is a fraction of the
    footprint's own width, floored at the old 8m so nothing that used to be
    caught stops being caught.

    WHICH copy survives is first-come, deliberately. An earlier version of this
    replaced the kept entry in place when a later copy carried better provenance
    -- Robinson Suites is h=20 from a default in one district and h=159 from an
    OSM tag in another. It wrote the replacement into a slot index recorded at
    insert time, and that index did not survive contact with the real run: the
    result was DUPLICATES, not upgrades. Two names came out twice, one at the
    slot it was appended to and one at a slot it had overwritten.
    A dedupe that can add entries is worse than one that keeps the wrong copy,
    so this only ever drops. If provenance-aware keeping is wanted, order the
    groups so the better district is passed first -- do not mutate `out`."""
    CELL = 30.0
    grid = {}
    out = []
    for gi, items in enumerate(groups):
        for it in items:
            pts = as_pts(it)
            if not pts:
                out.append((gi, it)); continue
            cx, cz = centroid(pts)
            a = it.get("a") if isinstance(it, dict) else None
            k = (int(cx // CELL), int(cz // CELL))
            dup = False
            for dx in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    for (ox, oz, oa, oi) in grid.get((k[0] + dx, k[1] + dz), ()):
                        # ONLY across districts. A district's own file has no
                        # duplicates in it, and comparing within one deleted 301
                        # real buildings: a terrace of shophouses sits well under
                        # eight metres apart with near-identical footprints, so
                        # each one ate its neighbour. The overlap itself was
                        # handled correctly the whole time, which is exactly why
                        # this needed counting rather than eyeballing.
                        if oi == gi:
                            continue
                        lim = tol
                        if a and oa:
                            lim = max(tol, 0.35 * math.sqrt(min(a, oa)))
                        if math.hypot(cx - ox, cz - oz) > lim:
                            continue
                        if key_area and a and oa:
                            if abs(a - oa) / max(a, oa) > area_tol:
                                continue
                        dup = True
                        break
                    if dup:
                        break
                if dup:
                    break
            if dup:
                continue
            grid.setdefault(k, []).append((cx, cz, a, gi))
            out.append((gi, it))
    return out


def dedupe_points_gi(groups, tol=4.0):
    """Same idea for the point layers: crossings, signals, stops, entrances.
    Returns (group-index, item) pairs so --stream can partition the keeps."""
    CELL = 20.0
    grid = {}
    out = []
    for gi, items in enumerate(groups):
        for it in items:
            pts = as_pts(it)
            if not pts:
                out.append((gi, it)); continue
            x, z = centroid(pts)
            k = (int(x // CELL), int(z // CELL))
            dup = False
            for dx in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    for (ox, oz, oi) in grid.get((k[0] + dx, k[1] + dz), ()):
                        if oi == gi:          # across districts only; see dedupe_polys
                            continue
                        if math.hypot(x - ox, z - oz) <= tol:
                            dup = True; break
                    if dup: break
                if dup: break
            if dup:
                continue
            grid.setdefault(k, []).append((x, z, gi))
            out.append((gi, it))
    return out


def sample(t, x, z, clamp=False):
    """Bilinear lookup into a district heightfield.

    With clamp=True a point outside the grid takes the value at the nearest edge
    instead of nothing, which is what the merged grid's apron needs: 65 road
    points fell outside both districts' grids and would otherwise have sat at
    sea level, which is a cliff rather than a missing sample.
    """
    gx = (x - t["x0"]) / t["cell"]
    gz = (z - t["z0"]) / t["cell"]
    if clamp:
        gx = min(max(gx, 0.0), t["nx"] - 1.001)
        gz = min(max(gz, 0.0), t["nz"] - 1.001)
    i, j = int(math.floor(gx)), int(math.floor(gz))
    if i < 0 or j < 0 or i >= t["nx"] - 1 or j >= t["nz"] - 1:
        return None
    fx, fz = gx - i, gz - j
    h, n = t["h"], t["nx"]
    return ((h[j * n + i] * (1 - fx) + h[j * n + i + 1] * fx) * (1 - fz)
            + (h[(j + 1) * n + i] * (1 - fx) + h[(j + 1) * n + i + 1] * fx) * fz)


def inset(t, x, z):
    """How far inside a grid a point is, in cells. Near an edge the inverse
    distance weighting had samples on one side only, so the value there is the
    least trustworthy part of the field and should carry the least weight."""
    gx = (x - t["x0"]) / t["cell"]
    gz = (z - t["z0"]) / t["cell"]
    return min(gx, gz, (t["nx"] - 1) - gx, (t["nz"] - 1) - gz)


def merge_terrain(ts, cover=None):
    cell = ts[0]["cell"]
    x0 = min(t["x0"] for t in ts)
    z0 = min(t["z0"] for t in ts)
    x1 = max(t["x0"] + (t["nx"] - 1) * t["cell"] for t in ts)
    z1 = max(t["z0"] + (t["nz"] - 1) * t["cell"] for t in ts)
    # The merged grid must cover every road in the merged scene. Each district
    # padded its own grid 90m past its OWN roads, and a road that crosses the
    # seam runs past both: 65 road points fell outside the union.
    if cover:
        pad = 90.0
        x0 = min(x0, min(p[0] for p in cover) - pad)
        x1 = max(x1, max(p[0] for p in cover) + pad)
        z0 = min(z0, min(p[1] for p in cover) - pad)
        z1 = max(z1, max(p[1] for p in cover) + pad)
    nx = int(round((x1 - x0) / cell)) + 1
    nz = int(round((z1 - z0) / cell)) + 1
    h = []
    blended = 0
    for j in range(nz):
        for i in range(nx):
            x = x0 + i * cell
            z = z0 + j * cell
            num = den = 0.0
            hits = 0
            for t in ts:
                v = sample(t, x, z)
                if v is None:
                    continue
                _ = v
                hits += 1
                # weight rises with how far inside the grid the point sits, so
                # the district that actually has road samples around here wins
                w = max(0.02, min(6.0, inset(t, x, z))) ** 2
                num += v * w
                den += w
            if den == 0:
                # in the apron beyond every district's grid: take the nearest
                # edge value from whichever grid is closest, so the ground runs
                # out flat instead of dropping to sea level
                edge = [sample(t, x, z, clamp=True) for t in ts]
                edge = [e for e in edge if e is not None]
                h.append(round(sum(edge) / len(edge), 2) if edge else 0.0)
            else:
                if hits > 1:
                    blended += 1
                h.append(round(num / den, 2))
    return dict(x0=round(x0, 1), z0=round(z0, 1), cell=cell, nx=nx, nz=nz, h=h,
                base=0.0, src="merged"), blended


def main():
    if len(sys.argv) < 4:
        sys.exit("usage: merge.py <out-id> <district> <district> [...]")
    out_id = sys.argv[1]
    ids = [a for a in sys.argv[2:] if not a.startswith("--")]
    scenes = [load(i) for i in ids]

    origins = {(s["origin"]["lat"], s["origin"]["lon"]) for s in scenes}
    if len(origins) != 1:
        sys.exit(f"districts do not share an origin: {origins}\n"
                 f"They must all project from districts.json island_origin.")

    print(f"== merge {' + '.join(ids)} -> {out_id}")

    srcs = [t.get("src") for t in (s.get("terrain") or {} for s in scenes)]
    if len(set(srcs)) != 1:
        print(f"  ! WARNING: heightfields come from different elevation datasets "
              f"({', '.join(str(s) for s in srcs)}). They disagree by metres. "
              f"Rebuild one with: terrain.py <id> --source <name>")

    out = {"origin": scenes[0]["origin"]}

    # `water` is a polygon layer but must NOT be deduped by footprint overlap:
    # the same bay legitimately appears in two districts as two different
    # clippings of one reservoir, and dedupe_polys would drop one of them and
    # leave half the bay dry. Concatenated and left to the builder, which draws
    # a flat surface where overlapping polygons are indistinguishable anyway.
    # Deduped on a rounded outline key. The earlier note here said water must
    # NOT be deduped because two districts clip the same bay differently -- true
    # for the clipped ones, but the IDENTICAL ones are the same polygon fetched
    # twice from an overlapping bbox, and drawing it twice gives two coplanar
    # surfaces that z-fight. P6 caught it.
    out["water"] = []
    _wseen = set()
    _water_by = {}
    for si, sc in enumerate(scenes):
        for w in sc.get("water", []):
            k = (round(w["p"][0][0]), round(w["p"][0][1]), len(w["p"]), w.get("a"))
            if k in _wseen:
                continue
            _wseen.add(k)
            out["water"].append(w)
            _water_by.setdefault(si, []).append(w)
    if out["water"]:
        print(f"  {'water':<10} {len(out['water']):>5}  "
              f"({sum(w.get('a', 0) for w in out['water']):,} m2, not deduped by design)")

    # GREEN SPACE, deduped exactly like water: neighbouring districts fetch the
    # same park from overlapping bboxes and tinting the ground twice is free but
    # carrying the polygon twice is not.
    out["green"] = []
    _gseen = set()
    _green_by = {}
    for si, sc in enumerate(scenes):
        for w in sc.get("green", []):
            k = (round(w["p"][0][0]), round(w["p"][0][1]), len(w["p"]), w.get("a"))
            if k in _gseen:
                continue
            _gseen.add(k)
            out["green"].append(w)
            _green_by.setdefault(si, []).append(w)
    if out["green"]:
        print(f"  {'green':<10} {len(out['green']):>5}  "
              f"({sum(w.get('a', 0) for w in out['green']):,} m2)")

    out["piers"] = []
    _pseen = set()
    _piers_by = {}
    for si, sc in enumerate(scenes):
        for w in sc.get("piers", []):
            k = (round(w["p"][0][0]), round(w["p"][0][1]), len(w["p"]), w.get("a"))
            if k in _pseen:
                continue
            _pseen.add(k)
            out["piers"].append(w)
            _piers_by.setdefault(si, []).append(w)
    if out["piers"]:
        print(f"  {'piers':<10} {len(out['piers']):>5}  "
              f"({sum(w.get('a', 0) for w in out['piers']):,} m2)")

    # STAIRS AND BARRIERS. Added 2026-08-01 with the walkable-world layers, and
    # the first merge after they were built wrote a world scene with ZERO of
    # either -- 350 flights across eight districts, every one dropped, because a
    # layer this file has never heard of is simply not copied. Same shape as the
    # D39 defect class ("a scene layer written but never drawn"): the district
    # files were right and the world was empty.
    #
    # Deduped on the FIRST POINT AND THE LENGTH, not on `a` like the polygons
    # above: these are lines, they have no area, and districts overlap so the
    # same flight of stairs arrives from two scenes.
    for _lay, _lbl in (("steps", "stairs"), ("barriers", "barriers")):
        out[_lay] = []
        _seen2 = set()
        _by = {}
        for si, sc in enumerate(scenes):
            for w in sc.get(_lay, []):
                k = (round(w["p"][0][0], 1), round(w["p"][0][1], 1),
                     len(w["p"]), w.get("L"), w.get("k"))
                if k in _seen2:
                    continue
                _seen2.add(k)
                out[_lay].append(w)
                _by.setdefault(si, []).append(w)
        globals()["_%s_by" % _lay] = _by
        if out[_lay]:
            print(f"  {_lbl:<10} {len(out[_lay]):>5}  "
                  f"({sum(w.get('L', 0) for w in out[_lay]):,.0f} m)")

    out["land"] = []
    _lseen = set()
    _land_by = {}
    for si, sc in enumerate(scenes):
        for w in sc.get("land", []):
            k = (round(w["p"][0][0]), round(w["p"][0][1]), len(w["p"]), w.get("a"))
            if k in _lseen:
                continue
            _lseen.add(k)
            out["land"].append(w)
            _land_by.setdefault(si, []).append(w)
    if out["land"]:
        print(f"  {'land':<10} {len(out['land']):>5}  "
              f"({sum(w.get('a', 0) for w in out['land']):,} m2)")

    # chunks[i] collects district i's share of every deduped layer, so
    # --stream can write per-district files that sum EXACTLY to the flat
    # merge — same dedupe, same keeps, just partitioned by who contributed.
    chunks = [dict() for _ in scenes]

    poly_layers = ["buildings", "roads", "bridges", "covered"]
    for layer in poly_layers:
        groups = [s.get(layer, []) for s in scenes]
        before = sum(len(g) for g in groups)
        kept = dedupe_polys(groups, key_area=(layer == "buildings"),
                            tol=8.0 if layer == "buildings" else 5.0)
        out[layer] = [it for _, it in kept]
        for gi, it in kept:
            chunks[gi].setdefault(layer, []).append(it)
        print(f"  {layer:<10} {before:>5} -> {len(out[layer]):>5}  "
              f"({before - len(out[layer])} duplicates across the seam)")

    point_layers = ["trees", "crossings", "signals", "busstops", "mrt", "taxis", "shops", "gantries", "lamps"]
    # towers carry a height and a radius, so they are dicts rather than points
    out["towers"] = [t for sc in scenes for t in sc.get("towers", [])]
    for si, sc in enumerate(scenes):
        chunks[si]["towers"] = list(sc.get("towers", []))
    for layer in point_layers:
        groups = [s.get(layer, []) for s in scenes]
        before = sum(len(g) for g in groups)
        kept = dedupe_points_gi(groups, tol=3.0)
        out[layer] = [it for _, it in kept]
        for gi, it in kept:
            chunks[gi].setdefault(layer, []).append(it)
        print(f"  {layer:<10} {before:>5} -> {len(out[layer]):>5}  "
              f"({before - len(out[layer])} duplicates across the seam)")

    # The primary axis is the first district's, and it is what the ride, the
    # crowd, the traffic and the wayfinder key off. But EVERY district's main
    # street needs dressing — kerbs, markings, trees, furniture, signage — or a
    # merged region is one finished street and a set of bare roads. Carried as a
    # list so main.js can dress along each without any of the actor systems
    # having to learn about districts.
    out["axis"] = scenes[0]["axis"]
    out["axisFullLength"] = scenes[0]["axisFullLength"]
    out["axes"] = [s["axis"] for s in scenes if s.get("axis") and s["axis"].get("p")]
    print(f"  axes       {len(out['axes'])}: "
          + ", ".join(f"{a.get('n')} ({len(a['p'])} pts)" for a in out["axes"]))

    ts = [s["terrain"] for s in scenes if s.get("terrain")]
    if len(ts) != len(scenes):
        sys.exit("  ! a district has no heightfield; run terrain.py for it first")
    cover = [p for r in out["roads"] for p in r["p"]]
    out["terrain"], blended = merge_terrain(ts, cover)
    t = out["terrain"]
    print(f"  terrain    {t['nx']}x{t['nz']} @ {t['cell']:.0f}m, "
          f"{blended} cells blended where the districts overlap")

    path = os.path.join(HERE, f"{out_id}.json")
    json.dump(out, open(path, "w"), separators=(",", ":"))
    print(f"  wrote {path} ({os.path.getsize(path)/1024:.0f} KB)")

    # CHUNKS ARE WRITTEN EVERY TIME, and this used to be opt-in behind
    # `--stream`.
    #
    # THE TRAP THAT COST A DAY. The flat world.json is what every gate reads:
    # check.py, audit_run.mjs, accuracy.py, progress.py. The per-district chunk
    # files are what the RUNTIME reads -- the world scene streams them, the
    # flat file is never fetched by a rider. So a merge without the flag left
    # the chunks stale while refreshing the file the gates inspect, and the
    # whole pipeline reported PASS on data the live site was not serving. Two
    # deploys on 2026-07-31 shipped chunks that were four hours and three
    # features out of date, through a green deploy, twice.
    #
    # An opt-in flag on the correctness-critical half of the output is not a
    # flag, it is a way to be wrong quietly. `--no-stream` remains for the rare
    # case where only the flat file is wanted, and it has to be asked for.
    if "--no-stream" not in sys.argv:
        # Per-district chunk files + a manifest, for the runtime loader. The
        # flat file above keeps being written and stays the gates' subject;
        # these are the SAME keeps partitioned by contributing district, so
        # per-layer chunk counts must sum exactly to the flat file's counts.
        print(f"\n== stream chunks")
        mani = {
            "origin": out["origin"],
            "terrain": out["terrain"],
            "axisFullLength": out["axisFullLength"],
            "districts": [],
        }
        for si, did in enumerate(ids):
            ch = chunks[si]
            ch["water"] = _water_by.get(si, [])
            ch["green"] = _green_by.get(si, [])
            ch["land"] = _land_by.get(si, [])
            ch["piers"] = _piers_by.get(si, [])
            ch["steps"] = globals()["_steps_by"].get(si, [])
            ch["barriers"] = globals()["_barriers_by"].get(si, [])
            ch["axis"] = scenes[si].get("axis")
            t = scenes[si].get("terrain") or {}
            box = [t.get("x0", 0), t.get("z0", 0),
                   t.get("x0", 0) + (t.get("nx", 1) - 1) * t.get("cell", 0),
                   t.get("z0", 0) + (t.get("nz", 1) - 1) * t.get("cell", 0)]
            fn = f"{out_id}.d.{did}.json"
            json.dump(ch, open(os.path.join(HERE, fn), "w"), separators=(",", ":"))
            mani["districts"].append({"id": did, "file": fn,
                                      "box": [round(v, 1) for v in box]})
            print(f"  {did:<12} {os.path.getsize(os.path.join(HERE, fn))/1024:>5.0f} KB  "
                  f"box {box[2]-box[0]:.0f}x{box[3]-box[1]:.0f}m")
        # the partition must LOSE nothing: every layer's chunk counts sum to
        # the flat file's count, or the loader would ship a thinner world
        for layer in (["water", "towers", "buildings", "roads", "bridges", "covered"]
                      + ["trees", "crossings", "signals", "busstops", "mrt",
                         "taxis", "shops", "gantries", "lamps"]):
            flat_n = len(out.get(layer, []))
            chunk_n = sum(len(c.get(layer, [])) for c in chunks)
            if flat_n != chunk_n:
                sys.exit(f"  FAIL {layer}: flat {flat_n} != chunks {chunk_n} — "
                         f"the partition lost or duplicated items")
        mp = os.path.join(HERE, f"{out_id}.manifest.json")
        json.dump(mani, open(mp, "w"), separators=(",", ":"))
        print(f"  wrote {mp} ({os.path.getsize(mp)/1024:.0f} KB)  "
              f"partition verified lossless")

    print(f"\nNext: point the app at data/{out_id}.json")


if __name__ == "__main__":
    main()
