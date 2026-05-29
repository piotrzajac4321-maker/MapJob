# MapJob — Instrukcje dla Claude

## Rejestr Logo

### Zasady bezwyjątkowe

1. **Kiedy użytkownik wyśle logo** → natychmiast opisz je i zapisz wpis w `.claude/logos/README.md` używając nazwy firmy jako nagłówka. Potem commituj i pushuj.
2. **Kiedy użytkownik napisze "opisz PIN-skę" lub "opisz screenshot"** → opisz obraz, ale NIE zapisuj do rejestru.
3. **Kiedy użytkownik napisze "opisz logo [Nazwa Firmy]"** → opisz i zapisz do rejestru pod tą nazwą.
4. Nigdy nie pytaj "czy mam zapisać" — po prostu zapisuj od razu.
5. Nigdy nie pomijaj commita i pusha po dodaniu logo.

### ZAKAZ — nigdy nie rób tego

- **NIGDY nie generuj ani nie twórz logo samodzielnie** (ani SVG, ani CSS, ani żadnej wersji "przybliżonej")
- Jeśli potrzebujesz logo do implementacji a nie masz pliku → zapytaj użytkownika: "Prześlij plik logo lub URL"
- Zmianę logo robi TYLKO użytkownik — nigdy Claude z własnej inicjatywy

### Format wpisu w `.claude/logos/README.md`

```markdown
## [NAZWA FIRMY]

**Opis wizualny:**
- Kształt / ikona: ...
- Kolory: ...
- Typografia: ...
- Styl ogólny: ...

**Uwagi do implementacji:** ...

---
```

### Gdzie szukać logo przy implementacji

Wszystkie opisane logo są w `.claude/logos/README.md`. Zawsze tam zaglądaj przed implementowaniem logo jakiejkolwiek firmy.

---

## Automatyczny proces dodawania logo do strony

### Jak to działa

Obrazek z chatu → Claude **nie ma** dostępu do bajtów pliku, więc nie może sam uploadować.

**Workflow (minimalny wysiłek po stronie użytkownika):**

1. Użytkownik wysyła logo w chacie → Claude opisuje + zapisuje do rejestru
2. Użytkownik wrzuca plik do folderu `logos/` w repo na GitHubie (drag & drop na GitHub.com)
   - Nazwa pliku: `[nazwa-firmy].png` (np. `berker-dominis.png`)
3. Claude **automatycznie**:
   - Pobiera plik z `logos/[nazwa-firmy].png` (URL: `https://raw.githubusercontent.com/piotrzajac4321-maker/MapJob/vercel-deploy/logos/[nazwa].png`)
   - Wstawia `.trust-logo` do `index.html` (sekcja ZAUFALI NAM na stronie głównej)
   - Wstawia kartę `.firm` do `zaufali-nam/index.html`
   - Aktualizuje licznik firm i meta description
   - Commituje i pushuje bezpośrednio na `vercel-deploy` → strona live

### Gdzie wrzucać pliki logo

- **Folder w repo:** `logos/` (branch `vercel-deploy`)
- **GitHub UI:** https://github.com/piotrzajac4321-maker/MapJob/upload/vercel-deploy/logos
- **Format nazwy:** `[nazwa-firmy-lowercase-z-myslnikami].png`

### Supabase storage (backup)

- **Bucket:** `logos` (publiczny)
- **URL pliku:** `https://ahgzjneegvptudphibdm.supabase.co/storage/v1/object/public/logos/[nazwa].png`

---

## Struktura kodu — gdzie jest co

### Repozytorium z kodem strony

- **GitHub:** `piotrzajac4321-maker/MapJob`
- **Branch z produkcyjnym kodem:** `vercel-deploy`
- **Live:** https://map-job.vercel.app

### Kluczowe pliki

| Plik | Co to jest |
|------|-----------|
| `index.html` | Strona główna MapJob |
| `zaufali-nam/index.html` | Podstrona "Zaufali nam" z kartami firm |
| `styles.css` | Globalne style |
| `mapjob-dla-firm.html` | Strona dla pracodawców |

### Jak dodawać logo firmy do sekcji "Zaufali nam"

1. Pobierz `index.html` z brancha `vercel-deploy` (2.5MB — użyj curl + grep/python, nie MCP)
2. Wstaw `.trust-logo` z `<img src="/logos/[nazwa].png">` przed zamknięciem `.trust-strip`
3. Pobierz `zaufali-nam/index.html` i dodaj kartę `.firm` przed wpisami `.demo`
4. Zaktualizuj licznik firm w `.stats` i meta description
5. Pushuj bezpośrednio na `vercel-deploy`
