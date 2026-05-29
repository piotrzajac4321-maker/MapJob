-- Fix: Deduplicate active user sessions
-- Prevents same visitor from appearing multiple times
-- in "Aktywni teraz" and from inflating session counts.
--
-- Root cause: each page load / tab creates a new row in user_sessions
-- even when the same anon_id or user_id already has an active session.
-- The admin view showed all rows, so one person appeared 2-5× online.
--
-- Fix strategy:
--   1. session_id_map   – maps cancelled "ghost" session IDs to the canonical one
--   2. user_sessions_admin view  – DISTINCT ON visitor, shows latest session only
--   3. trg_merge_duplicate_session – BEFORE INSERT, merges within 30-min window
--   4. user_events_bump_session  – resolves canonical ID via the map table

-- 1. Mapping table for merged (cancelled) session IDs
CREATE TABLE IF NOT EXISTS public.session_id_map (
    new_id       uuid        PRIMARY KEY,
    canonical_id uuid        NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.session_id_map ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_session_id_map_created
    ON public.session_id_map (created_at);

-- 2. Performance indexes for fast deduplication lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_last_seen
    ON public.user_sessions (user_id, last_seen_at DESC)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_anon_id_last_seen
    ON public.user_sessions (anon_id, last_seen_at DESC)
    WHERE anon_id IS NOT NULL;

-- 3. Deduplicated admin view: one row per unique visitor (most recent session)
CREATE OR REPLACE VIEW public.user_sessions_admin AS
WITH latest_per_visitor AS (
    SELECT DISTINCT ON (COALESCE(user_id::text, anon_id))
        id, user_id, anon_id, started_at, last_seen_at, ended_at,
        last_path, last_event, user_agent, events_count, ip_hash, country
    FROM public.user_sessions
    WHERE user_id IS NOT NULL OR anon_id IS NOT NULL
    ORDER BY COALESCE(user_id::text, anon_id), last_seen_at DESC
)
SELECT
    ls.id,
    ls.user_id,
    ls.anon_id,
    ls.started_at,
    ls.last_seen_at,
    ls.ended_at,
    ls.last_path,
    ls.last_event,
    ls.user_agent,
    ls.events_count,
    ls.ip_hash,
    ls.country,
    p.email        AS user_email,
    p.name         AS display_name,
    EXTRACT(epoch FROM (COALESCE(ls.ended_at, ls.last_seen_at) - ls.started_at))::integer AS duration_s
FROM latest_per_visitor ls
LEFT JOIN public.profiles p ON p.id = ls.user_id;

-- 4. Trigger: merge duplicate sessions from the same visitor
CREATE OR REPLACE FUNCTION public.trg_merge_duplicate_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_existing_id uuid;
BEGIN
    IF NEW.user_id IS NULL AND NEW.anon_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT id INTO v_existing_id
    FROM public.user_sessions
    WHERE (
        (NEW.user_id IS NOT NULL AND user_id = NEW.user_id)
        OR (NEW.user_id IS NULL AND NEW.anon_id IS NOT NULL AND anon_id = NEW.anon_id)
    )
    AND last_seen_at > NOW() - INTERVAL '30 minutes'
    ORDER BY last_seen_at DESC
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        UPDATE public.user_sessions
        SET last_seen_at = NOW(),
            last_path    = COALESCE(NEW.last_path,  last_path),
            user_agent   = COALESCE(NEW.user_agent, user_agent),
            country      = COALESCE(NEW.country,    country),
            ip_hash      = COALESCE(NEW.ip_hash,    ip_hash)
        WHERE id = v_existing_id;

        INSERT INTO public.session_id_map (new_id, canonical_id)
        VALUES (NEW.id, v_existing_id)
        ON CONFLICT (new_id) DO NOTHING;

        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_insert_merge_session ON public.user_sessions;
CREATE TRIGGER trg_before_insert_merge_session
    BEFORE INSERT ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_merge_duplicate_session();

-- 5. Update event attribution to follow merged session IDs
CREATE OR REPLACE FUNCTION public.user_events_bump_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_session_id uuid;
BEGIN
    IF new.session_id IS NOT NULL THEN
        v_session_id := COALESCE(
            (SELECT canonical_id FROM public.session_id_map WHERE new_id = new.session_id),
            new.session_id
        );

        UPDATE public.user_sessions
        SET events_count = events_count + 1,
            last_event   = new.event_type,
            last_seen_at = GREATEST(last_seen_at, new.created_at),
            last_path    = COALESCE(new.path, last_path)
        WHERE id = v_session_id;
    END IF;
    RETURN new;
END;
$$;

-- 6. Cleanup helper for old mappings (call periodically, e.g. via pg_cron)
CREATE OR REPLACE FUNCTION public.cleanup_session_id_map()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    DELETE FROM public.session_id_map WHERE created_at < NOW() - INTERVAL '24 hours';
$$;
