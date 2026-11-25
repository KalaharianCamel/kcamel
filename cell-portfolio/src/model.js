export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const smooth = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };
export function getJourney(sections, scroll, viewport) {
  const point = scroll + viewport * 0.18;
  let index = 0;
  for (let i = 0; i < sections.length; i++) if (point >= sections[i].top) index = i;
  const section = sections[index];
  return { index, section, local: clamp((point - section.top) / Math.max(section.height, 1)) };
}
export function getCategoryProgress(ranges, progress) {
  let index = 0;
  for (let i = 1; i < ranges.length; i++) if (progress >= ranges[i].start) index = i;
  const range = ranges[index];
  return { id: range.id, local: clamp((progress - range.start) / Math.max(range.end - range.start, .00001)) };
}
export function safeUrl(value, { image = false } = {}) {
  if (!value || typeof value !== 'string') return '';
  const url = value.trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (!image && /^mailto:[^\s@]+@[^\s@]+$/i.test(url)) return url;
  if (/^(\.\/|\/[^/])/.test(url) && !/[\\\s]/.test(url)) return url;
  return '';
}
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function externalLink(link) {
  const href = safeUrl(link?.url);
  return href ? `<a class="text-link" href="${escapeHtml(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.label || 'View project')} <svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 18 12-12M6 6h12v12"/></svg></a>` : '';
}
