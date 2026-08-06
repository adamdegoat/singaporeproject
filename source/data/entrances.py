"""ATTRACTION ENTRANCES — somewhere to arrive, and somebody to tell you what it is.

The owner: "all those attractions i think need to have like a entry place with
avatar giving basic guides? make it like an experience that ppl can explore
when with friends playing tgt right?"

An attraction in this world is currently a name on a polygon. You ride past it
and nothing tells you it is there, what it is, or where you would go in. This
computes, for every attraction worth arriving at, the place you would ARRIVE:

  * the nearest point on a way a person can actually reach it by — footway,
    pedestrian way or road, because an entrance nobody can walk to is not an
    entrance;
  * the direction that faces from the way back toward the attraction, so the
    gate, the board and the guide all face the visitor rather than the bushes;
  * a one-line description, so the guide has something true to say.

WHAT IS SAID IS TRUE OR IT IS NOT SAID. The lines below are written from
published facts and from the map's own tags. Where a number is not published
(the USS globe's diameter is the standing example in this project) it is not
invented — the line simply does not carry a number. A guide that makes things
up is worse than no guide, because a player has no way to tell.

Run:  python3 data/entrances.py sentosa [--dry-run]
"""
import argparse
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))

REACH = 90.0          # how far an entrance may be from the thing it serves
WALK = {"footway", "pedestrian", "path", "steps"}

# One line each, and every one of them checkable. Keyed on a lowercase
# substring of the mapped name.
LINES = [
    ("universal studios", "Seven themed zones. The rides run from the lagoon end."),
    ("skyline luge", "Ride the luge down, take the SkyRide back up."),
    ("mega adventure", "MegaZip runs 450m from Imbiah Hill to the island off the beach."),
    ("fort siloso", "Singapore's last coastal fort, and the only one left intact."),
    ("skyhelix", "Open-air gondola. Highest view on the island."),
    ("sentosa nature discovery", "A short walk through secondary rainforest."),
    ("oceanarium", "Deep-sea habitats, on the Waterfront."),
    ("madame tussauds", "Wax figures, plus a boat ride through Singapore's story."),
    ("images of singapore", "The island's history, told room by room."),
    ("sensoryscape", "A 350m planted walk from Resorts World down to the beaches."),
    # The six Sensoryscape gardens (Serie + Multiply, opened March 2024).
    # Three of them sit inside woven diagrid structures; the light show runs
    # nightly from 7.50pm. archdaily.com / sensoryscape.sentosa.com.sg.
    ("lookout loop", "The top of the Sensoryscape walk, looking back over Resorts World."),
    ("tactile trellis", "A Sensoryscape garden, enclosed by a woven diagrid shell."),
    ("scented sphere", "A Sensoryscape garden of fragrant planting, under a woven shell."),
    ("symphony streams", "Water and sound, under the third of the woven shells."),
    ("palate playground", "The taste garden on the Sensoryscape walk."),
    ("glow garden", "Lit flower stalks up the stair. The show runs nightly from 7.50pm."),
    ("aj hackett", "Bungee, giant swing and a skybridge over Siloso."),
    ("battlestar", "Duelling coasters, 42.5m at the top."),
    ("transformers", "A 3D dark ride."),
    ("jurassic park rapids", "A river raft ride. You will get wet."),
    ("enchanted airways", "A junior coaster."),
    ("canopy flyer", "A suspended coaster over the lost world."),
    ("revenge of the mummy", "An indoor coaster in the dark."),
    ("puss in boots", "A family coaster over the roofs."),
    ("wave house", "Standing waves for surfing, on Siloso Beach."),
    ("tanjong beach", "The quiet beach. The furthest one east."),
    ("palawan beach", "The family beach, with the suspension bridge."),
    ("siloso beach", "The busy beach: bars, volleyball and the beach walk."),
    ("cable car", "Two lines: across to HarbourFront, and along the island."),
    ("skyride", "The chairlift back up to the luge start."),

    # THE SEVEN USS ZONES. Every one of these read "An attraction." until
    # 2026-08-06, which is the line a player gets ON ARRIVAL — so walking into
    # Sci-Fi City told you nothing about Sci-Fi City. The owner's standard:
    # "USS needs to feel like USS when walking inside". Each line names only
    # what is actually in that zone in our own data, so none of it is invented.
    ("hollywood", "The entrance boulevard, and the way back out."),
    ("new york", "Street sets and a soundstage, dressed as New York."),
    ("sci-fi city", "Battlestar Galactica and TRANSFORMERS are both here."),
    ("ancient egypt", "Revenge of the Mummy and Treasure Hunters."),
    ("the lost world", "Dinosaurs, the rapids ride and the WaterWorld arena."),
    ("far far away", "The castle on the hill, with two family coasters."),
    ("minion land", "Opened 2025, on the old Madagascar site."),

    # THE LUGE TRAILS. Five of them said "A luge run." and nothing else.
    ("luge dragon", "The longest luge trail. The SkyRide takes you back up."),
    ("luge expedition", "A luge trail down toward the beach."),
    ("luge jungle", "The luge trail through the trees."),
    ("luge kupu", "A luge trail down toward the beach."),
    ("megazip", "MegaZip runs 450m from Imbiah Hill to the island off the beach."),

    # ADVENTURE COVE, whose slides all read "An attraction."
    ("riptide rocket", "A water coaster: it goes uphill as well as down."),
    ("dueling racer", "Two mat slides, side by side."),
    ("tidal twister", "Two of Adventure Cove's slides."),
    ("whirlpool", "A slide that drops into a bowl."),
    ("big bucket", "The tipping bucket, in the shallow end."),
    ("wet maze", "The water-jet maze at Adventure Cove."),

    # ...and the rest of the island's generics
    ("accelerator", "The spinning ride in Sci-Fi City."),
    ("dino-soarin", "A gentle flying ride in The Lost World."),
    ("treasure hunters", "A drive-yourself jeep ride through Ancient Egypt."),
    ("4d adventureland", "4D films and simulator rides."),
    ("scentopia", "Make your own scent, on Siloso Beach."),
    ("trickeye", "Optical illusions you stand inside."),
    ("imbiah bunkers", "Wartime bunkers, dug into Imbiah."),
    ("dragon's teeth gate", "Looks out over the strait, where Long Ya Men stood."),
    ("southern ridges", "The mainland ridge walk, across the water."),
]
DEFAULT_LINE = {
    "theme_park": "A theme park.",
    "roller_coaster": "A roller coaster.",
    "amusement_ride": "A ride.",
    "dark_ride": "An indoor ride.",
    "museum": "A museum.",
    "aquarium": "An aquarium.",
    "fort": "A coastal fort.",
    "viewpoint": "A viewpoint.",
    "attraction": "An attraction.",
    "summer_toboggan": "A luge run.",
    "bungee_jumping": "A bungee jump.",
    "castle": "A castle.",
    "ruins": "Ruins.",
}
# things that are scenery, not places you enter
SKIP = {"artwork", "cannon", "bench", "picnic_table", "building", "city_gate"}

# HOW TO RIDE IT — the second line, and the gap this file was written with.
#
# The owner, 2026-08-06: "walk into the attraction like really got entrance and
# got avatar guide on how to play and all. U know like real places ya the
# experience." The lines above tell you WHERE YOU ARE. For something you can
# actually get on, that is half a guide.
#
# EVERY LINE HERE IS READ OFF src/rides.js AND NOTHING ELSE. Not off what the
# real ride does, and not off what this world intends to build — the 2026-08-06
# session found three features that were described in a comment and never once
# executed (the cable-car platform remap, the monorail station pins, the mask
# dilation in terrain.js), so a guide describing a ride the code does not
# implement is the same class of lie as a label with nothing under it. What the
# code does today:
#
#   * you board by standing near it and pressing Ride (the mode button, or E)
#   * the carrier runs the path on its own; there is no steering on any ride
#   * at the end it puts you down on the ground under the carrier
#   * `boards` is [{s:0}] for the luge, MegaZip and both waves — ONE WAY, from
#     one end only — and the cable car and SkyRide carry a stop at each station
#
# What is deliberately NOT said, because the code does not do it: that you can
# choose a direction from an intermediate station (boarding anywhere past the
# start always runs back toward the start), and that you can come off a wave
# and get back on. Both would be reasonable to build; neither is built.
RIDE_LINES = [
    ("cable car", "Climb to the platform first, then press Ride."),
    ("skyride", "Press Ride at either end and the chair carries you."),
    ("luge", "Press Ride at the top. The cart runs the trail down on its own."),
    ("mega adventure", "Press Ride at the tower. One way, out over the beach."),
    ("megazip", "Press Ride at the tower. One way, out over the beach."),
    ("surf cove", "Two lanes on the sheet, so take one each. Press Ride on the deck."),
    ("wave house", "Two lanes on the sheet, so take one each. Press Ride on the deck."),
]


def ride_line(name):
    low = (name or "").lower()
    for (needle, txt) in RIDE_LINES:
        if needle in low:
            return txt
    return ""


def line_for(name, kind):
    low = (name or "").lower()
    for (needle, txt) in LINES:
        if needle in low:
            return txt
    return DEFAULT_LINE.get(kind, "")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id", nargs="?", default="sentosa")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    path = os.path.join(HERE, f"{a.id}.json")
    d = json.load(open(path))

    # every point on a way somebody could walk or ride to
    approach = []
    for r in (d.get("roads") or []):
        if not isinstance(r, dict):
            continue
        pts = r.get("p") or []
        walkable = r.get("k") in WALK
        for i in range(len(pts) - 1):
            ax, ay = pts[i][0], pts[i][1]
            bx, by = pts[i + 1][0], pts[i + 1][1]
            L = math.hypot(bx - ax, by - ay)
            n = max(1, int(L / 6))
            for s in range(n + 1):
                t = s / n
                approach.append((ax + (bx - ax) * t, ay + (by - ay) * t, walkable))
    if not approach:
        print("  ! no ways to approach anything")
        return

    cell = 40.0
    grid = {}
    for i, (x, y, w) in enumerate(approach):
        grid.setdefault((int(x // cell), int(y // cell)), []).append(i)

    # THE CABLE-CAR STATIONS ARE PLACES YOU ARRIVE AT, AND THEY WERE NOT IN THE
    # LIST. This loop read `attractions` and nothing else, and the five stations
    # live in `cableway.stations` — so the island's signature ride had no gate,
    # no forecourt and nobody to tell you how to get on it. Exactly the shape of
    # the teleport-list bug found on 2026-08-06 ("cable-car stations were never
    # a pin SOURCE"): one more layer holding places, and one loop that has never
    # heard of it.
    #
    # They are ADDED to the sources rather than copied into `attractions`,
    # because a station is not an attraction and the rest of the pipeline is
    # entitled to keep telling them apart.
    sources = list(d.get("attractions") or [])
    cw = d.get("cableway") or {}
    for st in (cw.get("stations") or []):
        if not (st.get("n") and st.get("p")):
            continue
        # WHICH LINE IT IS ON COMES OUT OF THE WIRE, not out of a table someone
        # has to keep. The substring guide lines would otherwise answer for it —
        # "Sensoryscape" matched the GARDEN WALK and told a passenger standing
        # on a cable-car platform about 350 m of planting.
        sx, sz = st["p"]
        on = []
        for ln in (cw.get("lines") or []):
            if ln.get("k") != "gondola" or not ln.get("p"):
                continue
            near = min(math.hypot(q[0] - sx, q[1] - sz) for q in ln["p"])
            if near < 60 and ln.get("n") and ln["n"] not in on:
                on.append(ln["n"])
        sources.append({
            "n": f"{st['n']} Cable Car", "k": "attraction", "p": st["p"],
            "t": ("A station on the " + " and the ".join(on) + ".") if on
                 else "A cable car station.",
        })

    seen, out = set(), []
    for at in sources:
        name = at.get("n")
        kind = at.get("k")
        if not name or kind in SKIP:
            continue
        key = name.strip().lower()
        if key in seen:
            continue
        p = at.get("p")
        if not (isinstance(p, list) and len(p) == 2 and isinstance(p[0], (int, float))):
            continue
        cx, cy = p[0], p[1]
        # nearest approach point, PREFERRING one you can walk on
        best = None
        r = int(REACH // cell) + 1
        gx0, gy0 = int(cx // cell), int(cy // cell)
        for gx in range(gx0 - r, gx0 + r + 1):
            for gy in range(gy0 - r, gy0 + r + 1):
                for i in grid.get((gx, gy), ()):
                    (x, y, w) = approach[i]
                    dd = math.hypot(x - cx, y - cy)
                    if dd > REACH:
                        continue
                    # a walkable approach is worth 25m of extra distance
                    score = dd - (25.0 if w else 0.0)
                    if best is None or score < best[0]:
                        best = (score, dd, x, y, w)
        if best is None:
            continue
        _, dd, ex, ey, walkable = best
        vx, vy = cx - ex, cy - ey
        L = math.hypot(vx, vy) or 1
        seen.add(key)
        out.append({
            "n": name.strip(),
            "k": kind,
            "p": [round(ex, 1), round(ey, 1)],
            # unit vector from the entrance toward the attraction: the gate,
            # the board and the guide all face back down it
            "f": [round(vx / L, 3), round(vy / L, 3)],
            "d": round(dd, 1),
            # THE ATTRACTION'S OWN LINE WINS. Deciding what a thing IS belongs
            # to the data layer — the same argument that retagged the Taste
            # Garden rather than special-casing it in the renderer. Surf Cove
            # is the case: data/wavehouse.py writes a line about its two waves
            # and the substring table here was overwriting it with the older,
            # vaguer "Standing waves for surfing, on Siloso Beach."
            "t": (at.get("t") or "").strip() or line_for(name, kind),
            "w": 1 if walkable else 0,
        })
        r = ride_line(name)
        if r:
            out[-1]["r"] = r

    out.sort(key=lambda o: o["n"])
    d["entrances"] = out
    withline = sum(1 for o in out if o["t"])
    withride = sum(1 for o in out if o.get("r"))
    print(f"== entrances {a.id}")
    print(f"   {len(out)} attraction entrance(s); {withline} with a guide line, "
          f"{withride} with a how-to-ride line")
    for o in out[:12]:
        print(f"     {o['d']:5.0f} m  {'walk' if o['w'] else 'road'}  {o['n'][:34]:<34} "
              f"{o['t'][:44]}")
    if len(out) > 12:
        print(f"     ... {len(out) - 12} more")
    if a.dry_run:
        print("   dry run — nothing written")
        return
    json.dump(d, open(path, "w"), separators=(",", ":"))
    print(f"   written: {path}")


if __name__ == "__main__":
    main()
