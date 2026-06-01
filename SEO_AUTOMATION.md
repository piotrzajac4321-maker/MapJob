# MapJob — automatyczny SEO rebuild

Cel: gdy ktoś doda/edytuje/usunie ofertę w `job_offers` (Supabase), strona
`mapjob.pl/oferta/<slug>/` ma się pojawić/zaktualizować/zniknąć **w ~2 minuty**
bez ręcznego uruchamiania skryptu.

## Architektura

```
[użytkownik dodaje ofertę w apce]
            │
            ▼
   [Supabase: INSERT/UPDATE/DELETE w job_offers]
            │
            ▼ (Database Webhook)
   [POST → Vercel Deploy Hook URL]
            │
            ▼
   [Vercel: git checkout + buildCommand]
            │
            ▼
   python3 build_seo_landings.py
            │ (fetch z Supabase REST przez SUPABASE_URL + SUPABASE_ANON_KEY)
            ▼
   Generuje: 71+ stron `/oferta/<slug>/` + 8 landingów + sitemap.xml
            │
            ▼
   Vercel deploy → produkcja
```

Czas reakcji: ~2 min (Vercel build ~90s + propagacja ~30s).

## SETUP — 4 kroki w panelach

### 1. Vercel — utwórz Deploy Hook

1. Vercel Dashboard → wybierz projekt `mapjob` → **Settings** → **Git**
2. Sekcja **Deploy Hooks** → **Create Hook**
3. Hook Name: `supabase-seo-rebuild`
4. Branch: `main` (lub `master` — sprawdź którą masz)
5. **Create Hook** → skopiuj URL (postać: `https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy`)
6. ⚠️ Zachowaj ten URL — wkleisz go w kroku 3

### 2. Vercel — Environment Variables

Settings → **Environment Variables** → dodaj 2:

| Name | Value | Environment |
|---|---|---|
| `SUPABASE_URL` | `https://ahgzjneegvptudphibdm.supabase.co` | Production, Preview |
| `SUPABASE_ANON_KEY` | (klucz anon JWT z Supabase) | Production, Preview |

Klucz anon znajdziesz w: Supabase Dashboard → Project Settings → API → `Project API keys` → `anon public`.

### 3. Supabase — Database Webhook

1. Supabase Dashboard → **Database** → **Webhooks** → **Create a new hook**
2. Name: `seo-rebuild`
3. Table: `job_offers`
4. Events: ☑ Insert ☑ Update ☑ Delete
5. Type: `HTTP Request`
6. Method: `POST`
7. URL: **(wklej URL z kroku 1 — Vercel Deploy Hook)**
8. HTTP Headers: zostaw domyślne lub dodaj `Content-Type: application/json`
9. HTTP Parameters: bez zmian
10. **Confirm**

### 4. Vercel — buildCommand jest już ustawiony w `vercel.json`

```json
"buildCommand": "python3 build_seo_landings.py"
```

Generator sam wykryje że jest w CI (po env vars) i pobierze świeże dane z Supabase REST.

## Test końcowy

1. Dodaj testową ofertę w apce (lub przez Supabase Studio)
2. Po ~10s zobacz w Vercel **Deployments** → powinien startować nowy build z opisem „Triggered via Deploy Hook"
3. Po ~90s deploy gotowy → odwiedź `mapjob.pl/oferta/<slug>-<short_id>/`
4. Strona powinna istnieć z pełnym JobPosting JSON-LD

## Pułapki i monitoring

### Burst protection
Jeśli ktoś zapisze 50 ofert pod rząd, każda triggeruje hook → 50 deployów.
Vercel kolejkuje (1 deploy naraz), ale free tier ma **100 builds/dzień**.
W praktyce: dodawanie ofert jest rzadkie (≤kilka dziennie), więc bez sensu robić debounce.
Jeśli kiedyś będzie problem → dodać `debounce: 5min` w edge function między
Supabase a Vercel.

### Co gdy buildCommand padnie
- Jeśli Supabase niedostępne podczas builda → buildCommand zakończy się błędem
  → Vercel **nie deployuje** → użytkownicy widzą poprzednią wersję
- To jest **bezpieczne zachowanie** (fail-safe, nie psuje produkcji)
- Sprawdź **Vercel → Deployments → Failed → Build Logs**

### Usunięte oferty
- Gdy oferta zostanie usunięta z DB (lub `status` zmieniony z `active`)
- Build pominie ją w generowaniu → katalog `/oferta/<slug>/` zniknie z deployu
- Vercel zwróci **404** dla starych URL-i
- Google po następnym crawlu (1-2 tyg.) usunie z indeksu
- **Lepsze: 301 redirect**. Można dodać do `vercel.json`:
  ```json
  "redirects": [
    { "source": "/oferta/:slug", "destination": "/praca-w-polsce/", "permanent": false, "missing": [{"type":"header","key":"x-vercel-route"}] }
  ]
  ```
  ale to wymaga match na nieistniejące pliki — łatwiej zostawić 404 i poczekać na deindex.

### Świeży snapshot lokalnie
Snapshot `oferty-snapshot.json` w repo jest zamrożony z momentu commita.
Do pracy lokalnej (testów buildu):

```bash
# pobierz świeży snapshot z prod
SUPABASE_URL=... SUPABASE_ANON_KEY=... python _extract_db_snapshot.py
# albo:
SEO_FETCH_REMOTE=1 SUPABASE_URL=... SUPABASE_ANON_KEY=... python build_seo_landings.py
```

### Monitoring jakości SEO
Po deployu pierwszego razu:
1. **Google Search Console** → Sitemaps → dodaj `https://mapjob.pl/sitemap.xml`
2. **Indexing** → wybrane URL-e → „Request indexing" dla top 5 landingów
3. **Performance** → po 2-4 tyg. zobacz które frazy łapią ranking
4. **Coverage** → upewnij się że nie ma „crawled, not indexed" błędów

## Plik build_seo_landings.py — co robi

| Etap | Output |
|---|---|
| `load_offers()` | Lista ofert z DB (live) lub snapshot |
| `LANDINGS` loop | 8 stron `/praca-<...>/index.html` |
| ofert loop | 71+ stron `/oferta/<slug>-<short_id>/index.html` |
| `build_sitemap()` | `sitemap.xml` z lastmod z `updated_at` |

Wszystkie strony są statyczne. Każda ma unikalną treść (zero doorway pages).
JobPosting JSON-LD wg Google spec → rich snippets w SERP (widełki płac, logo, lokalizacja).
