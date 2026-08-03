"""ARCADES — the mapped walking routes that run through buildings.

The owner, twice: "cannot like got broken roads or paths or halfway will stuck
all." Measured on the drawn world, 24 walking routes on Sentosa are blocked for
more than 20 metres at a stretch, the worst of them 226m, and they are not
mapping errors. They are real routes: OSM maps the pedestrian way THROUGH
Resorts World, through the Waterfront, through the resort podiums, because in
life you walk through them. We model no interiors, so the walker meets a wall.

`data/openground.py` already resolves the version of this where the whole
ground storey should be open — a road running under a structure. That rule
deliberately refuses tall buildings, because standing a 55m hotel on columns
looks far worse than the defect. This file handles the rest: not the whole
storey, just the CORRIDOR the route takes.

WHAT IT EMITS. For every long run of a mapped footway inside a building
footprint, the corridor polyline, clipped to the footprint and padded a little
past each face. src/solid.js carves those cells out of the collision grid, so
the route is walkable; src/sgdetail.js frames the two places it crosses the
facade, so it reads as an arcade you enter rather than a wall you ghost
through.

Only LONG runs qualify. A path clipping a building corner for two metres needs
no arcade — a walker steps around it — and measured, 165 of the 235 blocked
runs on this island are under three metres.

Run:  python3 data/arcade.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

MIN_RUN = 12.0        # metres inside a footprint before it is a route, not a clip
CORRIDOR_W = 3.6      # how wide the carved passage is
PAD = 2.5             # push past the facade so the mouth is genuinely open
WALK = {"footway", "pedestrian", "path", "steps"}
# AND THE DRIVE-THROUGH. The owner: "even like hotels can drive thru to the
# main lobby like drop off point like realistic resorts kind?"
#
# A road running through a hotel footprint is a porte-cochere — you drive in
# under the building, stop at the lobby, drive out. openground.py already
# refuses to lift these (a 55m tower on columns looks worse than the defect) and
# lists them as needing exactly this. Same carve, wider corridor, and a canopy
# drawn over it instead of an arcade mouth.
DRIVE = {"service", "residential", "living_street", "unclassified", "tertiary"}
DRIVE_W = 7.5
DRIVE_MIN_RUN = 10.0


def poly_contains(poly, x, y):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y):
            if x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                inside = not inside
        j = i
    return inside


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    builds = []
    for b in (d.get("buildings") or []):
        p = b.get("p")
        if not p or len(p) < 3:
            continue
        xs = [q[0] for q in p]
        ys = [q[1] for q in p]
        builds.append(((min(xs), min(ys), max(xs), max(ys)), p, b))

    cell = 90.0
    grid = {}
    for i, (bb, p, b) in enumerate(builds):
        for gx in range(int(bb[0] // cell), int(bb[2] // cell) + 1):
            for gy in range(int(bb[1] // cell), int(bb[3] // cell) + 1):
                grid.setdefault((gx, gy), []).append(i)

    arcades = []
    for r in (d.get("roads") or []):
        kind = r.get("k") if isinstance(r, dict) else None
        if kind not in WALK and kind not in DRIVE:
            continue
        is_drive = kind in DRIVE
        min_run = DRIVE_MIN_RUN if is_drive else MIN_RUN
        p = r.get("p")
        if not isinstance(p, list) or len(p) < 2:
            continue
        # walk the whole way at 1.5m and collect runs that are inside ANY
        # building — a run may cross from one footprint into its neighbour and
        # it is still one passage to the walker
        samples = []
        for i in range(len(p) - 1):
            ax, ay = p[i][0], p[i][1]
            bx, by = p[i + 1][0], p[i + 1][1]
            L = math.hypot(bx - ax, by - ay)
            n = max(1, int(L / 1.5))
            for s in range(n):
                t = s / n
                samples.append((ax + (bx - ax) * t, ay + (by - ay) * t))
        samples.append((p[-1][0], p[-1][1]))

        def inside_any(x, y):
            for idx in grid.get((int(x // cell), int(y // cell)), ()):
                bb, poly, b = builds[idx]
                if bb[0] <= x <= bb[2] and bb[1] <= y <= bb[3] and poly_contains(poly, x, y):
                    return b
            return None

        run, host = [], None
        for (x, y) in samples:
            b = inside_any(x, y)
            if b is not None:
                run.append((x, y))
                host = host or b
            else:
                if len(run) * 1.5 >= min_run:
                    arcades.append((run, host, r, is_drive))
                run, host = [], None
        if len(run) * 1.5 >= min_run:
            arcades.append((run, host, r, is_drive))

    out = []
    for (run, host, r, is_drive) in arcades:
        # pad past each end so the mouth clears the facade
        if len(run) < 2:
            continue
        (x0, y0), (x1, y1) = run[0], run[1]
        dx, dy = x0 - x1, y0 - y1
        L = math.hypot(dx, dy) or 1
        head = (x0 + dx / L * PAD, y0 + dy / L * PAD)
        (xa, ya), (xb, yb) = run[-1], run[-2]
        dx2, dy2 = xa - xb, ya - yb
        L2 = math.hypot(dx2, dy2) or 1
        tail = (xa + dx2 / L2 * PAD, ya + dy2 / L2 * PAD)
        pts = [head] + run + [tail]
        # thin it: 1.5m samples are far finer than a 0.75m collision grid needs
        thin = [pts[0]]
        for q in pts[1:-1]:
            if math.dist(q, thin[-1]) >= 4.0:
                thin.append(q)
        thin.append(pts[-1])
        length = sum(math.dist(thin[i], thin[i + 1]) for i in range(len(thin) - 1))
        out.append({
            "p": [[round(q[0], 1), round(q[1], 1)] for q in thin],
            "w": DRIVE_W if is_drive else CORRIDOR_W,
            "k": "drive" if is_drive else "walk",
            "n": (host or {}).get("n") or "",
            "h": round(min(6.4, max(4.6, ((host or {}).get("h") or 6) * 0.5)), 1)
                 if is_drive else
                 round(min(6.0, max(3.4, ((host or {}).get("h") or 6) * 0.5)), 1),
            "L": round(length, 1),
        })

    out.sort(key=lambda o: -o["L"])
    d["arcades"] = out
    print(f"== arcades {a.id}")
    nd = sum(1 for o in out if o.get("k") == "drive")
    print(f"   {len(out)-nd} walking route(s) and {nd} drive-through(s) carved "
          f"through buildings")
    for o in out[:12]:
        print(f"     {o['L']:6.0f} m  {o.get('k','walk'):<5} through "
              f"{o['n'] or '(unnamed building)'}")
    if len(out) > 10:
        print(f"     ... {len(out) - 10} more")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
