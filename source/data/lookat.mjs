#!/usr/bin/env node
// Free camera. Point one at a thing and look at it.
//
//     node data/lookat.mjs 2181,6457,40 2152,6436,20
//     SG_SCENE=littleindia SG_TAG=hdb node data/lookat.mjs <eyeX,eyeZ,eyeY> <atX,atZ,atY>
//
// streetshot.mjs is the rider's eye and always has the rider's head in it,
// which is right for "what does the street look like" and useless for "what
// does THAT building look like". Heights here are metres ABOVE LOCAL GROUND at
// the given x,z, because an absolute Y is unguessable on terrain that moves.
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');
import { mkdirSync } from 'fs';

const OUT = 'shots/street';
mkdirSync(OUT, { recursive: true });
const SCENE = process.env.SG_SCENE || 'world';
const TAG = process.env.SG_TAG || 'look';
const FOV = +(process.env.SG_FOV || 55);

const args = process.argv.slice(2);
const pairs = [];
for (let i = 0; i + 1 < args.length; i += 2) {
  const [ex, ez, ey] = args[i].split(',').map(Number);
  const [ax, az, ay] = args[i + 1].split(',').map(Number);
  pairs.push({ id: 'shot' + (pairs.length + 1), ex, ez, ey: ey || 2, ax, az, ay: ay || 2, fov: FOV });
}
if (!pairs.length) { console.error('usage: lookat.mjs <ex,ez,ey> <ax,az,ay> ...'); process.exit(1); }

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 800 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('  page error:', e.message));
// SG_EXTRA appends query flags (?far=1400, ?noaa, ?lowpower) so an atmosphere
// or LOD change can be A/B'd from the same camera without editing the source.
// SG_XPARAMS appends URL params, so a look can be taken as an A/B of a flag
// without editing this file. Added 2026-08-24: two "before and after" aerials
// came back 174,238 and 174,239 bytes, which is one frame twice — the flag was
// being passed to a script that had nowhere to put it.
const XPARAMS = process.env.SG_XPARAMS ? '&' + process.env.SG_XPARAMS : '';
// `?scene=<name>` IS DEAD. This file asked for `?dpr=1&scene=world`, which no
// district loader answers any more, so __ready never came true and every run
// ended in a five-minute timeout with no frame. The working shape — the one
// golden.mjs and avatar.mjs use — is `?district=<name>`. Cost two timeouts on
// 2026-08-27, one here and one in a new tool that copied this line.
await page.goto(`http://localhost:${process.env.SG_PORT || 8933}/?district=${SCENE === 'world' ? 'sentosa' : SCENE}&reseed=1${XPARAMS}`
  + (process.env.SG_EXTRA ? '&' + process.env.SG_EXTRA : ''),
  { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { polling: 300, timeout: 300000 });
await page.evaluate(() => window.__ui(false));

for (const p of pairs) {
  // Teleport the RIDE to the subject, not to the eye: the streamer builds
  // around the ride, and a camera parked 200m away from it looks at chunks
  // that were never asked for. Same trap streetshot documents.
  await page.evaluate((s) => window.__teleport(s.ax, s.az, 0), p);
  await page.waitForFunction(() => {
    const st = window.__streamState;
    if (st && st.building) return false;
    let n = 0;
    window.__scene.traverse((o) => { if (o.isInstancedMesh) n += o.count; });
    const prev = window.__settleN;
    window.__settleN = n;
    window.__settleHits = (prev === n) ? (window.__settleHits || 0) + 1 : 0;
    return window.__settleHits >= 3;
  }, null, { polling: 600, timeout: 300000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const info = await page.evaluate((s) => {
    const ge = window.__surfaceAt(s.ex, s.ez);
    const ga = window.__surfaceAt(s.ax, s.az);
    window.__cam(s.ex, ge + s.ey, s.ez, s.ax, ga + s.ay, s.az, s.fov || 55);
    return { eye: +ge.toFixed(1), at: +ga.toFixed(1) };
  }, p);
  await page.waitForTimeout(400);
  const file = `${OUT}/${TAG}.${p.id}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
  console.log(`  ${file}   eye ground ${info.eye}m  subject ground ${info.at}m`);
}

await browser.close();
