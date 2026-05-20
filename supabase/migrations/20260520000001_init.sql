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
