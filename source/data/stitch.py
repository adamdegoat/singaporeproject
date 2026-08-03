"""STITCH — join the paths the map forgot to join.

  "all the roads must make sense, not like a road that will cut off halfway"

WHAT THIS FIXES, MEASURED. After the island clip, Sentosa's walkable network
was 95.2% one piece, with 4.83 km stranded in 66 separate components. Then the
gaps were measured, and the shape of the problem turned out to be nothing like
"places you cannot get to":

    gap <= 15m   58 components   5,648 m of network
    gap <= 40m    9 components     644 m
    gap >  80m    1 component      170 m

FIFTY-EIGHT OF SIXTY-SIX ARE WITHIN FIFTEEN METRES. The 1,751m Imbiah trail
network — the single biggest stranded piece on the island — sits 5.4m from the
road. These are not places the map says you cannot reach. They are places where
OSM drew a footway up to a road and never shared a node with it, which is
extremely common and completely invisible until something asks the question.

So this does not invent access. It draws the last few metres that the surveyor
left out, and it draws them under rules that can be checked:

  * A connector is only drawn to close a gap of at most STITCH_MAX (25m).
    Beyond that the map is not missing a join, it is saying something, and a
    guess would be an invention. Those are printed and left alone.
  * A connector may not cross a building footprint or open water. Sampled at
    1m; one sample inside either and it is refused and reported.
  * A connector inherits the kind of the way it rescues, so a stitched trail
    stays a trail and is dressed like one.
  * Every connector is tagged `"stitch": 1`, so it can be counted, drawn
    differently, or ripped out entirely by one grep.

The loop runs until nothing more joins, because merging one component often
brings a second within reach of the first.

THIS IS THE AUTHORED LAYER DOING ITS JOB. Under the working rule in
SENTOSA.md the network's SHAPE is truth and comes from the map; the last five
metres of paving between a trail and a kerb is detail, and detail is designed.
Drawing it is not a departure from the real island — walk Sentosa and the trail
does meet the road.

Run:  python3 data/stitch.py sentosa
      python3 data/stitch.py sentosa --dry-run
"""
import argparse
import json
import math
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import navcheck as nc  # noqa: E402  (same directory, deliberate)

# Past this a gap is a statement, not an omission.
STITCH_MAX = 25.0
# Connectors below this are noise: the join tolerance already covers them.
STITCH_MIN = 0.6
# A stitched link is a path, and paths on Sentosa are ~2.5m.
STITCH_WIDTH = 2.5


def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


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


class Blockers:
    """Buildings and open water: a connector may not be drawn through either."""

    def __init__(self, d):
        self.cell = 100.0
        self.grid = defaultdict(list)
        n = 0
        for layer in ("buildings", "water"):
            for o in (d.get(layer) or []):
                p = nc.geom(o)
                if not p or len(p) < 3:
                    continue
                xs = [q[0] for q in p]
                ys = [q[1] for q in p]
                box = (min(xs), min(ys), max(xs), max(ys))
                for gx in range(int(box[0] // self.cell), int(box[2] // self.cell) + 1):
                    for gy in range(int(box[1] // self.cell), int(box[3] // self.cell) + 1):
                        self.grid[(gx, gy)].append((box, p))
                n += 1
        self.n = n

    def hits(self, x, y):
        for (box, p) in self.grid.get((int(x // self.cell), int(y // self.cell)), ()):
            if box[0] <= x <= box[2] and box[1] <= y <= box[3] and poly_contains(p, x, y):
                return True
        return False

    def crosses(self, a, b):
        L = dist(a, b)
        steps = max(2, int(L) + 1)
        for i in range(steps + 1):
            t = i / steps
            if self.hits(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t):
                return True
        return False


def components(ways):
    find, _ = nc.build_graph(ways)
    comp = defaultdict(list)
    for i, w in enumerate(ways):
        comp[find(i)].append(i)
    return comp


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    blockers = Blockers(d)
    print(f"== stitch {a.id}   ({blockers.n} building/water blockers)")

    added, refused, unreachable = [], [], []
    seen_bad = set()   # a component refused in one round is refused in all of them

    for round_no in range(1, 12):
        ways = nc.load_ways(d)
        comp = components(ways)
        groups = sorted(comp.values(),
                        key=lambda idxs: -sum(ways[i]["len"] for i in idxs))
        if len(groups) < 2:
            break
        main_idx = set(groups[0])
        main_pts = [q for i in main_idx for q in ways[i]["p"]]

        cell = 40.0
        grid = defaultdict(list)
        for q in main_pts:
            grid[(int(q[0] // cell), int(q[1] // cell))].append(q)

        def candidates(pt):
            """EVERY main-network point within reach, not just the closest one.

            Taking only the nearest pair refused twelve otherwise-fine joins:
            a path that ends beside a building has its nearest road point on
            the far side of the wall, so the one candidate offered was always
            the blocked one while a clear line existed a few metres along."""
            out = []
            cx, cy = int(pt[0] // cell), int(pt[1] // cell)
            reach = int(STITCH_MAX // cell) + 1
            for gx in range(cx - reach, cx + reach + 1):
                for gy in range(cy - reach, cy + reach + 1):
                    for q in grid.get((gx, gy), ()):
                        dd = dist(pt, q)
                        if dd <= STITCH_MAX:
                            out.append((dd, q))
            return out

        joined_any = False
        for idxs in groups[1:]:
            names = {ways[i]["n"] for i in idxs if ways[i]["n"]}
            if any(nc.is_exempt(n) for n in names):
                continue
            pairs = []
            for i in idxs:
                for q in ways[i]["p"]:
                    for (dd, mq) in candidates(q):
                        pairs.append((dd, q, mq))
            pairs.sort(key=lambda t: t[0])
            total = sum(ways[i]["len"] for i in idxs)
            label = (sorted(names)[0] if names else "(unnamed)")
            key = (round(min((w["p"][0][0] for w in (ways[i] for i in idxs))), 0),
                   round(min((w["p"][0][1] for w in (ways[i] for i in idxs))), 0))
            if not pairs:
                if key not in seen_bad:
                    seen_bad.add(key)
                    anchor = ways[idxs[0]]["p"][0]
                    unreachable.append((total, anchor, label))
                continue
            best, ba, bb = None, None, None
            for (dd, q, mq) in pairs[:400]:
                if dd < STITCH_MIN:
                    best = None
                    break
                if not blockers.crosses(q, mq):
                    best, ba, bb = dd, q, mq
                    break
            if best is None:
                if ba is None and key not in seen_bad:
                    seen_bad.add(key)
                    refused.append((total, pairs[0][0], pairs[0][1], label))
                continue
            kinds = defaultdict(float)
            for i in idxs:
                kinds[ways[i]["k"]] += ways[i]["len"]
            kind = max(kinds.items(), key=lambda kv: kv[1])[0]
            if kind in ("steps", "bridges"):
                kind = "footway"
            d.setdefault("roads", []).append({
                "p": [[round(ba[0], 1), round(ba[1], 1)],
                      [round(bb[0], 1), round(bb[1], 1)]],
                "k": kind, "w": STITCH_WIDTH, "stitch": 1,
            })
            added.append((total, best, ba, bb, kind, label))
            joined_any = True
        if not joined_any:
            break

    print(f"   connectors drawn   {len(added)}")
    for (total, gap, ba, bb, kind, label) in sorted(added, key=lambda r: -r[0])[:12]:
        print(f"     {gap:5.1f} m link at {ba[0]:7.0f},{ba[1]:7.0f}  "
              f"rejoins {total:7.0f} m of {kind:<10} {label}")
    if len(added) > 12:
        print(f"     ... {len(added)-12} more")

    if refused:
        print(f"   refused, would cross a building or water: {len(refused)}")
        for (total, gap, ba, label) in sorted(refused, key=lambda r: -r[0])[:6]:
            print(f"     {gap:5.1f} m at {ba[0]:7.0f},{ba[1]:7.0f}  "
                  f"{total:7.0f} m stranded  {label}")
    if unreachable:
        print(f"   left alone, gap over {STITCH_MAX:.0f}m: {len(unreachable)}")
        for (total, ba, label) in sorted(unreachable, key=lambda r: -r[0])[:6]:
            print(f"     at {ba[0]:7.0f},{ba[1]:7.0f}  "
                  f"{total:7.0f} m stranded  {label}")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    if added:
        json.dump(d, open(path, "w"), separators=(",", ":"))
        print(f"   written: {path}")


if __name__ == "__main__":
    main()
