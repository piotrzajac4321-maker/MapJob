-- Rate-limit helper: liczy wywołania pin-write usera w ostatnich 24h.
-- Wywołane z edge function pin-write przed każdym callem do Anthropic.
-- Wzorzec identyczny jak public.cv_write_calls_last_24h
-- (migration 20260422_cv_documents.sql).

create or replace function public.pin_write_calls_last_24h(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*)::integer, 0)
    from public.user_events
    where user_id = p_user_id
      and event_type = 'pin_write_call'
      and created_at > now() - interval '24 hours'
$$;

grant execute on function public.pin_write_calls_last_24h(uuid)
  to anon, authenticated, service_role;
