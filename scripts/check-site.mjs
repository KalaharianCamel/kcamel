import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const routes = ['/', ...JSON.parse(await readFile('routes.json', 'utf8'))];
const errors = [];
let links = 0;
let assets = 0;
for (const route of routes) {
  const file = route === '/' ? 'index.html' : `.${route}/index.html`;
  const html = await readFile(file, 'utf8');
  if (!html.includes('/src/main.js')) errors.push(`${route}: missing shared runtime`);
  if (!html.includes('/styles/global.css')) errors.push(`${route}: missing typography stylesheet`);
  for (const [, attribute, value] of html.matchAll(/\b(href|src)="(\/[^"#?]*)[^"]*"/g)) {
    if (value.startsWith('//')) continue;
    const url = decodeURIComponent(value);
    const candidate = url.startsWith('/src/') ? `.${url}` : path.extname(url) ? `public${url}` : url === '/' ? 'index.html' : `.${url.replace(/\/$/, '')}/index.html`;
    try { await access(candidate); }
    catch { errors.push(`${route}: broken ${attribute} ${url}`); }
    if (attribute === 'href' && !path.extname(url)) links++;
    else assets++;
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${routes.length} pages, ${links} internal links, and ${assets} asset references.`);
}
