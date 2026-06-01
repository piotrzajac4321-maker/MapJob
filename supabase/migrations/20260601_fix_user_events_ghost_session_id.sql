-- Fix 409 errors on user_events / session_replays inserts.
--
-- Root cause: trg_before_insert_merge_session on user_sessions detects an
-- active session for the same visitor and cancels the duplicate INSERT
-- (RETURN NULL). The JS client receives 204 (success) and stores the
-- locally-generated UUID as _mjSessionId. Subsequent user_events inserts
-- reference that UUID which never landed in user_sessions → FK violation → 409.
--
-- The merge trigger already writes (new_id → canonical_id) into session_id_map
-- to allow post-hoc attribution. This resolver trigger uses that mapping
-- BEFORE the FK check fires, transparently swapping the ghost id for the
-- canonical one.

CREATE OR REPLACE FUNCTION public.trg_resolve_session_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_canonical uuid;
BEGIN
    SELECT canonical_id INTO v_canonical
    FROM public.session_id_map
    WHERE new_id = NEW.session_id;

    IF v_canonical IS NOT NULL THEN
        NEW.session_id = v_canonical;
    END IF;

    RETURN NEW;
END;
$$;

-- user_events
DROP TRIGGER IF EXISTS trg_before_insert_resolve_session ON public.user_events;
CREATE TRIGGER trg_before_insert_resolve_session
    BEFORE INSERT ON public.user_events
    FOR EACH ROW EXECUTE FUNCTION public.trg_resolve_session_id();

-- session_replays (same FK, same problem)
DROP TRIGGER IF EXISTS trg_before_insert_resolve_session ON public.session_replays;
CREATE TRIGGER trg_before_insert_resolve_session
    BEFORE INSERT ON public.session_replays
    FOR EACH ROW EXECUTE FUNCTION public.trg_resolve_session_id();
