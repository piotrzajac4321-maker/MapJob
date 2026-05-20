import { z } from 'zod';
import { FrameworkSchema, PostTypeSchema } from './post.js';

export const BrandContextSchema = z.object({
  name: z.string().min(1).max(80),
  oneLiner: z.string().min(5).max(200),
  usp: z.array(z.string().min(3).max(200)).min(1).max(5),
  tone: z.enum(['konkretny', 'empatyczny', 'profesjonalny', 'konwersacyjny', 'prowokacyjny']),
  bannedWords: z.array(z.string()).max(50).default([]),
  preferredWords: z.array(z.string()).max(50).default([]),
});

export const BriefSchema = z.object({
  goal: z.enum(['leady', 'rejestracje', 'wiadomosci', 'aplikacje', 'sprzedaz', 'swiadomosc']),
  audience: z.string().min(5).max(300),
  postType: PostTypeSchema,
  framework: FrameworkSchema,
  platform: z.literal('facebook_group').default('facebook_group'),
  brand: BrandContextSchema,
  offer: z.string().min(10).max(1500),
  proof: z.string().max(400).optional(),
  cta: z.string().min(3).max(100),
  region: z.string().max(80).optional(),
  budget: z.string().max(80).optional(),
  contact: z.string().max(120).optional(),
  variantCount: z.number().int().min(1).max(5).default(3),
});

export const AiGenerateRequestSchema = z.object({
  brief: BriefSchema,
  model: z.enum(['claude-sonnet-4-6', 'claude-opus-4-7']).default('claude-sonnet-4-6'),
});

export const AiGenerateResponseSchema = z.object({
  generationId: z.string().uuid(),
  primaryText: z.string(),
  variants: z.array(z.string()),
  humanScore: z.number().min(0).max(100),
  warnings: z.array(z.string()),
  promptTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  regenerated: z.number().int().nonnegative(),
});

export type Brief = z.output<typeof BriefSchema>;
export type AiGenerateRequest = z.output<typeof AiGenerateRequestSchema>;
export type AiGenerateResponse = z.output<typeof AiGenerateResponseSchema>;
