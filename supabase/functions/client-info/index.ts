// Supabase Edge Function: client-info
// Deploy: supabase functions deploy client-info --no-verify-jwt
// Env: IP_HASH_SALT (set via: supabase secrets set IP_HASH_SALT='<random-32-bytes>')
//
// Purpose: zwraca hash IP + kraj na podstawie nagłówków proxy (Vercel/Cloudflare).
// Używane przez index.html zaraz po _startSession() aby wzbogacić rekord w
// public.user_sessions o ip_hash + country (RODO: tylko hash, raw IP nie leży w DB).
//
// Frontend wywołuje to przez supabase.functions.invoke('client-info') — JWT optional
// (anon też mogą, bo trackowanie sesji obejmuje gości).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SALT = Deno.env.get('IP_HASH_SALT') ?? 'mapjob-default-salt-change-me'

// Read client IP from proxy headers in order of trust:
//   cf-connecting-ip   (Cloudflare, most reliable)
//   x-vercel-forwarded-for (Vercel)
//   x-real-ip          (nginx)
//   x-forwarded-for    (generic — first entry is real client)
function readClientIp(req: Request): string | null {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const vercel = req.headers.get('x-vercel-forwarded-for')
  if (vercel) return vercel.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return null
}

function readCountry(req: Request): string | null {
  // Cloudflare: cf-ipcountry. Vercel: x-vercel-ip-country.
  const cf = req.headers.get('cf-ipcountry')
  if (cf && cf !== 'XX') return cf
  const v = req.headers.get('x-vercel-ip-country')
  if (v) return v
  return null
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }

  const ip = readClientIp(req)
  const country = readCountry(req)

  // Hash 12-char prefix is enough to spot revisits but reduces fingerprintability vs full hash.
  // Salt makes rainbow-table reversal infeasible even if DB leaks.
  const ipHash = ip ? (await sha256Hex(ip + '|' + SALT)).slice(0, 16) : null

  // Optional: caller may pass session_id and we update the row server-side
  // (saves a roundtrip + ensures the user can't fake their own ip_hash via direct PATCH).
  let sessionId: string | null = null
  try {
    const body = await req.json().catch(() => ({}))
    sessionId = typeof body.session_id === 'string' ? body.session_id : null
  } catch (_e) { /* no body */ }

  if (sessionId && ipHash) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    // Best-effort update — ignore errors (session may not exist yet, RLS quirks, etc.)
    const { error } = await supabase
      .from('user_sessions')
      .update({ ip_hash: ipHash, country })
      .eq('id', sessionId)
      .is('ip_hash', null) // only set once per session — never overwrite
    if (error) console.warn('[client-info] update session failed:', error.message)
  }

  return new Response(
    JSON.stringify({ ip_hash: ipHash, country }),
    { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
