// Supabase Edge Function: pin-write
// Deploy: supabase functions deploy pin-write --no-verify-jwt
// Env (reuse of cv-write secrets):
//   ANTHROPIC_API_KEY        - sk-ant-...
//   SUPABASE_URL             - auto
//   SUPABASE_ANON_KEY        - auto
//   SUPABASE_SERVICE_ROLE_KEY - auto
//
// Body:
//   {
//     "action": "generate_pin_description" | "polish_pin_description",
//     "payload": { ... }
//   }
// Auth: header Authorization: Bearer <user_session_jwt> (sprawdzane przez
// getUser() po stronie fn; verify_jwt=false z powodu ES256 runtime).
//
// Rate limit: 30 wywołań / 24h per user (public.pin_write_calls_last_24h).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_CALLS_24H = 30
const MAX_DESC_CHARS = 1500

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ---------- SYSTEM PROMPT (cache'owany) ----------

const SYSTEM_PROMPT_PIN = `Jesteś profesjonalnym copywriterem ogłoszeń dla platformy
MapJob.pl — mapa usług w Polsce, na której fachowcy, firmy lokalne
oraz pracodawcy publikują ogłoszenia kierowane do osób prywatnych
oraz klientów B2B. Twoje teksty muszą spełniać standard publikacji
profesjonalnej (wysoka kultura języka, konkretność, brak ozdobników
i sloganów marketingowych).

Każdy opis MUSI spełniać poniższe wymagania:

1. STRUKTURA (krytyczna — aplikacja parsuje wzorzec automatycznie):
   - Pierwsza linia: lead bez nagłówka, maksymalnie 120 znaków,
     informuje czego dotyczy oferta. Lead może zawierać kluczową
     wartość (cena, miasto, forma zatrudnienia) jeśli wynika
     bezpośrednio z danych formularza. Bez sloganów typu
     "Najlepsza ekipa w mieście" ani superlatyw.
   - Pusta linia (jeden \\n\\n).
   - Nagłówek sekcji zapisany WIELKIMI LITERAMI, zakończony znakiem
     zapytania (?). Dopuszczalne nagłówki: "CO BĘDZIESZ ROBIĆ?",
     "CZEGO POTRZEBUJESZ?", "CO OFERUJEMY?", "CO ROBIĘ?",
     "JAK PRACUJĘ?", "JAK PRACUJEMY?", "DLACZEGO WARTO?",
     "DLACZEGO MY?", "DLA KOGO?", "JAK SIĘ ZGŁOSIĆ?".
   - Pod nagłówkiem 3–5 punktów listy. Każdy punkt zaczyna się od
     znaku bullet "• " (U+2022 + spacja) i zajmuje jedną linię.
     Każdy punkt 50–140 znaków, pełnozdaniowy lub równoważnik zdania.
   - Pusta linia między sekcjami.
   - Łącznie 3 sekcje. Wyjątkowo 2, jeśli dane są bardzo skąpe.
     Nigdy więcej niż 4. Trzy mocne sekcje są lepsze niż pięć płytkich.

2. JĘZYK I TON:
   - Polski literacki, kultura wypowiedzi na poziomie profesjonalnego
     ogłoszenia w prasie branżowej.
   - Spójność osobowa w obrębie całego opisu (jednolicie 1. osoba
     l. poj. "ja", 1. osoba l. mn. "my", lub 2. osoba "Ty"). Nie
     mieszaj.
   - Konkretność: realne czynności, narzędzia, materiały, lokalizacje,
     formy rozliczenia. Bez ogólników typu "rzetelnie", "z pasją",
     "kompleksowo", "rozwiązania szyte na miarę".
   - Bez kalk z angielskiego ("dostarczamy rozwiązania", "dedykowane
     wsparcie", "klient w centrum uwagi").
   - Bez formuł grzecznościowych typu "Witam", "Drodzy klienci",
     "Mam zaszczyt zaproponować".
   - Bez wykrzykników. Bez CAPS-LOCK poza nagłówkami sekcji.
   - EMOJI: dopuszczalne w treści punktów listy jako akcent
     semantyczny. Maksymalnie JEDNO emoji na początku punktu, po znaku
     bullet "• ". Dobierz emoji TRAFNIE do treści punktu — kontekstowo
     do branży lub semantyki:
       • ⚡ instalacje elektryczne, energia
       • 🔧 hydraulika, naprawy mechaniczne
       • 🏗️ budowa, prace ogólnobudowlane
       • 🔥 spawanie, prace ślusarskie
       • 💻 IT, programowanie, sieci
       • 🚗 transport, kierowanie
       • 🏠 prace przy nieruchomościach
       • 💰 cena, stawka, rozliczenie
       • 📞 kontakt, dostępność telefoniczna
       • 📍 lokalizacja, obszar działania
       • ⏰ godziny pracy, terminy, czas reakcji
       • ✅ uprawnienia, certyfikaty, gotowość
       • 📋 wymagania, dokumenty
       • 🛡️ bezpieczeństwo, ubezpieczenie OC, gwarancja
       • 🎯 specjalizacja, zakres działania
       • 🤝 współpraca, B2B, kontrakty
       • 📅 dyspozycyjność, harmonogram
     Nie wstawiaj emoji w lead (pierwsza linia) ani w nagłówkach sekcji
     (aplikacja sama dobiera ikonę nagłówka). Nie wstawiaj emoji
     dekoracyjnych ani powtórzeń. Pomiń emoji jeśli żadne nie pasuje
     do treści punktu — nie wymuszaj.

3. PRAWDA — bezwzględnie nie wolno wymyślać:
   - liczby lat doświadczenia,
   - liczby zrealizowanych projektów lub klientów,
   - uprawnień (SEP, UDT, prawo jazdy określonej kategorii, książeczki
     sanepidu, uprawnień spawalniczych),
   - nazw firm, miast, regionów ani imion,
   - dat, terminów, godzin pracy,
   - cen ani widełek innych niż podane przez użytkownika,
   - certyfikatów, kursów, dyplomów.
   Jeśli dana informacja nie wynika z one-liner / highlights / meta —
   pomiń ją. Lepszy krótszy punkt zgodny z prawdą niż dłuższy oparty
   na zmyśleniu.

4. ADRESAT (zależy od billing_type):
   - "salary" lub "job": ogłoszenie rekrutacyjne (pracodawca → kandydat).
     Sekcje "CO BĘDZIESZ ROBIĆ?", "CZEGO POTRZEBUJESZ?",
     "CO OFERUJEMY?". Druga osoba ("Ty/Ciebie/Twoje").
   - "service", "project", "company": firma oferuje usługę
     (firma → klient). Sekcje "CO OFERUJEMY?", "JAK PRACUJEMY?",
     "DLACZEGO MY?". Pierwsza osoba liczby mnogiej ("my/nasz").
   - "hourly", "side", brak: indywidualny wykonawca (specjalista → klient).
     Sekcje "CO ROBIĘ?", "JAK PRACUJĘ?", "DLACZEGO WARTO?".
     Pierwsza osoba liczby pojedynczej ("ja/mój").

5. DŁUGOŚĆ: 400–1200 znaków łącznie. Przy skąpych danych pisz krócej
   ale rzetelnie. Nie rozdmuchuj treści wypełniaczem.

6. POPRAWNOŚĆ JĘZYKOWA: bez błędów ortograficznych i interpunkcyjnych.
   Polskie znaki diakrytyczne obowiązkowe (ą, ć, ę, ł, ń, ó, ś, ź, ż).
   Spójna interpunkcja w listach (każdy punkt zakończony lub każdy bez
   kropki — konsekwentnie).

7. WYJŚCIE: tylko surowy tekst gotowy do umieszczenia w textarea.
   Bez preamble ("Oto opis:"), bez cudzysłowów obejmujących całość,
   bez nagłówków markdown (# ##), bez emoji w lead i w nagłówkach
   sekcji (aplikacja sama dobiera ikonę nagłówka), bez JSON, bez
   komentarzy. Emoji w treści bulletów dopuszczalne wyłącznie według
   reguł z punktu 2.`

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
  opts: { maxTokens?: number } = {}
): Promise<{ text: string; usage?: ClaudeResponse['usage'] }> {
  const body = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1200,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT_PIN,
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

// ---------- HELPERS ----------

function cleanOutput(text: string): string {
  let t = String(text || '').trim()
  // Strip surrounding quotes
  t = t.replace(/^["'„«»]+/, '').replace(/["'„«»]+$/, '')
  // Strip preamble lines like "Oto opis:" / "Opis:"
  t = t.replace(/^(Oto[^\n]{0,40}:|Opis[^\n]{0,40}:)\s*\n+/i, '')
  // Strip markdown headers (# ##)
  t = t.replace(/^#{1,6}\s+/gm, '')
  // Normalize bullets to "• "
  t = t.replace(/^[ \t]*[*\-–—][ \t]+/gm, '• ')
  // Collapse 3+ newlines to 2
  t = t.replace(/\n{3,}/g, '\n\n')
  return t.trim().slice(0, MAX_DESC_CHARS)
}

function billingLabel(bt: string): string {
  const map: Record<string, string> = {
    hourly: 'fachowiec rozliczany godzinowo (ja → klient)',
    project: 'firma rozliczana za projekt (my → klient)',
    service: 'firma oferująca usługę (my → klient)',
    side: 'osoba dorabiająca po godzinach (ja → klient)',
    salary: 'firma zatrudniająca na etat (firma → kandydat)',
    company: 'firma B2B (my → klient)',
  }
  return map[bt] || 'fachowiec/firma oferujący usługi'
}

// ---------- ACTION HANDLERS ----------

interface GeneratePinPayload {
  categories?: string[]
  city?: string
  rateText?: string
  billingType?: string
  teamSize?: number
  oneLiner?: string
  highlights?: string
  tone?: string
}

async function handleGenerate(p: GeneratePinPayload): Promise<string> {
  const cats = (Array.isArray(p.categories) ? p.categories : [])
    .slice(0, 5)
    .map((s) => String(s).slice(0, 60))
    .join(', ')
  const city = String(p.city ?? '').slice(0, 80)
  const rateText = String(p.rateText ?? '').slice(0, 60)
  const billingType = String(p.billingType ?? 'hourly').slice(0, 20)
  const teamSize = Math.max(1, Math.min(50, parseInt(String(p.teamSize ?? 1), 10) || 1))
  const oneLiner = String(p.oneLiner ?? '').slice(0, 200).trim()
  const highlights = String(p.highlights ?? '').slice(0, 400).trim()
  const tone = ['plain', 'casual', 'pro'].includes(String(p.tone))
    ? String(p.tone)
    : 'plain'

  if (!oneLiner || oneLiner.length < 10) {
    throw new Error('oneLiner required (min 10 chars)')
  }

  const toneLabels: Record<string, string> = {
    plain: 'neutralny, rzeczowy, uniwersalny — równie odpowiedni dla klientów indywidualnych i biznesowych',
    casual: 'bezpośredni, przystępny — pasuje do klientów indywidualnych (osoby prywatne, seniorzy, rodzice). Bez slangu, bez infantylizacji',
    pro: 'profesjonalny, formalny — pasuje do klientów B2B, kontraktów firmowych, urzędów. Konkretne kompetencje i doświadczenie',
  }

  const teamLabel =
    teamSize >= 11
      ? `duża firma (${teamSize}+ osób)`
      : teamSize >= 6
      ? `brygada ${teamSize} osób`
      : teamSize >= 3
      ? `mały zespół ${teamSize} osób`
      : teamSize === 2
      ? '2 osoby'
      : 'osoba samodzielna (1 osoba)'

  const prompt = `Napisz opis ogłoszenia/pina na mapę MapJob.pl.

KONTEKST UŻYTKOWNIKA:
- Kategoria/zawód: ${cats || '(nieokreślony)'}
- Miasto: ${city || '(nieokreślone)'}
- Stawka/wynagrodzenie: ${rateText || '(nieokreślona)'}
- Tryb rozliczenia: ${billingLabel(billingType)} [${billingType}]
- Skala: ${teamLabel}
- Ton wypowiedzi: ${toneLabels[tone]}

CO UŻYTKOWNIK NAPISAŁ O SOBIE / SWOJEJ OFERCIE (jedno zdanie):
"""
${oneLiner}
"""

${highlights ? `WYRÓŻNIKI/DOŚWIADCZENIE PODANE PRZEZ UŻYTKOWNIKA:\n"""\n${highlights}\n"""\n` : ''}
ZASADY:
- Pisz w polskim, w 3 sekcjach z nagłówkami CAPS+"?".
- Bullety z "• " na początku linii.
- 400-1200 znaków łącznie.
- NIGDY nie wymyślaj liczb/lat/uprawnień/firm. Bazuj wyłącznie na powyższych danych.
- Dobierz sekcje pasujące do trybu rozliczenia (zob. system prompt).
- Pierwsza linia to lead bez nagłówka, max 120 znaków.
- Zwróć tylko surowy tekst opisu.`

  const { text } = await callClaude(prompt, { maxTokens: 1024 })
  return cleanOutput(text)
}

interface PolishPinPayload {
  rawText?: string
  categories?: string[]
  city?: string
  billingType?: string
}

async function handlePolish(p: PolishPinPayload): Promise<string> {
  const raw = String(p.rawText ?? '').slice(0, 2000).trim()
  if (!raw || raw.length < 20) {
    throw new Error('rawText required (min 20 chars)')
  }
  const cats = (Array.isArray(p.categories) ? p.categories : [])
    .slice(0, 5)
    .map((s) => String(s).slice(0, 60))
    .join(', ')
  const city = String(p.city ?? '').slice(0, 80)
  const billingType = String(p.billingType ?? 'hourly').slice(0, 20)

  const prompt = `Przepisz poniższy opis ogłoszenia na strukturyzowaną wersję
przyjazną dla aplikacji MapJob.pl.

KONTEKST:
- Kategoria/zawód: ${cats || '(nieokreślony)'}
- Miasto: ${city || '(nieokreślone)'}
- Tryb rozliczenia: ${billingLabel(billingType)} [${billingType}]

OBECNY TEKST UŻYTKOWNIKA:
"""
${raw}
"""

ZASADY PRZEPISYWANIA:
- ZACHOWAJ wszystkie konkretne fakty z oryginału (liczby, uprawnienia,
  doświadczenie, miasta, ceny). NIGDY nie dodawaj nowych liczb ani
  faktów których w oryginale nie ma. NIE wymyślaj lat doświadczenia
  ani liczby projektów jeśli ich nie ma w tekście.
- DODAJ strukturę: pierwsza linia jako lead, potem 3 sekcje z nagłówkami
  CAPS+"?" pasującymi do trybu rozliczenia, każda z 3-5 bulletami "• ".
- POPRAW język: usuń kalki, sztywne formułki, błędy ortograficzne.
- Długość: 400-1200 znaków.
- Jeśli oryginał ma mniej treści niż na 3 sekcje — zrób 2 sekcje
  zamiast wymyślać.
- Zwróć tylko surowy tekst opisu, bez preamble.`

  const { text } = await callClaude(prompt, { maxTokens: 1024 })
  return cleanOutput(text)
}

// ---------- JOB OFFER: generate description + requirements ----------

interface GenerateJobOfferPayload {
  title?: string
  companyName?: string
  category?: string
  city?: string
  employmentType?: string
  workMode?: string
  salaryText?: string
  oneLiner?: string
  reqHint?: string
}

async function handleGenerateJobOffer(p: GenerateJobOfferPayload): Promise<{ description: string; requirements: string }> {
  const title = String(p.title ?? '').slice(0, 120).trim()
  const company = String(p.companyName ?? '').slice(0, 120).trim()
  const category = String(p.category ?? '').slice(0, 40).trim()
  const city = String(p.city ?? '').slice(0, 80).trim()
  const empType = String(p.employmentType ?? '').slice(0, 30).trim()
  const workMode = String(p.workMode ?? '').slice(0, 20).trim()
  const salaryText = String(p.salaryText ?? '').slice(0, 60).trim()
  const oneLiner = String(p.oneLiner ?? '').slice(0, 400).trim()
  const reqHint = String(p.reqHint ?? '').slice(0, 400).trim()

  if (!title || title.length < 3) throw new Error('Podaj tytuł stanowiska (min 3 znaki)')
  if (!oneLiner || oneLiner.length < 10) throw new Error('Opisz krótko stanowisko (min 10 znaków)')

  const prompt = `Napisz OPIS i WYMAGANIA dla oferty pracy na MapJob.pl.

KONTEKST OFERTY:
- Stanowisko: ${title}
- Firma: ${company || '(nieokreślona)'}
- Kategoria: ${category || '(nieokreślona)'}
- Miasto: ${city || '(nieokreślone)'}
- Forma zatrudnienia: ${empType || '(nieokreślona)'}
- Tryb pracy: ${workMode || '(nieokreślony)'}
- Wynagrodzenie: ${salaryText || '(nieokreślone)'}

OPIS STANOWISKA OD UŻYTKOWNIKA:
"""
${oneLiner}
"""

${reqHint ? `WSKAZÓWKI DOT. WYMAGAŃ:\n"""\n${reqHint}\n"""\n` : ''}
ZWRÓĆ WYŁĄCZNIE JSON wg schematu:
{
  "description": string,    // opis stanowiska: 3 sekcje z nagłówkami CAPS+"?" ("CO BĘDZIESZ ROBIĆ?", "CO OFERUJEMY?", "DLACZEGO MY?"), każda 3-5 bulletów. Lead 1 linia max 120 znaków (może mieć emoji na początku, np. "🚛 Kierowca kat. C w Mannheim"). 400-1200 znaków łącznie.
  "requirements": string    // wymagania jako lista bulletów bez nagłówka, jedna linia każdy. Max 800 znaków.
}

BULLETY — ZASADA EMOJI (krytyczna):
- Każdy bullet zaczyna się od EMOJI dobranego kontekstowo do treści (nie "• "):
  - ✅ pozytywne cechy oferty (stałe zatrudnienie, gwarantowane, dyspozycyjność)
  - 💶 wynagrodzenie w € (zagranica) / 💰 wynagrodzenie w zł (Polska)
  - 📄 typ umowy / kontrakt
  - 🏠 zakwaterowanie / pokój
  - ⏰ godziny pracy / system zmianowy
  - 🚛 / 🚗 transport / pojazd / dojazd
  - ➕ dodatki / nadgodziny / premie / benefity
  - 📞 kontakt
  - 📍 lokalizacja
  - 🎓 wykształcenie / 📋 dokumenty / 🛡️ ubezpieczenie / 🤝 współpraca
- Format bulleta: "EMOJI Treść" (jeden emoji + spacja + treść).
- Nagłówki sekcji CAPS+"?" — BEZ emoji.

ZASADY:
- Pisz w drugiej osobie ("Ty/Ciebie/Twoje").
- NIGDY nie wymyślaj liczb, lat doświadczenia, uprawnień ani benefitów których nie ma w one-liner / reqHint.
- TYLKO informacje z kontekstu + sensowne ogólne sformułowania pasujące do stanowiska.
- Bez markdown, bez preambuły. JSON i tylko JSON.`

  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: 'Jesteś copywriterem ofert pracy dla MapJob.pl. Piszesz po polsku, konkretnie, profesjonalnie, w 2. osobie. Zwracasz wyłącznie JSON.', cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  }
  const resp = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) })
  if (!resp.ok) { const t = await resp.text().catch(() => ''); throw new Error(`Claude API ${resp.status}: ${t.slice(0, 240)}`) }
  const json: ClaudeResponse = await resp.json()
  if (json.error) throw new Error(`Claude error: ${json.error.message ?? json.error.type}`)
  let raw = (json.content ?? []).filter((c) => c.type === 'text' && c.text).map((c) => c.text).join('\n').trim()
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/); if (fence) raw = fence[1].trim()
  const i1 = raw.indexOf('{'), i2 = raw.lastIndexOf('}')
  if (i1 >= 0 && i2 > i1) raw = raw.slice(i1, i2 + 1)
  let parsed: any
  try { parsed = JSON.parse(raw) } catch (e) { throw new Error('AI returned malformed JSON: ' + ((e as Error).message || 'parse')) }
  return {
    description: String(parsed.description || '').slice(0, 1500).trim(),
    requirements: String(parsed.requirements || '').slice(0, 800).trim(),
  }
}

// ---------- JOB OFFER: polish existing description + requirements ----------

interface PolishJobOfferPayload {
  title?: string
  city?: string
  salaryText?: string
  description?: string
  requirements?: string
}

async function handlePolishJobOffer(p: PolishJobOfferPayload): Promise<{ description: string; requirements: string }> {
  const desc = String(p.description ?? '').slice(0, 2500).trim()
  const req = String(p.requirements ?? '').slice(0, 2500).trim()
  if (desc.length < 20 && req.length < 20) throw new Error('Napisz najpierw kilka zdań w opisie lub wymaganiach')
  const title = String(p.title ?? '').slice(0, 120).trim()
  const city = String(p.city ?? '').slice(0, 80).trim()
  const salaryText = String(p.salaryText ?? '').slice(0, 60).trim()

  const prompt = `Popraw poniższy OPIS i WYMAGANIA oferty pracy MapJob.pl — zachowując WSZYSTKIE konkretne fakty z oryginału.

KONTEKST:
- Stanowisko: ${title || '(nieokreślone)'}
- Miasto: ${city || '(nieokreślone)'}
- Wynagrodzenie: ${salaryText || '(nieokreślone)'}

OBECNY OPIS:
"""
${desc || '(pusty — wygeneruj nowy z kontekstu)'}
"""

OBECNE WYMAGANIA:
"""
${req || '(puste — wygeneruj wymagania pasujące do stanowiska)'}
"""

ZWRÓĆ WYŁĄCZNIE JSON wg schematu:
{
  "description": string,   // sformatowany opis: 3 sekcje CAPS+"?", lead 1 linia max 120 znaków (może mieć emoji na początku), 400-1200 znaków łącznie
  "requirements": string   // wymagania jako lista bulletów, max 800 znaków
}

BULLETY — ZASADA EMOJI (krytyczna):
- JEŚLI oryginał ma bullety z emoji (✅, 💶, 📄, ➕, 🏠, 🚛, ⏰ itp.) → ZACHOWAJ TE EMOJI, nie zamieniaj na "• ".
- JEŚLI oryginał ma "• " lub myślniki bez emoji → DOBIERZ emoji kontekstowo do treści:
  - ✅ pozytywne cechy oferty, gwarancje, stałe zatrudnienie
  - 💶 € (zagranica) / 💰 zł (Polska)
  - 📄 umowa, kontrakt
  - 🏠 zakwaterowanie, pokój
  - ⏰ godziny, system zmianowy
  - 🚛 / 🚗 transport, pojazd
  - ➕ dodatki, nadgodziny, premie
  - 📞 kontakt / 📍 lokalizacja / 🎓 wykształcenie / 📋 dokumenty / 🛡️ OC
- Format: "EMOJI Treść" (jeden emoji + spacja + treść).
- Nagłówki sekcji CAPS+"?" — BEZ emoji.

ZASADY:
- ZACHOWAJ wszystkie konkretne fakty z oryginału (liczby, uprawnienia, doświadczenie, miasta, ceny).
- POPRAW język: usuń kalki z angielskiego, sztywne formułki, błędy ortograficzne, infantylizmy.
- Pisz po polsku, w 2. osobie ("Ty/Ciebie").
- NIGDY nie wymyślaj nowych liczb / lat / uprawnień / certyfikatów których w oryginale nie ma.
- Bez markdown, bez preambuły. JSON i tylko JSON.`

  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: 'Jesteś redaktorem ofert pracy MapJob.pl. Poprawiasz język zachowując fakty. Zwracasz wyłącznie JSON.', cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  }
  const resp = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) })
  if (!resp.ok) { const t = await resp.text().catch(() => ''); throw new Error(`Claude API ${resp.status}: ${t.slice(0, 240)}`) }
  const json: ClaudeResponse = await resp.json()
  if (json.error) throw new Error(`Claude error: ${json.error.message ?? json.error.type}`)
  let raw = (json.content ?? []).filter((c) => c.type === 'text' && c.text).map((c) => c.text).join('\n').trim()
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/); if (fence) raw = fence[1].trim()
  const i1 = raw.indexOf('{'), i2 = raw.lastIndexOf('}')
  if (i1 >= 0 && i2 > i1) raw = raw.slice(i1, i2 + 1)
  let parsed: any
  try { parsed = JSON.parse(raw) } catch (e) { throw new Error('AI returned malformed JSON: ' + ((e as Error).message || 'parse')) }
  return {
    description: String(parsed.description || '').slice(0, 1500).trim(),
    requirements: String(parsed.requirements || '').slice(0, 800).trim(),
  }
}

// ---------- PARSE JOB OFFER (text / image / PDF → structured JSON) ----------

interface ParseJobOfferPayload {
  text?: string
  image?: { base64: string; mediaType?: string }
  pdf?: { base64: string }
}

interface ParsedJobOffer {
  title: string | null
  company_name: string | null
  category: string | null
  location: string | null
  location_zip: string | null
  location_street: string | null
  location_building: string | null
  employment_type: string | null
  work_mode: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  salary_type: string | null
  description: string | null
  requirements: string | null
  contact_phone: string | null
}

const PARSE_SYSTEM_PROMPT = `Jesteś parserem ogłoszeń o pracę dla MapJob.pl.
Wyciągasz dane ze źródła (tekst, zdjęcie ogłoszenia, PDF) i zwracasz
ścisły JSON wg schematu. NIGDY nie wymyślaj danych których nie ma
w źródle — dla nieobecnych pól zwróć null.

Zwróć WYŁĄCZNIE JSON, bez preambuły, bez markdown, bez komentarzy.

Schemat:
{
  "title": string | null,                // stanowisko np. "Operator produkcji"
  "company_name": string | null,         // nazwa firmy
  "category": string | null,             // KOD z listy poniżej
  "location": string | null,             // miasto np. "Krosno"
  "location_zip": string | null,         // "XX-XXX"
  "location_street": string | null,      // ulica np. "ul. Naftowa"
  "location_building": string | null,    // numer np. "7"
  "employment_type": "full_time"|"part_time"|"contract"|"temporary"|null,
  "work_mode": "onsite"|"remote"|"hybrid"|null,
  "salary_min": number | null,
  "salary_max": number | null,
  "salary_currency": "PLN"|"EUR"|"USD"|"GBP"|"CHF"|"SEK"|"NOK"|"DKK"|"CZK"|null,
  "salary_type": "monthly"|"hourly"|"daily"|"project"|null,
  "description": string | null,          // 3 sekcje CAPS+"?" + bullety "• "
  "requirements": string | null,         // lista bulletów "• "
  "contact_phone": string | null
}

KATEGORIE (zwróć JEDEN kod, najbardziej pasujący do stanowiska):
electric — Elektryk / Automatyk / Energetyk / SEP
plumber — Hydraulik / CO / Instalator wod-kan
hvac — Klimatyzacja / Wentylacja / HVAC / Chłodnictwo
ev — Fotowoltaika / OZE / Pompy ciepła
gas — Gazownik / Instalator gazu
construction — Budownictwo / Wykończenia / Remont / Murarz / Tynkarz / Brygadzista
welder — Spawacz / Ślusarz / CNC / Operator obrabiarki / Tokarz / Frezer
carpenter — Stolarz / Cieśla / Tapicer
roofer — Dekarz / Pokrycia dachowe
painter — Malarz pokojowy / Wykończenia
tiler — Glazura / Posadzki / Płytkarz
glass — Szklarz / Okna / Elewacja
auto — Mechanik samochodowy / Lakiernik / Diagnosta / Motoryzacja
it — IT / Programista / Java / Python / Frontend / Sysadmin / DevOps / Tester / Marketing cyfrowy
driver — Kierowca C / C+E / B / Tirowiec / Dostawca / Kurier
logistics — Magazynier / Logistyka / Operator wózka widłowego / Pakowacz
industry — Operator produkcji / Pracownik fizyczny / Przemysł / Linia produkcyjna / Mistrz zmiany
gastro — Kucharz / Kelner / Barman / Hotelarstwo / Pomoc kuchenna / Bufetowa
beauty — Fryzjer / Kosmetyczka / Manicure / Stylista
health — Lekarz / Pielęgniarka / Fizjoterapeuta / Opiekun medyczny / Ratownik
care — Niania / Pomoc domowa / Opiekun seniora / Au-pair
cleaning — Sprzątanie / Pralnia / DDD / Konserwator
garden — Ogrodnik / Pielęgnacja zieleni
security — Ochrona / BHP / Stróż
finance — Księgowy / Finanse / HR / Doradca / Bankier
legal — Prawnik / Notariusz / Pośrednik nieruchomości
arch — Architekt / Projektant wnętrz / Konstruktor
design — Grafik / Florysta / 3D / Animator
media — Fotograf / Operator / Marketing / PR / Social media
edu — Nauczyciel / Korepetytor / Lektor
office — Biuro / Administracja / Asystentka / Tłumacz / Recepcja
sales — Sprzedawca / Kasjer / Doradca klienta / Konsultant / Hostess
crafts — Krawiec / Szewc / Jubiler / Rzemiosło artystyczne
agri — Rolnictwo / Las / Weterynaria / Hodowla
other — Inne (tylko gdy NIC z powyższego nie pasuje)

ZASADY EKSTRAKCJI:

WYNAGRODZENIE:
- "5 200 - 6 800 zł" → min=5200, max=6800, currency="PLN"
- "od 30 zł/h netto" → min=30, max=null, salary_type="hourly", currency="PLN"
- "12 € / godz." → currency="EUR", salary_type="hourly"
- "do 8 000 zł" → min=null, max=8000
- "ok. 5500 zł" → min=5500, max=5500
- "konkurencyjne" / "atrakcyjne" / brak liczb → wszystkie pola salary = null
- Domyślny salary_type to "monthly" gdy nie wskazano inaczej.

FORMA ZATRUDNIENIA:
- "umowa o pracę" / "etat" / "UoP" → "full_time"
- "1/2 etatu" / "część etatu" / "0,5 etatu" / "part-time" → "part_time"
- "B2B" / "kontrakt" / "samozatrudnienie" → "contract"
- "umowa zlecenie" / "tymczasowa" / "krótkoterminowo" → "temporary"

TRYB PRACY:
- "stacjonarna" / "praca w biurze" / "zmianowa" / brak info → "onsite"
- "zdalna" / "remote" / "praca z domu" → "remote"
- "hybrydowa" / "hybrid" → "hybrid"

LOKALIZACJA:
- Wyciągnij miasto główne (jeśli kilka, weź pierwsze).
- Jeśli jest pełny adres "ul. Naftowa 7, 38-400 Krosno" → location="Krosno", location_street="ul. Naftowa", location_building="7", location_zip="38-400"
- Jeśli sam adres "Krosno" — location="Krosno", reszta null

OPIS:
- Sformatuj jako 3 sekcje. Pierwsza linia: lead (max 120 znaków, bez nagłówka). Lead MOŻE mieć emoji na początku (np. "🚛 Kierowca kat. C w Mannheim").
- Pusta linia. Nagłówek CAPS+"?": "CO BĘDZIESZ ROBIĆ?" / "CO ROBIĘ?" + 3-5 bulletów (max 140 znaków każdy).
- Pusta linia. Nagłówek: "CZEGO POTRZEBUJESZ?" + 3-5 bulletów (LUB pominąć jeśli wymagania trafiają do osobnego pola requirements).
- Pusta linia. Nagłówek: "CO OFERUJEMY?" + 3-5 bulletów.
- TYLKO informacje ze źródła, ZERO wymyślania liczb/lat/uprawnień.

BULLETY — ZASADA EMOJI (ważne):
- JEŚLI w źródle są bullety z emoji (✅, 💶, 📄, ➕, 🏠, 🚛, ⏰ itp.) → ZACHOWAJ TE EMOJI jako prefix bulleta zamiast "• ".
- JEŚLI źródło ma "• " lub myślniki bez emoji → DOBIERZ emoji kontekstowo do treści bulleta:
  - ✅ pozytywne cechy oferty (stałe zatrudnienie, gwarantowane, premia)
  - 💶 wynagrodzenie w € (zagranica)
  - 💰 wynagrodzenie w zł (Polska)
  - 📄 typ umowy / kontrakt
  - 🏠 zakwaterowanie / pokój / mieszkanie
  - ⏰ godziny pracy / harmonogram / system zmianowy
  - 🚛 / 🚗 transport, dojazd, pojazd służbowy
  - ➕ dodatki / benefity / nadgodziny
  - 📞 kontakt telefoniczny
  - 📍 lokalizacja / obszar pracy
  - 🇩🇪 / 🇳🇱 / 🇵🇱 / 🇺🇦 flaga kraju jeśli oferta międzynarodowa
- Format bulleta: "EMOJI Treść" (emoji + spacja + treść). Jeden emoji na bullet, na początku.
- Nagłówki sekcji CAPS+"?" → BEZ emoji.

WYMAGANIA (osobne pole `requirements`): krótkie bullety, jedna linia każdy. Stosuj te same zasady emoji co w opisie — zachowaj z oryginału lub dobierz kontekstowo (✅ uprawnienia, 📋 dokumenty, 🎓 wykształcenie itp.).

TELEFON: znormalizuj do "+48 XXX XXX XXX" jeśli polski 9-cyfrowy. Zagraniczne zostaw jak są. Bez emaila tutaj.`

async function handleParseJobOffer(p: ParseJobOfferPayload): Promise<ParsedJobOffer> {
  const text = typeof p.text === 'string' ? p.text.trim() : ''
  const hasText = text.length >= 20
  const hasImage = !!(p.image && p.image.base64)
  const hasPdf = !!(p.pdf && p.pdf.base64)

  if (!hasText && !hasImage && !hasPdf) {
    throw new Error('Provide text (min 20 chars), image, or PDF')
  }

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY missing on server')
  }

  // Build user message content
  const content: any[] = []
  if (hasImage) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: p.image!.mediaType || 'image/jpeg',
        data: p.image!.base64,
      },
    })
  }
  if (hasPdf) {
    content.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: p.pdf!.base64,
      },
    })
  }
  let instr = 'Sparsuj ogłoszenie i zwróć JSON wg schematu.'
  if (hasText && (hasImage || hasPdf)) instr = 'Sparsuj ogłoszenie (źródło: ' + (hasImage ? 'zdjęcie' : 'PDF') + ' + tekst pomocniczy). Zwróć JSON wg schematu.\n\nTekst pomocniczy:\n' + text.slice(0, 6000)
  else if (hasText) instr = 'Sparsuj poniższe ogłoszenie i zwróć JSON wg schematu.\n\n' + text.slice(0, 8000)
  else if (hasImage) instr = 'Źródło: zdjęcie ogłoszenia. OCR + sparsuj. Zwróć JSON wg schematu.'
  else instr = 'Źródło: PDF z ogłoszeniem. Przeczytaj i sparsuj. Zwróć JSON wg schematu.'
  content.push({ type: 'text', text: instr })

  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: PARSE_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content }],
  }

  let resp: Response
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })
  } catch (netErr) {
    throw new Error('Brak połączenia z Anthropic API: ' + ((netErr as Error).message || 'fetch failed'))
  }
  if (!resp.ok) {
    const t = await resp.text().catch(() => '')
    console.error('[parse_job_offer] Anthropic non-OK:', resp.status, t.slice(0, 500))
    throw new Error(`Claude API ${resp.status}: ${t.slice(0, 280)}`)
  }
  let json: ClaudeResponse
  try {
    json = await resp.json()
  } catch (jsonErr) {
    throw new Error('Anthropic zwrócił niepoprawny JSON: ' + ((jsonErr as Error).message || 'parse'))
  }
  if (json.error) {
    console.error('[parse_job_offer] Anthropic json.error:', json.error)
    throw new Error(`Claude error: ${json.error.message ?? json.error.type ?? 'unknown'}`)
  }

  let raw =
    (json.content ?? [])
      .filter((c) => c.type === 'text' && c.text)
      .map((c) => c.text)
      .join('\n')
      .trim()

  if (!raw) {
    console.error('[parse_job_offer] empty content from Anthropic, response:', JSON.stringify(json).slice(0, 500))
    throw new Error('Anthropic zwrócił pustą odpowiedź — spróbuj ponownie')
  }

  // Strip markdown fences
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) raw = fence[1].trim()
  // Slice to outermost JSON object
  const i1 = raw.indexOf('{')
  const i2 = raw.lastIndexOf('}')
  if (i1 >= 0 && i2 > i1) raw = raw.slice(i1, i2 + 1)

  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    console.error('[parse_job_offer] JSON parse failed. raw (first 500):', raw.slice(0, 500))
    throw new Error('AI returned malformed JSON: ' + ((e as Error).message || 'parse error') + ' | start: ' + raw.slice(0, 80))
  }

  const ALLOW_CAT = ['electric','plumber','hvac','ev','gas','construction','welder','carpenter','roofer','painter','tiler','glass','auto','it','driver','logistics','industry','gastro','beauty','health','care','cleaning','garden','security','finance','legal','arch','design','media','edu','office','sales','crafts','agri','other']
  const ALLOW_EMP = ['full_time','part_time','contract','temporary']
  const ALLOW_MODE = ['onsite','remote','hybrid']
  const ALLOW_CUR = ['PLN','EUR','USD','GBP','CHF','SEK','NOK','DKK','CZK']
  const ALLOW_STYPE = ['monthly','hourly','daily','project']

  const ss = (v: any, max = 200): string | null => {
    if (v === null || v === undefined) return null
    const t = String(v).trim()
    return t ? t.slice(0, max) : null
  }
  const nn = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null
    const x = parseFloat(String(v).replace(/[\s ]/g, '').replace(',', '.'))
    return Number.isFinite(x) ? x : null
  }
  const pick = (v: any, list: string[]): string | null => {
    if (!v) return null
    const t = String(v).toLowerCase().trim()
    return list.includes(t) ? t : null
  }

  return {
    title: ss(parsed.title, 120),
    company_name: ss(parsed.company_name, 120),
    category: pick(parsed.category, ALLOW_CAT) || (parsed.title ? 'other' : null),
    location: ss(parsed.location, 100),
    location_zip: ss(parsed.location_zip, 10),
    location_street: ss(parsed.location_street, 100),
    location_building: ss(parsed.location_building, 20),
    employment_type: pick(parsed.employment_type, ALLOW_EMP),
    work_mode: pick(parsed.work_mode, ALLOW_MODE),
    salary_min: nn(parsed.salary_min),
    salary_max: nn(parsed.salary_max),
    salary_currency: (function(){ const v = String(parsed.salary_currency || '').toUpperCase().trim(); return ALLOW_CUR.includes(v) ? v : null; })(),
    salary_type: pick(parsed.salary_type, ALLOW_STYPE),
    description: ss(parsed.description, 1500),
    requirements: ss(parsed.requirements, 800),
    contact_phone: ss(parsed.contact_phone, 40),
  }
}

// ---------- PARSE TENDER (Giełda Zleceń) ----------

interface ParseTenderPayload {
  text?: string
  image?: { base64: string; mediaType?: string }
  pdf?: { base64: string }
}

interface ParsedTender {
  title: string | null
  description: string | null
  category: string | null
  tender_type: string | null
  city: string | null
  zip: string | null
  street: string | null
  building: string | null
  budget_mode: string | null
  budget_min: number | null
  budget_max: number | null
  budget_currency: string | null
  deadline_days: number | null
  contact_phone: string | null
}

const PARSE_TENDER_SYSTEM_PROMPT = `Jesteś parserem ZLECEŃ (Giełda Zleceń MapJob.pl). Klient publikuje zlecenie — szuka wykonawcy / fachowca do zrobienia czegoś (np. remont, instalacja, transport, sprzątanie). NIE jest to oferta pracy — to zapytanie ofertowe od klienta.

NIGDY nie wymyślaj danych — dla nieobecnych pól zwróć null. Zwróć WYŁĄCZNIE JSON.

Schemat: { "title": str|null, "description": str|null, "category": str|null, "tender_type": "private"|"company"|"public"|"valuation"|null, "city": str|null, "zip": str|null, "street": str|null, "building": str|null, "budget_mode": "fixed"|"open"|null, "budget_min": num|null, "budget_max": num|null, "budget_currency": "PLN"|"EUR"|"GBP"|"CHF"|null, "deadline_days": 7|14|30|60|90|180|null, "contact_phone": str|null }

KATEGORIE (zwróć JEDEN kod):
construction (budowa / generalny wykonawca), painting (malowanie / tynkowanie), tiling (glazura / terakota), floors (podłogi / posadzki), windows (okna / drzwi), roof (dach / rynny), carpenter (stolarka / meble), welder (spawanie / konstrukcje), masonry (murowanie / brukarstwo), insulation (ocieplenia / izolacje), demolition (wyburzenia / rozbiórki), electric (instalacje elektryczne), plumber (hydraulika / CO), hvac (klimatyzacja / wentylacja), pv (fotowoltaika), gas (gaz / kotłownie), alarm (alarmy / monitoring / smart home), driver (transport / przeprowadzki), logistics (magazyn / logistyka), auto (mechanik / serwis aut), garden (ogród / elewacja), cleaning (sprzątanie / pralnia / DDD), security (ochrona / BHP), it (IT / programowanie), media (foto / video / marketing), design (grafika / branding / 3D), office (biuro / tłumaczenia), finance (księgowość / doradztwo), legal (prawo / nieruchomości), arch (architekt / projekt), gastro (catering / eventy), beauty (uroda / stylizacja), health (zdrowie / fizjoterapia), care (opieka / pomoc domowa), edu (korepetycje / szkolenia), crafts (krawiec / szewc / jubiler), other.

TENDER_TYPE:
- "private" — klient prywatny / dom prywatny / mieszkanie (DOMYŚLNIE jeśli niejasne)
- "company" — firma B2B / spółka / NIP / fakturę VAT
- "public" — przetarg publiczny / urząd / instytucja publiczna
- "valuation" — sama wycena / pytanie / "ile kosztuje"

BUDŻET — BARDZO WAŻNE:
- Jeśli SĄ liczby (np. "3000-5000 zł", "do 10 tys", "20 000 PLN") → budget_mode="fixed" + budget_min/max + currency.
- Jeśli NIE MA liczb (np. "proszę o wycenę", "ile kosztuje", "do uzgodnienia") → budget_mode="open", min/max=null, currency=null.
- Currency ZAWSZE 3 duże litery: PLN/EUR/GBP/CHF. Nie zwracaj symboli (zł, €, £).
- Domyślnie PLN dla Polski.

DEADLINE — mapuj na liczbę dni:
- "pilne" / "ASAP" / "w tym tygodniu" → 7
- "2 tygodnie" → 14
- "miesiąc" → 30
- "1-2 miesiące" → 60
- "3 miesiące" / "kwartał" → 90
- "pół roku" / "elastyczny" / brak → null lub 180

LOKALIZACJA:
- Pełen adres "ul. Długa 5, 50-001 Wrocław" → city="Wrocław", street="ul. Długa", building="5", zip="50-001".
- Sam adres miasto "Kraków" → city="Kraków", reszta null.
- Region/województwo bez miasta → city = nazwa regionu.

OPIS (description) — ZASADA EMOJI:
- JEŚLI w źródle są bullety z emoji → ZACHOWAJ TE EMOJI w opisie, NIE zamieniaj na "• ".
- JEŚLI źródło jest pełnym tekstem bez bulletów → sformatuj jako 2-3 sekcje CAPS+"?" z bulletami z emoji (kontekstowe: 🔨 zakres prac, 📐 wymiary, 📦 materiały, ⏰ termin, 💰 budżet, 📍 lokalizacja).
- Sekcje dla zleceń: "CO TRZEBA ZROBIĆ?", "JAKI ZAKRES?", "CO ZAPEWNIAM?" (jeśli klient daje materiał) lub "JAK SIĘ ZGŁOSIĆ?".
- Format bulleta: "EMOJI Treść". Lead 1 linia max 120 znaków (może mieć emoji na początku).
- Nagłówki CAPS+"?" — BEZ emoji.

TELEFON: polski 9-cyfrowy → "+48 XXX XXX XXX". Zagraniczne zostaw jak są.`

async function handleParseTender(p: ParseTenderPayload): Promise<ParsedTender> {
  const text = typeof p.text === 'string' ? p.text.trim() : ''
  const hasText = text.length >= 20
  const hasImage = !!(p.image && p.image.base64)
  const hasPdf = !!(p.pdf && p.pdf.base64)
  if (!hasText && !hasImage && !hasPdf) throw new Error('Provide text (min 20 chars), image, or PDF')
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY missing on server')

  const content: any[] = []
  if (hasImage) content.push({ type: 'image', source: { type: 'base64', media_type: p.image!.mediaType || 'image/jpeg', data: p.image!.base64 } })
  if (hasPdf) content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: p.pdf!.base64 } })
  let instr = 'Sparsuj zlecenie i zwróć JSON wg schematu.'
  if (hasText) instr = 'Sparsuj poniższe zlecenie (Giełda Zleceń) i zwróć JSON wg schematu. JEŚLI w tekście są emoji-bullety — ZACHOWAJ je.\n\n' + text.slice(0, 8000)
  content.push({ type: 'text', text: instr })

  const body = { model: MODEL, max_tokens: 2048, system: [{ type: 'text', text: PARSE_TENDER_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content }] }
  let resp: Response
  try { resp = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) }) }
  catch (netErr) { throw new Error('Brak połączenia z Anthropic API: ' + ((netErr as Error).message || 'fetch failed')) }
  if (!resp.ok) { const t = await resp.text().catch(() => ''); console.error('[parse_tender] Anthropic non-OK:', resp.status, t.slice(0, 500)); throw new Error(`Claude API ${resp.status}: ${t.slice(0, 280)}`) }
  let json: ClaudeResponse
  try { json = await resp.json() } catch (jsonErr) { throw new Error('Anthropic zwrócił niepoprawny JSON: ' + ((jsonErr as Error).message || 'parse')) }
  if (json.error) throw new Error(`Claude error: ${json.error.message ?? json.error.type ?? 'unknown'}`)

  let raw = (json.content ?? []).filter((c) => c.type === 'text' && c.text).map((c) => c.text).join('\n').trim()
  if (!raw) throw new Error('Anthropic zwrócił pustą odpowiedź — spróbuj ponownie')
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/); if (fence) raw = fence[1].trim()
  const i1 = raw.indexOf('{'), i2 = raw.lastIndexOf('}')
  if (i1 >= 0 && i2 > i1) raw = raw.slice(i1, i2 + 1)
  let parsed: any
  try { parsed = JSON.parse(raw) } catch (e) { throw new Error('AI returned malformed JSON: ' + ((e as Error).message || 'parse')) }

  const ALLOW_T_CAT = ['construction','painting','tiling','floors','windows','roof','carpenter','welder','masonry','insulation','demolition','electric','plumber','hvac','pv','gas','alarm','driver','logistics','auto','garden','cleaning','security','it','media','design','office','finance','legal','arch','gastro','beauty','health','care','edu','crafts','other']
  const ALLOW_T_TYPE = ['private','company','public','valuation']
  const ALLOW_T_MODE = ['fixed','open']
  const ALLOW_T_CUR = ['PLN','EUR','GBP','CHF']
  const ALLOW_DEADLINE = [7,14,30,60,90,180]

  const ss = (v: any, max = 200): string | null => { if (v == null) return null; const t = String(v).trim(); return t ? t.slice(0, max) : null }
  const nn = (v: any): number | null => { if (v == null || v === '') return null; const x = parseFloat(String(v).replace(/[\s ]/g, '').replace(',', '.')); return Number.isFinite(x) ? x : null }
  const pick = (v: any, list: string[]): string | null => { if (!v) return null; const t = String(v).toLowerCase().trim(); return list.includes(t) ? t : null }
  const pickCurrency = (v: any): string | null => {
    if (!v) return null
    const t = String(v).toUpperCase().trim()
    if (ALLOW_T_CUR.includes(t)) return t
    if (t === 'ZŁ' || t === 'ZL' || t === 'PLZ') return 'PLN'
    if (t === '€' || t === 'EURO') return 'EUR'
    if (t === '£') return 'GBP'
    return null
  }
  const pickDeadline = (v: any): number | null => {
    if (v == null) return null
    const n = parseInt(String(v), 10)
    if (!Number.isFinite(n)) return null
    if (ALLOW_DEADLINE.includes(n)) return n
    // snap to nearest allowed
    return ALLOW_DEADLINE.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p, ALLOW_DEADLINE[0])
  }

  return {
    title: ss(parsed.title, 120),
    description: ss(parsed.description, 1500),
    category: pick(parsed.category, ALLOW_T_CAT) || (parsed.title ? 'other' : null),
    tender_type: pick(parsed.tender_type, ALLOW_T_TYPE) || 'private',
    city: ss(parsed.city, 100),
    zip: ss(parsed.zip || parsed.location_zip, 10),
    street: ss(parsed.street || parsed.location_street, 100),
    building: ss(parsed.building || parsed.location_building, 20),
    budget_mode: pick(parsed.budget_mode, ALLOW_T_MODE),
    budget_min: nn(parsed.budget_min),
    budget_max: nn(parsed.budget_max),
    budget_currency: pickCurrency(parsed.budget_currency),
    deadline_days: pickDeadline(parsed.deadline_days),
    contact_phone: ss(parsed.contact_phone, 40),
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

    const supaAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
    )
    try {
      const { data: calls } = await supaAdmin.rpc('pin_write_calls_last_24h', {
        p_user_id: user.id,
      })
      const n = typeof calls === 'number' ? calls : parseInt(String(calls ?? 0), 10)
      if (n >= MAX_CALLS_24H) {
        return new Response(
          JSON.stringify({ error: `Rate limit exceeded (${MAX_CALLS_24H}/24h)` }),
          {
            status: 429,
            headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
          }
        )
      }
    } catch (_e) {
      console.error('[pin-write] rate-limit RPC failed (fail-closed):', (_e as Error).message)
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action ?? '')
    const payload = body?.payload ?? {}

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
        }
      )
    }

    let result: any
    let billingType = ''
    let nChars = 0
    switch (action) {
      case 'generate_pin_description':
        result = await handleGenerate(payload as GeneratePinPayload)
        billingType = String((payload as GeneratePinPayload).billingType ?? '')
        nChars = typeof result === 'string' ? result.length : 0
        break
      case 'polish_pin_description':
        result = await handlePolish(payload as PolishPinPayload)
        billingType = String((payload as PolishPinPayload).billingType ?? '')
        nChars = typeof result === 'string' ? result.length : 0
        break
      case 'parse_job_offer':
        result = await handleParseJobOffer(payload as ParseJobOfferPayload)
        billingType = 'parse'
        nChars = (result?.description?.length || 0) + (result?.requirements?.length || 0)
        break
      case 'parse_tender':
        result = await handleParseTender(payload as ParseTenderPayload)
        billingType = 'parse_tender'
        nChars = (result?.description?.length || 0)
        break
      case 'generate_job_offer':
        result = await handleGenerateJobOffer(payload as GenerateJobOfferPayload)
        billingType = 'generate_job'
        nChars = (result?.description?.length || 0) + (result?.requirements?.length || 0)
        break
      case 'polish_job_offer':
        result = await handlePolishJobOffer(payload as PolishJobOfferPayload)
        billingType = 'polish_job'
        nChars = (result?.description?.length || 0) + (result?.requirements?.length || 0)
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

    // Zapis eventu do rate-limitu (best-effort).
    try {
      await supaAdmin.from('user_events').insert({
        user_id: user.id,
        event_type: 'pin_write_call',
        metadata: { action, billing_type: billingType, n_chars: nChars },
      })
    } catch (_ignore) {}

    return new Response(JSON.stringify({ result, meta: { model: MODEL } }), {
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  } catch (err) {
    const e = err as Error
    console.error('[pin-write] caught error:', e.name, e.message, '\nstack:', e.stack)
    return new Response(
      JSON.stringify({
        error: e.message || 'Request failed — try again.',
        error_name: e.name || 'Error',
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      }
    )
  }
})
