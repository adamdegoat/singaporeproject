#!/usr/bin/env node
// THE STANCE, IN THE BOARD'S OWN FRAME, WITH BUDGETS.
//
//     node data/stancecheck.mjs            # gate: exits 1 on any breach
//     SG_STATES=cruise node data/stancecheck.mjs
//
// WHY A NEW CHECK. The avatar has been judged three ways and all three were
// blind to what the owner actually complains about:
//   * data/avatar.mjs poses the rig on a blank stage with NO BOARD, so it can
//     say nothing about feet on the deck (the handover records a false alarm
//     that was exactly this).
//   * the goldens are 46 island views in which the rider is a few dozen
//     pixels; a re-bless "tightly clustered at 1.25-1.53%" hid a whole
//     character swap.
//   * window.__rider() read the OLD box rig and returned null for every pose
//     field on the woman.
// So: measure the figure AGAINST THE BOARD, in the board's frame, and put a
// number on the things a person actually sees — feet on the deck, feet over
// the trucks, legs not crossed, and whether the body reads as facing anywhere
// at all.
//
// EVERY QUANTITY IS SAMPLED IN ONE INSTANT. The first version of this probe
// read the bones before an `await` and the deck bbox after it, and reported a
// deck 1.95m ahead of her feet on a rider doing 1.1 km/h. Bones and board must
// be read in the same frame or the numbers describe two different moments.
import { writeFileSync, mkdirSync } from 'fs';
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
// THE BUDGETS. Everything is metres or degrees, in the board's frame.
const BUD = {
  footAbove: 0.030,   // a sole may float this far over the grip and no further
  footBelow: 0.010,   // ...and may sink this far into it
  truckOff: 0.140,    // how far a planted foot may sit from its truck, along z
  offDeckX: 0.075,    // how far a planted ankle may sit outside the deck edge
  cross: 0.0,         // shins may not cross: signed x gap must keep its sign
  neck: 75,           // degrees of head yaw away from the chest
  // DOES SHE LOOK WHERE SHE IS GOING. The board slides across its own
  // direction of travel by design (SKATE.slipMax is 0.62 rad, ~36 deg), and
  // until 2026-08-29 the figure's gaze stayed glued to the NOSE through all of
  // it -- measured at 41 degrees away from the course at full lock, which is
  // the handover's "she does not look where she is going through a turn". The
  // budget allows a lead, not a stare: a rider looks a little ahead of the
  // course, INTO the exit of the turn, so the right answer is a small non-zero
  // number and not zero.
  //
  // 15, AND THE NUMBER WAS CHOSEN BY A/B, NOT BY TASTE. Run against the same
  // build with the look forced off (`SG_XPARAMS=nolook`) the `drift` state
  // measures -24.7 deg and with it 4.4; `carve` measures -11.1 and 8.2. A
  // budget of 25 -- the first one written here -- passed the broken build by
  // 0.3 of a degree, which is a gate that exists and does nothing.
  gaze: 15,
  shoeMin: 45,        // a shoe must sit at least this far ACROSS the deck
  toeOver: 0.045,     // ...and its toes may hang this far past the rail
};
const STATES = {
  cruise: { runup: [1.0, 0, 5.0], th: 0, st: 0, settle: 1.0, planted: 'both' },
  carve: { runup: [1.0, 0, 5.0], th: 0, st: 0.8, settle: 1.1, planted: 'both' },
  fast: { runup: [1.0, 0, 12.0], th: 1.0, st: 0, settle: 0.8, planted: 'both' },
  // in the push only the FRONT foot is on the deck; the back one is meant to
  // be on the road, so it is exempt from the deck budgets and gets its own.
  push: { runup: [0, 0, 0.2], th: 1.0, st: 0, settle: 1.2, planted: 'front' },
  // FULL LOCK, AND IT IS THE ONLY STATE THAT REALLY TESTS THE GAZE. `carve`
  // holds 0.8 and settles at ~28 degrees of slide, where the carve stance's
  // own head yaw happens to cover most of the error -- run with the look
  // forced off (`SG_XPARAMS=nolook`) it still measured only 11 degrees, well
  // inside budget. A gate whose worst case is not in its states is a gate that
  // cannot fail. At full lock the same A/B is 27+ degrees against 7.
  drift: { runup: [1.0, 0, 6.0], th: 1.0, st: 1.0, settle: 1.4, planted: 'both' },
};
const WANT = (process.env.SG_STATES || 'cruise,carve,fast,push,drift').split(',');

const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on('pageerror', (e) => console.log('  page error:', e.message));
// `?scene=` is the live parameter; `?district=` is ignored (main.js:1913).
// SG_XPARAMS appends A/B flags (`nolook`, `noshade`, ...) so a gate can be run
// against the same build with one change forced off -- the only way to say
// whether a finding is new or was simply never visible from the old vantage.
const XPARAMS = process.env.SG_XPARAMS ? '&' + process.env.SG_XPARAMS : '';
await page.goto(`http://localhost:${PORT}/?scene=sentosa&reseed=1${XPARAMS}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__teleport && window.__ready === true,
  null, { polling: 300, timeout: 300000 });
// THE VANTAGE, AND IT WAS THE SEA. `1180,7250` was this file's default until
// 2026-08-29 and it is a point in OPEN WATER: terrain.at returns 0.00 there,
// which is this project's stored datum for open sea (see the datum note in the
// handover), and __surfaceAt returns 0.024. Nothing failed -- the pose numbers
// are all measured in the BOARD's frame and do not care what is under it, and
// `deckToRoad` is the deck's own height so it reads the same over water. What
// broke was the PICTURE: every ridecam frame for at least two days showed the
// rider against an empty blue void with no road, no kerb and no island, and
// the last session judged the stance from those frames by eye. A vantage with
// nothing in it is the same class of blind instrument as a check that returns
// NaN and passes.
//
// It is the 393m straight at the west end now -- the longest single road
// segment on the island, found by measuring every segment in data.roads rather
// than by picking somewhere that looked open. She reaches 49 km/h on it under
// a 5s run-up (8 km/h at the spawn, which is a beach lane full of furniture),
// so the fast states are actually fast, and there is road either side of her
// in every frame.
const START = (process.env.SG_START || '-1037,11775,-0.0222').split(',').map(Number);
await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), START);
await page.waitForTimeout(2500);

// One page-side reader, called at the shutter instant.
await page.evaluate(() => {
  window.__stanceRead = () => {
    const T = window.__THREE;
    let rig = null;
    window.__scene.traverse((o) => { if (o.name === 'playerRig') rig = o; });
    if (!rig) return { err: 'no playerRig' };
    rig.updateWorldMatrix(true, true);
    const O = new T.Vector3(), Q = new T.Quaternion(), S = new T.Vector3();
    rig.matrixWorld.decompose(O, Q, S);
    const inv = Q.clone().invert();
    // world -> board frame: x = across (toe side negative), y = up,
    // z = along the deck, +z the nose (measured in footcheck2: dotZ = 1.000)
    const local = (v) => v.clone().sub(O).applyQuaternion(inv);

    // THE DECK, POSITIVELY: the plank is the 0.245 x 0.94 box, the grip tape
    // the 0.235 x 0.92 one on top of it (vespa.js:207-208). Nearest match to
    // the rig wins -- a parked board and the ghost's board also match.
    let grip = null, best = 1e9;
    rig.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.parameters) return;
      const g = o.geometry.parameters;
      if (g.width == null || Math.abs(g.width - 0.235) > 0.01 || Math.abs(g.depth - 0.92) > 0.02) return;
      const b = new T.Box3().setFromObject(o);
      const c = b.getCenter(new T.Vector3());
      const d = c.distanceTo(O);
      if (d < best) { best = d; grip = { box: b, obj: o }; }
    });
    if (!grip) return { err: 'no grip tape mesh under the rig' };
    // GRIP TOP, THROUGH THE MESH'S OWN MATRIX -- NOT A WORLD AABB. Box3 is
    // axis-aligned in WORLD space, so the moment the board rolls into a carve
    // its max.y stops being the deck's top surface and becomes the high corner
    // of a tilted box. The first run of this check reported the grip top at
    // 0.135 cruising and 0.251 in the carve on a board that never changed, and
    // scored both feet as 17-73mm THROUGH a deck they were resting on. Take
    // the centre of the mesh's own +y face in ITS local frame and push it out
    // through matrixWorld instead; that point is the deck top whatever the
    // board is doing.
    const gp = grip.obj.geometry.parameters;
    const gTopW = new T.Vector3(0, gp.height / 2, 0).applyMatrix4(grip.obj.matrixWorld);
    const gTop = local(gTopW);
    // THE DECK'S OWN FRAME IS THE ONLY HONEST ONE FOR "IS THE FOOT ON THE
    // BOARD". `local()` above is the PLAYERRIG's frame, and the carve rolls
    // the skate group INSIDE that rig — so under lean the deck tilts relative
    // to the frame the feet were being measured in, and a foot resting
    // perfectly on the deck scored 39mm THROUGH it. (The tell was the grip top
    // reading 0.135 cruising and 0.173 in the carve on a board whose thickness
    // never changes. A constant that is not constant is the frame confessing.)
    // Everything about feet-vs-board is measured HERE instead: y is height
    // above the deck's mid-plane, x is across it, z along it.
    const deck = (v) => grip.obj.worldToLocal(v.clone());
    const deckTopY = gp.height / 2;
    // ...and the same point in the AVATAR'S OWN frame, which is the number the
    // solver in data/rigsolve/stance.mjs has to be given. It held 0.037; the
    // avatar group is offset +0.16 inside the board (main.js:1239) and nobody
    // subtracted it, so every solved foot came out 62mm high -- which is the
    // float this check measures. DERIVING it by subtraction is how the wrong
    // number got in, so it is measured here and printed for the solver.
    let avRoot = null;
    rig.traverse((o) => { if (!avRoot && o.isBone && (o.name === 'Bone' || o.name === 'Root')) avRoot = o; });
    const avParent = avRoot && avRoot.parent ? avRoot.parent : null;
    const gTopAv = avParent
      ? avParent.worldToLocal(gTopW.clone())
      : null;

    const bone = {};
    rig.traverse((o) => { if (o.isBone) bone[o.name] = o; });
    const lp = (n) => { if (!bone[n]) return null; const v = new T.Vector3(); bone[n].getWorldPosition(v); return local(v); };
    const r3 = (v) => v && [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];

    // THE ANKLE-TO-SOLE DROP, per foot, measured not assumed: snapFeet turns
    // the two shoes to different angles (Foot.L +0.62 rad, Foot.R +1.15) and
    // the shoe is longer than it is wide, so one number for both is wrong.
    // Foot_end is the toe; the sole sits below the ankle by the rest drop.
    const SOLE = { L: 0.023, R: 0.036 };
    const dp = (n) => { if (!bone[n]) return null; const v = new T.Vector3(); bone[n].getWorldPosition(v); return deck(v); };
    const aL = dp('Foot.L'), aR = dp('Foot.R');
    const soleL = aL ? aL.y - SOLE.L : null, soleR = aR ? aR.y - SOLE.R : null;

    // WHICH WAY EACH SHOE POINTS, in degrees across the deck — the owner's
    // "the feet placement all facing weird", and the one thing no view in this
    // project had ever measured. 90 is square across the plank; 0 lays the
    // shoe along it, pointing at the nose. Read from the toe bone, in the
    // DECK's frame, so it is the angle you would protractor off an overhead
    // frame. Also the toe's distance outside the rail: a surfskate rides with
    // the toes ON the edge, not hanging over it.
    const shoeDeg = (sd) => {
      const a = dp('Foot.' + sd), t = dp('Foot.' + sd + '_end');
      if (!a || !t) return null;
      const v = t.clone().sub(a);
      return { deg: +(Math.atan2(-v.x, v.z) * 180 / Math.PI).toFixed(1),
        toeX: +t.x.toFixed(3), heelX: +a.x.toFixed(3) };
    };
    const shoeL = shoeDeg('L'), shoeR = shoeDeg('R');

    // SHOULDER LINE vs THE DECK. A skater's shoulders run ALONG the deck, so
    // this should be near 0 deg off the z axis. Reported, not budgeted -- the
    // owner has to call the style.
    const sL = lp('UpperArm.L'), sR = lp('UpperArm.R');
    const shVec = sL && sR ? sL.clone().sub(sR) : null;
    const shDeg = shVec ? +(Math.atan2(shVec.x, shVec.z) * 180 / Math.PI).toFixed(1) : null;
    // HEAD YAW relative to the CHEST, which is the number that decides whether
    // a neck is doing something a neck can do. Head forward is local +Z of the
    // head bone (the handover's measurement bug #1).
    const hq = new T.Quaternion();
    if (bone.Head) bone.Head.getWorldQuaternion(hq);
    const hFwd = new T.Vector3(0, 0, 1).applyQuaternion(hq).applyQuaternion(inv);
    const headDeg = +(Math.atan2(hFwd.x, hFwd.z) * 180 / Math.PI).toFixed(1);
    const cq = new T.Quaternion();
    if (bone.Torso) bone.Torso.getWorldQuaternion(cq);
    const cFwd = new T.Vector3(0, 0, 1).applyQuaternion(cq).applyQuaternion(inv);
    const chestDeg = +(Math.atan2(cFwd.x, cFwd.z) * 180 / Math.PI).toFixed(1);
    let neck = headDeg - chestDeg;
    while (neck > 180) neck -= 360; while (neck < -180) neck += 360;
    // ...AND THE SAME HEAD AGAINST THE DIRECTION OF TRAVEL. `headDeg` above is
    // in the RIG's frame, so it says where she looks relative to the BOARD,
    // and a board in a drift is not pointing where it is going. __rider()
    // publishes both `heading` (the deck) and `course` (the momentum); the
    // gaze error is the head's world yaw minus the course. Deriving the course
    // from the deck's matrix here instead would be measuring the thing under
    // test with the thing under test.
    const R0 = window.__rider ? window.__rider() : null;
    const hFwdW = new T.Vector3(0, 0, 1).applyQuaternion(hq);
    const headWorld = Math.atan2(hFwdW.x, hFwdW.z) * 180 / Math.PI;
    let gaze = null;
    if (R0 && R0.course != null) {
      gaze = headWorld - R0.course * 180 / Math.PI;
      while (gaze > 180) gaze -= 360; while (gaze < -180) gaze += 360;
    }

    // TRUCKS. vespa.js puts the axles at z +/-0.375 on this deck.
    const TRUCK = 0.375;
    // THE ROAD, in the same frame, because the push aims at it. The push
    // solver held "the road is -0.160" against "the deck is +0.037" — 197mm
    // apart — and the deck number was wrong, so the gap was wrong too and the
    // pushing foot was solved to a road 42mm below the real one. That is the
    // whole reason the shipped note has to apologise that the shoe "skims
    // rather than plants". Measure the gap instead of carrying it.
    const gY = window.__surfaceAt ? window.__surfaceAt(O.x, O.z) : null;
    const roadLocal = gY == null ? null : deck(new T.Vector3(O.x, gY, O.z));
    return {
      kmh: +window.__kmh().toFixed(1),
      roadY: roadLocal ? +roadLocal.y.toFixed(4) : null,
      deckToRoad: roadLocal ? +(deckTopY - roadLocal.y).toFixed(4) : null,
      pose: window.__avPose || null,
      gripTopY: +deckTopY.toFixed(4),
      gripTopRigY: +gTop.y.toFixed(4),
      gripTopAvatarY: gTopAv ? +gTopAv.y.toFixed(4) : null,
      deckHalfX: 0.1175, truckZ: TRUCK,
      ankleL: r3(aL), ankleR: r3(aR),
      soleL: soleL == null ? null : +soleL.toFixed(4),
      soleR: soleR == null ? null : +soleR.toFixed(4),
      kneeL: r3(dp('LowerLeg.L')), kneeR: r3(dp('LowerLeg.R')),
      hipL: r3(dp('UpperLeg.L')), hipR: r3(dp('UpperLeg.R')),
      shoulderDeg: shDeg, headDeg, chestDeg, neckDeg: +neck.toFixed(1),
      gazeDeg: gaze == null ? null : +gaze.toFixed(1),
      slipDeg: R0 && R0.slip != null ? +(R0.slip * 180 / Math.PI).toFixed(1) : null,
      shoeL, shoeR,
    };
  };
});

let bad = 0;
const rows = [];
for (const name of WANT) {
  const st = STATES[name];
  if (!st) { console.log(`  skip unknown state ${name}`); continue; }
  if (st.runup[2] > 0) await page.evaluate(([t, s, sec]) => window.__drive(t, s, sec), st.runup);
  const hold = page.evaluate(([t, s, sec]) => window.__drive(t, s, sec), [st.th, st.st, st.settle + 1.4]);
  await page.waitForTimeout(st.settle * 1000);
  const r = await page.evaluate(() => window.__stanceRead());
  await hold;
  await page.evaluate(([x, z, h]) => window.__teleport(x, z, h), START);
  await page.waitForTimeout(400);
  if (r.err) { console.log(`  ${name}: ${r.err}`); bad++; continue; }

  const say = [];
  const gripY = r.gripTopY;
  const check = (foot, sole, ankle) => {
    const above = sole - gripY;
    if (above > BUD.footAbove) say.push(`${foot} sole floats ${(above * 1000).toFixed(0)}mm over the grip (budget ${BUD.footAbove * 1000})`);
    if (-above > BUD.footBelow) say.push(`${foot} sole is ${(-above * 1000).toFixed(0)}mm THROUGH the deck (budget ${BUD.footBelow * 1000})`);
    if (Math.abs(ankle[0]) > r.deckHalfX + BUD.offDeckX) say.push(`${foot} ankle sits ${((Math.abs(ankle[0]) - r.deckHalfX) * 1000).toFixed(0)}mm outside the deck edge`);
    const nearest = ankle[2] >= 0 ? r.truckZ : -r.truckZ;
    const offT = Math.abs(ankle[2] - nearest);
    if (offT > BUD.truckOff) say.push(`${foot} sits ${(offT * 1000).toFixed(0)}mm off its truck (budget ${BUD.truckOff * 1000})`);
  };
  check('front(L)', r.soleL, r.ankleL);
  // WHETHER THE BACK FOOT IS MEANT TO BE ON THE DECK IS A FACT ABOUT THE
  // FRAME, NOT ABOUT THE STATE'S NAME. The push runs at any speed under 66% of
  // vMax, so a state called `fast` at 36 km/h is STILL pushing, and grading it
  // as a two-footed cruise scored a correctly-planted pushing shoe as "138mm
  // THROUGH the deck". Ask the pose what it was told to do.
  const pushingNow = !!(r.pose && r.pose.pushing);
  if (st.planted === 'both' && !pushingNow) check('back(R)', r.soleR, r.ankleR);
  else if (pushingNow) {
    // THE SHOE BELONGS ON THE ROAD DURING THE DRIVE, AND NOWHERE NEAR IT
    // DURING THE RECOVERY (2026-08-28).
    //
    // This used to demand road contact at ANY phase of the push, and it
    // passed — because the stroke it was written against was symmetric
    // (avatar.js traced cruise -> PLANT -> DRIVE -> PLANT -> cruise), so the
    // foot was near the road for almost all of it. When the stroke was made
    // asymmetric — plant, a long drive, then a recovery that swings the foot
    // home clear of the ground, which is what a push actually is — this check
    // failed at 45mm, and it was the CHECK that was wrong: it had the defect
    // written into it as the pass condition.
    //
    // The phase is recovered exactly the way avatar.js recovers it, from the
    // same two derived numbers, so the two cannot drift apart silently.
    const kk = r.pose.kick, rr = r.pose.reach;
    const ph = Math.atan2(kk, 1 - 2 * rr) / (Math.PI * 2);
    const p01 = ph - Math.floor(ph);
    const off = r.soleR - r.roadY;
    const driving = p01 >= 0.22 && p01 <= 0.62;      // matches avatar.js's legs
    if (driving && off > 0.045) {
      say.push(`back(R) pushing shoe floats ${(off * 1000).toFixed(0)}mm over the road`
        + ` DURING THE DRIVE (phase ${p01.toFixed(2)})`);
    }
    // ...and a foot that has swung home should be up, not skimming: a
    // recovery that never leaves the road is the old symmetric stroke again
    if (!driving && off > 0.40) {
      say.push(`back(R) recovering shoe is ${(off * 1000).toFixed(0)}mm up`
        + ` (phase ${p01.toFixed(2)}) — that is a kick, not a recovery`);
    }
    if (off < -0.020) say.push(`back(R) pushing shoe is ${(-off * 1000).toFixed(0)}mm INTO the road`);
  }
  // LEGS CROSSED. The front foot is the LEFT one (regular stance) and rides
  // nose-side, so ankleL.z must stay ahead of ankleR.z; and the knees must not
  // swap sides in x. Either is the "contorted" read from behind.
  if (!pushingNow && r.ankleL[2] <= r.ankleR[2]) say.push(`feet swapped along the deck: front z ${r.ankleL[2]} is behind back z ${r.ankleR[2]}`);
  if (Math.sign(r.kneeL[0] - r.kneeR[0]) !== Math.sign(r.hipL[0] - r.hipR[0]))
    say.push(`knees crossed: knee gap ${(r.kneeL[0] - r.kneeR[0]).toFixed(3)} against hip gap ${(r.hipL[0] - r.hipR[0]).toFixed(3)}`);
  if (Math.abs(r.neckDeg) > BUD.neck) say.push(`neck twisted ${r.neckDeg} deg off the chest (budget ${BUD.neck})`);
  // Only judged when there IS a slide to look through: in a straight line the
  // course IS the nose and the test is vacuous, and asserting a vacuous test
  // per state is how a gate ends up green for the wrong reason.
  if (r.gazeDeg != null && Math.abs(r.slipDeg) > 8 && Math.abs(r.gazeDeg) > BUD.gaze)
    say.push(`looking ${r.gazeDeg} deg off her direction of travel while sliding ${r.slipDeg} deg (budget ${BUD.gaze})`);
  // A SURFSKATE RIDES WITH THE FEET ACROSS THE DECK. Anything under 45 deg is
  // a shoe lying along the plank, which is what shipped and what the owner
  // saw. The pushing foot is exempt: it is off the board and on the road.
  if (r.shoeL && r.shoeL.deg < BUD.shoeMin) say.push(`front shoe only ${r.shoeL.deg} deg across the deck (budget ${BUD.shoeMin}+)`);
  // TOES ON THE RAIL, NOT OVER IT — surfskate.love is explicit about this.
  const rail = 0.1175;
  for (const [nm, sh] of [['front', r.shoeL], ['back', r.shoeR]]) {
    if (!sh) continue;
    if (nm === 'back' && pushingNow) continue;
    const over = -sh.toeX - rail;
    if (over > BUD.toeOver) say.push(`${nm} toes hang ${(over * 1000).toFixed(0)}mm past the rail (budget ${BUD.toeOver * 1000})`);
  }
  if (!pushingNow && r.shoeR && r.shoeR.deg < BUD.shoeMin) say.push(`back shoe only ${r.shoeR.deg} deg across the deck (budget ${BUD.shoeMin}+)`);

  rows.push({ name, ...r, findings: say });
  const tag = say.length ? 'FAIL' : 'ok  ';
  console.log(`\n  ${tag} ${name.padEnd(6)} ${String(r.kmh).padStart(5)} km/h  push ${r.pose && r.pose.pushing ? 'YES' : ' no'}`);
  console.log(`       grip top y ${gripY.toFixed(3)} (avatar frame ${r.gripTopAvatarY})  road ${r.roadY}  deck->road ${r.deckToRoad}   front sole ${r.soleL.toFixed(3)} (${((r.soleL - gripY) * 1000).toFixed(0)}mm)   back sole ${r.soleR.toFixed(3)} (${((r.soleR - gripY) * 1000).toFixed(0)}mm)`);
  console.log(`       ankles  front [${r.ankleL}]  back [${r.ankleR}]`);
  console.log(`       shoes  front ${r.shoeL.deg} deg across (toe x ${r.shoeL.toeX})   back ${r.shoeR.deg} deg (toe x ${r.shoeR.toeX})   rail +/-0.1175`);
  console.log(`       shoulders ${r.shoulderDeg} deg off the deck   chest ${r.chestDeg}   head ${r.headDeg}   neck ${r.neckDeg}`);
  console.log(`       sliding ${r.slipDeg} deg   gaze ${r.gazeDeg} deg off the course`);
  for (const f of say) { console.log(`         - ${f}`); bad++; }
}

mkdirSync('shots/ridecam', { recursive: true });
writeFileSync('shots/ridecam/stancecheck.json', JSON.stringify(rows, null, 2));
console.log(`\n  ${bad} finding(s)`);
await browser.close();
process.exit(bad ? 1 : 0);
