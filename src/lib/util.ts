/** Prefix a site path with the configured base, e.g. url('pre-vision/') → '/portfolio/pre-vision/'. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

const TODO = /\[\[TODO:?\s*([\s\S]*?)\]\]/g;
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** True if a value is still an unfilled [[TODO: …]] placeholder. */
export const isTodo = (s: string) => s.includes('[[TODO');

/**
 * Escape a plain string for use with set:html and show any [[TODO: …]] marker
 * as a neutral "Placeholder: …" label (same look as in Markdown content).
 */
export function withTodos(s: string): string {
  return s
    .replace(/[&<>"']/g, (c) => ESC[c])
    .replace(TODO, (_, inner: string) => {
      const text = inner.trim() ? `Placeholder: ${inner.trim()}` : 'Placeholder';
      return `<span class="placeholder-tag">${text}</span>`;
    });
}
