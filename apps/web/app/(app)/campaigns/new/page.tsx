'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface Post {
  id: string;
  title: string;
  type: string;
  body_md: string;
}

interface Group {
  id: string;
  name: string;
  tags: string[];
  members_count: number | null;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [postId, setPostId] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [minDelay, setMinDelay] = useState(90);
  const [maxDelay, setMaxDelay] = useState(240);
  const [tagFilter, setTagFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const supabase = createSupabaseBrowser();
      const { data: m } = await supabase
        .from('org_members')
        .select('org_id')
        .not('accepted_at', 'is', null)
        .limit(1)
        .maybeSingle();
      if (!m) return;
      setOrgId(m.org_id);

      const [{ data: ps }, { data: gs }] = await Promise.all([
        supabase.from('posts').select('id, title, type, body_md').eq('status', 'ready'),
        supabase.from('groups').select('id, name, tags, members_count').eq('is_active', true).order('name'),
      ]);
      setPosts(ps ?? []);
      setGroups(gs ?? []);
    })();
  }, []);

  const visibleGroups = tagFilter
    ? groups.filter((g) => (g.tags ?? []).some((t) => t.toLowerCase().includes(tagFilter.toLowerCase())))
    : groups;

  function toggleGroup(id: string) {
    const next = new Set(selectedGroups);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGroups(next);
  }

  function selectAllVisible() {
    setSelectedGroups(new Set([...selectedGroups, ...visibleGroups.map((g) => g.id)]));
  }

  async function save() {
    if (!orgId || !postId || selectedGroups.size === 0) return;
    setSaving(true);
    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    const post = posts.find((p) => p.id === postId);

    const { data: campaign, error: cErr } = await supabase
      .from('campaigns')
      .insert({
        org_id: orgId,
        name,
        post_id: postId,
        status: 'draft',
        min_delay_seconds: minDelay,
        max_delay_seconds: maxDelay,
        created_by: user?.id,
      })
      .select('id')
      .single();

    if (cErr || !campaign) {
      setError(cErr?.message ?? 'Failed');
      setSaving(false);
      return;
    }

    const targets = Array.from(selectedGroups).map((groupId) => ({
      org_id: orgId,
      campaign_id: campaign.id,
      group_id: groupId,
      status: 'pending',
      rendered_text: post?.body_md ?? '',
    }));

    const { error: tErr } = await supabase.from('campaign_targets').insert(targets);
    setSaving(false);

    if (tErr) {
      setError(tErr.message);
      return;
    }

    router.push(`/campaigns/${campaign.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Nowa kampania</h1>

      <div className="space-y-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nazwa kampanii</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="np. Rekrutacja magazyn Pruszków - maj 2026"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Wybierz post z biblioteki</span>
          <select
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">— wybierz post —</option>
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.type}] {p.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Min delay (s)</span>
            <input
              type="number"
              min={30}
              value={minDelay}
              onChange={(e) => setMinDelay(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Max delay (s)</span>
            <input
              type="number"
              min={30}
              value={maxDelay}
              onChange={(e) => setMaxDelay(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Wybierz grupy ({selectedGroups.size}/{groups.length})</span>
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-xs text-primary hover:underline"
            >
              Zaznacz wszystkie widoczne
            </button>
          </div>
          <input
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filtruj po tagu (np. warszawa)"
            className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="max-h-96 overflow-y-auto rounded-md border">
            {visibleGroups.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.has(g.id)}
                  onChange={() => toggleGroup(g.id)}
                />
                <span className="flex-1 text-sm">{g.name}</span>
                <span className="text-xs text-muted-foreground">
                  {g.members_count ? `${g.members_count.toLocaleString('pl-PL')} czł.` : ''}
                </span>
                {(g.tags ?? []).slice(0, 2).map((t) => (
                  <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-xs">{t}</span>
                ))}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving || !name || !postId || selectedGroups.size === 0}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Tworzę…' : `Utwórz kampanię (${selectedGroups.size} grup)`}
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
