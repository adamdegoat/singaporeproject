// Touch-first controls. The phone is the reference platform, so touch is the
// primary path and the keyboard is the fallback, not the other way round.
const P = new URLSearchParams(location.search);
export const TOUCH = P.has('touch') || matchMedia('(pointer: coarse)').matches
  || navigator.maxTouchPoints > 0;

export const input = { steer: 0, throttle: 0, brake: 0, restart: false };

const keys = new Set();
addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'KeyR') input.restart = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));

// steering wheel-style: one finger anywhere on the left half sets a relative axis
const touches = new Map();   // id -> {startX, x, side, y}

function side(x) { return x < innerWidth * 0.5 ? 'steer' : 'power'; }

export function attachTouch(el) {
  const start = (e) => {
    window.__touchFired = (window.__touchFired || 0) + 1;
    for (const t of e.changedTouches) {
      touches.set(t.identifier, {
        startX: t.clientX, x: t.clientX, y: t.clientY, side: side(t.clientX),
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
  const end = (e) => {
    for (const t of e.changedTouches) touches.delete(t.identifier);
  };
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchmove', move, { passive: false });
  el.addEventListener('touchend', end, { passive: true });
  el.addEventListener('touchcancel', end, { passive: true });
}

export function readInput() {
  let steer = 0, throttle = 0, brake = 0;

  for (const rec of touches.values()) {
    if (rec.side === 'steer') {
      // relative drag: where the thumb landed becomes centre
      const dx = rec.x - rec.startX;
      steer = Math.max(-1, Math.min(1, dx / (innerWidth * 0.14)));
    } else {
      // upper part of the right half is throttle, lower part is brake
      if (rec.y < innerHeight * 0.58) throttle = 1; else brake = 1;
    }
  }

  if (keys.has('KeyA') || keys.has('ArrowLeft')) steer = -1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) steer = 1;
  if (keys.has('KeyW') || keys.has('ArrowUp')) throttle = 1;
  if (keys.has('KeyS') || keys.has('ArrowDown') || keys.has('Space')) brake = 1;

  input.steer = steer; input.throttle = throttle; input.brake = brake;
  return input;
}

export function touchDebug() {
  return [...touches.values()].map((t) => `${t.side}@${(t.x) | 0},${(t.y) | 0}`).join(' ');
}
