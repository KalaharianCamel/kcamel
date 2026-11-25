import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getJourney, safeUrl, escapeHtml, externalLink, smooth } from '../src/model.js';
import { portfolio } from '../src/content.js';

test('chapter selection follows native scroll in either direction and clamps local progress', () => {
  const sections = [{ top: 0, height: 1000, kind: 'intro' }, { top: 1000, height: 1400, kind: 'project' }, { top: 2400, height: 1000, kind: 'contact' }];
  assert.equal(getJourney(sections, 0, 800).section.kind, 'intro');
  assert.equal(getJourney(sections, 900, 800).section.kind, 'project');
  assert.equal(getJourney(sections, 2400, 800).section.kind, 'contact');
  assert.equal(getJourney(sections, 100, 800).section.kind, 'intro');
  assert.equal(getJourney(sections, -1000, 800).local, 0);
  assert.equal(getJourney(sections, 99999, 800).local, 1);
});
test('optional links are omitted and unsafe content cannot become executable markup', () => {
  for (const url of ['', null, 'javascript:alert(1)', '//example.com', 'data:text/html,test', '/\\example.com']) assert.equal(safeUrl(url), '');
  assert.equal(safeUrl('https://example.org/work'), 'https://example.org/work');
  assert.equal(safeUrl('./resume.pdf'), './resume.pdf');
  assert.equal(externalLink({ label: 'Missing URL' }), '');
  assert.ok(escapeHtml('<img src=x onerror="alert(1)">').startsWith('&lt;img'));
  assert.ok(externalLink({ label: '<Project>', url: 'https://example.org' }).includes('&lt;Project&gt;'));
});
test('template contains three distinct projects and no fabricated personal URLs or email', () => {
  assert.equal(portfolio.projects.length, 3);
  assert.equal(new Set(portfolio.projects.map(p => p.id)).size, 3);
  assert.equal(portfolio.contact.email, '');
  assert.ok(portfolio.projects.every(p => p.title.startsWith('[') && !p.image && p.links.length === 0));
});
test('opening and closing transitions are bounded and reversible', () => {
  assert.equal(smooth(-1), 0);
  assert.equal(smooth(2), 1);
  assert.equal(smooth(.5), .5);
  assert.ok(smooth(.7) > smooth(.3));
});
