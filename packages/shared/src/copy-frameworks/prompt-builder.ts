import type { Brief } from '../schemas/brief.js';
import { SKILL_CORE } from './skill-core.js';
import { getFrameworkSection } from './frameworks.js';
import { HOOKS_GUIDE } from './hooks.js';
import { PLATFORM_RULES } from './platforms.js';
import { HUMANIZE_GUIDE } from './humanize.js';

export interface BuiltPrompt {
  system: string;
  user: string;
  systemHash: string;
}

export function buildSystemPrompt(framework: Brief['framework']): string {
  return [
    SKILL_CORE,
    '\n\n---\n\n',
    '# FRAMEWORK\n\n',
    getFrameworkSection(framework),
    '\n\n---\n\n',
    '# HOOKS\n\n',
    HOOKS_GUIDE,
    '\n\n---\n\n',
    '# PLATFORM\n\n',
    PLATFORM_RULES,
    '\n\n---\n\n',
    '# HUMANIZE (KRYTYCZNE)\n\n',
    HUMANIZE_GUIDE,
  ].join('');
}

export function buildUserPrompt(brief: Brief): string {
  const lines = [
    `# Brief do wygenerowania posta na grupę Facebook`,
    ``,
    `**Cel kampanii:** ${brief.goal}`,
    `**Audience (do kogo piszesz):** ${brief.audience}`,
    `**Typ posta:** ${brief.postType}`,
    `**Framework do użycia:** ${brief.framework}`,
    `**Liczba wariantów do wygenerowania:** ${brief.variantCount}`,
    ``,
    `## Marka / firma`,
    `- Nazwa: ${brief.brand.name}`,
    `- W jednym zdaniu: ${brief.brand.oneLiner}`,
    `- USP: ${brief.brand.usp.map((u) => `\n  - ${u}`).join('')}`,
    `- Ton marki: ${brief.brand.tone}`,
  ];

  if (brief.brand.preferredWords?.length) {
    lines.push(`- Słowa preferowane: ${brief.brand.preferredWords.join(', ')}`);
  }
  if (brief.brand.bannedWords?.length) {
    lines.push(`- Słowa ZAKAZANE (nie używaj): ${brief.brand.bannedWords.join(', ')}`);
  }

  lines.push(``, `## Oferta / treść do zakomunikowania`, brief.offer);

  if (brief.proof) {
    lines.push(``, `## Dowód społeczny / liczby`, brief.proof);
  }

  lines.push(``, `## CTA (jeden, konkretny)`, brief.cta);

  if (brief.region) {
    lines.push(``, `## Region / lokalizacja`, brief.region, ``, `WAŻNE: wpleć nazwę dzielnicy/miasta naturalnie. Lokalność buduje wiarygodność.`);
  }
  if (brief.budget) {
    lines.push(``, `## Budżet / stawka / cena`, brief.budget);
  }
  if (brief.contact) {
    lines.push(``, `## Kontakt`, brief.contact);
  }

  lines.push(
    ``,
    `---`,
    ``,
    `Wygeneruj ${brief.variantCount} wariantów posta zgodnie z formatem JSON ze SKILL_CORE.`,
    `Każdy wariant musi przejść test HUMANIZE: brzmieć jak post od człowieka z branży, nie od AI.`,
    `Zwracaj WYŁĄCZNIE JSON, bez żadnego dodatkowego tekstu, bez markdown wokół.`,
  );

  return lines.join('\n');
}

export async function hashString(s: string): Promise<string> {
  // Web Crypto API — działa w Deno (Edge Functions), Node 20+, przeglądarce
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function buildPrompt(brief: Brief): Promise<BuiltPrompt> {
  const system = buildSystemPrompt(brief.framework);
  const user = buildUserPrompt(brief);
  const systemHash = await hashString(system);
  return { system, user, systemHash };
}
