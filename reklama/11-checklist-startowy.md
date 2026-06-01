# 11 — Checklista startowa (co zrobić najpierw)

**Cel tego pliku:** masz tylko godzinę dziennie. Nie wiesz od czego zacząć. Tutaj jest **jedna sekwencja działań**, którą wykonujesz od góry do dołu. Każdy krok ma konkretny rezultat i szacowany czas.

---

## 🎯 Dzień 0 — Przygotowanie kont (30 min)

### Krok 0.1 — Konto Facebook Business Manager
- [ ] Wejdź na [business.facebook.com](https://business.facebook.com)
- [ ] Kliknij **„Utwórz konto"**
- [ ] Nazwa firmy: **MapJob**
- [ ] Email: `kontakt@mapjob.pl` (ten sam co w apce)
- [ ] Zweryfikuj email (klik w link)

### Krok 0.2 — Strona Facebook „MapJob"
- [ ] Business Manager → Strony → **Utwórz stronę**
- [ ] Typ: **Firma lub marka** → Kategoria: „Aplikacja" lub „Narzędzie online"
- [ ] Logo: użyj ikony 192×192 z folderu `icons/` w projekcie
- [ ] Zdjęcie w tle: screenshot mapy z apki (1640×924)
- [ ] Opis: „Polska mapa fachowców. Logowanie Googlem · pierwszy pin 0 zł · bez prowizji."

### Krok 0.3 — Konto Instagram (opcjonalnie, ale +10% zasięg)
- [ ] Instagram.com → Utwórz konto biznesowe
- [ ] Nazwa: **@mapjob.pl** (lub `@mapjobapp` jeśli zajęte)
- [ ] Business Manager → **Połącz Instagram** ze stroną FB MapJob

### Krok 0.4 — Weryfikacja domeny `mapjob.pl`
- [ ] Business Manager → **Brand Safety** → **Weryfikacja domen**
- [ ] Dodaj `mapjob.pl`
- [ ] Wybierz metodę **„Meta-tag HTML"**
- [ ] Skopiuj wygenerowany meta tag
- [ ] Dodaj do `<head>` w [`index.html`](../index.html) (ja mogę to zrobić — daj mi tag)
- [ ] Kliknij **„Weryfikuj"** (5 min czekania)

### Krok 0.5 — Karta płatnicza
- [ ] Business Manager → **Ustawienia płatności** → Dodaj kartę
- [ ] Limit dzienny: ustaw na 100 zł (zabezpieczenie przed błędem)

---

## 🎯 Dzień 1 — Meta Pixel w kodzie (mogę zrobić sam, potrzebuję Pixel ID)

### Krok 1.1 — Utworzenie Pixel
- [ ] Business Manager → **Źródła zdarzeń** → **Utwórz Pixel**
- [ ] Nazwa: **MapJob Pixel**
- [ ] Typ połączenia: **Pixel i Conversions API**
- [ ] Skopiuj **16-cyfrowy Pixel ID** (np. `1234567890123456`)
- [ ] **Wyślij mi ten ID** — wkleję go w kod

### Krok 1.2 — Instalacja Pixel w kodzie (robię ja)
- [ ] Pixel snippet w `<head>` [`index.html`](../index.html) — z consent mode (RODO)
- [ ] Event `Lead` przy otwarciu modalu rejestracji
- [ ] Event `CompleteRegistration` po udanej rejestracji
- [ ] Event `InitiateCheckout` w funkcji `openStripePayment`
- [ ] Event `Purchase` po powrocie z Stripe (albo via edge function)
- [ ] Update polityki prywatności (obecnie pisze że Pixel NIE jest wdrożony)

### Krok 1.3 — Test Pixel
- [ ] Zainstaluj rozszerzenie Chrome: **Meta Pixel Helper**
- [ ] Wejdź na mapjob.pl — ikona powinna być zielona
- [ ] Kliknij „Zarejestruj się" — pokazuje event `Lead`
- [ ] Zarejestruj testowe konto — pokazuje `CompleteRegistration`
- [ ] Kup testowo (Stripe test card `4242 4242 4242 4242`) — pokazuje `Purchase`

### Krok 1.4 — Priorytety eventów (AEM)
- [ ] Events Manager → Settings → **Aggregated Event Measurement**
- [ ] Ustaw kolejność:
  1. `Purchase`
  2. `InitiateCheckout`
  3. `CompleteRegistration`
  4. `Lead`
  5. `PageView`

---

## 🎯 Dzień 2 — Kreacje graficzne (1,5h)

### Krok 2.1 — Eksport 8 obrazków 1080×1080
- [ ] Otwórz [`10-kreacje.html`](10-kreacje.html) w Chrome w pełnym ekranie (F11)
- [ ] DevTools (F12) → Cmd+Shift+P → **„Capture node screenshot"**
- [ ] Dla każdego mockupu (#1 do #8):
  - Prawy klik na `.fb-frame` → Inspect
  - Run command → Capture node screenshot
  - PNG zapisuje się do Downloads
  - Nazwij: `mapjob-kreacja-01-klik-google.png`, `mapjob-kreacja-02-ai-cv.png`, itd.

### Krok 2.2 — Screenrecord z apki (video #1)
- [ ] Android: Ustawienia → Screen Recorder
- [ ] iPhone: Control Center → Screen Recording
- [ ] Nagraj **15 sekund**:
  - 0–2s: mapjob.pl, przycisk „Kontynuuj z Google"
  - 2–5s: klik → wybór konta Google → apka
  - 5–9s: wybór zawodu → miasto → pin na mapie
  - 9–12s: notyfikacja „Nowa wiadomość"
  - 12–15s: logo + CTA „mapjob.pl"
- [ ] Montaż: CapCut (za darmo) — dodaj napisy + beat

### Krok 2.3 — Animacja w Canva (video #2) — opcjonalnie dzień 2
- [ ] Canva → szablon **Instagram Reel** (1080×1920)
- [ ] Według scenariusza w [`03-video-scenariusze.md`](03-video-scenariusze.md), Video #2
- [ ] Export MP4 1080p

---

## 🎯 Dzień 3 — Uruchomienie kampanii (60 min)

### Krok 3.1 — Utwórz Kampanię A (Fachowcy)
- [ ] Ads Manager → **Create**
- [ ] Objective: **Leads**
- [ ] Nazwa: `MapJob-A-Fachowcy-2026-04`
- [ ] Advantage Campaign Budget: **WYŁĄCZ**
- [ ] Klik Next

### Krok 3.2 — Utwórz 6 Ad Setów (geografia)
Dla każdego ad setu:
- [ ] **AS-PL** — cała Polska, 20 zł/dzień
- [ ] **AS-WAW** — Warszawa + 30 km, 6 zł/dzień
- [ ] **AS-KRK** — Kraków + 30 km, 6 zł/dzień
- [ ] **AS-WRO** — Wrocław + 30 km, 6 zł/dzień
- [ ] **AS-POZ-GDA** — Poznań + Gdańsk, 6 zł/dzień
- [ ] **AS-SL** — Katowice + Gliwice + Sosnowiec, 6 zł/dzień

Każdy ad set:
- Wiek: **25–55**, język: **polski**
- Saved Audience: **„Fachowcy PL"** (definicja w [`07-targetowanie.md`](07-targetowanie.md))
- Conversion event: `CompleteRegistration`
- Placements: **Manual** (FB Feed + IG Feed + Stories + Reels, WYŁĄCZ Audience Network)

### Krok 3.3 — Dodaj reklamę A1 do każdego ad setu
Dla każdego ad setu:
- [ ] Format: **Single Image**
- [ ] Obraz: `mapjob-kreacja-01-klik-google.png` (z Dnia 2)
- [ ] Headline: **Klik Google. Pin na mapie. Klienci piszą.**
- [ ] Primary Text: skopiuj z [`01-kampania-A-fachowcy.md`](01-kampania-A-fachowcy.md), Reklama A1
- [ ] Description: **Polska mapa fachowców. Logowanie Googlem w 2 sekundy.**
- [ ] CTA: **Zarejestruj się**
- [ ] URL z UTM (różny per miasto — patrz [`06-ads-manager-setup.md`](06-ads-manager-setup.md))

### Krok 3.4 — Automated Rules
- [ ] Ads Manager → **Automated Rules** → **Create Rule**
- [ ] Reguła 1: jeśli CPL > 25 zł AND Impressions > 2000 → wyłącz
- [ ] Reguła 2: jeśli CPL < 8 zł AND Results > 5 → +30% budżetu co 3 dni, max 200 zł/d

### Krok 3.5 — Publish
- [ ] Kliknij **Publish** (prawy dolny róg)
- [ ] Review 1–24h (zwykle 2h)
- [ ] Czekaj na status **Active**

---

## 🎯 Dzień 4–6 — NIC NIE ZMIENIAJ

To learning phase. Każda zmiana resetuje naukę algorytmu. **Tylko obserwujesz** metryki:
- Ile wyświetleń?
- Jaki CTR?
- Jaki CPL?

---

## 🎯 Dzień 7 — Pierwsza optymalizacja (30 min)

### Krok 7.1 — Analiza
- [ ] Sprawdź CPL każdego z 6 ad setów
- [ ] Zidentyfikuj 2 najlepsze (najniższy CPL) i 2 najgorsze (najwyższy CPL)

### Krok 7.2 — Wyłączenie słabych
- [ ] Wyłącz 2 najgorsze ad sety (te z CPL > 25 zł lub 0 konwersji)
- [ ] Uwolnione 12 zł/dzień → dorzuć po 6 zł do 2 najlepszych

### Krok 7.3 — Dorzuć wariant B headline
- [ ] W zwycięskim ad secie zduplikuj reklamę A1
- [ ] W kopii zmień headline na wariant B: **„Konto w 2 sekundy — bez hasła, bez maila weryfikacyjnego."**
- [ ] Puść oba warianty równocześnie — Meta sama rozdzieli budżet

### Krok 7.4 — Uruchom Kampanię B (klienci)
- [ ] Nowa kampania: **MapJob-B-Klienci-2026-04**
- [ ] Cel: **Traffic**
- [ ] 2 ad sety: B1 + B2 po 7,5 zł/dzień = 15 zł razem
- [ ] Audience: „Osoby prywatne remontujące" (z [`07-targetowanie.md`](07-targetowanie.md))
- [ ] URL docelowy: `https://mapjob.pl/?view=map` (NIE rejestracja — mapa!)

---

## 🎯 Dzień 14 — Retargeting (30 min)

### Krok 14.1 — Custom Audiences
- [ ] Business Manager → Audiences → **Create Custom Audience** → Website
- [ ] Utwórz 4 audiences (szczegóły w [`07-targetowanie.md`](07-targetowanie.md)):
  - `Visitors_All_30d`
  - `Pricing_Viewers_30d`
  - `InitiatedCheckout_14d`
  - `Registered_90d`

### Krok 14.2 — Kampania retargetingu
- [ ] Nowa kampania: **MapJob-R-Retarget-2026-04**
- [ ] Cel: **Sales**
- [ ] 2 ad sety na start:
  - **R1 — Abandoned Checkout** (10 zł/dzień)
  - **R5 — Post-reg upsell** (10 zł/dzień)
- [ ] Copy z [`09-retargeting.md`](09-retargeting.md)

### Krok 14.3 — Wykluczenia
- [ ] W każdym ad secie retargetingu WYKLUCZ `Purchased_180d`
- [ ] W R1 wyklucz audience R5 (i odwrotnie)

---

## 🎯 Checklist tygodniowy (od tygodnia 2+)

Sprawdzaj co poniedziałek — 15 min:

- [ ] **Spend ostatni tydzień:** ____ zł
- [ ] **Rejestracje:** ____
- [ ] **Średni CPL:** ____ zł (cel: < 15 zł pierwszy miesiąc)
- [ ] **Najlepszy ad set:** ____ (skaluj +30%)
- [ ] **Najgorszy ad set:** ____ (wyłącz jeśli CPL > 25 zł)
- [ ] **Frequency:** ____ (jeśli > 4 — rozszerz audience)
- [ ] **Jakiej kreacji brakuje?** ____ (dorzucić z biblioteki reklam A1–A8)

---

## 🚨 Kiedy STOP i think

Jeśli po **14 dniach**:
- Wydałeś > 700 zł
- ROAS < 0,5 (żadnej sprzedaży)
- Zero rejestracji z reklam

**Nie skaluj dalej!** Wstrzymaj kampanię, sprawdź:
1. Czy Pixel działa? (Meta Pixel Helper)
2. Czy landing page ładuje się szybko? (< 3s)
3. Czy rejestracja przez Google OAuth działa na mobile?
4. Czy ktoś w ogóle widzi mapę w swoim mieście (czy nie jest pusta)?

Produkt musi być ready **zanim** palisz budżet.

---

## 📞 Co mogę zrobić ja (jako AI)

- ✅ Wstawić Pixel + 4 eventy konwersji w kodzie (daj mi Pixel ID)
- ✅ Zaktualizować politykę prywatności o Pixel
- ✅ Dodać meta tag weryfikacji domeny do `<head>`
- ✅ Wdrożyć Conversions API w edge function `stripe-webhook`
- ✅ Przepisać copy pod feedback
- ✅ Wygenerować nowe warianty kreacji w HTML
- ✅ Analizować wyniki z Ads Managera (paste CSV)

## 📞 Co musisz zrobić Ty

- 🟡 Założyć konto Business Manager + stronę FB
- 🟡 Utworzyć Pixel i przysłać mi 16-cyfrowy ID
- 🟡 Zweryfikować domenę (klik „Weryfikuj" po tym jak dodam meta tag)
- 🟡 Wgrać kreacje do Ads Managera (po eksporcie z [`10-kreacje.html`](10-kreacje.html))
- 🟡 Skonfigurować kampanię w Ads Managerze (tylko Ty masz dostęp)
- 🟡 Wypłacać kartę płatniczą (Meta pobiera)

---

## 🎯 Gdzie dalej

- [`README.md`](README.md) — ogólna mapa folderu
- [`01-kampania-A-fachowcy.md`](01-kampania-A-fachowcy.md) — 8 reklam fachowców
- [`06-ads-manager-setup.md`](06-ads-manager-setup.md) — szczegóły Ads Managera
- [`08-budzet-skalowanie.md`](08-budzet-skalowanie.md) — reguły skalowania
