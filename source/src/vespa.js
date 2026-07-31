// Vespa: procedural model plus a small, pure ride model.
// The physics deliberately touches no three.js types so it can be asserted in
// Node without a browser.
import * as THREE from '../lib/three.module.js';

export { RIDE, CAR, newState, step, turnRadius } from './ride.js';

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
  const shirt = new THREE.MeshLambertMaterial({ color: 0xc9553f });
  const jeans = new THREE.MeshLambertMaterial({ color: 0x38414f });
  const skin = new THREE.MeshLambertMaterial({ color: 0x8a6a52 });
  const helmet = new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.3, metalness: 0.1 });
  const visor = new THREE.MeshStandardMaterial({ color: 0x2a3138, roughness: 0.1, metalness: 0.3 });

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
  // thighs forward, shins down: the seated scooter pose
  for (const sx of [-0.13, 0.13]) {
    g.add(part(new THREE.CapsuleGeometry(0.085, 0.30, 4, 8), jeans, sx, 0.90, 0.10, Math.PI / 2.3));
    g.add(part(new THREE.CapsuleGeometry(0.072, 0.28, 4, 8), jeans, sx, 0.58, 0.30, 0.22));
    g.add(part(new THREE.SphereGeometry(0.062, 8, 7), jeans, sx, 0.36, 0.34));
    // arms reaching to the bars
    g.add(part(new THREE.CapsuleGeometry(0.055, 0.40, 4, 8), shirt, sx * 1.7, 1.20, 0.26, Math.PI / 2.6));
    g.add(part(new THREE.SphereGeometry(0.05, 8, 7), skin, sx * 2.3, 1.09, 0.56));
  }
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
