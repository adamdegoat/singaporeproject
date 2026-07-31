#!/usr/bin/env python3
"""Give every nearby HDB block a coordinate, so the join does not need an address.

    python3 data/hdb_geocode.py            # fill in whatever is missing
    python3 data/hdb_geocode.py --recheck  # re-ask OneMap about the failures

WHY. data/process.py joins HDB Property Information to OSM ways on
`addr:housenumber` + `addr:street`. That works and it is exact, but it only
reaches footprints that CARRY those tags, and it landed on 39 of Robertson's
558 buildings. Plenty of HDB slabs in OSM have no address on them at all --
they were traced from imagery and never tagged -- so the storey count and the
completion year had nowhere to attach.

A coordinate fixes that: geocode the block through SLA's OneMap, then test the
point against the footprints. A block number and street IS an address, OneMap
is the authority on Singapore addresses, and point-in-polygon is not a guess.

WHY NOT ALL 13,357 BLOCKS. HDB tags each block with its town, and the districts
in this model sit in five of them: Central, Bukit Merah, Kallang/Whampoa,
Queenstown and Geylang. That is about 1,800 blocks rather than thirteen
thousand, and everything outside is Punggol and Woodlands.

THE CACHE IS RESUME-SAFE. Every answer is written as it arrives, so an
interrupted run picks up where it stopped instead of starting again. A block
OneMap cannot find is recorded as a failure WITH that fact, not left blank --
otherwise every run re-asks the same unanswerable questions.
"""
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
BLOCKS = os.path.join(HERE, "hdb_blocks.json")
CACHE = os.path.join(HERE, "hdb_points.json")
API = "https://www.onemap.gov.sg/api/common/elastic/search"

# The HDB towns the eight districts fall in. Anything else is a different part
# of the island and geocoding it would be a few thousand requests for nothing.
TOWNS = {"CT", "BM", "KWN", "QT", "GL"}

# Same expansion the join in process.py uses: HDB writes "REDHILL CL", OneMap
# answers to "REDHILL CLOSE".
ABBR = {
    "RD": "ROAD", "AVE": "AVENUE", "ST": "STREET", "CRES": "CRESCENT",
    "LOR": "LORONG", "JLN": "JALAN", "BT": "BUKIT", "STH": "SOUTH",
    "NTH": "NORTH", "UPP": "UPPER", "CTRL": "CENTRAL", "DR": "DRIVE",
    "TER": "TERRACE", "PL": "PLACE", "CL": "CLOSE", "PK": "PARK",
    "GDNS": "GARDENS", "GDN": "GARDEN", "MKT": "MARKET", "HTS": "HEIGHTS",
    "C'WEALTH": "COMMONWEALTH", "IND": "INDUSTRIAL", "EST": "ESTATE",
    "KG": "KAMPONG", "SQ": "SQUARE", "VW": "VIEW", "WK": "WALK",
    "CTR": "CENTRE", "MT": "MOUNT", "TG": "TANJONG",
}


def expand(s):
    s = (s or "").upper().replace(".", "").replace(",", "")
    s = re.sub(r"[^A-Z0-9' ]", " ", s)
    return " ".join(ABBR.get(w, w) for w in s.split())


def lookup(blk, street):
    q = urllib.parse.quote(f"{blk} {expand(street)}")
    url = f"{API}?searchVal={q}&returnGeom=Y&getAddrDetails=Y&pageNum=1"
    req = urllib.request.Request(url, headers={"User-Agent": "orchard-sg/1.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.loads(r.read().decode())
            break
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            if attempt == 2:
                return None
            time.sleep(1.5 + attempt * 2)
    for res in (d.get("results") or []):
        # The block number must match exactly. OneMap will happily return
        # "86A REDHILL CLOSE" for a search for block 86, and 86A is a DIFFERENT
        # BLOCK with its own storey count -- taking it would hang one block's
        # height on another block's footprint.
        if (res.get("BLK_NO") or "").upper() != blk.upper():
            continue
        try:
            return [round(float(res["LATITUDE"]), 6), round(float(res["LONGITUDE"]), 6)]
        except (KeyError, TypeError, ValueError):
            continue
    return None


def main():
    recheck = "--recheck" in sys.argv
    blocks = json.load(open(BLOCKS))["blocks"]
    want = [b for b in blocks if (b.get("bldg_contract_town") or "") in TOWNS]
    print(f"  {len(want)} HDB blocks in {sorted(TOWNS)}")

    pts = {}
    if os.path.exists(CACHE):
        pts = json.load(open(CACHE))["points"]
    todo = [b for b in want
            if f"{b['blk_no']}|{b['street']}" not in pts
            or (recheck and pts[f"{b['blk_no']}|{b['street']}"] is None)]
    print(f"  {len(pts)} already cached, {len(todo)} to ask")

    def save():
        json.dump({"source": "SLA OneMap search API, block number + street",
                   "fetched": time.strftime("%Y-%m-%d"),
                   "towns": sorted(TOWNS), "points": pts}, open(CACHE, "w"))

    for i, b in enumerate(todo):
        key = f"{b['blk_no']}|{b['street']}"
        pts[key] = lookup(b["blk_no"], b["street"])
        if i % 25 == 0:
            save()
            print(f"  {i}/{len(todo)}", end="\r", flush=True)
        time.sleep(0.12)
    save()
    print()

    got = sum(1 for b in want if pts.get(f"{b['blk_no']}|{b['street']}"))
    print(f"  wrote {CACHE}  {got}/{len(want)} located "
          f"({os.path.getsize(CACHE)/1024:.0f} KB)")
    if got < 0.5 * len(want):
        print("  ! fewer than half located — check the OneMap API before trusting this")


main()
