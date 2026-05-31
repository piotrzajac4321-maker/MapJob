# Targetowanie — Geo-split (miasta + cała Polska) + zainteresowania

**Założenie startowe:** budżet 50 zł/dzień (350 zł/tydz.) podzielony między **6 ad setów geograficznych**. Każdy ad set testuje tą samą reklamę w innej lokalizacji, żeby zobaczyć gdzie CPL jest najniższy.

**Zasada:** jedna reklama = jedna persona = jeden ad set. Miasta testujemy na geografii, nie na różnych reklamach. Później skalujemy zwycięskie miasta.

---

## 🗺️ 6 ad setów geograficznych — layout startowy

| Ad Set | Target geograficzny | Budżet/dzień | Estymowana audience |
|--------|---------------------|--------------|---------------------|
| **AS-PL** | Cała Polska | 20 zł | ~4 mln |
| **AS-WAW** | Warszawa + 30 km | 6 zł | ~500k |
| **AS-KRK** | Kraków + 30 km | 6 zł | ~300k |
| **AS-WRO** | Wrocław + 30 km | 6 zł | ~250k |
| **AS-POZ-GDA** | Poznań + Gdańsk + 30 km | 6 zł | ~350k |
| **AS-SL** | Aglomeracja Śląska (Katowice + Gliwice + Sosnowiec + Chorzów) | 6 zł | ~450k |

**Razem:** 50 zł/dzień.

**Co testujemy:**
- Czy tańsi leadzi są z całej Polski (tanie CPM, ale mniej relevancy)
- Czy z konkretnych miast (droższe, ale wyższy CTR i CR)
- Które miasto najlepiej reaguje na copy (Warszawa często ma wyższy CPL bo konkurencja reklam, Śląsk bywa tańszy)

Po 7 dniach **wyłączamy najsłabsze 2 ad sety**, zwolnione 12 zł/dzień dorzucamy do **zwycięskich 2 ad setów** (po +6 zł każdy).

---

## 🎯 Saved Audience 1 — „Fachowcy PL" (wspólna dla wszystkich 6 ad setów)

Ta sama audience w każdym ad secie — różni się tylko geografia.

**Wiek:** 25–55
**Płeć:** wszystkie (fachowcy to ~95% mężczyźni, ale nie wykluczamy — algorytm sam zoptymalizuje)
**Lokalizacja:** (różna per ad set, patrz tabela wyżej) — filtr **„People living in this location"** (nie „Everyone", bo to by łapało turystów)
**Język:** polski

**Include (OR) — detailed targeting:**

#### Branża / zawód
- Budownictwo (Construction)
- Elektryk (Electrician)
- Hydraulik (Plumber)
- Spawanie (Welding)
- Stolarstwo (Carpentry)
- Montaż / Instalacja
- Remont / Renovation
- Mechanika samochodowa
- Ogrodnictwo / Gardening

#### Narzędzia / sklepy
- Castorama
- Leroy Merlin
- Obi
- Narzędzia budowlane (Construction tools)
- Bosch Professional / Makita / DeWalt

#### Platformy konkurencyjne (inferred intent)
- OLX.pl
- OLX Praca
- Allegro Lokalnie
- Praca.pl

#### Status zawodowy
- Samozatrudnienie / JDG
- Własna działalność gospodarcza
- Small business owner

**Estymowana audience w Polsce całej:** ~4 mln
**W Warszawie + 30 km:** ~500k
**W Krakowie + 30 km:** ~300k

**Detailed Targeting Expansion: WYŁĄCZ** (na starcie — chcemy precyzji; włączymy w tygodniu 2–3 gdy Pixel zbierze dane).

---

## 🎯 Saved Audience 2 — „Polacy-fachowcy za granicą" (tylko tydzień 3+)

**Uruchamiamy dopiero jeśli podstawowa kampania ma dobre wyniki** (tydzień 2–3). Powód: mniejsza audience, trudniej zdobyć pierwsze 50 konwersji do nauki algorytmu.

**Dla kogo:** Polacy pracujący w DE/NL/NO/IE/UK jako fachowcy (mają wyższe stawki, szukają zleceń w PL — chcą wrócić albo dorobić zdalnie)

**Lokalizacja:** Niemcy, Holandia, Norwegia, Irlandia, UK
**Expats:** Polska (TEN filtr to klucz — Meta zna kto jest polskim expatem)
**Język:** polski
**Wiek:** 28–50

**Interests:**
- Polacy w Niemczech / Polonia
- Polish construction workers
- Allegro / OLX
- Wszystkie z Saved Audience 1

**Estymowana wielkość:** 300–600k

**Kiedy startujemy:** tydzień 3 kampanii, jeśli tydzień 1–2 dał zwycięzcę.

---

## 🎯 Saved Audience 3 — „Lookalike z obecnych userów" (tylko po 100+ realnych kont)

**Wymaganie wstępne:** minimum **100 realnych kont użytkowników** w bazie Supabase. Jeśli MapJob ma teraz < 100 kont — pomiń, uruchomisz za 1–2 miesiące.

**Krok 1 — Eksport z Supabase** (uwaga: tylko realne konta, nie fake-user-manager):

```sql
SELECT email, phone 
FROM auth.users 
JOIN profiles ON profiles.id = auth.users.id
WHERE profiles.is_fake IS NOT TRUE
  AND profiles.created_at > NOW() - INTERVAL '180 days'
LIMIT 1000;
```

**Krok 2 — Upload do Meta:**
- Business Manager → Audiences → Custom Audience → Customer List
- Upload CSV (kolumny: email, phone)
- Meta hashuje i dopasowuje → wynik zwykle ~60–80% match rate

**Krok 3 — Lookalike:**
- Z tej Custom Audience → Create Lookalike
- Źródło: **1% PL** (najbardziej podobni, ~380k ludzi)
- Dodatkowo zrób 2% i 3% jako zapasowe (większe, mniej podobne)

**To jest najbardziej skuteczna audience jaka może istnieć** — ale TYLKO przy realnej bazie. Lookalike z 50 fake pinów to śmieci.

**Kiedy startujemy:** miesiąc 2–3 kampanii, jeśli zebrałeś 100+ realnych rejestracji.

---

## 🎯 KAMPANIA B — Klienci

### Saved Audience 4 — „Firmy budowlane PL"

**Dla ad setu B4 (B2B)**

**Wiek:** 30–60
**Lokalizacja:** Polska (duże miasta > 100k mieszkańców)
**Język:** polski

**Interests:**
- Firma budowlana (Construction company)
- Deweloper (Real estate developer)
- Nieruchomości komercyjne
- Project management (budownictwo)
- Kierownik budowy
- Inwestor (Real estate investor)

**Behaviors / Job titles:**
- Construction manager
- Site manager
- Project manager (construction)
- Business owner (construction)

**Estymowana wielkość:** 400–800k

---

### Saved Audience 5 — „Osoby prywatne remontujące"

**Dla ad setów B1, B2, B3**

**Wiek:** 28–55
**Lokalizacja:** Polska, miasta > 100k mieszkańców (filtr dochodowy pośrednio — ludzie w większych miastach częściej remontują z pomocą fachowca)
**Płeć:** wszystkie (pary decydują razem, ale kobiety częściej klikają reklamy remontu)

**Interests:**
- Remont domu / Home renovation
- Wnętrza / Home decor
- Nowoczesna kuchnia
- Łazienka (remont)
- Domodi / Morizon / Otodom (nieruchomości)
- IKEA / Home & garden
- Architektura wnętrz / Interior design

**Life events (ten filtr to ZŁOTO!):**
- **Recently moved (ostatnie 6 miesięcy)** ⭐⭐⭐ KRYTYCZNE — ludzie po przeprowadzce remontują
- Recently engaged / married (wspólne mieszkanie)
- Having a baby (remont pokoju dziecka)

**Estymowana wielkość:** 1–2 mln

---

## 🚫 Wykluczenia (Exclusions) — dodaj do KAŻDEGO ad setu

### Z KAMPANII A (fachowcy):

| Co wykluczamy | Dlaczego |
|---------------|----------|
| Custom Audience: `Registered_90d` | Nie płacimy za leadów, którzy już są w bazie |
| Custom Audience: `Purchased_180d` | Tym robimy upsell w osobnej kampanii R5, nie acquisition |
| Custom Audience: `Active_Subscribers` | Tym nie reklamujemy w ogóle (są już w środku) |

### Z KAMPANII B (klienci):

| Co wykluczamy | Dlaczego |
|---------------|----------|
| Custom Audience: `Visitors_All_7d` | Tych przesuwamy do retargetingu (R3/R4), nie paltimy dwa razy |
| Custom Audience: `Registered_90d` | Już są w bazie — nie szukamy ich przez B |

**Uwaga:** Custom Audiences poniżej muszą być **najpierw utworzone** (dopiero po zainstalowaniu Meta Pixel — zobacz [04-pixel-kod.html](04-pixel-kod.html) i [05-pixel-eventy.md](05-pixel-eventy.md)).

---

## 🔑 Custom Audiences — utwórz TERAZ (podstawa retargetingu)

Wejdź: **Business Manager → Audiences → Create → Custom Audience → Website**

| Nazwa | Reguła | Okno |
|-------|--------|------|
| `Visitors_All_30d` | Wszyscy odwiedzający `mapjob.pl` | 30 dni |
| `Visitors_All_7d` | Wszyscy odwiedzający | 7 dni |
| `Map_Viewers_30d` | URL zawiera `?view=map` | 30 dni |
| `Registered_90d` | Event `CompleteRegistration` | 90 dni |
| `InitiatedCheckout_14d` | Event `InitiateCheckout` | 14 dni |
| `Purchased_180d` | Event `Purchase` | 180 dni |
| `Abandoned_Checkout_7d` | `InitiatedCheckout` AND NOT `Purchase` | 7 dni |

Te audience zasilą **5 ścieżek retargetingu** opisanych w [09-retargeting.md](09-retargeting.md).

---

## 📊 Lookalike Audiences — plan na miesiąc 2+

Zbudujemy dopiero jak Pixel zbierze wystarczające dane + baza będzie miała min. 100 realnych kont.

| Źródło | Typ Lookalike | Rozmiar | Użycie |
|--------|---------------|---------|--------|
| `Registered_90d` (realne konta) | 1% PL | ~380k | Acquisition fachowców |
| `Purchased_180d` | 1% PL | ~380k | **Acquisition wysokiego LTV** (najlepsze źródło) |
| `Purchased_180d` | 2% PL | ~760k | Backup dla skalowania |
| `Visitors_All_30d` | 1% PL | ~380k | Top-of-funnel awareness |

**Pro tip:** Lookalike z `Purchased` jest 3–5× lepszy niż z `Visitors` — bo algorytm szuka ludzi podobnych do tych co PŁACĄ, nie tylko klikają.

---

## 🧪 Eksperyment do tygodnia 3 — broadness vs precision

Po 14 dniach podstawowej kampanii:

**Test:** podziel budżet 50/50 na:
1. **Precyzyjna audience** (zainteresowania + behaviors — to co powyżej)
2. **Broad audience** — tylko PL, 25–55, **bez zainteresowań** (Meta sama znajdzie)

Po 14 dniach zobacz która ma niższy CPL.

**Od 2023 Meta często wygrywa na broad dla kont z dobrym Pixel** (50+ konwersji/tydz.). Jeśli broad wygra → przestaw całość na broad, oszczędzisz na testowaniu audiences.

---

## ⚠️ Najczęstsze błędy w targetingu — nie popełnij ich

1. **„Layer" za dużo interests z AND** — Meta interpretuje AND jako „wszystkie naraz", audience spada do 50k. Zawsze używaj **OR** (default).

2. **Targeting za wąski na starcie** — daj Meta oddychać. Min. 100k osób per ad set (u nas w miastach 250k+).

3. **Zapomnienie wykluczenia płacących klientów** — marnujesz budżet na ludzi co już kupili.

4. **Jeden ad set = jedna konkretna persona.** Nie mieszaj „fachowcy + klienci" w jednym. Meta nie wie kogo optymalizować.

5. **Advantage+ na zimnym koncie** — wymaga 50+ konwersji, inaczej zmarnujesz budżet. Start: **manual targeting**.

6. **Geotargeting „Polska" ma 3 opcje** — „People living in this location" (zalecane), „Recently in", „Traveling in". Default = „Everyone", który łapie turystów. **Zmień na „People living in".**

7. **Nie ustawiasz Language = Polish** — łapiesz turystów, emigrantów mówiących tylko angielskim. Zawsze ustaw język.

---

## 🎯 Po tygodniu — co analizować (checklist)

Po pierwszych 7 dniach kampanii spójrz na każdy z 6 ad setów i zadaj 4 pytania:

1. **Ile wydałem?** (suma)
2. **Ile miałem rejestracji?** (event `CompleteRegistration` w Ads Manager)
3. **Jaki CPL?** = wydatki / rejestracje
4. **Jaki CTR?** (jeśli < 1% — słaba kreacja w tym mieście; jeśli > 2% — kreacja działa)

**Decyzje:**
- Top 2 ad sety z najniższym CPL → **skalowanie** (+30% budżetu co 3 dni)
- Dolne 2 z najwyższym CPL → **wyłączenie**
- Środek (AS 3, 4) → **obserwuj** jeszcze tydzień

**Nie bój się wyłączać.** 50% ad setów przegra pierwszy test. To normalne. Optymalizuj pod pieniądze, nie pod obawę zmarnowania.

---

## 💎 Pro-tip od weterana reklamy

**Największy błąd startujących kampanii:** ustawiają 1 duży ad set „cała Polska" z budżetem 100 zł/dzień i po 7 dniach widzą „nie działa".

**Dlaczego to błąd:** 1 ad set to 1 eksperyment. Jak nie wypali, nie wiesz dlaczego — audience? geografia? kreacja? godzina?

**Nasze podejście (6 ad setów geo):** 6 eksperymentów równolegle, ten sam copy. Jedyna zmienna to geografia. Jak po tygodniu widzisz że Śląsk daje CPL 8 zł a Warszawa 22 zł → wiesz co robić (więcej Śląska, mniej Warszawy).

To jest różnica między **szukaniem zwycięzcy** a **modlitwą o sukces**.
