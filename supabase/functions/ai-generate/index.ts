/**
 * ai-generate — Edge Function dla generowania copy reklamowego przez Claude.
 *
 * Flow:
 * 1. Auth + walidacja briefu (Zod).
 * 2. assert_ai_quota (RPC) — 20/h user, 200/24h org. Przekroczenie → 429.
 * 3. Build system prompt (SKILL_CORE + FRAMEWORK + HOOKS + PLATFORM + HUMANIZE) z cache_control.
 * 4. Call Claude (claude-sonnet-4-6 default / claude-opus-4-7 opcja).
 * 5. Parse JSON output. Anti-AI filter na każdym wariancie.
 *    Jeśli wszystkie zablokowane → regenerate (max 2x), z dodatkowym promptem o czym poprawić.
 * 6. computeHumanScore na primaryText.
 * 7. Insert ai_generations + return response.
 */

import { z } from 'npm:zod@3.23.8';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin, getCurrentUserId } from '../_shared/supabase.ts';
import {
  buildSystemPrompt,
  buildUserPrompt,
  hashString,
  type Framework,
} from '../_shared/ai-prompts.ts';
import { runAntiAiFilter, computeHumanScore } from '../_shared/humanize.ts';
import { callClaude, estimateCostUsd, type ClaudeModel } from '../_shared/claude.ts';

const FrameworkEnum = z.enum(['AIDA', 'PAS', 'BAB', 'FAB', '4U', 'PASTOR']);

const BriefSchema = z.object({
  goal: z.enum(['leady', 'rejestracje', 'wiadomosci', 'aplikacje', 'sprzedaz', 'swiadomosc']),
  audience: z.string().min(5).max(300),
  postType: z.enum(['job', 'sales', 'other']),
  framework: FrameworkEnum,
  brand: z.object({
    name: z.string().min(1).max(80),
    oneLiner: z.string().min(5).max(200),
    usp: z.array(z.string()).min(1).max(5),
    tone: z.enum(['konkretny', 'empatyczny', 'profesjonalny', 'konwersacyjny', 'prowokacyjny']),
    preferredWords: z.array(z.string()).max(50).optional(),
    bannedWords: z.array(z.string()).max(50).optional(),
  }),
  offer: z.string().min(10).max(1500),
  proof: z.string().max(400).optional(),
  cta: z.string().min(3).max(100),
  region: z.string().max(80).optional(),
  budget: z.string().max(80).optional(),
  contact: z.string().max(120).optional(),
  variantCount: z.number().int().min(1).max(5).default(3),
});

const RequestSchema = z.object({
  orgId: z.string().uuid(),
  brief: BriefSchema,
  model: z.enum(['claude-sonnet-4-6', 'claude-opus-4-7']).default('claude-sonnet-4-6'),
});

interface ClaudeJson {
  primaryText: string;
  variants?: string[];
  hookOptions?: string[];
  selfNotes?: {
    framework?: string;
    concretes?: string[];
    warnings?: string[];
  };
}

function parseClaudeOutput(raw: string): ClaudeJson | null {
  // Claude może obudować w ```json ... ``` mimo instrukcji. Strip if needed.
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(stripped) as ClaudeJson;
    if (typeof parsed.primaryText !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'POST only');
  }

  const userId = await getCurrentUserId(req);
  if (!userId) return errorResponse(401, 'unauthorized', 'Sign in required');

  let payload: z.infer<typeof RequestSchema>;
  try {
    const json = await req.json();
    payload = RequestSchema.parse(json);
  } catch (err) {
    return errorResponse(400, 'invalid_request', String(err));
  }

  const admin = getSupabaseAdmin();

  // 1. Sprawdź członkostwo w org
  const { data: membership } = await admin
    .from('org_members')
    .select('role')
    .eq('org_id', payload.orgId)
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)
    .maybeSingle();

  if (!membership) {
    return errorResponse(403, 'forbidden', 'Not a member of this org');
  }

  // 2. Rate limit
  const { error: quotaErr } = await admin.rpc('assert_ai_quota', {
    _org_id: payload.orgId,
    _user_id: userId,
  });
  if (quotaErr) {
    return jsonResponse(
      { error: { code: 'quota_exceeded', message: quotaErr.message } },
      { status: 429, headers: { 'Retry-After': '3600' } },
    );
  }

  // 3. Build prompts
  const systemPrompt = buildSystemPrompt(payload.brief.framework as Framework);
  const userPrompt = buildUserPrompt(payload.brief);
  const systemPromptHash = await hashString(systemPrompt);
  const model = payload.model as ClaudeModel;

  // 4. Generate loop with anti-AI regeneration (max 2 retries)
  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheWrite = 0;
  let parsed: ClaudeJson | null = null;
  let primaryFilter: ReturnType<typeof runAntiAiFilter> | null = null;
  let lastUserPrompt = userPrompt;
  let lastWarnings: string[] = [];

  while (attempt < MAX_ATTEMPTS) {
    attempt++;

    const response = await callClaude({
      model,
      systemPrompt,
      userMessage: lastUserPrompt,
      maxTokens: 2048,
      temperature: 0.85,
    });

    totalInput += response.usage.inputTokens;
    totalOutput += response.usage.outputTokens;
    totalCacheRead += response.usage.cacheReadInputTokens ?? 0;
    totalCacheWrite += response.usage.cacheCreationInputTokens ?? 0;

    const candidate = parseClaudeOutput(response.text);
    if (!candidate) {
      if (attempt >= MAX_ATTEMPTS) {
        return errorResponse(502, 'invalid_claude_output', 'Claude did not return valid JSON');
      }
      lastUserPrompt =
        userPrompt +
        '\n\nUWAGA: Poprzednia odpowiedź NIE była poprawnym JSON. Zwróć WYŁĄCZNIE JSON wg schematu.';
      continue;
    }

    const filter = runAntiAiFilter(candidate.primaryText);
    parsed = candidate;
    primaryFilter = filter;

    if (!filter.blocked || attempt >= MAX_ATTEMPTS) {
      lastWarnings = filter.findings.map((f) => `${f.code}: ${f.message}`);
      break;
    }

    // Blocked — daj feedback i regeneruj
    const blockedCodes = filter.findings
      .filter((f) => f.severity === 'block')
      .map((f) => `- ${f.code}: ${f.message}`)
      .join('\n');

    lastUserPrompt =
      userPrompt +
      `\n\n## POPRZEDNIA PRÓBA ODRZUCONA (anti-AI filter)\n\nWykryte problemy:\n${blockedCodes}\n\nPrzepisz całkowicie. Usuń zakazane frazy, zwiększ konkretność, urozmaicaj długości zdań. Brzmiej jak człowiek z branży po kilku piwach, nie jak korpo-mail.`;
  }

  if (!parsed || !primaryFilter) {
    return errorResponse(502, 'generation_failed', 'Could not produce valid output');
  }

  // 5. Human score na primaryText (po cleanup z em-dashami)
  const finalPrimaryText = primaryFilter.cleanedText;
  const humanScore = computeHumanScore(finalPrimaryText);
  const cleanedVariants = (parsed.variants ?? []).map((v) => runAntiAiFilter(v).cleanedText);
  const costUsd = estimateCostUsd(model, {
    inputTokens: totalInput,
    outputTokens: totalOutput,
    cacheReadInputTokens: totalCacheRead,
    cacheCreationInputTokens: totalCacheWrite,
  });

  // 6. Insert ai_generations
  const { data: inserted, error: insertErr } = await admin
    .from('ai_generations')
    .insert({
      org_id: payload.orgId,
      user_id: userId,
      model,
      framework: payload.brief.framework,
      brief: payload.brief,
      system_prompt_hash: systemPromptHash,
      prompt_tokens: totalInput,
      output_tokens: totalOutput,
      cost_usd: costUsd,
      output_md: finalPrimaryText,
      variants: cleanedVariants,
      human_score: humanScore,
      warnings: lastWarnings,
      regenerated: attempt - 1,
    })
    .select('id')
    .single();

  if (insertErr || !inserted) {
    return errorResponse(500, 'db_error', insertErr?.message ?? 'insert failed');
  }

  return jsonResponse({
    generationId: inserted.id,
    primaryText: finalPrimaryText,
    variants: cleanedVariants,
    humanScore,
    warnings: lastWarnings,
    promptTokens: totalInput,
    outputTokens: totalOutput,
    costUsd,
    regenerated: attempt - 1,
  });
});
