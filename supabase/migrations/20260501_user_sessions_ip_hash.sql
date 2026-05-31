-- Hashed IP + country na sesję — wypełniane przez edge fn 'client-info' z nagłówków proxy.
-- RODO: nie trzymamy raw IP, tylko SHA-256(ip|salt).slice(0,16). Wystarczy żeby
-- pogrupować "ten sam IP wszedł 3 razy", ale nie da się odczytać kogo to było.
ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS country text;

CREATE INDEX IF NOT EXISTS user_sessions_ip_hash_idx
  ON public.user_sessions (ip_hash, started_at DESC)
  WHERE ip_hash IS NOT NULL;

-- Re-create admin view do tych nowych kolumn.
DROP VIEW IF EXISTS public.user_sessions_admin;
CREATE VIEW public.user_sessions_admin AS
SELECT
  s.id, s.user_id, s.anon_id,
  s.started_at, s.last_seen_at, s.ended_at,
  s.last_path, s.last_event,
  s.user_agent,
  s.events_count,
  s.ip_hash, s.country,
  p.email AS user_email,
  p.name  AS display_name,
  EXTRACT(epoch FROM (COALESCE(s.ended_at, s.last_seen_at) - s.started_at))::integer AS duration_s
FROM public.user_sessions s
LEFT JOIN public.profiles p ON p.id = s.user_id;

ALTER VIEW public.user_sessions_admin SET (security_invoker = on);
GRANT SELECT ON public.user_sessions_admin TO authenticated;
