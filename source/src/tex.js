// Procedural textures. Nothing is downloaded; every surface is drawn into a
// canvas at load, which keeps the whole world a JS payload and keeps the
// palette under our control.
import * as THREE from '../lib/three.module.js';

// A DRAW KEYED TO A POSITION, NOT TO THE STREAM. For planting sites whose
// stream draw is CONDITIONAL on a guard (the divergence mode the reseed
// cannot reach): under ?planthash=1 the tree's scale comes from its own
// coordinates, so an edit that flips one guard cannot shift any other
// tree. Same hash family as TreeField._tree's per-crown rng.
export function hashRand(x, z, a, b) {
  const h = (Math.imul(Math.round(x * 8) | 0, 0x9E3779B1)
             ^ Math.imul(Math.round(z * 8) | 0, 0x85EBCA77)) >>> 0;
  return a + (Math.imul(h ^ (h >>> 15), 0x2545F491) >>> 0) / 4294967296 * (b - a);
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// THE PLACEMENT STREAM IS SWAPPABLE — the streaming prerequisite. Every
// invented placement in the world draws from here; with a module-level
// stream, BUILD ORDER is baked into every decision and a lazily-loaded
// district would reshuffle the city per ride. reseedPlacement(districtSeed)
// at the start of each district's build makes districts order-independent.
// UNTIL it is called, the stream and its seed are exactly what they always
// were, so the legacy whole-region build is byte-identical.
let _placement = rng(19870219);
export function reseedPlacement(seed) { _placement = rng(seed >>> 0 || 19870219); }
// ...AND SCOPABLE PER THING (?planthash=1, 2026-08-14). While a scope is
// set, every R/rand/pick/chance draw comes from the scoped stream instead —
// buildBuildings sets one per building from its footprint centroid, so no
// building's facade picks can depend on any other building's draw count.
// This is the facade half of the divergence the reseed cannot reach: the
// A/B pixels showed a wall at Sensoryscape re-picking granite-to-render
// when a `con` flag 1.4 km away changed one building's own consumption.
// With no scope set (the default, and always with the flag off), R IS the
// placement stream, byte for byte.
let _scoped = null;
export function scopeDraws(fn) { _scoped = fn; }
export const R = () => (_scoped || _placement)();
export const rand = (a, b) => a + R() * (b - a);
export const pick = (arr) => arr[(R() * arr.length) | 0];
export const chance = (p) => R() < p;
export const hex = (n) => '#' + n.toString(16).padStart(6, '0');

export const PAL = {
  sun:       0xffd4a4,
  skyTop:    0x3f76ab,
  skyMid:    0x93b9d2,
  skyHaze:   0xdcd3bd,
  cloud:     0xfff3e0,
  asphalt:   0x4d4f54,
  paver:     0xb0a898,
  kerb:      0xb5b0a4,
  conc:      0xa8a49b,
  trim:      0xd8d2c3,
  glassBlue: 0x5c7183,
  glassGrey: 0x6a727a,
  // Angsana foliage in full Singapore sun, not woodland shade. The old values
  // were a dark olive that went to near black on any surface the sun was not
  // hitting, and since the leaf cards are double-sided, that is half of every
  // crown seen from the pavement underneath it.
  leafDark:  0x3b5227,
  leafMid:   0x63823a,
  leafLight: 0x96a852,
  trunk:     0x53483d,
  yellow:    0xd8b44a,
};

function cvs(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}
function finish(c, repeat, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
// EVERY TEXTURE HAS ITS OWN RANDOM STREAM since 2026-07-29. They all used to
// draw from the module-level `R` -- the same seeded sequence every placement
// decision in city.js, street.js, actors.js, shopfront.js, markings.js,
// wayfind.js and sgdetail.js consumes -- so retouching ANY texture reshuffled
// street furniture across two districts (measured: T1 10 -> 13 from a granite
// panel, findings 1.5km from the building). texGranitePanel wrote the rule; it
// now applies to the whole file: a texture must not be able to move a bus
// stop. Parameterised textures fold their arguments into the seed so variants
// do not clone each other's mottling. Cutting the file over cost the sanctioned
// ONE-TIME world reshuffle recorded in NEXT.md.
function grain(x, n, amt, size, rr = R) {
  for (let i = 0; i < n; i++) {
    const g = (rr() * 2 - 1) * amt;
    x.fillStyle = `rgba(${g > 0 ? 255 : 0},${g > 0 ? 255 : 0},${g > 0 ? 255 : 0},${Math.abs(g) / 255})`;
    x.fillRect((rr() * size) | 0, (rr() * size) | 0, 1 + ((rr() * 2) | 0), 1 + ((rr() * 2) | 0));
  }
}

export function texAsphalt(base = PAL.asphalt) {
  // The base parameter exists for the red bus lane: TINTING the grey asphalt
  // map can never read as red paint, because the tint multiplies a ~30%-
  // luminance texture -- 0xd97a55 came out near-black. Red asphalt has to be
  // DRAWN red.
  const r2 = rng(0x61737068 ^ base), rand = (a, b) => a + r2() * (b - a);   // "asph"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
  for (let i = 0; i < 5200; i++) {
    const v = rand(-24, 24);
    x.fillStyle = `rgba(${128 + v},${128 + v},${130 + v},${rand(0.05, 0.24)})`;
    x.fillRect(rand(0, S), rand(0, S), rand(1, 2.6), rand(1, 2.6));
  }
  for (let i = 0; i < 8; i++) {
    x.strokeStyle = `rgba(28,28,30,${rand(0.15, 0.4)})`;
    x.lineWidth = rand(0.8, 2.4); x.beginPath();
    let px = rand(0, S), py = rand(0, S); x.moveTo(px, py);
    for (let k = 0; k < 6; k++) { px += rand(-40, 40); py += rand(-40, 40); x.lineTo(px, py); }
    x.stroke();
  }
  return finish(c, [30, 30]);
}

// Orchard's pavement is the big patterned granite-look slab, not small pavers
// ORCHARD ROAD'S FOOTPATH IS GRANITE, and it is specified.
//
// URA's Orchard Road Mall Paving Design Guidelines (Annex D), researched
// 2026-07-29: the base paving is FLAMED MID-GREY GRANITE, "654 Medium Grey",
// laid as CONTINUOUS 450mm STRIPS RUNNING PARALLEL TO THE KERB, in random
// lengths of 300, 600 and 900mm with the joints of adjacent rows offset by
// 150mm. Contrast bands in flamed black or white granite reinforce the rhythm
// of the tree spacing. The Somerset stretch east of Grange Road drops the
// contrast banding and is mid-grey throughout.
//
// This was a generic 3x3 slab of warm beige pavers -- the wrong material, the
// wrong colour, the wrong module and the wrong direction. On the widest
// pavement in Singapore that is a lot of screen area to get wrong.
//
// One tile is 1.8m x 1.8m: four 450mm strips across, with the long axis of the
// strips running along the tile so the run follows the kerb when it is mapped.
export function texPaving() {
  const r2 = rng(0x70617669), rand = (a, b) => a + r2() * (b - a);   // "pavi"
  const S = 256, [c, x] = cvs(S);
  // flamed mid-grey granite: cool, not the warm beige this used to be
  x.fillStyle = '#8e8d88'; x.fillRect(0, 0, S, S);
  const rows = 4, rh = S / rows;                 // four 450mm strips per 1.8m tile
  for (let r0 = 0; r0 < rows; r0++) {
    // random 300/600/900 lengths, adjacent rows offset by 150mm (S/12)
    let u = -(r0 % 2) * (S / 12);
    while (u < S) {
      const L = [S / 6, S / 3, S / 2][(r2() * 3) | 0];   // 300 / 600 / 900mm
      const v = rand(-9, 8);
      x.fillStyle = `rgb(${142 + v},${141 + v},${136 + v})`;
      x.fillRect(u + 0.9, r0 * rh + 0.9, L - 1.8, rh - 1.8);
      // flamed finish: fine light speckle, no polish
      for (let k = 0; k < 90; k++) {
        const g2 = rand(-26, 22);
        x.fillStyle = `rgba(${150 + g2},${149 + g2},${144 + g2},${rand(0.15, 0.5)})`;
        x.fillRect(u + rand(2, Math.max(3, L - 3)), r0 * rh + rand(2, rh - 3),
                   rand(1, 2.2), rand(1, 2.2));
      }
      u += L;
    }
  }
  grain(x, 1500, 12, S, r2);
  return finish(c, [1, 1]);
}

// the old generic paver, kept for the unit-paving surface OSM tags on service
// roads and lanes, which is small block paving and not Orchard's granite
export function texPaverBlock() {
  const r2 = rng(0x70766b31), rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(PAL.paver); x.fillRect(0, 0, S, S);
  const n = 3, s = S / n;
  for (let iy = 0; iy < n; iy++) for (let ix = 0; ix < n; ix++) {
    const v = rand(-13, 11);
    x.fillStyle = `rgb(${178 + v},${170 + v},${154 + v})`;
    x.fillRect(ix * s + 1.6, iy * s + 1.6, s - 3.2, s - 3.2);
    // speckle, so it reads as aggregate rather than paint
    for (let k = 0; k < 260; k++) {
      const g = rand(-30, 26);
      x.fillStyle = `rgba(${170 + g},${163 + g},${148 + g},${rand(0.2, 0.6)})`;
      x.fillRect(ix * s + rand(2, s - 3), iy * s + rand(2, s - 3), rand(1, 2.4), rand(1, 2.4));
    }
  }
  grain(x, 2600, 18, S, r2);
  return finish(c, [1, 1]);
}

export function texConcrete(base, dirt = 0.55) {
  const r2 = rng(0x636f6e63 ^ base ^ ((dirt * 255) | 0)), rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
  for (let i = 0; i < 24; i++) {
    const cx = rand(0, S), cy = rand(0, S), r = rand(18, 70);
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(0,0,0,${rand(0.02, 0.07) * dirt})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
  }
  for (let i = 0; i < 34; i++) {
    const w = rand(0.6, 2.6), h = rand(30, 170), sx = rand(0, S), sy = rand(0, S * 0.5);
    const g = x.createLinearGradient(0, sy, 0, sy + h);
    g.addColorStop(0, `rgba(54,48,40,${rand(0.05, 0.15) * dirt})`);
    g.addColorStop(1, 'rgba(54,48,40,0)');
    x.fillStyle = g; x.fillRect(sx, sy, w, h);
  }
  grain(x, 4800, 24, S, r2);
  return finish(c, [1, 1]);
}

// Curtain wall: horizontal spandrel bands with vertical mullions. Orchard is
// mostly made of this, so it does a lot of the recognition work.
export function texCurtain(glassHex, mullionHex, floors = 8) {
  const r2 = rng(0x63757274 ^ glassHex ^ mullionHex ^ floors), rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  const fh = S / floors;
  x.fillStyle = hex(glassHex); x.fillRect(0, 0, S, S);
  for (let f = 0; f < floors; f++) {
    // per-pane tonal variation: some catch sky, some are dark
    for (let p = 0; p < 8; p++) {
      const v = rand(-26, 30);
      x.fillStyle = `rgba(${118 + v},${138 + v},${156 + v},${rand(0.25, 0.75)})`;
      x.fillRect(p * (S / 8) + 1, f * fh + 2, S / 8 - 2, fh * 0.62);
    }
    // spandrel band under each floor line
    x.fillStyle = hex(mullionHex);
    x.fillRect(0, f * fh + fh * 0.66, S, fh * 0.30);
    // sky sheen across the upper part of the glazing
    const g = x.createLinearGradient(0, f * fh, 0, f * fh + fh * 0.62);
    g.addColorStop(0, 'rgba(232,243,251,0.52)');
    g.addColorStop(1, 'rgba(232,243,251,0.06)');
    x.fillStyle = g; x.fillRect(0, f * fh + 2, S, fh * 0.60);
  }
  x.fillStyle = hex(mullionHex);
  for (let p = 0; p <= 8; p++) x.fillRect(p * (S / 8) - 1.2, 0, 2.4, S);
  return finish(c, [1, 1]);
}

// Ground floor: tall glazing with a warm interior behind it. This is the band
// the eye actually reads at street level.
export function texShopfront() {
  const r2 = rng(0x73686f70), rand = (a, b) => a + r2() * (b - a);   // "shop"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = '#2f3438'; x.fillRect(0, 0, S, S);
  const bays = 6, bw = S / bays;
  for (let i = 0; i < bays; i++) {
    const warm = rand(0, 1);
    const col = warm > 0.72 ? [232, 214, 178] : warm > 0.4 ? [206, 200, 190] : [176, 182, 186];
    x.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    x.fillRect(i * bw + 3, 16, bw - 6, S - 62);
    // interior depth: a darker band at the back of the shop
    x.fillStyle = `rgba(40,38,34,${rand(0.18, 0.4)})`;
    x.fillRect(i * bw + 3, 16, bw - 6, rand(20, 60));
    // reflection streak on the glass
    const g = x.createLinearGradient(i * bw, 0, i * bw + bw, S);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    g.addColorStop(1, 'rgba(255,255,255,0.14)');
    x.fillStyle = g; x.fillRect(i * bw + 3, 16, bw - 6, S - 62);
    // mullion
    x.fillStyle = '#23272a'; x.fillRect(i * bw - 2, 0, 4, S);
  }
  x.fillStyle = '#3a3f43'; x.fillRect(0, 0, S, 16);        // fascia
  x.fillStyle = '#5b5554'; x.fillRect(0, S - 46, S, 46);   // plinth
  grain(x, 1800, 16, S, r2);
  return finish(c, [1, 1]);
}

// Ngee Ann City's TOWERS, at the real panel module.
//
// Sources (2026-07-28): archify.com/sg + raymondwoo.com. The complex is "built
// in concrete and totally faced with granite as a finish", and specifically
// "the 28 floors of twin towers are constructed of 3.8m by 3.2m granite
// pre-finished concrete wall panels". So the towers are the SAME African Red
// granite as the podium, not a curtain wall -- they were being drawn as pale
// grey-blue glass, which is the largest single recognition error on Orchard
// Road because this is the widest frontage on the street.
//
// One tile is 2x2 panels, i.e. 7.6m by 6.4m, and it must be mapped with
// uvMetres(mesh, 7.6, 6.4) or the module is decorative rather than real. Two
// panels rather than one because a single-panel tile repeated up 98m of tower
// reads as a screen door: the mottling has to differ between neighbours.
export function texGranitePanel() {
  // ITS OWN RANDOM STREAM, and this is not a style choice.
  //
  // Every texture in this file draws from the module-level `R`, which is also
  // what city.js, street.js, actors.js, shopfront.js, markings.js, wayfind.js
  // and sgdetail.js use to place things. The sequence is seeded, so the world
  // is reproducible -- but only as long as nobody inserts a new consumer
  // upstream of the others. Adding this texture drew ~3,600 numbers before any
  // of them ran and shifted the entire district: T1 went 10 -> 13 with no
  // geometry near the change, and the three new findings were in Bras Basah,
  // 1.5km from the building this texture is for.
  //
  // That is a whole class of phantom regression, and it is worse than a wrong
  // number because it sends you hunting geometry that did not move -- which
  // this project has already lost half an hour to once, on the same two
  // ratchets. A texture must not be able to move a bus stop.
  const r2 = rng(0x6e676163);            // "ngac"
  const rnd = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  const H = S / 2;                       // one panel = half the tile, each way
  for (let py = 0; py < 2; py++) {
    for (let px = 0; px < 2; px++) {
      const ox = px * H, oy = py * H;
      // polished African Red: reddish-brown, and each panel a shade of its own
      // because they are pre-finished units, not a poured wall
      const t = rnd(-8, 8);
      x.fillStyle = `rgb(${118 + t},${72 + t},${59 + t})`;
      x.fillRect(ox, oy, H, H);
      // mottling both ways. Lightening flecks only, which is what this had,
      // raise the average until the tower reads pale pink against a podium of
      // the SAME stone -- and they are the same stone, so a difference that
      // large is a texture bug, not weathering.
      for (let i = 0; i < 900; i++) {
        const v = rnd(-26, 26), up = v > 0;
        x.fillStyle = up
          ? `rgba(${150 + v},${100 + v},${84 + v},${rnd(0.10, 0.34)})`
          : `rgba(${86 + v},${50 + v},${40 + v},${rnd(0.12, 0.38)})`;
        x.fillRect(ox + rnd(0, H), oy + rnd(0, H), rnd(1, 2.6), rnd(1, 2.6));
      }
      // the window: a vertical slot, 1.8m of a 3.8m panel, set into the granite
      // so it reads as a punched opening rather than glazing applied over it
      const ww = H * (1.8 / 3.8), wh = H * (2.3 / 3.2);
      const wx = ox + (H - ww) / 2, wy = oy + H * 0.16;
      x.fillStyle = 'rgba(26,32,39,0.96)';
      x.fillRect(wx, wy, ww, wh);
      const g = x.createLinearGradient(wx, wy, wx + ww, wy + wh);
      g.addColorStop(0, 'rgba(196,214,228,0.22)');
      g.addColorStop(0.55, 'rgba(196,214,228,0.05)');
      g.addColorStop(1, 'rgba(196,214,228,0)');
      x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
      // reveal: the granite is thick, so one jamb is in shadow and the head
      // throws a line across the top of the glass
      x.fillStyle = 'rgba(58,34,26,0.5)';
      x.fillRect(wx, wy, ww * 0.16, wh);
      x.fillRect(wx, wy, ww, wh * 0.07);
    }
  }
  // panel joints, drawn last and across the whole tile: half a joint at each
  // outer edge so the seam closes against the next tile under RepeatWrapping
  x.fillStyle = 'rgba(72,44,36,0.85)';
  for (const px of [0, 1, 2]) x.fillRect(px * H - 1.5, 0, 3, S);
  for (const py of [0, 1, 2]) x.fillRect(0, py * H - 1.5, S, 3);
  return finish(c, [1, 1]);
}

// The yellow tactile paving pad at a kerb ramp: raised studs in a grid, which
// is what makes it read as tactile rather than as a painted yellow rectangle.
// Its own RNG stream, so adding it does not move anything else in the world.
// A broken road line, with the DASH carried in the texture rather than the
// geometry: painting dashes as one quad per mark put ~400,000 marks in the
// world and took P6 from 17 to 1974, so a broken line is ONE ribbon whose
// alpha map goes transparent in the gaps. One texture cycle is one mark plus
// one gap; the ribbon's v coordinate runs in units of its own width, so the
// material's repeat.y = width / (markM + gapM) makes the cycle real metres.
// Alpha-tested opaque, never `transparent: true` (the foliage rule).
// No RNG: a painted line has no mottling worth a stream.
// Dimensions belong to the CALLER — LTA gives different mark/gap per line
// type (SDRE Ch.8: centre line E 2.75/2.75, lane line B 2/4, expressway B1
// 2/10), so nothing is hardcoded here.
export function texCentreDash(markM, gapM) {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#dedad0';               // MAT.white, weathered off-white
  x.fillRect(0, 0, 8, Math.round(128 * (markM / (markM + gapM))));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Pullman Orchard's skin (research/pullman.md): dark tinted glass with a
// herringbone of thin lighter chevron stripes EMBOSSED in the panels — a
// printed texture in reality too, so a texture is the honest model. No RNG:
// the weave is a regular fabric pattern.
// SOTA's green curtain (research/sota.md): vertical ribbons of climbing
// plants at deliberately irregular width and spacing — WOHA: "inspired by a
// musical score" — ~51% coverage over pale concrete. Own RNG stream.
export function texSotaRibbons() {
  const S = 256, [c, x] = cvs(S);
  const r2 = rng(0x736f7461);            // "sota"
  x.fillStyle = '#e5e7e3'; x.fillRect(0, 0, S, S);
  const greens = ['#90a151', '#7d9147', '#a8b95e', '#5c6f33'];
  let u = 0;
  while (u < S) {
    const w = 8 + r2() * 34;             // 1-4m at ~10m tile
    if (r2() < 0.62) {
      x.fillStyle = greens[(r2() * greens.length) | 0];
      x.fillRect(u, 0, w, S);
      // ragged strand edges so the band reads as growth, not paint
      x.fillStyle = 'rgba(229,231,227,0.5)';
      for (let yy = 0; yy < S; yy += 9) {
        if (r2() < 0.4) x.fillRect(u + w - 3, yy, 3, 5);
        if (r2() < 0.4) x.fillRect(u, yy + 4, 2, 5);
      }
    }
    u += w + 4 + r2() * 18;              // 0.5-2.5m gaps
  }
  return finish(c);
}

export function texChevron() {
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = '#232930'; x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(168,182,194,0.42)'; x.lineWidth = 3;
  const col = 32;
  for (let cx0 = 0; cx0 < S; cx0 += col) {
    const dir = (cx0 / col) % 2 ? 1 : -1;
    for (let yy = -col; yy < S + col; yy += col) {
      x.beginPath();
      x.moveTo(cx0, yy + (dir > 0 ? 0 : col));
      x.lineTo(cx0 + col, yy + (dir > 0 ? col : 0));
      x.stroke();
    }
  }
  // faint panel joints so the box reads as curtain wall, not vinyl
  x.strokeStyle = 'rgba(12,14,16,0.55)'; x.lineWidth = 2;
  for (let p = 0; p <= S; p += 64) {
    x.beginPath(); x.moveTo(p, 0); x.lineTo(p, S); x.stroke();
    x.beginPath(); x.moveTo(0, p); x.lineTo(S, p); x.stroke();
  }
  return finish(c);
}

export function texTactile() {
  const S = 128, [c, x] = cvs(S);
  const r2 = rng(0x74616374);            // "tact"
  x.fillStyle = '#d8a52a'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 700; i++) {
    const v = (r2() * 2 - 1) * 16;
    x.fillStyle = `rgba(${216 + v},${165 + v},${42 + v},${0.2 + r2() * 0.3})`;
    x.fillRect(r2() * S, r2() * S, 1 + r2() * 2, 1 + r2() * 2);
  }
  const n = 6, sp = S / n;
  for (let iy = 0; iy < n; iy++)
    for (let ix = 0; ix < n; ix++) {
      const cx2 = ix * sp + sp / 2, cy = iy * sp + sp / 2, rad = sp * 0.27;
      const g = x.createRadialGradient(cx2 - rad * 0.3, cy - rad * 0.3, 0, cx2, cy, rad);
      g.addColorStop(0, '#f2c65a');
      g.addColorStop(1, '#a97c14');
      x.fillStyle = g;
      x.beginPath(); x.arc(cx2, cy, rad, 0, Math.PI * 2); x.fill();
    }
  return finish(c, [1, 1]);
}

// Marina Reservoir: fresh water behind a barrage, so it is green-grey and
// fairly still rather than open-sea blue. Ripple is drawn as overlapping
// low-contrast bands rather than noise, because noise at 24m to a tile just
// averages to flat colour at any distance you would actually see it from.
// Its own RNG stream so adding it moves nothing else in the world.
export function texWater() {
  const S = 256, [c, x] = cvs(S);
  const r2 = rng(0x77617472);            // "watr"
  x.fillStyle = '#5f7b78'; x.fillRect(0, 0, S, S);
  // broad swell: long shallow bands at a slight angle
  for (let i = 0; i < 26; i++) {
    const y = r2() * S, h = 3 + r2() * 16;
    const g = x.createLinearGradient(0, y, 0, y + h);
    const a = 0.05 + r2() * 0.13;
    g.addColorStop(0, `rgba(196,214,210,0)`);
    g.addColorStop(0.5, `rgba(196,214,210,${a})`);
    g.addColorStop(1, `rgba(196,214,210,0)`);
    x.fillStyle = g;
    x.save(); x.translate(S / 2, S / 2); x.rotate(0.16); x.translate(-S / 2, -S / 2);
    x.fillRect(-S, y, S * 3, h);
    x.restore();
  }
  // darker troughs between them
  for (let i = 0; i < 18; i++) {
    const y = r2() * S, h = 2 + r2() * 9;
    x.fillStyle = `rgba(38,58,58,${0.04 + r2() * 0.09})`;
    x.save(); x.translate(S / 2, S / 2); x.rotate(0.16); x.translate(-S / 2, -S / 2);
    x.fillRect(-S, y, S * 3, h);
    x.restore();
  }
  // a few short glints, so a still surface still has something moving on it
  for (let i = 0; i < 260; i++) {
    x.fillStyle = `rgba(236,246,244,${0.06 + r2() * 0.16})`;
    x.fillRect(r2() * S, r2() * S, 2 + r2() * 9, 1);
  }
  return finish(c, [1, 1]);
}

// dark polished granite with narrow vertical window slots (Ngee Ann City)
export function texGranite() {
  // Ngee Ann City is clad in "African Red" polished granite, which reads far
  // redder than the brown-grey I first used.
  const r2 = rng(0x6772616e), rand = (a, b) => a + r2() * (b - a);   // "gran"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = '#7d4f42'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 4200; i++) {
    const v = rand(-20, 22);
    x.fillStyle = `rgba(${142 + v},${94 + v},${78 + v},${rand(0.15, 0.5)})`;
    x.fillRect(rand(0, S), rand(0, S), rand(1, 2.4), rand(1, 2.4));
  }
  const bays = 9, bw = S / bays;
  for (let i = 0; i < bays; i++) {
    x.fillStyle = 'rgba(38,44,50,0.86)';
    x.fillRect(i * bw + bw * 0.30, 0, bw * 0.40, S);
    const g = x.createLinearGradient(i * bw, 0, i * bw + bw, 0);
    g.addColorStop(0, 'rgba(198,214,226,0.16)');
    g.addColorStop(1, 'rgba(198,214,226,0)');
    x.fillStyle = g; x.fillRect(i * bw + bw * 0.30, 0, bw * 0.40, S);
  }
  for (let f = 0; f < 8; f++) {
    x.fillStyle = 'rgba(104,68,58,0.9)';
    x.fillRect(0, f * (S / 8) - 2, S, 4);
  }
  return finish(c, [1, 1]);
}

// smooth tower glazing, lighter and bluer than the podium curtain wall
export function texTowerGlass() {
  const r2 = rng(0x746f7772), rand = (a, b) => a + r2() * (b - a);   // "towr"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = '#8ea6b8'; x.fillRect(0, 0, S, S);
  const floors = 12, fh = S / floors;
  for (let f = 0; f < floors; f++) {
    for (let p = 0; p < 10; p++) {
      const v = rand(-24, 26);
      x.fillStyle = `rgba(${132 + v},${154 + v},${172 + v},${rand(0.3, 0.8)})`;
      x.fillRect(p * (S / 10) + 1, f * fh + 1, S / 10 - 2, fh * 0.72);
    }
    x.fillStyle = '#6b757e';
    x.fillRect(0, f * fh + fh * 0.76, S, fh * 0.22);
    const g = x.createLinearGradient(0, f * fh, 0, f * fh + fh * 0.72);
    g.addColorStop(0, 'rgba(236,245,252,0.42)');
    g.addColorStop(1, 'rgba(236,245,252,0.04)');
    x.fillStyle = g; x.fillRect(0, f * fh + 1, S, fh * 0.70);
  }
  for (let p = 0; p <= 10; p++) { x.fillStyle = '#767f88'; x.fillRect(p * (S / 10) - 1, 0, 2, S); }
  return finish(c, [1, 1]);
}

// 1970s-80s Orchard: punched window openings in a concrete frame, no curtain wall
export function texPunched(base) {
  const r2 = rng(0x70756e63 ^ base), rand = (a, b) => a + r2() * (b - a);   // "punc"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
  for (let i = 0; i < 3600; i++) {
    const v = rand(-18, 16);
    x.fillStyle = `rgba(${168 + v},${160 + v},${146 + v},${rand(0.12, 0.4)})`;
    x.fillRect(rand(0, S), rand(0, S), rand(1, 2.2), rand(1, 2.2));
  }
  const cols = 7, rows = 8, cw = S / cols, rh = S / rows;
  for (let r = 0; r < rows; r++) {
    for (let cN = 0; cN < cols; cN++) {
      const t = rand(0, 1);
      x.fillStyle = t > 0.8 ? '#8d9aa2' : t > 0.45 ? '#4d565e' : '#39424a';
      x.fillRect(cN * cw + cw * 0.22, r * rh + rh * 0.22, cw * 0.56, rh * 0.46);
      // reveal shadow at the top of each opening
      x.fillStyle = 'rgba(24,26,28,0.42)';
      x.fillRect(cN * cw + cw * 0.22, r * rh + rh * 0.22, cw * 0.56, rh * 0.09);
    }
    // spandrel band
    x.fillStyle = 'rgba(150,142,128,0.55)';
    x.fillRect(0, r * rh + rh * 0.74, S, rh * 0.16);
  }
  grain(x, 2400, 18, S, r2);
  return finish(c, [1, 1]);
}

// balconied residential: recessed slots with a rail line
export function texBalcony(base) {
  const r2 = rng(0x62616c63 ^ base);                                 // "balc"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
  const rows = 9, rh = S / rows, cols = 5, cw = S / cols;
  for (let r = 0; r < rows; r++) {
    for (let cN = 0; cN < cols; cN++) {
      x.fillStyle = 'rgba(46,52,58,0.72)';
      x.fillRect(cN * cw + cw * 0.14, r * rh + rh * 0.16, cw * 0.72, rh * 0.5);
      x.fillStyle = 'rgba(226,222,210,0.9)';
      x.fillRect(cN * cw + cw * 0.14, r * rh + rh * 0.52, cw * 0.72, rh * 0.1);
    }
    x.fillStyle = 'rgba(206,200,186,0.85)';
    x.fillRect(0, r * rh + rh * 0.66, S, rh * 0.2);
  }
  grain(x, 2000, 16, S, r2);
  return finish(c, [1, 1]);
}

// Shophouse frontage: painted plaster, tall shuttered windows, a moulded band
export function texShophouse(base) {
  const r2 = rng(0x73687068 ^ base), rand = (a, b) => a + r2() * (b - a);   // "shph"
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const v = rand(-14, 12);
    x.fillStyle = `rgba(${210 + v},${204 + v},${190 + v},${rand(0.08, 0.3)})`;
    x.fillRect(rand(0, S), rand(0, S), rand(1, 2.4), rand(1, 2.4));
  }
  const floors = 3, fh = S / floors, bays = 3, bw = S / bays;
  for (let f = 0; f < floors; f++) {
    for (let bN = 0; bN < bays; bN++) {
      // tall window opening with timber shutters either side
      x.fillStyle = '#3b4148';
      x.fillRect(bN * bw + bw * 0.3, f * fh + fh * 0.18, bw * 0.4, fh * 0.5);
      x.fillStyle = 'rgba(86,104,74,0.92)';
      x.fillRect(bN * bw + bw * 0.19, f * fh + fh * 0.18, bw * 0.1, fh * 0.5);
      x.fillRect(bN * bw + bw * 0.71, f * fh + fh * 0.18, bw * 0.1, fh * 0.5);
      // lintel
      x.fillStyle = 'rgba(246,242,232,0.85)';
      x.fillRect(bN * bw + bw * 0.16, f * fh + fh * 0.12, bw * 0.68, fh * 0.06);
    }
    // moulded string course between floors
    x.fillStyle = 'rgba(248,244,234,0.8)';
    x.fillRect(0, f * fh + fh * 0.78, S, fh * 0.09);
    x.fillStyle = 'rgba(150,142,128,0.35)';
    x.fillRect(0, f * fh + fh * 0.87, S, fh * 0.03);
  }
  grain(x, 1500, 14, S, r2);
  return finish(c, [1, 1]);
}

// The Centrepoint's street-facing feature panel: red gridded cladding about
// three storeys tall with an ELLIPTICAL window cut into it -- the one element
// people remember the building by. Research 2026-07-28 (report in NEXT.md).
// Drawn as ONE tile spanning the whole panel; map it with uvMetres(mesh, w, h)
// of the slab it skins or the ellipse repeats like wallpaper.
export function texCentrepointPanel() {
  const r2 = rng(0x63747074);                                        // "ctpt"
  const S = 512, [c, x] = cvs(S);
  // red cladding, gently mottled so it reads as panels rather than paint
  x.fillStyle = '#a63428'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const v = (r2() * 2 - 1) * 14;
    x.fillStyle = `rgba(${166 + v},${52 + v},${40 + v},${0.15 + r2() * 0.3})`;
    x.fillRect(r2() * S, r2() * S, 1 + r2() * 2.4, 1 + r2() * 2.4);
  }
  // cladding grid: the strong rectilinear seam pattern
  x.fillStyle = 'rgba(64,20,16,0.75)';
  const gx = 8, gy = 6;
  for (let i = 0; i <= gx; i++) x.fillRect(i * (S / gx) - 1.5, 0, 3, S);
  for (let j = 0; j <= gy; j++) x.fillRect(0, j * (S / gy) - 1.5, S, 3);
  // the elliptical window, upper-centre, tinted glass with a sky sheen
  const ex = S * 0.5, ey = S * 0.42, rx = S * 0.30, ry = S * 0.24;
  x.fillStyle = '#232a31';
  x.beginPath(); x.ellipse(ex, ey, rx + 5, ry + 5, 0, 0, Math.PI * 2); x.fill();  // reveal
  x.fillStyle = '#2f3d4a';
  x.beginPath(); x.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); x.fill();
  const g = x.createLinearGradient(ex - rx, ey - ry, ex + rx, ey + ry);
  g.addColorStop(0, 'rgba(214,230,242,0.5)');
  g.addColorStop(0.55, 'rgba(214,230,242,0.08)');
  g.addColorStop(1, 'rgba(214,230,242,0)');
  x.fillStyle = g;
  x.beginPath(); x.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); x.fill();
  // mullions across the ellipse, so it reads as glazing not a hole
  x.fillStyle = 'rgba(30,34,38,0.8)';
  for (let i = -2; i <= 2; i++) x.fillRect(ex + i * (rx / 2.5) - 1.5, ey - ry, 3, ry * 2);
  x.fillRect(ex - rx, ey - 1.5, rx * 2, 3);
  return finish(c, [1, 1]);
}

// MacDonald House, 1949: sand-faced red brick from Alexandra Brickworks over a
// concrete frame, with a strict grid of PUNCHED windows in white surrounds and
// projecting sills. Researched 2026-07-29 -- NHB calls it the "iconic red
// facade with white window frames", and the wall is brick-DOMINANT, so the
// tile is mostly brick with one window in it rather than a window wall.
// One tile = one structural bay: 3.9m wide by 3.5m floor to floor.
export function texRedBrick() {
  const r2 = rng(0x6d63646e);                                        // "mcdn"
  const S = 256, [c, x] = cvs(S);
  // brick field: medium-deep red with darker mottling, thin flush joints
  x.fillStyle = '#9d4a38'; x.fillRect(0, 0, S, S);
  const bh = S / 16, bw = S / 7;
  for (let row = 0; row < 16; row++) {
    for (let col = -1; col < 8; col++) {
      const off = (row % 2) * bw * 0.5;
      const v = (r2() * 2 - 1) * 16;
      x.fillStyle = `rgb(${157 + v},${74 + v * 0.6},${56 + v * 0.5})`;
      x.fillRect(col * bw + off + 0.7, row * bh + 0.7, bw - 1.4, bh - 1.4);
    }
  }
  // the window: punched, white surround and a projecting sill
  const ww = S * 0.34, wh = S * 0.46;
  const wx = (S - ww) / 2, wy = S * 0.20;
  x.fillStyle = '#efece4';                                   // surround
  x.fillRect(wx - 5, wy - 5, ww + 10, wh + 10);
  x.fillStyle = '#2f3841';                                   // glass, deep reveal
  x.fillRect(wx, wy, ww, wh);
  const g = x.createLinearGradient(wx, wy, wx + ww, wy + wh);
  g.addColorStop(0, 'rgba(206,222,236,0.42)');
  g.addColorStop(1, 'rgba(206,222,236,0.03)');
  x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
  x.fillStyle = 'rgba(18,22,26,0.45)';                       // reveal shadow, head
  x.fillRect(wx, wy, ww, wh * 0.10);
  x.fillStyle = '#efece4';                                   // glazing bars
  x.fillRect(wx + ww / 2 - 1.4, wy, 2.8, wh);
  x.fillRect(wx, wy + wh * 0.47, ww, 2.4);
  x.fillStyle = '#f6f3ec';                                   // projecting sill
  x.fillRect(wx - 8, wy + wh + 4, ww + 16, 7);
  x.fillStyle = 'rgba(60,30,24,0.35)';                       // its shadow
  x.fillRect(wx - 8, wy + wh + 11, ww + 16, 4);
  grain(x, 1400, 12, S, r2);
  return finish(c, [1, 1]);
}

// PERANAKAN PLACE, 180 Orchard Road: the upper storey of the c.1902 Chinese
// Baroque terrace. Researched 2026-07-29 against URA's Conservation Portal,
// NLB Infopedia and three DATED Wikimedia photographs (5 Apr 2024) read for
// the current paint, because the prose sources disagree and most of the
// repaint history on Wikipedia is uncited.
//
// One tile is ONE BAY: two round-arched windows with sunburst fanlights and
// cream louvred shutters, under a blush-pink wall, between fluted pilasters.
// `white` swaps to the Emerald Hill colourway -- the frontage is pink and the
// units running up the pedestrianised lane are near-white, which is a fact
// about this terrace and not a variation worth randomising.
export function texPeranakan(white = false) {
  const r2 = rng(0x7065726e ^ (white ? 1 : 0));                      // "pern"
  const S = 256, [c, x] = cvs(S);
  const wall = white ? '#efe9df' : '#e3cdbd';                 // blush pink / near-white
  const cream = '#f2ece0', sage = '#93a07a', shutter = '#ede9dc';
  x.fillStyle = wall; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 1600; i++) {
    const v = (r2() * 2 - 1) * 9;
    x.fillStyle = `rgba(${226 + v},${205 + v},${189 + v},${0.10 + r2() * 0.18})`;
    x.fillRect(r2() * S, r2() * S, 1 + r2() * 2, 1 + r2() * 2);
  }
  // two round-arched windows
  for (const cx2 of [S * 0.30, S * 0.70]) {
    const ww = S * 0.22, wh = S * 0.50, wy = S * 0.26;
    const rr = ww / 2;
    // sage archivolt, drawn as a fatter arch behind the opening
    x.fillStyle = sage;
    x.beginPath();
    x.arc(cx2, wy + rr, rr + 5, Math.PI, 0); x.lineTo(cx2 + rr + 5, wy + wh);
    x.lineTo(cx2 - rr - 5, wy + wh); x.closePath(); x.fill();
    // cream reveal
    x.fillStyle = cream;
    x.beginPath();
    x.arc(cx2, wy + rr, rr + 1.5, Math.PI, 0); x.lineTo(cx2 + rr + 1.5, wy + wh);
    x.lineTo(cx2 - rr - 1.5, wy + wh); x.closePath(); x.fill();
    // dark sash behind
    x.fillStyle = '#4a3126';
    x.beginPath();
    x.arc(cx2, wy + rr, rr, Math.PI, 0); x.lineTo(cx2 + rr, wy + wh);
    x.lineTo(cx2 - rr, wy + wh); x.closePath(); x.fill();
    // the SUNBURST FANLIGHT in the arch head: white bars radiating from the
    // springing, which is the detail that makes it read as 1902 and not as a
    // plain arched window
    x.strokeStyle = '#ffffff'; x.lineWidth = 1.6;
    for (let k = 0; k <= 6; k++) {
      const a = Math.PI + (k / 6) * Math.PI;
      x.beginPath(); x.moveTo(cx2, wy + rr);
      x.lineTo(cx2 + Math.cos(a) * rr, wy + rr + Math.sin(a) * rr); x.stroke();
    }
    x.beginPath(); x.arc(cx2, wy + rr, rr * 0.5, Math.PI, 0); x.stroke();
    // cream louvred shutters, hung outside, one half-open
    x.fillStyle = shutter;
    const sw2 = ww * 0.42;
    x.fillRect(cx2 - rr - 1, wy + rr, sw2, wh - rr);
    x.fillRect(cx2 + rr + 1 - sw2, wy + rr, sw2, wh - rr);
    x.strokeStyle = 'rgba(120,116,102,0.55)'; x.lineWidth = 1;
    for (let ly = wy + rr + 3; ly < wy + wh - 2; ly += 3.4) {
      x.beginPath(); x.moveTo(cx2 - rr - 1, ly); x.lineTo(cx2 - rr - 1 + sw2, ly); x.stroke();
      x.beginPath(); x.moveTo(cx2 + rr + 1 - sw2, ly); x.lineTo(cx2 + rr + 1, ly); x.stroke();
    }
    // projecting sage sill
    x.fillStyle = sage; x.fillRect(cx2 - rr - 7, wy + wh, (rr + 7) * 2, 6);
  }
  // full-height fluted pilasters at the party walls
  x.fillStyle = cream;
  x.fillRect(0, 0, S * 0.085, S); x.fillRect(S * 0.915, 0, S * 0.085, S);
  x.strokeStyle = 'rgba(150,142,124,0.5)'; x.lineWidth = 1;
  for (let k = 1; k < 4; k++) {
    for (const px of [S * 0.085 * k / 4, S * 0.915 + S * 0.085 * k / 4]) {
      x.beginPath(); x.moveTo(px, 0); x.lineTo(px, S); x.stroke();
    }
  }
  // the moulded cornice on oval dentils, the strongest horizontal here
  x.fillStyle = cream; x.fillRect(0, S * 0.855, S, S * 0.075);
  x.fillStyle = sage; x.fillRect(0, S * 0.855, S, S * 0.016);
  x.fillStyle = 'rgba(120,128,104,0.75)';
  for (let k = 0; k < 14; k++) x.fillRect(k * (S / 14) + 3, S * 0.822, S / 14 - 6, S * 0.030);
  grain(x, 900, 10, S, r2);
  return finish(c, [1, 1]);
}

export function texLeaves() {
  const r2 = rng(0x6c656166);                                        // "leaf"
  const rand = (a, b) => a + r2() * (b - a);
  const pick = (arr) => arr[(r2() * arr.length) | 0];
  const S = 128, [c, x] = cvs(S);
  x.clearRect(0, 0, S, S);
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(58,80,38,0.85)');
  g.addColorStop(0.7, 'rgba(58,80,38,0.34)');
  g.addColorStop(1, 'rgba(58,80,38,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const cols = [PAL.leafDark, PAL.leafDark, PAL.leafMid, PAL.leafMid, PAL.leafLight];
  for (let i = 0; i < 460; i++) {
    const px = rand(0, S), py = rand(0, S);
    const d = Math.hypot(px - S / 2, py - S / 2) / (S / 2);
    if (d > 0.99 || r2() < d * d * 0.9) continue;
    x.save(); x.translate(px, py); x.rotate(rand(0, Math.PI * 2));
    x.fillStyle = hex(pick(cols));
    x.globalAlpha = rand(0.5, 1);
    x.beginPath(); x.ellipse(0, 0, rand(2.6, 7), rand(1.0, 2.1), 0, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  return finish(c, null);
}

export function texAO() {
  const S = 128, [c, x] = cvs(S);
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.52)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.2)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return finish(c, null, false);
}

// ---------------------------------------------------------------------------
// Sign atlas
//
// Every shopfront and building name used to be its own 512x128 canvas texture,
// which meant its own material, which meant its own draw call: 992 shop signs
// and 266 building names put ~350 tiny meshes on screen at once for barely
// 100k triangles. Packing the labels into a few shared pages lets them all
// merge, so the whole district's signage costs a handful of draws.
//
// Text only, neutral typeface: this labels a place the way a map labels it.
const PAGE = 2048, CELL_W = 256, CELL_H = 64;
const COLS = PAGE / CELL_W, ROWS = PAGE / CELL_H;   // 8 x 32 = 256 labels/page

export class SignAtlas {
  constructor(THREE) {
    this.THREE = THREE;
    this.pages = [];
    this.slot = COLS * ROWS;   // force a new page on first add
    this.map = new Map();
  }

  _newPage() {
    const c = document.createElement('canvas');
    c.width = PAGE; c.height = PAGE;
    // willReadFrequently: the label audit reads these cells back to check the
    // text was actually drawn, and Chrome warns (and slows) without it.
    const x = c.getContext('2d', { willReadFrequently: true });
    // The page used to be filled #101010. It is left TRANSPARENT now: every
    // signed cell paints its own opaque background, and a cell that wants no
    // plaque (see add()) needs the page under it to be clear rather than black.
    x.clearRect(0, 0, PAGE, PAGE);
    const t = new this.THREE.CanvasTexture(c);
    t.colorSpace = this.THREE.SRGBColorSpace;
    t.anisotropy = 4;
    // KEEP THIS CANVAS. main.js frees every texture's 2D backing store after
    // the warm spin, which is safe for a texture that is uploaded once — and
    // NOT for this one: an atlas page is written to by add() at any point in
    // the build and re-uploaded, so a freed page comes back as a 1x1 blank.
    // Measured 2026-08-05: releasing it made "DRAGON'S TEETH GATE VIEWPOINT"
    // disappear from the headland golden frame entirely.
    t.userData.keepCanvas = true;
    const mat = new this.THREE.MeshStandardMaterial({
      map: t, roughness: 0.5, emissive: 0x191919, emissiveIntensity: 0.4,
    });
    const page = { c, x, t, mat };
    this.pages.push(page);
    this.slot = 0;
    return page;
  }

  // returns { mat, u0, v0, u1, v1 } for a label, drawing it if new
  add(label, bg, fg) {
    const key = label + '|' + bg + '|' + fg;
    if (this.map.has(key)) return this.map.get(key);
    if (this.slot >= COLS * ROWS) this._newPage();
    const page = this.pages[this.pages.length - 1];
    const i = this.slot++;
    const cx = (i % COLS) * CELL_W, cy = Math.floor(i / COLS) * CELL_H;

    const x = page.x;
    x.save();
    x.beginPath(); x.rect(cx, cy, CELL_W, CELL_H); x.clip();
    // A NULL BACKGROUND MEANS NO PLAQUE — text only, on transparency.
    //
    // The floating place names were drawn on a #12181c panel, which is right
    // for a sign bolted to a facade and wrong for a name hanging in the air:
    // from 87m the text is 6-16% of the cell's pixels, so a beach label read as
    // a SOLID BLACK RECTANGLE floating over Tanjong's lagoon. Measured, not
    // assumed — the atlas cells were read back pixel by pixel and all 67 have
    // their text; the plaque was simply swallowing it at distance.
    //
    // Text alone needs its own legibility, because it now sits over sky, sea
    // and sand in turn: a dark stroke under the fill gives it an edge on any of
    // them, which is what every map label in the world does.
    if (bg) {
      x.fillStyle = bg; x.fillRect(cx, cy, CELL_W, CELL_H);
      x.fillStyle = 'rgba(255,255,255,0.10)'; x.fillRect(cx, cy, CELL_W, 3);
    } else {
      // a soft rounded pill, not a plaque and not nothing. Text alone vanishes
      // against a bright sky at range; a 55%-opaque pill holds the name legible
      // without punching a hole in the view. The corners are rounded because a
      // hard rectangle in the air is what read as a slab in the first place.
      x.clearRect(cx, cy, CELL_W, CELL_H);
      const r = 13, ix = cx + 5, iy = cy + 7, iw = CELL_W - 10, ih = CELL_H - 14;
      x.beginPath();
      x.moveTo(ix + r, iy);
      x.lineTo(ix + iw - r, iy); x.quadraticCurveTo(ix + iw, iy, ix + iw, iy + r);
      x.lineTo(ix + iw, iy + ih - r); x.quadraticCurveTo(ix + iw, iy + ih, ix + iw - r, iy + ih);
      x.lineTo(ix + r, iy + ih); x.quadraticCurveTo(ix, iy + ih, ix, iy + ih - r);
      x.lineTo(ix, iy + r); x.quadraticCurveTo(ix, iy, ix + r, iy);
      x.closePath();
      x.fillStyle = 'rgba(16,20,26,0.55)';
      x.fill();
    }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    let size = 31;
    const text = label.toUpperCase();
    do {
      x.font = `600 ${size}px ui-sans-serif, system-ui, -apple-system, Helvetica, Arial`;
      size -= 2;
    } while (x.measureText(text).width > CELL_W - 22 && size > 8);
    if (!bg) {
      x.lineJoin = 'round';
      x.lineWidth = Math.max(3, size * 0.22);
      x.strokeStyle = 'rgba(14,18,22,0.85)';
      x.strokeText(text, cx + CELL_W / 2, cy + CELL_H / 2 + 2);
    }
    x.fillStyle = fg;
    x.fillText(text, cx + CELL_W / 2, cy + CELL_H / 2 + 2);
    x.restore();

    // inset by a texel so mipmaps never bleed a neighbouring label in
    const pad = 1.0 / PAGE;
    const uv = {
      mat: page.mat,
      u0: cx / PAGE + pad, u1: (cx + CELL_W) / PAGE - pad,
      // canvas y runs down, texture v runs up
      v0: 1 - (cy + CELL_H) / PAGE + pad, v1: 1 - cy / PAGE - pad,
    };
    // THE PAGE IS DIRTY THE MOMENT A LABEL IS DRAWN ON IT.
    //
    // This used to rely on the consumer calling finish(). shopfront.js and
    // sgdetail.js do; places.js — the floating place names — never did, and it
    // adds its labels AFTER those two have already uploaded the page. So every
    // floating name sampled a texture that predated its own text and showed the
    // page's blank fill instead: a SOLID BLACK RECTANGLE hanging over Tanjong's
    // lagoon, which is how this was found. Marking it here makes the mistake
    // impossible to repeat. It costs one upload, not one per label: nothing
    // renders between adds during a build, and three.js coalesces needsUpdate.
    page.t.needsUpdate = true;
    this.map.set(key, uv);
    return uv;
  }

  // a plane carrying one label, ready to merge
  plane(w, h, uv) {
    const g = new this.THREE.PlaneGeometry(w, h);
    const a = g.attributes.uv;
    a.setXY(0, uv.u0, uv.v1); a.setXY(1, uv.u1, uv.v1);
    a.setXY(2, uv.u0, uv.v0); a.setXY(3, uv.u1, uv.v0);
    a.needsUpdate = true;
    return g;
  }

  finish() { for (const p of this.pages) p.t.needsUpdate = true; return this.pages.length; }
}

// ONE ATLAS FOR THE WHOLE WORLD.
//
// `new SignAtlas(THREE)` was called FOUR times — places.js, shopfront.js and
// twice in sgdetail.js — and each instance allocates its own 2048x2048 page on
// its first label. Measured 2026-08-05 on the phone profile: three live pages,
// 48MB of retained canvas out of a 242MB heap, against a ~206MB iOS ceiling.
// Four part-full pages instead of one or two is pure waste, and it is waste in
// the one resource this project is actually short of.
//
// Sharing is safe because the contract is per-label: add() hands back the
// MATERIAL its label landed on, and every caller uses that material rather
// than assuming the atlas has only one. Callers also share pages now, so
// fewer distinct materials means fewer draw calls, not more.
//
// RESET IS NOT OPTIONAL. The pages hold CanvasTextures and materials belonging
// to one scene; a second world build that reused them would be handing out
// materials whose textures had been disposed with the old scene — signs that
// silently draw as nothing. resetSignAtlas() is called at the top of the world
// build for exactly that reason.
let _sharedAtlas = null;
export function sharedSignAtlas(THREE) {
  if (!_sharedAtlas) _sharedAtlas = new SignAtlas(THREE);
  return _sharedAtlas;
}
export function resetSignAtlas() { _sharedAtlas = null; }

// A FACE, so a person at arm's length is a person.
//
// Drawn into the head sphere's own UV rather than added as geometry: eyes as
// instanced spheres would be two more InstancedMeshes and two more draw calls
// for something you only ever see within a few metres, and the crowd is
// already the heaviest instanced thing in the world. A map costs nothing —
// the head material is Lambert with a per-instance colour, and the instance
// colour MULTIPLIES the map, so a white field leaves every skin tone exactly
// as it was and only the features darken.
//
// Placement: three.js SphereGeometry starts phi at -X, so u = 0.25 is +Z, and
// +Z is the direction a walker faces (`heading` is atan2(vx, vz) applied as
// the mesh's Y euler). The face therefore goes at one quarter across.
export function texFace() {
  const S = 256;
  const [c, x] = cvs(S);
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, S, S);
  const cx = S * 0.25;              // +Z, the way they walk
  // v runs from the north pole down, and the sphere's middle band is where a
  // face sits; the hair cap covers the top 38% so the brow starts below it.
  // Canvas y = 0 is the top of the sphere (CanvasTexture flips, and the
  // sphere's uv.y is 1 at the north pole), and the hair cap now ends about
  // 40% down, so the brow goes just under it at 0.45.
  const eyeY = S * 0.50, mouthY = S * 0.635;
  const dx = S * 0.055;             // half the distance between the eyes
  x.fillStyle = 'rgba(34,25,20,0.95)';
  for (const s of [-1, 1]) {
    x.beginPath();
    x.ellipse(cx + s * dx, eyeY, S * 0.024, S * 0.016, 0, 0, Math.PI * 2);
    x.fill();
  }
  // brows: a shade, not a line — at riding distance a hard brow reads as a scowl
  x.fillStyle = 'rgba(58,42,32,0.50)';
  for (const s of [-1, 1]) {
    x.beginPath();
    x.ellipse(cx + s * dx, eyeY - S * 0.046, S * 0.030, S * 0.010, 0, 0, Math.PI * 2);
    x.fill();
  }
  // mouth, and a hint of shadow under the nose. Both kept light: the head is
  // 21cm across and anything bolder becomes a clown at four metres.
  x.strokeStyle = 'rgba(120,72,60,0.55)';
  x.lineWidth = Math.max(1, S * 0.008);
  x.beginPath();
  x.moveTo(cx - S * 0.032, mouthY);
  x.quadraticCurveTo(cx, mouthY + S * 0.014, cx + S * 0.032, mouthY);
  x.stroke();
  x.fillStyle = 'rgba(120,90,70,0.22)';
  x.beginPath();
  x.ellipse(cx, mouthY - S * 0.058, S * 0.014, S * 0.022, 0, 0, Math.PI * 2);
  x.fill();
  return finish(c, null);
}

// PAINTED RENDER WITH OPENINGS IN IT — and a WHITE base, which is the whole
// point of this texture existing.
//
// Sentosa Cove's villas, the Siloso beach bars and the garrison stock are all
// painted render, so they were given `renderMat`: a flat colour and no map at
// all. That was right about the finish and wrong about the result — ridden
// past, they are untextured boxes with no windows anywhere on them, which is
// most of why the Cove reads as grey blockout (owner, 2026-08-05: "alot of
// things needs to polish and more nicer").
//
// The obvious fix — put the masonry map back and tint it — was tried before
// and reverted, twice, with the reason written down: tinting MULTIPLIES, so a
// near-white tint over a dark stone map came out grey-taupe and the villas
// read as beige offices. That reasoning is correct and it is exactly why this
// texture is drawn on WHITE: white x tint IS the tint, so the wall keeps the
// surveyed colour it was given, while the openings — which are dark — stay
// dark through the same multiply. The failure mode is designed out rather
// than argued with.
//
// Openings are few and large because that is what a villa and a beach bar
// have; a curtain-wall grid here would read as an office block.
// A SHOW BUILDING IS A PAINTED SHED, AND IT WAS WEARING A VILLA'S WINDOWS.
//
// texRender below is a 6x5 opening grid, and its own comment says what it was
// sized for: "261 villas, 126 heritage, 877 small beach buildings". Universal's
// show buildings were routed to renderMat LATER and silently inherited it —
// so Revenge of the Mummy, a 6,145 m2 windowless ride shed, came out as a
// cream office block with two rows of windows, in the most recognisable place
// on the island. That is the "office park" reading the show-building pass was
// written to remove, surviving inside the fix for it.
//
// The previous attempt at this went the other way — a flat colour with no map
// at all — and was rejected, correctly, as "a blockout box". So this is not
// that: a real ride building has panel joints, a plinth, roof plant and
// service doors, and nothing else. Not blank, not fenestrated.
export function texRenderShow() {
  const r2 = rng(0x73686f77), rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, S, S);
  // PANEL JOINTS, the vertical rhythm a big clad shed actually has. Drawn on
  // white for the same reason texRender is: white x tint IS the tint, so the
  // zone colours keep working through the multiply.
  const bays = 8;
  for (let i = 1; i < bays; i++) {
    x.fillStyle = 'rgba(150,146,138,0.22)';
    x.fillRect(Math.round((i * S) / bays), 0, 1, S);
  }
  // two horizontal seams, high, where a shed's cladding changes course
  for (const fy of [0.30, 0.58]) {
    x.fillStyle = 'rgba(150,146,138,0.20)';
    x.fillRect(0, Math.round(S * fy), S, 1);
  }
  // a plinth: the dark base course every show building has where the paint
  // stops and the service level begins
  x.fillStyle = 'rgba(120,116,108,0.28)';
  x.fillRect(0, Math.round(S * 0.92), S, Math.round(S * 0.08));
  // SERVICE DOORS, not windows — the only openings on a ride shed, at ground
  // level, wide and few. This is what keeps it from reading as a blockout box.
  for (const bx of [1, 4, 6]) {
    const w = S / bays * 0.44, px = (bx * S) / bays + (S / bays - w) / 2;
    const h = S * 0.055, py = S * 0.92 - h;
    x.fillStyle = '#4a5158';
    x.fillRect(px, py, w, h);
    x.strokeStyle = 'rgba(255,255,255,0.85)';
    x.lineWidth = 1.2;
    x.strokeRect(px, py, w, h);
  }
  // the faintest dirt, same as texRender — a flat white wall is not flat
  for (let i = 0; i < 420; i++) {
    x.fillStyle = `rgba(214,210,202,${rand(0.05, 0.16)})`;
    x.fillRect(rand(0, S), rand(0, S), rand(1, 3), rand(1, 2));
  }
  // [1,1], for the reason texRender's tail spells out: the facade UVs are not
  // metres, and scaling this finer drops the detail below a pixel.
  return finish(c, [1, 1]);
}

// COURSED ASHLAR, for the Ancient Egypt show buildings.
//
// research/universal-zones.md §4 "Materials and surface", first bullet:
//   "Large-format coursed ashlar with clearly expressed joints, laid in
//    regular courses over the whole show-building wall. The joint grid *is*
//    the texture."
// and §4 opens by calling Egypt "the zone with the highest relief-per-square-
// metre in the park and the easiest to get 80% right cheaply, because it is
// one material and one grammar". This is that, and it costs no triangles —
// which matters, the hot view sits at 1666k of a 1750k budget.
//
// WHY NOT texRenderShow. That texture is right for a painted shed and it is
// what these walls had, but its joints are 0.20-0.22 alpha drawn on white.
// White survives a PALE tint; under Egypt's sampled greyed sandstone-ochre
// (#938778) a 6% darkening is invisible, and the wall reads as a flat dark
// slab with nothing on it but the 12m tile seam. Photographed head-on at
// -1201,12480 before this change: one unbroken brown mass three storeys high.
// So the joints here are drawn HARD — a wall whose whole texture is its joint
// grid cannot whisper them.
//
// Drawn on the sampled colour rather than on white, because ashlar is stone,
// not paint over stone: the tint multiply would otherwise wash the per-block
// variation out. Callers pass the zone tint as `base`.
// PARAMETERISED because brick is the same grammar at a finer course: New York
// is specified as "face brick with real coursing" (§6) and differs from Egypt's
// ashlar only in course height, block count and how hard the joint reads. One
// drawing, two stones, rather than two near-copies that drift apart.
//   courses/per  blocks in the tile          tileM  metres across the tile
//   joint        0..1, how dark the bed joint cuts
export function texAshlar(base = 0x938778, courses = 3, per = 2, tileM = 3.6, joint = 1) {
  const r2 = rng(0x6173686c ^ base ^ courses ^ (per << 8) ^ ((tileM * 10) | 0));
  const rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  const br = (base >> 16) & 255, bg = (base >> 8) & 255, bb = base & 255;
  x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
  const ch = S / courses, bw = S / per;
  for (let i = 0; i < courses; i++) {
    // ALTERNATE COURSES BREAK JOINT. Stacked perpends read as tiling; a
    // running bond is what coursed ashlar is.
    const off = (i % 2) ? bw * 0.5 : 0;
    for (let b = -1; b <= per; b++) {
      // per-block tone, kept narrow: the sampled sunlit and shaded reads are
      // only ~17 grey levels apart, so anything wider is invention.
      // NARROW. The sampled sunlit/shaded pair for Egypt's stone is only ~17
      // grey levels apart, so a wide swing is invention — and the green-only
      // `w` term is a HUE shift, which at +/-4 threw occasional mauve blocks
      // into a brown wall. Value does the work; hue barely moves.
      const v = rand(-8, 8), w = rand(-1.5, 1.5);
      x.fillStyle = `rgb(${br + v},${bg + v + w},${bb + v})`;
      x.fillRect(b * bw + off, i * ch, bw - 1, ch - 1);
    }
  }
  // THE JOINTS: a recessed shadow line with a lit arris under it, which is
  // what a chiselled bed joint does in Singapore's overhead light.
  for (let i = 0; i <= courses; i++) {
    const y = i * ch;
    x.fillStyle = `rgba(38,32,25,${0.55 * joint})`; x.fillRect(0, y - 1.6 * joint, S, 3.2 * joint);
    x.fillStyle = `rgba(255,248,232,${0.22 * joint})`; x.fillRect(0, y + 1.6 * joint, S, 1.4 * joint);
  }
  for (let i = 0; i < courses; i++) {
    const off = (i % 2) ? bw * 0.5 : 0;
    for (let b = -1; b <= per; b++) {
      x.fillStyle = `rgba(38,32,25,${0.48 * joint})`;
      x.fillRect(b * bw + off - 1.4 * joint, i * ch, 2.8 * joint, ch);
    }
  }
  // Weathering runs DOWN from the bed joints. §4 builds the zone as an
  // interwar excavation camp, not a new build.
  for (let i = 0; i < 22; i++) {
    const sy = ((rand(0, courses) | 0)) * ch, h = rand(10, 46);
    const g = x.createLinearGradient(0, sy, 0, sy + h);
    g.addColorStop(0, `rgba(64,52,38,${rand(0.06, 0.16)})`);
    g.addColorStop(1, 'rgba(64,52,38,0)');
    x.fillStyle = g; x.fillRect(rand(0, S), sy, rand(4, 18), h);
  }
  grain(x, 2600, 16, S, r2);
  // THE SCALE IS CARRIED HERE, NOT ON THE MATERIAL. autoUV (landmarks.js:163)
  // reads `material.userData.tile` and falls back to 12 metres; stating a tile
  // on the material did NOT take — probed in the running world, the show mesh
  // came back with geometry uvTile [12,12] and material tile null — so the
  // stone came out four metres across, which is a megalith, not ashlar.
  // Rather than chase that plumbing, scale the map: the facade UVs are metres
  // (measured, see the note at texRender) and autoUV divides them by 12, so a
  // repeat of 12/tileM puts the tile back at tileM metres. Egypt: three
  // courses over 3.6m = 1.2m stones, the "large format" §4 asks for, still
  // readable across a plaza. If autoUV's default ever changes, change this.
  const t = finish(c, [12 / tileM, 12 / tileM]);
  // WHAT THAT REPEAT IS, published. The facades want it (their UVs are metres
  // divided by autoUV's 12m default); a CYLINDER does not — its UVs are 0..1
  // and it scales its own. sgdetail.js's castle drums divide it back out, and
  // without this they would have to hard-code 12/3.0 and drift.
  texAshlar.tile = 12 / tileM;
  return t;
}

// SALVAGED CORRUGATED IRON, hung shingle-wise — the WaterWorld set.
//
// research/universal-zones.md, WaterWorld "Materials and surface", first
// bullet, which also says how to build it:
//   "Overlapping salvaged corrugated-iron sheets, hung shingle-wise. Not flat
//    cladding — hundreds of irregular torn rectangles at varied angles, each a
//    slightly different weathered tone, layered over each other so the edges
//    cast shadow. This is the entire look and it is very cheap as a tiling
//    material."
// Taken at its word: this is a patchwork, not a panel. Tones are the sampled
// ones — verdigris #6A746E-#7C9792 dominant, with faded turquoise, chalk
// white, oxide brown and bleached grey "mixed into the same patchwork".
//
// Drawn on its own colours rather than on white, like the coursed maps, and
// for the same reason: a patchwork whose whole point is that no two sheets
// match cannot be a tint multiplied over one grey.
export function texSalvage() {
  const r2 = rng(0x73616c76), rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  // WEIGHTED, not uniform. The brief's palette table names verdigris as "the
  // dominant tone" and lists faded turquoise, chalk white, oxide brown and
  // bleached grey as "mixed INTO the same patchwork" — i.e. accents. Picking
  // uniformly from eight tones put white and brown on ~40% of the wall and the
  // stadium came out as camouflage, a hard chequerboard rather than salvage.
  // The verdigris family is repeated to weight the pick, which is the same
  // trick the livery and facade pools use.
  const V = [[0x6a, 0x74, 0x6e], [0x7c, 0x97, 0x92], [0x74, 0x8a, 0x84],
    [0x8e, 0xa6, 0x9e], [0x5e, 0x6b, 0x66], [0x84, 0x9a, 0x94]];
  const TONES = [...V, ...V, ...V, [0x9a, 0x9d, 0x95], [0xc9, 0xc6, 0xba],
    [0x8a, 0x6a, 0x4c]];
  x.fillStyle = '#6a746e'; x.fillRect(0, 0, S, S);
  // SHEETS, hung in overlapping rows from the top down so the lower edge of
  // each course laps the one under it — which is what "shingle-wise" means and
  // what makes the shadow line read.
  const rows = 7, rh = S / rows;
  for (let r = 0; r < rows + 1; r++) {
    let px = rand(-40, -10);
    while (px < S) {
      const w = rand(22, 68), h = rh * rand(1.10, 1.55);
      // stagger each ROW as well as each sheet, or the laps line up across the
      // wall and the patchwork reads as a grid
      const y = r * rh - rand(0, rh * 0.55);
      const t = TONES[(r2() * TONES.length) | 0];
      const j = rand(-7, 7);          // "SLIGHTLY different weathered tone"
      x.save();
      x.translate(px + w / 2, y + h / 2);
      x.rotate(rand(-0.045, 0.045));           // "at varied angles"
      x.fillStyle = `rgb(${t[0] + j},${t[1] + j},${t[2] + j})`;
      x.fillRect(-w / 2, -h / 2, w, h);
      // CORRUGATION, along the sheet. Cheap: alternating light and dark ribs.
      const rib = rand(3.0, 4.6);
      for (let k = -w / 2; k < w / 2; k += rib) {
        x.fillStyle = `rgba(255,255,255,${rand(0.04, 0.10)})`;
        x.fillRect(k, -h / 2, rib * 0.42, h);
        x.fillStyle = `rgba(0,0,0,${rand(0.05, 0.12)})`;
        x.fillRect(k + rib * 0.5, -h / 2, rib * 0.32, h);
      }
      // the lap shadow under the sheet's bottom edge, which is the whole
      // reason this reads as layered salvage and not as a painted pattern
      x.fillStyle = 'rgba(20,26,24,0.34)';
      x.fillRect(-w / 2, h / 2 - 2.0, w, 2.6);
      // torn/rusted edge at one side, sometimes
      if (r2() < 0.45) {
        x.fillStyle = `rgba(122,66,32,${rand(0.18, 0.42)})`;
        x.fillRect(-w / 2, -h / 2, rand(1.5, 4), h);
      }
      x.restore();
      px += w * rand(0.72, 0.94);              // overlap, never butt-jointed
    }
  }
  // rust bleeding down from the laps
  for (let i = 0; i < 26; i++) {
    const sy = rand(0, S), h = rand(10, 40);
    const g = x.createLinearGradient(0, sy, 0, sy + h);
    g.addColorStop(0, `rgba(126,66,30,${rand(0.10, 0.26)})`);
    g.addColorStop(1, 'rgba(126,66,30,0)');
    x.fillStyle = g; x.fillRect(rand(0, S), sy, rand(2, 9), h);
  }
  grain(x, 3000, 18, S, r2);
  // 4.2m tile: a salvaged sheet is about 0.6m wide and there are seven rows
  // of them here. Same repeat trick as texAshlar — autoUV's default is 12m.
  return finish(c, [12 / 4.2, 12 / 4.2]);
}

export function texRender(shutter = false) {
  const r2 = rng(0x726e6472 ^ (shutter ? 1 : 0)), rand = (a, b) => a + r2() * (b - a);
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, S, S);
  // DENSER THAN IT LOOKS IT SHOULD BE. The facade UVs stretch a tile across a
  // whole wall face rather than tiling at a fixed metre scale, so 3 columns on
  // a 40m mess-hall frontage became one continuous 13m-wide band of glazing.
  // 6 x 5 keeps a plausible window on a wide wall and still reads as separate
  // openings on a narrow villa, which is the range this one texture has to
  // cover (261 villas, 126 heritage, 877 small beach buildings).
  const rows = 5, rh = S / rows, cols = 6, cw = S / cols;
  for (let r = 0; r < rows; r++) {
    for (let cN = 0; cN < cols; cN++) {
      const ox = cN * cw, oy = r * rh;
      // the opening: dark glazing, and it must READ as a hole rather than a
      // panel, so the head is darker than the sill end
      const w = cw * 0.52, h = rh * 0.44;
      const px = ox + (cw - w) / 2, py = oy + rh * 0.20;
      x.fillStyle = shutter ? '#5c6a63' : '#39434b';
      x.fillRect(px, py, w, h);
      x.fillStyle = 'rgba(18,22,26,0.45)';
      x.fillRect(px, py, w, h * 0.22);
      // a reveal on the left, so the opening has depth in raking light
      x.fillStyle = 'rgba(120,116,108,0.30)';
      x.fillRect(px - cw * 0.02, py, cw * 0.02, h);
      // white frame, which is what makes render-and-window read as render
      x.strokeStyle = 'rgba(255,255,255,0.95)';
      x.lineWidth = Math.max(1, cw * 0.035);
      x.strokeRect(px, py, w, h);
      // sill
      x.fillStyle = 'rgba(236,232,224,0.95)';
      x.fillRect(px - cw * 0.03, py + h, w + cw * 0.06, rh * 0.045);
    }
    // FLOOR SHADOW, very light. Painted render has almost nothing on it, and
    // a heavy band here turns a villa into a car park.
    x.fillStyle = 'rgba(150,146,138,0.16)';
    x.fillRect(0, r * rh + rh * 0.86, S, rh * 0.035);
  }
  // the faintest dirt, so a flat white wall is not literally flat
  for (let i = 0; i < 420; i++) {
    x.fillStyle = `rgba(214,210,202,${rand(0.05, 0.16)})`;
    x.fillRect(rand(0, S), rand(0, S), rand(1, 3), rand(1, 2));
  }
  // [1,1], like every other facade texture in this file.
  //
  // I reasoned that ExtrudeGeometry's UVs are world units and set this to
  // 1/12.6 to make one tile a 3.2m storey. The walls came back FLAT WHITE:
  // the facade UVs are not metres, so that scaled the tile twelve times finer
  // than intended and the openings fell below a pixel, averaging out to the
  // base colour. texPunched, texBalcony and texShophouse all use [1,1] and all
  // land their floors at a plausible size — that is the measurement, and it
  // beats the reasoning.
  return finish(c, [1, 1]);
}


// THE BOOM BARRIER'S DIAGONAL BANDING, which is the one thing that identifies
// it from thirty metres. No RNG at all: a boom is a painted, regular pattern,
// and this file's standing rule is that a texture must never be able to move a
// bus stop (see the note above `grain`).
//
// Drawn on a WIDE, SHORT canvas and repeated along the arm, so the bands stay
// the same physical size whether the boom is a 3m Cove barrier or a 6m car
// park one. LTA's booms are red on white with the bands leaning about 30
// degrees; drawn as parallelograms rather than rotated rectangles so the ends
// meet the edge cleanly and the tile repeats without a seam.
export function texBoomBand() {
  const W = 128, H = 32;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#e8e4dc'; x.fillRect(0, 0, W, H);          // weathered white
  x.fillStyle = '#c0392b';                                   // signal red
  const lean = H * 0.6, band = W / 4;
  for (let i = -1; i < 4; i++) {
    const x0 = i * band;
    x.beginPath();
    x.moveTo(x0, H); x.lineTo(x0 + band * 0.5, H);
    x.lineTo(x0 + band * 0.5 + lean, 0); x.lineTo(x0 + lean, 0);
    x.closePath(); x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
