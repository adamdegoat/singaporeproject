"""EVERY MULTIPOLYGON RELATION THE SCENE NEVER GOT — recovered in one pass.

The owner, 2026-08-06: "u keep saying u miss out all this data that have but
you never use... why you keep on not using the data available or u can source?"

He is right, and the reason it kept happening one at a time is that the audit
we had could not see it. data/unused.py asks "which TAGS on the elements we
fetched does nothing read", and it passes — but it can only see elements that
ARRIVED. Anything dropped before that is invisible to it. data/dropped.py, new,
audits by ELEMENT instead, and the first thing it printed was this:

    RELATIONS WHOSE MEMBERS CARRY NO GEOMETRY (unbuildable as fetched):
         5  natural=wood            2  landuse=meadow      1  leisure=park
         4  natural=water           2  landuse=forest      1  landuse=retail
         2  natural=beach           2  leisure=swimming_pool
         1  leisure=golf_course     1  amenity=parking     1  landuse=commercial

TWENTY-TWO of them, and **all 22 resolve from the local extract**. Woods,
water, beaches, meadows, a golf course, a park — ground truth for a large part
of the island, sitting in a file we already have.

WHY THEY NEVER ARRIVED. Overpass returns relation members as bare
{type, ref, role} with no geometry. data/relgeom.py exists precisely to fix
that — and filters to `building` and `building:part`. Every other relation
falls straight through it. That filter was right for the job it was written
for and nobody widened it since.

This does the same job for the rest, and writes the rings straight into the
scene layers rather than back into the raw cache, so it is ADDITIVE and needs
no district rebuild — the same shape as data/relgeom.py's own argument for
existing, and as data/resortsite.py which found the retail one by hand.

REFUSALS ARE LOUD. A relation whose members will not chain into a plausible
ring is REPORTED AND SKIPPED, never approximated — a bad ring here would claim
the wrong ground and stop planting over it, which is worse than absence. The
count of refusals is printed.

Run:  python3 data/relparcels.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import osmlocal                                            # noqa: E402
import build_district as bd                                # noqa: E402

REG = json.load(open(os.path.join(HERE, "districts.json")))
LAT0, LON0 = REG["island_origin"][0], REG["island_origin"][1]
M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(LAT0))

# where each class belongs, and under which kind. The kinds are the ones the
# scene already uses (see the counters in data/dropped.py) — nothing invented.
ROUTE = {
    "natural=wood": ("green", "wood"),
    "landuse=forest": ("green", "wood"),
    "natural=water": ("water", None),
    "natural=beach": ("green", "sand"),
    "landuse=meadow": ("green", "grass"),
    "landuse=grass": ("green", "grass"),
    "leisure=park": ("green", "park"),
    "leisure=golf_course": ("green", "golf"),
    "leisure=swimming_pool": ("green", "pool"),
    "landuse=retail": ("land", "comm"),
    "landuse=commercial": ("land", "comm"),
    "amenity=parking": ("land", "parking"),
}
# a ring smaller than this is almost certainly a mis-chain rather than a parcel
MIN_AREA = {"green": 150.0, "land": 400.0, "water": 150.0}


def proj(lat, lon):
    return ((lon - LON0) * M_LON, (LAT0 - lat) * M_LAT)


def stitch(ways):
    """Chain member ways end-to-end into one ring; [] if they will not close."""
    segs = [list(w) for w in ways if w and len(w) >= 2]
    if not segs:
        return []
    ring = segs.pop(0)
    changed = True
    while segs and changed:
        changed = False
        for i, s in enumerate(segs):
            if math.dist(ring[-1], s[0]) < 1.0:
                ring += s[1:]
            elif math.dist(ring[-1], s[-1]) < 1.0:
                ring += list(reversed(s))[1:]
            elif math.dist(ring[0], s[-1]) < 1.0:
                ring = s[:-1] + ring
            elif math.dist(ring[0], s[0]) < 1.0:
                ring = list(reversed(s))[1:] + ring
            else:
                continue
            segs.pop(i)
            changed = True
            break
    return ring


def stitch_rings(ways):
    """Chain member ways into AS MANY CLOSED RINGS as they actually form.

    `stitch` above chains everything into ONE ring and returns whatever it has,
    closed or not. That is right for a relation's outer boundary and wrong for
    its inners: a lagoon with three islands in it has THREE separate inner
    rings, and running them through `stitch` welds unrelated islands into one
    self-intersecting loop whose point-in-polygon answer is meaningless.

    Measured when that was the bug: Sentosa Cove's Sandy Island and Pearl
    Island are inner rings of the waterway, and with the welded version they
    were not recognised as holes — 411 m and 435 m of their footways came back
    drowned, and the trailcheck gate refused the deploy.

    A ring is only returned if it CLOSES. An unclosed chain is not a hole, it
    is a fragment, and testing a point against it gives an answer that is worse
    than refusing.
    """
    segs = [list(w) for w in ways if w and len(w) >= 2]
    rings = []
    while segs:
        ring = segs.pop(0)
        changed = True
        while segs and changed:
            changed = False
            for i, s in enumerate(segs):
                if math.dist(ring[-1], s[0]) < 1.0:
                    ring += s[1:]
                elif math.dist(ring[-1], s[-1]) < 1.0:
                    ring += list(reversed(s))[1:]
                elif math.dist(ring[0], s[-1]) < 1.0:
                    ring = s[:-1] + ring
                elif math.dist(ring[0], s[0]) < 1.0:
                    ring = list(reversed(s))[1:] + ring
                else:
                    continue
                segs.pop(i)
                changed = True
                break
        if len(ring) >= 4 and math.dist(ring[0], ring[-1]) < 1.0:
            rings.append(ring)
    return rings


def area_of(p):
    s = 0.0
    for i in range(len(p)):
        x1, z1 = p[i]
        x2, z2 = p[(i + 1) % len(p)]
        s += x1 * z2 - x2 * z1
    return abs(s) / 2


def primary(t):
    for k in ("natural", "landuse", "leisure", "amenity", "tourism"):
        if k in t:
            return f"{k}={t[k]}"
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    raw = json.load(open(os.path.join(HERE, "raw", f"{a.id}.json")))
    els = raw.get("elements") or raw

    # THE ONES THE SCENE COULD NOT BUILD: a relation whose members arrived with
    # no geometry at all. A relation that DID arrive complete is already in the
    # scene and must not be added twice.
    need = {}
    for e in els:
        if e.get("type") != "relation":
            continue
        ms = e.get("members") or []
        if not ms or any(m.get("geometry") for m in ms):
            continue
        p = primary(e.get("tags") or {})
        if p in ROUTE:
            need[e["id"]] = (p, str((e.get("tags") or {}).get("name") or ""))
    if not need:
        print("   no unresolved relations — nothing to recover")
        return

    d0 = bd.district(a.id)
    try:
        found = osmlocal.fetch_many(d0["bbox"], {"r": f'rel({d0["bbox"]});'})["r"]
    except Exception as e:                                   # noqa: BLE001
        print(f"  ! local extract unavailable ({type(e).__name__}) — nothing recovered")
        return
    have = {r["id"]: r for r in found if r.get("type") == "relation"}

    print(f"== relparcels {a.id}")
    print(f"   {len(need)} relation(s) arrived without geometry")
    added, refused = 0, 0
    by_class = {}
    for rid, (cls, name) in sorted(need.items()):
        src = have.get(rid)
        if not src:
            print(f"   ! {cls:<24} rel/{rid} not in the local extract — skipped")
            refused += 1
            continue
        members = src.get("members") or []
        # A HOLE WE CANNOT DRAW IS A LIE, NOT A ROUNDING ERROR.
        #
        # First cut took `outer` members and ignored `inner` ones. Eight of the
        # 22 relations have inner rings, and filling them SOLID drowned a
        # mapped footway: `26x footway at 805,13242`, 29.7m inside a 119,257 m2
        # water body recovered from rel/2142498 (5 outer, 3 inner). The gate
        # caught it as one blocked run over 20m.
        #
        # The scene's green/land/water layers are simple polygons with no hole
        # support, so there is no honest way to add these yet. REFUSE AND SAY
        # SO, the same rule the pier and station recipes use — an absence that
        # is reported is recoverable; a lie that is drawn is not.
        outers = [m.get("geometry") for m in members
                  if m.get("role") in ("outer", "") and m.get("geometry")]
        holed = any(m.get("role") == "inner" for m in members)
        ring = stitch([[proj(p["lat"], p["lon"]) for p in g] for g in outers])
        if len(ring) >= 4 and math.dist(ring[0], ring[-1]) < 1.0:
            ring = ring[:-1]
        layer, kind = ROUTE[cls]
        # REMOVE BEFORE DECIDING, so a run that now REFUSES a relation also
        # takes out the record an earlier, wronger run added. The first cut
        # only de-duplicated on the add path, which left eight holed parcels —
        # including the water that drowned the footway — in the scene after
        # they started being refused.
        tgt = d.setdefault(layer, [])
        if len(ring) >= 3:
            sig = [[round(x, 1), round(z, 1)] for x, z in ring][:3]
            for i in range(len(tgt) - 1, -1, -1):
                if tgt[i].get("p", [])[:3] == sig:
                    tgt.pop(i)
                    print(f"   - {cls:<24} rel/{rid} previous record removed")
        # ...AND THE WATER LAYER CAN HOLD ONE NOW.
        #
        # The refusal above was right when it was written and is now only half
        # right: `water` records carry `hp`, a list of inner rings, and both
        # readers honour it — terrain.waterFloor returns null inside a hole, and
        # buildWater cuts the sheet around it. So a lagoon with an island in it
        # is drawable honestly.
        #
        # The other layers (green, land) still cannot, so a holed wood, meadow
        # or park is STILL REFUSED and still says so. That is the point of
        # reporting an absence: it tells you exactly which half is now possible.
        inners = []
        if holed and layer == "water":
            inner_ways = [[proj(q["lat"], q["lon"]) for q in m["geometry"]]
                          for m in members
                          if m.get("role") == "inner" and m.get("geometry")]
            for ir in stitch_rings(inner_ways):
                inners.append([[round(x, 1), round(z, 1)] for x, z in ir])
        if holed and not inners:
            print(f"   ! {cls:<24} rel/{rid} has inner ring(s) and the {layer} "
                  f"layer cannot hold a hole — refused  {name}")
            refused += 1
            continue
        if len(ring) < 4 or area_of(ring) < MIN_AREA[layer]:
            print(f"   ! {cls:<24} rel/{rid} would not chain into a plausible ring "
                  f"({len(ring)} nodes) — refused, not approximated")
            refused += 1
            continue
        pts = [[round(x, 1), round(z, 1)] for x, z in ring]
        rec = {"p": pts, "a": int(area_of(ring))}
        if inners:
            rec["hp"] = inners
        if kind:
            rec["k"] = kind
        if name:
            rec["n"] = name
        tgt.append(rec)
        added += 1
        by_class[cls] = by_class.get(cls, 0) + 1
        print(f"   {cls:<24} {area_of(ring):10,.0f} m2 -> {layer}"
              f"{'[' + kind + ']' if kind else ''}"
              f"{f'  + {len(inners)} hole(s)' if inners else ''}   {name}")

    print(f"   {added} recovered, {refused} refused")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    if added:
        json.dump(d, open(path, "w"), separators=(",", ":"))
        print(f"   written: {path}")


if __name__ == "__main__":
    main()
