// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeTodo, rehypeTableScroll } from './src/lib/rehype.mjs';

// Served at the root of https://christineng2027.github.io/ (repo to be renamed
// to ChristineNg2027.github.io). If you add a custom domain later, change `site`
// to it; `base` stays '/'. Links in the code are base-aware either way.
const base = '/';

export default defineConfig({
  site: 'https://christineng2027.github.io',
  base,
  output: 'static',
  // The one stylesheet is small: inline it so pages render without an extra request.
  build: { inlineStylesheets: 'always' },
  markdown: {
    processor: unified({ rehypePlugins: [rehypeTodo, rehypeTableScroll] }),
  },
  redirects: {
    '/cv': `${base.replace(/\/$/, '')}/christine-ng-cv.pdf`,
  },
  // The dev toolbar injects scripts in dev; keep dev identical to production.
  devToolbar: { enabled: false },
});
