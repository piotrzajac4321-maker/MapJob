-- MapJob: CV auto-fill — extend `profiles` with worker-profile fields so the
-- data migrates from localStorage (mj_profile_*) to the DB and syncs across
-- devices. New columns are nullable and backwards-compatible.
--
-- After deploying this migration, run:
--   select column_name from information_schema.columns
--   where table_schema='public' and table_name='profiles' and column_name like 'cv%';
-- to confirm.

alter table public.profiles
  add column if not exists cv_url          text,
  add column if not exists cv_updated_at   timestamptz,
  add column if not exists specializations text,
  add column if not exists certs           text,
  add column if not exists langs           text,
  add column if not exists avail_from_text text,
  add column if not exists mobility        text,
  add column if not exists employ_type     text,
  add column if not exists daily_rate      integer,
  add column if not exists monthly_rate    integer,
  add column if not exists countries       text;

-- RLS: `public.profiles` already has owner policies (auth.uid() = id).
-- New columns inherit — no new policies required. Verify manually:
--   select polname, polcmd, qual, with_check from pg_policy
--   where polrelid = 'public.profiles'::regclass;
--
-- Storage: CVs are uploaded to the existing PRIVATE bucket `chat-attachments`
-- under path `cv/<user_id>.pdf`. Employers read the CV via a signed URL
-- (future work) — current flow reuses `getPublicUrl()` for consistency with
-- the existing apply flow; switch to `createSignedUrl` when the bucket-policy
-- audit requires it.
