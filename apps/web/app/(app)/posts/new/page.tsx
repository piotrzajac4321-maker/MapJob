'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { HumanScoreBadge } from '@/components/post-composer/human-score-badge';
import { HumanizeChecklist } from '@/components/post-composer/humanize-checklist';

export default function NewManualPostPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'job' | 'sales' | 'other'>('job');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  async function save() {
    if (!orgId) return;
    setSaving(true);
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        org_id: orgId,
        author_user_id: user?.id,
        type,
        title,
        body_md: body,
        status: 'ready',
      })
      .select('id')
      .single();

    setSaving(false);
    if (error || !data) {
      setError(error?.message ?? 'Save failed');
      return;
    }
    router.push(`/posts/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Nowy post (ręczny)</h1>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Tytuł (wewnętrzny)</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Typ</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="job">Ogłoszenie pracy</option>
              <option value="sales">Sprzedażowe</option>
              <option value="other">Inne</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Treść posta</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
          />
        </label>

        {body.length > 30 && (
          <>
            <div className="flex gap-3">
              <HumanScoreBadge score={Math.min(100, body.length / 8)} />
              <span className="text-xs text-muted-foreground">Score liczony po zapisie przez AI generator</span>
            </div>
            <HumanizeChecklist text={body} />
          </>
        )}

        <button
          onClick={save}
          disabled={saving || !title || body.length < 30}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Zapisuję…' : 'Zapisz post'}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
