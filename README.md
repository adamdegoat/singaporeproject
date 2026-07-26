# Singapore Project — Orchard Road

Ride a scooter down Orchard Road in the browser. No install, works on a phone in
landscape.

The street is built from real OpenStreetMap geometry: 241 building footprints
extruded in place, the road network as tagged, and Orchard Road itself stitched
from the 28 fragments OSM splits it into, into one 1,192m centreline. Landmark
heights are hand-corrected where the OSM tags are wrong.

Nothing is downloaded at runtime beyond the code and a 120KB geometry file —
every texture is drawn into a canvas at load.

**Controls (landscape):** drag the left side to steer, hold the right side for
throttle, hold the lower right to brake. Keyboard: A/D, W, S.

## Source

`source/` holds the modules, the data pipeline (`source/data/process.py`) and
the ride-model tests (`node source/test/ride.test.mjs`).

Local dev: `cd source && node server.cjs` then open `localhost:8933`.

Building data is © OpenStreetMap contributors (ODbL). Architecture is
approximated for silhouette; no brand marks are reproduced.
