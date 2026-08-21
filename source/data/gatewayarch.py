"""THE SENTOSA GATEWAY ARCH — the island's front door, absent from the world.

The 1992 causeway (opened 16 Dec 1992, 380m) ends at TWIN MASONRY TOWERS
flanking Gateway Avenue, joined by an arched pedestrian span that OSM itself
names "Sentosa" / "圣淘沙" (bridge:structure=arch). PUBLISHED: "two towers on
both sides signifying the end of the gateway to Sentosa"
(en.wikipedia.org/wiki/Sentosa_Causeway; NLB Infopedia). Every visitor who has
ever driven onto the island has passed under it, and the world drew nothing —
the tower footprints are ~17 m2 each, under every area filter in the pipeline.

ANCHORED TO SURVEYED GEOMETRY, not to a guess: OSM ways 689975818 and
689975820 (the towers, man_made=tower) and 689975821 (the arch span), fetched
live 2026-08-22 and projected through the island origin. The coordinates below
are those ways' own bbox centres; re-fetch them if the survey moves.

WHAT IS NOT PUBLISHED IS NOT INVENTED. Tower height, deck height and the
lettering size are nowhere published; they are ESTIMATED from satellite
shadow and street imagery in research/rws-east-masses.md §3 and recorded as
authored.

Run:  python3 data/gatewayarch.py sentosa [--dry-run]
"""
import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# OSM ways 689975818 / 689975820, bbox centres, projected 2026-08-22
TOWER_A = [-1083.15, 12168.75]
TOWER_B = [-1058.15, 12168.9]
TOWER_W = 4.1          # the ways' own footprint width
TOWER_H = 13.0         # EST (research/rws-east-masses.md §3)
DECK_Y = 7.0           # EST — the arch clears the causeway's traffic
SIGN = "SENTOSA"       # the span's own OSM name, latinised on the real board


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    if not d.get("terrain"):
        raise SystemExit("gatewayarch: no terrain in scene — refusing to write")
    d["gatewayarch"] = {
        "a": TOWER_A, "b": TOWER_B,
        "tw": TOWER_W, "th": TOWER_H, "deck": DECK_Y, "sign": SIGN,
        "src": ("OSM ways 689975818/820/821 (towers + arch named 'Sentosa'), "
                "fetched 2026-08-22; heights EST, research/rws-east-masses.md §3"),
    }
    print("== gateway arch", a.id)
    print(f"   towers at {TOWER_A} and {TOWER_B}, span "
          f"{abs(TOWER_B[0] - TOWER_A[0]):.1f}m, deck {DECK_Y}m (EST)")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
