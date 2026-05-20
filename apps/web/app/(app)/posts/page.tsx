import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function PostsPage() {
  const supabase = await createSupabaseServer();
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, type, status, framework, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Posty</h1>
        <div className="flex gap-2">
          <Link
            href="/posts/new/ai"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            + Generator AI
          </Link>
          <Link
            href="/posts/new"
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            + Napisz ręcznie
          </Link>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="mb-4 text-muted-foreground">Brak postów w bibliotece.</p>
          <Link
            href="/posts/new/ai"
            className="text-primary hover:underline"
          >
            Wygeneruj pierwszy post przez AI
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Tytuł</th>
                <th className="px-4 py-2 text-left">Typ</th>
                <th className="px-4 py-2 text-left">Framework</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Utworzony</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">
                    <Link href={`/posts/${p.id}`} className="hover:text-primary">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{p.type}</td>
                  <td className="px-4 py-2">{p.framework ?? '—'}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('pl-PL')}
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-900',
    ready: 'bg-green-100 text-green-900',
    archived: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.draft}`}>
      {status}
    </span>
  );
}
