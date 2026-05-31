// Supabase Edge Function: push-notify v22
// Triggered by AFTER INSERT trigger on public.messages.
// v22 (2026-05-02): accepts anon OR service_role JWT, re-fetches message from DB by id.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:kontakt@mapjob.pl';
const SB_URL            = Deno.env.get('SUPABASE_URL') ?? '';
const SB_SERVICE        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function b64urlToUint8(s: string): Uint8Array {
  const p = s.replace(/-/g,'+').replace(/_/g,'/');
  const pad = p + '=='.slice(0,(4-p.length%4)%4);
  return Uint8Array.from(atob(pad), c => c.charCodeAt(0));
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const p = parts[1].replace(/-/g,'+').replace(/_/g,'/');
    const pad = p + '=='.slice(0,(4-p.length%4)%4);
    return JSON.parse(atob(pad));
  } catch { return null; }
}

async function vapidJwt(audience: string): Promise<string> {
  const now = Math.floor(Date.now()/1000);
  const hdr = btoa(JSON.stringify({typ:'JWT',alg:'ES256'})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const pld = btoa(JSON.stringify({aud:audience,exp:now+43200,sub:VAPID_SUBJECT})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const input = `${hdr}.${pld}`;
  const key = await crypto.subtle.importKey('pkcs8', b64urlToUint8(VAPID_PRIVATE_KEY),
    {name:'ECDSA',namedCurve:'P-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'}, key, new TextEncoder().encode(input));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return `${input}.${sigB64}`;
}

async function sendPush(subJson: any, payload: string): Promise<{ok:boolean, expired:boolean, status:number}> {
  const sub = typeof subJson === 'string' ? JSON.parse(subJson) : subJson;
  const endpoint = sub.endpoint as string;
  const origin = new URL(endpoint).origin;
  const jwt = await vapidJwt(origin);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: new TextEncoder().encode(payload),
  });
  const ok = res.ok || res.status === 201 || res.status === 202;
  const expired = res.status === 404 || res.status === 410;
  return { ok, expired, status: res.status };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('ok', {status:200});

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const claims = decodeJwtPayload(token);
  if (!claims || !['anon','service_role','authenticated'].includes(claims.role)) {
    return new Response(JSON.stringify({ error: 'valid Supabase JWT required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('push-notify: VAPID keys not configured');
    return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body: any;
  try { body = await req.json(); } catch { return new Response('bad json', {status:400}); }

  const inRecord = body.record || body;
  if (!inRecord?.id) return new Response('skip: no id', {status:200});

  const sb = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

  const {data: msg} = await sb.from('messages')
    .select('id, conversation_id, sender_id, text, created_at')
    .eq('id', inRecord.id).maybeSingle();
  if (!msg) return new Response('skip: msg not found', {status:200});

  const ageMs = Date.now() - new Date(msg.created_at).getTime();
  if (ageMs > 120_000) return new Response('skip: stale', {status:200});

  if (!msg.conversation_id || !msg.sender_id || !msg.text) return new Response('skip: incomplete', {status:200});

  const {data:conv} = await sb.from('conversations')
    .select('participant_a,participant_b').eq('id', msg.conversation_id).single();
  if (!conv) return new Response('no conv', {status:200});

  const recipientId = conv.participant_a === msg.sender_id ? conv.participant_b : conv.participant_a;
  if (!recipientId) return new Response('no recipient', {status:200});

  const {data:pin} = await sb.from('pins').select('name')
    .eq('user_id', msg.sender_id).eq('is_active', true).limit(1).maybeSingle();
  const senderName = pin?.name || 'Ktoś';

  const {data:subs} = await sb.from('push_subscriptions')
    .select('id, subscription').eq('user_id', recipientId);
  if (!subs || subs.length === 0) return new Response('no subs', {status:200});

  const payload = JSON.stringify({
    title: `💬 ${senderName}`,
    body: String(msg.text).slice(0,120),
    url: 'https://mapjob.pl/#',
    icon: 'https://mapjob.pl/icon-192.png',
  });

  let sent = 0;
  for (const row of subs) {
    try {
      const res = await sendPush(row.subscription, payload);
      if (res.ok) {
        sent++;
      } else if (res.expired) {
        await sb.from('push_subscriptions').delete().eq('id', row.id);
        console.log('push-notify: pruned expired sub id=', row.id);
      } else {
        console.warn('push-notify: transient failure', res.status, 'id=', row.id);
      }
    } catch(e) {
      console.error('push err:', e);
    }
  }

  return new Response(JSON.stringify({sent}), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
