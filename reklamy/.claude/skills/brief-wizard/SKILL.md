---
name: brief-wizard
description: Interaktywny kreator briefu reklamowego — prowadzi przez wszystkie pytania krok po kroku i produkuje kompletny brief gotowy do oddania do agencji lub użycia z /nowa-kampania. Używaj gdy użytkownik nie wie od czego zacząć, ma tylko ogólny pomysł na reklamę, lub potrzebuje formalnego dokumentu briefu.
---

# Skill: Brief Wizard — kreator briefu krok po kroku

Prowadzisz użytkownika przez budowanie profesjonalnego briefu kampanii. Zadajesz JEDNO pytanie na raz i czekasz na odpowiedź przed przejściem dalej. Nie zalewaj wszystkimi pytaniami naraz.

## Sekwencja pytań

Przejdź przez poniższe pytania PO KOLEI. Dla każdego pytania:
1. Zadaj pytanie
2. Podaj 2–3 przykłady opcji dostosowane do MapJob
3. Poczekaj na odpowiedź
4. Potwierdź zrozumienie jednym zdaniem i przejdź dalej

---

**Q1 — Cel biznesowy**
> „Jaki jest główny cel tej kampanii?"
> Przykłady: więcej rejestracji kandydatów / więcej firm płacących za ogłoszenia / świadomość marki MapJob w nowym mieście / retargeting użytkowników którzy odwiedzili stronę

**Q2 — Persona**
> „Do kogo mówimy?"
> Przykłady: kandydat szukający pracy (B2C) / HR manager / Talent Acquisition Director (B2B) / obie grupy (ale wtedy osobne zestawy reklam)

**Q3 — Etap lejka**
> „Na jakim etapie jest odbiorca?"
> TOFU = nie zna MapJob / MOFU = zna, rozważa / BOFU = był na stronie, nie zarejestrował się

**Q4 — Platforma i format**
> „Gdzie będzie wyświetlana reklama i w jakim formacie?"
> Przykłady: Facebook feed single image / Instagram Reels video 15s / LinkedIn Sponsored Content / wszystkie naraz (ale wtedy oddzielne kreacje)

**Q5 — USP do podkreślenia**
> „Które USP MapJob chcemy wyeksponować w tej kampanii?"
> Opcje: mapa ofert (lokalizacja z góry) / filtr po czasie dojazdu / eliminacja ghost jobs / heatmapy dla HR / porównanie z konkurencją

**Q6 — Ton i styl**
> „Jaki ton ma mieć komunikacja?"
> Przykłady: empatyczny i ciepły (ból dojazdów) / prowokacyjny i bezpośredni (LinkedIn nie powie Ci...) / data-driven i poważny (raporty dla HR) / humorystyczny (memiczny, B2C młodzi)

**Q7 — Ograniczenia i must-have**
> „Czy są jakieś ograniczenia lub elementy obowiązkowe?"
> Przykłady: musi być po polsku / musi mieć konkretny hashtag / nie możemy używać porównań z konkurencją / budżet na testy max X PLN

**Q8 — KPI sukcesu**
> „Jak zmierzymy, że kampania była dobra?"
> Przykłady: CPL < 15 PLN / min. 1000 rejestracji / CTR > 1.2% / ROAS > 3

---

## Po zebraniu wszystkich odpowiedzi

Wygeneruj kompletny dokument briefu:

```markdown
# BRIEF KAMPANII REKLAMOWEJ — MapJob.pl
Data: [data]
Przygotował: [jeśli podane]

## 1. Cel biznesowy
[odpowiedź Q1]

## 2. Persona docelowa
[odpowiedź Q2 + dopasowana persona z CLAUDE.md: Anna / Marcin / Agnieszka / Tomasz]

## 3. Etap lejka
[TOFU / MOFU / BOFU + implikacje dla kreatywności]

## 4. Platforma i format
[odpowiedź Q4 + specyfikacje techniczne z CLAUDE.md]

## 5. Kluczowe przesłanie
[USP z Q5 przetłumaczony na language of benefits]

## 6. Ton i styl
[odpowiedź Q6]

## 7. Ograniczenia
[odpowiedź Q7]

## 8. KPI i definicja sukcesu
[odpowiedź Q8 + benchmarki z CLAUDE.md dla kontekstu]

## 9. Sugerowany framework copy
[rekomendacja na podstawie etapu lejka i celu — z uzasadnieniem]

## 10. Compliance notes
- SAC Employment: [ON/N-A]
- Elementy do sprawdzenia przed publikacją: [lista]

## Następny krok
Brief gotowy do użycia z /nowa-kampania → wklej ten dokument jako kontekst.
```

Zaproponuj zapis pliku jako `kampanie/brief-[YYYY-MM-DD]-[słowo-kluczowe].md`.
