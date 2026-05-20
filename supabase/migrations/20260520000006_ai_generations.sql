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
