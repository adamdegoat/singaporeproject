#!/usr/bin/env node
// IS EVERY GATE ACTUALLY WIRED TO SOMETHING?
//
//     node data/wiring.mjs
//
// `data/gates.sh` and `deploy.sh` keep SEPARATE lists of what to run. gates.sh
// already knows this is dangerous -- its own header says the district list is
// "read from the registry rather than typed here", because "a district added in
// one place and missed in the other is how four of them went ungated once
// already". That principle was applied to the districts and not to the CHECKS,
// and on 2026-08-29 the bill came in:
//
//   * `stancecheck`, `strokecheck` and `footcheck2` -- every check written
//     about the rider, each one recorded in the handover as wired in -- were
//     in gates.sh and in NEITHER runner that ships anything, because deploy.sh
//     does not call gates.sh. They only ever ran when somebody typed them.
//   * `stuckcheck` -- "can you actually ride it", written the day the owner
//     asked for "fully explorable... no bugs that jeopardize the user
//     experience" -- was in neither, and was failing.
//
// A check nobody runs is worse than no check: it is a line in a handover
// saying the ground is guarded. This makes that state impossible to reach
// quietly. It reads no world and drives no browser, so it costs nothing and
// runs first.
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

// NOT GATES AT ALL. These are photography and lookup TOOLS whose only
// `process.exit(1)` is a usage guard -- "you gave me no arguments" -- which
// looks identical to a verdict from the outside. Naming them here rather than
// trying to tell a usage exit from an assertion by reading the source: a
// heuristic that guesses is a heuristic that will one day quietly reclassify a
// real gate as a tool, which is the exact failure this file exists to stop.
// IMPORTED, NEVER INVOKED. `deploylock` is a library -- eight checks import it
// to take the deploy lock -- and its own exit(1) is for its CLI mode. A
// runner naming it would be a mistake, not a fix.
const LIBS = new Set(['deploylock.mjs']);

const TOOLS = new Set([
  'lookat.mjs',       // point a free camera at a thing
  'streetshot.mjs',   // the rider's eye at given spots
  'landmark.mjs',     // find a named thing and photograph it
  'ridecam.mjs',      // the rider sheet; its exit(1) is "THREE not reachable"
]);

// DELIBERATELY UNWIRED, each with the reason and the condition for wiring it.
// An entry here is a decision on the record, not a way to silence the check.
//
// `stuckcheck.mjs` WAS HERE AND IS NOT ANY MORE (2026-08-30). Its exemption
// read: "drives full throttle in a straight line and cannot tell 'I drove into
// a building' from 'I cannot get out'... wire it when it can tell the two
// apart". It can now: `__drive` always took a steer argument and every caller
// in this repo passed 0, so it now steers along the way it is testing and a
// stall means the CARRIAGEWAY is blocked. 0 of 60 stretches stall, and
// STUCK_THROTTLE=0 still fails 20 of 20, so it is measuring something. An
// exemption that has been earned out gets deleted, not left as a comment
// somewhere else.
const EXEMPT = {
  'sweep.mjs':
    'the coverage sweep -- it visits every street, measures at each stop and '
    + 'writes a contact sheet. It is a REPORT you read, run deliberately, and '
    + 'gates.sh already says its fps figure measures the harness rather than '
    + 'the world (data/mobilefps.mjs is the honest one and is wired). Wire it '
    + 'if its verdict is ever made to mean something a deploy should refuse.',
  'ridecheck.mjs':
    'rides EVERY ride at WALL CLOCK, which is the point of it -- the '
    + 'cable car alone is 145 seconds. MEASURED 2026-08-29: 826s, and green, '
    + 'every ride. That is fourteen minutes on a twenty-five-minute suite, so '
    + 'it stays a deliberate run until either the rides change or somebody '
    + 'decides the suite can afford it. The number is here so that decision '
    + 'never has to be guessed at again.',
};

const files = readdirSync(HERE).filter((f) => f.endsWith('.mjs'));
// COMMENTS STRIPPED, AND THE BARE NAME MATCHED, and both halves are needed.
//
// Matching the literal `surfcheck.mjs` cannot see a runner that loops --
// `for _c in surfcheck standcheck ...; do node "data/$_c.mjs"` is how both
// files invoke a batch, and the filename never appears in the source. That is
// a FALSE "unwired", which is only annoying; but the same blindness hid
// deploy.sh's rider loop and reported three wired checks as deploy-less, which
// is a false reading in the direction that matters.
//
// Matching the bare name against the raw file would instead go wrong the other
// way: these two scripts are mostly prose, and every one of them names checks
// in its comments. A check mentioned in a comment and run by nobody would read
// as wired. So the comments come out first, and what is left is instructions.
const strip = (t) => t.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
const gates = strip(readFileSync(join(HERE, 'gates.sh'), 'utf8'));
const deploy = strip(readFileSync(join(ROOT, 'deploy.sh'), 'utf8'));

const rows = [];
for (const f of files) {
  const src = readFileSync(join(HERE, f), 'utf8');
  // GATE-SHAPED means it can REFUSE. A tool that only prints (lookat, ridecam,
  // streetshot, sheet) has nothing to wire and is not asked about.
  //
  // ANY non-zero exit, NOT the literal `process.exit(1)`. The first cut of
  // this file matched that literal and therefore could not see `stancecheck`
  // or `joltcheck`, which end with `process.exit(say.length ? 1 : 0)` -- the
  // two checks whose being unwired is the reason this file exists. A detector
  // that misses the case it was written for is this project's oldest failure
  // and it took fifteen minutes to reproduce it here.
  //
  // ...AND `2` IS NOT A VERDICT. This repo already draws the line and nothing
  // had named it: a check that FAILS exits 1, and a harness that could not RUN
  // -- "BOOT FAILED", "boot failed" -- exits 2. `groundtruth`, `probe`,
  // `patchprobe`, `whitepixel` and `whiteplane` have no exit but that one, and
  // probe.mjs says so in its own header: "For measuring a change, not for
  // gating one." Exit 2 alone is a diagnostic, and diagnostics are not wired.
  const verdicts = [...src.matchAll(/process\.exit\(([^)]*)\)/g)]
    .map((m) => m[1].trim())
    .filter((a) => a !== '0' && a !== '2');
  if (!verdicts.length) continue;
  if (TOOLS.has(f) || LIBS.has(f)) continue;
  const bare = f.replace(/\.mjs$/, '');
  const named = new RegExp(`(?:^|[^\\w.-])${bare}(?![\\w-])`);
  const inGates = gates.includes(f) || named.test(gates);
  const inDeploy = deploy.includes(f) || named.test(deploy);
  rows.push({ f, inGates, inDeploy, exempt: EXEMPT[f] || null });
}
rows.sort((a, b) => a.f.localeCompare(b.f));

const say = [];
for (const r of rows) {
  const where = [r.inGates && 'gates', r.inDeploy && 'deploy'].filter(Boolean).join('+') || '-';
  const mark = r.exempt ? 'exempt' : (r.inGates || r.inDeploy) ? 'ok' : 'UNWIRED';
  console.log(`  ${mark.padEnd(8)} ${r.f.padEnd(22)} ${where}`);
  if (!r.inGates && !r.inDeploy && !r.exempt) {
    say.push(`${r.f} can refuse a build and is referenced by neither data/gates.sh nor deploy.sh`);
  }
  // ...and an exemption for something that IS wired is a stale note.
  if (r.exempt && (r.inGates || r.inDeploy)) {
    say.push(`${r.f} is wired into ${where} but still carries an exemption in data/wiring.mjs -- delete the exemption`);
  }
}
for (const s of say) console.log('    - ' + s);
console.log(say.length
  ? `\n  FAIL  ${say.length} gate(s) wired to nothing`
  : `\n  PASS  ${rows.length} gate-shaped checks, every one wired or exempted on the record`);
process.exit(say.length ? 1 : 0);
