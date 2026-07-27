// The ground. Everything else asks this module how high it is at a point.
//
// The heightfield comes from elevation sampled along road centrelines (roads are
// open sky, so the reading is close to the ground) with rooftop spikes filtered
// out. See data/terrain.py.
import * as THREE from '../lib/three.module.js';

export class Terrain {
  constructor(grid) {
    this.g = grid || null;
    this.flat = !grid;
  }

  // bilinear height at a world point; 0 everywhere if the district has no grid
  at(x, z) {
    const g = this.g;
    if (!g) return 0;
    const fx = (x - g.x0) / g.cell;
    const fz = (z - g.z0) / g.cell;
    let i = Math.floor(fx), j = Math.floor(fz);
    // clamp to the edge rather than dropping to zero outside the grid
    if (i < 0) i = 0; if (j < 0) j = 0;
    if (i > g.nx - 2) i = g.nx - 2;
    if (j > g.nz - 2) j = g.nz - 2;
    const tx = Math.min(1, Math.max(0, fx - i));
    const tz = Math.min(1, Math.max(0, fz - j));
    const h = g.h;
    const a = h[j * g.nx + i], b = h[j * g.nx + i + 1];
    const c = h[(j + 1) * g.nx + i], d = h[(j + 1) * g.nx + i + 1];
    return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  }

  // slope, for tilting the scooter and the camera into a hill
  slopeAlong(x, z, ux, uz, span = 3) {
    return (this.at(x + ux * span, z + uz * span) - this.at(x - ux * span, z - uz * span))
      / (2 * span);
  }

  // the visible ground mesh
  build(material) {
    const g = this.g;
    if (!g) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2600), material);
      m.rotation.x = -Math.PI / 2;
      m.position.y = -0.05;
      m.receiveShadow = true;
      return m;
    }
    const w = (g.nx - 1) * g.cell, d = (g.nz - 1) * g.cell;
    const geo = new THREE.PlaneGeometry(w, d, g.nx - 1, g.nz - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let j = 0; j < g.nz; j++) {
      for (let i = 0; i < g.nx; i++) {
        const idx = j * g.nx + i;
        pos.setY(idx, g.h[idx] - 0.06);
      }
    }
    geo.translate(g.x0 + w / 2, 0, g.z0 + d / 2);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    return mesh;
  }

  // a skirt beyond the sampled area, so the world does not end in a cliff
  buildApron(material) {
    const g = this.g;
    if (!g) return null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), material);
    m.rotation.x = -Math.PI / 2;
    const mid = g.h[Math.floor(g.h.length / 2)];
    m.position.set(g.x0 + (g.nx * g.cell) / 2, mid - 0.4, g.z0 + (g.nz * g.cell) / 2);
    m.receiveShadow = true;
    return m;
  }
}
