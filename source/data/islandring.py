"""PUBLISH THE ISLAND RING, so the runtime can ask what is on the island.

data/island.py already stitches the OSM coastline fragments into closed rings
and takes the largest — that is how every playable layer gets clipped to
Sentosa. But it only USES the ring and then throws it away, so nothing at
runtime can answer "is this point on the island?".

That gap had a visible cost. `surroundBlocks` in city.js invents grey massing to
fill the horizon beyond a district, which is right for Chinatown or Orchard,
where the real city continues past the edge. It keeps out of `data.water` and
away from roads, and on the mainland that is enough. On an ISLAND it is not: the
golf course and the Cove have no buildings within 70m, so the rule read them as
"empty ground past the last building" and stood 20-45m grey office blocks on The
Tanjong. Found 2026-08-05 by rendering the island from the air and raycasting
the boxes — they carry no building in the data within 40m, because they are not
buildings.

This writes the ring as `islandRing`. Districts that are not islands simply do
not get the key, and the runtime rule is inert for them.

Run:  python3 data/islandring.py sentosa [--dry-run]
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from island import stitch_rings                                    # noqa: E402

# island.py's own gate: if the two biggest rings are closer than this the choice
# of "the island" is not obvious and nothing should be published silently.
MIN_RATIO = 2.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    rings = stitch_rings(d.get("coast") or [])
    if not rings:
        print(f"  {a.id}: no closed coastline ring — not an island, nothing written")
        d.pop("islandRing", None)
        if not a.dry_run:
            json.dump(d, open(path, "w"), separators=(",", ":"))
        return

    best = rings[0]
    runner = rings[1].area() if len(rings) > 1 else 0.0
    print(f"== island ring {a.id}")
    print(f"   largest ring   {best.area() / 1e6:.2f} km2, {len(best.p)} points")
    if runner:
        print(f"   runner-up      {runner / 1e6:.2f} km2 "
              f"(ratio {best.area() / runner:.1f}x)")
    if runner and best.area() / runner < MIN_RATIO:
        print(f"   ! the two biggest rings are within {MIN_RATIO}x of each other, so "
              f"'the island' is not an obvious choice — REFUSING to publish one")
        return

    d["islandRing"] = [[round(x, 1), round(z, 1)] for x, z in best.p]
    print(f"   written as islandRing ({len(d['islandRing'])} points)")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
