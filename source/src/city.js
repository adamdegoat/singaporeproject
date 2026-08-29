// Build the street from real OSM geometry: extruded footprints, road ribbons,
// pavements, canopy trees, covered walkway, crossings, street furniture.
import * as THREE from '../lib/three.module.js';
import { TOUCH } from './input.js';
// ONE NUMBER, ONE HOME. The ribbon's end overhang is a fact the placement
// index has to know as exactly as the drawing code does — see the note beside
// it in roads.js, and the two stray trees it cost.
import { ROAD_END_EXT } from './roads.js';
import { buildQTrees } from './qtrees.js';
import { scatterVerges, scatterFoundations } from './qground.js';
import { PAL, R, rand, pick, chance, hex, texAsphalt, texPaving, texConcrete, texCurtain, texShopfront, texGranite, texGranitePanel, texTactile, texWater, texTowerGlass, texPunched, texBalcony, texShophouse, texRender, texRenderShow, texAshlar, texSalvage, texBoard, texPoleFrame, texGlyphBand, texLeaves, texAO, texCentrepointPanel, texRedBrick, texPeranakan, texPaverBlock, texCentreDash, texChevron, texSotaRibbons, rng, scopeDraws, texBoomBand} from './tex.js';
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
// Painted render WITH openings, on a white base so a tint lands exactly on the
// surveyed colour — see the note at texRender(). Two variants: dark glazing
// for the villas and the Cove, and a greener shutter for the garrison stock.
const RENDER_TEX = texRender(false);
const RENDER_TEX_SHUTTER = texRender(true);
// a painted ride shed: panel joints, plinth, service doors, no window grid
const RENDER_TEX_SHOW = texRenderShow();
// ANCIENT EGYPT IS COURSED STONE, NOT PAINTED PANEL. Its show walls carried
// texRenderShow like every other zone's, and under the zone's dark sampled
// ochre that texture's 0.22-alpha joints are invisible: photographed head-on,
// a three-storey wall with nothing on it but the 12m tile seam. See texAshlar.
// Keyed by tint so each of the zone's three sampled stones keeps its own map.
// TWO STONES, ONE DRAWING. Egypt is large-format ashlar (§4: "the joint grid
// *is* the texture"); New York is "face brick with real coursing" (§6, and the
// same section is explicit that the tone change BETWEEN buildings is the whole
// trick — which the zone tint already gives us, one map per sampled tone).
//
// New York gets brick COURSING and no openings. §6's relief vocabulary leads
// with window rhythm, and that is deliberately NOT built: the show-building
// pass removed window grids from this park on purpose (see the long note at
// _inUss), and putting them back on a hunch would undo a researched decision.
// The coursing is the material; the openings are a separate, owner-level call.
const _COURSED = new Map();
const COURSING = {
  ashlar: [3, 2, 3.6, 1.0],     // 1.2m stones, hard joints        — Egypt
  brick: [16, 6, 2.4, 0.45],    // 0.15m courses, soft joints      — New York
  // §7: "Cast limestone ashlar with expressed coursing, laid in regular NARROW
  // courses that curve around the drum towers. The coursing on a cylinder is
  // what makes the towers read as stone rather than as tubes." Narrower than
  // Egypt's large format and a softer joint — cast stone, not quarried block.
  limestone: [7, 3, 3.0, 0.7],  // 0.43m courses                   — Far Far Away
};
// WaterWorld is not coursed anything — it is a patchwork of salvaged sheets,
// so it gets its own drawing and ignores the tint entirely (the brief's whole
// point is that no two sheets match). One map, shared.
let _SALVAGE = null;
// The Lost World is not coursed anything either — it is a LASHED POLE FRAME
// over board infill (§5A: "the zone's single strongest motif"), drawn in its
// own stained-timber colours, so it ignores the zone tint the same way the
// salvage patchwork does. One map, shared.
let _POLE = null;
const coursedTex = (tint, kind) => {
  if (kind === 'salvage') {
    if (!_SALVAGE) _SALVAGE = texSalvage();
    return _SALVAGE;
  }
  if (kind === 'pole') {
    if (!_POLE) _POLE = texPoleFrame();
    return _POLE;
  }
  if (kind === 'board') {
    const bk = 'b' + tint;
    let bt = _COURSED.get(bk);
    if (!bt) { bt = texBoard(tint); _COURSED.set(bk, bt); }
    return bt;
  }
  const key = tint + '|' + kind;
  let t = _COURSED.get(key);
  if (!t) { t = texAshlar(tint, ...COURSING[kind]); _COURSED.set(key, t); }
  return t;
};
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
const NOROOFKIT = new URLSearchParams(location.search).has('noroofkit');   // A/B the small-roof plant kit
const NOROOFCAP = new URLSearchParams(location.search).has('noroofcap');   // A/B the roof cap itself
// A/B the 2026-08-24 tree guards, so data/treecheck.mjs can be proven to bite
const OLDTREEGUARD = new URLSearchParams(location.search).has('oldtreeguard');
// what the cap decision did, per build — the lamp pass earned this the hard
// way: count from the placement, never from the scene graph.
const _CAPDBG = (window.__roofCapDbg = { capped: 0, lifted: 0, grown: 0, small: 0,
  deckOnly: 0, bare: { canopy: 0, 'own roof': 0, tiny: 0, low: 0, 'thin lift': 0 },
  // every footprint over 1,000 m2 that ends up WITHOUT a closed top, named
  // by where it stands — the only way to tell a big bare roof from a
  // building that simply never reached this pass
  bigBare: [] });
// ...AND THE DECISION FOR EVERY FOOTPRINT, not a histogram of them.
// `bare` counts five reasons and `bigBare` names the ones over 300 m2, and
// between them they still could not answer the only question roofcheck ever
// asks: "this ROOF has the wall texture on it — why?" The counters said the
// cap declined 4 canopies and 12 tiny tops; roofcheck said 20 roofs are bad,
// including a 352 m2 residential and two 305 m2 hotel masses. Neither list
// could be joined to the other. Keyed by the footprint's FIRST VERTEX, which
// data/roofcheck.mjs reads out of the same sentosa.json, so the join is exact
// rather than a nearest-centroid guess.
// Same shape as __lampRej and __plateRej: name the reason, per thing.
const _CAPWHY = (window.__roofCapWhy = {});
const _capKey = (b) => `${Math.round(b.p[0][0])},${Math.round(b.p[0][1])}`;
// AND THE BRANCHES THAT NEVER REACH THE CAP AT ALL. capFlatRoof is called
// from two places near the END of the building loop, and the loop has EIGHT
// earlier `continue`s — a bespoke roof recipe, a named recipe, a shophouse, a
// grandstand, the Wings stage, a construction site, a steep or huge
// footprint. Every one of those owns its own top and none of them was saying
// so, which is why roofcheck's ten worst offenders came back as six blanks:
// "no cap decision recorded" was the honest answer and it was useless.
// WHERE DO THE BUILDING SECONDS GO? `buildings` is 2,909ms of a 17.2s boot
// (bootprobe, 2026-08-26) and is the largest phase that gates time-to-playable
// now that sg:trails is halved — and unlike plantSurveyed, which has carried
// `__plantMarks` since it was optimised, this loop had no breakdown at all.
// A phase you cannot split is a phase you optimise by guessing.
// Accumulated per BRANCH, which is the axis that matters here: a bespoke
// recipe, a shophouse and a generic extrusion cost very different amounts and
// the mix is what decides the total.
const _BM = (window.__buildMarks = {});
let _bmT = 0;
// The per-building timing ledger. `_bmStart` opens a building and `_bacc`
// closes it with the branch that drew it. THE CATCH-ALL MATTERS: the loop body
// has many `continue` paths that never reach a `_bacc`, so the first version
// of this only ever explained 198 of ~1,095 footprints -- 458ms of a 1,708ms
// phase -- and the missing 900 looked like they cost nothing at all. An open
// building is now closed as 'unmarked (no branch)' by the NEXT `_bmStart`,
// which catches every early exit without putting a mark on each one.
let _bmOpen = false;
const _bmStart = () => {
  if (_bmOpen) { const e = _BM['unmarked (no branch)'] || (_BM['unmarked (no branch)'] = { n: 0, ms: 0 }); e.n++; e.ms += performance.now() - _bmT; }
  _bmOpen = true; _bmT = performance.now();
};
const _bacc = (kind) => {
  const dt = performance.now() - _bmT;
  const e = _BM[kind] || (_BM[kind] = { n: 0, ms: 0 });
  e.n++; e.ms += dt; _bmOpen = false;
};
const _capSkip = (b, tag) => {
  if (b && b.p && b.p.length) _CAPWHY[_capKey(b)] = 'NOT REACHED: ' + tag
    + ` [a=${Math.round(b.a || 0)} h=${(b.h || 0).toFixed(1)}]`;
};

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
  // NAMED, like busLane already is: all four road materials merge into meshes
  // called `roadSurface`, and that one name covers the carriageway, a paved
  // plaza and a concrete apron alike. data/treecheck.mjs has to tell a tree
  // standing in a traffic lane from one standing in a pedestrian square, and
  // the material is the only thing left that knows which is which.
  asphalt: Object.assign(new THREE.MeshStandardMaterial({ map: TEX.asphalt, roughness: 0.95 }), { name: 'asphalt' }),
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
  // ROUGHNESS 0.44, NOT 0.30, AND THE WAVE NORMALS ARE WHY (2026-08-28).
  //
  // At 0.30 the specular lobe is narrow, so once the sea was given a real
  // normal (the swell in buildSea's shader) every patch of it near the sun's
  // mirror angle went to SATURATED WHITE and the surface read as a field of
  // hard blobs rather than as glitter. Photographed at 90m over Siloso: a
  // dalmatian sea. A flat normal hid it — one uniform bright patch has no
  // pattern in it — which is why this number was fine for a year and is not
  // any more. A wider lobe is also what a wind-roughened sea has.
  openSea: new THREE.MeshStandardMaterial({
    map: texWater(), color: 0x5a8296, roughness: 0.44, metalness: 0.42,
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
    // 0x9b9d97 -> 0xa2a09b: green sat a shade above red, and under the warm
    // sun the Cove's paver streets rendered military-olive — the 2026-08-22
    // sweep filed them as "missing asphalt with markings painted on terrain"
    // (frames 011/177; raycast says the surface is there, it is this tint).
    // Concrete pavers are warm-neutral; red leads green now.
    color: 0xa2a09b, roughness: 0.92,
    name: 'unitPave',
  }),
  // THE BOOM BARRIER AND ITS PEDESTAL. 17 lift_gates are surveyed on Sentosa
  // and the scene carried none of them until 2026-08-24 — `barrier=lift_gate`
  // is an OSM NODE and process.py's barrier pass only ever read WAYS.
  boom: Object.assign(new THREE.MeshStandardMaterial({
    map: (() => { const t = texBoomBand(); t.repeat.set(6, 1); return t; })(),
    roughness: 0.6,
  }), { name: 'boom' }),
  boomPost: Object.assign(new THREE.MeshStandardMaterial({ color: 0x6d7378, roughness: 0.55, metalness: 0.25 }), { name: 'boomPost' }),
  gateBar: Object.assign(new THREE.MeshStandardMaterial({ color: 0x3f4a44, roughness: 0.62, metalness: 0.3 }), { name: 'gateBar' }),
  roadConc: Object.assign(new THREE.MeshStandardMaterial({ map: texConcrete(0x9d9a94, 0.6), roughness: 0.93 }), { name: 'roadConc' }),
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
    // ...AND A CARD THREE METRES FROM THE LENS IS NOT FOLIAGE, IT IS A WALL.
    //
    // The tilt fix earlier today killed the long diagonal ribbons across the
    // canopy (D4) by turning the rim cards to face outward. What it cannot
    // reach is a card on the tree the rider is passing UNDER: at 2-4m an
    // eight-metre plane fills half the screen, and seen edge-on it is a green
    // bar straight through the middle of the frame — still visible on sweep
    // frame 205, and it is the last of that family.
    //
    // Cards near the eye now DISSOLVE. `diffuseColor.a` is scaled by distance
    // and the material's existing `alphaTest: 0.42` does the rest: more texels
    // fail the test as the card approaches, so it thins out leaf by leaf
    // instead of popping. NO TRANSPARENCY IS TURNED ON — alphaTest keeps this
    // in the opaque pass, so there is no sorting cost and no fill-rate change
    // on a GPU this file elsewhere calls fill-rate bound.
    //
    // 1.6m to 5.0m: at 5m a card is behaving, at 1.6m it is gone. The canopy
    // above the rider is drawn by the BLOBS, which are solid and untouched, so
    // the crown does not open up over his head.
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFolW;')
      .replace('#include <worldpos_vertex>',
               '#include <worldpos_vertex>\n  vFolW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vFolT;\nvarying vec3 vFolW;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= vec3(1.0 + vFolT * 0.30,
                                 1.0 + vFolT * 0.17,
                                 1.0 - vFolT * 0.20);
        diffuseColor.a *= smoothstep(1.6, 5.0, distance(cameraPosition, vFolW));`);
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

// THE COVE VILLA ROOF AND EVERY SOLID FENCE ASKED FOR `MAT.paleStone`.
// It is on LMAT, which is declared 200 lines below MAT, so the reference read
// undefined and three.js drew those pieces with its default material: unlit
// white. Same object, not a copy — a second instance would be a second draw
// batch for a material this world already has, and `autoUV` reads the tile
// size off this one.
MAT.paleStone = LMAT.paleStone;
// AND THE SAME TRAP CAUGHT AGAIN, 2026-08-17, WRITING THE COVE GATE PIERS.
// `MAT.warmStone` was reached for by reflex because `api.mat.warmStone` exists
// on the landmark api, and it would have drawn 371 gate piers in three.js's
// default unlit white — D3 exactly, in the district D3 was found in. The check
// that found it is the one the D3 note prescribes and it takes ten seconds:
// grep every `MAT.<key>` in the repo against the keys MAT actually declares.
MAT.warmStone = LMAT.warmStone;

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

// THE GROUND AS IT IS DRAWN, which is not `groundAt`, and the difference is
// the entire waterline. `at()` is the logical heightfield; `vertexY` is the
// surface the player sees, and it alone owns the water polygons, the
// overreach guard and the shore shelf. Anything asking "where does the land
// meet the sea" must ask this one — terrain.js already calls that out as
// "one authority, three readers" (the drawn mesh, what a walker stands on,
// and what stops them). The swim flags were a fourth reader that was not
// using it: they walked downhill until `at() < 1.0` against a comment saying
// "the eased 0.8m band IS the waterline", and when the shore profile changed
// under them on 2026-08-07 that band became sea, so the flags waded out.
// A magic contour is not a waterline; the thing that draws the water is.
export function drawnGroundAt(x, z) {
  return TERRAIN.vertexY ? TERRAIN.vertexY(x, z) : TERRAIN.at(x, z);
}

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
// The registered open-ground footprints themselves. A probe needs the RINGS,
// not just a point test: the defect this exposes lives on the perimeter, where
// a recipe drew a wall the collision grid never heard about.
export function openGroundPolys() { return OPENGROUND.polys; }
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

// A WALK SURFACE YOU CAN ONLY BE ON IF YOU COULD HAVE GOT THERE.
//
// This returned the HIGHEST registered surface at x,z, full stop, and surfaceAt
// hands that straight to the walker. For a flight of steps that is right — the
// treads are the only thing there. For anything with air under it, it is the
// bug that stopped the cable car station being built: a 12m boarding deck would
// have picked up anyone who walked UNDERNEATH it and stood them on the roof.
// Same class as the footbridge that buried a walker to the helmet along the
// Boardwalk, arriving from the opposite direction.
//
// So it takes the height the walker is ALREADY at, when the caller knows it,
// and answers with the surface they could actually step onto: up to STEP_UP
// above (a stair riser, a kerb) or a drop they could take. Without fromY the
// old highest-wins behaviour stands, so every existing caller is unchanged.
const STEP_UP = 1.35, STEP_DOWN = 3.2;
// `reach` is the same opt-in the deck clause takes: a caller that passes it
// gets a tighter ceiling than STEP_UP. A walker takes a 1.35m stride up; a
// board does not, and without this the stair clause was the one remaining way
// for the ride's seat to be lifted further than it can roll.
export function walkSurfaceAt(x, z, fromY, reach) {
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
    if (dx * dx + dz * dz > s[4] * s[4]) continue;
    const y = s[5];
    if (fromY != null) {
      // out of reach in either direction: not a surface this walker is on
      if (y - fromY > (reach != null ? reach : STEP_UP) || fromY - y > STEP_DOWN) continue;
      // among those reachable, the nearest to where they already are
      if (best === null || Math.abs(y - fromY) < Math.abs(best - fromY)) best = y;
    } else if (best === null || y > best) best = y;
  }
  return best;
}
export function clearBridges() { BRIDGES.cells.clear(); BRIDGES.segs.length = 0; }
export function addBridgeWay(pts, width, deck = null) { return _addSpan(BRIDGES, pts, width, deck); }

// A pedestrian bridge. Same geometry, a registry nothing seats a rider from.
// The pts-array -> way-id map lets a way-following walker (trailcheck walks
// the very arrays the registry was built from) PREFER the deck of the way it
// is actually on — two crossings run parallel at the Gateway, and nearest-
// by-height boarded the wrong one.
const _SPAN_BY_PTS = new WeakMap();
export function addFootbridgeWay(pts, width) {
  if (!pts || pts.length < 2) return 0;
  const d = _addSpan(FOOTBRIDGES, pts, Math.max(width || 0, 3));
  _SPAN_BY_PTS.set(pts, _SPAN_ID);
  return d;
}
export function footbridgeIdOf(pts) {
  return _SPAN_BY_PTS.get(pts) ?? null;
}

// Every span call is one WAY, and the id is what directional seating keys on:
// a walker's seat names the way they boarded, not a point in space. _WET_WAYS
// holds the ids of ways whose deck genuinely crosses open water — the only
// ways a walker may BOARD from land. The Cove access bridges hover 1.2m over
// drawn grass (the uncarved moats): their ground is walkable, boarding them
// added a step up and a step off that baseline never had (N3 37 -> 111,
// measured), and a dry way's deck is scenery to a walker until the canal is
// carved. A shore crossing's ground drowns; its deck is the only truth.
let _SPAN_ID = 0;
const _WET_WAYS = new Set();

function _addSpan(REG, pts, width, deckOverride = null) {
  if (!pts || pts.length < 2) return 0;
  const wid = ++_SPAN_ID;
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
  // A NARROW FOOTBRIDGE COMES DOWN TO ITS LANDINGS IN THE REGISTRY, the way
  // the drawn ribbon already does — SESSION 17's second diagnosed
  // inconsistency ("the footbridge comes down to its landing in the picture
  // and stays in the air in the answer"). The per-RUN ramp fn was measured
  // there and thrown away (floating 318 -> 572: a pedestrian union reaches
  // far inland, so runMax + 1.2 came from ground the deck never touches).
  // This ramp is WAY-LOCAL: the flat deck eases over the last 18m of the
  // way's own arc to the surface a walker actually meets at each end —
  // min(shoreY, at), because a landing on a drawn beach is at the drawn
  // beach — and an end standing in open water (a scenery stub) keeps the
  // flat deck, which is the measured least-harm for the one dead-end stub.
  // NARROW ONLY (half < 2.5): the promenade clause is width-gated, so the
  // Boardwalk's tuned stand-on behaviour never sees these heights.
  let ramp = null;
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  }
  if (REG === FOOTBRIDGES && half < 2.5 && !fn) {
    const grd = TERRAIN.grid && TERRAIN.grid();
    const seaLv = grd && typeof grd.sea === 'number' ? grd.sea : 0;
    const RAMP_LEN = 18;
    const tgt = [pts[0], pts[pts.length - 1]].map(([ex, ez]) => {
      const eg = TERRAIN.at(ex, ez);
      if (eg < seaLv + 0.6) return null;   // ends in open water: scenery stub
      // The landing floor is the DRAWN skin, not the heightfield — at the
      // -1078 landing the drawn beach eases to -1.4 while at() reads 0.72,
      // and a ramp aimed at at() left the deck 2.5m above the sand a walker
      // is actually on (measured, the +2.54 residual). shoreY at the exact
      // vertex was tried first and nulls out: the vertex sits a step outside
      // the water polygon, so waterFloor has no answer there. drawnGroundAt
      // over a short cross around the end is the height the walker arrives
      // at, whichever side they step off.
      let floor = eg;
      for (const [ox, oz] of [[0, 0], [2.5, 0], [-2.5, 0], [0, 2.5], [0, -2.5]]) {
        floor = Math.min(floor, drawnGroundAt(ex + ox, ez + oz));
      }
      return floor + 0.06;
    });
    if (tgt[0] !== null || tgt[1] !== null) {
      ramp = (s) => {
        let h = deck;
        if (tgt[0] !== null && s < RAMP_LEN) {
          h = Math.min(h, tgt[0] + (deck - tgt[0]) * (s / RAMP_LEN));
        }
        if (tgt[1] !== null && total - s < RAMP_LEN) {
          h = Math.min(h, tgt[1] + (deck - tgt[1]) * ((total - s) / RAMP_LEN));
        }
        return h;
      };
    }
  }
  // With a ramp function, long map segments are SUBDIVIDED (8m) before they
  // are stored: one 100m segment scored by its two endpoints would take the
  // ramp's lowest height for its whole length and put the ride surface under
  // the drawn tarmac mid-span. Each entry carries its arc interval [s0,s1]
  // so the way-local end ramp can score it.
  const src = [];
  let arc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (!fn && !ramp) { src.push([ax, az, bx, bz, arc, arc + L]); arc += L; continue; }
    const n = Math.max(1, Math.ceil(L / 8));
    for (let s = 0; s < n; s++) {
      src.push([ax + (bx - ax) * (s / n), az + (bz - az) * (s / n),
                ax + (bx - ax) * ((s + 1) / n), az + (bz - az) * ((s + 1) / n),
                arc + L * (s / n), arc + L * ((s + 1) / n)]);
    }
    arc += L;
  }
  // Sampled ALONG each segment, never at vertices alone — SESSION 18's bridge
  // decks were missing because a crossing-over-water test read only way
  // vertices and both ends of every 2-point bridge way stand on dry bank.
  if (REG === FOOTBRIDGES) {
    const grd = TERRAIN.grid && TERRAIN.grid();
    const seaLv = grd && typeof grd.sea === 'number' ? grd.sea : 0;
    outer: for (const [ax, az, bx, bz] of src) {
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 6));
      for (let s = 0; s <= n; s++) {
        const t = s / n;
        if (TERRAIN.at(ax + (bx - ax) * t, az + (bz - az) * t) < seaLv + 0.6) {
          _WET_WAYS.add(wid);
          break outer;
        }
      }
    }
  }
  for (const [ax, az, bx, bz, s0, s1] of src) {
    const idx = REG.segs.length;
    const segDeck = fn ? Math.min(fn(ax, az), fn(bx, bz))
      : ramp ? Math.min(ramp(s0), ramp(s1)) : deck;
    const seg = [ax, az, bx, bz, half, segDeck, wid];
    // an 18% landing ramp quantised to one height per 8m seg is a 1.5m stair
    // (measured: +2.54 at -1078,12110) — the readers interpolate these.
    // A FUNCTION-DRIVEN SPAN GETS THEM TOO, and until 2026-08-29 it did not:
    // `fn` is how buildRoads carries a road bridge's approach ramps, and those
    // are the spans a RIDER crosses at speed. Without the ends there was
    // nothing to interpolate and _deckIn had to fall back on the segment's
    // flat minimum, which is the 0.45m-per-8m staircase measured in its note.
    if (ramp) { seg[7] = ramp(s0); seg[8] = ramp(s1); }
    else if (fn) { seg[7] = fn(ax, az); seg[8] = fn(bx, bz); }
    REG.segs.push(seg);
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

export function bridgeFabric(pts, width, deck, deckGeos, pierGeos, ownName, deckFn, trims) {
  if (!pts || pts.length < 2 || !deck) return;
  const half = width / 2;
  // which ends may lose their last 9m of barrier — TERMINAL ends only (see
  // BRTRIM in buildRoads); a mid-run way boundary keeps its barrier so a
  // chained causeway wall stays continuous
  const trim0 = trims ? !!trims.t0 : true;
  const trim1 = trims ? !!trims.t1 : true;
  // THE FABRIC MUST FOLLOW THE RAMP THE TARMAC ALREADY TAKES. `deck` is the
  // run's flat `runMax + 1.2`, but the registry/ribbon height fn (BRDECK's f)
  // eases down to each landing over its last 20m — built flat, the deck slab
  // and parapets stood 0.8m PROUD of their own ramped tarmac at the Brani
  // causeway landing, surfacing mid-carriageway as a white dome (sweep frame
  // 093). Segments where the fn actually varies are split to ~10m pieces,
  // each at its own height; everywhere the fn is flat the geometry is
  // byte-identical to before.
  const dAt = (typeof deckFn === 'function') ? deckFn : null;
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0], dz = pts[i + 1][1] - pts[i][1];
    const L = Math.hypot(dx, dz);
    if (L < 0.05) continue;
    const varies = dAt && Math.abs(dAt(pts[i][0], pts[i][1])
      - dAt(pts[i + 1][0], pts[i + 1][1])) > 0.05;
    const nPieces = varies ? Math.max(1, Math.ceil(L / 10)) : 1;
    for (let k = 0; k < nPieces; k++) {
      const t0 = k / nPieces, t1 = (k + 1) / nPieces;
      const px = pts[i][0] + dx * t0, pz = pts[i][1] + dz * t0;
      const pdx = dx * (t1 - t0), pdz = dz * (t1 - t0);
      const pL = L * (t1 - t0);
      segs.push({ x: px, z: pz, dx: pdx, dz: pdz, L: pL,
        yaw: Math.atan2(dx, dz), s0: total + L * t0,
        dv: dAt ? dAt(px + pdx / 2, pz + pdz / 2) : deck });
    }
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
  const clearAt = (sg, t) => sg.dv - DECK_T - TERRAIN.at(sg.x + sg.dx * t, sg.z + sg.dz * t);
  for (const sg of segs) {
    if (Math.min(clearAt(sg, 0), clearAt(sg, 0.5), clearAt(sg, 1)) < LOW_CLEAR) {
      BRIDGE_PIERS.atGrade++;
      // ...UNLESS THE GRADE IT SITS AT IS THE SEA. The Brani causeway fails
      // the aloft test — it is a low embankment, not a span — and got
      // NOTHING: bare tarmac meeting open water on both edges (2026-08-22
      // sweep frames 032/041, "a road floating on the sea"). A causeway in
      // life is rock armour and a barrier. The stored datum for open sea is
      // exactly 0.00 (reference: SG terrain datum), so ground under 0.4
      // beside a bridge-tagged way IS water, and those segments get an
      // armour skirt sloping off each edge and a low barrier — still inside
      // the at-grade branch, so genuine culverts and ramps over land gain
      // nothing.
      {
        const mx = sg.x + sg.dx / 2, mz = sg.z + sg.dz / 2;
        const cy = Math.cos(sg.yaw), sy = Math.sin(sg.yaw);
        let water = 0;
        for (const sgn of [-1, 1]) {
          const ex = mx + cy * sgn * (half + 3.5), ez = mz - sy * sgn * (half + 3.5);
          if (TERRAIN.at(ex, ez) < 0.4) water++;
        }
        if (water) {
          const deckY = sg.dv - DECK_T / 2 - 0.02;
          for (const sgn of [-1, 1]) {
            const ex = mx + cy * sgn * (half + 3.5), ez = mz - sy * sgn * (half + 3.5);
            if (TERRAIN.at(ex, ez) >= 0.4) continue;   // this edge meets land
            // the armour skirt: a slab rolled ~38 degrees off the deck edge
            const skirt = new THREE.BoxGeometry(3.4, 0.5, sg.L + 0.35).toNonIndexed();
            skirt.rotateZ(sgn * -0.66);
            skirt.rotateY(sg.yaw);
            skirt.translate(mx + cy * sgn * (half + 1.15), deckY - 0.85,
                            mz - sy * sgn * (half + 1.15));
            pierGeos.push(skirt);
            // and the barrier the rider sees — held back 9m from the way's
            // ends: the way ends at its junction with the rest of the road
            // network, and a barrier run to the very end stands its end-cap
            // in the merge apron the other lanes drive through (the white
            // "dome" mid-carriageway at the Brani gore point, sweep frame
            // 093, chased to the last barrier box's corner at -905.6,11900.8).
            // A real barrier tapers off before the gore point.
            {
              const b0 = Math.max(sg.s0, trim0 ? 9 : 0);
              const b1 = Math.min(sg.s0 + sg.L, total - (trim1 ? 9 : 0));
              if (b1 > b0) {
                const tm = (b0 + b1) / 2 - sg.s0;
                deckGeos.push(boxGeo(0.26, 0.92, (b1 - b0) + 0.35,
                  sg.x + sg.dx * (tm / sg.L) + cy * sgn * (half + 0.36), sg.dv + 0.42,
                  sg.z + sg.dz * (tm / sg.L) - sy * sgn * (half + 0.36), sg.yaw));
              }
            }
          }
        }
      }
      continue;
    }
    const mx = sg.x + sg.dx / 2, mz = sg.z + sg.dz / 2;
    const cy = Math.cos(sg.yaw), sy = Math.sin(sg.yaw);
    // The spans overlap by 0.35m so a bend in the way does not open a slot of
    // daylight at every vertex — the same trick the ribbon itself uses.
    deckGeos.push(boxGeo(width + 0.9, DECK_T, sg.L + 0.35,
      mx, sg.dv - DECK_T / 2 - 0.02, mz, sg.yaw));
    for (const sgn of [-1, 1]) {
      const ox = sgn * (half + 0.36);
      deckGeos.push(boxGeo(0.26, 0.92, sg.L + 0.35,
        mx + cy * ox, sg.dv + 0.42, mz - sy * ox, sg.yaw));
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
      const clear = sg.dv - DECK_T - g;
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
      placed = { px, pz, g, clear, cy, sy, ox, yaw: sg.yaw, dv: sg.dv };
      if (nudge) BRIDGE_PIERS.nudged++;
      break;
    }
    if (!placed) { BRIDGE_PIERS.skipped++; continue; }
    const { px, pz, g, clear, cy, sy, ox, yaw, dv } = placed;
    // a bent: two columns under the deck edges, plus the crosshead they carry
    for (const sgn of [-1, 1]) {
      pierGeos.push(boxGeo(0.92, clear, 0.92,
        px + cy * sgn * ox, g + clear / 2, pz - sy * sgn * ox, yaw));
    }
    pierGeos.push(boxGeo(width * 0.92, 0.5, 1.15, px, dv - DECK_T - 0.22, pz, yaw));
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
  if (!l) { _deckWideIn.id = null; return null; }
  let best = null, bestHalf = -1, bestId = null;
  for (const i of l) {
    const s = REG.segs[i];
    if (s[4] < minHalf) continue;
    const vx = s[2] - s[0], vz = s[3] - s[1];
    const l2 = vx * vx + vz * vz || 1;
    let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
    if (dx * dx + dz * dz <= (s[4] + 0.4) * (s[4] + 0.4) && s[4] > bestHalf) {
      bestHalf = s[4]; best = s[5]; bestId = s[6];
    }
  }
  // the way id of the deck just returned, for the seat — read it immediately,
  // the next call overwrites it
  _deckWideIn.id = bestId;
  return best;
}

// ...AND IT RIDES UP THE RAMP, IT DOES NOT CLIMB THE STAIRS.
//
// This returned `s[5]`, which is ONE height for a whole segment. Segments on a
// ramped span are 8m long, so a road bridge's approach came back as a
// STAIRCASE: measured on the road at 318,13762 heading 0.288, surfaceAt held
// 7.7215 for 12.5m, then jumped 0.4509 in one sample, then held 8m and jumped
// again -- seven risers of 0.24 to 0.72m in the first 68m, on a stretch whose
// drawn tarmac is a smooth crest (shots/street/steps.shot1.jpg). The rider is
// seated on this function and so is the chase camera, so both were teleported
// up to 0.72m in a single frame at 40+ km/h while the road under them did not
// move. That is the owner's "glitching in mid air" with a number on it.
//
// The per-end heights needed to fix it were ALREADY BEING STORED -- but only
// for footbridge landing ramps, whose own comment says "the seat readers
// interpolate these". The seat reader does; this one, the one the RIDER goes
// through, never did, and for a road bridge built from a height function the
// ends were not stored at all. Both halves are fixed: _addSpan stores the ends
// for a function-driven span too, and this interpolates whenever they are
// there. `s[5]` is untouched -- it is the conservative per-segment minimum and
// the dressing passes that place kerbs and lamps still read it.
function _deckIn(REG, x, z) {
  const l = REG.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  // AND A SEGMENT YOU ARE PAST IS NOT THE SEGMENT YOU ARE ON. `t` is clamped
  // into [0,1], so a point four metres BEYOND a segment's end still projects
  // onto that end -- and a road bridge is 14m wide, so it is still inside the
  // capsule too. With "widest wins" as the only tie-break, a point in the
  // middle of segment B could be answered by segment A's clamped end height,
  // which is flat. That is why interpolating alone only halved the staircase:
  // measured after it, the treads went from 8m to 4.25m and the risers stayed
  // (0.25-0.40m). The overhang is scored now and an interior hit outranks a
  // clamped one at the same width.
  let best = null, bestHalf = -1, bestPen = Infinity;
  for (const i of l) {
    const s = REG.segs[i];
    const vx = s[2] - s[0], vz = s[3] - s[1];
    const l2 = vx * vx + vz * vz || 1;
    const traw = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
    const t = traw < 0 ? 0 : traw > 1 ? 1 : traw;
    const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
    if (dx * dx + dz * dz > (s[4] + 0.4) * (s[4] + 0.4)) continue;
    // metres past the end of this segment, 0 while the projection is interior
    const pen = Math.abs(traw - t) * Math.sqrt(l2);
    if (s[4] > bestHalf + 1e-6 || (s[4] > bestHalf - 1e-6 && pen < bestPen)) {
      bestHalf = Math.max(bestHalf, s[4]); bestPen = pen;
      best = s[7] != null ? s[7] + (s[8] - s[7]) * t : s[5];
    }
  }
  return best;
}

// DIRECTIONAL SEATING — the missing fact was WHICH way the walker follows.
//
// SESSION 17 measured four positional rules for the shore-landing spikes and
// every one moved the step instead of removing it, because surfaceAt(x,z,fromY)
// cannot know which way the walker is on. The seat is that fact, carried by the
// caller: a mutable {id} the walker owns. Boarding names the footbridge way
// (the _addSpan call id stamped on each seg); while seated, THAT way's deck is
// consulted first and continuously, so the shore-shelf clause cannot walk a
// bridge-crosser 1.7m under the sea mid-span. Only callers that pass a seat
// get any of this — the crowd, the kerbs and every dressing pass are unchanged.

// The deck of one named way at x,z, or null once the walker leaves its corridor.
function _seatDeckAt(id, x, z) {
  const l = FOOTBRIDGES.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  for (const i of l) {
    const s = FOOTBRIDGES.segs[i];
    if (s[6] !== id) continue;
    const vx = s[2] - s[0], vz = s[3] - s[1];
    const l2 = vx * vx + vz * vz || 1;
    let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
    if (dx * dx + dz * dz <= (s[4] + 0.4) * (s[4] + 0.4)) {
      return s[7] != null ? s[7] + (s[8] - s[7]) * t : s[5];
    }
  }
  return null;
}

// Can this walker BOARD a footbridge here — inside its corridor, deck within a
// stride of the height they are carrying (STEP_UP above / 0.5 below, the same
// reach walkSurfaceAt grants a stair tread), AND heading ALONG it. The height
// window alone was measured first and it is SESSION 17's unbounded disaster
// re-run: N3 37 -> 129 with ±1.2m pairs at every footway that crosses a deck
// corridor, because a walker CROSSING a bridge's approach boarded it for two
// strides and stepped back off. Direction is the discriminator the whole
// project was named for: you board a bridge you are following, not one you
// are walking past, and |cos| > 0.5 (within ~60°) tells those apart while
// still boarding from a diagonal approach path. Nearest to the walker's own
// height wins where two ways share a landing.
function _boardableAt(x, z, fromY, hx, hz, prefer) {
  const l = FOOTBRIDGES.cells.get(Math.floor(x / BR_CELL) + ',' + Math.floor(z / BR_CELL));
  if (!l) return null;
  let best = null;
  for (const i of l) {
    const s = FOOTBRIDGES.segs[i];
    if (!_WET_WAYS.has(s[6])) continue;
    const vx = s[2] - s[0], vz = s[3] - s[1];
    const sl = Math.hypot(vx, vz) || 1;
    const l2 = vx * vx + vz * vz || 1;
    let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
    if (dx * dx + dz * dz > (s[4] + 0.4) * (s[4] + 0.4)) continue;
    const y = s[7] != null ? s[7] + (s[8] - s[7]) * t : s[5];
    const d = y - fromY;
    if (d > STEP_UP || d < -0.5) continue;
    if (Math.abs((hx * vx + hz * vz) / sl) < 0.5) continue;
    // the way the walker is actually following outranks nearest-by-height
    if (prefer != null && s[6] === prefer) return { y, id: s[6] };
    if (best === null || Math.abs(d) < Math.abs(best.y - fromY)) best = { y, id: s[6] };
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

// `reach` is OPT-IN and only the ride passes it. See the clause below.
export function surfaceAt(x, z, fromY, seat, reach) {
  // SEATED: the walker is ON a named footbridge way, and stays on it until
  // they leave its corridor — the deck answers before every other clause, so
  // neither a viaduct overhead nor the shore shelf below can pull them off
  // mid-crossing. Unseating falls through to the ordinary rules, which at a
  // corridor's end is the abutment ground the deck comes down to.
  if (seat && seat.id != null) {
    const sd = _seatDeckAt(seat.id, x, z);
    if (sd !== null) return sd + 0.04;
    seat.id = null;
  }
  const deck = bridgeDeckAt(x, z);
  // A DECK OVERHEAD IS NOT A DECK YOU ARE ON, and this clause had no reach
  // test of any kind: it returned any deck whose footprint covered the point,
  // however far above. The stair clause below already refuses what it cannot
  // reach; this one lifted a rider onto every viaduct and flyover she drove
  // beneath. Measured by walking every road centreline carrying the height the
  // way the ride does (data/joltcheck.mjs): a 14.582m step at -1549,12432.
  //
  // OPT-IN, AND DELIBERATELY SO. The walker's seating through this function is
  // the subject of four sessions of measured trade-offs (SESSION 17's shore
  // landings, the promenade width rule, directional seating) and its N3 count
  // is a deploy gate. Changing what a deck means for every caller to fix the
  // ride is how those get re-litigated by accident. Only a caller that passes
  // `reach` gets this, and today that is main.js's board.
  //
  // UPWARD ONLY. Refusing a deck ABOVE her is "you cannot be teleported onto
  // something you could not have ridden onto"; refusing one below would be
  // refusing to fall, which is a different question and not this one's.
  if (deck !== null && !(reach != null && fromY != null && deck + SURFACE_ROAD - fromY > reach)) {
    return deck + SURFACE_ROAD;
  }
  // A STAIR TREAD IS GROUND WHEN YOU ARE ON IT. Checked after the deck so a
  // flight under a bridge does not lift a rider off the carriageway, and
  // before the terrain so a walker climbing Fort Canning rises with the steps
  // instead of walking through them. main.js seats the walker with exactly
  // this function (`walkerRig.group.position.set(walker.x, surfaceAt(...))`),
  // which is why the stairs were drawn but not climbable until now.
  const step = walkSurfaceAt(x, z, fromY, reach);
  if (step !== null) return step;
  // ON THE SHORE SHELF, THE GROUND YOU STAND ON IS THE GROUND THAT IS DRAWN.
  //
  // `at()` is the heightfield and is deliberately never sunk — the drawn skin
  // alone goes down at the coast. That is right everywhere except the shelf,
  // where the drawn beach eases below at() by up to a metre on its way into
  // the water: standing on at() there puts a walker, and anything seated with
  // them, up to a metre above the sand they can see. Only the shelf band is
  // affected; `shoreY` returns null everywhere else.
  // BOARDING, checked before the shelf — this is the seaward end SESSION 17
  // said needed solving. The shelf clause returns unconditionally inside its
  // band, so a walker following a footway onto a shore crossing descended
  // the drawn beach to 1.7m under the sea and only snapped onto the deck
  // where the band ran out (the 4.71m step at -1034,12090). A walker in a
  // WET footbridge's corridor, heading along it, with its deck within a
  // stride of the height they carry, is boarding it — usually on the made
  // ground of the approach, where deck and ground nearly meet — and from
  // there the seat carries them continuously to the far abutment. Boarding
  // restricted to the shelf band was also measured and left the 4.71
  // standing: at that landing the deck is 1.76m above the shelf's top, out
  // of reach, and the only place a walker can honestly step onto it is the
  // higher approach ground the band excludes.
  if (seat && fromY != null && (seat.hx || seat.hz)) {
    const b = _boardableAt(x, z, fromY, seat.hx, seat.hz, seat.prefer);
    if (b !== null) { seat.id = b.id; return b.y + 0.04; }
  }
  const sh = TERRAIN.shoreY ? TERRAIN.shoreY(x, z) : null;
  if (sh !== null) return sh + SURFACE_PATH;
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
  // ...AND `reach` APPLIES HERE TOO. Same opt-in as the deck clause: this is
  // the promenade rule, and the Boardwalk is 7m wide, so a rider on a road
  // beside it was stood on it -- the last un-gated lift in this function.
  // Measured before the gate (data/joltcheck.mjs, walking every road with the
  // ride's own call): four lifts left on the whole island, all in the
  // Boardwalk landings between -1034 and -1079, worst 4.723m at -1034,12090 --
  // the very step SESSION 17's note names. The walker's behaviour is untouched
  // because the walker passes no reach.
  if (fb !== null && fb > g && !(reach != null && fromY != null && fb + 0.04 - fromY > reach)) {
    const grd = TERRAIN.grid && TERRAIN.grid();
    const seaLv = grd && typeof grd.sea === 'number' ? grd.sea : null;
    if (fb - g < 3.0 || (seaLv !== null && g < seaLv + 0.6)) return fb + 0.04;
  }
  // ...AND OVER OPEN WATER, WIDTH IS NOT THE QUESTION EITHER.
  //
  // The comment three lines above already states the principle — "over water
  // anything wide is standable at any height because nothing walks beneath" —
  // but the width test runs FIRST, inside `_deckWideIn`, so a narrow deck was
  // never reached to have the water clause applied to it. Width is a proxy for
  // "could somebody be walking UNDER this", and over the sea the answer is no
  // at any width.
  //
  // Measured at -1075,11790: an unnamed 356 m footway, `bridge=1`, 3.4 m wide,
  // crosses the Gateway channel. It is a metre under the promenade threshold,
  // so nothing consulted it and a walker crossed 356 m of open water AT SEA
  // LEVEL, between the Sentosa Boardwalk's deck at 1.30 and the causeway's walk
  // surface at 3.42 — four metres of sea in the gap. It is the worst of the
  // corridor's N3 spikes and it is not a height disagreement, which is what it
  // looked like from the numbers alone.
  //
  // Strictly narrower than the rule above: it applies ONLY where the ground
  // below is at or under the water, which is the one case where nothing can be
  // walking beneath the deck. On land the promenade width rule is untouched,
  // so the low crossing linkways a walker passes under still behave.
  {
    const grd2 = TERRAIN.grid && TERRAIN.grid();
    const seaLv2 = grd2 && typeof grd2.sea === 'number' ? grd2.sea : null;
    if (seaLv2 !== null && g < seaLv2 + 0.6) {
      const fbn = _deckWideIn(FOOTBRIDGES, x, z, 0);
      if (fbn !== null && fbn > g
          && !(reach != null && fromY != null && fbn + 0.04 - fromY > reach)) return fbn + 0.04;
    }
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
// Geometry handed to the merger with no material at all. See Merger.add.
export let MISSING_MAT = 0;
let MISSING_MAT_SAID = 0;
export function missingMatCount() { return MISSING_MAT; }
export class Merger {
  constructor() { this.groups = new Map(); this.mats = new Map(); }
  add(geo, mat, x = 0, z = 0) {
    // A MESH WITH NO MATERIAL IS UNLIT WHITE, AND UNLIT WHITE LOOKS BUILT.
    //
    // `MAT.paleStone` never existed — paleStone is on LMAT, declared 200 lines
    // further down — so two of every three Sentosa Cove villas wore a pure
    // white, flat-shaded roof slab, and every solid fence and garden wall on
    // the island was the same white. three.js defaults a missing material to
    // `new MeshBasicMaterial()`, which is white with no map and no lighting,
    // and `undefined` is a perfectly good Map key, so the pieces bucketed,
    // merged, batched and LOD'd exactly like real fabric. Three sweeps filed
    // it as "raw white placeholder geometry" and one whole session's evidence
    // pack chased the material COLOUR of `roadSurface` — which is ffffff on
    // every road in this world, because the map carries the colour.
    //
    // Nothing silently defaults here again. The count is reported at flush.
    if (mat === undefined) { MISSING_MAT++; mat = MAT.conc; }
    // WHO PUT THIS HERE? Merged output carries no identity, which is why the
    // TBC slab hunt (sweep, SESSION 28) stalled at "a white slab from
    // somewhere in buildBuildings". Set `window.__huntBox = {x, z, y0, y1}`
    // BEFORE the build (an init script, not a post-ready evaluate) and every
    // add() whose geometry bbox covers that point in that y-range records its
    // material colour, its bbox and ITS OWN CALL STACK — the one identity a
    // merged mesh can never lose at emit time. Undefined in normal play; one
    // property check per add.
    if (typeof window !== 'undefined' && window.__huntBox) {
      const hb = window.__huntBox;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const b = geo.boundingBox;
      if (b.min.x <= hb.x && hb.x <= b.max.x && b.min.z <= hb.z && hb.z <= b.max.z
          && b.max.y >= hb.y0 && b.min.y <= hb.y1) {
        (window.__huntHits = window.__huntHits || []).push({
          col: mat && mat.color ? mat.color.getHexString() : null,
          bb: [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z]
            .map((v) => Math.round(v * 100) / 100),
          stack: String(new Error().stack || '').split('\n').slice(1, 5)
            .map((s) => s.trim()).join(' | '),
        });
      }
    }
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
    this._sayMissing();
    return meshes;
  }
  // SAY WHAT HAD NO MATERIAL. The whole point of the guard in add() is that a
  // missing MAT.* key used to be invisible in every log and merely odd-looking
  // in the world.
  _sayMissing() {
    if (MISSING_MAT > MISSING_MAT_SAID) {
      console.warn(`  ${MISSING_MAT - MISSING_MAT_SAID} merged pieces had NO MATERIAL `
        + `(drawn as concrete) — a missing MAT.* key renders as unlit white`);
      MISSING_MAT_SAID = MISSING_MAT;
    }
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
    this._sayMissing();
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
//
// FOUND ONE, 2026-08-05, and it is photographed. The Equarius Hotel is 69 x
// 165 m and `equariusHotel` drew a timber awning at EVERY floor with
// grow(1.07) — 7% of an 82m half-length is a 5.8m shelf, at seven levels. From
// the ESPA lawn the hotel read as a stack of enormous flat plates, like
// shelving, and the research it was built from says "timber louvred awnings
// over every window", which is under a metre. Same shape at hotelOra (1.14 on
// a 112 x 95m block) and theLaurus (1.06 on 166 x 115m).
//
// So AN EAVE IS A DISTANCE, NOT A PERCENTAGE. growM below offsets the ring by
// a fixed number of METRES along each vertex's mitred normal, which gives the
// same 0.9m awning on a beach hut and on a 165m wing. `grow` stays for the
// cases that genuinely are proportional (a band inset as a fraction of the
// plan, a hip roof stepping in toward its own centre); anything a person would
// describe in metres — eaves, awnings, cornices, canopies — uses growM.
function growM(pts, m) {
  const n = pts.length;
  // outward normal of each edge from the ring's GLOBAL winding (signedArea),
  // not from the centroid: the per-edge centroid test flips on the
  // courtyard-facing edges of a concave multi-arm ring (47 of Sofitel's 115
  // edges), which pushed "inset" hip layers ACROSS the courtyard notch and
  // earcut filled the crossing — a roof cap spanning the open court read as
  // a ceiling from inside it (sweep frame 060). Winding decides the outward
  // side for every edge of a simple ring, convex or not; OSM rings arrive
  // in both windings and signedArea's sign carries exactly that.
  const wind = signedArea(pts) > 0 ? 1 : -1;
  const out = [];
  for (let i = 0; i < n; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n];
    const ex = bx - ax, ez = bz - az;
    const L = Math.hypot(ex, ez) || 1;
    out.push([(ez / L) * wind, (-ex / L) * wind]);
  }
  return pts.map(([x, z], i) => {
    // mitre: average the normals of the two edges meeting at this vertex, and
    // lengthen by 1/cos(half-angle) so the offset edge really is m metres out
    const p = out[(i - 1 + n) % n], q = out[i];
    let nx = p[0] + q[0], nz = p[1] + q[1];
    const L = Math.hypot(nx, nz) || 1;
    nx /= L; nz /= L;
    const cosHalf = Math.max(0.34, nx * q[0] + nz * q[1]);
    const d = m / cosHalf;
    let gx = x + nx * d, gz = z + nz * d;
    if (!onCarriageway(gx, gz, 0.2)) return [gx, gz];
    // same walk-back as grow: an eave may not reach into a carriageway
    for (let t = d; t > 0; t -= Math.max(0.05, d / 20)) {
      gx = x + nx * t; gz = z + nz * t;
      if (!onCarriageway(gx, gz, 0.2)) return [gx, gz];
    }
    return [x, z];
  });
}
// ?pathdupe restores the old duplicate footpath surfacing for an A/B — see the
// note in buildRoads. Module scope because buildRoads has no VP of its own.
const PATH_DUPE = new URLSearchParams(location.search).has('pathdupe');

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

// D6a — AN OVERSAIL MAY NOT REACH INTO THE HOUSE NEXT DOOR.
//
// `grow` already pulls a ring back out of a carriageway, and that was the only
// thing an eave was ever asked about. The sweep filed the other half as "white
// eave-oversail slabs of adjacent row houses colliding into zigzag shards
// between rooflines" (D6a, Cove + Serapong rows) and it survived the roof-prism
// fix and the paleStone fix because neither was the cause.
//
// MEASURED BEFORE WRITING THIS, on the shipped scene: of the 371 Cove villas
// that reach the villa branch, 51 grow a roof slab whose ring lands INSIDE a
// neighbouring footprint. 43 of those neighbours stand at the SAME height —
// the two slabs are then coplanar and z-fight along the party line, which is
// the zigzag — 5 stand taller, so the slab is buried in a standing wall, and 3
// are shorter, so it hangs through their roof. Marina Collection alone is 10
// rings of one real building, all 13.6m: it was drawing ten overlapping caps.
//
// A real terrace stops its roof at the party wall. So: walk the vertex back,
// exactly as the carriageway case does, until it is out of every neighbour.
// The index is built once per world build, over every footprint, in 60m cells
// (the same cell size `_abuts` uses); a lookup is a handful of point-in-ring
// tests, and only the roof recipes that actually oversail pay for it.
const NBR_CELL = 60;
let _nbrCells = null, _nbrList = null;
export function setFootprintIndex(buildings) {
  _nbrList = (buildings || []).filter((b) => b.p && b.p.length >= 3);
  _nbrCells = new Map();
  _nbrList.forEach((b, i) => {
    let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const [x, z] of b.p) {
      if (x < mnx) mnx = x; if (x > mxx) mxx = x;
      if (z < mnz) mnz = z; if (z > mxz) mxz = z;
    }
    b.__bb = [mnx, mxx, mnz, mxz];
    for (let ci = Math.floor(mnx / NBR_CELL); ci <= Math.floor(mxx / NBR_CELL); ci++) {
      for (let cj = Math.floor(mnz / NBR_CELL); cj <= Math.floor(mxz / NBR_CELL); cj++) {
        const k = ci + ',' + cj;
        let s = _nbrCells.get(k);
        if (!s) _nbrCells.set(k, s = []);
        s.push(i);
      }
    }
  });
}
function _inNeighbour(x, z, self) {
  if (!_nbrCells) return false;
  const s = _nbrCells.get(Math.floor(x / NBR_CELL) + ',' + Math.floor(z / NBR_CELL));
  if (!s) return false;
  for (const i of s) {
    const o = _nbrList[i];
    if (o === self) continue;
    const bb = o.__bb;
    if (x < bb[0] || x > bb[1] || z < bb[2] || z > bb[3]) continue;
    const q = o.p;
    let c = false;
    for (let u = 0, v = q.length - 1; u < q.length; v = u++) {
      const xi = q[u][0], zi = q[u][1], xj = q[v][0], zj = q[v][1];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
    if (c) return true;
  }
  return false;
}
// grow(), plus: the ring may not enter another building's footprint either.
// Never walks BELOW the wall (t stops at 1), because the point is the eave,
// not the mass: a vertex that cannot get clear simply sits on its own wall.
// COUNTED, BECAUSE A GUARD THAT NEVER FIRES LOOKS EXACTLY LIKE A GUARD THAT
// WORKS. The Beach Station corner test passed every gate in this repo while
// changing nothing, and the only thing that exposed it was a number: `rings`
// is how many oversails were pulled back at all, `verts` how many vertices
// moved, `full` how many could not clear at any t and sit on their own wall.
const _clearStat = { rings: 0, verts: 0, full: 0, worst: 0, at: null };
export function oversailStat() { return { ..._clearStat }; }
function growClear(pts, f, self) {
  const c = centroid(pts);
  let moved = 0;
  const out = pts.map(([x, z]) => {
    const ox = x - c[0], oz = z - c[1];
    for (let t = f; t > 1; t -= 0.01) {
      const gx = c[0] + ox * t, gz = c[1] + oz * t;
      if (!onCarriageway(gx, gz, 0.2) && !_inNeighbour(gx, gz, self)) {
        if (t < f) {
          moved++; _clearStat.verts++;
          const d = Math.hypot(ox, oz) * (f - t);
          if (d > _clearStat.worst) { _clearStat.worst = +d.toFixed(2); _clearStat.at = [+x.toFixed(1), +z.toFixed(1)]; }
        }
        return [gx, gz];
      }
    }
    moved++; _clearStat.verts++; _clearStat.full++;
    const d = Math.hypot(ox, oz) * (f - 1);
    if (d > _clearStat.worst) { _clearStat.worst = +d.toFixed(2); _clearStat.at = [+x.toFixed(1), +z.toFixed(1)]; }
    return [x, z];
  });
  if (moved) _clearStat.rings++;
  return out;
}

// Plain painted render, cached per colour. Beach bars are flat white walls
// with no masonry pattern on them at all, and every textured pool in this file
// puts one there.
// THE REGISTER BAND'S MATERIAL, keyed on the band's own height in metres.
//
// The map has to sit ON the band once, not tile up it: the strip is 2.4m of
// wall by 0.6m as drawn, and the extruded ring's side-wall UVs are METRES (the
// measured rule — see the tail of texRender), so repeat.y is 0.6/thick and the
// glyphs land the right way up at the right size whatever ring is asked for.
// One material per distinct thickness, which in practice is one.
const _GLYPH = new Map();
function glyphMat(thick) {
  const key = thick.toFixed(2);
  let m = _GLYPH.get(key);
  if (!m) {
    const t = texGlyphBand();
    t.repeat.set(1 / 2.4, 0.6 / Math.max(thick, 0.05));   // the strip is 2.4m x 0.6m as drawn
    m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, color: 0xffffff });
    m.name = 'glyphBand';
    _GLYPH.set(key, m);
  }
  return m;
}

const _RENDER = new Map();
function renderMat(hex, shutter = false, show = false, coursed = null) {
  const key = hex + (shutter ? '|s' : '') + (show ? '|w' : '') + (coursed ? '|' + coursed : '');
  let m = _RENDER.get(key);
  if (!m) {
    // A WALL WITH NOTHING ON IT IS A BLOCKOUT BOX. This returned a flat colour
    // and no map, which is honest about the FINISH — these are painted render
    // — and produced buildings with no windows anywhere on them. The map is
    // drawn on white precisely so this tint keeps working: white x tint is the
    // tint, and the openings stay dark through the same multiply. That is the
    // failure the previous stone-map attempts hit, designed out.
    m = new THREE.MeshStandardMaterial({
      map: coursed ? coursedTex(hex, coursed)
        : show ? RENDER_TEX_SHOW : shutter ? RENDER_TEX_SHUTTER : RENDER_TEX,
      roughness: 0.9,
    });
    // A COURSED MAP IS DRAWN ON THE STONE'S OWN COLOUR, so it must NOT be
    // multiplied by it a second time. Every other map here is drawn on white
    // precisely so the tint lands through the multiply; these are not.
    m.color = new THREE.Color(coursed ? 0xffffff : hex);
    // NO TILE STATED HERE ON PURPOSE — the coursed maps carry their own scale in the
    // map's repeat. Setting material.userData.tile did not reach autoUV (the
    // mesh came back with geometry uvTile [12,12] and material tile null), and
    // a scale that silently does not apply is worse than one that lives beside
    // the drawing it scales. See the tail of texAshlar().
    _RENDER.set(key, m);
  }
  return m;
}

// THE GRANDSTAND. See the long note at its call site in buildBuildings for
// what it is, why it exists and where every figure came from
// (research/wings-of-time.md). This is only the geometry.
//
// The one structural decision worth stating here: the ring is split into a
// SEAWARD chain and a LANDWARD chain by the polygon's own principal axis, and
// which is which is asked of the terrain — the seaward side is the low side.
// Nothing is keyed to a compass bearing or to Sentosa: the same code draws a
// grandstand facing any direction, and the day a second one is surveyed it
// will not need touching.
// DOUBLE-SIDED, DELIBERATELY, AND THE RENDER IS THE REASON. Every surface here
// is a quad emitted from a ring whose winding depends on how the surveyor drew
// the polygon, so half the RISERS were culled and the bank read as a fan of
// floating pale ribs with grass showing between them
// (shots/street/gs6.shot1, cropped). Reasoning out the winding for an
// arbitrary ring is the kind of derivation this project keeps getting wrong;
// there is no interior to this structure and nothing to see the back of.
const GS_SIDE = { side: THREE.DoubleSide };

// BUILDING TYPES WHOSE OWN NAME IS A HEIGHT STATEMENT. A hut is single-storey
// because it is a hut; a grandstand is seating; a carport is one car tall. The
// same list lives in data/process.py (as `SELF_SCALED`, beside the defaults it
// sets) and data/heights.py imports it from there rather than re-typing it.
// This is the runtime's copy, and it exists because the RENDER has a third
// rule that re-scales a mass — the buried-on-a-slope growth in buildBuildings
// — which is not reachable from Python.
//
// `roof` IS IN THE PYTHON LIST AND DELIBERATELY NOT IN THIS ONE, and the
// difference is the whole point of keeping them separate rather than sharing
// one name. A canopy must not be BANDED by footprint (that took the Universal
// forecourt canopy to 20.4 m and blotted out the sky over the globe) — but it
// must still GROW to clear the hill it stands on, because its height is a
// clearance and a clearance that the ground swallows is a slab through a
// hillside. Adding `roof` here cost the fort-siloso golden 28.9%: a canopy
// that had been clearing the slope dropped into the frame as a grey concrete
// plate leaning across it. Caught by the goldens, which is what they are for.
const SELF_SCALED = new Set(['hut', 'grandstand', 'shed', 'kiosk', 'carport']);
const GS_MAT = {
  // pale exposed-aggregate (pebble-wash) concrete: treads, risers, apron
  step: new THREE.MeshStandardMaterial({ color: 0xd8d3c6, roughness: 0.94, ...GS_SIDE }),
  // "silvered warm grey-brown, NOT new-timber orange" — the research is
  // specific about this because weathered hardwood is the thing you see
  bench: new THREE.MeshStandardMaterial({ color: 0x8d8478, roughness: 0.9, ...GS_SIDE }),
  // Zone A. The single strongest colour on the structure and the reason the
  // bank is recognisable from the cable car at all
  premium: new THREE.MeshStandardMaterial({ color: 0xc9736b, roughness: 0.78, ...GS_SIDE }),
  // stair nosings, painted
  nosing: new THREE.MeshStandardMaterial({ color: 0xd8b13a, roughness: 0.8, ...GS_SIDE }),
  // the rear screen and the towers' louvre panels
  screen: new THREE.MeshStandardMaterial({ color: 0x6f5a45, roughness: 0.82, ...GS_SIDE }),
  tower: new THREE.MeshStandardMaterial({ color: 0xe6e2da, roughness: 0.86 }),
  cabin: new THREE.MeshStandardMaterial({ color: 0x5b6a72, roughness: 0.3, metalness: 0.2 }),
};

function gsQuadGeo(quads) {
  // quads: [[p0,p1,p2,p3], ...] each p = [x,y,z], wound so the face is up/out
  const pos = new Float32Array(quads.length * 6 * 3);
  let n = 0;
  for (const q of quads) {
    for (const i of [0, 1, 2, 0, 2, 3]) {
      pos[n++] = q[i][0]; pos[n++] = q[i][1]; pos[n++] = q[i][2];
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// The Wings of Time stage. Pale, angular, and OVER THE WATER.
//
// It was a 4 m tan box on the sea — `building=hut`, which is the only thing
// OSM says about it, and the generic rule for a hut is a shed. The research
// (research/wings-of-time.md, second pass) found the contractor's own page,
// and every dimension below except one is PUBLISHED:
//
//   LSE, who built it: "The projection surface consists in eight triangles and
//   one central diamond shape, covered by timber lattice and mounted on a
//   framework SIX METERS ABOVE THE SEA LEVEL", constructed in the ocean, and
//   "the arrangement of the individual shapes reminds of the wings of a bird".
//   ECA2, who made the show: the backdrop is 50 METRES WIDE and triangular.
//
// The one estimate is how TALL the array stands on its deck — no drawing and
// no architect credit exists — so it is drawn at the 3:1 span-to-height the
// photographs show and is labelled EST-PROPORTION in the research, not stated
// as if it were known.
//
// AND IT DOES NOT SIT ON THE HEIGHTFIELD. terrain.py keeps a grid cell dry when
// a building stands on it, which is right for a waterfront block and exactly
// wrong here: this footprint is inside the `sea` ring and the whole point of it
// is that it stands OUT of the water on legs. So the deck is 6 m above the
// SEA, which the grid ships as `sea` in its own post-rebase terms, and the legs
// run down into it. Nothing here reads TERRAIN.at().
const WOT_MAT = {
  // "covered by timber lattice" over a pale frame — grey-white, and it reads
  // as the one bright thing on the water at 150 m, which is its whole job
  sail: new THREE.MeshStandardMaterial({ color: 0xe8e6df, roughness: 0.72, side: THREE.DoubleSide }),
  // the lattice battens and the frame edges, a shade down so the panels have
  // an edge rather than dissolving into one white blob
  frame: new THREE.MeshStandardMaterial({ color: 0xb9b4a8, roughness: 0.8, side: THREE.DoubleSide }),
  // the deck and the legs: dark, because in every photograph the structure
  // reads as pale shapes floating over a dark base
  deck: new THREE.MeshStandardMaterial({ color: 0x3b3a36, roughness: 0.9, side: THREE.DoubleSide }),
};

function buildWingsStage(ring, merger, seaY) {
  let cx = 0, cz = 0;
  for (const [x, z] of ring) { cx += x; cz += z; }
  cx /= ring.length; cz /= ring.length;
  // principal axis of the surveyed ring — 77.6 m long on this footprint
  let sxx = 0, sxz = 0, szz = 0;
  for (const [x, z] of ring) {
    const dx = x - cx, dz = z - cz;
    sxx += dx * dx; sxz += dx * dz; szz += dz * dz;
  }
  const tr = sxx + szz, det = sxx * szz - sxz * sxz;
  const lam = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det));
  let ax = sxz, az = lam - sxx;
  if (Math.hypot(ax, az) < 1e-6) { ax = 1; az = 0; }
  const aL = Math.hypot(ax, az); ax /= aL; az /= aL;
  const nx = -az, nz = ax;                  // across the axis

  const DECK = seaY + 6.0;                  // PUBLISHED
  const quads = [];
  const push = (a, b, c, d) => quads.push([a, b, c, d]);
  const P = (u, v, y) => [cx + ax * u + nx * v, y, cz + az * u + nz * v];

  // --- the framework -------------------------------------------------------
  // A STRAIGHT BAR ON THE SURVEYED AXIS, not the surveyed ring traced.
  //
  // The first cut walked the ring as a 5.2 m walkway and it came out a black
  // zigzag sprawling over the beach (shots/street/stage2.shot2): that ring is
  // a thin angular chevron, 677 m² inside a 78x57 m box, which is the frame's
  // OUTLINE and not a plan you can offset. What the sources actually describe
  // is one framework carrying one composition — so the axis and the centre are
  // taken from the survey, which is what the map knows, and the shape of the
  // deck is authored, which is what the map does not.
  const BAR = 54.0, HALF = 3.4, TH = 0.6;   // long enough to carry the 50 m array
  for (const y of [DECK, DECK - TH]) {
    push(P(-BAR / 2, HALF, y), P(BAR / 2, HALF, y),
         P(BAR / 2, -HALF, y), P(-BAR / 2, -HALF, y));
  }
  for (const s2 of [1, -1]) {
    push(P(-BAR / 2, HALF * s2, DECK - TH), P(BAR / 2, HALF * s2, DECK - TH),
         P(BAR / 2, HALF * s2, DECK), P(-BAR / 2, HALF * s2, DECK));
  }
  for (const u of [-BAR / 2, BAR / 2]) {
    push(P(u, HALF, DECK - TH), P(u, -HALF, DECK - TH),
         P(u, -HALF, DECK), P(u, HALF, DECK));
  }
  // slender legs into the water, two rows, every 6 m
  for (let u = -BAR / 2 + 3; u <= BAR / 2 - 3; u += 6) {
    for (const v of [HALF - 0.7, -(HALF - 0.7)]) {
      const q = P(u, v, 0);
      const g = new THREE.BoxGeometry(0.42, 7.0, 0.42);
      g.translate(q[0], DECK - TH - 3.5, q[2]);
      merger.add(g, WOT_MAT.deck, q[0], q[2]);
    }
  }
  merger.add(gsQuadGeo(quads), WOT_MAT.deck, cx, cz);

  // --- the projection surface: 8 triangles and 1 central diamond ----------
  // 50 m wide (PUBLISHED), standing on the deck and facing the audience across
  // the water. "The arrangement of the individual shapes reminds of the wings
  // of a bird" is the only description of the composition that exists, so the
  // heights fan from a central peak down to the tips, which is what that
  // sentence describes and what the show's own artwork shows.
  const SPAN = 50.0;                        // PUBLISHED
  const APEX = 12.0;                        // EST-PROPORTION, see the research
  const panes = [], batten = [];

  // PEAKS, STANDING ON THE DECK. The first cut made each element a trapezoid
  // whose top raked gently from one neighbour to the next, and eight of those
  // in a row read as a fence of grey boards, not as sails — the top edges were
  // barely 2 m apart over a 5.6 m span, so nothing came to a point. "Eight
  // triangles and one central diamond" means eight TRIANGLES: base on the deck,
  // apex above the middle of it, each one lower than the one inboard, which is
  // the row of folded-paper peaks every photograph of this thing shows and the
  // silhouette that identifies the place from the cable car.
  const dW = 6.0;
  const H_AT = (k) => APEX * (0.74 - 0.145 * (k - 1));    // 8.9 -> 4.6 m
  const D = DECK + 0.25;

  // the central diamond, on the axis, tallest thing here — a rhombus resting
  // on its lower point, which is how the backdrop reads head-on
  panes.push([P(0, 0, D), P(-dW, 0, D + APEX * 0.52),
              P(0, 0, D + APEX), P(dW, 0, D + APEX * 0.52)]);
  for (let c = 1; c <= 4; c++) {            // its lattice, following the shape
    const f = c / 5, w = dW * (f < 0.52 ? f / 0.52 : (1 - f) / 0.48);
    batten.push([P(-w, 0, D + APEX * f), P(w, 0, D + APEX * f),
                 P(w, 0, D + APEX * f - 0.18), P(-w, 0, D + APEX * f - 0.18)]);
  }

  for (const side of [1, -1]) {
    for (let k = 1; k <= 4; k++) {
      const step = (SPAN / 2 - dW) / 4;
      const u0 = side * (dW + (k - 1) * step), u1 = side * (dW + k * step);
      const um = (u0 + u1) / 2, h = H_AT(k);
      // alternate the apex a little off the plane so the row reads as facets
      // catching different light, which is what "folded" means here
      const v = ((k % 2) ? 1 : -1) * 1.3;
      panes.push([P(u0, 0, D), P(u1, 0, D), P(um, v, D + h), P(um, v, D + h)]);
      // "COVERED BY TIMBER LATTICE" — battens INSIDE each pane's own outline.
      // The first cut ran six courses across the whole 50 m and they carried on
      // past the panels into open sky as long grey wires.
      for (let c = 1; c <= 3; c++) {
        const f = c / 4, y = D + h * f;
        const a = [u0 + (um - u0) * f, u1 + (um - u1) * f];
        batten.push([P(a[0], v * f, y), P(a[1], v * f, y),
                     P(a[1], v * f, y - 0.18), P(a[0], v * f, y - 0.18)]);
      }
      // the frame edges up both rakes, so a peak has an outline against the sky
      for (const [ue, ve] of [[u0, 0], [u1, 0]]) {
        batten.push([P(ue, ve, D), P(um, v, D + h),
                     P(um - (um - ue) * 0.06, v, D + h - 0.5), P(ue + (um - ue) * 0.06, ve, D)]);
      }
    }
  }
  merger.add(gsQuadGeo(panes), WOT_MAT.sail, cx, cz);
  merger.add(gsQuadGeo(batten), WOT_MAT.frame, cx, cz);
}

function buildGrandstand(ring, merger, world) {
  // --- 1. principal axis, and the two ends of the band --------------------
  let cx = 0, cz = 0;
  for (const [x, z] of ring) { cx += x; cz += z; }
  cx /= ring.length; cz /= ring.length;
  let sxx = 0, sxz = 0, szz = 0;
  for (const [x, z] of ring) {
    const dx = x - cx, dz = z - cz;
    sxx += dx * dx; sxz += dx * dz; szz += dz * dz;
  }
  // largest eigenvector of [[sxx,sxz],[sxz,szz]], in closed form
  const tr = sxx + szz, det = sxx * szz - sxz * sxz;
  const lam = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det));
  let ax = sxz, az = lam - sxx;
  if (Math.hypot(ax, az) < 1e-6) { ax = 1; az = 0; }
  const aL = Math.hypot(ax, az); ax /= aL; az /= aL;
  const proj = ring.map(([x, z]) => (x - cx) * ax + (z - cz) * az);
  let iMin = 0, iMax = 0;
  for (let i = 1; i < ring.length; i++) {
    if (proj[i] < proj[iMin]) iMin = i;
    if (proj[i] > proj[iMax]) iMax = i;
  }
  const chainA = [], chainB = [];
  for (let k = 0, i = iMin; ; k++) {
    chainA.push(ring[i]);
    if (i === iMax) break;
    i = (i + 1) % ring.length;
    if (k > ring.length) break;
  }
  for (let k = 0, i = iMax; ; k++) {
    chainB.push(ring[i]);
    if (i === iMin) break;
    i = (i + 1) % ring.length;
    if (k > ring.length) break;
  }
  chainB.reverse();                      // both now run iMin -> iMax
  if (chainA.length < 2 || chainB.length < 2) return;

  // --- 2. WHICH CHAIN FACES THE SHOW? ASK THE WATER, NOT THE GROUND. ------
  //
  // First cut asked the terrain and took the LOW chain as seaward. It picked
  // the wrong side, and the reason is worth keeping: THE BAND IS SHALLOWER
  // THAN A TERRAIN CELL. Depth is 20-27 m on a 35 m heightfield, and the slope
  // here runs ALONG the arc rather than across it, so the two chains measure
  // 17.8 m and 19.2 m mean — a coin flip, and the coin came down backwards.
  // Matched station pairs disagree with each other:
  //
  //     (-1830.8,12752.2) 23.2   vs  (-1799.1,12752.1) 19.5   -> B lower
  //     (-1867.2,12731.1) 26.6   vs  (-1856.6,12715.6) 28.4   -> A lower
  //
  // Probing OUTWARD instead is unambiguous, because the thing on one side is
  // the Singapore Strait. 20/40/60/80/120 m out from each chain's midpoint:
  //
  //     chain A   water at 40, 60, 80, 120 m      seaDist 140 -> 70
  //     chain B   no water at any distance        seaDist unreachable
  //
  // Chain A it is, which is also what the research says (audience faces SW,
  // 225-232 deg; the stage bears 221 deg). A measurement that cannot resolve
  // a question should not be asked it.
  const openness = (ch, sign) => {
    const m = ch[Math.floor(ch.length / 2)];
    const o = (sign === 1 ? chainB : chainA)[Math.floor((sign === 1 ? chainB : chainA).length / 2)];
    let dx = m[0] - o[0], dz = m[1] - o[1];
    const L = Math.hypot(dx, dz);
    if (L < 1e-6) return 0;
    dx /= L; dz /= L;
    let wet = 0;
    for (const d of [20, 40, 60, 80, 120]) {
      const x = m[0] + dx * d, z = m[1] + dz * d;
      if (window.__inWater && window.__inWater(x, z)) wet++;
    }
    return wet;
  };
  const wetA = openness(chainA, 1), wetB = openness(chainB, -1);
  let front = chainA, back = chainB;
  if (wetB > wetA) { front = chainB; back = chainA; }
  else if (wetA === wetB) {
    // no water either side (a grandstand at a stadium, an inland arena): the
    // low side is the field, and now the fallback IS the best evidence there is
    const meanG = (ch) => {
      let s = 0;
      for (const [x, z] of ch) s += TERRAIN.at(x, z);
      return s / ch.length;
    };
    if (meanG(chainA) > meanG(chainB)) { front = chainB; back = chainA; }
  }

  // --- 3. resample both chains to matched stations ------------------------
  const resample = (ch, n) => {
    const seg = [], out = [];
    let total = 0;
    for (let i = 0; i < ch.length - 1; i++) {
      const L = Math.hypot(ch[i + 1][0] - ch[i][0], ch[i + 1][1] - ch[i][1]);
      seg.push(L); total += L;
    }
    if (total < 1e-6) return null;
    for (let j = 0; j <= n; j++) {
      let want = (j / n) * total, i = 0;
      while (i < seg.length - 1 && want > seg[i]) { want -= seg[i]; i++; }
      const t = seg[i] > 1e-6 ? Math.min(1, want / seg[i]) : 0;
      out.push([ch[i][0] + (ch[i + 1][0] - ch[i][0]) * t,
                ch[i][1] + (ch[i + 1][1] - ch[i][1]) * t]);
    }
    return out;
  };
  const S = 40;
  const F = resample(front, S), B = resample(back, S);
  if (!F || !B) return;

  // --- 4. the datum: terrain along the front line, SMOOTHED ---------------
  //
  // See the call site. Raked across the depth, smoothed along the arc.
  //
  // AND THIS IS DOWNSTREAM OF A TERRAIN DEFECT, STATED SO THE NEXT PERSON DOES
  // NOT RE-DERIVE IT. The real front row is at beach level and the bank is
  // essentially level along its length. Our heightfield runs 26.6 m at the
  // north-west end of this front line to 7.4 m at the south-east — a 19 m fall
  // that is not there, Mount Imbiah's toe reaching the waterline through a
  // 35 m cell. Probed outward, the ground 40-120 m out on the SEA side reads
  // 16.4, 16.2, 16.5, 9.8 m while the water layer says water: the beach in
  // front of this thing is modelled as a bank, not a strip.
  //
  // Following the ground gives an amphitheatre cut into a hillside, which is
  // coherent. Laying it level would bury the north-west end nineteen metres.
  // So it follows, and when Siloso's terrain is fixed this same code draws the
  // level bank the real one is, with no change here.
  const ROWS = 17;              // ~16-20 rows, DERIVED
  const RISE = 0.32;            // ~0.30-0.35 m, EST-PHOTO
  const APRON = 5.0;            // flat boardwalk at the foot, EST-PHOTO
  const lerp = (a, b2, t) => [a[0] + (b2[0] - a[0]) * t, a[1] + (b2[1] - a[1]) * t];
  // per station: the apron line, and the seating band from there to the back
  const A = [];
  for (let j = 0; j <= S; j++) {
    const d = Math.hypot(B[j][0] - F[j][0], B[j][1] - F[j][1]);
    A.push(lerp(F[j], B[j], d > 1e-6 ? Math.min(0.5, APRON / d) : 0));
  }

  // A RUNNING MAX, THEN THE SMOOTH — not the smooth alone.
  //
  // A mean pulls the datum BELOW the ground wherever the ground bulges, and a
  // platform below the ground it stands on is a platform with grass growing
  // through it: rendered from the beach the apron came out as a fan of pale
  // ribs with green wedges between them, which is the heightfield poking up
  // between the treads. Taking the local MAXIMUM first puts the platform on
  // top of every bump inside the window, and smoothing after keeps the line
  // level; the cost is that the front lip stands a little proud on a dip,
  // which is what a real deck on a slope does and is why it has a fascia.
  const raw = F.map((p, j) => Math.max(TERRAIN.at(p[0], p[1]),
                                       TERRAIN.at(A[j][0], A[j][1])));
  const hiRaw = raw.map((_, j) => {
    let m = -Infinity;
    for (let d = -4; d <= 4; d++) {
      const k = j + d;
      if (k >= 0 && k < raw.length) m = Math.max(m, raw[k]);
    }
    return m;
  });
  // ...AND THE CLIMB ALONG THE ARC IS BOUNDED, BECAUSE A GRANDSTAND IS LEVEL.
  //
  // Following the heightfield gave a bank that rose 19 m from one end to the
  // other, and the frame that showed it was the worst one possible: the SPAWN
  // POINT stands 12 m from this footprint, and the first thing in the world
  // became a ten-metre pale wall across the whole view with the near plane
  // punching a black hole in the top corner. (That is this file's oldest trap
  // and its own golden note names it: a surface closer than the near plane is
  // a black wall.)
  //
  // The real bank is level. Our DEM's 19 m is Mount Imbiah's toe arriving
  // through a 35 m cell — see the note above and research/wings-of-time.md.
  // So the datum is allowed to CLIMB only CLIMB_MAX from its lowest point:
  // the seaward end sits on the ground on a taller fascia, and the landward
  // end is swallowed by the hill, which is what "cut into the slope" means and
  // is what the research describes. Nothing is drawn floating either way.
  const loRaw = Math.min(...raw);
  // CLIMB_MAX is a measured trade, not a taste. raw runs 7.4 m at the seaward
  // end to 26.6 m at the landward one, and the bank stands proud of the ground
  // wherever terrain < lo + CLIMB_MAX + 5.4 (its own height):
  //
  //      3 m   spawn frame clean, but HALF THE BANK is inside the hill
  //      8 m   ~70% of it stands, and its near end tops out ~1 m above the
  //            spawn's own ground 12 m away, so it does not wall that frame
  //     12 m   ~85% stands, and the near end is 5 m proud at the spawn, which
  //            is the wall this whole recipe exists to remove
  const CLIMB_MAX = 8.0;
  const capped = hiRaw.map((v) => Math.min(v, loRaw + CLIMB_MAX));
  const y0 = capped.map((_, j) => {
    let s = 0, n = 0;
    for (let d = -6; d <= 6; d++) {
      const k = j + d;
      if (k < 0 || k >= capped.length) continue;
      s += capped[k]; n++;
    }
    return Math.min(Math.max(s / n, Math.min(raw[j], loRaw + CLIMB_MAX)),
                    loRaw + CLIMB_MAX) + 0.12;
  });
  const rowPt = (j, k) => lerp(A[j], B[j], k / ROWS);
  const rowY = (j, k) => y0[j] + k * RISE;

  // --- 5. apron, treads and risers ----------------------------------------
  const steps = [];
  for (let j = 0; j < S; j++) {
    // the flat apron in front of the first row
    steps.push([[F[j][0], y0[j], F[j][1]], [F[j + 1][0], y0[j + 1], F[j + 1][1]],
                [A[j + 1][0], y0[j + 1], A[j + 1][1]], [A[j][0], y0[j], A[j][1]]]);
    for (let k = 0; k < ROWS; k++) {
      const p0 = rowPt(j, k), p1 = rowPt(j + 1, k);
      const q0 = rowPt(j, k + 1), q1 = rowPt(j + 1, k + 1);
      const ya = rowY(j, k), yb = rowY(j + 1, k);
      const yc = rowY(j, k + 1), yd = rowY(j + 1, k + 1);
      // tread: horizontal, from this row's line to the next
      steps.push([[p0[0], ya, p0[1]], [p1[0], yb, p1[1]],
                  [q1[0], yb, q1[1]], [q0[0], ya, q0[1]]]);
      // riser: vertical, at the next row's line
      steps.push([[q0[0], ya, q0[1]], [q1[0], yb, q1[1]],
                  [q1[0], yd, q1[1]], [q0[0], yc, q0[1]]]);
    }
  }
  // ...AND THE STRUCTURE HAS TO MEET THE GROUND, which the first cut did not.
  // Rendered from the beach (shots/street/gs5.shot2) the bank stood on nothing
  // along its low edge and you could see UP INTO the treads: a comb of thin
  // fins, because a tread is a one-sided quad with no underside. A real bank
  // has a fascia wall at the front and closed ends, and drawing them is both
  // the honest form and the whole fix.
  const skirt = [];
  const gAt = (p) => TERRAIN.at(p[0], p[1]);
  for (let j = 0; j < S; j++) {
    const ya = y0[j], yb = y0[j + 1];
    const ga = Math.min(gAt(F[j]), ya) - 0.35, gb = Math.min(gAt(F[j + 1]), yb) - 0.35;
    skirt.push([[F[j][0], ga, F[j][1]], [F[j + 1][0], gb, F[j + 1][1]],
                [F[j + 1][0], yb, F[j + 1][1]], [F[j][0], ya, F[j][1]]]);
  }
  for (const [j, flip] of [[0, false], [S, true]]) {
    const g = Math.min(gAt(F[j]), gAt(B[j]), y0[j]) - 0.35;
    const top = rowY(j, ROWS);
    const q = [[F[j][0], g, F[j][1]], [B[j][0], g, B[j][1]],
               [B[j][0], top, B[j][1]], [F[j][0], y0[j], F[j][1]]];
    skirt.push(flip ? q : [q[3], q[2], q[1], q[0]]);
  }
  merger.add(gsQuadGeo(steps.concat(skirt)), GS_MAT.step, cx, cz);

  // --- 6. the benches, and Zone A ----------------------------------------
  // One ribbon per row rather than a box per seat: 2,500 seats is 2,500 draw
  // calls' worth of nothing, and at any distance a bench bank reads as bands.
  // Zone A is the middle third of the arc, in the rear third of the rows —
  // where the satellite shows the orange-red patch.
  const benches = [], premium = [];
  for (let k = 1; k <= ROWS; k++) {
    for (let j = 0; j < S; j++) {
      const t0 = (k - 0.72) / ROWS, t1 = (k - 0.24) / ROWS;
      const a0 = lerp(A[j], B[j], t0), a1 = lerp(A[j + 1], B[j + 1], t0);
      const b0 = lerp(A[j], B[j], t1), b1 = lerp(A[j + 1], B[j + 1], t1);
      const ya = rowY(j, k - 1) + 0.46, yb = rowY(j + 1, k - 1) + 0.46;
      const quad = [[a0[0], ya, a0[1]], [a1[0], yb, a1[1]],
                    [b1[0], yb, b1[1]], [b0[0], ya, b0[1]]];
      const mid = j > S * 0.33 && j < S * 0.67 && k > ROWS * 0.55 && k <= ROWS * 0.88;
      (mid ? premium : benches).push(quad);
    }
  }
  merger.add(gsQuadGeo(benches), GS_MAT.bench, cx, cz);
  if (premium.length) merger.add(gsQuadGeo(premium), GS_MAT.premium, cx, cz);

  // --- 7. the yellow stair nosings, every ~12 m along the arc -------------
  let arc = 0;
  const aisleAt = new Set();
  for (let j = 0; j < S; j++) {
    arc += Math.hypot(F[j + 1][0] - F[j][0], F[j + 1][1] - F[j][1]);
    if (arc >= 12) { aisleAt.add(j); arc = 0; }
  }
  // AN AISLE IS 1.4 m WIDE, NOT A WHOLE STATION. The first cut painted the
  // full 3.6 m segment between stations, so the nosings read as big yellow
  // dashes scattered across the bank instead of a ladder of stair treads
  // climbing it. An aisle you could drive a car up is not an aisle.
  const AISLE_W = 1.4;
  const nosings = [];
  for (const j of aisleAt) {
    for (let k = 1; k <= ROWS; k++) {
      const p = rowPt(j, k), q = rowPt(j + 1, k);
      let ux = q[0] - p[0], uz = q[1] - p[1];
      const uL = Math.hypot(ux, uz) || 1;
      ux = (ux / uL) * AISLE_W; uz = (uz / uL) * AISLE_W;
      const y = rowY(j, k) + 0.02;
      const nx = B[j][0] - A[j][0], nz = B[j][1] - A[j][1];
      const nL = Math.hypot(nx, nz) || 1;
      const ox = (nx / nL) * 0.3, oz = (nz / nL) * 0.3;
      nosings.push([[p[0], y, p[1]], [p[0] + ux, y, p[1] + uz],
                    [p[0] + ux + ox, y, p[1] + uz + oz], [p[0] + ox, y, p[1] + oz]]);
    }
  }
  if (nosings.length) merger.add(gsQuadGeo(nosings), GS_MAT.nosing, cx, cz);

  // --- 8. the rear screen, and the control towers -------------------------
  // "the top row backs onto a dark brown timber-slat screen ~1.8-2.5 m high"
  //
  // SLATS, WITH THE GAPS DRAWN. It was one solid 2.2 m panel running the whole
  // 140 m arc, and the word in the research it is built from is SLAT.
  //
  // The difference is not a detail, it is the whole read of the thing from
  // behind. The screen faces NE and the sun is at (-0.52, 0.80, -0.30), so its
  // outward face never catches a direct ray: 0x4a3a2c under ambient alone is
  // visually black, and a 140 m unbroken band of it is a black wall across the
  // sky (shots/street/spawnview.shot1 — named by tinting the material, not
  // guessed). The terrain fix is what exposed it. The old heightfield stood the
  // ground behind this bank 20 m too high, so you looked DOWN on the screen and
  // saw a dark line; at the beach level the ground really is, you stand behind
  // it and it fills the frame.
  //
  // Six 0.22 m battens on a 0.36 m pitch is the reference's proportion and it
  // shows sky between them, so the mass reads as a screen rather than a void —
  // and it is what a slat screen is FOR, which is wind through and view out.
  // Cost is 6 slats x 40 stations x 2 faces = 480 quads on a structure that
  // already draws 1,400, and it merges into the same batch.
  const screen = [];
  const SLAT_H = 0.22, SLAT_PITCH = 0.36, SLAT_N = 6;
  for (let j = 0; j < S; j++) {
    const ya = rowY(j, ROWS), yb = rowY(j + 1, ROWS);
    for (let s = 0; s < SLAT_N; s++) {
      const lo = 0.16 + s * SLAT_PITCH, hi = lo + SLAT_H;
      screen.push([[B[j][0], ya + lo, B[j][1]], [B[j + 1][0], yb + lo, B[j + 1][1]],
                   [B[j + 1][0], yb + hi, B[j + 1][1]], [B[j][0], ya + hi, B[j][1]]]);
      screen.push([[B[j + 1][0], yb + lo, B[j + 1][1]], [B[j][0], ya + lo, B[j][1]],
                   [B[j][0], ya + hi, B[j][1]], [B[j + 1][0], yb + hi, B[j + 1][1]]]);
    }
  }
  // the posts the battens are fixed to, every ~9 m, so the screen has a frame
  // rather than floating bands
  for (let j = 0; j <= S; j += Math.max(1, Math.round(S / 15))) {
    const nx = B[j][0] - A[j][0], nz = B[j][1] - A[j][1];
    const nL = Math.hypot(nx, nz) || 1;
    const ux = -(nz / nL) * 0.09, uz = (nx / nL) * 0.09;   // along the arc
    const y = rowY(j, ROWS);
    for (const sgn of [1, -1]) {
      screen.push([[B[j][0] - ux * sgn, y, B[j][1] - uz * sgn],
                   [B[j][0] + ux * sgn, y, B[j][1] + uz * sgn],
                   [B[j][0] + ux * sgn, y + 2.34, B[j][1] + uz * sgn],
                   [B[j][0] - ux * sgn, y + 2.34, B[j][1] - uz * sgn]]);
    }
  }
  merger.add(gsQuadGeo(screen), GS_MAT.screen, cx, cz);

  // Two of them, at the top rear near each end — "the only roofed elements on
  // the whole structure", and the tallest thing here at about 9 m, which is
  // still less than half what the generic box was.
  for (const j of [Math.round(S * 0.16), Math.round(S * 0.84)]) {
    const nx = B[j][0] - A[j][0], nz = B[j][1] - A[j][1];
    const nL = Math.hypot(nx, nz) || 1;
    const bx = B[j][0] + (nx / nL) * 2.6, bz = B[j][1] + (nz / nL) * 2.6;
    const ang = Math.atan2(nx, nz);
    const base = rowY(j, ROWS);
    const box = (w, hgt, d, y, mat) => {
      const g = new THREE.BoxGeometry(w, hgt, d);
      g.rotateY(ang);
      g.translate(bx, y + hgt / 2, bz);
      merger.add(g, mat, bx, bz);
    };
    box(6.4, 6.2, 5.0, base - 1.2, GS_MAT.tower);          // rendered shaft
    box(6.6, 1.1, 5.2, base + 2.4, GS_MAT.screen);         // louvre band
    box(5.2, 2.4, 4.2, base + 5.0, GS_MAT.cabin);          // glazed cabin
    box(5.8, 0.24, 4.8, base + 7.4, GS_MAT.tower);         // its flat cap
  }
}

export async function buildBuildings(world, data, Y = null) {
  // the district decides its own default facade character from its own tags
  setDistrictCharacter(data.buildings || []);
  // D6a: the neighbour index every oversail is measured against (growClear)
  setFootprintIndex(data.buildings || []);
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
  // buildings that are one real structure mapped as several overlapping rings
  const _overlapped = new Set();
  {
    const small = [];
    for (const b of (data.buildings || [])) {
      if (!b.k && b.a < 520 && b.h <= 20 && b.p && b.p.length <= 64) small.push(b);
    }
    // how many small footprints carry each name — >1 means one real building
    // mapped as several rings
    const _nameCount = new Map();
    for (const b of small) if (b.n) _nameCount.set(b.n, (_nameCount.get(b.n) || 0) + 1);
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
      // OVERLAP IS NOT ABUTMENT, AND ONE OF THEM IS A DEFECT.
      //
      // Abutting is a terrace and is what the shophouse recipe is FOR. But some
      // buildings are mapped as several OVERLAPPING footprints of one real
      // structure, and then every segment grows its own pitched roof at its own
      // oriented-box angle and they collide. Beach Station is four rings all
      // named "Beach Lrt Station (s4)", 175-203 m2, every one h 10, staggered
      // so each overlaps the next: the real thing is one long curved station.
      // That collision is the grey wedge in `beach-walk`, the frame whose
      // golden has been carrying a KNOWN DEFECT note since the roof prism was
      // turned the right way up and made it visible.
      //
      // AND THE MAP SAYS IT OUTRIGHT: THEY SHARE A NAME.
      //
      // A corner test was tried first and MEASURED USELESS on the case it was
      // written for — Beach Station's four rings put at most 25% of their
      // corners inside a neighbour (0%, 25%, 25%, 17%), because a staggered
      // chain overlaps by AREA while its corners fall outside. The 40% gate
      // never fired and the fix changed nothing; the golden proved it by not
      // moving.
      //
      // Four rings carrying the identical name IS the survey telling you it is
      // one structure. Sentosa's named multi-ring buildings are exactly the
      // ones that need it — Beach Lrt Station 4 rings, Marina Collection 10,
      // Seven Palms 6, Shark Encounter 5 — and a shared name is free to read.
      // The corner test stays as a second trigger for the unnamed cases.
      let inOther = 0, tested = 0;
      for (const j of near) {
        const q = small[j].p;
        let hit = 0;
        for (const [px, pz] of b.p) {
          let c2 = false;
          for (let u = 0, v = q.length - 1; u < q.length; v = u++) {
            const xi = q[u][0], zi = q[u][1], xj = q[v][0], zj = q[v][1];
            if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) c2 = !c2;
          }
          if (c2) hit++;
        }
        if (hit > inOther) inOther = hit;
        tested++;
      }
      if (tested && b.p.length && inOther / b.p.length >= 0.4) _overlapped.add(b);
      if (b.n && (_nameCount.get(b.n) || 0) > 1) _overlapped.add(b);
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
  // AND WHICH COVE, NOT JUST THE COVE. The five islands are separately
  // mastered and separately designed and every one of their names is already
  // in the surveyed road layer, so the vocabulary keys off SURVEY. See
  // research/sentosa-cove.md for the published character of each.
  const _coveIsle = (n) => (/sandy island/i.test(n) ? 'sandy'
    : /coral island/i.test(n) ? 'coral'
    : /paradise island/i.test(n) ? 'paradise'
    : /treasure island/i.test(n) ? 'treasure'
    : /pearl island/i.test(n) ? 'pearl' : 'street');
  const _coveSegs = [];
  for (const r of (data.roads || [])) {
    if (!r.n || !_coveRe.test(r.n)) continue;
    const p = r.p || [];
    const isle = _coveIsle(r.n);
    for (let i = 0; i < p.length - 1; i++) _coveSegs.push([p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], isle]);
  }
  const _cove = new Set();
  // the villas that actually reached the villa branch — the plot pass at the
  // end of this function dresses these and nothing else
  const _coveVillas = [];
  // building -> which island it fronts, by NEAREST cove segment
  const _coveIsleOf = new Map();
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
      // NEAREST wins, not first-within-90m: an island villa can be inside the
      // reach of Ocean Drive as well as its own island road, and whichever
      // segment happened to be earlier in the array would otherwise decide its
      // architecture.
      let _bd = Infinity, _bi = null;
      for (const [ax, az, cx2, cz2, isle] of _coveSegs) {
        const vx = cx2 - ax, vz = cz2 - az;
        const L2 = vx * vx + vz * vz || 1;
        let t = ((bx - ax) * vx + (bz - az) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const d = Math.hypot(bx - (ax + vx * t), bz - (az + vz * t));
        if (d < 90 && d < _bd) { _bd = d; _bi = isle; }
      }
      if (_bi) { _cove.add(b); _coveIsleOf.set(b, _bi); }
    }
  }
  // BBOX FIRST — the EIGHTH unindexed ring scan found by profiling
  // (2026-08-19, 313ms of boot): this ran full parity over every water ring,
  // the strait mega-ring included, per query. A point outside a ring's box is
  // outside the ring; the answers cannot change.
  const _wrings = (data.water || []).map((w) => w.p).filter((p) => p && p.length > 3)
    .map((p) => {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (const [qx, qz] of p) {
        if (qx < x0) x0 = qx; if (qx > x1) x1 = qx;
        if (qz < z0) z0 = qz; if (qz > z1) z1 = qz;
      }
      return [p, x0, x1, z0, z1];
    });
  const _inWaterRing = (x, z) => {
    for (const [ring, x0, x1, z0, z1] of _wrings) {
      if (x < x0 || x > x1 || z < z0 || z > z1) continue;
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
    world, grow, growM, axis: data.axis || null,
    // walkable ways too, for frontages on pedestrianised streets (Emerald
    // Hill since 1981) where the road index has nothing to point at
    walkways: (data.roads || []).filter((r) => r.k === 'pedestrian' || r.k === 'footway'),
    // carriageways too, for porte-cochere recipes: a building a surveyed
    // service road runs through must not wall that road, and only the recipe
    // knows which of its panels stand where the road passes
    drives: (data.roads || []).filter((r) => r.k === 'service' || r.k === 'residential'
      || r.k === 'unclassified' || r.k === 'living_street' || r.k === 'tertiary'),
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
           darkMetal: MAT.darkMetal, roofDeck: MAT.roofDeck },
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
  // A BUILDING PART MUST NOT FLOAT, AND MUST NOT ARGUE WITH A RECIPE.
  //
  // Found 2026-08-05 by rendering RWS: four near-black slabs hung in the sky
  // over Hotel Michael, 40m clear of its roof. They are OSM `building:part=yes`
  // polygons — SEVEN of them along the hotel's curve, tagged
  // `building:levels=20, building:min_level=12, building:colour=#90a29e,
  // roof:shape=round` — which is the mapper's description of Hotel Michael's
  // OWN ROOF VAULTS. Read as levels at 3.4m they became a mass from 40.8m to
  // 68m, on a hotel whose published storey count is ELEVEN and whose surveyed
  // height is 37.4m. Two of the seven are worse than floating: h=36.6 with
  // mh=40.8, a mass whose top is below its own base.
  //
  // Two rules, and the first is the one that matters here:
  //
  // 1. A NAMED RECIPE OWNS ITS BUILDING'S WHOLE FORM. hotelMichael already
  //    builds this exact vault run from the research. A part inside a
  //    recipe-built footprint is the same building described twice, so it is
  //    skipped. Same rule as "a named recipe outranks the generic roof slab",
  //    one level down.
  // 2. Otherwise, a part whose base stands clear above everything under it is
  //    SEATED on the tallest mass it sits inside, rather than left in the air.
  //    Refusing to draw it would lose a real roof form; leaving it floating is
  //    the "road in the sky" class the owner has reported three times.
  //
  // Both are measured, not guessed: island-wide there are 20 parts, 7 of them
  // over Hotel Michael and no other floater on Sentosa.
  // A THEME PARK IS NOT AN OFFICE PARK.
  //
  // Universal Studios is 53 buildings inside its own mapped ring, 22 of them
  // named rides — Revenge of the Mummy, TRANSFORMERS, WaterWorld, Lord
  // Farquaad's Castle — and every one was drawn by the generic city family:
  // glazed shopfront band at the bottom, punched office windows above. Shot
  // from each attraction's own approach point they are indistinguishable pale
  // office blocks, in the most recognisable place on the island.
  //
  // WHAT THIS DOES AND DOES NOT DO. The research (§2.5) is explicit that almost
  // nothing of the park is visible from outside and does not survey the
  // interior, so inventing Hollywood, Egyptian and Jurassic facades would be
  // exactly the kind of invention this project refuses. A ride building IS a
  // painted shed with a themed front, so it is drawn as a painted shed: no
  // glazing band, no window grid, warm varied render. That REMOVES a wrong
  // reading rather than inventing a right one, which is the only honest move
  // available with the research we have.
  const _ussRing = ((data.attractions || []).find(
    (a) => a && a.n === 'Universal Studios Singapore' && a.g && a.g.length > 8) || {}).g || null;
  const _inUss = (x, z) => {
    if (!_ussRing) return false;
    let c = false;
    for (let i = 0, j = _ussRing.length - 1; i < _ussRing.length; j = i++) {
      const xi = _ussRing[i][0], zi = _ussRing[i][1];
      const xj = _ussRing[j][0], zj = _ussRing[j][1];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const _uss = new Set();
  if (_ussRing) {
    for (const q of data.buildings) {
      if (!q.p || q.p.length < 3) continue;
      const c = centroid(q.p);
      if (_inUss(c[0], c[1])) _uss.add(q);
    }
  }
  // THE PARK IS SEVEN ZONES, AND IT WAS ONE COLOUR.
  //
  // The owner, 2026-08-06: "u need do everything properly including like USS".
  // Every show building inside the ring took a tint from the same five warm
  // neutrals, so Ancient Egypt, Sci-Fi City and Far Far Away were all the same
  // beige and the park read as an industrial estate that happened to have
  // rollercoasters in it — the flatter half of the "office park" complaint that
  // the shopfront fix only partly answered.
  //
  // THE ZONES ARE TRUTH: OSM carries Hollywood, New York, Sci-Fi City, Ancient
  // Egypt, Far Far Away and Madagascar as named nodes at real positions. The
  // PALETTES are authored (SENTOSA.md Layer 2) — scenic paint families, nothing
  // branded and no character or logo anywhere near it. A building takes the
  // zone it is nearest to, and still varies within that family by position hash
  // so a row is not one flat colour.
  const _ussZones = [];
  {
    // SEVEN ZONES, NOT SIX — and two of the names here were wrong.
    //
    // The table listed six and the park has seven, so every show building in
    // the dinosaur zone fell through `_zoneTint` to the neutral fallback and
    // came out the same beige as everywhere else. That is half the "USS does
    // not feel like USS" complaint: the zones ARE in our data, and the tint
    // that expresses them simply had no row to match.
    //
    // The two name corrections come from research/rws-architecture.md 2.0 and
    // are applied to the DATA by data/stale.py, so these keys are the corrected
    // names. The stale OSM names are kept as aliases because a scene file built
    // before that script existed still carries them, and a palette that
    // silently stops matching is exactly the failure above:
    //
    //   Jurassic World -> The Lost World   "officially The Lost World, not
    //                                       Jurassic Park or Jurassic World"
    //   Madagascar     -> Minion Land      closed 2022-03, reopened 2025-02
    // ...AND THE PALETTES ARE NO LONGER AUTHORED. THEY ARE SAMPLED.
    //
    // Every hex below is now read out of `research/universal-zones.md`, which
    // sampled them off DATED photographs zone by zone. What was here before
    // was scenic paint chosen to be plausible, and plausible got two zones
    // materially wrong:
    //
    //   FAR FAR AWAY was LILAC (0xbfa9cb). The brief's §6 samples the castle
    //   as warm cream-buff limestone #A99876-#BAA784 with weathered terracotta
    //   roofs, and the handover has carried the correction as an open item
    //   since SESSION 9 in exactly these words: "Far Far Away's castle is
    //   cream and terracotta, NOT pink and turquoise". A purple castle is the
    //   single most visible invented fact inside the park.
    //
    //   ANCIENT EGYPT was a bright yellow sand (0xd9bd86). Sampled, the
    //   show-building ashlar is a GREYED sandstone-ochre, #938778 sunlit and
    //   #827560 shaded — much duller and browner than it was drawn. §4 also
    //   notes the colossi read PALER than the wall behind them, which is why
    //   the third entry here is the lighter one rather than a deeper gold.
    //
    //   THE LOST WORLD was wet jungle green. §5A samples it as grey-pink
    //   granite rockwork and saturated orange-brown stained pole timber — the
    //   green in the photographs is planting, not building. Its own §5 opens
    //   by saying the zone is TWO material worlds and to "build them as two,
    //   not one", so WaterWorld's salvage verdigris and rust are split out
    //   below rather than averaged into this row.
    //
    // Where a zone gives a sunlit and a shaded read, the mid-tone leads: our
    // own sun lights the facade, and leading with the sunlit sample would pay
    // for the light twice.
    //
    // MINION LAND IS SAMPLED NOW TOO (research/minion-land.md, photo pass
    // 2026-08-15). The old row here was banana-yellow, authored off the
    // document-read "explosion of yellow" — and the new brief's §9.3 closes
    // with exactly the warning that row violated: "do NOT make the whole
    // zone yellow". The yellow in the photographs is BALLOONS and trim; the
    // built fabric is the Marketplace's red-brick terrace (#9C6060/#905454)
    // and the Neighbourhood's cream clapboard (#E4ECEF). Those lead the row;
    // the set pieces (Gru's navy house, the lilac arch, the blue show wall)
    // are authored geometry in sgdetail's buildUssVocab, not wall paint.
    const want = { 'Hollywood': [0xd9c7a8, 0xcfd3d2, 0xc4926f],
                   'New York': [0x9b6a52, 0x87543c, 0xaf8a70],
                   'Sci-Fi City': [0xa6aaae, 0x7c8384, 0x9aa0a4],
                   'Ancient Egypt': [0x938778, 0x827560, 0xa6aca5],
                   // cream-buff limestone and weathered terracotta, NOT lilac
                   'Far Far Away': [0xb2a07d, 0xa99876, 0xc87a50],
                   // grey-pink granite and stained pole timber, not jungle
                   'The Lost World': [0x9a8b82, 0x8a5a3c, 0xa8998c],
                   'Jurassic World': [0x9a8b82, 0x8a5a3c, 0xa8998c],
                   // §5B, the other half of the same zone: salvage, verdigris
                   // metal and rust. Anchored below on its own footprint.
                   'WaterWorld': [0x6b7f72, 0x8a4b2a, 0x7d8c7c],
                   // SAMPLED off the 2025-02-14 photo set — see the note above
                   'Minion Land': [0x9c6060, 0x905454, 0xe4ecef],
                   'Madagascar': [0x9c6060, 0x905454, 0xe4ecef] };
    for (const a of (data.attractions || [])) {
      const pal = a && a.n && want[a.n];
      if (pal && a.p) _ussZones.push({ x: a.p[0], z: a.p[1], pal, n: a.n });
    }
    // WATERWORLD IS A BUILDING HERE, NOT AN ATTRACTION NODE, so the loop above
    // cannot see it and the whole of The Lost World took Jurassic's timber —
    // measured, 14 of 14 show buildings including the WaterWorld stadium
    // itself. Its own footprint is the honest anchor and it is a survey, not a
    // coordinate typed into this file. Any zone that ever arrives as a
    // building rather than a node lands here for the same reason.
    for (const q of (data.buildings || [])) {
      const pal = q && q.n && want[q.n];
      if (!pal || !q.p || q.p.length < 3) continue;
      if (_ussZones.some((z) => z.n === q.n)) continue;
      const c = centroid(q.p);
      _ussZones.push({ x: c[0], z: c[1], pal, n: q.n });
    }
  }
  // the zone a footprint stands in, or null. `_zoneTint` answered a COLOUR and
  // nothing could ask WHICH ZONE — which is why paint was the only thing a
  // zone could change about a building.
  // WHICH ZONES ARE MADE OF COURSED MASONRY, from research/universal-zones.md.
  // A zone not listed keeps the painted-shed map, which is the right answer for
  // Sci-Fi City (ETFE and diagrid) and Minion Land (a cartoon).
  const _COURSED_ZONE = {
    'Ancient Egypt': 'ashlar', 'New York': 'brick', 'Far Far Away': 'limestone',
    // 'The Lost World' WAS 'board' and board is the zone's SECONDARY material.
    // §5A names the pole frame first and calls it the strongest motif; a wall
    // of pale sawn board was the infill standing in for the structure.
    WaterWorld: 'salvage', 'The Lost World': 'pole',
  };
  const _zoneOf = (pts) => {
    if (!_ussZones.length) return null;
    const c = centroid(pts);
    let best = null, bd = Infinity;
    for (const q of _ussZones) {
      const d = (q.x - c[0]) ** 2 + (q.z - c[1]) ** 2;
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  };
  const _zoneTint = (pts, hash) => {
    const best = _zoneOf(pts);
    return best ? best.pal[Math.abs(hash) % best.pal.length] : null;
  };

  const _parts = data.buildings.filter((q) => q.mh && q.mh > 1 && q.p && q.p.length >= 3);
  const _partHost = new Map();
  if (_parts.length) {
    const _inRing = (x, z, pp) => {
      let c = false;
      for (let i = 0, j = pp.length - 1; i < pp.length; j = i++) {
        const [xi, zi] = pp[i], [xj, zj] = pp[j];
        if ((zi > z) !== (zj > z)
          && x < ((xj - xi) * (z - zi)) / ((zj - zi) || 1e-9) + xi) c = !c;
      }
      return c;
    };
    const _hosts = data.buildings.filter((q) => !(q.mh && q.mh > 1)
      && q.p && q.p.length >= 4);
    for (const part of _parts) {
      const c = centroid(part.p);
      let best = null, recipeHost = false;
      for (const q of _hosts) {
        if (!_inRing(c[0], c[1], q.p)) continue;
        if (!NORECIPE && q.n && recipeFor(q.n)) recipeHost = true;
        if (!best || (q.h || 0) > (best.h || 0)) best = q;
      }
      _partHost.set(part, { recipeHost, top: best ? (best.h || 0) : null,
        host: best ? (best.n || null) : null });
    }
    const _skipped = [..._partHost.values()].filter((v) => v.recipeHost).length;
    const _seated = [..._partHost.values()].filter(
      (v) => !v.recipeHost && v.top !== null).length;
    if (_skipped || _seated) stats.partsFixed = _skipped;
  }

  let _yt = performance.now();
  // GIVE IT A ROOF. See MAT.roofDeck: the extrusion's top face wore the wall
  // material, so every flat-topped building was a blank slab from above — the
  // recurring "big untextured mass" in vet shots across the Cove, the beach
  // and the resort. A recessed deck plus an upstand round the edge is the
  // whole fix, and it is what a real flat roof looks like from the cable car.
  //
  // IT IS A FUNCTION, AND CALLED FROM TWO PLACES, because the flat top is
  // reached down two different paths and one of them ends in `continue`.
  // `_capForm` says whether one of the six roof branches already closed this
  // top: 0 nothing, 1 a trim parapet with the deck still missing, 2 a real
  // roof form.
  //
  // IT WAS SKIPPING THE THREE THINGS MOST LOOKED DOWN ON, 2026-08-24. The
  // 2026-08-23 aerial noted "a regular grid of dark ovals" lying flat on two
  // or three roofs and could not pin them down by eye. Queried from the data
  // instead, the way `lamps: 0` was found, and it is not an exception to
  // MAT.roofDeck — it is everything the old test threw away:
  //
  //   16  masses with min_height — `!(b.mh && b.mh > 1)` excluded a LIFTED
  //       mass outright, and the lifted ones here are the big flat tops on the
  //       east grid: a 7,791 m2 garage at 24 m, a 5,555 m2 hotel at 23.8 m, a
  //       4,871 m2 deck at 20 m. The lifted branch also ends in `continue`, so
  //       a cap written inline further down could never have reached them —
  //       which is exactly the mistake the first attempt at this made, and the
  //       counter (`lifted: 0` on a build that had 13) is what said so. The
  //       soffit fix of 2026-08-16 gave a lifted mass a ceiling and left its
  //       ROOF bare; this is the other half of that same defect.
  //   `h`, not `b.h` — the deck was laid at the fetched height while the
  //       hillside rule extruded the mass PAST it, burying the deck inside the
  //       building and putting the facade back on top. That is why the h/_mh
  //       block was hoisted above the first roof branch.
  //   the 300 m2 cut — 503 of 1,095 footprints. It was a TRIANGLE trade made
  //       before the 2026-08-23 batching work; MAT.roofDeck is a flat colour,
  //       so it now flattens into the shared vertex-colour material and costs
  //       zero extra draws. The deck now goes down to 40 m2; the PARAPET
  //       stops at 90, so a bin store gets its top closed without being given
  //       an upstand a third of its own width.
  //
  // A lifted mass gets one only if the mass is thick enough to carry the
  // 0.65 m upstand without it hanging below its own soffit.
  const capFlatRoof = (b, h, _mh, _capForm) => {
    if (b.roof || _capForm >= 2 || !((b.a || 0) > 40) || !(h > 3) || NOROOFCAP
        || ((_mh && _mh > 1) && !(h - _mh > 1.6))) {
      const _why = b.roof ? 'canopy' : _capForm >= 2 ? 'own roof'
        : (b.a || 0) <= 40 ? 'tiny' : h <= 3 ? 'low' : 'thin lift';
      _CAPDBG.bare[_why]++;
      _CAPWHY[_capKey(b)] = _why + (NOROOFCAP ? ' (?noroofcap)' : '')
        + ` [a=${Math.round(b.a || 0)} h=${h.toFixed(1)} mh=${(_mh || 0).toFixed(1)}`
        + ` capForm=${_capForm}]`;
      if ((b.a || 0) > 300) _CAPDBG.bigBare.push([Math.round(b.a), +h.toFixed(1), _why,
        Math.round(b.p[0][0]), Math.round(b.p[0][1])]);
      return;
    }
    _CAPWHY[_capKey(b)] = `capped [a=${Math.round(b.a || 0)} h=${h.toFixed(1)}`
      + ` mh=${(_mh || 0).toFixed(1)} capForm=${_capForm}]`;
    const c = centroid(b.p);
    // THE DECK TOP AND THE WALL TOP WERE THE SAME PLANE (fixed 2026-08-26).
    // `0.12, h - 0.12` puts the deck's top face at EXACTLY h — which is where
    // the mass's own top face already is. Two coplanar up-facing surfaces:
    // they z-fight, and which one you see is whichever the depth test happens
    // to win that frame and that pixel. Found by casting down onto the five
    // roofs roofcheck reported as `capped` AND STILL BAD and printing every
    // up-facing hit instead of the first: at each one, two hits at the same
    // y to the centimetre — MeshLambert 77787a (the deck) and a MAPPED
    // MeshStandard (the facade). The check was not flaky; the world was.
    // 2cm of daylight, which is invisible and unambiguous.
    merger.add(extrudeGeo(grow(b.p, 0.985), 0.12, h - 0.10), MAT.roofDeck, c[0], c[1]);
    // AN UPSTAND NEVER OVERHANGS A CARRIAGEWAY. The parapet stands 0.6% proud
    // of the wall so it reads as an edge rather than a change of colour, and
    // on a building at the kerb that 0.6% is over the road: extending this
    // pass down to 40 m2 footprints — the ones that actually front a lane —
    // took P1b from 27 to 29 the first time it ran. Measured, not guessed: the
    // A/B against ?noroofcap is what named the two. Where the proud ring would
    // land in the road it simply is not proud, which costs an edge shadow on
    // that one building and nothing else.
    const _pOut = grow(b.p, 1.006);
    let _clear = true;
    for (const [_px, _pz] of _pOut) if (onCarriageway(_px, _pz, 0)) { _clear = false; break; }
    // and the upstand, unless the trim ring already drew one — two parapets
    // 2 mm apart is what the old ordering was quietly building. Nor on a
    // footprint under 90 m2: a 0.65 m upstand round a 7 m shed is a third of
    // its own width and reads as a bunker. The DECK still goes on — it is what
    // takes the facade off the top, and being flat it costs no silhouette.
    if (_capForm === 0 && (b.a || 0) > 90) {
      merger.add(extrudeGeo(_clear ? _pOut : b.p, 0.65, h - 0.1), MAT.roofParapet, c[0], c[1]);
    }
    _CAPDBG.capped++;
    if (_mh && _mh > 1) _CAPDBG.lifted++;
    if (h > (b.h || 0) + 0.05) _CAPDBG.grown++;
    if ((b.a || 0) <= 300) _CAPDBG.small++;
    if (_capForm === 1) _CAPDBG.deckOnly++;
  };
  // counted fresh per build: the lamp pass learned that a counter which
  // survives a rebuild reports the sum of every world ever made
  _CAPDBG.capped = _CAPDBG.lifted = _CAPDBG.grown = _CAPDBG.small = _CAPDBG.deckOnly = 0;
  _CAPDBG.bigBare.length = 0;
  for (const k in _CAPDBG.bare) _CAPDBG.bare[k] = 0;
  for (const k in _CAPWHY) delete _CAPWHY[k];
  for (const b of data.buildings) {
    _bmStart();
    // cooperative yield for the runtime streamer; null during boot
    if (Y && performance.now() - _yt > 8) { await Y(); _yt = performance.now(); }
    // EVERY DRAW IN THIS BUILDING FROM ITS OWN CENTROID (?planthash=1). The
    // facade half of the divergence: with the shared stream, one building's
    // draw count shifts every later building's picks — a `con` toggle at RWS
    // re-rendered a Sensoryscape wall from granite to render, measured in
    // the 2026-08-14 A/B. Scoped for the whole body (the only await is the
    // yield above, so a scope never spans one); cleared after the loop.
    // With the flag off no scope is ever set and R IS the placement stream.
    if (typeof window !== 'undefined' && window.__planthash
        && b.p && b.p.length >= 3) {
      let _shx = 0, _shz = 0;
      for (const _q of b.p) { _shx += _q[0]; _shz += _q[1]; }
      _shx /= b.p.length; _shz /= b.p.length;
      scopeDraws(rng((Math.imul(Math.round(_shx * 8) | 0, 0x9E3779B1)
        ^ Math.imul(Math.round(_shz * 8) | 0, 0x85EBCA77)) >>> 0));
    }
    const pts = b.p;
    // WHO CLOSES THE TOP OF THIS BUILDING. Six branches below draw a roof
    // form over the footprint — the Cove villa's pitch or slab, the heritage
    // hip, the beach pavilion's oversail, the conserved shophouse's tile —
    // and the flat-roof cap is the FALLBACK for a building none of them
    // claimed. Before 2026-08-24 the cap ran two hundred lines above all of
    // them and could not know, so it either duplicated a parapet the trim
    // ring had already drawn or, on a shophouse, pushed a concrete upstand up
    // through the tiles. One flag, set where the decision is actually made:
    //     0 nothing yet   1 a parapet ring, deck still missing   2 a real roof
    let _capForm = 0;
    if (pts.length < 3) continue;
    if (SOLO && !((b.n || '').toLowerCase().includes(SOLO))) continue;
    // rule 1: the recipe already drew this building's whole form
    if (_partHost.has(b) && _partHost.get(b).recipeHost) {
      _capSkip(b, 'recipe drew the whole form');
      _bacc('recipe drew the whole form');
      continue;
    }

    // A building=roof IS A CANOPY: a roof held up by columns, open and
    // walkable underneath — RWS's covered walkways ("The Forum"/WEAVE), bus
    // shelters writ large. Extruding it like a building gave it WALLS, and
    // those walls blocked every mapped footway under it (the owner's "ride
    // halfway stuck"; 2026-08-03 research audit FP-0). Drawn instead as the
    // slab it is, on slim columns around the ring; no wall ever reaches the
    // Solid grid, so the paths under it are open the way they are in life.
    if (b.roof) {
      // A NAMED RECIPE OUTRANKS THE GENERIC SLAB. This branch's own note says
      // "a big or sloped roof structure needs a real recipe; until it has one,
      // refuse rather than invent" — so when one exists, use it. Festive Walk
      // is tagged bt=roof, so the ETFE canopy recipe written for it was never
      // reached and the resort's defining 180m canopy stayed a flat grey slab.
      // Cost a render round and a probe to find; the recipe was registered,
      // matched and correct, and simply never called.
      const _roofRec = NORECIPE ? null : recipeFor(b.n);
      if (_roofRec) {
        FOOT = seatY(b);
        STREET = streetY(b);
        _roofRec(api, b);
        FOOT = null; STREET = null;
        stats.count++; stats.bespoke++;
        _capSkip(b, 'bespoke roof recipe');
      _bacc('bespoke roof recipe');
        continue;
      }
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
      // A CANOPY ON A SLOPE IS LEVEL, WITH LONGER COLUMNS DOWNHILL.
      //
      // This refused anything with over 4m of fall, and the refusal was right
      // for what the code then did: a slab seated at FOOT — the LOWEST ground
      // — is buried at the uphill end, which is the brown ceiling over the
      // Serapong pond this branch's note describes.
      //
      // But that is a fault in the SEAT, not in the idea. Found by
      // data/walksweep.mjs: "Sapphire Pavillion" is a named place with ZERO
      // built around it and nothing drawn. Measured, its ground rises 7.8m
      // across the ring and all 13 of its column sites are clear — the slope
      // gate is the only thing stopping it.
      //
      // A real canopy over falling ground is LEVEL and its columns get longer
      // as the ground drops, which is exactly what the Lookout Loop deck does
      // for the same reason. So seat it on the HIGHEST ground under the ring
      // and let the columns vary. Still refused past 12m of fall, where a
      // level roof really would be a lid over a hillside, and still refused
      // over 12,000 m2.
      const fall = gMax - gMin;
      if (fall > 12 || (b.a || 0) > 12000) {
        stats.count++; _capSkip(b, fall > 12 ? 'steep ground' : 'huge footprint');
      _bacc(fall > 12 ? 'steep ground' : 'huge footprint');
        continue;
      }
      const canopyH = Math.max(4, Math.min(9, b.h || 5));
      // clear the high side, not the low one
      const topY = (fall > 4 ? gMax : FOOT) + canopyH;
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
        // AND ITS UNDERSIDE IS A CEILING, NOT A CONCRETE BOTTOM FACE.
        //
        // The lifted-mass branch below already says this, in these words: the
        // underside "read as a DARK BROWN SLAB filling the top half of the
        // frame... it is the single most-looked-at ceiling on the island
        // because the globe is under it." That fix was applied to `og`/`mh`
        // masses and NEVER to `b.roof` canopies, which are the OTHER half of
        // the covered space at Universal — so the USS entrance still stood
        // under an unlit slab.
        //
        // Found by data/walksweep.mjs, standing at Hollywood: a 5,457 m2
        // canopy at 5m clearance filling the sky, dark brown, on a forest of
        // columns. The three largest on the island are WEAVE (9,050 m2),
        // Festive Walk (7,677) and this one — the three biggest covered
        // spaces in RWS and USS, all of them a dark ceiling.
        //
        // MAT.soffit is pale and slightly emissive precisely so it does not go
        // black under something that blocks the sun. It IS the sky for anyone
        // standing under it.
        const soffit = extrudeGeo(pts, 0.30, 0);
        soffit.translate(0, topY - 0.85 - FOOT, 0);
        merger.add(soffit, MAT.soffit || MAT.conc, pts[0][0], pts[0][1]);
        for (const [px, pz, gy] of cols) {
          const col = new THREE.CylinderGeometry(0.22, 0.22, topY - 0.55 - gy, 6);
          col.translate(px, gy + (topY - 0.55 - gy) / 2, pz);
          merger.add(col, MAT.conc, px, pz);
        }
      }
      stats.count++;
      _capSkip(b, 'canopy (building=roof)');
      _bacc('canopy (building=roof)');
      continue;
    }

    // Seat the building ONCE, here, before anything about it is drawn. The
    // rule is the one the mass already used, so no mass moves; what changes is
    // that every later piece of this building is measured from the same number
    // instead of re-deriving one from its own thickness or its own ring.
    FOOT = seatY(b);
    STREET = streetY(b);

    // A GRANDSTAND IS SEATING. IT IS NOT A BOX, AND IT HAS NO ROOF.
    //
    // `bt: 'grandstand'` has been in this scene file since the building layer
    // was written and NOTHING HAS EVER READ IT. There is exactly one on the
    // island — OSM way/116818107, 2,712 m², unnamed — and it is the SECOND
    // NEAREST BUILDING TO THE SPAWN POINT. Drawn by the generic rules it came
    // out as a 20.4 m solid slab (heights.py's calibrated guess for a
    // footprint that size) filling the top half of the very first frame every
    // player sees. The world only ever half-hid it behind a stale open-ground
    // storey that no current build reproduces.
    //
    // It is the WINGS OF TIME audience bank at Central Beach, Siloso — the
    // show is running, two performances nightly, enhanced Feb 2025. The full
    // brief with sources and confidence labels is research/wings-of-time.md;
    // everything dimensional below comes from it:
    //
    //     capacity 2,500 PUBLISHED         no roof at all PUBLISHED
    //     row pitch ~1.05 m DERIVED        riser ~0.32 m EST-PHOTO
    //     ~16-20 rows DERIVED              back ~5 m above the front EST-PHOTO
    //     front ~5 m is flat apron         stair aisles every 10-15 m
    //     benches grey-weathered timber    Zone A pink/salmon bucket seats
    //     rear: dark timber screen 1.8-2.5 m, control towers behind it
    //
    // THE HEIGHT IS THE WHOLE POINT: five metres, not twenty. Nothing here is
    // taller than the screen at the back, which is why the spawn frame gets
    // its sky back.
    //
    // ON THE DATUM, WHICH IS THE ONE THING I COULD NOT TAKE FROM THE RESEARCH.
    // The real front row sits at beach level, +3 to +5 m, and the bank is cut
    // against a low rise. OUR heightfield says the ground under this footprint
    // falls from 26.5 m at the north-west end to 7.8 m at the south-east — an
    // 18 m fall, which is Mount Imbiah's flank arriving through a 35 m cell.
    // Measurements in the research file. So a single flat datum would bury the
    // north-west end nineteen metres into a hill, and a per-vertex seat would
    // make a staircase of the arc. The rows are therefore raked ACROSS the
    // depth (which is the structure) and follow a SMOOTHED terrain line ALONG
    // the arc (which is the ground), so it neither floats nor buries. On a
    // truer heightfield the same code draws a flat bank; the smoothing is what
    // absorbs the DEM, not a fudge factor tuned to it.
    if (b.bt === 'grandstand' && pts.length >= 6) {
      buildGrandstand(pts, merger, world);
      stats.count++;
      if (stats.bespoke !== undefined) stats.bespoke++;
      _capSkip(b, 'grandstand');
      _bacc('grandstand');
      continue;
    }

    // THE OTHER HALF OF THE SAME PLACE. way/116818158 is `building=hut` and
    // named "Wings of Time", and a hut is a shed, so 677 m² of surveyed
    // framework standing in the Singapore Strait was drawn as a 4 m tan box on
    // the water. It is the SET — the thing the whole bank is pointed at, and
    // the research calls it "the single best identifier of the place".
    //
    // Matched by NAME and not by type: `hut` is a real type with real huts
    // behind it and this recipe is for exactly one structure on earth. The
    // sea level comes from the grid rather than SEA_LEVEL[0], which buildSea
    // has not filled in yet when the buildings are built.
    if (b.bt === 'hut' && b.n === 'Wings of Time' && pts.length >= 6
        && data.terrain && typeof data.terrain.sea === 'number') {
      buildWingsStage(pts, merger, data.terrain.sea + 0.18);
      stats.count++;
      if (stats.bespoke !== undefined) stats.bespoke++;
      _capSkip(b, 'wings stage');
      _bacc('wings stage');
      continue;
    }

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
    //
    // ...AND A SITE INSIDE A SITE IS NOT TWO SITES. A `con` footprint whose
    // centroid lies inside a mapped `works` parcel is already inside a
    // hoarded, craned, stocked worksite (buildTransit builds it), and giving
    // it its OWN ring and 38 m mast drew a second fence and a red monolith
    // in the middle of the E4 yard — the plaza vet frames of 2026-08-14 kept
    // catching it. The parcel IS the site; the footprint stays bare ground.
    if (b.con && !window.__noSites) {
      let _inWorks = false;
      if (b.p && b.p.length) {
        let _cx = 0, _cz = 0;
        for (const [_x, _z] of b.p) { _cx += _x; _cz += _z; }
        _cx /= b.p.length; _cz /= b.p.length;
        for (const _l of (data.land || [])) {
          if (_l.k !== 'works' || !_l.p || _l.p.length < 4) continue;
          let _in = false;
          const _pp = _l.p;
          for (let _i = 0, _j = _pp.length - 1; _i < _pp.length; _j = _i++) {
            if ((_pp[_i][1] > _cz) !== (_pp[_j][1] > _cz)
                && _cx < ((_pp[_j][0] - _pp[_i][0]) * (_cz - _pp[_i][1]))
                         / (_pp[_j][1] - _pp[_i][1]) + _pp[_i][0]) _in = !_in;
          }
          if (_in) { _inWorks = true; break; }
        }
      }
      if (!_inWorks) constructionSite(api, b);
      stats.count++; stats.sites = (stats.sites || 0) + 1;
      _capSkip(b, 'construction site');
      _bacc('construction site');
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
    // ADDING `!b.n` HERE WAS TRIED AND REVERTED — 2026-08-16, and the reason
    // is worth more than the change would have been.
    //
    // The branch says "anonymous" and the buildings it claims are not. Counted
    // in two districts: chinatown 1698 shophouses of which 114 NAMED (One
    // Fullerton, SGX Centre, Old Customs House, Union Building — office towers
    // and civic buildings in clay pitched roofs); sentosa 107 of which 28
    // NAMED (Enchanted Airways — a USS RIDE; Shark Encounter and Ray Bay —
    // AQUARIUM exhibits; Beach Lrt Station — the MONORAIL STATION, drawn as a
    // terrace of four; Marina Collection, Seven Palms, The Green Collection —
    // Cove condominiums). Every one of those is the wrong recipe.
    //
    // But `!b.n` sends them to the GENERIC MASSING PATH, and generic massing
    // for a named building with no recipe written is a blank coloured box.
    // Vetted on `ffa-street`: Enchanted Airways went from a windowed, signed,
    // shopfronted frontage to a flat olive slab — 5.06% of the frame, and
    // worse in every pixel of it. That is the owner's own complaint from
    // 2026-08-04 ("just generic looking coloured building... everything looks
    // same same") reintroduced by a correctness argument.
    //
    // A WRONG RECIPE WITH A FACADE BEATS A RIGHT REFUSAL WITH NOTHING. The
    // real fix is a recipe per building family (the openground queue's shape),
    // not a rule that takes the fabric away. Do not re-add `!b.n` without one.
    if (!_rec && !b.k && b.a < 520 && b.h <= 20 && b.p.length <= 64 && _abuts.has(b)) {
      shophouse(api, b, _overlapped.has(b));
      stats.count++; stats.shophouses = (stats.shophouses || 0) + 1;
      _capSkip(b, 'shophouse');
      _bacc('shophouse');
      continue;
    }

    // the buildings people navigate by get their real arrangement, not a box
    const recipe = _rec;
    if (recipe) {
      recipe(api, b);
      if (hasShopfront(b.n)) addShopfront(world, b, perimeter(pts), merger, clearance);
      stats.count++; stats.bespoke++;
      _capSkip(b, 'named recipe');
      // by NAME, not by category: 41 recipes at 18.4ms each is 755ms of the
      // buildings phase, and "named recipe" does not say which of them.
      _bacc('recipe: ' + (b.n || '(unnamed)'));
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
      _coveVillas.push(b);          // the plot pass runs after the loop, on the ground
      const _hh = Math.max(3, b.h || 8);
      const _cc = centroid(b.p);
      let _ph = 0;
      for (const [x, z] of b.p) _ph = (_ph * 31 + ((x * 7) | 0) + ((z * 13) | 0)) | 0;
      // 1-in-5 pitched -> 1-in-3 -> PER ISLAND. The share of terracotta pitch
      // is not one number across the Cove, because the islands are not one
      // estate (research/sentosa-cove.md):
      //
      //   coral     Mediterranean influences, modern interpretation — the
      //             pitch belongs here most, 1 in 2.
      //   treasure  villas by PRIVATE OWNERS, the widest mix of the five, so
      //             the roof form varies most here too, 1 in 2 by a different
      //             residue so it does not fall on the same houses as coral.
      //   sandy     Silvestrin's "stone monoliths with two-storey glass walls"
      //             are FLAT-topped island temples. NEVER pitched.
      //   paradise  contemporary — the odd pitch only, 1 in 5.
      //   pearl     undescribed; drawn like paradise.
      //   street    the terrace and condominium frontage, unchanged at 1 in 3.
      //
      // Authored proportions, not surveyed ones — the roof form of an
      // individual villa is published nowhere. What IS published is which
      // island leans which way, and that is what these follow.
      const _pitchEvery = { coral: 2, treasure: 2, sandy: 0, paradise: 5, pearl: 5, street: 3 };
      const _pe = _pitchEvery[_coveIsleOf.get(b) || 'street'] ?? 3;
      _capForm = 2;
      // A DECK ON THE TRUE FOOTPRINT, UNDER WHICHEVER FORM IS CHOSEN.
      //
      // Both branches below cover the roof with a polygon from `grow`/
      // `growClear`, and BOTH OF THOSE SCALE ABOUT THE CENTROID — which does
      // not contain a concave footprint. Measured 2026-08-26 on the one villa
      // roofcheck still reported (1187,13108): 18 vertices, strongly concave,
      // and ITS CENTROID LIES OUTSIDE ITS OWN POLYGON. Scaling by 1.08 or
      // 1.19 about that point leaves SIX of the eighteen corners outside the
      // result, so the roof is displaced off part of the house and the
      // building's own wall texture lies flat where it is missing. `_capForm`
      // is already 2 by then, so the generic flat cap skips it.
      //
      // The honest fix for `grow` is edge offsetting rather than a scale, and
      // that is a change under every recipe in this file. This is the same
      // answer the shophouse and Hotel Michael got instead: whatever form goes
      // on top, close the top underneath it first. `b.p` unscaled, because a
      // concave shape cannot be safely shrunk about that centroid either.
      merger.add(extrudeGeo(b.p, 0.12, _hh - 0.10), MAT.roofDeck, _cc[0], _cc[1]);
      if (_pe && Math.abs(_ph) % _pe === 0) {
        merger.add(extrudeGeo(growClear(b.p, 1.08, b), 0.3, _hh), MAT.clayTile, _cc[0], _cc[1]);
        merger.add(extrudeGeo(grow(b.p, 0.82), 1.5, _hh + 0.3), MAT.clayTile, _cc[0], _cc[1]);
      } else {
        // thin edge, deep overhang: 22cm of slab reaching 1.3m past the wall —
        // and NOT into the house next door: growClear, see D6a above.
        merger.add(extrudeGeo(growClear(b.p, 1.19, b), 0.22, _hh), MAT.paleStone, _cc[0], _cc[1]);
      }
      // AND A TERRACE, BECAUSE COLOUR WAS NEVER THE WHOLE PROBLEM.
      //
      // The per-island palettes above are measured and real — d8dedb, e6dfd0
      // and d6cfc0 all read back off a single Cove frame — and the district
      // STILL swept back looking uniform, because every villa is the same
      // shape: an extruded box with dark window rectangles and a cap. Varying
      // the paint on identical boxes gives you identically-shaped houses in
      // slightly different paint.
      //
      // A waterfront villa's defining street element is the upper terrace, so
      // that is the one form worth spending geometry on: a thin slab on the
      // upper floor line, oversailing the wall, with a slim rail above it. It
      // breaks the silhouette at mid-height on EVERY villa, which is what the
      // eye reads from the saddle, and it costs two extrusions.
      //
      // Only on villas with a real upper floor. A 3m single-storey outbuilding
      // with a wrap-around terrace is a bandstand.
      if (_hh >= 6.5) {
        const _ty = _hh * 0.52;
        const _tr = growClear(b.p, 1.13, b);
        // every terrace on a probe-readable list, like window.__parasols —
        // the TBC "slab" hunt (sweep, SESSION 28) needed to ask "which villa
        // owns a terrace at this y" and nothing could answer it
        (window.__villaTerraces = window.__villaTerraces || [])
          .push([Math.round(_cc[0]), Math.round(_cc[1]), Math.round(_ty * 10) / 10, b.n || null]);
        merger.add(extrudeGeo(_tr, 0.18, _ty), MAT.paleStone, _cc[0], _cc[1]);
        // The rail is TRIM, not metal: 0x8b8f93 with metalness drew as a heavy
        // dark ribbon wrapping every house, and on the long terrace rows that
        // read as a painted stripe rather than a balustrade. The Cove's rails
        // are white and glass; the slab's own shadow gives the line.
        merger.add(extrudeGeo(_tr, 0.36, _ty + 0.18), MAT.trim, _cc[0], _cc[1]);
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
      _capForm = 2;
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
      _capForm = 2;
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
    // THE TOP OF THE MASS IS DECIDED BEFORE THE ROOF IS PUT ON IT.
    //
    // `h` and `_mh` used to be worked out two hundred lines BELOW the roof
    // cap, so the cap was laid at `b.h` — the height as fetched — while the
    // mass it is supposed to close was extruded to whatever the hillside rule
    // and the min_height rule had since made of it. Both readings measured
    // 2026-08-24: a mass grown to clear its own slope swallowed its deck
    // whole (the cap ends up INSIDE the building), and a lifted mass was
    // skipped outright. Same decision, one place, before anything is built.
    // A BUILDING CANNOT BE SHORTER THAN THE HILL IT STANDS ON.
    //
    // The owner, 2026-08-06, on the Tanjong Rimau slope: "the building there
    // also floating". Measured, Shangri-La's Rasa Sentosa Resort:
    //
    //     seat (lowest ground under the ring)   10.1 m
    //     ground rises across its own footprint to 42.1 m   (a 32 m rise)
    //     mapped height                         20.4 m
    //     so the roof sits 11.6 m BELOW its own hillside
    //
    // seatY takes the LOWEST ground under the footprint — the right rule, and
    // the reason the skirt above exists — but a mass extruded `h` from there
    // is swallowed by the slope at the top end while standing 20m proud at the
    // bottom. From uphill the resort is a roof in the grass; from downhill it
    // is a wall with a hillside apparently balanced on it.
    //
    // OSM `height` is measured from the ground the building stands on, and on
    // a slope the honest reading of that is the UPPER ground, not the lowest
    // corner. So a mass that would be buried grows to clear the high side by
    // one storey. This is a real trade and it is bounded on purpose: it fires
    // only where the rise genuinely swallows the building (over half its
    // height and over 6m), so a normal building on a normal grade is untouched
    // and the skyline does not move. What it cannot do is STEP down the slope
    // the way the real resort does — that wants a terraced recipe, and this is
    // the honest single-mass answer until one exists.
    let h = b.h;
    // ...BUT A HUT DOES NOT GROW TO SWALLOW A HILLSIDE.
    //
    // This rule is right for a resort block and it silently undid a fix made
    // the same day. process.py now gives `building=hut` a 4 m default and
    // heights.py leaves it alone — and the Wings of Time stage set still drew
    // as a three-storey white block in the SPAWN FRAME, because the ground
    // under its 78 m span runs 7.8 m to 22.1 m in our heightfield and this
    // line grew it to 22.1 - 7.8 + 3 = 17.3 m.
    //
    // A type whose name states its scale must not be re-scaled by the terrain
    // either. It is the same list, from the same place, for the third time
    // (process.py TYPE_DEFAULT, heights.py's banding, here) — which is exactly
    // why it is a list and not three conditions.
    if (!SELF_SCALED.has(b.bt)
        && !(b.mh && b.mh > 1) && !b.con && h > 0 && pts.length > 2) {
      let hiG = -Infinity;
      for (const [_x, _z] of pts) { const _g = TERRAIN.at(_x, _z); if (_g > hiG) hiG = _g; }
      const buried = hiG - (FOOT + h);
      if (buried > 0 && (hiG - FOOT) > h * 0.5 && (hiG - FOOT) > 6) h = hiG - FOOT + 3;
    }
    // A MASS THAT STARTS IN THE AIR. `min_height` says the building begins
    // above the ground -- a sky bridge, a deck, a canopy spanning between
    // towers. SkyPark is min_height 193 of height 207, so read as a plain
    // height it is a solid 207m block standing exactly where Marina Bay Sands'
    // atrium is. Built from its own base, it is the 14m deck everyone knows.
    // rule 2 (see the note above the loop): a part whose base stands clear of
    // everything under it is seated on its host's top instead of in the air.
    // THE RATIO WINS OVER THE STORED METRES, when the data carries one.
    //
    // `mh` is absolute and was computed from whatever `h` the footprint had at
    // the moment process.py read its tags; post-passes then rewrite `h` and
    // leave `mh` where it was. That is how three Hotel Michael parts came to
    // carry h 36.6 with mh 40.8 -- a mass whose base stands above its own top,
    // silently drawn solid here because the `_mh < h - 0.5` test below quietly
    // rejects it. `mr` is min_level/levels, which is scale-free: derive from it
    // and any later change to `h` moves the base with it.
    let _mh = (b.mr && b.mr > 0 && b.mr < 1 && h) ? b.mr * h : b.mh;
    if (_mh && _mh > 1 && _partHost.has(b)) {
      const hs = _partHost.get(b);
      if (hs.top !== null && _mh > hs.top + 0.5) _mh = hs.top;
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
    // THE COVE IS NOT ONE WHITE, AND IT WAS DRAWN AS ONE.
    //
    // `0xf2efe8` on every building in the district is precisely the fault the
    // beach comment twelve lines above already names — "One colour across 78
    // buildings is as wrong as one shape" — and it is why the Cove sweeps back
    // as rows of identical white boxes.
    //
    // The five islands are separately mastered and separately DESIGNED, and
    // the differences are published (research/sentosa-cove.md). The whole
    // district was "tropicalised" by Klages, Carter Vail & Partners in the
    // manner of the California and Florida waterfront estates — warm and
    // varied, never a white cube grid.
    //
    //   sandy     18 villas by CLAUDIO SILVESTRIN — "striking stone monoliths
    //             with two-storey glass walls", "chic island temples amid a
    //             rainforest". Pale stone, tightest spread of the five.
    //   coral     21 villas, "Mediterranean influences in a modern
    //             interpretation" — the warm stucco, and where the terracotta
    //             pitch belongs.
    //   paradise  29 contemporary villas with private berths — white and glass.
    //   treasure  19 villas BY PRIVATE OWNERS, so the widest spread of all
    //             five is the correct answer here, not a house style.
    //   pearl     no published description found — drawn as contemporary
    //             waterfront like Paradise, and this comment says so rather
    //             than inventing a style for it.
    //   street    Ocean Drive and the Cove Ways/Avenues: the condominium and
    //             terrace frontage, left on the old white it was tuned for.
    const _COVE_TINTS = {
      // SEPARATION HAS TO BE BIG ENOUGH TO SURVIVE SUNLIGHT. The first set of
      // these sat within ~15 of white in every channel and the sweep came back
      // looking untouched — under this lighting a 6% difference is nothing.
      // These are muted (the Cove is not a paintbox) but far enough apart to
      // read as different houses from the saddle.
      sandy:    [0xe4ded0, 0xd6cfbe, 0xc8c2b2],                       // Silvestrin limestone
      coral:    [0xecd9b4, 0xdcc296, 0xcbae84, 0xe4cfa8, 0xd2bc98],   // Mediterranean stucco
      paradise: [0xf4f2ec, 0xe2e4e3, 0xd2d6d6, 0xeae7de],             // white + glass, cool
      treasure: [0xf2efe6, 0xdcc296, 0xcdd4d2, 0xe8d2a8, 0xd8cec0, 0xc4bfae],
      pearl:    [0xf0eee6, 0xdfdcd0, 0xcdcabc],
      // AND THE STREETS ARE 304 OF THE 415, which is why keying only the five
      // islands changed almost nothing on a sweep: Ocean Drive and the Cove
      // Ways/Avenues/Groves carry three quarters of the district's buildings
      // — the terraces, semi-detacheds and the condominium frontage (Marina
      // Collection, Seven Palms, The Green Collection). Leaving them on the
      // single white left the Cove reading exactly as it did before.
      street:   [0xf2efe8, 0xe6dfd0, 0xd6cfc0, 0xecdcbc, 0xd8dedb, 0xcfc8b8],
    };
    // THE COUNTS AGREE WITH THE RESEARCH, which is the check that says this
    // keying is real and not a regex that happens to run: our footprints come
    // out paradise 27 / treasure 20 / coral 25 / sandy 19 against the
    // published 29 / 19 / 21 / 18 villas. Pearl has no published count.
    const _coveIsleKey = _coveIsleOf.get(b) || 'street';
    const _coveSet = _COVE_TINTS[_coveIsleKey] || _COVE_TINTS.street;
    let _ct = 0;
    for (const [_cx2, _cz2] of b.p) _ct = (_ct * 31 + ((_cx2 * 11) | 0) + ((_cz2 * 7) | 0)) | 0;
    const _coveTint = _coveSet[Math.abs(_ct) % _coveSet.length];
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
    // a show building's paint, picked by a POSITION HASH so a row of them is
    // varied and stable rather than one flat colour — the same trick the Cove
    // villas use for their roofs. Warm scenic paint, nothing branded.
    const _isShow = _uss.has(b) && !b.roof;
    let _showTint = 0xd8cbb6;
    if (_isShow) {
      let _sh = 0;
      for (const [x, z] of b.p) _sh = (_sh * 31 + ((x * 3) | 0) + ((z * 7) | 0)) | 0;
      // the zone it stands in decides the family; the hash decides which of
      // that family. Falls back to the old neutrals if the zone nodes are
      // missing from a scene file, rather than drawing nothing.
      _showTint = _zoneTint(b.p, _sh)
        || [0xd8cbb6, 0xcdb79c, 0xc9c3b2, 0xd9c3a8, 0xc2b6a4][Math.abs(_sh) % 5];
    }
    const mat = b.col ? tintedMat(wallTex, fam.rough, fam.metal, b.col)
      // `_zoneOf` returns the ZONE OBJECT, not its name — comparing it to a
      // string is always false and the coursing would silently never appear.
      : _isShow ? renderMat(_showTint, false, true, _COURSED_ZONE[(_zoneOf(b.p) || {}).n] || null)
      : _isVilla ? renderMat(_coveTint)
      : _isHeritage ? renderMat(0xf4efe4, true)
      : _isSmallBeach ? renderMat(_beachTint)
      : _isCove ? tintedMat(wallTex, fam.rough, fam.metal, _coveTint)
      : _isBeach ? tintedMat(wallTex, fam.rough, fam.metal, _beachTint)
                      : sharedMat(wallTex, fam.rough, fam.metal);
    const per = perimeter(pts);
    if (_mh && _mh > 1 && _mh < h - 0.5) {
      const lift = extrude(pts, h - _mh, mat, _mh);
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
      //
      // EVERY lifted mass now, not only og — the 2026-08-16 sweep (frame
      // 060) found a deck spanning a street with WINDOW PANELS ON ITS
      // UNDERSIDE: the facade treatment reaches the bottom cap of any
      // exposed overhang, and only og footprints were getting the cap.
      {
        const soffit = extrudeGeo(pts, 0.38, 0);
        soffit.translate(0, _mh - 0.38, 0);
        merger.add(soffit, MAT.soffit || MAT.conc, pts[0][0], pts[0][1]);
      }
      if (b.og) {
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
          const top = FOOT + _mh;
          if (top - gy < 2.2) continue;
          const col = new THREE.CylinderGeometry(0.34, 0.38, top - gy, 8);
          col.translate(px, gy + (top - gy) / 2, pz);
          merger.add(col, MAT.conc, px, pz);
          // A COLUMN IS THE ONE THING UNDER HERE THAT IS NOT OPEN.
          //
          // The owner walked into this plaza and asked "why the building can
          // pass thru?". The ground storey being open is correct and deliberate
          // — Siloso Beach Walk really does run under it — but the arcade carve
          // opens a CORRIDOR through the collision grid, and it cannot tell a
          // column from the wall it was written to remove. Probed on the ring,
          // 43 samples stopped on something solid and 17 hit drawn fabric with
          // no collision behind it at all.
          //
          // Published so the grid can put them back after it is carved. Doing it
          // the other way round — teaching the carve to avoid them — was the
          // wrong shape: the carve runs on data, the columns are decided here,
          // and the last thing to touch the grid should be the thing that knows.
          (window.__ogCols || (window.__ogCols = [])).push([px, pz]);
        }
      }
      capFlatRoof(b, h, _mh, _capForm);
      stats.count++;
      if (h > 40) stats.tall++;
      _bacc('generic mass');
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
      // ANCIENT EGYPT: A SHOW BUILDING IS NOT A PAINTED BOX.
      //
      // The zone tints landed on 2026-08-06 and gave the seven USS zones an
      // identity in COLOUR. Rendered from the walk, the result was still a
      // twenty-four metre blank gold cliff — Revenge of the Mummy is a 6,145 m2
      // footprint at 23.8 m with no cornice, no opening and no entrance, so
      // "USS does not feel like USS" survived the paint entirely. The zones
      // were being expressed by the one property a zone could reach, because
      // `_zoneTint` answered a colour and nothing could ask which zone.
      //
      // The two things that make a wall read as Egyptian are both silhouette,
      // which is why they beat any amount of texture here:
      //
      //   CAVETTO CORNICE  a concave lip that FLARES OUT as it rises, capped by
      //                    a torus roll. Drawn as stacked rings offset further
      //                    out the higher they go — growM is metres along the
      //                    mitred normal, so a 6,000 m2 shed and a 200 m2 kiosk
      //                    get the same 1.4 m lip instead of one scaled to the
      //                    plan (the eave lesson, in this file, above).
      //   BATTERED PLINTH  the wall foot leans out. Stacked rings the other way
      //                    round, widest at the ground.
      //
      // Every piece rides extrudeGeo, so they seat on the building's own FOOT
      // exactly as the mass does and cannot drift off it on a slope — which is
      // the parapet-in-the-sky bug this file already carries the fix for.
      //
      // GATED ON THE ZONE, NOT ON A NAME. Treasure Hunters and the unnamed show
      // buildings beside the Mummy are the same architecture and get the same
      // crown; deciding what a thing is belongs to the data.
      if (_isShow && h > 6) {
        const _z = _zoneOf(pts);
        // EVERY ZONE GETS A SILHOUETTE, NOT JUST A COLOUR.
        //
        // Ancient Egypt proved the recipe; this is the same move for the other
        // six. Each entry is a list of [outset, thickness, heightAboveFoot]
        // rings — offset outward along the mitred normal and stacked — which is
        // enough to give a roofline a character from a hundred metres, and it
        // is the SILHOUETTE that carries at that range, not any texture.
        //
        // ALL OF IT IS TOP-OF-WALL except Egypt's battered plinth, and that is
        // deliberate: a ring at ground level grows the footprint and can seal a
        // gap between two buildings or narrow a path. Egypt's is measured and
        // gated (opencheck 0 pockets, trailcheck 0 blocked); the rest stay in
        // the air, where they cost nothing but pixels.
        //
        // The forms are the ordinary architecture of each theme and nothing is
        // branded: a stepped brick cornice on a New York block, a deep flat
        // fascia band on a Sci-Fi hangar, battlements on Far Far Away, a heavy
        // overhanging eave on the wet jungle sheds of The Lost World, and a
        // fat rounded lip on Minion Land, which is a cartoon. Hollywood keeps
        // a plain deep fascia because a boulevard show building IS a flat
        // parapet with signage on it.
        const CROWN = {
          // ...AND EGYPT ALONE CARRIES A REGISTER BAND, §4 relief item 2:
          // "horizontal strips of cartouches and glyphs at parapet level and
          // at door head level, in sunken relief with faded pigment". `band`
          // is a ring like the others but drawn with texGlyphBand instead of
          // the crown's stone, so it is one extra batch for the zone and no
          // extra rings anywhere else. Set just under the crown, which is
          // parapet level; the door-head band the brief also names needs a
          // door height nothing here knows, and is not guessed at.
          'Ancient Egypt': { col: 0xc2a469, top: [[0.35, 0.55, -2.30], [0.80, 0.55, -1.75],
                                                  [1.25, 0.75, -1.20], [1.40, 0.45, -0.45]],
                             // 1.05m deep, and that is a MEASURED number, not
                             // a guess: at 0.72 the band was built, correctly
                             // placed and effectively invisible — rendered with
                             // the map swapped for flat red it showed as a hair
                             // line under the crown on a 15m wall. A register
                             // band is a course of the wall, not a pinstripe.
                             band: [[0.42, 1.05, -3.45]],
                             foot: [[0.85, 0.55, 0.0], [0.55, 0.55, 0.55], [0.25, 0.55, 1.10]] },
          // A CROWN IS A ROOF, SO IT TAKES THE ROOF'S SAMPLED COLOUR.
          //
          // These were picked to sit beside the authored wall palettes; now the
          // walls are sampled off photographs, four of them were arguing with
          // the thing they cap. Corrected against the same brief, and the two
          // that mattered are visible from outside the park:
          //
          //   FAR FAR AWAY was 0x9c86ad — LILAC, a purple band running along
          //   every roofline in Shrek's zone, and the loudest surviving piece
          //   of "pink and turquoise" the research corrects. §6 samples the
          //   roofs as weathered terracotta / burnt orange, #855E3A shaded to
          //   ~#C87A50 in sun.
          //
          //   THE LOST WORLD was 0x4e6644, a jungle green, on roofs §5A samples
          //   as "corrugated metal in dull silver-grey". The green in those
          //   photographs is the planting in front of the buildings, and this
          //   was the zone painting itself with its own vegetation.
          //
          // New York takes the grey-green fish-scale mansard slate §2 names,
          // and Sci-Fi City the deep streaked hull grey of §3 rather than a
          // blue-grey. Hollywood's pale limestone parapet is already what §1
          // samples for its cast-stone blocks and is left alone; so is Egypt's
          // gold, which §4 lists among the zone's few saturated accents.
          'New York':     { col: 0x6e7a6b, top: [[0.30, 0.35, -1.90], [0.60, 0.35, -1.55],
                                                 [0.85, 0.40, -1.20], [0.55, 0.80, -0.80]] },
          'Sci-Fi City':  { col: 0x5f5f59, top: [[0.55, 1.30, -1.60], [0.20, 0.45, -0.30]] },
          'Hollywood':    { col: 0xd2c1a2, top: [[0.45, 1.60, -1.90], [0.75, 0.40, -0.30]] },
          'The Lost World': { col: 0x8f9694, top: [[1.30, 0.45, -1.30], [0.80, 0.55, -0.75]] },
          'Jurassic World': { col: 0x8f9694, top: [[1.30, 0.45, -1.30], [0.80, 0.55, -0.75]] },
          // §5B's other half: salvage rust over the verdigris walls
          'WaterWorld':   { col: 0x8a4b2a, top: [[1.30, 0.45, -1.30], [0.80, 0.55, -0.75]] },
          'Far Far Away': { col: 0xa8683f, top: [[0.35, 1.10, -1.60], [0.70, 0.45, -0.50]] },
          // the Marketplace terrace's grey stone cornice (research/
          // minion-land.md §7), not the old banana-brass — the fat rounded
          // lip stays, because the zone is still a cartoon
          'Minion Land':  { col: 0x8d8d94, top: [[0.30, 0.50, -1.40], [0.75, 0.90, -0.90]] },
          'Madagascar':   { col: 0x8d8d94, top: [[0.30, 0.50, -1.40], [0.75, 0.90, -0.90]] },
        };
        const _c = _z && CROWN[_z.n];
        // hoisted: the pylon below is a separate piece of the same architecture
        // and must be the same stone as the crown, not a second guess at it
        const trimMat = _c ? renderMat(_c.col, false, true) : null;
        if (_c) {
          for (const [out, thick, at] of _c.top) {
            merger.add(extrudeGeo(growM(pts, out), thick, h + at), trimMat, cB[0], cB[1]);
          }
          for (const [out, thick, at] of (_c.foot || [])) {
            merger.add(extrudeGeo(growM(pts, out), thick, at), trimMat, cB[0], cB[1]);
          }
          for (const [out, thick, at] of (_c.band || [])) {
            merger.add(extrudeGeo(growM(pts, out), thick, h + at), glyphMat(thick),
              cB[0], cB[1]);
            stats.zoneBand = (stats.zoneBand || 0) + 1;
          }
          stats.zoneCrown = (stats.zoneCrown || 0) + 1;
        }
        // A PYLON GATEWAY WAS BUILT HERE AND CUT. The measurements are kept
        // because the next person will have the same idea.
        //
        // An Egyptian temple front is a pylon — two battered towers flanking a
        // lower opening — and Revenge of the Mummy's entrance is the obvious
        // place for one. It was built, on the footprint edge NEAREST the
        // entrance that data/entrances.py already computes, and it could not be
        // seen from anywhere.
        //
        // EVERY MEASUREMENT SAID IT WAS FINE: count 1, coordinates on the right
        // edge, `badGeo` 0, the material present in the scene with a bounding
        // box in the right place. It took a STRAIGHT-DOWN render to find that
        // the spot is covered by the ROOF OF ANOTHER BUILDING — an unnamed
        // 1,408 m2 show building sits in the gap between the Mummy's z-min edge
        // (12517) and the walk. The pylon was inside another mass.
        //
        // An earlier cut had a second fault worth knowing: it oriented the
        // towers "toward the entrance", which is wrong whenever the entrance
        // point falls INSIDE the footprint — on a 6,145 m2 shed it can. Outward
        // belongs to the ring's own centroid, which is growM's rule in this
        // file.
        //
        // AND IT WAS REBUILT WITH THAT TEST, AND THE ANSWER WAS ZERO.
        //
        // Second attempt added exactly what was missing: candidate edges sorted
        // by distance to the entrance, each tower site tested against every
        // other footprint within 90 m (at the tower centre and out to its full
        // 2.8 m projection), and the first clear one wins.
        //
        // It refused two edges and built on the EAST face — 72 m away, on the
        // far side of the shed, a clear site nobody walks past. So a second
        // rule was needed and is the more interesting one: the face must be one
        // people ARRIVE at (35 m of the entrance). A gateway on the wrong
        // facade is worse than none, because it is scenery that also lies about
        // where the way in is.
        //
        // With both rules the answer is **0 built, 1 refused**, and that is
        // correct rather than disappointing: the Mummy's arrival face is
        // occupied by an unnamed 1,408 m2 show building, and THAT is the mass a
        // visitor actually stands in front of. It already carries the Ancient
        // Egypt crown, because the crown is gated on the zone and not on a
        // name. The zone is as built as this data supports.
        //
        // The code is not kept. A recipe that builds nothing on the only data
        // it has is a promise, and this project removes those rather than
        // leaving them (the Glow Garden's `steps: 7`, emitted and ignored, is
        // the precedent). What to build instead, if anyone returns: the temple
        // front belongs on the building the visitor FACES, not on the one the
        // label is attached to — and that building is unnamed, so it needs the
        // zone's entrance rather than its own.
      }
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
        _capForm = 2;
      } else if (h > 8) {
        // parapet cap so roofs are not a raw extruded edge
        const c = centroid(pts);
        const out = pts.map(([x, z]) => [c[0] + (x - c[0]) * 1.008, c[1] + (z - c[1]) * 1.008]);
        merger.add(extrudeGeo(out, 0.7, h), MAT.trim, c[0], c[1]);
        _capForm = 1;
      }
    }

    // A RIDE BUILDING HAS NO GLAZED RETAIL FRONTAGE. Skipping the call outright
    // moved THIRTEEN of fourteen golden frames: addShopfront draws exactly one
    // `pick(SHOPS)`, and not drawing it for 53 buildings shifts the shared
    // placement stream and reshuffles the whole island. So the draw is taken
    // and thrown away, which is the same discipline surroundBlocks needed for
    // its island test. Only when the call would have got past its own early
    // return, or the stream would drift the other way.
    if (_isShow) {
      if (b.a > 600 && b.h > 7) pick(SHOPS);
    } else {
      addShopfront(world, b, per, merger, clearance);
    }

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
    capFlatRoof(b, h, _mh, _capForm);
    const _btLow = (b.bt || '').toLowerCase();
    const _domestic = _isCove || _isBeach
      || /^(apartments|residential|house|terrace|dormitory|bungalow|hotel|villa)$/.test(_btLow);
    // The footprint test and the roof height are wanted by BOTH roof passes
    // below, and neither depends on the RNG, so they are hoisted out of the
    // big-block branch rather than computed twice.
    const _rc = centroid(pts);
    const _roofY = FOOT + h;
    // ...AND IT ALL HAS TO LAND ON THE ROOF (see the long note below).
    const inFoot = (x, z) => {
      let hit = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], zi = pts[i][1], xj = pts[j][0], zj = pts[j][1];
        if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
      }
      return hit;
    };
    if (b.a > 900 && h > 12 && !_domestic) {
      const c = _rc;
      const roof = _roofY;
      // ...AND IT ALL HAS TO LAND ON THE ROOF.
      //
      // Every piece below was offset from the CENTROID by up to nine metres,
      // with no idea where the roof's edge is. On a compact block that is
      // fine; on a long thin one — Quayside Isle's terrace, most of the
      // island's retail — nine metres sideways is off the parapet, and a water
      // tank was left hanging over the edge in mid-air (vetted from above at
      // 990,13215). Ask the footprint: try a few offsets and keep the first
      // that is genuinely inside it, with a margin so nothing overhangs.
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
    } else if (!_domestic && b.a > 250 && h > 4 && !NOROOFKIT) {
      stats.smallRoofs = (stats.smallRoofs || 0) + 1;
      // THE SMALL ROOF, which the branch above has always skipped.
      //
      // That gate is `area > 900 AND height > 12`, and it is right for what
      // it builds: three plant boxes, a stair housing, two tanks and a duct
      // run is a CBD service roof and it belongs on a block. Measured
      // 2026-08-23 though, of 1,095 buildings on the island: 499 are exempt
      // as homes or hotels, 45 are too low, and **472 are excluded for
      // nothing but being under 900 square metres** — leaving 79 that get
      // anything. Everything east of Ocean Drive is in that 472, and an
      // aerial from Imbiah shows forty bare white planes in one frame.
      //
      // A 15x20m shop unit or workshop in Singapore is not a clean roof. It
      // carries a water tank and a vent or two. So: the same idea, a much
      // smaller kit, and never on a home (the Cove-residences lesson above
      // still governs — `_domestic` is tested here too).
      //
      // POSITION HASH, NOT `rand()`. The branch above draws from the shared
      // stream, and every placement pass written since is hash-driven for one
      // reason: another rand() call here shifts every facade, tree and detail
      // downstream of it and re-rolls the whole island. This one must be able
      // to be added and removed without moving anything else.
      const hk = (Math.imul(Math.round(_rc[0] * 8) | 0, 0x9E3779B1)
                ^ Math.imul(Math.round(_rc[1] * 8) | 0, 0x85EBCA77)) >>> 0;
      const hf = (i) => (((hk >>> (i * 3)) ^ Math.imul(hk + i * 2654435761, 0x27D4EB2F)) >>> 8) % 1000 / 1000;
      const hr = (i, lo, hi) => lo + hf(i) * (hi - lo);
      // Same spiral-inward search as the big kit, and the same last resort:
      // a concave footprint's centroid can be outside it, so a piece that
      // cannot be proved inside is not placed at all.
      const spot = (i, reach, need) => {
        for (let k = 0; k < 6; k++) {
          const f = 1 - k / 6;
          const x = _rc[0] + (hr(i + k * 7, -1, 1) * reach) * f;
          const z = _rc[1] + (hr(i + k * 7 + 3, -1, 1) * reach) * f;
          if (inFoot(x, z) && inFoot(x + need, z) && inFoot(x - need, z)
              && inFoot(x, z + need) && inFoot(x, z - need)) return [x, z];
        }
        return null;
      };
      const reach = Math.min(9, Math.sqrt(b.a) * 0.28);
      // one water tank, always — the piece every small roof here really has
      {
        const r2 = hr(1, 0.7, 1.05);
        const at = spot(1, reach, r2 + 0.5);
        if (at) {
          const tk = new THREE.CylinderGeometry(r2, r2, 1.5, 10);
          tk.translate(at[0], _roofY + 0.8, at[1]);
          merger.add(tk, MAT.trim, _rc[0], _rc[1]);
        }
      }
      // a condenser / vent box on most of them
      if (hf(2) < 0.72) {
        const w2 = hr(4, 1.0, 1.8), d2 = hr(5, 0.8, 1.4);
        const at = spot(11, reach, Math.max(w2, d2) / 2 + 0.5);
        if (at) {
          const g2 = new THREE.BoxGeometry(w2, hr(6, 0.8, 1.3), d2);
          g2.translate(at[0], _roofY + 0.5, at[1]);
          merger.add(g2, MAT.metal, _rc[0], _rc[1]);
        }
      }
      // and a stair or plant housing on the bigger third of them
      if (hf(7) < 0.34 && b.a > 450) {
        const w2 = hr(8, 2.2, 3.2), d2 = hr(9, 2.0, 2.8);
        const at = spot(21, reach * 0.7, Math.max(w2, d2) / 2 + 0.5);
        if (at) {
          const sh = new THREE.BoxGeometry(w2, hr(10, 2.2, 2.9), d2);
          sh.translate(at[0], _roofY + 1.3, at[1]);
          merger.add(sh, MAT.trim, _rc[0], _rc[1]);
        }
      }
    }
    stats.count++;
  }
  scopeDraws(null);       // back to the shared stream for everything after
  FOOT = STREET = null;   // nothing outside this loop belongs to a building
  // THE COVE PLOT. Runs here, AFTER the loop, and that is not tidiness: `FOOT`
  // is the current building's footing and a garden wall six metres away on a
  // slope must take the ground under ITSELF, which extrudeGeo only does once
  // FOOT is null again.
  stats.covePlots = buildCovePlots(_coveVillas, _coveSegs, merger);
  stats.coveVillas = _coveVillas.length;
  window.__covePlots = { plots: stats.covePlots, villas: _coveVillas.length };
  stats.mergedMeshes = await merger.flushY(world, {}, Y);
  const _os = oversailStat();
  stats.oversailPulled = _os.rings; stats.oversailVerts = _os.verts;
  window.__oversail = _os;
  return stats;
}

// THE COVE PLOT — what stands between the villa and the street.
//
// The owner's standing note, and the one the Pearl Island re-shot confirms:
// "I think alot of things not fully yet." The villa pass gave these houses five
// architectures and an upper terrace, and from the saddle the rows still read
// as boxes on bare grass, because a waterfront estate's street is not the
// houses — it is the WALL, the gate and the planting in front of them. 371
// villas had nothing at ground level at all.
//
// WHAT IS PUBLISHED AND WHAT IS AUTHORED, kept apart on purpose:
//   PUBLISHED (URA development control, bungalows) — a boundary wall may not
//   exceed 1.8m; side and rear setback is 2m; a car porch is at most 3m wide
//   measured column to column, set back 2.4m. Those are the constraints this
//   works inside.
//   AUTHORED — the wall is 1.1m, not the 1.8m maximum, because a 1.8m wall on
//   both sides of a 12m street hides the architecture the villa pass just paid
//   for; the piers are 1.5m; the gate opening is 4m. Sentosa Cove's OWN estate
//   design guidelines are not published (searched: SDC/Sentosa Cove Pte Ltd
//   publish the masterplan history, Spoerry and Klages Carter Vail, and no
//   boundary-treatment control), so nothing here is claimed as surveyed.
//
// THE PLOT BOUNDARY IS NOT SURVEYED EITHER — OSM maps the building, not the
// lot. So the frontage is derived: the nearest Cove road segment gives the
// direction to the street, the wall sits back from that centreline, and its
// length comes from the villa's own width across that direction. A villa with
// no room between its wall and the kerb simply gets nothing, which is why the
// count this returns matters more than the geometry.
function buildCovePlots(villas, segs, merger) {
  if (!villas.length || !segs.length) return 0;
  const WALL_H = 1.1, WALL_T = 0.35, PIER_H = 1.5, PIER_W = 0.5, GATE = 4;
  const SETBACK = 5.5;          // from the road centreline: ~3.5m carriageway half + verge
  let built = 0;
  const rect = (cx, cz, ux, uz, halfLen, halfWid) => {
    const px = -uz, pz = ux;
    return [
      [cx + ux * halfLen + px * halfWid, cz + uz * halfLen + pz * halfWid],
      [cx + ux * halfLen - px * halfWid, cz + uz * halfLen - pz * halfWid],
      [cx - ux * halfLen - px * halfWid, cz - uz * halfLen - pz * halfWid],
      [cx - ux * halfLen + px * halfWid, cz - uz * halfLen + pz * halfWid],
    ];
  };
  // AND THE GROUND HAS A VETO. `extrudeGeo` takes ONE footing per ring, so a
  // piece standing where the ground moves under it floats at one end and buries
  // at the other. Measured on this island's own heightfield: the ground can
  // shift 18.7m within a THREE-METRE span (the cliffs and the canal banks), so
  // segmenting alone is not enough — a piece whose corners disagree by more
  // than 0.7m is simply not built. A gap in a garden wall is a garden wall; a
  // 2m stone slab hanging in the air is the defect class this repo keeps
  // finding by eye.
  const clear = (ring) => {
    let lo = Infinity, hi = -Infinity;
    for (const [x, z] of ring) {
      if (onCarriageway(x, z, 0.2)) return false;
      if (_inNeighbour(x, z, null)) return false;   // never through a building
      const g = groundAt(x, z);
      if (g < lo) lo = g;
      if (g > hi) hi = g;
    }
    return hi - lo <= 0.7;
  };
  for (const b of villas) {
    const c = centroid(b.p);
    // nearest point on the nearest Cove road segment — the same "nearest wins"
    // rule the island keying uses, for the same reason
    let bd = Infinity, qx = 0, qz = 0;
    for (const [ax, az, cx2, cz2] of segs) {
      const vx = cx2 - ax, vz = cz2 - az;
      const L2 = vx * vx + vz * vz || 1;
      let t = ((c[0] - ax) * vx + (c[1] - az) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const px2 = ax + vx * t, pz2 = az + vz * t;
      const d = Math.hypot(c[0] - px2, c[1] - pz2);
      if (d < bd) { bd = d; qx = px2; qz = pz2; }
    }
    if (bd < 9 || bd > 45) continue;      // no frontage to dress, or not a street plot
    const dx = (qx - c[0]) / bd, dz = (qz - c[1]) / bd;   // toward the street
    // how far the house itself reaches toward the street, and how wide it is
    // across that direction — the wall must clear the first and match the second
    let reach = 0, halfW = 0;
    for (const [x, z] of b.p) {
      reach = Math.max(reach, (x - c[0]) * dx + (z - c[1]) * dz);
      halfW = Math.max(halfW, Math.abs((x - c[0]) * -dz + (z - c[1]) * dx));
    }
    const at = bd - SETBACK;              // distance from the villa centre to the wall
    if (at <= reach + 1.5) continue;      // the house is already at the kerb
    const wx = c[0] + dx * at, wz = c[1] + dz * at;
    const ux = -dz, uz = dx;              // along the frontage
    const half = Math.min(11, halfW + 1.5);
    if (half <= GATE / 2 + 1) continue;   // narrower than its own gate
    const runs = [
      [(GATE / 2 + half) / 2, (half - GATE / 2) / 2],     // centre offset, half length
      [-(GATE / 2 + half) / 2, (half - GATE / 2) / 2],
    ];
    let any = false;
    // SEGMENTED AT ~3m, AND NOT FOR THE MERGE COST. `extrudeGeo` takes ONE
    // footing for the whole ring, so an 11m wall on a slope is level while the
    // ground under it is not: it buries at the top and floats at the bottom.
    // Three-metre pieces each take their own ground and the wall steps down the
    // street, which is what a real boundary wall does anyway.
    for (const [off, hl] of runs) {
      const n = Math.max(1, Math.round((hl * 2) / 3));
      for (let i = 0; i < n; i++) {
        const sub = hl * 2 / n;
        const o2 = off - hl + sub * (i + 0.5);
        const sx = wx + ux * o2, sz = wz + uz * o2;
        const ring = rect(sx, sz, ux, uz, sub / 2, WALL_T / 2);
        if (!clear(ring)) continue;
        merger.add(extrudeGeo(ring, WALL_H), MAT.paleStone, sx, sz);
        // A COPING, because a wall without one is a slab. It is the single
        // cheapest thing that stops these reading as placeholder blocks: 12cm
        // of trim oversailing the wall by 7cm a side, which is the shadow line
        // the eye actually uses to tell a boundary wall from a concrete panel.
        merger.add(extrudeGeo(rect(sx, sz, ux, uz, sub / 2 + 0.07, WALL_T / 2 + 0.07), 0.12, WALL_H),
                   MAT.trim, sx, sz);
        any = true;
      }
    }
    for (const sgn of [-1, 1]) {
      const sx = wx + ux * sgn * (GATE / 2), sz = wz + uz * sgn * (GATE / 2);
      const ring = rect(sx, sz, ux, uz, PIER_W / 2, PIER_W / 2);
      if (!clear(ring)) continue;
      merger.add(extrudeGeo(ring, PIER_H), MAT.warmStone, sx, sz);
      merger.add(extrudeGeo(rect(sx, sz, ux, uz, PIER_W / 2 + 0.08, PIER_W / 2 + 0.08), 0.14, PIER_H),
                 MAT.trim, sx, sz);
      any = true;
    }
    if (any) built++;
  }
  return built;
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
    const EXT = half * ROAD_END_EXT;
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

// A DISC OF CARRIAGEWAY, seated on the terrain like a ribbon is. Used for the
// junction fillet — see its note in buildRoads. A triangle fan, so a 10-gon is
// ten triangles; the UVs are world-scaled so the asphalt texture runs
// continuously with the ribbons it fills between rather than stretching to fit
// the disc, which would read as a paler plate in the road.
function junctionPatch(cx, cz, R, y, seg = 10) {
  // NON-INDEXED, AND THAT IS NOT A STYLE CHOICE. `mergeOne` in this file copies
  // position and uv straight out of each geometry and NEVER READS AN INDEX — so
  // an indexed fan arrives in the merged buffer as a triangle soup in vertex
  // order. The first cut of this was indexed and drew a spray of dark shards
  // across Tanjong Beach Walk that looked for all the world like z-fighting;
  // it was three triangles made of the wrong eleven points. Height changes were
  // tried twice against that theory and neither moved it, which is what said
  // the theory was wrong.
  const g = new THREE.BufferGeometry();
  const pos = [], uv = [];
  const cy = TERRAIN.at(cx, cz) + y;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
    const x0 = cx + Math.cos(a0) * R, z0 = cz + Math.sin(a0) * R;
    const x1 = cx + Math.cos(a1) * R, z1 = cz + Math.sin(a1) * R;
    pos.push(cx, cy, cz,
             x0, TERRAIN.at(x0, z0) + y, z0,
             x1, TERRAIN.at(x1, z1) + y, z1);
    uv.push(cx / 8, cz / 8, x0 / 8, z0 / 8, x1 / 8, z1 / 8);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
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
  // Per-way: is each END a true terminal (no same-class bridge fragment
  // continues) — the same byEnd notion the approach ramp uses. The causeway
  // barrier trims back from TERMINAL ends only: a mapped road is a chain of
  // OSM ways, and trimming at every way end opened an 18m phantom gap in the
  // Gateway's continuous barrier at each mid-run way boundary (golden
  // arrival-causeway, first gate run of this fix).
  const BRTRIM = new Map();
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
        // A MAPPED POLYGON DOES NOT OUTRANK GROUND THAT IS PLAINLY DRY, and
        // the data pass next door already settled this exact conflict the
        // other way. `terrain.py` keeps a cell out of the water sink when it
        // carries a road or a building, and it kept precisely these cells:
        // x -1017..-1052, z 12105..12175 (SG_DRYWHY, SESSION 17). The runtime
        // then read the same coordinates back as water, because `waterFloor`
        // answers from the polygon alone — so the Gateway's landing, standing
        // at 2.14 m of dry made ground, was rejected as "no landing at all"
        // and its run got NO approach ramp. Deck flat at 3.40 over ground
        // climbing to 2.23: the 1.33 m step at -1036,12168.
        //
        // The height test above already covers what the polygon clause was
        // written for — a scenery-cut bridge ends at the clip margin, where
        // the terrain IS sea level and the first clause fires. So the polygon
        // keeps its veto only where the ground does not contradict it: below
        // SHELF_HI's 1.2 m the two agree it is shore, above it the survey wins.
        if (seaLv !== null && tH <= seaLv + 0.6) continue;
        if (TERRAIN.waterFloor && TERRAIN.waterFloor(e.x, e.z) !== null
            && seaLv !== null && tH <= seaLv + 1.2) continue;
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
      for (let qi = 0; qi < r.p.length && !runAloft.get(root); qi++) {
        const q = r.p[qi];
        // A CROSSING OVER WATER IS ALWAYS A BRIDGE, whatever the arithmetic
        // says. TERRAIN.at over a causeway reads the made ground it sits on,
        // so the clearance test can decide the Sentosa Gateway — the road
        // every visitor arrives on — is at grade and drop its deck, soffit and
        // piers into the strait. Whether a span is high enough to need piers
        // is a judgement; whether it is over water is a fact, and the fact
        // wins.
        //
        // AND THE FACT MUST BE ASKED ALONG THE SPAN, NOT AT THE VERTICES.
        // Sentosa Cove's three island bridges (Pearl, Sandy, Coral) are
        // 2-point ways whose endpoints both stand on dry bank — the water is
        // only ever mid-segment, so a vertex test never sees it, the
        // clearance arithmetic reads ~1m over the waterway's uncarved 7m
        // ground, and the run was declared "never in the air". No deck, so
        // the mapped water walled the rider ON the access road: the Pearl
        // and Sandy Island pockets of 2026-08-14. Walk each segment at 3m.
        if (TERRAIN.waterFloor && TERRAIN.waterFloor(q[0], q[1]) !== null) {
          runAloft.set(root, true); break;
        }
        if (deck0 - DECK_T - TERRAIN.at(q[0], q[1]) >= LOW_CLEAR) { runAloft.set(root, true); break; }
        if (qi + 1 < r.p.length && TERRAIN.waterFloor) {
          const n = r.p[qi + 1];
          const L = Math.hypot(n[0] - q[0], n[1] - q[1]);
          for (let t = 3; t < L; t += 3) {
            if (TERRAIN.waterFloor(q[0] + (n[0] - q[0]) * t / L,
                                   q[1] + (n[1] - q[1]) * t / L) !== null) {
              runAloft.set(root, true); break;
            }
          }
        }
      }
      if (!runAloft.has(root)) runAloft.set(root, false);
    });
    // fill BRTRIM: a barrier end is trimmable only at a genuine JUNCTION —
    // two or more OTHER carriageway ways (bridge or not) meeting the end.
    // The first rule ("terminal = no same-class bridge fragment continues")
    // ALSO trimmed where a bridge run flows into the same road's ordinary
    // segment, opening a 9m gap in the barrier line at every bridge-to-road
    // seam — the owner's 2026-08-22 phone report, "kerbs all breaking apart
    // not linking": the Cove island bridges shed their barrier ends at both
    // abutments. A continuation (exactly one other way) keeps its barrier;
    // a dead end keeps it too; only a merge apron (2+) loses the last 9m,
    // which is the gore point the trim was written for.
    const allCw = data.roads.filter((r) => r.p && r.p.length >= 2
      && r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'path' && r.k !== 'steps');
    const cwEnds = new Map();
    for (const r of allCw) {
      for (const p of [r.p[0], r.p[r.p.length - 1]]) {
        const k = Math.round(p[0] / 2) + ':' + Math.round(p[1] / 2);
        let a = cwEnds.get(k);
        if (!a) cwEnds.set(k, a = new Set());
        a.add(r);
      }
    }
    bws.forEach((r) => {
      const joiners = (p) => {
        const seen2 = new Set();
        const cx = Math.round(p[0] / 2), cz = Math.round(p[1] / 2);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            for (const o of (cwEnds.get((cx + dx) + ':' + (cz + dz)) || [])) {
              if (o !== r) seen2.add(o);
            }
          }
        }
        // ...plus ways whose AXIS passes close to the end (a slip road's
        // mapped end lands on the main way's line, not on a shared node —
        // the Brani gore's slip is 11.7m from the shared endpoint but 3.3m
        // from the end by axis). (half + 2) keeps a parallel dual
        // carriageway 15m away from counting as a junction.
        for (const o of allCw) {
          if (o === r || seen2.has(o)) continue;
          const reach = (o.w || 6) / 2 + 2;
          const pts = o.p;
          for (let i = 0; i < pts.length - 1; i++) {
            const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
            const ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez || 1;
            let t = ((p[0] - ax) * ex + (p[1] - az) * ez) / L2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx2 = p[0] - (ax + ex * t), dz2 = p[1] - (az + ez * t);
            if (dx2 * dx2 + dz2 * dz2 < reach * reach) { seen2.add(o); break; }
          }
        }
        return seen2.size;
      };
      BRTRIM.set(r, { t0: joiners(r.p[0]) >= 2, t1: joiners(r.p[r.p.length - 1]) >= 2 });
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
          // THE TOLERANCE WAS LARGER THAN THE DETECTOR, AND ALWAYS HAD BEEN.
          //
          // `deck` is `runMax + 1.2` and `target` is `tH + 0.06`, so at a
          // run's OWN highest landing the difference is exactly 1.14 and this
          // line skipped the ramp — by construction, on every run, everywhere.
          // "Natural abutment" is true of the DECK and false of the WALKER:
          // trailcheck flags a step over 1.0 m, so the machinery was licensed
          // to leave one it could never accept. Measured on the Gateway at
          // -1036,12168 (3.46 vs 2.13 = 1.33) and -1076,12177 (1.22).
          //
          // A real abutment ramps. 1.14 m over the 20 m RAMP is a 5.7% grade,
          // gentler than the trails already climb on Imbiah.
          if (deck - target <= 0.35) continue;        // a kerb, not a storey
          const d = Math.hypot(x - tx, z - tz);
          if (d < RAMP) h = Math.min(h, target + (deck - target) * (d / RAMP));
        }
        return h;
      };
      f.deck = deck;
      BRDECK.set(r, f);
    });

    // WHAT A RUN ACTUALLY UNIONS, WHEN YOU ASK IT.
    //
    // `runMax + 1.2` is one flat height for a whole connected run, and every
    // deck argument downstream inherits it — so when a deck floats, the
    // question is not "which clause read it" but "which GROUND set it". That
    // ground can be a way at the far end of a union nothing on the water ever
    // touches, and there was no way to see it from outside: the union, the
    // maxima and the terminals are all locals in this block.
    //
    // Same move `terrain.py`'s `_report_dry` makes: a number that cannot be
    // argued with becomes one that names its cause. Gated, because it walks
    // every bridge way twice and indexOf's each one — set `__DBG_RUNS` before
    // boot (Playwright's addInitScript) and read `__bridgeRuns` after.
    if (typeof window !== 'undefined' && window.__DBG_RUNS) {
      const runs = new Map();
      bws.forEach((r, i) => {
        const root = find(i);
        let g = runs.get(root);
        if (!g) { g = { root, cls: cls[i], ways: [], max: -Infinity, at: null }; runs.set(root, g); }
        let len = 0;
        for (let s = 0; s < r.p.length - 1; s++)
          len += Math.hypot(r.p[s + 1][0] - r.p[s][0], r.p[s + 1][1] - r.p[s][1]);
        // where this way's own ceiling comes from, and whether it is over water
        let wm = -Infinity, wat = null;
        for (const q of r.p) {
          const h = TERRAIN.at(q[0], q[1]);
          if (h > wm) { wm = h; wat = [Math.round(q[0]), Math.round(q[1])]; }
        }
        if (wm > g.max) { g.max = wm; g.at = wat; }
        const wet = r.p.filter((q) =>
          TERRAIN.waterFloor && TERRAIN.waterFloor(q[0], q[1]) !== null).length;
        g.ways.push({ road: data.roads.indexOf(r), k: r.k, n: r.n || '', w: r.w,
                      len: +len.toFixed(0), ws: r.ws || '',
                      max: +wm.toFixed(2), at: wat, pts: r.p.length, wet });
      });
      window.__bridgeRuns = [...runs.values()].map((g) => ({
        root: g.root, cls: g.cls, ways: g.ways,
        runMax: +g.max.toFixed(2), runMaxAt: g.at,
        deck: +(g.max + 1.2).toFixed(2),
        aloft: !!runAloft.get(g.root),
        terms: (runTerms.get(g.root) || []).map(
          (t) => [Math.round(t[0]), Math.round(t[1]), +t[2].toFixed(2)]),
      }));
    }
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
    // THE SAME FOOTPATH WAS BEING SURFACED TWICE, AT THE SAME HEIGHT.
    //
    // Found 2026-08-05 from the spawn point, where the plaza read as a mess of
    // overlapping angular slabs. A downward-ray grid over it named the layers by
    // material identity: 25 pairs of ground surfaces within 0.25m of each other
    // in a 130m box, several at 0.00m — MAT.paving from this loop and paveM from
    // buildTrails, both laid at ground + 0.02, exactly coincident. Coincident
    // surfaces z-fight at every distance, and that is the shattered look.
    //
    // buildTrails draws the better ribbon: it steps along the way every 6m and
    // takes surfaceAt at all four corners, so it drapes over Imbiah instead of
    // spanning it, and it picks boardwalk / earth / paving per piece. This loop
    // drew one flat quad per segment. Measured: 690 path ways, 82.5 km, against
    // 9,150 drawn pieces in buildTrails — the overlap is most of it.
    //
    // So the paths belong to buildTrails and this loop leaves them alone —
    // but ONLY THE DRAWING. The first version skipped the whole iteration here,
    // and everything between this point and the ribbon is load-bearing: the
    // FOOTBRIDGE REGISTRATION and the causeway walked-deck registration both
    // live below, and they are what tell a walker that a footbridge deck is
    // something to stand on. Skipping them took the deploy ledger's blocked
    // walking runs from 0 to 1 — caught by the ledger, invisible in a frame.
    // The skip is now at the ribbon itself. `?pathdupe` restores the old layer.
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
    // A NARROW BRIDGE IS STILL A BRIDGE TO STAND ON (2026-08-30).
    //
    // The clause below registers a deck only at 5.5m and wider, because "a 2m
    // footbridge deck is not something the ride belongs on". That is right
    // about footbridges and wrong about a 3.8m SERVICE bridge, which is a road
    // — and the ribbon at the bottom of this loop draws it on a deck either
    // way. So it was drawn in the air and registered nowhere: sweep frame 093
    // at -913,11888 is the rider on Brani Drive 7 with nothing but her helmet
    // above the tarmac she is riding on, sitting at 0.06 under a deck at 1.26.
    //
    // This is the SAME defect as the causeway footpath a few lines up, whose
    // note says it "left the walker draped at TERRAIN inside the neighbouring
    // road deck, buried to the helmet" — one class over, and fixed the same
    // way, with the walked-deck registry rather than the ride's own. It is a
    // walk surface and not a BRIDGES entry on purpose: BRIDGES carries soffits,
    // parapets and piers, and a 3.8m service crossing wants none of them.
    //
    // THE HEIGHT IS NOT RE-DERIVED. `ribbon` owns the rule (a number, a ramp
    // function, or max terrain + 1.2) and a second copy of it is a second thing
    // to drift — this reads BRDECK exactly as ribbon does, and adds the same
    // `y` the ribbon is drawn at.
    if (r.bridge && !isPath && (r.w || 0) < 5.5 && BRDECK.get(r) !== false) {
      const f = BRDECK.get(r);
      let deck = 0;
      if (typeof f === 'number') deck = f;
      else if (typeof f !== 'function') {
        for (const q of r.p) deck = Math.max(deck, TERRAIN.at(q[0], q[1]));
        deck += 1.2;
      }
      for (let i = 0; i < r.p.length - 1; i++) {
        const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
        const yd = typeof f === 'function' ? f((x1 + x2) / 2, (z1 + z2) / 2) : deck;
        addWalkSurface(x1, z1, x2, z2, Math.max(1.2, (r.w || 3) / 2), yd + y);
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
      bridgeFabric(r.p, r.w, addBridgeWay(r.p, r.w, BRDECK.get(r)), bridgeGeos,
        pierGeos, r.n, BRDECK.get(r), BRTRIM.get(r));
    }
    // ...and here is where a footpath stops: registered above, drawn by
    // buildTrails, not surfaced twice.
    if (isPath && !PATH_DUPE) continue;
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
  // THE JUNCTION FILLET — the green wedges D1 was really about.
  //
  // Every way is drawn as its OWN mitred ribbon, so where a 3.8m side street
  // meets an 8m one the corner between the two ribbons is not paved by either.
  // The ground shows through as a GREEN WEDGE lying in the middle of what a
  // rider reads as one junction, with the kerb running round it — which is
  // exactly what the sweep filed as "floating/detached kerb slabs on
  // carriageways" (D1, ~20 frames, five areas). It is on Tanjong Beach Walk,
  // in the owner's own beach frames.
  //
  // AND THE KERBS WERE INNOCENT: kerbcheck reports 0 of 3,951 sampled kerb
  // vertices more than 1.2m inside a carriageway. Nothing is standing in the
  // road. The road simply is not there.
  //
  // MEASURED: 1,865 nodes on this island are shared by two or more ways, 545 of
  // them by ways whose widths differ by more than 1.5m — the ones that leave a
  // wedge. A disc at each, radius = the widest half-width meeting there plus
  // 0.6m, closes the corner at any angle without needing to know the geometry
  // of the turn.
  //
  // SEATED 5mm UNDER THE RIBBONS, deliberately: the ribbons run 0.055..0.0608
  // and this sits at 0.050, so wherever a ribbon exists the ribbon wins and
  // nothing z-fights, and the fillet is only ever seen in the gap it is for.
  // It is still well clear of the terrain, so P8 has nothing to say either.
  {
    const CELL = 0.5;
    const nodes = new Map();
    for (const r of (data.roads || [])) {
      if (r.k === 'pedestrian' || r.k === 'footway' || r.bridge) continue;
      const p = r.p || [];
      if (p.length < 2) continue;
      const hw = (r.w || 6) / 2;
      for (const [x, z] of p) {
        const k = Math.round(x / CELL) + ',' + Math.round(z / CELL);
        const e = nodes.get(k);
        if (!e) nodes.set(k, { x, z, hw, n: 1, ways: new Set([r]) });
        else { e.hw = Math.max(e.hw, hw); e.ways.add(r); e.n++; }
      }
    }
    let filled = 0, tapers = 0;
    const TAPER_LEN = 9;
    for (const e of nodes.values()) {
      if (e.ways.size < 2) continue;          // a way's own middle needs nothing
      const R = e.hw + 0.6;
      roadGeos.push(junctionPatch(e.x, e.z, R, 0.050));
      filled++;
      // ...AND THE TAPER, WHICH IS THE BIGGER HALF OF THE WEDGE.
      //
      // A disc closes the corner AT the node and nothing more, and the wedge on
      // Tanjong Beach Walk survived one: it is not a corner, it is a WIDTH
      // CHANGE. An 8m way continues as a 3.8m way at a shared node, and the
      // 2.1m step down each side opens a long thin triangle of bare ground
      // between the two ribbons, running as far as the eye follows the road.
      // Real carriageways taper; ours stepped.
      //
      // So where the widths differ by more than a metre, the narrow way's first
      // TAPER_LEN metres are re-laid at the WIDE width, under both ribbons. It
      // is the same 5mm-under trick, so nothing z-fights and nothing shows
      // except the ground that should never have been visible.
      const wide = Math.max(...[...e.ways].map((r) => (r.w || 6)));
      for (const r of e.ways) {
        const w = r.w || 6;
        if (wide - w <= 1.0) continue;
        const p = r.p || [];
        if (p.length < 2) continue;
        // walk from whichever end of this way the node is
        const dStart = Math.hypot(p[0][0] - e.x, p[0][1] - e.z);
        const dEnd = Math.hypot(p[p.length - 1][0] - e.x, p[p.length - 1][1] - e.z);
        if (Math.min(dStart, dEnd) > CELL * 2) continue;
        const seq = dStart <= dEnd ? p : [...p].reverse();
        const sub = [seq[0]];
        let run = 0;
        for (let i = 1; i < seq.length && run < TAPER_LEN; i++) {
          const d = Math.hypot(seq[i][0] - seq[i - 1][0], seq[i][1] - seq[i - 1][1]);
          if (run + d <= TAPER_LEN) { sub.push(seq[i]); run += d; }
          else {
            const t = (TAPER_LEN - run) / d;
            sub.push([seq[i - 1][0] + (seq[i][0] - seq[i - 1][0]) * t,
                      seq[i - 1][1] + (seq[i][1] - seq[i - 1][1]) * t]);
            run = TAPER_LEN;
          }
        }
        if (sub.length >= 2) { roadGeos.push(ribbon(sub, wide, 0.050)); tapers++; }
      }
    }
    window.__junctionFillets = filled;
    window.__junctionTapers = tapers;
  }
  // THE MARGIN WHERE A ROAD MEETS THE GRASS — the open half of the owner's
  // 2026-08-16 ride report: "no edge where they meet the grass, no verge, no
  // kerb line". The kerb line was never the missing part: measured 2026-08-20,
  // there are 648 kerb props within 200m of the Siloso run, 469 on Tanjong and
  // 1,280 on Palawan, and the audit finds only 4 streets island-wide without
  // them. What is missing is TONE. A carriageway is drawn as one flat colour
  // out to its last centimetre, so the edge is a hard seam between two flat
  // fields and reads as coloured floor rather than as something built.
  //
  // buildTrails solved exactly this for paths and wrote down why — "darken the
  // outer eighth of the width... its absence is most of why a flat quad reads
  // as a coloured floor" — and roads never got it. This is that treatment,
  // and it is shader-only: no geometry, no memory, no draw calls, which
  // matters because triangles sit at 91% of budget and the iOS heap ceiling is
  // the tightest limit this project has.
  //
  // ONE DIFFERENCE THAT WILL BITE ANYONE COPYING IT: the two ribbon builders
  // use OPPOSITE uv conventions. buildTrails puts ACROSS in `v`; ribbon() here
  // pushes `(t, u)` where t = (f+1)/2 is ACROSS and u is along, so the road
  // margin has to read **vTUv.x**. Writing .y here darkens bands across the
  // road at every metre instead of a margin down each side.
  // 0.26 is buildTrails' own default, deliberately: paths and roads meeting the
  // same grass should wear the same margin, and that value is already in the
  // game and accepted. Measured on the rendered pixel at Siloso — road centre
  // luminance 68, margin 56 — so this is a real 18% band, not a hopeful one.
  const edged = (m, edge = 0.26, band = 0.085) => {
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = 'varying vec2 vREUv;\n'
        + sh.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\n  vREUv = uv;');
      sh.fragmentShader = 'varying vec2 vREUv;\n'
        + sh.fragmentShader.replace('#include <color_fragment>',
          `#include <color_fragment>
          {
            float e = smoothstep(0.0, ${band.toFixed(3)}, vREUv.x)
                    * smoothstep(0.0, ${band.toFixed(3)}, 1.0 - vREUv.x);
            diffuseColor.rgb *= mix(${(1.0 - edge).toFixed(2)}, 1.0, e);
          }`);
    };
    m.customProgramCacheKey = () => `edged${edge}_${band}`;
    return m;
  };
  edged(MAT.asphalt);
  edged(MAT.unitPave, 0.16);      // pavers are lighter; a heavy margin reads as dirt
  edged(MAT.roadConc, 0.16);
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
    // ---- FULL-SIZE TRUNKS: THE TWO PLACES A TREE MUST NOT STAND ----
    //
    // (1) ON THE DRAWN TARMAC, and __onRoad is not the test. It answers from
    //     the mapped ways; city.js then lays a DISC at every shared node and
    //     re-lays width TAPERS on top of them, and neither is in the data. So
    //     a trunk beside a junction passed every guard and stood in the road.
    //     The owner reported this twice — 2026-08-22, answered by nudging a
    //     margin 0 -> 0.5, and again 2026-08-24. Measured with the ray probe
    //     that is now data/treecheck.mjs: 64 full-size trunks on drawn tarmac.
    //     __onDrawnRoad carries the discs and tapers (see ROAD_JUNCTION_PAD in
    //     roads.js). The extra 1.5m of margin on top is the MITRE: a ribbon's
    //     outside corner reaches past half its width, so at a bend the tarmac
    //     is wider than any half-width test knows. Every one of these numbers
    //     was measured against the probe, none of them chosen.
    //
    // (2) IN THE SEA, and __inWater is not that test either. It knows the
    //     mapped water POLYGONS — the lagoons, the marina basin — and the open
    //     sea is not one of them: it returned false for all 527 trunks the ray
    //     found standing on `seaSurface` off Palawan and Tanjong. Nor is at()
    //     the substitute (it reads 0.45-0.97 there) nor drawnGroundAt/vertexY
    //     (0.39-0.91) while the drawn skin is at -0.08. The shore is steep and
    //     the mesh is flat BETWEEN its vertices; `atDrawn` interpolates the
    //     triangle, which is why terrain.js wrote it: "the audit measures the
    //     world that is rendered, not the function it was sampled from".
    //
    // AND IT MOVES THEM, IT DOES NOT DELETE THEM. Refusing outright was tried
    // first and cost 1,028 trees: the golden frames showed Sensoryscape's
    // avenue thinned out and the Palawan islet stripped bare, a 4% frame
    // change in the wrong direction on an island whose owner is asking for
    // MORE greenery, not less. A tree 40cm into a kerb belongs on the verge,
    // not in the bin. Deterministic spiral out from where it was mapped —
    // position-hashed start angle, no RNG draw, so the shared placement stream
    // is untouched — and only a trunk that cannot find a legal spot within 12m
    // is dropped.
    if (!low && scale >= 0.5) {
      const _road = OLDTREEGUARD ? window.__onRoad : (window.__onDrawnRoad || window.__onRoad);
      const _seaY = SEA_LEVEL[0] !== null ? SEA_LEVEL[0] : 0.18;
      const _margin = OLDTREEGUARD ? 0.5 : 1.5;
      const _illegal = (px, pz) =>
        (_road && _road(px, pz, _margin))
        || (!OLDTREEGUARD && TERRAIN.atDrawn && TERRAIN.atDrawn(px, pz) <= _seaY)
        || (window.__inWater && window.__inWater(px, pz))
        || (window.__inFootprint && window.__inFootprint(px, pz))
        || (window.__underCanopy && window.__underCanopy(px, pz));
      if (_illegal(x, z)) {
        let _h = (Math.imul(Math.round(x * 4) | 0, 0x9E3779B1)
                ^ Math.imul(Math.round(z * 4) | 0, 0x85EBCA77)) >>> 0;
        const _a0 = (_h % 360) * Math.PI / 180;
        let _fx = null, _fz = null;
        for (const _r of [2, 3.5, 5, 7, 9.5, 12]) {
          for (let _k = 0; _k < 12; _k++) {
            const _a = _a0 + _k * (Math.PI / 6);
            const _px = x + Math.cos(_a) * _r, _pz = z + Math.sin(_a) * _r;
            if (_illegal(_px, _pz)) continue;
            _fx = _px; _fz = _pz; break;
          }
          if (_fx !== null) break;
        }
        const _S = (window.__treeMoveDbg = window.__treeMoveDbg || { moved: 0, dropped: 0 });
        if (_fx === null) { _S.dropped++; return; }
        _S.moved++;
        x = _fx; z = _fz;
      }
    }
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
    // EVERY DRAW IN THIS TREE FROM ITS OWN POSITION — PARAM-GATED PROTOTYPE
    // (?planthash=1, 2026-08-14). The reseed (batch 12) fixed the OFFSET
    // mode; what survives is DIVERGENCE: a tree near an edit accepted or
    // rejected differently shifts the shared stream for every tree after it,
    // which is the residual 4-frames-under-0.5%. The end state this file's
    // own leaf-card note argues for is per-tree randomness FROM A POSITION
    // HASH — then no tree's look can depend on any other tree's fate. Behind
    // the param because flipping it reshuffles the island's planting ONCE
    // (every crown re-rolls), which is a look-and-feel call on the owner's
    // world: the batch-8 playbook, make the decision cheap rather than take
    // it. With the flag off, _R IS R and _rand IS rand — the default path is
    // the same functions and the same bytes.
    const _tr = (typeof window !== 'undefined' && window.__planthash)
      ? rng((Math.imul(Math.round(x * 8) | 0, 0x9E3779B1)
             ^ Math.imul(Math.round(z * 8) | 0, 0x85EBCA77)) >>> 0)
      : null;
    const _R = _tr || R;
    const _rand = _tr ? (a, b) => a + _tr() * (b - a) : rand;
    {
      // total height and crown radius. A mature roadside Angsana is about as
      // wide as it is tall, which is what makes the avenue meet overhead.
      // SPECIES, EXPRESSED AS PROPORTION — which costs nothing.
      //
      // The owner, 2026-08-06: "double check vegetations all again those kind".
      // Every tree on the island was ONE rule: the Angsana dome, as wide as it
      // is tall. Sizes varied and shapes did not, so a hillside read as one
      // tree stamped out five thousand times, which is exactly what makes a
      // forest look flat however many trunks are in it.
      //
      // A real species dimension would mean new geometry per kind, and the
      // planting sets are already 883,000 instances — the wrong place to spend
      // memory. But most of what the eye reads as "different tree" at fifty
      // metres is SILHOUETTE: how tall against how wide, and how far up the
      // bole the crown starts. Those are three multipliers on numbers this
      // function already computes, so the variety is free.
      //
      // Proportions are authored (SENTOSA.md Layer 2), and chosen to span what
      // actually grows on the island: the broad roadside Angsana, the slender
      // emergents that stand above the canopy on Imbiah and Serapong, and the
      // low spreading sea almond and seagrape along the shore.
      const _sp = _rand(0, 1);
      const _radK = _sp < 0.55 ? 1 : _sp < 0.80 ? 0.62 : 1.18;
      const _hK   = _sp < 0.55 ? 1 : _sp < 0.80 ? 1.18 : 0.82;
      const _baseK = _sp < 0.55 ? 1 : _sp < 0.80 ? 1.15 : 0.85;
      let h = _rand(13.0, 17.5) * scale * _hK;
      const rad = _rand(8.0, 12.0) * scale * _radK;
      const gy = TERRAIN.at(x, z);
      // where the crown starts, and how deep the dome is from top to rim
      let crownBase = h * _rand(0.50, 0.60) * _baseK;
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
        const a = (k / BRANCH) * Math.PI * 2 + _rand(-0.35, 0.35);
        const L = rad * _rand(0.30, 0.46);
        const tilt = _rand(1.32, 1.52);          // radians from vertical: near flat
        p.set(x + Math.cos(a) * L * 0.42,
              gy + crownBase + crownDepth * 0.26 + _rand(-0.3, 0.5),
              z + Math.sin(a) * L * 0.42);
        e.set(Math.cos(a) * tilt, 0, -Math.sin(a) * tilt);
        q.setFromEuler(e); sc.set(scale, L, scale);
        m.compose(p, q, sc); branches.setMatrixAt(c.bi++, m);
      }

      // Solid mass inside the dome so the crown is not see-through from below.
      // Sitting these at the centre and squashing them vertically is what makes
      // it read as one canopy rather than a cloud of separate leaves.
      for (let k = 0; k < BLOBS; k++) {
        const rr = rad * _rand(0.0, 0.60);
        const a = _R() * Math.PI * 2;
        const t = rr / rad;
        const r = rad * _rand(0.26, 0.42);
        // spread them down through the crown, not just under its skin, so the
        // limbs below the leaf shell sit in foliage instead of in daylight
        const bx = x + Math.cos(a) * rr, bz = z + Math.sin(a) * rr;
        let by = gy + crownTop - domeDepth * (t * t * 0.8 + _rand(0.05, 0.55)) - r * 0.30;
        // foliage that hangs OVER a carriageway clears the traffic envelope
        // the audit judges (9m): one small Clarke Quay tree put a blob 7m
        // over the road. Clamping the single offending blob (not lifting
        // whole crowns) keeps the avenue's look untouched.
        if (window.__onRoad && by - gy < 9.2 + r * 0.52
            && window.__onRoad(bx, bz, -0.2)) {
          by = gy + 9.2 + r * 0.52;
        }
        p.set(bx, by, bz);
        // EVERY BLOB USED THE SAME ORIENTATION, which is why a crown reads as
        // stacked flat PLATES rather than as a mass. An icosahedron at detail
        // 0 is twenty faces; squashed to about half height and left unrotated,
        // all ~117,000 of them present the same broad facet at the same angle,
        // and where trees are sparse (Sentosa Cove, the avenue trees) the
        // canopy comes out as hard angular slabs against the sky.
        //
        // Rotating each one hides the shared silhouette for nothing: no extra
        // triangles, no extra memory, the matrix was being composed anyway.
        //
        // FROM A POSITION HASH, NOT FROM _rand(). Three _rand() calls per blob
        // would consume the placement RNG stream and reshuffle every
        // downstream decision in the world — the rule this file states as "a
        // texture must not be able to move a bus stop". The hash is
        // deterministic, so the determinism gate is untouched.
        const hb = (bx * 73.13 + bz * 41.71 + k * 17.37);
        e.set(Math.sin(hb) * 1.9, Math.sin(hb * 1.7 + 2.1) * 3.14, Math.sin(hb * 2.3 + 4.2) * 1.9);
        q.setFromEuler(e);
        // ...and a touch rounder, so a rotated facet does not simply present a
        // flat edge instead of a flat face.
        sc.set(r, r * 0.62, r);
        m.compose(p, q, sc); blobs.setMatrixAt(c.li++, m);
      }

      // Leaf cards over the dome surface. The height falls off with the SQUARE
      // of the distance from the trunk, which is what makes a dome instead of a
      // disc, and the outermost cards get an extra drop for the droop.
      for (let k = 0; k < CARDS; k++) {
        const a = _R() * Math.PI * 2;
        // Biased slightly inward of even-area coverage (which is sqrt). Even
        // coverage leaves the middle of the crown thin, and the middle is
        // exactly where the limbs are.
        const t = Math.pow(_R(), 0.70);
        const rr = rad * t;
        const droop = domeDepth * t * t * 0.72 + t * t * t * rad * 0.30;
        p.set(x + Math.cos(a) * rr,
              gy + crownTop - droop + _rand(-0.5, 0.5),
              z + Math.sin(a) * rr);
        // D4, THE FOLIAGE STRETCH-RIBBONS — AND THE CARD SIZE WAS NEVER THE
        // CAUSE. A card is `rad * 0.42..0.72` across, which on a 12m crown is
        // an EIGHT-METRE plane, and the sweep filed the result as "stretch
        // ribbons" on eight frames. The instinct is to shrink it, and that is
        // wrong twice over: coverage falls with the SQUARE of the size, so
        // holding the canopy would need ~104 cards a tree instead of 40 —
        // 1.17M more instances on a fill-rate-bound GPU — and it would not fix
        // the look anyway.
        //
        // THE CAUSE IS THE TILT. This read `-1.5..-0.75 - t * 0.35`: every
        // card lies within about 40 degrees of HORIZONTAL, and the rim cards,
        // which the extra `- t * 0.35` pushes PAST horizontal, are the ones a
        // rider at eye height sees exactly edge-on. An 8m plane seen edge-on is
        // an 8m green ribbon, which is the defect, drawn precisely as asked.
        //
        // A dome's surface does not do that: its normal turns OUTWARD as it
        // falls to the rim. So the tilt now runs WITH t rather than against it
        // — near-horizontal over the crown, swinging toward vertical at the
        // edge, where it presents its FACE to the street instead of its edge.
        // Same one `_rand` call, same RNG stream, not one extra triangle.
        e.set(_rand(-1.35, -0.95) + t * 0.75, a + _rand(-0.7, 0.7), _rand(-0.4, 0.4));
        q.setFromEuler(e);
        const v = rad * _rand(0.42, 0.72); sc.set(v, v, v);
        // every card COMPUTES (the RNG draws above must happen for all 40 —
        // see CARDS_DRAWN in _prep); only the first CARDS_DRAWN are written
        if (k < c.CARDS_DRAWN) { m.compose(p, q, sc); cards.setMatrixAt(c.ci++, m); }
      }
    }
  }
  _finish(c, world) {
    // THE QUATERNIUS TREES ARE THE WORLD'S TREES (owner art direction,
    // 2026-08-22: "this is actually what I imagined for my world" — staged
    // pack restyle, stage 1). _tree still runs in full first, so the
    // placement RNG stream is byte-identical to the procedural era;
    // buildQTrees only changes what is DRAWN. Models are quadric-slimmed to
    // fit the 1600k tris budget (measured 1576k at the fps probe, 20fps).
    // ?oldtrees=1 keeps the procedural set for A/B.
    if (typeof window === 'undefined'
        || !new URLSearchParams(location.search).has('oldtrees')) {
      // B16 street trees (beauty sweep): the Ocean Drive east grid and the
      // parking canyon were the only genuinely TREELESS streets in 220
      // frames. Hand zones scanned on a grid, kept only where NEAR a road
      // but the trunk clears the tarmac — a separate deterministic list
      // APPENDED at draw time; the placement RNG stream is untouched.
      const B16 = [[1450, 12580, 1620, 12920], [-380, 13020, -260, 13130]];
      const extra = [];
      for (const [x0, z0, x1, z1] of B16) {
        for (let x = x0; x <= x1; x += 17) {
          for (let z = z0; z <= z1; z += 17) {
            const h = (Math.imul(Math.round(x * 4) | 0, 0x9E3779B1)
                     ^ Math.imul(Math.round(z * 4) | 0, 0x85EBCA77)) >>> 0;
            if ((h % 10) < 4) continue;
            const px = x + ((h >>> 4) % 80) / 10 - 4;
            const pz = z + ((h >>> 9) % 80) / 10 - 4;
            if (!window.__onRoad || !window.__onRoad(px, pz, 7)) continue;   // street trees, not forest
            if (window.__onRoad(px, pz, -1.2)) continue;                    // trunk clears tarmac
            if (window.__inFootprint && window.__inFootprint(px, pz)) continue;
            if (window.__onPath && window.__onPath(px, pz)) continue;
            if (window.__inWater && window.__inWater(px, pz)) continue;
            if (TERRAIN.at(px, pz) < 0.6) continue;
            extra.push([px, pz, 0.85 + ((h >>> 12) % 30) / 100, false]);
          }
        }
      }
      buildQTrees(world, this.items.concat(extra), (x, z) => TERRAIN.at(x, z));
      return this.items.length + extra.length;
    }
    c.branches.count = c.bi; c.blobs.count = c.li; c.cards.count = c.ci;
    world.add(c.trunks, c.branches, c.blobs, c.cards);
    return this.items.length;
  }
}

// NOTHING ON THIS ISLAND IS SEATED ON THE GROUND IT STANDS ON (2026-08-28).
//
// Shadows are OFF, by the owner's own A/B — "make all smooth for gameplay",
// main.js:100 — and that decision stands; it bought 3 fps on the phone and it
// is not being reopened here. What it costs is the ONE cue that says a thing
// is standing on a surface rather than pasted in front of it: the darkening in
// the angle where a wall meets the floor. Every vet frame of this world shows
// buildings meeting the ground on a hard bright line. shots of tanjong-wall,
// cove-villa and lostworld-timber are all the same picture of it.
//
// A CONTACT SHADE IS NOT A SHADOW. It does not know where the sun is, it never
// moves, it is the same on every device and it is the same in every frame —
// which is the whole reason it can be geometry instead of a shadow map, and
// why the golden gate stays deterministic with it in.
//
// THE FIRST ATTEMPT BAKED IT INTO THE TERRAIN'S VERTEX COLOUR and it cannot
// work, for a reason worth writing down because it is invisible until you
// measure it: THE GROUND MESH IS FAR TOO COARSE. The heightfield is 35m cells
// and 8,028 of the island's 13,064 cells are drawn at subdiv 1 — one quad, 35m
// across. A 2.6m halo has nowhere to live in that mesh; the run reported 7,779
// vertices touched out of 150,381, and what it drew was 35m smears, not
// contact. (A byte-per-vertex attribute plus its carry through consolidate was
// written, run, measured and deleted. The measurement is the useful part.)
//
// So it is drawn: one quad strip per footprint edge, mitred at the corners so
// convex angles do not double-darken, MULTIPLY blended, white at the outer lip
// so it fades to no change at all. Batched into 240m tiles and flagged
// tileBatch, so the LOD pass culls them past 500m like every other flat
// detail. `?noshade` turns it off for an A/B.
export function buildContactShade(world, data) {
  // THREE LIPS, NOT TWO, AND THE MIDDLE ONE IS THE WHOLE DIFFERENCE. A single
  // quad interpolates linearly, and a linear ramp ending flat has a kink in it
  // that the eye reads as a drawn line running parallel to the wall — a Mach
  // band, photographed on the first cut at Quayside Isle. Three lips give the
  // falloff a curve: most of the darkness is spent in the first metre, which
  // is also where contact actually lives.
  //
  // The inner lip is pushed 0.25m INSIDE the footprint because a wall is not
  // drawn on its footprint line — plinths, skirts and facade thickness all put
  // fabric a little outside it, and a band that starts exactly on the line
  // leaves a lit sliver at the very base, which is the one place this effect
  // exists to darken.
  const LIPS = [[-0.25, 0.62], [0.85, 0.80], [2.4, 1.0]];
  const TILE = 240;
  const tiles = new Map();
  let rings = 0, quads = 0, orphan = 0;
  const seaY = SEA_LEVEL[0];
  const SOLIDQ = typeof window !== 'undefined' ? window.__solid : null;
  for (const b of (data.buildings || [])) {
    let p = b.p;
    if (!p || p.length < 3) continue;
    // A FOOTPRINT IS NOT ALWAYS A WALL, and the first cut drew bands across
    // open plaza inside Universal where nothing stands at all (photographed at
    // The Lost World, -1075,12520: two dark ribbons crossing bare paving).
    // Three kinds of footprint have no wall meeting the floor along their
    // outline, and they are the same three city.js already pages out when it
    // decides that covered ground is paved rather than mown:
    //   b.og            an open ground storey — columns, not walls
    //   b.roof / bt     a canopy, which is a roof on posts
    //   b.mh > 1        a LIFTED mass; the ground under it is open
    if (b.og || b.roof || b.bt === 'roof' || (b.mh && b.mh > 1)) continue;
    // rings arrive both closed and open; a repeated last point makes a
    // zero-length edge whose normal is NaN, and one NaN vertex takes the
    // whole merged tile out of the frustum test
    if (p.length > 3 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) {
      p = p.slice(0, -1);
    }
    const n = p.length;
    if (n < 3) continue;
    // WHICH WAY IS OUT. Taken from the ring's own signed area rather than
    // assumed: OSM ways are not consistently wound, and a band pushed the
    // wrong way lies UNDER the building where nobody can see it — a silent
    // half-failure, which is the kind this project keeps paying for.
    let area2 = 0;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      area2 += p[j][0] * p[i][1] - p[i][0] * p[j][1];
    }
    const sgn = area2 > 0 ? 1 : -1;
    const nx = new Float64Array(n), nz = new Float64Array(n);   // outward normal of edge i -> i+1
    let ok = true;
    for (let i = 0; i < n; i++) {
      const a = p[i], c = p[(i + 1) % n];
      const dx = c[0] - a[0], dz = c[1] - a[1];
      const L = Math.hypot(dx, dz);
      if (!(L > 1e-6)) { ok = false; break; }
      nx[i] = sgn * dz / L; nz[i] = -sgn * dx / L;
    }
    if (!ok) continue;
    const ox = new Float64Array(n), oz = new Float64Array(n);   // mitred offset at vertex i
    for (let i = 0; i < n; i++) {
      const k = (i + n - 1) % n;
      let mx = nx[k] + nx[i], mz = nz[k] + nz[i];
      const d = 1 + (nx[k] * nx[i] + nz[k] * nz[i]);
      // a spike thinner than ~25 degrees would throw its mitre metres out;
      // those corners get the bevel a plain average gives instead
      if (d > 0.1) { mx /= d; mz /= d; } else {
        const L2 = Math.hypot(mx, mz) || 1; mx /= L2; mz /= L2;
      }
      ox[i] = mx; oz[i] = mz;          // unit mitre; each lip scales it
    }
    rings++;
    for (let i = 0; i < n; i++) {
      const a = p[i], c = p[(i + 1) % n];
      const ay = drawnGroundAt(a[0], a[1]), cy = drawnGroundAt(c[0], c[1]);
      // a wall standing in water gets no contact shade — there is no floor
      if (seaY != null && ay < seaY + 0.15 && cy < seaY + 0.15) continue;
      const j = (i + 1) % n;
      // IS THERE ACTUALLY A WALL ALONG THIS EDGE? The footprint is what the
      // map says; what the eye sees is what the recipes DREW, and on the USS
      // show buildings those are not the same outline. Photographed at The
      // Lost World: two dark ribbons running across bare plaza, each of them a
      // real edge of a real 1,695 m2 footprint whose drawn shed sits inside it.
      //
      // Asked of the collision grid rather than of the data, because the
      // collision grid is rasterised FROM THE DRAWN MESHES — it is the one
      // record of where fabric ended up rather than where it was specified.
      // (This is why the whole pass runs after the solid grid, and it is the
      // second reason after the material one.) Sampled a little inside the
      // line, since the grid is 0.75m cells and the wall straddles the edge.
      if (SOLIDQ) {
        const mx2 = (a[0] + c[0]) / 2, mz2 = (a[1] + c[1]) / 2;
        const inx = -(nx[i]), inz = -(nz[i]);
        let hit = false;
        for (const s2 of [0.35, 0.9]) {
          if (SOLIDQ(mx2 + inx * s2, mz2 + inz * s2)
            || SOLIDQ(a[0] + inx * s2, a[1] + inz * s2)
            || SOLIDQ(c[0] + inx * s2, c[1] + inz * s2)) { hit = true; break; }
        }
        if (!hit) { orphan++; continue; }
      }
      const key = Math.floor(a[0] / TILE) + ',' + Math.floor(a[1] / TILE);
      let t = tiles.get(key);
      if (!t) tiles.set(key, t = { pos: [], col: [], idx: [] });
      const v0 = t.pos.length / 3;
      // 0.075 clears the carriageway (terrain + 0.061) and the footway
      // (+0.024), so the shade lands on the pavement beside a building and not
      // under it. Every lip takes its own ground height, so the band follows a
      // slope instead of cutting into it.
      for (let L = 0; L < LIPS.length; L++) {
        const [d, v] = LIPS[L];
        const px1 = a[0] + ox[i] * d, pz1 = a[1] + oz[i] * d;
        const px2 = c[0] + ox[j] * d, pz2 = c[1] + oz[j] * d;
        t.pos.push(px1, (L === 0 ? ay : drawnGroundAt(px1, pz1)) + 0.075, pz1,
                   px2, (L === 0 ? cy : drawnGroundAt(px2, pz2)) + 0.075, pz2);
        t.col.push(v, v, v, v, v, v);
      }
      for (let L = 0; L < LIPS.length - 1; L++) {
        const r = v0 + L * 2;
        t.idx.push(r, r + 2, r + 1, r + 1, r + 2, r + 3);
        quads++;
      }
    }
  }
  if (!tiles.size) return { contactTiles: 0, contactRings: 0, contactQuads: 0, contactOrphanEdges: orphan };
  // ONE material for the whole island: MULTIPLY, so the outer lip at pure
  // white is arithmetically no change and the band needs no alpha and no
  // sorting against itself. depthWrite off because it is a decal lying on a
  // surface that is already in the depth buffer.
  //
  // premultipliedAlpha IS NOT OPTIONAL HERE, and leaving it off does not
  // throw — three.js writes "MultiplyBlending requires
  // material.premultipliedAlpha = true" to the console and then LEAVES
  // WHATEVER BLEND FUNC WAS ALREADY BOUND. The band drew as flat 214-grey
  // paint over the ground: not a shade, not transparent, just opaque strips
  // beside every building, and nothing errored. (Measured: the ground pixel
  // read (135,143,110) with the band off and (214,214,214) with it on —
  // exactly sRGB of the 0.66 vertex colour, which is what "no blending at
  // all" looks like.) Alpha is 1 everywhere, so premultiplied costs nothing
  // and the blend is exactly src * dst.
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff, vertexColors: true, transparent: true,
    blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  mat.name = 'contactShade';
  for (const [, t] of tiles) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(t.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(t.col, 3));
    g.setIndex(t.idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat);
    m.name = 'contactShade';
    m.renderOrder = -1;             // after the opaque ground, before the props
    m.matrixAutoUpdate = false;
    // flat and under 4m, so registerLod() takes it; 170m rather than the
    // shared 500m because this is a 2.4m band of grey on the floor and it has
    // nothing left to say at a distance. Measured on the hot views: at 500m it
    // cost 29 draws of 690, at 170m it costs a handful.
    m.userData.tileBatch = true;
    m.userData.lodFar = 170;
    world.add(m);
  }
  return { contactTiles: tiles.size, contactRings: rings, contactQuads: quads,
    contactOrphanEdges: orphan };
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
// ?flatsea puts the sea back on one flat normal, so the swell can be A/B'd for
// fill-rate on the phone profile without editing the file. Same standing as
// ?noshade and ?rich.
const SEA_FLAT = typeof location !== 'undefined' && /[?&]flatsea/.test(location.search);
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
        // THE SEA IS TWO TRIANGLES AND ONE FLAT NORMAL, WHICH IS WHY IT READS
        // AS LINO (2026-08-28).
        //
        // Ranked by flat-cell fraction over the 46 golden frames, the four
        // emptiest views on this island are all sea: siloso-lagoon 89.8%,
        // headland-sea 89.3%, groyne-islet 85.7%, waterline 80.8%. The colour
        // is right and the swell texture is right — what is missing is that
        // every pixel of a kilometre of water shares ONE normal, so the
        // material's specular term is one hotspot in one place and the rest is
        // a matte plane. Water is legible almost entirely by its highlights.
        //
        // So the normal is perturbed from WORLD POSITION: two crossed
        // wavelengths, no time uniform, no vertex count, no map. Position-keyed
        // keeps the golden gate deterministic and costs no memory. It is a
        // fragment-only change to a mesh with six vertices.
        //
        // FADED OUT WITH DISTANCE, and that is not an optimisation. A slope
        // pattern finer than a pixel does not average to calm water, it
        // sparkles at whatever the rasteriser happens to hit — the same
        // crawling the slab joints were given fwidth() to avoid. Past ~700m
        // the sea goes back to its flat normal, which at that range is what
        // haze and the horizon want anyway.
        .replace(SEA_FLAT ? '\u0000never' : '#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        {
          vec3 swv = vSeaW - cameraPosition;
          float swd = length(swv);
          float swamp = 1.0 - smoothstep(180.0, 700.0, swd);
          // ...AND IT FADES WHEN YOU LOOK DOWN ON IT, WHICH IS NOT A HACK.
          //
          // Wave slope is what makes water read AT A GRAZING ANGLE: from the
          // board you see the sides of the swell and the sky sliding along
          // them. Looking straight down you are inside the sun's mirror patch,
          // where every slope in the field maps onto the same bright reflection
          // and the specular saturates — the sea came back as a criss-cross of
          // hard white blobs from 90m over Siloso, and no amount of breaking
          // the frequencies or widening the lobe fixed it, because the pattern
          // was not the problem. The angle was. Real glitter at that angle is
          // sub-pixel anyway.
          //
          // Driven off the view vector, so it is continuous: horizontal view
          // full strength, 45 degrees down mostly gone, straight down nothing.
          // The cable car and the Skypark are the views this exists for.
          swamp *= smoothstep(0.22, 0.62, 1.0 - abs(normalize(swv).y));
          if (swamp > 0.02) {
            vec2 sw = vSeaW.xz;
            // FOUR WAVES, NOT TWO, AND THE FOURTH IS THE WHOLE POINT.
            //
            // The first cut used one 11m swell and one 3.7m chop, each as a
            // sin/cos PAIR sharing the same two frequencies. Two pairs of
            // commensurate waves do not make a sea, they make a LATTICE: seen
            // from above — the cable car, the Skypark, any aerial — the
            // specular broke into a regular grid of white crosses marching
            // across the whole strait. Photographed at 90m over Siloso. At eye
            // level it looked fine, which is why it shipped: every frame
            // checked was taken from the board.
            //
            // The fix is incommensurate frequencies at angles that do not
            // share a common period, and one long slow wave that skews the
            // other three so no cell repeats within sight.
            float sk = sin(sw.x * 0.037 - sw.y * 0.029) * 2.4;
            vec2 swk = sw + vec2(sk, sk * 0.6);
            float a1 = sin(swk.x * 0.53 + swk.y * 0.29);
            float b1 = cos(swk.x * 0.31 - swk.y * 0.47);
            float a2 = sin(swk.x * 1.13 - swk.y * 1.61);
            float b2 = cos(swk.x * 1.79 + swk.y * 0.97);
            float a3 = sin(swk.x * 0.19 + swk.y * 0.23);
            float b3 = cos(swk.x * 0.23 - swk.y * 0.17);
            // ...AND HALF THE AMPLITUDE THE FIRST CUT USED. Breaking the
            // frequencies stopped it being a LATTICE and left it a field of
            // blown-out white blobs, because at roughness 0.30 a big swing in
            // the normal drives the specular straight to saturation over a
            // wide band of angles. The slope is what makes water read; the
            // saturation is what makes it read as spots.
            vec3 swn = normalize(vec3((a1 * 0.062 + a2 * 0.024 + a3 * 0.042) * swamp, 1.0,
                                      (b1 * 0.062 + b2 * 0.024 + b3 * 0.042) * swamp));
            // world -> view: the sheet is axis-aligned and unrotated, so the
            // view matrix alone is the whole transform
            normal = normalize((viewMatrix * vec4(swn, 0.0)).xyz);
          }
        }`)
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
  // ONE NAME FOR "THE WATER AS DRAWN", for the same reason 13b gave city.js
  // `drawnGroundAt` beside `groundAt`: anything that has to sit a fixed height
  // above the sea needs the number the SHEET was drawn at, not a datum it
  // reconstructs from `g.sea` and `base`. Reconstructing it is how 14f spent
  // two hours proving an islet was underwater when it was 1.2 m above.
  window.__seaY = SEA_Y;
  // the DRAWN ground, for probes and gates: the difference between this and
  // __terrainAt is the entire waterline, and a check that asks the wrong one
  // measures a shore that is not there (terrain.js: "one authority, three
  // readers"). data/treecheck.mjs needed a fourth.
  window.__drawnGroundAt = drawnGroundAt;
  return 1;
}

// THE SOUTHERN ANCHORAGE — the thing you actually see from Sentosa's coast.
//
// Every sea frame in this world is empty water to a bare horizon, and that is
// the one view of Singapore nobody would recognise. The Strait south of the
// island is the busiest anchorage on earth: the MPA's own figure is about
// **1,000 vessels in the port at any one time**, and the southern anchorages
// lie along the Singapore Strait, off Sentosa. Standing on Tanjong or Palawan
// the horizon is a row of bulk carriers and tankers sitting at anchor. It is
// as characteristic of the place as the beach itself.
//   mpa.gov.sg/port-marine-ops/operations/port-infrastructure/anchorages
//
// WHAT IS SOURCED AND WHAT IS AUTHORED, stated because this file's rule is
// that the difference has to be. Sourced: that they are there, in numbers, in
// the strait to the south, at anchor. Authored: how many are in view (no
// figure exists for one vantage), which vessels, and every dimension — though
// the hull is drawn at Panamax proportions (a ~200m hull at a 1:7 beam ratio),
// which is the ordinary bulk carrier of this anchorage rather than a shape
// chosen by eye. No name, no funnel mark, no flag: nothing here claims to be
// a particular ship or a particular line.
//
// PLACED FROM THE HEIGHTFIELD, NOT FROM COORDINATES. Every candidate has to
// stand in water at least 3m below sea level and 950m clear of the island
// centre, so a ship can never end up on a reef, in a lagoon or on the beach —
// the same discipline the piers and groynes are placed with.
function buildAnchorage(world, seaY) {
  const g = TERRAIN.grid && TERRAIN.grid();
  if (g == null || seaY == null) return 0;
  const cx = g.x0 + g.cell * g.nx * 0.5, cz = g.z0 + g.cell * g.nz * 0.5;
  const R = rng(0x73686970);                       // "ship"
  const rnd = (a, b) => a + R() * (b - a);
  const merger = new Merger();
  const M = {
    hullA: new THREE.MeshLambertMaterial({ color: 0x2b3035 }),   // black hull
    hullB: new THREE.MeshLambertMaterial({ color: 0x6f3229 }),   // oxide red
    boot: new THREE.MeshLambertMaterial({ color: 0x8d3b2f }),
    house: new THREE.MeshLambertMaterial({ color: 0xe4e1d8 }),
    funnel: new THREE.MeshLambertMaterial({ color: 0x33373b }),
    deck: new THREE.MeshLambertMaterial({ color: 0x585c55 }),
  };
  const BOX = [0xb4443a, 0x2f6ea8, 0x3f7d55, 0xc09338, 0x8d8f93];
  const CONT = BOX.map((c) => new THREE.MeshLambertMaterial({ color: c }));
  // A SHIP IN WATER IS A SHIP. W2 counts anything standing in open water as a
  // defect and exempts the groynes by a flag on the material for exactly this
  // reason; this is the second such case and it is declared the same way.
  //
  // ...AND THE FLAG HAS TO SURVIVE dedupeMaterials, WHICH IT DID NOT. Its
  // signature is 25 render fields and does NOT include userData or name, so a
  // hull material that happens to match a city grey is collapsed into it — and
  // then the flag is either lost or, worse, handed to every wall sharing that
  // grey. Probed: 158 meshes came back carrying `vesselInWater`, one of them a
  // 1,567m-wide batch on the island. Each material is given a unique
  // emissiveIntensity against a BLACK emissive: it is in the signature, so
  // nothing can merge with it, and with emissive black it cannot change a
  // pixel. The alternative — exempting by proximity to the anchorage list —
  // fails for the same reason in reverse, because a merged batch's bbox centre
  // is not where its parts are.
  let _u = 0;
  for (const m of [...Object.values(M), ...CONT]) {
    m.userData.vesselInWater = true;
    m.emissive = new THREE.Color(0x000000);
    m.emissiveIntensity = 0.001 + (_u++) * 0.0001;
  }

  const kept = [];
  const TRIES = 1400, WANT = 22;
  for (let i = 0; i < TRIES && kept.length < WANT; i++) {
    const a = R() * Math.PI * 2, d = 900 + R() * 2200;
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    // OPEN WATER, ASKED PROPERLY. The first cut wanted the bed 3m below sea
    // level and placed NOTHING: probed on this island the drawn seabed off
    // Siloso reads -0.79 against a sea at 0.18, so "3m deep" excludes the
    // whole strait. The honest test is not depth, it is EXTENT — a ship needs
    // water around it, not under it — so the point and four others 180m out
    // must all be wet.
    // ...AND OUTSIDE THE HEIGHTFIELD IS SEA BY CONSTRUCTION, which is the
    // second thing that placed nothing. The sea sheet reaches 2,200m past the
    // grid on every side; `drawnGroundAt` past the grid edge returns 0, and 0
    // is ABOVE sea level, so every candidate in exactly the open water this
    // is for was scored as land. Most of the anchorage is out there.
    const wetAt = (px, pz) => (px < g.x0 || pz < g.z0
      || px > g.x0 + g.cell * g.nx || pz > g.z0 + g.cell * g.nz)
      || drawnGroundAt(px, pz) < seaY - 0.5;
    if (!wetAt(x, z)) continue;
    let wet = true;
    for (const [ox, oz] of [[180, 0], [-180, 0], [0, 180], [0, -180]]) {
      if (!wetAt(x + ox, z + oz)) { wet = false; break; }
    }
    if (!wet) continue;
    // HOW FAR OFF THE SHORE, MEASURED, NOT ASSUMED. Distance from the island
    // CENTRE is not distance from the beach — Sentosa is 5km by 3km and a
    // fixed radius puts a ship aground at one end and over the horizon at the
    // other. The first cut did that and the ships were real, placed, and
    // INVISIBLE: the seaside far plane is 1600m and the fog is tuned to it, so
    // anything much past a kilometre is gone. Marched to the shore instead.
    let shore = 0;
    for (let m = 50; m <= 1500; m += 50) {
      const t2 = m / d;
      if (!wetAt(x + (cx - x) * t2, z + (cz - z) * t2)) { shore = m; break; }
    }
    // 380-820m, AND THE UPPER BOUND IS THE FOG, not the anchorage. The real
    // southern anchorages stand kilometres out; at this world's seaside far
    // plane (1600m) with the fog tuned to it, a ship at 1,300m is gone and a
    // ship at 1,800m is clipped. The first placement respected the geography
    // and put 22 correctly-built vessels where nothing can ever see them.
    // Inside 820m they read as the pale grey silhouettes they are from the
    // beach in life, which is the honest compromise: the right picture at the
    // wrong range rather than the right range and an empty sea.
    if (shore < 380 || shore > 820) continue;
    let clear = true;
    for (const k of kept) if (Math.hypot(k[0] - x, k[1] - z) < 300) { clear = false; break; }
    if (!clear) continue;
    kept.push([x, z]);
  }
  if (!kept.length) return 0;

  for (const [x, z] of kept) {
    // anchored ships lie roughly with the stream, so they share a heading with
    // only a little spread — a scatter of random headings reads as a car park
    const yaw = 0.55 + rnd(-0.42, 0.42);
    const L = rnd(120, 235), B = L * rnd(0.13, 0.16), FB = rnd(6.5, 10.5);
    const kind = R();                                      // bulker / boxship
    const put = (geo, mat, u, y, v) => {                   // u across, v along
      geo.rotateY(yaw);
      geo.translate(x + Math.cos(yaw) * u + Math.sin(yaw) * v,
        seaY + y, z - Math.sin(yaw) * u + Math.cos(yaw) * v);
      merger.add(geo, mat, x, z);
    };
    const hull = kind < 0.5 ? M.hullA : M.hullB;
    put(new THREE.BoxGeometry(B, FB, L * 0.88), hull, 0, FB * 0.5, -L * 0.03);
    // the bow: a box turned 45 degrees in plan reads as a stem from any
    // distance this is ever seen at, and this is only ever seen at distance
    const bow = new THREE.BoxGeometry(B * 0.72, FB, B * 0.72);
    bow.rotateY(Math.PI / 4);
    put(bow, hull, 0, FB * 0.5, L * 0.44);
    put(new THREE.BoxGeometry(B * 1.03, FB * 0.16, L * 0.88), M.boot, 0, FB * 0.09, -L * 0.03);
    // the accommodation block and the funnel, both aft
    put(new THREE.BoxGeometry(B * 0.74, 13, L * 0.09), M.house, 0, FB + 6.5, -L * 0.36);
    put(new THREE.BoxGeometry(B * 1.06, 1.6, 3.2), M.house, 0, FB + 12, -L * 0.36);
    put(new THREE.BoxGeometry(B * 0.2, 8.5, B * 0.26), M.funnel, 0, FB + 17, -L * 0.42);
    if (kind < 0.5) {
      // a bulk carrier: hatch covers down the working deck
      for (let h = 0; h < 5; h++) {
        put(new THREE.BoxGeometry(B * 0.62, 1.7, L * 0.09), M.deck,
          0, FB + 0.85, L * (0.30 - h * 0.135));
      }
    } else {
      // a container ship: three tiers of boxes, and the colour variety IS the
      // read at this range
      for (let h = 0; h < 4; h++) {
        for (let t = 0; t < 3; t++) {
          const m = CONT[((h * 3 + t) * 7 + ((x | 0) + (z | 0))) % CONT.length];
          put(new THREE.BoxGeometry(B * (0.86 - t * 0.10), 5.4, L * 0.15),
            m, 0, FB + 2.7 + t * 5.5, L * (0.28 - h * 0.155));
        }
      }
    }
    // a mast forward, which is the last thing that leaves the eye
    put(new THREE.BoxGeometry(1.2, 16, 1.2), M.deck, 0, FB + 8, L * 0.36);
  }
  merger.flush(world);
  window.__anchorageAt = kept.map(([x, z]) => [Math.round(x), Math.round(z)]);
  return kept.length;
}

// THE SURF LINE — the EIGHTH attempt, and the first that traces the beach the
// player is actually standing on. (2026-08-30)
//
// Seven attempts were reverted. All seven argued about the CURVE, and the curve
// was never the fault; two separate discoveries closed it, both recorded in the
// handover on 2026-08-29 and both used here:
//
//   1. THE DRAWN BEACH IS NOT A POLYGON. terrain.js paints sand in the else
//      branch of the vertex tint: ground within 80m of open sea whose drawn
//      height is between 0.06 and 2.4m. There is no `data.green` k='sand' in
//      it anywhere, which is why every attempt that gated on the mapped sand
//      rings drew on a different shore from the one the eye sees — the rings
//      sit 10-30m seaward of the painted beach.
//
//   2. buildSurf USED TO RUN BEFORE THE ISLAND MASK EXISTED. It was called
//      from buildWater; `terrain.setIsland` ran 480 lines later, and
//      `Terrain.islandW` opens `if (!this.isle) return 0`, so the shore shelf
//      never applied and `drawnGroundAt` answered a DIFFERENT QUESTION during
//      the build than it does once the world is up. On the cell holding the
//      Siloso crossing: [0.788, 1.089, 0.504, 0.793] at build time (no sign
//      change anywhere) against [0.090, 1.089, -1.515, 0.793] once booted.
//      No curve could have survived that. **This is now called from main.js,
//      AFTER terrain.build**, which is the cheap half of that fix: moving
//      setIsland itself early also moves four other consumers off the surface
//      their constants were tuned against, and that is a separate, measured,
//      deliberately-deferred piece of work (see the handover).
//
// SO THE CURVE IS THE CONTOUR OF THE DRAWN SKIN AT SEA LEVEL, by marching
// squares over `drawnGroundAt - seaY` — the same function, and the same
// definition, that the paint uses. No `data.coast`, no `data.water`, no sand
// rings.
//
//   * SEEDED ON `seaDistAt < 80`, which is the sand paint's own gate, so the
//     band searched is exactly the band that can be beach.
//   * COARSE TO FINE. Only ~2% of cells in that band hold a crossing, so
//     locate at 12m and subdivide only those to 6m. Every sample is cached by
//     quantised coordinate, because neighbouring cells share corners.
//   * BEACH OR WALL IN TWO SAMPLES, and this is the discriminator six attempts
//     were missing. It is not a tag and not a polygon, it is the WIDTH of the
//     band: at Siloso the ground climbs through 0 to 2.4m over about twelve
//     metres, so foam has somewhere to sit; at a Cove quay the drawn skin goes
//     -1.75 to 9 in ONE mesh interval and the same contour exists with no beach
//     behind it. Walk inland along the gradient and ask the height at 4m. The
//     island's water edges are mostly the second kind — 313 crossings sampled,
//     two thirds step over 1.5m — so this rejects most of what it finds, which
//     is correct.
//
// AND THEN IT IS CHAINED, WHICH IS WHAT THE SEVENTH GOT WRONG. Marching
// squares emits UNORDERED chords; extruding a quad per chord splays consecutive
// quads wherever the contour turns, and photographed from the sand that reads
// as "angular pale slabs sitting on the water" — close to the milky shelf the
// shader attempt was rejected for. So the chords are welded into ordered
// polylines, resampled at an even 3m, smoothed, and each chain is extruded as
// ONE continuous ribbon.
//
// The band follows the surface — `max(drawnGroundAt, seaY) + lift` — because
// the contour lies at sea level and half of a flat band at sea level is buried
// under the sand, by an amount that depends on the local slope.
//
// `window.__surfWhy` reports the live numbers. `?surfdbg` draws it flat red,
// which is the only way this project has ever reliably answered "is it there".
function buildSurf(world, data, seaY) {
  const grid = TERRAIN.grid ? TERRAIN.grid() : null;
  const seaDistAt = TERRAIN.seaDistAt;
  const why = { band: 0, coarse: 0, fine: 0, chord: 0, wall: 0, beach: 0,
                chains: 0, dropped: 0, pts: 0, samples: 0, ms: 0 };
  window.__surfWhy = why;
  if (!grid || !seaDistAt) return 0;
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // one cache for both passes: the coarse grid's corners ARE fine corners, and
  // every fine cell shares two corners with its neighbour
  const cache = new Map();
  const F = (x, z) => {
    const k = Math.round(x * 4) * 65536 + Math.round(z * 4);
    let v = cache.get(k);
    if (v === undefined) { v = drawnGroundAt(x, z) - seaY; cache.set(k, v); why.samples++; }
    return v;
  };

  const COARSE = 12, FINE = 6;
  const X0 = grid.x0, Z0 = grid.z0;
  const SPAN_X = grid.cell * (grid.nx - 1), SPAN_Z = grid.cell * (grid.nz - 1);
  const NX = Math.ceil(SPAN_X / COARSE), NZ = Math.ceil(SPAN_Z / COARSE);

  // marching squares on one cell, emitting chords into `out`
  const chords = [];
  const cell = (x, z, s) => {
    const f00 = F(x, z), f10 = F(x + s, z), f01 = F(x, z + s), f11 = F(x + s, z + s);
    let m = 0;
    if (f00 > 0) m |= 1;
    if (f10 > 0) m |= 2;
    if (f11 > 0) m |= 4;
    if (f01 > 0) m |= 8;
    if (m === 0 || m === 15) return false;
    // edge crossings, linearly interpolated
    const ip = (a, b) => a / (a - b);
    const eB = [x + s * ip(f00, f10), z];                    // bottom  00-10
    const eR = [x + s, z + s * ip(f10, f11)];                // right   10-11
    const eT = [x + s * ip(f01, f11), z + s];                // top     01-11
    const eL = [x, z + s * ip(f00, f01)];                    // left    00-01
    // the gradient of the field over this cell, which is the INLAND direction
    const gx = ((f10 + f11) - (f00 + f01)) / (2 * s);
    const gz = ((f01 + f11) - (f00 + f10)) / (2 * s);
    const gl = Math.hypot(gx, gz) || 1;
    const nx = gx / gl, nz = gz / gl;
    const add = (a, b) => { chords.push([a[0], a[1], b[0], b[1], nx, nz]); why.chord++; };
    switch (m) {
      case 1: case 14: add(eL, eB); break;
      case 2: case 13: add(eB, eR); break;
      case 3: case 12: add(eL, eR); break;
      case 4: case 11: add(eR, eT); break;
      case 6: case 9:  add(eB, eT); break;
      case 7: case 8:  add(eL, eT); break;
      // the two saddles: both diagonals, which is the ambiguous case and rare
      case 5:  add(eL, eB); add(eR, eT); break;
      case 10: add(eB, eR); add(eL, eT); break;
    }
    return true;
  };

  for (let j = 0; j < NZ; j++) {
    for (let i = 0; i < NX; i++) {
      const x = X0 + i * COARSE, z = Z0 + j * COARSE;
      // THE BAND, and it is the sand paint's own gate. seaDistAt is a grid
      // lookup over a cached BFS, so this is far cheaper than four vertexY
      // calls and it removes ~95% of the island before any of them happen.
      if (seaDistAt(x + COARSE / 2, z + COARSE / 2) > 80) continue;
      why.band++;
      const f00 = F(x, z), f10 = F(x + COARSE, z);
      const f01 = F(x, z + COARSE), f11 = F(x + COARSE, z + COARSE);
      const lo = Math.min(f00, f10, f01, f11), hi = Math.max(f00, f10, f01, f11);
      if (lo > 0 || hi <= 0) continue;      // no crossing anywhere in this cell
      why.coarse++;
      for (let b = 0; b < 2; b++) {
        for (let a = 0; a < 2; a++) {
          if (cell(x + a * FINE, z + b * FINE, FINE)) why.fine++;
        }
      }
    }
  }
  if (!chords.length) return 0;

  // BEACH OR WALL — AND THE PAINT ANSWERS IT ITSELF. The first cut of this
  // restated the rule ("has the ground reached 2.4m by 4m inland") and got the
  // same class of answer for the wrong reason: measured over the built ribbon,
  // 94% of the island's water edge never reaches 2.4m within TWENTY metres, so
  // a height test alone rejects almost nothing and is not the discriminator it
  // reads as. The real question is not how steep the land is, it is whether the
  // terrain PAINTS THIS GROUND AS BEACH — and that is a rule terrain.js owns,
  // now published as `paintsSandAt` so the two can never drift.
  //
  // Two samples inland along the cell gradient: 1.2m catches a hair-wide
  // ledge, 4m is the width a foam band needs to sit on. Both must be beach.
  const P = TERRAIN.paintsSandAt;
  const kept = [];
  for (const c of chords) {
    const mx = (c[0] + c[2]) / 2, mz = (c[1] + c[3]) / 2;
    if (P && !(P(mx + c[4] * 1.2, mz + c[5] * 1.2) && P(mx + c[4] * 4.0, mz + c[5] * 4.0))) {
      why.wall++; continue;
    }
    why.beach++;
    kept.push(c);
  }
  if (!kept.length) return 0;

  // WELD THE CHORDS INTO ORDERED POLYLINES. Marching squares emits every chord
  // with its endpoints ON cell edges, so two chords that meet do so at exactly
  // the same coordinate — quantising to 5cm is a weld, not a search.
  const key = (x, z) => Math.round(x * 20) + ',' + Math.round(z * 20);
  const ends = new Map();
  for (let i = 0; i < kept.length; i++) {
    for (const [x, z] of [[kept[i][0], kept[i][1]], [kept[i][2], kept[i][3]]]) {
      const k = key(x, z);
      let a = ends.get(k);
      if (!a) ends.set(k, a = []);
      a.push(i);
    }
  }
  const used = new Uint8Array(kept.length);
  const chains = [];
  const walk = (start, fromEnd) => {
    // fromEnd 0 walks a->b, 1 walks b->a
    const pts = [];
    let idx = start, dir = fromEnd;
    for (;;) {
      used[idx] = 1;
      const c = kept[idx];
      const ax = dir ? c[2] : c[0], az = dir ? c[3] : c[1];
      const bx = dir ? c[0] : c[2], bz = dir ? c[1] : c[3];
      if (!pts.length) pts.push([ax, az, c[4], c[5]]);
      pts.push([bx, bz, c[4], c[5]]);
      const nbrs = ends.get(key(bx, bz)) || [];
      let next = -1;
      for (const n of nbrs) if (!used[n]) { next = n; break; }
      if (next < 0) return pts;
      const c2 = kept[next];
      dir = (key(c2[0], c2[1]) === key(bx, bz)) ? 0 : 1;
      idx = next;
    }
  };
  for (let i = 0; i < kept.length; i++) {
    if (used[i]) continue;
    // start from a chord with a free end where there is one, so an open chain
    // is walked from its tip and not from its middle
    const headFree = ((ends.get(key(kept[i][0], kept[i][1])) || []).filter((n) => !used[n]).length <= 1);
    const pts = walk(i, headFree ? 0 : 1);
    if (pts.length >= 2) chains.push(pts);
  }

  // RESAMPLE AND SMOOTH. Even 3m spacing, then a 3-tap on the positions only —
  // the whole point of chaining is that consecutive quads share an edge, and
  // they only look like one ribbon if the spacing is even and the turns round.
  const STEP = 3.0, MINLEN = 18;
  const pos = [], col = [];
  const W = 4.6, LIFT = 0.05, A = 0.85;
  let ribbons = 0;
  for (const ch of chains) {
    let L = 0;
    for (let i = 1; i < ch.length; i++) L += Math.hypot(ch[i][0] - ch[i - 1][0], ch[i][1] - ch[i - 1][1]);
    if (L < MINLEN) { why.dropped++; continue; }
    const n = Math.max(2, Math.round(L / STEP));
    const rs = [];
    let seg = 0, acc = 0;
    for (let k = 0; k <= n; k++) {
      const target = (L * k) / n;
      while (seg < ch.length - 2) {
        const d = Math.hypot(ch[seg + 1][0] - ch[seg][0], ch[seg + 1][1] - ch[seg][1]);
        // a zero-length step must be STEPPED OVER, not broken on: breaking
        // leaves seg parked on it for every remaining sample and the whole
        // tail of the chain collapses onto one point.
        if (d === 0) { seg++; continue; }
        if (acc + d >= target) break;
        acc += d; seg++;
      }
      const d = Math.hypot(ch[seg + 1][0] - ch[seg][0], ch[seg + 1][1] - ch[seg][1]) || 1;
      const t = Math.max(0, Math.min(1, (target - acc) / d));
      rs.push([ch[seg][0] + (ch[seg + 1][0] - ch[seg][0]) * t,
               ch[seg][1] + (ch[seg + 1][1] - ch[seg][1]) * t,
               ch[seg][2], ch[seg][3]]);
    }
    const sm = rs.map((p, i) => {
      if (i === 0 || i === rs.length - 1) return p;
      return [(rs[i - 1][0] + p[0] * 2 + rs[i + 1][0]) / 4,
              (rs[i - 1][1] + p[1] * 2 + rs[i + 1][1]) / 4, p[2], p[3]];
    });
    // one ribbon, two rails
    const land = [], sea = [];
    for (let i = 0; i < sm.length; i++) {
      const p = sm[i];
      const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
      let tx = b[0] - a[0], tz = b[1] - a[1];
      const tl = Math.hypot(tx, tz) || 1;
      tx /= tl; tz /= tl;
      // the rail normal, flipped to agree with the cell gradient so LAND is
      // land the whole way along a chain that doubles back
      let rx = -tz, rz = tx;
      if (rx * p[2] + rz * p[3] < 0) { rx = -rx; rz = -rz; }
      // pushed 15% seaward of the crossing, as the surveyed version was
      const cx = p[0] - rx * W * 0.15, cz = p[1] - rz * W * 0.15;
      const lx = cx + rx * W * 0.5, lz = cz + rz * W * 0.5;
      const sx = cx - rx * W * 0.5, sz = cz - rz * W * 0.5;
      const gy = (q, r) => Math.max(drawnGroundAt(q, r), seaY) + LIFT;
      // FADE THE TIPS. A chain that stops does so because the discriminator
      // rejected the next chord — a beach turning into a seawall — and a hard
      // square end there reads as a painted stripe that someone cut off.
      const fade = Math.min(1, Math.min(i, sm.length - 1 - i) / 3);
      land.push([lx, gy(lx, lz), lz, A * fade]);
      sea.push([sx, gy(sx, sz), sz, 0]);
      why.pts++;
    }
    for (let i = 0; i < land.length - 1; i++) {
      const l0 = land[i], s0 = sea[i], l1 = land[i + 1], s1 = sea[i + 1];
      const push = (v) => { pos.push(v[0], v[1], v[2]); col.push(1, 1, 1, v[3]); };
      push(l0); push(s0); push(l1);
      push(l1); push(s0); push(s1);
    }
    ribbons++;
  }
  why.chains = ribbons;
  why.ms = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
  if (!pos.length) return 0;

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  const _SD = typeof location !== 'undefined' && /[?&]surfdbg/.test(location.search);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
    color: _SD ? 0xff0000 : 0xeef5f6, vertexColors: !_SD, transparent: !_SD,
    opacity: _SD ? 1 : 0.72, depthWrite: false,
  }));
  m.name = 'surfLine';
  m.renderOrder = 1;
  m.frustumCulled = false;
  world.add(m);
  return ribbons;
}

// CALLED FROM main.js, AFTER terrain.build — see the note above. It is exported
// for that reason alone; nothing else may call it.
export function buildSurfLine(world, data, seaY) {
  return buildSurf(world, data, seaY);
}

export function buildWater(world, data) {
  const polys = data.water || [];
  const sea = buildSea(world);
  // THE SURF LINE IS NOT BUILT HERE ANY MORE. It traces `drawnGroundAt`, and
  // at this point in the boot the island mask does not exist, so that function
  // answers a different question from the one the player sees. main.js calls
  // buildSurfLine after terrain.build. See the note on buildSurf.
  window.__anchorage = sea ? buildAnchorage(world, SEA_LEVEL[0]) : 0;
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
    // A DEM-WITNESSED TIDAL RING IS THE SEA REACHING INLAND (the Cove
    // moats): its surface sits AT sea level, not at a rim read off the
    // uncarved banks — Pearl's rim put its water 1.5m above the sea it
    // opens into. tidalRing never matches the strait's own mega-ring, so
    // every other body keeps today's level.
    const tidal = SEA_LEVEL[0] !== null && TERRAIN.tidalRing && TERRAIN.tidalRing(pts);
    // ...and a tidal ring is not merely AT sea level, it IS the sea — the
    // same water the sheet draws, reaching inland through a carved channel.
    // Drawing it again gave the Cove flat faceted teal 16cm under the
    // sheet, the exact two-colours-two-heights defect the `sea` skip above
    // exists for (vetted canal-pearl-air). The sheet covers the whole grid
    // plus margin, so the carved channel is already wet without this ring.
    if (sea && tidal) continue;
    const level = SEA_LEVEL[0] === null ? lo - 0.35
      : Math.max(lo - 0.35, SEA_LEVEL[0] + 0.02);
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
      const inAnyHole = (px, pz) => {
        for (const h of (w.hp || [])) {
          let c = false;
          for (let i2 = 0, j2 = h.length - 1; i2 < h.length; j2 = i2++) {
            const [xi, zi] = h[i2], [xj, zj] = h[j2];
            if ((zi > pz) !== (zj > pz) && px < (xj - xi) * (pz - zi) / (zj - zi) + xi) c = !c;
          }
          if (c) return true;
        }
        return false;
      };
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
          // ...AND NOT INSIDE ONE OF ITS HOLES. A multipolygon's inner ring is
          // an island; the cell test below only rejects it when its ground
          // happens to sit above the water level, which is not something an
          // island is obliged to do.
          if (inAnyHole(mx, mz)) continue;
          // THE DRY-LAND TEST IS THE OLD DEFENCE, AND A HOLED RING NO LONGER
          // NEEDS IT. It exists because a multipolygon that LOST ITS PARTS
          // fills solid and surfaces cyan on lawns; the fix was to keep only
          // cells whose ground lies below the water. A ring that carries its
          // inner rings has not lost anything — the holes ARE the parts — and
          // applying the height test to it as well rejects the whole body:
          // Sentosa Cove's waterway sits at 4.5 m in a 35 m heightfield that
          // has no canal cut into it, against its own level of 2.3 m, so every
          // channel cell reads as dry land and 92,363 m2 of marina drew as
          // nothing. The drawn ground there IS sunk (vertexY takes it to the
          // bed); only this test was still asking the unsunk grid.
          if (!(w.hp && w.hp.length) && TERRAIN.at(mx, mz) > level + 0.15) continue;
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
// THE CABLE'S HEIGHT PROFILE, IN ONE PLACE, BECAUSE TWO THINGS NOW NEED IT.
//
// sgdetail.js worked this out inline to draw the wire, and its own comment
// states the law it was obeying: "THE RIDE READS THE DRAWN WIRE, IT DOES NOT
// RE-DERIVE IT... the exact two-sources-of-one-fact trap that put the monorail
// at three different heights and the kerbs under a bridge deck."
//
// The planting pass below now needs the same profile, to know where the wire
// comes low enough for a tree to stand in it — and it runs at a different point
// in the build from sgdetail, so it cannot read `window.__cableways`. Copying
// the arithmetic across would be that trap, third time. So the arithmetic moves
// HERE, where `groundAt` already lives and where sgdetail already imports from,
// and both callers ask this one function. sgdetail keeps drawing exactly what
// it drew: same constants, same easing, same three smoothing passes.
//
// RIDE_H and STATION_H are unchanged and their reasoning stays in sgdetail at
// the point of use: 32m is a plausible gondola height, 9m a chairlift, and the
// 12m platform is authored because the published sources give the spans and
// call the stations only "rather compact".
export const CABLE_RIDE_H = { gondola: 32, cable_car: 32, chair_lift: 9 };
export const CABLE_STATION_H = 12;
export function cableProfiles(data) {
  const cw = data.cableway || {};
  const lines = cw.lines || [];
  const stationList = cw.stations || [];
  const nearStation = (x, z) => {
    let bd = 1e9;
    for (const st of stationList) {
      const d = Math.hypot(st.p[0] - x, st.p[1] - z);
      if (d < bd) bd = d;
    }
    return bd;
  };
  return lines.map((ln) => {
    const hs = ln.p.map(([x, z]) => {
      const g0 = groundAt(x, z);
      const d = nearStation(x, z);
      // inside 22m it IS the platform; out to 90m it eases back to line height,
      // which is roughly the run a real cable takes to climb away from a station
      if (d > 90) return g0 + (CABLE_RIDE_H[ln.k] || 20);
      const t = d <= 22 ? 0 : (d - 22) / 68;
      const ease = t * t * (3 - 2 * t);
      return g0 + CABLE_STATION_H + ((CABLE_RIDE_H[ln.k] || 20) - CABLE_STATION_H) * ease;
    });
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < hs.length - 1; i++) hs[i] = (hs[i - 1] + hs[i] + hs[i + 1]) / 3;
    }
    return hs;
  });
}

// A pier stands OVER water, so it takes its level from the water it sits in
// rather than from the terrain beneath — the terrain under a pier is the
// SEABED, and seating a deck on it would put the jetty at the bottom of the
// bay. Same two-datums trap as the bridge decks; the answer is the same, ask
// the right surface.
let PIER_TIDAL = 0;
// THE 123 SWIMMING POOLS NOTHING WAS DRAWING.
//
// `leisure=swimming_pool` is surveyed all over Sentosa Cove and the resorts and
// process.py has always carried it — as `green` kind `pool`, beside grass,
// scrub and wood. Nothing downstream reads that kind: the green passes filter
// for `wood` and `scrub`, the water pass reads `data.water`, and a pool falls
// between them. Measured 2026-08-24 by dropping a ray on all 123 pool
// centroids: 82 landed on bare `terrainSurface`, 40 under a building or deck,
// and exactly ONE on `waterSurface`. Every villa pool in the Cove was lawn.
//
// This is the same shape as `lamps: 0` and the roof cap: a complete, surveyed
// layer sitting in the scene file with no reader. Found by counting the data,
// not by looking at a picture.
//
// DRAWN, NOT SWIMMABLE, and that is deliberate. Routing them into `data.water`
// would have been one line in process.py and it would have made 123 private
// pools enterable, put them in the swim checks, and handed waterFloor a set of
// 105 m2 rings scattered through the Cove's gardens. A pool is scenery here:
// it is what you see from the cable car, the monorail, the hills and the
// third-person camera, and none of those get in.
//
// Three pieces, all flat colours so consolidate's flattenFlatColours folds
// them into the shared vertex-colour material — measured cost is in the
// handoff, and it is not draws.
export function buildPools(world, data) {
  const polys = (data.green || []).filter((g) => g.k === 'pool' && g.p && g.p.length > 3);
  if (!polys.length || new URLSearchParams(location.search).has('nopools')) return { pools: 0 };
  // Sentosa's pool water reads pale aqua over a light plaster tank, not the
  // strait's teal. The coping is the pale stone the Cove's decks already use.
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x5fc4c8 });
  const copingMat = new THREE.MeshLambertMaterial({ color: 0xd9d3c6 });
  const geos = [], copings = [];
  let built = 0, skipped = 0;
  for (const g of polys) {
    // A POOL IS FLAT. Its ring can cross two heightfield cells, so seat the
    // whole thing on the HIGHEST ground under it — a pool seated on the lowest
    // corner has its coping buried at the high end, which is the same defect
    // the building skirt exists for.
    let hi = -Infinity, lo = Infinity;
    for (const [x, z] of g.p) {
      const y = TERRAIN.at(x, z);
      if (y > hi) hi = y;
      if (y < lo) lo = y;
    }
    // ...but a "pool" whose ground falls three metres across it is not a pool
    // in our heightfield, it is a mapped ring on a slope, and decking it would
    // stand a turquoise shelf out of a hillside. Refuse rather than invent.
    if (hi - lo > 2.2) { skipped++; continue; }
    const c = centroid(g.p);
    // the tank lip sits a little proud of the ground so the coping reads as a
    // kerb rather than a painted line, and the water sits just under it
    copings.push(extrudeGeo(grow(g.p, 1.10), 0.18, hi - 0.04));
    geos.push(extrudeGeo(grow(g.p, 0.97), 0.12, hi + 0.02));
    built++;
  }
  if (!geos.length) return { pools: 0 };
  const wm = new THREE.Mesh(mergeGeos(geos), waterMat);
  const cm = new THREE.Mesh(mergeGeos(copings), copingMat);
  wm.name = 'poolWater'; cm.name = 'poolCoping';
  for (const m of [wm, cm]) { m.castShadow = false; m.receiveShadow = true; world.add(m); }
  window.__poolDbg = { mapped: polys.length, built, skippedSlope: skipped };
  return { pools: built };
}

export function buildPiers(world, data) {
  PIER_TIDAL = 0;
  const polys = data.piers || [];
  if (!polys.length) return { piers: 0 };
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xa89a86, roughness: 0.9 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6f6a62, roughness: 0.85 });
  // creosoted timber, the same family as the lagoon jetty's piles in sgdetail
  const pileMat = new THREE.MeshStandardMaterial({ color: 0x554c42, roughness: 0.95 });
  const geos = [], edges = [], piles = [];
  // A MOORING PILE BELONGS IN WATER, AND `piers` IS NOT ONLY BERTHS.
  //
  // Two wrong cuts before this one, both measured:
  //   * every pier under 120 m2 -> 517 piles spanning y 2.6 to 19.6. A pile
  //     nineteen metres up is on an inland boardwalk through the forest.
  //   * only piers inside a mapped `water` ring -> 96 piles, and it kept
  //     exactly the wrong ones (y 6.4-19.6, the inland ponds) while dropping
  //     every Cove berth. THE SEA IS NOT A WATER POLYGON — it is the
  //     seaSurface sheet — so the tidal berths are inside no mapped ring at
  //     all. Same two-datums trap this file keeps paying for.
  //
  // The Cove's channels are TIDAL (SESSION 20: a DEM-witnessed tidal ring is
  // the sea reaching inland, and its surface sits AT sea level), so a berth is
  // a deck whose water is sea level. That is the test.
  //
  // NOT `TERRAIN.tidalRing` either: it needs THREE wet cells INSIDE the ring
  // and the grid is 35m, so a 28 m2 berth can never contain three of anything
  // — it is built for water POLYGONS, and it silently refused every berth.
  // A berth asks the same DEM witness a different way: is the cell I stand in
  // one the DEM saw as wet? `grid()` is read-only by contract.
  const _g = TERRAIN.grid && TERRAIN.grid();
  let _wetSet = null;
  const wetCell = (pts) => {
    if (!_g || !_g.wet || !_g.wet.length) return false;
    if (!_wetSet) _wetSet = new Set(_g.wet);
    for (const [x, z] of pts) {
      const i = Math.round((x - _g.x0) / _g.cell), j = Math.round((z - _g.z0) / _g.cell);
      if (i < 0 || j < 0 || i >= _g.nx || j >= _g.nz) continue;
      if (_wetSet.has(j * _g.nx + i)) return true;
    }
    return false;
  };
  // hoisted out of the pier loop — see the note at its use site below
  const tidalRings = (data.water || [])
    .map((w) => w.p).filter((q) => q && q.length > 3)
    .filter((q) => TERRAIN.tidalRing && TERRAIN.tidalRing(q));
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
    // THIS FUNCTION'S OWN HEADER SAYS A PIER TAKES ITS LEVEL FROM THE WATER
    // IT SITS IN, AND THEN IT ASKED THE TERRAIN.
    //
    // Measured 2026-08-16 by raycasting five of the Cove's private berths:
    // pierEdge at y 19.94, 19.98, 16.03, 15.32 with `seaSurface` at 0.18
    // underneath. **THE COVE'S JETTIES WERE FLOATING FIFTEEN TO TWENTY METRES
    // IN THE AIR** — the dark beams over the palms in any waterfront frame.
    //
    // Why, and it is the same trap the bridge decks paid for: SESSION 20 made
    // the Cove moats tidal by sinking the DRAWN skin only and left `at()`
    // deliberately untouched, so TERRAIN.at() over a Cove channel still
    // returns the UNCARVED BANK. `lo + 1.15` therefore seats a berth on a bank
    // that is not drawn, 15-20m over the water that is.
    //
    // A ring the DEM witnesses as wet IS the sea reaching inland (the tidal
    // ring rule buildWater uses forty lines above), so its deck belongs at sea
    // level. Everything else — the inland ponds, the boardwalks on the hill —
    // keeps the rim rule, because for those the terrain IS the water's bed.
    // ...AND THE WET WITNESS ALONE ONLY CAUGHT 19 OF 113. The witness marks
    // whole 35m DEM cells, and a Cove channel is narrower than one, so most
    // berths sit on a cell the DEM never called wet. Ask the surface that is
    // actually DRAWN there as well — the same `drawnGroundAt` the note at
    // buildSea points at, and for the same reason: anything that has to sit a
    // fixed height above the water needs the number the SHEET was drawn at,
    // not a datum reconstructed from the grid.
    // SAMPLE THE MIDDLE, NOT JUST THE CORNERS. A berth deck is built to
    // straddle the bank, so its VERTICES are routinely all on land while the
    // deck itself reaches over the channel — testing vertices alone left one
    // measured berth at 7.96 with the sea at 0.18 and nothing but water under
    // it. The centroid is the part that is actually over the water.
    let cx0 = 0, cz0 = 0;
    for (const [x, z] of pts) { cx0 += x; cz0 += z; }
    cx0 /= pts.length; cz0 /= pts.length;
    let drawnLo = drawnGroundAt(cx0, cz0);
    for (const [x, z] of pts) {
      const dg = drawnGroundAt(x, z);
      if (dg < drawnLo) drawnLo = dg;
    }
    // ...AND drawnGroundAt IS THE WRONG SURFACE TO ASK, WHICH IS WHY THE FIRST
    // TWO TESTS ONLY FOUND 22 OF 113.
    //
    // `drawnGroundAt` is `vertexY`, and vertexY sinks the drawn skin over a
    // tidal channel ONLY where `!inRoad` — "A MAPPED WAY KEEPS ITS GROUND TOO
    // ... a non-bridge way carries its own berm through the water", which is
    // deliberate and was measured (drowning them took trailcheck's blocked
    // runs 0 -> 5). The Cove's berths abut the shoreline promenades, so at a
    // berth the drawn surface correctly answers LAND, and every test built on
    // it refused the berth.
    //
    // ASK THE RINGS, NOT waterFloor — buildPiers RUNS TOO EARLY FOR IT.
    //
    // At runtime the terrain answers a failing berth with vertexY -1.75,
    // waterFloor -1.75 and _wfTidal TRUE: it knows exactly that tidal water is
    // there. At BUILD time it returns null, because the water-ring table
    // vertexY reads is not populated until after this function runs. Every
    // test built on waterFloor therefore asked a question that had no answer
    // yet and got a silent `false` — which is why seating 22 of 113 was the
    // ceiling no matter what else changed.
    //
    // The rings themselves ARE available (data.water), and `tidalRing` reads
    // grid.wet, which is baked data-side and ready. So do what buildWater does:
    // find the mapped ring covering this point and ask whether that RING is a
    // DEM-witnessed tidal channel. The comment here used to say "cached per
    // ring" while the code recomputed EVERY ring's DEM scan for EVERY pier —
    // 113 x 52 tidalRing() calls, measured 2026-08-19 as 3.8s of a 4.2s
    // "setup+water" boot phase on a 30s budget. A comment is not a
    // measurement. The list is hoisted above the pier loop now: one scan per
    // ring, identical answers.
    const inPoly = (x, z, ring) => {
      let c = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], zi = ring[i][1], xj = ring[j][0], zj = ring[j][1];
        if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
      }
      return c;
    };
    const tidalAt = (x, z) => {
      for (const ring of tidalRings) if (inPoly(x, z, ring)) return true;
      return false;
    };
    let pierOverTidal = tidalAt(cx0, cz0);
    if (!pierOverTidal) for (const [x, z] of pts) { if (tidalAt(x, z)) { pierOverTidal = true; break; } }
    const pierTidal = SEA_LEVEL[0] !== null
      && (pierOverTidal || wetCell(pts) || wetCell([[cx0, cz0]])
          || (isFinite(drawnLo) && drawnLo <= SEA_LEVEL[0] + 0.6));
    // THE RIM RULE STAYS FOR EVERY PIER THAT IS NOT A TIDAL BERTH.
    //
    // Seating decks on the drawn skin instead (`min(lo, drawnMin)`) was tried
    // and REFUSED BY THE GOLDEN GATE: `gateway-landing` moved 5.70% and the
    // whole frame shifted, because a pier is a WALKABLE SURFACE and the rider
    // stands on it — dropping a deck drops the camera. Over the strait,
    // vertexY is the sunk water bed, so that rule pulled legitimately elevated
    // boardwalks down to the waterline and put a step between them and the
    // roads they meet. The strait's own mega-ring never qualifies as tidal
    // (see buildWater), so those piers must keep the rim.
    //
    // What is actually broken is narrower than that: a berth inside a
    // DEM-witnessed TIDAL ring, where at() is uncarved by SESSION 20's design
    // and the rim is therefore a bank that is not drawn. Only those move.
    // ...AND THE SPLIT THAT MAKES BOTH TRUE IS THE OBJECT, NOT THE WATER.
    //
    // A PRIVATE BERTH (under 120 m2 — the Cove's are a median 28) is a small
    // deck whose whole job is to meet a boat, and nothing walks to it from a
    // road. It belongs on the water, and over the Cove's uncarved channels the
    // only datum that knows where the water IS drawn is vertexY.
    //
    // A BIG PIER is a boardwalk, a ferry landing, a promenade — the rider
    // stands on it and rides off it onto a road. `gateway-landing` moved 5.70%
    // and the whole frame shifted when the drawn-skin rule reached those:
    // over the strait vertexY is the sunk sea bed, so they dropped to the
    // waterline and left a step where they meet the carriageway. Those keep
    // the rim, which is what has always held them level with what they join.
    const berth = (p.a || 0) <= 120;
    if (pierTidal || berth) PIER_TIDAL++;
    const level = pierTidal ? SEA_LEVEL[0] + 1.15
      : berth && SEA_LEVEL[0] !== null
        ? Math.max(SEA_LEVEL[0] + 1.0, Math.min(lo, drawnLo) + 1.15)
        : lo + 1.15;
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
    // ...and the mooring piles on the private berths (see the note at the mesh)
    if ((p.a || 0) <= 120 && level <= 3.0) {
      let lastx = null, lastz = null;
      for (const [qx, qz] of pts) {
        if (lastx !== null && Math.hypot(qx - lastx, qz - lastz) < 3) continue;
        if (window.__onRoad && window.__onRoad(qx, qz, 0.3)) continue;
        lastx = qx; lastz = qz;
        // 2.9m of pile: ~1.5m proud of the deck, the rest down into the water
        const pg = new THREE.CylinderGeometry(0.135, 0.155, 2.9, 6);
        pg.translate(qx, level + 1.5 - 1.45, qz);
        piles.push(pg);
      }
    }
  }
  if (!geos.length) return { piers: 0 };
  // MOORING PILES — WHAT MAKES A DECK READ AS A BERTH.
  //
  // The Cove's private jetties have been drawn since before the villa pass and
  // the data carries 109 of them inside the Cove alone (median 28 m2). Ridden
  // past, they are flat grey slabs on the water: correct in plan, and nothing
  // about them says boat. A berth's whole silhouette from the bank is the
  // PILES standing out of it.
  //
  // Only the private berths get them (area under 120 m2). The big working
  // decks — the ferry terminal, the marina's own structures — are a different
  // object and would need their own vocabulary, so they are left alone rather
  // than given a pile field that happens to be the same recipe.
  //
  // A pile that stands in a carriageway is the P1b defect the lip rule above
  // already exists for, so the same `__onRoad` test guards it, and vertices
  // closer than 3m to the last one are skipped so a finely-traced ring does
  // not grow a picket fence.
  if (piles.length) {
    const pileMesh = new THREE.Mesh(mergeGeos(piles), pileMat);
    pileMesh.name = 'pierPile';
    pileMesh.castShadow = false; pileMesh.receiveShadow = true;
    world.add(pileMesh);
  }
  const deck = new THREE.Mesh(mergeGeos(geos), deckMat);
  deck.name = 'pierDeck';
  deck.receiveShadow = true;
  world.add(deck);
  const lip = new THREE.Mesh(mergeGeos(edges), edgeMat);
  lip.name = 'pierEdge';
  lip.castShadow = false; lip.receiveShadow = true;
  world.add(lip);
  if (PIER_TIDAL) {
    console.log(`  piers: ${PIER_TIDAL} of ${geos.length} seated on the TIDAL water `
      + `they stand in rather than on the uncarved bank under it`);
  }
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
  // EVERY TREE THIS PASS INVENTS, reported so the GROUND can be shaded by them.
  // terrain.applyCanopy() runs after planting and needs the fill's positions:
  // the ground mesh is coloured BEFORE this function runs, so the floor under
  // Imbiah was lawn-green until these were counted. Declared at the top of the
  // function because the first fill that uses it is 300 lines below and a
  // const declared beside it sat in its own temporal dead zone.
  const PLANTED = (window.__plantedTrees = window.__plantedTrees || []);
  // PER-FILL TIMING. plantSurveyed is 4.29s of a 25s boot and the number was
  // one lump, which is useless for choosing what to fix — the whole lesson of
  // the 'surround' phase directly above it in the boot marks. Costs one
  // performance.now() per fill and is read by data/probe.mjs.
  const _pmT0 = (typeof performance !== 'undefined' ? performance.now() : 0);
  let _pmLast = _pmT0;
  const _pm = (window.__plantMarks = []);
  const pmark = (name) => {
    const t = (typeof performance !== 'undefined' ? performance.now() : 0);
    _pm.push([name, Math.round(t - _pmLast)]);
    _pmLast = t;
  };
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
  // THE SENSORYSCAPE PROMENADE IS A WALK, AND NOTHING KNEW IT WAS ONE.
  //
  // trailSegs above is built from data.roads — footway, pedestrian, path,
  // steps. The Sensoryscape connector is not in data.roads: its centreline is
  // `data.sensoryscape.spine`, surveyed from the garden nodes, and src/
  // sgdetail.js draws a 9.2m boarded ribbon along it because the real thing is
  // a broad landscaped deck and drawing it at OSM's 3.4m footway width made it
  // read as a lawn with a stripe across it.
  //
  // So the fill planted straight through it. Measured on the live build:
  // 4 trees standing INSIDE the 9.2m boardwalk, one of them dead centre of
  // the frame in the new sensory-vessels golden.
  //
  // Two separate reasons this needed its own test rather than a line in
  // trailSegs: the spine is not a road record, and 3.4m is the wrong radius
  // for it — the ribbon's own half-width is 4.6m, so a tree cleared by the
  // footway rule can still be standing on the planks. 5.6m is that half-width
  // plus a metre of trunk.
  //
  // FOUR SEGMENTS, so it is not indexed and does not need to be — but it IS
  // inside a per-plant loop, which is the shape that cost 14s of boot twice
  // (buildTrails and plantSurveyed, 2026-08-04), so it takes a bbox reject
  // first and never solves a distance it does not have to.
  const promSegs = [];
  {
    const sp = (data.sensoryscape && data.sensoryscape.spine) || [];
    for (let i = 0; i < sp.length - 1; i++) {
      const [ax, az] = sp[i], [bx, bz] = sp[i + 1];
      promSegs.push([ax, az, bx, bz,
                     Math.min(ax, bx) - 5.6, Math.max(ax, bx) + 5.6,
                     Math.min(az, bz) - 5.6, Math.max(az, bz) + 5.6]);
    }
  }
  const PROM_CLEAR2 = 5.6 * 5.6;
  const onPromenade = (x, z) => {
    for (let i = 0; i < promSegs.length; i++) {
      const s = promSegs[i];
      if (x < s[4] || x > s[5] || z < s[6] || z > s[7]) continue;
      const vx = s[2] - s[0], vz = s[3] - s[1];
      const l2 = vx * vx + vz * vz || 1;
      let t = ((x - s[0]) * vx + (z - s[1]) * vz) / l2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (s[0] + vx * t), dz = z - (s[1] + vz * t);
      if (dx * dx + dz * dz < PROM_CLEAR2) return true;
    }
    return false;
  };
  // A ROOF IS BUILT SPACE EVEN THOUGH NOTHING SOLID STANDS IN IT.
  //
  // Planting refuses ground that `blocked()` calls occupied, and a CANOPY is a
  // roof on slender columns — no mass at ground level — so the test says the
  // ground under it is free and the fill plants there. At Sapphire Pavillion
  // the result is trees growing THROUGH the roof, trunks and leaves punching
  // out of the plane, which is what the 2026-08-07 walksweep frame shows.
  //
  // Every one of them is INVENTED: 0 of 3,668 surveyed trees fall inside a
  // roof footprint, so this only ever refuses the fill's own guesses. 32
  // canopies, 36,809 m2.
  //
  // Indexed on a 48 m grid rather than scanned, because this is called per
  // planting candidate and an unindexed ring test inside a per-object loop is
  // the single most expensive shape in this codebase's history — four
  // instances, 17 seconds of boot between them.
  const roofRings = (data.buildings || [])
    .filter((b2) => (b2.bt === 'roof' || b2.roof) && b2.p && b2.p.length >= 3)
    .map((b2) => b2.p);
  const roofIx = new Map();
  const RCELL = 48;
  for (const r of roofRings) {
    let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (const [vx2, vz2] of r) {
      if (vx2 < mnx) mnx = vx2; if (vx2 > mxx) mxx = vx2;
      if (vz2 < mnz) mnz = vz2; if (vz2 > mxz) mxz = vz2;
    }
    for (let cx2 = Math.floor(mnx / RCELL); cx2 <= Math.floor(mxx / RCELL); cx2++) {
      for (let cz2 = Math.floor(mnz / RCELL); cz2 <= Math.floor(mxz / RCELL); cz2++) {
        const k = cx2 + ',' + cz2;
        let l = roofIx.get(k);
        if (!l) { l = []; roofIx.set(k, l); }
        l.push(r);
      }
    }
  }
  // A CROWN IS WIDER THAN A TRUNK, which is why this is not a point-in-ring
  // test. Refusing only the inside of the rings removed exactly ONE tree
  // island-wide and changed nothing in the frame: the trees punching through
  // Sapphire Pavillion stand OUTSIDE a 45 x 44 m canopy and lean over it. The
  // margin is a crown radius, so a tree may stand a crown's width back from
  // the eaves and no closer.
  const ROOF_MARGIN = 6.0;
  const underRoof = (x, z) => {
    const l = roofIx.get(Math.floor(x / RCELL) + ',' + Math.floor(z / RCELL));
    if (!l) return false;
    for (const r of l) {
      let c = false;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const xi = r[i][0], zi = r[i][1], xj = r[j][0], zj = r[j][1];
        if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
        const ex = xj - xi, ez = zj - zi;
        const L2 = ex * ex + ez * ez || 1;
        let t2 = ((x - xi) * ex + (z - zi) * ez) / L2;
        t2 = t2 < 0 ? 0 : t2 > 1 ? 1 : t2;
        const dx = x - (xi + ex * t2), dz = z - (zi + ez * t2);
        if (dx * dx + dz * dz < ROOF_MARGIN * ROOF_MARGIN) return true;
      }
      if (c) return true;
    }
    return false;
  };
  // A RUIN YOU CANNOT FIND IS NOT A PLACE — and this is the ONE case where a
  // mapped wood gives way.
  //
  // The clearing rule below defers to mapped woods on purpose: if OSM says
  // there are trees there, there are trees there. That is right for the halo
  // and the wild fill. It is wrong for the three kinds whose entire purpose is
  // to be reached and seen, and the proof is that Fort Serapong ruins, built
  // 2026-08-06, rendered as nothing at all — the canopy closed over them
  // completely and a player would never know they existed.
  //
  // It is the same argument that won Fort Siloso's gun its field of fire: a
  // battery has one by definition, a viewpoint has a view by definition, and a
  // ruin is a thing you come to look at. Only fort, ruins and viewpoint, and
  // only within their own radius — the wood closes in again immediately beyond.
  // `attraction` joins them: those 19 nodes are rides and water-park features —
  // Adventure Cove's slide towers among them — and a ride stands on open ground
  // by definition. Rendered before this, the slides built at Tidal Twister were
  // completely hidden by canopy the fill had put around them.
  const KEEP_CLEAR = { fort: 30, ruins: 20, viewpoint: 26, attraction: 18 };
  const seeClear = [];
  for (const a of (data.attractions || [])) {
    const r = KEEP_CLEAR[a.k];
    if (r && a.p && typeof a.p[0] === 'number') seeClear.push([a.p[0], a.p[1], r * r]);
  }
  const inSeeClear = (x, z) => {
    for (let i = 0; i < seeClear.length; i++) {
      const dx = x - seeClear[i][0], dz = z - seeClear[i][1];
      if (dx * dx + dz * dz < seeClear[i][2]) return true;
    }
    return false;
  };
  // MOVED UP HERE, AND THIS IS THE BUG IT FIXES.
  //
  // `inSeeClear` was tested at exactly ONE of the six planting call sites — the
  // jungle fill — while `onTrail` was tested at all six. So the rule that keeps
  // a canopy off the things you are meant to walk up to did not apply to the
  // surveyed planting or to four of the fills, and megazip adventure park's
  // 2026-08-07 sweep frame is the result: a headline ride, standing in dense
  // trunks with its own gate sign barely visible behind them.
  //
  // That is precisely the trap the comment below already warns about, written
  // for a different rule and never applied to this one: **adding it at one call
  // site is how a rule ends up half-applied.**
  //
  // Indexed on the same 48 m grid as the roofs. `inSeeClear` was a linear scan
  // over every keep-clear node, which was survivable at one call site and is
  // the four-times-burned shape at six.
  const scIx = new Map();
  for (const c of seeClear) {
    const r = Math.sqrt(c[2]);
    for (let cx2 = Math.floor((c[0] - r) / RCELL); cx2 <= Math.floor((c[0] + r) / RCELL); cx2++) {
      for (let cz2 = Math.floor((c[1] - r) / RCELL); cz2 <= Math.floor((c[1] + r) / RCELL); cz2++) {
        const k = cx2 + ',' + cz2;
        let l = scIx.get(k);
        if (!l) { l = []; scIx.set(k, l); }
        l.push(c);
      }
    }
  }
  const inSeeClearIx = (x, z) => {
    const l = scIx.get(Math.floor(x / RCELL) + ',' + Math.floor(z / RCELL));
    if (!l) return false;
    for (let i = 0; i < l.length; i++) {
      const dx = x - l[i][0], dz = z - l[i][1];
      if (dx * dx + dz * dz < l[i][2]) return true;
    }
    return false;
  };
  // folded into onTrail so all seven planting call sites get it at once —
  // adding it at one of them is how a rule ends up half-applied
  const onTrail = (x, z) => trailDist2(x, z) < 3.4 * 3.4 || onPromenade(x, z)
    || underRoof(x, z) || inSeeClearIx(x, z);

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

  // AND A CABLE CAR FLIES OVER THE JUNGLE — EXCEPT WHERE IT COMES DOWN INTO IT.
  //
  // The MegaZip has had a corridor since it was built and the luge got one
  // above. The two cableways never did, and riding them showed why that
  // matters: board the cable car and the cabin is INSIDE the canopy, on a ride
  // whose entire point is the view.
  //
  // MEASURED, and the two lines fail for different reasons:
  //   * A gondola flies at ground+32, which clears a 17.5m tree by fourteen
  //     metres — correct, and the jungle under a mid-span must NOT be touched.
  //     But the wire eases down to a 12m platform at every station, and a tree
  //     is 13.0-17.5m tall. So the last 146m of the Singapore-Sentosa Cable Car
  //     and 195m of the Sentosa Line — 8% and 22% of their length, all of it
  //     the station approaches — run BELOW the treetops.
  //   * A chair_lift flies at ground+9. That is under the canopy for ONE
  //     HUNDRED PERCENT of both SkyRide lines, all 598m of them.
  //
  // So the test is not "near a cableway", it is "near a cableway that is low
  // enough for a tree to reach" — which clears the station approaches and the
  // SkyRide and leaves every mid-span span of jungle exactly as it was. That
  // distinction is the whole point: a blanket corridor would shave two bald
  // stripes across Imbiah and a third out to Siloso Point, which is a worse
  // island than the defect.
  //
  // 9m half-width: the crowns are 8-12m in radius, so a trunk at 9m still
  // overhangs the wire, and the luge already spends 5.5m on a 3m track.
  // The wire comes from cableProfiles() — the same array sgdetail draws.
  const CABLE_CLEAR = 9.0;
  const TREE_REACH = 19.0;            // a 17.5m crown plus a metre and a half
  const _cwLines = ((data.cableway || {}).lines) || [];
  const _cwProf = _cwLines.length ? cableProfiles(data) : [];
  const _cableSegs = [];
  _cwLines.forEach((ln, li) => {
    const hs = _cwProf[li] || [];
    for (let i = 0; i < ln.p.length - 1; i++) {
      const [ax, az] = ln.p[i], [bx, bz] = ln.p[i + 1];
      // the clearance at each end, so a span that dips only at one end is only
      // cleared where it dips
      const ca = (hs[i] || 0) - groundAt(ax, az);
      const cb = (hs[i + 1] || 0) - groundAt(bx, bz);
      if (Math.min(ca, cb) > TREE_REACH) continue;   // flying well over the canopy
      _cableSegs.push([ax, az, bx, bz, ca, cb]);
    }
  });
  const _CCELL = 24;
  const _cGrid = new Map();
  for (const s of _cableSegs) {
    const pad = CABLE_CLEAR + 1;
    for (let gx = Math.floor((Math.min(s[0], s[2]) - pad) / _CCELL);
         gx <= Math.floor((Math.max(s[0], s[2]) + pad) / _CCELL); gx++) {
      for (let gz = Math.floor((Math.min(s[1], s[3]) - pad) / _CCELL);
           gz <= Math.floor((Math.max(s[1], s[3]) + pad) / _CCELL); gz++) {
        const k = gx + ',' + gz;
        let l = _cGrid.get(k);
        if (!l) { l = []; _cGrid.set(k, l); }
        l.push(s);
      }
    }
  }
  const inCableCorridor = !_cableSegs.length ? () => false : (x, z) => {
    const cx = Math.floor(x / _CCELL), cz = Math.floor(z / _CCELL);
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gz = cz - 1; gz <= cz + 1; gz++) {
        const l = _cGrid.get(gx + ',' + gz);
        if (!l) continue;
        for (const [ax, az, bx, bz, ca, cb] of l) {
          const vx = bx - ax, vz = bz - az;
          const L2 = vx * vx + vz * vz || 1;
          let t = ((x - ax) * vx + (z - az) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = x - (ax + vx * t), dz = z - (az + vz * t);
          if (dx * dx + dz * dz >= CABLE_CLEAR * CABLE_CLEAR) continue;
          // and only where the wire ACTUALLY dips low, along this span
          if (ca + (cb - ca) * t <= TREE_REACH) return true;
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
    if (inZipCorridor(x, z) || inLugeCorridor(x, z) || inCableCorridor(x, z)) continue;
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
  pmark('surveyed');
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
        if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz) || inCableCorridor(jx, jz)) continue;
        if (onTrail(jx, jz)) continue;
        // top of the spread held at ~1.38, not 1.5: at 1.5 the tallest crown
        // put a leaf card 19.6m up and P3 ("props off the ground") refused the
        // deploy on it. The understorey is what the canopy needed anyway — the
        // gain is at the BOTTOM of this range, not the top.
        f.add(jx, jz, 0.55 + ((jx * 7.3 + jz * 3.1) % 100) / 120);
        PLANTED.push([jx, jz]);
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
  pmark('jungle');
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
    // a ride stands on open ground; see KEEP_CLEAR above for the same argument
    attraction: 18,
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
    // INDEXED, for the same reason trailGrid above is, and it is the same bug
    // wearing its third hat this project.
    //
    // This scanned EVERY claimed polygon for EVERY halo candidate, doing a full
    // ring test each time. Measured on Sentosa: 159 claimed polygons carrying
    // 2,830 vertices against ~25,500 halo candidates — up to 72 MILLION
    // ring-edge solves inside the boot. plantSurveyed was 4,846ms of a 25s
    // boot, and 'surround' (the phase it hides in) reads as "the city beyond
    // the box", which costs 125ms; ?nofoliage takes the phase 5,071 -> 278ms.
    //
    // PATTERN TO WATCH, from the 2026-08-04 handover, now three for three:
    // an unindexed linear scan inside a per-object loop. onAnyRoadT was the
    // first, trailDist2 the second, this is the third.
    //
    // A polygon can only contain a point if its BOUNDING BOX covers that
    // point's cell, so bucketing by bbox is exact — the answers are identical,
    // which is the whole point of fixing it this way rather than by loosening
    // a test.
    const CCELL = 48;
    const claimedGrid = new Map();
    for (const g2 of claimed) {
      let mnx = Infinity, mxx = -Infinity, mnz = Infinity, mxz = -Infinity;
      for (const [x, z] of g2.p) {
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      for (let gx = Math.floor(mnx / CCELL); gx <= Math.floor(mxx / CCELL); gx++) {
        for (let gz = Math.floor(mnz / CCELL); gz <= Math.floor(mxz / CCELL); gz++) {
          const k = gx + ',' + gz;
          let l = claimedGrid.get(k);
          if (!l) { l = []; claimedGrid.set(k, l); }
          l.push(g2);
        }
      }
    }
    const inClaimed = (x, z) => {
      const l = claimedGrid.get(Math.floor(x / CCELL) + ',' + Math.floor(z / CCELL));
      if (!l) return false;
      for (let i = 0; i < l.length; i++) if (inRing(x, z, l[i].p)) return true;
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
          if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz) || inCableCorridor(jx, jz)) continue;
          if (onTrail(jx, jz)) continue;
          if (window.__underCanopy && window.__underCanopy(jx, jz)) continue;
          f.add(jx, jz, 0.5 + ((jx * 7.3 + jz * 3.1) % 100) / 140);
          PLANTED.push([jx, jz]);
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
      // INDEXED — THE FOURTH TIME THIS EXACT SHAPE HAS COST SECONDS OF BOOT.
      //
      // Both of these scanned EVERY polygon with a full ring test, per
      // candidate, on a 15m grid across the whole island bbox. `greens` is all
      // 193 green polygons and `lands` every mapped parcel, so this was on the
      // order of a HUNDRED MILLION ring-edge solves inside the boot. Measured
      // by per-fill marks (window.__plantMarks): the fill this sits in was
      // 3,050ms of plantSurveyed's 4,286ms, which is 12% of the whole boot.
      //
      // Same exact fix as `inClaimed` above and `trailDist2` before it: bucket
      // by BOUNDING BOX, because a polygon can only contain a point if its
      // bbox covers that point's cell. The index is exact — the answers do not
      // change, and the tree count is the proof.
      //
      // onAnyRoadT (10.3s), trailDist2 (~4s), inClaimed (0.56s), and now this.
      // FOUR FOR FOUR: an unindexed linear scan inside a per-object loop.
      const PCELL = 48;
      const polyIndex = (polys) => {
        const grid = new Map();
        for (const g2 of polys) {
          let mnx2 = Infinity, mxx2 = -Infinity, mnz2 = Infinity, mxz2 = -Infinity;
          for (const [x, z] of g2.p) {
            if (x < mnx2) mnx2 = x; if (x > mxx2) mxx2 = x;
            if (z < mnz2) mnz2 = z; if (z > mxz2) mxz2 = z;
          }
          for (let gx = Math.floor(mnx2 / PCELL); gx <= Math.floor(mxx2 / PCELL); gx++) {
            for (let gz = Math.floor(mnz2 / PCELL); gz <= Math.floor(mxz2 / PCELL); gz++) {
              const k = gx + ',' + gz;
              let l = grid.get(k);
              if (!l) { l = []; grid.set(k, l); }
              l.push(g2);
            }
          }
        }
        return (x, z) => grid.get(Math.floor(x / PCELL) + ',' + Math.floor(z / PCELL)) || null;
      };
      const greens = (data.green || []).filter((g2) => g2.p && g2.p.length > 3);
      const greensAt = polyIndex(greens);
      const inAnyGreen = (x, z) => {
        const l = greensAt(x, z);
        if (!l) return null;
        for (let i = 0; i < l.length; i++) if (inRing(x, z, l[i].p)) return l[i].k;
        return null;
      };
      // a mapped plaza, car park or works parcel is not forest either
      const lands = (data.land || []).filter((l2) => l2.p && l2.p.length > 3);
      const landsAt = polyIndex(lands);
      const inLand = (x, z) => {
        const l = landsAt(x, z);
        if (!l) return false;
        for (let i = 0; i < l.length; i++) if (inRing(x, z, l[i].p)) return true;
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
            if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz) || inCableCorridor(jx, jz)) continue;
            if (onTrail(jx, jz)) continue;
            if (window.__underCanopy && window.__underCanopy(jx, jz)) continue;
            if (window.__inFootprint && window.__inFootprint(jx, jz)) continue;
            f.add(jx, jz, 0.5 + ((jx * 7.3 + jz * 3.1) % 100) / 150);
            PLANTED.push([jx, jz]);
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
  pmark('halo');
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
      // A SCRUB RING IS BUSHES BY DEFINITION, so it fills without the trail
      // band: it exists to BE the vegetation (process.py's taxonomy: "scrub
      // is bushes with the odd tree"). Until 2026-08-19 a scrub ring got its
      // ground tint and nothing standing on it, so the Palawan bridge-landing
      // green island (research §3.4, authored in data/palawangreen.py) drew
      // as a dark smudge. Every guard below still applies — roads, blocked,
      // corridors — so the landing loop's boardwalk stays clear through it.
      const _isScrub = gp.k === 'scrub';
      if ((gp.k !== 'wood' && !_isScrub) || !gp.p || gp.p.length < 4) continue;
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
          if (!_isScrub && !nearTrail(jx, jz)) continue;
          if (blocked && blocked(jx, jz)) continue;
          if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz) || inCableCorridor(jx, jz)) continue;
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
  // AND THE GROUND THE TERRAIN ALREADY PAINTS AS JUNGLE GETS PLANTED TOO.
  //
  // The owner, 2026-08-06, on the Tanjong Rimau headland: "wtf so empty".
  // Measured, trees per km2 on the same island:
  //
  //     Tanjong Rimau headland     7,624
  //     Fort Siloso hill          41,411
  //     Imbiah ridge             184,525
  //     Mount Serapong           193,492
  //
  // A twenty-fourth of Imbiah. The cause is not a planting bug, it is a
  // DISAGREEMENT BETWEEN TWO AUTHORITIES — the same shape as greenFrac counting
  // the sea, and as the monorail's two heights. terrain.js already decided this
  // ground is vegetation and paints it dark green ("ON A GREEN ISLAND, UNKNOWN
  // GROUND IS VEGETATION"), while the planting only ever fills MAPPED wood
  // polygons and a 25m halo. Where OSM traced no wood — the Rimau headland, the
  // Fort Siloso slopes — the floor is painted jungle and nothing stands on it.
  //
  // So the fill now asks the SAME question the paint asks: unmapped ground on a
  // green island is jungle. Sparser than a mapped wood on purpose (14m against
  // 11m) — the survey says a wood is full of trees and that is reporting it,
  // whereas this is inference and should read as secondary growth, not as
  // primary forest.
  //
  // ORDERED CHEAPEST TEST FIRST. greenAt walks candidate rings and is the
  // expensive call; the island mask is an array lookup. Getting that order
  // wrong is what put 120,000 full table scans in the boot once already.
  pmark('shrubs');
  let wild = 0;
  if (TERRAIN && TERRAIN.g && TERRAIN.greenFrac > 0.35) {
    const g2 = TERRAIN.g;
    const x0 = g2.x0, z0 = g2.z0;
    const x1 = x0 + (g2.nx - 1) * g2.cell, z1 = z0 + (g2.nz - 1) * g2.cell;
    // what the two fills above already planted, on a coarse hash
    const taken = new Set();
    for (const [px, pz] of PLANTED) taken.add(Math.round(px / 12) + ',' + Math.round(pz / 12));
    for (let gx = Math.ceil(x0 / 14) * 14; gx < x1; gx += 14) {
      for (let gz = Math.ceil(z0 / 14) * 14; gz < z1; gz += 14) {
        const jx = gx + (((gx * 9.1 + gz * 6.7) % 11) - 5.5);
        const jz = gz + (((gx * 4.3 + gz * 12.7) % 11) - 5.5);
        if (!TERRAIN.onIsland(jx, jz)) continue;          // array lookup
        if (TERRAIN.at(jx, jz) < 1.4) continue;           // shore and below is not forest
        if (taken.has(Math.round(jx / 12) + ',' + Math.round(jz / 12))) continue;
        if (blocked && blocked(jx, jz)) continue;
        if (inClearing(jx, jz)) continue;
        if (inZipCorridor(jx, jz) || inLugeCorridor(jx, jz) || inCableCorridor(jx, jz)) continue;
        if (onTrail(jx, jz)) continue;
        if (window.__underCanopy && window.__underCanopy(jx, jz)) continue;
        // A KNOWN TRADE, stated rather than discovered later: this treats ALL
        // unmapped island ground as jungle, including the gaps between houses at
        // Sentosa Cove. Rendered from above the Cove it reads as a leafy resort
        // suburb, which is defensible and is a great deal better than the bare
        // khaki it replaced — but the real Cove is manicured lawn and pool, not
        // closed canopy. If it ever reads as too much, the fix is to exclude
        // ground within N metres of a `resi` polygon rather than to weaken the
        // rule everywhere.
        //
        // the expensive ones last: mapped ground of ANY kind keeps its own
        // character — a lawn stays a lawn, a fairway stays a fairway
        // THE GOLF FAMILY IS STILL GOLF (2026-08-20). This test was written
        // when the whole course was one `golf` cover. data/golf.py split it
        // into the survey's own 418 areas — fairway, rough, green, tee,
        // bunker, hazard — and the moment it did, every one of those returned
        // a kind this line had never heard of, so the shrub pass SKIPPED THE
        // ENTIRE COURSE. That is not a cosmetic loss: the belt between holes
        // is most of what you see of a course from outside it, and dropping it
        // also shifted the PLANTED set enough to sink two leaf-cards 345m
        // away, which is how the deploy caught it (P3, 2 props off the ground).
        const GOLFY = (k) => k === 'golf' || k === 'fairway' || k === 'grough'
          || k === 'ggreen' || k === 'gtee' || k === 'gbunker' || k === 'ghazard';
        const _cover = TERRAIN.greenAt(jx, jz);
        if (_cover && !GOLFY(_cover)) continue;
        // ...EXCEPT THE EDGE OF A GOLF COURSE, WHICH IS TREES.
        //
        // Measured island-wide: golf is the SECOND largest land cover here —
        // 1,351 sampled cells against 2,443 unmapped and 837 of mapped wood —
        // and only 22% of it carried a tree, so from any distance a fifth of
        // the island read as flat empty green. A fairway genuinely is open and
        // must stay open; what is missing is the belt between holes and along
        // the course boundary, which on Serapong and Tanjong is continuous
        // planting and is most of what you actually SEE of a course from
        // outside it.
        //
        // So: plant golf ground only where it is within about 25m of something
        // that is not golf. That is the boundary and the gaps between holes by
        // construction, and it cannot touch the middle of a fairway.
        if (GOLFY(_cover)) {
          // NOTHING GROWS IN A BUNKER, ON A PUTTING GREEN, ON A TEE OR IN A
          // LAKE. The old single-cover test could not make this distinction
          // because it did not know the course had parts; now that it does,
          // refusing these four is strictly more accurate than what it
          // replaced — a shrub in a sand trap is a groundsman's nightmare.
          if (_cover === 'gbunker' || _cover === 'ghazard'
              || _cover === 'ggreen' || _cover === 'gtee') continue;
          let edge = false;
          for (const [ex, ez] of [[25, 0], [-25, 0], [0, 25], [0, -25]]) {
            if (!GOLFY(TERRAIN.greenAt(jx + ex, jz + ez))) { edge = true; break; }
          }
          if (!edge) continue;
        }
        // CLOSURE, NOT COUNT. Doubling the trunks doubles the memory; raising
        // the crowns closes the canopy for nothing. The floor of the range
        // matters more than the ceiling — 0.5 left gaps of bare paint between
        // crowns, which is what reads as "empty". Held under 1.4 because at 1.5
        // a crown put a leaf card 19.6m up and P3 refused a deploy on it.
        f.add(jx, jz, 0.7 + ((jx * 6.1 + jz * 4.7) % 100) / 145);
        PLANTED.push([jx, jz]);
        wild++;
      }
    }
  }

  pmark('wild');
  // STAGE 2 of the pack restyle: ground life along the walked verges —
  // deterministic from position hashes, guarded by this pass's own blocked()
  // plus the water/footprint/road chokepoints inside scatterVerges. Placed
  // from trailSegs, the same footway index the trail-clear rule uses.
  const verge = scatterVerges(world, trailSegs, blocked, (x, z) => TERRAIN.at(x, z));
  // B13 foundation greening: wall-base bushes/ferns/flowers in the beauty
  // sweep's flagged zones (research/beauty-sweep-2026-08-23.md)
  const fnd = scatterFoundations(world, data.buildings, blocked, (x, z) => TERRAIN.at(x, z));
  pmark('verge');
  if (!surveyed && !jungle && !halo && !shrubs && !wild) return { surveyedTrees: 0, jungleTrees: 0, haloTrees: 0, shrubClumps: 0, wildTrees: 0, vergeLife: verge };
  const built = await f.buildY(world, Y);
  return { surveyedTrees: built - jungle - halo - shrubs - wild, jungleTrees: jungle, haloTrees: halo, shrubClumps: shrubs, wildTrees: wild, vergeLife: verge };
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
  const lifeguards = [];
  for (const a of (data.attractions || [])) {
    const k = (a.k || '') + ' ' + (a.n || '');
    if (!/zip|helix|cable|luge|tower|bungee/i.test(k)) continue;
    const p = a.p;
    if (Array.isArray(p) && p.length && !Array.isArray(p[0])) built.push([p[0], p[1]]);
  }
  for (const zt of (data.zipline && data.zipline.towers) || []) {
    if (Array.isArray(zt) && zt.length >= 2) built.push([zt[0], zt[1]]);
  }
  // LIFEGUARD TOWERS BELONG TO THE BEACH, NOT TO THIS LATTICE.
  //
  // Same rule as the SkyHelix above, from the other direction. A surveyed
  // `emergency=lifeguard` node lands within a metre of `man_made=tower`
  // way/163201840 on Palawan — which is exactly how research/palawan-spawn.md
  // 6.3 proved that footprint is a Beach Patrol observation tower. sgdetail's
  // buildBeachLife now stands the researched form there (timber posts, railed
  // observation deck, hipped chocolate roof, cream soffit), so the honest
  // generic answer for an unnamed tower is no longer the right one here: it
  // would put a tapered steel lattice around a 4 m timber hut.
  //
  // 8 m, not 40: this is "the map tagged one object twice", not "a big ride
  // stands hereabouts", and a generous radius would silently delete a real
  // mast that happened to stand near a beach.
  for (const f of (data.parkfurn || [])) {
    if (f.k === 'lifeguard' && Array.isArray(f.p)) lifeguards.push([f.p[0], f.p[1]]);
  }
  const onSomething = (x, z) => built.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < 40)
    || lifeguards.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 8);

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
  // ...AND OFF THE ISLAND ENTIRELY.
  //
  // This is a HORIZON: grey massing standing in for a city that continues past
  // the district edge, which is true of Chinatown and Orchard and is not true
  // of Sentosa. The keep-out rules above are `inCore` (within 70m of a real
  // building) and `inWater` — and on an island neither catches the middle of
  // the place. The Tanjong golf course and the Cove's fairways have no
  // buildings within 70m and are not water, so the rule read them as "empty
  // ground past the last building" and stood 20-45m featureless grey blocks on
  // them. Found 2026-08-05 from the air: raycast, they carry no building in
  // the data within 40m, because they are not buildings.
  //
  // The island's own coastline ring is published by data/islandring.py — the
  // same stitched ring island.py clips every playable layer to, 4.89 km2
  // against Sentosa's real ~5. A district with no islandRing (every mainland
  // one) gets the old behaviour exactly.
  const _isle = data.islandRing && data.islandRing.length > 8 ? data.islandRing : null;
  let _isleBB = null;
  if (_isle) {
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (const [x, z] of _isle) {
      if (x < a) a = x; if (x > c) c = x;
      if (z < b) b = z; if (z > d) d = z;
    }
    _isleBB = [a, b, c, d];
  }
  const onIsland = (x, z) => {
    if (!_isle) return false;
    if (x < _isleBB[0] || x > _isleBB[2] || z < _isleBB[1] || z > _isleBB[3]) return false;
    let hit = false;
    for (let i = 0, j = _isle.length - 1; i < _isle.length; j = i++) {
      const xi = _isle[i][0], zi = _isle[i][1], xj = _isle[j][0], zj = _isle[j][1];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
    }
    return hit;
  };
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
  let onIsleSkipped = 0, inStraitSkipped = 0;
  const _g2s = TERRAIN.grid && TERRAIN.grid();
  const _seaLvl = _g2s && typeof _g2s.sea === 'number' ? _g2s.sea : null;
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
      // THE DRAWS HAPPEN FIRST, THEN THE DECISION. This function's own note
      // says rnd() is called only after the keep-out tests "so a different set
      // of surviving cells would shift the whole placement RNG stream". The
      // island test below drops blocks, so its draws are taken BEFORE it: every
      // block that survives is bit-identical to before, and only the ones
      // standing on Sentosa disappear.
      const _bh = 16 + rnd() * 62 * fade, _byaw = rnd() * Math.PI;
      // the island is the played world; a horizon may not stand in it. Tested
      // at the block's own corners as well as its centre, for the same reason
      // the water test is: a 48m block on a dry point can still overhang the
      // coast.
      if (_isle) {
        let ashore = false;
        for (const ox of [-bw / 2, 0, bw / 2])
          for (const oz of [-bd / 2, 0, bd / 2])
            if (onIsland(jx + ox, jz + oz)) ashore = true;
        if (ashore) { onIsleSkipped++; continue; }
        // ...AND NOT IN THE STRAIT. The water test above reads the MAPPED
        // water rings, and the open sea is not a ring — it is the seaSurface
        // sheet (the same two-datums trap buildPiers pays for), so south of
        // the island the backdrop city stood in the anchorage: khaki blocks
        // floating a kilometre off Palawan, found 2026-08-19 the first time
        // a camera ever looked out from the sea (shots/street/
        // south_noboats.png). Only the open-sea SIDES are culled — south,
        // west and east of the island ring's own extent — because the north
        // edge clamps to the channel and a bare DEM test would take the
        // mainland horizon with it, which is real city and the whole point.
        // Placed after every rnd() draw, same stream discipline as the
        // island test above.
        // ...everywhere except the CHANNEL STRIP, where the mainland horizon
        // lives. Two earlier cuts each left floaters: the bounding-box bands
        // missed sea inside the box's x-range, and "north of the island's
        // northernmost point" turned out to describe Tanjong Rimau's own
        // water — the island's north tip IS Rimau, so mainland-horizon
        // blocks stood mid-channel right off its shore (in the blessed
        // rimau-shore golden, shipping since the surround was born). The
        // channel between Sentosa and the mainland runs along z~11400-11600;
        // 11600 keeps the whole mainland strip and none of the island's own
        // sea. A constant, for THIS island, said out loud — the islandRing
        // gate above already makes this branch Sentosa-only.
        if (_seaLvl !== null && jz > 11600) {
          let atSea = false;
          for (const ox of [-bw / 2, 0, bw / 2])
            for (const oz of [-bd / 2, 0, bd / 2])
              if (TERRAIN.at(jx + ox, jz + oz) <= _seaLvl + 0.4) atSea = true;
          if (atSea) { inStraitSkipped++; continue; }
        }
      }
      put.push([jx, jz, _bh, bw, bd, _byaw]);
    }
  }
  if (onIsleSkipped) console.log(`  surround: ${onIsleSkipped} backdrop blocks refused — on the island`);
  if (inStraitSkipped) console.log(`  surround: ${inStraitSkipped} backdrop blocks refused — in the strait`);
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
