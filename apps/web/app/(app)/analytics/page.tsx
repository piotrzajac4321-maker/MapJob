import { createSupabaseServer } from '@/lib/supabase/server';

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServer();

  const [{ data: perDay }, { data: byGroup }, { data: errors }, { data: hours }] = await Promise.all([
    supabase.from('v_posts_per_day').select('*').order('day', { ascending: false }).limit(14),
    supabase.from('v_group_success_rate').select('*').order('total_attempts', { ascending: false }).limit(10),
    supabase.from('v_error_codes').select('*').order('occurrences', { ascending: false }).limit(10),
    supabase.from('v_best_hours').select('*').order('hour_of_day'),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Posty/dzień (ostatnie 14 dni)</h2>
        {perDay && perDay.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Dzień</th>
                  <th className="px-4 py-2 text-right">Posted</th>
                  <th className="px-4 py-2 text-right">Skipped</th>
                  <th className="px-4 py-2 text-right">Failed</th>
                </tr>
              </thead>
              <tbody>
                {perDay.map((d: any) => (
                  <tr key={d.day} className="border-t">
                    <td className="px-4 py-2">{new Date(d.day).toLocaleDateString('pl-PL')}</td>
                    <td className="px-4 py-2 text-right">{d.posted_count}</td>
                    <td className="px-4 py-2 text-right">{d.skipped_count}</td>
                    <td className="px-4 py-2 text-right">{d.failed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Brak danych.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Top grupy (success rate)</h2>
        {byGroup && byGroup.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Grupa</th>
                  <th className="px-4 py-2 text-right">Próby</th>
                  <th className="px-4 py-2 text-right">Postowane</th>
                  <th className="px-4 py-2 text-right">% sukcesu</th>
                </tr>
              </thead>
              <tbody>
                {byGroup.map((g: any) => (
                  <tr key={g.group_id} className="border-t">
                    <td className="px-4 py-2">{g.group_name}</td>
                    <td className="px-4 py-2 text-right">{g.total_attempts}</td>
                    <td className="px-4 py-2 text-right">{g.posted_count}</td>
                    <td className="px-4 py-2 text-right">{g.success_rate_pct ?? '—'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Brak danych.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Najczęstsze błędy</h2>
        {errors && errors.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {errors.map((e: any) => (
              <li key={e.error_code} className="flex justify-between rounded-md border bg-card px-3 py-2">
                <code className="font-mono text-xs">{e.error_code}</code>
                <span className="text-muted-foreground">{e.occurrences}×</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Bez błędów — gratulacje.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Najlepsze godziny publikacji</h2>
        {hours && hours.length > 0 ? (
          <div className="flex h-32 items-end gap-1">
            {Array.from({ length: 24 }, (_, h) => {
              const slot = hours.find((x: any) => x.hour_of_day === h);
              const count = slot?.posted_count ?? 0;
              const max = Math.max(...hours.map((x: any) => x.posted_count));
              const height = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={h} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    title={`${h}:00 — ${count} postów`}
                  />
                  <span className="text-[10px] text-muted-foreground">{h}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Brak danych.</p>
        )}
      </section>
    </div>
  );
}
