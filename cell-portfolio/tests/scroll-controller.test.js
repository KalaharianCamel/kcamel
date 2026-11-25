import test from 'node:test';
import assert from 'node:assert/strict';
import { createSmoothScroll } from '../src/scroll.js';

test('real scroll easing reaches both endpoints when the browser rounds pixel positions', () => {
  const previous = new Map(['window', 'document', 'Element', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, globalThis[key]]));
  class Surface extends EventTarget { closest() { return null; } }
  const root = new Surface();
  root.scrollHeight = 10800;
  root.classList = { add() {}, remove() {} };
  const doc = new EventTarget();
  doc.documentElement = root;
  const win = new EventTarget();
  Object.assign(win, { scrollY: 0, innerHeight: 800 });
  let written = false, nextId = 0, time = 0;
  const frames = new Map();
  win.scrollTo = ({ top }) => { win.scrollY = Math.round(top * 1.5) / 1.5; written = true; };
  Object.assign(globalThis, {
    window: win, document: doc, Element: Surface,
    requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const preference = new EventTarget();
  preference.matches = false;
  const controller = createSmoothScroll({ reducedMotion: preference });
  const wheel = deltaY => {
    const event = new Event('wheel', { cancelable: true });
    Object.assign(event, { deltaY, deltaX: 0, deltaMode: 0 });
    win.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  };
  const tick = () => {
    const [id, callback] = frames.entries().next().value;
    frames.delete(id);
    callback(time += 1000 / 60);
    if (written) { written = false; win.dispatchEvent(new Event('scroll')); }
  };
  const finish = () => {
    for (let i = 0; frames.size && i < 200; i++) tick();
    assert.equal(frames.size, 0, 'easing must finish rather than stall below a physical pixel');
  };
  try {
    wheel(600);
    tick();
    assert.ok(win.scrollY > 0 && win.scrollY < 300, 'scroll is eased across frames');
    finish();
    assert.equal(win.scrollY, 300, 'input travels half distance');
    wheel(-600);
    finish();
    assert.equal(win.scrollY, 0, 'reverse scroll reaches the exact top');
    const touch = (type, x, y) => {
      const event = new Event(type, { cancelable: true });
      Object.assign(event, { touches: type === 'touchend' ? [] : [{ clientX: x, clientY: y }] });
      win.dispatchEvent(event);
    };
    touch('touchstart', 100, 600);
    touch('touchmove', 100, 200);
    touch('touchend', 100, 200);
    finish();
    assert.equal(win.scrollY, 350, 'a 400px swipe travels 350px: 75% farther than the previous 200px');
    wheel(-700);
    finish();
    assert.equal(win.scrollY, 0, 'desktop wheel retains its original half-distance response');
    touch('touchstart', 100, 600);
    touch('touchmove', 200, 590);
    touch('touchend', 200, 590);
    assert.equal(frames.size, 0, 'horizontal gestures remain native');
    wheel(40000);
    finish();
    assert.equal(win.scrollY, 10000, 'scroll reaches and clamps to the exact bottom');
  } finally {
    controller.destroy();
    for (const [key, value] of previous) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
