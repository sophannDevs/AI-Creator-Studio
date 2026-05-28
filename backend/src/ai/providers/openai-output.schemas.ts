import { z } from 'zod';

export const videoIdeasOutputSchema = z
  .object({
    ideas: z
      .array(
        z
          .object({
            title: z.string().min(1),
            hook: z.string().min(1),
            status: z.literal('DRAFT'),
          })
          .strict(),
      )
      .min(1)
      .max(10),
  })
  .strict();

export const scriptOutputSchema = z
  .object({
    hook: z.string().min(1),
    intro: z.string().min(1),
    mainContent: z.string().min(1),
    conclusion: z.string().min(1),
    cta: z.string().min(1),
    duration: z.string().min(1),
    tone: z.string().min(1),
  })
  .strict();

export const seoOutputSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    hashtags: z.array(z.string().min(1)).min(1),
    seoScore: z.number().int().min(0).max(100),
  })
  .strict();

export const thumbnailOutputSchema = z
  .object({
    text: z.string().min(1),
    backgroundIdea: z.string().min(1),
    mainObject: z.string().min(1),
    style: z.string().min(1),
    prompt: z.string().min(1),
  })
  .strict();
