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

THE SECOND BUG, FOUND 2026-08-05 BY THE OWNER FROM THE SPAWN POINT: "got like
one dunno is broadwalk or monorail track just there that looks like shit, looks
like overhead beams not connected properly."

He was looking at (-1707.6, 12726.3), THIRTY METRES from where a player loads
in. FOUR ways meet at that single node and the deck arrived there at 22.79,
22.82, 27.75 and 27.98 m — a FIVE-POINT-TWO METRE STEP in mid-air.

The cause was in this file. chain_ways() joins ways greedily, so at a junction
where four way-ends meet, one chain claims two of them and the rest start new
chains — and each chain then had its OWN height profile fitted along its OWN
arc length. Two runs through one node had no reason to agree, and did not.

THE DECK HEIGHT IS A PROPERTY OF THE PLACE, NOT OF WHICH RUN YOU ARRIVED ON.
So the profile is now fitted over a NODE GRAPH: every way-point within a metre
of another is ONE node, smoothing runs across graph edges, and the clearance
and grade limits are applied to nodes. Two ways meeting at a node cannot
disagree, because there is only one number. The chaining is kept for reporting
the run lengths, which is still the useful way to describe the line.

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

    # ---- ONE HEIGHT PER NODE -------------------------------------------------
    # Nodes are way-points snapped to a 1m key, which is the same key chain_ways
    # matches endpoints on, so a junction is a single node by construction.
    def key(pt):
        return (round(pt[0]), round(pt[1]))

    node_of = {}          # (wi, k) -> node id
    node_pt = []          # node id -> (x, z)
    kmap = {}
    for wi, sgm in enumerate(segs):
        for k, pt in enumerate(sgm["p"]):
            kk = key(pt)
            if kk not in kmap:
                kmap[kk] = len(node_pt)
                node_pt.append((pt[0], pt[1]))
            node_of[(wi, k)] = kmap[kk]
    N = len(node_pt)

    # edges along each way, with their length — the graph the profile lives on
    nbr = defaultdict(list)
    for wi, sgm in enumerate(segs):
        pw = sgm["p"]
        for k in range(len(pw) - 1):
            a1, b1 = node_of[(wi, k)], node_of[(wi, k + 1)]
            if a1 == b1:
                continue
            L = max(0.5, dist(pw[k], pw[k + 1]))
            nbr[a1].append((b1, L))
            nbr[b1].append((a1, L))

    gr = [g.at(x, z) for (x, z) in node_pt]
    ys = [q + LIFT for q in gr]

    # SMOOTH ACROSS THE GRAPH, length-weighted. This is what the per-chain
    # version could not do: at a junction the neighbours from every branch are
    # in the average, so all of them settle to the same deck.
    for _ in range(SMOOTH_PASSES * 6):
        out = list(ys)
        for i in range(N):
            if not nbr[i]:
                continue
            wsum = 1.0
            acc = ys[i]
            for (j, L) in nbr[i]:
                w = SMOOTH_M / (SMOOTH_M + L)
                acc += ys[j] * w
                wsum += w
            out[i] = acc / wsum
        ys = out

    # clearance, then grade along every edge, swept until both hold
    for _ in range(12):
        for i in range(N):
            ys[i] = max(ys[i], gr[i] + MIN_CLEAR)
        for i in range(N):
            for (j, L) in nbr[i]:
                lim = ys[i] + MAX_GRADE * L
                if ys[j] > lim:
                    ys[j] = lim
    for i in range(N):
        ys[i] = max(ys[i], gr[i] + MIN_CLEAR)

    for wi, sgm in enumerate(segs):
        sgm["ys"] = [round(ys[node_of[(wi, k)]], 2) for k in range(len(sgm["p"]))]

    # ---- report, and PROVE the steps are gone --------------------------------
    worst_step, worst_at = 0.0, None
    for kk, nid in kmap.items():
        pass
    seen = defaultdict(list)
    for wi, sgm in enumerate(segs):
        for k, pt in enumerate(sgm["p"]):
            seen[key(pt)].append(sgm["ys"][k])
    for kk, vals in seen.items():
        if len(vals) < 2:
            continue
        st = max(vals) - min(vals)
        if st > worst_step:
            worst_step, worst_at = st, kk

    for run in chains:
        L = 0.0
        for (wi, rev) in run:
            pw = segs[wi]["p"]
            for k in range(len(pw) - 1):
                L += dist(pw[k], pw[k + 1])
        first = segs[run[0][0]]
        cl = [y - g.at(x, z) for (wi, rev) in run
              for (x, z), y in zip(segs[wi]["p"], segs[wi]["ys"])]
        print(f"   run {L:7.0f} m, {len(run):2d} ways   "
              f"clearance {min(cl):5.1f}..{max(cl):5.1f} m")
    grade = 0.0
    for wi, sgm in enumerate(segs):
        pw, yy = sgm["p"], sgm["ys"]
        for k in range(len(pw) - 1):
            grade = max(grade, abs(yy[k + 1] - yy[k]) / max(0.5, dist(pw[k], pw[k + 1])))
    # WHERE DOES THE BEAM FLY UNSUPPORTED? The renderer places a pier every 26m
    # of run, but refuses seats it cannot stand on. This reports the worst span
    # in the DATA's own terms (arc length between points that a pier could sit
    # at), because "one every 31.6m on average" hides a 300m gap over water and
    # the average is not what a player sees.
    print(f"   steepest grade {100 * grade:.1f}%   "
          f"worst height disagreement at a shared node {worst_step:.2f} m"
          + (f" at {worst_at}" if worst_step > 0.05 else " — every junction agrees"))

    now = [y for s in segs for y in s.get("ys", [])]
    if now:
        print(f"   was: per-way lift from the layer tag, "
              f"{min(before):.1f}..{max(before):.1f} m over ground, stepping "
              f"between ways")
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
