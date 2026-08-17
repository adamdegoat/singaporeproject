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

// Names that identify the luge as a whole rather than one of its four trails.
// A segment carrying one of these is a lead-in or a run-out shared by the
// named descents that pass through it — see the note at the luge build.
const LUGE_GENERIC = new Set(['luge trail', 'skyline luge', 'skyline luge sentosa', '']);
const JOIN = 12;                       // endpoints this close are the same node

// Chain the mapped luge ways into whole descents. Purely geometric: ways are
// joined only where their endpoints coincide, and a way is reversed only to
// make the chain continuous. Nothing is moved, nothing is interpolated.
function chainLuge(ways) {
  if (!ways.length) return ways;
  const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < JOIN;
  const gen = (a) => LUGE_GENERIC.has((a.n || '').toLowerCase().trim());
  const named = ways.filter((a) => !gen(a));
  const generics = ways.filter(gen);
  if (!named.length) return ways;

  // 1. chain the ways of each named trail into one polyline
  const runs = [];
  const byName = new Map();
  for (const a of named) {
    const k = a.n.toLowerCase();
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(a);
  }
  for (const [, group] of byName) {
    let g = group[0].g.slice();
    const rest = group.slice(1);
    let grew = true;
    while (grew && rest.length) {
      grew = false;
      for (let i = 0; i < rest.length; i++) {
        const h = rest[i].g;
        if (near(g[g.length - 1], h[0])) { g = g.concat(h.slice(1)); }
        else if (near(g[g.length - 1], h[h.length - 1])) { g = g.concat(h.slice().reverse().slice(1)); }
        else if (near(g[0], h[h.length - 1])) { g = h.slice(0, -1).concat(g); }
        else if (near(g[0], h[0])) { g = h.slice().reverse().slice(0, -1).concat(g); }
        else continue;
        rest.splice(i, 1); grew = true; break;
      }
    }
    runs.push({ n: group[0].n, k: LUGE_KIND, g });
    // a same-named way that would not join stays a run of its own rather than
    // being silently dropped — a fragment we cannot place is still a fragment
    // that exists, and losing it quietly is how a trail disappears
    for (const left of rest) runs.push({ n: left.n, k: LUGE_KIND, g: left.g });
  }

  // 2. extend each named run through the shared generic segments it continues
  //    into. A generic may serve SEVERAL runs — exactly as the real lead-in
  //    does — but it may serve each run only ONCE.
  //
  // ONCE PER RUN IS THE WHOLE OF THIS, and the first cut got it wrong in a way
  // worth keeping: after appending a segment, that segment's far endpoint is
  // now the run's own end, so the very next pass matched it AGAIN and appended
  // it reversed. The Dragon Trail came out at 958.9m instead of 634.8m — a luge
  // that runs to the bottom, turns round and climbs back up. Caught by reading
  // the number, not the render: 389.2 + 189.9 + 189.9 + 189.9 is exactly 958.9.
  const used = new Set();
  for (const r of runs) {
    const mine = new Set();
    for (let pass = 0; pass < generics.length; pass++) {
      let grew = null;
      for (const q of generics) {
        if (mine.has(q)) continue;
        const h = q.g;
        if (near(r.g[r.g.length - 1], h[0])) { r.g = r.g.concat(h.slice(1)); grew = q; }
        else if (near(r.g[r.g.length - 1], h[h.length - 1])) { r.g = r.g.concat(h.slice().reverse().slice(1)); grew = q; }
        else if (near(r.g[0], h[h.length - 1])) { r.g = h.slice(0, -1).concat(r.g); grew = q; }
        else if (near(r.g[0], h[0])) { r.g = h.slice().reverse().slice(0, -1).concat(r.g); grew = q; }
        if (grew) break;
      }
      if (!grew) break;
      mine.add(grew); used.add(grew);
    }
  }

  // 3. a generic nothing absorbed is still a real mapped way and still rides —
  //    losing it quietly is how a trail disappears
  for (const q of generics) if (!used.has(q)) runs.push({ n: q.n, k: LUGE_KIND, g: q.g });
  return runs;
}

// metres per second. The real Singapore Cable Car runs about 3 m/s; a luge cart
// is quick but not a rollercoaster; the zip is the fast one.
// The real Singapore Cable Car crosses at about 3 m/s and takes the better
// part of ten minutes. That is the truth and it is a bad ride in a game — the
// long line is 1,734m, which at survey speed is seven minutes of sitting. The
// route, the stations and the wire are the truth layer; how fast the cabin
// runs is pacing, and pacing is authored. 7 m/s reads as a cable car and puts
// the long crossing at four minutes, the Sentosa Line at two.
// THE WATER'S SPEED IS NOT THE RIDER'S SPEED — and the first cut used it.
//
// The published figures are 20 mph (32 km/h = 8.9 m/s) for the Double
// FlowRider's sheet and 48 km/h (13.3 m/s) for the FlowBarrel, and those went
// straight in as ride speeds. That is the wrong number: on a sheet wave the
// WATER moves at that speed and the RIDER HOLDS STATION against it, carving
// across. At 8.9 m/s a rider crosses the 12m sheet in a second and a half,
// which reads as being fired across it rather than surfing.
//
// The owner, 2026-08-06: "the ride no need to be exact speed like the real
// one. as long as the game experience is the same u know what i mean?" —
// right, and for a reason worth writing down: matching a published number is
// only faithful when it is a number about the same thing you are setting.
//
// So these are AUTHORED for feel, a carve rather than a dash, and the
// FlowBarrel keeps its edge over the sheet because that difference IS real.
const SPEED = { gondola: 7.0, chair_lift: 3.2, luge: 8.5, zip: 16.0,
                flowrider: 3.4, flowbarrel: 4.8 };
// how far the carrier's seat sits below the wire it hangs from
const HANG = { gondola: 1.6, chair_lift: 0.9 };
// WHERE YOUR EYES ARE, relative to the carrier's own origin. The first pass put
// the camera 0.55 ABOVE the carrier, which on a gondola is above the roof: you
// rode the cable car sitting on top of the cabin. The cabin body hangs from
// -2.2 to 0 under the attach point, so an occupant's eyeline is about -1.05.
// A FLOW RIDER STANDS UP. Every other seat here is something you sit in, so
// its eye is measured off the carrier; on a board the eye is a standing head
// above your own feet, which is why these two are the largest numbers in the
// table and not a mistake.
export const EYE = { gondola: -1.05, chair_lift: -0.45, luge: 0.85, zip: -0.55,
                     flowrider: 1.55, flowbarrel: 1.55 };
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

  // ---- SURF COVE: the Double FlowRider and the FlowBarrel ----------------
  //
  // The owner, 2026-08-06: "if the real ride is 2 person u also must do ya.
  // like must make like similar to the real one as much as u can ok?"
  //
  // **"DOUBLE" IS THE NAME OF THE RIDE, NOT A DETAIL.** The Double FlowRider
  // carries TWO riders abreast on one sheet, and being the only installation
  // in Asia with it (beside the 10ft FlowBarrel) is the venue's published
  // distinguishing fact. So it is built as TWO LANES on one sheet — two
  // separate rides side by side — which is genuinely two players, not one ride
  // with two places to queue. The FlowBarrel is one rider, as in life.
  //
  // A standing wave is not a line you travel down: the water moves and the
  // rider holds station, carving across it. So each lane's path is a short
  // ACROSS-the-sheet carve that the rider works back and forth, rather than a
  // route from A to B — and `speed` is the PUBLISHED WATER SPEED, which is
  // what makes the Barrel harder than the sheet rather than an invented
  // difficulty number.
  {
    const wh = data.wavehouse;
    if (wh && wh.p) {
      const [wx, wz] = wh.p;
      const ux = Math.sin(wh.a), uz = Math.cos(wh.a);
      const nx = -uz, nz = ux;
      // THE DECK'S DATUM COMES FROM THE DATA, NOT FROM A SAMPLE HERE.
      //
      // This read `surfaceAt(wx, wz)` — the surface at the venue centre — and
      // that is circular: sgdetail.js has already BUILT the deck by the time
      // this runs, so on a good day it returns the deck top and on a bad one
      // the ground beside it. The deck is a level stage seated on the HIGHEST
      // ground under itself; data/wavehouse.py measures that ground and writes
      // it, so both files take the same number from the same place.
      const gnd = wh.ground || [surfaceAt(wx, wz), surfaceAt(wx, wz)];
      const gy = gnd[1];
      const put = (u, v) => ({ x: wx + ux * u + nx * v, z: wz + uz * u + nz * v });
      const [rw, rl] = wh.rider || [12, 18];
      const [DW] = wh.deck || [46, 24];
      const FW = Math.min(wh.w * 0.42, DW);
      // TWO LANES, abreast, on the one sheet — this is the Double.
      for (const lane of [-1, 1]) {
        const u0 = -FW * 0.26 + lane * (rw * 0.26);
        const pts = [];
        // the carve: across the sheet and back, at the height of the deck
        for (const v of [-rl * 0.30, 0, rl * 0.30, 0, -rl * 0.30]) {
          const q = put(u0 + v * 0.18, v);
          // ON the sheet: the deck top is gy+1.1 and the vinyl slab on it
          // reaches gy+1.27, so this is a rider standing on the water, not
          // wading through the stage.
          pts.push({ x: q.x, z: q.z, y: gy + 1.35 });
        }
        const len = arcLength(pts);
        if (len < 4) continue;
        rides.push({
          id: `flow${rides.length}`,
          kind: 'flowrider',
          name: lane < 0 ? 'Double FlowRider (left)' : 'Double FlowRider (right)',
          pts, len,
          speed: SPEED.flowrider,
          hang: 0,
          boards: [{ s: 0 }],
        });
      }
      // THE FLOWBARREL: one rider, and it curls. Same shape of path, tighter
      // and faster, on the barrel side of the deck.
      {
        const br = wh.barrel || 7.5;
        const pts = [];
        for (const v of [-br * 0.7, 0, br * 0.7, 0, -br * 0.7]) {
          const q = put(FW * 0.30 + v * 0.10, v);
          pts.push({ x: q.x, z: q.z, y: gy + 1.6 });
        }
        const len = arcLength(pts);
        if (len >= 4) {
          rides.push({
            id: `flow${rides.length}`,
            kind: 'flowbarrel',
            name: 'FlowBarrel',
            pts, len,
            speed: SPEED.flowbarrel,
            hang: 0,
            boards: [{ s: 0 }],
          });
        }
      }
    }
  }

  // ---- the luge runs, on the track surface -------------------------------
  // A LUGE RUN IS THE WHOLE DESCENT, NOT ONE MAPPED WAY OF IT.
  //
  // Found 2026-08-17 by the new ridecheck, on its first run: "Luge Trail lasts
  // more than 8s — 7s". A fifty-six metre luge is not a ride, it is a fragment,
  // and it was one of SEVEN, because this loop built one ride per OSM way.
  //
  // Measured, and the mapped geometry answers it itself — every one of these
  // endpoints coincides to 0.0m:
  //
  //     (-1781,12387)  top
  //        | Luge Trail            55.7m      <- was its own 7-second "ride"
  //     (-1812,12426)  the split
  //        |\ Luge Dragon Trail   389.2m
  //        | \ Luge Jungle Trail  228.5 + 7.0 + 131.2m   (three ways)
  //     (-1938,12548)  they rejoin
  //        | Luge Trail           189.9m
  //     (-1838,12667)  bottom
  //
  // So the island's mapped luge is TWO complete descents sharing a lead-in and
  // a run-out — Dragon 635m and Jungle 612m — and we were serving it as seven
  // disconnected pieces, the shortest of which was over in seven seconds.
  //
  // THE JUDGEMENT, SAID OUT LOUD: the two shared segments are named the generic
  // "Luge Trail" while the branches carry the four real trail names, and the
  // named branches physically CONTINUE through them. Absorbing a generic
  // segment into the named run it continues is a reading of the map, not an
  // invention of geometry — no point is moved and no metre is added. Expedition
  // (196m) and Kupu Kupu (168m) share no endpoint with anything in this extract
  // and are left exactly as they were.
  const lugeRuns = chainLuge((data.attractions || []).filter(
    (a) => a.k === LUGE_KIND && a.g && a.g.length >= 2));
  for (const a of lugeRuns) {
    if (!a.g || a.g.length < 3) continue;
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

  // ---- MegaZip: one span, one direction, and it is the fast one -----------
  const zl = window.__zipline;
  if (zl && zl.p && zl.p.length === 2) {
    const [[ax, az], [bx, bz]] = zl.p;
    const run = Math.hypot(bx - ax, bz - az);
    const sag = Math.min(9, run * 0.02);
    const pts = [];
    const n = Math.max(8, Math.ceil(run / 8));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push({
        x: ax + (bx - ax) * t,
        z: az + (bz - az) * t,
        // the rider hangs under the wire, and the wire sags
        y: zl.y0 + (zl.y1 + 4 - zl.y0) * t - Math.sin(Math.PI * t) * sag,
      });
    }
    const len = arcLength(pts);
    rides.push({
      id: 'zip', kind: 'zip', name: zl.n || 'MegaZip',
      pts, len, speed: SPEED.zip, hang: 1.5,
      boards: [{ s: 0 }],            // you do not zip back up
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
    } else if (kind === 'zip') {
      // a harness and a trolley: you are hanging, so there is little to draw
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.14, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x3a3d40 }));
      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.1, 0.08),
        new THREE.MeshLambertMaterial({ color: 0xd8b44a }));
      strap.position.y = -0.6;
      g.add(bar, strap);
    } else if (kind === 'flowrider' || kind === 'flowbarrel') {
      // A FLOWBOARD, NOT A CART. Both flow kinds were falling through to the
      // luge carrier below — a yellow shell with a black nose cone — so riding
      // a standing wave put you in a toboggan. It is the same failure this
      // world keeps finding: the generic form of the tag standing in for the
      // thing. A flowboard is a short thick board you stand on, and you can
      // see your own feet on it, so it is drawn UNDER the eye rather than
      // around it.
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.09, 1.28),
        new THREE.MeshLambertMaterial({ color: 0xe8e3d6 }));
      board.position.y = -0.05;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.10, 1.16),
        new THREE.MeshLambertMaterial({ color: 0x2f7f96 }));
      stripe.position.y = -0.04;
      g.add(board, stripe);
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

  // A WIRE RIDE STOPS AT ITS STATIONS — ALL OF THEM, NOT JUST ITS ENDS.
  //
  // Two faults, found 2026-08-06 by asking whether the Sentosa Line actually
  // works as the Sentosa Line:
  //
  //  1. THE INTERMEDIATE STATION COULD NOT BE BOARDED. `boards` was set to
  //     [{s:0},{s:len}] and nothing ever added to it, so Imbiah Lookout —
  //     a real station on a real line, with a platform, a ramp and a stair we
  //     build — was somewhere you could climb and then not get on. The
  //     published Sentosa Line is Merlion -> Imbiah Lookout -> Siloso Point.
  //
  //  2. THE PLATFORM REMAP WAS DEAD CODE, and had been since it was written.
  //     It ran BEFORE the loop above, so every `b.x` it compared against was
  //     `undefined`; `(st.x - undefined) ** 2` is NaN, `NaN < bd` is false, so
  //     `best` stayed null and it returned without doing anything, every time.
  //     Even had it matched, the loop above would have overwritten x/z
  //     straight afterwards. Measured before this fix: `platform` was false on
  //     every board on the island, Siloso Point boarded on the grass at y=17.1
  //     with its deck at y=27.9, and Sensoryscape only boarded at deck height
  //     BY ACCIDENT, because that line's end happens to fall under its deck.
  //
  // A boarding point on the grass under the wire makes the deck scenery: you
  // would climb it for the view and walk back down to get on, which is the
  // opposite of a station. Safe only because walkSurfaceAt is height-aware —
  // the deck is reachable by walking up the ramp and NOT by standing under it.
  // GONDOLAS ONLY. `__cableStations` holds the five CABLE CAR stations and
  // nothing else — the SkyRide has no station in that list. Including
  // chair_lifts (which the dead code above did, harmlessly, because it never
  // ran) snapped both SkyRide chairs onto the Imbiah Lookout cable-car deck at
  // y=54.9: you would have boarded a ground-level chairlift from a twelve
  // metre platform belonging to a different ride, 43m from its own wire.
  // Measured, seen in the boards list, and cut before it shipped.
  for (const r of rides) {
    if (r.kind !== 'gondola') continue;
    for (const st of (window.__cableStations || [])) {
      // where along THIS wire does the station sit? 60m, because a station
      // sits beside its wire rather than exactly under it, and a wire that
      // merely passes a station 200m away is not serving it.
      let bestS = null, bd = 60 * 60;
      for (const q of r.pts) {
        const d = (q.x - st.x) ** 2 + (q.z - st.z) ** 2;
        if (d < bd) { bd = d; bestS = q.s; }
      }
      if (bestS === null) continue;
      // reuse an end if this station IS that end, otherwise add a stop
      let b = null;
      for (const b2 of r.boards) if (Math.abs(b2.s - bestS) < 45) { b = b2; break; }
      if (!b) { b = { s: bestS }; r.boards.push(b); }
      b.x = st.x; b.z = st.z; b.y = st.y + 0.9;
      b.platform = true;
      b.station = st.n;
    }
    r.boards.sort((a2, b2) => a2.s - b2.s);
    // A CABLE CAR IS BOARDED AT A STATION, AND IT DOES NOT CARRY YOU PAST THE
    // LAST ONE INTO A PLACE THE WORLD DOES NOT HAVE.
    //
    // Measured 2026-08-17, along the wire, station by station:
    //
    //   Singapore-Sentosa Cable Car   1,733m of wire
    //     Sentosa       s =     0.0
    //     Harbourfront  s =   990.6      <- the last station in the world
    //     ...and 742m more, 43% of the ride, running on to MOUNT FABER at
    //        z = 10,561 — which is 529m OUTSIDE the terrain grid (z >= 11,090)
    //        and past the last building on the extract (nothing north of
    //        z = 11,000).
    //   Sentosa Line                    886m, stations at 0, 244.5 and 885.8
    //        — the whole line is served, nothing to trim.
    //
    // So the island's signature ride was four minutes long and spent the last
    // ninety seconds of it flying over NOTHING, then set you down there. The
    // wire itself is not wrong and is not touched — the real cable really does
    // carry on to Mount Faber, and sgdetail should keep drawing it to the edge.
    // What is wrong is carrying a PASSENGER past the end of the world.
    //
    // Bounded by the stations rather than by a hand-typed distance, so the day
    // the extract grows north and Mount Faber arrives with a station of its
    // own, the ride reaches it with nothing here to change.
    const stops = r.boards.filter((b2) => b2.station);
    if (stops.length >= 2) {
      r.boards = stops;
      r.s0 = stops[0].s;
      r.s1 = stops[stops.length - 1].s;
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
