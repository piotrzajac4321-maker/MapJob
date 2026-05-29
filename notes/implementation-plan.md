# Plan Wdrożenia — MapJob.pl

**Utworzony:** [2026-05-29 | sesja startowa]
**Zaktualizowany:** [2026-05-29 | po analizie GitHuba — aplikacja już istnieje!]

> ⚠️ WAŻNA KOREKTA: Aplikacja jest w produkcji. Ten plan dotyczy DALSZEGO ROZWOJU, nie budowania od zera.

---

## Legenda

- `[ ]` — do zrobienia
- `[~]` — w trakcie
- `[x]` — ukończone
- `[!]` — wymaga decyzji właściciela projektu

---

## Stan obecny (2026-05-29)

### Co jest ukończone [x]
- [x] Aplikacja webowa (vanilla HTML/CSS/JS) na Vercelu
- [x] Supabase backend (20 migracji, 7 edge functions)
- [x] Interaktywna mapa z pinezkami (piny, oferty, zlecenia)
- [x] System kontaktu bez logowania
- [x] Panel statystyk admin (`/statystyki`, `/panel`)
- [x] Liczniki wyświetleń i kliknięć
- [x] Stripe — płatności
- [x] System referralowy
- [x] Push notyfikacje
- [x] Profile użytkowników + CV + portfolio
- [x] SEO landing pages (auto-generowane Pythonem)
- [x] Cookie consent (GDPR)
- [x] PWA (Service Worker)
- [x] Analityka: GA4 + Clarity + Meta Pixel
- [x] 10+ partnerów/firm zintegrowanych
- [x] Skill `ad-copywriter` (marketing/reklamy)

---

## OBSZAR 1 — Jakość i stabilność kodu

### 1.1 Refactoring i architektura
- [!] Ocenić czy vanilla HTML/JS ma sens długoterminowo vs migracja do frameworka
- [ ] Audit rozmiaru `index.html` (prawdopodobnie bardzo duży plik)
- [ ] Rozbicie kodu na moduły / osobne pliki JS
- [ ] Dokumentacja wewnętrzna kluczowych funkcji

### 1.2 Testy i błędy
- [ ] Przegląd logów błędów klienta (`client_errors` w Supabase)
- [ ] Testy regresji kluczowych flow (kontakt, aplikacja, pin)
- [ ] Monitoring błędów (czy jest Sentry lub podobne?)

**Notatka [2026-05-29]:** Brak info o testach automatycznych — prawdopodobnie ich nie ma. Priorytet ocenić.

---

## OBSZAR 2 — Monetyzacja [!]

### 2.1 Stripe — aktualny model
- [!] Jaki jest obecny model płatności? (jednorazowe? subskrypcja? credits?)
- [!] Czy promo "500" jest aktywne? Co oznacza liczba 500?
- [ ] Audit ścieżki zakupu (checkout → webhook → aktywacja)
- [ ] Testy webhooków Stripe w środowisku staging

### 2.2 Wyróżnienia (highlights)
- [x] System wyróżnień pinów istnieje w DB
- [!] Jak wygląda UX zakupu wyróżnienia?
- [ ] A/B test cen wyróżnień

### 2.3 Nowe możliwości monetyzacji
- [ ] Pakiety dla pracodawców (ilość ogłoszeń/miesiąc)
- [ ] Raporty heatmap dla pracodawców (premium)
- [ ] "Zweryfikowana firma" badge (płatne)

**Notatka [2026-05-29]:** Stripe już działa — trzeba zrozumieć aktualny model zanim się cokolwiek zmieni.

---

## OBSZAR 3 — Wzrost i marketing

### 3.1 SEO (w toku)
- [x] Auto-generowane landing pages (Vercel build)
- [x] Sitemap XML, Schema.org
- [ ] Więcej miast: Kraków, Wrocław, Gdańsk, Poznań, Łódź
- [ ] Strony branżowe: /praca-it, /praca-logistyka, /praca-handel
- [ ] Monitoring pozycji (Google Search Console)

### 3.2 Kampanie reklamowe
- [x] Skill `ad-copywriter` gotowy
- [!] Czy kampanie Meta/LinkedIn już działają?
- [!] Jaki jest miesięczny budżet reklamowy?
- [ ] Kampania TOFU (B2C — szukający pracy)
- [ ] Kampania B2B (LinkedIn — pracodawcy)
- [ ] Geo-kampanie dla kluczowych miast

### 3.3 Pozyskiwanie ofert
- [x] Partnerzy: InPost, Otto, Randstad, Żabka, Biedronka, Żetkama, Pramer, Jobwerke
- [!] Jak wygląda pipeline pozyskiwania nowych partnerów?
- [ ] Automatyczny import przez API (zamiast manualnych skryptów Python)
- [ ] Self-service dla pracodawców (dodaj ofertę sam)

**Notatka [2026-05-29]:** Skrypty build_*.py to manualne generatory — bottleneck przy skalowaniu.

---

## OBSZAR 4 — Produkt i UX

### 4.1 Mapa i wyszukiwanie
- [!] Jaki provider map? (Leaflet? Mapbox? Google?)
- [ ] Filtr promienia / czasu dojazdu (core feature — czy jest?)
- [ ] Clustering pinez (przy oddaleniu)
- [ ] Wyszukiwarka po słowach kluczowych + mapa

### 4.2 Oferty pracy
- [x] Widok oferty z kontaktem
- [ ] Strony SEO per oferta (`/oferty/[slug]`)
- [ ] "Podobne oferty w okolicy"
- [ ] Powiadomienia o nowych ofertach (push już działa!)

### 4.3 Panel pracodawcy
- [x] Statystyki dla admina
- [!] Czy pracodawcy mają własny panel? (self-service?)
- [ ] Dashboard pracodawcy: wyświetlenia, kliknięcia, aplikacje
- [ ] Edycja oferty online
- [ ] Heatmapa aplikacji na mapie

### 4.4 Profil kandydata
- [x] Profil + CV + portfolio
- [ ] Matching ofert do profilu
- [ ] "Aplikowałem" — historia aplikacji

### 4.5 Mobile
- [x] PWA (Service Worker)
- [!] Jak wygląda mobile UX mapy?
- [ ] App-like doświadczenie (install prompt)

---

## OBSZAR 5 — Analityka i dane

### 5.1 Panel statystyk (rozbudowa)
- [x] Aktywni, unikalni, sesje (admin)
- [x] Wyświetlenia ofert/pinów
- [x] Kliknięcia kontaktu i aplikacji
- [ ] Funnel konwersji: wyświetlenie → kontakt → zatrudnienie
- [ ] Śledzenie source/medium (skąd przyszedł user)
- [ ] Eksport danych do CSV/Excel

### 5.2 Raporty dla pracodawców
- [ ] Miesięczny raport: wyświetlenia, kontakty, aplikacje
- [ ] Porównanie z rynkiem (benchmark)
- [ ] "Ile kandydatów w Twojej okolicy" (heatmapa popytu)

---

## OBSZAR 6 — Techniczne długi

### 6.1 Edge Functions
- [x] cv-parse — parser CV
- [!] Jak działa cv-parse? (AI model? regex?)
- [ ] Audit bezpieczeństwa edge functions
- [ ] Rate limiting na wszystkich endpoints

### 6.2 Skalowalność
- [ ] Czy indeksy DB są zoptymalizowane dla wyszukiwania geograficznego?
- [ ] CDN dla assetów (logo firm, obrazki)
- [ ] Cache strategia dla danych ofert

---

## Priorytety na najbliższe sesje

Na podstawie analizy — co prawdopodobnie najlepiej odblokuje wzrost:

1. **Zrozumieć obecny model monetyzacji** (Stripe flow) — [Q-07]
2. **Audit SEO** — co generuje ruch organiczny teraz
3. **Uruchomić kampanie reklamowe** — skill gotowy, czeka na budżet
4. **Self-service dla pracodawców** — bottleneck przy manualnych skryptach Python
5. **Automatyczny import ofert** przez API zamiast plików JS

---

## Branching strategy

| Branch | Przeznaczenie |
|--------|--------------|
| `vercel-deploy` | Produkcja (deployowany na Vercel) |
| `claude/...` | Feature branches (Claude Code) |
| `seo-footer-in-menu` | SEO feature (niescalony) |

---

*Wróć do tego dokumentu przed każdą sesją — sprawdź priorytety i zacznij od najważniejszego nieukończonego punktu.*
