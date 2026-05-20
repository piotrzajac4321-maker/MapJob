-- =============================================================================
-- 0001_init — extensions, helpery, common triggers
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_cron with schema extensions;

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Helper RLS: is_org_member(_org_id) — czy zalogowany user należy do org
-- -----------------------------------------------------------------------------
create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members
    where org_id = _org_id
      and user_id = auth.uid()
      and accepted_at is not null
  );
$$;

-- -----------------------------------------------------------------------------
-- Helper RLS: is_org_role(_org_id, _role) — czy user ma co najmniej daną rolę
-- Hierarchia: owner > admin > editor > viewer
-- -----------------------------------------------------------------------------
create or replace function public.is_org_role(_org_id uuid, _min_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with role_rank as (
    select case _min_role
      when 'viewer' then 1
      when 'editor' then 2
      when 'admin'  then 3
      when 'owner'  then 4
      else 99
    end as min_rank
  ),
  user_rank as (
    select case role
      when 'viewer' then 1
      when 'editor' then 2
      when 'admin'  then 3
      when 'owner'  then 4
      else 0
    end as user_rank
    from public.org_members
    where org_id = _org_id and user_id = auth.uid() and accepted_at is not null
  )
  select coalesce((select user_rank from user_rank), 0) >= (select min_rank from role_rank);
$$;

comment on function public.is_org_member is 'RLS helper — czy zalogowany user należy do organizacji.';
comment on function public.is_org_role is 'RLS helper — czy zalogowany user ma rolę >= _min_role w organizacji.';
-- =============================================================================
-- 0002_orgs_members — organizations, profiles, org_members
-- =============================================================================

-- -----------------------------------------------------------------------------
-- organizations (tenant root)
-- -----------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_organizations_updated
before update on public.organizations
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;

-- -----------------------------------------------------------------------------
-- profiles (1:1 z auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  locale text not null default 'pl',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profile_self_select" on public.profiles
  for select using (id = auth.uid());

create policy "profile_self_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profile_self_insert" on public.profiles
  for insert with check (id = auth.uid());

-- Auto-create profile po signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- org_members
-- -----------------------------------------------------------------------------
create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  role text not null check (role in ('owner','admin','editor','viewer')),
  accepted_at timestamptz,
  invite_token uuid default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id),
  check (user_id is not null or invited_email is not null)
);

create index idx_org_members_user on public.org_members(user_id);
create index idx_org_members_org on public.org_members(org_id);
create index idx_org_members_invite_token on public.org_members(invite_token) where accepted_at is null;

create trigger trg_org_members_updated
before update on public.org_members
for each row execute function public.set_updated_at();

alter table public.org_members enable row level security;

create policy "org_members_self_select" on public.org_members
  for select using (
    user_id = auth.uid()
    or public.is_org_member(org_id)
  );

create policy "org_members_admin_insert" on public.org_members
  for insert with check (public.is_org_role(org_id, 'admin'));

create policy "org_members_admin_update" on public.org_members
  for update using (public.is_org_role(org_id, 'admin'));

create policy "org_members_admin_delete" on public.org_members
  for delete using (public.is_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- organizations RLS (po stworzeniu org_members)
-- -----------------------------------------------------------------------------
create policy "org_member_select" on public.organizations
  for select using (public.is_org_member(id));

create policy "org_admin_update" on public.organizations
  for update using (public.is_org_role(id, 'admin'));

create policy "org_authenticated_insert" on public.organizations
  for insert with check (auth.uid() is not null);

-- Trigger: po stworzeniu organizacji, jej autor automatycznie staje się owner
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.org_members (org_id, user_id, role, accepted_at)
  values (new.id, auth.uid(), 'owner', now())
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_org_created
after insert on public.organizations
for each row execute function public.handle_new_organization();

comment on table public.organizations is 'Tenant root. Plan placeholder pod billing (free / starter / pro / team).';
comment on table public.org_members is 'Członkowie organizacji + zaproszenia. invite_token używany dla niezaakceptowanych zaproszeń.';
-- =============================================================================
-- 0003_posts_media — posts, post_media + storage bucket
-- =============================================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('job','sales','other')),
  title text not null,
  body_md text not null,
  framework text check (framework in ('AIDA','PAS','BAB','FAB','4U','PASTOR')),
  variants jsonb not null default '[]'::jsonb,
  ai_generation_id uuid,
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_org_status on public.posts(org_id, status);
create index idx_posts_search on public.posts using gin (to_tsvector('simple', coalesce(title,'') || ' ' || body_md));

create trigger trg_posts_updated
before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "posts_org_select" on public.posts
  for select using (public.is_org_member(org_id));

create policy "posts_editor_insert" on public.posts
  for insert with check (public.is_org_role(org_id, 'editor'));

create policy "posts_editor_update" on public.posts
  for update using (public.is_org_role(org_id, 'editor'));

create policy "posts_admin_delete" on public.posts
  for delete using (public.is_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- post_media
-- -----------------------------------------------------------------------------
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  mime text,
  width int,
  height int,
  bytes int,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_post_media_post on public.post_media(post_id, position);

alter table public.post_media enable row level security;

create policy "post_media_org_select" on public.post_media
  for select using (public.is_org_member(org_id));

create policy "post_media_editor_insert" on public.post_media
  for insert with check (public.is_org_role(org_id, 'editor'));

create policy "post_media_editor_update" on public.post_media
  for update using (public.is_org_role(org_id, 'editor'));

create policy "post_media_editor_delete" on public.post_media
  for delete using (public.is_org_role(org_id, 'editor'));

-- -----------------------------------------------------------------------------
-- Storage bucket: post-media
-- Layout: post-media/<org_id>/<post_id>/<filename>
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  false,
  8388608, -- 8 MiB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "post_media_storage_select"
on storage.objects for select
using (
  bucket_id = 'post-media'
  and public.is_org_member((storage.foldername(name))[1]::uuid)
);

create policy "post_media_storage_insert"
on storage.objects for insert
with check (
  bucket_id = 'post-media'
  and public.is_org_role((storage.foldername(name))[1]::uuid, 'editor')
);

create policy "post_media_storage_update"
on storage.objects for update
using (
  bucket_id = 'post-media'
  and public.is_org_role((storage.foldername(name))[1]::uuid, 'editor')
);

create policy "post_media_storage_delete"
on storage.objects for delete
using (
  bucket_id = 'post-media'
  and public.is_org_role((storage.foldername(name))[1]::uuid, 'editor')
);

comment on table public.posts is 'Biblioteka treści — kreatywa do późniejszego wrzucenia w kampanie. Wariancja A/B w variants jsonb.';
comment on table public.post_media is 'Obrazy/media dla posta. Storage layout: post-media/<org_id>/<post_id>/<filename>.';
-- =============================================================================
-- 0004_groups — fb_accounts, groups, extension_devices
-- =============================================================================

-- -----------------------------------------------------------------------------
-- fb_accounts — logiczna reprezentacja konta FB (TYLKO etykieta!)
-- Nigdy nie przechowujemy loginu/hasła. Cookie sesji jest w przeglądarce usera.
-- -----------------------------------------------------------------------------
create table public.fb_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  fb_user_label text not null,
  extension_fingerprint text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_fb_accounts_org on public.fb_accounts(org_id);
create unique index idx_fb_accounts_owner_label on public.fb_accounts(owner_user_id, fb_user_label);

create trigger trg_fb_accounts_updated
before update on public.fb_accounts
for each row execute function public.set_updated_at();

alter table public.fb_accounts enable row level security;

create policy "fb_accounts_org_select" on public.fb_accounts
  for select using (public.is_org_member(org_id));

create policy "fb_accounts_owner_modify" on public.fb_accounts
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- extension_devices — para (user, urządzenie). Pozwala revoke konkretnego device.
-- -----------------------------------------------------------------------------
create table public.extension_devices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null unique,
  version text,
  ua text,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_extension_devices_user on public.extension_devices(user_id);
create index idx_extension_devices_org on public.extension_devices(org_id);

alter table public.extension_devices enable row level security;

create policy "extension_devices_owner_all" on public.extension_devices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "extension_devices_admin_view" on public.extension_devices
  for select using (public.is_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- groups — grupy FB importowane przez extension
-- -----------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  fb_account_id uuid not null references public.fb_accounts(id) on delete cascade,
  fb_group_id text not null,
  name text not null,
  url text not null,
  members_count int,
  privacy text check (privacy in ('public','private','unknown')) default 'unknown',
  post_approval_required boolean not null default false,
  category text,
  tags text[] not null default '{}'::text[],
  cooldown_minutes int not null default 240 check (cooldown_minutes >= 0),
  daily_cap int not null default 2 check (daily_cap >= 0),
  last_posted_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fb_account_id, fb_group_id)
);

create index idx_groups_org on public.groups(org_id);
create index idx_groups_last_posted on public.groups(last_posted_at);
create index idx_groups_tags on public.groups using gin (tags);
create index idx_groups_active on public.groups(org_id, is_active) where is_active = true;

create trigger trg_groups_updated
before update on public.groups
for each row execute function public.set_updated_at();

alter table public.groups enable row level security;

create policy "groups_org_select" on public.groups
  for select using (public.is_org_member(org_id));

create policy "groups_editor_insert" on public.groups
  for insert with check (public.is_org_role(org_id, 'editor'));

create policy "groups_editor_update" on public.groups
  for update using (public.is_org_role(org_id, 'editor'));

create policy "groups_admin_delete" on public.groups
  for delete using (public.is_org_role(org_id, 'admin'));

comment on table public.fb_accounts is 'Logiczne konto FB usera. Tylko etykieta — sesja FB żyje w cookie przeglądarki, nigdy w naszej bazie.';
comment on table public.groups is 'Grupy FB importowane przez rozszerzenie z facebook.com/groups/joins/. Cooldown 4h default chroni przed flagowaniem.';
comment on table public.extension_devices is 'Para (user, device). Revoke przez revoked_at — Edge Function odrzuca token z revoked device.';
-- =============================================================================
-- 0005_campaigns — campaigns, campaign_targets, schedules + RPC next_target
-- =============================================================================

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  post_id uuid not null references public.posts(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','scheduled','running','paused','done')),
  randomize_order boolean not null default true,
  min_delay_seconds int not null default 90 check (min_delay_seconds >= 30),
  max_delay_seconds int not null default 240 check (max_delay_seconds >= min_delay_seconds),
  daily_cap_per_account int not null default 25 check (daily_cap_per_account >= 1),
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaigns_org_status on public.campaigns(org_id, status);

create trigger trg_campaigns_updated
before update on public.campaigns
for each row execute function public.set_updated_at();

alter table public.campaigns enable row level security;

create policy "campaigns_org_select" on public.campaigns
  for select using (public.is_org_member(org_id));

create policy "campaigns_editor_insert" on public.campaigns
  for insert with check (public.is_org_role(org_id, 'editor'));

create policy "campaigns_editor_update" on public.campaigns
  for update using (public.is_org_role(org_id, 'editor'));

create policy "campaigns_admin_delete" on public.campaigns
  for delete using (public.is_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- campaign_targets — materializacja post→grupa
-- -----------------------------------------------------------------------------
create table public.campaign_targets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','queued','in_progress','posted','skipped','failed')),
  scheduled_at timestamptz,
  attempted_at timestamptz,
  posted_at timestamptz,
  error_code text,
  error_message text,
  fb_post_url text,
  content_hash text,
  rendered_text text,
  variator_changes text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, group_id)
);

create index idx_targets_status_sched on public.campaign_targets(status, scheduled_at);
create index idx_targets_group_posted on public.campaign_targets(group_id, posted_at desc);
create index idx_targets_campaign_status on public.campaign_targets(campaign_id, status);

create trigger trg_campaign_targets_updated
before update on public.campaign_targets
for each row execute function public.set_updated_at();

alter table public.campaign_targets enable row level security;

create policy "campaign_targets_org_select" on public.campaign_targets
  for select using (public.is_org_member(org_id));

create policy "campaign_targets_editor_modify" on public.campaign_targets
  for all using (public.is_org_role(org_id, 'editor'))
  with check (public.is_org_role(org_id, 'editor'));

-- -----------------------------------------------------------------------------
-- enforce_cooldown — trigger BEFORE UPDATE to in_progress
-- Jeśli grupa była postowana za niedawno → ustaw status = 'skipped'
-- -----------------------------------------------------------------------------
create or replace function public.enforce_cooldown()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_posted timestamptz;
  v_cooldown int;
  v_daily_count int;
  v_daily_cap int;
begin
  if new.status <> 'in_progress' or old.status = 'in_progress' then
    return new;
  end if;

  select last_posted_at, cooldown_minutes, daily_cap
    into v_last_posted, v_cooldown, v_daily_cap
  from public.groups
  where id = new.group_id;

  if v_last_posted is not null
     and v_last_posted > now() - make_interval(mins => v_cooldown) then
    new.status := 'skipped';
    new.error_code := 'cooldown';
    new.error_message := format('Grupa była postowana %s temu (cooldown: %s min).',
      age(now(), v_last_posted), v_cooldown);
    return new;
  end if;

  select count(*)
    into v_daily_count
  from public.campaign_targets
  where group_id = new.group_id
    and posted_at >= date_trunc('day', now())
    and status = 'posted';

  if v_daily_count >= v_daily_cap then
    new.status := 'skipped';
    new.error_code := 'daily_cap';
    new.error_message := format('Daily cap %s osiągnięty dla tej grupy.', v_daily_cap);
    return new;
  end if;

  new.attempted_at := now();
  return new;
end;
$$;

create trigger trg_enforce_cooldown
before update on public.campaign_targets
for each row execute function public.enforce_cooldown();

-- -----------------------------------------------------------------------------
-- Po pomyślnym posted → update groups.last_posted_at
-- -----------------------------------------------------------------------------
create or replace function public.update_group_last_posted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'posted' and (old.status is distinct from 'posted') then
    new.posted_at := coalesce(new.posted_at, now());
    update public.groups
       set last_posted_at = new.posted_at
     where id = new.group_id;
  end if;
  return new;
end;
$$;

create trigger trg_update_group_last_posted
before update on public.campaign_targets
for each row execute function public.update_group_last_posted();

-- -----------------------------------------------------------------------------
-- RPC: next_target_for_device(_device_id text) → uuid
-- Bierze pod uwagę: revoked, org membership, status running, cooldown, daily_cap,
-- scheduled_at, randomize_order.
-- -----------------------------------------------------------------------------
create or replace function public.next_target_for_device(_device_id text)
returns table (
  target_id uuid,
  group_id uuid,
  campaign_id uuid,
  fb_group_id text,
  group_url text,
  rendered_text text,
  delay_seconds int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_org uuid;
begin
  select user_id, org_id into v_user, v_org
  from public.extension_devices
  where device_id = _device_id
    and revoked_at is null;

  if v_user is null then
    return;
  end if;

  return query
  with eligible as (
    select t.id as target_id,
           t.group_id,
           t.campaign_id,
           g.fb_group_id,
           g.url as group_url,
           t.rendered_text,
           c.min_delay_seconds,
           c.max_delay_seconds,
           c.randomize_order
    from public.campaign_targets t
    join public.campaigns c on c.id = t.campaign_id
    join public.groups g on g.id = t.group_id
    where t.org_id = v_org
      and t.status in ('pending','queued')
      and c.status = 'running'
      and (c.start_at is null or c.start_at <= now())
      and (c.end_at is null or c.end_at > now())
      and (t.scheduled_at is null or t.scheduled_at <= now())
      and g.is_active = true
      and (
        g.last_posted_at is null
        or g.last_posted_at < now() - make_interval(mins => g.cooldown_minutes)
      )
  ),
  picked as (
    select * from eligible
    order by case when randomize_order then random() else 0 end, target_id
    limit 1
  )
  select p.target_id,
         p.group_id,
         p.campaign_id,
         p.fb_group_id,
         p.group_url,
         p.rendered_text,
         (p.min_delay_seconds + floor(random() * (p.max_delay_seconds - p.min_delay_seconds + 1)))::int as delay_seconds
  from picked p;
end;
$$;

grant execute on function public.next_target_for_device(text) to authenticated;

-- -----------------------------------------------------------------------------
-- schedules — wzorce cron dla kampanii (placeholder pod harmonogram)
-- -----------------------------------------------------------------------------
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  cron_expr text not null,
  timezone text not null default 'Europe/Warsaw',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_schedules_org on public.schedules(org_id);

create trigger trg_schedules_updated
before update on public.schedules
for each row execute function public.set_updated_at();

alter table public.schedules enable row level security;

create policy "schedules_org_select" on public.schedules
  for select using (public.is_org_member(org_id));

create policy "schedules_editor_all" on public.schedules
  for all using (public.is_org_role(org_id, 'editor'))
  with check (public.is_org_role(org_id, 'editor'));

comment on table public.campaign_targets is 'Materializacja kampania→grupa. Trigger enforce_cooldown automatycznie przepuszcza skipped jeśli za szybko po ostatnim poście.';
comment on function public.next_target_for_device is 'Extension RPC — bierze następny target do postowania, respektuje cooldown, daily_cap, scheduled_at i randomize_order.';
-- =============================================================================
-- 0006_ai_generations — audyt + koszty AI + rate limiting
-- =============================================================================

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  model text not null,
  framework text,
  brief jsonb not null,
  system_prompt_hash text,
  prompt_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_usd numeric(10,4) not null default 0,
  output_md text not null,
  variants jsonb not null default '[]'::jsonb,
  human_score int,
  warnings text[] not null default '{}'::text[],
  regenerated int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_ai_generations_org_created on public.ai_generations(org_id, created_at desc);
create index idx_ai_generations_user_created on public.ai_generations(user_id, created_at desc);

alter table public.ai_generations enable row level security;

create policy "ai_generations_org_select" on public.ai_generations
  for select using (public.is_org_member(org_id));

-- Insert tylko przez Edge Function (service role), nie z klienta
-- Brak policy dla INSERT → tylko service_role może wstawiać

-- -----------------------------------------------------------------------------
-- assert_ai_quota — rate limiting per user/h i per org/day
-- -----------------------------------------------------------------------------
create or replace function public.assert_ai_quota(_org_id uuid, _user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_hour int;
  v_org_day int;
  v_user_limit int := 20;
  v_org_limit int := 200;
begin
  select count(*) into v_user_hour
  from public.ai_generations
  where user_id = _user_id
    and created_at >= now() - interval '1 hour';

  if v_user_hour >= v_user_limit then
    raise exception 'AI quota exceeded (per user / hour)'
      using errcode = 'P0001', detail = format('limit=%s window=1h', v_user_limit);
  end if;

  select count(*) into v_org_day
  from public.ai_generations
  where org_id = _org_id
    and created_at >= now() - interval '24 hours';

  if v_org_day >= v_org_limit then
    raise exception 'AI quota exceeded (per org / day)'
      using errcode = 'P0001', detail = format('limit=%s window=24h', v_org_limit);
  end if;
end;
$$;

grant execute on function public.assert_ai_quota(uuid, uuid) to authenticated;

-- Foreign key z posts.ai_generation_id → ai_generations(id) (po stworzeniu tabeli)
alter table public.posts
  add constraint posts_ai_generation_fk
  foreign key (ai_generation_id) references public.ai_generations(id) on delete set null;

comment on table public.ai_generations is 'Audyt każdej generacji AI: model, brief, tokeny, koszt, human_score. Insert tylko przez Edge Function ai-generate.';
comment on function public.assert_ai_quota is 'Rate limiting: 20/h per user, 200/24h per org. Rzuca P0001 przy przekroczeniu.';
-- =============================================================================
-- 0007_audit_log — append-only audit + telemetria
-- =============================================================================

create table public.audit_log (
  id bigserial primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_org_created on public.audit_log(org_id, created_at desc);
create index idx_audit_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_action on public.audit_log(action);

alter table public.audit_log enable row level security;

create policy "audit_org_select" on public.audit_log
  for select using (public.is_org_member(org_id));

-- INSERT tylko przez log_audit() (SECURITY DEFINER) lub service_role
revoke insert on public.audit_log from authenticated;

create or replace function public.log_audit(
  _org_id uuid,
  _action text,
  _entity_type text default null,
  _entity_id uuid default null,
  _meta jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if not public.is_org_member(_org_id) then
    raise exception 'not a member of org %', _org_id;
  end if;

  insert into public.audit_log (org_id, actor_user_id, action, entity_type, entity_id, meta)
  values (_org_id, auth.uid(), _action, _entity_type, _entity_id, coalesce(_meta, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.log_audit(uuid, text, text, uuid, jsonb) to authenticated;

comment on table public.audit_log is 'Append-only audit. Insert tylko przez log_audit() (SECURITY DEFINER) — zapewnia integralność.';
-- =============================================================================
-- 0008_analytics_views — agregaty pod dashboard
-- =============================================================================

-- Posty per dzień (organizacja)
create or replace view public.v_posts_per_day as
select
  org_id,
  date_trunc('day', posted_at) as day,
  count(*) filter (where status = 'posted') as posted_count,
  count(*) filter (where status = 'skipped') as skipped_count,
  count(*) filter (where status = 'failed') as failed_count
from public.campaign_targets
where posted_at is not null or status in ('skipped','failed')
group by org_id, date_trunc('day', posted_at);

-- Success rate per grupa
create or replace view public.v_group_success_rate as
select
  g.org_id,
  g.id as group_id,
  g.name as group_name,
  g.url as group_url,
  count(t.*) filter (where t.status = 'posted') as posted_count,
  count(t.*) filter (where t.status in ('failed','skipped')) as failed_count,
  count(t.*) as total_attempts,
  case
    when count(t.*) > 0
    then round(100.0 * count(t.*) filter (where t.status = 'posted') / count(t.*), 1)
    else null
  end as success_rate_pct,
  max(t.posted_at) as last_posted_at
from public.groups g
left join public.campaign_targets t on t.group_id = g.id
group by g.org_id, g.id, g.name, g.url;

-- Wydajność kampanii
create or replace view public.v_campaign_summary as
select
  c.org_id,
  c.id as campaign_id,
  c.name as campaign_name,
  c.status as campaign_status,
  c.created_at,
  count(t.*) as targets_total,
  count(t.*) filter (where t.status = 'pending') as pending,
  count(t.*) filter (where t.status = 'posted') as posted,
  count(t.*) filter (where t.status = 'skipped') as skipped,
  count(t.*) filter (where t.status = 'failed') as failed,
  case
    when count(t.*) > 0
    then round(100.0 * count(t.*) filter (where t.status = 'posted') / count(t.*), 1)
    else 0
  end as posted_pct
from public.campaigns c
left join public.campaign_targets t on t.campaign_id = c.id
group by c.org_id, c.id, c.name, c.status, c.created_at;

-- Best posting hours (kiedy najlepiej publikować, godzinach 0-23)
create or replace view public.v_best_hours as
select
  org_id,
  extract(hour from posted_at)::int as hour_of_day,
  count(*) filter (where status = 'posted') as posted_count
from public.campaign_targets
where posted_at is not null
group by org_id, extract(hour from posted_at)::int;

-- Top problemy (telemetria błędów)
create or replace view public.v_error_codes as
select
  org_id,
  error_code,
  count(*) as occurrences,
  max(created_at) as last_seen
from public.campaign_targets
where status in ('failed','skipped') and error_code is not null
group by org_id, error_code;

-- Selector health (z audit_log: events 'selector_miss')
create or replace view public.v_selector_health as
select
  org_id,
  (meta->>'selector_name') as selector_name,
  count(*) as misses,
  max(created_at) as last_miss
from public.audit_log
where action = 'extension.selector_miss'
  and created_at >= now() - interval '7 days'
group by org_id, (meta->>'selector_name');

comment on view public.v_posts_per_day is 'Dashboard: ile postów dziennie / status breakdown.';
comment on view public.v_group_success_rate is 'Dashboard: która grupa najlepiej działa.';
comment on view public.v_campaign_summary is 'Dashboard: status pasków kampanii (X/Y posted).';
comment on view public.v_best_hours is 'Dashboard: heatmapa godzinowa skutecznych publikacji.';
comment on view public.v_error_codes is 'Telemetria: najczęstsze błędy postowania (cooldown, daily_cap, no_publish_detected, login_required).';
comment on view public.v_selector_health is 'Admin: które selektory DOM Facebooka się sypią (sygnał do update extension).';
