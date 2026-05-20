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
