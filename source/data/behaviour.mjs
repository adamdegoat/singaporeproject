#!/usr/bin/env node
// Behaviour gate: does anything in the world move in a way it could not?
//
//     node data/behaviour.mjs
//
// The 31 checks in audit_world.js are a SNAPSHOT. They can prove nothing is
// standing in the road and that every street has kerbs, and they cannot see a
// single thing about motion, because motion does not exist in one frame. The
// whole category was missing, and it took the user riding the street and saying
// the pedestrians were "crossing the road but zooming fast" to find it.
//
// What that turned out to be was not the crossing code. Everything that travels
// a street is drawn at a lateral offset from the centreline, and the tangent was
// taken from whichever polyline segment the arclength happened to land on, so it
// flipped direction the instant the arclength crossed a vertex. A pedestrian 17m
// out on the pavement passing a 37-degree bend was thrown 11 metres sideways
// between two frames: 75 m/s, while their arclength moved 24 centimetres. The
// same pop was hitting every vehicle in the outer lanes.
//
// Named checks, each with a budget:
//
//   B1  pedestrian ground speed          nobody walks faster than a sprint
//   B2  vehicle ground speed             on screen; a recycle off screen is fine
//   B3  path frame continuity            walking a path must not jump
//
// B3 is the structural one. B1 and B2 measure symptoms and will go green again
// the moment someone reintroduces the cause somewhere new; B3 measures the
// cause, by walking every path end to end at a lateral offset and asserting
// that a tenth of a metre of arclength never moves a walker more than half a
// metre. It catches the defect without needing an actor to be standing on it.
//
// Needs the dev server on :8933 and Playwright's chromium.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

// A brisk walk is 1.6 m/s and a run is about 5. Anything over 3 is not a
// pedestrian on a shopping street.
const PED_MAX = 3.0;
// RAISED 16.7 -> 25 m/s ON 2026-08-01, WITH THE MEASUREMENT THAT JUSTIFIES IT.
// This is a budget going the wrong way, so it carries its reasons in full.
//
// 16.7 was 60 km/h, chosen as "deliberately loose: catch a teleport, not police
// the speed limit". It was not loose. It was 1.02x the world's honest worst, and
// it flapped: five consecutive runs measured 15.33, 16.15, 16.06, 15.67, 16.42,
// and a deploy died on the sixth. A gate that fails one run in six on unchanged
// code teaches everyone to re-run it, which is worse than not having it.
//
// What the world actually does, measured over 40 frames on `world` (the probe
// took each car's PEAK speed, so a car braking at a light does not count):
//
//     n=21 cars   min 0.01   p50 9.63   p90 13.96   max 15.22   over 12.05: 5
//
// Cars are built with `base = rand(7, 12)` (actors.js), and `want` never
// exceeds `base` -- the speed rule only ever brakes. So:
//
//   * p50 9.63 against a configured median of 9.5 says THE CLOCK IS RIGHT.
//     A wrong dt would scale every car, and the median is the one that would
//     have moved. This is not the half-speed-clock family of bug.
//   * a quarter of cars peak 1.15-1.27x above their own base, bounded, never
//     wilder. That is the outside of a bend covering more ground than the
//     centreline -- the same effect B3's comment already accepts as legitimate
//     -- amplifying by 1 + offset/radius. On five-lane Orchard Road the outer
//     lane sits ~8m out, so a 30-50m radius bend gives exactly 1.16-1.27x.
//     A real car in a real outside lane does the same thing.
//
// So the tail is geometry, not a defect, and this check has exactly one job:
// catch a vehicle that MOVED WITHOUT DRIVING. A recycle jumps up to 260m in one
// frame, which is about 1,700 m/s. 25 m/s (90 km/h) sits 1.5x above anything
// the geometry can produce from a 12 m/s car and 68x below a teleport. There is
// no defect that lives in the gap.
//
// Also fixed the same day, and it WAS a real defect this check could have been
// pointing at: vehicles recycled at 190m from the player while this gate (and a
// rider) could see out to 200m. See the note at the recycle in actors.js.
const VEH_MAX = 25;
// A visible vehicle is one within the distance the player can see along the
// street. Beyond that a recycle is a different car arriving, not a teleport.
const VISIBLE = 200;
// Half a metre of movement for a tenth of a metre of arclength. The outside of
// a bend legitimately covers more ground than the centreline does; a frame
// discontinuity covers metres.
const JUMP_MAX = 0.5;

const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/index.html?dpr=1&nostream=1&scene=${process.env.SG_SCENE || 'orchard'}`, { waitUntil: 'load' });
// HOW LONG TO ALLOW FOR BOOT. `?nostream` builds all eight districts inline
// in one go, which is the heaviest thing this project ever asks a browser to
// do: measured 115s and 140s on two consecutive clean runs, 2026-07-31. The
// old 90s was under that and the gate began failing on the build itself
// rather than on anything it checks. This limit is a "did it hang" guard, not
// a performance budget -- the performance budgets live in fps.mjs.
const BOOT_MS = 300000;
await page.waitForFunction('window.__ready === true', null, { timeout: BOOT_MS });

/* ---------- B1 and B2: sample the world moving ---------- */

const motion = await page.evaluate(async ([VISIBLE]) => {
  const vehicles = () => {
    const sc = window.__scene, T = window.__THREE, m = new T.Matrix4(), v = new T.Vector3();
    const out = { car: [], bus: [] };
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const g = o.geometry.parameters || {};
      // The car's MAIN BODY, matched on its plan only — the height changed from
      // 0.62 to 0.54 when the car was remodelled on 2026-07-31 and a
      // three-parameter match would have silently found no cars at all.
      const isCar = Math.abs((g.width || 0) - 1.78) < 0.01 && Math.abs((g.depth || 0) - 4.32) < 0.01;
      const isBus = Math.abs((g.width || 0) - 2.5) < 0.01 && Math.abs((g.depth || 0) - 11.8) < 0.01;
      if (!isCar && !isBus) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m); v.setFromMatrixPosition(m);
        (isCar ? out.car : out.bus).push([v.x, v.z]);
      }
    });
    return out;
  };
  const snap = () => {
    const st = window.__state ? window.__state() : { x: 0, z: 0 };
    // `__crowdPositions` only exists when the crowd was built, and this world
    // has had no pedestrians since 2026-07-31. An empty list keeps every
    // vehicle check running; the pedestrian checks below see nothing and say
    // so rather than crashing the whole gate on a missing function.
    const ped = window.__crowdPositions ? window.__crowdPositions() : [];
    return { t: performance.now(), px: st.x, pz: st.z, ped, ...vehicles() };
  };
  const fr = [];
  for (let k = 0; k < 60; k++) { fr.push(snap()); await new Promise((r) => setTimeout(r, 150)); }

  const worst = { ped: 0, car: 0, bus: 0 };
  const over = { ped: 0, car: 0, bus: 0 };
  const seen = { ped: 0, car: 0, bus: 0 };
  const where = { ped: null, car: null, bus: null };
  const ex = [];
  for (let f = 1; f < fr.length; f++) {
    const dt = (fr[f].t - fr[f - 1].t) / 1000;
    for (const kind of ['ped', 'car', 'bus']) {
      const A = fr[f - 1][kind], B = fr[f][kind];
      for (let i = 0; i < A.length; i++) {
        // Vehicles are only judged where the player could see them: recycling a
        // car from the far end of a one-way street back to the near end is
        // intended, and is done deliberately out of view.
        if (kind !== 'ped') {
          const d = Math.hypot(A[i][0] - fr[f - 1].px, A[i][1] - fr[f - 1].pz);
          if (d > VISIBLE) continue;
        }
        const v = Math.hypot(B[i][0] - A[i][0], B[i][1] - A[i][1]) / dt;
        seen[kind]++;
        if (v > worst[kind]) {
          worst[kind] = v;
          // WHERE, not just how fast. A bare number cannot be diagnosed: 16 m/s
          // is a car on the outside of a tight bend (the rendered position is
          // the centreline plus a lane offset, and on a bend that offset covers
          // more ground than the centreline does), while 1,700 m/s is a recycle
          // that happened on screen. Both fail the same check with the same
          // word. This records the sample so the next failure names its own
          // cause instead of costing a session.
          where[kind] = { from: A[i], to: B[i], dt,
            distFromPlayer: Math.hypot(A[i][0] - fr[f - 1].px, A[i][1] - fr[f - 1].pz) };
        }
      }
    }
  }
  return { worst, seen, ex, where };
}, [VISIBLE]);

/* ---------- B4 and B5: the two the user found by riding ---------- */
//
// Both existed for the whole project and all 34 checks were green. Neither was
// found by a check; both were found by a person looking out of the window.
// That is the argument for writing the check the moment a defect is understood,
// not the argument for looking harder next time.
const rider = await page.evaluate(() => {
  const T = window.__THREE, sc = window.__scene;

  // B4: every wheel against the ground UNDER THAT WHEEL. They were all placed
  // at the ground under the middle of the vehicle, and a bus wheel is 3.6m from
  // the middle, so on Orchard Road's grades the downhill ones were buried.
  const m = new T.Matrix4(), v = new T.Vector3();
  let worstWheel = 0, wheels = 0;
  sc.traverse((o) => {
    if (!o.isInstancedMesh || o.geometry.type !== 'CylinderGeometry') return;
    const r = o.geometry.parameters.radiusTop;
    if (Math.abs(r - 0.31) > 0.01 && Math.abs(r - 0.48) > 0.01) return;
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m); v.setFromMatrixPosition(m);
      if (v.y < -900) continue;
      wheels++;
      const off = Math.abs(v.y - (window.__surfaceAt(v.x, v.z) + r));
      if (off > worstWheel) worstWheel = off;
    }
  });

  // B5: every mapped building must be solid. The interior point is SCANNED, not
  // taken as the average of the corners, which for an L-shaped plan lands
  // outside the building and quietly tests nothing.
  const inPoly = (poly, x, z) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
      if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
    }
    return hit;
  };
  let tested = 0, porous = 0; const ex = [];
  for (const bl of window.__data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const q of bl.p) {
      if (q[0] < mnx) mnx = q[0]; if (q[0] > mxx) mxx = q[0];
      if (q[1] < mnz) mnz = q[1]; if (q[1] > mxz) mxz = q[1];
    }
    let px = null, pz = null;
    for (let a2 = 1; a2 < 8 && px === null; a2++) for (let c2 = 1; c2 < 8; c2++) {
      const x = mnx + (mxx - mnx) * a2 / 8, z = mnz + (mnz === mxz ? 0 : (mxz - mnz) * c2 / 8);
      if (inPoly(bl.p, x, z)) { px = x; pz = z; break; }
    }
    if (px === null) continue;
    tested++;
    if (!window.__blocked(px, pz)) {
      porous++;
      if (ex.length < 5) ex.push(bl.n || `(unnamed) at ${px | 0},${pz | 0}`);
    }
  }
  return { wheels, worstWheel, tested, porous, ex };
});

/* ---------- B3: walk every path, look for discontinuities ---------- */

const frames = await page.evaluate(([JUMP_MAX]) => {
  // Same reason as the crowd positions above: no crowd, no crowd paths. B3
  // asks whether a walker could step off a pavement edge into geometry, and
  // with no walkers there is nothing to ask. It reports zero over zero rather
  // than throwing, and the check stays live for `?people`.
  const paths = window.__crowdPaths ? window.__crowdPaths() : [];
  const bad = [];
  let worst = 0, worstAt = null;
  for (const pt of paths) {
    const off = pt.half + 3.0;         // a pedestrian on the pavement edge
    const P = (s) => {
      const o = window.__pathAt(pt.i, s);
      return [o[0] + -o[3] * off, o[1] + o[2] * off];
    };
    let prev = P(0);
    for (let s = 0.1; s <= pt.len - 0.05; s += 0.1) {
      const c = P(s);
      const d = Math.hypot(c[0] - prev[0], c[1] - prev[1]);
      if (d > worst) { worst = d; worstAt = { path: pt.i, len: pt.len, s: +s.toFixed(1), d: +d.toFixed(2) }; }
      if (d > JUMP_MAX) { bad.push({ path: pt.i, s: +s.toFixed(1), d: +d.toFixed(2) }); break; }
      prev = c;
    }
  }
  return { paths: paths.length, bad, worst: +worst.toFixed(2), worstAt };
}, [JUMP_MAX]);

/* ---------- B6: a person must stay in one piece ----------
 *
 * The crowd had no named defect class, which is why on 2026-07-30 it was
 * shipping with the legs detached from the body in an X, the shoes lying flat
 * on the pavement 15cm below the leg that owned them, and a stride that jumped
 * twelve radians a frame — through 42 green checks and five green behaviour
 * checks. Every existing check either walks a STILL scene (the audit) or asks
 * about speeds and paths (B1-B3): nothing asked whether the figure doing the
 * walking still holds together.
 *
 * You cannot find a defect class you have not named, so it is named here. The
 * test is mechanical and needs no eye: walk the crowd for a few dozen frames
 * and measure, per walker, the worst GAP between parts that are supposed to
 * touch — hip to leg-top, leg-bottom to shoe-top, shoulder to arm-top,
 * arm-bottom to hand. A joint that opens is a joint that opens, at rest or at
 * full stride.
 */
const figure = await page.evaluate(async () => {
  const T = window.__THREE;
  const byRole = {};
  window.__scene.traverse((o) => {
    if (!o.isInstancedMesh || !o.userData.crowdPart) return;
    const g = o.geometry, pm = g.parameters || {};
    const key = g.type + '(' + [pm.radius, pm.height, pm.width, pm.depth]
      .filter((v) => v !== undefined).map((v) => +(+v).toFixed(3)).join(',') + ')';
    (byRole[key] = byRole[key] || []).push(o);
  });
  // Identify parts by SIZE ORDER rather than by exact numbers, so this check
  // does not become the next signature allowlist: of the crowd's capsules the
  // longest pair are the legs, the next the arms; the boxes 0.25 deep are the
  // shoes. Anything unmatched is skipped rather than guessed at.
  // ONE CROWD AT A TIME. Every streamed district builds its OWN crowd, so the
  // scene holds seven sets of these meshes; collecting legs from the whole
  // scene took district A's legs and district B's shoes, and instance i in two
  // different crowds is two different people standing streets apart. Group by
  // the parent the crowd was added to, then test each crowd on its own.
  const crowds = new Map();
  window.__scene.traverse((o) => {
    if (!o.isInstancedMesh || !o.userData.crowdPart) return;
    const key = o.parent ? o.parent.uuid : 'root';
    let c = crowds.get(key);
    if (!c) { c = { caps: [], boxes: [] }; crowds.set(key, c); }
    const g = o.geometry, pm = g.parameters || {};
    if (g.type === 'CapsuleGeometry') c.caps.push({ o, len: pm.height + 2 * pm.radius });
    if (g.type === 'BoxGeometry' && Math.abs(pm.depth - 0.25) < 0.02) c.boxes.push({ o });
  });
  const sets = [];
  for (const c of crowds.values()) {
    c.caps.sort((a, b) => b.len - a.len);
    const lg = c.caps.filter((v) => v.len > 0.6).slice(0, 2);
    if (lg.length === 2 && c.boxes.length >= 2) sets.push({ legs: lg, boxes: c.boxes });
  }
  if (!sets.length) return { skipped: true };
  const m = new T.Matrix4(), p = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3();
  const down = new T.Vector3(0, -1, 0);
  let worst = 0, worstAt = null, samples = 0;
  for (let f = 0; f < 40; f++) {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    for (const set of sets) {
    const legs = set.legs, boxes = set.boxes;
    const n = Math.min(legs[0].o.count, boxes[0].o.count, 40);
    // DO NOT PAIR LEFT WITH LEFT BY ARRAY ORDER. Which InstancedMesh comes
    // first in a traversal is not a fact about which leg it is — consolidate
    // reorders the graph — and pairing legL to shoeR reads the full width of a
    // stride as a detached foot. Same class as identifying body parts by their
    // instance count, which once reported a railing post as 57 detached
    // walkers. So: measure each leg's end against the NEAREST shoe on that
    // same walker, whichever mesh it lives in. A foot is a foot.
    const shoePos = [new T.Vector3(), new T.Vector3()];
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 2; k++) {
        boxes[k].o.getMatrixAt(i, m); m.decompose(p, q, s);
        shoePos[k].copy(p);
      }
      const shoeHalf = 0.05 * s.y;
      for (let side = 0; side < 2; side++) {
        legs[side].o.getMatrixAt(i, m); m.decompose(p, q, s);
        const half = legs[side].len * 0.5 * s.y;
        const end = down.clone().applyQuaternion(q).multiplyScalar(half).add(p);
        const gap = Math.min(end.distanceTo(shoePos[0]), end.distanceTo(shoePos[1])) - shoeHalf;
        samples++;
        if (gap > worst) { worst = gap; worstAt = { i, side, f }; }
      }
    }
    }
  }
  return { worst: +worst.toFixed(3), worstAt, samples, crowds: sets.length };
});

await browser.close();

/* ---------- report ---------- */

let fails = 0;

const line = (id, name, value, budget, unit, detail) => {
  const ok = value <= budget;
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'} ${id.padEnd(4)} ${String(value.toFixed(2)).padStart(7)}/${String(budget).padStart(6)} ${unit.padEnd(5)} ${name}`);
  if (detail) console.log(`        ${detail}`);
};

console.log('== behaviour audit');
line('B1', 'fastest pedestrian', motion.worst.ped, PED_MAX, 'm/s',
  `${motion.seen.ped} samples`);
const wv = motion.worst.car >= motion.worst.bus ? motion.where.car : motion.where.bus;
line('B2', 'fastest vehicle on screen', Math.max(motion.worst.car, motion.worst.bus), VEH_MAX, 'm/s',
  `${motion.seen.car + motion.seen.bus} samples within ${VISIBLE}m of the player`
  + (wv ? `\n        worst: ${wv.from.map((n) => n.toFixed(0)).join(',')} -> `
        + `${wv.to.map((n) => n.toFixed(0)).join(',')} in ${(wv.dt * 1000).toFixed(0)}ms, `
        + `${wv.distFromPlayer.toFixed(0)}m from the player` : ''));
line('B3', 'path frame continuity', frames.bad.length, 0, 'paths',
  `${frames.paths} paths walked; worst step ${frames.worst}m at path ${frames.worstAt && frames.worstAt.path}, s=${frames.worstAt && frames.worstAt.s}`);
if (frames.bad.length) {
  for (const b of frames.bad.slice(0, 6)) console.log(`        path ${b.path} jumps ${b.d}m at s=${b.s}`);
}
line('B4', 'wheel off the ground under it', rider.worstWheel, 0.05, 'm',
  `${rider.wheels} wheel samples`);
line('B5', 'mapped buildings you can walk into', rider.porous, 0, 'blds',
  `${rider.tested} buildings tested at a scanned interior point`
  + (rider.ex.length ? `; ${rider.ex.join(', ')}` : ''));
// REPORTED, NOT GATED — and deliberately so until its geometry is verified.
//
// The class is real: on 2026-07-30 the crowd shipped with the shoes 0.147m
// below the leg that owned them STANDING STILL, and nothing in this file or
// the audit could see it, because everything here measures speeds and paths
// and the audit walks a still scene. Naming the class is worth doing on its
// own — you cannot find a defect class you have not named.
//
// But the number is not trusted yet. Per-instance coherence was verified
// separately (head->hips 0.01m, head->shoe 0.22-0.27m across every walker
// sampled, so instance i IS the same person in every mesh), and hand-deriving
// the expected leg-end-to-shoe distance gives 0.036m, which is what walker 20
// measures — yet other walkers in the same frame measure 0.24m with their
// legs' far ends separated by only the hip width while their shoes carry the
// full stride. Either the check's reconstruction of the capsule's far end
// disagrees with how `put` composes the matrix (the horizontal offset is NOT
// scaled by the walker's size while the vertical IS, which the check does not
// model), or there is a real intermittent defect. Until that is settled a
// budget here would either be a number picked to pass, or a gate that always
// fails and therefore gets ignored — the project already has that rule.
//
// NEXT STEP: rebuild the expected end from the SAME expression `hang` uses
// rather than from the decomposed quaternion, and see whether the disagreement
// survives. If it does, it is a real bug and this becomes a ratchet.
if (figure.skipped) {
  console.log('    -  B6      -       -   m     figure joints (crowd parts not found)');
} else {
  console.log(`    -  B6    ${String(figure.worst.toFixed(2)).padStart(7)}/     - m     `
    + `widest joint gap on a walker (UNVERIFIED, see note)`);
  console.log(`        ${figure.samples} joint samples over 40 frames`
    + (figure.worstAt ? `; worst on walker ${figure.worstAt.i}, frame ${figure.worstAt.f}` : ''));
}
console.log(fails ? `   FAIL  ${fails} behaviour checks over budget` : '   PASS  5 behaviour checks, 1 reported');
process.exit(fails ? 1 : 0);
