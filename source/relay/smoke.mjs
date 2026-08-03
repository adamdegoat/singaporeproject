// The deployed-relay smoke test — the multiplayer deploy gate.
// Two real clients over wss://: create a room, both join, positions relay
// both ways, clean disconnect. Run: node relay/smoke.mjs [base-url]
import { PROTO } from './server.js';

const BASE = process.argv[2] || 'https://sentosa-relay.propsightsg.workers.dev';
const WSS = BASE.replace(/^http/, 'ws');
let failed = 0;
const ok = (c, n, d = '') => { console.log(c ? '  ok  ' : '  FAIL', n, c ? '' : d); if (!c) failed++; };

const health = await (await fetch(BASE + '/health')).json();
ok(health.ok && health.v === PROTO, 'health + protocol version', JSON.stringify(health));

const { code } = await (await fetch(BASE + '/create')).json();
ok(/^[A-Z]+-\d+$/.test(code || ''), 'room created: ' + code);

function join(id, name) {
  const sock = new WebSocket(`${WSS}/ws?room=${code}`);
  const inbox = [];
  const waiters = [];
  sock.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    const i = waiters.findIndex((w) => w.match(m));
    if (i >= 0) waiters.splice(i, 1)[0].resolve(m); else inbox.push(m);
  };
  const next = (match, ms = 6000) => new Promise((res, rej) => {
    const i = inbox.findIndex(match);
    if (i >= 0) return res(inbox.splice(i, 1)[0]);
    const w = { match, resolve: res };
    waiters.push(w);
    setTimeout(() => { const j = waiters.indexOf(w); if (j >= 0) { waiters.splice(j, 1); rej(new Error('timeout')); } }, ms);
  });
  return new Promise((res) => {
    sock.onopen = () => {
      sock.send(JSON.stringify({ t: 'hello', v: PROTO, room: code, id, name, hue: 120 }));
      res({ sock, next, send: (o) => sock.send(JSON.stringify(o)) });
    };
  });
}

const t0 = Date.now();
const a = await join('smoke-a', 'SmokeA');
const wa = await a.next((m) => m.t === 'welcome');
ok(wa.selfId === 'smoke-a', 'client A welcomed (rtt ' + (Date.now() - t0) + 'ms)');

const b = await join('smoke-b', 'SmokeB');
await b.next((m) => m.t === 'welcome');
await a.next((m) => m.t === 'pjoin');
ok(true, 'client B joined, A saw it');

a.send({ t: 's', x: 5, z: 7, heading: 0.5, speed: 3, mode: 'r' });
const sb = await b.next((m) => m.t === 's');
ok(sb.id === 'smoke-a' && sb.x === 5, 'A\'s movement reached B over the wire');
b.send({ t: 's', x: 9, z: 1, heading: 1, speed: 0, mode: 'w' });
const sa = await a.next((m) => m.t === 's');
ok(sa.id === 'smoke-b' && sa.z === 1, 'B\'s movement reached A over the wire');

a.sock.close(); b.sock.close();
console.log(failed ? failed + ' FAILED' : 'smoke passed');
process.exit(failed ? 1 : 0);
