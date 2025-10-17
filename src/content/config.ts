import { defineCollection, z } from 'astro:content';

const peptides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { peptides };
