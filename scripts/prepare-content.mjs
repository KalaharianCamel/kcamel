// Keep editable reference facts and concise article previews, with source links.
import { readFile, writeFile } from 'node:fs/promises';

const previews = {
  'my-stack-for-rapid-development': 'An overview of the author’s preferred tools for taking a web project from an idea to a working application. The original article discusses application frameworks, validation, state management, interface components, and forms.',
  'react-state-management-fundamentals': 'An exploration of how React coordinates state changes and rendering. The original article follows the update process and uses implementation details to explain the relationship between application state and the interface.',
  'modern-frontend-tooling-fundamentals': 'A guide to the roles of the tools surrounding a modern JavaScript application: managing dependencies, compiling source, bundling modules, checking code, and preparing an application for the browser.',
  'theming-with-css-custom-properties': 'A look at using CSS variables to coordinate themes across an application. The original writing considers global styles, individual components, and changes driven by application data.',
  'image-optimization-an-engineers-guide': 'An introduction to delivering images efficiently on the web, covering responsive image selection, deferred loading, stable page layout, and image delivery services.',
  'my-ultimate-pwa-workflow': 'A practical discussion of progressive web applications, including service workers, offline behavior, version updates, and checks for a dependable installation experience.',
  'how-i-built-a-real-time-chat-app-with-react': 'A project retrospective on real-time messaging with a React interface and a Rails backend. The original article discusses live updates, multiple conversation rooms, and unread-message indicators.'
};
for (const [slug, summary] of Object.entries(previews)) {
  const file = `posts/${slug}/index.html`;
  let html = await readFile(file, 'utf8');
  const start = html.indexOf('<section class="narrow content"');
  html = html.slice(0, start) + `<section class="narrow content article-preview" id="mdx-content"><article><p>${summary}</p><p>This reference writing is by Shiyun Lu. This page is ready for Matthew’s own notes.</p><p><a href="https://www.shiyunlu.com/posts/${slug}/" target="_blank" rel="noreferrer">Read the original article on shiyunlu.com</a></p></article></section><script type="module" src="/src/main.js"></script></body></html>`;
  await writeFile(file, html);
}
const bioFile = 'about/index.html';
let bio = await readFile(bioFile, 'utf8');
const paragraphs = [
  'Temporary biography from Shiyun Lu: a Washington, DC-based software engineer at Instacart, with earlier experience building educational and sustainable shopping products.',
  'Her path into software began in international aid. Building useful things and seeing their effect drew her toward engineering.',
  'Originally from China, she has also lived in Egypt and worked in Ethiopia. Her interests include street food, transit, K-pop, and bubble tea.',
  'You can find the reference author on <a href="https://twitter.com/lu_shiyun" target="_blank">Twitter at @lu_shiyun</a>. Matthew’s biography and photo will replace this temporary material.'
];
bio = bio.replace(/<article class="astro-EZPRM57P">[\s\S]*?<\/article>/, `<article class="astro-EZPRM57P">${paragraphs.map(p => `<p class="astro-EZPRM57P">${p}</p>`).join('')}</article>`);
await writeFile(bioFile, bio);
console.log('Prepared seven attributed article previews and temporary biography.');
