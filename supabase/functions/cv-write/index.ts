// Supabase Edge Function: cv-write
// Deploy: supabase functions deploy cv-write --no-verify-jwt
// Env (reuse of cv-parse secrets):
//   ANTHROPIC_API_KEY        - sk-ant-...
//   SUPABASE_URL             - auto
//   SUPABASE_ANON_KEY        - auto
//
// Body:
//   {
//     "action": "polish_bullet" | "generate_summary" | "translate" |
//               "tailor_to_job" | "suggest_skills",
//     "payload": { ... },
//     "lang"?: "pl" | "en" | "de"
//   }
// Auth: header Authorization: Bearer <user_session_jwt> (sprawdzane przez
// getUser() po stronie fn; verify_jwt=false z powodu ES256 runtime).
//
// Rate limit: max 60 wywołań / 24h per user (public.cv_write_calls_last_24h).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_CALLS_24H = 60
const MAX_BULLET_CHARS = 300
const MAX_SUMMARY_CHARS = 500

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ---------- SYSTEM PROMPTS (cache'owane) ----------

const SYSTEM_PROMPT_CV = `Jesteś ekspertem rekrutacyjnym i copywriterem CV, specjalizującym się
w polskim rynku pracy (fachowcy, technicy, inżynierowie, handlowcy, IT)
oraz w expatowaniu do DE/NL/UK.

Wszystkie Twoje odpowiedzi MUSZĄ spełniać:
1. ATS 2026 standard — bez tabel, kolumn, ikon, dziwnych fontów; używaj
   konkretnych słów kluczowych z branży.
2. Formuła bulletów: [czasownik akcji] + [co] + [jak/czym] + [rezultat z liczbą].
   Używaj czasowników: zrealizowałem, wdrożyłem, zaprojektowałem,
   zoptymalizowałem, zredukowałem, zwiększyłem, uruchomiłem, skoordynowałem.
   NIGDY: "odpowiadałem za", "pracowałem przy", "pomagałem".
3. Liczby w MIN. 60% bulletów (ilość, czas, pieniądze, skala, jakość).
4. Nie zmyślaj danych. Jeśli brakuje liczb — zachowaj strukturę, ale nie
   wymyślaj fikcyjnych metryk. Lepiej słabszy bullet z prawdą niż mocny kłamstwo.
5. Polski: unikaj kalki z angielskiego ("wdrożyłem" nie "zaimplementowałem",
   "zrealizowałem" nie "przeprowadziłem"). Profesjonalny, lecz nie sztywny.
6. Długość: bullet max 300 znaków; summary 3-4 zdania, max 500 znaków.

Zwracaj WYŁĄCZNIE czysty tekst lub JSON (zależnie od action). Nigdy markdown,
nigdy komentarze, nigdy preamble typu "Oto Twój poprawiony bullet:".`

interface ClaudeContent {
  type: string
  text?: string
}

interface ClaudeResponse {
  content?: ClaudeContent[]
  usage?: { input_tokens?: number; output_tokens?: number }
  error?: { message?: string; type?: string }
}

async function callClaude(
  userPrompt: string,
  opts: { maxTokens?: number; jsonMode?: boolean } = {}
): Promise<{ text: string; usage?: ClaudeResponse['usage'] }> {
  const body = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT_CV,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errBody = await resp.text()
    throw new Error(`Claude API ${resp.status}: ${errBody.slice(0, 200)}`)
  }

  const json: ClaudeResponse = await resp.json()
  if (json.error) {
    throw new Error(`Claude error: ${json.error.message ?? json.error.type}`)
  }

  const text =
    (json.content ?? [])
      .filter((c) => c.type === 'text' && c.text)
      .map((c) => c.text)
      .join('\n')
      .trim() ?? ''

  return { text, usage: json.usage }
}

// ---------- ACTION HANDLERS ----------

interface PolishBulletPayload {
  text: string
  role?: string
  industry?: string
}
async function handlePolishBullet(
  p: PolishBulletPayload,
  lang: string
): Promise<string> {
  const raw = String(p.text ?? '').slice(0, 600)
  if (!raw.trim()) return ''
  const role = String(p.role ?? '').slice(0, 80)
  const industry = String(p.industry ?? '').slice(0, 80)
  const langLabel = lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'polski'

  const prompt = `Przepisz ten bullet na wzór ATS 2026 (${langLabel}):

Bullet: """${raw}"""
Rola: ${role || '(nieokreślona)'}
Branża: ${industry || '(nieokreślona)'}

Wymagania:
- [czasownik akcji] + [co] + [jak] + [liczba/rezultat]
- max 300 znaków
- zachowaj prawdę z oryginału (nie zmyślaj liczb — jeśli brak, pomiń)
- jeśli bullet zawiera prawdziwe liczby — podkreśl je

Zwróć TYLKO przepisany bullet, bez cudzysłowów, bez "- ", bez preamble.`

  const { text } = await callClaude(prompt, { maxTokens: 256 })
  return text.replace(/^[-•*·]\s*/, '').trim().slice(0, MAX_BULLET_CHARS)
}

interface GenerateSummaryPayload {
  experience?: Array<{ position?: string; company?: string; bullets?: string[] }>
  skills?: { hard?: string[]; soft?: string[] }
  years?: number
  targetRole?: string
}
async function handleGenerateSummary(
  p: GenerateSummaryPayload,
  lang: string
): Promise<string> {
  const exp = Array.isArray(p.experience) ? p.experience.slice(0, 5) : []
  const expText = exp
    .map(
      (e) =>
        `- ${String(e.position ?? '')} @ ${String(e.company ?? '')}` +
        (e.bullets && e.bullets.length
          ? `\n  • ${e.bullets.slice(0, 3).join('\n  • ')}`
          : '')
    )
    .join('\n')
    .slice(0, 2500)
  const hardSk = (p.skills?.hard ?? []).slice(0, 10).join(', ').slice(0, 400)
  const softSk = (p.skills?.soft ?? []).slice(0, 6).join(', ').slice(0, 200)
  const years = Math.max(0, Math.min(60, Math.round(p.years ?? 0)))
  const role = String(p.targetRole ?? '').slice(0, 80)
  const langLabel = lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'polski'

  const prompt = `Napisz profesjonalne Professional Summary (${langLabel}) dla CV:

Docelowa rola: ${role || '(na podstawie historii)'}
Lata doświadczenia: ${years || '(wyciągnij z historii)'}

Doświadczenie:
${expText || '(brak)'}

Kluczowe umiejętności hard: ${hardSk || '(brak)'}
Kluczowe umiejętności soft: ${softSk || '(brak)'}

Struktura (3-4 zdania):
Zdanie 1: [Rola] z [X lat] doświadczenia w [branża], specjalizuję się w [2-3 umiejętności].
Zdanie 2: [Największe osiągnięcie z liczbą] — [co dokładnie].
Zdanie 3: Szukam [typ roli] w [region/branża], gotowy [atut].

Max 500 znaków. Zwróć tylko tekst streszczenia, bez nagłówków, bez cudzysłowów.`

  const { text } = await callClaude(prompt, { maxTokens: 400 })
  return text.slice(0, MAX_SUMMARY_CHARS)
}

interface TranslatePayload {
  data: unknown
  to: string // en | de
}
async function handleTranslate(p: TranslatePayload): Promise<unknown> {
  const srcData = p.data
  const to = String(p.to ?? 'en').toLowerCase()
  const targetLangLabel =
    to === 'de' ? 'niemiecki (Deutsch)' : 'angielski (English)'
  const localizationHints =
    to === 'de'
      ? 'Zachowaj niemieckie konwencje (dokładne daty, sekcja Weiterbildung dozwolona, foto OK).'
      : 'Zachowaj anglosaskie konwencje (bez foto, bez daty urodzenia, bez RODO, mocno wyniki-zorientowane).'

  const srcTxt = JSON.stringify(srcData).slice(0, 14000)

  const prompt = `Przetłumacz poniższy CV JSON na język ${targetLangLabel}. ${localizationHints}

ZASADY:
- Lokalizuj, nie tłumacz literalnie. Np. "Technik Elektryk" → "Electrical Technician" (nie "Elektric Technik").
- Zachowuj nazwy firm i instytucji (np. "Uniwersytet Jagielloński" → nie zmieniaj; opcjonalnie dodaj "(Jagiellonian University)" w nawiasie).
- Przelicz skróty: "UDT" → "Forklift operator license (UDT Poland, ITSSAR-equivalent)".
- Przetłumacz stawki na EUR/USD orientacyjnie (zachowaj oryginał + dodaj ekwiwalent): "50 zł/h brutto" → "12 EUR/hour gross (PL-based rate)".
- Daty: miesiące w docelowym języku ("czerwiec 2020" → "June 2020" / "Juni 2020").
- Bullety przepisz w stronie czynnej, z akcyjnymi czasownikami docelowego języka.

Zwróć TYLKO JSON, w dokładnie tej samej strukturze co wejście. Ustaw data.showGdprClause=false dla EN/DE.

Input:
${srcTxt}`

  const { text } = await callClaude(prompt, { maxTokens: 4096 })
  // Szukamy pierwszego '{' i ostatniego '}' na wypadek preamble.
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('Claude returned no JSON')
  return JSON.parse(text.slice(s, e + 1))
}

interface TailorPayload {
  data: { summary?: string; skills?: { hard?: string[]; soft?: string[] } }
  jobDescription: string
}
async function handleTailor(
  p: TailorPayload,
  lang: string
): Promise<{
  suggestedSummary: string
  skillsToAdd: string[]
  keywordCoverage: number
}> {
  const job = String(p.jobDescription ?? '').slice(0, 6000)
  if (!job.trim()) throw new Error('jobDescription required')

  const langLabel = lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'polski'

  const prompt = `Dopasuj CV do oferty pracy (${langLabel}).

Oferta:
"""
${job}
"""

Obecne streszczenie CV: ${String(p.data?.summary ?? '').slice(0, 600)}
Obecne umiejętności hard: ${(p.data?.skills?.hard ?? []).slice(0, 12).join(', ')}
Obecne umiejętności soft: ${(p.data?.skills?.soft ?? []).slice(0, 8).join(', ')}

Zadanie:
1. Wyciągnij 15-25 keywordów z oferty (konkretne umiejętności, technologie, uprawnienia).
2. Napisz NOWE streszczenie (3-4 zdania, max 500 znaków) nasycone keywordami z oferty, ale opierające się na faktach z obecnego streszczenia.
3. Wskaż umiejętności z oferty, których BRAK w CV — jako lista do dodania (user sam oceni czy je ma).
4. Oceń keyword coverage (0-100%) — ile keywordów z oferty już jest w obecnym CV.

Zwróć TYLKO JSON:
{
  "suggestedSummary": "...",
  "skillsToAdd": ["...", "..."],
  "keywordCoverage": 72
}`

  const { text } = await callClaude(prompt, { maxTokens: 1200 })
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('Claude returned no JSON')
  const parsed = JSON.parse(text.slice(s, e + 1))
  return {
    suggestedSummary: String(parsed.suggestedSummary ?? '').slice(0, MAX_SUMMARY_CHARS),
    skillsToAdd: Array.isArray(parsed.skillsToAdd)
      ? parsed.skillsToAdd.slice(0, 20).map((s: unknown) => String(s).slice(0, 80))
      : [],
    keywordCoverage: Math.max(0, Math.min(100, Math.round(parsed.keywordCoverage ?? 0))),
  }
}

interface CoverLetterPayload {
  data: {
    personal?: { fullName?: string; role?: string; city?: string }
    summary?: string
    experience?: Array<{ position?: string; company?: string; bullets?: string[] }>
    skills?: { hard?: string[] }
  }
  jobDescription?: string
  companyName?: string
  tone?: string // 'formal' | 'friendly' | 'confident'
}
async function handleCoverLetter(
  p: CoverLetterPayload,
  lang: string
): Promise<string> {
  const fullName = String(p.data?.personal?.fullName ?? '').slice(0, 80)
  const role = String(p.data?.personal?.role ?? '').slice(0, 80)
  const city = String(p.data?.personal?.city ?? '').slice(0, 80)
  const summary = String(p.data?.summary ?? '').slice(0, 500)
  const exp = (p.data?.experience ?? []).slice(0, 3).map((e) =>
    `- ${String(e.position ?? '')} @ ${String(e.company ?? '')}` +
    (e.bullets && e.bullets.length ? `\n  • ${e.bullets.slice(0, 2).join('\n  • ')}` : '')
  ).join('\n').slice(0, 2000)
  const skills = (p.data?.skills?.hard ?? []).slice(0, 8).join(', ').slice(0, 300)
  const job = String(p.jobDescription ?? '').slice(0, 4000)
  const company = String(p.companyName ?? '').slice(0, 100)
  const tone = ['formal', 'friendly', 'confident'].includes(String(p.tone))
    ? String(p.tone)
    : 'confident'
  const langLabel = lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'polski'

  const toneLabels: Record<string, string> = {
    formal: 'formalny, profesjonalny',
    friendly: 'ciepły, przyjazny',
    confident: 'pewny siebie, bezpośredni, zorientowany na wynik',
  }

  const prompt = `Napisz list motywacyjny (${langLabel}) w tonie ${toneLabels[tone]}.

Kandydat:
- Imię i nazwisko: ${fullName || '(brak)'}
- Rola: ${role || '(brak)'}
- Miasto: ${city || '(brak)'}

Streszczenie CV:
${summary || '(brak)'}

Najważniejsze doświadczenie:
${exp || '(brak)'}

Kluczowe umiejętności: ${skills || '(brak)'}

${company ? `Firma docelowa: ${company}` : ''}
${job ? `Oferta pracy:\n"""\n${job}\n"""` : ''}

Wymagania:
- Max 4 akapity (ok. 220-280 słów)
- Pierwszy akapit: stanowisko + 1 hook z CV (osiągnięcie z liczbą)
- Drugi: 2-3 konkretne dopasowania kandydata do oferty (użyj keywordów z oferty jeśli jest)
- Trzeci: dlaczego ta firma / motywacja (bez banałów)
- Czwarty: 1 zdanie CTA + kontakt
- Bez sztywnych formułek w stylu "zwracam się z ogromną prośbą"
- Bez "jestem komunikatywny i sumienny" — konkrety zamiast pustych przymiotników
- ${lang === 'pl' ? 'Bez klauzuli RODO (będzie w CV)' : 'No GDPR clause'}

Zwróć TYLKO treść listu, bez nagłówka "List motywacyjny:", bez cudzysłowów, bez markdown.`

  const { text } = await callClaude(prompt, { maxTokens: 1200 })
  return text.trim()
}

interface SuggestSkillsPayload {
  role: string
  experience?: Array<{ position?: string; bullets?: string[] }>
}
async function handleSuggestSkills(
  p: SuggestSkillsPayload,
  lang: string
): Promise<{ hard: string[]; soft: string[] }> {
  const role = String(p.role ?? '').slice(0, 80)
  const exp = (p.experience ?? [])
    .slice(0, 3)
    .map(
      (e) =>
        String(e.position ?? '') +
        ' — ' +
        (e.bullets ?? []).slice(0, 3).join('; ')
    )
    .join('\n')
    .slice(0, 2000)
  const langLabel = lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'polski'

  const prompt = `Zasugeruj umiejętności (${langLabel}) dla CV osoby na stanowisko "${role}".

Kontekst z doświadczenia:
${exp || '(brak)'}

Zwróć 12 hard skills i 6 soft skills trafnych dla tej roli na polskim rynku pracy.
Hard = konkretne technologie/narzędzia/uprawnienia (np. "SEP do 1kV", "Python", "SAP B1").
Soft = mierzalne kompetencje (np. "Zarządzanie zespołem 6 osób", "Negocjacje z dostawcami").

Zwróć TYLKO JSON:
{"hard": ["...","..."], "soft": ["...","..."]}`

  const { text } = await callClaude(prompt, { maxTokens: 800 })
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('Claude returned no JSON')
  const parsed = JSON.parse(text.slice(s, e + 1))
  return {
    hard: Array.isArray(parsed.hard)
      ? parsed.hard.slice(0, 16).map((s: unknown) => String(s).slice(0, 80))
      : [],
    soft: Array.isArray(parsed.soft)
      ? parsed.soft.slice(0, 8).map((s: unknown) => String(s).slice(0, 80))
      : [],
  }
}

// ---------- HANDLER ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    const supaUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    })
    const {
      data: { user },
      error: userErr,
    } = await supaUser.auth.getUser(token)
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    // Rate-limit sprawdzany przez service-role client (RPC wymaga SECURITY DEFINER)
    const supaAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
    )
    try {
      const { data: calls } = await supaAdmin.rpc('cv_write_calls_last_24h', {
        p_user_id: user.id,
      })
      const n = typeof calls === 'number' ? calls : parseInt(String(calls ?? 0), 10)
      if (n >= MAX_CALLS_24H) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded (60/24h)' }),
          {
            status: 429,
            headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
          }
        )
      }
    } catch (_e) {
      // H9: fail-closed — RPC missing or DB error means rate limit cannot be verified.
      console.error('[cv-write] rate-limit RPC failed (fail-closed):', (_e as Error).message)
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action ?? '')
    const payload = body?.payload ?? {}
    const lang = ['pl', 'en', 'de'].includes(body?.lang) ? body.lang : 'pl'

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
        }
      )
    }

    let result: unknown
    switch (action) {
      case 'polish_bullet':
        result = await handlePolishBullet(payload, lang)
        break
      case 'generate_summary':
        result = await handleGenerateSummary(payload, lang)
        break
      case 'translate':
        result = await handleTranslate(payload)
        break
      case 'tailor_to_job':
        result = await handleTailor(payload, lang)
        break
      case 'suggest_skills':
        result = await handleSuggestSkills(payload, lang)
        break
      case 'cover_letter':
        result = await handleCoverLetter(payload, lang)
        break
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
          }
        )
    }

    // Zapis eventu do rate-limitu (best-effort, ignore errors).
    try {
      await supaAdmin.from('user_events').insert({
        user_id: user.id,
        event_type: 'cv_write_call',
        event_data: { action, lang },
      })
    } catch (_ignore) {}

    return new Response(JSON.stringify({ result, meta: { model: MODEL } }), {
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('[cv-write] error', err)
    return new Response(
      JSON.stringify({ error: 'Request failed — try again.' }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      }
    )
  }
})
