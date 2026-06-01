-- stripe_webhook_events: tabela do dedupowania Stripe event.id.
-- Stripe retry'uje eventy (at-least-once delivery) — bez tego
-- `checkout.session.completed` mogło się aktywować wielokrotnie
-- co dawało podwójne doładowanie pakietu (edge-case, ale realny).

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

-- Edge function używa service_role — RLS nie blokuje, ale zostawiamy ON
-- żeby żaden anon/authenticated JWT nie mógł czytać/pisać.
-- (brak policy = deny wszystko poza service_role)

-- Prune po 30 dniach (Stripe retry window to kilka dni max)
--   select cron.schedule('stripe_events_prune','0 3 * * *',
--     $$delete from public.stripe_webhook_events where received_at < now() - interval '30 days'$$);
