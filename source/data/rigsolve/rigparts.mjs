import { chromium } from '/Users/ZY/receptionig/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args:['--use-gl=angle'] });
const pg = await b.newPage({ viewport:{width:700,height:600} });
await pg.goto('http://localhost:8933/?scene=sentosa', { waitUntil: 'load' });
await pg.waitForFunction(() => window.__ready === true, null, { timeout: 240000 });
await new Promise(r => setTimeout(r, 3000));
console.log(await pg.evaluate(() => {
  const THREE = window.__THREE; let rig = null;
  for (const root of [window.__scene, window.__world]) if (root && !rig)
    root.traverse(o => { if (o.name === 'playerRig') rig = o; });
  const out = [];
  rig.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    if (o.isSkinnedMesh) { out.push(`SKINNED ${o.name||'-'}`); return; }
    const box = new THREE.Box3().setFromObject(o);
    const d = box.max.clone().sub(box.min);
    out.push(`${(o.name||'(unnamed)').padEnd(14)} `
      + `size=${d.x.toFixed(2)}x${d.y.toFixed(2)}x${d.z.toFixed(2)} `
      + `yTop=${box.max.y.toFixed(3)} `
      + `col=#${o.material?.color?.getHexString()||'?'} `
      + `parent=${o.parent?.name||'-'}`);
  });
  return out;
}));
await b.close();
