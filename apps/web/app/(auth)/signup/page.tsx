'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?org_name=${encodeURIComponent(orgName)}`,
        data: { pending_org_name: orgName },
      },
    });

    if (error) {
      setStatus('error');
      setError(error.message);
    } else {
      setStatus('sent');
    }
  }

  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Załóż konto</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Tworzysz organizację — w niej Twoi członkowie zespołu, posty, grupy, kampanie.
        </p>

        {status === 'sent' ? (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-900">
            Sprawdź skrzynkę — link aktywacyjny trafił na <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nazwa firmy / zespołu</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="np. Rekrutacja Anna Kowalska"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ty@firma.pl"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {status === 'sending' ? 'Wysyłam…' : 'Utwórz konto'}
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Masz już konto?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </main>
  );
}
