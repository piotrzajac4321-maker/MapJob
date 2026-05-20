'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function ExtensionAuthPage() {
  const [orgId, setOrgId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extensionId, setExtensionId] = useState<string>('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const dev = url.searchParams.get('device');
    const ext = url.searchParams.get('ext');
    if (dev) setDeviceId(dev);
    if (ext) setExtensionId(ext);

    void (async () => {
      const supabase = createSupabaseBrowser();
      const { data } = await supabase
        .from('org_members')
        .select('org_id')
        .not('accepted_at', 'is', null)
        .limit(1)
        .maybeSingle();
      if (data) setOrgId(data.org_id);
    })();
  }, []);

  async function issueToken() {
    if (!orgId || !deviceId) return;
    setStatus('loading');
    setError(null);

    const supabase = createSupabaseBrowser();
    const { data, error: fnErr } = await supabase.functions.invoke('issue-extension-token', {
      body: {
        orgId,
        deviceId,
        version: '0.1.0',
        ua: navigator.userAgent,
      },
    });

    if (fnErr || !data) {
      setStatus('error');
      setError(fnErr?.message ?? 'Token request failed');
      return;
    }

    setToken((data as { token: string }).token);
    setStatus('ready');
  }

  function redirectToExtension() {
    if (!token || !extensionId) return;
    window.location.href = `chrome-extension://${extensionId}/callback.html#token=${encodeURIComponent(token)}&org_id=${orgId}`;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Podłącz rozszerzenie Chrome</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Wygeneruj token uwierzytelniający dla rozszerzenia. Token żyje 30 dni i może zostać
        odwołany w ustawieniach.
      </p>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <p className="text-sm font-medium">Organizacja</p>
          <p className="text-sm text-muted-foreground">{orgId || 'Ładuję…'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Device ID</p>
          <p className="break-all font-mono text-xs text-muted-foreground">
            {deviceId || 'Brak — otwórz tę stronę z popupa rozszerzenia.'}
          </p>
        </div>

        {!token ? (
          <button
            onClick={issueToken}
            disabled={!orgId || !deviceId || status === 'loading'}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Generuję…' : 'Wygeneruj token'}
          </button>
        ) : (
          <>
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-900">
              Token wygenerowany. Kliknij poniżej żeby przekazać go do rozszerzenia.
            </div>
            <button
              onClick={redirectToExtension}
              disabled={!extensionId}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Przekaż token do rozszerzenia
            </button>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Token (kliknij żeby zobaczyć)</summary>
              <code className="mt-2 block break-all rounded bg-muted p-2 font-mono">{token}</code>
            </details>
          </>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
