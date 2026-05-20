import { z } from 'zod';
import { POST_TYPES, POST_STATUSES, FRAMEWORKS, MEDIA_MAX_PER_POST } from '../constants/index.js';

export const PostTypeSchema = z.enum(POST_TYPES);
export const PostStatusSchema = z.enum(POST_STATUSES);
export const FrameworkSchema = z.enum(FRAMEWORKS);

export const PostMediaSchema = z.object({
  id: z.string().uuid().optional(),
  storagePath: z.string().min(1),
  mime: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
  position: z.number().int().nonnegative().default(0),
});

export const PostSchema = z.object({
  id: z.string().uuid().optional(),
  orgId: z.string().uuid(),
  type: PostTypeSchema,
  title: z.string().min(1).max(120),
  bodyMd: z.string().min(10).max(8000),
  framework: FrameworkSchema.optional(),
  variants: z.array(z.string()).max(8).default([]),
  status: PostStatusSchema.default('draft'),
  aiGenerationId: z.string().uuid().nullable().optional(),
  media: z.array(PostMediaSchema).max(MEDIA_MAX_PER_POST).default([]),
});

export type PostInput = z.input<typeof PostSchema>;
export type Post = z.output<typeof PostSchema>;
