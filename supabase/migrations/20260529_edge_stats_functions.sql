-- Edge-callable stats functions for quick-stats widget.
-- Same logic as admin_get_* but without is_admin() guard.
-- The edge function (PIN auth) is the security boundary.

CREATE OR REPLACE FUNCTION public.edge_get_kpis()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE r jsonb;
DECLARE bot_re text := '(bot|crawl|spider|slurp|headless|monitor|preview|lighthouse|curl|wget|python-requests|facebookexternalhit)';
BEGIN
  SELECT jsonb_build_object(
    'online',           (SELECT count(*) FROM user_sessions WHERE ended_at IS NULL AND last_seen_at > now() - interval '2 minutes'),
    'visits_24h',       (SELECT count(*) FROM user_sessions WHERE started_at > now() - interval '24 hours'),
    'visits_7d',        (SELECT count(*) FROM user_sessions WHERE started_at > now() - interval '7 days'),
    'visits_30d',       (SELECT count(*) FROM user_sessions WHERE started_at > now() - interval '30 days'),
    'visits_real_24h',  (SELECT count(*) FROM user_sessions s WHERE s.started_at > now() - interval '24 hours' AND (s.user_id IS NULL OR s.user_id NOT IN (SELECT a.user_id FROM admins a WHERE a.user_id IS NOT NULL)) AND COALESCE(s.user_agent,'') !~* bot_re),
    'visits_real_7d',   (SELECT count(*) FROM user_sessions s WHERE s.started_at > now() - interval '7 days'   AND (s.user_id IS NULL OR s.user_id NOT IN (SELECT a.user_id FROM admins a WHERE a.user_id IS NOT NULL)) AND COALESCE(s.user_agent,'') !~* bot_re),
    'visits_real_30d',  (SELECT count(*) FROM user_sessions s WHERE s.started_at > now() - interval '30 days'  AND (s.user_id IS NULL OR s.user_id NOT IN (SELECT a.user_id FROM admins a WHERE a.user_id IS NOT NULL)) AND COALESCE(s.user_agent,'') !~* bot_re),
    'visitors_total',   (SELECT count(DISTINCT COALESCE(user_id::text, anon_id)) FROM user_sessions),
    'visitors_real_24h',(SELECT count(DISTINCT COALESCE(s.user_id::text, s.anon_id)) FROM user_sessions s WHERE s.started_at > now() - interval '24 hours' AND (s.user_id IS NULL OR s.user_id NOT IN (SELECT a.user_id FROM admins a WHERE a.user_id IS NOT NULL)) AND COALESCE(s.user_agent,'') !~* bot_re),
    'visitors_real_7d', (SELECT count(DISTINCT COALESCE(s.user_id::text, s.anon_id)) FROM user_sessions s WHERE s.started_at > now() - interval '7 days'   AND (s.user_id IS NULL OR s.user_id NOT IN (SELECT a.user_id FROM admins a WHERE a.user_id IS NOT NULL)) AND COALESCE(s.user_agent,'') !~* bot_re),
    'visitors_real_30d',(SELECT count(DISTINCT COALESCE(s.user_id::text, s.anon_id)) FROM user_sessions s WHERE s.started_at > now() - interval '30 days'  AND (s.user_id IS NULL OR s.user_id NOT IN (SELECT a.user_id FROM admins a WHERE a.user_id IS NOT NULL)) AND COALESCE(s.user_agent,'') !~* bot_re),
    'views_30d',        (SELECT count(*) FROM page_views WHERE page_type IN ('pin','tender','job') AND created_at > now() - interval '30 days'),
    'views_total',      ((SELECT COALESCE(SUM(views_count),0) FROM pins) + (SELECT COALESCE(SUM(views_count),0) FROM tenders) + (SELECT COALESCE(SUM(views_count),0) FROM job_offers))
  ) INTO r;
  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.edge_get_visitor_countries()
RETURNS TABLE(country text, sessions integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
    SELECT us.country::text, COUNT(*)::int AS sessions
    FROM user_sessions us
    WHERE us.country IS NOT NULL AND us.country <> ''
      AND (us.user_id IS NULL OR us.user_id NOT IN (SELECT a.user_id FROM admins a))
    GROUP BY us.country ORDER BY COUNT(*) DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.edge_get_contact_funnel()
RETURNS TABLE(page_type text, prompts integer, reveals integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT CASE
        WHEN pv.page_type IN ('job_prompt','job_contact')       THEN 'job'
        WHEN pv.page_type IN ('pin_prompt','pin_contact')       THEN 'pin'
        WHEN pv.page_type IN ('tender_prompt','tender_contact') THEN 'tender'
      END AS pt, pv.page_type
    FROM page_views pv
    WHERE pv.page_type IN ('job_prompt','job_contact','pin_prompt','pin_contact','tender_prompt','tender_contact')
  )
  SELECT b.pt,
    COUNT(*) FILTER (WHERE b.page_type LIKE '%prompt')::int,
    COUNT(*) FILTER (WHERE b.page_type LIKE '%contact')::int
  FROM base b GROUP BY b.pt;
END;
$$;

CREATE OR REPLACE FUNCTION public.edge_get_listing_unique_viewers(p_page_type text)
RETURNS TABLE(ref_id uuid, uniq integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
    SELECT pv.ref_id, COUNT(DISTINCT pv.user_id)::int AS uniq
    FROM page_views pv
    WHERE pv.page_type = p_page_type AND pv.ref_id IS NOT NULL AND pv.user_id IS NOT NULL
    GROUP BY pv.ref_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.edge_get_listing_period_views(p_page_type text)
RETURNS TABLE(ref_id uuid, v24h integer, v7d integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
    SELECT pv.ref_id,
      COUNT(*) FILTER (WHERE pv.created_at > now() - interval '24 hours')::int AS v24h,
      COUNT(*) FILTER (WHERE pv.created_at > now() - interval '7 days')::int   AS v7d
    FROM page_views pv
    WHERE pv.page_type = p_page_type AND pv.ref_id IS NOT NULL
      AND pv.created_at > now() - interval '7 days'
    GROUP BY pv.ref_id;
END;
$$;

REVOKE ALL ON FUNCTION public.edge_get_kpis() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.edge_get_visitor_countries() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.edge_get_contact_funnel() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.edge_get_listing_unique_viewers(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.edge_get_listing_period_views(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.edge_get_kpis() TO service_role;
GRANT EXECUTE ON FUNCTION public.edge_get_visitor_countries() TO service_role;
GRANT EXECUTE ON FUNCTION public.edge_get_contact_funnel() TO service_role;
GRANT EXECUTE ON FUNCTION public.edge_get_listing_unique_viewers(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.edge_get_listing_period_views(text) TO service_role;
