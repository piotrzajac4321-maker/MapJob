'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { HumanScoreBadge } from '@/components/post-composer/human-score-badge';
import { HumanizeChecklist } from '@/components/post-composer/humanize-checklist';

type Tone = 'konkretny' | 'empatyczny' | 'profesjonalny' | 'konwersacyjny' | 'prowokacyjny';
type PostType = 'job' | 'sales' | 'other';
type Framework = 'AIDA' | 'PAS' | 'BAB' | 'FAB' | '4U' | 'PASTOR';
type Goal = 'leady' | 'rejestracje' | 'wiadomosci' | 'aplikacje' | 'sprzedaz' | 'swiadomosc';

interface GenerationResult {
  generationId: string;
  primaryText: string;
  variants: string[];
  humanScore: number;
  warnings: string[];
  promptTokens: number;
  outputTokens: number;
  costUsd: number;
  regenerated: number;
}

export default function AiGeneratorPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>('');
  const [postType, setPostType] = useState<PostType>('job');
  const [framework, setFramework] = useState<Framework>('PAS');
  const [goal, setGoal] = useState<Goal>('wiadomosci');
  const [audience, setAudience] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandOneLiner, setBrandOneLiner] = useState('');
  const [brandUsp, setBrandUsp] = useState('');
  const [tone, setTone] = useState<Tone>('konwersacyjny');
  const [offer, setOffer] = useState('');
  const [proof, setProof] = useState('');
  const [cta, setCta] = useState('');
  const [region, setRegion] = useState('');
  const [budget, setBudget] = useState('');
  const [contact, setContact] = useState('');
  const [variantCount, setVariantCount] = useState(3);
  const [model, setModel] = useState<'claude-sonnet-4-6' | 'claude-opus-4-7'>('claude-sonnet-4-6');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savingPost, setSavingPost] = useState(false);

  // Lazy-load active org
  if (!orgId) {
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
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const supabase = createSupabaseBrowser();
    const { data, error: fnErr } = await supabase.functions.invoke('ai-generate', {
      body: {
        orgId,
        model,
        brief: {
          goal,
          audience,
          postType,
          framework,
          brand: {
            name: brandName,
            oneLiner: brandOneLiner,
            usp: brandUsp.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 5),
            tone,
          },
          offer,
          proof: proof || undefined,
          cta,
          region: region || undefined,
          budget: budget || undefined,
          contact: contact || undefined,
          variantCount,
        },
      },
    });

    setLoading(false);

    if (fnErr || !data) {
      setError(fnErr?.message ?? 'Generation failed');
      return;
    }

    setResult(data as GenerationResult);
    setEditedText((data as GenerationResult).primaryText);
    setSelectedVariant(0);
  }

  function pickVariant(idx: number) {
    if (!result) return;
    setSelectedVariant(idx);
    setEditedText(idx === 0 ? result.primaryText : (result.variants[idx - 1] ?? ''));
  }

  async function savePost() {
    if (!result || !orgId) return;
    setSavingPost(true);
    const supabase = createSupabaseBrowser();

    const { data: { user } } = await supabase.auth.getUser();
    const allVariants = [result.primaryText, ...result.variants].filter((v, i) => i !== selectedVariant);

    const { data: inserted, error } = await supabase
      .from('posts')
      .insert({
        org_id: orgId,
        author_user_id: user?.id,
        type: postType,
        title: brandName ? `${brandName} — ${postType}` : `Post ${postType}`,
        body_md: editedText,
        framework,
        variants: allVariants,
        status: 'ready',
        ai_generation_id: result.generationId,
      })
      .select('id')
      .single();

    setSavingPost(false);

    if (error || !inserted) {
      setError(error?.message ?? 'Save failed');
      return;
    }

    router.push(`/posts/${inserted.id}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Generator AI</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Wpisz brief — Claude wygeneruje warianty zgodne z frameworkiem i filtrem anty-AI.
          System odrzuca i regeneruje teksty wyglądające jak AI.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Typ posta">
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                <option value="job">Ogłoszenie pracy</option>
                <option value="sales">Sprzedażowe</option>
                <option value="other">Inne</option>
              </select>
            </Field>
            <Field label="Framework">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as Framework)}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                <option value="PAS">PAS — Problem, Agitation, Solution</option>
                <option value="AIDA">AIDA — Attention, Interest, Desire, Action</option>
                <option value="BAB">BAB — Before, After, Bridge</option>
                <option value="FAB">FAB — Features, Advantages, Benefits</option>
                <option value="4U">4U — Useful, Urgent, Unique, Ultra-specific</option>
                <option value="PASTOR">PASTOR — long-form storytelling</option>
              </select>
            </Field>
          </div>

          <Field label="Cel kampanii">
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="wiadomosci">Wiadomości (DM)</option>
              <option value="aplikacje">Aplikacje na ofertę</option>
              <option value="leady">Leady (numer telefonu)</option>
              <option value="sprzedaz">Sprzedaż</option>
              <option value="rejestracje">Rejestracje</option>
              <option value="swiadomosc">Świadomość</option>
            </select>
          </Field>

          <Field label="Audience (do kogo piszesz)" hint="np. mężczyźni 25-45, kierowcy kat. C, z Pruszkowa i okolic">
            <textarea
              required
              rows={2}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>

          <fieldset className="rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">Marka / firma</legend>
            <div className="space-y-3">
              <Field label="Nazwa">
                <input
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="W jednym zdaniu — co robisz">
                <input
                  required
                  value={brandOneLiner}
                  onChange={(e) => setBrandOneLiner(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="USP (1-5 punktów, każdy w nowej linii)">
                <textarea
                  required
                  rows={3}
                  value={brandUsp}
                  onChange={(e) => setBrandUsp(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm font-mono"
                />
              </Field>
              <Field label="Ton">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                >
                  <option value="konwersacyjny">Konwersacyjny (jak post znajomego)</option>
                  <option value="konkretny">Konkretny (liczby, fakty)</option>
                  <option value="empatyczny">Empatyczny (rozumiem ból)</option>
                  <option value="profesjonalny">Profesjonalny (B2B)</option>
                  <option value="prowokacyjny">Prowokacyjny (kontrowersja)</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <Field label="Oferta / treść do zakomunikowania">
            <textarea
              required
              rows={4}
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>

          <Field label="Dowód / liczby / social proof (opcjonalne)">
            <input
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="np. 47 osób zatrudnionych w 2025, 4.9/5 opinie"
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>

          <Field label="CTA (jeden, konkretny)">
            <input
              required
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="np. Zostaw numer w komentarzu, oddzwaniam"
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Region">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="np. Warszawa, Bemowo"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </Field>
            <Field label="Stawka / cena">
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="np. 7 200 PLN netto"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </Field>
            <Field label="Kontakt">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="np. tel. 555-123-456"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Liczba wariantów">
              <input
                type="number"
                min={1}
                max={5}
                value={variantCount}
                onChange={(e) => setVariantCount(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </Field>
            <Field label="Model">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as typeof model)}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                <option value="claude-sonnet-4-6">Sonnet 4.6 (szybki, tani)</option>
                <option value="claude-opus-4-7">Opus 4.7 (najlepszy)</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading || !orgId}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Generuję…' : 'Wygeneruj posty'}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Wyniki</h2>

        {!result ? (
          <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Wypełnij brief po lewej i kliknij Generuj. Tutaj zobaczysz warianty.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-md border bg-card px-4 py-2 text-sm">
              <div className="flex items-center gap-3">
                <HumanScoreBadge score={result.humanScore} />
                <span className="text-muted-foreground">
                  Tokeny: {result.promptTokens}+{result.outputTokens} · Koszt: ${result.costUsd}
                </span>
              </div>
              {result.regenerated > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900">
                  Regenerowano {result.regenerated}×
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <VariantTab
                idx={0}
                label="Główny"
                selected={selectedVariant === 0}
                onClick={() => pickVariant(0)}
              />
              {result.variants.map((_, i) => (
                <VariantTab
                  key={i}
                  idx={i + 1}
                  label={`Wariant ${i + 2}`}
                  selected={selectedVariant === i + 1}
                  onClick={() => pickVariant(i + 1)}
                />
              ))}
            </div>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={14}
              className="w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
            />

            <HumanizeChecklist text={editedText} />

            {result.warnings.length > 0 && (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm">
                <p className="mb-1 font-medium text-yellow-900">Anti-AI filter — ostrzeżenia:</p>
                <ul className="list-inside list-disc text-yellow-900">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={savePost}
              disabled={savingPost}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingPost ? 'Zapisuję…' : 'Zapisz post w bibliotece'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function VariantTab({ label, selected, onClick }: { idx: number; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm ${selected ? 'bg-primary text-primary-foreground' : 'border border-input hover:bg-accent'}`}
    >
      {label}
    </button>
  );
}
