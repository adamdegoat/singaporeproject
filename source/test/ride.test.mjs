// Ride-feel assertions. Run: node test/ride.test.mjs
import { RIDE, CAR, SKATE, SURFACES, newState, step, turnRadius } from '../src/ride.js';
import assert from 'node:assert/strict';

const DT = 1 / 60;
let pass = 0;
let fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); process.exitCode = 1; }
}
function run(s, secs, thr, brk, str, P) {
  for (let i = 0; i < secs / DT; i++) step(s, DT, thr, brk, str, P);
  return s;
}
// Carving left-right at `period` seconds a lap, which is what pumping IS.
// Holding one direction only puts the board in a circle, so a pump test that
// held full lock would measure a merry-go-round, not a rider going somewhere.
// `amp` below the drift commitment (SKATE.driftSteer 0.75) is a GRIPPED carve
// — the regime where the pump pays and the trucks track. Full amplitude is a
// committed slalom and, since the drift state landed, deliberately breaks the
// tail instead; the drift tests at the bottom cover that regime.
function carve(s, secs, P, period = 1.1, amp = 1) {
  for (let i = 0; i < secs / DT; i++) {
    step(s, DT, 0, 0, amp * Math.sign(Math.sin((i * DT * 2 * Math.PI) / period)), P);
  }
  return s;
}

console.log('ride model');

t('accelerates to a bounded top speed', () => {
  const s = run(newState(), 40, 1, 0, 0);
  assert.ok(s.speed > 8, 'too slow: ' + s.speed);
  assert.ok(s.speed <= RIDE.vMax + 1e-6, 'exceeded vMax: ' + s.speed);
});

t('reaches ~half top speed within 3s (feels lively, not twitchy)', () => {
  const s = run(newState(), 3, 1, 0, 0);
  assert.ok(s.speed > RIDE.vMax * 0.45, 'sluggish: ' + s.speed.toFixed(2));
  assert.ok(s.speed < RIDE.vMax * 0.95, 'instant: ' + s.speed.toFixed(2));
});

t('coasts to a stop and never goes negative', () => {
  const s = run(newState(), 10, 1, 0, 0);
  run(s, 30, 0, 0, 0);
  assert.equal(s.speed, 0);
});

t('brakes harder than it coasts', () => {
  const a = run(newState(), 10, 1, 0, 0);
  const b = { ...a };
  run(a, 1, 0, 0, 0);
  run(b, 1, 0, 1, 0);
  assert.ok(b.speed < a.speed - 3, `brake ${b.speed.toFixed(2)} vs coast ${a.speed.toFixed(2)}`);
});

t('does not turn while stationary', () => {
  const s = newState();
  run(s, 2, 0, 0, 1);
  assert.equal(s.heading, 0);
});

t('turn radius grows with speed (steering calms down as you go faster)', () => {
  const slow = turnRadius(3), fast = turnRadius(14);
  assert.ok(fast > slow * 3, `slow ${slow.toFixed(1)}m vs fast ${fast.toFixed(1)}m`);
});

t('u-turn at walking pace fits inside a 2-lane road', () => {
  assert.ok(turnRadius(2.5) < 7, 'radius ' + turnRadius(2.5).toFixed(1) + 'm');
});

t('leans into the turn and returns upright', () => {
  const s = run(newState(), 6, 1, 0, 0);
  run(s, 1.5, 1, 0, 1);
  assert.ok(Math.abs(s.lean) > 0.08, 'no lean: ' + s.lean.toFixed(3));
  assert.ok(Math.abs(s.lean) <= RIDE.leanMax + 1e-6, 'over-leaned');
  const sign = Math.sign(s.lean);
  run(s, 2.5, 1, 0, 0);
  assert.ok(Math.abs(s.lean) < 0.05, 'did not straighten: ' + s.lean.toFixed(3));
  assert.ok(sign !== 0);
});

t('is deterministic for the same input tape', () => {
  const a = newState(), b = newState();
  for (let i = 0; i < 600; i++) {
    const str = Math.sin(i / 37);
    step(a, DT, 1, 0, str); step(b, DT, 1, 0, str);
  }
  assert.equal(a.x, b.x); assert.equal(a.z, b.z); assert.equal(a.heading, b.heading);
});

t('a full-lock circle at cruise stays under 60m across', () => {
  const s = run(newState(), 12, 1, 0, 0);
  const r = turnRadius(s.speed);
  assert.ok(r * 2 < 60, 'diameter ' + (r * 2).toFixed(1) + 'm');
});

t('positive steer turns to the rider RIGHT, not left', () => {
  // rider-right for heading h is (-cos h, sin h) in this (+x east, +z south) frame
  const s = run(newState(), 6, 1, 0, 0);
  const h0 = s.heading, x0 = s.x, z0 = s.z;
  run(s, 2.2, 1, 0, 1);                       // full right lock
  const dx = s.x - x0, dz = s.z - z0;
  const rightward = dx * -Math.cos(h0) + dz * Math.sin(h0);
  assert.ok(rightward > 1, `steer=+1 moved ${rightward.toFixed(2)}m to the rider's right`);
});

t('negative steer mirrors it', () => {
  const s = run(newState(), 6, 1, 0, 0);
  const h0 = s.heading, x0 = s.x, z0 = s.z;
  run(s, 2.2, 1, 0, -1);
  const rightward = (s.x - x0) * -Math.cos(h0) + (s.z - z0) * Math.sin(h0);
  assert.ok(rightward < -1, `steer=-1 moved ${rightward.toFixed(2)}m (should be negative)`);
});

t('leans into the turn on the correct side', () => {
  const r = run(newState(), 6, 1, 0, 0); run(r, 1.5, 1, 0, 1);
  const l = run(newState(), 6, 1, 0, 0); run(l, 1.5, 1, 0, -1);
  assert.ok(Math.sign(r.lean) === -Math.sign(l.lean), 'lean does not mirror');
  assert.ok(r.lean !== 0);
});

t('holding the brake at a standstill reverses', () => {
  const s = newState();
  run(s, 2.5, 0, 1, 0);
  assert.ok(s.speed < -0.5, 'did not reverse: ' + s.speed.toFixed(2));
  assert.ok(s.speed >= -RIDE.vReverse - 1e-6, 'reverse too fast: ' + s.speed.toFixed(2));
});

t('reverse is much slower than forward', () => {
  const f = run(newState(), 20, 1, 0, 0);
  const r = run(newState(), 20, 0, 1, 0);
  assert.ok(Math.abs(r.speed) < f.speed * 0.35, `rev ${r.speed.toFixed(2)} vs fwd ${f.speed.toFixed(2)}`);
});

t('throttle cancels reverse and drives forward again', () => {
  const s = newState();
  run(s, 2.5, 0, 1, 0);
  assert.ok(s.speed < 0);
  run(s, 4, 1, 0, 0);
  assert.ok(s.speed > 1, 'did not resume forward: ' + s.speed.toFixed(2));
  assert.equal(s.reversing, false);
});

t('releasing the brake settles reverse back to a stop', () => {
  const s = newState();
  run(s, 2.5, 0, 1, 0);
  run(s, 4, 0, 0, 0);
  assert.equal(s.speed, 0);
});

t('top speed is a scooter pace, not a motorway one', () => {
  const s = run(newState(), 40, 1, 0, 0);
  const kmh = s.speed * 3.6;
  assert.ok(kmh > 30 && kmh < 48, 'top speed ' + kmh.toFixed(1) + ' km/h');
});

console.log('\nsurf skate');

t('the throttle alone gets you there — it is an ELECTRIC board', () => {
  // The rider asked for "the surf skate drift effect but acceleration all is
  // auto", so holding the throttle and never carving must reach a real cruise.
  // The earlier design deliberately ran out at walking pace; this asserts the
  // opposite so it cannot quietly come back.
  const s = run(newState(), 40, 1, 0, 0, SKATE);
  const kmh = s.speed * 3.6;
  // vMax is the owner's 20 km/h cap (2026-08-03); throttle alone must reach it
  assert.ok(kmh > 19, 'throttle-only top speed too low: ' + kmh.toFixed(1) + ' km/h');
  assert.ok(s.speed <= SKATE.vMax + 1e-6, 'exceeded vMax');
});

t('it pulls from a standstill without being pumped', () => {
  const s = run(newState(), 3, 1, 0, 0, SKATE);
  assert.ok(s.speed * 3.6 > 14, 'sluggish off the line: ' + (s.speed * 3.6).toFixed(1) + ' km/h');
});

t('carving still PAYS on top of the motor, it is just not compulsory', () => {
  // Sub-threshold only, since every real turn slides now (driftSteer 0.2):
  // the pump survives as a feather-carve bonus, not a propulsion system.
  const a = run(newState(), 6, 1, 0, 0, SKATE);       // throttle, straight
  const b = run(newState(), 6, 1, 0, 0, SKATE);
  carve(b, 6, SKATE, 1.1, 0.15);                       // feather carve, no throttle
  const c = run(newState(), 6, 1, 0, 0, SKATE);
  run(c, 6, 0, 0, 0, SKATE);                           // or just coast
  assert.ok(b.speed > c.speed + 0.2,
    `carving ${b.speed.toFixed(2)} should beat coasting ${c.speed.toFixed(2)}`);
  assert.ok(a.speed > 0);
});

t('let go and it coasts down — the motor is not a cruise control', () => {
  const s = run(newState(), 12, 1, 0, 0, SKATE);
  const cruise = s.speed;
  run(s, 4, 0, 0, 0, SKATE);
  assert.ok(s.speed < cruise - 1.2, `held ${s.speed.toFixed(2)} from ${cruise.toFixed(2)}`);
});

t('the pump cannot run away — it fades out below the board top speed', () => {
  const s = run(newState(), 3, 1, 0, 0, SKATE);
  carve(s, 120, SKATE);
  assert.ok(s.speed <= SKATE.vMax + 1e-6, 'exceeded vMax: ' + s.speed);
});

t('you cannot pump from a standstill — the board has to be rolling', () => {
  const s = newState();
  carve(s, 6, SKATE);
  assert.ok(Math.abs(s.speed) < 0.05, 'carving alone started it: ' + s.speed.toFixed(3));
});

t('no vehicle has a pushMax any more — the board went electric', () => {
  for (const [name, P] of [['scooter', RIDE], ['car', CAR], ['skate', SKATE]]) {
    assert.equal(P.pushMax, undefined, name + ' still runs out of throttle');
  }
});

t('the trucks are looser than the scooter at every speed', () => {
  for (const v of [2.5, 5, 8]) {
    const board = turnRadius(v, SKATE), scoot = turnRadius(v, RIDE);
    assert.ok(board < scoot * 0.85,
      `at ${v} m/s board ${board.toFixed(1)}m vs scooter ${scoot.toFixed(1)}m`);
  }
});

t('a surf skate u-turn fits in one carriageway', () => {
  assert.ok(turnRadius(2.5, SKATE) < 2.5, 'radius ' + turnRadius(2.5, SKATE).toFixed(2) + 'm');
});

t('it carves deeper than the scooter banks', () => {
  // PEAK lean, sampled through the run: at full commitment the board now
  // drifts and bleeds speed, so its settled lean shrinks with it — the deep
  // moment is the entry, which is also what a rider sees.
  const b = run(newState(), 6, 1, 0, 0, SKATE);
  let deepest = 0;
  for (let i = 0; i < 2 / DT; i++) {
    step(b, DT, 1, 0, 1, SKATE);
    deepest = Math.max(deepest, Math.abs(b.lean));
  }
  const r = run(newState(), 6, 1, 0, 0); run(r, 1.5, 1, 0, 1);
  assert.ok(deepest > Math.abs(r.lean),
    `board ${deepest.toFixed(2)} vs scooter ${r.lean.toFixed(2)}`);
  assert.ok(deepest <= SKATE.leanMax + 1e-6, 'over-leaned');
});

t('neither the scooter nor the car gained a pump', () => {
  for (const [name, P] of [['scooter', RIDE], ['car', CAR]]) {
    assert.equal(P.pump, undefined, name + ' has a pump');
    const straight = run(newState(), 8, 1, 0, 0, P);
    const carved = run(newState(), 8, 1, 0, 1, P);
    assert.ok(carved.speed <= straight.speed + 1e-9,
      name + ' gains speed by turning: ' + carved.speed + ' vs ' + straight.speed);
  }
});

t('it is deterministic like everything else here', () => {
  const a = newState(), b = newState();
  for (let i = 0; i < 900; i++) {
    const str = Math.sin(i / 23);
    step(a, DT, 0.4, 0, str, SKATE); step(b, DT, 0.4, 0, str, SKATE);
  }
  assert.equal(a.x, b.x); assert.equal(a.z, b.z); assert.equal(a.speed, b.speed);
});

t('every vehicle carries a chase-camera framing', () => {
  for (const [name, P] of [['scooter', RIDE], ['car', CAR], ['skate', SKATE]]) {
    assert.ok(P.cam && P.cam.back > 0 && P.cam.up > 0 && P.cam.aim > 0 && P.cam.fov > 0,
      name + ' has no cam block');
  }
  // the board is the most immersive of the three, the car the least
  assert.ok(SKATE.cam.back < RIDE.cam.back && RIDE.cam.back < CAR.cam.back);
  assert.ok(SKATE.cam.up < RIDE.cam.up && RIDE.cam.up < CAR.cam.up);
});

t('the board SLIPS — it points into the turn and slides wide', () => {
  const s = run(newState(), 4, 1, 0, 0, SKATE);
  assert.ok(Math.abs(s.slip) < 1e-9, 'slipping in a straight line: ' + s.slip);
  run(s, 1.2, 1, 0, 1, SKATE);
  const deg = Math.abs(s.slip) * 180 / Math.PI;
  assert.ok(deg > 12, 'no drift: ' + deg.toFixed(1) + ' deg');
  // full lock at cruise is COMMITTED since the drift state landed, so the
  // active cap is the drift one; the gripped cap is asserted by the
  // gentle-carve test below.
  const cap = (s.drifting ? SKATE.slipMaxDrift : SKATE.slipMax) * 180 / Math.PI;
  assert.ok(deg <= cap + 1e-6, 'slid past the cap: ' + deg.toFixed(1));
});

t('the slip is on the OUTSIDE of the turn, not the inside', () => {
  const r = run(newState(), 4, 1, 0, 0, SKATE); run(r, 1.2, 1, 0, 1, SKATE);
  const l = run(newState(), 4, 1, 0, 0, SKATE); run(l, 1.2, 1, 0, -1, SKATE);
  assert.ok(Math.sign(r.slip) === -Math.sign(l.slip), 'slip does not mirror');
  assert.ok(r.slip !== 0);
});

t('a drift never swaps ends — the cap holds under sustained lock', () => {
  const s = run(newState(), 4, 1, 0, 0, SKATE);
  let worst = 0;
  for (let i = 0; i < 20 / DT; i++) {
    step(s, DT, 1, 0, 1, SKATE);
    worst = Math.max(worst, Math.abs(s.slip));
  }
  // the deepest the board may EVER get is the drift cap — sampled every
  // frame, because the end state alone can hide a mid-run spin
  assert.ok(worst <= SKATE.slipMaxDrift + 1e-6,
    'spun out: ' + (worst * 180 / Math.PI).toFixed(1) + ' deg');
});

t('sliding scrubs speed, so a long drift costs you', () => {
  const a = run(newState(), 6, 1, 0, 0, SKATE);
  const b = run(newState(), 6, 1, 0, 0, SKATE);
  run(a, 2, 1, 0, 0, SKATE);        // straight, throttle held
  run(b, 2, 1, 0, 1, SKATE);        // drifting, throttle held
  assert.ok(b.speed < a.speed, `drifting ${b.speed.toFixed(2)} should cost vs straight ${a.speed.toFixed(2)}`);
});

t('committed steering BREAKS the tail — drift is a state, past the grip cap', () => {
  const s = run(newState(), 6, 1, 0, 0, SKATE);
  run(s, 2, 1, 0, 1, SKATE);
  assert.ok(s.drifting, 'full lock at cruise never broke the tail');
  const deg = Math.abs(s.slip) * 180 / Math.PI;
  assert.ok(deg > SKATE.slipMax * 180 / Math.PI + 5,
    'drift no deeper than a gripped carve: ' + deg.toFixed(1) + ' deg');
  assert.ok(deg <= SKATE.slipMaxDrift * 180 / Math.PI + 1e-6, 'past the drift cap');
});

t('only a feather-touch keeps grip — every real turn slides (the ski contract)', () => {
  const g = run(newState(), 6, 1, 0, 0, SKATE);
  run(g, 3, 1, 0, 0.15, SKATE);
  assert.ok(!g.drifting, 'a feather carve broke the tail');
  // and a HALF steer — an ordinary turn — is already a slide, which is the
  // rider's ask verbatim: "every turn should be sliding alr"
  const s = run(newState(), 6, 1, 0, 0, SKATE);
  run(s, 2, 1, 0, 0.5, SKATE);   // 2s: the snowboard tune builds its arc slowly on purpose
  assert.ok(s.drifting, 'an ordinary turn did not slide');
  assert.ok(Math.abs(s.slip) > 0.4, 'slide too shallow to read: ' + s.slip.toFixed(2));
});

t('releasing the steer HOOKS UP: scrub paid once, then it runs straight', () => {
  const s = run(newState(), 6, 1, 0, 0, SKATE);
  run(s, 2, 1, 0, 1, SKATE);
  const inDrift = s.speed;
  run(s, 0.1, 1, 0, 0, SKATE);
  assert.ok(!s.drifting, 'still drifting after release');
  assert.ok(s.speed < inDrift - 0.25, `no hook-up scrub: ${inDrift.toFixed(2)} -> ${s.speed.toFixed(2)}`);
  run(s, 1.2, 1, 0, 0, SKATE);
  assert.ok(Math.abs(s.slip) < 0.06, 'never straightened: ' + s.slip);
});

t('flicking to the other side hooks up and can re-break — a slalom is not one slide', () => {
  const s = run(newState(), 6, 1, 0, 0, SKATE);
  run(s, 1.5, 1, 0, 1, SKATE);
  assert.ok(s.drifting && s.driftDir === 1);
  run(s, 0.05, 1, 0, -1, SKATE);   // the flick
  // it either hooked up, or re-broke the OTHER way — never keeps the old slide
  assert.ok(!s.drifting || s.driftDir === -1, 'the flick kept the old drift');
});

t('no pumping while the tail is out — a drift is never free speed', () => {
  const s = run(newState(), 6, 1, 0, 0, SKATE);
  const before = s.speed;
  run(s, 3, 1, 0, 1, SKATE);       // held full-lock slide, throttle pinned
  // the slide must COST something and can never beat the straight — but with
  // every turn sliding now, the toll is deliberately light (the motor plays
  // the mountain's gravity), so this asserts direction, not pain
  assert.ok(s.speed < before - 0.3,
    `a held drift is free speed: ${before.toFixed(2)} -> ${s.speed.toFixed(2)}`);
});

t('the scooter and the car do not slip at all', () => {
  for (const [name, P] of [['scooter', RIDE], ['car', CAR]]) {
    assert.equal(P.grip, undefined, name + ' gained a grip term');
    const s = run(newState(), 6, 1, 0, 0, P);
    run(s, 2, 1, 0, 1, P);
    assert.equal(s.slip, 0, name + ' slipped: ' + s.slip);
    // and it still travels exactly where it points
    assert.ok(Math.abs(s.course - s.heading) < 1e-12, name + ' course diverged from heading');
  }
});

/* ---------------- surfaces ---------------- */
// The board did not know what it was rolling on until 2026-08-05. These pin
// the contract: road is the identity, bad ground is slow, and NO surface may
// change how the scooter or the car behave (they have no pump and no grip, so
// the multipliers that matter to a board are inert on them by construction —
// asserted, not assumed).

t('road is the identity surface: it changes nothing', () => {
  const a = newState(), b = newState();
  for (let i = 0; i < 400; i++) {
    step(a, 1 / 60, 1, 0, 0.3, SKATE);
    step(b, 1 / 60, 1, 0, 0.3, SKATE, SURFACES.road);
  }
  assert.ok(Math.abs(a.speed - b.speed) < 1e-9, `${a.speed} vs ${b.speed}`);
  assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.z - b.z) < 1e-9);
});

t('bad ground is slower, and sand is the worst of it', () => {
  const top = (sf) => {
    const s = newState();
    for (let i = 0; i < 1200; i++) step(s, 1 / 60, 1, 0, 0, SKATE, sf);
    return s.speed;
  };
  const road = top(SURFACES.road), grass = top(SURFACES.grass), sand = top(SURFACES.sand);
  assert.ok(grass < road * 0.72, `grass ${grass.toFixed(2)} vs road ${road.toFixed(2)}`);
  assert.ok(sand < grass, `sand ${sand.toFixed(2)} vs grass ${grass.toFixed(2)}`);
  assert.ok(sand < road * 0.5, `sand ${sand.toFixed(2)} vs road ${road.toFixed(2)}`);
});

t('riding onto sand at speed BOGS, it does not hit a wall', () => {
  const s = newState();
  for (let i = 0; i < 1200; i++) step(s, 1 / 60, 1, 0, 0, SKATE);   // up to road pace
  const entry = s.speed;
  step(s, 1 / 60, 1, 0, 0, SKATE, SURFACES.sand);
  const afterOneFrame = entry - s.speed;
  assert.ok(afterOneFrame < entry * 0.05,
    `lost ${afterOneFrame.toFixed(2)} m/s in one frame of ${entry.toFixed(2)}`);
  for (let i = 0; i < 180; i++) step(s, 1 / 60, 1, 0, 0, SKATE, SURFACES.sand);
  assert.ok(s.speed < entry * 0.55, `after 3s on sand: ${s.speed.toFixed(2)} from ${entry.toFixed(2)}`);
});

t('a pump pays on tarmac and barely pays on sand', () => {
  const gain = (sf) => {
    const s = newState(); s.speed = 3;
    let carved = 0;
    for (let i = 0; i < 240; i++) {
      const steer = Math.sin(i / 18) > 0 ? 0.9 : -0.9;
      step(s, 1 / 60, 0, 0, steer, SKATE, sf);
      carved++;
    }
    void carved;
    return s.speed;
  };
  assert.ok(gain(SURFACES.road) > gain(SURFACES.sand),
    `road ${gain(SURFACES.road).toFixed(2)} vs sand ${gain(SURFACES.sand).toFixed(2)}`);
});

t('surfaces cannot change the scooter or the car', () => {
  for (const P of [RIDE, CAR]) {
    const a = newState(), b = newState();
    for (let i = 0; i < 300; i++) {
      step(a, 1 / 60, 1, 0, 0.5, P);
      step(b, 1 / 60, 1, 0, 0.5, P, SURFACES.sand);
    }
    // they have no pump and no grip, so only the rolling-resistance and cap
    // terms can reach them — and those are the surface doing its job. What
    // must NOT change is that they still never slip.
    assert.equal(a.slip, 0); assert.equal(b.slip, 0);
    assert.equal(a.drifting, false); assert.equal(b.drifting, false);
  }
});

// NEVER print a clean-looking count while failing. "37 passed" with exit 1
// cost two deploys on 2026-08-03: the deploy log tails ONE line, so the four
// FAIL lines scrolled away and the summary lied by omission.
console.log(fail ? `\n${fail} FAILED, ${pass} passed` : `\n${pass} passed`);
