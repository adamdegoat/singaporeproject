import * as THREE from '../lib/three.module.js';
import { PAL, R, rand, pick, chance } from './tex.js';
import { MAT, buildBuildings, buildRoads, TreeField, aoPatch, setTerrain, groundAt, surfaceAt, buildSurround, buildWater, buildSupertrees } from './city.js';
import { Terrain } from './terrain.js';
import { dedupeMaterials, consolidate, trimShadowCasters, pruneCarriageway } from './consolidate.js';
import { buildRoadIndex, claim } from './roads.js';
import { Solid } from './solid.js';
import { buildVespa, buildRider, newState, step, RIDE } from './vespa.js';
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
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -95; sun.shadow.camera.right = 95;
sun.shadow.camera.top = 95; sun.shadow.camera.bottom = -95;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 460;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xa6c8e2, 0x94856f, 1.35));

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
function place(x, z) {
  return blocked(x, z) || (ROADIX ? ROADIX.onRoad(x, z, -0.4) : false);
}
// Footprints from the map, PLUS every wall actually drawn. The footprint list
// alone missed 11.5% of the solid geometry standing at rider height, because
// podiums, canopies, colonnades and the covered walkway are placed by recipe
// and never had a footprint. See solid.js.
let SOLID = null;
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

function dressStreet(data, axis) {
  if (!axis) return 0;
  const dataRef = data;
  const pts = axis.p, half = axis.w / 2;
  const trees = new TreeField();
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
            if (!place(tx, tz) && claim('tree', tx, tz, 3.0)) { trees.add(tx, tz, rand(0.85, 1.15)); break; }
          }
        }
        if (acc % 34 === 0 && kerbOK && claim('lamp', kx, kz, 6)) {
          lampT.push([kx, 4.5, kz, 0]);
          armT.push([kx - nx * 1.1 * sgn, 8.9, kz - nz * 1.1 * sgn, ang, sgn]);
          headT.push([kx - nx * 2.3 * sgn, 8.75, kz - nz * 2.3 * sgn, ang]);
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
    world.add(im);
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
      world.add(im);
    }
    kerbT.length = 0;
    for (const r of plain) kerbT.push(r);
  }
  // same 60cm dedupe as the side-street kerbs, see markings.js
  emit(new THREE.BoxGeometry(0.42, 0.3, 2.0), MAT.kerb, dedupeProps(kerbT, 0.6), (r) => {
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
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]);
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
    p3.set(r[0], groundAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
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
  return trees.build(world);
}

/* ---------------- boot ---------------- */
const vespa = buildVespa();
const rider = buildRider();
vespa.group.add(rider);
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
scene.add(bike);

let S = newState(0, 0, 0);
let ready = false, stats = {};
let crowdSys = null, trafficSys = null, wayfinder = null, signals = null;
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
for (const ev of ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click']) {
  document.addEventListener(ev, () => { sound.start(); sound.poke(); },
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
fetch(`./data/${SCENE}.json`).then((r) => r.json()).then(async (data) => {
  BOOTT.push(['module-init+fetch', Math.round(performance.now())]);
  _bt = performance.now();
  if (BOOTUI.sub && data.axes && data.axes.length) {
    BOOTUI.sub.textContent = data.axes.map((a) => a.n).filter(Boolean).join(' · ');
  }
  await bstep(0.05, `reading the survey — ${(data.buildings || []).length.toLocaleString()} footprints`);
  terrain = new Terrain(data.terrain || null);
  // The ground gives way to the road. See carve() for why this exists; it must
  // happen before build() OR atDrawn() is used, so it is done at construction.
  terrain.carve(data.roads || []);
  setTerrain(terrain);
  window.__terrain = terrain;
  indexBuildings(data);

  // The road index is built FIRST. Buildings carry structural pieces — entrance
  // canopies, colonnades, the tree columns under ION's shell — that are placed
  // by offsets from a facade and have to be tested against the carriageways as
  // they are created. Building it after buildBuildings meant every one of those
  // tests silently answered "not in a road", and 59 six-metre columns ended up
  // standing in the street, including the row you meet at the spawn point.
  ROADIX = buildRoadIndex(data, data.axis || null);
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
  if (!P.has('nowater')) setWater((data.water || []).map((w) => w.p));
  bmark('setup+water');

  await bstep(0.09, `raising ${(data.buildings || []).length.toLocaleString()} buildings`);
  const bs = P.has('nobuild') ? { count: 0, tall: 0 } : buildBuildings(world, data);
  bmark('buildings');
  // one sweep over what the building pass just added, before any street
  // furniture exists, so the scope is exactly "buildings and landmarks"
  const pruned = pruneCarriageway(world, ROADIX.onRoad, (x, z) => terrain.at(x, z));
  await bstep(0.23, `laying ${(data.roads || []).length.toLocaleString()} roads`);
  const fallbackAxis = buildRoads(world, data);
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
  const surround = P.has('nosurround') ? 0 : buildSurround(world, data);
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
    WALLS.build(world, (x, z) => terrain.at(x, z));
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
    trafficSys = new Traffic(axis, 78, 12, axis && axisSpec(axis, data));
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
  const dressed = new Set();
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
      const t = dressSideStreets(world, data, ax, place, TreeField, dressed);
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
  if (!P.has('nopeople') && axis) {
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
    crowdSys = new Crowd(axis, walkBlocked, 2200, sideStreets);
    crowdSys.build(world);
    // must come after construction, or the handover is a no-op
    if (window.__crossings) crowdSys.setCrossings(window.__crossings);
    window.__crowdPositions = () => crowdSys.positions();
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
  const shopf = P.has('noshops') ? {} : buildShopfronts(shopGroup, data, axes, solidBefore);
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
    const st = SOLID.build(world, (x, z) => terrain.at(x, z));
    stats.solidCells = st.cells; stats.solidWalls = st.walls;
    stats.solidMs = Math.round(solidMs0 + (performance.now() - t0));
    window.__solid = (x, z) => SOLID.at(x, z);
  }
  bmark('solid-grid');

  const RAW = P.has('raw');       // audit mode: leave objects unbatched
  await bstep(0.84, 'packing the city');
  const dedupe = RAW ? { before: 0, after: 0 } : dedupeMaterials(world);
  const cons = RAW ? { removed: 0, merged: 0 } : consolidate(world);
  bmark('dedupe+consolidate');
  stats.matsBefore = dedupe.before; stats.matsAfter = dedupe.after;
  const shad = RAW ? { kept: 0, dropped: 0 } : trimShadowCasters(world);
  stats.batched = cons.removed; stats.batches = cons.merged;
  stats.casters = shad.kept; stats.castersDropped = shad.dropped;
  stats.prunedFromRoads = pruned;

  window.__scene = scene; window.__camera = camera; window.__THREE = THREE;
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
    glFinish();
  } else buildEnvironment();

  await bstep(1, 'ready');
  bootDone();
  ready = true;
  if (P.has('boot')) console.log('BOOT ' + JSON.stringify(BOOTT));
  window.__ready = true;
  window.__stats = stats;
}).catch((e) => {
  window.__bootError = (e && e.stack) || String(e);
  hud.textContent = 'boot failed: ' + e.message;
  // The overlay STAYS on a failed boot and says so — fading it out over a
  // dead black canvas would be the exact "looks crashed with no words" state
  // this screen exists to prevent.
  if (BOOTUI.lab) BOOTUI.lab.textContent = 'boot failed: ' + e.message;
  console.error('BOOT', e);
});

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
    const d = Math.hypot(walker.x - S.x, walker.z - S.z);
    if (d > 6) return;                       // must walk back to the scooter
    walkerRig.group.visible = false;
    rider.visible = true;
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
  const el = document.getElementById('help');
  if (!el) return;
  el.innerHTML = mode === 'ride'
    ? '<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br>'
      + '<b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br>'
      + '<span style="opacity:.65">keys: A/D · W · S · E to get off</span>'
    : '<b>drag left side</b> walk<br><b>drag right side</b> look around<br>'
      + '<span style="opacity:.65">keys: WASD · shift to run · E to ride</span>';
  const btn = document.getElementById('modebtn');
  if (btn) btn.textContent = mode === 'ride' ? 'Get off' : 'Ride';
}

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
    .addScaledVector(fwd, -5.8).add(new THREE.Vector3(0, 3.05, 0));
  want.y = Math.max(want.y, terrain.at(want.x, want.z) + 1.6);
  const aim = new THREE.Vector3(S.x, gy + 1.35, S.z).addScaledVector(fwd, 7.5);
  aim.y = terrain.at(aim.x, aim.z) + 1.35;
  if (!camInit) { camPos.copy(want); camAim.copy(aim); camInit = true; }
  camPos.lerp(want, Math.min(1, dt * 4.2));
  camAim.lerp(aim, Math.min(1, dt * 6.0));
  camera.position.copy(camPos);
  camera.lookAt(camAim);
  camera.fov = 58 + (S.speed / RIDE.vMax) * 12;
  camera.updateProjectionMatrix();
}

/* ---------------- resize ---------------- */
const DPR_FORCE = parseFloat(P.get('dpr') || '0');
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setPixelRatio(DPR_FORCE || Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const a = w / h;
  const halfZ = 440;
  topCam.left = -halfZ * a; topCam.right = halfZ * a;
  topCam.top = halfZ; topCam.bottom = -halfZ;
  topCam.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

/* ---------------- loop ---------------- */
let last = performance.now(), frames = 0, t0 = last, fps = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;

  // Stop rendering entirely when the page is not visible. A 60fps WebGL loop is
  // a real power draw — it pegged two CPU cores on this laptop — and on a phone
  // it is battery and heat for nothing.
  if (document.hidden) { requestAnimationFrame(loop); return; }

  // Nothing renders until the world is ready. This mattered the moment boot
  // gained an await (the GPU warm-up below): rAF frames interleave with the
  // tail of boot, and an un-gated loop would render the half-warm scene —
  // stalling on the very shader compiles the warm-up exists to overlap — and
  // reportHud would overwrite the loading text with "0 fps".
  if (!ready) { requestAnimationFrame(loop); return; }

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
      if (trafficSys && trafficSys.hits(walker.x, walker.z, 0.32)) {
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
      if (trafficSys) trafficSys.update(clock, dt, signals, walker.x, walker.z);
      if (crowdSys) crowdSys.update(clock, dt, walker.x, walker.z, signals);
      if (wayfinder) wayfinder.update(walker, dt);
      sound.update(0, 'walk', walker.speed, walker.phase, trafficSys ? trafficSys.nearest(walker.x, walker.z) : 999);
      if (SPEC) driveCamera(dt); else walkCamera(dt);
      renderer.render(scene, camera);
      frames++;
      if (now - t0 > 1000) reportHud(now);
      requestAnimationFrame(loop);
      return;
    }

    const px = S.x, pz = S.z;
    step(S, dt, inp.throttle, inp.brake, inp.steer);
    // you cannot ride through a bus
    if (trafficSys && trafficSys.hits(S.x, S.z, 0.55)) {
      S.x = px; S.z = pz;
      S.speed *= -0.12;                 // a small bounce, then stopped
      if (Math.abs(S.speed) < 0.4) S.speed = 0;
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
    vespa.group.rotation.z = S.lean;
    vespa.wheels[0].rotation.x = -S.wheel;
    vespa.wheels[1].rotation.x = -S.wheel;

    // keep the shadow frustum on the rider, not the whole town
    sun.position.set(S.x + SUNDIR.x * 150, gy + SUNDIR.y * 150, S.z + SUNDIR.z * 150);
    sun.target.position.set(S.x, gy, S.z);
    sun.target.updateMatrixWorld();

    clock += dt;
    fmk('pre');
    if (signals) signals.update(clock);
    fmk('signals');
    if (trafficSys) trafficSys.update(clock, dt, signals, S.x, S.z);
    fmk('traffic');
    if (crowdSys) crowdSys.update(clock, dt, S.x, S.z, signals);
    fmk('crowd');
    if (wayfinder) wayfinder.update(S, dt);
    fmk('wayfind');
    sound.update(S.speed, 'ride', 0, 0, trafficSys ? trafficSys.nearest(S.x, S.z) : 999);
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
    hud.textContent =
      `${fps} fps · ${px} @dpr${dpr} · ${(renderer.info.render.triangles / 1000) | 0}k tris · ` +
      `${renderer.info.render.calls} draws · ` +
      (mode === 'walk' ? 'on foot' : `${Math.abs(S.speed * 3.6) | 0} km/h${S.reversing ? ' R' : ''}`) +
      (stats.buildings ? ` · ${stats.buildings} buildings` : '');
    window.__probe = {
      fps, tris: renderer.info.render.triangles, calls: renderer.info.render.calls,
      px, dpr, kmh: +(S.speed * 3.6).toFixed(1), mode, ...stats,
    };
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
          const nearVeh = trafficSys ? trafficSys.nearest(sx, sz) : 999;
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
