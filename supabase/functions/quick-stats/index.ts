// quick-stats Edge Function — PIN-only access to admin stats.
//
// Actions:
//   verify_pin  → sprawdź PIN, wydaj podpisany token sesji (24 h)
//   get_stats   → zweryfikuj token, zwróć statystyki

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SB_URL     = Deno.env.get('SUPABASE_URL') ?? ''
const SB_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
// PIN ustawiany przez zmienną środowiskową; fallback = 9801
const ADMIN_PIN  = Deno.env.get('STATS_PIN') ?? '9801'
const SESSION_H  = 24 * 7  // token ważny 7 dni

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

// Podpisany token sesji — nie wymaga tabeli w DB.
// Format: base64url(payload) . base64url(hmac-sha256)
async function signToken(exp: number): Promise<string> {
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SB_SERVICE.slice(-32)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
  return `${payload}.${sigB64}`
}

async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sigB64] = parts
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SB_SERVICE.slice(-32)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  const sigBytes = Uint8Array.from(atob(sigB64.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0))
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload))
  if (!ok) return false
  try {
    const { exp } = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')))
    return Date.now() < exp
  } catch { return false }
}

async function fetchStats() {
  const ago7  = new Date(Date.now() - 7 * 86400e3).toISOString()
  const ago30 = new Date(Date.now() - 30 * 86400e3).toISOString()
  const m0    = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [rU, rP, rT, rV, rN, rFb, rPay, rPM, rS, rM, rU30, rPlans, rRecent] = await Promise.all([
    sb.from('profiles').select('id', { count: 'exact', head: true }),
    sb.from('pins').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('tenders').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', ago7),
    sb.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', ago7),
    sb.from('beta_feedback').select('id', { count: 'exact', head: true }).eq('resolved', false),
    sb.from('payments').select('amount').eq('status', 'completed'),
    sb.from('payments').select('amount').eq('status', 'completed').gte('created_at', m0),
    sb.from('profiles').select('id', { count: 'exact', head: true })
      .not('plan', 'eq', 'free').not('plan', 'is', null),
    sb.from('conversations').select('unread_a,unread_b'),
    sb.from('profiles').select('created_at').gte('created_at', ago30),
    sb.from('profiles').select('plan'),
    sb.from('page_views').select('path,created_at').order('created_at', { ascending: false }).limit(6),
  ])

  const cnt = (r: any) => (!r.error ? (r.count ?? 0) : 0)
  const sum = (r: any) => (r.data ?? []).reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
  const unr = (r: any) => (r.data ?? []).reduce((s: number, c: any) => s + (c.unread_a ?? 0) + (c.unread_b ?? 0), 0)

  const chartMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400e3)
    chartMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const u of (rU30.data ?? [])) {
    const k = u.created_at.slice(0, 10)
    if (k in chartMap) chartMap[k]++
  }

  const planCounts = { pro: 0, free: 0, supporter: 0, other: 0 }
  for (const u of (rPlans.data ?? [])) {
    const p = (u.plan as string) || 'free'
    if (p === 'pro') planCounts.pro++
    else if (p === 'free') planCounts.free++
    else if (p === 'supporter') planCounts.supporter++
    else planCounts.other++
  }

  return {
    users:          cnt(rU),
    pins:           cnt(rP),
    tenders:        cnt(rT),
    views7:         cnt(rV),
    new_users7:     cnt(rN),
    feedback:       cnt(rFb),
    revenue_total:  sum(rPay),
    revenue_month:  sum(rPM),
    subscribers:    cnt(rS),
    unread_msgs:    unr(rM),
    chart30:        Object.entries(chartMap).map(([date, count]) => ({ date, count })),
    plans:          planCounts,
    recent_activity: (rRecent.data ?? []).map((v: any) => ({ path: v.path, at: v.created_at })),
    fetched_at:     new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return resp({ error: 'POST only' }, 405)

  let body: any
  try { body = await req.json() } catch { body = {} }

  /* ── verify_pin ── */
  if (body.action === 'verify_pin') {
    const pin = String(body.pin ?? '').trim()
    if (pin !== ADMIN_PIN) {
      return resp({ error: 'Błędny PIN.' }, 401)
    }
    const exp   = Date.now() + SESSION_H * 3600_000
    const token = await signToken(exp)
    const stats = await fetchStats()
    return resp({ ok: true, token, stats })
  }

  /* ── get_stats ── */
  if (body.action === 'get_stats') {
    const token = String(body.token ?? '').trim()
    if (!token || !await verifyToken(token)) {
      return resp({ error: 'Sesja wygasła. Zaloguj się ponownie.' }, 401)
    }
    const stats = await fetchStats()
    return resp({ ok: true, stats })
  }

  return resp({ error: 'Nieznana akcja.' }, 400)
})
