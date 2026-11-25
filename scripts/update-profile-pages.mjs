import { readFile, writeFile } from 'node:fs/promises';

const routes = JSON.parse(await readFile('routes.json', 'utf8'));
function page(title, description, route, content) {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Matthew Suwiryo</title><meta name="description" content="${description}"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/styles/global.css"><link rel="stylesheet" href="/src/site.css"></head><body data-page="${route}"><div id="site-header"></div>${content}<footer class="page-footer padding">© ${new Date().getFullYear()} Matthew Suwiryo</footer><script type="module" src="/src/main.js"></script></body></html>\n`;
}
const about = `<main class="profile-about padding"><article class="about-copy"><h1>Matthew Suwiryo.</h1><p class="about-meta">DVHS · Class of 2027</p><p>I’m a senior at DVHS with an interest in biology and a plan to pursue a pre-med path. My long-term goal is to become a doctor—to understand the science behind the human body and put that knowledge to work caring for people.</p><p>I’m still at the beginning of that journey. This is a place for the questions, experiments, and ideas I’ll collect along the way.</p><p>You can reach me at <a href="mailto:matthewsuwiryo@gmail.com">matthewsuwiryo@gmail.com</a> or find me on <a href="https://github.com/kalahariancamel" target="_blank" rel="noreferrer">GitHub</a>.</p></article></main>`;
await writeFile('about/index.html', page('About', 'Matthew Suwiryo, DVHS class of 2027. Biology, pre-med, and a future in medicine.', '/about', about));
for (const route of routes.filter(route => route.startsWith('/posts') || route.startsWith('/projects'))) {
  const writing = route.startsWith('/posts');
  const title = writing ? 'Writing' : 'Experiments';
  const description = writing ? 'A place for notes, questions, and things I’m learning. I’ll be adding my writing here soon.' : 'A place for the projects and experiments I’ll share along the way. Check back soon.';
  const content = `<main class="empty-page padding"><div class="narrow"><h1>${title}.</h1><section class="empty-message"><h2>Coming soon.</h2><p>${description}</p><a class="empty-back" href="/">Back to home <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a></section></div></main>`;
  await writeFile(`.${route}/index.html`, page(title, description, route, content));
}
// Preserve the user's other custom messages exactly as written.
let profile = await readFile('src/profile.js', 'utf8');
profile = profile.replace(/'biology major\.'/g, "'biology / pre-med.'").replace(/'aspiring medical student\.'/g, "'aspiring doctor.'");
profile = profile.replace(/^\/\/ The reference[^\n]*\n\/\/ retained[^\n]*\n/m, '');
if (!profile.includes('school:')) profile = profile.replace(/(name:\s*'Matthew Suwiryo',)/, "$1\n  school: 'DVHS',\n  graduationYear: 2027,");
await writeFile('src/profile.js', profile);
let index = await readFile('index.html', 'utf8');
index = index.replace('Matthew Suwiryo — biology major and aspiring medical student.', 'Matthew Suwiryo — DVHS class of 2027, biology/pre-med, and aspiring doctor.').replace('<h2 id="tagline">biology major.</h2>', '<h2 id="tagline">biology / pre-med.</h2>');
await writeFile('index.html', index);
console.log('Updated Matthew’s biography, profile metadata, contact details, and all writing/experiment placeholders.');
