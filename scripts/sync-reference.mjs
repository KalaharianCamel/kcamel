// Fetch only public, same-origin portfolio pages and their presentation assets.
// Original runtime bundles are not used; navigation and the home scene are rebuilt.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.shiyunlu.com';
const root = process.cwd();
const queue = ['/about', '/projects', '/posts'];
const pages = new Map();
const assets = new Set(['/styles/global.css', '/textures/matcap.jpeg', '/favicon.svg']);
const provenance = {};

async function get(url) {
  const response = await fetch(origin + url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}

for (let i = 0; i < queue.length; i++) {
  const route = queue[i];
  let html;
  try {
    html = i < 3 ? await readFile(path.join(root, 'reference', route.slice(1) + '.html'), 'utf8') : await (await get(route)).text();
  } catch (error) {
    throw new Error(`Cannot obtain required route ${route}: ${error.message}`);
  }
  pages.set(route, html);
  for (const match of html.matchAll(/href="(\/(?:posts|projects)\/[^"#?]+)"/g)) {
    if (!queue.includes(match[1])) queue.push(match[1]);
  }
  console.log(`Read ${route}`);
}

function captureAssets(html) {
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|fonts|styles)\/[^"?]+)"/g)) {
    if (!match[1].endsWith('.js')) assets.add(match[1]);
  }
}

const initial = pages.get('/about');
const logo = initial.match(/<a href="\/" class="logo[^>]*>([\s\S]*?)<\/a>/)[1];
await mkdir(path.join(root, 'src'), { recursive: true });
await writeFile(path.join(root, 'src', 'logo.svg'), logo.replace('width="100%" height="100%"', 'width="43" height="40"'));

for (const [route, original] of pages) {
  const title = original.match(/<title>(.*?)<\/title>/)[1];
  const description = original.match(/<meta name="description" content="([^"]*)"/)?.[1] || title;
  const styleLinks = [...new Set([...original.matchAll(/<link rel="stylesheet" href="([^"]+)"\s*\/?\s*>/g)].map(m => m[1]))];
  let body = original.split('</astro-island>')[1];
  // Splitting only once retains any server-rendered article examples.
  body = original.slice(original.indexOf('</astro-island>') + '</astro-island>'.length);
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<source\b[^>]*>/gi, '')
    .replace(/\s+srcset="[^"]*"/gi, '')
    .replace(/<\/?(?:html|body)[^>]*>/gi, '')
    .replace(/<astro-island\b[^>]*>/gi, '<div class="reference-example">')
    .replace(/<\/astro-island>/gi, '</div>');
  captureAssets(body);
  styleLinks.forEach(url => assets.add(url));
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="icon" href="/favicon.svg">${styleLinks.map(url => `<link rel="stylesheet" href="${url}">`).join('')}<link rel="stylesheet" href="/src/site.css"></head><body data-page="${route}"><div id="site-header"></div>${body}<script type="module" src="/src/main.js"></script></body></html>`;
  const out = path.join(root, route, 'index.html');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}

// CSS imports and font URLs are collected while the queue grows.
for (const url of assets) {
  const response = await get(url);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const out = path.join(root, 'public', url);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, bytes);
  provenance[url] = { source: origin + url, purpose: 'Reference presentation asset', retrieved: '2026-10-20' };
  if (url.endsWith('.css')) {
    const css = new TextDecoder().decode(bytes);
    for (const match of css.matchAll(/url\(['"]?(\/[^)'"\s]+)['"]?\)/g)) assets.add(match[1]);
  }
  console.log(`Saved ${url}`);
}
await writeFile(path.join(root, 'routes.json'), JSON.stringify([...pages.keys()], null, 2));
await writeFile(path.join(root, 'public', 'asset-provenance.json'), JSON.stringify(provenance, null, 2));
console.log(`Complete: ${pages.size} local pages; ${assets.size} assets.`);
