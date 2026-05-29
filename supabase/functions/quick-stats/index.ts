// quick-stats Edge Function — PIN-only access to admin stats (no Supabase auth session needed).
//
// Actions:
//   send_pin    → generate OTP, send SMS, store hash server-side
//   verify_pin  → verify OTP, return session token + stats
//   get_stats   → refresh stats using session token (valid 24 h)

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SB_URL      = Deno.env.get('SUPABASE_URL') ?? ''
const SB_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ADMIN_PHONE = '721580611'
const SESSION_H   = 24  // session token valid for 24 hours

const sb = createClient(SB_URL, SB_SERVICE)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function resp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function hashPin(pin: string): Promise<string> {
  // Use last 12 chars of service key as pepper so the hash is server-only knowledge.
  const raw = new TextEncoder().encode(pin + SB_SERVICE.slice(-12))
  const buf = await crypto.subtle.digest('SHA-256', raw)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(): string {
  const b = new Uint8Array(32)
  crypto.getRandomValues(b)
  return Array.from(b).map(v => v.toString(16).padStart(2, '0')).join('')
}

async function sendSms(otp: string): Promise<boolean> {
  try {
    const r = await fetch(`${SB_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SB_SERVICE}`,
      },
      body: JSON.stringify({
        action: 'admin_otp',
        phone: ADMIN_PHONE,
        message: `MapJob Stats PIN: ${otp}. Wazny 10 min.`,
      }),
    })
    const d = await r.json()
    return d.success === true
  } catch {
    return false
  }
}

async function fetchStats() {
  const ago7 = new Date(Date.now() - 7 * 86400e3).toISOString()
  const m0   = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [rU, rP, rT, rV, rN, rPay, rPM, rS, rM] = await Promise.all([
    sb.from('profiles').select('id', { count: 'exact', head: true }),
    sb.from('pins').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('tenders').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', ago7),
    sb.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', ago7),
    sb.from('payments').select('amount').eq('status', 'completed'),
    sb.from('payments').select('amount').eq('status', 'completed').gte('created_at', m0),
    sb.from('profiles').select('id', { count: 'exact', head: true })
      .not('plan', 'eq', 'free').not('plan', 'is', null),
    sb.from('conversations').select('unread_a,unread_b'),
  ])

  const cnt = (r: any) => (!r.error ? (r.count ?? 0) : 0)
  const sum = (r: any) => (r.data ?? []).reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
  const unr = (r: any) => (r.data ?? []).reduce((s: number, c: any) => s + (c.unread_a ?? 0) + (c.unread_b ?? 0), 0)

  return {
    users:          cnt(rU),
    pins:           cnt(rP),
    tenders:        cnt(rT),
    views7:         cnt(rV),
    new_users7:     cnt(rN),
    revenue_total:  sum(rPay),
    revenue_month:  sum(rPM),
    subscribers:    cnt(rS),
    unread_msgs:    unr(rM),
    fetched_at:     new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return resp({ error: 'POST only' }, 405)

  let body: any
  try { body = await req.json() } catch { body = {} }

  /* ── send_pin ─────────────────────────────── */
  if (body.action === 'send_pin') {
    const { data: cur } = await sb.from('quick_stats_otp').select('created_at').eq('id', 1).single()
    if (cur) {
      const age = Date.now() - new Date(cur.created_at).getTime()
      if (age < 60_000) {
        return resp({ error: `Odczekaj ${Math.ceil((60_000 - age) / 1000)} s przed ponownym wysłaniem.` }, 429)
      }
    }

    const otp     = String(Math.floor(100000 + Math.random() * 900000))
    const hash    = await hashPin(otp)
    const expires = new Date(Date.now() + 10 * 60_000).toISOString()

    await sb.from('quick_stats_otp').upsert({
      id: 1,
      otp_hash: hash,
      expires_at: expires,
      attempts: 0,
      session_token: null,
      session_expires_at: null,
      created_at: new Date().toISOString(),
    })

    const sent = await sendSms(otp)
    if (!sent) return resp({ error: 'Nie udało się wysłać SMS. Spróbuj ponownie.' }, 500)

    return resp({ sent: true })
  }

  /* ── verify_pin ───────────────────────────── */
  if (body.action === 'verify_pin') {
    const pin = String(body.pin ?? '').trim()
    if (!/^\d{6}$/.test(pin)) return resp({ error: 'Wpisz 6-cyfrowy PIN.' }, 400)

    const { data: row } = await sb.from('quick_stats_otp').select('*').eq('id', 1).single()
    if (!row?.otp_hash)                            return resp({ error: 'Brak aktywnego PIN. Wyślij nowy.' }, 401)
    if (new Date(row.expires_at) < new Date())     return resp({ error: 'PIN wygasł. Wyślij nowy.' }, 401)
    if (row.attempts >= 5)                         return resp({ error: 'Zbyt wiele prób. Wyślij nowy PIN.' }, 429)

    // Increment first (fail-safe against brute-force)
    await sb.from('quick_stats_otp').update({ attempts: row.attempts + 1 }).eq('id', 1)

    if (await hashPin(pin) !== row.otp_hash) {
      const left = Math.max(0, 4 - row.attempts)
      return resp({ error: `Błędny PIN. Pozostało prób: ${left}` }, 401)
    }

    // Issue session token
    const token   = randomToken()
    const expires = new Date(Date.now() + SESSION_H * 3600_000).toISOString()

    await sb.from('quick_stats_otp').update({
      otp_hash: null,
      expires_at: null,
      session_token: token,
      session_expires_at: expires,
    }).eq('id', 1)

    const stats = await fetchStats()
    return resp({ ok: true, token, stats })
  }

  /* ── get_stats (session token refresh) ───── */
  if (body.action === 'get_stats') {
    const token = String(body.token ?? '').trim()
    if (!token) return resp({ error: 'Brak tokenu sesji.' }, 401)

    const { data: row } = await sb.from('quick_stats_otp').select('session_token,session_expires_at').eq('id', 1).single()
    if (!row || row.session_token !== token)                    return resp({ error: 'Nieważna sesja. Zaloguj się ponownie.' }, 401)
    if (!row.session_expires_at || new Date(row.session_expires_at) < new Date()) {
      return resp({ error: 'Sesja wygasła. Zaloguj się ponownie.' }, 401)
    }

    const stats = await fetchStats()
    return resp({ ok: true, stats })
  }

  return resp({ error: 'Nieznana akcja.' }, 400)
})
