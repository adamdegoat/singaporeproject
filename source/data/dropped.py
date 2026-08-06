"""WHAT THE MAP GIVES US THAT NEVER REACHES THE SCENE — by ELEMENT, not by tag.

data/unused.py answers "which TAGS on the elements we fetched does nothing
read". That is a real question and it passes. It has a blind spot big enough to
drive a resort through: it can only see elements that ARRIVED. Everything
dropped earlier — filtered by process.py, diverted into a layer nothing draws,
or never resolved from a relation — is invisible to it, because by the time it
looks, those elements are not there to have tags.

Every gap found by hand on 2026-08-06 fell through exactly that hole:

    Lookout Loop        4 named ways -> `bridges` as bare coordinate lists,
                        name and layer stripped, drawn by nothing
    Palate Playground   in `parkfurn` as k=playground, so the taste garden of
                        the Sensoryscape was given a swing frame and a slide
    Resorts World       a multipolygon RELATION; Overpass returns members with
                        no geometry and relgeom.py only resolves `building`
                        ones, so 49 hectares of resort read as unclassified
                        ground and grew a forest

The owner, 2026-08-06: "u keep saying u miss out all this data that have but
you never use... why you keep on not using the data available". He is right,
and finding these one at a time is not a method. This is the method.

WHAT IT DOES. Buckets every raw element by its primary tag, counts how many
carry usable geometry, and compares that against what the built scene holds.
It does NOT try to be clever about matching individual elements to individual
scene records — that is fragile and would need a rule per layer. It reports
COUNTS BY CLASS, which is enough to see a whole class sitting at zero.

Read it as a lead list, not a verdict. A class can be legitimately absent
(`tourism=hotel` is covered by the building layer). What matters is a class
with hundreds of source elements and nothing downstream, which is what every
one of the three above looks like.

Run:  python3 data/dropped.py sentosa
"""
import json
import os
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ID = sys.argv[1] if len(sys.argv) > 1 else "sentosa"

raw_path = os.path.join(HERE, "raw", f"{ID}.json")
if not os.path.exists(raw_path):
    sys.exit(f"no raw cache at {raw_path}")
raw = json.load(open(raw_path))
els = raw.get("elements") or raw
scene = json.load(open(os.path.join(HERE, f"{ID}.json")))

# the tags that decide what a thing IS, in the order OSM itself prefers
PRIMARY = ["building", "highway", "natural", "landuse", "leisure", "tourism",
           "amenity", "historic", "man_made", "barrier", "waterway", "railway",
           "aerialway", "attraction", "shop", "place", "power", "emergency"]


def primary_of(t):
    for k in PRIMARY:
        if k in t:
            return f"{k}={t[k]}"
    return None


src = Counter()
src_named = Counter()
src_rel_nogeom = Counter()
for e in els:
    t = e.get("tags") or {}
    if not t:
        continue
    p = primary_of(t)
    if not p:
        continue
    src[p] += 1
    if t.get("name"):
        src_named[p] += 1
    # a relation whose members carry no geometry cannot be built by anything
    # downstream, however well it is tagged — this is the RWS case
    if e.get("type") == "relation":
        ms = e.get("members") or []
        if ms and not any(m.get("geometry") for m in ms):
            src_rel_nogeom[p] += 1

# what the scene actually holds, by layer
scene_counts = {}
for k, v in scene.items():
    if isinstance(v, list):
        scene_counts[k] = len(v)

print(f"== dropped {ID}")
print(f"   raw elements with a primary tag: {sum(src.values())}")
print(f"   scene layers: " + ", ".join(f"{k}={v}" for k, v in sorted(scene_counts.items())
                                       if v))
print()
print("   RELATIONS WHOSE MEMBERS CARRY NO GEOMETRY (unbuildable as fetched):")
if src_rel_nogeom:
    for p, n in src_rel_nogeom.most_common():
        print(f"     {n:4d}  {p}")
else:
    print("     none")
print()
print("   SOURCE CLASSES BY SIZE — read against the layer counts above:")
for p, n in src.most_common(45):
    nm = src_named[p]
    print(f"     {n:5d}  {p:<38} {nm:4d} named")
