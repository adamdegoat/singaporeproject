// The Sentosa game's room server — the CORE, transport-agnostic.
//
// One RoomHub holds many rooms; a room is 2-8 friends exploring together or
// playing hide and seek. This file knows NOTHING about WebSockets: an adapter
// (local.mjs for dev/tests, do.js for Cloudflare Durable Objects in
// production) owns sockets and calls onMessage/onClose with a `conn` object
// carrying a send(obj) callback. That split is deliberate — the hosting
// research chose Durable Objects, but the core must survive a hosting change
// and be testable in Node in milliseconds.
//
// PROTOCOL v1 (JSON, version-stamped in hello; a mismatch fails LOUDLY at
// join — never silently mid-game):
//   client -> server: hello{v,room,id,name,hue,loading} · ready{} ·
//     s{x,z,heading,speed,mode} · e{kind,x?,z?} · create{} ·
//     hs_start{zone} · hs_tag{target} · ping{}
//   server -> client: welcome{selfId,players,room,hs,time} · err{code} ·
//     pjoin{p} · pleave{id} · pready{id} · s{id,...} · e{id,kind,x,z} ·
//     room{code} · hs{phase,seeker,endsAt,zone,caught} · hs_caught{id,by} ·
//     pong{}
//
// TRUST MODEL: friends in private rooms. Positions are client-authoritative;
// the server validates only what keeps a game coherent (who is seeker, phase,
// a generous tag distance) — there is no anti-cheat and none is wanted.

export const PROTO = 1;
export const ROOM_CAP = 8;
// iOS kills sockets silently on app-switch; the player is NOT gone. Their
// seat survives a grace window and an idempotent rejoin (same id) retakes it.
export const GRACE_MS = 60_000;
export const ROOM_TTL_MS = 5 * 60_000;   // empty rooms are collected

const PLACES = ['SILOSO', 'PALAWAN', 'TANJONG', 'IMBIAH', 'COVE', 'SERAPONG'];

// Proximity tag (owner's call): seeker within TAG_M of a hider = caught.
// The server re-checks against its cached positions with 1.5x slack for
// latency — the seeker's client computed it against fresher data.
export const TAG_M = 4;

export class RoomHub {
  constructor(opts = {}) {
    this.now = opts.now || (() => Date.now());
    this.hideSecs = opts.hideSecs ?? 30;
    this.seekSecs = opts.seekSecs ?? 300;
    this.endSecs = opts.endSecs ?? 12;
    this.rand = opts.rand || Math.random;
    this.rooms = new Map();
  }

  // ---- adapter surface ----------------------------------------------------
  onMessage(conn, raw) {
    let m;
    try { m = typeof raw === 'string' ? JSON.parse(raw) : raw; }
    catch { return; }
    const t = m && m.t;
    if (t === 'hello') return this._hello(conn, m);
    if (t === 'create') return this._create(conn, m);
    if (t === 'ping') return conn.send({ t: 'pong' });
    const room = this.rooms.get(conn.room);
    const me = room && room.players.get(conn.id);
    if (!room || !me) return conn.send({ t: 'err', code: 'noroom' });
    this._advance(room);
    if (t === 'ready') {
      me.ready = true;
      this._cast(room, { t: 'pready', id: me.id });
    } else if (t === 's') {
      me.last = { x: +m.x || 0, z: +m.z || 0, h: +m.heading || 0,
                  v: +m.speed || 0, mode: m.mode === 'w' ? 'w' : 'r', at: this.now() };
      this._cast(room, { t: 's', id: me.id, x: me.last.x, z: me.last.z,
                         heading: me.last.h, speed: me.last.v, mode: me.last.mode }, me.id);
    } else if (t === 'e') {
      // emotes/pings, rate-limited server-side too (1/s, cheap token)
      const now = this.now();
      if (me.lastEmote && now - me.lastEmote < 900) return;
      me.lastEmote = now;
      const kind = String(m.kind || '').slice(0, 12);
      this._cast(room, { t: 'e', id: me.id, kind, x: +m.x || 0, z: +m.z || 0 }, me.id);
    } else if (t === 'hs_start') {
      this._hsStart(room, me, m);
    } else if (t === 'hs_tag') {
      this._hsTag(room, me, m);
    }
  }

  onClose(conn) {
    const room = this.rooms.get(conn.room);
    const me = room && room.players.get(conn.id);
    if (!me) return;
    // grace, not goodbye: the phone probably just locked
    me.conn = null;
    me.graceUntil = this.now() + GRACE_MS;
    this._sweep(room);
  }

  // periodic housekeeping — adapters call ~1/s (local timer / DO alarm)
  tick() {
    for (const [code, room] of this.rooms) {
      this._advance(room);
      this._sweep(room);
      if (!room.players.size && this.now() - room.touched > ROOM_TTL_MS) {
        this.rooms.delete(code);
      }
    }
  }

  // ---- joining ------------------------------------------------------------
  _create(conn, m) {
    let code = null;
    for (let i = 0; i < 50 && !code; i++) {
      const c = PLACES[(this.rand() * PLACES.length) | 0] + '-' + (1 + (this.rand() * 99) | 0);
      if (!this.rooms.has(c)) code = c;
    }
    if (!code) return conn.send({ t: 'err', code: 'full' });
    this.rooms.set(code, {
      code, players: new Map(), touched: this.now(),
      hs: { phase: 'lobby', seeker: null, endsAt: 0, zone: null, caught: [] },
    });
    conn.send({ t: 'room', code });
    // fall through: the client follows with hello{room: code}
  }

  _hello(conn, m) {
    if ((m.v | 0) !== PROTO) return conn.send({ t: 'err', code: 'version' });
    const code = String(m.room || '').toUpperCase().slice(0, 16);
    const room = this.rooms.get(code);
    if (!room) return conn.send({ t: 'err', code: 'noroom' });
    this._advance(room);
    const id = String(m.id || '').slice(0, 24);
    if (!id) return conn.send({ t: 'err', code: 'badid' });
    let me = room.players.get(id);
    if (me) {
      // idempotent rejoin: same id retakes the seat, stale socket replaced
      if (me.conn && me.conn !== conn) { try { me.conn.close(); } catch {} }
      me.conn = conn;
      me.graceUntil = 0;
      if (m.name) me.name = String(m.name).slice(0, 24);
    } else {
      this._sweep(room);
      if (room.players.size >= ROOM_CAP) return conn.send({ t: 'err', code: 'full' });
      me = { id, name: String(m.name || 'player').slice(0, 24),
             hue: Math.max(0, Math.min(359, m.hue | 0)),
             ready: !m.loading, conn, last: null, graceUntil: 0, lastEmote: 0 };
      room.players.set(id, me);
      this._cast(room, { t: 'pjoin', p: this._pub(me) }, id);
    }
    conn.id = id;
    conn.room = code;
    room.touched = this.now();
    conn.send({
      t: 'welcome', selfId: id, room: code, time: this.now(),
      players: [...room.players.values()].map((p) => this._pub(p)),
      hs: this._hsPub(room),
    });
  }

  // ---- hide and seek ------------------------------------------------------
  // lobby -> hiding(countdown; hiders scatter, seeker waits) ->
  // seeking(timer) -> end(scoreboard beat) -> lobby. The server owns phases;
  // detection is the seeker's client with loose server validation.
  _hsStart(room, me, m) {
    if (room.hs.phase !== 'lobby' && room.hs.phase !== 'end') return;
    if (room.players.size < 2) return me.conn && me.conn.send({ t: 'err', code: 'alone' });
    const ids = [...room.players.keys()];
    room.hs = {
      phase: 'hiding',
      seeker: ids[(this.rand() * ids.length) | 0],
      endsAt: this.now() + this.hideSecs * 1000,
      zone: String(m.zone || 'siloso').slice(0, 16),
      caught: [],
    };
    this._cast(room, { t: 'hs', ...this._hsPub(room) });
  }

  _hsTag(room, me, m) {
    const hs = room.hs;
    if (hs.phase !== 'seeking' || me.id !== hs.seeker) return;
    const target = room.players.get(String(m.target || ''));
    if (!target || target.id === me.id || hs.caught.includes(target.id)) return;
    // loose validation against cached positions — the seeker's client saw
    // fresher interpolated data than we hold at 10Hz
    if (me.last && target.last) {
      const d = Math.hypot(me.last.x - target.last.x, me.last.z - target.last.z);
      if (d > TAG_M * 1.5) return;
    }
    hs.caught.push(target.id);
    this._cast(room, { t: 'hs_caught', id: target.id, by: me.id });
    const hiders = [...room.players.keys()].filter((id) => id !== hs.seeker);
    if (hiders.every((id) => hs.caught.includes(id))) {
      hs.phase = 'end';
      hs.endsAt = this.now() + this.endSecs * 1000;
      this._cast(room, { t: 'hs', ...this._hsPub(room) });
    }
  }

  _advance(room) {
    const hs = room.hs;
    if (!hs.endsAt || this.now() < hs.endsAt) return;
    if (hs.phase === 'hiding') {
      hs.phase = 'seeking';
      hs.endsAt = this.now() + this.seekSecs * 1000;
      this._cast(room, { t: 'hs', ...this._hsPub(room) });
    } else if (hs.phase === 'seeking' || hs.phase === 'end') {
      room.hs = { phase: 'lobby', seeker: null, endsAt: 0, zone: null, caught: [] };
      this._cast(room, { t: 'hs', ...this._hsPub(room) });
    }
  }

  // ---- plumbing -----------------------------------------------------------
  _sweep(room) {
    const now = this.now();
    for (const [id, p] of room.players) {
      if (!p.conn && p.graceUntil && now > p.graceUntil) {
        room.players.delete(id);
        this._cast(room, { t: 'pleave', id });
        if (room.hs.seeker === id) {
          // the seeker left for real: the round cannot continue
          room.hs = { phase: 'lobby', seeker: null, endsAt: 0, zone: null, caught: [] };
          this._cast(room, { t: 'hs', ...this._hsPub(room) });
        }
      }
    }
    if (room.players.size) room.touched = now;
  }

  _cast(room, msg, exceptId = null) {
    for (const p of room.players.values()) {
      if (p.id === exceptId || !p.conn) continue;
      try { p.conn.send(msg); } catch { /* adapter owns socket death */ }
    }
  }

  _pub(p) {
    return { id: p.id, name: p.name, hue: p.hue, ready: p.ready,
             online: !!p.conn, last: p.last ? { x: p.last.x, z: p.last.z, mode: p.last.mode } : null };
  }

  _hsPub(room) {
    const h = room.hs;
    return { phase: h.phase, seeker: h.seeker, endsAt: h.endsAt, zone: h.zone, caught: [...h.caught] };
  }
}
