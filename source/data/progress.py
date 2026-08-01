#!/usr/bin/env python3
"""How finished is each district?  python3 data/progress.py

There is no single true "percent done", so this does not invent one and hide
the parts. It scores five things that between them decide whether a district
reads as the real place, weights them by how much a RIDER notices, and prints
the components beside the total so any number can be challenged.

The weights say what this project believes: what you see from the street
matters more than what is behind it. The frontage measures are worth 60% of the
score between them and cover the handful of buildings on the main axis; the
whole-district measures are worth 40% and cover the other few thousand.
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def recipe_patterns():
    src = open(os.path.join(os.path.dirname(HERE), "src", "landmarks.js")).read()
    pats = []
    for m in re.finditer(r"^\s*\[/(.+?)/([a-z]*),\s*(\w+)", src, re.M):
        try:
            pats.append(re.compile(m.group(1), re.I if "i" in m.group(2) else 0))
        except re.error:
            pass
    return pats


def score(did, pats):
    d = json.load(open(os.path.join(HERE, f"{did}.json")))
    B = [b for b in d["buildings"] if len(b.get("p") or []) >= 3]
    ax = (d.get("axis") or {}).get("p") or []

    def dax(x, z):
        best = 1e9
        for i in range(len(ax) - 1):
            (x1, z1), (x2, z2) = ax[i], ax[i + 1]
            dx, dz = x2 - x1, z2 - z1
            L = dx * dx + dz * dz
            t = 0 if L == 0 else max(0, min(1, ((x - x1) * dx + (z - z1) * dz) / L))
            best = min(best, math.hypot(x - (x1 + dx * t), z - (z1 + dz * t)))
        return best

    front = []
    for b in B:
        p = b["p"]
        cx = sum(q[0] for q in p) / len(p)
        cz = sum(q[1] for q in p) / len(p)
        if dax(cx, cz) <= 45:
            front.append(b)

    def pct(n, d_):
        return 100.0 * n / d_ if d_ else 100.0

    named = [b for b in B if b.get("n")]
    parts = {
        # what a rider sees, 60%.  A height derived from a storey count
        # (hs == "levels") is real information but is not a measurement, so it
        # scores half. Full credit only for a surveyed metre figure.
        "frontage height": (pct(sum(1.0 if b.get("hs") in ("osm", "named")
                                    else 0.5 if b.get("hs") == "levels" else 0.0
                                    for b in front), len(front)), 0.20),
        "frontage named": (pct(sum(1 for b in front if b.get("n")), len(front)), 0.15),
        "frontage era/mat": (pct(sum(1.0 if (b.get("yr") or b.get("mat")) else 0.7 if b.get("era")
                                    else 0.0 for b in front), len(front)), 0.15),
        "frontage recipe": (pct(sum(1 for b in front if b.get("n")
                                    and any(p.search(b["n"]) for p in pats)), len(front)), 0.10),
        # the rest of the district, 40%
        "all heights": (pct(sum(1.0 if b.get("hs") in ("osm", "named")
                                else 0.5 if b.get("hs") == "levels" else 0.0
                                for b in B), len(B)), 0.20),
        "named recipe": (pct(sum(1 for b in named if any(p.search(b["n"]) for p in pats)),
                             len(named)), 0.20),
    }
    total = sum(v * w for v, w in parts.values())
    return total, parts, len(B), len(front)


def main():
    pats = recipe_patterns()
    ids = [x["id"] for x in json.load(open(os.path.join(HERE, "districts.json")))["districts"]
           if (x.get("status") or "") not in ("planned",) and "merged" not in (x.get("status") or "")]
    print(f"  {'district':<13} {'done':>6}   " + "  ".join(f"{k:>16}" for k in
          ("frontage height", "frontage named", "frontage era/mat", "frontage recipe",
           "all heights", "named recipe")))
    tot = 0.0
    for did in ids:
        t, parts, nb, nf = score(did, pats)
        tot += t
        cells = "  ".join(f"{parts[k][0]:15.0f}%" for k in
                          ("frontage height", "frontage named", "frontage era/mat",
                           "frontage recipe", "all heights", "named recipe"))
        print(f"  {did:<13} {t:5.0f}%   {cells}    ({nb} buildings, {nf} on the axis)")
    # COUNTED, NOT TYPED. This said "ALL EIGHT" as a literal string and went
    # stale the moment kallang made it nine -- the maths was always right,
    # only the label lied. Same one-list-written-twice trap that left four
    # districts with no deploy gate for a week; deploy.sh and gates.sh both
    # read the registry for exactly this reason.
    print(f"\n  ALL {len(ids)} DISTRICTS: {tot/len(ids):.0f}% by this measure.")
    print("  Weights: frontage 60% (height 20, named 15, era/material 15, recipe 10),")
    print("           whole district 40% (heights 20, named-with-recipe 20).")


main()
