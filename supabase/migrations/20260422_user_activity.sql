-- MapJob: User activity tracking — sessions + event log.
-- Admin can see who logged in, when, what they clicked last before leaving.
--
-- Privacy:
--   * 30-day retention (admin can purge earlier via public.purge_old_activity()).
--   * Only admins can SELECT. Users insert their own rows (RLS with auth.uid()).
--   * No IP address is stored. user_agent is kept (already sent in every HTTP request).
--
-- After apply, verify:
--   select count(*) from public.user_sessions;
--   select count(*) from public.user_events;

-- =============================================================================
-- user_sessions: one row per login (or per anonymous page-load with tracking).
-- =============================================================================
create table if not exists public.user_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  anon_id        text,                                -- fallback for guests (random browser id)
  started_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  ended_at       timestamptz,                         -- set by beforeunload / logout
  last_path      text,                                -- last hash route the user was on
  last_event     text,                                -- last event_type in this session
  user_agent     text,
  events_count   integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists user_sessions_user_idx      on public.user_sessions (user_id, started_at desc);
create index if not exists user_sessions_last_seen_idx on public.user_sessions (last_seen_at desc);
create index if not exists user_sessions_anon_idx      on public.user_sessions (anon_id) where anon_id is not null;

alter table public.user_sessions enable row level security;

-- SELECT: only admins.
drop policy if exists user_sessions_select on public.user_sessions;
create policy user_sessions_select on public.user_sessions
  for select to authenticated
  using (public.is_admin());

-- INSERT: authenticated user inserts own (user_id = auth.uid()) OR guest inserts anon_id-only row.
-- auth.uid() is wrapped in (select ...) so planner evaluates once per query, not per row.
drop policy if exists user_sessions_insert on public.user_sessions;
create policy user_sessions_insert on public.user_sessions
  for insert to authenticated, anon
  with check (
    ((select auth.uid()) is not null and user_id = (select auth.uid()))
    or ((select auth.uid()) is null and user_id is null and anon_id is not null)
  );

-- UPDATE: user can update own session (heartbeat), admins update any.
drop policy if exists user_sessions_update on public.user_sessions;
create policy user_sessions_update on public.user_sessions
  for update to authenticated, anon
  using (
    public.is_admin()
    or ((select auth.uid()) is not null and user_id = (select auth.uid()))
    or ((select auth.uid()) is null and user_id is null)
  )
  with check (
    public.is_admin()
    or ((select auth.uid()) is not null and user_id = (select auth.uid()))
    or ((select auth.uid()) is null and user_id is null)
  );

-- DELETE: only admins.
drop policy if exists user_sessions_delete on public.user_sessions;
create policy user_sessions_delete on public.user_sessions
  for delete to authenticated
  using (public.is_admin());


-- =============================================================================
-- user_events: fine-grained event log (view pin, open chat, checkout, etc.).
-- =============================================================================
create table if not exists public.user_events (
  id           bigserial primary key,
  session_id   uuid references public.user_sessions(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  anon_id      text,
  event_type   text not null,                          -- 'login' | 'view_pin' | 'open_chat' | ...
  target_type  text,                                   -- 'pin' | 'tender' | 'chat' | 'package'
  target_id    text,                                   -- stringified id of the target
  path         text,                                   -- hash route at time of event
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists user_events_session_idx on public.user_events (session_id, created_at);
create index if not exists user_events_user_idx    on public.user_events (user_id, created_at desc);
create index if not exists user_events_type_idx    on public.user_events (event_type, created_at desc);
create index if not exists user_events_created_idx on public.user_events (created_at desc);

alter table public.user_events enable row level security;

-- SELECT: only admins.
drop policy if exists user_events_select on public.user_events;
create policy user_events_select on public.user_events
  for select to authenticated
  using (public.is_admin());

-- INSERT: authenticated user own / guest with anon_id.
-- (select auth.uid()) — same planner optimization as user_sessions.
drop policy if exists user_events_insert on public.user_events;
create policy user_events_insert on public.user_events
  for insert to authenticated, anon
  with check (
    ((select auth.uid()) is not null and user_id = (select auth.uid()))
    or ((select auth.uid()) is null and user_id is null and anon_id is not null)
  );

-- No UPDATE — events are append-only.
-- DELETE: only admins.
drop policy if exists user_events_delete on public.user_events;
create policy user_events_delete on public.user_events
  for delete to authenticated
  using (public.is_admin());


-- =============================================================================
-- Trigger: on event insert, bump parent session's events_count + last_event + last_seen_at.
-- =============================================================================
create or replace function public.user_events_bump_session()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.session_id is not null then
    update public.user_sessions
       set events_count = events_count + 1,
           last_event   = new.event_type,
           last_seen_at = greatest(last_seen_at, new.created_at),
           last_path    = coalesce(new.path, last_path)
     where id = new.session_id;
  end if;
  return new;
end $$;

drop trigger if exists user_events_bump_session_trg on public.user_events;
create trigger user_events_bump_session_trg
  after insert on public.user_events
  for each row
  execute function public.user_events_bump_session();


-- =============================================================================
-- Grants: explicit so the policies above can take effect. Supabase normally
-- auto-grants in public schema, but being explicit avoids surprises.
-- =============================================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.user_sessions to anon, authenticated;
grant delete on public.user_sessions to authenticated;
grant select, insert on public.user_events to anon, authenticated;
grant delete on public.user_events to authenticated;
grant usage, select on sequence public.user_events_id_seq to anon, authenticated;


-- =============================================================================
-- Retention: purge rows older than 30 days. Admin runs this manually from panel,
-- or via pg_cron if available.
-- =============================================================================
create or replace function public.purge_old_activity(older_than_days integer default 30)
returns table(sessions_deleted bigint, events_deleted bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cutoff timestamptz := now() - (older_than_days || ' days')::interval;
  ev_del bigint;
  se_del bigint;
begin
  if not public.is_admin() then
    raise exception 'purge_old_activity: admin only';
  end if;

  delete from public.user_events   where created_at < cutoff;
  get diagnostics ev_del = row_count;

  delete from public.user_sessions where coalesce(ended_at, last_seen_at) < cutoff;
  get diagnostics se_del = row_count;

  return query select se_del, ev_del;
end $$;

revoke all on function public.purge_old_activity(integer) from public, anon;
grant execute on function public.purge_old_activity(integer) to authenticated;


-- =============================================================================
-- Helper view: admin dashboard reads this for a pre-joined list.
-- =============================================================================
create or replace view public.user_sessions_admin as
  select
    s.id,
    s.user_id,
    s.anon_id,
    s.started_at,
    s.last_seen_at,
    s.ended_at,
    s.last_path,
    s.last_event,
    s.user_agent,
    s.events_count,
    u.email             as user_email,
    p.name              as display_name,
    extract(epoch from (coalesce(s.ended_at, s.last_seen_at) - s.started_at))::integer as duration_s
  from public.user_sessions s
  left join auth.users      u on u.id = s.user_id
  left join public.profiles p on p.id = s.user_id;

alter view public.user_sessions_admin set (security_invoker = on);
grant select on public.user_sessions_admin to authenticated;

-- Done. Frontend wires up in index.html (heartbeat + trackEvent) and admin.html
-- (new "👥 Aktywność" tab with online list, sessions list, drop-off summary).
