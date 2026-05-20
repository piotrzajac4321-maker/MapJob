/**
 * issue-extension-token — wystawia custom JWT dla Chrome extension.
 *
 * Flow:
 * 1. User loguje się w web app, klika "Connect extension" na /extension-auth.
 * 2. Web wywołuje tę funkcję z { orgId, deviceId, version, ua }.
 * 3. Funkcja sprawdza membership, rejestruje device w extension_devices,
 *    generuje JWT z claims: { sub: userId, org_id, device_id, scope='extension', exp 30d }.
 * 4. Web redirectuje do chrome-extension://<id>/callback.html#token=<jwt>
 *    (lub zwraca JSON do innego flow).
 *
 * JWT signed HS256 with EXTENSION_TOKEN_SECRET. Verifier po stronie innych Edge Functions
 * sprawdza claim scope='extension' i czy device_id nie ma revoked_at.
 */

import { z } from 'npm:zod@3.23.8';
import { create as jwtCreate, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { getSupabaseAdmin, getCurrentUserId } from '../_shared/supabase.ts';

const RequestSchema = z.object({
  orgId: z.string().uuid(),
  deviceId: z.string().min(8).max(128),
  version: z.string().max(40).optional(),
  ua: z.string().max(400).optional(),
});

async function getSigningKey(): Promise<CryptoKey> {
  const secret = Deno.env.get('EXTENSION_TOKEN_SECRET');
  if (!secret) throw new Error('EXTENSION_TOKEN_SECRET not set');
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'POST only');
  }

  const userId = await getCurrentUserId(req);
  if (!userId) return errorResponse(401, 'unauthorized', 'Sign in required');

  let payload: z.infer<typeof RequestSchema>;
  try {
    payload = RequestSchema.parse(await req.json());
  } catch (err) {
    return errorResponse(400, 'invalid_request', String(err));
  }

  const admin = getSupabaseAdmin();

  // Verify membership
  const { data: membership } = await admin
    .from('org_members')
    .select('role')
    .eq('org_id', payload.orgId)
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)
    .maybeSingle();

  if (!membership) return errorResponse(403, 'forbidden', 'Not a member of this org');

  // Upsert device
  const { error: upsertErr } = await admin.from('extension_devices').upsert(
    {
      device_id: payload.deviceId,
      user_id: userId,
      org_id: payload.orgId,
      version: payload.version,
      ua: payload.ua,
      last_seen_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: 'device_id' },
  );

  if (upsertErr) return errorResponse(500, 'db_error', upsertErr.message);

  // Mint JWT (30 days)
  const key = await getSigningKey();
  const token = await jwtCreate(
    { alg: 'HS256', typ: 'JWT' },
    {
      sub: userId,
      org_id: payload.orgId,
      device_id: payload.deviceId,
      scope: 'extension',
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60 * 24 * 30),
    },
    key,
  );

  return jsonResponse({
    token,
    orgId: payload.orgId,
    userId,
    deviceId: payload.deviceId,
    expiresInSeconds: 60 * 60 * 24 * 30,
  });
});
