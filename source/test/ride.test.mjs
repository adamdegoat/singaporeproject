// Ride-feel assertions. Run: node test/ride.test.mjs
import { RIDE, newState, step, turnRadius } from '../src/ride.js';
import assert from 'node:assert/strict';

const DT = 1 / 60;
let pass = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { console.log('  FAIL ' + name + '\n       ' + e.message); process.exitCode = 1; }
}
function run(s, secs, thr, brk, str) {
  for (let i = 0; i < secs / DT; i++) step(s, DT, thr, brk, str);
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

console.log(`\n${pass} passed`);
