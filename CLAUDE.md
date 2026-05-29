# MapJob — Instrukcje dla Claude

## Rejestr Logo

### Zasady bezwyjątkowe

1. **Kiedy użytkownik wyśle logo** → natychmiast opisz je i zapisz wpis w `.claude/logos/README.md` używając nazwy firmy jako nagłówka. Potem commituj i pushuj.
2. **Kiedy użytkownik napisze "opisz PIN-skę" lub "opisz screenshot"** → opisz obraz, ale NIE zapisuj do rejestru.
3. **Kiedy użytkownik napisze "opisz logo [Nazwa Firmy]"** → opisz i zapisz do rejestru pod tą nazwą.
4. Nigdy nie pytaj "czy mam zapisać" — po prostu zapisuj od razu.
5. Nigdy nie pomijaj commita i pusha po dodaniu logo.

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

1. Pobierz `zaufali-nam/index.html` z brancha `vercel-deploy`
2. Dodaj nową kartę `.firm` do `.grid` — przed wpisami z klasą `.demo`
3. Logo bez pliku graficznego → zrób CSS tak jak Berker Dominis (patrz rejestr)
4. Zaktualizuj licznik firm w `.stats`
5. Zaktualizuj meta description
6. Wypchnij na branch `claude/[nazwa-zadania]`
