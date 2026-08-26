// Coordinate-descent pose solver over the headless rig.
//   knobs   [name, ax, ay, az, lo, hi]      applied in order, each qrot()
//   cost(r) -> number                        read world positions, return error
export function solve(buildRig, knobs, cost, opts = {}) {
  const r = buildRig();
  const apply = (v, extra) => {
    r.reset();
    if (extra) extra(r);
    knobs.forEach((k, i) => r.qrot(k[0], k[1], k[2], k[3], v[i]));
    if (opts.after) opts.after(r, v);
    return cost(r, v);
  };
  let v = knobs.map((k) => (k[6] !== undefined ? k[6] : 0));
  let best = apply(v, opts.pre);
  let step = opts.step || 0.35;
  for (let pass = 0; pass < (opts.passes || 60); pass++) {
    let improved = false;
    for (let i = 0; i < knobs.length; i++) {
      for (const d of [step, -step]) {
        const nv = v.slice();
        nv[i] = Math.max(knobs[i][4], Math.min(knobs[i][5], v[i] + d));
        if (nv[i] === v[i]) continue;
        const c = apply(nv, opts.pre);
        if (c < best - 1e-9) { best = c; v = nv; improved = true; }
      }
    }
    if (!improved) { step *= 0.5; if (step < 1e-4) break; }
  }
  return { v, cost: best, rig: r, apply: (vv) => apply(vv || v, opts.pre) };
}
