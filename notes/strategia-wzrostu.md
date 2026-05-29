# Strategia wzrostu — MapJob.pl

**Utworzono:** [2026-05-29 | sesja 3]
**Cel:** Zapełnić mapę ofertami + zbudować bazę firm/zleceniodawców

---

## Cel nadrzędny

> "Zapełnić mapę, żeby było dużo projektów pracy do wyboru"
> → Firmy rekrutacyjne + osoby wrzucające zlecenia → ruch szukających pracy

**Obecny baseline:** ~100 użytkowników/dzień

---

## FILAR 1 — Zapełnienie mapy ofertami

### Strategia: Zerowy próg wejścia

Dodawanie ogłoszeń jest BEZPŁATNE. Priorytet to wolumen, nie monetyzacja treści.

### 1A — Pozyskiwanie firm rekrutacyjnych [PRIORYTET]

**Taktyki outbound (aktywne):**
- [ ] Lista 50 agencji rekrutacyjnych w Polsce (Indeed, Pracuj, OLX Praca partnerzy)
- [ ] Cold email/LinkedIn do HR managerów: "Twoje ogłoszenia na mapie za darmo"
- [ ] Pitch: "kandydaci z pre-selekcją po lokalizacji = mniej odpadów"
- [ ] Oferuj integrację techniczną (import przez CSV lub API)

**Taktyki inbound (pasywne):**
- [ ] Landing page dla firm: `mapjob.pl/dla-firm` (już istnieje: `mapjob-dla-firm.html`)
- [ ] SEO dla "dodaj ogłoszenie o pracę za darmo"
- [ ] LinkedIn posty founder content (CEO MapJob)
- [ ] Case study: "Firma X dostała Y aplikacji przez MapJob"

**Quick win:**
- [ ] Import ofert z Pracuj.pl/OLX przez scraping (jak to już robisz z InPost/Otto)
- [ ] Napisać do 10 agencji tygodniowo manualnie na start

### 1B — Pozyskiwanie zleceniodawców

**Kim jest zleceniodawca?**
- Freelancer/firma szukająca podwykonawcy
- Osoba fizyczna z zadaniem do zlecenia (hydraulik, malarz, itp.)
- Firma z projektem IT/kreatywnym

**Taktyki:**
- [ ] Uproszczony formularz dodania zlecenia (mniej pól niż oferta pracy)
- [ ] Landing: "Masz zlecenie? Wrzuć na mapę — znajdź kogoś w okolicy"
- [ ] Grupy Facebook: "Praca zdalna", lokalne grupy biznesowe
- [ ] SEO: "zlecenia [miasto]", "freelance zlecenia mapa"

### 1C — Automatyczny import ofert

**Problem:** Skrypty build_*.py są manualne — bottleneck
**Rozwiązanie:** Automatyczny cron/webhook

- [ ] Cron job co 24h: re-scrape partnerów i aktualizuj oferty w Supabase
- [ ] Weryfikować API tych firm czy udostępniają feed XML/JSON
- [ ] Supabase Edge Function jako scheduler

---

## FILAR 2 — Nowa funkcja monetyzacji: "Podbicie ogłoszenia"

### Specyfikacja produktu [2026-05-29]

**Nazwa:** Podbite ogłoszenie / Wyróżnione ogłoszenie
**Cena:** 15 PLN
**Dostępność:** max 3 miejsca jednocześnie
**Czas:** 1 dzień / 2 dni / 3 dni (do potwierdzenia — patrz Q-BOOST-01)

**Jak działa:**
1. Pracodawca kliknie "Podnieś ogłoszenie" przy swoim ogłoszeniu
2. Wybiera czas trwania (1/2/3 dni)
3. Płaci przez Stripe (15 PLN)
4. Ogłoszenie trafia na TOP listy + wyróżniony pin na mapie
5. Po upływie czasu — wraca na normalne miejsce

**UX ogłoszenia "głównego":**
- [ ] Badge "WYRÓŻNIONE" lub "PILNE" na pinie mapy
- [ ] Sekcja "Wyróżnione oferty" na górze listy (zawsze widoczna)
- [ ] Inny kolor pinu na mapie (np. pomarańczowy vs szary)

**Tech do zrobienia:**
- [ ] Kolumna `boosted_until` (timestamp) w tabeli `job_offers` / `pins`
- [ ] Query: ORDER BY (boosted_until > now) DESC, created_at DESC
- [ ] Stripe checkout dla "boost"
- [ ] Automatyczne wygasanie po czasie
- [ ] Admin: podgląd aktywnych boostów

**Szacunek przychodów:**
- Jeśli 3 miejsca × 2-3 rotacje/tydzień × 15 PLN = 90-135 PLN/tydzień na start
- Przy 10x traffic: 900-1350 PLN/tydzień

---

## FILAR 3 — Wzrost ruchu (szukający pracy)

### 3A — SEO (już działa, rozbudować)

Aktualne: praca-warszawa, praca-holandia, praca-niemcy, praca-produkcja, praca-za-granica, praca-magazynier, praca-trener-personalny

**Do dodania:**
- [ ] praca-krakow, praca-wroclaw, praca-gdansk, praca-poznan, praca-lodz
- [ ] praca-it, praca-logistyka, praca-handel, praca-budownictwo, praca-finanse
- [ ] praca-[firma] (np. praca-inpost, praca-zabka) — long-tail
- [ ] Strony ofert per miasto: "/praca/warszawa/it"

### 3B — Kampanie reklamowe

**Narzędzie:** Skill `ad-copywriter` gotowy do użycia.

**Kolejność uruchamiania:**
1. Facebook/Instagram — B2C (szukający pracy) — TOFU
2. Facebook/Instagram — B2B (firmy) — MOFU  
3. LinkedIn — decydenci HR — BOFU

**Budżet:** Do ustalenia z właścicielem [Q-07]

### 3C — Content i media społecznościowe

- [ ] LinkedIn — founder content (historia MapJob, dane, case studies)
- [ ] "Mapa pracy w Polsce" — raport do pobrania (lead magnet B2B)
- [ ] Grupy na Facebooku z ofertami
- [ ] TikTok? ("Nie wiedziałeś że ta firma jest 5 minut od Twojego domu")

---

## FILAR 4 — Konwersja (kliknięcia → telefony)

**Cel:** Maksymalizować stosunek "wejście na ofertę" → "kliknięcie kontaktu"

**Aktualnie:** System kontaktu bez logowania + modal z prośbą o wzmiankę MapJob.

**Do analizy:**
- [ ] Jaki % użytkowników klika kontakt? (z panelu statystyk)
- [ ] Na którym etapie odpada najwięcej? (lejek w statystykach)
- [ ] A/B test: modal "wzmianka MapJob" — czy nie blokuje konwersji?

**Quick wins:**
- [ ] Wyraźny przycisk "Zadzwoń" widoczny bez scrollowania
- [ ] Czas odpowiedzi pracodawcy (badge "Odpowiada w 24h")
- [ ] Liczba aplikacji jako social proof ("18 osób aplikowało")

---

## Harmonogram działań (priorytetyzowany)

### Tydzień 1-2 (teraz)
1. [!] Odpowiedzi na Q-BOOST-01/02/03 → zaplanowanie UI "podbicia"
2. [ ] Zbudować funkcję "Podbij ogłoszenie" (Stripe + DB + UI)
3. [ ] Outreach do 10 agencji rekrutacyjnych
4. [ ] Dodać 5 nowych miast do SEO landing pages

### Tydzień 3-4
5. [ ] Automatyczny import ofert (cron/webhook)
6. [ ] Landing page B2B ulepszyć (`mapjob-dla-firm.html`)
7. [ ] Pierwsza kampania Meta Ads (B2C awareness)
8. [ ] Founder post na LinkedIn

### Tydzień 5-8
9. [ ] Raport "Geografia Rekrutacji 2026" (lead magnet)
10. [ ] Kampania B2B LinkedIn
11. [ ] Self-service dodawanie firm (formularz bez kontaktu z właścicielem)
12. [ ] Dashboard dla pracodawców (wyświetlenia, kliknięcia ich ogłoszeń)

---

*Wróć do tej strategii przed każdą sesją — sprawdź gdzie jesteś w harmonogramie.*
