import { profile } from './profile.js';
import { easeOut, motionPreference } from './motion.js';

const isHome = document.body.dataset.page === 'home';
const mark = `<svg viewBox="0 0 107 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="currentColor"/><path d="M25 72V27h8l17 29 17-29h8v45h-8V42L50 69 33 42v30Z" fill="var(--logo-cutout)"/><circle cx="99.5" cy="92.5" r="7.5" fill="currentColor"/></svg>`;
const closeIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" stroke-width="1.5"/></svg>';
const mount = document.querySelector('#site-header');
const contactLinks = [
  profile.email && [`mailto:${profile.email}`, profile.email],
  profile.github && [profile.github, profile.github.replace(/^https?:\/\//, '').replace(/\/$/, '')],
  profile.twitter && [profile.twitter, profile.twitter.replace(/^https?:\/\//, '').replace(/\/$/, '')],
].filter(Boolean);
mount.innerHTML = `
  <header class="site-header ${isHome ? '' : 'ink'}">
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="navigation"><span></span><span></span></button>
  </header>
  <dialog id="navigation" class="navigation" aria-label="Main navigation">
    <div class="nav-header"><button class="close-menu" aria-label="Close menu">${closeIcon}</button></div>
    <nav class="nav-grid" aria-label="Portfolio">
      <a class="nav-tile experiments" href="/projects/">Experiments.</a>
      <a class="nav-tile writing" href="/posts/">Writing.</a>
      <a class="nav-tile about" href="/about/">About.</a>
      <div class="nav-noise"><canvas width="160" height="160" aria-hidden="true"></canvas><a class="noise-home" href="/" aria-label="Home">${mark}</a></div>
      <section class="nav-tile contact"><h2>Contact.</h2><ul>${contactLinks.map(([url, label]) => `<li><a href="${url}"${url.startsWith('https:') ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a></li>`).join('')}</ul></section>
    </nav>
    <footer class="nav-footer"><small>© ${new Date().getFullYear()}, ${profile.name}. Made with care and three.js.</small><a class="nav-return" href="/">Home</a></footer>
  </dialog>`;

const dialog = document.querySelector('#navigation');
const opener = document.querySelector('.menu-toggle');
const closer = document.querySelector('.close-menu');
const noise = document.querySelector('.nav-noise canvas');
const context = noise.getContext('2d');
const pixels = context.createImageData(noise.width, noise.height);
let noiseFrame;
let noiseTime = 0;
let previousOverflow = '';
let menuState = 'closed';
let menuAnimations = [];
let closingTask;
function animateNoise(now = 0) {
  if (document.hidden || !dialog.open) { noiseFrame = undefined; return; }
  if (now - noiseTime < 80 && !motionPreference()) { noiseFrame = requestAnimationFrame(animateNoise); return; }
  noiseTime = now;
  for (let p = 0; p < pixels.data.length; p += 4) {
    const value = Math.random() * 255;
    pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = value;
    pixels.data[p + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  if (!motionPreference()) noiseFrame = requestAnimationFrame(animateNoise);
}
opener.addEventListener('click', () => {
  if (menuState !== 'closed') return;
  menuState = 'opening';
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.showModal();
  opener.setAttribute('aria-expanded', 'true');
  animateNoise();
  const duration = motionPreference() ? 120 : 460;
  const reveal = dialog.animate(motionPreference() ? [{ opacity: 0 }, { opacity: 1 }] : [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration, easing: easeOut });
  menuAnimations = [reveal];
  if (!motionPreference()) document.querySelectorAll('.nav-tile, .nav-noise').forEach((tile, index) => {
    menuAnimations.push(tile.animate([{ opacity: .4, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 380, delay: 75 + Math.min(index * 25, 100), easing: easeOut }));
  });
  reveal.finished.then(() => { if (menuState === 'opening') menuState = 'open'; }).catch(() => {});
});
function closeMenu() {
  if (menuState === 'closed') return Promise.resolve();
  if (menuState === 'closing') return closingTask;
  menuState = 'closing';
  const clipPath = getComputedStyle(dialog).clipPath;
  const opacity = getComputedStyle(dialog).opacity;
  menuAnimations.forEach(animation => animation.cancel());
  const exit = dialog.animate(motionPreference() ? [{ opacity }, { opacity: 0 }] : [{ clipPath: clipPath === 'none' ? 'inset(0 0 0% 0)' : clipPath }, { clipPath: 'inset(0 0 100% 0)' }], { duration: motionPreference() ? 100 : 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
  closingTask = exit.finished.catch(() => {}).then(() => { dialog.close(); exit.cancel(); });
  return closingTask;
}
closer.addEventListener('click', closeMenu);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
dialog.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || link.target === '_blank' || !link.href.startsWith(location.origin) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  closeMenu().then(() => location.assign(link.href));
});
dialog.addEventListener('close', () => {
  menuState = 'closed';
  menuAnimations.forEach(animation => animation.cancel());
  menuAnimations = [];
  document.body.style.overflow = previousOverflow;
  opener.setAttribute('aria-expanded', 'false');
  cancelAnimationFrame(noiseFrame);
  opener.focus({ preventScroll: true });
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(noiseFrame); noiseFrame = undefined; }
  else if (dialog.open && !noiseFrame) animateNoise();
});

// Retain native links, so filtered indexes and articles support refresh,
// browser history, opening in a new tab, and direct static hosting.
document.querySelectorAll('a[target="_blank"]').forEach(a => a.rel = 'noreferrer noopener');
document.querySelectorAll('.index-btn').forEach(a => {
  if (a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) {
    a.classList.add('active');
    a.setAttribute('aria-current', 'page');
  }
});
if (!isHome) {
  if (document.querySelector('#mdx-content')) document.body.classList.add('blog-post', 'padding');
  document.title = document.title.replaceAll('Shiyun Lu', profile.name);
  const articleTitle = document.querySelector('article h1, .post-page h1');
  if (articleTitle) articleTitle.id ||= 'article-title';
}

document.querySelectorAll('lite-vimeo').forEach(player => {
  player.querySelector('button')?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${player.dataset.id}?autoplay=1&dnt=1`;
    iframe.title = 'Chat application demonstration';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
  });
});

if (isHome) {
  document.querySelector('.hero-copy h1').textContent = profile.name.toUpperCase();
  document.querySelector('#tagline').textContent = profile.taglines[0] || '';
  let disposeScene;
  import('./scene.js').then(({ startScene }) => startScene(document.querySelector('#cell-scene')))
    .then(dispose => { disposeScene = dispose; })
    .catch(error => {
      console.warn('Using the non-WebGL cell scene.', error);
      document.querySelector('#cell-scene').classList.add('scene-fallback');
      document.querySelector('#cell-scene').innerHTML = Array.from({ length: 18 }, (_, i) => `<span style="--i:${i}"></span>`).join('');
    });
  window.addEventListener('pagehide', event => { if (!event.persisted) disposeScene?.(); });
}
