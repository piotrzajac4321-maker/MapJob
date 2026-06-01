# PROMPTY DO GENERATORÓW KREACJI — MapJob.pl 2026

Gotowe prompty do wklejenia w generatory AI. Każdy przetestowany pod kątem
anty-wzorców (bez „beautiful", „stunning", „4K", „trending on Artstation").

---

## OBRAZY STATYCZNE

### R2 — Facebook Single Image 4:5 (Midjourney v7 / Flux 1.1 Pro)

```
A tired commuter in a car stuck in morning traffic, viewed from passenger seat perspective,
slight motion blur of red brake lights stretching ahead on a multi-lane Warsaw urban highway,
dashboard clock showing 08:47 AM, pre-dawn golden hour sky glimpse through windshield,
35mm documentary photography style, shallow depth of field focused on dashboard/windshield,
muted blue-grey palette with warm amber brake-light glow, melancholic but relatable mood,
vertical composition 4:5 with clean empty space in upper-left corner for text overlay,
photorealistic, candid editorial look, no people's faces visible, no brand logos
--ar 4:5 --style raw --no watermark, stock-photo cliche, fake smile, visible person face,
logo, embedded text, bright sun, happy mood, studio lighting
```

**Post-produkcja (Figma/Canva):**
- Dodaj tekst: „480h rocznie. Na co?" — Geist Bold lub Inter Black, biały, lewy górny róg
- Logo MapJob — prawy dolny róg, 80% opacity
- Gradient overlay od góry: black 0% → 40% opacity (za tekst)

---

### R3 — Carousel Karta 1, 1:1 (Midjourney / Flux)

```
Minimal flat illustration of a smartphone screen showing a job listing app UI in Polish,
6 identical list entries reading "IT Developer — Warszawa", no addresses shown,
red question-mark location pins floating above a blurred city map background,
clean editorial style, muted grey-blue palette, slight visual frustration metaphor,
square 1:1 format, ample negative space at top for text overlay
--ar 1:1 --style raw --no people, stock cliche, bright colors, detailed faces, watermark
```

### R3 — Carousel Karta 2, 1:1

```
Stylized top-down map of Warsaw city, clean pastel editorial style, showing a route line
from Bielany district to Wilanów district, route line in red with arrow, travel time badge
"1h 22 min" in bold red rectangle, minimal graphic design, flat illustration,
no street labels, only district outlines visible, ample negative space at top
--ar 1:1 --style raw --no realistic photo, people, watermark, complex UI elements
```

### R3 — Carousel Karta 3, 1:1

```
Same stylized top-down Warsaw map from previous card, but now showing a slider UI element
at bottom labeled "do 30 min od domu", most map area greyed out, only 3 location pins
glowing in brand blue remaining near city center, travel time badge "18 min" in green,
clean satisfaction visual metaphor, flat illustration
--ar 1:1 --style raw --no red elements, people, watermark
```

### R4 — LinkedIn Single Image 1.91:1 (Ideogram 2 / Midjourney)

```
Minimal editorial data visualization for a professional HR report cover,
large bold sans-serif number "32%" centered and dominant, partially overlaying
a faint topographic/political map of Poland with subtle heatmap gradient shifting from
cool blue to warm orange concentrated on Warsaw, Kraków, Wrocław, Gdańsk, Poznań,
ample white space around, professional business intelligence aesthetic,
clean vector-style look, no other text elements, warm orange accent in heatmap peaks,
landscape format 1.91:1
--ar 1.91:1 --style raw --no clutter, multiple charts, illustration of people,
fake statistics, watermark, decorative patterns, flags, compass rose
```

---

## VIDEO PROMPTY

### R1 — Reels 9:16, 15s (Sora 2 / Veo 3 / Runway Gen-4)

```
SHOT 1 (0:00–0:02), 9:16, 24fps:
Pure black background. Large white bold sans-serif text appears center screen
in two lines: "Aplikujesz na «Warszawa»?" / "Sprawdź, gdzie naprawdę."
Word-by-word scale-up animation. No other elements. Mood: direct, provocative.
Duration: 2 seconds.

SHOT 2 (0:02–0:06), 9:16:
Close-up of phone screen: minimal job listing app UI showing 5 identical Polish entries
"IT Developer — Warszawa, pełny etat". Finger scrolls down slowly.
Camera pulls back smoothly to reveal stylized top-down map of Warsaw.
5 location pins pop in with bouncy animation, scattered from north to south of city.
Pins in brand blue (#2563EB). Map style: clean pastel, editorial, minimal labels.
Camera: smooth pull-back, 35mm equivalent. Duration: 4 seconds.

SHOT 3 (0:06–0:11), 9:16:
Same Warsaw map. Horizontal slider UI element appears at bottom: "do 30 min od domu".
Slider moves left slowly. Pins outside 30-min radius fade to grey, then disappear.
3 pins near center remain, pulsing with warm glow. Micro-zoom in on remaining area.
Mood: clarity, relief, satisfaction. Duration: 5 seconds.

SHOT 4 (0:11–0:15), 9:16:
Clean white background. MapJob logo fades in at center (placeholder: circular blue pin icon).
Below: text "Praca, którą widać na mapie." in modern sans-serif, brand blue underline.
Soft fade-in, held for 3 seconds. Mood: calm, confident. Duration: 4 seconds.

TECHNICAL:
- Aspect: 9:16 vertical
- Frame rate: 24fps
- Color grade across all shots: desaturated cool blue-grey, warm brand accent (#F97316) for pins
- Transitions: clean cuts, no dissolves
- Burned-in captions: white bold sans-serif, black 2px stroke, bottom third position
- Background music: minimal lo-fi piano, 80 BPM, subtle energy lift in shot 3
- Negative: office stock footage, smiling people, corporate handshakes, watermark,
  lens flare, sci-fi neon glow, AI glitch artifacts, confetti
```

---

## VOICE OVER (ElevenLabs)

### R1 — Reels VO, 15s

```
VOICE SETTINGS:
Language: Polish (PL)
Voice profile: Male, 26–32 years, conversational, Warsaw-neutral accent
Style: NOT broadcast announcer — like explaining something to a friend
Energy: 6/10 (moderate engagement, not hyped)
Pace: moderate-fast with natural micro-pauses between sentences

SCRIPT:
[0:02] „Aplikujesz na pracę «Warszawa»?"
[pause 0.4s]
[0:05] „Sprawdź, gdzie naprawdę jest."
[pause 0.5s]
[0:09] „MapJob — filtruj po dystansie, nie po słowach."
[pause 0.3s]
[0:13] „Praca, którą widać na mapie."

AUDIO SETTINGS:
Compression: -1 to -3 dB
Presence boost: +2 dB at 4–6 kHz
Reverb: Room preset, 5–8% wet
No pitch correction artifacts
Export: WAV 48kHz/24bit, -14 LUFS (social media standard)
```

---

## WSKAZÓWKI POST-PRODUKCJI

### Tekst na grafikach (NIGDY nie ufaj generatorowi z tekstem)

Generatory AI źle renderują tekst. Zawsze dodaj go w:
- **Figma** (zalecane — zachowuje layer structure)
- **Canva** (szybciej, ale mniej kontroli)
- **Adobe Express** (kompromis)

Fonty rekomendowane dla MapJob (zakładam clean sans-serif brand):
- Headline: **Inter Black / Geist Bold** — darmowe, Google Fonts
- Body: **Inter Regular / Medium**
- Fallback: **DM Sans Bold**

### Kolory (dostosuj do brand guidelines MapJob)

```
Brand Blue:    #2563EB (lub potwierdź u klienta)
Brand Orange:  #F97316 (pin/CTA accent)
Text White:    #FFFFFF
Text Dark:     #0F172A
Map Grey:      #94A3B8
Success Green: #22C55E (for "after" states)
```

### Format export

| Placement | Format | Rozmiar | Limit wagi |
|-----------|--------|---------|------------|
| FB/IG Feed | 4:5 JPG/PNG | 1080×1350 | 30 MB |
| FB/IG Reels | 9:16 MP4 H.264 | 1080×1920 | 4 GB |
| FB Carousel | 1:1 JPG/PNG | 1080×1080 | 30 MB |
| LinkedIn SC | 1.91:1 JPG | 1200×627 | 5 MB |
| LinkedIn SC | 4:5 JPG | 1080×1350 | 5 MB |
