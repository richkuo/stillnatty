import { defineCollection, z } from 'astro:content';

const PEPTIDE_TAGS = [
  'muscle gain',
  'fat loss',
  'sleep',
  'skin and hair',
  'recovery',
  'healing',
  'growth hormone',
  'sarm',
  'oral',
  'injectable',
  'subcutaneous',
  'intramuscular',
] as const;

const peptides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    popular_name: z.string(),
    developmental_codes: z.array(z.string()),
    street_names: z.array(z.string()),
    product_names: z.array(z.string()),
    description: z.string(),
    benefits: z.array(z.string()),
    dosage_levels: z.array(z.string()),
    research: z.array(z.string()),
    tags: z.array(z.enum(PEPTIDE_TAGS)),
    affiliate_links: z.array(z.string()),
    is_natty: z.boolean().default(true),
  }),
});

export const collections = { peptides };
