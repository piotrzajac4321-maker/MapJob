'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        <h1 className="mb-2 text-2xl font-bold">Zaloguj się</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Wpisz email — wyślemy magic link. Bez haseł.
        </p>

        {status === 'sent' ? (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-900">
            Sprawdź skrzynkę — link logowania trafił na <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ty@firma.pl"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={status === 'sending'}
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {status === 'sending' ? 'Wysyłam…' : 'Wyślij link logowania'}
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Nie masz konta?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Załóż za darmo
          </Link>
        </p>
      </div>
    </main>
  );
}
