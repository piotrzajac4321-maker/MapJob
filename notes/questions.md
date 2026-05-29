# Otwarte pytania — MapJob.pl

**Ostatnia aktualizacja:** [2026-05-29 | korekta po analizie GitHub]

---

> Aplikacja ISTNIEJE i działa na produkcji. Pytania dotyczą dalszego rozwoju.

---

## BLOKUJĄCE — bez tych odpowiedzi nie wiem od czego zacząć

### [Q-01] Jaki jest główny cel na najbliższe 4-8 tygodni?
**Opcje:**
- a) Wzrost ruchu (SEO + reklamy)
- b) Wzrost liczby ofert/firm (partnerzy, self-service)
- c) Wzrost konwersji (UX, funnel, testy A/B)
- d) Nowe funkcje (co konkretnie?)
- e) Naprawienie czegoś co nie działa

### [Q-02] Jaki jest obecny model monetyzacji Stripe?
**Kontekst:** Widzę migrację `launch_promo_500` i highlights. Nie wiem co i ile kosztuje.
**Potrzebne:** Opis pakietów/cen które sprzedajesz pracodawcom.

### [Q-03] Czy pracodawcy mają self-service panel?
**Kontekst:** Widzę skrypty `build_inpost.py`, `build_zabka.py` etc. — to ręczna praca.
**Pytanie:** Czy pracodawca może sam dodać ofertę przez UI? Czy to zawsze manual?

### [Q-04] Jaki jest obecny traffic na stronie?
**Kontekst:** Masz panel statystyk — ile masz użytkowników dziennie/tygodniowo?
**Potrzebne:** Rzut oka na liczby (unikalni, sesje, wyświetlenia ofert).

---

## WAŻNE — potrzebne do optymalizacji

### [Q-05] Jaki provider map jest użyty?
**Kontekst:** Widzę mapę z pinami, ale nie wiem czy to Leaflet, Mapbox, czy Google.
**Ważne dla:** budżetu (Google Maps płatne!), możliwości (izochrone dla czasu dojazdu).

### [Q-06] Czy filtr po czasie/promieniu dojazdu już działa?
**Kontekst:** To jest core feature MapJob ("znajdź pracę blisko domu").
**Pytanie:** Czy user może ustawić "pokaż oferty do 30 min od domu"?

### [Q-07] Czy są aktywne kampanie reklamowe (Meta/LinkedIn)?
**Kontekst:** Skill `ad-copywriter` jest gotowy.
**Pytanie:** Czy wydajemy budżet na reklamy? Ile miesięcznie?

### [Q-08] Jak wygląda pipeline pozyskiwania nowych partnerów?
**Kontekst:** Masz 10+ firm, ale integracja jest manualna (Python scripts).
**Pytanie:** Ile czasu zajmuje dodanie nowej firmy?

---

## MNIEJ PILNE

### [Q-09] Co to jest `launch_promo_500`?
500 darmowych ogłoszeń? 500 zł promo? Coś innego?

### [Q-10] Czy cv-parse używa AI?
Widzę edge function `cv-parse` — czy to parsuje CV przy użyciu modelu językowego?

### [Q-11] Jaki jest plan na mobilną aplikację (iOS/Android)?
Masz PWA — czy planujesz natywną apkę?

### [Q-12] Czy branch `seo-footer-in-menu` jest do scalenia?
Widzę nieścalony branch — czy ta zmiana jest gotowa do wdrożenia?

---

## ODPOWIEDZIANO

*(Tu przenoszę pytania gdy dostanę odpowiedź)*

- [ODPOWIEDZIANO] Q-00: Co wysłał znajomy → Instrukcja workflow dla Claude Code
- [ODPOWIEDZIANO] Q-aplikacja: Czy aplikacja istnieje → TAK, jest na produkcji na Vercelu
