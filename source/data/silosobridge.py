#!/usr/bin/env python3
"""THE SILOSO LAGOON-MOUTH FOOTBRIDGE — siloso-spec #8, measured at last.

Unlike Palawan's crossing, this bridge is UNMAPPED: no OSM way of any kind
comes within 30m of its midpoint (research/siloso-bridge-measured.md, which
also holds the whole derivation). The route below is measured off the ESRI
Wayback 2026-08-05 z19 capture (release 26334, 0.299 m/px) — a straight
74.8 m span from the beach to the mapped sandy islet, on regular piers with
five widened cross-platforms. The islet landing needs no authored ground:
the extract already carries the islet's sand and wood rings.

WHAT THIS FILE WRITES: `silosobridge` — the authored structure's route +
dimensions, drawn by sgdetail.js the way `palawanbridge` is. The builder
registers its own deck (addFootbridgeWay + addWalkSurface), so the map's
roads layer is NOT touched.

A ROADS ENTRY WAS TRIED AND THE GOLDEN GATE REFUSED IT — 2026-08-19, and
the receipt matters: adding one bridge-tagged footway across the lagoon
sank the drawn ground at the `groyne-islet` golden (58.84%, rider swimming
where the baseline stands on land, 30m from the way's islet end). Bisected
by golden A/B: code + this object without the roads entry passes 42/42 at
0.000%; the same tree with the roads entry fails. The terrain coupling is
NOT yet named (carve() skips bridge ways, so it is not the road carve) —
the hunt is on the working list. Do not re-add a roads entry here without
closing that first.

MEASURED vs AUTHORED, stated per the standing rule:
  * Route, span (74.8 m), the five platform positions and the ~1.6-2.0 m
    deck width are MEASURED from the capture.
  * Deck/rail colours (pale/white per the capture and the spec's strip.jpg
    reading), pile spacing and rail height are AUTHORED; no drawing of the
    bridge is published. Truss webbing is deliberately NOT built — overhead
    imagery cannot resolve it (half a source buys half a change).

Run:  python3 data/silosobridge.py sentosa [--dry-run]
"""
import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

ROUTE = [[-2368.4, 12336.5], [-2419.7, 12391.0]]   # beach -> islet, 74.8 m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    d["silosobridge"] = {
        "p": ROUTE,
        "w": 1.8,          # measured 1.6-2.0; "two persons can just pass"
        "rail": 1.05,
        "plat": 5,         # the five widened cross-platforms, evenly spaced
        "platw": 3.6,      # platform width across the deck, measured ~3-4 m
    }

    # the roads-entry experiment, removed if a run of the old version left it
    n0 = len(d.get("roads", []))
    d["roads"] = [r for r in d.get("roads", []) if r.get("auth") != "silosobridge"]
    if len(d["roads"]) != n0:
        print("   removed the old roads entry (see the golden-refusal note above)")

    print(f"== silosobridge {a.id}: {ROUTE[0]} -> {ROUTE[1]}")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
