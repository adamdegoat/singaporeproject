#!/usr/bin/env python3
"""Ask OneMap what building stands at each postcode OSM left unnamed.

    python3 data/postcode_names.py            # fill in whatever is missing
    python3 data/postcode_names.py --recheck  # re-ask about the failures

WHY. A building with no name cannot reach a recipe, cannot carry researched
facts, and is drawn as anonymous fabric. Counted across the eight districts on
2026-08-01, OSM carries an `addr:postcode` but NO name on 406 footprints in
Chinatown, 144 in Orchard, 99 in Little India, 30 in Bugis and 18 in Bras Basah
-- nearly seven hundred buildings that the map can already identify and this
world was drawing as nothing in particular.

A Singapore postcode is not an area. It identifies ONE building, and SLA's
OneMap is the authority on which. This is the same method the River Valley
frontage research used by hand for seventeen buildings ("OneMap resolves the
name to 396 RIVER VALLEY ROAD RV SUITES SINGAPORE 248289, 3m from the footprint
centroid"), done for all of them at once.

WHAT IT WILL NOT DO. OneMap answers `BUILDING = NIL` for most shophouses,
because they genuinely have no building name -- a shophouse is an address, not
a named building. Those are recorded as NIL and never asked again. Naming them
would be inventing something, and an unnamed shophouse is CORRECT: it reaches
the shophouse recipe precisely by not being a landmark.

THE CACHE IS RESUME-SAFE, the same way hdb_geocode.py's is: every answer is
written as it arrives, and an unanswerable postcode is stored WITH that fact so
the next run does not ask again.
"""
import json, os, sys, time, urllib.parse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "postcode_names.json")
API = "https://www.onemap.gov.sg/api/common/elastic/search"
# READ THE REGISTRY. NEVER TYPE THE DISTRICT LIST BY HAND.
#
# This was a literal list of the original eight, and the coastal ring added
# seven more on 2026-08-02 without this file noticing — so kallang,
# marinaeast, tanjongrhu, marinasouth, keppel, harbourfront and sentosa were
# NEVER ASKED. Measured when it was found: 299 footprints in those seven carry
# an `addr:postcode` and no name, 178 of them in keppel, which is one of the
# two worst-named districts in the world at 11.7%.
#
# HANDOFF.md already states this rule in as many words for merge.py — "copying
# it after the ring was built would have silently dropped seven of them" — and
# it was true here at the same moment it was written there.
def _districts():
    reg = json.load(open(os.path.join(HERE, "districts.json")))
    return [d["id"] for d in reg["districts"]
            if (d.get("status") or "") not in ("planned",)
            and "merged" not in (d.get("status") or "")]

# Answers that are not building names. OneMap returns the road name in
# BUILDING for some records, and "NIL" for anything unnamed.
NOT_A_NAME = {"NIL", "", "-"}


def wanted():
    """Every postcode that identifies a footprint OSM has not named."""
    out = {}
    for d in _districts():
        p = os.path.join(HERE, "raw", "%s.json" % d)
        if not os.path.exists(p):
            continue
        raw = json.load(open(p))
        els = (raw["elements"] if "elements" in raw else
               [e for v in raw.values() if isinstance(v, dict) and "elements" in v
                for e in v["elements"]])
        for e in els:
            t = e.get("tags") or {}
            if "building" not in t:
                continue
            if t.get("name") or t.get("addr:housename"):
                continue
            pc = (t.get("addr:postcode") or "").strip()
            if len(pc) == 6 and pc.isdigit():
                out.setdefault(pc, []).append("%s/%s" % (e.get("type"), e.get("id")))
    return out


def ask(pc):
    url = API + "?" + urllib.parse.urlencode(
        {"searchVal": pc, "returnGeom": "N", "getAddrDetails": "Y"})
    req = urllib.request.Request(url, headers={"User-Agent": "orchard/1.0"})
    with urllib.request.urlopen(req, timeout=25) as r:
        j = json.load(r)
    for row in (j.get("results") or []):
        if (row.get("POSTAL") or "").strip() != pc:
            continue
        b = (row.get("BUILDING") or "").strip()
        if b.upper() in NOT_A_NAME:
            return {"name": None, "why": "onemap says NIL"}
        # A road name in the BUILDING field is not a building name.
        road = (row.get("ROAD_NAME") or "").strip().upper()
        if b.upper() == road:
            return {"name": None, "why": "building field repeats the road"}
        return {"name": b, "addr": (row.get("ADDRESS") or "").strip()}
    return {"name": None, "why": "no result for this postcode"}


def main():
    recheck = "--recheck" in sys.argv
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    todo = wanted()
    ask_list = [pc for pc in sorted(todo)
                if pc not in cache or (recheck and not cache[pc].get("name"))]
    print("  %d unnamed footprints carry a postcode, %d distinct"
          % (sum(len(v) for v in todo.values()), len(todo)))
    print("  %d already cached, %d to ask" % (len(todo) - len(ask_list), len(ask_list)))
    for i, pc in enumerate(ask_list):
        try:
            cache[pc] = ask(pc)
        except Exception as e:                       # a flaky request is not a crash
            cache[pc] = {"name": None, "why": "request failed: %s" % e}
        json.dump(cache, open(CACHE, "w"), indent=0, sort_keys=True)
        if i % 25 == 0:
            print("  %d/%d" % (i, len(ask_list)), end="  ", flush=True)
        time.sleep(0.12)                             # be a polite guest
    named = sum(1 for pc in todo if (cache.get(pc) or {}).get("name"))
    print("\n  wrote %s  %d of %d postcodes resolve to a building name"
          % (CACHE, named, len(todo)))
    ex = [(pc, cache[pc]["name"]) for pc in sorted(todo)
          if (cache.get(pc) or {}).get("name")][:6]
    for pc, n in ex:
        print("     %s  %s" % (pc, n))


if __name__ == "__main__":
    main()
