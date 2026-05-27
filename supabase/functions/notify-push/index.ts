// Supabase Edge Function: notify-push v2
// Generic OS push from user_notifications row inserts.
// Triggered by AFTER INSERT trigger on public.user_notifications.
// v2 (2026-05-02): accepts anon OR service_role JWT (db trigger uses anon).
// Re-fetches row from DB by id — RLS on user_notifications enforces auth.uid()=user_id
// for INSERT, so attacker with public anon key cannot forge notifications for other users.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT')     ?? 'mailto:kontakt@mapjob.pl'
const SB_URL            = Deno.env.get('SUPABASE_URL')      ?? ''
const SB_SERVICE        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

function b64urlToUint8(s: string): Uint8Array {
  const p = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = p + '=='.slice(0, (4 - p.length % 4) % 4)
  return Uint8Array.from(atob(pad), c => c.charCodeAt(0))
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const p = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = p + '=='.slice(0, (4 - p.length % 4) % 4)
    return JSON.parse(atob(pad))
  } catch { return null }
}

async function vapidJwt(audience: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const hdr = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const pld = btoa(JSON.stringify({ aud: audience, exp: now + 43200, sub: VAPID_SUBJECT })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const input = `${hdr}.${pld}`
  const key = await crypto.subtle.importKey('pkcs8', b64urlToUint8(VAPID_PRIVATE_KEY),
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(input))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${input}.${sigB64}`
}

async function sendPush(subJson: any, payload: string): Promise<{ ok: boolean; expired: boolean; status: number }> {
  const sub = typeof subJson === 'string' ? JSON.parse(subJson) : subJson
  const endpoint = sub.endpoint as string
  const origin = new URL(endpoint).origin
  const jwt = await vapidJwt(origin)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: new TextEncoder().encode(payload),
  })
  const ok = res.ok || res.status === 201 || res.status === 202
  const expired = res.status === 404 || res.status === 410
  return { ok, expired, status: res.status }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('ok', { status: 200 })

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  const claims = decodeJwtPayload(token)
  if (!claims || !['anon','service_role','authenticated'].includes(claims.role)) {
    return new Response(JSON.stringify({ error: 'valid Supabase JWT required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('notify-push: VAPID keys not configured')
    return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: any
  try { body = await req.json() } catch { return new Response('bad json', { status: 400 }) }

  const inRecord = body.record || body
  if (!inRecord?.id) return new Response('skip: no id', { status: 200 })

  const sb = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: notif } = await sb.from('user_notifications')
    .select('id, user_id, type, title, body, icon, link_data, created_at')
    .eq('id', inRecord.id).maybeSingle()
  if (!notif) return new Response('skip: notif not found', { status: 200 })

  const ageMs = Date.now() - new Date(notif.created_at).getTime()
  if (ageMs > 120_000) return new Response('skip: stale', { status: 200 })

  if (notif.type === 'message') {
    return new Response('skip: message handled by push-notify', { status: 200 })
  }

  if (!notif.user_id || !notif.title) return new Response('skip: incomplete', { status: 200 })

  const { data: subs } = await sb.from('push_subscriptions')
    .select('id, subscription').eq('user_id', notif.user_id)
  if (!subs || subs.length === 0) return new Response('no subs', { status: 200 })

  let url = 'https://mapjob.pl/'
  try {
    const ld = typeof notif.link_data === 'string' ? JSON.parse(notif.link_data) : notif.link_data
    if (ld) {
      if (ld.conversation_id) url = `https://mapjob.pl/?view=messages&c=${encodeURIComponent(ld.conversation_id)}`
      else if (ld.pin_id)     url = `https://mapjob.pl/?pin=${encodeURIComponent(ld.pin_id)}`
      else if (ld.referral_id || notif.type?.startsWith('referral_')) url = 'https://mapjob.pl/?view=invite'
      else if (notif.type?.startsWith('payment_') || notif.type === 'urgent_tender_active') url = 'https://mapjob.pl/?view=profile'
    }
  } catch { /* ignore */ }

  const payload = JSON.stringify({
    title: `${notif.icon ?? '🔔'} ${notif.title}`,
    body: String(notif.body ?? '').slice(0, 200),
    url,
    icon: 'https://mapjob.pl/icon-192.png',
  })

  let sent = 0
  for (const row of subs) {
    try {
      const res = await sendPush(row.subscription, payload)
      if (res.ok) {
        sent++
      } else if (res.expired) {
        await sb.from('push_subscriptions').delete().eq('id', row.id)
        console.log('notify-push: pruned expired sub id=', row.id)
      } else {
        console.warn('notify-push: transient failure', res.status, 'id=', row.id)
      }
    } catch (e) {
      console.error('notify-push err:', (e as Error).message)
    }
  }

  return new Response(JSON.stringify({ sent }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
