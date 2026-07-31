import * as THREE from '../lib/three.module.js';
import { PAL, R, reseedPlacement, rand, pick, chance } from './tex.js';
import { MAT, buildBuildings, buildRoads, TreeField, aoPatch, setTerrain, groundAt, surfaceAt, bridgeDeckAt, buildSurround, buildWater, buildSupertrees } from './city.js';
import { Terrain } from './terrain.js';
import { dedupeMaterials, consolidate, trimShadowCasters, pruneCarriageway } from './consolidate.js';
import { buildRoadIndex, claim } from './roads.js';
import { Solid } from './solid.js';
import { buildVespa, buildRider, buildCar, newState, step, RIDE, CAR } from './vespa.js';
import { TOUCH, input, attachTouch, attachMouse, readInput, touchDebug } from './input.js';
import { newWalker, stepWalk, buildWalker, WALK } from './player.js';
import { axisSpec, buildMarkings, dressSideStreets, selectSideStreets, dedupeProps } from './markings.js';
import { buildSgDetail } from './sgdetail.js';
import { buildShopfronts } from './shopfront.js';
import { Signals } from './signals.js';
import { Sound } from './audio.js';
import { Crowd, Traffic } from './actors.js';
import { buildFurniture } from './street.js';
import { buildSignage, Wayfinder } from './wayfind.js';

const P = new URLSearchParams(location.search);
const hud = document.getElementById('hud');
const canvas = document.getElementById('c');

/* ---------------- renderer ---------------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
window.__renderer = renderer;   // probes read info.programs / info.memory
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = !P.has('noshadow');
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
// Density is set from the far plane, not by eye: FogExp2 leaves
// exp(-(density*d)^2) of an object showing at distance d, and at 520m a density
// of 0.0021 still showed 30% of it, so buildings popped out of nothing at a hard
// line. 0.0038 leaves about 2%.
scene.fog = new THREE.FogExp2(0xc9c3b2, 0.0038);
const camera = new THREE.PerspectiveCamera(58, 1, 0.3, 520);

/* ---------------- sky + light ---------------- */
const SUNDIR = new THREE.Vector3(-0.52, 0.80, -0.30).normalize();
// The dome rides with the camera. It used to be a fixed 900m sphere at the
// world origin, which worked only while you were near the middle of the map:
// once the camera's far plane came down to 520 the whole dome fell outside the
// frustum and the sky rendered black. Only the position follows the camera —
// never the rotation, or the sun and the cloud field would swing with the view.
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(480, 40, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(PAL.skyTop) }, mid: { value: new THREE.Color(PAL.skyMid) },
      haze: { value: new THREE.Color(PAL.skyHaze) }, cloud: { value: new THREE.Color(PAL.cloud) },
      sun: { value: SUNDIR.clone() },
    },
    vertexShader: `varying vec3 vW;
      void main(){ vW = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 top, mid, haze, cloud; uniform vec3 sun; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
      float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
      void main(){
        vec3 d = normalize(vW);
        float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(haze, mid, pow(h, 0.40));
        c = mix(c, top, pow(h, 1.45));
        if (d.y > 0.015) {
          vec2 p = d.xz / (d.y + 0.11) * 1.30;
          float n = fbm(p*1.05 + vec2(3.2,1.7))*0.66 + fbm(p*2.60 + vec2(-1.0,4.4))*0.34;
          float cov = smoothstep(0.46, 0.73, n);
          float fade = smoothstep(0.02, 0.24, d.y);
          float lit = pow(max(dot(d, normalize(sun)), 0.0), 2.0);
          vec3 cc = mix(cloud*0.80, cloud, 0.35 + 0.65*lit);
          cc = mix(cc, vec3(0.62,0.62,0.66), (1.0-cov)*0.30);
          c = mix(c, cc, cov*fade*0.92);
        }
        float dp = max(dot(d, normalize(sun)), 0.0);
        c += vec3(1.0,0.80,0.55)*pow(dp,8.0)*0.55;
        c += vec3(1.0,0.86,0.68)*pow(dp,1.8)*0.10;
        gl_FragColor = vec4(c,1.0);
      }`,
  }));
sky.frustumCulled = false;
sky.renderOrder = -1;
scene.add(sky);

const sun = new THREE.DirectionalLight(0xfff0d6, 2.6);
sun.castShadow = true;
// phones carry half the shadow texels: at 1.5x render density the extra
// resolution is invisible and the pass is the documented frame-cost hog
sun.shadow.mapSize.set(TOUCH ? 1024 : 2048, TOUCH ? 1024 : 2048);
sun.shadow.camera.left = -95; sun.shadow.camera.right = 95;
sun.shadow.camera.top = 95; sun.shadow.camera.bottom = -95;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 460;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);
// SHADOWED ASPHALT WAS READING NAVY, which is the "navy-vs-grey road
// patchwork" reported in the tower canyons. In shadow the sun contributes
// nothing and a road, whose normal points up, takes the hemisphere's SKY
// colour alone — and 0xa6c8e2 is a saturated light blue, so dark asphalt
// times saturated blue is navy, then ACES crushes what is left. Real
// shadowed tarmac is a desaturated grey that leans blue, not a blue that
// leans grey. Desaturated the sky term and lifted the intensity a little:
// the sun still carries the contrast, and everything in shadow — the road,
// pavements, north faces — stops going to ink. Vetted at four CBD canyon
// spots and in open Orchard so the fix cannot be one that only works where
// the problem was.
scene.add(new THREE.HemisphereLight(0xbcc8d2, 0x9a8d78, 1.62));

const world = new THREE.Group();
scene.add(world);

/* ---------------- collision from real footprints ---------------- */
const CELL = 12;
const colGrid = new Map();
function indexBuildings(data) {
  for (const b of data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const [x, z] of b.p) {
      mnx = Math.min(mnx, x); mxx = Math.max(mxx, x);
      mnz = Math.min(mnz, z); mxz = Math.max(mxz, z);
    }
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!colGrid.has(k)) colGrid.set(k, []);
        colGrid.get(k).push(b.p);
      }
  }
}
function inPoly(poly, x, z) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
  }
  return hit;
}
// Street dressing must dodge two things: buildings AND carriageways. The old
// test only knew about buildings, so a tree could sit in the middle of a back
// road and nothing objected. The bike and the walker keep using the raw
// building test below, because they are supposed to be on the road.
let ROADIX = null;
// the whole region's data, unioned at boot, for passes that must see across a
// chunk boundary (see the shopfront index)
let REGIONB = null;
function place(x, z) {
  return blocked(x, z) || (ROADIX ? ROADIX.onRoad(x, z, -0.4) : false);
}
// Footprints from the map, PLUS every wall actually drawn. The footprint list
// alone missed 11.5% of the solid geometry standing at rider height, because
// podiums, canopies, colonnades and the covered walkway are placed by recipe
// and never had a footprint. See solid.js.
let SOLID = null;
// the boot build's WALLS grid, exposed so streamed chunks can extend it —
// Solid is an unbounded hash grid, so build(group) on it is purely additive
let WALLSREF = null;
// WATER IS SOLID, as far as anything that travels on wheels or feet is
// concerned. A scooter does not drive onto a reservoir and a pedestrian does
// not stroll across one, and without this the bay is a 300m hole you fall into
// the moment you leave the promenade. Kept in its own grid rather than in
// SOLID, because SOLID is rasterised from drawn WALLS and water is not a wall:
// folding it in would make every check that asks "is there a wall here" answer
// yes over open water.
let WATERPOLY = [];
const wCell = 40, wGrid = new Map();
function setWater(polys) {
  WATERPOLY = polys || [];
  wGrid.clear();
  // Exposed HERE, not with the other globals at the end of boot: the street
  // dressing runs before that point and asks about water, so assigning it late
  // made every `dry()` guard in markings.js a silent no-op and 2,064 lane lines
  // stayed painted on the reservoir. A guard that is installed after the thing
  // it guards is not a guard.
  window.__inWater = (x, z) => inWater(x, z);
  for (const ring of WATERPOLY) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const [x, z] of ring) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    for (let gx = Math.floor(mnx / wCell); gx <= Math.floor(mxx / wCell); gx++)
      for (let gz = Math.floor(mnz / wCell); gz <= Math.floor(mxz / wCell); gz++) {
        const k = gx + ',' + gz;
        if (!wGrid.has(k)) wGrid.set(k, []);
        wGrid.get(k).push(ring);
      }
  }
}
function inWater(x, z) {
  const list = wGrid.get(Math.floor(x / wCell) + ',' + Math.floor(z / wCell));
  if (!list) return false;
  for (const ring of list) if (inPoly(ring, x, z)) return true;
  return false;
}
function blocked(x, z) {
  if (SOLID && SOLID.at(x, z)) return true;
  if (inWater(x, z)) return true;
  const list = colGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
  if (!list) return false;
  for (const poly of list) if (inPoly(poly, x, z)) return true;
  return false;
}

/* ---------------- street dressing, all instanced ---------------- */
// Two main streets must not dress the same tarmac.
//
// Orchard Road ends at Dhoby Ghaut and Bras Basah Road begins there, and the
// districts are fetched with overlapping boxes, so both axes cover that stretch.
// Dressed independently they laid two sets of kerbs, two sets of lane markings
// and two sets of name plates over each other: 330 duplicated props, 42
// z-fighting surfaces, and 13 plates naming the wrong street because the ones
// from Orchard's pass landed on Bras Basah Road.
//
// So each axis after the first is clipped where it runs close to one already
// dressed. Clipping the AXIS rather than filtering each placement means every
// dressing system inherits the fix without knowing anything about districts.
function trimAxes(list, near = 26) {
  const kept = [];
  const done = [];
  for (const ax of list) {
    if (!kept.length) { kept.push(ax); done.push(ax.p); continue; }
    const near2 = near * near;
    const clear = (x, z) => {
      for (const pts of done) {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          const dx = b[0] - a[0], dz = b[1] - a[1];
          const l2 = dx * dx + dz * dz || 1;
          const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
          const qx = a[0] + dx * t, qz = a[1] + dz * t;
          if ((x - qx) ** 2 + (z - qz) ** 2 < near2) return false;
        }
      }
      return true;
    };
    // keep the longest unbroken run that is clear of everything already dressed
    let best = [], run = [];
    for (const p of ax.p) {
      if (clear(p[0], p[1])) { run.push(p); }
      else { if (run.length > best.length) best = run; run = []; }
    }
    if (run.length > best.length) best = run;
    if (best.length > 3) kept.push({ ...ax, p: best });
    done.push(ax.p);
  }
  return kept;
}

function dressStreet(data, axis, target = world) {
  if (!axis) return 0;
  const dataRef = data;
  const pts = axis.p, half = axis.w / 2;
  const trees = new TreeField();
  // THE TREE FITS THE STREET IT STANDS ON. Every district's main axis was
  // planted with a full-size Orchard Angsana — 16 to 27m across the crown —
  // including Bayfront Avenue, a modern 11.4m boulevard by the bay, and South
  // Bridge Road, a 14.8m conservation street of two-storey shophouses. On
  // Orchard that avenue is right and is the whole character of the place; on a
  // narrow street it buries the frontage the rider came to see.
  //
  // Scaled by the carriageway the data already carries, against Orchard's own
  // 18.2m, so ORCHARD IS UNCHANGED at 1.0 and only narrower streets come down:
  // South Bridge 0.81, Bayfront and River Valley 0.63. Floored at 0.6 because
  // a street tree is still a tree, and it is a proportion, not a species
  // change — the right long answer is that Bayfront's are palms, which needs
  // a second tree model and belongs in its own batch.
  const treeK = Math.max(0.6, Math.min(1.0, (axis.w || 18.2) / 18.2));
  const kerbT = [], lampT = [], armT = [], headT = [], zebraT = [], dotT = [];
  const crossingS = [];

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len;
    const nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);
    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;
      for (const sgn of [-1, 1]) {
        const kx = px + nx * (half + 0.4) * sgn, kz = pz + nz * (half + 0.4) * sgn;
        const kerbOK = !place(kx, kz);
        if (acc % 17 === (sgn > 0 ? 0 : 8)) {
          for (const off of [3.2, 2.2, 4.4]) {
            const tx = px + nx * (half + off) * sgn, tz = pz + nz * (half + off) * sgn;
            if (!place(tx, tz) && claim('tree', tx, tz, 3.0)) { trees.add(tx, tz, rand(0.85, 1.15) * treeK); break; }
          }
        }
        if (acc % 34 === 0 && kerbOK && claim('lamp', kx, kz, 6)) {
          lampT.push([kx, 4.5, kz, 0]);
          // parts carry the POLE's anchor: each used to take the ground at
          // its OWN offset position, and on a steep street with a retaining
          // wall the ground 2.3m out differs by metres — the luminaire on
          // Leonie Hill floated free of its pole (sweep-2 frame 187)
          armT.push([kx - nx * 1.1 * sgn, 8.9, kz - nz * 1.1 * sgn, ang, sgn, kx, kz]);
          headT.push([kx - nx * 2.3 * sgn, 8.75, kz - nz * 2.3 * sgn, ang, kx, kz]);
        }
        if (acc % 2 === 0 && kerbOK && claim('kerb', kx, kz)) kerbT.push([kx, 0.15, kz, ang]);
      }
      // crossings are placed from the real map, after this loop
    }
  }

  // ---- real crossings from OpenStreetMap ----
  // OSM has a node for every pedestrian crossing. Placing them every 190m was
  // an invention; this is the actual street.
  let realCrossings = 0, tactilePads = 0;
  const tactileT = [], refugeT = [];
  for (const c of (dataRef.crossings || [])) {
    const [cx, cz, tp, isl] = c;
    // find the nearest point on the axis and the local direction there
    let bi = 0, bd = Infinity, bt = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((cx - x1) * vx + (cz - z1) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const d = (cx - (x1 + vx * t)) ** 2 + (cz - (z1 + vz * t)) ** 2;
      if (d < bd) { bd = d; bi = i; bt = t; }
    }
    if (Math.sqrt(bd) > half + 6) continue;      // crossing on a different street
    const [x1, z1] = pts[bi], [x2, z2] = pts[bi + 1];
    const vx = x2 - x1, vz = z2 - z1, L = Math.hypot(vx, vz) || 1;
    const ux2 = vx / L, uz2 = vz / L, nx2 = -uz2, nz2 = ux2;
    const ox = x1 + vx * bt, oz = z1 + vz * bt;
    const ang2 = Math.atan2(ux2, uz2);
    // WHAT KIND OF CROSSING (process.py element 4). A SIGNALISED crossing in
    // Singapore has no bars at all -- LTA SDRE TMM4 marks it with two dotted
    // white boundary lines -- and 431 of Orchard's 500 crossing nodes are
    // signalised against 13 zebras. Painting bars on all of them put a zebra
    // at every junction on a street that has almost none.
    //
    // The side streets are handled by the same rule in markings.js; this is
    // the main axis, which is dressed separately and would otherwise have gone
    // on disagreeing with its own side roads about what a crossing looks like.
    // ONLY THE PAINT DEPENDS ON THE KIND. The first version returned early
    // here, which skipped the crossing REGISTRATION below -- so 431 of
    // Orchard's 500 crossings stopped existing as crossings at all: no
    // tactile paving, no refuge island, and the crowd had nowhere legitimate
    // to step onto the road. A2 caught it as "real data present but unused",
    // which is exactly what it had become.
    const ckind = c.length > 4 ? c[4] : 1;
    if (ckind === 1 && claim('xing', ox, oz, 4.0)) {
      // the two boundary lines, 1.5m either side of the crossing centre
      for (const sideOff of [-1.5, 1.5]) {
        const bx0 = ox + ux2 * sideOff, bz0 = oz + uz2 * sideOff;
        let ba0 = ang2;
        if (window.__roadDirAt) {
          const rd0 = window.__roadDirAt(bx0, bz0);
          if (rd0 && (rd0[0] || rd0[1])) ba0 = Math.atan2(rd0[0], rd0[1]);
        }
        const nsq = Math.max(4, Math.round(axis.w / 0.5));
        for (let k = 0; k < nsq; k++) {
          const f = -axis.w / 2 + (k + 0.5) * (axis.w / nsq);
          dotT.push([bx0 - uz2 * f, 0.069, bz0 + ux2 * f, ba0 + Math.PI / 2]);
        }
      }
    }
    for (let s2 = -3; ckind === 2 && s2 <= 3; s2++) {
      const bx = ox + ux2 * s2 * 1.3, bz = oz + uz2 * s2 * 1.3;
      // Each bar takes the street's direction AT ITS OWN POSITION, not at the
      // middle of the crossing. The bars spread nearly four metres along the
      // road, and where a crossing sits on a bend — which is where junctions
      // are — one shared angle left the outer bars up to fifty degrees off
      // square. A zebra laid at an angle to the lane is not a zebra.
      // THE ROAD INDEX KNOWS EVERY ROAD, the axis polyline only knows one.
      //
      // The bar angle was taken from the nearest segment of the axis being
      // dressed, which is right on a straight street and wrong where the axis
      // bends hard: Bayfront Avenue curves round the bay, and a crossing on the
      // bend came out 32 degrees off square. roadDirAt answers with the
      // direction of the actual carriageway at that exact point.
      let ba = ang2;
      if (window.__roadDirAt) {
        const rd2 = window.__roadDirAt(bx, bz);
        if (rd2 && (rd2[0] || rd2[1])) ba = Math.atan2(rd2[0], rd2[1]);
      }
      let bd2 = Infinity;
      for (let k = 0; window.__roadDirAt ? false : k < pts.length - 1; k++) {
        const [px1, pz1] = pts[k], [px2, pz2] = pts[k + 1];
        const vx3 = px2 - px1, vz3 = pz2 - pz1, L3 = vx3 * vx3 + vz3 * vz3 || 1;
        let t3 = ((bx - px1) * vx3 + (bz - pz1) * vz3) / L3;
        t3 = Math.max(0, Math.min(1, t3));
        const d3 = (bx - (px1 + vx3 * t3)) ** 2 + (bz - (pz1 + vz3 * t3)) ** 2;
        if (d3 < bd2) { bd2 = d3; ba = Math.atan2(vx3, vz3); }
      }
      // above the carriageway surface, which is drawn at 0.055
      zebraT.push([bx, 0.075, bz, ba + Math.PI / 2]);
    }
    // TACTILE PAVING at both kerbs. OSM tags it on 34% of crossing nodes here
    // and it is on essentially every modern Singapore crossing -- the yellow
    // studded pad you stand on at the kerb. Nothing read the tag until
    // data/unused.py enumerated what the map carries.
    //
    // Placed at the kerb line either side, not at the crossing centre: the pad
    // is where the pavement meets the road, which is what makes it read as a
    // kerb ramp rather than a yellow patch in the middle of the tarmac.
    if (tp) {
      for (const sgn of [-1, 1]) {
        const px = ox + nx2 * sgn * (half + 0.55), pz2 = oz + nz2 * sgn * (half + 0.55);
        if (window.__onRoad && window.__onRoad(px, pz2, -0.3)) continue;
        tactileT.push([px, 0.09, pz2, ang2 + Math.PI / 2]);
        tactilePads++;
      }
    }

    // A PEDESTRIAN REFUGE: the raised island you stand on halfway across. Only
    // six crossings in the three districts are tagged with one -- 89 are tagged
    // explicitly as having none -- so this is a small, surveyed detail rather
    // than a rule applied everywhere, which is exactly the kind this project
    // keeps finding it had invented instead of read.
    if (isl) {
      const rx = ox, rz = oz;
      if (!(window.__onRoad && !window.__onRoad(rx, rz, 0))) refugeT.push([rx, 0.10, rz, ang2]);
    }

    // arclength for the pedestrian-signal logic
    let arc = 0;
    for (let i = 0; i < bi; i++) arc += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    arc += Math.hypot(ox - x1, oz - z1);
    crossingS.push(Math.round(arc));
    realCrossings++;
  }
  window.__realCrossings = realCrossings;
  window.__tactilePads = tactilePads;

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1);
  const emit = (geo, mat, list, fn) => {
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((rec, i) => { fn(rec); m.compose(p3, q, s3); im.setMatrixAt(i, m); });
    im.castShadow = false; im.receiveShadow = true;   // keeps them out of the shadow pass
    target.add(im);
  };
  // Every one of these is placed relative to the ground, not to y=0. Orchard
  // climbs about 34m over its length, and these were authored flat: the audit
  // found 5,804 props buried, some 34.6m under the hill.
  // SINGAPORE KERBS ARE PAINTED BLACK AND WHITE, in alternating bands, and
  // the extents are published (LTA SDRE Ch.3, KER2-KER3): 70m back from a
  // junction, 15m either side of a bus bay, 50m back from the tangent point of
  // a curve. Plain grey kerb runs between those stretches. It is one of the
  // most characteristic things about a Singapore street and the world had none
  // of it -- every kerb was the same unpainted concrete.
  //
  // Junctions are taken from the signal positions, which are surveyed, rather
  // than from a guess about where a junction is.
  {
    // straight from the surveyed layers in the scene file: signals mark
    // junctions, bus stops mark bays
    const junc = [];
    for (const sg of (data.signals || [])) junc.push([sg[0], sg[1]]);
    for (const st of (data.busstops || [])) junc.push([st.p ? st.p[0] : st[0], st.p ? st.p[1] : st[1]]);
    const near = (x, z) => {
      for (const [jx, jz] of junc) {
        const d2 = (x - jx) ** 2 + (z - jz) ** 2;
        if (d2 < 70 * 70) return true;
      }
      return false;
    };
    const painted = [], plain = [];
    let band = 0;
    for (const r of kerbT) (near(r[0], r[2]) ? painted : plain).push(r);
    // alternating bands: each kerb segment is 2m, so a pair of segments is
    // about the 1m-ish rhythm you see, read at riding speed
    const cc2 = new THREE.Color();
    if (painted.length) {
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.3, 2.0), MAT.kerbPaint, painted.length);
      painted.forEach((r, i) => {
        p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
        e.set(0, r[3], 0); q.setFromEuler(e);
        m.compose(p3, q, s3); im.setMatrixAt(i, m);
        // alternate along the run, keyed off position so the pattern is stable
        band = (Math.round(r[0] * 0.5) + Math.round(r[2] * 0.5)) & 1;
        im.setColorAt(i, cc2.setHex(band ? 0x2b2b2b : 0xe8e6de));
      });
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = false; im.receiveShadow = true;
      target.add(im);
    }
    kerbT.length = 0;
    for (const r of plain) kerbT.push(r);
  }
  // same 60cm dedupe as the side-street kerbs, see markings.js — and the
  // same lane guard: centre AND both ends clear of the carriageway at a
  // -0.3 margin, or the piece is not built (the last Grange Road bar was
  // one of THESE 2m crossing kerbs, not the side-street 4m one — two
  // emitters, one defect, and the first fix only guarded one of them)
  const kerbT2 = kerbT.filter((r) => {
    if (!window.__onRoad) return true;
    for (const off of [0, 0.9, -0.9]) {
      if (window.__onRoad(r[0] + Math.sin(r[3]) * off, r[2] + Math.cos(r[3]) * off, -0.3)) return false;
    }
    return true;
  });
  emit(new THREE.BoxGeometry(0.42, 0.3, 2.0), MAT.kerb, dedupeProps(kerbT2, 0.6), (r) => {
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  // THE LAMP POST, to LTA's published form.
  //
  // Researched 2026-07-29 against the LTA Public Street Lighting System
  // Guidelines and its standard drawings. Three things were wrong and all
  // three are visible from the saddle:
  //
  //   The pole is OCTAGONAL and continuously TAPERED, not a round tube --
  //   about 83mm across the flats at the top of an 8.5m pole against 200mm at
  //   the base. An 8-sided cylinder with the right taper is exactly that.
  //   It is BARE HOT-DIP GALVANISED, never painted, so it reads a lighter
  //   spangled grey than the signal poles beside it.
  //   The bracket is a SINGLE SMOOTH CURVED ARM, not a straight cantilever,
  //   rising about 1.8m from the pole top over a 2m outreach and tipped 5
  //   degrees down at the lantern.
  //
  // Standard heights are 6.0, 8.5, 10.2, 12.0 and 13.0m; this is the 8.5m
  // arterial pole. The curve is three short segments rather than a real sweep
  // because it is one extra instanced draw either way and nobody can see the
  // difference at 8m up.
  emit(new THREE.CylinderGeometry(0.042, 0.10, 8.5, 8), MAT.galv, lampT, (r) => {
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); q.identity();
  });
  emit(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), MAT.galv, armT, (r) => {
    p3.set(r[0], groundAt(r[5], r[6]) + r[1], r[2]);
    e.set(0, r[3], Math.PI / 2 - 0.2 * r[4]); q.setFromEuler(e);
  });
  // THE BRACKET ARM stays a straight cantilever for now.
  //
  // LTA's standard is a single smooth CURVED arm and it was built as three
  // segments -- but each armT record already carries the arm's own anchor and
  // yaw, so adding a further offset per segment threw them off the pole
  // entirely: the close-up showed brackets floating in mid-air beside their
  // posts. Vetted and reverted rather than shipped.
  //
  // To do it properly: build the curve as ONE geometry in the arm's local
  // frame (a few segments of a circular sweep, R1500 rising 1.8m over a 2m
  // outreach, tipped 5 degrees at the lantern) and instance THAT, so the
  // existing anchor and yaw place it unchanged. The pole below is already
  // right: octagonal, continuously tapered, bare hot-dip galvanised.
  emit(new THREE.BoxGeometry(1.0, 0.2, 0.44), MAT.trim, headT, (r) => {
    p3.set(r[0], groundAt(r[4], r[5]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  // Same ground-sharing rule as markings.js: `claim` is a single-cell hash and
  // lets near-boundary pairs through, so the axis pass drops any square that
  // already has one within 20cm at the same height.
  const dedupeFlatT = (list) => {
    const seen = new Map(), out = [];
    for (const r of list) {
      const k = Math.round(r[0] / 0.2) + ',' + Math.round(r[2] / 0.2);
      const y = seen.get(k);
      if (y !== undefined && Math.abs(y - r[1]) < 0.006) continue;
      seen.set(k, r[1]); out.push(r);
    }
    return out;
  };
  // Signalised-crossing boundary squares: 200mm, LTA SDRE TMM4.
  //
  // FILTERED TO THE TARMAC, like every marking in markings.js is. The axis
  // pass emits through a different helper that never had that guard, so a
  // boundary line laid across a junction ran on past the kerb and over the
  // pavement, and a cluster of crossings at one junction read as scatter
  // across the whole road rather than as lines. Same defect the lane markings
  // already had once, fixed there and not here -- a guard belongs at every
  // emit point or at none.
  const onRoadOnly = (list) => (window.__onRoad
    ? list.filter((r) => window.__onRoad(r[0], r[2], 0.15)) : list);
  emit(new THREE.PlaneGeometry(0.20, 0.20), MAT.white, dedupeFlatT(onRoadOnly(dotT)), (r) => {
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]);
    e.set(-Math.PI / 2, r[3], 0, 'YXZ'); q.setFromEuler(e);
  });
  emit(new THREE.PlaneGeometry(0.62, axis.w), MAT.white, zebraT, (r) => {
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]);
    e.set(-Math.PI / 2, r[3], 0, 'YXZ');
    q.setFromEuler(e);
  });
  // the refuge: a low kerbed island in the middle of the crossing
  emit(new THREE.BoxGeometry(2.0, 0.22, 3.4), MAT.kerb, refugeT, (r) => {
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  // the tactile pad: a 1.2m by 0.9m yellow panel laid flat at the kerb
  emit(new THREE.PlaneGeometry(1.2, 0.9), MAT.tactile, tactileT, (r) => {
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]);
    e.set(-Math.PI / 2, r[3], 0, 'YXZ');
    q.setFromEuler(e);
  });

  window.__crossings = crossingS;
  return trees.build(target);
}

/* ---------------- boot ---------------- */
const vespa = buildVespa();
const rider = buildRider();
vespa.group.add(rider);
// THE CAR, riding the exact same state and step() with its own numbers.
// Both rigs live in the one `bike` group so every placement, collision and
// camera line that says "bike" keeps working; the choice is which body is
// visible and which parameter set the physics runs.
const carRig = buildCar();
carRig.group.visible = false;
let vehicleKind = 'bike';
let rideParams = RIDE;
// The mode pill's text, in one place. A `function` declaration so it can be
// called from setVehicle — which runs during boot, long before updateHelp's
// `const` block exists — without walking into the temporal dead zone that
// crashed the whole module once already (see the note by updateHelp's call).
// It touches nothing but the button.
function modeLabel() {
  const btn = document.getElementById('modebtn');
  if (!btn) return;
  btn.textContent = mode === 'ride'
    ? 'Get off' : (vehicleKind === 'car' ? 'Drive' : 'Ride');
}
function setVehicle(kind) {
  vehicleKind = kind === 'car' ? 'car' : 'bike';
  rideParams = vehicleKind === 'car' ? CAR : RIDE;
  // a switch mid-corner froze the old body's bank into the new body: the
  // lean state carries over but only the ACTIVE branch writes rotations,
  // so the hidden rig kept its last roll forever. Reset all of it.
  S.lean = 0;
  vespa.group.rotation.z = 0;
  carRig.group.rotation.z = 0;
  carRig.group.visible = vehicleKind === 'car';
  vespa.group.visible = vehicleKind === 'bike';
  // in a car the rider sits behind tinted glass; on the bike he is the pilot
  if (mode === 'ride') rider.visible = vehicleKind === 'bike';
  try { localStorage.setItem('sg_vehicle', vehicleKind); } catch (e) { /* private mode */ }
  const b = document.getElementById('vehiclebtn');
  if (b) b.textContent = vehicleKind === 'bike' ? 'Car' : 'Bike';
  // swapping vehicle while on foot changes Ride <-> Drive
  modeLabel();
}
window.__setVehicle = setVehicle;
const bike = new THREE.Group();
// Named so the audit can tell the PLAYER'S OWN VEHICLE apart from the world.
// P1b was counting the scooter and its rider -- nine separate findings for the
// wheels, seat, deck, helmet and limbs -- as "structure standing in a
// carriageway", on a project whose entire premise is riding a scooter down
// Orchard Road. T1 has always had the principle written into it ("a vehicle is
// not an obstruction") and P1b never did. Named rather than matched by
// geometry signature, because this file already records that a signature
// allowlist fails closed the moment a shape is retuned.
bike.name = 'playerRig';
bike.add(vespa.group);
bike.add(carRig.group);
scene.add(bike);

let S = newState(0, 0, 0);
let ready = false, stats = {};
let crowdSys = null, trafficSys = null, wayfinder = null, signals = null;
// Signals instances for streamed-in districts; the boot one stays `signals`
const extraSignals = [];
// Crowds for streamed-in districts — the boot crowd walks only the spawn
// district's streets, and a Singapore street without people is "obviously
// not Singapore" (the lesson that raised the crowd to 2,200 in the first
// place applies to every district, not just the first). A district's crowd
// ticks only while it is LOADED, and its meshes live in the district group
// so an unload disposes them with everything else.
const extraCrowds = [];
// EVERY DISTRICT GETS ITS OWN TRAFFIC. `new Traffic(...)` was created ONCE, for
// the primary axis, so the six streamed districts had completely empty roads —
// South Bridge Road, Victoria Street, Bayfront Avenue, all of them, not a
// single vehicle. District CROWDS were given this treatment two sessions ago
// and traffic was missed, which is why the pavements looked alive and the
// carriageways did not. Same lifecycle: built with the chunk, ticked only
// while it is loaded, dropped when it unloads.
const extraTraffic = [];

// SIMULATE WHAT THE RIDER CAN SEE, NOT WHAT HAPPENS TO BE LOADED.
//
// Every streamed district builds its own Crowd and its own Traffic, and both
// were stepped every frame for every district that was resident — however far
// away it was. At the Bugis end of Victoria Street six districts sit within
// NEAR of each other, so the frame was stepping six crowds and six traffic
// systems while the rider could see one.
//
// Measured on a phone viewport, 2026-07-31, standing at that spot:
//
//     six districts, as shipped          13.6 fps
//     the same, sims frozen              40.8 fps
//     only two districts even visible    50.3 fps
//
// Three times the frame rate, and it is not a rendering problem: dropping the
// pixel ratio from 3 to 1 at the same spot moved it from 12.8 to 13.8 fps, so
// nine times fewer pixels bought one frame. This is CPU, and it is these two
// loops.
//
// MEASURED TO THE DISTRICT'S AXIS, NOT ITS BOX, and that distinction is the
// whole fix. The content boxes overlap heavily on purpose so the region closes
// with no seam holes, which means at Bugis the rider is INSIDE five or six of
// them at once and a box-distance test excludes nothing — the first version of
// this guard used boxes and bought exactly zero frames.
//
// The axis is the district's main street, and it is also the line the Crowd and
// the Traffic are actually built along, so it is the honest measure of "are
// these agents anywhere near the rider".
//
// 450m: beyond anything a pedestrian is legible at, and a district's own axis
// comes within that well before the rider reaches it. A frozen far district's
// cars stay where they are; nobody can see them, and collision against a
// stationary car 600m away is not a thing anyone can hit.
let SIM_X = 0, SIM_Z = 0;
const SIM_RADIUS = 450;
const SIM_R2 = SIM_RADIUS * SIM_RADIUS;
// AND A HARD CAP ON HOW MANY, because a radius alone does not bound this.
// Eight district axes converge around Bugis and Bras Basah; several are
// genuinely within 450m of each other, so the radius let four through and the
// frame was still paying for three streets the rider cannot see. Two is what
// the rider can actually be near: the street they are on and the one they are
// approaching.
const SIM_MAX = 2;
const _simActive = new Set();
let _simAt = -1e9;
function simAxDist2(o) {
  const ax = o && o.__ax;
  if (!ax || ax.length < 2) return -1;          // no axis: always simulate
  let best = Infinity;
  for (let i = 0; i < ax.length; i += 3) {
    const dx = ax[i][0] - SIM_X, dz = ax[i][1] - SIM_Z;
    const d2 = dx * dx + dz * dz;
    if (d2 < best) best = d2;
  }
  return best;
}
// Recomputed a few times a second, not per frame: the rider covers ~14m in
// 250ms at 200km/h and the radius is 450m, so nothing can slip in unnoticed.
function simRefresh(x, z, now) {
  SIM_X = x; SIM_Z = z;
  if (now - _simAt < 0.25) return;
  _simAt = now;
  _simActive.clear();
  const rank = [];
  for (const arr of [extraTraffic, extraCrowds]) {
    for (const o of arr) {
      const d2 = simAxDist2(o);
      if (d2 < 0) { _simActive.add(o); continue; }
      if (d2 <= SIM_R2) rank.push([d2, o]);
    }
  }
  rank.sort((a, b) => a[0] - b[0]);
  // SIM_MAX of each KIND, so a crowd is never starved by two traffic systems.
  let nc = 0, nt = 0;
  for (const [, o] of rank) {
    const isC = extraCrowds.indexOf(o) >= 0;
    if (isC ? nc < SIM_MAX : nt < SIM_MAX) { _simActive.add(o); isC ? nc++ : nt++; }
  }
}
function simNear(o) { return _simActive.has(o); }
// The ride, the walker and the engine sound must consider EVERY fleet, not
// just the spawn district's. A car you can see but ride straight through is
// worse than no car.
const trafficHits = (x, z, r, lat) => {
  if (trafficSys && trafficSys.hits(x, z, r, lat)) return true;
  for (const t of extraTraffic) if (t.hits(x, z, r, lat)) return true;
  return false;
};
const trafficNearest = (x, z) => {
  let d = trafficSys ? trafficSys.nearest(x, z) : 999;
  for (const t of extraTraffic) { const n = t.nearest(x, z); if (n < d) d = n; }
  return d;
};
// side streets already dressed, shared between the boot build and every
// streamed chunk so a street crossing a seam is never dressed twice
const dressedStreets = new Set();
// merged tiles of sub-4m detail, hidden beyond LOD_FAR (see the LOD pass)
const LODT = [];

// THE PHONE TIER. Every distance and every agent count in this world was chosen
// on a desktop and then shipped unchanged to a phone: 2,200 pedestrians, 120
// vehicles, small detail drawn out to 500m, instanced sets out to 600.
//
// The device the user actually rides on is a phone, and the complaint that
// started this was that it gets hot. Heat is sustained work, and sustained work
// here is dominated by how many things are simulated and how far away they are
// still being drawn — not by pixels (dropping the pixel ratio from 3 to 1 at
// the busiest spot in the world bought one frame per second) and not by shadows
// (5%).
//
// So the phone gets shorter sight and a slightly quieter street. `?full`
// restores the desktop figures on a phone for anyone who wants to compare, and
// desktop is untouched.
//
// THE CROWD IS CUT LEAST, ON PURPOSE. Sight distance and vehicle count are
// nearly invisible to a rider — detail beyond 340m on a phone screen is a few
// pixels, and nobody counts cars. Pedestrian DENSITY is the opposite: the crowd
// is culled from drawing at 105m, so every person removed is one fewer person
// in the only range where they are visible at all. A first pass at 1,150 halved
// the street; 1,700 is a 23% trim that costs proportionally less of what a
// rider actually sees. If the measurement says the crowd is not where the time
// goes, this number should go back up rather than down.
const PHONE = TOUCH && !P.has('full');

// NO PEDESTRIANS. The rider asked for an empty-of-people city on 2026-07-31,
// after a measurement showed what they cost. Same spot, alternating passes,
// rendered frames counted from renderer.info.render.frame:
//
//     as shipped                    37.0 fps   boot 7.9s
//     no pedestrians                55.0 fps   boot 6.9s
//     no pedestrians, no traffic    55.1 fps   boot 6.9s
//     as shipped (repeat)           35.9 fps   boot 7.9s
//
// Fifty per cent, and it is the PEOPLE, not the vehicles: removing traffic on
// top bought 0.1 fps. Worth knowing WHY, because it is no longer the walking
// simulation — after the draw-cull fix earlier the same day the crowd is about
// 6% of a CPU profile. The cost is pushing 2,200 people x 14 body parts of
// instance matrices to the GPU every frame. That is bandwidth, which is
// exactly what a phone has least of.
//
// `?people` restores them for anyone who wants the old street.
const PEOPLE = P.has('people');
const LOD_FAR = PHONE ? 340 : 500;
// static instanced sets (trees, lamps, posts, stripes) with per-instance
// distance culling — the sets span the whole region in one bounding sphere,
// so without this every leaf in the world is vertex-shaded every frame, in
// the main pass AND the shadow pass, no matter where the camera looks.
const LODI = [];
let lodLast = 0, lodX = 0, lodZ = 0;
// instanced meshes the LOD must never compact: the Signals system addresses
// its lens instances BY INDEX, so compaction would move the green light
const lodExclude = new Set();

// Collect LOD candidates under `root`: consolidated tiles of sub-4m detail
// (hidden beyond LOD_FAR) and static instanced sets (per-instance culling —
// they span the region in one bounding sphere, so without this every leaf is
// vertex-shaded every frame in the main AND shadow passes, whatever the
// view). The fog is near-opaque at the cull ranges (FogExp2 0.0038: ~17%
// visible at 350m, ~3% at 500m), so nothing is seen leaving. Excluded by
// mechanism: crowd (userData.crowdPart), traffic (frustumCulled=false),
// lodExclude (index-addressed sets). Safe to call again after a streamed
// chunk: userData.lodRegistered keeps entries unique.
function registerLod(root) {
  const bb = new THREE.Box3();
  root.traverse((o) => {
    if (!o.isMesh || !o.userData.tileBatch || o.userData.lodRegistered) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    bb.copy(o.geometry.boundingBox);
    if (bb.max.y - bb.min.y >= 4) return;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    o.userData.lodRegistered = true;
    LODT.push(o);
  });
  // Per-instance compaction is ON — the heat answer: ~-30% GPU with zero
  // visual change inside the haze. It spent half a day opt-in after the
  // torn-walker episode; the evidence now: the failure matched a poisoned
  // (non-finite) matrix in the OLD chinatown build, 14 crowded soak frames
  // are clean since that district's rebuild, every scene scans NaN-free,
  // and the compactor REFUSES non-finite instances so this path cannot
  // carry the class again. Composites cull at ONE range (600m) so trunk
  // and canopy leave together — the radius split tore trees apart.
  // ?noilod disables for A/B.
  if (P.has('noilod')) return;
  // bisect hook for the GPU-corruption investigation: ?ilodn=K registers
  // only the first K sets, so the culprit can be found by binary search
  const ilodMax = P.has('ilodn') ? +P.get('ilodn') : Infinity;
  root.traverse((o) => {
    if (!o.isInstancedMesh || o.userData.lodRegistered) return;
    if (o.userData.crowdPart || o.frustumCulled === false) return;
    if (lodExclude.has(o)) return;
    if (LODI.length >= ilodMax) return;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const r = o.geometry.boundingSphere.radius;
    const far = (r < 0.5 ? 300 : r < 2 ? 450 : 600) * (PHONE ? 0.68 : 1);
    const n = o.count;
    const src = o.instanceMatrix.array.slice(0, n * 16);
    const col = o.instanceColor ? o.instanceColor.array.slice(0, n * 3) : null;
    const px = new Float32Array(n), pz = new Float32Array(n);
    for (let i = 0; i < n; i++) { px[i] = src[i * 16 + 12]; pz[i] = src[i * 16 + 14]; }
    o.userData.lodRegistered = true;
    LODI.push({ o, src, col, n, px, pz, far });
  });
}
let terrain = new Terrain(null);
let mode = 'ride';                 // 'ride' | 'walk'
const sound = new Sound();
window.__sound = sound;   // so the audio path can be verified, not assumed
// BROWSERS WILL NOT START AUDIO WITHOUT A GESTURE, and these listeners have to
// see the gesture FIRST.
//
// They were registered in the bubble phase, and the ride controls call
// stopPropagation() on touchstart so a thumb on the throttle never reached
// them: audio simply did not start. Opening the map DID work, because that
// touch lands on a different element which does not stop the event -- which is
// exactly the symptom reported, "no volume until I toggle the map".
//
// Capture phase, on the document, so nothing downstream can swallow the unlock.
let lastGestureT = performance.now();
for (const ev of ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click']) {
  document.addEventListener(ev, () => { lastGestureT = performance.now(); sound.start(); sound.poke(); },
                            { passive: true, capture: true });
}
let camYaw = 0, camPitch = 0.16;   // free look, walk mode
const walker = newWalker();
const walkerRig = buildWalker();
walkerRig.group.visible = false;
scene.add(walkerRig.group);
let clock = 0;

// The region, merged from the districts by data/merge.py. ?scene=orchard still
// loads a single district, which is what the per-district gates want.
// The region: Orchard Road and Bras Basah, merged by data/merge.py. ?scene=orchard
// still loads the single district, which is what the per-district gates want.
const SCENE = (P.get('scene') || 'world').replace(/[^a-z0-9_-]/gi, '');
// BOOT PHASE TIMING. `?boot=1` prints where the seconds go, because the first
// three attempts at cutting a 29s mobile boot each optimised the wrong thing.
const BOOTT = [];
let _bt = performance.now();
const bmark = (name) => { const n = performance.now(); BOOTT.push([name, Math.round(n - _bt)]); _bt = n; };
window.__boot = BOOTT;
// The boot screen (#boot in index.html). The build blocks the main thread in
// second-long stretches, and a static "loading" line through 13s of that
// reads as a crash. Each step names the phase ABOUT to run and yields ONE
// macrotask so the browser can paint the bar — setTimeout(0), never rAF,
// which is throttled in a spawned window and would stall the gates. Skipped
// when the page is hidden: background timers clamp to a second each and
// nobody is watching.
const BOOTUI = {
  el: document.getElementById('boot'), fill: document.getElementById('bootfill'),
  lab: document.getElementById('bootlab'), pct: document.getElementById('bootpct'),
  sub: document.getElementById('bootsub'),
};
async function bstep(frac, label) {
  if (!BOOTUI.el) return;
  if (label) BOOTUI.lab.textContent = label;
  const p = Math.round(frac * 100);
  BOOTUI.fill.style.width = p + '%';
  BOOTUI.pct.textContent = p + '%';
  if (!document.hidden) await new Promise((r) => setTimeout(r, 0));
}
function bootDone() {
  if (!BOOTUI.el) return;
  BOOTUI.el.classList.add('off');
  setTimeout(() => BOOTUI.el.remove(), 600);
}
// The build body is a NAMED function now — the first structural step of the
// streaming design in WORKFLOW.md: a per-district loader will call this per
// district slice. Behaviour of the legacy whole-region path is unchanged;
// it simply calls the function once with the merged region.
//
// ?stream=1 takes the manifest path instead: fetch every district chunk up
// front (bytes are cheap; BUILDING is what stalls a phone), boot ONLY the
// first district through the exact same buildRegion, then stream the rest in
// cooperatively-yielding slices while the player rides. The flat file stays
// the default and the audits' subject until the streamed path has soaked.
if (!P.has('nostream')) {
  fetch(`./data/${SCENE}.manifest.json`)
    .then((r) => {
      if (!r.ok) throw new Error('no-manifest');
      return r.json().then(buildStreamed);
    })
    .catch((e) => {
      // no manifest for this scene (single-district audit scenes) — the flat
      // path is the fallback, not an error. A real boot failure inside
      // buildStreamed still lands in bootFailed below.
      if (String(e && e.message) !== 'no-manifest') return bootFailed(e);
      return fetch(`./data/${SCENE}.json`).then((r) => r.json()).then(buildRegion).catch(bootFailed);
    });
} else {
  fetch(`./data/${SCENE}.json`).then((r) => r.json()).then(buildRegion).catch(bootFailed);
}

// Pretty names for the teleport bar; ids come from the manifest.
//
// SHORT ON PURPOSE — these are pills on top of the map and the user has twice
// asked for that bar to stop eating the view, so they are not the registry's
// full names ("Little India / Farrer Park"). But a district missing from this
// table showed its RAW ID in the UI: littleindia shipped in the dropdown
// reading "littleindia" next to "Robertson Quay". Fifth hardcoded list to
// drift today, so it gets a fallback rather than just a new row — a future
// district will read "Tiong Bahru", not "tiongbahru", whether or not anyone
// remembers this table.
const DISTRICT_NAMES = {
  orchard: 'Orchard', brasbasah: 'Bras Basah', marinabay: 'Marina Bay',
  chinatown: 'Chinatown', rivervalley: 'River Valley', bugis: 'Bugis',
  robertson: 'Robertson Quay', littleindia: 'Little India',
};
const prettyDistrict = (id) => DISTRICT_NAMES[id]
  || String(id).replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/\b[a-z]/g, (c) => c.toUpperCase());

// The teleport target for a district: the midpoint of its main street by
// arclength, offset onto the carriageway exactly like the spawn point, so
// arriving somewhere always means arriving ON a road, facing along it.
function axisMidPose(axis) {
  const P0 = axis.p;
  let total = 0;
  for (let i = 0; i < P0.length - 1; i++) total += Math.hypot(P0[i + 1][0] - P0[i][0], P0[i + 1][1] - P0[i][1]);
  let acc = 0, best = 0;
  for (let i = 0; i < P0.length - 1; i++) {
    const seg = Math.hypot(P0[i + 1][0] - P0[i][0], P0[i + 1][1] - P0[i][1]);
    if (acc + seg >= total / 2) { best = i; break; }
    acc += seg;
  }
  const p0 = P0[best], p1 = P0[Math.min(best + 1, P0.length - 1)];
  const dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = Math.hypot(dx, dz) || 1;
  return { x: p0[0] + (-dz / L) * -3.4, z: p0[1] + (dx / L) * -3.4, heading: Math.atan2(dx, dz) };
}

async function buildStreamed(mani) {
  if (BOOTUI.sub) BOOTUI.sub.textContent = mani.districts.map((d) => d.id).join(' · ');
  const chunks = await Promise.all(mani.districts.map((d) =>
    fetch(`./data/${d.file}`).then((r) => {
      if (!r.ok) throw new Error(`no chunk ${d.file}`);
      return r.json();
    })));
  // the ground and the surround must know the WHOLE region at boot: the
  // heightfield mesh is built once, and grey massing must never stand where
  // a later chunk will build the real buildings
  const LAYERS = ['water', 'buildings', 'roads', 'bridges', 'covered', 'towers',
    'trees', 'crossings', 'signals', 'busstops', 'mrt', 'taxis', 'shops',
    'gantries', 'lamps'];
  const regionData = { origin: mani.origin, water: [], buildings: [], roads: [] };
  // kept for the streamed chunk builds: the shopfront pass needs to see
  // buildings in OTHER chunks or it sites bays into them at the seam
  REGIONB = regionData;
  for (const ch of chunks) for (const k of LAYERS) {
    if (!Array.isArray(ch[k])) continue;
    if (!regionData[k]) regionData[k] = [];
    regionData[k].push(...ch[k]);
  }
  const spawn = chunks[0];
  spawn.terrain = mani.terrain;
  spawn.axisFullLength = mani.axisFullLength;
  spawn.axes = spawn.axis && spawn.axis.p ? [spawn.axis] : [];
  const rest = mani.districts.slice(1).map((d, i) => ({ id: d.id, box: d.box, ch: chunks[i + 1] }));
  window.__districts = mani.districts.map((d, i) => {
    const ax = chunks[i].axis;
    return ax && ax.p ? { id: d.id, name: prettyDistrict(d.id), ...axisMidPose(ax) } : null;
  }).filter(Boolean);
  await buildRegion(spawn, {
    carveRoads: regionData.roads,
    regionData,
    streamRest: rest,
  });
}

// Build one streamed district into the live world. Every step is the same
// system the boot build uses, pointed at the chunk's own data, into the
// chunk's own group — with the shared pictures (collision, road index,
// water, walls, solid) EXTENDED first so every placement guard already sees
// the union. `Y` yields to the frame loop between slices.
async function addChunk(ch, id, Y, rec = {}) {
  // one private placement stream per district: build order can never
  // reshuffle the world (the determinism gate proved this property), and a
  // REBUILD after an unload reproduces the identical district
  let h = 0;
  for (const c of id) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  reseedPlacement(h);
  const mk = (t) => {
    const st = window.__streamState;
    if (!st) return;
    const now = performance.now();
    if (st.step) (st.times = st.times || []).push([id + ':' + st.step, Math.round(now - st._t)]);
    st.step = t; st._t = now;
  };
  const data = window.__data;
  // the probe arrays grow ONCE per district — a rebuild after an unload
  // must not double every layer
  if (!rec.pushed) {
    for (const k of ['water', 'buildings', 'roads', 'bridges', 'covered', 'towers',
      'trees', 'crossings', 'signals', 'busstops', 'mrt', 'taxis', 'shops',
      'gantries', 'lamps']) {
      if (Array.isArray(ch[k]) && Array.isArray(data[k])) data[k].push(...ch[k]);
    }
    if (ch.axis && ch.axis.p && data.axes) {
      // tagged with the OWNING district: two districts can carry the same
      // street as their axis (River Valley Road spans rivervalley AND
      // robertson), and a name lookup would bind the wrong geometry
      ch.axis.did = id;
      data.axes.push(ch.axis);
    }
    rec.pushed = true;
  }
  // NO re-indexing here: the boot indexed the whole region's roads,
  // footprints and water from the union (a chunk build that could not see a
  // neighbour's roads laid kerbs in Waterloo Close at the seam). The data
  // arrays still grow so runtime probes see every loaded layer.
  await Y();
  const g = new THREE.Group();
  g.name = 'district:' + id;
  world.add(g);
  mk('water');
  if (!P.has('nowater')) buildWater(g, ch);
  if (!P.has('notowers')) buildSupertrees(g, ch);
  await Y();
  mk('buildings');
  if (!P.has('nobuild')) await buildBuildings(g, ch, Y);
  mk('prune');
  pruneCarriageway(g, ROADIX.onRoad, (x, z) => terrain.at(x, z));
  await Y();
  mk('roads');
  await buildRoads(g, ch, Y);
  await Y();
  // the walls picture grows BEFORE the dressing and the shopfronts consult it
  mk('walls');
  if (WALLSREF) await WALLSREF.build(g, (x, z) => terrain.at(x, z), { yield: Y });
  await Y();
  const ax = ch.axis && ch.axis.p
    ? (trimAxes(data.axes).find((t) => t.did === id) || null) : null;
  if (ax) {
    mk('dress');
    if (!P.has('nofoliage')) dressStreet(ch, ax, g);
    await Y();
    let f = {};
    mk('furniture');
    if (!P.has('nofurniture')) f = buildFurniture(g, ax, place, ch);
    await Y();
    mk('signage');
    if (!P.has('nosigns')) buildSignage(g, ax, ch, place);
    await Y();
    mk('markings');
    if (!P.has('nomarks')) buildMarkings(g, ax, ch);
    await Y();
    mk('side');
    if (!P.has('noside')) {
      const before = new Set(dressedStreets);
      await dressSideStreets(g, ch, ax, place, TreeField, dressedStreets, 0, Y);
      rec.dressedDelta = [...dressedStreets].filter((r) => !before.has(r));
    }
    await Y();
    mk('sg');
    if (!P.has('nosg')) buildSgDetail(g, ax, ch, place);
    await Y();
    if (f.signals && f.signals.length) {
      const es = new Signals(f.signals, f.lensMesh || null);
      if (f.lensMesh) lodExclude.add(f.lensMesh);
      extraSignals.push(es);
      rec.signals = es;
    }
    if (PEOPLE) {
      mk('crowd');
      // population scales with the main street, same density class as the
      // spawn district (2,200 over 2,586m); walkers beyond 105m cost no
      // draws, and this crowd stops ticking the moment the district unloads
      // POPULATION FROM THE STREET'S LENGTH, NOT ITS VERTEX COUNT. This read
      // `ch.axis.p.length * 28 * 0.6` — the number of POLYLINE POINTS — so how
      // crowded a district looked depended on how finely OSM happened to map
      // its main street. Measured across the seven: 0.43 people per metre on
      // Bayfront Avenue against 0.85 on River Valley Road, a factor of two
      // decided by mapping detail alone. Same class as every other bug found
      // today: a quantised proxy standing in for the real measure.
      let axLen = 0;
      for (let i = 1; i < ch.axis.p.length; i++) {
        axLen += Math.hypot(ch.axis.p[i][0] - ch.axis.p[i - 1][0],
                            ch.axis.p[i][1] - ch.axis.p[i - 1][1]);
      }
      const pop = Math.round(Math.min(1600, Math.max(400, axLen * 0.6)) * (PHONE ? 0.75 : 1));
      const wb = WALLSREF ? (x2, z2) => blocked(x2, z2) || WALLSREF.at(x2, z2) : blocked;
      const chunkSides = selectSideStreets(ch, ax);
      const cr = new Crowd(ax, wb, pop, chunkSides);
      cr.build(g);
      if (window.__crossings) cr.setCrossings(window.__crossings);
      cr.__ax = ax && ax.p;        // see the sim-radius note by simNear()
      extraCrowds.push(cr);
      rec.crowd = cr;
      await Y();
    }
    if (!P.has('notraffic') && ax && ax.p && ax.p.length > 1) {
      mk('traffic');
      // Fleet scaled to the street it runs on, from the same figures the
      // primary axis uses: Orchard Road is 2,586m with 78 cars and 12 buses,
      // so one car per 33m and one bus per 215m of main street.
      let alen = 0;
      for (let i = 1; i < ax.p.length; i++) {
        alen += Math.hypot(ax.p[i][0] - ax.p[i - 1][0], ax.p[i][1] - ax.p[i - 1][1]);
      }
      // MEASURED 2026-07-31. alen/33 capped at 78 gives Orchard's 3,850m axis
      // one vehicle every 49m across the WHOLE road width and both directions,
      // which is thin for an arterial; 25m is what a busy one reads as.
      //
      // WHAT PROMPTED THIS WAS A FALSE ALARM, and the correction is worth
      // keeping. A rider's-eye frame down Orchard Road showed no vehicles at
      // all, and a probe confirmed zero within 120m. That is not a density bug:
      // Traffic.build() takes an `avoidS` and places its fleet from avoidS+55
      // over path.len-110, deliberately leaving a ~110m clear zone around the
      // player's SPAWN so nothing materialises on top of the rider. The frame
      // was taken at the spawn point, so it photographed the clearance gap.
      // Raising density did not change that number and never would have.
      // The spacing change below stands on its own; the alarm did not.
      //
      // 25m spacing is what a busy arterial actually reads as. Cheap: traffic
      // is ~1% of triangles after the 260m draw cull, and only what is near the
      // rider is ever drawn. Vehicles are placed at path.len/n with +-6m of
      // jitter, so at 25m nominal the closest pair sits ~13m apart against a
      // ~4.5m car -- no overlap, which D34 gates anyway.
      const cars = Math.round(Math.max(48, Math.min(240, alen / 12.5)) * (PHONE ? 0.62 : 1));
      const buses = Math.round(Math.max(8, Math.min(32, alen / 85)) * (PHONE ? 0.62 : 1));
      const tr = new Traffic(ax, cars, buses, axisSpec(ax, ch));
      tr.build(g, 0);
      tr.__ax = ax && ax.p;
      extraTraffic.push(tr);
      rec.traffic = tr;
      await Y();
    }
  }
  const solidBefore = WALLSREF ? (x, z) => WALLSREF.at(x, z) : null;
  mk('shops');
  if (!P.has('noshops')) await buildShopfronts(g, ch, ax ? [ax] : [], solidBefore, REGIONB, Y);
  await Y();
  mk('solid');
  if (SOLID) await SOLID.build(g, (x, z) => terrain.at(x, z), { yield: Y });
  await Y();
  mk('consolidate');
  if (!P.has('raw')) {
    // FOUR HEAVY PASSES BACK TO BACK WITH NOTHING BETWEEN THEM. Each one walks
    // the whole district — dedupe scans every material, consolidate merges every
    // mesh by material and tile, trimShadowCasters walks the graph again, and
    // registerLod copies every instanced set's matrices. Run together they were
    // the two longest blocking tasks in the whole session: 506ms at +1.9s after
    // the loading screen clears and 424ms at +3.1s, measured with
    // PerformanceObserver's longtask entries.
    //
    // A yield between them does not make the work smaller, but it lets the
    // frame in between actually draw, which is the difference between "the
    // world stutters as it loads" and "the world freezes twice".
    dedupeMaterials(world);
    await Y();
    await consolidate(g, Y);
    await Y();
    trimShadowCasters(g);
    await Y();
    if (!P.has('nolod')) registerLod(world);
    await Y();
  }
  if (wayfinder) wayfinder.refresh();   // minimap + names learn the new district

  // COMPILE THIS DISTRICT'S SHADERS BEFORE IT IS DRAWN, not during.
  //
  // Boot compiles the whole scene twice — once for the primary region and once
  // after the envMap flips USE_ENVMAP on the glass — and that is why the first
  // district appears cleanly. Nothing did it for a STREAMED district, so every
  // new material variant a chunk brings compiled synchronously inside the first
  // frame that drew it. `onFirstUse` was 1.4% of a boot-window profile, and
  // shader compilation does not spread itself over frames: it lands in one, as
  // a hitch, right after the loading screen clears and the neighbouring
  // districts arrive. That is the "still lags when I first load in".
  //
  // Scoped to THIS GROUP with the scene passed as the lighting context, so it
  // compiles the handful of new programs rather than re-walking the world on
  // every chunk. Failure is not fatal — without KHR_parallel_shader_compile it
  // falls back to compiling at first draw, which is exactly today's behaviour.
  try { await renderer.compileAsync(g, camera, scene); } catch (e) { /* falls back */ }

  // A BUILDING DOES NOT MOVE, SO STOP RECOMPUTING ITS MATRIX EVERY FRAME.
  //
  // three.js walks the whole graph each frame and rebuilds the world matrix of
  // anything with matrixAutoUpdate set. A settled world holds 5,220 objects and
  // 3,462 of them still had it on, nearly all static district geometry —
  // recipe masses, props, poles, signs — placed once and never touched again.
  // updateMatrixWorld was 5% of a profiled phone frame.
  //
  // WHAT IS DELIBERATELY LEFT ALONE, and why the test is by TYPE rather than by
  // a list of names: the district's Crowd and its Traffic live inside this same
  // group, and they are InstancedMeshes whose object matrix is identity while
  // the motion lives in instanceMatrix. Skipping every InstancedMesh means the
  // rule cannot freeze a pedestrian or a car even if one of those systems
  // starts moving its container later. Groups are skipped for the same reason:
  // a Group is what an animated assembly hangs off.
  //
  // The matrix is computed once here before the flag goes off, so nothing is
  // left at the origin — the bug this shape of optimisation usually causes.
  {
    let frozen = 0;
    g.traverse((o) => {
      if (o === g || o.isInstancedMesh || o.isGroup || !o.isMesh) return;
      o.updateMatrix();
      o.matrixAutoUpdate = false;
      frozen++;
    });
    if (window.__stats) window.__stats.staticMeshes = frozen;
  }
  rec.group = g;
}

// Tear a streamed district back out of the world: the group's geometry is
// disposed, its LOD entries dropped, its Signals stop ticking, and its side
// streets leave the dressed set so a REBUILD dresses them again. What stays,
// deliberately: the probe data arrays and the SOLID/colGrid/water pictures —
// a rebuild is placement-identical (private RNG stream), so the stale cells
// describe exactly what will stand there again, and collision that errs
// toward "something is there" 1.6km away can never hurt the rider.
function unloadChunk(rec) {
  if (!rec.group) return;
  const inG = new Set();
  rec.group.traverse((o) => inG.add(o));
  for (let i = LODT.length - 1; i >= 0; i--) if (inG.has(LODT[i])) LODT.splice(i, 1);
  for (let i = LODI.length - 1; i >= 0; i--) if (inG.has(LODI[i].o)) LODI.splice(i, 1);
  world.remove(rec.group);
  rec.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });

  // AND THE MATERIALS AND TEXTURES, which this used to leave behind entirely.
  //
  // THE BUG THIS FIXES, measured 2026-07-31. Teleporting round the eight
  // district spots twice: geometries rose and fell correctly, 1389 -> 2972 ->
  // 1926, so the geometry dispose above was doing its job. Textures only ever
  // ROSE — 214 at boot to 671 after two laps, +208 per lap, at the SAME eight
  // places. Every street-name plate, direction gantry and MRT sign builds its
  // own CanvasTexture with no cache, and nothing ever freed them. On a phone
  // that is real GPU memory that only grows, and the tab is eventually killed:
  // the user reported the page "crashing or rebooting itself" after teleporting
  // around, which is exactly this.
  //
  // WHY IT IS DONE BY LIVE-SET AND NOT BY A FLAG. Most materials here ARE
  // shared on purpose — sharedMats, tintedMats, shopHouseMats, LMAT, MAT, the
  // per-recipe module-level palettes — and disposing one of those would pull
  // the texture out from under every other district using it. Flagging them all
  // means finding every creation site and never missing one, which is the kind
  // of rule that holds until someone adds a material. Asking the scene instead
  // cannot be got wrong: collect what the dying group used, then walk what is
  // LEFT, and free only what nothing else still points at.
  //
  // It is also recoverable if the rule is ever too aggressive. dispose() frees
  // the GPU resource, not the JavaScript object — three.js re-uploads from
  // `texture.image` the next time the material is drawn — so the worst case is
  // one re-upload, not a black building.
  const doomedMats = new Set(), doomedTexs = new Set();
  const collect = (root, mats, texs) => root.traverse((o) => {
    const m = o.material;
    if (!m) return;
    for (const mm of (Array.isArray(m) ? m : [m])) {
      mats.add(mm);
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap',
                       'emissiveMap', 'aoMap', 'alphaMap', 'bumpMap']) {
        if (mm[k]) texs.add(mm[k]);
      }
    }
  });
  collect(rec.group, doomedMats, doomedTexs);
  const liveMats = new Set(), liveTexs = new Set();
  collect(scene, liveMats, liveTexs);
  let freedM = 0, freedT = 0;
  for (const t of doomedTexs) if (!liveTexs.has(t)) { t.dispose(); freedT++; }
  for (const m of doomedMats) if (!liveMats.has(m)) { m.dispose(); freedM++; }
  rec.freed = { mats: freedM, texs: freedT };
  if (rec.signals) {
    const i = extraSignals.indexOf(rec.signals);
    if (i >= 0) extraSignals.splice(i, 1);
    rec.signals = null;
  }
  if (rec.crowd) {
    const i = extraCrowds.indexOf(rec.crowd);
    if (i >= 0) extraCrowds.splice(i, 1);
  }
  if (rec.traffic) {
    const i = extraTraffic.indexOf(rec.traffic);
    if (i >= 0) extraTraffic.splice(i, 1);
    rec.crowd = null;   // its meshes died with the group
  }
  for (const r of rec.dressedDelta || []) dressedStreets.delete(r);
  rec.dressedDelta = null;
  rec.group = null;
}

// The streaming MANAGER, resident for the life of the page. Districts build
// when the rider comes within NEAR metres of their main street and unload
// past FAR — heap plateaus at what is around the rider, whatever the world
// grows to. `?streamall` builds everything and stops (what the gates use:
// an audit of a world that streams by proximity would judge whatever
// happened to be loaded). Distances are measured to the district's AXIS,
// not its bbox: the boxes deliberately overlap at every seam, so a bbox
// distance would read 0 from anywhere and build the whole world at boot.
async function streamRest(rest) {
  // MessageChannel, not setTimeout: timers are clamped to a second or more
  // in occluded pages (every headless harness, any backgrounded phone tab),
  // which turned a 3s chunk build into a minute of sleeping between slices.
  // A port message is an unthrottled macrotask — the frame loop still gets
  // its turn between slices, which is the whole point of yielding.
  const chan = new MessageChannel();
  let wake = null;
  chan.port1.onmessage = () => { if (wake) { const w = wake; wake = null; w(); } };
  // Time-gated: a yield point only actually yields after ~20ms of real work,
  // so a phone keeps its frame rate while the builders' fine-grained yield
  // points stay cheap no-ops the rest of the time. The clock restarts AFTER
  // the yield resolves, so time the browser spends rendering the interleaved
  // frame is not billed to the next work slice.
  // SIX MILLISECONDS, AND HAND THE FRAME BACK PROPERLY.
  //
  // This waited for TWENTY milliseconds of work before yielding at all, which
  // is longer than a whole 16ms frame — so every slice was guaranteed to drop
  // one, and the finer 8ms checks added inside the build loops were no-ops
  // because this gate never let them through. Worse, a MessageChannel message
  // is a macrotask: the browser gets to render once and then the next 20ms
  // slice starts immediately, so the main thread stayed pinned and every frame
  // arrived late. That is the "stuck stuck stuck" for the first ten seconds.
  //
  // Now: at most 6ms of building, then WAIT FOR AN ANIMATION FRAME. The frame
  // gets the rest of its budget, so the world builds while the page stays
  // responsive. It takes longer in wall-clock and it is smooth, which is the
  // right trade when the rider is sitting at the spawn point looking at a
  // district that is already there.
  //
  // The MessageChannel path is KEPT for a hidden page. requestAnimationFrame
  // does not fire in a backgrounded tab or a headless harness, and without
  // this fallback a chunk build would simply stop — which is the bug the
  // original comment here was written to avoid.
  // THE GATES GET THE OLD AGGRESSIVE PACING. `?streamall` is the audit's mode:
  // it builds every district in the world back to back and nobody is looking at
  // the screen. Pacing the build to 6ms a frame is for a RIDER, and applying it
  // there turned a 10-minute audit budget into a timeout — the boot-stutter fix
  // failed its own deploy that way.
  //
  // 20ms and a MessageChannel is what this used to do everywhere: it builds as
  // fast as the machine allows and never waits for a frame that nobody sees.
  const FAST = P.has('streamall') || P.has('nostream');
  let sliceT0 = performance.now();
  const Y = () => {
    if (performance.now() - sliceT0 < (FAST ? 20 : 6)) return Promise.resolve();
    if (FAST) {
      return new Promise((r) => { wake = r; chan.port2.postMessage(0); })
        .then(() => { sliceT0 = performance.now(); });
    }
    // DIAGNOSTIC, and it earns its keep. The gap since the last yield IS the
    // blocking time, so recording the worst one per build phase says exactly
    // which phase freezes the page — four separate guesses at the "first ten
    // seconds lag" were fixed before this existed and none of them was it.
    const blocked = performance.now() - sliceT0;
    const st0 = window.__streamState;
    if (st0 && st0.step) {
      st0.block = st0.block || {};
      if (blocked > (st0.block[st0.step] || 0)) st0.block[st0.step] = Math.round(blocked);
    }
    const p2 = (typeof document !== 'undefined' && document.visibilityState === 'visible')
      ? new Promise((r) => requestAnimationFrame(() => r()))
      : new Promise((r) => { wake = r; chan.port2.postMessage(0); });
    return p2.then(() => { sliceT0 = performance.now(); });
  };
  const px = () => (mode === 'ride' ? S.x : walker.x);
  const pz = () => (mode === 'ride' ? S.z : walker.z);
  const axDist = (rec) => {
    const pts = (rec.ch.axis && rec.ch.axis.p) || [];
    let best = Infinity;
    for (let i = 0; i < pts.length; i += 2) {
      const d = (pts[i][0] - px()) ** 2 + (pts[i][1] - pz()) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
  // LOAD A DISTRICT BY WHERE ITS CONTENT IS, NOT BY WHERE ITS MAIN STREET IS.
  //
  // Streaming decided everything on axDist — the distance to the chunk's main
  // road — and a district's axis is not its extent. Marina Bay's axis runs
  // along the bay, 904m from Raffles Place, while the chunk that owns UOB
  // Plaza, One Raffles Place and Republic Plaza reaches west to x=1770 and
  // CONTAINS Raffles Place. Standing between the three tallest buildings in
  // Singapore, the load test measured 904m against a 900m threshold and left
  // all three unbuilt: FOUR METRES of margin decided whether the CBD skyline
  // exists. Verified 2026-07-30 by parking the ride there for 160s — chinatown
  // and rivervalley streamed in, marinabay stayed pending forever, and a ray
  // dropped down UOB Plaza's centre hit bare ground.
  //
  // The box is the extent of what the chunk will actually DRAW, so a player
  // standing inside a district measures zero to it and it loads first. Cached
  // per record: the chunks are already in memory, and this walks them once.
  // The chunk ALREADY CARRIES ITS EXTENT as rec.box = [x0, z0, x1, z1] (the
  // district's terrain grid). The first version of this fix computed its own
  // box and cached it on `rec.box` — the property that already existed — so it
  // read back an ARRAY, took `.x0` off it, got undefined, and every distance
  // became NaN. NaN < NEAR is false, so nothing streamed at all, anywhere.
  // Adding a field that is already there is its own kind of bug; use the
  // world's answer rather than inventing a second one.
  const nearDist = (rec) => {
    const b2 = rec.box;
    if (!b2 || b2.length !== 4) return axDist(rec);
    const dx = Math.max(b2[0] - px(), 0, px() - b2[2]);
    const dz = Math.max(b2[1] - pz(), 0, pz() - b2[3]);
    return Math.hypot(dx, dz);
  };
  const ALL = P.has('streamall');
  // TIGHTENED WHEN THE MEASURE CHANGED. 900/1700 were distances to a
  // district's AXIS — a line somewhere inside it — so they had to be generous
  // enough to reach that line from outside the district. nearDist measures to
  // the district's EDGE and is ZERO anywhere inside it, so the same numbers
  // now reach roughly a district further than intended: five of seven chunks
  // were resident at Raffles Place. 480m of edge margin still loads a
  // neighbour well before you arrive (top speed is 41.8 km/h, so that is
  // forty seconds of warning), and a district you are STANDING IN is still
  // distance zero and loads first, which is the whole point of the change.
  // RESIDENCY IS THE MOBILE CRASH, and it is a different problem from the
  // texture leak fixed earlier the same day.
  //
  // That leak was real and is gone -- six laps of the eight district spots now
  // hold geometries, textures, programs and node counts flat. But the heap
  // still plateaus around 1,220 MB, because at 480/1000 as many as SIX
  // districts stay resident at once around Bugis, and 184 MB of the heap is
  // the CPU-side copy of 4,414 geometries that three.js keeps after upload.
  // Desktop Chrome allows 3,586 MB and never notices. A phone browser reaps a
  // tab far below that, which is the "plays a while then crashes" the rider
  // reported after the leak was already fixed.
  //
  // So a phone keeps a smaller world around itself. 380 still loads a
  // neighbouring district roughly thirty seconds before the rider reaches it at
  // top speed, and 640 unloads it once it is well behind. `?full` restores the
  // desktop figures.
  const NEAR = PHONE ? 380 : 480, FAR = PHONE ? 640 : 1000;
  // AND A HARD CEILING ON HOW MANY. Distance alone does not bound this: the
  // district boxes overlap by design, so at Bugis the rider is inside five of
  // them and every one reads as near. Beyond this many, the farthest by axis is
  // unloaded even if it is inside NEAR — the rider cannot see six districts and
  // a phone cannot hold them.
  const MAX_RESIDENT = PHONE ? 3 : 99;
  const recs = rest.map((r) => ({ ...r, pushed: false, group: null, signals: null, dressedDelta: null }));
  window.__streamState = { pending: recs.map((r) => r.id), building: null, done: [], unloads: 0 };
  window.__streamRecs = recs;
  const syncState = () => {
    window.__streamState.pending = recs.filter((r) => !r.group).map((r) => r.id);
    if (window.__stats && window.__data) {
      window.__stats.buildings = window.__data.buildings.length;
      window.__stats.roads = window.__data.roads.length;
    }
  };
  // EVICT BEFORE YOU BUILD. This sweep used to live after the build branch,
  // which `continue`s — so while ANYTHING was still loading, nothing was ever
  // unloaded and the resident cap never ran at all. Riding or teleporting means
  // there is nearly always something loading, so a ten-lap soak found FOUR
  // districts resident against a cap of three and the node count back at
  // 12,343 after the cap was supposed to hold it near 4,300.
  //
  // Freeing first also lowers the peak: on a teleport the far districts go
  // before the new ones arrive, instead of both being held at once.
  const evict = () => {
    if (ALL) return;
    let n = 0;
    for (const r of recs) {
      if (r.group && nearDist(r) > FAR) { unloadChunk(r); n++; }
    }
    const live = recs.filter((r) => r.group);
    if (live.length > MAX_RESIDENT) {
      live.sort((a, b) => axDist(b) - axDist(a));
      for (const r of live.slice(0, live.length - MAX_RESIDENT)) { unloadChunk(r); n++; }
    }
    if (n) { window.__streamState.unloads += n; syncState(); }
  };
  for (;;) {
    evict();
    let cand = recs.filter((r) => !r.group);
    if (!ALL) cand = cand.filter((r) => nearDist(r) < NEAR);
    // Never exceed the ceiling by building: if the resident set is already at
    // the cap, the nearest candidate has to wait for something to leave.
    if (!ALL && recs.filter((r) => r.group).length >= MAX_RESIDENT) cand = [];
    if (cand.length) {
      // Nearest content first; where two districts both contain you (the
      // bboxes overlap by design so the region closes with no seam holes)
      // both measure zero, so break the tie on whose main street you are
      // actually near — that is the one you are looking down.
      cand.sort((a, b) => (nearDist(a) - nearDist(b)) || (axDist(a) - axDist(b)));
      const next = cand[0];
      window.__streamState.building = next.id;
      try {
        await addChunk(next.ch, next.id, Y, next);
        if (!window.__streamState.done.includes(next.id)) window.__streamState.done.push(next.id);
      } catch (e) {
        console.error('stream chunk ' + next.id, e);
      }
      window.__streamState.building = null;
      syncState();
      continue;
    }
    if (ALL) { syncState(); return; }   // drained: the gates' mode is done
    await new Promise((r) => setTimeout(r, 1500));
  }
}
async function buildRegion(data, opts = {}) {
  // Streaming prerequisite, testable today: `?reseed` pins the placement
  // stream to a seed derived from the scene name at the START of the build,
  // and `?burn=N` deliberately consumes N draws first. With reseed, a burnt
  // and an unburnt build must produce the IDENTICAL world — that is the
  // order-independence the district loader needs, and data/determinism.mjs
  // gates it by fingerprint.
  if (P.has('burn')) { const n = +P.get('burn') || 0; for (let i = 0; i < n; i++) R(); }
  if (P.has('reseed')) {
    let hsh = 0;
    for (const ch of SCENE) hsh = (Math.imul(hsh, 31) + ch.charCodeAt(0)) >>> 0;
    reseedPlacement(hsh);
  }
  if (!window.__districts && data.axes && data.axes.length) {
    window.__districts = data.axes.filter((ax) => ax && ax.p).map((ax) => ({
      id: ax.n || 'street', name: ax.n || 'street', ...axisMidPose(ax) }));
  }
  BOOTT.push(['module-init+fetch', Math.round(performance.now())]);
  _bt = performance.now();
  if (BOOTUI.sub && data.axes && data.axes.length) {
    BOOTUI.sub.textContent = data.axes.map((a) => a.n).filter(Boolean).join(' · ');
  }
  await bstep(0.05, `reading the survey — ${(data.buildings || []).length.toLocaleString()} footprints`);
  terrain = new Terrain(data.terrain || null);
  // The ground gives way to the road. See carve() for why this exists; it must
  // happen before build() OR atDrawn() is used, so it is done at construction.
  terrain.carve(opts.carveRoads || data.roads || []);
  setTerrain(terrain);
  window.__terrain = terrain;
  // the audit needs the same notion of 'ground' the world uses: on a bridge
  // that is the DECK, not the seabed under it
  window.__bridgeDeckAt = bridgeDeckAt;
  indexBuildings(opts.regionData || data);

  // The road index is built FIRST. Buildings carry structural pieces — entrance
  // canopies, colonnades, the tree columns under ION's shell — that are placed
  // by offsets from a facade and have to be tested against the carriageways as
  // they are created. Building it after buildBuildings meant every one of those
  // tests silently answered "not in a road", and 59 six-metre columns ended up
  // standing in the street, including the row you meet at the spawn point.
  ROADIX = buildRoadIndex(opts.regionData || data, data.axis || null);
  window.__onRoad = (x, z, m, ex) => ROADIX.onRoad(x, z, m || 0, ex || null);
  window.__nearestStreet = (x, z) => ROADIX.nearestName(x, z);
  // the direction of the carriageway under a point, so a check can ask whether
  // something is laid ACROSS the road or along it
  // every carriageway direction near a point, because at a junction a crossing
  // over one street is parallel to the other and "the nearest road" is ambiguous
  window.__roadDirsNear = (x, z, reach = 16) => {
    const out = [];
    for (const r of data.roads) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const a = r.p[i], c = r.p[i + 1];
        const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
        const d2 = (x - (a[0] + dx * t)) ** 2 + (z - (a[1] + dz * t)) ** 2;
        if (d2 < reach * reach) { const L = Math.sqrt(l2); out.push([dx / L, dz / L]); break; }
      }
    }
    return out;
  };
  window.__roadDirAt = (x, z) => {
    let best = null, bd = Infinity;
    for (const r of data.roads) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const a = r.p[i], c = r.p[i + 1];
        const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
        const d = (x - (a[0] + dx * t)) ** 2 + (z - (a[1] + dz * t)) ** 2;
        if (d < bd) { bd = d; const L = Math.sqrt(l2); best = [dx / L, dz / L]; }
      }
    }
    return best;
  };
  window.__surfaceAt = (x, z) => surfaceAt(x, z);
  // the solidity test the ride and the walker actually use, so a check can ask
  // the same question they do rather than a lookalike
  window.__blocked = (x, z) => blocked(x, z);
  window.__data = data;
  // the limit must be passed through: dropping it capped every search at the
  // default 7m, and a stop node on the centreline of a 16m road needs further
  window.__pushClear = (x, z, m, limit) =>
    ROADIX.pushClear(x, z, m == null ? -0.6 : m, limit == null ? 7 : limit);

  // Where you start, chosen BEFORE anything is built that depends on it.
  //
  // Two things were wrong here and both only showed up when the district moved.
  // It picked the axis vertex nearest the WORLD ORIGIN, which worked purely
  // because the old per-district origin sat in the middle of Orchard Road; with
  // one origin for the island, (0,0) is seven kilometres away and the spawn
  // jumped to whichever end of the street happened to face it. And it ran AFTER
  // Traffic.build(), which is handed the spawn arclength so it can leave that
  // stretch clear, so the traffic was avoiding a placeholder at (0,0).
  //
  // The midpoint of the street by arclength is a real place and does not care
  // where the origin is.
  if (data.axis && data.axis.p.length > 1) {
    const P0 = data.axis.p;
    let total = 0;
    for (let i = 0; i < P0.length - 1; i++) {
      total += Math.hypot(P0[i + 1][0] - P0[i][0], P0[i + 1][1] - P0[i][1]);
    }
    let acc = 0, best = 0;
    for (let i = 0; i < P0.length - 1; i++) {
      const seg = Math.hypot(P0[i + 1][0] - P0[i][0], P0[i + 1][1] - P0[i][1]);
      if (acc + seg >= total / 2) { best = i; break; }
      acc += seg;
    }
    const p0 = P0[best], p1 = P0[Math.min(best + 1, P0.length - 1)];
    const dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = Math.hypot(dx, dz) || 1;
    const nx = -dz / L, nz = dx / L;
    S = newState(p0[0] + nx * -3.4, p0[1] + nz * -3.4, Math.atan2(dx, dz));
  }

  // WATER FIRST. Everything downstream asks "is this spot free", and until the
  // reservoir is registered the answer is yes: trees were planted in Marina Bay
  // because TreeField.add() ran during buildRoads, which used to happen before
  // this. Water depends on nothing, so it goes first and every later guard is
  // live by the time it is consulted.
  const water = P.has('nowater') ? { water: 0, waterArea: 0 } : buildWater(world, data);
  if (!P.has('nowater')) setWater(((opts.regionData || data).water || []).map((w) => w.p));
  bmark('setup+water');

  await bstep(0.09, `raising ${(data.buildings || []).length.toLocaleString()} buildings`);
  const bs = P.has('nobuild') ? { count: 0, tall: 0 } : await buildBuildings(world, data);
  bmark('buildings');
  // one sweep over what the building pass just added, before any street
  // furniture exists, so the scope is exactly "buildings and landmarks"
  const pruned = pruneCarriageway(world, ROADIX.onRoad, (x, z) => terrain.at(x, z));
  await bstep(0.23, `laying ${(data.roads || []).length.toLocaleString()} roads`);
  const fallbackAxis = await buildRoads(world, data);
  bmark('roads');
  const axis = data.axis || fallbackAxis;
  if (!data.axis && fallbackAxis) {
    // no stitched axis in the file, so re-index now that we have one
    ROADIX = buildRoadIndex(data, fallbackAxis);
  }

  // the ground itself, from the heightfield
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x9a9384, roughness: 0.95 });
  await bstep(0.31, 'shaping the ground');
  world.add(terrain.build(groundMat));
  bmark('terrain');
  // no apron: it overlapped the heightfield and doubled the shading cost across
  // the whole screen. The grid is padded 90m beyond the sampled roads already.

  // the city beyond the fetched box, so the district does not end in a plain
  // WATER BEFORE THE SURROUND, so the surround's grey massing can be kept out
  // of the bay rather than built across it.
  await bstep(0.34, 'raising the skyline');
  const trees2 = P.has('notowers') ? { supertrees: 0 } : buildSupertrees(world, data);
  const surround = P.has('nosurround') ? 0 : buildSurround(world, opts.regionData || data);
  bmark('surround');

  // Collision is rasterised in TWO passes, and this is the first: the buildings,
  // the landmark massing and the distant surround, before a single piece of
  // street furniture exists.
  //
  // The scope is the point. A shopfront may not be glazed where a wall stands
  // in front of it, and the walls that do that — podiums, atria, colonnades,
  // ION's shells — are placed by recipes and have no footprint to test against.
  // Rasterised AFTER the dressing instead, this grid also contained bus
  // shelters, planters and railings, and a bay was being refused because a bus
  // shelter stood on the pavement outside it. A shelter is not a reason for a
  // shop to have no window.
  //
  // The crowd is built against this too, so a pedestrian route through a podium
  // is a route the crowd can see. The second pass, at the end, adds everything
  // built after this line.
  // A SEPARATE grid, not the shared one.
  //
  // Assigning this to SOLID meant `blocked()` knew about building walls while
  // the street furniture was being placed, which moved the furniture, which
  // moved Orchard's P1b ratchet from 135 to 136. The furniture placement was
  // not the thing being fixed and a ratchet may not go up, so the two are kept
  // apart: this grid answers "is there a building wall here" for the bays and
  // the crowd, and SOLID is still built once at the end over everything, from
  // exactly the same geometry it always was.
  let WALLS = null, solidMs0 = 0;
  await bstep(0.38, 'tracing the walls');
  if (!P.has('nosolid')) {
    const tS = performance.now();
    WALLS = new Solid();
    await WALLS.build(world, (x, z) => terrain.at(x, z));
    WALLSREF = WALLS;
    solidMs0 = performance.now() - tS;
    window.__wallBefore = (x, z) => WALLS.at(x, z);
  }
  bmark('walls-grid');
  const solidBefore = WALLS ? (x, z) => WALLS.at(x, z) : null;
  // the crowd gets footprints AND drawn walls, which is what stopped seven
  // pedestrian routes running through podiums
  const walkBlocked = WALLS ? (x, z) => blocked(x, z) || WALLS.at(x, z) : blocked;

  // EVERY district's main street gets dressed, not just the first one.
  //
  // All of the dressing — kerbs, crossings, trees, markings, furniture, signage
  // — is placed by walking an axis, and a merged region has one axis per
  // district. Dressing only the primary left Bras Basah as bare roads and bare
  // buildings: correct geometry, no street. The actors (crowd, traffic, the
  // ride, the wayfinder) stay on the primary axis; those are a bigger change
  // and the visible difference is almost all dressing.
  const axes = trimAxes((data.axes && data.axes.length ? data.axes : [axis]).filter(Boolean));
  let treeCount = 0;
  await bstep(0.42, 'planting the Angsana avenue');
  if (!P.has('nofoliage')) for (const ax of axes) treeCount += dressStreet(data, ax);
  bmark('dressStreet');
  const sideStreets = [];
  {
    const seen = new Set();
    for (const ax of axes) for (const r of selectSideStreets(data, ax)) {
      if (seen.has(r)) continue;
      seen.add(r); sideStreets.push(r);
    }
  }
  if (!P.has('notraffic') && axis) {
    // Five lanes one way carrying 21 vehicles over 2,586m is a road at 4am.
    trafficSys = new Traffic(axis, PHONE ? 150 : 240, PHONE ? 20 : 32, axis && axisSpec(axis, data));
    trafficSys.build(world, trafficSys.path.nearestS(S.x, S.z));
    // The system itself, so a probe can DRIVE the tick instead of waiting on
    // requestAnimationFrame -- a spawned browser is throttled and its loop may
    // not run at all, which made an attempt to instrument the vehicle spacing
    // report zero calls to a function that demonstrably runs.
    window.__trafficSys = trafficSys;
    window.__trafficPositions = () => (trafficSys.items || []).map(() => 1);
    // Where every vehicle actually is, which nothing could ask before. A fleet
    // of 21 spaced over 2,586m could not collide with itself by accident; 90
    // can, and the spacing was never sized for it.
    window.__trafficState = () => (trafficSys.items || []).map((it) => ({
      kind: it.kind, x: it.wx, z: it.wz, lane: it.lane, dir: it.dir,
      heading: it.heading, speed: +it.speed.toFixed(2), s: +it.s.toFixed(1),
    }));
  }
  bmark('traffic');
  const furniture = {};
  let marks = 0; const side = {}; const sg = {}; const signage = {};
  const dressed = dressedStreets;
  let axi = 0;
  for (const ax of axes) {
    await bstep(0.46 + 0.06 * Math.min(axi++, 2), `dressing ${ax.n || 'the streets'}`);
    if (!P.has('nofurniture')) {
      const f = buildFurniture(world, ax, place, data);
      for (const k of Object.keys(f)) {
        if (Array.isArray(f[k])) furniture[k] = (furniture[k] || []).concat(f[k]);
        else furniture[k] = (furniture[k] || 0) + f[k];
      }
    }
    if (!P.has('nosigns')) {
      const g = buildSignage(world, ax, data, place);
      for (const k of Object.keys(g)) signage[k] = (signage[k] || 0) + g[k];
    }
    if (!P.has('nomarks')) marks += buildMarkings(world, ax, data);
      bmark('furniture+signage+markings');
    if (!P.has('noside')) {
      const t = await dressSideStreets(world, data, ax, place, TreeField, dressed);
      for (const k of Object.keys(t)) side[k] = (side[k] || 0) + t[k];
    }
    bmark('sideStreets');
    if (!P.has('nosg')) {
      const q = buildSgDetail(world, ax, data, place);
      bmark('sgdetail');
      for (const k of Object.keys(q)) sg[k] = (sg[k] || 0) + q[k];
    }
  }
  // The crowd is built AFTER the collision grid, not before it.
  //
  // A pedestrian route is a road or footway centreline, and seven of those pass
  // through geometry that has no footprint: a podium wall, the SOTA underpass,
  // a hotel's structure. Built first, the crowd's only idea of an obstacle was
  // the OSM footprint list — the same list that was wrong for the rider until
  // collision started being rasterised from the walls actually drawn. Now the
  // crowd is handed the same grid, so a route that goes through a wall is a
  // route it can see.
  await bstep(0.66, 'waking the crowd');
  if (PEOPLE && axis) {
    // spread over the whole dressed network, not just the main street. Only the
    // few dozen in view are ever drawn, so a bigger population is nearly free.
    // 460 was a correct system with nothing in it. Fourteen matched-angle
    // frames of Orchard Road had ONE pedestrian visible between them, which is
    // the single loudest way this stops reading as Singapore — the geometry can
    // be right to the metre and an empty Orchard Road on a Saturday is still
    // obviously not Orchard Road.
    //
    // Everyone beyond 105m is skipped before any matrix is written, so the cost
    // of a bigger population is the path evaluation and a grid lookup per
    // person per frame, not draw calls. Measured either side: see NEXT.md.
    crowdSys = new Crowd(axis, walkBlocked, PHONE ? 1700 : 2200, sideStreets);
    crowdSys.build(world);
    // must come after construction, or the handover is a no-op
    if (window.__crossings) crowdSys.setCrossings(window.__crossings);
    window.__crowdPositions = () => crowdSys.positions();
// EVERY crowd system, not just the boot district's. `extraCrowds` holds one per
// streamed district, so a probe reading only crowdSys sees Orchard's 2,200 and
// reports ZERO pedestrians standing next to a rider in Little India. That is
// exactly what happened on 2026-07-31, and it made a "14% of walkers are stuck"
// measurement untrustworthy -- the stuck ones were simply the districts the
// probe could not see. Same shape of hole as __allTraffic, fixed the same way.
    window.__allCrowd = () => {
      const out = [];
      for (const c of [crowdSys, ...extraCrowds]) {
        if (!c) continue;
        const ps = c.positions();
        for (let i = 0; i < ps.length; i++) {
          out.push({ x: ps[i][0], z: ps[i][1], s: c.people[i] ? c.people[i].s : 0,
                     speed: c.people[i] ? c.people[i].speed : 0 });
        }
      }
      return out;
    };
    window.__clearMask = (pi) => Array.from(crowdSys.clearMask[pi] || []);
    // Full per-pedestrian state, for the behaviour probe. Speeds alone tell you
    // that someone is sprinting and not why; this says which path they are on,
    // whether they are mid-crossing, and where along it they are.
    window.__crowdPaths = () => crowdSys.paths.map((pt, i) => ({
      i, len: +pt.len.toFixed(1), n: pt.pts.length, half: crowdSys.halves[i],
      pts: pt.pts,
    }));
    window.__pathAt = (i, s) => { const o = [0, 0, 0, 0]; crowdSys.paths[i].at(s, o); return o; };
    window.__crowdState = () => crowdSys.people.map((p) => ({
      pi: p.pi, s: +p.s.toFixed(2), off: +p.off.toFixed(2), dir: p.dir,
      crossing: !!p.crossing, crossT: +(p.crossT || 0).toFixed(3),
      crossDur: +(p.crossDur || 0).toFixed(2), speed: +p.speed.toFixed(2),
    }));
  }
  bmark('crowd');

  // Once for the district, not once per axis: a shopfront belongs to a
  // building, and a building on a corner fronts two streets.
  const shopGroup = new THREE.Group();
  world.add(shopGroup);
  await bstep(0.70, 'glazing the shopfronts');
  const shopf = P.has('noshops') ? {} : await buildShopfronts(shopGroup, data, axes, solidBefore);
  bmark('shopfronts');

  signals = new Signals(furniture.signals || [], furniture.lensMesh || null);
  window.__signalsSys = signals;
  if (axis) wayfinder = new Wayfinder(data, axis);
  window.__axis = axis;
  window.__roadList = data.roads.filter((r) => r.k !== 'footway' && r.k !== 'pedestrian');
  const people = crowdSys ? crowdSys.people.length : 0;

  stats = { surround, ...water, ...trees2, marks, laneCount: window.__laneCount, relief: data.terrain ? +Math.max(...data.terrain.h).toFixed(1) : 0, ...side, ...sg, realCrossings: window.__realCrossings, merged: bs.mergedMeshes, shophouses: bs.shophouses, junctions: (furniture.signals || []).length, buildings: bs.count, bespoke: bs.bespoke, towers: bs.tall, roads: data.roads.length, people, trees: treeCount, ...furniture, ...signage, ...shopf };
  // one pass over the finished district: share identical materials, then batch
  // small static meshes per 110m tile. See consolidate.js.
  // Solidity is rasterised from the finished district and BEFORE the meshes are
  // batched: after batching, one mesh spans a 110m tile and its geometry no
  // longer says where its walls are.
  await bstep(0.78, 'making the walls solid');
  if (!P.has('nosolid')) {
    const t0 = performance.now();
    SOLID = new Solid();
    const st = await SOLID.build(world, (x, z) => terrain.at(x, z));
    stats.solidCells = st.cells; stats.solidWalls = st.walls;
    stats.solidMs = Math.round(solidMs0 + (performance.now() - t0));
    window.__solid = (x, z) => SOLID.at(x, z);
  }
  bmark('solid-grid');

  const RAW = P.has('raw');       // audit mode: leave objects unbatched
  await bstep(0.84, 'packing the city');
  const dedupe = RAW ? { before: 0, after: 0 } : dedupeMaterials(world);
  const cons = RAW ? { removed: 0, merged: 0 } : await consolidate(world);
  bmark('dedupe+consolidate');
  stats.matsBefore = dedupe.before; stats.matsAfter = dedupe.after;
  const shad = RAW ? { kept: 0, dropped: 0 } : trimShadowCasters(world);
  stats.batched = cons.removed; stats.batches = cons.merged;
  stats.casters = shad.kept; stats.castersDropped = shad.dropped;
  stats.prunedFromRoads = pruned;

  // LOD v1: a merged tile whose contents are all under 4m — kerb runs, road
  // markings, bins, bollards, planters — subtends about a pixel at 500m and
  // is usually behind six buildings anyway. Those tiles stop being drawn
  // beyond that range (checked every ~250ms in the loop, not per frame).
  // Buildings and anything tall never enter this list, so the skyline is
  // untouchable. `?nolod` turns it off; RAW (audit) mode never batches, so
  // audits and the determinism gate see every mesh exactly as before.
  if (!RAW && !P.has('nolod')) {
    if (furniture.lensMesh) lodExclude.add(furniture.lensMesh);
    registerLod(world);
    stats.lodTiles = LODT.length;
    stats.lodSets = LODI.length;
  }

  window.__scene = scene; window.__camera = camera; window.__THREE = THREE;
  // Placement fingerprint for the determinism gate: a cheap rolling hash of
  // every instanced matrix in the world. Two builds that placed everything
  // identically hash identically; one relocated bench does not.
  {
    let h1 = 0x9e3779b9;
    const m4 = new THREE.Matrix4();
    scene.traverse((o) => {
      if (!o.isInstancedMesh) return;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m4);
        const e2 = m4.elements;
        for (let k = 12; k < 15; k++) {
          h1 = (Math.imul(h1 ^ Math.round(e2[k] * 100), 2654435761)) >>> 0;
        }
      }
    });
    window.__placementHash = h1.toString(16);
  }
  bmark('rest');

  // GPU WARM-UP, and it must come AFTER consolidate. The first rendered frame
  // used to be an 8.7s main-thread task — Metal shader translation plus the
  // upload of 178MB of merged vertex data — sitting invisibly AFTER __ready,
  // so every boot mark was green while the page sat frozen for nine more
  // seconds. Worse, buildEnvironment() used to render the UNCONSOLIDATED
  // scene, uploading the whole world once, only for consolidate() to rebuild
  // every buffer and pay the upload again on frame one.
  //
  // Order now: compile every program in parallel (KHR_parallel_shader_compile,
  // polls on setTimeout so a throttled rAF cannot hang it), then render the
  // env cube from the merged scene, then one real frame from the boot camera —
  // so __ready means what livecheck thinks it means: the next frame is cheap.
  // Skipped in ?raw audit mode: the audits inspect the built scene and never
  // render a frame, so warming the GPU for them would add the whole driver
  // pipeline-compile (~15s headless) to every gate load for nothing.
  if (!RAW) {
    // `?bootgl` drains the GPU queue after each warm-up stage so the wait
    // shows up against the stage that queued it, instead of as one anonymous
    // stall at the end of the task.
    const glFinish = P.has('bootgl') ? () => { renderer.getContext().finish(); bmark('gl-drain'); } : () => {};
    // The extended warm-up (spin + ride-out checkpoints) is for REAL GPUs.
    // The gate harness renders on SwiftShader, where those extra frames cost
    // tens of seconds and time the livecheck out — and a software renderer
    // has no driver pipelines to warm anyway.
    let softGPU = false;
    try {
      const gl = renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      softGPU = dbg ? /swiftshader|llvmpipe|software/i.test(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : false;
    } catch (e) { /* unknown GPU: treat as real */ }
    await bstep(0.90, 'compiling shaders');
    try { await renderer.compileAsync(scene, camera); } catch (e) { /* ext missing: first render compiles instead */ }
    bmark('shader-compile');
    glFinish();
    await bstep(0.94, 'catching reflections');
    buildEnvironment();
    // assigning envMap flips USE_ENVMAP on the glass materials, which is a NEW
    // program per variant — compile those in parallel too, or the warm render
    // pays for them synchronously at first draw
    try { await renderer.compileAsync(scene, camera); } catch (e) { /* same fallback */ }
    bmark('shader-compile-env');
    glFinish();
    // The one stretch that can still freeze for seconds on a slow GPU — the
    // first real frame uploads every merged buffer — so it is labelled and
    // parked at 97% rather than left looking like a hang at an anonymous bar.
    await bstep(0.97, 'first light');
    driveCamera(0.016);
    sky.position.copy(camera.position);
    renderer.render(scene, camera);
    bmark('gpu-warmup');
    // THE 360 SPIN. One warm view left every OTHER direction cold, and the
    // first look around uploaded+compiled tiles on the spot — the start
    // hang that froze the whole world for seconds on phones (user report:
    // even the pedestrians stand still). Six renders around the spawn make
    // the neighbourhood GPU-resident before the player can move; the
    // bstep yields let the browser breathe between them.
    // On a software renderer (the gate harness) the full spin costs over a
    // minute, but skipping every warm render just moves that cost into the
    // first loop frame, which freezes long enough to read as a dead loop —
    // that was a real flake. One render pays the bill inside the loading
    // bar on both kinds of GPU; only the EXTRA five are real-GPU-only.
    {
      const eyeY = terrain.at(S.x, S.z) + 2.0;
      for (let sp = 0; sp < (softGPU ? 1 : 6); sp++) {
        const a2 = (sp / 6) * Math.PI * 2;
        camera.position.set(S.x, eyeY, S.z);
        camera.lookAt(S.x + Math.sin(a2) * 60, eyeY + 4, S.z + Math.cos(a2) * 60);
        renderer.render(scene, camera);
        await bstep(0.97 + sp * 0.004, 'first light');
      }
      driveCamera(0.016);
    }
    // RIDE-OUT CHECKPOINTS (real GPUs only): the spin warms the spawn circle, but the first
    // 10-20 seconds of riding show geometry nobody warmed (user-measured:
    // "after 10 to 20 seconds after driving off then ok"). Render from
    // points 150m and 300m down the axis BOTH ways, looking both along and
    // back, so the first half-minute of road is GPU-resident before the
    // bar finishes.
    if (!softGPU && axis && axis.p.length > 1) {
      const sIdx = (() => {
        let best = 0, bd = Infinity;
        for (let i = 0; i < axis.p.length; i++) {
          const d2 = (axis.p[i][0] - S.x) ** 2 + (axis.p[i][1] - S.z) ** 2;
          if (d2 < bd) { bd = d2; best = i; }
        }
        return best;
      })();
      const ptAt = (steps) => axis.p[Math.max(0, Math.min(axis.p.length - 1, sIdx + steps))];
      for (const steps of [-12, -6, 6, 12]) {
        const q = ptAt(steps);
        const qy = terrain.at(q[0], q[1]) + 2.2;
        for (const look of [1, -1]) {
          const q2 = ptAt(steps + look * 4);
          camera.position.set(q[0], qy, q[1]);
          camera.lookAt(q2[0], qy + 3, q2[1]);
          renderer.render(scene, camera);
        }
        await bstep(0.985, 'first light');
      }
      driveCamera(0.016);
    }
    bmark('warmup-spin');
    // SIM PRE-ROLL: two seconds of crowd + traffic + signal ticks behind the
    // loading bar. Their first real ticks lazily build clear-masks and
    // spacing structures — CPU spikes that used to land in the player's
    // first seconds (user report: still very laggy at start even after the
    // GPU spin; pedestrians frozen implicates the sim side too).
    await bstep(0.99, 'waking the street');
    if (crowdSys || trafficSys) {
      for (let k = 0; k < 120; k++) {
        const tSim = k * 0.0166;
        if (signals) signals.update(tSim);
        for (const es of extraSignals) es.update(tSim);
        if (trafficSys) trafficSys.update(tSim, 0.0166, signals, S.x, S.z);
        simRefresh(S.x, S.z, tSim);
        for (const t of extraTraffic) if (simNear(t)) t.update(tSim, 0.0166, signals, S.x, S.z);
        if (crowdSys) crowdSys.update(tSim, 0.0166, S.x, S.z, signals);
        for (const c of extraCrowds) if (simNear(c)) c.update(tSim, 0.0166, S.x, S.z, signals);
        if ((k & 15) === 0) await bstep(0.99, 'waking the street');
      }
    }
    bmark('sim-preroll');
    glFinish();
  } else buildEnvironment();

  await bstep(1, 'ready');
  bootDone();
  ready = true;
  if (P.has('boot')) console.log('BOOT ' + JSON.stringify(BOOTT));
  window.__ready = true;
  window.__stats = stats;
  if (opts.streamRest && opts.streamRest.length) streamRest(opts.streamRest);
}
function bootFailed(e) {
  window.__bootError = (e && e.stack) || String(e);
  hud.textContent = 'boot failed: ' + e.message;
  // The overlay STAYS on a failed boot and says so — fading it out over a
  // dead black canvas would be the exact "looks crashed with no words" state
  // this screen exists to prevent.
  if (BOOTUI.lab) BOOTUI.lab.textContent = 'boot failed: ' + e.message;
  console.error('BOOT', e);
}

if (TOUCH) attachTouch(canvas);
attachMouse(canvas);
// NO MUTE BUTTON. Sound is on and stays on; a phone already has a volume
// control and a hardware switch, and a mute button that says the wrong thing is
// worse than none -- this one used to read "Sound on" while the sound was
// already on, so the first tap silenced the ride and looked like a bug.
{
  const btn = document.getElementById('modebtn');
  if (btn) {
    const tap = (e) => { e.preventDefault(); e.stopPropagation(); toggleMode(); };
    btn.addEventListener('click', tap);
    btn.addEventListener('touchstart', tap, { passive: false });
  }
  const vbtn = document.getElementById('vehiclebtn');
  if (vbtn) {
    const tap = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (mode !== 'ride') return;               // choose from the saddle only
      setVehicle(vehicleKind === 'bike' ? 'car' : 'bike');
    };
    vbtn.addEventListener('click', tap);
    vbtn.addEventListener('touchstart', tap, { passive: false });
  }
  let saved = 'bike';
  try { saved = localStorage.getItem('sg_vehicle') || 'bike'; } catch (e) { /* fine */ }
  setVehicle(saved);
}

// Glass with nothing to reflect always looks like painted plastic. Render the
// scene into a cube map once from above the street and hand it to the renderer
// as the environment: every standard material then picks up sky and massing for
// no per-frame cost. Intensity stays low on rough surfaces, per the hard-won
// note that a bright sky blows out rough dielectrics.
function buildEnvironment() {
  const target = new THREE.WebGLCubeRenderTarget(256, {
    generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCam = new THREE.CubeCamera(1, 900, target);
  cubeCam.position.set(0, 34, 0);
  scene.add(cubeCam);
  cubeCam.update(renderer, scene);
  scene.remove(cubeCam);
  // Assign per material rather than scene-wide: scene.environment makes every
  // standard material sample the cube map, and on a fill-rate-bound GPU that is
  // paid on concrete and tarmac for no visible gain.
  let touched = 0;
  scene.traverse((o) => {
    const m = o.material;
    if (!m) return;
    for (const mm of Array.isArray(m) ? m : [m]) {
      if (!mm.isMeshStandardMaterial) continue;
      if (mm.roughness > 0.45) continue;          // glass and polished stone only
      mm.envMap = target.texture;
      mm.envMapIntensity = mm.roughness < 0.25 ? 0.95 : 0.5;
      mm.needsUpdate = true;
      touched++;
    }
  });
  window.__envMats = touched;
}

/* ---------------- camera rigs ---------------- */
const CAM = P.get('cam') || 'ride';
const topCam = new THREE.OrthographicCamera(-260, 260, 260, -260, 1, 2000);
// up must be set BEFORE lookAt: looking straight down with the default up
// (0,1,0) is degenerate and yields a broken orientation
topCam.up.set(0, 0, -1);
topCam.position.set(0, 900, 0);
topCam.lookAt(0, 0, 0);

function toggleMode() {
  if (mode === 'ride') {
    // step off to the left of the scooter, onto the kerb side
    const nx = Math.cos(S.heading), nz = -Math.sin(S.heading);
    let wx = S.x + nx * 1.2, wz = S.z + nz * 1.2;
    if (blocked(wx, wz)) { wx = S.x - nx * 1.2; wz = S.z - nz * 1.2; }
    walker.x = wx; walker.z = wz; walker.heading = S.heading; walker.speed = 0;
    S.speed = 0; S.reversing = false;
    camYaw = S.heading; camPitch = 0.16;
    walkerRig.group.visible = true;
    rider.visible = false;      // he is the one standing next to it now
    mode = 'walk';
  } else {
    // THE VEHICLE COMES TO YOU. "Walk back within 6m" made walking a trap:
    // wander a street away and the ride button silently did nothing. Now a
    // far vehicle is SUMMONED to a clear spot beside the walker — fanned
    // search, pavement preferred, and a failed search keeps the old rule
    // rather than teleporting you into a wall (skip, never substitute).
    const d = Math.hypot(walker.x - S.x, walker.z - S.z);
    if (d > 6) {
      let placed = false;
      for (const reach of [1.6, 2.4, 3.2]) {
        for (let a = 0; a < Math.PI * 2 && !placed; a += Math.PI / 6) {
          const nx2 = Math.cos(walker.heading + a), nz2 = -Math.sin(walker.heading + a);
          const px2 = walker.x + nx2 * reach, pz2 = walker.z + nz2 * reach;
          if (blocked(px2, pz2)) continue;
          if (trafficHits(px2, pz2, 1.2)) continue;
          S.x = px2; S.z = pz2; S.heading = walker.heading; S.speed = 0;
          placed = true;
        }
        if (placed) break;
      }
      if (!placed) return;                   // nowhere clear: walk closer
    }
    walkerRig.group.visible = false;
    rider.visible = vehicleKind === 'bike';
    camInit = false;
    mode = 'ride';
  }
  updateHelp();
}

const stickEl = document.getElementById('stick');
const knobEl = document.getElementById('knob');
const lookHintEl = document.getElementById('lookhint');

function updateHelp() {
  if (stickEl) stickEl.classList.toggle('on', mode === 'walk');
  if (lookHintEl) lookHintEl.classList.toggle('on', mode === 'walk');
  const ped = document.getElementById('pedals'), sh = document.getElementById('steerhint');
  if (ped) ped.classList.toggle('on', mode === 'ride' && TOUCH);
  if (sh) sh.classList.toggle('on', mode === 'ride' && TOUCH);
  // THE BUTTON IS UPDATED BEFORE THE EARLY RETURN, and that is the whole bug
  // the user reported: there is no #help element in index.html any more — the
  // panel was removed — so `if (!el) return` fired on EVERY call and the line
  // that relabels the mode button was never reached. The pill kept the text it
  // was born with in the markup, "Get off", whether you were on the bike or
  // standing beside it. A guard for one element must not gate another.
  //
  // And it names the vehicle: getting on a car is not "Ride". vehicleKind is
  // the same value the vehicle button shows, so the two agree.
  modeLabel();
  const el = document.getElementById('help');
  if (!el) return;
  el.innerHTML = mode === 'ride'
    ? '<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br>'
      + '<b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br>'
      + '<span style="opacity:.65">keys: A/D · W · S · E to get off</span>'
    : '<b>drag left side</b> walk<br><b>drag right side</b> look around<br>'
      + '<span style="opacity:.65">keys: WASD · shift to run · E to ride</span>';
}
// reflect the STARTING mode once everything the helper reads exists — called
// above the const block it crashed the whole module in the temporal dead zone
updateHelp();

function walkCamera(dt) {
  // just above head height and offset to the shoulder, so the view forward is
  // clear but you can still see who you are
  const back = 2.15, side = 0.66, eye = 1.78;
  const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
  const rx = -fz, rz = fx;                     // screen-right in world space
  const sy = Math.sin(camPitch), cy = Math.cos(camPitch);
  const wy = terrain.at(walker.x, walker.z);
  camera.position.set(
    walker.x - fx * back * cy + rx * side,
    wy + eye + back * sy * 0.75,
    walker.z - fz * back * cy + rz * side
  );
  // aim along the look direction, not at the walker, so it reads first-person
  const AHEAD = 12;
  camera.lookAt(
    walker.x + fx * AHEAD * cy + rx * side,
    wy + eye - sy * AHEAD,
    walker.z + fz * AHEAD * cy + rz * side
  );
  camera.fov = 65; camera.updateProjectionMatrix();
}

const camPos = new THREE.Vector3(), camAim = new THREE.Vector3();
let camInit = false;
// vet-only free camera: ?spec=x,y,z,tx,ty,tz[,fov]
// Also settable at runtime through window.__cam so the comparison sheet can
// take a dozen matched-angle frames from ONE load. Reloading per frame costs
// four seconds of world build each time and, worse, rebuilds the crowd and the
// traffic fleet, so no two frames would show the same street.
const SPEC0 = (P.get('spec') || '').split(',').map(Number);
let SPEC = (SPEC0.length === 6 || SPEC0.length === 7) && SPEC0.every((n) => Number.isFinite(n))
  ? SPEC0 : null;

function driveCamera(dt) {
  if (SPEC) {
    camera.position.set(SPEC[0], SPEC[1], SPEC[2]);
    camera.lookAt(SPEC[3], SPEC[4], SPEC[5]);
    camera.fov = SPEC[6] || 46; camera.updateProjectionMatrix();
    return;
  }
  const fwd = new THREE.Vector3(Math.sin(S.heading), 0, Math.cos(S.heading));
  const gy = terrain.at(S.x, S.z);
  const want = new THREE.Vector3(S.x, gy, S.z)
    .addScaledVector(fwd, vehicleKind === 'car' ? -7.4 : -5.8)
    .add(new THREE.Vector3(0, vehicleKind === 'car' ? 3.5 : 3.05, 0));
  want.y = Math.max(want.y, terrain.at(want.x, want.z) + 1.6);
  const aim = new THREE.Vector3(S.x, gy + 1.35, S.z).addScaledVector(fwd, 7.5);
  aim.y = terrain.at(aim.x, aim.z) + 1.35;
  if (!camInit) { camPos.copy(want); camAim.copy(aim); camInit = true; }
  camPos.lerp(want, Math.min(1, dt * 4.2));
  camAim.lerp(aim, Math.min(1, dt * 6.0));
  camera.position.copy(camPos);
  camera.lookAt(camAim);
  // SPEED WIDENS THE LENS, BUT NOT THIS MUCH. 58 to 70 degrees is a big pull
  // back — at speed the street reads further away and smaller, which is the
  // "too zoomed out when riding fast" the user asked about. Kept as a cue
  // because some sense of speed in the lens is worth having, just a third of
  // the old amount: 58 -> 63.
  //
  // AND IT DIVIDED BY THE BIKE'S TOP SPEED WHILE DRIVING THE CAR. RIDE.vMax is
  // 11.6 m/s; CAR.vMax is 18.0. So a car at its own top speed scored a ratio of
  // 1.55 and reached 76.6 degrees — the car was pulling back half again as hard
  // as the bike and nobody had asked it to. `rideParams` is already the active
  // vehicle's parameters, and the ratio is clamped so no future vehicle can
  // walk past the end of the range either.
  const spd = Math.min(1, Math.abs(S.speed) / ((rideParams && rideParams.vMax) || RIDE.vMax));
  camera.fov = 58 + spd * 5;
  camera.updateProjectionMatrix();
}

/* ---------------- resize ---------------- */
const DPR_FORCE = parseFloat(P.get('dpr') || '0');
// (declared BEFORE resize(): resize reads TIER_DPR at module init, and a
// later `let` is a temporal-dead-zone crash — the second one today)
// NO DEFAULT CAP. Capping every phone to 30 made a world that ran at 60
// feel broken ("everything lagging" — the user, correctly). The cap now
// exists only where it earns its keep: ?fps=N explicitly, or the adaptive
// tier demoting a device that measured under 20fps anyway.
// THE PHONE FRAME CAP, AND IT DEFAULTS ON. The loop below documents a "RIDING
// FRAME CAP, phones only: 30fps" and explains that sustained full-rate
// rendering is what makes the device hot — but this constant defaulted to 0,
// so the cap only ever applied to a phone the adaptive tier had already
// demoted, or when ?fps= was passed by hand. Every phone that could hold a
// decent frame rate ran uncapped: measured on a phone-shaped viewport after
// the 2026-07-31 sim fix, a sustained ride sits at 52-55fps with the GPU flat
// out for as long as the rider keeps moving. That is the heat.
//
// 30 is the figure the loop already says it uses, and it roughly halves every
// per-frame cost. Desktop stays uncapped, ?fps=60 still overrides for phones
// that can take it, and the low tier still drops further to 24.
// THE PHONE FRAME CAP IS ON, AT 30, AND THIS TOOK THREE ATTEMPTS TO MEASURE.
//
// The loop below has always documented a "RIDING FRAME CAP, phones only: 30fps"
// and argued that sustained full-rate rendering is what makes a device hot. The
// constant nevertheless defaulted to 0, so the cap only ever applied to a phone
// the adaptive tier had already demoted.
//
// FIRST ATTEMPT, WRONG. Turned it on, measured 34.3 uncapped against 16.3
// capped, concluded the cap was harmful, reverted it. Every one of those
// readings came from a SEPARATE browser launch on a machine that was also
// running an Overpass refetch — the same uncapped configuration measured 34.3
// and then 17.3 twenty minutes apart. That is the machine, not the cap.
//
// SECOND ATTEMPT, ALSO WRONG. Measured parked, and got exactly 20.0 for four
// different levers, because a parked phone with no gesture for six seconds is
// already held at ~24fps by the idle cooler further down. Nothing could be
// told apart through it.
//
// THIRD ATTEMPT, TRUSTWORTHY. One page, one settled location, a touch every two
// seconds so the idle cooler stays off, the cap toggled underneath it through
// window.__fpsCap, alternating passes, medians of rendered frames counted from
// renderer.info.render.frame:
//
//     cap off      43.5  36.3  29.1     median 36.3
//     cap 40       36    36    25.1     median 36
//     cap 30       30    30    26.6     median 30
//     cap 24       24    24    22.6     median 24
//
// The cap is precise: ask for 30 and you get 30, ask for 24 and you get 24. It
// holds because of the accumulator fix in the loop, which advances by whole
// intervals instead of snapping the clock to now.
//
// So 30 costs about six frames a second against a device managing 36, and buys
// a ~17% reduction in sustained per-frame work for as long as the rider keeps
// moving. That is the lever the loop always said it was, and it is worth having
// on a phone the user has told us gets hot.
//
// ?fps=60 still overrides for anyone who wants the smoothness, the adaptive
// tier still drops a genuinely weak phone to 24, and window.__fpsCap is there
// so the next person can re-run the A/B above rather than take this on trust.
let FPS_CAP = TOUCH ? (parseFloat(P.get('fps') || '0') || 30) : 0;
// ADAPTIVE TIER: a phone that cannot hold ~20fps at the standard settings
// demotes itself once — dpr 1.25, cap 24 — and remembers, so weaker phones
// run cool and smooth without a settings screen. Verdict from the median of
// the first eight one-second fps readings after ready; ?dpr/?fps overrides
// win, and a saved verdict applies from the next boot's first frame.
let TIER_DPR = 0;
const tierFps = [];
// The default cap above must NOT count as "the user chose a frame rate":
// only an explicit ?fps= or ?dpr= disables the adaptive tier, otherwise
// turning the cap on would have switched the tier off for every phone.
let tierDone = !TOUCH || !!P.get('fps') || !!P.get('dpr');
try {
  if (!tierDone && localStorage.getItem('sg_tier') === 'low') {
    TIER_DPR = 1.25; FPS_CAP = 24; tierDone = true;
  }
} catch (e) { tierDone = tierDone || false; }
function tierSample(f) {
  if (tierDone) return;
  tierFps.push(f);
  if (tierFps.length < 8) return;
  tierDone = true;
  const s = [...tierFps].sort((a, b) => a - b);
  if (s[4] < 20) {
    TIER_DPR = 1.25; FPS_CAP = 24;
    try { localStorage.setItem('sg_tier', 'low'); } catch (e) { /* fine */ }
    resize();
  }
}
let appliedW = 0, appliedH = 0;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  appliedW = w; appliedH = h;
  // Phones render at 1.5x, not 2x: the world is fill-rate bound, so this is
  // ~44% fewer pixels — the single biggest thermal lever — for a sharpness
  // cost that is hard to see at phone size. ?dpr= still overrides for
  // screenshots and the reference-platform checks.
  renderer.setPixelRatio(DPR_FORCE || TIER_DPR || Math.min(devicePixelRatio || 1, TOUCH ? 1.5 : 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const a = w / h;
  const halfZ = 440;
  topCam.left = -halfZ * a; topCam.right = halfZ * a;
  topCam.top = halfZ; topCam.bottom = -halfZ;
  topCam.updateProjectionMatrix();
}
addEventListener('resize', resize);
// On a phone rotation the browser fires `resize` BEFORE the viewport
// settles, so the canvas was sized from stale dimensions and the first
// landscape after a portrait load rendered squeezed until a second
// rotation re-fired the event with real numbers. The loop therefore checks
// the ACTUAL canvas size every frame — two property reads — and re-sizes
// the moment reality and the applied size disagree, whichever order the
// browser delivers its events in.
function resizeIfStale() {
  if (canvas.clientWidth !== appliedW || canvas.clientHeight !== appliedH) resize();
}
resize();

/* ---------------- loop ---------------- */
let last = performance.now(), frames = 0, t0 = last, fps = 0, lastCoolT = 0;
// frames >200ms in the first 10s after ready — the number the user's
// screenshot carries so "still laggy" becomes measurable (shows as jN)
let jankCount = 0, jankWindowEnd = 0;
let lastCapT = 0, shadowFlip = true;
// A/B THE FRAME CAP INSIDE ONE PAGE. Comparing two browser launches on a busy
// machine is worthless -- the same uncapped configuration measured 34.3 and
// 17.3 rendered fps twenty minutes apart -- so the cap has to be switched
// under a single settled world with everything else held still.
window.__fpsCap = (n) => { FPS_CAP = +n || 0; lastCapT = 0; return FPS_CAP; };

function loop(now) {
  const rawDt = (now - last) / 1000;
  if (ready) {
    if (!jankWindowEnd) jankWindowEnd = now + 10000;
    else if (now < jankWindowEnd && rawDt > 0.2) jankCount++;
  }
  const dt = Math.min(0.05, rawDt); last = now;

  // Stop rendering entirely when the page is not visible. A 60fps WebGL loop is
  // a real power draw — it pegged two CPU cores on this laptop — and on a phone
  // it is battery and heat for nothing.
  if (document.hidden) { requestAnimationFrame(loop); return; }
  resizeIfStale();

  // Nothing renders until the world is ready. This mattered the moment boot
  // gained an await (the GPU warm-up below): rAF frames interleave with the
  // tail of boot, and an un-gated loop would render the half-warm scene —
  // stalling on the very shader compiles the warm-up exists to overlap — and
  // reportHud would overwrite the loading text with "0 fps".
  if (!ready) { requestAnimationFrame(loop); return; }

  // IDLE COOLDOWN, phones only: parked and untouched for six seconds, the
  // render drops to ~24fps. A phone reading the street name was working
  // exactly as hard as one at full tilt, which is where the heat the user
  // felt came from. Any touch snaps it back to full rate instantly — the
  // gesture listener stamps lastGestureT before this check runs again.
  if (TOUCH && now - lastGestureT > 6000) {
    const parked = mode === 'ride' ? Math.abs(S.speed) < 0.15 : walker.speed < 0.05;
    if (parked && now - lastCoolT < 41) { requestAnimationFrame(loop); return; }
    lastCoolT = now;
  }
  // RIDING FRAME CAP, phones only: 30fps. The heat the user still felt was
  // sustained full-rate rendering — the cap halves every per-frame cost at
  // a smoothness loss that reads fine from a saddle. Desktop stays uncapped;
  // ?fps=60 overrides for the phones that can take it.
  // THE CAP MUST NEVER MAKE A SLOW DEVICE SLOWER, and as written it did.
  //
  // `lastCapT = now` snaps the clock to the moment a frame STARTED being
  // allowed. If the device is already slower than the cap — say a frame takes
  // 29ms against a 33ms budget — the next animation-frame callback arrives too
  // early by a hair, gets skipped, and the one after it lands a whole vsync
  // later. The device ends up rendering at half the rate it could manage.
  //
  // Measured on a phone viewport, 2026-07-31, riding: 34.5 rendered fps
  // uncapped, 14.3 with a 30fps cap. The cap cost 20 frames a second while
  // trying to save power.
  //
  // Advancing by whole intervals instead paces a fast device at the cap and
  // leaves a slow one alone: if more than two intervals have already gone by,
  // the device is not keeping up and the clock resyncs to now rather than
  // accumulating a debt of skips it can never repay.
  if (TOUCH && FPS_CAP) {
    const interval = 1000 / FPS_CAP;
    if (now - lastCapT < interval - 2) { requestAnimationFrame(loop); return; }
    lastCapT = (now - lastCapT > interval * 2) ? now : lastCapT + interval;
  }
  // Shadows refresh EVERY frame again. The alternate-frame "optimisation"
  // made every pedestrian's shadow jerk behind them at half rate — the
  // "people glitching" the user reported. Half-size maps stay: invisible.

  // LOD tick, every ~250ms: far tiles of small detail stop drawing. The
  // distance is judged against the tile's bounding sphere EDGE, so a tile is
  // only hidden once every piece of it is beyond LOD_FAR.
  if ((LODT.length || LODI.length) && now - lodLast > 250
      && Math.hypot(camera.position.x - lodX, camera.position.z - lodZ) > (lodLast ? 8 : -1)) {
    lodLast = now;
    const cx = lodX = camera.position.x, cz = lodZ = camera.position.z;
    for (const o of LODT) {
      const s = o.geometry.boundingSphere;
      const d = Math.hypot(s.center.x - cx, s.center.z - cz) - s.radius;
      o.visible = d < LOD_FAR;
    }
    // compact each static instanced set down to the instances within range
    for (const L of LODI) {
      const f2 = L.far * L.far;
      const a = L.o.instanceMatrix.array, c = L.col ? L.o.instanceColor.array : null;
      let k = 0;
      for (let i = 0; i < L.n; i++) {
        const dx = L.px[i] - cx, dz = L.pz[i] - cz;
        if (dx * dx + dz * dz > f2) continue;
        a.set(L.src.subarray(i * 16, i * 16 + 16), k * 16);
        if (c) c.set(L.col.subarray(i * 3, i * 3 + 3), k * 3);
        k++;
      }
      L.o.count = k;
      L.o.instanceMatrix.needsUpdate = true;
      if (c) L.o.instanceColor.needsUpdate = true;
    }
  }

  // The first ready frame was an 8.7s task while renderer.render was 1s of it:
  // the other 7.7s hid in the subsystem first-ticks below. Timed per call on
  // that one frame so the cost has a name (`?boot=1`).
  const FIRST = ready && window.__ff === undefined;
  let fLast = FIRST ? performance.now() : 0;
  const fmk = FIRST ? (n) => { const t = performance.now(); BOOTT.push(['f:' + n, Math.round(t - fLast)]); fLast = t; } : () => {};
  if (ready) {
    const inp = readInput(mode);
    if (input.toggleMode) { input.toggleMode = false; toggleMode(); }
    if (window.__force) {   // vet harness drives without touching the screen
      inp.throttle = window.__force.throttle ?? inp.throttle;
      inp.brake = window.__force.brake ?? inp.brake;
      inp.steer = window.__force.steer ?? inp.steer;
    }

    if (mode === 'walk') {
      camYaw -= inp.lookDX * 0.0045;
      camPitch = Math.max(-0.35, Math.min(0.95, camPitch + inp.lookDY * 0.0035));
      // stick is relative to where the camera is pointing
      const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
      // forward is f, screen-right is (-fz, fx); stick up is negative moveY
      const mx = -inp.moveY * fx - inp.moveX * fz;
      const mz = -inp.moveY * fz + inp.moveX * fx;
      const wx = walker.x, wz = walker.z;
      stepWalk(walker, dt, mx, mz, inp.run);
      if (trafficHits(walker.x, walker.z, 0.32)) {
        walker.x = wx; walker.z = wz; walker.speed = 0;
      }
      if (blocked(walker.x, walker.z)) {
        if (!blocked(walker.x, wz)) walker.z = wz;
        else if (!blocked(wx, walker.z)) walker.x = wx;
        else { walker.x = wx; walker.z = wz; }
      }
      if (knobEl) {
        knobEl.style.transform = `translate(${input.stickDX.toFixed(1)}px, ${input.stickDY.toFixed(1)}px)`;
      }
      walkerRig.group.position.set(walker.x, surfaceAt(walker.x, walker.z), walker.z);
      walkerRig.group.rotation.y = walker.heading;
      walkerRig.pose(walker.phase, walker.speed);
      const wgy = terrain.at(walker.x, walker.z);
      sun.position.set(walker.x + SUNDIR.x * 150, wgy + SUNDIR.y * 150, walker.z + SUNDIR.z * 150);
      sun.target.position.set(walker.x, wgy, walker.z);
      sun.target.updateMatrixWorld();
      clock += dt;
      if (signals) signals.update(clock);
    for (const es of extraSignals) es.update(clock);
      for (const es of extraSignals) es.update(clock);
      if (trafficSys) trafficSys.update(clock, dt, signals, walker.x, walker.z);
      simRefresh(walker.x, walker.z, clock);
      for (const t of extraTraffic) if (simNear(t)) t.update(clock, dt, signals, walker.x, walker.z);
      if (crowdSys) crowdSys.update(clock, dt, walker.x, walker.z, signals);
      for (const c of extraCrowds) if (simNear(c)) c.update(clock, dt, walker.x, walker.z, signals);
      if (wayfinder) wayfinder.update(walker, dt);
      sound.update(0, 'walk', walker.speed, walker.phase, trafficNearest(walker.x, walker.z));
      if (SPEC) driveCamera(dt); else walkCamera(dt);
      renderer.render(scene, camera);
      frames++;
      if (now - t0 > 1000) reportHud(now);
      requestAnimationFrame(loop);
      return;
    }

    const px = S.x, pz = S.z;
    // SUB-STEP THE PHYSICS THROUGH JANK. dt is clamped to 0.05, so on a
    // phone whose first seconds after ready run at a few fps, six real
    // seconds advanced the sim by a fraction of one — full throttle read
    // as "cannot drive off, wait a while". The ride model is pure and
    // cheap, so it runs as many <=50ms slices as the REAL elapsed time
    // needs (bounded, so a background tab does not fast-forward);
    // everything else keeps the clamped dt and merely slow-mos through
    // the jank, which is cosmetic.
    {
      let realDt = Math.min(0.24, rawDt);
      while (realDt > 0.0001) {
        const slice = Math.min(0.05, realDt);
        step(S, slice, inp.throttle, inp.brake, inp.steer, rideParams);
        realDt -= slice;
      }
    }
    // you cannot ride through a bus — but a SIDE graze slides along it
    // like walls do. The old response reverted the whole move and killed
    // the speed on any overlap, so riding parallel to traffic in the next
    // lane kept dead-stopping the bike (user bug report, 2026-07-30).
    {
      // Fore-and-aft keeps the old generous radius -- nosing into the back of a
      // bus should stop you early. ACROSS is the scooter's real half-width at
      // the handlebars, 0.33m, which is what stops the phantom braking when
      // riding alongside. A car in car-mode is 1.78 wide, half 0.89.
      const rr = vehicleKind === 'car' ? 0.95 : 0.55;
      const rlat = vehicleKind === 'car' ? 0.89 : 0.34;
      if (trafficHits(S.x, S.z, rr, rlat)) {
        if (!trafficHits(S.x, pz, rr, rlat)) { S.z = pz; S.speed *= 0.9; }
        else if (!trafficHits(px, S.z, rr, rlat)) { S.x = px; S.speed *= 0.9; }
        else {
          S.x = px; S.z = pz;
          S.speed *= -0.12;             // head-on: a small bounce, then stopped
          if (Math.abs(S.speed) < 0.4) S.speed = 0;
        }
      }
    }
    if (blocked(S.x, S.z)) {
      // slide along the wall rather than dead-stopping: keep whichever single
      // axis of the attempted move is still free
      const tryX = { x: S.x, z: pz }, tryZ = { x: px, z: S.z };
      if (!blocked(tryX.x, tryX.z)) { S.z = pz; S.speed *= 0.86; }
      else if (!blocked(tryZ.x, tryZ.z)) { S.x = px; S.speed *= 0.86; }
      else { S.x = px; S.z = pz; S.speed *= 0.2; }
    }

    const gy = terrain.at(S.x, S.z);
    bike.position.set(S.x, surfaceAt(S.x, S.z), S.z);
    bike.rotation.y = S.heading;
    // pitch into the slope, so a climb reads as a climb
    const fwdX = Math.sin(S.heading), fwdZ = Math.cos(S.heading);
    bike.rotation.x = -Math.atan(terrain.slopeAlong(S.x, S.z, fwdX, fwdZ, 3.5));
    if (vehicleKind === 'bike') {
      vespa.group.rotation.z = S.lean;
      vespa.wheels[0].rotation.x = -S.wheel;
      vespa.wheels[1].rotation.x = -S.wheel;
    } else {
      carRig.group.rotation.z = S.lean;          // CAR.leanMax keeps this a small roll
      // full euler recompose: writing .x alone on a wheel pre-rolled about z
      // runs through euler composition and visibly cocks the wheel
      for (const w of carRig.wheels) w.rotation.set(-S.wheel * 0.68, 0, Math.PI / 2);
    }

    // keep the shadow frustum on the rider, not the whole town
    sun.position.set(S.x + SUNDIR.x * 150, gy + SUNDIR.y * 150, S.z + SUNDIR.z * 150);
    sun.target.position.set(S.x, gy, S.z);
    sun.target.updateMatrixWorld();

    if (TOUCH) {
      const pg = document.getElementById('pedalgo'), ps = document.getElementById('pedalstop');
      if (pg) pg.classList.toggle('hot', inp.throttle > 0.05);
      if (ps) ps.classList.toggle('hot', inp.brake > 0.05);
      const sd = document.getElementById('steerdot');
      if (sd) sd.style.transform = `translateX(${(inp.steer * 40).toFixed(1)}px)`;
    }
    clock += dt;
    fmk('pre');
    if (signals) signals.update(clock);
    fmk('signals');
    if (trafficSys) trafficSys.update(clock, dt, signals, S.x, S.z);
    simRefresh(S.x, S.z, clock);
    for (const t of extraTraffic) if (simNear(t)) t.update(clock, dt, signals, S.x, S.z);
    fmk('traffic');
    if (crowdSys) crowdSys.update(clock, dt, S.x, S.z, signals);
    for (const c of extraCrowds) if (simNear(c)) c.update(clock, dt, S.x, S.z, signals);
    fmk('crowd');
    if (wayfinder) wayfinder.update(S, dt);
    fmk('wayfind');
    sound.update(S.speed, 'ride', 0, 0, trafficNearest(S.x, S.z));
    fmk('sound');

    driveCamera(dt);
    fmk('camera');
  }

  const activeCam = CAM === 'top' ? topCam : camera;
  sky.position.copy(activeCam.position);      // keeps the dome inside the far plane
  // The first frame of the finished world compiles every shader and uploads
  // every texture and geometry, synchronously. It was invisible to the boot
  // marks — build "done" at 12s, page usable at 21s — so it is timed like a
  // build phase, because it is one.
  if (ready && window.__ff === undefined) {
    const tF = performance.now();
    renderer.render(scene, activeCam);
    window.__ff = Math.round(performance.now() - tF);
    BOOTT.push(['first-frame', window.__ff]);
  } else renderer.render(scene, activeCam);

  frames++;
  if (now - t0 > 1000) reportHud(now);
  requestAnimationFrame(loop);
}

function reportHud(now) {
  {
    fps = Math.round((frames * 1000) / (now - t0)); frames = 0; t0 = now;
    const dpr = renderer.getPixelRatio();
    const px = Math.round(canvas.clientWidth * dpr) + 'x' + Math.round(canvas.clientHeight * dpr);
    const stamp = (typeof __BUILD_STAMP__ !== 'undefined' ? __BUILD_STAMP__ : 'dev')
      + (jankCount ? ' j' + jankCount : '');
    hud.textContent =
      `${stamp} · ${fps} fps · ${px} @dpr${dpr} · ${(renderer.info.render.triangles / 1000) | 0}k tris · ` +
      `${renderer.info.render.calls} draws · ` +
      (mode === 'walk' ? 'on foot' : `${Math.abs(S.speed * 3.6) | 0} km/h${S.reversing ? ' R' : ''}`) +
      (stats.buildings ? ` · ${stats.buildings} buildings` : '');
    window.__probe = {
      fps, tris: renderer.info.render.triangles, calls: renderer.info.render.calls,
      px, dpr, kmh: +(S.speed * 3.6).toFixed(1), mode, ...stats,
    };
    if (ready) tierSample(fps);
    if (P.has('audiodebug')) hud.textContent += ' · ' + sound.debugLine();
  }
}
requestAnimationFrame(loop);

// let the vet harness drive without touching the screen
window.__drive = (throttle, steer, seconds) => {
  window.__force = { throttle, steer, brake: 0 };
  setTimeout(() => { window.__force = null; }, seconds * 1000);
};
// Put the ride at a point, facing a heading. The coverage sweep uses this to
// visit every street in the district without reloading the world 300 times.
// Where the ride is. The crowd's separation, dodge and draw culling are all
// gated on distance from THIS point, so a check about any of them has to know
// it -- D33 was measuring 2,200 walkers across three districts against a
// behaviour that runs within 120m by design.
window.__ridePos = () => [S.x, S.z];
window.__teleport = (x, z, heading) => {
  S = newState(x, z, heading == null ? S.heading : heading);
  S.speed = 0;
  if (crowdSys) crowdSys.update(clock, 0, S.x, S.z, signals);
  for (const c of extraCrowds) c.update(clock, 0, S.x, S.z, signals);
  // Traffic is NOT rebuilt here: Traffic.build() creates a fresh set of
  // instanced meshes and adds them to the world, so calling it once per stop
  // leaked a whole fleet each time. Sixty stops into a sweep the scene was
  // carrying sixty fleets, and the coverage run blamed the district for 1,618
  // draw calls that the harness had added itself.
  // The camera normally eases toward the ride. Left to ease across the whole
  // district it spends a second in transit above the rooftops, and anything
  // measured during that flight is the view from 800m away, not the view from
  // the street: distinct places all reported an identical 1,537 draw calls.
  camInit = false;
  driveCamera(1.0);
  return { x: S.x, z: S.z, heading: S.heading };
};
// Free camera at runtime, for the comparison sheet. Pass null to hand the
// camera back to the ride. fov is vertical; the default 46 is about a 26mm
// lens across a 16:9 frame, which is the range street photographs are shot in.
window.__teleportTo = (id) => {
  const d = (window.__districts || []).find((q) => q.id === id);
  if (!d) return false;
  if (mode !== 'ride') toggleMode();          // arrive in the saddle
  S.x = d.x; S.z = d.z; S.heading = d.heading; S.speed = 0;
  walker.x = d.x; walker.z = d.z;
  return true;
};
window.__cam = (x, y, z, tx, ty, tz, fov) => {
  SPEC = x == null ? null : [x, y, z, tx, ty, tz, fov || 46];
  camInit = false;
  return SPEC;
};
// Hide the interface so a frame can be compared against a photograph without a
// minimap and a control legend sitting on top of it.
window.__ui = (on) => {
  for (const id of ['hud', 'place', 'map', 'maphint', 'modebtn', 'stick', 'lookhint']) {
    const el = document.getElementById(id);
    if (el) el.style.visibility = on ? '' : 'hidden';
  }
};
window.__inp = () => ({ TOUCH, steer: input.steer, throttle: input.throttle, brake: input.brake, touches: touchDebug(), fired: window.__touchFired || 0 });
window.__snd = sound;
// Audit every carriageway, not just Orchard Road, and check two bands:
// obstruction (something standing on the road) and overhang (something
// projecting over it below lorry height). Vehicles and the planted median are
// expected hits, so they are excluded by position rather than pretended away.
window.__auditRoads = (step = 4) => {
  const ray = new THREE.Raycaster();
  const upv = new THREE.Vector3(0, 1, 0);
  const from = new THREE.Vector3();
  const out = { tested: 0, obstruct: [], overhang: [] };
  const roads = (window.__roadList || []);

  for (const r of roads) {
    const pts = r.p, half = r.w / 2;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
      const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
      if (len < 1) continue;
      const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
      for (let t = 0; t < len; t += step) {
        const px = x1 + ux * t, pz = z1 + uz * t;
        for (let off = -half + 1.4; off <= half - 1.4; off += 2.8) {
          // skip the planted median of the main axis, which belongs there
          const isAxis = /orchard road/i.test(r.n || '');
          if (isAxis && Math.abs(off) < 2.0) continue;
          out.tested++;
          const sx = px + nx * off, sz = pz + nz * off;

          // band 1: standing on the road, 0.4m to 2.0m
          from.set(sx, 0.4, sz);
          ray.set(from, upv); ray.near = 0; ray.far = 1.6;
          let hit = ray.intersectObjects(world.children, true);
          // a vehicle is a legitimate hit; identify by proximity to traffic
          const nearVeh = trafficNearest(sx, sz);
          if (hit.length && nearVeh > 4.5) {
            out.obstruct.push({ road: r.n || r.k, x: +sx.toFixed(1), z: +sz.toFixed(1),
              off: +off.toFixed(1), h: +(0.4 + hit[0].distance).toFixed(2) });
          }

          // band 2: overhanging the road below 4.6m, which a lorry would clip
          from.set(sx, 2.6, sz);
          ray.set(from, upv); ray.far = 2.0;
          hit = ray.intersectObjects(world.children, true);
          if (hit.length && nearVeh > 4.5) {
            out.overhang.push({ road: r.n || r.k, x: +sx.toFixed(1), z: +sz.toFixed(1),
              off: +off.toFixed(1), h: +(2.6 + hit[0].distance).toFixed(2) });
          }
        }
      }
    }
  }
  const tally = (list) => {
    const m = {};
    for (const h of list) m[h.road] = (m[h.road] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12);
  };
  return {
    tested: out.tested,
    obstruct: out.obstruct.length, obstructPct: +(100 * out.obstruct.length / out.tested).toFixed(2),
    overhang: out.overhang.length, overhangPct: +(100 * out.overhang.length / out.tested).toFixed(2),
    worstObstruct: tally(out.obstruct), worstOverhang: tally(out.overhang),
    sampleObstruct: out.obstruct.slice(0, 12), sampleOverhang: out.overhang.slice(0, 8),
  };
};

window.__crossers = () => (crowdSys ? crowdSys.people.filter((p) => p.crossing).length : 0);
window.__sig = () => (signals ? signals.list.map((g) => signals.stateAt(g, clock)) : []);
window.__traffic = () => (trafficSys ? trafficSys.items.map((i) => +i.speed.toFixed(2)) : []);
// EVERY traffic system, not just the global one. `extraTraffic` is module-local
// and holds one system per streamed district, so any probe that reads only
// __trafficSys sees the world's traffic as a single axis and reports zero
// vehicles near a rider who is standing next to four of them. That is exactly
// what a density probe did on 2026-07-31 before this existed.
window.__allTraffic = () => {
  const out = [];
  for (const t of [trafficSys, ...extraTraffic]) {
    for (const it of (t && t.items) || []) {
      out.push({ kind: it.kind, x: it.wx, z: it.wz, speed: it.speed });
    }
  }
  return out;
};
window.__camYaw = () => camYaw;
window.__mode = () => mode;
window.__toggle = () => toggleMode();
window.__walker = () => ({ x: +walker.x.toFixed(1), z: +walker.z.toFixed(1), sp: +walker.speed.toFixed(2) });
window.__state = () => ({ x: +S.x.toFixed(1), z: +S.z.toFixed(1), kmh: +(S.speed * 3.6).toFixed(1) });
window.__dbg = () => {
  const bb = new THREE.Box3().setFromObject(world);
  const c = CAM === 'top' ? topCam : camera;
  return {
    worldBox: {
      min: [bb.min.x | 0, bb.min.y | 0, bb.min.z | 0],
      max: [bb.max.x | 0, bb.max.y | 0, bb.max.z | 0],
    },
    children: world.children.length,
    camType: c.type,
    camPos: [c.position.x | 0, c.position.y | 0, c.position.z | 0],
    camDir: (() => { const v = new THREE.Vector3(); c.getWorldDirection(v);
      return [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]; })(),
    ortho: c.isOrthographicCamera ? [c.left | 0, c.right | 0, c.top | 0, c.bottom | 0, c.near, c.far] : null,
  };
};
window.__setState = (x, z, h) => { S.x = x; S.z = z; S.heading = h; camInit = false; };
