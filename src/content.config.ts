import { defineCollection, z } from 'astro:content';
import { substackLoader } from './lib/substackLoader';

const posts = defineCollection({
  loader: substackLoader(),
  schema: z.object({
    title: z.string(),
    titleFr: z.string().default(''),
    description: z.string(),
    descriptionFr: z.string().default(''),
    pubDate: z.coerce.date(),
    author: z.string().default('Suzanne Chartol and Adeline Chartol'),
    substackUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
    contentFr: z.string().default(''),
  }),
});

export const collections = { posts };
