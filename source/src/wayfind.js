// Knowing where you are: a place readout, a minimap, and street signage.
// All three lean on the names already in the OSM data, so nothing is invented.
import * as THREE from '../lib/three.module.js';
import { rand, pick } from './tex.js';
import { MAT, groundAt } from './city.js';

/* ---------------- sign textures ---------------- */
function signCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// LTA-style directional gantry: green ground, white text and arrow
// The rear face of an overhead direction sign: pale grey aluminium.
const SIGN_BACK = new THREE.MeshStandardMaterial({
  color: 0x9aa0a6, roughness: 0.55, metalness: 0.25,
});

function texDirection(lines) {
  return signCanvas(512, 192, (x, w, h) => {
    x.fillStyle = '#0f6b3f'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#f2f4f0'; x.lineWidth = 5;
    x.strokeRect(9, 9, w - 18, h - 18);
    x.fillStyle = '#f2f4f0';
    x.font = '600 44px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial';
    x.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      const y = lines.length === 1 ? h / 2 : 58 + i * 62;
      x.fillText(ln.text, 34, y);
      // arrow
      x.save();
      x.translate(w - 66, y);
      if (ln.dir === 'left') x.rotate(Math.PI);
      x.beginPath();
      x.moveTo(-20, 0); x.lineTo(14, 0);
      x.moveTo(2, -12); x.lineTo(14, 0); x.lineTo(2, 12);
      x.lineWidth = 7; x.strokeStyle = '#f2f4f0'; x.lineJoin = 'round';
      x.stroke();
      x.restore();
    });
  });
}

// street name plate: white ground, black text, the small blue cap SG uses
export function texStreetName(name) {
  return signCanvas(512, 128, (x, w, h) => {
    x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#20477e'; x.fillRect(0, 0, w, 22);
    x.fillStyle = '#1b1d1f';
    x.font = '700 52px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial';
    x.textBaseline = 'middle'; x.textAlign = 'center';
    let size = 52;
    while (x.measureText(name.toUpperCase()).width > w - 46 && size > 22) {
      size -= 2;
      x.font = `700 ${size}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;
    }
    x.fillText(name.toUpperCase(), w / 2, h / 2 + 10);
  });
}

// A PLATE IS A DUPLICATE IF ONE SAYING THE SAME THING ALREADY STANDS ON TOP
// OF IT.
//
// Districts are fetched with OVERLAPPING boxes, and trimAxes() in main.js only
// clips an axis against the others in ITS OWN CHUNK -- so two districts that
// both carry Bayfront Avenue each ran the every-150m plate loop down it, and
// dressSideStreets keeps its `plated` set local to one call, so a side street
// reached from two chunks is plated twice. Measured on the world scene before
// this guard: 632 plates, 79 same-name pairs within 40m, the closest 3.2m
// apart. A rider on Bayfront Avenue had three signposts reading BAYFRONT
// AVENUE in one frame, two of them overlapping.
//
// 12m, and the number comes out of the measurement rather than taste. The pair
// distances are 3.2, 4.6, 8.8 and then a hard jump to a cluster at exactly
// 16.2 -- the stacked ones below nine metres, and above sixteen the pairs that
// sit on OPPOSITE KERBS of one street, which is what a real street has and
// must be kept. 12 is in the gap and nothing lands near it.
// IT MUST STILL BE STANDING. window.__signage is a write-only log -- nothing
// has ever removed an entry from it -- and plates are children of a STREAMED
// CHUNK, which is dropped from the scene when the rider gets 1.7km away. A
// guard that trusted the log would let a street lose its name the second time
// you rode down it: the chunk rebuilds, the log still remembers the plate that
// went with the old one, and the new plate is skipped as a duplicate. So each
// record carries its object and the guard asks whether that object is still
// attached to the scene, which makes the whole thing self-healing and needs no
// unload hook to be kept in step.
export function plateTaken(text, x, z, near = 12) {
  const said = window.__signage;
  if (!said) return false;
  const n2 = near * near;
  for (const q of said) {
    if (q.kind !== 'plate' || q.text !== text) continue;
    if ((q.x - x) ** 2 + (q.z - z) ** 2 >= n2) continue;
    if (!q.obj) return true;                 // pre-streaming record, trust it
    // WALK TO THE ROOT AND ASK WHETHER IT IS A SCENE -- do NOT compare against
    // window.__scene. main.js assigns window.__scene AFTER the boot build has
    // run, so on the first build the comparison never matched, every call
    // returned false and this guard was a silent no-op: 632 plates and 79
    // duplicate pairs before and after, byte for byte, which is what caught it.
    // A live chunk's root is the Scene; a dropped chunk's root is its own group.
    let o = q.obj;
    while (o.parent) o = o.parent;
    if (o.isScene) return true;
  }
  return false;
}

/* ---------------- place the signage ---------------- */
export async function buildSignage(world, axis, data, isBlocked, Y = null) {
  // was one synchronous gulp (the 'signage' step's ~100ms block, 2026-08-03)
  let _gt = performance.now();
  const GY = async () => { if (Y && performance.now() - _gt > 8) { await Y(); _gt = performance.now(); } };
  const pts = axis.p, half = axis.w / 2;
  const placed = { gantries: 0, plates: 0 };

  // Every signpost records what it says and where it stands, so the audit can
  // check the words against the map rather than only the geometry.
  const said = (window.__signage = window.__signage || []);

  // The cross streets, kept as geometry rather than as a list of names. A
  // gantry used to pick two names at random out of this list: it looked
  // perfect and pointed at streets that were nowhere near the junction.
  // "not the street the gantry stands on" — by the AXIS'S OWN NAME, not a
  // hardcoded /orchard road/: a South Bridge Road gantry must not offer
  // South Bridge Road as a destination
  const ownName = (axis.n || 'orchard road').toLowerCase();
  const crossWays = data.roads.filter(
    (r) => r.n && r.n.toLowerCase() !== ownName
        && r.k !== 'footway' && r.k !== 'pedestrian');

  // nearest named street on each side of a point, out to `reach`
  const crossAt = (px, pz, nx, nz, reach = 90) => {
    let left = null, right = null, dl = Infinity, dr = Infinity;
    for (const r of crossWays) {
      for (const q of r.p) {
        const dx = q[0] - px, dz = q[1] - pz;
        const d2 = dx * dx + dz * dz;
        if (d2 > reach * reach) continue;
        // which side of the main street it lies on
        const side = dx * nx + dz * nz;
        if (side > 0) { if (d2 < dr) { dr = d2; right = r.n; } }
        else { if (d2 < dl) { dl = d2; left = r.n; } }
      }
    }
    return { left, right };
  };

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    await GY();
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
    const ang = Math.atan2(ux, uz);

    for (let t = 0; t < len; t += 1, acc++) {
      const px = x1 + ux * t, pz = z1 + uz * t;

      // overhead directional gantry every ~230m
      const crossHere = (acc % 230 === 90)
        ? crossAt(px, pz, nx, nz) : null;
      // A sign with nothing true to say is not built. Inventing a destination
      // is worse than leaving the junction unsigned.
      if (crossHere && (crossHere.left || crossHere.right)) {
        const g = new THREE.Group();
        // ON A BRIDGE THE POST STANDS ON THE DECK, NOT BESIDE IT. The verge
        // offset (half + 1.0) put the Sentosa Gateway causeway sign's post a
        // metre past the deck edge — over open water, standing on nothing —
        // so the rider saw only the panel hanging in the sky (sweep
        // r_-1070_12167, the fourth investigation of a floating sign panel;
        // the first three were the black BACK, see below).
        const _wx = px + nx * (half + 1.0), _wz = pz + nz * (half + 1.0);
        const _postOff = (window.__inWater && window.__inWater(_wx, _wz)) ? half - 0.7 : half + 1.0;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 7.2, 8), MAT.darkMetal);
        post.position.set(nx * _postOff, 3.6, nz * _postOff);
        post.castShadow = true; g.add(post);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(half * 1.1, 0.16, 0.16), MAT.darkMetal);
        arm.position.set(nx * (half * 0.45), 7.0, nz * (half * 0.45));
        arm.rotation.y = ang; arm.castShadow = true; g.add(arm);

        const rows = [];
        if (crossHere.left) rows.push({ text: crossHere.left.slice(0, 16), dir: 'left' });
        if (crossHere.right) rows.push({ text: crossHere.right.slice(0, 16), dir: 'right' });
        said.push({ kind: 'gantry', x: px, z: pz,
                    text: rows.map((r2) => r2.text).join(' | ') });
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(4.6, 1.72),
          new THREE.MeshBasicMaterial({ map: texDirection(rows) })
        );
        // OFF THE FACE OF THE BACKER, NOT INSIDE IT. The backer below is a box
        // 9cm deep at this same centre, so a plane placed exactly here is
        // buried in it -- which is what happened to the second face on the
        // first attempt: added, audited clean, and completely invisible.
        // Each face sits just proud of its own side.
        const _sx = Math.sin(ang), _sz = Math.cos(ang);
        face.position.set(nx * (half * 0.42) - _sx * 0.06, 5.9, nz * (half * 0.42) - _sz * 0.06);
        face.rotation.y = ang + Math.PI;
        g.add(face);
        // THE BACK OF A DIRECTION SIGN IS GREY ALUMINIUM. In darkMetal it is
        // near-black, and since the green face points at oncoming traffic on
        // ONE carriageway, a rider on the other one meets a large blank black
        // rectangle hanging over the road. That has now been investigated three
        // times -- written up as a defect once, then chased through probes on
        // Victoria Street and again on Serangoon Road -- because a black panel
        // in the sky looks exactly like a missing texture. The sign is correct;
        // the colour was not.
        const backer = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.72, 0.09), SIGN_BACK);
        backer.position.set(nx * (half * 0.42), 5.9, nz * (half * 0.42));
        backer.rotation.y = ang;
        backer.castShadow = true; g.add(backer);
        // AND A FACE FOR THE OTHER CARRIAGEWAY.
        //
        // A single face pointing at oncoming traffic leaves everyone on the
        // other side of the road looking at a blank panel in the sky. That has
        // now been investigated FOUR times in this project -- written up as a
        // defect, chased through probes on Victoria Street, again on Serangoon
        // Road, and again on 2026-08-01 -- and each time the answer was "the
        // sign is correct, the back of a sign is grey". Four investigations is
        // the code telling you something: a rider meets these backs constantly,
        // because half of every dual carriageway faces one.
        //
        // The street-name plates a few lines below already solve this the right
        // way -- "two back-to-back faces so the name reads correctly from both
        // sides" -- and a real gantry does carry a sign for each direction.
        //
        // LEFT AND RIGHT SWAP. The cross street on your left driving one way is
        // on your right driving the other, so the second face is not a copy: it
        // is the same junction described from the opposite direction.
        if (rows.length) {
          const flip = rows.map((r2) => ({
            text: r2.text, dir: r2.dir === 'left' ? 'right' : 'left',
          }));
          const back = new THREE.Mesh(
            new THREE.PlaneGeometry(4.6, 1.72),
            new THREE.MeshBasicMaterial({ map: texDirection(flip) })
          );
          back.position.set(nx * (half * 0.42) + _sx * 0.06, 5.9, nz * (half * 0.42) + _sz * 0.06);
          back.rotation.y = ang;
          g.add(back);
        }

        g.position.set(px, groundAt(px, pz), pz);
        world.add(g);
        placed.gantries++;
      }

      // street name plate on a short pole, both sides, every ~150m
      if (acc % 150 === 40) {
        for (const sgn of [-1, 1]) {
          const sx = px + nx * (half + 2.4) * sgn, sz = pz + nz * (half + 2.4) * sgn;
          if (isBlocked(sx, sz)) continue;
          // near a junction the pole can end up closer to the cross street than
          // to the one it names, which makes the plate a lie
          const own = axis.n || 'Orchard Road';
          if (window.__nearestStreet && window.__nearestStreet(sx, sz) !== own) continue;
          if (plateTaken(own, sx, sz)) continue;
          const g = new THREE.Group();
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), MAT.metal);
          pole.position.y = 1.3; pole.castShadow = true; g.add(pole);
          // two back-to-back faces so the name reads correctly from both
          // sides; a DoubleSide plane mirrors it (see markings.js)
          for (const face of [1, -1]) {
            const plate = new THREE.Mesh(
              new THREE.PlaneGeometry(1.5, 0.38),
              new THREE.MeshBasicMaterial({ map: texStreetName(axis.n || 'Orchard Road') }));
            plate.position.set(0, 2.5, 0.012 * face);
            if (face < 0) plate.rotation.y = Math.PI;
            g.add(plate);
          }
          said.push({ kind: 'plate', x: sx, z: sz, text: axis.n || 'Orchard Road', obj: g });
          g.position.set(sx, groundAt(sx, sz), sz);
          g.rotation.y = ang + Math.PI / 2;
          world.add(g);
          placed.plates++;
        }
      }
    }
  }
  return placed;
}

/* ---------------- place readout + map ---------------- */
//
// The old minimap squeezed all 2,586 metres of the district into a 112 pixel
// square. At that scale the street is a hairline, every building is under a
// pixel, and the only thing you can read is a dot that never appears to move.
// It answered "where am I in the district" — a question nobody riding a street
// is asking — and could not answer "what is this junction coming up".
//
// So there are two maps now, and a sentence.
//
//   the small one   about 260m across, TURNED so the way you are facing is up.
//                   Near enough to see the junction ahead and which side the
//                   mall is on.
//   the big one     tap to open: the whole street, the malls named, you on it.
//   the sentence    "Orchard Road, outside ION Orchard, heading east". A map is
//                   a skill; a sentence is not, and most people want the
//                   sentence.
const COMPASS = ['north', 'north east', 'east', 'south east',
  'south', 'south west', 'west', 'north west'];

export class Wayfinder {
  constructor(data, axis) {
    this.data = data;
    this.axis = axis;
    this.refresh();

    this.current = ''; this.currentWhere = '';
    this.el = document.getElementById('place');
    this.whereEl = document.getElementById('where');
    this.map = document.getElementById('map');
    this.mapCtx = this.map ? this.map.getContext('2d') : null;
    this.big = document.getElementById('big');
    this.bigMap = document.getElementById('bigmap');
    this.bigCtx = this.bigMap ? this.bigMap.getContext('2d') : null;
    this.open = false;
    this._t = 0;
    this._last = null;

    this._wireTap();
  }

  // Re-derive everything that was snapshotted from `data`. The streamed
  // loader GROWS the data arrays after boot, and a wayfinder that indexed
  // only the spawn district showed an empty minimap and no mall names in
  // every district that arrived later. Called at construction and again
  // after each chunk lands.
  refresh() {
    const data = this.data;
    // named buildings with a centroid, for the readout and the labels
    this.places = [];
    for (const b of data.buildings) {
      if (!b.n) continue;
      let x = 0, z = 0;
      for (const p of b.p) { x += p[0]; z += p[1]; }
      this.places.push({ n: b.n, x: x / b.p.length, z: z / b.p.length, a: b.a || 0 });
    }
    this.places.sort((a, b) => b.a - a.a);
    this.bounds = this._bounds(data);
    // THE MAP MUST COVER EVERY DISTRICT, NOT JUST THE BUILT ONES.
    //
    // `data` only ever holds districts that have STREAMED IN, and streaming
    // only builds what is near you — so from Orchard, Little India (6km away)
    // was not in the data, not inside these bounds, and therefore not on the
    // map at any zoom. It was not too small to see; it was off the drawn area
    // entirely. Meanwhile the teleport list reads the MANIFEST, so its name was
    // there and the place was not, which is exactly as confusing as it sounds.
    //
    // The manifest knows every district's extent whether or not it is built, so
    // the map's bounds come from there when it is available.
    const recs = window.__streamRecs || [];
    for (const r of recs) {
      const b2 = r.box;
      if (!b2 || b2.length !== 4) continue;
      if (b2[0] < this.bounds.mnx) this.bounds.mnx = b2[0];
      if (b2[2] > this.bounds.mxx) this.bounds.mxx = b2[2];
      if (b2[1] < this.bounds.mnz) this.bounds.mnz = b2[1];
      if (b2[3] > this.bounds.mxz) this.bounds.mxz = b2[3];
    }
    this._grid = this._index(data);
  }

  _bounds(data) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    const eat = (x, z) => {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    };
    for (const b of data.buildings) for (const [x, z] of b.p) eat(x, z);
    // Roads too. Sizing to buildings alone cropped the ends of the street,
    // which run several hundred metres past the last footprint.
    for (const r of data.roads) for (const [x, z] of r.p) eat(x, z);
    return { mnx, mxx, mnz, mxz };
  }

  // Buckets of buildings and roads by 120m cell. The close-up view is redrawn
  // from the real geometry every quarter second rather than blitted from one
  // huge pre-rendered image: it stays sharp at any zoom, and a 2,600m district
  // pre-rendered fine enough to zoom into would be a 60MB canvas on a phone.
  _index(data) {
    const C = 120, g = new Map();
    const put = (k, item) => { if (!g.has(k)) g.set(k, { b: [], r: [] }); g.get(k)[item.t].push(item.v); };
    const cells = (pts) => {
      let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
      for (const [x, z] of pts) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      const out = [];
      for (let cx = Math.floor(mnx / C); cx <= Math.floor(mxx / C); cx++)
        for (let cz = Math.floor(mnz / C); cz <= Math.floor(mxz / C); cz++) out.push(cx + ',' + cz);
      return out;
    };
    for (const b of data.buildings) for (const k of cells(b.p)) put(k, { t: 'b', v: b });
    for (const r of data.roads) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      for (const k of cells(r.p)) put(k, { t: 'r', v: r });
    }
    this._C = C;
    return g;
  }

  _near(x, z, reach) {
    const C = this._C, out = { b: new Set(), r: new Set() };
    const n = Math.ceil(reach / C);
    for (let dx = -n; dx <= n; dx++) for (let dz = -n; dz <= n; dz++) {
      const cell = this._grid.get((Math.floor(x / C) + dx) + ',' + (Math.floor(z / C) + dz));
      if (!cell) continue;
      for (const b of cell.b) out.b.add(b);
      for (const r of cell.r) out.r.add(r);
    }
    return out;
  }

  _wireTap() {
    const openIt = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } this.setOpen(true); };
    const shut = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } this.setOpen(false); };
    if (this.map) {
      this.map.addEventListener('click', openIt);
      this.map.addEventListener('touchstart', openIt, { passive: false });
    }
    // ONE small Teleport pill opening a dropdown list — the first version
    // was a row of seven pills and covered the map on a phone. The list is
    // rebuilt on every open because districts stream in over time.
    const tpbtn = document.getElementById('tpbtn');
    const tplist = document.getElementById('tplist');
    const tpToggle = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (!tplist) return;
      tplist.classList.toggle('on');
    };
    if (tpbtn) {
      tpbtn.addEventListener('click', tpToggle);
      tpbtn.addEventListener('touchstart', tpToggle, { passive: false });
    }
    this._fillTpbar = () => {
      if (!tplist) return;
      tplist.classList.remove('on');   // opens closed each time
      tplist.innerHTML = '';
      // A TAP IS NOT A SCROLL, AND THIS LIST NOW SCROLLS.
      //
      // Every entry fired on TOUCHSTART with preventDefault, which is fine for
      // a button you can always see and fatal for one in a scrolling list: a
      // finger placed on an entry to drag the list teleported instead, and the
      // map closed under it. It only became reachable when the eighth district
      // pushed the list past 62vh — at seven it fit and never needed to scroll,
      // so the bug shipped invisible. The user found it the first evening
      // Little India existed, trying to reach Little India.
      //
      // So: remember where the finger went down, and only act on touchEND if it
      // barely moved. Anything else is a scroll and is left alone — no
      // preventDefault, or the list cannot move at all.
      for (const d of (window.__districts || [])) {
        const btn = document.createElement('button');
        btn.textContent = d.name;
        const fire = () => {
          tplist.classList.remove('on');
          if (window.__teleportTo && window.__teleportTo(d.id)) this.setOpen(false);
        };
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fire(); });
        let tx = 0, ty = 0, tt = 0, moved = false;
        btn.addEventListener('touchstart', (e) => {
          const t = e.touches[0];
          tx = t.clientX; ty = t.clientY; tt = Date.now(); moved = false;
        }, { passive: true });
        btn.addEventListener('touchmove', (e) => {
          const t = e.touches[0];
          if (Math.hypot(t.clientX - tx, t.clientY - ty) > 10) moved = true;
        }, { passive: true });
        btn.addEventListener('touchend', (e) => {
          if (moved || Date.now() - tt > 700) return;   // that was a scroll
          e.preventDefault(); e.stopPropagation();
          fire();
        }, { passive: false });
        tplist.appendChild(btn);
      }
    };
    const close = document.getElementById('bigclose');
    if (close) {
      close.addEventListener('click', shut);
      close.addEventListener('touchstart', shut, { passive: false });
    }
    // THE OPEN MAP NO LONGER CLOSES ON TAP.
    //
    // It used to, "so there is no hunting for a button" -- which meant the very
    // first touch aimed AT the map dismissed it, and the map could therefore
    // never be zoomed or moved. A full-screen map you cannot zoom is a picture.
    // It closes on the Close button and on M; the map itself pinches and drags.
    this.zoom = 1; this.panX = 0; this.panZ = 0;
    if (this.bigMap) {
      let pt = null, startD = 0, startZ = 1, sx = 0, sy = 0, spx = 0, spz = 0;
      const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      const redraw = () => { if (this._last) this._drawBig(this._last); };
      this.bigMap.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        const t = e.touches;
        if (t.length === 2) { pt = 'pinch'; startD = dist(t) || 1; startZ = this.zoom; }
        else { pt = 'pan'; sx = t[0].clientX; sy = t[0].clientY; spx = this.panX; spz = this.panZ; }
      }, { passive: false });
      this.bigMap.addEventListener('touchmove', (e) => {
        e.preventDefault(); e.stopPropagation();
        const t = e.touches;
        if (pt === 'pinch' && t.length === 2) {
          this.zoom = Math.max(1, Math.min(8, startZ * (dist(t) / startD)));
        } else if (pt === 'pan' && t.length === 1) {
          this.panX = spx + (t[0].clientX - sx);
          this.panZ = spz + (t[0].clientY - sy);
        }
        redraw();
      }, { passive: false });
      this.bigMap.addEventListener('touchend', (e) => { e.stopPropagation(); pt = null; });
      // and a wheel, for anyone on a laptop
      this.bigMap.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.zoom = Math.max(1, Math.min(8, this.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
        redraw();
      }, { passive: false });
      // dragging with a mouse pans
      let md = false;
      this.bigMap.addEventListener('mousedown', (e) => {
        md = true; sx = e.clientX; sy = e.clientY; spx = this.panX; spz = this.panZ;
      });
      addEventListener('mousemove', (e) => {
        if (!md) return;
        this.panX = spx + (e.clientX - sx); this.panZ = spz + (e.clientY - sy); redraw();
      });
      addEventListener('mouseup', () => { md = false; });
    }
    const zin = document.getElementById('zoomin');
    const zout = document.getElementById('zoomout');
    const bump = (f) => (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.zoom = Math.max(1, Math.min(8, this.zoom * f));
      if (this._last) this._drawBig(this._last);
    };
    for (const [el, f] of [[zin, 1.5], [zout, 1 / 1.5]]) {
      if (!el) continue;
      el.addEventListener('click', bump(f));
      el.addEventListener('touchstart', bump(f), { passive: false });
    }
    addEventListener('keydown', (e) => { if (e.code === 'KeyM') this.setOpen(!this.open); });
  }

  setOpen(v) {
    if (v && this._fillTpbar) this._fillTpbar();
    this.open = !!v;
    if (this.big) this.big.classList.toggle('on', this.open);
    document.body.classList.toggle('mapopen', this.open);
    if (this.open && this._last) this._drawBig(this._last);
  }

  /* ---------- words ---------- */

  // Bearing measured from north. World +x is east and +z is south, because the
  // projection puts z = (lat0 - lat) * metres, so north is NEGATIVE z. Getting
  // this backwards would have the readout confidently telling you the opposite
  // of where you are pointing, which is worse than no readout.
  _compass(heading) {
    const b = Math.atan2(Math.sin(heading), -Math.cos(heading));
    const i = Math.round((((b / (Math.PI * 2)) * 8) + 8)) % 8;
    return COMPASS[i];
  }

  // the biggest named place within a cone in front of you, to give the heading
  // something to point AT
  _ahead(S) {
    const fx = Math.sin(S.heading), fz = Math.cos(S.heading);
    let best = null, bestScore = -1;
    for (const p of this.places) {
      const dx = p.x - S.x, dz = p.z - S.z;
      const d = Math.hypot(dx, dz);
      if (d < 70 || d > 620) continue;
      const dot = (dx * fx + dz * fz) / (d || 1);
      if (dot < 0.80) continue;                 // roughly ahead, not beside
      const score = Math.sqrt(p.a) * dot - d * 0.25;
      if (score > bestScore) { bestScore = score; best = p; }
    }
    return best;
  }

  _street(S) {
    return (window.__nearestStreet && window.__nearestStreet(S.x, S.z))
      || this.axis.n || 'Orchard Road';
  }

  /* ---------- the close-up ---------- */

  _drawSmall(S) {
    // which street you are on, so the minimap can say so in colour as well as
    // the sentence under it
    this._lastStreet = this._street(S);
    const g = this.mapCtx, W = this.map.width;
    const REACH = 130;                          // metres from the centre to an edge
    const k = (W / 2) / REACH;                  // pixels per metre
    g.save();
    g.clearRect(0, 0, W, W);
    g.fillStyle = '#0d1114'; g.fillRect(0, 0, W, W);

    g.translate(W / 2, W / 2);
    // turn the map so the way you are facing is up
    g.rotate(-Math.atan2(Math.sin(S.heading), -Math.cos(S.heading)));
    g.scale(k, k);
    g.translate(-S.x, -S.z);

    const near = this._near(S.x, S.z, REACH * 1.6);
    // roads as ribbons at their real width, so a junction reads as a junction
    g.lineCap = 'round'; g.lineJoin = 'round';
    // Roads DARK, buildings light. The first pass had both in mid grey and at a
    // junction, where the carriageways are widest, the whole tile turned into
    // one flat smudge: you could not tell road from block, which is the only
    // thing a street map has to do.
    for (const r of near.r) {
      const isAxis = (r.n || '').toLowerCase() === (this.axis.n || '').toLowerCase();
      g.strokeStyle = isAxis ? '#3b342a' : '#232a30';
      g.lineWidth = Math.max(3 / k, r.w || 7);
      g.beginPath();
      r.p.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z)));
      g.stroke();
    }
    // outlined, or a terrace of six shops merges into one pale slab
    g.strokeStyle = 'rgba(13,17,20,0.85)';
    g.lineWidth = 1.1 / k;
    for (const b of near.b) {
      g.fillStyle = b.n ? 'rgba(214,222,230,0.85)' : 'rgba(150,163,175,0.60)';
      g.beginPath();
      b.p.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z)));
      g.closePath(); g.fill(); g.stroke();
    }
    // NO street highlights. There used to be amber lines over the main
    // streets (first one, then all of them with "the one you are on"
    // thicker) and the user read the thick one as an unexplained glitch —
    // twice, in two different designs. A real map tracks YOU; the streets
    // are already legible as dark lines. The marker and its facing cone
    // below are the only amber left. (User decision, 2026-07-30.)
    g.restore();

    // you, always dead centre and always pointing up
    g.save();
    g.translate(W / 2, W / 2);
    g.fillStyle = 'rgba(255,214,150,0.22)';
    g.beginPath(); g.moveTo(0, 0);
    g.arc(0, 0, W * 0.30, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42); g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(0, -13); g.lineTo(9, 10); g.lineTo(0, 5); g.lineTo(-9, 10);
    g.closePath();
    g.fillStyle = '#ffd696'; g.fill();
    g.strokeStyle = 'rgba(11,15,19,0.95)'; g.lineWidth = 2; g.stroke();
    g.restore();

    // north, which a turning map otherwise loses completely
    const nAng = -Math.atan2(Math.sin(S.heading), -Math.cos(S.heading));
    g.save();
    g.translate(W - 26, 26); g.rotate(nAng);
    g.strokeStyle = 'rgba(240,235,222,0.75)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 8); g.lineTo(0, -8); g.stroke();
    g.beginPath(); g.moveTo(0, -11); g.lineTo(4, -5); g.lineTo(-4, -5); g.closePath();
    g.fillStyle = 'rgba(240,235,222,0.85)'; g.fill();
    g.restore();
    g.fillStyle = 'rgba(240,235,222,0.85)';
    g.font = '600 13px ui-sans-serif,system-ui,Helvetica,Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('N', W - 26 + Math.sin(nAng) * 20, 26 - Math.cos(nAng) * 20);

    // scale bar: without one, a map that zooms tells you nothing about distance
    g.strokeStyle = 'rgba(240,235,222,0.6)'; g.lineWidth = 2;
    const bar = 50 * k;
    g.beginPath(); g.moveTo(12, W - 16); g.lineTo(12 + bar, W - 16); g.stroke();
    g.font = '500 11px ui-sans-serif,system-ui,Helvetica,Arial';
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText('scale 50 m', 12, W - 22);
  }

  /* ---------- the whole street ---------- */

  _drawBig(S) {
    if (!this.bigCtx) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.round(this.bigMap.clientWidth * dpr);
    const H = Math.round(this.bigMap.clientHeight * dpr);
    if (this.bigMap.width !== W || this.bigMap.height !== H) {
      this.bigMap.width = W; this.bigMap.height = H;
    }
    const g = this.bigCtx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);

    const { mnx, mxx, mnz, mxz } = this.bounds;
    const pad = 30 * dpr;
    // zoom and pan, so the map can actually be read at street level
    const zoom = this.zoom || 1;
    const k = Math.min((W - pad * 2) / (mxx - mnx), (H - pad * 2) / (mxz - mnz)) * zoom;
    const ox = (W - (mxx - mnx) * k) / 2 - mnx * k + (this.panX || 0) * dpr;
    const oz = (H - (mxz - mnz) * k) / 2 - mnz * k + (this.panZ || 0) * dpr;
    const X = (x) => x * k + ox, Z = (z) => z * k + oz;

    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(74,82,90,0.9)';
    for (const r of this.data.roads) {
      if (r.k === 'footway' || r.k === 'pedestrian') continue;
      g.lineWidth = Math.max(1, (r.w || 7) * k * 0.7);
      g.beginPath();
      r.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
      g.stroke();
    }
    g.fillStyle = 'rgba(190,199,208,0.32)';
    for (const b of this.data.buildings) {
      g.beginPath();
      b.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
      g.closePath(); g.fill();
    }

    // DISTRICTS THAT HAVE NOT BEEN BUILT ARE STILL PART OF THE CITY. Boot
    // fetches every chunk and builds only the near ones, so the geometry for
    // Little India is sitting in memory while the map draws nothing there —
    // which is why the teleport list offered a place the map could not show.
    // Drawn dimmer than the built districts, because "not here yet" is honest
    // and a blank rectangle is not.
    {
      const recs = window.__streamRecs || [];
      g.strokeStyle = 'rgba(74,82,90,0.45)';
      for (const r of recs) {
        if (r.pushed || !r.ch || !Array.isArray(r.ch.roads)) continue;
        for (const rd of r.ch.roads) {
          if (rd.k === 'footway' || rd.k === 'pedestrian') continue;
          g.lineWidth = Math.max(1, (rd.w || 7) * k * 0.7);
          g.beginPath();
          rd.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
          g.stroke();
        }
      }
      g.fillStyle = 'rgba(190,199,208,0.16)';
      for (const r of recs) {
        if (r.pushed || !r.ch || !Array.isArray(r.ch.buildings)) continue;
        for (const b of r.ch.buildings) {
          g.beginPath();
          b.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
          g.closePath(); g.fill();
        }
      }
    }
    // (the amber axis line is gone from this map too — the user read the
    // highlighted street as a glitch on the minimap, and a real map should
    // highlight nothing but YOU. Same decision, both maps, 2026-07-30.)

    // DISTRICT NAMES FIRST, and they always get their space. Reserving their
    // boxes before the building labels means a district can never be crowded
    // off its own map by a shopping centre — the user went looking for Little
    // India on this map twice and found nothing, which is the failure this
    // whole block exists to prevent.
    const taken = [];
    {
      g.font = `700 ${Math.round(13 * dpr)}px ui-sans-serif,system-ui,Helvetica,Arial`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const d of (window.__districts || [])) {
        const px2 = X(d.x), pz2 = Z(d.z);
        const w = g.measureText(d.name).width + 14 * dpr, h = 18 * dpr;
        if (px2 < 4 || px2 > W - 4 || pz2 < 4 || pz2 > H - 4) continue;
        // NUDGE, DO NOT DROP. Bras Basah and Bugis overlap at this scale
        // because their axis midpoints are 300m apart; dropping one would put
        // us back to a district you cannot find on the map. Step vertically
        // until clear, alternating up and down so a label stays near its own
        // district rather than drifting off in one direction.
        const hits = (bx, bz) => taken.some((t) => bx < t[0] + t[2] && bx + w > t[0]
          && bz < t[1] + t[3] && bz + h > t[1]);
        let ly = pz2;
        for (let n2 = 1; n2 <= 6 && hits(px2 - w / 2, ly - h / 2); n2++) {
          ly = pz2 + (n2 % 2 ? 1 : -1) * Math.ceil(n2 / 2) * (h + 3 * dpr);
        }
        taken.push([px2 - w / 2, ly - h / 2, w, h]);
        g.fillStyle = 'rgba(16,20,24,0.55)';
        g.beginPath();
        g.roundRect(px2 - w / 2, ly - h / 2, w, h, 5 * dpr);
        g.fill();
        g.fillStyle = 'rgba(255,238,205,0.96)';
        g.fillText(d.name, px2, ly);
      }
    }

    // Label the biggest places, and only as many as will not collide. A map
    // with forty overlapping labels is less readable than one with none.
    g.font = `600 ${Math.round(11 * dpr)}px ui-sans-serif,system-ui,Helvetica,Arial`;
    g.textAlign = 'left'; g.textBaseline = 'middle';
    let placed = 0;
    for (const p of this.places) {
      if (placed >= 22) break;
      const px = X(p.x), pz = Z(p.z);
      const w = g.measureText(p.n).width + 10 * dpr, h = 15 * dpr;
      const box = [px + 5 * dpr, pz - h / 2, w, h];
      if (box[0] + w > W - 8 || box[1] < 8 || box[1] + h > H - 8) continue;
      if (taken.some((t) => box[0] < t[0] + t[2] && box[0] + box[2] > t[0]
        && box[1] < t[1] + t[3] && box[1] + box[3] > t[1])) continue;
      taken.push(box);
      g.fillStyle = 'rgba(255,255,255,0.92)';
      g.beginPath(); g.arc(px, pz, 2.6 * dpr, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(238,233,222,0.9)';
      g.fillText(p.n, px + 6 * dpr, pz);
      placed++;
    }

    // you
    const px = X(S.x), pz = Z(S.z);
    g.save();
    g.translate(px, pz);
    g.rotate(Math.atan2(Math.sin(S.heading), -Math.cos(S.heading)));
    g.fillStyle = 'rgba(255,214,150,0.30)';
    g.beginPath(); g.moveTo(0, 0);
    g.arc(0, 0, 46 * dpr, -Math.PI / 2 - 0.40, -Math.PI / 2 + 0.40); g.closePath(); g.fill();
    g.restore();
    g.fillStyle = '#ffd696';
    g.beginPath(); g.arc(px, pz, 5.5 * dpr, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(11,15,19,0.9)'; g.lineWidth = 2 * dpr; g.stroke();

    // scale bar, in real metres
    const bar = 200 * k;
    g.strokeStyle = 'rgba(240,235,222,0.7)'; g.lineWidth = 2 * dpr;
    const bx = W - bar - 20 * dpr, by = H - 22 * dpr;
    g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + bar, by); g.stroke();
    g.fillStyle = 'rgba(240,235,222,0.7)';
    g.font = `500 ${Math.round(11 * dpr)}px ui-sans-serif,system-ui,Helvetica,Arial`;
    // RIGHT-ALIGNED to the bar's right end: centring a label wider than
    // the bar pushed it off the screen edge and it shipped to the user's
    // phone clipped. The text now grows leftwards over the map, never off.
    g.textAlign = 'right'; g.textBaseline = 'alphabetic';
    g.fillText('scale: this line = 200 m', bx + bar, by - 6 * dpr);
  }

  update(S, dt) {
    this._last = S;
    this._t += dt;
    if (this._t < 0.2) return;
    this._t = 0;

    // nearest named building, weighted so a big mall wins over a small shophouse
    let best = null, bestD = Infinity;
    for (const p of this.places) {
      const d = Math.hypot(p.x - S.x, p.z - S.z) - Math.min(60, Math.sqrt(p.a) * 0.5);
      if (d < bestD) { bestD = d; best = p; }
    }
    // The big line is where you ARE: a named building when one is close,
    // otherwise the street under you. It used to fall back to the PRIMARY
    // AXIS name, so riding South Bridge Road two kilometres from Orchard
    // still read "Orchard Road" in large type over the correct street in
    // small type — confidently wrong, in a five-district world.
    const street = this._street(S);
    const nearBld = best && bestD < 90;
    const label = nearBld ? `Outside ${best.n}` : (street || this.axis.n || 'Singapore');
    if (label !== this.current && this.el) {
      this.current = label;
      this.el.firstChild.nodeValue = label;
    }
    if (this.whereEl) {
      const ahead = this._ahead(S);
      // when the big line already names the street, the small line does not
      // repeat it
      const where = (nearBld ? `${street} · ` : '') + `heading ${this._compass(S.heading)}`
        + (ahead ? ` toward ${ahead.n}` : '');
      if (where !== this.currentWhere) { this.currentWhere = where; this.whereEl.textContent = where; }
    }

    if (this.mapCtx) this._drawSmall(S);
    if (this.open) this._drawBig(S);
  }
}
