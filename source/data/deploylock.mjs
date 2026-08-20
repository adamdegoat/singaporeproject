// REFUSE TO RENDER WHILE A DEPLOY IS RUNNING.
//
// A deploy owns a browser, a snapshot server on 8934 and about five minutes of
// this laptop's whole GPU. Anything heavy started beside it takes frames off
// its gates, and the gates then fail on the machine rather than on the code —
// which is how "never run render work during a deploy gate" became a law in
// the handover. It was a law enforced by memory, and it was broken three times
// in two days, twice by me. This is the same law enforced by a file.
//
// deploy.sh writes its PID to $TMPDIR/sgdeploy.lock and clears it on EXIT. A
// stale lock (the process is gone) is not a lock — say so and carry on, or a
// killed deploy would wedge every probe until someone noticed the file.
//
// The deploy's OWN gates must still run: it exports SG_DEPLOY, and that goes
// straight through.
import { readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export function refuseUnderDeploy(what = 'this probe') {
  if (process.env.SG_DEPLOY) return false;          // the deploy's own child
  if (process.env.SG_NOLOCK) return false;          // deliberate override
  const lock = join(process.env.TMPDIR || tmpdir(), 'sgdeploy.lock');
  let pid = null;
  try { pid = parseInt(readFileSync(lock, 'utf8').trim(), 10); } catch (e) { return false; }
  if (!pid || Number.isNaN(pid)) return false;
  try { process.kill(pid, 0); } catch (e) {
    try { unlinkSync(lock); } catch (e2) { /* someone else got there first */ }
    return false;
  }
  console.error(`  A DEPLOY IS RUNNING (pid ${pid}). ${what} would take frames off its`);
  console.error('  gates and fail them on the machine rather than on the code.');
  console.error('  Wait for it, or set SG_NOLOCK=1 if you know why you are overriding.');
  process.exit(3);
}
