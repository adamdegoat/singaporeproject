"""Siloso's swim-lagoon groynes and islets, mined from the SURVEY.

OSM does not tag Siloso's boulder groynes as bare_rock — the seven mapped
rocks sit at Tanjong and Siloso Point, and the lagoon groynes that shape the
beach in every reference frame (research/ref-siloso/strip.jpg, siloso2.jpg)
were simply absent. But the survey still knows where they are, twice over:

1. The COASTLINE layer's small closed rings ARE the offshore islets at the
   lagoon mouths (a ring under ~500m of circumference is an islet, not the
   island). At 35m terrain cells they vanish from the heightfield, so they
   never rise out of the sea on their own — drawn as heaped boulders with
   trees on top they read exactly as the reference shows them.
2. The island ring itself TRACES each attached groyne as a promontory: a
   short run of vertices jutting seaward off the local coast line. Detected
   by chord offset — a vertex standing >JUT metres proud of the chord between
   its neighbours ±CHORD_N vertices away, on the seaward side.

Positions are therefore Layer 1 (truth); the boulder forms drawn from them
are Layer 2 (authored), by the existing rock builder in sgdetail.js.

Idempotent: strips its own k='groyne'/'islet' entries before appending, and
never touches the surveyed bare_rock/reef/rock entries.

Run after attractions.py (which rewrites `rocks`) and before/after island.py
equally — rocks are kept whole by the clip since 2026-08-04.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))

ISLET_MAX_LOOP = 520.0     # ring circumference under this = islet, not island
JUT = 11.0                 # metres proud of the local chord to count as a groyne
CHORD_N = 6                # vertices each side for the local chord
NEAR_SAND = 260.0          # only hunt groynes near a mapped beach


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    path = os.path.join(HERE, f"{did}.json")
    data = json.load(open(path))

    cw = [c["p"] for c in data.get("coast", []) if len(c.get("p", [])) >= 2]
    if not cw:
        print("   no coast layer; nothing to do")
        return

    # chain ways into rings (same joining rule terrain.py uses)
    def keyp(p):
        return (round(p[0] / 1.5), round(p[1] / 1.5))
    ways = [list(w) for w in cw]
    changed = True
    while changed and len(ways) > 1:
        changed = False
        for a in range(len(ways)):
            for b in range(a + 1, len(ways)):
                A, B = ways[a], ways[b]
                if keyp(A[-1]) == keyp(B[0]):
                    ways[a] = A + B[1:]
                elif keyp(A[-1]) == keyp(B[-1]):
                    ways[a] = A + list(reversed(B))[1:]
                elif keyp(A[0]) == keyp(B[-1]):
                    ways[a] = B + A[1:]
                elif keyp(A[0]) == keyp(B[0]):
                    ways[a] = list(reversed(B)) + A[1:]
                else:
                    continue
                del ways[b]
                changed = True
                break
            if changed:
                break
    rings = [w for w in ways
             if len(w) >= 4 and math.hypot(w[0][0] - w[-1][0], w[0][1] - w[-1][1]) < 30]

    def loop_len(r):
        return sum(math.dist(r[i], r[(i + 1) % len(r)]) for i in range(len(r)))

    islets = [r for r in rings if loop_len(r) < ISLET_MAX_LOOP]
    big = max(rings, key=loop_len) if rings else None

    sands = [g["p"] for g in data.get("green", []) if g.get("k") == "sand"]

    def near_sand(x, z):
        for sp in sands:
            xs = [q[0] for q in sp]; zs = [q[1] for q in sp]
            if min(xs) - NEAR_SAND < x < max(xs) + NEAR_SAND and \
               min(zs) - NEAR_SAND < z < max(zs) + NEAR_SAND:
                return True
        return False

    def inside(px, pz, ring):
        c = False
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, zi = ring[i]; xj, zj = ring[j]
            if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                c = not c
            j = i
        return c

    groynes = []
    if big:
        n = len(big)
        jut = [0.0] * n
        for i in range(n):
            a = big[(i - CHORD_N) % n]
            b = big[(i + CHORD_N) % n]
            p = big[i]
            vx, vz = b[0] - a[0], b[1] - a[1]
            L2 = vx * vx + vz * vz or 1.0
            t = max(0.0, min(1.0, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / L2))
            fx, fz = a[0] + vx * t, a[1] + vz * t
            d = math.dist(p, (fx, fz))
            # seaward only: the chord midpoint offset toward the point must
            # leave the island — a bay curves the other way
            mx, mz = (p[0] + fx) / 2, (p[1] + fz) / 2
            ox, oz = p[0] - fx, p[1] - fz
            oL = math.hypot(ox, oz) or 1.0
            probe = (mx + ox / oL * 6.0, mz + oz / oL * 6.0)
            if d > JUT and not inside(probe[0], probe[1], big) and near_sand(*p):
                jut[i] = d
        # cluster consecutive jutting vertices into one groyne run
        i = 0
        while i < n:
            if jut[i] > 0:
                j = i
                while j + 1 < n and jut[j + 1] > 0:
                    j += 1
                run = big[i:j + 1]
                if len(run) >= 2 and loop_len(run + run[:1]) is not None:
                    length = sum(math.dist(run[s], run[s + 1]) for s in range(len(run) - 1))
                    if 8.0 < length < 220.0:
                        groynes.append(run)
                i = j + 1
            else:
                i += 1

    rocks = [r for r in data.get("rocks", []) if r.get("k") not in ("groyne", "islet")]
    for r in islets:
        rocks.append({"k": "islet", "g": [[round(x, 1), round(z, 1)] for x, z in r + [r[0]]]})
    for run in groynes:
        rocks.append({"k": "groyne", "g": [[round(x, 1), round(z, 1)] for x, z in run]})
    data["rocks"] = rocks

    json.dump(data, open(path, "w"), separators=(",", ":"))
    print(f"   {len(islets)} islet(s) from small coast rings, "
          f"{len(groynes)} groyne run(s) from coastline promontories near sand")
    for r in islets:
        cx = sum(p[0] for p in r) / len(r); cz = sum(p[1] for p in r) / len(r)
        print(f"     islet  ({cx:7.0f},{cz:7.0f})  loop {loop_len(r):5.0f} m")
    for run in groynes:
        cx = sum(p[0] for p in run) / len(run); cz = sum(p[1] for p in run) / len(run)
        L = sum(math.dist(run[s], run[s + 1]) for s in range(len(run) - 1))
        print(f"     groyne ({cx:7.0f},{cz:7.0f})  run  {L:5.0f} m")


if __name__ == "__main__":
    main()
