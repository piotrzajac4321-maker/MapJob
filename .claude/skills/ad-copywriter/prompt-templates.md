# Prompt templates — generatory kreacji reklamowych

Tu masz gotowe prompty do generatorów obrazu (Midjourney v7, DALL·E 3, Ideogram 2, Flux), video (Sora 2, Veo 3, Runway Gen-4) i lektora (ElevenLabs). Każdy prompt ma być **konkretny**: subject, styl, kompozycja, światło, kolor, format, negatywy.

## Anatomia dobrego promptu obrazu

```
[SUBJECT, kto/co, w jakim kontekście]
[ACTION, co robi]
[ENVIRONMENT, gdzie, jaka pora dnia]
[STYLE, fotografia/ilustracja/3D, konkretny kierunek]
[CAMERA, kąt, ogniskowa, głębia ostrości]
[LIGHTING, naturalne/studyjne, ciepłe/zimne]
[COLOR, paleta, dominanta]
[MOOD, emocja]
[COMPOSITION, rule of thirds / centred / negative space]
[FORMAT, --ar 4:5 / 9:16 / 1:1]
[NEGATIVES, --no stock-photo, watermark, text, logo]
```

## Brand guidelines dla generatorów (MapJob)

- Dominanta: **clean, jasne tła, akcent kolorystyczny zgodny z brandem MapJob** (potwierdź u użytkownika — `[ZAŁOŻENIE]: brand color = mapowy niebieski / pinezka).
- Foto-style: **natural light, candid, autentyczne**. Zero korpo-uścisków dłoni. Zero stocków „happy team".
- Geo-elementy: pinezki, mapy, ulice, dzielnice — ale subtelnie, nie dosłownie.
- Lokalność: rozpoznawalne polskie miasta, ale BEZ konkretnych logotypów / brandów konkurencji.

---

## 1. Midjourney / Flux — single image FB feed (4:5)

### Reklama FB-01 (PAS, korki/dojazd)
```
A tired commuter sitting in a car at sunrise, viewed from passenger seat, slight motion blur of brake lights ahead, urban Warsaw highway, 35mm photography, shallow depth of field, golden hour soft light, muted blue-grey palette with warm amber accent, candid documentary style, melancholic mood, vertical composition with negative space at top for text overlay, photorealistic, clean modern editorial look --ar 4:5 --style raw --no watermark, logo, embedded text, stock-photo cliche, fake smile
```

### Reklama FB-02 (BAB, after-state, czas z rodziną)
```
A young parent picking up their child from kindergarten at golden hour, candid moment of laughter, mid-distance shot, residential Warsaw street with autumn trees, natural soft light, warm tones with mint and cream palette, modern documentary editorial style, joyful but understated mood, lots of negative space top-right for headline overlay --ar 4:5 --style raw --no stock cliche, posed studio look, watermark, text
```

### Reklama LI-01 (data-viz, big number)
```
Minimal editorial data visualization: large bold sans-serif number "32%" centered, partially overlaying a faint topographic map of Poland with subtle heatmap gradient (cool to warm blue-orange), ample white space, professional financial-times style infographic, no other text, vector-clean look, brand accent color in highlights --ar 1.91:1 --style raw --no clutter, multiple data viz, illustrations of people, fake charts
```

---

## 2. Sora 2 / Veo 3 / Runway Gen-4 — video Reels (9:16, 15 s)

### Reklama FB-02 — Reels „Aplikujesz na pracę «Warszawa»? Sprawdź gdzie."

```
SHOT 1 (0:00–0:02), 9:16, 24 fps:
Phone screen close-up, finger scrolling a job board UI with repeated entries "IT Developer — Warsaw", crisp UI mock, cool blue-grey tones, slight handheld feel, fluorescent indoor light. Camera: macro 50mm equivalent, slight tilt down. Mood: monotonous.

SHOT 2 (0:02–0:06), 9:16:
Quick zoom-out from phone to a stylized map of Warsaw with 5 location pins scattered far apart across the whole city. Pin animations pop in with soft bounce. Light pastel map style, clean editorial, brand blue accent. Camera: top-down, smooth digital pan. Mood: revealing.

SHOT 3 (0:06–0:11), 9:16:
Same map: a slider UI labeled "do 30 min" appears bottom; as it moves left, pins outside the radius fade out, leaving only 3 nearby pins glowing. Cinematic micro-zoom. Mood: clarity.

SHOT 4 (0:11–0:15), 9:16:
End card: clean white background, MapJob logo center, tagline "Praca, którą widać na mapie." in modern sans-serif, subtle brand color accent, soft fade-in. Mood: confident, calm.

Style across all shots: photoreal UI mocks + 2.5D map animation, clean editorial, no people, focus on product. Color grading: cool blues with warm accent for active pins. Background music: minimal lo-fi beat, low energy until shot 3 where it lifts. No on-screen logos other than MapJob. Aspect: 9:16. Captions burned-in (Polish), bold sans-serif, white with black stroke.

Negative: stock footage of office, generic happy people, watermark, lens flare, sci-fi neon, AI-glitch artifacts.
```

### Reklama LI-02 — Thought Leader founder script

```
SHOT 1 (0:00–0:03):
Founder of MapJob, mid-30s, casual button-up, sitting in a real apartment kitchen / co-working space (NOT studio), morning natural light from a window left, looking directly into camera, talking. Camera: 35mm equivalent, eye level, shallow depth of field. Mood: honest, conversational. Subtle handheld feel.

SHOT 2 (0:03–0:08):
Cutaway: B-roll of phone showing job listing "Warszawa" with no specific address; cut to map view zooming out across Warsaw with pin scattered far. Same color grading.

SHOT 3 (0:08–0:14):
Back to founder, gesturing naturally, talking about the product origin. Subtle camera push-in.

SHOT 4 (0:14–0:18):
End card: founder name lower-third, MapJob logo, "Sprawdź pracę 15 minut od domu", calm fade.

Audio: founder speaks in Polish, native, conversational, NOT scripted-perfect. Background: ambient room tone, no music or very minimal piano.

Captions: burned-in Polish, white sans-serif, modern, bottom third.

Negative: studio lighting, teleprompter feel, suit and tie, corporate office set, stock B-roll, watermark.
```

---

## 3. ElevenLabs / voice gen — voice over briefs

### Lektor VO dla FB-02 Reels (15 s)

```
Voice: Polish, male, 28–34, natural conversational tone, slight urban inflection, Warsaw-Poznań accent neutral, NOT broadcast/announcer voice.

Tempo: moderate-fast, energy 6/10.

Style: like talking to a friend who's complaining about a real problem.

Script (PL):
[0:02] "Aplikujesz na pracę 'Warszawa'?"
[0:04] "Sprawdź gdzie naprawdę jest."
[0:08] "Bo Mokotów to nie Wilanów. A 'IT' to nie adres."
[0:13] "MapJob — praca, którą widać na mapie."

Pacing: micro-pauses between sentences, no rushing the tagline.
Mix: -1 dB to -3 dB compression, presence boost 4–6 kHz +2 dB, subtle reverb (room, 5–8%), nothing dramatic.
```

---

## 4. Prompt template — uniwersalny meta-prompt do generowania reklam

Użyj tego, gdy użytkownik prosi o „kompletną reklamę X dla MapJob":

```
Wygeneruj kompletną reklamę dla MapJob.pl według formatu z SKILL.md, dla:
- platformy: [Facebook | Instagram | LinkedIn | Reels | Stories]
- formatu: [single image | carousel | video | lead form | document ad | thought leader]
- celu: [świadomość | ruch | leady | rejestracja | demo booking]
- persony: [Anna | Marcin | Agnieszka | Tomasz | inna — opisz]
- frameworka copy: [AIDA | PAS | BAB | 4U | FAB | PASTOR — wybierz lub poproś o sugestię]
- etapu lejka: [TOFU | MOFU | BOFU]
- tonu: [empatyczny | data-driven | prowokacyjny | edukacyjny]
- ograniczeń: [SAC Employment | bezpieczne dla brand safety | bez claimów]

Zwróć:
1. Hook (10 wariantów, wybierz top 3 z uzasadnieniem)
2. Primary text
3. Headline (3 warianty A/B)
4. Description
5. CTA button
6. Brief kreatywny (wizual / video script)
7. Prompt do generatora obrazu (Midjourney lub Flux)
8. Prompt do generatora video (Sora 2 lub Veo 3) — jeśli format video
9. Prompt do voice over (ElevenLabs) — jeśli format video
10. Compliance checklist (SAC, claims, RODO)
11. Sugerowane targetowanie i budżet startowy
12. Hipoteza: który wariant powinien wygrać i dlaczego
```

## 5. Anti-patterns w promptach do generatorów

- ❌ „Beautiful, amazing, stunning" — generator i tak chce być ładny, marnujesz tokeny.
- ❌ „4k, 8k, ultra HD" — mit, modele nie zwiększają jakości na takich tagach.
- ❌ „Trending on Artstation" — passé, generuje generic look.
- ❌ Brak negatywów — zawsze daj `--no stock-photo, watermark, fake smile, sci-fi neon`.
- ❌ „Realistic photo of happy people in office" — dostajesz stock cliché.
- ❌ Tekst na grafice w prompcie do MJ/Flux — modele słabo rysują tekst, dodaj go w post-produkcji (Figma, Canva).
- ❌ Logo brandu w prompcie — wstaw je w post, nie ufaj generatorowi.
