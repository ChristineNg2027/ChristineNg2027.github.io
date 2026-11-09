import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects. An entry with `link` is a card-only project: it gets a home-page
 * card pointing to that URL and no page of its own. Every other entry gets a
 * page at /<file name>/ and needs `glance` and `hero`.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        /** Order on the home page (lower first). */
        order: z.number(),
        /** Shown as a tag next to the title on the project page. */
        status: z.string().optional(),
        /** External link for card-only projects (e.g. a GitHub repo). */
        link: z.url().optional(),
        /** The one-line "at a glance" box: label/value pairs. */
        glance: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        hero: z
          .object({
            kind: z.enum(['video', 'diagram']),
            caption: z.string(),
          })
          .optional(),
        card: z.object({
          line: z.string(),
          meta: z.string(),
          /** Optional card image, relative to the Markdown file, e.g. ../../assets/wire.jpg */
          image: image().optional(),
        }),
      })
      .refine((d) => d.link || (d.glance && d.hero && d.status), {
        message: 'Projects with their own page need status, glance and hero (or set `link` for a card-only project).',
      }),
});

/** All content collections. */
export const collections = { projects };
