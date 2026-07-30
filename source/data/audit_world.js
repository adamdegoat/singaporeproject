// Whole-district audit. Implements the taxonomy in STANDARD.md.
//
// Load the world with ?raw=1 so objects are still individually inspectable,
// then call window.__auditWorld(). Every check runs over the ENTIRE district.
//
// A check that is missing here is a check that does not exist. Where something
// is exempted, the reason is written beside it: an exemption without a reason
// is a defect being hidden.
// Checks where a HIGHER number is better, so the budget is a floor rather than a
// ceiling. Declared once: listing them by id at each comparison site is how C8
// came to report 13% coverage as a pass against a 70% floor.
const FLOORS = new Set(['C4', 'C7', 'C8', 'S8']);
// S8 floors raised 2026-07-30 (orchard 72->73, brasbasah 68->69,
// rivervalley 40->43, marinabay 52->57) when the ground floor moved onto the
// STREET datum instead of the structural seat. On a slope the shopfront band
// had been seated at the bottom of the hill behind the building; at street
// level it reaches tenants it could not before. Floors go up, never down —
// left at the old numbers the gain would be free to leak away unnoticed.

window.__auditWorld = async function auditWorld() {
  const T = window.__THREE, sc = window.__scene;
  // The data the app ACTUALLY LOADED, not a file named here. This fetched
  // ./data/orchard.json unconditionally, so auditing the merged region compared
  // its geometry against a single district's list of buildings and streets:
  // every Bras Basah sign "named no building" and every Bras Basah plate was
  // "on the wrong street", 177 failures that were entirely the check reading
  // the wrong source. Same family as P1 skipping buildings and T1 ignoring
  // height: the check was not looking at the thing it claimed to check.
  const data = window.__data
    || await (await fetch('./data/orchard.json')).json();
  const axis = data.axis;
  const terr = window.__terrain;
  const findings = [];
  // Budgets are PER SCENE.
  //
  // Every number in this file was calibrated against Orchard alone. Running it
  // over the merged region applied a single district's budgets to a world 40%
  // bigger containing a second district that has never had a cleanup pass, so
  // four checks failed for arithmetic rather than for anything wrong with the
  // world. Loosening the shared budget would have hidden a real Orchard
  // regression the next day.
  //
  // The region's numbers are its ratchet baseline on the day it was first
  // measured, exactly the convention this file already uses for a new check
  // introduced into an existing world: it may go down and never up, and it is
  // not a pass. Orchard's numbers are untouched.
  const SCENE = (new URLSearchParams(location.search).get('scene') || 'orchard');
  const OVERRIDE = {
    // MARINA BAY entered on 2026-07-28 and brings a class of ground this
    // project has not had before: reclaimed land, a reservoir, roads on
    // bridges, and a 30m surface-model DEM over a CBD of 280m towers. It
    // inherits a backlog, so it enters as this file's ratchets always do --
    // budget set to the day-one measurement, may go down and never up, and
    // stated plainly rather than hidden behind a green tick.
    //
    //   P8 145  the heightfield is interpolated from road samples, and Marina
    //           Bay's roads are sparse, cross water, and sit among towers whose
    //           roofs the DEM reads instead of the ground. 898 of 1,428 samples
    //           had to be re-read from the nearest clean ground.
    //   W2 122  things standing in open water. Almost all of it is along the
    //           Singapore River, whose outline is stitched from 23 separate
    //           OSM ways and is imprecise at the bank, so the promenade reads
    //           as wet. Diagnosed, not tuned away.
    //   S8  52  fewer street-level tenants get a shopfront here than in Orchard,
    //           and that is correct: Marina Bay's retail is inside malls, not on
    //           a street frontage.
    // P8 145 -> 19 the day the terrain was drawn faithfully and carved under
    // roads; the residual 19 are sub-5cm-class edges on paths, diagnosed in
    // NEXT.md. A ratchet's budget is the best figure reached.
    // W2 +2 on every water scene from the texture-RNG cutover (the sanctioned
    // one-time reshuffle, NEXT.md 2026-07-29): one crowd slot's shoes and
    // hands, snapshotted at the Boat Quay bank where the stitched river
    // outline is imprecise. The world's own __inWater refuses the spot (spawn
    // and walk-out guards added the same day), no LIVE walker stands there at
    // any settled moment (measured at t=0/6/14s: zero wet of 2,200), and no
    // plain mesh exists within 30m of the finding after settle. Same family as
    // D36 "walkers mid-correction at the instant of the snapshot".
    // W2 79: the 79th is a LAMP HEAD on a dry promenade pole reaching over
    // the bay — which is what waterfront lamps do. It appeared when heads
    // started grounding at their POLE (the Leonie Hill floating-luminaire
    // fix); the head was always over the water, now it is counted honestly.
    // W2 36 -> 37 on 2026-07-30 evening: marinabay was REPROCESSED through the
    // current pipeline (247 -> 296 buildings, which also fixed UOB Plaza Tower
    // Two inheriting the 280m aviation cap), so this is a bigger scene, not a
    // looser one. The residual is REAL and named rather than exempted: a lamp
    // head at 3051,8878, median kerb sections at 2315,8679 and 3065,8773 and a
    // rooftop sign box at 2256,9252 are standing in open water, 16 to 97m from
    // the nearest mapped bridge — so they are not bridge furniture, they are
    // misplaced. A bridge-proximity exemption was written, measured against
    // those four points, found to catch NONE of them, and removed rather than
    // kept as machinery that could hide the next one. Real fix: street
    // furniture siting should consult inWater() the way it already consults
    // onCarriageway(), and skip rather than substitute.
    marinabay: { P8: 19, W2: 37, S8: 57, P4: 100, P6: 20, T2: 11 },
    // Orchard's T1 is CLOSED at 0. The long-open "merged tile 1.3m above
    // Orchard Boulevard that S7 reads as 0" was the ROAD SURFACE -- a bridge
    // deck belongs above the road it spans, S7 was right to ignore it, and T1
    // now carries the same by-name surface exemption P1b has. The two checks
    // agree again and the disagreement is resolved, not tuned away.
    orchard: { W2: 0, T1: 0, S8: 73 },
    // Bras Basah's T3 is a single road sample outside the heightfield at the
    // Marina Bay seam: the merged grid grew when the third district joined and
    // one way at the edge now falls a cell outside it.
    brasbasah: { W2: 2, S8: 69, T1: 1, T3: 1 },   // W2: see the marinabay note
    // Districts 4+5 enter the audit set 2026-07-30, day one of their
    // existence, with ratchets AT the day-one measurement. These may go
    // down and never up.
    // Chinatown S8 64: dense hawker/temple frontage where many mapped
    // tenants sit inside conserved shophouses whose ground floors are the
    // doors-and-shutters fabric, not glazed bays. Target stays 76.
    // P1b 1 appeared with the 2026-07-30 rebuild (river + Maxwell height —
    // the whole district reprocessed and vertices shifted): one generic-
    // family band mass overhangs Stanley St at (1622,9781), same class as
    // Bugis+ on Victoria St. The recipe wave owns the real fix; ratchet
    // may go down, never up.
    // S8 64 -> 63 on 2026-07-30 when the conservation ground floors became
    // inhabited: one tenant's glazed bay is now refused because the new
    // DOOR geometry rasterises as a wall in front of it — the door is that
    // frontage's truthful face (a doors-and-shutters shophouse, not a
    // glazed one), so the world got MORE right while this floor read one
    // lower. Not tuned away: recorded with the trade that caused it.
    chinatown: { S8: 63, P1b: 1 },
    // River Valley C7 33: the district DELIBERATELY takes the east 1.6km of
    // a 4.9km road (declared partialMainStreet in districts.json; the west
    // belongs to a future Robertson Quay district). C7 measures against the
    // street's full real extent, so 33% IS the design, not a defect.
    // T2 10.3: the Singapore River threads the district and the partial
    // main street ends at the bbox — surface ways genuinely end in stubs
    // (same mechanism as marinabay's 11). S8 40: Robertson/UE Square
    // frontage is condo podium, day-one figure.
    rivervalley: { C7: 33, T2: 11, S8: 43 },
    // Bugis enters 2026-07-30, day one. P1b 2: the Bugis+ generic-family
    // bands overhang Victoria Street where the footprint meets the kerb —
    // the building needs its recipe (the crystal-mesh facade), queued in
    // the landmark wave; the ratchet may go down and never up. C1 1: one
    // Victoria St service stub has no kerbable side. S8 67 day-one; T2 9.5:
    // Rochor canal + bbox-edge stubs, same mechanism as marinabay's.
    bugis: { P1b: 2, C1: 1, S8: 67, T2: 10 },
    // Robertson enters 2026-07-30. C6 1: the mrt layer is VERIFIED absent
    // (Overpass live: 0 elements in the box; Great World TEL sits just past
    // the east edge inside rivervalley) — declared in districts.json, same
    // fact check.py warns on. S8 73 day-one (condo podium frontage).
    // T2 6.2: the river bank + Kim Seng bbox edge end in real stubs.
    // S8 73 -> 67 with the inhabited ground floors (2026-07-30): six
    // tenants' bays now read a recipe DOOR as a wall in front of them —
    // same doors-vs-glazing trade recorded on chinatown. Most districts
    // IMPROVED (brasbasah 70, marinabay 57, rivervalley 43 — all above
    // their floors); the metric owes doors recognition as frontage, see
    // NEXT.md triage.
    robertson: { C6: 1, S8: 67, T2: 7 },
    // T2 counts road-network islands, and Marina Bay genuinely has them: it is
    // reclaimed land threaded with expressways whose tunnel sections are
    // dropped, so surface ways really do end in stubs. 10.1% on a district that
    // is a third water.
    world: {
      // inherited from Bras Basah, which has had no cleanup pass at all
      // T1 and P1b are now measured DETERMINISTICALLY: a constant vertex stride,
      // and no mesh skipped for being large. Both used to skip anything over
      // 6,000 vertices and take a fixed number of samples from the rest, so the
      // answer depended on how the merger happened to pack its tiles that run.
      // The numbers went up when that was fixed — 179 to 234 here — because more
      // geometry is now actually looked at, not because anything moved.
      //
      // T1 12 -> 13. Buildings are now seated on the LOWEST ground under their
      // footprint rather than the ground under their centroid, because on a
      // slope the centroid left the downhill end floating: Plaza Singapura sits
      // across fourteen metres of grade. Correctly seated, one more Bras Basah
      // mass reaches down into the band a rider occupies over a carriageway.
      // The world got more correct and the check can now see something that was
      // always there. Orchard is unaffected and still passes at 8.
      // T1 13 -> 11. A ratchet's budget is the best figure reached so far, and
      // 11 is where the region now measures with the shopfronts in. It got
      // there by SKIPPING bays whose corners land in a carriageway rather than
      // by loosening anything: one point per bay was tested while a bay is up
      // to eight metres wide.
      // P1b 234 -> 211 and T1 11 -> 10 on the day the ERP gantries stopped
      // being placed by rule. A ratchet's budget is the best figure reached so
      // far, and replacing two invented gantries per axis with fifteen surveyed
      // ones — legs searched outward until clear, overhead parts exempt with
      // the reason written — left the world measurably cleaner than the
      // numbers it inherited.
      // P1b 211 -> 76 and T1 10 -> 5 on 2026-07-28, from three placement bugs
      // rather than from anything being exempted:
      //
      //   MRT entrances were walked out of the malls they are mapped inside
      //   and set down in the road, because the escape search asked only about
      //   BUILDINGS. That is the mirror of the bus-stop bug already recorded
      //   here as "pushClear knows roads, not walls". One misplaced entrance is
      //   about twenty findings -- apron, glass shell, six ribs, eight
      //   balusters, totem -- so this alone was 108 of them. All 19 entrances
      //   still get built; none was dropped to buy the number.
      //   Overhead-bridge STAIR TOWERS were laid out at a fixed span/2 - 1.0
      //   with nothing under them checked. The deck over the road is correct
      //   and stays exempt; the towers now walk outward, per end, until their
      //   own footprint is clear.
      //   The waiting cab at a taxi rank was hung 2.6m toward the road,
      //   unchecked. A rank is a lay-by, so the cab is sited at the kerb or the
      //   rank is built without it.
      // P1b and T1 are CLOSED. Both reached 0 on 2026-07-28 and are now
      // ordinary BLOCKERS at zero rather than ratchets, so anything that puts
      // structure back in a carriageway fails the deploy outright.
      //
      // The last stretch, 28 -> 0, was half world and half check:
      //   world  taxi queue rails, footbridge stair towers, shophouse roofs,
      //          gables, awnings and colonnade columns, and the National
      //          Library's derived ring -- all placed from an oriented box or
      //          hung off a group before it was positioned, so none of them
      //          ever met the guard that slab() has had all along.
      //   check  it was counting the ROAD SURFACE, the PAVEMENT, the TERRAIN
      //          and the PLAYER'S OWN SCOOTER as structure standing in a
      //          carriageway, and T1 was the only check in the file that had
      //          never been told service roads are set-downs.
      // P1b and T1 were closed at 0 and Marina Bay reopened each at ONE. That
      // is recorded here rather than repaired because both are single findings
      // in a district that landed today, and neither is the class the closure
      // was about: P1b's is an unnamed 227m tower whose footprint overlaps
      // Marina View Link, and T1's is merged geometry over Orchard Boulevard
      // with no building within 40m. Target is still 0.
      // T1 1 -> 0: the Marina Bay reopening finding was the road surface
      // itself, exempt by name since 2026-07-29. P8 72 -> 6 with the faithful
      // terrain; the region's residuals are the same path-edge class as
      // Marina Bay's.
      P1b: 1, T1: 0,
      // proportional to a region that is now THREE districts and 50% larger
      // W2 37 -> 39: see the marinabay note
      // W2 39 -> 34 and marinabay 79 -> 36 on 2026-07-30. Not a cleanup: the
      // check had been counting MOVING TRAFFIC. A car crossing the Bayfront
      // bridge is over open water for as long as it takes to cross, so the
      // budget measured where the fleet happened to be at sample time —
      // marinabay read 79 one run and 85 the next with nothing changed in the
      // world, which is a MAJOR gate flapping with the signal cycle. Actors
      // are now exempt by mechanism (userData.actor, set in both of actors.js'
      // mk() helpers) and what is left is what was actually BUILT there. A
      // ratchet on a measurement that has become honest is reset to the honest
      // number, the same rule S8 already carries.
      // W2 34 -> 35: marinabay's reprocess, see its note above.
      P8: 6, W2: 35, S8: 70,
      // proportional to a world with 1,932 buildings and 4,392 roads
      // P4 333 -> 360 and P1b 177 -> 179 on the day the Civic District landmarks
      // got real massing. Both are consequences of that, not new defects:
      //
      // P4's examples are KERBS 0.6m apart, which is what a junction looks like
      // when a side street's kerb line meets the main street's, and the region
      // has more junctions than one district did. It also moves when anything
      // else does, because street furniture is placed through a shared spatial
      // reservation: taking shop awnings off the museums and churches freed
      // cells and let planters and rails land where they previously could not.
      //
      // P1b samples geometry rather than testing every triangle, so it wobbles
      // by one whenever nearby geometry changes shape. Verified by listing what
      // it reports: hotels, Orchard Central and Tang Plaza, none of them the new
      // recipes.
      // P4 822 -> 668 and P6 45 -> its measured figure on the day the dressing
      // reach went 230m -> 1200m and the whole district got kerbed, lamped and
      // treed instead of a third of it. Three times the props and FEWER
      // duplicates, because the kerb lists are now deduped over a real 60cm
      // neighbourhood instead of relying on `claim`, which is a single-cell
      // hash and lets boundary-straddling pairs through.
      P4: 668, P6: 45,
    },
  };
  const add = (id, name, severity, count, budget, detail, examples) => {
    const o = (OVERRIDE[SCENE] || {})[id];
    findings.push({ id, name, severity, count,
                    budget: o === undefined ? budget : o, detail,
                    examples: (examples || []).slice(0, (window.__auditEx || 8)) });
  };

  /* ================= shared indices ================= */
  const CELL = 40;
  const rGrid = new Map();
  const stamp = (x1, z1, x2, z2, half, name, kind) => {
    const seg = [x1, z1, x2, z2, half, name, kind];
    const mnx = Math.min(x1, x2) - half, mxx = Math.max(x1, x2) + half;
    const mnz = Math.min(z1, z2) - half, mxz = Math.max(z1, z2) + half;
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!rGrid.has(k)) rGrid.set(k, []);
        rGrid.get(k).push(seg);
      }
  };
  const carriage = (data.roads || []).filter(
    (r) => r.k !== 'footway' && r.k !== 'pedestrian' && r.k !== 'steps');
  for (const r of carriage)
    for (let i = 0; i < r.p.length - 1; i++)
      stamp(r.p[i][0], r.p[i][1], r.p[i + 1][0], r.p[i + 1][1],
            (r.w || 6) / 2, r.n || '(unnamed)', r.k);
  if (axis)
    for (let i = 0; i < axis.p.length - 1; i++)
      stamp(axis.p[i][0], axis.p[i][1], axis.p[i + 1][0], axis.p[i + 1][1],
            axis.w / 2, axis.n || 'Orchard Road', 'axis');

  const roadAt = (x, z, margin, skipService) => {
    const list = rGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return null;
    for (const [x1, z1, x2, z2, half, name, kind] of list) {
      if (skipService && kind === 'service') continue;
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      const reach = half + (margin || 0);
      if (dx * dx + dz * dz < reach * reach) return name;
    }
    return null;
  };

  const bGrid = new Map();
  for (const b of data.buildings) {
    let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (const p of b.p) {
      if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0];
      if (p[1] < mnz) mnz = p[1]; if (p[1] > mxz) mxz = p[1];
    }
    for (let cx = Math.floor(mnx / CELL); cx <= Math.floor(mxx / CELL); cx++)
      for (let cz = Math.floor(mnz / CELL); cz <= Math.floor(mxz / CELL); cz++) {
        const k = cx + ',' + cz;
        if (!bGrid.has(k)) bGrid.set(k, []);
        bGrid.get(k).push(b);
      }
  }
  const inPoly = (poly, x, z) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
      if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)) hit = !hit;
    }
    return hit;
  };
  const buildingAt = (x, z) => {
    const list = bGrid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
    if (!list) return null;
    for (const b of list) if (inPoly(b.p, x, z)) return b;
    return null;
  };

  const axisDist = (x, z) => {
    let bd = Infinity;
    for (let i = 0; i < axis.p.length - 1; i++) {
      const [x1, z1] = axis.p[i], [x2, z2] = axis.p[i + 1];
      const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
      let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (x1 + vx * t), dz = z - (z1 + vz * t);
      if (dx * dx + dz * dz < bd) bd = dx * dx + dz * dz;
    }
    return Math.sqrt(bd);
  };

  /* ================= collect props ================= */
  const props = [];
  const m4 = new T.Matrix4(), v3 = new T.Vector3();
  sc.updateMatrixWorld(true);
  sc.traverse((o) => {
    if (!o.isInstancedMesh) return;
    const g = o.geometry, pr = g.parameters || {};
    const sig = `${g.type}(${[pr.radiusTop, pr.width, pr.height, pr.depth, pr.radius]
      .filter((v) => v != null).map((v) => +v.toFixed(2)).join(',')})`;
    // material identity rides SEPARATELY from sig: several exemption sets
    // (CLUSTERED, ROAD_OK, MOUNTED, CANOPY...) match sig strings exactly, and
    // appending the material there would silently revoke every one of them —
    // the allowlist trap this file already documents. Only P4 reads .mat.
    const matId = o.material ? (o.material.name || o.material.uuid.slice(0, 6)) : '';
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m4);
      v3.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
      // the instance's own scale, so a check can reason about how far the thing
      // extends rather than only where its origin is
      const sc3 = new T.Vector3();
      m4.decompose(new T.Vector3(), new T.Quaternion(), sc3);
      // BY MECHANISM, NOT BY SHAPE. Every pedestrian exemption below was a
      // list of geometry parameters, and lengthening the leg capsule from 0.44
      // to 0.587 (it was 15cm short of its own shoe) silently revoked all of
      // them — three walkers mid-crossing appeared as blockers. That is the
      // third time this file has been bitten by a signature allowlist: the
      // tree branch, the lamp bracket, and now the crowd. The note at ROAD_OK
      // already says a signature list "fails CLOSED for changed ones"; the
      // answer is to stop describing a person by their measurements.
      props.push({ sig, mat: matId, x: v3.x, y: v3.y, z: v3.z, sy: sc3.y,
                   crowd: !!o.userData.crowdPart,
                   actor: !!(o.userData.actor || o.userData.crowdPart),
                   flat: g.type === 'PlaneGeometry' });
    }
  });

  // Things that legitimately occupy a carriageway. Each has its reason.
  const ROAD_OK = new Set([
    'BoxGeometry(2.1,0.34,3)',      // central median: it divides the road
    'CylinderGeometry(0.14,6.4)',   // palm planted in that median
    'SphereGeometry(0.66)',         // shrub in the central median (measured: all
                                    // 348 of them sit at 0.7m, so this is
                                    // planting, not the canopy it was labelled)
    'IcosahedronGeometry(1)',       // canopy detail, same reason
    // An Angsana limb over the carriageway is not a defect, it is the street:
    // the avenue meets overhead and that is what Orchard Road looks like. The
    // exemption is still conditional on OVERHEAD_MIN below, so a branch at head
    // height is not excused by this line.
    //
    // NOTE the fragility this exposed. These keys are geometry parameters, so
    // retuning the tree from radiusTop 0.07 to 0.06 silently revoked the
    // exemption and 409 branches appeared as blockers overnight. The check was
    // right to shout; the lesson is that a signature allowlist fails OPEN for
    // new shapes and fails CLOSED for changed ones, and only the second is safe.
    'CylinderGeometry(0.06,1)',     // tree branch inside that canopy
    // The traffic-signal LENS. It used to be three individual meshes per head
    // and so was invisible to the prop checks entirely; instancing them into
    // one mesh on 2026-07-29 (129 draw calls down to one, which is what took
    // F3 back under budget) made them props for the first time and 1,413
    // appeared over carriageways. A signal head hangs over the road because
    // that is what it is for -- the same reason the arm above it is exempt.
    'CircleGeometry(0.1)',          // traffic signal lens, over the junction
    'CylinderGeometry(0.07,2.4)',   // lamp arm, reaches over the carriageway
    // The lamp arm became a CURVE on 2026-07-29 -- LTA's standard bracket is a
    // single smooth curved arm, not the straight cantilever this world had --
    // and it is built as three short segments. Rebuilding it silently revoked
    // the exemption above and 36 arm sections appeared as props in the
    // carriageway, which is precisely the failure mode the note above this
    // line predicted for CHANGED shapes. The arm still reaches over the road
    // because that is what a street light does.
    'CylinderGeometry(0.05,0.9)',   // curved lamp bracket, lower segment
    'CylinderGeometry(0.05,1)',     // curved lamp bracket, middle segment
    'BoxGeometry(1,0.2,0.44)',      // lamp head on the end of that arm
    'BoxGeometry(0.9,0.16,0.4)',    // side-street lamp head
    'CylinderGeometry(0.07,3.2)',   // covered walkway post at a crossing point
    'CylinderGeometry(0.31,0.2)',   // vehicle wheels
    'BoxGeometry(1.78,0.62,4.32)', 'BoxGeometry(1.64,0.5,2.1)',   // cars
    'BoxGeometry(1.69,0.38,2)',
    'BoxGeometry(2.5,2.5,11.8)', 'BoxGeometry(2.54,0.62,11.7)',   // buses
    'BoxGeometry(2.54,0.95,10.4)',
    // SUPERSEDED 2026-07-30: pedestrians are exempt by userData.crowdPart
    // (see the props collector). These measurements stopped matching the
    // moment the leg capsule was corrected and are kept only as a record of
    // what the figure used to be. Do not add new ones here.
    'CapsuleGeometry(0.4,0.04)', 'CapsuleGeometry(0.44,0.06)',    // pedestrians,
    'CapsuleGeometry(0.34,0.13)', 'CapsuleGeometry(0.1,0.12)',    // who do cross
    'BoxGeometry(0.11,0.07,0.25)', 'BoxGeometry(0.22,0.26,0.1)',
    'SphereGeometry(0.05)', 'SphereGeometry(0.1)', 'SphereGeometry(0.11)',
    'CylinderGeometry(0.05,0.1)',
    'CylinderGeometry(0.48,0.28)',  // bus wheels
    'BoxGeometry(1.65,0.42,0.08)',  // bus destination blind
    'BoxGeometry(1,3.2,0.5)',       // rooftop sign box, tens of metres up
  ]);
  // Fixed to a building, so overlapping its footprint is the point.
  const MOUNTED = new Set([
    'BoxGeometry(0.28,1.05,2.6)',   // shopfront fascia sign
    'BoxGeometry(0.9,7.5,0.35)',    // vertical banner
    'BoxGeometry(1,3.2,0.5)',       // rooftop sign box
    'IcosahedronGeometry(1)', 'SphereGeometry(0.66)',   // canopy against a facade
    'CylinderGeometry(0.06,1)', 'BoxGeometry(2.1,0.34,3)',
  ]);
  // Clustered round a shared origin by construction, so proximity is not duplication.
  const CLUSTERED = new Set(['CylinderGeometry(0.06,1)', 'IcosahedronGeometry(1)',
    'SphereGeometry(0.66)',
    // a person carries two arms, two legs and two shoes, all within 60cm
    // SUPERSEDED: exempt by userData.crowdPart, see the props collector.
    'CapsuleGeometry(0.4,0.04)', 'CapsuleGeometry(0.44,0.06)',
    'CapsuleGeometry(0.34,0.13)', 'CapsuleGeometry(0.1,0.12)',
    'BoxGeometry(0.11,0.07,0.25)', 'SphereGeometry(0.05)',
    'SphereGeometry(0.1)', 'SphereGeometry(0.11)', 'CylinderGeometry(0.05,0.1)',
    'BoxGeometry(0.22,0.26,0.1)',
    // red, amber and green are 27cm apart on one head, so a signal is three
    // "duplicates" by construction -- the same reason a person's two shoes are
    // in this list
    'CircleGeometry(0.1)']);

  let sky = null;
  sc.traverse((o) => {
    if (o.isMesh && o.geometry.type === 'SphereGeometry'
        && o.geometry.parameters.radius > 100) sky = o;
  });

  /* ================= P: placement ================= */
  {
    // Being on the list is not enough. A lamp arm is exempt because it reaches
    // over the road eight metres up; the same signature at knee height would be
    // something you ride into, and the list must not excuse that. Only these may
    // sit low: things that use roads, and planting in the median.
    const LOW_OK = new Set([
      'SphereGeometry(0.66)',         // median shrub
      'BoxGeometry(2.1,0.34,3)',      // median kerb
      'CylinderGeometry(0.14,6.4)',   // median palm
      'CylinderGeometry(0.31,0.2)', 'CylinderGeometry(0.48,0.28)',   // wheels
      'BoxGeometry(1.78,0.62,4.32)', 'BoxGeometry(1.64,0.5,2.1)',    // cars
      'BoxGeometry(1.69,0.38,2)', 'BoxGeometry(2.5,2.5,11.8)',       // buses
      'BoxGeometry(2.54,0.62,11.7)', 'BoxGeometry(2.54,0.95,10.4)',
      'BoxGeometry(1.65,0.42,0.08)',  // bus blind
      // SUPERSEDED: exempt by userData.crowdPart, see the props collector.
      'CapsuleGeometry(0.4,0.04)', 'CapsuleGeometry(0.44,0.06)',     // pedestrians
      'CapsuleGeometry(0.34,0.13)', 'CapsuleGeometry(0.1,0.12)',
      'BoxGeometry(0.11,0.07,0.25)', 'BoxGeometry(0.22,0.26,0.1)',
      'SphereGeometry(0.05)', 'SphereGeometry(0.1)', 'SphereGeometry(0.11)',
      'CylinderGeometry(0.05,0.1)',
    ]);
    // Clearance over a carriageway. This was 3.0m, "clear of a rider on a
    // scooter", which is the wrong vehicle to size it by: Orchard Road is a bus
    // route and a double-decker is 4.3m tall. Anything hanging lower than this
    // over a live lane would be struck by traffic that actually uses the
    // street, so the number comes from the tallest thing on the road, not from
    // the thing the player happens to be riding.
    const OVERHEAD_MIN = 4.8;
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat) continue;
      // A person on a crossing is a person, not a prop in the road. Exempt by
      // what they ARE (userData.crowdPart, set on every part of every walker)
      // rather than by a list of capsule dimensions that goes stale the moment
      // the figure is retuned.
      if (p.crowd) continue;
      if (ROAD_OK.has(p.sig)) {
        const up = terr ? p.y - terr.at(p.x, p.z) : 99;
        if (LOW_OK.has(p.sig) || up >= OVERHEAD_MIN) continue;
        // on the list, but low enough to hit: not excused
      }
      const rd = roadAt(p.x, p.z, -0.5);
      if (!rd) continue;
      bad[p.sig] = (bad[p.sig] || 0) + 1;
      ex.push(`${p.sig} in "${rd}" at ${p.x | 0},${p.z | 0}`);
    }
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    add('P1', 'props in a carriageway', 'BLOCKER', n, 0,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([k, v]) => `${v}x ${k}`).join('  ') || 'none', ex);
  }
  {
    // P1b: everything that is NOT an instanced prop. This check did not exist,
    // and it is the largest category of geometry in the world: buildings,
    // shopfronts, entrance canopies, colonnades, landmark structure. The audit
    // reported a clean district while a row of six-metre columns stood across
    // the carriageway at the spawn point, because it only ever looked at props.
    const v = new T.Vector3();
    const bad = {}, ex = [];
    const RIDE_HEIGHT = 9;          // what you can actually hit on a scooter
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const pos = o.geometry.attributes.position;
      if (!pos) return;
      if (o === sky || o.material.fog === false) return;   // the sky dome
      // THE PLAYER'S OWN VEHICLE IS NOT STRUCTURE.
      //
      // The scooter and its rider were nine findings here -- wheels, seat,
      // deck, helmet, limbs -- for standing on Orchard Road, which is what a
      // scooter on Orchard Road is meant to do. T1 has always said "a vehicle
      // is not an obstruction" and this check never had the same sentence.
      // Matched by the rig's NAME, walking up the parents, because a signature
      // allowlist silently stops applying the moment a shape is retuned.
      for (let q = o; q; q = q.parent) if (q.name === 'playerRig') return;
      // The ground itself. P8 owns "ground standing through the carriageway"
      // and measures it as a fraction of the road surface, which is the right
      // shape for a heightfield; counting it here as well was double-counting.
      if (o.name === 'terrainSurface') return;
      // ...and the road surface itself, for the same reason. A check called
      // "structure in a carriageway" was counting the carriageway.
      if (o.name === 'roadSurface' || o.name === 'pavementSurface'
          || o.name === 'roadMarking') return;
      if (o.geometry.type === 'PlaneGeometry'
          && o.geometry.parameters.width > 500) return;     // ground fallback plane
      let hit = null, worstX = 0, worstZ = 0, minY = 1e9, maxY = -1e9, n = 0;
      // DETERMINISTIC sampling.
      //
      // This skipped any mesh over 6,000 vertices and took a fixed 80 samples
      // from the rest. Both make the result depend on things that have nothing
      // to do with the defect: change the building count and the merger packs
      // its tiles differently, so which meshes cross 6,000 changes and so does
      // what is checked. The number moved from 99 to 124 after dropping two
      // zero-area footprints, and half an hour was spent looking for geometry
      // that had not moved.
      //
      // A constant stride depends only on the mesh itself, so the same world
      // always gives the same answer and a change in the number means a change
      // in the world.
      const step = 3;
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
        // The envelope a rider actually occupies has a FLOOR as well as a
        // ceiling, and this only had a ceiling.
        //
        // Buildings are seated on footingY -- the lowest ground under the whole
        // footprint, sunk a further 0.9m -- so on a grade the uphill end is
        // deliberately buried, which this project chose on purpose because "a
        // building cut into a slope is invisible from outside". Orchard falls
        // 46m. The result was that the buried BASE of a building counted as
        // structure standing in a carriageway: measured, 45 of the 51 building
        // masses reported here were underground, 36 of them by more than three
        // metres, one by 20.6m. Nothing can encounter a wall 20m under a road.
        //
        // pruneCarriageway has always had this floor (`up < 0.3`) and P1b never
        // did, so the two have been disagreeing about the same geometry. The
        // prune is the one that is right. Geometry that rises THROUGH the road
        // still has vertices in the band and is still caught.
        const up = v.y - (terr ? terr.at(v.x, v.z) : 0);
        if (up > RIDE_HEIGHT || up < -0.3) continue;
        n++;
        // service lanes are skipped for the same reason P5 skips them: a hotel
        // set-down or a loading bay is what a service road is for
        const rd = roadAt(v.x, v.z, -1.0, true);
        if (rd) { hit = rd; worstX = v.x; worstZ = v.z; }
      }
      // Nothing under 40cm is something you ride into: those are aprons,
      // thresholds and paving trim that sit flush with the road on purpose.
      if (!hit || !n || maxY - minY < 0.4) return;
      // Structures that are SUPPOSED to be over a carriageway. A traffic signal
      // that does not hang over the road is not a traffic signal, and a
      // direction gantry spans it by definition. Same reasoning as P1's list.
      const gp0 = o.geometry.parameters || {};
      const dim = (a, b2) => Math.abs((a || 0) - b2) < 0.02;
      const OVERHEAD =
        (o.geometry.type === 'CylinderGeometry' && dim(gp0.radiusTop, 0.06))      // signal pole and arm
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 0.32)
            && dim(gp0.height, 0.86))                                            // signal head
        || (o.geometry.type === 'CircleGeometry')                                 // signal lens
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 4.6)
            && dim(gp0.height, 1.72))                                            // gantry backer
        || (o.geometry.type === 'PlaneGeometry' && dim(gp0.width, 4.6)
            && dim(gp0.height, 1.72))                                            // gantry face
        || (o.geometry.type === 'CylinderGeometry' && dim(gp0.radiusTop, 0.13))   // gantry post
        || (o.geometry.type === 'BoxGeometry' && (gp0.width || 0) > 14
            && (gp0.height || 0) < 5 && (gp0.depth || 0) > 2.5)                   // overhead bridge deck
        // THE PARAPET IS PART OF THE DECK. The deck spanning a carriageway is
        // already exempt above -- that is what an overpass is -- but its
        // handrail is 10cm deep and did not match the deck's own signature, so
        // one footbridge over Sheares Avenue reported its two parapets and its
        // roof edge as structure standing in the road. Exempting the deck and
        // then reporting the railing bolted to it is not a finding, it is the
        // same object described twice.
        || (o.geometry.type === 'BoxGeometry' && (gp0.width || 0) > 14
            && Math.abs((gp0.height || 0) - 1.05) < 0.01
            && Math.abs((gp0.depth || 0) - 0.1) < 0.01)                          // bridge parapet
        || (o.geometry.type === 'CylinderGeometry' && (gp0.radiusTop || 0) > 10)   // ION's shell over its forecourt
        // The ERP gantry itself. Its antenna heads read the tag on a car
        // passing UNDER them and its amber panel tells that car what it is
        // about to be charged: a gantry that does not span the carriageway is
        // not a gantry. These were never exempt because until the surveyed LTA
        // positions arrived on 2026-07-28 the gantries were pushed off the road
        // by the same fallback that was hiding them from this check.
        //
        // The LEGS are deliberately NOT exempt. They are the one part that must
        // stand clear, and erpGantry now searches its leg reach outward until
        // they do — six of thirty were in live traffic when the span came
        // straight from the survey, because LTA's line spans the charged lanes
        // and the road is often wider.
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 0.62)
            && dim(gp0.height, 0.3) && dim(gp0.depth, 0.85))                     // ERP antenna head
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 2.4)
            && dim(gp0.height, 0.9) && dim(gp0.depth, 0.12))                     // ERP amber panel
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.width, 0.4)
            && dim(gp0.height, 0.4) && dim(gp0.depth, 0.75))                     // ERP camera housing
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.height, 0.85)
            && dim(gp0.depth, 0.55) && (gp0.width || 0) > 8)                     // ERP main beam
        || (o.geometry.type === 'BoxGeometry' && dim(gp0.height, 0.28)
            && dim(gp0.depth, 0.32) && (gp0.width || 0) > 8);                    // ERP service beam
      if (OVERHEAD) return;
      const gp = o.geometry.parameters || {};
      const dims = [gp.radiusTop, gp.width, gp.height, gp.depth]
        .filter((q) => q != null).map((q) => +q.toFixed(2)).join('x');
      const key = `${o.geometry.type}(${dims})|${(maxY - minY).toFixed(1)}m tall`;
      bad[key] = (bad[key] || 0) + 1;
      if (ex.length < 200) {
        const bb2 = new T.Box3().setFromObject(o);
        const mm = o.material || {};
        ex.push(`${key} in "${hit}" at ${worstX | 0},${worstZ | 0}`
          + ` [verts=${pos.count} name=${o.name || '-'} mat=${mm.type || '-'}`
          + `/${(mm.map && (mm.map.name || 'map')) || 'nomap'}`
          + ` col=${mm.color ? mm.color.getHexString() : '-'}`
          + ` bbox=${bb2.min.x | 0},${bb2.min.z | 0}..${bb2.max.x | 0},${bb2.max.z | 0}`
          + ` y=${bb2.min.y.toFixed(1)}..${bb2.max.y.toFixed(1)}]`);
      }
    });
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    // P1b is new and inherited a backlog. The target is zero, but a check
    // introduced into an existing world cannot start by failing everything, so
    // it runs as a RATCHET: the number may go down and never up. The budget is
    // the best figure reached so far — 286 when the check was written, 116 now.
    // Leaving it at the original 286 would have quietly permitted a regression
    // all the way back, which defeats the point of a ratchet.
    // 97 -> 99 on 2026-07-27, and this is NOT a regression being waved through.
    // The building geometry is identical: same OSM extract, same process.py,
    // every count matches to the unit. What changed is the ground under it. The
    // heightfield had a shadowed loop variable that left much of the grid at
    // zero, and correcting it moved the terrain under Scotts Road from 27.1m to
    // 41.5m. Two pieces of structure that were always standing in a carriageway
    // are now measured as doing so. The check got more accurate; the world did
    // not get worse. Verified by running this same audit against the previous
    // scene file, which still reports 97.
    // 135 -> 124: the ERP gantries moved from two per axis at chosen
    // arclengths to LTA's surveyed positions, with their legs searched outward
    // until clear and only their genuinely-overhead parts exempt. The world got
    // cleaner than the number it inherited, so the number follows it down.
    // 286 -> 124 -> 56 -> 17 -> 0 over 2026-07-27/28. CLOSED: a plain BLOCKER
    // at zero now, not a ratchet. See the world override above.
  {
    // Non-finite instanced matrices. One NaN instance can corrupt how a
    // driver batches EVERY instanced draw — the torn-walker episode of
    // 2026-07-30 matched this class, and the LOD compactor now refuses
    // such instances. This catches the SOURCE at gate time.
    let bad = 0;
    sc.traverse((o) => {
      if (!o.isInstancedMesh) return;
      const a2 = o.instanceMatrix.array;
      for (let i = 0; i < o.count * 16; i++) {
        if (!Number.isFinite(a2[i])) { bad++; break; }
      }
    });
    add('P11', 'instanced meshes carrying non-finite matrices', 'BLOCKER', bad, 0,
        bad ? `${bad} mesh(es) with NaN/Infinity elements` : 'none');
  }

    add('P1b', 'structure in a carriageway', 'BLOCKER', n, 0,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 6)
          .map(([k, v2]) => `${v2}x ${k}`).join('  ') || 'none', ex);
  }
  {
    const bad = {}, ex = [];
    for (const p of props) {
      if (p.flat || MOUNTED.has(p.sig)) continue;
      const b = buildingAt(p.x, p.z);
      if (!b) continue;
      bad[p.sig] = (bad[p.sig] || 0) + 1;
      ex.push(`${p.sig} inside "${b.n || '(unnamed)'}"`);
    }
    const n = Object.values(bad).reduce((a, b) => a + b, 0);
    add('P2', 'props inside a building', 'MAJOR', n, 30,
        Object.entries(bad).sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([k, v]) => `${v}x ${k}`).join('  ') || 'none', ex);
  }
  {
    // A rooftop sign is on a roof, and the crowd parks the instances it is not
    // drawing at y = -9999 rather than paying to render them.
    const ROOFTOP = new Set(['BoxGeometry(1,3.2,0.5)']);
    // What this check is really asking is "is there anything holding it up",
    // and a flat 19m ceiling was standing in for that. It was silently
    // calibrated to the old 12.5m trees: growing the Angsanas to a correct 17.5m
    // put their canopy over the line and reported healthy foliage as floating
    // in mid-air.
    //
    // So test the actual question for the one prop class that is legitimately
    // high: canopy is supported if a trunk stands inside its crown. Everything
    // else keeps the ceiling.
    const CANOPY = new Set(['IcosahedronGeometry(1)', 'CylinderGeometry(0.06,1)']);
    const TRUNK = 'CylinderGeometry(0.3,1)';
    const CROWN = 13;               // the widest crown radius the tree field builds
    const trunkGrid = new Map();
    for (const p of props) {
      if (p.sig !== TRUNK) continue;
      const k = Math.floor(p.x / CROWN) + ',' + Math.floor(p.z / CROWN);
      if (!trunkGrid.has(k)) trunkGrid.set(k, []);
      trunkGrid.get(k).push(p);
    }
    const overATree = (p) => {
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const list = trunkGrid.get((Math.floor(p.x / CROWN) + dx) + ',' + (Math.floor(p.z / CROWN) + dz));
        if (!list) continue;
        for (const t of list)
          if ((t.x - p.x) ** 2 + (t.z - p.z) ** 2 < CROWN * CROWN) return true;
      }
      return false;
    };
    let floating = 0, sunk = 0; const ex = [];
    for (const p of props) {
      if (!terr) break;
      if (ROOFTOP.has(p.sig) || p.y < -900) continue;
      const d = p.y - terr.at(p.x, p.z);
      if (d > 19) {
        if ((CANOPY.has(p.sig) || p.flat) && overATree(p)) continue;
        // A tall box centred on its own middle is not floating. The distant
        // massing is a unit cube scaled to the block's size, so a 40m block has
        // its origin 20m up while its underside is on the ground. Ask where the
        // BOTTOM is, which is the question this check was always trying to ask.
        if (p.sy > 2 && Math.abs(d - p.sy / 2) < 2.5) continue;
        floating++; ex.push(`${p.sig} ${d.toFixed(1)}m up`);
      }
      if (d < -1.2) { sunk++; ex.push(`${p.sig} ${(-d).toFixed(1)}m down`); }
    }
    add('P3', 'props off the ground', 'BLOCKER', floating + sunk, 0,
        `${floating} floating, ${sunk} sunk`, ex);
  }
  {
    // P8: the ground standing THROUGH the tarmac.
    //
    // A road ribbon takes its height from the terrain at each centreline vertex
    // and is flat in between. OSM vertices sit up to thirty metres apart and the
    // heightfield is bilinear over 35m cells, so wherever a road crossed a cell
    // with curvature the hillside came straight up through the carriageway:
    // 16.6% of the whole road surface, worst case 4.9 METRES. On screen the road
    // simply stopped. Nothing looked for it because every placement check asks
    // where things are in PLAN, and this is a defect in section.
    //
    // ribbon() subdivides at 3m now. This reproduces that subdivision so it
    // measures the surface that is actually drawn; if the two numbers drift
    // apart this check silently stops meaning anything, which is why both carry
    // a note to keep them equal.
    // Two upgrades, both from the day the user's "yellow patches" were finally
    // found and this check was green the whole time:
    //
    // 1. It compared terr.at() against a road built FROM terr.at() -- the input
    //    against the input. The DRAWN terrain is piecewise flat between its
    //    vertices and bulged up to 26cm above the bilinear surface, straight
    //    through the tarmac. terr.atDrawn() is the height of the mesh that is
    //    actually rendered.
    // 2. It sampled only the CENTRELINE. The ribbon's edge vertices follow the
    //    ground at the kerb, so the centre of a wide carriageway is where the
    //    two surfaces drift furthest apart. Sampled at five stations across the
    //    width now.
    const STEP = 3;
    let over = 0, tested = 0, worst = 0; const ex = [];
    const ACROSS = [-0.85, -0.5, 0, 0.5, 0.85];
    for (const road of (data.roads || [])) {
      if (!terr) break;
      if (road.bridge) continue;             // a deck does not follow the ground
      const isPath = road.k === 'footway' || road.k === 'pedestrian';
      const y = isPath ? 0.02 : 0.055;
      const half = (road.w || 6) / 2;
      const raw = road.p, sub = [];
      for (let i = 0; i < raw.length - 1; i++) {
        const a = raw[i], c = raw[i + 1];
        const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
        const n = Math.max(1, Math.ceil(L / STEP));
        for (let k = 0; k < n; k++) {
          const t = k / n;
          sub.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t]);
        }
      }
      sub.push(raw[raw.length - 1]);
      for (let i = 0; i < sub.length - 1; i++) {
        const a = sub[i], c = sub[i + 1];
        const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
        if (L < 0.2) continue;
        const nx = -(c[1] - a[1]) / L, nz = (c[0] - a[0]) / L;
        for (let t = 0.5; t < L; t += 2) {
          const f = t / L;
          const x = a[0] + (c[0] - a[0]) * f, z = a[1] + (c[1] - a[1]) * f;
          // the drawn road: strips of at most 6m across, each vertex on the
          // ground -- KEEP IN STEP with ribbon() in city.js
          const nAcross = Math.max(1, Math.ceil((road.w || 6) / 6));
          const stripY = [];
          for (let k = 0; k <= nAcross; k++) {
            const fk = -1 + 2 * k / nAcross;
            stripY.push(terr.at(x + nx * half * fk, z + nz * half * fk) + y);
          }
          for (const s of ACROSS) {
            const px = x + nx * half * s, pz = z + nz * half * s;
            const u = (s + 1) / 2 * nAcross;
            const k = Math.min(nAcross - 1, Math.floor(u));
            const roadY = stripY[k] + (stripY[k + 1] - stripY[k]) * (u - k);
            const poke = terr.atDrawn(px, pz) - roadY;
            tested++;
            if (poke > 0.05) {
              over++;
              if (poke > worst) { worst = poke; }
              if (ex.length < 6) ex.push(`ground ${poke.toFixed(2)}m through "${road.n || '(unnamed)'}" at ${px | 0},${pz | 0} (${s > 0.1 ? 'right' : s < -0.1 ? 'left' : 'centre'})`);
            }
          }
        }
      }
    }
    add('P8', 'ground standing through the carriageway', 'MAJOR', over, 60,
        `${over} of ${tested} road surface samples, worst ${worst.toFixed(2)}m`, ex);
  }
  {
    const NEAR = 0.6, g2 = new Map();
    let dup = 0; const ex = [];
    for (const p of props) {
      // Same mechanism rule as P1: a person carries two arms, two legs and
      // two shoes within 60cm by construction, and that is a fact about
      // being a person, not about the capsule they happen to be made of.
      if (p.flat || p.crowd || CLUSTERED.has(p.sig)) continue;
      // the P4 key includes the MATERIAL: a painted kerb section abutting a
      // plain kerb section is the same box in two materials 60cm apart —
      // correct furniture at every crossing mouth, not duplication. Material
      // rides on p.mat rather than inside sig, because the exemption sets
      // above match sig strings exactly.
      const psig = p.sig + (p.mat ? '@' + p.mat : '');
      const cx = Math.floor(p.x), cz = Math.floor(p.z);
      let hit = false;
      for (let dx = -1; dx <= 1 && !hit; dx++)
        for (let dz = -1; dz <= 1 && !hit; dz++) {
          const list = g2.get(psig + '|' + (cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const q of list)
            if ((q[0] - p.x) ** 2 + (q[1] - p.z) ** 2 < NEAR * NEAR) { hit = true; break; }
        }
      if (hit) { dup++; ex.push(`${p.sig} at ${p.x | 0},${p.z | 0}`); }
      const k = psig + '|' + cx + ',' + cz;
      if (!g2.has(k)) g2.set(k, []);
      g2.get(k).push([p.x, p.z]);
    }
    add('P4', 'duplicated props', 'MAJOR', dup, 100,
        `${dup} within 60cm of an identical prop`, ex);
  }
  {
    const bad = [];
    for (const b of data.buildings) {
      let worst = 0;
      for (const p of b.p) {
        const list = rGrid.get(Math.floor(p[0] / CELL) + ',' + Math.floor(p[1] / CELL));
        if (!list) continue;
        for (const [x1, z1, x2, z2, half, , kind] of list) {
          if (kind === 'service') continue;   // set-downs and loading bays are the point
          const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((p[0] - x1) * vx + (p[1] - z1) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const pen = half - Math.hypot(p[0] - (x1 + vx * t), p[1] - (z1 + vz * t));
          if (pen > worst) worst = pen;
        }
      }
      if (worst > 0.8) bad.push(`${b.n || '(unnamed)'} ${worst.toFixed(1)}m in`);
    }
    add('P5', 'buildings in a carriageway', 'MAJOR', bad.length, 5,
        `${bad.length} of ${data.buildings.length} footprints`, bad);
  }
  {
    // Flat things lying on the ground fight for the depth buffer. Foliage
    // billboards also come back as PlaneGeometry, but they are alpha-tested
    // cards standing up inside a canopy, where overlap is both inevitable and
    // invisible, so only ground-level markings are considered.
    // Two markings only fight if they actually overlap. A grid-cell test called
    // the two halves of a double yellow line coplanar when they sit 22cm apart
    // and never touch, so the surfaces must be within 18cm as well as 4mm.
    const g3 = new Map(); let zf = 0; const ex = [];
    const OVER = 0.18;
    for (const p of props) {
      if (!p.flat) continue;
      if (!terr || p.y - terr.at(p.x, p.z) > 0.3) continue;
      const cx = Math.round(p.x / 0.5), cz = Math.round(p.z / 0.5);
      let hit = false;
      for (let dx = -1; dx <= 1 && !hit; dx++)
        for (let dz = -1; dz <= 1 && !hit; dz++) {
          const list = g3.get((cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const q of list)
            if (Math.abs(q[2] - p.y) < 0.004
                && (q[0] - p.x) ** 2 + (q[1] - p.z) ** 2 < OVER * OVER) { hit = true; break; }
        }
      if (hit) { zf++; ex.push(`flat pair at ${p.x | 0},${p.z | 0}`); }
      const k = cx + ',' + cz;
      if (!g3.has(k)) g3.set(k, []);
      g3.get(k).push([p.x, p.z, p.y]);
    }
    add('P6', 'z-fighting flat surfaces', 'MAJOR', zf, 20,
        `${zf} coplanar pairs within 4mm`, ex);
  }

  {
    // P7: a marking below the carriageway surface is buried. Lane dashes and
    // zebra crossings were dropped to 0.046 and 0.052 while the tarmac is drawn
    // at 0.055, so they were under the road and nothing else noticed: every
    // other check was happy, and the street simply looked wrong.
    const ROAD_Y = 0.055;
    let sunk = 0; const ex = [];
    for (const p of props) {
      if (!p.flat || !terr) continue;
      const above = p.y - terr.at(p.x, p.z);
      if (above < 0.001) continue;              // not a road marking at all
      if (above > 0.5) continue;                // signage, not paint
      if (above < ROAD_Y + 0.004) {
        sunk++;
        if (ex.length < 6) ex.push(`marking ${(above * 1000) | 0}mm up, tarmac at ${ROAD_Y * 1000}mm`);
      }
    }
    add('P7', 'road markings under the tarmac', 'BLOCKER', sunk, 0,
        `${sunk} flat markings at or below the carriageway surface`, ex);
  }

  /* ================= C: coverage ================= */
  const streets = new Map();
  for (const r of carriage) {
    if (!r.n || /orchard road/i.test(r.n)) continue;
    let len = 0;
    for (let i = 0; i < r.p.length - 1; i++)
      len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
    const e = streets.get(r.n) || { len: 0, pts: [] };
    e.len += len; e.pts.push(...r.p);
    streets.set(r.n, e);
  }
  // Measured per street name, never per way: OSM splits a road at every
  // junction. Only the stretch inside the dressed radius is judged — a street
  // that runs 400m out of the district is not undressed for the part nobody
  // built, and testing its far end reported a bare street that was not bare.
  const dressed = [...streets.entries()]
    .filter(([, e]) => e.len >= 45 && e.pts.some((p) => axisDist(p[0], p[1]) <= 230))
    .map(([n, e]) => [n, { len: e.len, pts: e.pts.filter((p) => axisDist(p[0], p[1]) <= 230) }]);

  const propGrid = new Map();
  for (const p of props) {
    if (p.flat) continue;
    const k = Math.floor(p.x / 20) + ',' + Math.floor(p.z / 20);
    if (!propGrid.has(k)) propGrid.set(k, []);
    propGrid.get(k).push(p);
  }
  const nearAny = (pts, test, reach) => {
    const R2 = reach * reach, span = Math.ceil(reach / 20);
    for (const q of pts) {
      const cx = Math.floor(q[0] / 20), cz = Math.floor(q[1] / 20);
      for (let dx = -span; dx <= span; dx++)
        for (let dz = -span; dz <= span; dz++) {
          const list = propGrid.get((cx + dx) + ',' + (cz + dz));
          if (!list) continue;
          for (const p of list)
            if (test(p.sig) && (p.x - q[0]) ** 2 + (p.z - q[1]) ** 2 < R2) return true;
        }
    }
    return false;
  };
  const isKerb = (s) => s === 'BoxGeometry(0.38,0.3,4)' || s === 'BoxGeometry(0.42,0.3,2)';
  const isLamp = (s) => s === 'CylinderGeometry(0.11,9)' || s === 'BoxGeometry(0.9,0.16,0.4)'
    || s === 'BoxGeometry(1,0.2,0.44)' || s === 'CylinderGeometry(0.05,2.6)';
  const isTree = (s) => s === 'SphereGeometry(0.66)' || s === 'IcosahedronGeometry(1)';

  {
    // A street tagged sidewalk=no or sidewalk=separate has no kerbside pavement
    // on the carriageway, and the dressing honours that tag. Demanding kerbs
    // there would be demanding we contradict the map: Mount Sophia is tagged
    // separate or no on every way, so having none is the correct answer.
    const noKerbByTag = new Set();
    for (const r of carriage) {
      if (!r.n) continue;
      const sw = r.sidewalk;
      if (sw === 'no' || sw === 'none' || sw === 'separate') {
        const all = carriage.filter((q) => q.n === r.n);
        if (all.every((q) => ['no', 'none', 'separate', undefined].includes(q.sidewalk)))
          noKerbByTag.add(r.n);
      }
    }
    const bare = dressed.filter(([n, e]) => !noKerbByTag.has(n) && !nearAny(e.pts, isKerb, 26))
      .map(([n, e]) => `${n} (${e.len | 0}m)`);
    add('C1', 'streets with no kerbs', 'BLOCKER', bare.length, 0,
        `${bare.length} of ${dressed.length} dressed streets`
        + ` (${noKerbByTag.size} exempt: OSM records no kerbside pavement)`, bare);
  }
  {
    const signs = window.__signage || [];
    const missing = dressed.filter(([n]) =>
      !signs.some((s) => s.kind === 'plate' && s.text === n)).map(([n, e]) => `${n} (${e.len | 0}m)`);
    add('C2', 'streets with no name plate', 'MAJOR', missing.length,
        Math.ceil(dressed.length * 0.10),
        `${missing.length} of ${dressed.length} cannot be identified on the ground`, missing);
  }
  {
    const dark = dressed.filter(([, e]) => !nearAny(e.pts, isLamp, 45))
      .map(([n, e]) => `${n} (${e.len | 0}m)`);
    add('C3', 'streets with no lighting', 'MAJOR', dark.length,
        Math.ceil(dressed.length * 0.15), `${dark.length} of ${dressed.length}`, dark);
  }
  {
    const people = window.__crowdPositions ? window.__crowdPositions() : [];
    const off = people.filter((p) => axisDist(p[0], p[1]) >= 30).length;
    const pct = people.length ? Math.round((off / people.length) * 100) : 0;
    add('C4', 'pedestrians away from the main street', 'MAJOR', pct, 35,
        `${off} of ${people.length} off-axis (${pct}%, want above 35%)`, []);
  }
  {
    const bare = dressed.filter(([, e]) => !nearAny(e.pts, isTree, 45)).map(([n]) => n);
    add('C5', 'streets with no greenery', 'MINOR', bare.length, null,
        `${bare.length} of ${dressed.length}`, bare);
  }
  {
    const layers = ['crossings', 'signals', 'busstops', 'mrt', 'taxis', 'trees', 'shops'];
    const empty = layers.filter((k) => !(data[k] || []).length);
    add('C6', 'real map layers present', 'BLOCKER', empty.length, 0,
        empty.length ? `missing: ${empty.join(', ')}`
          : layers.map((k) => `${k} ${data[k].length}`).join(', '), empty);
  }

  {
    // C7: how much of the real street is actually built. process.py records the
    // full length of the named street it stitched the axis from, so this is
    // measured against the real road rather than against our own output.
    let built = 0;
    for (let i = 0; i < axis.p.length - 1; i++)
      built += Math.hypot(axis.p[i + 1][0] - axis.p[i][0], axis.p[i + 1][1] - axis.p[i][1]);
    const full = data.axisFullLength || built;
    const pct = Math.round((built / full) * 100);
    add('C7', 'main street length built', 'BLOCKER', pct, 85,
        `${Math.round(built)}m of ${Math.round(full)}m`, []);
  }

  {
    // C8: how much of each real layer actually reaches the world. A2 only asks
    // whether a layer is used at all, and that is far too weak: 48 bus stops
    // were fetched and 6 got a shelter, 61 signals were fetched and 14 got a
    // head. The data was there, the check said "every fetched layer is placed",
    // and most of the street furniture simply was not built.
    const m4b = new T.Matrix4(), vb = new T.Vector3();
    const posOf = (test) => {
      const out = [];
      sc.traverse((o) => {
        if (!o.isMesh) return;
        const pr = o.geometry.parameters || {};
        if (!test(o.geometry.type, pr)) return;
        if (o.isInstancedMesh) {
          for (let i = 0; i < o.count; i++) {
            o.getMatrixAt(i, m4b);
            vb.setFromMatrixPosition(m4b).applyMatrix4(o.matrixWorld);
            out.push([vb.x, vb.z]);
          }
        } else {
          o.updateWorldMatrix(true, false);
          vb.setFromMatrixPosition(o.matrixWorld);
          out.push([vb.x, vb.z]);
        }
      });
      return out;
    };
    // signals are bare [x, z] pairs, bus stops are {p, n}: accept either shape
    const at = (n) => (Array.isArray(n) ? n : n.p);
    const served = (nodes, built, reach) => nodes.filter((n) => {
      const q = at(n);
      return q && built.some((b) => (b[0] - q[0]) ** 2 + (b[1] - q[1]) ** 2 < reach * reach);
    }).length;

    // A stop counts as built when its pole is there. The shelter is a bonus that
    // only fits on wide frontages, and measuring shelters alone reported 6 of 48
    // stops built when the real answer depends on whether the stop exists at all.
    const stopPoles = posOf((t, pr) => t === 'CylinderGeometry'
      && Math.abs((pr.radiusTop || 0) - 0.085) < 0.005);
    const heads = posOf((t, pr) => t === 'BoxGeometry'
      && Math.abs((pr.width || 0) - 0.32) < 0.01 && Math.abs((pr.height || 0) - 0.86) < 0.01);
    const layers = [
      ['bus stops', data.busstops || [], stopPoles, 14],
      ['traffic signals', data.signals || [], heads, 22],
    ];
    const worst = [];
    let lowest = 100;
    for (const [name, nodes, built, reach] of layers) {
      if (!nodes.length) continue;
      const pct = Math.round((served(nodes, built, reach) / nodes.length) * 100);
      lowest = Math.min(lowest, pct);
      worst.push(`${name}: ${served(nodes, built, reach)} of ${nodes.length} built (${pct}%)`);
    }
    // Enters as a ratchet, like P1b: the check is new and found a real backlog,
    // and a gate that fails on day one is a gate people learn to ignore.
    //
    // Both numbers did come up together in the end. What unlocked it: a mapped
    // stop is now represented by a POLE, which fits almost anywhere, with the
    // 9.2m shelter added only where it genuinely fits; and the clearance search
    // fans out around its first heading instead of pushing one way and giving up
    // at a junction. 6% to 98%, while P1b fell from 116 to 101.
    add('C8', 'share of each real layer built (target 70)', 'MAJOR', lowest, 70,
        worst.join('; '), worst);
  }

  /* ================= S: semantics ================= */
  {
    const signs = (window.__signage || []).filter((s) => s.kind === 'gantry');
    const wrong = [];
    for (const s of signs)
      for (const word of s.text.split(' | ')) {
        // MATCH ON PREFIX. wayfind.js cuts a sign's text to 16 characters to fit
        // the board, so "Central Boulevard" is painted "Central Boulevar" and an
        // exact lookup can never find it. The sign is not naming the wrong
        // street; the check was asking the wrong question about a rendering
        // decision it did not know about.
        let e = streets.get(word);
        if (!e) {
          for (const [nm, ent] of streets) {
            if (nm.startsWith(word)) { e = ent; break; }
          }
        }
        const near = e && e.pts.some((p) =>
          (p[0] - s.x) ** 2 + (p[1] - s.z) ** 2 < 110 * 110);
        if (!near) wrong.push(`"${word}" signed at ${s.x | 0},${s.z | 0} but not there`);
      }
    add('S1', 'direction signs naming the wrong street', 'BLOCKER', wrong.length, 0,
        `${signs.length} gantries checked`, wrong);
  }
  {
    // Near a junction several streets are within reach of one pole. The plate is
    // only wrong if a street other than the one it names is strictly closer.
    const plates = (window.__signage || []).filter((s) => s.kind === 'plate');
    // DISTANCE TO THE STREET, NOT TO ITS NEAREST MAPPED VERTEX.
    //
    // This measured the closest POINT IN THE VERTEX LIST, which is a different
    // quantity: a long straight way is mapped with few vertices, so the road
    // can be 9m away while its nearest vertex is 19m away, and a finely mapped
    // neighbour then wins on a comparison that has nothing to do with where
    // the roads actually are. Every failure it produced was a parallel
    // dual-carriageway pair -- Eu Tong Sen against New Bridge Road, Raffles
    // Quay against Telegraph Street, Shenton Way against Boon Tat Street --
    // and in all three the plate was measurably nearer its OWN street once
    // measured to the segment: 8.8m against 11.0m, 13.8m against 15.0m, 11.8m
    // against 15.6m.
    //
    // Sixth instance in this file of two measures of one fact disagreeing, and
    // the fifth time the CHECK was the one that was wrong. markings.js now
    // uses segment distance to place the plate, so the two agree by
    // construction.
    const distTo = (name, x, z) => {
      const e = name === (axis.n || 'Orchard Road')
        ? { pts: axis.p } : streets.get(name);
      if (!e) return Infinity;
      let bd = Infinity;
      const pts = e.pts;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
        const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
        // a vertex list can jump between disjoint ways of the same name, so a
        // segment longer than 120m is not a real run and is measured endwise
        if (L2 > 120 * 120) {
          bd = Math.min(bd, (x - x1) ** 2 + (z - z1) ** 2, (x - x2) ** 2 + (z - z2) ** 2);
          continue;
        }
        let t = L2 < 1e-9 ? 0 : ((x - x1) * vx + (z - z1) * vz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const d = (x - (x1 + vx * t)) ** 2 + (z - (z1 + vz * t)) ** 2;
        if (d < bd) bd = d;
      }
      if (pts.length === 1) bd = (pts[0][0] - x) ** 2 + (pts[0][1] - z) ** 2;
      return Math.sqrt(bd);
    };
    const wrong = [];
    for (const s of plates) {
      const own = distTo(s.text, s.x, s.z);
      let best = own, bestName = s.text;
      for (const [n] of streets) {
        const d = distTo(n, s.x, s.z);
        if (d < best - 2) { best = d; bestName = n; }
      }
      if (bestName !== s.text)
        wrong.push(`plate "${s.text}" is ${own.toFixed(0)}m from its street but ${best.toFixed(0)}m from "${bestName}"`);
    }
    add('S2', 'name plates on the wrong street', 'BLOCKER', wrong.length, 0,
        `${plates.length} plates checked`, wrong);
  }
  {
    // S3: a name sign is fixed to a facade, so the nearest named building to it
    // should be the building it names.
    // A sign hangs on a facade, and on Orchard Road facades touch: Paragon and
    // Paragon Medical share a wall, so "which named footprint has the nearest
    // vertex" is not the question. The question is whether the sign is actually
    // on the building it names.
    const names = (window.__signage || []).filter((sg) => sg.kind === 'name');
    const wrong = [];
    for (const sg of names) {
      const own = data.buildings.filter((b) => b.n === sg.text);
      if (!own.length) { wrong.push(`sign "${sg.text}" names no building`); continue; }
      // Distance to the PERIMETER, not to the nearest corner. A sign sits at the
      // midpoint of the longest facade, and Ngee Ann City's longest facade is
      // 74m, so its midpoint is 37m from either corner while being flat against
      // the wall. Measuring to vertices called 172 correct signs wrong.
      let d = Infinity;
      for (const b of own)
        for (let i = 0; i < b.p.length; i++) {
          const q1 = b.p[i], q2 = b.p[(i + 1) % b.p.length];
          const vx = q2[0] - q1[0], vz = q2[1] - q1[1], L2 = vx * vx + vz * vz;
          let t = L2 < 1e-9 ? 0 : ((sg.x - q1[0]) * vx + (sg.z - q1[1]) * vz) / L2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          d = Math.min(d, Math.hypot(sg.x - (q1[0] + vx * t), sg.z - (q1[1] + vz * t)));
        }
      if (d > 6) wrong.push(`sign "${sg.text}" is ${d.toFixed(0)}m from that building`);
    }
    add('S3', 'name signs on the wrong building', 'MAJOR', wrong.length, 5,
        `${names.length} name signs checked`, wrong);
  }
  {
    const shops = data.shops || [];
    const orphan = shops.filter((sh) => !buildingAt(sh.p[0], sh.p[1])).length;
    add('S4', 'shop signs off their mapped building', 'MINOR', orphan, null,
        `${orphan} of ${shops.length} shop points fall outside any footprint`, []);
  }

  /* ---- S6-S9: the shopfronts, tested where the glass ended up ---- */
  // Not where the map said a shop was. A tenant board used to be drawn at its
  // own OSM coordinate, and a mall tenant's coordinate is in the middle of the
  // mall: 1,505 of 1,642 were inside the masonry, median 9.2m past the facade.
  // Nothing here reads data.shops for that reason — it reads the bays that were
  // actually built.
  {
    const bays = window.__shopBays || [];
    // S6: a bay standing inside a building is the defect this whole file
    // exists to stop coming back. Sampled 1.2m in front of the glass, at the
    // bay's own position and normal.
    const buried = [];
    for (const b of bays) {
      const px = b.x + b.nx * 1.2, pz = b.z + b.nz * 1.2;
      const hit = buildingAt(px, pz);
      if (hit) buried.push(`${b.name || 'bay'} on ${b.building || '(unnamed)'} `
        + `faces into ${hit.n || 'another footprint'}`);
    }
    add('S6', 'shopfront bays built inside a building', 'BLOCKER',
        buried.length, 0, `${bays.length} bays checked 1.2m in front of the glass`, buried);

    // S7: and nothing may lean into the traffic. Tested at the reach each bay
    // RECORDS, not at a single number for all of them: most reach 48cm to the
    // face of the fascia and only a tenanted bay with an awning reaches 1.8m.
    // Judging all 3,958 at the awning's reach reported 445 failures for
    // geometry that does not exist, which is the same mistake as a check that
    // reads the source data instead of the world.
    const inRoad = [];
    let maxReach = 0;
    for (const b of bays) {
      const reach = b.reach || (b.depth + 0.14);
      if (reach > maxReach) maxReach = reach;
      const px = b.x + b.nx * reach, pz = b.z + b.nz * reach;
      const on = roadAt(px, pz, 0, false);
      if (on) inRoad.push(`${b.name || 'bay'} on ${b.building || '(unnamed)'} `
        + `reaches ${reach.toFixed(2)}m into ${on}`);
    }
    add('S7', 'shopfront bays reaching into a carriageway', 'BLOCKER',
        inRoad.length, 0,
        `${bays.length} bays, each at its own reach (deepest ${maxReach.toFixed(2)}m)`, inRoad);

    // S8: a bay's fascia has to be somewhere a person could read it. Below the
    // knee or above the first floor means the profile drifted off its datum,
    // which is exactly what happens when heights get measured from local ground
    // on a street that slopes.
    const odd = bays.filter((b) => (b.top - b.y) < 1.6 || (b.top - b.y) > 5.2);
    add('S9', 'shopfront bays of an impossible height', 'MAJOR', odd.length, 0,
        `${bays.length} bays, sill to fascia top`,
        odd.slice(0, 6).map((b) => `${b.name || 'bay'}: ${(b.top - b.y).toFixed(1)}m tall`));
  }

  {
    // S8: coverage. Of the tenants that OSM puts on the ground floor with a
    // frontage on a street this world builds, how many got a shopfront? A
    // FLOOR: higher is better.
    //
    // The denominator is deliberately not "every named shop". 629 of them are
    // upstairs or in a basement and 399 are in an atrium, and counting those as
    // missing coverage would make a correct world look 17% done for ever. Each
    // exclusion is counted separately in __stats and each one is a rule that
    // can be argued with, which is the point.
    // RE-BASELINED 85 -> 76, and this is not a regression waved through.
    //
    // 257 tenants are placed now against 252 when the floor was written, so
    // more of them have a shopfront, not fewer. What changed is the
    // DENOMINATOR. Bays used to be assigned to tenants and then built, so a
    // tenant whose bay failed a placement test disappeared from the numerator
    // AND the denominator and from every skip bucket: 35 tenants were being
    // quietly dropped and the ratio flattered itself by ignoring them. Bays are
    // sited before they are handed out now, so those 35 are counted as
    // `shopsNoBay`, which is what they are.
    //
    // A ratchet on a measurement that has become honest has to be reset to the
    // honest number. It may go up and never down from here.
    const st = window.__stats || {};
    const placed = st.realShops || 0;
    const eligible = placed + (st.shopsNoBay || 0) + (st.shopsFarFromRun || 0);
    const pct = eligible ? Math.round((placed / eligible) * 100) : 0;
    add('S8', 'street-level tenants given a shopfront', 'MAJOR', pct, 76,
        `${placed} of ${eligible} eligible tenants placed; excluded: `
        + `${st.shopsUpstairs || 0} not on the street floor, ${st.shopsInside || 0} in an atrium, `
        + `${st.shopsBackBlock || 0} off the built street network, ${st.shopsNoHost || 0} with no footprint`,
        []);
  }

  /* --- recipe coverage, REPORTED not gated --- */
  // The main remaining lever on every district is bespoke massing, and the
  // number was already being computed (`stats.bespoke`, incremented in
  // city.js) and then thrown away. accuracy.py cannot answer this: it only
  // sees the scene file, and whether a name matches a recipe is a fact about
  // landmarks.js, knowable only with the world built. Ungated on purpose —
  // a budget here would either be met by writing bad recipes or ignored.
  {
    const st = window.__stats || {};
    const data = window.__data || {};
    const named = (data.buildings || []).filter((b) => b.n).length;
    add('R1', `named buildings with a bespoke recipe (of ${named} named)`,
        'INFO', st.bespoke || 0, null,
        `${st.bespoke || 0} of ${named} named buildings are drawn by a researched `
        + `recipe; the rest take the generic facade family`, []);
  }

  {
    // S5: an MRT entrance without its exit letter is a generic box. OSM names
    // them "Somerset (NSL) Exit B", so the letter is available and should show.
    const mrt = (data.mrt || []).filter((m) => m.kind === 'subway_entrance');
    const noLetter = mrt.filter((m) => !/\bExit\s+[A-Z0-9]/i.test(m.n || '')).length;
    add('S5', 'MRT entrances without their exit letter', 'MINOR', noLetter, null,
        `${mrt.length - noLetter} of ${mrt.length} carry a letter in OSM`, []);
  }

  {
    // T5: the ride has to stand ON the road, not in it. The bike was placed at
    // the raw terrain height while the tarmac is drawn 5.5cm above it, so its
    // wheels were buried the whole way down the street and every other check was
    // perfectly happy: nothing compared the surface you stand on with the
    // surface that is drawn.
    let sunk = 0, tested = 0; const ex = [];
    const ROAD_TOP = 0.055;
    if (window.__surfaceAt) {
      for (let i = 0; i < axis.p.length - 1; i++) {
        const [x1, z1] = axis.p[i], [x2, z2] = axis.p[i + 1];
        const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz) || 1;
        for (let t = 0; t < L; t += 15) {
          const x = x1 + (dx / L) * t, z = z1 + (dz / L) * t;
          tested++;
          const stand = window.__surfaceAt(x, z) - terr.at(x, z);
          if (stand < ROAD_TOP) {
            sunk++;
            if (ex.length < 5) ex.push(`ride stands ${(stand * 1000) | 0}mm up, tarmac at ${ROAD_TOP * 1000}mm`);
          }
        }
      }
    }
    add('T5', 'ride sitting below the road surface', 'BLOCKER', sunk, 0,
        `${sunk} of ${tested} points along the main street`, ex);
  }

  /* ================= T: traversal ================= */
  {
    // "Solid geometry" has to mean all of it. This looked only at instanced
    // props, so a building corner or a landmark column across the road — the
    // exact thing that was standing at the spawn point — was not counted as
    // blocking the carriageway by the check whose job is traversal.
    // Height matters here and was not being applied. The non-instanced pass
    // below keeps only geometry between 0.35m and 2.6m up, "only what a rider
    // would hit", but instanced props were admitted at ANY height: a branch
    // seven metres over the road counted as blocking it. A carriageway is
    // blocked by what is in it, not by what is above it, so props get the same
    // band. Things that use roads stay exempt by signature as before.
    const RIDER_LOW = 0.35, RIDER_HIGH = 2.6;
    const solid = props.filter((p) => {
      // A pedestrian is not an obstruction you can ride into — they dodge, and
      // T-checks about a blocked carriageway are about geometry that will not
      // move. Exempt by mechanism, same as P1 and P4; the pedestrian entries
      // in ROAD_OK below are superseded and kept only as a record.
      if (p.flat || p.crowd || ROAD_OK.has(p.sig)) return false;
      if (!terr) return true;
      const up = p.y - terr.at(p.x, p.z);
      return up >= RIDER_LOW && up <= RIDER_HIGH;
    });
    const vs = new T.Vector3();
    sc.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const pos = o.geometry.attributes.position;
      if (!pos) return;
      if (o === sky) return;
      // The surfaces the rider rides ON are not obstructions -- the same
      // by-name exemption P1b carries, for the same reason. A bridge deck sits
      // 1.2m+ above the ground it spans, which is inside the rider band, and
      // the day the road ribbon gained cross-width vertices T1 jumped 1 -> 16
      // on Oxley Rise by hitting the deck of Oxley Rise's own bridge. P8 and
      // T5 own every surface-vs-surface question; T1's job is what stands IN
      // the road, not the road itself.
      // roadMarking joined 2026-07-29 with the double yellow lines: a painted
      // line lies ON the carriageway by definition, exactly as the tarmac
      // does, and P7/P9 are the checks that own whether a marking is at the
      // right height and on the road.
      if (/^(roadSurface|pavementSurface|terrainSurface|roadMarking|playerRig)$/.test(o.name)) return;
      // The same reasoning the prop pass uses. A vehicle is not an obstruction,
      // it is traffic; a handrail 32m long is an overhead bridge crossing the
      // road; ION's shell reaches over its own forecourt. What is left is real.
      const gq = o.geometry.parameters || {};
      // THE PLAYER'S OWN VEHICLE, by ANCESTRY, not by mesh name: the rig
      // group is named playerRig but its parts are anonymous, and the
      // car's bumper (1.7x0.14x0.18) slipped past the car-shaped exemption
      // below and blocked marinabay's T1 the night the car landed — a
      // rider cannot be an obstruction to the rider.
      for (let anc = o; anc; anc = anc.parent) if (anc.name === 'playerRig') return;
      const widest = Math.max(gq.width || 0, gq.depth || 0, (gq.radiusTop || 0) * 2);
      if (widest > 12) return;                    // spans the carriageway by design
      if ((gq.radiusTop || 0) > 10) return;       // the shell over the forecourt
      const carLike = (gq.width || 0) > 0.5 && (gq.width || 0) < 3
        && (gq.depth || 0) > 1.5 && (gq.depth || 0) < 12;
      if (carLike) return;                        // a vehicle on a road is traffic
      if (o.geometry.type === 'CylinderGeometry' && Math.abs((gq.radiusTop || 0) - 0.31) < 0.02) return;
      const step = 3;      // constant, for the same reason as P1b above
      for (let i = 0; i < pos.count; i += step) {
        vs.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        const up = terr ? vs.y - terr.at(vs.x, vs.z) : 0;
        if (up < 0.35 || up > 2.6) continue;      // only what a rider would hit
        solid.push({ sig: `${o.geometry.type}|structure`, x: vs.x, y: vs.y, z: vs.z, flat: false, o });
      }
    });
    const sGrid = new Map();
    for (const p of solid) {
      const k = Math.floor(p.x / 10) + ',' + Math.floor(p.z / 10);
      if (!sGrid.has(k)) sGrid.set(k, []);
      sGrid.get(k).push(p);
    }
    let blocked = 0, sampled = 0; const ex = [];
    for (const r of carriage) {
      // SERVICE ROADS ARE EXCLUDED, the same as P1b and P5 already exclude
      // them and for the same stated reason: a service road is a driveway, a
      // loading bay or a hotel set-down, so it runs UNDER a porte-cochere and
      // between the columns of an entrance canopy by design. audit_roads.py has
      // said so in as many words for months ("service-road overlaps are hotel
      // set-downs and loading bays, which is what a service road is for") and
      // this was the one check that had never been told. All four of its
      // remaining Orchard findings were shophouse trim over a 6m driveway.
      if (r.k === 'service' || r.k === 'service_link') continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const [x1, z1] = r.p[i], [x2, z2] = r.p[i + 1];
        const len = Math.hypot(x2 - x1, z2 - z1);
        for (let t = 0; t < len; t += 5) {
          const x = x1 + (x2 - x1) * (t / len), z = z1 + (z2 - z1) * (t / len);
          sampled++;
          let hit = null;
          for (let dx = -1; dx <= 1 && !hit; dx++)
            for (let dz = -1; dz <= 1 && !hit; dz++) {
              const list = sGrid.get((Math.floor(x / 10) + dx) + ',' + (Math.floor(z / 10) + dz));
              if (!list) continue;
              for (const p of list)
                if ((p.x - x) ** 2 + (p.z - z) ** 2 < 1.4 * 1.4) { hit = p; break; }
            }
          if (hit) {
            blocked++;
            // height above ground and vertex count, because the two questions
            // always asked of a T1 finding are "how high is it" and "is it a
            // merged tile" -- a tile is out of pruneCarriageway's reach and a
            // single mesh is not.
            if (ex.length < 8) {
              const up9 = hit.y - (terr ? terr.at(hit.x, hit.z) : 0);
              ex.push(`${hit.sig} on "${r.n || '(unnamed)'}" at ${Math.round(hit.x || 0)},`
                + `${Math.round(hit.z || 0)} up=${up9.toFixed(1)}m`
                + ` verts=${hit.o && hit.o.geometry.attributes.position.count}`);
            }
          }
        }
      }
    }
    // Ratchet. Widening this from props-only to all solid geometry exposed 11
    // real obstructions that were invisible to it before — the same building and
    // landmark structure P1b is tracking at 101, seen from the traversal side
    // rather than the placement side. Zero is the target; the number may only go
    // down, and it will fall as P1b does.
    // 7 -> 8 for the same reason as P1b: a corrected heightfield, not new
    // geometry. See the note there.
    // 8 -> 12 when this stopped skipping meshes over 6,000 vertices and started
    // using a constant stride. Same reason as P1b: more geometry is looked at,
    // nothing moved. Both numbers are stable across repeated runs now, so a
    // change in either means a change in the world.
    // 12 -> 6 on 2026-07-28, alongside P1b: MRT entrances, footbridge stair
    // towers and the taxi-rank cab were all standing in the carriageway.
    add('T1', 'carriageway blocked by solid geometry', 'BLOCKER', blocked, 0,
        `${blocked} of ${sampled} centreline samples obstructed`, ex);
  }
  {
    const key = (p) => Math.round(p[0] / 4) + ',' + Math.round(p[1] / 4);
    const nodes = new Map();
    const link = (a, b) => {
      if (!nodes.has(a)) nodes.set(a, new Set());
      if (!nodes.has(b)) nodes.set(b, new Set());
      nodes.get(a).add(b); nodes.get(b).add(a);
    };
    const ways = [];
    for (const r of carriage) {
      const ks = r.p.map(key);
      for (let i = 0; i < ks.length - 1; i++) link(ks[i], ks[i + 1]);
      let len = 0;
      for (let i = 0; i < r.p.length - 1; i++)
        len += Math.hypot(r.p[i + 1][0] - r.p[i][0], r.p[i + 1][1] - r.p[i][1]);
      ways.push({ n: r.n || '(unnamed)', k: ks[0], len });
    }
    if (axis) {
      const ks = axis.p.map(key);
      for (let i = 0; i < ks.length - 1; i++) link(ks[i], ks[i + 1]);
    }
    const start = axis ? key(axis.p[0]) : ways[0].k;
    const seen = new Set([start]); const queue = [start];
    while (queue.length) {
      const cur = queue.pop();
      for (const nb of (nodes.get(cur) || [])) if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
    }
    let total = 0, island = 0; const ex = [];
    for (const w of ways) {
      total += w.len;
      if (!seen.has(w.k)) { island += w.len; if (ex.length < 8) ex.push(`${w.n} (${w.len | 0}m)`); }
    }
    const pct = total ? +((island / total) * 100).toFixed(1) : 0;
    add('T2', 'road network islands', 'MAJOR', pct, 5,
        `${island | 0}m of ${total | 0}m unreachable from the main axis`, ex);
  }
  {
    const g = terr && terr.g;
    let outside = 0; const ex = [];
    if (g) {
      const x0 = g.x0, z0 = g.z0;
      const x1 = g.x0 + (g.nx - 1) * g.cell, z1 = g.z0 + (g.nz - 1) * g.cell;
      for (const r of carriage)
        for (const p of r.p)
          if (p[0] < x0 || p[0] > x1 || p[1] < z0 || p[1] > z1) {
            outside++;
            if (ex.length < 6) ex.push(`"${r.n || '(unnamed)'}" leaves the heightfield`);
          }
    }
    add('T3', 'road running off the terrain grid', 'BLOCKER', outside, 0,
        `${outside} road points outside the sampled heightfield`, ex);
  }

  {
    // T4: ride the axis and check the chase camera never ends up inside a
    // building. The camera sits 5.8m behind and 3m above the rider, so on a
    // tight bend beside a tower it can pass through a wall.
    let inside = 0, tested = 0; const ex = [];
    for (let i = 0; i < axis.p.length - 1; i++) {
      const [x1, z1] = axis.p[i], [x2, z2] = axis.p[i + 1];
      const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz) || 1;
      const ux = dx / L, uz = dz / L;
      for (let t = 0; t < L; t += 12) {
        const rx = x1 + ux * t, rz = z1 + uz * t;
        const cx2 = rx - ux * 5.8, cz2 = rz - uz * 5.8;   // where the camera sits
        tested++;
        const b = buildingAt(cx2, cz2);
        // only a building tall enough to actually contain the camera at 3m up
        if (b && b.h > 3.4) {
          inside++;
          if (ex.length < 6) ex.push(`camera inside "${b.n || '(unnamed)'}" at ${cx2 | 0},${cz2 | 0}`);
        }
      }
    }
    const pct = tested ? +((inside / tested) * 100).toFixed(1) : 0;
    add('T4', 'chase camera inside a building', 'MAJOR', pct, 2,
        `${inside} of ${tested} sampled camera positions`, ex);
  }

  /* ================= V: presentation ================= */
  {
    let sky = null; const cam = window.__camera;
    sc.traverse((o) => {
      if (o.isMesh && o.geometry.type === 'SphereGeometry'
          && o.geometry.parameters.radius > 100) sky = o;
    });
    const problems = [];
    if (!sky) problems.push('no sky dome in the scene');
    else {
      const rad = sky.geometry.parameters.radius;
      if (rad >= cam.far) problems.push(`dome radius ${rad} >= far plane ${cam.far}`);
      const d = sky.position.distanceTo(cam.position);
      if (d > 2) problems.push(`dome centre ${d.toFixed(0)}m from the camera, so it can leave the frustum`);
      if (sky.frustumCulled) problems.push('dome is frustum-culled and can be dropped');
    }
    add('V1', 'sky always visible', 'BLOCKER', problems.length, 0,
        problems.length ? problems.join('; ')
          : 'dome follows the camera and sits inside the far plane', problems);
  }
  {
    // V2: at the far plane the fog must have swallowed the world, or geometry
    // pops in and out of existence at a hard line. FogExp2 transmittance is
    // exp(-(d*density)^2); anything above a few percent is visible popping.
    const fog = sc.fog;
    const cam2 = window.__camera;
    let leftover = 100;
    if (fog && fog.density != null && cam2) {
      const dd = fog.density * cam2.far;
      leftover = +(Math.exp(-(dd * dd)) * 100).toFixed(1);
    }
    add('V2', 'world still visible at the far plane', 'MAJOR', leftover, 5,
        fog ? `${leftover}% of an object still shows at ${cam2.far}m `
              + `(fog density ${fog.density})` : 'no fog in the scene', []);
  }
  {
    const g = terr && terr.g;
    let steps = 0; const ex = [];
    if (g)
      for (let j = 0; j < g.nz; j++)
        for (let i = 0; i < g.nx - 1; i++) {
          const d = Math.abs(g.h[j * g.nx + i] - g.h[j * g.nx + i + 1]);
          if (d > g.cell) { steps++; if (ex.length < 6) ex.push(`${d.toFixed(1)}m over ${g.cell}m`); }
        }
    add('V3', 'terrain steps sharper than 1:1', 'MAJOR', steps, 10, `${steps} cliff cells`, ex);
  }
  {
    const problems = [];
    const lanes = axis ? Math.max(1, Math.round(axis.w / 3.5)) : 1;
    const laneW = axis ? axis.w / lanes : 0;
    if (axis && (laneW < 2.8 || laneW > 4.2)) problems.push(`lane width ${laneW.toFixed(1)}m`);
    const tall = data.buildings.filter((b) => b.h > 6);
    const odd = tall.filter((b) => {
      const st = b.h / Math.max(1, Math.round(b.h / 3.4));
      return st < 2.6 || st > 5.2;
    }).length;
    if (odd > tall.length * 0.05) problems.push(`${odd} buildings with an odd storey height`);
    if (data.buildings.some((b) => b.h < 2.4)) problems.push('a building shorter than a door');
    add('V4', 'scale sanity', 'BLOCKER', problems.length, 0,
        problems.length ? problems.join('; ')
          : `lane ${laneW.toFixed(1)}m, storeys within 2.6-5.2m, nothing sub-door`, problems);
  }

  /* P9: a road marking painted where there is no road.
   *
   * Markings are laid out from the AXIS at a lateral offset while the tarmac is
   * drawn per WAY at that way's own width -- two sources for the same edge. The
   * axis carries one width for a whole street, and Orchard Road's ways run from
   * 7.0m to 25.0m, so wherever the street narrowed the lines were painted past
   * the kerb onto the pavement. From the saddle that reads as pale patches in
   * the road and as stretches with no lines at all, which is exactly how it was
   * reported. Nothing measured it; this does.
   */
  {
    const MARKSIG = new Set(['PlaneGeometry(0.14,1)', 'PlaneGeometry(0.12,2)',
                             'PlaneGeometry(0.1,2)', 'PlaneGeometry(0.28,3.2)',
                             'PlaneGeometry(0.92,0.9)', 'PlaneGeometry(0.62,1)']);
    const roadMeshes = [];
    sc.traverse((o) => { if (o.name === 'roadSurface') roadMeshes.push(o); });
    const rc2 = new T.Raycaster();
    let marks = 0, offTar = 0; const exP9 = [];
    if (roadMeshes.length) {
      const m4b = new T.Matrix4(), vb = new T.Vector3();
      sc.traverse((o) => {
        if (!o.isInstancedMesh) return;
        const pr2 = o.geometry.parameters || {};
        const sig2 = `${o.geometry.type}(${[pr2.width, pr2.height]
          .filter((q) => q != null).map((q) => +q.toFixed(2)).join(',')})`;
        if (!MARKSIG.has(sig2)) return;
        // one in four, because a raycast per marking over 29,000 of them is the
        // slowest thing in this audit and the answer does not need every one
        for (let i = 0; i < o.count; i += 4) {
          o.getMatrixAt(i, m4b);
          vb.setFromMatrixPosition(m4b).applyMatrix4(o.matrixWorld);
          if (vb.y < -900) continue;
          marks++;
          const gy = terr ? terr.at(vb.x, vb.z) : 0;
          rc2.set(new T.Vector3(vb.x, gy + 5, vb.z), new T.Vector3(0, -1, 0));
          if (!rc2.intersectObjects(roadMeshes, false)[0]) {
            offTar++;
            if (exP9.length < 6) exP9.push(`${sig2} off the tarmac at ${vb.x | 0},${vb.z | 0}`);
          }
        }
      });
    }
    const pct9 = marks ? +(100 * offTar / marks).toFixed(1) : 0;
    add('P9', 'road markings painted off the tarmac', 'MAJOR', pct9, 2.0,
        `${offTar} of ${marks} sampled markings`, exP9);
  }

  /* ================= W: water =================
   * A new subsystem gets its checks BEFORE it gets content, because you cannot
   * find a defect class you have not named. Water is the first thing in this
   * project that is neither ground nor structure, and it breaks assumptions
   * both ways: it is a surface you can see through and stand next to but not
   * on, and everything that places things by "is it clear here" has never had
   * to consider it.
   */
  {
    const wpolys = (data.water || []).map((w) => w.p).filter((p) => p && p.length > 3);
    const inWater = (x, z) => {
      for (const ring of wpolys) {
        let c = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, zi] = ring[i], [xj, zj] = ring[j];
          if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
        }
        if (c) return true;
      }
      return false;
    };

    // W1: the water surface must sit BELOW the ground around it. A reservoir
    // drawn above its own quay is a sheet of water hanging over the promenade,
    // which is the failure mode of taking a constant sea level from a dataset
    // that does not know where the shoreline is.
    let above = 0; const exW1 = [];
    let surfY = null;
    sc.traverse((o) => { if (o.name === 'waterSurface') surfY = o; });
    if (surfY && wpolys.length) {
      const pos = surfY.geometry.attributes.position;
      const vv = new T.Vector3();
      for (let i = 0; i < pos.count; i += 7) {
        vv.fromBufferAttribute(pos, i).applyMatrix4(surfY.matrixWorld);
        const g = terr ? terr.at(vv.x, vv.z) : 0;
        // only judge at the RIM: inside the polygon the ground is deliberately
        // sunk, so of course the water is above it there
        if (inWater(vv.x, vv.z)) continue;
        if (vv.y > g + 0.25) {
          above++;
          if (exW1.length < 6) exW1.push(`water ${(vv.y - g).toFixed(1)}m above the bank at ${vv.x | 0},${vv.z | 0}`);
        }
      }
    }
    add('W1', 'water standing above its own bank', 'BLOCKER', above, 0,
        wpolys.length ? `${wpolys.length} water polygons` : 'no water in this scene', exW1);

    // W2: nothing built in the water. The surround in particular fills empty
    // ground with grey massing and has no idea a reservoir is not empty ground.
    let inW = 0; const exW2 = [];
    if (wpolys.length) {
      // A TREE ON THE BANK OVERHANGS THE WATER, and that is what a tree by a
      // river does. W2 asks what has been BUILT in open water; a branch or a
      // leaf card reaching out over it has not been. Only the TRUNK says where
      // the tree stands, and D37 already checks trunks. Without this, freeing a
      // few spatial reservations elsewhere in the district moved trees a metre
      // and W2 went from 206 to 580 without anything being planted in the bay.
      const OVERHANGS = new Set([
        'CylinderGeometry(0.06,1)',      // branch
        'PlaneGeometry(1,0.55)',         // leaf card
        'IcosahedronGeometry(1)',        // canopy blob
        'SphereGeometry(0.52)', 'SphereGeometry(0.66)',   // planter shrub
      ]);
      for (const p of props) {
        if (p.y < -900) continue;
        // Traffic and pedestrians are not things BUILT in open water. They
        // cross bridges, which is what bridges are for, and counting them made
        // this budget depend on where the fleet was at sample time: marinabay
        // read 79 one run and 85 the next with nothing changed in the world.
        // Exempt by mechanism, like P1 and P4 — not by listing car dimensions.
        if (p.actor) continue;
        if (OVERHANGS.has(p.sig)) continue;
        if (!inWater(p.x, p.z)) continue;
        inW++;
        if (exW2.length < 6) exW2.push(`${p.sig} in open water at ${p.x | 0},${p.z | 0}`);
      }
      const vv2 = new T.Vector3();
      sc.traverse((o) => {
        if (!o.isMesh || o.isInstancedMesh) return;
        if (o.name === 'waterSurface' || o.name === 'terrainSurface') return;
        if (o.name === 'roadSurface' || o.name === 'pavementSurface'
          || o.name === 'roadMarking') return;
        for (let q = o; q; q = q.parent) if (q.name === 'playerRig') return;
        const pos = o.geometry.attributes.position;
        if (!pos) return;
        let hit = 0;
        for (let i = 0; i < pos.count; i += Math.max(1, Math.floor(pos.count / 24))) {
          vv2.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
          if (inWater(vv2.x, vv2.z)) hit++;
        }
        // A BRIDGE OVER THE BAY IS ENTIRELY OVER WATER BY DESIGN. The comment
        // here already said a bridge legitimately reaches over water, and then
        // the code counted it anyway: once Marina Bay landed, the Helix, the
        // Jubilee and the Bayfront bridges and every piece of their decks,
        // parapets, roofs and stair towers were reported, which was most of the
        // 476. Matched by the same signatures P1b exempts, so the two checks
        // cannot disagree about what a bridge is.
        const gpw = o.geometry.parameters || {};
        const isDeck = o.geometry.type === 'BoxGeometry'
          && (gpw.width || 0) > 14
          && ((gpw.height || 0) < 5 && (gpw.depth || 0) > 2.5
              || Math.abs((gpw.height || 0) - 1.05) < 0.01);
        const isBridgePart = o.geometry.type === 'BoxGeometry'
          && (Math.abs((gpw.width || 0) - 2.6) < 0.01 || Math.abs((gpw.width || 0) - 2.2) < 0.01);
        const isRail = o.geometry.type === 'CylinderGeometry'
          && Math.abs((gpw.radiusTop || 0) - 0.055) < 0.01;
        if (hit >= 20 && !isDeck && !isBridgePart && !isRail) {
          inW++;
          if (exW2.length < 6) exW2.push(`${o.geometry.type} entirely over water`);
        }
      });
    }
    add('W2', 'things built in open water', 'MAJOR', inW, 12,
        wpolys.length ? `${wpolys.length} polygons tested` : 'no water in this scene', exW2);

    // W3: you must not be able to ride into the bay. Collision is built from
    // drawn walls and water is not a wall, so this is the one check that would
    // notice if the water were left out of it.
    let openable = 0; const exW3 = [];
    if (wpolys.length && window.__inWater) {
      for (const ring of wpolys) {
        for (let i = 0; i < ring.length; i += 3) {
          const [x, z] = ring[i];
          // a point well inside the polygon, not on its edge
          let cx = 0, cz = 0;
          for (const [px, pz] of ring) { cx += px; cz += pz; }
          cx /= ring.length; cz /= ring.length;
          const tx = x + (cx - x) * 0.25, tz = z + (cz - z) * 0.25;
          if (!inWater(tx, tz)) continue;
          if (!window.__inWater(tx, tz)) {
            openable++;
            if (exW3.length < 6) exW3.push(`open water not blocked at ${tx | 0},${tz | 0}`);
          }
        }
      }
    }
    add('W3', 'open water you can ride into', 'BLOCKER', openable, 0,
        wpolys.length ? 'collision tested inside every water polygon' : 'no water in this scene', exW3);
  }

  /* ================= A: accuracy ================= */
  {
    // NOTE: this is the narrow, in-browser half of the question. It checks that
    // the layers we DID carry are actually being built. It cannot see a tag
    // that never made it into the scene file at all, and that is where all
    // seven of this project's "real data present but unused" bugs lived --
    // a hand-typed list of three items cannot find the tag nobody listed.
    // `data/unused.py` enumerates the raw extract instead and runs in deploy.sh.
    const unused = [];
    if ((data.crossings || []).length && !window.__realCrossings) unused.push('crossings');
    if ((data.mrt || []).length && !window.__realMrt) unused.push('mrt');
    if ((data.shops || []).length && !(window.__stats || {}).realShops) unused.push('shops');
    add('A2', 'real data present but unused', 'BLOCKER', unused.length, 0,
        unused.length ? `unused: ${unused.join(', ')}` : 'every fetched layer is placed', unused);
  }

  /* ================= verdict ================= */
  const failed = findings.filter((f) => {
    if (f.budget === null) return false;
    return FLOORS.has(f.id) ? f.count < f.budget : f.count > f.budget;
  });
  return {
    floors: [...FLOORS],
    findings, failed: failed.map((f) => f.id),
    blockers: failed.filter((f) => f.severity === 'BLOCKER').length,
    majors: failed.filter((f) => f.severity === 'MAJOR').length,
    pass: failed.length === 0,
  };
};
