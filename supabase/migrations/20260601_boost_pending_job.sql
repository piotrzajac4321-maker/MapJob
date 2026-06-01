-- Pending job boost: user pays for boost but has no offer yet.
-- Auto-applied to first new offer created after purchase.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pending_job_boost_until TIMESTAMPTZ;
