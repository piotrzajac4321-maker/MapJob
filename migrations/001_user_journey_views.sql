-- ============================================================
-- MapJob: User Journey Analytics — widoki i funkcje
-- Migracja: 001_user_journey_views.sql
-- Daje pełny wgląd w ścieżki użytkowników od wejścia do wyjścia
-- ============================================================

-- ────────────────────────────────────────────
-- 1. PEŁNA ŚCIEŻKA SESJI (wszystkie kroki)
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_session_journeys CASCADE;
CREATE OR REPLACE VIEW v_session_journeys AS
SELECT
  s.id                                              AS session_id,
  s.user_id,
  s.anon_id,
  s.started_at,
  s.last_seen_at,
  ROUND(EXTRACT(EPOCH FROM (s.last_seen_at - s.started_at)) / 60, 1)
                                                    AS duration_min,
  s.events_count,
  s.country,
  CASE
    WHEN s.user_agent ILIKE '%Mobile%' OR s.user_agent ILIKE '%Android%' THEN 'mobile'
    WHEN s.user_agent ILIKE '%Tablet%' OR s.user_agent ILIKE '%iPad%'    THEN 'tablet'
    ELSE 'desktop'
  END                                               AS device,
  -- Krooki sesji jako JSON array w kolejności chronologicznej
  COALESCE(
    json_agg(
      json_build_object(
        'step',        row_num.rn,
        'event',       e.event_type,
        'target_type', e.target_type,
        'target_id',   e.target_id,
        'path',        e.path,
        'metadata',    e.metadata,
        'ts',          e.created_at
      ) ORDER BY e.created_at
    ) FILTER (WHERE e.id IS NOT NULL),
    '[]'::json
  )                                                 AS steps,
  COUNT(e.id)                                       AS total_events
FROM user_sessions s
LEFT JOIN user_events e ON e.session_id = s.id
LEFT JOIN LATERAL (
  SELECT ROW_NUMBER() OVER (PARTITION BY e2.session_id ORDER BY e2.created_at) AS rn
  FROM user_events e2
  WHERE e2.id = e.id
) row_num ON TRUE
GROUP BY s.id;

COMMENT ON VIEW v_session_journeys IS
  'Pełna ścieżka każdej sesji: wszystkie eventy w kolejności chronologicznej';

-- ────────────────────────────────────────────
-- 2. PUNKTY WYJŚCIA (co użytkownik robił zanim wyszedł)
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_exit_analysis CASCADE;
CREATE OR REPLACE VIEW v_exit_analysis AS
WITH ranked AS (
  SELECT
    e.*,
    ROW_NUMBER() OVER (PARTITION BY e.session_id ORDER BY e.created_at DESC) AS rn_from_end
  FROM user_events e
),
exit_event AS (
  SELECT session_id, event_type AS exit_event, target_type, path AS exit_path, metadata, created_at AS exit_at
  FROM ranked WHERE rn_from_end = 1
),
pre_exit AS (
  SELECT session_id, event_type AS pre_exit_event, path AS pre_exit_path, created_at AS pre_exit_at
  FROM ranked WHERE rn_from_end = 2
),
pre_pre_exit AS (
  SELECT session_id, event_type AS pre2_exit_event, path AS pre2_exit_path
  FROM ranked WHERE rn_from_end = 3
)
SELECT
  s.id                                              AS session_id,
  s.user_id,
  s.anon_id,
  s.country,
  ee.exit_path,
  ee.exit_event,
  ee.target_type                                    AS exit_target_type,
  ee.metadata                                       AS exit_metadata,
  ee.exit_at,
  pe.pre_exit_event,
  pe.pre_exit_path,
  ppe.pre2_exit_event,
  ppe.pre2_exit_path,
  ROUND(EXTRACT(EPOCH FROM (s.last_seen_at - s.started_at)) / 60, 1)
                                                    AS session_duration_min,
  s.events_count
FROM user_sessions s
JOIN exit_event    ee  ON ee.session_id  = s.id
LEFT JOIN pre_exit pe  ON pe.session_id  = s.id
LEFT JOIN pre_pre_exit ppe ON ppe.session_id = s.id;

COMMENT ON VIEW v_exit_analysis IS
  'Ostatnie 3 akcje przed opuszczeniem strony — do analizy punktów odpływu';

-- ────────────────────────────────────────────
-- 3. HEATMAPA KLIKNIĘĆ (koordynaty x/y per strona)
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_click_heatmap CASCADE;
CREATE OR REPLACE VIEW v_click_heatmap AS
SELECT
  path,
  -- Przyciągamy do siatki 10px żeby heatmapa była czytelniejsza
  ((metadata->>'x')::int / 10) * 10                AS x_bucket,
  ((metadata->>'y')::int / 10) * 10                AS y_bucket,
  (metadata->>'x')::int                            AS x_exact,
  (metadata->>'y')::int                            AS y_exact,
  (metadata->>'page_x')::int                       AS page_x,
  (metadata->>'page_y')::int                       AS page_y,
  COALESCE(metadata->>'component', metadata->>'tag') AS component,
  metadata->>'text'                                 AS element_text,
  metadata->>'href'                                 AS href,
  metadata->>'label'                                AS track_label,
  COUNT(*)                                          AS click_count,
  created_at::date                                  AS date
FROM user_events
WHERE event_type = 'click'
  AND (metadata->>'x') IS NOT NULL
  AND (metadata->>'x')::int > 0
GROUP BY path, x_bucket, y_bucket, x_exact, y_exact, page_x, page_y,
         component, element_text, href, track_label, date;

COMMENT ON VIEW v_click_heatmap IS
  'Dane do heatmapy kliknięć: pozycje x/y per strona, zagregowane do siatki 10px';

-- ────────────────────────────────────────────
-- 4. NAJCZĘŚCIEJ KLIKANE ELEMENTY
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_top_clicked_elements CASCADE;
CREATE OR REPLACE VIEW v_top_clicked_elements AS
SELECT
  path,
  COALESCE(metadata->>'label', metadata->>'text', metadata->>'component', metadata->>'tag', '(brak etykiety)')
                                                    AS element_label,
  metadata->>'component'                            AS component,
  metadata->>'tag'                                  AS tag,
  metadata->>'href'                                 AS href,
  COUNT(*)                                          AS total_clicks,
  COUNT(DISTINCT session_id)                        AS unique_sessions,
  COUNT(DISTINCT user_id)                           AS unique_users,
  MIN(created_at)                                   AS first_click,
  MAX(created_at)                                   AS last_click
FROM user_events
WHERE event_type = 'click'
GROUP BY path, element_label, component, tag, href
ORDER BY total_clicks DESC;

-- ────────────────────────────────────────────
-- 5. ANALIZA FUNNEL — LEJEK KONWERSJI
-- ────────────────────────────────────────────
-- Śledzi ile sesji przechodzi przez każdy etap:
-- wejście → szukanie → otwarcie ogłoszenia → kontakt/aplikacja → checkout

DROP VIEW IF EXISTS v_conversion_funnel CASCADE;
CREATE OR REPLACE VIEW v_conversion_funnel AS
WITH sessions_with_events AS (
  SELECT
    s.id AS session_id,
    s.user_id,
    s.anon_id,
    s.started_at,
    -- Flagi czy dana akcja wystąpiła w sesji
    MAX(CASE WHEN e.event_type IN ('page_view', 'visit')                  THEN 1 ELSE 0 END) AS did_enter,
    MAX(CASE WHEN e.event_type IN ('search', 'filter_apply')              THEN 1 ELSE 0 END) AS did_search,
    MAX(CASE WHEN e.event_type IN ('job_view', 'view_profile', 'profile_view')
                                                                          THEN 1 ELSE 0 END) AS did_view_offer,
    MAX(CASE WHEN e.event_type IN ('job_contact', 'job_contact_click', 'pin_contact',
                                   'job_apply', 'job_apply_click')        THEN 1 ELSE 0 END) AS did_contact,
    MAX(CASE WHEN e.event_type = 'chat_open'                              THEN 1 ELSE 0 END) AS did_chat,
    MAX(CASE WHEN e.event_type IN ('checkout_start')                      THEN 1 ELSE 0 END) AS did_checkout,
    MAX(CASE WHEN e.event_type IN ('checkout_done')                       THEN 1 ELSE 0 END) AS did_purchase,
    MAX(CASE WHEN e.event_type = 'register'                               THEN 1 ELSE 0 END) AS did_register,
    MAX(CASE WHEN e.event_type IN ('login')                               THEN 1 ELSE 0 END) AS did_login
  FROM user_sessions s
  LEFT JOIN user_events e ON e.session_id = s.id
  GROUP BY s.id, s.user_id, s.anon_id, s.started_at
)
SELECT
  COUNT(*)                                          AS total_sessions,
  SUM(did_enter)                                    AS step1_entered,
  SUM(did_search)                                   AS step2_searched_or_filtered,
  SUM(did_view_offer)                               AS step3_viewed_offer,
  SUM(did_contact)                                  AS step4_contacted,
  SUM(did_chat)                                     AS step4b_opened_chat,
  SUM(did_checkout)                                 AS step5_checkout,
  SUM(did_purchase)                                 AS step6_purchased,
  SUM(did_register)                                 AS conversions_register,
  SUM(did_login)                                    AS returning_logins,
  -- Wskaźniki konwersji między etapami
  ROUND(100.0 * SUM(did_search)      / NULLIF(SUM(did_enter),      0), 1) AS pct_search_of_enter,
  ROUND(100.0 * SUM(did_view_offer)  / NULLIF(SUM(did_search),     0), 1) AS pct_view_of_search,
  ROUND(100.0 * SUM(did_contact)     / NULLIF(SUM(did_view_offer), 0), 1) AS pct_contact_of_view,
  ROUND(100.0 * SUM(did_checkout)    / NULLIF(SUM(did_contact),    0), 1) AS pct_checkout_of_contact,
  ROUND(100.0 * SUM(did_purchase)    / NULLIF(SUM(did_checkout),   0), 1) AS pct_purchase_of_checkout
FROM sessions_with_events;

COMMENT ON VIEW v_conversion_funnel IS
  'Lejek konwersji: wejście → szukanie → ogłoszenie → kontakt → zakup';

-- ────────────────────────────────────────────
-- 6. BOUNCE ANALYSIS — jednorazowe wejścia
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_bounce_analysis CASCADE;
CREATE OR REPLACE VIEW v_bounce_analysis AS
SELECT
  s.id                                              AS session_id,
  s.user_id,
  s.anon_id,
  s.started_at,
  s.country,
  s.last_path                                       AS entry_page,
  (SELECT e.metadata->>'referrer'
   FROM user_events e
   WHERE e.session_id = s.id
     AND e.event_type IN ('page_view', 'visit')
   ORDER BY e.created_at ASC LIMIT 1)               AS referrer,
  (SELECT e.metadata->>'utm_source'
   FROM user_events e
   WHERE e.session_id = s.id
   ORDER BY e.created_at ASC LIMIT 1)               AS utm_source,
  COUNT(DISTINCT e.path)                            AS pages_visited,
  COUNT(e.id)                                       AS total_events,
  ROUND(EXTRACT(EPOCH FROM (s.last_seen_at - s.started_at)), 0)
                                                    AS duration_sec,
  CASE
    WHEN COUNT(DISTINCT e.path) <= 1
      AND COUNT(e.id) <= 3
      AND EXTRACT(EPOCH FROM (s.last_seen_at - s.started_at)) < 30
    THEN TRUE ELSE FALSE
  END                                               AS is_bounce
FROM user_sessions s
LEFT JOIN user_events e ON e.session_id = s.id
GROUP BY s.id;

-- Zagregowane statystyki bounce
DROP VIEW IF EXISTS v_bounce_stats CASCADE;
CREATE OR REPLACE VIEW v_bounce_stats AS
SELECT
  ROUND(100.0 * SUM(CASE WHEN is_bounce THEN 1 END) / COUNT(*), 1) AS bounce_rate_pct,
  COUNT(*)                                           AS total_sessions,
  SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END)         AS bounced_sessions,
  COUNT(*) - SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) AS engaged_sessions,
  ROUND(AVG(duration_sec), 0)                        AS avg_session_duration_sec,
  ROUND(AVG(CASE WHEN NOT is_bounce THEN duration_sec END), 0)
                                                     AS avg_engaged_duration_sec,
  ROUND(AVG(total_events), 1)                        AS avg_events_per_session,
  ROUND(AVG(pages_visited), 1)                       AS avg_pages_per_session
FROM v_bounce_analysis;

-- ────────────────────────────────────────────
-- 7. WYDAJNOŚĆ STRON — czas, scroll, zaangażowanie
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_page_performance CASCADE;
CREATE OR REPLACE VIEW v_page_performance AS
SELECT
  path,
  COUNT(*)                                           AS total_views,
  COUNT(DISTINCT session_id)                         AS unique_sessions,
  -- Czas na stronie (z page_exit events)
  ROUND(AVG(
    CASE WHEN event_type = 'page_exit'
    THEN (metadata->>'time_on_page_ms')::int / 1000.0 END
  ), 1)                                              AS avg_time_on_page_sec,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY
    CASE WHEN event_type = 'page_exit'
    THEN (metadata->>'time_on_page_ms')::int / 1000.0 END
  ), 1)                                              AS median_time_on_page_sec,
  -- Max scroll depth (z page_exit events)
  ROUND(AVG(
    CASE WHEN event_type = 'page_exit'
    THEN (metadata->>'max_scroll_pct')::int END
  ), 0)                                              AS avg_max_scroll_pct,
  -- Exit intents
  COUNT(*) FILTER (WHERE event_type = 'exit_intent') AS exit_intents,
  -- Rage clicks
  COUNT(*) FILTER (WHERE event_type = 'rage_click')  AS rage_clicks,
  -- Jaka była ostatnia akcja przed opuszczeniem
  MODE() WITHIN GROUP (ORDER BY
    CASE WHEN event_type = 'page_exit'
    THEN metadata->>'last_action' END
  )                                                  AS most_common_last_action
FROM user_events
GROUP BY path;

-- ────────────────────────────────────────────
-- 8. SKĄD PRZYCHODZĄ (źródła ruchu)
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_traffic_sources CASCADE;
CREATE OR REPLACE VIEW v_traffic_sources AS
SELECT
  COALESCE(metadata->>'utm_source',
    CASE
      WHEN metadata->>'referrer' ILIKE '%facebook%' OR metadata->>'referrer' ILIKE '%fb.com%' THEN 'facebook'
      WHEN metadata->>'referrer' ILIKE '%instagram%'      THEN 'instagram'
      WHEN metadata->>'referrer' ILIKE '%google%'         THEN 'google'
      WHEN metadata->>'referrer' ILIKE '%linkedin%'       THEN 'linkedin'
      WHEN metadata->>'referrer' ILIKE '%twitter%'
        OR metadata->>'referrer' ILIKE '%t.co%'           THEN 'twitter'
      WHEN metadata->>'referrer' IS NULL
        OR metadata->>'referrer' = ''                     THEN 'direct'
      ELSE 'other'
    END
  )                                                  AS source,
  COALESCE(metadata->>'utm_medium', 'organic')       AS medium,
  metadata->>'utm_campaign'                          AS campaign,
  COUNT(DISTINCT session_id)                         AS sessions,
  COUNT(DISTINCT user_id)                            AS logged_users,
  metadata->>'device'                                AS device
FROM user_events
WHERE event_type IN ('page_view', 'visit')
GROUP BY source, medium, campaign, device
ORDER BY sessions DESC;

-- ────────────────────────────────────────────
-- 9. RAGE CLICKS I MARTWE KLIKNIĘCIA
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_rage_clicks CASCADE;
CREATE OR REPLACE VIEW v_rage_clicks AS
SELECT
  path,
  COALESCE(metadata->>'component', metadata->>'tag', '?') AS element,
  metadata->>'text'                                  AS element_text,
  metadata->>'class'                                 AS element_class,
  (metadata->>'x')::int                             AS x,
  (metadata->>'y')::int                             AS y,
  AVG((metadata->>'clicks')::int)                   AS avg_clicks_per_rage,
  COUNT(*)                                          AS rage_click_events,
  COUNT(DISTINCT session_id)                        AS sessions_affected,
  MIN(created_at)                                   AS first_seen,
  MAX(created_at)                                   AS last_seen
FROM user_events
WHERE event_type = 'rage_click'
GROUP BY path, element, element_text, element_class, x, y
ORDER BY rage_click_events DESC;

-- ────────────────────────────────────────────
-- 10. AKTYWNOŚĆ NA MAPIE
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_map_interactions CASCADE;
CREATE OR REPLACE VIEW v_map_interactions AS
SELECT
  event_type,
  target_id                                         AS pin_id,
  metadata->>'zoom_level'                           AS zoom_level,
  metadata->>'lat'                                  AS lat,
  metadata->>'lng'                                  AS lng,
  COUNT(*)                                          AS count,
  COUNT(DISTINCT session_id)                        AS unique_sessions,
  MIN(created_at)                                   AS first_seen,
  MAX(created_at)                                   AS last_seen
FROM user_events
WHERE event_type IN ('map_pin_click', 'map_cluster', 'map_zoom', 'map_pan',
                     'map_pin_open')  -- stare eventy
GROUP BY event_type, pin_id, zoom_level, lat, lng
ORDER BY count DESC;

-- ────────────────────────────────────────────
-- 11. WYSZUKIWANIA I FILTRY
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_search_and_filters CASCADE;
CREATE OR REPLACE VIEW v_search_and_filters AS
SELECT
  event_type,
  metadata->>'query'                                AS query,
  (metadata->>'results')::int                      AS results_count,
  metadata->>'filters'                              AS filters_json,
  COUNT(*)                                          AS count,
  COUNT(DISTINCT session_id)                        AS unique_sessions,
  MIN(created_at)                                   AS first_seen,
  MAX(created_at)                                   AS last_seen
FROM user_events
WHERE event_type IN ('search', 'filter_apply', 'filter_clear')
GROUP BY event_type, query, results_count, filters_json
ORDER BY count DESC;

-- ────────────────────────────────────────────
-- 12. DZIENNA AKTYWNOŚĆ (przegląd admin)
-- ────────────────────────────────────────────

DROP VIEW IF EXISTS v_daily_activity CASCADE;
CREATE OR REPLACE VIEW v_daily_activity AS
SELECT
  created_at::date                                   AS date,
  COUNT(*)                                           AS total_events,
  COUNT(DISTINCT session_id)                         AS sessions,
  COUNT(DISTINCT user_id)                            AS logged_users,
  COUNT(DISTINCT anon_id)                            AS unique_visitors,
  COUNT(*) FILTER (WHERE event_type IN ('page_view', 'visit'))
                                                     AS page_views,
  COUNT(*) FILTER (WHERE event_type = 'click')       AS clicks,
  COUNT(*) FILTER (WHERE event_type IN ('job_view', 'view_profile', 'profile_view'))
                                                     AS offer_views,
  COUNT(*) FILTER (WHERE event_type IN ('job_contact', 'job_contact_click', 'pin_contact'))
                                                     AS contacts,
  COUNT(*) FILTER (WHERE event_type IN ('job_apply', 'job_apply_click'))
                                                     AS applications,
  COUNT(*) FILTER (WHERE event_type = 'checkout_start')
                                                     AS checkout_starts,
  COUNT(*) FILTER (WHERE event_type = 'checkout_done')
                                                     AS purchases,
  COUNT(*) FILTER (WHERE event_type = 'register')    AS registrations,
  COUNT(*) FILTER (WHERE event_type = 'rage_click')  AS rage_clicks,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent') AS exit_intents
FROM user_events
GROUP BY date
ORDER BY date DESC;

-- ────────────────────────────────────────────
-- 13. FUNCTION: Pełna ścieżka jednej sesji
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_session_journey(p_session_id uuid)
RETURNS TABLE (
  step          int,
  event_type    text,
  target_type   text,
  target_id     text,
  path          text,
  metadata      jsonb,
  created_at    timestamptz,
  time_since_start_sec numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY created_at)::int AS step,
    e.event_type,
    e.target_type,
    e.target_id,
    e.path,
    e.metadata,
    e.created_at,
    ROUND(EXTRACT(EPOCH FROM (e.created_at - s.started_at)), 1) AS time_since_start_sec
  FROM user_events e
  JOIN user_sessions s ON s.id = e.session_id
  WHERE e.session_id = p_session_id
  ORDER BY e.created_at;
$$;

COMMENT ON FUNCTION get_session_journey IS
  'Zwraca pełną ścieżkę sesji krok po kroku. Użycie: SELECT * FROM get_session_journey(''uuid-sesji'')';

-- ────────────────────────────────────────────
-- 14. FUNCTION: Top ścieżki po wejściu na daną stronę
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_paths_after(p_path text, p_limit int DEFAULT 10)
RETURNS TABLE (
  next_path   text,
  count       bigint,
  pct_of_sessions numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH entry_sessions AS (
    SELECT DISTINCT session_id
    FROM user_events
    WHERE path = p_path
      AND event_type IN ('page_view', 'visit')
  ),
  next_pages AS (
    SELECT
      e.session_id,
      e.path AS next_path,
      ROW_NUMBER() OVER (PARTITION BY e.session_id ORDER BY e.created_at) AS rn
    FROM user_events e
    JOIN entry_sessions es ON es.session_id = e.session_id
    WHERE e.event_type IN ('page_view', 'visit')
      AND e.path != p_path
  )
  SELECT
    next_path,
    COUNT(*)                                        AS count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM entry_sessions), 1) AS pct_of_sessions
  FROM next_pages
  WHERE rn = 1
  GROUP BY next_path
  ORDER BY count DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION get_paths_after IS
  'Dokąd użytkownicy idą po odwiedzeniu danej strony. Użycie: SELECT * FROM get_paths_after(''/'')';

-- ────────────────────────────────────────────
-- 15. FUNCTION: Ścieżki przed konwersją
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_paths_before_event(
  p_event_type text,
  p_steps_back int DEFAULT 5,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  position_from_end int,
  event_type        text,
  path              text,
  count             bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH conversion_sessions AS (
    SELECT DISTINCT session_id, created_at AS conv_at
    FROM user_events
    WHERE event_type = p_event_type
  ),
  steps_before AS (
    SELECT
      e.session_id,
      e.event_type,
      e.path,
      ROW_NUMBER() OVER (PARTITION BY e.session_id ORDER BY e.created_at DESC) AS rn_back
    FROM user_events e
    JOIN conversion_sessions cs ON cs.session_id = e.session_id
    WHERE e.created_at <= cs.conv_at
      AND e.event_type != p_event_type
  )
  SELECT
    rn_back::int                AS position_from_end,
    event_type,
    path,
    COUNT(*)                    AS count
  FROM steps_before
  WHERE rn_back <= p_steps_back
  GROUP BY rn_back, event_type, path
  ORDER BY rn_back, count DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION get_paths_before_event IS
  'Jakie kroki prowadzą do danej konwersji. Przykład: SELECT * FROM get_paths_before_event(''checkout_start'', 5)';

-- ────────────────────────────────────────────
-- 16. FUNCTION: Analiza scroll depth per strona
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_scroll_depth_breakdown(p_path text DEFAULT NULL)
RETURNS TABLE (
  path      text,
  reached_25  bigint,
  reached_50  bigint,
  reached_75  bigint,
  reached_90  bigint,
  reached_100 bigint,
  total_sessions bigint,
  pct_25  numeric,
  pct_50  numeric,
  pct_75  numeric,
  pct_90  numeric,
  pct_100 numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH milestones AS (
    SELECT
      path,
      session_id,
      MAX(CASE WHEN (metadata->>'depth_pct')::int >= 25  THEN 1 ELSE 0 END) AS hit_25,
      MAX(CASE WHEN (metadata->>'depth_pct')::int >= 50  THEN 1 ELSE 0 END) AS hit_50,
      MAX(CASE WHEN (metadata->>'depth_pct')::int >= 75  THEN 1 ELSE 0 END) AS hit_75,
      MAX(CASE WHEN (metadata->>'depth_pct')::int >= 90  THEN 1 ELSE 0 END) AS hit_90,
      MAX(CASE WHEN (metadata->>'depth_pct')::int >= 100 THEN 1 ELSE 0 END) AS hit_100
    FROM user_events
    WHERE event_type = 'scroll_depth'
      AND (p_path IS NULL OR path = p_path)
    GROUP BY path, session_id
  )
  SELECT
    path,
    SUM(hit_25)  AS reached_25,
    SUM(hit_50)  AS reached_50,
    SUM(hit_75)  AS reached_75,
    SUM(hit_90)  AS reached_90,
    SUM(hit_100) AS reached_100,
    COUNT(*)     AS total_sessions,
    ROUND(100.0 * SUM(hit_25)  / NULLIF(COUNT(*), 0), 1) AS pct_25,
    ROUND(100.0 * SUM(hit_50)  / NULLIF(COUNT(*), 0), 1) AS pct_50,
    ROUND(100.0 * SUM(hit_75)  / NULLIF(COUNT(*), 0), 1) AS pct_75,
    ROUND(100.0 * SUM(hit_90)  / NULLIF(COUNT(*), 0), 1) AS pct_90,
    ROUND(100.0 * SUM(hit_100) / NULLIF(COUNT(*), 0), 1) AS pct_100
  FROM milestones
  GROUP BY path;
$$;

COMMENT ON FUNCTION get_scroll_depth_breakdown IS
  'Rozkład scroll depth per strona. Użycie: SELECT * FROM get_scroll_depth_breakdown(''/'')';

-- ────────────────────────────────────────────
-- Indeksy wspierające wydajność widoków
-- ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_events_session_created
  ON user_events (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_user_events_type_path
  ON user_events (event_type, path);

CREATE INDEX IF NOT EXISTS idx_user_events_metadata_x
  ON user_events ((metadata->>'x'))
  WHERE event_type = 'click' AND metadata->>'x' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_events_anon_id
  ON user_events (anon_id);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id
  ON user_events (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_anon
  ON user_sessions (anon_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_started
  ON user_sessions (started_at DESC);
