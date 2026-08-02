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
  // How the chase camera frames this vehicle. See driveCamera in main.js.
  cam: { back: 4.35, up: 2.45, aim: 6.4, fov: 55 },
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
  cam: { back: 5.85, up: 2.95, aim: 7.0, fov: 55 },
};

// A SURF SKATE IS THE SAME MODEL AGAIN, AND THE FEEL IS IN TWO EXTRA TERMS.
//
// What makes a surf skate a surf skate rather than a slow scooter is that you
// do not hold a throttle: you push ONCE to get rolling and after that you make
// your own speed by carving, weighting the board through each turn. Two terms
// carry that, and RIDE and CAR are untouched by both because each defaults off:
//
//   pump     carving while rolling ADDS speed instead of scrubbing it
//   pushMax  the foot-push stops working once the board is moving faster than
//            a person can run alongside it
//
// Together they give the loop the whole thing is about: push off to about
// 11 km/h, then carve left-right to build to about 21 km/h and hold it there.
// Stop carving on the flat and you coast down. Measured equilibria are
// asserted in test/ride.test.mjs so retuning these numbers cannot quietly
// turn the board back into a slow scooter.
//
// The trucks are LOOSE, which is the other half of the feel. `wheelbase` here
// is an EFFECTIVE value, not the 0.42m between a real board's trucks: this is
// a bicycle steering model, and a real deck's geometry pushed through it spins
// on the spot. 1.05 is the value that lands the turn radii where a surf skate's
// actually are — about 1.4m at walking pace against the scooter's 4.4m, and
// 5.9m at cruise against the scooter's 8.2m.
export const SKATE = {
  vMax: 8.4,           // m/s, ~30 km/h, and only a hill will ever reach it
  vReverse: 1.1,       // you can scoot it backwards, barely
  accel: 3.2,          // one foot on the road, not an engine
  reverseAccel: 1.1,
  brake: 7.0,          // a foot drag and a slide, not a disc
  coast: 0.62,         // urethane rolls a long way
  drag: 0.010,
  wheelbase: 1.05,     // EFFECTIVE — see the note above
  steerMax: 0.80,
  steerFalloff: 0.055, // a surf truck keeps its bite at speed
  leanMax: 0.80,       // the deck goes right over in a carve
  leanRate: 8.5,       // and it gets there fast
  pump: 3.6,
  pushMax: 4.2,
  cam: { back: 3.45, up: 1.95, aim: 5.6, fov: 57 },
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
    // THE PUSH RUNS OUT. On a board the throttle is a foot on the road, and a
    // foot cannot push a deck that is already moving faster than you can run
    // beside it. Above `pushMax` the input does nothing and the only way to
    // gain speed is to carve. Vehicles with no `pushMax` (the scooter, the
    // car) keep full authority at every speed, which is what an engine does.
    const push = P.pushMax ? Math.max(0, 1 - s.speed / P.pushMax) : 1;
    a = throttle * P.accel * push - brakeIn * P.brake * (s.speed > 0 ? 1 : 0);
  }
  // rolling resistance and drag always oppose motion
  if (Math.abs(s.speed) > 0.05) {
    const dir = Math.sign(s.speed);
    a -= dir * (P.coast + P.drag * s.speed * s.speed);
  }
  // THE PUMP. Weighting the board through a carve drives it forward, so a hard
  // turn ADDS speed where every other vehicle here scrubs it. Three gates keep
  // it honest: it needs the board already rolling (you cannot pump from a
  // standstill, hence the ramp from 0.4 m/s), it fades out as the board
  // approaches its own top speed so it cannot run away, and it is proportional
  // to how hard you are actually carving. Holding one direction just puts you
  // in a circle — going somewhere FAST means alternating, which is exactly
  // what pumping a surf skate is.
  if (P.pump && !s.reversing && s.speed > 0.4) {
    const carve = Math.min(1, Math.abs(steer));
    const room = Math.max(0, 1 - s.speed / P.vMax);
    a += P.pump * carve * room * Math.min(1, (s.speed - 0.4) / 1.8);
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

// radius of the circle a vehicle traces at a given speed with full lock
export function turnRadius(speed, P = RIDE) {
  const authority = 1 / (1 + P.steerFalloff * speed * speed);
  const yawRate = (speed / P.wheelbase) * Math.tan(P.steerMax * authority);
  return yawRate === 0 ? Infinity : speed / yawRate;
}
