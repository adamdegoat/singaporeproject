// THE PLAYER JOURNEY, END TO END, WITH TWO REAL CLIENTS.
//
// Every static check passed on 2026-08-04 while a rider's friend stood
// frozen at his get-off point — the bug lived in a SEQUENCE (get off,
// remount, ride away) that no snapshot audit walks. This gate walks it:
// two headless browsers join one relay room and play the journey a real
// pair plays, and each step asserts what the OTHER player sees.
//
//   1. both boot to a running world (no exceptions, HUD alive)
//   2. both end up in-room and see each other
//   3. B rides — A's copy of B moves within the interp window
//   4. B gets off — A sees the walker rig within 3s
//   5. B remounts and rides — A sees the skater rig move again
//   6. B's sender dies silently — A HIDES B within ~5s (no frozen body)
//   7. B's page closes — A gets the leave and B is disposed
//
// Runs against SG_PORT (the deploy snapshot's own server) and the REAL
// relay, same as the wss smoke — a QA-{n} room, freshly random per run.
// SG_NOJOURNEY=1 skips (emergency lane only; say why in the deploy message).
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH || '/Users/ZY/receptionig/node_modules/playwright/index.mjs');

const PORT = process.env.SG_PORT || 8933;
const ROOM = 'QA-' + Math.floor(Math.random() * 9000 + 1000);
const URL = `http://localhost:${PORT}/?district=sentosa&nostream&room=${ROOM}&name=`;

let failed = 0, passed = 0;
const ok = (cond, label) => {
  if (cond) { passed++; console.log(`  ok   ${label}`); }
  else { failed++; console.log(`  FAIL ${label}`); }
};

// Foreground phones do not throttle timers; headless Chromium does, and a
// throttled sender plus the 3s heartbeat reads as a flapping connection.
// These flags make the harness behave like the foreground device it stands
// in for. Without them this gate fails on ENVIRONMENT, not on the game.
// ONE BROWSER PER PLAYER. Two pages in one browser share tab focus, and the
// first page's rAF pauses as a background tab — its net messages still
// arrive (the buffer grows) but update() never runs, so every presentation
// assertion fails on the HARNESS, not the game. Measured: identical failure
// signature across three runs before this was understood.
// ...and REAL GPU: headless defaults to SwiftShader, the world renders at
// ~1fps, and PHYSICS ADVANCES WITH THE RENDER LOOP — B "rode" 1.5m in 20s
// and every movement assertion starved. The 2026-07-30 lesson, re-paid:
// headless is only software GL without the angle flags.
const LAUNCH = { headless: true, args: [
  '--use-gl=angle', '--use-angle=metal',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
] };
const browsers = [];
async function boot(name) {
  const browser = await chromium.launch(LAUNCH);
  browsers.push(browser);
  const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
  page.on('pageerror', (e) => { failed++; console.log(`  FAIL [${name}] pageerror: ${e.message}`); });
  await page.goto(URL + name, { waitUntil: 'load' });
  await page.waitForFunction(() => {
    const b = document.getElementById('boot');
    return window.__teleport && (!b || b.classList.contains('off') || b.style.display === 'none');
  }, undefined, { timeout: 300000 });
  return page;
}

const t0 = Date.now();
const A = await boot('JourneyA');
const B = await boot('JourneyB');
ok(true, `both worlds booted (${((Date.now() - t0) / 1000).toFixed(0)}s)`);

// 2. in-room, mutually visible
await A.waitForFunction(() => window.__net && window.__net.status === 'in-room'
  && window.__net.remotes.size >= 1, undefined, { timeout: 45000 }).catch(() => {});
const seen = await A.evaluate(() => ({
  status: window.__net && window.__net.status,
  remotes: window.__net ? window.__net.remotes.size : 0,
}));
ok(seen.status === 'in-room' && seen.remotes >= 1, `A in-room and sees B (${JSON.stringify(seen)})`);

// wait until A's copy of B carries a REAL snapshot — measuring against the
// rig's default origin once scored a 12.8km "movement"
await A.waitForFunction(() => {
  const r = [...window.__net.remotes.values()][0];
  return r && r.buf && r.buf.length > 0;
}, undefined, { timeout: 30000 }).catch(() => {});
const bPosOnA = async () => {
  await A.bringToFront().catch(() => {});
  await A.waitForTimeout(400);      // one honest frame after focus
  return A.evaluate(() => {
    const r = [...window.__net.remotes.values()][0];
    return r ? { x: r.group.position.x, z: r.group.position.z, visible: r.group.visible,
                 walker: r.walker ? r.walker.visible : null } : null;
  });
};

// 3. B rides; A's copy moves. Three drive renewals: the skate accelerates
// honestly (vMax takes seconds), so a short burst only proves ~1m.
const p0 = await bPosOnA();
const b0 = await B.evaluate(() => ({ ...window.__net.deps.getState() }));
for (let i = 0; i < 3; i++) {
  // __drive resolves when the throttle lifts, so awaiting the evaluate IS the
  // wait; only a short settle is needed for the net tick to carry the move.
  await B.evaluate(() => window.__drive && window.__drive(1.0, 0, 2.4));
  await B.waitForTimeout(300);
}
const b1 = await B.evaluate(() => ({ ...window.__net.deps.getState() }));
const bMoved = Math.hypot(b1.x - b0.x, b1.z - b0.z);
const p1 = await bPosOnA();
const moved = p0 && p1 ? Math.hypot(p1.x - p0.x, p1.z - p0.z) : 0;
console.log(`       (B locally moved ${bMoved.toFixed(1)}m, speed ${b1.speed.toFixed(1)})`);
ok(moved > 1.5, `B's movement reaches A (moved ${moved.toFixed(1)}m on A's screen)`);

// 4. B gets off; A sees the walker
await B.evaluate(() => document.getElementById('modebtn').click());
await A.waitForTimeout(3000);
const pw = await bPosOnA();
ok(pw && pw.visible && pw.walker === true, `A sees B on foot after get-off (${JSON.stringify(pw)})`);

// 5. B remounts and rides; A sees the skater move
await B.evaluate(() => document.getElementById('modebtn').click());
await B.waitForTimeout(600);
for (let i = 0; i < 3; i++) {
  await B.evaluate(() => window.__drive && window.__drive(1.0, 0.15, 2.4));
  await B.waitForTimeout(300);
}
const pr = await bPosOnA();
const rode = pw && pr ? Math.hypot(pr.x - pw.x, pr.z - pw.z) : 0;
ok(pr && pr.walker === false && rode > 1.5,
   `A sees B remount and ride away (${rode.toFixed(1)}m, walker=${pr && pr.walker})`);

// 6. B goes silent (backgrounded phone) — A must HIDE the body, never freeze it
await B.evaluate(() => clearInterval(window.__net._sendTimer));
await A.waitForTimeout(6500);
const ps = await bPosOnA();
ok(ps && ps.visible === false, `A hides a silent B instead of freezing it (visible=${ps && ps.visible})`);

// 7. B's browser dies. The server holds the seat in GRACE on a dead socket
// (the phone-locked case, by design), so the honest player-visible contract
// is: B is either REMOVED (clean pleave) or HIDDEN (grace + staleness) —
// never a frozen body.
await B.close();
await A.waitForTimeout(4500);
const after = await A.evaluate(() => {
  const r = [...window.__net.remotes.values()][0];
  return { remotes: window.__net.remotes.size, visible: r ? r.group.visible : null };
});
ok(after.remotes === 0 || after.visible === false,
   `after B dies he is removed or hidden, never frozen (${JSON.stringify(after)})`);

for (const b of browsers) await b.close().catch(() => {});
console.log(failed ? `${failed} FAILED, ${passed} passed` : `journey: all ${passed} passed`);
process.exit(failed ? 1 : 0);
