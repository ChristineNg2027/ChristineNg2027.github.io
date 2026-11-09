// Small rehype plugins for Markdown content. No dependencies.

const TODO = /\[\[TODO:?\s*([\s\S]*?)\]\]/g;
const SKIP = new Set(['code', 'pre', 'script', 'style']);

/** Visible text for a marker: "[[TODO: project video]]" → "Placeholder: project video". */
const label = (inner) => (inner.trim() ? `Placeholder: ${inner.trim()}` : 'Placeholder');

/**
 * Replaces every [[TODO: …]] marker with a neutral <span class="placeholder-tag">
 * "Placeholder: …" label. Keep the label short; the details of what is still
 * needed live in the private notes (docs/site-todos.md), not on the site.
 * A marker must be plain text (no *italics* or `code` inside it).
 */
export function rehypeTodo() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (!node.children) return;
  if (node.type === 'element' && SKIP.has(node.tagName)) return;
  const out = [];
  for (const child of node.children) {
    // Inline HTML in Markdown (e.g. <figure>) arrives as an unparsed "raw" string,
    // because Astro parses raw HTML after user plugins run.
    if (child.type === 'raw' && child.value.includes('[[TODO')) {
      child.value = child.value.replace(TODO, (_, inner) => `<span class="placeholder-tag">${label(inner)}</span>`);
      out.push(child);
    } else if (child.type === 'text' && child.value.includes('[[TODO')) {
      let last = 0;
      for (const m of child.value.matchAll(TODO)) {
        if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) });
        out.push({
          type: 'element',
          tagName: 'span',
          properties: { className: ['placeholder-tag'] },
          children: [{ type: 'text', value: label(m[1]) }],
        });
        last = m.index + m[0].length;
      }
      if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) });
    } else {
      walk(child);
      out.push(child);
    }
  }
  node.children = out;
}

/**
 * Wraps each <table> in a keyboard-focusable scroll container, so wide tables
 * scroll on their own at phone width instead of widening the page.
 */
export function rehypeTableScroll() {
  return (tree) => wrapTables(tree);
}

function wrapTables(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type === 'element' && child.tagName === 'table') {
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'], tabIndex: 0, role: 'region', ariaLabel: 'Table' },
        children: [child],
      };
    }
    wrapTables(child);
    return child;
  });
}
