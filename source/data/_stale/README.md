# Stale build artefacts, kept only so nothing is silently destroyed

`world5.*` are the merged world and per-district chunks from when this project
had FIVE districts. They were last written 2026-07-29 and are superseded by the
eight-district `world.*` files beside them.

They are not referenced by src/, by any tool in data/, by deploy.sh or by
index.html, and they are not copied into dist/ — verified 2026-07-31.

They were moved here because they are actively MISLEADING: a research agent
reading the repo found People's Park Complex at 25m in `world5.d.chinatown.json`
and flagged it as a live bug, when the live file had already been corrected to
its published 103m. A stale copy that looks authoritative costs more than the
disk it occupies.

Safe to delete. Everything here regenerates from:

    python3 data/merge.py world --stream <district ids...>
