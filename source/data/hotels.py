"""THE RESORTS OSM HAS AND THIS PIPELINE NEVER ASKED FOR.

The owner wants Sofitel, Amara and the rest to be part of the island. They were
missing from every layer, and the reason turned out not to be that the map
lacks them — it is that this pipeline only ever reads building WAYS, and these
resorts are tagged as `tourism=hotel` NODES:

    Sofitel Sentosa Resort & Spa     -633, 13515
    Capella Singapore                -991, 13021
    Amara Sanctuary Resort, Sentosa -1240, 12745
    W Singapore - Sentosa Cove       1004, 13392
    ONE°15 Marina Sentosa Cove        712, 13472
    The Outpost                     -1515, 12777

Which is the project's oldest recurring fault, for about the eighth time: real
data present, and unused because nobody asked the extract for it.

WHAT THIS DOES NOT DO IS RENAME A BUILDING. A hotel node sits near an entrance
or a complex centroid, and a resort sprawls: measured, the nearest UNNAMED
footprint to each of these is 49m away at best and 237m at worst. Naming a
building on that evidence would put "Sofitel" on whatever happened to be
closest, and a wrong name on a landmark is worse than no name — the owner would
be right to call it out.

So they are carried as PLACES. The position is surveyed and correct, so the
name floats where the resort actually is, which is what a player needs, and no
specific building is claimed to be a specific hotel.

Run:  python3 data/hotels.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    reg = json.load(open(os.path.join(HERE, "districts.json")))
    bbox = None
    for x in reg["districts"]:
        if x["id"] == a.id:
            bbox = x["bbox"]
    if not bbox:
        print(f"  ! no bbox for {a.id}")
        return

    try:
        import osmlocal
        body = ('node["tourism"="hotel"]({b});'
                'node["tourism"="resort"]({b});').replace("{b}", bbox)
        els = osmlocal.fetch(bbox, body) or []
    except Exception as e:
        print(f"  ! could not read the extract ({type(e).__name__}) — skipped")
        return

    o = d["origin"]
    lat0, lon0 = o["lat"], o["lon"]

    # THE SAME PROJECTION THE BUILDINGS USE, OR THE LABEL IS NOT ON ITS BUILDING.
    #
    # process.py places every footprint with M_PER_DEG_LAT = 110574.0. This used
    # 111320.0 for latitude as well — the equatorial figure for LONGITUDE — a
    # 0.67% stretch that at Sentosa's z of about 13,400m puts every hotel node
    # 85 to 91 metres SOUTH of its own building.
    #
    # That single constant is why "attach these hotels to a footprint" was
    # measured as impossible: the nearest unnamed footprint was reported 49m
    # away at best and 237m at worst, and the reasoning that followed — that a
    # wrong name on a landmark is worse than none — was sound but was answering
    # a question created by this line.
    MPD_LAT = 110574.0
    def proj(lat, lon):
        x = (lon - lon0) * 111320.0 * math.cos(math.radians(lat))
        z = (lat0 - lat) * MPD_LAT
        return round(x, 1), round(z, 1)

    # names the building layer ALREADY carries are not repeated as a floating
    # place — the facade sign is better than a label hanging over the roof.
    #
    # MATCHED BY TOKEN SET, NOT SUBSTRING. The plain substring test let three
    # of four "floating" hotels through on punctuation alone (research/
    # resort-footprints.md §0.2): the node says "Sofitel Sentosa Resort &
    # Spa" while the facade says "Sofitel SINGAPORE Sentosa..." (an inserted
    # word defeats substring both ways); Amara differs by one comma; and
    # ONE°15's building name literally uses SPACE + U+030A COMBINING RING
    # where the node uses U+00B0 — no string comparison survives that without
    # stripping combining marks first. So: NFKD, drop combining marks and
    # punctuation, and call it the same hotel when either token set contains
    # the other.
    import unicodedata
    def toks(s):
        s = unicodedata.normalize("NFKD", s)
        s = "".join(c for c in s if not unicodedata.combining(c))
        s = "".join(c if c.isalnum() else " " for c in s.lower())
        return set(s.split())
    have = [toks(str(b.get("n") or "")) for b in (d.get("buildings") or []) if b.get("n")]

    out, skipped = [], 0
    for e in els:
        t = e.get("tags") or {}
        n = (t.get("name") or "").strip()
        if not n or "lat" not in e:
            continue
        tn = toks(n)
        if any(h and (h <= tn or tn <= h) for h in have):
            skipped += 1
            continue
        x, z = proj(e["lat"], e["lon"])
        out.append({"n": n, "p": [x, z], "k": t.get("tourism") or "hotel"})

    out.sort(key=lambda r: r["n"])
    d["hotels"] = out
    print(f"== hotels {a.id}")
    print(f"   {len(out)} resort(s) the building layer did not carry "
          f"({skipped} already named on a facade)")
    for r in out:
        print(f"     {r['p'][0]:8.0f},{r['p'][1]:8.0f}  {r['n']}")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
