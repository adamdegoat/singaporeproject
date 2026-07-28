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
# Defaults are the ISLAND origin (SVY21 datum), not a point in Orchard, so a
# bare run lands in the same frame every district uses.
LAT0 = float(os.environ.get("SG_LAT0") or 1.366666)
LON0 = float(os.environ.get("SG_LON0") or 103.833333)
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
#     128.4m; twin 28-storey towers over a 7-floor retail podium, the WHOLE
#     complex faced in African Red polished granite -- "twin brown polished
#     granite towers", not a curtain wall. The 3.8m x 3.2m granite pre-finished
#     concrete panels are the TOWERS' module (this file used to attribute them
#     to the podium); the podium is pre-cast wall clad with granite in situ.
#     The Great Wall is Raymond Woo's stated intent for the massing.
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

    # Researched 2026-07-28, for the buildings that FRONT A MAIN STREET and
    # still carried a type default. Only 23 of the 965 guessed heights are
    # visible from a street at all and only 7 of those are named, which is what
    # makes them researchable — a nameless footprint has nothing to look up.
    #
    #   268 Orchard          archify.com/sg + structurae.net
    #     12 storeys over 1 basement, building height 69.60m, ~2,800 m2 site
    #   South Beach Residences   en.wikipedia.org/wiki/South_Beach_(Singapore)
    #     two towers, 45 and 42 storeys; the residences occupy the 45-storey
    #     tower from level 23 up. Metres are not published, so this is the
    #     storey count at the 3.4m the OSM `building:levels` path already uses.
    #     NOTE the sibling trap already recorded for this complex: the footprint
    #     named "South Beach" is the AVENUE and is 10m tall. This is the TOWER
    #     footprint, 2,805 m2, and they are different buildings.
    #   Carlton Hotel        26 floors (hotel listings agree; one source says 32
    #     and is the outlier). Hotel storeys run about 3.2m.
    #   NoMad Singapore      uol.com.sg media release 2025-05-05 + edgeprop.sg
    #     19-storey mixed-use by WOHA on the former Faber House site, which was
    #     8 storeys. Opens 2027, so this is a building going up right now.
    "268 orchard":            {"h": 70},   # VERIFIED 69.6m published
    "south beach residences": {"h": 153},  # 45 storeys
    "carlton hotel":          {"h": 83},   # 26 floors
    "nomad singapore":        {"h": 63},   # 19 storeys, under construction
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


# Every height tag we refused, so the count is printed rather than swallowed.
BAD_HEIGHT_TAGS = []


def height_for(tags):
    """Returns (height, is_landmark, source, podium). Source is 'osm' when the
    figure comes from a tag, 'named' when hand-entered, 'guess' when a type
    default. Podium is the researched podium height in metres, or None.

    The podium figure was in LANDMARKS from the day the table was written and
    was never returned, so Ngee Ann City's researched 7-floor / 30m podium and
    Paragon's 6-floor / 24m one were both invented again inside the recipe. That
    is the same shape as the four OSM tags this project found sitting unused
    (crossings, sidewalk=, oneway=, level=) -- the only difference is that this
    time the data we were ignoring was our own research."""
    name = norm(tags.get("name"))
    for key, spec in LANDMARKS.items():
        if key and key in name:
            return spec["h"], spec.get("key", False), "named", spec.get("podium")
    h = tags.get("height")
    if h:
        try:
            v = float(str(h).replace("m", "").strip())
        except ValueError:
            v = None
        # A height tag under about two and a half metres is not a height, it is
        # a bad tag. Across Orchard and Bras Basah 28 buildings carry one:
        # Four Seasons Hotel, Carlton Hotel, Peninsula Plaza and St Andrew's
        # Cathedral are all tagged height=0, and The Cenotaph is tagged
        # height=1 by someone who meant one storey.
        #
        # There was already a guard for this, but it was scoped by FOOTPRINT
        # ("a 3,000 m2 building is never 3.5m tall"), so it only rescued the big
        # ones and left a 498 m2 public hall standing one metre tall. The test
        # is plausibility, not area: nothing with a building tag is a metre high.
        #
        # It also matters for honesty, not just for geometry. Returning "osm"
        # here counted all 28 as heights that came from surveyed data, so the
        # accuracy ledger was reporting garbage as real. Fall through instead,
        # and let it be recorded as the guess it is.
        if v is not None and v >= 2.5:
            return v, False, "osm", None
        if v is not None:
            BAD_HEIGHT_TAGS.append((tags.get("name") or "(unnamed)", v))
    lv = tags.get("building:levels")
    if lv:
        try:
            # 3.4m per storey is closer for SG commercial than 3.6
            return max(3.5, float(lv) * 3.4), False, "osm", None
        except ValueError:
            pass
    return TYPE_DEFAULT.get(tags.get("building", "yes"), 18), False, "guess", None


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


# Which floor a tenant is on. 1,043 of the 1,718 named shops in the two
# districts carry `level`, and the scene file was throwing it away, so a tenant
# in the second basement of Ngee Ann City was handed a board on the street
# facade six metres up. 646 of them are not on the street at all: 265 below it
# and 381 above.
#
# `level` is OSM's own numbering, ground = 0. `addr:unit` is Singapore's, and it
# is the SAME information written the local way: "#01-15" is the ground floor,
# "#B2-32" is the second basement. Both are read, level first.
#
# Returns None when neither says, which is the honest answer for 650 of them and
# is NOT the same as ground floor: the builder decides what to do with unknown.
FLOOR_RE = re.compile(r"^\s*(-?\d+)")
UNIT_RE = re.compile(r"#?\s*(B?)(\d{1,2})\s*-")


def floor_of(tags):
    lv = tags.get("level")
    if lv:
        m = FLOOR_RE.match(str(lv))
        if m:
            return int(m.group(1))
    for key in ("addr:unit", "addr:floor"):
        u = str(tags.get(key) or "")
        m = UNIT_RE.search(u)
        if m:
            n = int(m.group(2))
            return -n if m.group(1) == "B" else n - 1
        m = FLOOR_RE.match(u)
        if m and u.strip() == m.group(1):
            return int(m.group(1))
    return None


def shop_rec(tags, x, z):
    """A tenant, with the tags a shopfront needs to look like itself.
    Optional fields are omitted when absent rather than written empty, because
    every one of these lands 1,600 times in a file the phone downloads."""
    r = {"p": [round(x, 1), round(z, 1)], "n": tags["name"],
         "k": tags.get("shop") or tags.get("amenity")}
    fl = floor_of(tags)
    if fl is not None:
        r["lv"] = fl
    cu = tags.get("cuisine")
    if cu:
        r["cu"] = cu.split(";")[0].strip()[:24]
    zh = tags.get("name:zh") or tags.get("name:zh-Hans")
    if zh:
        r["zh"] = zh[:24]
    return r


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
    # But ONLY if it is in the same coordinate frame. The grid stores x0/z0 in
    # scene metres, so if the origin has moved the old grid describes ground
    # that is now somewhere else entirely — and it would be carried over in
    # silence, leaving the whole district's terrain offset by kilometres with
    # every check still green. Two numbers that must be compared, so compare
    # them.
    o_old = old.get("origin") or {}
    o_new = scene.get("origin") or {}
    if abs(o_old.get("lat", 1e9) - o_new.get("lat", 0)) > 1e-9 \
            or abs(o_old.get("lon", 1e9) - o_new.get("lon", 0)) > 1e-9:
        print(f"  origin moved {o_old.get('lat')},{o_old.get('lon')} -> "
              f"{o_new.get('lat')},{o_new.get('lon')}: heightfield NOT carried over")
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
                    shops.append(shop_rec(tags, x, z))
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
            shops.append(shop_rec(tags, cx, cz))
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
            h, key, hsrc, podium = height_for(tags)
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
            if podium:
                b["pod"] = podium       # researched podium height, read by the recipe
            # WHAT A BUILDING LOOKS LIKE, from the map rather than from a hash.
            #
            # The facade family was chosen by hashing the footprint, which is a
            # deterministic way of saying "at random". Meanwhile the extracts
            # carry `start_date` on 552 buildings — 27% — and nothing had ever
            # read it. Era predicts appearance better than anything else at
            # riding speed: a 1970s Singapore commercial block, an 80s hotel and
            # a 2015 glass tower are not mistakable for one another, and we were
            # assigning between them by coin flip.
            #
            # `building:colour` and `building:material` are rarer (about 2%) but
            # they are an ANSWER where they exist, and a hash was overriding it.
            yr = tags.get("start_date") or ""
            m = re.match(r"^(\d{4})", str(yr).strip())
            if m:
                y = int(m.group(1))
                if 1800 < y <= 2030:
                    b["yr"] = y
            for tk, key_out in (("building:material", "mat"),
                                ("building:colour", "col"),
                                ("roof:shape", "rs")):
                v = tags.get(tk)
                if v:
                    b[key_out] = str(v)[:16]
            # A roof structure is a canopy with no walls: large and low is what
            # it IS, not a bad height. Flagged so the "no squat big footprint"
            # check does not report a 2,122 m2 covered area from 1930 as a
            # defect for being five metres tall.
            if tags.get("building") == "roof":
                b["roof"] = 1
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

    # The axis's own name and width, from the ways it was stitched from.
    #
    # Both used to be hardcoded to "Orchard Road" and 16.0m. With one district
    # that is invisible; the moment a second district was built, its main street
    # was labelled Orchard Road in the scene file, so its street name plates
    # would have read ORCHARD ROAD and axisSpec would have looked up Orchard's
    # lane count and one-way flag to decide how to draw and drive it.
    _axis_ways = [r for r in roads if AXIS_NAME in (r.get("n", "") or "").lower()]
    _names = {}
    for r in _axis_ways:
        _names[r["n"]] = _names.get(r["n"], 0) + 1
    axis_name = max(_names, key=_names.get) if _names else AXIS_NAME.title()
    _ws = sorted(r.get("w", 0) for r in _axis_ways if r.get("w"))
    axis_width = _ws[len(_ws) // 2] if _ws else 16.0

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
    corridor_meta = []                 # same segments, carrying name and class
    for r in roads:
        if r["k"] in ("footway", "pedestrian"):
            continue
        clear = r["w"] / 2 + 1.2          # half the carriageway plus a kerb
        for i in range(len(r["p"]) - 1):
            corridors.append((r["p"][i], r["p"][i + 1], clear))
            corridor_meta.append((r["p"][i], r["p"][i + 1], clear,
                                  r.get("n"), r["k"]))
    if axis:
        aclear = 16.0 / 2 + 2.0
        for i in range(len(axis) - 1):
            corridors.append((axis[i], axis[i + 1], aclear))
            corridor_meta.append((axis[i], axis[i + 1], aclear, AXIS_NAME, "axis"))

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

    def clear_vertex(px, pz, tol=0.0):
        """Slide a vertex out of every corridor it is inside. Returns the point
        and whether it moved.

        `tol` is how far inside a corridor a point may be before it counts as
        being in it. It exists for the EDGE pass below: a wall that runs
        alongside a kerb has midpoints a few centimetres inside it constantly,
        from rounding and from an edge being the chord of a curved corridor, and
        treating those as crossings inserted 6,209 vertices where 106 edges
        actually cross and grew the scene file by 10%."""
        moved = False
        for (a, c, clear) in corridors_near(px, pz):
            d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
            if d < clear - tol and d > 1e-6:
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
    # Drop footprints with no area. A ring that encloses nothing extrudes into a
    # zero-width sliver: invisible, but it still costs a draw and still answers
    # point-in-polygon tests unpredictably.
    def _ring_area(ring):
        a2 = 0.0
        for i in range(len(ring)):
            q1, q2 = ring[i], ring[(i + 1) % len(ring)]
            a2 += q1[0] * q2[1] - q2[0] * q1[1]
        return abs(a2) / 2

    _flat = [b for b in buildings if _ring_area(b["p"]) < 4]
    if _flat:
        print(f"  dropped {len(_flat)} footprints with no area")
        _fset = {id(b) for b in _flat}
        buildings = [b for b in buildings if id(b) not in _fset]

    # Repair a footprint whose ring crosses itself.
    #
    # Ten of them, including Tang Plaza and Pullman Singapore Orchard. A
    # self-intersecting ring extrudes into folded geometry with walls doubling
    # back through each other, which shades wrong and confuses every
    # point-in-polygon test built on it — including the collision grid and the
    # "is this bus stop inside a building" check.
    #
    # Almost always it is one vertex out of order, so try dropping each vertex in
    # turn and keep the first ring that comes out clean. If none does, leave it
    # alone rather than mangle a real outline: a wrong repair is worse than a
    # known defect.
    def _segs_cross(a, b, c, d):
        def side(p, q, r):
            return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
        s1, s2 = side(a, b, c), side(a, b, d)
        s3, s4 = side(c, d, a), side(c, d, b)
        return (s1 > 0) != (s2 > 0) and (s3 > 0) != (s4 > 0)

    def _self_crossing(ring):
        n = len(ring)
        if n > 60:
            return False        # traced curves, and the test is quadratic
        for i in range(n):
            for j in range(i + 2, n):
                if i == 0 and j == n - 1:
                    continue
                if _segs_cross(ring[i], ring[(i + 1) % n], ring[j], ring[(j + 1) % n]):
                    return True
        return False

    # ---- and now the EDGES, on REAL carriageways only ------------------------
    # Every pass above moves VERTICES, so a wall between two cleared vertices can
    # still cut through a corridor. audit_roads.py has been printing "building
    # EDGES inside a carriageway: 106" the whole time while the vertex passes
    # reported themselves clean, and those edges are most of what P1b still
    # counts as building masses standing in a road.
    #
    # The first version of this cleared edges against EVERY corridor and was
    # measured to be worse than the problem: 2,230 vertices inserted across 125
    # buildings, the scene file 4% bigger, and self-crossing footprints from 6
    # to 68 with 31 having no single-vertex repair. This file already records
    # what a self-crossing ring costs -- it confuses every point-in-polygon test
    # built on it, including the collision grid.
    #
    # The reason was scope, not method. Sampling every building edge showed 413
    # crossings deeper than 0.6m and **383 of them are into SERVICE roads**,
    # which is a hotel set-down or a loading bay under a porte-cochere and is
    # what a service road is for. The audit has always skipped service roads
    # here; the fix was not. So it was shoving buildings out of their own
    # driveways and folding their rings to do it.
    #
    # Against real carriageways only there are 30, and they are chords cutting
    # the corner of a bend or a junction, which is what a simplified ring does
    # between two vertices that were each pushed straight out.
    edge_corr = [(a, c, cl) for (a, c, cl, _n, k) in corridor_meta
                 if k not in ("service", "service_link")]
    ecg = {}
    for seg in edge_corr:
        (ax, az), (bx, bz), cl = seg
        for gx in range(int((min(ax, bx) - cl) // CGRID_CELL),
                        int((max(ax, bx) + cl) // CGRID_CELL) + 1):
            for gz in range(int((min(az, bz) - cl) // CGRID_CELL),
                            int((max(az, bz) + cl) // CGRID_CELL) + 1):
                ecg.setdefault((gx, gz), []).append(seg)

    def clear_edge_pt(px, pz, tol=0.6):
        """Slide a point out of every REAL carriageway it is inside. `tol` is
        how far in it may be first: a wall running along a kerb grazes it by
        centimetres constantly, from rounding and from an edge being the chord
        of a curved corridor, and treating those as crossings is what inserted
        thousands of needless vertices."""
        moved = False
        for (a, c, cl) in ecg.get((int(px // CGRID_CELL), int(pz // CGRID_CELL)), ()):
            d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
            if d < cl - tol and d > 1e-6:
                nx, nz = (px - cx) / d, (pz - cz) / d
                px, pz = cx + nx * cl, cz + nz * cl
                moved = True
        return px, pz, moved

    edge_pts, edge_b, edge_folded = 0, 0, 0
    for b in buildings:
        # NOT `ring` -- that is a function defined in this same scope, and
        # binding it here makes it local for the whole of main(), which broke
        # the footprint reader 570 lines earlier. Same shadowing class as the
        # heightfield loop variable already recorded in NEXT.md.
        bring = b["p"]
        n = len(bring)
        out = []
        touched = False
        for i in range(n):
            a = bring[i]
            c = bring[(i + 1) % n]
            out.append(a)
            L = math.dist(a, c)
            if L < 1.2:
                continue
            steps = int(L // 1.0)
            for k in range(1, max(1, steps)):
                t = k / steps
                mx = a[0] + (c[0] - a[0]) * t
                mz = a[1] + (c[1] - a[1]) * t
                px, pz, moved = clear_edge_pt(mx, mz)
                if moved:
                    out.append([round(px, 1), round(pz, 1)])
                    edge_pts += 1
                    touched = True
        # A FAILED REPAIR MUST NOT SHIP DAMAGE. Pushing a midpoint
        # perpendicular to a corridor can move it past its own neighbours where
        # a wall meets the road at a shallow angle, folding the ring -- and a
        # self-crossing ring confuses every point-in-polygon test built on it,
        # including the collision grid. If the insertion folds a ring that was
        # sound, keep the original and count it: a wall clipping a kerb is a
        # smaller defect than a footprint that lies about its own interior.
        if touched:
            if _self_crossing(out) and not _self_crossing(bring):
                edge_pts -= sum(1 for q in out if q not in bring)
                edge_folded += 1
                continue
            b["p"] = out
            edge_b += 1
    print(f"  edge clearance: inserted {edge_pts} vertices across {edge_b} buildings"
          + (f", {edge_folded} left alone (the fix would fold the ring)" if edge_folded else ""))

    # SG_NO_RING_REPAIR=1 rebuilds without this, so its effect can be measured
    # rather than argued about.
    def _crossings(ring):
        n = len(ring)
        c = 0
        for i in range(n):
            for j in range(i + 2, n):
                if i == 0 and j == n - 1:
                    continue
                if _segs_cross(ring[i], ring[(i + 1) % n], ring[j], ring[(j + 1) % n]):
                    c += 1
        return c

    _fixed = _left = 0
    for _b in ([] if os.environ.get("SG_NO_RING_REPAIR") else buildings):
        if not _self_crossing(_b["p"]):
            continue
        # Greedy: repeatedly drop the vertex whose removal removes the most
        # crossings. One pass fixed eight of nine, and Capitol Singapore needed
        # more than one vertex gone — a single-shot repair left it broken and
        # the hunt kept reporting it.
        _ring = list(_b["p"])
        for _pass in range(6):
            if not _self_crossing(_ring) or len(_ring) <= 4:
                break
            _base = _crossings(_ring)
            _best, _bestC = None, _base
            for _k in range(len(_ring)):
                _cand = _ring[:_k] + _ring[_k + 1:]
                _c = _crossings(_cand)
                if _c < _bestC:
                    _bestC, _best = _c, _cand
            if _best is None:
                break
            _ring = _best
        if not _self_crossing(_ring):
            _b["p"] = _ring
            _fixed += 1
        else:
            _left += 1
    if _fixed or _left:
        print(f"  self-crossing footprints: {_fixed} repaired by dropping one vertex"
              + (f", {_left} left alone (no single-vertex fix)" if _left else ""))

    # Drop a footprint that is buried inside a taller one.
    #
    # OSM traces a mall, its annex and sometimes its own outline again as
    # separate ways. Where the inner one is TALLER it is a tower on a podium and
    # must be drawn — 16 of the 28 buried footprints in this region are exactly
    # that, including The Atrium @ Orchard above Plaza Singapura. Where it is the
    # same height or lower it is invisible except for the z-fighting it causes
    # along every shared face, so it is pure cost.
    #
    # Tested on the footprint's OWN area being inside the other, not on bounding
    # boxes: an L-shaped plan's box overlaps its neighbour's without either
    # building overlapping at all.
    def _area(poly):
        a2 = 0.0
        for i in range(len(poly)):
            q1, q2 = poly[i], poly[(i + 1) % len(poly)]
            a2 += q1[0] * q2[1] - q2[0] * q1[1]
        return abs(a2) / 2

    def _inpoly(poly, x, z):
        hit = False
        j = len(poly) - 1
        for i in range(len(poly)):
            xi, zi = poly[i]; xj, zj = poly[j]
            if ((zi > z) != (zj > z)) and (x < (xj - xi) * (z - zi) / (zj - zi) + xi):
                hit = not hit
            j = i
        return hit

    _CELL = 60.0
    _grid = {}
    for _b in buildings:
        _xs = [q[0] for q in _b["p"]]; _zs = [q[1] for q in _b["p"]]
        _b["_bb"] = (min(_xs), min(_zs), max(_xs), max(_zs))
        for _cx in range(int(min(_xs) // _CELL), int(max(_xs) // _CELL) + 1):
            for _cz in range(int(min(_zs) // _CELL), int(max(_zs) // _CELL) + 1):
                _grid.setdefault((_cx, _cz), []).append(_b)
    _buried = []
    for _b in buildings:
        mnx, mnz, mxx, mxz = _b["_bb"]
        _in = _n = 0
        for i in range(1, 5):
            for j in range(1, 5):
                x = mnx + (mxx - mnx) * i / 5
                z = mnz + (mxz - mnz) * j / 5
                if not _inpoly(_b["p"], x, z):
                    continue
                _n += 1
                for _o in _grid.get((int(x // _CELL), int(z // _CELL)), []):
                    if _o is _b or not _inpoly(_o["p"], x, z):
                        continue
                    if _area(_o["p"]) > _area(_b["p"]) * 1.05 \
                            and (_o.get("h") or 0) >= (_b.get("h") or 0):
                        _in += 1
                        break
        if _n >= 4 and _in / _n > 0.8:
            _buried.append(_b)
    for _b in buildings:
        _b.pop("_bb", None)
    if _buried:
        _names = ", ".join((b.get("n") or "(unnamed)") for b in _buried[:3])
        print(f"  dropped {len(_buried)} footprints buried inside a taller building: {_names}"
              + ("..." if len(_buried) > 3 else ""))
        _bset = {id(b) for b in _buried}
        buildings = [b for b in buildings if id(b) not in _bset]

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
        "axis": {"p": [[round(x, 1), round(z, 1)] for x, z in axis],
                 "w": axis_width, "n": axis_name},
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
    if BAD_HEIGHT_TAGS:
        names = ", ".join(n for n, _ in BAD_HEIGHT_TAGS[:4])
        print(f"  refused {len(BAD_HEIGHT_TAGS)} implausible height tags "
              f"(under 2.5m): {names}{'...' if len(BAD_HEIGHT_TAGS) > 4 else ''}")
    print(f"  wrote {path}  {os.path.getsize(path)/1024:.0f} KB")
    print("\nlargest by footprint:")
    for b in buildings[:12]:
        print(f"  {b.get('n','(unnamed)')[:34]:36s} {b['a']:>7} m2   h={b['h']}")


if __name__ == "__main__":
    main()
