# Otwarte pytania — MapJob.pl

**Ostatnia aktualizacja:** [2026-05-29 | sesja startowa]

---

Poniższe pytania wymagają odpowiedzi właściciela projektu zanim można podjąć dalsze kroki wdrożeniowe.

---

## BLOKUJĄCE (wymagane do rozpoczęcia budowy)

### [Q-01] Co wysłał Twój znajomy?
**Kontekst:** Wspomniałeś o materiale od znajomego, ale nie udostępniłeś go w wiadomości.
**Potrzebne:** Link lub treść/plik do sprawdzenia czy jest użyteczny dla projektu.

### [Q-02] Czy aplikacja webowa MapJob jest już gdzieś budowana?
**Kontekst:** Obecne repo zawiera tylko skille Claude Code (marketing). Nie ma żadnego kodu aplikacji.
**Opcje:**
- a) To jest nowy projekt i wszystko zaczynamy od zera
- b) Jest inny repozytory z kodem aplikacji (podaj link/nazwę)
- c) Kod jest gdzieś lokalnie (trzeba go przenieść)

### [Q-03] Jaki frontend stack preferujesz?
**Rekomendacja:** Next.js 15 (React, App Router, SSR/SSG dla SEO)
**Opcje alternatywne:** Remix, SvelteKit, Vue/Nuxt, plain React (Vite)

### [Q-04] Jaki provider map?
**Rekomendacja:** Mapbox GL JS (pełna kontrola, isochrone API dla czasu dojazdu)
**Opcje alternatywne:** Google Maps Platform, Leaflet + OpenStreetMap (darmowy)
**Koszt:** Mapbox ~darmowy do 50k requests/miesiąc, potem $0.50/1000

### [Q-05] Czy Supabase ma być backendem?
**Kontekst:** Supabase MCP jest dostępny w środowisku — wygląda że tak planowane.
**Do potwierdzenia:** Czy masz już konto/projekt na Supabase? Czy mogę się z nim połączyć?

---

## WAŻNE (potrzebne wkrótce)

### [Q-06] Jaki jest cel na MVP i kiedy?
**Kontekst:** Czy masz konkretny termin? (np. "chcę coś działającego za 2 miesiące")
**Priorytet MVP:** Czy zgadzasz się z propozycją z planu wdrożenia?

### [Q-07] Czy masz już makiety/design dla aplikacji?
**Kontekst:** Figma MCP jest dostępny — mogę generować designs, ale jeśli masz coś istniejącego, warto zacząć od tego.

### [Q-08] Jaki model biznesowy / monetyzacja?
**Kontekst:** Plan wdrożenia zakłada panel pracodawcy.
**Pytanie:** Czy pracodawcy płacą za ogłoszenia? Freemium? Subskrypcja?

### [Q-09] Czy masz budżet na reklamy?
**Kontekst:** Skill `ad-copywriter` jest gotowy — możemy zacząć kampanie gdy aplikacja jest online.
**Pytanie:** Jaki miesięczny budżet reklamowy? (Meta Ads + LinkedIn Ads)

### [Q-10] Czy masz dostęp do ofert pracy na start?
**Kontekst:** Platforma potrzebuje treści na starcie (chicken-and-egg problem).
**Pytanie:** Umowy z agregatorami ofert? Scraping? Manualne dodawanie?

---

## MNIEJ PILNE (do omówienia w przyszłości)

### [Q-11] Mobilna aplikacja?
Czy planujemy aplikację iOS/Android obok webowej?

### [Q-12] Jakie branże na start?
IT tylko? Czy wszystkie branże?

### [Q-13] Geograficzny zasięg na start?
Cała Polska? Tylko Warszawa? Kilka miast?

---

*Aktualizuj ten plik gdy dostaniesz odpowiedzi. Zaznacz [ODPOWIEDZIANO] przy pytaniach które zostały rozwiązane.*
