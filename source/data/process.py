#!/usr/bin/env python3
"""Turn raw Overpass JSON for the ION / Ngee Ann stretch into a compact scene file.

Coordinates are projected to local metres about a centre point:
  +x = east, +z = south, y = up (three.js convention).
OSM heights are unreliable here (Hilton is tagged 2 levels but 90m), so the
landmarks that carry recognition get hand-set heights and the rest fall back to
floor count, then to a per-type default.
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# Driven by build_district.py via the environment so one code path serves every
# district; the defaults keep a bare `python3 process.py` working on Orchard.
#
# A positional argument is REFUSED, loudly. `python3 process.py bugis` used to
# ignore the word "bugis" and silently reprocess Orchard — overwriting a good
# scene file with whatever the local raw cache held (2026-07-30, recovered
# from the deployed copy). Same disease audit_roads.py had: a tool that
# ignores its argument gets trusted with arguments.
if len(sys.argv) > 1:
    sys.exit(f"process.py takes no district argument (got {sys.argv[1:]}).\n"
             f"Use: python3 build_district.py <id>   (it drives process.py "
             f"via SG_RAW/SG_OUT/SG_AXIS env vars)")
RAW_PATH = os.environ.get("SG_RAW") or os.path.join(HERE, "raw.json")
OUT_PATH = os.environ.get("SG_OUT") or os.path.join(HERE, "orchard.json")
AXIS_NAME = os.environ.get("SG_AXIS") or "orchard road"
# Defaults are the ISLAND origin (SVY21 datum), not a point in Orchard, so a
# bare run lands in the same frame every district uses.
LAT0 = float(os.environ.get("SG_LAT0") or 1.366666)
LON0 = float(os.environ.get("SG_LON0") or 103.833333)
M_PER_DEG_LAT = 110574.0
M_PER_DEG_LON = 111320.0 * math.cos(math.radians(LAT0))

# Hand-set heights in metres for the buildings that carry the recognition.
#
# Figures marked VERIFIED were checked against published sources on 2026-07-27
# rather than estimated from a storey count. Several of the estimates were well
# out: Ngee Ann City was 11m too tall, Wheelock Place 17m too short, Tang Plaza
# 32m too tall, and 313@somerset was carrying 42m for a mall with five floors
# above ground.
#
#   ION Orchard / The Orchard Residences  en.wikipedia.org/wiki/ION_Orchard
#     12 storeys (8 retail, 4 car park); tower 218m over 56 floors; ION Sky on
#     55-56; more than 90m of LED media wall on the facade
#   Ngee Ann City                         skydb.net + archify.com/sg
#     128.4m; twin 28-storey towers over a 7-floor retail podium, the WHOLE
#     complex faced in African Red polished granite -- "twin brown polished
#     granite towers", not a curtain wall. The 3.8m x 3.2m granite pre-finished
#     concrete panels are the TOWERS' module (this file used to attribute them
#     to the podium); the podium is pre-cast wall clad with granite in situ.
#     The Great Wall is Raymond Woo's stated intent for the massing.
#   Wheelock Place                        gorillaspace.sg + en.wikipedia.org
#     21 storeys, about 109m; 16 office levels over a 5-floor podium; Kisho
#     Kurokawa's conical glass atrium
#   Paragon                               paragon.com.sg/about-us
#     6 retail floors plus a 20-storey medical and office tower
#   313@somerset                          313somerset.com.sg/about-us
#     8 retail levels, but only 5 above ground (L1-L5) and 3 basement
#   Hilton Singapore Orchard              en.wikipedia.org/wiki/Hilton_Singapore_Orchard
#     two towers: 36 storeys at 144m and 40 storeys at 152m
#   Tang Plaza / Singapore Marriott       roots.gov.sg orchard-heritage-trail
#     33-storey tower under a green-tiled pagoda roof, 403 rooms
#   Orchard Central                       en.wikipedia.org/wiki/Orchard_Central
#     12 storeys, Singapore's first high-rise vertical mall
LANDMARKS = {
    "ion orchard":            {"h": 42,  "tower": 218, "key": True},
    "the orchard residences": {"h": 218, "key": True},
    "ngee ann city":          {"h": 128, "podium": 30, "key": True},   # VERIFIED 128.4m
    "takashimaya":            {"h": 32,  "key": True},
    "wisma atria":            {"h": 80,  "key": True},
    "tang plaza":             {"h": 118, "key": True},   # VERIFIED 33 storeys
    "tangs":                  {"h": 26,  "key": True},
    "singapore marriott":     {"h": 118, "key": True},   # VERIFIED, same tower
    # Shaw House: height UNPUBLISHED anywhere (checked 2026-07-29,
    # research/shaw-house.md — OSM even carries height=0), 22-storey complex
    # per Shaw's own history. 90 stays as a FLAGGED ESTIMATE only. Shaw
    # Centre behind it is published ~100m (SkyscraperPage, 1972).
    "shaw house":             {"h": 90},
    "shaw centre":            {"h": 100},
    # SOTA: CTBUH building 16766 publishes 56m / 10 floors; the OSM tag said
    # 50 with no source. research/sota.md has the full build spec.
    "school of the arts":     {"h": 56},
    "lucky plaza":            {"h": 85},
    "far east plaza":         {"h": 70},
    "paragon":                {"h": 78, "podium": 24},   # VERIFIED 6 retail + 20-storey tower
    "orchard towers":         {"h": 60},
    "palais renaissance":     {"h": 55},
    "hilton singapore orchard": {"h": 152},   # VERIFIED taller of two towers
    "grand hyatt":            {"h": 60},
    # Research 2026-07-29 (research/forum.md): published 17 storeys (1986,
    # RSP); no metre height anywhere. 40 was our guess and reads short —
    # 17 x 3.3 = 56, labelled derived.
    "forum":                  {"h": 56},
    "orchard central":        {"h": 56},   # VERIFIED 12 storeys

    # Researched 2026-07-28, for the buildings that FRONT A MAIN STREET and
    # still carried a type default. Only 23 of the 965 guessed heights are
    # visible from a street at all and only 7 of those are named, which is what
    # makes them researchable — a nameless footprint has nothing to look up.
    #
    #   268 Orchard          archify.com/sg + structurae.net
    #     12 storeys over 1 basement, building height 69.60m, ~2,800 m2 site
    #   South Beach Residences   en.wikipedia.org/wiki/South_Beach_(Singapore)
    #     two towers, 45 and 42 storeys; the residences occupy the 45-storey
    #     tower from level 23 up. Metres are not published, so this is the
    #     storey count at the 3.4m the OSM `building:levels` path already uses.
    #     NOTE the sibling trap already recorded for this complex: the footprint
    #     named "South Beach" is the AVENUE and is 10m tall. This is the TOWER
    #     footprint, 2,805 m2, and they are different buildings.
    #   Carlton Hotel        26 floors (hotel listings agree; one source says 32
    #     and is the outlier). Hotel storeys run about 3.2m.
    #   NoMad Singapore      uol.com.sg media release 2025-05-05 + edgeprop.sg
    #     19-storey mixed-use by WOHA on the former Faber House site, which was
    #     8 storeys. Opens 2027, so this is a building going up right now.
    "268 orchard":            {"h": 70},   # VERIFIED 69.6m published
    "south beach residences": {"h": 153},  # 45 storeys
    "carlton hotel":          {"h": 83},   # 26 floors
    "nomad singapore":        {"h": 63},   # 19 storeys, under construction
    "cathay cineleisure":     {"h": 38},
    "scape":                  {"h": 24},
    "mandarin gallery":       {"h": 40},
    "delfi orchard":          {"h": 45},
    "royal thai embassy":     {"h": 12},
    "istana":                 {"h": 16},
    "313somerset":            {"h": 28},   # VERIFIED 5 floors above ground
    "313 somerset":           {"h": 28},   # VERIFIED, same mall
    "wheelock place":         {"h": 109, "key": True},   # VERIFIED 21 storeys
    "tripleone somerset":     {"h": 110, "key": True},
    "cairnhill nine":         {"h": 130, "key": True},
    "orchard gateway":        {"h": 45},
    "midpoint orchard":       {"h": 45},
    # Research 2026-07-29 (research/concorde.md): NOT a tower — 9 storeys
    # total (3-storey podium, hotel L4-9, Mingtiandi sale particulars), and
    # the OSM way carries no height tag at all, so the old 70 was our own
    # invention. Metres UNPUBLISHED: 9 hotel storeys at ~3.3m.
    "concorde hotel":         {"h": 30},
    "york hotel":             {"h": 60},
    "goodwood park":          {"h": 18},
    # "Orchard Parade" is NOT a building any more — the hotel is Orchard
    # Rendezvous (research/orchard-rendezvous.md); this key only ever matched
    # stale POI names. Kept solely so an old scene file cannot resurrect a
    # 3.4m default; same figure as the hotel.
    "orchard parade":         {"h": 55},
    "liat towers":            {"h": 40},
    "the heeren":             {"h": 60},
    "somerset":               {"h": 40},
    # heights OSM had plainly wrong, or missing entirely
    "four seasons":           {"h": 68},
    "liat tower":             {"h": 45},
    # Research 2026-07-29 (research/far-east-shopping-centre.md): the old 75
    # was the building's published ORCHARD FRONTAGE LENGTH mis-read as height.
    # Real massing 5-storey podium + 10-storey office block (roots.gov.sg +
    # 2023 sale tender); metres UNPUBLISHED, so 15 storeys at the 3.4m
    # `building:levels` rate. Must read LOWER than Wheelock next door.
    "far east shopping":      {"h": 51},
    "international building": {"h": 58},
    "grand hyatt":            {"h": 70},
    "york hotel":             {"h": 68},
    "royal plaza on scotts":  {"h": 70},
    "voco orchard":           {"h": 80},
    # Research 2026-07-29 (research/pullman.md): Emporis lists the building
    # (as Crown Prince Hotel, same address) at 47.63m estimated, 14 floors.
    # The old 92 was roughly double reality. Key is the FULL name: the loose
    # "pullman singapore" also caught Pullman Hill Street in Bras Basah.
    "pullman singapore orchard": {"h": 48},
    "scotts square":          {"h": 150, "key": True},
    "design orchard":         {"h": 14},
    "pacific plaza":          {"h": 46},
    "orchard building":       {"h": 45},
    "forum the shopping":     {"h": 56},   # same building, same derivation
    "pan pacific":            {"h": 58},
    "scotts 27":              {"h": 60},
    "shaw tower":             {"h": 60},

    # ---- CBD / Chinatown, researched 2026-07-29 (research/cbd-heights.md,
    # CTBUH architectural heights; naming traps documented there) -----------
    "uob plaza one":          {"h": 280, "key": True},
    "uob plaza 2":            {"h": 162},
    # THE MAP SPELLS THEM "TOWER 1" AND "TOWER 2", and the lookup is substring
    # with longest-key-wins, so "UOB Plaza Tower 2" does not contain
    # "uob plaza 2" and fell through to the bare "uob plaza" — inheriting the
    # 280m cap. The crown vantage caught it on 2026-07-30: UOB Plaza reads as
    # THREE equal 280m cylinders from across the water because all three
    # footprints ("UOB Plaza", "Tower 1", "Tower 2") matched the same key.
    # Same height as the researched "uob plaza 2" line above, deliberately —
    # two spellings of one building must not carry two numbers.
    "uob plaza tower 1":      {"h": 280, "key": True},
    "uob plaza tower 2":      {"h": 162},
    "uob plaza":              {"h": 280, "key": True},
    "republic plaza":         {"h": 276, "key": True},
    "capitaspring":           {"h": 276, "key": True},
    "capitagreen":            {"h": 242, "key": True},
    "one raffles place":      {"h": 278, "key": True},   # T1; T2 209.6 shares the name
    "overseas union bank":    {"h": 278, "key": True},
    "guoco tower":            {"h": 284, "key": True},
    "tanjong pagar centre":   {"h": 284, "key": True},
    "one raffles quay":       {"h": 245},   # NORTH; south tower is 139.9 and needs a part split
    "ocean financial":        {"h": 245, "key": True},
    "the sail":               {"h": 245, "key": True},
    "central park tower":     {"h": 215},
    "ioi central boulevard":  {"h": 245},   # WEST; east is ~16 floors unpublished
    "frasers tower":          {"h": 231},
    "asia square tower 1":    {"h": 229, "key": True},
    "asia square tower 2":    {"h": 222, "key": True},
    "asia square":            {"h": 229, "key": True},
    "marina bay suites":      {"h": 227},
    "one shenton":            {"h": 214},
    "ocbc centre":            {"h": 198, "key": True},   # OSM said 16
    "ocbc bank":              {"h": 198, "key": True},   # the footprint carries the bank name
    "singapore land tower":   {"h": 190},   # CTBUH; Wikipedia's 213 unverified
    "sgx centre":             {"h": 187},
    "18 robinson":            {"h": 180},
    "hitachi tower":          {"h": 179},
    "16 collyer quay":        {"h": 179},
    "state courts":           {"h": 178},   # the 2019 tower
    "pickering operations":   {"h": 177},
    "maybank tower":          {"h": 175},
    "sia building":           {"h": 176},
    "robinson 77":            {"h": 176},
    "six battery road":       {"h": 174},
    "samsung hub":            {"h": 172},
    "bank of china":          {"h": 168},
    "hong leong finance":     {"h": 158},
    "myp centre":             {"h": 157},   # weakly published (ex-Emporis)
    "one george street":      {"h": 153},
    "chevron house":          {"h": 152},
    "marina one":             {"h": 200},   # architect figure; CTBUH says 225.5 — conflict recorded
    "lau pa sat":             {"h": 14},    # 1-storey market + clock lantern; UNPUBLISHED, height class only

    # LASALLE College of the Arts, McNally campus. Researched 2026-07-31,
    # research/lasalle-simlim.md. OSM carries building:levels=5 and the
    # published storey count is SEVEN, so the 17m we had was 9-12m short.
    # UNPUBLISHED: no metre figure exists for this building anywhere. 26m is the
    # research's estimate for the TALLEST block, reached by two independent
    # methods, class 25-30m. Here rather than in the recipe so the mass, the
    # audit and the ledger all read one number.
    "lasalle":                {"h": 26},

    # The Warehouse Hotel, 320/326/332 Havelock Road. Researched 2026-07-30,
    # research/robertson-rivervalley.md. THREE two-storey gabled godowns
    # standing shoulder to shoulder -- and it was carrying a TYPE_DEFAULT guess
    # of 20m, better than double what a two-storey godown stands at, so the most
    # recognisable godown group on this reach of the river was a tower block.
    # UNPUBLISHED: no metre height is published for ANY conserved godown here;
    # URA gives storeys and plan dimensions only. Height CLASS for two storeys
    # plus a pitched roof, same footing as lau pa sat.
    #
    # It is also NOT on Robertson Quay, whatever Wikipedia says: Havelock Road,
    # south bank, and it is not in URA's Robertson Quay gazette at all.
    "the warehouse":          {"h": 9.5},

    # ---- Little India, researched 2026-07-30 (research/littleindia-temples.md,
    # research/sri-veeramakaliamman.md). NEITHER of these has a published height
    # in metres from ANY authoritative source -- both agents said so explicitly,
    # and the "18 m gopuram" figure that circulates for the temple traces to one
    # unsourced site. So these are HEIGHT CLASSES, same footing as lau pa sat
    # above, not measurements dressed up as measurements.
    #
    # Both carried h=20 over their WHOLE footprint, which is what makes them
    # wrong on screen rather than merely imprecise: a 20m solid block where the
    # real thing is a low mass with ONE tall element on it. That is the same
    # error family as the UOB spelling trap -- one number standing in for a
    # shape that has two.
    "masjid abdul gafoor":    {"h": 12},    # TWO storeys (OSM tags levels=1 elsewhere); dome + minaret sit above this mass, not in it
    # NOT Sri Veeramakaliamman. That override was removed 2026-07-31: the ~12m
    # estimate is for THE GOPURAM, and this name is carried by TWO footprints --
    # the street compound AND a tall plain rear block that OSM tags six storeys
    # and which the research says stands TALLER than the gopuram. Forcing both
    # to 12m flattened the rear block by eight metres to fix a tower that is not
    # even the same footprint. The gopuram's own height is set by proportion
    # inside the recipe, where it belongs; OSM's 20.4 is right for the rear
    # block and is left alone.
    # Maxwell Food Centre carried h=20 out of the extract — a 20m slab where
    # a single-storey 1986 hawker shed stands (sweep review 2026-07-30 saw
    # "a giant slab consuming half the frame"). Ridge height UNPUBLISHED;
    # height class only, like Lau Pa Sat.
    "maxwell food center":    {"h": 8},
    "fullerton hotel":        {"h": 37},    # Wikidata, low confidence
    # ---- Marina Bay, researched 2026-07-28 --------------------------------
    #
    #   THE 280m AVIATION CEILING is the single most important fact here. One
    #   Raffles Place Tower 1, UOB Plaza One and Republic Plaza are ALL exactly
    #   280m, because that is the maximum the aviation authority permits. Giving
    #   them three different heights would be visibly wrong to any Singaporean,
    #   and a hash or a storey-count estimate would have done exactly that.
    #     en.wikipedia.org/wiki/One_Raffles_Place, /Republic_Plaza_(Singapore),
    #     /UOB_Plaza
    #
    #   Marina Bay Financial Centre  mbfc.com.sg + skyscrapercenter.com (CTBUH)
    #     FIVE towers, not one complex. Office T1 33 storeys/186.1m, T2 50/245m,
    #     T3 46/239m, Marina Bay Residences 55/227m, Marina Bay Suites 66/227m.
    #     Wikipedia's infobox lists heights and floor counts as two unmapped
    #     sets and disagrees with CTBUH on T1 (192m/32st); CTBUH and the
    #     operator agree, so they win.
    #
    #   Singapore Flyer      singaporeflyer.com/en/fun-facts
    #     165m overall, 150m wheel over a THREE-STOREY terminal, 28 capsules.
    #     The 15m difference is the clearance under the wheel.
    #
    #   The Fullerton Hotel  en.wikipedia.org/wiki/The_Fullerton_Hotel_Singapore
    #     36.6m (120ft), 8 storeys above ground, neoclassical, grey Aberdeen
    #     granite, a two-storey fluted Doric colonnade across five frontages.
    #
    #   Merlion              eresources.nlb.gov.sg + roots.gov.sg
    #     8.6m, concrete on a steel frame, skinned in porcelain plates, and it
    #     FACES EAST -- a deliberate geomancy decision kept through the 2002
    #     move, not an accident of siting.
    #
    #   Supertrees           gardensbythebay.com.sg
    #     18 of them, 12 in Supertree Grove, at 25/30/37/42/50m. Exactly ONE is
    #     50m and carries the observatory. Canopy diameter is genuinely not
    #     published anywhere.
    #
    #   NOT BUILT, DELIBERATELY: The Float @ Marina Bay was DEMOLISHED in March
    #   2023. NS Square replaces it, broke ground March 2024 and completes 2027,
    #   so in 2026 the site is a construction site and not a floating platform.
    #   If OSM still carries the Float, it is stale and must not be built.
    "one raffles place":      {"h": 280, "key": True},   # VERIFIED 280m ceiling
    "oub centre":             {"h": 280, "key": True},   # same building, old name
    "republic plaza":         {"h": 280, "key": True},   # VERIFIED
    "uob plaza":              {"h": 280, "key": True},   # VERIFIED
    "marina bay financial centre": {"h": 245, "key": True},
    "marina bay residences":  {"h": 227, "key": True},
    "marina bay suites":      {"h": 227, "key": True},
    # NOT "asia square": that name is the site OUTLINE, and giving the outline
    # the tower height made it swallow both of its own towers as buried
    # footprints. The towers carry their own names and their own heights.
    "asia square tower 1":    {"h": 250, "key": True},
    "asia square tower 2":    {"h": 220, "key": True},
    "the sail @ marina bay":  {"h": 245, "key": True},
    # These two patterns matched things that are NOT the landmark, which is the
    # mistake already recorded here for "Grand Park City Hall" and "Esplanade
    # Theatre": "Singapore Flyer Car Park" was given the wheel's 165m and
    # "Apple Marina Bay Sands" -- a glass dome sitting ON the water -- was given
    # a hotel tower's 194m. LANDMARKS is matched by substring, so anything whose
    # name CONTAINS a landmark name inherits its height.
    "singapore flyer car park": {"h": 18},   # matched before the wheel, on purpose
    "apple marina bay sands":   {"h": 9},    # the dome on the water, not a tower
    "marina bay sands theatres": {"h": 30},
    "singapore flyer":        {"h": 165, "key": True},   # VERIFIED total height
    "fullerton hotel":        {"h": 37},                 # VERIFIED 36.6m
    "the fullerton":          {"h": 37},
    "fullerton waterboat":    {"h": 20},
    "customs house":          {"h": 14},
    "clifford pier":          {"h": 16},
    "the exchange":           {"h": 20},
    "millenia tower":         {"h": 190, "key": True},
    "centennial tower":       {"h": 180, "key": True},
    "the ritz-carlton":       {"h": 130, "key": True},
    "pan pacific singapore":  {"h": 130},
    "marina square":          {"h": 40},
    "suntec":                 {"h": 150, "key": True},
    "one marina boulevard":   {"h": 170, "key": True},
    "ocbc centre":            {"h": 198, "key": True},
    "maybank tower":          {"h": 190, "key": True},

    #   Marina Bay Sands   Safdie's own CTBUH Journal 2011-I case study, Arup in
    #                      STRUCTURE Jun 2011, CTBUH per-tower entries
    #     THREE things here are widely got wrong and all three change the shape:
    #     (a) 207m is the top of the SKYPARK, not the towers. The concrete tower
    #         roofs are ~194m and MBS's own site says ~191m. Building 207m towers
    #         puts the deck in the sky above where it belongs.
    #     (b) The towers do NOT lean as towers. Each is a PAIR OF LEGS: the west
    #         leg is vertical, the east leg is curved and inclined and leans
    #         against it. They spread at the base into the atrium and CONVERGE
    #         as they rise -- the opposite of leaning outward.
    #     (c) The three are not identical: the cross-section decreases from one
    #         to the next, and CTBUH has T1 and T3 at 206.9m to tip with T2 at
    #         202.8m.
    #     SkyPark: 340m long, 40m max width, deck at 200m, cantilevering 66.5m
    #     past the NORTHERN tower (Safdie and CTBUH both publish 66.5m; Arup's
    #     own body text says 64.9m and its figure caption says 218ft, so the
    #     engineer contradicts himself and the architect wins).
    #     West facade is reflective glass; EAST facade is planted terraces.
    #   ArtScience Museum  safdiearchitects.com
    #     TEN petals of varying height on a circular base, up to 60m. White
    #     joint-less fibre-reinforced polymer, with bead-blasted stainless steel
    #     on the vertical sides of each petal -- two materials, not one. Dish
    #     roof draining through a central oculus. Diameter is NOT published
    #     anywhere; it comes from the OSM footprint.
    #     It is not literally a lotus and it does not have 10 galleries; it has
    #     21 over 3 levels.
    "marina bay sands":       {"h": 194, "key": True},   # VERIFIED tower roof
    "artscience museum":      {"h": 60,  "key": True},   # VERIFIED "as high as 60m"
    "the shoppes at marina bay sands": {"h": 15},   # 2 storeys, published
    "the shoppes":            {"h": 26},
    "sands expo":             {"h": 32},
    "gardens by the bay":     {"h": 20},
    "flower dome":            {"h": 38, "key": True},
    "cloud forest":           {"h": 58, "key": True},
}

# HDB STOREY COUNTS, KEYED BY POSTCODE.
#
# These blocks carry NO NAME, so the name-keyed OVERRIDES table above cannot
# reach them, and OSM tags every one of them height=0 -- which the junk-tag
# guard below correctly rejects, dropping them into TYPE_DEFAULT["residential"]
# = 40. The result: blocks of 23, 25 and 21 storeys all drawn at an identical
# 40m, so the Tekka group had no skyline modulation at all and was roughly 26m
# short. Researched 2026-07-31, research/littleindia-hdb-towers.md.
#
# Storey counts are HDB's own and are AUTHORITATIVE. The metre figures are NOT:
# no height in metres is published for any HDB block anywhere I could reach
# (HDB publishes max_floor_lvl and no height field of any kind). So these are
# storeys x an assumed floor-to-floor, stated here once rather than hidden:
# 2.9m for HDB residential slabs. Tagged as a guess by the caller, deliberately,
# so the accuracy ledger does not count them as surveyed.
#
# Postcode, not house number: house numbers repeat across the island and this
# table has to stay safe when the world grows past Little India.
#
# THE REAL FIX, when there is time, is to join HDB's max_floor_lvl onto OSM ways
# by addr:housenumber + addr:postcode -- both are already tagged on most HDB
# blocks island-wide, which would fix every HDB estate at once instead of five
# records at a time.
HDB_STOREYS = {
    "210661": 23,    # Buffalo Road, corridor-access slab
    "210662": 25,    # the tallest of the group
    "210663": 21,
    "210664": 4,     # OSM says building:levels=3; HDB says 4, and HDB is the authority
}
HDB_FLOOR_M = 2.9

TYPE_DEFAULT = {
    "retail": 22, "commercial": 30, "hotel": 55, "apartments": 45,
    "residential": 40, "office": 45, "civic": 18, "house": 9,
    "roof": 5, "yes": 20, "school": 14, "church": 16, "parking": 12,
}
ROAD_WIDTH = {
    "trunk": 17.5, "primary": 15.0, "secondary": 12.0, "tertiary": 10.0,
    "residential": 8.0, "unclassified": 8.0, "service": 6.0,
    "living_street": 7.0, "pedestrian": 7.0, "footway": 3.4,
}


def proj(lat, lon):
    return ((lon - LON0) * M_PER_DEG_LON, (LAT0 - lat) * M_PER_DEG_LAT)


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", (s or "").lower()).strip()


# Every height tag we refused, so the count is printed rather than swallowed.
BAD_HEIGHT_TAGS = []


def height_for(tags):
    """Returns (height, is_landmark, source, podium). Source is 'osm' when the
    figure comes from a tag, 'named' when hand-entered, 'guess' when a type
    default. Podium is the researched podium height in metres, or None.

    The podium figure was in LANDMARKS from the day the table was written and
    was never returned, so Ngee Ann City's researched 7-floor / 30m podium and
    Paragon's 6-floor / 24m one were both invented again inside the recipe. That
    is the same shape as the four OSM tags this project found sitting unused
    (crossings, sidewalk=, oneway=, level=) -- the only difference is that this
    time the data we were ignoring was our own research."""
    name = norm(tags.get("name"))
    # LONGEST MATCH WINS, not first match.
    #
    # LANDMARKS is matched by substring, so anything whose name CONTAINS a
    # landmark's name inherited its height. That has now bitten four times:
    # "Grand Park City Hall" as City Hall, "Esplanade Theatre" as the Esplanade,
    # "Singapore Flyer Car Park" given the wheel's 165m, and "The Shoppes at
    # Marina Bay Sands" -- a two-storey retail podium -- given a hotel tower's
    # 194m. Every time the repair was to reorder the dict, and every time the
    # next entry broke it again.
    #
    # Ordering is not a rule, it is a coincidence that holds until someone adds
    # a line. Preferring the longest matching key IS a rule: "the shoppes at
    # marina bay sands" beats "marina bay sands" because it says more about the
    # building, and no future insertion can change that.
    best_key, best_spec = "", None
    for key, spec in LANDMARKS.items():
        if key and key in name and len(key) > len(best_key):
            best_key, best_spec = key, spec
    if best_spec is not None:
        return (best_spec["h"], best_spec.get("key", False), "named",
                best_spec.get("podium"))
    h = tags.get("height")
    if h:
        try:
            v = float(str(h).replace("m", "").strip())
        except ValueError:
            v = None
        # A height tag under about two and a half metres is not a height, it is
        # a bad tag. Across Orchard and Bras Basah 28 buildings carry one:
        # Four Seasons Hotel, Carlton Hotel, Peninsula Plaza and St Andrew's
        # Cathedral are all tagged height=0, and The Cenotaph is tagged
        # height=1 by someone who meant one storey.
        #
        # There was already a guard for this, but it was scoped by FOOTPRINT
        # ("a 3,000 m2 building is never 3.5m tall"), so it only rescued the big
        # ones and left a 498 m2 public hall standing one metre tall. The test
        # is plausibility, not area: nothing with a building tag is a metre high.
        #
        # It also matters for honesty, not just for geometry. Returning "osm"
        # here counted all 28 as heights that came from surveyed data, so the
        # accuracy ledger was reporting garbage as real. Fall through instead,
        # and let it be recorded as the guess it is.
        if v is not None and v >= 2.5:
            return v, False, "osm", None
        if v is not None:
            BAD_HEIGHT_TAGS.append((tags.get("name") or "(unnamed)", v))
    pc = str(tags.get("addr:postcode") or "").strip()
    if pc in HDB_STOREYS:
        # a guess, and recorded as one -- the storeys are authoritative, the
        # metres are storeys x an assumption
        return HDB_STOREYS[pc] * HDB_FLOOR_M, False, "guess", None
    lv = tags.get("building:levels")
    if lv:
        try:
            # 3.4m per storey is closer for SG commercial than 3.6
            return max(3.5, float(lv) * 3.4), False, "osm", None
        except ValueError:
            pass
    return TYPE_DEFAULT.get(tags.get("building", "yes"), 18), False, "guess", None


def ring(geometry):
    pts = [proj(p["lat"], p["lon"]) for p in geometry]
    if len(pts) > 2 and abs(pts[0][0] - pts[-1][0]) < 1e-6 and abs(pts[0][1] - pts[-1][1]) < 1e-6:
        pts = pts[:-1]
    return pts


def stitch_outer(rel):
    """Join a multipolygon relation's OUTER members into closed rings.

    OSM splits a large outline across many ways: Marina Reservoir arrives as 40
    outer members, every one an OPEN line a few points long. Treating each as
    its own ring gives slivers of no area, which an area filter then drops -- so
    the bay silently did not exist, and neither did the ArtScience Museum, The
    Shoppes, Victoria Theatre, Parliament House or Clifford Pier, all of which
    are relations rather than ways.

    The same operation process.py already does to turn OSM's 28 Orchard Road
    fragments into one centreline. Endpoints match on a rounded key because they
    are shared nodes and agree to full precision.
    """
    # TWO DIFFERENT RELATION SCHEMAS use the word "building".
    #
    #   type=multipolygon  outer members that must be stitched into a ring
    #                      (Marina Reservoir: 40 open segments)
    #   type=building      a single `outline` member plus `part` members, from
    #                      the Simple 3D Buildings scheme. The ArtScience Museum
    #                      is one of these, and a reader that only knows about
    #                      `outer` returns nothing and drops it silently.
    #
    # An `outline` member is already a closed way, so it is taken whole and the
    # `part` members are ignored: they are the internal massing, and we have our
    # own recipe for the shape.
    outline = [m["geometry"] for m in rel.get("members", [])
               if m.get("role") == "outline" and len(m.get("geometry") or []) > 2]
    if outline:
        return [max(outline, key=len)]
    segs = [m["geometry"] for m in rel.get("members", [])
            if m.get("role") in ("outer", "") and len(m.get("geometry") or []) > 1]
    key = lambda q: (round(q["lat"], 7), round(q["lon"], 7))
    rings = []
    while segs:
        cur = list(segs.pop(0))
        joined = True
        while joined and key(cur[0]) != key(cur[-1]):
            joined = False
            for i, sg in enumerate(segs):
                if key(sg[0]) == key(cur[-1]):
                    cur.extend(sg[1:]); segs.pop(i); joined = True; break
                if key(sg[-1]) == key(cur[-1]):
                    cur.extend(list(reversed(sg))[1:]); segs.pop(i); joined = True; break
                if key(sg[-1]) == key(cur[0]):
                    cur = sg[:-1] + cur; segs.pop(i); joined = True; break
                if key(sg[0]) == key(cur[0]):
                    cur = list(reversed(sg))[:-1] + cur; segs.pop(i); joined = True; break
        if len(cur) > 3:
            rings.append(cur)
    return rings


def area(pts):
    a = 0.0
    for i in range(len(pts)):
        x1, z1 = pts[i]
        x2, z2 = pts[(i + 1) % len(pts)]
        a += x1 * z2 - x2 * z1
    return abs(a) / 2.0


# If Overpass will not serve the road layer, fall back to a hand-traced Orchard
# Road centreline so the build is never blocked. Approximate, and only used when
# the real ways are missing.
FALLBACK_ORCHARD = [
    (1.30666, 103.82676), (1.30594, 103.82834), (1.30510, 103.82985),
    (1.30437, 103.83124), (1.30380, 103.83259), (1.30322, 103.83401),
    (1.30252, 103.83548), (1.30170, 103.83692), (1.30080, 103.83830),
]


def _neg_layer(tags):
    try:
        return float(tags.get("layer", 0)) < 0
    except (TypeError, ValueError):
        return False


# Which floor a tenant is on. 1,043 of the 1,718 named shops in the two
# districts carry `level`, and the scene file was throwing it away, so a tenant
# in the second basement of Ngee Ann City was handed a board on the street
# facade six metres up. 646 of them are not on the street at all: 265 below it
# and 381 above.
#
# `level` is OSM's own numbering, ground = 0. `addr:unit` is Singapore's, and it
# is the SAME information written the local way: "#01-15" is the ground floor,
# "#B2-32" is the second basement. Both are read, level first.
#
# Returns None when neither says, which is the honest answer for 650 of them and
# is NOT the same as ground floor: the builder decides what to do with unknown.
FLOOR_RE = re.compile(r"^\s*(-?\d+)")
UNIT_RE = re.compile(r"#?\s*(B?)(\d{1,2})\s*-")


def floor_of(tags):
    lv = tags.get("level")
    if lv:
        m = FLOOR_RE.match(str(lv))
        if m:
            return int(m.group(1))
    for key in ("addr:unit", "addr:floor"):
        u = str(tags.get(key) or "")
        m = UNIT_RE.search(u)
        if m:
            n = int(m.group(2))
            return -n if m.group(1) == "B" else n - 1
        m = FLOOR_RE.match(u)
        if m and u.strip() == m.group(1):
            return int(m.group(1))
    return None


def shop_rec(tags, x, z):
    """A tenant, with the tags a shopfront needs to look like itself.
    Optional fields are omitted when absent rather than written empty, because
    every one of these lands 1,600 times in a file the phone downloads."""
    r = {"p": [round(x, 1), round(z, 1)], "n": tags["name"],
         "k": tags.get("shop") or tags.get("amenity")}
    fl = floor_of(tags)
    if fl is not None:
        r["lv"] = fl
    cu = tags.get("cuisine")
    if cu:
        r["cu"] = cu.split(";")[0].strip()[:24]
    zh = tags.get("name:zh") or tags.get("name:zh-Hans")
    if zh:
        r["zh"] = zh[:24]
    return r


def carry_terrain(out_path, scene):
    """Keep the heightfield across a reprocess.

    terrain.py samples elevation from a free API along the road centrelines and
    writes the grid into the scene file. Reprocessing rebuilds that file from
    the raw OSM dump, which silently dropped the grid and flattened the whole
    district. The centrelines have not changed, so the old grid is still valid:
    carry it over rather than re-fetching 2,372 samples.
    """
    import os as _os
    if not _os.path.exists(out_path):
        return False
    try:
        with open(out_path) as fh:
            old = json.load(fh)
    except Exception:
        return False
    # But ONLY if it is in the same coordinate frame. The grid stores x0/z0 in
    # scene metres, so if the origin has moved the old grid describes ground
    # that is now somewhere else entirely — and it would be carried over in
    # silence, leaving the whole district's terrain offset by kilometres with
    # every check still green. Two numbers that must be compared, so compare
    # them.
    o_old = old.get("origin") or {}
    o_new = scene.get("origin") or {}
    if abs(o_old.get("lat", 1e9) - o_new.get("lat", 0)) > 1e-9 \
            or abs(o_old.get("lon", 1e9) - o_new.get("lon", 0)) > 1e-9:
        print(f"  origin moved {o_old.get('lat')},{o_old.get('lon')} -> "
              f"{o_new.get('lat')},{o_new.get('lon')}: heightfield NOT carried over")
        return False
    if old.get("terrain"):
        scene["terrain"] = old["terrain"]
        return True
    return False


def main():
    raw = json.load(open(RAW_PATH))
    els = raw["elements"]
    buildings, roads, trees = [], [], []
    skipped_underground = 0
    # Real map positions, so street furniture stops being placed at intervals we
    # invented. This is what makes it the actual street rather than a plausible one.
    crossings, signals, busstops, mrt, taxis = [], [], [], [], []
    bridges, covered, shops = [], [], []

    for e in els:
        tags = e.get("tags", {})
        if e["type"] == "node":
            hw = tags.get("highway")
            rw = tags.get("railway")
            if tags.get("natural") == "tree":
                x, z = proj(e["lat"], e["lon"])
                trees.append([round(x, 1), round(z, 1)])
            elif hw == "crossing":
                x, z = proj(e["lat"], e["lon"])
                # TACTILE PAVING: the yellow studded pad at the kerb. 34% of
                # crossing nodes in this district say whether it is there, and
                # in Singapore it is on essentially every modern crossing, so
                # its absence read as wrong to anyone who has stood on one. A
                # third element means "the map says yes".
                tp = 1 if tags.get("tactile_paving") == "yes" else 0
                # A PEDESTRIAN REFUGE is real geometry: a raised island in the
                # middle of the carriageway that you stand on halfway across.
                # 74 crossings across the three districts are tagged with one
                # and none was built, so every wide crossing read as an
                # unbroken run of tarmac.
                isl = 1 if tags.get("crossing:island") == "yes" else 0
                # WHAT THE CROSSING IS PAINTED LIKE, which is not one thing.
                #
                # Every crossing in this world was drawn as a ZEBRA. In
                # Singapore that is wrong for most of them: LTA SDRE Ch.9
                # (TMM4) marks a SIGNALISED crossing -- the red-man/green-man
                # kind -- with two dotted white boundary lines and NO bars at
                # all, and only an unsignalised crossing gets the bars. The
                # extract says which: 416 nodes carry crossing=traffic_signals
                # against 33 zebras, and 211 more say they are unmarked or
                # carry crossing:markings=no. So the great majority of the
                # street was painted with a marking that does not exist there.
                #
                # FIFTH instance of real data present and unused, after the
                # crossings themselves, sidewalk=, oneway= and level=.
                #
                #   0 unmarked   1 signalised (dotted boundary lines)   2 zebra
                cr = (tags.get("crossing") or "").lower()
                mk = (tags.get("crossing:markings") or "").lower()
                if cr == "traffic_signals" or tags.get("crossing:signals") == "yes":
                    kind = 1
                elif cr == "zebra" or mk.startswith("zebra"):
                    kind = 2
                elif cr == "unmarked" or mk == "no":
                    kind = 0
                elif mk == "dots":
                    kind = 1
                elif cr in ("marked", "uncontrolled") or mk == "yes":
                    # marked but the map does not say how. Singapore's default
                    # on a road with signals is the dotted pair; without, bars.
                    kind = 1
                else:
                    kind = 1
                crossings.append([round(x, 1), round(z, 1), tp, isl, kind])
            elif hw == "traffic_signals":
                x, z = proj(e["lat"], e["lon"])
                signals.append([round(x, 1), round(z, 1)])
            elif hw == "bus_stop" or tags.get("public_transport") == "platform":
                x, z = proj(e["lat"], e["lon"])
                # OSM SAYS WHICH STOPS HAVE A SHELTER, A BENCH AND A BIN, and
                # which routes call there. We were deciding the shelter by
                # frontage width and inventing the rest, while 114 stops carry
                # `shelter`, 105 carry `bench`, 87 carry `bin` and 111 carry
                # `route_ref` -- the actual bus numbers on the flag.
                _bs = {}
                if tags.get("shelter") in ("yes", "no"):
                    _bs["sh"] = 1 if tags["shelter"] == "yes" else 0
                if tags.get("bench") in ("yes", "no"):
                    _bs["be"] = 1 if tags["bench"] == "yes" else 0
                if tags.get("bin") in ("yes", "no"):
                    _bs["bi"] = 1 if tags["bin"] == "yes" else 0
                if tags.get("route_ref"):
                    _bs["rr"] = tags["route_ref"][:40]
                busstops.append({"p": [round(x, 1), round(z, 1)],
                                 "n": tags.get("name", ""), **_bs})
            elif rw in ("subway_entrance", "station"):
                x, z = proj(e["lat"], e["lon"])
                mrt.append({"p": [round(x, 1), round(z, 1)],
                            "n": tags.get("name", ""), "kind": rw})
            elif tags.get("amenity") == "taxi":
                x, z = proj(e["lat"], e["lon"])
                taxis.append([round(x, 1), round(z, 1)])
            elif tags.get("shop") or tags.get("amenity") in (
                    "restaurant", "cafe", "bank", "fast_food", "pharmacy", "cinema"):
                if tags.get("name"):
                    x, z = proj(e["lat"], e["lon"])
                    shops.append(shop_rec(tags, x, z))
            continue
        if e["type"] == "way" and tags.get("amenity") == "taxi" and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            taxis.append([round(cx, 1), round(cz, 1)])
            continue
        if e["type"] == "way" and tags.get("railway") == "subway_entrance" and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            mrt.append({"p": [round(cx, 1), round(cz, 1)],
                        "n": tags.get("name", ""), "kind": "subway_entrance"})
            continue
        if e["type"] == "way" and (tags.get("shop") or tags.get("amenity") in (
                "restaurant", "cafe", "bank", "fast_food", "pharmacy", "cinema")) \
                and tags.get("name") and "geometry" in e:
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            cx = sum(p[0] for p in pts) / len(pts)
            cz = sum(p[1] for p in pts) / len(pts)
            shops.append(shop_rec(tags, cx, cz))
            if "building" not in tags:
                continue                      # otherwise fall through: it is a building too
        if e["type"] == "way" and tags.get("highway") == "footway" and "geometry" in e:
            line = [[round(x, 1), round(z, 1)] for x, z in
                    (proj(p["lat"], p["lon"]) for p in e["geometry"])]
            if tags.get("bridge"):
                bridges.append(line)
                continue
            if tags.get("covered"):
                covered.append(line)
                continue
        if e["type"] == "way" and tags.get("natural") == "tree_row" and "geometry" in e:
            # a tree row is a line: plant along it every 8m
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            for i in range(len(pts) - 1):
                a0, a1 = pts[i], pts[i + 1]
                L = math.dist(a0, a1)
                steps = max(1, int(L // 8))
                for k in range(steps):
                    t = k / steps
                    trees.append([round(a0[0] + (a1[0] - a0[0]) * t, 1),
                                  round(a0[1] + (a1[1] - a0[1]) * t, 1)])
            continue
        # A BUILDING CAN BE A RELATION. 11 of Marina Bay's are, including the
        # ArtScience Museum, The Shoppes at Marina Bay Sands, Victoria Theatre,
        # Parliament House, Clifford Pier and The Fullerton Bay Hotel -- so a
        # way-only reader silently loses the most recognisable things in the
        # district and reports a clean run. Its outer members are stitched into
        # a ring exactly as the water polygons are, and the LARGEST ring is the
        # building: the others are courtyards and light wells.
        if e["type"] == "relation" and "building" in tags:
            _rings = stitch_outer(e)
            if _rings:
                e = dict(e)
                e["geometry"] = max(_rings, key=len)
        if e["type"] not in ("way", "relation") or "geometry" not in e:
            continue

        # Underground structures are not buildings you can see. Dhoby Ghaut's
        # concourse and Bencoolen station are mapped as building footprints with
        # layer=-1, and extruding them put an 18m mass across the road with the
        # chase camera travelling inside it.
        if "building" in tags and (tags.get("location") == "underground"
                                   or _neg_layer(tags)):
            skipped_underground += 1
            continue
        if "building" in tags:
            pts = ring(e["geometry"])
            if len(pts) < 3:
                continue
            a = area(pts)
            if a < 45:                      # sheds, bin stores, map noise
                continue
            # spiky slivers triangulate badly and render as black shards
            per = sum(math.dist(pts[i], pts[(i + 1) % len(pts)]) for i in range(len(pts)))
            if per > 0 and (4 * math.pi * a) / (per * per) < 0.03:
                continue
            h, key, hsrc, podium = height_for(tags)
            # a 3,000 m2 footprint is never 3.5m tall: that is a bad tag, not a
            # single-storey building. Fall back to the type default.
            if h < 8 and a > 600:
                h = TYPE_DEFAULT.get(tags.get("building", "yes"), 24)
            # and a 150 m2 footprint with no tags is a shophouse or a small
            # block, not a 20m tower. Untagged small footprints were producing a
            # forest of thin slivers through the back lanes.
            untagged = hsrc == "guess"
            if untagged and not key and a < 230:
                h = round(3.6 * (2 + (int(abs(a)) % 3)), 1)      # 2-4 storeys
            elif untagged and not key and a < 520:
                h = round(3.6 * (3 + (int(abs(a)) % 3)), 1)      # 3-5 storeys
            b = {
                "p": [[round(x, 1), round(z, 1)] for x, z in pts],
                "h": round(h, 1),
                "a": round(a),
            }
            if tags.get("name"):
                b["n"] = tags["name"]
            if key:
                b["k"] = 1
            if hsrc != "guess":
                b["hs"] = hsrc          # height provenance, for the accuracy ledger
            if podium:
                b["pod"] = podium       # researched podium height, read by the recipe
            # A SURVEYED COLOUR BEATS A HASHED ONE, the same way a surveyed
            # material already does. 29 buildings in Bras Basah carry
            # `building:colour` and 29 carry `roof:colour`, and both were being
            # overridden by a hash of the footprint -- which is a deterministic
            # way of saying "at random".
            # A BUILDING THAT STARTS IN THE AIR. `min_height` says the mass
            # begins above the ground, and 16 footprints here carry it -- the
            # most important being SkyPark, min_height 193 and height 207. Read
            # as a plain height that is a solid 207m block standing where Marina
            # Bay Sands' atrium is; read properly it is a 14m deck in the sky.
            try:
                _mh = float(str(tags.get("min_height", "")).replace("m", "").strip())
                if 1.0 < _mh < h:
                    b["mh"] = round(_mh, 1)
            except ValueError:
                pass
            for _src, _dst in (("building:colour", "col"), ("roof:colour", "rcol")):
                _v = (tags.get(_src) or "").strip()
                if _v:
                    b[_dst] = _v
            # WHAT A BUILDING LOOKS LIKE, from the map rather than from a hash.
            #
            # The facade family was chosen by hashing the footprint, which is a
            # deterministic way of saying "at random". Meanwhile the extracts
            # carry `start_date` on 552 buildings — 27% — and nothing had ever
            # read it. Era predicts appearance better than anything else at
            # riding speed: a 1970s Singapore commercial block, an 80s hotel and
            # a 2015 glass tower are not mistakable for one another, and we were
            # assigning between them by coin flip.
            #
            # `building:colour` and `building:material` are rarer (about 2%) but
            # they are an ANSWER where they exist, and a hash was overriding it.
            yr = tags.get("start_date") or ""
            m = re.match(r"^(\d{4})", str(yr).strip())
            if m:
                y = int(m.group(1))
                if 1800 < y <= 2030:
                    b["yr"] = y
            for tk, key_out in (("building:material", "mat"),
                                ("building:colour", "col"),
                                ("roof:shape", "rs")):
                v = tags.get(tk)
                if v:
                    b[key_out] = str(v)[:16]
            # A roof structure is a canopy with no walls: large and low is what
            # it IS, not a bad height. Flagged so the "no squat big footprint"
            # check does not report a 2,122 m2 covered area from 1930 as a
            # defect for being five metres tall.
            if tags.get("building") == "roof":
                b["roof"] = 1
            buildings.append(b)

        elif "highway" in tags:
            kind = tags["highway"]
            # A TUNNEL IS NOT A STREET YOU CAN SEE. 302 ways in Marina Bay are
            # tagged tunnel -- the Marina Coastal Expressway and the network
            # under the reclaimed land -- and drawing them at ground level puts
            # tarmac across the promenade and through the bay. Dropped for the
            # same reason process.py already drops footprints tagged layer=-1:
            # underground is not part of the world you ride through. Portals
            # would be better than nothing but nothing is better than a
            # motorway laid over a park.
            if str(tags.get("tunnel", "no")) not in ("no", ""):
                continue
            try:
                if int(tags.get("layer", 0)) < 0:
                    continue
            except ValueError:
                pass
            pts = [proj(p["lat"], p["lon"]) for p in e["geometry"]]
            if len(pts) < 2:
                continue
            w = ROAD_WIDTH.get(kind, 6.0)
            wsrc = "class-default"
            if tags.get("width"):
                try:
                    w = float(str(tags["width"]).replace("m", "").strip())
                    wsrc = "osm-width"
                except ValueError:
                    pass
            lanes = tags.get("lanes")
            if wsrc != "osm-width" and lanes:
                try:
                    n = float(lanes)
                    # 3.4m per lane is the SG norm, plus a shoulder each side on
                    # anything bigger than a lane-and-a-half
                    w = n * 3.4 + (1.2 if n >= 2 else 0.4)
                    wsrc = "osm-lanes"
                except ValueError:
                    pass
            r = {
                "p": [[round(x, 1), round(z, 1)] for x, z in pts],
                "w": round(w, 1),
                "k": kind,
            }
            if lanes:
                try:
                    r["lanes"] = int(float(lanes))
                except ValueError:
                    pass
            # THE EXACT DIRECTIONAL SPLIT. 812 ways carry lanes:forward and
            # lanes:backward, and we were halving `lanes` instead -- which is
            # right only where the split is even. A 3-lane road with 2 forward
            # and 1 back had its centre line drawn down the middle of the
            # wrong lane.
            for _k, _d in (("lanes:forward", "lf"), ("lanes:backward", "lb")):
                try:
                    _v2 = int(float(tags.get(_k, "")))
                    if 0 < _v2 < 12:
                        r[_d] = _v2
                except ValueError:
                    pass
            if tags.get("oneway") == "yes":
                r["oneway"] = 1
            for tk in ("turn:lanes", "turn:lanes:forward"):
                if tags.get(tk):
                    r["turns"] = tags[tk]
                    break
            # SIDEWALK, both schemas. `sidewalk=left/right/both/no` is the old
            # one and was already read; `sidewalk:left=`/`sidewalk:right=` is
            # the current one and was not, so 356 ways in Bras Basah had their
            # footway information ignored while kerbs were assumed on both
            # sides. Found by data/unused.py, not by anybody noticing.
            if tags.get("sidewalk"):
                r["sidewalk"] = tags["sidewalk"]
            else:
                # `separate` is NOT `yes`. It means the footway is mapped as its
                # own way elsewhere, so this carriageway has no kerbside
                # pavement -- which is how the old `sidewalk=separate` value has
                # always been read here, and how C1 exempts Mount Sophia from
                # needing kerbs. Treating it as "there is a pavement on the
                # left" put Mount Sophia back in the check and failed the gate.
                _l, _r2 = tags.get("sidewalk:left"), tags.get("sidewalk:right")
                _b = tags.get("sidewalk:both")
                if _b == "yes":
                    r["sidewalk"] = "both"
                elif _l == "yes" and _r2 == "yes":
                    r["sidewalk"] = "both"
                elif _l == "yes":
                    r["sidewalk"] = "left"
                elif _r2 == "yes":
                    r["sidewalk"] = "right"
                elif "separate" in (_l, _r2, _b):
                    r["sidewalk"] = "separate"
                elif _l == "no" and _r2 == "no":
                    r["sidewalk"] = "no"
                elif _b == "no":
                    r["sidewalk"] = "no"
            # WHAT THE ROAD IS MADE OF. 61% of ways carry it and nothing read it
            # until data/unused.py went looking: 293 ways in this district are
            # paving stones, concrete, cobblestone or sett and every one was
            # drawn as asphalt. Eighth instance of real data present and unused.
            if tags.get("surface"):
                r["surface"] = tags["surface"]
            # WHAT KIND of footway. `footway=crossing` is the pedestrian crossing
            # drawn as a WAY across the carriageway, and there are 155 of them in
            # Orchard alone. Drawn as pavement -- which is what every footway got
            # -- each one lays a beige band straight over the tarmac, which is
            # what the user saw as "yellow patches on the roads" and as lane
            # lines cutting out. The zebra itself already comes from the crossing
            # NODES, so the way is pure duplication.
            if tags.get("footway"):
                r["fw"] = tags["footway"]
            # SINGAPORE'S BUS LANES ARE RED AND THEY ARE EVERYWHERE. 299 ways
            # across the three districts carry `lanes:bus` or `busway:*`, and a
            # red-tinted kerbside lane with BUS painted in it is one of the most
            # recognisable things about a Singapore street. Which SIDE matters:
            # busway:left/right is relative to the way direction.
            _bw = tags.get("busway:left") or tags.get("busway:right") or tags.get("busway")
            if _bw and _bw not in ("no", "none"):
                r["bus"] = "left" if tags.get("busway:left") not in (None, "no") else "right"
            elif tags.get("lanes:bus"):
                try:
                    if float(tags["lanes:bus"]) > 0:
                        r["bus"] = "right"      # kerbside; SG drives on the left
                except ValueError:
                    pass
            # the posted limit, so traffic can be driven at the real speed
            _ms = str(tags.get("maxspeed", "")).strip()
            if _ms.isdigit():
                r["kmh"] = int(_ms)
            # A BRIDGE DECK IS NOT THE GROUND. Carried so terrain.py can refuse
            # to sample elevation on it: the Benjamin Sheares Bridge crosses
            # Marina Bay about 30m up, and sampling its deck as ground put a 53m
            # ridge across a district whose real relief is a few metres. Same
            # for anything on a layer above zero.
            if str(tags.get("bridge", "no")) not in ("no", ""):
                r["bridge"] = 1
            try:
                if int(tags.get("layer", 0)) > 0:
                    r["bridge"] = 1
            except ValueError:
                pass
            r["ws"] = wsrc
            if tags.get("name"):
                r["n"] = tags["name"]
            roads.append(r)

    if not any(AXIS_NAME in r.get("n", "").lower() for r in roads):
        print(f"  ! no '{AXIS_NAME}' way in data — using traced fallback centreline")
        roads.append({
            "p": [[round(x, 1), round(z, 1)] for x, z in
                  (proj(la, lo) for la, lo in FALLBACK_ORCHARD)],
            "w": 15.0, "k": "primary", "n": "Orchard Road",
        })

    # The axis's own name and width, from the ways it was stitched from.
    #
    # Both used to be hardcoded to "Orchard Road" and 16.0m. With one district
    # that is invisible; the moment a second district was built, its main street
    # was labelled Orchard Road in the scene file, so its street name plates
    # would have read ORCHARD ROAD and axisSpec would have looked up Orchard's
    # lane count and one-way flag to decide how to draw and drive it.
    _axis_ways = [r for r in roads if AXIS_NAME in (r.get("n", "") or "").lower()]
    _names = {}
    for r in _axis_ways:
        _names[r["n"]] = _names.get(r["n"], 0) + 1
    axis_name = max(_names, key=_names.get) if _names else AXIS_NAME.title()
    _ws = sorted(r.get("w", 0) for r in _axis_ways if r.get("w"))
    axis_width = _ws[len(_ws) // 2] if _ws else 16.0

    # OSM splits Orchard Road into 28 short ways. Stitch them end-to-end into a
    # single centreline so the street can be dressed and ridden as one axis.
    def stitch(name_re, tol=32.0):
        segs = [r["p"][:] for r in roads if re.search(name_re, r.get("n", ""), re.I)]
        if not segs:
            return None
        segs.sort(key=lambda p: min(x * x + z * z for x, z in p))
        chain = segs.pop(0)
        changed = True
        while changed and segs:
            changed = False
            head, tail = chain[0], chain[-1]
            best, bd, mode = None, tol, None
            for i, sg in enumerate(segs):
                for (pt, m) in ((sg[0], "tail-start"), (sg[-1], "tail-end"),
                                (sg[0], "head-start"), (sg[-1], "head-end")):
                    anchor = tail if m.startswith("tail") else head
                    d = math.dist(anchor, pt)
                    if d < bd:
                        bd, best, mode = d, i, m
            if best is None:
                break
            sg = segs.pop(best)
            if mode == "tail-start":
                chain += sg[1:]
            elif mode == "tail-end":
                chain += list(reversed(sg))[1:]
            elif mode == "head-start":
                chain = list(reversed(sg))[:-1] + chain
            else:
                chain = sg[:-1] + chain
            changed = True
        return chain

    axis = stitch(AXIS_NAME)
    # total length of every way carrying the axis name, whether or not our bbox
    # reached it — this is what the coverage check compares against
    axis_full = 0.0
    for r in roads:
        if AXIS_NAME in (r.get("n") or "").lower():
            axis_full += sum(math.dist(r["p"][i], r["p"][i + 1])
                             for i in range(len(r["p"]) - 1))
    if axis and len(axis) > 3:
        alen = sum(math.dist(axis[i], axis[i + 1]) for i in range(len(axis) - 1))
        print(f"  stitched axis '{AXIS_NAME}': {len(axis)} pts, {alen:.0f} m")
    else:
        print("  ! could not stitch an axis, falling back")
        axis = [[round(x, 1), round(z, 1)] for x, z in
                (proj(la, lo) for la, lo in FALLBACK_ORCHARD)]

    # ---- keep buildings out of the carriageway -------------------------------
    # OSM footprints and OSM centrelines are surveyed separately, and our road
    # widths are inferred from lane tags, so a building can end up sitting in
    # the road. Push any vertex that falls inside a road corridor back out to
    # the kerb line rather than letting geometry interpenetrate.
    def seg_dist(px, pz, ax, az, bx, bz):
        vx, vz = bx - ax, bz - az
        L2 = vx * vx + vz * vz
        if L2 < 1e-9:
            return math.dist((px, pz), (ax, az)), ax, az
        t = max(0.0, min(1.0, ((px - ax) * vx + (pz - az) * vz) / L2))
        cx, cz = ax + vx * t, az + vz * t
        return math.dist((px, pz), (cx, cz)), cx, cz

    corridors = []
    corridor_meta = []                 # same segments, carrying name and class
    for r in roads:
        if r["k"] in ("footway", "pedestrian"):
            continue
        clear = r["w"] / 2 + 1.2          # half the carriageway plus a kerb
        for i in range(len(r["p"]) - 1):
            corridors.append((r["p"][i], r["p"][i + 1], clear))
            corridor_meta.append((r["p"][i], r["p"][i + 1], clear,
                                  r.get("n"), r["k"]))
    if axis:
        aclear = 16.0 / 2 + 2.0
        for i in range(len(axis) - 1):
            corridors.append((axis[i], axis[i + 1], aclear))
            corridor_meta.append((axis[i], axis[i + 1], aclear, AXIS_NAME, "axis"))

    # A spatial hash over the corridors. Testing every vertex against all 6,587
    # of them is 300 million distance calculations and takes about twenty
    # minutes; only the handful in neighbouring cells can possibly be close.
    CGRID_CELL = 50.0
    cgrid = {}
    for seg in corridors:
        (ax, az), (bx, bz), clear = seg
        for gx in range(int((min(ax, bx) - clear) // CGRID_CELL),
                        int((max(ax, bx) + clear) // CGRID_CELL) + 1):
            for gz in range(int((min(az, bz) - clear) // CGRID_CELL),
                            int((max(az, bz) + clear) // CGRID_CELL) + 1):
                cgrid.setdefault((gx, gz), []).append(seg)

    def corridors_near(px, pz):
        return cgrid.get((int(px // CGRID_CELL), int(pz // CGRID_CELL)), ())

    def clear_vertex(px, pz, tol=0.0):
        """Slide a vertex out of every corridor it is inside. Returns the point
        and whether it moved.

        `tol` is how far inside a corridor a point may be before it counts as
        being in it. It exists for the EDGE pass below: a wall that runs
        alongside a kerb has midpoints a few centimetres inside it constantly,
        from rounding and from an edge being the chord of a curved corridor, and
        treating those as crossings inserted 6,209 vertices where 106 edges
        actually cross and grew the scene file by 10%."""
        moved = False
        for (a, c, clear) in corridors_near(px, pz):
            d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
            if d < clear - tol and d > 1e-6:
                nx, nz = (px - cx) / d, (pz - cz) / d
                px, pz = cx + nx * clear, cz + nz * clear
                moved = True
        return px, pz, moved

    def subdivide(ring, maxlen=4.0):
        out = []
        n = len(ring)
        for i in range(n):
            a = ring[i]
            c = ring[(i + 1) % n]
            out.append(a)
            L = math.dist(a, c)
            if L > maxlen:
                steps = int(L // maxlen)
                for k in range(1, steps + 1):
                    t = k / (steps + 1)
                    out.append([round(a[0] + (c[0] - a[0]) * t, 1),
                                round(a[1] + (c[1] - a[1]) * t, 1)])
        return out

    for b in buildings:
        if len(b["p"]) < 40:                      # keep already-dense rings as they are
            b["p"] = subdivide(b["p"])

    moved_pts, moved_b = 0, 0
    for b in buildings:
        touched = False
        for j, (px, pz) in enumerate(b["p"]):
            px, pz, moved = clear_vertex(px, pz)
            if moved:
                touched = True
                moved_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            moved_b += 1
    print(f"  road clearance: nudged {moved_pts} vertices across {moved_b} buildings")

    def simplify(ring, eps=0.35):
        """Drop vertices that sit on the straight line between their neighbours."""
        if len(ring) < 5:
            return ring
        out = [ring[0]]
        for i in range(1, len(ring) - 1):
            a, b, c = out[-1], ring[i], ring[i + 1]
            vx, vz = c[0] - a[0], c[1] - a[1]
            L = math.hypot(vx, vz)
            if L < 1e-6:
                continue
            # perpendicular distance from b to the line a->c
            d = abs((b[0] - a[0]) * vz - (b[1] - a[1]) * vx) / L
            if d > eps:
                out.append(b)
        out.append(ring[-1])
        return out

    before_pts = sum(len(b["p"]) for b in buildings)
    for b in buildings:
        b["p"] = simplify(b["p"])
    after_pts = sum(len(b["p"]) for b in buildings)
    print(f"  simplified rings: {before_pts} -> {after_pts} vertices "
          f"({100 - 100 * after_pts // max(before_pts, 1)}% smaller)")

    # Simplification draws a straight line between the vertices it keeps, and
    # that line can cut back through a corridor the clearance pass had just
    # emptied. So clear again afterwards: the order clear-then-simplify quietly
    # put building walls back into the carriageway on about thirty buildings.
    again_pts, again_b = 0, 0
    for b in buildings:
        touched = False
        for j, (px, pz) in enumerate(b["p"]):
            px, pz, moved = clear_vertex(px, pz)
            if moved:
                touched = True
                again_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            again_b += 1
    print(f"  re-cleared after simplify: {again_pts} vertices "
          f"across {again_b} buildings")

    buildings.sort(key=lambda b: -b["a"])
    # Drop footprints with no area. A ring that encloses nothing extrudes into a
    # zero-width sliver: invisible, but it still costs a draw and still answers
    # point-in-polygon tests unpredictably.
    def _ring_area(ring):
        a2 = 0.0
        for i in range(len(ring)):
            q1, q2 = ring[i], ring[(i + 1) % len(ring)]
            a2 += q1[0] * q2[1] - q2[0] * q1[1]
        return abs(a2) / 2

    _flat = [b for b in buildings if _ring_area(b["p"]) < 4]
    if _flat:
        print(f"  dropped {len(_flat)} footprints with no area")
        _fset = {id(b) for b in _flat}
        buildings = [b for b in buildings if id(b) not in _fset]

    # Repair a footprint whose ring crosses itself.
    #
    # Ten of them, including Tang Plaza and Pullman Singapore Orchard. A
    # self-intersecting ring extrudes into folded geometry with walls doubling
    # back through each other, which shades wrong and confuses every
    # point-in-polygon test built on it — including the collision grid and the
    # "is this bus stop inside a building" check.
    #
    # Almost always it is one vertex out of order, so try dropping each vertex in
    # turn and keep the first ring that comes out clean. If none does, leave it
    # alone rather than mangle a real outline: a wrong repair is worse than a
    # known defect.
    def _segs_cross(a, b, c, d):
        def side(p, q, r):
            return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
        s1, s2 = side(a, b, c), side(a, b, d)
        s3, s4 = side(c, d, a), side(c, d, b)
        return (s1 > 0) != (s2 > 0) and (s3 > 0) != (s4 > 0)

    def _self_crossing(ring):
        n = len(ring)
        if n > 60:
            return False        # traced curves, and the test is quadratic
        for i in range(n):
            for j in range(i + 2, n):
                if i == 0 and j == n - 1:
                    continue
                if _segs_cross(ring[i], ring[(i + 1) % n], ring[j], ring[(j + 1) % n]):
                    return True
        return False

    # ---- and now the EDGES, on REAL carriageways only ------------------------
    # Every pass above moves VERTICES, so a wall between two cleared vertices can
    # still cut through a corridor. audit_roads.py has been printing "building
    # EDGES inside a carriageway: 106" the whole time while the vertex passes
    # reported themselves clean, and those edges are most of what P1b still
    # counts as building masses standing in a road.
    #
    # The first version of this cleared edges against EVERY corridor and was
    # measured to be worse than the problem: 2,230 vertices inserted across 125
    # buildings, the scene file 4% bigger, and self-crossing footprints from 6
    # to 68 with 31 having no single-vertex repair. This file already records
    # what a self-crossing ring costs -- it confuses every point-in-polygon test
    # built on it, including the collision grid.
    #
    # The reason was scope, not method. Sampling every building edge showed 413
    # crossings deeper than 0.6m and **383 of them are into SERVICE roads**,
    # which is a hotel set-down or a loading bay under a porte-cochere and is
    # what a service road is for. The audit has always skipped service roads
    # here; the fix was not. So it was shoving buildings out of their own
    # driveways and folding their rings to do it.
    #
    # Against real carriageways only there are 30, and they are chords cutting
    # the corner of a bend or a junction, which is what a simplified ring does
    # between two vertices that were each pushed straight out.
    edge_corr = [(a, c, cl) for (a, c, cl, _n, k) in corridor_meta
                 if k not in ("service", "service_link")]
    ecg = {}
    for seg in edge_corr:
        (ax, az), (bx, bz), cl = seg
        for gx in range(int((min(ax, bx) - cl) // CGRID_CELL),
                        int((max(ax, bx) + cl) // CGRID_CELL) + 1):
            for gz in range(int((min(az, bz) - cl) // CGRID_CELL),
                            int((max(az, bz) + cl) // CGRID_CELL) + 1):
                ecg.setdefault((gx, gz), []).append(seg)

    def clear_edge_pt(px, pz, tol=0.6):
        """Slide a point out of every REAL carriageway it is inside. `tol` is
        how far in it may be first: a wall running along a kerb grazes it by
        centimetres constantly, from rounding and from an edge being the chord
        of a curved corridor, and treating those as crossings is what inserted
        thousands of needless vertices."""
        moved = False
        for (a, c, cl) in ecg.get((int(px // CGRID_CELL), int(pz // CGRID_CELL)), ()):
            d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
            if d < cl - tol and d > 1e-6:
                nx, nz = (px - cx) / d, (pz - cz) / d
                px, pz = cx + nx * cl, cz + nz * cl
                moved = True
        return px, pz, moved

    edge_pts, edge_b, edge_folded = 0, 0, 0
    for b in buildings:
        # NOT `ring` -- that is a function defined in this same scope, and
        # binding it here makes it local for the whole of main(), which broke
        # the footprint reader 570 lines earlier. Same shadowing class as the
        # heightfield loop variable already recorded in NEXT.md.
        bring = b["p"]
        n = len(bring)
        out = []
        touched = False
        for i in range(n):
            a = bring[i]
            c = bring[(i + 1) % n]
            out.append(a)
            L = math.dist(a, c)
            if L < 1.2:
                continue
            steps = int(L // 1.0)
            for k in range(1, max(1, steps)):
                t = k / steps
                mx = a[0] + (c[0] - a[0]) * t
                mz = a[1] + (c[1] - a[1]) * t
                px, pz, moved = clear_edge_pt(mx, mz)
                if moved:
                    out.append([round(px, 1), round(pz, 1)])
                    edge_pts += 1
                    touched = True
        # A FAILED REPAIR MUST NOT SHIP DAMAGE. Pushing a midpoint
        # perpendicular to a corridor can move it past its own neighbours where
        # a wall meets the road at a shallow angle, folding the ring -- and a
        # self-crossing ring confuses every point-in-polygon test built on it,
        # including the collision grid. If the insertion folds a ring that was
        # sound, keep the original and count it: a wall clipping a kerb is a
        # smaller defect than a footprint that lies about its own interior.
        if touched:
            if _self_crossing(out) and not _self_crossing(bring):
                edge_pts -= sum(1 for q in out if q not in bring)
                edge_folded += 1
                continue
            b["p"] = out
            edge_b += 1
    print(f"  edge clearance: inserted {edge_pts} vertices across {edge_b} buildings"
          + (f", {edge_folded} left alone (the fix would fold the ring)" if edge_folded else ""))

    # SG_NO_RING_REPAIR=1 rebuilds without this, so its effect can be measured
    # rather than argued about.
    def _crossings(ring):
        n = len(ring)
        c = 0
        for i in range(n):
            for j in range(i + 2, n):
                if i == 0 and j == n - 1:
                    continue
                if _segs_cross(ring[i], ring[(i + 1) % n], ring[j], ring[(j + 1) % n]):
                    c += 1
        return c

    _fixed = _left = 0
    for _b in ([] if os.environ.get("SG_NO_RING_REPAIR") else buildings):
        if not _self_crossing(_b["p"]):
            continue
        # Greedy: repeatedly drop the vertex whose removal removes the most
        # crossings. One pass fixed eight of nine, and Capitol Singapore needed
        # more than one vertex gone — a single-shot repair left it broken and
        # the hunt kept reporting it.
        _ring = list(_b["p"])
        _plateau = 0
        for _pass in range(10):
            if not _self_crossing(_ring) or len(_ring) <= 4:
                break
            _base = _crossings(_ring)
            _best, _bestC = None, _base
            for _k in range(len(_ring)):
                _cand = _ring[:_k] + _ring[_k + 1:]
                _c = _crossings(_cand)
                if _c < _bestC:
                    _bestC, _best = _c, _cand
            if _best is None:
                # LOCAL MINIMUM, NOT A DEAD END. Only a STRICT improvement was
                # accepted, so a ring where no single vertex helps but two
                # together would was abandoned — two of them survive in Orchard
                # and two in Chinatown, and a self-crossing ring breaks every
                # point-in-polygon test built on it, collision included.
                # Allow one sideways move (drop the vertex that leaves the
                # count unchanged) so the search can step off the plateau.
                # Safe by construction: the ring below is only COMMITTED if it
                # ends up clean, so a plateau walk that leads nowhere costs
                # nothing and the "do not mangle a real outline" rule holds.
                if _plateau >= 2:
                    break
                _plateau += 1
                for _k in range(len(_ring)):
                    _cand = _ring[:_k] + _ring[_k + 1:]
                    if _crossings(_cand) == _bestC:
                        _best = _cand
                        break
                if _best is None:
                    break
            _ring = _best
        if not _self_crossing(_ring):
            _b["p"] = _ring
            _fixed += 1
        else:
            _left += 1
    if _fixed or _left:
        print(f"  self-crossing footprints: {_fixed} repaired by dropping vertices"
              + (f", {_left} left alone (no clean ring found)" if _left else ""))

    # Drop a footprint that is buried inside a taller one.
    #
    # OSM traces a mall, its annex and sometimes its own outline again as
    # separate ways. Where the inner one is TALLER it is a tower on a podium and
    # must be drawn — 16 of the 28 buried footprints in this region are exactly
    # that, including The Atrium @ Orchard above Plaza Singapura. Where it is the
    # same height or lower it is invisible except for the z-fighting it causes
    # along every shared face, so it is pure cost.
    #
    # Tested on the footprint's OWN area being inside the other, not on bounding
    # boxes: an L-shaped plan's box overlaps its neighbour's without either
    # building overlapping at all.
    def _area(poly):
        a2 = 0.0
        for i in range(len(poly)):
            q1, q2 = poly[i], poly[(i + 1) % len(poly)]
            a2 += q1[0] * q2[1] - q2[0] * q1[1]
        return abs(a2) / 2

    def _inpoly(poly, x, z):
        hit = False
        j = len(poly) - 1
        for i in range(len(poly)):
            xi, zi = poly[i]; xj, zj = poly[j]
            if ((zi > z) != (zj > z)) and (x < (xj - xi) * (z - zi) / (zj - zi) + xi):
                hit = not hit
            j = i
        return hit

    _CELL = 60.0
    _grid = {}
    for _b in buildings:
        _xs = [q[0] for q in _b["p"]]; _zs = [q[1] for q in _b["p"]]
        _b["_bb"] = (min(_xs), min(_zs), max(_xs), max(_zs))
        for _cx in range(int(min(_xs) // _CELL), int(max(_xs) // _CELL) + 1):
            for _cz in range(int(min(_zs) // _CELL), int(max(_zs) // _CELL) + 1):
                _grid.setdefault((_cx, _cz), []).append(_b)
    _buried = []
    for _b in buildings:
        mnx, mnz, mxx, mxz = _b["_bb"]
        _in = _n = 0
        for i in range(1, 5):
            for j in range(1, 5):
                x = mnx + (mxx - mnx) * i / 5
                z = mnz + (mxz - mnz) * j / 5
                if not _inpoly(_b["p"], x, z):
                    continue
                _n += 1
                for _o in _grid.get((int(x // _CELL), int(z // _CELL)), []):
                    if _o is _b or not _inpoly(_o["p"], x, z):
                        continue
                    # A MASS THAT STARTS IN THE AIR BURIES NOTHING. SkyPark is
                    # 12,455 m2 at h=207 with min_height 193 -- a 14m deck in
                    # the sky -- and it sits over all three Marina Bay Sands
                    # towers. Judged on height alone it "contains" them and two
                    # of the three were dropped, along with both Asia Square
                    # towers under their own outline. A footprint with
                    # min_height does not occupy the ground beneath it.
                    if _o.get("mh"):
                        continue
                    if _area(_o["p"]) > _area(_b["p"]) * 1.05 \
                            and (_o.get("h") or 0) >= (_b.get("h") or 0):
                        _in += 1
                        break
        if _n >= 4 and _in / _n > 0.8:
            _buried.append(_b)
    for _b in buildings:
        _b.pop("_bb", None)
    if _buried:
        _names = ", ".join((b.get("n") or "(unnamed)") for b in _buried[:3])
        print(f"  dropped {len(_buried)} footprints buried inside a taller building: {_names}"
              + ("..." if len(_buried) > 3 else ""))
        _bset = {id(b) for b in _buried}
        buildings = [b for b in buildings if id(b) not in _bset]

    # ---- POLYGON SURGERY (data/split.py, sweep-2 items 18 and 14) ----------
    # Rings a carriageway runs THROUGH split into a piece per side (Plaza
    # Singapura roofed Handy Road at 3m and dodged every prune; the CBD maps
    # the same way), and long low terrace rows segment every ~16m so each
    # piece takes its own footing on a slope (Emerald Hill's ground floors
    # were buried behind a 3m plinth). A failed split keeps the original.
    try:
        from split import split_ring_by_road, segment_terrace
        _split_road, _split_terrace = 0, 0
        _out2 = []
        for b in buildings:
            # RECURSIVE ring-split: one cut removes only the LONGEST
            # through-road, and a footprint two roads run through leaves both
            # halves still straddling the second one — P5 counted the same
            # two intrusions twice the day the surgery landed. Pieces go
            # back in the queue until nothing runs through them (bounded).
            queue = [b]
            done_pieces = []
            passes = 0
            while queue and passes < 8:
                cur = queue.pop()
                pieces = split_ring_by_road(cur, roads)
                if pieces:
                    passes += 1
                    queue.extend(pieces)
                else:
                    done_pieces.append(cur)
            done_pieces.extend(queue)          # bound hit: keep remainder
            if passes:
                _split_road += 1
                _out2.extend(done_pieces)
                continue
            segs = segment_terrace(b)
            if segs:
                _split_terrace += 1
                _out2.extend(segs)
                continue
            _out2.append(b)
        if _split_road or _split_terrace:
            print(f"  polygon surgery: {_split_road} road-through rings split, "
                  f"{_split_terrace} terrace rows segmented "
                  f"({len(buildings)} -> {len(_out2)} footprints)")
        buildings = _out2
    except Exception as e:                     # surgery must never kill a build
        print(f"  polygon surgery SKIPPED: {e}")

    # ---- FREE-STANDING TOWERS (the Supertrees) -----------------------------
    # OSM maps the Supertrees individually as `man_made=tower` with REAL
    # positions, while the Grove itself is only a garden polygon -- so the
    # positions are surveyed and do not have to be invented. Their HEIGHTS are
    # another matter: several carry `fixme=height`, one is tagged 0.5m and one
    # gives a storey count instead of metres.
    #
    # Gardens by the Bay publishes the real set: 18 Supertrees at 25, 30, 37, 42
    # and 50m, of which exactly ONE is 50m and carries the observatory. So a
    # tagged height is SNAPPED to the nearest published value, and the one
    # tagged `tower:type=observation` is forced to 50m regardless of what its
    # height tag says. That is the same treatment the building heights already
    # get when a tag is implausible, and it keeps the silhouette right: a row of
    # Supertrees where one is clearly tallest is the thing people photograph.
    SUPERTREE_H = [25, 30, 37, 42, 50]
    towers = []
    for e in els:
        t = e.get("tags") or {}
        if t.get("man_made") != "tower":
            continue
        g = e.get("geometry")
        if g:
            xs = [proj(q["lat"], q["lon"]) for q in g if "lat" in q]
            if not xs:
                continue
            cx = sum(p[0] for p in xs) / len(xs)
            cz = sum(p[1] for p in xs) / len(xs)
            rad = max(math.dist((cx, cz), p) for p in xs)
        elif "lat" in e:
            cx, cz = proj(e["lat"], e["lon"])
            rad = 4.0
        else:
            continue
        h = None
        try:
            h = float(str(t.get("height", "")).replace("m", "").strip())
        except ValueError:
            h = None
        if h is None and t.get("building:levels"):
            # On a TOWER this is a mis-tagged height, not a storey count: a
            # Supertree has no storeys. One of them carries `building:levels=27`
            # and multiplying by a floor height made it 92m, which snapped to
            # the 50m bucket and produced TWO 50m Supertrees when Gardens by the
            # Bay publishes exactly one.
            try:
                h = float(t["building:levels"])
            except ValueError:
                h = None
        if t.get("tower:type") == "observation":
            h = 50.0                      # the one with the observatory
        elif h is None or h < 12:
            h = 25.0                      # a Supertree is never shorter than this
        else:
            h = min(SUPERTREE_H, key=lambda v: abs(v - h))
        towers.append({"p": [round(cx, 1), round(cz, 1)], "h": h,
                       "r": round(min(9.0, max(3.0, rad)), 1)})
    if towers:
        print(f"  towers: {len(towers)} free-standing, heights "
              + "/".join(str(int(t['h'])) for t in sorted(towers, key=lambda q: -q['h'])))

    # ---- WATER -------------------------------------------------------------
    # Nothing in this project has ever drawn water. It was FETCHED from the very
    # first district and thrown away here, which is the eighth instance of the
    # pattern data/unused.py now gates -- except this one was invisible to that
    # gate too, because the tag was on an element class the scene file has no
    # collection for at all.
    #
    # A bay is a multipolygon RELATION, not a closed way: Marina Reservoir and
    # the Singapore River both are, so a way-only reader gets the ornamental
    # ponds and misses the bay. Outer rings only -- an island in a reservoir is
    # drawn as land by the buildings and terrain that sit on it, and a hole in
    # the water surface would show the terrain through it anyway.
    water = []
    for e in els:
        t = e.get("tags") or {}
        # AN AREA, NOT A CENTRELINE. `waterway=canal` and `waterway=river` on a
        # plain way are the LINE down the middle of the water, not its outline:
        # treating them as polygons turned Stamford Canal into a 222,000 m2
        # blob lying across Orchard, and W2 duly reported 5,447 things built in
        # open water three kilometres from the nearest water.
        #
        # Only `natural=water`, `landuse=reservoir` and the two area-by-
        # definition waterway values are outlines, and even then the ring has to
        # actually close.
        is_water = (t.get("natural") == "water"
                    or t.get("landuse") == "reservoir"
                    or t.get("waterway") in ("riverbank", "dock"))
        if not is_water:
            continue
        rings = []
        if e["type"] == "way" and e.get("geometry"):
            rings.append(e["geometry"])
        elif e["type"] == "relation":
            # A MULTIPOLYGON'S OUTER RING IS SPLIT ACROSS MANY WAYS and has to
            # be stitched end to end. Marina Reservoir arrives as 40 outer
            # members, every one an OPEN line a few points long; treating each
            # as its own ring gives 40 slivers of no area, which the area filter
            # then drops -- so the bay silently did not exist.
            #
            # Exactly the same operation process.py already does to turn OSM's
            # 28 Orchard Road fragments into one centreline. Endpoints are
            # matched on a rounded key because they are shared nodes and agree
            # to full precision.
            rings.extend(stitch_outer(e))
        for g in rings:
            pts = [proj(q["lat"], q["lon"]) for q in g if "lat" in q]
            if len(pts) < 4:
                continue
            # a ring that does not close is a line someone tagged as water
            if math.dist(pts[0], pts[-1]) > 25.0:
                continue
            a2 = 0.0
            for i in range(len(pts)):
                q1, q2 = pts[i], pts[(i + 1) % len(pts)]
                a2 += q1[0] * q2[1] - q2[0] * q1[1]
            # NOT `area` -- that is a function defined in this same scope, and
            # binding it here makes it local for the whole of main(), which
            # broke the building reader 500 lines earlier. This is the SECOND
            # time in one session: `ring` went the same way in the edge-clearance
            # pass. In a 1,300-line main() every helper name is a landmine.
            warea = abs(a2) / 2
            if warea < 120:           # a pond smaller than this is dressing
                continue
            water.append({"p": [[round(x, 1), round(z, 1)] for x, z in pts],
                          "a": round(warea)})
    water.sort(key=lambda w: -w["a"])
    if water:
        print(f"  water: {len(water)} polygons, largest {water[0]['a']:,} m2, "
              f"total {sum(w['a'] for w in water):,} m2")

    out = {
        "origin": {"lat": LAT0, "lon": LON0},
        "buildings": buildings,
        "water": water,
        "towers": towers,
        "roads": roads,
        "trees": trees,
        "crossings": crossings,
        "signals": signals,
        "busstops": busstops,
        "mrt": mrt,
        "taxis": taxis,
        "bridges": bridges,
        "covered": covered,
        "shops": shops,
        "axisFullLength": round(axis_full, 1),
        "axis": {"p": [[round(x, 1), round(z, 1)] for x, z in axis],
                 "w": axis_width, "n": axis_name},
    }
    path = OUT_PATH
    kept = carry_terrain(path, out)
    json.dump(out, open(path, "w"), separators=(",", ":"))
    if kept:
        print("  carried the existing heightfield over")
    else:
        print("  NO HEIGHTFIELD: run terrain.py or the district will be flat")

    named = [b for b in buildings if "n" in b]
    hs_osm = sum(1 for b in buildings if b.get("hs") == "osm")
    hs_named = sum(1 for b in buildings if b.get("hs") == "named")
    lane_tagged = sum(1 for r in roads if "lanes" in r)
    w_real = sum(1 for r in roads if r.get("ws") in ("osm-width", "osm-lanes"))
    sw_real = sum(1 for r in roads if r.get("sidewalk"))
    dual = sum(1 for r in roads if r.get("oneway") and r.get("k") in
               ("primary", "secondary", "trunk", "tertiary"))
    print(f"  skipped {skipped_underground} underground footprints")
    print(f"  buildings {len(buildings)}  (named {len(named)}, landmarks {sum(1 for b in buildings if b.get('k'))})")
    print(f"  real heights: {hs_osm} from OSM tags + {hs_named} hand-entered "
          f"= {hs_osm + hs_named}/{len(buildings)}")
    print(f"  roads with real lane counts: {lane_tagged}/{len(roads)}")
    print(f"  road widths from real data: {w_real}/{len(roads)}   "
          f"sidewalk tags: {sw_real}   dual-carriageway: {dual}")
    print(f"  roads {len(roads)}   osm trees {len(trees)}")
    print(f"  real POIs: {len(crossings)} crossings, {len(signals)} signals, "
          f"{len(busstops)} bus stops, {len(mrt)} MRT, {len(taxis)} taxi ranks")
    print(f"  real structures: {len(bridges)} ped bridges, {len(covered)} covered walkways, "
          f"{len(shops)} named shops")
    if BAD_HEIGHT_TAGS:
        names = ", ".join(n for n, _ in BAD_HEIGHT_TAGS[:4])
        print(f"  refused {len(BAD_HEIGHT_TAGS)} implausible height tags "
              f"(under 2.5m): {names}{'...' if len(BAD_HEIGHT_TAGS) > 4 else ''}")
    print(f"  wrote {path}  {os.path.getsize(path)/1024:.0f} KB")
    print("\nlargest by footprint:")
    for b in buildings[:12]:
        print(f"  {b.get('n','(unnamed)')[:34]:36s} {b['a']:>7} m2   h={b['h']}")


if __name__ == "__main__":
    main()
