import { z } from 'zod';
import { DEFAULT_COOLDOWN_MINUTES, DEFAULT_DAILY_CAP_PER_GROUP } from '../constants/index.js';

export const PrivacySchema = z.enum(['public', 'private', 'unknown']).default('unknown');

export const GroupSchema = z.object({
  id: z.string().uuid().optional(),
  orgId: z.string().uuid(),
  fbAccountId: z.string().uuid(),
  fbGroupId: z.string().regex(/^\d+$/, 'fbGroupId must be numeric string'),
  name: z.string().min(1).max(200),
  url: z.string().url(),
  membersCount: z.number().int().nonnegative().nullable().optional(),
  privacy: PrivacySchema,
  postApprovalRequired: z.boolean().default(false),
  category: z.string().max(80).nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  cooldownMinutes: z.number().int().min(0).max(10080).default(DEFAULT_COOLDOWN_MINUTES),
  dailyCap: z.number().int().min(0).max(100).default(DEFAULT_DAILY_CAP_PER_GROUP),
  isActive: z.boolean().default(true),
});

export const GroupScrapedBatchSchema = z.object({
  fbAccountId: z.string().uuid(),
  groups: z.array(
    z.object({
      fbGroupId: z.string().regex(/^\d+$/),
      name: z.string().min(1).max(200),
      url: z.string().url(),
      membersCount: z.number().int().nonnegative().nullable().optional(),
      privacy: PrivacySchema.optional(),
    }),
  ).max(500),
});

export type GroupInput = z.input<typeof GroupSchema>;
export type Group = z.output<typeof GroupSchema>;
export type GroupScrapedBatch = z.output<typeof GroupScrapedBatchSchema>;
