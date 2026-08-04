"""Resort corrections from research/resort-footprints.md (2026-08-04).

Pipeline step — everything here must survive a rebuild, which is why the
one-off inline edits that first applied these moved into a script. Run after
build_district.py, before island.py (any point works; buildings only).

1. The 244-node "W Singapore" polygon TRACES THE CANAL BANK, not a building
   (research §confirmed by node count and shape) — it drew a vast flat slab
   along the Cove waterway. Dropped by its shape signature, not by index.
2. Heights, all previously calibration guesses on conserved low-rise:
   - Sofitel main block: 6.8 -> 12.5 (Kerry Hill pavilions, EST-PHOTO
     3 storeys + tall hipped roof; storeys UNPUBLISHED, stated as estimate)
   - Mess Hall: 20.4 -> 8.2 (two-storey conserved barracks family)
   - Raffles Sentosa lobby: 23.8 -> 6.5 (a villa-resort lobby pavilion; its
     own villa footprints carry 3.4-3.5)
3. Capella's colonial block (way/116818220) exists in live OSM UNNAMED, so
   the extract's name filter dropped it: rebuilt from the research's
   min-area rectangle (97.5 x 24.9 m at bearing 100 deg, centroid
   1.249705/103.824478) — position/extent surveyed, corners approximated,
   ws says so.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    did = sys.argv[1] if len(sys.argv) > 1 else "sentosa"
    path = os.path.join(HERE, f"{did}.json")
    d = json.load(open(path))
    B = d["buildings"]
    changed = []

    # 1. canal-bank pseudo-building
    for i in range(len(B) - 1, -1, -1):
        if (B[i].get("n") or "") == "W Singapore" and len(B[i].get("p", [])) > 100:
            B.pop(i)
            changed.append("dropped canal-bank 'W Singapore' polygon")

    # 2. heights
    FIX = {"Sofitel Singapore Sentosa Resort & Spa": 12.5,
           "Mess Hall": 8.2}
    for b in B:
        n = b.get("n") or ""
        if n in FIX and abs(b.get("h", 0) - FIX[n]) > 0.1:
            b["h"] = FIX[n]; b["hs"] = "research-est"
            changed.append(f"{n}: h -> {FIX[n]}")
        if n == "Raffles Sentosa Singapore" and b.get("h", 0) > 20:
            b["h"] = 6.5; b["hs"] = "research-est"
            b["low"] = 1     # the research: a villa-resort lobby pavilion
            changed.append("Raffles Sentosa lobby: h -> 6.5")

    # 3. Capella colonial block
    if not any((b.get("n") or "") == "Capella Colonial Block" for b in B):
        lat0 = d["origin"]["lat"]; lon0 = d["origin"]["lon"]
        m_lon = 111320.0 * math.cos(math.radians(lat0))
        cx = (103.824478 - lon0) * m_lon
        cz = (lat0 - 1.249705) * 110574.0
        hl, hs = 97.5 / 2, 24.9 / 2
        ang = math.radians(100.0)     # bearing: clockwise from north
        ux, uz = math.sin(ang), -math.cos(ang)
        nx, nz = -uz, ux
        p = [[round(cx + sx * hl * ux + sz * hs * nx, 1),
              round(cz + sx * hl * uz + sz * hs * nz, 1)]
             for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        area = 97.5 * 24.9
        B.append({"p": p + [p[0]], "n": "Capella Colonial Block", "h": 10.2,
                  "a": round(area), "hs": "research-est", "ws": "research-rect",
                  "low": 1})
        changed.append("added Capella Colonial Block (surveyed extent, approximated corners)")

    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"== resortfix {did}")
    for c in changed: print("   " + c)
    if not changed: print("   nothing to do (idempotent)")


if __name__ == "__main__":
    main()
