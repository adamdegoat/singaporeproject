"""CURRENT NAMES — the map is not always up to date, and this world is dated.

The owner: "it needs to be fucking sentosa." A player reads names off gates,
facades and floating labels, so a name that changed two years ago is as visible
a defect as a wrong roof.

OpenStreetMap is edited by volunteers and lags rebrandings, and Sentosa
rebrands constantly. Each entry here is a rename that HAS HAPPENED, with the
date and the source; nothing is renamed on a hunch, and nothing is renamed
because a newer name sounds better.

This runs on the built scene, so it also catches the name in the shopfront
signage, the entrance gates and the 3D place labels, all of which read the same
field.

Run:  python3 data/names.py sentosa [--dry-run]
"""
import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# (match, new name, why)
RENAMES = [
    ("hard rock hotel", "The Laurus",
     "Hard Rock Hotel Singapore closed July 2025 and reopened October 2025 as "
     "The Laurus, a Luxury Collection Resort — 183 suites over five storeys. "
     "asgam.com 2025-10-02, rwsentosa.com/en/the-laurus-singapore."),
    ("the forum", "WEAVE",
     "RWS's Forum retail street was rebuilt and reopened as WEAVE in July 2025. "
     "rwsentosa.com."),
]
# Names that must NOT survive: things that have closed. Kept as a list rather
# than deleted silently, because a demolished thing and a renamed thing are
# different facts and the next person needs to see which is which.
CLOSED = [
    ("rumours beach club",
     "Closed January 2026. Do not build; do not label."),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    hits, closed = {}, {}
    layers = ["buildings", "attractions", "shops", "green", "mrt", "parkfurn"]
    for layer in layers:
        v = d.get(layer)
        if not isinstance(v, list):
            continue
        keep = []
        for o in v:
            if not isinstance(o, dict) or not o.get("n"):
                keep.append(o)
                continue
            low = str(o["n"]).lower()
            gone = False
            for (needle, why) in CLOSED:
                if needle in low:
                    closed[needle] = closed.get(needle, 0) + 1
                    gone = True
                    break
            if gone:
                # keep the building, lose the name: the structure may still
                # stand, the business does not
                o.pop("n", None)
                keep.append(o)
                continue
            for (needle, new, why) in RENAMES:
                if needle in low:
                    o["n"] = new
                    hits[needle] = hits.get(needle, 0) + 1
                    break
            keep.append(o)
        d[layer] = keep
    # the cableway stations carry names too
    for s in (((d.get("cableway") or {}).get("stations")) or []):
        if not isinstance(s, dict) or not s.get("n"):
            continue
        low = str(s["n"]).lower()
        for (needle, new, why) in RENAMES:
            if needle in low:
                s["n"] = new
                hits[needle] = hits.get(needle, 0) + 1

    print(f"== names {a.id}")
    if not hits and not closed:
        print("   nothing to rename (already current)")
    for (needle, new, why) in RENAMES:
        if needle in hits:
            print(f"   {hits[needle]:3d} x  \"{needle}\" -> \"{new}\"")
    for (needle, why) in CLOSED:
        if needle in closed:
            print(f"   {closed[needle]:3d} x  \"{needle}\" name removed (closed)")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
