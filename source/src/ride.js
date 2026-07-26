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

export function step(s, dt, throttle, brakeIn, steer) {
  // Reverse: keep holding the brake once you have stopped and it backs up.
  // No extra control to learn, which matters when you only have two thumbs.
  if (throttle > 0) { s.revHold = 0; s.reversing = false; }
  else if (brakeIn > 0 && s.speed <= 0.03) s.revHold += dt;
  else if (brakeIn === 0) { s.revHold = 0; if (s.speed >= -0.02) s.reversing = false; }
  if (s.revHold > 0.35) s.reversing = true;

  let a;
  if (s.reversing) {
    a = -brakeIn * RIDE.reverseAccel;
  } else {
    a = throttle * RIDE.accel - brakeIn * RIDE.brake * (s.speed > 0 ? 1 : 0);
  }
  // rolling resistance and drag always oppose motion
  if (Math.abs(s.speed) > 0.05) {
    const dir = Math.sign(s.speed);
    a -= dir * (RIDE.coast + RIDE.drag * s.speed * s.speed);
  }
  s.speed = Math.max(-RIDE.vReverse, Math.min(RIDE.vMax, s.speed + a * dt));
  // without a deadzone the coast term asymptotes and the scooter creeps forever
  if (!s.reversing && throttle === 0 && Math.abs(s.speed) < 0.12) s.speed = 0;
  if (s.reversing && brakeIn === 0 && Math.abs(s.speed) < 0.12) { s.speed = 0; s.reversing = false; }

  const authority = 1 / (1 + RIDE.steerFalloff * s.speed * s.speed);   // signed speed below
  const steerAngle = steer * RIDE.steerMax * authority;
  const yawRate = (s.speed / RIDE.wheelbase) * Math.tan(steerAngle);
  s.yaw = yawRate;
  s.heading -= yawRate * dt;

  const target = Math.max(-RIDE.leanMax, Math.min(RIDE.leanMax, yawRate * s.speed * 0.11));
  s.lean += (target - s.lean) * Math.min(1, RIDE.leanRate * dt);

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
