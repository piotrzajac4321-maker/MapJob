-- LAUNCH PROMO: 500 pierwszych nowych użytkowników dostaje za darmo
-- Portfolio Pro (3 miesiące) + Premium (3 miesiące).
-- Promocja startuje 12.05.2026.
--
-- Wzorowane na claim_early_bird (100 slotów Plan Pro + Portfolio),
-- ale: większy cap (500), inny pakiet (Premium 3m), data startu.

-- 1) Konfiguracja promo (single-row)
CREATE TABLE IF NOT EXISTS public.launch_promo_config (
  id           int PRIMARY KEY DEFAULT 1,
  cap          int NOT NULL DEFAULT 500,
  starts_at    timestamptz NOT NULL DEFAULT '2026-05-12 00:00:00+02'::timestamptz,
  active       boolean NOT NULL DEFAULT true,
  CONSTRAINT launch_promo_config_singleton CHECK (id = 1)
);

INSERT INTO public.launch_promo_config (id, cap, starts_at, active)
VALUES (1, 500, '2026-05-12 00:00:00+02', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Tabela odbiorów
CREATE TABLE IF NOT EXISTS public.launch_promo_claims (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at  timestamptz NOT NULL DEFAULT now(),
  -- snapshot co dostał użytkownik (na wypadek przyszłych zmian regulaminu promo)
  granted_portfolio_pro     boolean NOT NULL DEFAULT true,
  granted_premium_monthly   boolean NOT NULL DEFAULT true,
  portfolio_pro_months      int NOT NULL DEFAULT 3,
  premium_months            int NOT NULL DEFAULT 3,
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS launch_promo_claims_claimed_at_idx
  ON public.launch_promo_claims (claimed_at DESC);

ALTER TABLE public.launch_promo_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_promo_config  ENABLE ROW LEVEL SECURITY;

-- Odczyt swojego claim (na wypadek gdyby ktoś chciał odpytać bezpośrednio)
DROP POLICY IF EXISTS launch_promo_claims_self_read ON public.launch_promo_claims;
CREATE POLICY launch_promo_claims_self_read
  ON public.launch_promo_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3) Statystyki promo — publiczne (anon i zalogowani)
CREATE OR REPLACE FUNCTION public.get_launch_promo_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count        int;
  v_cap          int;
  v_starts_at    timestamptz;
  v_active       boolean;
  v_user_claimed boolean := false;
  v_uid          uuid    := auth.uid();
BEGIN
  SELECT cap, starts_at, active
    INTO v_cap, v_starts_at, v_active
    FROM public.launch_promo_config WHERE id = 1;

  IF v_cap IS NULL THEN
    v_cap := 500;
    v_starts_at := '2026-05-12 00:00:00+02'::timestamptz;
    v_active := true;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.launch_promo_claims;

  IF v_uid IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.launch_promo_claims WHERE user_id = v_uid
    ) INTO v_user_claimed;
  END IF;

  RETURN jsonb_build_object(
    'claimed',       v_count,
    'cap',           v_cap,
    'remaining',     GREATEST(0, v_cap - v_count),
    'starts_at',     v_starts_at,
    'active',        v_active,
    'user_claimed',  v_user_claimed,
    'is_open',       v_active
                     AND now() >= v_starts_at
                     AND v_count < v_cap
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_launch_promo_stats() TO anon, authenticated;

-- 4) Odbiór promo — atomowy, security definer
CREATE OR REPLACE FUNCTION public.claim_launch_promo()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_cap        int;
  v_starts_at  timestamptz;
  v_active     boolean;
  v_count      int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'auth_required');
  END IF;

  -- Zablokuj config row na czas transakcji (anty-race przy 500. odbiorze)
  SELECT cap, starts_at, active
    INTO v_cap, v_starts_at, v_active
    FROM public.launch_promo_config
    WHERE id = 1
    FOR UPDATE;

  IF NOT v_active THEN
    RETURN jsonb_build_object('ok', false, 'error', 'promo_inactive');
  END IF;

  IF now() < v_starts_at THEN
    RETURN jsonb_build_object(
      'ok', false, 'error', 'promo_not_started',
      'starts_at', v_starts_at
    );
  END IF;

  -- Już odebrałeś?
  IF EXISTS (
    SELECT 1 FROM public.launch_promo_claims WHERE user_id = v_uid
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  -- Cap (z lockiem na config row powyżej — bezpieczne)
  SELECT COUNT(*) INTO v_count FROM public.launch_promo_claims;
  IF v_count >= v_cap THEN
    RETURN jsonb_build_object(
      'ok', false, 'error', 'cap_reached', 'cap', v_cap
    );
  END IF;

  -- Aktywuj pakiety bezpośrednio. NIE używamy activate_package, bo ma B2 guard
  -- blokujący wywołania spoza service_role/admina (anti self-grant attack).
  -- Mamy SECURITY DEFINER + atomową walidację cap → bezpieczna, dedykowana ścieżka.
  --
  -- WAŻNE: NIE dajemy pin_limit, highlight_limit ani special_badge.
  -- Piny i wyróżnienia to nasz revenue stream — muszą być kupowane osobno.
  -- Promo daje wyłącznie dostęp funkcjonalny: Portfolio Pro + Plan Premium (Giełda).

  -- Upewnij się że wiersz subscriptions istnieje
  INSERT INTO public.subscriptions (user_id, updated_at)
       VALUES (v_uid, now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Portfolio Pro + Plan Premium — wszystko 3 miesiące, BEZ pin/highlight limitów
  UPDATE public.subscriptions
     SET premium_monthly            = true,
         premium_monthly_expires_at = GREATEST(COALESCE(premium_monthly_expires_at, now()), now() + interval '3 months'),
         plan_pro                   = true,
         plan_pro_expires_at        = GREATEST(COALESCE(plan_pro_expires_at, now()), now() + interval '3 months'),
         portfolio_pro              = true,
         portfolio_pro_expires_at   = GREATEST(COALESCE(portfolio_pro_expires_at, now()), now() + interval '3 months'),
         updated_at                 = now()
   WHERE user_id = v_uid;

  UPDATE public.profiles
     SET plan            = 'premium',
         plan_expires_at = GREATEST(COALESCE(plan_expires_at, now()), now() + interval '3 months'),
         portfolio_pro   = true,
         updated_at      = now()
   WHERE id = v_uid;

  -- pins: oznacz że właściciel ma Pro + portfolio (status flagi, NIE wyróżnienia wizualne)
  UPDATE public.pins
     SET is_pro        = true,
         has_portfolio = true,
         updated_at    = now()
   WHERE user_id = v_uid AND is_active = true;

  -- Aktywacja OK → zapis claim (gdyby cokolwiek powyżej raisnęło, transakcja
  -- się cofnie i claim się nie zapisze — bezpieczne)
  INSERT INTO public.launch_promo_claims (user_id) VALUES (v_uid);

  RETURN jsonb_build_object(
    'ok',         true,
    'claimed',    v_count + 1,
    'cap',        v_cap,
    'remaining',  v_cap - v_count - 1,
    'granted',    jsonb_build_object(
                    'portfolio_pro_months',  3,
                    'premium_months',        3
                  )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_launch_promo() TO authenticated;

-- 5) Recent claims dla social-proof toast (RODO-safe: tylko pierwsze imię + miasto z pinu)
CREATE OR REPLACE FUNCTION public.get_recent_promo_claims(p_limit int DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_arr jsonb;
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 20);
BEGIN
  SELECT jsonb_agg(
           jsonb_build_object(
             'first_name',  CASE
                              WHEN p.name IS NULL OR length(trim(p.name)) = 0 THEN 'Użytkownik'
                              ELSE split_part(trim(p.name), ' ', 1)
                            END,
             'city',        pin.city,
             'claimed_at',  c.claimed_at,
             'minutes_ago', GREATEST(0, floor(EXTRACT(EPOCH FROM (now() - c.claimed_at))/60))
           )
           ORDER BY c.claimed_at DESC
         )
    INTO v_arr
  FROM (
    SELECT user_id, claimed_at
      FROM public.launch_promo_claims
      ORDER BY claimed_at DESC
      LIMIT v_limit
  ) c
  LEFT JOIN public.profiles p ON p.id = c.user_id
  LEFT JOIN LATERAL (
    SELECT city FROM public.pins
     WHERE user_id = c.user_id AND is_active = true AND city IS NOT NULL
     ORDER BY created_at ASC LIMIT 1
  ) pin ON true;

  RETURN COALESCE(v_arr, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_promo_claims(int) TO anon, authenticated;

COMMENT ON FUNCTION public.get_launch_promo_stats() IS
  'Publiczne statystyki promocji startowej (cap 500, start 2026-05-12). '
  'Zwraca: claimed, cap, remaining, is_open, user_claimed (jeśli zalogowany).';

COMMENT ON FUNCTION public.get_recent_promo_claims(int) IS
  'Ostatnie N (1..20, domyślnie 5) odbiorów promo — pierwsze imię + miasto z pinu. '
  'RODO-safe (bez nazwiska, bez email/telefonu). Dla social-proof toast w UI.';

COMMENT ON FUNCTION public.claim_launch_promo() IS
  'Atomowy odbiór promocji startowej. Wymaga auth. Sprawdza: aktywność, datę startu, '
  'cap 500, brak wcześniejszego odbioru. Aktywuje portfolio_pro (3m) + premium_monthly (3m) '
  'bezpośrednim UPDATE — BEZ pin_limit, highlight_limit, special_badge (revenue stream).';
