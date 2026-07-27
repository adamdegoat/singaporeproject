#!/usr/bin/env python3
"""Check that nothing sits in a carriageway.

Done analytically against the scene data rather than by raycasting in the
browser: a raycast audit pegged a CPU core for minutes and still only sampled
points. This tests whole EDGES against whole corridors, which is what actually
catches a wall clipping a road, and it also reproduces the geometry the renderer
adds on top of the footprints (plazas, porte-cocheres, aprons, entrance
canopies, shophouse colonnades) because that geometry ignores roads entirely.
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = json.load(open(os.path.join(HERE, "orchard.json")))

HOTEL_RE = re.compile(r"hotel|hyatt|hilton|marriott|four seasons|pullman|voco|royal plaza|"
                      r"pan pacific|regent|shangri|holiday inn|ibis|orchard rendezvous|"
                      r"concorde|mandarin orchard", re.I)


def seg_seg_dist(a, b, c, d):
    """Minimum distance between segments ab and cd (2D)."""
    def pt_seg(p, q, r):
        vx, vz = r[0] - q[0], r[1] - q[1]
        L2 = vx * vx + vz * vz
        if L2 < 1e-12:
            return math.dist(p, q)
        t = max(0.0, min(1.0, ((p[0] - q[0]) * vx + (p[1] - q[1]) * vz) / L2))
        return math.dist(p, (q[0] + vx * t, q[1] + vz * t))

    def cross(o, p, q):
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])

    d1, d2 = cross(c, d, a), cross(c, d, b)
    d3, d4 = cross(a, b, c), cross(a, b, d)
    if ((d1 > 0) != (d2 > 0)) and ((d3 > 0) != (d4 > 0)):
        return 0.0
    return min(pt_seg(a, c, d), pt_seg(b, c, d), pt_seg(c, a, b), pt_seg(d, a, b))


def corridors():
    out = []
    for r in DATA["roads"]:
        if r["k"] in ("footway", "pedestrian"):
            continue
        clear = r["w"] / 2
        name = r.get("n") or r["k"]
        for i in range(len(r["p"]) - 1):
            out.append((tuple(r["p"][i]), tuple(r["p"][i + 1]), clear, name))
    ax = DATA.get("axis")
    if ax:
        for i in range(len(ax["p"]) - 1):
            out.append((tuple(ax["p"][i]), tuple(ax["p"][i + 1]), ax["w"] / 2, "Orchard Road (axis)"))
    return out


def centroid(pts):
    x = sum(p[0] for p in pts) / len(pts)
    z = sum(p[1] for p in pts) / len(pts)
    return (x, z)


def oriented(pts):
    cx, cz = centroid(pts)
    sxx = sxz = szz = 0.0
    for x, z in pts:
        dx, dz = x - cx, z - cz
        sxx += dx * dx; sxz += dx * dz; szz += dz * dz
    ang = 0.5 * math.atan2(2 * sxz, sxx - szz)
    ux, uz = math.cos(ang), math.sin(ang)
    us = [(x - cx) * ux + (z - cz) * uz for x, z in pts]
    vs = [-(x - cx) * uz + (z - cz) * ux for x, z in pts]
    return dict(cx=cx, cz=cz, ux=ux, uz=uz, ang=ang,
                halfLong=(max(us) - min(us)) / 2, halfShort=(max(vs) - min(vs)) / 2)


def streetward(ob):
    """Direction from a footprint toward the nearest point on the main axis."""
    ax = DATA.get("axis")
    if not ax:
        return (0.0, 1.0)
    bx, bz, bd = 0, 0, 1e18
    for x, z in ax["p"]:
        d = (x - ob["cx"]) ** 2 + (z - ob["cz"]) ** 2
        if d < bd:
            bd, bx, bz = d, x, z
    dx, dz = bx - ob["cx"], bz - ob["cz"]
    L = math.hypot(dx, dz) or 1
    return (dx / L, dz / L)


def rect(cx, cz, w, d, nx, nz):
    """A w x d rectangle centred at (cx,cz), long axis across (nx,nz)."""
    tx, tz = -nz, nx
    hw, hd = w / 2, d / 2
    return [
        (cx + tx * hw + nx * hd, cz + tz * hw + nz * hd),
        (cx - tx * hw + nx * hd, cz - tz * hw + nz * hd),
        (cx - tx * hw - nx * hd, cz - tz * hw - nz * hd),
        (cx + tx * hw - nx * hd, cz + tz * hw - nz * hd),
    ]


def pt_in_corridor(x, z, cors, skip_service=True):
    for (a, b, clear, name) in cors:
        if skip_service and name == "service":
            continue
        vx, vz = b[0] - a[0], b[1] - a[1]
        L2 = vx * vx + vz * vz
        t = 0.0 if L2 < 1e-12 else max(0.0, min(1.0, ((x - a[0]) * vx + (z - a[1]) * vz) / L2))
        if math.dist((x, z), (a[0] + vx * t, a[1] + vz * t)) < clear + 0.7:
            return True
    return False


def rect_clear(x, z, nx, nz, width, depth, cors):
    """Is the whole rectangle clear, not just its centreline?"""
    tx, tz = -nz, nx
    hw = width / 2
    across = max(3, int(math.ceil(width / 6)))
    along = max(2, int(math.ceil(depth / 4)))
    for i in range(across + 1):
        w = -hw + (i / across) * width
        for j in range(along + 1):
            d = (j / along) * depth
            if pt_in_corridor(x + nx * d + tx * w, z + nz * d + tz * w, cors):
                return False
    return True


def clear_outward(x, z, nx, nz, want, halfw, cors):
    d = want
    while d > 0.4:
        if rect_clear(x, z, nx, nz, halfw * 2, d, cors):
            return d
        d -= 0.5
    return 0.0


cors_cache = None


def added_geometry():
    """Everything the renderer places beyond the raw footprint."""
    out = []
    for b in DATA["buildings"]:
        pts = [tuple(p) for p in b["p"]]
        if len(pts) < 3:
            continue
        name = b.get("n", "")
        ob = oriented(pts)
        nx, nz = streetward(ob)

        ex = ob["cx"] + nx * ob["halfShort"]
        ez = ob["cz"] + nz * ob["halfShort"]
        if re.search(r"ngee ann city|takashimaya", name, re.I):
            width, depth = 62, 0
            for w in (62, 52, 44, 36, 28):
                d = clear_outward(ex, ez, nx, nz, 22, w / 2, cors_cache)
                if d >= 6:
                    width, depth = w, min(30, d)
                    break
            if depth >= 6:
                out.append(("civic plaza", name,
                            rect(ex + nx * depth / 2, ez + nz * depth / 2, width, depth, nx, nz)))
        if HOTEL_RE.search(name):
            room = clear_outward(ex, ez, nx, nz, 11, 13, cors_cache)
            if room > 6.5:
                depth = min(13, room * 1.05)
                out.append(("porte-cochere", name,
                            rect(ex + nx * depth / 2, ez + nz * depth / 2, 22, depth, nx, nz)))
                out.append(("driveway apron", name,
                            rect(ex + nx * depth / 2, ez + nz * depth / 2, 24, depth * 1.12, nx, nz)))
        # ION's canopy is a curved shell whose lowest point is about 12m up, and
        # the pedestrian bridges clear 6m. Overhead structures are not
        # obstructions, and bounding a curved shell as a flat rectangle
        # over-reported it by design. Excluded deliberately, not overlooked.
        # entrance canopy on the longest edge of any large footprint
        if b["a"] > 600 and b["h"] > 7:
            bi, bl = 0, 0
            for i in range(len(pts)):
                a2, c2 = pts[i], pts[(i + 1) % len(pts)]
                L = math.dist(a2, c2)
                if L > bl:
                    bl, bi = L, i
            if bl > 16:
                a2, c2 = pts[bi], pts[(bi + 1) % len(pts)]
                mx, mz = (a2[0] + c2[0]) / 2, (a2[1] + c2[1]) / 2
                cen = centroid(pts)
                ox, oz = mx - cen[0], mz - cen[1]
                oL = math.hypot(ox, oz) or 1
                cw = min(18, bl * 0.34)
                reach = clear_outward(mx, mz, ox / oL, oz / oL, 3.6, cw * 0.5, cors_cache)
                if reach > 1.0:
                    out.append(("entrance canopy", name or "(unnamed)",
                                rect(mx + ox / oL * reach * 0.5, mz + oz / oL * reach * 0.5,
                                     cw, reach * 1.15, ox / oL, oz / oL)))
    return out


def main():
    global cors_cache
    cors = corridors()
    cors_cache = cors
    print(f"corridors: {len(cors)}   buildings: {len(DATA['buildings'])}")

    # 1. building edges vs corridors
    edge_hits = []
    for b in DATA["buildings"]:
        pts = [tuple(p) for p in b["p"]]
        if len(pts) < 3:
            continue
        worst = None
        for i in range(len(pts)):
            e0, e1 = pts[i], pts[(i + 1) % len(pts)]
            for (c0, c1, clear, rname) in cors:
                d = seg_seg_dist(e0, e1, c0, c1)
                if d < clear:
                    pen = clear - d
                    if worst is None or pen > worst[0]:
                        worst = (pen, rname)
        if worst:
            edge_hits.append((worst[0], b.get("n", "(unnamed)"), worst[1]))

    print(f"\nbuilding EDGES inside a carriageway: {len(edge_hits)}")
    for pen, nm, rd in sorted(edge_hits, reverse=True)[:15]:
        print(f"  {pen:5.1f}m into {rd[:26]:28s} {nm[:34]}")

    # 2. geometry we add ourselves
    add_hits = []
    for (kind, nm, poly) in added_geometry():
        worst = None
        for i in range(len(poly)):
            e0, e1 = poly[i], poly[(i + 1) % len(poly)]
            for (c0, c1, clear, rname) in cors:
                d = seg_seg_dist(e0, e1, c0, c1)
                if d < clear:
                    pen = clear - d
                    if worst is None or pen > worst[0]:
                        worst = (pen, rname)
        if worst:
            add_hits.append((worst[0], kind, nm, worst[1]))

    real = [h for h in add_hits if h[3] != "service"]
    print(f"\nADDED ground-level geometry in a carriageway: {len(add_hits)}"
          f"   (of which NON-service: {len(real)})")
    print("  service-road overlaps are hotel set-downs and loading bays, which is"
          " what a service road is for")
    by_kind = {}
    for pen, kind, nm, rd in add_hits:
        by_kind[kind] = by_kind.get(kind, 0) + 1
    for k, v in sorted(by_kind.items(), key=lambda kv: -kv[1]):
        print(f"  {v:4d}  {k}")
    print()
    for pen, kind, nm, rd in sorted(add_hits, reverse=True)[:15]:
        print(f"  {pen:5.1f}m  {kind:16s} {nm[:26]:28s} into {rd[:24]}")


if __name__ == "__main__":
    main()
