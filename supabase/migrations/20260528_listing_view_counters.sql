-- =============================================================================
-- Per-listing view counters: pins (profile fachowca) + tenders (zlecenia)
-- =============================================================================
-- Mirrors the existing increment_job_view pattern. RODO-safe: counts are
-- anonymous aggregates; dedup uses only the server-side auth.uid() for logged-in
-- users — nothing is stored on the visitor's device, so it works WITHOUT the
-- analytics cookie consent.
--
-- Bonus: the live page_views table was missing the dedup columns the RPC relies
-- on, which silently broke increment_job_view for logged-in users. Adding them
-- here restores it and unifies all listing types on one mechanism.
-- =============================================================================

-- 1) page_views: dedup columns used by every increment_*_view RPC.
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS user_id   uuid;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS page_type text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS ref_id    uuid;

CREATE INDEX IF NOT EXISTS idx_page_views_dedup
  ON public.page_views (page_type, ref_id, user_id, created_at);

-- 2) per-listing counters
ALTER TABLE public.pins    ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

-- 3) increment RPCs (1 view / logged-in user / hour; anon always counts, like jobs)
CREATE OR REPLACE FUNCTION public.increment_pin_view(p_pin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM page_views
      WHERE page_type = 'pin' AND ref_id = p_pin_id
        AND user_id = v_user AND created_at > now() - interval '1 hour'
    ) THEN RETURN; END IF;
    INSERT INTO page_views(user_id, page_type, ref_id)
    VALUES (v_user, 'pin', p_pin_id) ON CONFLICT DO NOTHING;
  END IF;
  UPDATE pins SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_pin_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'increment_pin_view: %', SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_tender_view(p_tender_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM page_views
      WHERE page_type = 'tender' AND ref_id = p_tender_id
        AND user_id = v_user AND created_at > now() - interval '1 hour'
    ) THEN RETURN; END IF;
    INSERT INTO page_views(user_id, page_type, ref_id)
    VALUES (v_user, 'tender', p_tender_id) ON CONFLICT DO NOTHING;
  END IF;
  UPDATE tenders SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_tender_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'increment_tender_view: %', SQLERRM;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.increment_pin_view(uuid)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tender_view(uuid) TO anon, authenticated;

-- =============================================================================
-- Unique logged-in viewers per listing (admin analytics, RODO legitimate interest)
-- =============================================================================
-- Aggregates page_views by user_id. Admin-only. Returns COUNTS only, never the
-- raw "who viewed what" rows, so no personal viewing history leaves the DB.
CREATE OR REPLACE FUNCTION public.admin_get_listing_unique_viewers(p_page_type text)
RETURNS TABLE(ref_id uuid, uniq integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT pv.ref_id, COUNT(DISTINCT pv.user_id)::int AS uniq
    FROM page_views pv
    WHERE pv.page_type = p_page_type
      AND pv.ref_id IS NOT NULL
      AND pv.user_id IS NOT NULL
    GROUP BY pv.ref_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_get_listing_unique_viewers(text) TO authenticated;

-- =============================================================================
-- RODO right-to-object (art. 21): per-user opt-out of personal view tracking.
-- =============================================================================
-- When set, the user's views stop being linked to their account (no page_views
-- row → excluded from unique-viewer counts). Anonymous aggregate totals continue.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS analytics_opt_out boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_analytics_opt_out(p_value boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  UPDATE profiles SET analytics_opt_out = COALESCE(p_value, false) WHERE id = auth.uid();
END;
$function$;
GRANT EXECUTE ON FUNCTION public.set_analytics_opt_out(boolean) TO authenticated;

-- NOTE: increment_pin_view / increment_tender_view / increment_job_view were also
-- updated (CREATE OR REPLACE) to read profiles.analytics_opt_out and skip personal
-- page_views logging for opted-out users. See migration body in Supabase history.
