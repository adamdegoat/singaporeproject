"""HEIGHTS — calibrate the guess against the district's OWN surveyed buildings.

The owner: "make the entire sentosa like real sentosa ya meaning the buildings
too everything need research."

Some of that is research one building at a time, and that work is real (see
research/). But the biggest single error on this island is not any one
building, it is the DEFAULT, and it is measurable:

    sourced heights (OSM building:levels)   n=580   median  6.8 m
    guessed heights                         n=501   median 14.4 m

The guess is more than twice as tall as the reality standing next to it. 119
buildings sit at exactly 20m — six storeys — on an island whose surveyed
median is two. That single number is most of why Sentosa reads as a wall of
mid-rise blocks instead of a low-rise resort island.

And the map already contains the answer. 580 buildings HERE carry a real levels
tag, so the district can calibrate its own guess: band the surveyed ones by
footprint, take the median of each band, and give unsourced buildings the
figure their neighbours of the same size actually have. Measured on Sentosa:

    footprint < 300 m2    median  6.8 m
    300 - 1,000 m2        median  6.8 m
    1,000 - 3,000 m2      median 20.4 m
    3,000 m2 +            median 23.8 m

so footprint genuinely predicts height here, and the bands are not invented —
each is the median of real tagged buildings in the same place.

THIS IS STILL A GUESS AND IT SAYS SO. Every building it touches is marked
`hs: "calib"`, never "levels". The accuracy ledger counts a rule as INVENTED no
matter how well founded, which is correct and must not be laundered: this
replaces a bad guess with a defensible one, it does not turn a guess into a
measurement.

A band needs MIN_SAMPLE surveyed buildings before it is trusted; below that it
falls back to the district median, because a "median" of three buildings is an
anecdote.

Run:  python3 data/heights.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
# IMPORTED, NOT RE-TYPED — and from buildtypes.py rather than from process.py,
# which is where this import was first written and where it silently killed
# this whole script. See the note at the top of data/buildtypes.py.
from buildtypes import SELF_SCALED                         # noqa: E402

# footprint bands, in m2
# FINER BANDS. 300-1000 m2 is far too coarse a bucket to carry one median: it
# lumps a 320 m2 villa in with a 950 m2 hall, and giving both the villa's 6.8m
# put fifty large footprints under 8m — which data/check.py refuses, correctly,
# because a 600 m2 building three metres high is a shed and not a building.
BANDS = [(0, 150), (150, 400), (400, 700), (700, 1200),
         (1200, 3000), (3000, 1e12)]
# ...AND A HARD FLOOR TIED TO FOOTPRINT, which is the same rule check.py
# enforces. Calibration may make a building shorter than its neighbours; it may
# not make it a shed.
BIG_AREA, BIG_MIN_H = 600.0, 8.5
MIN_SAMPLE = 12
SOURCED = {"levels", "osm", "site", "named"}
# a storey, for rounding to something a building could actually be
STOREY = 3.4
# The least mass a building may have ABOVE a route that runs through it.
# Matches openground.py's own MIN_MASS: a roof with no thickness is not a
# building, it is a canopy, and the two are different things.
MIN_SPAN = 2.5


# RESEARCHED HEIGHTS BEAT THE CALIBRATION, and a published figure beats both.
#
# The bands above are a defensible guess for a building nobody has written
# about. Where somebody HAS, the fact wins. Keyed on a lowercase substring of
# the mapped name; `floors` is multiplied by STOREY, `m` is used as given.
# Every entry carries its source, and an entry without one does not belong here.
RESEARCHED = [
    # RESORTS WORLD SENTOSA. The owner: "that place got alot of levels and
    # different architectures. So must do properly please." Researched
    # 2026-08-04; each figure published.
    #
    # Hotel Michael — 11 storeys, 470 rooms, by Michael Graves. e-architect /
    # RWS. (The site data already gives its outbuildings 36.6m, which is
    # 11 storeys, so this agrees with the survey rather than overriding it.)
    ("hotel michael", {"floors": 11}),
    # Crockfords Tower — 9 storeys, 120 all-suite keys with mansions on the
    # penthouse level. rwsentosa.com.
    ("crockfords", {"floors": 9}),
    # The Laurus (Hard Rock Hotel until July 2025, reopened October 2025) —
    # 183 suites across FIVE storeys. asgam.com / rwsentosa.com. Ours stood at
    # 55m before any of this, which is three times the real building.
    ("hard rock", {"floors": 5}),
    ("laurus", {"floors": 5}),
    # The Barracks Hotel Sentosa — a restored 1940 British barracks, two
    # storeys. fareasthospitality.com / thebarrackshotel.com.sg, 2026-08-04.
    ("barracks hotel", {"floors": 2}),
    # Oasia Resort Sentosa — a three-storey 1940 heritage barracks block with a
    # six-storey modern annexe. The mapped footprints are separate, so the
    # taller figure goes to the larger one. oasiahotels.com / Far East
    # Hospitality, 2026-08-04.
    ("oasia resort", {"floors": 6}),
    ("oasis resort", {"floors": 3}),

    # SENTOSA HEIGHTS PASS, 2026-08-07. research/sentosa-heights.md.
    #
    # Storey counts only, except where a metre figure is genuinely published.
    # Every needle below was checked against EVERY district's building names
    # before it was added: every one matches Sentosa and nothing else, so none
    # of them can reach into another district by substring. "outpost" matched no
    # footprint at all and is not carried, because a needle that matches nothing
    # is a line someone has to read forever. ("altitudex" and "marine division"
    # ARE carried even though the raw extract does not use those names yet —
    # stale.py renames into them at the end of the chain, and this table is
    # re-applied after it. See the note at each.)

    # --- RWS
    # Hotel Ora — "a seven-storey property", RWS press release, 14 Jul 2023.
    ("hotel ora", {"floors": 7}),

    # --- Sentosa hotels
    # Shangri-La Rasa Sentosa — 454 rooms over 11 floors, the tallest hotel
    # block on Sentosa proper. Stood at 20.4 m, which is half of it.
    ("rasa sentosa", {"floors": 11}),
    # Sofitel Singapore Sentosa — 211 rooms + 4 villas over five floors, built
    # as The Beaufort (1992, Kerry Hill). CAVEAT KEPT FROM THE RESEARCH: the
    # 19,164 m2 footprint merges the main block with much lower wings, so five
    # floors is the MAIN BLOCK and this may want a footprint split later.
    ("sofitel", {"floors": 5}),
    # Siloso Beach Resort — 8 floors (Superior L2-3, Deluxe L5-8), 2006.
    ("siloso beach resort", {"floors": 8}),
    # Amara Sanctuary Sentosa — 4 storeys, 137 rooms, 2007.
    ("amara sanctuary", {"floors": 4}),
    # Capella Singapore — 5 storeys: two 1880s Tanah Merah bungalows plus the
    # Foster + Partners crescent wings stepping down the slope.
    ("capella singapore", {"floors": 5}),
    # Raffles Sentosa — opened 3 Mar 2025, 62 villas, ALL SINGLE STOREY, on a
    # 100,000 m2 hilltop. It was standing at 23.8 m, which was the worst single
    # height on the island: seven storeys of band median over a villa resort.
    #
    # 6.5 m AND NOT ONE STOREY, because two research passes are describing two
    # different things and only one of them is describing THIS footprint.
    # sentosa-heights.md (2026-08-07) is right that the resort is single-storey
    # villas — but the villas are separate unnamed footprints, which carry
    # 3.4-3.5 already. The one polygon wearing the name is the LOBBY PAVILION,
    # which resort-footprints.md measured at 6.5 m, and a lobby pavilion is
    # taller than a villa. The more specific reading of the same object wins.
    # (data/resortfix.py holds the same 6.5 and cannot reach it: at the point
    # resortfix runs this footprint is still anonymous — the same ordering bug
    # that --apply-researched exists to close.)
    ("raffles sentosa", {"m": 6.5}),

    # --- Brani
    # SCDF Marine Division HQ — four storeys, opened 19 Jun 2026. mha.gov.sg.
    # Both names, for the same reason as AltitudeX above: stale.py corrects
    # "Marine Command" to "Marine Division" and this table is read afterwards.
    ("marine command", {"floors": 4}),
    ("marine division", {"floors": 4}),

    # --- Sentosa Cove. Storeys from EdgeProp, which is URA-derived. The
    # published bound: The Oceanfront is the Cove's tallest at a maximum
    # permissible 15 storeys, and Cape Royale is the only other above 8.
    ("oceanfront", {"floors": 15}),
    ("cape royale", {"floors": 18}),        # URA/EdgeProp max; marketing 17-20
    ("seascape", {"floors": 8}),
    ("the coast at sentosa cove", {"floors": 8}),
    ("turquoise", {"floors": 6}),
    ("the azure", {"floors": 6}),
    ("berth by the cove", {"floors": 6}),
    ("residences at w", {"floors": 6}),
    ("marina collection", {"floors": 4}),
    ("seven palms", {"floors": 4}),
    # Quayside Isle — two-storey waterfront retail, CDL, 2012. Ours had its two
    # footprints at 27.2 m and 22 m, which is a mall over a marina promenade.
    ("quayside isle", {"floors": 2}),

    # --- Where OSM already knew and the band median overrode it
    # Images of Singapore / Madame Tussauds — the former British Sick Quarters
    # (1893-1950), colonial masonry, OSM-tagged 2 levels.
    ("images of singapore", {"floors": 2}),
    # Sentosa Golf Club — OSM tags the clubhouse 2 levels and nothing is
    # published, so the tag beats a footprint-band median.
    ("sentosa golf club", {"floors": 2}),
    # The beach event pavilions on Siloso Beach Walk, single volumes. Sapphire
    # is OSM building=roof, i.e. a canopy. Both needles match the venue's
    # spelling AND our data's misspelling ("Pavillion").
    ("emerald pavil", {"floors": 2}),
    ("sapphire pavil", {"floors": 1}),

    # --- Published metres
    # AltitudeX (ex-iFly) — the flight chamber alone is 17.2 m tall, and the
    # building encloses it. Sentosa's own copy: "the height of a 6-storey flat".
    # BOTH SPELLINGS ON PURPOSE. stale.py renames iFly -> AltitudeX at the end
    # of the chain and this table is re-applied AFTER it, so the new name is
    # what a needle has to match; the old one stays because the rename is
    # data-dependent and a district built from an older extract still says iFly.
    # A rename that silently unhooks a researched height is a bug you cannot
    # see — the building just quietly goes back to a band median.
    ("ifly", {"floors": 6}),
    ("altitudex", {"floors": 6}),

    # TANJONG BEACH CLUB — 6.5 m, and the number is an EST with its basis
    # written out, not a published figure dressed up as one.
    #
    # It stood at h 20.4 / h0 20 — the "no height, no storeys" default —
    # which research/tanjong-beach.md logged as a SEPARATE defect from "the
    # beach club is missing". They were the same building: footprint at
    # (-584, 13644), 1,154 m2, and the 20 m slab was it.
    #
    # THE BRIEF SAID "Building form, footprint and height: UNPUBLISHED." The
    # form was published, in this project's own inventory, eight weeks before
    # anyone went looking (research/sentosa-inventory-2026.md, 2026-08-07):
    # "a low-rise SINGLE-STOREY beach-house pavilion set back behind the sand,
    # with the pool as the centrepiece between building and beach."
    #
    # FOUR THINGS AGREE, AND NONE OF THEM IS A GUESS ABOUT THE HEIGHT ITSELF:
    #   1. Published form: single storey (above).
    #   2. Published floor area 1,114.84 m2 against a DERIVED footprint of
    #      1,154 m2 — a 3.4% match. GFA that equals the footprint IS a
    #      one-storey building; a second floor would roughly double it. This
    #      is the strongest of the four because it is arithmetic, not prose.
    #   3. Satellite, ESRI World Imagery z19 fetched 2026-08-21 (the method in
    #      research/bikini-sandbar-measured.md): flat roofs with rooftop plant,
    #      an L-plan wrapping the pool courtyard, no tall mass anywhere in the
    #      compound. The OSM ring traces the built L exactly — it is the
    #      BUILDING, not the whole site, which was worth checking before
    #      trusting its area in (2).
    #   4. A published MEZZANINE (~40 seats) — so one tall volume with an
    #      internal half-level, which is why this is not STOREY x 1 = 3.4 m.
    #
    # SO WHY 6.5 AND NOT 3.4: exactly the Raffles Sentosa case above. The
    # resort is published single-storey and its villas carry 3.4; the polygon
    # WEARING THE NAME is the lobby pavilion, and a pavilion is taller than a
    # villa. Same here, same figure, same reasoning — and it sits inside the
    # band data/venues.py already carries for this building type on this
    # island (Coastes 5.0, Ola Beach Club 6.0, Emerald Pavilion 8.0).
    #
    # THE SHADOW ROUTE WAS TRIED AND REFUSED. A shadow length would have made
    # this a measurement instead of an estimate, but the z19 capture is
    # near-noon: the sand beside the club reads p5 97 / p95 212 with the dark
    # tail owned by parasols and vegetation, not by a roof edge, and there is
    # no object of known height in frame to calibrate a sun elevation against.
    # A number derived from that would be an estimate wearing a measurement's
    # clothes, which is worse than an estimate that says so.
    ("tanjong beach club", {"m": 6.5}),

    # TWO PUBLISHED FIGURES FROM THE RESEARCH ARE DELIBERATELY NOT HERE, and
    # both for the same reason: THE FOOTPRINT IS NOT THE THING.
    #
    #   Wings of Time, published backdrop 10 m. The stage is bespoke
    #   (buildWingsStage, city.js) and reads nothing from b.h — it is built to
    #   the contractor's own figures off the surveyed ring. An entry here could
    #   not raise it and could only re-arm the hut-grows-to-the-terrain rules
    #   that this very structure taught us about.
    #
    #   Battlestar Galactica, published 42.5 m. That is the LIFT HILL, and
    #   landmarks.js already builds the ride to it. The mapped footprint is the
    #   STATION BUILDING. Applying 42.5 m here would stand a shed the height of
    #   the coaster beside the coaster.
    #
    # A published number is only a fact about the thing it describes.
]


def researched_for(name):
    low = (name or "").lower()
    for (needle, spec) in RESEARCHED:
        if needle in low:
            return spec
    return None


# THE TABLE ABOVE IS KEYED ON A NAME, AND HALF THE NAMES DO NOT EXIST YET
# WHEN THIS PASS RUNS. Measured 2026-08-07, and it had been silently eating
# research for as long as both passes have existed.
#
# `attractions.py` runs FIFTEEN passes after this one, and one of the things it
# does is hand a surveyed SITE name to the largest unnamed footprint standing
# inside it — which is the only reason "Shangri-La's Rasa Sentosa Resort & Spa"
# and "Raffles Sentosa Singapore" are named at all (OSM tags those as
# `tourism=hotel` site boundaries with no `building` tag). At the moment this
# pass runs they are anonymous, `researched_for` returns None, and they take a
# footprint-band median: Rasa at 20.4 m against a published eleven floors,
# Raffles at 23.8 m over a resort of SINGLE-STOREY villas. Run this file by
# hand afterwards and both correct themselves, which is exactly the shape of
# "the data is fine and is not reproducible from the build" that this repo has
# already paid for once.
#
# Reordering was the wrong fix: build_district.py's pass order is a measurement
# with its own warnings on it, and heights.py legitimately has to run before
# arcade.py. So the table is APPLIED TWICE — once here, and once more at the
# end of the chain by `--apply-researched`, when every naming pass has run.
#
# The second application deliberately touches ONLY the population this pass
# already owns: heights it guessed itself (`calib`, or never set). A surveyed
# `building:levels` tag still wins over the table, which is the same precedence
# as the first pass, so running it twice cannot promote research over a survey.
def apply_researched(did, dry_run=False):
    path = os.path.join(HERE, f"{did}.json")
    d = json.load(open(path))
    hits, conflicts = [], []
    for b in d.get("buildings") or []:
        if b.get("hs") not in (None, "calib"):
            continue
        spec = researched_for(b.get("n"))
        if not spec:
            continue
        h = round(spec["m"] if "m" in spec else spec["floors"] * STOREY, 1)
        if abs(b.get("h", 0) - h) < 0.05:
            continue
        # A RESEARCHED HEIGHT MUST STILL CLEAR THE ROAD UNDER THE BUILDING.
        #
        # openground.py lifts a footprint a surveyed route runs through and
        # records the clearance in `mh` -- a MEASURED fact, the ground under a
        # real road. This pass then wrote a researched height straight over the
        # top of it with no test, and the two can disagree: Quayside Isle came
        # out h 6.8 (research: two storeys, CDL, 2012) over mh 6.6, a building
        # whose base stood 0.2 m below its own roof and which therefore drew as
        # a solid block across the route it is supposed to span.
        #
        # BOTH NUMBERS ARE SOURCED, so this does not pick a winner quietly. It
        # keeps the world CONSISTENT -- nothing impossible ships -- and says
        # out loud that two facts disagree, with both of them named, so the
        # next person resolves it with evidence instead of discovering it as a
        # solid block in a frame. Silence here would be the whole failure mode
        # this file's own header warns about.
        _mh = b.get("mh") or 0
        if _mh > 1 and h < _mh + MIN_SPAN:
            conflicts.append((b.get("n"), h, _mh, round(_mh + MIN_SPAN, 1)))
            h = round(_mh + MIN_SPAN, 1)
        hits.append((b.get("n"), b.get("h"), h))
        if "h0" not in b:
            b["h0"] = b.get("h")
        b["h"] = h
        b["hs"] = "research"
        if h < 8.0:
            b["low"] = 1              # a researched fact is not a shed
    print(f"== heights --apply-researched {did}")
    for n, was, now in hits:
        print(f"   {n}: {was} -> {now}   (named after heights.py had already run)")
    for n, want, mh, used in conflicts:
        print(f"   ! {n}: researched {want}m is BELOW its measured road "
              f"clearance {mh}m — used {used}m so the span stays a building. "
              f"Two sourced facts disagree; resolve with evidence.")
    if not hits:
        print("   nothing left to apply — every researched name was in place "
              "when heights.py ran")
    if not dry_run and hits:
        json.dump(d, open(path, "w"), separators=(",", ":"))
    return len(hits)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply-researched", action="store_true",
                    help="second pass: re-apply the RESEARCHED table after the "
                         "naming passes have run. See the note above.")
    a = ap.parse_args()
    if a.apply_researched:
        apply_researched(a.id, a.dry_run)
        return
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))
    blds = d.get("buildings") or []

    # undo a previous run so this is idempotent
    for b in blds:
        if b.get("hs") in ("calib", "research"):
            b.pop("hs", None)
            b.pop("low", None)
            if "h0" in b:
                b["h"] = b.pop("h0")

    sourced = [b for b in blds if b.get("hs") in SOURCED and b.get("h")]
    # A BUILDING'S OWN NAME KNOWS BETTER THAN A BAND.
    #
    # A complex is mapped as many footprints under one name, and the survey
    # often tags only some of them. Resorts World is the case that made this
    # obvious: Hotel Michael's outbuildings carry a surveyed 36.6m — eleven
    # storeys, exactly what the research says — while its MAIN 4,169 m2
    # footprint had no tag and got a 27.2m band median, so one hotel stood at
    # two different heights. Equarius, Crockfords and the Hard Rock block all
    # did the same.
    #
    # So before falling back to a footprint band, ask whether anything else
    # wearing this name was actually surveyed, and match it.
    by_name = {}
    for b in sourced:
        n = (b.get("n") or "").strip().lower()
        if n:
            by_name.setdefault(n, []).append(b["h"])
    name_h = {n: statistics.median(v) for n, v in by_name.items() if v}
    if len(sourced) < 40:
        print(f"  ! only {len(sourced)} surveyed heights — too few to calibrate, "
              "leaving the guess alone")
        return
    overall = statistics.median([b["h"] for b in sourced])

    band_h = []
    for (lo, hi) in BANDS:
        got = [b["h"] for b in sourced if lo <= (b.get("a") or 0) < hi]
        if len(got) >= MIN_SAMPLE:
            band_h.append((lo, hi, statistics.median(got), len(got)))
        else:
            band_h.append((lo, hi, overall, len(got)))

    print(f"== heights {a.id}")
    print(f"   {len(sourced)} surveyed, district median {overall:.1f} m")
    for (lo, hi, med, n) in band_h:
        tag = "" if n >= MIN_SAMPLE else f"  (only {n} surveyed — using district median)"
        his = "+" if hi > 1e11 else f"-{hi:.0f}"
        print(f"     footprint {lo:.0f}{his:<8} median {med:5.1f} m from {n:4d} surveyed{tag}")

    changed = 0
    before = []
    after = []
    for b in blds:
        if b.get("hs") in SOURCED or not b.get("h"):
            continue
        # A CANOPY'S HEIGHT IS A CLEARANCE, NOT A STOREY COUNT.
        #
        # `building=roof` is a slab on columns — city.js draws it that way and
        # its "height" is how far off the ground the slab sits. Banding it by
        # footprint like a storeyed building took the canopy over the Universal
        # Studios forecourt from 5m to 20.4m, and standing by the globe the sky
        # was replaced by a dark textured slab across the whole frame. The most
        # photographed spot on the island, ruined by a rule that had no business
        # touching it.
        #
        # Same for anything already lifted (`og`/`mh`): openground.py computed
        # that clearance against the ground under a real road, and a median has
        # nothing to add.
        if b.get("roof") or b.get("og") or (b.get("mh") or 0) > 1:
            continue
        # ...AND THE SAME FOR EVERY OTHER TYPE THAT IS ITS OWN HEIGHT
        # STATEMENT. The `roof` guard above was written for one canopy and left
        # the rest of the family behind: a `building=hut` and a
        # `building=grandstand` — the Wings of Time stage set and its 2,712 m2
        # seating bank, the two nearest structures to the spawn point — were
        # both banded up to 20.4 m off their footprint area and both shipped as
        # solid slabs in the first frame of the world. A hut is single-storey
        # because it is a hut. The list lives in process.py beside the defaults
        # it belongs to, so the two cannot drift apart.
        if b.get("bt") in SELF_SCALED:
            continue
        area = b.get("a") or 0
        med = overall
        nm = (b.get("n") or "").strip().lower()
        inherited = name_h.get(nm) if nm else None
        if inherited is not None:
            med = inherited
        else:
            for (lo, hi, m, n) in band_h:
                if lo <= area < hi:
                    med = m
                    break
        # A LITTLE VARIATION, FROM THE POSITION, NEVER FROM AN RNG STREAM.
        # 442 identical boxes is its own kind of wrong, and this project's rule
        # is that a cosmetic choice must not be able to move a bus stop.
        p = b.get("p") or [[0, 0]]
        hx = (abs(p[0][0]) * 7.31 + abs(p[0][1]) * 3.17) % 1.0
        # an inherited height is a fact about THIS building, so it is taken as
        # given; only a band median gets the spread
        h = med if inherited is not None else med * (0.82 + 0.36 * hx)
        # round to a storey, floor at one
        if inherited is None:
            h = max(STOREY, round(h / STOREY) * STOREY)
        if area > BIG_AREA and not researched_for(b.get("n")):
            h = max(h, BIG_MIN_H)
        spec = researched_for(b.get("n"))
        if spec:
            h = spec["m"] if "m" in spec else spec["floors"] * STOREY
            # A RESEARCHED FACT IS NOT A SHED. check.py refuses a footprint over
            # 600 m2 standing under 8m, which is the right guard against the
            # pipeline guessing a big hall short — and The Barracks Hotel really
            # is a two-storey 1940 barracks on a 1,930 m2 plan. check.py already
            # has the mechanism for this: `low` means A SOURCE SAYS SO, as
            # opposed to the pipeline having guessed it. So say so.
            if h < 8.0:
                b["low"] = 1
        elif b.pop("low", None):
            pass
        before.append(b["h"])
        b["h0"] = b["h"]
        b["h"] = round(h, 1)
        b["hs"] = "research" if spec else "calib"
        after.append(b["h"])
        changed += 1

    if before:
        print(f"   recalibrated {changed} guessed heights: "
              f"median {statistics.median(before):.1f} m -> "
              f"{statistics.median(after):.1f} m")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
