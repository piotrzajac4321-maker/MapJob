-- MapJob: CV Builder — tabela `cv_documents` + polityki RLS + bucket `cv-exports`.
--
-- Każdy user może mieć wiele CV (np. PL + EN, różne role). Każde CV trzyma
-- pełną strukturę w jsonb (personal, summary, experience[], education[],
-- skills, languages[], certificates[], projects[], hobbies, flags).
--
-- Po zdeployowaniu sprawdź:
--   select tablename, rowsecurity from pg_tables where tablename = 'cv_documents';
--   select polname, polcmd, qual, with_check
--     from pg_policy where polrelid = 'public.cv_documents'::regclass;

create table if not exists public.cv_documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null default 'Moje CV',
  data         jsonb not null default '{}'::jsonb,
  template     text not null default 'classic'
               check (template in ('classic','modern','creative')),
  accent       text not null default '#2563EB',
  language     text not null default 'pl'
               check (language in ('pl','en','de')),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists cv_documents_user_idx
  on public.cv_documents(user_id);
create index if not exists cv_documents_updated_idx
  on public.cv_documents(user_id, updated_at desc);

-- Automatyczne odświeżanie `updated_at` przy każdym UPDATE.
create or replace function public._cv_documents_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists cv_documents_touch on public.cv_documents;
create trigger cv_documents_touch
  before update on public.cv_documents
  for each row execute function public._cv_documents_touch();

-- Guard: max 10 CV na usera (zapobiega spam/koszty AI). RESTRICTIVE,
-- żeby nie było ominięcia przez inną policy.
create or replace function public._cv_documents_cap()
returns trigger
language plpgsql
as $$
declare
  cnt integer;
begin
  select count(*) into cnt
    from public.cv_documents where user_id = new.user_id;
  if cnt >= 10 then
    raise exception 'CV limit reached (10 per user)';
  end if;
  return new;
end $$;

drop trigger if exists cv_documents_cap on public.cv_documents;
create trigger cv_documents_cap
  before insert on public.cv_documents
  for each row execute function public._cv_documents_cap();

-- Guard: tylko jedno CV domyślne per user. Jeśli ustawiasz is_default=true,
-- zdejmij flagę z wcześniejszego.
create or replace function public._cv_documents_single_default()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.cv_documents
      set is_default = false
      where user_id = new.user_id and id <> new.id;
  end if;
  return new;
end $$;

drop trigger if exists cv_documents_single_default on public.cv_documents;
create trigger cv_documents_single_default
  after insert or update of is_default on public.cv_documents
  for each row when (new.is_default) execute function public._cv_documents_single_default();

-- RLS
alter table public.cv_documents enable row level security;

-- SELECT: tylko własne CV
drop policy if exists "cv_documents_select_own" on public.cv_documents;
create policy "cv_documents_select_own"
  on public.cv_documents for select
  using (auth.uid() = user_id);

-- INSERT: tylko z własnym user_id
drop policy if exists "cv_documents_insert_own" on public.cv_documents;
create policy "cv_documents_insert_own"
  on public.cv_documents for insert
  with check (auth.uid() = user_id);

-- UPDATE: tylko własne CV; user_id nie może być zmieniony
drop policy if exists "cv_documents_update_own" on public.cv_documents;
create policy "cv_documents_update_own"
  on public.cv_documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: tylko własne CV
drop policy if exists "cv_documents_delete_own" on public.cv_documents;
create policy "cv_documents_delete_own"
  on public.cv_documents for delete
  using (auth.uid() = user_id);

-- Ban-check: pominięty w v1 — schemat banów w MapJob ewoluuje (user_bans
-- z is_active vs profiles.banned). Gdy schemat ustabilizowany, dodaj
-- RESTRICTIVE policy dopasowaną do istniejących *_insert_not_banned
-- (memory: project_rls_ban_checks_restrictive).
-- Dopóki jej nie ma, owner-check (auth.uid() = user_id) wystarcza.
drop policy if exists "cv_documents_insert_not_banned" on public.cv_documents;
drop policy if exists "cv_documents_update_not_banned" on public.cv_documents;

-- Storage bucket `cv-exports` (private, 10 MB limit per PDF).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv-exports',
  'cv-exports',
  false,
  10 * 1024 * 1024,
  array['application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS — read/write only within own prefix: cv-exports/<user_id>/...
drop policy if exists "cv_exports_owner_read" on storage.objects;
create policy "cv_exports_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'cv-exports'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "cv_exports_owner_write" on storage.objects;
create policy "cv_exports_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'cv-exports'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "cv_exports_owner_delete" on storage.objects;
create policy "cv_exports_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'cv-exports'
    and auth.uid()::text = split_part(name, '/', 1)
  );

-- Rate-limit helper: liczy wywołania cv-write usera w ostatnich 24h.
-- Wywołane z edge function przed każdym callem do Anthropic.
create or replace function public.cv_write_calls_last_24h(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*)::integer, 0)
    from public.user_events
    where user_id = p_user_id
      and event_type = 'cv_write_call'
      and created_at > now() - interval '24 hours'
$$;

grant execute on function public.cv_write_calls_last_24h(uuid)
  to anon, authenticated, service_role;
