// Build the street from real OSM geometry: extruded footprints, road ribbons,
// pavements, canopy trees, covered walkway, crossings, street furniture.
import * as THREE from '../lib/three.module.js';
import { PAL, R, rand, pick, chance, hex, texAsphalt, texPaving, texConcrete, texCurtain, texShopfront, texGranite, texGranitePanel, texTactile, texWater, texTowerGlass, texPunched, texBalcony, texShophouse, texLeaves, texAO, texCentrepointPanel, texRedBrick, texPeranakan, texPaverBlock, texCentreDash, texChevron, texSotaRibbons, rng } from './tex.js';
import { recipeFor, hasShopfront, shophouse, autoUV, flattenRoofUV,
         constructionSite } from './landmarks.js';

export const TEX = {
  asphalt: texAsphalt(),
  paving: texPaving(),
  leaf: texLeaves(),
  ao: texAO(),
};

// A handful of curtain-wall variants, reused across buildings so the street
// reads as varied without a texture per building.
const CURTAINS = [
  texCurtain(0x7d94a6, 0x5b656e, 8),   // cool blue-grey
  texCurtain(0x8b98a2, 0x6b7278, 7),   // pale silver
  texCurtain(0x6f8f8a, 0x4d5f5c, 9),   // green-tinted, very Orchard
  texCurtain(0x9a9384, 0x6d6a62, 6),   // bronze
  texCurtain(0x84939f, 0x3f4750, 10),  // dark mullion, tall floors
];
const SHOPS = [texShopfront(), texShopfront(), texShopfront()];
const STONE = [
  texConcrete(0xb3aa9a, 0.5), texConcrete(0x9c948a, 0.6),
  texConcrete(0xc2b5a0, 0.45), texConcrete(0x8d8a86, 0.7),
];
// Facade families, so the 180-odd background buildings are not one material.
// Chosen by a stable hash of the footprint, which keeps a building looking the
// same between reloads.
const PUNCHED = [texPunched(0xa8a091), texPunched(0xbdb3a0), texPunched(0x938c82)];
const BALCONY = [texBalcony(0xc6bda9), texBalcony(0xada596)];
// WHAT A BUILDING IS MADE OF, FROM THE MAP.
//
// This used to hash the footprint and pick a family from the remainder, which is
// a deterministic way of saying "at random": the 1928 shophouse and the 2015
// office tower next door had the same chance of coming out as mirrored glass.
//
// Three real signals, in order of how much they actually say:
//
//   `building:material`  rare (28 buildings) but it is an ANSWER. A hash was
//                        overriding a surveyed fact.
//   `start_date`         467 buildings, 24%, and never read until 2026-07-28.
//                        Era predicts appearance better than anything else at
//                        riding speed. Singapore's building stock has hard
//                        visual eras: masonry shophouses and colonial blocks
//                        before the war, plain concrete with punched windows
//                        through the 60s and 70s, balconied slabs in the 80s
//                        and early 90s, and curtain-wall glass after that.
//   footprint hash       still the fallback, for the 73% the map says nothing
//                        about. A guess is fine when it is labelled a guess.
function familyFor(b) {
  let h = 0;
  for (const [x, z] of b.p) h = (h * 31 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
  h = Math.abs(h);

  // a surveyed material beats everything, including the size rule below
  const mat = (b.mat || '').toLowerCase();
  if (mat) {
    if (/glass|curtain/.test(mat)) return { pool: CURTAINS, rough: 0.32, metal: 0.10, src: 'mat' };
    if (/metal|steel|aluminium|aluminum/.test(mat)) return { pool: CURTAINS, rough: 0.42, metal: 0.22, src: 'mat' };
    if (/brick|stone|granite|marble|sandstone/.test(mat)) return { pool: STONE, rough: 0.88, metal: 0, src: 'mat' };
    if (/concrete|cement|plaster|render/.test(mat)) return { pool: PUNCHED, rough: 0.88, metal: 0, src: 'mat' };
  }

  // a big footprint or a landmark is a podium or a mall, and those are glazed
  // whatever year they went up
  if (b.a > 1400 || b.k) return { pool: CURTAINS, rough: 0.34, metal: 0.08, src: mat ? 'mat' : 'size' };

  // era
  const yr = b.yr;
  if (yr) {
    if (yr <= 1945) return { pool: STONE, rough: 0.9, metal: 0, src: 'yr' };
    if (yr <= 1978) return { pool: PUNCHED, rough: 0.88, metal: 0, src: 'yr' };
    // the balconied slab is the 80s and early 90s; a hash inside the era keeps
    // a street of them from being one repeated building
    if (yr <= 1995) return (h % 3 === 0)
      ? { pool: PUNCHED, rough: 0.84, metal: 0, src: 'yr' }
      : { pool: BALCONY, rough: 0.8, metal: 0, src: 'yr' };
    return { pool: CURTAINS, rough: 0.36, metal: 0.08, src: 'yr' };
  }

  // NO DATE OF ITS OWN, BUT A GAZETTED CONSERVATION AREA AROUND IT.
  //
  // `era` is a [from, to] band that URA publishes for the AREA, not for this
  // building: the styles its stock is built in, and the years those styles
  // span. It arrives on 3,059 buildings that carry no date at all, almost all
  // of them conserved shophouses in Little India, Chinatown and Kampong Glam,
  // and until it existed every one of them picked its facade by hashing its
  // own footprint.
  //
  // The year is drawn from the band by the SAME hash, so a terrace does not
  // come out as one repeated building and two neighbours do not land on the
  // same year — but it stays inside a range this project can point at a source
  // for. Read after `yr` and before the district mix: a surveyed date for this
  // building beats a published band for its street, and the band beats a rule
  // we invented.
  const era = b.era;
  if (era && era.length === 2) {
    const y = era[0] + (h % Math.max(1, era[1] - era[0] + 1));
    if (y <= 1945) return { pool: STONE, rough: 0.9, metal: 0, src: 'era' };
    if (y <= 1978) return { pool: PUNCHED, rough: 0.88, metal: 0, src: 'era' };
    return { pool: BALCONY, rough: 0.8, metal: 0, src: 'era' };
  }

  // A BUILDING WITH NO DATE LOOKS LIKE ITS NEIGHBOURS THAT HAVE ONE.
  //
  // The fallback was a fixed 34/18/22/26 split across punched, balcony, stone
  // and curtain wall — the same mix in every district. Little India carries a
  // date on 1% of the buildings a rider passes and Robertson Quay on none, so
  // almost every frontage in those districts took that global hash: a
  // pre-war shophouse street was dealt eighties balconies and curtain walls at
  // the same rate as Marina Bay. The district's OWN dated buildings are a far
  // better prior than a constant, and every district has some.
  //
  // Still INVENTED, and the ledger should keep saying so — this is a rule we
  // chose, not a surveyed fact. It is just a rule informed by the street it is
  // standing on instead of by nothing.
  const mix = ERA_MIX;
  const pickN = h % 100;
  if (mix) {
    if (pickN < mix[0]) return { pool: STONE, rough: 0.9, metal: 0, src: 'era-mix' };
    if (pickN < mix[1]) return { pool: PUNCHED, rough: 0.88, metal: 0, src: 'era-mix' };
    if (pickN < mix[2]) return { pool: BALCONY, rough: 0.8, metal: 0, src: 'era-mix' };
    return { pool: CURTAINS, rough: 0.36, metal: 0.08, src: 'era-mix' };
  }
  if (pickN < 34) return { pool: PUNCHED, rough: 0.86, metal: 0.0, src: 'hash' };
  if (pickN < 52) return { pool: BALCONY, rough: 0.8, metal: 0.0, src: 'hash' };
  if (pickN < 74) return { pool: STONE, rough: 0.88, metal: 0.0, src: 'hash' };
  return { pool: CURTAINS, rough: 0.36, metal: 0.06, src: 'hash' };
}

// Cumulative percentage thresholds [pre-1945, ..1978, ..1995] for the district
// being built, or null when too few of its buildings carry a date to say
// anything. Set once per scene by buildBuildings.
let ERA_MIX = null;
export function setEraMix(buildings) {
  const yrs = (buildings || []).map((b) => b.yr).filter((y) => y);
  if (yrs.length < 25) {
    // NO DATES AT ALL IS ITSELF INFORMATION-FREE, BUT THE FOOTPRINTS ARE NOT.
    // Little India carries a date on eleven of 2,088 buildings and Robertson
    // Quay on none, so the two districts that most needed a prior were the two
    // that fell through to the global constant. What they DO have is shape: 90%
    // of Little India's footprints are shophouse-sized (under 520 m2 and 20m),
    // against 45% in Marina Bay. A quarter of small low buildings is a
    // conservation quarter whatever OSM forgot to date, so let the plan say
    // what the dates cannot. Interpolated rather than switched, so a district
    // in between gets a mix in between.
    const B2 = buildings || [];
    if (B2.length < 60) { ERA_MIX = null; return null; }
    let small = 0;
    for (const b of B2) if (!b.k && (b.a || 0) < 520 && (b.h || 99) <= 20) small++;
    const q = Math.max(0, Math.min(1, (small / B2.length - 0.45) / 0.45));  // 45%..90%
    const pre = Math.round(10 + q * 45);          // 10% pre-war .. 55%
    const mid = Math.round(10 + q * 4);
    const bal = Math.round(20 + q * 5);
    ERA_MIX = [pre, Math.min(94, pre + mid), Math.min(97, pre + mid + bal)];
    return ERA_MIX;
  }
  let a = 0, b2 = 0, c = 0, d = 0;
  for (const y of yrs) {
    if (y <= 1945) a++; else if (y <= 1978) b2++; else if (y <= 1995) c++; else d++;
  }
  const n = yrs.length;
  // Nothing is allowed to reach zero: a district with no dated tower should
  // still put the occasional curtain wall on a big undated block, because the
  // sample is what OSM happened to date, not a census.
  const f = (v) => Math.max(6, Math.round((v / n) * 100));
  const p1 = f(a), p2 = f(b2), p3 = f(c);
  ERA_MIX = [p1, Math.min(94, p1 + p2), Math.min(97, p1 + p2 + p3)];
  return ERA_MIX;
}

// The conserved shophouse roof tile. It lives HERE and not only in LMAT (the
// landmark palette) because it is now drawn for two thousand ordinary
// footprints, not just for the handful of recipes that name it -- and a
// material referenced as MAT.clayTile when it only exists as LMAT.clayTile is
// `undefined`, which the merger accepts in silence and then draws nothing.
// That is exactly what happened on the first attempt: 633 qualifying buildings
// in Bugis alone and not one visible tile.
export const MAT = {
  clayTile: new THREE.MeshStandardMaterial({ color: 0x9c5a44, roughness: 0.82 }),
  asphalt: new THREE.MeshStandardMaterial({ map: TEX.asphalt, roughness: 0.95 }),
  // Orchard's granite is 1.8m per tile, so the pavement maps at a real size
  paving: new THREE.MeshStandardMaterial({ map: TEX.paving, roughness: 0.88 }),
  kerb: new THREE.MeshStandardMaterial({ color: PAL.kerb, roughness: 0.86 }),
  conc: new THREE.MeshStandardMaterial({ map: texConcrete(PAL.conc, 0.7), roughness: 0.92 }),
  trim: new THREE.MeshStandardMaterial({ color: PAL.trim, roughness: 0.8 }),
  white: new THREE.MeshStandardMaterial({ color: 0xdedad0, roughness: 0.85 }),
  yellow: new THREE.MeshStandardMaterial({ color: PAL.yellow, roughness: 0.85 }),
  tactile: new THREE.MeshStandardMaterial({ map: texTactile(), roughness: 0.72 }),
  // the red bus lane, tinted asphalt rather than paint: it is a coloured
  // surface course, so it keeps the tarmac texture and changes hue
  // Red asphalt DRAWN red (see texAsphalt): tinting the grey map topped out
  // at maroon-brown however bright the tint. Vetted against the eye-level
  // shots, not the swatch: LTA's full-day bus lane red, weathered.
  busLane: Object.assign(new THREE.MeshStandardMaterial({ map: texAsphalt(0x9e3d2c), roughness: 0.93 }), { name: 'busLane' }),
  // The broken white centre line, LTA SDRE Ch.8 Type E: 150mm wide, 2.75m
  // mark, 2.75m gap (RMS2, corroborated by RMS12's "2.75m/2.75m/5.5m" labels).
  // NOT the 100mm 2m/4m pattern — that is Type B, the lane line between
  // same-direction lanes, and the two differ in every dimension. The dash
  // lives in the TEXTURE (see texCentreDash for why), so a whole street is
  // one ribbon: v runs in units of the ribbon's 0.15m width, and repeat.y
  // turns that into one 5.5m cycle. Alpha-tested opaque, not transparent, and
  // the mip-averaged alpha (~1/2) sits near the test at distance, so the line
  // softens far away instead of shimmering.
  centreLine: (() => {
    const t = texCentreDash(2.75, 2.75);
    t.repeat.set(1, 0.15 / 5.5);
    return Object.assign(new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, alphaTest: 0.45 }), { name: 'centreLine' });
  })(),
  // Marina Reservoir is fresh water held behind a barrage, not open sea: it
  // reads green-grey and fairly still, not blue. Low roughness so it picks up
  // the environment map the sky already provides, which is what makes it read
  // as water rather than as painted concrete.
  water: new THREE.MeshStandardMaterial({
    map: texWater(), color: 0x8fa9a8, roughness: 0.16, metalness: 0.34,
  }),
  // the two surfaces OSM names that are neither asphalt nor our pavement slab
  unitPave: new THREE.MeshStandardMaterial({ map: texPaverBlock(), color: 0x9a9184, roughness: 0.92 }),
  roadConc: new THREE.MeshStandardMaterial({ map: texConcrete(0x9d9a94, 0.6), roughness: 0.93 }),
  // LTA SDRE Ch.11 BUS5 publishes the bus-stop colour scheme outright, so
  // these are surveyed values rather than chosen ones. RAL 6027 on the back
  // rest is the one a Singaporean recognises without being able to say why.
  busGrey:   new THREE.MeshStandardMaterial({ color: 0x4e5452, roughness: 0.62 }), // RAL 7012
  busRoof:   new THREE.MeshStandardMaterial({ color: 0x8a9597, roughness: 0.55 }), // RAL 7045
  busSoffit: new THREE.MeshStandardMaterial({ color: 0xe7ebda, roughness: 0.8 }),  // RAL 9002
  busBench:  new THREE.MeshStandardMaterial({ color: 0x6b716c, roughness: 0.6 }),  // RAL 7004
  busRest:   new THREE.MeshStandardMaterial({ color: 0x81c0a8, roughness: 0.6 }),  // RAL 6027
  hiVis:     new THREE.MeshStandardMaterial({ color: 0xe4e132, roughness: 0.45 }),
  // LTA street lighting: the pole is BARE HOT-DIP GALVANISED STEEL, not
  // painted -- a dull spangled silver-grey, lighter and less saturated than
  // the darker metal used for signal poles and railings. Published in the
  // Public Street Lighting System Guidelines, so it is a surveyed finish.
  galv:      new THREE.MeshStandardMaterial({ color: 0xa8adb0, roughness: 0.42, metalness: 0.55 }),
  // the retro-reflective pole number label: white numerals on Pantone 187c red
  poleLabel: new THREE.MeshStandardMaterial({ color: 0xa6192e, roughness: 0.5 }),
  // painted kerb: instance-coloured black/white, see main.js
  kerbPaint: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x8b8f93, roughness: 0.5, metalness: 0.4 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x3b3f44, roughness: 0.6, metalness: 0.3 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x53616d, roughness: 0.14, metalness: 0.18 }),
  // A little emissive on the foliage. Leaf cards are double-sided, so from the
  // pavement you are looking at the UNLIT back of half the crown above you, and
  // a Lambert backface with no light on it is black. Real foliage seen from
  // below is translucent, not black; this stands in for that without the cost
  // of a transmission material. Keep it low, or the canopy glows at dusk.
  leaf: new THREE.MeshLambertMaterial({
    map: TEX.leaf, transparent: false, alphaTest: 0.42, side: THREE.DoubleSide,
    emissive: 0x24331a, emissiveIntensity: 0.55,
  }),
  canopy: new THREE.MeshLambertMaterial({ color: 0x3a4f24, emissive: 0x1d2812, emissiveIntensity: 0.4 }),
  trunk: new THREE.MeshStandardMaterial({ color: PAL.trunk, roughness: 0.95 }),
  ao: new THREE.MeshBasicMaterial({
    map: TEX.ao, transparent: true, blending: THREE.MultiplyBlending,
    premultipliedAlpha: true, depthWrite: false,
  }),
};

// The default is the quiet register: chalky pastels, which is what most
// conserved shophouse streets in Singapore actually are.
const SHOPHOUSE_COLS = [0xd8cbb4, 0xbfd2c4, 0xd9c39a, 0xc9d3dd, 0xd6b6a8, 0xe0d6bd, 0xb9c9bd];

// BUT KRETA AYER IS NOT QUIET, AND THAT IS A SOURCED FACT ABOUT ONE AREA.
//
// research/conservation-chinatown.md read dated photographs street by street
// and found the saturated repaint is real and is specific: Pagoda Street
// (Nov 2019) turquoise, ochre-mustard, sky blue, mid-teal, each unit
// different; Smith Street (Feb 2025) dusty rose columns on cream; Temple
// Street (Feb 2025) a deep magenta block with white pilasters; Trengganu
// Street saturated reds, yellows and blues at its south end. Its conclusion
// is the important part and is why this is keyed to ONE area rather than
// applied to every shophouse in the world: "saturation is a Kreta Ayer /
// tourist-street phenomenon" — Kreta Ayer Road itself, one block away, is
// white with dark brown shutters.
//
// So every other conservation area keeps the pastels. Painting Little India
// or Kampong Glam in these would be inventing a fact about them from a
// photograph of somewhere else.
const SHOPHOUSE_COLS_BY_AREA = {
  'CHINATOWN (KRETA AYER)': [
    0x3fa9a0, 0xc9922f, 0x7fb3d4, 0x3d8f8a, 0xb8446b, 0xd9a8b4, 0xe4ded0, 0xc0473f,
  ],
  'CHINATOWN HISTORIC DISTRICT CORE AREA - KRETA AYER': [
    0x3fa9a0, 0xc9922f, 0x7fb3d4, 0x3d8f8a, 0xb8446b, 0xd9a8b4, 0xe4ded0, 0xc0473f,
  ],
};
const AWNING_COLS = [0x8c4a3f, 0x2f5f52, 0x8a7433, 0x3f5570, 0x6e4a63, 0x9a5f36];
const shopHouseMats = new Map();
const awningMats = new Map();

// materials the landmark recipes draw on
const LMAT = {
  granite: new THREE.MeshStandardMaterial({ map: texGranite(), roughness: 0.30, metalness: 0.12 }),
  // the tower panel, mapped at its real 3.8m x 3.2m by uvMetres()
  granitePanel: new THREE.MeshStandardMaterial({ map: texGranitePanel(), roughness: 0.28, metalness: 0.10 }),
  towerGlass: new THREE.MeshStandardMaterial({ map: texTowerGlass(), roughness: 0.22, metalness: 0.16 }),
  blueGlass: new THREE.MeshStandardMaterial({
    map: texTowerGlass(), color: 0x9fc4dd, roughness: 0.18, metalness: 0.2,
  }),
  paleStone: new THREE.MeshStandardMaterial({ map: texConcrete(0xc4bdae, 0.35), roughness: 0.78 }),
  warmStone: new THREE.MeshStandardMaterial({ map: texConcrete(0xb2a48f, 0.5), roughness: 0.85 }),
  // The real-world size of ONE TILE of each texture, in metres, read by
  // autoUV: texGranite is 9 bays (2.9m bays), texTowerGlass 12 floors (3.2m
  // floor-to-floor), the concretes are streak noise that reads at ~12m, and
  // the panel's 3.8 x 3.2 is Ngee Ann's published module.
  jadeRoof: new THREE.MeshStandardMaterial({ color: 0x2f5f4a, roughness: 0.45, metalness: 0.2 }),
  clayTile: new THREE.MeshStandardMaterial({ color: 0x9c5a44, roughness: 0.82 }),
  // a roof at its surveyed colour, cached so a terrace of them is one material
  roofTint(css) {
    this._rt = this._rt || new Map();
    if (!this._rt.has(css)) {
      const m = new THREE.MeshStandardMaterial({ color: 0x9c5a44, roughness: 0.82 });
      try { m.color = new THREE.Color(css); } catch (e) { /* a bad tag is not a crash */ }
      this._rt.set(css, m);
    }
    return this._rt.get(css);
  },
  awning(b) {
    let h = 0;
    for (const [x, z] of b.p) h = (h * 29 + ((x * 9) | 0) + ((z * 7) | 0)) | 0;
    const col = AWNING_COLS[Math.abs(h) % AWNING_COLS.length];
    if (!awningMats.has(col)) {
      awningMats.set(col, new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }));
    }
    return awningMats.get(col);
  },
  // one shared material per shophouse colour, keyed off the footprint so a
  // given house keeps its colour between reloads
  shophouse(b) {
    let h = 0;
    for (const [x, z] of b.p) h = (h * 31 + ((x * 5) | 0) + ((z * 11) | 0)) | 0;
    const pool = (b.cons && SHOPHOUSE_COLS_BY_AREA[b.cons]) || SHOPHOUSE_COLS;
    const col = pool[Math.abs(h) % pool.length];
    if (!shopHouseMats.has(col)) {
      shopHouseMats.set(col, new THREE.MeshStandardMaterial({
        map: texShophouse(col), roughness: 0.88,
      }));
    }
    return shopHouseMats.get(col);
  },
};
// The Centrepoint (recipe): dark tinted curtain wall in a strong mullion
// grid, and the red feature panel drawn as one tile (mapped per-slab by the
// recipe, so no default tile here).
LMAT.darkCurtain = new THREE.MeshStandardMaterial({ map: texCurtain(0x39424c, 0x262b30), roughness: 0.30, metalness: 0.18 });
LMAT.centrePanel = new THREE.MeshStandardMaterial({ map: texCentrepointPanel(), roughness: 0.55 });
LMAT.darkCurtain.userData.tile = [26, 28];
// Liat Towers' 2016 Hermes shell: ALUCOBOND "Beige" + "Sparkling Ivory",
// which reads as off-white ivory with a faint metallic sheen -- published by
// the panel maker, so it is a surveyed colour, not a chosen one.
LMAT.ivory = new THREE.MeshStandardMaterial({ map: texConcrete(0xe8e2d6, 0.18), roughness: 0.42, metalness: 0.10 });
// FESC (research/far-east-shopping-centre.md): the whole 1974 complex is
// painted white; the corner blade carries gold characters. SOTA/Concorde
// share the white; the gold is FESC's alone.
LMAT.paintedWhite = new THREE.MeshStandardMaterial({ map: texConcrete(0xe9e6df, 0.14), roughness: 0.62 });
LMAT.chevronGlass = new THREE.MeshStandardMaterial({ map: texChevron(), roughness: 0.24, metalness: 0.2 });
LMAT.chevronGlass.userData.tile = [8, 8];
LMAT.mediaWall = new THREE.MeshStandardMaterial({ color: 0x1c2430, emissive: 0x7fa8ff, emissiveIntensity: 0.85, roughness: 0.35 });
LMAT.brightGlass = new THREE.MeshStandardMaterial({ color: 0xdfe9ee, emissive: 0xcfd8b8, emissiveIntensity: 0.28, roughness: 0.12, metalness: 0.1 });
// Shaw House's drum and podium: warm light-grey granite (#d8d5cf per the
// dated photos) — texGranite is Ngee Ann's African Red and read maroon here
LMAT.shawGranite = new THREE.MeshStandardMaterial({ map: texConcrete(0xd6d3cb, 0.22), roughness: 0.48, metalness: 0.08 });
LMAT.sotaRibbons = new THREE.MeshStandardMaterial({ map: texSotaRibbons(), roughness: 0.8 });
LMAT.sotaRibbons.userData.tile = [10, 32];
// SOTA's leaning piers: rough warm-brown board-marked concrete
LMAT.darkTimber = new THREE.MeshStandardMaterial({ color: 0x3f3128, roughness: 0.8 });
LMAT.shutterGreen = new THREE.MeshStandardMaterial({ color: 0x39544a, roughness: 0.75 });
LMAT.boardConc = new THREE.MeshStandardMaterial({ map: texConcrete(0x8e7a71, 0.5), roughness: 0.9 });
// batch 2 (research/voco.md, forum.md, palais.md, orchard-rendezvous.md)
LMAT.bronzeRelief = new THREE.MeshStandardMaterial({ map: texConcrete(0xa97f3c, 0.55), roughness: 0.5, metalness: 0.45 });
LMAT.navyGlass = new THREE.MeshStandardMaterial({ map: texCurtain(0x24404a, 0x121c22), roughness: 0.16, metalness: 0.3 });
LMAT.navyGlass.userData.tile = [22, 24];
LMAT.peachStucco = new THREE.MeshStandardMaterial({ map: texConcrete(0xe6c0a2, 0.24), roughness: 0.8 });
LMAT.palaisWaffle = new THREE.MeshStandardMaterial({ map: texPunched(0xd8c2a8), roughness: 0.7 });
LMAT.palaisWaffle.userData.tile = [12, 12];
LMAT.goldSign = new THREE.MeshStandardMaterial({ color: 0xc9a23f, emissive: 0x8a6a1c, emissiveIntensity: 0.55, roughness: 0.35, metalness: 0.6 });
LMAT.bronze = new THREE.MeshStandardMaterial({ color: 0x6e5433, roughness: 0.45, metalness: 0.55 });
LMAT.ivory.userData.tile = [9, 9];
// THE 2010s BOUTIQUE APARTMENT WALL. texBalcony is the residential facade this
// project already draws for apartment fabric -- recessed balconies with a rail,
// nine rows to a tile. The boutiqueApartment recipe was first written with a
// PLAIN wall and it showed: side by side against the generic family the recipe
// had the right form and no windows at all, which is a regression however
// correct the massing is. Tiled at 5 bays x 9 floors over 17m x 30m, so a bay
// lands near 3.4m and a floor near 3.3m -- the storey height these blocks are
// actually built to.
// ONE TYPE, SEVERAL DEVELOPMENTS. Rendered as a single material, River Valley
// Road came out as one continuous banded facade down both sides -- correct
// about the TYPE (the research is explicit that these are all 2010s seven-
// storey freehold blocks built to the same URA height control) and wrong about
// the street, which is a run of separate developments each with its own render
// colour. Four warm neutrals, picked per building by a stable hash of its
// footprint, so a rebuild deals the same street twice.
// FIRST ATTEMPT WAS TOO TIMID AND MADE IT WORSE. Four near-identical warm
// neutrals with pale rails to match read as LESS varied than one colour with a
// strong rail did: the balcony banding is what gives these blocks their
// character at riding speed, and tinting the rail toward the wall erased it.
// Wider spread on the wall, and the rail stays firmly blue-grey against all of
// them.
const RV_WALLS = [0xdcd5c6, 0xc4c9c9, 0xe4dccb, 0xb9b3a6];
LMAT.rvRender = RV_WALLS.map((c) => {
  const m = new THREE.MeshStandardMaterial({ map: texBalcony(c), roughness: 0.74 });
  m.userData.tile = [17, 30];
  return m;
});
// The balustrade picks up the wall: a cooler glass on the paler renders, a
// warmer one on the deeper, which is what these blocks actually do.
LMAT.rvRail = [0x6f8ca6, 0x7d97ad, 0x67839c, 0x8299ae].map((c) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: 0.16, metalness: 0.22 }));
// MacDonald House: one tile is one 3.9m structural bay by a 3.5m floor
LMAT.redBrick = new THREE.MeshStandardMaterial({ map: texRedBrick(), roughness: 0.88 });
LMAT.redBrick.userData.tile = [3.9, 3.5];
// Peranakan Place: one tile is ONE BAY -- ~4.5m wide by the ~4.6m upper
// storey, from the OSM-derived 24.8m frontage over 6 units.
LMAT.peranakan = new THREE.MeshStandardMaterial({ map: texPeranakan(false), roughness: 0.86 });
LMAT.peranakanWhite = new THREE.MeshStandardMaterial({ map: texPeranakan(true), roughness: 0.86 });
LMAT.peranakan.userData.tile = [4.5, 4.6];
LMAT.peranakanWhite.userData.tile = [4.5, 4.6];
LMAT.granite.userData.tile = [26, 26];
LMAT.granitePanel.userData.tile = [3.8, 3.2];
LMAT.towerGlass.userData.tile = [26, 38.4];
LMAT.blueGlass.userData.tile = [26, 38.4];
LMAT.paleStone.userData.tile = [12, 12];
LMAT.warmStone.userData.tile = [12, 12];

const up = new THREE.Vector3(0, 1, 0);

// Set by main once the district's heightfield is loaded. Everything that used
// to assume ground at zero asks this instead.
let TERRAIN = { at: () => 0 };
export function setTerrain(t) { TERRAIN = t; }

// Is this point inside a carriageway? Structural pieces are placed by offsets
// from a facade, and an offset sideways along the frontage can put a column in
// the middle of the street even when the outward projection was checked.
export function onCarriageway(x, z, margin = -0.6) {
  return window.__onRoad ? window.__onRoad(x, z, margin) : false;
}
export function groundAt(x, z) { return TERRAIN.at(x, z); }

// The height of the surface you stand ON, which is not the terrain height. The
// carriageway is drawn at terrain + 0.055 plus up to 5mm of per-road offset, and
// footways at terrain + 0.02. Anything placed at the raw terrain height is under
// the road: the bike, the traffic and the crowd all were.
const SURFACE_ROAD = 0.061;      // clears the highest per-road offset
const SURFACE_PATH = 0.024;

// A BRIDGE DECK IS A SURFACE YOU STAND ON.
//
// Bridge ways are already DRAWN flat, at the highest ground they touch plus
// 1.2m, because a deck does not follow the ground — that is what makes it a
// bridge. But surfaceAt() only ever asked the terrain, so the rider, the
// traffic and the crowd all stayed on the seabed while the deck ran overhead:
// ride out along Esplanade Drive and you drop off the bridge onto bare ground
// with the deck ramping away above you. Same two-numbers trap as the bike
// riding 5.5cm under the road, one storey up.
//
// Indexed rather than scanned: surfaceAt is called for every crowd part every
// frame, so a linear pass over every bridge segment in the region is not
// affordable. Cells are 40m, which is larger than any single segment's reach.
const BR_CELL = 40;
const BRIDGES = { cells: new Map(), segs: [] };
export function clearBridges() { BRIDGES.cells.clear(); BRIDGES.segs.length = 0; }
export function addBridgeWay(pts, width) {
  if (!pts || pts.length < 2) return;
  let deck = 0;
  for (const q of pts) deck = Math.max(deck, TERRAIN.at(q[0], q[1]));
  deck += 1.2;                        // the deck sits above its abutment
  const half = width / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const idx = BRIDGES.segs.length;
    BRIDGES.segs.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], half, deck]);
    const mnx = Math.min(pts[i][0], pts[i + 1][0]) - half;
    const mxx = Math.max(pts[i][0], pts[i + 1][0]) + half;
    const mnz = Math.min(pts[i][1], pts[i + 1][1]) - half;
    const mxz = Math.max(pts[i][1], pts[i + 1][1]) + half;
    for (let cx = Math.floor(mnx / BR_CELL); cx <= Math.floor(mxx / BR_CELL); cx++) {
      for (let cz = Math.floor(mnz / BR_CELL); cz <= Math.floor(mxz / BR_CELL); cz++) {
        const k = cx + ',' + cz;
        let l = BRIDGES.cells.get(k);
        if (!l) { l = []; BRIDGES.cells.set(k, l); }
        l.push(idx);
      }
    }
  }
}
// The deck height under a point, or null if there is no bridge over it. The
// widest deck wins where two overlap, which is the ramp rather than the slip
// road and is the one you are actually riding on.
export function bridgeDeckAt(x, z) {
  const l = BRIDGES.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  let best = null, bestHalf = -1;
  for (const i of l) {
    const s = BRIDGES.segs[i];
    const vx = s[2] - s[0], vz = s[3] - s[1];
    const l2 = vx * vx + vz * vz || 1;
    let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
    if (dx * dx + dz * dz <= (s[4] + 0.4) * (s[4] + 0.4) && s[4] > bestHalf) {
      bestHalf = s[4]; best = s[5];
    }
  }
  return best;
}

// Can something STAND here? Open water says no — unless there is a bridge
// deck over it, because a median kerb or a lamp on a causeway is standing on
// the causeway. street.js and markings.js already filtered their furniture by
// inWater alone, which was right until decks existed and is now too blunt;
// sgdetail.js filtered by nothing at all, which is why marinabay's median
// kerbs were standing in the bay 21 and 87 metres from shore.
export function standable(x, z) {
  if (!window.__inWater || !window.__inWater(x, z)) return true;
  return bridgeDeckAt(x, z) !== null;
}

export function surfaceAt(x, z) {
  const deck = bridgeDeckAt(x, z);
  if (deck !== null) return deck + SURFACE_ROAD;
  const g = TERRAIN.at(x, z);
  if (window.__onRoad && window.__onRoad(x, z, 0.4)) return g + SURFACE_ROAD;
  return g + SURFACE_PATH;
}

// Every building used to get its own cloned texture, which meant its own
// material, which meant its own draw call. Instead: share a small set of
// materials, bake the tiling into each geometry's UVs, and concatenate all the
// geometries that share a material into one mesh. ~600 draws becomes ~15.
// Merging EVERYTHING into a handful of meshes backfires: one mesh spanning the
// whole map is never frustum-culled, so all million triangles draw every frame
// no matter where you look. Merge per material AND per spatial tile instead, so
// each merged mesh stays local and cullable.
const TILE = 110;
// Geometry dropped for containing NaN/Infinity. Reported by the audit rather
// than swallowed: silently discarding a building is how this class of bug hid.
export let BAD_GEO = 0;
export function badGeoCount() { return BAD_GEO; }
export class Merger {
  constructor() { this.groups = new Map(); this.mats = new Map(); }
  add(geo, mat, x = 0, z = 0) {
    const key = `${Math.floor(x / TILE)},${Math.floor(z / TILE)}|${this.matKey(mat)}`;
    if (!this.groups.has(key)) { this.groups.set(key, []); this.mats.set(key, mat); }
    this.groups.get(key).push(geo.index ? geo.toNonIndexed() : geo);
  }
  matKey(mat) {
    if (!this._ids) { this._ids = new Map(); this._next = 0; }
    if (!this._ids.has(mat)) this._ids.set(mat, this._next++);
    return this._ids.get(mat);
  }
  // `cast` is opt-out because most merged geometry is building fabric and has
  // to cast. Shopfronts are the exception: 4,000 bays on walls that already
  // cast their own shadow, so putting them in the map buys nothing and costs a
  // second pass over the most numerous geometry in the district.
  flush(world, opts = {}) {
    const cast = opts.cast !== false;
    let meshes = 0;
    for (const [key, _list] of this.groups) {
      let list = _list;
      const mat = this.mats.get(key);
      // DROP NON-FINITE GEOMETRY, KEEP ITS NEIGHBOURS.
      //
      // A single NaN coordinate anywhere in a bucket makes the merged bounding
      // sphere NaN, and a NaN bounding sphere is frustum-culled every frame. So
      // one malformed piece did not fail loudly, or even fail alone -- it
      // silently deleted EVERY mesh sharing its ~110m tile and its material.
      // Mustafa Centre lost a 22.8m mass this way while a dome and a parapet on
      // other materials went on drawing above thin air, and it read for hours
      // like a mass that had never been built.
      //
      // Computing the bounding box instead does not save it: a NaN position
      // makes the box NaN too. The only fix that holds is to not let the bad
      // geometry into the buffer. This runs once per geometry at build time,
      // never per frame.
      const good = [];
      for (const g of list) {
        const a = g.attributes.position.array;
        let ok = true;
        for (let i = 0; i < a.length; i++) {
          if (!Number.isFinite(a[i])) { ok = false; break; }
        }
        if (ok) good.push(g);
        else { BAD_GEO++; g.dispose(); }
      }
      if (!good.length) continue;
      list = good;
      let n = 0;
      for (const g of list) n += g.attributes.position.count;
      const pos = new Float32Array(n * 3);
      const nor = new Float32Array(n * 3);
      const uv = new Float32Array(n * 2);
      let o3 = 0, o2 = 0;
      for (const g of list) {
        // COPY BY THE POSITION COUNT, NOT BY THE SOURCE ARRAY'S LENGTH.
        //
        // These three lines assumed every geometry in a bucket carries a normal
        // and a uv sized exactly to its position count. One that does not made
        // `set()` write past the end of the destination, which throws, which
        // aborts this whole loop -- so a single malformed geometry silently
        // deleted EVERY mesh in its tile-and-material bucket AND every bucket
        // after it. It cost an afternoon on Mustafa Centre: a 22.8m mass with
        // correct bounds, correctly merged, that simply never appeared, while a
        // dome and a parapet on other materials drew fine above thin air.
        //
        // Nothing here should be able to lose a building. A short or missing
        // attribute now costs that attribute on that geometry and nothing else.
        const pc = g.attributes.position.count;
        pos.set(g.attributes.position.array.subarray(0, pc * 3), o3);
        const gn = g.attributes.normal, gu = g.attributes.uv;
        if (gn && gn.array.length >= pc * 3) nor.set(gn.array.subarray(0, pc * 3), o3);
        if (gu && gu.array.length >= pc * 2) uv.set(gu.array.subarray(0, pc * 2), o2);
        o3 += pc * 3;
        o2 += pc * 2;
        g.dispose();
      }
      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      // A NaN anywhere in `pos` makes this NaN, and a NaN bounding sphere is
      // frustum-culled every frame -- the same invisible-but-present failure,
      // reached by a different road. Fall back to the box, which survives it.
      if (!merged.boundingSphere || !Number.isFinite(merged.boundingSphere.radius)) {
        merged.computeBoundingBox();
        merged.boundingSphere = new THREE.Sphere();
        if (merged.boundingBox) merged.boundingBox.getBoundingSphere(merged.boundingSphere);
      }
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = cast; mesh.receiveShadow = true;
      world.add(mesh);
      meshes++;
    }
    this.groups.clear(); this.mats.clear();
    return meshes;
  }
}

// How far can something project outward from (x,z) along (nx,nz) before it
// enters a carriageway? Plazas, porte-cocheres and entrance canopies were being
// placed a fixed distance out, which put 36 of them in the road — including Ngee
// Ann City's civic plaza 8.5m into Orchard Road.
class Clearance {
  constructor(roads, axis) {
    this.CELL = 44;
    this.grid = new Map();
    const add = (a, b, clear) => {
      const minx = Math.min(a[0], b[0]) - clear, maxx = Math.max(a[0], b[0]) + clear;
      const minz = Math.min(a[1], b[1]) - clear, maxz = Math.max(a[1], b[1]) + clear;
      for (let cx = Math.floor(minx / this.CELL); cx <= Math.floor(maxx / this.CELL); cx++)
        for (let cz = Math.floor(minz / this.CELL); cz <= Math.floor(maxz / this.CELL); cz++) {
          const k = cx + ',' + cz;
          if (!this.grid.has(k)) this.grid.set(k, []);
          this.grid.get(k).push([a, b, clear]);
        }
    };
    for (const r of roads || []) {
      if (r.k === 'footway' || r.k === 'pedestrian' || r.k === 'service') continue;
      for (let i = 0; i < r.p.length - 1; i++) add(r.p[i], r.p[i + 1], r.w / 2 + 0.7);
    }
    if (axis) for (let i = 0; i < axis.p.length - 1; i++) add(axis.p[i], axis.p[i + 1], axis.w / 2 + 0.7);
  }

  inRoad(x, z) {
    const list = this.grid.get(Math.floor(x / this.CELL) + ',' + Math.floor(z / this.CELL));
    if (!list) return false;
    for (const [a, b, clear] of list) {
      const vx = b[0] - a[0], vz = b[1] - a[1];
      const L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
      t = Math.max(0, Math.min(1, t));
      const dx = x - (a[0] + vx * t), dz = z - (a[1] + vz * t);
      if (dx * dx + dz * dz < clear * clear) return true;
    }
    return false;
  }

  // largest safe projection up to `want`, stepping outward
  outward(x, z, nx, nz, want, halfWidth = 0) {
    for (let d = want; d > 0.4; d -= 0.5) {
      if (this.rectClear(x, z, nx, nz, halfWidth * 2, d)) return d;
    }
    return 0;
  }

  // Is the whole rectangle clear, not just its centreline? A 62m-wide plaza can
  // have a clear centre and still cross a side road at its corners, which is
  // exactly how Ngee Ann City's forecourt ended up 8.5m into Orchard Road.
  rectClear(x, z, nx, nz, width, depth) {
    const tx = -nz, tz = nx;
    const hw = width / 2;
    const across = Math.max(3, Math.ceil(width / 6));
    const along = Math.max(2, Math.ceil(depth / 4));
    for (let i = 0; i <= across; i++) {
      const w = -hw + (i / across) * width;
      for (let j = 0; j <= along; j++) {
        const d = (j / along) * depth;
        if (this.inRoad(x + nx * d + tx * w, z + nz * d + tz * w)) return false;
      }
    }
    return true;
  }
}

// scale a geometry's UVs in place, so one shared material can tile correctly
// across buildings of very different sizes
function scaleUV(geo, sx, sy) {
  const uv = geo.attributes.uv;
  if (!uv) return geo;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy);
  }
  uv.needsUpdate = true;
  return geo;
}

// one shared material per facade texture, built lazily
const sharedMats = new Map();
// A facade family texture tinted to a surveyed colour. Cached per
// texture+colour so a street of the same colour is still one material.
const tintedMats = new Map();
function tintedMat(tex, rough, metal, css) {
  const key = tex.uuid + '|' + css;
  if (!tintedMats.has(key)) {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: rough, metalness: metal });
    try { m.color = new THREE.Color(css); } catch (e) { /* an unparseable tag is not a crash */ }
    tintedMats.set(key, m);
  }
  return tintedMats.get(key);
}

function sharedMat(tex, rough, metal) {
  if (!sharedMats.has(tex)) {
    sharedMats.set(tex, new THREE.MeshStandardMaterial({
      map: tex, roughness: rough, metalness: metal,
    }));
  }
  return sharedMats.get(tex);
}

// The ground a footprint actually sits on.
//
// Both extrusions used to seat a building at the terrain height under its
// CENTROID and sink it 0.9m, which is fine on the flat and wrong on a hill.
// Orchard and Bras Basah are not flat: 230 footprints span more than three
// metres of ground, and Plaza Singapura spans fourteen. Seated on the middle,
// its downhill end floated about seven metres in the air.
//
// Seat on the LOWEST ground under the footprint instead. Nothing can then
// float; the uphill end is buried deeper, which is what a building cut into a
// slope actually looks like and is invisible from outside.
// A LOW STREET-FACING BUILDING FOOTS AT ITS STREET EDGE. footingY takes the
// lowest ground under the whole footprint, which is right for a tower on a
// slope (bury the uphill side) and WRONG for a shophouse terrace that backs
// onto falling ground: the rear's low point dragged the whole row down and
// the street saw a 3m blank plinth where the five-foot way should meet the
// pavement (Emerald Hill, sweep-2 #14 — segmentation could not fix it
// because the fall is BEHIND the row, not along it). For those, foot at the
// ground of the vertex nearest a carriageway and sink only 0.3: the rear
// sinks into its own hill, which nobody can see and terraces genuinely do.
export function streetFootingY(pts) {
  if (!window.__nearestStreet || !window.__onRoad) return footingY(pts);
  let best = null, bd = Infinity;
  for (const [x, z] of pts) {
    // distance to the nearest carriageway, probed coarsely by expanding rings
    for (let m = 2; m <= 14; m += 3) {
      if (window.__onRoad(x, z, m)) {
        if (m < bd) { bd = m; best = [x, z]; }
        break;
      }
    }
  }
  if (!best) return footingY(pts);
  return TERRAIN.at(best[0], best[1]) - 0.3;
}

export function footingY(pts) {
  let lo = Infinity;
  for (const [x, z] of pts) {
    const g = TERRAIN.at(x, z);
    if (g < lo) lo = g;
  }
  // and sample the middle too, in case a long edge dips between its ends
  const c = centroid(pts);
  lo = Math.min(lo, TERRAIN.at(c[0], c[1]));
  // WALK THE PERIMETER, not just its corners. A vertex sample says nothing
  // about the ground twenty metres along an edge, and D7 -- which walks the
  // real perimeter -- found Six Battery Road with 1.6m of daylight under it
  // after the terrain filter changed the ground around the CBD. Sampled every
  // 6m, which is finer than the 35m heightfield cell, so nothing can dip
  // between two samples that the grid itself could represent.
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 6) continue;
    const n = Math.min(24, Math.floor(L / 6));
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const g = TERRAIN.at(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
      if (g < lo) lo = g;
    }
  }
  // 0.9, the same sink as before, so a footprint on FLAT ground is seated exactly
  // where it always was and only sloped ones move. Changing both at once made
  // every building in the district 40cm higher for no reason and muddied what
  // the slope fix was actually responsible for.
  return lo - 0.9;
}

// ONE DATUM PER BUILDING. A building is seated once, and every piece of it —
// mass, parapet, cornice, shopfront band, awning, rooftop plant — is measured
// from that seat. This used to be re-derived per PIECE from the piece's own
// thickness, so a 30m mass took footingY while its own 0.7m parapet cap took
// streetFootingY, and wherever those two differ the cap left the roof: Old
// Hill Street Police Station's parapet floated 13.2m over its roof as a pale
// slab in the sky, which is what the user saw and asked about. Every trim
// course in landmarks.js funnels through extrudeGeo too, so the same daylight
// opened under every cornice on every sloped site in the world.
//
// The rule that picks the datum is unchanged and still lives on the BUILDING
// (low street-facing rows foot at their street edge, towers bury the uphill
// side), so no mass moves; only the pieces snap back onto their own building.
// A BUILDING ON A SLOPE HAS TWO HONEST DATUMS, and the original bug was not
// that there were two — it was that the choice between them was made by the
// THICKNESS OF THE SLICE being extruded rather than by what the piece is.
//
//   FOOT   the structural seat: the lowest ground under the ring, so the mass
//          fills the fall and no daylight shows downhill. The roof is FOOT+h,
//          so everything that caps or stands on the roof measures from it —
//          parapet, cornice, rooftop plant.
//   STREET where the building meets the pavement it fronts. Everything at
//          ground level measures from THIS — shopfront band, entrance canopy,
//          recessed lobby, doors — because a ground floor is at street level
//          by definition, not at the bottom of the hill behind the building.
//
// Old Hill Street Police Station is the case that separates them: 12.6m of
// relief across one ring, so FOOT is 7.31m and STREET is 20.5m. Seating the
// parapet on STREET put it 13.2m above its own roof (the slab in the sky the
// user asked about); seating the shopfront band on FOOT buried it in the hill
// and cost a tenant its frontage (S8 67/68, caught by the gate).
let FOOT = null;
let STREET = null;

// Both, in one place, so the later passes cannot invent their own. Exported
// because buildShopfronts runs long after these are back to null.
export function seatY(b) {
  return b.h <= 16 ? streetFootingY(b.p) : footingY(b.p);
}
export function streetY(b) {
  return streetFootingY(b.p);
}

// the raw geometry, without wrapping it in a Mesh. Low buildings (a
// shophouse, not a tower) foot at their STREET EDGE — see streetFootingY.
function extrudeGeo(pts, h, y0 = 0) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(pts), {
    depth: h, bevelEnabled: false, curveSegments: 1,
  });
  geo.rotateX(Math.PI / 2);
  const foot = FOOT !== null ? FOOT : (h <= 16 ? streetFootingY(pts) : footingY(pts));
  geo.translate(0, foot + y0 + h, 0);
  return geo;
}

/* ---------------- footprint helpers ---------------- */
function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
    a += x1 * z2 - x2 * z1;
  }
  return a / 2;
}
function shapeFrom(ptsIn) {
  const pts = signedArea(ptsIn) < 0 ? [...ptsIn].reverse() : ptsIn;
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}
function centroid(pts) {
  let x = 0, z = 0;
  for (const p of pts) { x += p[0]; z += p[1]; }
  return [x / pts.length, z / pts.length];
}
function perimeter(pts) {
  let d = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    d += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return d;
}

// Extrude a footprint upward. Extrusion happens in XY then the mesh is laid
// flat, which is the cheapest way to get real building masses from OSM rings.
function extrude(pts, h, mat, y0 = 0) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(pts), {
    depth: h, bevelEnabled: false, curveSegments: 1,
  });
  geo.rotateX(Math.PI / 2);      // +Z extrusion becomes +Y
  geo.translate(0, (FOOT !== null ? FOOT : footingY(pts)) + y0 + h, 0);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ---------------- buildings ---------------- */
// Scale a footprint about its centroid. Shopfront bands, trim courses and
// awnings are all built from a grown ring, and a 5.5% growth on a 60m frontage
// pushes the ring 1.65m past the wall. Where that lands in a carriageway the
// result is a pale band lying across the road, which reads as the road itself
// being drawn wrongly. Any vertex that ends up in a carriageway is pulled back
// along its own outward direction until it is clear.
function grow(pts, f) {
  const c = centroid(pts);
  return pts.map(([x, z]) => {
    const ox = x - c[0], oz = z - c[1];
    let gx = c[0] + ox * f, gz = c[1] + oz * f;
    if (!onCarriageway(gx, gz, 0.2)) return [gx, gz];
    // walk back toward the original vertex, then just inside it if need be
    for (let t = f; t >= 0.92; t -= 0.01) {
      gx = c[0] + ox * t; gz = c[1] + oz * t;
      if (!onCarriageway(gx, gz, 0.2)) return [gx, gz];
    }
    return [x, z];
  });
}

export async function buildBuildings(world, data, Y = null) {
  const stats = { count: 0, tall: 0, bespoke: 0 };
  // the era prior for THIS district, from its own dated buildings
  setEraMix(data.buildings);
  const merger = new Merger();
  const clearance = new Clearance(data.roads, data.axis);
  const api = {
    clearance,
    // Every geometry a recipe hands over gets the material's metre tile
    // applied by autoUV unless the recipe already stated a researched size.
    // See the UV RULE above; recipes were the last path still mapping windows
    // at whatever size the geometry happened to be.
    world, grow, axis: data.axis || null,
    // walkable ways too, for frontages on pedestrianised streets (Emerald
    // Hill since 1981) where the road index has nothing to point at
    walkways: (data.roads || []).filter((r) => r.k === 'pedestrian' || r.k === 'footway'),
    extrude: (pts, h, mat, y0) => autoUV(extrude(pts, h, mat, y0), mat),
    extrudeGeo,
    scaleUV: (geo, sx, sy) => {
      geo.userData.uvTile = [1 / sx, 1 / sy];    // a stated scale is a stated tile
      return scaleUV(geo, sx, sy);
    },
    // The height a footprint is SEATED at. Every extruded mass already uses
    // this internally, but slab() and crown() take an absolute y0, so a recipe
    // that mixes the two puts its tower at sea level while its podium sits on
    // the hill. Lucky Plaza's ground is 26m up and its bubble lift was drawn
    // from y=0, buried with three metres showing.
    //
    // While a building is being built this answers with THAT BUILDING'S seat
    // rather than a fresh sample of whatever ring it is handed. Recipes pass
    // grown and inset rings constantly, and those sample different ground, so
    // the same building could get two different seats — the exact split that
    // left parapets in the sky. One building, one number.
    footingY: (pts) => (FOOT !== null ? FOOT : footingY(pts)),
    merge: (geo, mat, x, z) => merger.add(autoUV(geo, mat), mat, x, z),
    // the ground under a point, so a recipe can seat a dome or a spire on the
    // terrain instead of on y=0. Without it every hand-placed piece floats or
    // sinks the moment its building is on a grade.
    groundAt: (x, z) => TERRAIN.at(x, z),
    mat: { ...LMAT, trim: MAT.trim, conc: MAT.conc, paving: MAT.paving, metal: MAT.metal,
           darkMetal: MAT.darkMetal },
  };
  // VET MODES. `?solo=<text>` builds only the buildings whose name contains
  // that text, and `?norecipe` forces every one of them through the generic
  // facade family. Together they are the only honest way to apply this
  // project's own rule — a bespoke recipe that looks WORSE than the generic
  // must not be wired up — because judging a recipe on its own tells you
  // nothing, and judging it in a full street means fighting to frame it. Three
  // attempts at that produced a camera inside the building, a camera behind the
  // block opposite, and a camera pointed at the wrong mass.
  const VP = new URLSearchParams(location.search);
  const SOLO = (VP.get('solo') || '').toLowerCase();
  const NORECIPE = VP.has('norecipe');

  // YIELD ON ELAPSED TIME, NOT ON A COUNT. Every 16 buildings sounds frequent
  // and is not: a plain shophouse costs a fraction of a millisecond and a
  // landmark recipe builds hundreds of pieces of geometry, so sixteen of the
  // wrong ones in a row is half a second with no frame drawn. Measured with
  // PerformanceObserver, the two worst blocking tasks after the loading screen
  // were 506ms and 424ms, and this loop is where they came from.
  //
  // Checking the clock bounds a stall to the budget whatever lands in it, which
  // is the property a count can never have. 8ms leaves room for the frame
  // itself inside a 16ms slot.
  let _yt = performance.now();
  for (const b of data.buildings) {
    // cooperative yield for the runtime streamer; null during boot
    if (Y && performance.now() - _yt > 8) { await Y(); _yt = performance.now(); }
    const pts = b.p;
    if (pts.length < 3) continue;
    if (SOLO && !((b.n || '').toLowerCase().includes(SOLO))) continue;

    // Seat the building ONCE, here, before anything about it is drawn. The
    // rule is the one the mass already used, so no mass moves; what changes is
    // that every later piece of this building is measured from the same number
    // instead of re-deriving one from its own thickness or its own ring.
    FOOT = seatY(b);
    STREET = streetY(b);

    // A SITE IS NOT A BUILDING. Before anything else decides what to draw:
    // building=construction means there is no building there yet, and drawing
    // one asserts something false about the city. Ahead of the shophouse test
    // and the recipe table because neither of those has any way to know.
    if (b.con && !window.__noSites) {
      constructionSite(api, b);
      stats.count++; stats.sites = (stats.sites || 0) + 1;
      continue;
    }

    // small and low with no name: a shophouse, which is what fills the lanes.
    //
    // "WITH NO NAME" WAS IN THE COMMENT AND NOT IN THE CONDITION. This branch
    // sits above the recipe dispatch, so ANY named building under 520 m2 and
    // 20m tall was silently turned into an anonymous shophouse and could never
    // reach a bespoke recipe at all -- no error, no warning, and a recipe
    // vs generic render that comes back byte-identical because neither ran.
    //
    // Sri Srinivasa Perumal Temple is 218 m2 and 14.4m: its OSM footprint is
    // the GOPURAM BLOCK ALONE, not the compound, so the one building in Little
    // India whose whole identity is a five-tier tower was being drawn as a
    // shophouse. Small does not mean anonymous. Little India and Chinatown are
    // full of small temples and mosques and this would have swallowed every
    // recipe written for any of them.
    const _rec = NORECIPE ? null : recipeFor(b.n);
    if (!_rec && !b.k && b.a < 520 && b.h <= 20 && b.p.length <= 64) {
      shophouse(api, b);
      stats.count++; stats.shophouses = (stats.shophouses || 0) + 1;
      continue;
    }

    // the buildings people navigate by get their real arrangement, not a box
    const recipe = _rec;
    if (recipe) {
      recipe(api, b);
      if (hasShopfront(b.n)) addShopfront(world, b, perimeter(pts), merger, clearance);
      stats.count++; stats.bespoke++;
      continue;
    }
    const fam = familyFor(b);
    // provenance, so the accuracy ledger can say how many facades are a real
    // answer and how many are still a hash
    const fs = (window.__facadeSrc = window.__facadeSrc || {});
    fs[fam.src] = (fs[fam.src] || 0) + 1;
    const wallTex = pick(fam.pool);
    // A SURVEYED COLOUR BEATS A HASHED ONE. `building:colour` is on 29
    // footprints here and was being overridden by a facade family picked from a
    // hash, which is the same mistake `building:material` already fixed once:
    // "a hash was overriding a surveyed fact". Tinting the family's texture
    // keeps the window pattern and takes the real hue.
    const mat = b.col ? tintedMat(wallTex, fam.rough, fam.metal, b.col)
                      : sharedMat(wallTex, fam.rough, fam.metal);
    const per = perimeter(pts);
    const h = b.h;
    // A MASS THAT STARTS IN THE AIR. `min_height` says the building begins
    // above the ground -- a sky bridge, a deck, a canopy spanning between
    // towers. SkyPark is min_height 193 of height 207, so read as a plain
    // height it is a solid 207m block standing exactly where Marina Bay Sands'
    // atrium is. Built from its own base, it is the 14m deck everyone knows.
    if (b.mh && b.mh > 1 && b.mh < h - 0.5) {
      const lift = extrude(pts, h - b.mh, mat, b.mh);
      lift.castShadow = true; lift.receiveShadow = true;
      world.add(lift);
      stats.count++;
      if (h > 40) stats.tall++;
      continue;
    }
    // Landmarks are podium + tower, which is what the Orchard skyline is made of
    //
    // UV RULE, everywhere below: extrudeGeo's side-wall UVs come from vertex
    // POSITIONS, so they are already in METRES. The scale factor is therefore
    // 1/(tile size in metres) -- a constant -- never per/26 or h/28, which
    // multiply metres by metres and tile a window pattern ten times per metre,
    // averaging every facade to flat colour. texCurtain draws 8 floors and
    // texPunched 8 floors x 7 bays per tile, so a 26m x 28m tile is 3.7m
    // windows on 3.5m floors. How big a window is is a fact about buildings,
    // not about whichever geometry carries it. (Same trap as texTowerGlass'
    // 8.9m floors, already fixed for Ngee Ann and Hilton via uvMetres.)
    if (b.k && h > 70) {
      const podium = Math.min(34, h * 0.28);
      const pod = extrude(pts, podium, new THREE.MeshStandardMaterial({
        map: pick(STONE), roughness: 0.8,
      }));
      scaleUV(pod.geometry, 1 / 12, 1 / 12);   // stone streaks read at ~12m
      world.add(pod);
      const c = centroid(pts);
      const inset = pts.map(([x, z]) => [c[0] + (x - c[0]) * 0.62, c[1] + (z - c[1]) * 0.62]);
      const tower = extrude(inset, h - podium, mat, podium);
      scaleUV(tower.geometry, 1 / 26, 1 / 28);
      flattenRoofUV(tower.geometry);           // a roof is not a facade
      world.add(tower);
      stats.tall++;
    } else {
      const cB = centroid(pts);
      merger.add(flattenRoofUV(scaleUV(extrudeGeo(pts, h), 1 / 26, 1 / 28)), mat, cB[0], cB[1]);
      // A CONSERVED SHOPHOUSE HAS A PITCHED CLAY-TILE ROOF, and until now every
      // one of them in this world had a flat concrete parapet like an office
      // block. That is the single most recognisable thing about Chinatown,
      // Little India and Kampong Glam -- URA's own conservation guidelines
      // define all six shophouse styles with a tiled pitched roof, and 2,000+
      // footprints here are inside a gazetted area (research/conservation-
      // littleindia.md section 5 counts 2,118 across four areas alone).
      //
      // Drawn as a squat truncated pyramid: the ring inset and lifted, which
      // from the street reads as tile sloping up behind the facade. It is ONE
      // merged geometry per building in the existing clay-tile material, so it
      // costs no extra draw call -- which matters at this count.
      //
      // Gated on all three of conserved, shophouse-sized and low, so a
      // conserved CHURCH or a conserved warehouse does not get a tiled cap it
      // never had.
      // NOT gated on footprint size, and that is the whole point. The
      // shophouse branch above already draws a pitched tiled roof, but it only
      // accepts footprints under 520 m2 -- and OSM maps a whole TERRACE as a
      // single way, so a run of fifteen units is one 1,800 m2 footprint that
      // falls through to here and gets an office block's flat parapet. Those
      // long terraces are most of what you actually see down a conserved
      // street, which is why the aerial over Kampong Glam was a field of flat
      // white roofs while the individual units behind them were correctly
      // tiled. Conserved and low is the test; how OSM chose to draw the
      // outline is not a fact about the building.
      const shopRoof = b.cons && h <= 20 && h > 4;
      if (shopRoof) {
        const c = centroid(pts);
        // AN EAVE IS A FIXED OVERHANG, NOT A PERCENTAGE, and getting that
        // wrong is the third time tonight a geometric rule has been written
        // without a scale in it (the despike had no length, the crystalMesh
        // road guard had no width). Grown by 5%, a 30m shop projects 0.75m of
        // tile and a 100m terrace projects 2.5m -- straight into Tan Tye
        // Place, which P1b duly blocked.
        //
        // 0.32m of overhang whatever the building's size, converted to the
        // ratio `grow` wants using the footprint's own mean radius. Same for
        // the pitch: a fixed 28% slope inset reads as a roof on a shop and as
        // a mesa on a terrace, so the inset is capped in METRES too.
        let rSum = 0;
        for (const [x, z] of pts) rSum += Math.hypot(x - c[0], z - c[1]);
        const rMean = Math.max(2, rSum / pts.length);
        const kIn = Math.max(0.5, 1 - Math.min(3.2, rMean * 0.28) / rMean);
        const kOut = 1 + 0.32 / rMean;
        const inset = pts.map(([x, z]) => [c[0] + (x - c[0]) * kIn, c[1] + (z - c[1]) * kIn]);
        // eaves first: a thin tiled lip a little proud of the wall, which is
        // what actually catches the eye at street level
        const eave = pts.map(([x, z]) => [c[0] + (x - c[0]) * kOut, c[1] + (z - c[1]) * kOut]);
        merger.add(extrudeGeo(eave, 0.28, h), MAT.clayTile, c[0], c[1]);
        merger.add(extrudeGeo(inset, 1.5, h + 0.28), MAT.clayTile, c[0], c[1]);
      } else if (h > 8) {
        // parapet cap so roofs are not a raw extruded edge
        const c = centroid(pts);
        const out = pts.map(([x, z]) => [c[0] + (x - c[0]) * 1.008, c[1] + (z - c[1]) * 1.008]);
        merger.add(extrudeGeo(out, 0.7, h), MAT.trim, c[0], c[1]);
      }
    }

    addShopfront(world, b, per, merger, clearance);

    // rooftop plant on the bigger flat roofs: plant boxes, a stair housing,
    // water tanks and a run of ducting, so no two roofs read the same.
    //
    // ALL OF IT STOOD AT ABSOLUTE y=h AND HAS THEREFORE NEVER BEEN VISIBLE.
    // A raw BoxGeometry is not seated by anything, and the roof it belongs on
    // is at FOOT+h, so every plant box, stair housing, tank and duct in the
    // world was sunk by the height of its own ground — 7.3m into Old Hill
    // Street, 26 to 50m into Orchard. It has been building an invisible layer
    // inside the buildings since the day it was written. Same two-numbers trap
    // as the bike riding 5.5cm under the road: the height a thing is DRAWN at
    // and the height a thing STANDS on.
    if (b.a > 900 && h > 12) {
      const c = centroid(pts);
      const roof = FOOT + h;
      for (let i = 0; i < 3; i++) {
        const g2 = new THREE.BoxGeometry(rand(3, 7), rand(1.6, 3.4), rand(3, 6));
        g2.translate(c[0] + rand(-8, 8), roof + rand(1, 1.8), c[1] + rand(-8, 8));
        merger.add(g2, MAT.conc, c[0], c[1]);
      }
      // lift and stair housing
      const sh = new THREE.BoxGeometry(rand(4, 7), rand(3.2, 4.6), rand(4, 6));
      sh.translate(c[0] + rand(-6, 6), roof + 2.2, c[1] + rand(-6, 6));
      merger.add(sh, MAT.trim, c[0], c[1]);
      // water tanks
      if (chance(0.6)) {
        for (let i = 0; i < 2; i++) {
          const tk = new THREE.CylinderGeometry(rand(0.9, 1.4), rand(0.9, 1.4), 1.7, 10);
          tk.translate(c[0] + rand(-9, 9), roof + 0.9, c[1] + rand(-9, 9));
          merger.add(tk, MAT.trim, c[0], c[1]);
        }
      }
      // duct run
      if (chance(0.5)) {
        const dz = new THREE.BoxGeometry(rand(9, 16), 0.7, 0.7);
        dz.translate(c[0] + rand(-4, 4), roof + 0.9, c[1] + rand(-7, 7));
        merger.add(dz, MAT.metal, c[0], c[1]);
      }
    }
    stats.count++;
  }
  FOOT = STREET = null;   // nothing outside this loop belongs to a building
  stats.mergedMeshes = merger.flush(world);
  return stats;
}

// Ground floor is what you actually see from a scooter: glazed shopfront band,
// an awning line above it, and a deeper canopy where the entrance would be.
function addShopfront(world, b, per, merger, clearance) {
  if (b.a <= 600 || b.h <= 7) return;
  const pts = b.p;
  // The band and its trim go through extrudeGeo and are seated for us; every
  // hand-placed piece below is a raw Mesh at an absolute y and was NOT. The
  // recessed lobby — the whole point of which is that you can see into it from
  // a scooter — sat at y=2.5 with its ceiling at 4.7, so on Old Hill Street's
  // 8.2m ground it was four metres under the pavement and on Orchard's 26 to
  // 50m it was never within twenty metres of daylight. It has been built,
  // lit and shadow-cast underground on every building in the world.
  const foot = STREET !== null ? STREET : streetFootingY(pts);
  // How far the ground floor sits above the structural seat. extrudeGeo works
  // from FOOT, so the band is lifted by the difference rather than given its
  // own seat — one number, applied where it belongs.
  const dy = foot - (FOOT !== null ? FOOT : footingY(pts));
  const sf = pick(SHOPS);
  const sfMat = sharedMat(sf, 0.32, 0.05);
  if (merger) {
    const cS = centroid(pts);
    // metre UVs (see the UV RULE above): texShopfront is 6 bays per tile, so
    // 1/15 is a 2.5m bay, and 1/5.4 fits exactly one row to the 5.4m band
    // instead of stacking five of them
    merger.add(scaleUV(extrudeGeo(grow(pts, 1.012), 5.4, dy), 1 / 15, 1 / 5.4), sfMat, cS[0], cS[1]);
    merger.add(extrudeGeo(grow(pts, 1.055), 0.42, 5.3 + dy), MAT.trim, cS[0], cS[1]);
  } else {
    const band = extrude(grow(pts, 1.012), 5.4, sfMat, dy);
    scaleUV(band.geometry, 1 / 15, 1 / 5.4);   // same metre rule as the merger branch
    world.add(band);
    world.add(extrude(grow(pts, 1.055), 0.42, MAT.trim, 5.3 + dy));
  }
  // entrance canopy: a deeper projection on the longest edge
  let bi = 0, bl = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], c = pts[(i + 1) % pts.length];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (L > bl) { bl = L; bi = i; }
  }
  if (bl > 16) {
    const a = pts[bi], c = pts[(bi + 1) % pts.length];
    const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2;
    const ang = Math.atan2(c[0] - a[0], c[1] - a[1]);
    const cen = centroid(pts);
    const outX = mx - cen[0], outZ = mz - cen[1];
    const oL = Math.hypot(outX, outZ) || 1;
    const ux = outX / oL, uz = outZ / oL;

    // A lobby you can actually see into. Recess a lit volume behind glass doors
    // so the ground floor stops reading as a printed band.
    // A recessed lobby only makes sense behind the facade. Where the building
    // stands hard against the kerb the recess lands in the carriageway, and a
    // glowing back wall then hangs in the traffic.
    if (b.a > 1200 && !onCarriageway(mx - ux * 5.2, mz - uz * 5.2, 0)
        && !onCarriageway(mx + ux * 0.35, mz + uz * 0.35, 0)) {
      const lw = Math.min(14, bl * 0.3);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(lw, 4.4),
        new THREE.MeshStandardMaterial({
          color: 0x2b2620, roughness: 0.7,
          emissive: 0xd9b477, emissiveIntensity: 0.55,
        }));
      back.position.set(mx - ux * 5.2, foot + 2.5, mz - uz * 5.2);
      back.rotation.y = ang + Math.PI / 2;
      world.add(back);
      // side walls, so it reads as depth rather than a glowing sticker
      for (const sgn of [-1, 1]) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 4.4),
          new THREE.MeshStandardMaterial({ color: 0x3a332b, roughness: 0.8, side: THREE.DoubleSide }));
        side.position.set(mx - ux * 2.5 + Math.sin(ang) * sgn * lw / 2, foot + 2.5,
                          mz - uz * 2.5 + Math.cos(ang) * sgn * lw / 2);
        side.rotation.y = ang;
        world.add(side);
      }
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(lw, 5.6),
        new THREE.MeshStandardMaterial({ color: 0x4a423a, roughness: 0.8, side: THREE.DoubleSide }));
      ceil.rotation.x = Math.PI / 2;
      ceil.rotation.z = -ang;
      ceil.position.set(mx - ux * 2.5, foot + 4.7, mz - uz * 2.5);
      world.add(ceil);
      // glass doors across the opening
      const doors = new THREE.Mesh(new THREE.PlaneGeometry(lw, 4.2),
        new THREE.MeshStandardMaterial({
          color: 0xbcd0da, roughness: 0.08, metalness: 0.2,
          transparent: true, opacity: 0.34, side: THREE.DoubleSide,
        }));
      doors.position.set(mx + ux * 0.35, foot + 2.4, mz + uz * 0.35);
      doors.rotation.y = ang + Math.PI / 2;
      world.add(doors);
    }
    const cw = Math.min(18, bl * 0.34);
    // never project into the carriageway
    const reach = clearance
      ? clearance.outward(mx, mz, ux, uz, 3.6, cw * 0.5)
      : 3.6;
    if (reach > 1.0) {
      // The canopy is as wide as the frontage, and its posts stand at the ends
      // of that width. `clearance.outward` only checked the projection straight
      // out from the middle, so on a skewed frontage a post could end up in the
      // carriageway: 59 six-metre columns were standing in roads, including the
      // row you meet at the spawn point. Every post is now tested where it
      // actually stands, and the canopy narrows until both of its ends are clear.
      let w = cw;
      const postAt = (width, s2) => [
        mx + ux * reach * 0.9 + Math.sin(ang) * s2 * width * 0.42,
        mz + uz * reach * 0.9 + Math.cos(ang) * s2 * width * 0.42,
      ];
      while (w > 4 && [-1, 1].some((s2) => {
        const [px2, pz2] = postAt(w, s2); return onCarriageway(px2, pz2);
      })) w *= 0.75;
      const clear = ![-1, 1].some((s2) => {
        const [px2, pz2] = postAt(w, s2); return onCarriageway(px2, pz2);
      });
      if (clear) {
        // Seated on the building, not on the datum. These were at an absolute
        // 6.1m with their posts at 3.0m, so on ground that is 8m up the canopy
        // was two metres underground and on Orchard it was thirty — the whole
        // entrance-canopy layer was buried everywhere the ground is not at sea
        // level, which is everywhere. Found with the rooftop plant, 2026-07-30.
        const can = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, reach * 1.15), MAT.trim);
        can.position.set(mx + ux * reach * 0.5, foot + 6.1, mz + uz * reach * 0.5);
        can.rotation.y = ang + Math.PI / 2;
        can.castShadow = true; world.add(can);
        for (const s2 of [-1, 1]) {
          const [px2, pz2] = postAt(w, s2);
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8), MAT.metal);
          col.position.set(px2, foot + 3.0, pz2);
          col.castShadow = true; world.add(col);
        }
      }
    }
  }
}

/* ---------------- roads and pavements ---------------- */
// A road is a ribbon: for each segment emit a quad of the tagged width.
// A road is a ribbon along a polyline. Two things used to leave holes in it: at
// a bend the two segments' corners land in different places, and at a junction
// each way stops at the node so nothing covers the middle. Both read as pale
// gaps in the tarmac from the saddle.
//
// Bends are closed by MITRING — each interior vertex uses the bisector of its
// two segments, so the surface is continuous with no overlap. Overlapping it
// instead (the obvious fix, and the one tried first) doubles the geometry at
// every bend and the two coplanar copies then fight for the depth buffer.
//
// Junctions are covered by extending the two ENDS of a way past its node, where
// overlapping a crossing road is unavoidable. Each road carries a deterministic
// sub-centimetre height offset so those overlaps have a stable winner instead of
// shimmering.
// `flat` draws the ribbon at ONE height instead of following the ground.
//
// A bridge deck does not follow the ground -- that is what makes it a bridge.
// Bridge ways were being laid on the terrain, so every causeway across Marina
// Bay was painted on the seabed: 1,900 lane markings drawn under water, which
// is what W2 caught. The height is the HIGHEST ground the way touches, which is
// its own bank, so it comes from surveyed terrain rather than from a number
// somebody chose.
// A ribbon laid parallel to a centreline but offset sideways, for a bus lane
// that runs inside the kerb rather than down the middle.
function ribbonOffset(pts, width, y, off, flat, noExt = false) {
  const moved = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const L = Math.hypot(dx, dz) || 1;
    moved.push([pts[i][0] - (dz / L) * off, pts[i][1] + (dx / L) * off]);
  }
  return ribbon(moved, width, y, flat, noExt);
}

function ribbon(pts, width, y, flat = false, noExt = false) {
  const g = new THREE.BufferGeometry();
  const pos = [], uv = [];
  let deck = 0;
  if (flat) {
    for (const q of pts) deck = Math.max(deck, TERRAIN.at(q[0], q[1]));
    deck += 1.2;                       // the deck sits above its abutment
  }
  const H = (x, z) => (flat ? deck : TERRAIN.at(x, z)) + y;
  const half = width / 2;

  // drop repeated points, then work out each vertex's offset direction
  const raw = [];
  for (const q of pts) {
    if (!raw.length || Math.hypot(q[0] - raw[raw.length - 1][0], q[1] - raw[raw.length - 1][1]) > 0.01) {
      raw.push([q[0], q[1]]);
    }
  }
  if (raw.length < 2) return g;

  // SUBDIVIDE long segments so the tarmac follows the ground.
  //
  // A ribbon takes its height from the terrain at each centreline vertex and is
  // flat in between. OSM road vertices sit up to thirty metres apart and the
  // heightfield is bilinear over 35m cells, so wherever a road crosses a cell
  // with any curvature the ground rose straight through the tarmac: measured at
  // 16.6% of the whole road surface, worst case 4.9 METRES of hillside standing
  // in the middle of a carriageway. It reads as the road simply stopping.
  //
  // Three metres, more than ten times finer than the 35m heightfield, so the
  // ribbon tracks every cell it crosses. Measured: 16.6% of the road surface had
  // ground standing through it before, 0.05% at six metres, 0.01% at three, and
  // the worst case fell from 4.91m to 0.40m. It costs vertices on a layer that
  // is already one draw call and nothing measurable in frame rate.
  //
  // KEEP THIS IN STEP with the check in audit_world.js (P8), which reproduces
  // this subdivision to know where the drawn surface is.
  const STEP = 3;
  const p = [];
  for (let i = 0; i < raw.length - 1; i++) {
    const a = raw[i], c = raw[i + 1];
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const n = Math.max(1, Math.ceil(L / STEP));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      p.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t]);
    }
  }
  p.push(raw[raw.length - 1]);

  const dir = [];
  for (let i = 0; i < p.length - 1; i++) {
    const dx = p[i + 1][0] - p[i][0], dz = p[i + 1][1] - p[i][1];
    const L = Math.hypot(dx, dz) || 1;
    dir.push([dx / L, dz / L]);
  }
  // push the two ends out past the node so junctions are covered — UNLESS
  // the caller cut this piece to an exact arclength (a bus-lane junction
  // gap): extending a cut end fans it across the bend it was cut at, which
  // is the ragged red triangle in sweep-2 frame 090.
  if (!noExt) {
    const EXT = half * 1.1;
    p[0] = [p[0][0] - dir[0][0] * EXT, p[0][1] - dir[0][1] * EXT];
    const dl = dir[dir.length - 1];
    p[p.length - 1] = [p[p.length - 1][0] + dl[0] * EXT, p[p.length - 1][1] + dl[1] * EXT];
  }

  // per-vertex offset: segment normal at the ends, mitred bisector between
  const off = [];
  for (let i = 0; i < p.length; i++) {
    const a = dir[Math.max(0, i - 1)], b = dir[Math.min(dir.length - 1, i)];
    let mx = -(a[1] + b[1]), mz = a[0] + b[0];
    const mL = Math.hypot(mx, mz);
    if (mL < 1e-4) { mx = -b[1]; mz = b[0]; }            // doubled back on itself
    else { mx /= mL; mz /= mL; }
    // the mitre has to reach further than the normal on a bend, but a hairpin
    // must not throw the corner out to infinity
    const cosHalf = Math.max(0.35, Math.abs(mx * -b[1] + mz * b[0]));
    const k = half / cosHalf;
    off.push([mx * k, mz * k]);
  }

  // SUBDIVIDE ACROSS THE WIDTH too. The along-length subdivision above pins
  // the ribbon to the ground every 3m at its EDGES, but one flat quad across
  // an 18m carriageway touches the ground only at the kerbs, and wherever the
  // ground crowns between them the terrain stood up THROUGH the middle of the
  // road -- the other half of the "yellow patches" defect, found by P8 the day
  // it learned to sample off the centreline. Strips of at most 6m track the
  // 35m heightfield to within a couple of centimetres.
  const ACROSS = Math.max(1, Math.ceil(width / 6));
  let run = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [x1, z1] = p[i], [x2, z2] = p[i + 1];
    const o1 = off[i], o2 = off[i + 1];
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.01) continue;
    const u0 = run / width, u1 = (run + len) / width;
    for (let s = 0; s < ACROSS; s++) {
      const f0 = -1 + 2 * s / ACROSS, f1 = -1 + 2 * (s + 1) / ACROSS;
      const a = [x1 + o1[0] * f0, 0, z1 + o1[1] * f0];
      const b = [x1 + o1[0] * f1, 0, z1 + o1[1] * f1];
      const c = [x2 + o2[0] * f1, 0, z2 + o2[1] * f1];
      const d = [x2 + o2[0] * f0, 0, z2 + o2[1] * f0];
      for (const v of [a, b, c, d]) v[1] = H(v[0], v[2]);
      pos.push(...a, ...b, ...c, ...a, ...c, ...d);
      const t0 = (f0 + 1) / 2, t1 = (f1 + 1) / 2;
      uv.push(t0, u0, t1, u0, t1, u1, t0, u0, t1, u1, t0, u1);
    }
    run += len;
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}


// The stretch of a polyline between two arclengths, with the cut ends
// interpolated so a bus lane that stops at a junction stops exactly there
// rather than at the nearest mapped vertex.
function subPoly(pts, from, to) {
  const out = [];
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i + 1][0] - pts[i][0], az = pts[i + 1][1] - pts[i][1];
    const L = Math.hypot(ax, az) || 1;
    const segA = acc, segB = acc + L;
    if (segB >= from && segA <= to) {
      const t0 = Math.max(0, (from - segA) / L), t1 = Math.min(1, (to - segA) / L);
      const p0 = [pts[i][0] + ax * t0, pts[i][1] + az * t0];
      const p1 = [pts[i][0] + ax * t1, pts[i][1] + az * t1];
      if (!out.length) out.push(p0);
      out.push(p1);
    }
    acc = segB;
  }
  return out;
}

function polyLen(pts) {
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++)
    d += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  return d;
}

export async function buildRoads(world, data, Y = null) {
  const roadGeos = [], paveGeos = [], unitPaveGeos = [], concGeos = [], busGeos = [];
  const yellowGeos = [];
  const centreGeos = [];
  let mainAxis = null, bestLen = Infinity;
  let _yt2 = performance.now();      // same time budget as buildBuildings
  for (const r of data.roads) {
    if (Y && performance.now() - _yt2 > 8) { await Y(); _yt2 = performance.now(); }
    // A CROSSING IS NOT A PAVEMENT. `footway=crossing` is the pedestrian
    // crossing mapped as a way THROUGH the carriageway; surfacing it drew a
    // pale band across the road at every crossing -- 155 of them in Orchard --
    // and the lane markings vanished under them. The zebra comes from the
    // crossing nodes, so this way carries no information we do not already
    // draw.
    if (r.fw === 'crossing') continue;
    const isPath = r.k === 'footway' || r.k === 'pedestrian';
    // Ways overlap where they meet, and two carriageways at exactly the same
    // height speckle. A stable sub-centimetre offset per road, derived from its
    // own geometry, gives every overlap a consistent winner.
    const seed = Math.abs(Math.round(r.p[0][0] * 7 + r.p[0][1] * 13)) % 5;
    const y = isPath ? 0.02 : 0.055 + seed * 0.0012;
    // Register the deck as a standable surface at the same moment it is drawn,
    // so only bridges that EXIST raise anything — a bridge in an unloaded
    // chunk must not lift a rider standing where it will one day be. Carriage-
    // ways only: a 2m footbridge deck is not something the ride belongs on,
    // and lifting the crowd onto one would put pedestrians in mid-air.
    if (r.bridge && !isPath && (r.w || 0) >= 5.5) addBridgeWay(r.p, r.w);
    const g = ribbon(r.p, r.w, y, !!r.bridge);
    if (!g.attributes.position || g.attributes.position.count === 0) continue;
    // WHAT IT IS MADE OF, from the map. `surface` is on 61% of ways here and
    // nothing read it until data/unused.py enumerated the extract: 293 ways in
    // Orchard alone are paving stones, concrete, cobblestone or sett and every
    // one was drawn as asphalt. Eighth instance of real data present and unused.
    //
    // Only three buckets, because that is all the difference a rider can see at
    // speed: bituminous, pale slab, and small unit paving.
    const sf = (r.surface || '').toLowerCase();
    let bucket = isPath ? paveGeos : roadGeos;
    if (sf) {
      if (/paving_stones|sett|cobblestone/.test(sf)) bucket = unitPaveGeos;
      else if (/concrete/.test(sf)) bucket = concGeos;
      else if (/asphalt|paved|tarmac/.test(sf)) bucket = isPath ? paveGeos : roadGeos;
    }
    bucket.push(g);

    // THE DOUBLE YELLOW LINE, on every street that has one.
    //
    // LTA SDRE Ch.8 Type I: two continuous yellow lines, 100mm each with a
    // 150mm gap, meaning no parking at any time. It is the single most
    // characteristic marking on a Singapore street and until now only the
    // three main axes had it -- so the 105km of side street opened up by the
    // dressing reach was bare tarmac from kerb to kerb.
    //
    // Built HERE, as ribbons merged per tile, for two reasons. A continuous
    // line is a ribbon: painting it as one quad per metre put ~400,000 marks
    // in the world and took P6 from 17 to 1974, because each pair then counts
    // as coplanar props. And this loop already has the way's own width and
    // the tile bucketing, so the lines cannot disagree with the tarmac about
    // where the kerb is -- the mistake that put markings on the pavement the
    // first time round.
    //
    // Skipped on service roads and anything under 5.5m: a driveway or a back
    // lane with double yellows down it is wrong, and OSM classes a lot of
    // hotel set-downs as service roads.
    //
    // ONLY BRIDGE ways are drawn here now, per way and flat at deck height —
    // a stitched run would take one deck height across ways that each chose
    // their own. Everything else moved to the streetRuns consumer below, so
    // the yellows BREAK AT JUNCTION MOUTHS: drawn blindly per way they ran
    // straight across every junction they met, which the centre-line vet
    // frames caught the moment there was other paint to compare against.
    if (!isPath && r.bridge && r.k !== 'service' && r.k !== 'service_link' && (r.w || 0) >= 5.5) {
      for (const sgn of [-1, 1]) {
        for (const inset of [0.45, 0.70]) {
          const off = sgn * (r.w / 2 - inset);
          const yg = ribbonOffset(r.p, 0.10, 0.087, off, true);
          if (yg && yg.attributes.position && yg.attributes.position.count) yellowGeos.push(yg);
        }
      }
    }
    if (/orchard road/i.test(r.n || '') && polyLen(r.p) > 120) {
      let near = Infinity;
      for (const [x, z] of r.p) near = Math.min(near, x * x + z * z);
      if (near < bestLen) { bestLen = near; mainAxis = r; }
    }
  }

  // SINGAPORE'S BUS LANES ARE RED, and they are finally drawn. 274 ways carry
  // `r.bus`, and per way they rendered as isolated red stains because OSM
  // fragments a street -- 108 of the 274 are under 30m. The finish written in
  // this file's own comment for a year: merge a street's tagged ways into
  // continuous RUNS first, the way process.py stitches Orchard Road's 28
  // fragments into one centreline, then lay ONE ribbon per run and keep only
  // runs a lane long. Runs are keyed by street name, side, width and bridge
  // flag, chained where endpoints meet within 1.5m.
  //
  // The surface sits at 0.068: above every carriageway (0.055..0.0608 with
  // the per-way seed) and below every marking (0.075 up), so the dashes and
  // arrows paint ON the red lane the way they do on the street.
  // The stitcher is shared with the centre lines below: chain a street's
  // tagged ways into continuous runs (keyed by whatever `keyFn` returns —
  // the key MUST begin with the street name, which the junction test reads
  // back out), then slice out the stretches BETWEEN junction mouths.
  //
  // BREAK AT JUNCTION MOUTHS because paint stops at a side road and resumes
  // past it — traffic turns through there. A line straight over every
  // junction is the sort of thing a Singaporean reads as wrong without being
  // able to say why. A junction is where a DIFFERENT named street's
  // centreline passes close to the run, so it comes from the map rather than
  // from a rule about spacing; the gap is the crossing street's own half
  // width plus 2m.
  const streetRuns = (wantFn, keyFn) => {
    const groups = new Map();
    for (const r of data.roads) {
      if (!wantFn(r)) continue;
      const k = keyFn(r);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r.p.map((q) => [q[0], q[1]]));
    }
    const J = 1.5;
    const near2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 <= J * J;
    const out = [];
    for (const [k, chains] of groups) {
      // chain fragments end-to-end until nothing joins
      let merged = true;
      while (merged) {
        merged = false;
        outer: for (let i = 0; i < chains.length; i++) {
          for (let j = i + 1; j < chains.length; j++) {
            const a = chains[i], b = chains[j];
            let joined = null;
            if (near2(a[a.length - 1], b[0])) joined = a.concat(b.slice(1));
            else if (near2(b[b.length - 1], a[0])) joined = b.concat(a.slice(1));
            else if (near2(a[a.length - 1], b[b.length - 1])) joined = a.concat(b.slice(0, -1).reverse());
            else if (near2(a[0], b[0])) joined = a.slice(1).reverse().concat(b);
            if (joined) { chains.splice(j, 1); chains[i] = joined; merged = true; break outer; }
          }
        }
      }
      const name = k.split('|')[0];
      // A SPATIAL INDEX, BECAUSE THIS RAN ONCE PER CHAIN OVER EVERY ROAD POINT
      // IN THE DISTRICT. The original walked all ~1,600 roads and all ~16,000
      // of their vertices for EVERY run, and for each vertex walked every
      // segment of that run: the product is millions of operations per chain,
      // and a CPU profile of the boot window put this function at 4.5% of all
      // samples -- the largest single application cost while the world is
      // building, which is exactly the "first ten seconds lag" a rider feels.
      //
      // The test radius is 3m, so a vertex more than 3m outside the run's
      // bounding box can never produce a cut. Bucketing the candidate vertices
      // once per district and gathering only the cells the run passes through
      // leaves the inner loop untouched and identical -- same segment walk from
      // i = 0, same first-hit break, same accumulated arc length. The cuts are
      // sorted by distance at the end either way, so discovery order cannot
      // change the answer.
      const JCELL = 24;
      if (!data.__jgrid) {
        const grid = new Map();
        for (const r2 of data.roads) {
          if (r2.k === 'footway' || r2.k === 'pedestrian') continue;
          for (const q of r2.p) {
            const key = Math.floor(q[0] / JCELL) + ',' + Math.floor(q[1] / JCELL);
            let cell = grid.get(key);
            if (!cell) grid.set(key, cell = []);
            cell.push([q, r2]);
          }
        }
        data.__jgrid = grid;
      }
      const junctionsNear = (run) => {
        const cuts = [];
        let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
        for (const pnt of run) {
          if (pnt[0] < x0) x0 = pnt[0];
          if (pnt[0] > x1) x1 = pnt[0];
          if (pnt[1] < z0) z0 = pnt[1];
          if (pnt[1] > z1) z1 = pnt[1];
        }
        const seen = new Set();
        const cand = [];
        for (let cx2 = Math.floor((x0 - 4) / JCELL); cx2 <= Math.floor((x1 + 4) / JCELL); cx2++) {
          for (let cz2 = Math.floor((z0 - 4) / JCELL); cz2 <= Math.floor((z1 + 4) / JCELL); cz2++) {
            const cell = data.__jgrid.get(cx2 + ',' + cz2);
            if (cell) for (const e of cell) cand.push(e);
          }
        }
        for (const [q, r2] of cand) {
          if ((r2.n || '?') === name) continue;      // same street
          {
            let acc = 0;
            for (let i = 0; i < run.length - 1; i++) {
              const ax = run[i + 1][0] - run[i][0], az = run[i + 1][1] - run[i][1];
              const L = Math.hypot(ax, az) || 1;
              const t = Math.max(0, Math.min(1, ((q[0] - run[i][0]) * ax + (q[1] - run[i][1]) * az) / (L * L)));
              const px = run[i][0] + ax * t, pz = run[i][1] + az * t;
              if ((q[0] - px) ** 2 + (q[1] - pz) ** 2 < 3 * 3) {
                cuts.push([acc + t * L, (r2.w || 6) / 2 + 2]);
                break;
              }
              acc += L;
            }
          }
        }
        return cuts.sort((a, b) => a[0] - b[0]);
      };

      for (const run of chains) {
        if (polyLen(run) < 30) continue;         // a patch is not a lane
        // walk the run, emitting the stretches between junction mouths
        const cuts = junctionsNear(run);
        const total = polyLen(run);
        const pieces = [];
        let at = 0;
        for (const [d, gap] of cuts) {
          const a = d - gap, b = d + gap;
          if (a > at + 12) pieces.push([at, a]);   // under 12m is not a lane
          at = Math.max(at, b);
        }
        if (total > at + 12) pieces.push([at, total]);
        const subs = [];
        for (const [from, to] of pieces) {
          const sub = subPoly(run, from, to);
          if (sub && sub.length >= 2) subs.push(sub);
        }
        if (subs.length) out.push({ key: k, pieces: subs });
      }
    }
    return out;
  };

  if (Y) await Y();
  for (const { key, pieces } of streetRuns(
    // no bus lane on a bridge deck: a merged run would take ONE deck height
    // across ways that each chose their own, and a red ribbon floating over
    // (or sunk under) the deck is worse than its absence
    (r) => r.bus && r.k !== 'footway' && r.k !== 'pedestrian' && (r.w || 0) > 6 && !r.bridge,
    (r) => `${r.n || '?'}|${r.bus}|${r.w}`
  )) {
    const [, side, wStr] = key.split('|');
    const w = +wStr;
    const laneW = Math.min(3.6, w * 0.28);
    const off = (side === 'left' ? -1 : 1) * (w / 2 - laneW / 2);
    for (const sub of pieces) {
      // THE OUTER EDGE VERIFIES ITSELF, in spans: sample the lane's outer
      // edge every 3m against the road index and lay ribbon only over the
      // arclength spans where it stays on tarmac. Whole-piece skipping
      // threw away good lane with the bad; per-span keeps both honest.
      // half a metre INSIDE the painted edge: the edge itself IS the road
      // boundary, and testing the boundary against a shrunken index trims
      // everything by construction (first attempt: 108 meshes -> 4)
      const outerOff = off + Math.sign(off) * (laneW / 2 - 0.5);
      const spans = [];
      let spanStart = null;
      const total3 = polyLen(sub);
      for (let a = 0; a <= total3 + 1; a += 3) {
        const aa = Math.min(a, total3);
        // sample point + normal at arclength aa
        let rem = aa, px = sub[0][0], pz = sub[0][1], nx3 = 0, nz3 = 0;
        for (let i = 0; i < sub.length - 1; i++) {
          const dx = sub[i + 1][0] - sub[i][0], dz = sub[i + 1][1] - sub[i][1];
          const L3 = Math.hypot(dx, dz) || 1;
          if (rem <= L3) {
            px = sub[i][0] + dx * (rem / L3); pz = sub[i][1] + dz * (rem / L3);
            nx3 = -dz / L3; nz3 = dx / L3;
            break;
          }
          rem -= L3;
        }
        const ok = a <= total3
          && (!window.__onRoad || window.__onRoad(px + nx3 * outerOff, pz + nz3 * outerOff, -0.05));
        if (ok && spanStart === null) spanStart = aa;
        if ((!ok || aa === total3) && spanStart !== null) {
          if (aa - spanStart >= 12) spans.push([spanStart, aa]);
          spanStart = null;
        }
      }
      for (const [s0, s1] of spans) {
        const piece = subPoly(sub, s0, s1);
        if (!piece || piece.length < 2) continue;
        const bg = ribbonOffset(piece, laneW, 0.068, off, false, true);
        if (bg && bg.attributes.position && bg.attributes.position.count) busGeos.push(bg);
      }
    }
  }

  // THE BROKEN WHITE CENTRE LINE, on every two-way street wide enough to
  // carry one. This was the last paint the side streets were missing: 105km
  // of dressed street had kerbs, lamps, trees, plates and double yellows but
  // bare tarmac down the middle. Same stitcher, same junction breaks as the
  // bus lanes above.
  //
  // Who gets one: two-way (a one-way street has no opposing flow to divide —
  // and OSM maps every dual carriageway as two one-way ways, so those are
  // excluded by construction), a real carriageway kind (a service road is a
  // driveway, a living street is shared space), at least 5.5m wide, not a
  // bridge (a merged run would take one deck height across ways that each
  // chose their own), and not one of the main axes, whose markings are built
  // per-lane by markings.js. The 5.5m threshold is OURS, not LTA's: SDRE
  // publishes no minimum width for omitting a centre line (checked March
  // 2025 edition), so "two 2.75m lanes must physically fit" is the rule and
  // it is labelled invented, not survey.
  {
    const axisNames = new Set(((data.axes && data.axes.length ? data.axes : []))
      .map((a) => (a.n || '').toLowerCase()).filter(Boolean));
    const CARRIAGEWAY = new Set(['primary', 'secondary', 'tertiary', 'trunk', 'residential', 'unclassified']);

    // The double yellows, stitched and broken at junction mouths (see the
    // bridge-only block in the road loop for why they moved here). Same
    // streets they always had — one-way included, axes included — so the only
    // change a rider sees is that the pair no longer runs across the mouth of
    // a crossing street.
    if (Y) await Y();
    for (const { key, pieces } of streetRuns(
      (r) => r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'service' && r.k !== 'service_link'
        && (r.w || 0) >= 5.5 && !r.bridge,
      (r) => `${r.n || '?'}|${r.w}`
    )) {
      const w = +key.split('|')[1];
      for (const sub of pieces) {
        for (const sgn of [-1, 1]) {
          // THE PAINT VERIFIES ITSELF against the road index before it is
          // laid. A stitched run can cut a corner on a bendy street, so its
          // offset line drifts off the drawn ribbon and the yellows land on
          // bare ground (sweep-2 #17: Sophia Rd, west Orchard — measured,
          // the ribbons were never missing, the paint had wandered). Sample
          // the kerb line at 3m; if more than a fifth of it is off the
          // carriageway, that side of that piece is not painted at all — a
          // failed search skips, never substitutes.
          const kerbOff = sgn * (w / 2 - 0.45);
          let acc2 = 0, offRoad = 0, tot = 0;
          for (let i = 0; i < sub.length - 1 && tot < 60; i++) {
            const dx = sub[i + 1][0] - sub[i][0], dz = sub[i + 1][1] - sub[i][1];
            const L = Math.hypot(dx, dz) || 1;
            for (; acc2 < L; acc2 += 3) {
              const t = acc2 / L;
              const nx2 = -dz / L, nz2 = dx / L;
              const px = sub[i][0] + dx * t + nx2 * kerbOff;
              const pz = sub[i][1] + dz * t + nz2 * kerbOff;
              tot++;
              if (window.__onRoad && !window.__onRoad(px, pz, -0.05)) offRoad++;
            }
            acc2 -= L;
          }
          if (tot && offRoad / tot > 0.2) continue;
          for (const inset of [0.45, 0.70]) {
            const off = sgn * (w / 2 - inset);
            const yg = ribbonOffset(sub, 0.10, 0.087, off, false);
            if (yg && yg.attributes.position && yg.attributes.position.count) yellowGeos.push(yg);
          }
        }
      }
    }

    if (Y) await Y();
    for (const { pieces } of streetRuns(
      (r) => !r.oneway && CARRIAGEWAY.has(r.k) && (r.w || 0) >= 5.5 && !r.bridge
        && !axisNames.has((r.n || '').toLowerCase()),
      (r) => `${r.n || '?'}|${r.w}`
    )) {
      for (const sub of pieces) {
        // 0.0815: above the bus lane's 0.068, below the double yellow's
        // 0.087, and not equal to any other marking layer, so P6 has nothing
        // coplanar to complain about
        const cg = ribbon(sub, 0.15, 0.0815, false);
        if (cg && cg.attributes.position && cg.attributes.position.count) centreGeos.push(cg);
      }
    }
  }
  // ONE MESH PER LAYER PER ~110m TILE, not one mesh per layer.
  //
  // These layers used to be a single mesh spanning the whole district, which
  // is one draw call and never frustum-culls. That was a good trade while the
  // road was a flat ribbon; it stopped being one when the ribbon gained
  // cross-width strips and the tarmac reached 279k triangles, every one of
  // them submitted from every camera position in the world. The street sweep
  // caught it as F4, 2.74M triangles against a 1.6M budget.
  //
  // Same rule and same tile size as the building merger and the terrain, for
  // the reason WORKFLOW.md already gives: merging globally defeats culling,
  // and it cost 51fps to 33 the last time this project learned it.
  const TILE = 110;
  const merge = (geos, mat, name) => {
    if (!geos.length) return;
    const buckets = new Map();
    for (const g of geos) {
      const p = g.attributes.position;
      if (!p || !p.count) continue;
      // the ribbon's own midpoint decides its tile; a way longer than a tile
      // simply lands in one of them, which is what the merger does too
      let sx = 0, sz = 0;
      for (let i = 0; i < p.count; i++) { sx += p.getX(i); sz += p.getZ(i); }
      const k = Math.round(sx / p.count / TILE) + ',' + Math.round(sz / p.count / TILE);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(g);
    }
    for (const list of buckets.values()) mergeOne(list, mat, name);
  };
  const mergeOne = (geos, mat, name) => {
    if (!geos.length) return;
    let total = 0;
    for (const g of geos) total += g.attributes.position.count;
    const pos = new Float32Array(total * 3), uv = new Float32Array(total * 2);
    let o = 0, ou = 0;
    for (const g of geos) {
      pos.set(g.attributes.position.array, o); o += g.attributes.position.array.length;
      uv.set(g.attributes.uv.array, ou); ou += g.attributes.uv.array.length;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    m.computeVertexNormals();
    const mesh = new THREE.Mesh(m, mat);
    // Named so the audit can tell the ROAD SURFACE apart from things standing
    // ON it. P1b reports "structure in a carriageway" and was counting the
    // carriageway: the merged asphalt and paving layers are single meshes
    // spanning the whole district, every vertex of them is by definition on a
    // road, and they were two of its findings. Nothing about a road being where
    // the road is is a defect. P7 ("road markings under the tarmac") and P8
    // ("ground standing through the carriageway") are the checks that own the
    // surface itself.
    mesh.name = name;
    mesh.receiveShadow = true;
    world.add(mesh);
  };
  merge(roadGeos, MAT.asphalt, 'roadSurface');
  merge(paveGeos, MAT.paving, 'pavementSurface');
  merge(unitPaveGeos, MAT.unitPave, 'roadSurface');
  merge(concGeos, MAT.roadConc, 'roadSurface');
  if (Y) await Y();
  merge(busGeos, MAT.busLane, 'roadSurface');
  // The double yellow lines. Named as a marking rather than a surface so P7
  // ("markings under the tarmac") and P9 ("markings off the tarmac") own them,
  // and so P1b does not read a painted line as structure in a carriageway.
  merge(yellowGeos, MAT.yellow, 'roadMarking');
  merge(centreGeos, MAT.centreLine, 'roadMarking');
  return mainAxis;
}

/* ---------------- the Angsana avenue, as one instanced field ---------------- */
//
// These are the most characteristic thing on Orchard Road and they were the
// most wrong thing in the world. The street is an Angsana avenue (Pterocarpus
// indicus, with Rain Trees mixed in): a dense DOME crown, wider than the tree
// is tall, on a stout trunk, with branches that spread nearly horizontally and
// then droop. NParks gives the crown as 12 to 34 metres across.
//
// What was here before was a 10 to 14 metre crown of thin scattered foliage on
// a bare 8 to 12 metre trunk, which reads as a palm, and read as a palm in
// every one of fourteen review frames. The fix is mostly proportion:
//
//   crown radius   5.2 - 7.2 m   ->   8.0 - 12.0 m   (16-24m across, in range)
//   crown depth    flat scatter  ->   dome, deepest at the centre
//   rim           level          ->   drooping, the Angsana's signature
//   trunk         0.24 / 0.52    ->   0.34 / 0.78, a stout bole
//   crown base    at 0.92 h      ->   from 0.52 h, so the canopy is a canopy
//
// Leaf cards scale WITH the crown radius, so a 1.7x wider crown is covered by
// the same 30 cards at 1.7x the size. Widening the trees costs no extra
// geometry; it costs fill rate, which is the right thing to spend it on.
//
// Every repeated thing is one InstancedMesh: as separate Groups this would be
// about ten draw calls per tree.
export class TreeField {
  constructor() { this.items = []; }
  // NOTHING GROWS IN THE RESERVOIR. Trees come from surveyed OSM nodes and
  // from the avenue walk, and neither has any idea where the water is: 97 leaf
  // cards and canopy blobs were standing in Marina Bay. Guarded at add() so
  // every caller is covered rather than each one remembering.
  add(x, z, scale = 1) {
    if (window.__inWater && window.__inWater(x, z)) return;
    this.items.push([x, z, scale]);
  }
  build(world) {
    const n = this.items.length;
    if (!n) return 0;
    const CARDS = 40, BLOBS = 7, BRANCH = 5;
    const trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.30, 0.62, 1, 8), MAT.trunk, n);
    const branches = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.06, 0.22, 1, 5), MAT.trunk, n * BRANCH);
    const blobs = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0), MAT.canopy, n * BLOBS);
    const cards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 0.55), MAT.leaf, n * CARDS);
    trunks.castShadow = branches.castShadow = blobs.castShadow = cards.castShadow = true;

    const m = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion();
    const p = new THREE.Vector3(), sc = new THREE.Vector3();
    let bi = 0, li = 0, ci = 0;

    this.items.forEach(([x, z, scale], i) => {
      // total height and crown radius. A mature roadside Angsana is about as
      // wide as it is tall, which is what makes the avenue meet overhead.
      let h = rand(13.0, 17.5) * scale;
      const rad = rand(8.0, 12.0) * scale;
      const gy = TERRAIN.at(x, z);
      // where the crown starts, and how deep the dome is from top to rim
      let crownBase = h * rand(0.50, 0.60);
      // Lift the crown clear of the traffic envelope. A crown eight to twelve
      // metres across reaches well past the kerb, so on a smaller side-street
      // tree the limbs came down to about four metres over a live lane, which a
      // double-decker at 4.3m would take off. Real street trees are pruned up
      // for precisely this reason, so lift the whole crown rather than shrink
      // it, and grow the tree by the same amount so the dome keeps its depth.
      // 6.0, not 5.2. The branches jitter up to 0.4m BELOW the crown base, so a
      // 5.2m lift put the lowest limb at exactly 4.8m, sitting precisely on the
      // clearance the audit requires rather than clearing it. Any change in the
      // ground under a tree then tipped it over, and one did. Size the lift so
      // the lowest branch clears, not so the crown base does.
      const LIFT = 6.0;
      if (crownBase < LIFT) { h += LIFT - crownBase; crownBase = LIFT; }
      const crownTop = h;
      const domeDepth = crownTop - crownBase;

      p.set(x, gy + h * 0.5, z); q.identity(); sc.set(scale, h, scale);
      m.compose(p, q, sc); trunks.setMatrixAt(i, m);

      // Main limbs: they leave the bole low, run out almost flat, and the
      // Angsana's droop comes from tilting them back down past horizontal at
      // the tip. A steep branch reads as a conifer.
      //
      // They must also finish INSIDE the foliage. Set at a shallower tilt they
      // rose above the leaf layer and the tree read as a bare umbrella frame
      // with green clumped on the spokes, which was worse than the palm it
      // replaced. Two things keep them hidden: they are shorter than the crown
      // radius, and they carry no vertical lift, so the tip is never higher
      // than where the leaf cards sit.
      for (let k = 0; k < BRANCH; k++) {
        const a = (k / BRANCH) * Math.PI * 2 + rand(-0.35, 0.35);
        const L = rad * rand(0.40, 0.62);
        const tilt = rand(1.32, 1.52);          // radians from vertical: near flat
        p.set(x + Math.cos(a) * L * 0.42,
              gy + crownBase + rand(-0.4, 0.6),
              z + Math.sin(a) * L * 0.42);
        e.set(Math.cos(a) * tilt, 0, -Math.sin(a) * tilt);
        q.setFromEuler(e); sc.set(scale, L, scale);
        m.compose(p, q, sc); branches.setMatrixAt(bi++, m);
      }

      // Solid mass inside the dome so the crown is not see-through from below.
      // Sitting these at the centre and squashing them vertically is what makes
      // it read as one canopy rather than a cloud of separate leaves.
      for (let k = 0; k < BLOBS; k++) {
        const rr = rad * rand(0.0, 0.60);
        const a = R() * Math.PI * 2;
        const t = rr / rad;
        const r = rad * rand(0.26, 0.42);
        // spread them down through the crown, not just under its skin, so the
        // limbs below the leaf shell sit in foliage instead of in daylight
        const bx = x + Math.cos(a) * rr, bz = z + Math.sin(a) * rr;
        let by = gy + crownTop - domeDepth * (t * t * 0.8 + rand(0.05, 0.55)) - r * 0.30;
        // foliage that hangs OVER a carriageway clears the traffic envelope
        // the audit judges (9m): one small Clarke Quay tree put a blob 7m
        // over the road. Clamping the single offending blob (not lifting
        // whole crowns) keeps the avenue's look untouched.
        if (window.__onRoad && by - gy < 9.2 + r * 0.52
            && window.__onRoad(bx, bz, -0.2)) {
          by = gy + 9.2 + r * 0.52;
        }
        p.set(bx, by, bz);
        q.identity(); sc.set(r, r * 0.52, r);
        m.compose(p, q, sc); blobs.setMatrixAt(li++, m);
      }

      // Leaf cards over the dome surface. The height falls off with the SQUARE
      // of the distance from the trunk, which is what makes a dome instead of a
      // disc, and the outermost cards get an extra drop for the droop.
      for (let k = 0; k < CARDS; k++) {
        const a = R() * Math.PI * 2;
        // Biased slightly inward of even-area coverage (which is sqrt). Even
        // coverage leaves the middle of the crown thin, and the middle is
        // exactly where the limbs are.
        const t = Math.pow(R(), 0.70);
        const rr = rad * t;
        const droop = domeDepth * t * t * 0.72 + t * t * t * rad * 0.30;
        p.set(x + Math.cos(a) * rr,
              gy + crownTop - droop + rand(-0.5, 0.5),
              z + Math.sin(a) * rr);
        // cards near the rim hang steeper, following the drooping branch
        e.set(rand(-1.5, -0.75) - t * 0.35, a + rand(-0.7, 0.7), rand(-0.4, 0.4));
        q.setFromEuler(e);
        const v = rad * rand(0.42, 0.72); sc.set(v, v, v);
        m.compose(p, q, sc); cards.setMatrixAt(ci++, m);
      }
    });
    branches.count = bi; blobs.count = li; cards.count = ci;
    world.add(trunks, branches, blobs, cards);
    return n;
  }
}

export function aoPatch(world, x, z, size) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), MAT.ao);
  m.rotation.x = -Math.PI / 2; m.position.set(x, TERRAIN.at(x, z) + 0.17, z);
  world.add(m);
}

// The city beyond the district.
//
// Orchard Road sits in the middle of a dense city, but the world stops at the
// edge of the fetched bounding box: ride far enough and you are on an empty
// plain with a road running to the horizon. That reads as a bug even though
// every building inside the box is correct.
//
// This fills the surround with plain massing out to the far plane — no detail,
// no windows, one instanced mesh, and nothing inside the built area where the
// real buildings are. It is explicitly NOT a claim about what stands there: it
// is a horizon, the same way a matte painting is, and it is deliberately grey
// and featureless so it never reads as surveyed geometry.
// WATER. Marina Bay is a reservoir with a city built round it, and until this
// existed the bay was a flat grey plain -- which is not a detail, it is most of
// what the place looks like.
//
// Drawn as a single flat surface per polygon at ONE level, because a reservoir
// held behind a barrage is at one level by definition. The level comes from the
// terrain at the polygon's own EDGE rather than from a constant: the heightfield
// is sampled from an elevation dataset that has no idea where the shoreline is,
// so hard-coding a sea level either floods the promenade or leaves the bay as a
// pit. Taking the lowest ground around the rim and dropping a little below it
// puts the surface just under the quay, which is where a reservoir sits.
export function buildWater(world, data) {
  const polys = data.water || [];
  if (!polys.length) return { water: 0, waterArea: 0 };
  const geos = [];
  let area = 0;
  for (const w of polys) {
    const pts = w.p;
    if (pts.length < 4) continue;
    // the rim: the lowest ground around the edge is the waterline
    let lo = Infinity;
    for (const [x, z] of pts) {
      const g = TERRAIN.at(x, z);
      if (g < lo) lo = g;
    }
    if (!isFinite(lo)) continue;
    const level = lo - 0.35;
    const geo = new THREE.ShapeGeometry(shapeFrom(pts));
    geo.rotateX(Math.PI / 2);
    geo.translate(0, level, 0);
    // ShapeGeometry lays UVs out in the shape's own coordinates, which here are
    // metres from the island origin, so one tile per metre. A water texture at
    // that scale is noise; 24m reads as swell at a distance and as ripple close up.
    const uv = geo.attributes.uv;
    if (uv) {
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 24, uv.getY(i) / 24);
      uv.needsUpdate = true;
    }
    geos.push(geo);
    area += w.a || 0;
  }
  if (!geos.length) return { water: 0, waterArea: 0 };
  // one mesh for the whole layer: it is flat, it never moves, and it is the
  // single largest surface in the district
  const merged = mergeGeos(geos);
  const mesh = new THREE.Mesh(merged, MAT.water);
  mesh.name = 'waterSurface';
  mesh.receiveShadow = false;      // a shadow on water reads as dirt
  mesh.renderOrder = -1;
  world.add(mesh);
  return { water: geos.length, waterArea: Math.round(area) };
}

// concatenate position/uv-only geometries into one
function mergeGeos(geos) {
  let total = 0;
  for (const g of geos) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), uv = new Float32Array(total * 2);
  const idx = [];
  let o = 0, ou = 0, base = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o);
    uv.set(g.attributes.uv.array, ou);
    const gi = g.index;
    if (gi) for (let i = 0; i < gi.count; i++) idx.push(base + gi.getX(i));
    o += g.attributes.position.array.length;
    ou += g.attributes.uv.array.length;
    base += g.attributes.position.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if (idx.length) m.setIndex(idx);
  m.computeVertexNormals();
  return m;
}

// THE SUPERTREES. gardensbythebay.com.sg: 18 of them at 25/30/37/42/50m, of
// which exactly one is 50m and carries the Supertree Observatory. Built as a
// reinforced-concrete core, a steel frame wrapped round it carrying planting
// panels, and a canopy "shaped like an inverted umbrella".
//
// The canopy DIAMETER is genuinely not published anywhere -- not by Gardens by
// the Bay, not by Atelier One who engineered them -- so it is taken from the
// OSM footprint radius, which is surveyed. That is the honest source for it;
// inventing a number and writing it down as if researched would be worse than
// saying where it came from.
export function buildSupertrees(world, data) {
  const list = data.towers || [];
  if (!list.length) return { supertrees: 0 };
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b6f63, roughness: 0.9 });
  const skinMat = new THREE.MeshLambertMaterial({
    color: 0x5c7f36, emissive: 0x1e2c14, emissiveIntensity: 0.35,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x8d5a3c, roughness: 0.62, metalness: 0.28, side: THREE.DoubleSide,
  });
  // a mapped "tower" INSIDE a building is that building's own structure —
  // OSM tags the Sultan Mosque's four minarets as towers, and they rendered
  // as Gardens by the Bay supertrees growing out of the prayer hall. A
  // supertree stands in open ground, always.
  const insideBuilding = (x2, z2) => {
    for (const b of data.buildings || []) {
      const p2 = b.p;
      let hit = false;
      for (let i2 = 0, j2 = p2.length - 1; i2 < p2.length; j2 = i2++) {
        const xi = p2[i2][0], zi = p2[i2][1], xj = p2[j2][0], zj = p2[j2][1];
        if (((zi > z2) !== (zj > z2)) && (x2 < ((xj - xi) * (z2 - zi)) / (zj - zi) + xi)) hit = !hit;
      }
      if (hit) return true;
    }
    return false;
  };
  let n = 0;
  for (const t of list) {
    const [x, z] = t.p;
    if (insideBuilding(x, z)) continue;
    const g0 = TERRAIN.at(x, z);
    const H = t.h, R = t.r;
    // the trunk: a flared column, wider at the base than the neck
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.30, R * 0.62, H, 10), trunkMat);
    trunk.position.set(x, g0 + H / 2, z);
    trunk.castShadow = true; world.add(trunk);
    // the planted skin, as a sleeve of foliage over the lower two thirds
    const skin = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.40, R * 0.74, H * 0.72, 10, 1, true), skinMat);
    skin.position.set(x, g0 + H * 0.40, z);
    world.add(skin);
    // THE CANOPY: an inverted umbrella, so the cone opens UPWARD -- a cone the
    // other way up is a fir tree and reads as nothing like a Supertree
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(R * 2.1, H * 0.13, 12, 1, true),
                                  canopyMat);
    canopy.position.set(x, g0 + H + H * 0.055, z);
    canopy.rotation.x = Math.PI;              // point down, mouth up
    canopy.castShadow = true; world.add(canopy);
    // the ribs under it
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, R * 2.0, 4), trunkMat);
      rib.position.set(x + Math.cos(a) * R * 0.95, g0 + H - H * 0.02, z + Math.sin(a) * R * 0.95);
      rib.rotation.z = Math.PI / 2 - 0.30;
      rib.rotation.y = -a;
      world.add(rib);
    }
    // the observatory ring, on the one that has it
    if (H >= 50) {
      const obs = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 3.2, 14, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x9aa3a8, roughness: 0.4, metalness: 0.4,
                                         side: THREE.DoubleSide }));
      obs.position.set(x, g0 + H - 3.0, z);
      obs.castShadow = true; world.add(obs);
    }
    n++;
  }
  return { supertrees: n };
}

export function buildSurround(world, data, reach = 470) {
  const built = [];
  for (const b of data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const p of b.p) {
      if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0];
      if (p[1] < mnz) mnz = p[1]; if (p[1] > mxz) mxz = p[1];
    }
    built.push([mnx, mnz, mxx, mxz]);
  }
  // The extent of the real district. Measured from the ROADS as well as the
  // buildings: the road network runs about 500m further out than the last
  // building, and sizing the surround to the buildings alone left the far tips
  // of the network standing on bare ground, which is the defect this is for.
  let dx0 = 1e9, dz0 = 1e9, dx1 = -1e9, dz1 = -1e9;
  for (const [a, b, c, d] of built) {
    if (a < dx0) dx0 = a; if (b < dz0) dz0 = b;
    if (c > dx1) dx1 = c; if (d > dz1) dz1 = d;
  }
  for (const r of (data.roads || [])) {
    for (const p2 of r.p) {
      if (p2[0] < dx0) dx0 = p2[0]; if (p2[0] > dx1) dx1 = p2[0];
      if (p2[1] < dz0) dz0 = p2[1]; if (p2[1] > dz1) dz1 = p2[1];
    }
  }

  // KEEP THE SURROUND OUT OF THE WATER. It is grey massing standing in for a
  // city that continues past the district edge, and a city does not continue
  // across a reservoir: without this, Marina Bay gets office blocks growing out
  // of the middle of it. Tested against the water polygons the same way the
  // core is tested against buildings.
  // Each ring carries its bounding box, checked before the vertex walk: this
  // predicate runs 9 times per surviving cell over ~5,500 cells, and without
  // the box it was 2.1s of the 2.3s this whole function cost — almost all of
  // it spent proving that cells nowhere near Marina Bay are not in Marina Bay.
  const wetRings = (data.water || []).map((w) => {
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (const p of w.p) {
      if (p[0] < a) a = p[0]; if (p[0] > c) c = p[0];
      if (p[1] < b) b = p[1]; if (p[1] > d) d = p[1];
    }
    return { ring: w.p, a, b, c, d };
  });
  const inWater = (x, z) => {
    for (const { ring, a, b, c, d } of wetRings) {
      if (x < a || x > c || z < b || z > d) continue;
      let hit = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, zi] = ring[i], [xj, zj] = ring[j];
        if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
      }
      if (hit) return true;
    }
    return false;
  };

  const rnd = rng(20260727);
  const put = [];
  const CELL = 78;
  // INDEX THE BUILT BOXES, because this tested every cell against every
  // building. Chinatown has 2,294 buildings and the surround grid spans the
  // district plus 470m of reach in both directions -- several thousand cells,
  // each walking the whole building list until it found an overlap or ran out.
  // A boot-window CPU profile put this function at 3.6% of all samples, second
  // only to junctionsNear, and both of them land in the seconds the rider sees
  // as lag.
  //
  // Each box is expanded by the same 70m the test uses and registered in every
  // grid cell it touches, so the lookup returns exactly the boxes that could
  // possibly match. The PREDICATE IS UNCHANGED, which matters more than the
  // speed: rnd() is only called after this check, so a different set of
  // surviving cells would shift the whole placement RNG stream and the
  // determinism gate would (rightly) fail.
  const GCELL = 156;
  const coreGrid = new Map();
  for (const bx of built) {
    const [a, b, c, d] = bx;
    for (let gx = Math.floor((a - 70) / GCELL); gx <= Math.floor((c + 70) / GCELL); gx++) {
      for (let gz = Math.floor((b - 70) / GCELL); gz <= Math.floor((d + 70) / GCELL); gz++) {
        const key = gx + ',' + gz;
        let cell = coreGrid.get(key);
        if (!cell) coreGrid.set(key, cell = []);
        cell.push(bx);
      }
    }
  }
  for (let x = dx0 - reach; x < dx1 + reach; x += CELL) {
    for (let z = dz0 - reach; z < dz1 + reach; z += CELL) {
      // Keep out of the BUILT core, where the real buildings are. The area
      // between the last building and the end of the road network is fair game:
      // that is real city in life, and empty ground here.
      let inCore = false;
      const near = coreGrid.get(Math.floor(x / GCELL) + ',' + Math.floor(z / GCELL));
      if (near) {
        for (const [a, b, c, d] of near) {
          if (x > a - 70 && x < c + 70 && z > b - 70 && z < d + 70) { inCore = true; break; }
        }
      }
      if (inCore) continue;
      if (rnd() > 0.72) continue;                       // not a solid carpet
      const jx = x + (rnd() - 0.5) * CELL * 0.6;
      const jz = z + (rnd() - 0.5) * CELL * 0.6;
      // taller nearer the middle of town, lower out at the fringes
      const away = Math.hypot(jx - (dx0 + dx1) / 2, jz - (dz0 + dz1) / 2);
      const fade = Math.max(0.25, 1 - away / (reach * 2.2));
      const bw = 22 + rnd() * 26, bd = 20 + rnd() * 24;
      // Never near a road. This is a horizon, and standing next to one shows it
      // for what it is: a featureless grey slab — anything you can ride up to
      // should be real geometry. Tested at the JITTERED position and against the
      // block's own footprint: testing the grid point left 48m-wide blocks
      // straddling carriageways 20m away.
      const keepOut = 40 + Math.max(bw, bd) / 2;
      if (window.__onRoad && window.__onRoad(jx, jz, keepOut)) continue;
      // AND NOT IN THE RESERVOIR. Tested at the JITTERED position and at the
      // block's own corners, for the same reason the road test is: the grid is
      // 78m, the jitter moves a block up to 23m off its grid point and the
      // block is up to 48m across, so a dry grid point can still put a
      // fifty-metre office block in the middle of Marina Bay. Testing the grid
      // point alone left 2,104 of them out there.
      {
        let wet = false;
        for (const ox of [-bw / 2, 0, bw / 2])
          for (const oz of [-bd / 2, 0, bd / 2])
            if (inWater(jx + ox, jz + oz)) wet = true;
        if (wet) continue;
      }
      put.push([jx, jz, 16 + rnd() * 62 * fade, bw, bd, rnd() * Math.PI]);
    }
  }
  if (!put.length) return 0;

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: 0xa9a69c });
  const im = new THREE.InstancedMesh(geo, mat, put.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const p = new THREE.Vector3(), s = new THREE.Vector3();
  const cc = new THREE.Color();
  put.forEach(([x, z, h, w, d, yaw], i) => {
    p.set(x, TERRAIN.at(x, z) + h / 2, z);
    e.set(0, yaw, 0); q.setFromEuler(e);
    s.set(w, h, d);
    m.compose(p, q, s);
    im.setMatrixAt(i, m);
    // a narrow spread of greys, so it reads as haze-flattened distance
    const t = 0.86 + rnd() * 0.2;
    im.setColorAt(i, cc.setRGB(0.66 * t, 0.65 * t, 0.61 * t));
  });
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.castShadow = false;              // never in the shadow map: it is scenery
  im.receiveShadow = false;
  world.add(im);
  return put.length;
}
