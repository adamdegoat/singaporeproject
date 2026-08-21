#!/usr/bin/env python3
"""USS ZONE PAVING — the ground surface that changes at every zone boundary.

research/universal-zones.md §9: "Ground surface changes at every zone
boundary and is a cheap, high-payoff signal", and then names the surface for
each zone. Before this pass the whole park floor was the island's default
lawn — you walked Hollywood, Sci-Fi and Egypt on the same green grass, which
is the single loudest way the park did NOT feel like the park.

WHAT THIS WRITES: scene["usspaving"] — one polygon per themed zone, the park
boundary ring Voronoi-split by the surveyed zone anchor nodes (the SAME
nearest-anchor rule city.js's crowns and sgdetail's zone dressing use, so the
ground and the buildings never disagree about where a zone is). Paint-only:
main.js feeds these into the green layer exactly like data/golf.py's areas —
a tint on the terrain, no geometry, and a tint cannot become an invisible
wall. greenAt's smallest-ring-wins rule means any surveyed parcel INSIDE a
zone cell (a planting bed, the lagoon's ring) still paints itself — these
cells are the FALLBACK floor, not a bulldozer.

The boundary cuts are STRAIGHT LINES on purpose: §9 again — "Zone boundaries
are hard cuts, not blends. Build the seam, do not feather it."

TINTS live in src/terrain.js's TINT table (kinds pv_*), sampled from the
research's own palette lines: Hollywood terracotta-and-cream tile (§1.8),
New York asphalt (§2), Sci-Fi swept terrazzo in apricot/sand/grey (§3
palette), Egypt sand-toned stamped concrete (§4), Lost World warm grey
stamped stone / salmon-red approach (§5A |716), Far Far Away cream/dusty
pink/pale blue banded slabs (§6 palette), Minion Land grey-brown cobble
setts (research/minion-land.md |36, PHOTO). WaterWorld has no published or
photographed paving line — plain concrete grey, EST, the quietest guess.

In the CHAIN after attractions.py (it reads the ring and anchors that pass
fetches). Idempotent: owns scene["usspaving"], replaces it wholesale.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

ZONE_KIND = {
    "Hollywood": "pv_holly",
    "New York": "pv_ny",
    "Sci-Fi City": "pv_scifi",
    "Ancient Egypt": "pv_egypt",
    "The Lost World": "pv_lw",
    "Jurassic World": "pv_lw",
    "Far Far Away": "pv_ffa",
    "Minion Land": "pv_minion",
    "Madagascar": "pv_minion",
    "WaterWorld": "pv_ww",
}


def clip_halfplane(poly, ax, az, bx, bz):
    """Sutherland-Hodgman clip of poly to the half-plane of points nearer
    (ax,az) than (bx,bz) — the Voronoi bisector. poly is [[x,z],...] open."""
    # inside(P) <=> |P-a|^2 <= |P-b|^2  <=>  2P.(b-a) <= |b|^2-|a|^2
    dx, dz = bx - ax, bz - az
    c = (bx * bx + bz * bz - ax * ax - az * az) / 2.0

    def inside(p):
        return p[0] * dx + p[1] * dz <= c

    out = []
    n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        pin, qin = inside(p), inside(q)
        if pin:
            out.append(p)
        if pin != qin:
            # intersection of segment pq with the bisector line
            denom = (q[0] - p[0]) * dx + (q[1] - p[1]) * dz
            if abs(denom) < 1e-12:
                continue
            t = (c - (p[0] * dx + p[1] * dz)) / denom
            t = max(0.0, min(1.0, t))
            out.append([round(p[0] + (q[0] - p[0]) * t, 1),
                        round(p[1] + (q[1] - p[1]) * t, 1)])
    return out


def main():
    sid = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    path = os.path.join(HERE, f"{sid}.json")
    if not os.path.exists(path):
        print(f"usspaving: no scene at {path}", file=sys.stderr)
        return 1
    scene = json.load(open(path))

    ring = None
    anchors = []
    for a in scene.get("attractions", []):
        if a.get("n") == "Universal Studios Singapore" and a.get("g"):
            ring = a["g"]
        if a.get("n") in ZONE_KIND and a.get("p"):
            anchors.append((a["n"], a["p"][0], a["p"][1]))

    # A SILENT EMPTY INPUT IS A LOUD FAILURE (the 30k lesson): if the ring or
    # the anchors are gone, something upstream broke — refuse, don't write an
    # empty layer and report a clean pass.
    if not ring or len(ring) < 3:
        print("usspaving: no 'Universal Studios Singapore' boundary ring in "
              "attractions — refusing to write", file=sys.stderr)
        return 1
    if len(anchors) < 4:
        print(f"usspaving: only {len(anchors)} zone anchors found (expected "
              "7+) — refusing to write", file=sys.stderr)
        return 1

    # THE GUEST MIDWAY, NOT THE WHOLE PLOT. The surveyed ring covers the
    # full USS parcel including the backstage strip that runs beside the
    # Sensoryscape avenue (the ring reaches x -1474) — and the first cut of
    # this pass painted that avenue's verge as New York asphalt (caught by
    # the golden gate, sensoryscape.png 6.62%). Two wrong fixes first: a
    # 130m then an 80m circle cap around each anchor — the circle is the
    # wrong shape (80m un-painted the New York street the newyork-awnings
    # golden exists to watch, while 130m still painted the verge). The
    # midway is NOT round. The actual evidence: every wrongly painted pixel
    # was WEST of the Sensoryscape avenue, which runs N-S at x ~= -1415
    # alongside the park (golden.mjs camera -1420,12480 stands ON it, and
    # OSM maps no guest floor west of it — checked in the PBF: the one
    # pedestrian area in the bbox is the Bull Ring, outside the park). So:
    # full Voronoi cells, clipped by ONE authored line — nothing paints
    # west of x = -1405 (10m east of the avenue's centreline). AVENUE_X is
    # a deny-line, the openground NOT_LIFTED pattern: the fix for a wrong
    # paint is an evidence-backed clip, not a blanket radius. -1405 was one
    # clip too greedy: the newyork-awnings golden stands at x -1413 — the
    # guest New York street runs only ~7m east of the avenue, so the line
    # sits at -1416.5, between the avenue centreline and that street.
    AVENUE_X = -1416.5
    cells = []
    for (name, ax, az) in anchors:
        poly = [list(p) for p in ring]
        for (name2, bx, bz) in anchors:
            if name2 == name and bx == ax and bz == az:
                continue
            poly = clip_halfplane(poly, ax, az, bx, bz)
            if len(poly) < 3:
                break
        # keep x >= AVENUE_X: clip with a bisector whose "far" point mirrors
        # a "near" point across the line, both on the y axis of the cell
        if len(poly) >= 3:
            poly = clip_halfplane(poly, AVENUE_X + 100, az,
                                  AVENUE_X - 100, az)
        if len(poly) >= 3:
            cells.append({"k": ZONE_KIND[name], "p": poly, "n": name})

    scene["usspaving"] = cells
    json.dump(scene, open(path, "w"), separators=(",", ":"))
    kinds = sorted({c["k"] for c in cells})
    print(f"   usspaving: {len(cells)} zone cells over the park "
          f"({', '.join(kinds)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
