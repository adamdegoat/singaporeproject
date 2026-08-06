"""CABLE-CAR STATIONS — four of them were standing as 20-27m office blocks.

Found by walking the Sensoryscape, 2026-08-06. At the north terminus of the
Sensoryscape walk — which is a PLAZA, published, with an elevated ring walkway
over it — there stood a seven-storey blue-glass curtain-walled block, and its
shopfront band put a solid 1,016 m2 cream plate 2.7m over the head of anyone
walking the connector. From under it the sky was gone.

IT IS THE CABLE-CAR STATION. Our own `cableway.stations` node for
"Sensoryscape" (the renamed Merlion Station) is 23m from that footprint's
centroid and INSIDE its ring. Nothing about it is an office block.

TWO AUTHORITIES DESCRIBING ONE FACT, AND THE PROXY ONE IS WRONG — the same
shape as greenFrac counting the sea, and as the 97 invented office blocks on
the golf course. The proxy here is `data/heights.py`, and it is not at fault:
OSM gives these four footprints NO height and NO name, so the band did the one
thing it can do, put 1,016 m2 in the 700-1200 bucket and returned that bucket's
median. A footprint band cannot know that a footprint is a station. Same
argument, in the same words, as heights.py's own note on `building=roof`:
A CANOPY'S HEIGHT IS A CLEARANCE, NOT A STOREY COUNT. A station's is a hall.

MEASURED before anything was written — all five stations, and their footprints:

    Harbourfront     "Harbourfront Tower 2"          59.0m  hs=osm     SURVEYED
    Sentosa          "Singapore Cable Car Station"   20.4m  hs=calib   invented
    Sensoryscape     (unnamed)                       27.2m  hs=calib   invented
    Imbiah Lookout   (unnamed)                       27.2m  hs=calib   invented
    Siloso Point     (unnamed)                       23.8m  hs=calib   invented

HarbourFront is CORRECT and is not touched: the station really is in the podium
of a 59m tower, and that height is surveyed. The rule below is what keeps it
safe — only a footprint whose height this project INVENTED (`hs == "calib"`) is
ever changed. A surveyed height is never overridden by this file, so the check
is on the SOURCE of the number, not on a name list somebody has to maintain.

WHAT IS PUBLISHED, AND WHAT IS NOT. Searched: the sources give the line
lengths, the cabin counts, the opening dates and the station names. No station
building on the island has a published height, footprint height or storey
count. So HALL_H is AUTHORED and this file says so, in the same terms
src/sgdetail.js uses for STATION_H ("authored, not published").

The authored reasoning, which is the part worth arguing with:

    The cableway layer ALREADY BUILDS the station. src/sgdetail.js draws the
    boarding deck at STATION_H = 12m, a parapet, four posts, a canopy roof at
    deck+4.8, and a walkable stair up to it. That structure is the station a
    player rides from. The footprint is the HALL it stands over — the ticketing
    and circulation floor at ground level — and the only arrangement in which
    both read is a hall whose roof sits well below the deck. So: one generous
    storey, 6.0m, the same number data/sensoryscape.py chose for the same kind
    of question, with the deck and its canopy plainly visible above it.

AND THE SLOPE RULE FINISHES THE JOB, which is why 6.0 is not the built height
everywhere. src/city.js grows a mass that its own hillside would swallow (rise
over half the height AND over 6m -> h = rise + 3). Ground rise measured inside
each ring: Sentosa 3.9m, Sensoryscape 7.2m, Imbiah Lookout 0.8m, Siloso Point
6.2m. So the built halls come out 6.0 / 10.2 / 6.0 / 9.2m — low and wide, which
is what these stations are, and nothing is buried at its uphill end.

`bt` IS SET, AND THAT MATTERS AS MUCH AS THE HEIGHT. With no `bt` at all, the
facade recipe falls through to its size rule — "a big footprint is a glazed
podium" — which is why a 1,016 m2 station came out as blue curtain wall.
`train_station` puts it in the STONE family (src/city.js, the civic line), so
it reads as a masonry hall. This is an ASSERTED tag, not a surveyed one, and it
is asserted on exactly the evidence above: there is a cable-car station node
inside the ring.

Idempotent, and ORDER MATTERS: run this AFTER data/heights.py. heights.py undoes
`hs in ("calib", "research")` by restoring `h0` and then re-bands, so a run of
heights.py after this one puts the office blocks back. Same constraint, same
reason, as data/sensoryscape.py.

Run:  python3 data/cablestations.py sentosa [--dry-run]
"""
import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# AUTHORED — see the header. One generous storey; the slope rule in
# src/city.js raises it where the ground under the ring would swallow it.
HALL_H = 6.0
# asserted from the station node inside the ring, so the facade recipe reads
# the footprint as a civic hall rather than as a glazed podium
HALL_BT = "train_station"


def inside(x, z, p):
    ins = False
    j = len(p) - 1
    for i in range(len(p)):
        xi, zi = p[i]
        xj, zj = p[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            ins = not ins
        j = i
    return ins


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    cw = d.get("cableway") or {}
    stations = cw.get("stations") or []
    if not stations:
        print("  ! no cableway stations in the scene — nothing to correct")
        return

    rings = [b for b in (d.get("buildings") or [])
             if isinstance(b.get("p"), list) and b["p"] and isinstance(b["p"][0], list)
             and len(b["p"]) >= 3]

    print(f"== cablestations {a.id}")
    fixed, kept, missing = [], [], []
    for st in stations:
        p = st.get("p")
        if not (isinstance(p, list) and len(p) == 2):
            continue
        host = None
        for b in rings:
            if inside(p[0], p[1], b["p"]):
                host = b
                break
        if host is None:
            missing.append(st.get("n"))
            continue
        # ONLY A HEIGHT THIS PROJECT INVENTED. A surveyed one is the truth and
        # this file has nothing to add to it — HarbourFront Tower 2 really is
        # 59m and really does carry the station in its podium.
        if host.get("hs") != "calib":
            kept.append((st.get("n"), host.get("n"), host.get("h"), host.get("hs")))
            continue
        # what a player is standing under RIGHT NOW, which is the banded
        # height — not h0, which is an earlier guess and would understate it
        built = host.get("h")
        host["h0"] = host.get("h0", built)
        host["h"] = HALL_H
        host["hs"] = "research"
        host["bt"] = HALL_BT
        host["low"] = 1
        fixed.append((st.get("n"), built, host.get("a")))

    for n, was, area in fixed:
        print(f"   {str(n):<16} {was:5.1f}m -> {HALL_H:.1f}m hall   "
              f"({area} m2, height was invented by the footprint band)")
    for n, bn, h, hs in kept:
        print(f"   {str(n):<16} left alone at {h}m — {hs} ({bn})")
    for n in missing:
        print(f"   {str(n):<16} ! no building footprint contains this station node")
    print(f"   {len(fixed)} corrected, {len(kept)} surveyed and untouched")

    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
