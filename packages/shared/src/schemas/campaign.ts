import { z } from 'zod';
import {
  CAMPAIGN_STATUSES,
  TARGET_STATUSES,
  DEFAULT_DAILY_CAP_PER_ACCOUNT,
  DEFAULT_MIN_DELAY_SECONDS,
  DEFAULT_MAX_DELAY_SECONDS,
} from '../constants/index.js';

export const CampaignStatusSchema = z.enum(CAMPAIGN_STATUSES);
export const TargetStatusSchema = z.enum(TARGET_STATUSES);

export const CampaignSchema = z
  .object({
    id: z.string().uuid().optional(),
    orgId: z.string().uuid(),
    name: z.string().min(1).max(120),
    postId: z.string().uuid(),
    status: CampaignStatusSchema.default('draft'),
    randomizeOrder: z.boolean().default(true),
    minDelaySeconds: z.number().int().min(30).max(3600).default(DEFAULT_MIN_DELAY_SECONDS),
    maxDelaySeconds: z.number().int().min(30).max(7200).default(DEFAULT_MAX_DELAY_SECONDS),
    dailyCapPerAccount: z.number().int().min(1).max(200).default(DEFAULT_DAILY_CAP_PER_ACCOUNT),
    startAt: z.coerce.date().nullable().optional(),
    endAt: z.coerce.date().nullable().optional(),
    targetGroupIds: z.array(z.string().uuid()).min(1).max(1000),
  })
  .refine((c) => c.maxDelaySeconds >= c.minDelaySeconds, {
    message: 'maxDelaySeconds must be >= minDelaySeconds',
    path: ['maxDelaySeconds'],
  });

export type CampaignInput = z.input<typeof CampaignSchema>;
export type Campaign = z.output<typeof CampaignSchema>;
