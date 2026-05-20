import { createSupabaseServer } from '@/lib/supabase/server';

export default async function GroupsPage() {
  const supabase = await createSupabaseServer();
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, url, members_count, privacy, post_approval_required, tags, cooldown_minutes, daily_cap, last_posted_at, is_active')
    .order('name', { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Grupy</h1>
        <p className="text-sm text-muted-foreground">
          {groups?.length ?? 0} grup zaimportowanych przez rozszerzenie
        </p>
      </div>

      {!groups || groups.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="mb-2 text-muted-foreground">Brak grup w bazie.</p>
          <p className="text-sm text-muted-foreground">
            Zainstaluj rozszerzenie Chrome i wejdź na <code>facebook.com/groups/joins/</code> —
            kliknij „Importuj grupy" w popupie.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Nazwa</th>
                <th className="px-4 py-2 text-right">Członkowie</th>
                <th className="px-4 py-2 text-left">Prywatność</th>
                <th className="px-4 py-2 text-left">Tagi</th>
                <th className="px-4 py-2 text-right">Cooldown</th>
                <th className="px-4 py-2 text-right">Cap/dzień</th>
                <th className="px-4 py-2 text-left">Ostatni post</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className={`border-t ${!g.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2">
                    <a href={g.url} target="_blank" rel="noopener" className="hover:text-primary">
                      {g.name}
                    </a>
                    {g.post_approval_required && (
                      <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900">
                        wymaga aprobaty
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">{g.members_count?.toLocaleString('pl-PL') ?? '—'}</td>
                  <td className="px-4 py-2">{g.privacy ?? 'unknown'}</td>
                  <td className="px-4 py-2">
                    {(g.tags ?? []).map((t) => (
                      <span key={t} className="mr-1 rounded bg-secondary px-1.5 py-0.5 text-xs">
                        {t}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-right">{g.cooldown_minutes} min</td>
                  <td className="px-4 py-2 text-right">{g.daily_cap}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {g.last_posted_at ? new Date(g.last_posted_at).toLocaleString('pl-PL') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
