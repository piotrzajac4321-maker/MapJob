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
- **NIGDY nie zmieniaj logo które jest już ustawione na stronie** — chyba że użytkownik WPROST o to prosi
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

## Automatyczny proces dodawania logo — W PEŁNI AUTOMATYCZNY

### Jak to działa (zero wysiłku od użytkownika)

Obrazki z chatu są dostępne jako base64 w plikach sesji Claude w:
`/root/.claude/projects/-home-user-MapJob/*.jsonl`

**Użytkownik wysyła logo w chacie → Claude robi wszystko sam:**

1. Wyciąga bajty obrazka z pliku sesji JSONL
2. Rozróżnia logo od screenshotów po rozmiarze (logo < 50 000 znaków base64, screenshot > 200 000)
3. Wstawia logo **inline jako base64** (`data:image/jpeg;base64,...`) w `.trust-strip` w `index.html`
   - NIE jako zewnętrzny plik `/logos/...` — inne logo też są inline base64
5. Commituje i pushuje na `vercel-deploy` → live na mapjob.pl

### Kod do wyciągania logo z sesji

```python
import json, base64, os

project_dir = '/root/.claude/projects/-home-user-MapJob/'
images = []
for fname in sorted(os.listdir(project_dir)):
    if fname.endswith('.jsonl'):
        with open(os.path.join(project_dir, fname)) as f:
            for line in f:
                try:
                    d = json.loads(line)
                    content = d.get('message', {}).get('content', [])
                    if isinstance(content, list):
                        for block in content:
                            if isinstance(block, dict) and block.get('type') == 'image':
                                src = block.get('source', {})
                                if src.get('type') == 'base64':
                                    images.append({'media_type': src['media_type'], 'data': src['data']})
                except:
                    pass

# Logo = mały obraz (< 50000 znaków base64); screenshot > 200000
logos = [img for img in images if len(img['data']) < 50000]
last_logo = logos[-1]
raw = base64.b64decode(last_logo['data'])
# Zapisz: with open('/tmp/[firma].jpg','wb') as f: f.write(raw)
```

### Wstawianie do index.html (homepage)

Sekcja: `.trust-strip` w `index.html` (plik 2.5MB — używaj curl + python, nie MCP).
Wstaw przed: `alt="Platinum Active"></div>\n    </div>` (koniec trust-strip).
Format (inline base64 — tak jak inne logo):
`<div class="trust-logo" title="[Firma]"><img src="data:image/jpeg;base64,[BASE64]" alt="[Firma]"/></div>`

⚠️ Nie używaj zewnętrznego `/logos/[firma].jpg` — embed bezpośrednio jako base64.

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
| `logos/` | Folder z plikami logo firm |

### Jak dodawać logo firmy do sekcji "Zaufali nam"

1. Wyciągnij obraz z sesji (kod wyżej) → zapisz do `logos/[nazwa].jpg`
2. Pobierz `index.html` przez curl (nie MCP — plik 2.5MB)
3. Wstaw `.trust-logo` przed końcem `.trust-strip`
4. Opcjonalnie: dodaj kartę `.firm` w `zaufali-nam/index.html`
5. Pushuj bezpośrednio na `vercel-deploy`
