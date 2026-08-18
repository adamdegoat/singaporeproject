import * as THREE from '../lib/three.module.js';
import { PAL, R, reseedPlacement, rand, pick, chance, resetSignAtlas, hashRand } from './tex.js';
import { MAT, badGeoCount, buildBuildings, buildRoads, TreeField, aoPatch, setTerrain, groundAt, surfaceAt, footbridgeIdOf, bridgeDeckAt, anyDeckAt, bridgeDecksAt, buildSurround, buildWater, buildSupertrees, buildTowers, buildCranes, buildPiers, plantSurveyed, openGroundAt, openGroundPolys } from './city.js';
import { Terrain } from './terrain.js';
import { dedupeMaterials, lambertise, consolidate, trimShadowCasters, pruneCarriageway } from './consolidate.js';
import { buildRoadIndex, claim } from './roads.js';
import { Solid } from './solid.js';
import { buildVespa, buildRider, buildCar, buildSkate, buildSkater, SKATE_WHEEL_X as SK_WHEEL_X, newState, step, RIDE, CAR, SKATE, SURFACES, SURF_ROAD } from './vespa.js';
import { SkidMarks } from './skid.js';
import { TOUCH, input, attachTouch, attachMouse, readInput, touchDebug } from './input.js';
import { Net } from './net.js';
import { newWalker, stepWalk, buildWalker, WALK } from './player.js';
import { axisSpec, buildMarkings, dressSideStreets, selectSideStreets, dedupeProps } from './markings.js';
import { buildSgDetail, buildTransit, buildBeachLife, buildUssVocab } from './sgdetail.js';
import { buildRides, BOARD_REACH, EYE } from './rides.js';
import { buildPlaceLabels } from './places.js';
import { buildShopfronts } from './shopfront.js';
import { Signals } from './signals.js';
import { Sound } from './audio.js';
import { Crowd, Traffic } from './actors.js';
import { buildFurniture, buildParkedCars } from './street.js';
import { buildSignage, Wayfinder } from './wayfind.js';

const P = new URLSearchParams(location.search);
const hud = document.getElementById('hud');
const canvas = document.getElementById('c');

/* ---------------- renderer ---------------- */
// ?noaa and ?lowpower are A/B handles for the rider's phone, added 2026-08-03:
// these two flags are the only phone-relevant GPU costs in the file with NO
// measurement behind them. MSAA costs bandwidth on exactly the tile-based
// GPUs this project keeps identifying as fill-rate bound, and
// 'high-performance' asks the driver for the high-clock path on a device
// whose reported symptom is heat. Constructor-time, so they can only be
// A/B'd across page loads — hence flags, not runtime toggles.
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !P.has('noaa'),
  powerPreference: P.has('lowpower') ? 'default' : 'high-performance',
});
window.__renderer = renderer;   // probes read info.programs / info.memory
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
// SHADOWS OFF FOR EVERYONE — the owner's call, 2026-08-03, made looking at
// a same-spot A/B pair: "make all smooth for gameplay". Measured: shadows
// cost ~20% of the frame (2504k->1995k tris, 645->488 draws at the spawn;
// 13->16fps on the throttled phone path) and the visual difference is soft
// shading only — nothing disappears. ?shadow restores them; ?noshadow kept
// for old links.
renderer.shadowMap.enabled = P.has('shadow');
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
// Exposed HERE, not only at the probe block ~2,500 lines down: the shopfront
// builder raycasts the scene DURING the build (untenanted bays facing recipe
// masonry), and the late assignment left __scene undefined for the whole
// boot build — the ray pass silently never ran.
window.__scene = scene;
// Set while an arrival panel is up; see window.__arriveWait far below.
let ARRIVING = false;
// Density is set from the far plane, not by eye: FogExp2 leaves
// exp(-(density*d)^2) of an object showing at distance d, and at 520m a density
// of 0.0021 still showed 30% of it, so buildings popped out of nothing at a hard
// line. 0.0038 leaves about 2%. THE RULE IS density * far ~= 1.92 — change one
// and the other MUST follow, or the cull range grows a visible wall.
//
// TWO ATMOSPHERES (2026-08-03, the owner: "i really dont see it looking like
// sentosa"). Every colour above was tuned for the CBD: a sandy urban haze
// (0xc9c3b2) against a sandy sky horizon (PAL.skyHaze). On the island that is
// most of what is wrong with the picture — probed from the air over the Cove,
// the sea, the jungle and the sky all converge on the SAME beige by 200m, so
// there is no distance, no colour and no horizon. An island in the Singapore
// Strait hazes BLUE-WHITE off the water, and it is seen across open sea, so it
// also needs to see further than a street canyon does.
//
// The fog colour and the sky's horizon colour must MATCH — that match is what
// makes the far plane invisible instead of a wall.
// sentosa only for now, and deliberately: the longer far plane is measured on
// sentosa (333 draws against 246, +2.5% triangles, no fps change) and the
// marine haze only reads right where there is a drawn sea to haze into. Each
// coastal district joins this list when its terrain is rebuilt and gated.
const ISLAND_SCENES = /^(sentosa)$/;
const ATMO = P.get('atmo')
  || (ISLAND_SCENES.test((P.get('scene') || 'sentosa').replace(/[^a-z0-9_-]/gi, '')) ? 'island' : 'city');
const SEASIDE = ATMO === 'island';
// far plane: the island earns a longer view because the expensive direction
// (inland) is still district-culled and LOD-capped, while the direction that
// opens up is open water — two triangles. Overridable for A/B measurement.
// 900 -> 1600 ON THE ISLAND (2026-08-03), MEASURED, NOT GUESSED.
//
// At 900 the fog density that the density*far~=1.92 rule forces is 0.0021, which
// leaves ~19% of anything at 600m showing — so from any high ground the sea, the
// shore, the jungle and the sky converged on one pale grey and Sentosa read as a
// smear. That is most of "i really dont see it looking like sentosa": you could
// not see the island at all.
//
// The reason it was 900 was an assumption that further costs frames. A/B'd at
// 844x390 dpr2 with 4x CPU throttle, real GPU, sampling four places across the
// island via __teleport (beach, cove, resort, inland):
//
//     far=900    frame p50 16.9ms   worst p95 34.4ms   draws 236   tris 928k
//     far=1600   frame p50 15.4ms   worst p95 36.9ms   draws 293   tris 945k
//
// It is not slower. Draws rise 24% and stay far under the 900 budget, triangles
// rise 2%, and the p50 difference is inside the noise — because the direction
// that opens up is open water, which is two triangles, and everything inland is
// still district-culled and LOD-capped at LOD_FAR.
//
// THE FIRST RUN OF THAT A/B WAS WRONG and nearly shipped: it set
// camera.position directly, which the game's own loop overwrites on the next
// frame, so all four "different" viewpoints reported an identical 363 draw
// calls. window.__teleport is the only thing that moves the view. If a probe
// reports the same number at four different places, the probe is broken.
const FAR = +P.get('far') || (SEASIDE ? 1600 : 520);
scene.fog = new THREE.FogExp2(SEASIDE ? 0xb7cdd9 : 0xc9c3b2, 1.92 / FAR);
const camera = new THREE.PerspectiveCamera(58, 1, 0.3, FAR);

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
      top: { value: new THREE.Color(SEASIDE ? 0x2f6ba8 : PAL.skyTop) },
      mid: { value: new THREE.Color(SEASIDE ? 0x8ab6d6 : PAL.skyMid) },
      // the horizon band IS the fog colour — see the atmosphere note above
      haze: { value: new THREE.Color(SEASIDE ? 0xb7cdd9 : PAL.skyHaze) },
      cloud: { value: new THREE.Color(PAL.cloud) },
      sun: { value: SUNDIR.clone() },
    },
    vertexShader: `varying vec3 vW;
      void main(){ vW = normalize(position);
        vec4 gp = projectionMatrix*modelViewMatrix*vec4(position,1.0);
        // pin the dome to the far plane so it can draw LAST (renderOrder
        // below) and depth-test away every pixel the city already covers —
        // it used to draw FIRST and be fully overdrawn, paying its cloud
        // shader on 100% of the screen. Far-plane depth keeps the surround
        // massing beyond the dome's 480m radius in front of the sky.
        gp.z = gp.w * 0.999999;
        gl_Position = gp; }`,
    fragmentShader: `
      uniform vec3 top, mid, haze, cloud; uniform vec3 sun; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
      float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      // 3 octaves, not 5: the last two octaves are sub-pixel at phone DPR
      // and this runs per sky pixel per frame (was 10 vnoise taps, now 6)
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<3;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
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
// LAST among opaques (transparent glass still draws after and blends over
// the sky correctly) — see the far-plane note in the vertex shader
sky.renderOrder = 1;
scene.add(sky);

const sun = new THREE.DirectionalLight(0xfff0d6, 2.6);
sun.castShadow = true;
// phones carry half the shadow texels: at 1.5x render density the extra
// resolution is invisible and the pass is the documented frame-cost hog
sun.shadow.mapSize.set(TOUCH ? 1024 : 2048, TOUCH ? 1024 : 2048);
// DO NOT SHRINK THE SHADOW BOX TO BUY FRAMES. It was tried on 2026-08-01 and
// measured, and it buys nothing.
//
// The reasoning that led there was: shadows cost 3 fps on the phone path
// (13 -> 16 at 844x390 under 4x CPU throttle, 2,043k tris -> 1,620k), every
// caster in this box is drawn a second time into the depth map, and the box
// follows the rider — so halving its area should halve the pass. It does not.
// A/B with TOUCH forced, 95 against 70:
//
//     shadowbox=95   20 fps   1,903k tris   723 draws
//     shadowbox=70   19 fps   1,899k tris   714 draws
//
// Four thousand triangles and nine draws. The cost of shadows here is almost
// all the PER-PIXEL LOOKUP in the main pass, which is a function of screen
// pixels and does not care how big the box is. Caster geometry was never the
// expensive part — castersDropped already sheds 405 of them.
//
// So the remaining shadow levers are map resolution and switching them off, not
// coverage. 95m stays: it is free.
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
// ...and the canopies, kept SEPARATELY. They are rightly absent from colGrid
// (see the note below — indexing them walled off every covered walkway), but a
// canopy is still a roof, and nothing should GROW through a roof. Planting is
// the one pass that needs to know where they are.
const roofGrid = new Map();
function indexBuildings(data) {
  for (const b of data.buildings) {
    // A building=roof CANOPY is a roof on columns — walkable UNDER by
    // definition. Its footprint in the collision grid walled off every
    // covered walkway at RWS (81 blocked centreline samples on one Imbiah
    // footway alone, the owner's "ride halfway stuck"). The columns the
    // renderer draws still block via SOLID, which is the honest footprint.
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const [x, z] of b.p) {
      mnx = Math.min(mnx, x); mxx = Math.max(mxx, x);
      mnz = Math.min(mnz, z); mxz = Math.max(mxz, z);
    }
    const into = b.roof ? roofGrid : colGrid;
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!into.has(k)) into.set(k, []);
        into.get(k).push(b.p);
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
// FOOTPRINT ALONE — no drawn geometry, no water. blocked() tests the drawn
// grid first, so it can never answer "is there a MAPPED building here", and a
// probe that asked it reported every blocked cell as a building when five of
// them were walls with nothing in the map behind them at all.
function inFootprint(x, z) {
  const list = colGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
  if (!list) return false;
  for (const poly of list) if (inPoly(poly, x, z)) return true;
  return false;
}
// EXPOSED HERE, NOT AT THE END OF THE BUILD. TreeField.add in city.js refuses
// to plant inside a footprint by calling window.__inFootprint, and every tree
// on the island is added while the district is being built — long before the
// probe block near the end of this file runs. Assigned at definition, the
// guard is live for the whole build; assigned there, it was a no-op and the
// fifteen trunks D6 and D37 report stayed exactly where they were.
window.__inFootprint = (x, z) => inFootprint(x, z);
// A CANOPY IS A ROOF, AND NOTHING GROWS THROUGH A ROOF. Fifteen trunks stood
// inside `building=roof` shelters at Sentosa Cove — reported by D6 and D37
// since the island was built, and invisible to every existing guard because
// those footprints are deliberately kept out of the collision index.
window.__underCanopy = (x, z) => {
  const list = roofGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
  if (!list) return false;
  for (const poly of list) if (inPoly(poly, x, z)) return true;
  return false;
};

// Street dressing must dodge two things: buildings AND carriageways. The old
// test only knew about buildings, so a tree could sit in the middle of a back
// road and nothing objected. The bike and the walker keep using the raw
// building test below, because they are supposed to be on the road.
let ROADIX = null;
let PATHIX = null;      // footways/pedestrian/steps, for the surface model
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
// inner rings, one list per WATERPOLY entry — see setWater
let WATERHOLES = [];
const wCell = 40, wGrid = new Map();
function setWater(polys, holes) {
  WATERPOLY = polys || [];
  // AN ISLAND INSIDE A LAGOON IS NOT THE LAGOON.
  //
  // `inWater` is what stops a walker and what the dressing asks before placing
  // anything, and it knew only about outer rings. When three holed water
  // relations were recovered (data/relparcels.py), Sentosa Cove's Sandy Island
  // and Pearl Island — which ARE inner rings of the waterway — came back as
  // open water: 411 m and 435 m of their own footways blocked, and the
  // trailcheck gate refused it.
  //
  // Teaching terrain.waterFloor about holes was not enough and the reason is
  // worth keeping: TWO SEPARATE FUNCTIONS OWN "is this water", fed from the
  // same array by two different setters, and fixing one leaves the other
  // confidently wrong. The data said `inHole: true` at both islands while the
  // walker still drowned.
  WATERHOLES = holes || [];
  wGrid.clear();
  // Exposed HERE, not with the other globals at the end of boot: the street
  // dressing runs before that point and asks about water, so assigning it late
  // made every `dry()` guard in markings.js a silent no-op and 2,064 lane lines
  // stayed painted on the reservoir. A guard that is installed after the thing
  // it guards is not a guard.
  window.__inWater = (x, z) => inWater(x, z);
  for (let ri = 0; ri < WATERPOLY.length; ri++) {
    const ring = WATERPOLY[ri];
    ring.__holes = WATERHOLES[ri] || null;
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
  for (const ring of list) {
    if (!inPoly(ring, x, z)) continue;
    if (ring.__holes) {
      let inHole = false;
      for (const h of ring.__holes) if (inPoly(h, x, z)) { inHole = true; break; }
      if (inHole) continue;                      // an island, not the water
    }
    return true;
  }
  return false;
}
// THE ARCADE CORRIDORS, INDEXED ONCE.
//
// A mapped walking route that runs through a building (Festive Walk, WEAVE,
// the resort podiums) is open to a WALKER and still solid to the DRESSING —
// which is the split this file's own comments below were written to defend.
// blocked() answers "may a thing be placed here" as well as "can I move here",
// and the 2026-08-01 revert is what happens when the two are conflated: 125
// meshes ended up in open water. So the arcades are applied to MOVEMENT ONLY,
// through moveBlocked(), and blocked() is left exactly as it was.
let ARCADES = null;
function buildArcadeIndex(list) {
  if (!list || !list.length) return null;
  const CELLA = 8;
  const g = new Map();
  for (const a of list) {
    const pts = a.p || [];
    const half = (a.w || 3.6) / 2;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
      const L = Math.hypot(x2 - x1, z2 - z1);
      const n = Math.max(1, Math.ceil(L / (CELLA * 0.5)));
      for (let s = 0; s <= n; s++) {
        const t = s / n;
        const cx = x1 + (x2 - x1) * t, cz = z1 + (z2 - z1) * t;
        const k = Math.floor(cx / CELLA) + ',' + Math.floor(cz / CELLA);
        let l = g.get(k);
        if (!l) { l = []; g.set(k, l); }
        l.push([cx, cz, half]);
      }
    }
  }
  return {
    at(x, z) {
      const cx = Math.floor(x / CELLA), cz = Math.floor(z / CELLA);
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        for (let iz = cz - 1; iz <= cz + 1; iz++) {
          const l = g.get(ix + ',' + iz);
          if (!l) continue;
          for (const [px, pz, half] of l) {
            const dx = px - x, dz = pz - z;
            if (dx * dx + dz * dz <= half * half) return true;
          }
        }
      }
      return false;
    },
  };
}
// What stops you MOVING. Everything blocked() says, minus the arcades and
// minus open ground storeys (Beach Arrival Plaza: buses drive under the
// depot; only the columns — real SOLID geometry — stop you there).
function moveBlocked(x, z) {
  if (ARCADES && ARCADES.at(x, z)) return false;
  if (openGroundAt(x, z)) return SOLID ? SOLID.at(x, z) : false;
  // THE BEACH REACHES THE WATER, AND UNTIL NOW YOU COULD NOT.
  //
  // What stops a walker is `inWater` — the surveyed water POLYGON — and that
  // reaches inland of the drawn water's edge, so a player was halted on
  // visible dry sand about six metres short of the sea. Measured over the
  // Siloso stretch: 12,192 m2 of shore you can see and cannot stand on.
  //
  // THE RULE IS "IS THIS DRAWN AS LAND", NOT "IS THIS ON THE SHELF", and the
  // first version got that wrong in a way worth keeping. Gating on the shelf
  // alone produced BLOCK, BLOCK, walk, BLOCK along one transect — a
  // disconnected island of walkable sand — because the band either side of it
  // is drawn as land by a DIFFERENT rule (`y > 1.2 && onIsland`, the guard for
  // a water polygon that over-reaches inland). That guard's territory has been
  // visible-and-unreachable since it was written; the shelf just made it
  // obvious by putting a walkable strip in the middle of it.
  //
  // So ask the mesh. Above the drawn sea plane and on the island means the
  // ground under your feet is sand you can see, whichever rule drew it.
  // SOLID is still asked, so a wall on the beach is still a wall.
  //
  // Deliberately NOT done in `blocked()`. That predicate also gates where the
  // dressing may place things, and its own note records the last attempt:
  // unblocking there took W2 from 32 to 706 things built in open water.
  // `moveBlocked` is the walker's test and the right seam — it is what this
  // function was split out for.
  // AGAINST THAT BODY'S OWN SURFACE, NOT AGAINST SEA LEVEL. A fixed -0.30
  // threshold reads correctly on the coast and catastrophically inland: a
  // swimming pool up at twenty metres has a BED at eighteen, which clears any
  // sea-level test, so every pool and lagoon on the island would have become
  // walkable. setWaterRings puts each ring's floor 1.4 m under its own drawn
  // surface, so that surface is the thing to compare with — and then the rule
  // states itself: you may stand where the ground pokes out of the water.
  // ...AND AT SEA LEVEL ONLY (`bed < 0.2`), which the surface test alone does
  // NOT give you. Measured: comparing against each body's own surface, 344 of
  // 362 sampled points inside the island's inland water came out walkable —
  // every pool and lagoon. The cause is the `y > 1.2 && onIsland` guard in
  // vertexY: inside an inland body the heightfield says 20 m, so the guard
  // returns the LAND height and the drawn ground genuinely is above that
  // pool's surface. That is a separate, older defect about how inland water is
  // drawn; it is not this rule's business to act on it, and unblocking on the
  // strength of it would put players walking across Adventure Cove. So this
  // stays where it was measured: the coast.
  if (terrain && terrain.onIsland && terrain.onIsland(x, z)) {
    const bed = terrain.waterFloor(x, z);
    if (bed !== null && bed < 0.2
        && terrain.vertexY(x, z) > bed + WATER_DEPTH - 0.05) {
      return SOLID ? SOLID.at(x, z) : false;
    }
  }
  // A DECK CLEARS THE WATER-WALL FOR THE WALKER, exactly as rideBlocked
  // already holds for the ride — and ONLY the water-wall: on land the deck
  // changes nothing and blocked() keeps every footprint test, so a walker
  // under a viaduct still cannot stroll through a building. Needed the day
  // the Cove canal was drawn as real water (2026-08-15): the Pearl and
  // Sandy access footbridges cross it with decks registered, and the
  // walker was walled at the waterline on all four of them (trailcheck
  // blocked-over-20m 0 -> 4, all four at those crossings). The dressing's
  // blocked() is untouched — the 2026-08-01 revert stands.
  if (inWater(x, z) && anyDeckAt(x, z) !== null) {
    return SOLID ? SOLID.at(x, z) : false;
  }
  return blocked(x, z);
}
// setWaterRings seats every bed this far below its own water surface
const WATER_DEPTH = 1.4;

function blocked(x, z) {
  if (SOLID && SOLID.at(x, z)) return true;
  // WATER IS A WALL — and teaching this otherwise needs the DRESSING fixed in
  // the same batch, which is why the attempt on 2026-08-01 was reverted.
  //
  // The defect is real and stands: D9 reports 167 points on Bayfront Avenue's
  // own centreline as blocked, about 500m of Marina Bay's main street that a
  // rider cannot cross, because the bay has a bridge over it and this test does
  // not know about decks (standable() in city.js does). Changing it to
  // `inWater(x, z) && bridgeDeckAt(x, z) === null` DOES fix that — D9 went 167
  // to 0 — but the same predicate gates where the dressing may place things,
  // and W2 immediately went from 32 to 706 things built in open water. Making
  // W2 deck-aware only recovered 7 of them, which is the measurement that
  // matters: the other 670 are in the BAY, not on the deck, so the dressing's
  // own reach is what has to be bounded first.
  //
  // Next attempt: bound the dressing to the deck's actual footprint before
  // unblocking, and re-measure W2 and D9 together. Do not unblock alone.
  if (inWater(x, z)) return true;
  const list = colGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
  if (!list) return false;
  for (const poly of list) if (inPoly(poly, x, z)) return true;
  return false;
}

// WHAT YOU CAN RIDE OVER, which is not the same question as WHERE A THING MAY
// BE PLACED — and conflating the two is what made the first attempt at this
// worse than the defect.
//
// Bayfront Avenue crosses the bay twice, and blocked() calls all water a wall,
// so 167 points on Marina Bay's own centreline — about 500m of its main street
// — were solid to a rider standing on a bridge. standable() in city.js was
// taught about decks when median kerbs were found in the bay; the collision
// test never was.
//
// Teaching blocked() itself was tried on 2026-08-01 and reverted: the DRESSING
// uses the same predicate, and once the bay stopped being a wall it walked the
// axis across the bridge and offset furniture sideways off the deck. Measured:
// 125 meshes ended up in open water and **74 of them were more than 60m from
// any deck** — the placement paths test the centreline, not the point they
// actually place at. Fixing that is a change to six placement loops and is owed
// its own batch (see NEXT.md).
//
// So the split is by QUESTION, not by caller: placement keeps the conservative
// rule, and the ride gets the honest one. A rider on a deck is on a road.
// WHERE A PERSON CAN SWIM (2026-08-14, the owner's call: "when the avatar
// goes into water then can realistically start swimming... so ppl can swim
// off to the islets"). The SEA only, and only where the water is actually
// DRAWN: the drawn surface is what the player sees, and swimming on the
// mapped-but-uncarved water at Sentosa Cove would mean breaststroke across
// visible grass. So the test is the terrain datum (vertexY under the sea
// plane by a body's depth), `waterFloor === null` keeps every inland pool
// and lagoon walled exactly as before (Adventure Cove is a paid attraction,
// not a shortcut), SOLID still stops you, and the terrain grid's own extent
// is the soft boundary — beyond the built world there is nothing to draw,
// so there is nowhere to swim to.
// Depth below the drawn sea surface at a point, or null where the sea is not
// enterable at all (solid geometry, an inland water body, or outside the
// drawn world's own margin).
function seaDepthAt(x, z) {
  if (SOLID && SOLID.at(x, z)) return null;
  if (!terrain || !terrain.grid) return null;
  const g = terrain.grid();
  if (!g) return null;
  const M = 60;   // the soft boundary: beyond the built world there is
                  // nothing drawn, so there is nowhere to swim to
  if (x < g.x0 + M || x > g.x0 + (g.nx - 1) * g.cell - M
      || z < g.z0 + M || z > g.z0 + (g.nz - 1) * g.cell - M) return null;
  // The STRAIT is a mapped water polygon too, so "has a waterFloor" cannot
  // mean "inland pool" — the first probe run returned null over the whole
  // open sea. The discriminator is the one moveBlocked's coast rule already
  // uses: a floor at SEA level is the sea; a floor well above it is a pool
  // or lagoon someone built, and stays walled.
  const bed = terrain.waterFloor(x, z);
  if (bed !== null && bed >= 0.2) return null;
  const sy = (window.__seaY ?? 0.1);
  const d = sy - terrain.vertexY(x, z);
  return d > 0 ? d : null;
}
// Ankle-to-waist water you WADE through; past a body's depth you swim.
function seaEnterableAt(x, z) { return seaDepthAt(x, z) !== null; }
function swimmableAt(x, z) { return (seaDepthAt(x, z) || 0) > 0.75; }

function rideBlocked(x, z) {
  // ANY deck clears the water-wall for MOVEMENT — road bridges AND
  // footbridges. The Sentosa Boardwalk and the pond-crossing paths at RWS
  // are bridge-tagged FOOTWAYS: their decks live in the FOOTBRIDGES
  // registry, this test read only BRIDGES, and so 2,326 centreline samples
  // across 170 spots answered "wall" over honestly-bridged water — the
  // owner's "ride halfway then stuck". Only this MOVEMENT gate changes:
  // the dressing/W2 predicate (blocked/place) keeps its water-is-a-wall
  // rule, which is the 2026-08-01 revert lesson. Seating stays
  // carriageway-deck-only; a follow-up gives wide pedestrian causeways a
  // standable deck.
  if (ARCADES && ARCADES.at(x, z)) return false;
  // an open ground storey passes; only its columns (SOLID) stop you
  if (openGroundAt(x, z)) return SOLID ? SOLID.at(x, z) : false;
  if (inWater(x, z) && anyDeckAt(x, z) !== null) {
    // over a deck: only real geometry stops you
    if (SOLID && SOLID.at(x, z)) return true;
    const l2 = colGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!l2) return false;
    for (const poly of l2) if (inPoly(poly, x, z)) return true;
    return false;
  }
  return blocked(x, z);
}

// A WALL WE DREW, ACROSS A PATH THE MAP SAYS IS A PATH.
//
// data/arcade.py opens walking routes that run through buildings, and it works
// from BUILDING POLYGONS. That makes it structurally blind to the case that
// actually remained: solid.js rasterises collision from the geometry that is
// DRAWN, and its own opening measurement found 11.5% of the walls standing at
// rider height have no footprint behind them — podiums, entrance canopies,
// colonnades, plaza edges, shopfront lines, all placed by recipes. Probed cell
// by cell with `?solidtrace=1`, five of the last blocked runs on the island
// were exactly that: SOLID true, footprint FALSE, so no polygon existed for
// arcade.py to carve a corridor through and none ever would.
//
// The rule, and it is narrow on purpose:
//   - the route must be a MAPPED footway or pedestrian way (OSM says you walk
//     here, so a wall across it is our defect, not the map's)
//   - the cell must have NO building footprint (a mapped building is a real
//     wall and stays one — that case belongs to arcade.py, which can see it)
//   - the run must be SHORT (<= MAXRUN). A long one is not a stray canopy
//     edge, it is a building we have modelled and not mapped, and silently
//     tunnelling through it would hide a real problem behind a green gate.
//
// Anything longer is left blocked and REPORTED, so it still fails a check
// rather than disappearing.
const SELFCARVE_MAX = 12.0;   // metres of run we are willing to call our own defect
function unmappedWallRuns(data) {
  const arcs = [];
  let kept = 0, tooLong = 0;
  for (const r of (data.roads || [])) {
    const k = r.k || '';
    if (k !== 'footway' && k !== 'pedestrian') continue;
    const p = r.p || [];
    if (p.length < 2) continue;
    let run = null;
    const close = () => {
      if (!run) return;
      const m = (run.length - 1) * 0.75;
      // EVERY run, including a single cell. The first version skipped one-cell
      // runs on the reasoning that a walker steps around a corner clip — but
      // these are not corners. Probed at 0.75m, the wall left on the Imbiah
      // footway was a line of ISOLATED single cells about 1.5m apart, so a
      // stride-length check saw four blocked samples in a row and called it a
      // 5m wall while a cell-length check saw nothing over 0.75m and called it
      // clear. Both were right. A single cell of geometry we drew, standing on
      // a path the map says is a path, is a defect at any length.
      if (m <= SELFCARVE_MAX) {
        // carve() needs two points to sweep between; give a lone cell a
        // degenerate segment so it still clears its disc
        arcs.push({ p: run.length >= 2 ? run : [run[0], [run[0][0] + 0.01, run[0][1]]], w: 3.2 });
        kept++;
      } else tooLong++;
      run = null;
    };
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.ceil(L / 0.75));
      for (let s = 0; s <= n; s++) {
        const t = s / n;
        const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        // SOLID only, and only where the map has no building. inWater is left
        // alone deliberately: a path over water needs a DECK to stand on, and
        // deleting the water-wall without building one drops the walker in.
        if (SOLID && SOLID.at(x, z) && !inFootprint(x, z) && !inWater(x, z)) {
          if (!run) run = [];
          run.push([x, z]);
        } else close();
      }
    }
    close();
  }
  return { arcs, kept, tooLong };
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

async function dressStreet(data, axis, target = world, Y = null) {
  // was one synchronous gulp (the 'dress' step's ~224ms block, 2026-08-03);
  // yields pause the walk without reordering a single RNG draw
  let _dt0 = performance.now();
  const DY = async () => { if (Y && performance.now() - _dt0 > 8) { await Y(); _dt0 = performance.now(); } };
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
    await DY();
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
            // Conditional scale draw — divergence mode; position-keyed
            // under ?planthash=1 (see TreeField._tree).
            if (!place(tx, tz) && claim('tree', tx, tz, 3.0)) {
              trees.add(tx, tz, (window.__planthash
                ? hashRand(tx, tz, 0.85, 1.15) : rand(0.85, 1.15)) * treeK);
              break;
            }
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
  let offAxisCrossings = 0;
  for (const c of (dataRef.crossings || [])) {
    await DY();
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
    // A crossing more than half a carriageway from THE AXIS belongs to a
    // different street — true where a district is its main street, and a
    // silent loss where it is not. Sentosa's 78 surveyed crossings are
    // spread over an island whose axis is one gateway road, so ALL of them
    // were skipped and `realCrossings` stayed 0, which A2 reads as "the
    // layer was never read". Counted, so a skip is visible and the next
    // person can see it is 78 and not zero. (Drawing crossings on every
    // road is the real fix and changes geometry in every district — it is
    // NOT a 3am change.)
    if (Math.sqrt(bd) > half + 6) { offAxisCrossings++; continue; }
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
  // ACCUMULATE, DO NOT OVERWRITE. This is ONE GLOBAL written by EVERY
  // streamed chunk, so a plain assignment leaves whatever the LAST chunk
  // happened to build -- and A2 ("real data present but unused") reads it as
  // a boolean. A chunk with none of this layer therefore reported the whole
  // world as not drawing it, and a chunk with some reported it fine: the
  // check's answer depended on manifest order, not on the world. Caught when
  // kallang landed and A2 failed the world scene while a probe on the same
  // URL read 37 crossings. Same one-global-many-chunks family as __onRoad,
  // and `__realErp` two lines away has always done it correctly.
  if (offAxisCrossings) {
    console.log(`  crossings: ${offAxisCrossings} skipped, further than half a `
      + `carriageway from the axis`);
  }
  window.__droppedCrossings = (window.__droppedCrossings || 0) + offAxisCrossings;
  window.__realCrossings = (window.__realCrossings || 0) + realCrossings;
  window.__tactilePads = tactilePads;

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1);
  // A KERB FOLLOWS THE ROAD'S SLOPE — it does not stair-step down it.
  //
  // The owner, riding: "those road side curb anyway to not make it so jagged
  // every step?" He is describing exactly what the code did. Each kerb is a 2m
  // box placed with YAW ONLY (`e.set(0, r[3], 0)`) and seated at the surface
  // height of its own CENTRE, so on any grade a run of them is a staircase:
  // every segment horizontal, each one a step below the last. On Sentosa,
  // where the roads climb Imbiah and drop to every beach, that is most of the
  // island's kerb line.
  //
  // Seat on the MEAN of the segment's two ends and pitch it by the slope
  // between them, so consecutive segments meet end to end instead of
  // overlapping in a tread. The pitch is clamped: surfaceAt is discontinuous
  // where a segment straddles a bridge edge or a stair tread, and an unclamped
  // atan2 across that discontinuity would stand a kerb on end.
  const KERB_HALF = 1.0;                       // the 2m segment's half length
  const KERB_MAX_PITCH = 0.30;                 // ~30% grade; steeper is a data seam
  const seatKerb = (r) => {
    const s = Math.sin(r[3]), c = Math.cos(r[3]);
    const ya = surfaceAt(r[0] + s * KERB_HALF, r[2] + c * KERB_HALF);
    const yb = surfaceAt(r[0] - s * KERB_HALF, r[2] - c * KERB_HALF);
    let pitch = -Math.atan2(ya - yb, KERB_HALF * 2);
    if (!(pitch > -KERB_MAX_PITCH && pitch < KERB_MAX_PITCH)) {
      pitch = 0;
      p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
    } else {
      p3.set(r[0], (ya + yb) / 2 + r[1], r[2]);
    }
    e.set(pitch, r[3], 0, 'YXZ');              // yaw first, then pitch about the run
    q.setFromEuler(e);
  };
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
        seatKerb(r);
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
  // surfaceAt, NOT groundAt — ONE DEFECT, TWO EMITTERS, and only one of them
  // was ever fixed. The PAINTED kerbs a few lines above already used surfaceAt;
  // these plain ones did not, so on the Bayfront bridge 119 of them sat 1.7m
  // below the deck they belong to. Every prop on this list stands on the road
  // surface, and the road surface is the deck where a bridge crosses.
    seatKerb(r);
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
    p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); q.identity();
  });
  emit(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), MAT.galv, armT, (r) => {
    p3.set(r[0], surfaceAt(r[5], r[6]) + r[1], r[2]);
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
    p3.set(r[0], surfaceAt(r[4], r[5]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
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
    p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
    e.set(-Math.PI / 2, r[3], 0, 'YXZ'); q.setFromEuler(e);
  });
  emit(new THREE.PlaneGeometry(0.62, axis.w), MAT.white, zebraT, (r) => {
    p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
    e.set(-Math.PI / 2, r[3], 0, 'YXZ');
    q.setFromEuler(e);
  });
  // the refuge: a low kerbed island in the middle of the crossing
  emit(new THREE.BoxGeometry(2.0, 0.22, 3.4), MAT.kerb, refugeT, (r) => {
    p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  // the tactile pad: a 1.2m by 0.9m yellow panel laid flat at the kerb
  emit(new THREE.PlaneGeometry(1.2, 0.9), MAT.tactile, tactileT, (r) => {
    p3.set(r[0], surfaceAt(r[0], r[2]) + r[1], r[2]);
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
// THE SURF SKATE, on the same state and the same step(). Its rider is a
// separate figure because buildRider() is posed SEATED — see buildSkater's
// note. The skater is parented to the board so a carve leans them together,
// which is exactly what happens on a real one.
const skateRig = buildSkate();
// the push stroke's phase — module scope because it must survive frames,
// and it is advanced by DISTANCE rather than by a clock (see the push block)
let pushPhase = 0;
const skater = buildSkater();
skateRig.group.add(skater);
skateRig.group.visible = false;
// THE VEHICLES, IN ONE PLACE. Adding a fourth means adding a row, not hunting
// through main.js for every `=== 'car'` — which is how the camera framing came
// to be two ternaries that would have filmed the board as a scooter.
// `rr` and `rlat` are the traffic-collision half-lengths: fore-and-aft keeps a
// generous radius so nosing into the back of a bus stops you early, ACROSS is
// the machine's real half-width so riding alongside traffic does not phantom-
// brake. The board is 0.85m long and 0.245m wide, so it is the smallest of the
// three and takes the scooter's lateral figure rather than anything tighter —
// a rider is wider than their deck.
// THE SENTOSA GAME IS SKATE-ONLY (owner's call, 2026-08-03): the electric
// surfskate is the game's one vehicle. The bike and car rows are PARKED, not
// deleted — RIDE/CAR stay exported and tested in ride.js, their rigs still
// build, and restoring a row here restores the whole cycle. vehicleAt falls
// back to VEHICLES[0], so an old localStorage 'bike'/'car' lands on the board.
const VEHICLES = [
  { kind: 'skate', label: 'Skate', verb: 'Skate', params: SKATE, rr: 0.48, rlat: 0.34 },
];
const vehicleAt = (kind) => VEHICLES.find((v) => v.kind === kind) || VEHICLES[0];
let vehicleKind = 'skate';
let rideParams = SKATE;
// The mode pill's text, in one place. A `function` declaration so it can be
// called from setVehicle — which runs during boot, long before updateHelp's
// `const` block exists — without walking into the temporal dead zone that
// crashed the whole module once already (see the note by updateHelp's call).
// It touches nothing but the button.
// What the mode button offers beside each kind of ride. One entry per kind
// `buildRides` can produce — keep them in step, and see the note at the point
// of use for why there is deliberately no fall-through default.
const RIDE_VERB = {
  gondola: 'Ride the cable car',
  cable_car: 'Ride the cable car',
  chair_lift: 'Ride the SkyRide',
  luge: 'Ride the luge',
  zip: 'Ride MegaZip',
  flowrider: 'Surf the FlowRider',
  flowbarrel: 'Surf the FlowBarrel',
};
function modeLabel() {
  const btn = document.getElementById('modebtn');
  if (!btn) return;
  if (mode === 'onride') { btn.textContent = 'Get off'; return; }
  // Name the thing in front of you. "Ride" beside a cable car station and
  // "Skate" in the middle of a road are different offers, and a button that
  // does not say which is a button you do not press.
  if (mode === 'walk') {
    const hit = (typeof nearestRide === 'function') ? nearestRide() : null;
    if (hit) {
      // THE BUTTON OFFERED THE WRONG RIDE ON THREE OF THEM.
      //
      // Found 2026-08-17. This chain knew three kinds and the world has six:
      // `gondola`, `chair_lift`, `luge`, `zip`, `flowrider`, `flowbarrel`. So
      // everything that was not a luge or a SkyRide fell through the final
      // `else` and read **"Ride the cable car"** — standing at the foot of
      // MegaZip, and standing on the Wave House deck with the sheet running in
      // front of you. The one line whose entire job is to name the thing in
      // front of you ("a button that does not say which is a button you do not
      // press") named a cable car three times over.
      //
      // A fall-through default is what let that happen quietly, so there is no
      // default now: an unlisted kind gets the ride's own name rather than
      // somebody else's, and a new kind cannot inherit a wrong label.
      //
      // "Surf", not "Ride", on the two wave rides — you stand up on those, and
      // the verb is the cheapest way to say so before anyone boards.
      const R = hit.ride, k = R.kind;
      btn.textContent = RIDE_VERB[k] || ('Ride ' + (R.name || 'this'));
      return;
    }
  }
  btn.textContent = mode === 'ride' ? 'Get off' : vehicleAt(vehicleKind).verb;
}
function setVehicle(kind) {
  const v = vehicleAt(kind);
  vehicleKind = v.kind;
  rideParams = v.params;
  // a switch mid-corner froze the old body's bank into the new body: the
  // lean state carries over but only the ACTIVE branch writes rotations,
  // so the hidden rig kept its last roll forever. Reset all of it.
  S.lean = 0;
  vespa.group.rotation.z = 0;
  carRig.group.rotation.z = 0;
  skateRig.group.rotation.z = 0;
  carRig.group.visible = vehicleKind === 'car';
  vespa.group.visible = vehicleKind === 'bike';
  skateRig.group.visible = vehicleKind === 'skate';
  // in a car the rider sits behind tinted glass; on the bike he is the pilot,
  // and on the board the skater is part of the board's own rig
  if (mode === 'ride') {
    rider.visible = vehicleKind === 'bike';
    skater.visible = vehicleKind === 'skate';
  }
  try { localStorage.setItem('sg_vehicle', vehicleKind); } catch (e) { /* private mode */ }
  // The button offers the NEXT vehicle. With ONE vehicle in the game there is
  // nothing to offer, so the button hides entirely rather than cycling to
  // itself — restore a second VEHICLES row and it comes back on its own.
  const b = document.getElementById('vehiclebtn');
  if (b) {
    if (VEHICLES.length < 2) b.style.display = 'none';
    else b.textContent = nextVehicle().label;
  }
  // swapping vehicle while on foot changes Ride <-> Drive <-> Skate.
  // modeLabel ONLY — setVehicle runs during boot and updateHelp closes over
  // `const stickEl` declared further down, so calling it from here is the
  // temporal-dead-zone crash this file has already taken twice. The callers
  // that run after boot (the vehicle button) call updateHelp themselves.
  modeLabel();
}
function nextVehicle() {
  const i = VEHICLES.findIndex((v) => v.kind === vehicleKind);
  return VEHICLES[(i + 1) % VEHICLES.length];
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
bike.add(skateRig.group);
scene.add(bike);

let S = newState(0, 0, 0);
let ready = false, stats = {};
let crowdSys = null, trafficSys = null, wayfinder = null, signals = null;
// The skid-mark ribbon. Created once the world exists; `?noskid` disables it,
// which is also how its cost gets A/B'd on the phone profile.
let SKID = null;
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
// exposed so __trafficState can report every fleet, not only the spawn one
window.__extraTraffic = extraTraffic;

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

// FLEET SIZE COMES FROM THE STREET'S LENGTH, one rule for BOTH build paths.
// The streamed path scaled its fleet (alen / 12.5, one vehicle every ~25m of
// carriageway both directions) while the boot path kept a flat 240+32 from
// the days when boot always meant Orchard Road's 2.4km — so a district SCENE
// of marinaeast put 272 vehicles on an 851m street, one every 3.1m, and the
// nose-to-tail spacing pass then packed the loop solid straight through the
// spawn clear zone: five cars within 12m of the rider at load, one at 1.4m
// (defect D42, measured 2026-08-02). Same one-rule-two-copies rot as the
// lamps flag and the shopfront reach; import the function, never copy it.
const fleetFor = (alen) => ({
  cars: Math.round(Math.max(48, Math.min(240, alen / 12.5)) * (PHONE ? 0.62 : 1)),
  buses: Math.round(Math.max(8, Math.min(32, alen / 85)) * (PHONE ? 0.62 : 1)),
});

// EVERY STREAMED BUILDER'S COUNTERS, IN ONE PLACE THAT ALWAYS EXISTS.
// addChunk used to read only buildFurniture's `signals` and drop every other
// number every builder returned — and the first streaming wave runs BEFORE
// `window.__stats` is even assigned, so a guard of `if (window.__stats)`
// loses that wave's counts too. The world scene's D39 was therefore comparing
// the data against zeros: "3,569 trees and the world drew none of them", with
// the trees on screen. Numbers land in __statsAcc unconditionally; the boot
// assembly merges the accumulator once and later chunks keep both in step.
// SEMANTICS: lifetime-BUILT totals, not currently-resident — a phone district
// that unloads and rebuilds counts again. Audits stream each district once
// (no evictions), so every gate reads a clean single pass.
const statAdd = (o) => {
  if (!o) return;
  const t = (window.__statsAcc = window.__statsAcc || {});
  for (const k in o) {
    if (typeof o[k] === 'number') {
      t[k] = (t[k] || 0) + o[k];
      if (window.__stats) window.__stats[k] = (window.__stats[k] || 0) + o[k];
    }
  }
};

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
// NO PEOPLE IN THIS WORLD. THE RIDER'S DECISION, NOT A BUG — 2026-08-01.
//
// This is opt-IN on purpose: the crowd is only built with ?people. It looks
// exactly like a mistake, because every other layer here is opt-OUT
// (nofoliage, notraffic, noshops, nomarks, nosigns) and the comment at the
// construction site below argues for a BIGGER population and says "an empty
// Orchard Road on a Saturday is still obviously not Orchard Road". It was
// changed to opt-out on that reasoning and the rider said, plainly: "i dont
// want any ppl in the world. Only vehicles can." Reverted the same minute.
//
// DO NOT "FIX" THIS AGAIN. Vehicles yes, pedestrians no. The whole crowd
// system stays in the tree and stays correct behind the flag.
const PEOPLE = P.has('people');
// POSITION-KEYED LOOKS ARE THE DEFAULT (owner's "ok", 2026-08-14). Every
// tree crown and every building's facade picks draw from a hash of their own
// position instead of the shared placement stream, so no edit can move any
// other thing's look — the A/B took the same edit from 20 disturbed golden
// frames to one. The flip cost one island-wide reshuffle, vetted frame by
// frame and re-blessed the same day. ?noplanthash restores the old stream
// for A/B archaeology only.
window.__planthash = !P.has('noplanthash');
// 280 on phones (was 340), part of the owner's 2026-08-03 "make all smooth"
// package: small dressing (kerbs, benches, plates) drops out 60m earlier.
const LOD_FAR = PHONE ? 280 : 500;
// OCCLUSION CULLING WAS BUILT, MEASURED AND REMOVED ON 2026-08-02. Read this
// before building it again.
//
// The idea is sound and it is what city games rely on: do not submit the half
// of the world hidden behind the block in front of you. The first measurement
// looked overwhelming — 1,066 meshes in frustum in orchard with 801 behind a
// building (75%), and 90% of triangles in chinatown.
//
// THAT MEASUREMENT WAS TAKEN IN `?raw=1`, WHICH DISABLES CONSOLIDATION AND IS
// NOT WHAT SHIPS. The real build has already merged small geometry into coarse
// per-tile batches: 2,408 draw calls in raw mode against 727 in the real one.
// Re-measured on the shipped configuration the ceiling is about 11% of draws:
//
//   - a tile batch is ~110m across, wider than a city block, so it is almost
//     never ENTIRELY behind one building — and less than entirely is a hole;
//   - the fine-grained remainder is 116 meshes in chinatown's frustum with 79
//     occluded, which is 11% of 727;
//   - the tall meshes need a height-aware test (a tower behind a shophouse is
//     not hidden) and there are only 24 of them in view.
//
// A conservative implementation was written and A/B'd: 526 draws with it on
// against 528 with it off. It cost CPU every frame and saved two draw calls.
//
// THE WIN WAS ALREADY TAKEN — consolidate()'s per-tile batching is the same
// saving by another route. If this is ever revisited, the only version worth
// building is height-aware culling of whole BUILDINGS, and the honest ceiling
// is single-digit percent.

// static instanced sets (trees, lamps, posts, stripes) with per-instance
// distance culling — the sets span the whole region in one bounding sphere,
// so without this every leaf in the world is vertex-shaded every frame, in
// the main pass AND the shadow pass, no matter where the camera looks.
const LODI = [];
let lodLast = 0, lodX = 0, lodZ = 0;
// How many times a capped instance buffer has had to grow. Zero is expected.
let lodGrew = 0;
// instanced meshes the LOD must never compact: the Signals system addresses
// its lens instances BY INDEX, so compaction would move the green light
const lodExclude = new Set();

// Give a compacted set a GPU buffer of `capN` seats instead of one per instance.
// The old attribute's GPU buffer is released the only way three.js offers — the
// mesh's own dispose event, which is what unloadChunk uses — and the renderer
// re-attaches its listener the next time it draws (WebGLObjects checks
// hasEventListener before adding). The three constant zeros and the corner 1 are
// written into every seat here, because the compactor never writes them again.
function setLodCap(L, capN) {
  L.o.dispose();
  const a = new Float32Array(capN * 16);
  for (let i = 0; i < capN; i++) a[i * 16 + 15] = 1;
  L.o.instanceMatrix = new THREE.InstancedBufferAttribute(a, 16);
  L.o.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  L.o.instanceMatrix.needsUpdate = true;
  if (L.col) {
    L.o.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capN * 3), 3);
    L.o.instanceColor.setUsage(THREE.DynamicDrawUsage);
    L.o.instanceColor.needsUpdate = true;
  }
}

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
    const M = o.instanceMatrix.array;
    const col = o.instanceColor ? o.instanceColor.array.slice(0, n * 3) : null;
    const px = new Float32Array(n), pz = new Float32Array(n);
    for (let i = 0; i < n; i++) { px[i] = M[i * 16 + 12]; pz[i] = M[i * 16 + 14]; }
    // THE SOURCE MATRICES ARE STORED IN 30 BYTES, NOT 64 — measured, and it was
    // the biggest single allocation on the island. `src` used to be a FULL
    // duplicate of instanceMatrix; at 769,440 instances that duplicate plus
    // px/pz was 52.8 MB, and no memory breakdown had ever counted it, because
    // LODI is not in the scene graph and every previous probe walked the scene.
    //
    // An instance matrix is a 3x3 of rotation-times-scale, a position, and five
    // constants — three zeros in the last row and a 1 in the corner — that are
    // the same for every instance ever written. So the constants are written
    // into the GPU buffer ONCE at registration and never touched again, the
    // position stays Float32 (world coordinates reach 5 km; 16-bit here would
    // be metres of error), and the 3x3 is quantised to Int16 against the set's
    // own largest term.
    //
    // WHY THE 3x3 CAN BE QUANTISED AND THE POSITION CANNOT: measured on this
    // island, the largest term across the big sets is about 5.3, so a step is
    // 5.3/32767 = 1.6e-4. On a five-metre leaf card that is 0.2 mm at the
    // corner. On a position it would be 8 cm at the far end of the map.
    //
    // The first version of this assumed a Y-only rotation and caught 24,597 of
    // 769,440 instances: EVERY big set failed, because a tree's leaf cards are
    // tilted in all three axes and its trunks lean. The sample that settled it
    // is in the scratchpad probe — full 3x3, no zeros anywhere. Guessing the
    // shape of the data cost a round trip; reading four real matrices ended it.
    //
    // A set whose last row is not [0,0,0,1], or that holds a non-finite number,
    // keeps the full 16 floats and behaves exactly as before.
    const R9 = [0, 1, 2, 4, 5, 6, 8, 9, 10];
    let r9 = null, py = null, rq = 0;
    let ok = true, mx = 0;
    for (let i = 0; i < n && ok; i++) {
      const j = i * 16;
      if (M[j + 3] !== 0 || M[j + 7] !== 0 || M[j + 11] !== 0 || M[j + 15] !== 1) { ok = false; break; }
      if (!Number.isFinite(M[j + 12]) || !Number.isFinite(M[j + 13]) || !Number.isFinite(M[j + 14])) { ok = false; break; }
      for (let e = 0; e < 9; e++) {
        const v = M[j + R9[e]];
        if (!Number.isFinite(v)) { ok = false; break; }
        const av = v < 0 ? -v : v;
        if (av > mx) mx = av;
      }
    }
    if (ok && mx > 0) {
      rq = mx / 32767;
      r9 = new Int16Array(n * 9);
      py = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const j = i * 16, s = i * 9;
        for (let e = 0; e < 9; e++) r9[s + e] = Math.round(M[j + R9[e]] / rq);
        py[i] = M[j + 13];
      }
      // The constants, written once for every seat the compactor can use, and
      // then the set rebuilt in place from its own compact form. The rebuild is
      // not optional: the compactor does not run until the first LOD tick, and
      // a buffer left zeroed renders every tree as a point. It also means what
      // renders before the first tick is what the compactor writes after it —
      // one encoding, no seam — and it round-trips the quantiser once, on the
      // real data, at boot.
      M.fill(0);
      for (let i = 0; i < n; i++) {
        const j = i * 16, s = i * 9;
        for (let e = 0; e < 9; e++) M[j + R9[e]] = r9[s + e] * rq;
        M[j + 12] = px[i]; M[j + 13] = py[i]; M[j + 14] = pz[i]; M[j + 15] = 1;
      }
      o.instanceMatrix.needsUpdate = true;
    }
    const src = r9 ? null : o.instanceMatrix.array.slice(0, n * 16);
    o.userData.lodRegistered = true;
    // A SMALLER GPU BUFFER, SECOND ATTEMPT — see the reverted note below.
    //
    // Worth retrying because the island now has a TRUSTWORTHY heap figure for
    // the first time: 228MB settled, stable five ways, against a ~206MB iOS
    // ceiling. This buffer is 56MB of that and only about a fifth of it is ever
    // drawn, so it is the one lever big enough to close a 22MB gap.
    //
    // WHAT IS DIFFERENT THIS TIME: the first attempt set count = 0 and left the
    // buffer empty until the first LOD tick. Counts were verified correct
    // afterwards (191,055 written at Serapong) and the island still rendered
    // with every tree invisible, so an empty first frame was never the whole
    // story — but shipping a set that is momentarily empty is indefensible
    // anyway, so it is filled here, immediately, before anything can draw it.
    // If the goldens still come back bare then the fault is the attribute swap
    // itself and this gets reverted a second time, with that established.
    const L = { o, src, r9, py, rq, col, n, px, pz, far };
    if (r9) {
      const capN = Math.min(n, Math.max(256, Math.ceil(n * (PHONE ? 0.35 : 0.8))));
      if (capN < n) {
        setLodCap(L, capN);
        const a2 = o.instanceMatrix.array;
        for (let i = 0; i < capN; i++) {
          const s2 = i * 9, d2 = i * 16;
          for (let e = 0; e < 9; e++) a2[d2 + R9[e]] = r9[s2 + e] * rq;
          a2[d2 + 12] = px[i]; a2[d2 + 13] = py[i]; a2[d2 + 14] = pz[i];
        }
        o.count = capN;
        o.instanceMatrix.needsUpdate = true;
      }
    }
    // AND IT WORKED THIS TIME. The difference was one line: the capped buffer is
    // FILLED at registration instead of being left empty for the first LOD tick
    // to populate. The first attempt reasoned that a tick 250ms later would fill
    // it before anything drew, verified the instance COUNTS afterwards (191,055
    // at Serapong) and shipped an island where every tree was invisible. The
    // counts were measured long after boot, by which time a tick had run — they
    // never described the frame that was actually broken.
    //
    //     settled heap        228 -> 195 MB      (the ~206MB iOS ceiling, passed)
    //     instance buffers   56.1 -> 19.7 MB
    //     worst seats used    48% across 17 vantages, no buffer ever grew
    //     goldens             14 of 14 at 0.000%
    //
    // A measurement taken at the wrong MOMENT is not a weaker measurement, it is
    // a different one. That is the same fault as the deploy gate reading heap
    // mid-boot, found the same night.
    LODI.push(L);
  });
}
let terrain = new Terrain(null);
let mode = 'ride';                 // 'ride' | 'walk' | 'onride'
// The cable car / SkyRide / luge network, and the seat the player is in.
// `onRide` is null unless the player is being carried.
let RIDES = null;
let PLACES = null;   // 3D names floating over the landmarks
let onRide = null;                 // { ride, s, from }
let lastRideLabel = 0;
// THE GUIDE AT THE GATE. Shown only while you are standing at an entrance;
// silent everywhere else, which is what makes it a person rather than a HUD.
let ENTRANCES = null, guideOn = null, lastGuideT = 0;
function updateGuide(x, z, now) {
  if (!ENTRANCES || now - lastGuideT < 220) return;
  lastGuideT = now;
  let best = null, bd = 15 * 15;
  for (const e of ENTRANCES) {
    const dx = e.p[0] - x, dz = e.p[1] - z;
    const d = dx * dx + dz * dz;
    if (d < bd) { bd = d; best = e; }
  }
  const key = best ? best.n : null;
  if (key === guideOn) return;
  guideOn = key;
  const el = document.getElementById('guide');
  const nm = document.getElementById('guideName');
  const tx = document.getElementById('guideText');
  if (!el || !nm || !tx) return;
  if (!best) { el.classList.remove('on'); return; }
  nm.textContent = best.n;
  tx.textContent = best.t || '';
  // AND HOW TO GET ON IT, when it is something you can get on. The guide used
  // to say only where you were standing, which for a ride is half a guide —
  // see the RIDE_LINES note in data/entrances.py for why every one of these is
  // read off src/rides.js rather than off the real ride.
  const hw = document.getElementById('guideHow');
  if (hw) { hw.textContent = best.r || ''; hw.style.display = best.r ? '' : 'none'; }
  el.classList.add('on');
}
// The room server (see relay/); ?relay= overrides for local testing against
// `node relay/local.mjs`. Null until ?room= activates multiplayer post-boot.
const SG_RELAY_URL = 'https://sentosa-relay.propsightsg.workers.dev';
let NET = null;
// OFF unless ?audio — see the note in audio.js. The rider asked for it out
// while it is unreliable, and a silent world is better than a flaky one.
const sound = new Sound(P.has('audio'));
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

// THE GAME IS ONE DISTRICT: sentosa (the 2026-08-03 pivot — district-select,
// no free roam). A bare URL boots Sentosa standalone via the flat path (no
// manifest exists for it, so the fetch falls through to data/sentosa.json and
// none of the streaming machinery runs). ?scene=<id> still loads any district,
// which is what the per-district audit gates and the old world tooling want.
const SCENE = (P.get('scene') || 'sentosa').replace(/[^a-z0-9_-]/gi, '');
// BOOT PHASE TIMING. `?boot=1` prints where the seconds go, because the first
// three attempts at cutting a 29s mobile boot each optimised the wrong thing.
const BOOTT = [];
// exposed so sgdetail can push its own sub-marks; see the sgmark note there
window.__bootMarks = BOOTT;
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
// Only the WORLD scene has a manifest; probing for one on the game's default
// single-district boot 404s in the console on every player load, and livecheck
// rightly fails a deploy on any console error. So the manifest path is entered
// only for scenes that can have one — every other scene goes straight to its
// flat file with zero failed requests.
if (SCENE === 'world' && !P.has('nostream')) {
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
  const LAYERS = ['water', 'green', 'land', 'piers', 'buildings', 'roads', 'bridges', 'covered', 'towers',
    'trees', 'crossings', 'signals', 'busstops', 'mrt', 'taxis', 'shops',
    'gantries', 'lamps'];
  const regionData = { origin: mani.origin, water: [], green: [], land: [], buildings: [], roads: [] };
  // the ground mesh is built ONCE for the whole region, so every chunk's green
  // has to be in hand before terrain.build() runs — not streamed in later
  window.__allGreen = chunks.flatMap((c) => [...(c.green || []), ...(c.land || [])]);
  // kept for the streamed chunk builds: the shopfront pass needs to see
  // buildings in OTHER chunks or it sites bays into them at the seam
  REGIONB = regionData;
  for (const ch of chunks) for (const k of LAYERS) {
    if (!Array.isArray(ch[k])) continue;
    if (!regionData[k]) regionData[k] = [];
    regionData[k].push(...ch[k]);
  }
  // EVERY DISTRICT STREAMS, INCLUDING THE FIRST. THIS WAS THE iPHONE CRASH.
  //
  // buildRegion() used to build the boot district straight into `world`
  // rather than into a removable group, so it was not in `recs`, was not
  // counted by MAX_RESIDENT, and could never be evicted. That district is
  // orchard — 1,663 buildings and 3,019 roads — held for the life of the page
  // wherever the rider went. Measured on a phone profile arriving at
  // Chinatown, the cap believed it held three districts and was really
  // holding four, ~5,232 buildings, and the rider's iPhone died on exactly
  // that teleport. iOS Safari reaps a tab far below what desktop Chrome
  // tolerates, which is why no desktop run ever reproduced it.
  //
  // Raising the cap's arithmetic could not fix a district the cap cannot see.
  // Dropping it to 2 was tried and MEASURED: it evicted marinasouth, the
  // smallest district in the world, for a 2.4% saving and worse pop-in
  // everywhere. Reverted.
  //
  // So the boot build now does the REGION-WIDE work only — the heightfield
  // mesh, the surround, the shared indexes, all built from `regionData` and
  // none of it unloadable — and every district including orchard arrives
  // through addChunk() in its own evictable `district:<id>` group. Measured
  // after: geometries at Chinatown 1138 -> 574, live-check heap 670MB ->
  // 326MB, and orchard evicts correctly on every teleport.
  //
  // IT SURFACED THREE THINGS THAT QUIETLY ASSUMED THE SPAWN WAS SPECIAL, and
  // all three were real pre-existing bugs, not costs of this change:
  //
  //   1. addChunk THREW AWAY buildShopfronts' return, so the world scene's S8
  //      only ever measured the boot district and called it the world. Now
  //      accumulated; the honest world figure is 67 where the budget said 70.
  //   2. `spawn.axes` seeded an UNTAGGED copy of the first axis, and trimAxes
  //      keeps the first entry whole and trims later ones against it — so a
  //      streamed orchard had its own tagged axis trimmed to nothing. The
  //      seed is gone; every axis now enters tagged through addChunk.
  //   3. markings.js placed street lamps behind a GLOBAL one-shot, so the
  //      first district to build consumed it and the other fourteen never
  //      read their own lamps. 8,282 surveyed positions unbuilt. Fixed there.
  const spawn = { ...chunks[0] };
  spawn.terrain = mani.terrain;
  spawn.axisFullLength = mani.axisFullLength;
  spawn.axes = [];
  for (const k of ['buildings', 'roads', 'water', 'green', 'land', 'piers', 'steps',
    'barriers', 'parkfurn', 'towers', 'cranes', 'trees', 'crossings', 'signals',
    'busstops', 'mrt', 'taxis', 'bridges', 'covered', 'shops', 'gantries', 'lamps']) {
    spawn[k] = [];
  }
  const rest = mani.districts.map((d, i) => ({ id: d.id, box: d.box, ch: chunks[i] }));
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
    // diagnostic ring, not a ledger: rebuilds appended forever (one entry per
    // step per build, unbounded on a long ride). Recent history is all a
    // probe ever reads.
    if (st.times && st.times.length > 400) st.times.splice(0, st.times.length - 400);
    st.step = t; st._t = now;
  };
  const data = window.__data;
  // the probe arrays grow ONCE per district — a rebuild after an unload
  // must not double every layer
  if (!rec.pushed) {
    // `cranes` joined this list the day it was parsed. A layer that is drawn
    // but never pushed here is invisible to every runtime probe and to the
    // A2 "real data present but unused" check — the same one-place-missed
    // shape that left `cranes` out of merge.py and left topup.py asking for
    // towers only.
    for (const k of ['water', 'buildings', 'roads', 'bridges', 'covered', 'towers',
      'cranes', 'trees', 'crossings', 'signals', 'busstops', 'mrt', 'taxis', 'shops',
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
  if (!P.has('nowater')) buildPiers(g, ch);
  if (!P.has('notowers')) { statAdd(buildSupertrees(g, ch)); statAdd(buildTowers(g, ch, null)); statAdd(buildCranes(g, ch)); }
  if (!P.has('nofoliage')) statAdd(await plantSurveyed(g, ch, place, Y));
  await Y();
  mk('buildings');
  if (!P.has('nobuild')) await buildBuildings(g, ch, Y);
  mk('prune');
  await pruneCarriageway(g, ROADIX.onRoad, (x, z) => terrain.at(x, z), Y);
  await Y();
  // FREEZE THE BUILDINGS' MATRICES NOW, NOT AT THE END OF THE CHUNK. The
  // end-of-build freeze below still runs and catches everything; this early
  // pass exists because the buildings are ~80% of a district's meshes and
  // the build takes long enough that leaving them on matrixAutoUpdate meant
  // three.js recomputed thousands of static matrices EVERY FRAME for the
  // whole raw window — part of the 380-430ms frames measured 2026-08-03
  // riding into littleindia. Same type-based skip rules as the end pass;
  // safe because nothing after this step repositions building meshes (prune
  // only removes), and a frozen matrix is computed once here first.
  g.traverse((o) => {
    if (o === g || o.isInstancedMesh || o.isGroup || !o.isMesh || !o.matrixAutoUpdate) return;
    o.updateMatrix();
    o.matrixAutoUpdate = false;
  });
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
    if (!P.has('nofoliage')) await dressStreet(ch, ax, g, Y);
    await Y();
    let f = {};
    mk('furniture');
    if (!P.has('nofurniture')) f = await buildFurniture(g, ax, place, ch, Y);
    // A STREAMED DISTRICT'S FURNITURE COUNTERS WERE THROWN AWAY — only
    // f.signals was read below, so in the streamed world __stats reported
    // realTaxis/realBusStops/realSignals/realCovered = 0 whatever was drawn,
    // and D39 measured nothing. Same S8 shape the shopfront accumulation
    // below already patched; numbers accumulate, everything else stays local.
    statAdd(f);
    await Y();
    mk('signage');
    if (!P.has('nosigns')) statAdd(await buildSignage(g, ax, ch, place, Y));
    await Y();
    mk('markings');
    if (!P.has('nomarks')) await buildMarkings(g, ax, ch, Y);
    if (window.__stats) window.__stats.realCrossings = window.__realCrossings;
    await Y();
    mk('side');
    if (!P.has('noside')) {
      const before = new Set(dressedStreets);
      statAdd(await dressSideStreets(g, ch, ax, place, TreeField, dressedStreets, 0, Y));
      rec.dressedDelta = [...dressedStreets].filter((r) => !before.has(r));
    }
    await Y();
    mk('sg');
    if (!P.has('nosg')) statAdd(await buildSgDetail(g, ax, ch, place, Y));
    if (!P.has('nosg')) statAdd(buildUssVocab(g, ch, place));
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
    // Opt-IN like the boot fleet below — see the NO NPC VEHICLES note there.
    if (P.has('traffic') && ax && ax.p && ax.p.length > 1) {
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
      const { cars, buses } = fleetFor(alen);
      const tr = new Traffic(ax, cars, buses, axisSpec(ax, ch));
      // LEAVE A CLEAR ZONE ROUND THE RIDER, which this never had to do while
      // the district the rider stood in was built at boot. Traffic.build()
      // places its fleet from avoidS+55 over path.len-110 precisely so nothing
      // materialises on top of the player; passing 0 was right for a district
      // the rider was nowhere near and wrong the moment the SPAWN district
      // started streaming. Only avoid where the rider actually is: on a
      // district across the island, S=0 is as good a place to start as any.
      // Distance measured against the axis POLYLINE directly rather than
      // through the path API, whose at() writes into an out-parameter and
      // returns nothing — guessing at that is how a fix becomes a second bug.
      let near2 = Infinity;
      const AP = (ax && ax.p) || [];
      for (let i = 0; i < AP.length - 1; i++) {
        const ax0 = AP[i], ax1 = AP[i + 1];
        const vx = ax1[0] - ax0[0], vz = ax1[1] - ax0[1];
        const l2 = vx * vx + vz * vz || 1;
        let t = ((S.x - ax0[0]) * vx + (S.z - ax0[1]) * vz) / l2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = S.x - (ax0[0] + vx * t), qz = S.z - (ax0[1] + vz * t);
        const dd = qx * qx + qz * qz;
        if (dd < near2) near2 = dd;
      }
      tr.build(g, near2 < 150 * 150 ? tr.path.nearestS(S.x, S.z) : 0);
      tr.__ax = ax && ax.p;
      extraTraffic.push(tr);
      rec.traffic = tr;
      await Y();
    }
  }
  const solidBefore = WALLSREF ? (x, z) => WALLSREF.at(x, z) : null;
  mk('shops');
  // ACCUMULATE WHAT IT MEASURES. This call threw the per-district counts away,
  // so `window.__stats.realShops` and its siblings only ever described the
  // district built at boot — which meant the world scene's S8 reported
  // Orchard's coverage and called it the world's. Same shape as the global
  // lamp one-shot in markings.js: a per-district fact held in one place.
  if (!P.has('noshops')) {
    statAdd(await buildShopfronts(g, ch, ax ? [ax] : [], solidBefore, REGIONB, Y));
  }
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
    // the cheap shader, on every device — see lambertise()
    if (!P.has('rich')) lambertise(g, THREE);
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
  // InstancedMesh.dispose() as well as geometry.dispose(): the per-instance
  // matrix/colour buffers are freed ONLY through the mesh's own 'dispose'
  // event — geometry.dispose() never touches them — so every unloaded
  // district's trees, lamps and posts were leaving their instance VBOs on
  // the GPU. Invisible to renderer.info.memory (it counts geometries and
  // textures only), which is exactly the counter the soak used to declare
  // "no unload leak". Audit find, 2026-08-03.
  rec.group.traverse((o) => {
    if (o.isInstancedMesh) o.dispose();
    if (o.geometry) o.geometry.dispose();
  });
  // ...and the LOD exclusion set: a lensMesh entry per district with signals,
  // never removed, so rebuilds accumulated dead mesh references forever.
  for (const o of lodExclude) if (inG.has(o)) lodExclude.delete(o);

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
    rec.crowd = null;   // its meshes died with the group
  }
  if (rec.traffic) {
    const i = extraTraffic.indexOf(rec.traffic);
    if (i >= 0) extraTraffic.splice(i, 1);
    // rec.crowd = null used to sit HERE — inside the traffic branch — so
    // with traffic off (the default) the Crowd object and its ~1,600 agent
    // records stayed reachable from recs for the life of the page, for
    // every district ever visited. Audit find, 2026-08-03.
    rec.traffic = null;
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
// THE RENDER BUDGET THE BUILD PACER JUDGES FRAMES AGAINST. 16.7ms is a 60Hz
// frame; the phone frame cap rewrites it once it has measured the screen
// (see the capHz block), because on a capped phone a HEALTHY frame is ~33ms
// by design. Judged against a raw 60Hz budget — which is what the fixed
// 22/30/45 thresholds below used to be — a capped phone permanently read as
// "struggling" and the pacer backed off to multi-frame waits: a district
// build that needs ~30s of CPU ran at a few percent duty and took MINUTES,
// so a rider was nearly always inside a build window and felt its every
// spike. Measured 2026-08-03 at 2400,6600: littleindia still building 45s
// after the arrival panel dropped, on a desktop CPU.
// Declared BEFORE streamRest for the same temporal-dead-zone reason as
// FAST0 below: Y() runs during module evaluation, and FPS_CAP is declared
// two thousand lines further down.
let CAP_REF = 16.7;
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
  // DECLARED HERE, NOT BESIDE THE OVERLAY THAT SETS IT. `let` has a temporal
  // dead zone: the world is built during module evaluation, so Y() reads this
  // flag before a declaration further down the file has run, and boot died with
  // a ReferenceError before __ready was ever set.
  const FAST0 = P.has('streamall') || P.has('nostream');
  let sliceT0 = performance.now();
  const Y = () => {
    const FAST = FAST0 || ARRIVING;
    // FINISH-FAST once the picture is already degraded. Measured 2026-08-03
    // riding into littleindia at 2400,6600: EVERY frame of the ride was
    // 380-430ms and the worst single build block only 135ms — the frames were
    // not being killed by build slices but by RENDERING THE HALF-BUILT
    // DISTRICT (thousands of raw meshes, merged only at the end), while this
    // pacer, reading those slow frames, backed off 8x and stretched the raw
    // window to minutes. A doom loop: the slower the frames, the longer the
    // district stays raw, the slower the frames. So past ~1.8x the render
    // budget the gentle pacing has already lost — the lesser evil is bigger
    // slices, single-frame waits, and a district that gets DONE.
    const FASTB = !FAST && FRAME_MS > CAP_REF * 1.8;
    if (performance.now() - sliceT0 < (FAST ? 20 : FASTB ? 16 : 6)) return Promise.resolve();
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
    // BUILD ONLY WHEN THERE IS ROOM TO BUILD.
    //
    // A CPU profile of the first nine seconds of RIDING has no idle time in it
    // at all: culling, the collision grid, matrix updates, audio startup and
    // the traffic all land on the same frames as the world build, and no single
    // one of them is the problem. Six separate loops were broken up before this
    // was understood, and the rider still felt ten seconds of stutter.
    //
    // So the builder now watches the frame rate and gets out of the way. Above
    // ~45fps it takes a frame as before; as frames get slower it waits more of
    // them, up to eight. The world finishes filling in a few seconds later and
    // the ride stays smooth, which is the trade worth making — nobody notices a
    // district arriving late, everybody notices the picture stuttering.
    // Judged against CAP_REF, the device's own render budget, not a raw
    // 60Hz frame — on a capped phone a healthy frame is ~33ms by design and
    // the old fixed 22/30/45 thresholds kept this permanently backed off.
    // Two bands only now: healthy frames get the gentle single-frame pacing,
    // mildly-over frames get one extra frame of air, and past 1.8x FASTB
    // (above) has already taken over — the old 4- and 8-frame backoffs are
    // gone because they were the doom loop's other half.
    let waits = 1;
    if (!FASTB && FRAME_MS > CAP_REF * 1.32) waits = 2;
    const p2 = (typeof document !== 'undefined' && document.visibilityState === 'visible')
      ? new Promise((r) => {
        let k = 0;
        const step = () => { if (++k >= waits) r(); else requestAnimationFrame(step); };
        requestAnimationFrame(step);
      })
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
  // THE CAP WAS UNDERCOUNTING BY ONE, AND THE ONE IT MISSED IS ORCHARD.
  //
  // This bounds `recs`, which is `mani.districts.slice(1)` — the STREAMED
  // districts. The FIRST district is built inline by buildRegion() straight
  // into `world`, not into a removable group, so it is not in recs, is not
  // counted here, and can never be unloaded. That district is orchard: 1,663
  // buildings and 3,019 roads, held for the whole life of the page no matter
  // where the rider goes.
  //
  // So "3 resident" was really FOUR. Measured on a phone profile arriving at
  // Chinatown: streamed [chinatown, marinasouth, keppel] = 3,569 buildings,
  // plus orchard = 5,232. The rider reported his iPhone crashing on exactly
  // that teleport, and iOS Safari reaps a tab far below what desktop Chrome
  // tolerates.
  //
  // DROPPING THE CAP TO 2 WAS TRIED AND REVERTED, MEASURED NOT ARGUED. On the
  // Chinatown arrival it evicted marinasouth — the SMALLEST district in the
  // world at 126 buildings — so the resident total fell only 5,232 -> 5,106,
  // 2.4%, while every phone paid for it in pop-in. A cap cannot fix this
  // because the thing that needs evicting is the one it cannot see.
  //
  // THE FIX IS TO MAKE THE SPAWN DISTRICT EVICTABLE: build it into its own
  // group the way addChunk() already builds every other district, so the
  // residency sweep can drop it and a teleport to Sentosa need not carry
  // Orchard across the island. That is a restructure of boot — buildRegion()
  // also does one-time region-wide work (the terrain mesh, the surround, the
  // water) that must NOT be unloaded with it — so it is written up in
  // HANDOFF.md rather than attempted next to a live crash.
  const MAX_RESIDENT = PHONE ? 3 : 99;
  // How many BUILDINGS may be resident at once on a phone. Desktop is
  // effectively unbounded.
  //
  // 2,600 was "chinatown plus a small neighbour" and the rider's iPhone still
  // died at Chinatown a few seconds after arrival — which is exactly when the
  // marinabay + marinasouth slices stream in on top of it. Measured on the
  // phone profile 2026-08-02: littleindia resident set (2,082 buildings)
  // = 206MB of geometry and SURVIVES on his phone; chinatown at 2,600
  // (2,415 buildings) = 231MB and dies. 2,300 makes chinatown resident ALONE
  // (~190MB, below the level his phone demonstrably tolerates) while still
  // letting littleindia+kallang (2,082) and every small-district trio fit.
  const RESIDENT_BUDGET = PHONE ? 2300 : 1e9;
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
    // A BUDGET, NOT A HEADCOUNT. Districts are not the same size, and the cap
    // counted them as if they were: three tiny ones and three enormous ones
    // both read as "3". Measured on a phone profile after the spawn district
    // became evictable, and it maps exactly onto what the rider reported still
    // crashing — "chinatown teleport there then crash. little india also":
    //
    //   chinatown    rivervalley + chinatown + keppel  = 4,171 buildings  CRASH
    //   littleindia  orchard + littleindia + kallang   = 4,005 buildings  CRASH
    //   marinaeast   kallang + marinaeast + tanjongrhu =   434 buildings  fine
    //
    // Both crashing cases are a huge district plus a huge neighbour; the happy
    // one is three small ones. So the constraint is WEIGHT, and the cap has to
    // measure weight. The district you are standing in is always kept however
    // big it is — there is nowhere else to be — and neighbours are admitted
    // nearest-first until the budget is gone.
    if (live.length > 1) {
      const kept = keptSet(live);
      for (const r of live) if (!kept.has(r)) { unloadChunk(r); n++; }
    }
    if (n) { window.__streamState.unloads += n; syncState(); }
  };
  const wt = (r) => (r.ch && r.ch.buildings ? r.ch.buildings.length : 0);
  // THE ONE RESIDENCY RULE, used by the sweep, by admission and by the
  // pre-build evict below — three call sites that MUST agree, because any two
  // of them disagreeing is an infinite build-evict churn (measured 2026-08-02:
  // keppel rebuilt 15+ times in 200s at Chinatown when the builder admitted by
  // headcount while the sweep evicted by weight). Nearest district is always
  // kept — there is nowhere else to be — then neighbours are admitted
  // nearest-first while the budget holds; the first that does not fit ends the
  // admission, exactly as the sweep has always done.
  // HOW FAR IS THIS DISTRICT'S OWN FABRIC from the rider — the honest
  // "which district is the rider actually in" measure. Box distance cannot
  // answer it (the boxes overlap by design, so at any seam two or three all
  // read 0) and axis distance answers the wrong question (measured
  // 2026-08-03 at Clarke Quay, 1500,8200: chinatown's axis was nearer than
  // rivervalley's own, so the budget kept chinatown's 2,239 buildings and
  // left the ground AROUND THE RIDER bare — the rider's "back streets weird
  // / empty patches" report, in every seam zone). Sampled every Nth
  // footprint (~120 checks per district), first ring vertex is plenty at
  // this scale.
  const contentNear = (rec) => {
    const B = rec.ch && rec.ch.buildings;
    if (!B || !B.length) return axDist(rec);
    const stride = Math.max(1, Math.floor(B.length / 120));
    let best = Infinity;
    for (let i = 0; i < B.length; i += stride) {
      const v = B[i].p && B[i].p[0];
      if (!v) continue;
      const d = (v[0] - px()) ** 2 + (v[1] - pz()) ** 2;
      if (d < best) best = d;
    }
    return best === Infinity ? axDist(rec) : Math.sqrt(best);
  };
  const keptSet = (list) => {
    // Rank by the district's own CONTENT distance (see contentNear above),
    // axis as tiebreak. One rule, shared by sweep/admission/pre-evict as
    // before — the churn-fix invariant holds.
    const sorted = list.slice().sort((a, b) => (contentNear(a) - contentNear(b)) || (axDist(a) - axDist(b)));
    const kept = new Set();
    let load = 0;
    for (const r of sorted) {
      if (kept.size === 0 || (kept.size < MAX_RESIDENT && load + wt(r) <= RESIDENT_BUDGET)) {
        load += wt(r); kept.add(r);
      } else break;
    }
    return kept;
  };
  // THE BUILDER MUST ASK THE EVICTOR'S QUESTION BEFORE BUILDING. The weight
  // budget above landed in evict() alone while the build loop kept admitting
  // candidates by headcount — so standing at Chinatown, the loop built keppel
  // (~12s of geometry), the sweep threw it straight back out (2,281 + 890 over
  // budget), and the builder queued it again: an infinite build-evict churn
  // allocating and freeing a whole district every dozen seconds for the life
  // of the page. Measured 2026-08-02 on the phone profile: keppel rebuilt 15+
  // times in 200s with the rider standing still. That churn is what the rider
  // reported as "chinatown / littleindia still crash" — both stand beside a
  // neighbour that can never fit (2,281+890 and 1,663+1,041), while
  // marinaeast's three small neighbours all fit and never thrashed.
  //
  // wouldKeep answers "if this candidate were built right now, would the
  // sweep keep it?" by running the sweep's own keptSet, so the two can never
  // disagree. The nearest district is always admitted, which is what lets an
  // arrival displace the over-budget district it is leaving behind.
  const wouldKeep = (c) => {
    if (ALL) return true;
    return keptSet(recs.filter((r) => r.group).concat(c)).has(c);
  };
  // A SIGNAL FOR "THE NEIGHBOURHOOD IS UP". The loading screen used to come
  // off with none of these built, and the first thing the rider did was ride
  // into a district that then built underneath them. Boot waits on this.
  let settle = null;
  window.__streamSettled = new Promise((r) => { settle = r; });
  const settled = () => { if (settle) { const f = settle; settle = null; f(); } };
  for (;;) {
    evict();
    let cand = recs.filter((r) => !r.group);
    if (!ALL) cand = cand.filter((r) => nearDist(r) < NEAR);
    // Never exceed the ceiling by building: if the resident set is already at
    // the cap, the nearest candidate has to wait for something to leave.
    if (!ALL && recs.filter((r) => r.group).length >= MAX_RESIDENT) cand = [];
    // ...and never build what the sweep would immediately evict (see wouldKeep).
    cand = cand.filter(wouldKeep);
    if (cand.length) {
      window.__streamIdle = false;
      // Nearest content first; where two districts both contain you (the
      // bboxes overlap by design so the region closes with no seam holes)
      // both measure zero, so break the tie on whose main street you are
      // actually near — that is the one you are looking down.
      cand.sort((a, b) => (contentNear(a) - contentNear(b)) || (axDist(a) - axDist(b)));
      const next = cand[0];
      // EVICT THE DOOMED BEFORE BUILDING THE ADMITTED. wouldKeep() says the
      // sweep will keep `next` — but the sweep only runs at the TOP of this
      // loop, AFTER the build. Riding from chinatown into littleindia, that
      // ordering held both fully built at once (2,239 + 1,890 buildings) for
      // the length of a build: a ~380MB transient on exactly the border a
      // rider crosses, while a teleport never sees it because the far district
      // is past FAR and drops first. The rider's report was the measurement:
      // teleports survived, "play a while" died. So run the sweep's own
      // simulation WITH the newcomer and unload whatever it would drop, before
      // the newcomer allocates anything.
      if (!ALL) {
        const kept = keptSet(recs.filter((r) => r.group).concat(next));
        let dropped = 0;
        for (const r of recs) {
          if (r.group && !kept.has(r)) { unloadChunk(r); dropped++; }
        }
        if (dropped) { window.__streamState.unloads += dropped; syncState(); }
      }
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
    if (ALL) { syncState(); settled(); window.__streamIdle = true; return; }
    settled();
    // NOTHING LEFT WITHIN REACH THAT THIS DEVICE IS ALLOWED TO HOLD. Arrivals
    // wait on this rather than on "every district containing me is built":
    // the district boxes overlap by design, and a phone caps residency at
    // three, so standing where four boxes meet made that test unsatisfiable
    // and the arrival panel timed out instead of clearing.
    window.__streamIdle = true;
    await new Promise((r) => setTimeout(r, 1500));
  }
}
// SMOOTH THE MAPPED LINES ONCE, BEFORE ANYTHING READS THEM.
//
// The owner, 2026-08-05: "alot of walking paths or roads maybe the kerbs not
// even smooth all jagged", with a frame of the Siloso boardwalk zigzagging
// under his feet.
//
// The ribbon builder was not the bug — it mitres its joints correctly and has
// done since it was written. It was tracing a jagged line faithfully. OSM
// digitises a kerb by clicking along an aerial photo, so a gently curving path
// arrives as a run of one-to-three metre segments each a few degrees off its
// neighbour, and at walking height that reads as a sawtooth.
//
// This belongs HERE and not inside ribbon(), because the road surface is not
// the only thing that follows the line: the kerbs, lamps, markings, furniture
// and the collision grid all read `r.p` independently. Smoothing inside the
// ribbon would have floated a smooth road inside its own jagged kerbs, which
// is worse than the defect. One line, smoothed once, and everything downstream
// agrees by construction.
//
// SENTOSA.md allows this explicitly and bounds it: "the curve between them may
// be smoothed ... up to 8m lateral. Past that it is a re-route." The cut is at
// most 6m even for the rail line, and the corner is replaced with a quadratic
// through it, so the curve never leaves the triangle of the corner it rounds.
//
// ENDPOINTS ARE NEVER MOVED. Junctions are endpoint-to-endpoint in this data
// and navcheck's whole reachability model rests on them, so the first and last
// point of every way come through untouched.
function smoothLine(p, maxCut) {
  if (!p || p.length < 3) return null;
  const out = [p[0]], src = [0];
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1], v = p[i], c = p[i + 1];
    let ax = v[0] - a[0], az = v[1] - a[1];
    let cx = c[0] - v[0], cz = c[1] - v[1];
    const la = Math.hypot(ax, az), lc = Math.hypot(cx, cz);
    if (la < 0.05 || lc < 0.05) { out.push(v); src.push(i); continue; }
    ax /= la; az /= la; cx /= lc; cz /= lc;
    const dot = Math.max(-1, Math.min(1, ax * cx + az * cz));
    const turn = Math.acos(dot);
    // under about four degrees there is nothing to round, and rounding it
    // would only cost vertices
    if (turn < 0.07) { out.push(v); src.push(i); continue; }
    // never eat more than 40% of either neighbouring segment, so two corners
    // in a row cannot consume the straight between them
    const t = Math.min(maxCut, la * 0.4, lc * 0.4);
    const A = [v[0] - ax * t, v[1] - az * t], sA = i - t / la;
    const B = [v[0] + cx * t, v[1] + cz * t], sB = i + t / lc;
    const N = turn > 1.2 ? 6 : turn > 0.5 ? 4 : 3;
    out.push(A); src.push(sA);
    for (let k = 1; k < N; k++) {
      const s = k / N, u = 1 - s;
      out.push([u * u * A[0] + 2 * u * s * v[0] + s * s * B[0],
                u * u * A[1] + 2 * u * s * v[1] + s * s * B[1]]);
      src.push(sA + (sB - sA) * s);
    }
    out.push(B); src.push(sB);
  }
  out.push(p[p.length - 1]); src.push(p.length - 1);
  return { p: out, src };
}

// Resample a per-vertex array (the monorail's fitted height profile) onto the
// smoothed line, so a smoothed way cannot part company with its own heights.
function resampleAt(vals, src) {
  return src.map((s) => {
    const i = Math.max(0, Math.min(vals.length - 2, Math.floor(s)));
    const f = Math.max(0, Math.min(1, s - i));
    return vals[i] + (vals[i + 1] - vals[i]) * f;
  });
}

function smoothWays(data) {
  const len = (p) => {
    let L = 0;
    for (let i = 0; i < p.length - 1; i++) L += Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
    return L;
  };
  let ways = 0, before = 0, after = 0;
  for (const r of (data.roads || [])) {
    if (!r.p || r.p.length < 3) continue;
    // A footway turns tighter than a carriageway and a flight of steps is
    // meant to be angular, so the allowance follows what the way IS.
    const cut = r.k === 'steps' ? 0
      : (r.k === 'footway' || r.k === 'pedestrian') ? 1.6
      : Math.min(3.0, Math.max(1.2, (r.w || 7) * 0.35));
    if (!cut) continue;
    const s = smoothLine(r.p, cut);
    if (!s) continue;
    before += len(r.p); after += len(s.p);
    r.p = s.p; ways++;
  }
  // The rail line takes the widest allowance it is allowed: a monorail has the
  // largest turning radius of anything on the island, and its guideway is the
  // one structure a player sees end to end from a distance.
  for (const seg of (data.monorail || [])) {
    if (!seg.p || seg.p.length < 3) continue;
    const s = smoothLine(seg.p, 6);
    if (!s) continue;
    if (Array.isArray(seg.ys) && seg.ys.length === seg.p.length) seg.ys = resampleAt(seg.ys, s.src);
    seg.p = s.p; ways++;
  }
  return { ways, lengthDelta: before ? +((after - before) / before * 100).toFixed(2) : 0 };
}

async function buildRegion(data, opts = {}) {
  // A FRESH SIGN ATLAS PER REGION BUILD. The shared atlas hands out materials
  // that belong to THIS scene's textures; carrying them into a second build
  // would hand out materials whose textures went with the old scene, and the
  // signs would silently draw as nothing. Resetting here is also never worse
  // than the old behaviour — that was one atlas per CALL SITE per build, this
  // is one per build — so a streamed multi-region world is unaffected.
  resetSignAtlas();
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
  // Before terrain.carve, before the ribbons, before the kerbs — see smoothWays.
  if (!P.has('nosmooth')) {
    const sm = smoothWays(data);
    window.__smoothStats = sm;
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
  if (!SKID && !P.has('noskid')) {
    SKID = new SkidMarks(THREE, scene);
    window.__skid = SKID;
  }
  // the audit needs the same notion of 'ground' the world uses: on a bridge
  // that is the DECK, not the seabed under it
  window.__bridgeDeckAt = bridgeDeckAt;
  // Carriageway OR footway deck. W2 only — never used to seat a rider.
  window.__anyDeckAt = anyDeckAt;
  // every deck over a point, for D2 — see bridgeDecksAt in city.js
  window.__bridgeDecksAt = bridgeDecksAt;
  indexBuildings(opts.regionData || data);

  // The road index is built FIRST. Buildings carry structural pieces — entrance
  // canopies, colonnades, the tree columns under ION's shell — that are placed
  // by offsets from a facade and have to be tested against the carriageways as
  // they are created. Building it after buildBuildings meant every one of those
  // tests silently answered "not in a road", and 59 six-metre columns ended up
  // standing in the street, including the row you meet at the spawn point.
  ROADIX = buildRoadIndex(opts.regionData || data, data.axis || null);
  window.__onRoad = (x, z, m, ex) => ROADIX.onRoad(x, z, m || 0, ex || null);
  // ...and the footways, for the surface model. See surfaceKindAt().
  PATHIX = buildRoadIndex(opts.regionData || data, null, { paths: true });
  window.__onPath = (x, z, m) => PATHIX.onRoad(x, z, m || 0, null);
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
  // the same question asked from a stated height, which is the only way to see
  // whether a raised deck is being offered to someone who could not reach it
  window.__surfaceAtFrom = (x, z, fromY, seat) => surfaceAt(x, z, fromY, seat);
  window.__footbridgeIdOf = (pts) => footbridgeIdOf(pts);
  window.__inFootprint = (x, z) => inFootprint(x, z);
  // the solidity test the ride and the walker actually use, so a check can ask
  // the same question they do rather than a lookalike
  // D9 asks whether the RIDE can get down the street, so it gets the ride question
window.__blocked = (x, z) => rideBlocked(x, z);   // movement, arcades open
// THE WALKER DOES NOT USE `__blocked`, AND EVERY CHECK ASSUMED IT DID.
//
// The owner, 2026-08-06: "sensory scape there got things in the middle of the
// road blocking and i stuck inside. bro how come so obvious defects and bugs u
// never catch?" — because `window.__blocked` is `rideBlocked`, the RIDE's
// test, and a person on foot is governed by `moveBlocked`, which was not
// exposed at all. Every probe run that day, and data/trailcheck.mjs itself,
// asked the wrong function and got a clean answer.
//
// The two differ exactly where he got stuck: moveBlocked opens ARCADES and
// treats open-ground storeys via SOLID, so a walker and a ride disagree about
// what is solid. A gate that cannot see what the player sees is not a gate.
window.__moveBlocked = (x, z) => moveBlocked(x, z);
// the swim checks read the player's own state — mode, sub-state, seat;
// in ride mode the position reported is the VEHICLE's, which is the player
window.__walkState = () => (mode === 'ride'
  ? { mode, swim: false, x: S.x, z: S.z, y: null, speed: S.speed }
  : { mode, swim: !!walker.swim,
      x: walker.x, z: walker.z, y: walker.y, speed: walker.speed });
window.__seaDepthAt = (x, z) => seaDepthAt(x, z);
// open-sided ground storeys (Beach Arrival Plaza), for B5's exemption
window.__openGround = (x, z) => openGroundAt(x, z);
// building footprints only, for the occlusion-ceiling measurement
window.__blockedAt = (x, z) => blocked(x, z);
// GEOMETRY ONLY — the rasterised wall grid, with none of the movement rules
// layered on top. `blocked` and `rideBlocked` both answer "may the ride be
// here", and their answer over the sea is YES IT IS A WALL, which is correct
// for a scooter and nonsense for a camera: the chase camera hangs over water
// on every causeway, groyne and pier on the island. Asking them shortened the
// boom at four of the thirteen golden spots for nothing (measured 2026-08-05).
window.__solidAt = (x, z) => (SOLID ? SOLID.at(x, z) : false);
// Which cells the open-ground-storey carve has opened. A probe needs this to
// tell "we deliberately opened this footprint" from "this wall was never
// registered as solid at all" — two different bugs with one symptom.
window.__openGroundAt = (x, z) => openGroundAt(x, z);
window.__openGroundPolys = () => openGroundPolys();
// The RAW TERRAIN height, which is what the collision grid measures its
// waist-height band against — as distinct from __surfaceAt, which is the
// surface a player actually stands on (a deck, a podium, a bridge). A probe
// needs both to see where those two disagree.
window.__terrainAt = (x, z) => terrain.at(x, z);
// The root the collision grid is built from. A drawn mesh that is not under
// this is scenery no matter how solid it looks.
window.__world = world;
// Rebuild the collision grid on demand. A probe uses this to tell a grid that
// was built BEFORE some geometry existed from a grid that saw the geometry and
// failed to register it — two very different bugs with one symptom.
window.__rebuildSolid = async () => {
  if (!SOLID) return null;
  SOLID.g.clear();
  return await SOLID.build(world, (x, z) => terrain.at(x, z));
};
// THE MATERIAL TABLE, for probes that need to tell one merged layer from
// another. consolidate re-merges the named layers into tileBatch meshes and
// the NAME does not survive — so a check written against mesh.name reports a
// clean island (paintcheck learned this), and a check written against "white
// with a map" catches the road markings and the zebra crossings along with the
// paving it meant (2026-08-05). Material IDENTITY survives both merges, so a
// probe can compare `mesh.material.map === window.__MAT.paving.map` and get
// exactly the layer it asked for.
window.__MAT = MAT;
window.__placeBlocked = (x, z) => blocked(x, z);
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
  //
  // PER-DISTRICT SPAWN OVERRIDE (Sentosa game, 2026-08-03). The axis midpoint
  // is a fine default for a street district, but sentosa's axis is the Gateway
  // BRIDGE — arriving mid-bridge sells nothing. Each entry is a target point
  // (Beach Station for sentosa, the owner's pick); the spawn snaps to the
  // nearest carriageway point within 80m of it, so a data re-fetch moves the
  // road and the spawn follows it instead of going stale. No road in reach
  // falls through to the axis midpoint, so a broken table cannot break a boot.
  // Siloso Beach, not Beach Station (owner rode it 2026-08-03: "doesnt even
  // look like the beach station... change to start at siloso beach") — the
  // station is a junction under a viaduct; the beach walk sells sand and sea
  // at frame one. Snaps to Siloso Beach Walk's carriageway.
  // MEASURED CLEAR, NOT GUESSED (the first Siloso point snapped beside
  // AltitudeX and the owner spawned pinned by its collision — "load alr
  // cannot even move"): this one probes 12/12 open directions at 6m, on the
  // beach walk with sand on one side and the strip on the other.
  // PALAWAN BEACH WALK, not Siloso (owner, 2026-08-05: "can we start at like
  // palawan beach when the game load in?"). Same bar the Siloso point was held
  // to and for the same reason — a spawn chosen by eye once landed against
  // AltitudeX's collision and he could not move at all. This one is measured:
  // it snaps to Palawan Beach Walk, a real 3.5m+ carriageway, probes 12/12 open
  // directions at 6m, and the heading the road gives it looks down an avenue of
  // palms with the sea ahead. The other way along the same road faces inland
  // service buildings, which is why the direction is not left to chance.
  // THE HEADING NO LONGER COMES FROM THE ROAD, AND THE REASON IS THAT THE
  // THINGS IT WAS CHOSEN AGAINST DID NOT EXIST YET.
  //
  // The road heading looks WNW-ESE down Palawan Beach Walk, and the comment
  // above is true: it is an avenue of palms with the sea ahead, and since the
  // palm avenue was authored it is finally true in the world as well as on
  // paper. But it was picked when the only things at Palawan were a road, a
  // beach and a 25 m mast that turned out to be a lifeguard hut. The two
  // objects `research/palawan-spawn.md` §2 calls the ones that make the frame
  // "unmistakably Palawan" — the suspension bridge at 204° / 118 m and the
  // twin viewing towers at 207° / 189 m — are now BUILT, and both sit about
  // 46° off the road.
  //
  // Vetted, not reasoned: four frames from this exact point, at the road
  // heading and at 185/195/205°. The road frame is a grey carriageway filling
  // the lower half with trees either side — a good frame that could be any
  // coast road anywhere. At 205° the opening shot holds the lagoon, the
  // islet, both viewing towers, the rock groyne, the loungers, the lifeguard
  // hut and a readable PALAWAN BEACH sign. 195° is the same frame with the
  // sign cut off at the edge, which is the one thing in it that NAMES the
  // place. The first frame's job is to say where you are.
  //
  // Bearing, not radians, because that is what the research quotes and what
  // anyone re-deciding this will be holding: heading = pi - bearing, since
  // the ride's forward is (sin h, cos h) and +z runs south.
  const SPAWNS = { sentosa: [-1241.7, 12973] };
  const SPAWN_BEARING = { sentosa: 205 };
  let spawnDone = false;
  const want = SPAWNS[SCENE];
  if (want && Array.isArray(data.roads)) {
    let bx = 0, bz = 0, bh = 0, bd = 80 * 80;
    for (const r of data.roads) {
      const pts = r.p;
      if (!pts || pts.length < 2 || (r.w || 0) < 3.5) continue;  // carriageways only
      for (let i = 0; i < pts.length - 1; i++) {
        const ax = pts[i][0], az = pts[i][1];
        const dx = pts[i + 1][0] - ax, dz = pts[i + 1][1] - az;
        const L2 = dx * dx + dz * dz;
        if (!L2) continue;
        const t = Math.max(0, Math.min(1, ((want[0] - ax) * dx + (want[1] - az) * dz) / L2));
        const px = ax + dx * t, pz = az + dz * t;
        const d2 = (px - want[0]) ** 2 + (pz - want[1]) ** 2;
        if (d2 < bd) { bd = d2; bx = px; bz = pz; bh = Math.atan2(dx, dz); }
      }
    }
    if (bd < 80 * 80) {
      // the POSITION still comes from the road — it is what keeps the spawn on
      // a real carriageway with 12/12 open directions, and moving it by eye is
      // what once pinned the rider against AltitudeX's collision
      const brg = SPAWN_BEARING[SCENE];
      if (brg != null) bh = Math.PI - brg * Math.PI / 180;
      S = newState(bx, bz, bh); spawnDone = true;
    }
  }
  if (!spawnDone && data.axis && data.axis.p.length > 1) {
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
  if (!P.has('nowater')) buildPiers(world, data);
  if (!P.has('nowater')) {
    // A LAGOON WITH AN ISLAND IN IT. `hp` carries a water body's inner rings —
    // see data/relparcels.py, which refused three of them outright until the
    // layer could hold a hole. Passed through as the ring plus its holes so
    // waterFloor can say "not here" inside one.
    const wsrc = ((opts.regionData || data).water || []);
    const wrings = wsrc.map((w) => w.p);
    const wholes = wsrc.map((w) => w.hp || null);
    setWater(wrings, wholes);
    // The terrain mesh is cut for the water BEFORE it is built, so the
    // riverbed exists in the geometry rather than being hidden by it.
    // See setWaterRings() in terrain.js for why the grid cannot do this.
    terrain.setWaterRings(wrings, wholes);
  }
  bmark('setup+water');

  await bstep(0.09, `raising ${(data.buildings || []).length.toLocaleString()} buildings`);
  const bs = P.has('nobuild') ? { count: 0, tall: 0 } : await buildBuildings(world, data);
  bmark('buildings');
  // PLANTING GETS ITS OWN STREAM, SO WHAT IS BUILT CANNOT MOVE A TREE.
  //
  // The placement stream is module-level, so everything built after a building
  // draws from wherever that building left the cursor — change ONE record and
  // the whole island re-rolls. Measured 2026-08-14: a `con` flag on one 832 m2
  // footprint moved 20 of 24 golden frames, `spawn` by 18.01%, with the trunk
  // count IDENTICAL at 18,351 — a relocation, not a loss. `?reseed` already
  // fires, but before buildBuildings, so it buys district order-independence
  // and not this.
  //
  // With this line: 20 frames -> 4, and the ones that mattered go to zero —
  // spawn 18.01% -> 0.000%, serapong 19.28% -> 0.000%, sensoryscape 11.97% ->
  // 0.000%, siloso-letters 9.97% -> 0.000%.
  //
  // IT IS NOT COMPLETE ISOLATION AND THE HANDOVER SHOULD NOT PROMISE ONE.
  // Two modes: OFFSET, which this fixes, and DIVERGENCE — a tree near an edit
  // accepted or rejected differently by TreeField.add()'s guards puts the
  // stream out of step for everything planted after it, and no reseed reaches
  // that because it starts downstream. Measured: reseeding here and reseeding
  // just before plantSurveyed leave the IDENTICAL four residuals to three
  // decimals, which is what proves the residue is not an offset. The end state
  // is per-tree randomness from a POSITION HASH, the technique city.js already
  // argues for at the leaf cards.
  //
  // Shipped 2026-08-14 on the owner's call, as its own batch, with all 24
  // baselines re-vetted frame by frame and re-blessed.
  {
    let ph = 0x504c414e;                       // 'PLAN'
    for (const ch of SCENE) ph = (Math.imul(ph, 31) + ch.charCodeAt(0)) >>> 0;
    reseedPlacement(ph);
  }
  // one sweep over what the building pass just added, before any street
  // furniture exists, so the scope is exactly "buildings and landmarks"
  const pruned = await pruneCarriageway(world, ROADIX.onRoad, (x, z) => terrain.at(x, z));
  await bstep(0.23, `laying ${(data.roads || []).length.toLocaleString()} roads`);
  const fallbackAxis = await buildRoads(world, data);
  bmark('roads');
  const axis = data.axis || fallbackAxis;
  if (!data.axis && fallbackAxis) {
    // no stitched axis in the file, so re-index now that we have one
    ROADIX = buildRoadIndex(data, fallbackAxis);
  }

  // the ground itself, from the heightfield
  // vertexColors so the ground can carry its own green space — see setGreen()
  // in terrain.js. White vertices leave this colour exactly as it was.
  // 0x9a9384 was a WARM SAND, and every land tint in terrain.js MULTIPLIES it
  // downward — so the brightest surface anywhere in the world was the ground we
  // know least about, and it read as desert. Central Singapore has essentially
  // no bare earth in it: the interstitial ground between mapped things is
  // concrete apron, tarmac and mown grass. A cool neutral lets the tinted
  // surfaces stay tinted and lets the unknown recede, which is the right way
  // round. See the matching change to the untinted vertex in terrain.js.
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x9d9e99, roughness: 0.95, vertexColors: true,
  });
  // THE GROUND HAD NO TEXTURE AT ALL — one flat colour per vertex tint across
  // the whole island. Every probe of a "big blank untextured mass" in a vet
  // shot came back as this material (`#9d9e99 no-map`), and on Sentosa that is
  // most of what you look at: the reclaimed Cove platform, the beaches, the
  // golf, every apron. Flat colour over a large area reads as plastic, and it
  // was being mistaken for a modelling bug repeatedly, including by me.
  //
  // The terrain carries only position and colour — no UVs, and adding a UV
  // attribute to 493k vertices to hang a texture on is memory this world does
  // not have to spend. So the detail is generated in the shader from WORLD
  // POSITION instead: one smooth octave for cloudy variation at ~10m and one
  // cheap blocky octave for grain underfoot. It costs five hash evaluations
  // per ground pixel and nothing at all in memory or geometry, and being
  // position-keyed it is deterministic and identical on every device.
  groundMat.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec3 vGPos;\n' + sh.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n  vGPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vGPos;\n'
      + 'float gHash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }\n'
      + 'float gNoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);\n'
      + '  return mix(mix(gHash(i),gHash(i+vec2(1,0)),f.x), mix(gHash(i+vec2(0,1)),gHash(i+vec2(1,1)),f.x), f.y); }\n'
      + sh.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          // BRIGHTNESS ALONE IS NOT TEXTURE. The first version modulated only
          // value, by +-7%, and every vet frame still came back reading as flat
          // plastic — because real ground varies in HUE across a few metres
          // (sun-bleached and yellow here, damp and blue-green in shade there)
          // far more than it varies in lightness. Three scales, because one
          // frequency is a pattern and three is a surface:
          vec2 gp = vGPos.xz;
          float broad = gNoise(gp * 0.035);            // ~30m, which patch of ground
          float mid   = gNoise(gp * 0.22);             // ~4.5m, clumping
          float fine  = gHash(floor(gp * 2.2));        // underfoot grain
          // value: widened from 0.15 to a range that survives being looked at
          diffuseColor.rgb *= 0.82 + 0.22 * broad + 0.10 * mid + 0.05 * fine;
          // hue: warm and dry where broad is high, cool and lush where it is
          // low. Applied as a tint on the existing vertex colour so beach, road
          // apron and canopy floor each shift around their OWN colour instead
          // of all drifting toward one shared brown.
          vec3 warm = vec3(1.09, 1.02, 0.86);
          // ...AND ON SAND THE COOL END IS A GREEN FILTER. THIS IS WHY THE
          // BEACHES KEPT COMING BACK GREEN.
          //
          // The owner has reported greenish sand three times. Twice it was
          // chased in terrain.js -- the back-beach fade, then the coarse
          // sea-distance ruler -- and both were real and both were fixed, and
          // the beach was still olive. Measured 2026-08-18, and the two halves
          // disagree, which is the whole answer:
          //
          //   the sand's VERTEX colour   Siloso 0.90 / 0.80 / 0.63   R > G > B
          //   the sand's DRAWN pixel     #909174                     G >= R
          //
          // A correct warm tan goes in and an olive comes out, so nothing
          // upstream of here could ever have fixed it. The cool end multiplies red
          // by 0.88 and green by 1.00: on anything already green that is a
          // damp shadow, and on a tan it is enough to push green PAST red and
          // change the hue outright. (0.90,0.80,0.63) * cool = (0.79,0.80,0.57)
          // -- which is the measured pixel, near enough to name it.
          //
          // The comment above says this shifts each surface "around its OWN
          // colour". For value it does; for hue it never did -- one hue
          // rotation applied to every surface is not the same as each surface
          // varying around itself, and sand is where that shows.
          //
          // So the cool end keeps its coolness and gives up its hue on ground
          // that is sand-coloured, judged from the vertex colour the shader is
          // already handed: a tan has red well above blue, and mown grass, wet
          // apron, tarmac and the pale unknown fallback all sit under 0.08.
          // Timber decking crosses it too, and should -- a boardwalk has no
          // more business going green than the beach it crosses.
          float sandish = smoothstep(0.09, 0.20, vColor.r - vColor.b);
          vec3 cool = mix(vec3(0.88, 1.00, 0.90), vec3(0.93, 0.93, 0.91), sandish);
          diffuseColor.rgb *= mix(cool, warm, smoothstep(0.25, 0.75, broad * 0.65 + mid * 0.35));
        }`);
  };
  await bstep(0.31, 'shaping the ground');
  // EVERY district's green, not just the spawn one: the ground mesh is built
  // once for the whole region, so it has to know about all of it up front.
  {
    const allGreen = [];
    // COVERED GROUND IS PAVED, NOT MOWN.
    //
    // The 2026-08-07 walksweep frame at Beach Arrival Plaza is a forest of
    // columns under a soffit standing on LAWN — grass indoors, at the arrival
    // hall a player walks through to reach the beaches. The ground under a
    // building's open ground storey or a canopy falls through to the
    // green-island fallback, which is a mown pale sage, because nothing ever
    // told the ground it was inside.
    //
    //     open ground storeys   13, 37,222 m2   (Beach Arrival Plaza,
    //                                            Quayside Isle, The Galleria…)
    //     canopies              32, 36,809 m2
    //
    // `plaza` is a tint terrain.js already carries, so this is not a new
    // surface — it is the existing paved class applied where the map says
    // there is a roof overhead.
    //
    // PUSHED INTO `allGreen` AND NOT INTO `data.green`, deliberately. The
    // planting's `claimed` list reads data.green directly, so writing there
    // would silently move thousands of trees; this array only ever reaches
    // setGreen, which paints. One effect, not two.
    let paved = 0;
    for (const b of (data.buildings || [])) {
      if (!b.p || b.p.length < 3) continue;
      if (!(b.og || b.bt === 'roof' || b.roof)) continue;
      allGreen.push({ k: 'plaza', p: b.p });
      paved++;
    }
    window.__pavedCovered = paved;
    // ...AND FIRST IN THE LIST, WHICH IS THE WHOLE FIX. `greenAt` returns the
    // FIRST polygon in a cell that contains the point, so appending these at
    // the end put them behind the landuse parcel that already covers the same
    // ground — Beach Arrival Plaza sits inside a `comm` parcel, so the paint
    // never once ran. A covered floor is the most specific statement anyone
    // makes about that ground; it goes in front.
    if (data.green) allGreen.push(...data.green);
    if (data.land) allGreen.push(...data.land);
    if (window.__allGreen) allGreen.push(...window.__allGreen);
    terrain.setGreen(allGreen);
    // and what is growing over it, so the floor under the jungle is painted as
    // jungle rather than as the lawn the landuse fallback assumes
    terrain.setCanopy(data.trees || []);
    // the coastline, so vertexY can tell a sloppy water-polygon edge on the
    // island from genuine open sea — see the guard in terrain.js vertexY
    terrain.setIsland(data.islandRing || null, data.roads, data.green, data.land);
  }
  world.add(terrain.build(groundMat));
  bmark('terrain');
  // no apron: it overlapped the heightfield and doubled the shading cost across
  // the whole screen. The grid is padded 90m beyond the sampled roads already.

  // the city beyond the fetched box, so the district does not end in a plain
  // WATER BEFORE THE SURROUND, so the surround's grey massing can be kept out
  // of the bay rather than built across it.
  await bstep(0.34, 'raising the skyline');
  const trees2 = P.has('notowers') ? { supertrees: 0 } : buildSupertrees(world, data);
  // ...and every tower the grove test did not claim. On Sentosa that is all
  // twelve of them: D39 has been reporting the layer as written-but-never-drawn
  // since the island was built. See buildTowers in city.js.
  if (!P.has('notowers')) statAdd(buildTowers(world, data, null));
  if (!P.has('notowers')) buildCranes(world, data);
  const surveyed = P.has('nofoliage') ? { surveyedTrees: 0 } : await plantSurveyed(world, data, place);
  // SUB-MARKS, because this phase had none and its name is a lie.
  //
  // 'surround' reads as "the city beyond the box" and that part costs 65ms.
  // Measured with the flags: the phase is 5,071ms and ?nofoliage takes it to
  // 278ms, so 94% of it is FOLIAGE, not surroundings. Splitting it here is the
  // same move that found the 10.3s buildTrails scan on 2026-08-04 — you cannot
  // fix what you have not separated.
  bmark('sur:plantSurveyed');
  // NOW SHADE THE FLOOR. The ground mesh was coloured before any of this ran, so
  // its canopy could only ever see `data.trees` — the surveyed ones — while
  // city.js invents thousands more. terrain.build() left the shade unapplied and
  // recorded each vertex's class; this is where it lands, with the full canopy.
  {
    const invented = window.__plantedTrees || [];
    const shaded = terrain.applyCanopy(invented);
    statAdd({ canopyInvented: invented.length, canopyShadedVerts: shaded });
  }
  bmark('sur:applyCanopy');
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
    // open the mapped walking routes that run through buildings
    if (data.arcades) { WALLS.carve(data.arcades); ARCADES = buildArcadeIndex(data.arcades); }
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
  if (!P.has('nofoliage')) for (const ax of axes) treeCount += await dressStreet(data, ax);
  bmark('dressStreet');
  const sideStreets = [];
  {
    const seen = new Set();
    for (const ax of axes) for (const r of selectSideStreets(data, ax)) {
      if (seen.has(r)) continue;
      seen.add(r); sideStreets.push(r);
    }
  }
  // NO BOOT FLEET WHEN THE BOOT CHUNK CARRIES NO ROADS.
  //
  // Every district now streams and brings its OWN traffic through addChunk, so
  // this must not also build one for the boot chunk — and once that chunk was
  // emptied it was building a 240-car fleet on Orchard Road from
  // `axisSpec(axis, data)` with `data.roads` EMPTY. Three symptoms, one cause,
  // all reported by the rider within minutes of it going live: "traffic
  // flowing backwards" (the spec that says which way each carriageway runs had
  // no roads to read), "vehicles hitting me alr" the moment Orchard loaded,
  // and "when i pass nearby a car i will stop" — a second, invisible fleet on
  // the same street that `trafficHits` was still testing against.
  // NO NPC VEHICLES. The owner, 2026-08-03: "remove all vehicles from my
  // world" — after no-pedestrians, the streets are now empty of everything
  // but the rider. Opt-IN via ?traffic, exactly the shape ?people has: the
  // whole system stays in the tree, stays correct behind the flag, and a
  // probe reporting "0 vehicles" is the INTENDED state, not a regression.
  // Do not change it back without the owner asking.
  if (P.has('traffic') && axis && (data.roads || []).length) {
    // Five lanes one way carrying 21 vehicles over 2,586m is a road at 4am.
    // ?cars= and ?buses= exist so the rider can test on his OWN phone whether
    // the traffic increase is what cost him the smooth start. Guessing from a
    // desktop pretending to be a phone has been wrong every time.
    const CARS = parseInt(P.get('cars') || '', 10), BUSES = parseInt(P.get('buses') || '', 10);
    // Sized from the boot axis's own length via fleetFor() — see its note.
    // The flat 240 here predated every district getting its own traffic, and
    // in a district SCENE the boot axis can be 851m (marinaeast), not
    // Orchard's 2.4km.
    let bootLen = 0;
    for (let i = 1; i < axis.p.length; i++) {
      bootLen += Math.hypot(axis.p[i][0] - axis.p[i - 1][0], axis.p[i][1] - axis.p[i - 1][1]);
    }
    const bf = fleetFor(bootLen);
    trafficSys = new Traffic(axis, Number.isFinite(CARS) ? CARS : bf.cars,
                             Number.isFinite(BUSES) ? BUSES : bf.buses,
                             axis && axisSpec(axis, data));
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
    // EVERY FLEET, not just the one the rider spawned in.
    //
    // This read `trafficSys.items` alone from the day district traffic landed,
    // so D34 and D35 have been auditing 272 vehicles out of about 630 — the
    // seven streamed districts drove entirely unwatched. It also returned `s`
    // as if it were a world coordinate: `s` is an arclength along ONE path, so
    // comparing a River Valley car's `s` with a Robertson car's is comparing
    // two rulers with different origins. Every item now says which fleet it
    // belongs to, so a check can tell when it may compare arclengths and when
    // it has to use the world.
    window.__trafficState = () => {
      const fleets = [trafficSys, ...(window.__extraTraffic || [])].filter(Boolean);
      const out = [];
      fleets.forEach((sys, fi) => {
        for (const it of (sys.items || [])) {
          out.push({
            kind: it.kind, x: it.wx, z: it.wz, lane: it.lane, dir: it.dir,
            heading: it.heading, speed: +it.speed.toFixed(2), s: +it.s.toFixed(1),
            fleet: fi,
          });
        }
      });
      return out;
    };
  }
  bmark('traffic');
  const furniture = {};
  let marks = 0; const side = {}; const sg = {}; const signage = {};
  const dressed = dressedStreets;
  // ONCE, NOT PER AXIS. buildParkedCars walks data.roads, which is the whole
  // scene — putting it inside the axis loop would build a full set of parked
  // cars for every main street in the region, stacked in the same bays. Exactly
  // the mistake the sweep made with trafficSys.build().
  // Parked cars are vehicles too — see the NO NPC VEHICLES note at the fleet.
  if (P.has('traffic') && !P.has('noparked')) {
    const pc = buildParkedCars(world, data, blocked);
    furniture.parked = pc.parked;
  }
  let axi = 0;
  for (const ax of axes) {
    await bstep(0.46 + 0.06 * Math.min(axi++, 2), `dressing ${ax.n || 'the streets'}`);
    if (!P.has('nofurniture')) {
      const f = await buildFurniture(world, ax, place, data);
      for (const k of Object.keys(f)) {
        if (Array.isArray(f[k])) furniture[k] = (furniture[k] || []).concat(f[k]);
        else furniture[k] = (furniture[k] || 0) + f[k];
      }
    }
    if (!P.has('nosigns')) {
      const g = await buildSignage(world, ax, data, place);
      for (const k of Object.keys(g)) signage[k] = (signage[k] || 0) + g[k];
    }
    if (!P.has('nomarks')) marks += await buildMarkings(world, ax, data);
      bmark('furniture+signage+markings');
    if (!P.has('noside')) {
      const t = await dressSideStreets(world, data, ax, place, TreeField, dressed);
      for (const k of Object.keys(t)) side[k] = (side[k] || 0) + t[k];
    }
    bmark('sideStreets');
    if (!P.has('nosg')) {
      const q = await buildSgDetail(world, ax, data, place);
      bmark('sgdetail');
      for (const k of Object.keys(q)) sg[k] = (sg[k] || 0) + q[k];
      const v = buildUssVocab(world, data, place);
      for (const k of Object.keys(v)) sg[k] = (sg[k] || 0) + v[k];
    }
  }
  // The transit geography: the Sentosa Express viaduct and the cable car
  // lines. Once per scene, not per axis — the layers are district-wide.
  if (!P.has('nosg') && (data.monorail || data.cableway)) {
    const q = await buildTransit(world, data);
    bmark('transit');
    for (const k of Object.keys(q)) sg[k] = (sg[k] || 0) + q[k];
  }
  // Beach life: palms, swim flags, patrol towers — Sentosa's postcard layer
  if (!P.has('nosg')) {
    const q = await buildBeachLife(world, data);
    bmark('beach');
    for (const k of Object.keys(q)) sg[k] = (sg[k] || 0) + q[k];
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
  // the map is now the travel interface, so a vet harness has to be able to
  // open it, read which pins survived clustering, and select one
  window.__wayfinder = wayfinder;
  window.__axis = axis;
  window.__roadList = data.roads.filter((r) => r.k !== 'footway' && r.k !== 'pedestrian');
  const people = crowdSys ? crowdSys.people.length : 0;

  stats = { surround, ...water, ...trees2, marks, laneCount: window.__laneCount, relief: data.terrain ? +Math.max(...data.terrain.h).toFixed(1) : 0, ...side, ...sg, realCrossings: window.__realCrossings, merged: bs.mergedMeshes, shophouses: bs.shophouses, zoneCrown: bs.zoneCrown || 0, badGeo: badGeoCount(), junctions: (furniture.signals || []).length, buildings: bs.count, bespoke: bs.bespoke, towers: bs.tall, roads: data.roads.length, people, trees: treeCount, ...surveyed, ...furniture, ...signage, ...shopf };
  // one pass over the finished district: share identical materials, then batch
  // small static meshes per 110m tile. See consolidate.js.
  // Solidity is rasterised from the finished district and BEFORE the meshes are
  // batched: after batching, one mesh spans a 110m tile and its geometry no
  // longer says where its walls are.
  await bstep(0.78, 'making the walls solid');
  if (!P.has('nosolid')) {
    const t0 = performance.now();
    SOLID = new Solid();
    // THE BAND IS MEASURED FROM THE SURFACE YOU WOULD BE STANDING ON, AND ON A
    // BRIDGE THAT IS NOT THE TERRAIN.
    //
    // D9 has reported "points on the main street centreline that are blocked"
    // for as long as it has existed, and on 2026-08-17 it was finally asked
    // WHERE and WHAT. Both answers are bad: the where is **Sentosa Gateway**,
    // the causeway that is the island's only road in, and the what — named cell
    // by cell with `?solidtrace=1` — is **`bridgePier`**, the causeway's own
    // piers. Measured across the carriageway at each blocked station, the road
    // is 4% to 48% clear and the widest gap is between **0.5m and 5.5m on an
    // 11.4m carriageway**. Three stations leave half a metre. The front door of
    // Sentosa was walled by the bridge that carries it.
    //
    // `Solid.build` marks a triangle that crosses the rider band, and it
    // measures that band against the height passed in here. Passing the TERRAIN
    // means a pier standing on the seabed at y=0 and reaching the deck at y=12
    // spans the band at its ANKLES — so its footprint is marked, and the rider
    // twelve metres above shares that 2D cell. The grid has no third dimension
    // to tell them apart, and `rideBlocked`'s own deck branch cannot help:
    // it says "over a deck, only real geometry stops you", and a pier is real
    // geometry. It is simply real geometry BELOW the deck.
    //
    // Measuring from the deck instead makes the arithmetic do the work the grid
    // cannot. Relative to a deck at 12, that pier spans -12..0, which is under
    // LOW and skipped; a parapet on the deck spans 0..1 and is still marked, as
    // it must be. Nothing is special-cased and no mesh is named — a pier is not
    // exempted, it is simply measured against the right datum.
    const solidGround = (x, z) => {
      const d = anyDeckAt(x, z);
      return d !== null ? d : terrain.at(x, z);
    };
    const st = await SOLID.build(world, solidGround,
                                 { trace: P.has('solidtrace') });
    // ...and again on the final grid: this one is what the player is tested
    // against, and a route carved only out of the early WALLS grid would be
    // open to the dressing pass and shut to the walker.
    const carved = data.arcades ? SOLID.carve(data.arcades) : 0;
    stats.arcadeCells = carved;
    // ...and then the walls we drew ourselves across mapped paths, which no
    // polygon-based pass can reach. Runs longer than SELFCARVE_MAX are left
    // blocked on purpose and counted here so they stay visible to a check.
    const self = unmappedWallRuns(data);
    stats.selfCarveCells = self.arcs.length ? SOLID.carve(self.arcs) : 0;
    stats.selfCarveRuns = self.kept;
    stats.selfCarveTooLong = self.tooLong;
    // ...AND THEN PUT THE COLUMNS BACK. Both carves above open corridors
    // through the grid, and neither can tell a column holding a building up
    // from a wall standing in a mapped route. The owner walked through one:
    // "at the initial load game place i go front why the building can pass
    // thru?" — under the Beach Arrival Plaza, whose ground storey is open on
    // purpose because Siloso Beach Walk runs beneath it.
    //
    // This is the honest fix rather than sealing the corridor, which is the
    // same call the bus-shelter blockages got: furniture may stand on a
    // pavement, but you must not walk through it. A column is 0.76m across and
    // the grid cell is 0.75m, so the centre plus its four sides is the whole
    // of it and nothing wider gets closed.
    let ogBack = 0;
    for (const [cx2, cz2] of (window.__ogCols || [])) {
      for (const [dx2, dz2] of [[0, 0], [0.38, 0], [-0.38, 0], [0, 0.38], [0, -0.38]]) {
        if (!SOLID.at(cx2 + dx2, cz2 + dz2)) ogBack++;
        SOLID.mark(cx2 + dx2, cz2 + dz2);
      }
    }
    stats.ogColumnsRestored = ogBack;
    stats.solidCells = SOLID.n; stats.solidWalls = st.walls;
    stats.solidMs = Math.round(solidMs0 + (performance.now() - t0));
    window.__solid = (x, z) => SOLID.at(x, z);
    window.__solidWhat = (x, z) => SOLID.what(x, z);
  }
  bmark('solid-grid');

  const RAW = P.has('raw');       // audit mode: leave objects unbatched
  await bstep(0.84, 'packing the city');
  const dedupe = RAW ? { before: 0, after: 0 } : dedupeMaterials(world);
  // THE CHEAP SHADER, ON EVERY DEVICE, AND THAT IS THE POINT.
  //
  // It was written phone-only at first. The rider asked whether desktop should
  // match — "if change should change desktop also to make everything same?" —
  // and he is right, for a reason that is not consistency. EVERY GATE AND
  // EVERY VET FRAME IN THIS PROJECT RUNS ON DESKTOP. A phone-only visual path
  // means nothing ever checks the picture the rider actually sees, which is
  // precisely how the world scene came to measure only Orchard's shopfronts
  // and only Orchard's street lighting. Same look everywhere, so what is
  // checked is what ships. ?rich restores the old picture for an A/B.
  if (!P.has('rich') && !RAW) {
    const lam = lambertise(world, THREE);
    window.__lam = lam;
    if (window.__stats) Object.assign(window.__stats, lam);
  }
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
    // What the compact instance store actually caught. A set that keeps `src`
    // is 64 bytes an instance instead of 16, so this is the number to read
    // when the heap does not move as far as the arithmetic said it would.
    let cN = 0, cI = 0, fI = 0;
    for (const L of LODI) { if (L.r9) { cN++; cI += L.n; } else fI += L.n; }
    stats.lodCompactSets = cN;
    stats.lodCompactInst = cI;
    stats.lodFullInst = fI;
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

  // FREEZE THE HOME DISTRICT'S STATIC GEOMETRY, exactly as addChunk already
  // does for every STREAMED district.
  //
  // It never did, and the omission cost more than everything else in this
  // file: counted on a phone-shaped run, 2,310 of the 4,486 objects in the
  // scene were still recomputing their world matrix on every single frame --
  // kerbs, railings, shopfronts, lamp posts, none of which will ever move
  // again. That is where "a fifth of the phone goes into deciding what to
  // draw" came from, and it is why the world felt heavy even standing still.
  //
  // Same rules as the chunk version: skip InstancedMesh (its per-instance
  // matrices are managed internally), skip Groups (a Group is what an animated
  // assembly hangs off, and freezing one strands whatever moves under it), and
  // compute the matrix ONCE before the flag goes off so nothing is left at the
  // origin.
  {
    let frozen = 0;
    world.traverse((o) => {
      if (o === world || o.isInstancedMesh || o.isGroup || !o.isMesh) return;
      o.updateMatrix();
      o.matrixAutoUpdate = false;
      frozen++;
    });
    BOOTT.push(['freeze-static', frozen]);
  }

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
    // RELEASE THE CANVAS BACKING STORES.
    //
    // Every texture in this world is drawn on a 2D canvas — facades, paving,
    // the sign atlas pages — and once WebGL has uploaded one, the canvas is
    // dead weight that JS still holds. Measured on the phone profile:
    //
    //     heap 331 MB   geometry 125.9   RETAINED CANVAS 59.1   gpu tex ~78.6
    //
    // and 32 MB of that 59 is the two 2048x2048 sign-atlas pages. The handover
    // has carried "the canvas backing stores are still never released" as the
    // first thing to measure since 2026-08-03; this is it.
    //
    // SAFE ONLY HERE, and that is the whole argument: this runs AFTER the warm
    // spin above, which has rendered every material at least once, so every
    // texture is on the GPU. Zeroing a canvas frees its pixels while leaving
    // the object three.js holds — the texture keeps drawing from the GPU copy.
    // A texture that is re-uploaded later WOULD come back blank, so anything
    // that sets needsUpdate after boot must not be released: the sign atlas is
    // the one that does, and it is finished by places.js before this point.
    {
      const seen = new Set();
      let freed = 0, n = 0;
      scene.traverse((o) => {
        const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        for (const m of ms) {
          for (const k of ['map', 'normalMap', 'roughnessMap', 'emissiveMap', 'alphaMap']) {
            const t = m && m[k];
            if (!t || seen.has(t.uuid)) continue;
            seen.add(t.uuid);
            const im = t.image || (t.source && t.source.data);
            if (t.userData && t.userData.keepCanvas) continue;   // see SignAtlas
            if (!im || !im.getContext || !im.width) continue;   // not a canvas
            // UPLOAD IT, DO NOT HOPE IT WAS UPLOADED. This is what made the
            // block above SAFE rather than merely argued.
            //
            // Its claim was "the warm spin has rendered every material at least
            // once, so every texture is on the GPU". The spin renders SIX
            // directions from spawn plus four ride-out checkpoints — but only
            // `if (!softGPU)`. On a software rasteriser it is ONE frame from
            // spawn and no checkpoints, and anything outside that single
            // frustum was released having never been uploaded. A texture whose
            // canvas is 1x1 when it is finally uploaded is BLACK.
            //
            // That is the black-surface artefact this project has twice written
            // off as flake: 15 of 16 goldens came back with black roads on
            // 2026-08-06 and passed on a re-run, and Ancient Egypt's show
            // buildings — the whole of Universal — rendered as a black
            // silhouette from a new golden vantage and REPRODUCED exactly. It
            // is not flake, it is a race, which is why re-running sometimes
            // "fixes" it.
            //
            // `initTexture` uploads on demand, so after this line the GPU copy
            // provably exists and freeing the pixels is sound on any GPU. It
            // also means the GATE now renders what a player renders: goldens
            // run on SwiftShader and were warming a different world.
            //
            // ?notexinit skips the upload so the cost of this line can be
            // A/B'd against the same build rather than argued about: it forces
            // every canvas texture onto the GPU at boot, including ones a
            // player might never look at. Without it the release is unsafe, so
            // the flag is a MEASURING tool and not an option.
            if (!P.has('notexinit')) {
              try { renderer.initTexture(t); } catch (e) { continue; }
            }
            freed += im.width * im.height * 4;
            im.width = 1; im.height = 1;                        // frees the pixels
            n++;
          }
        }
      });
      window.__canvasFreedMB = +(freed / 1048576).toFixed(1);
      window.__canvasFreedN = n;
      bmark('canvas-release');
    }
    // THE UV AND NORMAL BUFFERS CANNOT BE FREED, and this is the measurement so
    // nobody tries it again. Geometry on the phone profile is
    //
    //     position 36.4   instanceMatrix 46.9   uv 24.3   normal 10.3   colour 7.9
    //
    // and uv + normal looked like a free 34.6 MB: nothing in this codebase reads
    // either after upload, unlike position (every raycast, and this project
    // diagnoses by raycast), colour (terrain.applyCanopy writes it after
    // planting) or instanceMatrix (the LOD system REWRITES it at runtime, at
    // main.js 4463 — which is why the handover's "needs a visual trade, not a
    // packing tweak" is right, and now right for a stated reason).
    //
    // Replaced with empty arrays after the warm spin, SEVEN of fourteen golden
    // frames changed: three.js re-uploads geometry after this point, so the
    // buffers are not dead weight at all. Reverted.

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

  // BUILD THE NEIGHBOURING DISTRICTS BEHIND THE LOADING SCREEN, NOT UNDER THE
  // RIDER.
  //
  // Measured: the screen came off at 13.6s with ZERO of the seven neighbouring
  // districts built, and the streamer then spent 9.7 more seconds building one
  // of them while the rider was already moving. That is exactly the "first ten
  // seconds is glitchy and stuck stuck stuck" report, and it is why six rounds
  // of breaking up individual build loops never fixed it — the work was never
  // too chunky, it was merely happening at the wrong time.
  //
  // So the first wave now runs here, with ARRIVING set so Y() builds at full
  // speed instead of politely handing frames back to a ride nobody is watching
  // yet. Boot gets longer; the ride is smooth from the first metre, which is
  // the trade worth making. The 30s cap means a slow phone still gets in.
  if (opts.streamRest && opts.streamRest.length) {
    streamRest(opts.streamRest);
    if (!P.has('streamall') && !P.has('nostream')) {
      ARRIVING = true;
      const tw0 = performance.now();
      let waiting = true;
      window.__streamSettled.then(() => { waiting = false; });
      while (waiting && performance.now() - tw0 < 30000) {
        const el = performance.now() - tw0;
        await bstep(0.95 + 0.05 * Math.min(1, el / 9000), 'building the neighbourhood');
        await new Promise((r) => setTimeout(r, 120));
      }
      ARRIVING = false;
      BOOTT.push(['first-wave', Math.round(performance.now() - tw0)]);
    }
  }
  // Open the sound hardware and build the synth graph here, silent, rather
  // than on the rider's first throttle press. See Sound.prewarm().
  try { sound.prewarm(); } catch (e) { /* never fatal: the world is playable mute */ }
  // THE RIDES, built after the world because they read the wire sgdetail drew.
  // Never fatal: an island you cannot ride the cable car on is still an island,
  // and a throw here would cost the whole boot.
  // The island names itself. Never fatal: labels are decoration, and a throw
  // here would cost the whole boot for a caption.
  ENTRANCES = (data.entrances || []).filter((e) => e && e.p && e.n);
  try {
    PLACES = buildPlaceLabels(THREE, data, world, surfaceAt);
    if (P.has('boot') && PLACES) console.log('place labels: ' + PLACES.count);
  } catch (e) { console.warn('place labels failed: ' + e.message); }
  try {
    RIDES = buildRides(THREE, data, world, surfaceAt);
    if (P.has('boot')) console.log('rides: ' + RIDES.rides.map((r) => r.kind).join(','));
  } catch (e) { console.warn('rides failed to build: ' + e.message); }
  await bstep(1, 'ready');
  bootDone();
  ready = true;
  if (P.has('boot')) console.log('BOOT ' + JSON.stringify(BOOTT));
  window.__ready = true;
  // MULTIPLAYER, INERT WITHOUT ?room= — every audit/probe boot skips this
  // block entirely (zero net code, zero remote rigs, zero RNG contact).
  // Identity: name via ?name= or localStorage; a per-tab session id so an
  // iOS app-switch rejoins the SAME seat idempotently.
  if (P.get('room')) {
    try {
      let sid = sessionStorage.getItem('sg_sid');
      if (!sid) { sid = 'p' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('sg_sid', sid); }
      // THE NAME ASK — once, ever. Without it every floating tag reads
      // "rider" and hide and seek cannot tell anyone apart. Deliberately
      // plain (the designed join screen waits for the landing-page phase).
      let name = (P.get('name') || localStorage.getItem('sg_name') || '').slice(0, 16);
      if (!name) {
        name = await new Promise((done) => {
          const wrap = document.createElement('div');
          wrap.id = 'nameask';
          wrap.style.cssText = 'position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(12,16,20,.72)';
          wrap.innerHTML = '<div style="background:#e8ddc6;border-radius:14px;padding:22px 20px;max-width:280px;text-align:center;font:15px/1.4 ui-sans-serif,system-ui">'
            + '<div style="font-weight:700;margin-bottom:10px;color:#12161b">What should friends call you?</div>'
            + '<input id="nameinput" maxlength="16" autocomplete="off" style="width:100%;box-sizing:border-box;font:16px ui-sans-serif;padding:9px 10px;border:2px solid #12161b;border-radius:9px;background:#fff" placeholder="your name">'
            + '<button id="namego" style="margin-top:12px;font:600 15px ui-sans-serif;background:#12161b;color:#e8ddc6;border:0;border-radius:9px;padding:10px 26px">Go</button></div>';
          document.body.appendChild(wrap);
          const inp = wrap.querySelector('#nameinput');
          const go = () => {
            const v = (inp.value || '').trim().slice(0, 16);
            if (!v) { inp.focus(); return; }
            wrap.remove();
            done(v);
          };
          wrap.querySelector('#namego').addEventListener('click', go);
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
          setTimeout(() => inp.focus(), 50);
        });
      }
      try { localStorage.setItem('sg_name', name); } catch {}
      const hue = +(P.get('hue') || localStorage.getItem('sg_hue') || (Math.random() * 360) | 0);
      try { localStorage.setItem('sg_hue', String(hue | 0)); } catch {}
      NET = new Net(P.get('relay') || SG_RELAY_URL, P.get('room'), { id: sid, name, hue }, {
        scene, camera,
        surfaceAt: (x, z) => surfaceAt(x, z),
        buildSkate, buildSkater, buildWalker,
        getState: () => (mode === 'walk'
          ? { x: walker.x, z: walker.z, heading: walker.heading || 0, speed: walker.speed || 0, mode: 'w' }
          : { x: S.x, z: S.z, heading: S.heading, speed: S.speed, mode: 'r' }),
        onRoster: (list) => {
          const fb = document.getElementById('friendsbtn');
          if (fb && P.get('room')) {
            fb.textContent = P.get('room').toUpperCase() + (list.length ? ' · ' + (list.length + 1) : '');
          }
        },
        onToast: (msg) => {
          let el = document.getElementById('nettoast');
          if (!el) {
            el = document.createElement('div');
            el.id = 'nettoast';
            el.style.cssText = 'position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;font:600 13px ui-sans-serif,system-ui;color:#12161b;background:rgba(232,221,198,.94);padding:9px 16px;border-radius:16px;box-shadow:0 1px 6px rgba(0,0,0,.3);transition:opacity .4s;pointer-events:none';
            document.body.appendChild(el);
          }
          el.textContent = msg;
          el.style.opacity = '1';
          clearTimeout(el._t);
          el._t = setTimeout(() => { el.style.opacity = '0'; }, 2600);
        },
        onEvent: null,
        onStatus: (s) => { if (s === 'version') location.reload(); },
      });
      NET.sendReady();
      window.__net = NET;
    } catch (e) { console.warn('net init failed (solo ride continues)', e); }
  }
  // THE FRIENDS BUTTON — the deliberately PLAIN v1 join flow (the designed
  // landing page waits until Sentosa itself is done, the owner's call).
  // Solo: one tap creates a room and reloads into it. In a room: shows the
  // shareable link and copies it — send it on WhatsApp, friends tap, they
  // spawn beside you.
  //
  // A ROOM IS A PLACE YOU CAN LEAVE. The owner, 2026-08-05: "i realise cannot
  // close room after i create? the players uiux need to make sense please."
  // He was right and it was not a bug in the relay — the button had exactly two
  // behaviours, create and copy-the-link-forever, so once the address bar said
  // ?room=ABCD the only way out was to edit the URL by hand. Every state a
  // player can enter needs a door out of it, and the button was the whole
  // interface, so it could not offer one.
  //
  // Now the button opens a panel that says which state you are in and gives
  // you every move available from it: solo, create; in a room, copy the invite
  // or leave. Leaving strips ?room and reloads, which is the same trip a join
  // link makes in reverse.
  {
    const fb = document.getElementById('friendsbtn');
    const panel = document.getElementById('roompanel');
    const $ = (id) => document.getElementById(id);
    const roomOf = () => (P.get('room') || '').toUpperCase();
    if (fb && panel) {
      const setOpen = (v) => panel.classList.toggle('on', !!v);
      const paint = () => {
        const room = roomOf();
        const n = (NET && NET.roster && NET.roster.length) || 0;
        $('roomk').textContent = room ? 'Room ' + room : 'Play with friends';
        $('roomn').textContent = room
          ? (n ? 'You and ' + n + (n === 1 ? ' other' : ' others') + ' on the island' : 'Waiting for someone to join')
          : 'Skate Sentosa together';
        $('roomt').textContent = room
          ? 'Send the invite link. Whoever opens it lands beside you.'
          : 'Create a room and send the link. Whoever opens it lands beside you.';
        $('roomgo').textContent = room ? 'Copy invite link' : 'Create a room';
        $('roomleave').style.display = room ? '' : 'none';
      };
      if (roomOf()) fb.textContent = roomOf();
      const tap = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        paint();
        setOpen(!panel.classList.contains('on'));
      };
      fb.addEventListener('click', tap);
      fb.addEventListener('touchstart', tap, { passive: false });

      const shut = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } setOpen(false); };
      for (const ev of ['click', 'touchend']) $('roomx').addEventListener(ev, shut, { passive: false });

      const go = async (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const room = roomOf();
        if (room) {
          const link = location.origin + location.pathname + '?room=' + room;
          try { await navigator.clipboard.writeText(link); $('roomgo').textContent = 'Link copied'; }
          catch { $('roomgo').textContent = link.slice(-16); }
          setTimeout(paint, 1800);
        } else {
          $('roomgo').textContent = 'Creating...';
          try {
            const r = await fetch(SG_RELAY_URL + '/create');
            const { code } = await r.json();
            if (code) location.search = (location.search ? location.search + '&' : '?') + 'room=' + code;
            else paint();
          } catch { $('roomgo').textContent = 'Could not reach the server'; setTimeout(paint, 2200); }
        }
      };
      for (const ev of ['click', 'touchend']) $('roomgo').addEventListener(ev, go, { passive: false });

      // THE DOOR OUT. Drop ?room and keep every other flag, so leaving a room
      // does not also silently drop ?people or a debug flag someone is using.
      const leave = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const q = new URLSearchParams(location.search);
        q.delete('room');
        const s2 = q.toString();
        location.href = location.origin + location.pathname + (s2 ? '?' + s2 : '');
      };
      for (const ev of ['click', 'touchend']) $('roomleave').addEventListener(ev, leave, { passive: false });
    }
  }
  // Chunks that streamed in during boot accumulated their counters in
  // __statsAcc — __stats did not exist yet to receive them. Merge ONCE here;
  // statAdd keeps both in step from now on. Without this, the first wave's
  // districts are invisible to every counter-reading check (the world D39
  // blindness).
  for (const [k, v] of Object.entries(window.__statsAcc || {})) {
    stats[k] = (stats[k] || 0) + v;
  }
  window.__stats = stats;
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
      setVehicle(nextVehicle().kind);
      updateHelp();                              // safe here: boot is long done
    };
    vbtn.addEventListener('click', tap);
    vbtn.addEventListener('touchstart', tap, { passive: false });
  }
  let saved = 'skate';
  try { saved = localStorage.getItem('sg_vehicle') || 'skate'; } catch (e) { /* fine */ }
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
  // ON A RIDE, THE BUTTON GETS YOU OUT. Nothing else in this function applies
  // — you are not on a scooter and there is no scooter to summon.
  if (mode === 'onride') { alightRide(); return; }
  // STANDING AT A STATION, IT PUTS YOU IN. Boarding beats fetching the board:
  // if you walked to the cable car you meant to ride the cable car.
  if (mode === 'walk') {
    const hit = nearestRide();
    if (hit && boardRide(hit)) return;
  }
  if (mode === 'ride') {
    // step off to the left of the scooter, onto the kerb side
    const nx = Math.cos(S.heading), nz = -Math.sin(S.heading);
    let wx = S.x + nx * 1.2, wz = S.z + nz * 1.2;
    if (blocked(wx, wz)) { wx = S.x - nx * 1.2; wz = S.z - nz * 1.2; }
    walker.x = wx; walker.z = wz; walker.heading = S.heading; walker.speed = 0; walker.y = null; walker.seat.id = null;
    S.speed = 0; S.reversing = false;
    camYaw = S.heading; camPitch = 0.16;
    walkerRig.group.visible = true;
    rider.visible = false;      // he is the one standing next to it now
    skater.visible = false;     // and the board is left parked on the kerb
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
    skater.visible = vehicleKind === 'skate';
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
  // THE BOARD NEEDS ITS OWN LINE OR IT READS AS BROKEN. The push stops working
  // above walking pace on purpose (see SKATE.pushMax), so a rider who holds
  // the throttle and nothing else tops out at 11 km/h and concludes the skate
  // is slow. Say out loud that carving is the accelerator.
  el.innerHTML = mode !== 'ride'
    ? '<b>drag left side</b> walk<br><b>drag right side</b> look around<br>'
      + '<span style="opacity:.65">keys: WASD · shift to run · E to ride</span>'
    : vehicleKind === 'skate'
      ? '<b>hold left side</b> push off<br><b>carve left-right</b> to build speed<br>'
        + '<b>hold lower left</b> foot brake<br><b>drag right side</b> steer<br>'
        + '<span style="opacity:.65">keys: A/D · W · S · E to step off</span>'
      : '<b>hold left side</b> throttle<br><b>hold lower left</b> brake<br>'
        + '<b>hold brake stopped</b> reverse<br><b>drag right side</b> steer<br>'
        + '<span style="opacity:.65">keys: A/D · W · S · E to get off</span>';
}
// reflect the STARTING mode once everything the helper reads exists — called
// above the const block it crashed the whole module in the temporal dead zone
updateHelp();

// ---- rides: board, carry, alight ----------------------------------------
//
// A ride is entered from the WALK mode, because you walk up to a station. The
// carrier is moved along the published path; the camera sits in the seat. The
// player's walker is parked at the boarding point and put back down at the far
// end, so getting off never drops anyone into the sea.
function nearestRide() {
  if (!RIDES || mode === 'onride') return null;
  const x = mode === 'walk' ? walker.x : S.x;
  const z = mode === 'walk' ? walker.z : S.z;
  const hit = RIDES.nearest(x, z, BOARD_REACH);
  // A PLATFORM BOARDING POINT HAS TO BE CLIMBED TO. `nearest` is a horizontal
  // test, so without this you could stand on the grass twelve metres below the
  // deck and board out of thin air — which would make the ramp pointless and
  // the platform a decoration. Anything not on a platform is unaffected.
  if (hit && hit.board && hit.board.platform) {
    const y = mode === 'walk' && walker.y != null ? walker.y : surfaceAt(x, z);
    if (Math.abs(y - hit.board.y) > 3.5) return null;
  }
  return hit;
}

function boardRide(hit) {
  if (!hit) return false;
  // WHICH WAY DOES A MID-LINE STATION SEND YOU? The old rule was "anything
  // past the start goes backwards", which at Imbiah Lookout — the Sentosa
  // Line's middle station — always chose the 244m hop back to Sensoryscape over
  // the 641m run out to Siloso Point. Nobody climbs a platform for the shorter
  // half. With no way to ask, take the LONGER remaining run: it is the ride
  // they came for, and the other direction is one stop away at the far end.
  {
    const R = hit.ride;
    const a = R.s0 || 0, b = R.s1 != null ? R.s1 : R.len;
    const s = hit.board.s;
    onRide = { ride: R, s, dir: (s - a) > (b - s) ? -1 : 1 };
    // AND YOU FACE THE WAY THE SEAT FACES.
    //
    // Nothing set `camYaw` when you sat down, so a ride began pointing wherever
    // you happened to be looking when you pressed the button — while the
    // CARRIER is turned along the wire by rideStep. Board a SkyRide chair a
    // quarter turn off and you spend the whole climb looking at your own seat:
    // caught on the flight strip, where a rust-orange slab (`0xc4632f`, the
    // chair back, 1.7m wide and 0.45m from the eye) filled a third of every
    // frame all the way up Imbiah.
    //
    // A chairlift and a luge cannot physically face any other way, and a
    // gondola cabin has you facing along the cabin. So the seat's own heading
    // is the honest start — the SAME expression rideStep turns the carrier
    // with, so the two cannot disagree. Free look still works from there; this
    // only decides where it begins.
    const p0 = RIDES.at(R, s);
    if (p0 && p0.dir) camYaw = Math.atan2(p0.dir.x * onRide.dir, p0.dir.z * onRide.dir);
    camPitch = 0;
  }
  walkerRig.group.visible = false;
  rider.visible = false;
  skater.visible = false;
  hit.ride.carrier.visible = true;
  mode = 'onride';
  camInit = false;
  updateHelp();
  return true;
}

function alightRide() {
  if (!onRide) return;
  const r = onRide.ride;
  const p = RIDES.at(r, onRide.s);
  r.carrier.visible = false;
  // Put the walker on the ground UNDER the carrier, and only somewhere it can
  // stand: stepping off a gondola over open water would be a drowning, not a
  // dismount. If nothing near is standable, walk back to the boarding point.
  let wx = p.x, wz = p.z, wy = null;
  // YOU BOARD FROM THE PLATFORM AND YOU USED TO GET OFF ON THE GRASS.
  //
  // The station work of 2026-08-06 moved every gondola boarding point up onto
  // its deck, for a reason it wrote down: "a boarding point on the grass under
  // the wire makes the deck scenery — you would climb it for the view and walk
  // back down to get on, which is the opposite of a station." Alighting never
  // learned the same lesson. It put the walker on the ground under wherever
  // the carrier stopped, so the cable car set you down UNDER the platform you
  // had just ridden into, and you climbed the ramp again to leave. Boarding and
  // alighting disagreed about what a station is.
  //
  // So arrive at the STOP, when the carrier has actually stopped at one — the
  // ride ends on a board's own `s`, so this is a lookup and not a guess — and
  // stand on its deck if it has one. Every other ride is unaffected: a luge
  // finishes on its track and a zip on the sand, and neither carries a
  // `platform` flag, so both keep taking the ground under the carrier.
  let stop = null, sd = 12;
  for (const b2 of r.boards) {
    const d = Math.abs(b2.s - onRide.s);
    if (d < sd) { sd = d; stop = b2; }
  }
  if (stop && stop.platform) {
    wx = stop.x; wz = stop.z; wy = stop.y;
  } else if (blocked(wx, wz) || surfaceAt(wx, wz) < 0.6) {
    const home = r.boards[0];
    wx = home.x; wz = home.z;
    if (home.platform) wy = home.y;
  }
  walker.x = wx; walker.z = wz; walker.speed = 0; walker.y = wy; walker.seat.id = null;
  walkerRig.group.visible = true;
  onRide = null;
  mode = 'walk';
  camInit = false;
  updateHelp();
}

// How many times a rider carves back across a flow sheet before stepping off.
// Only the two wave rides are listed: everything else here goes somewhere, and
// turning a cable car round at the far station would be absurd.
const FLOW_LAPS = { flowrider: 6, flowbarrel: 6 };

function rideStep(dt) {
  const r = onRide.ride;
  onRide.s += r.speed * dt * onRide.dir;
  // `s0`/`s1` are the ride's travelled range, which is NOT always its whole
  // wire: a cable car stops at its last station rather than carrying you on to
  // Mount Faber, 529m outside the terrain grid. See the note in rides.js.
  const s0 = r.s0 || 0, s1 = r.s1 != null ? r.s1 : r.len;
  const done = onRide.dir > 0 ? onRide.s >= s1 : onRide.s <= s0;
  if (done) {
    onRide.s = Math.max(s0, Math.min(s1, onRide.s));
    // A FLOW WAVE IS NOT A JOURNEY, AND RIDING IT LIKE ONE MADE IT LAST FOUR
    // SECONDS.
    //
    // Timed at wall clock 2026-08-17: the Double FlowRider ran 6.1s end to end
    // and the FlowBarrel 4.0s. You board and it is over before you have
    // registered that you boarded. Every other ride here is a journey — the
    // cable car crosses the island, the luge comes down a hill, the zip flies
    // to a landing — so "travel the path, then alight" is the right model for
    // them. It is the wrong SHAPE for a wave: nobody crosses a flow sheet and
    // leaves. You hold station and carve back and forth until you fall off.
    //
    // The path is already a full weave across the sheet (rides.js builds it
    // from -0.30, 0, +0.30, 0, -0.30 of the lane width), so a run of it IS one
    // carve. Nothing is invented here and no geometry is added: the rider
    // simply turns at the edge and takes the weave back, which is what the
    // real thing looks like from the deck. The carrier's yaw already reads
    // `onRide.dir`, so it turns round on its own.
    //
    // Six passes puts the FlowRider at about 37s and the barrel at 24s — a
    // session rather than a blink, and short enough that the queue behind you
    // is not a wait. It ends on its own; the Get off button has always been
    // there for anyone who has had enough.
    const laps = FLOW_LAPS[r.kind];
    if (laps && (onRide.laps || 1) < laps) {
      onRide.laps = (onRide.laps || 1) + 1;
      onRide.dir = -onRide.dir;
      // nudged off the limit it just hit, or the reversed step lands on it
      // again next frame and the turn fires twice
      onRide.s = Math.max(s0 + 0.01, Math.min(s1 - 0.01, onRide.s));
    } else { alightRide(); return; }
  }
  const p = RIDES.at(r, onRide.s);
  // the walker rides along invisibly under the seat: crowd, traffic, streaming
  // and the wayfinder all key off walker.x/z, and a frozen walker would freeze
  // the island around a moving player
  walker.x = p.x; walker.z = p.z; walker.y = null; walker.seat.id = null;
  const yaw = Math.atan2(p.dir.x * onRide.dir, p.dir.z * onRide.dir);
  r.carrier.position.set(p.x, p.y - (r.hang || 0), p.z);
  r.carrier.rotation.set(0, yaw, 0);
  // the seat, plus the free look the walk mode already gives
  const eye = EYE[r.kind] !== undefined ? EYE[r.kind] : 0.6;
  const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
  camera.position.set(p.x, p.y - (r.hang || 0) + eye, p.z);
  camera.lookAt(p.x + fx * 30, p.y - (r.hang || 0) + eye - Math.sin(camPitch) * 30,
                p.z + fz * 30);
  camera.fov = 68; camera.updateProjectionMatrix();
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

// CULL A WHOLE DISTRICT WITH ONE TEST INSTEAD OF WALKING ITS SUBTREE.
//
// A profile of nine seconds of riding on a phone-speed CPU spent 1.6 of those
// seconds inside three.js's own scene walk -- projectObject, intersectsObject
// and updateMatrixWorld -- deciding, object by object, that things behind the
// rider were not on screen. Up to three districts are resident at once and
// usually only one is in front of you.
//
// three.js's projectObject returns immediately on an invisible object, so
// hiding a district's group skips its entire subtree for free. One box test
// per district replaces thousands of per-object ones. The district you are
// standing in stays visible because its box contains the camera.
const _dBox = new THREE.Box3(), _dFru = new THREE.Frustum(), _dMat = new THREE.Matrix4();
let CULL_D = true;
window.__cullD = (v) => { CULL_D = !!v; if (!CULL_D) for (const r of (window.__streamRecs||[])) if (r.group) r.group.visible = true; return CULL_D; };
function cullDistricts() {
  const recs = window.__streamRecs;
  if (!CULL_D || !recs || !recs.length) return;
  _dMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  _dFru.setFromProjectionMatrix(_dMat);
  for (const r of recs) {
    if (!r.group || !r.box || r.box.length !== 4) continue;
    // Generous in Y: the box is a 2D footprint and the tallest tower in the
    // world is under 300m, so this must never clip a skyline off the top.
    _dBox.min.set(r.box[0], -80, r.box[1]);
    _dBox.max.set(r.box[2], 460, r.box[3]);
    r.group.visible = _dFru.intersectsBox(_dBox);
  }
}
// HOW FAR BACK THE CHASE CAMERA CAN ACTUALLY SIT.
//
// The camera hangs 3.45m behind the board on a fixed boom, and nothing ever
// asked what was in that 3.45m. Riding a tree-lined avenue — which is most of
// Sentosa now the forest pass has shipped — puts a trunk between the lens and
// the rider several times a minute, and a trunk at 0.5m from the near plane is
// not a tree, it is a black wall across the frame. The 2026-08-05 golden at
// RWS is the evidence: a third of the screen, solid black.
//
// Trees cannot be tested with the collision grid: solid.js skips
// InstancedMeshes on purpose, so every trunk in the world is invisible to it.
// They come from the planting index instead (TreeField.add), and building
// walls come from the grid, which is a lookup.
//
// COST: the boom is 3.45m, so it spans at most two hash cells on each axis;
// four Map gets and a handful of point-segment tests per frame. This runs in
// the frame loop and it has to stay that cheap.
// Closer than this and you are inside your own shoulders. Measured against
// the frames: at 1.45 the rider's head fills a third of the screen, which is
// its own kind of broken shot.
const _BOOM_MIN = 1.85;
function boomClear(px, pz, bx, bz, full) {
  let lim = full;
  const IX = window.__treeIx;
  if (IX) {
    // the boom runs from the rider outward along (bx,bz), which is BACKWARD
    const c0x = Math.floor(Math.min(px, px + bx * full) / 16) - 1;
    const c1x = Math.floor(Math.max(px, px + bx * full) / 16) + 1;
    const c0z = Math.floor(Math.min(pz, pz + bz * full) / 16) - 1;
    const c1z = Math.floor(Math.max(pz, pz + bz * full) / 16) + 1;
    for (let cx = c0x; cx <= c1x; cx++) {
      for (let cz = c0z; cz <= c1z; cz++) {
        const arr = IX.get((cx + 4096) * 8192 + (cz + 4096));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i += 3) {
          const dx = arr[i] - px, dz = arr[i + 1] - pz;
          // distance along the boom, and how far off it the trunk sits
          const t = dx * bx + dz * bz;
          if (t < 0 || t > full + 1) continue;
          const ox = dx - bx * t, oz = dz - bz * t;
          // trunk radius at lens height (CylinderGeometry 0.30 top / 0.62
          // base, scaled) plus enough that the bark is not ON the near plane.
          // 0.38, not 0.55: the margin is subtracted from the boom length, so
          // an over-generous one throws the camera into the rider's back every
          // time it passes a tree — and this world is now mostly trees.
          const r = 0.58 * arr[i + 2] + 0.38;
          if (ox * ox + oz * oz > r * r) continue;
          const stop = t - r;
          if (stop < lim) lim = stop;
        }
      }
    }
  }
  // ...and the same for a wall. Sampling beats a raycast here for the same
  // reason it does everywhere else in this file: a Set lookup against a
  // rasterised grid, not a scene walk.
  //
  // __solidAt, NOT __blocked. See the note at __solidAt: the movement
  // predicates call open water a wall, and the chase camera hangs over water
  // on every causeway and pier on this island. Geometry is the only question
  // a camera has.
  if (window.__solidAt) {
    for (let t = 1.0; t <= full; t += 0.6) {
      if (window.__solidAt(px + bx * t, pz + bz * t)) { if (t - 0.6 < lim) lim = t - 0.6; break; }
    }
  }
  return Math.max(_BOOM_MIN, Math.min(full, lim));
}
// what the boom decided, and why — a shortened boom is invisible in a frame
// unless you already know the camera is meant to be further back
window.__boom = () => {
  const bx = -Math.sin(S.heading), bz = -Math.cos(S.heading);
  const C = (rideParams && rideParams.cam) || RIDE.cam;
  const walls = [];
  for (let t = 1.0; t <= C.back; t += 0.6) {
    walls.push([+t.toFixed(1), !!(window.__solidAt && window.__solidAt(S.x + bx * t, S.z + bz * t))]);
  }
  const IX = window.__treeIx;
  let nTrees = 0;
  if (IX) for (const [, a] of IX) nTrees += a.length / 3;
  return { at: [S.x | 0, S.z | 0], full: C.back, got: boomClear(S.x, S.z, bx, bz, C.back), walls, nTrees };
};

// WHAT IS UNDER THE BOARD, and it has to be cheap enough to ask every frame.
//
// Four grid lookups, no raycast, no scene walk — the same shape as every other
// per-frame question in this file. Ordered by what wins: a carriageway is a
// carriageway even if it crosses a park, and a mapped footpath beats the
// ground it is laid on (paths are how you get around Sentosa, and classifying
// them by the grass underneath would have made the whole island feel like a
// bog).
function surfaceKindAt(x, z) {
  if (window.__onRoad && window.__onRoad(x, z, 0)) return 'road';
  // A DECK OVERRIDES THE GROUND UNDER IT, and a ROAD bridge is a road.
  //
  // These two ran last, under the green tests, and the Sentosa Gateway came
  // back as TIMBER: the causeway carries a deck, `onRoad` did not claim that
  // particular point, and the boardwalk rule caught it — a 500m tarmac
  // causeway classified as planking. Road bridges are asked about first and
  // separately from footbridges and piers, which are the only timber here.
  if (typeof bridgeDeckAt === 'function' && bridgeDeckAt(x, z) !== null) return 'road';
  if (typeof anyDeckAt === 'function' && anyDeckAt(x, z) !== null) return 'timber';
  const T = window.__terrain;
  const green = (T && T.greenAt) ? T.greenAt(x, z) : null;
  if (window.__onPath && window.__onPath(x, z, 0)) {
    // a trail through the woods is dirt; everything else paved is paved
    return green === 'wood' ? 'dirt' : 'paved';
  }
  if (green === 'sand') return 'sand';
  if (green === 'wood') return 'dirt';
  if (green) return 'grass';                       // grass, park, golf, pitch
  // NO `land` TEST HERE, and it is not an oversight. A parcel index was built
  // for plazas and car parks and measured dead: all 2,141 sampled cells inside
  // a mapped land parcel are ALSO inside a green ring, so the green test above
  // claims every one of them first. Measured 2026-08-05; do not add it back
  // without re-measuring that.
  // UNCLASSIFIED GROUND BESIDE A WAY IS HARDSTANDING, NOT FIELD.
  //
  // The default below is 'grass', which matches what the terrain shader paints
  // on unclassified ground (greenFrac) and is right for a hillside. It is
  // wrong for the metre of kerb, verge and forecourt either side of every road
  // and path on the island — and the guard in data/surfcheck.mjs caught the
  // worst case of that immediately: THE SPAWN POINT classified as grass, so
  // the game opened with the board at 55% speed before the player had moved.
  //
  // A generous margin off the carriageway, and a smaller one off a footway,
  // covers the forecourts and verges without reaching open ground.
  if (window.__onRoad && window.__onRoad(x, z, 6)) return 'paved';
  if (window.__onPath && window.__onPath(x, z, 4)) return 'paved';
  // ...and beyond that it really is vegetation.
  return 'grass';
}

// ...AND IT BLENDS. Snapping the profile at a kerb reads as hitting something.
// A ~0.28s blend means riding onto sand SINKS into it over about a second
// (the profile eases, then the bog term in step() bleeds the excess speed),
// which is what leaving the road actually feels like.
const _sfNow = { vMax: 1, coast: 1, pump: 1, grip: 1, rumble: 0 };
let _sfKind = 'road';
function surfaceNow(x, z, dt) {
  _sfKind = surfaceKindAt(x, z);
  const t = SURFACES[_sfKind] || SURF_ROAD;
  const k = Math.min(1, dt / 0.28);
  for (const key of ['vMax', 'coast', 'pump', 'grip', 'rumble']) {
    _sfNow[key] += (t[key] - _sfNow[key]) * k;
  }
  return _sfNow;
}
// so a probe, the HUD and the audio can all name the same surface
window.__surface = () => ({ kind: _sfKind, ..._sfNow });
// the raw classifier at any point, for data/surfcheck.mjs — a spot check of
// where the RIDER happens to be cannot tell a working classifier from one
// that answers the same thing everywhere
window.__surfaceKindAt = (x, z) => surfaceKindAt(x, z);

function driveCamera(dt) {
  if (SPEC) {
    camera.position.set(SPEC[0], SPEC[1], SPEC[2]);
    camera.lookAt(SPEC[3], SPEC[4], SPEC[5]);
    camera.fov = SPEC[6] || 46; camera.updateProjectionMatrix();
    return;
  }
  const fwd = new THREE.Vector3(Math.sin(S.heading), 0, Math.cos(S.heading));
  // THE CAMERA FOLLOWS THE SURFACE THE RIDE IS ON, NOT THE GROUND UNDER IT.
  //
  // This read `terrain.at` in all three places below while the ride itself is
  // seated with `surfaceAt`, which knows about bridge decks. On flat ground the
  // two differ by 6cm and nothing showed. ON A BRIDGE THEY DIFFER BY THE WHOLE
  // SPAN: on the Sentosa Gateway the deck is 8.02m and the terrain beneath is
  // 3.47m, so the camera was placed 2.2m BELOW the rider's own wheels — under
  // the deck, looking at its underside.
  //
  // It has been wrong since the first bridge and was invisible because a road
  // bridge had nothing under it to see. Building the soffit and piers on
  // 2026-08-02 made it visible immediately, and pulling the camera in from
  // 3.05m to 2.45m made it worse: "i teleport to sentosa now i like glitching
  // in mid air again. Cant even see myself. Like im under the bridge."
  const gy = surfaceAt(S.x, S.z);
  // HOW CLOSE THE CHASE CAMERA SITS, PER VEHICLE, AND IT LIVES WITH THE
  // VEHICLE. It used to be two `vehicleKind === 'car' ? a : b` ternaries here,
  // which is fine for two vehicles and wrong for three — the board would have
  // been framed as a scooter. Each parameter set carries its own `cam` block
  // now, so adding a vehicle cannot forget to say how it is filmed.
  //
  // AND EVERY ONE OF THEM CAME IN, on the rider's ask: "can it be a bit more
  // zoomed in so it feels more immersive". Scooter 5.8m back / 3.05m up ->
  // 4.35 / 2.45, car 7.4 / 3.5 -> 5.85 / 2.95, and the base lens from 58 to
  // 55 degrees. The board is closest of the three at 3.45 / 1.95, which is
  // about where your own eyes are over a deck.
  const C = (rideParams && rideParams.cam) || RIDE.cam;
  // THE BOOM SHORTENS RATHER THAN PUTTING A TREE IN THE LENS. See boomClear().
  const back = boomClear(S.x, S.z, -Math.sin(S.heading), -Math.cos(S.heading), C.back);
  const want = new THREE.Vector3(S.x, gy, S.z)
    .addScaledVector(fwd, -back)
    .add(new THREE.Vector3(0, C.up, 0));
  want.y = Math.max(want.y, surfaceAt(want.x, want.z) + 1.6);
  const aim = new THREE.Vector3(S.x, gy + 1.35, S.z).addScaledVector(fwd, C.aim);
  aim.y = surfaceAt(aim.x, aim.z) + 1.35;
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
  camera.fov = C.fov + spd * 5;
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
// THE FRAME CAP IS GONE. Nothing sets it any more except an explicit ?fps=,
// which exists for measurement and for anyone who deliberately wants it.
//
// It was introduced on 2026-07-31 to keep a phone cool and it cost the rider
// his entire evening. Capped against a stopwatch rather than against the
// screen's refreshes it delivered frames 33, 33, 50, 17 -- an average of
// exactly the 30fps asked for, which is why every measurement here said the
// world was healthy while he kept reporting "laggy and glitchy". He found it
// himself by loading ?fps=60 and watching the problem vanish, then told me to
// take it out. Taken out.
//
// The lesson is not "caps are bad", it is that a saving nobody asked for is
// not worth a defect the user can see. If heat comes back, it gets solved by
// doing less work per frame, not by throwing frames away.
// THE PHONE FRAME CAP IS ON BY DEFAULT, AT 30, AND THIS FILE HAS ARGUED FOR
// THAT FOR TWO SESSIONS WHILE THE CONSTANT SAT AT ZERO.
//
// The long note further down measured it properly on the third attempt — one
// page, one settled spot, the cap toggled underneath through window.__fpsCap,
// alternating passes, medians of rendered frames:
//
//     cap off  36.3   cap 40  36   cap 30  30   cap 24  24
//
// So 30 costs about six frames a second against a device managing 36 and buys
// a ~17% cut in sustained per-frame work — and SUSTAINED WORK IS THE HEAT.
// It defaulted to 0 regardless, so the cap only ever reached a phone the
// adaptive tier had already demoted below 20fps. A phone that CAN hold a good
// rate rendered flat out for as long as the rider kept moving, which is the
// rider's report: "after play short time heat up already".
//
// Desktop is untouched (TOUCH only) and ?fps= still overrides. Critically this
// must NOT count as the rider choosing a frame rate — `tierDone` below reads
// P.get('fps'), not this — or turning the cap on would switch the adaptive
// tier off for every phone, which is the trap the note beside tierDone warns
// about.
let FPS_CAP = parseFloat(P.get('fps') || '0') || (TOUCH ? 30 : 0);
// ADAPTIVE TIER: a phone that cannot hold ~20fps at the standard settings
// demotes itself once — dpr 1.25, cap 24 — and remembers, so weaker phones
// run cool and smooth without a settings screen. Verdict from the median of
// the first eight one-second fps readings after ready; ?dpr/?fps overrides
// win, and a saved verdict applies from the next boot's first frame.
// START LOW AND EARN THE PIXELS, rather than start high and make the rider pay
// for the measurement.
//
// This used to begin at the phone's own pixel ratio (capped at 1.5) and only
// demote AFTER eight one-second samples. On a phone that is eight-plus seconds
// of drawing every frame at up to 2.25x the pixels it will eventually settle
// on -- and it is exactly the symptom reported: "the first 15-20 seconds lag,
// after that is ok", including with the bike parked and nothing streaming.
// Watched live in the HUD: dpr 1.5 for the first several seconds, then 1.25,
// and the lag goes with it.
//
// So a touch device now starts AT the conservative setting and is promoted
// only if it demonstrates it can do better. Nobody waits through the
// measurement any more; the worst case is that a strong phone spends its first
// eight seconds slightly softer than it needs to, which nobody has ever
// complained about.
let TIER_DPR = TOUCH && !P.get('dpr') ? 1.25 : 0;
const tierFps = [];
// The default cap above must NOT count as "the user chose a frame rate":
// only an explicit ?fps= or ?dpr= disables the adaptive tier, otherwise
// turning the cap on would have switched the tier off for every phone.
let tierDone = !TOUCH || !!P.get('fps') || !!P.get('dpr');
try {
  const saved = !tierDone && localStorage.getItem('sg_tier');
  if (saved === 'low') { TIER_DPR = 1.0; tierDone = true; }
  else if (saved === 'high') { TIER_DPR = Math.min(devicePixelRatio || 1, 1.5); tierDone = true; }
} catch (e) { tierDone = tierDone || false; }
function tierSample(f) {
  if (tierDone) return;
  tierFps.push(f);
  if (tierFps.length < 8) return;
  tierDone = true;
  const s = [...tierFps].sort((a, b) => a - b);
  // Below 20fps even at the conservative setting: this phone needs the frame
  // cap dropped too, and should remember so the next boot starts there.
  if (s[4] < 20) {
    // A struggling phone gets a SOFTER PICTURE, never fewer frames. Dropping
    // frames is what caused the judder this tier used to make worse.
    TIER_DPR = 1.0;
    resize();
    try { localStorage.setItem('sg_tier', 'low'); } catch (e) { /* fine */ }
  } else if (s[4] >= 40 && !P.get('dpr')) {
    // Comfortably clearing the 30fps cap with room to spare: this phone can
    // afford a sharper picture. Promotion, not demotion -- and it happens
    // once, after the rider is already moving smoothly.
    //
    // NOTE, 2026-08-02: with the phone frame cap now defaulting to 30, a
    // capped phone can never MEASURE 40, so this branch is unreachable on
    // touch unless ?fps= raises the cap. That is deliberate and is left
    // as-is: the cap exists because the rider's phone gets hot, and promoting
    // it to a sharper picture is the opposite of what heat wants. It is
    // recorded here rather than deleted so the next person does not spend an
    // hour wondering why phones stopped being promoted.
    TIER_DPR = Math.min(devicePixelRatio || 1, 1.5);
    try { localStorage.setItem('sg_tier', 'high'); } catch (e) { /* fine */ }
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


// ?diag — A REPORT THE RIDER'S OWN PHONE CAN GIVE ME.
//
// Every performance claim in this file that came from a phone-shaped window on
// a desktop was wrong, and the rider has had to correct me from his actual
// device three times. This records forty seconds from the moment the world is
// ready and prints it big enough to photograph: frame rate per second, plus
// everything that could plausibly change during a warm-up window, so "it lags
// for fifteen seconds and then it is fine" can be read off rather than guessed.
if (P.has('diag')) {
  const rows = [];
  let dt0 = 0, dframes = 0, dlast = 0, dprev = 0, dworst = 0, dprevT = 0;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:0;top:0;z-index:90;background:rgba(10,11,13,.92);'
    + 'color:#e8e6e1;font:12px/1.35 ui-monospace,Menlo,monospace;padding:8px 10px;max-height:100%;overflow:auto';
  const tick = (now) => {
    requestAnimationFrame(tick);
    if (!window.__ready) return;
    if (!dt0) { dt0 = now; dlast = now; dprevT = now; document.body.appendChild(el); }
    dframes++;
    const gap = now - dprevT; dprevT = now;
    if (gap > dworst) dworst = gap;
    if (now - dlast < 1000) return;
    const sec = Math.round((now - dt0) / 1000);
    const ri = window.__renderer ? window.__renderer.info.render : {};
    // THE FIRST VERSION OF THIS PANEL COUNTED ANIMATION-FRAME CALLBACKS, which
    // is the browser's refresh rate, NOT the rate the world is drawn at -- the
    // frame cap skips draws and rAF keeps firing regardless. It read 58 while
    // the world was being drawn 30 times a second. Same mistake as three
    // earlier measurements in this project; both numbers are reported now.
    //
    // SPEED IS HERE BECAUSE THE RIDER'S WORDS WERE "SLOWMO", NOT "CHOPPY".
    // A high frame rate with a crawling speed means the world's clock is
    // running slow, which is a completely different fault from a slow picture,
    // and no amount of frame-rate data can tell the two apart.
    const drawn = ri.frame || 0;
    rows.push([sec, Math.round(dframes * 1000 / (now - dlast)),
               Math.round((drawn - dprev) * 1000 / (now - dlast)),
               Math.round(dworst), Math.round(window.__kmh ? window.__kmh() : 0),
               ri.calls || 0, (window.__streamState || {}).building ? 'B' : '-']);
    dprev = drawn; dframes = 0; dworst = 0; dlast = now;
    if (rows.length > 40) return;
    el.textContent = 'hz ' + Math.round(capHz) + ' skip ' + capSkip + ' cap ' + FPS_CAP
      + '\nsec  raf drawn worst  kmh  draw bld\n'
      + rows.map((r) => r.map((v, i) => String(v).padStart([3, 5, 6, 6, 5, 6, 4][i])).join('')).join('\n');
  };
  requestAnimationFrame(tick);
}

/* ---------------- loop ---------------- */
let last = performance.now(), frames = 0, t0 = last, fps = 0, lastCoolT = 0;
// frames >200ms in the first 10s after ready — the number the user's
// screenshot carries so "still laggy" becomes measurable (shows as jN)
let DT_CLAMP = 0.1;
window.__dtClamp = (v) => { DT_CLAMP = +v || 0.1; return DT_CLAMP; };
let jankCount = 0, jankWindowEnd = 0;
let FRAME_MS = 0;
let capTick = 0, capHz = 0, capSkip = 1, capLast = 0;
const capGaps = [];
let lastCapT = 0, shadowFlip = true;
// A/B THE FRAME CAP INSIDE ONE PAGE. Comparing two browser launches on a busy
// machine is worthless -- the same uncapped configuration measured 34.3 and
// 17.3 rendered fps twenty minutes apart -- so the cap has to be switched
// under a single settled world with everything else held still.
window.__fpsCap = (n) => { FPS_CAP = +n || 0; lastCapT = 0;
  capSkip = (FPS_CAP && capHz) ? Math.max(1, Math.round(capHz / FPS_CAP)) : 1;
  CAP_REF = capHz ? Math.max(16.7, capSkip * (1000 / capHz)) : 16.7;
  return FPS_CAP; };

function loop(now) {
  const rawDt = (now - last) / 1000;
  if (ready) {
    if (!jankWindowEnd) jankWindowEnd = now + 10000;
    else if (now < jankWindowEnd && rawDt > 0.2) jankCount++;
  }
  // THIS CLAMP IS WHAT MAKES A SLOW PHONE RUN IN SLOW MOTION.
  //
  // Everything except the ride physics advances by `dt`. Clamped at 0.05 the
  // world can never advance faster than a 20fps step, so at 15fps it runs at
  // 75% speed and at 10fps at half speed -- the camera eases toward the bike
  // slower than the bike moves, traffic crawls, and the whole thing reads as
  // "moving off fucking slow" rather than as a low frame rate. The rider
  // reported exactly that, and it got worse the slower the device.
  //
  // The clamp exists so one long stall cannot advance the world by a second in
  // a single step. 0.1 still guarantees that and stops inventing slow motion
  // above 10fps. Everything it feeds -- camera easing, traffic, crowd,
  // signals -- is lerp-based and safe at a tenth of a second.
  const dt = Math.min(DT_CLAMP, rawDt); const lastFrameT = last; last = now;
  // FRAME HEALTH, read by the world builder. A rolling mean of the last dozen
  // frames, in milliseconds.
  if (rawDt > 0 && rawDt < 1) {
    FRAME_MS = FRAME_MS ? FRAME_MS * 0.88 + rawDt * 1000 * 0.12 : rawDt * 1000;
  }

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
    // GIVE THE CLOCK BACK BEFORE BAILING OUT.
    //
    // `last = now` has already run by the time we get here, so returning
    // without simulating DISCARDS the time this frame represents. The frame
    // cap had the identical defect a few lines below and it made the entire
    // world run at half speed: the rider's scooter took 17 seconds to reach a
    // top speed the physics model reaches in 4.2, and everything he described
    // as "slowmo" and "moving off fucking slow" was exactly that, literally.
    // He said so repeatedly and was right; I spent hours measuring frame rates
    // instead of the clock.
    //
    // Restoring `last` means the skipped interval is simply carried into the
    // next frame that does run, which is what a skipped frame must always do.
    if (parked && now - lastCoolT < 41) { last = lastFrameT; requestAnimationFrame(loop); return; }
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
  // SKIP WHOLE DISPLAY FRAMES, NEVER A STOPWATCH.
  //
  // This used to compare elapsed milliseconds against 1000/FPS_CAP. The screen
  // does not refresh on a stopwatch: it refreshes on a vsync, and animation
  // callbacks arrive a millisecond or two either side of one. A tick landing at
  // 31.0ms against a 31.33ms threshold gets skipped, and the frame after it
  // lands a whole vsync late -- so the picture is delivered 33, 33, 50, 17,
  // which AVERAGES to exactly the 30fps asked for and judders visibly.
  //
  // That is the rider's "laggy and glitchy", and it was invisible to every
  // measurement taken here: frames-per-second was right, the worst frame was
  // right, and nothing was stalling. He found it by loading ?fps=60, which
  // turns this off, and reporting that the problem vanished.
  //
  // Counting refreshes instead makes the cadence exact. On a 60Hz screen a
  // 30fps cap means drawing every second refresh, forever, with no drift and
  // no decision to get wrong. The refresh rate is measured rather than
  // assumed, because a 120Hz phone needs to skip three, not one.
  capTick++;
  if (TOUCH && FPS_CAP) {
    if (capHz === 0) {
      // Median of the first 24 gaps, so one slow frame during warm-up cannot
      // convince this that the screen is 40Hz.
      if (capLast) capGaps.push(now - capLast);
      capLast = now;
      if (capGaps.length >= 24) {
        const g = [...capGaps].sort((a, b) => a - b)[12];
        capHz = g > 0 ? 1000 / g : 60;
        capSkip = Math.max(1, Math.round(capHz / FPS_CAP));
        // the build pacer's notion of a healthy frame follows the cap:
        // drawing every capSkip-th refresh makes ~capSkip vsyncs the budget
        CAP_REF = Math.max(16.7, capSkip * (1000 / capHz));
      }
    } else if (capSkip > 1 && (capTick % capSkip) !== 0) {
      last = lastFrameT;                 // see the note above: never eat time
      requestAnimationFrame(loop); return;
    }
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
      const s2 = o.geometry.boundingSphere;
      const d = Math.hypot(s2.center.x - cx, s2.center.z - cz) - s2.radius;
      o.visible = d < LOD_FAR;
    }
    // compact each static instanced set down to the instances within range
    for (const L of LODI) {
      const f2 = L.far * L.far;
      // The buffer holds fewer seats than the set has instances, so this can run
      // out. It doubles and writes the set again rather than dropping anything —
      // at most a few passes, and only somewhere denser than any vantage the cap
      // was measured from. Overflow is a cost, never a defect.
      let a, c, k = 0, over = true, seats = 0;
      const q = L.r9, rq = L.rq, py = L.py;
      while (over) {
      a = L.o.instanceMatrix.array; c = L.col ? L.o.instanceColor.array : null;
      seats = a.length / 16;
      k = 0; over = false;
      for (let i = 0; i < L.n; i++) {
        const dx = L.px[i] - cx, dz = L.pz[i] - cz;
        if (dx * dx + dz * dz > f2) continue;
        if (k >= seats) { over = true; break; }
        if (q) {
          // The 3x3 dequantised, the position copied. Slots 3, 7, 11 and 15
          // were written at registration and are the same for every seat, so
          // this writes 12 floats where the full path writes 16.
          const s = i * 9, d = k * 16;
          a[d] = q[s] * rq; a[d + 1] = q[s + 1] * rq; a[d + 2] = q[s + 2] * rq;
          a[d + 4] = q[s + 3] * rq; a[d + 5] = q[s + 4] * rq; a[d + 6] = q[s + 5] * rq;
          a[d + 8] = q[s + 6] * rq; a[d + 9] = q[s + 7] * rq; a[d + 10] = q[s + 8] * rq;
          a[d + 12] = L.px[i]; a[d + 13] = py[i]; a[d + 14] = L.pz[i];
        } else a.set(L.src.subarray(i * 16, i * 16 + 16), k * 16);
        if (c) c.set(L.col.subarray(i * 3, i * 3 + 3), k * 3);
        k++;
      }
      if (over) { setLodCap(L, Math.min(L.n, seats * 2)); lodGrew++; }
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

    if (mode === 'onride') {
      // A COMPLETE BRANCH, ending in its own render and return.
      //
      // The walk branch below owns the frame it is in — it simulates, draws and
      // returns — so falling through from here would have run the SCOOTER
      // physics underneath the cable car and then overwritten the seat camera
      // with the chase camera. The ride has to finish its own frame.
      camYaw -= inp.lookDX * 0.0045;
      camPitch = Math.max(-0.6, Math.min(0.7, camPitch + inp.lookDY * 0.0035));
      rideStep(dt);
      // the world simulates AROUND THE CARRIER: rideStep parks the walker
      // under the seat, so every "near the player" system keeps working and
      // the island does not freeze while you are in the air.
      clock += dt;
      if (signals) signals.update(clock);
      for (const es of extraSignals) es.update(clock);
      if (trafficSys) trafficSys.update(clock, dt, signals, walker.x, walker.z);
      simRefresh(walker.x, walker.z, clock);
      for (const t of extraTraffic) if (simNear(t)) t.update(clock, dt, signals, walker.x, walker.z);
      if (crowdSys) crowdSys.update(clock, dt, walker.x, walker.z, signals);
      for (const c of extraCrowds) if (simNear(c)) c.update(clock, dt, walker.x, walker.z, signals);
      if (wayfinder) wayfinder.update(walker, dt);
      sound.update(0, 'walk', 0, 0, trafficNearest(walker.x, walker.z));
      if (PLACES) PLACES.update(camera);
      // THE SKY STOPPED FOLLOWING YOU THE MOMENT YOU SAT DOWN.
      //
      // Found 2026-08-17 by riding all fifteen rides and LOOKING at the
      // frames: the sky was pure `#000000` above the horizon on the FlowRider,
      // the cable car and the luge. It is not a shader fault and not the
      // surround massing — both were ruled out by A/B — and the free camera
      // parked at the FlowRider's own seat coordinates draws a perfect blue
      // sky with clouds. **The difference is this branch.**
      //
      // The dome is a 480m sphere drawn BackSide, and it is kept centred on
      // the camera by `sky.position.copy(activeCam.position)` in the shared
      // frame tail — the comment on the dome itself says why, and says it
      // already rendered black once for exactly this reason. This branch is "a
      // COMPLETE BRANCH, ending in its own render and return", so it never
      // reaches that line. Sit in any carrier and the dome stays parked where
      // you boarded; ride more than its radius away and you are OUTSIDE a
      // back-faced sphere, which renders nothing at all. The Singapore-Sentosa
      // Cable Car is 1,734m long, so the island's signature ride spent most of
      // its four minutes under a black sky.
      //
      // A DUPLICATED FRAME TAIL DRIFTS FROM THE ONE IT COPIED, EVERY TIME.
      // This repo has caught the same shape twice already — the streamed
      // signals line that "existed TWICE in the walk branch and ZERO times
      // here", and `cullDistricts` missing from the ride path while the
      // measurement justifying it was taken riding. Three of the shared tail's
      // jobs were missing here, not one:
      //   * the sky, above;
      //   * NET.update, so other players' avatars FROZE for everyone on a ride;
      //   * the open-map render skip, so the world kept drawing 1.4M triangles
      //     behind an opaque full-screen map while you sat in a gondola.
      sky.position.copy(camera.position);
      if (NET) NET.update();
      cullDistricts();
      if (!document.body.classList.contains('mapopen')) renderer.render(scene, camera);
      frames++;
      if (now - t0 > 1000) reportHud(now);
      requestAnimationFrame(loop);
      return;
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
      // SWIMMING IS A SUB-STATE OF WALKING. You wade in from the beach; at
      // swimming depth the walk becomes a breaststroke; swim to where you
      // can stand and you come out WALKING — the owner's rule, "ppl get out
      // of water must be realistic". The board stays wherever it was left;
      // the summon on the ride button already handles getting it back.
      if (walker.swim) walker.speed = Math.min(walker.speed, 1.35);
      if (trafficHits(walker.x, walker.z, 0.32)) {
        walker.x = wx; walker.z = wz; walker.speed = 0;
      }
      // Enterable sea — wading depth or swimming depth — is passable water,
      // not a wall; everything else keeps moveBlocked's word. The check
      // lives HERE, in the walker's own frame — moveBlocked itself is
      // untouched, so the dressing and every data check still treat water
      // exactly as before.
      if (moveBlocked(walker.x, walker.z) && !seaEnterableAt(walker.x, walker.z)) {
        if (!moveBlocked(walker.x, wz) || seaEnterableAt(walker.x, wz)) walker.z = wz;
        else if (!moveBlocked(wx, walker.z) || seaEnterableAt(wx, walker.z)) walker.x = wx;
        else { walker.x = wx; walker.z = wz; }
      }
      if (!walker.swim && swimmableAt(walker.x, walker.z)) { walker.swim = true; walker.y = null; walker.seat.id = null; }
      else if (walker.swim && !swimmableAt(walker.x, walker.z)
               && (seaEnterableAt(walker.x, walker.z)
                   || !moveBlocked(walker.x, walker.z))) {
        // feet found ground — stand up in the shallows and WALK out
        walker.swim = false; walker.y = null; walker.seat.id = null;
      }
      if (knobEl) {
        knobEl.style.transform = `translate(${input.stickDX.toFixed(1)}px, ${input.stickDY.toFixed(1)}px)`;
      }
      // THE WALKER'S OWN HEIGHT DECIDES WHICH SURFACE THEY ARE ON. Passing it
      // is what lets a raised deck exist at all: without it surfaceAt returns
      // the highest registered surface and standing under a platform puts you
      // on top of it. Seeded from the terrain on the first frame so an arrival
      // never begins by picking a deck out of the air.
      if (walker.swim) {
        // afloat AT the surface, with a light bob; never seated on the bed —
        // surfaceAt would put the walker on the sea floor. The group origin
        // is the FEET and the prone pose swings the body up from there, so
        // the origin sits just under the surface to put the head and
        // shoulders just above it — the first value (-0.52) submerged the
        // whole figure and the vet frame showed empty sea.
        const sy = (window.__seaY ?? 0.1);
        walker.y = sy - 0.12 + Math.sin(clock * 1.4) * 0.045;
      } else {
        if (walker.y == null) walker.y = terrain.at(walker.x, walker.z);
        // the seat's direction is the walker's ACTUAL displacement this frame
        // — boarding a footbridge requires heading along it, and a walker
        // standing still boards nothing
        const sdx = walker.x - wx, sdz = walker.z - wz;
        const sdl = Math.hypot(sdx, sdz);
        if (sdl > 1e-4) { walker.seat.hx = sdx / sdl; walker.seat.hz = sdz / sdl; }
        else { walker.seat.hx = 0; walker.seat.hz = 0; }
        walker.y = surfaceAt(walker.x, walker.z, walker.y, walker.seat);
      }
      walkerRig.group.position.set(walker.x, walker.y, walker.z);
      walkerRig.group.rotation.y = walker.heading;
      if (walker.swim) walkerRig.swimPose(walker.phase, walker.speed);
      else walkerRig.pose(walker.phase, walker.speed);
      const wgy = terrain.at(walker.x, walker.z);
      sun.position.set(walker.x + SUNDIR.x * 150, wgy + SUNDIR.y * 150, walker.z + SUNDIR.z * 150);
      sun.target.position.set(walker.x, wgy, walker.z);
      sun.target.updateMatrixWorld();
      clock += dt;
      if (signals) signals.update(clock);
      for (const es of extraSignals) es.update(clock);
      if (trafficSys) trafficSys.update(clock, dt, signals, walker.x, walker.z);
      simRefresh(walker.x, walker.z, clock);
      for (const t of extraTraffic) if (simNear(t)) t.update(clock, dt, signals, walker.x, walker.z);
      if (crowdSys) crowdSys.update(clock, dt, walker.x, walker.z, signals);
      for (const c of extraCrowds) if (simNear(c)) c.update(clock, dt, walker.x, walker.z, signals);
      if (wayfinder) wayfinder.update(walker, dt);
      // the ride offer changes as you walk up to a station; twice a second is
      // plenty and keeps a DOM write out of the frame
      if (RIDES && now - lastRideLabel > 500) { lastRideLabel = now; modeLabel(); }
      updateGuide(walker.x, walker.z, now);
      sound.update(0, 'walk', walker.speed, walker.phase, trafficNearest(walker.x, walker.z));
      if (SPEC) driveCamera(dt); else walkCamera(dt);
      if (PLACES) PLACES.update(camera);
      cullDistricts();
      renderer.render(scene, camera);
      frames++;
      if (now - t0 > 1000) reportHud(now);
      requestAnimationFrame(loop);
      return;
    }

    const px = S.x, pz = S.z;
    // NOBODY RIDES BEHIND THE ARRIVAL PANEL. The panel used to be cosmetic:
    // the ride carried on underneath it, so the rider still crossed a district
    // that was mid-build and still met every stutter, they simply could not
    // see where. Throttle and steering are ignored until the street is up.
    if (ARRIVING) { inp.throttle = 0; inp.brake = 1; inp.steer = 0; S.speed = 0; }
    // SUB-STEP THE PHYSICS THROUGH JANK. dt is clamped to 0.05, so on a
    // phone whose first seconds after ready run at a few fps, six real
    // seconds advanced the sim by a fraction of one — full throttle read
    // as "cannot drive off, wait a while". The ride model is pure and
    // cheap, so it runs as many <=50ms slices as the REAL elapsed time
    // needs (bounded, so a background tab does not fast-forward);
    // everything else keeps the clamped dt and merely slow-mos through
    // the jank, which is cosmetic.
    {
      const SF = surfaceNow(S.x, S.z, dt);
      let realDt = Math.min(0.24, rawDt);
      while (realDt > 0.0001) {
        const slice = Math.min(0.05, realDt);
        step(S, slice, inp.throttle, inp.brake, inp.steer, rideParams, SF);
        realDt -= slice;
      }
      // SKID MARKS, hung off the drift state the physics just produced rather
      // than off speed — cruising leaves nothing and a committed slide leaves a
      // pair of lines. Built here because this is the one place that has the
      // ride state and the surface classification in the same breath. One mesh,
      // one draw call, a fixed ring buffer; see src/skid.js. `?noskid` off.
      if (SKID) SKID.update(S, window.__surface().kind, surfaceAt, dt);
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
      const rv = vehicleAt(vehicleKind);
      const rr = rv.rr, rlat = rv.rlat;
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
    if (rideBlocked(S.x, S.z)) {
      // RIDING INTO THE SEA GETS OFF THE BOARD, NOT A WALL (2026-08-14). If
      // what stopped the ride is enterable water — mapped water, no deck, no
      // solid geometry — the rider steps off at the last dry spot and is
      // WALKING (the owner's rule for water exits applies to entries too):
      // wade in and the walk becomes the swim. The vehicle stays beached;
      // the ride button's summon already knows how to bring it back.
      if (!(SOLID && SOLID.at(S.x, S.z))
          // What stopped the board must be ground the WALKER is allowed on:
          // the wet-sand overreach band (blocked for wheels, open on foot by
          // the beach rule) or enterable sea. A fence or wall is neither.
          && (seaEnterableAt(S.x, S.z)
              || (inWater(S.x, S.z) && !moveBlocked(S.x, S.z)))
          // ...and only on an actual CROSSING: the rider was moving, and the
          // spot they came from was ridable. Without these two, a rider
          // STANDING on beach sand that a stale water polygon overreaches
          // got dismounted while parked — the first mobile test did exactly
          // that at Siloso before any key was pressed.
          && Math.abs(S.speed) > 0.4 && !rideBlocked(px, pz)) {
        walker.x = px; walker.z = pz; walker.heading = S.heading;
        walker.speed = Math.min(1.2, Math.abs(S.speed) * 0.3);
        walker.y = null; walker.seat.id = null; walker.swim = false;
        S.x = px; S.z = pz; S.speed = 0; S.reversing = false;
        camYaw = S.heading; camPitch = 0.16;
        walkerRig.group.visible = true;
        rider.visible = false;
        skater.visible = false;
        mode = 'walk';
        updateHelp();
      } else {
        // slide along the wall rather than dead-stopping: keep whichever
        // single axis of the attempted move is still free
        const tryX = { x: S.x, z: pz }, tryZ = { x: px, z: S.z };
        if (!rideBlocked(tryX.x, tryX.z)) { S.z = pz; S.speed *= 0.86; }
        else if (!rideBlocked(tryZ.x, tryZ.z)) { S.x = px; S.speed *= 0.86; }
        else { S.x = px; S.z = pz; S.speed *= 0.2; }
      }
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
    } else if (vehicleKind === 'skate') {
      // THE CARVE. The board banks with the lean like the scooter does, but
      // SKATE.leanMax is 0.80 against the scooter's 0.62, so it goes right
      // over — and the skater is a child of the board, so they go with it.
      skateRig.group.rotation.z = S.lean;
      // AND IT PIVOTS ON THE LOW RAIL, NOT THE CENTRELINE. The scooter gets
      // away with a plain rotation because both its wheels sit ON the
      // centreline, so leaning cannot move them down. A board's wheels are
      // 0.108m out to each side, and rotating about the middle drove the
      // low pair 5.3cm THROUGH the tarmac at full lean. Pivoting about the
      // low wheel's contact patch is both the fix and what really happens:
      // the wheels stay planted and the deck rises on the high side.
      const a = Math.abs(S.lean), px = -Math.sign(S.lean) * SK_WHEEL_X;
      skateRig.group.position.set(px * (1 - Math.cos(a)), Math.abs(px) * Math.sin(a), 0);
      // AND THE FRONT TRUCK STEERS, which is the other half of what a surf
      // skate looks like from behind: the deck points one way and the front
      // wheels are already round the corner. Taken from the lean rather than
      // the raw input so it agrees with what the board is actually doing.
      const swivel = Math.max(-0.6, Math.min(0.6, -S.lean * 0.75));
      skateRig.wheels[0].rotation.set(-S.wheel, swivel, 0);
      skateRig.wheels[1].rotation.set(-S.wheel, 0, 0);
      // AND THE RIDER RIDES. Until 2026-08-17 he was a single frozen pose
      // bolted to the deck — the one object on screen in EVERY frame of this
      // game, and the only one that never moved. buildSkater now hands out a
      // four-part rig (see its note); this is the whole of the animation, and
      // it is driven by the STATE, never by a timer, so it cannot drift out of
      // sync with what the board is doing and it is deterministic for a golden.
      //
      //   crouch  from speed, carve and drift together — a rider stands tall
      //           cruising and gets low when the board is working.
      //   carve   the lean, normalised: legs compress, the torso rolls INTO
      //           the turn and opens its shoulders toward it, the arms
      //           counter-balance across the deck.
      //   AND THE NEUTRAL POSE IS UNTOUCHED. Every term below is zero when the
      //   board is standing still, deliberately: a constant forward fold read
      //   better in isolation and moved 27 of 40 goldens by 0.10-0.16% — the
      //   rider is in every frame, so any resting change is an island-wide
      //   diff for nothing. He now stands exactly as he always did and moves
      //   only when the board does.
      //   slip    the drift angle: he looks further round than he leans,
      //           which is what makes a slide read as intended rather than as
      //           the board sliding out from under a passenger.
      const RG = skater.userData.rig;
      if (RG) {
        const v = Math.min(1, S.speed / SKATE.vMax);
        const carve = Math.max(-1, Math.min(1, S.lean / SKATE.leanMax));
        const slip = Math.max(-1, Math.min(1, (S.slip || 0) / 0.5));
        const crouch = Math.min(1, v * 0.5 + Math.abs(carve) * 0.5 + (S.drifting ? 0.3 : 0));
        // the legs fold toward the PLANTED feet and the hips ride down with
        // them — a crouch, not a shrink
        RG.low.scale.y = 1 - crouch * 0.11;
        RG.up.position.y = RG.y.pelvis - (RG.y.pelvis - RG.y.ankle) * crouch * 0.11;
        RG.up.rotation.set(crouch * 0.28, carve * 0.20 + slip * 0.16, -carve * 0.26);
        RG.head.rotation.set(-crouch * 0.16, carve * 0.42 + slip * 0.34, 0);
        RG.armF.rotation.set(carve * 0.28, 0, -carve * 0.42 - crouch * 0.10);
        RG.armB.rotation.set(-carve * 0.24, 0, -carve * 0.38 + crouch * 0.08);
        // THE PUSH. ride.js has said it since it was written — "on a board the
        // throttle is a foot on the road, and a push runs out" — and the figure
        // never took part: he accelerated from a dead stop with both feet
        // bolted to the deck, which is the one thing everybody knows a
        // skateboard cannot do.
        //
        // The stroke runs while the throttle is down and the board is still
        // under about two thirds of its top speed, which is exactly the window
        // where a real rider is still kicking rather than cruising. Its phase
        // advances with DISTANCE, not with a clock: `(0.9 + speed) * dt` gives
        // one stroke per stride at walking pace and stretches out as the board
        // picks up, so the foot never scrabbles faster than the ground goes
        // past, and the whole thing stays deterministic for a golden.
        const pushing = inp.throttle > 0.15 && S.speed < SKATE.vMax * 0.66 && !S.drifting;
        pushPhase = pushing ? (pushPhase + (0.9 + S.speed) * dt * 0.62) % 1 : 0;
        // one kick: reach forward (nothing), plant and drive back, then recover
        const kick = pushing ? Math.sin(pushPhase * Math.PI * 2) : 0;
        const reach = pushing ? (0.5 - 0.5 * Math.cos(pushPhase * Math.PI * 2)) : 0;
        RG.legB.rotation.x = kick * 0.62 - reach * 0.10;
        RG.legB.position.y = RG.y.hipB - (RG.y.hipB - RG.y.ankle) * crouch * 0.11;
        // the body dips over the planted foot and the free arm swings with it
        RG.up.rotation.x += reach * 0.10;
        RG.armB.rotation.x += -kick * 0.35;
      }
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
    // Streamed districts' signal heads. This line existed TWICE in the walk
    // branch and ZERO times here — so every traffic light outside the boot
    // district froze the moment you got on the bike. Audit find, 2026-08-03.
    for (const es of extraSignals) es.update(clock);
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

  // friends' avatars interpolate here — cheap (no physics, a few lerps);
  // the 10Hz network send runs on its own timer inside Net, never in a frame
  if (NET) NET.update();

  const activeCam = CAM === 'top' ? topCam : camera;
  sky.position.copy(activeCam.position);      // keeps the dome inside the far plane
  // CULL DISTRICTS IN RIDE MODE TOO. This call sat only in the walk branch —
  // the one mode the rider does not use — while the measurement that
  // justified it ("1.6 of 9 seconds of riding on a phone-speed CPU inside
  // three.js's own scene walk") was taken RIDING. Found 2026-08-03 by audit:
  // the whole documented saving was missing from the hot path.
  cullDistricts();
  // The first frame of the finished world compiles every shader and uploads
  // every texture and geometry, synchronously. It was invisible to the boot
  // marks — build "done" at 12s, page usable at 21s — so it is timed like a
  // build phase, because it is one.
  // The ride branch renders through activeCam (which may be the top-down map
  // camera), so the labels are updated against the camera actually drawing.
  if (PLACES) PLACES.update(activeCam);
  updateGuide(S.x, S.z, now);
  // NOTHING IS RENDERED BEHIND THE OPEN MAP.
  //
  // The map is an opaque full-screen canvas, and the world kept drawing at
  // full rate underneath it — 1.4M triangles and ~509 draws per frame that
  // nobody can see. It is not only waste: it is what starved the place card's
  // slide-in, which measured 50ms of CSS transition taking over 700ms of wall
  // clock to finish because the main thread never had a gap (2026-08-05, the
  // map-travel check). Skipping the render frees the thread for the interface
  // that IS on screen, and stops a phone cooking while someone reads the map.
  //
  // The loop itself keeps running: the wayfinder needs its per-frame update to
  // know where you are, and the map redraws from that.
  const mapUp = document.body.classList.contains('mapopen');
  if (mapUp) { /* the map is the frame */ }
  else if (ready && window.__ff === undefined) {
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
      (mode === 'walk' ? (walker.swim ? 'swimming' : 'on foot')
        : `${Math.abs(S.speed * 3.6) | 0} km/h${S.reversing ? ' R' : ''}`) +
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

// let the vet harness drive without touching the screen.
//
// IT RETURNS A PROMISE THAT RESOLVES WHEN THE THROTTLE LIFTS, and that is not a
// convenience. It used to return undefined, so `await window.__drive(1,0,1)` in
// a loop passed ZERO milliseconds — every sample in stuckcheck's ten-second
// drive was taken in the same instant, 260ms after the teleport. Whether a
// stretch "stalled" then depended on whether one rAF frame had happened to land
// in that settle, which is how Paradise Island spent a session on the open list
// as a rider stall that does not exist (measured 2026-08-05: it accelerates to
// 28 km/h like anywhere else). A harness that awaits this now waits.
window.__drive = (throttle, steer, seconds) => {
  window.__force = { throttle, steer, brake: 0 };
  return new Promise((res) => setTimeout(() => { window.__force = null; res(); },
    seconds * 1000));
};
// Put the ride at a point, facing a heading. The coverage sweep uses this to
// visit every street in the district without reloading the world 300 times.
// Where the ride is. The crowd's separation, dodge and draw culling are all
// gated on distance from THIS point, so a check about any of them has to know
// it -- D33 was measuring 2,200 walkers across three districts against a
// behaviour that runs within 120m by design.
window.__ridePos = () => [S.x, S.z];
// Speed in km/h, for the ?diag panel: "slowmo" is a speed complaint, not a
// frame-rate one, and only this number can tell them apart.
window.__kmh = () => Math.abs(S.speed * 3.6);
// ARRIVING OVERLAY. The boot screen is removed once the world is up, so this is
// a small standalone panel reused for every arrival.
let arriveEl = null;
function arriveShow(on, msg) {
  if (on && !arriveEl) {
    arriveEl = document.createElement('div');
    arriveEl.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;'
      + 'align-items:center;justify-content:center;background:#141518;color:#e8e6e1;'
      + 'font:500 17px ui-sans-serif,system-ui,-apple-system,Helvetica,Arial;'
      + 'letter-spacing:.02em;transition:opacity .35s;opacity:0';
    document.body.appendChild(arriveEl);
    requestAnimationFrame(() => { if (arriveEl) arriveEl.style.opacity = '1'; });
  }
  if (arriveEl) {
    if (msg) arriveEl.textContent = msg;
    if (!on) {
      arriveEl.style.opacity = '0';
      const el = arriveEl; arriveEl = null;
      setTimeout(() => el.remove(), 420);
    }
  }
}

// ARRIVE PROPERLY INSTEAD OF STUTTERING INTO A HALF-BUILT DISTRICT.
//
// The rider reported ten seconds of stutter after loading in AND after every
// teleport, and six rounds of breaking up individual build loops did not fix
// it — a CPU profile of those seconds has no idle time in it at all, because
// culling, the collision grid, matrix updates, audio and the traffic all land
// on the same frames as the build. There is no single job to shrink.
//
// The real problem is that the world is being built UNDERNEATH someone who is
// already riding in it. So when the place being arrived at is not built yet,
// hold a brief panel, build it at full speed with nobody looking, and reveal a
// finished street. Two seconds of a clean overlay beats ten of stuttering.
window.__arriveWait = async (x, z) => {
  const recs = window.__streamRecs || [];
  const here = recs.filter((r) => {
    const b2 = r.box;
    return b2 && b2.length === 4 && x >= b2[0] && x <= b2[2] && z >= b2[1] && z <= b2[3];
  });
  // Already standing in something built, and the streamer has nothing queued:
  // no panel, no pause.
  if (here.some((r) => r.group) && window.__streamIdle !== false) return;
  if (!here.length && window.__streamIdle !== false) return;
  ARRIVING = true;                       // Y() builds at full speed while set
  arriveShow(true, 'arriving');
  const t0 = performance.now();
  // Give the streamer a moment to notice the new position before believing an
  // "idle" left over from where the rider just was.
  await new Promise((r) => setTimeout(r, 200));
  while (performance.now() - t0 < 20000) {
    // MEASURED BOTH WAYS, 2026-07-31, phone viewport, teleport to Bugis.
    // Releasing as soon as the district underfoot exists gave a 3.3s panel and
    // then ten seconds of 28-45fps with five hitches, worst 400ms, because the
    // neighbouring districts were still arriving. Waiting for the streamer to
    // go quiet gave a 10.3s panel and then a flat 60fps with no hitch at all.
    // A longer honest wait beats a shorter dishonest one.
    if (window.__streamIdle && (!here.length || here.some((r) => r.group))) break;
    await new Promise((r) => setTimeout(r, 120));
  }
  ARRIVING = false;
  arriveShow(false);
};
window.__arriving = () => ARRIVING;

// WHERE A PLAYER CAN ACTUALLY STAND, NEAR WHERE THEY ASKED TO GO.
//
// The owner, 2026-08-05: "once i teleport to palawan beach my avatar stuck".
// It is not Palawan. A map pin carries the attraction's OWN coordinate — a
// building centroid, a beach ring's centre — and __teleport sets the position
// and nothing else. Measured across all 78 pins: 46 of them land inside solid
// geometry. Palawan Beach's centre is 24m inside; the worst, Revenge of the
// Mummy, is 34m. Every single one has clear ground within 34m, which is why a
// short outward search is the whole fix.
//
// THIS IS NOT IN __teleport ITSELF, deliberately. The golden frames place
// their cameras with __teleport and several of those vantages are inside
// geometry on purpose; nudging them would move all fourteen baselines and
// spend the regression net to fix a travel bug. Travel calls this, probes do
// not.
//
// rideBlocked is the test, not blocked(): it is the gate that actually governs
// moving, and it knows a boardwalk deck over water is standable. Each ring is
// rotated so a failed search does not always drift the player the same way.
// STANDING SOMEWHERE IS NOT THE SAME AS BEING SOMEWHERE.
//
// The first version of this asked only whether the arrival POINT was clear, and
// that took the stranded destinations from 46 to 0 by its own measure. The
// owner then reported the defect it could not see: "i went to some teleport
// locations and I cant even move." A point inside a sealed courtyard passes a
// clearance test perfectly. Audited across all 95 destinations, four of them
// dropped the player somewhere they could not walk out of — the Singapore
// Oceanarium reached ZERO metres, and two luge trailheads were no better.
//
// So a landing spot now has to be somewhere you can LEAVE. The flood is small
// and deliberately cheap: this runs once per journey, never per frame, and it
// only has to tell a courtyard from the island.
const CAN_MOVE_CELLS = 70;       // ~70 strides of open ground is not a pocket
function canMoveFrom(sx, sz) {
  const STEP = 1.5;
  const seen = new Set(['0,0']);
  const q = [[sx, sz]];
  let n = 0;
  while (q.length && n < CAN_MOVE_CELLS) {
    const [x, z] = q.shift();
    n++;
    for (const [dx, dz] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]]) {
      const nx = x + dx, nz = z + dz;
      if (Math.hypot(nx - sx, nz - sz) > 30) continue;
      const k = Math.round((nx - sx) / STEP) + ',' + Math.round((nz - sz) / STEP);
      if (seen.has(k)) continue;
      seen.add(k);
      if (rideBlocked(nx, nz)) continue;
      q.push([nx, nz]);
    }
  }
  return n >= CAN_MOVE_CELLS;
}

window.__landNear = (x, z, maxR = 40) => {
  if (!rideBlocked(x, z) && canMoveFrom(x, z)) return { x, z };
  let fallback = null;
  for (let r = 2; r <= maxR; r += 2) {
    for (let a = 0; a < 24; a++) {
      const th = a * (Math.PI / 12) + r * 0.37;
      const qx = x + Math.cos(th) * r, qz = z + Math.sin(th) * r;
      if (rideBlocked(qx, qz)) continue;
      // remember the first merely-clear spot, in case nothing open is found
      if (!fallback) fallback = { x: qx, z: qz };
      if (canMoveFrom(qx, qz)) return { x: qx, z: qz };
    }
  }
  // nothing open within reach: somewhere you can stand beats refusing to travel
  return fallback || { x, z };
};

// THE STRANDING TEST, EXPOSED, BECAUSE THE DESTINATION LIST GREW.
//
// The owner, 2026-08-17, asked for every attraction on the travel map, and the
// list went from ~40 places to ~95 — most of them new ones INSIDE Universal
// Studios and Adventure Cove, which is exactly the walled, sealed-courtyard
// geometry that produced "i went to some teleport locations and I cant even
// move" the first time. A destination list that grows without this measurement
// is a list of places to get stuck in.
//
// `open` is the answer that matters: false means __landNear could only find
// somewhere to STAND, not somewhere to LEAVE. Kept here beside the flood it
// calls rather than in a probe file, so the gate can never test a different
// rule from the one travel actually uses.
window.__landAudit = (x, z) => {
  const q = window.__landNear(x, z);
  return { x: q.x, z: q.z, open: canMoveFrom(q.x, q.z),
           moved: Math.hypot(q.x - x, q.z - z) };
};

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
  // Not awaited: __teleport is synchronous and its callers read the return
  // value. The overlay raises and lowers itself.
  if (!window.__noArrive) window.__arriveWait(S.x, S.z);
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
  camInit = false;
  // This is the jump the rider actually uses, from the district list. It set
  // the position and returned, dropping them straight into a district that had
  // not been built — which is the "teleport somewhere and it lags for ten
  // seconds" report. Same arrival panel as __teleport.
  window.__arriveWait(S.x, S.z);
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
// VET HOOKS for the rides. `__rides()` lists what exists and where you board;
// `__board(i)` puts the player in seat i without walking there, so a probe can
// ride the whole line and check the seat against the wire.
// `len` IS THE WIRE. `ride` IS WHAT YOU ACTUALLY TRAVEL, AND SINCE THE CABLE
// CAR STOPS AT ITS LAST STATION THOSE ARE NO LONGER THE SAME NUMBER.
//
// Reported after the flight-strip tool quietly stopped at 56% of the
// Singapore-Sentosa Cable Car and looked like a stall. It was not: the ride
// ends at s=990.6 of a 1,734m wire, so every mark the tool placed past 57% of
// `len` could never fire. **A tool that measures progress against the wrong
// total reports a working ride as a broken one**, and the next probe to be
// written would have made the same mistake. So the travelled range is stated
// here rather than left to be inferred.
window.__rides = () => (RIDES ? RIDES.rides.map((r, i) => {
  const s0 = r.s0 || 0, s1 = r.s1 != null ? r.s1 : r.len;
  return {
    i, kind: r.kind, name: r.name,
    len: +r.len.toFixed(0),          // the wire, end to end
    ride: +(s1 - s0).toFixed(0),     // what a passenger travels
    s0: +s0.toFixed(1), s1: +s1.toFixed(1),
    boards: r.boards.map((b) => [Math.round(b.x), Math.round(b.z), +b.y.toFixed(1)]),
  };
}) : []);
window.__board = (i, endIdx = 0) => {
  if (!RIDES || !RIDES.rides[i]) return false;
  const r = RIDES.rides[i];
  const b = r.boards[Math.min(endIdx, r.boards.length - 1)];
  walker.x = b.x; walker.z = b.z;
  if (mode === 'ride') toggleMode();
  return boardRide({ ride: r, board: b });
};
window.__rideState = () => (onRide ? {
  name: onRide.ride.name, kind: onRide.ride.kind,
  s: +onRide.s.toFixed(1), len: +onRide.ride.len.toFixed(1),
  cam: [+camera.position.x.toFixed(1), +camera.position.y.toFixed(1), +camera.position.z.toFixed(1)],
} : null);
// THE RIDER'S POSE, for the animation vet. A still frame cannot tell a rig
// that is being driven from one that is stuck in a pose that happens to look
// like motion, and this project's own law is that motion is verified in REAL
// PLAYBACK at wall-clock. This hands the harness the numbers behind the frame.
window.__rider = () => {
  const R = skater.userData.rig;
  return {
    kmh: +(S.speed * 3.6).toFixed(1), lean: +S.lean.toFixed(3),
    slip: +(S.slip || 0).toFixed(3), drifting: !!S.drifting,
    crouch: R ? +(1 - R.low.scale.y).toFixed(3) : null,
    fold: R ? +R.up.rotation.x.toFixed(3) : null,
    roll: R ? +R.up.rotation.z.toFixed(3) : null,
    look: R ? +R.head.rotation.y.toFixed(3) : null,
    push: R ? +R.legB.rotation.x.toFixed(3) : null, phase: +pushPhase.toFixed(2),
  };
};
window.__toggle = () => toggleMode();
window.__walker = () => ({ x: +walker.x.toFixed(1), z: +walker.z.toFixed(1), h: +walker.heading.toFixed(3), sp: +walker.speed.toFixed(2) });
// heading included: a probe that wants to stand in front of the rider rather
// than behind them cannot work it out from x/z alone (data/avatar.mjs)
window.__state = () => ({ x: +S.x.toFixed(1), z: +S.z.toFixed(1), h: +S.heading.toFixed(3), kmh: +(S.speed * 3.6).toFixed(1) });
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
