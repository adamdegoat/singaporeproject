"""Bind the Siloso strip's venue identities onto their unnamed footprints.

The venues are surveyed as coordinates (research/siloso-venues.md, per-venue,
2026 state) but their building footprints carry no OSM name — so the world
drew nameless boxes at calibrated guess heights: Ola Beach Club, a one-storey
beach club, stood 27.2m tall; the Bikini Bar/Coastes terrace stood 20.4m.

Binding rule: STRICT CONTAINMENT ONLY. The venue point must lie inside the
footprint (the hotels.py lesson — a wrong name on a landmark is worse than
none; no nearest-distance guessing). A footprint containing TWO venues gets
no building name (the tenant signs carry them) but still takes the honest
height. Heights are EST-PHOTO from the research brief — every venue there is
one storey (Emerald Pavilion is one tall vaulted volume) — and are marked
hs:"venue-est" so the provenance ledger counts them estimated.

Closed venues (Rumours 4 Jan 2026, Tipsy Unicorn 30 Jan 2026, Café del Mar
years ago) are deliberately NOT here. Do not add them.

Run after build_district.py (any point before/after island.py is fine —
buildings are only demoted there, never rewritten). Idempotent.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# name, lon, lat, height_m (EST-PHOTO, brief section)
VENUES = [
    ("Trapizza",         103.81204, 1.25623, 5.5),   # §1.3, 1 storey + high roof
    ("Ola Beach Club",   103.81543, 1.25305, 6.0),   # §1.7
    ("Bikini Bar",       103.81574, 1.25272, 4.8),   # §1.8
    ("Coastes",          103.81605, 1.25249, 5.0),   # §1.9
    ("Emerald Pavilion", 103.8146,  1.2540,  8.0),   # §1.6, barrel vault volume
]


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    path = os.path.join(HERE, f"{did}.json")
    data = json.load(open(path))
    lat0, lon0 = data["origin"]["lat"], data["origin"]["lon"]
    m_lat = 110574.0
    m_lon = 111320.0 * math.cos(math.radians(lat0))

    def inside(px, pz, ring):
        c = False
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, zi = ring[i]; xj, zj = ring[j]
            if (zi > pz) != (zj > pz) and px < (xj - xi) * (pz - zi) / (zj - zi) + xi:
                c = not c
            j = i
        return c

    hits = {}
    for name, lon, lat, h in VENUES:
        x = (lon - lon0) * m_lon
        z = (lat0 - lat) * m_lat
        for bi, b in enumerate(data["buildings"]):
            p = b.get("p", [])
            if len(p) < 3:
                continue
            cx = sum(q[0] for q in p) / len(p)
            cz = sum(q[1] for q in p) / len(p)
            if math.hypot(cx - x, cz - z) < 150 and inside(x, z, p):
                hits.setdefault(bi, []).append((name, h))
                break

    named = lowered = 0
    for bi, vs in hits.items():
        b = data["buildings"][bi]
        newH = min(h for _, h in vs)
        if b.get("h") != newH:
            b["h"] = newH
            b["hs"] = "venue-est"
            # a SOURCE says one storey (the research brief, per venue), which
            # is exactly what check.py's squat guard asks `low` to attest —
            # excluded by provenance, never by fudging the threshold
            b["low"] = 1
            lowered += 1
        if len(vs) == 1 and not b.get("name"):
            b["name"] = vs[0][0]
            b["ns"] = "venue-bind"
            named += 1
        elif len(vs) > 1:
            print(f"   shared footprint, no building name (tenant signs carry them): "
                  + ", ".join(n for n, _ in vs))
    json.dump(data, open(path, "w"), separators=(",", ":"))
    print(f"   {named} venue building(s) named, {lowered} honest height(s) set "
          f"of {len(VENUES)} venues; unbound venues were left unbound on purpose")


if __name__ == "__main__":
    main()
