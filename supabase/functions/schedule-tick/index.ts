/**
 * schedule-tick — cron-driven funkcja przekładająca campaign_targets z pending → queued
 * gdy nadejdzie scheduled_at, oraz finalizuje kampanie bez aktywnych targetów.
 *
 * Wywoływana co 1 min przez pg_cron (lub external cron). Brak JWT verify (verify_jwt = false
 * w config.toml), zabezpieczona przez SCHEDULE_TICK_SECRET w nagłówku.
 */

import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  // Sekret w header X-Schedule-Secret (ustawiany w pg_cron job)
  const expected = Deno.env.get('SCHEDULE_TICK_SECRET');
  if (expected) {
    const got = req.headers.get('x-schedule-secret');
    if (got !== expected) return errorResponse(403, 'forbidden', 'Bad schedule secret');
  }

  const admin = getSupabaseAdmin();

  // 1. Przesuń pending → queued dla nadeszłych scheduled_at
  const { data: queued, error: queueErr } = await admin
    .from('campaign_targets')
    .update({ status: 'queued' })
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .select('id');

  if (queueErr) return errorResponse(500, 'queue_error', queueErr.message);

  // 2. Finalizuj kampanie: jeśli wszystkie targety w stanie terminalnym → campaign.status = 'done'
  const { data: campaigns, error: campErr } = await admin
    .from('campaigns')
    .select('id')
    .eq('status', 'running');

  if (campErr) return errorResponse(500, 'campaigns_error', campErr.message);

  const finishedIds: string[] = [];
  for (const c of campaigns ?? []) {
    const { count } = await admin
      .from('campaign_targets')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', c.id)
      .in('status', ['pending', 'queued', 'in_progress']);

    if ((count ?? 0) === 0) {
      finishedIds.push(c.id);
    }
  }

  if (finishedIds.length > 0) {
    await admin.from('campaigns').update({ status: 'done' }).in('id', finishedIds);
  }

  return jsonResponse({
    queuedCount: queued?.length ?? 0,
    finishedCampaigns: finishedIds.length,
    tickAt: new Date().toISOString(),
  });
});
