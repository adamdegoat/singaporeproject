// The multiplayer client: rooms of friends on one island.
//
// INERT BY CONSTRUCTION unless the page carries ?room= — every audit,
// determinism run and probe boots with zero net code executing, zero remote
// rigs in the scene, zero contact with the placement RNG. Remote players are
// pure scene-graph additions (the probe pattern): rigs added straight to the
// scene, positioned from network state, never through the builders.
//
// iOS SAFARI CONTRACT (researched 2026-08-03, WebKit bug-verified):
// backgrounding/locking KILLS the socket SILENTLY — often no close/error
// event, and readyState keeps lying OPEN. So this file never trusts onclose:
// visibilitychange + pageshow drive reconnection, every return-to-foreground
// treats the old socket as dead, and rejoin is idempotent (same session id
// retakes the same seat inside the server's grace window). An app-level
// heartbeat is the second detector for silent mid-session death.
import * as THREE from '../lib/three.module.js';

export const NET_PROTO = 1;
const SEND_HZ = 10;                      // on a TIMER, never per frame
const INTERP_MS = 120;                   // render remotes this far in the past
const SNAP_MS = 500;                     // gaps beyond this snap, no ghosts
const HEARTBEAT_MS = 3000;               // was 5000: a silent socket is now
                                         // detected in ~6s, not ~10 — the
                                         // stuck-friend window (below) shrinks
// A REMOTE NOBODY HAS HEARD FROM IS NOT A PERSON STANDING THERE. The owner
// caught this live: his friend got off, remounted and rode away, and the
// standing walker stayed planted at the get-off point — the interpolator
// freezes on the last snapshot, so ANY delivery gap (backgrounded tab
// throttling the send timer, a silently dead socket, a reconnect window, DO
// hibernation wake) shows a frozen body indistinguishable from a real one.
// Measured in the two-client repro: 8s-stale remotes on a healthy relay.
// A genuinely idle player still sends ~1Hz keepalives, so silence past this
// window means the state is UNKNOWN — and the honest render of unknown is
// nothing, not a mannequin. The avatar returns on the next snapshot.
const STALE_MS = 4000;

export class Net {
  // deps: { scene, surfaceAt, buildSkate, buildSkater, buildWalker,
  //         getState: () => ({x,z,heading,speed,mode}), onRoster, onStatus }
  constructor(relayBase, room, identity, deps) {
    this.base = relayBase.replace(/\/$/, '');
    this.wss = this.base.replace(/^http/, 'ws');
    this.room = room.toUpperCase();
    this.id = identity.id;
    this.name = identity.name;
    this.hue = identity.hue | 0;
    this.deps = deps;
    this.remotes = new Map();            // id -> RemotePlayer
    this.sock = null;
    this.alive = false;
    this.lastHeard = 0;
    this.backoff = 1000;
    this._sendTimer = null;
    this._connect();
    // THE FOREGROUND IS THE RECONNECT SIGNAL — not the socket's own events.
    const wake = () => {
      if (document.visibilityState !== 'visible') { this._quiet(); return; }
      this._reconnect('foreground');
    };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('pageshow', wake);       // bfcache restores
    window.addEventListener('online', () => this._reconnect('online'));
  }

  // ---- connection lifecycle ----------------------------------------------
  _connect() {
    this._status('connecting');
    let sock;
    try { sock = new WebSocket(`${this.wss}/ws?room=${encodeURIComponent(this.room)}`); }
    catch (e) { return this._retry(); }
    this.sock = sock;
    sock.onopen = () => {
      this.backoff = 1000;
      this._send({ t: 'hello', v: NET_PROTO, room: this.room, id: this.id,
                   name: this.name, hue: this.hue, loading: !window.__ready });
    };
    sock.onmessage = (ev) => {
      this.lastHeard = performance.now();
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }
      this._handle(m);
    };
    // onclose fires reliably on DESKTOP; on iOS it may never come — that path
    // is covered by the visibility handler + heartbeat, and this one stays
    // for the platforms that do behave
    sock.onclose = () => { if (this.sock === sock) this._retry(); };
    sock.onerror = () => { /* close follows where supported */ };
    if (!this._sendTimer) {
      this._sendTimer = setInterval(() => this._pump(), 1000 / SEND_HZ);
    }
  }

  _reconnect(why) {
    // force-close regardless of readyState: after backgrounding it LIES
    const old = this.sock;
    this.sock = null;
    if (old) { try { old.onclose = null; old.close(); } catch {} }
    this._connect();
  }

  _retry() {
    this.alive = false;
    this._status('reconnecting');
    this.sock = null;
    setTimeout(() => { if (!this.sock && document.visibilityState === 'visible') this._connect(); },
               this.backoff);
    this.backoff = Math.min(8000, this.backoff * 2);
  }

  _quiet() {
    // backgrounded: radio silence (iOS kills the socket anyway; don't fight)
    if (this._sendTimer) { clearInterval(this._sendTimer); this._sendTimer = null; }
  }

  _pump() {
    if (!this.sock || this.sock.readyState !== 1) return;
    // heartbeat: protocol pings are invisible to JS and prove nothing; a
    // silent socket past the window is dead no matter what readyState says
    const now = performance.now();
    if (this.lastHeard && now - this.lastHeard > HEARTBEAT_MS * 2) return this._reconnect('silent');
    if (!this._lastPing || now - this._lastPing > HEARTBEAT_MS) {
      this._lastPing = now;
      this._send({ t: 'ping' });
    }
    const s = this.deps.getState();
    if (!s) return;
    // idle suppression: parked and unchanged drops to ~1Hz keepalive
    const key = `${s.x.toFixed(1)}|${s.z.toFixed(1)}|${s.mode}`;
    const idle = key === this._lastKey;
    this._lastKey = key;
    if (idle && (this._idleSkip = (this._idleSkip || 0) + 1) % SEND_HZ !== 0) return;
    this._send({ t: 's', x: +s.x.toFixed(2), z: +s.z.toFixed(2),
                 heading: +s.heading.toFixed(3), speed: +s.speed.toFixed(2), mode: s.mode });
  }

  _send(obj) {
    if (this.sock && this.sock.readyState === 1) {
      try { this.sock.send(JSON.stringify(obj)); } catch {}
    }
  }

  sendReady() { this._send({ t: 'ready' }); }
  sendEmote(kind, x, z) { this._send({ t: 'e', kind, x, z }); }

  // ---- inbound ------------------------------------------------------------
  _handle(m) {
    if (m.t === 'welcome') {
      this.alive = true;
      this._status('in-room');
      const seen = new Set();
      for (const p of m.players) {
        seen.add(p.id);
        if (p.id !== this.id) this._ensureRemote(p);
      }
      for (const [id, r] of this.remotes) {
        if (!seen.has(id)) { r.dispose(); this.remotes.delete(id); }
        // a welcome after a reconnect: whatever sat in the buffer predates
        // the gap — showing it would freeze friends at pre-gap positions
        else if (id !== this.id) r.buf.length = 0;
      }
      this._roster();
    } else if (m.t === 'err') {
      this._status('error:' + m.code);
      if (m.code === 'version') this.deps.onStatus && this.deps.onStatus('version');
    } else if (m.t === 'pjoin') {
      this._ensureRemote(m.p);
      if (this.deps.onToast) this.deps.onToast(`${m.p.name} joined the island`);
      this._roster();
    } else if (m.t === 'pleave') {
      const r = this.remotes.get(m.id);
      if (r) {
        if (this.deps.onToast) this.deps.onToast(`${r.name} left`);
        r.dispose(); this.remotes.delete(m.id);
      }
      this._roster();
    } else if (m.t === 's') {
      const r = this.remotes.get(m.id);
      if (r) r.push(m);
    } else if (m.t === 'pready') {
      const r = this.remotes.get(m.id);
      if (r) r.ready = true;
      this._roster();
    }
    // hs / hs_caught / e are consumed by the game-mode layer via onEvent
    if (this.deps.onEvent && ['hs', 'hs_caught', 'e', 'room'].includes(m.t)) this.deps.onEvent(m);
  }

  _ensureRemote(p) {
    if (this.remotes.has(p.id)) {
      const r = this.remotes.get(p.id);
      r.name = p.name; r.ready = p.ready;
      return r;
    }
    const r = new RemotePlayer(p, this.deps);
    this.remotes.set(p.id, r);
    if (p.last) r.push({ x: p.last.x, z: p.last.z, heading: 0, speed: 0, mode: p.last.mode });
    return r;
  }

  _roster() {
    if (!this.deps.onRoster) return;
    this.deps.onRoster([...this.remotes.values()].map((r) => ({ id: r.id, name: r.name, ready: r.ready })));
  }

  _status(s) { this.status = s; }

  // called once per frame from the render loop — cheap: only interpolation
  update() {
    const t = performance.now() - INTERP_MS;
    for (const r of this.remotes.values()) r.update(t);
  }
}

// ---------------------------------------------------------------------------
// A friend on the island: one skate rig + one walker rig, toggled by mode,
// interpolated between 10Hz snapshots. No physics — remotes replay, never
// simulate. Stride/wheel phase derives from travelled distance (the
// stride-integral lesson: never frequency x absolute time).
class RemotePlayer {
  constructor(p, deps) {
    this.id = p.id;
    this.name = p.name;
    this.hue = p.hue | 0;
    this.ready = p.ready;
    this.deps = deps;
    this.buf = [];                      // [{at,x,z,h,v,mode}]
    this.dist = 0;
    this._built = false;
    this.group = new THREE.Group();
    this.group.name = 'remote:' + p.id;
    deps.scene.add(this.group);
  }

  _build() {
    if (this._built) return;
    this._built = true;
    const d = this.deps;
    // the three builders return three shapes ({group,wheels} / raw Group /
    // {group, joints...}); normalise to the Object3D
    const asObj = (r) => (r && r.isObject3D ? r : r.group);
    this.skate = asObj(d.buildSkate());
    this.skater = asObj(d.buildSkater());
    this.walker = asObj(d.buildWalker());
    this.group.add(this.skate);
    this.group.add(this.skater);
    this.group.add(this.walker);
    // identity tint: CLONE before colouring — the rigs share materials, and
    // tinting a shared one recolours every player including the local rider
    const tint = new THREE.Color().setHSL(this.hue / 360, 0.62, 0.5);
    for (const root of [this.skater, this.walker]) {
      root.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        if (o.userData.identity) {
          o.material = o.material.clone();
          o.material.color.copy(tint);
        }
      });
    }
    this.tag = makeNameTag(this.name);
    this.tag.position.y = 2.25;
    this.group.add(this.tag);
  }

  push(m) {
    const at = performance.now();
    const last = this.buf[this.buf.length - 1];
    if (last) this.dist += Math.hypot(m.x - last.x, m.z - last.z);
    this.buf.push({ at, x: m.x, z: m.z, h: m.heading || 0, v: m.speed || 0,
                    mode: m.mode === 'w' ? 'w' : 'r' });
    if (this.buf.length > 30) this.buf.shift();
    if (!this._built) this._build();
  }

  update(t) {
    if (!this._built || !this.buf.length) { if (this._built) this.group.visible = false; return; }
    // silence past the keepalive window = unknown state = no avatar
    const stale = performance.now() - this.buf[this.buf.length - 1].at > STALE_MS;
    this.group.visible = !stale;
    if (stale) return;
    // find the two snapshots straddling t
    let a = this.buf[0], b = this.buf[this.buf.length - 1];
    for (let i = this.buf.length - 1; i >= 0; i--) {
      if (this.buf[i].at <= t) { a = this.buf[i]; b = this.buf[i + 1] || a; break; }
    }
    const gap = b.at - a.at;
    let x, z, h;
    if (!gap || gap > SNAP_MS) { x = b.x; z = b.z; h = b.h; }
    else {
      const f = Math.max(0, Math.min(1, (t - a.at) / gap));
      x = a.x + (b.x - a.x) * f;
      z = a.z + (b.z - a.z) * f;
      let dh = b.h - a.h;
      while (dh > Math.PI) dh -= 2 * Math.PI;
      while (dh < -Math.PI) dh += 2 * Math.PI;
      h = a.h + dh * f;
    }
    const y = this.deps.surfaceAt ? this.deps.surfaceAt(x, z) : 0;
    this.group.position.set(x, y, z);
    this.group.rotation.y = h;
    const riding = b.mode !== 'w';
    this.skate.visible = riding;
    this.skater.visible = riding;
    this.walker.visible = !riding;
    if (this.tag && this.deps.camera) this.tag.quaternion.copy(this.deps.camera.quaternion);
  }

  dispose() {
    this.deps.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material.map && o.material.map.name === 'nametag') o.material.map.dispose();
    });
  }
}

function makeNameTag(name) {
  const c = document.createElement('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = 256 * dpr; c.height = 64 * dpr;
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  g.font = '600 26px system-ui, sans-serif';
  g.textAlign = 'center';
  g.lineWidth = 5;
  g.strokeStyle = 'rgba(20,22,24,0.85)';
  g.strokeText(name, 128, 40);
  g.fillStyle = '#fff';
  g.fillText(name, 128, 40);
  const tex = new THREE.CanvasTexture(c);
  tex.name = 'nametag';
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.475),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  mesh.renderOrder = 20;
  return mesh;
}
