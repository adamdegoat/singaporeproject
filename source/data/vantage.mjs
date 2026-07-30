#!/usr/bin/env node
// The comparison sheet.
//
//     node data/vantage.mjs            # render every shot
//     node data/vantage.mjs 3 7        # re-render only shots 3 and 7
//
// Renders a set of matched-angle frames from vantage points on Orchard Road
// that a person who knows the street can name, so they can be held next to a
// real photograph. This is the one test of the project that cannot be run from
// inside it: the audit can prove nothing is standing in the road and the sweep
// can prove the frame rate holds everywhere, and neither of them can tell you
// whether it looks like Orchard Road.
//
// Every camera is derived from surveyed geometry — the OSM road centreline and
// the building footprint we are looking at — not from a position that happened
// to frame well. A vantage point chosen by eye is a vantage point chosen to
// flatter, and the whole value of the sheet is that it does not.
//
// Needs the dev server on :8933 and Playwright's chromium.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const OUT = 'shots/compare';
const W = 1600, H = 900;
const EYE = 1.6;          // a standing photographer, not the rider's 1.4
mkdirSync(OUT, { recursive: true });

// the region, which is what the site loads. Reading orchard.json here while the
// page loaded world.json would place cameras from one district's centreline
// against a two-district world.
const SCENE = process.env.SG_SCENE || 'world';
const data = JSON.parse(readFileSync(`data/${SCENE}.json`, 'utf8'));
const AXIS = data.axis.p;
const HALFW = data.axis.w / 2;

/* ---------- geometry against the real centreline ---------- */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]);
const norm = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

// Nearest point on the axis polyline, with the tangent there. Segment-wise, not
// vertex-wise: the axis has 90 points over 2,586m, so vertices sit ~29m apart
// and snapping to the closest one can put the camera almost fifteen metres off
// the spot it was asked for.
function onAxis(p) {
  let best = { d2: Infinity };
  for (let i = 0; i < AXIS.length - 1; i++) {
    const a = AXIS[i], b = AXIS[i + 1];
    const ab = sub(b, a), l2 = dot(ab, ab) || 1;
    const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2));
    const q = [a[0] + ab[0] * t, a[1] + ab[1] * t];
    const d2 = dot(sub(p, q), sub(p, q));
    if (d2 < best.d2) best = { d2, q, tan: norm(ab), i, t };
  }
  return best;
}

// Distance along the axis from its west end, so a shot can be placed by
// chainage as well as by what it is looking at.
function atChainage(m) {
  let acc = 0;
  for (let i = 0; i < AXIS.length - 1; i++) {
    const a = AXIS[i], b = AXIS[i + 1], seg = len(sub(b, a));
    if (acc + seg >= m) {
      const t = (m - acc) / seg;
      return { q: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], tan: norm(sub(b, a)) };
    }
    acc += seg;
  }
  const a = AXIS[AXIS.length - 2], b = AXIS[AXIS.length - 1];
  return { q: b, tan: norm(sub(b, a)) };
}

const named = new Map();
for (const b of data.buildings) if (b.n && !named.has(b.n)) named.set(b.n, b);

// The point of a footprint that fronts the street, not its centroid. A deep
// building's centroid sits well back from the road and aiming at it looks past
// the facade you would actually be photographing.
function frontage(name) {
  const b = named.get(name);
  if (!b) throw new Error(`no building named ${name} in the scene`);
  let best = { d: Infinity };
  for (const v of b.p) {
    const a = onAxis(v);
    const d = Math.sqrt(a.d2);
    if (d < best.d) best = { d, v, ax: a };
  }
  const cx = b.p.reduce((s, q) => s + q[0], 0) / b.p.length;
  const cz = b.p.reduce((s, q) => s + q[1], 0) / b.p.length;
  return { b, front: best.v, ax: best.ax, centre: [cx, cz], h: b.h || 20 };
}

/* ---------- water, for the towers the street cannot show ----------
 *
 * A CBD crown cannot be judged from the pavement. The canyon between the
 * towers eats every camera you point up it, and 2026-07-30 went five vet
 * rounds hunting one by hand before the lesson was written down: build the
 * vantage, do not hunt it. The city is photographed from the water, so the
 * camera goes there — and it is DERIVED, like every other camera here.
 * Candidate eyes are points on a real mapped water polygon at roughly the
 * distance the postcard is taken from, one per fifteen degrees of bearing so
 * a single long quay cannot monopolise the choice, and the page picks between
 * them by line of sight. Which quay is blocked is a fact about the built
 * world; it cannot be known out here, and guessing it is what cost the five
 * rounds.
 */
const WATER = (data.water || [])
  .map((w) => (Array.isArray(w) ? { p: w } : w))
  .filter((w) => w && w.p && w.p.length > 2)
  .map((w) => {
    let a = 0;
    for (let i = 0; i < w.p.length; i++) {
      const q = w.p[i], r = w.p[(i + 1) % w.p.length];
      a += q[0] * r[1] - r[0] * q[1];
    }
    return { p: w.p, a: Math.abs(a) / 2 };
  })
  .filter((w) => w.a > 20000);          // a pond is not a vantage

// Every shoreline, resampled at 40m so a long straight quay offers as many
// candidates as a fiddly one and the bearing buckets below stay honest.
const SHORE = (() => {
  const out = [];
  for (const w of WATER) {
    for (let i = 0; i < w.p.length; i++) {
      const a = w.p[i], b = w.p[(i + 1) % w.p.length];
      const l = len(sub(b, a));
      const n = Math.max(1, Math.round(l / 40));
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * (k / n), a[1] + (b[1] - a[1]) * (k / n)]);
    }
  }
  return out;
})();

// One candidate per 15 degrees of bearing, the one nearest the asked-for
// distance. Without the buckets every candidate comes off whichever quay
// happens to be finely mapped, and if that quay is behind another tower the
// shot has nowhere else to go.
function waterCands(centre, dist) {
  const best = new Map();
  for (const p of SHORE) {
    const d = len(sub(p, centre));
    if (d < dist * 0.55 || d > dist * 1.7) continue;
    const k = Math.round(Math.atan2(p[0] - centre[0], p[1] - centre[1]) / (Math.PI / 12));
    const cur = best.get(k);
    if (!cur || Math.abs(d - dist) < Math.abs(cur.d - dist)) best.set(k, { p, d });
  }
  return [...best.values()]
    .sort((a, b) => Math.abs(a.d - dist) - Math.abs(b.d - dist))
    .map((c) => c.p);
}

// A tower by name, with the radius the crown actually occupies, so the line of
// sight can tell "blocked by a building in the way" from "arrived at the
// subject" — the tower is itself the first thing every centre ray hits.
function tower(name) {
  const b = named.get(name);
  if (!b) throw new Error(`no building named ${name} in the scene`);
  const cx = b.p.reduce((s, q) => s + q[0], 0) / b.p.length;
  const cz = b.p.reduce((s, q) => s + q[1], 0) / b.p.length;
  let rad = 0;
  for (const q of b.p) rad = Math.max(rad, Math.hypot(q[0] - cx, q[1] - cz));
  return { centre: [cx, cz], rad, h: b.h || 100 };
}

/* ---------- the shots ----------
 *
 * `across`  stand on the far pavement and look at the building, offset along
 *           the street so it reads as a three-quarter view rather than a flat
 *           elevation. This is how these buildings are actually photographed.
 * `along`   stand on the pavement and look down the carriageway. This is the
 *           test of the street itself rather than of one building.
 * `oblique` above the street, for the shape of the whole thing.
 */
const SHOTS = [
  { id: '01', kind: 'along', chain: 40, dir: +1, side: +1,
    title: 'Tanglin junction, looking east down Orchard Road',
    note: 'The west end of the street, where Orchard Road begins at Tanglin Road.' },

  { id: '02', kind: 'across', target: 'Forum The Shopping Mall', shift: -62,
    title: 'Forum The Shopping Mall, from the far pavement',
    note: 'The quiet residential end, before the malls get tall.' },

  { id: '03', kind: 'across', target: 'Wheelock Place', shift: 66,
    title: 'Wheelock Place, looking at the glass cone',
    note: "Kisho Kurokawa's cone-shaped glass atrium on the Scotts Road corner." },

  { id: '04', kind: 'across', target: 'ION Orchard', shift: -68,
    title: 'ION Orchard from across Orchard Road',
    note: 'The free-form canopy on its two tree columns, over Orchard MRT.' },

  { id: '05', kind: 'along', chain: 900, dir: +1, side: -1,
    title: 'Outside ION, looking east toward Ngee Ann City',
    note: 'The busiest stretch: Wisma, Tangs and Lucky Plaza on the left.' },

  { id: '06', kind: 'across', target: 'Tang Plaza', shift: 62,
    title: 'Tangs and the Marriott, from across the road',
    note: 'Green glazed roof tiles and the pagoda top knot on the hotel tower.' },

  { id: '07', kind: 'across', target: 'Ngee Ann City', shift: -70,
    title: 'Ngee Ann City forecourt, the classic view',
    note: 'Twin 27-storey towers on a seven-storey granite podium, civic forecourt in front.' },

  { id: '08', kind: 'across', target: 'Paragon', shift: 64,
    title: 'Paragon, from the Ngee Ann City side',
    note: 'Glass-clad since the late-1990s redevelopment.' },

  { id: '09', kind: 'across', target: 'Hilton Singapore Orchard', shift: -64,
    title: 'Hilton Singapore Orchard and Mandarin Gallery',
    note: 'Two towers, 144m and 152m, over the Mandarin Gallery frontage.' },

  { id: '10', kind: 'along', chain: 1760, dir: +1, side: +1,
    title: 'Somerset, looking east',
    note: '313@Somerset and Orchard Gateway, over Somerset MRT.' },

  { id: '11', kind: 'across', target: 'Orchard Central', shift: -66,
    title: 'Orchard Central from across the road',
    note: "Singapore's first vertical mall: twelve glazed levels, carved-out verandahs." },

  { id: '12', kind: 'along', chain: 2440, dir: +1, side: -1,
    title: 'Dhoby Ghaut, the east end at Plaza Singapura',
    note: 'Where Orchard Road runs out into Bras Basah and Handy Road.' },

  { id: '13', kind: 'along', chain: 1200, dir: -1, side: +1,
    title: 'Looking back west from Ngee Ann City',
    note: 'The other direction, toward ION and Tanglin.' },

  { id: '14', kind: 'oblique', chain: 1250, height: 250, back: 640, nofog: true,
    title: 'The whole street from the air, looking east',
    note: 'The shape of the district. Haze switched off for this one frame: the '
      + 'fog is tuned for street level and from any height it washes the skyline flat.' },

  // The CBD crowns. Three towers share one height because Singapore caps them
  // there — 280m, the Paya Lebar airspace limit — so the test of this trio is
  // not the height, which is a published fact, but the TOP of each: UOB's
  // stepped octagon, Republic's rotating plan, OCBC's paired end cores. Every
  // one of them was wired up on 2026-07-30 with its crown unverified, because
  // no camera in the canyon could see one.
  { id: '15', kind: 'crown', target: 'UOB Plaza', dist: 850, fov: 19, y: 15, nofog: true,
    title: 'UOB Plaza from the water',
    note: 'The stepped octagonal crown, 280m — the height cap, shared with Republic Plaza and One Raffles Place.' },

  { id: '16', kind: 'crown', target: 'Republic Plaza', dist: 900, fov: 19, y: 15, nofog: true,
    title: 'Republic Plaza from the water',
    note: 'The plan rotates as it rises; the test is whether the top still reads as an octagon turned off the base.' },

  { id: '17', kind: 'crown', target: 'OCBC Bank', dist: 800, fov: 19, y: 15, nofog: true,
    title: 'OCBC Centre from the water',
    note: 'The calculator: two curved end cores with the floor bands slung between them, 197.6m.' },

  { id: '18', kind: 'crown', target: 'UOB Plaza', dist: 1150, fov: 44, y: 18, aimF: 0.62, nofog: true,
    title: 'The Raffles Place skyline from the water',
    note: 'All three 280m peaks together. If they are not level with each other, one of them is wrong.' },
];

/* ---------- turn each shot into a camera ---------- */

function camFor(s) {
  if (s.kind === 'crown') {
    const t = tower(s.target);
    const cands = waterCands(t.centre, s.dist);
    if (!cands.length) throw new Error(`no mapped water within reach of ${s.target}`);
    return { cands, aim: t.centre, rad: t.rad, y: s.y ?? 15,
             aimF: t.h * (s.aimF ?? 0.88), fov: s.fov ?? 20, meta: { h: t.h, cands: cands.length } };
  }
  if (s.kind === 'oblique') {
    const a = atChainage(s.chain);
    const eye = [a.q[0] - a.tan[0] * s.back, a.q[1] - a.tan[1] * s.back];
    return { eye, y: s.height, aim: a.q, aimY: 25, fov: 46 };
  }
  if (s.kind === 'along') {
    const a = atChainage(s.chain);
    const n = [-a.tan[1], a.tan[0]];               // left of travel
    // stand on the pavement: past the kerb, clear of the carriageway
    const off = HALFW + 3.4;
    const eye = [a.q[0] + n[0] * off * s.side, a.q[1] + n[1] * off * s.side];
    const far = atChainage(Math.max(6, Math.min(2580, s.chain + 190 * s.dir)));
    // aim slightly across the road, so the frame holds both pavements
    const aim = [far.q[0] - n[0] * off * s.side * 0.55, far.q[1] - n[1] * off * s.side * 0.55];
    // `above` is height above the ground THERE, not an absolute world height.
    // Orchard Road has fifty metres of relief across its length, so an absolute
    // aim height points at a spot underground wherever the far end is higher —
    // which tipped every one of these shots down at the pavement.
    return { eye, aim, above: 9, fov: 50, slide: a.tan };
  }
  const f = frontage(s.target);
  const A = f.ax.q, tan = f.ax.tan;
  const n = [-tan[1], tan[0]];
  // which side of the centreline the building sits on; the camera goes opposite
  const side = Math.sign(dot(sub(f.centre, A), n)) || 1;
  const off = HALFW + 4.0;
  const eye = [
    A[0] - n[0] * off * side + tan[0] * s.shift,
    A[1] - n[1] * off * side + tan[1] * s.shift,
  ];
  // How high to aim is set by how far away the camera is, NOT by how tall the
  // building is. Aiming a third of the way up a 128m tower from twenty-four
  // metres away is a fifty-degree tilt: the frame fills with sky and tree
  // canopy and the street disappears out of the bottom. A photograph from the
  // opposite pavement is taken near level, tilted up about twelve degrees, and
  // it simply does not contain the top of Ngee Ann City — which is true of the
  // real view too.
  const dist = len(sub(f.front, eye));
  const above = Math.min(f.h * 0.9, EYE + dist * 0.21);
  return { eye, aim: f.front, above, fov: 50, slide: tan,
    meta: { h: f.h, dist: +dist.toFixed(1) } };
}

/* ---------- render ---------- */

const only = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map((a) => a.padStart(2, '0'));
const list = only.length ? SHOTS.filter((s) => only.includes(s.id)) : SHOTS;

const browser = await chromium.launch({
  args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
    '--disable-features=CalculateNativeWinOcclusion', '--use-gl=angle'],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:8933/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { timeout: 90000 });
await page.evaluate(() => window.__ui(false));
console.log('world ready:', JSON.stringify(await page.evaluate(() => window.__stats.buildings)) + ' buildings');

// Placed in the page: it needs the terrain, the road index and the scene graph,
// none of which exist out here.
//
// Two things it does that a fixed camera position cannot. It reads the ground
// height at BOTH ends — the camera's feet and the point being aimed at — so the
// shot is level relative to the street rather than to the world origin. And it
// slides the camera along the pavement until the view is not blocked, because a
// vantage point on a street lined with trees lands inside a trunk about a third
// of the time, and a frame of tree bark tells you nothing about Orchard Road.
async function place(s, c) {
  return page.evaluate(([eye, aim, above, fov, eyeH, slide, isOblique, obliqueY, clear, span]) => {
    const THREE = window.__THREE, scene = window.__scene;
    const ray = new THREE.Raycaster();
    ray.far = 400;

    const shot = (ex, ez) => {
      const gy = isOblique ? obliqueY : window.__surfaceAt(ex, ez) + eyeH;
      const ay = isOblique ? above : window.__surfaceAt(aim[0], aim[1]) + above;
      const from = new THREE.Vector3(ex, gy, ez);
      const to = new THREE.Vector3(aim[0], ay, aim[1]);
      const dir = to.clone().sub(from).normalize();
      // Test a FAN, not one ray down the middle. A single centre ray reported
      // twenty-two metres of clear air on a frame where a tree trunk filled the
      // left third: the trunk was beside the axis of the lens, not on it. The
      // fan spans roughly the frame that will actually be photographed.
      let near = Infinity;
      const up = new THREE.Vector3(0, 1, 0);
      for (const yaw of [0, 0.22, -0.22, 0.44, -0.44, 0.62, -0.62]) {
        for (const pitch of [0, 0.16]) {
          const d = dir.clone().applyAxisAngle(up, yaw);
          const right = d.clone().cross(up).normalize();
          d.applyAxisAngle(right, -pitch);
          ray.set(from, d);
          for (const h of ray.intersectObjects(scene.children, true)) {
            if (h.distance < 0.4) continue;        // the camera's own skin
            if (h.distance < near) near = h.distance;
            break;
          }
        }
      }
      return { gy, ay, near, from, to };
    };

    // Try the asked-for spot, then step along the pavement either way, then
    // step BACK off the kerb. A vantage at a junction has road on the far side
    // too — Wheelock Place faces the Scotts Road crossing — and sliding along
    // the street never leaves it. Retreating perpendicular does.
    const back = [-slide[1], slide[0]];
    const along = isOblique ? [0] : span;
    const away = isOblique ? [0] : [0, 3, 6];
    let best = null;
    outer:
    for (const w of away) for (const d of along) {
      // "away" must go away from the road, and which way that is depends on
      // which side the camera was put on; test both and keep the one that
      // leaves the carriageway.
      for (const sgn of (w === 0 ? [1] : [1, -1])) {
        const ex = eye[0] + slide[0] * d + back[0] * w * sgn;
        const ez = eye[1] + slide[1] * d + back[1] * w * sgn;
        if (w && window.__onRoad(ex, ez, 0)) continue;
        const r = shot(ex, ez);
        const cand = { ...r, ex, ez, d, w: w * sgn, inRoad: !isOblique && !!window.__onRoad(ex, ez, 0) };
        // a clear shot is one where nothing solid sits in the first 22 metres
        if (!cand.inRoad && cand.near > clear) { best = cand; break outer; }
        if (!best || (!cand.inRoad && (best.inRoad || cand.near > best.near))) best = cand;
      }
    }
    // The crowd only exists within 105m of the RIDE, not of the camera, and
    // the free camera leaves the ride parked at the spawn point 2km away. Every
    // frame of the first sheet showed an empty pavement for that reason alone —
    // a harness artefact that would have been read as "the world has no
    // people". Put the ride just behind the lens so the district around the
    // camera is populated, far enough back that the scooter is out of frame.
    if (!isOblique) {
      const dir = [aim[0] - best.ex, aim[1] - best.ez];
      const l = Math.hypot(dir[0], dir[1]) || 1;
      const bx = best.ex - (dir[0] / l) * 30, bz = best.ez - (dir[1] / l) * 30;
      window.__teleport(bx, bz, Math.atan2(dir[0] / l, dir[1] / l));
    }
    window.__cam(best.ex, best.gy, best.ez, aim[0], best.ay, aim[1], fov);
    return {
      x: +best.ex.toFixed(1), z: +best.ez.toFixed(1), slid: best.d,
      near: best.near === Infinity ? null : +best.near.toFixed(1), inRoad: best.inRoad,
    };
  }, [c.eye, c.aim, c.above ?? c.aimY, c.fov, EYE, c.slide || [1, 0],
    s.kind === 'oblique', c.y || 0,
    // How far the lens must see, and how far the camera may wander to get it.
    // A pavement view down the street WANTS a tree eight metres away — that is
    // what the street looks like — so it asks for less clearance and stays put.
    // A view of a building across the road is ruined by one, and is allowed to
    // walk further to find a gap.
    s.kind === 'across' ? 14 : 8,
    s.kind === 'across' ? [0, 5, -5, 10, -10, 16, -16, 23, -23, 30, -30] : [0, 4, -4, 8, -8, 12, -12]]);
}

// A crown shot is placed by line of sight and nothing else: there is no kerb
// to stand behind, no carriageway to stay out of and no pavement to slide
// along. It picks the water candidate whose view of the tower is least
// obstructed, measuring "obstructed" against the distance to the SUBJECT — the
// tower is the first thing the centre ray hits, so a naive nearest-hit test
// calls every candidate blocked.
async function placeCrown(c) {
  return page.evaluate(([cands, aim, rad, eyeY, aimF, fov]) => {
    const THREE = window.__THREE, scene = window.__scene;
    const ray = new THREE.Raycaster(); ray.far = 4000;
    const up = new THREE.Vector3(0, 1, 0);
    const ay = window.__surfaceAt(aim[0], aim[1]) + aimF;
    let best = null;
    for (const [ex, ez] of cands) {
      const from = new THREE.Vector3(ex, eyeY, ez);
      const to = new THREE.Vector3(aim[0], ay, aim[1]);
      const dir = to.clone().sub(from).normalize();
      const reach = Math.max(1, from.distanceTo(to) - rad - 8);
      let near = Infinity;
      for (const yaw of [0, 0.09, -0.09]) {
        ray.set(from, dir.clone().applyAxisAngle(up, yaw));
        for (const h of ray.intersectObjects(scene.children, true)) {
          if (h.distance < 2) continue;
          if (h.distance < near) near = h.distance;
          break;
        }
      }
      const frac = Math.min(1, near / reach);
      if (!best || frac > best.frac) best = { ex, ez, near, reach, frac, d: from.distanceTo(to) };
      if (best.frac >= 0.999) break;
    }
    window.__cam(best.ex, eyeY, best.ez, aim[0], ay, aim[1], fov);
    return { x: +best.ex.toFixed(1), z: +best.ez.toFixed(1), dist: Math.round(best.d),
      blocked: best.frac < 0.98 ? Math.round(best.near) : null };
  }, [c.cands, c.aim, c.rad, c.y, c.aimF, c.fov]);
}

const done = [];
for (const s of list) {
  const c = camFor(s);
  // The world streams around the RIDE, and the ride is parked at the spawn
  // district two kilometres from Raffles Place. Photographing the CBD without
  // moving it first photographs empty ground where the CBD has not been built
  // yet — the same drain trap that had the audits judging a half-built world.
  if (s.kind === 'crown') {
    await page.evaluate((a) => window.__teleport(a[0], a[1] + 120, 0), c.aim);
    await page.waitForFunction(
      '!window.__streamState || (window.__streamState.pending.length === 0 && !window.__streamState.building)',
      null, { polling: 400, timeout: 300000 });
    await page.waitForTimeout(600);
  }
  if (s.kind === 'oblique') { c.above = c.aimY; }
  // The fog is tuned so that street level reads as Singapore haze. Seen from
  // 250m it is a beige wall that hides the entire district, so the one aerial
  // frame is taken without it and says so in its caption.
  await page.evaluate((off) => {
    if (off) { window.__fogSaved = window.__scene.fog; window.__scene.fog = null; }
    else if (window.__fogSaved) { window.__scene.fog = window.__fogSaved; window.__fogSaved = null; }
  }, !!s.nofog);
  const p = s.kind === 'crown' ? await placeCrown(c) : await place(s, c);

  // let the crowd, the traffic and the signals settle, and give the renderer a
  // few frames: the first frame after a camera jump can still be mid-LOD
  await page.waitForTimeout(1600);   // let the crowd walk out of its spawn cluster and the traffic move
  const file = `${OUT}/${s.id}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 88 });

  // A camera standing in a live carriageway is a bad photograph and also a
  // wrong one: it claims a viewpoint no pedestrian has. Report it, do not
  // quietly nudge it, because the nudge is what hides the mistake.
  const flags = [p.inRoad ? 'IN CARRIAGEWAY' : '',
    p.near != null && p.near < 12 ? `blocked at ${p.near}m` : '',
    p.slid ? `slid ${p.slid}m` : '',
    p.dist ? `${p.dist}m out` : '',
    p.blocked != null ? `SIGHT LINE BLOCKED at ${p.blocked}m` : ''].filter(Boolean).join(', ');
  console.log(`${s.id}  ${s.title}${flags ? '   [' + flags + ']' : ''}`);
  done.push({ ...s, file: `${s.id}.jpg`, ...p });
}

await browser.close();

/* ---------- contact sheet ---------- */

const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Singapore World — comparison sheet</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;background:#0f1113;color:#e9e4da;
    font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Helvetica,Arial}
  header{padding:26px 22px 8px;max-width:900px}
  h1{font:600 21px/1.3 ui-sans-serif,system-ui;margin:0 0 6px;letter-spacing:.01em}
  header p{margin:0;color:#9aa2a9;max-width:62ch}
  .grid{padding:16px 12px 60px;display:grid;gap:26px}
  figure{margin:0}
  img{width:100%;height:auto;display:block;border-radius:4px;background:#191c1f}
  figcaption{padding:9px 4px 0}
  .t{font-weight:600}
  .n{color:#98a0a7;font-size:13.5px}
  .id{color:#6e767d;font-size:12px;font-variant-numeric:tabular-nums;margin-right:8px}
  @media(min-width:980px){.grid{grid-template-columns:1fr 1fr;padding:16px 22px 60px}}
</style>
<header>
  <h1>Singapore World — does this look like the city you know?</h1>
  <p>${done.length} views from vantage points you can name. Every camera is
  placed from surveyed geometry — the road centreline and the real footprint
  it is looking at, at standing eye height on the pavement, or for the tower
  crowns a point on a mapped shoreline chosen by line of sight. None of them
  was picked by eye, because a viewpoint picked by eye is a viewpoint picked
  to flatter. Tell me what is wrong in each and that becomes the work.</p>
</header>
<div class="grid">
${done.map((s) => `  <figure>
    <img src="${s.file}" alt="${s.title}" loading="lazy">
    <figcaption><div class="t"><span class="id">${s.id}</span>${s.title}</div>
    <div class="n">${s.note}</div></figcaption>
  </figure>`).join('\n')}
</div>`;
writeFileSync(`${OUT}/index.html`, html);
// Where each camera actually ended up, so the sheet can state it and so a shot
// can be reproduced exactly. The asked-for position and the used position are
// not the same number whenever the clearance search had to move.
writeFileSync(`${OUT}/shots.json`, JSON.stringify(done, null, 1));
console.log(`\n${done.length} frames → ${OUT}/index.html`);
