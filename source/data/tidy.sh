#!/bin/bash
# THIS IS A SHIM. The real tidy is ../tidy.sh; run either name.
#
# There were two tidy scripts and this was the OLD, DANGEROUS one. It had no
# deploy guard and a blanket `pkill -f -- "--user-data-dir=/private/tmp"`, which
# matches EVERY headless browser this project launches — including the one a
# running deploy owns, and including a probe's own browser mid-measurement. It
# has killed a deploy's gate once (2026-08-04) and an A/B server run of mine
# (2026-08-20). The root tidy.sh already refuses to run while a deploy is in
# flight and kills only what this project started; its wait-loop reaper was
# carried over from here, so nothing is lost.
#
# The path stays because WORKFLOW.md, NEXT.md and data/gates.sh all name it.
exec bash "$(dirname "$0")/../tidy.sh" "$@"
