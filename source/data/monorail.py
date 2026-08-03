"""MONORAIL PROFILE — one continuous guideway instead of eighteen loose ways.

THE BUG THIS FIXES, MEASURED. `src/sgdetail.js` set the deck height of each
monorail way independently from its OSM `layer` tag:

    lift = 5 + 2.6 * max(1, layer)

Sentosa's ways carry layer 5, 3, 1, 0 and -2, so the Sentosa Express was built
at 18.0m, then 12.8m, then 7.6m, then 18.0m again, with nothing joining the
steps. Measured along the line before this file existed:

    #2  lyr=5  at -1724,12754   deck 18.0m above ground
    #15 lyr=1  at -1689,12710   deck  7.6m above ground     <- 10m step, 40m away
    #3  lyr=5  at -1655,12633   deck 18.0m above ground

The result is what the render at shots/street/t1.shot1.jpg shows: a slab of
guideway hanging across Siloso Beach Walk at head height with no piers under
it, because the beam either side of it is ten metres higher.

THE LAYER TAG IS NOT AN ALTITUDE. It is OSM's crossing order — which thing is
drawn over which where two ways overlap. Reading it as a height in metres is
the same mistake as every other derive-detail-from-a-tag bug in this project:
the data does not contain what was asked of it.

WHAT REPLACES IT. The ways are chained end to end into the actual line, a
single height profile is fitted along the whole chain, and each way gets its
share of it back as an explicit `ys` list. The profile is:

  * a constant LIFT over smoothed ground, so it follows the island's shape,
  * smoothed along ARC LENGTH across way boundaries, which is the thing the
    old per-way smoothing could never do,
  * held to MIN_CLEAR above the ground everywhere, so it never dips into a
    road, and
  * held to MAX_GRADE, so it never ramps like a rollercoaster.

Tunnel ways stay in the chain — the profile has to run through them to come
out continuous on the far side — but keep `tun` so the renderer draws no
fabric there, exactly as before.

This is the authored layer under the SENTOSA.md rule: the ROUTE and the four
stations are truth and come from the map untouched; how high the deck rides
between them is detail, and detail is designed.

Run:  python3 data/monorail.py sentosa
"""
import argparse
import json
import math
import os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

# Deck height over the ground. The Sentosa Express runs about two to three
# storeys up for most of its length; 11m clears a double-decker bus, the beach
# road and the resort forecourts without towering over a low-rise island.
LIFT = 11.0
# It may never come closer than this to the ground it crosses.
MIN_CLEAR = 6.0
# Gentle: a monorail is not a rollercoaster. Rise over run.
MAX_GRADE = 0.05
# Smoothing window in metres of arc length. Wide, because the point is to stop
# the deck following every bump in a 35m terrain grid.
SMOOTH_M = 140.0
SMOOTH_PASSES = 4


def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


class Ground:
    def __init__(self, t):
        self.x0, self.z0 = t["x0"], t["z0"]
        self.cell, self.nx, self.nz = t["cell"], t["nx"], t["nz"]
        self.h = t["h"]

    def at(self, x, z):
        fx = (x - self.x0) / self.cell
        fz = (z - self.z0) / self.cell
        i = max(0, min(self.nx - 2, int(fx)))
        j = max(0, min(self.nz - 2, int(fz)))
        tx, tz = fx - i, fz - j
        a = self.h[j * self.nx + i]
        b = self.h[j * self.nx + i + 1]
        c = self.h[(j + 1) * self.nx + i]
        e = self.h[(j + 1) * self.nx + i + 1]
        return ((a * (1 - tx) + b * tx) * (1 - tz)
                + (c * (1 - tx) + e * tx) * tz)


def chain_ways(segs):
    """Join the ways into runs of line. Endpoints are matched on a 1m key: OSM
    splits the guideway at every tag change and the pieces share exact nodes."""
    def key(pt):
        return (round(pt[0]), round(pt[1]))

    ends = defaultdict(list)
    for i, s in enumerate(segs):
        p = s["p"]
        ends[key(p[0])].append((i, 0))
        ends[key(p[-1])].append((i, 1))

    used, chains = set(), []
    for i in range(len(segs)):
        if i in used:
            continue
        used.add(i)
        run = [(i, False)]                       # (way index, reversed?)
        grew = True
        while grew:
            grew = False
            for at_end in (True, False):
                wi, rev = run[-1] if at_end else run[0]
                p = segs[wi]["p"]
                tip = (p[-1] if not rev else p[0]) if at_end else (p[0] if not rev else p[-1])
                for (j, side) in ends.get(key(tip), []):
                    if j in used:
                        continue
                    used.add(j)
                    if at_end:
                        run.append((j, side == 1))
                    else:
                        run.insert(0, (j, side == 0))
                    grew = True
                    break
                if grew:
                    break
        chains.append(run)
    return chains


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    segs = [s for s in (d.get("monorail") or [])
            if isinstance(s, dict) and isinstance(s.get("p"), list)
            and len(s["p"]) > 1]
    if not segs:
        print("  no monorail in this scene")
        return
    g = Ground(d["terrain"])

    before = []
    for s in segs:
        lift = 5 + 2.6 * max(1, s.get("lyr") or 1)
        before.extend(lift for _ in s["p"])

    chains = chain_ways(segs)
    print(f"== monorail {a.id}: {len(segs)} ways -> {len(chains)} continuous "
          f"run{'s' if len(chains) != 1 else ''}")

    for run in chains:
        # flatten the chain to one polyline, remembering where each way's
        # points live so the profile can be handed back
        pts, owner = [], []
        for (wi, rev) in run:
            p = list(segs[wi]["p"])
            if rev:
                p.reverse()
            start = 0
            if pts and dist(pts[-1], p[0]) < 1.5:
                start = 1                      # shared node, do not repeat it
            for k in range(start, len(p)):
                pts.append(p[k])
                owner.append((wi, len(p) - 1 - k if rev else k))

        if len(pts) < 2:
            continue
        s_at = [0.0]
        for i in range(1, len(pts)):
            s_at.append(s_at[-1] + dist(pts[i - 1], pts[i]))
        run_len = s_at[-1]

        gr = [g.at(x, z) for (x, z) in pts]
        ys = [q + LIFT for q in gr]

        # smooth along arc length, across way boundaries
        for _ in range(SMOOTH_PASSES):
            out = list(ys)
            for i in range(len(ys)):
                lo = hi = i
                while lo > 0 and s_at[i] - s_at[lo - 1] < SMOOTH_M / 2:
                    lo -= 1
                while hi < len(ys) - 1 and s_at[hi + 1] - s_at[i] < SMOOTH_M / 2:
                    hi += 1
                out[i] = sum(ys[lo:hi + 1]) / (hi - lo + 1)
            ys = out

        # never closer to the ground than MIN_CLEAR, then re-smooth lightly so
        # a single raised point does not become a kink
        for _ in range(3):
            for i in range(len(ys)):
                ys[i] = max(ys[i], gr[i] + MIN_CLEAR)
            for i in range(1, len(ys) - 1):
                ys[i] = (ys[i - 1] + 2 * ys[i] + ys[i + 1]) / 4

        # grade limit, swept both ways so neither end wins
        for _ in range(4):
            for i in range(1, len(ys)):
                dsx = max(0.5, s_at[i] - s_at[i - 1])
                ys[i] = min(ys[i], ys[i - 1] + MAX_GRADE * dsx)
            for i in range(len(ys) - 2, -1, -1):
                dsx = max(0.5, s_at[i + 1] - s_at[i])
                ys[i] = min(ys[i], ys[i + 1] + MAX_GRADE * dsx)
            for i in range(len(ys)):
                ys[i] = max(ys[i], gr[i] + MIN_CLEAR)

        per_way = defaultdict(dict)
        for i, (wi, k) in enumerate(owner):
            per_way[wi][k] = ys[i]
        for wi, m in per_way.items():
            n = len(segs[wi]["p"])
            got = [m.get(k) for k in range(n)]
            # a shared node was skipped above; fill it from its neighbour
            for k in range(n):
                if got[k] is None:
                    got[k] = (got[k - 1] if k else None) or next(
                        (v for v in got if v is not None), gr[0] + LIFT)
            segs[wi]["ys"] = [round(v, 2) for v in got]

        clr = [y - q for y, q in zip(ys, gr)]
        grade = max((abs(ys[i] - ys[i - 1]) / max(0.5, s_at[i] - s_at[i - 1])
                     for i in range(1, len(ys))), default=0)
        print(f"   run {run_len:7.0f} m, {len(pts):3d} points   "
              f"clearance {min(clr):5.1f}..{max(clr):5.1f} m   "
              f"steepest grade {100*grade:.1f}%")

    now = [y for s in segs for y in s.get("ys", [])]
    if now:
        print(f"   was: per-way lift from the layer tag, "
              f"{min(before):.1f}..{max(before):.1f} m over ground, stepping "
              f"between ways")
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
