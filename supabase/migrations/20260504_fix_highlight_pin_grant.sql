-- Naprawa RPC public.highlight_pin:
--   1. Bug bezpieczeństwa — funkcja ufała argumentowi p_user_id, więc
--      potencjalnie pozwalała wywołującemu wskazać cudze ID jako p_user_id
--      i zużyć cudze sloty wyróżnień. Po naprawie funkcja używa auth.uid()
--      i odrzuca p_user_id rozjeżdżający się z tożsamością z JWT.
--   2. ACL — istniejąca funkcja miała EXECUTE tylko dla postgres + service_role,
--      przez co frontend (rola authenticated) dostawał 403 przy wywołaniu
--      _sb.rpc('highlight_pin', ...). Po grant authenticated może wołać
--      przez REST RPC z własnego JWT.
-- Sygnatura zachowana (p_pin_id uuid, p_user_id uuid) — frontend bez zmian.

create or replace function public.highlight_pin(p_pin_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_limit integer;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Wymagane logowanie');
  end if;
  if p_user_id is not null and p_user_id <> v_uid then
    return jsonb_build_object('success', false, 'error', 'Nieprawidłowy użytkownik');
  end if;

  if not exists (
    select 1 from public.pins where id = p_pin_id and user_id = v_uid
  ) then
    return jsonb_build_object('success', false, 'error', 'Pin nie należy do Ciebie');
  end if;

  select coalesce(highlight_limit, 0) into v_limit
  from public.subscriptions where user_id = v_uid;

  if v_limit <= 0 then
    return jsonb_build_object('success', false, 'error', 'Brak wyróżnień — kup w sklepie');
  end if;

  update public.pins set
    is_highlighted       = true,
    highlighted_at       = now(),
    highlight_expires_at = now() + interval '30 days',
    updated_at           = now()
  where id = p_pin_id;

  update public.subscriptions set
    highlight_limit  = highlight_limit - 1,
    highlights_used  = coalesce(highlights_used, 0) + 1,
    updated_at       = now()
  where user_id = v_uid;

  return jsonb_build_object(
    'success', true,
    'expires_at', (now() + interval '30 days')::text,
    'highlights_left', (select highlight_limit from public.subscriptions where user_id = v_uid)
  );
end;
$function$;

grant execute on function public.highlight_pin(uuid, uuid) to authenticated;
