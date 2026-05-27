# MapJob — Kompletny pakiet reklamowy Meta (Facebook + Instagram)

**Wersja:** 2.0 · **Data:** 2026-04-23 · **Autor:** Ekspert reklamy

---

## 🎯 Filozofia tej kampanii

Uczciwość reklamowa. Żadnych fake'owych liczb („42 tys. fachowców"), fake'owych testymoniali („Marek z Krakowa, 3 zapytania w tydzień"), fake'owych kwot kontraktów ani fake'owej scarcity („127 z 500 miejsc"). Copy bazuje **wyłącznie na weryfikowalnych cechach produktu**:

- **Google OAuth** — „Zaloguj Googlem w 2 sekundy, bez hasła"
- **Darmowa** — „Pierwszy pin 0 zł", „Dla klientów w pełni za darmo"
- **Polska apka** — „Polska technologia, polski support, polscy fachowcy"
- **Bez prowizji** — „Klient pisze wprost, zero kredytów kontaktowych"
- **AI Kreator CV** — „AI pisze CV w 30 sekund"
- **PWA / offline** — „Instaluje się jak apka bez sklepu Google"
- **Pionier** — „Polska apka w fazie startu, pierwsi mają przewagę"

Każda reklama, każda kreacja graficzna, każde wideo = **lustro produktu, nie obietnica**.

---

## 📁 Co jest w tym folderze

| Plik | Co zawiera |
|------|-----------|
| **`01-kampania-A-fachowcy.md`** | 8 reklam podstawowych dla fachowców — headlines, primary text, CTA, URL z UTM |
| **`02-kampania-B-klienci.md`** | 4 reklamy podstawowe dla klientów / firm szukających fachowca |
| **`03-video-scenariusze.md`** | 4 krótkie scenariusze wideo 15s (screenrecord + animacja, bez aktorów) |
| **`04-pixel-kod.html`** | Gotowy snippet Meta Pixel — wklej w `<head>` index.html |
| **`05-pixel-eventy.md`** | Instrukcja: gdzie w kodzie wstawić eventy konwersji |
| **`06-ads-manager-setup.md`** | Krok po kroku: konfiguracja kampanii w Meta Ads Manager |
| **`07-targetowanie.md`** | 6 ad setów geograficznych (miasta + cała Polska) + zainteresowania |
| **`08-budzet-skalowanie.md`** | Start 50 zł/dzień, progresja 60 dni, reguły skalowania |
| **`09-retargeting.md`** | 5 ścieżek remarketingu (bez fake scarcity) |
| **`10-kreacje.html`** | **Otwórz w Chrome + screenshot** → 8 gotowych kreacji 1080×1080 |
| **`11-checklist-startowy.md`** | Jasny plan krok-po-kroku „co zrobić najpierw" |
| **`12-reklamy-dodatkowe.md`** | 10 dodatkowych reklam (A9–A14 + B5–B8) — rotacja, niszowe persony, B2B |
| **`13-prompty-ai-zdjec.md`** | Prompty Midjourney / Flux / DALL-E dla wszystkich 20 reklam + tipy fotograficzne |
| **`14-scenariusze-filmowe.md`** | 6 rozbudowanych scenariuszy 15s/30s/60s z budżetami produkcji (DIY/mid/pro) |
| **`15-reklamy-rozszerzone.md`** | 🆕 14 reklam emocjonalnych/sezonowych (A15–A22 + B9–B14) |
| **`16-google-ads.md`** | 🆕 Google Search + YouTube + Display + Performance Max — pełna strategia |
| **`17-tiktok-linkedin.md`** | 🆕 TikTok Ads + LinkedIn Ads (B2B) + Instagram Reels |
| **`18-ai-video-prompts.md`** | 🆕 Runway / Sora / Pika / Luma prompty do wideo AI |
| **`19-customer-personas.md`** | 🆕 7 głębokich person (4 fachowców + 3 klientów) z psychografią |
| **`20-email-onboarding.md`** | 🆕 7-emailowy funnel po rejestracji + SMS sequence |
| **`21-landing-pages.md`** | 🆕 Dedykowane landingi per persona (/r/fachowcy, /r/dewelopera, etc.) |
| **`22-sezonowy-kalendarz.md`** | 12-miesięczny plan kampanii z budżetami per miesiąc |
| **`23-reklamy-mega-pack.md`** | 🔥 23 nowe reklamy A23–A37 + B15–B22 (57 reklam w bibliotece) |
| **`24-kreacje-stories.html`** | 🔥 **10 animowanych kreacji 9:16** (Stories/Reels) z CSS — otwórz w Chrome |
| **`25-kampanie-storytelling.md`** | 🔥 5 seryjnych kampanii (3–10 dni narracji) zamiast pojedynczych reklam |
| **`26-reklamy-dla-kowalskiego.md`** | Reklamy pisane językiem Kowalskiego (bez korpo-bullshitu) |
| **`27-scenariusz-rozmowy-telefonicznej.md`** | 🆕 📞 Pełny scenariusz cold-callingu B2B — 4 segmenty, 6 kroków, SMS follow-up |
| **`28-obsluga-obiekcji-telefon.md`** | 🆕 📞 Biblioteka 30 obiekcji telefonicznych z gotowymi odpowiedziami |
| **`29-lista-firm-do-dzwonienia.md`** | 🆕 📞 Skąd brać firmy (CEIDG/KRS/Maps/LinkedIn), CRM w Sheets, kalendarz tygodnia |
| **`30-brief-dla-helpera.md`** | 🆕 📄 Brief dla osoby dzwoniącej — źródło dla PDF-a (można wysłać też jako MD) |
| **`31-umowa-zlecenie-helper.md`** | 🆕 ⚖️ Szablon umowy zlecenie dla helpera + uwagi prawne (ZUS, PIT, RODO) |
| **`32-system-motywacyjny-helper.md`** | 🆕 💰 Stawki, bonusy progowe, gamifikacja, anty-motywacja, scale-up zespołu |
| **`MapJob-Brief-Helpera.pdf`** | 🆕 📄 **Gotowy PDF (13 stron) do wysłania osobie, która będzie dzwonić** |
| **`_generate_brief_pdf.py`** | Generator PDF-a (edytuj .md → uruchom `python reklama/_generate_brief_pdf.py` → nowy PDF) |

---

## 🚀 Kolejność działań

### Dzień 1 — przygotowanie techniczne (2–3h)

1. **Pixel** → otwórz [`04-pixel-kod.html`](04-pixel-kod.html), wklej Pixel ID z Meta Business, podmień snippet w `index.html`
2. **Eventy** → według [`05-pixel-eventy.md`](05-pixel-eventy.md) dodaj 4 eventy konwersji (Lead, CompleteRegistration, InitiateCheckout, Purchase)
3. **Consent mode** → dostosuj logikę zgód marketingowych (RODO — ładowanie Pixel dopiero po zgodzie)
4. **Deploy** → wrzuć zmiany na produkcję, poczekaj 24h aż Pixel zacznie zbierać dane
5. **Polityka prywatności** → zaktualizuj sekcję o narzędziach marketingowych (obecnie mówi że Pixel **nie** jest wdrożony)

### Dzień 2 — kreacje (2–3h)

6. **Kreacje graficzne** → otwórz [`10-kreacje.html`](10-kreacje.html) w Chrome, zrób 8 screenshotów 1080×1080 (albo DevTools → Capture node screenshot)
7. **Wideo** → według [`03-video-scenariusze.md`](03-video-scenariusze.md) nagraj 2 screenrecord z apki (video #1 „Klik Google" + video #4 „AI Kreator CV") — ~1,5h pracy
8. **Animacja Canva** → video #2 „Mapa ożywa" w szablonie Instagram Reel — ~1h

### Dzień 3 — kampania

9. **Ads Manager** → postępuj według [`06-ads-manager-setup.md`](06-ads-manager-setup.md)
10. **Struktura:** 1 Campaign „MapJob-A-Fachowcy" → 6 Ad Setów geo → po 1 reklamie (A1) na start
11. **Copy** → wklej z [`01-kampania-A-fachowcy.md`](01-kampania-A-fachowcy.md)
12. **Targetowanie** → według [`07-targetowanie.md`](07-targetowanie.md) — Saved Audience „Fachowcy PL"
13. **Budżet** → 50 zł/dzień (20 PL + 6×5 miasta), zasady w [`08-budzet-skalowanie.md`](08-budzet-skalowanie.md)

### Dzień 7 — pierwsza optymalizacja

14. **Analiza CPL** per ad set geograficzny
15. **Wyłącz** 2 najsłabsze miasta (CPL > 25 zł)
16. **Skaluj** 2 najlepsze (+30% budżetu)
17. **Uruchom Kampanię B** (klienci) — 15 zł/dzień dla B1 + B2
18. **Dorzuć wariant B** headline do zwycięskiego ad setu

### Dzień 14 — retargeting

19. Sprawdź czy masz ≥ 1 000 odwiedzających w bazie Custom Audiences
20. Uruchom R1 (Abandoned Checkout) + R5 (Post-reg upsell) — zgodnie z [`09-retargeting.md`](09-retargeting.md)
21. Budżet retargeting: 20 zł/dzień (10 zł R1 + 10 zł R5)

---

## 💰 Budżet — wersja startowa „lean"

- **Tydzień 1 (test):** 50 zł/dzień = **350 zł/tydz.**
- **Tydzień 2 (optymalizacja):** 70 zł/dzień = **490 zł/tydz.**
- **Tydzień 3 (retargeting):** 100 zł/dzień = **700 zł/tydz.**
- **Tydzień 4+ (skalowanie):** 150–300 zł/dzień
- **Miesiąc 2+:** skaluj do 500–1 000 zł/dzień, jeśli CAC < LTV/3

**KPI przez pierwszy miesiąc:**
- **CPL** (rejestracja): **< 15 zł** na start, celuj w < 8 zł po 4 tyg.
- **CAC** (aktywacja Plan Pro): **< 100 zł** na start, celuj w < 60 zł
- **ROAS** po 30 dniach: **> 1.5**, po 60 dniach: **> 2.0**

---

## 🎯 Strategia w jednej linii

> „Fachowcy w Polsce mają dość OLX, Oferii, Fixly i ulotek.
> MapJob to polska mapa, na której klient znajduje fachowca sam — bez prowizji, bez kredytów, bez pośredników.
> Logowanie Googlem w 2 sekundy. Pierwszy pin 0 zł.
> Reklamy pokazują **produkt w lustrze** — bez wymyślonych liczb."

Każda reklama = **konkretna cecha + niska frykcja + porównanie z alternatywą + proste CTA**.

---

## ⚠️ Czego NIE robimy — reguły pilnowane

1. **Zero fake'owych liczb** — dopóki właściciel MapJob nie potwierdzi realnych statystyk (X użytkowników, Y zleceń), nie piszemy ich w copy ani w kreacjach
2. **Zero fake'owych testymoniali** — żadnych „Marek z Krakowa", „Zbyszek z Gdańska" bez zgody realnej osoby na piśmie
3. **Zero fake'owej scarcity** — żadnych „127 z 500 miejsc" bez realnego licznika w Stripe / admin panelu
4. **Zero kwot zarobków** — „zarób 85 000 zł w tydzień" jest zabronione (UOKiK ustawa o nieuczciwych praktykach rynkowych + Meta „misleading")
5. **Zero stockowych zdjęć** uśmiechniętych panów w garniturach — fachowcy z Polski rozpoznają fake
6. **Zero tekstu > 125 znaków w headline** — Meta tnie na mobile
7. **Zero Advantage+ na starcie** — algorytm potrzebuje 50+ konwersji żeby się nauczyć
8. **Nie zmieniamy aktywnych reklam** przez pierwsze 4 dni — resetuje learning phase
9. **Nie wysyłamy klientów na rejestrację** — mają lecieć na `/?view=map` (widzą value proposition od razu)
10. **Nie promujemy „aplikacji"** — promujemy rezultat („klient pisze wprost"), nie sam fakt istnienia apki

---

## 📞 Co zrobić gdy coś nie działa

| Problem | Najczęstsza przyczyna | Fix |
|---------|----------------------|-----|
| **Brak wyświetleń** | Budżet za niski (< 5 zł/dzień/ad set) ALBO targetowanie za wąskie | Min. 6 zł/dzień, audience min. 200k |
| **Wysoki CPM** (> 25 zł) | Audience za wąski lub konkurencja | Rozszerz wiek ±5 lat, dodaj miasto |
| **Wysoki CPC, niski CTR** (< 1%) | Słaba kreacja / hook | Zmień pierwsze 3 słowa, przetestuj wariant B |
| **Wysoki CTR, niski CR** | Problem na landing page | Uprość ścieżkę, popraw szybkość ładowania |
| **Dużo rejestracji, zero subskrypcji** | Onboarding / paywall słabe | Dodaj retargeting na Pricing (plik 09) |
| **Reklama odrzucona** „misleading" | Słowa „gwarantowane", „100%", konkretne kwoty | Usuń z headline, złóż ponownie |

---

## 🧭 Roadmapa 60 dni

| Tydzień | Skala | Cel |
|---------|-------|-----|
| **T1** | 50 zł/d | Uczenie się: jakie miasta/kreacje działają |
| **T2** | 70 zł/d | Skalowanie 2 winnerów, klienci włączeni |
| **T3** | 100 zł/d | Retargeting aktywny (R1 + R5) |
| **T4** | 150 zł/d | Wszystkie 5 ścieżek retargetingu |
| **T5–T6** | 200–300 zł/d | Rotacja kreacji, dorzucenie wideo #3, #4 |
| **T7–T8** | 400–500 zł/d | CBO + Lookalike z realnej bazy (jeśli 100+ kont) |

---

## 📚 Czytaj w tej kolejności (jeśli widzisz to pierwszy raz)

1. [**11-checklist-startowy.md**](11-checklist-startowy.md) — „co zrobić najpierw, krok po kroku"
2. [**01-kampania-A-fachowcy.md**](01-kampania-A-fachowcy.md) — 8 reklam podstawowych + dlaczego taki copy
3. [**04-pixel-kod.html**](04-pixel-kod.html) + [**05-pixel-eventy.md**](05-pixel-eventy.md) — techniczny setup
4. [**06-ads-manager-setup.md**](06-ads-manager-setup.md) — konfiguracja Ads Managera
5. [**10-kreacje.html**](10-kreacje.html) — eksport 8 obrazków do wklejenia

Kreacje rozbudowane (tydzień 2+):
6. [**12-reklamy-dodatkowe.md**](12-reklamy-dodatkowe.md) — 10 dodatkowych reklam (A9–A14, B5–B8)
7. [**13-prompty-ai-zdjec.md**](13-prompty-ai-zdjec.md) — prompty AI dla zdjęć reklamowych (Midjourney/Flux)
8. [**14-scenariusze-filmowe.md**](14-scenariusze-filmowe.md) — 6 scenariuszy wideo z detalami produkcji

Zaawansowane (miesiąc 2+):
9. [**15-reklamy-rozszerzone.md**](15-reklamy-rozszerzone.md) — 14 dodatkowych reklam emocjonalnych i sezonowych
10. [**19-customer-personas.md**](19-customer-personas.md) — 7 głębokich person (użyj przed pisaniem nowej reklamy)
11. [**21-landing-pages.md**](21-landing-pages.md) — dedykowane landingi per persona

Platformy dodatkowe (miesiąc 2–3):
12. [**16-google-ads.md**](16-google-ads.md) — Google Search + YouTube + Display
13. [**17-tiktok-linkedin.md**](17-tiktok-linkedin.md) — TikTok Ads + LinkedIn B2B

Content produkcja i automatyzacja (miesiąc 2–6):
14. [**18-ai-video-prompts.md**](18-ai-video-prompts.md) — AI video (Runway/Sora/Pika)
15. [**20-email-onboarding.md**](20-email-onboarding.md) — email funnel po rejestracji
16. [**22-sezonowy-kalendarz.md**](22-sezonowy-kalendarz.md) — plan 12-miesięczny

**Razem:** 23 pliki, ~35 000 słów strategicznej treści.

---

## 🎓 Filozofia końcowa

**Lepiej tracić pieniądze na reklamie niż reputację na fake'u.**

MapJob dopiero startuje. Jeśli reklama obieca „85 000 zł po tygodniu", fachowiec wejdzie, zobaczy pustą mapę — i napisze recenzję: „scam, oszustwo, nic nie działa". To kosztuje więcej niż 10 razy stracony CPL.

Uczciwość w reklamie = trust w produkt = niższa churn = wyższy LTV = niższy CAC. **To się opłaca ekonomicznie**, nie tylko moralnie.
