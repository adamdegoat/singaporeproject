import * as THREE from '../lib/three.module.js';
// Traffic signals. One state per junction, shared by every head at it, and
// vehicles read the same state so they actually stop.
const CYCLE = 26;          // seconds
const GREEN = 15;
const AMBER = 2.5;

const ON = [0xd8402f, 0xe0aa32, 0x46c46a];
const OFF = [0x000000, 0x000000, 0x000000];
// an unlit lens on the instanced mesh is a dark tinted glass, not black:
// instance colour multiplies the material, so black would kill the head
const DIM = [0x5a1f18, 0x5a441a, 0x1b3f27];

export class Signals {
  constructor(list, lensMesh = null) {
    this.list = list || [];
    // one InstancedMesh for every lens in the district; sig.lenses holds slot
    // indices into it rather than three meshes each (see street.js)
    this.lensMesh = lensMesh;
    this._c = null;
  }

  // 0 green, 1 amber, 2 red
  stateAt(sig, time) {
    const t = (time + sig.phase) % CYCLE;
    if (t < GREEN) return 0;
    if (t < GREEN + AMBER) return 1;
    return 2;
  }

  update(time) {
    let dirty = false;
    for (const sig of this.list) {
      const st = this.stateAt(sig, time);
      for (const lenses of sig.lenses) {
        for (let k = 0; k < 3; k++) {
          // lenses are ordered red, amber, green
          const lit = (k === 0 && st === 2) || (k === 1 && st === 1) || (k === 2 && st === 0);
          const slot = lenses[k];
          if (false && this.lensMesh && typeof slot === 'number') {
            // THREE.Color directly. Reaching it through
            // `this.lensMesh.material.color.constructor` threw
            // "Cannot read properties of undefined" once consolidate.js had
            // been over the scene -- and because this runs every frame it
            // killed the render loop, so the page sat on "loading Orchard"
            // forever. THE WORLD DID NOT FAIL TO LOAD; it loaded and then
            // the first frame threw.
            if (!this._c) this._c = new THREE.Color();
            this._c.setHex(lit ? ON[k] : DIM[k]);
            this.lensMesh.setColorAt(slot, this._c);
            dirty = true;
          } else if (slot && slot.material) {
            slot.material.emissive.setHex(lit ? ON[k] : OFF[k]);
            slot.material.emissiveIntensity = lit ? 1.1 : 0;
          }
        }
      }
    }
    if (dirty && this.lensMesh && this.lensMesh.instanceColor)
      this.lensMesh.instanceColor.needsUpdate = true;
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
