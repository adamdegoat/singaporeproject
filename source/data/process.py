#!/usr/bin/env python3
"""Turn raw Overpass JSON for the ION / Ngee Ann stretch into a compact scene file.

Coordinates are projected to local metres about a centre point:
  +x = east, +z = south, y = up (three.js convention).
OSM heights are unreliable here (Hilton is tagged 2 levels but 90m), so the
landmarks that carry recognition get hand-set heights and the rest fall back to
floor count, then to a per-type default.
"""
import json, math, os, random, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from buildtypes import TYPE_HEIGHT                         # noqa: E402

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
# The district bbox, "s,w,n,e", set by build_district.py from the registry.
# Needed by the coastline reader, which has to close the shoreline against
# the district edge to make a sea polygon. Empty when process.py is run by
# hand, in which case the sea is skipped and says so rather than guessing.
BBOX = os.environ.get("SG_BBOX") or ""
# which district this run is, taken from the output filename -- process.py is
# driven entirely by the environment and never sees the districts.json record
DIST_ID = os.path.splitext(os.path.basename(OUT_PATH))[0]
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
    # 180 FEET, PUBLISHED = 54.9m. It stood at 64.6 = 19 levels x 3.4, which is
    # the storey-to-metre conversion this project forbids wherever a real
    # measurement exists -- and one does. research/orchard-frontage-facades.md.
    "tong building":          {"h": 54.9},
    # SOTA: CTBUH building 16766 publishes 56m / 10 floors; the OSM tag said
    # 50 with no source. research/sota.md has the full build spec.
    "school of the arts":     {"h": 56},
    "lucky plaza":            {"h": 85},
    # 20m PODIUM (5 retail levels, published), not the tower's height. As 70 it
    # buried "Far East Plaza Residence", which stands on it.
    "far east plaza residence": {"h": 95},
    "far east plaza":         {"h": 20},
    # 24m PODIUM (6 retail storeys, published), with the medical tower keyed
    # separately. As 78 the site buried its own tower.
    #
    # The old comment here said "20-storey tower". That is WRONG and its source
    # was Wikipedia, uncited -- whose own infobox says 6 retail / 14 medical.
    # The owner, Paragon Medical and DP Architects all say FOURTEEN on a
    # six-storey podium. (The architect is DP Architects, not KPF.)
    #
    # `podium:` is dead weight: only the Ngee Ann City recipe reads it.
    "paragon medical":        {"h": 78},
    "paragon":                {"h": 24},
    # 79m, and this key lands on BOTH of the complex's footprints (3,264 and
    # 2,221 m2), which are its 18- and 17-storey blocks. OSM's levels=4 and
    # levels=8 are both wrong. Researched 2026-07-31,
    # research/orchard-frontage-facades.md. The tower is mid-AEI with a facade
    # re-clad announced Dec 2023 and no confirmed completion, so the CURRENT
    # skin is not reliably known -- height only.
    "orchard towers":         {"h": 79},
    "palais renaissance":     {"h": 55},
    "hilton singapore orchard": {"h": 152},   # VERIFIED taller of two towers
    "grand hyatt":            {"h": 60},
    # Research 2026-07-29 (research/forum.md): published 17 storeys (1986,
    # RSP); no metre height anywhere. 40 was our guess and reads short —
    # 17 x 3.3 = 56, labelled derived.
    "forum":                  {"h": 56, "district": "orchard"},
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
    # "Cairnhill Nine" is a TOWER's name sitting on the SITE polygon, and at
    # 130 it buried two towers -- the Ascott and an unnamed 30-storey CapitaLand
    # block. 20m is the 6-storey carpark with its 7th-storey deck. The tower
    # itself is unreachable by name and is set by postcode instead: CapitaLand
    # publishes it "towering at 122 metres with 30 storeys", so the old 130 was
    # 8m over AND on the wrong polygon. There is no 39-storey tower here.
    #
    # DO NOT key "cairnhill" (matches three buildings, and Cairnhill Plaza is
    # separately tagged 122.4) or "ascott" (matches Ascott Raffles Place, the
    # Asia Insurance Building — URA: "Completed in 1955", 18 storeys, at
    # **2 Finlayson Green**, not 1954 and not 2 Raffles Quay as this comment and
    # research/orchard-podiums.md line 650 both had it until 2026-08-01;
    # research/conservation-missing-areas.md carries URA's own wording).
    "cairnhill nine":         {"h": 20},
    "orchard gateway":        {"h": 45},
    # FIVE storeys, not 45m. 45 was a hand-typed override with no source; the
    # building is a 5-storey block. Height CLASS, not a published figure.
    "midpoint orchard":       {"h": 23},
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
    # THE HEEREN IS NOT HERE ANY MORE. It sat at 60m with no citation, in the
    # table that claims "named" provenance -- i.e. a published measurement --
    # and 60m over 20 storeys is 3.0m a floor, too low for a tower that is six
    # retail levels under fourteen of offices. The owner publishes the STOREY
    # count and nobody publishes metres, so it belongs in STOREY_COUNTS where
    # the ledger will report it as what it is. See research/orchard-frontage-
    # facades.md.
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
    # THE PART SPLIT THIS NOTE ASKED FOR, DONE 2026-07-31 -- and the data was
    # already there. OSM maps both towers as building:part ways carrying their
    # own published heights (245 and 139.9), and this pipeline was reading them
    # all along. They never appeared because the BARE key below put 245m on the
    # 10,341 m2 SITE polygon, and process.py's buried-footprint filter then
    # dropped both towers for sitting inside a footprint that was larger and
    # just as tall. The site swallowed its own towers.
    #
    # Longest-key-wins makes this safe, and it is the UOB Plaza lesson again:
    # the specific spellings must exist or the bare one captures them.
    "one raffles quay north tower": {"h": 245, "key": True},
    "one raffles quay south tower": {"h": 139.9},
    # the podium the two towers stand on. UNPUBLISHED -- height class for a
    # 3-storey retail base, not a measurement.
    "one raffles quay":       {"h": 20},
    "ocean financial":        {"h": 245, "key": True},
    "the sail":               {"h": 245, "key": True},
    "central park tower":     {"h": 215},
    "ioi central boulevard":  {"h": 245},   # WEST; east is ~16 floors unpublished
    "frasers tower":          {"h": 231},
    "asia square tower 1":    {"h": 229, "key": True},   # CTBUH
    "asia square tower 2":    {"h": 222, "key": True},
    # 17m PODIUM, published: Denton Corker Marshall describe "The Cube" as "a
    # 17-metre high, 6,000 m2 city room" with "the two towers sit above a
    # floating white rectangular podium". This is the only genuinely published
    # podium height in the CBD set. The block further down this same dict
    # already says "NOT asia square: that name is the site OUTLINE" -- but the
    # key was still defined HERE, earlier in the same literal, so the outline
    # kept the tower height and kept swallowing both of its own towers.
    # Asia Square's towers are height=0 in OSM, so their keys are mandatory.
    "asia square":            {"h": 17},
    "marina bay suites":      {"h": 227},
    # T2 IS NOT 214. CTBUH: T1 214m/50fl, T2 177.7m/42fl -- and the OSM data
    # already carries 214 and 178 on the two building:part ways. The single key
    # was overwriting a correct pair with one number.
    "one shenton tower 1":    {"h": 214, "key": True},
    "one shenton tower 2":    {"h": 177.7},
    # 6-storey carpark and retail podium per Meinhardt, the engineer of record;
    # no metres published, so this is a height CLASS. OSM's levels=9 is higher
    # than the engineer's own count.
    "one shenton":            {"h": 20},
    "ocbc centre":            {"h": 198, "key": True},   # OSM said 16
    "ocbc bank":              {"h": 198, "key": True},   # the footprint carries the bank name
    # NO KEY FOR SINGAPORE LAND TOWER, deliberately. Two OSM ways share the name
    # EXACTLY -- way 46595418 is the 48-storey tower and already carries
    # height=190, way 939684168 is the 4-storey podium at 13.6. No substring can
    # separate them, so any key here puts one number on both and the podium then
    # buries the tower. OSM alone is already right. (Wikipedia's 213 is
    # unattributed: its refs are dead Emporis and SkyscraperPage entries.)
    # "Unity Tower One/Two" is CTBUH's own recorded FORMER NAME for SGX Centre
    # 1 and 2, so those OSM names are real, not inventions. Both 187.3m, 29fl.
    # The way actually named "SGX Centre" is the shared 3-storey podium -- it
    # was standing at 187m and burying both towers.
    "unity tower one":        {"h": 187.3, "key": True},
    "unity tower two":        {"h": 187.3, "key": True},
    "sgx centre":             {"h": 15},
    "18 robinson":            {"h": 180},
    "hitachi tower":          {"h": 179},
    "16 collyer quay":        {"h": 179},
    # NO "state courts" KEY. It was matching the 1975 OCTAGON -- a different,
    # still-standing building that OSM tags height=35 -- and rendering it as a
    # 7,900 m2 slab 178m tall. The 2019 towers are named "Court Tower" and
    # "Office Tower" in OSM; only the first is keyed, because "office tower"
    # also matches Guoco Midtown Office Tower and The Concourse Office Tower.
    "court tower":            {"h": 177.8, "key": True},   # CTBUH; CPG "at 178 metres high"
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
    # MARINA ONE IS FOUR TOWERS AND THIS KEY WAS GIVING ALL OF THEM ONE HEIGHT.
    #
    # THE FIFTH AND SIXTH TIME SUBSTRING MATCHING HAS BITTEN. The note at
    # height_for() lists four: "Grand Park City Hall" as City Hall, "Esplanade
    # Theatre" as the Esplanade, "Singapore Flyer Car Park" given the wheel's
    # 165m, and "The Shoppes at Marina Bay Sands" given a hotel tower's 194m.
    # Longest-match-wins fixed the MECHANISM; it cannot invent a longer key that
    # nobody has written. "marina one" is a real prefix of four real buildings
    # with two different heights, so one key silently answered for all of them.
    #
    # CTBUH, via research/tanjongrhu-marinasouth.md §7.3 (figures recovered from
    # an Internet Archive snapshot dated 2026-02-13, because CTBUH refuses
    # automated fetching — so they are six months old and sourced, not live):
    #
    #   Marina One office ................ 225.45m, 34 floors
    #   Marina One Residences Garden ..... 140.7m,  34 floors
    #   Marina One Residences Park ....... 140.7m,  34 floors
    #
    # The residences were drawn at 200m. **59.3 metres too tall, each, on two
    # towers in the most-looked-at skyline in the model** — and both stand in
    # THREE district files at once (chinatown, marinabay, marinasouth), so the
    # error was on screen three times over.
    #
    # The bare "marina one" key is KEPT rather than deleted: it still answers
    # for the site outline and for any part nobody has named, and 200 is the
    # architect's own figure for the office mass. The specific keys below beat
    # it by being longer, which is the rule this table already runs on.
    "marina one":             {"h": 200},   # architect figure; CTBUH says 225.45
    "marina one residences":  {"h": 140.7},
    # KALLANG, from research/kallang-landmarks.md, 2026-08-02.
    #
    # CONCOURSE SKYLINE WAS DRAWN AT 40 METRES AGAINST A PUBLISHED 150 — the
    # largest single height error found in this world today, on a 40-storey
    # tower standing on a 944 m2 footprint beside Nicoll Highway.
    #
    # THE RESEARCH DIAGNOSED THE MECHANISM WRONG AND THE CORRECTION IS WORTH
    # KEEPING. It reported "its 40 storeys were read as metres". They were not:
    # the building carries `hs="guess"`, so it never reached the levels path at
    # all -- OSM gives this footprint no height and no levels, and
    # TYPE_DEFAULT["residential"] is 40. The 40 is a COINCIDENCE, not a unit
    # confusion, and if it had been believed the "fix" would have been aimed at
    # the levels conversion, which is not involved. Check `hs` before believing
    # any story about where a number came from.
    # 33 storeys, CTBUH 135m. Ours came from OSM building:levels=30 x 3.4 =
    # 102m, so this replaces a storey derivation with a published measurement --
    # which is the one direction this table is always allowed to move.
    "city gate residences":   {"h": 135, "key": True},
    "marina one offices":     {"h": 225.45},
    "lau pa sat":             {"h": 14},    # 1-storey market + clock lantern; UNPUBLISHED, height class only

    # ---- CBD + civic, researched 2026-07-31 (research/heights-cbd.md,
    # research/bugis-brasbasah-landmarks.md). CTBUH architectural heights.
    #
    # READ THIS BEFORE ADDING AN "OUE DOWNTOWN" KEY. Seven OSM objects share
    # that prefix here: a 7,692 m2 retail PODIUM polygon, two towers, and four
    # building:part setback records. Lookup is substring with longest-key-wins,
    # so a bare "oue downtown" key would cap all seven at 201m -- which is
    # precisely the UOB Plaza failure that made three separate footprints into
    # three identical 280m cylinders. The bare polygon is the podium and its
    # 20m default is CORRECT. Only the tower gets a tower height.
    "oue downtown tower 1":   {"h": 201, "key": True},
    # Tower 2 stays on OSM's 150: CTBUH's 149 is flagged an estimate by CTBUH
    # itself, so there is nothing to gain by overriding a tag with a guess.
    "mas building":           {"h": 104, "key": True},
    # PARKROYAL COLLECTION Pickering (89m, CTBUH + WOHA) and Keppel South
    # Central (200m, CTBUH drawing-verified) are NOT set here, deliberately.
    # Both published heights are good; both OSM polygons are SITE OUTLINES, not
    # towers. Keppel's is 137 x 63m and no 200m tower has a 137m-long footprint;
    # PARKROYAL's is 154 x 104m at 0.33 fill. Applying a tower height to a site
    # polygon is the Bras Basah Complex error -- a 20m tag on a whole block --
    # run in reverse, and it would drop a 137 x 63 x 200m monolith on Anson
    # Road. They need podium-plus-tower recipes, and until then their defaults
    # are wrong by less than the "fix" would be. Logged in NEXT.md.
    # 102.8m: CTBUH, corroborated by a 2006 peer-reviewed article. The competing
    # 98m is the architect's SUPERSEDED 15-storey scheme and OSM's 90 is a Bing
    # guess.
    "national library":       {"h": 102.8, "key": True},

    # ---- Beach Road, researched 2026-07-31 (research/authored-footprints.md).
    # THREE TOWERS ON ONE BLOCK ALL STANDING AT 45m, from the same failure: OSM
    # tags each of them height=0, the junk-tag guard correctly rejects it, and
    # they fall through to TYPE_DEFAULT["office"] = 45. Duo Tower was 125m short.
    #
    # Why these ARE safe to set flat, when Keppel South Central and PARKROYAL
    # Pickering were not: each of these towers has its PODIUM mapped as a
    # SEPARATE record -- "Duo Galleria" (11,839 m2) beside "Duo Tower" (4,218),
    # and "The Concourse" (4,775) beside "The Concourse Office Tower" (3,911).
    # The polygon being overridden is the tower's own, not the whole site, which
    # is exactly the distinction that made 200m wrong on Keppel's 137m-long
    # site strip.
    "duo tower":              {"h": 170, "key": True},
    # The OSM part carries no height; 186m is published (Buro Ole Scheeren /
    # CTBUH, 50 storeys). Without this the part comes in as a guess.
    "duo residences":         {"h": 186, "key": True},
    # DUO's widely published 186/170 are AMSL ELEVATIONS, not building heights;
    # 170 is the architectural height above ground and reconciles to within ~9m
    # of the AMSL figure. DUO Residences is absent from the data entirely -- it
    # is tagged building:part, not building, so the fetch never sees it.
    # 175, not the 165 set here earlier. Re-researched 2026-07-31
    # (research/bugis-frontage-heights.md): Paul Rudolph WITH Architects 61,
    # completed 1994, octagonal plan on pilotis. The neighbouring Concourse
    # Skyline is a SEPARATE 2014 development, 150m / 40 storeys, and the two
    # were being conflated.
    "the concourse office tower": {"h": 175, "key": True},
    # THE 1975 SHAW TOWER IS GONE AND THE ONE STANDING THERE NOW IS TALLER.
    # Demolished 2020; the replacement opened mid-2026 at 200m over 35 storeys
    # (The Straits Times, 2 Dec 2018). The trap that makes this worth spelling
    # out: BOTH towers are 35 storeys and the old one was 134m, so a storey
    # count alone picks the wrong building by 66m -- which is exactly the
    # derivation every research brief this project sends out forbids.
    # research/bugis-frontage-heights.md.
    "shaw towers":            {"h": 200, "key": True},
    # 89.00m architectural, highest occupied floor 78.60m, 16 floors. CTBUH
    # 14115 from a data-submission form, corroborated independently by the
    # Skyscraper Museum's WOHA exhibition record at the same 89m. Two acceptable
    # sources; they disagree only on storeys (16 vs 15), which does not move the
    # height. The polygon is the whole site, so this pairs with the
    # parkroyalPickering recipe -- a flat 89m extrusion of a 159m-long site is
    # the "wall of buildings" the architect designed it to break down.
    "parkroyal collection pickering": {"h": 89, "key": True},
    # ---- research/bugis-marina-guessed-heights.md
    # 217.5m over 35 floors (CTBUH). Standing at the 45m office default, which
    # is 173m short of the tallest thing on that stretch of Beach Road.
    "south beach tower":      {"h": 217.5, "key": True},
    # St Andrew's spire is 63m (207 ft), from the cathedral's own site. The
    # facade is brilliant glossy white Madras chunam, which the recipe already
    # draws. Note the recipe caps a GUESSED church at 30m; this one is sourced.
    # NO APOSTROPHE IN THE KEY. LANDMARKS is matched against norm(name), which
    # strips everything outside [a-z0-9 ], so "saint andrew's cathedral" can
    # never match anything. Written with the apostrophe first and it silently
    # did nothing -- the cathedral stayed at its 16m guess through a rebuild.
    "saint andrews cathedral": {"h": 63, "key": True},
    "st andrews cathedral":    {"h": 63, "key": True},
    # 144m, and the 108 I set earlier was WRONG. Re-researched 2026-07-31
    # (research/raffles-parkview.md): NOTHING publishes ~108. CTBUH, Emporis,
    # SkyscraperPage, Structurae and Wikipedia's own refs all say 144m; the
    # project's facade consultant Meinhardt says 150. The 108 was roughly right
    # about the ROOF -- two photogrammetric measurements put the 24th-floor roof
    # at ~110m +-8 -- but above it sits a 31-37m ORNAMENTAL CROWN containing no
    # floors, and architectural height includes it.
    #
    # Built flat at 144 for now, which makes the crown solid. A recipe should
    # model it open: OSM already holds a seven-part 3D massing for this building
    # (relation 9621448) that this pipeline does not read, giving a tower slab
    # of 61.6 x 27.5m standing 59m back from North Bridge Road.
    "parkview square":        {"h": 144, "key": True},

    # People's Park Complex, 1 Park Road (1973, Design Partnership).
    # Researched 2026-07-31, research/chinatown-landmarks.md.
    # PUBLISHED 103 m: 31 storeys, 6 of podium plus a 25-storey slab. OSM tags
    # this footprint 25, which is the PODIUM ALONE on a polygon covering the
    # whole site -- the same trap as Bras Basah Complex, and it rendered
    # Singapore's first strata mega-structure as a six-storey box with 78m of
    # slab missing. The recipe draws the slab; it needs the height to draw it
    # against.
    #
    # NOT to be confused with People's Park CENTRE, 101 Upper Cross Street,
    # which is a different building. Keys here are substring-matched with
    # longest-key-wins, so both spellings must stay distinct -- this is exactly
    # how UOB Plaza ended up as three identical 280m cylinders.
    "peoples park complex":  {"h": 103, "key": True},
    "peoples park complex":   {"h": 103, "key": True},

    # LASALLE College of the Arts, McNally campus. Researched 2026-07-31,
    # research/lasalle-simlim.md. OSM carries building:levels=5 and the
    # published storey count is SEVEN, so the 17m we had was 9-12m short.
    # UNPUBLISHED: no metre figure exists for this building anywhere. 26m is the
    # research's estimate for the TALLEST block, reached by two independent
    # methods, class 25-30m. Here rather than in the recipe so the mass, the
    # audit and the ledger all read one number.
    "lasalle":                {"h": 26},

    # ---- Orchard Road frontage, researched 2026-07-31
    # (research/orchard-frontage-facades.md) ----
    #
    # Orchard 22 is the former MIDFILM HOUSE, 1921: a three-storey rendered
    # conservation shophouse with a Dutch scrolled gable, on a 333 m2 sliver.
    # OSM tags it height=40 AND building:levels=3 -- 13.3m per floor, which no
    # building has. The junk-tag guard only rejects heights under 2.5m, so the
    # 40 sailed through and put a 40-metre slab in a row of three-storey
    # shophouses. At 16m it also falls into the shophouse() path, which is what
    # it actually is.
    #
    # NOTE, measured while fixing this: 175 of the 1,421 buildings that carry
    # BOTH height and levels imply an implausible floor height. A general guard
    # was considered and REJECTED -- the ratio does not say which tag is wrong.
    # Hilton Singapore Orchard is height=90 levels=2, where the HEIGHT is right;
    # Orchard 22 is the reverse. Preferring either tag mechanically would
    # flatten real towers. Fix them individually, with a source.
    "orchard 22":             {"h": 16},
    # c.1902 two-storey conservation row, restored 1985. OSM says levels=2,
    # which is right, but the squat-footprint rule above overwrote the resulting
    # 6.8m with the commercial default of 30 on its 666 m2 footprint. ~11m with
    # its pitched roof. UNPUBLISHED, height class.
    "peranakan place":        {"h": 11},

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
    # THE SAME BUG, THE SAME AFTERNOON. One key for three towers of three
    # different heights. CTBUH (same archived snapshot, 2026-02-13):
    #   Tower 1  186.1m, 33 floors, flat   <- was drawn at 245m, 58.9m TOO TALL
    #   Tower 2  245m,   50 floors, flat   <- correct
    #   Tower 3  239.65m, 46 floors, and its roof is 216.12m with a 23.5m CROWN
    #            that we do not model at all
    # The generic key stays for the site and for unnamed parts; the numbered
    # keys are longer and win.
    "marina bay financial centre": {"h": 245, "key": True},
    "marina bay financial centre tower 1": {"h": 186.1, "key": True},
    "marina bay financial centre tower 3": {"h": 239.65, "key": True},
    # CTBUH 221.9, not 227. Marina Bay SUITES really is 226.9 and keeps its 227.
    "marina bay residences":  {"h": 221.9, "key": True},
    "marina bay suites":      {"h": 227, "key": True},
    # NOT "asia square": that name is the site OUTLINE, and giving the outline
    # the tower height made it swallow both of its own towers as buried
    # footprints. The towers carry their own names and their own heights.
    # (Asia Square tower heights live once, above: CTBUH 229 and 222. The 250
    # and 220 that used to sit here were a second, conflicting definition in the
    # SAME dict, so the later one silently won and T1 stood 21m too tall.)
    "the sail  marina bay":  {"h": 245, "key": True},
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
    "the ritzcarlton":       {"h": 130, "key": True},
    # The Millenia hotel carries NO name tag in OSM, so it is named late from
    # its postcode as "The Ritz-Carlton, Millenia Singapore" and the late
    # re-lookup fires on EXACT match only (see its note: the substring version
    # gave the Cairnhill Residences this hotel's 130m and was reverted). This
    # is the hand-written longer key that note prescribes -- without it the
    # 32-storey hotel draws at 10.2m. 130m published (CTBUH via
    # research/tanjongrhu-marinasouth.md).
    "the ritzcarlton millenia singapore": {"h": 130, "key": True},
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

    # DO NOT ADD "the pinnacle@duxton" HERE. Checked 2026-08-02 and the
    # obvious fix is wrong. The build log shows "The Pinnacle@Duxton 9,915 m2
    # h=24" and it looks like a 156m landmark drawn at twenty-four metres —
    # but that footprint is the PODIUM, and OSM separately carries two of the
    # seven towers ("The Pinnacle@duxton", lowercase d, 964 and 812 m2) at
    # h=150 from real tags against a published 156m roof. A LANDMARKS row
    # matches by substring, so it would give the 9,915 m2 podium ring the tower
    # height and extrude a 156m monolith over the whole site. The genuine gap
    # is that OSM maps only 2 of the 7 towers, which no height table can fix.
    # Published, for whoever picks this up: 50 storeys, 156m roof, 7 blocks,
    # sky bridges at the 26th and 50th storey, each 500m long, completed 2009.

    # ---- KALLANG / SPORTS HUB -------------------------------------------
    #
    # THESE ARE LOAD-BEARING, NOT DECORATION. HEIGHT_TAG_SUPPRESS drops the OSM
    # `height` tag across this bbox because it is fabricated, which makes
    # `building:levels` the fallback -- and the National Stadium is tagged
    # `building:levels=2`. Without a row here the suppression would draw the
    # largest object in the country about SEVEN METRES TALL, which is worse
    # than the wrong tag it removed. A suppression rule and its replacement
    # source are one change, not two.
    #
    # National Stadium: dome INTERNAL height 83m over a 310m clear span, the
    # world's largest free-spanning dome; 20,000 m2 of ultra-thin steel roof,
    # 8,057 tonnes, arch trusses 5m deep at the crown and 2.5m at the base on a
    # post-tensioned concrete ring beam. Arup (structure) with DP Architects.
    # The 310m span was carried as UNVERIFIED in the brief and is now confirmed
    # against Dezeen and the IES Journal paper "Designing the world's largest
    # dome". 83 is the height of the DOME, which is the thing a rider sees.
    "national stadium":       {"h": 83, "key": True},
    # 47m, "one of the tallest single-storey buildings in Asia", Kenzo Tange,
    # opened December 1989. Was UNPUBLISHED in the brief; closed against NLB
    # (T1). The cone roof is a Shinto-temple form, not a dome.
    "singapore indoor stadium": {"h": 47, "key": True},
    "indoor stadium":         {"h": 47, "key": True},
    # STILL UNPUBLISHED in metres, so these are DERIVED from the surveyed
    # storey count at a hall floor-to-floor, and they are marked key=False so
    # nothing treats them as researched figures. OCBC Aquatic Centre and Arena
    # are both `building:levels=4` over double-height halls; Kallang Wave is
    # tagged 1 level and is demonstrably multi-storey (its water play area is
    # on the THIRD storey and the climbing wall now being built goes to 21m
    # through the mall roof), so 3 levels is the floor, not the tag.
    "ocbc aquatic centre":    {"h": 24},
    "ocbc arena":             {"h": 24},
    "kallang wave":           {"h": 18},

    # ---- BEACH ROAD, and these were NOT caught by the suppression rule ----
    #
    # All three carry `height=0` in OSM, which the under-2.5m guard in
    # height_for() already refused long before this district existed -- so they
    # were falling through to a TYPE DEFAULT and would have been drawn at 22m
    # whatever happened with the Kallang height tags. Found by reading the
    # build's own "largest by footprint" table and not believing it.
    #
    # Golden Mile Complex: 89m, 16 storeys, 1973, Gan Eng Oon / William Lim /
    # Tay Kheng Soon of Design Partnership (now DP Architects). The stepped
    # terraced brutalist section held up by two end pillars is the whole point
    # of the building and it was being drawn as a 22m box -- SIXTY-SEVEN metres
    # short, on a gazetted conservation icon. [NLB BiblioAsia, Docomomo SG]
    "golden mile complex":    {"h": 89, "key": True},
    # Golden Mile Tower: 90m, 24 storeys, 1974. Different building, next door.
    "golden mile tower":      {"h": 90, "key": True},
    # The Concourse: 175m, 41-storey office tower over a 3-level retail podium
    # plus nine storeys of serviced apartments. Paul Rudolph with Architects 61,
    # completed 5 February 1994. This is the tallest thing in the district by a
    # wide margin and OSM says zero. [Paul Rudolph Foundation, Docomomo SG]
    "the concourse office tower": {"h": 175, "key": True},
    # ...and the COMPLEX footprint is the PODIUM, not a second tower. OSM maps
    # both: 4,801 m2 named "The Concourse" and 3,911 m2 named "The Concourse
    # Office Tower". Giving the published 175m to each drew two towers where
    # there is one. The published description is a 41-storey tower over a
    # THREE-LEVEL retail podium, so the complex ring gets the podium and the
    # tower ring gets the tower -- the same podium-and-tower split this file
    # already applies at Ngee Ann City and ION. Longest-match ordering makes
    # this safe: "the concourse office tower" beats "the concourse".
    "the concourse":          {"h": 15},
    # Concourse Skyline, 298-300 Beach Road, Hong Fok, completed 2013. THREE
    # towers stepping 20 -> 28 and 34 -> 40 storeys.
    #
    # NOW PUBLISHED: **150 m**, Wikipedia "List of tallest buildings in
    # Singapore" (research/kallang-landmarks.md, 2026-08-02). That replaces the
    # 128 that stood here, which was 40 storeys x 3.2m and honestly labelled as
    # DERIVED because no metre figure had been found. A published measurement
    # beats a derivation, so this is now key=True.
    #
    # AND THIS ENTRY HAD NEVER ONCE FIRED. The building was still being drawn at
    # a TYPE DEFAULT of 40m with `hs="guess"` -- see the note on late naming at
    # the re-lookup below. The old comment here spotted the coincidence that the
    # default happened to equal the storey count, but read it as the cause; the
    # cause was that LANDMARKS could not see this building's name at all.
    "concourse skyline":      {"h": 150, "key": True},
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
# PUBLISHED HEIGHTS KEYED BY POSTCODE, for buildings whose NAME cannot pick
# them out. UE Square carries the same name on two footprints -- the mall and
# the office tower -- so the name-keyed OVERRIDES table would set both to one
# number and raise a 65m mall to 91.6m to fix a tower. The postcode separates
# them: S239920 is the office tower, S239918 is the mall.
#
# These beat the OSM height tag, unlike HDB_STOREYS below, because they ARE
# published measurements from a better source rather than a storey count times
# an assumption -- so the caller returns "override", not "guess".
POSTCODE_HEIGHT = {
    # UE Square office tower, 83 Clemenceau Avenue. 91.60 m published by Tange
    # Associates, the architect's own works record. OSM tags this mass 85.
    # Researched 2026-07-30, research/robertson-rivervalley.md section 4.
    # The complex is branded UE BizHub CITY now; only the mall still trades as
    # UE Square.
    "239920": 91.6,
    # Cairnhill Nine's residential tower, 122m published by CapitaLand. Its OSM
    # way is unnamed, so no name key can reach it.
    "229723": 122,
}

# LOW BUILDINGS THAT ARE REALLY THAT LOW, NAMED ONE AT A TIME.
#
# The squat guard below replaces any height under 8m on a footprint over 600 m2
# with a type default, because a 3,000 m2 building 3.5m tall is a bad tag. It is
# right about most of them -- Tang Plaza, Liat Tower and Far East Shopping
# Centre are all tagged `building:levels=-1`. It is wrong about the genuinely
# low ones, and the note beside it says so: "Fix those individually with a
# source".
#
# This is that list. An entry is a claim that a REAL, SOURCED, low building
# stands on a large footprint, and each one cites what says so. Deliberately
# not a blanket exemption for explicit levels: that was considered and rejected
# because it would restore the -1s and flatten real towers.
SOURCED_LOW = {
    # 32 Beach Road, built 1952, conserved. OSM way 380512068 carries
    # building:levels=2 AND roof:levels=1, and Roots.gov.sg describes a
    # two-storey building. At 1,131 m2 the guard was replacing its 6.8m with a
    # 30m type default -- a two-storey 1950s services club drawn as a nine-
    # storey block. research/bugis-marina-guessed-heights.md.
    "nco club",
    # ELLISON BUILDING, 1924, the corner of Selegie Road and Bukit Timah Road.
    # Built by Isaac Ellison; curved facade, a semi-circular cupola at each end,
    # upper balconies, and a pediment carrying a Star of David and the year
    # 1924. Gazetted for conservation 5 December 2008. It is one of the most
    # recognisable buildings on Selegie Road and it stands on a street the rider
    # uses.
    #
    # THREE INDEPENDENT SOURCES SAY TWO STOREYS and they agree with each other:
    # OSM way 231927792 tags `building:levels=2`; Wikipedia says "two storeys";
    # Remember Singapore says "16 double-storey units". The guard was throwing
    # all three away — at 1,538 m2 the footprint is over the 600 m2 line and
    # 2 x 3.4 = 6.8m is under the 8m line, so a 1924 two-storey conserved
    # terrace was being drawn at TYPE_DEFAULT = 24m, which is about seven
    # storeys, with its height provenance honestly recorded as "guess".
    #
    # Identical in shape to the NCO Club above, and exactly what the note beside
    # the guard asks for: "Fix those individually with a source."
    "ellison building",
}


# PUBLISHED STOREY COUNTS, WHERE NO ONE PUBLISHES METRES.
#
# Most Singapore buildings below the skyline have no published height at all.
# Research comes back with "19 storeys [PUBLISHED]" and nothing else, over and
# over, and until now that answer had nowhere to go: LANDMARKS takes metres and
# claims "named" provenance, which would be laundering a storey count into a
# measurement -- the exact thing every research brief this project sends out
# forbids.
#
# So the storeys land here instead, get multiplied by the SAME 3.4m the OSM
# `building:levels` path uses, and carry the SAME "levels" provenance. The
# accuracy ledger already reports that tier separately as "heights, from
# storeys". Nothing is being dressed up: this is a published storey count times
# an assumed floor height, and it says so.
#
# It still beats what it replaces by a wide margin. Centrium Square is a
# 19-storey block on Serangoon Road being drawn as a 20m box, because 20 is
# TYPE_DEFAULT["retail"]-ish and nothing better existed.
#
# `amin`/`amax` disambiguate when one name covers footprints of very different
# size -- Tekka Place is a 10-storey main block and a 7-storey annex sharing a
# name, and giving both the taller figure would put a whole storey of mass over
# the annex's rooftop deck.
STOREY_COUNTS = {
    # research/littleindia-frontage-heights.md
    "centrium square":  [{"st": 19}],                       # officesolutions.com.sg
    # THE TWO BLOCKS WERE THE WRONG WAY ROUND (fixed 2026-08-01). The rule read
    # amin/amax 2700 on the assumption that the taller block is the bigger one.
    # It is not: the 10-storey main block on the Serangoon Road corner is the
    # SMALLER footprint at 2,446 m2, and the 7-storey block is the 3,083 m2
    # annex. Two independent confirmations, neither of them a guess about size:
    # OSM tags the 3,083 m2 way `amenity=parking, parking=multi-storey` — it is
    # the car park, and ONG&ONG's own description is "5 levels of parking" with
    # a rooftop deck — and Wikidata Q121834063's coordinate for "Tekka Place"
    # lands on the 2,446 m2 way, which is the one carrying Citadines Rochor
    # above. So the model had three storeys of mass on the wrong block, over the
    # annex's roof deck, on the corner a rider actually passes.
    "tekka place":      [{"st": 10, "amax": 2700},          # ONG&ONG: main block
                         {"st": 7,  "amin": 2700}],         # ONG&ONG: annex + roof deck
    # The developer's own page says 18; OSM's building:levels says 19. Prefer
    # the developer.
    "lyf farrer park":  [{"st": 18}],

    # ---- research/bugis-frontage-heights.md section 7
    # Bugis+ (the former Iluma) is TEN storeys -- The Straits Times, 21 Nov 2007,
    # reporting the $160m mall. OSM's building:levels says 7 and was winning, so
    # the whole Victoria Street corner stood three storeys short. No metre height
    # is published for it anywhere, so this stays a storey count.
    "bugis+":           [{"st": 10, "beats_osm": True}],

    # ---- research/heights-mixed.md section 7
    # Valley Point is ONE OSM footprint covering two very different things:
    # "a 20-storey office tower" over "a 2-storey shopping centre", both stated
    # by the owner (Frasers Property's own commercial portfolio page) and by the
    # building's own site. No metre height is published for either.
    #
    # As a single 20m box it was wrong twice over -- three times too tall for
    # the mall that fills the 6,570 m2 footprint, and a third the height of the
    # tower that actually stands on it. The storey count puts the tower on the
    # skyline where it belongs; the recipe below shapes the podium under it.
    "valley point":     [{"st": 20}],

    # ---- research/orchard-frontage-facades.md, the height-corrections table
    # Nine storeys. 30 was TYPE_DEFAULT for a commercial footprint with no
    # tags at all -- OSM way 260954106 carries neither height nor levels.
    "orchard shopping centre": [{"st": 9}],
    # 20 storeys, from the owner's own split of the 1992 redevelopment: a
    # 20-storey commercial tower with the retail podium opened as The Heeren
    # Shops in 1997. Metres UNPUBLISHED anywhere.
    "the heeren":       [{"st": 20}],

    # ---- research/littleindia-temples.md section 3
    # 265 Serangoon Road. The 1970 mosque was DEMOLISHED and a new four-storey
    # block built 2018-2020 under the Mosque Upgrading Programme -- MUIS's own
    # fact sheet, 23 Feb 2018, in the National Archives. OSM carries neither a
    # height nor a level count, so this stood at the 20m type default. Only the
    # 1890s gatehouse is historic; there is no street-visible dome.
    "masjid angullia": [{"st": 4}],
    # THREE storeys, and OSM's height=40 on this way is simply an error: it is
    # a conserved shophouse block on Orchard Road. `beats_osm` because the tag
    # is the thing being corrected. The recipe draws 15.7m of detail on top of
    # whatever mass this gives, and a 40m mass behind a 15.7m facade is the
    # kind of mismatch that reads as a wall growing out of a shophouse.
    "temasek shophouse": [{"st": 3, "beats_osm": True}],

    # ---- research/orchard-hinterland.md
    # 34 storeys, 65 Cairnhill Road, TOP 2011. Standing at the 20m retail
    # default, which is what TYPE_DEFAULT gives a 737 m2 footprint with no tag.
    "ritz-carlton residences": [{"st": 34}],

    # ---- research/cbd-podium-geometry.md
    # 89.00m architectural is PUBLISHED (CTBUH 14115 + Skyscraper Museum/WOHA)
    # so this one does not belong in the storey table at all -- it is in
    # LANDMARKS above. Listed here only so the next reader does not add it.
    #   "parkroyal collection pickering": 89m, see LANDMARKS

    # ---- research/robertson-district-heights.md
    # 40 occupied levels. The 39-vs-40 conflict in the sources is not a
    # conflict: flats stop at L39 and L40 is the rooftop facility deck.
    # OSM names it "Alex Residence"; the building is "Alex Residences".
    "alex residence":   [{"st": 40}],
    # 41 vs 43 across aggregators. 41 is the better bet -- the sources saying
    # 43 also say "2 blocks", which OneMap contradicts and our own data
    # contradicts (three footprints), so that pair looks like one stale
    # datasheet copied around. Taken as weak, and 41 over the 40m residential
    # default is an improvement either way.
    "echelon":          [{"st": 41}],

    # SINGLE-STOREY MARKET HALLS, standing at 20 and 30 metres.
    #
    # These are the type defaults for a big footprint with no tag, and they put
    # a 2,394 m2 hawker centre up as a ten-storey block on Redhill Lane. HDB's
    # own dataset says one storey, completed 2005.
    #
    # `per` overrides the floor height because a market hall is ONE TALL VOLUME,
    # not a residential storey -- the same reasoning the HDB join already
    # applies to market_hawker blocks, and for the same reason: 3.4m would be
    # shorter than the building's own roof trusses.
    # ---- research/rivervalley-guessed-heights.md, all [PUBLISHED] storeys.
    # Nine of these were standing at a hotel or residential type default that
    # was out by a factor of two in one direction or the other.
    "mirage tower":              [{"st": 33}],   # was 40m, is 33 storeys
    "great world serviced":      [{"st": 34}],   # was 20m
    "aspen heights":             [{"st": 16}],   # was 40m, two blocks
    "seng kee building":         [{"st": 10}],   # was 20m
    "the inspira":               [{"st": 13}],   # was 20m; three-winged plan
    "king's centre":             [{"st": 8}],    # was 55m
    "park regis":                [{"st": 7}],    # was 55m, GHDWoodhead
    "robertson house":           [{"st": 10}],   # was 55m
    "the pier at robertson":     [{"st": 10}],   # was 40m
    "copthorne king's hotel":    [{"st": 12}],   # was 55m
    "hotel miramar":             [{"st": 16}],   # was 55m; closed Oct 2025
    # New Bahru, the former Nan Chiau High School. OSM calls it "Big Block",
    # which IS one of its blocks rather than an invention, so the name stays.
    "big block":                 [{"st": 5}],    # was 22m
    # Zion Riverside Food Centre: a 1976 open hawker shed on the Alexandra
    # Canal, not a building on the river. One storey and tall with it.
    "zion riverside":            [{"st": 1, "per": 6.5}],
    # Zyon Galleria is NOT BUILT. It is Zyon Grand's retail deck, under
    # construction, one storey over three basements with a grass roof. Modelled
    # at 24m it was a mall that does not exist yet.
    "zyon galleria":             [{"st": 1, "per": 6.0}],

    # ---- research/bugis-marina-guessed-heights.md, published storeys
    "peninsula plaza":           [{"st": 30}],   # was 22m
    "bugis junction tower":      [{"st": 15}],   # was 20m
    "raffles hospital":          [{"st": 13}],   # was 18m
    "guoco midtown office":      [{"st": 30}],   # was 45m
    "midtown bay":               [{"st": 32}],   # was 40m

    # ---- research/orchard-guessed-heights.md. No published METRE height exists
    # for any of these; the storey counts do, and every one of them was
    # standing on a type default.
    "block 9":                   [{"st": 30}],   # Ardmore Park Block 9, was 45m
    "the st. regis singapore":   [{"st": 23}],   # CTBUH; was 55m
    "saint regis residences":    [{"st": 23}],   # both towers; was 40m
    "artyzen singapore":         [{"st": 20}],   # operator's own site; was 55m
    "orchard rendezvous":        [{"st": 17}],   # was 55m
    "cavenagh house":            [{"st": 14}],   # was 45m
    "8 @ mount sophia":          [{"st": 12}],   # was 20m
    "regency house":             [{"st": 10}],   # was 45m
    "alfa centre":               [{"st": 9}],    # weakest figure in the set
    "mama shelter":              [{"st": 7}],    # was 55m
    "siew building":             [{"st": 6}],    # OSM's name; it is Boon Siew Building
    "the tanglin club":          [{"st": 4}],    # was 20m
    "tanglin place":             [{"st": 4}],    # was 20m
    "cairnhill arts centre":     [{"st": 3}],    # was 20m
    "david elias":               [{"st": 3}],    # was 20m
    "sri temasek":               [{"st": 2}],    # in the Istana grounds; was 20m
    # A single-storey building over a big plan, and a conserved one: the
    # Teochew mansion is one storey plus a 2-storey 1906 dormitory wing.
    "house of tan yeok nee":     [{"st": 1, "per": 8.0}],
    # One storey plus the cupola on its tower. The church recipe adds the tower.
    "orchard road presbyterian": [{"st": 1, "per": 9.0}],

    # ---- research/robertson-district-heights.md
    # OSM tags Mill Point height=30, which over 19 storeys is 1.6m a floor and
    # cannot be right; the storey count beats the tag here. Flagged weak: one
    # source says 20.
    # `beats_osm` because OSM tags this height=30 and 30m over 19 storeys is
    # 1.6m a floor -- shorter than a door. The standing rule is that a storey
    # count NEVER displaces a surveyed metre figure, and that rule is right;
    # this is the documented exception, where the "measurement" is refuted by
    # the building's own storey count. Flagged weak either way: one source says
    # 20 storeys.
    "mill point":                [{"st": 19, "beats_osm": True}],
    # SEAB's own Annual Report 2019/20: "The nine-storey building...". SLEB says
    # 8, probably excluding a plant level. Was standing at the 20m civic
    # default.
    "singapore examinations":    [{"st": 9}],
    # Central block 3 storeys, flanking wings 2, read off the MFA elevation
    # photograph. No published text figure exists, so this is the weakest entry
    # in the table and is still better than a 20m box on a 2,146 m2 footprint.
    "high commission of brunei": [{"st": 3}],

    "redhill wet market":               [{"st": 1, "per": 7.5}],
    "beo crescent food centre":         [{"st": 1, "per": 7.0}],
    "havelock road cooked food centre": [{"st": 1, "per": 7.0}],
}
STOREY_FLOOR_M = 3.4


def storey_record(name, area):
    lo = (name or "").lower()
    for key, specs in STOREY_COUNTS.items():
        if key not in lo:
            continue
        for sp in specs:
            if area < sp.get("amin", 0) or area > sp.get("amax", 1e12):
                continue
            return sp["st"], sp.get("per", STOREY_FLOOR_M), sp.get("beats_osm", False)
    return None


# BUILDING NAMES FROM POSTCODES, resolved by data/postcode_names.py.
#
# A Singapore postcode identifies ONE building and SLA's OneMap is the authority
# on which. 888 footprints across the eight districts carry `addr:postcode` and
# no name; 133 of those postcodes resolve to a real building name -- Marina Bay
# Fire Station, the Ritz-Carlton Millenia, Customs House, China Square Food
# Centre -- and every one of them was being drawn as anonymous fabric that no
# recipe and no researched fact could ever reach.
#
# The other 593 answer NIL, which is CORRECT and is left alone: a shophouse is
# an address, not a named building, and being unnamed is exactly what routes it
# to the shophouse path instead of the landmark one.
_PC_NAMES = None
_PC_NAMED = []


def postcode_name(tags):
    """The building name OneMap gives for this footprint's postcode, or None."""
    global _PC_NAMES
    if _PC_NAMES is None:
        pth = os.path.join(HERE, "postcode_names.json")
        try:
            _PC_NAMES = json.load(open(pth))
        except Exception:
            _PC_NAMES = {}
    pc = (tags.get("addr:postcode") or "").strip()
    rec = _PC_NAMES.get(pc)
    if not rec:
        return None
    nm = rec.get("name")
    if not nm:
        return None
    up = nm.upper()
    # AN AREA IS NOT A BUILDING. OneMap answers some postcodes with the
    # gazetted conservation area they sit in -- "KRETA AYER CONSERVATION AREA",
    # "BOAT QUAY CONSERVATION AREA" -- and attaching that to one shophouse
    # would put a district's name on a single footprint and let it reach
    # landmark recipes as if it were a building.
    if up.endswith("CONSERVATION AREA"):
        return None
    # Generic descriptions are not names either: a recipe keyed on a name would
    # be matching a building type.
    if up in {"MULTI STOREY CAR PARK", "MULTI-STOREY CAR PARK", "CAR PARK"}:
        return None
    # "(U/C)" is OneMap saying under construction, not part of the name.
    nm = nm.replace("(U/C)", "").replace("(u/c)", "").strip(" -–")
    if not nm:
        return None
    return _titlecase_sg(nm)


# OneMap answers in capitals and this world's signage is mixed case. Keep the
# small joining words down, keep anything that is already an acronym up, and do
# not touch what follows an apostrophe.
_SMALL = {"a", "an", "and", "at", "by", "de", "for", "in", "of", "on", "the", "to"}
_KEEP_UP = {"II", "III", "IV",   # roman numerals: "River Peaks Ii" was live
            "HDB", "NTUC", "SMU", "NUS", "UOB", "OCBC", "DBS", "MRT", "JTC",
            "URA", "PSA", "SPH", "AXA", "IOI", "OUE", "CPF", "MAS", "SIA"}


def _titlecase_sg(s):
    out = []
    parts = s.split()
    for i, w in enumerate(parts):
        core = w.strip("(),.")
        if core.upper() in _KEEP_UP:
            out.append(w.upper())
            continue
        lw = w.lower()
        if i and lw.strip("(),.") in _SMALL:
            out.append(lw)
            continue
        # hyphenated names capitalise both halves: Ritz-Carlton, Toa-Payoh
        out.append("-".join(seg[:1].upper() + seg[1:] for seg in lw.split("-")))
    return " ".join(out)


# IDENTITY KEYED BY OSM WAY ID, for buildings that carry no name at all.
#
# The whole western reach of River Valley Road -- Kim Seng to Zion -- was
# anonymous fabric: 680 buildings, 5% of the frontage named, 0% reaching a
# recipe, the worst-scoring district in the world. research/rivervalley-road-
# frontage.md identified every one of the seventeen unnamed frontage footprints
# from OneMap and the developers' own records.
#
# None of them can be reached by any table already here. They have no `name`
# tag for the name-keyed tables, and only five of the fifteen postcodes are in
# our extract, so POSTCODE_HEIGHT cannot see them either. The OSM way id is the
# only key that reaches all of them.
#
# THE RISK, STATED: a way id is not stable the way a postcode is. If a mapper
# redraws a footprint the id changes and this entry silently stops matching --
# so it does not fail silently. Any id here that is absent from the extract is
# reported at build time, loudly, the same way a dead LANDMARKS key is.
#
# `st` is a PUBLISHED STOREY COUNT, not metres, and goes through the same
# 3.4m-per-floor path with the same "levels" provenance as every other storey
# count in this file. `yr` is only present where a completion year is actually
# published; where sources conflict (Crystal Court, 1983 vs 1988) an era BAND
# is given instead, because a band is what is known.
_OSM_WAY_SEEN = set()
# THE SAME HANDLE, FOR A MULTIPOLYGON. OSM_WAY below is keyed on way ids and
# the lookup that reads it is gated on `type == "way"`, so a building that OSM
# holds as a RELATION cannot be reached by it at all — and the island's biggest
# unnamed footprint is exactly that. Kept as a separate table rather than mixed
# into OSM_WAY because way ids and relation ids are different namespaces and a
# collision between them would be silent.
#
# Researched 2026-08-04; every figure carries its source. These arrived in the
# scene for the first time with data/relgeom.py — before that their geometry
# never reached the pipeline, so there was nothing to key on.
OSM_REL = {
    # Sofitel Singapore Sentosa Resort & Spa. 211 rooms in two wings on a 27-acre
    # clifftop site; the footprint is a 19,226 m2 ring of linked pavilions around
    # nine courtyards, which is a LOW building, and OSM tags building:levels=2.
    # Aggregators say "five floors" with no primary source, so the survey wins.
    # sofitel.accor.com / OSM building:levels.
    2177128: {"n": "Sofitel Singapore Sentosa Resort & Spa", "st": 2},
    # Amara Sanctuary Resort Sentosa, 2007, on the 1930s Larkhill barracks.
    # OSM tags the arrival block building:levels=3; the second block is the
    # restored two-storey barracks terrace. sentosa.amarahotels.com.
    2182899: {"n": "Amara Sanctuary Resort Sentosa", "st": 3},
    2182898: {"st": 2},
    # Sentosa Golf Club clubhouse. Named in OSM already; left unsized, because
    # no storey count for it is published anywhere I could find.
}

OSM_WAY = {
    # --- Sentosa resorts, researched 2026-08-04. All three stood at the
    # calibrated 23.8m — seven storeys — on buildings whose whole character is
    # that they are low. That is the single most visible height error left on
    # the island, because these are its most photographed buildings.
    #
    # Capella Singapore, Foster + Partners with DP Architects, opened 2009.
    # TWO footprints and the geometry tells them apart on its own: 116818220 is
    # 32 right angles and no curves — the restored 1880s Tanah Merah colonial
    # blocks, two storeys under a steep pitched roof. 116818069 is 61 gentle
    # turns and 3 right angles — the curved Foster wings, which Foster describe
    # as topping out LEVEL WITH the Tanah Merah ridge with a shallow-curved
    # canopy over one more storey. fosterandpartners.com / Wikipedia.
    # NAME THE ONE THAT IS ACTUALLY HERE. Measured after the first attempt:
    # 116818220, the colonial block, is NOT in this extract — nothing near
    # Capella has its 1,917 m2 — so a name hung on it reached nothing, and the
    # island's most famous hotel stayed an unnamed 3,607 m2 mass while seven
    # 235-317 m2 villas of The Club at Capella carried the label instead.
    # The curved Foster wings ARE here, at 67 vertices against the surveyed 70,
    # so the name goes where the building is. The entry below stays for the
    # colonial block in case a later extract reaches it.
    116818220: {"st": 2},
    116818069: {"n": "Capella Singapore", "st": 3},
    # ONE°15 Marina Sentosa Cove, opened 2007. Already named in OSM. Its
    # building:parts carry the real massing — a 6-storey north block stepping
    # down to 3 and then 2 at the water — and the parts are not read by this
    # pipeline, so the main block's figure goes on the whole footprint.
    # one15marina.com / OSM building:part levels.
    159582891: {"st": 6},
    # W Singapore Sentosa Cove, opened September 2012, WATG. OSM tags this
    # footprint building:levels=7 on both the outline and its 3D part, and it
    # carries addr 21 Ocean Way / 098374, which OneMap gives as W SINGAPORE
    # SENTOSA COVE HOTEL. marriott.com / businesswire.com.
    764585959: {"n": "W Singapore Sentosa Cove", "st": 7},

    # --- RWS north shore: the Waterfront Lifestyle Development worksite.
    # research/rws-architecture.md sections 3.1, E4 and 6.10, from 2025-2026
    # photography and satellite.
    #
    # 165365230 is an unnamed 832 m2 `building=yes` at -1276,11944 — 166 m EAST
    # of the Singapore Oceanarium, which puts it inside the ~300 m of shoreline
    # the research measures as the worksite. We extrude it to 23.8 m, the
    # calibrated default, and the research says of this exact stretch: **"No
    # superstructure above hoarding height"**, and that the Crane Dance lake and
    # its promenade **"are now piling deck, excavation and reclamation extending
    # into the water"**. Nothing 23.8 m tall stands there.
    #
    # This is One Sophia's case with no name to catch it by: a footprint left
    # behind by something that was cleared. It gets the same answer — `con`,
    # so `constructionSite()` draws the site rather than asserting a building.
    #
    # AND IT IS NOT AN `OVER_WATER` ENTRY, WHICH IS WHAT IT LOOKED LIKE FIRST.
    # The raw Copernicus DEM reads 0.0 across every vertex and the centroid, and
    # it is right about that in the sense that the water mask predates the fill
    # — the SAME rule flags the Marina Bay Cruise Centre Passenger Terminal at
    # 10,008 m2, which stands on made ground. Reclamation is why the DEM says
    # water, so sinking the sea under this footprint would be the wrong fix and
    # a visible one. See SESSION 17 batch 5.
    #
    # Re-check when the tags are refetched: when the development completes this
    # entry becomes wrong and should be replaced by the real building.
    165365230: {"con": 1},

    # --- research/mustafa-centre.md section 5
    # Mustafa Centre is FOUR footprints and OSM gives all four building:levels=5.
    # The research keeps storeys and metres deliberately apart and finds only one
    # PUBLISHED correction: the new south-east wing at 171 Syed Alwi Road has a
    # rooftop restaurant carrying unit number #07-00, so it is at least seven
    # storeys above ground -- it is visibly the tallest part of the complex and
    # was being drawn the same height as the 1980s blocks beside it.
    #
    # The other three (145, 147, 151) are left at OSM's 5. The research offers
    # only photograph-based estimates for them, and an estimate is not a reason
    # to overwrite a survey.
    178437069:  {"st": 7},

    # --- the seventeen, research/rivervalley-road-frontage.md PART 1
    # RV Suites already carries its name in OSM; this adds only the year.
    178594778:  {"n": "RV Suites",              "st": 7, "era": (2011, 2012)},
    543153088:  {"n": "Loft @ Nathan",          "st": 7, "yr": 2014},
    # OSM tags this way 2 Shanghai Road / 248209, which is RV Edge 55m away.
    # OneMap puts STELLAR RV on this footprint, 3m from its centroid.
    178594851:  {"n": "Stellar RV",             "st": 7, "yr": 2015},
    # "completed 1988" and "Built Year 1983" both circulate; neither is primary.
    # OUTSIDE THE DISTRICT'S WESTERN EDGE (bbox starts at lon 103.8280) and so
    # not in the world at all: Crystal Court 103.82700, Loft @ Nathan
    # 103.82766, RV Residences blk 471 103.82781, and the 460-486 terrace at
    # 103.826xx. They are kept here, correct and sourced, because the research
    # covers the whole Kim Seng -> Zion reach and the bbox may yet be widened;
    # the build reports them as unmatched every time until it is.
    178594898:  {"n": "Crystal Court",          "st": 4, "era": (1983, 1988)},
    178594827:  {"n": "River Valley Apartments", "st": 4, "yr": 1970},
    # RV Residences: six near-identical blocks stepping down the slope, one
    # development, completed 2015. OSM says building:levels=7.5 on four of
    # them, which is a mapper writing "seven plus a roof structure"; it is 7.
    1285894309: {"n": "RV Residences",          "st": 7, "yr": 2015},
    1285894305: {"n": "RV Residences",          "st": 7, "yr": 2015},
    1285894304: {"n": "RV Residences",          "st": 7, "yr": 2015},
    1285894306: {"n": "RV Residences",          "st": 7, "yr": 2015},
    1285894308: {"n": "RV Residences",          "st": 7, "yr": 2015},
    1285894307: {"n": "RV Residences",          "st": 7, "yr": 2015},
    178594948:  {"n": "RV Edge",                "st": 7, "era": (2012, 2013)},
    542171515:  {"n": "RV Edge",                "st": 7, "era": (2012, 2013)},
    # The two shophouse terraces. No published name and no published year, so
    # they get storeys only -- the thing that is actually known. OSM models the
    # 460-486 run as ONE way; SLA numbers fourteen addresses along it.
    453942380:  {"st": 2},
    178594846:  {"st": 4},

    # --- research/harbourfront-landmarks.md PARTS 1 and 3, applied 2026-08-02.
    #
    # THE THREE BIGGEST THINGS IN THIS DISTRICT ALL CARRY `height=0` IN OSM.
    # The tag is correctly refused, but refusing it only drops them into a type
    # default — so harbourfront's largest footprint, its office tower and its
    # second office tower were all standing at a guess. That is the district's
    # single largest visual error and the brief says so in as many words.
    #
    # VivoCity. 66,246 m2, no `name` tag at all, drawn at a guessed 22m.
    # 35.80m is the ONLY height in metres published for it anywhere the
    # research could reach: Emporis 317866, and the brief flags the fragility
    # of that source out loud — Emporis shut down in 2022 and the figure now
    # survives only through the search index. It is consistent with the other
    # published facts (7 floors above ground, a car park reaching level 7), and
    # it is reported as the published figure rather than replaced with an
    # arithmetic guess. Mapletree's own fact sheet says "3 storeys and 2
    # basements with an 8-storey carpark", which is the same building.
    #
    # NOT DONE HERE, and deliberately: the brief also shows the 66,246 m2 way
    # is BIGGER THAN THE ENCLOSED BUILDING — GFA 142,854 m2 over 5 levels
    # averages ~28,600 m2 a level — so it takes in the open Promenade and
    # Plaza, and extruding all of it doubles VivoCity's bulk. Trimming a
    # surveyed ring to a computed area is a different and much riskier change
    # than correcting a height, and it wants its own vet pass.
    46671408:   {"n": "VivoCity", "m": 35.8},
    # Keppel's own site: an 18-storey office tower on a 6-storey podium.
    47418846:   {"n": "Keppel Bay Tower", "st": 18, "yr": 2002},
    # 18-storey tower on a 5-storey podium. Also `height=0` in OSM.
    47418847:   {"n": "HarbourFront Tower One", "st": 18},
    # CHIJ St. Theresa's Convent, 160 Lower Delta Road — the anonymous
    # 9,268 m2 mass. NAME ONLY. Its height is UNPUBLISHED and this table will
    # not invent one: the entry moves it from "a big grey block" to a named
    # building and leaves the height exactly where it was.
    172094340:  {"n": "CHIJ St. Theresa's Convent"},
    # The cruise terminal MOVED on 7 July 2026 to this new two-storey building
    # at 5 HarbourFront Avenue, and this world models 2026. Two floors is the
    # published figure (ground: check-in and baggage; second: immigration).
    #
    # A CAVEAT THAT IS PART OF THE FACT: run through this file's STOREY_FLOOR_M
    # of 3.4 that is 6.8m, and a cruise hall has taller floors than an office
    # does, so this is probably short. It replaces a 20m GUESS — six storeys
    # for a building published as two — and it carries "levels" provenance
    # saying exactly what it is derived from. Inventing a terminal-sized floor
    # height to split the difference is the thing this project does not do.
    1529989581: {"st": 2},
}


# NAMES OSM CARRIES THAT ARE NOT BUILDING NAMES.
#
# Three different mistakes, all of which make the model claim something false:
#
#   a SHOP TENANCY mapped as if it were a building. "Joyalukkas" is a jeweller
#   with units at the base of an older cream apartment block on Serangoon Road
#   and a second unit inside Centrium Square; OneMap has no such building.
#
#   a SALES GALLERY that has been demolished. "Parksuites Showflat" is a name
#   bolted onto a 2012 Bing trace in October 2021, and the only Parksuites in
#   Singapore is on Holland Grove Road, 5.5 km away. "Canninghill Piers
#   Showflat" is the same class: the development it sold has been completed.
#
#   a NAME OSM INVENTED. "FDAWU Tower" -- OneMap holds no building name for
#   279 River Valley Road at all, and the address itself is wrong in OSM.
#
# All three are dropped rather than corrected, because the honest state is that
# we do not know what these footprints are called. An unnamed block is honest
# background; a wrong name is a claim. Sources in research/rivervalley-towers.md
# and research/littleindia-frontage-heights.md.
NAME_STRIP = (
    "joyalukkas",
    "parksuites showflat",
    "canninghill piers showflat",
    "fdawu tower",
    # research/orchard-guessed-heights.md: SLA has no campus of this name
    # anywhere near that footprint, and the OSM way is addressed to 50A Lloyd
    # Road. We do not know what it is.
    "odyssey the global preschool",
)

# Structures that begin in the air, where OSM records no min_height. Without
# this a bridge deck is extruded from the ground and stands as a needle.
LANDMARK_MIN_HEIGHT = {
    # CanningHill Piers' sky bridge links the two towers at the top of the
    # 24-storey north-east tower, which CDL and CapitaLand publish at 100m.
    # Our footprint is 143 m2 and was being drawn as an 82m column of solid
    # mass -- a tower where a bridge is. research/rivervalley-towers.md is
    # explicit that this object "really is the sky bridge and must not be
    # inflated into a tower". Deck depth is not published; 6m is a judgement.
    "canninghill piers skybridge": (94.0, 100.0),
}

# BUILDINGS NAMED AND SIZED BY SURVEYED COORDINATE, BECAUSE OSM NAMES NONE OF
# THEM.
#
# Tanjong Rhu is two kilometres of 1990s waterfront condominium and it is the
# whole character of the district — and NOT ONE of Pebble Bay, Costa Rhu, Water
# Place, Sanctuary Green, Casuarina Cove, Camelot by-the-Water, Tanjong Ria or
# Parkshore carries a `name` tag. They exist only as unnamed footprints inside a
# `landuse=residential` polygon, so the LANDMARKS table above — which matches on
# name — can never reach them, and the whole wall renders at a type default.
#
# Coordinates are SLA OneMap / Nominatim (T1). STOREYS are portal data (T4) and
# EVERY METRE HEIGHT IS UNPUBLISHED, so heights here are DERIVED at a 3.1m
# residential floor-to-floor plus a roof-plant allowance, and are recorded as
# derived — `hs` says "site", never "osm" and never "named". Do not let these
# be quoted back as surveyed figures: that is the Raffles Hospital mistake,
# where our own levels x 3.4 was laundered into a brief as an OSM survey.
#
# Where a development lists several storey counts the LOWEST credible published
# figure is used, because over-tall is the more visible error against a
# waterfront skyline the brief is explicit about:
#   "THE TALLEST RESIDENTIAL MASS IN TANJONG RHU IS HDB, NOT THE CONDOMINIUMS.
#    Any skyline that puts the condos on top is wrong."
# The 27-30 storey HDB blocks already come through correctly from OSM levels.
#
# (lat, lon, name, storeys, radius_m) — every unnamed footprint within `radius`
# of the point takes the name and the height, because a development is a
# cluster of blocks around one address, not a single ring.
SITE_HEIGHTS = [
    (1.29758, 103.88309, "The Waterside",          23, 90),
    (1.29757, 103.87159, "Pebble Bay",             16, 90),
    (1.29639, 103.86688, "Costa Rhu",              17, 95),
    (1.29655, 103.87250, "Water Place",            20, 80),
    (1.29592, 103.87101, "Sanctuary Green",        15, 90),
    (1.29770, 103.87447, "Casuarina Cove",         14, 70),
    (1.29749, 103.87563, "Camelot by-the-Water",   19, 60),
    (1.29691, 103.87453, "Tanjong Ria",            17, 55),
    (1.29667, 103.87063, "Parkshore",              14, 55),
    (1.29858, 103.88433, "The Line @ Tanjong Rhu", 20, 45),
    (1.29884, 103.88383, "Crystal Rhu",            16, 40),
    (1.29918, 103.88383, "Palazzetto",             18, 40),
    (1.29962, 103.88378, "Emerald East",           18, 40),
    (1.29881, 103.88435, "De Centurion",           16, 40),
    (1.29867, 103.88480, "Fulcrum",                24, 40),
    # RWS hotels by PUBLISHED STOREYS (2026-08-03 research; no RWS building
    # has a metre height anywhere — Graves/Wikipedia/CDL all publish storeys
    # only, and this table exists precisely so storeys are never laundered
    # into fake metre provenance). Crockfords: sources conflict 9 vs 11; the
    # architect's own page says 9 and is the authority on his building.
    (1.25866, 103.81679, "Equarius Hotel",         7, 120),
    (1.25592, 103.82033, "Hotel Michael",          11, 90),
    (1.25623, 103.81957, "Crockfords Tower",       9, 70),
]

# NAME-ONLY SITES — sets `n` and NOTHING else, for buildings whose height is
# honestly unpublished (SITE_HEIGHTS requires storeys; inventing them is the
# thing this project does not do). Every row was verified point-in-polygon
# against a named OSM polygon or address on disk (agent pass, 2026-08-03):
# 43 rows, 57 footprints, zero misfires; radii chosen against the nearest
# neighbour that must NOT match (Cantonment blocks are 45m apart -> r 22).
SITE_NAMES = [
    (1.27047, 103.82741, "Keppel Distripark Blk 519", 35),
    (1.27230, 103.82942, "Keppel Distripark Blk 513", 35),
    (1.27120, 103.82853, "Keppel Distripark Blk 511", 35),
    (1.26911, 103.82761, "Keppel Distripark Blk 517", 35),
    (1.27181, 103.83652, "SAM at Tanjong Pagar Distripark", 40),
    (1.27188, 103.83817, "Tanjong Pagar Distripark", 40),
    (1.27584, 103.83905, "Cantonment Towers", 22),
    (1.27443, 103.83970, "Cantonment Towers", 22),
    (1.27449, 103.84013, "Cantonment Towers", 22),
    (1.27392, 103.84034, "Cantonment Towers", 22),
    (1.27382, 103.83988, "Cantonment Towers", 22),
    (1.27389, 103.83947, "Cantonment Towers", 22),
    (1.27386, 103.83902, "Cantonment Towers", 22),
    (1.27740, 103.83932, "Everton Park Blk 2", 18),
    (1.27719, 103.83857, "Everton Park Blk 3", 18),
    (1.27688, 103.84014, "Everton Park Blk 4", 18),
    (1.27665, 103.83943, "Everton Park Blk 5", 18),
    (1.27664, 103.83865, "Everton Park Blk 6", 18),
    (1.27701, 103.83938, "Everton Park Blk 7", 18),
    (1.27667, 103.82907, "Avenue South Residence", 30),
    (1.27678, 103.82972, "Avenue South Residence", 30),
    (1.27565, 103.83667, "Spottiswoode Residences", 28),
    (1.27603, 103.83744, "Spottiswoode Suites", 28),
    (1.27547, 103.83749, "Spottiswoode 18", 30),
    (1.27576, 103.83818, "Sky Everton", 28),
    (1.29933, 103.88251, "Dunman High School", 45),
    (1.30016, 103.88292, "Dunman High School", 40),
    (1.29692, 103.88113, "Singapore Swimming Club", 100),
    (1.30141, 103.88215, "Performance Motors BMW East Coast Centre", 45),
    (1.30204, 103.88612, "Katong Swimming Complex", 35),
    (1.30516, 103.85633, "River Peaks I", 60),
    (1.30415, 103.85529, "River Peaks II", 50),
    (1.30415, 103.85720, "Stamford Primary School", 40),
    (1.31222, 103.85062, "Farrer Park Primary School", 45),
    (1.30975, 103.85994, "Jalan Besar Stadium", 45),
    (1.31153, 103.85680, "City Square Mall", 45),
    (1.31286, 103.85400, "Connexion", 40),
    (1.31075, 103.86001, "Jalan Besar Swimming Complex", 35),
    (1.30976, 103.85116, "Farrer Park Fields", 45),
    (1.31123, 103.84981, "Farrer Park Arena", 40),
    (1.30435, 103.85081, "Village Hotel Albert Court", 35),
    (1.30475, 103.85764, "Madrasah Aljunied Al-Islamiah", 35),
    (1.30851, 103.85920, "Former Victoria School", 15),
]
# Coordinate-scoped RENAMES for names that are WRONG at one place only.
# NAME_CORRECTIONS cannot carry these: keying "pinnacle @ duxton" by name
# would rename the real Pinnacle's seven towers. One shipped case: the 1965
# HDB slab at 1 Everton Park wears "Pinnacle @ Duxton" because OneMap answers
# its postcode 080001 with "1 CANTONMENT ROAD PINNACLE @ DUXTON".
SITE_RENAMES = [
    (1.27716, 103.84000, "Everton Park Blk 1", 18, "Pinnacle @ Duxton"),
    # RWS 2025 rebrands OSM has not caught up with (2026-08-03 research):
    # Hard Rock Hotel closed 5 Aug 2025, reopened October 2025 as The Laurus,
    # a Luxury Collection Resort; The Forum/Festive Walk retail complex
    # reopened July 2025 as WEAVE (Benoy, 3 levels, 20,000 m2).
    (1.25827, 103.81905, "The Laurus", 80, "Hard Rock Hotel Singapore"),
    (1.25764, 103.82018, "WEAVE", 150, "The Forum"),
    (1.25764, 103.82018, "WEAVE", 150, "Festive Walk"),
    (1.25764, 103.82018, "WEAVE", 150, "The Galleria"),
]

SITE_FLOOR_M = 3.1
SITE_PLANT_M = 2.5

HDB_STOREYS = {
    "210661": 23,    # Buffalo Road, corridor-access slab
    "210662": 25,    # the tallest of the group
    "210663": 21,
    "210664": 4,     # OSM says building:levels=3; HDB says 4, and HDB is the authority
}
HDB_FLOOR_M = 2.9
# Lift-motor room, water tanks and parapet, which every HDB block above about
# five storeys carries and none of the storey counts include. Calibrated
# against the three Tekka slabs, whose heights were estimated independently
# from photographs and typology in research/littleindia-hdb-towers.md at 70-75,
# 64-69 and 59-63m for 25, 23 and 21 storeys; 2.9m a floor plus this lands at
# 74.5, 68.7 and 62.9. Not applied below six storeys, where there is no lift
# motor room to model and the same allowance made blk 664 read too tall.
HDB_ROOF_PLANT_M = 2.0


# ---------------------------------------------------------------------------
# HDB PROPERTY INFORMATION — the join that dates and sizes the public housing.
#
# Until this existed, an HDB block whose OSM way carried the junk `height=0`
# tag that most of them carry fell through to TYPE_DEFAULT["residential"] = 40.
# Every slab in the world was 40m: the 25-storey one, the 21-storey one beside
# it, and the 12-storey one down the road. Little India held a real height on
# four buildings out of 2,087.
#
# HDB publishes `max_floor_lvl` and `year_completed` for all 13,357 blocks in
# Singapore. Both are authoritative -- they are HDB's own building records --
# and they are keyed by block number and street, which is exactly what these
# OSM ways already carry as addr:housenumber and addr:street. data/hdb_fetch.py
# caches the table; this joins to it.
#
# TWO DIFFERENT KINDS OF FACT COME OUT OF THIS JOIN, and they are not recorded
# the same way. `year_completed` is PUBLISHED and goes straight into `yr` as
# the fact it is. The height is a storey count times an assumed floor height --
# a derivation, the one this project has a standing rule against dressing up --
# so it is recorded as "levels" provenance alongside OSM's building:levels, and
# the accuracy ledger counts it under "heights, from storeys" rather than as a
# surveyed metre.
#
# WHY THE STREET NAMES NEED WORK. HDB writes "BUFFALO RD" and "UPP CROSS ST";
# OSM writes "Buffalo Road" and "Upper Cross Street". Both sides are normalised
# to one expanded uppercase form before the lookup. The block number is the
# other half of the key and Singapore addressing makes the pair unique, so a
# false join needs BOTH halves to be wrong at once.
# ---------------------------------------------------------------------------
HDB_ABBR = {
    "RD": "ROAD", "AVE": "AVENUE", "ST": "STREET", "CRES": "CRESCENT",
    "LOR": "LORONG", "JLN": "JALAN", "BT": "BUKIT", "STH": "SOUTH",
    "NTH": "NORTH", "UPP": "UPPER", "CTRL": "CENTRAL", "DR": "DRIVE",
    "TER": "TERRACE", "PL": "PLACE", "CL": "CLOSE", "PK": "PARK",
    "GDNS": "GARDENS", "GDN": "GARDEN", "MKT": "MARKET", "HTS": "HEIGHTS",
    "C'WEALTH": "COMMONWEALTH", "IND": "INDUSTRIAL", "EST": "ESTATE",
    "KG": "KAMPONG", "SQ": "SQUARE", "VW": "VIEW", "WK": "WALK",
    "CTR": "CENTRE", "MT": "MOUNT", "TG": "TANJONG",
}
_HDB_TABLE = None
HDB_JOINS = []          # (blk, street, storeys, year) for the build report
NAMES_STRIPPED = []     # OSM names that are not building names; see NAME_STRIP

# THE MAP CAN CARRY A NAME THE CITY NO LONGER DOES. Keyed by norm() of the
# mapped name and matched EXACT -- the substring lessons at the late re-lookup
# apply to names as much as to heights. One entry so far: OSM still labels the
# 123m tower on Shenton Way "UIC Building, Shenton Way", but the UIC Building
# was demolished in 2013 and what stands there is V on Shenton's office tower
# (123m, 23 floors -- research/tanjongrhu-marinasouth.md §11). The drawn height
# is already right; only the name was wrong.
NAME_CORRECTIONS = {
    # Keys are norm() with runs of spaces collapsed, because the mapped name
    # is "UIC Building , Shenton Way" and norm() keeps the double space the
    # stripped comma leaves behind; the lookup collapses the same way.
    "uic building shenton way": "V on Shenton Office Tower",
}
NAMES_CORRECTED = []    # (mapped name, corrected name), printed by the build


def _hdb_norm(s):
    s = (s or "").upper().replace(".", "").replace(",", "")
    s = re.sub(r"[^A-Z0-9' ]", " ", s)
    return " ".join(HDB_ABBR.get(w, w) for w in s.split())


def hdb_table():
    """The block table, loaded once. Absent cache is not fatal but IS loud."""
    global _HDB_TABLE
    if _HDB_TABLE is None:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hdb_blocks.json")
        if not os.path.exists(path):
            print("  ! data/hdb_blocks.json missing — run data/hdb_fetch.py. "
                  "Every HDB block will fall back to the 40m residential default.")
            _HDB_TABLE = {}
        else:
            _HDB_TABLE = {(_hdb_norm(b["blk_no"]), _hdb_norm(b["street"])): b
                          for b in json.load(open(path))["blocks"]}
    return _HDB_TABLE


_CONS_CACHE = None


def _point_in_ring(x, z, ring):
    """Ray cast. The rings come straight from URA and are not guaranteed to
    wind consistently, so this must not depend on winding."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, zi = ring[i]
        xj, zj = ring[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / ((zj - zi) or 1e-12) + xi:
            inside = not inside
        j = i
    return inside


def _conservation_areas():
    """URA's gazetted boundaries, projected into world metres once.

    Absent cache is not fatal but IS loud: without it every conserved shophouse
    silently falls back to guessing its era from its footprint shape, which
    looks identical to working and is not.
    """
    global _CONS_CACHE
    if _CONS_CACHE is None:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "conservation.json")
        if not os.path.exists(path):
            print("  ! data/conservation.json missing — run data/conservation_fetch.py. "
                  "No building will get a conservation-area era band.")
            _CONS_CACHE = []
            return _CONS_CACHE
        out = []
        for a in json.load(open(path))["areas"]:
            rings = []
            for r in a["rings"]:
                rings.append([list(proj(c[1], c[0])) for c in r])
            xs = [p[0] for r in rings for p in r]
            zs = [p[1] for r in rings for p in r]
            # Ring area decides which of two nested polygons is the more
            # specific one, so it is computed here rather than trusted from
            # URA's SHAPE.AREA column, which is in a different projection.
            tot = 0.0
            for r in rings:
                s = 0.0
                for i in range(len(r)):
                    x1, z1 = r[i]
                    x2, z2 = r[(i + 1) % len(r)]
                    s += x1 * z2 - x2 * z1
                tot += abs(s) / 2.0
            out.append({"name": a["name"], "rings": rings, "area": tot,
                        "box": (min(xs), min(zs), max(xs), max(zs))})
        _CONS_CACHE = out
    return _CONS_CACHE


# WHAT COLOUR THE PUBLIC HOUSING ACTUALLY IS.
#
# research/robertson-district-heights.md read dated photographs estate by
# estate and its conclusion is blunt: "this district is not a grey or beige
# district. Its public housing is painted in salmon-pink, magenta, terracotta,
# mint-green and pale yellow against cream and white. A monochrome HDB field
# will look wrong from any viewpoint."
#
# Keyed by the HDB street, because that is what the join already gives us, and
# split by BLOCK SHAPE where the sources split: at Redhill the long slabs are
# cream with salmon end gables while the point blocks behind them are salmon
# all over, so a slab and a point block on the same street take different
# colours. `point` applies below the footprint area given; `slab` above it.
#
# WHAT THIS DOES NOT MODEL, and it is the more distinctive half: the ACCENTS.
# Redhill's salmon end gables on cream slabs, Bukit Merah's magenta gable-end
# murals, Zion Road's terracotta banding. The renderer takes one colour per
# building, so only the wall field is set. That gap is real and is recorded in
# the ledger rather than papered over by splitting the difference into a colour
# nobody painted.
HDB_ESTATE_WALL = {
    # [PHOTO] 22 Aug 2025. Slabs cream with salmon end gables; the point blocks
    # behind are salmon-pink with white banding and white crown caps.
    "REDHILL CLOSE": {"slab": "#efe6d6", "point": "#d98d78", "cut": 900},
    "REDHILL ROAD":  {"slab": "#efe6d6", "point": "#d98d78", "cut": 900},
    # [PHOTO] 6 Jan 2026. The 2011 blocks are white/pale grey with mint-green
    # and pale yellow panels; blk 22, from 1964, is flat white with no accent.
    "HAVELOCK ROAD": {"slab": "#eef0ec", "point": "#eef0ec", "cut": 900},
    # [PHOTO] 10 Sep 2016, aerial. White and cream slabs; the magenta
    # gable-end murals are the accent this cannot carry.
    "JALAN BUKIT MERAH":  {"slab": "#f0ece1", "point": "#f0ece1", "cut": 900},
    "HENDERSON ROAD":     {"slab": "#f0ece1", "point": "#f0ece1", "cut": 900},
    "HENDERSON CRESCENT": {"slab": "#f0ece1", "point": "#f0ece1", "cut": 900},
    # [PHOTO] 10 Sep 2016. Cream to pale yellow towers, some yellow with
    # orange-red banding.
    "BUKIT MERAH VIEW":    {"slab": "#f2ecd2", "point": "#f2ecd2", "cut": 900},
    "BUKIT MERAH CENTRAL": {"slab": "#f2ecd2", "point": "#f2ecd2", "cut": 900},
    # [PHOTO] 16 Oct 2025. White point blocks with terracotta banding.
    "ZION ROAD":     {"slab": "#f1f0ec", "point": "#f1f0ec", "cut": 900},
    "KIM TIAN ROAD": {"slab": "#f1f0ec", "point": "#f1f0ec", "cut": 900},
}


def hdb_estate_colour(rec, area):
    if not rec:
        return None
    spec = HDB_ESTATE_WALL.get(_hdb_norm(rec.get("street")))
    if not spec:
        return None
    return spec["slab"] if area >= spec["cut"] else spec["point"]


_HDB_PTS = None


def _hdb_points():
    """OneMap's coordinate for every nearby HDB block, projected into world
    metres and paired with its HDB record. Empty and LOUD if the cache is
    missing -- a silent empty list here looks exactly like "no HDB nearby"."""
    global _HDB_PTS
    if _HDB_PTS is None:
        here = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(here, "hdb_points.json")
        if not os.path.exists(path):
            print("  ! data/hdb_points.json missing — run data/hdb_geocode.py. "
                  "HDB blocks with no address tags will keep their type default.")
            _HDB_PTS = []
            return _HDB_PTS
        pts = json.load(open(path))["points"]
        # hdb_table() is keyed by the NORMALISED pair; the points cache is keyed
        # by the RAW pair, which is what hdb_geocode.py wrote. Read the blocks
        # file directly rather than reusing that table, so the two keyings
        # cannot silently drift apart.
        blocks = {}
        bp = os.path.join(here, "hdb_blocks.json")
        if os.path.exists(bp):
            for b in json.load(open(bp))["blocks"]:
                blocks[f"{b['blk_no']}|{b['street']}"] = b
        out = []
        for key, ll in pts.items():
            if not ll or key not in blocks:
                continue
            x, z = proj(ll[0], ll[1])
            out.append((x, z, blocks[key]))
        _HDB_PTS = out
    return _HDB_PTS


def _hdb_height(storeys, rec=None):
    """Storeys to metres, at the floor height the BLOCK TYPE actually has.

    A flat rate of 2.9m a storey is right for a residential slab and wrong for
    everything else HDB builds. It put a single-storey wet market at 2.9m --
    shorter than its own doorway -- and Chinatown Complex, a four-storey market
    and food centre, at 11.6m. HDB's own flags say which kind of block this is,
    so use them:

      market / hawker centre   5.0   a market hall is one tall volume, not a
                                     stack of rooms; the roof clears the stalls
      precinct pavilion        4.0   an open single-storey shelter
      multi-storey car park    2.8   the shallowest deck HDB builds
      other non-residential    4.2   shops and offices; a retail storey is
                                     about half a storey taller than a flat
      residential              2.9   calibrated in HDB_FLOOR_M above

    A residential block with shops at its base gets one taller storey added
    once, not a taller rate for all of them -- the flats above are still flats.
    """
    if rec and rec.get("residential") != "Y":
        if rec.get("market_hawker") == "Y":
            per, extra = 5.0, 0.0
        elif rec.get("precinct_pavilion") == "Y":
            per, extra = 4.0, 0.0
        elif rec.get("multistorey_carpark") == "Y":
            per, extra = 2.8, 0.0
        else:
            per, extra = 4.2, 0.0
    else:
        per = HDB_FLOOR_M
        extra = 1.5 if (rec and rec.get("commercial") == "Y") else 0.0
    return storeys * per + extra + (HDB_ROOF_PLANT_M if storeys >= 6 else 0.0)


def hdb_record(tags):
    hn, stt = tags.get("addr:housenumber"), tags.get("addr:street")
    if not (hn and stt):
        return None
    return hdb_table().get((_hdb_norm(hn), _hdb_norm(stt)))

# Buildings OSM identifies by wikidata id but never names. Each entry has been
# checked against the Wikidata entity itself -- this is a lookup of verified
# ids, not a guess from an id pattern. Researched 2026-07-31,
# research/raffles-parkview.md.
NAMED_BY_WIKIDATA = {
    "Q1538837": "Raffles Hotel",   # relation 3413910; outer way 254815863 has only source=Bing
}

# ORCHARD ROAD FRONTAGE: year and facade colour, researched 2026-07-31
# (research/orchard-frontage-facades.md). These are the buildings a rider
# actually passes, and their appearance was coming from an era mix or a hash.
#
# The YEAR is the one that describes the SKIN, not always the build date. Orchard
# Shopping Centre went up in 1976-77 but was completely re-clad between Mar 2009
# and Jun 2013 (bracketed by dated Street View), so a 1976 date here would drive
# a punched-window facade and be actively wrong -- the street sees a c.2010 dark
# curtain wall.
#
# Colours are hex-sampled from named, dated photographs. Two are deliberately
# ABSENT: Orchard Towers, whose post-2023 re-clad has only a low-res news
# thumbnail, and anything the research marked low confidence. A missing colour
# falls back to the existing behaviour; a wrong one is worse than none.
#
# OSM WINS. These are applied only where the map has no start_date and no
# building:colour of its own -- a surveyed tag always beats a researched one.
FRONTAGE_FACADE = {
    "shaw house":              (1993, "#cfcbbf"),
    "the heeren":              (1997, "#a8acab"),
    "orchard towers":          (1975, None),      # current skin not reliably known
    "far east shopping":       (1974, "#c8cbc9"),
    "delfi orchard":           (1984, "#e8e8ea"),
    "midpoint orchard":        (1984, "#4e5155"),
    "orchard shopping centre": (2011, "#2c3e51"),  # RE-CLAD date, not 1976
    "orchard gateway @ emerald": (2014, "#89a4b5"),
    "tong building":           (1978, "#5c6470"),
    "temasek shophouse":       (1928, "#e6e6e5"),
    "peranakan place":         (1902, "#c5b4a4"),
    "claymore connect":        (2015, None),      # no dated photo found
    "orchard 22":              (1921, "#dee1dc"),
}

# ---------------------------------------------------------------------------
# GAZETTED CONSERVATION AREAS -> A CONSTRUCTION-PERIOD BAND.
#
# A shophouse inside the Little India Conservation Area is a pre-war shophouse.
# That is WHY it is conserved, and it is a published fact about the area rather
# than a guess about the building. It is also NOT the same as knowing the year
# that particular terrace went up, so the band goes into `era` and never into
# `yr`; the accuracy ledger reports the two on separate lines and the finish
# line is written against the surveyed one.
#
# Only areas with a CITED period appear here. An area whose stock has not been
# researched gets no band -- it keeps the footprint-shape fallback in city.js,
# which at least says of itself that it is a rule we chose. Filling this table
# by eye would be exactly the fabrication this project has already been bitten
# by once.
#
# Sources are per row. The boundaries come from URA's own Master Plan 2025 SDCP
# Conservation Area layer via data/conservation_fetch.py -- not from prose
# descriptions of which streets bound what, which research/conservation-
# littleindia.md found to be wrong for Little India in both directions (Sungei
# Road is outside the polygon; Serangoon Road runs through the district rather
# than around it).
# ---------------------------------------------------------------------------
#
# TWO RESEARCHERS DISAGREED ABOUT WHETHER THESE DATES EXIST AT ALL. One
# reported them as published by URA; the other rendered all six of URA's
# shophouse-style sheets, found no date on any of them, and concluded URA
# publishes no date ranges. Both were partly right, and the question was
# settled here by fetching the page rather than by preferring an agent: the
# STYLE SHEETS carry no dates, the AREA PAGES do. URA's Little India portal
# page, read directly on 2026-07-31, says word for word:
#
#   "The shophouse designs in Little India range from the Early (1840-1900),
#    First Transitional, Late (1900-1940), and Second Transitional to Art Deco
#    (1930-1960) styles."
#
# WHY THE BANDS BELOW ARE NARROWER THAN THE PUBLISHED SPAN, and this is a
# JUDGEMENT, not a fact. The full published span for Little India is 1840-1960.
# city.js turns a year into a facade family at hard boundaries -- 1945 and 1978
# -- so a band that crossed 1945 would deal roughly a tenth of a conserved
# masonry terrace the punched-concrete family of the 1960s. Every one of the
# four styles URA lists IS a masonry shophouse. So the band is set to the
# dominant style's range, which URA's own historic-districts page supports
# ("largely intact from the late 19th and early 20th centuries"), and the tails
# are deliberately dropped rather than modelled wrong.
# THE STYLE -> DATE MAPPING, and where it comes from.
#
# Only ONE area page on URA's portal carries explicit years: Little India's,
# quoted above. Every other area page names the STYLES its stock is built in
# and gives no dates -- "It features two- and three-storey shophouses built in
# the Transitional, Late and Art Deco styles" (Kreta Ayer), and so on. All
# twenty were fetched and read on 2026-07-31; the sentences are in
# research/conservation-chinatown.md and conservation-central.md.
#
# So the dates come from the style names, and the style names come from URA.
# The mapping below is URA's own, from the Little India page, corroborated
# independently by NHB's "The Singapore Shophouses" on Roots.gov.sg: Early
# 1840s-1900s, First Transitional early 1900s, Late 1900-1940, Second
# Transitional late 1930s, Art Deco 1930-1960, Modern 1950-1960. Two sources,
# one of them the same authority that draws the boundaries.
#
# What this is NOT: a claim about any individual building. It says the stock in
# this gazetted area is of these styles and those styles span these years. The
# band lands in `era`, never in `yr`.
SHOPHOUSE_STYLE_YEARS = {
    "early": (1840, 1900),
    "transitional": (1900, 1920),        # URA writes "Transitional" for both
    "first transitional": (1900, 1920),
    "late": (1900, 1940),
    "second transitional": (1930, 1940),
    "art deco": (1930, 1960),
    "neo-classical": (1900, 1940),       # Beach Road; not in the shophouse run
    "modern": (1950, 1965),
    "early modern": (1950, 1965),
}

# The styles URA names for each area, transcribed from its own portal page.
# Keys are the NAME field of the Master Plan conservation layer, so that the
# join is exact and an area URA renames simply stops matching rather than
# silently taking a neighbour's era.
CONSERVATION_STYLES = {
    "CHINATOWN (KRETA AYER)": ("transitional", "late", "art deco"),
    "CHINATOWN HISTORIC DISTRICT CORE AREA - KRETA AYER":
        ("transitional", "late", "art deco"),
    "CHINATOWN (TELOK AYER)": ("early", "transitional", "late", "art deco"),
    "CHINATOWN (TANJONG PAGAR)": ("early", "transitional", "late"),
    "CHINATOWN (BUKIT PASOH)": ("transitional", "late", "art deco"),
    "BOAT QUAY": ("early", "transitional", "art deco"),
    "CLARKE QUAY": ("transitional",),
    "CHINA SQUARE": ("transitional", "art deco", "early modern"),
    "MAGAZINE ROAD": ("early", "art deco"),
    "RIVER VALLEY": ("late", "transitional"),
    "EMERALD HILL": ("transitional", "late", "art deco"),
    "CAIRNHILL": ("late", "art deco"),
    "BEACH ROAD": ("art deco", "neo-classical"),
    "SHORT STREET": ("early", "transitional"),
    "KAMPONG GLAM": ("early", "transitional"),
    "KAMPONG GLAM HISTORIC DISTRICT CORE AREA": ("early", "transitional"),
    "JALAN BESAR": ("late", "transitional", "art deco"),
    "BLAIR PLAIN": ("transitional", "late"),
    # ---- AREAS ADDED 2026-08-01, transcribed from URA's own portal pages.
    # 370 buildings sat inside gazetted polygons with no band at all because the
    # area simply had no entry here. Only areas whose STOCK URA describes are
    # added; where URA names no style the area is left out rather than guessed,
    # and where the published fact is a YEAR it goes in CONSERVATION_ERA below
    # instead of being reverse-engineered into a style.
    #
    # "the conservation area comprises 29 units of two-storey shophouses mainly
    # of the Early Shophouse style" — ura.gov.sg .../cjcpl/
    "CHEANG JIM CHWAN PLACE": ("early",),
    # "13 units of two- and three-storey buildings ... ranging from the Eclectic
    # with its ornate and decorative Classical features to simple Art Deco
    # Style" — ura.gov.sg .../orch01/. "Eclectic" is not in the vocabulary above
    # and is deliberately NOT forced into "late" or "transitional".
    "ORCHARD ROAD NO. 14-38 (EVEN)": ("art deco",),
    # Unit by unit on URA's page: No. 231 "Art Deco", Nos. 233/235/237 "both
    # Neo-Classical and Art Deco styles", No. 239 "Neo-Classical", No. 243
    # "Modern style" — ura.gov.sg .../cttr/. TERRACE HOUSES, URA's own word,
    # not shophouses.
    "CANTONMENT ROAD": ("art deco", "neo-classical", "modern"),
    # "7 units of four-storey Art Deco buildings skillfully designed as a
    # cohesive development, with a specially treated splayed corner" —
    # ura.gov.sg .../aslys/. The former MPH Building in the same polygon is
    # 1908 Edwardian in red facing brick and does not belong to this band.
    "ARMENIAN STREET AND LOKE YEW STREET": ("art deco",),
    # Tiong Bahru is the one area here that is not shophouses at all. URA /tnbhr/:
    # "The estate is characterised by the Streamline Moderne style, with Art Deco
    # motifs". The CONSERVED blocks are Alfred G. Church's pre-war SIT flats,
    # 1936-1941 (research/robertson-rivervalley.md, cited to URA) -- the post-war
    # 1948-54 blocks around Lim Liak and Seng Poh are plainer International Style
    # and are NOT conserved, so they fall outside the polygon and keep the
    # fallback. A tight band, because the source is tight.
    "TIONG BAHRU": ("streamline moderne",),
}
SHOPHOUSE_STYLE_YEARS["streamline moderne"] = (1936, 1941)

# Where URA publishes a development date that overrides the style span's start.
# Jalan Besar is reclaimed swamp that was ribbon-developed AFTER the First World
# War, so it has no Early stock at all whatever the style names would allow.
CONSERVATION_EARLIEST = {"JALAN BESAR": 1918}

CONSERVATION_ERA = {
    # Little India is the one area with published years of its own, so it does
    # not derive its band from style names. Published span 1840-1960; banded to
    # the dominant Late style for the reason given above.
    "LITTLE INDIA": (1900, 1940),
    "LITTLE INDIA HISTORIC DISTRICT CORE AREA": (1900, 1940),
    # ---- AREAS WHOSE PUBLISHED FACT IS A YEAR, NOT A STYLE (2026-08-01).
    # The style vocabulary above is a shophouse vocabulary. Four of these areas
    # are not shophouses at all, and forcing them through it would be inventing
    # a category as well as a date, so they carry URA's own published span.
    #
    # Robertson Quay is GODOWNS. "Nos. 17, 19 and 21 Jiak Kim Street — These
    # three single storey buildings were built in 1919"; No. 63 Caseen Road
    # carries "The year (1921)" on its own facade. Gazetted 6 June 2014, nine
    # buildings. ura.gov.sg .../rbsq/. An earlier read of this area from a
    # boundary file said 1895-1921; 1895 is The Warehouse Hotel on Havelock
    # Road, which is NOT in this gazette, so the span is tightened to what URA
    # publishes for the area itself.
    "ROBERTSON QUAY": (1919, 1921),
    # NOT shophouses either, and the single largest correction in this batch:
    # "It contains mainly three- to five-storey buildings built mainly in the
    # 1930s to the late 1960s and are of different Modern architectural styles."
    # ura.gov.sg .../uppcirrd/. 127 buildings, all of which the shape fallback
    # would otherwise deal a pre-war shophouse facade.
    "UPPER CIRCULAR ROAD": (1930, 1969),
    # BUNGALOWS. "This conservation area consists of 27 conserved bungalows
    # mainly of the Art Deco and 'Black and White' Bungalow styles" and "The
    # conserved houses presently in the area were built in the 1920s and 1930s."
    # ura.gov.sg .../chpk/.
    "CHATSWORTH PARK": (1920, 1939),
    # BARRACKS. "The Lower and Upper Barracks were built in the 1930s"; the
    # bungalow "was likely to have been built in the 1920s".
    # ura.gov.sg .../perhl/.
    "PEARL'S HILL": (1920, 1939),
    # ---- MOUNT SOPHIA, 2026-08-01. THE ONE AREA HERE WHOSE BAND DOES NOT COME
    # FROM URA AT ALL, and it is a judgement rather than a transcription.
    #
    # URA publishes nothing usable for this area and that has now been checked
    # three times: no About, no History, no Architecture, and the two obvious
    # endpoints -- the Secondary-Settlements page .../mtsophia and the portal's
    # /Conservation-Portal/Explore/History?bldgid=MTSOPH -- both return 404.
    # HANDOFF.md carried it as "the largest single era gap left and it is not
    # researchable from URA", and that sentence is still true about URA.
    #
    # It is not true about the AREA. NHB (Roots.gov.sg), NLB and the gazette
    # citations date five conserved buildings inside the polygon by name:
    #
    #   Tower House, 12 Mount Sophia                   1892  Crane Brothers
    #   Sophia Flats, 28-34 Wilkie Road                1920 or 1930s -- disputed
    #   Olson Building (Blk 11A), 29 Mount Sophia      1928  Frank Wilmin Brewer
    #   former Nan Hwa Girls' High School              1939
    #   Trinity Theological College Chapel, 7 Mt S.    1969  Chan Kui Chuan
    #
    # Dated buildings are a better basis than a style sentence would have been,
    # because they skip the style-name-to-years mapping entirely.
    #
    # 1900-1940 AND NOT 1892-1969. The full dated span crosses BOTH of city.js's
    # facade-family boundaries (1945 and 1978), so handing it over whole would
    # deal part of a conserved pre-war hill the punched-concrete family of the
    # 1960s -- the identical trap the Little India note above describes, and the
    # reason that band drops its own tails. Four of the five dated buildings sit
    # inside or on the edge of 1900-1940. The 1892 and 1969 tails are dropped
    # deliberately: both are INDIVIDUALLY NAMED buildings that can be carried
    # properly one day, and neither should be smeared across 149 neighbours.
    #
    # Corroborating, not decisive: URA's Secondary Settlement category groups
    # Mount Sophia with River Valley, Joo Chiat and Jalan Besar, and every one
    # of those already lands on a 1900-1940-centred band above.
    #
    # Full trail, including the two contested dates, in research/mount-sophia.md.
    "MOUNT SOPHIA": (1900, 1940),
}
for _nm, _styles in CONSERVATION_STYLES.items():
    if _nm in CONSERVATION_ERA:
        continue
    _lo = min(SHOPHOUSE_STYLE_YEARS[s][0] for s in _styles)
    _hi = max(SHOPHOUSE_STYLE_YEARS[s][1] for s in _styles)
    CONSERVATION_ERA[_nm] = (max(_lo, CONSERVATION_EARLIEST.get(_nm, 0)), _hi)

# WHEN EACH AREA WAS GAZETTED. Not decoration -- it is the test that catches
# OSM's restoration dates. URA conserves buildings BECAUSE they are already
# old, so a conserved building cannot have been built after its own gazette.
# OSM tags 326 buildings in Chinatown (Tanjong Pagar) with start_date=1990, one
# year after the 1989 gazette: that is the date the terrace was restored, not
# built, and read as a construction date it dealt 461 conserved shophouses the
# balconied-slab facade of the 1980s.
CONSERVATION_GAZETTE = {
    # gazette dates for the areas added 2026-08-01, each from its own URA page
    "UPPER CIRCULAR ROAD": 2004,            # 4 November 2004
    "CHEANG JIM CHWAN PLACE": 1994,         # 28 October 1994
    "CHATSWORTH PARK": 1991,                # 29 November 1991
    "PEARL'S HILL": 2008,                   # 5 December 2008
    "ROBERTSON QUAY": 2014,                 # 6 June 2014
    "ORCHARD ROAD NO. 14-38 (EVEN)": 2000,  # 21 November 2000
    "CANTONMENT ROAD": 2005,                # earliest of 2005 / 2007 / 2011
    "ARMENIAN STREET AND LOKE YEW STREET": 2001,   # 13 October 2001
    "CHINATOWN (KRETA AYER)": 1989, "CHINATOWN (TELOK AYER)": 1989,
    "CHINATOWN (TANJONG PAGAR)": 1989, "CHINATOWN (BUKIT PASOH)": 1989,
    "CHINATOWN HISTORIC DISTRICT CORE AREA - KRETA AYER": 1989,
    "LITTLE INDIA": 1989, "LITTLE INDIA HISTORIC DISTRICT CORE AREA": 1989,
    "KAMPONG GLAM": 1989, "KAMPONG GLAM HISTORIC DISTRICT CORE AREA": 1989,
    "BOAT QUAY": 1989, "CLARKE QUAY": 1989,
    "CAIRNHILL": 1989, "EMERALD HILL": 1989,
    "RIVER VALLEY": 1991, "BEACH ROAD": 1991, "JALAN BESAR": 1991,
    "MAGAZINE ROAD": 1992, "QUEEN STREET": 1993, "SHORT STREET": 1994,
    "CHINA SQUARE": 1997, "UPPER CIRCULAR ROAD": 2004, "PEARL'S HILL": 2008,
    "BLAIR PLAIN": 1991, "TIONG BAHRU": 2003,
    # The polygon is already in data/conservation.json (216 cached areas) but
    # had no row here, so the restoration-date-read-as-build-date guard never
    # ran on it -- the exact gap that put the Olson Building in our data at its
    # 2017 restoration date. Kallang Airport terminal, Frank Dorrington Ward,
    # 1937; conserved 2008. Needed before the kallang district is built.
    "FORMER KALLANG AIRPORT": 2008,
    "ROBERTSON QUAY": 2014,
    # MOUNT SOPHIA was gazetted IN STAGES, which is why a single date was never
    # found: "more than 80 buildings around Mount Sophia were given conservation
    # status in 2003 and 2011", and the Olson Building carries its own 2012
    # gazette. Earliest of the staged dates, which is the precedent this table
    # already set for CANTONMENT ROAD.
    #
    # THIS ROW IS THE POINT OF THE EXERCISE. Our own data had the Olson Building
    # -- 29 Mount Sophia, Blk 11A, a 1928 Frank Brewer classroom block -- at
    # yr=2017, which is when Hoi Hup Sunway finished restoring it as the Sophia
    # Hills clubhouse. That is precisely the restoration-date-read-as-build-date
    # this guard exists to catch, and it went straight through for one reason:
    # the area had no row here, so the guard never ran on it.
    "MOUNT SOPHIA": 2003,
}

TYPE_DEFAULT = {
    "retail": 22, "commercial": 30, "hotel": 55, "apartments": 45,
    "residential": 40, "office": 45, "civic": 18, "house": 9,
    "roof": 5, "yes": 20, "school": 14, "church": 16, "parking": 12,
    # SOME TYPES ARE THEIR OWN HEIGHT STATEMENT. `roof` has been here since the
    # Universal canopy went to 20.4m and blotted out the sky over the globe;
    # these are the same argument. A hut is single-storey by definition and a
    # grandstand is seating — neither can be banded off a footprint area.
    # Sentosa has exactly one of each, and they are the Wings of Time pair at
    # Central Beach: the 2,712 m2 seating bank and the 706 m2 offshore stage
    # set, both of which were standing 20.4m tall in the spawn frame.
    #
    # The values come from data/buildtypes.py, which is also what heights.py
    # reads so it can refuse to band them. Merged in below the literal, so the
    # `roof: 5` that has been here for months is the same number either way.
    **TYPE_HEIGHT,
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


# A LANDMARK KEY THAT norm() CANNOT PRODUCE IS DEAD CODE THAT LOOKS ALIVE.
#
# LANDMARKS is matched against norm(name), which strips everything outside
# [a-z0-9 ]. So a key written with an apostrophe, a hyphen or an "@" can never
# match anything, and the entry sits there looking like a fact the pipeline
# honours while the building keeps its guess. Three did:
#
#   "people's park complex", "the sail @ marina bay", "the ritz-carlton"
#
# and a fourth was added the same day ("saint andrew's cathedral") and quietly
# did nothing through a full rebuild. This is not a thing to remember; it is a
# thing to check.
_bad_keys = sorted(k for k in LANDMARKS if norm(k) != k)
if _bad_keys:
    sys.exit("  ! LANDMARKS keys that norm() can never match, so they are dead:\n"
             + "\n".join(f"      {k!r} -> norm gives {norm(k)!r}" for k in _bad_keys)
             + "\n    Rewrite them in normalised form.")


# Every height tag we refused, so the count is printed rather than swallowed.
BAD_HEIGHT_TAGS = []
BAD_COLOUR_TAGS = []

# SUPERTREE SLICES ARE NOT BUILDINGS, AND TWO FILES NEED TO AGREE ON THAT.
#
# The reconciliation further down turns Gardens by the Bay's grass-material
# `building:part` stacks into towers and drops them from `buildings`. That is
# right, and it has a side effect: in marinaeast, where 20 of 87 mapped
# "buildings" ARE those slices, no shipped building carries `building:colour`
# any more — so data/unused.py reported the tag as present and unread and
# refused the deploy. The tag is not unread; the ELEMENT stopped being a
# building. unused.py imports this predicate rather than growing its own copy,
# which is the trap that bit topup.py's crane query and the colour guard on the
# same day.
SUPERTREE_BAND = (20.0, 60.0)


def supertree_slice(tags):
    """Is this raw element one of Gardens by the Bay's grass Supertree slices,
    or one of its half-metre planted mounds? Either way it leaves the building
    layer, so it cannot be judged as a building that failed to carry its tags."""
    if (tags.get("building:material") != "grass"
            and tags.get("roof:material") != "grass"):
        return False
    try:
        h = float(str(tags.get("height", "")).replace("m", "").strip())
    except ValueError:
        return False
    if h < 2.5:
        return True                        # a planted mound: ground, not a mass
    return SUPERTREE_BAND[0] <= h <= SUPERTREE_BAND[1]


def colour_ok(v):
    """Is this a colour value worth carrying into the scene? Refuses the
    mass-traced `#ff3333` and any hex that is not 3 or 6 digits.

    A FUNCTION, BECAUSE THE TEST WAS IN ONE PLACE AND THE WRITE WAS IN TWO.
    The guarded loop refused `#ddddd` and then a second, unguarded loop forty
    lines later wrote `building:colour` straight back over the top of it —
    which is how an invalid five-digit hex reached three shipped buildings in
    harbourfront AND the published world.json, while this file's own note said
    it "does not reach any shipped data/*.json". It did. Same shape as every
    other bug here where one fact is enforced in two places."""
    v = (v or "").strip()
    if not v:
        return False
    if v.lower() == "#ff3333":
        return False
    if v.startswith("#") and not re.fullmatch(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", v):
        return False
    return True
LATE_NAME_HEIGHTS = []

# WHERE THE OSM `height` TAG IS NOT EVIDENCE, AND MUST BE READ AS ABSENT.
#
# The per-tag guard in height_for() refuses a value under 2.5m, which catches
# `height=0` and `height=1`. It cannot catch a tag that is individually
# plausible and collectively fabricated, and the Kallang Basin / Tanjong Rhu box
# is full of exactly that. Measured over 1.290-1.310 / 103.865-103.885:
#
#   National Stadium      levels 2   height 10   published dome height 83m
#   OCBC Aquatic Centre   levels 4   height 20   a 3,000-seat aquatic hall
#   Kallang Wave Mall     levels 1   height 5    a multi-level mall
#   Costa Rhu, Rhu Cross  levels 12, 14, 16, 18  height 56 ON ALL FOUR
#   Meyer Road 51/53/55   levels 23, 23, 24      height 80 ON ALL THREE
#
# 56/12 and 56/18 are both plausible floor-to-floor figures, so no per-building
# test can reject them; what marks them is that ONE constant was pasted across
# buildings of different heights. This is the same failure family as Fook Hai's
# hand-typed `height=32` (research/chinatown-littleindia-landmarks.md: "plausible,
# but not evidence"), except systematic rather than isolated.
#
# RE-MEASURED AGAINST LIVE OVERPASS 2026-08-01 before relying on the brief, and
# it is worse than the brief said. 85 buildings in the bbox carry a height tag:
#
#   value 56  on 23 buildings, levels 6 / 9 / 12 / 14 / 16 / 18  -> 3.1-9.3 m per level
#   value 74  on 20 buildings, one of which carries levels 10    -> 7.4 m per level
#   value 57  on  6 buildings, none carrying levels
#   value 10  on  9 buildings incl. the National Stadium (levels 2)
#   value  0  on  9 buildings incl. Golden Mile Tower, The Concourse, the ICA
#
# The zeros are already refused by the under-2.5m guard in height_for(). The
# three blanket constants are not refusable per building, which is the whole
# reason this rule is scoped by PLACE.
#
# So inside these boxes the tag is dropped and geometry comes from
# `building:levels`, which IS surveyed here, via the normal fallback. `hs`
# provenance then records the derivation honestly instead of laundering a
# placeholder as a survey. Full trail: research/coastal-expansion.md section 0.6.
#
# (south, west, north, east) -- one box covering both kallang and tanjongrhu.
HEIGHT_TAG_SUPPRESS = [
    (1.2890, 103.8600, 1.3100, 103.8880),
]
SUPPRESSED_HEIGHT_TAGS = []


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
        # DISTRICT-SCOPED ENTRIES. The table is keyed on bare lowercased names
        # and was never district-aware, so Orchard Road's "forum" (17-storey
        # mall, derived 56m) landed on Sentosa's "The Forum" — a building=roof
        # covered WALKWAY at RWS, tagged height=0 — and raised it into a 56m
        # slab labelled `named` (found by the 2026-08-03 research audit; the
        # exact laundering the comment at the table head warns against). An
        # entry carrying "district" now only fires in that district.
        if spec.get("district") and spec["district"] != DIST_ID:
            continue
        if key and key in name and len(key) > len(best_key):
            best_key, best_spec = key, spec
    if best_spec is not None:
        return (best_spec["h"], best_spec.get("key", False), "named",
                best_spec.get("podium"))
    # POSTCODE FIRST, alongside the name overrides above and BEFORE the OSM
    # height tag -- these are published measurements from a better source, and
    # ranking them under a crowd-sourced tag means they never fire. UE Square's
    # tower is tagged 85 in OSM and published at 91.6 by its architect; placed
    # after this block, the override was dead code.
    pc = str(tags.get("addr:postcode") or "").strip()
    if pc in POSTCODE_HEIGHT:
        return POSTCODE_HEIGHT[pc], True, "override", None
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
        # A GRASS MOUND REALLY IS HALF A METRE HIGH.
        #
        # The 2.5m floor is a plausibility test — "nothing with a building tag
        # is a metre high" — and it is right about every building. It is wrong
        # about LANDSCAPE, and Gardens by the Bay is mapped as landscape:
        # `building:material=grass` + `roof:material=grass` + `height=0.5` on
        # the planted mounds, several of them also carrying `fixme=height`. Ten
        # of them in the marinabay extract. Refused here, they fell through to
        # a type default and were drawn as 7 to 14m green blocks standing in
        # the middle of the Gardens.
        #
        # Same shape as the station-concourse exemption above: the tag is not a
        # bad tag, it is the correct description of a thing that is genuinely
        # low. Scoped to grass so the 1m junk on real buildings is untouched.
        _grass = tags.get("building:material") == "grass" \
            or tags.get("roof:material") == "grass"
        if v is not None and (v >= 2.5 or (_grass and v > 0.05)):
            return v, False, "osm", None
        if v is not None:
            BAD_HEIGHT_TAGS.append((tags.get("name") or "(unnamed)", v))
    if pc in HDB_STOREYS:
        # a derivation, and recorded as one -- the storeys are authoritative,
        # the metres are storeys x an assumption. This hand-entered table is
        # kept ahead of the general HDB join below because each of its four
        # entries was checked individually; the join agrees with all four.
        return _hdb_height(HDB_STOREYS[pc], hdb_record(tags)), False, "levels", None
    rec = hdb_record(tags)
    if rec:
        try:
            st = int(rec["max_floor_lvl"])
        except (TypeError, ValueError):
            st = 0
        if st >= 1:
            HDB_JOINS.append((rec["blk_no"], rec["street"], st, rec.get("year_completed")))
            return _hdb_height(st, rec), False, "levels", None
    lv = tags.get("building:levels")
    if lv:
        try:
            # 3.4m per storey is closer for SG commercial than 3.6.
            #
            # RECORDED AS "levels", NOT AS "osm". This is a storey count times an
            # assumed floor height, which is the one derivation this project has
            # a standing rule against -- every research brief sent out says
            # "never convert a storey count into a height in metres", and then
            # the pipeline did exactly that and filed the result under the same
            # provenance as a surveyed `height=` tag. Two lines above, the HDB
            # storey table is honest about this and calls itself a guess, on
            # BETTER data (HDB's own storey counts beat OSM's).
            #
            # It matters at scale: 3,077 buildings, 40% of the world, carry a
            # height that came from this line, including every 122.4m (36 x 3.4)
            # and 159.8m (47 x 3.4) tower in River Valley and Little India. The
            # ledger was calling all of them surveyed.
            #
            # The VALUE is unchanged -- a storey count is real information and a
            # far better estimate than a type default, so it stays. Only the
            # label changes, so that the accuracy ledger can report three tiers
            # (surveyed metres / derived from storeys / guessed) instead of
            # flattening the first two together. Nothing in the world moves.
            return max(3.5, float(lv) * 3.4), False, "levels", None
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


# THE AMENITY VALUES THAT COUNT AS A NAMED TENANT.
#
# Written out twice below -- once for nodes, once for ways -- and it used to be
# a literal tuple in both. It is a constant now because it just grew, and
# growing it in one of two places is the failure this project has already paid
# for once (see topup.py's `towers`).
#
# WHAT IT COST WHILE `bar` WAS MISSING: Tanjong Beach Club is amenity=bar. So
# are Ola Beach Club, Bikini Bar, FOC Sentosa, WooBar and Bora Bora. The fetch
# in build_district.py did not ask for them AND this reader would have dropped
# them if it had. Both halves had to be widened; fixing either alone changes
# nothing you can see, which is exactly why the gap survived so long.
SHOP_AMENITIES = ("restaurant", "cafe", "bank", "fast_food", "pharmacy",
                  "cinema", "bar", "pub", "nightclub", "biergarten",
                  "food_court", "ice_cream")


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


def despike_ring(ring, cos_lim=-0.995, max_edge=0.6):
    """Unwind zero-width spurs: vertices where the ring doubles straight back.

    OSM building ways sometimes include a dead-end tail — the outline walks out
    along a sliver and returns over almost the same points. OUE Link's upper
    deck did exactly that for twelve of its twenty-nine vertices, points 17-23
    going out and 24-28 coming back within a few centimetres.

    A tail like that always self-intersects and the greedy vertex-dropping
    repair cannot clear it: removing one vertex of a doubled-back pair leaves
    the other, so every candidate scores the same and the search sits on a
    plateau until it runs out of passes. Twenty-eight passes did not help; the
    shape needs the TAIL removed, not a vertex.

    So: repeatedly drop any vertex whose incoming and outgoing edges point in
    opposite directions. That is the tip of a spike by definition, and removing
    it exposes the next one, so the tail unwinds from the outside in. A ring
    with real corners is untouched — a 90-degree turn has a dot product of 0,
    nowhere near -1.
    """
    r = [q for q in ring]
    for _ in range(len(ring)):
        n = len(r)
        if n <= 4:
            break
        drop = -1
        for i in range(n):
            a, b, c = r[i - 1], r[i], r[(i + 1) % n]
            ax, az = b[0] - a[0], b[1] - a[1]
            cx, cz = c[0] - b[0], c[1] - b[1]
            la = (ax * ax + az * az) ** 0.5
            lc = (cx * cx + cz * cz) ** 0.5
            if la < 1e-9 or lc < 1e-9:
                drop = i
                break
            # AND ONLY WHEN THE SPIKE IS SMALL. Reversal alone is not enough:
            # a genuine narrow building -- a 35m x 2m party wall in Chinatown,
            # 78 m2 -- is a long thin loop that doubles back at each end, and
            # an angle-only rule unwound it to nothing and deleted the
            # building. One tenant lost its shopfront with it (audit S8 63->62),
            # which is how this was caught.
            #
            # A rounding artefact is by definition SHORT: the vertices come
            # from subdivide() landing several interpolated points on the same
            # decimetre. Requiring one of the two edges to be under 0.6m keeps
            # every real outline and still unwinds OUE Link's tail, whose
            # segments run 0.2 to 0.7m.
            if (ax * cx + az * cz) / (la * lc) < cos_lim and min(la, lc) < max_edge:
                drop = i
                break
        if drop < 0:
            break
        r.pop(drop)
    return r


def dedupe_ring(ring):
    """Drop consecutive duplicate points, including the wrap-around pair.

    Footprint coordinates are rounded to 0.1m on the way out, and OSM traces
    curves finely enough that several consecutive nodes land on the SAME
    decimetre. OUE Link's 22-point ring held eleven duplicates -- points 5, 6
    and 7 were the same coordinate -- and the zero-length segments between them
    are what the D13 self-intersection test was reporting as "a ring that
    crosses itself". They also extrude into zero-area triangles, which cost a
    draw and shade unpredictably.

    Nine footprints across five districts carried them. This is the repair the
    check was actually asking for: not a different test, a clean ring.
    """
    if len(ring) < 3:
        return ring
    out = [ring[0]]
    for q in ring[1:]:
        if q[0] != out[-1][0] or q[1] != out[-1][1]:
            out.append(q)
    while len(out) > 1 and out[0][0] == out[-1][0] and out[0][1] == out[-1][1]:
        out.pop()
    return out


def main():
    raw = json.load(open(RAW_PATH))
    els = raw["elements"]
    buildings, roads, trees = [], [], []
    skipped_underground = 0
    skipped_station_box = 0
    # Real map positions, so street furniture stops being placed at intervals we
    # invented. This is what makes it the actual street rather than a plausible one.
    crossings, signals, busstops, mrt, taxis = [], [], [], [], []
    bridges, covered, shops = [], [], []

    global _OSM_WAY_SEEN
    _OSM_WAY_SEEN = set()
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
            elif tags.get("shop") or tags.get("amenity") in SHOP_AMENITIES:
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
        if e["type"] == "way" and (tags.get("shop")
                                   or tags.get("amenity") in SHOP_AMENITIES) \
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
                # A FOOTBRIDGE IS A FOOTWAY. IT WAS BEING FILED AS SCENERY.
                #
                # This `continue` is the whole of the "75 bridge footways lose
                # name/layer/level" item carried since SESSION 8, and it is not
                # a stripping bug — the way never reaches the road branch at
                # all. `bridges` is a list of BARE POLYLINES: no name, no width,
                # no layer, no kind. sgdetail's pedBridge recipe reads it and
                # builds an overpass for the ones that are straight, 22-90m and
                # span something; every other bridge footway on the island
                # draws NOTHING and is not in the walking network.
                #
                # Measured on sentosa: 75 OSM ways are highway=footway/path/
                # pedestrian + bridge. The 14 tagged `path` or `pedestrian` are
                # not caught by this branch, fall through, and arrive as proper
                # roads with bridge=1 — including the Sentosa Boardwalk. The 61
                # tagged `footway` are caught here and arrive as scenery. Same
                # crossing, same map, two fates, decided by a tag the renderer
                # never sees. THAT is why Lookout Loop and the Fort Siloso
                # Skywalk each needed a hand-written pass to put their own names
                # back: the names were never taken away, they were never
                # carried.
                #
                # So the line falls through as well as being recorded. Nothing
                # downstream needs teaching — city.js already registers a
                # `bridge` path via addFootbridgeWay, already seats a walker on
                # a promenade-class deck, and already leaves narrow crossing
                # linkways as overpasses you pass under. The renderer has been
                # ready for these for three sessions; the data never sent them.
                #
                # `bridges` keeps its copy on purpose. pedBridge is what builds
                # the visible overhead structure, it is tuned against that list,
                # and it stands itself down where an authored bridge already
                # claims the span (the Palawan crossing). Removing the way from
                # `bridges` to stop a double-draw is the mistake SESSION 14
                # already made once: it cut the islet off the walkable network.
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
        # ...AND A STATION BOX WITH NO HEIGHT AND NO STOREYS IS THE SAME THING
        # WITHOUT THE TAG THAT SAYS SO.
        #
        # The rule above catches Dhoby Ghaut and Bencoolen because someone
        # tagged them `layer=-1`. HarbourFront's mapper tagged the same kind of
        # object `layer=1`, so it sailed through and became the second-largest
        # object in its district: a 14,189 m2 polygon extruded to a TYPE-DEFAULT
        # 18m, drawn 263m x 68m between VivoCity and HarbourFront Centre. An
        # opaque six-storey wall across the middle of the district's busiest
        # public space.
        #
        # HarbourFront MRT is underground -- concourse at B1, platforms at B2,
        # four surface exits plus an underground exit into VivoCity's B2, so its
        # above-ground height is NONE (Wikipedia; Land Transport Guru, via
        # research/harbourfront-landmarks.md). There is no 18m building there.
        #
        # THE RULE IS "DO NOT INVENT", NOT "STATIONS ARE UNDERGROUND". A station
        # that publishes a height keeps it (Tanjong Pagar Railway Station at 8m,
        # Sentosa's monorail stops at 10m); one that publishes storeys keeps
        # those too, and the squat guard now leaves them alone. What is refused
        # is the case where OSM says NOTHING about the above-ground form and we
        # answer with a type default -- because an MRT station polygon in this
        # city is routinely the underground extent, and a guess there is not a
        # small error, it is a wall.
        #
        # SCOPED BY SIZE, and the size is measured rather than picked: the boxes
        # this is aimed at are 14,189 and 23,714 m2, while a surface entrance
        # structure is 100-800 m2. At 2,000 m2 the only footprint in this world
        # it removes that the layer=-1 rule did not already remove is
        # HarbourFront's. Small station structures keep being drawn -- they are
        # real things a walker passes -- and they are simply no longer sized by
        # a default meant for offices.
        if tags.get("building") in ("train_station", "transportation") \
                and not tags.get("height") and not tags.get("building:levels") \
                and not tags.get("min_height"):
            _pts_st = ring(e["geometry"]) if len(e.get("geometry") or []) > 2 else []
            if len(_pts_st) > 2 and area(_pts_st) > 2000:
                skipped_station_box += 1
                continue
        # 3D MASSING OSM ALREADY HAS AND THIS PIPELINE IGNORED.
        #
        # `building:part` is how OSM records a building that is not one box:
        # One Raffles Quay is mapped as a podium with a NORTH tower at 245m and
        # a SOUTH tower at 139.9m, and this pipeline read only the outline and
        # drew a single 10,357 m2 slab at 245m -- the note in the height table
        # above has said "south tower is 139.9 and needs a part split" for
        # weeks, and the split was sitting in the data the whole time. Duo
        # Residences is mapped ONLY as a part, so it was missing entirely.
        #
        # Taken only when the part carries a height, levels or a name, i.e.
        # where someone modelled it deliberately. Parts that coincide with their
        # parent are caught by the same dedupe as everything else.
        if "building:part" in tags and "building" not in tags:
            # WATER IS NOT A MASS, WHATEVER ELSE IT IS TAGGED.
            #
            # Two ornamental ponds on the Keppel Marina East Desalination
            # Plant's public roof park (OSM ways 934999016 and 934999017) carry
            # `natural=water, water=pond` AND `building:part=yes,
            # building:levels=0.5` -- the part tags say "this sits on the roof
            # deck at half a level", which is true and is about POSITION, not
            # about being a building. Promoted here they became two 20m solid
            # blocks standing on the park, 1,079 and 1,035 m2, because 0.5
            # levels is 1.7m and the squat guard replaced it with a type
            # default. A pond drawn as a seven-storey block is the most visible
            # kind of wrong.
            #
            # Two in the whole world today, which is exactly why it is worth
            # the three lines: it is a rule, not a special case, and the next
            # roof pond will be handled without anyone finding it.
            if tags.get("natural") == "water" or tags.get("water"):
                pass
            elif tags.get("height") or tags.get("building:levels") or tags.get("name"):
                tags = dict(tags)
                tags["building"] = tags.get("building:part") or "yes"

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
            # Drop a fabricated height tag before it is ever read. Done here and
            # not in height_for() because the rule is about WHERE the building
            # is, and height_for() is given only tags.
            if tags.get("height") and HEIGHT_TAG_SUPPRESS:
                _gm = e.get("geometry") or []
                if _gm:
                    _la = sum(p["lat"] for p in _gm) / len(_gm)
                    _lo = sum(p["lon"] for p in _gm) / len(_gm)
                    for _s, _w, _n, _e in HEIGHT_TAG_SUPPRESS:
                        if _s <= _la <= _n and _w <= _lo <= _e:
                            SUPPRESSED_HEIGHT_TAGS.append(
                                (tags.get("name") or "(unnamed)", tags["height"]))
                            tags = dict(tags)
                            tags.pop("height", None)
                            break
            h, key, hsrc, podium = height_for(tags)
            # a 3,000 m2 footprint is never 3.5m tall: that is a bad tag, not a
            # single-storey building. Fall back to the type default.
            #
            # AND SAY SO. This overwrites the height but used to leave `hsrc`
            # alone, so a building whose 30m this rule INVENTED was still
            # reported as coming from surveyed OSM data -- the accuracy ledger
            # counted it as real. That is the same dishonesty the junk-height
            # guard in height_for() was already fixed for, one branch over.
            #
            # MEASURED 2026-07-31: this fires on 65 buildings that carry an
            # EXPLICIT building:levels tag. It is right about most of them --
            # Tang Plaza, Liat Tower and Far East Shopping Centre are all tagged
            # levels=-1, and Guoco Midtown II claims 2 levels on 11,247 m2. It
            # is wrong about the genuinely low ones: Peranakan Place is a real
            # two-storey conservation row and Redhill Wet Market is a real
            # single-storey market. A blanket exemption for explicit levels was
            # considered and REJECTED -- it would restore the -1s and flatten
            # real towers. Fix those individually with a source, as Peranakan
            # Place now is.
            _nm = norm(tags.get("name") or "")
            _sourced_low = _nm and any(k in _nm for k in SOURCED_LOW)
            # A STATION CONCOURSE IS GENUINELY ONE STOREY, AND THE GUARD WAS
            # TURNING THAT FACT INTO A 24-METRE BLOCK.
            #
            # `building=train_station` / `transportation` polygons carrying an
            # honest `building:levels=1` were being overridden here, because one
            # storey is under 8m and a concourse is always over 600 m2:
            # Kallang's Stadium station box (4,843 m2), Outram Park (3,406 m2)
            # and a 5,688 m2 transport hall in keppel were all drawn at 24m --
            # about seven storeys -- on top of an underground railway.
            #
            # This is the SOURCED_LOW argument applied to a whole class instead
            # of one name at a time: the tag is not a bad tag here, it is the
            # correct description of a single-storey hall. It stays scoped to
            # stations so the -1s and the two-level megamalls the guard exists
            # for are untouched.
            if tags.get("building") in ("train_station", "transportation") \
                    and tags.get("building:levels"):
                _sourced_low = True
            if h < 8 and a > 600 and not _sourced_low:
                h = TYPE_DEFAULT.get(tags.get("building", "yes"), 24)
                hsrc = "guess"
                # NOT `key = False`. That was tried and reverted: `key` is the
                # LANDMARK flag, not a statement about the height, and clearing
                # it dropped a building out of the landmark path into the
                # shophouse one -- S8 ("street-level tenants given a shopfront")
                # fell from 69 to 68 in Bras Basah. Being unsure of a height is
                # not a reason to stop believing a building is a landmark.
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
            # IDENTITY BY WAY ID, for footprints no other table can reach.
            # See OSM_WAY above. Applied here, before the name fallbacks, so a
            # researched name behaves exactly like an OSM one from this point
            # on -- it reaches the recipes, the facade families and the gates
            # through the same path, with nothing special-cased downstream.
            _wid = e.get("id") if e.get("type") == "way" else None
            _ow = OSM_WAY.get(_wid) if _wid else None
            # ...and the same by relation id, for multipolygon buildings. See
            # OSM_REL. `_wid` stays a way id so _OSM_WAY_SEEN keeps reporting on
            # ways only, which is what its "not in this extract" warning means.
            if _ow is None and e.get("type") == "relation":
                _ow = OSM_REL.get(e.get("id"))
            if _ow:
                _OSM_WAY_SEEN.add(_wid)
                if _ow.get("n") and not tags.get("name"):
                    b["n"] = _ow["n"]
                if _ow.get("m"):
                    # A HEIGHT A SOURCE PUBLISHED IN METRES, which the storey
                    # path below cannot carry without laundering it through a
                    # 3.4m assumption it was never measured with. Same "named"
                    # provenance LANDMARKS gets, because it is the same kind of
                    # fact reached by a different key: LANDMARKS matches a name
                    # and this matches a way id, which is the only handle on a
                    # building OSM leaves unnamed. VivoCity is exactly that —
                    # the largest footprint in harbourfront, no `name` tag at
                    # all, and `height=0`.
                    b["h"] = round(float(_ow["m"]), 1)
                    hsrc = "named"
                elif _ow.get("st"):
                    # A PUBLISHED STOREY COUNT, NOT A MEASUREMENT. Same 3.4m
                    # and the same "levels" provenance as building:levels, so
                    # the accuracy ledger keeps reporting it as what it is.
                    b["h"] = round(_ow["st"] * STOREY_FLOOR_M, 1)
                    # SET THE LOCAL `hsrc`, NOT A KEY ON b.
                    #
                    # The provenance that reaches the file is written further
                    # down as `b["hs"] = hsrc` from this variable. Writing
                    # b["hsrc"] instead put a key on the record that nothing
                    # ever reads, so eleven researched heights shipped with NO
                    # provenance at all and the accuracy ledger scored them as
                    # guesses -- the same "carried into the scene file and then
                    # ignored" sin this file already documents for roof:colour.
                    hsrc = "levels"
                if _ow.get("yr"):
                    b["yr"] = _ow["yr"]
                elif _ow.get("era"):
                    b["era"] = list(_ow["era"])
                # A SITE THAT OSM STILL CALLS A BUILDING, WHERE NO TAG AND NO
                # NAME CAN REACH IT. `con` is set two ways below — from
                # `building=construction`, and by NAME for One Sophia, where
                # OSM still tags a demolished block. Neither handle exists for
                # an unnamed `building=yes`, and that is exactly the footprint
                # a cleared site leaves behind. The way id is the only handle,
                # which is what this table is for.
                if _ow.get("con"):
                    b["con"] = 1
            # A NAME IS NOT ALWAYS IN THE NAME TAG.
            #
            # Raffles Hotel is mapped as a multipolygon RELATION carrying
            # wikidata=Q1538837 and addr:* but NO name, so it stood in this
            # world as an unnamed 3,742 m2 block that no recipe could ever
            # reach -- the most famous hotel in Singapore, rendered as generic
            # fabric. The only OSM nodes actually called "Raffles Hotel" nearby
            # are BUS STOPS, which is what makes this look unfixable until you
            # look at the relation.
            #
            # So: fall back through the tags that DO identify a building.
            # addr:housename is a name by definition. A wikidata id is not a
            # name and is never used as one -- it only marks the building as
            # identifiable, and NAMED_BY_WIKIDATA maps the few ids we have
            # actually checked to their real names. Guessing a name from an id
            # would be inventing one.
            _nm = tags.get("name") or tags.get("addr:housename")
            if not _nm:
                _wd = tags.get("wikidata")
                if _wd and _wd in NAMED_BY_WIKIDATA:
                    _nm = NAMED_BY_WIKIDATA[_wd]
            # LAST, so a surveyed name always wins: OneMap's answer for this
            # footprint's postcode. See postcode_name() above.
            # addr:neighbourhood before the postcode: OSM tags it on estate
            # blocks whose way carries no name (Reflections at Keppel Bay x12,
            # Pinnacle@Duxton x7, Blangah View x9...) — measured 2026-08-03:
            # 90 buildings >=200m2 across the world gain a name from a tag
            # already fetched. It is an estate name, honest for the block.
            if not _nm:
                _ab = tags.get("addr:neighbourhood")
                if _ab and len(_ab) > 2:
                    _nm = _ab
            if not _nm:
                _pn = postcode_name(tags)
                if _pn:
                    _nm = _pn
                    _PC_NAMED.append(_pn)
            if _nm and any(s in _nm.lower() for s in NAME_STRIP):
                NAMES_STRIPPED.append(_nm)
                _nm = None
            # A mapped name that names a demolished building is corrected
            # before anything downstream (LANDMARKS re-lookup, recipes,
            # signage) can act on the stale identity. See NAME_CORRECTIONS.
            if _nm:
                _fix = NAME_CORRECTIONS.get(" ".join(norm(_nm).split()))
                if _fix:
                    NAMES_CORRECTED.append((_nm, _fix))
                    _nm = _fix
            if _nm:
                b["n"] = _nm
            # A BUILDING NAMED LATE COULD NEVER INHERIT A RESEARCHED HEIGHT,
            # AND THAT MADE HAND-RESEARCHED LANDMARK ROWS INTO DEAD CODE.
            #
            # `height_for()` matches LANDMARKS against `tags["name"]`, and it
            # runs long before the block above, which is where a footprint with
            # NO name tag finally gets one -- from `addr:housename`, from
            # NAMED_BY_WIKIDATA, or from OneMap's answer for its postcode. So
            # for every building named that way, LANDMARKS was consulted with an
            # empty string and could not match.
            #
            # MEASURED CASE, and it is why this was found at all. Concourse
            # Skyline (298-300 Beach Road, 40 storeys) carries NO `name` tag in
            # OSM -- only `addr:neighbourhood=Concourse Skyline` and
            # `height=0` -- so it is named from its postcode. Its LANDMARKS row
            # had been researched and written on an earlier day, complete with a
            # careful note, and **it had never once fired**: the tower was drawn
            # at TYPE_DEFAULT["residential"] = 40m against a published 150m,
            # with `hs="guess"`, while a correct answer sat in the table.
            #
            # So: look LANDMARKS up again once the real name is known. Only for
            # a height that is not already hand-set -- "named" and "override"
            # come from tables that have already had their say -- and using the
            # same longest-match-wins rule, so nothing here can disagree with
            # height_for() about which key applies.
            # EXACT MATCH ONLY, and that restriction was bought with a
            # regression I caused and caught in the build log.
            #
            # The first version of this re-lookup used the same SUBSTRING rule
            # as height_for(). Rebuilding orchard with it printed:
            #
            #     Somerset Compass Singapore  68.0 -> 40 m
            #     The Ritz-Carlton Residences   20 -> 130 m
            #
            # Both wrong, and wrong in the exact way this whole table has been
            # bitten six times before. `"somerset"` is an EIGHT-character key
            # and it swallowed "Somerset Compass Singapore"; `"the ritzcarlton"`
            # (130m, the Millenia hotel in Marina Bay) swallowed "The
            # Ritz-Carlton Residences", a different building in Cairnhill that
            # already has its own 34-storey record. A fix for substring matching
            # that reintroduces substring matching is not a fix.
            #
            # height_for() can afford the loose rule because it is matching a
            # SURVEYED `name` tag against keys chosen for surveyed names. This
            # path is matching a name that was INFERRED -- from a postcode, from
            # wikidata, from an address -- so it is one inference deep already,
            # and a fuzzy match on top of an inference is two.
            #
            # The cost is real and is accepted: "The Ritz-Carlton, Millenia
            # Singapore" (drawn at 10.2m, published 130m) no longer picks up its
            # height here, because its name is not equal to any key. That is a
            # KNOWN wrong height left in place rather than a guess propagated to
            # a building that never asked for it, and the remedy is the one this
            # table already uses everywhere else: write the longer key by hand.
            if _nm and hsrc not in ("named", "override"):
                _lspec = LANDMARKS.get(norm(_nm))
                if _lspec is not None:
                    LATE_NAME_HEIGHTS.append((_nm, b.get("h"), _lspec["h"]))
                    b["h"] = _lspec["h"]
                    hsrc = "named"
                    b["hs"] = "named"
                    if _lspec.get("key"):
                        key = True
            if key:
                b["k"] = 1
            # WHAT KIND OF BUILDING IT IS, which the facade family never asked.
            # 2,057 of 8,740 footprints (24%) carry a specific `building=` value
            # — 864 of them residential, apartments or house, 597 retail,
            # commercial or office — and city.js chose a facade from a date, an
            # area's era band, or a hash, never from what the building IS. A
            # Singapore condo has balconies and service yards; drawing one as a
            # curtain-wall office because its footprint hashed that way is a
            # guess made in front of a fact. `yes` carries no information and is
            # not stored.
            _bt = tags.get("building")
            if _bt and _bt not in ("yes", "construction"):
                b["bt"] = _bt
            if hsrc != "guess":
                b["hs"] = hsrc          # height provenance, for the accuracy ledger
            # AFTER the provenance line, not before it: set here first, hsrc
            # overwrote it and the ledger went on calling a published figure a
            # storey-count derivation.
            if _nm:
                _lo = _nm.lower()
                for _k2, (_mlo, _mhi) in LANDMARK_MIN_HEIGHT.items():
                    if _k2 in _lo:
                        b["mh"], b["h"], b["hs"] = _mlo, _mhi, "named"
                        break
                # A published storey count, where nobody publishes metres.
                #
                # Applied over a guess, and ALSO over an OSM `building:levels`
                # figure -- both are storey counts, and a developer's own page
                # beats a crowd-sourced tag. lyf Farrer Park is the case: OSM
                # says 19 levels, Low Keng Huat's own project page says the
                # tower is 18, and without this the OSM tag won by arriving
                # first.
                #
                # NOT applied over "osm" (a surveyed `height=` tag), "named" or
                # "override" (published metres). Those are measurements, and a
                # storey count must never displace one.
                _sr0 = storey_record(_nm, b.get("a") or 0)
                if b.get("hs") in (None, "levels") or (_sr0 and _sr0[2]):
                    _sr = _sr0
                    if _sr:
                        b["h"] = round(_sr[0] * _sr[1], 1)
                        b["hs"] = "levels"
                        # A published single storey over a big plan is a market
                        # hall, not a squashed tower. Flagged so check.py's
                        # squat-footprint gate — which is right about every
                        # other case — does not report the correct answer as a
                        # defect. Set only from a source, never from a guess.
                        if _sr[0] <= 1:
                            b["low"] = 1
            # Remember WHICH HDB record this height came from, so the pass at
            # the end of build() can catch the case where several footprints
            # claim the same block. Stripped before the file is written.
            _hrec = hdb_record(tags)
            if _hrec and hsrc == "levels":
                b["_hdb"] = f"{_hrec['blk_no']}|{_hrec['street']}"
                # Floor-to-floor is not the height of a standalone single-storey
                # building: 2.9m is the gap between two slabs in a stack, and a
                # thing standing on its own has a roof and a parapet above that.
                # Left at 2.9 this tripped the "under 3m tall" gate, which is
                # right to complain -- nothing you can walk into is 2.9m to the
                # top.
                b["_hdbone"] = round(max(4.0, _hdb_height(1, _hrec)), 1)
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
                    # THE RATIO HERE TOO, for the same reason as the levels
                    # path below: `h` is not final at this point and `mh` is an
                    # absolute figure derived from the `h` of this moment.
                    # Quayside Isle was the case that proved the metres path
                    # needs it as much as the storeys path -- a research height
                    # of 6.8 landed after a min_height of 6.6 was read from a
                    # taller tag, leaving a base 0.2 m under its own top. It
                    # drew correctly (the lift test rejects it) and the data
                    # was still false, which is the kind of wrong that survives
                    # because nothing looks at it.
                    b["mr"] = round(_mh / h, 4)
            except ValueError:
                pass
            # THE SAME FACT IN STOREYS, WHICH IS HOW MOST OF IT IS ACTUALLY
            # RECORDED. `min_height` is on 63 footprints in this world;
            # `building:min_level` is on 880, and 817 of those carry no
            # `min_height` at all -- so the metres path above was reading 7% of
            # what OSM says about masses that start in the air.
            #
            # 564 of them sit at level 3 or higher and every one is currently
            # extruded from the ground. Measured in bugis: a tower crown mapped
            # as six stacked parts (levels 38-44, areas 251-2,168 m2) draws as
            # six solid columns standing on the street, the smallest a 259 m2
            # white shaft 108.8m tall where a 2.5m cap belongs.
            #
            # CONVERTED AS A FRACTION OF THIS FOOTPRINT'S OWN HEIGHT, never as
            # `min_level x 3.4`. `h` may have come from a surveyed `height`, from
            # HDB's storey table at its own rate, or from levels x 3.4 -- and a
            # cap derived at a DIFFERENT rate from the mass it caps floats above
            # it or sinks into it. min_level/levels is the one ratio that lands
            # correctly whichever path produced `h`, and it reduces to
            # min_level x 3.4 exactly when `h` came from levels.
            #
            # Deliberately NOT applied here: a footprint that starts in the air
            # needs something under it, and that cannot be known until every
            # building in the district has been read. Stashed, then resolved by
            # _lift_air_parts() below.
            if "mh" not in b:
                try:
                    _ml = float(str(tags.get("building:min_level", "")).strip())
                    _lvv = float(str(tags.get("building:levels", "")).strip())
                    if _ml >= 1 and _lvv > _ml:
                        b["_airlvl"] = (_ml, _lvv)
                except ValueError:
                    pass
            # A SURVEYED COLOUR BEATS A HASHED ONE -- BUT #ff3333 IS NOT A
            # SURVEY, IT IS A TRACING ARTEFACT, AND IT HAD PAINTED 1,617 ROOFS
            # IN THIS WORLD FIRE-ENGINE RED.
            #
            # Measured across every raw file on 2026-08-02, `roof:colour`
            # values by frequency:
            #
            #     #ff3333  2002      <- pure saturated red
            #     grey      146
            #     #ea5e2f   136
            #     #76c82e   124
            #     #e7e6e3   101
            #
            # The artefact is FOURTEEN TIMES more common than the commonest real
            # colour, and it is concentrated in the shophouse conservation belt
            # exactly where a bulk trace would land: chinatown 1,332, keppel
            # 651, marinabay 10, brasbasah 9. `#ff3333` is not a roof colour
            # anywhere on earth; the keppel research calls it a Bing-trace
            # artefact and records that the real Blair Plain tiles are unglazed
            # terracotta. It was reaching `rcol` on the **Asian Civilisations
            # Museum**, on Parliament House's **Chamber** and **Front Hall**,
            # and on **Maxwell Reserve**.
            #
            # REFUSED, NOT REMAPPED, and that is the whole design decision. The
            # same shape as the under-2.5m height guard above: record the bad
            # tag, fall through, and let the honest path answer. Remapping all
            # 2,002 to one terracotta would repaint Parliament House and the ACM
            # as clay-tiled too -- and this pipeline ALREADY gives conserved
            # terraces proper tiled roofs, so falling through is strictly better
            # than any single colour I could choose here.
            #
            # The valid-hex test rides along because it costs one regex and
            # catches a live trap: `#ddddd` (17 occurrences) and `#921384A` (2)
            # are in the raw data. Neither reaches a shipped file today -- those
            # elements are dropped or deduped first -- but a five-digit hex that
            # did reach one would not parse, and nothing would say why.
            for _src, _dst in (("building:colour", "col"), ("roof:colour", "rcol")):
                _v = (tags.get(_src) or "").strip()
                if not _v:
                    continue
                if not colour_ok(_v):
                    BAD_COLOUR_TAGS.append((tags.get("name") or "(unnamed)", _src, _v))
                    continue
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
            # HDB'S OWN COMPLETION YEAR, which is a published fact and not a
            # derivation -- unlike the storey count in the same record, which
            # only becomes a height by assumption. It goes in behind OSM's
            # start_date rather than over it, because start_date is a survey of
            # this particular building while the HDB row is a survey of the
            # block, and where they disagree the more specific one should win.
            #
            # This matters more than the heights do. Era is what steers the
            # facade family, and a public housing slab from 1968 does not look
            # like one from 1997; both were being dealt a family by hashing the
            # footprint because nothing in the pipeline knew when they went up.
            _rec = hdb_record(tags)
            if _rec:
                if not b.get("yr"):
                    _m = re.match(r"^(\d{4})", str(_rec.get("year_completed") or "").strip())
                    if _m and 1930 < int(_m.group(1)) <= 2030:
                        b["yr"] = int(_m.group(1))
                # A dated-photograph wall colour, where the estate has one.
                # Behind an OSM `building:colour` tag, which is a survey of
                # this particular block rather than of its street.
                if not b.get("col"):
                    _ec = hdb_estate_colour(_rec, b.get("a") or 0)
                    if _ec:
                        b["col"] = _ec
            for tk, key_out in (("building:material", "mat"),
                                ("building:colour", "col"),
                                ("roof:shape", "rs")):
                v = tags.get(tk)
                if not v:
                    continue
                # THE COLOUR GOES THROUGH THE SAME GATE AS EVERY OTHER COLOUR.
                # This loop used to write it unconditionally and it runs AFTER
                # the refusal above, so it quietly undid it. Material and
                # roof:shape are not colours and are unaffected.
                if tk == "building:colour" and not colour_ok(v):
                    BAD_COLOUR_TAGS.append((tags.get("name") or "(unnamed)", tk, str(v)[:16]))
                    continue
                b[key_out] = str(v)[:16]
            # researched frontage facts, only where OSM offers nothing
            _fn = (b.get("n") or "").lower()
            if _fn:
                _best = None
                for _k, _v in FRONTAGE_FACADE.items():
                    if _k in _fn and (_best is None or len(_k) > len(_best[0])):
                        _best = (_k, _v)
                if _best:
                    _yr, _col = _best[1]
                    if _yr and not b.get("yr"):
                        b["yr"] = _yr
                    if _col and not b.get("col"):
                        b["col"] = _col
            # A roof structure is a canopy with no walls: large and low is what
            # it IS, not a bad height. Flagged so the "no squat big footprint"
            # check does not report a 2,122 m2 covered area from 1930 as a
            # defect for being five metres tall.
            if tags.get("building") == "roof":
                b["roof"] = 1
            # UNDER CONSTRUCTION IS NOT A BUILDING YET. 72 footprints here are
            # tagged building=construction and NONE of them carries a height, so
            # every one falls through to a type default and is drawn as a
            # finished block. Two of them are enormous: IR2 at 32,610 m2 and NS
            # Square at 28,118 m2, both standing in Marina Bay as 18m slabs
            # where the real sites are hoardings and cranes.
            #
            # OSM CONSTRUCTION TAGS GO STALE, which is why this carries a flag
            # rather than deleting the mass: Piccadilly Grand completed around
            # 2023 and is still tagged construction, so it is excluded by name.
            # The renderer decides what to draw; the data only records what the
            # map says. Re-check this list when the tags are refetched.
            if tags.get("building") == "construction":
                # NoMad Singapore (the Faber House site) is EXTERNALLY COMPLETE
                # -- June 2026 photographs show full glazing, planting and the
                # rooftop sign in place, with only the five-foot way hoarded.
                # Its building=construction tag is stale, and drawing a finished
                # hotel as a hoarded site is worse than the tag is wrong.
                if not re.search(r"piccadilly|nomad", (tags.get("name") or ""), re.I):
                    b["con"] = 1
            # AND BY NAME, where OSM still tags a demolished building as a
            # building. One Sophia does not exist: Peace Centre and Peace
            # Mansion were sold en bloc and demolished, and two 19-storey towers
            # are under construction for ~2028 (research/heights-mixed.md). We
            # were drawing a 30m building on an empty site -- and its ring
            # self-crosses, which is what a footprint left over from a
            # demolished building tends to look like. Reviewed when the tags are
            # refetched; by 2028 this entry should be wrong and removed.
            elif re.search(r"^one sophia$", (tags.get("name") or "").strip(), re.I):
                b["con"] = 1
            buildings.append(b)

        elif "highway" in tags:
            kind = tags["highway"]
            # A LIFT LINE IS NOT A ROAD. Sentosa's SkyRide chair lift is
            # double-tagged aerialway=chair_lift + highway=raceway (the luge
            # complex), and the raceway tag put the LIFT CORRIDOR into
            # data.roads — so the rider could ride up a chairlift line, and
            # P1b reported the lift's own towers as structure standing in a
            # carriageway. Anything carrying an aerialway tag travels by
            # cable; it is cableway data (already emitted), never a road.
            if "aerialway" in tags:
                continue
            # STAIRS ARE NOT ROADS, AND A PATH IS A FOOTWAY.
            #
            # This branch takes ANY `highway=*`, which was harmless right up to
            # the moment the walkable-world topup started fetching
            # `highway=steps` and `highway=path` into the same raw file. They
            # went straight into data.roads: bugis picked up 26 steps and 3
            # paths, T2 ("road network islands") went to 10.3% against a budget
            # of 10 and refused the deploy -- and that was the SMALL symptom.
            # The real one is that a road is surfaced as carriageway, given
            # kerbs and lane markings, and offered to the traffic system: cars
            # would have driven up the steps of Fort Canning.
            #
            # Steps are dropped here because they already have a layer of their
            # own. A path is not dropped -- it is walkable ground and this world
            # is meant to be walkable -- but it is RENAMED to footway so it
            # inherits every existing footway rule at once. There are ten
            # separate `k === 'footway' || k === 'pedestrian'` tests across
            # city.js, markings.js, wayfind.js and sgdetail.js, and adding an
            # eleventh kind would have meant finding all ten and missing one.
            if kind == "steps":
                continue
            if kind == "path":
                kind = "footway"
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
            # KERBSIDE PARKING, which the map has been carrying all along.
            # 1,135 `parking:lane:*` tags across the eight districts — 716
            # parallel, 299 perpendicular, 26 diagonal — and data/unused.py has
            # been listing them as DEFERRED with the note "the data that will
            # place parked cars when traffic learns to park". A Singapore street
            # with no parked cars on it reads as a rendering, not a street.
            #
            # The ORIENTATION is the part that matters: a parallel bay, a
            # nose-in perpendicular bay and a diagonal bay put a car at three
            # different angles and three different spacings, and guessing one
            # would have been inventing what the map already states.
            _pk = {}
            for _side in ("left", "right", "both"):
                _v = tags.get(f"parking:lane:{_side}")
                if _v in ("parallel", "perpendicular", "diagonal"):
                    if _side == "both":
                        _pk["left"] = _pk["right"] = _v
                    else:
                        _pk[_side] = _v
            if _pk:
                r["pk"] = _pk
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
        # AN AXIS THAT IS NOT IN THIS DISTRICT IS WORSE THAN NO AXIS.
        #
        # This fell straight back to FALLBACK_ORCHARD -- a hardcoded Orchard
        # Road polyline -- for ANY district whose axis name failed to stitch,
        # and printed one soft line while doing it. kallang was built with
        # `axis: "stadium boulevard"`, a name that does not exist in OSM (the
        # real roads are Stadium Drive, Road, Walk and Place), so a district at
        # x 3190-4748 was given a spine at x -731..553 -- FOUR KILOMETRES
        # outside its own bbox, in another district entirely.
        #
        # It did not just look wrong, it corrupted the build: the fake axis
        # joins `roads`, terrain.py sizes the heightfield to reach every road
        # point, and the grid went from the 1.5km the district needs to 6.4km
        # wide -- 13,875 cells of which 2,565 are in the district. Worse, the
        # merge weights each district's grid by how far INSIDE it a point sits,
        # so kallang's grid centre landed over Chinatown carrying maximum
        # weight for ground it has no samples anywhere near.
        #
        # The right fallback is the district's OWN longest named road. It is
        # always in the extract, it is always in the bbox, and if it is the
        # wrong choice the coverage checks say so out loud instead of a
        # heightfield quietly growing four times too big.
        _by_name = {}
        for r in roads:
            nm = (r.get("n") or "").strip()
            if not nm or len(r.get("p") or []) < 2:
                continue
            _by_name[nm] = _by_name.get(nm, 0.0) + sum(
                math.dist(r["p"][i], r["p"][i + 1]) for i in range(len(r["p"]) - 1))
        if _by_name:
            _pick = max(_by_name, key=_by_name.get)
            print(f"  ! could not stitch an axis named '{AXIS_NAME}' -- no such road "
                  f"in this extract. Falling back to the longest road that IS here: "
                  f"'{_pick}' ({_by_name[_pick]:.0f}m). FIX districts.json.")
            axis = stitch(re.escape(_pick)) or []
            axis_name = _pick
        else:
            axis = []
        if len(axis) < 2:
            print("  ! no named road in this extract either — falling back to the "
                  "hardcoded Orchard polyline. This is almost certainly wrong.")
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

    # WHICH WAY IS OUT, WHEN THE VERTEX IS ON THE CENTRELINE ITSELF.
    #
    # clear_vertex pushed every vertex along `vertex - closest point on the
    # centreline`, which carries no usable sign once that distance goes to
    # zero — and it goes to zero routinely, because OSM shares nodes: a
    # building ring edge is often literally the road way. The Marina Bay
    # Cruise Centre Car Park (way 187888615) is exactly that. Two of its eight
    # nodes ARE the two nodes of a Marina Coastal Drive stub, so subdivide()
    # laid a run of vertices ON the centreline at d ~= 0.05m, and each one was
    # flung to whichever side 0.1m of rounding happened to pick. Measured on
    # the shipped ring: consecutive vertices landing at -5.19m and +5.22m
    # about the same corridor, an 8-point footprint arriving as a
    # 69-point self-intersecting bowtie whose shoelace area (7,683 m2) no
    # longer matched its own recorded area (8,549 m2). That is what P1b was
    # reporting at 2984,10988 and what took P5 from 0 to 1.
    #
    # So when the offset is too short to carry a direction, take the direction
    # from the RING instead: the normal at that vertex, derived from the ring's
    # own winding. It is stable along a whole edge, so a run of on-centreline
    # vertices leaves together instead of turning the ring inside out.
    #
    # AND IT GOES INWARD, WHICH IS THE OPPOSITE OF THE FIRST VERSION.
    #
    # When a ring EDGE is the centreline, the corridor straddles it: half the
    # carriageway is already inside the footprint. Pushing such a vertex
    # outward moves the wall FURTHER ACROSS the road, which is the opposite of
    # what this pass is for. Pushing it inward shrinks the footprint off the
    # carriageway. Measured both ways across the two districts that have this
    # geometry, rather than argued:
    #
    #                     outward   inward
    #   marinasouth P1b       1        0
    #   marinasouth P5        1        0
    #   marinabay   P5        2        0
    #   marinabay   S8       52       57      (a FLOOR — outward FAILED it)
    #
    # Outward also cost marinabay a shopfront: it inserted four vertices that
    # bulged the Marina Bay Sands podium 1.0-1.9m into Bayfront Avenue, which
    # broke one frontage run in two and left "Swarovski" with no bay. Nothing
    # about that was visible in P1b, which is why the S8 floor is worth having.
    def ring_outward(ring):
        """Outward unit normal per vertex, from the ring's own winding."""
        n = len(ring)
        a2 = 0.0
        for i in range(n):
            x1, z1 = ring[i]
            x2, z2 = ring[(i + 1) % n]
            a2 += x1 * z2 - x2 * z1
        s = 1.0 if a2 > 0 else -1.0
        out = []
        for i in range(n):
            ax2, az2 = ring[(i - 1) % n]
            bx2, bz2 = ring[(i + 1) % n]
            tx, tz = bx2 - ax2, bz2 - az2
            L = math.hypot(tx, tz)
            out.append(None if L < 1e-9 else (s * tz / L, -s * tx / L))
        return out

    # Below this, `vertex - closest point` is rounding noise, not a direction.
    # The ring grid is 0.1m and subdivide() rounds to it, so 0.4m is several
    # times the largest offset that can be manufactured by rounding alone
    # while staying far under the ~5m clearances being applied.
    # SG_ONCENTRE=0 restores the old behaviour (leave on-centreline vertices
    # where they are), which is how this change was A/B'd district by district.
    ONCENTRE = float(os.environ.get("SG_ONCENTRE") or 0.4)
    # -1 (the default, and the measured one) pushes such a vertex INWARD, so
    # the footprint shrinks off the road. +1 restores the first version's
    # outward push, which is how the table above was measured.
    ONCENTRE_SIDE = float(os.environ.get("SG_ONCENTRE_SIDE") or -1.0)
    _oncentre = [0]                    # how often the ring normal was needed

    def clear_vertex(px, pz, tol=0.0, out=None):
        """Slide a vertex out of every corridor it is inside. Returns the point
        and whether it moved.

        `tol` is how far inside a corridor a point may be before it counts as
        being in it. It exists for the EDGE pass below: a wall that runs
        alongside a kerb has midpoints a few centimetres inside it constantly,
        from rounding and from an edge being the chord of a curved corridor, and
        treating those as crossings inserted 6,209 vertices where 106 edges
        actually cross and grew the scene file by 10%.

        `out` is the ring's own outward normal at this vertex, used when the
        vertex sits ON a centreline. Without it such a vertex is left alone,
        which is what the `d > 1e-6` guard used to do for the exactly-zero case
        and what it could not do for the 0.05m case — see ring_outward above."""
        moved = False
        for (a, c, clear) in corridors_near(px, pz):
            d, cx, cz = seg_dist(px, pz, a[0], a[1], c[0], c[1])
            if d >= clear - tol:
                continue
            if d > max(ONCENTRE, 1e-6):
                nx, nz = (px - cx) / d, (pz - cz) / d
            elif out is not None and ONCENTRE > 0:
                # The ring normal gives the SIDE; the corridor's own
                # perpendicular gives the DIRECTION. Leaving along the ring
                # normal alone lands the vertex `clear` from the closest point
                # but nearer than that to the rest of the segment, which is
                # how the first version of this took P5 from 1 to 2 while
                # fixing P1b. Only where the closest point is a segment END is
                # there no perpendicular to use, and there the radial push is
                # the right one anyway.
                ux, uz = c[0] - a[0], c[1] - a[1]
                uL = math.hypot(ux, uz)
                # THE DEGENERATE GUARD HAS TO COME FIRST. It was written and it
                # was correct, and it sat one line BELOW the division it was
                # protecting: `uL < 1e-9` was tested after `-uz / uL` had
                # already raised. It never fired because no corridor in the
                # scene had a zero-length segment — until the building
                # multipolygons arrived (see data/relgeom.py), one of which
                # stitches a ring with a repeated point, and the whole build
                # died with ZeroDivisionError.
                if uL < 1e-9:
                    nx, nz = out[0] * ONCENTRE_SIDE, out[1] * ONCENTRE_SIDE
                else:
                    nx, nz = -uz / uL, ux / uL
                    s2 = (nx * out[0] + nz * out[1]) * ONCENTRE_SIDE
                    if abs(s2) < 1e-6:
                        nx, nz = out[0] * ONCENTRE_SIDE, out[1] * ONCENTRE_SIDE
                    elif s2 < 0:
                        nx, nz = -nx, -nz
                _oncentre[0] += 1
            else:
                continue
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

    moved_pts, moved_b, oncentre = 0, 0, 0
    for b in buildings:
        touched = False
        # The hints come off the ring BEFORE any of it moves; computing them
        # inside the loop would read neighbours this pass had already nudged.
        outs = ring_outward(b["p"])
        for j, (px, pz) in enumerate(b["p"]):
            px, pz, moved = clear_vertex(px, pz, out=outs[j])
            if moved:
                touched = True
                moved_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            moved_b += 1
    print(f"  road clearance: nudged {moved_pts} vertices across {moved_b} buildings"
          f", {_oncentre[0]} of them off a shared centreline along the ring normal")

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
        # DEDUPE LAST, NOT FIRST. This was first done where the ring is created,
        # which is too early to matter: subdivide() runs afterwards and INSERTS
        # interpolated vertices rounded to the same 0.1m, so a short segment
        # comes back out of it holding several identical points. OUE Link ended
        # up with eleven of them in a 22-point ring and D13 read the zero-length
        # segments between them as a ring that crosses itself.
        b["p"] = simplify(b["p"]) if os.environ.get("SG_NO_FINAL_RINGS") else dedupe_ring(simplify(b["p"]))
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
        outs = ring_outward(b["p"])
        for j, (px, pz) in enumerate(b["p"]):
            px, pz, moved = clear_vertex(px, pz, out=outs[j])
            if moved:
                touched = True
                again_pts += 1
            b["p"][j] = [round(px, 1), round(pz, 1)]
        if touched:
            again_b += 1
    print(f"  re-cleared after simplify: {again_pts} vertices "
          f"across {again_b} buildings")

    buildings.sort(key=lambda b: -b["a"])

    # ONE HDB RECORD, ONE BLOCK. An HDB row describes a whole block, but a block
    # address gets tagged on more than one footprint: the ancillary shop unit at
    # its foot, a link bridge, a bin centre. Those inherited the block's storey
    # count and stood up as tall as the slab -- "Essen @ The Pinnacle", a 395 m2
    # retail unit at the base of Pinnacle@Duxton, took the block's height off a
    # 50-storey record.
    #
    # The block itself is the largest footprint carrying the address. But NOT
    # every other footprint on that address is an annexe: plenty of HDB blocks
    # are mapped as two or three wings meeting at a stair core, and each wing is
    # as tall as the block. Demoting those would be a far worse error than the
    # one this guard exists to fix.
    #
    # So size decides. A footprint under a third of the block's is an appendage
    # and gets ONE storey at the block's own floor rate; anything comparable is
    # treated as another wing and keeps the block's height. The demoted ones
    # also lose their "levels" provenance, because the ledger must not go on
    # counting a height this pass has just thrown away.
    #
    # One storey, not the type default: falling back to TYPE_DEFAULT["yes"] = 18
    # stood a 75 m2 appendage up as an 18m needle in a back lane and failed the
    # gate that exists to catch exactly that shape.
    _by_rec = {}
    for b in buildings:
        if b.get("_hdb"):
            _by_rec.setdefault(b["_hdb"], []).append(b)
    _demoted = 0
    for _k, _group in _by_rec.items():
        if len(_group) < 2:
            continue
        _group.sort(key=lambda b: -b["a"])
        _blockarea = _group[0]["a"]
        for b in _group[1:]:
            if b["a"] >= 0.35 * _blockarea:
                continue                       # another wing of the same block
            b["h"] = b.get("_hdbone", 4.0)
            b.pop("hs", None)
            _demoted += 1
    if _demoted:
        print(f"  HDB join: {_demoted} ancillary footprints sharing a block "
              f"address demoted off the block's storey count")
    for b in buildings:
        b.pop("_hdb", None)
        b.pop("_hdbone", None)

    # THE HDB JOIN AGAIN, THIS TIME BY POSITION RATHER THAN BY ADDRESS.
    #
    # The address join above is exact and is the right first pass, but it only
    # reaches footprints that CARRY `addr:housenumber` and `addr:street`. Many
    # HDB slabs in OSM carry neither -- traced from imagery, never tagged -- so
    # the join landed on 39 of Robertson's 558 buildings and the storey count
    # and completion year had nowhere to attach.
    #
    # data/hdb_geocode.py asks SLA's OneMap where each block is. A block number
    # and street IS an address, OneMap is the authority on Singapore addresses,
    # and point-in-polygon is not a guess.
    #
    # APPLIED ONLY OVER A GUESS. A surveyed height tag, a published figure or
    # the address join all say more about a specific building than "an HDB
    # address point falls inside this ring", so none of them is displaced. The
    # year is set whenever it is missing, because year_completed is published
    # either way.
    _pts = _hdb_points()
    if _pts:
        _spat_h = _spat_y = 0
        for b in buildings:
            p = b.get("p") or []
            if len(p) < 3:
                continue
            xs = [q[0] for q in p]; zs = [q[1] for q in p]
            x0, x1, z0, z1 = min(xs), max(xs), min(zs), max(zs)
            for (px, pz, rec) in _pts:
                if px < x0 or px > x1 or pz < z0 or pz > z1:
                    continue
                if not _point_in_ring(px, pz, p):
                    continue
                try:
                    st = int(rec["max_floor_lvl"])
                except (TypeError, ValueError):
                    break
                if st >= 1 and not b.get("hs"):
                    b["h"] = round(_hdb_height(st, rec), 1)
                    b["hs"] = "levels"
                    if st <= 1 and (b.get("a") or 0) > 600:
                        b["low"] = 1
                    _spat_h += 1
                if not b.get("yr"):
                    _m2 = re.match(r"^(\d{4})", str(rec.get("year_completed") or "").strip())
                    if _m2 and 1930 < int(_m2.group(1)) <= 2030:
                        b["yr"] = int(_m2.group(1))
                        _spat_y += 1
                if not b.get("col"):
                    _ec2 = hdb_estate_colour(rec, b.get("a") or 0)
                    if _ec2:
                        b["col"] = _ec2
                break
        if _spat_h or _spat_y:
            print(f"  HDB join by position: {_spat_h} heights, {_spat_y} years on "
                  f"footprints that carry no address tags")

    # A LOW BUILDING WITH A SOURCED STOREY COUNT IS NOT A SQUAT DEFECT.
    #
    # check.py fails any footprint over 600 m2 standing under 8m, and it is
    # right to: that shape is almost always a site polygon wearing its podium's
    # height, which is the single most common way this world goes wrong.
    #
    # But it is not ALWAYS that. A two-storey HDB multi-storey car park deck
    # over 1,682 m2 really is 5.6m, and a two-storey commercial block really is
    # 7.3m, and both of those numbers came from HDB's own storey counts rather
    # than from a guess. The gate started reporting the correct answer as a
    # defect the moment the storey joins began landing.
    #
    # So the exemption is scoped to PROVENANCE, not to size: only a height that
    # came from a storey count somebody published gets it. Anything still
    # sitting on a type default is exactly what the gate was written to catch
    # and keeps failing.
    _lowflag = 0
    for b in buildings:
        if (b.get("hs") == "levels" and (b.get("h") or 99) < 8
                and (b.get("a") or 0) > 600 and not b.get("low")):
            b["low"] = 1
            _lowflag += 1
    if _lowflag:
        print(f"  {_lowflag} low buildings exempted from the squat check: their "
              f"storey count is sourced, not guessed")

    # WHICH GAZETTED CONSERVATION AREA IS THIS BUILDING STANDING IN?
    #
    # Nested polygons are the reason this takes the SMALLEST containing area
    # rather than the first hit: "Little India" and "Little India Historic
    # District Core Area" are two polygons, one inside the other, and the core
    # is the more specific statement about the ground.
    _cons = _conservation_areas()
    if _cons:
        _tagged = _dated = _restored = 0
        for b in buildings:
            p = b.get("p") or []
            if len(p) < 3:
                continue
            cx = sum(q[0] for q in p) / len(p)
            cz = sum(q[1] for q in p) / len(p)
            best = None
            for _ca in _cons:
                x0, z0, x1, z1 = _ca["box"]
                if cx < x0 or cx > x1 or cz < z0 or cz > z1:
                    continue
                if not any(_point_in_ring(cx, cz, r) for r in _ca["rings"]):
                    continue
                if best is None or _ca["area"] < best["area"]:
                    best = _ca
            if not best:
                continue
            b["cons"] = best["name"]
            _tagged += 1
            # A CONSERVED BUILDING CANNOT POST-DATE ITS OWN GAZETTE. URA
            # conserves what is already old, so a start_date at or after the
            # gazette year is a RESTORATION date wearing a construction date's
            # tag. OSM carries start_date=1990 on 326 buildings in Chinatown
            # (Tanjong Pagar), gazetted 1989, and 1990 puts a pre-war masonry
            # terrace in the balconied-slab family of the eighties.
            _gaz = CONSERVATION_GAZETTE.get(best["name"])
            if _gaz and b.get("yr") and b["yr"] >= _gaz:
                b.pop("yr", None)
                _restored += 1
            band = CONSERVATION_ERA.get(best["name"])
            if band and not b.get("yr"):
                b["era"] = list(band)
                _dated += 1
        if _tagged:
            print(f"  conservation: {_tagged} buildings inside a gazetted area, "
                  f"{_dated} given a construction-period band"
                  + (f", {_restored} restoration dates dropped" if _restored else ""))

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

    # DEDUPE BEFORE ATTEMPTING ANY REPAIR.
    #
    # Every ring reported as self-crossing was really a ring full of ZERO-LENGTH
    # segments. subdivide() inserts interpolated vertices and rounds them to
    # 0.1m, so a short edge comes back holding several identical points -- OUE
    # Link's 22-point ring held eleven -- and _segs_cross cannot answer
    # sensibly about a segment with no direction. The greedy repair below then
    # spent ten passes dropping vertices and gave up, because dropping one of a
    # duplicated pair leaves the other.
    #
    # Removing them first is not a workaround for the check: identical
    # consecutive vertices extrude into zero-area triangles that cost a draw
    # and shade unpredictably, so the ring is genuinely better without them.
    _dd = 0
    for _b in ([] if os.environ.get("SG_NO_FINAL_RINGS") else buildings):
        _n0 = len(_b["p"])
        _b["p"] = despike_ring(dedupe_ring(_b["p"]))
        _dd += _n0 - len(_b["p"])
    if _dd:
        print(f"  dropped {_dd} degenerate ring vertices (zero-length segments and spurs)")

    # CUT THE LOOP, DON'T NIBBLE AT IT.
    #
    # A crossing splits a ring into two closed loops. Dropping single vertices
    # (the greedy repair below) only works when one of those loops is a spike;
    # when it is a thin SLIVER LOOP -- out along one path, back along a
    # slightly different one -- every candidate removal scores the same and the
    # search sits on a plateau. OUE Link's upper deck survived twenty-eight
    # passes of it, and survived the despike too, because its tail never quite
    # doubles back on a single vertex.
    #
    # Cutting at the crossing and keeping the LARGER of the two loops is the
    # standard repair and it terminates: every cut strictly shortens the ring.
    # The bigger loop is the building; the smaller one is the artefact.
    def _area2(ring):
        return abs(sum(ring[i][0] * ring[(i + 1) % len(ring)][1]
                       - ring[(i + 1) % len(ring)][0] * ring[i][1]
                       for i in range(len(ring))))

    def _uncross(ring):
        r = list(ring)
        for _ in range(40):
            n = len(r)
            if n < 5:
                break
            hit = None
            for i in range(n):
                for j in range(i + 2, n):
                    if i == 0 and j == n - 1:
                        continue
                    if _segs_cross(r[i], r[(i + 1) % n], r[j], r[(j + 1) % n]):
                        hit = (i, j)
                        break
                if hit:
                    break
            if not hit:
                break
            i, j = hit
            inner = r[i + 1:j + 1]
            outer = r[:i + 1] + r[j + 1:]
            if len(inner) < 3 or len(outer) < 3:
                break
            r = inner if _area2(inner) > _area2(outer) else outer
        return r

    _cut = 0
    for _b in ([] if os.environ.get("SG_NO_FINAL_RINGS") else buildings):
        if _self_crossing(_b["p"]):
            _r = _uncross(_b["p"])
            if len(_r) >= 3 and not _self_crossing(_r) and _area2(_r) > 8:
                _b["p"] = _r
                _cut += 1
    if _cut:
        print(f"  {_cut} self-crossing footprints repaired by cutting at the crossing")

    # Greedy: repeatedly drop the vertex whose removal removes the most
    # crossings. One pass fixed eight of nine, and Capitol Singapore needed
    # more than one vertex gone — a single-shot repair left it broken and
    # the hunt kept reporting it. A FUNCTION, not an inline pass, because the
    # FINAL ring pass needs it too: rings that self-cross only after the
    # carriageway edge-clear inserts vertices (four Distripark roof canopies,
    # found by D13 on 2026-08-02) never reach this mid-build loop, and the
    # final pass's _uncross alone could not mend them.
    def _greedy_uncross(ring):
        _ring = list(ring)
        _plateau = 0
        # TEN PASSES WAS NOT ENOUGH FOR A LONG RING. Each pass drops at most
        # one vertex, so a 29-point footprint folded in several places -- OUE
        # Link's upper deck -- ran out of passes with a crossing left. The loop
        # already exits the moment the ring is clean, so a higher ceiling costs
        # nothing on the rings that were fine after two.
        for _pass in range(28):
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
        return _ring

    _fixed = _left = 0
    for _b in ([] if os.environ.get("SG_NO_RING_REPAIR") else buildings):
        if not _self_crossing(_b["p"]):
            continue
        _ring = _greedy_uncross(_b["p"])
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

    def _find_buried(buildings):
        """Which of these footprints are completely inside a larger, at-least-
        as-tall one. Made a function on 2026-08-01 so it can run a SECOND time
        after the polygon surgery below, which is where six of them came from:
        the surgery segments a long terrace every ~16m and splits rings a road
        runs through, so it MANUFACTURES footprints after this test has already
        run. Four 44-114 m2 pieces ended up entirely inside The Riverside Piazza
        and two inside Fraser Residence Promenade, invisible and z-fighting,
        and D10 found them the moment building:part arrived and gave the
        surgery more to cut. A filter that runs before the thing that creates
        its inputs is not a filter."""
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
        # WHY THERE IS NO "NAMED TOWERS ARE EXEMPT" GUARD HERE.
        #
        # This filter drops ELEVEN NAMED CBD TOWERS -- Asia Square Tower 2,
        # Singapore Land Tower, Court Tower, both Unity towers, both One Shenton
        # towers and three fragments of One Raffles Place Tower 2 -- and that
        # looks alarming enough that exempting them is the obvious fix. It was
        # tried on 2026-07-31 and REVERTED, because it makes things worse.
        #
        # The filter only drops a footprint whose parent is BOTH larger AND at
        # least as tall. That means the tower is completely enclosed by its
        # parent and cannot be seen. Restoring it adds hidden geometry and
        # z-fighting and changes nothing on screen: Singapore Land Tower came
        # back as a 1,591 m2 tower at 190m sitting inside a 3,749 m2 site at
        # 190m.
        #
        # The actual fault is UPSTREAM. LANDMARKS matches by substring, so
        # "one shenton" puts the TOWER's 214m on the whole SITE polygon, and a
        # site as tall as its towers swallows them. The fix per building is to
        # split podium from towers, as done for One Raffles Quay above -- which
        # needs a podium height per site, i.e. research, not a filter change.
        # Logged in NEXT.md.
            if _n >= 4 and _in / _n > 0.8:
                _buried.append(_b)
        for _b in buildings:
            _b.pop("_bb", None)
        return _buried

    def _drop_buried(blds, when=""):
        _buried = _find_buried(blds)
        if not _buried:
            return blds
        _names = ", ".join((b.get("n") or "(unnamed)") for b in _buried[:3])
        print(f"  dropped {len(_buried)} footprints buried inside a taller "
              f"building{when}: {_names}" + ("..." if len(_buried) > 3 else ""))
        _bset = {id(b) for b in _buried}
        return [b for b in blds if id(b) not in _bset]

    def _lift_air_parts(blds):
        """Raise the footprints `building:min_level` says begin above the
        ground -- but only where something is under them.

        WHY THE SUPPORT TEST IS NOT OPTIONAL. Lifting a mass off the ground
        trades one defect for a worse one if nothing holds it up: a needle
        standing in the street is wrong and a slab hanging in mid-air over the
        street is wrong AND looks deliberate. 125 of the 572 candidates in this
        world have nothing beneath them at the height their tags imply, and
        they are not one kind of thing -- some are genuine sky bridges whose
        piers OSM does not map, some are parts of a tower whose lower parts
        carry no levels at all, and some are simply mistagged.

        So the rule is the honest one: lift it when the data can show a mass
        under it that reaches that height, leave it on the ground when it
        cannot, and COUNT the ones left behind. A silent `continue` here would
        be indistinguishable from never having read the tag -- which is exactly
        what this function exists to stop being true.

        `mh` is set BEFORE _drop_buried runs, because the burial rule already
        knows that a footprint with `mh` occupies none of the ground beneath it
        and must not swallow what it floats over (the SkyPark case).
        """
        _cand = [b for b in blds if b.get("_airlvl")]
        if not _cand:
            return
        _CELL = 60.0
        _grid = {}
        for _b in blds:
            _xs = [q[0] for q in _b["p"]]; _zs = [q[1] for q in _b["p"]]
            for _cx in range(int(min(_xs) // _CELL), int(max(_xs) // _CELL) + 1):
                for _cz in range(int(min(_zs) // _CELL), int(max(_zs) // _CELL) + 1):
                    _grid.setdefault((_cx, _cz), []).append(_b)
        _lifted, _thin, _floating = 0, 0, []
        for _b in _cand:
            _ml, _lvv = _b.pop("_airlvl")
            _h = _b.get("h") or 0
            _mh = round(_ml * _h / _lvv, 1)
            # city.js draws the lift only for 1 < mh < h - 0.5; anything outside
            # that is a part whose own tags leave it no thickness to draw.
            if not (1.0 < _mh < _h - 0.5):
                _thin += 1
                continue
            _cx = sum(q[0] for q in _b["p"]) / len(_b["p"])
            _cz = sum(q[1] for q in _b["p"]) / len(_b["p"])
            _ok = False
            for _o in _grid.get((int(_cx // _CELL), int(_cz // _CELL)), []):
                if _o is _b:
                    continue
                # starts at or below this one, and reaches up to it
                if (_o.get("mh") or 0) <= _mh + 0.5 and (_o.get("h") or 0) >= _mh - 1.0 \
                        and _inpoly(_o["p"], _cx, _cz):
                    _ok = True
                    break
            if _ok:
                _b["mh"] = _mh
                # ...AND THE RATIO IT CAME FROM, because `h` IS NOT FINAL HERE.
                #
                # `mh` is an absolute metre figure derived from the `h` this
                # footprint had at THIS moment. Post-passes rewrite `h` freely
                # -- heights.py from research, names.py's ADDS from surveyed
                # site coordinates at storeys x 3.1 -- and nothing told `mh`.
                # Measured 2026-08-21: 4 of the 17 footprints carrying `mh`
                # had a base at or above their own top, three of them Hotel
                # Michael parts (h 36.6, mh 40.8) where a `site` height landed
                # after the lift was computed from levels x 3.4. A mass that
                # starts above where it ends is not a rounding error.
                #
                # The comment above already says why the RATIO is the durable
                # fact -- "min_level/levels is the one ratio that lands
                # correctly whichever path produced `h`" -- it just was not
                # kept. Now it is, and city.js derives the base from it, so a
                # later height change carries the base with it instead of
                # stranding it.
                _b["mr"] = round(_ml / _lvv, 4)
                _lifted += 1
            else:
                _floating.append(f"{_b.get('n') or '(unnamed)'} lv{int(_ml)}/{int(_lvv)} @{_mh}m")
        print(f"  building:min_level: {_lifted} footprint(s) lifted off the ground"
              + (f", {_thin} with no thickness to draw" if _thin else "")
              + (f", {len(_floating)} LEFT ON THE GROUND with nothing beneath them"
                 f" ({', '.join(_floating[:3])}" + ("..." if len(_floating) > 3 else "") + ")"
                 if _floating else ""))

    _lift_air_parts(buildings)
    buildings = _drop_buried(buildings)

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

    # AND AGAIN, because the surgery just made new footprints. See _find_buried.
    buildings = _drop_buried(buildings, " (after surgery)")

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

    # ---- THE SEA -----------------------------------------------------------
    # `natural=coastline` has been fetched since the fetch was written and read
    # by NOTHING. Every district so far is inland or faces the reservoir, so it
    # never showed; five of the six left in the ring face open sea, and without
    # this they render the Straits as dry land a rider can ride out onto.
    #
    # OSM does not map the sea as a polygon. It maps the shoreline as open ways
    # whose DIRECTION carries the meaning -- land on the left -- so the sea has
    # to be constructed: stitch the fragments, clip to the bbox, and close the
    # ring around the right-hand side. data/coastline.py does that and checks
    # the result against points of known side, because a ring wound the wrong
    # way floods the city and looks entirely plausible doing it (it did, first
    # try: Bay East Garden came out as sea).
    #
    # Emitted as ordinary `water` with `k: "sea"` ON PURPOSE. The sink rule,
    # the dry() placement guards, standable(), and W1/W2/W3 all already work on
    # `water`, so the sea behaves correctly the day it lands with no new
    # drawing code and no new checks. `k` is carried so anything that later
    # needs to tell sea from reservoir still can.
    _coast_ways = [e for e in els
                   if (e.get("tags") or {}).get("natural") == "coastline"
                   and e.get("geometry")]
    if _coast_ways and not BBOX:
        print(f"  ! {len(_coast_ways)} coastline ways present but SG_BBOX is unset — "
              f"cannot close the shore against the district edge; sea SKIPPED")
    if _coast_ways and BBOX:
        try:
            sys.path.insert(0, HERE)
            import coastline as _cl
            _rings = _cl.sea_polygons(_coast_ways, BBOX)
            _added = 0
            for _r in _rings:
                pts = [proj(q["lat"], q["lon"]) for q in _r]
                if len(pts) < 4:
                    continue
                a2 = 0.0
                for i in range(len(pts)):
                    q1, q2 = pts[i], pts[(i + 1) % len(pts)]
                    a2 += q1[0] * q2[1] - q2[0] * q1[1]
                water.append({"p": [[round(x, 1), round(z, 1)] for x, z in pts],
                              "a": round(abs(a2) / 2), "k": "sea"})
                _added += 1
            print(f"  sea: {len(_coast_ways)} coastline ways -> {_added} polygon(s) "
                  f"({sum(w['a'] for w in water if w.get('k') == 'sea'):,} m2)")
        except Exception as _e:
            print(f"  ! coastline reader failed ({type(_e).__name__}: {_e}); "
                  f"THE SEA WILL RENDER AS LAND. Do not ship this district.")

    # ---- THE SUPERTREES ARE MODELLED TWICE, AND THE TWO DISAGREE -----------
    #
    # Gardens by the Bay is in this world twice over. `man_made=tower` nodes
    # give 7 of them, snapped to the published 25/30/37/42/50m set. OSM ALSO
    # models each Supertree as a STACK of `building:part` slices carrying
    # `building:material=grass` at 30/33/36/41m — and those come through the
    # ordinary building path as lime-green blocks. Measured in the marinabay
    # extract: 12 clusters of 3 to 6 slices each, of which FOUR sit within a
    # metre of a tower node. The published 25m Supertree at 3466,9341 had a 41m
    # green mass standing through it, and the 30m one at 3449,9362 had another.
    #
    # The polygons are the MORE COMPLETE set — 12 clusters against 7 nodes — so
    # deleting them and keeping the nodes would lose eight Supertrees. Both are
    # reconciled into the tower path instead: each cluster becomes one
    # Supertree at its own centroid, height taken from its tallest slice and
    # snapped to the published set, and the slices are dropped from `buildings`
    # so nothing is drawn twice.
    #
    # THE GUARD THAT MATTERS, AND MEASURING FOUND IT: a thirteenth cluster sits
    # at 1858,9147 — 1.5km from the Gardens, ONE part, 280m tall, and tagged
    # grass because it has a planted roof. A rule that said "grass mass = a
    # Supertree" would have deleted a 280m tower. So a cluster qualifies only
    # if it is a STACK (2+ slices, which is how OSM models a tapering trunk)
    # and its height is inside the range a Supertree can be.
    _ST_LO, _ST_HI, _ST_JOIN = 20.0, 60.0, 14.0
    _st_cand = []
    for _b in buildings:
        if (_b.get("mat") or "") != "grass":
            continue
        _h = _b.get("h") or 0
        if not (_ST_LO <= _h <= _ST_HI):
            continue
        _cx = sum(p[0] for p in _b["p"]) / len(_b["p"])
        _cz = sum(p[1] for p in _b["p"]) / len(_b["p"])
        _st_cand.append((_cx, _cz, _h, _b))
    _clusters = []
    for _cx, _cz, _h, _b in _st_cand:
        for _c in _clusters:
            if math.hypot(_cx - _c["x"], _cz - _c["z"]) < _ST_JOIN:
                _c["members"].append(_b)
                _c["h"] = max(_c["h"], _h)
                _c["x"] = sum(sum(q[0] for q in m["p"]) / len(m["p"])
                              for m in _c["members"]) / len(_c["members"])
                _c["z"] = sum(sum(q[1] for q in m["p"]) / len(m["p"])
                              for m in _c["members"]) / len(_c["members"])
                break
        else:
            _clusters.append({"x": _cx, "z": _cz, "h": _h, "members": [_b]})
    _st_new, _st_dup, _st_drop = 0, 0, 0
    _st_kill = set()
    for _c in _clusters:
        # A LONE GRASS MASS IS A GREEN ROOF — UNLESS IT IS A NEEDLE.
        #
        # The 2+ slice test is what protects the 280m planted-roof tower at
        # 1858,9147, and it is worth keeping. But one Supertree at 3427,9400
        # lost its siblings to the dedupe and arrived as a cluster of ONE: a
        # 53 m2 footprint standing 41m tall. Nothing that is 41m tall on 53 m2
        # is a building — that is an aspect ratio of about 6:1 — while the
        # tower this rule exists to protect sits on 2,670 m2. So a lone slice
        # qualifies on SHAPE, which separates the two cleanly, rather than on a
        # position or a name.
        _lone_needle = (len(_c["members"]) == 1
                        and (_c["members"][0].get("a") or 1e9) < 200)
        if len(_c["members"]) < 2 and not _lone_needle:
            continue
        for _m in _c["members"]:
            _st_kill.add(id(_m))
        _st_drop += len(_c["members"])
        _near = None
        for _t in towers:
            if math.hypot(_c["x"] - _t["p"][0], _c["z"] - _t["p"][1]) < 15.0:
                _near = _t
                break
        if _near is not None:
            _st_dup += 1                   # the node already draws this one
            continue
        towers.append({"p": [round(_c["x"], 1), round(_c["z"], 1)],
                       "h": min(SUPERTREE_H, key=lambda v: abs(v - _c["h"])),
                       "r": 8.0})
        _st_new += 1
    # SWEEP UP THE STRAGGLERS INSIDE AN ACCEPTED SUPERTREE.
    #
    # The cluster rule needs 2+ slices in the 20-60m band, which is what stops
    # it eating the 280m planted-roof tower. Two slices at Gardens by the Bay
    # fell outside it anyway and were left standing as lime-green boxes in the
    # vet frame: one at 13m (under the band) and one 53 m2 sliver at 41m whose
    # siblings had already been deduped away, so it was a cluster of one.
    #
    # Both sit INSIDE a Supertree this pass has already accepted, so they are
    # parts of it by position. This does not loosen the cluster test — nothing
    # new becomes a Supertree — it only says that a grass mass standing inside
    # one is part of the one that is already there.
    _stray = 0
    for _c in _clusters:
        if len(_c["members"]) < 2:
            continue
        for _b in buildings:
            if id(_b) in _st_kill or (_b.get("mat") or "") != "grass":
                continue
            _bx = sum(p[0] for p in _b["p"]) / len(_b["p"])
            _bz = sum(p[1] for p in _b["p"]) / len(_b["p"])
            if math.hypot(_bx - _c["x"], _bz - _c["z"]) < _ST_JOIN:
                _st_kill.add(id(_b))
                _stray += 1
    if _stray:
        print(f"  supertrees: {_stray} stray grass slice(s) inside an accepted "
              f"supertree swept up with it")

    # AND THE GRASS MOUNDS ARE GROUND, NOT BUILDINGS.
    #
    # Reading `height=0.5` honestly (see the grass exemption in height_for)
    # stopped them being drawn as 7-14m green blocks — and immediately produced
    # a different wrong thing: V4 "scale sanity" reported "a building shorter
    # than a door", which is exactly right. A half-metre planted mound is a
    # LANDFORM. It belongs to the green layer, which already draws the whole of
    # Gardens by the Bay, and putting it in `buildings` at any height means
    # claiming it is a structure.
    #
    # So: honest height first, then out of the building layer entirely. The two
    # together are the fix; either alone is a defect.
    _mound = 0
    for _b in buildings:
        if (_b.get("mat") or "") == "grass" and (_b.get("h") or 0) < 2.5:
            _st_kill.add(id(_b))
            _mound += 1
    if _mound:
        print(f"  dropped {_mound} grass mound(s) under 2.5m from the building layer: "
              f"a planted landform is ground, and the green layer already draws it")
    if _st_kill:
        buildings = [b for b in buildings if id(b) not in _st_kill]
        print(f"  supertrees: {_st_drop} grass slices reconciled into the tower path "
              f"({_st_dup} were already a tower node and drawn twice, "
              f"{_st_new} had no node and are now drawn at all)")

    # ---- QUAY CRANES -------------------------------------------------------
    # 25 `man_made=crane` nodes stand along the Keppel quay and NONE of them
    # were in the world, because `build_district.py` had never asked for the
    # tag. research/keppel-landmarks.md §6.3: "from a bike on Keppel Road, at
    # 500-800m and 50m tall, this crane line is the horizon. Not modelling it
    # is the biggest single visual omission in the district."
    #
    # THE ONE PUBLISHED DIMENSION, AND ITS PROVENANCE MATTERS. 52m lift height
    # and 70m outreach are the PSA FLEET figures (WSH Council / tal.sg), NOT
    # Keppel-specific ones, and the brief says so explicitly. Boom-up height,
    # rail gauge and RTG heights are UNPUBLISHED and are not invented here.
    # Colours are UNPUBLISHED too — the brief is emphatic that there is no PSA
    # livery document in the public domain and says "do not assert PSA blue" —
    # so the renderer picks a neutral structural grey rather than a brand.
    #
    # WHICH WAY THE BOOM POINTS IS DERIVED, NEVER ARGUED. A quay crane reaches
    # out over the water; get that backwards and 25 booms swing inland over the
    # container yard. The direction comes from the WATER ITSELF: sample a ring
    # of points around each crane and take the mean bearing of those that fall
    # in a water polygon. This is the same rule the coastline reader had to
    # learn the hard way — its first version reasoned the winding out in a
    # comment and put Bay East Garden under the sea.
    cranes = []
    _crane_nodes = []
    for e in els:
        t = e.get("tags") or {}
        if t.get("man_made") != "crane":
            continue
        g = e.get("geometry")
        if g:
            xs = [proj(q["lat"], q["lon"]) for q in g if "lat" in q]
            if not xs:
                continue
            cx = sum(p[0] for p in xs) / len(xs)
            cz = sum(p[1] for p in xs) / len(xs)
        elif "lat" in e:
            cx, cz = proj(e["lat"], e["lon"])
        else:
            continue
        _crane_nodes.append((cx, cz, t))
    if _crane_nodes:
        def _in_water(px, pz):
            for w in water:
                ring_pts = w.get("p") or []
                if len(ring_pts) < 3:
                    continue
                c = False
                j = len(ring_pts) - 1
                for i in range(len(ring_pts)):
                    xi, zi = ring_pts[i]
                    xj, zj = ring_pts[j]
                    if (zi > pz) != (zj > pz) and \
                            px < (xj - xi) * (pz - zi) / ((zj - zi) or 1e-9) + xi:
                        c = not c
                    j = i
                if c:
                    return True
            return False

        _nowater = 0
        for cx, cz, t in _crane_nodes:
            # A quay crane's outreach is 70m, so water 40-120m out is what it
            # actually reaches over. Sampled every 15 degrees at three radii.
            sx = sz = 0.0
            n_wet = 0
            for k in range(24):
                ang = k * math.pi / 12.0
                for rad in (45.0, 80.0, 120.0):
                    if _in_water(cx + math.sin(ang) * rad, cz + math.cos(ang) * rad):
                        sx += math.sin(ang)
                        sz += math.cos(ang)
                        n_wet += 1
            mag = math.hypot(sx, sz)
            if not n_wet or mag < 1e-6:
                _nowater += 1
                continue                   # no sea anywhere near: not a quay crane
            cranes.append({"p": [round(cx, 1), round(cz, 1)],
                           "a": round(math.atan2(sx / mag, sz / mag), 3)})
        if cranes:
            print(f"  quay cranes: {len(cranes)} on the water's edge"
                  + (f", {_nowater} skipped with no water in reach" if _nowater else "")
                  + " (52m lift / 70m outreach, PSA FLEET figures not Keppel-specific)")
        elif _nowater:
            print(f"  quay cranes: {_nowater} crane node(s) found but none has water "
                  f"within 120m — not drawn, because a quay crane reaching over dry "
                  f"land is worse than no crane")

    # ---- GREEN SPACE -------------------------------------------------------
    # Singapore is a garden city and this pipeline drew none of it. Every park,
    # garden, field, wood and the whole of the Istana grounds came out as bare
    # terrain the colour of sand, which is what the rider saw and said: "istana
    # all still empty place". The tags were never fetched — 72 individual trees
    # in the Orchard extract and not one park polygon — so this is the ninth
    # time real data was simply not asked for.
    #
    # Kinds are kept separate because they do not look alike: mown grass and a
    # sports pitch are flat and bright, a wood is dark and wants tree cover.
    GREEN_KIND = {
        "park": "park", "garden": "park", "common": "park",
        "village_green": "park", "recreation_ground": "park",
        "grass": "grass", "meadow": "grass", "grassland": "grass",
        "greenfield": "grass", "cemetery": "grass",
        # golf gets its OWN kind (2026-08-03): Sentosa's two courses were
        # indistinguishable from football pitches, and a fairway is not a pitch
        "pitch": "pitch", "golf_course": "golf",
        # A track and a pool are not green and must not average into it. Both
        # are also small, so they lose to the 60 m2 floor less often than they
        # lose to being drawn the colour of a lawn.
        "track": "track", "swimming_pool": "pool",
        # A WATER PARK IS POOL DECK, AND IT WAS DRAWING AS A MOWN LAWN.
        #
        # Adventure Cove Waterpark is ONE way (50,434 m2) carrying BOTH
        # `leisure=water_park` and `landuse=recreation_ground`. The loop below
        # reads leisure first, water_park was not a kind, so it fell through to
        # the landuse and came out `park` — bright green, and `park` is in
        # PLANT at one tree per 400 m2, so 126 trees were scattered over a
        # water park. Rendered from the ridge it is a lawn with slides standing
        # on it and three floating ride labels (shots/street/advcove.shot2).
        #
        # It is the ONLY misclassification of this shape on the island: a sweep
        # of every on-island areal element >300 m2 for "a specific tag lost to
        # a generic one" returns this and nothing else (the second hit,
        # Bluwater Bay at 935 m2, is already drawn as a pool).
        #
        # `deck` is not green, exactly as `track` and `pool` are not, and it is
        # in the green layer for the same reason they are: this is the layer
        # that owns areal ground COVER, and the alternative is a fourth list.
        # research/rws-architecture.md E10 is the surface being drawn — "more
        # landscape than building", pale deck between bright blue pools, a
        # sand-edged wave pool and rockwork.
        "water_park": "deck",
        "forest": "wood", "wood": "wood", "scrub": "scrub", "heath": "scrub",
        # Sand reads as a distinct surface from any distance and there is
        # nothing else this colour in the world.
        "beach": "sand", "sand": "sand", "shingle": "sand",
    }
    green = []
    for e in els:
        t = e.get("tags") or {}
        kind = None
        for key in ("leisure", "landuse", "natural"):
            v = t.get(key)
            if v in GREEN_KIND:
                kind = GREEN_KIND[v]
                break
        if not kind:
            continue
        rings = []
        if e["type"] == "way" and e.get("geometry"):
            rings.append(e["geometry"])
        elif e["type"] == "relation":
            rings.extend(stitch_outer(e))
        for g in rings:
            pts = [proj(q["lat"], q["lon"]) for q in g if "lat" in q]
            if len(pts) < 4:
                continue
            if math.dist(pts[0], pts[-1]) > 25.0:
                continue
            a2 = 0.0
            for i in range(len(pts)):
                q1, q2 = pts[i], pts[(i + 1) % len(pts)]
                a2 += q1[0] * q2[1] - q2[0] * q1[1]
            garea = abs(a2) / 2
            if garea < 60:            # a verge smaller than this is dressing
                continue
            rec = {"p": [[round(x, 1), round(z, 1)] for x, z in pts],
                   "k": kind, "a": round(garea)}
            # a NAMED beach or course is a place, not just a surface — Palawan
            # and Siloso Beach carried names the pipeline used to throw away
            if t.get("name") and kind in ("sand", "golf"):
                rec["n"] = t["name"]
            green.append(rec)
    # ---- THE GROUND BETWEEN EVERYTHING ------------------------------------
    # A sampled grid over Orchard came back 55% neither building, park nor road
    # even after the green landed: the sand between everything. In the real city
    # that is residential compounds, car parks, plazas and forecourts, and OSM
    # maps most of it as landuse. Kept in its own list so the green figures stay
    # honest — a car park is not parkland.
    LAND_KIND = {
        "residential": "resi", "institutional": "civic", "education": "civic",
        "religious": "civic", "commercial": "comm", "retail": "comm",
        "industrial": "indus", "railway": "indus",
        "construction": "works", "brownfield": "works",
    }
    land = []
    for e in els:
        t = e.get("tags") or {}
        kind = LAND_KIND.get(t.get("landuse"))
        if not kind and t.get("amenity") == "parking":
            kind = "parking"
        if not kind and (t.get("place") == "square"
                         or (t.get("highway") == "pedestrian" and t.get("area") == "yes")):
            kind = "plaza"
        if not kind:
            continue
        rings = []
        if e["type"] == "way" and e.get("geometry"):
            rings.append(e["geometry"])
        elif e["type"] == "relation":
            rings.extend(stitch_outer(e))
        for g in rings:
            pts = [proj(q["lat"], q["lon"]) for q in g if "lat" in q]
            if len(pts) < 4:
                continue
            if math.dist(pts[0], pts[-1]) > 25.0:
                continue
            a2 = 0.0
            for i in range(len(pts)):
                q1, q2 = pts[i], pts[(i + 1) % len(pts)]
                a2 += q1[0] * q2[1] - q2[0] * q1[1]
            larea = abs(a2) / 2
            if larea < 60:
                continue
            land.append({"p": [[round(x, 1), round(z, 1)] for x, z in pts],
                         "k": kind, "a": round(larea)})
    # ---- PIERS AND JETTIES -------------------------------------------------
    # Marina Bay, Clarke Quay and Robertson Quay are quays, and the structures
    # that make them quays did not exist. 18 mapped in Marina Bay alone, 17 of
    # them closed areas rather than lines, so they extrude like a low deck
    # rather than trace like a path. A pier stands OVER water, so it carries its
    # own height and is not seated on the terrain under it.
    piers = []
    for e in els:
        t = e.get("tags") or {}
        if t.get("man_made") not in ("pier", "breakwater", "groyne"):
            continue
        rings = []
        if e["type"] == "way" and e.get("geometry"):
            rings.append(e["geometry"])
        elif e["type"] == "relation":
            rings.extend(stitch_outer(e))
        for g in rings:
            pts = [proj(q["lat"], q["lon"]) for q in g if "lat" in q]
            if len(pts) < 4:
                continue
            if math.dist(pts[0], pts[-1]) > 12.0:
                continue                     # a linear pier, not an area
            a2 = 0.0
            for i in range(len(pts)):
                q1, q2 = pts[i], pts[(i + 1) % len(pts)]
                a2 += q1[0] * q2[1] - q2[0] * q1[1]
            parea = abs(a2) / 2
            if parea < 25:
                continue
            piers.append({"p": [[round(x, 1), round(z, 1)] for x, z in pts],
                          "k": t.get("man_made"), "a": round(parea)})
    if piers:
        print(f"  piers: {len(piers)} decks, {sum(p['a'] for p in piers):,} m2")

    # STAIRCASES, and the walls and railings that say where you may not walk.
    #
    # Nothing in this pipeline has ever fetched `highway=steps`, because every
    # layer before it was chosen for a rider. There are 107 of them in the
    # brasbasah bbox alone and they are every flight on Fort Canning and up
    # Mount Sophia, so until now the hills in this world had NO WAY UP: a person
    # on foot could reach the bottom of Fort Canning and stop. That is the
    # single biggest hole in a world whose goal is that you can walk it.
    #
    # THE RISE IS NOT TAKEN FROM THE TAGS. `incline=up` is relative to the way's
    # own direction, `step_count` is present on a minority, and neither says how
    # far the flight climbs in metres. The terrain already knows: sample the DEM
    # at both ends and the difference IS the rise, in the same frame everything
    # else in the scene is built in. A tag that disagrees with the ground would
    # be a tag describing a different world.
    steps_out = []
    for e in els:
        t = e.get("tags") or {}
        if t.get("highway") != "steps":
            continue
        if e["type"] != "way" or not e.get("geometry"):
            continue
        pts = [proj(q["lat"], q["lon"]) for q in e["geometry"] if "lat" in q]
        if len(pts) < 2:
            continue
        L = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
        if L < 1.2:                       # a doorstep, not a flight
            continue
        rec = {"p": [[round(x, 1), round(z, 1)] for x, z in pts], "L": round(L, 1)}
        sc = (t.get("step_count") or "").strip()
        if sc.isdigit() and 0 < int(sc) < 400:
            rec["n"] = int(sc)
        try:
            wv = float(re.sub(r"[^0-9.]", "", t.get("width") or "") or 0)
            if 0.6 <= wv <= 12:
                rec["w"] = round(wv, 1)
        except ValueError:
            pass
        if t.get("conveying"):            # an escalator, not a stair
            rec["esc"] = 1
        if (t.get("covered") or "") == "yes":
            rec["cov"] = 1
        steps_out.append(rec)
    if steps_out:
        _sn = sum(1 for s in steps_out if "n" in s)
        print(f"  steps: {len(steps_out)} flights, {sum(s['L'] for s in steps_out):,.0f} m "
              f"of stair, {_sn} with a surveyed step count")

    # Walls, fences, hedges and railings. The same question from the other side:
    # ---- PARK FURNITURE ----------------------------------------------------
    # The things that make a park somewhere you would stop rather than somewhere
    # you cross. `topup.py` has had a `parkfurn` layer since the walkable-world
    # work began and it had NEVER BEEN FETCHED FOR ANY DISTRICT, and nothing
    # parsed or drew it -- the fetch existed, the other two thirds did not. In
    # the brasbasah bbox alone the extract carries 60 benches, 17 memorials and
    # monuments, 15 fountains, 6 shelters and 6 playgrounds, all of it drawn as
    # bare grass.
    #
    # This is the tenth time in this project that real data was simply not
    # asked for, and the second time the ASKING existed but nothing read the
    # answer (see `data.trees`, surveyed into every scene file since the first
    # build and drawn by nothing until 2026-08-01).
    #
    # Nodes give a point; ways give a footprint whose centroid is the point and
    # whose area sizes the thing. A playground mapped as a 400 m2 polygon and a
    # playground mapped as a single node are the same playground, so both are
    # carried as (position, kind, radius) and the radius is what differs.
    PARKFURN_KIND = {
        "memorial": "memorial", "monument": "memorial",
        "artwork": "artwork",
        "bench": "bench", "fountain": "fountain",
        "shelter": "shelter", "playground": "playground",
        # ---- THE SERVICE LAYER, added 2026-08-21 with osmlayers' `services`.
        #
        # Everything above is something you look AT. These are the things you
        # USE, and on a beach they are the difference between sand you look at
        # and sand you can spend a day on: 28 toilets, 4 showers, 6
        # drinking-water points, 7 bicycle stands, 11 vending machines, 11
        # bins and 22 information boards, all with surveyed positions, none of
        # which this pipeline had ever asked for.
        #
        # research/palawan-spawn.md 6.3 wrote the warning months ago -- "None
        # of these amenity nodes are in data/raw/sentosa.json ... A refetch
        # would hand us the whole service layer for free" -- and nothing acted
        # on it. Same shape as the `bar` omission the same morning: the fact
        # was known, written down, and not wired up.
        "toilets": "toilets", "shower": "shower",
        "drinking_water": "water_point", "bicycle_parking": "bikerack",
        "vending_machine": "vending", "waste_basket": "bin", "bbq": "bbq",
        "information": "infoboard",
        # THE ONE `emergency=lifeguard` NODE ON THE ISLAND. It sits INSIDE
        # Palawan's patrol-tower footprint, which is what settled that the
        # footprint is a lifeguard tower rather than a shed (palawan-spawn.md
        # 6.3). It marks a tower we already have; it does not place new ones,
        # and no count is published for Tanjong or Palawan -- so do not read
        # this key as a licence to invent them.
        "lifeguard": "lifeguard",
    }
    parkfurn = []
    for e in els:
        t = e.get("tags") or {}
        kind = None
        for key in ("historic", "tourism", "amenity", "leisure", "emergency"):
            v = t.get(key)
            if v in PARKFURN_KIND:
                kind = PARKFURN_KIND[v]
                break
        if not kind:
            continue
        px = pz = None
        rad = 0.0
        if e["type"] == "node" and "lat" in e:
            px, pz = proj(e["lat"], e["lon"])
        elif e.get("geometry"):
            pts = [proj(q["lat"], q["lon"]) for q in e["geometry"] if "lat" in q]
            if len(pts) < 3:
                continue
            px = sum(q[0] for q in pts) / len(pts)
            pz = sum(q[1] for q in pts) / len(pts)
            # radius of the circle with the ring's area, capped: an OSM
            # "playground" polygon sometimes covers a whole park corner, and a
            # 40m climbing frame is not a thing.
            a2 = 0.0
            for i in range(len(pts)):
                q1, q2 = pts[i], pts[(i + 1) % len(pts)]
                a2 += q1[0] * q2[1] - q2[0] * q1[1]
            rad = min(14.0, math.sqrt(abs(a2) / 2 / math.pi))
        if px is None:
            continue
        rec = {"p": [round(px, 1), round(pz, 1)], "k": kind}
        if rad > 1.0:
            rec["r"] = round(rad, 1)
        nm = (t.get("name") or "").strip()
        if nm:
            rec["n"] = nm[:60]
        parkfurn.append(rec)
    if parkfurn:
        _pfc = {}
        for r in parkfurn:
            _pfc[r["k"]] = _pfc.get(r["k"], 0) + 1
        print("  parkfurn: " + ", ".join(f"{v} {k}" for k, v in sorted(_pfc.items())))

    # a walkable world needs to say where you may NOT walk, and 29 of these in
    # brasbasah alone are currently drawn as open air you can stroll through.
    barriers = []
    _BH = {"wall": 2.0, "retaining_wall": 1.8, "fence": 1.6,
           "hedge": 1.4, "handrail": 1.0, "guard_rail": 0.8}
    for e in els:
        t = e.get("tags") or {}
        k = t.get("barrier")
        if k not in _BH or e["type"] != "way" or not e.get("geometry"):
            continue
        pts = [proj(q["lat"], q["lon"]) for q in e["geometry"] if "lat" in q]
        if len(pts) < 2:
            continue
        L = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
        if L < 3.0:
            continue
        h = _BH[k]
        try:
            hv = float(re.sub(r"[^0-9.]", "", t.get("height") or "") or 0)
            if 0.3 <= hv <= 6:
                h = round(hv, 1)          # a surveyed height always wins
        except ValueError:
            pass
        barriers.append({"p": [[round(x, 1), round(z, 1)] for x, z in pts],
                         "k": k, "h": h, "L": round(L, 1)})
    if barriers:
        from collections import Counter as _CB
        _bc = _CB(b["k"] for b in barriers)
        print(f"  barriers: {len(barriers)} runs, {sum(b['L'] for b in barriers):,.0f} m "
              f"({', '.join(f'{k} {n}' for k, n in _bc.most_common())})")

    land.sort(key=lambda w: -w["a"])
    if land:
        from collections import Counter as _C2
        _lc = _C2(g["k"] for g in land)
        print(f"  land:  {len(land)} polygons, {sum(g['a'] for g in land):,} m2 "
              f"({', '.join(f'{k} {n}' for k, n in _lc.most_common())})")

    green.sort(key=lambda w: -w["a"])
    if green:
        from collections import Counter as _C
        _kc = _C(g["k"] for g in green)
        print(f"  green: {len(green)} polygons, {sum(g['a'] for g in green):,} m2 "
              f"({', '.join(f'{k} {n}' for k, n in _kc.most_common())})")

    water.sort(key=lambda w: -w["a"])
    if water:
        print(f"  water: {len(water)} polygons, largest {water[0]['a']:,} m2, "
              f"total {sum(w['a'] for w in water):,} m2")

    # BUILDINGS THE MAP DOES NOT HAVE. See data/authored.json for why this
    # exists and what the bar for an entry is. Appended before the dedupe so an
    # authored building that duplicates one OSM later adds is caught by the same
    # check as everything else.
    _auth_path = os.path.join(HERE, "authored.json")
    if os.path.exists(_auth_path):
        _auth = json.load(open(_auth_path)).get("buildings", [])
        _added = 0
        for _e in _auth:
            if _e.get("district") != DIST_ID:
                continue
            _cx, _cz = proj(_e["lat"], _e["lon"])
            if _e.get("shape") == "deck":
                # A STRUCTURE THAT BEGINS IN THE SKY. `deck` is a polyline of
                # surveyed points plus a width, emitted as one quad per
                # segment, all lifted to `min_h`. Everything else in this file
                # stands on the ground; a sky bridge does not, and the renderer
                # already knows how to build a mass from its own base -- that
                # is the `mh` path city.js uses for Marina Bay Sands' SkyPark.
                _pts = [proj(la, lo) for la, lo in _e["path"]]
                _w = float(_e.get("width", 7.0)) / 2.0
                for _i in range(len(_pts) - 1):
                    (_ax, _az), (_bx, _bz) = _pts[_i], _pts[_i + 1]
                    _ddx, _ddz = _bx - _ax, _bz - _az
                    _dl = math.hypot(_ddx, _ddz) or 1.0
                    _px, _pz = -_ddz / _dl * _w, _ddx / _dl * _w
                    _ring = [(_ax + _px, _az + _pz), (_bx + _px, _bz + _pz),
                             (_bx - _px, _bz - _pz), (_ax - _px, _az - _pz)]
                    _ar = abs(sum(_ring[_k][0] * _ring[(_k + 1) % 4][1]
                                  - _ring[(_k + 1) % 4][0] * _ring[_k][1]
                                  for _k in range(4))) / 2
                    _b = {"p": [[round(x, 1), round(z, 1)] for x, z in _ring],
                          "h": _e["h"], "n": _e["n"], "hs": "authored",
                          "a": round(_ar), "mh": _e["min_h"]}
                    if _e.get("key"):
                        _b["key"] = 1
                    buildings.append(_b)
                    _added += 1
                continue
            if _e.get("shape") == "slab":
                # a straight back face plus a depth: the simplest honest plan
                # for a long slab block. Terracing, setbacks and anything else
                # about its SECTION belong in the recipe, not in the footprint.
                (_la0, _lo0), (_la1, _lo1) = _e["baseline"]
                _x0, _z0 = proj(_la0, _lo0)
                _x1, _z1 = proj(_la1, _lo1)
                _dx, _dz = _x1 - _x0, _z1 - _z0
                _L = math.hypot(_dx, _dz) or 1.0
                # perpendicular, pointed at the side the building actually
                # occupies -- checked against the stated centroid rather than
                # assumed, because a normal's sign depends on vertex order
                _nx, _nz = -_dz / _L, _dx / _L
                _mx, _mz = (_x0 + _x1) / 2, (_z0 + _z1) / 2
                _cxr, _czr = proj(_e["lat"], _e["lon"])
                if (_cxr - _mx) * _nx + (_czr - _mz) * _nz < 0:
                    _nx, _nz = -_nx, -_nz
                _d = float(_e["depth"])
                _ring = [(_x0, _z0), (_x1, _z1),
                         (_x1 + _nx * _d, _z1 + _nz * _d),
                         (_x0 + _nx * _d, _z0 + _nz * _d)]
                _ar = abs(sum(_ring[_i][0] * _ring[(_i + 1) % 4][1]
                              - _ring[(_i + 1) % 4][0] * _ring[_i][1] for _i in range(4))) / 2
                _b = {"p": [[round(x, 1), round(z, 1)] for x, z in _ring],
                      "h": _e["h"], "n": _e["n"], "hs": "authored", "a": round(_ar)}
                if _e.get("key"):
                    _b["key"] = 1
                # Carry the measured facing direction with the building. A
                # recipe can find the long axis of a rectangle on its own, but
                # NOT which of the two long faces is the front -- and for a
                # terraced slab that is the whole building. Golden Mile's
                # terraces face SE, which was measured from a luminance profile,
                # so it travels with the footprint instead of being re-guessed.
                if _e.get("terrace"):
                    _t = _e["terrace"]
                    _b["ter"] = {"nx": round(_nx, 4), "nz": round(_nz, 4),
                                 "step": _t.get("step_back", 3.0),
                                 "from": _t.get("from_level", 4),
                                 "levels": _t.get("levels", 16)}
                buildings.append(_b)
                _added += 1
                continue
            if _e.get("shape") != "arc":
                continue
            for _a0, _a1 in _e["arcs"]:
                # compass azimuth: north is -z, east is +x
                _sw = (_a1 - _a0) % 360
                _n = max(8, int(_sw / 6))
                _ring = []
                for _k in range(_n + 1):
                    _th = math.radians(_a0 + _sw * _k / _n)
                    _ring.append((_cx + _e["r_outer"] * math.sin(_th),
                                  _cz - _e["r_outer"] * math.cos(_th)))
                for _k in range(_n, -1, -1):
                    _th = math.radians(_a0 + _sw * _k / _n)
                    _ring.append((_cx + _e["r_inner"] * math.sin(_th),
                                  _cz - _e["r_inner"] * math.cos(_th)))
                _ar = abs(sum(_ring[_i][0] * _ring[(_i + 1) % len(_ring)][1]
                              - _ring[(_i + 1) % len(_ring)][0] * _ring[_i][1]
                              for _i in range(len(_ring)))) / 2
                # `a` is what every OSM building here carries and what the
                # shophouse test, the audit and the vet tools all read; without
                # it an authored building is a hole in every downstream check.
                _b = {"p": [[round(x, 1), round(z, 1)] for x, z in _ring],
                      "h": _e["h"], "n": _e["n"], "hs": "authored",
                      "a": round(_ar)}
                if _e.get("key"):
                    _b["key"] = 1
                buildings.append(_b)
                _added += 1
        if _added:
            print(f"  authored {_added} footprint(s) the map does not have")

        # ---- NAMED PLACES THE MAP DOES NOT CARRY, and the reason this branch
        # is HERE rather than in the script that used to own it.
        #
        # `venues` was applied only by data/authoredapply.py, and NOTHING RUNS
        # THAT SCRIPT. It is not in build_district.py's CHAIN, not in deploy.sh,
        # not in any check -- it was run by hand once, in SESSION 30j, and the
        # scene file kept the result until the next rebuild threw it away. This
        # rebuild did exactly that: Emerald Pavilion was in the shipped scene on
        # 2026-08-21 morning and was gone from it by afternoon, silently, with
        # every gate still green, because a hand-run step is not part of the
        # build no matter how carefully it was written.
        #
        # The buildings branch above never had that problem -- it lives in the
        # pipeline. So venues joins it here, reading the same file, and
        # authoredapply.py is retired rather than left lying around as a second
        # way to do this that is one edit away from disagreeing with the first.
        #
        # DEDUPE IS BY NAME WITHIN 40m, not by position: a refreshed OSM cache
        # can bring the same venue in on a slightly different node, and two
        # "Ola Beach Club" entries 6m apart would put two bands on one wall.
        # That is not hypothetical -- widening the shops fetch on 2026-08-21
        # brought Ola Beach Club and Bikini Bar in from OSM for the first time,
        # both of which this list had been carrying by hand.
        _vadded = 0
        for _e in json.load(open(_auth_path)).get("venues", []):
            if _e.get("district") != DIST_ID:
                continue
            _cx, _cz = proj(_e["lat"], _e["lon"])
            _nm = (_e.get("n") or "").strip().lower()
            if any((_s.get("n") or "").strip().lower() == _nm
                   and math.hypot(_s["p"][0] - _cx, _s["p"][1] - _cz) < 40
                   for _s in shops):
                continue
            shops.append({"p": [round(_cx, 1), round(_cz, 1)], "n": _e["n"],
                          "k": _e.get("k") or "restaurant"})
            _vadded += 1
        if _vadded:
            print(f"  authored {_vadded} named venue(s) the map does not carry")

    # ONE BUILDING, ONE FOOTPRINT.
    #
    # OSM maps a fair number of buildings TWICE -- once as a way and once as a
    # multipolygon relation tracing the same outline. Ten of them across these
    # eight districts, including Marina Bay Sands Theatres at 13,773 m2, Pan
    # Pacific, The Fullerton Bay Hotel, Clifford Pier and Concorde Shopping
    # Centre. Extruded twice they are two coincident solids: every face
    # z-fights with its twin and shimmers, the geometry cost is doubled, and
    # anything hung off the footprint -- shopfronts, awnings, props -- is built
    # twice too.
    #
    # Keyed on rounded centroid + area rather than on vertex list, because the
    # way and the relation trace the same outline without agreeing on where the
    # ring starts or which way it winds. The copy KEPT is the one that knows
    # more: a name beats no name, and a real height source beats a guess.
    # Matched on OVERLAP, not on an exact key. Rounding a centroid to 0.1m and
    # an area to 1 m2 catches a way and a relation that trace the same ring
    # exactly, and misses the far commoner case where they trace it ALMOST the
    # same: "Tri-Ways" and "Kohnangkam" sit 0.0m apart with areas of 82 and 79
    # m2 and both survived. Same rule merge.py uses across the seam -- a
    # distance threshold that is a fraction of the footprint's own width, so a
    # terrace of shophouses 6m apart is never touched while two copies of one
    # building are.
    _rank = {"named": 4, "authored": 4, "override": 3, "osm": 2, "guess": 1}
    _keep = []
    _cells = {}
    _CELL = 40.0
    _dupes = 0
    for _b in buildings:
        _p = _b.get("p") or []
        if len(_p) < 3:
            _keep.append(_b)
            continue
        _cx = sum(q[0] for q in _p) / len(_p)
        _cz = sum(q[1] for q in _p) / len(_p)
        _a = abs(sum(_p[i][0] * _p[(i + 1) % len(_p)][1] - _p[(i + 1) % len(_p)][0] * _p[i][1]
                     for i in range(len(_p)))) / 2
        _score = (1 if _b.get("n") else 0, _rank.get(_b.get("hs"), 0))
        _kx, _kz = int(_cx // _CELL), int(_cz // _CELL)
        _hit = -1
        for _dx in (-1, 0, 1):
            for _dz in (-1, 0, 1):
                for (_ox, _oz, _oa, _slot) in _cells.get((_kx + _dx, _kz + _dz), ()):
                    if not _oa or not _a:
                        continue
                    if abs(_a - _oa) / max(_a, _oa) > 0.12:
                        continue
                    if math.hypot(_cx - _ox, _cz - _oz) > 0.35 * math.sqrt(min(_a, _oa)):
                        continue
                    _hit = _slot
                    break
                if _hit >= 0:
                    break
            if _hit >= 0:
                break
        if _hit >= 0:
            _dupes += 1
            _pk = _keep[_hit]
            if _score > (1 if _pk.get("n") else 0, _rank.get(_pk.get("hs"), 0)):
                _keep[_hit] = _b
            continue
        _cells.setdefault((_kx, _kz), []).append((_cx, _cz, _a, len(_keep)))
        _keep.append(_b)
    if _dupes:
        buildings = _keep
        print(f"  deduped {_dupes} coincident footprint(s) mapped twice by OSM")

    # ---- TREES IN THE PARKS ------------------------------------------------
    # Every tree in the world came from a surveyed OSM node or a tree_row, and
    # OSM surveys STREET trees. Parks are mapped as a polygon and left empty,
    # so the moment the green layer landed, the Istana grounds became forty
    # hectares of mown lawn with nine trees on it -- and the real Istana is
    # closed-canopy parkland. Same for Fort Canning, Hong Lim, Pearl's Hill.
    #
    # Scattered HERE and not at runtime because this is the only place that
    # holds the park rings, the building footprints and the road centrelines at
    # once, and a tree is only right if it is inside the first and clear of the
    # other two. Runtime gets a plain [x, z] appended to the list it already
    # draws, so nothing downstream changes.
    #
    # Density is per KIND, not per park: a wood is closed canopy, a park is
    # specimen trees over grass, scrub is bushes with the odd tree. Rejecting a
    # candidate is cheap; the sample count is set from the ring's own area so a
    # small garden gets a few and the Istana gets a thousand.
    # `deck` is a water park's paving, so it is planted at a fifth of a park's
    # density and not at zero: cutting it to nothing swaps one wrong read for
    # the other one this project has already been told off for — "empty car
    # park with trees on it" — and Adventure Cove genuinely is landscaped,
    # palms and rockwork round the pool edges. Sparse specimen trees over
    # paving is the honest middle, and the count is authored, not derived.
    PLANT = {"wood": 170.0, "park": 400.0, "scrub": 900.0, "deck": 2000.0}
    _rt = random.Random(20260801)

    def _in_ring(ring, x, z):
        inside = False
        n = len(ring)
        for i in range(n):
            x1, z1 = ring[i]
            x2, z2 = ring[(i + 1) % n]
            if (z1 > z) != (z2 > z) and x < x1 + (z - z1) * (x2 - x1) / (z2 - z1):
                inside = not inside
        return inside

    # REJECTION HAS TO BE MEASURED, NOT DILATED.
    #
    # The first version rasterised buildings and roads into a 12m grid and grew
    # the road cells by one cell in each direction, which excludes everything
    # within 12-24m of any centreline. In a park the size of the Istana grounds
    # that costs nothing. In Little India it excluded EVERY candidate: 13
    # qualifying rings, 5 trees. Bugis got 12. The districts where a park is
    # small and hemmed in by streets are exactly the districts the rider spends
    # their time in, so the dense half of the world got no park trees at all.
    #
    # Buildings keep a grid, because a footprint is an area and a 6m cell with a
    # 2m pad is honest about it. Roads get a real distance test against sampled
    # centreline points in a spatial hash: 9m clears the carriageway and the
    # pavement, and is what the street walk itself uses when it plants at
    # half-width + 2.8m.
    _CELL = 6.0
    _occ = set()
    for _b in buildings:
        _p = _b.get("p") or []
        if len(_p) < 3:
            continue
        _xs = [q[0] for q in _p]
        _zs = [q[1] for q in _p]
        for _gx in range(int((min(_xs) - 2) // _CELL), int((max(_xs) + 2) // _CELL) + 1):
            for _gz in range(int((min(_zs) - 2) // _CELL), int((max(_zs) + 2) // _CELL) + 1):
                _occ.add((_gx, _gz))
    _ROADCLEAR = 9.0
    _rhash = {}
    for _r in roads:
        _p = _r.get("p") or []
        for _i in range(len(_p) - 1):
            _a0, _a1 = _p[_i], _p[_i + 1]
            _L = math.hypot(_a1[0] - _a0[0], _a1[1] - _a0[1])
            for _k in range(int(_L // 4) + 1):
                _t = _k * 4.0 / _L if _L else 0
                _x = _a0[0] + (_a1[0] - _a0[0]) * _t
                _z = _a0[1] + (_a1[1] - _a0[1]) * _t
                _rhash.setdefault((int(_x // _CELL), int(_z // _CELL)), []).append((_x, _z))

    def _near_road(x, z):
        _gx, _gz = int(x // _CELL), int(z // _CELL)
        # 9m clearance on a 6m grid reaches two cells, so check 5x5.
        for _dx in range(-2, 3):
            for _dz in range(-2, 3):
                for (_rx, _rz) in _rhash.get((_gx + _dx, _gz + _dz), ()):
                    if math.hypot(x - _rx, z - _rz) < _ROADCLEAR:
                        return True
        return False

    _planted = 0
    for _g in green:
        _per = PLANT.get(_g["k"])
        if not _per:
            continue
        _ring = _g["p"]
        _xs = [q[0] for q in _ring]
        _zs = [q[1] for q in _ring]
        _want = int(_g["a"] / _per)
        if _want < 1:
            continue
        # Sample the bounding box: rings are irregular, so ask for enough
        # candidates that the in-ring hit rate still lands near the target.
        _tries = int(_want * 3.2) + 8
        _hit = 0
        for _ in range(_tries):
            if _hit >= _want:
                break
            _x = _rt.uniform(min(_xs), max(_xs))
            _z = _rt.uniform(min(_zs), max(_zs))
            if (int(_x // _CELL), int(_z // _CELL)) in _occ:
                continue
            if not _in_ring(_ring, _x, _z):
                continue
            if _near_road(_x, _z):
                continue
            trees.append([round(_x, 1), round(_z, 1)])
            _hit += 1
        _planted += _hit
    if _planted:
        print(f"  planted {_planted} trees across {len([g for g in green if g['k'] in PLANT])} "
              f"rings ({'/'.join(sorted(PLANT))})")

    # ONE SHAPE FOR `a`, NORMALISED AT THE BOUNDARY.
    #
    # Most footprints get `"a": round(a)` where they are built, but the
    # multipolygon and ring-surgery paths carry the raw float through: 30 of
    # marinasouth's 133 buildings came out with areas like
    # 1126.859887206927, which is fifteen digits of noise per building in a
    # file the browser downloads. Rather than chase every producer -- there
    # are nine `"a":` sites and the surgery invents new pieces at runtime --
    # normalise once, here, where the scene is assembled. A boundary is the
    # one place a value can be guaranteed to have one shape.
    for _b in buildings:
        if isinstance(_b.get("a"), float):
            _b["a"] = round(_b["a"])

    # NAME AND SIZE THE DEVELOPMENTS OSM LEAVES ANONYMOUS. Applied here, after
    # every other height source has had its turn, so it can only ever fill a
    # gap: a footprint that already carries a name or a real height keeps it.
    _site_hit = {}
    for _slat, _slon, _sname, _sst, _srad in SITE_HEIGHTS:
        _sx, _sz = proj(_slat, _slon)
        _h = round(_sst * SITE_FLOOR_M + SITE_PLANT_M, 1)
        for _b in buildings:
            if _b.get("n") or _b.get("hs") in ("osm", "named", "override"):
                continue
            _cx = sum(p[0] for p in _b["p"]) / len(_b["p"])
            _cz = sum(p[1] for p in _b["p"]) / len(_b["p"])
            if math.hypot(_cx - _sx, _cz - _sz) > _srad:
                continue
            # a bin store next to a tower block is not part of the tower block
            if (_b.get("a") or 0) < 200:
                continue
            _b["n"] = _sname
            _b["h"] = _h
            _b["hs"] = "site"          # DERIVED from storeys, never a survey
            _site_hit[_sname] = _site_hit.get(_sname, 0) + 1
    if _site_hit:
        print(f"  named+sized {sum(_site_hit.values())} anonymous footprint(s) from "
              f"surveyed site coordinates (storeys x {SITE_FLOOR_M}m, DERIVED): "
              + ", ".join(f"{k} x{v}" for k, v in sorted(_site_hit.items())[:4])
              + ("..." if len(_site_hit) > 4 else ""))

    # NAME-ONLY SITES: `n` moves, h/hs do not — see SITE_NAMES.
    _sn_hit = {}
    for _slat, _slon, _sname, _srad in SITE_NAMES:
        _sx, _sz = proj(_slat, _slon)
        for _b in buildings:
            if _b.get("n"):
                continue
            _cx = sum(p[0] for p in _b["p"]) / len(_b["p"])
            _cz = sum(p[1] for p in _b["p"]) / len(_b["p"])
            if math.hypot(_cx - _sx, _cz - _sz) > _srad:
                continue
            if (_b.get("a") or 0) < 200:
                continue
            _b["n"] = _sname
            _sn_hit[_sname] = _sn_hit.get(_sname, 0) + 1
    if _sn_hit:
        print(f"  named {sum(_sn_hit.values())} footprint(s) from verified site "
              f"coordinates (name only, heights untouched): "
              + ", ".join(f"{k} x{v}" for k, v in sorted(_sn_hit.items())[:4])
              + ("..." if len(_sn_hit) > 4 else ""))

    # Coordinate-scoped renames — only fires when the WRONG name is present.
    for _slat, _slon, _sname, _srad, _wrong in SITE_RENAMES:
        _sx, _sz = proj(_slat, _slon)
        for _b in buildings:
            if _b.get("n") != _wrong:
                continue
            _cx = sum(p[0] for p in _b["p"]) / len(_b["p"])
            _cz = sum(p[1] for p in _b["p"]) / len(_b["p"])
            if math.hypot(_cx - _sx, _cz - _sz) > _srad:
                continue
            print(f"  renamed {_wrong!r} -> {_sname!r} at {int(_cx)},{int(_cz)} "
                  f"(coordinate-scoped; the name belongs to a different building)")
            _b["n"] = _sname

    # A SIGNAL WITH NO ROAD IS FURNITURE NOBODY PUT THERE. One node in the
    # Waterloo Street pedestrian mall stands 36m from the nearest carriageway
    # (measured 2026-08-03): the runtime's own draw rule already refuses to
    # build a head more than 30m from a road, so the data carries a signal
    # nothing will ever draw and the defect hunt reports it forever. Refuse it
    # HERE, loudly, with the same 30m the drawing uses — one rule, one number.
    def _near_road(sx, sz, lim=30.0):
        lim2 = lim * lim
        for _r in roads:
            if _r.get("k") in ("footway", "pedestrian"):
                continue
            _p = _r["p"]
            for _i in range(len(_p) - 1):
                (x1, z1), (x2, z2) = _p[_i], _p[_i + 1]
                vx, vz = x2 - x1, z2 - z1
                L2 = vx * vx + vz * vz
                t = 0 if L2 < 1e-9 else max(0.0, min(1.0, ((sx - x1) * vx + (sz - z1) * vz) / L2))
                dx, dz = sx - (x1 + vx * t), sz - (z1 + vz * t)
                if dx * dx + dz * dz < lim2:
                    return True
        return False
    _sig_orphans = [s for s in signals if not _near_road(s[0], s[1])]
    if _sig_orphans:
        signals = [s for s in signals if _near_road(s[0], s[1])]
        print(f"  refused {len(_sig_orphans)} traffic-signal node(s) more than 30m from any "
              f"carriageway (nothing would ever draw them): "
              + ", ".join(f"{int(s[0])},{int(s[1])}" for s in _sig_orphans[:4]))

    # ---- THE CABLE CAR AND THE MONORAIL (Sentosa geography truth, 2026-08-03).
    # aerialway ways are the cables (both gondola lines and the SkyRide chair
    # lift); station/pylon nodes are their supports. railway=monorail ways are
    # the Sentosa Express viaduct. All of it sat in raw caches read by NOTHING
    # until district mode made Sentosa the game. Same whole-list dispatch as
    # every other layer: whatever query fetched an element, its tags decide.
    cableway = {"lines": [], "stations": [], "pylons": []}
    monorail = []
    # the island's surveyed shoreline — terrain.py sinks the open sea outside
    # it (the DEM cannot see the coast; the survey can)
    coast = []
    for e in els:
        t = e.get("tags") or {}
        aw = t.get("aerialway")
        if e["type"] == "way" and aw in ("gondola", "cable_car", "chair_lift") and e.get("geometry"):
            pts = [proj(q["lat"], q["lon"]) for q in e["geometry"] if "lat" in q]
            if len(pts) >= 2:
                rec = {"p": [[round(x, 1), round(z, 1)] for x, z in pts], "k": aw}
                if t.get("name"):
                    rec["n"] = t["name"]
                cableway["lines"].append(rec)
        elif e["type"] == "node" and aw in ("station", "pylon") and "lat" in e:
            x, z = proj(e["lat"], e["lon"])
            rec = {"p": [round(x, 1), round(z, 1)]}
            if t.get("name"):
                # the cable car's "Merlion" station was renamed Sensoryscape
                # (~Oct 2024) after the statue's 2019 demolition; OSM still
                # carries the old name (2026-08-03 research)
                rec["n"] = "Sensoryscape" if t["name"] == "Merlion" else t["name"]
            cableway["stations" if aw == "station" else "pylons"].append(rec)
        elif e["type"] == "way" and t.get("natural") == "coastline" and e.get("geometry"):
            pts = [proj(q["lat"], q["lon"]) for q in e["geometry"] if "lat" in q]
            if len(pts) >= 2:
                coast.append({"p": [[round(x, 1), round(z, 1)] for x, z in pts]})
        elif e["type"] == "way" and t.get("railway") == "monorail" and e.get("geometry"):
            pts = [proj(q["lat"], q["lon"]) for q in e["geometry"] if "lat" in q]
            if len(pts) >= 2:
                rec = {"p": [[round(x, 1), round(z, 1)] for x, z in pts]}
                try:
                    rec["lyr"] = int(float(t.get("layer") or 0))
                except ValueError:
                    rec["lyr"] = 0
                if t.get("bridge"):
                    rec["br"] = 1
                if t.get("tunnel") or rec["lyr"] < 0:
                    rec["tun"] = 1
                monorail.append(rec)

    out = {
        "origin": {"lat": LAT0, "lon": LON0},
        "buildings": buildings,
        "water": water,
        "green": green,
        "land": land,
        "piers": piers,
        "steps": steps_out,
        "barriers": barriers,
        "parkfurn": parkfurn,
        "towers": towers,
        "cranes": cranes,
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
        "cableway": cableway,
        "monorail": monorail,
        "coast": coast,
        "axisFullLength": round(axis_full, 1),
        "axis": {"p": [[round(x, 1), round(z, 1)] for x, z in axis],
                 "w": axis_width, "n": axis_name},
    }
    # FINAL RING CLEANUP, AFTER EVERY APPEND.
    #
    # The dedupe, despike and uncross passes above run in the middle of main(),
    # and building PARTS -- the masses that give a tower its podium, and link
    # bridges like OUE Link -- are appended hundreds of lines later. They were
    # skipping every repair in the file, which is why a ring kept being
    # reported as self-crossing while the build insisted it had fixed
    # everything: the build had, for the buildings it could still see.
    #
    # Cleaning here instead means every footprint gets the same treatment
    # however it entered the list. Cheap: the passes exit immediately on a ring
    # that is already sound, which is nearly all of them.
    # SG_NO_FINAL_RINGS=1 rebuilds without this pass, so its effect on the
    # downstream gates can be measured rather than argued about -- the same
    # switch SG_NO_RING_REPAIR gives the greedy repair above.
    _fd = _fc = 0
    _funfixed = []
    for _b in ([] if os.environ.get("SG_NO_FINAL_RINGS") else out["buildings"]):
        _p0 = _b.get("p") or []
        if len(_p0) < 3:
            continue
        _p1 = despike_ring(dedupe_ring(_p0))
        _fd += len(_p0) - len(_p1)
        if _self_crossing(_p1):
            _p2 = _uncross(_p1)
            if not (len(_p2) >= 3 and not _self_crossing(_p2) and _area2(_p2) > 8):
                # _uncross keeps the larger lobe of a bowtie. A ring whose
                # VERTEX ORDER is scrambled (the edge-clear can insert points
                # out of sequence) has no lobe to keep — the lossless repair
                # is 2-opt: reverse the run between the crossing segments.
                # Measured on the Distripark canopy at 464,10371 that neither
                # _uncross nor vertex-dropping could mend: clean in one pass,
                # every vertex kept, area 495 -> 665 (the true untangled
                # outline).
                _r2 = list(_p1)
                for _t in range(40):
                    _hit = None
                    _n2 = len(_r2)
                    for _i2 in range(_n2):
                        for _j2 in range(_i2 + 2, _n2):
                            if _i2 == 0 and _j2 == _n2 - 1:
                                continue
                            if _segs_cross(_r2[_i2], _r2[(_i2 + 1) % _n2],
                                           _r2[_j2], _r2[(_j2 + 1) % _n2]):
                                _hit = (_i2, _j2)
                                break
                        if _hit:
                            break
                    if not _hit:
                        break
                    _r2 = (_r2[:_hit[0] + 1] + list(reversed(_r2[_hit[0] + 1:_hit[1] + 1]))
                           + _r2[_hit[1] + 1:])
                _p2 = _r2
            if not (len(_p2) >= 3 and not _self_crossing(_p2) and _area2(_p2) > 8):
                # last resort: the vertex-dropping repair the mid-build uses
                _p2 = _greedy_uncross(_p1)
            if len(_p2) >= 3 and not _self_crossing(_p2) and _area2(_p2) > 8:
                _p1 = _p2
                _fc += 1
            else:
                # NEVER SILENT. This branch used to fall through without a
                # word, which is how four crossing rings shipped and were
                # found by the defect hunt instead of by this build.
                _cx = sum(q[0] for q in _p1) / len(_p1)
                _cz = sum(q[1] for q in _p1) / len(_p1)
                _funfixed.append((_b.get("n") or "(unnamed)", round(_cx), round(_cz)))
        _b["p"] = _p1
    if _fd or _fc:
        print(f"  final ring pass: {_fd} degenerate vertices dropped"
              + (f", {_fc} crossings cut" if _fc else ""))
    if _funfixed:
        print(f"  ! {len(_funfixed)} self-crossing ring(s) SHIPPED UNREPAIRED: "
              + ", ".join(f"{n} at {x},{z}" for n, x, z in _funfixed))

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
    if skipped_station_box:
        print(f"  skipped {skipped_station_box} station box(es) over 2,000 m2 that "
              f"carry no height and no storeys — an MRT station polygon here is "
              f"routinely the UNDERGROUND extent, and a type default there draws a "
              f"wall (see the note at the skip site)")
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
    if _PC_NAMED:
        print(f"  named {len(_PC_NAMED)} footprint(s) from their postcode via OneMap: "
              + ", ".join(sorted(set(_PC_NAMED))[:3]) + ("..." if len(set(_PC_NAMED)) > 3 else ""))
    if NAMES_STRIPPED:
        print(f"  dropped {len(NAMES_STRIPPED)} OSM names that are not building names: "
              f"{', '.join(sorted(set(NAMES_STRIPPED))[:4])}")
    if NAMES_CORRECTED:
        print("  corrected stale mapped names: "
              + ", ".join(f"{a!r} -> {b!r}" for a, b in sorted(set(NAMES_CORRECTED))))
    if HDB_JOINS:
        _tall = sorted(HDB_JOINS, key=lambda r: -r[2])[:3]
        print(f"  HDB join: {len(HDB_JOINS)} blocks matched to HDB storey records "
              f"(tallest {', '.join(f'{r[0]} {r[1]} {r[2]}st' for r in _tall)})")
    # COUNT WHAT YOU SUPPRESS, AND READ THE COUNT (WORKFLOW.md, 2026-08-01).
    # A suppression nobody can see is indistinguishable from a bbox that never
    # matched, which is how a rule silently stops applying.
    if SUPPRESSED_HEIGHT_TAGS:
        _sn = ", ".join(f"{n} ({v})" for n, v in SUPPRESSED_HEIGHT_TAGS[:4])
        print(f"  dropped {len(SUPPRESSED_HEIGHT_TAGS)} fabricated height tags "
              f"in the Kallang/Tanjong Rhu box: {_sn}"
              f"{'...' if len(SUPPRESSED_HEIGHT_TAGS) > 4 else ''}")
    if BAD_HEIGHT_TAGS:
        names = ", ".join(n for n, _ in BAD_HEIGHT_TAGS[:4])
        print(f"  refused {len(BAD_HEIGHT_TAGS)} implausible height tags "
              f"(under 2.5m): {names}{'...' if len(BAD_HEIGHT_TAGS) > 4 else ''}")
    if LATE_NAME_HEIGHTS:
        _ex = ", ".join(f"{n} {a}->{b2}m" for n, a, b2 in LATE_NAME_HEIGHTS[:3])
        print(f"  {len(LATE_NAME_HEIGHTS)} building(s) took a researched height only "
              f"AFTER being named late (no `name` tag; named from addr:housename, "
              f"wikidata or OneMap postcode) — LANDMARKS could not see them when "
              f"height_for() ran: {_ex}{'...' if len(LATE_NAME_HEIGHTS) > 3 else ''}")
    if BAD_COLOUR_TAGS:
        _red = sum(1 for _, _, v in BAD_COLOUR_TAGS if v.lower() == "#ff3333")
        _mal = len(BAD_COLOUR_TAGS) - _red
        _cn = ", ".join(n for n, _, _ in BAD_COLOUR_TAGS[:3])
        print(f"  refused {len(BAD_COLOUR_TAGS)} colour tag(s): {_red} x #ff3333 "
              f"(a tracing artefact, not a survey — 14x commoner than any real "
              f"roof colour and it was painting the Asian Civilisations Museum "
              f"and Parliament House fire-engine red)"
              + (f", {_mal} malformed hex" if _mal else "")
              + f" — {_cn}{'...' if len(BAD_COLOUR_TAGS) > 3 else ''}")
    # A WAY ID THAT NO LONGER MATCHES MUST NOT PASS QUIETLY. OSM ids change
    # when a mapper redraws a footprint, and a researched name that silently
    # stops applying is worse than never having had it: the district's score
    # would drop with nothing to point at. Only reported when at least one id
    # from the table WAS found, so the other seven districts stay silent.
    if _OSM_WAY_SEEN:
        _missing = sorted(set(OSM_WAY) - _OSM_WAY_SEEN)
        if _missing:
            print(f"  ! OSM_WAY: {len(_missing)} researched way id(s) not in this "
                  f"extract, so their names and storeys were NOT applied: "
                  + ", ".join(str(m) for m in _missing[:8]))
        print(f"  OSM_WAY: {len(_OSM_WAY_SEEN)} footprints named and sized by way id")
    print(f"  wrote {path}  {os.path.getsize(path)/1024:.0f} KB")
    print("\nlargest by footprint:")
    for b in buildings[:12]:
        print(f"  {b.get('n','(unnamed)')[:34]:36s} {b['a']:>7} m2   h={b['h']}")


if __name__ == "__main__":
    main()
