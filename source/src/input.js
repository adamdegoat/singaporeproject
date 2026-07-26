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
};

let mouseLookDX = 0, mouseLookDY = 0;

const keys = new Set();
addEventListener('keydown', (e) => {
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
  let moveX = 0, moveY = 0;
  let lookDX = mouseLookDX, lookDY = mouseLookDY;
  mouseLookDX = 0; mouseLookDY = 0;

  for (const rec of touches.values()) {
    if (rec.side === 'power') {
      if (mode === 'walk') {
        // virtual stick: offset from wherever the thumb landed
        const R = innerWidth * 0.09;
        moveX = Math.max(-1, Math.min(1, (rec.x - rec.startX) / R));
        moveY = Math.max(-1, Math.min(1, (rec.y - rec.startY) / R));
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
  input.run = keys.has('ShiftLeft') || keys.has('ShiftRight');
  return { steer, throttle, brake, moveX, moveY, lookDX, lookDY, run: input.run };
}

export function touchDebug() {
  return [...touches.values()].map((t) => `${t.side}@${t.x | 0},${t.y | 0}`).join(' ');
}
