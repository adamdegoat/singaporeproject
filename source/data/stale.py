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
# KIDZANIA WAS IN HERE AND IT IS OPEN. Removed 2026-08-08.
#
# The entry read "closed 2020; the Palawan site was relaunched without it" and
# cited `research/palawan-spawn.md` — WHICH SAYS THE OPPOSITE, in bold, in its
# own loud table: "closed mid-2020 -> REOPENED 16 May 2024 ... operating in the
# Palawan Kidz City shed, 31 Beach View. **Build it.**" It has a live page at
# `sentosa.com.sg/attractions/kidzania-singapore/`, the reopening is sourced
# three ways (BYKidO, theAsianDad, Travel Weekly Asia) with the unit number,
# and the same research warns that the shuttle stop is STILL called "Palawan
# Kidz City" for a building that has been KidZania since 2024.
#
# So a live attraction was being deleted from the island on the authority of
# the document that says to build it. THE HALF OF A SOURCE THAT SUPPORTS THE
# ENTRY IS NOT THE SOURCE — this file's own header demands a source and a date
# for every row and the row had both, correctly formatted, and was still wrong.
# When a row cites a file, the reviewer's job is to read that file's verdict,
# not to confirm the phrase appears in it.
#
# NOTE FOR WHOEVER RESTORES IT: removing the entry stops the deletion happening
# again, but it does NOT put KidZania back into `data/sentosa.json` — the
# record was deleted from the scene by an earlier run and only a district
# rebuild re-fetches it. It is absent from every layer today. See NEXT.md.
CLOSED["Hard Rock"] = (
    "the Hard Rock brand left Singapore in March 2024; the hotel is The "
    "Laurus (research/sentosa-heights.md)")
CLOSED["Hard Rock Cafe"] = (
    "the Hard Rock brand left Singapore in March 2024 "
    "(research/sentosa-heights.md)")

# THE PALAWAN GHOST ROW, 2026-08-08. research/palawan-spawn.md §1a-0 carries
# these as a DELETE-BY-ID list, and its point is that there is nothing to reason
# about: every one is still an ACTIVE object in the OSM database (checked live
# on Overpass 2026-08-07 11:14 UTC), which is exactly how they reached us.
#
# Five of the six stood within ~40 m of each other. They were ONE low-rise
# beachfront shophouse row, 70-85 Palawan Beach Walk, and that row is gone — the
# site is now the +Twelve / HydroDash end of The Palawan @ Sentosa. There is no
# souvenir shop and no food court on Palawan Beach in 2026.
#
# This matters more than the count: "Island Life Shop" stands 50 m from the
# SPAWN POINT. It is one of the first labels the owner can read on loading in,
# and it names a shop that shut in the eight weeks between 19 March and 19 May
# 2012. The dates below were bracketed by diffing SDC's own dated printed
# island maps (Sept 2011, Jan 2015, July 2017) against Wayback snapshots of
# SDC's directory pages — not from a review site, which this research is
# explicit never proves a venue is trading.
CLOSED["Koufu"] = (
    "Palawan Beach food court; on SDC's Sept 2011 map, gone by Jan 2015 "
    "(research/palawan-spawn.md 1a-0, way/163502438)")
CLOSED["Silk Road of the Sea"] = (
    "opened May 2007 as Amara Sanctuary's beach-level annexe; on the Sept 2011 "
    "map, gone by Jan 2015 (research/palawan-spawn.md 1a-0, way/163502425)")
CLOSED["Island Life Shop"] = (
    "listed on SDC's shopping directory 19 Mar 2012, absent from the same page "
    "19 May 2012; the brand today is SentosaShop at Central Beach Bazaar "
    "(research/palawan-spawn.md 1a-0, way/163201819)")
CLOSED["Mövenpick of Switzerland"] = (
    "on SDC's Jan 2015 map, gone by July 2017 "
    "(research/palawan-spawn.md 1a-0, way/176839446)")
CLOSED["Samundar Indian Fusion Crusine & Bar"] = (
    "est. 2006 at 85 Palawan Beach Walk and lasted the longest of the row; "
    "still item 34 on the July 2017 map, gone 2017-2019 "
    "(research/palawan-spawn.md 1a-0, way/176839457)")
CLOSED["Bora Bora Beach Bar"] = (
    "closed end Nov 2018 after 18 years "
    "(research/palawan-spawn.md 1a-0, way/176839400)")

# SILOSO'S TWO JANUARY 2026 CLOSURES, and the reason they only became this
# file's problem on 2026-08-21.
#
# The shops fetch had never asked for `amenity=bar`, so no beach bar on the
# island had ever reached the scene through OSM at all -- which meant a stale
# bar in the cache could not hurt anybody. Widening that query (build_district
# .py, SHOPS_Q) turned every bar in the extract into a name on a wall, and OSM
# does not retag a business the week it stops trading. Rumours is still tagged
# amenity=bar on way/116818155 today, nineteen weeks after its last night.
#
# NOT ON THIS LIST, ON PURPOSE: Baristart Coffee. research/siloso-venues.md
# "genuinely uncertain" 1 suspects it went with Rumours -- same site, same
# operator group (Blue Waves), absent from Sentosa's 2026 dining directory --
# and could find no closure notice either way. This file's rule is a source and
# a date. Deleting a trading venue on suspicion is the same error as building a
# closed one, pointed the other way.
CLOSED["Rumours Beach Club"] = (
    "last guests 4 January 2026 after six years; OSM still tags the shell "
    "amenity=bar (research/siloso-venues.md 1.9, way/116818155)")
CLOSED["Tipsy Unicorn Beach Club"] = (
    "Tipsy Bird Pte Ltd, compulsory liquidation; ceased trading 30 January "
    "2026. Absent from the cache today -- listed so a refetch cannot quietly "
    "resurrect it, and because Sentosa's own directory is still stale "
    "(research/siloso-venues.md 1.5)")
CLOSED["Tipsy Unicorn"] = CLOSED["Tipsy Unicorn Beach Club"]

# AND THE PIRATE SHIP, WHICH IS THE ONE A PLAYER WOULD WALK TO. The free water
# playground reopened Feb 2017 as a ship-only remnant and had its last day on
# 14 Apr 2019. Splash Tribe's pool and cabanas stand on the site, verified
# against 2026 satellite: no ship, no water playground, no trace. Our
# `parkfurn` carries it as `{"k":"playground","r":10.8,"n":"Pirate Ship"}`
# 265 m from the spawn — a labelled attraction with nothing behind it, which is
# the precise thing walksweep.mjs exists to find.
CLOSED["Pirate Ship"] = (
    "Palawan Pirate Ship water playground; last day 14 Apr 2019, Splash Tribe "
    "stands on the site (research/palawan-spawn.md 1a-0, way/528233073)")

# NOT IN HERE ON PURPOSE — "Palawan Amphitheatre" and "Animal & Bird
# Encounters". The SHOW is gone (SDC has delisted it entirely; no page, no
# sitemap entry, no dated source after 2023) but the research is explicit that
# the amphitheatre SHELL, OSM way/163502445, 207 m2, 21 x 15 m, "may well still
# stand — build the shell if imagery supports it, not the show." We carry only
# the building, not the show, so deleting its name would remove a structure
# that is probably there. The research also warns why the temptation exists:
# the beach-shuttle stop is still called "Opp Animal & Bird Encounters", and a
# stop name proves nothing — Sentosa's stops are still called "Palawan Kidz
# City" for a building that has been KidZania since 2024.

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
