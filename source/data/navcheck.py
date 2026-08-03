"""NAVCHECK — N1 and N2, the two gates the owner actually asked for.

  "all the roads must make sense, not like a road that will cut off halfway"
  "I don't want people to go in the map and say oh what the fuck is this place"

N1  CONNECTED    share of the walkable network not reachable from spawn
N2  MID-AIR      way ends that are not a junction and not a real place to stop

WHY THESE DID NOT EXIST BEFORE. The old standard had T2, "road network islands
unreachable from the main axis", as a MAJOR with a budget of 5% — and Sentosa's
budget had been ratcheted to 30 because that is what it happened to measure. So
the single defect the owner complains about most was formally within budget and
nothing ever had to fix it. N1 is a BLOCKER.

THE GRAPH IS THE WALKABLE WORLD, NOT `roads`. Three traps, each of which makes
a fine network look broken:

  1. STEPS ARE A SEPARATE LAYER. 31 of Sentosa's connections are stairs, and a
     graph built from `roads` alone reports the top and bottom of every flight
     as two unreachable islands.
  2. SO ARE PIERS AND BRIDGES. The boardwalk decks are how you cross water.
  3. OSM DOES NOT ALWAYS SHARE A NODE. A footway drawn to within 2m of the kerb
     is walkable in the game and disconnected in a strict graph. The join
     tolerance is 4m, which is a stride, and every join it makes is counted so
     the number can be argued with.

A check that reports defects that are not there is worse than no check, because
the fix for a phantom is a change to something that was right.

Run:  python3 data/navcheck.py sentosa
      python3 data/navcheck.py sentosa -v     (list every orphan)
"""
import argparse
import json
import math
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

# A stride. Two ways whose ends are this close are walkable between in the game
# even when OSM never shared a node.
JOIN_TOL = 4.0
# Layers a player can walk along. `bridges` are decks you cross on.
#
# `piers` IS DELIBERATELY NOT HERE. It was, for one run, and it produced the
# five largest "unreachable islands" on the map: 2,535m, 867m, 849m, 580m and
# 461m, every one of them a single unnamed way in Sentosa Cove. Those are quay
# edges and breakwaters, not jetties — waterside structure that is correctly
# not joined to the footpath network. Counting them as walkable would have sent
# the next hours into connecting a seawall to a road.
WALKABLE = ["roads", "steps", "bridges"]
# An orphan smaller than this is a fragment, not a network; still counted, but
# listed separately so the headline number is about places, not slivers.
FRAGMENT = 60.0

# Disconnected ON PURPOSE. Each needs a reason, not a budget. An exemption
# without a reason is a bug being hidden.
EXEMPT = [
    ("Brani", "Pulau Brani is a container terminal across the water and is out "
              "of scope: the map is Sentosa island."),
    ("Keppel Terminal", "mainland port, out of scope."),
    ("Sentosa Boardwalk", "the pedestrian link to HarbourFront leaves the "
                          "island; it is drawn to the water and stops there."),
]

# N2: a way end is fine if it stops somewhere a way is allowed to stop.
COASTAL_TOL = 45.0      # ends at the sea
BBOX_TOL = 35.0         # ends at the edge of the map


def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def seglen(p):
    return sum(dist(p[i], p[i + 1]) for i in range(len(p) - 1))


def geom(o):
    src = o.get("p") if isinstance(o, dict) else o
    if not isinstance(src, (list, tuple)) or not src:
        return None
    if isinstance(src[0], (int, float)):
        return None
    pts = [(float(q[0]), float(q[1])) for q in src
           if isinstance(q, (list, tuple)) and len(q) >= 2]
    return pts if len(pts) > 1 else None


def centroid_of(p):
    return (sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p))


def radius_of(p):
    cx, cy = centroid_of(p)
    return max(dist((cx, cy), q) for q in p)


def load_ways(d):
    out = []
    for layer in WALKABLE:
        for o in (d.get(layer) or []):
            p = geom(o)
            if not p:
                continue
            out.append({
                "layer": layer,
                "p": p,
                # some layers carry a numeric id in "n"; str() so a name test
                # never explodes on one
                "n": str((o.get("n") if isinstance(o, dict) else None) or ""),
                "k": str((o.get("k") if isinstance(o, dict) else None) or layer),
                "len": seglen(p),
            })
    return out


def build_graph(ways):
    """Union-find over shared nodes, then over ends within JOIN_TOL."""
    par = list(range(len(ways)))

    def find(x):
        while par[x] != x:
            par[x] = par[par[x]]
            x = par[x]
        return x

    def union(a, b):
        a, b = find(a), find(b)
        if a != b:
            par[a] = b
            return True
        return False

    # exact / near-exact shared vertices, on a 1.5m key
    node = defaultdict(list)
    for i, w in enumerate(ways):
        for q in w["p"]:
            node[(round(q[0] / 1.5), round(q[1] / 1.5))].append(i)
    for lst in node.values():
        for j in range(1, len(lst)):
            union(lst[0], lst[j])

    # ends that come within a stride of any other way's vertex
    cell = 20.0
    grid = defaultdict(list)
    for i, w in enumerate(ways):
        for q in w["p"]:
            grid[(int(q[0] // cell), int(q[1] // cell))].append((i, q))
    stitched = 0
    for i, w in enumerate(ways):
        for end in (w["p"][0], w["p"][-1]):
            cx, cy = int(end[0] // cell), int(end[1] // cell)
            for gx in range(cx - 1, cx + 2):
                for gy in range(cy - 1, cy + 2):
                    for (j, q) in grid.get((gx, gy), ()):
                        if j != i and dist(end, q) <= JOIN_TOL:
                            if union(i, j):
                                stitched += 1
    return find, stitched


def is_exempt(name):
    for (needle, reason) in EXEMPT:
        if needle.lower() in (name or "").lower():
            return reason
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()

    d = json.load(open(os.path.join(HERE, f"{a.id}.json")))
    ways = load_ways(d)
    find, stitched = build_graph(ways)

    comp = defaultdict(lambda: {"len": 0.0, "ways": [], "names": set()})
    for i, w in enumerate(ways):
        c = comp[find(i)]
        c["len"] += w["len"]
        c["ways"].append(w)
        if w["n"]:
            c["names"].add(w["n"])
    groups = sorted(comp.values(), key=lambda c: -c["len"])
    total = sum(c["len"] for c in groups)
    main_c = groups[0]

    orphans, exempted, fragments = [], [], []
    for c in groups[1:]:
        reason = None
        for n in c["names"]:
            reason = reason or is_exempt(n)
        if reason:
            exempted.append((c, reason))
        elif c["len"] < FRAGMENT:
            fragments.append(c)
        else:
            orphans.append(c)

    lost = sum(c["len"] for c in orphans) + sum(c["len"] for c in fragments)
    n1 = 100.0 * lost / total if total else 0.0

    print(f"== navcheck {a.id}")
    print(f"   walkable network   {total/1000:.1f} km over {len(ways)} ways "
          f"({', '.join(WALKABLE)})")
    print(f"   joined within {JOIN_TOL:.0f}m where OSM shared no node: {stitched}")
    print(f"   main network       {main_c['len']/1000:.1f} km  "
          f"= {100*main_c['len']/total:.1f}%")
    for (c, reason) in exempted:
        nm = sorted(c["names"])[0] if c["names"] else "(unnamed)"
        print(f"   excused {c['len']/1000:5.2f} km  {nm}: {reason}")
    print()
    print(f"   N1 unreachable     {n1:.2f}%   "
          f"({lost/1000:.2f} km in {len(orphans)} islands "
          f"+ {len(fragments)} fragments under {FRAGMENT:.0f}m)")

    if a.verbose or orphans:
        for c in orphans[:20]:
            xs = [q[0] for w in c["ways"] for q in w["p"]]
            ys = [q[1] for w in c["ways"] for q in w["p"]]
            nm = ", ".join(sorted(c["names"])[:3]) or "(unnamed)"
            kinds = defaultdict(float)
            for w in c["ways"]:
                kinds[w["k"]] += w["len"]
            km = ", ".join(f"{k} {int(v)}m" for k, v in
                           sorted(kinds.items(), key=lambda x: -x[1])[:3])
            print(f"     {c['len']:7.0f} m  {len(c['ways']):3d} ways  "
                  f"at {sum(xs)/len(xs):.0f},{sum(ys)/len(ys):.0f}  {nm}  [{km}]")

    # N2 — ends in mid-air.
    coast = []
    for w in (d.get("coast") or []):
        p = geom(w)
        if p:
            coast.extend(p)
    xs = [q[0] for w in ways for q in w["p"]]
    ys = [q[1] for w in ways for q in w["p"]]
    bx0, bx1, by0, by1 = min(xs), max(xs), min(ys), max(ys)

    ccell = 100.0
    cgrid = defaultdict(list)
    for q in coast:
        cgrid[(int(q[0] // ccell), int(q[1] // ccell))].append(q)

    # A JUNCTION IS AN END MEETING ANY VERTEX, NOT ANOTHER END. The first
    # version of this counted how many way ENDS shared a node, which reports
    # every T-junction in the world as broken: a footway that runs into the
    # middle of a road meets a vertex the road passes straight through, so
    # there is only one end there. It read 1,037 mid-air ends on a network
    # whose real figure is a small fraction of that.
    vcell = 20.0
    vgrid = defaultdict(list)
    for i, w in enumerate(ways):
        for q in w["p"]:
            vgrid[(int(q[0] // vcell), int(q[1] // vcell))].append((i, q))

    def joins_something(idx, e):
        cx, cy = int(e[0] // vcell), int(e[1] // vcell)
        for gx in range(cx - 1, cx + 2):
            for gy in range(cy - 1, cy + 2):
                for (j, q) in vgrid.get((gx, gy), ()):
                    if j != idx and dist(e, q) <= JOIN_TOL:
                        return True
        return False

    # A PATH IS ALLOWED TO END SOMEWHERE. Not every dead end is a defect: a
    # footway that stops at a door, on the sand, or at a lookout is doing its
    # job. Only an end that stops at NOTHING is the thing the owner means by
    # "a road that cuts off halfway". Each of these is a place, so each is a
    # reason, not a budget.
    # MEASURED TO THE OUTLINE, NOT THE CENTRE. The first version used the
    # centroid plus the polygon's radius, which on a resort block 160m across
    # throws a 110m bubble of forgiveness around it and excused 387 of 390
    # ends. An outline is the thing a path arrives at, so the vertices are the
    # stoppers and the tolerance is a flat walk-up distance.
    stoppers = []                            # (x, y, tolerance)
    for b in (d.get("buildings") or []):
        p = geom(b)
        if p:
            stoppers.extend((q[0], q[1], 22.0) for q in p)
    for g in (d.get("green") or []):
        if isinstance(g, dict) and g.get("k") in ("sand", "pitch", "golf"):
            p = geom(g)
            if p:
                stoppers.extend((q[0], q[1], 30.0) for q in p)
    for lnd in (d.get("land") or []):
        if isinstance(lnd, dict) and lnd.get("k") in ("parking", "plaza"):
            p = geom(lnd)
            if p:
                stoppers.extend((q[0], q[1], 22.0) for q in p)
    for at in (d.get("attractions") or []):
        src = at.get("p") if isinstance(at, dict) else None
        if isinstance(src, (list, tuple)) and src and isinstance(src[0], (int, float)):
            stoppers.append((float(src[0]), float(src[1]), 35.0))
    for pf in (d.get("parkfurn") or []):
        src = pf.get("p") if isinstance(pf, dict) else None
        if isinstance(src, (list, tuple)) and src and isinstance(src[0], (int, float)):
            stoppers.append((float(src[0]), float(src[1]), 25.0))

    scell = 120.0
    sgrid = defaultdict(list)
    for (sx, sy, tol) in stoppers:
        r = int(tol // scell) + 1
        for gx in range(int(sx // scell) - r, int(sx // scell) + r + 1):
            for gy in range(int(sy // scell) - r, int(sy // scell) + r + 1):
                sgrid[(gx, gy)].append((sx, sy, tol))

    # INSIDE A GOLF COURSE, A PATH ENDS WHERE THE HOLE IS. Sentosa Golf Club's
    # Serapong and Tanjong courses are threaded with cart paths that run to a
    # tee or a green and stop, which is what cart paths do — measured, they
    # were most of the mid-air ends on the island and every one of them is
    # correct. Tested by CONTAINMENT, not by a distance bubble: a 60m bubble
    # around a fairway would also excuse the roads beside it.
    def polys_of(layer, kinds):
        out = []
        for o in (d.get(layer) or []):
            if isinstance(o, dict) and o.get("k") in kinds:
                p = geom(o)
                if p and len(p) > 2:
                    xs = [q[0] for q in p]
                    ys = [q[1] for q in p]
                    out.append(((min(xs), min(ys), max(xs), max(ys)), p))
        return out

    enclosures = polys_of("green", ("golf", "pitch"))

    def inside_enclosure(e):
        for (box, p) in enclosures:
            if not (box[0] <= e[0] <= box[2] and box[1] <= e[1] <= box[3]):
                continue
            inside = False
            j = len(p) - 1
            for i in range(len(p)):
                xi, yi = p[i]
                xj, yj = p[j]
                if (yi > e[1]) != (yj > e[1]):
                    if e[0] < (xj - xi) * (e[1] - yi) / (yj - yi) + xi:
                        inside = not inside
                j = i
            if inside:
                return True
        return False

    def stops_somewhere(e):
        for (sx, sy, tol) in sgrid.get((int(e[0] // scell), int(e[1] // scell)), ()):
            if dist(e, (sx, sy)) <= tol:
                return True
        return inside_enclosure(e)

    midair = []
    for i, w in enumerate(ways):
        for e in (w["p"][0], w["p"][-1]):
            if joins_something(i, e):
                continue                      # meets another way: a junction
            if (e[0] - bx0 < BBOX_TOL or bx1 - e[0] < BBOX_TOL
                    or e[1] - by0 < BBOX_TOL or by1 - e[1] < BBOX_TOL):
                continue                      # stops at the edge of the map
            cx, cy = int(e[0] // ccell), int(e[1] // ccell)
            near = False
            for gx in range(cx - 1, cx + 2):
                for gy in range(cy - 1, cy + 2):
                    for q in cgrid.get((gx, gy), ()):
                        if dist(e, q) <= COASTAL_TOL:
                            near = True
                            break
                    if near:
                        break
                if near:
                    break
            if near:
                continue                      # stops at the sea
            if is_exempt(w["n"]):
                continue
            if stops_somewhere(e):
                continue
            midair.append((w, e))

    print(f"   N2 ends in mid-air {len(midair)}")
    return verdict(a.id, n1, len(midair))


# BUDGETS. N1 is a target with a real number behind it; N2 is a ratchet, set to
# the count on the day it was written, and it may go down and never up. Both
# are BLOCKERS — this is the one family of checks that stops a deploy, because
# it is the one the player runs into. See SENTOSA.md.
BUDGETS = {
    # id:      N1 % unreachable,  N2 ends in mid-air
    "sentosa": (3.0, 35),
}


def verdict(scene, n1, n2):
    want = BUDGETS.get(scene)
    if not want:
        print(f"   (no budget for {scene} — reporting only)")
        return 0
    bad = []
    if n1 > want[0]:
        bad.append(f"N1 {n1:.2f}% over {want[0]:.1f}%")
    if n2 > want[1]:
        bad.append(f"N2 {n2} over {want[1]}")
    if bad:
        print(f"   FAIL  {'; '.join(bad)}")
        return 1
    print(f"   PASS  N1 {n1:.2f}%/{want[0]:.1f}%   N2 {n2}/{want[1]}")
    return 0
    if a.verbose:
        for (w, e) in midair[:40]:
            print(f"     {e[0]:8.0f},{e[1]:8.0f}  {w['k']:<12} "
                  f"{int(w['len']):5d} m  {w['n'] or '(unnamed)'}")
    elif midair:
        for (w, e) in sorted(midair, key=lambda t: -t[0]["len"])[:8]:
            print(f"     {e[0]:8.0f},{e[1]:8.0f}  {w['k']:<12} "
                  f"{int(w['len']):5d} m  {w['n'] or '(unnamed)'}")
        if len(midair) > 8:
            print(f"     ... {len(midair)-8} more (-v for all)")


if __name__ == "__main__":
    sys.exit(main())
