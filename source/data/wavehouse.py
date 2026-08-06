"""SURF COVE BY WAVE HOUSE SENTOSA — authored, because the map does not have it.

The owner, 2026-08-06: "wave house i want to make like a real game can play ok"

**AND IT IS OPEN.** I told him it had closed and he replied "if its close alr
then no need do" — so a half-remembered fact nearly deleted a real attraction.
Checked properly afterwards, which is the rule (never guess a published fact):

  * the ORIGINAL "Wave House Sentosa" did close, and Time Out still lists it
    that way, which is where the wrong impression came from
  * it reopened as **SURF COVE by Wave House Sentosa** and is TRADING — live
    booking site, published hours 12:00-21:00, and FlowRider's own page refers
    to "their new location Surf Cove by Wave House Sentosa"

So it is a current Sentosa place, not a Madagascar case. Correcting the record
mattered more than the build: the owner had already decided against it on my
word.

PUBLISHED (surfcove.sg, FlowRider, streetdirectory; retrieved 2026-08-06):

    address        36 Siloso Beach Walk, Siloso Beach
    site           70,000 sq ft  = 6,503 m2 of beachfront
    Double FlowRider   the gentler wave: a non-curling ENDLESS SHEET of water
                       at 20 mph (32 km/h) over a composite vinyl surface,
                       "much like a trampoline"
    FlowBarrel         10 ft, the hard one: 100,000 gallons per minute, up to
                       48 km/h, a barrelling wave
    also           Restaurant + Bar, outdoor beach bars, retail
    claim          the only site in Asia with BOTH

NOT IN OSM — checked in the 2026-08-06 cross-check: `wave house` returns zero
raw elements. So unlike the Lookout Loop, the golf course or the Express
stations, none of this is a recovery. Position and form are AUTHORED and this
file says exactly which parts.

THE POSITION IS DERIVED FROM OUR OWN DATA, not typed in. The venue fronts
Siloso Beach Walk on the beach side, so the anchor is the point on OUR Siloso
Beach Walk geometry nearest the middle of OUR Siloso Beach sand polygon, then
stepped toward the sand. That way it lands on the beach this world actually
built rather than at a lat/lon that may not agree with our coastline.

Run:  python3 data/wavehouse.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# PUBLISHED site area; the proportion is authored to sit along the beach walk.
SITE_M2 = 6503.0
ASPECT = 2.1                      # authored: a beachfront strip, not a square
# AUTHORED forms, sized from the published ride facts.
FLOWRIDER_W, FLOWRIDER_L = 12.0, 18.0   # the double sheet: two riders abreast
FLOWBARREL_R = 7.5                      # a 10ft barrel needs about this radius


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    sand = None
    for g in (d.get("green") or []):
        if g.get("k") == "sand" and str(g.get("n") or "") == "Siloso Beach" and g.get("p"):
            sand = g["p"]
            break
    walk = [r for r in (d.get("roads") or [])
            if str(r.get("n") or "") == "Siloso Beach Walk" and r.get("p")]
    if not sand or not walk:
        print("  ! Siloso Beach or Siloso Beach Walk missing — refusing to place it")
        return

    bx = sum(q[0] for q in sand) / len(sand)
    bz = sum(q[1] for q in sand) / len(sand)
    # nearest point on the walk to the middle of the beach
    best, bd = None, 1e18
    for r in walk:
        p = r["p"]
        for i in range(len(p) - 1):
            ax, az = p[i]
            vx, vz = p[i + 1][0] - ax, p[i + 1][1] - az
            l2 = vx * vx + vz * vz or 1
            t = max(0.0, min(1.0, ((bx - ax) * vx + (bz - az) * vz) / l2))
            qx, qz = ax + vx * t, az + vz * t
            dd = (qx - bx) ** 2 + (qz - bz) ** 2
            if dd < bd:
                bd = dd
                best = (qx, qz, vx, vz, math.sqrt(l2))

    qx, qz, vx, vz, L = best
    ux, uz = vx / L, vz / L                    # along the walk
    nx, nz = -uz, ux                           # across it
    # step toward the sand, so the venue sits between the walk and the beach
    if (bx - qx) * nx + (bz - qz) * nz < 0:
        nx, nz = -nx, -nz
    depth = math.sqrt(SITE_M2 / ASPECT)
    width = SITE_M2 / depth
    cx = qx + nx * (depth * 0.45)
    cz = qz + nz * (depth * 0.45)

    d["wavehouse"] = {
        "n": "Surf Cove by Wave House Sentosa",
        "p": [round(cx, 1), round(cz, 1)],
        # the along-walk bearing, so the venue faces the sea square-on
        "a": round(math.atan2(ux, uz), 3),
        "w": round(width, 1), "d": round(depth, 1),
        "rider": [FLOWRIDER_W, FLOWRIDER_L],
        "barrel": FLOWBARREL_R,
        "src": "position DERIVED from our own Siloso Beach + Siloso Beach Walk "
               "geometry; site area 6,503 m2 (70,000 sq ft) PUBLISHED; ride "
               "dimensions AUTHORED from the published wave descriptions",
    }

    # ...and it becomes a place you can find, arrive at and travel to.
    have = {str(o.get("n") or "") for o in (d.get("attractions") or [])}
    if d["wavehouse"]["n"] not in have:
        d.setdefault("attractions", []).append({
            "n": d["wavehouse"]["n"], "k": "attraction",
            "p": [round(cx, 1), round(cz, 1)],
            "t": "Two standing waves: the Double FlowRider, and the 10ft FlowBarrel.",
        })

    print(f"== wavehouse {a.id}")
    print(f"   {d['wavehouse']['n']}")
    print(f"   at {cx:.1f}, {cz:.1f}   {width:.0f} x {depth:.0f} m "
          f"({SITE_M2:,.0f} m2 published)")
    print(f"   Double FlowRider {FLOWRIDER_W:.0f}x{FLOWRIDER_L:.0f} m, "
          f"FlowBarrel r={FLOWBARREL_R:.1f} m  (both authored)")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
