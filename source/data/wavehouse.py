"""SURF COVE BY WAVE HOUSE SENTOSA — authored, because the map does not have it.

The owner, 2026-08-06: "wave house i want to make like a real game can play ok"

# ==========================================================================
# THIS VENUE IS CLOSED IN REAL LIFE AND IT STAYS IN THE GAME ON PURPOSE.
# THE OWNER'S CALL, 2026-08-08: "Keep it open i want to play it."
# DO NOT DELETE IT. DO NOT QUIETLY RENAME IT. It has now been raised THREE
# times and answered; anyone who reopens it is re-litigating a settled
# decision.
# ==========================================================================
#
# WHAT THIS HEADER USED TO SAY, AND WHY IT WAS WRONG. It opened "**AND IT IS
# OPEN**" and claimed the venue had reopened as Surf Cove and was TRADING, on
# the strength of a live booking site and published hours. That was a
# CORRECTION OF A CORRECTION and it was the one that was wrong:
#
#   15 Oct 2019   Wave House Sentosa's last day (Wikipedia, Sentosa closures)
#   Sep 2023      Tipsy Unicorn Beach Club opens in the SAME building, SAME
#                 address, 36 Siloso Beach Walk #01-01
#   23 Jan 2026   High Court winding-up order against operator Tipsy Bird
#   30 Jan 2026   Tipsy Unicorn ceases operations
#   May 2026      SDC's OWN island map lists neither Wave House nor Surf Cove.
#                 The only tenant it shows at this address is Scentopia.
#
# SDC's own venue page carries the string "Tipsy Unicorn has permanently
# closed." Time Out titles its page "Wave House Sentosa (CLOSED)"; Foursquare
# says "Surf Cove by Wave House (Now Closed)". `surfcove.sg` is a parked
# WordPress domain whose TLS certificate does not match its own hostname.
# Full evidence chain: research/sentosa-inventory-2026.md section 1.2.
#
# WHAT FOOLED ME WAS OTA LISTINGS — Klook, Traveloka, Headout, Streetdirectory
# and Yelp all still sell tickets to it. They are the least reliable source on
# this island and they must never be used to prove a venue is open. That is
# the rule this file paid for twice.
#
# So: the FACT is corrected here, and the BUILD is unchanged, because those are
# two different things and only the first one was ever mine to decide. Under
# SENTOSA.md the map's SHAPE is truth and the detail is designed — this is a
# designed attraction on a real site, and the owner wants to ride it.
#
# The real 36 Siloso Beach Walk in 2026, for whoever needs it later: Scentopia
# trading in #01-02, and a vacant three-storey beach-club shell in #01-01.

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

THE POSITION, AND THE FIRST VERSION OF IT WAS WRONG BY 74 METRES AND 17 OF
HEIGHT. Worth writing down, because it looked principled and was not.

The first rule was: anchor at the point on OUR Siloso Beach Walk geometry
NEAREST THE MIDDLE of OUR Siloso Beach sand polygon, then step toward the sand.
Every step of that reads as sound and the result was a venue on a HILLSIDE:

    chosen anchor          88.3 m from the beach centroid it was chosen to be
                           nearest to — because our `Siloso Beach Walk` records
                           are 19 scattered fragments, not one promenade
    resulting centre       NOT INSIDE the sand polygon at all
    ground under the       21.9 m at one end of the 46 m flow deck and 12.6 m
    46 x 24 m flow deck    at the other, against a LEVEL slab: one end buried
                           four metres, the other floating five

**A NEAREST-POINT IS NOT AN ANCHOR WHEN THE THING YOU MEASURE FROM IS IN
PIECES.** Same shape as everything else in this project: a proxy stood in for
the fact. The fact is "beachfront", and the beach is a polygon we already have.

Now it is placed from TWO sources, each used for what it actually knows:

  * the PUBLISHED ADDRESS gives the along-shore station. 36 Siloso Beach Walk
    geocodes to 1.254524, 103.813751 (spotyride's own map link), which through
    this scene's own projection is -2179.2, 12400.0. A geocoded street address
    knows WHERE ALONG a street a place is; it does not know our coastline, and
    that pin lands 41 m landward of our surveyed sand at a DEM height of 12.3 m.
  * OUR SURVEYED SAND gives the cross-shore position and the height. The site
    is searched on the Siloso Beach polygon for the FLATTEST footprint that is
    genuinely inside it, and scored against distance from the published pin.

The DEM is COP30 at 35 m cells, which is coarser than the beach is deep, so
the hill behind Siloso bleeds down over the sand. That is exactly why the
height cannot be taken at a pin and must be searched for.

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

# PUBLISHED: 36 Siloso Beach Walk geocoded. Used for the ALONG-SHORE station
# only — see the header for why its cross-shore position and its height are not
# trusted against our own surveyed sand.
PIN_LAT, PIN_LON = 1.254524, 103.813751
M_PER_DEG_LAT = 110574.0          # the same constants data/process.py projects with

# The FLOW DECK is what has to be flat — the part with water and riders on it.
DECK_W, DECK_D = 46.0, 24.0
MIN_EDGE = 14.0                   # how far inside the sand the centre must sit
MIN_H = 0.8                       # and above the water, not in the surf
MAX_RISE = 3.5                    # refuse rather than build a slab in a hill


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
    grid = d.get("terrain")
    if not sand or not grid or not grid.get("h"):
        print("  ! Siloso Beach sand or the height grid is missing — refusing to place it")
        return
    org = d.get("origin") or {}
    if not org.get("lat"):
        print("  ! the scene has no origin — cannot project the published address")
        return

    def height(x, z):
        """The scene's own bilinear height, read exactly as src/terrain.js reads it."""
        fx = (x - grid["x0"]) / grid["cell"]
        fz = (z - grid["z0"]) / grid["cell"]
        i = max(0, min(grid["nx"] - 2, int(math.floor(fx))))
        j = max(0, min(grid["nz"] - 2, int(math.floor(fz))))
        tx = min(1.0, max(0.0, fx - i))
        tz = min(1.0, max(0.0, fz - j))
        h = grid["h"]
        a0, b0 = h[j * grid["nx"] + i], h[j * grid["nx"] + i + 1]
        c0, d0 = h[(j + 1) * grid["nx"] + i], h[(j + 1) * grid["nx"] + i + 1]
        return (a0 * (1 - tx) + b0 * tx) * (1 - tz) + (c0 * (1 - tx) + d0 * tx) * tz

    def inpoly(px, pz, poly):
        c, m = False, len(poly)
        for i in range(m):
            x1, z1 = poly[i]
            x2, z2 = poly[(i + 1) % m]
            if ((z1 > pz) != (z2 > pz)) and \
               (px < (x2 - x1) * (pz - z1) / ((z2 - z1) or 1e-9) + x1):
                c = not c
        return c

    def seg_d(px, pz, a0, b0):
        ax, az = a0
        vx, vz = b0[0] - ax, b0[1] - az
        l2 = vx * vx + vz * vz or 1
        t = max(0.0, min(1.0, ((px - ax) * vx + (pz - az) * vz) / l2))
        return math.hypot(ax + vx * t - px, az + vz * t - pz)

    m = len(sand)

    def edge_d(px, pz):
        return min(seg_d(px, pz, sand[i], sand[(i + 1) % m]) for i in range(m))

    # THE PUBLISHED ADDRESS, through this scene's own projection.
    mlon = 111320.0 * math.cos(math.radians(org["lat"]))
    px0 = (PIN_LON - org["lon"]) * mlon
    pz0 = (org["lat"] - PIN_LAT) * M_PER_DEG_LAT

    # THE SITE SEARCH. Flattest footprint that is genuinely on the sand, scored
    # against how far it drags the venue off the published station. The weight
    # is 0.02 rise-metres per metre of drift, so 50 m of move has to buy a whole
    # metre of flatness — it cannot wander down the beach for a rounding.
    depth = math.sqrt(SITE_M2 / ASPECT)
    width = SITE_M2 / depth
    HW, HD = DECK_W / 2, DECK_D / 2
    best = None
    for dx in range(-220, 221, 4):
        for dz in range(-220, 221, 4):
            cx, cz = px0 + dx, pz0 + dz
            if not inpoly(cx, cz, sand):
                continue
            if edge_d(cx, cz) < MIN_EDGE:
                continue
            hs = [height(cx + u, cz + v) for u in (-HW, 0, HW) for v in (-HD, 0, HD)]
            lo, hi = min(hs), max(hs)
            if lo < MIN_H:
                continue
            drift = math.hypot(dx, dz)
            score = (hi - lo) + drift * 0.02
            if best is None or score < best[0]:
                best = (score, hi - lo, lo, hi, drift, cx, cz)
    if best is None:
        print("  ! no site on Siloso Beach clears the flatness and edge tests "
              "— refusing to place it")
        return
    _, rise, glo, ghi, drift, cx, cz = best
    if rise > MAX_RISE:
        print(f"  ! flattest site on the beach still rises {rise:.1f} m across "
              f"the flow deck — refusing rather than building a slab in a hill")
        return

    # THE BEARING COMES FROM THE SHORELINE, not from a road. A beachfront venue
    # faces the sea; the sand polygon's own edges near the site say which way
    # that is. Averaged as an AXIS (mod pi) over every edge within 70 m, because
    # a polygon's winding makes half of them point the other way and a plain
    # mean of headings would cancel them out.
    sx = sz = 0.0
    for i in range(m):
        a0, b0 = sand[i], sand[(i + 1) % m]
        if seg_d(cx, cz, a0, b0) > 70.0:
            continue
        vx, vz = b0[0] - a0[0], b0[1] - a0[1]
        L = math.hypot(vx, vz)
        if L < 1.0:
            continue
        ang = math.atan2(vx, vz) % math.pi
        sx += math.cos(2 * ang) * L
        sz += math.sin(2 * ang) * L
    ang = (math.atan2(sz, sx) / 2) % math.pi
    ux, uz = math.sin(ang), math.cos(ang)      # along the shore
    # and the renderer's normal (-uz, ux) must point AT THE SEA, which here means
    # downhill: the beach falls to the water. Flip the along-shore direction if
    # it does not, rather than flipping the normal, so `a` stays the true bearing.
    if height(cx - uz * 30, cz + ux * 30) > height(cx + uz * 30, cz - ux * 30):
        ux, uz = -ux, -uz
        ang = math.atan2(ux, uz)

    d["wavehouse"] = {
        "n": "Surf Cove by Wave House Sentosa",
        "p": [round(cx, 1), round(cz, 1)],
        "a": round(ang, 3),
        "w": round(width, 1), "d": round(depth, 1),
        "rider": [FLOWRIDER_W, FLOWRIDER_L],
        "barrel": FLOWBARREL_R,
        "deck": [DECK_W, DECK_D],
        # THE GROUND THE RENDERER MUST SEAT AGAINST, measured here so it is not
        # re-derived from a single centre sample. A level deck on a beach seats
        # on the HIGH ground under it and skirts down to the low — the seatY
        # lesson, which buried nineteen buildings the day it was taken the other
        # way round.
        "ground": [round(glo, 2), round(ghi, 2)],
        "src": "along-shore station from the PUBLISHED address 36 Siloso Beach "
               "Walk (1.254524, 103.813751) projected through this scene's own "
               "origin; cross-shore position, bearing and height searched on OUR "
               "surveyed Siloso Beach sand for the flattest footprint (the pin "
               "itself lands 41 m landward of the sand at a COP30 height of "
               "12.3 m, and the DEM's 35 m cells are coarser than the beach is "
               "deep); site area 6,503 m2 (70,000 sq ft) PUBLISHED; every form "
               "dimension AUTHORED from the published wave descriptions",
    }

    # ...and it becomes a place you can find, arrive at and travel to.
    #
    # RE-RUNNING MUST MOVE THE PIN. The first version only ever APPENDED when
    # the name was absent, so once the record existed the attraction — the
    # label, the entrance, the travel destination — was frozen at the old
    # position while `wavehouse` moved. Moving the venue and leaving the sign
    # 74 m up a hill is worse than not moving it.
    existing = None
    for o in (d.get("attractions") or []):
        if str(o.get("n") or "") == d["wavehouse"]["n"]:
            existing = o
            break
    if existing is not None:
        existing["p"] = [round(cx, 1), round(cz, 1)]
    else:
        d.setdefault("attractions", []).append({
            "n": d["wavehouse"]["n"], "k": "attraction",
            "p": [round(cx, 1), round(cz, 1)],
            # THE GUIDE TELLS YOU HOW TO PLAY, not just where you are.
            #
            # The owner, 2026-08-06: "got avatar guide on how to play and all.
            # U know like real places ya the experience."
            #
            # Written AFTER the rides existed and from what they actually do —
            # two lanes on the sheet, one on the barrel, at the two published
            # water speeds. This session found two features that were described
            # in comments and never ran, so a line that promises a ride the
            # code does not implement is the same class of lie as a label with
            # nothing under it.
            "t": "Two lanes on the FlowRider sheet, so ride it with a friend. "
                 "The barrel is the fast one.",
        })

    print(f"== wavehouse {a.id}")
    print(f"   {d['wavehouse']['n']}")
    print(f"   published pin  {px0:.1f}, {pz0:.1f}   ground {height(px0, pz0):.1f} m, "
          f"{'on' if inpoly(px0, pz0, sand) else 'OFF'} the sand")
    print(f"   built at       {cx:.1f}, {cz:.1f}   ground {glo:.1f}-{ghi:.1f} m "
          f"(rise {rise:.1f} across the {DECK_W:.0f}x{DECK_D:.0f} flow deck), "
          f"{drift:.0f} m from the pin, {edge_d(cx, cz):.0f} m inside the sand")
    print(f"   facing         a={ang:.3f} rad, from the shoreline")
    print(f"   site           {width:.0f} x {depth:.0f} m "
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
