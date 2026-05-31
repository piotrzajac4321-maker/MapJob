# Dedykowane Landing Pages — per persona + per kampania

**Dlaczego nie jedna główna strona:** jeśli reklama A1 (Google login) wysyła usera na mapjob.pl, to user trafia na *ogólne* info + mapę. Musi znaleźć co go dotyczy. **Konwersja: 2–4%.**

Jeśli reklama wysyła usera na **dedykowany landing** (`/r/elektryk`, `/r/dla-dewelopera`), gdzie pierwszy nagłówek mówi „Elektryk? Klient w Twoim mieście Cię szuka — wbij pin za darmo" — **konwersja: 8–15%.**

Różnica: **2–4× więcej rejestracji przy tym samym budżecie reklamowym**.

---

## 🎯 Lista landingów do zbudowania

| URL | Persona | Campaign referrer | Priorytet |
|-----|---------|-------------------|-----------|
| `/r/fachowcy` | Ogólny landing dla fachowców (default) | Meta A1, Google Search „platforma dla fachowców" | ⭐⭐⭐ |
| `/r/dla-klientow` | Ogólny landing dla klientów | Meta B1, B2 | ⭐⭐⭐ |
| `/r/elektryk` | Persona: elektryk (Marek) | Google Search „elektryk reklama" | ⭐⭐ |
| `/r/hydraulik` | Persona: hydraulik | Google Search „hydraulik zlecenia" | ⭐⭐ |
| `/r/spawacz` | Persona: spawacz (Krzysztof) | Google Search „spawacz zlecenia" | ⭐ |
| `/r/fachowcy-kobiety` | Persona: Anna | Meta A22 | ⭐ |
| `/r/fachowcy-eco` | Persona: Tomek (PV / pompy ciepła) | Meta B14, LinkedIn B8 | ⭐ |
| `/r/wracam-z-zagranicy` | Persona: Polacy-emigranci | Meta A14 | ⭐ |
| `/r/dla-dewelopera` | Persona: Robert (B2B) | LinkedIn B8, Google „podwykonawcy" | ⭐ |
| `/r/remont-kuchni` | Sezonowo dla klientów | Meta B5, B10 | ⭐ |
| `/r/senior` | Persona: Bożena (uproszczony UI) | Retargeting starszych | opcjonalne |

---

## 📄 Struktura landing page — uniwersalna

Każdy landing = **jedna strona, jedna akcja, jeden CTA**. Bez menu nawigacyjnego („ucieczki"). User ma 2 wybory: **rejestruj się** albo **wyjdź**.

**Anatomia (od góry do dołu):**

```
┌─────────────────────────────────────────┐
│ 1. HERO (above the fold)                │
│    Headline (8–12 słów)                 │
│    Subheadline (1 zdanie)               │
│    CTA button (główny)                  │
│    Trust badge (mini — „polska apka")   │
├─────────────────────────────────────────┤
│ 2. PROBLEM (pain points)                │
│    3–5 punktów związanych z personą     │
├─────────────────────────────────────────┤
│ 3. ROZWIĄZANIE (how MapJob solves)      │
│    3–5 feature'ów z ikonami             │
├─────────────────────────────────────────┤
│ 4. DOWÓD (social proof)                 │
│    Screenshoty apki (NIE fake opinie)   │
│    Mapa fragmentu z pinami              │
├─────────────────────────────────────────┤
│ 5. CENA (transparentność)               │
│    Plan darmowy + Plan Pro + Wspierający│
├─────────────────────────────────────────┤
│ 6. FAQ (obiekcje)                       │
│    3–5 najczęstszych wątpliwości        │
├─────────────────────────────────────────┤
│ 7. CTA POWTÓRZONY                       │
│    "Wbij pin za darmo → Google login"   │
├─────────────────────────────────────────┤
│ 8. FOOTER (minimal)                     │
│    Logo + kontakt + polityka + regulamin│
└─────────────────────────────────────────┘
```

**Długość:** optimum 1000–1500 słów (scrollowalne, ale nie za długie).
**Ładowanie:** < 2 sekund na 4G (Pagespeed 90+).
**Mobile-first:** 80% ruchu z Meta = mobile.

---

## 🖥️ LANDING #1 — `/r/fachowcy` (ogólny, dla kampanii A1–A8)

### Sekcja 1 — HERO

**Headline (H1):**
> Polska mapa fachowców. Klient pisze wprost do Ciebie.

**Subheadline (H2):**
> Zaloguj Googlem w 2 sekundy. Pierwszy pin zawsze za darmo. Zero prowizji, zero kredytów kontaktowych.

**CTA button (główny):**
`🔐 Zaloguj Googlem — wbij pin`

**Under CTA (trust signals):**
> ✓ Polska apka · ✓ 0 zł pierwszy pin · ✓ Bez karty kredytowej

**Kreacja hero:**
- Zdjęcie fachowca z telefonem (prompt A1 z [13-prompty-ai-zdjec.md](13-prompty-ai-zdjec.md))
- ALBO screenshot apki z mapą pełną pinów (zaletą: pokazuje produkt od razu)

---

### Sekcja 2 — PROBLEM

**Headline:** Każdy dzień bez klientów = strata pieniędzy.

**Body:**

```
Znasz to?

❌ OLX — zasypany botami i „firmami" które nigdy nie dzwonią
❌ Oferia, Fixly — płacisz za każdy kontakt, kupujesz kredyty
❌ Google Ads — 500 zł miesięcznie wyrzucone w powietrze
❌ Ulotki w skrzynkach — 95% trafia do kosza
❌ „Polecenie od kuzyna" — może raz, może nigdy

Pracujesz 10 lat w zawodzie, a klienci wciąż są zagadką.
```

---

### Sekcja 3 — ROZWIĄZANIE

**Headline:** MapJob odwraca to: mapa pokazuje Cię klientom.

**3 kolumny (ikony + tekst):**

**🔐 Logowanie Googlem — 2 sekundy**
> Bez haseł. Bez maila weryfikacyjnego. Klik Google → konto gotowe.

**📍 Pin na mapie — zawsze za darmo**
> Wybierasz zawód, dodajesz portfolio. Klient w okolicy widzi Cię natychmiast.

**💬 Chat bezpośrednio z klientem**
> Klient pisze wprost — bez pośrednika, bez prowizji od zlecenia, bez kredytów kontaktowych.

---

### Sekcja 4 — DOWÓD (social proof bez fake)

**Headline:** Co widzi klient, gdy klika Twój pin?

**Mockup screenshots (z [10-kreacje.html](10-kreacje.html)):**
- Profil fachowca z portfolio
- Mapa z pinami różnych zawodów
- Ekran chatu z klientem

**Alternatywa (jak masz już realnych userów):**
- Screenshots anonimowych statystyk („1500 wyświetleń profilu w tydzień")
- Liczba realnych pinów na mapie (po walidacji!)

**Do momentu realnych danych — NIE umieszczaj liczb.** Pokaż screenshoty funkcji.

---

### Sekcja 5 — CENA (transparentność)

**Headline:** Prosto i bez gwiazdek.

**3 kolumny:**

**Plan Darmowy — 0 zł**
- 1 pin na mapie
- Podstawowe portfolio (3 zdjęcia)
- Chat z klientami
- Oceny + lokalizacja
> `Zaczynaj za darmo`

**Plan Pro — 79 zł/mies.**
- Wszystko z Darmowego +
- **Giełda Zleceń** — składasz oferty na wszystkie zlecenia
- Statystyki profilu (ile wyświetleń, kliknięć telefonu)
- 🏆 Złoty badge — pierwszy w wynikach
- Portfolio pro (nielimitowane zdjęcia)
> `Wybierz Plan Pro`

**Pakiet Wspierający — 200 zł jednorazowo**
- Plan Pro przez 5 lat
- Portfolio Pro dożywotnio
- Pełna Giełda Zleceń
- Płatność BLIK (bez karty)
> `Jednorazowa płatność`

---

### Sekcja 6 — FAQ

**Najczęstsze pytania:**

> **Czy naprawdę pierwszy pin jest za darmo?**
> Tak. Zawsze. Nie wymagamy karty kredytowej, nie ma „okresu próbnego" — pin zostaje za darmo dopóki sam nie zrezygnujesz.

> **Co z prowizją od zlecenia?**
> Zero. Klient płaci Tobie bezpośrednio — my nie jesteśmy w środku transakcji. MapJob zarabia wyłącznie z subskrypcji Plan Pro, która jest dobrowolna.

> **Jak szybko dostanę pierwszy kontakt?**
> To zależy od Twojego miasta i kompletu profilu. W Warszawie/Krakowie/Wrocławiu zwykle 2–7 dni. W mniejszych miastach może być 14–30 dni. (Nie obiecujemy „gwarancji".)

> **Czy mogę zrezygnować?**
> Oczywiście. Plan darmowy = zostawiasz pin lub usuwasz konto (1 klik w ustawieniach). Plan Pro = możesz anulować po każdym miesiącu.

> **Czy MapJob to polska firma?**
> Tak. Polska apka, polski support, polski regulamin. Skontaktuj się: kontakt@mapjob.pl

---

### Sekcja 7 — CTA POWTÓRZONY

**Headline:** Gotowy? Zaloguj Googlem.

**CTA button duży:**
`🔐 Kontynuuj z Google`

**Under button:**
> Konto w 2 sekundy · Pierwszy pin 0 zł · Polska apka

---

### Sekcja 8 — FOOTER

```
MapJob · Polska mapa fachowców
kontakt@mapjob.pl · [Regulamin] · [Polityka prywatności] · [Cennik]
```

**Brak menu głównego** — user nie ucieka w inne strony.

---

## 🖥️ LANDING #2 — `/r/elektryk` (specyficzny dla elektryków)

### Sekcja 1 — HERO

**Headline:** 
> Elektryk? Klient w Twoim mieście szuka fachowca teraz.

**Subheadline:**
> MapJob to polska mapa, na której instalatorzy elektryczni wbijają pin — i klienci piszą bezpośrednio. Zero prowizji, zero kredytów, zero biurokracji.

**CTA:** `🔐 Wbij pin — zaloguj Googlem`

---

### Sekcja 2 — PROBLEM (specyficzne dla elektryków)

**Headline:** Elektryczny biznes w 2026 — co się zmieniło?

```
❌ OLX Praca = 95% nieaktualnych zleceń
❌ Portalowe „instalatorzy" — jak na giełdzie kupczą punktami
❌ Google Ads na „elektryk [miasto]" = 20 zł za kliknięcie (konkurencja wysoka)
❌ Klienci nie ufają „tanie" bez weryfikacji
❌ Sezonowość — zima martwa, lato zapętlone
```

---

### Sekcja 3 — ROZWIĄZANIE (dla elektryków)

**Headline:** Jak elektryk na MapJob dostaje klientów?

**3 + 1 feature:**

**⚡ Filtr „Instalacje / Serwis / Pomiary SEP"**
> Klient filtruje dokładnie czego potrzebuje. Nie robisz wszystkiego — tylko to, na czym znasz się dobrze.

**📸 Portfolio z Twoimi pracami**
> Zdjęcia rozdzielnicy, domowej instalacji, sprawdzania zabezpieczeń. Klient widzi Twój poziom.

**🏆 Badge „Uprawnienia SEP"**
> Jeśli masz SEP E/D/1kV — dodajesz plikiem skan certyfikatu. Klient widzi „zweryfikowany SEP". Poziom zaufania: wzrost.

**💰 Brak prowizji**
> Klient płaci Tobie wprost — BLIK, gotówka, przelew. Nic w środku.

---

### Sekcja 4 — DOWÓD

**Headline:** Widok mapy — Twoje miasto.

**Screenshot:** mapa z pinami (kilka, nie dziesiątki — sugeruj wczesną fazę)

**Mini-dowód (weryfikowalny):**
- „Polska apka — kontakt z zespołem po polsku"
- „Konta zweryfikowane przez Google (każdy user = realna osoba)"
- „Pełna kontrola nad profilem — edytujesz kiedy chcesz"

---

### Sekcja 5 — CENA

Taki sam schemat jak w /r/fachowcy, ale z **akcentem na Giełdę Zleceń**:

> Plan Pro daje Ci dostęp do Giełdy — widzisz wszystkie zlecenia dla elektryków (nie tylko w swoim mieście). Kontrakty B2B, instalacje przemysłowe, duże inwestycje.

---

### Sekcja 6 — FAQ (specyficzne)

> **Czy mogę wpisać, że robię tylko SEP E?**
> Tak, w profilu wybierasz podkategorie. Klient filtruje „E1" / „E do 1kV" / „Pomiary" itp. — pokazujesz się tylko właściwym.

> **Jak z odpowiedzialnością za instalację?**
> MapJob to tylko platforma kontaktu — Ty jesteś wykonawcą, Ty odpowiadasz zgodnie z prawem (art. 51 Prawa Energetycznego). MapJob nie jest stroną umowy.

---

## 🖥️ LANDING #3 — `/r/dla-dewelopera` (B2B, LinkedIn referrer)

### Sekcja 1 — HERO

**Headline:**
> Znajdź 40 podwykonawców dla Twojej inwestycji. Bez obdzwaniania.

**Subheadline:**
> Mapa polskich fachowców z filtrem zawodu, obszaru pracy, certyfikatów. Dla dewelopera / GW — 100% za darmo.

**CTA:** `🗺️ Otwórz mapę dla dewelopera`

**Mini-CTA obok:**
> Chcesz demo (15 minut)? [Umów rozmowę](calendly link)

---

### Sekcja 2 — PROBLEM (B2B pain)

```
Zarządzasz 3 inwestycjami. Każda potrzebuje 5–10 różnych ekip.

❌ Obdzwanianie „z polecenia" — 40 telefonów w tydzień
❌ LinkedIn = senior management, brak wykonawców
❌ Oferia / Fixly = za wąski segment, niskojakościowe odpowiedzi
❌ Excel z listą 200 podwykonawców — kto jest aktualny, kto nie?

Tygodnie szukania = opóźnienia = kary umowne 50k+ zł.
```

---

### Sekcja 3 — ROZWIĄZANIE (dla GW)

**4 feature'y:**

**🔍 Filtry profesjonalne**
> Zawód · Obszar pracy · Certyfikaty (UDT, SEP, UD) · Historia realizacji · Dostępność.

**📸 Portfolio każdego podwykonawcy**
> Klikasz pin → widzisz realne zdjęcia realizacji, nie „koledzy z branży mówią że dobry".

**💬 Chat z załącznikami**
> Wysyłasz PDF przetargu, rysunki techniczne, wycenę. Odpowiedź w chacie MapJob, nie zagubiona w skrzynce.

**📊 Premium: eksport do CRM (opcjonalnie)**
> Plan Premium B2B = eksport listy kontaktów do Excel / CSV → integracja z Twoim CRM.

---

### Sekcja 4 — DOWÓD

**Headline:** Jak wygląda typowy proces dla dewelopera?

**Timeline wizualny:**
```
Dzień 1    — Zaloguj Googlem (2 sek.)
Dzień 1    — Wybierz filtry (miasto + zawód)
Dzień 1    — Wyślij wiadomości do 10 najlepszych
Dni 2–3    — Odpowiedzi + oferty
Dzień 5    — Wybierasz 3 finalistów + podpisujesz umowy
```

**vs tradycyjnie:**
```
Tygodnie 1–3  — Obdzwanianie 50 numerów
Tygodnie 2–4  — Wycena od 10 firm (część nie odpisze)
Tygodnie 4–6  — Decyzja + umowy
```

**Zysk czasu: 4–5 tygodni.**

---

### Sekcja 5 — CENA

**Dla klienta biznesowego:**
- Plan Darmowy — 0 zł (pełna mapa, chat, filtry)
- **Plan Premium B2B — 499 zł/mies.** (eksport CSV, priority support, oznaczenie „sprawdzony inwestor")

---

### Sekcja 6 — FAQ (B2B)

> **Czy fachowcy są weryfikowani?**
> Każdy użytkownik ma konto Google. Dla Plan Premium B2B — dodatkowa weryfikacja NIP firmy fachowca (ręczna, 48h).

> **Faktura VAT?**
> Plan Premium B2B = faktura VAT, standardowe 23%. Plan darmowy nie wymaga faktury (0 zł).

> **GDPR / RODO przy eksporcie?**
> Eksportujemy tylko dane kontaktowe fachowców, którzy explicitnie zgodzili się na udostępnianie danych klientom B2B (checkbox w profilu). RODO-compliant.

---

### Sekcja 7 — CTA POWTÓRZONY

**Dwa CTA:**
1. `🗺️ Zobacz mapę — za darmo` (primary — niski próg)
2. `📞 Umów 15-minutowe demo` (secondary — dla poważnych leadów)

---

## 🖥️ LANDING #4 — `/r/senior` (uproszczony UI dla Bożeny)

### Cechy specjalne:
- **Font większy** — 18px body (vs 16px standard)
- **Mniej opcji** na stronie (tylko 1 CTA, bez opcji Plan Pro)
- **Video tutorial** „jak znaleźć fachowca w 30 sekund" (embedded YouTube)
- **Numer telefonu support** widoczny (dla osób, które wolą zadzwonić)

### Sekcja 1 — HERO

**Headline (bardzo prosty):**
> Szukasz fachowca? My Ci pomożemy.

**Subheadline:**
> Polska apka. Bez rejestracji skomplikowanej. Tylko klik Google.

**CTA button duży (50px wysoki, kontrastowy):**
`🗺️ Pokaż fachowców w mojej okolicy`

**Pod CTA:**
> Pomoc telefoniczna (w godzinach pracy): **+48 XXX XXX XXX** · kontakt@mapjob.pl

---

### Sekcja 2 — „Jak to działa" (krok po kroku)

**3 duże ilustrowane kroki:**

**1️⃣ Otwórz mapę**
> Zobaczysz fachowców w Twojej okolicy — elektryków, hydraulików, stolarzy.

**2️⃣ Wybierz jednego**
> Każdy fachowiec ma zdjęcia swoich prac i oceny od innych klientów.

**3️⃣ Napisz wiadomość**
> Klikasz „Chat" i piszesz. Fachowiec odpowiada — umawiacie się.

---

### Sekcja 3 — Video tutorial

**Embedded YouTube** (2-minutowy, krok po kroku, z polskim lektorem):
> Jak znaleźć fachowca w MapJob — tutorial 2 minuty

---

### Sekcja 4 — CTA POWTÓRZONY

`🗺️ Pokaż mapę` (duży button)

**Alternatywa:**
`📞 Zadzwoń do nas — pomogę Ci krok po kroku`

---

## 🎨 Design system — wszystkie landingi

### Kolory (zgodne z apką MapJob)

```css
--bg: #0A1228           /* tło */
--bg2: #0F1B3A          /* sekcja alternatywna */
--surface: rgba(255,255,255,.06)
--border: rgba(255,255,255,.1)
--primary: #1D6FF2      /* niebieski CTA */
--primary-hover: #1557B8
--accent: #00D4FF       /* cyan akcent */
--gold: #FFD700         /* złoty premium */
--success: #16C45E
--text: #ffffff
--text2: rgba(255,255,255,.75)
--text3: rgba(255,255,255,.5)
```

### Typografia

**Font:** Plus Jakarta Sans (ten sam co w apce!)
- H1: 48px / 900 weight / letter-spacing -1px
- H2: 32px / 800 weight
- H3: 22px / 700 weight
- Body: 16px / 400 weight / line-height 1.6
- CTA button: 18px / 800 weight

**Mobile:**
- H1: 32px
- H2: 24px
- Body: 15px

### Layout

- Max width: **1200px** (desktop)
- Padding sections: **80px top/bottom** (desktop), **48px** (mobile)
- Grid: 12-column (desktop), 4-column (tablet), 1-column (mobile)
- CTA button: **border-radius 14px**, padding `16px 32px`, shadow `0 4px 20px rgba(29,111,242,.4)`

---

## 🔧 Implementacja techniczna

### Opcja A — Statyczne HTML w projekcie

Dodaj pliki:
- `r/fachowcy.html`
- `r/dla-klientow.html`
- `r/elektryk.html`
- itp.

**Plus:** zero zależności, najszybsze ładowanie
**Minus:** brak dynamic content (np. liczba pinów)

### Opcja B — JS routing w `index.html`

W `index.html`:
```javascript
// Routing based on path
const path = window.location.pathname;
if (path.startsWith('/r/')) {
  const persona = path.replace('/r/', '');
  loadLandingPage(persona);  // render specyficzny HTML
  return;  // nie ładuj głównej apki
}
```

**Plus:** jedna strona, dynamiczny content
**Minus:** tracking konwersji trudniejszy (user widzi ten sam URL)

### Opcja C — Osobna subdomena / osobny deployment

`landing.mapjob.pl/fachowcy`

**Plus:** kompletna separacja, najlepsza dla A/B testów
**Minus:** więcej pracy przy setup'ie DNS + SSL

**Rekomendacja:** **Opcja A** na start (proste, szybkie). Migracja do C w miesiącu 3–4.

---

## 📊 Tracking konwersji per landing

Każdy landing ma **unikalny URL z UTM** w reklamie:
```
https://mapjob.pl/r/elektryk?utm_source=google&utm_medium=cpc&utm_campaign=search-elektryk-warszawa
```

**Pixel / GA4 events per landing:**
- `landing_view` (user wszedł na landing)
- `landing_cta_click` (kliknął główny CTA)
- `google_login_initiated` (rozpoczął flow)
- `registration_complete` (konto założone — event `CompleteRegistration`)

**Konwersja landing → rejestracja:**
- `/r/fachowcy` (ogólny) — cel: > 8% 
- `/r/elektryk` (specyficzny) — cel: > 12%
- `/r/dla-dewelopera` (B2B) — cel: > 3% (niższy, ale LTV × 20)

**Po 30 dniach A/B testy:**
- Wariant hero copy
- Wariant CTA button (tekst + kolor)
- Wariant układu sekcji
- Wariant video vs statyczny hero

---

## ⚡ Optymalizacja szybkości (krytyczne!)

**Cel PageSpeed:** 90+ mobile, 95+ desktop.

**Checklist:**
- [ ] Obrazy hero: **WebP** (nie PNG), max 200KB
- [ ] Font Plus Jakarta Sans: **preload** + **font-display: swap**
- [ ] CSS: inline critical CSS (first render) + async rest
- [ ] JS: defer wszystkie non-critical
- [ ] Video: lazy-load (YouTube embed = iframe z loading="lazy")
- [ ] Analytics: async (nie blokuje first paint)
- [ ] Cache: public, max-age=86400 (24h) dla HTML

**Narzędzie do testów:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

**Każda sekunda ładowania = 7% spadek konwersji.**

---

## 🚀 Roadmap — które landingi najpierw

### Tydzień 1 (must-have):
- [ ] `/r/fachowcy` — ogólny (trafiają tu z Meta A1–A8)
- [ ] `/r/dla-klientow` — ogólny (trafiają tu z Meta B1–B4)

### Tydzień 2:
- [ ] `/r/elektryk` + `/r/hydraulik` (Google Search traffic)

### Tydzień 3–4:
- [ ] `/r/dla-dewelopera` (LinkedIn B8 traffic)
- [ ] `/r/fachowcy-eco` (Meta B14, Google Search „fotowoltaika")

### Miesiąc 2:
- [ ] `/r/fachowcy-kobiety` (Meta A22)
- [ ] `/r/wracam-z-zagranicy` (Meta A14)
- [ ] `/r/remont-kuchni` (sezonowo)

### Miesiąc 3+ (opcjonalnie):
- [ ] `/r/senior` (uproszczony dla starszych klientów)
- [ ] `/r/mobilny-serwis` (mechanicy mobilni, A13)
- [ ] Sezonowe (`/r/wiosenny-remont`, `/r/przegrad-kotla-jesien`)

---

## 💡 Pro-tipy

1. **Nie kopiuj copy 1:1 z reklamy.** Reklama = 125 znaków hook. Landing = expansion, więcej kontekstu.

2. **CTA button tekst = akcja, nie cel.** `Zaloguj Googlem` ✅ vs `Zapisz się` ❌ (drugie brzmi jak newsletter).

3. **Social proof w sekcji 4 MUSI być prawdziwy.** Do momentu realnych danych — używaj feature screenshots zamiast liczb.

4. **FAQ odpowiada na obiekcje z reklam.** Jeśli w reklamie mówisz „zero prowizji", user myśli „jak to, naprawdę?" — FAQ to ucina.

5. **Każdy landing ma landing-specific event pixel** → wiesz dokładnie, która persona konwertuje najlepiej.

6. **Dodaj „ostatnia szansa" variant landing** (dla retargetingu R1 — abandoned checkout) z kodem promo. Ale tylko jeśli kod realnie działa w Stripe.

7. **Video na landing** zwiększa konwersję o 20–40%. Ale wolne ładowanie = -30%. **Lazy-load video** (thumbnail → klik → load).

8. **Mobile first.** 70%+ ruchu z Meta Ads = mobile. Sprawdź każdy landing na iPhone SE (najmniejszy popularny ekran).

9. **A/B testy po 500 visitors min.** Mniej = losowe wyniki.

10. **Testy kolejności sekcji.** Typowa hipoteza: „cena przed dowodami" vs „dowody przed ceną". Każda persona inaczej.
