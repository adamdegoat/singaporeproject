// The relay's own gate: joins, echo, grace, version rejection, room caps and
// a full scripted hide-and-seek round — seconds, no deploy, no browser.
// Run: node relay/test.mjs
import { startLocal } from './local.mjs';
import { PROTO } from './server.js';

const PORT = 8941;
let passed = 0, failed = 0;
const ok = (cond, name, detail = '') => {
  if (cond) { passed++; console.log('  ok  ', name); }
  else { failed++; console.log('  FAIL', name, detail); }
};

// a tiny promise-based client on the builtin WebSocket
function client() {
  const sock = new WebSocket(`ws://localhost:${PORT}`);
  const inbox = [];
  const waiters = [];
  sock.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    const w = waiters.findIndex((f) => f.match(m));
    if (w >= 0) waiters.splice(w, 1)[0].resolve(m);
    else inbox.push(m);
  };
  const next = (match, ms = 2000) => new Promise((resolve, reject) => {
    const i = inbox.findIndex(match);
    if (i >= 0) return resolve(inbox.splice(i, 1)[0]);
    const f = { match, resolve };
    waiters.push(f);
    setTimeout(() => {
      const w = waiters.indexOf(f);
      if (w >= 0) { waiters.splice(w, 1); reject(new Error('timeout: ' + match)); }
    }, ms);
  });
  const send = (o) => sock.send(JSON.stringify(o));
  const open = new Promise((r) => { sock.onopen = r; });
  return { sock, send, next, open, inbox };
}

const { hub, stop } = startLocal(PORT, { hideSecs: 1, seekSecs: 3, endSecs: 1 });

try {
  // -- create + join + welcome ---------------------------------------------
  const a = client(); await a.open;
  a.send({ t: 'create' });
  const room = (await a.next((m) => m.t === 'room')).code;
  ok(/^[A-Z]+-\d+$/.test(room), 'room code is PLACE-N', room);
  a.send({ t: 'hello', v: PROTO, room, id: 'aa', name: 'Zy', hue: 20 });
  const wa = await a.next((m) => m.t === 'welcome');
  ok(wa.selfId === 'aa' && wa.players.length === 1, 'creator welcomed with roster');

  // -- version mismatch is LOUD at join ------------------------------------
  const v = client(); await v.open;
  v.send({ t: 'hello', v: 99, room, id: 'vv' });
  ok((await v.next((m) => m.t === 'err')).code === 'version', 'wrong protocol rejected at join');
  v.sock.close();

  // -- second player, join broadcast, state echo ---------------------------
  const b = client(); await b.open;
  b.send({ t: 'hello', v: PROTO, room, id: 'bb', name: 'Friend', hue: 200 });
  await b.next((m) => m.t === 'welcome');
  ok((await a.next((m) => m.t === 'pjoin')).p.id === 'bb', 'join broadcast to the room');
  a.send({ t: 's', x: 10, z: 20, heading: 1.2, speed: 5, mode: 'r' });
  const sb = await b.next((m) => m.t === 's');
  ok(sb.id === 'aa' && sb.x === 10 && sb.z === 20, 'position relayed to the friend');
  b.send({ t: 's', x: 12, z: 20, heading: 0, speed: 0, mode: 'w' });
  await a.next((m) => m.t === 's');

  // -- emote rate limit ----------------------------------------------------
  a.send({ t: 'e', kind: 'wave' });
  a.send({ t: 'e', kind: 'wave' });
  await b.next((m) => m.t === 'e');
  let second = true;
  try { await b.next((m) => m.t === 'e', 300); } catch { second = false; }
  ok(!second, 'second emote inside 1s is dropped');

  // -- hide and seek: full round -------------------------------------------
  a.send({ t: 'hs_start', zone: 'siloso' });
  const h1 = await a.next((m) => m.t === 'hs' && m.phase === 'hiding');
  ok(['aa', 'bb'].includes(h1.seeker), 'round started, seeker picked');
  const h2 = await a.next((m) => m.t === 'hs' && m.phase === 'seeking', 4000);
  ok(!!h2, 'hiding countdown advanced to seeking');
  // seeker tags from far away -> rejected; close -> caught
  const seeker = h2.seeker, hider = seeker === 'aa' ? 'bb' : 'aa';
  const sC = seeker === 'aa' ? a : b, hC = seeker === 'aa' ? b : a;
  sC.send({ t: 's', x: 0, z: 0, heading: 0, speed: 0, mode: 'w' });
  hC.send({ t: 's', x: 500, z: 500, heading: 0, speed: 0, mode: 'w' });
  await new Promise((r) => setTimeout(r, 60));
  sC.send({ t: 'hs_tag', target: hider });
  let farTag = true;
  try { await sC.next((m) => m.t === 'hs_caught', 300); } catch { farTag = false; }
  ok(!farTag, 'a tag from 700m away is rejected');
  hC.send({ t: 's', x: 2, z: 2, heading: 0, speed: 0, mode: 'w' });
  await new Promise((r) => setTimeout(r, 60));
  sC.send({ t: 'hs_tag', target: hider });
  const caught = await sC.next((m) => m.t === 'hs_caught');
  ok(caught.id === hider, 'proximity tag lands');
  const hEnd = await sC.next((m) => m.t === 'hs' && m.phase === 'end', 2000);
  ok(!!hEnd, 'all hiders caught ends the round');

  // -- iOS-style silent death + idempotent rejoin --------------------------
  b.sock.close();                     // phone locked
  await new Promise((r) => setTimeout(r, 150));
  const b2 = client(); await b2.open;
  b2.send({ t: 'hello', v: PROTO, room, id: 'bb', name: 'Friend', hue: 200 });
  const wb2 = await b2.next((m) => m.t === 'welcome');
  ok(wb2.players.length === 2, 'rejoin with same id retakes the seat (no pleave fired)');

  // -- room cap ------------------------------------------------------------
  const extras = [];
  for (let i = 0; i < 7; i++) {
    const c = client(); await c.open;
    c.send({ t: 'hello', v: PROTO, room, id: 'x' + i, name: 'X' + i, hue: 0 });
    extras.push(c);
  }
  let fullSeen = false;
  for (const c of extras) {
    try {
      const m = await Promise.race([c.next((x) => x.t === 'welcome' || x.t === 'err', 1500)]);
      if (m.t === 'err' && m.code === 'full') fullSeen = true;
    } catch {}
  }
  ok(fullSeen, 'the 9th player is refused: room caps at 8');
} catch (e) {
  failed++;
  console.log('  FAIL (exception)', e.message);
} finally {
  stop();
}
console.log(failed ? `${failed} FAILED, ${passed} passed` : `${passed} passed`);
process.exit(failed ? 1 : 0);
