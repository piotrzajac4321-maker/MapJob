-- Quick-stats widget: server-side OTP + session token storage.
-- Single row (id=1), no public access — only service_role via Edge Function.

CREATE TABLE IF NOT EXISTS quick_stats_otp (
  id               int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  otp_hash         text,
  expires_at       timestamptz,
  attempts         int NOT NULL DEFAULT 0,
  session_token    text,
  session_expires_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quick_stats_otp ENABLE ROW LEVEL SECURITY;
-- No policies → only service_role has access.
