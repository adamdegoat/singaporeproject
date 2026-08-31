// RIDECHECK — the gate the rides never had.
//
// The owner, 2026-08-17: "those things can ride or interact make sure are all
// polish or imporve or test see if can make them really fun."
//
// WHY THIS EXISTS. On 2026-08-17 every ride was ridden at wall clock
// for the first time, and five faults came back — every one of them past every
// gate in the repo:
//
//   * the sky was `#000000` on EVERY ride, because the onride branch renders
//     and returns and never moved the 480m sky dome, so a carrier rode
//     straight out of it;
//   * the Wave House rides lasted 4.0 and 6.1 seconds;
//   * the cable car carried you 742m past its last station to Mount Faber,
//     529m OUTSIDE the terrain grid;
//   * you boarded a gondola from its 12m platform and alighted on the grass
//     underneath it;
//   * the Ride button said "Ride the cable car" at MegaZip and at the Wave
//     House.
//
// **NOT ONE OF THOSE IS A STALL, AND NOT ONE IS VISIBLE TO A GOLDEN FRAME.**
// data/golden.mjs hides `#map` and `#big` and shoots every one of its 42 frames
// from the GROUND with __teleport — there has never been a baseline taken from
// a seat. So the questions here are the ones a golden structurally cannot ask:
// does it move, does it finish, does it finish somewhere the world HAS, and can
// you see the sky from it.
//
// IT SAMPLES THE RENDERED PNG, NEVER THE CANVAS. Reading a WebGL canvas back
// through drawImage without `preserveDrawingBuffer` returns solid black, and
// the first probe written for the sky bug was fooled by exactly that — it
// "confirmed" the defect at both device scales and would equally have
// confirmed it after the fix.
//
//   node data/ridecheck.mjs
import { readFileSync } from 'fs';
import zlib from 'zlib';

const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
const PORT = process.env.SG_PORT || 8933;
const SHOT = (process.env.TMPDIR || '/tmp') + '/ridecheck-sky.png';

// A ride longer than this is a chore, shorter than this is a blink. Both ends
// are real findings: the FlowBarrel ran 4.0s and the cable car ran 248s with
// 43% of it over unbuilt void.
const MIN_S = 8, MAX_S = 260;

let bad = 0;
const check = (ok, msg) => { if (!ok) bad++; console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

// ---- the one pixel that matters, decoded out of the PNG itself -------------
function pngPixel(file, fx, fy) {
  const d = readFileSync(file);
  let pos = 8, w = 0, h = 0, ct = 6, idat = [];
  while (pos < d.length) {
    const ln = d.readUInt32BE(pos), typ = d.toString('latin1', pos + 4, pos + 8);
    if (typ === 'IHDR') { w = d.readUInt32BE(pos + 8); h = d.readUInt32BE(pos + 12); ct = d[pos + 17]; }
    if (typ === 'IDAT') idat.push(d.subarray(pos + 8, pos + 8 + ln));
    pos += 12 + ln;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : 3, stride = w * ch;
  let prev = Buffer.alloc(stride), i = 0;
  const Y = Math.floor(h * fy);
  let line = null;
  for (let y = 0; y <= Y; y++) {
    const f = raw[i]; i++;
    line = Buffer.from(raw.subarray(i, i + stride)); i += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0;
      if (f === 1) line[x] = (line[x] + a) & 255;
      else if (f === 2) line[x] = (line[x] + b) & 255;
      else if (f === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    prev = line;
  }
  const X = Math.floor(w * fx) * ch;
  return [line[X], line[X + 1], line[X + 2]];
}

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { bad++; console.log('  page error: ' + e.message); });
await page.goto(`http://localhost:${PORT}/?district=sentosa&nostream&reseed=1&cb=${Date.now()}`,
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 400000, polling: 300 });
await page.waitForTimeout(800);

const rides = await page.evaluate(() => window.__rides());
console.log(`  ${rides.length} rides`);
check(rides.length >= 12, `${rides.length} rides exist`);

// THE TERRAIN'S OWN EXTENT, so "off the edge of the world" is a measurement
// rather than a number somebody typed. The cable car's far end was 529m past
// this and nothing in the repo could say so.
const grid = await page.evaluate(() => {
  const t = (window.__data || {}).terrain;
  if (!t) return null;
  return { x0: t.x0, z0: t.z0, x1: t.x0 + t.cell * (t.nx - 1), z1: t.z0 + t.cell * (t.nz - 1) };
});

for (const r of rides) {
  const ok = await page.evaluate((i) => window.__board(i), r.i);
  if (!ok) { check(false, `board ${r.kind} ${r.name}`); continue; }
  await page.waitForTimeout(250);

  // ---- the sky, once, from a seat. One ride is enough to catch the class:
  // the dome is shared and the branch that failed to move it is shared.
  if (r.i === rides.findIndex((q) => q.kind === 'flowrider' || q.kind === 'gondola')) {
    await page.evaluate(() => window.__ui(false));
    await page.waitForTimeout(500);
    await page.screenshot({ path: SHOT });
    await page.evaluate(() => window.__ui(true));
    const sky = pngPixel(SHOT, 0.5, 0.18);
    const lum = sky[0] + sky[1] + sky[2];
    check(lum > 90, `the sky is drawn from a seat (rgb ${sky.join(',')} on ${r.name})`);
  }

  const t0 = Date.now();
  let last = null, moved = false, startS = null;
  while (Date.now() - t0 < (MAX_S + 20) * 1000) {
    const s = await page.evaluate(() => window.__rideState());
    if (!s) break;
    if (startS === null) startS = s.s;
    if (last && Math.abs(s.s - last.s) > 0.01) moved = true;
    last = s;
    // never let a carrier leave the ground the world actually has
    if (grid && (s.cam[0] < grid.x0 || s.cam[0] > grid.x1 || s.cam[2] < grid.z0 || s.cam[2] > grid.z1)) {
      check(false, `${r.name} carried the rider OUTSIDE the terrain grid `
        + `(${s.cam[0].toFixed(0)}, ${s.cam[2].toFixed(0)})`);
      break;
    }
    await page.waitForTimeout(250);
  }
  const dur = (Date.now() - t0) / 1000;
  const ended = await page.evaluate(() => !window.__rideState());
  // THE WIRE AND THE RIDE ARE DIFFERENT NUMBERS NOW, so print both. A tool that
  // measures progress against `len` reports a working cable car as a stall: it
  // travels 990.6m of a 1,734m line and every mark past 57% never fires. That
  // happened to the flight strip on 2026-08-18 and would happen to the next
  // probe somebody writes.
  check(moved, `${r.kind} ${r.name} moves (rides ${r.ride}m of a ${r.len}m line)`);
  check(ended, `${r.kind} ${r.name} finishes on its own (${dur.toFixed(0)}s)`);
  check(dur >= MIN_S, `${r.name} lasts more than ${MIN_S}s (${dur.toFixed(0)}s)`);
  check(dur <= MAX_S, `${r.name} is over inside ${MAX_S}s (${dur.toFixed(0)}s)`);

  // and you can walk away from wherever it put you down
  const land = await page.evaluate(() => {
    const w = window.__walker();
    return { w, a: window.__landAudit(w.x, w.z) };
  });
  check(land.a.open, `${r.name} sets you down somewhere you can leave `
    + `(${land.w.x}, ${land.w.z})`);

  if (await page.evaluate(() => !!window.__rideState())) {
    await page.evaluate(() => window.__toggle());
    await page.waitForTimeout(300);
  }
}

await browser.close();
if (bad) { console.log(`  ridecheck FAIL (${bad})`); process.exit(1); }
console.log('  ridecheck ok');
