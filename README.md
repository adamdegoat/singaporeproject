# Singapore Project — Orchard Road

Ride a scooter down Orchard Road in the browser. No install, works on a phone in
landscape.

The street is built from real OpenStreetMap geometry: 241 building footprints
extruded in place, the road network as tagged, and Orchard Road itself stitched
from the 28 fragments OSM splits it into, into one 1,192m centreline. Landmark
heights are hand-corrected where the OSM tags are wrong.

Nothing is downloaded at runtime beyond the code and a 120KB geometry file —
every texture is drawn into a canvas at load, and every sound is synthesised
with Web Audio. The engine note is an oscillator whose frequency tracks your
actual speed, so it never crossfades between clips.

**Riding (landscape):** hold the left side for throttle, hold the lower left to
brake, keep holding the brake once stopped to reverse, drag the right side to
steer. Keyboard: W, S, A/D.

**On foot:** tap *Get off* (or press E) to dismount. Then drag the left side to
walk and the right side to look around. Keyboard: WASD, shift to run.

## Source

`source/` holds the modules, the data pipeline (`source/data/process.py`) and
the ride-model tests (`node source/test/ride.test.mjs`).

Local dev: `cd source && node server.cjs` then open `localhost:8933`.

Building data is © OpenStreetMap contributors (ODbL). Architecture is
approximated for silhouette; no brand marks are reproduced.
