// PLACE NAMES IN THE WORLD, not in a pill at the top of the screen.
//
// The owner: "instead of like the top got one navigation pill to say where i
// am, can we dont use that. And like make places have like 3d names over the
// landmark so like its more cooler and immersive when i explore?"
//
// So the readout goes and the island labels itself. A name floats over the
// thing it names, you read it because you are looking at the thing, and
// finding somewhere becomes part of exploring instead of a caption.
//
// COST, because this world has 290MB of heap and a phone to run on:
//   * ONE texture. Every label is drawn into the shared SignAtlas, the same
//     page machinery the shopfronts and street signs already use, so eighty
//     names cost one canvas rather than eighty.
//   * ONE draw call per atlas page. All the quads share the page's material
//     and are merged into a single BufferGeometry.
//   * No per-frame allocation. Billboarding rewrites the existing position
//     buffer in place; nothing is created while you ride.
//
// The labels face the camera by construction (the quad's corners are rebuilt
// each frame from the camera's right and up vectors) rather than by rotating
// eighty objects, which is both cheaper and immune to the roll a banking
// camera would otherwise put into the text.

import { sharedSignAtlas } from './tex.js';

// how far a name is legible before it is noise
const SHOW_NEAR = 18;      // fades in past this (you are on top of it)
const SHOW_FAR = 340;      // gone by here
// RELATIVE importance, not world height. A label is sized to hold a roughly
// CONSTANT SIZE ON SCREEN (world height proportional to distance), because a
// name exists to be read: sized in fixed world units it is a billboard when
// you are near it and an unreadable speck when you are not. First pass used
// fixed world heights of 9/6/4.2m with a distance boost on top, and "SKYLINE
// LUGE" covered a third of the frame.
const TIER = { major: 1.3, mid: 1.0, minor: 0.78 };
// apparent size: world metres of label height per metre of distance
const SCREEN_K = 0.042;
const MIN_H = 1.8, MAX_H = 17.0;

// Attractions worth naming. `k` values that are furniture, not places.
// `building` goes too: OSM tags a fort's outbuildings as attractions, so
// "Store Room" and "Engine Room" were floating names the same size as FORT
// SILOSO and overlapping it. A place label is for somewhere you would tell a
// friend to meet you.
const SKIP_KINDS = new Set(['artwork', 'cannon', 'bench', 'picnic_table',
                            'building', 'city_gate']);
// Names that are not places you navigate to.
const SKIP_NAME = /^(entrance|exit|toilets?|shelter|car ?park)$/i;

export function buildPlaceLabels(THREE, data, world, surfaceAt) {
  const atlas = sharedSignAtlas(THREE);
  const items = [];

  const push = (name, x, z, y, tier) => {
    if (!name || SKIP_NAME.test(name)) return;
    const clean = String(name).trim();
    if (clean.length < 2 || clean.length > 34) return;
    items.push({ name: clean, x, z, y, tier });
  };

  // 1. attractions — the things you go to Sentosa for
  for (const a of (data.attractions || [])) {
    if (!a.n || SKIP_KINDS.has(a.k)) continue;
    const p = Array.isArray(a.p) && typeof a.p[0] === 'number' ? a.p : null;
    if (!p) continue;
    const tier = (a.k === 'theme_park' || a.k === 'fort' || a.k === 'aquarium')
      ? 'major' : 'mid';
    push(a.n, p[0], p[1], 0, tier);
  }
  // 2. the beaches, named on their own sand
  for (const g of (data.green || [])) {
    if (g.k !== 'sand' || !g.n || !g.p || g.p.length < 3) continue;
    let cx = 0, cz = 0;
    for (const q of g.p) { cx += q[0]; cz += q[1]; }
    push(g.n, cx / g.p.length, cz / g.p.length, 0, 'major');
  }
  // 3. the stations you can actually ride between
  for (const m of (data.mrt || [])) {
    if (m && m.n && Array.isArray(m.p)) push(m.n, m.p[0], m.p[1], 0, 'mid');
  }
  for (const s of (((data.cableway || {}).stations) || [])) {
    if (s && s.n && Array.isArray(s.p)) push(s.n, s.p[0], s.p[1], 0, 'mid');
  }
  // 4. the resorts OSM carries as NODES, which the building layer never had —
  // Sofitel, Capella, Amara, ONE°15, The Outpost. data/hotels.py explains why
  // they are places rather than building names: their nodes sit 49-237m from
  // the nearest unnamed footprint, which is not evidence enough to put a
  // resort's name on a specific building.
  for (const h of (data.hotels || [])) {
    if (h && h.n && Array.isArray(h.p)) push(h.n, h.p[0], h.p[1], 0, 'mid');
  }

  // 5. NOT buildings. The owner, on seeing the first pass: "can it be obvious
  // shop signs and building signs so can see". A building has a facade, and a
  // name on that facade is both more readable and more of a place than a
  // plaque hovering over the roof — sgdetail.js mounts those, and every named
  // building down to a 7m frontage now gets one. Floating names are for the
  // things that have NO facade to sign: a beach, a fort, a trailhead, a
  // station. Two labels for one place is worse than either alone.

  // de-duplicate by name, keeping the first: OSM repeats a name across every
  // part of a complex, and eight "Universal Studios Singapore" labels stacked
  // on one roof is worse than none.
  const seen = new Set();
  const places = [];
  for (const it of items) {
    const k = it.name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    places.push(it);
  }
  if (!places.length) return null;

  // lay each name into the shared atlas and build one quad per name
  const byPage = new Map();
  for (const p of places) {
    // null background: a name hanging in the air is TEXT, not a plaque. See the
    // note in SignAtlas.add — the dark panel read as a black rectangle floating
    // over the lagoon at Tanjong.
    const slot = atlas.add(p.name, null, '#ffffff');
    if (!slot || !slot.mat) continue;
    let list = byPage.get(slot.mat);
    if (!list) { list = []; byPage.set(slot.mat, list); }
    p.uv = slot;
    // seat the label above whatever it stands on
    const ground = surfaceAt(p.x, p.z);
    p.baseY = ground + (p.y || 0) + 6.0;
    // THE QUAD MUST HAVE THE ATLAS CELL'S ASPECT. The first version guessed the
    // width from the character count (`name.length * 0.52`), which has nothing
    // to do with how the atlas actually laid the text out — SignAtlas fits the
    // string into a fixed cell and shrinks the font to make it fit. Guessing
    // stretched short names and CLIPPED long ones: "Festive Grand Theatre" read
    // as "FESTIVE C…RE". The cell's own UV span is the answer.
    p.aspect = (slot.u1 - slot.u0) / Math.max(1e-6, (slot.v1 - slot.v0));
    list.push(p);
  }

  // and upload what we just drew — see the note in SignAtlas.add. add() marks
  // the page dirty on its own now, so this is belt and braces rather than the
  // only thing holding it up.
  if (atlas.finish) atlas.finish();

  const group = new THREE.Group();
  group.name = 'placeLabels';
  group.renderOrder = 8;
  const batches = [];
  for (const [mat, list] of byPage) {
    const n = list.length;
    const pos = new Float32Array(n * 4 * 3);
    const uv = new Float32Array(n * 4 * 2);
    const idx = new Uint16Array(n * 6);
    list.forEach((p, i) => {
      const o = i * 4;
      uv[o * 2 + 0] = p.uv.u0; uv[o * 2 + 1] = p.uv.v0;
      uv[o * 2 + 2] = p.uv.u1; uv[o * 2 + 3] = p.uv.v0;
      uv[o * 2 + 4] = p.uv.u1; uv[o * 2 + 5] = p.uv.v1;
      uv[o * 2 + 6] = p.uv.u0; uv[o * 2 + 7] = p.uv.v1;
      idx[i * 6 + 0] = o; idx[i * 6 + 1] = o + 1; idx[i * 6 + 2] = o + 2;
      idx[i * 6 + 3] = o; idx[i * 6 + 4] = o + 2; idx[i * 6 + 5] = o + 3;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    // a very large sphere: these move every frame, so let them never cull
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: mat.map, transparent: true, depthWrite: false,
      toneMapped: false, fog: false, side: THREE.DoubleSide,
    }));
    m.frustumCulled = false;
    m.renderOrder = 8;
    group.add(m);
    batches.push({ mesh: m, list, pos });
  }
  world.add(group);

  const right = new THREE.Vector3(), up = new THREE.Vector3();
  const update = (camera) => {
    camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());
    const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
    for (const b of batches) {
      const pos = b.pos;
      b.list.forEach((p, i) => {
        const dx = p.x - cx, dz = p.z - cz;
        const d = Math.hypot(dx, dz);
        // Out of range: collapse the quad to a point. Cheaper and simpler than
        // rebuilding the index buffer, and it costs no fill.
        if (d > SHOW_FAR || d < 2) {
          const o = i * 12;
          for (let k = 0; k < 12; k++) pos[o + k] = 0;
          return;
        }
        // Constant apparent size: world height rises with distance, so the
        // name reads the same whether you are beside it or across the island.
        const h = Math.max(MIN_H, Math.min(MAX_H, d * SCREEN_K * TIER[p.tier]));
        const w = h * p.aspect;
        const o = i * 12;
        const bx = p.x, by = p.baseY + Math.min(14, d * 0.03), bz = p.z;
        const rx = right.x * w * 0.5, ry = right.y * w * 0.5, rz = right.z * w * 0.5;
        const ux = up.x * h * 0.5, uy = up.y * h * 0.5, uz = up.z * h * 0.5;
        pos[o + 0] = bx - rx - ux; pos[o + 1] = by - ry - uy; pos[o + 2] = bz - rz - uz;
        pos[o + 3] = bx + rx - ux; pos[o + 4] = by + ry - uy; pos[o + 5] = bz + rz - uz;
        pos[o + 6] = bx + rx + ux; pos[o + 7] = by + ry + uy; pos[o + 8] = bz + rz + uz;
        pos[o + 9] = bx - rx + ux; pos[o + 10] = by - ry + uy; pos[o + 11] = bz - rz + uz;
      });
      b.mesh.geometry.attributes.position.needsUpdate = true;
    }
  };

  return { group, update, count: places.length };
}
