/**
 * Anthropic Claude client (raw fetch, bez SDK żeby uniknąć złożoności bundlowania w Deno).
 * Wspiera prompt caching (cache_control na system prompt) — duży system prompt
 * przeładowany frameworkami + humanize-guide wraca jako cache hit.
 */

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

export type ClaudeModel = 'claude-sonnet-4-6' | 'claude-opus-4-7';

export interface ClaudeRequest {
  model: ClaudeModel;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens?: number;
  cacheCreationInputTokens?: number;
}

export interface ClaudeResponse {
  text: string;
  usage: ClaudeUsage;
  stopReason: string | null;
}

// Pricing (USD per 1M tokens, stan 2026-05) — aktualizuj gdy się zmieni
const PRICING: Record<ClaudeModel, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-sonnet-4-6': { input: 3.0, output: 15.0, cacheRead: 0.3, cacheWrite: 3.75 },
  'claude-opus-4-7': { input: 15.0, output: 75.0, cacheRead: 1.5, cacheWrite: 18.75 },
};

export function estimateCostUsd(model: ClaudeModel, usage: ClaudeUsage): number {
  const p = PRICING[model];
  const inputNew = usage.inputTokens;
  const cacheRead = usage.cacheReadInputTokens ?? 0;
  const cacheWrite = usage.cacheCreationInputTokens ?? 0;
  const output = usage.outputTokens;

  const cost =
    (inputNew * p.input) / 1_000_000 +
    (cacheRead * p.cacheRead) / 1_000_000 +
    (cacheWrite * p.cacheWrite) / 1_000_000 +
    (output * p.output) / 1_000_000;

  return Number(cost.toFixed(4));
}

export async function callClaude(req: ClaudeRequest): Promise<ClaudeResponse> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const body = {
    model: req.model,
    max_tokens: req.maxTokens ?? 2048,
    temperature: req.temperature ?? 0.85,
    system: [
      {
        type: 'text',
        text: req.systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: req.userMessage }],
  };

  const res = await fetch(ANTHROPIC_BASE, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as {
    content: { type: string; text?: string }[];
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
    stop_reason: string | null;
  };

  const text = data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('');

  return {
    text,
    usage: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      cacheReadInputTokens: data.usage.cache_read_input_tokens,
      cacheCreationInputTokens: data.usage.cache_creation_input_tokens,
    },
    stopReason: data.stop_reason,
  };
}
