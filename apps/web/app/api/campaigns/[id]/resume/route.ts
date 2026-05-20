import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();
  await supabase.from('campaigns').update({ status: 'running' }).eq('id', id);
  return NextResponse.redirect(new URL(`/campaigns/${id}`, _req.url));
}
