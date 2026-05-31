---
name: generuj-prompty
description: Generowanie profesjonalnych promptów do generatorów obrazu i video dla reklam MapJob. Używaj gdy użytkownik potrzebuje prompta do Midjourney, DALL·E, Flux, Ideogram, Sora, Veo, Runway lub briefu dla lektora ElevenLabs.
---

# Skill: Generuj prompty kreacyjne

Tworzysz precyzyjne prompty do generatorów AI dla kreacji reklamowych MapJob. Każdy prompt musi być gotowy do wklejenia — bez edycji.

## Workflow

### Krok 1 — Ustal kontekst (jednym pytaniem jeśli brak)
- Format reklamy i platforma? (FB 4:5 / IG 9:16 Reels / LinkedIn 1200×627 / inne)
- Typ kreacji? (obraz / video / voice over)
- Jaka emocja / scena? (dojazd/ból → korki, praca blisko domu → after-state, dane → heatmapa, produkt → UI/mapa)
- Generator? (Midjourney v7 / Flux / DALL·E 3 / Ideogram / Sora 2 / Veo 3 / Runway Gen-4 / ElevenLabs)

### Krok 2 — Wygeneruj prompt

**Dla obrazu statycznego (Midjourney/Flux/DALL·E/Ideogram):**

Użyj anatomii:
```
[SUBJECT] [ACTION], [ENVIRONMENT], [STYLE], [CAMERA: kąt, ogniskowa, DOF], [LIGHTING], [COLOR: paleta, dominanta], [MOOD], [COMPOSITION], [FORMAT --ar X:X] [QUALIFIERS --style raw] --no [NEGATIVES]
```

**Dla video (Sora 2 / Veo 3 / Runway Gen-4):**

Rozbij na shoty:
```
SHOT [N] ([timecode]), [aspect]:
[Opis sceny: subject, action, environment]
Camera: [ogniskowa, ruch kamery]
Lighting: [typ światła]
Mood: [emocja]
```
Na końcu: `Style across all shots:`, `Color grading:`, `Audio:`, `Captions:`, `Negative:`

**Dla voice over (ElevenLabs):**

```
Voice: [język, płeć, wiek, akcent, ton]
Tempo: [slow/moderate/fast], energy [1–10]
Style: [np. „jak rozmowa z przyjacielem"]
Script (PL): [tekst z timecodeami]
Pacing: [wskazówki pauz]
Mix: [kompresja, EQ, reverb]
```

### Krok 3 — Brand check (zawsze)

Zanim oddasz prompt, sprawdź:
- [ ] Natural light, candid — zero korpo-uścisków dłoni
- [ ] Zero stocków „happy team in modern office"
- [ ] Geo-elementy (pinezki, mapy) są subtelne, nie dosłowne
- [ ] Negatywy zawierają: `stock-photo cliche, watermark, fake smile, embedded text, sci-fi neon`
- [ ] Format (`--ar`) zgadza się z platformą
- [ ] Brak polskich logotypów/brandów konkurencji w prompcie

### Krok 4 — Warianty

Dostarcz min. 2 warianty promptu z różnym:
- kątem kamery lub kompozycją
- tonem emocjonalnym (np. ból vs. ulga)
- porą dnia lub środowiskiem

## Gotowe szablony referencyje

### Obraz FB-feed (4:5) — ból dojazdu
```
A tired commuter sitting in a car at sunrise, viewed from passenger seat, slight motion blur of brake lights ahead, urban Warsaw highway, 35mm photography, shallow depth of field, golden hour soft light, muted blue-grey palette with warm amber accent, candid documentary style, melancholic mood, vertical composition with negative space at top for text overlay, photorealistic, clean modern editorial look --ar 4:5 --style raw --no watermark, logo, embedded text, stock-photo cliche, fake smile, posed scene
```

### Obraz FB-feed (4:5) — after-state (rodzina/dom)
```
A young parent picking up their child from kindergarten at golden hour, candid moment of laughter, mid-distance shot, residential Warsaw street with autumn trees, natural soft light, warm tones with mint and cream palette, modern documentary editorial style, joyful but understated mood, lots of negative space top-right for headline overlay --ar 4:5 --style raw --no stock cliche, posed studio look, watermark, text
```

### Obraz LinkedIn (1.91:1) — data-viz big number
```
Minimal editorial data visualization: large bold sans-serif number "32%" centered, partially overlaying a faint topographic map of Poland with subtle heatmap gradient cool to warm blue-orange, ample white space, professional financial-times style infographic, no other text, vector-clean look, brand accent color in highlights --ar 1.91:1 --style raw --no clutter, multiple data viz, illustrations of people, fake charts, watermark
```

### Video Reels (9:16, 15s) — produkt UI na mapie
```
SHOT 1 (0:00–0:02), 9:16, 24fps:
Phone screen close-up, finger scrolling a job board UI with repeated entries "IT Developer — Warsaw", crisp UI mock, cool blue-grey tones, slight handheld feel, fluorescent indoor light. Camera: macro 50mm, slight tilt down. Mood: monotonous.

SHOT 2 (0:02–0:06), 9:16:
Quick zoom-out from phone to stylized map of Warsaw with 5 location pins scattered far apart. Pin animations pop with soft bounce. Light pastel map style, clean editorial, brand blue accent. Camera: top-down, smooth digital pan. Mood: revealing.

SHOT 3 (0:06–0:11), 9:16:
Same map: slider UI "do 30 min" appears bottom; as it moves left, pins outside radius fade, leaving 3 nearby pins glowing. Cinematic micro-zoom. Mood: clarity.

SHOT 4 (0:11–0:15), 9:16:
End card: clean white background, MapJob logo center, tagline "Praca, którą widać na mapie." modern sans-serif, soft fade-in. Mood: confident, calm.

Style across all shots: photoreal UI mocks + 2.5D map animation, clean editorial, no people, focus on product. Color grading: cool blues with warm accent for active pins. Audio: minimal lo-fi beat, lifts at shot 3. Captions: burned-in Polish, bold sans-serif, white with black stroke. Aspect: 9:16. Negative: stock footage, generic happy people, watermark, lens flare, sci-fi neon, AI-glitch artifacts.
```
