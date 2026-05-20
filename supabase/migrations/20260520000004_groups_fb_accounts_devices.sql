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
