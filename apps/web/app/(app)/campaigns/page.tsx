import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function CampaignsPage() {
  const supabase = await createSupabaseServer();
  const { data: campaigns } = await supabase
    .from('v_campaign_summary')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kampanie</h1>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Nowa kampania
        </Link>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="mb-4 text-muted-foreground">Brak kampanii.</p>
          <Link href="/campaigns/new" className="text-primary hover:underline">
            Utwórz pierwszą kampanię
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Nazwa</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Posted</th>
                <th className="px-4 py-2 text-right">Pending</th>
                <th className="px-4 py-2 text-right">Skipped</th>
                <th className="px-4 py-2 text-right">Failed</th>
                <th className="px-4 py-2 text-right">% Done</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => (
                <tr key={c.campaign_id} className="border-t">
                  <td className="px-4 py-2">
                    <Link href={`/campaigns/${c.campaign_id}`} className="hover:text-primary">
                      {c.campaign_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <CampaignStatus status={c.campaign_status} />
                  </td>
                  <td className="px-4 py-2 text-right">{c.posted}</td>
                  <td className="px-4 py-2 text-right">{c.pending}</td>
                  <td className="px-4 py-2 text-right">{c.skipped}</td>
                  <td className="px-4 py-2 text-right">{c.failed}</td>
                  <td className="px-4 py-2 text-right font-medium">{c.posted_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CampaignStatus({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-900',
    running: 'bg-green-100 text-green-900',
    paused: 'bg-yellow-100 text-yellow-900',
    done: 'bg-secondary text-secondary-foreground',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.draft}`}>
      {status}
    </span>
  );
}
