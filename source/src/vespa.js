// Vespa: procedural model plus a small, pure ride model.
// The physics deliberately touches no three.js types so it can be asserted in
// Node without a browser.
import * as THREE from '../lib/three.module.js';
import { wardrobeMats } from './wardrobe.js';

export { RIDE, CAR, SKATE, SURFACES, SURF_ROAD, newState, step, turnRadius } from './ride.js';

/* ================= model ================= */
const BODY = 0x9fc4b8;      // classic pale mint
const CREAM = 0xe8e2d2;
const CHROME = 0xc6cace;

function part(geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  return m;
}

export function buildVespa() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.35, metalness: 0.25 });
  const cream = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.5 });
  const chrome = new THREE.MeshStandardMaterial({ color: CHROME, roughness: 0.22, metalness: 0.85 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x25282c, roughness: 0.85 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x54432f, roughness: 0.62 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xd8e4ea, roughness: 0.1, metalness: 0.1,
    transparent: true, opacity: 0.55 });

  // the Vespa signature: a monocoque with wide rear hips and a shield up front
  const hip = new THREE.SphereGeometry(0.30, 14, 12);
  g.add(part(hip, body, 0.26, 0.52, -0.30));
  g.add(part(hip, body, -0.26, 0.52, -0.30));
  const hipL = g.children[g.children.length - 1], hipR = g.children[g.children.length - 2];
  // A VESPA'S REAR BODY IS NOT AN EGG. At 1.55 in z these two spheres came out
  // 0.93m long on a 1.7m scooter and swallowed the seat, the rider's legs and
  // most of the frame — from the saddle it read as a pale blob with a person
  // balanced on it. The real cowl is about 0.6m from the seat nose to the tail.
  hipL.scale.set(0.68, 0.86, 1.02); hipR.scale.set(0.68, 0.86, 1.02);

  g.add(part(new THREE.BoxGeometry(0.42, 0.30, 0.86), body, 0, 0.56, -0.26));      // spine
  g.add(part(new THREE.BoxGeometry(0.46, 0.055, 0.62), cream, 0, 0.30, 0.28));      // floorboard
  // leg shield, tilted back like the real thing
  g.add(part(new THREE.BoxGeometry(0.50, 0.62, 0.10), body, 0, 0.62, 0.60, -0.30));
  g.add(part(new THREE.BoxGeometry(0.44, 0.30, 0.09), cream, 0, 0.40, 0.66, -0.30));
  // seat
  const seat = part(new THREE.CapsuleGeometry(0.13, 0.42, 4, 8), seatMat, 0, 0.79, -0.16, 0, 0, Math.PI / 2);
  seat.scale.set(1, 1, 1.15); g.add(seat);
  // headset, bars, mirrors, lamp
  g.add(part(new THREE.CylinderGeometry(0.055, 0.055, 0.62, 8), chrome, 0, 0.86, 0.66, -0.28));
  g.add(part(new THREE.CylinderGeometry(0.028, 0.028, 0.66, 6), chrome, 0, 1.09, 0.60, 0, 0, Math.PI / 2));
  for (const sx of [-0.30, 0.30]) {
    g.add(part(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), rubber, sx, 1.09, 0.60, 0, 0, Math.PI / 2));
    g.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.20, 5), chrome, sx * 0.9, 1.20, 0.60));
    g.add(part(new THREE.CircleGeometry(0.055, 10), chrome, sx * 0.9, 1.30, 0.60, 0, sx > 0 ? 0.5 : -0.5, 0));
  }
  const lamp = part(new THREE.SphereGeometry(0.115, 12, 10), chrome, 0, 0.99, 0.74);
  lamp.scale.set(1, 1, 0.62); g.add(lamp);
  g.add(part(new THREE.CircleGeometry(0.095, 12), new THREE.MeshStandardMaterial({
    color: 0xfff4d8, roughness: 0.2, emissive: 0xffe9b0, emissiveIntensity: 0.35,
  }), 0, 0.99, 0.80));
  // little windscreen, reads instantly as a scooter
  g.add(part(new THREE.BoxGeometry(0.44, 0.34, 0.02), glass, 0, 1.32, 0.66, -0.24));

  // THE PIECES A SCOOTER IS ACTUALLY RECOGNISED BY, and the ones this was
  // missing. Drawn once for the rider's own bike, so the cost is a rounding
  // error next to a single building.
  //
  // NOTE FOR ANYONE MOVING THE COWL AGAIN: every fitting below is positioned
  // against the rear body, whose z half-extent is about 0.31 after the cowl was
  // cut from a 0.93m egg to a 0.63m hip. Placed against the old length they
  // hung in the air behind the bike, which is what a close render caught.
  //
  // Front mudguard: the curved shield over the front wheel is the most
  // Vespa-shaped thing on a Vespa after the cowl. Built from three short slabs
  // stepping round the wheel rather than a curve, which matches how everything
  // else here is made.
  for (const [dz, dy, rx] of [[0.60, 0.60, 0.34], [0.68, 0.44, 0.08], [0.62, 0.28, -0.28]]) {
    g.add(part(new THREE.BoxGeometry(0.26, 0.05, 0.20), body, 0, dy, dz, rx));
  }
  // rear mudguard over the driven wheel, tucked under the cowl
  g.add(part(new THREE.BoxGeometry(0.28, 0.05, 0.26), body, 0, 0.42, -0.55, 0.22));
  // the engine cowl bulge on the right, which is where the motor actually is
  const cowl = part(new THREE.SphereGeometry(0.16, 10, 8), body, 0.22, 0.40, -0.52);
  cowl.scale.set(0.9, 0.85, 1.25); g.add(cowl);
  // Exhaust, low on the right and running ALONG the bike. A cylinder's axis is
  // Y, so it needs rotating about X to lie fore-and-aft; rotating about Z (which
  // is what the handlebars do) laid it ACROSS the machine and it photographed as
  // a white stick poking out of the rear wheel.
  g.add(part(new THREE.CylinderGeometry(0.035, 0.035, 0.40, 8), chrome,
    0.19, 0.30, -0.50, Math.PI / 2, 0, 0));
  // rear light and number plate, so the bike is not blank from the chase view
  g.add(part(new THREE.BoxGeometry(0.13, 0.09, 0.05), new THREE.MeshStandardMaterial({
    color: 0x8c1a17, emissive: 0xd83a2c, emissiveIntensity: 0.75, roughness: 0.35,
  }), 0, 0.84, -0.58));
  g.add(part(new THREE.BoxGeometry(0.17, 0.11, 0.02), cream, 0, 0.70, -0.56, 0.25));
  // a pillion grab rail behind the seat
  g.add(part(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6), chrome,
    0, 0.82, -0.40, 0, 0, Math.PI / 2));

  // wheels: small, which is most of why a Vespa looks like a Vespa
  const tyre = new THREE.CylinderGeometry(0.205, 0.205, 0.115, 16);
  const rim = new THREE.CylinderGeometry(0.115, 0.115, 0.12, 12);
  const wheels = [];
  for (const [wz, fork] of [[0.62, true], [-0.52, false]]) {
    const w = new THREE.Group();
    w.add(part(tyre, rubber, 0, 0, 0, 0, 0, Math.PI / 2));
    w.add(part(rim, cream, 0, 0, 0, 0, 0, Math.PI / 2));
    w.position.set(0, 0.205, wz);
    g.add(w); wheels.push(w);
    if (fork) {
      g.add(part(new THREE.BoxGeometry(0.07, 0.44, 0.07), chrome, 0.10, 0.42, wz, -0.16));
      g.add(part(new THREE.BoxGeometry(0.28, 0.05, 0.34), body, 0, 0.45, wz + 0.02));  // fender
    }
  }
  // exhaust
  g.add(part(new THREE.CylinderGeometry(0.045, 0.055, 0.42, 8), chrome, 0.24, 0.30, -0.44, 0, 0, Math.PI / 2.4));

  return { group: g, wheels };
}

export function buildRider() {
  const g = new THREE.Group();
  // ONE WARDROBE — see src/wardrobe.js. The helmet is the ONLY thing that
  // changes when you get on the scooter, which is what changes in life too.
  const W = wardrobeMats(THREE);
  const shirt = W.shirt, jeans = W.legs, skin = W.skin, helmet = W.helmet, visor = W.visor;

  const torso = part(new THREE.CapsuleGeometry(0.17, 0.40, 4, 10), shirt, 0, 1.16, -0.10, -0.22);
  g.add(torso);
  const head = part(new THREE.SphereGeometry(0.135, 14, 12), helmet, 0, 1.55, -0.02);
  g.add(head);
  // A HELMET, not a ball with a dark ball inside it. The visor is a band across
  // the front rather than a second sphere, and the peak above it is what makes
  // the silhouette read as headgear from behind — which is the only angle the
  // rider ever sees themselves from.
  const vis = part(new THREE.SphereGeometry(0.126, 14, 10, 0, Math.PI * 2, Math.PI * 0.30, Math.PI * 0.34),
    visor, 0, 1.556, 0.030, -0.20);
  g.add(vis);
  const peak = part(new THREE.BoxGeometry(0.20, 0.022, 0.10), helmet, 0, 1.606, 0.105, -0.28);
  g.add(peak);
  // neck, so the head is attached to something
  g.add(part(new THREE.CylinderGeometry(0.052, 0.058, 0.10, 8), skin, 0, 1.44, -0.035));
  // THE RIDER, POSED PROPERLY. The old figure was a torso capsule with two
  // detached limb capsules per side: from the saddle the legs floated clear of
  // the floorboard, the arms stopped short of the bars, and there was nothing
  // where a hand should be. Close up it read as parts near a scooter rather
  // than a person on one.
  //
  // Three joints per limb now — thigh, shin, foot ON THE FLOORBOARD, and upper
  // arm, forearm, hand ON THE GRIP — with each segment placed where the one
  // before it ends. Still capsules, still no textures, still no skinning: this
  // is the same handful of meshes arranged so they connect.
  const shoe = W.shoe;   // same trainers as on foot and on the board
  for (const sx of [-0.15, 0.15]) {
    // thigh runs forward and slightly down from the hip
    g.add(part(new THREE.CapsuleGeometry(0.088, 0.30, 4, 8), jeans, sx, 0.88, 0.09, Math.PI / 2.15));
    // shin drops from the knee to the floorboard
    g.add(part(new THREE.CapsuleGeometry(0.070, 0.26, 4, 8), jeans, sx, 0.60, 0.30, 0.30));
    // knee, so the two do not read as a broken stick
    g.add(part(new THREE.SphereGeometry(0.072, 8, 7), jeans, sx, 0.79, 0.27));
    // the foot SITS ON the floorboard, which is at y 0.30
    g.add(part(new THREE.BoxGeometry(0.11, 0.055, 0.24), shoe, sx, 0.355, 0.36));
    // upper arm out of the shoulder, forearm down to the bar
    g.add(part(new THREE.CapsuleGeometry(0.056, 0.24, 4, 8), shirt, sx * 1.55, 1.26, 0.22, Math.PI / 2.5));
    g.add(part(new THREE.CapsuleGeometry(0.048, 0.22, 4, 8), shirt, sx * 1.85, 1.16, 0.44, Math.PI / 2.9));
    g.add(part(new THREE.SphereGeometry(0.056, 8, 7), shirt, sx * 1.7, 1.24, 0.34));   // elbow
    // the hand CLOSES ON THE GRIP: the bar is at y 1.09, z 0.60, x +-0.30
    g.add(part(new THREE.SphereGeometry(0.052, 8, 7), skin, sx * 2.0, 1.10, 0.58));
  }
  // a collar, so the shirt reads as clothing rather than a plain capsule
  g.add(part(new THREE.CylinderGeometry(0.115, 0.135, 0.07, 10), shirt, 0, 1.38, -0.06));
  return g;
}


// THE SURF SKATE. A 34" carver: a wide deck with a kicked tail, a surf
// adapter on the front truck (the tall pivoting casting that is the whole
// reason the thing carves) and four fat 70mm wheels.
//
// TWO THINGS MAKE IT READ AS A SURF SKATE RATHER THAN A SKATEBOARD, and both
// are the front end. The front truck is TALLER than the rear and visibly
// hinged, and the deck is WIDE with a long nose. A plank on four wheels reads
// as a longboard; those two details are what a skater's eye picks up.
//
// Wheels are returned in the same shape the Vespa and the car use, so the one
// loop in main.js that spins them needs no new case. They are returned
// FRONT PAIR FIRST because the front truck also steers.
// How far each wheel sits from the board's centreline. Exported because
// main.js pivots the carve about the low wheel's contact patch and the two
// must not be able to disagree about where that patch is.
export const SKATE_WHEEL_X = 0.108;

export function buildSkate() {
  const g = new THREE.Group();
  const deckM = new THREE.MeshStandardMaterial({ color: 0x8d5a3b, roughness: 0.55 });   // stained maple
  const gripM = new THREE.MeshStandardMaterial({ color: 0x1e2024, roughness: 0.95 });   // grip tape
  const truckM = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.3, metalness: 0.8 });
  const wheelM = new THREE.MeshStandardMaterial({ color: 0xe7d9a8, roughness: 0.45 });  // amber urethane
  const boltM = new THREE.MeshStandardMaterial({ color: 0x5c6167, roughness: 0.4, metalness: 0.6 });
  const railM = new THREE.MeshStandardMaterial({ color: 0xc4442f, roughness: 0.5 });    // a painted stripe

  // DECK. Three slabs: the flat standing platform, a nose that rises, and a
  // kicked tail. Built as separate boxes with a tilt rather than a curve,
  // which is how every other shape in this file is made.
  const DECK_Y = 0.115;                       // top of the deck above the road
  g.add(part(new THREE.BoxGeometry(0.245, 0.028, 0.78), deckM, 0, DECK_Y, 0));
  g.add(part(new THREE.BoxGeometry(0.235, 0.006, 0.76), gripM, 0, DECK_Y + 0.017, 0));
  // nose and tail, kicked up at the ends
  g.add(part(new THREE.BoxGeometry(0.225, 0.026, 0.20), deckM, 0, DECK_Y + 0.035, 0.465, -0.36));
  g.add(part(new THREE.BoxGeometry(0.215, 0.006, 0.19), gripM, 0, DECK_Y + 0.051, 0.463, -0.36));
  g.add(part(new THREE.BoxGeometry(0.215, 0.026, 0.17), deckM, 0, DECK_Y + 0.030, -0.445, 0.34));
  g.add(part(new THREE.BoxGeometry(0.205, 0.006, 0.16), gripM, 0, DECK_Y + 0.046, -0.443, 0.34));
  // a painted rail down each edge of the underside, which is what you actually
  // see of a board from behind when it is up on edge in a carve
  for (const sx of [-0.108, 0.108]) {
    g.add(part(new THREE.BoxGeometry(0.028, 0.016, 0.74), railM, sx, DECK_Y - 0.020, 0));
  }

  const wheels = [];
  // FRONT truck first: taller, and carrying the surf adapter.
  for (const [wz, front] of [[0.295, true], [-0.285, false]]) {
    const baseY = front ? DECK_Y - 0.052 : DECK_Y - 0.030;
    // baseplate under the deck
    g.add(part(new THREE.BoxGeometry(0.115, 0.016, 0.085), truckM, 0, DECK_Y - 0.020, wz));
    if (front) {
      // THE SURF ADAPTER: a tall pivoting casting between baseplate and hanger.
      // This is the part that is not on a normal skateboard and it is the one
      // piece worth spending meshes on.
      g.add(part(new THREE.BoxGeometry(0.075, 0.062, 0.075), truckM, 0, DECK_Y - 0.058, wz - 0.012, 0.34));
      g.add(part(new THREE.CylinderGeometry(0.019, 0.019, 0.075, 8), boltM,
        0, DECK_Y - 0.062, wz + 0.028, Math.PI / 2.6, 0, 0));
    }
    // hanger: the cross-arm the wheels hang off
    g.add(part(new THREE.CylinderGeometry(0.022, 0.030, 0.185, 8), truckM,
      0, baseY - 0.026, wz, 0, 0, Math.PI / 2));
    // kingpin
    g.add(part(new THREE.CylinderGeometry(0.011, 0.011, 0.062, 6), boltM,
      0, baseY - 0.006, wz + (front ? -0.028 : 0.028), front ? -0.5 : 0.5, 0, 0));
    const pair = new THREE.Group();
    for (const sx of [-SKATE_WHEEL_X, SKATE_WHEEL_X]) {
      // 70mm wheel — fat and soft, which is what a surf skate rolls on
      pair.add(part(new THREE.CylinderGeometry(0.035, 0.035, 0.048, 12), wheelM, sx, 0, 0, 0, 0, Math.PI / 2));
      pair.add(part(new THREE.CylinderGeometry(0.014, 0.014, 0.052, 8), boltM, sx, 0, 0, 0, 0, Math.PI / 2));
    }
    pair.position.set(0, 0.035, wz);
    g.add(pair);
    wheels.push(pair);
  }
  return { group: g, wheels };
}

// THE SKATER, and none of buildRider() could be reused. That figure is SEATED:
// thighs forward to a floorboard, hands closed on a handlebar at y 1.09. A
// person on a board stands square across it with both knees bent and their
// arms out, and posing the seated rig into that was more work than one honest
// standing figure. Same materials, same capsule vocabulary.
//
// The stance is REGULAR (left foot forward) and the shoulders are open to the
// nose of the board, which is the line a surfer takes. Feet sit ACROSS the
// deck over the trucks, not along it — that is the thing that would read wrong
// immediately to anyone who skates.
// LIMBS ARE PLACED BY THEIR TWO ENDS, NOT BY EULER ANGLES.
//
// The first version of the skater posed every segment with hand-guessed
// (rx, ry, rz) triples the way buildRider does, and it did not survive its own
// vet frame: the arms came out as four disconnected flippers with the hand
// spheres floating clear of the forearms. Euler triples are workable for a
// SEATED figure whose limbs run along one axis at a time — which is the whole
// reason buildRider gets away with them — and hopeless for a standing figure
// whose arms are out at a compound angle.
//
// `bone` takes the two endpoints and derives the orientation, so a segment
// cannot be disconnected from the joint it starts at: the joint positions are
// the single source of truth and every piece is built from them.
function bone(a, b, r, mat) {
  const ax = b[0] - a[0], ay = b[1] - a[1], az = b[2] - a[2];
  const L = Math.hypot(ax, ay, az) || 1e-6;
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 4, 8), mat);
  m.position.set(a[0] + ax / 2, a[1] + ay / 2, a[2] + az / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(ax / L, ay / L, az / L));
  m.castShadow = true;
  return m;
}

export function buildSkater() {
  const g = new THREE.Group();
  // ONE WARDROBE — see src/wardrobe.js. These colours are the reference the
  // walker and the rider now match; the one thing this figure was MISSING is
  // hair, so the head under the cap was a bald scalp while the walker had a
  // full head of it.
  const W = wardrobeMats(THREE);
  const shirt = W.shirt, shorts = W.legs, skin = W.skin, cap = W.cap, shoe = W.shoe;

  // EVERY JOINT, ONCE. The board's nose is +z and the deck top is y 0.16.
  // Regular stance: left foot forward, shoulders open toward the nose, both
  // knees bent, arms out. Change a number here and the limbs follow.
  const J = {
    ankleF: [0.035, 0.205, 0.280], kneeF: [0.140, 0.505, 0.300], hipF: [0.085, 0.775, 0.070],
    ankleB: [-0.035, 0.205, -0.265], kneeB: [-0.130, 0.485, -0.155], hipB: [-0.085, 0.775, 0.000],
    pelvis: [0.000, 0.800, 0.035], chest: [0.010, 1.165, 0.080], neck: [0.010, 1.235, 0.090],
    // ARMS DOWN INTO A CRUISE, NOT OUT INTO A T.
    //
    // These were 0.095m of elbow drop and 0.18m of hand drop across a 0.26m
    // reach — about thirty degrees below the shoulder. That is a defensible
    // balancing pose in a side view and it is NOT what the player sees: the
    // chase camera sits behind and slightly above, and from there arms at
    // near-shoulder height read as a T-pose, which is the single most visible
    // thing in the game because it is on screen in every frame.
    //
    // Dropped ~14cm and pulled in, so the front arm hangs forward across the
    // nose and the back arm trails low. Same skater silhouette from the side,
    // a person instead of a scarecrow from behind.
    shldrF: [0.170, 1.140, 0.115], elbowF: [0.318, 0.975, 0.255], handF: [0.372, 0.815, 0.405],
    shldrB: [-0.155, 1.135, 0.045], elbowB: [-0.322, 0.990, -0.070], handB: [-0.398, 0.848, -0.232],
    head: [0.010, 1.350, 0.105],
  };
  // FEET, across the deck and over the trucks. A skater's feet run ACROSS the
  // board, not along it — get this wrong and it reads instantly as a person
  // standing on a plank.
  g.add(part(new THREE.BoxGeometry(0.240, 0.058, 0.108), shoe,
    J.ankleF[0], J.ankleF[1] - 0.030, J.ankleF[2], 0, 0.26, 0));
  g.add(part(new THREE.BoxGeometry(0.220, 0.058, 0.104), shoe,
    J.ankleB[0], J.ankleB[1] - 0.030, J.ankleB[2], 0, -0.12, 0));
  // LEGS
  g.add(bone(J.ankleF, J.kneeF, 0.058, shorts));
  g.add(bone(J.kneeF, J.hipF, 0.072, shorts));
  g.add(bone(J.ankleB, J.kneeB, 0.058, shorts));
  g.add(bone(J.kneeB, J.hipB, 0.072, shorts));
  for (const k of ['kneeF', 'kneeB']) g.add(part(new THREE.SphereGeometry(0.064, 8, 7), shorts, ...J[k]));
  // HIPS and TORSO
  g.add(bone(J.hipB, J.hipF, 0.098, shorts));
  g.add(bone(J.pelvis, J.chest, 0.145, shirt));
  g.add(bone(J.shldrB, J.shldrF, 0.098, shirt));
  g.add(bone(J.chest, J.neck, 0.060, skin));
  // ARMS OUT, which is what balancing on a board looks like and what makes the
  // silhouette read as a skater rather than a person standing very still. The
  // front arm reaches across the nose and the back arm trails — a surfer's line.
  g.add(bone(J.shldrF, J.elbowF, 0.050, shirt));
  g.add(bone(J.elbowF, J.handF, 0.043, shirt));
  g.add(bone(J.shldrB, J.elbowB, 0.050, shirt));
  g.add(bone(J.elbowB, J.handB, 0.043, shirt));
  for (const k of ['elbowF', 'elbowB']) g.add(part(new THREE.SphereGeometry(0.052, 8, 7), shirt, ...J[k]));
  for (const k of ['handF', 'handB']) g.add(part(new THREE.SphereGeometry(0.050, 8, 7), skin, ...J[k]));
  // HEAD, looking where the board is going
  g.add(part(new THREE.SphereGeometry(0.128, 14, 12), skin, ...J.head));
  // HAIR under the cap. Without it this head was a bald scalp with a cap
  // balanced on top while the walker — the same person, ten metres away — had
  // a full head of dark hair.
  //
  // A HEMISPHERE, NOT A BALL. The first attempt used full spheres slightly
  // larger than the 0.128 head, centred on it, which enclosed the whole skull:
  // the vet sheet came back with the face blacked out under a helmet of hair.
  // The dome is capped at the equator so the hairline sits where a hairline
  // sits, and the back mass is pushed behind the skull rather than around it.
  g.add(part(new THREE.SphereGeometry(0.133, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), W.hair,
    J.head[0], J.head[1] + 0.004, J.head[2] - 0.010, -0.14));
  g.add(part(new THREE.SphereGeometry(0.088, 12, 10), W.hair,
    J.head[0], J.head[1] - 0.018, J.head[2] - 0.086));
  g.add(part(new THREE.SphereGeometry(0.138, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), cap,
    J.head[0], J.head[1] + 0.008, J.head[2] - 0.004, -0.14));
  g.add(part(new THREE.BoxGeometry(0.185, 0.020, 0.100), cap,
    J.head[0], J.head[1] - 0.018, J.head[2] + 0.120, -0.18));    // peak
  return g;
}


// A compact car in the same procedural spirit: one friendly hatchback, warm
// red over cream, wheels returned like the Vespa's so the loop spins them
// the same way. The rider disappears inside — the windows are tinted enough
// that no interior needs to exist.
export function buildCar() {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: 0xb8453c, roughness: 0.32, metalness: 0.28 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xe8e2d2, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x25282c, roughness: 0.85 });
  const glassT = new THREE.MeshStandardMaterial({ color: 0x394650, roughness: 0.12, metalness: 0.2 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xc6cace, roughness: 0.22, metalness: 0.85 });

  // body: low box with a rounded-read cabin set back
  g.add(part(new THREE.BoxGeometry(1.68, 0.52, 3.95), paint, 0, 0.58, 0));
  g.add(part(new THREE.BoxGeometry(1.52, 0.46, 2.0), paint, 0, 1.06, -0.25));
  // glass band around the cabin
  g.add(part(new THREE.BoxGeometry(1.54, 0.34, 2.06), glassT, 0, 1.10, -0.25));
  // bonnet step + cream bumpers
  g.add(part(new THREE.BoxGeometry(1.6, 0.16, 0.5), paint, 0, 0.9, 1.55));
  g.add(part(new THREE.BoxGeometry(1.7, 0.14, 0.18), trim, 0, 0.38, 1.98));
  g.add(part(new THREE.BoxGeometry(1.7, 0.14, 0.18), trim, 0, 0.38, -1.98));
  // THE RIDER'S OWN CAR GETS THE SAME TREATMENT THE TRAFFIC GOT. It is drawn
  // ONCE, not per instance, so a handful of extra pieces here is the cheapest
  // detail in the whole world — and it is the vehicle the rider looks at most
  // after the scooter.
  //
  // Lit lamps rather than chrome discs: a chrome cylinder reads as a bolt head
  // at any distance, and the traffic's lamps are lit, so an unlit player car
  // looked switched off in its own street.
  const lampM = new THREE.MeshStandardMaterial({
    color: 0xfff4dc, emissive: 0xffe9b8, emissiveIntensity: 0.9, roughness: 0.3 });
  const tailM = new THREE.MeshStandardMaterial({
    color: 0x8c1a17, emissive: 0xd83a2c, emissiveIntensity: 0.75, roughness: 0.35 });
  for (const sx of [-0.55, 0.55]) {
    g.add(part(new THREE.BoxGeometry(0.40, 0.15, 0.08), lampM, sx, 0.70, 1.99));
    g.add(part(new THREE.BoxGeometry(0.34, 0.16, 0.08), tailM, sx, 0.74, -1.99));
    // wing mirrors, which is what tells you a box is a car at a glance
    g.add(part(new THREE.BoxGeometry(0.18, 0.09, 0.08), trim, sx * 1.68, 1.02, 0.62));
  }
  // raked windscreen and backlight, so the cabin is not a floating glass slab
  g.add(part(new THREE.BoxGeometry(1.50, 0.44, 0.08), glassT, 0, 1.10, 0.80, -0.55));
  g.add(part(new THREE.BoxGeometry(1.46, 0.40, 0.08), glassT, 0, 1.10, -1.28, 0.62));
  // a dark sill under the doors: it grounds the body and hides the gap the
  // wheels leave, the same trick the traffic uses
  g.add(part(new THREE.BoxGeometry(1.72, 0.22, 3.98), rubber, 0, 0.36, 0));
  // a thin painted roof cap over the glass band
  g.add(part(new THREE.BoxGeometry(1.48, 0.08, 1.92), paint, 0, 1.31, -0.25));

  const wheels = [];
  for (const [wx, wz] of [[-0.78, 1.31], [0.78, 1.31], [-0.78, -1.31], [0.78, -1.31]]) {
    const w = part(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 14), rubber, wx, 0.33, wz, 0, 0, Math.PI / 2);
    g.add(w);
    wheels.push(w);
    // a pale hub so the wheel reads as a wheel and not a black hole
    g.add(part(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 10), chrome, wx, 0.33, wz, 0, 0, Math.PI / 2));
  }
  return { group: g, wheels };
}
