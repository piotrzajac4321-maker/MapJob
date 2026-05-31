---
name: nowa-kampania
description: Kompletna nowa kampania reklamowa dla MapJob.pl — od zera do gotowego copy, briefa kreatywnego i promptów do generatorów. Używaj gdy użytkownik chce stworzyć nową reklamę, kampanię, zestaw reklam lub kompletny brief.
---

# Skill: Nowa kampania reklamowa

Tworzysz kompletną kampanię reklamową. Pracujesz systematycznie przez 5 faz — nie pomijasz żadnej.

## Faza 1 — Brief intake (zbierz lub zaproponuj)

Zadaj MAKSYMALNIE 3 pytania w jednej wiadomości (nie 8 osobnych pytań):

**Pytanie A** — Jedno z poniższych, jeśli nieznane:
- Cel kampanii: rejestracje kandydatów / leady HR / świadomość / ruch?
- Platforma: Meta (FB/IG/Reels) / LinkedIn / obie?

**Pytanie B:**
- Persona: kandydat (Anna/Marcin) czy pracodawca (Agnieszka/Tomasz), czy obie?
- Etap lejka: TOFU / MOFU / BOFU?

**Pytanie C:**
- Format: single image / carousel / video / lead form / document ad?
- Ton: empatyczny / prowokacyjny / data-driven?

Jeśli cokolwiek jest nieokreślone — wypisz [ZAŁOŻENIE] i zaproponuj sensowny default dla MapJob.

## Faza 2 — Generowanie hooków

Wygeneruj **10 hooków** zgodnie z regułami z CLAUDE.md. Nie 5. Nie 3. Dziesięć.
Następnie oceń każdy 1–10 i wybierz 3 najlepsze z uzasadnieniem.

Format oceny:
```
Hook 1: "..."
Ocena: 7/10 — silna identyfikacja, ale brak liczby
Hook 2: "..."
Ocena: 9/10 — pattern interrupt + konkretna liczba ✓
...
TOP 3: #2, #7, #9
```

## Faza 3 — Copy

Napisz pełne copy dla każdej wybranej platformy w formacie z CLAUDE.md (sekcja „Format wyjścia — OBOWIĄZKOWY").

Dla Meta i LinkedIn — **ZAWSZE osobne wersje**. Nigdy 1:1.

## Faza 4 — Brief kreatywny

Dla każdej reklamy dostarcz:
1. **Prompt Midjourney/Flux** (jeśli single image lub carousel)
2. **Script video shot-by-shot** (jeśli video/Reels) — format: `[0:00–0:03] SHOT 1: ...`
3. **Brief ElevenLabs/lektor** (jeśli video z voice over)
4. **Wskazówki post-produkcji** — gdzie dodać tekst, logo, CTA overlay

## Faza 5 — Compliance + plan testów A/B

**Compliance checklist:**
- [ ] SAC Employment: ON / N-A
- [ ] Brak referencji wieku, płci, pochodzenia
- [ ] Brak niesprawdzalnych gwarancji
- [ ] Liczby/cytaty mają wewnętrzne źródło
- [ ] RODO: testimonial = pisemna zgoda

**Plan A/B:**
- Warianty headline (min. 3)
- Warianty CTA (min. 2)
- Hipoteza: który wariant powinien wygrać i dlaczego
- Sugerowany budżet startowy i czas testu

## Zapis kampanii

Na końcu zaproponuj nazwę pliku i zapisz kompletną kampanię w `kampanie/[YYYY-MM-DD]-[platforma]-[cel].md`.
