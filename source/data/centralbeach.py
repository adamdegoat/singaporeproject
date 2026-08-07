"""Central Beach's sand, which the map does not have. Sentosa only.

THE DEFECT THIS CLOSES. The ground in front of the Wings of Time seating bank
— the foreground of the island's signature frame, and the view three golden
cameras point at — rendered as lawn. Session 12 found and fixed the first half
of that: `seaDistAt` was measuring the beach as 105-140 m from an ocean 30 m
away, so every sand rule in terrain.js switched itself off. This is the other
half. Even measuring correctly, there is almost nothing here to call sand.

WHAT OSM HAS, MEASURED (research/central-beach-ground.md, 2026-08-07): a 5 m
sample grid over the frame puts 1,678 of 3,264 points inside no ground polygon
at all — ONE CONNECTED 4.1 HECTARE HOLE. `natural=beach` way/684974366 does
exist here, contrary to what SESSION 11 wrote in its own next-steps list, but
it is a thin 3,317 m2 hook that stops about 20 m short of the water and does
not reach across the front of the bank.

So the sand is AUTHORED, and this file is the claim. Under SENTOSA.md that is
allowed — surfaces are Layer 2 — but a surface claim is still a claim about a
real place, so it carries its provenance the way data/authored.json does for
buildings, and it is stored as PARAMETERS (a chain of transects) rather than as
a vertex list, because a chain is auditable and 40 projected coordinate pairs
are not.

THE SHAPE IS A WEDGE AND THAT IS THE WHOLE POINT. Eleven transects were marched
from the grandstand's own surveyed seaward vertices (OSM way/116818107) on
bearing 225 deg, the shore normal, across a 0.075 m/px satellite mosaic. The
beach is 19 m deep at the north-west end, tapers to about 6 m, and runs out to
NOTHING at the south-east corner where the bank's last row meets a rock
revetment and the water. A beach of constant width would be wrong here in a way
that is obvious from the one camera that matters.

EVIDENCE CLASS: EST-PHOTO. This is reading a photograph. There is no published
survey of this beach, the research says so plainly, and so does this file.

THE OUTER EDGE IS THE IMAGED WATERLINE, which is wherever the tide happened to
be on the day that satellite pass was flown — Singapore's spring range is
2.5-3 m. That is the right edge for the SAND POLYGON, because the intertidal
strip is beach and is walked on; it is NOT the right place for a waterline, and
nothing here moves one. terrain.js already darkens the wet band by its own
elevation and coastal distance, so the dry/damp step draws itself.

NOT DONE HERE, deliberately: the 3 m brushed-concrete apron at the foot of the
bank. research/central-beach-ground.md calls it "the hard edge the frame needs"
and research/wings-of-time.md calls the same strip dark timber; the two
disagree and the research flagged it unresolved rather than picking. A 3 m
strip is not worth shipping on a coin toss, and the sand is what was green.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# Bearing 225 deg — south-west, the shore normal. World axes: +x east, +z south
# (z is built as (lat0 - lat) * 110574), so a southward step is POSITIVE z.
_A = math.radians(225.0)
UX, UZ = math.sin(_A), -math.cos(_A)          # (-0.7071, +0.7071)

# start (a surveyed grandstand vertex) | apron m | outer edge m | note
# `outer` is the "first water at" column of the research's transect table, which
# is apron + dry + damp to within a metre on every row that has all three.
TRANSECTS = [
    (-1867, 12727,  2.0,  6.0),   # NW corner: rock spur, no sand at all
    (-1856, 12733,  3.0, 32.0),   # dry sand broken by the spur
    (-1842, 12741,  3.0, 33.0),   # deepest: 19 m dry + 11 m damp
    (-1831, 12748,  3.0, 31.0),
    (-1823, 12754,  3.0, 29.0),
    (-1815, 12761,  4.0, 25.0),
    (-1808, 12770,  4.0, 20.0),
    (-1800, 12778,  4.0, 20.0),
    (-1793, 12789,  2.0, 16.0),
    (-1785, 12803,  2.0, 15.0),
    (-1779, 12815,  6.0,  6.0),   # SE corner: pinches to zero on the revetment
]

NAME = "Central Beach"


def _in_ring(x, z, r):
    hit = False
    n = len(r)
    j = n - 1
    for i in range(n):
        xi, zi = r[i][0], r[i][1]
        xj, zj = r[j][0], r[j][1]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            hit = not hit
        j = i
    return hit


def _to_water(x0, z0, start, island, cap=140.0):
    """March seaward from a transect start until the point leaves the island.

    THE PHOTOGRAPH'S DISTANCES ARE NOT OUR DISTANCES, and this is the second
    thing the frame taught. The research measured "first water" at 15-35 m out,
    from a satellite pass flown at whatever the tide happened to be. Our drawn
    waterline is OSM's coastline, which is mean high water carried through
    terrain.py's own passes, and on this stretch it sits about 40 m further out
    than the imaged one. Cutting the sand at the photograph's figure therefore
    left a 30-40 m band of unclassified ground BETWEEN the beach and the sea —
    measured on the drawn vertices, and in the frame it is the pale strip below
    the sand, which is precisely the defect this file exists to remove.

    So the photograph sets the SHAPE and our own coastline sets the EXTENT.
    Each transect walks out until it leaves the island and stops one metre
    short. Nothing here invents a waterline; it reads ours.

    AND IT READS `islandRing`, NOT THE WATER POLYGONS, which was the first cut
    and was wrong. The sea in this district is ONE 8.0 km2 polygon with the
    island NOT punched out of it — the holes are assembled at runtime in
    main.js, so a point-in-polygon test against `water` on disk answers "sea"
    for the middle of Sentosa. Marching against that stopped every transect at
    the first step. `islandRing` is the stitched coastline islandring.py
    publishes for exactly this kind of question: inside is land, outside is
    not, and it needs no holes.
    """
    s = start
    while s < cap:
        x, z = x0 + s * UX, z0 + s * UZ
        if not _in_ring(x, z, island):
            return max(start, s - 1.0)
        s += 1.0
    return cap


def ring(island=None):
    inner = [(round(x + a * UX, 1), round(z + a * UZ, 1)) for x, z, a, _ in TRANSECTS]
    outer = []
    for x, z, a, o in TRANSECTS:
        d = _to_water(x, z, a, island) if island else o
        outer.append((round(x + d * UX, 1), round(z + d * UZ, 1)))
    p = inner + outer[::-1]
    p.append(p[0])
    return [[x, z] for x, z in p]


def area(p):
    s = 0.0
    for i in range(len(p) - 1):
        s += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1]
    return abs(s) / 2.0


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    if did != "sentosa":
        return
    path = os.path.join(HERE, f"{did}.json")
    d = json.load(open(path))
    green = d.setdefault("green", [])

    # idempotent: this pass owns exactly one polygon and replaces its own work
    green[:] = [g for g in green if g.get("src") != "centralbeach"]

    island = d.get("islandRing")
    if not island or len(island) < 4:
        print("== central beach: no islandRing — run islandring.py first; skipped")
        return
    p = ring(island)
    a = round(area(p))
    # `m: 1` — MEASURED. terrain.js's back-beach fade blends sand to lawn past
    # 45 m from the water, which is the right correction for an OSM beach ring
    # that runs 100 m up a hillside and the wrong one for this. It skips rings
    # carrying this flag. Only set it on a polygon whose extent was actually
    # surveyed; it is a claim, not a convenience.
    green.append({"p": p, "k": "sand", "a": a, "n": NAME, "src": "centralbeach",
                  "ws": "est-photo", "m": 1})
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"== central beach {did}")
    print(f"   authored {a:,} m2 of sand across {len(TRANSECTS)} measured "
          f"transects (EST-PHOTO, research/central-beach-ground.md)")
    print(f"   wedge {TRANSECTS[2][3] - TRANSECTS[2][2]:.0f} m deep at the NW end "
          f"-> 0 m at the SE corner")


if __name__ == "__main__":
    main()
