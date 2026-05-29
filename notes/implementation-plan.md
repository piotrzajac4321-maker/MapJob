# Plan Wdrożenia — MapJob.pl

**Utworzony:** [2026-05-29 | sesja startowa]
**Status:** Wersja robocza — wymaga odpowiedzi na pytania (patrz `questions.md`)

---

## Legenda

- `[ ]` — do zrobienia
- `[~]` — w trakcie
- `[x]` — ukończone
- `[!]` — wymaga decyzji właściciela projektu

---

## FAZA 0 — Fundamenty i planowanie [bieżąca]

### 0.1 Dokumentacja i notatki [2026-05-29]
- [x] Zapoznanie z projektem (struktura, stack, kontekst marki)
- [x] Stworzenie systemu notatek (`notes/`)
- [x] Przygotowanie overview projektu
- [x] Przygotowanie planu wdrożenia (ten dokument)
- [ ] Odpowiedzi na pytania otwarte (`questions.md`)

### 0.2 Decyzje technologiczne [!]
- [!] Czy aplikacja webowa jest już gdzieś budowana? (inny repo? inna chmura?)
- [!] Jaki jest preferowany frontend stack? (Next.js? React? Vue?)
- [!] Czy Supabase ma być głównym backendem?
- [!] Jakie mapy? (Google Maps, Mapbox, OpenStreetMap/Leaflet?)
- [!] Jaki jest harmonogram / deadline MVP?

---

## FAZA 1 — Projektowanie UI/UX [!]

### 1.1 Makiety i design system
- [!] Stworzenie makiet w Figma (dostępny Figma MCP — można generować automatycznie)
- [ ] Design system — kolory, typografia, komponenty
- [ ] Prototyp widoku mapy z ofertami
- [ ] Prototyp widoku listy ofert (fallback dla mobile)
- [ ] Prototyp panelu pracodawcy

### 1.2 Główne ekrany do zaprojektowania
- [ ] Strona główna / landing page
- [ ] Widok mapy z ofertami (główny UI)
- [ ] Karta oferty pracy (popup / panel boczny)
- [ ] Wyniki wyszukiwania
- [ ] Panel pracodawcy (dodawanie ofert, statystyki)
- [ ] Profil kandydata / CV
- [ ] Rejestracja / logowanie

**Notatka [2026-05-29]:** Figma MCP jest dostępny w środowisku — możemy generować designs bezpośrednio z kodu/opisu. Do omówienia z właścicielem czy mamy istniejące makiety.

---

## FAZA 2 — Backend i baza danych [!]

### 2.1 Baza danych (Supabase/PostgreSQL)
- [!] Projekt schematu bazy danych (do zatwierdzenia)
- [ ] Tabele: `users`, `companies`, `job_offers`, `locations`, `applications`
- [ ] PostGIS extension dla zapytań geograficznych
- [ ] Row Level Security (RLS) policies
- [ ] Indeksy dla wyszukiwania geograficznego

### 2.2 Proponowany schemat (draft)
```
job_offers:
  - id, title, description
  - company_id → companies
  - location (GEOGRAPHY/POINT) — PostGIS
  - address, city, district
  - salary_min, salary_max, currency
  - employment_type, work_mode (onsite/hybrid/remote)
  - created_at, expires_at, status

companies:
  - id, name, logo_url, website
  - description, size_category
  - verified (bool)

users:
  - id (auth.users), email
  - role (candidate/employer)
  - profile data

applications:
  - id, job_id, user_id
  - status, created_at
```

### 2.3 API / Edge Functions
- [ ] Endpoint: wyszukiwanie ofert w promieniu (lat, lng, radius)
- [ ] Endpoint: dodawanie / edycja oferty
- [ ] Endpoint: aplikowanie na ofertę
- [ ] Auth: logowanie, rejestracja, OAuth (Google?)
- [ ] Webhooks: powiadomienia email

**Notatka [2026-05-29]:** Supabase MCP dostępny — możemy tworzyć tabele i migracje bezpośrednio przez asystenta.

---

## FAZA 3 — Frontend / Aplikacja webowa [!]

### 3.1 Setup projektu
- [!] Wybór frameworka (rekomendacja: **Next.js 15** — SEO, SSR, App Router)
- [ ] Inicjalizacja projektu
- [ ] Konfiguracja Supabase client
- [ ] Routing i layout
- [ ] Komponenty bazowe (Button, Input, Card, Modal)

### 3.2 Mapa (core feature)
- [!] Wybór providera map (rekomendacja: **Mapbox GL JS** — najlepsza kontrola nad stylem)
- [ ] Integracja mapy
- [ ] Pinezki ofert pracy na mapie
- [ ] Clustering (grupowanie pinez przy oddaleniu)
- [ ] Filtr promienia (slider "pokaż w X minutach / km")
- [ ] Geolokalizacja użytkownika
- [ ] Obliczanie czasu dojazdu (Mapbox Isochrone API lub Google)

### 3.3 Wyszukiwarka
- [ ] Pole wyszukiwania (stanowisko, branża, słowa kluczowe)
- [ ] Filtry: typ zatrudnienia, tryb pracy, widełki płacowe
- [ ] Sortowanie: odległość, data, dopasowanie
- [ ] Autocomplete lokalizacji

### 3.4 Panel pracodawcy
- [ ] Dodawanie oferty (formularz + wybór lokalizacji na mapie)
- [ ] Zarządzanie ofertami (lista, edycja, archiwizacja)
- [ ] Statystyki (wyświetlenia, aplikacje)
- [ ] Heatmapy popytu/podaży [!]

### 3.5 SEO i performance
- [ ] Strony SEO dla miast i kategorii (/praca/warszawa/it)
- [ ] Sitemap XML
- [ ] Meta tags, Open Graph
- [ ] Core Web Vitals optymalizacja

---

## FAZA 4 — Marketing i treści [w toku]

### 4.1 Skill reklamowy (ukończony)
- [x] `ad-copywriter` skill — kompletny system tworzenia reklam
- [x] Frameworki copywriterskie (8 frameworków)
- [x] Przykłady reklam B2C i B2B
- [x] Guidelines platform (Meta + LinkedIn)
- [x] Prompty do AI image/video generation

### 4.2 Kampanie reklamowe [!]
- [!] Czy już mamy budżet reklamowy? (Meta Ads, LinkedIn Ads)
- [ ] Kampania TOFU (awareness) — B2C
- [ ] Kampania BOFU (performance) — B2C
- [ ] Kampania B2B — LinkedIn dla pracodawców
- [ ] Geo-kampanie (miasto-specific)
- [ ] A/B testing hooków i kreacji

### 4.3 Content marketing
- [ ] Blog / artykuły SEO (Praca w Warszawie, IT Jobs, ...)
- [ ] Raport "Geografia Rekrutacji 2026"
- [ ] Case studies pracodawców
- [ ] Founder content (LinkedIn)

---

## FAZA 5 — Uruchomienie i monitoring

### 5.1 Deployment
- [ ] Hosting frontendu (Vercel rekomendowany dla Next.js)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Domeny i SSL
- [ ] Environment variables / secrets

### 5.2 Analityka i monitoring
- [ ] Google Analytics 4 / Plausible Analytics
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
- [ ] Supabase dashboard (DB stats)

### 5.3 Testy i bezpieczeństwo
- [ ] Testy jednostkowe kluczowych komponentów
- [ ] Testy E2E (Playwright)
- [ ] Security review (OWASP)
- [ ] RODO compliance (polityka prywatności, cookies)

---

## Priorytety MVP (Minimum Viable Product)

Na podstawie analizy projektu proponowane MVP to:

1. **Mapa z ofertami** — możliwość przeglądania ofert na mapie
2. **Filtr promienia** — slider "w X km od mojej lokalizacji"
3. **Karta oferty** — popup z detalami po kliknięciu pina
4. **Dodawanie oferty** (dla pracodawcy) — prosty formularz z geolokalizacją
5. **Rejestracja/logowanie** — Supabase Auth

Wszystko inne to "nice to have" na v1.

---

## Harmonogram (do ustalenia)

| Faza | Szacowany czas | Status |
|------|---------------|--------|
| Faza 0 — Fundamenty | 1 tydzień | [~] w toku |
| Faza 1 — UI/UX design | 2-3 tygodnie | [!] czeka na decyzje |
| Faza 2 — Backend | 2-3 tygodnie | [!] czeka na decyzje |
| Faza 3 — Frontend | 4-6 tygodni | [!] czeka na decyzje |
| Faza 4 — Marketing | równolegle | [~] skill gotowy |
| Faza 5 — Launch | 1 tydzień | [ ] |

**Łączny szacunek MVP: 8-12 tygodni** (przy regularnej pracy)

---

*Wróć do tego dokumentu przed każdą sesją pracy — sprawdź status i zacznij od najwyższego priorytetu nieukończonej sekcji.*
