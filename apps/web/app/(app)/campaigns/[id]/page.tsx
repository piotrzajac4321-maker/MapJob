import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, posts(title, type, body_md)')
    .eq('id', id)
    .maybeSingle();

  if (!campaign) notFound();

  const { data: targets } = await supabase
    .from('campaign_targets')
    .select('id, status, scheduled_at, posted_at, fb_post_url, error_code, error_message, groups(name, url)')
    .eq('campaign_id', id)
    .order('status', { ascending: true });

  const stats = {
    total: targets?.length ?? 0,
    pending: targets?.filter((t) => t.status === 'pending').length ?? 0,
    posted: targets?.filter((t) => t.status === 'posted').length ?? 0,
    skipped: targets?.filter((t) => t.status === 'skipped').length ?? 0,
    failed: targets?.filter((t) => t.status === 'failed').length ?? 0,
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-primary">
          ← wszystkie kampanie
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
          <CampaignActions campaignId={id} currentStatus={campaign.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Status: <strong>{campaign.status}</strong> · Post: {(campaign.posts as any)?.title}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-3">
        <StatCard label="Razem" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Postowane" value={stats.posted} color="text-green-600" />
        <StatCard label="Pomijane" value={stats.skipped} color="text-yellow-600" />
        <StatCard label="Błędy" value={stats.failed} color="text-red-600" />
      </div>

      <div className="mb-6 rounded-lg border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Treść posta</h2>
        <pre className="whitespace-pre-wrap font-mono text-sm">{(campaign.posts as any)?.body_md}</pre>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Grupa</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Zaplanowane</th>
              <th className="px-4 py-2 text-left">Wykonane</th>
              <th className="px-4 py-2 text-left">Błąd</th>
            </tr>
          </thead>
          <tbody>
            {(targets ?? []).map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">
                  {(t.groups as any)?.url ? (
                    <a href={(t.groups as any).url} target="_blank" rel="noopener" className="hover:text-primary">
                      {(t.groups as any).name}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-2">
                  <TargetBadge status={t.status} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {t.scheduled_at ? new Date(t.scheduled_at).toLocaleString('pl-PL') : '—'}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {t.posted_at ? new Date(t.posted_at).toLocaleString('pl-PL') : '—'}
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {t.error_code ? `${t.error_code}: ${t.error_message ?? ''}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? ''}`}>{value}</p>
    </div>
  );
}

function TargetBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    queued: 'bg-blue-100 text-blue-900',
    in_progress: 'bg-blue-200 text-blue-900',
    posted: 'bg-green-100 text-green-900',
    skipped: 'bg-yellow-100 text-yellow-900',
    failed: 'bg-red-100 text-red-900',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.pending}`}>
      {status}
    </span>
  );
}

function CampaignActions({ campaignId, currentStatus }: { campaignId: string; currentStatus: string }) {
  // Client-side actions go via Server Action lub API route — w MVP placeholder
  return (
    <div className="flex gap-2 text-sm">
      {currentStatus === 'draft' && (
        <form action={`/api/campaigns/${campaignId}/start`} method="POST">
          <button className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground">
            Start
          </button>
        </form>
      )}
      {currentStatus === 'running' && (
        <form action={`/api/campaigns/${campaignId}/pause`} method="POST">
          <button className="rounded-md border border-input px-4 py-2 font-medium hover:bg-accent">
            Pauza
          </button>
        </form>
      )}
      {currentStatus === 'paused' && (
        <form action={`/api/campaigns/${campaignId}/resume`} method="POST">
          <button className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground">
            Wznów
          </button>
        </form>
      )}
    </div>
  );
}
