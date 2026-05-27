-- 2026-05-02 — Fix krytycznego buga: trigger wysylal POST do push-notify/notify-push
-- BEZ Authorization header, a edge functions wymagaly service_role JWT → 401 dla wszystkich.
--
-- Naprawa:
-- 1. push-notify v22 i notify-push v2 zaakceptowuja anon|service_role|authenticated JWT
--    i re-fetch row z DB po id (RLS na messages/user_notifications chroni przed forge'em)
-- 2. Triggery wysylaja Authorization Bearer <anon_jwt> (anon key jest publiczny, exp=2089)
--
-- Dotyczy:
-- - push_notify (messages) — bug od deploya v21 push-notify ~2026-04-20
-- - push_notify_user_notif (user_notifications) — bug od deploya 2026-05-01 (nowy trigger)

DROP TRIGGER IF EXISTS push_notify ON public.messages;
CREATE TRIGGER push_notify
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
  'https://ahgzjneegvptudphibdm.supabase.co/functions/v1/push-notify',
  'POST',
  '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZ3pqbmVlZ3ZwdHVkcGhpYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA3NzcsImV4cCI6MjA4OTY4Njc3N30.KrCBuAzz7fsCHCUSGeTZ5vm7BOo-DIGvI3jZyrk4tL4"}',
  '{}',
  '5000'
);

DROP TRIGGER IF EXISTS push_notify_user_notif ON public.user_notifications;
CREATE TRIGGER push_notify_user_notif
AFTER INSERT ON public.user_notifications
FOR EACH ROW
WHEN (NEW.type IS DISTINCT FROM 'message')
EXECUTE FUNCTION supabase_functions.http_request(
  'https://ahgzjneegvptudphibdm.supabase.co/functions/v1/notify-push',
  'POST',
  '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZ3pqbmVlZ3ZwdHVkcGhpYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA3NzcsImV4cCI6MjA4OTY4Njc3N30.KrCBuAzz7fsCHCUSGeTZ5vm7BOo-DIGvI3jZyrk4tL4"}',
  '{}',
  '5000'
);

-- Drobny cleanup: duplikat unique constraint
ALTER TABLE public.referral_leaderboard DROP CONSTRAINT IF EXISTS referral_leaderboard_user_month_unique;
