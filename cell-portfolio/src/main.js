import './style.css';
import { portfolio as data } from './content.js';
import { clamp, getJourney, getCategoryProgress, escapeHtml as e, safeUrl, externalLink } from './model.js';
import { getScrollTrack, getScrollPosition, CHAPTER_STUDIES, getChapterRanges, getCellPose, getMembranePose, getMicroscopeState, getChapterVisibility, getContactProgress, getFunFactState } from './choreography.js';
import { createSmoothScroll } from './scroll.js';
import { createFactCallouts } from './callouts.js';

const arrow = '<svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const imageIcon = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 9h38v30H5Z M5 32l11-12 11 11 7-7 9 9"/><circle cx="32" cy="17" r="3"/></svg>';
const imagePlaceholder = () => `<div class="image-placeholder">${imageIcon}<span>[Project image]</span></div>`;
const projects = data.projects || [];
const academics = data.academics || {};
const contact = data.contact || {};
document.title = `${data.name} — Portfolio`;
const scene = (id, type, content, extra = '') => `<section id="${id}" class="scene scene-${type}" data-kind="${type}" ${extra}><div class="scene-inner">${content}</div></section>`;
const projectMarkup = projects.map((p, i) => scene(i === 0 ? 'projects' : `project-${i + 1}`, 'project', `<h2>${e(p.title)}</h2><div class="project-position"><span>${String(i + 1).padStart(2, '0')}</span><i class="position-line"></i> Selected projects / ${String(projects.length).padStart(2, '0')}</div><p class="project-summary">${e(p.summary)}</p><dl class="project-meta">${p.role ? `<div><dt>Role</dt><dd>${e(p.role)}</dd></div>` : ''}${p.methods ? `<div><dt>Methods</dt><dd>${e(p.methods)}</dd></div>` : ''}</dl><button class="detail-button" data-project="${i}" aria-haspopup="dialog" aria-controls="project-dialog" aria-label="Explore project: ${e(p.title)}">Explore project ${arrow}</button>`, `data-project-index="${i}"`)).join('');
const entries = (data.experience || []).map(item => `<article class="experience-entry"><h3>${e(item.organization)}</h3><div class="entry-subtitle">${[item.role, item.dates].filter(Boolean).map(v => `<span>${e(v)}</span>`).join('')}</div>${item.contribution ? `<p>${e(item.contribution)}</p>` : ''}</article>`).join('');
const stats = (academics.statistics || []).filter(s => s.label && s.value);
const email = contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ? contact.email : '';
const resume = safeUrl(contact.resume);
document.querySelector('main').innerHTML =
  scene('intro', 'intro', `<h1>${e(data.name)}</h1><p class="intro-description">${e(data.introduction)}</p><p class="interests">${e(data.interests)}</p><a class="primary-link" href="#projects">Explore projects ${arrow}</a>`) +
  scene('inside', 'entry', '') +
  projectMarkup +
  scene('experience', 'experience', `<h2>Experience<br>& activities.</h2><div class="entry-list">${entries || '<p>[Experience and activities]</p>'}</div>`) +
  scene('academics', 'academics', `<h2>Academics<br>& honors.</h2>${academics.school ? `<h3 class="academic-school">${e(academics.school)}</h3>` : ''}${academics.graduation ? `<p class="academic-year">${e(academics.graduation)}</p>` : ''}${stats.length ? `<dl class="academic-statistics">${stats.map(s => `<div><dt>${e(s.label)}</dt><dd>${e(s.value)}</dd></div>`).join('')}</dl>` : ''}${academics.coursework?.length ? `<div class="academic-group"><h3>Selected coursework</h3><p>${academics.coursework.map(e).join(' · ')}</p></div>` : ''}${academics.honors?.length ? `<div class="academic-group"><h3>Honors</h3>${academics.honors.map(h => `<div class="honor"><p>${e(h.title)}</p>${h.detail ? `<small>${e(h.detail)}</small>` : ''}</div>`).join('')}</div>` : ''}`) +
  scene('contact', 'contact', `<h2>Let’s connect.</h2><p class="contact-invitation">${e(contact.invitation)}</p>${email ? `<a class="contact-address" href="mailto:${e(email)}">${e(email)} ${arrow}</a>` : `<span class="contact-address is-placeholder">${e(contact.emailLabel || '[Email address]')}</span>`}<div class="contact-links">${(contact.links || []).map(externalLink).join('')}${resume ? externalLink({ url: resume, label: 'Résumé' }) : ''}</div>`);

document.querySelectorAll('.scene').forEach(el => {
  const right = ['projects', 'project-3'].includes(el.id);
  el.dataset.layout = el.id === 'inside' ? 'wide' : el.id === 'contact' ? 'center' : right ? 'right' : 'left';
});

const dialog = document.querySelector('#project-dialog');
let trigger = null;
let sceneApi = null;
let sectionData = [];
let categoryRanges = [], rulerBounds = new Map();
let active = null;
let queued = false;
let panelAnimation = null;
let closingPanel = null;
let contactOffset = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = window.matchMedia('(max-width: 700px)');
const factCallouts = createFactCallouts(document.querySelector('.stage'), data.funFacts || []);
if (import.meta.hot) import.meta.hot.dispose(() => factCallouts.dispose());
function resolveAnchor(element) {
  const track = CHAPTER_STUDIES[element.id];
  return track === undefined ? element.getBoundingClientRect().top + window.scrollY : getScrollPosition(sectionData, track, window.innerHeight);
}
const scrollController = createSmoothScroll({ reducedMotion: reduceMotion, resolveAnchor });
if (import.meta.hot) import.meta.hot.dispose(() => scrollController.destroy());

function positionContact(cellBottom) {
  const section = sectionData.find(section => section.id === 'contact');
  if (!section) return;
  const wrapper = section.wrapper;
  const naturalTop = wrapper.getBoundingClientRect().top - contactOffset;
  const progress = getContactProgress(getScrollTrack(sectionData, window.scrollY, window.innerHeight));
  const gap = clamp(window.innerHeight * .035, 24, 40);
  const target = cellBottom + gap;
  const from = Math.max(naturalTop, target);
  const top = reduceMotion.matches ? target : from + (target - from) * progress;
  contactOffset = top - naturalTop;
  wrapper.style.setProperty('--contact-offset', `${contactOffset}px`);
}

function openProject(index, button) {
  const p = projects[index];
  if (!p) return;
  trigger = button;
  dialog.dataset.project = String(index);
  const image = safeUrl(p.image, { image: true });
  document.querySelector('#detail-content').innerHTML = `<h2 id="detail-title">${e(p.title)}</h2><p>${e(p.summary)}</p>${image ? `<img class="project-image" src="${e(image)}" alt="${e(p.imageAlt || p.title)}" />` : imagePlaceholder()}${p.description ? `<p class="detail-description">${e(p.description)}</p>` : ''}${[['Role', p.role], ['Methods', p.methods], ['Result', p.result]].filter(([, v]) => v).map(([label, value]) => `<section class="detail-section"><h3>${label}</h3><p>${e(value)}</p></section>`).join('')}<div class="detail-links">${(p.links || []).map(externalLink).join('')}</div>`;
  document.querySelector('.project-image')?.addEventListener('error', event => { event.target.outerHTML = imagePlaceholder(); }, { once: true });
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('panel-open');
  scrollController.setPaused(true);
  sceneApi?.setPaused(true);
  document.querySelector('#close-detail').focus({ preventScroll: true });
  const shift = getComputedStyle(dialog).getPropertyValue('--panel-shift').trim();
  panelAnimation = dialog.animate(
    reduceMotion.matches ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: `translateX(${shift})`, opacity: .6 }, { transform: 'translateX(0)', opacity: 1 }],
    { duration: reduceMotion.matches ? 120 : 360, easing: 'cubic-bezier(.16,1,.3,1)' },
  );
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => openProject(Number(button.dataset.project), button)));
function closeProject() {
  if (!dialog.open || closingPanel) return;
  const style = getComputedStyle(dialog);
  const start = { transform: style.transform, opacity: style.opacity };
  const shift = style.getPropertyValue('--panel-shift').trim();
  dialog.style.setProperty('--backdrop-opacity', getComputedStyle(dialog, '::backdrop').opacity);
  panelAnimation?.cancel();
  dialog.dataset.closing = '';
  panelAnimation = dialog.animate(
    [start, { transform: reduceMotion.matches ? start.transform : `translateX(${shift})`, opacity: 0 }],
    { duration: reduceMotion.matches ? 100 : 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
  );
  const animation = panelAnimation;
  closingPanel = animation.finished.catch(() => {}).then(() => {
    if (panelAnimation === animation && dialog.open) dialog.close();
  });
}
document.querySelector('#close-detail').addEventListener('click', closeProject);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right)) closeProject();
});
dialog.addEventListener('close', () => {
  panelAnimation?.cancel();
  panelAnimation = null;
  closingPanel = null;
  delete dialog.dataset.closing;
  document.body.classList.remove('panel-open');
  scrollController.setPaused(false);
  sceneApi?.setPaused(false);
  trigger?.focus({ preventScroll: true });
});

function measure() {
  sectionData = [...document.querySelectorAll('.scene')].map(el => {
    const wrapper = el.querySelector('.scene-inner');
    wrapper.style.setProperty('--reading-top', `${Math.max(24, Math.min(window.innerHeight * .57, window.innerHeight - wrapper.offsetHeight - 96))}px`);
    return { el, wrapper, id: el.id, top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight, kind: el.dataset.kind, project: Number(el.dataset.projectIndex || 0) };
  });
  categoryRanges = getChapterRanges(sectionData, window.innerHeight, document.documentElement.scrollHeight - window.innerHeight);
  rulerBounds = new Map([...document.querySelectorAll('.chapter-stop')].map(link => {
    const inset = parseFloat(getComputedStyle(link).getPropertyValue('--tick-inset')) || 0;
    return [link.dataset.chapter, { left: link.offsetLeft + inset - 1.5, width: Math.floor((link.offsetWidth - inset * 2 - 1) / 7) * 7 }];
  }));
  update();
}
function update() {
  queued = false;
  if (!sectionData.length) return;
  const current = getJourney(sectionData, window.scrollY, window.innerHeight);
  const position = getCategoryProgress(categoryRanges, window.scrollY);
  const chapter = position.id;
  document.body.dataset.layout = current.section.el.dataset.layout;
  document.body.dataset.scene = current.section.el.id;
  const track = getScrollTrack(sectionData, window.scrollY, window.innerHeight);
  const factState = getFunFactState(track);
  factCallouts.setState(factState, reduceMotion.matches);
  const shell = getMembranePose(track), scope = getMicroscopeState(track);
  const imaging = reduceMotion.matches ? Number(scope.imaging >= .5) : scope.imaging;
  document.documentElement.style.setProperty('--electron', `${imaging * 100}%`);
  document.documentElement.style.setProperty('--imaging-progress', imaging);
  for (const section of sectionData) {
    if (section.kind === 'entry') continue;
    const wrapper = section.wrapper;
    const progress = section.id === 'project-2' ? imaging : getChapterVisibility(track, section.id);
    const opacity = reduceMotion.matches ? Number(progress >= .5) : progress;
    wrapper.style.opacity = opacity;
    wrapper.style.visibility = opacity === 0 ? 'hidden' : 'visible';
    wrapper.inert = opacity < .01;
  }
  document.body.dataset.sectionView = shell.section > .8 ? 'split' : 'whole';
  document.body.dataset.imaging = scope.electron ? 'electron' : 'optical';
  document.body.dataset.microscope = scope.presence > .05 ? 'present' : 'absent';
  document.body.dataset.view = getCellPose(track).open < .01 ? 'outside' : 'inside';
  if (chapter !== active) {
    active = chapter;
    document.body.dataset.chapter = chapter;
    document.body.removeAttribute('aria-current');
    document.querySelectorAll('a[data-chapter]').forEach(link => link.dataset.chapter === chapter ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  }
  const progress = clamp(window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1));
  const bounds = rulerBounds.get(position.id);
  if (bounds) document.querySelector('.progress-track').style.setProperty('--marker-x', `${bounds.left + position.local * bounds.width}px`);
  const annotation = current.section.kind === 'project' ? projects[current.section.project]?.title : current.section.kind === 'entry' ? (chapter === 'projects' ? projects[0]?.title : data.interests) : { intro: data.interests, experience: 'Experience & activities', academics: 'Academics & honors', contact: 'Let’s connect' }[chapter];
  document.querySelector('#annotation-text').textContent = annotation || '';
  document.querySelector('#scene-caption').textContent = { intro: 'Animal cell · overview', projects: 'Mitochondria · selected projects', experience: 'ER / Golgi · experience & activities', academics: 'Ribosomes · academics & honors', contact: 'Animal cell · reassembled' }[chapter];
  if (shell.section > .8) document.querySelector('#scene-caption').textContent = 'Animal cell · cross-section';
  else if (scope.presence > .05) document.querySelector('#scene-caption').textContent = scope.electron ? 'Electron microscopy · specimen view' : 'Electron microscope · specimen holder';
  document.querySelector('#secondary-annotation').textContent = current.section.kind === 'project' ? projects[current.section.project]?.methods || '[Methods]' : current.section.kind === 'academics' ? academics.school || '[School]' : 'Selected projects';
  sceneApi?.setJourney({ kind: current.section.kind, project: current.section.project, local: current.local, progress, track, factTarget: factState.target, factOpacity: factState.opacity });
  if (!sceneApi) {
    positionContact(document.querySelector('#cell-diagram').getBoundingClientRect().bottom);
    // Use the same authored SVG coordinates as the fallback artwork. Split
    // coordinates include the translations on its two clipped cell halves.
    const split = shell.section > .8;
    const svg = document.querySelector(split ? '.static-split' : '.static-cell');
    const matrix = svg.getScreenCTM();
    if (matrix) factCallouts.setPoints((split ? [[300, 303], [680, 146]] : [[480, 150], [190, 360]]).map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix)));
  }
}
window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
window.addEventListener('resize', measure);
new ResizeObserver(measure).observe(document.querySelector('main'));
document.fonts.ready.then(measure);
// Resolve direct chapter URLs after content and font layout are ready.
if (window.location.hash) document.fonts.ready.then(() => {
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (target) window.scrollTo({ top: resolveAnchor(target), behavior: 'instant' });
});
let configuration = 0;
async function configureScene() {
  const version = ++configuration;
  sceneApi?.dispose();
  sceneApi = null;
  document.body.classList.remove('has-webgl');
  document.body.classList.add('static-mode');
  // The static diagram is also the deliberate reduced-motion experience.
  if (reduceMotion.matches) { measure(); return; }
  try {
    const { createCellScene } = await import('./scene.js');
    if (reduceMotion.matches || version !== configuration) return;
    sceneApi = createCellScene(document.querySelector('#cell-canvas'), { mobile: smallScreen.matches, onCellFrame: positionContact, onFactFrame: points => factCallouts.setPoints(points), onFailure: () => { sceneApi?.dispose(); sceneApi = null; document.body.classList.remove('has-webgl'); document.body.classList.add('static-mode'); measure(); } });
    document.body.classList.remove('static-mode');
    document.body.classList.add('has-webgl');
    sceneApi.setPaused(dialog.open);
    measure();
  } catch (error) {
    console.info('3D unavailable; displaying the static cell diagram.');
  }
}
reduceMotion.addEventListener('change', configureScene);
smallScreen.addEventListener('change', configureScene);
measure();
configureScene();
