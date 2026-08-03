"""OPEN GROUND — where a real road runs through a real building, the road wins.

THE CONTRADICTION THIS RESOLVES. The map states two things that cannot both be
true of a solid block: "there is a building here" and "there is a carriageway
here". Measured on Sentosa, Beach Arrival Plaza's surveyed footprint (3,632 m2)
comes within 0.20m of Siloso Beach Walk's surveyed centreline. Neither is
wrong. What is wrong is us: the road passes UNDER the structure, and we build
the structure as a solid mass with walls at ground level.

WHAT IT COST BEFORE THIS EXISTED:
  * T1 "carriageway blocked by solid geometry" sat at 16 and refused a deploy.
    A whole session went into a five-way bisect — beach furniture to zero,
    palms reverted, trail guards widened, pavilion posts guarded — and the
    count never moved by one, because none of those built it.
  * 2.0% of walkable path samples were BLOCKED, clustered at -1800,12730,
    which is the same building. A mapped footway you walk into a wall on is
    the owner's "stuck halfway" complaint.

THE RULE, and it is a rule rather than a hand-flag on one building: a footprint
that a carriageway genuinely traverses gets an OPEN GROUND STOREY. The mass
starts at `mh` metres up — the renderer already knows how to build a mass that
begins in the air, that is how SkyPark works — and city.js stands columns under
it. Nothing below the clearance reaches the collision grid, so the road and the
paths under it are open the way they are in life.

GUARDS, because lifting a building that should not be lifted is worse than the
defect. A road must ENTER AND LEAVE the footprint with at least MIN_RUN metres
inside, so a road merely clipping a corner does nothing; the building must be
big enough to span; and anything already declared a canopy or already lifted is
left alone.

Run:  python3 data/openground.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# Clearance under the mass. A double-decker bus is 4.5m; Singapore's standard
# headroom over a carriageway is 4.5-5.0m, so 5.5m clears it with a margin and
# still reads as a ground storey rather than a stilted house.
CLEAR = 5.5
# Centreline metres that must lie INSIDE the footprint before we believe the
# road truly runs through it rather than clipping a corner.
MIN_RUN = 9.0
# Below this a "building" is a kiosk and a road crossing it is a mapping
# artefact, not a porte-cochere.
MIN_AREA = 250.0
# ABOVE THIS, DO NOT LIFT — FLAG IT FOR A RECIPE INSTEAD.
#
# The rule opens a building's WHOLE ground storey, and that is only honest for
# a low structure the road genuinely runs through: an arrival plaza, a resort
# podium, a covered forecourt. On a 55m tower (Hard Rock, Shangri-La Rasa
# Sentosa) the real open bit is a drop-off a few metres wide, not the entire
# footprint, and standing the whole tower on columns would look far worse than
# the defect it fixes. Those are listed as needing a porte-cochere recipe,
# which is authored work, not a rule.
MAX_H = 26.0
# A LIFT THAT EATS THE BUILDING IS A CANOPY, AND A LIFT THAT TOWERS IS NEITHER.
#
# Two failure modes the first version walked into, both found by reading the
# numbers rather than the render:
#   * Beach Arrival Plaza is h=10.2 and wanted a 10.1m lift, leaving 0.1m of
#     mass. The renderer's lifted-mass path requires mh < h-0.5, so it would
#     silently have drawn the building SOLID again — the exact defect, back,
#     with no warning. A structure whose whole height is clearance is not a
#     lifted building, it is a CANOPY, and city.js already builds those.
#   * Hotel Ora is h=23.8 with 288m of footway through it and wanted a 16.3m
#     lift, which would leave a 7m slab floating four storeys up over a resort.
#     A path through a hotel means an arcade or a lobby, not stilts.
MIN_MASS = 3.0        # below this much mass left, build a canopy instead
MAX_LIFT = 10.5       # above this, a rule is guessing — report for a recipe
# Kinds that are carriageways. Footways are deliberately NOT here: a path
# through a building is usually an arcade we already handle, and lifting a
# building for one is far too eager.
CARRIAGEWAY = {"motorway", "trunk", "primary", "secondary", "tertiary",
               "unclassified", "residential", "living_street", "service"}
# WALKING ROUTES COUNT TOO — the owner, twice: "cannot like got broken roads or
# paths or halfway will stuck all."
#
# A mapped footway running through a building is the same contradiction as a
# road running through one, and it has the same real-world resolution: you walk
# UNDER or THROUGH the structure. Measured before this: 2.0% of all walkable
# path samples on Sentosa were inside solid geometry, and the cluster at
# -1800,12730 was two buildings a surveyed footway runs straight through.
# Walking into a wall on a mapped path is exactly "stuck halfway".
#
# The bar is HIGHER than for a carriageway (FOOT_RUN, not MIN_RUN), because a
# footway clipping a building corner is common and lifting a building for it
# would be far too eager.
FOOTWAY = {"footway", "pedestrian", "path", "steps"}
FOOT_RUN = 16.0


class Ground:
    """The heightfield, sampled the way the renderer samples it."""

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
    ground = Ground(d["terrain"])

    roads = []
    for r in (d.get("roads") or []):
        if not isinstance(r, dict):
            continue
        k = r.get("k")
        if k not in CARRIAGEWAY and k not in FOOTWAY:
            continue
        p = r.get("p")
        if isinstance(p, list) and len(p) > 1:
            roads.append(r)

    # bucket road segments so each building tests only its neighbourhood
    cell = 80.0
    grid = {}
    for r in roads:
        p = r["p"]
        for i in range(len(p) - 1):
            ax, ay = p[i][0], p[i][1]
            bx, by = p[i + 1][0], p[i + 1][1]
            for gx in range(int(min(ax, bx) // cell), int(max(ax, bx) // cell) + 1):
                for gy in range(int(min(ay, by) // cell), int(max(ay, by) // cell) + 1):
                    grid.setdefault((gx, gy), []).append(
                        (ax, ay, bx, by, r, r.get("k") in FOOTWAY))

    hits, tootall, toosteep, canopies, raised, cleared = [], [], [], [], [], 0
    for b in (d.get("buildings") or []):
        if not isinstance(b, dict):
            continue
        # IDEMPOTENT, INCLUDING THE mh IT SET. The first version cleared `og`
        # but left the `mh` behind, so the "already lifted" guard below skipped
        # every building this file had ever touched and a re-run reported
        # nothing to do. A step that runs on every build must be able to undo
        # exactly what it did.
        if b.get("og"):
            cleared += 1
            b.pop("og", None)
            if b.pop("ogm", None):
                b.pop("mh", None)
        if b.pop("ogc", None):
            b.pop("roof", None)        # canopy flag was ours; undo it too
            cleared += 1
        if "ogh" in b:
            b["h"] = b.pop("ogh")      # restore the height we raised
        pts = b.get("p")
        if not pts or len(pts) < 3:
            continue
        if b.get("roof") or (b.get("mh") or 0) > 1:
            continue                   # already a canopy, or already lifted
        if (b.get("a") or 0) < MIN_AREA or (b.get("h") or 0) < 4:
            continue
        xs = [q[0] for q in pts]
        ys = [q[1] for q in pts]
        bx0, bx1, by0, by1 = min(xs), max(xs), min(ys), max(ys)

        seen, run, foot_run, road_top = set(), 0.0, 0.0, -1e9
        for gx in range(int(bx0 // cell), int(bx1 // cell) + 1):
            for gy in range(int(by0 // cell), int(by1 // cell) + 1):
                for (ax, ay, bx2, by2, r, is_foot) in grid.get((gx, gy), ()):
                    L = math.hypot(bx2 - ax, by2 - ay)
                    if L < 0.01:
                        continue
                    n = max(2, int(L / 1.5))
                    inside = 0
                    for s in range(n + 1):
                        t = s / n
                        px, py = ax + (bx2 - ax) * t, ay + (by2 - ay) * t
                        if poly_contains(pts, px, py):
                            inside += 1
                            gy = ground.at(px, py)
                            if gy > road_top:
                                road_top = gy
                    if inside:
                        if is_foot:
                            foot_run += L * inside / (n + 1)
                        else:
                            run += L * inside / (n + 1)
                        seen.add(id(r))
        qualifies = run >= MIN_RUN or foot_run >= FOOT_RUN
        if qualifies and (b.get("h") or 0) > MAX_H:
            tootall.append((b.get("n") or "(unnamed)", b.get("h"),
                            round(max(run, foot_run), 1)))
            continue
        if qualifies:
            # CLEARANCE IS MEASURED AGAINST THE GROUND UNDER THE ROAD, NOT THE
            # BUILDING'S OWN FOOT.
            #
            # The renderer seats a mass at seatY(), the LOWEST ground anywhere
            # under the footprint, and `mh` counts up from there. Beach Arrival
            # Plaza's 3,632 m2 outline runs from the sand up to Siloso Beach
            # Walk, so a flat mh of 5.5 lifted it 5.5m above THE BEACH and left
            # its underside still sitting on the road — T1 stayed at exactly 16
            # after the first version of this file shipped, with the flagged
            # fabric at up=0.4..1.2m, which is the fall across the footprint.
            #
            # So the lift is the fall from the building's foot to the highest
            # ground the road reaches inside it, PLUS the headroom. Same number
            # the renderer will measure from, so the underside really clears.
            foot = min(ground.at(q[0], q[1]) for q in pts)
            lift = round(max(CLEAR, (road_top - foot) + CLEAR), 1)
            h = b.get("h") or 0
            if lift > MAX_LIFT:
                toosteep.append((b.get("n") or "(unnamed)", h, lift,
                                 round(max(run, foot_run), 1)))
                continue
            if h - lift < MIN_MASS:
                # ALL CLEARANCE, NO BUILDING — so the ROOF RISES.
                #
                # Beach Arrival Plaza is h=10.2 and needs 10.1m of clearance to
                # clear the road that runs through it. Two wrong answers were
                # tried first: the renderer's lifted-mass path requires
                # mh < h-0.5, so leaving it alone drew the building SOLID again
                # with no warning; and handing it to the b.roof canopy builder
                # gets it REFUSED and drawn as nothing at all, because that
                # builder rightly rejects a slab spanning more than 4m of fall
                # and this footprint spans 4.6m.
                #
                # The clearance is a MEASURED fact — it is the ground under a
                # surveyed road. The height is not: it came from a levels tag,
                # not a published figure. So the measured number wins and the
                # roof goes up to sit on it. Authored, and recorded as authored.
                raised.append((b.get("n") or "(unnamed)", h, lift + MIN_MASS))
                b["h"] = round(lift + MIN_MASS, 1)
                b["ogh"] = h           # remember the original, to undo
            b["og"] = lift
            if not b.get("mh"):
                b["mh"] = lift         # the renderer's existing lifted-mass path
                b["ogm"] = 1           # ...and remember that WE set it
            hits.append((b.get("n") or "(unnamed)", int(b.get("a") or 0),
                         b.get("h"), round(run, 1), round(foot_run, 1), lift))

    print(f"== open ground {a.id}")
    print(f"   {len(hits)} building(s) a route runs through "
          f"(road >= {MIN_RUN:.0f}m or path >= {FOOT_RUN:.0f}m inside, "
          f">= {MIN_AREA:.0f} m2)")
    for (n, area, h, run, froad, lift) in sorted(hits, key=lambda r: -(r[3] + r[4])):
        print(f"     road {run:6.1f}m  path {froad:6.1f}m  inside {area:>6} m2  "
              f"h={h:<6} lift {lift:4.1f}m  {n}")
    if not hits:
        print("     (none — nothing lifted)")
    if raised:
        print(f"   {len(raised)} roof(s) raised so the measured clearance fits:")
        for (n, was, now) in raised:
            print(f"     h {was} -> {now:.1f}   {n}")
    if canopies:
        print(f"   {len(canopies)} built as a CANOPY instead (clearance is their "
              f"whole height):")
        for (n, h, run) in sorted(canopies, key=lambda r: -r[2]):
            print(f"     h={h:<6} {run:6.1f} m of route inside   {n}")
    if toosteep:
        print(f"   {len(toosteep)} need more than {MAX_LIFT:.1f}m of lift — an "
              f"arcade or lobby recipe, not a rule:")
        for (n, h, lift, run) in sorted(toosteep, key=lambda r: -r[3]):
            print(f"     h={h:<6} would need {lift:5.1f}m   {run:6.1f} m inside   {n}")
    if tootall:
        print(f"   {len(tootall)} too tall to lift (> {MAX_H:.0f}m) — these need a "
              f"porte-cochere recipe, not a rule:")
        for (n, h, run) in sorted(tootall, key=lambda r: -r[2]):
            print(f"     h={h:<6} {run:6.1f} m of road inside   {n}")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
