# MapJob.pl — Opis Projektu

**Ostatnia aktualizacja:** [2026-05-29 | korekta po analizie GitHub]

---

## Co to jest MapJob.pl?

Platforma do wyszukiwania pracy oparta na mapie zamiast listy. Główna obietnica: **"Znajdź pracę blisko domu"**.

Zamiast filtrowania po słowach kluczowych, użytkownicy widzą oferty pracy na mapie i mogą filtrować po czasie/odległości dojazdu.

---

## Aktualny stan — APLIKACJA ISTNIEJE I DZIAŁA

Aplikacja jest wdrożona na produkcji na Vercelu. Branch główny: `vercel-deploy`.

### Stack technologiczny

| Warstwa | Technologia |
|---------|------------|
| **Frontend** | Vanilla HTML + CSS + JavaScript (bez frameworka) |
| **Backend** | Supabase (PostgreSQL + Edge Functions w Deno/TypeScript) |
| **Hosting** | Vercel (build step: `python3 build_seo_landings.py`) |
| **Płatności** | Stripe (webhook edge function) |
| **Mapy** | Mapa interaktywna z pinezkami (prawdopodobnie Leaflet/Mapbox) |
| **PWA** | Service Worker (`sw.js`) |
| **Analityka** | GA4 + Microsoft Clarity + Meta Pixel |
| **SEO** | Auto-generowane landing pages (Python build script) |

---

## Zaimplementowane funkcje (wg migracji i commitów)

### Mapa i oferty
- Interaktywna mapa z pinezkami ofert (`piny`)
- Realtime pins (Supabase Realtime)
- Oferty pracy (`job_offers`) z kontaktem (telefon/WhatsApp/email)
- Zlecenia/przetargi (`tendery`)
- Rate limiting dla zapisów

### Kontakt i aplikacje
- System kontaktu bez logowania (soft-prośba o wzmiankę MapJob)
- Modal "Aplikujesz przez MapJob" przed kontaktem
- Liczniki kliknięć kontaktu i aplikacji

### Użytkownicy i profile
- Profile użytkowników z CV
- Dokumenty CV (parse + write — Edge Functions)
- Portfolio projektów (publiczne)
- Publiczne profile firm

### Statystyki (admin)
- Panel `/statystyki` i `/panel` — tylko dla adminów
- Aktywni online, unikalni 24h/7d, sesje
- Wyświetlenia ofert/pinów/zleceń
- Kraje odwiedzających
- Liczniki kliknięć kontaktu i aplikacji

### Monetyzacja
- Stripe — płatności za ogłoszenia
- Promocja startowa "500" (launch promo)
- Wyróżnione piny (highlights)
- System referralowy

### Marketing i SEO
- Auto-generowane strony SEO (Python): praca-warszawa, praca-holandia, praca-niemcy, praca-produkcja, praca-trener-personalny, praca-za-granica, praca-magazynier
- Sitemap XML
- Schema.org (Organization, JobPosting)
- Favicon (pinezka 🗺️)
- Cookie consent (GDPR — GA4/Clarity/Meta Pixel)
- Polityka prywatności + regulamin

### Push notifications
- Edge Functions: `notify-push` + `push-notify`
- Konfiguracja powiadomień per użytkownik

---

## Partnerzy/firmy już zintegrowane

- **InPost** — oferty pracy (build_inpost.py → _inpost_data.js)
- **Otto** — oferty pracy
- **Randstad** — oferty pracy
- **Żabka** — oferty pracy
- **Żetkama** — oferty pracy
- **Biedronka** — oferty pracy
- **Pramer** — oferty pracy (JSON: oferty-pramer.json)
- **K-K Electric** — profil
- **Platinum Active** — profil
- **Jobwerke** — oferty (oferty-jobwerke.json)

---

## Baza danych — migracje (chronologicznie)

| Data | Migracja | Co dodaje |
|------|---------|-----------|
| 2026-04-20 | profile_cv | Profil + CV |
| 2026-04-22 | client_errors | Śledzenie błędów klienta |
| 2026-04-22 | cv_documents | Dokumenty CV (upload/parse) |
| 2026-04-22 | notification_configs | Config push notyfikacji |
| 2026-04-22 | stripe_event_dedupe | Dedupl. zdarzeń Stripe |
| 2026-04-22 | user_activity | Śledzenie aktywności |
| 2026-05-01 | admin_grants_pins_highlights | Uprawnienia admin |
| 2026-05-01 | referral_notifications | System referralowy |
| 2026-05-01 | user_sessions_ip_hash | Sesje z haszowanym IP |
| 2026-05-02 | fix_push_triggers_auth | Naprawa push triggerów |
| 2026-05-02 | pins_add_email | Email do pinezek |
| 2026-05-04 | fix_highlight_pin_grant | Naprawa wyróżnień |
| 2026-05-04 | pin_write_rate_limit | Rate limiting pinów |
| 2026-05-04 | pins_realtime | Realtime dla pinów |
| 2026-05-04 | portfolio_projects_public_read | Publiczne portfolio |
| 2026-05-04 | profiles_public_view | Publiczne profile |
| 2026-05-10 | profile_enhancements_sprint1 | Rozszerzenia profilu |
| 2026-05-12 | launch_promo_500 | Promo startowe |
| 2026-05-24 | job_offers_contact_phone | Telefon kontaktowy |
| 2026-05-28 | listing_view_counters | Liczniki wyświetleń |

---

## Edge Functions (Supabase)

| Funkcja | Opis |
|---------|------|
| `client-info` | Informacje o kliencie (IP, browser) |
| `cv-parse` | Parsowanie CV (AI?) |
| `cv-write` | Zapis CV |
| `notify-push` | Wysyłka push notyfikacji |
| `pin-write` | Zapis pinezek na mapę |
| `push-notify` | Push notifications (trigger) |
| `stripe-webhook` | Obsługa webhooków Stripe |

---

## Unikalne Propozycje Wartości (USP)

### Dla szukających pracy (B2C)
- Mapa zamiast listy → widać realne lokalizacje biur
- Filtrowanie po czasie dojazdu
- Eliminacja "ghost jobs"

### Dla pracodawców (B2B)
- Mniejszy odsiew kandydatów przez lokalizację
- Heatmapy popytu/podaży
- Skrócenie time-to-hire (test: -19%)

---

## Personas (grupy docelowe)

| Persona | Wiek | Rola | Główny ból |
|---------|------|------|-----------|
| **Anna** | 31 | UX Designer, mama | 1h 10min dojazdu, brak czasu dla dziecka |
| **Marcin** | 26 | Junior Frontend Dev | Pierwsza praca lokalnie |
| **Agnieszka** | 38 | HR Business Partner | Odsiew po rozmowie przez lokalizację |
| **Tomasz** | 45 | Talent Acquisition Director | Multi-lokalizacje, dywersyfikacja źródeł |

---

## Tone of Voice marki

- **B2C:** Konkretny (liczby, metry, minuty), lokalny, empatyczny, lekko humorystyczny
- **B2B:** Profesjonalny, data-driven, storytelling
- Unikać: "rewolucyjny", "lider rynku", ogólników
- Używać: "mapa", "lokalizacja", "dystans", "czas dojazdu"

---

## Compliance

- Meta Ads: **Special Ad Category — Employment**
- Zakaz targetowania po: wieku, płci, kodach pocztowych < 24km
- RODO dla testimoniali

---

*Plik aktualizowany przy każdej sesji pracy z projektem.*
