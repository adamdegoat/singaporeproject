// RIDES — the cable car, the SkyRide, the luge. Things you get IN, not on.
//
// The owner: "Cable car needs to be able to sit and also those zip line and
// luge and luge cable car."
//
// One system serves all of them, because they are the same thing: a carrier
// that travels a fixed path while the player sits in it. What differs is the
// path's source, the speed, and what the carrier looks like.
//
//   gondola     Singapore-Sentosa Cable Car, Sentosa Line — an enclosed cabin
//               hanging under the wire
//   chair_lift  the two SkyRide lines back up to the luge start — an open chair
//   luge        the eight Skyline Luge runs — a cart on the track surface
//   zip         MegaZip — authored, see ZIPLINE below
//
// THE PATH IS NEVER RE-DERIVED. A cable ride reads `window.__cableways`, which
// sgdetail.js publishes from the very array it drew the wire from, so a cabin
// cannot hang in the air beside its own cable. The luge reads the same
// attraction geometry the track is built from and sits on `surfaceAt`, which
// is what a walker stands on, so the cart cannot sink through the channel.
//
// GEOMETRY IS BUILT ONCE AND MOVED. Every carrier is a single Group parked off
// to the side until its ride is boarded; nothing is created while riding.

const LUGE_KIND = 'summer_toboggan';

// metres per second. The real Singapore Cable Car runs about 3 m/s; a luge cart
// is quick but not a rollercoaster; the zip is the fast one.
// The real Singapore Cable Car crosses at about 3 m/s and takes the better
// part of ten minutes. That is the truth and it is a bad ride in a game — the
// long line is 1,734m, which at survey speed is seven minutes of sitting. The
// route, the stations and the wire are the truth layer; how fast the cabin
// runs is pacing, and pacing is authored. 7 m/s reads as a cable car and puts
// the long crossing at four minutes, the Sentosa Line at two.
const SPEED = { gondola: 7.0, chair_lift: 3.2, luge: 8.5, zip: 16.0 };
// how far the carrier's seat sits below the wire it hangs from
const HANG = { gondola: 1.6, chair_lift: 0.9 };
// WHERE YOUR EYES ARE, relative to the carrier's own origin. The first pass put
// the camera 0.55 ABOVE the carrier, which on a gondola is above the roof: you
// rode the cable car sitting on top of the cabin. The cabin body hangs from
// -2.2 to 0 under the attach point, so an occupant's eyeline is about -1.05.
export const EYE = { gondola: -1.05, chair_lift: -0.45, luge: 0.85 };
// board within this of an end
export const BOARD_REACH = 14.0;

function sampleLine(pts, hs, gauge, sag = true) {
  // Rebuild the drawn curve: each span dips to a midpoint sag exactly the way
  // the cable is baked, so the ride follows the wire and not a straight chord.
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    if (L < 1) continue;
    const dip = sag ? Math.min(6, L * 0.035) : 0;
    const n = Math.max(2, Math.ceil(L / 6));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      out.push({
        x: x0 + (x1 - x0) * t,
        z: z0 + (z1 - z0) * t,
        y: hs[i] + (hs[i + 1] - hs[i]) * t - Math.sin(Math.PI * t) * dip,
      });
    }
  }
  const last = pts[pts.length - 1];
  out.push({ x: last[0], z: last[1], y: hs[hs.length - 1] });
  return out;
}

function arcLength(pathPts) {
  let s = 0;
  pathPts[0].s = 0;
  for (let i = 1; i < pathPts.length; i++) {
    s += Math.hypot(pathPts[i].x - pathPts[i - 1].x,
                    pathPts[i].y - pathPts[i - 1].y,
                    pathPts[i].z - pathPts[i - 1].z);
    pathPts[i].s = s;
  }
  return s;
}

export function buildRides(THREE, data, world, surfaceAt) {
  const rides = [];

  // ---- cable car + SkyRide, from the wire sgdetail actually drew ----------
  for (const ln of (window.__cableways || [])) {
    if (!ln.p || ln.p.length < 2 || !ln.hs) continue;
    const pts = sampleLine(ln.p, ln.hs, ln.gauge, true);
    if (pts.length < 3) continue;
    const len = arcLength(pts);
    if (len < 40) continue;
    const kind = ln.k === 'chair_lift' ? 'chair_lift' : 'gondola';
    rides.push({
      id: `cable${rides.length}`,
      kind,
      name: ln.n || (kind === 'chair_lift' ? 'SkyRide' : 'Cable Car'),
      pts, len,
      speed: SPEED[kind],
      hang: HANG[kind],
      // a wire ride is boarded at its ends, at ground level under the wire
      boards: [{ s: 0 }, { s: len }],
    });
  }

  // ---- the luge runs, on the track surface -------------------------------
  for (const a of (data.attractions || [])) {
    if (a.k !== LUGE_KIND || !a.g || a.g.length < 3) continue;
    const pts = a.g.map(([x, z]) => ({ x, z, y: surfaceAt(x, z) + 0.35 }));
    const len = arcLength(pts);
    if (len < 40) continue;
    // A luge runs DOWNHILL. The mapped way may be drawn either way round, so
    // the direction is decided by the ground, not by the order of the file.
    if (pts[pts.length - 1].y > pts[0].y) {
      pts.reverse();
      arcLength(pts);
    }
    rides.push({
      id: `luge${rides.length}`,
      kind: 'luge',
      name: a.n || 'Skyline Luge',
      pts, len,
      speed: SPEED.luge,
      hang: 0,
      boards: [{ s: 0 }],          // you ride a luge one way: downhill
    });
  }

  // ---- carriers ----------------------------------------------------------
  const group = new THREE.Group();
  group.name = 'rideCarriers';
  world.add(group);
  const mkCabin = (kind) => {
    const g = new THREE.Group();
    if (kind === 'gondola') {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 2.2, 2.0),
        new THREE.MeshLambertMaterial({ color: 0x2f5f6b }));
      body.position.y = -1.1;
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(2.04, 1.1, 2.04),
        new THREE.MeshLambertMaterial({ color: 0x9fd0dc, transparent: true, opacity: 0.5 }));
      glass.position.y = -0.85;
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.3, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x3a3d40 }));
      arm.position.y = 0.55;
      g.add(body, glass, arm);
    } else if (kind === 'chair_lift') {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.12, 0.6),
        new THREE.MeshLambertMaterial({ color: 0xc4632f }));
      seat.position.y = -0.9;
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.7, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xc4632f }));
      back.position.set(0, -0.55, -0.3);
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 1.1, 0.09),
        new THREE.MeshLambertMaterial({ color: 0x3a3d40 }));
      arm.position.y = 0.2;
      g.add(seat, back, arm);
    } else {
      const shell = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.34, 1.5),
        new THREE.MeshLambertMaterial({ color: 0xd8b44a }));
      const nose = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.22, 0.4),
        new THREE.MeshLambertMaterial({ color: 0x2b2b2b }));
      nose.position.set(0, 0.06, 0.9);
      g.add(shell, nose);
    }
    g.visible = false;
    group.add(g);
    return g;
  };
  for (const r of rides) r.carrier = mkCabin(r.kind);

  // ---- queries -----------------------------------------------------------
  const at = (r, s) => {
    const p = r.pts;
    let lo = 0, hi = p.length - 1;
    if (s <= 0) return { ...p[0], dir: dirAt(r, 0) };
    if (s >= r.len) return { ...p[hi], dir: dirAt(r, r.len) };
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (p[mid].s <= s) lo = mid; else hi = mid;
    }
    const span = Math.max(1e-6, p[hi].s - p[lo].s);
    const t = (s - p[lo].s) / span;
    return {
      x: p[lo].x + (p[hi].x - p[lo].x) * t,
      y: p[lo].y + (p[hi].y - p[lo].y) * t,
      z: p[lo].z + (p[hi].z - p[lo].z) * t,
      dir: dirAt(r, s),
    };
  };
  function dirAt(r, s) {
    // central difference, clamped inside the ends — the same rule Path.at()
    // learned the hard way, so heading never flips at a vertex
    const d = 3;
    const a = rawAt(r, Math.max(0, s - d));
    const b = rawAt(r, Math.min(r.len, s + d));
    const dx = b.x - a.x, dz = b.z - a.z;
    const L = Math.hypot(dx, dz) || 1;
    return { x: dx / L, z: dz / L, y: (b.y - a.y) / (Math.max(1e-6, b.s - a.s) || 1) };
  }
  function rawAt(r, s) {
    const p = r.pts;
    let lo = 0, hi = p.length - 1;
    if (s <= 0) return { ...p[0] };
    if (s >= r.len) return { ...p[hi] };
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (p[mid].s <= s) lo = mid; else hi = mid;
    }
    const span = Math.max(1e-6, p[hi].s - p[lo].s);
    const t = (s - p[lo].s) / span;
    return {
      x: p[lo].x + (p[hi].x - p[lo].x) * t,
      y: p[lo].y + (p[hi].y - p[lo].y) * t,
      z: p[lo].z + (p[hi].z - p[lo].z) * t,
      s,
    };
  }

  // The boarding POINT is on the ground under the end of the line, not up on
  // the wire — you get on at the station, not by jumping.
  for (const r of rides) {
    for (const b of r.boards) {
      const p = at(r, b.s);
      b.x = p.x; b.z = p.z;
      b.y = r.kind === 'luge' ? p.y : surfaceAt(p.x, p.z);
    }
  }

  const nearest = (x, z, reach = BOARD_REACH) => {
    let best = null, bd = reach * reach;
    for (const r of rides) {
      for (const b of r.boards) {
        const d = (b.x - x) ** 2 + (b.z - z) ** 2;
        if (d < bd) { bd = d; best = { ride: r, board: b }; }
      }
    }
    return best;
  };

  return { rides, at, nearest, group };
}
