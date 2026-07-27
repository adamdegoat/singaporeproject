#!/usr/bin/env python3
"""Buildings + roads only, straight at the mirror that is actually answering.
Enough to render; footpaths and OSM tree nodes are additive."""
import json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BBOX = "1.3000,103.8290,1.3070,103.8380"
EP = "https://overpass.private.coffee/api/interpreter"
Q = f"""[out:json][timeout:180];
(
  way["building"]({BBOX});
  way["highway"~"^(trunk|primary|secondary|tertiary|residential|service|unclassified|living_street|pedestrian)$"]({BBOX});
);
out geom;"""

req = urllib.request.Request(EP, data=Q.encode(), headers={"User-Agent": "orchard-lookdev/1.0"})
with urllib.request.urlopen(req, timeout=200) as r:
    data = json.loads(r.read().decode())
path = os.path.join(HERE, "raw.json")
json.dump(data, open(path, "w"))
print(f"{len(data['elements'])} elements -> raw.json ({os.path.getsize(path)/1024:.0f} KB)")
