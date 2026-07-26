// All sound is synthesised with Web Audio. Nothing is downloaded, which keeps
// the payload where it is and lets the engine note track speed exactly rather
// than crossfading between clips.
//
// Browsers will not start audio without a gesture, so start() is called from
// the first touch or click.

export class Sound {
  constructor() {
    this.ready = false;
    this.muted = false;
    this._lastStep = 0;
  }

  start() {
    if (this.ready) return;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const ctx = new C();
    this.ctx = ctx;
    // Safari and Chrome can hand back a suspended context even inside a gesture
    if (ctx.state === 'suspended') ctx.resume();

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

    this.osc1.start(); this.osc2.start(); this.osc3.start();
    this.lfo.start(); this.wind.start(); this.amb.start();

    // ease in so it never starts with a click
    this.master.gain.setTargetAtTime(this.muted ? 0 : 0.55, ctx.currentTime, 0.4);
    this.ready = true;
  }

  setMuted(m) {
    this.muted = m;
    if (this.ready) this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.15);
  }

  // speed in m/s (may be negative), mode 'ride' | 'walk'
  update(speed, mode, walkSpeed, walkPhase) {
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    const v = Math.abs(speed);

    if (mode === 'ride') {
      // engine note rises with speed, with a little compression at the top so it
      // does not turn into a siren
      const f = 44 + Math.pow(v, 0.86) * 9.4;
      this.osc1.frequency.setTargetAtTime(f, t, 0.06);
      this.osc2.frequency.setTargetAtTime(f * 2.01, t, 0.06);
      this.osc3.frequency.setTargetAtTime(f * 0.5, t, 0.06);
      this.engineFilter.frequency.setTargetAtTime(380 + v * 165, t, 0.1);
      this.engineGain.gain.setTargetAtTime(0.1 + Math.min(0.3, v * 0.028), t, 0.12);
      this.windGain.gain.setTargetAtTime(Math.min(0.3, (v * v) * 0.0022), t, 0.2);
      this.windFilter.frequency.setTargetAtTime(520 + v * 60, t, 0.2);
    } else {
      // parked: engine off, just the street
      this.engineGain.gain.setTargetAtTime(0, t, 0.25);
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
