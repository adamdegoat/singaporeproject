#!/usr/bin/env python3
"""RELGEOM — give the cached relations their members' shapes.

WHY THIS EXISTS AS A SEPARATE STEP, rather than being fixed by a refetch.

process.py builds a multipolygon building by stitching its OUTER members into a
ring, and it reads each member's `geometry` to do it. Neither source supplies
that:

  * Overpass — which is what `data/raw/<id>.json` was fetched with — returns
    relation members as bare {type, ref, role}. The member WAYS come back in the
    same response only if they are tagged in their own right, and a
    multipolygon's outer ways usually are not. Measured on the Sentosa cache:
    of 33 member refs across 11 building relations, 7 are present. Sofitel's
    main building has TEN members and NONE of them is there.
  * The local extract answers this correctly now, but it returns fewer elements
    overall than the Overpass pull, so `build_district.py --force` refuses its
    result — correctly, by the "a refetch that loses data must not overwrite the
    cache" guard, which exists because a thin mirror response once cost a day.

So neither path can fix it alone, and the fix is not a refetch at all: it is
ADDITIVE. Read the member geometry out of the local extract and write it into
the cache beside what is already there. Nothing is replaced, nothing can be
lost, and the guard never has to judge it.

Consequence, measured: 8 of the 10 building relations inside the Sentosa bbox
never reached the scene, and among them was the whole of Sofitel Singapore
Sentosa — 198 x 294m of it, 19,226 m2. The two that did arrive got there by
accident, because their outer way happens to carry a `building` tag of its own
and the way scan caught it.

Run:  python3 data/relgeom.py sentosa
      python3 data/relgeom.py sentosa --dry-run
"""
import argparse, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import osmlocal                                            # noqa: E402
import build_district as bd                                # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    d = bd.district(a.id)
    bbox = d["bbox"]
    path = os.path.join(HERE, "raw", f"{a.id}.json")
    if not os.path.exists(path):
        sys.exit(f"no raw cache at {path} — run build_district.py first")

    raw = json.load(open(path))
    els = raw.get("elements") or []

    # the same query build_district sends for buildings, so the relation set is
    # exactly the one the pipeline will look at
    q = {"buildings": (f'way["building"]({bbox});rel["building"]({bbox});'
                       f'way["building:part"]({bbox});rel["building:part"]({bbox});')}
    local = osmlocal.fetch_many(bbox, q)["buildings"]
    geom_by_rel = {}
    for r in local:
        if r.get("type") != "relation":
            continue
        geom_by_rel[r["id"]] = {m["ref"]: m.get("geometry")
                                for m in (r.get("members") or []) if m.get("geometry")}

    # ...and every way the extract knows, so a member can also be resolved when
    # it belongs to a relation the local scan did not label
    way_geom = {}
    for r in local:
        if r.get("type") == "way" and r.get("geometry"):
            way_geom[r["id"]] = r["geometry"]

    filled = relsTouched = 0
    report = []
    for e in els:
        if e.get("type") != "relation":
            continue
        tags = e.get("tags") or {}
        if "building" not in tags and "building:part" not in tags:
            continue
        ms = e.get("members") or []
        had = sum(1 for m in ms if m.get("geometry"))
        src = geom_by_rel.get(e["id"], {})
        n = 0
        for m in ms:
            if m.get("geometry"):
                continue
            g = src.get(m.get("ref")) or way_geom.get(m.get("ref"))
            if g:
                m["geometry"] = g
                n += 1
        if n:
            relsTouched += 1
            filled += n
        report.append((e["id"], len(ms), had, had + n, tags.get("name")))

    print(f"== relgeom {a.id}")
    for rid, tot, had, now, name in report:
        flag = "" if now == tot else "   INCOMPLETE"
        print(f"   rel {rid:<12} members {tot:2}  geometry {had} -> {now}{flag}"
              + (f"   {name}" if name else ""))
    print(f"   filled {filled} member geometries across {relsTouched} relation(s)")

    if a.dry_run:
        print("   --dry-run: nothing written")
        return
    if not filled:
        print("   nothing to do")
        return
    json.dump(raw, open(path, "w"))
    print(f"   wrote {path} ({os.path.getsize(path)/1024:.0f} KB)")
    print("   next: python3 data/build_district.py " + a.id
          + "   (uses the cache; do NOT pass --force)")


if __name__ == "__main__":
    main()
