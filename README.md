# MapJob FB Poster

Półautomatyczne masowe postowanie ogłoszeń (pracy + sprzedażowych) na grupy Facebook. Web app + Chrome extension + AI generator (Claude).

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Baza/Auth/Storage/Edge Fns:** Supabase (dedykowany projekt)
- **Extension:** Chrome MV3 + Vite + TypeScript
- **AI:** Claude API (Anthropic) — Edge Function proxy

## Struktura

```
apps/
  web/         — Next.js dashboard (mózg)
  extension/   — Chrome MV3 (wykonawca w przeglądarce)
packages/
  db/          — Migracje SQL + typy Supabase
  ui/          — Współdzielone komponenty shadcn
  shared/      — Zod schemas, stałe, copy-frameworks, humanize
  config/      — Presety eslint/tsconfig/tailwind
supabase/
  functions/   — Edge Functions (ai-generate, schedule-tick, ...)
```

## Quickstart (dev)

```bash
pnpm install
cp .env.example .env.local
# uzupełnij wartości z Supabase Studio + Anthropic Console

supabase start
supabase db reset

pnpm dev
```

Załaduj rozszerzenie w `chrome://extensions` → Developer mode → Load unpacked → `apps/extension/dist`.

## Filozofia projektu

- **Human-in-the-loop:** user zawsze klika "Publikuj" sam (zgodność z FB ToS).
- **Humanize:** wygenerowane treści przechodzą filtr anti-AI + wariancję per-grupa.
- **Tenant isolation:** wszystkie tabele mają RLS po `org_id`.
- **Klucze API:** Claude wywoływany WYŁĄCZNIE z Edge Function, nigdy w kliencie.

## Plan implementacji

Pełny plan: `/root/.claude/plans/wi-c-tak-potrzebuje-aplikacji-cryptic-candle.md`
