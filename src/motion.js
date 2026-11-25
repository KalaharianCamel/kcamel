export const motionPreference = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const easeOut = 'cubic-bezier(.16, 1, .3, 1)';
export const damping = (rate, seconds) => 1 - Math.exp(-rate * seconds);

// Bound catch-up work after interruptions; interpolate the two last physics states.
export function fixedStepper(step, interval = 1 / 120, maxSteps = 8) {
  let remainder = 0;
  return {
    advance(seconds) {
      remainder += Math.min(Math.max(seconds, 0), interval * maxSteps);
      let steps = 0;
      while (remainder + 1e-10 >= interval && steps < maxSteps) {
        step(interval);
        remainder -= interval;
        steps++;
      }
      return Math.max(0, Math.min(1, remainder / interval));
    },
    reset() { remainder = 0; },
  };
}

export function taglineCycler(element, messages) {
  let index = Math.max(0, messages.indexOf(element.textContent.trim()));
  let lastChange = -Infinity;
  let running = [];
  const line = document.createElement('span');
  line.className = 'tagline-line';
  line.textContent = messages[index] || element.textContent;
  element.replaceChildren(line);
  let current = line;
  return () => {
    if (messages.length < 2 || performance.now() - lastChange < 1600) return;
    lastChange = performance.now();
    running.forEach(animation => animation.cancel());
    element.replaceChildren(current);
    index = (index + 1) % messages.length;
    const next = document.createElement('span');
    next.className = 'tagline-line';
    next.textContent = messages[index];
    element.setAttribute('aria-label', messages[index]);
    const outgoing = current;
    outgoing.setAttribute('aria-hidden', 'true');
    element.append(next);
    current = next;
    const reduce = motionPreference();
    running = [
      outgoing.animate([{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }, { opacity: 0, transform: `translateY(${reduce ? 0 : -8}px)`, filter: `blur(${reduce ? 0 : 2}px)` }], { duration: reduce ? 100 : 220, easing: easeOut, fill: 'forwards' }),
      next.animate([{ opacity: 0, transform: `translateY(${reduce ? 0 : 8}px)`, filter: `blur(${reduce ? 0 : 2}px)` }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: reduce ? 140 : 460, easing: easeOut }),
    ];
    Promise.allSettled(running.map(animation => animation.finished)).then(() => outgoing.remove());
  };
}
