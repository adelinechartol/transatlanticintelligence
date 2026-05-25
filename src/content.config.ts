import { defineCollection, z } from 'astro:content';
import { substackLoader } from './lib/substackLoader';

const posts = defineCollection({
  loader: substackLoader(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Suzanne'),
    substackUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
