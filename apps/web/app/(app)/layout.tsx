import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: memberships } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name, slug)')
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null);

  const activeOrg = memberships?.[0] as
    | { org_id: string; role: string; organizations: { name: string; slug: string } | null }
    | undefined;

  if (!activeOrg) {
    return (
      <main className="container py-16">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold">Brak organizacji</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Nie należysz jeszcze do żadnej organizacji. Utwórz nową poniżej.
          </p>
          <Link href="/signup" className="text-sm text-primary hover:underline">
            Utwórz organizację
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="font-semibold">
            MapJob FB Poster
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link href="/posts" className="hover:text-primary">Posty</Link>
            <Link href="/groups" className="hover:text-primary">Grupy</Link>
            <Link href="/campaigns" className="hover:text-primary">Kampanie</Link>
            <Link href="/analytics" className="hover:text-primary">Analytics</Link>
            <Link href="/settings/team" className="hover:text-primary">Zespół</Link>
            <Link href="/extension-auth" className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80">
              Podłącz extension
            </Link>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
