-- =============================================================================
-- Boost dnia: śledzenie aktywacji promowania ogłoszeń (PILNE / is_urgent)
-- =============================================================================
-- Każde zakupione promowanie (boost dnia) zapisuje wiersz w job_boosts.
-- Statystyki dostępne przez edge_get_boost_stats() — tylko service_role.
-- =============================================================================

-- Kolumna is_urgent na job_offers (ustawiana po opłaceniu boosta)
ALTER TABLE public.job_offers ADD COLUMN IF NOT EXISTS is_urgent boolean NOT NULL DEFAULT false;

-- Tabela historii aktywacji boostów
CREATE TABLE IF NOT EXISTS public.job_boosts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_offer_id uuid        NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz,
  amount_grosz integer     -- cena w groszach (np. 1900 = 19 zł)
);

CREATE INDEX IF NOT EXISTS idx_job_boosts_job        ON public.job_boosts(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_job_boosts_activated  ON public.job_boosts(activated_at);

-- RLS: tabela tylko dla service_role (admin edge function); użytkownicy nie mają dostępu
ALTER TABLE public.job_boosts ENABLE ROW LEVEL SECURITY;

-- Brak publicznych polityk = brak dostępu dla anon/authenticated (service_role pomija RLS)

-- =============================================================================
-- Statystyki boostów dla panelu (edge function / service_role)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.edge_get_boost_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE r jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total',   (SELECT count(*)::int FROM job_boosts),
    'h24',     (SELECT count(*)::int FROM job_boosts WHERE activated_at > now() - interval '24 hours'),
    'd7',      (SELECT count(*)::int FROM job_boosts WHERE activated_at > now() - interval '7 days'),
    'd30',     (SELECT count(*)::int FROM job_boosts WHERE activated_at > now() - interval '30 days'),
    'active',  (SELECT count(*)::int FROM job_offers  WHERE is_urgent = true)
  ) INTO r;
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.edge_get_boost_stats() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.edge_get_boost_stats() TO service_role;
