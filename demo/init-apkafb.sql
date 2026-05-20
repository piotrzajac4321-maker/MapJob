-- =============================================================================
-- MapJob FB Poster — schema dla projektu Apka fb
-- Wklej całość do Supabase SQL Editor i kliknij Run.
-- afqibinzwgdidumvjxyo.supabase.co
-- =============================================================================

-- 1. DEVICES — każdy Chrome z extension = jeden device
create table if not exists public.devices (
  id text primary key,                    -- UUID generowane przez extension
  label text,                              -- "MacBook Piotra" lub "Chrome - Windows"
  fb_user_label text,                      -- "Piotr Zając" (jeśli rozpoznane)
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- 2. IMPORTED GROUPS — lista grup zaimportowana z FB
create table if not exists public.imported_groups (
  device_id text not null references public.devices(id) on delete cascade,
  fb_group_id text not null,
  name text not null,
  url text not null,
  members_count int,
  privacy text check (privacy in ('public','private','unknown')) default 'unknown',
  tags text[] not null default '{}',
  cooldown_minutes int not null default 240,
  daily_cap int not null default 2,
  is_active boolean not null default true,
  last_posted_at timestamptz,
  imported_at timestamptz not null default now(),
  primary key (device_id, fb_group_id)
);

create index if not exists idx_groups_active on public.imported_groups (device_id, is_active);

-- 3. PUBLICATIONS — każda próba publikacji
create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  device_id text not null references public.devices(id) on delete cascade,
  fb_group_id text not null,
  group_name text,
  campaign_name text,
  post_title text,
  post_body text not null,
  status text not null check (status in ('pending','queued','in_progress','posted','skipped','failed')),
  scheduled_at timestamptz,
  attempted_at timestamptz,
  posted_at timestamptz,
  fb_post_url text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_publications_device_posted on public.publications (device_id, posted_at desc);
create index if not exists idx_publications_status on public.publications (device_id, status);
create index if not exists idx_publications_group on public.publications (fb_group_id);

-- Trigger updated_at (pinned search_path)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_publications_updated on public.publications;
create trigger trg_publications_updated before update on public.publications
for each row execute function public.set_updated_at();

-- 4. ENGAGEMENT — re-scrape opublikowanych postów (reactions + comments)
create table if not exists public.engagement (
  id bigserial primary key,
  publication_id uuid not null references public.publications(id) on delete cascade,
  reactions_count int not null default 0,
  comments_count int not null default 0,
  shares_count int not null default 0,
  scraped_at timestamptz not null default now()
);

create index if not exists idx_engagement_pub on public.engagement (publication_id, scraped_at desc);

-- 5. ACTIVITY LOG — wszystko co się dzieje
create table if not exists public.activity_log (
  id bigserial primary key,
  device_id text not null references public.devices(id) on delete cascade,
  event_type text not null,                -- 'scrape', 'post_started', 'post_done', 'post_failed', 'login_needed'
  message text,
  fb_group_id text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_device_time on public.activity_log (device_id, created_at desc);

-- 6. RLS — publishable key (anon role) może wszystko (single-user MVP)
-- Później można zaostrzyć po device_id jeśli wprowadzimy auth
alter table public.devices enable row level security;
alter table public.imported_groups enable row level security;
alter table public.publications enable row level security;
alter table public.engagement enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "anon devices" on public.devices;
create policy "anon devices" on public.devices for all to anon using (true) with check (true);

drop policy if exists "anon groups" on public.imported_groups;
create policy "anon groups" on public.imported_groups for all to anon using (true) with check (true);

drop policy if exists "anon pubs" on public.publications;
create policy "anon pubs" on public.publications for all to anon using (true) with check (true);

drop policy if exists "anon eng" on public.engagement;
create policy "anon eng" on public.engagement for all to anon using (true) with check (true);

drop policy if exists "anon activity" on public.activity_log;
create policy "anon activity" on public.activity_log for all to anon using (true) with check (true);

-- 7. ANALYTICS VIEWS — pod dashboard (security_invoker = respektuje RLS)
create or replace view public.v_publications_per_day with (security_invoker = true) as
select device_id,
       date_trunc('day', posted_at)::date as day,
       count(*) filter (where status = 'posted') as posted,
       count(*) filter (where status = 'skipped') as skipped,
       count(*) filter (where status = 'failed') as failed
from public.publications
where posted_at is not null
group by device_id, date_trunc('day', posted_at)::date;

create or replace view public.v_publications_per_hour with (security_invoker = true) as
select device_id,
       extract(dow from posted_at)::int as day_of_week,    -- 0=niedz, 1=pon, ...
       extract(hour from posted_at)::int as hour_of_day,
       count(*) filter (where status = 'posted') as posted
from public.publications
where posted_at is not null
group by device_id, extract(dow from posted_at)::int, extract(hour from posted_at)::int;

create or replace view public.v_top_groups with (security_invoker = true) as
select p.device_id,
       p.fb_group_id,
       max(p.group_name) as group_name,
       count(*) filter (where p.status = 'posted') as posted_count,
       count(*) filter (where p.status in ('skipped', 'failed')) as failed_count,
       count(*) as total_attempts,
       max(p.posted_at) as last_posted_at,
       coalesce(sum(e.reactions_count), 0) as total_reactions,
       coalesce(sum(e.comments_count), 0) as total_comments
from public.publications p
left join lateral (
  select reactions_count, comments_count
  from public.engagement e2
  where e2.publication_id = p.id
  order by e2.scraped_at desc
  limit 1
) e on true
group by p.device_id, p.fb_group_id;

create or replace view public.v_dashboard_stats with (security_invoker = true) as
select d.id as device_id,
       (select count(*) from public.imported_groups g where g.device_id = d.id and g.is_active) as active_groups,
       (select count(*) from public.imported_groups g where g.device_id = d.id) as total_groups,
       (select count(*) from public.publications p where p.device_id = d.id and p.status = 'posted') as total_posted,
       (select count(*) from public.publications p where p.device_id = d.id and p.status = 'posted' and p.posted_at >= current_date) as posted_today,
       (select count(*) from public.publications p where p.device_id = d.id and p.status = 'posted' and p.posted_at >= now() - interval '7 days') as posted_7d,
       (select count(*) from public.publications p where p.device_id = d.id and p.status in ('pending', 'queued')) as pending,
       (select count(*) from public.publications p where p.device_id = d.id and p.status = 'failed' and p.created_at >= now() - interval '7 days') as failed_7d
from public.devices d;

-- Gotowe. Teraz extension i web app są gotowe do podpięcia.
-- W razie potrzeby reset: drop schema public cascade; create schema public;
