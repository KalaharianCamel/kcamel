import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wheelDistance, advanceScroll, accumulateScroll } from '../src/scroll.js';
import { getCategoryProgress } from '../src/model.js';
import { getScrollTrack, getChapterRanges, getChapterVisibility } from '../src/choreography.js';

test('wheel and trackpad input travel exactly half the requested distance', () => {
  assert.equal(wheelDistance(120), 60);
  assert.equal(wheelDistance(-80), -40);
  assert.equal(wheelDistance(3, 1), 24);
  assert.equal(wheelDistance(1, 2, 800), 400);
  let target = 0;
  for (let i = 0; i < 10; i++) target = accumulateScroll(0, target, wheelDistance(100), 10000);
  assert.equal(target, 500);
});
test('cushioned scrolling settles within 1.5 seconds without overshoot at 60Hz and 120Hz', () => {
  const run = fps => { let value = 0; for (let i = 0; i < fps * 1.5; i++) value = advanceScroll(value, 1000, 1 / fps); return value; };
  assert.ok(Math.abs(run(60) - run(120)) < 1e-8);
  assert.ok(run(60) > 990 && run(60) <= 1000);
  assert.ok(advanceScroll(120, 40, .016) >= 40);
  assert.ok(advanceScroll(120, 40, .016) < 120);
});
test('reversing input cancels queued forward momentum and endpoints stay bounded', () => {
  assert.equal(accumulateScroll(100, 400, -30, 1000), 70);
  assert.equal(accumulateScroll(100, 400, 30, 1000), 430);
  assert.equal(accumulateScroll(10, 10, -40, 1000), 0);
  assert.equal(accumulateScroll(990, 990, 80, 1000), 1000);
});
test('segmented ruler follows visible chapter entrances and reaches the final tick at page bottom', () => {
  const sections = [
    {id:'intro',kind:'intro',top:0,height:1000},
    {id:'inside',kind:'entry',top:1000,height:1000},
    {id:'projects',kind:'project',top:2000,height:1500},
    {id:'project-2',kind:'project',top:3500,height:1500},
    {id:'project-3',kind:'project',top:5000,height:1500},
    {id:'experience',kind:'experience',top:6500,height:1000},
    {id:'academics',kind:'academics',top:7500,height:1000},
    {id:'contact',kind:'contact',top:8500,height:1000},
  ];
  const viewport = 800, maximum = 8700;
  const ranges = getChapterRanges(sections, viewport, maximum);
  assert.equal(ranges.length, 5);
  assert.equal(ranges[0].start, 0);
  assert.equal(ranges.at(-1).end, maximum);
  assert.ok(ranges[1].end - ranges[1].start > maximum * .5);
  for (let i = 1; i < ranges.length; i++) assert.equal(ranges[i - 1].end, ranges[i].start);
  for (const range of ranges.slice(1)) {
    const track = getScrollTrack(sections, range.start, viewport);
    assert.equal(getChapterVisibility(track, range.id), 0);
    assert.ok(getChapterVisibility(track + .01, range.id) > 0);
    assert.equal(getCategoryProgress(ranges, range.start).id, range.id);
  }
  assert.equal(getCategoryProgress(ranges, 8500 - viewport * .18 - 100).id, 'contact', 'Contact starts while the cell closes, before its section anchor');
  assert.deepEqual(getCategoryProgress(ranges, 0), { id: 'intro', local: 0 });
  assert.deepEqual(getCategoryProgress(ranges, ranges[1].start), { id: 'projects', local: 0 });
  const projectMidpoint = (ranges[1].start + ranges[1].end) / 2;
  assert.ok(Math.abs(getCategoryProgress(ranges, projectMidpoint).local - .5) < 1e-10);
  assert.equal(getCategoryProgress(ranges, projectMidpoint).id, 'projects');
  assert.deepEqual(getCategoryProgress(ranges, maximum), { id: 'contact', local: 1 });
});
