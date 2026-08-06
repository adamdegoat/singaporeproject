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

/* ---------------- the island map: palette, pins, glyphs ---------------- */
//
// A PRINTED TOURIST MAP, not a diagram. The owner asked for "a fun sentosa map
// design like game concept that is visually nice and easy for ppl to
// understand", and picked this look over a dark game map. Sentosa's own
// visitor maps are warm paper with a green island on a pale sea, so this is
// also the honest reference rather than a house style.
//
// Every colour is muted except the pins. That is the whole trick: the map is
// background, the places you can go are foreground.
const MAPCOL = {
  sea: '#a9d2d4',
  land: '#f2e6cd',
  landFar: '#e2dac6',   // Keppel, Brani, the far shore: present, not the subject
  lagoon: '#7fc3c9',
  road: '#fffaf0',
  roadCase: '#d8c4a0',
  path: 'rgba(150,124,88,0.55)',
  bld: 'rgba(198,180,150,0.42)',
  green: {
    wood: '#9dbf8a',
    park: '#b6d3a0',
    grass: '#c3daad',
    golf: '#a9cf94',
    pitch: '#b9d2a6',
    sand: '#f4e3bb',
    pool: '#8fcbd4',
  },
};

// The pin families, and a glyph for each. NO EMOJI — the repo's design rules
// forbid them in anything customer-facing, and a canvas emoji renders
// differently on every device anyway. These are drawn from paths.
const PIN_CAT = {
  ride:     { c: '#e2603f', g: 'ride' },
  water:    { c: '#2f9bb5', g: 'wave' },
  beach:    { c: '#e0a53c', g: 'wave' },
  heritage: { c: '#6b7f9e', g: 'fort' },
  nature:   { c: '#4f9463', g: 'tree' },
  view:     { c: '#3f8f7a', g: 'view' },
  food:     { c: '#c2565f', g: 'food' },
  stay:     { c: '#8a6a9e', g: 'bed' },
  transport:{ c: '#557089', g: 'rail' },
  other:    { c: '#7b8590', g: 'dot' },
};

// OSM kind -> family. Anything unlisted falls to `other` rather than being
// dropped: a pin with a generic glyph is still a place you can travel to.
const PIN_FAMILY = {
  theme_park: 'ride', roller_coaster: 'ride', amusement_ride: 'ride',
  dark_ride: 'ride', summer_toboggan: 'ride', bungee_jumping: 'ride',
  attraction: 'ride', zip_line: 'ride',
  aquarium: 'water', water_park: 'water', swimming_area: 'water',
  beach: 'beach',
  fort: 'heritage', ruins: 'heritage', castle: 'heritage', museum: 'heritage',
  artwork: 'heritage', city_gate: 'heritage', cannon: 'heritage',
  viewpoint: 'view',
  nature_reserve: 'nature', garden: 'nature',
  restaurant: 'food', bar: 'food', cafe: 'food',
  hotel: 'stay', resort: 'stay',
  station: 'transport',
};

// What the card calls each family, in a visitor's words rather than OSM's.
const PIN_LABEL = {
  ride: 'attraction', water: 'on the water', beach: 'beach',
  heritage: 'history', nature: 'nature', view: 'viewpoint',
  food: 'food and drink', stay: 'hotel', transport: 'getting around',
  other: 'place',
};

function drawGlyph(g, kind, cx, cy, r, col) {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = col; g.fillStyle = col;
  g.lineWidth = Math.max(1, r * 0.30);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  switch (kind) {
    case 'ride':      // a big wheel: a hub and four spokes
      g.arc(0, 0, r * 0.86, 0, Math.PI * 2); g.stroke();
      g.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 4;
        g.moveTo(-Math.cos(a) * r * 0.86, -Math.sin(a) * r * 0.86);
        g.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
      }
      g.stroke();
      break;
    case 'wave':      // two waves
      for (const dy of [-r * 0.34, r * 0.34]) {
        g.moveTo(-r, dy);
        g.quadraticCurveTo(-r * 0.5, dy - r * 0.55, 0, dy);
        g.quadraticCurveTo(r * 0.5, dy + r * 0.55, r, dy);
      }
      g.stroke();
      break;
    case 'fort':      // a battlement
      g.moveTo(-r, r * 0.8); g.lineTo(-r, -r * 0.25); g.lineTo(-r * 0.45, -r * 0.25);
      g.lineTo(-r * 0.45, -r * 0.75); g.lineTo(r * 0.45, -r * 0.75);
      g.lineTo(r * 0.45, -r * 0.25); g.lineTo(r, -r * 0.25); g.lineTo(r, r * 0.8);
      g.closePath(); g.stroke();
      break;
    case 'tree':
      g.moveTo(0, r); g.lineTo(0, -r * 0.1); g.stroke();
      g.beginPath(); g.arc(0, -r * 0.42, r * 0.62, 0, Math.PI * 2); g.fill();
      break;
    case 'view':      // an eye
      g.moveTo(-r, 0);
      g.quadraticCurveTo(0, -r * 0.95, r, 0);
      g.quadraticCurveTo(0, r * 0.95, -r, 0);
      g.stroke();
      g.beginPath(); g.arc(0, 0, r * 0.28, 0, Math.PI * 2); g.fill();
      break;
    case 'food':      // fork and knife
      g.moveTo(-r * 0.42, -r * 0.85); g.lineTo(-r * 0.42, r * 0.85);
      g.moveTo(r * 0.42, -r * 0.85); g.lineTo(r * 0.42, r * 0.85);
      g.moveTo(-r * 0.78, -r * 0.85); g.lineTo(-r * 0.78, -r * 0.15);
      g.stroke();
      break;
    case 'bed':
      g.moveTo(-r, r * 0.6); g.lineTo(-r, -r * 0.4);
      g.moveTo(-r, r * 0.1); g.lineTo(r, r * 0.1); g.lineTo(r, r * 0.6);
      g.stroke();
      g.beginPath(); g.arc(-r * 0.42, -r * 0.2, r * 0.3, 0, Math.PI * 2); g.fill();
      break;
    case 'rail':
      g.moveTo(-r * 0.7, -r * 0.85); g.lineTo(-r * 0.7, r * 0.85);
      g.moveTo(r * 0.7, -r * 0.85); g.lineTo(r * 0.7, r * 0.85);
      g.moveTo(-r, -r * 0.4); g.lineTo(r, -r * 0.4);
      g.moveTo(-r, r * 0.4); g.lineTo(r, r * 0.4);
      g.stroke();
      break;
    default:
      g.arc(0, 0, r * 0.55, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// EVERY PIN IS A REAL PLACE WITH A TRUE LINE ABOUT IT.
//
// data/entrances.py already produced 54 attraction gates each carrying a name
// and a sentence a stationed guide says, and those sentences were researched
// rather than invented — so the map card reuses them instead of writing new
// copy. Attractions with no entrance still become pins; they just show their
// kind instead of a description, which is honest and not a blank.
// OSM MISSPELLINGS DO NOT GO ON A MAP PEOPLE READ. The extract carries both
// 'Palawan Beach' and 'Palavan Beach' as separate sand rings; the second is a
// typo for the first, and Sentosa has three beaches, not four. The map's SHAPE
// is truth — a misspelled label is not shape, it is a data error, and it would
// be the most visible thing on the screen.
const NAME_FIX = { 'Palavan Beach': 'Palawan Beach' };

// THE THINGS YOU CAN ACTUALLY GET ON, AS PLACES YOU CAN TRAVEL TO.
//
// The owner, 2026-08-05: "where can travel can make it like can go all the
// attractions that can play games also." The map pinned the island's mapped
// attractions and nothing else, so the cable car, the SkyRide, the eight luge
// runs and MegaZip — the only things in the world you actually get IN — could
// not be travelled to at all. You had to already know where they board.
//
// The position is the ride's OWN boarding point, taken from the built ride
// rather than from the map, so a pin cannot drift from the seat it belongs to.
// Deduplicated by name within 120m: the eight luge ways share one start and
// would otherwise stack eight pins on one spot, while the cable car's separate
// stations are far enough apart to stay separate.
function ridePins(rides, startId) {
  const out = [];
  const seen = [];
  for (const r of rides) {
    const b = (r.boards || [])[0];
    if (!b) continue;
    const [x, z] = b;
    if (seen.some((q) => q.n === r.name && Math.hypot(q.x - x, q.z - z) < 120)) continue;
    seen.push({ n: r.name, x, z });
    out.push({
      id: startId + out.length, n: r.name, cat: 'ride', kind: r.kind,
      x, z, major: true, play: true,
      // Not invented copy: it is a statement about what the player can do here.
      t: r.kind === 'luge' ? 'You can ride the luge down from here.'
        : r.kind === 'zip' ? 'You can ride the zipline from here.'
        : r.kind === 'chair_lift' ? 'You can ride the SkyRide from here.'
        : 'You can ride the cable car from here.',
    });
  }
  return out;
}

// A TRAIL YOU CANNOT FIND IS A TRAIL THAT IS NOT THERE.
//
// The owner, 2026-08-05: "sentosa got walking trails all in the forest we need
// to also have those walking trails that ppl can find and explore." They were
// already built — 13,405 trail pieces, Imbiah Trail is one of the fourteen
// golden frames, trailcheck exists to prove you can walk them. What was missing
// is that NOTHING on the map said where they start, so finding one was luck.
//
// The island has only eight named walkable ways, so this is a short and honest
// list rather than a pin per footpath: the trailhead goes where the way itself
// begins, which is the end a walker arrives at.
function trailPins(data, startId) {
  const out = [];
  const seen = new Set();
  for (const r of (data.roads || [])) {
    if (!r.n || !r.p || r.p.length < 2) continue;
    if (r.k !== 'path' && r.k !== 'track' && r.k !== 'footway') continue;
    const key = r.n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    let L = 0;
    for (let i = 0; i < r.p.length - 1; i++) L += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
    out.push({
      id: startId + out.length, n: r.n, cat: 'nature', kind: 'trail',
      x: r.p[0][0], z: r.p[0][1], major: false, trail: true,
      // the length is measured off the way we actually built, not asserted
      t: `A walking route, about ${Math.round(L / 10) * 10} m from this end.`,
    });
  }
  return out;
}

// A LIST YOU SCROLL PAST IS WORSE THAN A SHORTER ONE YOU TRUST.
//
// The owner, 2026-08-05: "check if all the teleport locations are useful and
// which are not." Audited, 95 destinations carried eight duplicated names and
// four pairs sitting on top of each other:
//
//   Luge Trail            x4, spread 286 m   (one pin per mapped luge WAY)
//   Luge Jungle Trail     x4, spread  67 m
//   Scented Sphere        x2, spread   6 m   (once as a place, once as a path)
//   SkyRide <-> Luge Trail        0 m apart
//   Resort World Sentosa <-> World Sentosa   5 m apart
//
// None of that is wrong in the DATA — the luge really is four mapped ways and
// Sensoryscape's gardens really are both a place and a path. It is wrong in a
// TRAVEL LIST, where four entries with one name are four coin flips.
//
// So: one entry per name, and where two differently-named pins sit within 12m
// and one name contains the other, the longer name wins — "Resort World
// Sentosa" over "World Sentosa". Nothing is renamed and nothing is invented;
// the duplicates are simply not offered twice.
// A TRAVEL LIST IS FOR PLACES YOU WOULD ACTUALLY GO TO.
//
// The owner, 2026-08-06: "the teleport spots now too many bro. how about
// teleport to impt things only... if not too cluttered."
//
// Counted: 73 attraction pins alone, of which SEVEN are the luge — "Luge
// Dragon Trail", "Luge Expedition Trail", "Luge Jungle Trail", "Luge Kupu Kupu
// Trail", "Luge Trail", "Skyline Luge" and "Skyline Luge Sentosa" — plus every
// individual ride, artwork and food outlet. Universal Studios IS in there and
// you cannot find it.
//
// So the list keeps what a visitor names when they say where they are going:
// anything already flagged `major` (theme parks, forts, museums, aquariums,
// beaches, parks), every station, and the named set below. Everything else is
// still ON THE MAP and still labelled in the world — it is only removed from
// the TRAVEL list, which is the thing that was cluttered.
const TRAVEL_KEEP = [
  'skyline luge', 'megazip', 'mega adventure', 'skyhelix', 'adventure cove',
  'sensoryscape', 'wave house', 'madame tussauds', 'trickeye', 'ifly',
  'resorts world', 'equarius', 'hotel michael', 'crockfords', 'the laurus',
  'hotel ora', 'scentopia', 'images of singapore', 'fort siloso', 'fort imbiah',
  'palawan', 'siloso', 'tanjong', 'oceanarium', 'sentosa cove', 'merlion',
];

function travelWorthy(p) {
  if (p.major) return true;
  if (p.kind === 'station') return true;
  const n = (p.n || '').toLowerCase();
  return TRAVEL_KEEP.some((k) => n.includes(k));
}

// trailing words that name the ISLAND or the operator rather than the place
const QUALIFIERS = [' sentosa', ' singapore', ' adventure park'];
function qualBase(n) {
  let out = n;
  let cut = true;
  while (cut) {
    cut = false;
    for (const q of QUALIFIERS) {
      if (out.length > q.length + 2 && out.endsWith(q)) { out = out.slice(0, -q.length); cut = true; }
    }
  }
  return out.trim();
}

function tidyPins(list) {
  const out = [];
  const seen = new Set();
  for (const p of list) {
    const key = (p.n || '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  const drop = new Set();
  for (let i = 0; i < out.length; i++) {
    for (let j = i + 1; j < out.length; j++) {
      if (drop.has(i) || drop.has(j)) continue;
      const a = out[i].n.toLowerCase(), b = out[j].n.toLowerCase();
      // SAME PLACE, DIFFERENT SUFFIX — and NOT a generic prefix rule.
      //
      // "MegaZip" / "megazip adventure park" and "Skyline Luge" / "Skyline
      // Luge Sentosa" are one attraction mapped twice, hundreds of metres
      // apart, so the 12m rule below cannot catch them.
      //
      // The first attempt dropped anything whose name PREFIXED another, and it
      // was a disaster: "Siloso" — an ARTWORK — knocked out Siloso Beach,
      // Siloso Point Cable Car and Siloso Trail, deleting one of the most
      // important places on the island from the travel list. Caught by reading
      // the list back, not by any gate.
      //
      // So strip only KNOWN TRAILING QUALIFIERS and compare what is left. That
      // collapses the two real duplicates and cannot touch "Siloso Beach",
      // because "beach" is not a qualifier — it is the name.
      if (a !== b && qualBase(a) === qualBase(b)) {
        drop.add(a.length > b.length ? i : j);
        continue;
      }
      if (Math.hypot(out[i].x - out[j].x, out[i].z - out[j].z) > 12) continue;
      if (a.includes(b)) drop.add(j);
      else if (b.includes(a)) drop.add(i);
    }
  }
  return out.filter((_, i) => !drop.has(i));
}

function buildPins(data) {
  const byName = new Map();
  for (const e of (data.entrances || [])) {
    if (e.n) byName.set(e.n.toLowerCase(), e);
  }
  const out = [];
  const seen = new Set();
  const push = (n0, k, x, z, t, major) => {
    const n = NAME_FIX[n0] || n0;
    // beaches and parks are mapped as several rings; one pin each
    const key = (n || '').toLowerCase() + (major ? '' : '|' + Math.round(x) + ',' + Math.round(z));
    if (!n || seen.has(key)) return;
    seen.add(key);
    out.push({
      id: out.length, n, cat: PIN_FAMILY[k] || 'other', kind: k,
      x, z, t: t || null, major: !!major,
    });
  };

  for (const a of (data.attractions || [])) {
    if (!a.n || !a.p || typeof a.p[0] !== 'number') continue;
    const e = byName.get(a.n.toLowerCase());
    // A cannon is not a destination — there are fourteen of them at Fort
    // Siloso and they would bury the fort itself.
    if (a.k === 'cannon') continue;
    push(a.n, a.k, a.p[0], a.p[1], e ? e.t : null,
      a.k === 'theme_park' || a.k === 'aquarium' || a.k === 'fort' || a.k === 'museum');
  }
  // beaches and the big named greens, which are most of why people come
  for (const q of (data.green || [])) {
    if (!q.n || !q.p || q.p.length < 3) continue;
    if (q.k !== 'sand' && q.k !== 'park') continue;
    let x = 0, z = 0;
    for (const [px, pz] of q.p) { x += px; z += pz; }
    push(q.n, q.k === 'sand' ? 'beach' : 'nature_reserve',
      x / q.p.length, z / q.p.length, null, true);
  }
  // the monorail stations, because "how do I get to the other end" is the
  // first thing anyone asks about Sentosa
  for (const t of (data.termini || [])) {
    if (!t.n || !t.p) continue;
    const px = typeof t.p[0] === 'number' ? t.p : t.p[0];
    push(t.n, 'station', px[0], px[1], 'Sentosa Express station.', false);
  }
  // THE CABLE-CAR STATIONS, WHICH WERE NOT A SOURCE AT ALL.
  //
  // The owner, 2026-08-06: "now cable car station cannot teleport." He is
  // right — pins came from attractions, greens, monorail termini and hotels,
  // and the cable car lives in `data.cableway.stations`, which nothing here
  // ever read. Five stations, and the Sentosa Line is how you cross the island
  // without walking, so they are `major`.
  //
  // The monorail termini above are worse: every one of them has `n = null`, so
  // `if (!t.n) continue` drops all of them and there has never been a Sentosa
  // Express station in the list either. Named here from the cableway/monorail
  // data rather than left out — a station you cannot travel to is the one pin
  // a visitor most wants.
  for (const st of (((data.cableway || {}).stations) || [])) {
    if (!st.n || !st.p) continue;
    push(st.n + ' Cable Car', 'station', st.p[0], st.p[1],
         'Cable-car station.', true);
  }
  // hotels, from the named buildings that carry one
  for (const h of (data.hotels || [])) {
    if (!h.n || !h.p) continue;
    const px = typeof h.p[0] === 'number' ? h.p : h.p[0];
    push(h.n, 'hotel', px[0], px[1], null, false);
  }
  // NAMED BUILDINGS WERE NEVER A PIN SOURCE, so Adventure Cove Waterpark,
  // Resorts World and every hotel could not be travelled to at all — they are
  // buildings, and pins came only from attractions, greens, termini and the
  // one-entry `hotels` layer. Only the ones the travel list would keep anyway
  // are added, so this does not re-clutter what was just trimmed.
  for (const b of (data.buildings || [])) {
    if (!b.n || !b.p || !b.p.length) continue;
    const nm = b.n.toLowerCase();
    if (!TRAVEL_KEEP.some((k) => nm.includes(k))) continue;
    let x = 0, z = 0;
    for (const [px, pz] of b.p) { x += px; z += pz; }
    push(b.n, 'landmark', x / b.p.length, z / b.p.length, null, true);
  }
  // Biggest first, so the clustering below keeps the landmark and drops the
  // kiosk beside it rather than the other way round.
  out.sort((a, b) => (b.major ? 1 : 0) - (a.major ? 1 : 0));
  out.forEach((p, i) => { p.id = i; });
  return out;
}

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
    this._wireCard();
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

  // Coast, landuse and water with a bounding box each, built once. The road
  // and building grid does not hold these — they are a handful of very large
  // rings rather than thousands of small ones, so a box test per ring is
  // cheaper than bucketing them, and the minimap redraws every refresh.
  _polyIndex() {
    if (this._poly) return this._poly;
    const box = (p) => {
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      return { mnx, mxx, mnz, mxz };
    };
    const take = (list, min) => (list || [])
      .filter((q) => q.p && q.p.length > min)
      .map((q) => ({ q: q.p, k: q.k, bb: box(q.p) }));
    const water = take(this.data.water, 2);
    for (const w of water) {
      // same rule the big map uses: the sea sheet spans the extract and is not
      // a lagoon, so it takes the sea colour it already sits on
      w.big = (w.bb.mxx - w.bb.mnx) > 900 || (w.bb.mxz - w.bb.mnz) > 900;
    }
    this._poly = { coast: take(this.data.coast, 2), green: take(this.data.green, 2), water };
    return this._poly;
  }

  // Every place you can travel to. The rides are added as soon as they exist:
  // the wayfinder is created before buildRides runs, and the minimap draws
  // before that, so asking once at construction would permanently miss them.
  _travelPins() {
    if (!this._pins) this._pins = buildPins(this.data);
    if (!this._ridePins) {
      const rs = (window.__rides && window.__rides()) || [];
      if (rs.length) this._ridePins = ridePins(rs, this._pins.length);
    }
    if (!this._trailPins) this._trailPins = trailPins(this.data, this._pins.length + 900);
    if (!this._all) {
      const all = tidyPins(this._pins.concat(this._ridePins || [], this._trailPins));
      const keep = all.filter(travelWorthy);
      // never hand back an empty list: if the filter ever over-tightens, a
      // cluttered list beats no way to travel at all
      this._all = keep.length >= 8 ? keep : all;
      if (window.__dbg) window.__dbg('travel pins ' + all.length + ' -> ' + this._all.length);
    }
    return this._all;
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
    // THE DISTRICT TELEPORT LIST IS GONE (owner, 2026-08-05). It listed the
    // eight-district world's districts; with one island it offered one entry
    // while the island's own attractions sat on the map untouchable. Travel is
    // the map now — see _wireCard(). The careful tap-vs-scroll handling that
    // list grew is not lost: a pin tap uses the same "did the finger move"
    // rule, for the same reason.
    this._fillTpbar = null;
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
      // A TAP IS NOT A DRAG. Same rule the old teleport list had to learn: a
      // finger put down to pan the map must not also select whatever pin it
      // happened to land on. Remember where it went down and only treat it as
      // a tap if it barely moved.
      let tapX = 0, tapY = 0, tapT = 0, tapMoved = false;
      const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      const redraw = () => { if (this._last) this._drawBig(this._last); };
      this.bigMap.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        const t = e.touches;
        if (t.length === 2) { pt = 'pinch'; startD = dist(t) || 1; startZ = this.zoom; tapMoved = true; }
        else {
          pt = 'pan'; sx = t[0].clientX; sy = t[0].clientY; spx = this.panX; spz = this.panZ;
          tapX = t[0].clientX; tapY = t[0].clientY; tapT = Date.now(); tapMoved = false;
        }
      }, { passive: false });
      this.bigMap.addEventListener('touchmove', (e) => {
        e.preventDefault(); e.stopPropagation();
        const t = e.touches;
        if (pt === 'pinch' && t.length === 2) {
          this.zoom = Math.max(1, Math.min(8, startZ * (dist(t) / startD)));
        } else if (pt === 'pan' && t.length === 1) {
          this.panX = spx + (t[0].clientX - sx);
          this.panZ = spz + (t[0].clientY - sy);
          if (Math.hypot(t[0].clientX - tapX, t[0].clientY - tapY) > 9) tapMoved = true;
        }
        redraw();
      }, { passive: false });
      this.bigMap.addEventListener('touchend', (e) => {
        e.stopPropagation();
        if (pt === 'pan' && !tapMoved && Date.now() - tapT < 700) this._tap(tapX, tapY);
        pt = null;
      });
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
      // and a plain click selects, for anyone on a laptop
      this.bigMap.addEventListener('click', (e) => {
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 9) return;   // that was a drag
        this._tap(e.clientX, e.clientY);
      });
      this.bigMap.addEventListener('mousedown', (e) => { sx = e.clientX; sy = e.clientY; });
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

  /* ---------- tap a place, read what it is, go there ---------- */

  // The hit test measures against `_shown` — the pins the last draw actually
  // PUT ON SCREEN, with the screen positions it gave them. Re-projecting here
  // would be a second copy of the projection and a second thing to drift, and
  // it would also let you tap a pin that clustering had hidden.
  _tap(clientX, clientY) {
    const r = this.bigMap.getBoundingClientRect();
    const dpr = (this._proj && this._proj.dpr) || 1;
    const px = (clientX - r.left) * dpr, py = (clientY - r.top) * dpr;
    let best = null, bestD = Infinity;
    for (const p of (this._shown || [])) {
      const d = Math.hypot(p.px - px, p.py - py);
      if (d < bestD) { bestD = d; best = p; }
    }
    // A THUMB IS NOT A PIXEL. 26 logical px of slack, which is roughly the
    // 44px target the rest of this interface is built to.
    if (best && bestD < 26 * dpr) this._select(best);
    else this._select(null);
  }

  _select(pin) {
    this.selected = pin;
    const card = document.getElementById('mapcard');
    if (card) card.classList.toggle('on', !!pin);
    if (pin) {
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set('mapcardk', pin.play ? 'you can ride this' : pin.trail ? 'walking trail' : (PIN_LABEL[pin.cat] || 'place'));
      set('mapcardn', pin.n);
      // NO INVENTED COPY. If research never produced a line for this place the
      // card says what KIND of place it is and stops. Making something up here
      // would be the one thing this project does not do.
      set('mapcardt', pin.t || '');
      const el = document.getElementById('mapcardt');
      if (el) el.style.display = pin.t ? '' : 'none';
      const S = this._last;
      set('mapcardd', S ? `${Math.round(Math.hypot(pin.x - S.x, pin.z - S.z))} m away` : '');
    }
    if (this._last) this._drawBig(this._last);
  }

  _wireCard() {
    const go = document.getElementById('mapcardgo');
    const x = document.getElementById('mapcardx');
    const fire = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const p = this.selected;
      if (!p) return;
      // Face the way you were already facing; arriving spun round to face
      // north for no reason is disorienting.
      const h = this._last ? this._last.heading : 0;
      // A pin is a place, not a doorstep: 46 of the 78 sit inside their own
      // building or beach ring. Land on the nearest ground the player can move
      // on — see __landNear.
      const q = window.__landNear ? window.__landNear(p.x, p.z) : p;
      if (window.__teleport) window.__teleport(q.x, q.z, h);
      this._select(null);
      this.setOpen(false);
    };
    const shut = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } this._select(null); };
    if (go) {
      go.addEventListener('click', fire);
      go.addEventListener('touchend', fire, { passive: false });
    }
    if (x) {
      x.addEventListener('click', shut);
      x.addEventListener('touchend', shut, { passive: false });
    }
  }

  setOpen(v) {
    this.open = !!v;
    if (!this.open) this._select(null);
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
    // ONE MAP, TWO ZOOMS. The owner, 2026-08-05: "the minimap display why not
    // updated. Only click in then new design." He was right and it was exactly
    // that — the island map he asked for landed in _drawBig and this corner
    // canvas kept the old dark street diagram, so opening the map changed
    // not just the scale but the entire visual language, and the corner
    // stopped looking like a piece of the thing it is a piece of.
    //
    // So this draws the SAME layers in the SAME palette as _drawBig — sea,
    // land, the green mass, sand, roads with a casing, quiet buildings — just
    // turned heading-up and cropped to 130m. The only things that stay dark
    // are the marker outline and the compass, because they sit ON the paper
    // and have to read against it.
    const C = MAPCOL;
    g.save();
    g.clearRect(0, 0, W, W);
    g.fillStyle = C.sea; g.fillRect(0, 0, W, W);

    g.translate(W / 2, W / 2);
    // turn the map so the way you are facing is up
    g.rotate(-Math.atan2(Math.sin(S.heading), -Math.cos(S.heading)));
    g.scale(k, k);
    g.translate(-S.x, -S.z);

    // The window is rotated, so the polygons that can reach it are the ones
    // within the CORNER radius, not the edge distance.
    const R = REACH * 1.45;
    const near = this._near(S.x, S.z, REACH * 1.6);
    const polys = this._polyIndex();
    const ring = (pts) => {
      g.beginPath();
      pts.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z)));
      g.closePath();
    };
    const hits = (bb) => bb.mnx < S.x + R && bb.mxx > S.x - R && bb.mnz < S.z + R && bb.mxz > S.z - R;

    /* ---- the island, then what it is made of ---- */
    g.fillStyle = C.land;
    for (const c of polys.coast) if (hits(c.bb)) { ring(c.q); g.fill(); }
    for (const q of polys.green) {
      if (!hits(q.bb)) continue;
      const col = C.green[q.k];
      if (!col) continue;
      g.fillStyle = col; ring(q.q); g.fill();
    }
    for (const w of polys.water) {
      if (!hits(w.bb)) continue;
      g.fillStyle = w.big ? C.sea : C.lagoon;
      ring(w.q); g.fill();
    }

    // roads as ribbons at their real width, so a junction reads as a junction
    g.lineCap = 'round'; g.lineJoin = 'round';
    // Two passes, casing then fill — one pass per road draws each road's
    // casing over its neighbour's fill and the junctions come apart. Same
    // reason as the big map.
    const line = (r) => {
      g.beginPath();
      r.p.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z)));
      g.stroke();
    };
    const drive = [...near.r].filter((r) => r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'steps');
    g.strokeStyle = C.roadCase;
    for (const r of drive) { g.lineWidth = Math.max(3 / k, r.w || 7) + 2.2 / k; line(r); }
    g.strokeStyle = C.road;
    for (const r of drive) { g.lineWidth = Math.max(3 / k, r.w || 7); line(r); }
    // footpaths: at 130m across they are most of how you actually move, and
    // the big map only earns the right to hide them because it is zoomed out
    g.save();
    g.strokeStyle = C.path; g.lineWidth = 1.6 / k;
    g.setLineDash([4 / k, 4 / k]);
    for (const r of near.r) {
      if (r.k !== 'footway' && r.k !== 'pedestrian') continue;
      line(r);
    }
    g.restore();

    // buildings, quiet on purpose — the same call the big map makes
    g.fillStyle = C.bld;
    for (const b of near.b) { ring(b.p); g.fill(); }

    // NO street highlights. There used to be amber lines over the main
    // streets (first one, then all of them with "the one you are on"
    // thicker) and the user read the thick one as an unexplained glitch —
    // twice, in two different designs. A real map tracks YOU; the streets
    // are already legible. The marker and its facing cone below are the only
    // amber left. (User decision, 2026-07-30.)
    g.restore();

    // The places you can travel to, as the same coloured dots the big map
    // pins them with — so the corner answers "is there anything near me"
    // and the big map answers "what is it". Unlabelled: at this size a name
    // is unreadable and covers the map it is drawn on.
    g.save();
    g.translate(W / 2, W / 2);
    g.rotate(-Math.atan2(Math.sin(S.heading), -Math.cos(S.heading)));
    for (const p of this._travelPins()) {
      const dx = p.x - S.x, dz = p.z - S.z;
      if (Math.abs(dx) > R || Math.abs(dz) > R) continue;
      const cat = PIN_CAT[p.cat] || PIN_CAT.other;
      g.beginPath(); g.arc(dx * k, dz * k, p.major ? 4.2 : 3.2, 0, Math.PI * 2);
      g.fillStyle = (cat && cat.c) || '#8a7a5e'; g.fill();
      g.strokeStyle = 'rgba(255,250,240,0.9)'; g.lineWidth = 1.4; g.stroke();
    }
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

    // north, which a turning map otherwise loses completely. INK, not cream:
    // these used to be pale because the tile was near-black, and on the paper
    // background they would now be drawn in almost exactly the land colour.
    const nAng = -Math.atan2(Math.sin(S.heading), -Math.cos(S.heading));
    g.save();
    g.translate(W - 26, 26); g.rotate(nAng);
    g.strokeStyle = 'rgba(58,48,34,0.75)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 8); g.lineTo(0, -8); g.stroke();
    g.beginPath(); g.moveTo(0, -11); g.lineTo(4, -5); g.lineTo(-4, -5); g.closePath();
    g.fillStyle = 'rgba(58,48,34,0.9)'; g.fill();
    g.restore();
    g.fillStyle = 'rgba(58,48,34,0.9)';
    g.font = '600 13px ui-sans-serif,system-ui,Helvetica,Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('N', W - 26 + Math.sin(nAng) * 20, 26 - Math.cos(nAng) * 20);

    // scale bar: without one, a map that zooms tells you nothing about distance
    g.strokeStyle = 'rgba(58,48,34,0.6)'; g.lineWidth = 2;
    const bar = 50 * k;
    g.beginPath(); g.moveTo(12, W - 16); g.lineTo(12 + bar, W - 16); g.stroke();
    g.font = '500 11px ui-sans-serif,system-ui,Helvetica,Arial';
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(58,48,34,0.9)';
    g.fillText('scale 50 m', 12, W - 22);
  }

  /* ---------- the whole street ---------- */

  // THE ISLAND MAP.
  //
  // What this replaced, and why (owner, 2026-08-05): "the mini map need to
  // change. Now look too basic and not fun. Its supposes to be a fun sentosa
  // map design like game concept that is visually nice and easy for ppl to
  // understand. And like can click on map to teleport to attractions."
  //
  // The old map drew grey road centrelines and grey building footprints on
  // black — a technical diagram of the geometry. And travel lived in a
  // TELEPORT pill listing DISTRICTS, a leftover from the eight-district world:
  // with one island it offered one entry, while the island's 54 real
  // attractions sat on the map as unlabelled dots you could not touch.
  //
  // So this is drawn as a printed tourist map instead — paper, sea, the green
  // mass, beaches, roads as ribbons — and every attraction is a PIN you tap.
  // The pill is gone; the map is how you travel.
  //
  // It is still one canvas and no images: the whole thing is paths and text,
  // which is what keeps it cheap enough to redraw on every pan frame.
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

    const { mnx, mxx, mnz, mxz } = this.bounds;
    const pad = 26 * dpr;
    const zoom = this.zoom || 1;
    const k = Math.min((W - pad * 2) / (mxx - mnx), (H - pad * 2) / (mxz - mnz)) * zoom;
    const ox = (W - (mxx - mnx) * k) / 2 - mnx * k + (this.panX || 0) * dpr;
    const oz = (H - (mxz - mnz) * k) / 2 - mnz * k + (this.panZ || 0) * dpr;
    const X = (x) => x * k + ox, Z = (z) => z * k + oz;
    // the projection the tap handler measures against — kept on the instance
    // so a hit test can never disagree with what was drawn
    this._proj = { X, Z, k, dpr };

    const C = MAPCOL;
    g.lineCap = 'round'; g.lineJoin = 'round';

    /* ---- the sea, and the paper it is printed on ---- */
    g.fillStyle = C.sea;
    g.fillRect(0, 0, W, H);

    const ring = (pts) => {
      g.beginPath();
      pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
      g.closePath();
    };

    /* ---- the island ---- */
    // A soft shadow under the coast so the land sits ON the water rather than
    // being a hole cut in it. This one shadow is most of why the map reads as
    // printed rather than as a diagram.
    // THE ISLAND IS THE SUBJECT; THE MAINLAND IS THE FRAME.
    //
    // The extract keeps Keppel, Brani and the far shore on purpose (see
    // SENTOSA.md), and drawing every coast ring the same cream made the
    // mainland the brightest mass on a map of Sentosa. The ring the PLAYER is
    // standing in is the island — that is the only test that cannot be fooled
    // by which ring happens to be biggest — and everything else is drawn back.
    const coasts = (this.data.coast || []).filter((c) => c.p && c.p.length > 2);
    const inRing = (x, z, pts) => {
      let h = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], zi = pts[i][1], xj = pts[j][0], zj = pts[j][1];
        if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) h = !h;
      }
      return h;
    };
    if (this._island === undefined) {
      this._island = coasts.find((c) => inRing(S.x, S.z, c.p)) || null;
    }
    g.fillStyle = C.landFar;
    for (const c of coasts) { if (c !== this._island) { ring(c.p); g.fill(); } }
    g.save();
    g.shadowColor = 'rgba(24,58,66,0.34)';
    g.shadowBlur = 13 * dpr; g.shadowOffsetY = 3 * dpr;
    g.fillStyle = C.land;
    if (this._island) { ring(this._island.p); g.fill(); }
    g.restore();

    /* ---- what the land is made of ---- */
    // Drawn biggest-first so a beach inside a park is not painted over by it.
    const greens = (this.data.green || []).filter((q) => q.p && q.p.length > 2);
    const order = { golf: 0, park: 1, grass: 2, wood: 3, pitch: 4, sand: 5, pool: 6 };
    for (const q of [...greens].sort((a, b) => (order[a.k] ?? 9) - (order[b.k] ?? 9))) {
      const col = C.green[q.k];
      if (!col) continue;
      g.fillStyle = col; ring(q.p); g.fill();
    }
    // THE SEA IS NOT A LAGOON. The `water` layer holds both the sea sheet —
    // which spans the whole extract — and the inland ponds. Painting them all
    // the lagoon colour drew a hard-edged teal RECTANGLE across the map where
    // the sea sheet ended, which was the first thing the eye went to. Big
    // water is the sea and takes the sea colour it is already sitting on;
    // small water is a pond and gets the brighter teal.
    for (const w of (this.data.water || [])) {
      if (!w.p || w.p.length < 3) continue;
      let mnx2 = Infinity, mxx2 = -Infinity, mnz2 = Infinity, mxz2 = -Infinity;
      for (const [x, z] of w.p) {
        if (x < mnx2) mnx2 = x; if (x > mxx2) mxx2 = x;
        if (z < mnz2) mnz2 = z; if (z > mxz2) mxz2 = z;
      }
      const big = (mxx2 - mnx2) > 900 || (mxz2 - mnz2) > 900;
      g.fillStyle = big ? C.sea : C.lagoon;
      ring(w.p); g.fill();
    }

    /* ---- roads, as ribbons with a casing ---- */
    // Two passes: every casing, then every fill. One pass per road draws each
    // road's casing over its neighbour's fill and the junctions come apart.
    const roads = (this.data.roads || []).filter(
      (r) => r.p && r.p.length > 1 && r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'steps');
    const rw = (r) => Math.max(1.1 * dpr, (r.w || 7) * k * 0.68);
    const line = (r) => {
      g.beginPath();
      r.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
      g.stroke();
    };
    g.strokeStyle = C.roadCase;
    for (const r of roads) { g.lineWidth = rw(r) + 2.4 * dpr; line(r); }
    g.strokeStyle = C.road;
    for (const r of roads) { g.lineWidth = rw(r); line(r); }
    // footpaths, dashed and thin — they are how you get around on foot and
    // leaving them off made the island look emptier than it is
    if (zoom > 1.6) {
      g.save();
      g.strokeStyle = C.path;
      g.lineWidth = Math.max(1, 1.5 * dpr);
      g.setLineDash([4 * dpr, 4 * dpr]);
      for (const r of (this.data.roads || [])) {
        if (!r.p || r.p.length < 2) continue;
        if (r.k !== 'footway' && r.k !== 'pedestrian') continue;
        line(r);
      }
      g.restore();
    }

    /* ---- buildings, quiet on purpose ---- */
    // They are context, not content: the pins are what you are looking for,
    // and 1,095 filled footprints at full contrast bury them.
    g.fillStyle = C.bld;
    for (const b of (this.data.buildings || [])) {
      if (!b.p || b.p.length < 3) continue;
      ring(b.p); g.fill();
    }

    /* ---- the pins ---- */
    // Built once (they do not move), hit-tested by the tap handler against the
    // same projection this draw used.
    const pins = this._travelPins();
    // Cluster by dropping pins that would land on top of one another at this
    // zoom: at island scale 54 pins is pin soup and nothing is readable. The
    // SELECTED pin always survives, or tapping one would make it vanish.
    const shown = [];
    const near = (a, b, d) => Math.hypot(a.px - b.px, a.py - b.py) < d;
    const minGap = 34 * dpr;
    const sel = this.selected;
    for (const p of pins) {
      p.px = X(p.x); p.py = Z(p.z);
      if (p.px < -40 * dpr || p.px > W + 40 * dpr || p.py < -40 * dpr || p.py > H + 40 * dpr) continue;
      const isSel = sel && sel.id === p.id;
      if (!isSel && shown.some((q) => near(p, q, minGap))) continue;
      shown.push(p);
    }
    this._shown = shown;

    // MEASURE, THEN DECIDE, THEN DRAW. The first cut drew the label and then
    // erased it with clearRect when it collided — which punches a hole in the
    // map, because there is a map under it.
    // FOUR PLACES A LABEL CAN GO, not one.
    //
    // With only "below the pin" available, FORT SILOSO — the biggest thing on
    // the west of the island — lost its name to a collision with the Trickeye
    // PIN 86px away, while Trickeye kept its own. A label that has nowhere to
    // go should move, not vanish. Below first (it reads best under a marker),
    // then above, then out to either side.
    const labelBoxes = (p, big) => {
      g.font = `${big ? 650 : 600} ${Math.round((big ? 12 : 11) * dpr)}px `
        + 'ui-sans-serif,system-ui,Helvetica,Arial';
      const tw = g.measureText(p.n).width;
      const w2 = tw + 12 * dpr, h2 = 17 * dpr, r2 = (big ? 13 : 10) * dpr;
      return [
        [p.px - w2 / 2, p.py + r2 + 3 * dpr, w2, h2],
        [p.px - w2 / 2, p.py - r2 - 3 * dpr - h2, w2, h2],
        [p.px + r2 + 4 * dpr, p.py - h2 / 2, w2, h2],
        [p.px - r2 - 4 * dpr - w2, p.py - h2 / 2, w2, h2],
      ];
    };
    const drawLabel = (p, big, box) => {
      g.font = `${big ? 650 : 600} ${Math.round((big ? 12 : 11) * dpr)}px `
        + 'ui-sans-serif,system-ui,Helvetica,Arial';
      g.fillStyle = big ? 'rgba(32,38,44,0.94)' : 'rgba(255,252,244,0.92)';
      g.beginPath(); g.roundRect(box[0], box[1], box[2], box[3], 5 * dpr); g.fill();
      g.fillStyle = big ? '#f7efdd' : '#3d444c';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(p.n, box[0] + box[2] / 2, box[1] + box[3] / 2);
    };

    // SEED THE COLLISION SET WITH THE PINS THEMSELVES. Labels were only
    // tested against other labels, so a name landed on top of a neighbouring
    // pin — 'Madame Tussauds Singapore' sat across two of them in the first
    // render. The pin is the thing you tap; nothing may cover it.
    const taken = shown.map((p) => {
      const rr = ((sel && sel.id === p.id) ? 13 : 10) * dpr + 2 * dpr;
      return [p.px - rr, p.py - rr, rr * 2, rr * 2];
    });
    // LANDMARKS CLAIM THEIR LABEL FIRST. Drawn in pin order, Trickeye and
    // Scentopia took the space and FORT SILOSO — the thing people come for —
    // came out unlabelled. The circles are all drawn first so no pin is ever
    // missing; only the naming is prioritised.
    for (const p of shown) {
      const isSel = sel && sel.id === p.id;
      const cat = PIN_CAT[p.cat] || PIN_CAT.other;
      const r = (isSel ? 13 : 10) * dpr;
      g.save();
      g.shadowColor = 'rgba(20,40,45,0.35)';
      g.shadowBlur = 5 * dpr; g.shadowOffsetY = 1.5 * dpr;
      g.fillStyle = cat.c;
      g.beginPath(); g.arc(p.px, p.py, r, 0, Math.PI * 2); g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,252,244,0.95)';
      g.lineWidth = 2 * dpr;
      g.beginPath(); g.arc(p.px, p.py, r, 0, Math.PI * 2); g.stroke();
      // the glyph: paths, never emoji — see the design rules in the repo
      drawGlyph(g, cat.g, p.px, p.py, r * 0.62, '#fffcf4');
      void 0;
    }
    for (const p of [...shown].sort((a, b) => (b.major ? 1 : 0) - (a.major ? 1 : 0)
        + ((sel && sel.id === b.id) ? 2 : 0) - ((sel && sel.id === a.id) ? 2 : 0))) {
      const isSel = sel && sel.id === p.id;
      // Only label what there is room for, and always label the selection.
      if (!(isSel || zoom > 1.35 || p.major)) continue;
      let box = null;
      for (const cand of labelBoxes(p, isSel)) {
        // A CLIPPED LABEL IS WORSE THAN NO LABEL: the first render shipped
        // 'ntopia' and 'g ruins' at the screen edges.
        if (cand[0] < 4 * dpr || cand[0] + cand[2] > W - 4 * dpr
            || cand[1] < 4 * dpr || cand[1] + cand[3] > H - 4 * dpr) continue;
        const hit = taken.some((t) => cand[0] < t[0] + t[2] && cand[0] + cand[2] > t[0]
          && cand[1] < t[1] + t[3] && cand[1] + cand[3] > t[1]);
        if (!hit) { box = cand; break; }
      }
      if (!box) continue;
      taken.push(box);
      drawLabel(p, isSel, box);
    }

    /* ---- you ---- */
    const px = X(S.x), pz = Z(S.z);
    g.save();
    g.translate(px, pz);
    g.rotate(Math.atan2(Math.sin(S.heading), -Math.cos(S.heading)));
    g.fillStyle = 'rgba(255,168,38,0.30)';
    g.beginPath(); g.moveTo(0, 0);
    g.arc(0, 0, 46 * dpr, -Math.PI / 2 - 0.40, -Math.PI / 2 + 0.40); g.closePath(); g.fill();
    g.restore();
    // AMBER, not the map's own green: a dark green dot on a green island is
    // the one marker that must never be hunted for, and it was.
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 7 * dpr;
    g.fillStyle = '#ff9e18';
    g.beginPath(); g.arc(px, pz, 7.5 * dpr, 0, Math.PI * 2); g.fill();
    g.restore();
    g.strokeStyle = '#2b2318'; g.lineWidth = 2.6 * dpr;
    g.beginPath(); g.arc(px, pz, 7.5 * dpr, 0, Math.PI * 2); g.stroke();

    /* ---- scale ---- */
    const bar = 200 * k;
    g.strokeStyle = 'rgba(45,60,66,0.6)'; g.lineWidth = 2 * dpr;
    const bx = W - bar - 20 * dpr, by = H - 22 * dpr;
    g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + bar, by); g.stroke();
    g.fillStyle = 'rgba(45,60,66,0.72)';
    g.font = `500 ${Math.round(11 * dpr)}px ui-sans-serif,system-ui,Helvetica,Arial`;
    // RIGHT-ALIGNED to the bar's right end: centring a label wider than the
    // bar pushed it off the screen edge and it shipped to the user's phone
    // clipped. The text grows leftwards over the map, never off.
    g.textAlign = 'right'; g.textBaseline = 'alphabetic';
    g.fillText('this line = 200 m', bx + bar, by - 6 * dpr);
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
