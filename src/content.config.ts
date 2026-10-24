import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each entry lives in its own folder (src/content/<collection>/<slug>/index.md)
// so its images can sit right next to it. The folder name is the URL slug.
const folderId = ({ entry }: { entry: string }) => entry.split('/')[0];

// A cover is either an image next to the entry (./cover.jpg, optimized at build)
// or a public path like /uploads/cover.jpg (what the web editor writes).
const cover = (image: SchemaContext['image']) => z.union([z.string().regex(/^(\/|https?:)/), image()]).optional();

const projects = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/projects', generateId: folderId }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      outcome: z.string().optional(), // "Gets done": the one line that says what it does for people
      verb: z.enum(['find', 'answer', 'simplify', 'anticipate', 'delight']).optional(), // homepage verb tile
      task: z.string(),
      data: z.string(),
      model: z.string(),
      metric: z.string().optional(), // real value only
      stack: z.array(z.string()).default([]),
      status: z.enum(['shipped', 'training', 'planned']),
      featured: z.boolean().default(false),
      cover: cover(image),
      coverAlt: z.string().optional(),
      github: z.string().optional(),
      demo: z.string().optional(),
      writeup: z.string().optional(),
      team: z.string().optional(), // e.g. "Team of 4, Break Through Tech AI Studio"
      date: z.coerce.date(),
      draft: z.boolean().default(false), // true = hidden from the site
    }),
});

const writing = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/writing', generateId: folderId }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      cover: cover(image),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, writing };
