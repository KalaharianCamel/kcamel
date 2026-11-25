import test from 'node:test';
import assert from 'node:assert/strict';
import { fixedStepper, damping, taglineCycler } from '../src/motion.js';

test('60 Hz and 144 Hz displays run the same amount of simulation time', () => {
  const run = rate => {
    let steps = 0, position = 0;
    const stepper = fixedStepper(dt => { steps++; position += 2 * dt; });
    for (let frame = 0; frame < rate * 5; frame++) stepper.advance(1 / rate);
    return { steps, position };
  };
  assert.deepEqual(run(60), run(144));
  assert.equal(run(60).steps, 600);
});
test('returning after a long pause never performs an unbounded catch-up', () => {
  let steps = 0;
  const stepper = fixedStepper(() => steps++);
  const alpha = stepper.advance(120);
  assert.equal(steps, 8);
  assert.ok(alpha >= 0 && alpha <= 1);
  stepper.reset();
  assert.equal(stepper.advance(0), 0);
});
test('pointer damping has the same response after one second at different frame rates', () => {
  const run = rate => {
    let position = 0;
    for (let i = 0; i < rate; i++) position += (1 - position) * damping(13, 1 / rate);
    return position;
  };
  assert.ok(Math.abs(run(60) - run(144)) < 1e-10);
  assert.equal(damping(13, 0), 0);
});

test('reduced motion keeps changing messages without spatial movement or repeated-click races', () => {
  const animations = [];
  class Element {
    textContent = '';
    attributes = {};
    replaceChildren() {}
    append() {}
    remove() {}
    setAttribute(name, value) { this.attributes[name] = value; }
    animate(frames, options) {
      animations.push({ frames, options });
      return { finished: Promise.resolve(), cancel() {} };
    }
  }
  const oldDocument = globalThis.document;
  const oldMatchMedia = globalThis.matchMedia;
  try {
    globalThis.document = { createElement: () => new Element() };
    globalThis.matchMedia = () => ({ matches: true });
    const heading = new Element();
    heading.textContent = 'biology / pre-med.';
    const next = taglineCycler(heading, ['biology / pre-med.', 'aspiring doctor.']);
    next();
    next();
    assert.equal(heading.attributes['aria-label'], 'aspiring doctor.');
    assert.equal(animations.length, 2);
    assert.ok(animations.every(animation => animation.options.duration <= 140));
    assert.ok(animations.every(animation => animation.frames.every(frame => frame.transform === 'translateY(0px)' || frame.transform === 'translateY(0)')));
  } finally {
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
    if (oldMatchMedia === undefined) delete globalThis.matchMedia; else globalThis.matchMedia = oldMatchMedia;
  }
});
