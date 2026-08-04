"""Compare golden/actual/*.png against golden/*.png.

Constants copied from three.js's own e2e harness (test/e2e/puppeteer.js):
a pixel counts as different past 0.1 per channel (of 1.0), and a frame FAILS
when more than 0.1% of its pixels differ. On failure the actual and a diff
mask sit in golden/actual/ and golden/diff/ — look at them, then either fix
the regression or re-bless deliberately.
"""
import os, sys
import numpy as np
from PIL import Image

PIX_T = 0.1          # per-channel threshold, of 1.0
FRAME_T = 0.001      # fraction of pixels allowed to differ

def main():
    gold = sys.argv[1]
    act = os.path.join(gold, "actual")
    diffdir = os.path.join(gold, "diff")
    os.makedirs(diffdir, exist_ok=True)
    failed = []
    names = sorted(f for f in os.listdir(gold) if f.endswith(".png"))
    for f in names:
        ap = os.path.join(act, f)
        if not os.path.exists(ap):
            failed.append((f, "no actual shot"))
            continue
        g = np.asarray(Image.open(os.path.join(gold, f)).convert("RGB"), dtype=np.float32) / 255
        a = np.asarray(Image.open(ap).convert("RGB"), dtype=np.float32) / 255
        if g.shape != a.shape:
            failed.append((f, f"size {a.shape[:2]} vs baseline {g.shape[:2]}"))
            continue
        d = (np.abs(g - a) > PIX_T).any(axis=2)
        frac = float(d.mean())
        if frac > FRAME_T:
            Image.fromarray((d * 255).astype("uint8")).save(os.path.join(diffdir, f))
            failed.append((f, f"{frac*100:.2f}% of pixels differ"))
        else:
            print(f"   ok   {f} ({frac*100:.3f}%)")
    if failed:
        for f, why in failed:
            print(f"   FAIL {f}: {why}")
        print(f"   {len(failed)} of {len(names)} golden frames changed — "
              f"diffs in golden/diff/, re-bless only if the change is intended")
        sys.exit(1)
    print(f"   PASS  all {len(names)} golden frames match")

if __name__ == "__main__":
    main()
