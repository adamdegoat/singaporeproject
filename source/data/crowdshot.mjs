#!/usr/bin/env node
// Look at the people.
//
//     node data/crowdshot.mjs             # three framings, world scene
//     SG_SCENE=orchard node data/crowdshot.mjs
//
// The crowd is the one part of this world that every other tool is built to
// ignore. The sweep gates on draw calls, the audit walks a still scene, the
// comparison sheet frames buildings and `landmark.mjs` deliberately passes
// `nopeople`. So the walkers have never been LOOKED at, only counted — which
// is how a stride that jumps twelve radians five minutes into a session
// survived every check and had to be reported by someone riding past.
//
// Three framings, because "do the people look right" is three questions:
//   portrait  one walker at 3.2m, filling the frame — proportion and silhouette
//   pair      two walkers at 7m — do they read as different people
//   street    the pavement at rider height — what you actually see at speed
//
// The camera is derived: it picks the walker nearest the busiest patch of
// pavement rather than a hand-chosen one, so a bad figure cannot be framed out.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync } from 'fs';

const OUT = 'shots/crowd';
const TAG = process.argv[2] || 'now';
mkdirSync(OUT, { recursive: true });
const SCENE = process.env.SG_SCENE || 'orchard';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 860 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error:', e.message));
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/index.html?dpr=1&scene=${SCENE}`, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', null, { polling: 300, timeout: 240000 });
await page.evaluate(() => window.__ui(false));

// Let them walk. A crowd is spawned in a cluster and spreads out; judging the
// figures on frame one judges the spawn, not the walk.
await page.waitForTimeout(4000);

const shots = [
  { id: 'portrait', dist: 3.2, eye: 1.35, aimY: 0.95, fov: 34 },
  { id: 'pair', dist: 7.0, eye: 1.5, aimY: 1.0, fov: 40 },
  { id: 'street', dist: 14.0, eye: 1.4, aimY: 1.2, fov: 52 },
];

for (const s of shots) {
  // Two samples 320ms apart, so the camera can be put in FRONT of someone.
  // __crowdPositions() reports where people ARE and nothing about which way
  // they point, and every framing derived from the road normal photographed
  // the backs of their heads — which is a poor way to judge a face.
  await page.evaluate(() => { window.__cs0 = window.__crowdPositions(); });
  await page.waitForTimeout(320);
  const info = await page.evaluate((sh) => {
    const P = (window.__crowdPositions ? window.__crowdPositions() : [])
      .filter((q) => isFinite(q[0]) && isFinite(q[1]));
    if (!P.length) return { err: 'no walkers reported by __crowdPositions()' };
    // the busiest patch: the walker with the most neighbours within 12m, so the
    // frame shows the crowd as it actually bunches rather than a lone figure
    let best = null;
    for (let ai = 0; ai < P.length; ai++) {
      const a = P[ai];
      let n = 0;
      for (const b of P) if (a !== b && Math.hypot(b[0] - a[0], b[1] - a[1]) < 12) n++;
      if (!best || n > best.n) best = { n, a, i: ai };
    }
    const [tx, tz] = best.a;
    // Which way are they walking? Stand that way, so we see a face.
    let hx = 1, hz = 0;
    const prev = window.__cs0 && window.__cs0[best.i];
    if (prev) {
      const vx = tx - prev[0], vz = tz - prev[1], L = Math.hypot(vx, vz);
      if (L > 0.02) { hx = vx / L; hz = vz / L; }
    }
    if (hx === 1 && hz === 0 && window.__roadDirAt) {
      const rd = window.__roadDirAt(tx, tz);
      if (rd && isFinite(rd[0])) { hx = rd[0]; hz = rd[1]; }
    }
    const ex = tx + hx * sh.dist, ez = tz + hz * sh.dist;
    const g = window.__surfaceAt(ex, ez), gt = window.__surfaceAt(tx, tz);
    window.__cam(ex, g + sh.eye, ez, tx, gt + sh.aimY, tz, sh.fov);
    // put the ride behind the lens so the crowd around this spot stays alive —
    // the crowd only exists within 105m of the RIDE, not of the camera
    if (window.__teleport) window.__teleport(ex + hx * 26, ez + hz * 26,
      Math.atan2(-hx, -hz));
    return { n: best.n, x: +tx.toFixed(1), z: +tz.toFixed(1), people: P.length };
  }, s);
  if (info.err) { console.error('  ' + info.err); break; }
  await page.waitForTimeout(500);
  const file = `${OUT}/${TAG}.${s.id}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
  console.log(`  ${file}   ${info.people} walkers, densest has ${info.n} within 12m`);
}

await browser.close();
