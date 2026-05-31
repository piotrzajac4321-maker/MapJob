// Supabase Edge Function: cv-parse
// Deploy: supabase functions deploy cv-parse --no-verify-jwt
// Env (ustaw w: supabase secrets set ...):
//   ANTHROPIC_API_KEY        - sk-ant-... (z console.anthropic.com)
//   SUPABASE_URL             - auto
//   SUPABASE_ANON_KEY        - auto (do sprawdzenia user session)
//
// Body: { text: string }
// Auth: wymagany header Authorization: Bearer <user_session_jwt>
// verify_jwt=false z powodu ES256 runtime limit; user weryfikowany przez getUser()

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `Jesteś ekspertem w parsowaniu polskich i zagranicznych CV (fachowcy, technicy, inżynierowie, handlowcy itp.).
Wyciągnij z tekstu CV dokładne dane w formacie JSON. Jeśli czegoś nie ma — pomiń klucz (NIE dawaj pustych stringów ani null).

Zwracasz WYŁĄCZNIE obiekt JSON bez markdown, bez komentarzy. Schemat:
{
  "name": "Imię Nazwisko",
  "role": "Stanowisko / zawód (np. Elektryk, Spawacz TIG, Senior Developer)",
  "city": "Miasto zamieszkania",
  "phone": "+48123456789 lub sam numer",
  "email": "user@example.com",
  "langs": "Polski C2, Angielski B2, Niemiecki A2",
  "certs": "UDT wózki, SEP do 1kV, BHP, ISO 9001",
  "specs": "krótka lista 3-8 specjalizacji/umiejętności rozdzielonych przecinkami — NIE narracja, tylko tagi",
  "countries": "PL, DE, NL (ISO kody krajów gdzie pracował / gotów pracować)",
  "dailyRate": "450 zł/dzień lub 100 EUR/dzień",
  "monthlyRate": "8000 zł/mies. lub 2500 EUR/mies.",
  "availFrom": "od zaraz lub 01.06.2026",
  "mobility": "prawo jazdy B, własny samochód, delegacje",
  "employType": "B2B, UoP, Zlecenie, Kontrakt"
}

Zasady:
- specs: KRYTYCZNE — to LISTA TAGÓW rozdzielonych przecinkami, np.
    DOBRZE: "Spawanie TIG, AutoCAD, Lutowanie, Czytanie rysunku technicznego"
    DOBRZE: "React, TypeScript, PostgreSQL, REST API, Docker"
    ŹLE:    "Moją specjalizacją jest tworzenie wartości dla klientów"
    ŹLE:    "Jestem komunikatywny i sumienny, praca przyniesie wymierne korzyści"
  Każdy tag = max 6 słów. Cała wartość = max 200 znaków.
  NIGDY zdania w pierwszej osobie (jestem/posiadam/mam/moja/pracuję).
  NIGDY narracji, prozy, "O mnie", celu zawodowego.
  Jeśli CV nie ma sekcji ze skill-listą, a tylko narracyjny "O mnie" — POMIŃ klucz specs.
- certs: lista rozdzielona przecinkami, konkretne nazwy uprawnień
- langs: każdy język z poziomem (A1/A2/B1/B2/C1/C2/native) jeśli podany
- role: ten aktualny/najwyższy, nie historia kariery
- phone: usuń spacje i myślniki, zostaw + jeśli jest prefix kraju
- countries: TYLKO 2-literowe kody ISO (PL, DE, NL, AT, CH, BE, FR, NO, SE, UK, DK, FI, CZ, SK, IT, ES)
- dailyRate/monthlyRate: tylko jeśli JAWNIE podane w CV (nie zgaduj)
- Jeśli wartość jest niepewna lub wywnioskowana — pomiń klucz`

interface ClaudeResponse {
  content?: Array<{ type: string; text?: string }>
  error?: { message?: string; type?: string }
}

async function callClaude(cvText: string): Promise<Record<string, string>> {
  const trimmed = cvText.length > 12000 ? cvText.slice(0, 12000) : cvText
  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Oto tekst CV do sparsowania:\n\n---\n${trimmed}\n---\n\nZwróć tylko JSON.`,
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
  const data = (await resp.json()) as ClaudeResponse
  if (!resp.ok) {
    throw new Error('Claude API error: ' + (data.error?.message || resp.status))
  }
  const textBlock = data.content?.find((c) => c.type === 'text')?.text || ''
  const jsonStart = textBlock.indexOf('{')
  const jsonEnd = textBlock.lastIndexOf('}')
  if (jsonStart < 0 || jsonEnd < 0) {
    throw new Error('Claude did not return JSON')
  }
  const jsonStr = textBlock.slice(jsonStart, jsonEnd + 1)
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>
  const out: Record<string, string> = {}
  const allowed = [
    'name', 'role', 'city', 'phone', 'email', 'langs', 'certs',
    'specs', 'countries', 'dailyRate', 'monthlyRate', 'availFrom',
    'mobility', 'employType',
  ]
  for (const k of allowed) {
    const v = parsed[k]
    if (typeof v === 'string') {
      const trimmedV = v.trim()
      if (trimmedV) out[k] = trimmedV.slice(0, 400)
    }
  }
  return out
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userErr } = await sb.auth.getUser()
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  let body: { text?: string } = {}
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
  const text = (body.text || '').trim()
  if (text.length < 30) {
    return new Response(JSON.stringify({ error: 'Text too short' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
  if (text.length > 50000) {
    return new Response(JSON.stringify({ error: 'Text too long (max 50k chars)' }), {
      status: 413,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  try {
    const parsed = await callClaude(text)
    return new Response(JSON.stringify({ ok: true, parsed }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[cv-parse] error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
})
