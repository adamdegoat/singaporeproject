#!/usr/bin/env python3
"""Quality gate for a district. Exits non-zero if it is not fit to ship.

    python3 check.py orchard
    python3 check.py --all

Every check here exists because the corresponding mistake actually shipped once:
zero-height buildings lying flat on the ground, 20m towers on 150 m2 footprints
through the back lanes, and geometry standing in the middle of Orchard Road.
"""
import argparse, json, math, os, re, subprocess, sys
import gzip

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "districts")


def load(did):
    """The one scene file for a district: data/<id>.json.

    This used to try data/districts/<id>.json first and quietly fall back, which
    is the same silent preference that once let terrain.py load a stale copy and
    write it back over a fresh reprocess. A leftover duplicate is a hard error
    here too, for the same reason.
    """
    canonical = os.path.join(HERE, f"{did}.json")
    legacy = os.path.join(OUT_DIR, f"{did}.json")
    if os.path.exists(canonical) and os.path.exists(legacy):
        sys.exit(f"two scene files for '{did}':\n  {canonical}\n  {legacy}\n"
                 f"Delete the one in districts/ - one file per district.")
    path = canonical if os.path.exists(canonical) else legacy
    if not os.path.exists(path):
        sys.exit(f"no scene for '{did}'. Run: python3 build_district.py {did}")
    return json.load(open(path)), path


def check(did):
    data, path = load(did)
    fails, warns = [], []
    B = data["buildings"]
    R = data["roads"]

    def fail(msg):
        fails.append(msg)
    def warn(msg):
        warns.append(msg)

    print(f"== {did}  ({os.path.basename(path)})")
    print(f"   buildings {len(B)}   roads {len(R)}   "
          f"named {sum(1 for b in B if b.get('n'))}   "
          f"axis pts {len((data.get('axis') or {}).get('p', []))}")

    # 1. no building may be flat on the ground
    flat = [b for b in B if b["h"] < 3.0]
    if flat:
        fail(f"{len(flat)} buildings under 3m tall (a missing or zero height tag): "
             + ", ".join((b.get("n") or "(unnamed)")[:20] for b in flat[:5]))

    # 2. no implausibly short big footprint
    # building=roof is excluded by kind, not by fudging the threshold: a roof
    # structure is a wide low canopy by definition.
    squat = [b for b in B if b["h"] < 8 and b["a"] > 600 and not b.get("roof")]
    if squat:
        fail(f"{len(squat)} footprints over 600 m2 shorter than 8m")

    # 3. no needle towers on tiny footprints
    needles = [b for b in B if b["a"] < 230 and b["h"] > 16
               and not b.get("k") and not b.get("hs")]
    if needles:
        fail(f"{len(needles)} sub-230 m2 footprints taller than 16m with GUESSED "
             f"heights (back-lane needles)")
    real_tall = [b for b in B if b["a"] < 230 and b["h"] > 16 and b.get("hs")]
    if real_tall:
        print(f"   {len(real_tall)} narrow towers kept: their heights are tagged, "
              f"so they are real")

    # 4. the axis must exist and be a sensible length
    ax = data.get("axis")
    if not ax or len(ax.get("p", [])) < 4:
        fail("no usable street axis: nothing will be dressed, and there is no spawn point")
    else:
        L = sum(math.dist(ax["p"][i], ax["p"][i + 1]) for i in range(len(ax["p"]) - 1))
        print(f"   axis length {L:.0f} m")
        if L < 250:
            fail(f"axis only {L:.0f}m long — the stitch probably failed")
        elif L < 500:
            warn(f"axis is short at {L:.0f}m")

    # 5. does the district actually cover its own main street? Orchard was built
    # for a long time covering only 43% of Orchard Road, and no check caught it
    # because nothing compared the axis against the street's real extent.
    ax = data.get("axis")
    full = data.get("axisFullLength")
    if ax and full:
        L = sum(math.dist(ax["p"][i], ax["p"][i + 1]) for i in range(len(ax["p"]) - 1))
        cov = 100 * L / full
        print(f"   main street coverage: {L:.0f}m of {full:.0f}m ({cov:.0f}%)")
        # A district may take part of a long street ON PURPOSE (River Valley
        # Road runs 4.9km; the rest belongs to a future district). That is a
        # decision, so it must be written down: a partialMainStreet reason in
        # districts.json downgrades this to a warning. Silence still fails.
        partial = None
        try:
            reg = json.load(open(os.path.join(HERE, "districts.json")))
            partial = next((x.get("partialMainStreet") for x in reg["districts"]
                            if x["id"] == did), None)
        except Exception:
            pass
        if cov < 85 and partial:
            warn(f"main street {cov:.0f}% covered, declared partial: {partial[:80]}…")
        elif cov < 85:
            fail(f"district covers only {cov:.0f}% of its main street; "
                 f"{full - L:.0f}m is outside the bbox. If this is deliberate, "
                 f"say so: add partialMainStreet with a reason in districts.json")
    elif ax:
        warn("axisFullLength not recorded, so street coverage is unverified")

    # 6. real map positions must be present. This check exists because a whole
    # district was built with every crossing, bus stop, signal and MRT entrance
    # placed at invented intervals, while OSM held the real coordinates all
    # along. Polish on top of invented positions is worse than no polish.
    layers = {
        "crossings": data.get("crossings", []),
        "signals": data.get("signals", []),
        "busstops": data.get("busstops", []),
        "mrt": data.get("mrt", []),
    }
    print("   real map positions: " + ", ".join(f"{k} {len(v)}" for k, v in layers.items()))
    missing = [k for k, v in layers.items() if not v]
    # A verified absence is a fact, not a fetch failure: Robertson Quay has
    # no MRT entrance INSIDE its box (checked live against Overpass, 0
    # elements). The declaration lives in districts.json with the evidence;
    # an UNDECLARED empty layer still fails, because the far more common
    # cause is a silently-dropped fetch part (Chinatown's whole river was
    # lost exactly that way the same night).
    try:
        reg = json.load(open(os.path.join(HERE, "districts.json")))
        ent = next((x for x in reg["districts"] if x["id"] == did), {})
    except Exception:
        ent = {}
    DECL = {"crossings": "noCrossings", "signals": "noSignals",
            "busstops": "noBusstops", "mrt": "noMrt"}
    for k in list(missing):
        note = ent.get(DECL[k])
        if note:
            warn(f"{k} verified absent: {str(note)[:70]}…")
            missing.remove(k)
    if missing:
        fail("no real positions for: " + ", ".join(missing)
             + " — these would be placed at invented intervals. Refetch with --force.")
    if len(layers["crossings"]) < 5:
        warn(f"only {len(layers['crossings'])} crossings; sparse for a city district")

    # 7. nothing in a carriageway (delegated to the road audit)
    audit = os.path.join(HERE, "audit_roads.py")
    if os.path.exists(audit):
        env = dict(os.environ); env["SG_SCENE"] = path
        r = subprocess.run([sys.executable, audit], env=env, capture_output=True, text=True)
        m = re.search(r"NON-service: (\d+)", r.stdout)
        e = re.search(r"building EDGES inside a carriageway: (\d+)", r.stdout)
        if m:
            n = int(m.group(1))
            print(f"   geometry in a real carriageway: {n}")
            if n > 0:
                fail(f"{n} pieces of added geometry sit in a real carriageway")
        if e:
            print(f"   building edges crossing any corridor: {e.group(1)} "
                  f"(service roads are expected)")
    else:
        warn("audit_roads.py missing, road clearance unverified")

    # 8. payload size, since this ships to a phone -- MEASURED AS IT SHIPS.
    #
    # This gated the file on disk, which is not the number a phone pays.
    # GitHub Pages serves JSON gzipped: measured 2026-07-29, world.json is
    # 1788 KB on disk and 452 KB over the wire, and the live site returns the
    # same 452 KB with Accept-Encoding: gzip. So the disk figure was failing a
    # region that downloads in well under half a megabyte.
    #
    # This mattered in a way nobody had noticed: `check.py world` had NEVER
    # been run -- the sign-off procedure lists it per district -- and when it
    # finally was, it said NOT READY for a scene that has been live and fine
    # for weeks. A gate on the wrong number is a gate that will either be
    # ignored or obeyed wrongly; both are worse than no gate.
    #
    # The uncompressed size is still printed, because JSON.parse cost on a
    # phone scales with it and it is the number that tells you the data is
    # growing. It just is not the thing that ships.
    raw_kb = os.path.getsize(path) / 1024
    with open(path, "rb") as fh:
        wire_kb = len(gzip.compress(fh.read(), 6)) / 1024
    print(f"   scene payload {wire_kb:.0f} KB over the wire ({raw_kb:.0f} KB on disk)")
    # THE MERGED REGION IS NOT A SCENE ALONGSIDE OTHERS — it is the one that
    # ships INSTEAD of them, as the ?nostream fallback, and it is by definition
    # the sum of every district. Judging it by the per-district budget meant it
    # went over the moment an eighth district was merged, which is not a defect
    # in anything. It still gets a ceiling, because a fallback nobody can
    # download is not a fallback: 2.5 MB gzipped, and the streaming path (which
    # is the default) never fetches it at all.
    limit = 2500 if did == "world" else 900
    if wire_kb > limit:
        fail(f"scene is {wire_kb:.0f} KB gzipped; over the {limit} KB budget"
             + ("" if did == "world" else "; too heavy to ship alongside others"))
    elif wire_kb > 600:
        warn(f"scene is {wire_kb:.0f} KB gzipped, watch the total as districts accumulate")

    for w in warns:
        print(f"   WARN  {w}")
    for f in fails:
        print(f"   FAIL  {f}")
    print("   " + ("PASS" if not fails else "NOT READY"))
    return len(fails)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?")
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    reg = json.load(open(os.path.join(HERE, "districts.json")))
    ids = [d["id"] for d in reg["districts"]] if a.all else [a.id or "orchard"]
    bad = 0
    for i, did in enumerate(ids):
        if a.all and not os.path.exists(os.path.join(OUT_DIR, f"{did}.json")):
            continue
        if i:
            print()
        bad += check(did)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
