// Pure ride model. No three.js, no DOM — so it runs and is asserted in Node in
// milliseconds instead of by driving a browser.
export const RIDE = {
  vMax: 11.6,          // m/s, ~42 km/h — a scooter pace, not a motorway one
  vReverse: 2.4,       // walking-pace backwards
  accel: 5.0,
  reverseAccel: 2.6,
  brake: 11.0,
  coast: 1.35,
  drag: 0.016,
  wheelbase: 1.32,
  steerMax: 0.62,      // rad at crawl
  steerFalloff: 0.045, // steering authority shrinks with speed
  leanMax: 0.62,
  leanRate: 5.0,
};

export function newState(x = 0, z = 0, heading = 0) {
  return { x, z, heading, speed: 0, lean: 0, yaw: 0, wheel: 0, revHold: 0, reversing: false };
}

// A CAR IS THE SAME MODEL WITH DIFFERENT NUMBERS. Faster top end, stronger
// pull, a longer wheelbase and steering that gives up more authority with
// speed — and it barely leans where the scooter banks. Kept beside RIDE so
// the physics stays one asserted function, not two forks.
export const CAR = {
  vMax: 18.0,          // m/s, ~65 km/h — quick for town, not a highway pace
  vReverse: 3.2,
  accel: 6.5,
  reverseAccel: 3.0,
  brake: 12.5,
  coast: 1.1,
  drag: 0.02,
  wheelbase: 2.62,
  steerMax: 0.52,
  steerFalloff: 0.06,
  leanMax: 0.07,       // body roll, not a bank
  leanRate: 6.0,
};

export function step(s, dt, throttle, brakeIn, steer, P = RIDE) {
  // Reverse: keep holding the brake once you have stopped and it backs up.
  // No extra control to learn, which matters when you only have two thumbs.
  if (throttle > 0) { s.revHold = 0; s.reversing = false; }
  else if (brakeIn > 0 && s.speed <= 0.03) s.revHold += dt;
  else if (brakeIn === 0) { s.revHold = 0; if (s.speed >= -0.02) s.reversing = false; }
  if (s.revHold > 0.35) s.reversing = true;

  let a;
  if (s.reversing) {
    a = -brakeIn * P.reverseAccel;
  } else {
    a = throttle * P.accel - brakeIn * P.brake * (s.speed > 0 ? 1 : 0);
  }
  // rolling resistance and drag always oppose motion
  if (Math.abs(s.speed) > 0.05) {
    const dir = Math.sign(s.speed);
    a -= dir * (P.coast + P.drag * s.speed * s.speed);
  }
  s.speed = Math.max(-P.vReverse, Math.min(P.vMax, s.speed + a * dt));
  // without a deadzone the coast term asymptotes and the scooter creeps forever
  if (!s.reversing && throttle === 0 && Math.abs(s.speed) < 0.12) s.speed = 0;
  if (s.reversing && brakeIn === 0 && Math.abs(s.speed) < 0.12) { s.speed = 0; s.reversing = false; }

  const authority = 1 / (1 + P.steerFalloff * s.speed * s.speed);   // signed speed below
  const steerAngle = steer * P.steerMax * authority;
  const yawRate = (s.speed / P.wheelbase) * Math.tan(steerAngle);
  s.yaw = yawRate;
  s.heading -= yawRate * dt;

  const target = Math.max(-P.leanMax, Math.min(P.leanMax, yawRate * s.speed * 0.11));
  s.lean += (target - s.lean) * Math.min(1, P.leanRate * dt);

  s.x += Math.sin(s.heading) * s.speed * dt;
  s.z += Math.cos(s.heading) * s.speed * dt;
  s.wheel += (s.speed / 0.21) * dt;
  return s;
}

// radius of the circle the scooter traces at a given speed with full lock
export function turnRadius(speed) {
  const authority = 1 / (1 + RIDE.steerFalloff * speed * speed);
  const yawRate = (speed / RIDE.wheelbase) * Math.tan(RIDE.steerMax * authority);
  return yawRate === 0 ? Infinity : speed / yawRate;
}
