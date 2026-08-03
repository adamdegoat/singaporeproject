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
    ("sensoryscape", "A planted walk linking the beaches to Resorts World."),
    ("aj hackett", "Bungee, giant swing and a skybridge over Siloso."),
    ("battlestar", "Duelling coasters, 42.5m at the top."),
    ("transformers", "A 3D dark ride."),
    ("jurassic park rapids", "A river raft ride. You will get wet."),
    ("enchanted airways", "A junior coaster."),
    ("canopy flyer", "A suspended coaster over the lost world."),
    ("revenge of the mummy", "An indoor coaster in the dark."),
    ("puss in boots", "A family coaster over the roofs."),
    ("crate adventure", "A boat ride through Madagascar."),
    ("wave house", "Standing waves for surfing, on Siloso Beach."),
    ("tanjong beach", "The quiet beach. The furthest one east."),
    ("palawan beach", "The family beach, with the suspension bridge."),
    ("siloso beach", "The busy beach: bars, volleyball and the beach walk."),
    ("cable car", "Two lines: across to HarbourFront, and along the island."),
    ("skyride", "The chairlift back up to the luge start."),
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

    seen, out = set(), []
    for at in (d.get("attractions") or []):
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
            "t": line_for(name, kind),
            "w": 1 if walkable else 0,
        })

    out.sort(key=lambda o: o["n"])
    d["entrances"] = out
    withline = sum(1 for o in out if o["t"])
    print(f"== entrances {a.id}")
    print(f"   {len(out)} attraction entrance(s); {withline} with a guide line")
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
