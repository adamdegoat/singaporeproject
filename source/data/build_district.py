#!/usr/bin/env python3
"""Build one district end to end: fetch OSM, project, correct, clear roads, write.

    python3 build_district.py orchard
    python3 build_district.py somerset --force

Everything district-specific lives in districts.json, so adding a new part of
Singapore is an entry in that file plus a run of this script. Overpass is the
slow and flaky part, so raw responses are cached per district and reused unless
--force is given.
"""
import argparse, json, math, os, re, subprocess, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, "districts.json")))
RAW_DIR = os.path.join(HERE, "raw")
# The canonical scene path is data/<id>.json, the same one terrain.py and the
# app use. This wrote to data/districts/<id>.json, so building any new
# district would have produced a SECOND scene file for it, which is the exact
# duplicate terrain.py already hard-errors on.
OUT_DIR = HERE

MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.osm.jp/api/interpreter",
]


def order_mirrors():
    """Put the mirrors that are actually answering TODAY at the front.

    The order here was static, and on 2026-07-30 the first two were both dead:
    every query paid 150s of timeout twice before reaching a mirror that
    worked, so a fourteen-part district fetch spent over an hour purely
    waiting. Which mirror is up is a fact about today, not a fact about this
    file — so measure it once, with a query small enough to answer instantly,
    and sort by what came back. Costs a few seconds and saves an hour.
    """
    probe = ('[out:json][timeout:10];node["highway"="bus_stop"]'
             '(1.3040,103.8500,1.3050,103.8510);out;')
    scored = []
    for m in MIRRORS:
        host = m.split("//")[1].split("/")[0]
        t0 = time.time()
        try:
            req = urllib.request.Request(m, data=probe.encode(),
                                         headers={"User-Agent": "sgproject/1.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                r.read()
            dt = time.time() - t0
            scored.append((dt, m))
            print(f"  mirror {host:34s} ok  {dt:.1f}s", flush=True)
        except urllib.error.HTTPError as e:
            # A RATE LIMIT IS NOT A DEAD HOST. Overpass answers 429 (and
            # sometimes 504) when you have been asking too often, which is
            # exactly what a multi-part district fetch does — so the probe that
            # was meant to find the working mirror declared the ONLY working
            # mirror dead and gave up. Keep it in the ring, just at the back.
            busy = e.code in (429, 502, 503, 504)
            scored.append((60.0 if busy else 999.0, m))
            print(f"  mirror {host:34s} {'BUSY' if busy else 'DOWN'} (HTTP {e.code})", flush=True)
        except Exception as e:
            scored.append((999.0, m))
            print(f"  mirror {host:34s} DOWN ({type(e).__name__})", flush=True)
    scored.sort()
    if scored[0][0] > 900:
        # EVERY MIRROR BUSY IS A MOMENT, NOT A VERDICT. This used to exit the
        # whole run, which meant that refetching several districts in sequence
        # killed itself: the first district's fourteen-part fetch leaves every
        # mirror rate-limiting us, so the second district's PROBE finds nothing
        # answering and gives up before asking for anything. Chinatown's
        # refetch on 2026-07-31 did exactly that to Orchard's, one minute
        # later.
        #
        # Nothing is lost by waiting -- the caches are untouched and the guard
        # further down refuses a short fetch anyway. So wait, and ask again.
        for wait in (60, 150, 300, 600):
            print(f"  every mirror busy — waiting {wait}s before re-probing",
                  flush=True)
            time.sleep(wait)
            again = []
            for m in MIRRORS:
                host = m.split("//")[1].split("/")[0]
                t0 = time.time()
                try:
                    req = urllib.request.Request(
                        m, data=probe.encode(),
                        headers={"User-Agent": "sgproject/1.0"})
                    with urllib.request.urlopen(req, timeout=20) as r:
                        r.read()
                    dt = time.time() - t0
                    again.append((dt, m))
                    print(f"  mirror {host:34s} ok  {dt:.1f}s", flush=True)
                except urllib.error.HTTPError as e:
                    busy = e.code in (429, 502, 503, 504)
                    again.append((60.0 if busy else 999.0, m))
                except Exception:
                    again.append((999.0, m))
            again.sort()
            if again[0][0] <= 900:
                scored = again
                break
        else:
            sys.exit("  ! every Overpass mirror still unreachable after 18 "
                     "minutes of waiting — try again later. No cache was touched.")
    # DROP THE DEAD ONES ENTIRELY rather than rotating onto them. A mirror that
    # did not answer a one-node probe will not answer a district query either,
    # and every attempt on it costs a full 90s timeout: with three of four down
    # and the survivor rate-limiting (HTTP 429 is normal on Overpass), each
    # retry was paying 270s of dead air before trying the only host that works.
    # Retrying the live mirror after a backoff is what rate limiting actually
    # wants.
    live = [m for dt, m in scored if dt < 900]
    if live and scored[0][0] >= 60.0:
        # everything alive is rate-limited: give it a moment before the
        # real queries start, rather than burning attempts immediately
        print('  all live mirrors are rate-limited — pausing 90s', flush=True)
        time.sleep(90)
    print(f"  using {len(live)} live mirror(s)", flush=True)
    return live


def district(did):
    for d in REG["districts"]:
        if d["id"] == did:
            return d
    sys.exit(f"no district '{did}' in districts.json. Known: "
             + ", ".join(x["id"] for x in REG["districts"]))


def fetch_part(bbox, body, label, attempts=8, expect=True, mirrors=None):
    """One Overpass query, retried across mirrors. Small pieces succeed where a
    single combined query times out — that is not optional, it is how this works."""
    q = f"[out:json][timeout:120];\n({body}\n);\nout geom;"
    for a in range(attempts):
        ring = mirrors or MIRRORS
        mirror = ring[a % len(ring)]
        host = mirror.split("//")[1].split("/")[0]
        try:
            req = urllib.request.Request(
                mirror, data=q.encode(), headers={"User-Agent": "sgproject/1.0"})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read().decode())
            n = len(data.get("elements", []))
            # A part returning zero must be loud. A silent empty once produced a
            # whole district with no real street furniture positions at all, and
            # it only surfaced because the counts were checked by hand.
            if n == 0 and expect and a < attempts - 1:
                print(f"    {label:10s}     0 via {host} — suspicious, retrying elsewhere",
                      flush=True)
                time.sleep(3)
                continue
            print(f"    {label:10s} {n:5d} elements via {host}", flush=True)
            return data["elements"]
        except Exception as e:
            print(f"    {label:10s} attempt {a+1} failed on {host}: {type(e).__name__}", flush=True)
            # a short ring means we are retrying the SAME host, so back off
            # properly instead of hammering a rate limiter
            time.sleep((5 + a * 7) if len(ring) > 2 else (8 + a * 12))
    print(f"    {label:10s} GAVE UP", flush=True)
    return []


def fetch(d, force=False):
    os.makedirs(RAW_DIR, exist_ok=True)
    path = os.path.join(RAW_DIR, f"{d['id']}.json")
    if os.path.exists(path) and not force:
        size = os.path.getsize(path) / 1024
        print(f"  raw cache hit ({size:.0f} KB) — pass --force to refetch")
        return path
    bbox = d["bbox"]
    # DO NOT QUEUE FOR A SERVICE YOU ARE NOT GOING TO USE.
    #
    # `order_mirrors()` probes all four Overpass hosts and, if every one is
    # rate-limited, waits 60 + 150 + 300 + 600 seconds before giving up. That
    # was right when Overpass was the only source. With the local extract in
    # place it is eighteen minutes of waiting for an answer already sitting on
    # disk — and it does not merely waste the time, it EXITS, so harbourfront's
    # first build failed at 05:20 having fetched nothing while a 36MB file that
    # could answer every layer sat unread beside it.
    #
    # Probe the mirrors only when the local extract cannot serve as the primary
    # source. The per-layer fallback further down still reaches the network for
    # anything the reader cannot parse; it just does so without a queue in
    # front of it.
    _have_local = False
    try:
        sys.path.insert(0, HERE)
        import osmlocal as _ol
        _have_local = os.path.exists(_ol.PBF)
    except Exception:
        _have_local = False
    if _have_local:
        print("  local extract present — skipping the Overpass mirror probe", flush=True)
        ring = MIRRORS
    else:
        ring = order_mirrors()
    parts = {
        # Relations too: 11 of Marina Bay's buildings are multipolygons,
        # among them the ArtScience Museum, The Shoppes, Victoria Theatre,
        # Parliament House and Clifford Pier. A way-only query loses them all
        # and looks like a clean fetch.
        # AND building:part. The note above is right and stopped one step short:
        # a query that asks only for `building` ALSO looks like a clean fetch
        # while losing every way tagged only `building:part`. That is 99 ways in
        # the Orchard bbox alone, and it is why One Raffles Place Tower 1 -- a
        # 283m landmark, mapped, with its height on it -- appeared to have no
        # footprint at all. process.py already promotes a part to a building
        # when it carries a height, levels or a name; the fetch simply never
        # delivered one. Also unlocks Lucky Plaza Residence, Ngee Ann City's
        # stepped Tower A/B massing and the Grand Hyatt tower.
        "buildings": (f'way["building"]({bbox});rel["building"]({bbox});'
                      f'way["building:part"]({bbox});rel["building:part"]({bbox});'),
        "roads": (f'way["highway"~"^(trunk|primary|secondary|tertiary|residential|'
                  f'service|unclassified|living_street|pedestrian)$"]({bbox});'),
        "paths": f'way["highway"="footway"]({bbox});',
        # Real positions for everything we were previously placing at invented
        # intervals. This is the difference between a plausible street and an
        # accurate one, and it scales to every district for free.
        "trees": f'node["natural"="tree"]({bbox});way["natural"="tree_row"]({bbox});',
        "crossings": f'node["highway"="crossing"]({bbox});',
        "signals": f'node["highway"="traffic_signals"]({bbox});',
        "busstops": f'node["highway"="bus_stop"]({bbox});node["public_transport"="platform"]({bbox});',
        "mrt": (f'node["railway"="subway_entrance"]({bbox});'
                f'node["railway"="station"]({bbox});'
                f'way["railway"="subway_entrance"]({bbox});'),
        "taxi": f'node["amenity"="taxi"]({bbox});way["amenity"="taxi"]({bbox});',
        # real overhead bridges and covered walkways, and the actual tenants at
        # street level — the names people navigate by
        "bridges": f'way["highway"="footway"]["bridge"]({bbox});',
        "covered": f'way["highway"="footway"]["covered"]({bbox});',
        "shops": (f'node["shop"]({bbox});way["shop"]({bbox});'
                  f'node["amenity"~"^(restaurant|cafe|bank|fast_food|pharmacy|cinema)$"]({bbox});'),
        # WATER, and it has to include RELATIONS. A bay, a reservoir or a river
        # basin is almost always a multipolygon relation in OSM, not a closed
        # way -- Marina Reservoir and the Singapore River both are -- so a
        # way-only query returns the ornamental ponds and misses the bay. The
        # sea is a `natural=coastline` way rather than a polygon at all, and is
        # fetched separately so the shoreline can close against the bbox.
        "water": (f'way["natural"="water"]({bbox});rel["natural"="water"]({bbox});'
                  f'way["landuse"="reservoir"]({bbox});rel["landuse"="reservoir"]({bbox});'
                  f'way["waterway"~"^(riverbank|dock|canal|river|stream)$"]({bbox});'
                  f'rel["waterway"="riverbank"]({bbox});'),
        "coast": f'way["natural"="coastline"]({bbox});',
        # Free-standing structures that are not buildings: the Supertrees are
        # `man_made=tower` and are mapped individually with real positions,
        # while the Grove itself is only a garden polygon. Without this the most
        # recognisable thing in Gardens by the Bay is an empty lawn.
        # THE QUAY CRANES ARE THE HORIZON AND THEY WERE NEVER ASKED FOR.
        #
        # 25 `man_made=crane` nodes stand along the Keppel quay, ~52m tall and
        # 500-800m out. `data/raw/keppel.json` contained ZERO of them, not
        # because anything failed to parse but because this query only ever
        # said `man_made=tower` — the same shape as the steps and parkfurn gap
        # of 2026-08-02, where the tags were never unread, they were never
        # REQUESTED. research/keppel-landmarks.md calls the crane line "the
        # biggest single visual omission in the district".
        #
        # Folded into the `towers` layer rather than given its own: a layer
        # costs a query on the Overpass fallback path, both are free-standing
        # non-building structures, and the parser tells them apart by tag.
        "towers": (f'way["man_made"="tower"]({bbox});node["man_made"="tower"]({bbox});'
                   f'way["man_made"="crane"]({bbox});node["man_made"="crane"]({bbox});'),
    }
    merged, seen = [], set()
    empty = []

    # ONE PASS OVER THE LOCAL EXTRACT ANSWERS EVERY LAYER AT ONCE.
    #
    # This is the whole point, and doing it per-layer would have been pointless:
    # a scan of the 36MB island file costs ~95s, so fifteen separate scans is
    # twenty-four minutes and no better than the network. Asked together it is
    # ONE ~95s scan for the entire district, against the 15 queries + 16 retries
    # that kallang actually paid over Overpass.
    #
    # Validated before wiring: id-for-id and vertex-for-vertex identical to the
    # cached Overpass responses, including the relation counts (3 building
    # relations and 1 water relation in the kallang bbox, not the 1,245 an
    # unfiltered first version returned).
    #
    # Anything the local reader cannot answer is simply missing from `local`
    # and falls through to fetch_part exactly as before. An EMPTY local answer
    # for a layer that expects data also falls through, because "a part
    # returning zero must be loud" is a rule this file already enforces and a
    # deterministic zero deserves the same second opinion as a network one.
    local = {}
    try:
        sys.path.insert(0, HERE)
        import osmlocal
        if os.path.exists(osmlocal.PBF):
            t_loc = time.time()
            local = osmlocal.fetch_many(bbox, parts) or {}
            if local:
                print(f"  local extract answered {len(local)} layers in "
                      f"{time.time() - t_loc:.0f}s (no network)", flush=True)
    except Exception as exc:
        print(f"  local extract unavailable ({type(exc).__name__}); using Overpass", flush=True)
        local = {}

    for label, body in parts.items():
        expect_data = label not in ("water", "coast", "towers")
        got = local.get(label)
        if got is not None and (got or not expect_data):
            print(f"    {label:10s} {len(got):5d} elements via LOCAL", flush=True)
        else:
            got = fetch_part(bbox, body, label, expect=expect_data, mirrors=ring)
        if not got and label not in ("water", "coast", "towers", "taxi"):
            empty.append(label)
        for e in got:
            k = (e["type"], e["id"])
            if k not in seen:
                seen.add(k)
                merged.append(e)
    if empty:
        print(f"  ! these parts came back EMPTY and probably should not have: "
              f"{', '.join(empty)}")
        print(f"  ! rerun with --force before trusting this district")
    if not merged:
        sys.exit("  ! nothing fetched; Overpass may be down. Try again later.")

    # A REFETCH THAT LOSES DATA MUST NOT OVERWRITE THE CACHE.
    #
    # Overpass mirrors fail per-layer and the retry ladder falls back to another
    # mirror, which can quietly return a partial answer. On 2026-07-31 an Orchard
    # refetch came back with the 196 building:part ways it was sent for AND 172
    # fewer buildings and 573 fewer roads. Every per-layer line said "ok". The
    # only reason it was caught is that the raw file had been backed up by hand
    # and the counts compared afterwards.
    #
    # The existing guard only catches a layer that comes back EMPTY. This one
    # catches a layer that comes back THIN, which is the commoner and quieter
    # failure. Categories are recomputed from tags on both sides, so it does not
    # depend on the fetch structure staying the same.
    if os.path.exists(path):
        def _census(els):
            c = {"building": 0, "highway": 0, "tree": 0, "crossing": 0, "poi": 0}
            for e in els:
                t = e.get("tags") or {}
                if "building" in t or "building:part" in t:
                    c["building"] += 1
                if "highway" in t:
                    c["highway"] += 1
                if t.get("natural") == "tree":
                    c["tree"] += 1
                if t.get("highway") == "crossing":
                    c["crossing"] += 1
                if t.get("shop") or t.get("amenity"):
                    c["poi"] += 1
            return c
        try:
            was = _census(json.load(open(path)).get("elements", []))
        except Exception:
            was = None
        if was:
            now = _census(merged)
            # 0.98 WAS TOO LOOSE, and it cost an hour on 2026-07-31. River
            # Valley's refetch came back 19 road ways short — 2,105 to 2,086,
            # a 0.9% loss — sailed through this guard, and the audit then
            # caught the consequence as two new road-network islands. The
            # refetch had to be reverted and its 202 building:part masses went
            # with it.
            #
            # A refetch is a whole-district re-pull of the same bounding box
            # from the same source. It should return the same features. Any
            # loss at all is a flaky mirror, not news about the world, so the
            # threshold is now a hair under parity rather than a 2% allowance:
            # 0.998 tolerates a single element moving in or out of the box on
            # a large category and nothing more.
            lost = [(k, was[k], now[k]) for k in was
                    if was[k] > 20 and now[k] < was[k] * 0.998]
            if lost:
                rej = path + ".rejected"
                json.dump({"elements": merged}, open(rej, "w"))
                print("  ! REFETCH REJECTED — it LOST data and the cache is untouched:")
                for k, a, b in lost:
                    print(f"  !   {k:9} {a} -> {b}   ({b - a:+d}, {100*(b-a)/a:+.1f}%)")
                print(f"  ! the fetched copy is at {rej} if you want to inspect it.")
                print("  ! this is a flaky-mirror partial, not news about the world.")
                print("  ! just run --force again; a clean fetch will be accepted.")
                return path

    json.dump({"elements": merged}, open(path, "w"))
    print(f"  raw: {len(merged)} elements -> {path} ({os.path.getsize(path)/1024:.0f} KB)")
    return path


def process(d, raw_path):
    """Reuse process.py, which holds all the correction logic, by pointing it at
    this district's raw file and origin. One code path for every district."""
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, f"{d['id']}.json")
    env = dict(os.environ)
    env["SG_RAW"] = raw_path
    env["SG_OUT"] = out_path
    env["SG_LAT0"] = str(REG["island_origin"][0])
    env["SG_LON0"] = str(REG["island_origin"][1])
    env["SG_AXIS"] = d.get("axis", "")
    env["SG_BBOX"] = d["bbox"]
    r = subprocess.run([sys.executable, os.path.join(HERE, "process.py")],
                       env=env, capture_output=True, text=True)
    print(r.stdout.rstrip())
    if r.returncode != 0:
        print(r.stderr[-2000:])
        sys.exit(f"  ! process.py failed for {d['id']}")
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--force", action="store_true", help="refetch from Overpass")
    a = ap.parse_args()
    d = district(a.id)

    print(f"== {d['name']}  [{d['id']}]  bbox {d['bbox']}")
    raw = fetch(d, a.force)
    out = process(d, raw)
    print(f"  scene: {out} ({os.path.getsize(out)/1024:.0f} KB)")
    # The surveyed ERP gantries, which come from LTA rather than from Overpass
    # and so are a separate step. They were placed by rule at two invented
    # arclengths until 2026-07-28; see data/gantries.py.
    subprocess.run([sys.executable, os.path.join(HERE, "gantries.py"), d["id"]], check=False)
    subprocess.run([sys.executable, os.path.join(HERE, "lamps.py"), d["id"]], check=False)
    # THE MAP IS THE ISLAND. The bbox is a rectangle and swept in Pulau Brani,
    # the Keppel terminal and HarbourFront — 24 of the 30 km that measured as
    # "unreachable network" was simply land that is not Sentosa. Clipping is
    # part of the build, not a thing done by hand afterwards, or the next
    # rebuild silently puts the mainland back. See data/island.py.
    subprocess.run([sys.executable, os.path.join(HERE, "island.py"), d["id"]], check=True)
    # Then join the paths the surveyor left unjoined: 58 of Sentosa's 66
    # stranded pieces sat within 15m of the network, including the 1,751m
    # Imbiah trail at 5.4m. See data/stitch.py.
    subprocess.run([sys.executable, os.path.join(HERE, "stitch.py"), d["id"]], check=True)
    # One continuous height profile for the Sentosa Express, because OSM's
    # layer tag is crossing order and reading it as metres built the guideway
    # at three different heights. See data/monorail.py.
    subprocess.run([sys.executable, os.path.join(HERE, "monorail.py"), d["id"]], check=False)
    # Where a real carriageway runs through a real footprint, open the ground
    # storey — the road passes under the structure. See data/openground.py.
    subprocess.run([sys.executable, os.path.join(HERE, "openground.py"), d["id"]], check=False)
    # MegaZip is not in OSM — authored from measured endpoints against
    # published figures. See data/zipline.py.
    subprocess.run([sys.executable, os.path.join(HERE, "zipline.py"), d["id"]], check=False)
    # Give every path that stops at nothing a reason to stop, then report.
    subprocess.run([sys.executable, os.path.join(HERE, "navcheck.py"), d["id"],
                    "--emit-termini"], check=False)

    print(f"\nNext: python3 check.py {d['id']}")


if __name__ == "__main__":
    main()
