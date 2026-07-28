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
    from being a comparison of every item against every other."""
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
                        if math.hypot(cx - ox, cz - oz) > tol:
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


def dedupe_points(groups, tol=4.0):
    """Same idea for the point layers: crossings, signals, stops, entrances."""
    CELL = 20.0
    grid = {}
    out = []
    for gi, items in enumerate(groups):
        for it in items:
            pts = as_pts(it)
            if not pts:
                out.append(it); continue
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
            out.append(it)
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
    out_id, ids = sys.argv[1], sys.argv[2:]
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

    poly_layers = ["buildings", "roads", "bridges", "covered"]
    for layer in poly_layers:
        groups = [s.get(layer, []) for s in scenes]
        before = sum(len(g) for g in groups)
        kept = dedupe_polys(groups, key_area=(layer == "buildings"),
                            tol=8.0 if layer == "buildings" else 5.0)
        out[layer] = [it for _, it in kept]
        print(f"  {layer:<10} {before:>5} -> {len(out[layer]):>5}  "
              f"({before - len(out[layer])} duplicates across the seam)")

    point_layers = ["trees", "crossings", "signals", "busstops", "mrt", "taxis", "shops", "gantries"]
    for layer in point_layers:
        groups = [s.get(layer, []) for s in scenes]
        before = sum(len(g) for g in groups)
        out[layer] = dedupe_points(groups, tol=3.0)
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
    print(f"\nNext: point the app at data/{out_id}.json")


if __name__ == "__main__":
    main()
