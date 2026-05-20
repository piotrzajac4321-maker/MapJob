import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();

  const [{ count: postCount }, { count: groupCount }, { count: campaignCount }] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('groups').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
  ]);

  const { data: runningCampaigns } = await supabase
    .from('v_campaign_summary')
    .select('*')
    .eq('campaign_status', 'running')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link
          href="/posts/new/ai"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Generuj post AI
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Posty w bibliotece" value={postCount ?? 0} href="/posts" />
        <Stat label="Aktywne grupy" value={groupCount ?? 0} href="/groups" />
        <Stat label="Kampanie" value={campaignCount ?? 0} href="/campaigns" />
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Aktywne kampanie</h2>
        {runningCampaigns && runningCampaigns.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Nazwa</th>
                  <th className="px-4 py-2 text-right">Postowane</th>
                  <th className="px-4 py-2 text-right">Pomijane</th>
                  <th className="px-4 py-2 text-right">Pending</th>
                  <th className="px-4 py-2 text-right">% sukcesu</th>
                </tr>
              </thead>
              <tbody>
                {runningCampaigns.map((c: any) => (
                  <tr key={c.campaign_id} className="border-t">
                    <td className="px-4 py-2">
                      <Link href={`/campaigns/${c.campaign_id}`} className="hover:text-primary">
                        {c.campaign_name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right">{c.posted}</td>
                    <td className="px-4 py-2 text-right">{c.skipped}</td>
                    <td className="px-4 py-2 text-right">{c.pending}</td>
                    <td className="px-4 py-2 text-right">{c.posted_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Brak aktywnych kampanii.{' '}
            <Link href="/campaigns/new" className="text-primary hover:underline">
              Utwórz pierwszą
            </Link>
            .
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block rounded-lg border bg-card p-6 hover:border-primary">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}
