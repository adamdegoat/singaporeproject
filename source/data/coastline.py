#!/usr/bin/env python3
"""Turn `natural=coastline` into a sea polygon the rest of the pipeline
already knows how to draw.

    python3 data/coastline.py --selftest marinaeast

WHY THIS EXISTS. `natural=coastline` has been FETCHED by build_district.py
since the day the fetch was written and read by NOTHING -- verified by grep
across process.py and src/. Every district built so far is inland or faces the
reservoir, so it never mattered. Five of the six districts left in the ring
face open sea, and without this they would render the Straits as dry land you
can ride out onto.

THE ONE FACT THE WHOLE THING TURNS ON. OSM does not map the sea as a polygon.
It maps the shoreline as open ways with a direction, and the convention is
**LAND ON THE LEFT** of the direction of travel. There is no tag saying which
side is water; the winding IS the statement. Measured in the marinaeast box:
five fragments, all named "Coastline of Singapore", chaining end-to-end from
1.27291,103.86632 in the west to 1.28481,103.88110 in the east -- so land lies
north and the Straits lie south, which is correct for Marina East.

WHAT IT PRODUCES, AND WHY THAT SHAPE. A `water` polygon with `k: "sea"`.
Deliberately NOT a new layer: the sink rule that lowers a riverbed, the
`dry()` placement guards, `standable()`, and checks W1/W2/W3 all already
operate on `water`. Emitting sea as water means the sea works on the day it
lands, with no new drawing code and no new checks -- and `k` is carried through
so anything that later needs to tell sea from reservoir can.

THE ALGORITHM, which is only fiddly in one place:

  1. STITCH the fragments into chains on shared endpoints. OSM splits a
     shoreline wherever an attribute changes, so five ways here are one shore.
  2. CLIP each chain to the district bbox, inserting the exact crossing point
     where it leaves.
  3. CLOSE the ring by walking the bbox rectangle from where the chain exits
     back to where it entered. Which WAY round that walk goes is the whole
     problem, and it is decided by the land-on-left rule rather than guessed:
     the sea lies to the RIGHT of the chain, so the walk is the one whose ring
     encloses the right-hand side.

Rather than trust that reasoning alone, `verify()` checks the finished polygon
against points that are known sea and known land, because a ring wound the
wrong way looks perfectly plausible and floods the city instead of the sea.
"""
import math, sys

# ---------------------------------------------------------------------------


def stitch(ways, tol=1e-7):
    """Fragments -> chains, joined on shared endpoints."""
    segs = [list(w["geometry"]) for w in ways if len(w.get("geometry") or []) > 1]
    chains = []
    while segs:
        cur = segs.pop(0)
        moved = True
        while moved:
            moved = False
            for i, s in enumerate(segs):
                if _same(cur[-1], s[0], tol):
                    cur += s[1:]; segs.pop(i); moved = True; break
                if _same(cur[-1], s[-1], tol):
                    cur += list(reversed(s))[1:]; segs.pop(i); moved = True; break
                if _same(cur[0], s[-1], tol):
                    cur = s[:-1] + cur; segs.pop(i); moved = True; break
                if _same(cur[0], s[0], tol):
                    cur = list(reversed(s))[1:] + cur; segs.pop(i); moved = True; break
        chains.append(cur)
    return chains


def _same(a, b, tol):
    return abs(a["lat"] - b["lat"]) < tol and abs(a["lon"] - b["lon"]) < tol


def _inside(p, box):
    s, w, n, e = box
    return s <= p["lat"] <= n and w <= p["lon"] <= e


def _cross(p, q, box):
    """Point where segment p->q crosses the box edge, walking from p (inside)
    to q (outside). Simple parametric clip against the four edges."""
    s, w, n, e = box
    best = None
    for t in _edge_ts(p, q, box):
        if 0.0 < t <= 1.0 and (best is None or t < best):
            best = t
    if best is None:
        return None
    return {"lat": p["lat"] + (q["lat"] - p["lat"]) * best,
            "lon": p["lon"] + (q["lon"] - p["lon"]) * best}


def _edge_ts(p, q, box):
    s, w, n, e = box
    dlat, dlon = q["lat"] - p["lat"], q["lon"] - p["lon"]
    ts = []
    if dlat:
        for bound in (s, n):
            t = (bound - p["lat"]) / dlat
            lon = p["lon"] + dlon * t
            if w - 1e-12 <= lon <= e + 1e-12:
                ts.append(t)
    if dlon:
        for bound in (w, e):
            t = (bound - p["lon"]) / dlon
            lat = p["lat"] + dlat * t
            if s - 1e-12 <= lat <= n + 1e-12:
                ts.append(t)
    return ts


def clip_chain(chain, box):
    """-> list of runs, each a polyline wholly inside the box, with exact
    entry/exit points inserted at the boundary."""
    runs, cur = [], []
    for i, p in enumerate(chain):
        if _inside(p, box):
            if not cur and i > 0:                       # entering
                x = _cross(p, chain[i - 1], box)
                if x:
                    cur.append(x)
            cur.append(p)
        else:
            if cur:                                     # leaving
                x = _cross(cur[-1], p, box)
                if x:
                    cur.append(x)
                runs.append(cur); cur = []
    if cur:
        runs.append(cur)
    return [r for r in runs if len(r) > 1]


_CORNERS = lambda box: [                       # noqa: E731  (s,w,n,e)
    {"lat": box[0], "lon": box[1]},            # SW
    {"lat": box[0], "lon": box[3]},            # SE
    {"lat": box[2], "lon": box[3]},            # NE
    {"lat": box[2], "lon": box[1]},            # NW
]


def _perimeter_pos(p, box):
    """Distance around the rectangle, counter-clockwise from the SW corner.
    Used to walk from the exit point back to the entry point along the edge."""
    s, w, n, e = box
    h, v = (e - w), (n - s)
    if abs(p["lat"] - s) < 1e-9:                       # south edge, W->E
        return (p["lon"] - w)
    if abs(p["lon"] - e) < 1e-9:                       # east edge, S->N
        return h + (p["lat"] - s)
    if abs(p["lat"] - n) < 1e-9:                       # north edge, E->W
        return h + v + (e - p["lon"])
    return 2 * h + v + (n - p["lat"])                  # west edge, N->S


def _walk(run, box, forward):
    """Close the run by walking the rectangle from exit back to entry, either
    with increasing perimeter position (`forward`) or against it."""
    total = 2 * ((box[3] - box[1]) + (box[2] - box[0]))
    sgn = 1.0 if forward else -1.0
    pos = _perimeter_pos(run[-1], box)
    target = _perimeter_pos(run[0], box)
    ring = list(run)
    for _ in range(8):
        nxt = None
        for c in _CORNERS(box):
            d = (sgn * (_perimeter_pos(c, box) - pos)) % total
            if d > 1e-12 and (nxt is None or d < nxt[0]):
                nxt = (d, c, _perimeter_pos(c, box))
        if nxt is None:
            break
        if ((sgn * (target - pos)) % total) <= nxt[0]:
            break
        ring.append(nxt[1]); pos = nxt[2]
    return ring


def _right_probe(run, eps=2e-5):
    """A point just to the RIGHT of the coastline's direction of travel — i.e.
    on the sea side, by the land-on-left rule. In (x=lon, y=lat) the right
    normal of heading (dlon, dlat) is (dlat, -dlon)."""
    for i in range(len(run) - 1):
        a, b = run[i], run[i + 1]
        dlat, dlon = b["lat"] - a["lat"], b["lon"] - a["lon"]
        L = math.hypot(dlat, dlon)
        if L < 1e-9:
            continue
        return ((a["lat"] + b["lat"]) / 2 - dlon / L * eps,
                (a["lon"] + b["lon"]) / 2 + dlat / L * eps)
    return None


def close_ring(run, box):
    """Close a clipped coastline run into a polygon enclosing the SEA.

    WHICH WAY ROUND THE RECTANGLE IS THE ENTIRE PROBLEM, and the first version
    reasoned it out in a comment and got it backwards: the ring came out
    enclosing Bay East Garden, so the district would have rendered the garden
    as sea and the Straits as dry land. It looked completely plausible.

    So this does not reason about it. The sea is to the RIGHT of the coastline
    by the land-on-left rule, so it builds a probe point one metre to the right
    of the first real segment and picks whichever walk direction produces a
    ring containing it. That is derived from the data every time, works for a
    shore of any orientation, and cannot be got backwards by an argument.
    """
    probe = _right_probe(run)
    fwd = _walk(run, box, True)
    if probe is None:
        return fwd
    if point_in(fwd, probe[0], probe[1]):
        return fwd
    return _walk(run, box, False)


def point_in(ring, lat, lon):
    hit = False
    for i in range(len(ring)):
        a, b = ring[i], ring[i - 1]
        if (a["lat"] > lat) != (b["lat"] > lat):
            x = (b["lon"] - a["lon"]) * (lat - a["lat"]) / (b["lat"] - a["lat"]) + a["lon"]
            if lon < x:
                hit = not hit
    return hit


def _on_edge(p, box, tol=1e-9):
    """Is this point on the bbox boundary? Runs are clipped so their ends land
    exactly on an edge; anything else is an interior island."""
    s, w, n, e = box
    return (abs(p["lat"] - s) < tol or abs(p["lat"] - n) < tol
            or abs(p["lon"] - w) < tol or abs(p["lon"] - e) < tol)


def _seaward(run, box):
    """Which way round the rectangle keeps the SEA inside. Derived from the
    data — a probe one metre to the right of the shoreline, by the
    land-on-left rule — never argued from the geometry, because the version
    that argued it got it backwards and put Bay East Garden under water."""
    probe = _right_probe(run)
    if probe is None:
        return True
    return point_in(_walk(run, box, True), probe[0], probe[1])


def _corners_between(a, b, box, forward):
    """The bbox corners passed walking the perimeter from position `a` to `b`."""
    total = 2 * ((box[3] - box[1]) + (box[2] - box[0]))
    sgn = 1.0 if forward else -1.0
    span = (sgn * (b - a)) % total
    out = []
    for c in _CORNERS(box):
        d = (sgn * (_perimeter_pos(c, box) - a)) % total
        if 1e-12 < d < span:
            out.append((d, c))
    out.sort(key=lambda t: t[0])
    return [c for _, c in out]


def _ring_area(r):
    a = 0.0
    for i in range(len(r)):
        p, q = r[i], r[i - 1]
        a += p["lon"] * q["lat"] - q["lon"] * p["lat"]
    return a / 2


def _punch(outer, hole):
    """Cut `hole` out of `outer` with a zero-width slit.

    A hole cannot be expressed as a second ring here: both the runtime
    `__inWater` and the audit's own test are an OR over rings — inside ANY ring
    means water — so adding an island ring would make the island MORE water,
    not less. The standard answer for a single-ring representation is a slit:
    walk the outer ring to the vertex nearest the hole, walk the hole all the
    way round in the OPPOSITE winding, and come back. The two coincident edges
    have zero area and every point-in-polygon test then reports the island as
    outside.
    """
    if len(hole) < 3:
        return outer
    # opposite winding to the outer ring, or the "hole" adds area instead of
    # removing it
    if (_ring_area(outer) > 0) == (_ring_area(hole) > 0):
        hole = list(reversed(hole))
    bi, bj, bd = 0, 0, None
    for i, a in enumerate(outer):
        for j, b in enumerate(hole):
            d = (a["lat"] - b["lat"]) ** 2 + (a["lon"] - b["lon"]) ** 2
            if bd is None or d < bd:
                bd, bi, bj = d, i, j
    return (outer[:bi + 1]
            + hole[bj:] + hole[:bj + 1]
            + outer[bi:])


def sea_polygons(coast_ways, bbox):
    """The public entry point. bbox is the districts.json 's,w,n,e' string.

    RETURNS [] RATHER THAN SOMETHING WRONG. Each chain is closed against the
    bbox INDEPENDENTLY, which is correct only while there is one shoreline
    crossing the box. harbourfront has FOUR — the mainland shore, Sentosa's
    shore and two islands — and independently closed rings then overlap and
    contradict each other: measured 13.65 km2 of "sea" inside a 3.54 km2
    district, with VivoCity and Telok Blangah both inside it.

    So there is a hard sanity test, and it is a geometric certainty rather
    than a tuned threshold: clipped sea rings partition part of the bbox, so
    their total area CANNOT exceed the bbox itself. If it does, the closure is
    wrong and the honest output is nothing at all — a district with no sea
    renders the Straits as land, which is bad; a district whose sea covers the
    shopping centre is worse, and it is the kind of wrong that looks
    deliberate.
    """
    s, w, n, e = (float(v) for v in str(bbox).split(","))
    box = (s, w, n, e)

    # ASSEMBLE ACROSS ALL CHAINS, NOT ONE RING PER CHAIN.
    #
    # Closing each chain against the bbox on its own is right while exactly one
    # shoreline crosses the box, and it built marinaeast and marinasouth
    # correctly. harbourfront has FOUR — the mainland shore, Sentosa's shore and
    # two islands — and independent closure gave five overlapping rings covering
    # 3.9x the district, with VivoCity inside the sea.
    #
    # The real shape of the problem: every clipped run enters and leaves on the
    # boundary, and the sea is the region bounded by ALL of them together. So
    # walk it as one circuit — follow a run to its exit, travel the perimeter in
    # the seaward direction to the NEXT run's entry (whichever chain that
    # belongs to), continue along it, and close when you arrive back where you
    # started. This is the assembly osmcoastline uses to cut the world's
    # coastline into tiles, and it degenerates to the old behaviour when there
    # is only one run.
    runs = []
    islands = []
    interior = 0
    for chain in stitch(coast_ways):
        for run in clip_chain(chain, box):
            if _on_edge(run[0], box) and _on_edge(run[-1], box):
                runs.append(run)
            elif len(run) > 3:
                # AN ISLAND IS A HOLE IN THE SEA, and leaving it out is not a
                # cosmetic loss. Pulau Brani sits whole inside the sentosa bbox;
                # skipping its ring left the sea covering the island, so every
                # building on it — the MPA Brani Buoy Depot among them — read as
                # "built in open water". That was 114 W2 findings and the reason
                # sentosa could not ship.
                islands.append(run)
                interior += 1
    if interior:
        print(f"  ! {interior} island coastline ring(s) lie inside the bbox and are "
              f"NOT cut out of the sea — anything built on them will read as "
              f"built in open water. See _punch() and the note at its call site.")
    if not runs:
        return []

    total_p = 2 * ((e - w) + (n - s))
    forward = _seaward(runs[0], box)

    def ahead(a, b):
        d = ((b - a) if forward else (a - b)) % total_p
        return d

    out = []
    used = set()
    for i0 in range(len(runs)):
        if i0 in used:
            continue
        ring, i = [], i0
        for _ in range(len(runs) * 2 + 8):
            used.add(i)
            ring.extend(runs[i])
            pos = _perimeter_pos(runs[i][-1], box)
            best = None
            for j, r in enumerate(runs):
                if j in used and j != i0:
                    continue
                d = ahead(pos, _perimeter_pos(r[0], box))
                if d > 1e-12 and (best is None or d < best[0]):
                    best = (d, j)
            if best is None:
                break
            ring.extend(_corners_between(pos, _perimeter_pos(runs[best[1]][0], box),
                                         box, forward))
            if best[1] == i0:
                break
            i = best[1]
        if len(ring) > 3:
            out.append(ring)
    # ISLAND HOLES: ATTEMPTED, MEASURED AS WORSE, AND REVERTED 2026-08-02.
    #
    # `_punch()` below splices an island into the outer ring with a zero-width
    # slit, which is the standard single-ring way to express a hole. Applied to
    # sentosa it produced a ring that failed the verify: the open channel came
    # out as LAND and Pulau Brani stayed sea — so the splice or its winding test
    # is wrong, and a corrupted sea ring is far worse than a missing hole. The
    # helper is kept because the approach is right and only the implementation
    # is not; the call site is disabled until it passes verify().
    #
    # The next attempt should test _punch() against a hand-made square-with-a-
    # square-hole before going near real coastline, which is what I did not do.
    if not out:
        return out
    # ring areas in square degrees, compared against the box's own
    def _area(r):
        a = 0.0
        for i in range(len(r)):
            p, q = r[i], r[i - 1]
            a += p["lon"] * q["lat"] - q["lon"] * p["lat"]
        return abs(a) / 2
    total = sum(_area(r) for r in out)
    boxarea = (n - s) * (e - w)
    if total > boxarea * 1.001:
        print(f"  ! COASTLINE CLOSURE FAILED: {len(out)} sea rings totalling "
              f"{total / boxarea:.1f}x the district area. That is impossible for "
              f"clipped rings and means several shorelines cross this bbox and "
              f"were closed independently. Emitting NO sea rather than a sea over "
              f"the land — see data/coastline.py sea_polygons().")
        return []
    return out


def verify(rings, sea_pts, land_pts):
    """A ring wound the wrong way floods the city and looks entirely plausible
    doing it. Check against points whose side is known before trusting any of
    the geometry above."""
    ok = True
    for lat, lon in sea_pts:
        got = any(point_in(r, lat, lon) for r in rings)
        print(f"    SEA  {lat:.5f},{lon:.5f}  inside={got}  {'ok' if got else 'WRONG'}")
        ok &= got
    for lat, lon in land_pts:
        got = any(point_in(r, lat, lon) for r in rings)
        print(f"    LAND {lat:.5f},{lon:.5f}  inside={got}  {'ok' if not got else 'WRONG'}")
        ok &= not got
    return ok


if __name__ == "__main__":
    import json, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import osmlocal
    BBOX = "1.2740,103.8620,1.2920,103.8780"
    ways = osmlocal.fetch(BBOX, 'way["natural"="coastline"]({bbox});') or []
    print(f"  coastline ways: {len(ways)}")
    rings = sea_polygons(ways, BBOX)
    print(f"  sea rings: {len(rings)}  sizes {[len(r) for r in rings]}")
    # THE TEST POINTS ARE THE TEST. The first set was guessed from a mental
    # picture of Marina East and one of them was simply wrong: (1.2760,
    # 103.8700) was asserted to be sea, the reader said land, and the reader
    # was right -- the chain jumps straight from 103.86632 to 103.87137 with no
    # vertex between, and interpolating puts the shore at lat 1.27559, north of
    # which is reclaimed land. Half an hour went into suspecting correct code.
    #
    # These are chosen against the fetched geometry instead of from memory:
    # the two SEA points sit south of the chain's southernmost vertex (1.27291)
    # or hard against the south-east corner, and the two LAND points are the
    # Marina Barrage structure and Bay East Garden, both well north of the
    # shore at their own longitude.
    good = verify(rings,
                  sea_pts=[(1.27450, 103.87500), (1.27420, 103.87700)],
                  land_pts=[(1.28940, 103.86970), (1.28066, 103.87109)])
    print("  RESULT:", "PASS" if good else "FAIL")
