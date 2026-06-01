// Supabase Edge Function: stripe-create-boost-checkout  (verify_jwt: true)
// Lazily creates a Stripe product+price for Boost Dnia on first call,
// caches IDs in system_config, then returns a per-user Checkout Session URL.
//
// Deploy: supabase functions deploy stripe-create-boost-checkout
// Env: STRIPE_SECRET_KEY (or system_config.stripe_secret_key fallback),
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
)

// STRIPE_SECRET_KEY z env, a jeśli brak — z system_config (fallback)
async function getStripeClient(): Promise<Stripe> {
  let key = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  if (!key) {
    const { data } = await supabaseAdmin
      .from('system_config')
      .select('value')
      .eq('key', 'stripe_secret_key')
      .maybeSingle()
    key = data?.value ?? ''
  }
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  })
}

async function getOrCreateBoostPrice(stripe: Stripe): Promise<{ priceId: string; productId: string }> {
  const { data: cfgRows } = await supabaseAdmin
    .from('system_config')
    .select('key,value')
    .in('key', ['boost_job_price_id', 'boost_job_product_id'])

  const cfg: Record<string, string> = {}
  for (const row of cfgRows ?? []) cfg[row.key] = row.value

  if (cfg.boost_job_price_id && cfg.boost_job_product_id) {
    return { priceId: cfg.boost_job_price_id, productId: cfg.boost_job_product_id }
  }

  const product = await stripe.products.create({
    name: 'Boost Dnia (48h)',
    description: 'Wyróżnienie ogłoszenia lub profilu firmy na 48h. Tylko 1 slot na platformie.',
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 900,
    currency: 'pln',
  })

  await supabaseAdmin.from('system_config').upsert([
    { key: 'boost_job_price_id', value: price.id, updated_at: new Date().toISOString() },
    { key: 'boost_job_product_id', value: product.id, updated_at: new Date().toISOString() },
  ])

  return { priceId: price.id, productId: product.id }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')

  let userId: string
  let userEmail: string | null = null
  try {
    const parts = token.split('.')
    if (parts.length < 2) throw new Error('Bad JWT')
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    userId = payload.sub
    userEmail = payload.email ?? null
    if (!userId) throw new Error('No sub in JWT')
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  let body: { boost_type?: string; job_id?: string | null }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  const boostType = body.boost_type ?? 'job'
  if (!['job', 'company'].includes(boostType)) {
    return new Response(JSON.stringify({ error: 'Invalid boost_type' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }

  const jobId = body.job_id || null

  try {
    const stripe = await getStripeClient()
    const { priceId, productId } = await getOrCreateBoostPrice(stripe)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      customer_email: userEmail ?? undefined,
      payment_method_types: ['card', 'blik', 'p24'],
      metadata: {
        product_key: 'boost_job',
        boost_type: boostType,
        job_id: jobId ?? '',
        user_id: userId,
      },
      success_url: 'https://mapjob.pl/?boost=ok&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://mapjob.pl/',
    })

    return new Response(
      JSON.stringify({ url: session.url, price_id: priceId, product_id: productId }),
      { status: 200, headers: { ...CORS_HEADERS, 'content-type': 'application/json' } },
    )
  } catch (e) {
    console.error('[stripe-create-boost-checkout]', (e as Error).message)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
})
