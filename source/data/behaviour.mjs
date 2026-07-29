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
// 60 km/h. Orchard Road is 50, and this is deliberately loose: the point is to
// catch a teleport, not to police the speed limit.
const VEH_MAX = 16.7;
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
await page.goto(`http://localhost:8933/index.html?dpr=1&nostream=1&scene=${process.env.SG_SCENE || 'orchard'}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { timeout: 90000 });

/* ---------- B1 and B2: sample the world moving ---------- */

const motion = await page.evaluate(async ([VISIBLE]) => {
  const vehicles = () => {
    const sc = window.__scene, T = window.__THREE, m = new T.Matrix4(), v = new T.Vector3();
    const out = { car: [], bus: [] };
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const g = o.geometry.parameters || {};
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
    return { t: performance.now(), px: st.x, pz: st.z, ped: window.__crowdPositions(), ...vehicles() };
  };
  const fr = [];
  for (let k = 0; k < 60; k++) { fr.push(snap()); await new Promise((r) => setTimeout(r, 150)); }

  const worst = { ped: 0, car: 0, bus: 0 };
  const over = { ped: 0, car: 0, bus: 0 };
  const seen = { ped: 0, car: 0, bus: 0 };
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
        if (v > worst[kind]) worst[kind] = v;
      }
    }
  }
  return { worst, seen, ex };
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
  const paths = window.__crowdPaths();
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
line('B2', 'fastest vehicle on screen', Math.max(motion.worst.car, motion.worst.bus), VEH_MAX, 'm/s',
  `${motion.seen.car + motion.seen.bus} samples within ${VISIBLE}m of the player`);
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
console.log(fails ? `   FAIL  ${fails} behaviour checks over budget` : '   PASS  5 behaviour checks');
process.exit(fails ? 1 : 0);
