import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCellPose, getScrollTrack, getScrollPosition, CHAPTER_STUDIES, getMembranePose, getMicroscopeState, getFramingPose, cushion, getCameraDistance, getChapterVisibility, getContactProgress, getFunFactState } from '../src/choreography.js';

test('cell stays closed at page top and the camera enters only after scrolling', () => {
  for (const t of [0, .1, .3]) { const pose = getCellPose(t); assert.equal(pose.open, 0); assert.equal(pose.spread, 0); assert.equal(pose.camera, 10.4); }
  assert.ok(getCellPose(1.64).camera < 1.73);
  assert.equal(getCellPose(1.64).open, 1);
});

test('solid half shells open, hold a readable cross-section, then clear camera entry', () => {
  assert.deepEqual(getMembranePose(0), { separation: 0, opacity: 1, section: 0 });
  for (const track of [.96, 1.1, 1.29]) {
    assert.equal(getMembranePose(track).separation, 1);
    assert.equal(getMembranePose(track).opacity, 1);
    assert.equal(getMembranePose(track).section, 1);
    assert.ok(getCellPose(track).camera > 9);
  }
  assert.equal(getMembranePose(1.64).opacity, 0);
  for (const track of [2.96, 4.18, 5.98, 7.25]) assert.equal(getMembranePose(track).opacity, 1);
});

test('cell docks before the electron palette fade and restores optical view on exit', () => {
  assert.equal(getMicroscopeState(2.8).presence, 0);
  assert.equal(getMicroscopeState(3.26).docking, 1);
  assert.equal(getCellPose(3.2).open, 0);
  assert.equal(getMicroscopeState(3.26).electron, false);
  assert.equal(getMicroscopeState(3.35).electron, true);
  assert.equal(getMicroscopeState(3.36).electron, true);
  assert.equal(getMicroscopeState(3.9).electron, true);
  assert.equal(getCellPose(3.74).focus, 2);
  assert.ok(getMicroscopeState(3.26).specimenScale < .06);
  assert.equal(getMicroscopeState(3.2).magnification, 0);
  assert.equal(getMicroscopeState(3.70).magnification, 1);
  assert.deepEqual(getMicroscopeState(4.14), { presence: 0, docking: 0, specimenScale: 1, magnification: 0, cameraY: 0, imaging: 0, electron: false });
  for (const track of [4.3, 5.2, 6.2, 7.2]) assert.deepEqual(getMicroscopeState(track), { presence: 0, docking: 0, specimenScale: 1, magnification: 0, cameraY: 0, imaging: 0, electron: false });
  for (let i = 0; i <= 800; i++) {
    const track = i / 100;
    for (const state of [getMembranePose(track), getMicroscopeState(track)]) for (const [key, value] of Object.entries(state)) if (typeof value === 'number') assert.ok(key === 'cameraY' ? value >= -1.24 && value <= 0 : value >= 0 && value <= 1.6);
  }
});

test('screen framing stays continuous across every chapter boundary in both directions', () => {
  for (const mobile of [false, true]) {
    for (const boundary of [1, 2, 3, 4, 5, 6, 7]) {
      const before = getFramingPose(boundary - .00001, mobile), after = getFramingPose(boundary + .00001, mobile);
      for (const key of ['x', 'y', 'scale']) assert.ok(Math.abs(after[key] - before[key]) < .001, `${key} jumps at chapter ${boundary}`);
    }
    const forward = Array.from({length:801}, (_, i) => getFramingPose(i / 100, mobile));
    for (let i = 800; i >= 0; i--) assert.deepEqual(getFramingPose(i / 100, mobile), forward[i]);
  }
  assert.ok(getFramingPose(2.3).x < 0);
  assert.ok(getFramingPose(3.2).x > 0);
  assert.ok(getFramingPose(4.8).x < 0);
  assert.equal(getFramingPose(7.2).x, 0);
});
test('three inspections repeatedly reconstruct and reopen with alternating compositions', () => {
  for (const t of [2.96, 4.18, 5.98, 7, 7.25]) { assert.equal(getCellPose(t).open, 0); assert.equal(getCellPose(t).spread, 0); }
  assert.ok(getCellPose(2.3).x < 0);
  assert.ok(getCellPose(3.74).x > 0);
  assert.ok(getCellPose(4.8).x < 0);
  assert.equal(getCellPose(2.3).split, 1);
});
test('reconstruction holds an exactly closed cell for a visible scroll interval', () => {
  for (const start of [2.92, 4.12, 5.92]) for (let i = 0; i <= 8; i++) {
    const pose = getCellPose(start + i / 100);
    assert.equal(pose.open, 0);
    assert.equal(pose.spread, 0);
    assert.equal(pose.split, 0);
    assert.ok(pose.camera >= 8.7);
  }
});
test('choreography is continuous, finite, and reversible independent of frame rate', () => {
  const forward = Array.from({length:801}, (_, i) => getCellPose(i / 100));
  for (let i = 800; i >= 0; i--) assert.deepEqual(getCellPose(i / 100), forward[i]);
  for (let i = 1; i < forward.length; i++) for (const key of Object.keys(forward[i])) {
    assert.ok(Number.isFinite(forward[i][key]));
    const difference = key === 'camera'
      ? Math.abs(1 / forward[i][key] - 1 / forward[i - 1][key])
      : Math.abs(forward[i][key] - forward[i - 1][key]);
    assert.ok(difference < (key === 'camera' ? .07 : 1), `${key} jumps at ${i / 100}`);
  }
});
test('scroll anchors synchronize after reflow and when jumping backward', () => {
  const sections = [{top:0,height:1000},{top:1000,height:1400},{top:2400,height:1400}];
  assert.equal(getScrollTrack(sections, 0, 800), 0);
  assert.ok(getScrollTrack(sections, 1200, 800) > 1);
  assert.ok(getScrollTrack(sections, 200, 800) < 1);
});

const paddedTransitions = [[.32,.95],[2.48,2.92],[3.36,3.70],[3.78,4.12],[4.20,4.60],[5.54,5.92],[6.02,6.56],[6.64,7]];

test('reading appears with the matching study and stays through its authored hold', () => {
  for (const [id, track, focus] of [['projects',2.24,1],['project-2',3.7,2],['project-3',4.60,3],['experience',5.28,4],['academics',6.56,6]]) {
    assert.equal(getChapterVisibility(track, id), 1, `${id} is missing at its study hold`);
    assert.equal(getCellPose(track).focus, focus);
    assert.equal(getCellPose(track).open, 1);
  }
  assert.equal(getChapterVisibility(0, 'intro'), 1);
  assert.equal(getChapterVisibility(.95, 'intro'), 0);
  assert.equal(getChapterVisibility(7, 'contact'), 1);
  assert.equal(getCellPose(7).open, 0);
  for (const track of [2.92, 5.98]) for (const id of ['projects','project-2','project-3','experience','academics']) assert.equal(getChapterVisibility(track,id),0);
  for (let i = 260; i <= 420; i++) {
    const track = i / 100;
    assert.equal(getChapterVisibility(track,'project-2'), getMicroscopeState(track).imaging);
  }
});

test('chapter links resolve to fully visible reading and its matching study after layout changes', () => {
  for (const viewport of [568,844,900]) {
    const sections = [0,1,1.75,3.65,6.45,8.35,9.95,11.75].map((top,i,all) => ({top:top*viewport,height:((all[i+1]??13)-top)*viewport}));
    for (const [id,track] of Object.entries(CHAPTER_STUDIES)) {
      const scroll = getScrollPosition(sections,track,viewport);
      assert.ok(Math.abs(getScrollTrack(sections,scroll,viewport)-track)<1e-10);
      assert.equal(getChapterVisibility(track,id),1,`${id} lands on faded reading`);
    }
  }
});

test('Contact rises during cell reconstruction and has arrived when the shell closes', () => {
  assert.equal(getContactProgress(6.64), 0);
  for (const track of [6.7,6.82,6.95]) {
    assert.ok(getContactProgress(track)>0 && getContactProgress(track)<1);
    assert.ok(getCellPose(track).open>0 && getCellPose(track).open<1);
    assert.ok(getChapterVisibility(track,'contact')>0);
  }
  assert.equal(getContactProgress(7),1);
  assert.equal(getCellPose(7).shell,0);
  assert.equal(getContactProgress(7.3),1);
});
test('fun facts occupy the animation gaps and yield to the reading in either scroll direction', () => {
  for (const track of [1.1, 2.98, 4.17, 5.98]) assert.ok(getFunFactState(track).opacity > .8, `empty passage at ${track}`);
  for (const track of Object.values(CHAPTER_STUDIES)) assert.equal(getFunFactState(track).opacity, 0, `callouts compete with study at ${track}`);
  const forward = Array.from({ length: 801 }, (_, i) => getFunFactState(i / 100));
  for (let i = 800; i >= 0; i--) assert.deepEqual(getFunFactState(i / 100), forward[i]);
  for (let i = 1; i < forward.length; i++) assert.ok(Math.abs(forward[i].opacity - forward[i - 1].opacity) < .2, `callouts jump at ${i / 100}`);
});
test('every reveal and reconstruction has a bounded opening speed and cushioned holds', () => {
  const h = .00001;
  for (const [start, end] of paddedTransitions) {
    assert.ok(end - start >= .34 - 1e-9, 'no short full-open jump');
    for (let i = 0; i < 100; i++) {
      const t = start + (end - start) * i / 100;
      const speed = Math.abs(getCellPose(t + h).open - getCellPose(t).open) / h;
      assert.ok(speed < 5.6, `opening surge at ${t}: ${speed}`);
    }
    for (const t of [start, end]) {
      const f = x => getCellPose(x).open;
      const speed = Math.abs(f(t + h) - f(t - h)) / (2 * h);
      const acceleration = Math.abs(f(t + h) - 2 * f(t) + f(t - h)) / (h * h);
      assert.ok(speed < .001, `velocity kicks at ${t}`);
      assert.ok(acceleration < .1, `acceleration kicks at ${t}`);
    }
  }
  assert.equal(cushion(-1), 0); assert.equal(cushion(2), 1);
});
test('camera magnification does not accelerate toward the end of a reveal', () => {
  for (const [start, end] of [[1.30,1.64],[3.36,3.70],[4.20,4.60],[6.02,6.56]]) {
    const zoom = p => 1 / getCellPose(start + (end - start) * p).camera;
    const first = Math.abs(zoom(.1) - zoom(0)), last = Math.abs(zoom(1) - zoom(.9));
    assert.ok(Math.abs(first - last) < .000001, `late perspective surge at ${start}`);
    const values = Array.from({length:101}, (_, i) => zoom(i / 100));
    for (let i = 1; i < values.length; i++) assert.ok(values[i] >= values[i - 1] - 1e-10);
  }
});

test('phone zoom approaches its framing limit without a velocity snap', () => {
  const threshold = 5.4 / 1.12, h = .0001;
  const f = d => getCameraDistance(d, true);
  const left = (f(threshold) - f(threshold - h)) / h;
  const right = (f(threshold + h) - f(threshold)) / h;
  assert.ok(left > .3 && left < .8);
  assert.ok(Math.abs(left - right) < .001);
  assert.ok(f(1.12) >= 5.4);
  assert.equal(getCameraDistance(3.4), 3.4);
  assert.ok(Math.abs(getCameraDistance(.82, true, 1) - .82 * .7) < 1e-12);
});
