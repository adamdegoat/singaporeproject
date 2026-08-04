"""The audit results ledger: one JSON line per deploy, deltas printed aloud.

Twenty-nine checks were retired to report-only on 2026-08-03 with the promise
that "regressions stay visible" — but they printed into a scrolling terminal
with nothing to compare against, so the promise was not operationally true
(the workflow audit's finding #1). This makes it true: deploy.sh tees the
check output into a file, this parses the numbers that matter, appends them
to audits.jsonl, and prints the DELTA against the previous deploy. A number
that moves the wrong way is now one line of red in every deploy, forever.

Usage: python3 data/ledger.py <checks-log> <stamp>
Never fails the deploy itself — the ledger is a witness, not a judge; the
gates that block are the gates that block.
"""
import json, os, re, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "..", "audits.jsonl")


def grab(text, pattern, cast=float):
    m = re.search(pattern, text)
    return cast(m.group(1)) if m else None


def main():
    log = sys.argv[1]
    stamp = sys.argv[2] if len(sys.argv) > 2 else "?"
    text = open(log, errors="replace").read() if os.path.exists(log) else ""
    row = {
        "stamp": stamp,
        "at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "n1_pct": grab(text, r"N1 unreachable\s+([\d.]+)%"),
        "n2": grab(text, r"N2 ends in mid-air (\d+)", int),
        "n3_spikes": grab(text, r"N3 surface spikes: (\d+)", int),
        "blocked_3_20": grab(text, r"3-20m: (\d+)", int),
        "walkarounds": grab(text, r"under 3m \(walk around\): (\d+)", int),
        "pockets": grab(text, r"(\d+) pocket\(s\) of land walled in", int),
        "boot_ms": grab(text, r"\"bootMs\":(\d+)", int),
        "heap_mb": grab(text, r"\"heapMB\":(\d+)", int),
        "tris_k": grab(text, r"\"trisK\":(\d+)", int),
        "draws": grab(text, r"\"draws\":(\d+)", int),
    }
    prev = None
    if os.path.exists(LEDGER):
        lines = [l for l in open(LEDGER) if l.strip()]
        if lines:
            prev = json.loads(lines[-1])
    with open(LEDGER, "a") as f:
        f.write(json.dumps(row, separators=(",", ":")) + "\n")
    print(f"   ledger: {os.path.basename(LEDGER)} +1 (stamp {stamp})")
    if prev:
        moved = []
        for k, v in row.items():
            if k in ("stamp", "at") or v is None or prev.get(k) is None:
                continue
            d = v - prev[k]
            if abs(d) > (0.05 if k == "n1_pct" else 0):
                moved.append(f"{k} {prev[k]} -> {v} ({'+' if d > 0 else ''}{round(d, 2)})")
        if moved:
            print("   since " + str(prev.get("stamp")) + ":")
            for m in moved:
                print("     " + m)
        else:
            print(f"   no movement since {prev.get('stamp')}")


if __name__ == "__main__":
    main()
