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
