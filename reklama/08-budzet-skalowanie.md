# Budżet i reguły skalowania — plan startowy „lean"

**Filozofia:** nie wydajemy dużo, póki nie wiemy co działa. Najpierw uczymy się (tydzień 1–2), potem skalujemy tylko zwycięzców. Budżet za 350 zł/tydz. daje wystarczające dane żeby wybrać kierunek, bez palenia kasy na ślepą kampanię.

**Zasada:** nie skaluj, dopóki nie masz dowodu. 3 dni z dobrym CPL to za mało. 7 dni z dobrym CPL + rosnącym ROAS — to sygnał.

---

## 💰 Budżet — progresja 60 dni

| Tydzień | Budżet/dzień | Budżet/tydz. | Cel tygodnia |
|---------|--------------|--------------|--------------|
| **T1** (dzień 1–7) | **50 zł** | 350 zł | Test 6 ad setów geo, zebranie pierwszych danych |
| **T2** (dzień 8–14) | 70 zł | 490 zł | Wyłączamy słabe, skalujemy 2 najlepsze |
| **T3** (dzień 15–21) | 100 zł | 700 zł | Dorzucamy retargeting (gdy jest ~1000 visitors) |
| **T4** (dzień 22–28) | 150 zł | 1 050 zł | Test Lookalike (jeśli baza pozwala) |
| **T5** (dzień 29–35) | 200 zł | 1 400 zł | Rotate winners — nowe kreacje |
| **T6** (dzień 36–42) | 300 zł | 2 100 zł | CBO (Campaign Budget Optimization) |
| **T7** (dzień 43–49) | 400 zł | 2 800 zł | Dodajemy nowe kreacje + wideo #3, #4 |
| **T8** (dzień 50–60) | 500 zł | 3 500 zł | Stabilizacja, ROAS > 2.0 |

**Łączny budżet 60 dni:** ~12 400 zł

**Jeśli budżet jest ciaśniejszy** (np. 300 zł/miesiąc na start):
- Tydzień 1–4: 10 zł/dzień × 1 ad set („cała Polska") × 1 reklama → bardzo wolny uczący się test
- Po miesiącu: jeśli Pixel zebrał ≥ 30 rejestracji → skalujemy na 50 zł/dzień w tydzień 5

---

## 🎯 Alokacja budżetu w tygodniu 1 (50 zł/dzień)

| Kampania / ad set | Budżet | % |
|-------------------|--------|---|
| **AS-PL** (cała Polska, kampania A) | 20 zł | 40% |
| **AS-WAW** (Warszawa) | 6 zł | 12% |
| **AS-KRK** (Kraków) | 6 zł | 12% |
| **AS-WRO** (Wrocław) | 6 zł | 12% |
| **AS-POZ-GDA** (Poznań + Gdańsk) | 6 zł | 12% |
| **AS-SL** (Śląsk) | 6 zł | 12% |
| **Kampania B (klienci)** | 0 zł | 0% |

**Tydzień 1 = 100% na Kampanię A (fachowcy).** Klientów włączamy w tygodniu 2, jak Pixel już będzie miał dane.

---

## 🎯 Alokacja budżetu w tygodniu 2 (70 zł/dzień)

Po analizie tygodnia 1, powiedzmy że AS-WAW i AS-SL wygrały (najniższy CPL). Reszta ad setów geo gorsza. Nowa alokacja:

| Ad set | Budżet | Komentarz |
|--------|--------|-----------|
| AS-PL | 15 zł | Utrzymujemy, szeroka audience jako safety-net |
| **AS-WAW** (winner 1) | 20 zł | Skalowanie +14 zł/dzień |
| **AS-SL** (winner 2) | 20 zł | Skalowanie +14 zł/dzień |
| AS-KRK, AS-WRO, AS-POZ-GDA | wyłączone | Oszczędność 18 zł/dzień |
| **Kampania B** — AS-B1 + AS-B2 | 15 zł | Aktywujemy klientów (paliwo dla fachowców) |

**Razem:** 70 zł/dzień

---

## 🎯 Alokacja budżetu w tygodniu 3 (100 zł/dzień)

Pixel ma już ~200 rejestracji. Dorzucamy **retargeting**.

| Kampania / ad set | Budżet |
|-------------------|--------|
| Kampania A acquisition (AS-PL + AS-WAW + AS-SL) | 50 zł |
| **Kampania B klienci** | 20 zł |
| **Retargeting R1** (Abandoned Checkout) | 10 zł |
| **Retargeting R2** (Pricing viewers) | 10 zł |
| **Retargeting R3** (Visitors) | 10 zł |

---

## 📈 Reguły skalowania — znaj je na pamięć

### Reguła 1 — Skalowanie pionowe (+30% co 3 dni)

**Kiedy stosować:**
- Ad Set ma > 30 konwersji (rejestracji)
- CPL stabilny (wahania < 20% dzień do dnia)
- ROAS > 1.5

**Jak:**
1. Zwiększ budżet o **+30%** (nie więcej!)
2. Czekaj 3 dni — zobacz czy CPL się utrzymał
3. Jeśli TAK → kolejne +30%
4. Jeśli NIE (CPL skoczył o > 30%) → **wróć do poprzedniego budżetu**

**Dlaczego maksimum +30%?** Meta musi dostosować algorytm do nowego budżetu. Skok o 100% często resetuje learning phase (wrócisz do zera).

---

### Reguła 2 — Skalowanie poziome (kopiowanie winnerów)

**Kiedy:**
- Masz ad, który działa świetnie (CPL < 8 zł)
- Budżet pionowy już dorósł do 100 zł/dzień na tym ad secie

**Jak:**
1. **Zduplikuj** cały ad set
2. W kopii zmień **jedną rzecz**: np. audience (Lookalike zamiast Interests), albo nowe miasto, albo język (PL → expats DE)
3. Stary zostaw, nowy odpalaj z budżetem 30 zł/dzień

**Dlaczego:** jeden ad set ma soft cap ~200–300 zł/dzień zanim CPL zaczyna rosnąć (audience się wyczerpuje). Zamiast podnosić dalej, zrób 2 ad sety po 200 zł zamiast 1 za 400.

---

### Reguła 3 — Wyłączanie słabych (be ruthless)

**Kiedy wyłączyć ad bez żalu:**

| Warunek | Akcja |
|---------|-------|
| Spend > 3× cel CPL AND 0 konwersji | **Wyłącz natychmiast** |
| CPL > 2× cel przez 5+ dni | Wyłącz |
| CTR < 0.8% przez 7 dni | Wyłącz (słaba kreacja) |
| Frequency > 5 AND CTR spada | Wyłącz (audience się wypalił) |

**Nie bój się wyłączać.** 50–70% reklam Meta przegrywa w pierwszym tygodniu. Lepiej zabić 5 z 8, zostawić 3 zwycięzców i skalować ich.

---

## 🚨 Progi alarmowe — kiedy STOP i think

| Sygnał | Co zrobić |
|--------|-----------|
| **CPM > 25 zł** | Audience za mały lub konkurencja wysoka. Rozszerz wiek ±5 lat, dodaj województwo. |
| **CPC > 3 zł** | Słaba kreacja. Przetestuj inny headline (wariant B). |
| **CTR < 0.7%** | Hook nie działa. Zmień pierwsze 3 słowa reklamy. |
| **CR < 2%** (klik → rejestracja) | Problem na landing page, nie w reklamie. Sprawdź szybkość ładowania. |
| **Frequency > 4 w 7 dni** | Audience się wypalił. Dodaj 20% nowych zainteresowań. |
| **Quality Ranking = „Below Average"** | Kreacja odstrasza. Zmień obraz lub copy. |
| **Reklama odrzucona „misleading"** | Usuń zwroty „gwarantowane", „100%", konkretne kwoty |

---

## 📊 Jak liczyć opłacalność — prosty model

### LTV fachowca na MapJob (szacunek startowy)

- Plan Pro: 79 zł/mies
- Szacowany czas subskrypcji: 6 miesięcy (rzeczywisty czas zobaczysz dopiero po roku)
- **LTV = 79 × 6 = 474 zł**

### Maksymalny CAC (Cost per Acquisition)

- Marża operacyjna ~70% (niskie koszty marginalne)
- Przychód netto z klienta = 474 × 0.7 = **332 zł**
- **Maksymalny CAC = 332 / 3 = ~110 zł** (zasada LTV:CAC = 3:1)

### Realistyczny cel CAC

| Faza | Cel CAC | Komentarz |
|------|---------|-----------|
| **Tydzień 1–2 (test)** | 150 zł | Można być nad max, uczymy się |
| **Tydzień 3–4** | 100 zł | Muszą się zwracać |
| **Miesiąc 2+** | 60–80 zł | Dojrzała kampania z retargetingiem |
| **Miesiąc 3+** | 40–60 zł | Z Lookalike + winners scaled |

---

### Obliczanie CPL vs CAC

```
CAC = CPL / conversion_rate_do_płatności
```

**Przykład 1 (zdrowy):**
- CPL = 10 zł (rejestracja)
- 15% rejestrowanych kupuje Plan Pro
- → CAC = 10 / 0.15 = **67 zł** ✅ (poniżej max 110 zł)

**Przykład 2 (ostrzeżenie):**
- CPL = 18 zł (wyższy niż cel)
- 8% kupuje (niższa konwersja)
- → CAC = 18 / 0.08 = **225 zł** ❌ (ponad 2× max)

**Wniosek:** CPL to tylko pośredni wskaźnik. Prawdziwa miara to CAC po 30 dniach.

---

## 🔥 Zaawansowane techniki (od tygodnia 4+)

### CBO — Campaign Budget Optimization

**Kiedy włączyć:** masz 3+ ad sety z > 30 konwersji każdy.

- Zamiast budżetu na Ad Sets → budżet na całej Campaign
- Meta dynamicznie rozdziela między ad sety (daje więcej temu co działa)
- **Zalety:** mniej pracy, wyższa efektywność
- **Wady:** mniej kontroli nad poszczególnymi ad setami

---

### Advantage+ Shopping Campaign

**Wymagania:**
- 50+ konwersji `Purchase` w ostatnich 7 dniach
- Aktywny Catalog (plany MapJob jako produkty)
- Pixel z Advanced Matching

Potrafi dać 20–40% lepszy ROAS niż manualne kampanie. Ale wymaga dojrzałej bazy.

---

### Value Optimization

Zamiast optymalizować pod ilość konwersji — **pod wartość konwersji**.

- Przekazuj `value` w evencie `Purchase` (79 zł Plan Pro vs 199 zł Premium)
- Meta preferuje drogich klientów
- Wymaga 30+ purchases/tydz.

---

## 📋 KPI-matrix — wklej do Google Sheets

Aktualizuj codziennie przez pierwszy miesiąc, potem 2× / tydz.

| Data | Spend | Impr | Clicks | CTR | CPM | CPC | Rejestr. | CPL | Purchases | CAC | ROAS | Freq |
|------|-------|------|--------|-----|-----|-----|----------|-----|-----------|-----|------|------|
| T1D1 | 50 | 6k | 80 | 1.3% | 8 zł | 0.6 | 5 | 10 | 0 | — | 0 | 1.1 |
| T1D2 | 50 | 7k | 92 | 1.3% | 7 | 0.5 | 7 | 7 | 0 | — | 0 | 1.2 |
| ... | | | | | | | | | | | | |

**Wartości benchmarkowe po 14 dniach:**
- Spend: 500–800 zł (łącznie)
- CPL: < 12 zł
- CAC: < 100 zł
- ROAS: > 1.0 (w T4 powinien być > 2.0)

**Jeśli po 14 dniach ROAS < 0.5 → wstrzymaj kampanię, popraw produkt lub landing, restart.**

---

## 💎 Ostateczny tip od weterana

**Najważniejsza metryka to NIE CPL. Najważniejsza to CAC / LTV po 60 dniach.**

Reklama, która daje CPL 5 zł, ale zarejestrowani nie płacą — jest **droższa** niż reklama z CPL 20 zł, ale 30% z nich kupuje Plan Pro.

**Optymalizuj pod pieniądze, nie pod kliknięcia.**

Pixel i event `Purchase` są kluczowe. Bez nich prowadzisz kampanię po omacku — w 2026 to już się nie wybacza.

---

## 🧮 Kalkulator budżetu — ile wydać przy różnych celach

**Cel:** 10 rejestracji / dzień przy CPL 10 zł → **budżet dzienny 100 zł**
**Cel:** 20 rejestracji / dzień przy CPL 8 zł (po optymalizacji) → **budżet dzienny 160 zł**
**Cel:** 50 rejestracji / dzień przy CPL 6 zł (z Lookalike) → **budżet dzienny 300 zł**

Aby dojść do ostatniego celu potrzebujesz 2–3 miesięcy. To nie jest spint — to maraton.
