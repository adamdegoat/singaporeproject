// Traffic signals. One state per junction, shared by every head at it, and
// vehicles read the same state so they actually stop.
const CYCLE = 26;          // seconds
const GREEN = 15;
const AMBER = 2.5;

const ON = [0xd8402f, 0xe0aa32, 0x46c46a];
const OFF = [0x000000, 0x000000, 0x000000];

export class Signals {
  constructor(list) {
    this.list = list || [];
  }

  // 0 green, 1 amber, 2 red
  stateAt(sig, time) {
    const t = (time + sig.phase) % CYCLE;
    if (t < GREEN) return 0;
    if (t < GREEN + AMBER) return 1;
    return 2;
  }

  update(time) {
    for (const sig of this.list) {
      const st = this.stateAt(sig, time);
      for (const lenses of sig.lenses) {
        for (let k = 0; k < 3; k++) {
          // lenses are ordered red, amber, green
          const lit = (k === 0 && st === 2) || (k === 1 && st === 1) || (k === 2 && st === 0);
          lenses[k].material.emissive.setHex(lit ? ON[k] : OFF[k]);
          lenses[k].material.emissiveIntensity = lit ? 1.1 : 0;
        }
      }
    }
  }

  // distance to the next non-green signal ahead, or null
  nextStop(s, dir, time, lookahead = 30) {
    let best = null;
    for (const sig of this.list) {
      let d = dir > 0 ? sig.s - s : s - sig.s;
      if (d < -2 || d > lookahead) continue;
      if (this.stateAt(sig, time) === 0) continue;    // green, drive on
      if (best === null || d < best) best = d;
    }
    return best;
  }
}
