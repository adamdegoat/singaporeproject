// Ride-feel assertions. Run: node test/ride.test.mjs
import { RIDE, CAR, SKATE, newState, step, turnRadius } from '../src/ride.js';
import assert from 'node:assert/strict';

const DT = 1 / 60;
let pass = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { console.log('  FAIL ' + name + '\n       ' + e.message); process.exitCode = 1; }
}
function run(s, secs, thr, brk, str, P) {
  for (let i = 0; i < secs / DT; i++) step(s, DT, thr, brk, str, P);
  return s;
}
// Carving left-right at `period` seconds a lap, which is what pumping IS.
// Holding one direction only puts the board in a circle, so a pump test that
// held full lock would measure a merry-go-round, not a rider going somewhere.
function carve(s, secs, P, period = 1.1) {
  for (let i = 0; i < secs / DT; i++) {
    step(s, DT, 0, 0, Math.sign(Math.sin((i * DT * 2 * Math.PI) / period)), P);
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
  assert.ok(kmh > 26, 'throttle-only top speed too low: ' + kmh.toFixed(1) + ' km/h');
  assert.ok(s.speed <= SKATE.vMax + 1e-6, 'exceeded vMax');
});

t('it pulls from a standstill without being pumped', () => {
  const s = run(newState(), 3, 1, 0, 0, SKATE);
  assert.ok(s.speed * 3.6 > 14, 'sluggish off the line: ' + (s.speed * 3.6).toFixed(1) + ' km/h');
});

t('carving still PAYS on top of the motor, it is just not compulsory', () => {
  const a = run(newState(), 6, 1, 0, 0, SKATE);       // throttle, straight
  const b = run(newState(), 6, 1, 0, 0, SKATE);
  carve(b, 6, SKATE);                                  // then carve, no throttle
  const c = run(newState(), 6, 1, 0, 0, SKATE);
  run(c, 6, 0, 0, 0, SKATE);                           // or just coast
  assert.ok(b.speed > c.speed + 1.0,
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
  const b = run(newState(), 3, 1, 0, 0, SKATE); carve(b, 8, SKATE);
  const r = run(newState(), 6, 1, 0, 0); run(r, 1.5, 1, 0, 1);
  assert.ok(Math.abs(b.lean) > Math.abs(r.lean),
    `board ${b.lean.toFixed(2)} vs scooter ${r.lean.toFixed(2)}`);
  assert.ok(Math.abs(b.lean) <= SKATE.leanMax + 1e-6, 'over-leaned');
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
  assert.ok(deg <= SKATE.slipMax * 180 / Math.PI + 1e-6, 'slid past the cap: ' + deg.toFixed(1));
});

t('the slip is on the OUTSIDE of the turn, not the inside', () => {
  const r = run(newState(), 4, 1, 0, 0, SKATE); run(r, 1.2, 1, 0, 1, SKATE);
  const l = run(newState(), 4, 1, 0, 0, SKATE); run(l, 1.2, 1, 0, -1, SKATE);
  assert.ok(Math.sign(r.slip) === -Math.sign(l.slip), 'slip does not mirror');
  assert.ok(r.slip !== 0);
});

t('a drift never swaps ends — the cap holds under sustained lock', () => {
  const s = run(newState(), 4, 1, 0, 0, SKATE);
  run(s, 20, 1, 0, 1, SKATE);
  const deg = Math.abs(s.slip) * 180 / Math.PI;
  assert.ok(deg <= SKATE.slipMax * 180 / Math.PI + 1e-6, 'spun out: ' + deg.toFixed(1) + ' deg');
});

t('sliding scrubs speed, so a long drift costs you', () => {
  const a = run(newState(), 6, 1, 0, 0, SKATE);
  const b = run(newState(), 6, 1, 0, 0, SKATE);
  run(a, 2, 1, 0, 0, SKATE);        // straight, throttle held
  run(b, 2, 1, 0, 1, SKATE);        // drifting, throttle held
  assert.ok(b.speed < a.speed, `drifting ${b.speed.toFixed(2)} should cost vs straight ${a.speed.toFixed(2)}`);
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

console.log(`\n${pass} passed`);
