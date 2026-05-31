# Meta Ads Manager — Konfiguracja kampanii krok po kroku

**Czas wykonania:** 60–90 minut (pierwsza konfiguracja)
**Wymagania wstępne:** Pixel zainstalowany ([04-pixel-kod.html](04-pixel-kod.html), [05-pixel-eventy.md](05-pixel-eventy.md)) + strona FB/IG firmy MapJob + karta płatnicza

---

## ✅ Krok 0 — Przygotowanie (zanim zaczniesz)

- [ ] **Strona Facebook MapJob** istnieje i jest zweryfikowana
- [ ] **Profil Instagram** połączony z FB (opcjonalnie, ale zalecane — IG Stories/Reels mają niższy CPM)
- [ ] **Pixel zainstalowany** i testowany (rozszerzenie **Meta Pixel Helper** pokazuje eventy)
- [ ] **Business Manager** utworzony: [business.facebook.com](https://business.facebook.com)
- [ ] **Karta płatnicza** dodana w Ustawieniach płatności
- [ ] **Domena mapjob.pl zweryfikowana** w Business Manager (Ustawienia → Brand Safety → Weryfikacja domen → dodaj meta tag do `<head>`)
- [ ] **4 eventy konwersji** pokazują się w Events Manager:
  - `PageView` (automatycznie)
  - `Lead` (klik na „Zarejestruj się")
  - `CompleteRegistration` (pomyślna rejestracja)
  - `InitiateCheckout` (otwarcie Stripe)
  - `Purchase` (pomyślna płatność)

---

## 🏗️ Krok 1 — Utwórz Campaign A (Fachowcy)

1. Ads Manager → **Create** (zielony przycisk lewy górny)
2. **Objective (cel):**
   - Na start: **Leads** (łatwiej zebrać konwersje, Pixel się uczy)
   - Po 2 tyg. i 50+ konwersjach: przełącz na **Sales**
3. **Campaign name:** `MapJob-A-Fachowcy-2026-04`
4. **Advantage Campaign Budget:** **WYŁĄCZ** (budżet ustawisz na poziomie Ad Set — potrzebna kontrola)
5. **A/B test:** pomiń na starcie
6. Klik **Next**

---

## 🎯 Krok 2 — 6 Ad Setów geograficznych

**Struktura:** każdy ad set = inna geografia, ta sama reklama (A1 „Klik Google") na start. Pozwala zobaczyć gdzie CPL jest najniższy.

### Ad Set 1 — AS-PL (cała Polska)

**Performance Goal:**
- Optymalizacja: **Maximize number of conversions**
- Conversion event: `CompleteRegistration`
- Pixel: MapJob Pixel

**Budżet i harmonogram:**
- Budżet dzienny: **20 zł**
- Start: następny dzień 6:00 (nie dzisiaj — potrzeba 24h na review)
- End date: bez końca (na start — potem ustawisz)

**Lokalizacja:**
- Polska (cała)
- Filtr: **People living in this location** (nie „Everyone")

**Demografia:**
- Wiek: **25–55**
- Płeć: wszystkie
- Język: **polski**

**Detailed Targeting:** zaimportuj Saved Audience 1 — „Fachowcy PL" (zdefiniowane w [07-targetowanie.md](07-targetowanie.md))

**Detailed Targeting Expansion:** **WYŁĄCZ** (chcemy precyzji)

**Placements: Manual**
- Facebook Feed ✅
- Instagram Feed ✅
- Facebook Stories ✅
- Instagram Stories ✅
- Reels (FB + IG) ✅
- **WYŁĄCZ:** Audience Network, Messenger Ads, In-Stream videos (słaba jakość ruchu)

Klik **Next** → przejście do tworzenia reklamy

### Ad Set 2 — AS-WAW (Warszawa + 30 km)

Skopiuj AS-PL („Duplicate"), zmień tylko:
- **Nazwę:** `AS-WAW-Warszawa`
- **Budżet:** 6 zł/dzień
- **Lokalizację:** Warszawa, radius +30 km
- Reszta bez zmian

### Ad Set 3 — AS-KRK (Kraków)
- Nazwa: `AS-KRK-Krakow`
- Budżet: 6 zł/dzień
- Lokalizacja: Kraków + 30 km

### Ad Set 4 — AS-WRO (Wrocław)
- Nazwa: `AS-WRO-Wroclaw`
- Budżet: 6 zł/dzień
- Lokalizacja: Wrocław + 30 km

### Ad Set 5 — AS-POZ-GDA (Poznań + Gdańsk)
- Nazwa: `AS-POZGDA-Poznan-Gdansk`
- Budżet: 6 zł/dzień
- Lokalizacja: Poznań (+30 km) OR Gdańsk (+30 km) — Meta pozwala na wiele lokalizacji w jednym ad secie

### Ad Set 6 — AS-SL (Aglomeracja Śląska)
- Nazwa: `AS-SL-Slask`
- Budżet: 6 zł/dzień
- Lokalizacje: Katowice + Gliwice + Sosnowiec + Chorzów (+20 km każde)

**Razem:** 6 ad setów × 50 zł/dzień budżetu = 350 zł/tydzień

---

## 🎨 Krok 3 — Reklamy (Ads)

**Na start każdy ad set dostaje TĘ SAMĄ reklamę A1** („Klik Google. Pin na mapie. Klienci piszą."). Zbudujemy referencję: jeden ad = 6 miast → porównanie CPL.

Po 5 dniach, w zwycięskim ad secie (np. AS-SL) **dorzucamy wariant B headline** (drugi wariant tej samej reklamy).

W tygodniu 2 dokładamy reklamę A3 („AI Kreator CV") jako drugi eksperyment kreatywny.

### Ad A1 — konfiguracja w Ads Manager

Dla każdego z 6 ad setów:

- **Identity:** wybierz stronę Facebook MapJob + konto Instagram
- **Format:** Single Image (na start — najłatwiejsze)
- **Media:** upload obrazka wygenerowanego z [10-kreacje.html](10-kreacje.html) (mockup #1 — 1080×1080)
- **Primary Text:** skopiuj z [01-kampania-A-fachowcy.md](01-kampania-A-fachowcy.md), Reklama A1, sekcja „Primary Text"
- **Headline:** `Klik Google. Pin na mapie. Klienci piszą.`
- **Description:** `Polska mapa fachowców. Logowanie Googlem w 2 sekundy.`
- **CTA Button:** `Sign Up` (w Meta po polsku: „Zarejestruj się")
- **Website URL:**
  - Dla AS-PL: `https://mapjob.pl/?utm_source=fb&utm_medium=cpc&utm_campaign=A-fachowcy&utm_content=A1&utm_term=PL`
  - Dla AS-WAW: `...&utm_term=warszawa`
  - Dla AS-KRK: `...&utm_term=krakow`
  - Dla AS-WRO: `...&utm_term=wroclaw`
  - Dla AS-POZ-GDA: `...&utm_term=poznan-gdansk`
  - Dla AS-SL: `...&utm_term=slask`

**Dzięki różnym `utm_term`** w Google Analytics / admin panelu MapJob zobaczysz dokładnie z którego miasta przyszedł lead.

---

## 🏗️ Krok 4 — Druga kampania (Kampania B — Klienci)

**Uwaga:** Kampania B **startuje w tygodniu 2**, nie na starcie. Pierwszy tydzień = tylko Kampania A (fachowcy).

Powtórz Kroki 1–3 z różnicami:

**Campaign:**
- Nazwa: `MapJob-B-Klienci-2026-04`
- Cel: **Traffic** (Landing Page Views) — klient nie płaci, mierzymy ruch
- Po 2 tyg.: jeśli masz > 1000 visitors z B → przełącz na konwersje (`CompleteRegistration`)

**Ad Sety:** 2 na start (B1 + B2), każdy 7,5 zł/dzień = 15 zł/dzień razem

**Targeting:**
- Wiek 28–55, lokalizacja: Polska, duże miasta > 100k mieszkańców
- Zainteresowania: Saved Audience 5 — „Osoby prywatne remontujące" (z [07-targetowanie.md](07-targetowanie.md))
- Life events: „Recently moved" (ten filtr to złoto)

**Reklamy:** copy z [02-kampania-B-klienci.md](02-kampania-B-klienci.md)

**URL docelowy:** `https://mapjob.pl/?view=map&utm_source=fb&utm_medium=cpc&utm_campaign=B-klienci&utm_content=B1`

(Pamiętaj: klient leci na widok mapy, nie na rejestrację — zobaczy fachowców w okolicy, co buduje value proposition.)

---

## 🎬 Krok 5 — Catalog (BONUS — dla Dynamic Ads w tygodniu 6+)

Pomijamy na starcie. Wróć do tego po 4 tygodniach kampanii.

1. Commerce Manager → Utwórz Catalog → „Custom"
2. Dodaj produkty (plany MapJob):
   - Plan Pro — 79 zł
   - Premium — 199 zł
   - Portfolio Pro — 99 zł
   - Pakiet Wspierający — 200 zł
3. Połącz Pixel z Catalog (event `InitiateCheckout` musi zawierać `content_id` = plan)
4. Stwórz **Dynamic Product Ads** dla retargetingu — Meta automatycznie pokazuje plan, który user oglądał

---

## ⚙️ Krok 6 — Ustawienia końcowe (zanim klikniesz Publish)

### Aggregated Event Measurement (AEM)
Events Manager → Settings → AEM → ustaw priorytety:
1. **Purchase** (najwyższy)
2. InitiateCheckout
3. CompleteRegistration
4. Lead
5. PageView

**Uwaga o iOS 14+:** Apple ograniczyła tracking. Meta może mierzyć max 8 eventów na domenę. Dlatego priorytety są kluczowe. Dla MapJob — wystarczy 5 eventów, więc jesteśmy w normie.

---

### Automated Rules (automatyczne wyłączanie słabych)

Ads Manager → **Automated Rules** → **Create Rule**:

**Reguła 1 — Wyłącz słabe:**
- If `Cost per Result > 25 zł` AND `Impressions > 2000`
- Action: **Turn off Ad**
- Frequency: **daily**

**Reguła 2 — Skaluj dobre:**
- If `Cost per Result < 8 zł` AND `Results > 5`
- Action: **Increase daily budget by 30%**
- Frequency: **every 3 days**
- Max budget cap: **200 zł/dzień**

**Reguła 3 — Ostrzeż o wydatkach bez rezultatów:**
- If `Spend > 100 zł` AND `Results = 0`
- Action: **Notify me** (nie wyłączaj, ale daj znać)
- Frequency: **daily**

---

## 🚀 Krok 7 — Publish & Review

1. Klik **„Publish"** (prawy dolny róg)
2. Meta robi review — 1–24h (zwykle 2h)
3. Status: `In Review` → `Active`

**Jeśli reklama zostanie odrzucona:**
- Najczęściej za: zdrowie, polityka, clickbait, misleading claims
- MapJob nie powinien mieć problemów, ale jeśli tak:
  - Ads Manager → kliknij reklamę → zobacz powód odrzucenia
  - Edit → resubmit (review 24h)
  - Jeśli drugi raz odrzucone → dostosuj copy (usuń „gwarantowane", konkretne kwoty, absolutne twierdzenia)

---

## 📈 Krok 8 — Monitorowanie (pierwsze 7 dni)

### Dzień 1–2: NIC nie zmieniaj
Learning phase. Meta zbiera dane. Każda zmiana = reset nauki.

### Dzień 3:
- [ ] Sprawdź CPL każdego z 6 ad setów
- [ ] Wyłącz wszystkie z CPL > 30 zł (jeśli CPL jest 0 z powodu braku konwersji → daj 24h więcej)
- [ ] Zwiększ budżet tego z CPL < 10 zł o +30%

### Dzień 5:
- [ ] Sprawdź **frequency** (ile razy jedna osoba widzi reklamę) — powinna być < 3
- [ ] Jeśli > 5: audience się wyczerpuje, dodaj nowe zainteresowania lub rozszerz wiek
- [ ] Dorzuć wariant B headline do zwycięskiego ad setu

### Dzień 7:
- [ ] Oceń **ROAS** = przychód / wydatki (cel: > 1.0 w pierwszym tygodniu)
- [ ] Zidentyfikuj **winnera** — ad set z najlepszym CPL (najczęściej jedno konkretne miasto lub cała Polska)
- [ ] Skaluj budżet winnera o +50%, inne utrzymuj lub wyłącz
- [ ] **Dzień 7 = start Kampanii B** (klienci)

---

## 💡 Szybkie tipy od weterana reklamy

### 1. Nie rób 50 ad setów na start
5–7 to max dla budżetu 50–150 zł/dzień. Algorytm potrzebuje 30–50 konwersji **na ad set** żeby się nauczyć. Przy 50 ad setach z budżetem 1 zł/dzień — nie nauczy się nigdy.

### 2. Nie edytuj aktywnej reklamy
Zresetujesz learning phase (wrócisz do 0 konwersji). Zamiast tego: **zduplikuj**, zmień w kopii, wyłącz starą.

### 3. Piątek–niedziela = najdroższe dni
Najwięcej konkurencji (reklamy B2C mocno walczą o weekend). Niektórzy wyłączają reklamy w weekendy. **Dla MapJob zalecam: zostaw** — fachowcy często przeglądają wieczorem po pracy i w weekend.

### 4. Godziny
Domyślnie 24/7. Po 2 tygodniach sprawdź **Day Parting Report** — jeśli nocne godziny (00:00–06:00) mają wysoki CPL, wyłącz.

### 5. Nie wierz Advantage+ na starcie
Meta mówi że to „autopilot". Ale bez danych Pixel (min. 50 konwersji) to loteria. **Manual targeting** → zbierz 50 konwersji → dopiero wtedy przełącz.

### 6. Custom Audience z bazy Supabase (miesiąc 2+)
Eksportuj listę maili zarejestrowanych fachowców (tylko **realne** konta!) → upload do Meta → utwórz **Lookalike Audience 1%** → potężne źródło nowych fachowców.

**Ważne:** Export tylko **realnych** kont. Fake-user-manager w adminie tworzy pseudo-profile do wypełnienia mapy — nie włączaj ich do audience'a Meta (inaczej Lookalike szuka ludzi podobnych do faków = śmieci).

---

## 📞 Co zrobić jeśli utkniesz

| Problem | Rozwiązanie |
|---------|-------------|
| „Error: domain not verified" | Business Manager → Weryfikacja domeny → dodaj meta tag do `<head>` w `index.html` |
| „Pixel not found" | Sprawdź Meta Pixel Helper (Chrome extension) czy event się pali. Jeśli nie — Pixel ID wpisany źle. |
| Reklama „in review" > 24h | Zostaw, FB czasem wolno reviewuje. Po 48h — kontakt z supportem. |
| Reklama odrzucona „misleading" | Usuń „gwarantowane", „100%", konkretne kwoty w H1. |
| Zero wyświetleń przez 24h | Zbyt wąski targeting ALBO budżet poniżej ~5 zł/dzień (Meta minimum). |
| CPL rośnie z dnia na dzień | Frequency > 5 → audience się wypala. Rozszerz o 20% nowych zainteresowań. |
| Brak eventów w Events Manager | Pixel wgrany, ale consent mode blokuje. Sprawdź czy user zaakceptował cookies. |

---

## 🎓 Tydzień 2 — Retargeting + Lookalike

Po tygodniu, jak Pixel zbierze ~1000 odwiedzających:

1. **Utwórz Custom Audience** — „Wszyscy odwiedzający w ostatnich 30 dniach"
2. **Utwórz Lookalike 1%** z tej audience → podstawa dla skalowania w tygodniu 4
3. **Utwórz Custom Audience** — „Otwierali pricing, nie kupili" (30 dni) → do R2 (retargeting)
4. Szczegóły retargetingu: [09-retargeting.md](09-retargeting.md)

---

## 📊 Dashboard do śledzenia — wklej do Google Sheets

| Metryka | Cel T1 | Cel T4 |
|---------|--------|--------|
| **Impressions/tydz.** | > 30 000 | > 100 000 |
| **CTR** | > 1.0% | > 1.5% |
| **CPC** | < 2 zł | < 1.2 zł |
| **CPM** | < 15 zł (PL) | < 10 zł |
| **CPL (Registration)** | < 15 zł | < 8 zł |
| **CAC (Purchase)** | < 150 zł | < 80 zł |
| **ROAS** | > 0.5 | > 2.0 |
| **Frequency** | < 3.0 | < 3.5 |
| **Quality Ranking** | Average | Above Average |

Sprawdzaj **codziennie** przez pierwszy miesiąc. Potem 2×/tydz.
