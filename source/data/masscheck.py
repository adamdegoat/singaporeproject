"""DEGENERATE BUILDING MASSES — a data check for the class that produced four
black slabs hanging in the sky over Hotel Michael.

That defect was found by RENDERING the place, not by any check, and it had been
in the world for as long as RWS had. It is a data shape, not a geometry
accident, so it is cheap to look for: a mass whose top is below its own base, a
part that starts above everything under it, a footprint with no area, a height
that is absurd for the island.

This is REPORT-ONLY on purpose. Sentosa's real building stock is odd in places
(a 3.5m villa, a 68m part) and a gate here would either block honest data or be
tuned until it measured nothing — which is how four checks in this repo passed
by measuring nothing in a single night. It prints, a human reads it.

Run:  python3 data/masscheck.py [sentosa]
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ID = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
d = json.load(open(os.path.join(HERE, f"{ID}.json")))
B = [b for b in d.get("buildings", []) if b.get("p") and len(b["p"]) >= 3]

# The island's own surveyed median is 6.8m and its tallest surveyed stock is
# about 68m. A mass far outside that is either a bad tag or a bad assumption.
TALL = 80.0


def area(p):
    a = 0.0
    for i in range(len(p)):
        x1, z1 = p[i]
        x2, z2 = p[(i + 1) % len(p)]
        a += x1 * z2 - x2 * z1
    return abs(a) / 2


def centroid(p):
    return (sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p))


def in_ring(x, z, p):
    c = False
    n = len(p)
    for i in range(n):
        x1, z1 = p[i]
        x2, z2 = p[i - 1]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / ((z2 - z1) or 1e-9) + x1:
            c = not c
    return c


def seg_hit(a, b, c, e):
    def side(p, q, r):
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    d1, d2 = side(c, e, a), side(c, e, b)
    d3, d4 = side(a, b, c), side(a, b, e)
    return ((d1 > 0) != (d2 > 0)) and ((d3 > 0) != (d4 > 0))


findings = {}


def add(kind, msg):
    findings.setdefault(kind, []).append(msg)


hosts = [b for b in B if not (b.get("mh") and b["mh"] > 1) and len(b["p"]) >= 4]

for b in B:
    p = b["p"]
    n = b.get("n") or "(unnamed)"
    cx, cz = centroid(p)
    where = f"{n[:30]:32} at {cx:7.0f},{cz:7.0f}"
    h = b.get("h")
    mh = b.get("mh")

    if h is None or h <= 0:
        add("no height", f"  h={h}  {where}")
    elif h > TALL:
        add("taller than any surveyed stock on the island",
            f"  h={h:6.1f} hs={b.get('hs')}  {where}")

    if mh and mh > 1:
        if h is not None and mh >= h - 0.5:
            add("TOP BELOW ITS OWN BASE (a mass with no volume)",
                f"  mh={mh:6.1f} > h={h:6.1f}  {where}")
        else:
            top = None
            for q in hosts:
                if q is b or not in_ring(cx, cz, q["p"]):
                    continue
                if top is None or (q.get("h") or 0) > top:
                    top = q.get("h") or 0
            if top is None:
                add("part with nothing under it (no host footprint)",
                    f"  mh={mh:6.1f} h={h:6.1f}  {where}")
            elif mh > top + 0.5:
                add("part FLOATING clear of its host",
                    f"  mh={mh:6.1f} host top={top:6.1f} gap={mh - top:5.1f}m  {where}")

    a = area(p)
    if a < 4:
        add("footprint with no area", f"  {a:6.1f} m2  {where}")

    # a self-crossing ring extrudes into a bow tie; the repo has repaired 16 of
    # these before, so it is worth naming when a new one arrives
    m = len(p)
    if 4 <= m <= 40:
        crossed = False
        for i in range(m):
            for j in range(i + 2, m):
                if i == 0 and j == m - 1:
                    continue
                if seg_hit(p[i], p[(i + 1) % m], p[j], p[(j + 1) % m]):
                    crossed = True
                    break
            if crossed:
                break
        if crossed:
            add("self-crossing footprint ring", f"  {m} pts  {where}")

print(f"== masscheck {ID}: {len(B)} buildings")
if not findings:
    print("   nothing to report")
for kind, rows in sorted(findings.items(), key=lambda kv: -len(kv[1])):
    print(f"\n  {len(rows)}x  {kind}")
    for r in rows[:12]:
        print(r)
    if len(rows) > 12:
        print(f"    ... and {len(rows) - 12} more")
print("\n   report-only — read it, do not gate on it")
