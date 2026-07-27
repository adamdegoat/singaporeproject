// Procedural textures. Nothing is downloaded; every surface is drawn into a
// canvas at load, which keeps the whole world a JS payload and keeps the
// palette under our control.
import * as THREE from '../lib/three.module.js';

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const R = rng(19870219);
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
  leafDark:  0x2b3d21,
  leafMid:   0x4a6430,
  leafLight: 0x76893f,
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
function grain(x, n, amt, size) {
  for (let i = 0; i < n; i++) {
    const g = (R() * 2 - 1) * amt;
    x.fillStyle = `rgba(${g > 0 ? 255 : 0},${g > 0 ? 255 : 0},${g > 0 ? 255 : 0},${Math.abs(g) / 255})`;
    x.fillRect((R() * size) | 0, (R() * size) | 0, 1 + ((R() * 2) | 0), 1 + ((R() * 2) | 0));
  }
}

export function texAsphalt() {
  const S = 256, [c, x] = cvs(S);
  x.fillStyle = hex(PAL.asphalt); x.fillRect(0, 0, S, S);
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
export function texPaving() {
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
  grain(x, 2600, 18, S);
  return finish(c, [1, 1]);
}

export function texConcrete(base, dirt = 0.55) {
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
  grain(x, 4800, 24, S);
  return finish(c, [1, 1]);
}

// Curtain wall: horizontal spandrel bands with vertical mullions. Orchard is
// mostly made of this, so it does a lot of the recognition work.
export function texCurtain(glassHex, mullionHex, floors = 8) {
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
  grain(x, 1800, 16, S);
  return finish(c, [1, 1]);
}

// dark polished granite with narrow vertical window slots (Ngee Ann City)
export function texGranite() {
  // Ngee Ann City is clad in "African Red" polished granite, which reads far
  // redder than the brown-grey I first used.
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
  grain(x, 2400, 18, S);
  return finish(c, [1, 1]);
}

// balconied residential: recessed slots with a rail line
export function texBalcony(base) {
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
  grain(x, 2000, 16, S);
  return finish(c, [1, 1]);
}

export function texLeaves() {
  const S = 128, [c, x] = cvs(S);
  x.clearRect(0, 0, S, S);
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(34,50,25,0.85)');
  g.addColorStop(0.7, 'rgba(34,50,25,0.34)');
  g.addColorStop(1, 'rgba(34,50,25,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const cols = [PAL.leafDark, PAL.leafDark, PAL.leafMid, PAL.leafMid, PAL.leafLight];
  for (let i = 0; i < 460; i++) {
    const px = rand(0, S), py = rand(0, S);
    const d = Math.hypot(px - S / 2, py - S / 2) / (S / 2);
    if (d > 0.99 || R() < d * d * 0.9) continue;
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
