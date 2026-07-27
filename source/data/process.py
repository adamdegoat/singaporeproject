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
#
# Figures marked VERIFIED were checked against published sources on 2026-07-27
# rather than estimated from a storey count. Several of the estimates were well
# out: Ngee Ann City was 11m too tall, Wheelock Place 17m too short, Tang Plaza
# 32m too tall, and 313@somerset was carrying 42m for a mall with five floors
# above ground.
#
#   ION Orchard / The Orchard Residences  en.wikipedia.org/wiki/ION_Orchard
#     12 storeys (8 retail, 4 car park); tower 218m over 56 floors; ION Sky on
#     55-56; more than 90m of LED media wall on the facade
#   Ngee Ann City                         skydb.net + archify.com/sg
#     128.4m; twin 26-28 storey towers over a 7-floor retail podium clad in
#     African Red polished granite; podium massing modelled on the Great Wall
#   Wheelock Place                        gorillaspace.sg + en.wikipedia.org
#     21 storeys, about 109m; 16 office levels over a 5-floor podium; Kisho
#     Kurokawa's conical glass atrium
#   Paragon                               paragon.com.sg/about-us
#     6 retail floors plus a 20-storey medical and office tower
#   313@somerset                          313somerset.com.sg/about-us
#     8 retail levels, but only 5 above ground (L1-L5) and 3 basement
#   Hilton Singapore Orchard              en.wikipedia.org/wiki/Hilton_Singapore_Orchard
#     two towers: 36 storeys at 144m and 40 storeys at 152m
#   Tang Plaza / Singapore Marriott       roots.gov.sg orchard-heritage-trail
#     33-storey tower under a green-tiled pagoda roof, 403 rooms
#   Orchard Central                       en.wikipedia.org/wiki/Orchard_Central
#     12 storeys, Singapore's first high-rise vertical mall
LANDMARKS = {
    "ion orchard":            {"h": 42,  "tower": 218, "key": True},
    "the orchard residences": {"h": 218, "key": True},
    "ngee ann city":          {"h": 128, "podium": 30, "key": True},   # VERIFIED 128.4m
    "takashimaya":            {"h": 32,  "key": True},
    "wisma atria":            {"h": 80,  "key": True},
    "tang plaza":             {"h": 118, "key": True},   # VERIFIED 33 storeys
    "tangs":                  {"h": 26,  "key": True},
    "singapore marriott":     {"h": 118, "key": True},   # VERIFIED, same tower
    "shaw house":             {"h": 90},
    "shaw centre":            {"h": 90},
    "lucky plaza":            {"h": 85},
    "far east plaza":         {"h": 70},
    "paragon":                {"h": 78, "podium": 24},   # VERIFIED 6 retail + 20-storey tower
    "orchard towers":         {"h": 60},
    "palais renaissance":     {"h": 55},
    "hilton singapore orchard": {"h": 152},   # VERIFIED taller of two towers
    "grand hyatt":            {"h": 60},
    "forum":                  {"h": 40},
    "orchard central":        {"h": 56},   # VERIFIED 12 storeys
    "cathay cineleisure":     {"h": 38},
    "scape":                  {"h": 24},
    "mandarin gallery":       {"h": 40},
    "delfi orchard":          {"h": 45},
    "royal thai embassy":     {"h": 12},
    "istana":                 {"h": 16},
    "313somerset":            {"h": 28},   # VERIFIED 5 floors above ground
    "313 somerset":           {"h": 28},   # VERIFIED, same mall
    "wheelock place":         {"h": 109, "key": True},   # VERIFIED 21 storeys
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
    """Returns (height, is_landmark, source). Source is 'osm' when the figure
    comes from a tag, 'named' when hand-entered, 'guess' when a type default."""
    name = norm(tags.get("name"))
    for key, spec in LANDMARKS.items():
        if key and key in name:
            return spec["h"], spec.get("key", False), "named"
    h = tags.get("height")
    if h:
        try:
            return float(str(h).replace("m", "").strip()), False, "osm"
        except ValueError:
            pass
    lv = tags.get("building:levels")
    if lv:
        try:
            # 3.4m per storey is closer for SG commercial than 3.6
            return max(3.5, float(lv) * 3.4), False, "osm"
        except ValueError:
            pass
    return TYPE_DEFAULT.get(tags.get("building", "yes"), 18), False, "guess"


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


def _neg_layer(tags):
    try:
        return float(tags.get("layer", 0)) < 0
    except (TypeError, ValueError):
        return False


def carry_terrain(out_path, scene):
    """Keep the heightfield across a reprocess.

    terrain.py samples elevation from a free API along the road centrelines and
    writes the grid into the scene file. Reprocessing rebuilds that file from
    the raw OSM dump, which silently dropped the grid and flattened the whole
    district. The centrelines have not changed, so the old grid is still valid:
    carry it over rather than re-fetching 2,372 samples.
    """
    import os as _os
    if not _os.path.exists(out_path):
        return False
    try:
        with open(out_path) as fh:
            old = json.load(fh)
    except Exception:
        return False
    if old.get("terrain"):
        scene["terrain"] = old["terrain"]
        return True
    return False


def main():
    raw = json.load(open(RAW_PATH))
    els = raw["elements"]
    buildings, roads, trees = [], [], []
    skipped_underground = 0
    # Real map positions, so street furniture stops being placed at intervals we
    # invented. This is what makes it the actual street rather than a plausible one.
    crossings, signals, busstops, mrt, taxis = [], [], [], [], []
    bridges, covered, shops = [], [], []

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
            elif tags.get("shop") or tags.get("amenity") in (
                    "restaurant", "cafe", "bank", "fast_food", "pharmacy", "cinema"):
                if tags.get("name"):
                    x, z = proj(e["lat"], e["lon"])
                    shops.append({"p": [round(x, 1), round(z, 1)], "n": tags["name"],
                                  "k": tags.get("shop") or tags.get("amenity")})
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
        if e["type"] == "way" and (tags.get("shop") or tags.get("amenity") in (
                "restaurant", "cafe", "bank", "fast_food", "pharmacy", "cinema")) \
                and tags.get("name") and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            shops.append({"p": [round(cx, 1), round(cz, 1)], "n": tags["name"],
                          "k": tags.get("shop") or tags.get("amenity")})
            if "building" not in tags:
                continue                      # otherwise fall through: it is a building too
        if e["type"] == "way" and tags.get("highway") == "footway" and "geometry" in e:
            line = [[round(x, 1), round(z, 1)] for x, z in
                    (proj(p["lat"], p["lon"]) for p in e["geometry"])]
            if tags.get("bridge"):
                bridges.append(line)
                continue
            if tags.get("covered"):
                covered.append(line)
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

        # Underground structures are not buildings you can see. Dhoby Ghaut's
        # concourse and Bencoolen station are mapped as building footprints with
        # layer=-1, and extruding them put an 18m mass across the road with the
        # chase camera travelling inside it.
        if "building" in tags and (tags.get("location") == "underground"
                                   or _neg_layer(tags)):
            skipped_underground += 1
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
            h, key, hsrc = height_for(tags)
            # a 3,000 m2 footprint is never 3.5m tall: that is a bad tag, not a
            # single-storey building. Fall back to the type default.
            if h < 8 and a > 600:
                h = TYPE_DEFAULT.get(tags.get("building", "yes"), 24)
            # and a 150 m2 footprint with no tags is a shophouse or a small
            # block, not a 20m tower. Untagged small footprints were producing a
            # forest of thin slivers through the back lanes.
            untagged = hsrc == "guess"
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
            if hsrc != "guess":
                b["hs"] = hsrc          # height provenance, for the accuracy ledger
            buildings.append(b)

        elif "highway" in tags:
            kind = tags["highway"]
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            if len(pts) < 2:
                continue
            w = ROAD_WIDTH.get(kind, 6.0)
            wsrc = "class-default"
            if tags.get("width"):
                try:
                    w = float(str(tags["width"]).replace("m", "").strip())
                    wsrc = "osm-width"
                except ValueError:
                    pass
            lanes = tags.get("lanes")
            if wsrc != "osm-width" and lanes:
                try:
                    n = float(lanes)
                    # 3.4m per lane is the SG norm, plus a shoulder each side on
                    # anything bigger than a lane-and-a-half
                    w = n * 3.4 + (1.2 if n >= 2 else 0.4)
                    wsrc = "osm-lanes"
                except ValueError:
                    pass
            r = {
                "p": [[round(x, 1), round(z, 1)] for x, z in pts],
                "w": round(w, 1),
                "k": kind,
            }
            if lanes:
                try:
                    r["lanes"] = int(float(lanes))
                except ValueError:
                    pass
            if tags.get("oneway") == "yes":
                r["oneway"] = 1
            for tk in ("turn:lanes", "turn:lanes:forward"):
                if tags.get(tk):
                    r["turns"] = tags[tk]
                    break
            if tags.get("sidewalk"):
                r["sidewalk"] = tags["sidewalk"]
            r["ws"] = wsrc
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
    # total length of every way carrying the axis name, whether or not our bbox
    # reached it — this is what the coverage check compares against
    axis_full = 0.0
    for r in roads:
        if AXIS_NAME in (r.get("n") or "").lower():
            axis_full += sum(math.dist(r["p"][i], r["p"][i + 1])
                             for i in range(len(r["p"]) - 1))
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

    # A spatial hash over the corridors. Testing every vertex against all 6,587
    # of them is 300 million distance calculations and takes about twenty
    # minutes; only the handful in neighbouring cells can possibly be close.
    CGRID_CELL = 50.0
    cgrid = {}
    for seg in corridors:
        (ax, az), (bx, bz), clear = seg
        for gx in range(int((min(ax, bx) - clear) // CGRID_CELL),
                        int((max(ax, bx) + clear) // CGRID_CELL) + 1):
            for gz in range(int((min(az, bz) - clear) // CGRID_CELL),
                            int((max(az, bz) + clear) // CGRID_CELL) + 1):
                cgrid.setdefault((gx, gz), []).append(seg)

    def corridors_near(px, pz):
        return cgrid.get((int(px // CGRID_CELL), int(pz // CGRID_CELL)), ())

    def clear_vertex(px, pz):
        """Slide a vertex out of every corridor it is inside. Returns the point
        and whether it moved."""
        moved = False
        for (a, c, clear) in corridors_near(px, pz):
            d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
            if d < clear and d > 1e-6:
                nx, nz = (px - cx) / d, (pz - cz) / d
                px, pz = cx + nx * clear, cz + nz * clear
                moved = True
        return px, pz, moved

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
            px, pz, moved = clear_vertex(px, pz)
            if moved:
                touched = True
                moved_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            moved_b += 1
    print(f"  road clearance: nudged {moved_pts} vertices across {moved_b} buildings")

    def simplify(ring, eps=0.35):
        """Drop vertices that sit on the straight line between their neighbours."""
        if len(ring) < 5:
            return ring
        out = [ring[0]]
        for i in range(1, len(ring) - 1):
            a, b, c = out[-1], ring[i], ring[i + 1]
            vx, vz = c[0] - a[0], c[1] - a[1]
            L = math.hypot(vx, vz)
            if L < 1e-6:
                continue
            # perpendicular distance from b to the line a->c
            d = abs((b[0] - a[0]) * vz - (b[1] - a[1]) * vx) / L
            if d > eps:
                out.append(b)
        out.append(ring[-1])
        return out

    before_pts = sum(len(b["p"]) for b in buildings)
    for b in buildings:
        b["p"] = simplify(b["p"])
    after_pts = sum(len(b["p"]) for b in buildings)
    print(f"  simplified rings: {before_pts} -> {after_pts} vertices "
          f"({100 - 100 * after_pts // max(before_pts, 1)}% smaller)")

    # Simplification draws a straight line between the vertices it keeps, and
    # that line can cut back through a corridor the clearance pass had just
    # emptied. So clear again afterwards: the order clear-then-simplify quietly
    # put building walls back into the carriageway on about thirty buildings.
    again_pts, again_b = 0, 0
    for b in buildings:
        touched = False
        for j, (px, pz) in enumerate(b["p"]):
            px, pz, moved = clear_vertex(px, pz)
            if moved:
                touched = True
                again_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            again_b += 1
    print(f"  re-cleared after simplify: {again_pts} vertices "
          f"across {again_b} buildings")

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
        "bridges": bridges,
        "covered": covered,
        "shops": shops,
        "axisFullLength": round(axis_full, 1),
        "axis": {"p": [[round(x, 1), round(z, 1)] for x, z in axis], "w": 16.0, "n": "Orchard Road"},
    }
    path = OUT_PATH
    kept = carry_terrain(path, out)
    json.dump(out, open(path, "w"), separators=(",", ":"))
    if kept:
        print("  carried the existing heightfield over")
    else:
        print("  NO HEIGHTFIELD: run terrain.py or the district will be flat")

    named = [b for b in buildings if "n" in b]
    hs_osm = sum(1 for b in buildings if b.get("hs") == "osm")
    hs_named = sum(1 for b in buildings if b.get("hs") == "named")
    lane_tagged = sum(1 for r in roads if "lanes" in r)
    w_real = sum(1 for r in roads if r.get("ws") in ("osm-width", "osm-lanes"))
    sw_real = sum(1 for r in roads if r.get("sidewalk"))
    dual = sum(1 for r in roads if r.get("oneway") and r.get("k") in
               ("primary", "secondary", "trunk", "tertiary"))
    print(f"  skipped {skipped_underground} underground footprints")
    print(f"  buildings {len(buildings)}  (named {len(named)}, landmarks {sum(1 for b in buildings if b.get('k'))})")
    print(f"  real heights: {hs_osm} from OSM tags + {hs_named} hand-entered "
          f"= {hs_osm + hs_named}/{len(buildings)}")
    print(f"  roads with real lane counts: {lane_tagged}/{len(roads)}")
    print(f"  road widths from real data: {w_real}/{len(roads)}   "
          f"sidewalk tags: {sw_real}   dual-carriageway: {dual}")
    print(f"  roads {len(roads)}   osm trees {len(trees)}")
    print(f"  real POIs: {len(crossings)} crossings, {len(signals)} signals, "
          f"{len(busstops)} bus stops, {len(mrt)} MRT, {len(taxis)} taxi ranks")
    print(f"  real structures: {len(bridges)} ped bridges, {len(covered)} covered walkways, "
          f"{len(shops)} named shops")
    print(f"  wrote {path}  {os.path.getsize(path)/1024:.0f} KB")
    print("\nlargest by footprint:")
    for b in buildings[:12]:
        print(f"  {b.get('n','(unnamed)')[:34]:36s} {b['a']:>7} m2   h={b['h']}")


if __name__ == "__main__":
    main()
