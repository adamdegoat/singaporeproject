#!/usr/bin/env python3
"""Turn raw Overpass JSON for the ION / Ngee Ann stretch into a compact scene file.

Coordinates are projected to local metres about a centre point:
  +x = east, +z = south, y = up (three.js convention).
OSM heights are unreliable here (Hilton is tagged 2 levels but 90m), so the
landmarks that carry recognition get hand-set heights and the rest fall back to
floor count, then to a per-type default.
"""
import json, math, os, re

HERE = os.path.dirname(os.path.abspath(__file__))

# Driven by build_district.py via the environment so one code path serves every
# district; the defaults keep a bare `python3 process.py` working on Orchard.
RAW_PATH = os.environ.get("SG_RAW") or os.path.join(HERE, "raw.json")
OUT_PATH = os.environ.get("SG_OUT") or os.path.join(HERE, "orchard.json")
AXIS_NAME = os.environ.get("SG_AXIS") or "orchard road"
LAT0 = float(os.environ.get("SG_LAT0") or 1.30370)
LON0 = float(os.environ.get("SG_LON0") or 103.83350)
M_PER_DEG_LAT = 110574.0
M_PER_DEG_LON = 111320.0 * math.cos(math.radians(LAT0))

# Hand-set heights in metres for the buildings that carry the recognition.
# Approximate, from published storey counts; exact enough for silhouette.
LANDMARKS = {
    "ion orchard":            {"h": 42,  "tower": 218, "key": True},
    "the orchard residences": {"h": 218, "key": True},
    "ngee ann city":          {"h": 139, "podium": 32, "key": True},
    "takashimaya":            {"h": 32,  "key": True},
    "wisma atria":            {"h": 80,  "key": True},
    "tang plaza":             {"h": 150, "key": True},
    "tangs":                  {"h": 26,  "key": True},
    "singapore marriott":     {"h": 150, "key": True},
    "shaw house":             {"h": 90},
    "shaw centre":            {"h": 90},
    "lucky plaza":            {"h": 85},
    "far east plaza":         {"h": 70},
    "paragon":                {"h": 72},
    "orchard towers":         {"h": 60},
    "palais renaissance":     {"h": 55},
    "hilton singapore orchard": {"h": 150},
    "grand hyatt":            {"h": 60},
    "forum":                  {"h": 40},
    "orchard central":        {"h": 62},
    "cathay cineleisure":     {"h": 38},
    "scape":                  {"h": 24},
    "mandarin gallery":       {"h": 40},
    "delfi orchard":          {"h": 45},
    "royal thai embassy":     {"h": 12},
    "istana":                 {"h": 16},
    "313somerset":            {"h": 42},
    "313 somerset":           {"h": 42},
    "wheelock place":         {"h": 92,  "key": True},
    "tripleone somerset":     {"h": 110, "key": True},
    "cairnhill nine":         {"h": 130, "key": True},
    "orchard gateway":        {"h": 45},
    "midpoint orchard":       {"h": 45},
    "concorde hotel":         {"h": 70},
    "york hotel":             {"h": 60},
    "goodwood park":          {"h": 18},
    "orchard parade":         {"h": 55},
    "liat towers":            {"h": 40},
    "the heeren":             {"h": 60},
    "somerset":               {"h": 40},
    # heights OSM had plainly wrong, or missing entirely
    "four seasons":           {"h": 68},
    "liat tower":             {"h": 45},
    "far east shopping":      {"h": 75},
    "international building": {"h": 58},
    "grand hyatt":            {"h": 70},
    "york hotel":             {"h": 68},
    "royal plaza on scotts":  {"h": 70},
    "voco orchard":           {"h": 80},
    "pullman singapore":      {"h": 92},
    "scotts square":          {"h": 150, "key": True},
    "design orchard":         {"h": 14},
    "pacific plaza":          {"h": 46},
    "orchard building":       {"h": 45},
    "forum the shopping":     {"h": 40},
    "pan pacific":            {"h": 58},
    "scotts 27":              {"h": 60},
    "shaw tower":             {"h": 60},
}
TYPE_DEFAULT = {
    "retail": 22, "commercial": 30, "hotel": 55, "apartments": 45,
    "residential": 40, "office": 45, "civic": 18, "house": 9,
    "roof": 5, "yes": 20, "school": 14, "church": 16, "parking": 12,
}
ROAD_WIDTH = {
    "trunk": 17.5, "primary": 15.0, "secondary": 12.0, "tertiary": 10.0,
    "residential": 8.0, "unclassified": 8.0, "service": 6.0,
    "living_street": 7.0, "pedestrian": 7.0, "footway": 3.4,
}


def proj(lat, lon):
    return ((lon - LON0) * M_PER_DEG_LON, (LAT0 - lat) * M_PER_DEG_LAT)


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", (s or "").lower()).strip()


def height_for(tags):
    name = norm(tags.get("name"))
    for key, spec in LANDMARKS.items():
        if key and key in name:
            return spec["h"], spec.get("key", False)
    h = tags.get("height")
    if h:
        try:
            return float(str(h).replace("m", "").strip()), False
        except ValueError:
            pass
    lv = tags.get("building:levels")
    if lv:
        try:
            return max(3.5, float(lv) * 3.6), False
        except ValueError:
            pass
    return TYPE_DEFAULT.get(tags.get("building", "yes"), 18), False


def ring(geometry):
    pts = [proj(p["lat"], p["lon"]) for p in geometry]
    if len(pts) > 2 and abs(pts[0][0] - pts[-1][0]) < 1e-6 and abs(pts[0][1] - pts[-1][1]) < 1e-6:
        pts = pts[:-1]
    return pts


def area(pts):
    a = 0.0
    for i in range(len(pts)):
        x1, z1 = pts[i]
        x2, z2 = pts[(i + 1) % len(pts)]
        a += x1 * z2 - x2 * z1
    return abs(a) / 2.0


# If Overpass will not serve the road layer, fall back to a hand-traced Orchard
# Road centreline so the build is never blocked. Approximate, and only used when
# the real ways are missing.
FALLBACK_ORCHARD = [
    (1.30666, 103.82676), (1.30594, 103.82834), (1.30510, 103.82985),
    (1.30437, 103.83124), (1.30380, 103.83259), (1.30322, 103.83401),
    (1.30252, 103.83548), (1.30170, 103.83692), (1.30080, 103.83830),
]


def main():
    raw = json.load(open(RAW_PATH))
    els = raw["elements"]
    buildings, roads, trees = [], [], []
    # Real map positions, so street furniture stops being placed at intervals we
    # invented. This is what makes it the actual street rather than a plausible one.
    crossings, signals, busstops, mrt, taxis = [], [], [], [], []

    for e in els:
        tags = e.get("tags", {})
        if e["type"] == "node":
            hw = tags.get("highway")
            rw = tags.get("railway")
            if tags.get("natural") == "tree":
                x, z = proj(e["lat"], e["lon"])
                trees.append([round(x, 1), round(z, 1)])
            elif hw == "crossing":
                x, z = proj(e["lat"], e["lon"])
                crossings.append([round(x, 1), round(z, 1)])
            elif hw == "traffic_signals":
                x, z = proj(e["lat"], e["lon"])
                signals.append([round(x, 1), round(z, 1)])
            elif hw == "bus_stop" or tags.get("public_transport") == "platform":
                x, z = proj(e["lat"], e["lon"])
                busstops.append({"p": [round(x, 1), round(z, 1)],
                                 "n": tags.get("name", "")})
            elif rw in ("subway_entrance", "station"):
                x, z = proj(e["lat"], e["lon"])
                mrt.append({"p": [round(x, 1), round(z, 1)],
                            "n": tags.get("name", ""), "kind": rw})
            elif tags.get("amenity") == "taxi":
                x, z = proj(e["lat"], e["lon"])
                taxis.append([round(x, 1), round(z, 1)])
            continue
        if e["type"] == "way" and tags.get("amenity") == "taxi" and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            taxis.append([round(cx, 1), round(cz, 1)])
            continue
        if e["type"] == "way" and tags.get("railway") == "subway_entrance" and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            mrt.append({"p": [round(cx, 1), round(cz, 1)],
                        "n": tags.get("name", ""), "kind": "subway_entrance"})
            continue
        if e["type"] == "way" and tags.get("natural") == "tree_row" and "geometry" in e:
            # a tree row is a line: plant along it every 8m
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            for i in range(len(pts) - 1):
                a0, a1 = pts[i], pts[i + 1]
                L = math.dist(a0, a1)
                steps = max(1, int(L // 8))
                for k in range(steps):
                    t = k / steps
                    trees.append([round(a0[0] + (a1[0] - a0[0]) * t, 1),
                                  round(a0[1] + (a1[1] - a0[1]) * t, 1)])
            continue
        if e["type"] != "way" or "geometry" not in e:
            continue

        if "building" in tags:
            pts = ring(e["geometry"])
            if len(pts) < 3:
                continue
            a = area(pts)
            if a < 45:                      # sheds, bin stores, map noise
                continue
            # spiky slivers triangulate badly and render as black shards
            per = sum(math.dist(pts[i], pts[(i + 1) % len(pts)]) for i in range(len(pts)))
            if per > 0 and (4 * math.pi * a) / (per * per) < 0.03:
                continue
            h, key = height_for(tags)
            # a 3,000 m2 footprint is never 3.5m tall: that is a bad tag, not a
            # single-storey building. Fall back to the type default.
            if h < 8 and a > 600:
                h = TYPE_DEFAULT.get(tags.get("building", "yes"), 24)
            # and a 150 m2 footprint with no tags is a shophouse or a small
            # block, not a 20m tower. Untagged small footprints were producing a
            # forest of thin slivers through the back lanes.
            untagged = not tags.get("height") and not tags.get("building:levels")
            if untagged and not key and a < 230:
                h = round(3.6 * (2 + (int(abs(a)) % 3)), 1)      # 2-4 storeys
            elif untagged and not key and a < 520:
                h = round(3.6 * (3 + (int(abs(a)) % 3)), 1)      # 3-5 storeys
            b = {
                "p": [[round(x, 1), round(z, 1)] for x, z in pts],
                "h": round(h, 1),
                "a": round(a),
            }
            if tags.get("name"):
                b["n"] = tags["name"]
            if key:
                b["k"] = 1
            buildings.append(b)

        elif "highway" in tags:
            kind = tags["highway"]
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            if len(pts) < 2:
                continue
            w = ROAD_WIDTH.get(kind, 6.0)
            lanes = tags.get("lanes")
            if lanes:
                try:
                    w = max(w, float(lanes) * 3.4)
                except ValueError:
                    pass
            r = {
                "p": [[round(x, 1), round(z, 1)] for x, z in pts],
                "w": round(w, 1),
                "k": kind,
            }
            if tags.get("name"):
                r["n"] = tags["name"]
            roads.append(r)

    if not any(AXIS_NAME in r.get("n", "").lower() for r in roads):
        print(f"  ! no '{AXIS_NAME}' way in data — using traced fallback centreline")
        roads.append({
            "p": [[round(x, 1), round(z, 1)] for x, z in
                  (proj(la, lo) for la, lo in FALLBACK_ORCHARD)],
            "w": 15.0, "k": "primary", "n": "Orchard Road",
        })

    # OSM splits Orchard Road into 28 short ways. Stitch them end-to-end into a
    # single centreline so the street can be dressed and ridden as one axis.
    def stitch(name_re, tol=32.0):
        segs = [r["p"][:] for r in roads if re.search(name_re, r.get("n", ""), re.I)]
        if not segs:
            return None
        segs.sort(key=lambda p: min(x * x + z * z for x, z in p))
        chain = segs.pop(0)
        changed = True
        while changed and segs:
            changed = False
            head, tail = chain[0], chain[-1]
            best, bd, mode = None, tol, None
            for i, sg in enumerate(segs):
                for (pt, m) in ((sg[0], "tail-start"), (sg[-1], "tail-end"),
                                (sg[0], "head-start"), (sg[-1], "head-end")):
                    anchor = tail if m.startswith("tail") else head
                    d = math.dist(anchor, pt)
                    if d < bd:
                        bd, best, mode = d, i, m
            if best is None:
                break
            sg = segs.pop(best)
            if mode == "tail-start":
                chain += sg[1:]
            elif mode == "tail-end":
                chain += list(reversed(sg))[1:]
            elif mode == "head-start":
                chain = list(reversed(sg))[:-1] + chain
            else:
                chain = sg[:-1] + chain
            changed = True
        return chain

    axis = stitch(AXIS_NAME)
    if axis and len(axis) > 3:
        alen = sum(math.dist(axis[i], axis[i + 1]) for i in range(len(axis) - 1))
        print(f"  stitched axis '{AXIS_NAME}': {len(axis)} pts, {alen:.0f} m")
    else:
        print("  ! could not stitch an axis, falling back")
        axis = [[round(x, 1), round(z, 1)] for x, z in
                (proj(la, lo) for la, lo in FALLBACK_ORCHARD)]

    # ---- keep buildings out of the carriageway -------------------------------
    # OSM footprints and OSM centrelines are surveyed separately, and our road
    # widths are inferred from lane tags, so a building can end up sitting in
    # the road. Push any vertex that falls inside a road corridor back out to
    # the kerb line rather than letting geometry interpenetrate.
    def seg_dist(px, pz, ax, az, bx, bz):
        vx, vz = bx - ax, bz - az
        L2 = vx * vx + vz * vz
        if L2 < 1e-9:
            return math.dist((px, pz), (ax, az)), ax, az
        t = max(0.0, min(1.0, ((px - ax) * vx + (pz - az) * vz) / L2))
        cx, cz = ax + vx * t, az + vz * t
        return math.dist((px, pz), (cx, cz)), cx, cz

    corridors = []
    for r in roads:
        if r["k"] in ("footway", "pedestrian"):
            continue
        clear = r["w"] / 2 + 1.2          # half the carriageway plus a kerb
        for i in range(len(r["p"]) - 1):
            corridors.append((r["p"][i], r["p"][i + 1], clear))
    if axis:
        aclear = 16.0 / 2 + 2.0
        for i in range(len(axis) - 1):
            corridors.append((axis[i], axis[i + 1], aclear))

    def subdivide(ring, maxlen=4.0):
        out = []
        n = len(ring)
        for i in range(n):
            a = ring[i]
            c = ring[(i + 1) % n]
            out.append(a)
            L = math.dist(a, c)
            if L > maxlen:
                steps = int(L // maxlen)
                for k in range(1, steps + 1):
                    t = k / (steps + 1)
                    out.append([round(a[0] + (c[0] - a[0]) * t, 1),
                                round(a[1] + (c[1] - a[1]) * t, 1)])
        return out

    for b in buildings:
        if len(b["p"]) < 40:                      # keep already-dense rings as they are
            b["p"] = subdivide(b["p"])

    moved_pts, moved_b = 0, 0
    for b in buildings:
        touched = False
        for j, (px, pz) in enumerate(b["p"]):
            for (a, c, clear) in corridors:
                d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
                if d < clear:
                    if d < 1e-6:
                        continue
                    # slide the vertex straight out to the corridor edge
                    nx, nz = (px - cx) / d, (pz - cz) / d
                    px, pz = cx + nx * clear, cz + nz * clear
                    touched = True
                    moved_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            moved_b += 1
    print(f"  road clearance: nudged {moved_pts} vertices across {moved_b} buildings")

    buildings.sort(key=lambda b: -b["a"])
    out = {
        "origin": {"lat": LAT0, "lon": LON0},
        "buildings": buildings,
        "roads": roads,
        "trees": trees,
        "crossings": crossings,
        "signals": signals,
        "busstops": busstops,
        "mrt": mrt,
        "taxis": taxis,
        "axis": {"p": [[round(x, 1), round(z, 1)] for x, z in axis], "w": 16.0, "n": "Orchard Road"},
    }
    path = OUT_PATH
    json.dump(out, open(path, "w"), separators=(",", ":"))

    named = [b for b in buildings if "n" in b]
    print(f"  buildings {len(buildings)}  (named {len(named)}, landmarks {sum(1 for b in buildings if b.get('k'))})")
    print(f"  roads {len(roads)}   osm trees {len(trees)}")
    print(f"  real POIs: {len(crossings)} crossings, {len(signals)} signals, "
          f"{len(busstops)} bus stops, {len(mrt)} MRT, {len(taxis)} taxi ranks")
    print(f"  wrote {path}  {os.path.getsize(path)/1024:.0f} KB")
    print("\nlargest by footprint:")
    for b in buildings[:12]:
        print(f"  {b.get('n','(unnamed)')[:34]:36s} {b['a']:>7} m2   h={b['h']}")


if __name__ == "__main__":
    main()
