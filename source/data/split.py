"""Polygon surgery for footprints, with the two users the sweep demanded:

RINGS THAT A ROAD RUNS THROUGH (Plaza Singapura, the CBD podiums): OSM maps
the mall including its over-road link as ONE outline, the extrusion roofs the
carriageway at 3-6m, and pruneCarriageway cannot help because removing the
whole >6000-vertex mesh would delete the mall. Split the ring along the road
line into a piece per side; the link deck returns later as an explicit slab
once the builder can seat geometry at a minimum height.

TERRACE ROWS ON SLOPES (Emerald Hill): one long footprint takes ONE footing
at the lowest ground under it, so the uphill half stands on a blank plinth
with its ground floor buried. Split every ~16m along the row axis so each
segment takes its own footing and the row steps down the hill.

The primitive is split_by_line: cut a simple polygon by an infinite line,
return the piece lists per side with intersection points inserted. A failed
or degenerate split returns None and the caller keeps the original — skip,
never substitute.
"""


def _side(px, pz, ax, az, nx, nz):
    return (px - ax) * nx + (pz - az) * nz


def split_by_line(ring, ax, az, nx, nz, min_area=25.0):
    """Split `ring` (list of [x,z], open, wound either way) by the line through
    (ax,az) with unit normal (nx,nz). Returns (left_pieces, right_pieces) as
    lists of rings, or None if the line misses or a piece degenerates.
    Convexity is not assumed; each side's points are stitched in ring order,
    which is correct for the single-line case."""
    n = len(ring)
    if n < 3:
        return None
    left, right = [], []
    crossings = 0
    for i in range(n):
        x1, z1 = ring[i]
        x2, z2 = ring[(i + 1) % n]
        s1 = _side(x1, z1, ax, az, nx, nz)
        s2 = _side(x2, z2, ax, az, nx, nz)
        (left if s1 >= 0 else right).append([x1, z1])
        if (s1 >= 0) != (s2 >= 0):
            crossings += 1
            t = s1 / (s1 - s2)
            ix, iz = x1 + (x2 - x1) * t, z1 + (z2 - z1) * t
            left.append([ix, iz])
            right.append([ix, iz])
    if crossings < 2 or len(left) < 3 or len(right) < 3:
        return None
    if abs(_area(left)) < min_area or abs(_area(right)) < min_area:
        return None
    return [left], [right]


def _area(ring):
    a = 0.0
    for i in range(len(ring)):
        x1, z1 = ring[i]
        x2, z2 = ring[(i + 1) % len(ring)]
        a += x1 * z2 - x2 * z1
    return a / 2.0


def _extent_along(ring, ux, uz):
    ds = [p[0] * ux + p[1] * uz for p in ring]
    return min(ds), max(ds)


def road_through_ring(ring, road_pts, step=3.0):
    """Metres of `road_pts` polyline that run INSIDE the ring, plus the
    longest inside segment's direction. Sampled, like every honest test here."""
    import math
    inside_len = 0.0
    best_dir = None
    best_run = 0.0
    run = 0.0
    prev_in = False
    for i in range(len(road_pts) - 1):
        x1, z1 = road_pts[i]
        x2, z2 = road_pts[i + 1]
        seg = math.hypot(x2 - x1, z2 - z1)
        if seg < 1e-6:
            continue
        k = max(1, int(seg / step))
        for j in range(k):
            t = (j + 0.5) / k
            px, pz = x1 + (x2 - x1) * t, z1 + (z2 - z1) * t
            if _pip(px, pz, ring):
                inside_len += seg / k
                run += seg / k
                if run > best_run:
                    best_run = run
                    best_dir = ((x2 - x1) / seg, (z2 - z1) / seg, px, pz)
            else:
                run = 0.0
        prev_in = prev_in  # noqa
    return inside_len, best_dir


def _pip(px, pz, ring):
    c = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, zi = ring[i]
        xj, zj = ring[j]
        if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
            c = not c
        j = i
    return c


def split_ring_by_road(building, roads, min_inside=8.0):
    """If a non-service carriageway runs >= min_inside metres through the
    building's ring, cut the ring at BOTH CORRIDOR EDGES and drop the strip
    over the road. Cutting at the centreline left every piece extending to
    mid-carriageway — crossing by half the road width BY CONSTRUCTION, which
    is exactly what P5 counted. Returns new building dicts or None."""
    ring = building["p"]
    best = (0.0, None, 6.0)
    for r in roads:
        if r.get("k") in ("footway", "pedestrian", "service", "service_link", "path", "steps", "cycleway"):
            continue
        inside, direction = road_through_ring(ring, r["p"])
        if inside > best[0]:
            best = (inside, direction, (r.get("w") or 6.0))
    if best[0] < min_inside or best[1] is None:
        return None
    ux, uz, px, pz = best[1]
    nx, nz = -uz, ux                    # normal to the road direction
    clear = best[2] / 2.0 + 0.6
    keep = []
    # side A: everything beyond +clear of the centreline
    a = split_by_line(ring, px + nx * clear, pz + nz * clear, nx, nz)
    # side B: everything beyond -clear (normal flipped so "left" is outside)
    bcut = split_by_line(ring, px - nx * clear, pz - nz * clear, -nx, -nz)
    if a is None and bcut is None:
        return None
    if a is not None:
        keep.extend(a[0])               # the >= +clear side
    if bcut is not None:
        keep.extend(bcut[0])            # the <= -clear side
    if not keep:
        return None
    result = []
    for p in keep:
        nb = dict(building)
        nb["p"] = p
        result.append(nb)
    return result


def segment_terrace(building, seg_len=16.0, min_long=40.0, max_h=16.0, ratio=3.0):
    """Split a long low row every seg_len metres along its long axis so each
    segment can take its own footing on a slope. Returns list or None."""
    import math
    if building.get("h", 99) > max_h:
        return None
    ring = building["p"]
    # principal axis from the longest edge
    bx, bz, bl = 0.0, 0.0, 0.0
    for i in range(len(ring)):
        x1, z1 = ring[i]
        x2, z2 = ring[(i + 1) % len(ring)]
        L = math.hypot(x2 - x1, z2 - z1)
        if L > bl:
            bl, bx, bz = L, (x2 - x1) / L, (z2 - z1) / L
    lo, hi = _extent_along(ring, bx, bz)
    lo2, hi2 = _extent_along(ring, -bz, bx)
    long_e, short_e = hi - lo, hi2 - lo2
    if long_e < min_long or short_e < 1e-3 or long_e / short_e < ratio:
        return None
    cuts = int(long_e // seg_len)
    if cuts < 1:
        return None
    pieces = [ring]
    for c in range(1, cuts + 1):
        d = lo + c * long_e / (cuts + 1)
        nxt = []
        for p in pieces:
            out = split_by_line(p, bx * d, bz * d, bx, bz)
            if out is None:
                nxt.append(p)
            else:
                nxt.extend(out[0])
                nxt.extend(out[1])
        pieces = nxt
    if len(pieces) < 2:
        return None
    result = []
    for p in pieces:
        nb = dict(building)
        nb["p"] = p
        result.append(nb)
    return result


if __name__ == "__main__":
    # self-test: a 40x10 rectangle split by its vertical midline -> two 20x10
    rect = [[0, 0], [40, 0], [40, 10], [0, 10]]
    out = split_by_line(rect, 20, 5, 1, 0)
    assert out is not None, "split missed"
    a, b = out[0][0], out[1][0]
    assert abs(abs(_area(a)) - 200) < 1e-6 and abs(abs(_area(b)) - 200) < 1e-6, (a, b)
    # a road through the middle of a square is detected
    sq = [[0, 0], [30, 0], [30, 30], [0, 30]]
    inside, d = road_through_ring(sq, [[-10, 15], [40, 15]])
    assert 28 < inside < 32, inside
    # terrace: 80x8 low row segments into ~5 pieces
    row = {"p": [[0, 0], [80, 0], [80, 8], [0, 8]], "h": 9}
    segs = segment_terrace(row)
    assert segs and len(segs) >= 4, segs and len(segs)
    print("split.py self-test PASS")
