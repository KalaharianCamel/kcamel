import { clamp } from './model.js';

export const SCROLL_MULTIPLIER = .5;
export const TOUCH_SCROLL_MULTIPLIER = SCROLL_MULTIPLIER * 1.75;
export const SCROLL_RESPONSE = .30;
export function wheelDistance(delta, mode = 0, viewport = 800) {
  return delta * (mode === 1 ? 16 : mode === 2 ? viewport : 1) * SCROLL_MULTIPLIER;
}
export function advanceScroll(current, target, seconds) {
  const next = target + (current - target) * Math.exp(-Math.max(0, seconds) / SCROLL_RESPONSE);
  return Math.abs(next - target) < .1 ? target : next;
}
export function accumulateScroll(current, target, distance, limit) {
  const reversing = distance && target !== current && Math.sign(distance) !== Math.sign(target - current);
  return clamp((reversing ? current : target) + distance, 0, limit);
}

// Animate the real document scroll position. The cell, copy, percentage, and
// ruler all read that same position; no transformed duplicate scroll layer.
export function createSmoothScroll({ reducedMotion, resolveAnchor = element => element.getBoundingClientRect().top + window.scrollY }) {
  let target = window.scrollY, lastWritten = window.scrollY, position = window.scrollY;
  let frame = 0, previousTime = 0, paused = false, touch = null;
  const root = document.documentElement;
  const limit = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const nativeControl = node => node instanceof Element && node.closest('dialog,input,textarea,select,button,[contenteditable="true"]');
  root.classList.add('smooth-scrolling');

  function cancel() {
    cancelAnimationFrame(frame); frame = 0; previousTime = 0;
    target = lastWritten = position = window.scrollY;
  }
  function render(time) {
    frame = 0;
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
    previousTime = time;
    target = clamp(target, 0, limit());
    // Keep fractional progress independently of browser pixel rounding so the
    // last few pixels cannot stall and leave an animation frame running forever.
    const next = reducedMotion.matches ? target : advanceScroll(position, target, dt);
    position = next;
    window.scrollTo({ top: next, behavior: 'instant' });
    lastWritten = window.scrollY;
    if (Math.abs(position - target) > .6) frame = requestAnimationFrame(render);
    else { window.scrollTo({ top: target, behavior: 'instant' }); lastWritten = window.scrollY; previousTime = 0; }
  }
  function schedule() {
    if (reducedMotion.matches) {
      window.scrollTo({ top: target, behavior: 'instant' }); lastWritten = position = window.scrollY;
    } else if (!frame) { position = window.scrollY; frame = requestAnimationFrame(render); }
  }
  function move(distance) {
    target = accumulateScroll(window.scrollY, target, distance, limit());
    schedule();
  }
  function jump(position) { target = clamp(position, 0, limit()); schedule(); }
  function onWheel(event) {
    if (paused || event.defaultPrevented || event.ctrlKey || event.metaKey || nativeControl(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || !event.cancelable) return;
    event.preventDefault();
    move(wheelDistance(event.deltaY, event.deltaMode, window.innerHeight));
  }
  function onKey(event) {
    if (paused || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || nativeControl(event.target)) return;
    const distance = { ArrowDown: 40, ArrowUp: -40, PageDown: window.innerHeight * .9, PageUp: -window.innerHeight * .9, ' ': window.innerHeight * .9 * (event.shiftKey ? -1 : 1) }[event.key];
    if (distance !== undefined) { event.preventDefault(); move(distance * SCROLL_MULTIPLIER); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); jump(event.key === 'Home' ? 0 : limit()); }
  }
  function onClick(event) {
    if (paused || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!link || link.target || link.hasAttribute('download')) return;
    let id;
    try { id = decodeURIComponent(link.hash.slice(1)); } catch { return; }
    const destination = document.getElementById(id);
    if (!destination) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    if (link.classList.contains('skip-link')) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
    jump(resolveAnchor(destination));
  }
  function onHistory() {
    let destination;
    try { destination = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    cancel();
    if (destination) jump(resolveAnchor(destination));
  }
  function onNativeScroll() {
    if (!frame || Math.abs(window.scrollY - lastWritten) > 2) cancel();
  }
  function onTouchStart(event) {
    cancel();
    touch = !paused && event.touches.length === 1 && !nativeControl(event.target) ? { x: event.touches[0].clientX, y: event.touches[0].clientY, startX: event.touches[0].clientX, startY: event.touches[0].clientY, direction: null } : null;
  }
  function onTouchMove(event) {
    if (!touch || event.touches.length !== 1 || !event.cancelable) { touch = null; return; }
    const point = event.touches[0], totalX = point.clientX - touch.startX, totalY = point.clientY - touch.startY;
    if (!touch.direction && Math.max(Math.abs(totalX), Math.abs(totalY)) > 4) touch.direction = Math.abs(totalY) >= Math.abs(totalX) ? 'vertical' : 'horizontal';
    if (touch.direction === 'horizontal') return;
    event.preventDefault();
    move((touch.y - point.clientY) * TOUCH_SCROLL_MULTIPLIER);
    touch.x = point.clientX; touch.y = point.clientY;
  }
  const onTouchEnd = () => { touch = null; };
  const onPointerDown = () => cancel();
  const onVisibility = () => { if (document.hidden) cancel(); };
  const onPreference = () => cancel();
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
  window.addEventListener('popstate', onHistory);
  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', onPreference);
  return {
    cancel,
    setPaused(value) { paused = value; cancel(); },
    destroy() {
      cancel(); root.classList.remove('smooth-scrolling');
      window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onHistory); window.removeEventListener('scroll', onNativeScroll); window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); window.removeEventListener('touchcancel', onTouchEnd);
      document.removeEventListener('visibilitychange', onVisibility); reducedMotion.removeEventListener('change', onPreference);
    },
  };
}
