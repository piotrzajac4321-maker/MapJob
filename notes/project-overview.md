# MapJob.pl — Opis Projektu

**Ostatnia aktualizacja:** [2026-05-29 | sesja startowa]

---

## Co to jest MapJob.pl?

Platforma do wyszukiwania pracy oparta na mapie zamiast listy. Główna obietnica: **"Znajdź pracę blisko domu"**.

Zamiast filtrowania po słowach kluczowych, użytkownicy widzą oferty pracy na mapie i mogą filtrować po czasie/odległości dojazdu.

---

## Unikalne Propozycje Wartości (USP)

### Dla szukających pracy (B2C)
- Mapa zamiast listy → widać realne lokalizacje biur
- Filtrowanie po czasie dojazdu (np. "pokaż oferty < 30 min od domu")
- Eliminacja "ghost jobs" — oferty bez adresu odfiltrowane
- Konkretna lokalizacja na mapie zamiast ogólnego "Warszawa"

### Dla pracodawców (B2B)
- Mniejszy odsiew kandydatów przez lokalizację (mniej "a gdzie macie biuro?")
- Lepszy jakościowy dobór — kandydaci wiedzą gdzie będą dojeżdżać
- Heatmapy podaży i popytu (gdzie jest dużo kandydatów, a brakuje ofert)
- Skrócenie time-to-hire (test: -19%)

---

## Personas (grupy docelowe)

| Persona | Wiek | Rola | Główny ból |
|---------|------|------|-----------|
| **Anna** | 31 | UX Designer, mama | 1h 10min dojazdu, brak czasu dla dziecka |
| **Marcin** | 26 | Junior Frontend Dev | Pierwsza praca lokalnie, nie zna okolicy |
| **Agnieszka** | 38 | HR Business Partner | Odsiew po rozmowie przez lokalizację |
| **Tomasz** | 45 | Talent Acquisition Director | Multi-lokalizacje, potrzebuje dywersyfikacji źródeł |

---

## Aktualny stan repozytorium

**Obecny zakres:** Repozytorium zawiera wyłącznie umiejętność Claude Code (`ad-copywriter`) do tworzenia reklam.

### Co jest:
- `.claude/skills/ad-copywriter/` — kompleksowy system tworzenia reklam (Meta Ads + LinkedIn)
  - 8 frameworków copywriterskich (AIDA, PAS, BAB, 4U, FAB, PASTOR, ...)
  - 25 typów hooków
  - Guidelines platformowe (Meta + LinkedIn)
  - 6 gotowych przykładów reklam (3x B2C, 3x B2B)
  - Prompty do generatorów AI (Midjourney, DALL·E, Sora 2, Veo 3, ElevenLabs)

### Czego brakuje (do zbudowania):
- Aplikacja webowa (frontend)
- Backend / API
- Baza danych
- Integracje z mapami
- Panel pracodawcy
- System wyszukiwania ofert

---

## Dostępne Integracje (wykryte w środowisku)

| Serwis | Przeznaczenie |
|--------|---------------|
| **Supabase** | Backend-as-a-Service (baza danych PostgreSQL, auth, API) |
| **Figma** | Design / prototypowanie UI |
| **GitHub** | Kontrola wersji i CI/CD |

---

## Tone of Voice marki

- **B2C:** Konkretny (liczby, metry, minuty), lokalny (nazwy dzielnic), empatyczny, lekko humorystyczny
- **B2B:** Profesjonalny, ale nie korporacyjny, data-driven, storytelling
- Unikać: "rewolucyjny", "lider rynku", ogólników bez danych
- Używać: "mapa", "lokalizacja", "dystans", "czas dojazdu", "realna lokalizacja"

---

## Compliance (ważne!)

- Reklamy rekrutacyjne = **Special Ad Category — Employment** (Meta)
- Zakaz targetowania po: wieku, płci, kodach pocztowych < 24km radius
- Zakaz języka sugerującego preferencje wiekowe/płciowe
- RODO dla testimoniali

---

*Plik aktualizowany przy każdej sesji pracy z projektem.*
