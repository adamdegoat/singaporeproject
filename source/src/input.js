// Touch-first controls, mode aware.
//
// RIDE: left half is power (upper throttle, lower brake), right half steers by
// relative drag. WALK: left half is a virtual stick, right half looks around.
// The phone is the reference platform, so touch is the primary path and the
// keyboard is the fallback.
const P = new URLSearchParams(location.search);
export const TOUCH = P.has('touch') || matchMedia('(pointer: coarse)').matches
  || navigator.maxTouchPoints > 0;

export const input = {
  steer: 0, throttle: 0, brake: 0,
  moveX: 0, moveY: 0, run: false,
  toggleMode: false,
  // for drawing the on-screen stick
  stickActive: false, stickDX: 0, stickDY: 0,
};

// RUNNING ON A PHONE HAD NO CONTROL AT ALL. `run` was Shift-only, so on the
// device the game is actually played on the walker could never do more than
// 1.85 m/s — and the avatar's run clip never played. Pushing the stick past
// this fraction of its radius is the run, which is the standard twin-stick
// pattern and costs no second button: a nudge walks, a full push runs.
const RUN_AT = 0.72;

// THE JUMP IS EDGE-TRIGGERED, NOT LEVEL-READ. Holding the button must not
// re-fire the moment the feet touch down — that turns a held thumb into a
// pogo stick. The press sets this flag, one readInput consumes it.
let jumpQueued = false;

// The walk stick is PINNED to a fixed spot so you can see where it is, rather
// than appearing wherever your thumb happens to land.
export const STICK = { x: 92, yFromBottom: 92, radius: 54 };
function stickCentre() {
  return { cx: STICK.x, cy: innerHeight - STICK.yFromBottom };
}

let mouseLookDX = 0, mouseLookDY = 0;
// how far the TOUCH stick is pushed, 0..1. Kept separate from moveX/moveY
// because the keyboard writes those as a full-deflection +/-1 and a diagonal
// WASD walk would otherwise score 1.41 and run without Shift.
let stickMag = 0;

const keys = new Set();
addEventListener('keydown', (e) => {
  // A HELD KEY REPEATS. Space is the desktop jump, so the queue has to be
  // fed on the first press only, or an auto-repeat at ~30Hz queues thirty
  // jumps a second and the walker never leaves the ground state cleanly.
  if (e.code === 'Space' && !keys.has('Space')) jumpQueued = true;
  keys.add(e.code);
  if (e.code === 'KeyE' || e.code === 'KeyF') input.toggleMode = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));

const touches = new Map();   // id -> {startX, startY, x, y, px, py, side}
function side(x) { return x < innerWidth * 0.5 ? 'power' : 'steer'; }

export function attachTouch(el) {
  const start = (e) => {
    window.__touchFired = (window.__touchFired || 0) + 1;
    for (const t of e.changedTouches) {
      touches.set(t.identifier, {
        startX: t.clientX, startY: t.clientY,
        x: t.clientX, y: t.clientY, px: t.clientX, py: t.clientY,
        side: side(t.clientX),
      });
    }
    e.preventDefault();
  };
  const move = (e) => {
    for (const t of e.changedTouches) {
      const rec = touches.get(t.identifier);
      if (rec) { rec.x = t.clientX; rec.y = t.clientY; }
    }
    e.preventDefault();
  };
  const end = (e) => { for (const t of e.changedTouches) touches.delete(t.identifier); };
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchmove', move, { passive: false });
  el.addEventListener('touchend', end, { passive: true });
  el.addEventListener('touchcancel', end, { passive: true });
}

// THE JUMP BUTTON, and why it is a real DOM element rather than a screen
// zone like the throttle and the brake.
//
// The right half of the screen is the look-drag. A zone-based jump inside it
// would fire on every camera pan, and a "tap versus drag" test would put a
// timing puzzle in front of the one control that has to feel instant. A
// button element takes its own touchstart and the canvas below never sees
// it, so looking around and jumping cannot collide.
export function attachJumpButton(el) {
  if (!el) return;
  const fire = (e) => {
    jumpQueued = true;
    el.classList.add('hot');
    e.preventDefault();
    e.stopPropagation();
  };
  const cool = () => el.classList.remove('hot');
  el.addEventListener('touchstart', fire, { passive: false });
  el.addEventListener('touchend', cool, { passive: true });
  el.addEventListener('touchcancel', cool, { passive: true });
  // desktop click, so the button is testable without a touch device
  el.addEventListener('mousedown', fire);
  addEventListener('mouseup', cool);
}

// desktop: drag with the mouse to look around, in either mode
export function attachMouse(el) {
  let down = false, mx = 0, my = 0;
  el.addEventListener('mousedown', (e) => { down = true; mx = e.clientX; my = e.clientY; });
  addEventListener('mouseup', () => { down = false; });
  addEventListener('mousemove', (e) => {
    if (!down) return;
    mouseLookDX += e.clientX - mx;
    mouseLookDY += e.clientY - my;
    mx = e.clientX; my = e.clientY;
  });
}

export function readInput(mode) {
  let steer = 0, throttle = 0, brake = 0;
  input.stickActive = false;
  let moveX = 0, moveY = 0;
  stickMag = 0;
  let lookDX = mouseLookDX, lookDY = mouseLookDY;
  mouseLookDX = 0; mouseLookDY = 0;

  for (const rec of touches.values()) {
    if (rec.side === 'power') {
      if (mode === 'walk') {
        const { cx, cy } = stickCentre();
        let dx = rec.x - cx, dy = rec.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const clamped = Math.min(d, STICK.radius);
        dx = (dx / d) * clamped; dy = (dy / d) * clamped;
        moveX = dx / STICK.radius;
        moveY = dy / STICK.radius;
        input.stickActive = true; input.stickDX = dx; input.stickDY = dy;
        stickMag = clamped / STICK.radius;
      } else if (rec.y < innerHeight * 0.62) throttle = 1;
      else brake = 1;
    } else if (mode === 'walk') {
      lookDX += rec.x - rec.px;
      lookDY += rec.y - rec.py;
    } else {
      steer = Math.max(-1, Math.min(1, (rec.x - rec.startX) / (innerWidth * 0.14)));
    }
    rec.px = rec.x; rec.py = rec.y;
  }

  if (!input.stickActive) { input.stickDX = 0; input.stickDY = 0; }

  if (mode === 'walk') {
    if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX = -1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) moveX = 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) moveY = -1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) moveY = 1;
  } else {
    if (keys.has('KeyA') || keys.has('ArrowLeft')) steer = -1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) steer = 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) throttle = 1;
    if (keys.has('KeyS') || keys.has('ArrowDown') || keys.has('Space')) brake = 1;
  }

  input.steer = steer; input.throttle = throttle; input.brake = brake;
  input.moveX = moveX; input.moveY = moveY;
  // full stick = run, on touch; Shift still runs on the keyboard
  input.run = keys.has('ShiftLeft') || keys.has('ShiftRight') || stickMag > RUN_AT;
  const jump = jumpQueued;
  jumpQueued = false;
  return { steer, throttle, brake, moveX, moveY, lookDX, lookDY, run: input.run, jump };
}

export function touchDebug() {
  return [...touches.values()].map((t) => `${t.side}@${t.x | 0},${t.y | 0}`).join(' ');
}
