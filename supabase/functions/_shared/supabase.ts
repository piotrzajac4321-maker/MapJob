import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.0';

export function getSupabaseAdmin(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseFromRequest(req: Request): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
  return createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getCurrentUserId(req: Request): Promise<string | null> {
  const client = getSupabaseFromRequest(req);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function getCurrentOrgId(req: Request): Promise<string | null> {
  const headerOrg = req.headers.get('x-org-id');
  if (!headerOrg) return null;

  const userId = await getCurrentUserId(req);
  if (!userId) return null;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
    .eq('org_id', headerOrg)
    .not('accepted_at', 'is', null)
    .maybeSingle();

  if (error || !data) return null;
  return data.org_id;
}
