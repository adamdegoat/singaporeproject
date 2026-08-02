// The furniture that makes a Singapore street read as one: covered walkway,
// bus shelters, pedestrian railings, traffic lights, fascia signage, planters.
// Everything is instanced and placed by walking the street axis.
import * as THREE from '../lib/three.module.js';
import { R, rand, pick, chance } from './tex.js';
// surfaceAt for anything standing ON the road. See the note in main.js's
// blocked(): a bridge deck is the road surface where a bridge crosses, and
// every prop this file places was seated on the terrain under it.
import { MAT, groundAt, surfaceAt, standable } from './city.js';
import { claim } from './roads.js';

const SIGN_COLS = [0xb5372e, 0x1f4f7a, 0xd6a53c, 0x2f6b4f, 0x7a3f6d, 0xcf6b3a, 0x2b2f33];

// Real map positions take priority over anything placed at an interval. Where
// OSM has the coordinate we use it; where it does not, we fall back and the
// stats say how many of each came from real data versus a fallback.
function nearestOnAxis(pts, x, z) {
  let bi = 0, bd = Infinity, bt = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const vx = x2 - x1, vz = z2 - z1;
    const L2 = vx * vx + vz * vz;
    let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + vx * t, pz = z1 + vz * t;
    const d = (x - px) ** 2 + (z - pz) ** 2;
    if (d < bd) { bd = d; bi = i; bt = t; }
  }
  const [x1, z1] = pts[bi], [x2, z2] = pts[bi + 1];
  const vx = x2 - x1, vz = z2 - z1, L = Math.hypot(vx, vz) || 1;
  return {
    x: x1 + vx * bt, z: z1 + vz * bt,
    ux: vx / L, uz: vz / L, dist: Math.sqrt(bd),
  };
}

export function buildFurniture(world, axis, isBlocked, data = {}) {
  // isBlocked already covers buildings AND carriageways; onRoad asks about the
  // carriageway alone, for things that are allowed to sit against a building
  const onRoad = (x, z, m) => (window.__onRoad ? window.__onRoad(x, z, m) : false);
  const pts = axis.p, half = axis.w / 2;
  const railT = [], postT = [], shelterAt = [], lightAt = [], signT = [], planterT = [], binT = [];
  const crossingS = [], taxiAt = [];

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;
      for (const sgn of [-1, 1]) {
        const railOff = (half + 1.1) * sgn;
        const rx = px + nx * railOff, rz = pz + nz * railOff;

        // pedestrian railing along the kerb, in 2m bays with a post each end
        if (acc % 2 === 0 && !isBlocked(rx, rz) && claim('rail', rx, rz, 1.2)) {
          railT.push([rx, 1.0, rz, ang]);
          if (acc % 4 === 0) postT.push([rx, 0.55, rz, ang]);
        }
        // bus shelters, taxi ranks and signals now come from the real map,
        // placed after this loop. Nothing here invents their position.
        // planters and bins
        if (acc % 46 === 12) {
          const qx = px + nx * (half + 6.4) * sgn, qz = pz + nz * (half + 6.4) * sgn;
          if (!isBlocked(qx, qz) && claim('planter', qx, qz, 2)) planterT.push([qx, 0.32, qz, ang]);
        }
        if (acc % 120 === 60) {
          const bx = px + nx * (half + 4.2) * sgn, bz = pz + nz * (half + 4.2) * sgn;
          if (!isBlocked(bx, bz) && claim('bin', bx, bz, 2)) binT.push([bx, 0.46, bz, ang]);
        }
        // fascia sign boxes above the shopfront line, facing the street
        if (acc % 26 === 8) {
          const gx = px + nx * (half + 12.5) * sgn, gz = pz + nz * (half + 12.5) * sgn;
          // the sign hangs 1.1m in front of the facade, so that is the point
          // that has to be clear of the road, not the facade itself
          const fx = px + nx * (half + 11.4) * sgn, fz = pz + nz * (half + 11.4) * sgn;
          if (isBlocked(gx, gz) && !onRoad(fx, fz, -0.5) && claim('fascia', gx, gz, 4)) {
            signT.push([fx, rand(6.2, 7.6), fz, ang, sgn]);
          }
        }
      }
    }
  }

  // Nearest point on ANY carriageway, with its direction. Bus stops and signals
  // used to be matched against the main axis alone and anything more than 60m
  // from it was thrown away: 48 mapped stops became 6 shelters and 61 mapped
  // signals became 14 heads, while the coordinates for all of them sat in the
  // scene file. A stop on a side street is still a stop.
  const nearestOnAnyRoad = (x, z) => {
    let best = null, bd = Infinity;
    for (const r of (data.roads || [])) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
        const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
        let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const px = x1 + vx * t, pz = z1 + vz * t;
        const d = (x - px) ** 2 + (z - pz) ** 2;
        if (d < bd) {
          const L = Math.hypot(vx, vz) || 1;
          bd = d; best = { x: px, z: pz, ux: vx / L, uz: vz / L, dist: Math.sqrt(d) };
        }
      }
    }
    return best;
  };

  // ---- real positions from OpenStreetMap ----
  const realCount = { busstops: 0, signals: 0, taxis: 0 };
  for (const b of data.busstops || []) {
    const [bx, bz] = b.p;
    const on = nearestOnAnyRoad(bx, bz) || nearestOnAxis(pts, bx, bz);
    if (on.dist > 45) continue;                 // not beside a road at all
    const ang2 = Math.atan2(on.ux, on.uz);
    const side = ((bx - on.x) * -on.uz + (bz - on.z) * on.ux) >= 0 ? 1 : -1;
    // OSM SAYS WHICH STOPS HAVE WHAT. We were deciding the shelter by whether a
    // 9.2m roof happened to fit, and inventing benches and bins; 94 of these
    // stops carry a `shelter` tag, 97 carry the actual bus numbers in
    // `route_ref`. Where the map has an opinion it wins; where it is silent the
    // frontage test still decides.
    shelterAt.push([bx, bz, ang2, side, b.n || '', b]);
    realCount.busstops++;
  }
  for (const sPt of data.signals || []) {
    const [lx, lz] = sPt;
    const onAxis = nearestOnAxis(pts, lx, lz);
    const on = onAxis.dist <= 40 ? onAxis : (nearestOnAnyRoad(lx, lz) || onAxis);
    // off the main street the head still cycles; it just does not gate traffic,
    // which only drives the axis
    if (on.dist > 30) continue;
    const ang2 = Math.atan2(on.ux, on.uz);
    const side = ((lx - on.x) * -on.uz + (lz - on.z) * on.ux) >= 0 ? 1 : -1;
    // arclength along the axis, so the signal controller can key off it
    let acc2 = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const seg = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      const on2 = nearestOnAxis([pts[i], pts[i + 1]], lx, lz);
      if (Math.abs(on2.x - on.x) < 0.5 && Math.abs(on2.z - on.z) < 0.5) {
        acc2 += Math.hypot(on.x - pts[i][0], on.z - pts[i][1]);
        break;
      }
      acc2 += seg;
    }
    lightAt.push([lx, lz, ang2, side, Math.round(acc2)]);
    realCount.signals++;
  }
  for (const t of data.taxis || []) {
    // A RANK ON A BACK STREET IS STILL A RANK. Same fix bus stops and signals
    // carry above: matched against the main axis alone, 175 of the world's 205
    // mapped ranks were thrown away and seven districts drew none at all
    // (kallang, keppel, rivervalley, marinaeast, robertson, sentosa,
    // tanjongrhu — measured 2026-08-02 against every district file).
    // The claim() is REQUIRED, not tidy: buildFurniture runs once per axis in
    // the flat multi-axis path, and matched against ANY road every pass would
    // place every rank once per axis.
    const on = nearestOnAnyRoad(t[0], t[1]) || nearestOnAxis(pts, t[0], t[1]);
    if (on.dist > 60) continue;
    if (!claim('taxirank', t[0], t[1], 8)) continue;
    const ang2 = Math.atan2(on.ux, on.uz);
    const side = ((t[0] - on.x) * -on.uz + (t[1] - on.z) * on.ux) >= 0 ? 1 : -1;
    taxiAt.push([t[0], t[1], ang2, side]);
    realCount.taxis++;
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  // Chunk instanced runs by ~260m so distant sections frustum-cull. A single
  // mesh spanning 2.4km of street is never culled and always drawn in full.
  const CHUNK = 260;
  const emit = (geo, mat, list, fn, colFn, tag) => {
    // Street furniture is not built on water either. blocked() knows about the
    // reservoir, but several of these lists are filled by paths that never ask
    // it -- the same reason markings.js needed one guard at the emit point.
    if (window.__inWater) list = list.filter((r) => standable(r[0], r[2]));
    if (!list.length) return null;
    const buckets = new Map();
    list.forEach((rec) => {
      const k = `${Math.floor(rec[0] / CHUNK)},${Math.floor(rec[2] / CHUNK)}`;
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(rec);
    });
    let last = null;
    for (const group of buckets.values()) {
      const im = new THREE.InstancedMesh(geo, mat, group.length);
      group.forEach((rec, i) => {
        fn(rec); m.compose(p, q, s); im.setMatrixAt(i, m);
        if (colFn) im.setColorAt(i, colFn(rec, i));
      });
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = false; im.receiveShadow = true;
      // TAGGED AT THE MESH so a check can ask what a thing IS rather than
      // recognising it by its measurements. D20 identified the covered-walkway
      // roof as "a box 2.4-4.2m wide and under 35cm thick", which is a
      // description several other emitters also satisfy — the fifth geometry
      // signature allowlist in this project, and they have broken in the same
      // way every time.
      if (tag) im.userData[tag] = true;
      world.add(im);
      last = im;
    }
    return last;
  };
  const yaw = (r) => { p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); };

  // railing: a top rail and a lower rail, the classic grey tube barrier
  emit(new THREE.BoxGeometry(0.06, 0.05, 2.0), MAT.metal, railT, yaw);
  emit(new THREE.BoxGeometry(0.05, 0.04, 2.0), MAT.metal, railT, (r) => {
    p.set(r[0], surfaceAt(r[0], r[2]) + 0.62, r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  emit(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 6), MAT.metal, postT, yaw);

  // planters and bins
  emit(new THREE.CylinderGeometry(0.55, 0.46, 0.64, 10), MAT.conc, planterT, yaw);
  emit(new THREE.SphereGeometry(0.52, 8, 6), MAT.canopy, planterT, (r) => {
    p.set(r[0], surfaceAt(r[0], r[2]) + 0.86, r[2]); q.identity();
  });
  emit(new THREE.CylinderGeometry(0.24, 0.2, 0.9, 8), MAT.darkMetal, binT, yaw);

  // fascia signage: colour blocks over the shopfront, no brand marks
  const cc = new THREE.Color();
  emit(new THREE.BoxGeometry(0.28, 1.05, 2.6),
    new THREE.MeshStandardMaterial({ roughness: 0.55 }), signT,
    (r) => { p.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e); },
    () => cc.setHex(pick(SIGN_COLS)));

  // Bus stops. Every mapped stop gets a pole and a flag, because a stop is a
  // stop whether or not it is sheltered — and skipping the shelter used to make
  // the whole stop vanish, so 42 of 48 real stops were simply absent from the
  // street. The shelter is 9.2m by 3.1m and only goes in where that fits, which
  // on most side streets it does not.
  let poles = 0, shelters = 0;
  for (const [sx, sz, ang, sgn, sname, rec] of shelterAt) {
    // local axes of a group rotated by rotation.y = ang
    const lx0 = Math.cos(ang), lz0 = -Math.sin(ang);   // local +x in world
    const fx0 = Math.sin(ang), fz0 = Math.cos(ang);    // local +z in world

    // the pole first: a 0.1m post needs almost nothing, so nudge it clear
    // A node mapped on the centreline of a 16m road needs to travel further than
    // the default search allows, and a failed search must NOT fall back to the
    // point it was asked to move: that is how street furniture kept ending up in
    // the traffic. No clear spot means no pole.
    // pushClear moves a point out of a CARRIAGEWAY. It knows nothing about
    // buildings, so a stop mapped near a frontage was shoved off the tarmac and
    // straight into a wall: 24 stops and taxi ranks ended up inside buildings.
    // Walk outward from the cleared point until it is clear of both, and if
    // there is nowhere, build nothing — a failed search must never fall back to
    // the point it was asked to fix.
    const moved = window.__pushClear && window.__pushClear(sx, sz, 0.9, 18);
    if (!moved) continue;
    let [px, pz] = moved;
    // A stop has to end up beside the street it serves. pushClear is allowed to
    // travel eighteen metres to escape a wide carriageway, and twice that left a
    // pole stranded in the middle of a block with no road near it. Treat "too
    // far from any road" exactly like "inside a building": look for somewhere
    // that is both, or build nothing.
    const stranded = window.__onRoad && !window.__onRoad(px, pz, 13);
    if (isBlocked(px, pz) || stranded) {
      // and it must still be a BUS STOP when it gets there. The first version
      // only asked for somewhere unblocked, and pushed two poles so far out of a
      // frontage that they no longer stood beside any road. A stop that is not
      // on a street is not a stop, so require both, and build nothing if there
      // is nowhere that is both.
      let ok = null;
      for (let r = 1.5; r <= 12 && !ok; r += 1.5) {
        for (let a2 = 0; a2 < 16; a2++) {
          const th = (a2 / 16) * Math.PI * 2;
          const tx = px + Math.cos(th) * r, tz = pz + Math.sin(th) * r;
          if (isBlocked(tx, tz)) continue;
          if (window.__onRoad && !window.__onRoad(tx, tz, 13)) continue;
          ok = [tx, tz]; break;
        }
      }
      if (!ok) continue;
      [px, pz] = ok;
    }
    const gp = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 3.1, 8), MAT.metal);
    pole.position.y = 1.55; pole.castShadow = true; gp.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2f6b3d, roughness: 0.4 }));
    flag.position.set(0.34, 2.75, 0); flag.castShadow = true; gp.add(flag);
    gp.position.set(px, surfaceAt(px, pz), pz);
    gp.rotation.y = ang;
    world.add(gp);
    poles++;

    // then the shelter, if the whole footprint will fit off the carriageway
    const SPAN = 4.8, DEPTH = 1.8;
    const clearAt = (cx3, cz3) => {
      for (const a3 of [-SPAN, -SPAN / 2, 0, SPAN / 2, SPAN])
        for (const d3 of [-DEPTH, 0, DEPTH]) {
          const tx3 = cx3 + lx0 * a3 + fx0 * d3;
          const tz3 = cz3 + lz0 * a3 + fz0 * d3;
          if (window.__onRoad && window.__onRoad(tx3, tz3, -0.4)) return false;
        }
      return true;
    };
    let bx2 = sx, bz2 = sz, stand = false;
    for (const dir3 of [1, -1]) {
      for (let back = 0; back <= 8; back += 1.1) {
        const cx3 = sx + fx0 * back * dir3, cz3 = sz + fz0 * back * dir3;
        if (clearAt(cx3, cz3)) { bx2 = cx3; bz2 = cz3; stand = true; break; }
      }
      if (stand) break;
    }
    if (!stand) continue;
    // the map's answer beats the fit test
    if (rec && rec.sh === 0) continue;
    shelters++;

    // THE SHELTER, AT LTA'S PUBLISHED COLOURS AND DIMENSIONS.
    //
    // Researched 2026-07-29 against LTA SDRE Ch.11 (BUS1-BUS5), whose drawing
    // BUS5 specifies the scheme outright -- this is not a palette anyone had
    // to choose:
    //   column, rafter, fascia   RAL 7012 basalt grey
    //   roof panel top           RAL 7045 grey
    //   roof panel underside     RAL 9002 off-white
    //   bench                    RAL 7004 signal grey
    //   BACK REST                RAL 6027 light green
    // The light-green backrest is the detail a Singaporean spots instantly and
    // nothing else on the street uses that colour. The shelter is 3m deep in
    // 3m-long modules, structural clear height 3.0m, and the roof panel is
    // flat aluminium honeycomb -- not the curved canopy this had.
    const g = new THREE.Group();
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.14, 3.0), MAT.busRoof);
    roof.position.y = 3.0; roof.castShadow = true; g.add(roof);
    const soffit = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.05, 2.9), MAT.busSoffit);
    soffit.position.y = 2.92; g.add(soffit);
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.26, 0.06), MAT.busGrey);
    fascia.position.set(0, 2.88, 1.5); g.add(fascia);
    for (let k = 0; k < 4; k++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 0.12), MAT.busGrey);
      post.position.set(-4.1 + k * 2.7, 1.5, 1.35); post.castShadow = true; g.add(post);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.7, 0.08), MAT.glass);
    back.position.set(0, 1.95, -1.4); g.add(back);
    // one bench per 3m module, cantilevered, with the light-green back rest
    for (let k = -1; k <= 1; k++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.09, 0.42), MAT.busBench);
      bench.position.set(k * 2.9, 0.62, -1.05); bench.castShadow = true; g.add(bench);
      const rest = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.34, 0.07), MAT.busRest);
      rest.position.set(k * 2.9, 0.92, -1.26); g.add(rest);
    }
    // the illuminated route-number panel
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x27313a, roughness: 0.3 }));
    panel.position.set(4.4, 1.7, -1.0); g.add(panel);
    // SAFETY BOLLARDS AT 3m CENTRES along the kerb line, painted to match the
    // shelter column (RAL 7012) with a reflective band at the top -- SDRE
    // BUS5 again, and they are on every bus stop in Singapore.
    for (let k = -1; k <= 1; k++) {
      const bol = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.0, 8), MAT.busGrey);
      bol.position.set(k * 3.0, 0.5, 2.05); bol.castShadow = false; g.add(bol);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 8), MAT.hiVis);
      band.position.set(k * 3.0, 0.92, 2.05); g.add(band);
    }
    g.position.set(bx2, surfaceAt(bx2, bz2), bz2); g.rotation.y = ang;
    world.add(g);
  }

  // traffic lights. Each junction shares one signal state, keyed by its
  // distance along the street, so vehicles can look it up.
  const signals = new Map();     // arclength -> {lenses:[red,amber,green], phase}
  for (const [lx, lz, ang, sgn, atS] of lightAt) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 5.4, 8), MAT.darkMetal);
    pole.position.y = 2.7; pole.castShadow = true; g.add(pole);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 6), MAT.darkMetal);
    arm.position.set(-1.5 * sgn, 5.2, 0); arm.rotation.z = Math.PI / 2; arm.castShadow = true; g.add(arm);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.86, 0.3), MAT.darkMetal);
    // RAISED so the lowest lens clears 4.8m -- P1 sizes overhead clearance by a
    // 4.3m double-decker plus margin, and the green lens sat at 4.64m. A real
    // signal head over a bus route hangs higher than this did.
    box.position.set(-2.9 * sgn, 5.35, 0); box.castShadow = true; g.add(box);
    // Individual lens meshes, flagged dyn so consolidate.js leaves them alone.
    //
    // These were instanced into one mesh to save 129 draw calls, and it broke
    // the live site: the reference handed to Signals was not a working
    // InstancedMesh by the time the first frame ran, so setColorAt threw EVERY
    // FRAME, which killed the render loop and left the page sitting on
    // "loading Orchard" forever. The world loaded fine; the first frame threw.
    //
    // Reverted rather than patched around, because a broken world is worse
    // than 129 draw calls. To retry: resolve the mesh BY NAME inside
    // Signals.update rather than holding a reference across build, and verify
    // at PHONE SIZE on the deployed site before trusting it -- the local gates
    // all passed while this was broken.
    const lenses = [];
    for (let k = 0; k < 3; k++) {
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 10),
        new THREE.MeshStandardMaterial({
          color: [0x5a1f18, 0x5a441a, 0x1b3f27][k],
          emissive: 0x000000, emissiveIntensity: 1.0,
        }));
      lens.position.set(-2.9 * sgn, 5.63 - k * 0.27, 0.16);
      lens.userData.dyn = true;    // repainted every frame; must not be baked
      g.add(lens);
      lenses.push(lens);
    }
  // real OSM coordinate, often mapped on the kerb line: nudge it clear of the
  // carriageway rather than dropping a shelter into the traffic
    const mv = window.__pushClear ? window.__pushClear(lx, lz, -0.6, 18) : [lx, lz];
    if (!mv) continue;
    const [lx2, lz2] = mv;
    g.position.set(lx2, surfaceAt(lx2, lz2), lz2); g.rotation.y = ang;
    world.add(g);

    if (!signals.has(atS)) signals.set(atS, { s: atS, lenses: [], phase: signals.size * 5.5 });
    signals.get(atS).lenses.push(lenses);
  }

  // taxi stands: the yellow-topped rank sign, a queue rail, and a waiting cab
  let noCabAtRank = 0, noRailAtRank = 0;
  for (const [tx, tz, ang, sgn] of taxiAt) {
    // WHERE THE RANK STANDS, BEFORE ANY OF IT IS LAID OUT.
    //
    // The sign was pushed clear and then the queue rail, six metres of it, was
    // hung off the sign at a fixed -0.9 with nothing checking where that fell.
    // Five of its posts were in Killiney Road, and two of them were also the
    // only two things T1 could see blocking a carriageway there. Third instance
    // of build-then-place in this codebase after the footbridge and the rank's
    // own cab: if a group is positioned after its parts are laid out, no part
    // can be tested against the world it will land in.
    // POSITIVE margin, like the bus shelter's 0.9 above — not the prop
    // default of -0.6. A negative margin tolerates a sign standing up to
    // 0.6m INSIDE the carriageway edge, which no orchard rank ever exercised
    // because their nodes sit on pavements; the first back-street pass placed
    // a rank board in Republic Avenue (kallang P1b, deploy 2026-08-02) from a
    // node mapped on the road edge, and the gate caught it.
    const mvt = window.__pushClear ? window.__pushClear(tx, tz, 0.9, 18) : [tx, tz];
    if (!mvt) continue;
    const [tx2, tz2] = mvt;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const clearLocal = (lx, lz, m = 0.3) =>
      !(window.__onRoad && window.__onRoad(tx2 + lx * ca + lz * sa,
                                           tz2 - lx * sa + lz * ca, m));

    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8), MAT.metal);
    pole.position.y = 1.5; pole.castShadow = true; g.add(pole);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xd8b43c, roughness: 0.55 }));
    board.position.set(0, 2.9, 0); board.castShadow = true; g.add(board);

    // The queue rail goes on the PAVEMENT side. Which side that is depends on
    // the rank, so try both and test the whole six-metre run rather than one
    // end of it. If neither side is clear the rank keeps its sign and loses its
    // rail: a failed search skips, it does not substitute.
    let railX = null;
    for (const cand of [-0.9, 0.9]) {
      let ok = true;
      for (let k = 0; k < 5 && ok; k++) {
        if (!clearLocal(cand, 0.4 + k * 1.4)) ok = false;
        if (!clearLocal(cand, 1.0 + k * 1.4)) ok = false;
      }
      if (ok) { railX = cand; break; }
    }
    if (railX === null) noRailAtRank++;
    else for (let k = 0; k < 5; k++) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 1.4), MAT.metal);
      r.position.set(railX, 1.0, 1.0 + k * 1.4); g.add(r);
      const pst = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), MAT.metal);
      pst.position.set(railX, 0.5, 0.4 + k * 1.4); g.add(pst);
    }

    // A cab at the head of the rank: SG taxis are commonly blue or black.
    //
    // From the RANK'S OWN POSITION, not Math.random() and not the shared
    // stream. Math.random() made the world unreproducible between reloads,
    // which nothing else here is. But reaching for `chance()` instead would
    // draw from the module-level PRNG that also drives every placement after
    // it, and this file has just been burned by exactly that: adding one
    // texture that consumed 3,600 numbers moved street furniture 1.5km away.
    // A local hash is deterministic and perturbs nothing.
    const cabCol = ((Math.abs((tx2 * 31 + tz2 * 17) | 0) % 2) === 0) ? 0x2f5f9e : 0x1f2225;
    const cab = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color: cabCol, roughness: 0.4, metalness: 0.3 });
    const gl = new THREE.MeshStandardMaterial({ color: 0x2a323a, roughness: 0.12, metalness: 0.2 });
    const bx = (w, h, d, mat, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); m.castShadow = true; cab.add(m);
    };
    bx(1.78, 0.62, 4.4, paint, 0, 0.6, 0);
    bx(1.64, 0.52, 2.1, paint, 0, 1.12, -0.25);
    bx(1.69, 0.4, 2.0, gl, 0, 1.10, -0.25);
    bx(0.62, 0.2, 0.5, new THREE.MeshStandardMaterial({
      color: 0xf0e2b0, emissive: 0xd8a83c, emissiveIntensity: 0.5 }), 0, 1.48, -0.25);
    const w = new THREE.CylinderGeometry(0.31, 0.31, 0.22, 10);
    for (const [wx, wz] of [[0.86, 1.45], [-0.86, 1.45], [0.86, -1.45], [-0.86, -1.45]]) {
      const wheel = new THREE.Mesh(w, MAT.darkMetal);
      wheel.rotation.x = Math.PI / 2; wheel.position.set(wx, 0.31, wz);
      wheel.castShadow = true; cab.add(wheel);
    }
    // THE WAITING CAB GOES IN THE LAY-BY, NOT IN A RUNNING LANE.
    //
    // The sign and the queue rail are pushed clear, and then the cab was hung
    // 2.6m off them toward the road with nothing checking where that landed --
    // 21 P1b findings, counting its body, glass, lamp and four wheels. A rank
    // in Singapore is a lay-by at the kerb, so a cab at the kerb is right and a
    // cab in a traffic lane is not. Try the offset, then progressively smaller
    // ones, and if the cab has nowhere to stand build the rank without it: a
    // failed search must never fall back to the point it was asked to fix.
    let placed = false;
    for (const off of [2.6, 2.0, 1.5, 1.0, 0.5]) {
      const lx = -off * sgn, lz = 2.0;
      let clear = true;
      // the cab's own plan, 1.78 x 4.4, tested at its corners
      for (const ox of [-0.9, 0, 0.9])
        for (const oz of [-2.2, 0, 2.2]) {
          const wx2 = tx2 + (lx + ox) * ca + (lz + oz) * sa;
          const wz2 = tz2 - (lx + ox) * sa + (lz + oz) * ca;
          if (window.__onRoad && window.__onRoad(wx2, wz2, 0.3)) { clear = false; }
        }
      if (!clear) continue;
      cab.position.set(lx, 0, lz);
      g.add(cab);
      placed = true; break;
    }
    if (!placed) noCabAtRank++;
    g.position.set(tx2, surfaceAt(tx2, tz2), tz2); g.rotation.y = ang;
    world.add(g);
  }

  // Covered walkway along the footways OSM actually tags as covered, rather
  // than wherever we guessed a frontage existed.
  const linkPost = [], linkRoof = [], linkBeam = [];
  let realCovered = 0;
  for (const line of (data.covered || [])) {
    if (line.length < 2) continue;
    realCovered++;
    for (let i = 0; i < line.length - 1; i++) {
      const [x1, z1] = line[i], [x2, z2] = line[i + 1];
      const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
      if (len < 0.5) continue;
      const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
      const ang = Math.atan2(ux, uz);
      for (let t = 0; t < len; t += 3.4) {
        const cxp = x1 + ux * t, czp = z1 + uz * t;
        // OSM traces these ways through junctions and building lobbies. A
        // roofed walkway on posts standing in a live carriageway is something
        // you ride into, so those segments are simply not built.
        if (isBlocked(cxp, czp)) continue;
        if (!claim('covered', cxp, czp, 3.0)) continue;   // OSM ways overlap
        // POSTS FIRST, ROOF ONLY IF SOMETHING HOLDS IT UP. The roof used to be
        // pushed unconditionally and the posts tested separately, so a segment
        // whose posts both landed in a carriageway kept its roof and floated
        // (defect D20). A roof with no post is not a walkway.
        let posts = 0;
        for (const sgn of [1, -1]) {
          const lx = cxp + nx * 1.5 * sgn, lz = czp + nz * 1.5 * sgn;
          if (!isBlocked(lx, lz)) { linkPost.push([lx, 1.6, lz, ang]); posts++; }
        }
        if (!posts) continue;
        linkRoof.push([cxp, 3.35, czp, ang]);
        linkBeam.push([cxp, 3.12, czp, ang]);
      }
    }
  }
  emit(new THREE.BoxGeometry(3.4, 0.13, 4.1), MAT.trim, linkRoof, yaw, null, 'walkwayRoof');
  emit(new THREE.BoxGeometry(0.18, 0.22, 4.1), MAT.metal, linkBeam, yaw);
  emit(new THREE.CylinderGeometry(0.075, 0.075, 3.2, 8), MAT.metal, linkPost, yaw, null, 'walkwayPost');

  const signalList = [...signals.values()];

  return {
    signals: signalList,
    realCovered,
    realBusStops: realCount.busstops,
    realSignals: realCount.signals,
    realTaxis: realCount.taxis,
    taxiStands: taxiAt.length,
    ranksWithNoCab: noCabAtRank,
    ranksWithNoRail: noRailAtRank,
    linkway: linkRoof.length,
    rails: railT.length, shelters, stopPoles: poles,
    lights: lightAt.length, signs: signT.length, planters: planterT.length,
  };
}

// PARKED CARS AT THE KERB, from the map's own parking lanes.
//
// A Singapore street with no parked cars on it reads as a rendering rather than
// a street, and the data has been sitting in the extract the whole time:
// **1,135 `parking:lane:*` tags across the eight districts** — 716 parallel,
// 299 perpendicular, 26 diagonal. data/unused.py has listed them as DEFERRED
// for weeks with the note "the data that will place parked cars when traffic
// learns to park". Tenth instance of real data present and unread.
//
// THE ORIENTATION IS THE POINT. A parallel bay, a nose-in perpendicular bay and
// a diagonal bay put a car at three different angles and three different
// spacings; the map states which, so none of it is guessed. Parallel sits along
// the kerb at ~6.4m centres, perpendicular nose-in at ~2.7m, diagonal at ~3.4m
// and forty-five degrees off.
export function buildParkedCars(world, data = {}, isBlocked = null) {
  const roads = data.roads || [];
  const rows = [];
  const SPACING = { parallel: 6.4, perpendicular: 2.7, diagonal: 3.4 };
  const YAWOFF = { parallel: 0, perpendicular: Math.PI / 2, diagonal: Math.PI / 4 };
  for (const r of roads) {
    const pk = r.pk;
    if (!pk || !r.p || r.p.length < 2) continue;
    if (r.bridge) continue;                     // no kerbside bay on a deck
    const half = Math.max(2.0, (r.w || 6) / 2);
    for (const side of ['left', 'right']) {
      const kind = pk[side];
      if (!kind) continue;
      const step = SPACING[kind] || 6.4;
      const sgn = side === 'left' ? -1 : 1;
      // the bay sits INSIDE the carriageway edge: a parallel car is about 1.9m
      // wide and hard against the kerb, a nose-in one reaches further in
      const off = half - (kind === 'parallel' ? 1.25 : 2.4);
      if (off <= 0.6) continue;
      let carry = 0;
      for (let i = 0; i < r.p.length - 1; i++) {
        const a = r.p[i], b = r.p[i + 1];
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const L = Math.hypot(dx, dz);
        if (L < 0.01) continue;
        const ux = dx / L, uz = dz / L;
        const nx = -uz, nz = ux;
        for (let t = carry; t < L; t += step) {
          const x = a[0] + ux * t + nx * off * sgn;
          const z = a[1] + uz * t + nz * off * sgn;
          if (isBlocked && isBlocked(x, z)) continue;
          if (!standable(x, z)) continue;
          rows.push([x, z, Math.atan2(ux, uz) + YAWOFF[kind] * sgn]);
        }
        carry = step - ((L - carry) % step || step);
      }
    }
  }
  if (!rows.length) return { parked: 0 };

  // one instanced body/roof/glass set, exactly as the moving fleet is built
  const BODY = [0xdcdcd6, 0x2f3336, 0x8f9498, 0x1f3f6b, 0x7a2727, 0xe8e4d8];
  const mk = (geo, mat) => {
    const im = new THREE.InstancedMesh(geo, mat, rows.length);
    im.castShadow = false; im.receiveShadow = true;
    // EXEMPT BY MECHANISM, not by shape. A parked car stands IN the carriageway
    // — that is what a parking lane is — so P1 counts every one of them as a
    // prop in the road: 6,504 on Little India alone, against a budget of zero.
    // The fourth signature allowlist in this file is not the answer; the flag
    // is, exactly as the crowd got userData.crowdPart.
    im.userData.parked = true;
    return im;
  };
  const paint = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.15 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x2a3138, roughness: 0.18, metalness: 0.5 });
  const body = mk(new THREE.BoxGeometry(1.82, 0.78, 4.32), paint);
  const roof = mk(new THREE.BoxGeometry(1.62, 0.62, 2.35), paint);
  const glaz = mk(new THREE.BoxGeometry(1.66, 0.46, 2.40), glass);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const cc = new THREE.Color();
  rows.forEach((r2, i) => {
    const g = surfaceAt(r2[0], r2[1]);
    e.set(0, r2[2], 0); q.setFromEuler(e);
    p.set(r2[0], g + 0.39, r2[1]); m.compose(p, q, s); body.setMatrixAt(i, m);
    p.set(r2[0], g + 1.06, r2[1]); m.compose(p, q, s); roof.setMatrixAt(i, m);
    p.set(r2[0], g + 1.04, r2[1]); m.compose(p, q, s); glaz.setMatrixAt(i, m);
    // colour keyed off position so a street's parked cars never reshuffle
    const c = BODY[Math.abs(Math.round(r2[0] * 3 + r2[1] * 7)) % BODY.length];
    body.setColorAt(i, cc.setHex(c));
    roof.setColorAt(i, cc.setHex(c));
  });
  if (body.instanceColor) body.instanceColor.needsUpdate = true;
  if (roof.instanceColor) roof.instanceColor.needsUpdate = true;
  world.add(body); world.add(roof); world.add(glaz);
  return { parked: rows.length };
}
