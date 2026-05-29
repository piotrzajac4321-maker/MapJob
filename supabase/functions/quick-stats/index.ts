// quick-stats Edge Function — PIN-only admin stats widget.
// Actions: verify_pin | get_stats | get_online

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SB_URL     = Deno.env.get('SUPABASE_URL') ?? ''
const SB_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ADMIN_PIN  = Deno.env.get('STATS_PIN') ?? '9801'
const SESSION_H  = 24 * 7

const sb = createClient(SB_URL, SB_SERVICE)
const CORS = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'content-type', 'Access-Control-Allow-Methods':'POST, OPTIONS' }

function resp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type':'application/json' } })
}

async function signToken(exp: number) {
  const p = btoa(JSON.stringify({exp})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(SB_SERVICE.slice(-32)), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])
  const s = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(p))
  return `${p}.${btoa(String.fromCharCode(...new Uint8Array(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}`
}

async function verifyToken(token: string) {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [p, sB64] = parts
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(SB_SERVICE.slice(-32)), {name:'HMAC',hash:'SHA-256'}, false, ['verify'])
  const sBytes = Uint8Array.from(atob(sB64.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0))
  if (!await crypto.subtle.verify('HMAC', k, sBytes, new TextEncoder().encode(p))) return false
  try { const {exp} = JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))); return Date.now() < exp } catch { return false }
}

function byId(rows: any[], key = 'ref_id') {
  const m: Record<string,any> = {}
  for (const r of rows ?? []) if (r[key] != null) m[r[key]] = r
  return m
}

async function fetchStats() {
  const ago30 = new Date(Date.now() - 30*86400e3).toISOString()

  const [rKpi, rCountries, rFunnel,
         rJobs, rTenders, rPins,
         rUJob, rUTen, rUPin,
         rPJob, rPTen, rPPin,
         rU30] = await Promise.all([
    sb.rpc('admin_get_view_kpis'),
    sb.rpc('admin_get_visitor_countries'),
    sb.rpc('admin_get_contact_funnel'),
    sb.from('job_offers').select('id,title,company_name,location,views_count,contact_clicks_count,apply_clicks_count,applications_count').order('views_count',{ascending:false,nullsFirst:false}).limit(200),
    sb.from('tenders').select('id,title,city,poster_name,views_count,contact_clicks_count').order('views_count',{ascending:false,nullsFirst:false}).limit(200),
    sb.from('pins').select('id,name,role,city,is_demo,views_count,contact_clicks_count').eq('is_active',true).order('views_count',{ascending:false,nullsFirst:false}).limit(200),
    sb.rpc('admin_get_listing_unique_viewers', {p_page_type:'job'}),
    sb.rpc('admin_get_listing_unique_viewers', {p_page_type:'tender'}),
    sb.rpc('admin_get_listing_unique_viewers', {p_page_type:'pin'}),
    sb.rpc('admin_get_listing_period_views',   {p_page_type:'job'}),
    sb.rpc('admin_get_listing_period_views',   {p_page_type:'tender'}),
    sb.rpc('admin_get_listing_period_views',   {p_page_type:'pin'}),
    sb.from('profiles').select('created_at').gte('created_at', ago30),
  ])

  const kpi = rKpi.data ?? {}
  const uJob = byId(rUJob.data), uTen = byId(rUTen.data), uPin = byId(rUPin.data)
  const pJob = byId(rPJob.data), pTen = byId(rPTen.data), pPin = byId(rPPin.data)

  function mkJob(j: any) {
    return { id:j.id, kind:'job', title:'💼 '+(j.title||'(bez tytułu)'), meta:[j.company_name,j.location].filter(Boolean).join(' · '), clicks_phone:j.contact_clicks_count||0, clicks_apply:j.apply_clicks_count||0, applications:j.applications_count||0, views:j.views_count||0, uniq:uJob[j.id]?.uniq||0, v24h:pJob[j.id]?.v24h||0, v7d:pJob[j.id]?.v7d||0 }
  }
  function mkTen(t: any) {
    return { id:t.id, kind:'tender', title:'📋 '+(t.title||'(bez tytułu)'), meta:[t.city,t.poster_name].filter(Boolean).join(' · '), clicks_phone:t.contact_clicks_count||0, clicks_apply:0, applications:0, views:t.views_count||0, uniq:uTen[t.id]?.uniq||0, v24h:pTen[t.id]?.v24h||0, v7d:pTen[t.id]?.v7d||0 }
  }
  function mkPin(p: any) {
    return { id:p.id, kind:'pin', title:'📍 '+(p.name||'(bez nazwy)')+(p.is_demo?' 🎠':''), meta:[p.role,p.city].filter(Boolean).join(' · '), clicks_phone:p.contact_clicks_count||0, clicks_apply:0, applications:0, views:p.views_count||0, uniq:uPin[p.id]?.uniq||0, v24h:pPin[p.id]?.v24h||0, v7d:pPin[p.id]?.v7d||0 }
  }

  const jobs    = (rJobs.data    ?? []).map(mkJob)
  const tenders = (rTenders.data ?? []).map(mkTen)
  const pins    = (rPins.data    ?? []).map(mkPin)
  const ogl     = [...jobs, ...tenders].sort((a,b) => b.views - a.views)

  // 30-day chart
  const cm: Record<string,number> = {}
  for (let i=29; i>=0; i--) { const d=new Date(Date.now()-i*86400e3); cm[d.toISOString().slice(0,10)]=0 }
  for (const u of (rU30.data??[])) { const k=u.created_at.slice(0,10); if(k in cm) cm[k]++ }

  return {
    kpi,
    countries: rCountries.data ?? [],
    funnel:    rFunnel.data    ?? [],
    ogl, pins,
    chart30: Object.entries(cm).map(([date,count])=>({date,count})),
    fetched_at: new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers:CORS})
  if (req.method!=='POST')    return resp({error:'POST only'},405)

  let body: any
  try { body = await req.json() } catch { body={} }

  if (body.action === 'verify_pin') {
    if (String(body.pin??'').trim() !== ADMIN_PIN) return resp({error:'Błędny PIN.'},401)
    const token = await signToken(Date.now() + SESSION_H*3600_000)
    const stats = await fetchStats()
    return resp({ok:true, token, stats})
  }

  if (body.action === 'get_stats') {
    const tok = String(body.token??'').trim()
    if (!tok || !await verifyToken(tok)) return resp({error:'Sesja wygasła. Zaloguj się ponownie.'},401)
    return resp({ok:true, stats: await fetchStats()})
  }

  if (body.action === 'get_online') {
    const tok = String(body.token??'').trim()
    if (!tok || !await verifyToken(tok)) return resp({error:'Sesja wygasła.'},401)
    const cutoff = new Date(Date.now()-120_000).toISOString()
    const {data} = await sb.from('user_sessions_admin')
      .select('id,user_email,display_name,anon_id,last_seen_at,started_at,last_path,events_count,country')
      .gte('last_seen_at', cutoff).is('ended_at',null)
      .order('last_seen_at',{ascending:false}).limit(100)
    return resp({ok:true, users: data??[]})
  }

  return resp({error:'Nieznana akcja.'},400)
})
