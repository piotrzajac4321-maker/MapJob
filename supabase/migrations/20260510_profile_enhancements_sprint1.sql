-- =============================================================================
-- Sprint 1: Profile enhancements (quick wins)
-- =============================================================================
-- Dodaje pola do pins oraz RPC agregujący metryki profilu.
-- Bezpieczne: tylko ADD COLUMN IF NOT EXISTS i nowe RPC. Nie modyfikuje istniejących.
--
-- Funkcje obsługiwane przez tę migrację:
--   1A — licznik wyświetleń profilu  → RPC get_profile_extras (view_count_7d/30d)
--   1B — linki social mediów         → pins.social_links (jsonb)
--   1C — języki                      → pins.languages (text[])
--   1E — poziomy umiejętności        → pins.skill_levels (jsonb)
--   1F — "aktywny X dni temu"        → RPC get_profile_extras (last_seen_at)
--   1G — formy płatności             → pins.payment_methods (text[])
--   1H — senioritet                  → RPC get_profile_extras (member_since)
--   1I — kolor akcentu profilu       → pins.accent_color (text)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1B: linki social media
-- Schema: { website, facebook, instagram, youtube, linkedin, tiktok }
-- ----------------------------------------------------------------------------
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS social_links jsonb;
COMMENT ON COLUMN public.pins.social_links IS
  'JSON: { website, facebook, instagram, youtube, linkedin, tiktok } — opcjonalne URL.';

-- ----------------------------------------------------------------------------
-- 1C: języki w jakich fachowiec się porozumiewa
-- ISO 639-1 codes: pl, en, de, ua, ru, fr, es, it, cs, sk, ...
-- ----------------------------------------------------------------------------
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS languages text[];
COMMENT ON COLUMN public.pins.languages IS
  'Array kodów ISO 639-1: pl, en, de, ua, ru, fr, es, it, cs, sk.';

-- ----------------------------------------------------------------------------
-- 1E: poziomy umiejętności (oddzielnie od istniejącego `tags`, dla backwards compat)
-- Schema: [{ name: "Elektryka", level: "expert" }, ...]
-- level: junior | mid | senior | expert
-- ----------------------------------------------------------------------------
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS skill_levels jsonb;
COMMENT ON COLUMN public.pins.skill_levels IS
  'JSON array: [{ name, level }] — level w ∈ junior | mid | senior | expert.';

-- ----------------------------------------------------------------------------
-- 1G: akceptowane formy płatności
-- Wartości: vat, faktura, blik, transfer, cash, card
-- ----------------------------------------------------------------------------
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS payment_methods text[];
COMMENT ON COLUMN public.pins.payment_methods IS
  'Array: vat, faktura, blik, transfer, cash, card.';

-- ----------------------------------------------------------------------------
-- 1I: kolor akcentu profilu (override domyślnego koloru pinu)
-- Hex color z presetowanej palety frontendowej.
-- ----------------------------------------------------------------------------
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS accent_color text;
COMMENT ON COLUMN public.pins.accent_color IS
  'Hex color (np. #2563EB) — używany jako akcent w cover/borderach profilu.';

-- ----------------------------------------------------------------------------
-- 1A + 1F + 1H: agregator metryk profilu
-- Zwraca jeden JSON z czterema polami:
--   member_since   — kiedy user założył konto (z auth.users via profiles.created_at)
--   last_seen_at   — ostatnia aktywność (z user_sessions)
--   view_count_7d  — liczba wyświetleń profilu w ostatnich 7 dniach
--   view_count_30d — j.w. ale 30 dni
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_extras(profile_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'member_since', p.created_at,
    'last_seen_at', (
      SELECT MAX(s.last_seen_at)
      FROM public.user_sessions s
      WHERE s.user_id = p.id
    ),
    'view_count_7d', (
      SELECT COUNT(*)::int
      FROM public.user_events
      WHERE event_type = 'view_profile'
        AND target_id = p.id::text
        AND created_at > now() - INTERVAL '7 days'
    ),
    'view_count_30d', (
      SELECT COUNT(*)::int
      FROM public.user_events
      WHERE event_type = 'view_profile'
        AND target_id = p.id::text
        AND created_at > now() - INTERVAL '30 days'
    )
  )
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;

REVOKE ALL ON FUNCTION public.get_profile_extras(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_profile_extras(uuid) TO anon, authenticated;

COMMENT ON FUNCTION public.get_profile_extras IS
  'Sprint 1 — zwraca metryki profilu publicznego: member_since, last_seen_at, view_count_7d, view_count_30d.';

-- =============================================================================
-- Verify (opcjonalnie po apply):
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'pins' AND column_name IN
--          ('social_links','languages','skill_levels','payment_methods','accent_color');
--   -- powinno zwrócić 5 wierszy
--
--   SELECT public.get_profile_extras('<dowolny-user-id>'::uuid);
--   -- powinno zwrócić JSON z 4 polami
-- =============================================================================
