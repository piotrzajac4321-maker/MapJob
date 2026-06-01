-- 20260501_referral_notifications.sql
-- Bug: referral RPCs (apply_referral_code, on_pin_added_referral) recorded points
-- and updated referrals table, but never inserted into user_notifications, so the
-- referrer received no bell-icon notification, no OS push, and no email when a
-- friend signed up via their link.
--
-- Fix:
--   1. apply_referral_code  → INSERT 'referral_registered' notification for referrer
--                            + INSERT 'referral_welcome' notification for referred
--   2. on_pin_added_referral → INSERT 'referral_pin_added' for referrer
--                             + INSERT 'referral_pro_unlocked' (when 5-pack milestone)
--   3. AFTER INSERT trigger on public.user_notifications  → POST notify-push
--      edge function (skips type='message' which already has its own push trigger
--      on messages table).

BEGIN;

-- ============================================================================
-- 1) apply_referral_code — insert notifications for both parties
-- ============================================================================
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_new_user_id uuid, p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_caller        UUID := auth.uid();
  v_referrer_id   UUID;
  v_registrations INT;
  v_referral_id   UUID;
  v_pts_referrer  INT := 50;
  v_pts_referred  INT := 20;
  v_has_pin       BOOLEAN := false;
  v_completed     INT;
  v_got_pro       BOOLEAN := false;
  v_referred_name TEXT;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF v_caller != p_new_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  IF p_new_user_id IS NULL OR p_code IS NULL OR TRIM(p_code) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_params');
  END IF;

  SELECT user_id, COALESCE(registrations, 0)
    INTO v_referrer_id, v_registrations
    FROM referral_codes
   WHERE code = UPPER(TRIM(p_code))
   LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'code_not_found');
  END IF;

  IF v_referrer_id = p_new_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'self_referral');
  END IF;

  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_new_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_referred');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM pins
     WHERE user_id = p_new_user_id AND is_active = true AND is_demo = false
  ) INTO v_has_pin;

  IF v_has_pin THEN
    v_pts_referrer := 200;
    v_pts_referred := 100;
  END IF;

  INSERT INTO referrals (
    referrer_id, referred_id, code, status,
    completed_at, reward_given, pin_added, points_given
  ) VALUES (
    v_referrer_id, p_new_user_id, UPPER(TRIM(p_code)),
    CASE WHEN v_has_pin THEN 'completed' ELSE 'registered' END,
    CASE WHEN v_has_pin THEN NOW() ELSE NULL END,
    false, v_has_pin,
    v_pts_referrer + v_pts_referred
  )
  RETURNING id INTO v_referral_id;

  UPDATE referral_codes
     SET registrations = v_registrations + 1
   WHERE code = UPPER(TRIM(p_code));

  UPDATE profiles SET invited_by = v_referrer_id WHERE id = p_new_user_id;

  PERFORM add_user_points(v_referrer_id, v_pts_referrer,
    'Polecenie: ' || CASE WHEN v_has_pin THEN 'użytkownik z pinem dołączył przez Twój link! 🎯'
    ELSE 'rejestracja przez Twój link (' || UPPER(TRIM(p_code)) || ')' END,
    'referral', v_referral_id);

  PERFORM add_user_points(p_new_user_id, v_pts_referred,
    CASE WHEN v_has_pin THEN 'Dołączyłeś przez link polecający i masz pina! 📍'
    ELSE 'Bonus powitalny za rejestrację przez link polecający' END,
    CASE WHEN v_has_pin THEN 'referral' ELSE 'welcome' END,
    v_referral_id);

  -- ★ NEW: nazwa zaproszonego do treści notyfikacji
  SELECT COALESCE(p.name, NULLIF(SPLIT_PART(p.email, '@', 1), ''))
    INTO v_referred_name
    FROM profiles p
   WHERE p.id = p_new_user_id;

  -- ★ NEW: notyfikacja dla POLECAJĄCEGO (referrer)
  INSERT INTO user_notifications(user_id, type, title, body, icon, link_data)
  VALUES (
    v_referrer_id,
    'referral_registered',
    CASE WHEN v_has_pin THEN '🎯 Polecony użytkownik z pinem!' ELSE '🔗 Ktoś dołączył przez Twój link!' END,
    COALESCE(v_referred_name, 'Nowy użytkownik') ||
      ' zarejestrował się przez Twój link — masz +' || v_pts_referrer || ' pkt' ||
      CASE WHEN v_has_pin THEN ' (bonus za pin!)' ELSE '' END,
    CASE WHEN v_has_pin THEN '🎯' ELSE '🔗' END,
    jsonb_build_object(
      'referral_id',   v_referral_id,
      'referred_id',   p_new_user_id,
      'code',          UPPER(TRIM(p_code)),
      'points_added',  v_pts_referrer,
      'had_pin',       v_has_pin
    )
  );

  -- ★ NEW: notyfikacja dla ZAPROSZONEGO (referred) — bonus powitalny
  INSERT INTO user_notifications(user_id, type, title, body, icon, link_data)
  VALUES (
    p_new_user_id,
    'referral_welcome',
    '🎁 Bonus powitalny!',
    'Dołączyłeś przez link polecający — masz +' || v_pts_referred || ' pkt na start' ||
      CASE WHEN v_has_pin THEN ' (i bonus za pin!)' ELSE '' END,
    '🎁',
    jsonb_build_object(
      'referral_id',   v_referral_id,
      'referrer_id',   v_referrer_id,
      'points_added',  v_pts_referred,
      'had_pin',       v_has_pin
    )
  );

  IF v_has_pin THEN
    SELECT COUNT(*) INTO v_completed
      FROM referrals
     WHERE referrer_id = v_referrer_id AND pin_added = true AND reward_given = false;

    IF v_completed >= 5 AND (v_completed % 5) = 0 THEN
      INSERT INTO subscriptions(user_id, plan_pro, plan_pro_expires_at)
      VALUES(v_referrer_id, true, now() + interval '30 days')
      ON CONFLICT(user_id) DO UPDATE
         SET plan_pro            = true,
             plan_pro_expires_at = GREATEST(COALESCE(subscriptions.plan_pro_expires_at, now()), now()) + interval '30 days',
             updated_at          = now();

      PERFORM add_user_points(v_referrer_id, 500, 'Bonus za ' || v_completed || ' poleceń z pinem! 🏆', 'reward', v_referral_id);

      UPDATE referrals SET reward_given = true
       WHERE referrer_id = v_referrer_id AND pin_added = true AND reward_given = false;

      v_got_pro := true;

      -- ★ NEW: notyfikacja Plan Pro
      INSERT INTO user_notifications(user_id, type, title, body, icon, link_data)
      VALUES (
        v_referrer_id,
        'referral_pro_unlocked',
        '🏆 Plan Pro odblokowany!',
        'Brawo! ' || v_completed || ' poleceń z pinem — dostajesz 30 dni Pro GRATIS + 500 pkt bonusu',
        '🏆',
        jsonb_build_object('completed_count', v_completed, 'referral_id', v_referral_id)
      );
    END IF;
  END IF;

  INSERT INTO referral_leaderboard(user_id, month, invite_count, rank)
  VALUES(v_referrer_id, TO_CHAR(now(), 'YYYY-MM'), 1, 1)
  ON CONFLICT(user_id, month) DO UPDATE
    SET invite_count = referral_leaderboard.invite_count + 1,
        updated_at   = now();

  RETURN jsonb_build_object(
    'success',         true,
    'referral_id',     v_referral_id,
    'referrer_id',     v_referrer_id,
    'points_referrer', v_pts_referrer,
    'points_referred', v_pts_referred,
    'had_pin',         v_has_pin,
    'got_pro',         v_got_pro
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- ============================================================================
-- 2) on_pin_added_referral — insert notifications when referred adds a pin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.on_pin_added_referral(p_user_id uuid, p_pin_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ref            RECORD;
  v_completed      INT;
  v_got_pro        BOOLEAN := false;
  v_referred_name  TEXT;
BEGIN
  SELECT * INTO v_ref FROM referrals
   WHERE referred_id = p_user_id AND pin_added = false
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'reason', 'no_pending_referral');
  END IF;

  UPDATE referrals
     SET pin_added    = true,
         status       = 'completed',
         completed_at = now()
   WHERE id = v_ref.id;

  PERFORM add_user_points(v_ref.referrer_id, 200, 'Zaproszony dodał pin na mapie! 🎯', 'referral', v_ref.id);
  PERFORM add_user_points(v_ref.referred_id, 100, 'Dodałeś pin przez link polecający! 📍', 'referral', v_ref.id);

  -- ★ NEW: nazwa zaproszonego
  SELECT COALESCE(p.name, NULLIF(SPLIT_PART(p.email, '@', 1), ''))
    INTO v_referred_name
    FROM profiles p
   WHERE p.id = p_user_id;

  -- ★ NEW: notyfikacja dla polecającego — twój zaproszony dodał pin
  INSERT INTO user_notifications(user_id, type, title, body, icon, link_data)
  VALUES (
    v_ref.referrer_id,
    'referral_pin_added',
    '🎯 Zaproszony dodał pin!',
    COALESCE(v_referred_name, 'Twój zaproszony') || ' dodał pin na mapie — masz +200 pkt',
    '🎯',
    jsonb_build_object(
      'referral_id', v_ref.id,
      'referred_id', p_user_id,
      'pin_id',      p_pin_id,
      'points_added', 200
    )
  );

  -- ★ NEW: notyfikacja dla zaproszonego — bonus za pin
  INSERT INTO user_notifications(user_id, type, title, body, icon, link_data)
  VALUES (
    p_user_id,
    'referral_welcome',
    '📍 Bonus za pin!',
    'Dodałeś pin przez link polecający — masz +100 pkt',
    '📍',
    jsonb_build_object(
      'referral_id', v_ref.id,
      'referrer_id', v_ref.referrer_id,
      'pin_id',      p_pin_id,
      'points_added', 100
    )
  );

  SELECT COUNT(*) INTO v_completed
    FROM referrals
   WHERE referrer_id = v_ref.referrer_id AND pin_added = true AND reward_given = false;

  IF v_completed >= 5 AND (v_completed % 5) = 0 THEN
    INSERT INTO subscriptions(user_id, plan_pro, plan_pro_expires_at, is_active)
    VALUES(v_ref.referrer_id, true, now() + interval '30 days', true)
    ON CONFLICT(user_id) DO UPDATE
       SET plan_pro            = true,
           plan_pro_expires_at = GREATEST(COALESCE(subscriptions.plan_pro_expires_at, now()), now()) + interval '30 days',
           is_active           = true,
           updated_at          = now();

    INSERT INTO referral_rewards(user_id, referral_id, reward_type, reward_value, description)
    VALUES(v_ref.referrer_id, v_ref.id, 'pro_days', 30,
      'Milestone ' || v_completed || ' zaproszeń z pinem — 30 dni Pro! 🏆');

    PERFORM add_user_points(v_ref.referrer_id, 500,
      'Bonus za ' || v_completed || ' poleceń z pinem! 🏆', 'reward', v_ref.id);

    UPDATE referrals SET reward_given = true
     WHERE referrer_id = v_ref.referrer_id AND pin_added = true AND reward_given = false;

    v_got_pro := true;

    -- ★ NEW: notyfikacja Plan Pro
    INSERT INTO user_notifications(user_id, type, title, body, icon, link_data)
    VALUES (
      v_ref.referrer_id,
      'referral_pro_unlocked',
      '🏆 Plan Pro odblokowany!',
      'Brawo! ' || v_completed || ' poleceń z pinem — dostajesz 30 dni Pro GRATIS + 500 pkt bonusu',
      '🏆',
      jsonb_build_object('completed_count', v_completed, 'referral_id', v_ref.id)
    );
  END IF;

  UPDATE referral_codes
     SET registrations = (
           SELECT COUNT(*) FROM referrals
            WHERE referrer_id = v_ref.referrer_id AND pin_added = true
         )
   WHERE user_id = v_ref.referrer_id;

  INSERT INTO referral_leaderboard(user_id, month, invite_count, rank)
  VALUES(v_ref.referrer_id, TO_CHAR(now(), 'YYYY-MM'),
    (SELECT COUNT(*) FROM referrals WHERE referrer_id = v_ref.referrer_id AND pin_added = true),
    1)
  ON CONFLICT(user_id, month) DO UPDATE
    SET invite_count = (SELECT COUNT(*) FROM referrals WHERE referrer_id = v_ref.referrer_id AND pin_added = true),
        updated_at   = now();

  UPDATE referral_leaderboard rl
     SET rank = sub.rank
    FROM (
      SELECT user_id, RANK() OVER (ORDER BY invite_count DESC) AS rank
        FROM referral_leaderboard
       WHERE month = TO_CHAR(now(), 'YYYY-MM')
    ) sub
   WHERE rl.user_id = sub.user_id AND rl.month = TO_CHAR(now(), 'YYYY-MM');

  RETURN json_build_object(
    'success',         true,
    'got_pro',         v_got_pro,
    'completed_count', v_completed
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_pin_added_referral: %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- ============================================================================
-- 3) AFTER INSERT trigger on user_notifications → notify-push edge function
-- ============================================================================
-- Skips 'message' type — that one already has its own push pipeline via
-- push_notify trigger on messages table that calls /functions/v1/push-notify.
-- All other types ('referral_*', 'review', 'payment_*', 'urgent_*') get OS push.
DROP TRIGGER IF EXISTS push_notify_user_notif ON public.user_notifications;
CREATE TRIGGER push_notify_user_notif
AFTER INSERT ON public.user_notifications
FOR EACH ROW
WHEN (NEW.type IS DISTINCT FROM 'message')
EXECUTE FUNCTION supabase_functions.http_request(
  'https://ahgzjneegvptudphibdm.supabase.co/functions/v1/notify-push',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

COMMIT;
