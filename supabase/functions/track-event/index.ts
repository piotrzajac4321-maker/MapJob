/**
 * track-event — przyjmuje eventy telemetryczne z Chrome extension i web app.
 *
 * Najważniejsze typy event:
 * - extension.selector_miss { selector_name, path } — DOM FB się zmienił
 * - extension.post_attempted { campaignId, groupId }
 * - extension.post_posted { campaignId, groupId, fbPostUrl }
 * - extension.post_failed { campaignId, groupId, errorCode, errorMessage }
 * - extension.login_required { campaignId }
 *
 * Zapisuje do audit_log przez SECURITY DEFINER log_audit().
 */

import { z } from 'npm:zod@3.23.8';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin, getCurrentUserId } from '../_shared/supabase.ts';

const EventSchema = z.object({
  orgId: z.string().uuid(),
  action: z.string().min(3).max(80),
  entityType: z.string().max(40).optional(),
  entityId: z.string().uuid().optional(),
  meta: z.record(z.unknown()).optional(),
});

const BatchSchema = z.object({
  events: z.array(EventSchema).min(1).max(100),
});

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'POST only');

  const userId = await getCurrentUserId(req);
  if (!userId) return errorResponse(401, 'unauthorized', 'Sign in required');

  let payload: z.infer<typeof BatchSchema>;
  try {
    payload = BatchSchema.parse(await req.json());
  } catch (err) {
    return errorResponse(400, 'invalid_request', String(err));
  }

  const admin = getSupabaseAdmin();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ua = req.headers.get('user-agent');

  const inserts = payload.events.map((e) => ({
    org_id: e.orgId,
    actor_user_id: userId,
    action: e.action,
    entity_type: e.entityType ?? null,
    entity_id: e.entityId ?? null,
    meta: e.meta ?? {},
    ip: ip ?? null,
    user_agent: ua ?? null,
  }));

  const { error } = await admin.from('audit_log').insert(inserts);
  if (error) return errorResponse(500, 'db_error', error.message);

  return jsonResponse({ accepted: inserts.length });
});
