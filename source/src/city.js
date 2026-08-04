// Build the street from real OSM geometry: extruded footprints, road ribbons,
// pavements, canopy trees, covered walkway, crossings, street furniture.
import * as THREE from '../lib/three.module.js';
import { TOUCH } from './input.js';
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
// IS THIS DISTRICT A RESORT OR A CBD? Measured from its own surveyed tags.
//
// The size rule below — "a big footprint is a glazed podium" — is true in the
// CBD and false on Sentosa, where a big footprint is a hotel. It fired on 62
// of the island's 92 large buildings, because only 30 of them carry a
// `building=` tag at all, and it turned the Cove Arrival Plaza and the Village
// Hotel into walls of blue curtain glass.
//
// The district already knows the answer. Of Sentosa's tagged buildings, 499
// are dwellings or hotels and 18 are retail or commercial — 96% — so an
// UNTAGGED big building here is far more likely to be another resort block
// than a mall. Same method as the height calibration and the green fraction:
// let the place set its own default instead of inheriting the CBD's.
let RESORTISH = false;
export function setDistrictCharacter(buildings) {
  let home = 0, comm = 0;
  for (const b of (buildings || [])) {
    const t = (b.bt || '').toLowerCase();
    if (!t) continue;
    if (/^(apartments|residential|house|terrace|dormitory|bungalow|hotel)$/.test(t)) home++;
    else if (/^(retail|commercial|office|supermarket)$/.test(t)) comm++;
  }
  RESORTISH = (home + comm) >= 40 && home / (home + comm) > 0.75;
  return RESORTISH;
}

function familyFor(b, beach = false) {
  let h = 0;
  for (const [x, z] of b.p) h = (h * 31 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
  h = Math.abs(h);

  // A BUILDING ON THE BEACH IS NOT A CITY BUILDING.
  //
  // Every family below was written for the CBD — curtain wall, punched
  // concrete, masonry, balconied slab — and none of them is what stands on
  // Siloso. Once the shophouse rule stopped catching Sentosa's small buildings
  // (see the party-wall note in buildBuildings) 692 of them fell through to
  // these, and a beachfront block came out as a windowless dark concrete slab
  // standing on the sand — the ugliest thing in the frame, vetted at
  // shots/street/bch2.shot1 and reported by the owner.
  //
  // ...AND THE FIRST ATTEMPT AT FIXING IT WAS WORSE. This returned the BALCONY
  // pool for everything on the beachfront — horizontal banding, openings on
  // every floor — which is right for a resort wing and catastrophically wrong
  // for the 200 m2 bars and huts that make up most of the strip. The owner saw
  // it within the hour: "palawan got residential blocks on the fucking beach".
  // He was exactly right; a beach bar came out as an apartment block.
  //
  // The lesson is that WHERE a building stands cannot decide what it looks
  // like. What it IS decides that, and size is the honest proxy we have: the
  // small low ones are pavilions and get a pavilion's timber roof and posts
  // (see the beach branch in buildBuildings), and only a genuinely large
  // beachfront mass is a resort wing that turns balconies to the sea.
  if (beach) {
    if (b.a > 1200 && b.h > 14) return { pool: BALCONY, rough: 0.72, metal: 0, src: 'beach' };
    return { pool: STONE, rough: 0.85, metal: 0, src: 'beach' };
  }

  // a surveyed material beats everything, including the size rule below
  const mat = (b.mat || '').toLowerCase();
  if (mat) {
    if (/glass|curtain/.test(mat)) return { pool: CURTAINS, rough: 0.32, metal: 0.10, src: 'mat' };
    if (/metal|steel|aluminium|aluminum/.test(mat)) return { pool: CURTAINS, rough: 0.42, metal: 0.22, src: 'mat' };
    if (/brick|stone|granite|marble|sandstone/.test(mat)) return { pool: STONE, rough: 0.88, metal: 0, src: 'mat' };
    if (/concrete|cement|plaster|render/.test(mat)) return { pool: PUNCHED, rough: 0.88, metal: 0, src: 'mat' };
  }

  // WHAT A BUILDING IS BEATS HOW BIG IT IS, so this is asked FIRST.
  //
  // This block used to sit BELOW the size rule, and the size rule says "a big
  // footprint is a glazed podium" — which is true in the CBD and false on a
  // resort island. So Sentosa's large hotels and apartment blocks never
  // reached it: the Sentosa Cove Arrival Plaza (4,871 m2) came out as a wall
  // of blue curtain glass, and so did every big resort block. `building=` is
  // surveyed on 494 buildings here (422 residential, 72 hotel) and it was
  // being outvoted by a footprint area.
  //
  // It is the same lesson as the beach note above, which this file learned the
  // hard way: WHERE a building stands — or how big it is — cannot decide what
  // it looks like. What it IS decides that.
  const bt = b.bt;
  if (bt) {
    if (/^(apartments|residential|house|terrace|dormitory|bungalow)$/.test(bt)) {
      // Singapore housing reads as balconies and service yards, at every price
      return { pool: BALCONY, rough: 0.8, metal: 0, src: 'type' };
    }
    if (/^hotel$/.test(bt)) {
      // A HOTEL IS ROOMS. It has floors of them, and on this island they open
      // onto the sea — so it reads like housing, not like an office, whatever
      // its footprint. Split out of the commercial line below, where a 5,000
      // m2 resort was being drawn as a shop.
      return (b.h || 0) >= 12
        ? { pool: BALCONY, rough: 0.78, metal: 0, src: 'type' }
        : { pool: PUNCHED, rough: 0.86, metal: 0, src: 'type' };
    }
    if (/^(retail|commercial|office|supermarket)$/.test(bt)) {
      // low commercial is punched masonry; a tower is glass
      return (b.h || 0) >= 28
        ? { pool: CURTAINS, rough: 0.36, metal: 0.08, src: 'type' }
        : { pool: PUNCHED, rough: 0.86, metal: 0, src: 'type' };
    }
    if (/^(industrial|warehouse|service|garage|garages|carport)$/.test(bt)) {
      return { pool: PUNCHED, rough: 0.9, metal: 0, src: 'type' };
    }
    if (/^(church|temple|mosque|cathedral|school|university|college|civic|public|government|hospital|train_station)$/.test(bt)) {
      return { pool: STONE, rough: 0.9, metal: 0, src: 'type' };
    }
  }

  // a big footprint or a landmark is a podium or a mall, and those are glazed
  // whatever year they went up — UNLESS this district's own tags say it is a
  // place of hotels and homes, in which case a big untagged block is another
  // one of those (see setDistrictCharacter above)
  if (b.a > 1400 || b.k) {
    if (RESORTISH && !b.k) {
      return (b.h || 0) >= 12
        ? { pool: BALCONY, rough: 0.78, metal: 0, src: 'resort' }
        : { pool: PUNCHED, rough: 0.86, metal: 0, src: 'resort' };
    }
    return { pool: CURTAINS, rough: 0.34, metal: 0.08, src: mat ? 'mat' : 'size' };
  }

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

  // WHAT THE BUILDING IS, when the map says so and no date does.
  //
  // Read AFTER `yr` and `era` — a surveyed date for this building, or a
  // published band for its conservation area, both beat a type — and BEFORE the
  // district mix, because the mix is a rule we invented and this is a tag
  // somebody surveyed. 2,057 footprints carry one: 864 residential, apartments
  // or house, 597 retail, commercial or office. Until now the facade came from
  // a hash of the footprint, so River Valley — which is condo country — dealt
  // curtain walls and pre-war stone to blocks of flats at the same rate as the
  // CBD.

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
  // The ceiling of a covered public space: pale, matt, and slightly emissive
  // so it does not go black under a mass that blocks the sun. It IS the sky
  // for anyone standing under it.
  soffit: new THREE.MeshStandardMaterial({
    color: 0xe6e2d8, roughness: 0.95, emissive: 0x2a2825, emissiveIntensity: 0.55,
  }),
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
  // THE OPEN SEA IS NOT THE RESERVOIR. buildSea() used MAT.water, so every
  // coast in this world wore Marina Reservoir's still green-grey — which is
  // why Sentosa's sea reads as wet pavement. The Singapore Strait off the
  // south coast is a working anchorage, not a postcard lagoon: silt and
  // shipping keep it a muted blue-green rather than tropical cyan, and it is
  // never still. NO PUBLISHED COLOUR EXISTS for it, so this is an observed
  // value and is labelled as one — deeper and bluer than the reservoir,
  // rougher so the sky scatters across it instead of mirroring.
  openSea: new THREE.MeshStandardMaterial({
    map: texWater(), color: 0x5a8296, roughness: 0.30, metalness: 0.42,
  }),
  // the beach pavilion: boarded roof and timber posts, the finish every bar on
  // Siloso and Palawan actually has. Not clay tile, which is the shophouse and
  // cable-car-station lid and reads as a town building on the sand.
  beachRoof: new THREE.MeshLambertMaterial({ color: 0x6b5a48 }),   // shingle
  beachPost: new THREE.MeshLambertMaterial({ color: 0x6f5c46 }),
  // the roof terrace: white railing, turquoise loungers — Café del Mar's deck
  deckRail: new THREE.MeshLambertMaterial({ color: 0xf2f0ea }),
  beachThatch: new THREE.MeshLambertMaterial({ color: 0xa98d5c }),
  deckLounger: new THREE.MeshLambertMaterial({ color: 0x3fa8b4 }),
  // A ROOF IS NOT A WALL. The top face of an extruded building took the wall
  // material and nothing else, so from anywhere with height — the cable car,
  // the bungy tower, the Cove, any hill — a large building read as a blank
  // slab of flat colour. Roof decks are darker, dirtier and matte, and they
  // have an upstand round the edge.
  roofDeck: new THREE.MeshLambertMaterial({ color: 0x77787a }),
  roofParapet: new THREE.MeshLambertMaterial({ color: 0xa9a498 }),
  // the two surfaces OSM names that are neither asphalt nor our pavement slab
  // cooled 0x9a9184 -> grey for the Siloso pass: the beach-walk pavers in
  // every reference frame are grey brick, and the warm tint read as dirt.
  // repeat 2x: at one tile per metre the blocks were ~35cm and the promenade
  // read as big slabs; the reference bricks are half that.
  unitPave: new THREE.MeshStandardMaterial({
    map: (() => { const t = texPaverBlock(); t.repeat.set(2, 2); return t; })(),
    color: 0x9b9d97, roughness: 0.92,
  }),
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
  // (foliageVariation() is applied to leaf + canopy just below this table)
  trunk: new THREE.MeshStandardMaterial({ color: PAL.trunk, roughness: 0.95 }),
  ao: new THREE.MeshBasicMaterial({
    map: TEX.ao, transparent: true, blending: THREE.MultiplyBlending,
    premultipliedAlpha: true, depthWrite: false,
  }),
};

// A FOREST IS NOT ONE COLOUR. Every leaf card and canopy blob on the island
// shared a single flat green, and once the 2026-08-04 forest pass filled the
// unmapped slopes that green became most of the screen — a poster-paint mass
// with no depth in it, which is the plainest "cheap 3D" tell there is. Real
// canopy from a distance is patchy: species, age, aspect and how much sun a
// crown gets all pull it between olive, blue-green and near-black.
//
// PER-INSTANCE COLOUR IS NOT AN OPTION HERE. setColorAt would allocate an
// instanceColor buffer across roughly four million leaf-card instances —
// tens of megabytes on a device already sitting near an iOS memory ceiling
// that this project has not yet settled. So the variation is COMPUTED, in
// the vertex shader, from the instance's own position: no attribute, no
// buffer, no memory, three sines.
//
// Two long wavelengths (~200m and ~240m) give patches of woodland that read
// as different stands; one short one (~7m) dapples within a single crown.
// Warm-and-light one way, cool-and-dark the other, because that is the axis
// real foliage varies along — a green that only changes brightness reads as
// bad lighting, not as different trees.
//
// The ground shader in this project silently never ran for a year because
// consolidate dropped onBeforeCompile. This one cannot be swallowed the same
// way: consolidate never merges InstancedMeshes (see the isInstancedMesh
// guard there), and the shots are the proof either way.
function foliageVariation(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vFolT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 folP = instanceMatrix[3].xyz;
          vFolT = sin(folP.x * 0.031 + folP.z * 0.017) * 0.58
                + sin(folP.z * 0.026 - folP.x * 0.011 + 2.1) * 0.42
                + sin(folP.x * 0.9 + folP.z * 0.6) * 0.16;
        #else
          vFolT = 0.0;
        #endif`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vFolT;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= vec3(1.0 + vFolT * 0.30,
                                 1.0 + vFolT * 0.17,
                                 1.0 - vFolT * 0.20);`);
  };
  // three.js caches compiled programs per material; without a key of its own
  // an injected shader can be handed a cached program built without it.
  mat.customProgramCacheKey = () => 'foliageVariation';
}
foliageVariation(MAT.leaf);
foliageVariation(MAT.canopy);

// STREET FURNITURE IS NOT A WALL — the flag rides on the MATERIAL because
// merging strips names and types. D26 and the shopfront ray pass exempt any
// hit carrying it: a bus shelter, a walkway roof or a queue rail standing on
// the pavement in front of a shop is Singapore, not a walled-off bay (vetted
// 2026-08-03, shots/street/slot.shot*.jpg — the last "walls" on the defect
// board were a bus shelter and a five-foot-way canopy).
for (const _k of ['trim', 'metal', 'galv', 'busGrey', 'busRoof', 'busSoffit',
                  'busRest', 'hiVis', 'kerb', 'kerbPaint']) {
  if (MAT[_k]) MAT[_k].userData.furniture = true;
}

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
// `except` skips one road BY NAME, which is how a bridge pier asks "is there a
// carriageway here other than the one directly over my head".
export function onCarriageway(x, z, margin = -0.6, except = null) {
  return window.__onRoad ? window.__onRoad(x, z, margin, except) : false;
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

// FOOTBRIDGES, IN THEIR OWN REGISTRY, AND THAT SEPARATION IS THE POINT.
//
// `addBridgeWay` takes CARRIAGEWAYS ONLY, deliberately: `surfaceAt`,
// `standable()` and the water guard all read BRIDGES, so registering a 2m
// footbridge there would lift the ride — and the crowd — onto a handrail-width
// deck. That rule is right and is not being changed.
//
// But W2 asks a different question. "Is this thing built in open water?" has
// the same answer for a footbridge as for a road bridge: a deck over the sea
// is a deck, not a defect. The Sentosa Boardwalk is `bridge=1`,
// `highway=pedestrian`, 620m of it across the channel — and the covered
// walkway ON it was being counted as two things standing in the Straits.
//
// So footbridge decks are recorded HERE, where only the question "is there a
// bridge over this point" can reach them, and nothing that seats a rider can.
const FOOTBRIDGES = { cells: new Map(), segs: [] };

// WALKABLE SURFACES THAT ARE NOT BRIDGES — stair treads, and whatever else
// later needs a person to stand ON it rather than beside it.
//
// A SEPARATE REGISTRY, DELIBERATELY, AND THIS IS THE WHOLE REASON IT EXISTS.
// The obvious implementation is to push treads into BRIDGES: addBridgeWay
// already does exactly this job and surfaceAt already reads it. That would
// silently undo two things. `standable()` and W2's "things built in open
// water" both exempt anything with a deck over it, and sgdetail's `dryHere`
// guard — added 2026-08-01 after eleven steps were found standing sixteen
// metres in mid-air over the Singapore River — asks the same question. A
// staircase that registered itself as a bridge would exempt itself from the
// check that catches it, and the next one over water would pass in silence.
//
// So: stairs get their own registry, `surfaceAt` reads both, and every
// water/bridge exemption keeps reading BRIDGES alone.
//
// Unlike a bridge deck, a flight CLIMBS, so the height cannot be one number
// per way. Each tread registers its own segment at its own height and the
// lookup takes the highest match — which is what you are standing on when two
// treads overlap at a turn.
const WALKS = { cells: new Map(), segs: [] };

// OPEN GROUND STOREYS — footprints whose ground floor is open-sided on
// columns (the Beach Arrival Plaza bus terminal: buses drive under the
// depot). MOVEMENT ONLY: rideBlocked consults this before the footprint
// test, so a rider passes between the columns (which still block via
// SOLID, the honest geometry). Placement/dressing keep the footprint —
// the 2026-08-01 revert lesson. Registered by recipes via api.openGround.
const OPENGROUND = { cells: new Map(), polys: [] };
export function addOpenGround(poly) {
  const OG_CELL = 12;
  let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
  for (const [x, z] of poly) {
    mnx = Math.min(mnx, x); mxx = Math.max(mxx, x);
    mnz = Math.min(mnz, z); mxz = Math.max(mxz, z);
  }
  OPENGROUND.polys.push(poly);
  for (let cx = Math.floor(mnx / OG_CELL); cx <= Math.floor(mxx / OG_CELL); cx++) {
    for (let cz = Math.floor(mnz / OG_CELL); cz <= Math.floor(mxz / OG_CELL); cz++) {
      const k = cx + ',' + cz;
      let l = OPENGROUND.cells.get(k);
      if (!l) { l = []; OPENGROUND.cells.set(k, l); }
      l.push(poly);
    }
  }
}
export function openGroundAt(x, z) {
  const l = OPENGROUND.cells.get(Math.floor(x / 12) + ',' + Math.floor(z / 12));
  if (!l) return false;
  for (const poly of l) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
      if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
    }
    if (hit) return true;
  }
  return false;
}

export function addWalkSurface(x1, z1, x2, z2, half, y) {
  const idx = WALKS.segs.length;
  WALKS.segs.push([x1, z1, x2, z2, half, y]);
  const mnx = Math.min(x1, x2) - half, mxx = Math.max(x1, x2) + half;
  const mnz = Math.min(z1, z2) - half, mxz = Math.max(z1, z2) + half;
  for (let cx = Math.floor(mnx / BR_CELL); cx <= Math.floor(mxx / BR_CELL); cx++) {
    for (let cz = Math.floor(mnz / BR_CELL); cz <= Math.floor(mxz / BR_CELL); cz++) {
      const k = cx + ',' + cz;
      let l = WALKS.cells.get(k);
      if (!l) { l = []; WALKS.cells.set(k, l); }
      l.push(idx);
    }
  }
}

export function walkSurfaceAt(x, z) {
  const l = WALKS.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  let best = null;
  for (const i of l) {
    const s = WALKS.segs[i];
    const vx = s[2] - s[0], vz = s[3] - s[1];
    const l2 = vx * vx + vz * vz || 1;
    let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
    if (dx * dx + dz * dz <= s[4] * s[4] && (best === null || s[5] > best)) best = s[5];
  }
  return best;
}
export function clearBridges() { BRIDGES.cells.clear(); BRIDGES.segs.length = 0; }
export function addBridgeWay(pts, width, deck = null) { return _addSpan(BRIDGES, pts, width, deck); }

// A pedestrian bridge. Same geometry, a registry nothing seats a rider from.
export function addFootbridgeWay(pts, width) {
  return _addSpan(FOOTBRIDGES, pts, Math.max(width || 0, 3));
}

function _addSpan(REG, pts, width, deckOverride = null) {
  if (!pts || pts.length < 2) return 0;
  // deckOverride: a number, or a HEIGHT FUNCTION (x,z)=>h carrying approach
  // ramps (see the run grouping in buildRoads). The registry already stores a
  // height PER SEGMENT, so a ramped run is just segments at falling heights.
  const fn = typeof deckOverride === 'function' ? deckOverride : null;
  let deck;
  if (fn) deck = fn.deck;
  else if (deckOverride != null) deck = deckOverride;
  else {
    deck = 0;
    for (const q of pts) deck = Math.max(deck, TERRAIN.at(q[0], q[1]));
    deck += 1.2;                      // the deck sits above its abutment
  }
  const half = width / 2;
  // With a ramp function, long map segments are SUBDIVIDED (8m) before they
  // are stored: one 100m segment scored by its two endpoints would take the
  // ramp's lowest height for its whole length and put the ride surface under
  // the drawn tarmac mid-span.
  const src = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    if (!fn) { src.push([ax, az, bx, bz]); continue; }
    const L = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.ceil(L / 8));
    for (let s = 0; s < n; s++) {
      src.push([ax + (bx - ax) * (s / n), az + (bz - az) * (s / n),
                ax + (bx - ax) * ((s + 1) / n), az + (bz - az) * ((s + 1) / n)]);
    }
  }
  for (const [ax, az, bx, bz] of src) {
    const idx = REG.segs.length;
    const segDeck = fn ? Math.min(fn(ax, az), fn(bx, bz)) : deck;
    REG.segs.push([ax, az, bx, bz, half, segDeck]);
    const mnx = Math.min(ax, bx) - half;
    const mxx = Math.max(ax, bx) + half;
    const mnz = Math.min(az, bz) - half;
    const mxz = Math.max(az, bz) + half;
    for (let cx = Math.floor(mnx / BR_CELL); cx <= Math.floor(mxx / BR_CELL); cx++) {
      for (let cz = Math.floor(mnz / BR_CELL); cz <= Math.floor(mxz / BR_CELL); cz++) {
        const k = cx + ',' + cz;
        let l = REG.cells.get(k);
        if (!l) { l = []; REG.cells.set(k, l); }
        l.push(idx);
      }
    }
  }
  return deck;
}

// THE FABRIC OF A ROAD BRIDGE, WHICH SIMPLY DID NOT EXIST.
//
// addBridgeWay registers a deck so the ride stands on it, and ribbon() lays
// tarmac at that height. That was the entire construction of a carriageway
// bridge: nothing was ever built UNDER or BESIDE one. 139 ways and 17.6km of
// this world's roads are `bridge=1`, and every metre of it was a strip of
// asphalt hanging in space.
//
// It is worst where it matters most. Teleporting to Sentosa lands the rider
// mid-channel on the Sentosa Gateway, measured 8.0m up with the sea at 0 and
// nothing beneath — "once i reach im like in the middle of air", which is
// exactly right. A footbridge two hundred metres away reads perfectly, because
// sgdetail.js gives it a deck edge, a parapet and a pier; the carriageway
// bridges never had an equivalent.
//
// Three pieces, all merged into the same 110m tile buckets as every other road
// surface, so a causeway costs a few draws rather than one per span:
//
//   soffit   the deck's own thickness, overhanging the tarmac slightly so
//            there is an edge to catch the light from below and from a boat
//   parapet  a wall down each side, set OUTSIDE the carriageway on purpose —
//            P1b and T1 both read anything within the road width as an
//            obstruction, and they would be right to
//   piers    columns to the ground, ONLY where the deck is genuinely spanning
//            something. An embankment with 2m of fill under it gets none, or
//            every kerbside ramp in the CBD would sprout stilts.
const DECK_T = 0.85;                  // deck + edge beam, in metres
// HOW MUCH AIR MAKES A BRIDGE A BRIDGE. The soffit's lowest face sits
// `clear - DECK_T/2` above the ground, so a span is genuinely aloft once
// `clear` passes 2.6 + DECK_T/2. Module scope because TWO passes now ask it —
// the pier pass (does this span get a bent?) and the deck-height pass (is this
// run a viaduct at all, or a road OSM happens to tag bridge=yes?) — and two
// copies of the same threshold is exactly the drift this file keeps paying for.
const LOW_CLEAR = 2.6 + DECK_T / 2 + 0.05;
const PIER_GAP = 26;                  // metres between pier bents
const PIER_MIN = 2.4;                 // below this the deck is on fill, not piers

function boxGeo(w, h, l, cx, cy, cz, yaw) {
  const g = new THREE.BoxGeometry(w, h, l).toNonIndexed();
  g.rotateY(yaw);
  g.translate(cx, cy, cz);
  return g;
}

export const BRIDGE_PIERS = { built: 0, skipped: 0, nudged: 0, atGrade: 0 };

export function bridgeFabric(pts, width, deck, deckGeos, pierGeos, ownName) {
  if (!pts || pts.length < 2 || !deck) return;
  const half = width / 2;
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0], dz = pts[i + 1][1] - pts[i][1];
    const L = Math.hypot(dx, dz);
    if (L < 0.05) continue;
    segs.push({ x: pts[i][0], z: pts[i][1], dx, dz, L, yaw: Math.atan2(dx, dz), s0: total });
    total += L;
  }
  if (!segs.length) return;
  // A WAY TAGGED `bridge=1` IS NOT NECESSARILY IN THE AIR, and fabric that is
  // not in the air is a wall down a street.
  //
  // The deck rule is `max terrain along the way + 1.2`, which is right for a
  // span and meaningless for the culverts, ramps and kerb-height crossings OSM
  // also tags this way. Two districts proved it: an unnamed 6m service way in
  // Chinatown built its parapets 1.2m off the ground straight across Sago
  // Lane, and eleven fabric tiles in harbourfront sat 1.2 to 2.4m up over
  // Telok Blangah Road. T1 was right about every one — you cannot ride through
  // them.
  //
  // THE THRESHOLD IS T1'S OWN BAND, NOT A GUESS. T1 counts geometry between
  // 0.35m and 2.6m above the terrain, "only what a rider would hit". The
  // soffit's lowest face sits `clear - DECK_T/2` above the ground, so a
  // segment is out of that band once `clear` passes 2.6 + DECK_T/2, and 3.1
  // gives it a little margin. Below that the segment keeps its tarmac and its
  // deck registration exactly as before and simply gains nothing to hold up.
  //
  // AND IT IS DECIDED PER SEGMENT. The first version asked the question once
  // for the whole way, using the maximum clearance anywhere along it — which
  // is how harbourfront kept building parapets on the parts of a viaduct that
  // come back down to grade at its abutments while the middle was 8m up.
  const clearAt = (sg, t) => deck - DECK_T - TERRAIN.at(sg.x + sg.dx * t, sg.z + sg.dz * t);
  for (const sg of segs) {
    if (Math.min(clearAt(sg, 0), clearAt(sg, 0.5), clearAt(sg, 1)) < LOW_CLEAR) {
      BRIDGE_PIERS.atGrade++;
      continue;
    }
    const mx = sg.x + sg.dx / 2, mz = sg.z + sg.dz / 2;
    const cy = Math.cos(sg.yaw), sy = Math.sin(sg.yaw);
    // The spans overlap by 0.35m so a bend in the way does not open a slot of
    // daylight at every vertex — the same trick the ribbon itself uses.
    deckGeos.push(boxGeo(width + 0.9, DECK_T, sg.L + 0.35,
      mx, deck - DECK_T / 2 - 0.02, mz, sg.yaw));
    for (const sgn of [-1, 1]) {
      const ox = sgn * (half + 0.36);
      deckGeos.push(boxGeo(0.26, 0.92, sg.L + 0.35,
        mx + cy * ox, deck + 0.42, mz - sy * ox, sg.yaw));
    }
  }
  // PIERS, walked by arc length so the spacing is even across a way whose
  // vertices are not. Placed from the FIRST interval rather than at s=0, which
  // would stand a column on the abutment itself.
  //
  // AND A PIER MUST NOT LAND IN A CARRIAGEWAY. The deck belongs over the road
  // — that is what a viaduct is — but the thing holding it up belongs clear of
  // one, the same split the ERP gantry already makes between its span and its
  // legs. Built blind, the first version stood three bents in live traffic on
  // Clemenceau Avenue and Oxley Rise, and P1b caught all three.
  //
  // So each bent is searched ALONG the deck for a clear spot before it is
  // built, and a bent with nowhere to stand is SKIPPED rather than moved
  // somewhere it does not belong — skip, never substitute. `ownName` excludes
  // the bridge's own carriageway, which is directly overhead and which every
  // pier is under by construction; an UNNAMED bridge way has nothing to
  // exclude, so its own deck reads as a road and it keeps its deck and
  // parapets but loses its piers. 22 of this world's 139 carriageway bridge
  // ways are unnamed, and losing a column under those is the cheaper error.
  const clearOf = (x, z) => !onCarriageway(x, z, 0.4, ownName || null);
  for (let s = PIER_GAP; s < total - 4; s += PIER_GAP) {
    let placed = null;
    for (const nudge of [0, 2, -2, 4, -4, 6, -6, 9, -9, 12, -12]) {
      const at = s + nudge;
      if (at < 3 || at > total - 3) continue;
      const sg = segs.find((q) => at >= q.s0 && at < q.s0 + q.L) || segs[segs.length - 1];
      const t = Math.max(0, Math.min(1, (at - sg.s0) / sg.L));
      const px = sg.x + sg.dx * t, pz = sg.z + sg.dz * t;
      const g = TERRAIN.at(px, pz);
      const clear = deck - DECK_T - g;
      if (clear < PIER_MIN) break;             // on fill here: no bent wanted
      const cy = Math.cos(sg.yaw), sy = Math.sin(sg.yaw);
      const ox = half * 0.58;
      // TEST THE WHOLE BENT, NOT JUST THE TWO COLUMNS. The first version
      // checked only the column centres at +-ox, and the CROSSHEAD they carry
      // is `width * 0.92` across — wider than the columns it spans between. On
      // an unnamed service bridge in Chinatown the columns cleared Sago Lane
      // and the crosshead's end did not, which T1 caught as a carriageway
      // blocked by solid geometry. Sample the bent's real half-width.
      const bw = Math.max(ox + 0.46, width * 0.46);
      let ok = true;
      for (const f of [-1, -0.6, 0, 0.6, 1]) {
        if (!clearOf(px + cy * bw * f, pz - sy * bw * f)) { ok = false; break; }
      }
      if (!ok) continue;
      placed = { px, pz, g, clear, cy, sy, ox, yaw: sg.yaw };
      if (nudge) BRIDGE_PIERS.nudged++;
      break;
    }
    if (!placed) { BRIDGE_PIERS.skipped++; continue; }
    const { px, pz, g, clear, cy, sy, ox, yaw } = placed;
    // a bent: two columns under the deck edges, plus the crosshead they carry
    for (const sgn of [-1, 1]) {
      pierGeos.push(boxGeo(0.92, clear, 0.92,
        px + cy * sgn * ox, g + clear / 2, pz - sy * sgn * ox, yaw));
    }
    pierGeos.push(boxGeo(width * 0.92, 0.5, 1.15, px, deck - DECK_T - 0.22, pz, yaw));
    BRIDGE_PIERS.built++;
  }
}

// Is there a deck of ANY kind over this point — carriageway or footway? Only
// for "is this built in open water"; never for seating a rider. bridgeDeckAt
// below stays carriageway-only and is what surfaceAt/standable read.
export function anyDeckAt(x, z) {
  const a = bridgeDeckAt(x, z);
  if (a !== null) return a;
  return _deckIn(FOOTBRIDGES, x, z);
}



// The deck height under a point, or null if there is no bridge over it. The
// widest deck wins where two overlap, which is the ramp rather than the slip
// road and is the one you are actually riding on.
export function bridgeDeckAt(x, z) { return _deckIn(BRIDGES, x, z); }

// EVERY deck over a point, not just the widest. Where a ramp crosses the
// carriageway it carries, two decks are live at the same x,z and differ by
// several metres — and a kerb sitting correctly on one of them matches
// neither `surfaceAt` (which takes the widest) nor the terrain. That is what
// D2 was reporting as 87 floating kerbs in marinabay and 228 in kallang, all
// on bridge=1 carriageways, none of it visible in a frame. Same family as the
// fix that took it from 118 to 87: let the check measure what the world
// actually offers rather than one of two right answers.
export function bridgeDecksAt(x, z) {
  const out = [];
  for (const REG of [BRIDGES, FOOTBRIDGES]) {
    const l = REG.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
    if (!l) continue;
    for (const i of l) {
      const s = REG.segs[i];
      const vx = s[2] - s[0], vz = s[3] - s[1];
      const l2 = vx * vx + vz * vz || 1;
      let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
      if (dx * dx + dz * dz <= (s[4] + 0.4) * (s[4] + 0.4) && out.indexOf(s[5]) < 0) out.push(s[5]);
    }
  }
  return out;
}

// like _deckIn, but only decks at least `minHalf` wide — the walker's
// stand-on rule needs to tell a 7m promenade from a 3m crossing linkway
function _deckWideIn(REG, x, z, minHalf) {
  const l = REG.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  let best = null, bestHalf = -1;
  for (const i of l) {
    const s = REG.segs[i];
    if (s[4] < minHalf) continue;
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

function _deckIn(REG, x, z) {
  const l = REG.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  let best = null, bestHalf = -1;
  for (const i of l) {
    const s = REG.segs[i];
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
  // A STAIR TREAD IS GROUND WHEN YOU ARE ON IT. Checked after the deck so a
  // flight under a bridge does not lift a rider off the carriageway, and
  // before the terrain so a walker climbing Fort Canning rises with the steps
  // instead of walking through them. main.js seats the walker with exactly
  // this function (`walkerRig.group.position.set(walker.x, surfaceAt(...))`),
  // which is why the stairs were drawn but not climbable until now.
  const step = walkSurfaceAt(x, z);
  if (step !== null) return step;
  const g = TERRAIN.at(x, z);
  // A LOW FOOTBRIDGE IS A BOARDWALK YOU STAND ON. Footbridge decks were kept
  // out of this function so a rider passing UNDER one is not lifted onto it
  // — right for overpasses, and it buried every player ON the Sentosa
  // Boardwalk to the helmet for 1.2km (sweep w_-1096_11883, P0): the deck
  // draws ~1.5m above terrain and the seat read the terrain. The 2m line
  // keeps both truths: under 2m of air there is nothing to walk beneath, so
  // standing on it is the only reading; 2m and up stays an overpass.
  // PROMENADE-CLASS footbridge decks only (half-width >= 2.5m — the
  // Boardwalk is 7m wide; crossing linkways are 3m): a flat height rule
  // lifted walkers passing UNDER low linkways onto them, and the ledger +
  // trailcheck caught it as paired +-1.5m steps either side of every low
  // crossing (N3 13 -> 36 in one deploy). Width tells a deck you promenade
  // ALONG from one that crosses OVER you; over water anything wide is
  // standable at any height because nothing walks beneath.
  const fb = _deckWideIn(FOOTBRIDGES, x, z, 2.5);
  // WIDE pedestrian decks (>=2.5m half: the Boardwalk) stand you on them
  // within 3m of air or over water. Every rule here was MEASURED before it
  // stayed: no window at all bounced the shore footway that crosses under
  // the Boardwalk's tall landing stub (+-3.5m at -1103,11701); tighter
  // windows put the seat-flip seam mid-promenade (2.24m at -1125,11814).
  // At 3.0+overWater the one residual dip sits on a few metres of the
  // dead-end scenery stub — the least harm on the table tonight. The clean
  // end is seating that knows WHICH way the walker follows; that is a
  // project, and this line documents the trade until it exists.
  if (fb !== null && fb > g) {
    const grd = TERRAIN.grid && TERRAIN.grid();
    const seaLv = grd && typeof grd.sea === 'number' ? grd.sea : null;
    if (fb - g < 3.0 || (seaLv !== null && g < seaLv + 0.6)) return fb + 0.04;
  }
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
    for (const [key, _list] of this.groups) meshes += this._bucket(world, key, _list, cast);
    this.groups.clear(); this.mats.clear();
    return meshes;
  }
  // flush, but yielding to the frame loop between buckets. Same iteration
  // order and identical geometry to flush() — the buckets are independent —
  // so determinism is untouched; only who gets the CPU between them changes.
  // Built for the streamed addChunk path, where the whole-district flush at
  // the end of buildBuildings was a single indivisible block.
  async flushY(world, opts = {}, Y = null) {
    const cast = opts.cast !== false;
    let meshes = 0;
    let _ft = performance.now();
    for (const [key, _list] of this.groups) {
      if (Y && performance.now() - _ft > 8) { await Y(); _ft = performance.now(); }
      meshes += this._bucket(world, key, _list, cast);
    }
    this.groups.clear(); this.mats.clear();
    return meshes;
  }
  _bucket(world, key, _list, cast) {
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
      if (!good.length) return 0;
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
      // NORMALS PACKED TO INT8. Measured on the phone profile: geometry is
      // 91.7MB and NORMALS ARE 31.7MB OF IT — exactly as much as positions —
      // against a heap of ~347MB and an iOS ceiling near 206MB. A unit vector
      // does not need 32-bit floats per axis; normalised Int8 is 3 bytes
      // instead of 12 and is what glTF quantisation has used for years.
      //
      // Vetted, not assumed: the same three viewpoints were rendered before
      // and after (beach walk, Resorts World, deep forest) and compared,
      // because the failure mode of this change is banded or blotchy shading
      // across the whole island rather than an error anybody would catch.
      const _n8 = new Int8Array(nor.length);
      for (let i = 0; i < nor.length; i++) {
        const v = nor[i];
        _n8[i] = Math.max(-127, Math.min(127, Math.round(v * 127)));
      }
      merged.setAttribute('normal', new THREE.Int8BufferAttribute(_n8, 3, true));
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
      return 1;
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
// AN EAVE IS A NUMBER OF METRES, NOT A PERCENTAGE OF THE BUILDING.
//
// Every roof recipe calls this with a factor a little over 1 to throw the eave
// past the wall — 1.08, 1.14, 1.22. On a shophouse, where these were written,
// a 14% grow on a 12m frontage is a 0.8m overhang and exactly right. On
// Capella's curved wing, 160m x 91m, the SAME factor is an ELEVEN METRE
// overhang: standing under it you see a featureless brown soffit filling the
// whole sky, which is the "giant blank untextured mass" report all over again,
// and it is the island's most photographed building.
//
// So the factor is capped in metres. A generous domestic eave is about 1.5m
// and a deep tropical verandah roof about 2.5m; MAX_EAVE takes the wider of
// those. Small buildings are unchanged — for anything under about 20m across,
// the metre cap is looser than the factor and never binds — so no shophouse,
// kampong roof or beach shelter moves.
// NOT CAPPED, DELIBERATELY, UNTIL SOMEONE MEASURES IT. A metre cap was written
// here and reverted the same hour: the "featureless brown soffit filling the
// sky" that prompted it was the CAMERA STANDING INSIDE Capella's ground floor,
// not an eave at all — the same misread as the Siloso "brown ceiling" earlier
// the same day, which was also a camera inside a building. The underlying
// concern is real and unmeasured: a factor of 1.14 is a 0.8m eave on a 12m
// shophouse and an 11m eave on a 160m wing, so a roof recipe reaching a large
// footprint would throw an overhang nobody intended. Find one first.
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

// Plain painted render, cached per colour. Beach bars are flat white walls
// with no masonry pattern on them at all, and every textured pool in this file
// puts one there.
const _RENDER = new Map();
function renderMat(hex) {
  let m = _RENDER.get(hex);
  if (!m) _RENDER.set(hex, m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.9 }));
  return m;
}

export async function buildBuildings(world, data, Y = null) {
  // the district decides its own default facade character from its own tags
  setDistrictCharacter(data.buildings || []);
  const stats = { count: 0, tall: 0, bespoke: 0 };
  // A PODIUM SKIRT MUST NOT WALL INTO THE WATER — the same rule the skirt
  // already follows for carriageways, for the same reason.
  //
  // Measured 2026-08-03: rebuilding sentosa's terrain with the shore smoothed
  // took W2 from 168 to 248 and P1b from 9 to 11, and the extra findings were
  // all building fabric — white walls, d8d2c3 trim — standing in mapped water.
  // The mechanism is this skirt. It fires on a fall of more than 2.5m, and
  // smoothing the coast is precisely a change to how the ground falls at the
  // water's edge, so waterfront buildings that previously sat on a lumpy DEM
  // now measure a real drop and grow a skirt down into the harbour.
  //
  // Proven by restoring the pre-rebuild terrain against the SAME code: W2 168
  // / P1b 9, both passing. So this is the rebuild's consequence, not the sea's
  // and not the trails'.
  // A SHOPHOUSE IS A TERRACE. IT HAS PARTY WALLS.
  //
  // The owner, on Sentosa: "i need sentosa to feel like sentosa meaning all the
  // building or structures." The single biggest reason it did not was this:
  // any unnamed building under 520 m2 and 20m tall got the Singapore SHOPHOUSE
  // recipe — masonry, five-foot-way, pitched clay roof — and on sentosa that
  // caught 792 of 1,082 buildings. The Cove's villas, the resort chalets, the
  // beach huts, the Fort Siloso structures and the golf clubhouses were all
  // wearing Chinatown's clothes.
  //
  // Size and height cannot tell those apart, but ADJACENCY can, because it is
  // what a shophouse physically IS: a unit in a terrace, sharing walls with its
  // neighbours. Measured over the small-building population of four districts:
  //
  //     chinatown    1,710 of 1,805 abut a neighbour   95%
  //     littleindia  1,772 of 1,870                    95%
  //     bugis          729 of   774                    94%
  //     sentosa        103 of   813                    13%
  //
  // So the terrace districts keep essentially every shophouse they had and
  // sentosa keeps only the hundred that really are terraces. This is the same
  // shape as the supertree-grove test: ask the geometry the question that
  // defines the real thing, rather than adding a per-district flag someone has
  // to remember to set.
  const ABUT_CELL = 60, ABUT_NEAR = 0.9;
  const _abuts = new Set();
  {
    const small = [];
    for (const b of (data.buildings || [])) {
      if (!b.k && b.a < 520 && b.h <= 20 && b.p && b.p.length <= 64) small.push(b);
    }
    const cells = new Map();
    small.forEach((b, i) => {
      for (const [px, pz] of b.p) {
        const k = Math.floor(px / ABUT_CELL) + ',' + Math.floor(pz / ABUT_CELL);
        let s = cells.get(k);
        if (!s) cells.set(k, s = new Set());
        s.add(i);
      }
    });
    small.forEach((b, i) => {
      const near = new Set();
      for (const [px, pz] of b.p) {
        const ci = Math.floor(px / ABUT_CELL), cj = Math.floor(pz / ABUT_CELL);
        for (let a = -1; a <= 1; a++) {
          for (let c = -1; c <= 1; c++) {
            const s = cells.get((ci + a) + ',' + (cj + c));
            if (s) for (const j of s) if (j !== i) near.add(j);
          }
        }
      }
      for (const j of near) {
        for (const [qx, qz] of small[j].p) {
          for (const [px, pz] of b.p) {
            if (Math.hypot(px - qx, pz - qz) < ABUT_NEAR) { _abuts.add(b); return; }
          }
        }
      }
    });
  }
  // WHICH BUILDINGS STAND ON THE BEACH — see the beachfront note in familyFor.
  // Measured from the mapped sand rings, so this is empty inland and costs
  // nothing there. 45m, not 70m: at 70 it reaches back across the beach walk
  // and picks up the road-fronting blocks behind, which are ordinary buildings.
  const _sandRings = (data.green || [])
    .filter((g) => g.k === 'sand' && g.p && g.p.length >= 4).map((g) => g.p);
  const _beach = new Set();
  let _beachLowered = 0;
  // the surveyed beach-walk centrelines, used by the beachfront test below
  const _walkSegs = [];
  for (const _r of (data.roads || [])) {
    if (!/beach walk/i.test(_r.n || '') || !_r.p) continue;
    for (let _i = 0; _i < _r.p.length - 1; _i++) {
      _walkSegs.push([_r.p[_i][0], _r.p[_i][1], _r.p[_i + 1][0], _r.p[_i + 1][1]]);
    }
  }
  if (_sandRings.length) {
    const edgeD = (x, z, p) => {
      let best = 1e9;
      for (let i = 0; i < p.length; i++) {
        const a = p[i], c = p[(i + 1) % p.length];
        const vx = c[0] - a[0], vz = c[1] - a[1];
        const L2 = vx * vx + vz * vz || 1;
        let t = ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        best = Math.min(best, Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)));
      }
      return best;
    };
    for (const b of (data.buildings || [])) {
      if (!b.p || b.p.length < 3) continue;
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of b.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      const bx = (mnx + mxx) / 2, bz = (mnz + mxz) / 2;
      for (const p of _sandRings) {
        if (edgeD(bx, bz, p) < 45) { _beach.add(b); break; }
      }
      // ...OR IT FRONTS THE BEACH WALK. Measured on Siloso: the bars that
      // define the strip stand 44-88m back from the sand edge, behind the
      // walk, so a 45m band from the sand caught almost none of them and the
      // frame stayed full of tall grey blocks. Raising the radius instead
      // would start swallowing the road-fronting buildings behind. The walk
      // itself is surveyed, so "fronts the beach walk" is both the precise
      // test and the true one — that is what a beach bar does.
      if (!_beach.has(b)) {
        for (const seg of _walkSegs) {
          const vx = seg[2] - seg[0], vz = seg[3] - seg[1];
          const L2 = vx * vx + vz * vz || 1;
          let t = ((bx - seg[0]) * vx + (bz - seg[1]) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          if (Math.hypot(bx - (seg[0] + vx * t), bz - (seg[1] + vz * t)) < 38) {
            _beach.add(b);
            break;
          }
        }
      }
      // A BEACH BAR IS NOT SIX STOREYS. 20.0 is process.py's TYPE DEFAULT —
      // the height it falls back to when OSM gives neither a height nor a
      // level count — and 116 buildings on sentosa are standing on it,
      // including most of the Siloso strip. Every reference photograph of
      // those bars shows one or two storeys with a roof terrace, so a 20m
      // guess is drawing them five storeys too tall and is the reason the
      // beach reads as an office park.
      //
      // This replaces a GUESS with a better-informed guess and does not touch
      // a single surveyed figure: only buildings that are on the beachfront
      // AND sitting on exactly the default are lowered. Real heights here run
      // in storey multiples (6.8, 10.8, 14.4) and are left alone. Mutated on
      // the record so the checks measure the same number the geometry uses.
      if (_beach.has(b) && b.h === 20) {
        const _hh2 = ((bx * 4.7 + bz * 2.9) % 1);
        b.h = +(5.5 + _hh2 * 3.4).toFixed(1);        // 5.5-8.9m: one or two storeys
        _beachLowered++;
      }
    }
  }
  // SENTOSA COVE IS WHITE AND LOW, and it is a typology rather than a set of
  // landmarks — about 350 bungalows on five teardrop islands, each island one
  // loop road. Published form: two-storey flat white boxes with dark
  // full-height glazing and DEEP, THIN-EDGED ROOF SLABS; a minority keep the
  // orange terracotta pitch left from Bernard Spoerry's 1992 Port Grimaud
  // master plan. URA's landed rules cap the two-storey zones at 12m, and no
  // Cove-specific height control is published, so heights stay as mapped.
  //
  // Located from the SURVEYED ROAD NAMES rather than a bounding box: Ocean
  // Drive, Cove Way/Avenue/Grove/Drive and the five islands (Coral, Paradise,
  // Treasure, Sandy, Pearl) are all in the road layer, so the district defines
  // itself and cannot drift if the data is refetched.
  const _coveRe = /ocean drive|cove way|cove avenue|cove grove|cove drive|coral island|paradise island|treasure island|sandy island|pearl island/i;
  const _coveSegs = [];
  for (const r of (data.roads || [])) {
    if (!r.n || !_coveRe.test(r.n)) continue;
    const p = r.p || [];
    for (let i = 0; i < p.length - 1; i++) _coveSegs.push([p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]]);
  }
  const _cove = new Set();
  if (_coveSegs.length) {
    for (const b of (data.buildings || [])) {
      if (!b.p || b.p.length < 3) continue;
      if ((b.a || 0) > 1200 || (b.h || 0) > 16) continue;   // not the towers or Quayside
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of b.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      const bx = (mnx + mxx) / 2, bz = (mnz + mxz) / 2;
      for (const [ax, az, cx2, cz2] of _coveSegs) {
        const vx = cx2 - ax, vz = cz2 - az;
        const L2 = vx * vx + vz * vz || 1;
        let t = ((bx - ax) * vx + (bz - az) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        if (Math.hypot(bx - (ax + vx * t), bz - (az + vz * t)) < 90) { _cove.add(b); break; }
      }
    }
  }
  const _wrings = (data.water || []).map((w) => w.p).filter((p) => p && p.length > 3);
  const _inWaterRing = (x, z) => {
    for (const ring of _wrings) {
      let c = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, zi] = ring[i], [xj, zj] = ring[j];
        if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
      }
      if (c) return true;
    }
    return false;
  };
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
    // a recipe with an open-sided ground storey registers its footprint so
    // MOVEMENT passes between the columns; placement keeps the footprint
    openGround: addOpenGround,
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

    // A building=roof IS A CANOPY: a roof held up by columns, open and
    // walkable underneath — RWS's covered walkways ("The Forum"/WEAVE), bus
    // shelters writ large. Extruding it like a building gave it WALLS, and
    // those walls blocked every mapped footway under it (the owner's "ride
    // halfway stuck"; 2026-08-03 research audit FP-0). Drawn instead as the
    // slab it is, on slim columns around the ring; no wall ever reaches the
    // Solid grid, so the paths under it are open the way they are in life.
    if (b.roof) {
      FOOT = seatY(b);
      STREET = streetY(b);
      // A FLAT slab is only honest on NEAR-FLAT ground at walkway scale.
      // One 'canopy' at the Serapong spanned falling terrain and drew as a
      // brown ceiling over the pond (vetted, shots pavilion.png) — a big or
      // sloped roof structure needs a real recipe; until it has one, refuse
      // rather than invent. The RWS walkway canopies are flat and stay.
      let gMin = Infinity, gMax = -Infinity;
      for (const [qx, qz] of pts) {
        const g = TERRAIN.at(qx, qz);
        if (g < gMin) gMin = g;
        if (g > gMax) gMax = g;
      }
      if (gMax - gMin > 4 || (b.a || 0) > 12000) { stats.count++; continue; }
      const canopyH = Math.max(4, Math.min(9, b.h || 5));
      const topY = FOOT + canopyH;
      // columns first, slab only if enough of them stand: a ring whose
      // column sites are all refused (water, roads) would leave a roof
      // floating on nothing — W2 caught exactly one doing so over a golf
      // pond on this branch's first run.
      const cols = [];
      let acc = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, az] = pts[i], [bx2, bz2] = pts[i + 1];
        const L2 = Math.hypot(bx2 - ax, bz2 - az);
        for (let t = acc === 0 ? 0 : Math.max(0, 12 - acc); t < L2; t += 12) {
          const px = ax + (bx2 - ax) * (t / L2), pz = az + (bz2 - az) * (t / L2);
          if (window.__onRoad && window.__onRoad(px, pz, 0)) continue;
          if (window.__inWater && window.__inWater(px, pz)) continue;
          const gy = TERRAIN.at(px, pz);
          if (topY - 0.55 - gy < 2.5) continue;
          cols.push([px, pz, gy]);
        }
        acc = (acc + L2) % 12;
      }
      if (cols.length >= 2) {
        const slab = extrudeGeo(pts, 0.55, 0);
        slab.translate(0, topY - 0.55 - FOOT, 0);
        merger.add(slab, MAT.conc, pts[0][0], pts[0][1]);
        for (const [px, pz, gy] of cols) {
          const col = new THREE.CylinderGeometry(0.22, 0.22, topY - 0.55 - gy, 6);
          col.translate(px, gy + (topY - 0.55 - gy) / 2, pz);
          merger.add(col, MAT.conc, px, pz);
        }
      }
      stats.count++;
      continue;
    }

    // Seat the building ONCE, here, before anything about it is drawn. The
    // rule is the one the mass already used, so no mass moves; what changes is
    // that every later piece of this building is measured from the same number
    // instead of re-deriving one from its own thickness or its own ring.
    FOOT = seatY(b);
    STREET = streetY(b);

    // A STREET-SEATED BUILDING ON A REAL SLOPE GETS A SKIRT. seatY hands
    // low buildings (h <= 16) the street-footing rule, which was written for
    // shophouse terraces whose ground barely falls — but Canninghill Square
    // is a 145x157m mall seated on River Valley Road with the ground
    // dropping 10m to the river under its far side, and The Cannery the same
    // shape: both hung in open air (measured 2026-08-03 by a full gap-map —
    // 8-10m of daylight, nothing but terrainSurface beneath). Moving the
    // seat down instead would bury them from the street they front. So the
    // seat stays and the building grows a PODIUM SKIRT: a plain walled mass
    // from the lowest ground up to the seat, which is what the real
    // buildings do with a slope. Only fires past 2.5m of fall — Emerald
    // Hill's terraces measure well under that — and never for a mass that
    // deliberately starts in the air.
    if (!b.con && !(b.mh && b.mh > 1)) {
      const _low = footingY(pts);
      // ...and NEVER across a carriageway. A ring the polygon surgery left
      // spanning a road (or a porte-cochere the road passes under) would get
      // its open ground floor walled shut by the skirt — robertson's D9
      // caught exactly one, a skirt wall standing in River Valley Road at
      // -776,8126 (2026-08-03). If any sampled ring point stands on a road,
      // this building manages its own ground floor; no skirt.
      let _onRoad = false;
      if (FOOT - _low > 2.5) {
        // every ~3m along every edge — vertex+midpoint sampling let a long
        // edge cross River Valley Road between samples and walled it
        // (robertson D9 at -776,8126)
        for (let _i = 0; _i < pts.length && !_onRoad; _i++) {
          const _a = pts[_i], _b = pts[(_i + 1) % pts.length];
          const _L = Math.hypot(_b[0] - _a[0], _b[1] - _a[1]);
          const _n = Math.max(1, Math.ceil(_L / 3));
          for (let _k = 0; _k <= _n && !_onRoad; _k++) {
            const _t = _k / _n;
            const _sx = _a[0] + (_b[0] - _a[0]) * _t, _sz = _a[1] + (_b[1] - _a[1]) * _t;
            // same sample walk answers both questions, so the two guards
            // cannot disagree about where this building's edge runs
            if (onCarriageway(_sx, _sz, 0.3) || _inWaterRing(_sx, _sz)) _onRoad = true;
          }
        }
      }
      if (!_onRoad && FOOT - _low > 2.5) {
        // MERGED, like every other piece of building fabric — not a bare
        // ExtrudeGeometry mesh. The first version was one, and D16 flagged
        // River Valley Apartments' skirt: a deep U-shaped ring's walls
        // legitimately face the bbox centre, which D16's convexity sampling
        // reads as inside-out. The merger also batches ~60 skirts into the
        // per-tile meshes instead of 60 extra draw calls.
        const _c = centroid(pts);
        merger.add(extrudeGeo(pts, FOOT - _low, -(FOOT - _low)), MAT.conc, _c[0], _c[1]);
        stats.skirts = (stats.skirts || 0) + 1;
      }
    }

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
    // ...AND IT ABUTS ITS NEIGHBOURS — see the party-wall measurement above.
    if (!_rec && !b.k && b.a < 520 && b.h <= 20 && b.p.length <= 64 && _abuts.has(b)) {
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
    const _isBeach = _beach.has(b);
    const _isCove = _cove.has(b);
    const fam = familyFor(b, _isBeach);
    // THE COVE VILLA — see the Sentosa Cove note above. A deep, thin-edged
    // roof slab oversailing a low white box is the whole look; the slab is
    // what makes it read as a Cove house rather than a bungalow anywhere.
    // A fifth keep the Port Grimaud terracotta pitch, chosen by the same
    // position hash the facades use so a street is mixed but stable.
    if (_isCove && !b.roof) {
      const _hh = Math.max(3, b.h || 8);
      const _cc = centroid(b.p);
      let _ph = 0;
      for (const [x, z] of b.p) _ph = (_ph * 31 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
      // 1-in-5 pitched -> 1-in-3. The Cove's villa islands carry a lot of
      // pitched terracotta among the flat-roofed modern houses, and one in
      // five read as an estate of flat boxes with the odd exception. Authored
      // proportion, not a surveyed one — the roof form of an individual villa
      // is not published anywhere.
      if (Math.abs(_ph) % 3 === 0) {
        merger.add(extrudeGeo(grow(b.p, 1.08), 0.3, _hh), MAT.clayTile, _cc[0], _cc[1]);
        merger.add(extrudeGeo(grow(b.p, 0.82), 1.5, _hh + 0.3), MAT.clayTile, _cc[0], _cc[1]);
      } else {
        // thin edge, deep overhang: 22cm of slab reaching 1.3m past the wall
        merger.add(extrudeGeo(grow(b.p, 1.19), 0.22, _hh), MAT.paleStone, _cc[0], _cc[1]);
      }
    }
    // A CALIBRATED TOWER ON A FAIRWAY IS A SHED (owner, 2026-08-04: "just
    // generic looking coloured building... everything looks same same").
    // The sweep's park-belt "blockout boxes" were 183 unnamed buildings
    // wearing CITY calibration bands — 23.8m windowless slabs standing on
    // golf and park land. An unnamed building on a fairway is maintenance
    // stock, a pavilion or a clubhouse annexe: one to two storeys. Clamp
    // the invented height and hand it the garrison whitewash + pitched
    // roof below — the island's own vernacular. Named buildings and
    // surveyed/levels heights are untouched; provenance moves to
    // 'calib-park' so the ledger still counts it invented.
    const _parkStock = !b.n && b.hs === 'calib' && !b.roof && (() => {
      const _cc0 = centroid(b.p);
      for (const g2 of (data.green || [])) {
        if ((g2.k !== 'golf' && g2.k !== 'park') || !g2.p || g2.p.length < 4) continue;
        let hit = false;
        const pg = g2.p;
        for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) {
          const xi = pg[i][0], zi = pg[i][1], xj = pg[j][0], zj = pg[j][1];
          if (((zi > _cc0[1]) !== (zj > _cc0[1]))
              && (_cc0[0] < ((xj - xi) * (_cc0[1] - zi)) / (zj - zi) + xi)) hit = !hit;
        }
        if (hit) return true;
      }
      return false;
    })();
    if (_parkStock && (b.h || 0) > 8.5) {
      let _ph2 = 0;
      for (const [x, z] of b.p) _ph2 = (_ph2 * 31 + ((x * 5) | 0) + ((z * 9) | 0)) | 0;
      b.h = 4.6 + (Math.abs(_ph2) % 3);
      b.hs = 'calib-park';
    }
    // THE GARRISON STOCK. 136 buildings on Sentosa carry cons='SENTOSA' — the
    // island's conservation area — and they are not a mixed bag: they are the
    // British military buildings put up between the 1880s and the 1930s, and
    // the resorts here ARE those buildings. Sofitel Sentosa is a 1930s colonial
    // block ("designed as separate blocks similar to how the old British
    // military buildings on Sentosa were designed"), Amara Sanctuary is the
    // Palawan barracks, The Barracks Hotel is a 1940 barracks, Oasia keeps a
    // three-storey heritage block, and the Mess Hall is what its name says.
    // Their surveyed heights agree: median 6.8m, two storeys.
    //
    // So they get the form they actually have — white render, a pitched tiled
    // roof with an overhang, and a verandah colonnade along the long face —
    // rather than the generic city facade family. This is the single biggest
    // character change available on the island: it is 136 buildings, and they
    // are the ones a visitor walks past.
    //
    // Sofitel, Amara and Capella are NOT NAMED in the map, so this is keyed on
    // the conservation tag rather than on names it does not have.
    if ((b.cons || _parkStock) && !b.roof && (b.h || 0) <= 14 && (b.a || 0) >= 90 && !(b.mh > 1)) {
      const _hh = Math.max(3, b.h || 6);
      const _cc = centroid(b.p);
      // roof: a shallow hip, done as two stacked rings so it reads pitched
      // from the ground without a real hip solve
      merger.add(extrudeGeo(grow(b.p, 1.14), 0.26, _hh), MAT.clayTile, _cc[0], _cc[1]);
      merger.add(extrudeGeo(grow(b.p, 0.72), 1.15, _hh + 0.26), MAT.clayTile, _cc[0], _cc[1]);
      // verandah posts along the longest edge, at storey spacing, kept off any
      // carriageway so this cannot become a T1 finding
      let bi = 0, bl = 0;
      for (let i = 0; i < b.p.length; i++) {
        const a2 = b.p[i], c2 = b.p[(i + 1) % b.p.length];
        const L2 = Math.hypot(c2[0] - a2[0], c2[1] - a2[1]);
        if (L2 > bl) { bl = L2; bi = i; }
      }
      if (bl > 9) {
        const a2 = b.p[bi], c2 = b.p[(bi + 1) % b.p.length];
        const ux = (c2[0] - a2[0]) / bl, uz = (c2[1] - a2[1]) / bl;
        const nx4 = -uz, nz4 = ux;
        // push the colonnade OUTWARD, away from the footprint centre
        const sgn = ((a2[0] + ux * bl / 2 + nx4) - _cc[0]) * nx4
                  + ((a2[1] + uz * bl / 2 + nz4) - _cc[1]) * nz4 > 0 ? 1 : -1;
        // A COLONNADE CARRIES SOMETHING. The first pass stood posts along the
        // facade holding nothing up, which reads as a fence, not a verandah.
        // So: a shade roof over them, and posts thick enough to look like they
        // carry it.
        const vy = _hh * 0.52;
        const cnt = Math.max(2, Math.floor((bl - 2.8) / 3.1));
        let placed = 0;
        for (let k = 0; k <= cnt; k++) {
          const t = 1.6 + k * ((bl - 3.2) / cnt);
          const px = a2[0] + ux * t + nx4 * 1.7 * sgn;
          const pz = a2[1] + uz * t + nz4 * 1.7 * sgn;
          if (window.__onRoad && window.__onRoad(px, pz, 0)) continue;
          const gy2 = TERRAIN.at(px, pz);
          const post = new THREE.CylinderGeometry(0.15, 0.17, vy, 8);
          post.translate(px, gy2 + vy / 2, pz);
          merger.add(post, MAT.paleStone || MAT.conc, px, pz);
          placed++;
        }
        if (placed >= 2) {
          const mid = bl / 2;
          const mx = a2[0] + ux * mid + nx4 * 0.9 * sgn;
          const mz = a2[1] + uz * mid + nz4 * 0.9 * sgn;
          const gy3 = TERRAIN.at(mx, mz);
          const roof = new THREE.BoxGeometry(bl - 1.0, 0.2, 2.1);
          roof.rotateY(Math.atan2(ux, uz));
          roof.translate(mx, gy3 + vy + 0.1, mz);
          merger.add(roof, MAT.clayTile, mx, mz);
        }
      }
    }

    // AND A DEEP ROOF OVER IT. A low building on the sand is a pavilion — a
    // bar, a restaurant, a changing block — and what it has that a city
    // building does not is a roof that oversails its own walls to shade them.
    // Only for the low ones: a beachfront hotel keeps its flat top.
    if (_isBeach && (b.h || 0) <= 12 && !b.roof) {
      const _hh = Math.max(3, b.h || 6);
      const _cc = centroid(b.p);
      // A SILOSO BEACH BAR, FROM THE PHOTOGRAPHS. Café del Mar's frontage is
      // the reference: WHITE rendered walls, a low shingled pitched roof over
      // the entrance, wide folding doors standing open, and — the thing that
      // actually identifies it from the sand — a ROOFTOP DECK with a white
      // railing and coloured loungers along it. Not a beige box with window
      // bands, which is what the generic family was drawing.
      // NO TWO BARS ON SILOSO ARE THE SAME BUILDING, and a single pavilion
      // recipe stamped 78 times would be its own kind of wrong — the owner
      // asked for this directly: "i hope you dont go do everything look
      // generic and the same". So each takes one of four forms from its own
      // position hash: a shingled pitch, a flat deck with a parapet, a steep
      // thatch pavilion, and a shallow monopitch. Stable across rebuilds
      // because the hash is positional, and varied along the strip because
      // neighbours hash differently.
      let _vh = 0;
      for (const [_vx, _vz] of b.p) _vh = (_vh * 31 + ((_vx * 11) | 0) + ((_vz * 7) | 0)) | 0;
      const _variant = Math.abs(_vh) % 4;
      const _roofMat = _variant === 2 ? MAT.beachThatch : MAT.beachRoof;
      if (_variant === 1) {
        // flat deck with a raised parapet — the modern white beach club
        merger.add(extrudeGeo(grow(b.p, 1.10), 0.28, _hh), MAT.deckRail, _cc[0], _cc[1]);
        merger.add(extrudeGeo(grow(b.p, 1.02), 0.55, _hh + 0.28), MAT.deckRail, _cc[0], _cc[1]);
      } else if (_variant === 3) {
        // shallow monopitch, oversailing hard on the seaward side only
        merger.add(extrudeGeo(grow(b.p, 1.22), 0.3, _hh), _roofMat, _cc[0], _cc[1]);
        merger.add(extrudeGeo(grow(b.p, 0.92), 0.7, _hh + 0.3), _roofMat, _cc[0], _cc[1]);
      } else {
        merger.add(extrudeGeo(grow(b.p, 1.16), 0.34, _hh), _roofMat, _cc[0], _cc[1]);
        merger.add(extrudeGeo(grow(b.p, _variant === 2 ? 0.7 : 1.05),
          _variant === 2 ? 2.4 : 0.9, _hh + 0.34), _roofMat, _cc[0], _cc[1]);
      }
      // and it stands on posts at the corners, which is what holds an
      // oversailing roof up and what you actually see from the sand
      // ...AND A POST NEVER STANDS IN A CARRIAGEWAY. These sit 13% outside the
      // footprint and span ground to roof, so on a building that fronts Siloso
      // Beach Walk they land in the road — a solid cylinder a rider hits.
      for (const [_px, _pz] of grow(b.p, 1.13)) {
        if (onCarriageway(_px, _pz, 0.4)) continue;
        const _post = new THREE.CylinderGeometry(0.11, 0.13, _hh, 6);
        _post.translate(_px, groundAt(_px, _pz) + _hh / 2, _pz);
        merger.add(_post, MAT.beachPost, _px, _pz);
      }
      // the roof terrace: a railing round the parapet and loungers on the deck
      if (_hh >= 5.5 && (b.a || 0) > 150) {
        const _ring = grow(b.p, 1.0);
        const _per = [];
        for (let _i = 0; _i < _ring.length; _i++) {
          const _a = _ring[_i], _b2 = _ring[(_i + 1) % _ring.length];
          const _L = Math.hypot(_b2[0] - _a[0], _b2[1] - _a[1]);
          const _n = Math.max(1, Math.round(_L / 1.5));
          for (let _k = 0; _k < _n; _k++) {
            const _t = _k / _n;
            _per.push([_a[0] + (_b2[0] - _a[0]) * _t, _a[1] + (_b2[1] - _a[1]) * _t]);
          }
        }
        for (const [_px, _pz] of _per) {
          const _st = new THREE.CylinderGeometry(0.035, 0.035, 1.0, 5);
          _st.translate(_px, _hh + 1.74, _pz);
          merger.add(_st, MAT.deckRail, _px, _pz);
        }
        merger.add(extrudeGeo(grow(b.p, 1.005), 0.07, _hh + 2.2), MAT.deckRail, _cc[0], _cc[1]);
        // a few loungers on the terrace, the turquoise the photographs show
        for (let _q = 0; _q < 4; _q++) {
          const _t = (_q + 0.5) / 4;
          const _p2 = _per[Math.floor(_t * _per.length)];
          if (!_p2) continue;
          const _lg = new THREE.BoxGeometry(1.7, 0.16, 0.6);
          _lg.translate(_cc[0] + (_p2[0] - _cc[0]) * 0.7,
            _hh + 1.32, _cc[1] + (_p2[1] - _cc[1]) * 0.7);
          merger.add(_lg, MAT.deckLounger, _cc[0], _cc[1]);
        }
      }
    }
    // GIVE IT A ROOF. See MAT.roofDeck: the extrusion's top face wore the wall
    // material, so every flat-topped building was a blank slab from above —
    // the recurring "big untextured mass" in vet shots across the Cove, the
    // beach and the resort. A recessed deck plus an upstand round the edge is
    // the whole fix, and it is what a real flat roof looks like from the cable
    // car. Skipped for canopies (b.roof), for masses that start in the air,
    // and for anything under 300 m2, where the cost is not worth the pixels.
    if (!b.roof && !(b.mh && b.mh > 1) && (b.a || 0) > 300 && b.h > 3) {
      const _rc = centroid(b.p);
      merger.add(extrudeGeo(grow(b.p, 0.985), 0.12, b.h - 0.12), MAT.roofDeck, _rc[0], _rc[1]);
      merger.add(extrudeGeo(grow(b.p, 1.006), 0.65, b.h - 0.1), MAT.roofParapet, _rc[0], _rc[1]);
    }
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
    // A BEACH BUILDING IS PALE. The family above gives it openings; this gives
    // it the finish. Sentosa's beachfront and the Cove are published as white
    // and light — Bloomberg's own description of the Cove is "white", and the
    // beach strip is render and timber, not the CBD's grey concrete. Still a
    // TINT of the surveyed texture, exactly like `building:colour` above, so
    // the family's window pattern survives; and a surveyed colour still wins.
    // WHITE, not beige. Every reference photograph of the Siloso bars is
    // white render; 0xe8e2d4 was still reading as a sandy office block.
    // ...and not all the same white. The strip in the photographs runs from
    // bright white render through cream to a couple of painted accents, so
    // the tint varies per building on the same positional hash the form
    // uses. One colour across 78 buildings is as wrong as one shape.
    const _BEACH_TINTS = [0xf6f4f0, 0xefe9dc, 0xe8ded0, 0xf2ece0, 0xe6ded6];
    let _bt = 0;
    for (const [_tx, _tz] of b.p) _bt = (_bt * 31 + ((_tx * 5) | 0) + ((_tz * 3) | 0)) | 0;
    const _beachTint = _BEACH_TINTS[Math.abs(_bt) % _BEACH_TINTS.length];
    // Bloomberg's own description of the Cove is "white", and the photographs
    // agree: white render, dark glazing. Brighter than the beach tint.
    const _coveTint = 0xf2efe8;
    // A TINT OVER A STONE TEXTURE IS NOT WHITE RENDER. Tinting multiplies, so
    // a white tint on the STONE pool's dark map came out grey-taupe and the
    // bars still read as sheds (vetted, shots/street/bar3.shot1). A small
    // beach building is smooth painted render with almost nothing on it, so it
    // gets a plain material in the tint colour rather than a tinted map.
    const _isSmallBeach = _isBeach && (b.a || 0) <= 1200 && b.h <= 14;
    // A SENTOSA COVE VILLA IS PAINTED RENDER TOO, and it was getting the
    // tinted-map path three lines below — the exact mistake the note above
    // describes, made twice. Tinting multiplies, so a near-white tint over a
    // stone map came out grey-taupe: ridden down Ocean Drive the Cove read as
    // rows of beige office blocks where the real thing is white rendered
    // villas on the water. Same fix as the beach: a plain material in the
    // colour, no map.
    //
    // The towers keep the mapped facade — ONE°15, The Oceanfront and the
    // Residences are glass-and-frame buildings and genuinely are not render.
    const _isVilla = _isCove && (b.h || 0) <= 20 && !b.roof;
    // the garrison stock is painted render, like the villas and the beach bars
    const _isHeritage = !!b.cons && (b.h || 0) <= 14 && !b.roof;
    const mat = b.col ? tintedMat(wallTex, fam.rough, fam.metal, b.col)
      : _isVilla ? renderMat(_coveTint)
      : _isHeritage ? renderMat(0xf4efe4)
      : _isSmallBeach ? renderMat(_beachTint)
      : _isCove ? tintedMat(wallTex, fam.rough, fam.metal, _coveTint)
      : _isBeach ? tintedMat(wallTex, fam.rough, fam.metal, _beachTint)
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
      // AN OPEN GROUND STOREY NEEDS SOMETHING TO STAND ON.
      //
      // `og` is set by data/openground.py on a footprint that a real
      // carriageway genuinely runs through — Beach Arrival Plaza's surveyed
      // outline comes within 0.20m of Siloso Beach Walk's surveyed centreline,
      // because the road passes UNDER it. Lifting the mass alone would leave a
      // building floating; these are the columns that hold it up, and they are
      // the reason the road below is clear.
      //
      // Column sites refuse the carriageway itself (that is the whole point)
      // and refuse water, exactly as the b.roof canopy above does. If too few
      // stand, the mass would hang on nothing — so it is NOT lifted at all and
      // is drawn solid, which is a visible, honest failure rather than a
      // building in the sky.
      if (b.og) {
        // A SOFFIT, because the underside of a lifted mass is the ceiling of a
        // public space and it was showing raw facade.
        //
        // Rendered from the Universal Studios forecourt, the lifted podium
        // above read as a DARK BROWN SLAB filling the top half of the frame —
        // the wall texture, seen from below, unlit. Standing under it felt like
        // a car park, and it is the single most-looked-at ceiling on the island
        // because the globe is under it. A real covered plaza has a pale lit
        // soffit, so build one: a thin cap at the underside, in its own light
        // material, which also hides the mass's own open bottom face.
        const soffit = extrudeGeo(pts, 0.38, 0);
        soffit.translate(0, b.mh - 0.38, 0);
        merger.add(soffit, MAT.soffit || MAT.conc, pts[0][0], pts[0][1]);
        const cols = [];
        let acc = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const [ax, az] = pts[i], [bx2, bz2] = pts[i + 1];
          const L2 = Math.hypot(bx2 - ax, bz2 - az);
          for (let t = acc === 0 ? 0 : Math.max(0, 9 - acc); t < L2; t += 9) {
            const px = ax + (bx2 - ax) * (t / L2), pz = az + (bz2 - az) * (t / L2);
            if (window.__onRoad && window.__onRoad(px, pz, 0)) continue;
            if (window.__inWater && window.__inWater(px, pz)) continue;
            const gy = TERRAIN.at(px, pz);
            if (gy < 0.8) continue;
            cols.push([px, pz, gy]);
          }
          acc = (acc + L2) % 9;
        }
        for (const [px, pz, gy] of cols) {
          const top = FOOT + b.mh;
          if (top - gy < 2.2) continue;
          const col = new THREE.CylinderGeometry(0.34, 0.38, top - gy, 8);
          col.translate(px, gy + (top - gy) / 2, pz);
          merger.add(col, MAT.conc, px, pz);
        }
      }
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
    // ...ON THE KIND OF ROOF THAT ACTUALLY CARRIES IT.
    //
    // Tanks, ducting and a stair housing are what you see on a commercial
    // block or an HDB slab, and this recipe was written looking at those. On
    // Sentosa it was putting a row of rust-coloured water drums along the top
    // of Sentosa Cove's waterfront residences (vetted from above at 275,13692)
    // — the most expensive housing in Singapore, wearing a CBD service roof.
    // A resort or a home on this island has a clean roof, a terrace or a pool.
    //
    // Beach and Cove buildings and anything the district reads as a dwelling
    // or a hotel are exempt; the island's actual commercial and transport
    // blocks still get their plant.
    const _btLow = (b.bt || '').toLowerCase();
    const _domestic = _isCove || _isBeach
      || /^(apartments|residential|house|terrace|dormitory|bungalow|hotel|villa)$/.test(_btLow);
    if (b.a > 900 && h > 12 && !_domestic) {
      const c = centroid(pts);
      const roof = FOOT + h;
      // ...AND IT ALL HAS TO LAND ON THE ROOF.
      //
      // Every piece below was offset from the CENTROID by up to nine metres,
      // with no idea where the roof's edge is. On a compact block that is
      // fine; on a long thin one — Quayside Isle's terrace, most of the
      // island's retail — nine metres sideways is off the parapet, and a water
      // tank was left hanging over the edge in mid-air (vetted from above at
      // 990,13215). Ask the footprint: try a few offsets and keep the first
      // that is genuinely inside it, with a margin so nothing overhangs.
      const inFoot = (x, z) => {
        let hit = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const xi = pts[i][0], zi = pts[i][1], xj = pts[j][0], zj = pts[j][1];
          if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
        }
        return hit;
      };
      // spiral in toward the centroid until the point sits inside: the
      // centroid of a concave footprint can itself be outside, so the last
      // resort is "do not place this piece" rather than "place it anywhere"
      const onRoof = (reach, need) => {
        for (let k = 0; k < 8; k++) {
          const f = 1 - k / 8;
          const x = c[0] + rand(-reach, reach) * f, z = c[1] + rand(-reach, reach) * f;
          // the piece's own half-width must be inside too, or it overhangs
          if (inFoot(x, z) && inFoot(x + need, z) && inFoot(x - need, z)
              && inFoot(x, z + need) && inFoot(x, z - need)) return [x, z];
        }
        return null;
      };
      for (let i = 0; i < 3; i++) {
        const w2 = rand(3, 7), d2 = rand(3, 6);
        const at = onRoof(8, Math.max(w2, d2) / 2 + 0.6);
        if (!at) continue;
        const g2 = new THREE.BoxGeometry(w2, rand(1.6, 3.4), d2);
        g2.translate(at[0], roof + rand(1, 1.8), at[1]);
        merger.add(g2, MAT.conc, c[0], c[1]);
      }
      // lift and stair housing
      {
        const w2 = rand(4, 7), d2 = rand(4, 6);
        const at = onRoof(6, Math.max(w2, d2) / 2 + 0.6);
        if (at) {
          const sh = new THREE.BoxGeometry(w2, rand(3.2, 4.6), d2);
          sh.translate(at[0], roof + 2.2, at[1]);
          merger.add(sh, MAT.trim, c[0], c[1]);
        }
      }
      // water tanks
      if (chance(0.6)) {
        for (let i = 0; i < 2; i++) {
          const r2 = rand(0.9, 1.4);
          const at = onRoof(9, r2 + 0.6);
          if (!at) continue;
          const tk = new THREE.CylinderGeometry(r2, r2, 1.7, 10);
          tk.translate(at[0], roof + 0.9, at[1]);
          merger.add(tk, MAT.trim, c[0], c[1]);
        }
      }
      // duct run
      if (chance(0.5)) {
        const L2 = rand(9, 16);
        const at = onRoof(4, L2 / 2 + 0.6);
        if (at) {
          const dz = new THREE.BoxGeometry(L2, 0.7, 0.7);
          dz.translate(at[0], roof + 0.9, at[1]);
          merger.add(dz, MAT.metal, c[0], c[1]);
        }
      }
    }
    stats.count++;
  }
  FOOT = STREET = null;   // nothing outside this loop belongs to a building
  stats.mergedMeshes = await merger.flushY(world, {}, Y);
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
      // ...AND NOT IN THE SEA. This asked only "is the post in a carriageway",
      // which is every question worth asking inland and half of one on a
      // waterfront. Sentosa's hotels, ferry terminals and Resorts World all
      // front open water, so their entrance canopies reached out over it: 157
      // six-metre columns standing in the channel, which W2 reported the day
      // the island was built and no district before it could have shown.
      //
      // Both posts must be clear, because a canopy needs both — half a canopy
      // is worse than none.
      const clear = ![-1, 1].some((s2) => {
        const [px2, pz2] = postAt(w, s2);
        return onCarriageway(px2, pz2) || !standable(px2, pz2);
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
  if (flat && typeof flat !== 'function') {
    // `flat` may be the RUN deck height (a number) or a HEIGHT FUNCTION with
    // approach ramps — see the bridge-fragment grouping in buildRoads. A bare
    // `true` keeps the old per-way derivation.
    if (typeof flat === 'number') deck = flat;
    else {
      for (const q of pts) deck = Math.max(deck, TERRAIN.at(q[0], q[1]));
      deck += 1.2;                     // the deck sits above its abutment
    }
  }
  const H = (x, z) => (typeof flat === 'function' ? flat(x, z)
                       : flat ? deck : TERRAIN.at(x, z)) + y;
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
  // A beachfront promenade: unit-paved, unpainted. Named, because that is the
  // family (`* Beach Walk` — Siloso, Palawan, Tanjong), and paint on brick
  // pavers is wrong wherever it happens.
  const PROMENADE = (r) => /beach walk$/i.test(r.n || '');
  const bridgeGeos = [], pierGeos = [];       // deck soffit + parapets, and the bents under them
  const yellowGeos = [];
  const centreGeos = [];
  // BRIDGE FRAGMENTS SHARE ONE DECK (2026-08-03). OSM splits a bridge into
  // ways, and each fragment derived its deck from terrain under its OWN
  // points — so a fragment wholly over water read sea level + 1.2 while its
  // land-touching neighbour read 8m, and the Sentosa Gateway arrived at the
  // island as a 6.5m CLIFF in the ride surface (the owner found it riding:
  // "roads in the air then suddenly drop"; measured 1.52m vs 7.98m decks at
  // z=11870/11875). Fragments whose endpoints touch now take the MAX deck of
  // their connected run: one bridge, one height. Connectivity only — name
  // matching fails on dual carriageways and unnamed ramps.
  // TWO REFINEMENTS PAID FOR BY MEASUREMENT (roadsteps probe, same day):
  // (1) SAME CLASS ONLY. The pedestrian Boardwalk shares endpoints with the
  //     Gateway carriageway; one union handed the footpath an 8m road deck
  //     and its steps grew from 4.7m to 9.4m. In reality stairs join them —
  //     a footbridge and a road bridge meeting at a node share a NODE, not
  //     a deck. Carriageways union with carriageways, paths with paths.
  // (2) RAMP THE TERMINAL ENDS. A run's deck is max(terrain)+1.2, so where
  //     it lands, the continuing road can still sit metres lower (Brani
  //     Terminal Avenue: 3.1m). At endpoints no same-class fragment continues
  //     from, the height function slopes the last 20m down to the landing
  //     terrain — an approach ramp, which is what the real bridge has.
  const BRDECK = new Map();
  {
    // A CARRIAGEWAY WHOSE OWN GROUND IS AWASH IS PART OF THE BRIDGE, whatever
    // OSM tags. The Gateway's parallel arrival lanes are bridge-tagged only
    // over mid-channel; the approach lanes used to drape onto ground that
    // read +12m from contaminated samples, and the day the terrain became
    // honest (260804-1248) that ground fell to the water it really is — the
    // tagged deck stayed at 6.3 while the untagged lanes beside it dropped
    // to sea level, and the rider fell through the seam ("the road halfway
    // float up in the air... i inside the road"). Promotion is judged from
    // the terrain the world actually has, so it cannot drift from it.
    {
      const g0 = TERRAIN.grid && TERRAIN.grid();
      const seaLv = g0 && typeof g0.sea === 'number' ? g0.sea : null;
      // over water = the DRAWN world says so: inside a mapped water ring
      // (waterFloor is the same test vertexY sinks the drawn bed with — the
      // two cannot disagree), or on ground at open-sea level
      const overWater = (x, z) =>
        (TERRAIN.waterFloor && TERRAIN.waterFloor(x, z) !== null)
        || (seaLv !== null && TERRAIN.at(x, z) <= seaLv + 0.6);
      for (const r of data.roads) {
        if (r.bridge || !r.p || r.p.length < 2) continue;
        // footways promote too: the causeway's parallel footpath stayed
        // excluded and walkers draped at TERRAIN level inside the drawn road
        // deck — sunk to the helmet (sweep finding w_-1096_11883, P0). The
        // deck machinery already unions pedestrian-class runs separately, so
        // a promoted footway becomes a walkway deck, not a road deck.
        if (r.k === 'steps') continue;
        let low = 0;
        for (const q of r.p) if (overWater(q[0], q[1])) low++;
        if (low > 0.6 * r.p.length) {
          r.bridge = 1;
          r.ws = (r.ws || '') + '+causeway';
        }
      }
      // SECOND PASS: a way that runs INSIDE a promoted causeway's corridor
      // joins it. The promotion is judged per way, and the strait polygon's
      // edge ran between the Gateway's road lanes (promoted, deck 5.9) and
      // the footway 16m beside them (not promoted, terrain 4.0) — a walker
      // on that footway was buried to the helmet in the deck slabs
      // (sweep w_-1096_11883). Levels on one causeway must agree.
      {
        const cells = new Map();
        const CW = 12;
        for (const r of data.roads) {
          if (!r.bridge || !/causeway/.test(r.ws || '')) continue;
          for (const q of r.p) {
            for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
              cells.set((Math.floor(q[0] / CW) + dx) + ',' + (Math.floor(q[1] / CW) + dz), true);
            }
          }
        }
        if (cells.size) {
          for (const r of data.roads) {
            if (r.bridge || !r.p || r.p.length < 2 || r.k === 'steps') continue;
            let nearP = 0;
            for (const q of r.p) {
              if (cells.has(Math.floor(q[0] / CW) + ',' + Math.floor(q[1] / CW))) nearP++;
            }
            if (nearP > 0.6 * r.p.length) {
              r.bridge = 1;
              r.ws = (r.ws || '') + '+causeway-join';
            }
          }
        }
      }
    }
    const bws = data.roads.filter((r) => r.bridge && r.p && r.p.length >= 2);
    const cls = bws.map((r) => (r.k === 'footway' || r.k === 'pedestrian') ? 'p' : 'c');
    const parent = bws.map((_, i) => i);
    const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
    const byEnd = new Map();
    const endKey = (c, cx, cz) => c + '|' + cx + ':' + cz;
    bws.forEach((r, i) => {
      for (const p of [r.p[0], r.p[r.p.length - 1]]) {
        const cx = Math.round(p[0] / 2), cz = Math.round(p[1] / 2);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            const k = endKey(cls[i], cx + dx, cz + dz);
            if (byEnd.has(k)) union(i, byEnd.get(k).i);
          }
        }
        // COUNT DISTINCT FRAGMENTS, NOT ENDPOINTS. A CLOSED RING starts and
        // ends at the same coordinate, so counting endpoints saw two arrivals
        // there and called it a junction — which meant a ring-shaped bridge
        // never had a terminal and never got an approach ramp.
        //
        // The Sentosa Boardwalk is exactly that: ONE pedestrian way, bridge=1,
        // 34 points, running out and back to -1118,11456. Its deck sat at
        // runMax+1.2 for its whole length with a hard 2.5m drop where it meets
        // the land, on the walk every visitor arrives by (measured: every
        // floating point and four of the five worst steps in
        // data/trailcheck.mjs were this one way). One way touching a point is
        // a landing however many of its own ends arrive there.
        const k0 = endKey(cls[i], cx, cz);
        const e = byEnd.get(k0);
        if (e) { e.frags.add(i); } else byEnd.set(k0, { i, frags: new Set([i]), x: p[0], z: p[1] });
      }
    });
    const runMax = new Map(), runTerms = new Map();
    bws.forEach((r, i) => {
      const root = find(i);
      let d = runMax.get(root) || 0;
      for (const q of r.p) d = Math.max(d, TERRAIN.at(q[0], q[1]));
      runMax.set(root, d);
    });
    for (const e of byEnd.values()) {
      // an endpoint only ONE fragment touches is where the run meets the land
      if (e.frags.size === 1) {
        const tH = TERRAIN.at(e.x, e.z);
        // ...unless the "land" there is open water: a scenery-cut bridge (the
        // Gateway stub toward HarbourFront stops at the clip margin) has no
        // landing, and a ramp would dive the deck into the sea at the cut.
        // A cut bridge ends level, the way a drawbridge does.
        const g0 = TERRAIN.grid && TERRAIN.grid();
        const seaLv = g0 && typeof g0.sea === 'number' ? g0.sea : null;
        if ((seaLv !== null && tH <= seaLv + 0.6)
            || (TERRAIN.waterFloor && TERRAIN.waterFloor(e.x, e.z) !== null)) continue;
        const root = find(e.i);
        if (!runTerms.has(root)) runTerms.set(root, []);
        runTerms.get(root).push([e.x, e.z, tH]);
      }
    }
    // A BRIDGE THAT IS NEVER IN THE AIR IS A ROAD.
    //
    // `deck` is one flat height for a whole run: max terrain along it + 1.2m.
    // That is right for a viaduct and wrong for a street that OSM happens to
    // tag bridge=yes over a culvert or a buried service duct — and Siloso
    // Beach Walk is tagged exactly that way. The run then floats a tan
    // carriageway, its kerbs and its double yellows a metre over the ground
    // for its whole length, with no piers under it (the pier pass separately
    // decides those spans are "too low to be in the air" and skips them). That
    // is the floating road in the owner's 2026-08-05 screenshot, and the
    // reason paint measured 0.85m proud of the ground beside the plaza.
    //
    // So ask the question the pier pass already asks, once per RUN: does this
    // deck ever achieve real clearance anywhere along itself? If it never
    // does, it is not a bridge — it is a road, and it follows the ground like
    // one. A genuine viaduct is untouched: one segment with clearance is
    // enough to keep the whole run flat, which is what a viaduct that comes
    // down to grade at its abutments needs.
    const runAloft = new Map();
    bws.forEach((r, i) => {
      const root = find(i);
      if (runAloft.get(root)) return;
      const deck0 = runMax.get(root) + 1.2;
      for (const q of r.p) {
        // A CROSSING OVER WATER IS ALWAYS A BRIDGE, whatever the arithmetic
        // says. TERRAIN.at over a causeway reads the made ground it sits on,
        // so the clearance test can decide the Sentosa Gateway — the road
        // every visitor arrives on — is at grade and drop its deck, soffit and
        // piers into the strait. Whether a span is high enough to need piers
        // is a judgement; whether it is over water is a fact, and the fact
        // wins.
        if (TERRAIN.waterFloor && TERRAIN.waterFloor(q[0], q[1]) !== null) {
          runAloft.set(root, true); break;
        }
        if (deck0 - DECK_T - TERRAIN.at(q[0], q[1]) >= LOW_CLEAR) { runAloft.set(root, true); break; }
      }
      if (!runAloft.has(root)) runAloft.set(root, false);
    });
    const RAMP = 20;
    bws.forEach((r, i) => {
      const root = find(i);
      if (!runAloft.get(root)) { BRDECK.set(r, false); return; }
      const deck = runMax.get(root) + 1.2;
      const terms = runTerms.get(root) || [];
      const f = (x, z) => {
        let h = deck;
        for (const [tx, tz, tH] of terms) {
          const target = tH + 0.06;
          if (deck - target <= 1.2) continue;         // natural abutment, no ramp needed
          const d = Math.hypot(x - tx, z - tz);
          if (d < RAMP) h = Math.min(h, target + (deck - target) * (d / RAMP));
        }
        return h;
      };
      f.deck = deck;
      BRDECK.set(r, f);
    });
  }
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
    // A footbridge over the sea is still a bridge, for the one question W2
    // asks. It is NOT registered as something to stand on — see FOOTBRIDGES.
    if (r.bridge && isPath) {
      addFootbridgeWay(r.p, r.w || 3);
      // A PROMOTED CAUSEWAY FOOTPATH IS WALKED AT DECK LEVEL. Footbridge
      // decks deliberately never reach surfaceAt (a rider does not belong on
      // a 2m footbridge) — but on the causeway that left the walker draped
      // at TERRAIN inside the neighbouring road deck, buried to the helmet
      // (sweep w_-1096_11883, P0). The pontoon-crossing registry is exactly
      // the walked-deck mechanism, so causeway footpaths register there.
      if (/causeway/.test(r.ws || '') && BRDECK.get(r)) {
        const f = BRDECK.get(r);
        for (let i = 0; i < r.p.length - 1; i++) {
          const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
          const yd = f ? f((x1 + x2) / 2, (z1 + z2) / 2) : TERRAIN.at(x1, z1) + 1.2;
          addWalkSurface(x1, z1, x2, z2, Math.max(1.2, (r.w || 3) / 2), yd + 0.06);
        }
      }
    }
    // BRDECK === false means the run was judged at grade above and is being
    // drawn on the ground. It must not register a deck OR grow soffits and
    // parapets: passing that `false` through as a height registered a standable
    // deck at zero, and paintcheck went from 870 offenders to 11,352 with paint
    // measuring 11m proud of a surface that had collapsed to sea level.
    if (r.bridge && !isPath && (r.w || 0) >= 5.5 && BRDECK.get(r) !== false) {
      // The deck height comes back from the registry rather than being worked
      // out again here: ribbon() already computes the same `max terrain + 1.2`
      // independently, and a third copy of that rule is a third thing to drift.
      bridgeFabric(r.p, r.w, addBridgeWay(r.p, r.w, BRDECK.get(r)), bridgeGeos, pierGeos, r.n);
    }
    const g = ribbon(r.p, r.w, y, r.bridge ? (BRDECK.get(r) ?? true) : false);
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
    // THE BEACH WALKS ARE PROMENADES, NOT CARRIAGEWAYS. Siloso Beach Walk is
    // 19 ways here: 12 untagged, 6 asphalt, 1 sett — and the untagged ones
    // were drawing as lane-marked tarmac along the beachfront. Every
    // reference frame (research/ref-siloso/walk.jpg) shows grey brick unit
    // paving. Where OSM is silent the authored layer decides, and it decides
    // pavers; where OSM says asphalt outright (the service stretches) the
    // map wins, as always.
    if (PROMENADE(r) && !/asphalt|tarmac/.test(sf)) bucket = unitPaveGeos;
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
        // THE PAINT VERIFIES ITSELF HERE TOO.
        //
        // The streetRuns consumer below samples its kerb line and refuses to
        // paint a side whose line has wandered off the carriageway. This
        // branch never did, and it is the branch that produced the owner's
        // 2026-08-05 frame: double yellows running across grass and plaza
        // beside Beach Arrival Plaza with no carriageway under them at all.
        // A bridge way that runs on past its deck takes its paint with it.
        // Same rule, same threshold: sample at 3m, and if more than a fifth
        // of that side is off the road, do not paint that side.
        {
          const kerbOff = sgn * (r.w / 2 - 0.45);
          let acc3 = 0, off3 = 0, tot3 = 0;
          for (let i2 = 0; i2 < r.p.length - 1 && tot3 < 60; i2++) {
            const dx3 = r.p[i2 + 1][0] - r.p[i2][0], dz3 = r.p[i2 + 1][1] - r.p[i2][1];
            const L3 = Math.hypot(dx3, dz3) || 1;
            for (; acc3 < L3; acc3 += 3) {
              const t3 = acc3 / L3;
              const px3 = r.p[i2][0] + dx3 * t3 + (-dz3 / L3) * kerbOff;
              const pz3 = r.p[i2][1] + dz3 * t3 + (dx3 / L3) * kerbOff;
              tot3++;
              if (window.__onRoad && !window.__onRoad(px3, pz3, -0.05)) off3++;
            }
            acc3 -= L3;
          }
          if (tot3 && off3 / tot3 > 0.2) continue;
        }
        for (const inset of [0.45, 0.70]) {
          const off = sgn * (r.w / 2 - inset);
          // THE PAINT TAKES THE DECK'S OWN HEIGHT, not a guess at it.
          //
          // This passed a bare `true`, which sends ribbon() down its fallback
          // path: deck = max(TERRAIN.at) along the way + 1.2. The TARMAC three
          // lines up takes `BRDECK.get(r)` — the height the deck registry
          // actually measured — so the road and the lines painted on it were
          // computed from two different rules, and the comment at the tarmac
          // call says in as many words that a second copy of the rule is "a
          // third thing to drift". It drifted.
          //
          // Measured 2026-08-05, island-wide: the worst marking vertices on
          // the island are all on bridge ways, up to 1.27m out — buried under
          // the deck where the registry sits higher than the guess, standing
          // proud of it where it sits lower. A line standing 1.2m proud of the
          // surface cuts a walking figure across the chest, which is the frame
          // the owner sent.
          const yg = ribbonOffset(r.p, 0.10, 0.087, off, BRDECK.get(r) ?? true);
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
        && (r.w || 0) >= 5.5 && !r.bridge && !PROMENADE(r),
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
        && !axisNames.has((r.n || '').toLowerCase()) && !PROMENADE(r),
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
    // COPY BY VERTEX COUNT, NOT BY ARRAY LENGTH.
    //
    // `total` is summed from position.count, but the copy walked
    // position.array.length. Those are the same number only while every
    // geometry's buffer is exactly the size of its vertex count — and when one
    // is not, the write offsets drift and the tail of the merged buffer stays
    // ZERO. Zeroed vertices are the world origin, so the layer grows a sliver
    // of triangles reaching from wherever it is to (0,0,0): data/paintcheck.mjs
    // reported a road marking at (0,0), and there is no road there and no
    // source geometry within a kilometre of it (checked, 2026-08-05).
    //
    // Clamping to count*3 also means a mismatched geometry loses its own tail
    // rather than corrupting every layer merged after it. UVs are guarded
    // separately: a geometry without them would otherwise throw here.
    for (const g of geos) {
      const pa = g.attributes.position;
      pos.set(pa.array.subarray(0, pa.count * 3), o);
      o += pa.count * 3;
      const ua = g.attributes.uv;
      if (ua) uv.set(ua.array.subarray(0, Math.min(ua.count, pa.count) * 2), ou);
      ou += pa.count * 2;
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
  // THE BRIDGE FABRIC. Named `bridgeDeck`, not `roadSurface`: P1b exempts the
  // road surface because a road being where the road is cannot be a defect,
  // and a parapet is NOT that — it is real structure and should be checked
  // like any other. It sits outside the carriageway, so it passes on merit.
  merge(bridgeGeos, MAT.roadConc, 'bridgeDeck');
  merge(pierGeos, MAT.conc, 'bridgePier');
  // SAY WHAT WAS DROPPED. A bent with nowhere clear to stand is skipped, and a
  // silent skip reads as "every viaduct got its piers" when it did not.
  if (BRIDGE_PIERS.built || BRIDGE_PIERS.skipped || BRIDGE_PIERS.atGrade) {
    console.log(`  bridge fabric: ${BRIDGE_PIERS.built} bents built, `
      + `${BRIDGE_PIERS.nudged} moved along the deck to clear a road, `
      + `${BRIDGE_PIERS.skipped} skipped with nowhere clear to stand, `
      + `${BRIDGE_PIERS.atGrade} spans left bare as too low to be in the air`);
  }
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
  // `low` marks UNDERGROWTH: the traffic-clearance crown lift below is a
  // street-tree rule (double-deckers pass under a pruned avenue), and applying
  // it to a 0.3-scale shrub turned every bush into a bare 6m pole — 667 of
  // them vanished into the jungle canopy before this flag existed. A low
  // plant keeps its crown where a bush keeps it: on the ground.
  // NOR INSIDE A BUILDING, and for the same reason it is guarded HERE.
  //
  // Every planting pass already tests something before calling this — place(),
  // isBlocked(), the jungle fill's own guard — and between them they still let
  // fifteen trunks through into buildings at Sentosa Cove, which D6 and D37
  // have been reporting ever since. The footprints they stand in are small
  // (60 and 188 m2) and a small footprint is exactly what a per-pass test is
  // most likely to miss, because each pass samples at its own spacing.
  //
  // One test at the single choke point covers every caller and cannot be
  // forgotten by the next pass somebody writes — the same argument the water
  // guard above was written on, and the water guard has never regressed.
  add(x, z, scale = 1, low = false) {
    if (window.__inWater && window.__inWater(x, z)) return;
    if (window.__inFootprint && window.__inFootprint(x, z)) return;
    if (window.__underCanopy && window.__underCanopy(x, z)) return;
    this.items.push([x, z, scale, low]);
    // AND THE CHASE CAMERA NEEDS TO KNOW WHERE THE TRUNKS ARE. Trees are
    // InstancedMeshes and solid.js deliberately skips those, so a trunk is
    // invisible to every collision test in the world — which is right for
    // MOVEMENT (riding into a bush should not stop you) and wrong for the
    // CAMERA, which sits 3.45m behind you and ends up inside one. The
    // 2026-08-05 golden frame at RWS came back with a third of the screen
    // solid black: a trunk, in the lens.
    //
    // A coarse 16m spatial hash, written at the one choke point every
    // planting pass already goes through, so no future pass can forget it.
    // Undergrowth is skipped — a 0.4-scale bush sits below the lens.
    if (!low && scale >= 0.5) {
      const IX = (window.__treeIx = window.__treeIx || new Map());
      const k = (Math.floor(x / 16) + 4096) * 8192 + (Math.floor(z / 16) + 4096);
      let a = IX.get(k);
      if (!a) IX.set(k, a = []);
      a.push(x, z, scale);
    }
  }
  // build() stays SYNCHRONOUS and buildY() yields between trees — both walk
  // the same per-tree body (_tree) in the same order, so the placement RNG
  // sequence is identical and determinism is untouched. buildY exists because
  // the surveyed park layer is the largest single unyielded block in a chunk
  // build: 52 instance matrices per tree, and tanjongrhu carries 8,284 trees
  // (~431k composes in one gulp — most of the 'water' step's measured 570 to
  // 650ms block, 2026-08-03). Sync callers (dressStreet, dressSideStreets)
  // keep build(): a sync caller that fired an async build and moved on would
  // interleave the RNG stream with later dressing, which IS a determinism
  // break — the split makes that mistake unwritable.
  build(world) {
    const c = this._prep();
    if (!c) return 0;
    for (let i = 0; i < this.items.length; i++) this._tree(c, i);
    return this._finish(c, world);
  }
  async buildY(world, Y = null) {
    const c = this._prep();
    if (!c) return 0;
    let _t = performance.now();
    for (let i = 0; i < this.items.length; i++) {
      this._tree(c, i);
      if (Y && performance.now() - _t > 8) { await Y(); _t = performance.now(); }
    }
    return this._finish(c, world);
  }
  _prep() {
    const n = this.items.length;
    if (!n) return null;
    const CARDS = 40, BLOBS = 7, BRANCH = 5;
    // PHONES DRAW 24 OF THE 40 LEAF CARDS — but every tree still COMPUTES
    // all 40, consuming the identical RNG sequence, so the world's placement
    // stream (which the determinism gate fingerprints) is byte-identical on
    // every device; only how many of the same cards reach the GPU differs.
    // Foliage is the classic fill-rate cost on a phone GPU and the canopy at
    // 24 cards still reads as a canopy (owner-approved trade, 2026-08-03).
    const CARDS_DRAWN = TOUCH ? 24 : CARDS;
    const trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.30, 0.62, 1, 8), MAT.trunk, n);
    const branches = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.06, 0.22, 1, 5), MAT.trunk, n * BRANCH);
    const blobs = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0), MAT.canopy, n * BLOBS);
    const cards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 0.55), MAT.leaf, n * CARDS_DRAWN);
    trunks.castShadow = branches.castShadow = blobs.castShadow = cards.castShadow = true;
    // THE ONLY RELIABLE WAY TO KNOW A TRUNK IS A TRUNK. D6 and D37 both used
    // to find trees by geometry signature -- a tapered instanced cylinder in a
    // radius band -- and asserted in a comment that nothing else in the world
    // shared it. Colonnade piers, structural columns and canopy posts all do.
    // Measured 2026-08-01: 5,255 'trunks' in Robertson against 266 real trees,
    // and six building columns reported as trees growing through walls.
    trunks.userData.treeTrunk = true;
    // AND THE FOLIAGE, BY MECHANISM. A leaf card is a 1 x 0.55 plane and some
    // of them lie nearly flat a few millimetres off the ground on a low tree —
    // which is indistinguishable, by shape, from a road marking. P7 ("road
    // markings under the tarmac") duly reported one at 4mm and blocked a
    // deploy. Marked here rather than exempted by geometry parameters, for the
    // reason the comment directly above already gives: D6 and D37 both tried
    // to identify trees by signature and both were wrong.
    cards.userData.treeFoliage = true;
    blobs.userData.treeFoliage = true;
    branches.userData.treeFoliage = true;

    return {
      BLOBS, BRANCH, CARDS, CARDS_DRAWN, trunks, branches, blobs, cards,
      m: new THREE.Matrix4(), e: new THREE.Euler(), q: new THREE.Quaternion(),
      p: new THREE.Vector3(), sc: new THREE.Vector3(),
      bi: 0, li: 0, ci: 0,
    };
  }
  _tree(c, i) {
    const [x, z, scale, low] = this.items[i];
    const { BLOBS, BRANCH, CARDS, trunks, branches, blobs, cards, m, e, q, p, sc } = c;
    {
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
      const LIFT = low ? 0 : 6.0;      // undergrowth is not pruned for buses
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
      // ...AND THEY STILL SHOWED. The two rules above are right and were not
      // enough: a branch springing from crownBase sits at the BOTTOM of the
      // dome, where there is little foliage under it, so from a rider's eye it
      // is silhouetted against the sky as a bare brown spoke. Counted across
      // the 126-frame coverage sweep, it is the single most repeated ugliness
      // on the island — visible on almost every tree-lined road.
      //
      // Two changes, both toward the same rule the comment already states:
      // spring from a quarter of the way UP the dome instead of its underside,
      // and shorten the reach so the tip is well inside the leaf cards rather
      // than level with their outer edge.
      const crownDepth = Math.max(1.5, (h - crownBase));
      for (let k = 0; k < BRANCH; k++) {
        const a = (k / BRANCH) * Math.PI * 2 + rand(-0.35, 0.35);
        const L = rad * rand(0.30, 0.46);
        const tilt = rand(1.32, 1.52);          // radians from vertical: near flat
        p.set(x + Math.cos(a) * L * 0.42,
              gy + crownBase + crownDepth * 0.26 + rand(-0.3, 0.5),
              z + Math.sin(a) * L * 0.42);
        e.set(Math.cos(a) * tilt, 0, -Math.sin(a) * tilt);
        q.setFromEuler(e); sc.set(scale, L, scale);
        m.compose(p, q, sc); branches.setMatrixAt(c.bi++, m);
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
        m.compose(p, q, sc); blobs.setMatrixAt(c.li++, m);
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
        // every card COMPUTES (the RNG draws above must happen for all 40 —
        // see CARDS_DRAWN in _prep); only the first CARDS_DRAWN are written
        if (k < c.CARDS_DRAWN) { m.compose(p, q, sc); cards.setMatrixAt(c.ci++, m); }
      }
    }
  }
  _finish(c, world) {
    c.branches.count = c.bi; c.blobs.count = c.li; c.cards.count = c.ci;
    world.add(c.trunks, c.branches, c.blobs, c.cards);
    return this.items.length;
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
// THE OPEN SEA, FROM THE HEIGHTFIELD (2026-08-03, "make sentosa like
// sentosa"). The mapped water polygons cover only what OSM traced — on
// Sentosa that is a rectangle of the channel, and the island's own south
// coast ended in grey ground. The terrain knows the sea everywhere (Copernicus
// reads ~-2m over open water), so a coastal district gets ONE large sheet at
// sea level: the island rises out of it and the coastline draws itself.
// Built only when the heightfield actually contains open water (an inland
// district keeps zero extra fill); two triangles, so the cost is fill-rate
// where sea is genuinely visible and nothing anywhere else.
// THE OPEN SEA WAS NEVER ONCE DRAWN (found 2026-08-03, from the owner's "i
// really dont see it looking like sentosa"). This function tested the
// heightfield for cells below -0.4 — but terrain.py REBASES the whole grid by
// its own minimum on the last line of the build (`base = min(h)`), so every
// height it ships is >= 0 and the test can never be true. Measured on
// sentosa: min 0, base -4, cells below -0.4 = ZERO, so buildSea returned 0 on
// every district in the world, every time.
//
// What that looked like: terrain.py sinks open water to -2.0, which the -4
// rebase carries to +2.0 — so 9,569 of sentosa's 14,210 cells (67% of the
// map) are a FLAT PLAIN AT 2.0 with no water on it, and the beaches, eased to
// a 4.8/7.0/9.5 profile, rise off that plain like a quarry. The island had no
// sea; the only water anywhere was the one rectangle OSM traced in the
// channel. It also explains four failed attempts at swim-flag placement:
// nothing could find a waterline because there was no waterline.
//
// The fix is to read the level terrain.py actually used instead of assuming
// one. New grids carry `sea` outright; older cached chunks are reconstructed
// from the sink constant and their own recorded `base`, so this works without
// re-running the terrain build for all fifteen districts.
const SEA_SINK = -2.0;                            // terrain.py's open-water level, pre-rebase
// set by buildSea when a district has open water; read by buildWater so a
// mapped ring cannot sit BELOW the sea it is part of (measured on sentosa: the
// channel polygon levelled at 1.6 against a sea sheet at 2.18, which puts a
// 0.6m step across water that is one body in life)
const SEA_LEVEL = [null];
function buildSea(world) {
  const g = TERRAIN.grid && TERRAIN.grid();
  if (!g) return 0;
  // ONLY a grid that carries `sea` outright. The level is derivable from
  // `base` alone, but drawing a sea over a district whose terrain has NOT been
  // rebuilt with the road/building protection floods it — measured on sentosa
  // before the rebuild: 966 road points and 41 buildings under water. So the
  // sea arrives district by district, as each one's terrain is rebuilt and
  // gated, and an un-rebuilt district looks exactly as it did yesterday.
  const seaLevel = typeof g.sea === 'number' ? g.sea : null;
  if (seaLevel === null) return 0;
  let wet = 0;
  const wetAt = seaLevel + 0.4;
  for (let i = 0; i < g.h.length; i++) if (g.h[i] <= wetAt) wet++;
  if (wet / g.h.length < 0.04) return 0;         // no meaningful open water
  // just clear of the sunk bed, so the sheet covers it rather than z-fighting
  const SEA_Y = seaLevel + 0.18;
  const M = 2200;                                 // reach past the surround
  const x0 = g.x0 - M, z0 = g.z0 - M;
  const x1 = g.x0 + g.cell * g.nx + M, z1 = g.z0 + g.cell * g.nz + M;
  // AND IT FACED THE SEABED, exactly like buildWater's ShapeGeometry did (the
  // long note below). Walking the corners (x0,z0) -> (x1,z0) -> (x1,z1) with Y
  // up winds CLOCKWISE seen from above, so computeVertexNormals pointed every
  // normal at -Y and a FrontSide material showed nothing to a camera above the
  // water. Two independent bugs were hiding this sheet: it was never built,
  // and it would have been invisible if it had been. Corners are wound the
  // other way round here rather than flipped afterwards.
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array([x1, SEA_Y, z1, x1, SEA_Y, z0, x0, SEA_Y, z0,
                                x0, SEA_Y, z1, x1, SEA_Y, z1, x0, SEA_Y, z0]);
  const uv = new Float32Array([x1 / 24, z1 / 24, x1 / 24, z0 / 24, x0 / 24, z0 / 24,
                               x0 / 24, z1 / 24, x1 / 24, z1 / 24, x0 / 24, z0 / 24]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  // THE LAGOON IS NOT THE ANCHORAGE. Every reference frame of Siloso
  // (research/ref-siloso/strip.jpg is the clearest) shows two waters: jade
  // over the sandy swim lagoons inside the groynes, dark silty teal beyond
  // them where the ships sit. One flat colour is the single biggest reason
  // the coast reads as "wet pavement". The boundary between the two is,
  // physically, DEPTH — shallow sand floor near the shore — so the tint is
  // keyed to distance-from-land over the sea cells of the heightfield: a
  // multi-source BFS out from land, baked to a one-channel texture the sea
  // shader samples by world position. Past ~4 cells (140m) the open colour
  // wins outright, which is about where the real buoy lines and groyne
  // mouths sit. Colours are observed from the reference frames, not
  // published — same standing as MAT.openSea's own note.
  {
    const W = g.nx, H = g.nz, cap = 5;
    const dist = new Uint8Array(W * H).fill(cap);
    const q = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (g.h[j * W + i] > wetAt) { dist[j * W + i] = 0; q.push(j * W + i); }
    }
    for (let head = 0; head < q.length; head++) {
      const k = q[head], d = dist[k];
      if (d >= cap) continue;
      const i = k % W, j = (k - i) / W;
      for (const [ni, nj] of [[i-1,j],[i+1,j],[i,j-1],[i,j+1]]) {
        if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
        const nk = nj * W + ni;
        if (dist[nk] > d + 1) { dist[nk] = d + 1; q.push(nk); }
      }
    }
    const px = new Uint8Array(W * H);
    for (let k = 0; k < W * H; k++) px[k] = Math.round(255 * dist[k] / cap);
    const shoreTex = new THREE.DataTexture(px, W, H, THREE.RedFormat, THREE.UnsignedByteType);
    shoreTex.magFilter = THREE.LinearFilter;
    shoreTex.minFilter = THREE.LinearFilter;
    shoreTex.wrapS = shoreTex.wrapT = THREE.ClampToEdgeWrapping;
    shoreTex.needsUpdate = true;
    MAT.openSea.onBeforeCompile = (sh) => {
      sh.uniforms.uShore = { value: shoreTex };
      sh.uniforms.uGrid = { value: new THREE.Vector4(g.x0, g.z0, g.cell * g.nx, g.cell * g.nz) };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vSeaW;')
        .replace('#include <worldpos_vertex>',
                 '#include <worldpos_vertex>\nvSeaW = (modelMatrix * vec4(position, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>',
                 '#include <common>\nvarying vec3 vSeaW;\nuniform sampler2D uShore;\nuniform vec4 uGrid;')
        .replace('#include <map_fragment>', `#include <map_fragment>
        {
          vec2 uvg = clamp((vSeaW.xz - uGrid.xy) / uGrid.zw, 0.0, 1.0);
          float d = texture2D(uShore, uvg).r;
          float lag = 1.0 - smoothstep(0.22, 0.8, d);
          // jade #3f9e90 in linear terms; mixed, never replaced, so the wave
          // texture keeps reading through the shallows
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.048, 0.34, 0.27), lag * 0.8);
        }`);
    };
    MAT.openSea.needsUpdate = true;
  }
  const mesh = new THREE.Mesh(geo, MAT.openSea);
  mesh.name = 'seaSurface';
  mesh.receiveShadow = false;
  // behind the mapped rings, which are the same body of water drawn finer
  mesh.renderOrder = -2;
  world.add(mesh);
  SEA_LEVEL[0] = SEA_Y;
  return 1;
}

export function buildWater(world, data) {
  const polys = data.water || [];
  const sea = buildSea(world);
  if (!polys.length) return { water: 0, waterArea: 0, sea };
  const geos = [];
  let area = 0;
  for (const w of polys) {
    const pts = w.p;
    if (pts.length < 4) continue;
    // DO NOT DRAW THE SEA TWICE.
    //
    // buildSea() lays one sheet for the open water, with the marine colour and
    // the wave shader. The mapped layer ALSO carries the sea — on Sentosa two
    // `natural=water, water=sea` polygons of 11.2 and 10.5 km2 — and the rule
    // below deliberately floats a mapped ring 2cm ABOVE the sheet so the finer
    // geometry wins. That is right for a river or a lagoon and wrong for the
    // ocean: the same water then gets drawn twice, in two different colours
    // (#5a8296 sheet, #8fa9a8 ring), 2cm apart. Ridden over the Sentosa
    // Gateway it is the whole harbour in pale grey-green bands with polygon
    // edges across it, which is the first thing a player sees arriving.
    //
    // The sheet IS the sea. A mapped ring that says it is the sea is saying
    // the same thing, so it has nothing to add.
    if (sea && w.k === 'sea') continue;
    // the rim: the lowest ground around the edge is the waterline
    let lo = Infinity;
    for (const [x, z] of pts) {
      const g = TERRAIN.at(x, z);
      if (g < lo) lo = g;
    }
    if (!isFinite(lo)) continue;
    // the rim rule is right for a reservoir held behind a barrage; on a coast
    // it can put a mapped ring BELOW the open sea it opens into, which draws a
    // step across one body of water. The sea wins where there is a sea.
    // +2cm, not equal: coplanar with the sea sheet the two z-fight across the
    // whole channel, and the finer mapped ring is the one that should win
    const level = SEA_LEVEL[0] === null ? lo - 0.35 : Math.max(lo - 0.35, SEA_LEVEL[0] + 0.02);
    // A GIANT INLAND RING IS A MULTIPOLYGON THAT LOST ITS PARTS, and filling
    // it solid paints the LAND between its ponds. Sentosa carries one such
    // ring — 10.4 hectares, unnamed — and its single sheet at the lowest
    // pond's level surfaced as cyan patches on lawns in ~27 of 404 sweep
    // frames (2026-08-04). The honest fill for a big ring: keep only the
    // cells whose ground actually lies below the water level. Small rings
    // (a real pond fits its own rim) keep the exact shape.
    if ((w.a || 0) > 20000) {
      const STEP2 = 12;
      const xs = pts.map((q) => q[0]), zs = pts.map((q) => q[1]);
      const x0r = Math.min(...xs), x1r = Math.max(...xs);
      const z0r = Math.min(...zs), z1r = Math.max(...zs);
      const insideRing = (px, pz) => {
        let c = false;
        for (let i2 = 0, j2 = pts.length - 1; i2 < pts.length; j2 = i2++) {
          const [xi, zi] = pts[i2], [xj, zj] = pts[j2];
          if ((zi > pz) !== (zj > pz) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi) c = !c;
        }
        return c;
      };
      const cells = [];
      for (let gx = x0r; gx < x1r; gx += STEP2) {
        for (let gz = z0r; gz < z1r; gz += STEP2) {
          const mx = gx + STEP2 / 2, mz = gz + STEP2 / 2;
          if (!insideRing(mx, mz)) continue;
          if (TERRAIN.at(mx, mz) > level + 0.15) continue;   // dry land, no sheet
          const q = new THREE.PlaneGeometry(STEP2 + 0.4, STEP2 + 0.4);
          q.rotateX(-Math.PI / 2);
          q.translate(mx, level, mz);
          const uv2 = q.attributes.uv;
          for (let i2 = 0; i2 < uv2.count; i2++) uv2.setXY(i2, (mx + uv2.getX(i2)) / 24, (mz + uv2.getY(i2)) / 24);
          cells.push(q);
        }
      }
      for (const q of cells) geos.push(q);
      area += w.a || 0;
      continue;
    }
    const geo = new THREE.ShapeGeometry(shapeFrom(pts));
    // THE WATER WAS FACING DOWNWARDS AND NOBODY COULD SEE IT.
    //
    // ShapeGeometry builds in the XY plane with its normal at +Z. rotateX(+90)
    // maps the shape correctly into the XZ plane -- (x, y, 0) becomes
    // (x, 0, y), which is why the polygon lands in the right PLACE -- but it
    // also carries +Z to -Y, so every triangle ended up pointing at the seabed.
    // The material is FrontSide, so from any camera above the water there was
    // nothing there: you saw straight through to the bed.
    //
    // Measured on Robertson 2026-08-01: 43 triangles spanning the river's full
    // bounding box, and a downward ray hit the surface at 0 of 319 points
    // inside the ring. It has presumably been invisible since the layer was
    // written; it went unnoticed because the terrain was ALSO covering the
    // river, so a missing water surface and a buried one look identical.
    //
    // Flipping the rotation is NOT the fix -- rotateX(-90) sends y to -z and
    // mirrors the polygon into the wrong half of the world. Reverse the
    // winding instead, which turns the faces over where they already are.
    geo.rotateX(Math.PI / 2);
    const idx = geo.index;
    if (idx) {
      const a = idx.array;
      for (let i = 0; i < a.length; i += 3) { const t = a[i]; a[i] = a[i + 2]; a[i + 2] = t; }
      idx.needsUpdate = true;
    }
    geo.computeVertexNormals();
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

// PIERS AND JETTIES, the structures that make a quay a quay.
//
// Marina Bay, Clarke Quay and Robertson Quay are quays and had none of them.
// A pier stands OVER water, so it takes its level from the water it sits in
// rather than from the terrain beneath — the terrain under a pier is the
// SEABED, and seating a deck on it would put the jetty at the bottom of the
// bay. Same two-datums trap as the bridge decks; the answer is the same, ask
// the right surface.
export function buildPiers(world, data) {
  const polys = data.piers || [];
  if (!polys.length) return { piers: 0 };
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xa89a86, roughness: 0.9 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6f6a62, roughness: 0.85 });
  const geos = [], edges = [];
  for (const p of polys) {
    const pts = p.p;
    if (pts.length < 4) continue;
    // A MARINA PIER NEVER CROSSES A STREET. The Cove's ~126 private jetties
    // abut the island loop roads, and one traced ring reached into the
    // carriageway raster — its 0.45m lip became "structure in a carriageway"
    // (P1b, first full-island audit). A ring touching a road keeps its deck
    // and drops the lip; the deck is flat at water level and blocks nothing.
    let lipOK = true;
    for (const [qx, qz] of pts) {
      if (window.__onRoad && window.__onRoad(qx, qz, 0.2)) { lipOK = false; break; }
    }
    // the rim of the water it stands in, read the same way buildWater does
    let lo = Infinity;
    for (const [x, z] of pts) {
      const g = TERRAIN.at(x, z);
      if (g < lo) lo = g;
    }
    if (!isFinite(lo)) continue;
    const level = lo + 1.15;                 // a working deck sits above the rim
    const g1 = new THREE.ShapeGeometry(shapeFrom(pts));
    g1.rotateX(Math.PI / 2);
    g1.translate(0, level, 0);
    geos.push(g1);
    // a lip round the edge so it reads as a structure rather than a painted area
    if (lipOK) {
      const g2 = extrudeGeo(pts, 0.45, 0);
      g2.translate(0, level - 0.45 - (FOOT !== null ? FOOT : 0), 0);
      edges.push(g2);
    }
  }
  if (!geos.length) return { piers: 0 };
  const deck = new THREE.Mesh(mergeGeos(geos), deckMat);
  deck.name = 'pierDeck';
  deck.receiveShadow = true;
  world.add(deck);
  const lip = new THREE.Mesh(mergeGeos(edges), edgeMat);
  lip.name = 'pierEdge';
  lip.castShadow = false; lip.receiveShadow = true;
  world.add(lip);
  return { piers: geos.length };
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
// THE SURVEYED TREES. Every district scene has carried a `trees` list since the
// first build -- OSM `natural=tree` nodes and tree_row lines, 449 of them in
// Orchard alone -- and NOTHING IN THE WORLD HAS EVER READ IT. The only trees
// ever drawn came from the avenue walk in markings.js, which plants one every
// 44 metres along a road it is dressing. So every tree in the world stood on a
// street, and the parks were bald: the Istana's forty hectares had nine trees
// on it, all of them on the perimeter road.
//
// Found by planting park trees in process.py, rebuilding, and getting a frame
// that was pixel-identical to the one before. A layer that is written and never
// read looks exactly like a layer that works.
//
// Planted ONCE per district and not per axis -- the list is the whole scene, so
// inside the axis loop a two-axis district would grow two trees per node. Same
// trap as buildParkedCars.
export async function plantSurveyed(world, data, blocked, Y = null) {
  const list = data.trees || [];
  const f = new TreeField();
  let surveyed = 0;
  // THE ZIP LINE'S FLIGHT CORRIDOR IS KEPT CLEAR, HERE, WHERE THE JUNGLE IS
  // ACTUALLY MADE.
  //
  // data/zipline.py clears surveyed trees from the corridor, and that removed
  // twenty-one of them and changed nothing you could see — because the jungle
  // on Imbiah is not surveyed. It is FILLED procedurally from the wood
  // polygons a few lines below, so clearing the data layer cleared the wrong
  // trees. Rendered from the harness, the ride was still a tour of the inside
  // of a tree.
  //
  // A wire sags and cannot arch over a canopy, so the corridor is the only
  // honest fix, and it has to be applied to whatever plants the trees.
  // THE TRAIL ITSELF IS NOT PLANTABLE.
  //
  // The wood fill guards on blocked(), which knows roads, buildings and water
  // — and a FOOTPATH is none of those, so nothing stopped a 12m tree being
  // planted in the middle of a forest trail. Walked, there is a trunk standing
  // in the path; you cannot pass it and it is the least natural thing in the
  // world. A real trail is a gap in the trees, which is what makes it a trail.
  //
  // Built here rather than in the undergrowth block below, because BOTH the
  // canopy fill and the undergrowth need it and the undergrowth block owned
  // the only copy.
  const trailSegs = [];
  for (const r of (data.roads || [])) {
    if (r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'path' && r.k !== 'steps') continue;
    const tp = r.p || [];
    for (let i = 0; i < tp.length - 1; i++) {
      trailSegs.push([tp[i][0], tp[i][1], tp[i + 1][0], tp[i + 1][1]]);
    }
  }
  // INDEXED, because this is called once per candidate PLANT.
  //
  // The first version scanned every trail segment on the island for every tree
  // the wood fill considered — Sentosa has thousands of footway segments and
  // the fill considers thousands of positions, so it was tens of millions of
  // distance solves inside the boot. A 24m grid bucket turns each query into a
  // look at nine cells.
  const TCELL = 24;
  const trailGrid = new Map();
  for (const seg of trailSegs) {
    const [ax, az, bx, bz] = seg;
    const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx);
    const z0 = Math.min(az, bz), z1 = Math.max(az, bz);
    for (let gx = Math.floor(x0 / TCELL); gx <= Math.floor(x1 / TCELL); gx++) {
      for (let gz = Math.floor(z0 / TCELL); gz <= Math.floor(z1 / TCELL); gz++) {
        const k = gx + ',' + gz;
        let l = trailGrid.get(k);
        if (!l) { l = []; trailGrid.set(k, l); }
        l.push(seg);
      }
    }
  }
  const trailDist2 = (x, z) => {
    let best = Infinity;
    const cx = Math.floor(x / TCELL), cz = Math.floor(z / TCELL);
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gz = cz - 1; gz <= cz + 1; gz++) {
        const l = trailGrid.get(gx + ',' + gz);
        if (!l) continue;
        for (const [ax, az, bx, bz] of l) {
          const vx = bx - ax, vz = bz - az;
          const l2 = vx * vx + vz * vz || 1;
          let t = ((x - ax) * vx + (z - az) * vz) / l2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = x - (ax + vx * t), dz = z - (az + vz * t);
          const d2 = dx * dx + dz * dz;
          if (d2 < best) best = d2;
        }
      }
    }
    return best;
  };
  const onTrail = (x, z) => trailDist2(x, z) < 3.4 * 3.4;

  const zip = data.zipline;
  const ZIP_CLEAR = 15.0;
  // A LUGE RUNS THROUGH THE JUNGLE, NOT THROUGH TREE TRUNKS.
  //
  // The MegaZip already has a corridor below and the luge never did, and the
  // luge is the one you actually ride down. Measured: 136 of the 147 mapped
  // luge vertices fall inside a k='wood' polygon, which is exactly where the
  // jungle fill plants on an 11m grid, and 71 of them have a SURVEYED tree
  // within 6m as well. So the island's signature ride descends through a
  // plantation, with trunks standing on the track.
  //
  // Same shape as inZipCorridor: bucket the segments and test nine cells.
  // 5.5m of clearance — the track is about 3m wide and a crown overhangs.
  const LUGE_CLEAR = 5.5;
  const _lugeSegs = [];
  for (const a of (data.attractions || [])) {
    if (a.k !== 'summer_toboggan' || !a.g || a.g.length < 2) continue;
    for (let i = 0; i < a.g.length - 1; i++) {
      _lugeSegs.push([a.g[i][0], a.g[i][1], a.g[i + 1][0], a.g[i + 1][1]]);
    }
  }
  const _LCELL = 24;
  const _lGrid = new Map();
  for (const s of _lugeSegs) {
    const pad = LUGE_CLEAR + 1;
    for (let gx = Math.floor((Math.min(s[0], s[2]) - pad) / _LCELL);
         gx <= Math.floor((Math.max(s[0], s[2]) + pad) / _LCELL); gx++) {
      for (let gz = Math.floor((Math.min(s[1], s[3]) - pad) / _LCELL);
           gz <= Math.floor((Math.max(s[1], s[3]) + pad) / _LCELL); gz++) {
        const k = gx + ',' + gz;
        let l = _lGrid.get(k);
        if (!l) { l = []; _lGrid.set(k, l); }
        l.push(s);
      }
    }
  }
  const inLugeCorridor = !_lugeSegs.length ? () => false : (x, z) => {
    const cx = Math.floor(x / _LCELL), cz = Math.floor(z / _LCELL);
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gz = cz - 1; gz <= cz + 1; gz++) {
        const l = _lGrid.get(gx + ',' + gz);
        if (!l) continue;
        for (const [ax, az, bx, bz] of l) {
          const vx = bx - ax, vz = bz - az;
          const L2 = vx * vx + vz * vz || 1;
          let t = ((x - ax) * vx + (z - az) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = x - (ax + vx * t), dz = z - (az + vz * t);
          if (dx * dx + dz * dz < LUGE_CLEAR * LUGE_CLEAR) return true;
        }
      }
    }
    return false;
  };

  const inZipCorridor = (!zip || !zip.p) ? () => false : (x, z) => {
    const [[ax, az], [bx, bz]] = zip.p;
    const vx = bx - ax, vz = bz - az;
    const wx = x - ax, wz = z - az;
    const L2 = vx * vx + vz * vz;
    const t = L2 ? Math.max(0, Math.min(1, (wx * vx + wz * vz) / L2)) : 0;
    return Math.hypot(ax + t * vx - x, az + t * vz - z) < ZIP_CLEAR;
  };
  // A SURVEYED TREE ON THE SAND IS A PALM, AND IT IS DRAWN ONCE.
  // buildBeachLife draws the beach trees with a palm form, so planting them
  // here as well would put a generic crown inside every palm. The rings are
  // read from the same layer buildBeachLife reads, so the two cannot disagree
  // about which trees belong to the beach.
  const sandRings = (data.green || [])
    .filter((g) => g.k === 'sand' && g.p && g.p.length >= 4).map((g) => g.p);
  const inRingP = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  const edgeOfP = (x, z, pts) => {
    let best = 1e9;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], c = pts[(i + 1) % pts.length];
      const vx = c[0] - a[0], vz = c[1] - a[1];
      const L2 = vx * vx + vz * vz || 1;
      let t = ((x - a[0]) * vx + (z - a[1]) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      best = Math.min(best, Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)));
    }
    return best;
  };
  for (const t of list) {
    const x = t[0], z = t[1];
    // The street walk already planted its own trees off the kerb line, and a
    // surveyed node within a crown radius of one is the same tree twice.
    if (blocked && blocked(x, z)) continue;
    // 45m of a sand edge, matching buildBeachLife: those trees are drawn there
    // with the coconut form and would otherwise get a second inland crown
    if (sandRings.some((p) => inRingP(x, z, p) || edgeOfP(x, z, p) <= 45)) continue;
    if (inZipCorridor(x, z) || inLugeCorridor(x, z)) continue;
    if (onTrail(x, z)) continue;
    // Park trees are older and bigger than the pruned street stock; the scale
    // spread is wider so a wood does not read as a plantation.
    f.add(x, z, 0.7 + ((x * 7.3 + z * 3.1) % 100) / 250);
    surveyed++;
  }
  // THE JUNGLE IS DENSE (island pass, 2026-08-03). A mapped wood is full of
  // trees, not the handful OSM happened to survey — Imbiah's slopes carried
  // 23 natural=wood polygons and read as lawn with occasional specimens.
  // Fill k='wood' polygons on a jittered 16m grid: positions are
  // DETERMINISTIC from the position hash (the same device-independent trick
  // as the scale spread above), never from the placement RNG streams, so
  // determinism gates are untouched. blocked() keeps the fill off roads,
  // buildings and street trees; instanced leaf cards + LOD carry the cost
  // (phones cull past 280m and draw 24/40 cards).
  let jungle = 0;
  const inRing = (x, z, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i], [xj, zj] = pts[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  for (const gp of (data.green || [])) {
    if (gp.k !== 'wood' || !gp.p || gp.p.length < 4) continue;
    let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const [x, z] of gp.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    // 11m, NOT 16m — and the scale spread widened.
    //
    // Set against reference photographs of Siloso (the owner: "cannot seem to
    // get it like sentosa"), the single clearest difference was not a landmark
    // at all: the real beach has a DENSE, DARK, LAYERED canopy mass behind it
    // and this world had a thin row of evenly spaced identical trees, reading
    // as an orchard on a lawn. A 16m grid over a mapped wood is a plantation;
    // the jungle is continuous. 11m roughly doubles the count inside woods
    // only — the survey says a wood is full of trees, so filling one densely is
    // reporting it, not inventing it, and nothing outside a wood polygon is
    // touched.
    //
    // The scale spread matters as much as the count. Sizes ran 0.75-1.25 and
    // came out as one repeated tree; 0.55-1.5 gives an understorey and emergent
    // crowns, which is what makes a canopy read as depth rather than as a row.
    for (let gx = Math.ceil(mnx / 11) * 11; gx < mxx; gx += 11) {
      for (let gz = Math.ceil(mnz / 11) * 11; gz < mxz; gz += 11) {
        const jx = gx + (((gx * 13.7 + gz * 5.3) % 9) - 4.5);
        const jz = gz + (((gx * 3.9 + gz * 11.1) % 9) - 4.5);
        if (!inRing(jx, jz, gp.p)) continue;
        if (blocked && blocked(jx, jz)) continue;
        if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz)) continue;
        if (onTrail(jx, jz)) continue;
        // top of the spread held at ~1.38, not 1.5: at 1.5 the tallest crown
        // put a leaf card 19.6m up and P3 ("props off the ground") refused the
        // deploy on it. The understorey is what the canopy needed anyway — the
        // gain is at the BOTTOM of this range, not the top.
        f.add(jx, jz, 0.55 + ((jx * 7.3 + jz * 3.1) % 100) / 120);
        jungle++;
      }
    }
  }
  // THE FOREST EDGE GROWS OUTWARD (owner mandate, 2026-08-04 night: "there
  // are a lot more trees... resorts are supposed to be hidden in forest...
  // cannot be like a bare and empty land"). The ground BETWEEN mapped woods
  // is painted vegetation by the terrain fallback but PLANTED with nothing,
  // so a resort behind a thin mapped wood stands in full view across open
  // lawn that is dense jungle in life. A bounded halo — unclaimed ground
  // within 25m of a wood ring, 12m jittered grid, same deterministic hash —
  // knits the woods into the continuous mass the satellite shows, without
  // planting a single tree on mapped lawns, golf, sand or anything built.
  let halo = 0;
  // THE ATTRACTIONS KEEP THEIR CLEARING. The two fills below invent planting
  // on ground OSM never classified — which is the right default on a jungle
  // island and the wrong one on the places people come to look at. The
  // 2026-08-05 golden frame at Fort Siloso came back with a 6-inch coastal
  // gun aiming into a wall of trees and no sea behind it: a battery has a
  // field of fire by definition, a viewpoint has a view by definition, and an
  // artwork is placed to be seen. Each gets a clearing; the woods still close
  // in immediately beyond it, so the mandate ("resorts hidden in forest,
  // cannot be bare and empty land") is untouched.
  //
  // MAPPED woods are NOT filtered by this — if OSM says there are trees
  // there, there are trees there. Only the invented planting defers.
  const CLEARING_R = {
    cannon: 26, fort: 34, viewpoint: 32, ruins: 20,
    castle: 22, museum: 20, artwork: 14, city_gate: 18,
  };
  const clearings = [];
  for (const a of (data.attractions || [])) {
    const r = CLEARING_R[a.k];
    if (!r || !a.p || typeof a.p[0] !== 'number') continue;
    clearings.push([a.p[0], a.p[1], r * r]);
  }
  const inClearing = (x, z) => {
    for (let i = 0; i < clearings.length; i++) {
      const dx = x - clearings[i][0], dz = z - clearings[i][1];
      if (dx * dx + dz * dz < clearings[i][2]) return true;
    }
    return false;
  };
  {
    const claimed = (data.green || []).filter((g2) => g2.k !== 'wood' && g2.p && g2.p.length > 3);
    const inClaimed = (x, z) => {
      for (const g2 of claimed) if (inRing(x, z, g2.p)) return true;
      return false;
    };
    const nearRing = (x, z, pts, d) => {
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const ax = pts[j][0], az = pts[j][1], bx = pts[i][0], bz = pts[i][1];
        const vx = bx - ax, vz = bz - az;
        const l2 = vx * vx + vz * vz || 1;
        let t = ((x - ax) * vx + (z - az) * vz) / l2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const dx = x - (ax + vx * t), dz = z - (az + vz * t);
        if (dx * dx + dz * dz < d * d) return true;
      }
      return false;
    };
    for (const gp of (data.green || [])) {
      if (gp.k !== 'wood' || !gp.p || gp.p.length < 4) continue;
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of gp.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      for (let gx = Math.ceil((mnx - 25) / 12) * 12; gx < mxx + 25; gx += 12) {
        for (let gz = Math.ceil((mnz - 25) / 12) * 12; gz < mxz + 25; gz += 12) {
          const jx = gx + (((gx * 11.3 + gz * 7.7) % 9) - 4.5);
          const jz = gz + (((gx * 5.1 + gz * 13.9) % 9) - 4.5);
          if (inRing(jx, jz, gp.p)) continue;              // inside is already planted
          if (!nearRing(jx, jz, gp.p, 25)) continue;
          if (blocked && blocked(jx, jz)) continue;
          if (inClaimed(jx, jz)) continue;                 // mapped lawn/golf/sand stays
          if (inClearing(jx, jz)) continue;                // guns, viewpoints, artworks
          if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz)) continue;
          if (onTrail(jx, jz)) continue;
          if (window.__underCanopy && window.__underCanopy(jx, jz)) continue;
          f.add(jx, jz, 0.5 + ((jx * 7.3 + jz * 3.1) % 100) / 140);
          halo++;
        }
      }
    }
    // ...AND THE UNMAPPED SLOPES ARE FOREST, NOT LAWN. The terrain fallback
    // already PAINTS unclassified ground as vegetation on a green island
    // (greenFrac > 0.35) — but nothing PLANTED it, so whole hillsides
    // (most of Imbiah's slopes render from that fallback) stood as bare
    // green with the resorts in full view. Same rule, applied to planting:
    // unclaimed, unblocked ground gets canopy on a sparse 15m grid.
    // Bounded to within 130m of a mapped way so the cost lands where a
    // player can stand — the perf gate (heapMB 380 / trisK 1600) is the
    // arbiter, and the fill prints its count so nothing is silent.
    {
      const wayCell = 64;
      const wayGrid = new Set();
      for (const r of (data.roads || [])) {
        for (const q of (r.p || [])) {
          const cx = Math.floor(q[0] / wayCell), cz = Math.floor(q[1] / wayCell);
          for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) wayGrid.add((cx + a) + ',' + (cz + b));
        }
      }
      const nearWays = (x, z) => wayGrid.has(Math.floor(x / wayCell) + ',' + Math.floor(z / wayCell));
      const greens = (data.green || []).filter((g2) => g2.p && g2.p.length > 3);
      const inAnyGreen = (x, z) => {
        for (const g2 of greens) if (inRing(x, z, g2.p)) return g2.k;
        return null;
      };
      // a mapped plaza, car park or works parcel is not forest either
      const lands = (data.land || []).filter((l2) => l2.p && l2.p.length > 3);
      const inLand = (x, z) => {
        for (const l2 of lands) if (inRing(x, z, l2.p)) return true;
        return false;
      };
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const c of (data.coast || [])) {
        for (const q of (c.p || [])) {
          if (q[0] < mnx) mnx = q[0]; if (q[0] > mxx) mxx = q[0];
          if (q[1] < mnz) mnz = q[1]; if (q[1] > mxz) mxz = q[1];
        }
      }
      if (mnx < mxx) {
        for (let gx = Math.ceil(mnx / 15) * 15; gx < mxx; gx += 15) {
          for (let gz = Math.ceil(mnz / 15) * 15; gz < mxz; gz += 15) {
            const jx = gx + (((gx * 9.7 + gz * 6.1) % 11) - 5.5);
            const jz = gz + (((gx * 4.3 + gz * 12.7) % 11) - 5.5);
            if (!nearWays(jx, jz)) continue;
            if (blocked && blocked(jx, jz)) continue;
            const gk = inAnyGreen(jx, jz);
            if (gk !== null) continue;    // mapped lawn/golf/sand/wood all handled elsewhere
            if (inLand(jx, jz)) continue; // plazas, car parks, works parcels stay open
            if (inClearing(jx, jz)) continue;   // guns, viewpoints, artworks
            if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz)) continue;
            if (onTrail(jx, jz)) continue;
            if (window.__underCanopy && window.__underCanopy(jx, jz)) continue;
            if (window.__inFootprint && window.__inFootprint(jx, jz)) continue;
            f.add(jx, jz, 0.5 + ((jx * 7.3 + jz * 3.1) % 100) / 150);
            halo++;
          }
        }
      }
    }
  }
  // UNDERGROWTH WHERE PLAYERS WALK. Filling every wood with shrubs would
  // cost more fill-rate than the jungle itself; a walker only sees the floor
  // beside the trail. So: small clumps (scale 0.28-0.45 trees read as shrub
  // masses) within 22m of a footway that passes through or beside a wood,
  // 9m jittered grid, same deterministic position-hash. Sentosa measured:
  // hundreds, not thousands.
  let shrubs = 0;
  {
    // ONE trail index for the whole function — the canopy fill needs it too,
    // and two copies drift.
    //
    // THE BAND IS TIGHTER AND THE WALL IS CLOSER (2026-08-04). It was "clear of
    // 4m, inside 15m", which leaves a four-metre skirt of bare mown ground on
    // both sides of every jungle path: walked, the trail reads as a lawn with
    // columns on it rather than a way THROUGH something. The owner: "those
    // trails also must be immersive if forest, like thru the forest feeling."
    //
    // A real forest path is walled — the cut edge is where the undergrowth
    // starts, not four metres away. 2.6m clear (enough that nothing overhangs
    // the walking surface) out to 17m, so the green closes in behind you.
    const nearTrail = (x, z) => {
      const d2 = trailDist2(x, z);
      return d2 < 17 * 17 && d2 > 2.6 * 2.6;
    };
    for (const gp of (data.green || [])) {
      if (gp.k !== 'wood' || !gp.p || gp.p.length < 4) continue;
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of gp.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      // 13m -> 7m. A 13m grid puts one shrub clump every 13 metres, which is
      // scattered planting, not undergrowth; walked, you see between them to
      // open ground and the forest reads as a park. 7m closes the floor while
      // staying instanced and LOD-capped, and it only ever fills the band
      // beside a trail, which is the only place a walker sees the floor.
      for (let gx = Math.ceil(mnx / 7) * 7; gx < mxx; gx += 7) {
        for (let gz = Math.ceil(mnz / 7) * 7; gz < mxz; gz += 7) {
          const jx = gx + (((gx * 9.1 + gz * 4.7) % 10) - 5);
          const jz = gz + (((gx * 5.9 + gz * 7.7) % 10) - 5);
          if (!inRing(jx, jz, gp.p)) continue;
          if (!nearTrail(jx, jz)) continue;
          if (blocked && blocked(jx, jz)) continue;
          if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz)) continue;
          if (onTrail(jx, jz)) continue;
          // A LOW plant's limbs sit at 1.5-3m — the traffic envelope. A
          // full tree over a road is an avenue (crown lifted 6m by rule);
          // a sapling beside one is an obstruction: the widened box put 28
          // of them in Allanbrooke Road's raster (P1, probed: branch
          // centres 2.4-3.4m up, foliage=true). Low plants stand off ANY
          // carriageway by their own reach.
          if (window.__onRoad && window.__onRoad(jx, jz, 3)) continue;
          f.add(jx, jz, 0.28 + ((jx * 6.1 + jz * 2.9) % 100) / 590, true);
          if (window.__shrubDbg) window.__shrubDbg.push([jx | 0, jz | 0]);
          shrubs++;
        }
      }
    }
  }
  if (!surveyed && !jungle && !halo && !shrubs) return { surveyedTrees: 0, jungleTrees: 0, haloTrees: 0, shrubClumps: 0 };
  const built = await f.buildY(world, Y);
  return { surveyedTrees: built - jungle - halo - shrubs, jungleTrees: jungle, haloTrees: halo, shrubClumps: shrubs };
}

// THE KEPPEL QUAY CRANES — the district's horizon, and it was empty sky.
//
// 25 `man_made=crane` nodes stand along the Keppel quay. They were never in
// the world because the fetch never asked for the tag; see the note in
// build_district.py. research/keppel-landmarks.md §6.3: "from a bike on Keppel
// Road, at 500-800m and 50m tall, this crane line is the horizon. Not
// modelling it is the biggest single visual omission in the district."
//
// PROVENANCE, CARRIED INTO THE CODE BECAUSE IT IS PART OF THE FACT:
//   52m lift height and 70m outreach are the PSA FLEET figures published by
//   the WSH Council, NOT Keppel-specific ones. The brief is explicit about
//   that and about what is UNPUBLISHED: boom-up height, gantry rail gauge and
//   RTG heights. None of those are invented here — the boom is drawn level,
//   which is what a working crane's boom does, and the rail gauge is taken
//   from the leg spread rather than claimed as a measurement.
//
//   THE COLOUR IS UNPUBLISHED AND IS NOT GUESSED. The brief says there is no
//   PSA livery document in the public domain and "do not assert PSA blue", so
//   these are structural grey with a hazard band — the one thing every quay
//   crane on earth has — rather than a brand nobody published.
//
// Drawn as ONE merged geometry for the whole line: 25 cranes of ~20 pieces is
// 500 draws if each is a mesh, and this is a distant silhouette.
export function buildCranes(world, data) {
  const list = data.cranes || [];
  if (!list.length) return { cranes: 0 };
  // Published: 52m lift height, 70m outreach (PSA FLEET). Everything else here
  // is proportion chosen to make the silhouette read, not a claimed figure:
  // the rail gauge, the back-reach and the A-frame height are UNPUBLISHED for
  // Keppel and are named as shape, not as measurement.
  const LIFT = 52, OUTREACH = 70, GAUGE = 30, BACKREACH = 24, APEX = 20, SPAN = 18;
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.62, metalness: 0.35 });
  const hazard = new THREE.MeshStandardMaterial({ color: 0xd6a12a, roughness: 0.7 });
  const parts = [], bands = [];
  let n = 0;
  for (const c of list) {
    const [cx, cz] = c.p;
    const yaw = c.a || 0;                            // bearing of the boom, seaward
    const gy = TERRAIN.at(cx, cz);
    const fx = Math.sin(yaw), fz = Math.cos(yaw);    // seaward
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);   // along the quay
    // A point in the crane's own frame: f seaward, s along the quay, y up.
    const P = (f, s, y) => [cx + fx * f + rx * s, gy + y, cz + fz * f + rz * s];
    // A MEMBER BETWEEN TWO POINTS, so nothing can be disconnected from the
    // joint it starts at. The first version placed every piece by an offset
    // and a guessed angle, and its own vet frame showed the result: a table
    // with a bare mast on it and four sticks floating at the wrong angles.
    const strut = (a, b, w, h) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const L = Math.hypot(dx, dy, dz) || 1e-6;
      const g = new THREE.BoxGeometry(w, h || w, L).toNonIndexed();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(dx / L, dy / L, dz / L));
      g.applyQuaternion(q);
      g.translate(a[0] + dx / 2, a[1] + dy / 2, a[2] + dz / 2);
      parts.push(g);
    };
    const WS = GAUGE / 2, LS = -GAUGE / 2;           // waterside / landside rails
    // THE PORTAL. Four legs on two rails, tall enough for trains and trucks to
    // pass beneath — that is what makes it a portal rather than a tower.
    for (const s of [-SPAN / 2, SPAN / 2]) {
      strut(P(WS, s, 0), P(WS, s, LIFT), 2.0);
      strut(P(LS, s, 0), P(LS, s, LIFT), 2.0);
      strut(P(WS, s, 16), P(LS, s, 16), 1.4);        // portal beam
      strut(P(WS, s, LIFT - 2), P(LS, s, LIFT - 2), 1.6);
      // sill beams and bogies at the foot
      for (const f of [WS, LS]) {
        const g = new THREE.BoxGeometry(3.4, 2.2, 2.6).toNonIndexed();
        g.rotateY(yaw);
        const q2 = P(f, s, 1.1); g.translate(q2[0], q2[1], q2[2]);
        parts.push(g);
        const b2 = new THREE.BoxGeometry(1.7, 2.8, 1.7).toNonIndexed();
        b2.rotateY(yaw);
        const q3 = P(f, s, 5.2); b2.translate(q3[0], q3[1], q3[2]);
        bands.push(b2);
      }
    }
    // cross-bracing between the two portal frames, so it is not two flat A's
    strut(P(WS, -SPAN / 2, LIFT - 2), P(WS, SPAN / 2, LIFT - 2), 1.2);
    strut(P(LS, -SPAN / 2, LIFT - 2), P(LS, SPAN / 2, LIFT - 2), 1.2);
    // THE BOOM. One girder from the back-reach tip out to the published 70m
    // outreach beyond the waterside rail — drawn as a single member so its two
    // ends cannot disagree about the height they meet at.
    const tip = P(WS + OUTREACH, 0, LIFT + 1.5);
    const heel = P(LS - BACKREACH, 0, LIFT + 1.5);
    for (const s of [-2.6, 2.6]) {
      strut(P(WS + OUTREACH, s, LIFT + 1.5), P(LS - BACKREACH, s, LIFT + 1.5), 1.5, 2.4);
    }
    // THE A-FRAME, which is the shape you actually read at 800m: a triangle
    // standing over the portal with stays running to each end of the boom.
    const apex = P(0, 0, LIFT + APEX);
    strut(P(WS, -SPAN / 2, LIFT), apex, 1.5);
    strut(P(WS, SPAN / 2, LIFT), apex, 1.5);
    strut(P(LS, -SPAN / 2, LIFT), apex, 1.5);
    strut(P(LS, SPAN / 2, LIFT), apex, 1.5);
    strut(apex, tip, 1.0);                            // forestay to the boom tip
    strut(apex, heel, 1.0);                           // backstay to the heel
    // machinery house on the landside, and the trolley parked out over the berth
    const house = new THREE.BoxGeometry(11, 6.5, SPAN).toNonIndexed();
    house.rotateY(yaw);
    const hp = P(LS - 6, 0, LIFT + 6); house.translate(hp[0], hp[1], hp[2]);
    parts.push(house);
    const trolley = new THREE.BoxGeometry(4.4, 3.0, 4.0).toNonIndexed();
    trolley.rotateY(yaw);
    const tp = P(WS + OUTREACH * 0.45, 0, LIFT - 1.0); trolley.translate(tp[0], tp[1], tp[2]);
    parts.push(trolley);
    n++;
  }
  const emit = (geos, mat, name) => {
    if (!geos.length) return;
    let total = 0;
    for (const g of geos) total += g.attributes.position.count;
    const pos = new Float32Array(total * 3), uv = new Float32Array(total * 2);
    let o = 0, ou = 0;
    // COPY BY VERTEX COUNT, NOT BY ARRAY LENGTH.
    //
    // `total` is summed from position.count, but the copy walked
    // position.array.length. Those are the same number only while every
    // geometry's buffer is exactly the size of its vertex count — and when one
    // is not, the write offsets drift and the tail of the merged buffer stays
    // ZERO. Zeroed vertices are the world origin, so the layer grows a sliver
    // of triangles reaching from wherever it is to (0,0,0): data/paintcheck.mjs
    // reported a road marking at (0,0), and there is no road there and no
    // source geometry within a kilometre of it (checked, 2026-08-05).
    //
    // Clamping to count*3 also means a mismatched geometry loses its own tail
    // rather than corrupting every layer merged after it. UVs are guarded
    // separately: a geometry without them would otherwise throw here.
    for (const g of geos) {
      const pa = g.attributes.position;
      pos.set(pa.array.subarray(0, pa.count * 3), o);
      o += pa.count * 3;
      const ua = g.attributes.uv;
      if (ua) uv.set(ua.array.subarray(0, Math.min(ua.count, pa.count) * 2), ou);
      ou += pa.count * 2;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    m.computeVertexNormals();
    const mesh = new THREE.Mesh(m, mat);
    // Named so W2 can tell a quay crane from something that fell in the sea.
    // A quay crane stands ON the wharf and reaches OVER the water — that is
    // what makes it a quay crane, and it is the same argument this project
    // already accepted for piers and for bridge decks.
    mesh.name = name;
    mesh.castShadow = true;
    world.add(mesh);
  };
  emit(parts, steel, 'quayCrane');
  emit(bands, hazard, 'quayCrane');
  return { cranes: n };
}

// A SUPERTREE GROWS IN A GROVE, AND ONLY IN ONE PLACE.
//
// This function drew EVERY mapped `man_made=tower` node as a Gardens by the
// Bay supertree, anywhere in the world. On sentosa that put six of them on the
// island — one standing on Siloso Beach, 50m of Marina Bay landmark on the
// sand (vetted, shots/street/shore.shot2). The island's towers are the
// SkyHelix, the bungy tower and communications masts; not one is a supertree.
//
// The data cannot tell them apart: `towers` carries position, height and
// radius and no name at all. What DOES separate them is that the supertrees
// are a GROVE — eighteen of them inside a couple of hundred metres — while
// every other district's towers are scattered across it. Measured: marinabay's
// cluster spans ~220m; sentosa's twelve are spread over more than a kilometre,
// the closest pair a kilometre from the next. So the test is the grove itself,
// which is a property of the real thing rather than a guess about it.
//
// The right long-term fix is for process.py to carry the tower's name so the
// grove is identified rather than inferred; this is the honest test until then.
const GROVE_REACH = 250;      // metres — Gardens by the Bay's cluster is ~220m across
const GROVE_MIN = 6;          // neighbours within reach before a tower is a supertree
// THE TOWERS NOBODY DREW.
//
// buildSupertrees above answers one question — "is this the Gardens by the Bay
// grove?" — and answers it correctly: Sentosa's twelve `man_made=tower` are
// spread over more than a kilometre, so the grove test rejects every one of
// them and nothing is drawn. That is right for supertrees and wrong for the
// island, because those twelve are real structures standing in real places:
// the SkyHelix mast, the megazip and zipline towers, the masts above Siloso
// Point. D39 ("a scene layer written but never drawn") has been reporting the
// whole layer as dead for as long as the island has existed.
//
// SURVEYED: position, height and radius, all from the map. AUTHORED: that it
// is drawn as a tapered open lattice, which is what most man_made=tower is and
// is the honest shape to give one whose name we do not have. Nothing here
// claims to be a named ride — a tower we cannot name gets a tower, not a guess.
export function buildTowers(world, data, taken) {
  const all = data.towers || [];
  if (!all.length) return { towers: 0 };
  const skip = taken || new Set();
  const legMat = new THREE.MeshStandardMaterial({ color: 0x8d9196, roughness: 0.55, metalness: 0.35 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xb0b5b8, roughness: 0.6, metalness: 0.2 });
  // A TOWER THAT IS ALREADY A RIDE MUST NOT GET A SECOND STRUCTURE.
  //
  // Vetted the first version: `man_made=tower` at -1750,12352 IS the SkyHelix,
  // which rides.js already builds as a white mast with its red gondola ring —
  // and the generic lattice went up around it, two structures in one place.
  // Same for the megazip and zipline masts, which zipline.py builds. So a
  // tower standing on top of something we have already drawn is skipped: it is
  // the same real object arriving twice, not two objects.
  const built = [];
  for (const a of (data.attractions || [])) {
    const k = (a.k || '') + ' ' + (a.n || '');
    if (!/zip|helix|cable|luge|tower|bungee/i.test(k)) continue;
    const p = a.p;
    if (Array.isArray(p) && p.length && !Array.isArray(p[0])) built.push([p[0], p[1]]);
  }
  for (const zt of (data.zipline && data.zipline.towers) || []) {
    if (Array.isArray(zt) && zt.length >= 2) built.push([zt[0], zt[1]]);
  }
  const onSomething = (x, z) => built.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < 40);

  let n = 0;
  for (const t of all) {
    const [x, z] = t.p;
    if (skip.has(x + ',' + z)) continue;
    if (onSomething(x, z)) continue;
    const H = Math.max(8, t.h || 25);
    const R = Math.max(1.6, Math.min(9, t.r || 3));
    const g0 = groundAt(x, z);
    const LEGS = 4;
    const topR = R * 0.42;                 // a mast tapers; a box does not read as one
    const legs = [];
    for (let i = 0; i < LEGS; i++) {
      const a = (i / LEGS) * Math.PI * 2 + Math.PI / 4;
      const bx = x + Math.cos(a) * R, bz = z + Math.sin(a) * R;
      const tx = x + Math.cos(a) * topR, tz = z + Math.sin(a) * topR;
      legs.push([bx, bz, tx, tz]);
      const len = Math.hypot(tx - bx, H, tz - bz);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.26, len, 6), legMat);
      leg.position.set((bx + tx) / 2, g0 + H / 2, (bz + tz) / 2);
      const run = Math.hypot(tx - bx, tz - bz);
      leg.rotation.z = Math.atan2(run, H);
      leg.rotation.y = -Math.atan2(tz - bz, tx - bx);
      leg.castShadow = true;
      world.add(leg);
    }
    // bracing rings, spaced so the lattice reads from the ground rather than
    // becoming a solid-looking pole at distance
    const RINGS = Math.max(2, Math.round(H / 7));
    for (let r2 = 1; r2 <= RINGS; r2++) {
      const u = r2 / (RINGS + 1);
      const rr = R + (topR - R) * u;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.10, 4, LEGS * 2), legMat);
      ring.position.set(x, g0 + H * u, z);
      ring.rotation.x = Math.PI / 2;
      world.add(ring);
    }
    // a platform on top: every one of these carries something — a ride head, an
    // aerial, a lookout — and a mast that stops in mid-air reads as unfinished
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(topR * 1.9, topR * 1.5, 1.5, 10), deckMat);
    cap.position.set(x, g0 + H + 0.75, z);
    cap.castShadow = true;
    world.add(cap);
    n++;
  }
  return { towers: n };
}

export function buildSupertrees(world, data) {
  const all = data.towers || [];
  const list = all.filter((t) => {
    let near = 0;
    for (const o of all) {
      if (o === t) continue;
      if (Math.hypot(o.p[0] - t.p[0], o.p[1] - t.p[1]) <= GROVE_REACH) near++;
    }
    return near >= GROVE_MIN;
  });
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
