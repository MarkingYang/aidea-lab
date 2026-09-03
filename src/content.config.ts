import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    type: z.enum(['note', 'essay', 'weekly']),
    status: z.enum(['seed', 'growing', 'evergreen', 'archived']),
    topics: z.array(z.string()).min(1),
    featured: z.boolean().default(false),
    readingTime: z.string(),
    standalone: z.boolean().default(false),
  }),
});

export const collections = { writing };
