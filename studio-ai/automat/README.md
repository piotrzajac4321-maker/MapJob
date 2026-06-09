# Automat BoboFoto — półautomat obróbki zdjęć

Wsadowa obróbka zdjęć: wrzucasz zdjęcia klientów + manifest zlecenia → automat generuje
warianty „jak ze studia", upscale do druku, kadruje do 3:4/1:1/9:16 i zapisuje do
`output/<zlecenie_id>/` **do Twojej akceptacji**. Ty zatwierdzasz i wysyłasz klientowi.

Napędzane przez **Higgsfield** (model `nano_banana_pro`). Logika w skillach Claude:
- `.claude/skills/foto-prompt-pro/` — silnik ultra-szczegółowych, realistycznych promptów.
- `.claude/skills/bobofoto-automat/` — orkiestracja pipeline'u.

## Jak uruchomić (w sesji Claude z Higgsfield MCP)

1. Skopiuj zdjęcia klienta do `automat/zlecenia/<zlecenie_id>/` (lokalnie — NIE commituj).
2. Stwórz manifest `automat/zlecenia/<zlecenie_id>.json` wg `zlecenie.schema.json`
   (wzór: `zlecenia/przyklad-0001.json`).
3. Poproś Claude: **„uruchom automat na zleceniu <zlecenie_id>"**.
4. Automat: preflight kosztu → generacja → kontrola jakości → formaty → upscale →
   zapis do `output/<zlecenie_id>/` + raport.
5. Przejrzyj wyniki, zaakceptuj, wyślij klientowi.

## Manifest — pola

Pełna schema: `zlecenie.schema.json`. Najważniejsze:
- `tryb`: `A` (na zdjęciu klienta, twarz bez zmian) lub `B` (fikcyjny model — galeria/reklamy).
- `model`, `resolution`, `formaty`, `warianty_na_styl`, `upscale_4k`.
- `pozycje[]`: `referencja` (zdjęcie), `etap` (newborn/sitter/…), `style[]`, `uwagi`.

## Koszty (Higgsfield, zweryfikowane)

- `nano_banana_pro` 2k = **2 kredyty**/obraz
- `nano_banana_2` 1k = **1,5 kredytu**/obraz (podgląd)
- Liczba generacji = `pozycje × style × formaty × warianty`. Automat ZAWSZE robi
  preflight kosztu (`get_cost`) i porównuje z saldem zanim wystartuje.

## ⚠️ Wizerunek i dane osobowe

- Działaj tylko na zdjęciach wgranych i zaakceptowanych przez klienta.
- **Nie commituj** zdjęć realnych klientów ani PII. Foldery zleceń/output są w `.gitignore`
  (wersjonujemy tylko schemę i przykład). Trzymaj zdjęcia lokalnie / w Supabase Storage.
- Zostaw krok akceptacji człowieka przed wysyłką.
