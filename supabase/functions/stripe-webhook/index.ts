// Supabase Edge Function: stripe-webhook
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Env (ustaw w: supabase secrets set ...):
//   STRIPE_SECRET_KEY        - sk_live_... (lub sk_test_... do testow)
//   STRIPE_WEBHOOK_SECRET    - whsec_... (z Dashboard Stripe -> Webhooks)
//   SUPABASE_URL             - auto-wstrzykiwany przez Supabase
//   SUPABASE_SERVICE_ROLE_KEY- auto-wstrzykiwany przez Supabase
//
// Stripe Dashboard -> Developers -> Webhooks -> Add endpoint:
//   URL: https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
//   Events:
//     - checkout.session.completed
//     - checkout.session.async_payment_succeeded
//     - checkout.session.async_payment_failed
//     - charge.refunded

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

// Musi by zgodne z MONTHS_MAP w index.html (linia ~5559)
const MONTHS_MAP: Record<string, number> = {
  plan_pro_30d: 1,
  plan_pro_monthly: 1,
  plan_pro_yearly: 12,
  supporter_pack: 3,
  portfolio_pro: 999,
  premium_monthly: 1,
  premium_yearly: 12,
  extra_pins: 0,
  pin3: 0,
  pin1: 0,
  highlight_pin_1: 0,
  highlight_pin_3: 0,
  highlight1: 0,
  highlight3: 0,
  pin3_highlight3: 0,
  pin_highlight_bundle: 0,
  urgent_tender: 0,
  urgent_job: 0,       // jednorazowe — aktywacja przez activate_urgent_job lub formularz
  boost_job: 0,        // jednorazowe — aktywacja przez webhook (48h od zakupu)
}

// User-facing product labels — dla powiadomień. Dopasowane do CART_LABELS w index.html.
const PRODUCT_LABELS: Record<string, string> = {
  plan_pro_30d: 'Plan Pro (30 dni)',
  plan_pro_monthly: 'Plan Pro (1 miesiąc)',
  plan_pro_yearly: 'Plan Pro (12 miesięcy)',
  supporter_pack: 'Pakiet Wspierający (3 miesiące)',
  portfolio_pro: 'Portfolio Pro',
  premium_monthly: 'Premium (1 miesiąc)',
  premium_yearly: 'Premium (12 miesięcy)',
  extra_pins: 'Dodatkowe piny',
  pin3: 'Pakiet 3 pinów',
  pin1: 'Dodatkowy pin',
  highlight_pin_1: 'Wyróżnienie pina (1)',
  highlight_pin_3: 'Wyróżnienie pinów (3)',
  highlight1: 'Wyróżnienie',
  highlight3: 'Pakiet wyróżnień',
  pin3_highlight3: 'Pakiet 3 piny + 3 wyróżnienia',
  pin_highlight_bundle: 'Pin + wyróżnienie',
  urgent_tender: 'Pilne zlecenie',
  urgent_job: 'Pilna oferta pracy',
  boost_job: 'Boost Dnia (48h)',
}

function productLabel(key: string): string {
  return PRODUCT_LABELS[key] ?? key
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    console.error('[stripe-webhook] signature verify failed:', (err as Error).message)
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  // Idempotency — Stripe retry'uje eventy (at-least-once). Bez tego
  // duplikat `checkout.session.completed` może aktywować pakiet 2x.
  try {
    const { error: dedupeErr } = await supabaseAdmin
      .from('stripe_webhook_events')
      .insert([{ event_id: event.id, event_type: event.type }])
    if (dedupeErr) {
      if ((dedupeErr as { code?: string }).code === '23505') {
        console.log('[stripe-webhook] duplicate event, skipping:', event.id)
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      }
      console.warn('[stripe-webhook] dedupe insert failed (not fatal):', dedupeErr)
    }
  } catch (e) {
    console.warn('[stripe-webhook] dedupe exception (not fatal):', (e as Error).message)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        await handleCheckoutFailed(event.data.object as Stripe.Checkout.Session)
        break
      }
      case 'charge.refunded': {
        await handleRefund(event.data.object as Stripe.Charge)
        break
      }
      default:
        console.log('[stripe-webhook] unhandled event:', event.type)
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err)
    return new Response('Handler failed', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.client_reference_id
  const email = session.customer_email || session.customer_details?.email || null

  if (!userId) {
    console.warn('[stripe-webhook] session bez client_reference_id:', session.id)
    return
  }

  // Payment Links nie zawieraja line_items w webhooku domyslnie -> pobierz.
  let priceId: string | null = null
  let amountTotal = session.amount_total ?? 0
  try {
    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'line_items.data.price.product'],
    })
    priceId = full.line_items?.data?.[0]?.price?.id ?? null
    amountTotal = full.amount_total ?? amountTotal
  } catch (e) {
    console.warn('[stripe-webhook] nie udalo sie pobrac line_items:', (e as Error).message)
  }

  // Znajdz najnowszy pending payment dla tego usera (match po price_id jesli mamy)
  let query = supabaseAdmin
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'pending_blik'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (priceId) query = query.eq('stripe_price_id', priceId)

  const { data: pendingRows, error: selErr } = await query
  if (selErr) {
    console.error('[stripe-webhook] select pending failed:', selErr)
  }

  let paymentRow = pendingRows?.[0] ?? null

  if (!paymentRow) {
    // Fallback: uzytkownik zamknal karte przed insertem -> tworzymy rekord od zera
    const sessionMeta = (session.metadata ?? {}) as Record<string, string>
    const productKey = sessionMeta.product_key || await resolveProductKeyFromPrice(priceId)
    const fallbackMeta: Record<string, unknown> = { session_id: session.id, source: 'webhook_fallback' }
    if (sessionMeta.boost_type) fallbackMeta.boost_type = sessionMeta.boost_type
    if (sessionMeta.job_id) fallbackMeta.job_id = sessionMeta.job_id
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('payments')
      .insert([{
        user_id: userId,
        email,
        product_key: productKey,
        amount: amountTotal / 100,
        currency: (session.currency ?? 'pln').toUpperCase(),
        stripe_price_id: priceId,
        stripe_session_id: session.id,
        status: 'completed',
        metadata: fallbackMeta,
      }])
      .select()
      .single()

    if (insErr) {
      console.error('[stripe-webhook] insert payment failed:', insErr)
      return
    }
    paymentRow = inserted
  } else {
    const { error: updErr } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'completed',
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRow.id)

    if (updErr) {
      console.error('[stripe-webhook] update payment failed:', updErr)
      return
    }
  }

  await activatePackage(userId, paymentRow)
}

async function activatePackage(
  userId: string,
  payment: { product_key: string; metadata?: Record<string, unknown> | null },
): Promise<void> {
  const productKey = payment.product_key
  if (!productKey || productKey === 'unknown') {
    console.warn('[stripe-webhook] brak product_key, pomijam aktywacje')
    return
  }

  if (productKey === 'urgent_tender') {
    const tenderId = (payment.metadata as { tender_id?: string } | null)?.tender_id ?? null
    if (!tenderId) {
      console.warn('[stripe-webhook] urgent_tender bez tender_id w metadata')
      return
    }
    const { error } = await supabaseAdmin.rpc('activate_urgent_tender', {
      p_tender_id: tenderId,
      p_user_id: userId,
    })
    if (error) {
      console.error('[stripe-webhook] activate_urgent_tender:', error)
      return
    }
    await notifyUser(userId, {
      type: 'urgent_tender_active',
      title: 'Pilne zlecenie aktywne ✓',
      body: 'Twoje zlecenie zostało wyróżnione jako pilne — pojawi się na górze listy.',
      icon: '⚡',
      linkData: { tender_id: tenderId, product_key: productKey },
    })
    return
  }

  if (productKey === 'urgent_job') {
    // job_id dostępne tylko w trybie edycji (editJobOffer); przy nowym ogłoszeniu
    // formularz sam ustawia is_urgent=true — webhook tylko potwierdza powiadomieniem.
    const jobId = (payment.metadata as { job_id?: string } | null)?.job_id ?? null
    if (jobId) {
      const { error } = await supabaseAdmin.rpc('activate_urgent_job', {
        p_job_id: jobId,
        p_user_id: userId,
      })
      if (error) console.error('[stripe-webhook] activate_urgent_job:', error)
    }
    await notifyUser(userId, {
      type: 'urgent_job_active',
      title: 'Pilna oferta pracy aktywna ✓',
      body: 'Twoja oferta pracy jest oznaczona jako PILNA — wyróżnia się na liście.',
      icon: '🔴',
      linkData: { job_id: jobId, product_key: productKey },
    })
    return
  }

  if (productKey === 'boost_job') {
    const meta = (payment.metadata ?? {}) as Record<string, unknown>
    const boostType = meta.boost_type as string | undefined
    const jobId = (meta.job_id as string | undefined) || null
    const expiry = new Date(Date.now() + 172800000).toISOString()

    if (boostType === 'company') {
      await supabaseAdmin.from('profiles').update({ company_boost_until: expiry }).eq('id', userId)
    } else if (boostType === 'job' && jobId) {
      await supabaseAdmin.from('job_offers')
        .update({ boosted_until: expiry })
        .eq('id', jobId)
        .eq('user_id', userId)
    } else {
      // brak oferty w chwili zakupu — zapisz jako oczekujący; aktywuje się przy tworzeniu oferty
      await supabaseAdmin.from('profiles').update({ pending_job_boost_until: expiry }).eq('id', userId)
    }

    const notifBody = boostType === 'company'
      ? 'Twój profil firmy jest na szczycie listy przez 48h.'
      : jobId
        ? 'Twoje ogłoszenie ma złotą ramkę i oznaczenie TOP DNIA przez 48h.'
        : 'Boost zostanie aktywowany automatycznie na Twoim pierwszym ogłoszeniu.'

    await notifyUser(userId, {
      type: 'boost_job_active',
      title: '🚀 Boost Dnia',
      body: notifBody,
      icon: '🚀',
      linkData: { product_key: productKey, boost_type: boostType, job_id: jobId },
    })
    return
  }

  const months = productKey in MONTHS_MAP ? MONTHS_MAP[productKey] : 1
  const { error } = await supabaseAdmin.rpc('activate_package', {
    p_user_id: userId,
    p_product_key: productKey,
    p_months: months,
  })
  if (error) {
    console.error('[stripe-webhook] activate_package:', error)
    return
  }

  await notifyUser(userId, {
    type: 'payment_succeeded',
    title: 'Pakiet aktywowany ✓',
    body: `${productLabel(productKey)} działa od teraz.`,
    icon: '⚡',
    linkData: { product_key: productKey, months },
  })
}

interface NotifyArgs {
  type: string
  title: string
  body: string
  icon?: string
  linkData?: Record<string, unknown>
}
// Insert into the existing public.user_notifications table — same schema and RLS
// as notify_on_message/notify_on_review triggers (deployed since 2026-04-09).
// Frontend reads via rpc('get_my_notifications') in index.html L6943.
async function notifyUser(userId: string, args: NotifyArgs): Promise<void> {
  // Best-effort — never abort the webhook flow on notification failure.
  try {
    const { error } = await supabaseAdmin.from('user_notifications').insert({
      user_id: userId,
      type: args.type,
      title: args.title,
      body: args.body,
      icon: args.icon ?? '🔔',
      link_data: args.linkData ?? null,
    })
    if (error) console.warn('[stripe-webhook] notify insert failed:', error.message)
  } catch (e) {
    console.warn('[stripe-webhook] notify exception:', (e as Error).message)
  }
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.client_reference_id
  if (!userId) return

  await supabaseAdmin
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .in('status', ['pending', 'pending_blik'])
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
  if (!paymentIntent) return

  // Stripe: z payment_intent odnajdujemy session
  try {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 })
    const session = sessions.data[0]
    if (!session) return

    // Find the payment row before marking refunded — we need product_key + user_id for demote.
    const { data: payRow } = await supabaseAdmin
      .from('payments')
      .select('user_id, product_key')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    await supabaseAdmin
      .from('payments')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id)

    // H7: demote plan/limits so refunded user doesn't keep Premium.
    if (payRow?.user_id && payRow?.product_key && payRow.product_key !== 'unknown') {
      const { error: deErr } = await supabaseAdmin.rpc('deactivate_package', {
        p_user_id: payRow.user_id,
        p_product_key: payRow.product_key,
      })
      if (deErr) console.error('[stripe-webhook] deactivate_package:', deErr)

      await notifyUser(payRow.user_id, {
        type: 'payment_refunded',
        title: 'Zwrot zrealizowany',
        body: `${productLabel(payRow.product_key)} został zwrócony. Pakiet zdezaktywowany.`,
        icon: '↩️',
        linkData: { product_key: payRow.product_key },
      })
    }
  } catch (e) {
    console.error('[stripe-webhook] refund lookup failed:', (e as Error).message)
  }
}

async function resolveProductKeyFromPrice(priceId: string | null): Promise<string> {
  if (!priceId) return 'unknown'
  const { data } = await supabaseAdmin
    .from('payments')
    .select('product_key')
    .eq('stripe_price_id', priceId)
    .not('product_key', 'is', null)
    .limit(1)
    .maybeSingle()
  return data?.product_key ?? 'unknown'
}
