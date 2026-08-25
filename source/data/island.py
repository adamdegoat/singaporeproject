"""ISLAND CLIP — the map is Sentosa island, and nothing else.

The owner, 2026-08-03: "focus on sentosa only... only sentosa will do, brani all
no need. let this be sentosa project for the first map ppl can come and play in."

WHY THIS EXISTS. The district bbox is a rectangle, so it swept in three land
masses that are not Sentosa: Pulau Brani and the Keppel container terminal to
the north, HarbourFront/VivoCity, and Keppel Bay. Measured on the built scene
before this step: 162.3 km of road and path, of which only 81.5% formed one
connected piece — 30.0 km sat in 91 islands a player could never reach. TWENTY
FOUR of those thirty kilometres were Brani, Keppel and HarbourFront, i.e. not
disconnection at all but land that should never have been in the map. Cutting
them is not a fix applied to a defect; it is the defect ceasing to be in scope.

HOW THE ISLAND IS FOUND. Not by a hand-typed polygon: the OSM coastline ways in
the scene are stitched end-to-end into closed rings and the largest closed ring
is taken. On Sentosa that ring measures 4.89 km2 against the island's real ~5
km2, and the runner-up ring is Brani at 1.21 km2 — a 4x gap, so the choice is
not marginal. If a future district's rings are closer than 2x this refuses to
guess and says so.

WHAT IS CLIPPED AND WHAT IS NOT. Playable layers are clipped hard: if a player
can walk on it, hit it, or read it, it has to be on the island. Skyline layers
are kept whole on purpose — the sea, the far shore, the Keppel container cranes
and the cable car to Mount Faber are all things you SEE from Sentosa and cutting
them at the waterline would leave the horizon empty. That distinction is the
whole design of this file: the play area is the island, the view is not.

Idempotent: running it twice changes nothing, so it is safe to run on an already
built scene as well as inside the build.

Run:  python3 data/island.py sentosa            (writes in place, prints a ledger)
      python3 data/island.py sentosa --dry-run  (measures, writes nothing)
"""
import argparse
import json
import math
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

# Margin outside the coastline that still counts as "on the island". Piers,
# jetties, boardwalks, the beach walk and the sand itself all sit at or past the
# mapped waterline, and every one of them is walkable, so a zero margin would
# delete the parts of Sentosa people actually go to.
PLAY_MARGIN = 60.0
# How far a way that leaves the island may still be DRAWN, so the Sentosa
# Gateway bridge and the boardwalk read as leaving the island rather than being
# chopped at the sand. Past this they stop.
SCENERY_MARGIN = 220.0
# Pieces shorter than this after cutting are stubs, not roads.
MIN_PIECE = 8.0

# Clipped: the player interacts with these.
# `rocks` is NOT here: a groyne or outcrop is a coastal feature and lives at or
# past the waterline BY NATURE — clipping them cost Siloso 6 of its 7 surveyed
# rock groynes for a whole deploy cycle (attractions.py wrote 7, this file kept
# the one that happened to sit inland enough), and a rock in the sea blocks no
# route that the water itself does not.
POINT_LAYERS = ["trees", "lamps", "busstops", "crossings", "signals", "taxis",
                "parkfurn", "attractions", "shops", "mrt", "towers",
                # `gates` added 2026-08-24 with the layer itself. A layer that
                # is not in one of these three lists is not clipped, and an
                # unclipped point layer puts its objects on Pulau Brani and the
                # Keppel terminal — the ledger at the end of this file prints
                # every key it did not read, which is how that would be caught,
                # but it is cheaper to add the name here than to read a ledger.
                "gantries", "gates"]
WAY_LAYERS = ["roads", "steps", "bridges", "monorail"]
AREA_LAYERS = ["green", "covered", "barriers", "land", "piers"]

# BUILDINGS ARE NOT DELETED OFF THE ISLAND, THEY ARE DEMOTED.
#
# Deleting them was tried first and it made the world worse, which only a
# render showed: the DEM covers the whole bbox, so 2.19 km2 of Pulau Brani, the
# Keppel terminal and HarbourFront stayed drawn as dry land — and once their
# buildings were gone it was 2.19 km2 of BARE PALE GROUND right off Sentosa's
# north shore, which is a far worse thing to look at than a port.
#
# The land is real, you genuinely see it from Siloso, and it is only 66
# buildings. So they stay, tagged `"bg": 1`: they are the skyline across the
# water, not part of the map. Nothing about the play area changes — there are
# no roads, paths, trees or shops out there to reach them by.
BACKGROUND_LAYERS = ["buildings"]
# Kept whole: these are the view, not the map. Cutting them empties the horizon.
# `rocks` ride along here: surveyed coastal outcrops, already bounded by the
# district bbox, standing in water the player can already reach.
SKYLINE = ["coast", "water", "cranes", "cableway", "terrain", "origin", "axis",
           "axisFullLength", "rocks"]


def dist_point_seg(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    L2 = vx * vx + vy * vy
    t = 0.0 if L2 == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / L2))
    dx, dy = ax + t * vx - px, ay + t * vy - py
    return math.hypot(dx, dy)


class Ring:
    """Closed polygon with an inside test and a distance-to-edge test."""

    def __init__(self, pts):
        self.p = pts
        xs = [q[0] for q in pts]
        ys = [q[1] for q in pts]
        self.bbox = (min(xs), min(ys), max(xs), max(ys))
        # segment buckets on a 200m grid so distance queries do not scan 462
        # segments per point (4,848 trees x 462 would be 2.2M edge tests)
        self.cell = 200.0
        self.grid = defaultdict(list)
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            x0, x1 = sorted((a[0], b[0]))
            y0, y1 = sorted((a[1], b[1]))
            for cx in range(int(x0 // self.cell), int(x1 // self.cell) + 1):
                for cy in range(int(y0 // self.cell), int(y1 // self.cell) + 1):
                    self.grid[(cx, cy)].append((a, b))

    def area(self):
        a = 0.0
        for i in range(len(self.p) - 1):
            a += self.p[i][0] * self.p[i + 1][1] - self.p[i + 1][0] * self.p[i][1]
        return abs(a) / 2

    def contains(self, x, y):
        x0, y0, x1, y1 = self.bbox
        if x < x0 or x > x1 or y < y0 or y > y1:
            return False
        inside = False
        p = self.p
        j = len(p) - 1
        for i in range(len(p)):
            xi, yi = p[i]
            xj, yj = p[j]
            if (yi > y) != (yj > y):
                xint = (xj - xi) * (y - yi) / (yj - yi) + xi
                if x < xint:
                    inside = not inside
            j = i
        return inside

    def edge_dist(self, x, y):
        r = int(self.cell)
        best = 1e18
        cx, cy = int(x // self.cell), int(y // self.cell)
        rad = 0
        while rad <= 6:
            found = False
            for gx in range(cx - rad, cx + rad + 1):
                for gy in range(cy - rad, cy + rad + 1):
                    if rad and abs(gx - cx) != rad and abs(gy - cy) != rad:
                        continue
                    for (a, b) in self.grid.get((gx, gy), ()):
                        d = dist_point_seg(x, y, a[0], a[1], b[0], b[1])
                        if d < best:
                            best = d
                        found = True
            if found and best <= rad * self.cell:
                return best
            rad += 1
        return best

    def within(self, x, y, margin):
        """Inside the ring, or outside it by less than `margin`."""
        if self.contains(x, y):
            return True
        return self.edge_dist(x, y) <= margin


def stitch_rings(coast):
    """OSM gives coastline in fragments; the island is only visible once they
    are joined. Endpoints are matched on a 0.5m key — the fragments share exact
    nodes, so this is a lookup, not a tolerance search."""
    ways = [w["p"] for w in coast if w.get("p") and len(w["p"]) > 1]

    def key(pt):
        return (round(pt[0] / 0.5), round(pt[1] / 0.5))

    ends = defaultdict(list)
    for i, p in enumerate(ways):
        ends[key(p[0])].append((i, 0))
        ends[key(p[-1])].append((i, 1))
    used, rings = set(), []
    for i in range(len(ways)):
        if i in used:
            continue
        chain = list(ways[i])
        used.add(i)
        grew = True
        while grew:
            grew = False
            for endpt, prepend in ((chain[-1], False), (chain[0], True)):
                for (j, side) in ends.get(key(endpt), []):
                    if j in used:
                        continue
                    q = list(ways[j])
                    if side == 1:
                        q.reverse()
                    if prepend:
                        chain = list(reversed(q))[:-1] + chain
                    else:
                        chain = chain + q[1:]
                    used.add(j)
                    grew = True
                    break
                if grew:
                    break
        closed = (abs(chain[0][0] - chain[-1][0]) < 2
                  and abs(chain[0][1] - chain[-1][1]) < 2)
        if closed and len(chain) > 8:
            rings.append(Ring(chain))
    rings.sort(key=lambda r: -r.area())
    return rings


def centroid(p):
    return (sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p))


def geom(o):
    """Read an object's geometry whatever shape the pipeline gave it.

    Five shapes are in use in one scene file and there is no flag saying which:
    a bare pair [x,y] (trees, lamps), a bare pair with extra fields
    [x,y,a,b,c] (crossings), a bare list of pairs (bridges, covered), a dict
    whose "p" is a pair (busstops, shops, cranes) and a dict whose "p" is a
    list of pairs (roads, buildings). Guessing wrong silently deletes a layer,
    which is exactly how a beach-walk fix once removed the beach walk, so this
    returns None for anything it does not recognise and the caller KEEPS it.

    Returns (kind, points, key) where kind is "pt" or "line", and key is the
    dict field the geometry came from (None for a bare object)."""
    src, key = (o.get("p"), "p") if isinstance(o, dict) else (o, None)
    if src is None and isinstance(o, dict):
        src, key = o.get("g"), "g"
    if not isinstance(src, (list, tuple)) or not src:
        return None
    if isinstance(src[0], (int, float)):
        if len(src) < 2:
            return None
        return ("pt", [(float(src[0]), float(src[1]))], key)
    pts = [q for q in src if isinstance(q, (list, tuple)) and len(q) >= 2]
    if not pts:
        return None
    return ("line", [(float(q[0]), float(q[1])) for q in pts], key)


def seglen(p):
    return sum(math.dist(p[i], p[i + 1]) for i in range(len(p) - 1))


def cut_way(pts, ring):
    """Split a polyline into the pieces that are on or near the island.

    Vertex-level, not way-level: a road that runs from the island across the
    bridge to the mainland keeps its island half and its bridge stub, and loses
    the rest. Keeping or dropping whole ways instead would either amputate the
    Gateway at the sand or drag VivoCity back into the map."""
    out, cur = [], []
    for (x, y) in pts:
        if ring.within(x, y, SCENERY_MARGIN):
            cur.append([x, y])
        else:
            if len(cur) > 1:
                out.append(cur)
            cur = []
    if len(cur) > 1:
        out.append(cur)
    # A SHORT WAY IS NOT A STUB. A STUB IS WHAT IS LEFT AFTER A CUT.
    #
    # MIN_PIECE exists to stop a 2m nub surviving where a road was chopped at
    # the shore, and it was applied to every piece this function returns —
    # including ways it never touched. So a way the map really does draw 5m
    # long was deleted for being 5m long, on the authority of a rule about
    # cutting, having been cut by nothing.
    #
    # Measured on sentosa: 13 of the island's bridge footways are 3.2-7.7m
    # 2-vertex connectors, every one of them wholly inside the ring, and every
    # one of them deleted here. They are the short hops between a path and a
    # deck — exactly the geometry that JOINS a network, which is why deleting
    # them was invisible in a frame and expensive in N1.
    #
    # The test is not the length, it is whether anything was lost: if the way
    # came through whole, it is the way the map drew and it stays.
    whole = len(out) == 1 and len(out[0]) == len(pts)
    return [c for c in out if whole or seglen(c) >= MIN_PIECE]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    before_bytes = os.path.getsize(path)

    rings = stitch_rings(d.get("coast") or [])
    if not rings:
        sys.exit("  ! no closed coastline ring — cannot find the island")
    island = rings[0]
    if len(rings) > 1 and island.area() < 2 * rings[1].area():
        sys.exit("  ! the two largest coastline rings are within 2x "
                 f"({island.area():.0f} vs {rings[1].area():.0f} m2) — refusing "
                 "to guess which one is the island")
    print(f"  island ring: {island.area()/1e6:.2f} km2, {len(island.p)} points"
          + (f"  (next largest {rings[1].area()/1e6:.2f} km2, cut)"
             if len(rings) > 1 else ""))

    ledger = []

    unread = []

    # Points and areas: kept or dropped whole, judged at one representative
    # point — the point itself, or the centroid of the outline.
    for layer in POINT_LAYERS + AREA_LAYERS:
        v = d.get(layer)
        if not isinstance(v, list) or not v:
            continue
        kept = []
        for o in v:
            g = geom(o)
            if g is None:
                kept.append(o)
                unread.append(layer)
                continue
            x, y = g[1][0] if g[0] == "pt" else centroid(g[1])
            if island.within(x, y, PLAY_MARGIN):
                kept.append(o)
        if len(kept) != len(v):
            ledger.append((layer, len(v), len(kept)))
        d[layer] = kept

    # Background: kept, but marked as the view rather than the map.
    for layer in BACKGROUND_LAYERS:
        v = d.get(layer)
        if not isinstance(v, list) or not v:
            continue
        n_bg = 0
        for o in v:
            g = geom(o)
            if g is None or not isinstance(o, dict):
                continue
            x, y = g[1][0] if g[0] == "pt" else centroid(g[1])
            if island.within(x, y, PLAY_MARGIN):
                o.pop("bg", None)
            else:
                o["bg"] = 1
                n_bg += 1
        print(f"    {layer:<18} {len(v):>7}  {len(v)-n_bg:>7}   {n_bg} kept as "
              f"background across the water")

    # Ways: cut at the vertex, so a road that crosses the water keeps its
    # island half instead of being kept or dropped whole.
    for layer in WAY_LAYERS:
        v = d.get(layer)
        if not isinstance(v, list) or not v:
            continue
        kept = []
        for o in v:
            g = geom(o)
            if g is None or g[0] != "line":
                kept.append(o)
                if g is None:
                    unread.append(layer)
                continue
            _, pts, key = g
            for piece in cut_way(pts, island):
                if key is None:
                    kept.append(piece)
                else:
                    q = dict(o)
                    q[key] = piece
                    # A CARRIAGEWAY OVER THE CHANNEL IS ELEVATED, whatever OSM
                    # tags. The Gateway's approach viaduct is bridge-tagged
                    # only over mid-channel; its approach ways used to drape
                    # onto ground that read +12m from contaminated samples,
                    # and the day the terrain became honest (260804-1248) that
                    # ground fell to the water it really is — leaving the
                    # tagged span in mid-air and the untagged approach awash
                    # at sea level (the owner rode it: "the road halfway
                    # float up in the air"). A road piece mostly OUTSIDE the
                    # coastline ring, reaching well off the shore, is standing
                    # over water; mark it bridge and the deck-run machinery
                    # (shared run deck + terminal ramps) rebuilds the causeway
                    # the way the real one stands.
                    if layer == "roads" and not q.get("bridge") \
                            and q.get("k") not in ("footway", "pedestrian", "steps") \
                            and len(piece) >= 2 and seglen(piece) >= 30.0:
                        outv = [p2 for p2 in piece if not island.contains(p2[0], p2[1])]
                        far = max((island.edge_dist(p2[0], p2[1]) for p2 in outv),
                                  default=0.0)
                        if len(outv) > 0.6 * len(piece) and far >= 30.0:
                            q["bridge"] = 1
                            q["ws"] = (q.get("ws") or "") + "+causeway"
                    kept.append(q)
        if len(kept) != len(v):
            ledger.append((layer, len(v), len(kept)))
        d[layer] = kept

    print("  layer                 before    after")
    for (layer, b, k) in ledger:
        print(f"    {layer:<18} {b:>7}  {k:>7}   -{b-k}")
    if not ledger:
        print("    (nothing outside the island — already clipped)")

    # THE AXIS IS DRESSING, AND DRESSING NEEDS A ROAD UNDER IT.
    #
    # `axis` sits in SKYLINE and so was kept whole, while `roads` is a WAY_LAYER
    # and is cut at SCENERY_MARGIN. On Sentosa that leaves the axis running from
    # z=11231 while the northernmost Sentosa Gateway carriageway starts at
    # z=11706 — 475 metres where every pass that dresses the axis (lane
    # markings, kerbs, lamps, street trees) paints onto BARE GRASS, because
    # there is no tarmac there to paint on. Caught by the coverage sweep at
    # -1073,11317: a four-lane road, fully marked, dark green.
    #
    # Cut with the same knife as the roads, and take the longest surviving
    # piece: the axis is one continuous route by construction, and every pass
    # that walks it by arclength needs it to stay that way.
    # the axis is {p, w, n}, not a bare polyline — the first cut of this read it
    # as a list, found no points, and silently did nothing
    _ax = d.get("axis")
    _axp = _ax.get("p") if isinstance(_ax, dict) else _ax
    if isinstance(_axp, list) and len(_axp) > 1 and island is not None:
        _pieces = cut_way([[p[0], p[1]] for p in _axp], island)
        if _pieces:
            _best = max(_pieces, key=seglen)
            if len(_best) > 1 and len(_best) != len(_axp):
                _bz = [q[1] for q in _best]
                print(f"  axis clipped to the carriageway: {len(_axp)} -> {len(_best)} pts, "
                      f"z {min(_bz):.0f}..{max(_bz):.0f}")
                _clipped = [[round(q[0], 1), round(q[1], 1)] for q in _best]
                if isinstance(_ax, dict):
                    _ax["p"] = _clipped
                else:
                    d["axis"] = _clipped
                d["axisFullLength"] = round(seglen(_best), 1)

    kept_whole = [s for s in SKYLINE if s in d]
    print(f"  kept whole (the view, not the map): {', '.join(kept_whole)}")
    if unread:
        # Loud, because the silent version of this is a deleted layer.
        seen = {}
        for u in unread:
            seen[u] = seen.get(u, 0) + 1
        print("  ! geometry not understood, KEPT untouched: "
              + ", ".join(f"{k} x{n}" for k, n in seen.items()))
    missed = [k for k in d
              if k not in SKYLINE and k not in POINT_LAYERS
              and k not in WAY_LAYERS and k not in AREA_LAYERS
              and k not in BACKGROUND_LAYERS]
    if missed:
        print(f"  ! layers no rule covers, kept whole: {', '.join(sorted(missed))}")

    if a.dry_run:
        print("  dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    after = os.path.getsize(path)
    print(f"  {path}  {before_bytes/1024:.0f} KB -> {after/1024:.0f} KB")


if __name__ == "__main__":
    main()
