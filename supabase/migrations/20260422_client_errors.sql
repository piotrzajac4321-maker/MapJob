-- client_errors: best-effort log błędów frontendu (window.onerror + unhandledrejection).
-- Insert dozwolony dla wszystkich (również anon) — to telemetria, nie PII-critical.
-- Select tylko dla adminów.

create table if not exists public.client_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  stack text,
  url text,
  user_agent text
);

create index if not exists client_errors_created_at_idx on public.client_errors(created_at desc);
create index if not exists client_errors_user_id_idx on public.client_errors(user_id);

alter table public.client_errors enable row level security;

drop policy if exists client_errors_insert_any on public.client_errors;
create policy client_errors_insert_any
  on public.client_errors
  for insert
  with check (true);

drop policy if exists client_errors_select_admin on public.client_errors;
create policy client_errors_select_admin
  on public.client_errors
  for select
  using (public.is_admin());

-- Anti-spam: retention 14 dni (ręczny cron lub pg_cron). Job przykład:
--   select cron.schedule('client_errors_prune','0 3 * * *',
--     $$delete from public.client_errors where created_at < now() - interval '14 days'$$);
