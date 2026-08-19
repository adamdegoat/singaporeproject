#!/usr/bin/env python3
"""Apply authored.json's footprints to an ALREADY-BUILT scene file.

authored.json is consumed by process.py during a full district build — which
refetches OSM and reprocesses everything, a heavy operation this project does
not run for one added building. This applies the same entries to the built
scene directly, with the same geometry math as process.py's slab branch, so
the entry lives in ONE canonical place and reaches the world without a
rebuild. A full rebuild later produces the identical footprint and the
dedupe below keeps it single.

Run:  python3 data/authoredapply.py sentosa     (idempotent)
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"][0], REG["island_origin"][1]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))
def proj(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)

did = next((a for a in sys.argv[1:] if not a.startswith("-")), "sentosa")
path = os.path.join(HERE, f"{did}.json")
d = json.load(open(path))
blds = d.get("buildings") or []
auth = json.load(open(os.path.join(HERE, "authored.json")))["buildings"]
added = 0
for e in auth:
    if e.get("district") != did or e.get("shape") != "slab":
        continue
    cx, cz = proj(e["lat"], e["lon"])
    # already there? same name near the point, or ANY footprint whose centroid
    # is within 8m (a rebuild that ran process.py already carries it)
    dup = False
    for b in blds:
        pts = b.get("p") or []
        if not pts:
            continue
        bx = sum(p[0] for p in pts) / len(pts)
        bz = sum(p[1] for p in pts) / len(pts)
        if math.hypot(bx - cx, bz - cz) < 8:
            dup = True
            break
    if dup:
        continue
    (la0, lo0), (la1, lo1) = e["baseline"]
    x0, z0 = proj(la0, lo0)
    x1, z1 = proj(la1, lo1)
    dx, dz = x1 - x0, z1 - z0
    L = math.hypot(dx, dz) or 1.0
    nx, nz = -dz / L, dx / L
    mx, mz = (x0 + x1) / 2, (z0 + z1) / 2
    if (cx - mx) * nx + (cz - mz) * nz < 0:
        nx, nz = -nx, -nz
    dep = float(e["depth"])
    ring = [(x0, z0), (x1, z1), (x1 + nx * dep, z1 + nz * dep), (x0 + nx * dep, z0 + nz * dep)]
    ar = abs(sum(ring[i][0] * ring[(i + 1) % 4][1] - ring[(i + 1) % 4][0] * ring[i][1]
                 for i in range(4))) / 2
    blds.append({"p": [[round(x, 1), round(z, 1)] for x, z in ring],
                 "h": e["h"], "n": e["n"], "hs": "authored", "a": round(ar)})
    added += 1
    print(f"  authored {e['n']}: {round(ar)} m2 at ({cx:.0f}, {cz:.0f})")
if added:
    d["buildings"] = blds
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"  written: {added} authored footprint(s) into {did}.json")
else:
    print("  nothing to add (all authored footprints already present)")
