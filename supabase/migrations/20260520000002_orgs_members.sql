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
