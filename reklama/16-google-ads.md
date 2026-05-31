# Google Ads — Search + Display + YouTube

**Cel:** uzupełnienie kampanii Meta o Google. Meta łapie „scrollujących" (pasywni), Google łapie „szukających" (aktywny intent).

**Różnica kluczowa:**
- **Meta Ads** → użytkownik scroll'uje feed → widzi reklamę → klika z impulsu (CPL 8–15 zł)
- **Google Search Ads** → użytkownik wpisuje „elektryk Warszawa" → klika reklamę → **intent 10× wyższy** (CPL 3–8 zł, ale CPC wyższy)

**Budżet rekomendowany:** start 30 zł/dzień (210 zł/tydz.) — równolegle z Meta.

---

## 🎯 Strategia — 3 typy kampanii Google Ads

| Kampania | Cel | Budżet/dzień | Priorytet |
|----------|-----|--------------|-----------|
| **G1 — Search Ads** (Search Network) | Leady z aktywnego szukania | 20 zł | ⭐⭐⭐ |
| **G2 — YouTube Ads** | Branding + retargeting wideo | 10 zł | ⭐⭐ |
| **G3 — Display Network** | Retargeting visual | 0 zł (start), 5 zł później | ⭐ |
| **G4 — Performance Max** | Auto-optimization (tydzień 4+) | 20 zł | ⭐⭐ |

---

## 🔍 KAMPANIA G1 — Search Ads

### Struktura konta

```
Konto MapJob Google Ads
└── Kampania: MapJob-Search-Fachowcy
    ├── Ad Group: Elektryk (miasta)
    │   ├── Keywords: elektryk warszawa, elektryk kraków, ...
    │   └── 3 Responsive Search Ads
    ├── Ad Group: Hydraulik (miasta)
    ├── Ad Group: Spawacz (miasta)
    ├── Ad Group: Stolarz (miasta)
    └── Ad Group: Mechanik mobilny
└── Kampania: MapJob-Search-Klienci
    ├── Ad Group: "jak znaleźć fachowca"
    ├── Ad Group: "opinie o fachowcach"
    └── Ad Group: "mapa fachowców"
```

---

### Słowa kluczowe — FACHOWCY (kampania dla fachowców)

#### Intent: „chcę znaleźć klientów"

**Ad Group 1 — „Reklamy dla fachowców":**
- reklama dla elektryka
- jak zdobyć klientów elektryk
- skąd brać zlecenia hydraulik
- jak reklamować usługi budowlane
- jak promować firmę remontową

**Ad Group 2 — „Platformy dla fachowców":**
- platforma dla fachowców
- mapa fachowców
- portal dla fachowców
- apka dla fachowców
- gdzie szukać zleceń budowlanych
- alternatywa oferia
- alternatywa fixly
- zlecenia dla elektryka online

**Ad Group 3 — „Giełda zleceń":**
- giełda zleceń budowlanych
- zlecenia budowlane online
- szukam zleceń
- wolne zlecenia remontowe

**Match types:**
- **Broad match modifier** na start (`"elektryk reklama"`) — szeroki zasięg
- Po 2 tygodniach analizuj „Search Terms Report" i dodawaj **exact match** dla najlepszych (`[mapa fachowców]`)
- **Negative keywords** (wykluczenia): `darmowy`, `praca`, `etat`, `umowa o pracę`, `szkolenie`, `kurs`

---

### Słowa kluczowe — KLIENCI (kampania dla klientów)

**Ad Group 1 — „Jak znaleźć fachowca":**
- jak znaleźć dobrego elektryka
- jak sprawdzić hydraulika
- weryfikacja fachowca
- opinie o fachowcach
- polecany hydraulik warszawa
- dobry elektryk kraków

**Ad Group 2 — „Fachowiec w mieście" (dynamic):**
- elektryk {miasto}
- hydraulik {miasto}
- stolarz {miasto}
- spawacz {miasto}
- mechanik mobilny {miasto}

**Ad Group 3 — „Pilne / awarie":**
- pilna awaria hydrauliczna
- nie pali kocioł
- brak prądu mieszkanie
- całodobowy elektryk
- pogotowie hydrauliczne

**Ad Group 4 — „Remont":**
- remont łazienki wykonawca
- glazurnik warszawa opinie
- firma remontowa lokalna
- kto zrobi kuchnie
- fachowiec remont kraków

**Negative keywords:** `za darmo`, `bez opłat`, `sam sobie`, `DIY`, `youtube tutorial`

---

### Responsive Search Ad (RSA) — template

Google Ads ma limit: **15 headlines (max 30 znaków każdy) + 4 descriptions (max 90 znaków)**.

#### RSA dla Ad Group „Reklamy dla fachowców" (fachowcy):

**Headlines (15 opcji — Google rotuje):**
1. `Polska mapa fachowców`
2. `Pierwszy pin za darmo`
3. `Zaloguj Googlem w 2 sek.`
4. `Zero prowizji od zlecenia`
5. `Bez kredytów kontaktowych`
6. `Klient pisze wprost do Ciebie`
7. `Portfolio · oceny · chat`
8. `AI Kreator CV w 30 sek.`
9. `Polska apka od Polaków`
10. `Alternatywa dla OLX / Oferii`
11. `Działa offline (PWA)`
12. `Bez opłat wstępnych`
13. `Bez karty kredytowej`
14. `Pełna Giełda Zleceń`
15. `Plan Pro 79 zł/mies.`

**Descriptions (4 opcje):**
1. `Polska mapa fachowców. Logowanie Googlem w 2 sekundy. Pierwszy pin zawsze za darmo.`
2. `Zero prowizji, zero kredytów kontaktowych. Klient pisze wprost — bez pośredników.`
3. `Portfolio, oceny, chat bezpośredni, AI Kreator CV. Wszystko w jednej polskiej apce.`
4. `Alternatywa dla OLX, Oferii, Fixly. Nie kupujesz punktów ani pakietów. Piszesz i odbierasz.`

**Display URL path:** `/fachowcy`

**Final URL:** `https://mapjob.pl/?utm_source=google&utm_medium=cpc&utm_campaign=G1-fachowcy&utm_content={adgroupid}&utm_term={keyword}`

**Ad Extensions — DODAJ:**

**Sitelinks (4–6 linków):**
- „Pierwszy pin za darmo" → `/pricing`
- „AI Kreator CV" → `/cv-builder`
- „Mapa fachowców" → `/?view=map`
- „Plan Pro 79 zł" → `/pricing#pro`
- „Pakiet Wspierający 200 zł" → `/pricing#supporter`

**Callouts (4–10 jednej linii tekstu, max 25 znaków):**
- Pierwszy pin 0 zł
- Logowanie Googlem
- Zero prowizji
- Polska apka
- AI Kreator CV
- Działa offline
- Bez karty

**Structured Snippets:**
- Header: Usługi
- Values: Mapa fachowców, Giełda Zleceń, AI CV, Chat, Portfolio

**Call Extension:** telefon wsparcia MapJob (jeśli masz — np. „+48 XXX XXX XXX")

**Location Extension:** Warszawa (HQ, jeśli masz siedzibę) — zwiększa zaufanie w lokalnych SERP-ach

---

#### RSA dla Ad Group „Fachowiec w mieście" (klienci, dynamic):

**Headlines:**
1. `Fachowiec w {LOCATION}`
2. `Mapa fachowców {LOCATION}`
3. `Elektryk {LOCATION} — oceny`
4. `Hydraulik {LOCATION} — portfolio`
5. `Znajdź fachowca — 30 sekund`
6. `Dla klienta — 0 zł`
7. `Logowanie Googlem w 2 sek.`
8. `Portfolio przed kontaktem`
9. `Oceny od realnych klientów`
10. `Chat bezpośrednio z fachowcem`
11. `Bez obdzwaniania z OLX`
12. `Mapa · Portfolio · Chat`
13. `Zweryfikowane konta Google`
14. `Polska apka dla klientów`
15. `Otwórz mapę fachowców`

**Uwaga:** `{LOCATION}` to **dynamic keyword insertion** — Google automatycznie podmienia słowo kluczowe z wyszukiwania (np. „Warszawa", „Kraków"). **Maksymalnie 1 DKI na reklamę** (poza tym wygląda jak spam).

**Descriptions:**
1. `Mapa polskich fachowców. Portfolio, oceny, lokalizacja — zanim napiszesz. 0 zł dla klienta.`
2. `Logowanie Googlem w 2 sekundy. Chat bezpośredni, bez pośredników, bez prowizji.`
3. `Elektryk, hydraulik, stolarz, mechanik — wszyscy na jednej mapie. Polska apka.`
4. `Każdy fachowiec ma portfolio ze zdjęciami i oceny od klientów z kontem Google.`

---

### Budżet i bidding

**Strategia na start:** **Manual CPC z Enhanced CPC**
- Ustaw **max CPC bid:** 2 zł
- Google czasem podnosi bid o +15–30% jeśli szansa na konwersję wysoka

**Po 2 tygodniach:** jeśli masz 30+ konwersji (CompleteRegistration w GA4) → przełącz na **Maximize Conversions**

**Po 4 tygodniach:** jeśli masz 50+ konwersji → **Target CPA** z celem 50–80 zł

---

### Śledzenie konwersji

**WYMAGANE:** Google Analytics 4 + Google Ads connected.

1. **W GA4:** utworzenie eventu `sign_up` → oznacz jako konwersja
2. **W Google Ads:** import konwersji z GA4 (Tools → Conversions → Import from GA4)
3. **Alternatywa:** Google Tag Manager → własny tag `AW-XXXXX/yyyy` (conversion tracking pixel Google Ads)

**Kluczowe konwersje do śledzenia:**
- `sign_up` (rejestracja)
- `begin_checkout` (otwarcie Stripe)
- `purchase` (płatność) — **wartość** w PLN

---

## 📺 KAMPANIA G2 — YouTube Ads

### 3 formaty do przetestowania

| Format | Długość | Charakterystyka | Budżet start |
|--------|---------|-----------------|--------------|
| **Bumper Ads** | 6s | Nie-skip, krótki hook | 3 zł/dzień |
| **In-Stream (Skippable)** | 15–60s | Użytkownik może skip'nąć po 5s | 5 zł/dzień |
| **In-Feed** (dawniej Discovery) | dowolnie | Reklama w wynikach wyszukiwania YouTube | 2 zł/dzień |

**Razem:** 10 zł/dzień YouTube start.

---

### Bumper Ad 6s — scenariusz

**Cel:** brand awareness, FOMO lokalny
**Scenariusz:**
- 0:00–0:02: logo MapJob + tekst „Polska mapa fachowców"
- 0:02–0:04: zdjęcie/animacja mapy Polski z pinami
- 0:04–0:06: CTA „mapjob.pl — pierwszy pin za darmo"

**Bez voiceover** (6s to za mało).
**Z napisami dużymi** (80% ogląda bez dźwięku).

**Jak wygenerować:** użyj scenariusza #2 albo #5 z [14-scenariusze-filmowe.md](14-scenariusze-filmowe.md) skrócony do 6s.

---

### In-Stream Skippable 15s — scenariusz

**Cel:** konwersja (rejestracja)
**Krytyczne: HOOK W PIERWSZYCH 5 SEKUNDACH** — po 5s user może skip'nąć.

**Scenariusz (użyj Video #1 lub #5 z [14-scenariusze-filmowe.md](14-scenariusze-filmowe.md))**:
- 0:00–0:05: **HOOK** — „Przestań rozdawać ulotki. Wbij pin na mapie."
- 0:05–0:12: feature showcase (Google login, mapa, chat)
- 0:12–0:15: CTA „mapjob.pl"

**Bidding:** **Maximum CPV (Cost per View)** — Google kasuje tylko jeśli user obejrzał > 30s albo kliknął.
**Docelowy CPV:** 0,03–0,08 zł (w Polsce).

---

### In-Feed Discovery — reklama w wynikach

**Format:** thumbnail + tytuł (jak zwykły YouTube video)
**Target:** użytkownicy szukający „elektryk reklama", „jak znaleźć klientów budownictwo"

**Thumbnail:**
- Tytuł: „Jak fachowiec dostaje klientów bez ulotek"
- Thumbnail: zbliżenie na telefon z mapą + pin na Polsce

**CTA:** kliknięcie → przenosi do kanału YouTube MapJob (załóż, nagraj 5–10 video edukacyjnych dla fachowców — SEO boost)

---

### Targetowanie YouTube

**Demographic:**
- Wiek 25–55
- Polska
- Język: polski

**Interests / Topics:**
- Home & Garden
- Construction
- DIY
- Small Business
- Polish music / Polish vlogs (polski kontekst)

**Placements (ręczne):**
- Kanały YouTube, które targetują: „Papilot Budowa Domu", „BudowanieBloger", „Sebastian Skowronek" (polscy budowlańcy), „Fachowiec z Sensem", „StarWars Elektryka"
- Kanały motoryzacyjne (dla reklam B12 mechanik mobilny): „Warsztat Marcina", „Mechanik Warszawski"

**Negative placements:**
- Kanały dla dzieci
- Gaming (wysokie CPM, niski intent)
- Muzyka (auto-play, user skip'uje)

---

## 📊 KAMPANIA G3 — Display Network (retargeting)

**Start:** tydzień 3, gdy masz 500+ visitors w GA4.

**Struktura:**
- Audience: „Visitors last 30 days — not converted"
- Format: **Responsive Display Ads** (Google generuje warianty z Twoich zasobów)
- Placements: auto (Google AI) + manual (Allegro, gazeta.pl, interia.pl, wp.pl — duże polskie portale)

**Assets (wrzuć do Google Ads):**
- 5 obrazów 1200×628 (wygenerowane z [13-prompty-ai-zdjec.md](13-prompty-ai-zdjec.md))
- 5 obrazów kwadratowych 1200×1200
- 1 logo MapJob (ikona)
- 5 headlines (z listy wyżej)
- 4 descriptions

**Bid strategy:** **Maximize Conversions**
**CPC:** typowo 0,30–0,80 zł (niski, bo Display tanie)
**Frequency cap:** max 3 wyświetlenia na osobę w 7 dni

---

## 🤖 KAMPANIA G4 — Performance Max (AI auto-optimization)

**Kiedy włączyć:** tydzień 4+, gdy masz **100+ konwersji w ostatnich 30 dniach**.

**Co to jest:** jedna kampania, AI Google zarządza wszystkim (Search + Display + YouTube + Gmail + Maps + Discover). Ty podajesz **assets**, Google miesza kombinacje i optymalizuje pod konwersje.

**Kiedy NIE włączać:** na starcie kampanii (AI potrzebuje danych). Dokładnie tak jak w Meta Advantage+.

**Struktura:**
- **Asset Groups** — per persona (Fachowcy / Klienci / B2B)
- Każda grupa dostaje:
  - 20 headlines (krótkie, 30 znaków)
  - 5 long headlines (90 znaków)
  - 5 descriptions (90 znaków)
  - 15 obrazów (różne formaty: 1:1, 4:5, 16:9)
  - Logo MapJob
  - 2–5 filmów (z [14-scenariusze-filmowe.md](14-scenariusze-filmowe.md))
  - Sygnały targetingu: audience custom (visitors), lista emaili (jeśli masz)

**Budżet:** start 20 zł/dzień. Skaluj po tygodniu.

**Oczekiwany efekt:** 20–40% lepszy CPA niż manualne kampanie Search/Display oddzielnie — ALE wymaga danych.

---

## 💡 Pro-tipy Google Ads (od weterana)

### 1. Quality Score — walcz o 7+

Google ma metrykę „Quality Score" per keyword (1–10). Im wyżej, tym niższy CPC.

**Co wpływa:**
- **Expected CTR** — Twoja reklama vs konkurencja (miernik Google)
- **Ad Relevance** — czy słowo kluczowe pasuje do reklamy
- **Landing Page Experience** — szybkość, mobile-friendly, zawartość pasuje do reklamy

**Jak poprawić:**
- Każdy Ad Group ma **maksymalnie 10–15 keywords** — nie mieszaj „elektryk warszawa" z „hydraulik kraków" w jednym ad group
- Każdy Ad Group ma **dedykowaną landing page** — zobacz [21-landing-pages.md](21-landing-pages.md)
- Headlines zawierają słowa kluczowe z keyword list

### 2. Negative keywords (często ignorowane)

**Dodawaj co tydzień** negatywne słowa z „Search Terms Report":
- Ludzie szukający „kurs elektryka" nie są Twoim targetem
- „Elektryk zarobki" — ktoś szuka statystyk zarobków, nie platformy
- „Elektryk youtube" — ktoś szuka tutorialu

**Lista startowa negatywów (wrzuć od razu):**
`darmowy`, `free`, `youtube`, `tutorial`, `kurs`, `szkolenie`, `egzamin`, `uprawnienia`, `zarobki`, `pensja`, `wynagrodzenie`, `praca etat`, `umowa o pracę`, `recepta`, `praca za granicą` (jeśli nie targetujesz expats)

### 3. Dayparting

Po 2 tygodniach → Reports → Day/Hour → sprawdź:
- **Godziny 0:00–6:00:** CPC wysoki, konwersja niska (ktoś kliknął pijany) → wyłącz
- **Godziny 9:00–17:00:** fachowcy w pracy, mniej kliknięć → utrzymaj niższy bid (-20%)
- **Godziny 19:00–23:00:** fachowcy w domu przeglądają telefon → peak, bid +20%

### 4. A/B test RSA headlines

Każdej reklamie RSA **zawsze** daj 15 headlines. Google testuje kombinacje, po 30 dniach raportuje które kombinacje są „Best" vs „Low".

**Usuwaj „Low" headlines, dodawaj nowe** — iteracja.

### 5. Nie odłączaj Search Partners na start

Google Ads ma „Search Partners" (non-Google search engines — AOL, CBS, etc.) — na start zostaw, da Ci większy zasięg. Wyłączysz w miesiącu 2, jeśli CPL z Partners > 2× normal.

---

## 📊 Oczekiwane metryki (pierwszy miesiąc Google Ads)

| Metryka | Cel T1 | Cel T4 |
|---------|--------|--------|
| **Impressions (Search)** | > 10 000 | > 50 000 |
| **CTR (Search)** | > 4% | > 6% |
| **CPC** | < 2,5 zł | < 1,5 zł |
| **CPL (rejestracja)** | < 12 zł | < 6 zł |
| **Quality Score (avg)** | > 6 | > 8 |
| **CPM (YouTube)** | < 10 zł | < 6 zł |
| **CPV (YouTube In-Stream)** | < 0,08 zł | < 0,05 zł |

**Uwaga:** Google Ads zwykle daje **niższy CPL niż Meta** (bo intent wyższy), ale **niższy zasięg** (tylko ci, którzy aktywnie szukają). Najlepsza strategia: **oba kanały równolegle**.

---

## 🎯 Łączny budżet Meta + Google — plan 60 dni

| Tydzień | Meta (zł/d) | Google (zł/d) | Razem |
|---------|-------------|---------------|-------|
| T1 | 50 | 0 (czekaj aż Meta zbierze dane) | 50 |
| T2 | 70 | 30 (start G1 Search) | 100 |
| T3 | 100 | 40 (+ G2 YouTube) | 140 |
| T4 | 150 | 60 (+ G3 Display retargeting) | 210 |
| T5–T8 | 200–400 | 80–150 (+ G4 Performance Max) | 280–550 |

**Proporcje docelowe:** Meta 65% / Google 35%.

---

## ✅ Checklist Google Ads — setup week 1

- [ ] Utworzone konto Google Ads (ads.google.com)
- [ ] Zweryfikowana karta płatnicza
- [ ] Google Analytics 4 połączony
- [ ] Konwersje zaimportowane z GA4 (sign_up, purchase)
- [ ] Kampania G1 Search Ads utworzona
  - [ ] Ad Group „Fachowcy-reklama" (10 keywords, 2 RSA)
  - [ ] Ad Group „Platformy dla fachowców" (10 keywords, 2 RSA)
  - [ ] Ad Extensions: Sitelinks, Callouts, Structured Snippets
- [ ] Kampania G2 YouTube Ads (1 Bumper + 1 In-Stream)
- [ ] Negative keywords listy dodane
- [ ] Budżet dzienny: 30 zł total
- [ ] Bid strategy: Manual CPC (zmień na Max Conversions po 30 konw.)

---

## 🧠 Google vs Meta — kiedy co użyć

| Sytuacja | Meta lepiej | Google lepiej |
|----------|-------------|---------------|
| Brand awareness | ✅ | — |
| Niski budżet na start (< 50 zł/d) | ✅ | — |
| Wysoki intent (user aktywnie szuka) | — | ✅ |
| Retargeting (visitor już widział produkt) | ✅ (prostsze) | ✅ (lepszy do przetargu) |
| Lokalne targetowanie (miasto) | ✅ | ✅ (lepszy z „location extension") |
| B2B (firmy, deweloperzy) | — | ✅ (LinkedIn + Google) |
| Kreatywna persona (young tech-savvy) | ✅ (Reels/TikTok) | — |
| Produkty impulse-buy | ✅ | — |
| Poszukiwania zaplanowane (remont) | — | ✅ |

**Zasada:** Meta uczy się **czego user chce**. Google odpowiada na **pytanie user'a**. Używaj obu.
