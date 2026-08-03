// The details that make a street read as Singapore rather than generic Asia:
// an ERP gantry, an overhead pedestrian bridge, a planted central median,
// banner-hung lamp posts, a taxi stand, and building signage.
//
// No brand marks anywhere: signage is colour and form only.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance, rng, SignAtlas } from './tex.js';
// surfaceAt, NOT groundAt. Everything this file places stands on the ROAD, and
// the road is not the terrain: it is drawn 6cm above it, and where a bridge
// crosses it is the DECK, which can be metres above the ground. Using groundAt
// put 119 median kerbs on the Bayfront bridge 1.7m below the deck they belong
// to — the same two-numbers trap that had the bike riding 5.5cm under the road
// for the whole project, one storey up. surfaceAt() answers both cases and is
// the single function main.js already uses for the ride and the walker.
import { MAT, groundAt, surfaceAt, Merger, standable, addWalkSurface } from './city.js';
import { recipeFor } from './landmarks.js';

const SIGN_COLS = [0xb5372e, 0x1f4f7a, 0xd6a53c, 0x2f6b4f, 0x7a3f6d,
                   0xcf6b3a, 0x2b2f33, 0xa8324f, 0x3d6f8f];
const BANNER_COLS = [0xb23a2e, 0x2f6b8f, 0xd0a03a, 0x357a55, 0x8a3f70];

function yawMesh(geo, mat, x, y, z, ang) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = ang;
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// The tray a sign board sits in: pale grey aluminium, seen from behind.
const SIGN_TRAY = new THREE.MeshStandardMaterial({
  color: 0x9aa0a6, roughness: 0.55, metalness: 0.25,
});

/* ---------------- ERP gantry ---------------- */
// Two portal legs, a deep beam, the antenna heads and the camera box. Nothing
// else on a Singapore road looks like this.
function erpGantry(world, px, pz, ang, width, surveyed = false) {
  const g = new THREE.Group();
  const steel = MAT.metal, dark = MAT.darkMetal;

  // THE SPAN IS SURVEYED. THE LEG REACH IS NOT.
  //
  // LTA's line spans the CHARGED LANES, and a road is often wider than that —
  // a bus lane, a slip road, the flare into a junction. Planting the legs at a
  // fixed span/2 + 1.2 put 6 of 30 columns in live traffic. So the centre and
  // the bearing, which are real data, are kept exactly, and the only number
  // that was ever a construction detail is searched outward until both legs
  // stand clear. If nine metres of reach is not enough, nothing is built:
  // a failed search must skip, never fall back to the value it was asked to fix.
  let half = width / 2 + 1.2;
  if (window.__onRoad) {
    const legClear = (h) => ![-1, 1].every((sgn) => {
      const lx = px + Math.cos(ang) * sgn * h, lz = pz - Math.sin(ang) * sgn * h;
      return !window.__onRoad(lx, lz, 0);
    });
    if (legClear(half)) {
      let found = 0;
      for (let h = half + 0.4; h <= width / 2 + 9; h += 0.4) {
        if (!legClear(h)) { found = h; break; }
      }
      if (!found) return;
      half = found;
    }
  }
  // the beam has to reach whatever the legs did
  width = Math.max(width, half * 2 - 2.4);

  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.CylinderGeometry(0.22, 0.28, 7.4, 10), steel, sgn * half, 3.7, 0, 0));
    g.add(yawMesh(new THREE.BoxGeometry(1.2, 0.35, 1.2), MAT.conc, sgn * half, 0.18, 0, 0));
  }
  // main beam plus a lower service beam
  g.add(yawMesh(new THREE.BoxGeometry(width + 2.8, 0.85, 0.55), steel, 0, 7.2, 0, 0));
  g.add(yawMesh(new THREE.BoxGeometry(width + 2.8, 0.28, 0.32), steel, 0, 6.4, 0, 0));
  // antenna heads over each lane, angled down at the traffic
  const lanes = Math.max(3, Math.round(width / 3.4));
  for (let i = 0; i < lanes; i++) {
    const lx = -width / 2 + (i + 0.5) * (width / lanes);
    const head = yawMesh(new THREE.BoxGeometry(0.62, 0.3, 0.85), dark, lx, 6.75, 0.5, 0);
    head.rotation.x = 0.42;
    g.add(head);
  }
  // camera housings and the amber warning panel
  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.BoxGeometry(0.4, 0.4, 0.75), dark, sgn * (half - 1.4), 6.9, -0.5, 0));
  }
  const panel = yawMesh(new THREE.BoxGeometry(2.4, 0.9, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1c1f22, emissive: 0xc98a1e, emissiveIntensity: 0.55 }),
    0, 8.1, 0.1, 0);
  g.add(panel);

  // A SURVEYED gantry is not nudged. Every other structure here is pushed clear
  // of the carriageway, because its position came from a rule and a rule can put
  // it in the traffic. A gantry's whole job is to span the carriageway, and its
  // position now comes from LTA's own line across it: pushing that one 18m to
  // the kerb would take real data and make it wrong. Its legs stand at
  // width/2 + 1.2, which is outside the road by construction.
  let px2 = px, pz2 = pz;
  if (!surveyed) {
    const mv2 = window.__pushClear ? window.__pushClear(px, pz, -0.6, 18) : [px, pz];
    if (!mv2) return;
    [px2, pz2] = mv2;
  }
  g.position.set(px2, surfaceAt(px2, pz2), pz2);
  g.rotation.y = ang;
  world.add(g);
}

/* ---------------- overhead pedestrian bridge ---------------- */
function pedBridge(world, px, pz, ang, width) {
  const steel = MAT.metal, deck = MAT.conc;

  // WHERE IT STANDS IS DECIDED BEFORE ANYTHING IS BUILT.
  //
  // This used to build the whole bridge in local space and only then ask
  // pushClear where to put it, which meant the stair towers were laid out at a
  // fixed span/2 - 1.0 with nothing knowing what was underneath them. Eight of
  // them stood in live traffic. The deck over the road is correct -- that is
  // what an overpass IS, and P1b exempts it by signature -- but a stair tower
  // is the part that meets the ground, and it belongs on a pavement.
  // A BRIDGE IS NOT NUDGED. Its position is surveyed, and the caller has
  // already checked that the MAPPED LINE crosses a carriageway or water. Running
  // it through pushClear moved the deck up to 18m, which slid it off the very
  // thing it was built to span: D15 reported three decks spanning nothing while
  // the caller was satisfied, because the two were looking at different points.
  // A bridge that cannot be built where it is should not be built elsewhere.
  const px2 = px, pz2 = pz;

  const g = new THREE.Group();
  const ca = Math.cos(ang), sa = Math.sin(ang);
  // local (x along the span, z across it) -> world
  const wx = (lx, lz) => px2 + lx * ca + lz * sa;
  const wz = (lx, lz) => pz2 - lx * sa + lz * ca;

  // Walk each tower OUTWARD along the span until its own footprint is clear,
  // and take the DECK out to meet it. Extending the bridge is the honest
  // repair: a stair that stops short of the pavement is not a stair, and
  // pulling the towers in instead would leave the deck ending over the road.
  // The tower is 2.6 x 2.8 centred 3.2m off the deck line, so it is tested at
  // its own corners rather than at one point -- the same mistake as the canopy
  // posts and the shopfront bays before them.
  const span0 = width + 14;
  const base = span0 / 2 - 1.0;
  const reachOf = {};
  if (window.__onRoad) {
    const clearAt = (d, sgn) => {
      for (const ox of [-1.5, 0, 1.5])
        for (const oz of [1.8, 3.2, 4.6]) {
          const lz = sgn * oz;
          if (window.__onRoad(wx(d * sgn + ox, lz), wz(d * sgn + ox, lz), 0.4)) return false;
        }
      return true;
    };
    // PER END, not one reach for both. A bridge often has pavement on one side
    // and a slip road on the other, and forcing symmetry pushed the good end
    // out to match the bad one.
    //
    // And when an end never clears, it keeps its ORIGINAL reach. The first
    // version left it at the largest distance tried, which extends the deck and
    // its 92m parapet across MORE road than it started with -- a fallback that
    // returns something worse than the value it was asked to fix, which is
    // pattern #1 in NEXT.md and is how this bridge got here in the first place.
    // Search BOTH ways from the mapped end, nearest offset first, and only
    // within 10m of it. span0 IS the surveyed straight length of the OSM way,
    // so its ends are where the real bridge lands and anything past them is
    // bridge we are inventing: two of these cross DUAL carriageways (New Bridge
    // Road plus Eu Tong Sen Street 20m away) and would need 36m and 43m of
    // extension, which would give a 37.8m mapped bridge an 88m deck.
    //
    // Both ways, because searching only outward dropped all 15 bridges. The
    // clear ground on several is INBOARD: they cross the Singapore River at
    // Boat Quay, so it is their ENDS that come down beside a road, not their
    // middles. A stair tower a little short of the mapped end is what a ramp
    // does anyway.
    for (const sgn of [-1, 1]) {
      reachOf[sgn] = null;
      const tries = [];
      for (let k = 0; k <= 10; k += 1) { tries.push(base + k); if (k) tries.push(base - k); }
      tries.sort((p2, q2) => Math.abs(p2 - base) - Math.abs(q2 - base));
      for (const d of tries) {
        if (d < 6) continue;                  // a deck shorter than this is not a bridge
        if (clearAt(d, sgn)) { reachOf[sgn] = d; break; }
      }
    }
    // A footbridge whose stairs stand in live traffic is worse than no
    // footbridge. Same rule this file already applies to bus shelters, MRT
    // entrances and the cab at a taxi rank: a failed search skips.
    if (reachOf[-1] === null || reachOf[1] === null) return false;
  } else { reachOf[-1] = base; reachOf[1] = base; }
  const span = Math.max(span0, (reachOf[-1] + 1.3) * 2, (reachOf[1] + 1.3) * 2);

  g.add(yawMesh(new THREE.BoxGeometry(span, 0.42, 2.6), deck, 0, 6.0, 0, 0));
  g.add(yawMesh(new THREE.BoxGeometry(span, 0.16, 3.0), MAT.trim, 0, 8.6, 0, 0));   // roof
  // parapets and roof posts
  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.BoxGeometry(span, 1.05, 0.1), steel, 0, 6.75, sgn * 1.3, 0));
    for (let i = 0; i <= 10; i++) {
      const x = -span / 2 + (i / 10) * span;
      g.add(yawMesh(new THREE.CylinderGeometry(0.055, 0.055, 2.4, 6), steel, x, 7.4, sgn * 1.3, 0));
    }
  }
  for (const sgn of [-1, 1]) {
    const sx = sgn * reachOf[sgn];
    g.add(yawMesh(new THREE.BoxGeometry(2.6, 6.0, 2.8), deck, sx, 3.0, sgn * 3.2, 0));
    for (let s = 0; s < 12; s++) {
      g.add(yawMesh(new THREE.BoxGeometry(2.2, 0.16, 0.34), deck,
        sx, 0.5 + s * 0.46, sgn * (1.9 + s * 0.2), 0));
    }
  }
  g.position.set(px2, surfaceAt(px2, pz2), pz2);
  g.rotation.y = ang;
  world.add(g);
  return true;
}

/* ---------------- MRT entrance ---------------- */
// A glazed canopy over a stair going down, the blue-and-red station totem, and
// a railed opening. Every Singaporean recognises this from fifty metres.
function mrtEntrance(world, px, pz, ang, label) {
  const g = new THREE.Group();
  const steel = MAT.metal, conc = MAT.conc;
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xa8c0cf, roughness: 0.12, metalness: 0.25,
    transparent: true, opacity: 0.62, side: THREE.DoubleSide,
  });

  // the opening in the pavement, with a stair running down into it
  g.add(yawMesh(new THREE.BoxGeometry(7.4, 0.4, 5.2), conc, 0, -0.2, 0, 0));
  for (let k = 0; k < 9; k++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.17, 0.42), conc);
    st.position.set(0, -0.28 - k * 0.17, -1.6 + k * 0.42);
    st.receiveShadow = true; g.add(st);
  }
  // a dark void under the canopy so it reads as going somewhere
  g.add(yawMesh(new THREE.BoxGeometry(4.8, 0.1, 3.2),
    new THREE.MeshBasicMaterial({ color: 0x0d1114 }), 0, -1.9, 1.4, 0));

  // railed edges around three sides
  for (const sgn of [-1, 1]) {
    g.add(yawMesh(new THREE.BoxGeometry(0.07, 0.05, 5.0), steel, sgn * 2.6, 1.05, 0, 0));
    g.add(yawMesh(new THREE.BoxGeometry(0.06, 0.04, 5.0), steel, sgn * 2.6, 0.66, 0, 0));
    for (let k = 0; k < 4; k++) {
      g.add(yawMesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 6), steel,
        sgn * 2.6, 0.52, -2.2 + k * 1.5, 0));
    }
  }

  // the curved glass canopy
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 6.6, 16, 1, true, Math.PI * 0.08, Math.PI * 0.84),
    glassMat);
  // Marked, so a check can find an MRT canopy by IDENTITY. D14 matched it by
  // shape -- an open-ended cylinder of radius 1.6 to 3.2 -- which this shell
  // (radius 3.5) never satisfied, so the check has never once looked at an MRT
  // canopy. What it WAS reporting, once Marina Bay landed, were Supertree
  // trunk sleeves and the observatory ring, which happen to fit that
  // description. Pattern #6 in NEXT.md: a signature rule is exempt by omission
  // until a new shape wanders into it.
  shell.userData.mrtCanopy = true;
  shell.rotation.z = Math.PI / 2;
  shell.position.set(0, 2.5, 0);
  shell.castShadow = true;
  g.add(shell);
  for (let k = 0; k <= 5; k++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.05, 5, 12, Math.PI * 0.84), steel);
    rib.rotation.y = Math.PI / 2;
    rib.rotation.z = Math.PI * 0.08;
    rib.position.set(-3.3 + k * 1.32, 2.5, 0);
    g.add(rib);
  }

  // the station totem: red over blue, with the station name
  const totem = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.3, 1.05), MAT.darkMetal);
  totem.position.set(4.3, 1.65, 0); totem.castShadow = true; g.add(totem);
  const faceTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 400;
    const x = c.getContext('2d');
    x.fillStyle = '#c8102e'; x.fillRect(0, 0, 128, 130);
    x.fillStyle = '#00358e'; x.fillRect(0, 130, 128, 270);
    x.fillStyle = '#ffffff';
    x.font = '700 30px ui-sans-serif, system-ui, Helvetica, Arial';
    x.textAlign = 'center';
    x.fillText('MRT', 64, 82);
    x.save(); x.translate(64, 265); x.rotate(-Math.PI / 2);
    let size = 30;
    do { x.font = `600 ${size}px ui-sans-serif, system-ui, Helvetica, Arial`; size -= 2; }
    while (x.measureText(label.toUpperCase()).width > 230 && size > 12);
    x.fillText(label.toUpperCase(), 0, 8);
    x.restore();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  for (const sgn of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 3.15),
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 }));
    face.position.set(4.3 + sgn * 0.18, 1.65, 0);
    face.rotation.y = sgn > 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(face);
  }

  // real OSM coordinate, often mapped on the kerb line: nudge it clear of the
  // carriageway rather than dropping a shelter into the traffic
  const mv2 = window.__pushClear ? window.__pushClear(px, pz, -0.6, 18) : [px, pz];
  if (!mv2) return;
  let [px2, pz2] = mv2;

  // CLEARING THE ORIGIN DOES NOT CLEAR THE STRUCTURE. An entrance is five
  // metres wide with a railed balustrade standing at ±2.6m from its centre, and
  // pushClear only ever moved the centre — so an entrance sitting neatly beside
  // the kerb put its rail posts in the carriageway. Little India's day-one
  // audit found six of them in BIRCH ROAD, which is exactly the finding that
  // city.js already fixed for entrance-canopy posts: "the posts stand at the
  // ends of that width, and clearance.outward only checked the projection
  // straight out from the middle".
  //
  // Test where the rails ACTUALLY STAND, walk the whole thing further from the
  // road if they are not clear, and if no offset works, build nothing. A failed
  // search skips; it does not substitute.
  const ca2 = Math.cos(ang), sa2 = Math.sin(ang);
  const railsClear = (ox, oz) => {
    if (!window.__onRoad) return true;
    for (const lx of [-2.6, 2.6]) {
      for (const lz of [-2.2, 0, 2.3]) {
        const wx = ox + lx * ca2 + lz * sa2;
        const wz = oz - lx * sa2 + lz * ca2;
        if (window.__onRoad(wx, wz, 0.2)) return false;
      }
    }
    return true;
  };
  if (!railsClear(px2, pz2)) {
    // straight back from the road it was pushed off, which is the direction
    // pushClear already chose for us
    const bx = px2 - px, bz = pz2 - pz;
    const bl = Math.hypot(bx, bz) || 0;
    const ux2 = bl > 0.01 ? bx / bl : Math.sin(ang), uz2 = bl > 0.01 ? bz / bl : Math.cos(ang);
    let placed = false;
    for (const extra of [1.6, 2.8, 4.0, 5.4]) {
      const cx2 = px2 + ux2 * extra, cz2 = pz2 + uz2 * extra;
      if (railsClear(cx2, cz2)) { px2 = cx2; pz2 = cz2; placed = true; break; }
    }
    if (!placed) return;
  }

  g.position.set(px2, surfaceAt(px2, pz2), pz2);
  g.rotation.y = ang;
  world.add(g);
}

/* ---------------- main placement pass ---------------- */
export async function buildSgDetail(world, axis, data, isBlocked, Y = null) {
  const atlas = new SignAtlas(THREE);
  const signs = new Merger();
  // time-gated yield shared by every outer pass below — this whole builder
  // was one synchronous gulp (the 'sg' step's 460ms block, 2026-08-03)
  let _yt = performance.now();
  const YY = async () => { if (Y && performance.now() - _yt > 8) { await Y(); _yt = performance.now(); } };
  // WHERE THE STREET IS ACTUALLY DIVIDED.
  //
  // This used to treat ANY one-way primary/secondary/trunk/tertiary way as a
  // dual carriageway, then call it a median anywhere within 26m. Orchard Road
  // is a one-way primary, so it matched ITSELF at distance zero and got a
  // planted central divider down all 2,586m of it: 506 kerbs, 221 shrubs and 29
  // palms, 43% of every piece of median furniture in the world, running down
  // the middle of a five-lane street where every lane goes the same way. There
  // is nothing to divide. The user found it by riding.
  //
  // A dual carriageway is a PAIR: two one-way ways of the same name running
  // ANTI-PARALLEL a few tens of metres apart. Measured against that definition,
  // Orchard Road has 9 divided segments out of 103 and Bras Basah Road has 0,
  // while River Valley Road (85/87), Killiney Road (82/88), Grange Road,
  // Victoria Street, Hill Street, Paterson Road and Scotts Road genuinely are
  // divided along most of their length.
  //
  // Fourth time `oneway=` has been read wrongly: it sat unused while traffic
  // spawned head-on, and now it has been over-read in the other direction.
  //
  // And the median goes BETWEEN the pair, not on either centreline. Placing it
  // at the axis point put planters in a live lane even where the division was
  // real.
  const DUAL_K = ['primary', 'secondary', 'trunk', 'tertiary'];
  const owSegs = [];
  for (const r of (data.roads || [])) {
    if (!r.oneway || !DUAL_K.includes(r.k)) continue;
    const P = r.p;
    for (let i = 0; i < P.length - 1; i++) {
      const L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
      if (L < 1) continue;
      owSegs.push({ a: P[i], b: P[i + 1], ux: (P[i + 1][0] - P[i][0]) / L,
                    uz: (P[i + 1][1] - P[i][1]) / L, n: r.n || null,
                    mx: (P[i][0] + P[i + 1][0]) / 2, mz: (P[i][1] + P[i + 1][1]) / 2 });
    }
  }
  // the median line itself: the midpoint between each anti-parallel same-name pair
  // Bucketed by name: the inner loop only ever accepted s2 of the SAME name,
  // so scanning that name's own list — in original owSegs order, first match
  // wins exactly as before — is result-identical and kills the O(segs²) scan
  // that made this the 'sg' step's 460ms block (orchard: 3,019 roads).
  const owByName = new Map();
  for (const s of owSegs) {
    if (!s.n) continue;
    if (!owByName.has(s.n)) owByName.set(s.n, []);
    owByName.get(s.n).push(s);
  }
  const medianPts = [];
  for (const s1 of owSegs) {
    if (!s1.n) continue;
    for (const s2 of owByName.get(s1.n)) {
      const d = Math.hypot(s1.mx - s2.mx, s1.mz - s2.mz);
      if (d < 6 || d > 50) continue;
      if (s1.ux * s2.ux + s1.uz * s2.uz > -0.7) continue;   // must oppose
      // THE MIDPOINT MUST NOT BE ON TARMAC. The pair test measures
      // centreline distance and never subtracts the halves' widths, so two
      // wide halves 15m apart have no physical gap and the median kerbs
      // and slabs stood in the Grange Road traffic lanes (sweep-2 202/207/
      // 208/211, probed: 0.38x0.3x4 kerb bars and a 2.1x0.34x3 slab at
      // road height). A real median gap is the one place between two
      // carriageways the road index calls clear.
      const mmx = (s1.mx + s2.mx) / 2, mmz = (s1.mz + s2.mz) / 2;
      if (window.__onRoad && window.__onRoad(mmx, mmz, -0.35)) continue;
      medianPts.push([mmx, mmz, Math.atan2(s1.ux, s1.uz)]);
      break;
    }
  }
  window.__dualSegs = medianPts.length;

  // direction of the road nearest a point, so things placed off the main axis
  // are still square to the street they belong to
  const nearestRoadDir = (x, z) => {
    let bd = Infinity, dir = [0, 1];
    for (const r of (data.roads || [])) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      const q2 = r.p;
      for (let i = 0; i < q2.length - 1; i++) {
        const [x1, z1] = q2[i], [x2, z2] = q2[i + 1];
        const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
        let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
        t = Math.max(0, Math.min(1, t));
        const d = (x - (x1 + vx * t)) ** 2 + (z - (z1 + vz * t)) ** 2;
        if (d < bd) { bd = d; dir = [vx, vz]; }
      }
    }
    return dir;
  };

  // Is there any road within `m` metres? Used by the MRT siting below, which
  // must not judge an entrance by its distance from the MAIN STREET in a
  // district whose main street is not where the stations are.
  const nearAnyRoad = (x, z, m) => {
    const m2 = m * m;
    for (const r of (data.roads || [])) {
      const q = r.p;
      if (!q || q.length < 2) continue;
      for (let i = 0; i + 1 < q.length; i++) {
        const ax = q[i][0], az = q[i][1], bx = q[i + 1][0], bz = q[i + 1][1];
        if (Math.min(ax, bx) - m > x || Math.max(ax, bx) + m < x) continue;
        if (Math.min(az, bz) - m > z || Math.max(az, bz) + m < z) continue;
        const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz;
        if (L2 < 1e-9) continue;
        let t = ((x - ax) * vx + (z - az) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const dx = x - (ax + vx * t), dz = z - (az + vz * t);
        if (dx * dx + dz * dz < m2) return true;
      }
    }
    return false;
  };

  // MRT entrances at the coordinates OSM records for them, rather than at two
  // arbitrary points along the street.
  let realMrt = 0, droppedMrt = 0, farFromAxis = 0;
  for (const m of (data.mrt || [])) {
    await YY();
    // A STATION IS NOT AN ENTRANCE, and declining it silently is what made
    // A2 call this layer unread. Sentosa's three `mrt` records are all
    // `kind: "station"` — Sentosa Express monorail stops, which have no
    // subway entrance to draw — so the loop skipped all three and left
    // realMrt and droppedMrt both at zero, which is indistinguishable from
    // never having looked. Counted as dropped: the layer WAS read and the
    // records were correctly declined.
    if (m.kind !== 'subway_entrance') { droppedMrt++; continue; }
    const [mx, mz] = m.p;
    let bi = 0, bd = Infinity, bt = 0;
    const P = axis.p;
    for (let i = 0; i < P.length - 1; i++) {
      const [x1, z1] = P[i], [x2, z2] = P[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((mx - x1) * vx + (mz - z1) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const d = (mx - (x1 + vx * t)) ** 2 + (mz - (z1 + vz * t)) ** 2;
      if (d < bd) { bd = d; bi = i; bt = t; }
    }
    // Entrances up to the edge of the dressed area, not just the ones on the
    // main street: Dhoby Ghaut and Somerset put exits a long way down the side
    // roads, and they are real places you ride past.
    //
    // ...AND THE AXIS IS THE WRONG THING TO MEASURE AGAINST IN A DISTRICT THAT
    // IS NOT ITS MAIN STREET. This was a bare `> 230 from the axis` test, which
    // works where the district IS the road (Orchard) and fails completely
    // where it is not: marinaeast's axis is 851m of Marina East Drive, and all
    // FIVE of its surveyed entrances — real Bayfront and Gardens by the Bay
    // exits — sit further than 230m from it and were dropped. A2 caught it as
    // "real data present but unused", which is exactly what it was.
    //
    // Worse, the skip was SILENT: it incremented neither realMrt nor
    // droppedMrt, so the counts said five entrances existed and nothing said
    // what became of them. "Count what you suppress, and read the count"
    // (WORKFLOW.md) — a rule that removes things must report how many.
    //
    // An entrance is a SURVEYED POSITION, so the question is whether a rider
    // can get near it, not whether it is on the main street. Near the axis, or
    // near any road this chunk knows about.
    if (Math.sqrt(bd) > 230 && !nearAnyRoad(mx, mz, 90)) { farFromAxis++; continue; }
    let vx, vz;
    if (Math.sqrt(bd) < 60) {
      const [x1, z1] = P[bi], [x2, z2] = P[bi + 1];
      vx = x2 - x1; vz = z2 - z1;
    } else {
      // far from the axis, face the street it actually sits on
      const seg = nearestRoadDir(mx, mz);
      vx = seg[0]; vz = seg[1];
    }
    const L = Math.hypot(vx, vz) || 1;
    const ang = Math.atan2(vx / L, vz / L);
    const label = (m.n || 'MRT').replace(/\s*(MRT|Station|Exit).*$/i, '') || 'MRT';

    // Most Orchard exits are INSIDE a mall — Orchard Exit C is inside ION,
    // Somerset Exit B inside 313, Dhoby Ghaut Exit E inside Plaza Singapura —
    // and the map node sits where the escalator is, not where the door is.
    // Drawing a glass street canopy there buries it in masonry: 43 of 62 were.
    // The door is on the facade, so walk outward until the point is clear of
    // buildings, and build nothing if there is nowhere clear, because an
    // entrance that is not on a pavement is not an entrance.
    // WHERE THE ENTRANCE ACTUALLY STANDS.
    //
    // This searched outward until the point was clear of BUILDINGS and never
    // asked about the road, so it walked an exit out of a mall and set it down
    // in live traffic. That is the mirror image of the bus-stop bug already in
    // NEXT.md -- "pushClear knows roads, not walls" -- and it is more than half
    // of P1b: the apron, the glass shell, its six ribs, eight balusters and the
    // totem are each counted, so one misplaced entrance is about twenty
    // findings. Six to eleven of them were in a carriageway.
    //
    // Two other things were wrong with it:
    //   It only searched when the ORIGINAL point was blocked, so an exit whose
    //   OSM node sits in the road was built there without a single test.
    //   It tested ONE point for a structure 8.6m across including its totem --
    //   centre clear, apron in the traffic. Same as the canopy posts and the
    //   shopfront bays before it.
    const HALF_X = 4.9, HALF_Z = 2.9;    // the entrance's own plan, totem included
    const stands = (cx2, cz2) => {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      for (const ox of [-HALF_X, 0, HALF_X])
        for (const oz of [-HALF_Z, 0, HALF_Z]) {
          const tx = cx2 + ox * ca + oz * sa;
          const tz = cz2 - ox * sa + oz * ca;
          if (isBlocked && isBlocked(tx, tz)) return false;
          if (window.__onRoad && window.__onRoad(tx, tz, 0.4)) return false;
        }
      return true;
    };
    let ex = mx, ez = mz;
    if (!stands(ex, ez)) {
      let ok = null;
      for (let r = 2; r <= 26 && !ok; r += 2) {
        for (let a2 = 0; a2 < 16; a2++) {
          const th = (a2 / 16) * Math.PI * 2;
          const tx = mx + Math.cos(th) * r, tz = mz + Math.sin(th) * r;
          if (!stands(tx, tz)) continue;
          ok = [tx, tz]; break;
        }
      }
      // A failed search must never fall back to the point it was asked to fix.
      // An entrance with nowhere to stand is not built, and the count of what
      // was dropped is reported rather than swallowed.
      if (!ok) { droppedMrt++; continue; }
      [ex, ez] = ok;
    }
    mrtEntrance(world, ex, ez, ang, label);
    realMrt++;
  }
  // ACCUMULATE, DO NOT OVERWRITE. This is ONE GLOBAL written by EVERY
  // streamed chunk, so a plain assignment leaves whatever the LAST chunk
  // happened to build -- and A2 ("real data present but unused") reads it as
  // a boolean. A chunk with none of this layer therefore reported the whole
  // world as not drawing it, and a chunk with some reported it fine: the
  // check's answer depended on manifest order, not on the world. Caught when
  // kallang landed and A2 failed the world scene while a probe on the same
  // URL read 37 crossings. Same one-global-many-chunks family as __onRoad,
  // and `__realErp` two lines away has always done it correctly.
  if (farFromAxis) {
    // Reported, never silent: a rule that removes things must say how many.
    console.log(`  mrt: ${farFromAxis} entrance(s) skipped, far from the axis `
      + `and not within 90m of any road`);
  }
  window.__realMrt = (window.__realMrt || 0) + realMrt;
  window.__droppedMrt = (window.__droppedMrt || 0) + droppedMrt;

  // Overhead bridges at the positions OSM records, spanning the way it maps.
  let realBridges = 0, droppedBridges = 0;
  for (const line of (data.bridges || [])) {
    await YY();
    if (line.length < 2) continue;
    let len = 0;
    for (let i = 0; i < line.length - 1; i++) {
      len += Math.hypot(line[i + 1][0] - line[i][0], line[i + 1][1] - line[i][1]);
    }
    const a = line[0], b = line[line.length - 1];
    const straight = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // a real overhead crossing spans the road: short or twisty ways are ramps,
    // stairs or kerb cuts, and building a bridge on them drops stair towers
    // into the carriageway
    if (straight < 22 || len > straight * 1.6) continue;
    // ...AND A 567-METRE WAY IS NOT AN OVERPASS. Kallang carries five
    // near-straight footbridge ways of 302-769m (elevated linkways along
    // Nicoll Highway and the stadium concourse). This recipe is ONE rigid
    // deck at ONE height: seated at the centre of a 567m run whose terrain
    // falls away, its slab crossed the Kallang shopfronts at chest height —
    // vetted from 3795,6930, shots/street/d26kal.shot1.jpg, and it is what
    // D26 was calling two "walled off" bays. A long elevated linkway needs a
    // segmented recipe that follows the way and the ground; until that
    // exists, refuse rather than invent — the same rule as the station box.
    if (straight > 90) { droppedBridges++; continue; }
    // and it must actually cross a carriageway. A 37m footway bridge over a
    // canal is a bridge in the map's sense and not a pedestrian overpass, and
    // building an overpass on it puts a deck and two stair towers over water.
    // Sampled ALONG the span, because the deck crosses the road between its
    // supports and its end points are on the pavement either side.
    {
      // A BRIDGE MAY SPAN WATER. This rule was written when nothing in the
      // project had water in it, so it demanded a CARRIAGEWAY underneath and
      // rejected anything else -- which was right for a footway over a canal
      // that OSM calls a bridge, and wrong the moment Marina Bay arrived. The
      // Helix, the Jubilee and the Bayfront bridges all cross the bay and no
      // road at all; D15 was reporting nine real bridges as spanning nothing.
      let spans = false;
      const L2 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      for (let t = 0; t <= L2 && !spans; t += 1.5) {
        const x = a[0] + (b[0] - a[0]) * (t / L2), z = a[1] + (b[1] - a[1]) * (t / L2);
        if (window.__onRoad && window.__onRoad(x, z, 0)) spans = true;
        if (window.__inWater && window.__inWater(x, z)) spans = true;
      }
      if (!spans) continue;
    }
    const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2;
    const ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
    if (pedBridge(world, cx, cz, ang + Math.PI / 2, Math.max(16, straight - 14))) realBridges++;
    else droppedBridges++;
  }
  // same accumulate-not-overwrite rule as __realMrt above
  window.__realBridges = (window.__realBridges || 0) + realBridges;
  window.__droppedBridges = (window.__droppedBridges || 0) + droppedBridges;

  // The real ERP gantries, from LTA's published layer.
  //
  // Placed here rather than in the axis walk because a gantry belongs to a
  // carriageway, not to the district's main street: three of the ten in this
  // region span Orchard Turn, Killiney Road and Clemenceau Avenue. Built once
  // for the whole scene, so the flag stops it being drawn twice when the region
  // has two axes.
  if (!window.__erpDone) {
    window.__erpDone = true;
    for (const g of (data.gantries || [])) {
      erpGantry(world, g.p[0], g.p[1], g.a, g.w, true);
      window.__realErp = (window.__realErp || 0) + 1;
    }
  }

  const pts = axis.p, half = axis.w / 2;
  const stats = { erp: 0, bridges: realBridges, bridgesRefused: droppedBridges, banners: 0, medianPlants: 0, roofSigns: 0, banners2: 0, mrt: realMrt };

  const bannerT = [], medianKerb = [], medianShrub = [], medianPalm = [];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    await YY();
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;

      // banners on the lamp columns
      if (acc % 34 === 8) {
        for (const sgn of [-1, 1]) {
          const bx = px + nx * (half + 0.4) * sgn, bz = pz + nz * (half + 0.4) * sgn;
          // building test alone let banners hang IN Victoria Street: the
          // nominal kerb line (half+0.4) is inside the tarmac wherever the
          // real carriageway runs wider than the tagged width. A banner
          // belongs on a lamp column, and no lamp stands in a live lane.
          if (isBlocked(bx, bz)) continue;
          // test where the banner actually HANGS (0.28 further out), not
          // where its column stands — the 0.28 was exactly the difference
          // between passing the guard and hanging over the lane
          const hx = bx + nx * 0.28 * sgn, hz = bz + nz * 0.28 * sgn;
          if (window.__onRoad && window.__onRoad(hx, hz, -0.3)) continue;
          bannerT.push([hx, 5.4, hz, ang]);
        }
      }

      // one ERP gantry and two pedestrian bridges along the stretch
      // ERP gantries are no longer placed here. They used to go in at arclengths
      // 300 and 700 with the axis's own width, which are three invented numbers
      // per gantry. LTA publishes every one of them as a surveyed line across
      // the carriageway, so the position, the bearing AND the span are real now
      // — see the block after this loop, and data/gantries.py.

    }
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const cc = new THREE.Color();
  const emit = (geo, mat, list, fn, colFn) => {
    // This file had NO water guard while street.js and markings.js both did,
    // so its median kerbs went into Marina Bay — 21m and 87m from the nearest
    // shore, which W2 has been counting ever since. Deck-aware, so a median on
    // a causeway survives: it is standing on the causeway.
    if (window.__inWater) list = list.filter((r) => standable(r[0], r[2]));
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((r, i) => {
      fn(r); m.compose(p, q, s); im.setMatrixAt(i, m);
      if (colFn) im.setColorAt(i, colFn());
    });
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = false; im.receiveShadow = true;
    world.add(im);
  };
  const yaw = (r) => { p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };

  // The median, along the line BETWEEN each anti-parallel pair rather than
  // along whichever street the axis happens to be. Deduped on a 3m grid because
  // both halves of a pair contribute the same midpoint, and skipped wherever it
  // would land in a drawn carriageway -- our widths are inferred from lane
  // counts, so on a narrow pair the two halves can overlap the gap.
  // ONCE FOR THE WHOLE SCENE, not once per axis.
  //
  // buildSgDetail runs per axis and the region has two (Orchard Road and Bras
  // Basah Road). The old median was placed by walking the axis, so it was
  // naturally per-axis; this one is derived from data.roads and is world-wide,
  // so it was being laid down twice in exactly the same places -- 768 kerbs
  // where there should be 384, and 298 of them reported by P4 as duplicates
  // within 60cm. The ERP gantries have carried a __erpDone flag for this same
  // reason since the region shipped.
  if (!window.__medianDone) {
    window.__medianDone = true;
    // ITS OWN RANDOM STREAM. The jitter below used to come off the module-level
    // PRNG that also drives tree, furniture and crowd placement, so changing
    // how many median plants exist silently relocated things elsewhere in the
    // district -- which is exactly what happened on the first run of this fix
    // (D33 and D37 moved for no reason). Same lesson as the granite texture.
    const mr = rng(0x6d656469);            // "medi"
    const jit = () => (mr() - 0.5) * 0.9;
    // A minimum SPACING in metres, not a grid key. Both halves of a pair give
    // the same midpoint and consecutive segments give near-identical ones, so
    // a 3m grid still left kerbs a few centimetres apart and P4 (duplicated
    // props) went to 729 against a budget of 360. The kerb unit is 3m long, so
    // that is the spacing.
    const SPACING = 3.0;
    const cell = new Map();
    const farEnough = (x, z) => {
      const gx = Math.floor(x / SPACING), gz = Math.floor(z / SPACING);
      for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++) {
          const l = cell.get((gx + i) + ',' + (gz + j));
          if (!l) continue;
          for (const [px, pz] of l) if ((px - x) ** 2 + (pz - z) ** 2 < SPACING * SPACING) return false;
        }
      const k = gx + ',' + gz;
      if (!cell.has(k)) cell.set(k, []);
      cell.get(k).push([x, z]);
      return true;
    };
    let mi = 0;
    for (const [mx, mz, mang] of medianPts) {
      if (window.__onRoad && window.__onRoad(mx, mz, -0.4)) continue;
      // the kerb bar is 4m LONG along the median — where the gap closes at
      // a junction mouth, a clear midpoint can still put an END in the
      // lane (the last Grange Road bar after the midpoint fix). Both ends
      // must be clear too.
      const ex3 = Math.sin(mang) * 2.1, ez3 = Math.cos(mang) * 2.1;
      if (window.__onRoad && (window.__onRoad(mx + ex3, mz + ez3, -0.3)
        || window.__onRoad(mx - ex3, mz - ez3, -0.3))) continue;
      if (!farEnough(mx, mz)) continue;
      medianKerb.push([mx, 0.14, mz, mang]);
      if (mi % 2 === 0) medianShrub.push([mx + jit(), 0.72, mz + jit(), mang]);
      if (mi % 14 === 0) medianPalm.push([mx, 0, mz, mang]);
      mi++;
    }
  }
  emit(new THREE.BoxGeometry(2.1, 0.34, 3.0), MAT.kerb, medianKerb, yaw);
  emit(new THREE.SphereGeometry(0.66, 7, 5),
    new THREE.MeshLambertMaterial({ color: 0x3f5c33 }), medianShrub, (r) => {
      p.set(r[0], surfaceAt(r[0], r[2]) + 0.72, r[2]); q.identity(); s.set(1, 0.78, 1);
    });
  s.set(1, 1, 1);
  stats.medianPlants = medianShrub.length;

  // slim median palms: trunk plus a fan of fronds
  emit(new THREE.CylinderGeometry(0.14, 0.2, 6.4, 7), MAT.trunk, medianPalm, (r) => {
    p.set(r[0], surfaceAt(r[0], r[2]) + 3.2, r[2]); q.identity();
  });
  const frond = [];
  for (const [x, , z] of medianPalm) {
    for (let k = 0; k < 7; k++) frond.push([x, 6.3, z, (k / 7) * Math.PI * 2]);
  }
  emit(new THREE.PlaneGeometry(3.2, 0.8), MAT.leaf, frond, (r) => {
    p.set(r[0] + Math.sin(r[3]) * 1.4,
          surfaceAt(r[0], r[2]) + r[1] - 0.35,
          r[2] + Math.cos(r[3]) * 1.4);
    e.set(-0.95, r[3] + Math.PI / 2, 0, 'YXZ'); q.setFromEuler(e);
  });

  // lamp-post banners, alternating colours
  emit(new THREE.BoxGeometry(0.06, 1.6, 0.62),
    new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }),
    bannerT, yaw, () => cc.setHex(pick(BANNER_COLS)));
  stats.banners = bannerT.length;

  /* ---------------- tenant signage: moved to shopfront.js ---------------- */
  // This used to draw a board at each tenant's own map coordinate, nudged 1.2m
  // toward the nearest road. A mall tenant's node is in the middle of the mall,
  // so 1,505 of the 1,642 boards were built inside the masonry — median 9.2m
  // past the facade — and every one of them was drawn whether the shop was on
  // the street, on the fourth floor or in the second basement.
  //
  // A tenant now goes on the facade its shop actually meets the street at, in
  // a real shop bay, or it is not drawn. See src/shopfront.js. It runs once for
  // the whole district rather than once per axis, which is also why it is not
  // here: this function is called for each axis in turn.

  /* ---------------- building signage ---------------- */
  // Rooftop sign boxes on the taller blocks and vertical banner signs down the
  // corners of the mid-rise ones. Colour and form only, no lettering.
  const roofSign = [], vertSign = [];
  for (const b of data.buildings) {
    await YY();
    if (b.a < 700) continue;
    let cx = 0, cz = 0;
    for (const q2 of b.p) { cx += q2[0]; cz += q2[1]; }
    cx /= b.p.length; cz /= b.p.length;

    // longest street-facing edge
    let bi = 0, bl = 0;
    for (let i = 0; i < b.p.length; i++) {
      const a = b.p[i], c = b.p[(i + 1) % b.p.length];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (L > bl) { bl = L; bi = i; }
    }
    const a = b.p[bi], c = b.p[(bi + 1) % b.p.length];
    const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2;
    const ang = Math.atan2(c[0] - a[0], c[1] - a[1]);
    const oX = mx - cx, oZ = mz - cz, oL = Math.hypot(oX, oZ) || 1;

    // named buildings get their name on the fascia, which is what actually
    // lets you tell where you are
    if (b.n && bl > 14) {
      const bgc = pick(SIGN_COLS);
      const boardW = Math.min(26, bl * 0.55), boardH = boardW * 0.25;
      const sy = Math.min(b.h - 2.2, 7.4);
      const rot = ang + Math.PI / 2;
      const uv = atlas.add(b.n, '#' + bgc.toString(16).padStart(6, '0'), '#f4f1ea');
      const face = atlas.plane(boardW, boardH, uv);
      face.rotateY(rot);
      face.translate(mx + (oX / oL) * 1.05, sy, mz + (oZ / oL) * 1.05);
      signs.add(face, uv.mat, mx, mz);
      // THE BACK OF A SIGN IS GREY ALUMINIUM, NOT A HOLE IN THE SKY.
      // In darkMetal this reads as a flat black rectangle from behind, and a
      // rider on the far side of the street sees a big blank void hanging over
      // the road. It was written up as a defect once, chased through three
      // probes on Victoria Street, and re-chased on Serangoon Road -- because
      // "a black panel in the sky" looks exactly like a missing texture.
      // It is not a bug, but near-black was the wrong answer: a real sign tray
      // is a pale grey extrusion, and painting it that way removes both the
      // false alarm and the void.
      const back = new THREE.BoxGeometry(boardW + 0.5, boardH + 0.5, 0.3);
      back.rotateY(rot);
      back.translate(mx + (oX / oL) * 0.85, sy, mz + (oZ / oL) * 0.85);
      signs.add(back, SIGN_TRAY, mx, mz);
      (window.__signage = window.__signage || [])
        .push({ kind: 'name', x: mx, z: mz, text: b.n });
      stats.nameSigns = (stats.nameSigns || 0) + 1;
    }

    // A ROOFTOP SIGN NEEDS A ROOF EDGE UNDER IT. This box sits on the
    // footprint's street edge at b.h -- which is only where the roof IS for a
    // building drawn as a plain full-footprint extrude. The tall generic path
    // insets its tower to 62% of the footprint, and a bespoke recipe draws
    // whatever massing it researched, so their signs floated in open sky
    // beside the towers: 332 boards up to 80m, the "dark chips" in the
    // vantage sheet's aerial frame. chance() is still drawn FIRST so the
    // shared placement stream is undisturbed -- a filter must not reshuffle
    // the world (see the texture-RNG note in tex.js).
    if (b.h > 34 && chance(0.55)) {
      const insetTower = b.k && b.h > 70;
      const bespoke = !!recipeFor(b.n);
      if (!insetTower && !bespoke) {
        roofSign.push([mx + (oX / oL) * 0.6, b.h + 2.2, mz + (oZ / oL) * 0.6, ang + Math.PI / 2,
          Math.min(16, bl * 0.4)]);
      }
    }
    if (b.h > 14 && bl > 12 && chance(0.7)) {
      const vx2 = mx + (oX / oL) * 1.1, vz2 = mz + (oZ / oL) * 1.1;
      // a banner hanging over the carriageway is something you ride into
      if (!isBlocked(vx2, vz2)) {
        vertSign.push([vx2, 9.5, vz2, ang + Math.PI / 2]);
      }
    }
  }
  // rooftop boxes vary in width, so scale per instance
  if (roofSign.length) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 3.2, 0.5),
      new THREE.MeshStandardMaterial({ roughness: 0.6 }), roofSign.length);
    roofSign.forEach((r, i) => {
      p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
      s.set(r[4], 1, 1);
      m.compose(p, q, s); im.setMatrixAt(i, m);
      im.setColorAt(i, cc.setHex(pick(SIGN_COLS)));
    });
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = true; world.add(im);
    s.set(1, 1, 1);
  }
  emit(new THREE.BoxGeometry(0.9, 7.5, 0.35),
    new THREE.MeshStandardMaterial({ roughness: 0.55 }),
    vertSign, yaw, () => cc.setHex(pick(SIGN_COLS)));
  stats.roofSigns = roofSign.length;
  stats.banners2 = vertSign.length;

  stats.signPages = atlas.finish();
  stats.signMeshes = await signs.flushY(world, {}, Y);

  Object.assign(stats, await buildWalkable(world, data, Y));
  // after buildWalkable: the stair treads register their own walk surfaces
  // first, so where a flight meets a path the higher tread still wins the
  // standable lookup (it takes the highest match)
  Object.assign(stats, await buildTrails(world, data, Y));
  return stats;
}

// THE WALKABLE WORLD: staircases, and the walls and railings beside them.
//
// Every layer this project fetched before these two was chosen for a RIDER.
// Measured in the brasbasah extract, none of it drawn by anything: 104 flights
// and 1,953m of stair, and 29 barrier runs over 3,289m. The stairs are the
// important half — they are every flight on Fort Canning and up Mount Sophia,
// and without them those hills have no way up at all. A person on foot could
// reach the bottom of Fort Canning and stop.
//
// SEATED ON `surfaceAt`, NOT `groundAt`, for the reason this file's import note
// already gives: some of these flights land on a bridge deck or a raised
// podium, and groundAt would bury them in it.
// MATERIALS AT MODULE SCOPE, NOT PER CALL. The Merger keys its batches by
// material identity, so a `new MeshStandardMaterial` created inside the loop is
// a different key every time and every hedge in the district becomes its own
// draw call. Same trap the recipe table's inline arrows hit for NO_SHOPFRONT.
const WALK_MAT = {
  tread: new THREE.MeshStandardMaterial({ color: 0xbdb8ad, roughness: 0.9 }),
  cheek: new THREE.MeshStandardMaterial({ color: 0xa8a399, roughness: 0.92 }),
  hedge: new THREE.MeshStandardMaterial({ color: 0x4a6b3c, roughness: 1 }),
};

// THE TRAILS. Sentosa carries 833 surveyed footways, 10 pedestrian streets and
// 43 stair flights — the Imbiah routes, the beach walks, the boardwalks, the
// paths through every wood on the island — and NOT ONE OF THEM WAS EVER DRAWN.
// roads.js skips them deliberately ("places you walk, not carriageways"), which
// is right for the carriageway grid, and nothing else ever picked them up. So
// the island's whole walking network existed as data and as nothing else: a
// player could not see a trail, follow one, or tell a forest path from lawn.
//
// Same shape as every other surveyed layer here: draw what the survey records,
// take the SURFACE from the ground it crosses rather than inventing one, and
// register the result as standable so a walker is actually carried by it.
//
// Width comes from the way's own `w` where the survey gives one. The defaults
// are the narrowest thing that still reads as a path from the saddle.
export async function buildTrails(world, data, Y = null) {
  const YY = Y || (async () => {});
  const out = { trails: 0, trailSegs: 0, boardwalk: 0, forestTrail: 0, pavedPath: 0 };
  const merger = new Merger();
  // packed granite dust — what a Singapore park path actually is underfoot
  const earthM = new THREE.MeshLambertMaterial({ color: 0x9c8768 });
  // timber decking: the beach boardwalks and anything crossing sand
  const deckM = new THREE.MeshLambertMaterial({ color: 0x8d7a63 });
  const paveM = new THREE.MeshLambertMaterial({ color: 0xb0a898 });
  // A BOARDWALK OVER WATER IS OVER WATER BY DESIGN — the Sentosa Boardwalk,
  // the jetty approaches, every deck round the Cove's basins. W2 counts things
  // standing in mapped water and is right to; this is the same exemption a
  // bridge deck and the cable car already carry, declared on the MATERIAL so
  // the check reads a mechanism rather than guessing from a shape. Its own
  // material, not deckM, so a boardwalk over SAND stays fully checked.
  const waterDeckM = new THREE.MeshLambertMaterial({ color: 0x8d7a63 });
  waterDeckM.userData.boardwalkOverWater = true;
  const wpolys = (data.water || []).map((w) => w.p).filter((p) => p && p.length > 3);

  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  const woods = (data.green || []).filter((g) => g.k === 'wood' && g.p && g.p.length >= 4);
  const sands = (data.green || []).filter((g) => g.k === 'sand' && g.p && g.p.length >= 4);
  // which surface does this path cross? asked at the segment midpoint, because
  // a path that leaves a wood should change underfoot where it leaves it
  // A BEACH WALK IS A BOARDWALK EVEN WHEN IT IS NOT ON THE SAND.
  //
  // The owner: "those beach walk ways or paths can make it look nicer". The
  // first version only called a path a boardwalk when its midpoint was INSIDE
  // a sand ring — but Siloso Beach Walk, Palawan Beach Walk and the Tanjong
  // spine all run just BEHIND the sand, on the dry side, which is exactly
  // where a boardwalk goes. So they drew as grey paving, the same surface as a
  // car park. Anything within a short reach of mapped sand is timber.
  const BOARDWALK_REACH = 30;
  const edgeDistTo = (x, z, p) => {
    let best = 1e9;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], c = p[(i + 1) % p.length];
      const vx = c[0] - a[0], vz = c[1] - a[1];
      const L2 = vx * vx + vz * vz || 1;
      let t = ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      best = Math.min(best, Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)));
    }
    return best;
  };
  const surfaceFor = (x, z) => {
    for (const p of wpolys) if (inRing(x, z, p)) return 'waterdeck';
    for (const s of sands) if (inRing(x, z, s.p)) return 'deck';
    for (const s of sands) if (edgeDistTo(x, z, s.p) < BOARDWALK_REACH) return 'deck';
    for (const w of woods) if (inRing(x, z, w.p)) return 'earth';
    return 'pave';
  };

  for (const r of (data.roads || [])) {
    const k = r.k || '';
    if (k !== 'footway' && k !== 'pedestrian') continue;
    const pts = r.p || [];
    if (pts.length < 2) continue;
    const half = Math.max(0.7, (r.w || (k === 'pedestrian' ? 4.0 : 2.0)) / 2);
    let drew = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      await YY();
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.5) continue;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      const kind = surfaceFor(mx, mz);
      const mat = kind === 'waterdeck' ? waterDeckM
        : kind === 'deck' ? deckM : kind === 'earth' ? earthM : paveM;
      if (kind === 'deck' || kind === 'waterdeck') out.boardwalk++;
      else if (kind === 'earth') out.forestTrail++;
      else out.pavedPath++;
      // FOLLOW THE GROUND, do not span it. A single quad from end to end sinks
      // into every rise between — these paths climb Imbiah. Step the ribbon
      // along the segment so each piece sits on its own terrain, at the
      // spacing the heightfield can actually resolve.
      const steps = Math.max(1, Math.ceil(L / 6));
      const ux = (bx - ax) / L, uz = (bz - az) / L;
      const nx = -uz, nz = ux;
      for (let s = 0; s < steps; s++) {
        const t0 = s / steps, t1 = (s + 1) / steps;
        const p0x = ax + (bx - ax) * t0, p0z = az + (bz - az) * t0;
        const p1x = ax + (bx - ax) * t1, p1z = az + (bz - az) * t1;
        // A PATH DOES NOT GET PAINTED OVER A CARRIAGEWAY. Where a footway
        // crosses a road the crossing layer already draws the markings, and a
        // ribbon of earth over asphalt is a defect the gates catch: testing
        // only the parent segment's MIDPOINT let 47 pieces through into P1b,
        // because a 90m footway crossing a road is on the road for six metres
        // of it and clear at its middle. Tested per DRAWN PIECE, at both ends
        // and at both edges of its own width — the same nine-sample shape the
        // kerb emitters use — and at the same -0.3 margin, so a pavement
        // legitimately running along a kerb line is not thrown away.
        let onRoad = false;
        if (window.__onRoad) {
          for (const tt of [0, 0.5, 1]) {
            const sx = p0x + (p1x - p0x) * tt, sz = p0z + (p1z - p0z) * tt;
            for (const off of [0, half, -half]) {
              if (window.__onRoad(sx + nx * off, sz + nz * off, -0.3)) { onRoad = true; break; }
            }
            if (onRoad) break;
          }
        }
        if (onRoad) continue;
        // +4cm: clear of the terrain surface, under the kerbs and treads that
        // are seated on it, same offset the pavement layer uses
        const y0 = groundAt(p0x, p0z) + 0.04, y1 = groundAt(p1x, p1z) + 0.04;
        const g = new THREE.BufferGeometry();
        const pos = new Float32Array([
          p0x - nx * half, y0, p0z - nz * half,
          p1x - nx * half, y1, p1z - nz * half,
          p1x + nx * half, y1, p1z + nz * half,
          p0x - nx * half, y0, p0z - nz * half,
          p1x + nx * half, y1, p1z + nz * half,
          p0x + nx * half, y0, p0z + nz * half,
        ]);
        const seg = Math.hypot(p1x - p0x, p1z - p0z);
        const uv = new Float32Array([0, 0, seg / 2, 0, seg / 2, 1, 0, 0, seg / 2, 1, 0, 1]);
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        g.computeVertexNormals();
        merger.add(g, mat, p0x, p0z);
        // carried underfoot, so the walker stands ON the trail and not in the
        // slope beside it
        addWalkSurface(p0x, p0z, p1x, p1z, half, (y0 + y1) / 2);
        out.trailSegs++;
        drew++;
      }
    }
    if (drew) out.trails++;
  }
  await merger.flushY(world, {}, Y);
  return out;
}

export async function buildWalkable(world, data, Y = null) {
  let _wt = performance.now();
  const YW = async () => { if (Y && performance.now() - _wt > 8) { await Y(); _wt = performance.now(); } };
  const out = { stairFlights: 0, stairTreads: 0, barrierRuns: 0, offRoad: 0, parkFurn: 0 };
  const merger = new Merger();

  // NOTHING HERE MAY STAND IN A CARRIAGEWAY, and the first build of this
  // function forgot it. 42.7km of surveyed wall and fence went in with no road
  // test at all and Orchard's gates refused the deploy on the spot: P1b 39
  // structures in a carriageway, T1 19 carriageways blocked by solid geometry.
  //
  // OSM fences legitimately run right up to a kerb, and a few are mapped
  // straight across a road mouth where a gate stands. Neither is something a
  // rider should hit at 50km/h. This is the same guard every other placement in
  // this file already goes through -- see the ERP gantry's leg search and the
  // pedestrian bridge's tower search -- and the only reason it was missed is
  // that these two layers arrived as "just draw the surveyed line".
  //
  // SKIP, never nudge. A wall's position is surveyed; moving it 3m to clear a
  // road would put it through a building instead. A segment that cannot be
  // drawn where it is does not get drawn.
  const onRoad = (x, z, m = 0.2) => !!(window.__onRoad && window.__onRoad(x, z, m));

  // AND THE CHUNK'S OWN ROADS, BECAUSE __onRoad CANNOT SEE THEM.
  //
  // This is the root cause of the one blocker that held this batch back, and it
  // is worth stating exactly. `window.__onRoad` is ONE GLOBAL, built from the
  // BOOT scene's road list. Under streaming, every other district's chunk is
  // built later against that same global -- so when chinatown's chunk drew its
  // stairs, __onRoad only knew marinabay's roads and answered "no road here"
  // for a flight standing in CHINATOWN'S OWN Cross Street. Measured:
  //
  //   world.d.chinatown.json  owns the flight   AND knows Cross Street (14 ways)
  //   world.d.marinabay.json  owns neither
  //   __onRoad(1950, 9502, 1.2) in the marinabay scene -> FALSE
  //   P1b, reading the drawn geometry -> "structure in a carriageway"
  //
  // P1b was right the whole time and I was wrong to read it as an overhead
  // case: P1b already skips anything more than RIDE_HEIGHT above the TERRAIN,
  // and these treads passed that filter, which means they sit at rider height
  // on ground that genuinely reads ~24m there. A staircase standing in a live
  // carriageway is exactly the defect the check is named for.
  //
  // `data` here IS the chunk being built, so its own roads are the ones that
  // matter. Widths come from the same field the check reads. Service roads are
  // NOT skipped even though P1b skips them -- being stricter than the gate is
  // free, and a stair across a service lane is still a stair in a road.
  const _rds = (data.roads || []).filter((r) => r.k !== 'footway' && r.k !== 'pedestrian'
                                             && r.p && r.p.length > 1);
  const inCarriageway = (x, z, pad = 0.4) => {
    for (const r of _rds) {
      const half = (r.w || 8) / 2 + pad, q = r.p;
      for (let i = 0; i + 1 < q.length; i++) {
        const ax = q[i][0], az = q[i][1], bx = q[i + 1][0], bz = q[i + 1][1];
        if (Math.min(ax, bx) - half > x || Math.max(ax, bx) + half < x) continue;
        if (Math.min(az, bz) - half > z || Math.max(az, bz) + half < z) continue;
        const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz;
        if (L2 < 1e-6) continue;
        let t = ((x - ax) * vx + (z - az) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const dx = x - (ax + vx * t), dz = z - (az + vz * t);
        if (dx * dx + dz * dz < half * half) return true;
      }
    }
    return false;
  };
  const anyRoad = (x, z, m) => onRoad(x, z, m) || inCarriageway(x, z);

  // A TREAD IS NOT A POINT, AND THAT IS THE WHOLE OF THE BLOCKER THAT HELD THIS
  // BATCH BACK FOR A SESSION.
  //
  // Measured, so it is never re-derived. The flight at 1942,9506 -> 1961,9493
  // carries a surveyed `step_count` of FOUR over a way 25.1m long, so
  // `depth = total / n` makes each drawn tread a slab **6.28m deep**. Its centre
  // at 1956.4,9501.4 is 9.6m clear of Cross Street and passed the guard; its
  // leading edge is 3.7m from the centreline of a road 14.8m wide, and that is
  // the geometry P1b reported at 1958,9499. The check was right every time.
  //
  // This is HANDOFF lesson 1 -- "a geometric rule needs a SCALE" -- for the
  // FIFTH time in this project, and the third time in this one file: a spur test
  // with no length, a road check with no width, a barrier walked at three points
  // that a carriageway hid between. A guard that samples one point can only ever
  // be right about geometry smaller than the thing it is guarding against.
  //
  // So walk the box's own FOOTPRINT at a spacing narrower than any carriageway
  // in this world (2m, the same figure the barrier walk settled on). `u` is the
  // unit direction the box is laid along; `w` is across it, `d` along it.
  const boxClear = (cx, cz, ux, uz, w, d, m) => {
    const na = Math.max(1, Math.ceil(d / 2)), nb = Math.max(1, Math.ceil(w / 2));
    for (let i = 0; i <= na; i++) {
      const a = (i / na - 0.5) * d;
      for (let j = 0; j <= nb; j++) {
        const b = (j / nb - 0.5) * w;
        const px = cx + ux * a - uz * b, pz = cz + uz * a + ux * b;
        if (anyRoad(px, pz, m) || !dryHere(px, pz)) return false;
      }
    }
    return true;
  };

  // NOR MAY IT STAND WHERE THE DRAWN GROUND HAS BEEN CUT AWAY.
  //
  // `surfaceAt` reads `Terrain.at()`, and inside a water ring `at()` is HIGH ON
  // PURPOSE: the riverbed cut lives only in `vertexY()`, so the mesh dips ~1.4m
  // below the ring level while `at()` keeps the bank height so the quay beside
  // it does not lose its ground. That decision is right and is documented at
  // the top of NEXT.md. The consequence for anything seated with `surfaceAt` is
  // not: it gets placed on a surface that is not drawn.
  //
  // Measured on brasbasah, and it is what W2 was reporting. A flight of eleven
  // steps at 1697-1704, 8507-8512 shares a node with the Singapore River's own
  // bank ring -- a real landing stair down to the water -- and was drawn at
  // `at()` = 14.7m while the water surface there is at -0.05m and the drawn
  // riverbed is below that. Sixteen metres of stair, cheek and handrail standing
  // in mid-air over the river.
  //
  // EXEMPT BY MECHANISM, NOT BY SIGNATURE -- the same sentence W2's own comment
  // argues for. Water with a deck over it is a road, and things stand on it.
  const dryHere = (x, z) => !(window.__inWater && window.__inWater(x, z))
    || !!(window.__bridgeDeckAt && window.__bridgeDeckAt(x, z) !== null);



  const TREAD = WALK_MAT.tread, CHEEK = WALK_MAT.cheek, RAIL = MAT.metal;

  for (const s of data.steps || []) {
    await YW();
    const p = s.p;
    if (!p || p.length < 2) continue;
    // Which end is UP is decided by the GROUND, not by `incline`. The tag is
    // relative to the way's own direction, it is absent more often than not,
    // and it never says how far the flight climbs. The DEM does.
    const y0 = surfaceAt(p[0][0], p[0][1]);
    const y1 = surfaceAt(p[p.length - 1][0], p[p.length - 1][1]);
    const rise = Math.abs(y1 - y0);
    const up = y1 >= y0 ? 1 : -1;              // +1: climbs along the way
    const W = s.w || 1.8;
    // A flight with no rise at all is a landing or a mis-tag; drawing treads on
    // it would stripe flat ground with kerbs. 0.25m is one shallow step.
    if (rise < 0.25) continue;

    // THE BLOCKER THAT USED TO BE DOCUMENTED HERE IS FIXED, AND WHAT IT WAS IS
    // WORTH KEEPING BECAUSE FIVE ATTEMPTS CHASED THE WRONG THING.
    //
    // It was read for a whole session as "P1b and this guard disagree about
    // where Cross Street is" -- the two-measures-of-one-fact trap -- because
    // `__onRoad(1950, 9502, 1.2)` answers FALSE at a point P1b complains about.
    // Both readings were true and neither was the cause. __onRoad IS blind to a
    // streamed chunk's own roads (see `inCarriageway` above, which fixes that
    // and is a real improvement), and the point it was asked about genuinely has
    // no road under it -- because the DEFECT WAS 3.7m AWAY, at the far edge of a
    // 6.28m slab whose centre was being tested. See `boxClear`.
    //
    // Do not repeat any of these, all measured and all dead: widening the
    // onRoad margin to 1.2 (the answer was already no); skipping a flight by
    // `surfaceAt - groundAt` at one end, at both ends, or against a 1.5m
    // bridge-deck threshold (never fired -- the terrain there really does read
    // ~24m, so it is high ground and not a deck); and giving P1b a height-based
    // overhead exemption (the treads sit at rider height on real ground, so the
    // check was never wrong to see them).
    // Step count: the survey when there is one, otherwise the rise at a normal
    // riser. 0.15m is the Singapore norm and it is only ever a fallback.
    let n = s.n || Math.round(rise / 0.15);
    n = Math.max(2, Math.min(n, 120));
    const rec = { treads: 0 };

    // walk the polyline by arclength so treads are evenly spaced along a bend
    const segs = [];
    let total = 0;
    for (let i = 0; i < p.length - 1; i++) {
      const d = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
      segs.push(d); total += d;
    }
    if (total < 0.8) continue;
    const at = (t) => {                        // t in 0..1 along the flight
      let want = t * total, i = 0;
      while (i < segs.length - 1 && want > segs[i]) { want -= segs[i]; i++; }
      const f = segs[i] ? want / segs[i] : 0;
      const ax = p[i][0] + (p[i + 1][0] - p[i][0]) * f;
      const az = p[i][1] + (p[i + 1][1] - p[i][1]) * f;
      const ux = (p[i + 1][0] - p[i][0]) / (segs[i] || 1);
      const uz = (p[i + 1][1] - p[i][1]) / (segs[i] || 1);
      return [ax, az, ux, uz];
    };

    const lo = Math.min(y0, y1);
    const depth = total / n;
    const tread = [];                          // where each tread landed
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const [ax, az, ux, uz] = at(t);
      // height climbs with the way when up=+1 and against it when up=-1
      const frac = up > 0 ? (k + 1) / n : 1 - k / n;
      const y = lo + rise * frac;
      // A tread laid across the carriageway is something you ride into, and the
      // WHOLE tread has to clear it -- see boxClear. Margin 1.2 rather than the
      // 0.2 the barriers use, because P1b measures the carriageway at
      // `width/2 - 1.0` and this stands back further than either measure can
      // argue about.
      const dep = Math.max(0.22, depth);
      if (!boxClear(ax, az, ux, uz, W, dep, 1.2)) { out.offRoad++; continue; }
      const g = new THREE.BoxGeometry(W, 0.16, dep);
      g.rotateY(Math.atan2(ux, uz));
      g.translate(ax, y - 0.08, az);
      merger.add(g, TREAD, ax, az);
      tread.push([ax, y, az, ux, uz]);
      rec.treads++;
    }
    // THE TWO CHEEKS, AND THEY MUST FOLLOW THE PITCH.
    //
    // First build made each cheek ONE box `rise + 0.5` tall spanning the whole
    // flight at a constant height. On the 63m flight below Fort Canning that is
    // a wall sixty metres long and as tall as the hill is high, and that is
    // exactly how it rendered: a giant grey slab lying across the park. A
    // stringer is a thin plank that CLIMBS, so it is half a metre deep, as long
    // as the slope's hypotenuse, and tilted by the pitch.
    // ONE SEGMENT PER TREAD, NOT ONE BOX PER FLIGHT.
    //
    // A single straight plank down the middle was the second thing wrong here.
    // Half these flights BEND -- the ones off Fort Canning Rise curve round the
    // hill -- and a straight box centred on the midpoint sticks out past both
    // ends of a curve. On screen that is a pair of thin dark lines flying off
    // into the park, which is what the vet frame showed. Following the treads
    // costs a few more boxes and cannot leave the stair.
    for (let k = 0; k + 1 < tread.length; k++) {
      const [ax, ay, az] = tread[k];
      const [bx, by, bz] = tread[k + 1];
      const dx = bx - ax, dz = bz - az, dy = by - ay;
      const run = Math.hypot(dx, dz);
      if (run < 0.01) continue;
      const ang = Math.atan2(dx, dz);
      const seg = Math.hypot(run, dy);
      const nx = -dz / run, nz = dx / run;
      for (const side of [-1, 1]) {
        const cx = (ax + bx) / 2 + nx * side * (W / 2);
        const cz = (az + bz) / 2 + nz * side * (W / 2);
        const cy = (ay + by) / 2;
        // rotateX tilts the box in its own YZ plane so it rises along +Z, THEN
        // rotateY swings that slope onto this segment's bearing. The other
        // order gives a plank tilted across the stair instead of along it.
        const c = new THREE.BoxGeometry(0.18, 0.5, seg * 1.06);
        c.rotateX(-Math.atan2(dy, run)); c.rotateY(ang);
        c.translate(cx, cy - 0.18, cz);
        merger.add(c, CHEEK, cx, cz);
        if (rise > 1.2) {
          const r = new THREE.BoxGeometry(0.06, 0.06, seg * 1.06);
          r.rotateX(-Math.atan2(dy, run)); r.rotateY(ang);
          r.translate(cx, cy + 0.95, cz);
          merger.add(r, RAIL, cx, cz);
        }
      }
    }
    // NOW MAKE IT CLIMBABLE. Every tread that was actually DRAWN — so
    // anything the road and water guards refused is not registered, and a
    // walker cannot climb a flight that is not there — becomes a walkable
    // surface at its own height. Registered AFTER the flight is built, never
    // before, because the tread heights above are read from `surfaceAt` and a
    // flight that registered itself mid-loop would start standing on itself.
    for (let k = 0; k < tread.length; k++) {
      const [ax, ay, az] = tread[k];
      const nx2 = k + 1 < tread.length ? tread[k + 1] : tread[k - 1] || tread[k];
      // a segment spanning this tread, half the flight's width plus a little,
      // so the walkable strip is continuous rather than a row of islands
      const ex = nx2 === tread[k] ? ax : (ax + nx2[0]) / 2;
      const ez = nx2 === tread[k] ? az : (az + nx2[2]) / 2;
      addWalkSurface(ax, az, ex, ez, W / 2 + 0.15, ay);
    }
    out.stairFlights++;
    out.stairTreads += rec.treads;
  }

  for (const b of data.barriers || []) {
    await YW();
    const p = b.p;
    if (!p || p.length < 2) continue;
    const h = b.h || 1.6;
    const solid = b.k === 'wall' || b.k === 'retaining_wall';
    const mat = b.k === 'hedge' ? WALK_MAT.hedge
      : (solid ? MAT.paleStone : MAT.metal);
    // A fence is not a wall: it is posts and rails, and drawn as a solid slab a
    // 1.6m fence reads as a garden wall down the whole street. Solid barriers
    // get one slab; open ones get a top rail and a bottom rail only.
    for (let i = 0; i < p.length - 1; i++) {
      const x0 = p[i][0], z0 = p[i][1], x1 = p[i + 1][0], z1 = p[i + 1][1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      if (L < 0.4) continue;
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      // WALKED AT A FIXED SPACING, not sampled at three points.
      //
      // First it tested the midpoint only, and Orchard's P1b caught 39. Then it
      // tested both ends and the middle, and Marina Bay's P1b still caught ONE:
      // a fence segment long enough to cross a carriageway BETWEEN the samples,
      // with all three of them on clear ground. That is the "a geometric rule
      // needs a SCALE" lesson in HANDOFF for the fourth time -- three points is
      // not a rule, it is a hope about how long a segment is. 2m is narrower
      // than any carriageway in this world, so a road cannot hide between two
      // samples.
      let hits = false;
      const steps2 = Math.max(2, Math.ceil(L / 2));
      for (let q = 0; q <= steps2 && !hits; q++) {
        const f2 = q / steps2;
        const sx = x0 + (x1 - x0) * f2, sz = z0 + (z1 - z0) * f2;
        hits = anyRoad(sx, sz, 0.2) || !dryHere(sx, sz);
      }
      if (hits) { out.offRoad++; continue; }
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const base = surfaceAt(mx, mz);
      if (solid || b.k === 'hedge') {
        const g = new THREE.BoxGeometry(b.k === 'hedge' ? 0.7 : 0.28, h, L);
        g.rotateY(ang); g.translate(mx, base + h / 2, mz);
        merger.add(g, mat, mx, mz);
      } else {
        for (const yy of [h * 0.95, h * 0.45]) {
          const g = new THREE.BoxGeometry(0.05, 0.07, L);
          g.rotateY(ang); g.translate(mx, base + yy, mz);
          merger.add(g, mat, mx, mz);
        }
        // posts every ~2.4m so it reads as a fence and not two floating wires
        const nP = Math.max(2, Math.round(L / 2.4));
        for (let k = 0; k <= nP; k++) {
          const f = k / nP;
          const px = x0 + (x1 - x0) * f, pz = z0 + (z1 - z0) * f;
          if (anyRoad(px, pz, 0.2) || !dryHere(px, pz)) continue;
          const g = new THREE.BoxGeometry(0.07, h, 0.07);
          g.translate(px, surfaceAt(px, pz) + h / 2, pz);
          merger.add(g, mat, px, pz);
        }
      }
    }
    out.barrierRuns++;
  }

  // ---- PARK FURNITURE ------------------------------------------------------
  //
  // The things that make a park somewhere you would STOP. Benches, fountains,
  // shelters, playgrounds, memorials and public artwork were all surveyed, all
  // fetched into `data.parkfurn`, and all drawn as bare grass.
  //
  // Drawn HERE rather than in its own pass so it inherits this function's two
  // guards for free: nothing in a carriageway, and nothing seated where the
  // drawn ground has been cut away under water. Furniture is the layer most
  // likely to sit near a quay edge, so the second one matters.
  //
  // Sizes are real-world and FIXED, not scaled from the OSM footprint: a bench
  // is 1.7m whether it was mapped as a node or a polygon. Only the things that
  // genuinely vary with their mapped area -- the playground and the fountain --
  // read `r`, and both are capped in process.py.
  const PF = {
    seat: new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 0.85 }),
    stone: new THREE.MeshStandardMaterial({ color: 0xcfc9bc, roughness: 0.88 }),
    water: new THREE.MeshStandardMaterial({
      color: 0x5f8fa6, roughness: 0.25, metalness: 0.1,
    }),
    play: new THREE.MeshStandardMaterial({ color: 0xc4603f, roughness: 0.8 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x7d8a7a, roughness: 0.8 }),
  };
  for (const f of data.parkfurn || []) {
    await YW();
    const px = f.p[0], pz = f.p[1];
    if (anyRoad(px, pz, 0.4) || !dryHere(px, pz)) { out.offRoad++; continue; }
    const y = surfaceAt(px, pz);
    const r = f.r || 0;
    // a stable per-item angle from the position, so nothing spins between
    // builds and the determinism check stays happy
    const ang = ((px * 7.3 + pz * 3.1) % Math.PI);
    if (f.k === 'bench') {
      const s = new THREE.BoxGeometry(1.7, 0.09, 0.46);
      s.rotateY(ang); s.translate(px, y + 0.44, pz);
      merger.add(s, PF.seat, px, pz);
      const bk = new THREE.BoxGeometry(1.7, 0.42, 0.07);
      bk.rotateY(ang);
      bk.translate(px - Math.cos(ang) * 0.2, y + 0.66, pz + Math.sin(ang) * 0.2);
      merger.add(bk, PF.seat, px, pz);
      for (const sx of [-0.68, 0.68]) {
        const lg = new THREE.BoxGeometry(0.08, 0.44, 0.4);
        lg.rotateY(ang);
        lg.translate(px + Math.sin(ang + Math.PI / 2) * sx, y + 0.22,
                     pz + Math.cos(ang + Math.PI / 2) * sx);
        merger.add(lg, MAT.metal, px, pz);
      }
    } else if (f.k === 'fountain') {
      const R = Math.max(2.2, Math.min(r || 3, 9));
      const basin = new THREE.CylinderGeometry(R, R, 0.55, 20, 1, true);
      basin.translate(px, y + 0.27, pz);
      merger.add(basin, PF.stone, px, pz);
      const disc = new THREE.CylinderGeometry(R - 0.22, R - 0.22, 0.06, 20);
      disc.translate(px, y + 0.45, pz);
      merger.add(disc, PF.water, px, pz);
    } else if (f.k === 'shelter') {
      const R = Math.max(2.0, Math.min(r || 2.6, 6));
      for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const p2 = new THREE.BoxGeometry(0.14, 2.5, 0.14);
        p2.translate(px + sx * R * 0.8, y + 1.25, pz + sz * R * 0.8);
        merger.add(p2, MAT.metal, px, pz);
      }
      const rf = new THREE.BoxGeometry(R * 1.9, 0.16, R * 1.9);
      rf.rotateY(ang); rf.translate(px, y + 2.6, pz);
      merger.add(rf, PF.roof, px, pz);
    } else if (f.k === 'playground') {
      const R = Math.max(2.5, Math.min(r || 4, 12));
      // a frame and a slide, not a literal climbing structure: at the distance
      // a rider or a walker sees this, the silhouette is two uprights, a
      // crossbar and a ramp. Anything more is polygons nobody resolves.
      for (const sx of [-1, 1]) {
        const p2 = new THREE.BoxGeometry(0.12, 2.2, 0.12);
        p2.translate(px + sx * R * 0.5, y + 1.1, pz);
        merger.add(p2, PF.play, px, pz);
      }
      const bar = new THREE.BoxGeometry(R * 1.06, 0.12, 0.12);
      bar.translate(px, y + 2.2, pz);
      merger.add(bar, PF.play, px, pz);
      const slide = new THREE.BoxGeometry(0.9, 0.08, R * 0.9);
      slide.rotateX(-0.5);
      slide.translate(px, y + 0.85, pz + R * 0.45);
      merger.add(slide, MAT.metal, px, pz);
    } else if (f.k === 'memorial') {
      const base = new THREE.BoxGeometry(1.5, 0.3, 1.5);
      base.rotateY(ang); base.translate(px, y + 0.15, pz);
      merger.add(base, PF.stone, px, pz);
      const col = new THREE.BoxGeometry(0.7, 2.4, 0.7);
      col.rotateY(ang); col.translate(px, y + 1.5, pz);
      merger.add(col, PF.stone, px, pz);
    } else if (f.k === 'artwork') {
      const plinth = new THREE.CylinderGeometry(0.7, 0.85, 0.6, 12);
      plinth.translate(px, y + 0.3, pz);
      merger.add(plinth, PF.stone, px, pz);
      const form = new THREE.IcosahedronGeometry(0.95, 0);
      form.rotateY(ang); form.translate(px, y + 1.5, pz);
      merger.add(form, MAT.metal, px, pz);
    } else {
      continue;
    }
    out.parkFurn++;
  }

  await merger.flushY(world, {}, Y);
  return out;
}

// ---------------------------------------------------------------------------
// THE TRANSIT GEOGRAPHY (Sentosa first, 2026-08-03): the Sentosa Express
// viaduct and the cable car lines. GEOGRAPHY ONLY — nothing moves here; the
// rideable cable car is its own later feature and reads its line from the
// same data. Heights are honest about their provenance: OSM gives layer and
// bridge tags, published sources give nothing in metres, so the offsets below
// are plausibility values, commented as such, not laundered measurements.
//
// Merger.add takes pre-transformed GEOMETRY (mesh transforms are never read —
// the first cut of this function passed meshes and crashed the boot), so
// every piece bakes its rotation and position into the buffer here. Cables go
// through their own merger flushed cast:false — thousands of thin boxes in
// the shadow map would buy nothing.
export async function buildTransit(world, data, Y = null) {
  const YY = Y || (async () => {});
  const out = { monorail: 0, cablePylons: 0, cableCabins: 0 };

  // OVERHEAD-BY-MECHANISM: materials used ONLY for fabric that hangs above
  // the world (guideway beams, cables, cabins, pylon arms) carry
  // userData.transitOverhead, and P1b/W2 in audit_world.js exempt by that
  // flag — the same identity mechanism as o.name === 'bridgeDeck', chosen
  // over geometry signatures because this fabric is merged (no parameters
  // survive) and signatures are the allowlist that has rotted five times.
  // pierMat and pylonMat are DELIBERATELY unflagged: a support stands on the
  // ground, and the checks must keep catching one that stands anywhere wrong.
  const overhead = (m) => { m.userData.transitOverhead = true; return m; };
  const beamMat = overhead(new THREE.MeshLambertMaterial({ color: 0xc9c4bb }));  // concrete
  const pierMat = new THREE.MeshLambertMaterial({ color: 0xb5b0a6 });
  const pylonMat = new THREE.MeshLambertMaterial({ color: 0x85888c });           // tower steel
  const steelMat = overhead(new THREE.MeshLambertMaterial({ color: 0x8d9094 })); // arms, hangers
  const cableMat = overhead(new THREE.MeshLambertMaterial({ color: 0x3a3d40 }));
  const cabinMat = overhead(new THREE.MeshLambertMaterial({ color: 0x2f5f6b })); // teal cabin

  const merger = new Merger();
  const cables = new Merger();
  // bake pitch-then-yaw ('YXZ': Ry * Rx) plus position into the geometry
  const bake = (geo, mat, into, x, y, z, ry = 0, rx = 0) => {
    if (ry || rx) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, 0, 'YXZ')));
    geo.translate(x, y, z);
    into.add(geo, mat, x, z);
  };

  // -- the monorail guideway: twin concrete beams on slim piers ------------
  // OSM maps each running direction as its own way, which happens to be how
  // the real Sentosa Express reads: two parallel beams. Deck height comes
  // from the layer tag (1/3/5 observed) over smoothed local ground.
  for (const seg of (data.monorail || [])) {
    await YY();
    if (seg.tun) continue;                       // the tunnel run has no fabric
    const pts = seg.p;
    if (!pts || pts.length < 2) continue;
    const lift = 5 + 2.6 * Math.max(1, seg.lyr || 1);   // plausibility, not a survey
    const hs = pts.map(([x, z]) => groundAt(x, z) + lift);
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < hs.length - 1; i++) hs[i] = (hs[i - 1] + hs[i] + hs[i + 1]) / 3;
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      if (L < 0.5) continue;
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const y0 = hs[i], y1 = hs[i + 1];
      bake(new THREE.BoxGeometry(2.2, 1.4, L + 0.4), beamMat, merger,
           (x0 + x1) / 2, (y0 + y1) / 2 - 0.7, (z0 + z1) / 2, ang, Math.atan2(y1 - y0, L));
      // piers every ~26m along the segment, skipped over carriageways and
      // water (the beam spans those, exactly like the road bridges)
      for (let t = 13; t < L; t += 26) {
        const px = x0 + (x1 - x0) * (t / L), pz = z0 + (z1 - z0) * (t / L);
        if (window.__onRoad && window.__onRoad(px, pz, 2)) continue;
        if (window.__inWater && window.__inWater(px, pz)) continue;
        const gy = groundAt(px, pz);
        // DRY LAND BY THE HEIGHTFIELD, not the water polygons: the mapped sea
        // covers only part of the bbox (measured on the front-door map work),
        // so __inWater said "dry" over open harbour and piers stood in the
        // sea. The terrain knows the water everywhere. Where it is not land,
        // the beam spans — same refusal the road bridges make.
        if (gy < 0.8) continue;
        const py = y0 + (y1 - y0) * (t / L) - 1.4;
        if (py - gy < 2.5) continue;
        bake(new THREE.CylinderGeometry(0.55, 0.65, py - gy, 8), pierMat, merger,
             px, gy + (py - gy) / 2, pz);
      }
      out.monorail++;
    }
  }

  // -- the cable car: pylons, catenary cables, resting cabins --------------
  const cw = data.cableway || {};
  const lines = cw.lines || [];
  const RIDE_H = { gondola: 32, cable_car: 32, chair_lift: 9 };  // plausibility
  const profiles = lines.map((ln) => {
    const hs = ln.p.map(([x, z]) => groundAt(x, z) + (RIDE_H[ln.k] || 20));
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < hs.length - 1; i++) hs[i] = (hs[i - 1] + hs[i] + hs[i + 1]) / 3;
    }
    return hs;
  });
  const lineHeightAt = (x, z) => {
    let best = null, bd = 1e9;
    lines.forEach((ln, li) => {
      ln.p.forEach(([px, pz], i) => {
        const d = (px - x) ** 2 + (pz - z) ** 2;
        if (d < bd) { bd = d; best = profiles[li][i]; }
      });
    });
    return bd < 90 * 90 ? best : null;
  };
  // pylons: a tapered steel tower up to the cable it carries
  for (const py of (cw.pylons || [])) {
    await YY();
    const [x, z] = py.p;
    const top = lineHeightAt(x, z);
    if (top == null) continue;
    const gy = groundAt(x, z);
    // a tower needs dry land under it (heightfield test, see the pier note);
    // the harbour-crossing pylon is honestly refused until it gets a real
    // marine footing recipe — refuse rather than invent
    if (gy < 0.8) continue;
    const h = Math.max(6, top - gy + 1.5);
    bake(new THREE.CylinderGeometry(0.5, 1.15, h, 8), pylonMat, merger, x, gy + h / 2, z);
    bake(new THREE.BoxGeometry(6.4, 0.5, 0.7), steelMat, merger, x, gy + h - 0.4, z);
    out.cablePylons++;
  }
  // cables: two parallel lines per way segment with a shallow midpoint sag
  for (let li = 0; li < lines.length; li++) {
    const ln = lines[li], hs = profiles[li];
    const gauge = ln.k === 'chair_lift' ? 1.6 : 2.6;   // cabin track spacing
    for (let i = 0; i < ln.p.length - 1; i++) {
      await YY();
      const [x0, z0] = ln.p[i], [x1, z1] = ln.p[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      if (L < 2) continue;
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const nx = Math.cos(ang), nz = -Math.sin(ang);
      const sag = Math.min(6, L * 0.035);
      for (const side of [-0.5, 0.5]) {
        const ox = nx * gauge * side, oz = nz * gauge * side;
        const mx = (x0 + x1) / 2 + ox, mz = (z0 + z1) / 2 + oz;
        const my = (hs[i] + hs[i + 1]) / 2 - sag;
        const halves = [[x0 + ox, hs[i], z0 + oz, mx, my, mz], [mx, my, mz, x1 + ox, hs[i + 1], z1 + oz]];
        for (const [ax, ay, az, bx, by, bz] of halves) {
          const run = Math.hypot(bx - ax, bz - az);
          const cl = Math.hypot(run, by - ay);
          bake(new THREE.BoxGeometry(0.09, 0.09, cl), cableMat, cables,
               (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2,
               Math.atan2(bx - ax, bz - az), Math.atan2(by - ay, run));
        }
      }
      // resting cabins on the gondola lines only, spaced along the span —
      // static geography today, the rideable cabins replace them later
      if (ln.k !== 'chair_lift') {
        for (let t = L * 0.25; t < L; t += Math.max(60, L / 4)) {
          const cx = x0 + (x1 - x0) * (t / L), cz = z0 + (z1 - z0) * (t / L);
          const cy = hs[i] + (hs[i + 1] - hs[i]) * (t / L) - Math.sin(Math.PI * (t / L)) * sag - 1.6;
          bake(new THREE.BoxGeometry(1.9, 2.1, 1.9), cabinMat, merger, cx, cy, cz);
          bake(new THREE.BoxGeometry(0.12, 1.3, 0.12), steelMat, merger, cx, cy + 1.6, cz);
          out.cableCabins++;
        }
      }
    }
  }

  await merger.flushY(world, {}, Y);
  await cables.flushY(world, { cast: false }, Y);
  return out;
}

// ---------------------------------------------------------------------------
// BEACH LIFE (beautiful pass 1, 2026-08-03): the things that make Sentosa's
// beaches read as SENTOSA at first glance. Grounded in the banked research:
// palms on the sand (the one tree a Singapore beach actually has), the
// red-and-yellow flag PAIRS that mark swim zones (the only officially
// published colour on the sand), and Siloso's three Beach Patrol observation
// towers — count published, form/colour UNPUBLISHED so the hut is a plain
// elevated watch platform, not a claimed design. All deterministic from
// position hashes; nothing touches the placement RNG streams.
export async function buildBeachLife(world, data, Y = null) {
  const YY = Y || (async () => {});
  const out = { beachPalms: 0, swimFlags: 0, patrolTowers: 0 };
  const merger = new Merger();
  const trunkM = new THREE.MeshLambertMaterial({ color: 0x7a5c3d });
  const leafM = MAT.leaf;
  const poleM = new THREE.MeshLambertMaterial({ color: 0xd8d2c6 });
  const redM = new THREE.MeshLambertMaterial({ color: 0xc8352c, side: THREE.DoubleSide });
  const yellowM = new THREE.MeshLambertMaterial({ color: 0xe0b73a, side: THREE.DoubleSide });
  const hutM = new THREE.MeshLambertMaterial({ color: 0xe6e0d2 });

  const bake = (geo, mat, x, y, z, ry = 0, rx = 0) => {
    if (ry || rx) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, 0, 'YXZ')));
    geo.translate(x, y, z);
    merger.add(geo, mat, x, z);
  };
  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  const palmAt = (x, z, s) => {
    const gy = groundAt(x, z);
    const h = 6.4 * s;
    bake(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, h, 7), trunkM, x, gy + h / 2, z);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + ((x * 3.1 + z * 1.7) % 1);
      const fr = new THREE.PlaneGeometry(3.2 * s, 0.8 * s);
      fr.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-0.95, a + Math.PI / 2, 0, 'YXZ')));
      fr.translate(x + Math.sin(a) * 1.4 * s, gy + h - 0.35, z + Math.cos(a) * 1.4 * s);
      merger.add(fr, leafM, x, z);
    }
    out.beachPalms++;
  };

  const sands = (data.green || []).filter((g) => g.k === 'sand' && g.p && g.p.length >= 4);
  for (const sand of sands) {
    await YY();
    let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const [x, z] of sand.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    // PALMS STAND WHERE A TREE WAS SURVEYED, AND NOWHERE ELSE.
    //
    // This was a jittered 13m grid over the whole sand polygon, and the owner
    // called it correctly: "if the beach got no tree must be accurate, dont
    // anyhow plant tree". Counted against the survey, the grid put 789 palms
    // on sentosa's sand where OSM records 64 trees — twelve invented for every
    // real one. Worse, Tanjong Beach and Palawan Beach carry ZERO surveyed
    // trees on their sand and were being covered in palms anyway.
    //
    // A mapped WOOD is different and still gets filled (see plantSurveyed's
    // jungle pass): a wood is an area the survey says is full of trees. Sand
    // is an area the survey says is sand. Filling it is inventing.
    //
    // The palm FORM is the honest part to keep: a tree standing on a Singapore
    // beach is a coconut or a sea almond, not the generic crown, so a surveyed
    // beach tree is drawn as a palm here and skipped by plantSurveyed.
    for (const t of (data.trees || [])) {
      const jx = t[0], jz = t[1];
      if (!inRing(jx, jz, sand.p)) continue;
      if (window.__onRoad && window.__onRoad(jx, jz, 2.5)) continue;
      if (window.__blocked && window.__blocked(jx, jz)) continue;
      palmAt(jx, jz, 0.85 + ((jx * 6.1 + jz * 2.9) % 100) / 320);
    }
    // SWIM FLAGS STAND ON THE SEAWARD EDGE. Absolute elevation cannot find
    // the waterline here — the 35m DEM blends the jungle hill behind these
    // narrow strips, so the named beaches measure 5-16m "above sea" (probed).
    // The sand POLYGON knows its own sea side: an edge whose outward normal
    // lands on below-sea terrain faces the water. Flags every ~55m along
    // that edge, a metre inland; the pair is the official swim-zone mark.
    {
      let cx0 = 0, cz0 = 0;
      for (const [x, z] of sand.p) { cx0 += x; cz0 += z; }
      cx0 /= sand.p.length; cz0 /= sand.p.length;
      let acc = 0;
      for (let i = 0; i < sand.p.length - 1; i++) {
        const [ax, az] = sand.p[i], [bx, bz] = sand.p[i + 1];
        const L = Math.hypot(bx - ax, bz - az);
        if (L < 1) continue;
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        let nx = -(bz - az) / L, nz = (bx - ax) / L;
        if ((mx - cx0) * nx + (mz - cz0) * nz < 0) { nx = -nx; nz = -nz; }  // outward
        // WALK DOWNHILL TO THE REAL SHORELINE. Neither absolute elevation nor
        // the ring's own edges can find the sea here (probed: no direction
        // from the Siloso ring reaches water inside 140m — the mapped polygon
        // climbs the resort slope and the 35m DEM smears the hill into the
        // sand). The drawn world's one truth is the terrain falling into the
        // sea sheet: from each 55m station, follow the steepest descent until
        // the ground dips under the waterline, and plant the pair there.
        acc += L;
        while (acc >= 55) {
          acc -= 55;
          const t = 1 - acc / L;
          let fx = ax + (bx - ax) * t, fz = az + (bz - az) * t;
          let found = false, why = 'steps';
          for (let stepn = 0; stepn < 34; stepn++) {   // some shores start 200m+ upslope
            const h0 = groundAt(fx, fz);
            if (h0 < 1.0) { found = true; break; }   // the eased 0.8m band IS the waterline (terrain.py shore profile)
            const gx2 = groundAt(fx + 6, fz) - groundAt(fx - 6, fz);
            const gz2 = groundAt(fx, fz + 6) - groundAt(fx, fz - 6);
            const gl = Math.hypot(gx2, gz2);
            if (gl < 0.05) { why = 'flat@' + h0.toFixed(1); break; }
            fx -= (gx2 / gl) * 9;
            fz -= (gz2 / gl) * 9;
          }
          if (!found) {
            // the shore profile makes stepped plateaus (0.8/3.0/5.5) that a
            // gradient walk stalls on; a straight-line probe crosses them
            for (let a2 = 0; a2 < 8 && !found; a2++) {
              const dx2 = Math.cos(a2 / 8 * Math.PI * 2), dz2 = Math.sin(a2 / 8 * Math.PI * 2);
              for (let d2 = 8; d2 <= 88; d2 += 8) {
                if (groundAt(fx + dx2 * d2, fz + dz2 * d2) < 1.0) {
                  fx += dx2 * (d2 - 4); fz += dz2 * (d2 - 4);
                  found = true;
                  break;
                }
              }
            }
          }
          if (window.__flagDbg) window.__flagDbg.push({ found, why, endH: +groundAt(fx, fz).toFixed(1), fx: fx | 0, fz: fz | 0 });
          if (!found) continue;
          // no blocked() veto here: the waterline IS the water-wall's edge,
          // and a swim flag's whole job is standing on it
          const fy = groundAt(fx, fz);
          for (const off of [-1.4, 1.4]) {
            const px2 = fx + nz * off, pz2 = fz - nx * off;   // pair spread ALONG the edge
            bake(new THREE.CylinderGeometry(0.035, 0.045, 2.6, 6), poleM, px2, fy + 1.3, pz2);
            bake(new THREE.PlaneGeometry(0.62, 0.22), redM, px2 + 0.28, fy + 2.42, pz2, 0.3);
            bake(new THREE.PlaneGeometry(0.62, 0.22), yellowM, px2 + 0.28, fy + 2.2, pz2, 0.3);
          }
          out.swimFlags += 2;
        }
      }
    }
  }

  // THE SAND IN FRONT OF A BEACH BAR HAS THINGS ON IT.
  //
  // The owner: "the beaches i find dont really look like the real sentosa".
  // With the palms cut back to the 59 the survey records, the beaches read as
  // empty sand — which is accurate about trees and wrong about Sentosa, where
  // the whole length of Siloso and Palawan is loungers and umbrellas in front
  // of the bars.
  //
  // GROUNDED IN THE SURVEY, not scattered: a cluster is placed only in front
  // of a mapped beachfront VENUE — 78 of them within 70m of the sand on
  // sentosa, among them Bora Bora Beach Bar, Trapizza, Koufu and Samundar —
  // and it faces the way that venue faces the water. No venue, no furniture,
  // which is the same rule the palms now follow. Beach volleyball is
  // deliberately NOT built: none of the eleven mapped pitches lies on sand, so
  // there is nothing to build it from and inventing courts is exactly what was
  // just taken out of the palms.
  {
    const loungerM = new THREE.MeshLambertMaterial({ color: 0xe4dccb });
    const parasolM = new THREE.MeshLambertMaterial({ color: 0xc9743f, side: THREE.DoubleSide });
    const poleM2 = new THREE.MeshLambertMaterial({ color: 0xb8b2a6 });
    const edgeDist = (x, z, p) => {
      let best = 1e9;
      for (let i = 0; i < p.length; i++) {
        const a = p[i], c = p[(i + 1) % p.length];
        const vx = c[0] - a[0], vz = c[1] - a[1];
        const L2 = vx * vx + vz * vz || 1;
        let t = ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        best = Math.min(best, Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)));
      }
      return best;
    };
    for (const b of (data.buildings || [])) {
      if (!b.p || b.p.length < 3 || (b.a || 0) > 3000) continue;
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of b.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      const bx = (mnx + mxx) / 2, bz = (mnz + mxz) / 2;
      let host = null, hd = 70;
      for (const s of sands) {
        const d = edgeDist(bx, bz, s.p);
        if (d < hd) { hd = d; host = s; }
      }
      if (!host) continue;
      await YY();
      // walk out onto the sand: step away from the venue until inside the ring,
      // then lay the row across that direction
      let sx = 0, sz = 0;
      for (const [x, z] of host.p) { sx += x; sz += z; }
      sx /= host.p.length; sz /= host.p.length;
      let dx = sx - bx, dz = sz - bz;
      const dl = Math.hypot(dx, dz) || 1;
      dx /= dl; dz /= dl;
      let fx = null, fz = null;
      for (let step = 6; step <= 70; step += 4) {
        const px = bx + dx * step, pz = bz + dz * step;
        if (!inRing(px, pz, host.p)) continue;
        if (window.__onRoad && window.__onRoad(px, pz, 2)) continue;
        if (window.__blocked && window.__blocked(px, pz)) continue;
        if (groundAt(px, pz) < 0.9) break;      // past the waterline; stop
        fx = px; fz = pz; break;
      }
      if (fx === null) continue;
      // a short row along the shore, deterministic from position
      const along = ((bx * 3.1 + bz * 1.7) % 1) * Math.PI;
      const ax2 = Math.cos(along), az2 = Math.sin(along);
      const n = 3 + (((bx * 7.3 + bz * 2.9) | 0) % 3);
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2) * 4.6;
        const px = fx + ax2 * o, pz = fz + az2 * o;
        if (!inRing(px, pz, host.p)) continue;
        if (window.__onRoad && window.__onRoad(px, pz, 2)) continue;
        const gy = groundAt(px, pz);
        if (gy < 0.9) continue;
        // parasol: a pole and a shallow cone
        bake(new THREE.CylinderGeometry(0.045, 0.055, 2.3, 6), poleM2, px, gy + 1.15, pz);
        bake(new THREE.ConeGeometry(1.35, 0.42, 10), parasolM, px, gy + 2.4, pz);
        // two loungers under it, laid along the shore
        for (const s2 of [-0.95, 0.95]) {
          const lx = px + az2 * s2, lz = pz - ax2 * s2;
          const pad = new THREE.BoxGeometry(1.85, 0.1, 0.62);
          pad.applyMatrix4(new THREE.Matrix4().makeRotationY(-along));
          pad.translate(lx, gy + 0.36, lz);
          merger.add(pad, loungerM, lx, lz);
          for (const e2 of [-0.72, 0.72]) {
            bake(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 5), poleM2,
              lx + ax2 * e2, gy + 0.17, lz + az2 * e2);
          }
        }
        out.loungers = (out.loungers || 0) + 2;
        out.parasols = (out.parasols || 0) + 1;
      }
    }
  }

  // Siloso's three patrol towers (count published; form kept plain): thirds
  // along the named Siloso Beach polygon, on the dry sand
  const siloso = sands.find((s) => (s.n || '') === 'Siloso Beach');
  if (siloso) {
    let mnx = Infinity, mxx = -Infinity, mnz2 = Infinity, mxz2 = -Infinity;
    for (const [x, z] of siloso.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz2) mnz2 = z; if (z > mxz2) mxz2 = z;
    }
    for (const f of [0.25, 0.5, 0.75]) {
      await YY();
      const tx = mnx + (mxx - mnx) * f;
      // walk the column across the ring's own z extent for standable sand
      let best = null;
      for (let tz = mnz2; tz < mxz2; tz += 3) {
        if (!inRing(tx, tz, siloso.p)) continue;
        if (window.__blocked && window.__blocked(tx, tz)) continue;
        if (window.__onRoad && window.__onRoad(tx, tz, 2)) continue;
        best = [tz, groundAt(tx, tz)];
        break;
      }
      if (!best) continue;
      const [tz, gy] = best;
      for (const [lx, lz] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) {
        bake(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 6), poleM, tx + lx, gy + 1.6, tz + lz);
      }
      bake(new THREE.BoxGeometry(2.6, 0.14, 2.6), hutM, tx, gy + 3.25, tz);
      bake(new THREE.BoxGeometry(2.6, 0.9, 0.1), hutM, tx, gy + 3.75, tz - 1.25);
      bake(new THREE.BoxGeometry(2.6, 0.9, 0.1), hutM, tx, gy + 3.75, tz + 1.25);
      bake(new THREE.BoxGeometry(0.1, 0.9, 2.6), hutM, tx - 1.25, gy + 3.75, tz);
      bake(new THREE.BoxGeometry(2.9, 0.12, 2.9), redM, tx, gy + 4.45, tz);
      out.patrolTowers++;
    }
  }

  await merger.flushY(world, {}, Y);
  return out;
}
