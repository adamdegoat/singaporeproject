#!/usr/bin/env python3
"""THE PALM AVENUE THE SPAWN HEADING WAS CHOSEN FOR — and which was not there.

`research/palawan-spawn.md`, its ledger row 6:

    `trees`: zero entries within 300 m of spawn (3,637 island-wide)
    "the spawn heading was chosen because it 'looks down an avenue of palms'.
     THERE ARE NO PALMS IN THE DATA THERE."

Measured again here before writing anything: **0 trees within 300 m of the spawn
point.** `main.js` picks the opening heading to look down an avenue that does not
exist, so the first thing the owner sees is bare sand.

AUTHORED, AND IT HAS TO BE — the research is explicit that "palms standing out
in the open sand have no data source at all and must be authored". OSM maps no
individual tree here. What IS measured, from satellite: **a row of coconut palms
standing in the sand, roughly 12-15 trunks across 90 m of frontage, so 6-9 m
spacing.** That is what this plants: 13 trunks at 7 m.

NO NEW GEOMETRY, AND THAT IS THE POINT. `src/city.js` already says "A SURVEYED
TREE ON THE SAND IS A PALM, AND IT IS DRAWN ONCE" — anything in `trees` that
falls inside a sand ring is drawn by `buildBeachLife` with the coconut form and
deliberately skipped by the generic planter, so the two cannot disagree. Adding
points to `trees` inside the Palawan sand ring is the whole job.

PLACED OFF THE REAL FRONTAGE, NOT OFF A GUESS. The row is walked along
`Palawan Beach Walk` — the way the spawn actually stands on — and stepped
seaward until it is genuinely inside the mapped sand, so the avenue follows the
beach the survey drew rather than a straight line typed into this file. Every
trunk is checked to be inside the ring; any that is not is dropped rather than
nudged.

Run:  python3 data/palawanpalms.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

SPAWN = (-1241.7, 12973.0)
WALK = "Palawan Beach Walk"
FRONTAGE = 90.0        # DERIVED (SAT) — the run of frontage the palms stand on
SPACING = 7.0          # DERIVED (SAT) — 6-9 m between trunks; this drives the
                       # count rather than the other way round, because the
                       # frontage is a CURVE and a fixed count over a curve puts
                       # the spacing wherever it lands: the first version asked
                       # for 13 trunks across "90 m" of RING PERIMETER, the sand
                       # doubled back around a narrow tip, and the row came out
                       # 47 m end to end at 3.9 m spacing. 90 m is a STRAIGHT
                       # LINE on the satellite, so it is measured as one.
COUNT_MAX = 15         # DERIVED (SAT) — "roughly 12-15 trunks"
MIN_GAP = 4.5          # metres; below this it is one palm inside another
SET_IN = 8.0           # metres into the sand from the walk: they stand IN it
MARK = "palawanpalms"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    if a.id != "sentosa":
        return
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    print(f"== palawanpalms {a.id}")

    if d.get(MARK):
        print("   already planted — nothing to do")
        return

    rings = [w["p"] for w in d.get("green") or []
             if w.get("k") == "sand" and (w.get("n") or "") == "Palawan Beach"]
    if not rings:
        print("   ! no Palawan Beach sand ring — refusing to plant on a guess")
        return
    ring = rings[0]

    def inside(px, pz, r):
        ok = False
        j = len(r) - 1
        for i in range(len(r)):
            xi, zi = r[i]
            xj, zj = r[j]
            if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                ok = not ok
            j = i
        return ok

    # THE ROW FOLLOWS THE SAND, NOT THE ROAD — and the first version followed
    # the road. `Palawan Beach Walk` runs away from the frontage here: the sand
    # by the spawn is a narrow diagonal band, so of 13 trunks laid off the walk
    # only 7 landed in it and the avenue came out 46 m long instead of 90.
    # Walking the SAND RING's own landward edge and stepping inward puts every
    # trunk on the beach the survey drew.
    near = min(range(len(ring)), key=lambda i2: math.dist(ring[i2], SPAWN))
    n_ring = len(ring)

    def ring_at(idx):
        return ring[idx % n_ring]

    def inward(px, pz, vx, vz, step):
        """`step` metres inside the ring from the point (px,pz) on its edge.

        IT TAKES THE POINT, NOT THE SEGMENT INDEX, and the first version took
        the index and used that segment's MIDPOINT — so every trunk resampled
        onto the same segment landed on the same spot. Fifteen palms came out
        as eight bunches over 46 m instead of a row.
        """
        L = math.hypot(vx, vz) or 1.0
        for sg in (1, -1):
            nx, nz = -vz / L * sg, vx / L * sg
            q = (px + nx * step, pz + nz * step)
            if inside(q[0], q[1], ring):
                return q
        return None

    # walk the ring outward from the nearest vertex, both ways, collecting
    # frontage until FRONTAGE metres are covered
    order = [near]
    fwd = back = 0.0
    fi = near
    bi = near
    while (math.dist(ring_at(bi), ring_at(fi)) < FRONTAGE
           and len(order) < n_ring):
        if fwd <= back:
            nxt = (fi + 1) % n_ring
            fwd += math.dist(ring_at(fi), ring_at(nxt))
            fi = nxt
            order.append(fi)
        else:
            prv = (bi - 1) % n_ring
            back += math.dist(ring_at(bi), ring_at(prv))
            bi = prv
            order.insert(0, bi)

    # resample that stretch at even spacing
    poly = [ring_at(i2) for i2 in order]
    cum = [0.0]
    for i2 in range(1, len(poly)):
        cum.append(cum[-1] + math.dist(poly[i2 - 1], poly[i2]))
    total = cum[-1]
    if total < 30:
        print(f"   ! only {total:.0f} m of sand frontage found — refusing")
        return

    planted = []
    n_want = min(COUNT_MAX, max(2, int(total / SPACING) + 1))
    for k in range(n_want):
        s = k * SPACING
        if s > total:
            break
        i2 = 1
        while i2 < len(cum) - 1 and cum[i2] < s:
            i2 += 1
        t = (s - cum[i2 - 1]) / max(1e-6, cum[i2] - cum[i2 - 1])
        ax, az = poly[i2 - 1]
        bx, bz = poly[i2]
        ex, ez = ax + (bx - ax) * t, az + (bz - az) * t
        placed = None
        for step in (SET_IN, SET_IN - 2.5, SET_IN + 3, SET_IN + 6):
            q = inward(ex, ez, bx - ax, bz - az, step)
            if q:
                placed = q
                break
        if placed is None:
            continue                      # dropped, not nudged
        # a natural row leans and wanders; deterministic, so a rebuild repeats it
        j2 = (k * 37) % 11 - 5
        q2 = [round(placed[0] + j2 * 0.22, 1),
              round(placed[1] + ((k * 53) % 7 - 3) * 0.22, 1)]
        # NO TWO TRUNKS IN THE SAME PLACE. Resampling at a fixed arc spacing
        # bunches wherever the ring turns hard or carries short segments: two
        # of the first fifteen came out 0.8 m apart, which is one palm drawn
        # inside another. The research's own figure is 6-9 m, so anything under
        # MIN_GAP is not a tight row, it is a mistake.
        if any(math.dist(q2, q3) < MIN_GAP for q3 in planted):
            continue
        planted.append(q2)

    if not planted:
        print("   ! nothing landed inside the sand ring — refusing")
        return

    d.setdefault("trees", []).extend(planted)
    d[MARK] = {"spacing": SPACING, "planted": len(planted),
               "src": ("AUTHORED. research/palawan-spawn.md ledger row 6: the "
                       "spawn heading looks down an avenue of palms and there "
                       "were ZERO trees within 300 m. 12-15 trunks over 90 m of "
                       "frontage is DERIVED from satellite; the individual "
                       "positions have no data source and are placed off "
                       "Palawan Beach Walk, inside the mapped sand")}
    span = math.dist(planted[0], planted[-1]) if len(planted) > 1 else 0
    print(f"   planted {len(planted)} coconut palms (research 12-15) over "
          f"{span:.0f} m end to end (research ~90 m), {SPACING:.0f} m spacing "
          f"along the frontage (research 6-9 m)")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
