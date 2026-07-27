import * as THREE from '../lib/three.module.js';
import { PAL, R, rand, pick, chance } from './tex.js';
import { MAT, buildBuildings, buildRoads, TreeField, aoPatch } from './city.js';
import { buildVespa, buildRider, newState, step, RIDE } from './vespa.js';
import { TOUCH, input, attachTouch, attachMouse, readInput, touchDebug } from './input.js';
import { newWalker, stepWalk, buildWalker, WALK } from './player.js';
import { buildMarkings, dressSideStreets } from './markings.js';
import { buildSgDetail } from './sgdetail.js';
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
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = !P.has('noshadow');
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc9c3b2, 0.0021);
const camera = new THREE.PerspectiveCamera(58, 1, 0.3, 1400);

/* ---------------- sky + light ---------------- */
const SUNDIR = new THREE.Vector3(-0.52, 0.80, -0.30).normalize();
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(900, 40, 24),
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
  })
));

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
function blocked(x, z) {
  const list = colGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
  if (!list) return false;
  for (const poly of list) if (inPoly(poly, x, z)) return true;
  return false;
}

/* ---------------- street dressing, all instanced ---------------- */
function dressStreet(data, axis) {
  if (!axis) return 0;
  const pts = axis.p, half = axis.w / 2;
  const trees = new TreeField();
  const kerbT = [], lampT = [], armT = [], headT = [], zebraT = [];
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
        if (acc % 13 === (sgn > 0 ? 0 : 6)) {
          for (const off of [3.2, 2.2, 4.4]) {
            const tx = px + nx * (half + off) * sgn, tz = pz + nz * (half + off) * sgn;
            if (!blocked(tx, tz)) { trees.add(tx, tz, rand(0.85, 1.15)); break; }
          }
        }
        if (acc % 34 === 0) {
          lampT.push([kx, 4.5, kz, 0]);
          armT.push([kx - nx * 1.1 * sgn, 8.9, kz - nz * 1.1 * sgn, ang, sgn]);
          headT.push([kx - nx * 2.3 * sgn, 8.75, kz - nz * 2.3 * sgn, ang]);
        }
        if (acc % 2 === 0) kerbT.push([kx, 0.15, kz, ang]);
      }
      if (acc % 190 === 0 && acc > 40) {
        crossingS.push(acc);
        for (let s2 = -3; s2 <= 3; s2++)
          zebraT.push([px + nx * s2 * 1.3, 0.035, pz + nz * s2 * 1.3, ang]);
      }
    }
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1);
  const emit = (geo, mat, list, fn) => {
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((rec, i) => { fn(rec); m.compose(p3, q, s3); im.setMatrixAt(i, m); });
    im.castShadow = false; im.receiveShadow = true;   // keeps them out of the shadow pass
    world.add(im);
  };
  emit(new THREE.BoxGeometry(0.42, 0.3, 2.0), MAT.kerb, kerbT, (r) => {
    p3.set(r[0], r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  emit(new THREE.CylinderGeometry(0.11, 0.16, 9.0, 8), MAT.metal, lampT, (r) => {
    p3.set(r[0], r[1], r[2]); q.identity();
  });
  emit(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), MAT.metal, armT, (r) => {
    p3.set(r[0], r[1], r[2]); e.set(0, r[3], Math.PI / 2 - 0.2 * r[4]); q.setFromEuler(e);
  });
  emit(new THREE.BoxGeometry(1.0, 0.2, 0.44), MAT.trim, headT, (r) => {
    p3.set(r[0], r[1], r[2]); e.set(0, r[3], 0); q.setFromEuler(e);
  });
  emit(new THREE.PlaneGeometry(0.62, axis.w), MAT.white, zebraT, (r) => {
    p3.set(r[0], r[1], r[2]);
    e.set(-Math.PI / 2, r[3] + Math.PI / 2, 0, 'YXZ');
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
bike.add(vespa.group);
scene.add(bike);

let S = newState(0, 0, 0);
let ready = false, stats = {};
let crowdSys = null, trafficSys = null, wayfinder = null, signals = null;
let mode = 'ride';                 // 'ride' | 'walk'
const sound = new Sound();
// browsers will not start audio without a gesture
for (const ev of ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click']) {
  addEventListener(ev, () => { sound.start(); sound.poke(); }, { passive: true });
}
let camYaw = 0, camPitch = 0.16;   // free look, walk mode
const walker = newWalker();
const walkerRig = buildWalker();
walkerRig.group.visible = false;
scene.add(walkerRig.group);
let clock = 0;

fetch('./data/orchard.json').then((r) => r.json()).then((data) => {
  indexBuildings(data);
  const bs = P.has('nobuild') ? { count: 0, tall: 0 } : buildBuildings(world, data);
  const fallbackAxis = buildRoads(world, data);
  const axis = data.axis || fallbackAxis;

  // ground plane under everything so there are no holes between road ribbons
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2600),
    new THREE.MeshStandardMaterial({ color: 0x9a9384, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05;
  ground.receiveShadow = true; world.add(ground);

  const treeCount = P.has('nofoliage') ? 0 : dressStreet(data, axis);
  if (!P.has('nopeople') && axis) {
    crowdSys = new Crowd(axis, blocked, 150);
    crowdSys.build(world);
    // must come after construction, or the handover is a no-op
    if (window.__crossings) crowdSys.setCrossings(window.__crossings);
  }
  if (!P.has('notraffic') && axis) {
    trafficSys = new Traffic(axis, 18, 3);
    trafficSys.build(world, trafficSys.path.nearestS(S.x, S.z));
  }
  const furniture = (!P.has('nofurniture') && axis)
    ? buildFurniture(world, axis, blocked) : {};
  signals = new Signals(furniture.signals || []);
  const signage = (!P.has('nosigns') && axis)
    ? buildSignage(world, axis, data, blocked) : {};
  const marks = (!P.has('nomarks') && axis) ? buildMarkings(world, axis) : 0;
  const side = (!P.has('noside') && axis)
    ? dressSideStreets(world, data, axis, blocked, TreeField) : {};
  const sg = (!P.has('nosg') && axis) ? buildSgDetail(world, axis, data, blocked) : {};
  if (axis) wayfinder = new Wayfinder(data, axis);
  window.__axis = axis;
  const people = crowdSys ? crowdSys.people.length : 0;

  // start on Orchard Road facing along it
  if (axis) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < axis.p.length - 1; i++) {
      const d = axis.p[i][0] * axis.p[i][0] + axis.p[i][1] * axis.p[i][1];
      if (d < bestD) { bestD = d; best = i; }
    }
    const p0 = axis.p[best], p1 = axis.p[Math.min(best + 1, axis.p.length - 1)];
    const dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = Math.hypot(dx, dz) || 1;
    const nx = -dz / L, nz = dx / L;
    S = newState(p0[0] + nx * -3.4, p0[1] + nz * -3.4, Math.atan2(dx, dz));
  }
  stats = { marks, ...side, ...sg, merged: bs.mergedMeshes, junctions: (furniture.signals || []).length, buildings: bs.count, bespoke: bs.bespoke, towers: bs.tall, roads: data.roads.length, people, trees: treeCount, ...furniture, ...signage };
  ready = true;
  window.__ready = true;
  window.__stats = stats;
}).catch((e) => { hud.textContent = 'data load failed: ' + e.message; });

if (TOUCH) attachTouch(canvas);
attachMouse(canvas);
{
  const sbtn = document.getElementById('soundbtn');
  if (sbtn) {
    const tap = (e) => {
      e.preventDefault(); e.stopPropagation();
      sound.start();
      sound.setMuted(!sound.muted);
      sbtn.textContent = sound.muted ? 'Sound off' : 'Sound on';
    };
    sbtn.addEventListener('click', tap);
    sbtn.addEventListener('touchstart', tap, { passive: false });
  }
}
{
  const btn = document.getElementById('modebtn');
  if (btn) {
    const tap = (e) => { e.preventDefault(); e.stopPropagation(); toggleMode(); };
    btn.addEventListener('click', tap);
    btn.addEventListener('touchstart', tap, { passive: false });
  }
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
  camera.position.set(
    walker.x - fx * back * cy + rx * side,
    eye + back * sy * 0.75,
    walker.z - fz * back * cy + rz * side
  );
  // aim along the look direction, not at the walker, so it reads first-person
  const AHEAD = 12;
  camera.lookAt(
    walker.x + fx * AHEAD * cy + rx * side,
    eye - sy * AHEAD,
    walker.z + fz * AHEAD * cy + rz * side
  );
  camera.fov = 65; camera.updateProjectionMatrix();
}

const camPos = new THREE.Vector3(), camAim = new THREE.Vector3();
let camInit = false;
// vet-only free camera: ?spec=x,y,z,tx,ty,tz
const SPEC = (P.get('spec') || '').split(',').map(Number);
const SPEC_ON = SPEC.length === 6 && SPEC.every((n) => Number.isFinite(n));

function driveCamera(dt) {
  if (SPEC_ON) {
    camera.position.set(SPEC[0], SPEC[1], SPEC[2]);
    camera.lookAt(SPEC[3], SPEC[4], SPEC[5]);
    camera.fov = 46; camera.updateProjectionMatrix();
    return;
  }
  const fwd = new THREE.Vector3(Math.sin(S.heading), 0, Math.cos(S.heading));
  const want = new THREE.Vector3(S.x, 0, S.z)
    .addScaledVector(fwd, -5.8).add(new THREE.Vector3(0, 3.05, 0));
  const aim = new THREE.Vector3(S.x, 1.35, S.z).addScaledVector(fwd, 7.5);
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
      walkerRig.group.position.set(walker.x, 0, walker.z);
      walkerRig.group.rotation.y = walker.heading;
      walkerRig.pose(walker.phase, walker.speed);
      sun.position.set(walker.x + SUNDIR.x * 150, SUNDIR.y * 150, walker.z + SUNDIR.z * 150);
      sun.target.position.set(walker.x, 0, walker.z);
      sun.target.updateMatrixWorld();
      clock += dt;
      if (signals) signals.update(clock);
      if (trafficSys) trafficSys.update(clock, dt, signals);
      if (crowdSys) crowdSys.update(clock, dt, walker.x, walker.z, signals);
      if (wayfinder) wayfinder.update(walker, dt);
      sound.update(0, 'walk', walker.speed, walker.phase);
      walkCamera(dt);
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

    bike.position.set(S.x, 0, S.z);
    bike.rotation.y = S.heading;
    vespa.group.rotation.z = S.lean;
    vespa.wheels[0].rotation.x = -S.wheel;
    vespa.wheels[1].rotation.x = -S.wheel;

    // keep the shadow frustum on the rider, not the whole town
    sun.position.set(S.x + SUNDIR.x * 150, SUNDIR.y * 150, S.z + SUNDIR.z * 150);
    sun.target.position.set(S.x, 0, S.z);
    sun.target.updateMatrixWorld();

    clock += dt;
    if (signals) signals.update(clock);
    if (trafficSys) trafficSys.update(clock, dt, signals);
    if (crowdSys) crowdSys.update(clock, dt, S.x, S.z, signals);
    if (wayfinder) wayfinder.update(S, dt);
    sound.update(S.speed, 'ride', 0, 0);

    driveCamera(dt);
  }

  renderer.render(scene, CAM === 'top' ? topCam : camera);

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
window.__inp = () => ({ TOUCH, steer: input.steer, throttle: input.throttle, brake: input.brake, touches: touchDebug(), fired: window.__touchFired || 0 });
window.__snd = sound;
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
