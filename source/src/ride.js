// Pure ride model. No three.js, no DOM — so it runs and is asserted in Node in
// milliseconds instead of by driving a browser.
export const RIDE = {
  vMax: 15.5,          // m/s, ~56 km/h
  accel: 6.2,
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
  return { x, z, heading, speed: 0, lean: 0, yaw: 0, wheel: 0 };
}

export function step(s, dt, throttle, brakeIn, steer) {
  let a = throttle * RIDE.accel - brakeIn * RIDE.brake;
  if (s.speed > 0.05) a -= RIDE.coast;
  a -= RIDE.drag * s.speed * s.speed;
  s.speed = Math.max(0, Math.min(RIDE.vMax, s.speed + a * dt));
  // without a deadzone the coast term asymptotes and the scooter creeps forever
  if (throttle === 0 && s.speed < 0.12) s.speed = 0;

  const authority = 1 / (1 + RIDE.steerFalloff * s.speed * s.speed);
  const steerAngle = steer * RIDE.steerMax * authority;
  const yawRate = (s.speed / RIDE.wheelbase) * Math.tan(steerAngle);
  s.yaw = yawRate;
  s.heading += yawRate * dt;

  const target = Math.max(-RIDE.leanMax, Math.min(RIDE.leanMax, -yawRate * s.speed * 0.11));
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
