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
  // `course` is the direction actually TRAVELLED, which is not always the
  // direction the machine points — see the slip block in step(). `slip` is the
  // angle between the two, exposed so a renderer or a check can read the drift
  // without recomputing it.
  return { x, z, heading, course: heading, slip: 0,
           speed: 0, lean: 0, yaw: 0, wheel: 0, revHold: 0, reversing: false };
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

// A SURF SKATE IS THE SAME MODEL AGAIN, WITH THREE THINGS THE OTHERS DO NOT
// HAVE: a pump, loose trucks, and SLIP.
//
// It is an ELECTRIC one, on the rider's ask — "the control feeling can have
// the surf skate drift effect but acceleration all is auto" — so the throttle
// is a hub motor that pulls at any speed, and `pump` is a bonus on top rather
// than the only way to move: carving still adds speed, it is simply no longer
// compulsory. Holding one direction just puts you in a circle, so going
// somewhere fast still means working the turns.
//
// The trucks are LOOSE. `wheelbase` is an EFFECTIVE value, not the 0.42m
// between a real board's trucks: this is a bicycle steering model, and a real
// deck's geometry pushed through it spins on the spot. 1.05 lands the turn
// radii where a surf skate's actually are — 1.4m at walking pace against the
// scooter's 4.4m, 5.9m at cruise against its 8.2m.
//
// And it SLIPS, which is what the first version was missing. It carved harder
// and leaned deeper than the scooter and still read as "just like bike and
// car", because the board tracked exactly where it pointed. See the slip block
// in step(): the deck now points into the turn while momentum carries it wide.
// Measured at cruise on full lock: 25 degrees of slide and 46 of lean.
//
// Every one of these is off by default, so RIDE and CAR are untouched — and
// test/ride.test.mjs asserts that they measure exactly zero slip.
export const SKATE = {
  vMax: 9.2,           // m/s, ~33 km/h — an electric carver, not a scooter
  vReverse: 1.4,
  accel: 5.4,          // a hub motor: it pulls from a standstill and keeps pulling
  reverseAccel: 1.4,
  brake: 7.5,          // regen plus a foot drag
  coast: 0.55,         // urethane rolls a long way
  drag: 0.010,
  wheelbase: 1.05,     // EFFECTIVE — see the note above
  steerMax: 0.80,
  steerFalloff: 0.055, // a surf truck keeps its bite at speed
  leanMax: 0.80,       // the deck goes right over in a carve
  leanRate: 8.5,       // and it gets there fast
  pump: 2.6,           // carving still pays, it is just no longer compulsory
  // THE DRIFT. Low grip means the deck slides across its own direction of
  // travel before it hooks up; slipMax stops it ever swapping ends; slipDrag
  // makes the slide cost speed so holding a long drift is a decision.
  grip: 2.6,
  slipMax: 0.62,       // ~36 degrees of slide at full commitment
  slipDrag: 1.9,
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

  // SLIP — THE BOARD POINTS INTO THE TURN AND MOMENTUM CARRIES IT WIDE.
  //
  // Every vehicle here travelled exactly along `heading`, so nothing could
  // ever slide: the surf skate carved harder and leaned deeper than the
  // scooter and still read as "a bike that leans more", which is what the
  // rider said — "i want the surf skate to have some like drifting effect so
  // it feels a bit like those skiing game style".
  //
  // So the direction TRAVELLED is now its own state. `heading` swings with the
  // steering as before; `course` chases it at a rate set by P.grip, and the
  // gap between them IS the drift. Fast steering opens the gap, grip closes
  // it, and the machine is drawn pointing along `heading` while moving along
  // `course` — which is exactly what a board sliding across its own direction
  // looks like from behind. No renderer change is needed for that.
  //
  // A vehicle with no `grip` has course === heading and behaves EXACTLY as it
  // did: the scooter and the car are untouched by this, asserted in the tests.
  if (P.grip) {
    let d = s.heading - s.course;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    // A cap, so a hard turn slides and never spins: past this the board simply
    // washes out at a fixed angle instead of swapping ends.
    const cap = P.slipMax || 0.5;
    if (d > cap) { s.course += d - cap; d = cap; }
    else if (d < -cap) { s.course += d + cap; d = -cap; }
    s.course += d * Math.min(1, P.grip * dt);
    s.slip = s.heading - s.course;
    while (s.slip > Math.PI) s.slip -= Math.PI * 2;
    while (s.slip < -Math.PI) s.slip += Math.PI * 2;
    // Sliding sideways scrubs speed, which is what stops a drift being free
    // and is half of why carving in a ski game feels like work.
    if (P.slipDrag) s.speed = Math.max(0, s.speed - Math.abs(s.slip) * P.slipDrag * dt);
  } else {
    s.course = s.heading;
    s.slip = 0;
  }

  const target = Math.max(-P.leanMax, Math.min(P.leanMax, yawRate * s.speed * 0.11));
  s.lean += (target - s.lean) * Math.min(1, P.leanRate * dt);

  s.x += Math.sin(s.course) * s.speed * dt;
  s.z += Math.cos(s.course) * s.speed * dt;
  s.wheel += (s.speed / 0.21) * dt;
  return s;
}

// radius of the circle a vehicle traces at a given speed with full lock
export function turnRadius(speed, P = RIDE) {
  const authority = 1 / (1 + P.steerFalloff * speed * speed);
  const yawRate = (speed / P.wheelbase) * Math.tan(P.steerMax * authority);
  return yawRate === 0 ? Infinity : speed / yawRate;
}
