# System Notatek - MapJob.pl

## Struktura folderów

```
notes/
├── README.md                  # ten plik - instrukcja systemu
├── project-overview.md        # stały opis projektu (aktualizowany)
├── implementation-plan.md     # główny plan wdrożenia (sekcje z oznaczeniami)
├── questions.md               # otwarte pytania do właściciela projektu
└── daily-logs/
    └── RRRR-MM-DD.md          # dziennik zmian (jeden plik na dzień)
```

## Zasady prowadzenia notatek

1. **Każdy wpis ma datę i godzinę** w formacie `[2026-05-29 14:30]`
2. **Oznaczenia statusu** w planie wdrożenia:
   - `[ ]` — do zrobienia
   - `[~]` — w trakcie
   - `[x]` — ukończone
   - `[!]` — wymaga decyzji / pytanie do właściciela
3. **Snapshoty git** — commit + push po każdej sesji pracy lub przy dużych zmianach
4. **Dziennik dzienny** — podsumowanie zmian każdego dnia pracy, tworzony automatycznie
5. **Pytania** — jeśli brakuje informacji, wpisywane do `questions.md` i sygnalizowane właścicielowi

## Częstotliwość commitów (snapshoty)

- Po każdej zakończonej sekcji pracy
- Co kilka godzin podczas długich sesji
- Zawsze przed dużymi zmianami (jako "checkpoint")
- Commit message: `[snapshot] RRRR-MM-DD HH:MM - opis zmian`
