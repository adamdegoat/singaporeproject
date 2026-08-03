// Cloudflare adapter: one Durable Object = one room, WebSocket Hibernation.
// The RoomHub core is shared verbatim with the local/test adapter — this file
// only owns sockets, hibernation state, and the worker router.
//
// HIBERNATION CONTRACT (why this file looks the way it does): while a room
// is idle Cloudflare evicts the DO from memory but keeps the sockets. On the
// next message a FRESH instance wakes with an EMPTY hub — so everything a
// room must not forget (roster identity, hide-and-seek phase) lives in
// per-socket attachments and DO storage, and _wake() rebuilds the hub from
// them. Positions are deliberately NOT persisted: they repopulate at 10Hz
// within a second of anyone moving.
import { RoomHub, PROTO, ROOM_CAP } from './server.js';

const PLACES = ['SILOSO', 'PALAWAN', 'TANJONG', 'IMBIAH', 'COVE', 'SERAPONG'];

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.hub = null;      // built lazily by _wake()
    this.code = null;
  }

  async _wake() {
    if (this.hub) return;
    this.hub = new RoomHub({});
    this.code = (await this.ctx.storage.get('code')) || 'ROOM-0';
    const hs = await this.ctx.storage.get('hs');
    const room = {
      code: this.code, players: new Map(), touched: Date.now(),
      hs: hs || { phase: 'lobby', seeker: null, endsAt: 0, zone: null, caught: [] },
    };
    this.hub.rooms.set(this.code, room);
    // resurrect the roster from surviving sockets' attachments
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment();
      if (!att || !att.id) continue;
      const conn = this._conn(ws);
      room.players.set(att.id, {
        id: att.id, name: att.name || 'player', hue: att.hue | 0,
        ready: true, conn, last: null, graceUntil: 0, lastEmote: 0,
      });
      conn.id = att.id;
      conn.room = this.code;
    }
    // persist hs on every mutation without touching the core: wrap _cast —
    // every phase change broadcasts, so it is the one reliable hook
    const cast = this.hub._cast.bind(this.hub);
    this.hub._cast = (r, msg, ex) => {
      if (msg.t === 'hs' || msg.t === 'hs_caught') this.ctx.storage.put('hs', r.hs);
      cast(r, msg, ex);
    };
  }

  _conn(ws) {
    if (ws._conn) return ws._conn;
    ws._conn = {
      id: null, room: null,
      send: (obj) => { try { ws.send(JSON.stringify(obj)); } catch {} },
      close: () => { try { ws.close(); } catch {} },
    };
    return ws._conn;
  }

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/occupied') {
      await this._wake();
      const n = this.hub.rooms.get(this.code)?.players.size || 0;
      return new Response(String(n));
    }
    if (url.pathname === '/seed') {
      // the worker names this DO by its code; remember it for wakes
      const code = url.searchParams.get('code') || 'ROOM-0';
      await this.ctx.storage.put('code', code);
      this.code = code;
      this.hub = null;                     // rebuild with the right code
      return new Response('ok');
    }
    if (req.headers.get('Upgrade') !== 'websocket') {
      return new Response('websocket only', { status: 426 });
    }
    await this._wake();
    const pair = new WebSocketPair();
    // Hibernation API: accept via the context so the runtime owns the socket
    this.ctx.acceptWebSocket(pair[1]);
    this.ctx.storage.setAlarm(Date.now() + 30_000);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws, raw) {
    await this._wake();
    const conn = this._conn(ws);
    // room code is fixed per-DO: force hellos into OUR room, and stamp the
    // attachment so the roster survives hibernation
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.t === 'hello') {
      msg.room = this.code;
      ws.serializeAttachment({ id: String(msg.id || '').slice(0, 24),
                               name: String(msg.name || '').slice(0, 24),
                               hue: msg.hue | 0 });
    }
    this.hub.onMessage(conn, msg);
    // re-bind conn identity onto the accepted socket after hello
    if (msg.t === 'hello' && conn.id) ws._conn = conn;
  }

  async webSocketClose(ws) {
    await this._wake();
    this.hub.onClose(this._conn(ws));
  }

  async webSocketError(ws) {
    await this._wake();
    this.hub.onClose(this._conn(ws));
  }

  async alarm() {
    await this._wake();
    this.hub.tick();
    const room = this.hub.rooms.get(this.code);
    // keep ticking while anyone is seated (grace included); an empty room
    // simply stops arming the alarm and hibernates its way to free
    if (room && room.players.size) this.ctx.storage.setAlarm(Date.now() + 30_000);
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    // the game is served from GitHub Pages; keep the door narrow but honest
    const cors = {
      'Access-Control-Allow-Origin': origin.includes('adamdegoat.github.io') || origin.includes('localhost') ? origin : 'https://adamdegoat.github.io',
      'Access-Control-Allow-Methods': 'GET,POST',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (url.pathname === '/create') {
      // pick an unoccupied PLACE-N; each candidate room is its own DO, so
      // uniqueness is a per-candidate occupancy probe, retried a few times
      for (let i = 0; i < 6; i++) {
        const code = PLACES[(Math.random() * PLACES.length) | 0] + '-' + (1 + (Math.random() * 99 | 0));
        const stub = env.ROOM.get(env.ROOM.idFromName(code), { locationHint: 'apac' });
        const n = +(await (await stub.fetch('https://do/occupied')).text());
        if (!n) {
          await stub.fetch('https://do/seed?code=' + code);
          return new Response(JSON.stringify({ code, v: PROTO }), {
            headers: { 'content-type': 'application/json', ...cors },
          });
        }
      }
      return new Response(JSON.stringify({ err: 'busy' }), { status: 503, headers: cors });
    }

    if (url.pathname === '/ws') {
      const code = (url.searchParams.get('room') || '').toUpperCase().slice(0, 16);
      if (!/^[A-Z]+-\d+$/.test(code)) return new Response('bad room', { status: 400, headers: cors });
      const stub = env.ROOM.get(env.ROOM.idFromName(code), { locationHint: 'apac' });
      await stub.fetch('https://do/seed?code=' + code);
      return stub.fetch(req);
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, v: PROTO }), {
        headers: { 'content-type': 'application/json', ...cors },
      });
    }
    return new Response('sentosa relay', { headers: cors });
  },
};
