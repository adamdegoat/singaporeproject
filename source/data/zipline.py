"""MEGAZIP — the one ride on Sentosa that the map does not contain.

The owner asked for the zip line to be rideable. It is not in OpenStreetMap:
the Mega Adventure park is tagged, the zip itself is not, so unlike the cable
car, the SkyRide and the luge there is no surveyed line to follow.

SO IT IS AUTHORED, AND ANCHORED TO THINGS THAT ARE NOT. Published figures
(megaadventure.com, sentosa.com.sg, Wikipedia, retrieved 2026-08-03):

    length      450 m, the longest zip line in South East Asia
    launch      75 m above ground level
    route       from the peak of Imbiah Hill to a man-made island off
                Siloso Beach
    speed       up to 60 km/h

Neither endpoint is invented. Both are MEASURED out of our own scene:

  * the launch is on Imbiah Hill's highest terrain cell, 49.2 m at -2029,12174
  * the landing is a real closed coastline ring — a 4,741 m2 islet off Siloso
    Beach at -2260,12530

and the check that this is the RIGHT islet is that the published length falls
out of the measurement rather than being forced into it: the three candidate
islets off Siloso sit 424 m, 440 m and 477 m from that peak, against a
published 450 m. A placement that has to be argued into agreement is a guess;
this one agrees on arrival.

The launch platform is set at 75 m ABOVE THE LANDING, which is what the
published figure describes — the hill is 49 m of that and the tower is the
rest, about 26 m, which is the tower you see in photographs.

Run:  python3 data/zipline.py sentosa
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

PUBLISHED_LENGTH = 450.0     # m
PUBLISHED_LAUNCH = 75.0      # m above the ground it lands on
LANDING_DECK = 3.2           # the landing platform stands out of the water


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

    def peak(self, x0, x1, z0, z1):
        best = (-1e9, 0.0, 0.0)
        for j in range(self.nz):
            for i in range(self.nx):
                x = self.x0 + i * self.cell
                z = self.z0 + j * self.cell
                if not (x0 < x < x1 and z0 < z < z1):
                    continue
                v = self.h[j * self.nx + i]
                if v > best[0]:
                    best = (v, x, z)
        return best


def rings_from_coast(coast):
    """Same stitch island.py uses — the islets are closed coastline rings."""
    from collections import defaultdict
    ways = [w["p"] for w in coast if w.get("p") and len(w["p"]) > 1]

    def key(pt):
        return (round(pt[0] / 0.5), round(pt[1] / 0.5))

    ends = defaultdict(list)
    for i, p in enumerate(ways):
        ends[key(p[0])].append((i, 0))
        ends[key(p[-1])].append((i, 1))
    used, out = set(), []
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
                    chain = (list(reversed(q))[:-1] + chain) if prepend else (chain + q[1:])
                    used.add(j)
                    grew = True
                    break
                if grew:
                    break
        if (abs(chain[0][0] - chain[-1][0]) < 2 and abs(chain[0][1] - chain[-1][1]) < 2
                and len(chain) > 8):
            out.append(chain)
    return out


def area_of(ring):
    a = 0.0
    for i in range(len(ring) - 1):
        a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return abs(a) / 2


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    g = Ground(d["terrain"])

    peak_y, peak_x, peak_z = g.peak(-2200, -1600, 12150, 12600)

    rings = rings_from_coast(d.get("coast") or [])
    rings.sort(key=area_of, reverse=True)
    islets = []
    for r in rings[1:]:
        ar = area_of(r)
        if not (400 < ar < 20000):
            continue
        cx = sum(q[0] for q in r) / len(r)
        cz = sum(q[1] for q in r) / len(r)
        if not (-2600 < cx < -1900 and 12450 < cz < 12900):
            continue                     # off Siloso Beach, not elsewhere
        islets.append((math.dist((peak_x, peak_z), (cx, cz)), ar, cx, cz))
    if not islets:
        print("  ! no islet off Siloso Beach in this scene — zip line not placed")
        return
    # the one whose distance best matches the published length AND is a real
    # island rather than a rock
    islets.sort(key=lambda r: abs(r[0] - PUBLISHED_LENGTH) + (2000 if r[1] < 800 else 0))
    dist, ar, ex, ez = islets[0]

    print(f"== zipline {a.id}")
    print(f"   launch  Imbiah Hill peak   {peak_y:5.1f} m at {peak_x:.0f},{peak_z:.0f}")
    print(f"   landing islet {ar:.0f} m2 at {ex:.0f},{ez:.0f}")
    print(f"   measured span {dist:.0f} m against a published {PUBLISHED_LENGTH:.0f} m"
          f"  ({100*(dist-PUBLISHED_LENGTH)/PUBLISHED_LENGTH:+.0f}%)")
    for (dd, aa, xx, zz) in islets[1:]:
        print(f"     (runner-up: {aa:6.0f} m2 at {xx:.0f},{zz:.0f}, span {dd:.0f} m)")

    land_g = g.at(ex, ez)
    y1 = land_g + LANDING_DECK
    y0 = land_g + PUBLISHED_LAUNCH
    tower = y0 - peak_y
    print(f"   launch deck {y0:.1f} m ({PUBLISHED_LAUNCH:.0f} m above the landing "
          f"ground at {land_g:.1f} m) — hill {peak_y:.1f} m + tower {tower:.1f} m")
    if tower < 6:
        print("   ! the hill alone already exceeds the published launch height — "
              "check the peak search box")

    # CLEAR THE CORRIDOR, because a real zip line has one.
    #
    # A wire is a catenary: it SAGS, so it cannot arch over anything. Rendered
    # from the harness, the first version flew straight into the canopy — at
    # 20% of the span the wire sits about 56m and the jungle on Imbiah tops out
    # around the same, so the ride was a tour of the inside of a tree. The real
    # MegaZip runs down a cleared slope. So we clear it: no tree within
    # CORRIDOR metres of the span, which is authored landscaping and exactly
    # what the operator did.
    CORRIDOR = 15.0
    trees = d.get("trees") or []
    def dist_to_span(x, z):
        vx, vz = ex - peak_x, ez - peak_z
        wx, wz = x - peak_x, z - peak_z
        L2 = vx * vx + vz * vz
        t = 0.0 if L2 == 0 else max(0.0, min(1.0, (wx * vx + wz * vz) / L2))
        return math.hypot(peak_x + t * vx - x, peak_z + t * vz - z)
    kept = [q for q in trees
            if not (isinstance(q, (list, tuple)) and len(q) >= 2
                    and dist_to_span(q[0], q[1]) < CORRIDOR)]
    if len(kept) != len(trees):
        print(f"   cleared {len(trees) - len(kept)} trees from the "
              f"{CORRIDOR:.0f}m flight corridor")
        d["trees"] = kept

    d["zipline"] = {
        "n": "MegaZip",
        "p": [[round(peak_x, 1), round(peak_z, 1)], [round(ex, 1), round(ez, 1)]],
        "y0": round(y0, 2), "y1": round(y1, 2),
        "tower": round(tower, 2),
        "src": "authored: endpoints measured, length/height published",
    }
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
