import { createSupabaseServer } from '@/lib/supabase/server';

export default async function TeamSettingsPage() {
  const supabase = await createSupabaseServer();
  const { data: members } = await supabase
    .from('org_members')
    .select('id, role, user_id, invited_email, accepted_at, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Zespół</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Członkowie organizacji. W MVP: owner / admin / editor / viewer (zaproszenia w v2).
      </p>

      {!members || members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak członków.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Użytkownik / email</th>
                <th className="px-4 py-2 text-left">Rola</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">
                    {m.user_id ?? m.invited_email ?? '—'}
                  </td>
                  <td className="px-4 py-2">{m.role}</td>
                  <td className="px-4 py-2">
                    {m.accepted_at ? (
                      <span className="text-green-700">aktywny</span>
                    ) : (
                      <span className="text-yellow-700">zaproszony</span>
                    )}
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
