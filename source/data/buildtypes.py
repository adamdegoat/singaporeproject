"""One fact about OSM building types, in one importable place.

This module exists because `from process import SELF_SCALED` DOES NOT WORK and
fails in the worst possible way. process.py has a module-level argv guard — it
is driven by build_district.py through env vars and refuses a district
argument — so importing it from a script that takes one exits the interpreter
before the import completes. data/heights.py did exactly that for one build:

    process.py takes no district argument (got ['sentosa']).

heights.py is `check=False` in the build chain, so the build printed that line
and carried on with exit 0, and the whole height CALIBRATION silently stopped
running. Every guessed height in the district reverted to its raw type default
— fifteen buildings at Fort Siloso alone went back up (14.4 m where the
calibration says 6.8, 10.8 where it says 3.4), and the golden frame there came
back 28.9% red with a concrete plate leaning across it.

A constant shared by three files does not belong in the largest file of the
three. It belongs here, where importing it cannot run anything.
"""

# BUILDING TYPES WHOSE OWN NAME IS A HEIGHT STATEMENT.
#
# A hut is single-storey because it is a hut; a grandstand is seating; a
# carport is one car tall. None of them can be banded off a footprint area the
# way a block of flats can, and process.py gives each an honest default rather
# than letting it fall through to `yes` = 20 m.
#
# `roof` is here for the banding rule and is DELIBERATELY NOT in city.js's own
# copy of this set. A canopy must not be sized by its footprint — that took the
# Universal forecourt canopy to 20.4 m and blotted out the sky over the globe —
# but it must still grow to clear the slope it stands on, because its height is
# a CLEARANCE, and a clearance the ground swallows is a slab through a
# hillside. The two rules want different lists and the difference is the reason
# they are written out separately in each place rather than shared blindly.
SELF_SCALED = ("roof", "hut", "grandstand", "shed", "kiosk", "carport")

# ...and the height each gets when nothing better is known. Metres.
TYPE_HEIGHT = {
    "roof": 5.0, "hut": 4.0, "grandstand": 8.0,
    "shed": 4.5, "kiosk": 3.5, "carport": 3.0,
}
