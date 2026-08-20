// All sound is synthesised with Web Audio. Nothing is downloaded, which keeps
// the payload where it is and lets the engine note track speed exactly rather
// than crossfading between clips.
//
// Browsers will not start audio without a gesture, so start() is called from
// the first touch or click.

export class Sound {
  // AUDIO IS BACK ON (2026-08-20, owner's call for the game layer). It went
  // out on 2026-08-02: "the audio still got a lot of problem. sometimes have
  // sometimes don't have. can we totally remove audio first." The likely
  // makers of "sometimes" are each guarded now: the iPhone ringer switch
  // (playback-session element in start()), backgrounding (visibilitychange
  // resume), and a refused first gesture (poke() retries on every gesture).
  // main.js passes enabled; ?noaudio is the off switch.
  //
  // Switched off at the CONSTRUCTOR rather than deleted, so nothing else in
  // the world has to change and it comes back with one flag when it is worth
  // fixing properly. With `enabled` false no AudioContext is ever created, no
  // wind bed is synthesised and every public method returns immediately —
  // which also removes the 303ms of first-gesture work this file documents
  // below, and the sample-by-sample noise generation that costs CPU (and
  // therefore battery and heat) for as long as the rider keeps moving.
  //
  // `?audio` turns it back on for anyone diagnosing it.
  constructor(enabled = false) {
    this.enabled = !!enabled;
    this.ready = false;
    this.muted = !enabled;
    this._lastStep = 0;
    this.state = enabled ? 'idle' : 'disabled';
  }

  // BUILD THE SYNTH BEFORE ANYONE ASKS FOR IT.
  //
  // start() used to do everything, and it is called from the FIRST GESTURE --
  // which, for someone loading the game and riding off, is the moment they
  // press the throttle. A CPU profile of that moment billed 303ms to this
  // file: opening an AudioContext talks to the sound hardware, and the wind
  // bed is two seconds of noise generated a sample at a time. So the rider's
  // first frame of movement dropped a third of a second.
  //
  // None of that needs a gesture. An AudioContext may be created at any time;
  // it simply starts suspended and stays silent. Only UNLOCKING it -- resume()
  // plus a buffer played from inside the gesture -- has to wait. So boot calls
  // prewarm() behind the loading screen and the gesture is left with almost
  // nothing to do.
  prewarm() {
    if (!this.enabled) return;
    if (this.ctx) return;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) { this.state = 'no-webaudio'; return; }
    try { this.ctx = new C(); } catch (e) { this.state = 'no-webaudio'; return; }
    this.state = 'prewarmed';
    this._buildGraph(this.ctx);
  }

  start() {
    if (!this.enabled) return;
    if (this.ready) return;
    this.prewarm();
    const ctx = this.ctx;
    if (!ctx) return;
    this.state = 'starting';
    // iOS needs more than resume(): the context only truly unlocks once a
    // buffer has actually been played from inside the gesture.
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) { /* nothing to do; the graph below still gets built */ }
    // THE iPHONE RINGER SWITCH mutes plain Web Audio: everything above can
    // be correct and the phone stays silent because iOS treats page audio
    // as "ambient", which the mute switch kills. A looping media ELEMENT
    // started in the same gesture promotes the session to "playback", which
    // the switch does not kill — the standard workaround, and the reason
    // games make sound on a muted iPhone. The element itself is a
    // one-sample silent wav; it exists only to hold the session open.
    try {
      const el = document.createElement('audio');
      el.setAttribute('playsinline', '');
      el.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      el.loop = true;
      el.volume = 0.02;
      const p = el.play();
      if (p && p.catch) p.catch(() => { /* will retry on the next gesture via poke() */ });
      this._session = el;
    } catch (e) { /* no media element support: web audio alone still works */ }
    this._graphStarted();
  }

  _buildGraph(ctx) {
    this.master = ctx.createGain();
    this.master.gain.value = 0.0;
    this.master.connect(ctx.destination);

    /* ---- engine: two detuned saws through a lowpass that opens with speed ---- */
    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0.0;
    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 420;
    this.engineFilter.Q.value = 3.2;
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    this.osc1 = ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.value = 46;
    this.osc2 = ctx.createOscillator();
    this.osc2.type = 'sawtooth';
    this.osc2.frequency.value = 46 * 2.01;      // slight beat, stops it sounding synthetic
    this.osc3 = ctx.createOscillator();
    this.osc3.type = 'square';
    this.osc3.frequency.value = 46 * 0.5;
    const o2g = ctx.createGain(); o2g.gain.value = 0.45;
    const o3g = ctx.createGain(); o3g.gain.value = 0.3;
    this.osc1.connect(this.engineFilter);
    this.osc2.connect(o2g); o2g.connect(this.engineFilter);
    this.osc3.connect(o3g); o3g.connect(this.engineFilter);

    // a slow wobble so idle is not a dead tone
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 5.5;
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = 1.6;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.osc1.frequency);

    /* ---- noise bed, reused for wind, tyre roar and footsteps ---- */
    const N = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, N, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < N; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;          // brown-ish, less hissy than white
      d[i] = last * 3.2;
    }
    this.noiseBuf = buf;

    this.wind = ctx.createBufferSource();
    this.wind.buffer = buf; this.wind.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 700;
    this.windFilter.Q.value = 0.7;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    this.wind.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.master);

    /* ---- street ambience: a low bed that is always there ---- */
    this.amb = ctx.createBufferSource();
    this.amb.buffer = buf; this.amb.loop = true;
    this.ambFilter = ctx.createBiquadFilter();
    this.ambFilter.type = 'lowpass';
    this.ambFilter.frequency.value = 320;
    this.ambGain = ctx.createGain();
    this.ambGain.gain.value = 0.16;
    this.amb.connect(this.ambFilter);
    this.ambFilter.connect(this.ambGain);
    this.ambGain.connect(this.master);

    /* ---- wheel roll: the skateboard's voice. A board has no engine; what
       you hear is urethane on ground — the same noise bed through a lowpass
       that rises with speed, plus the wind. Kept separate from the engine
       chain so the vespa and the car keep their motor. ---- */
    this.roll = ctx.createBufferSource();
    this.roll.buffer = buf; this.roll.loop = true;
    this.roll.playbackRate.value = 1.35;        // urethane sits brighter than ambience
    this.rollFilter = ctx.createBiquadFilter();
    this.rollFilter.type = 'lowpass';
    this.rollFilter.frequency.value = 400;
    this.rollFilter.Q.value = 0.8;
    this.rollGain = ctx.createGain();
    this.rollGain.gain.value = 0;
    this.roll.connect(this.rollFilter);
    this.rollFilter.connect(this.rollGain);
    this.rollGain.connect(this.master);
    this.roll.start();

    /* ---- passing traffic: a low band that rises as a vehicle gets close ---- */
    this.traffic = ctx.createBufferSource();
    this.traffic.buffer = buf; this.traffic.loop = true;
    this.trafficFilter = ctx.createBiquadFilter();
    this.trafficFilter.type = 'bandpass';
    this.trafficFilter.frequency.value = 240;
    this.trafficFilter.Q.value = 0.9;
    this.trafficGain = ctx.createGain();
    this.trafficGain.gain.value = 0;
    this.traffic.connect(this.trafficFilter);
    this.trafficFilter.connect(this.trafficGain);
    this.trafficGain.connect(this.master);
    this.traffic.start();

    this.osc1.start(); this.osc2.start(); this.osc3.start();
    this.lfo.start(); this.wind.start(); this.amb.start();

    // Safari can re-suspend when the page is backgrounded or a call comes in
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    });
  }

  // The two lines that must NOT happen at prewarm time: the graph is built and
  // running on a suspended context (silent, costing nothing), and only becomes
  // audible when a gesture has unlocked it.
  _graphStarted() {
    if (!this.ctx || !this.master) return;
    // ease in so it never starts with a click
    this.master.gain.setTargetAtTime(this.muted ? 0 : 0.55, this.ctx.currentTime, 0.4);
    this.ready = true;
  }

  // call from any later gesture: cheap if already running
  // A SOFT TWO-NOTE CHIME the moment the session actually unlocks — played
  // through its OWN gain straight to the destination, independent of the
  // master (which ramps with the world and starts at zero), so hearing it
  // proves the unlock beyond argument: chime-but-no-engine means the engine
  // mapping; no chime means the session. Fires once.
  chime() {
    if (!this.enabled) return;
    if (this._chimed || !this.ctx || this.ctx.state !== 'running') return;
    this._chimed = true;
    try {
      const g = this.ctx.createGain();
      g.gain.value = 0.16;
      g.connect(this.ctx.destination);
      for (const [f, t0, d] of [[660, 0, 0.12], [880, 0.13, 0.16]]) {
        const o = this.ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const eg = this.ctx.createGain();
        eg.gain.setValueAtTime(0.0001, this.ctx.currentTime + t0);
        eg.gain.exponentialRampToValueAtTime(1, this.ctx.currentTime + t0 + 0.02);
        eg.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + t0 + d);
        o.connect(eg); eg.connect(g);
        o.start(this.ctx.currentTime + t0); o.stop(this.ctx.currentTime + t0 + d + 0.02);
      }
    } catch (e) { /* the chime is diagnostic, never fatal */ }
  }

  // one line of truth for ?audiodebug
  debugLine() {
    if (!this.enabled) return 'audio off';
    return `audio ctx=${this.ctx ? this.ctx.state : 'none'} ready=${!!this.ready}`
      + ` chimed=${!!this._chimed} session=${this._session ? (this._session.paused ? 'paused' : 'playing') : 'none'}`
      + (this.master ? ` master=${this.master.gain.value.toFixed(2)}` : '');
  }

  poke() {
    if (!this.enabled) return;
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    this.chime();
    // the playback-session element can be refused on the first gesture if
    // the browser judged it too early; any later gesture retries for free
    if (this._session && this._session.paused) {
      const p = this._session.play();
      if (p && p.catch) p.catch(() => { /* keep trying on future gestures */ });
    }
  }

  setMuted(m) {
    if (!this.enabled) return;
    this.muted = m;
    if (this.ready) this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.15);
  }

  // speed in m/s (may be negative), mode 'ride' | 'walk'.
  // kind: 'skate' | 'bike' | 'car' — a board rolls, the other two have motors.
  update(speed, mode, walkSpeed, walkPhase, nearestVehicle = 999, kind = 'skate') {
    if (!this.enabled) return;
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    const v = Math.abs(speed);

    // traffic you can hear before you see it
    const near = Math.max(0, 1 - nearestVehicle / 42);
    this.trafficGain.gain.setTargetAtTime(0.02 + near * near * 0.16, t, 0.35);
    this.trafficFilter.frequency.setTargetAtTime(210 + near * 220, t, 0.4);

    if (mode === 'ride' && kind === 'skate') {
      // no engine on a board: wheel roll rises with speed, wind over the top
      this.engineGain.gain.setTargetAtTime(0, t, 0.15);
      this.rollGain.gain.setTargetAtTime(Math.min(0.22, v * 0.024), t, 0.1);
      this.rollFilter.frequency.setTargetAtTime(320 + v * 95, t, 0.12);
      this.windGain.gain.setTargetAtTime(Math.min(0.32, (v * v) * 0.0026), t, 0.2);
      this.windFilter.frequency.setTargetAtTime(520 + v * 60, t, 0.2);
    } else if (mode === 'ride') {
      // engine note rises with speed, with a little compression at the top so it
      // does not turn into a siren
      this.rollGain.gain.setTargetAtTime(0, t, 0.15);
      const f = 44 + Math.pow(v, 0.86) * 9.4;
      this.osc1.frequency.setTargetAtTime(f, t, 0.06);
      this.osc2.frequency.setTargetAtTime(f * 2.01, t, 0.06);
      this.osc3.frequency.setTargetAtTime(f * 0.5, t, 0.06);
      this.engineFilter.frequency.setTargetAtTime(380 + v * 165, t, 0.1);
      this.engineGain.gain.setTargetAtTime(0.1 + Math.min(0.3, v * 0.028), t, 0.12);
      this.windGain.gain.setTargetAtTime(Math.min(0.3, (v * v) * 0.0022), t, 0.2);
      this.windFilter.frequency.setTargetAtTime(520 + v * 60, t, 0.2);
    } else {
      // parked: engine and roll off, just the street
      this.engineGain.gain.setTargetAtTime(0, t, 0.25);
      this.rollGain.gain.setTargetAtTime(0, t, 0.25);
      this.windGain.gain.setTargetAtTime(0, t, 0.3);
      // footsteps on the walk cycle
      if (walkSpeed > 0.3) {
        const step = Math.floor(walkPhase * 2.4 / Math.PI);
        if (step !== this._lastStep) {
          this._lastStep = step;
          this._footstep(walkSpeed);
        }
      }
    }
  }

  // GAME CUES for Time Attack. Tiny envelope tones through the master, so
  // they respect the mute and never play before the unlock. Each kind is a
  // distinct pitch shape a rider can tell apart without looking:
  //   count  - one low tick (3..2..1)
  //   go     - a rising two-note
  //   check  - one bright mid blip (checkpoint crossed)
  //   best   - a quick up-arpeggio (new best time)
  //   finish - a settled two-note close (run done, not a best)
  cue(kind) {
    if (!this.enabled || !this.ready || this.muted) return;
    if (this.ctx.state !== 'running') return;
    const NOTES = {
      count:  [[440, 0, 0.09]],
      go:     [[660, 0, 0.10], [990, 0.10, 0.16]],
      check:  [[880, 0, 0.09]],
      best:   [[660, 0, 0.08], [830, 0.08, 0.08], [990, 0.16, 0.18]],
      finish: [[740, 0, 0.10], [590, 0.12, 0.20]],
    }[kind];
    if (!NOTES) return;
    try {
      const t0 = this.ctx.currentTime;
      for (const [f, dt, d] of NOTES) {
        const o = this.ctx.createOscillator();
        o.type = 'triangle'; o.frequency.value = f;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0 + dt);
        g.gain.exponentialRampToValueAtTime(0.35, t0 + dt + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + d);
        o.connect(g); g.connect(this.master);
        o.start(t0 + dt); o.stop(t0 + dt + d + 0.02);
      }
    } catch (e) { /* a cue is never fatal */ }
  }

  _footstep(intensity) {
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 1.6;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1150; f.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.055 * Math.min(1, intensity / 2), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + 0.16);
  }
}
