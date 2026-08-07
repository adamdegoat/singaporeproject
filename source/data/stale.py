"""PLACES THE MAP STILL CARRIES THAT ARE NOT THERE ANY MORE.

data/attractions.py's own header has said this since the day it was written:

    "It also does not filter for staleness -- OSM still tags Madagascar and its
     rides on Sentosa, which closed in March 2022 and became Minion Land in
     February 2025, so the DRAW side must check what it builds against the
     research rather than trusting a name here."

Nothing on the draw side ever did. So the island still labels a zone that shut
four years ago, and a player walking it learns a fact that is wrong.

That matters more than it looks. The owner, 2026-08-06, setting the standard:
"when players play it the map should be like sentosa so they know how to walk
ard". A visitor who learns "Madagascar is over there" and then goes to Sentosa
finds Minion Land. The map has taught them something false, which is worse than
teaching them nothing.

WHY THIS IS A SEPARATE FILE. attractions.py FETCHES; it is deliberately dumb
about what things are, and its header says so. process.py is not the place for
per-place history either. Corrections that come from RESEARCH rather than from
the map belong in one file that carries its sources, so the next person can
check the claim instead of trusting it — the same reason data/cablestations.py
and data/sensoryscape.py exist.

EVERY ENTRY NEEDS A SOURCE AND A DATE. No entry goes in here because it looked
wrong.

Run:  python3 data/stale.py sentosa [--dry-run]
"""
import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# name -> new name. The zone is PUBLISHED as renamed and rebuilt.
RENAME = {
    "Madagascar": ("Minion Land",
                   "Madagascar closed 2022-03; the zone reopened as Minion Land "
                   "2025-02 (research/rws-architecture.md, attractions.py header)"),
}

# names that are GONE. Removing a record is the honest move when the thing is
# not there — a label with nothing behind it is what walksweep.mjs exists to
# find, and inventing a replacement we have not researched would be worse.
CLOSED = {
    "A Crate Adventure": "Madagascar boat ride; closed with the zone 2022-03",
    "King Julien's Beach Party-Go-Round": "Madagascar carousel; closed 2022-03",
    "Marty's Casa Del Wild": "Madagascar retail/meet-and-greet; closed 2022-03",
}

# THE DINOSAUR ZONE'S REAL NAME. research/rws-architecture.md 2.0, in its list
# of corrections: "the dinosaur zone is officially The Lost World, not Jurassic
# Park or Jurassic World." OSM carries "Jurassic World".
RENAME["Jurassic World"] = (
    "The Lost World",
    "officially The Lost World, not Jurassic Park/World "
    "(research/rws-architecture.md 2.0)")

# ---------------------------------------------------------------------------
# 2026-08-07 PASS. research/sentosa-inventory-2026.md + sentosa-heights.md,
# both written that day against dated first-party sources. Every entry below
# is a label a player can READ, which is the only reason it is worth fixing:
# the owner's standard is that someone who learns the island here should be
# able to walk the real one.

# Renamed, and the old name is what OSM still carries.
RENAME["iFly Singapore"] = (
    "AltitudeX",
    "rebranded AltitudeX 2025; the 17.2 m flight chamber is unchanged "
    "(research/sentosa-heights.md, sentosa-inventory-2026.md)")
# NOT RENAMING "Oasis Resort Sentosa" -> "Oasia", though the operator does
# spell it Oasia and research/sentosa-heights.md §4 is right that ours is a
# mis-tag. THE TYPO IS LOAD-BEARING, which is its own small horror: the resort
# is two footprints — a three-storey 1940 heritage barracks block and a
# six-storey modern annexe — and data/heights.py tells them apart ONLY by that
# spelling, ("oasia resort", 6) against ("oasis resort", 3). Correcting the
# name here collapses both onto the 6-storey needle and quietly makes a
# conserved barracks block twice its height. Fix the height table to separate
# them by coordinate first, then come back and rename. Left wrong on purpose,
# which is better than wrong by accident.
RENAME["Singapore Civil Defence Force Marine Command Headquarters"] = (
    "Singapore Civil Defence Force Marine Division Headquarters",
    "SCDF renamed Marine Command to Marine Division; the new HQ opened "
    "2026-06-19 (mha.gov.sg, via research/sentosa-heights.md)")
RENAME["AJ Hackett Sentosa"] = (
    "Skypark Sentosa by AJ Hackett",
    "the operator's own branding (research/sentosa-inventory-2026.md)")
# Spellings the venue itself does not use. Small, and they are on signage.
RENAME["Emerald Pavillion"] = (
    "Emerald Pavilion", "the venue spells it Pavilion (research/siloso-venues.md)")
RENAME["Sapphire Pavillion"] = (
    "Sapphire Pavilion", "the venue spells it Pavilion (research/siloso-venues.md)")
RENAME["Sentosa 4d Adventureland"] = (
    "Sentosa 4D AdventureLand",
    "the attraction's own capitalisation; ours came from a postcode lookup "
    "(research/sentosa-inventory-2026.md)")
RENAME["ONE ̊15 Marina"] = (
    "ONE°15 Marina",
    "a combining ring above (U+030A) instead of a degree sign; the marina "
    "writes ONE°15 (research/sentosa-heights.md §4)")

# Gone. A label with nothing behind it teaches a player something false.
CLOSED["Stage28"] = (
    "never opened — cancelled pre-launch; the shell is Sesame Street "
    "Spaghetti Space Chase (research/sentosa-heights.md)")
CLOSED["The Coliseum"] = (
    "closed 2024 (research/sentosa-inventory-2026.md)")
CLOSED["Costa Sands Resort (Sentosa)"] = (
    "closed 2019 (research/sentosa-inventory-2026.md)")
CLOSED["Dolphin Island"] = (
    "closed 2025 (research/sentosa-heights.md, sentosa-inventory-2026.md)")
CLOSED["KidZania Singapore"] = (
    "closed 2020; the Palawan site was relaunched without it "
    "(research/palawan-spawn.md)")
CLOSED["Hard Rock"] = (
    "the Hard Rock brand left Singapore in March 2024; the hotel is The "
    "Laurus (research/sentosa-heights.md)")
CLOSED["Hard Rock Cafe"] = (
    "the Hard Rock brand left Singapore in March 2024 "
    "(research/sentosa-heights.md)")

# NOT IN HERE, AND THE RESEARCH WAS WRONG ABOUT IT — recorded so nobody
# re-derives it. research/sentosa-heights.md §4 lists the Sentosa Cove
# "islands" (Treasure, Paradise, Coral, Sandy, Pearl) with the road-named
# footprints, as the same defect. They are not. The road-name defect was real
# and its CAUSE is fixed in attractions.py (a named `highway` way was being
# treated as a site polygon, so a road that loops donated its name to whatever
# stood inside it — seventeen footprints, `Woolwich Road` a 2,152 m2 building).
# The five Cove names come from `addr:neighbourhood`, which OSM puts on those
# houses and which is TRUE: they really are in the Treasure Island
# neighbourhood. Verified 2026-08-07 by reading the raw tags. Leave them.
#
# `PUB`, `Ray Bay` and `Sentosa Golf Club` are also left alone: all three carry
# `building=yes` in the raw extract, so those names are OSM's own statement
# about the building and not a leak from anywhere.


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    print(f"== stale {a.id}")
    renamed = removed = 0
    # `shops` added 2026-08-07: Hard Rock Cafe is a shop record, and a shop
    # label is read at exactly the distance a player stands from it.
    for layer in ("attractions", "buildings", "entrances", "parkfurn", "shops"):
        recs = d.get(layer) or []
        keep = []
        for o in recs:
            if not isinstance(o, dict):
                keep.append(o)
                continue
            n = str(o.get("n") or "").strip()
            if n in CLOSED:
                # A CLOSED RIDE'S BUILDING IS STILL A BUILDING.
                #
                # First cut deleted these from every layer, which would have
                # punched holes in the built fabric: Minion Land was built in
                # the same footprints, so the STRUCTURE is still there and only
                # the NAME is false. Labels (attraction, entrance) go; the
                # footprint keeps its geometry and loses its name, so it
                # renders as ordinary park fabric instead of as a place that
                # does not exist.
                if layer == "buildings":
                    o.pop("n", None)
                    o["n0"] = n
                    o["nsrc"] = CLOSED[n]
                    print(f"   unnamed  {layer:<12} {n}  — {CLOSED[n]}")
                    removed += 1
                    keep.append(o)
                    continue
                print(f"   removed  {layer:<12} {n}  — {CLOSED[n]}")
                removed += 1
                continue
            if n in RENAME:
                new, why = RENAME[n]
                o["n"] = new
                # keep what the map said, so the correction is auditable rather
                # than a silent overwrite
                o["n0"] = n
                o["nsrc"] = why
                print(f"   renamed  {layer:<12} {n} -> {new}")
                renamed += 1
            keep.append(o)
        if len(keep) != len(recs):
            d[layer] = keep

    print(f"   {renamed} renamed, {removed} removed")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    if renamed or removed:
        json.dump(d, open(path, "w"), separators=(",", ":"))
        print(f"   written: {path}")


if __name__ == "__main__":
    main()
