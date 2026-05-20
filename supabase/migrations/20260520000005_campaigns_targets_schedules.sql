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
