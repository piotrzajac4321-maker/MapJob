# Realizm — checklista i naprawa artefaktów

Diagnostyka „dlaczego to wygląda jak AI" + konkretne poprawki promptu. Gdy wynik jest słaby, NIE zmieniaj wszystkiego naraz — popraw jedną warstwę i regeneruj.

## Najczęstsze artefakty → naprawa

| Objaw | Przyczyna | Poprawka w promptcie |
|---|---|---|
| Plastikowa/woskowa skóra | „beautiful/perfect skin", brak tekstury | dodaj „fine skin texture, visible pores, peach fuzz, subsurface scattering, no smoothing" |
| Zmieniona twarz (Tryb A) | słaby identity-lock | wzmocnij: „do NOT change the face in any way, keep it pixel-identical to the reference, same eyes, nose, lips, ears" |
| 6 palców / zlepione dłonie | brak opisu dłoni | „anatomically correct hands, exactly five fingers per hand, natural finger separation" |
| Oczy szklane/martwe | brak catchlights | „soft natural catchlights in the eyes, moist realistic eyes" |
| Obraz „za ostry"/HDR | oversharpening | „soft natural light, gentle filmic contrast, no oversharpening, no HDR" |
| Tło płaskie, brak głębi | jeden plan | opisz 3 plany + „shallow depth of field, creamy bokeh, clear sense of depth" |
| Sztuczne światło | brak źródła | nazwij źródło: „single large softbox / window light", kierunek + ratio |
| Dziwne proporcje noworodka | brak etapu | „natural newborn proportions, curled-up pose, realistic head-to-body ratio" |
| Napisy/logo na zdjęciu | brak negatywu | „no text, no watermark, no logo" |

## Bezpieczne pozy noworodka (ważne — wiarygodność marki)

Profesjonalne „trudne" pozy (froggy, tummy, w wiszącym hamaku) w realnej sesji powstają jako **composite z asekuracją** — nie jako pojedynczy kadr bez wsparcia. W promptach generatywnych:

- ✅ Bezpieczne, naturalne: `hands near the face`, `arms resting by the body`, `curled on the side`, `wrapped/swaddled`, `resting in a lined basket`.
- ⚠️ Unikaj sugerowania, że dziecko samo utrzymuje trudną pozę bez podparcia. Jeśli styl tego wymaga (np. „księżyc"), opisz prop jako fizyczne podparcie: `safely nestled and supported on the crescent-moon prop`.
- To nie tylko realizm — to spójność z obietnicą „profesjonalna, bezpieczna sesja".

## Tryb A — hard identity lock (kanon, gdy zwykły lock zawodzi)

Wklej zamiast standardowego prefiksu Trybu A:

> This is image-to-image editing. The baby in the output MUST be the exact same baby as in the uploaded reference — identical face. Preserve the face, head shape, skull proportions, forehead, eyebrows, eye shape and spacing, eye color, nose, nostrils, lips, philtrum, chin, cheeks, ear shape and skin tone with 100% pixel-level fidelity. Do NOT generate a different child, do NOT beautify, slim, smooth, age or symmetrize the face, do NOT change the expression. Keep the exact same crop, pose and head angle as the reference. Only the outfit, props and background may change — the face stays untouched and identical.

Dodaj do listy „Avoid": `different baby, altered facial features, face swap, idealized face, changed eye shape or spacing`. Generuj `count: 4` i wybierz najlepszy wariant.

## Wierność twarzy (Tryb A) — protokół

1. Pierwsza generacja: standardowy identity-lock.
2. Twarz się zmieniła → regeneruj z mocniejszą frazą (tabela wyżej) + niższa „kreatywność" modelu (jeśli dostępna).
3. Nadal źle → ogranicz zmianę: trzymaj kadr/pozę bliżej oryginału, zmień głównie tło/ubranko.
4. Zawsze porównaj twarz wynik vs referencja przed oddaniem klientowi.

## Test końcowy „prawdziwe zdjęcie?" (przejdź zanim oddasz)

- [ ] Skóra ma teksturę (pory, meszek), nie jest gładka jak plastik
- [ ] Dłonie: policz palce, sprawdź brak zrostów
- [ ] Oczy mają catchlight i wilgotny połysk
- [ ] Tło ma głębię i naturalny bokeh, nie „naklejkę"
- [ ] Światło ma jeden logiczny kierunek i miękkie cienie
- [ ] Tryb A: twarz = referencja (oczy/nos/usta/uszy)
- [ ] Brak napisów, znaków wodnych, dziwnych krawędzi
- [ ] Proporcje i poza naturalne dla wieku
