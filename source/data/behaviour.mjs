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
await page.goto('http://localhost:8933/index.html?dpr=1', { waitUntil: 'load' });
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
console.log(fails ? `   FAIL  ${fails} behaviour checks over budget` : '   PASS  3 behaviour checks');
process.exit(fails ? 1 : 0);
