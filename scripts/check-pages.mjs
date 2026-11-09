// Loads every page at phone (375px) and desktop (1280px) widths, in light and
// dark mode, using your installed Google Chrome. Reports console errors, failed
// requests, horizontal scrolling, third-party requests and images without alt
// text, and saves full-page screenshots to ./screenshots/ (git-ignored).
//
// Usage: start `npm run dev` (or `npm run preview`), then
//   npm run check                          # checks http://localhost:4321/
//   npm run check -- http://localhost:4321/  # or any other base URL
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:4321/';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
const pages = ['', 'pre-vision/', 'wire-bending/'];
const viewports = { phone: { width: 375, height: 812 }, desktop: { width: 1280, height: 900 } };
const origin = new URL(BASE).origin;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let problems = 0;

for (const scheme of ['light', 'dark']) {
  for (const [vpName, vp] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: vpName === 'phone' ? 2 : 1 });
    for (const path of pages) {
      const page = await ctx.newPage();
      const issues = [];
      const external = [];
      page.on('console', (m) => ['error', 'warning'].includes(m.type()) && issues.push(`console.${m.type()}: ${m.text()}`));
      page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
      // ERR_ABORTED = the browser cancelled its own request (e.g. switching to a better srcset image): harmless.
      page.on('requestfailed', (r) => r.failure()?.errorText !== 'net::ERR_ABORTED' && issues.push(`request failed (${r.failure()?.errorText}): ${r.url()}`));
      page.on('response', (r) => r.status() >= 400 && issues.push(`HTTP ${r.status()}: ${r.url()}`));
      page.on('request', (r) => !r.url().startsWith(origin) && !r.url().startsWith('data:') && external.push(r.url()));

      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const m = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName).join(' '),
        imgsNoAlt: document.querySelectorAll('img:not([alt])').length,
        placeholders: document.querySelectorAll('.placeholder-tag').length,
        rawTodos: (document.body.innerText.match(/\[\[TODO/g) ?? []).length,
      }));
      if (m.overflow > 0) issues.push(`horizontal scroll: ${m.overflow}px too wide`);
      if (external.length) issues.push(`third-party requests: ${external.join(', ')}`);
      if (m.imgsNoAlt) issues.push(`${m.imgsNoAlt} image(s) without alt text`);
      if (m.rawTodos) issues.push(`${m.rawTodos} raw [[TODO marker(s) visible on the page`);

      const name = `${path.replace(/\/$/, '') || 'home'}-${vpName}-${scheme}`;
      await page.screenshot({ path: `${OUT}${name}.png`, fullPage: true });
      console.log(`${issues.length ? 'FAIL' : 'ok  '} ${name.padEnd(28)} headings: ${m.headings.padEnd(18)} placeholders: ${m.placeholders}`);
      issues.forEach((i) => console.log('     - ' + i));
      problems += issues.length;
      await page.close();
    }
    await ctx.close();
  }
}

await browser.close();
console.log(problems ? `\n${problems} problem(s)` : `\nAll checks passed. Screenshots in ${OUT}`);
process.exit(problems ? 1 : 0);
