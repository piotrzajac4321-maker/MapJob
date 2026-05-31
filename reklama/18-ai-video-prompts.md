# Prompty AI do generowania wideo reklamowego

**Narzędzia:** Runway Gen-3 Alpha, OpenAI Sora, Pika 1.5, Luma Dream Machine, Kling AI, Minimax
**Cel:** wideo reklamowe generowane przez AI — dla scen trudnych do nagrania „na żywo" (aerial shots, dynamic camera moves, fantazy visualne) oraz dla rapid A/B testing.

**Filozofia:** AI video ≠ zastąpienie realnego nagrania. AI używamy do:
1. **Scenerii trudnych do nagrania** (widok z drona, abstrakty mapy, visuale futuryczne)
2. **Szybkiego prototypowania** — sprawdzasz koncept w 2 minut zamiast w dzień zdjęciowy
3. **B-rollów** (dodatki między głównymi ujęciami nagranymi realnie)

**Czego AI jeszcze NIE robi dobrze (2026):**
- Realistyczne twarze ze spójną osobą przez całe wideo (flicker)
- Ludzkie dłonie w ruchu — wciąż artifakty
- Dokładne tekst na ekranie / UI apki — rysuje bełkot
- Długie sceny > 10 sekund (zwykle limit pojedynczego clipu)

**Dlatego workflow:** **AI generuje 2–5 sekundowe clipy → montaż w CapCut/Premiere** → dodatki do realnego nagrania.

---

## 🎬 Porównanie narzędzi AI video (stan 2026-04)

| Narzędzie | Max długość | Charakterystyka | Koszt | Najlepszy do |
|-----------|-------------|-----------------|-------|--------------|
| **Runway Gen-3 Alpha** | 10s | Kinematyczne, cinema-grade | 15 USD/mies (Standard) | Hero shots, dramatyczne sceny |
| **OpenAI Sora** | 20s | Najbardziej realistyczne | ChatGPT Pro 200 USD/mies | Long-form, realne sceny |
| **Pika 1.5** | 5s | Szybkie, tanie | 10 USD/mies | Quick B-rolls, eksperymenty |
| **Luma Dream Machine** | 5s | Dobre z image-to-video | 30 USD/mies (Pro) | Ożywianie statycznych zdjęć |
| **Kling AI (v1.6)** | 10s | Chińskie — dobry realizm | 10 USD/mies | Ludzie w pracy, sceny dokumentalne |
| **Minimax Hailuo** | 6s | Darmowe w początkach, dobre ruchy | Free / 10 USD/mies | Testy, rapid iteration |

**Rekomendacja budżetowa:** **Runway Gen-3 + Pika + Luma** razem = ~55 USD/mies (~220 zł). Pokryje wszystko.

---

## 📐 Format promptu — uniwersalny

```
[Subject performing action], [setting detail], [camera movement], [lighting], [visual style], [technical quality], [mood] --aspect 16:9 --duration 5s
```

**Składowe kluczowe dla fotorealizmu:**
- **Camera movement** — „static shot", „slow dolly in", „tracking shot", „aerial drone shot"
- **Lens specification** — „35mm lens", „85mm portrait", „wide anamorphic"
- **Film stock** — „shot on Kodak Portra 400", „Alexa 65 cinema look"
- **Motion quality** — „natural motion", „slow motion 60fps", „handheld documentary"
- **Color grading** — „warm tones", „desaturated Nordic palette", „teal and orange"

---

## 🎥 Prompty dla 6 scenariuszy z pliku 14

### Scenariusz #1 „Dzień fachowca" (30s) — ujęcia AI

Potrzebujesz 10 ujęć × 3s. Z tego **4 ujęcia** trudno nagrać w prawdziwym życiu (drone, dramatic lighting) — te generujemy w AI. Reszta (zwykłe sceny pracy) = kręcisz telefonem.

#### Ujęcie 1 (0:00–0:03) — kubek kawy + rozmyta postać

**Runway Gen-3 prompt:**
```
Close-up of a steaming coffee mug on a rustic wooden kitchen table in early morning light, soft warm light from left window, shallow depth of field, background blurred showing a Polish tradesman in navy overalls moving slowly, handheld documentary camera, slight natural motion, shot on Kodak Portra 400 film stock, film grain, warm tones --aspect 9:16 --duration 5s
```

**Jeśli chcesz wariant prostszy (Pika):**
```
Steaming coffee cup on wooden table, morning light, Polish tradesman blurred in background, warm tones, documentary style, 5 seconds
```

---

#### Ujęcie 9 (0:24–0:27) — drone shot miasta Polska

**Runway Gen-3 prompt:**
```
Aerial drone shot flying over a medium-sized Polish city at blue hour, warm street lights turning on one by one, typical Polish architecture — mix of communist block buildings, post-war tenements, and a church spire in the distance, soft evening haze, cinematic wide-angle 24mm equivalent, slow forward dolly movement, natural color grading with teal shadows and orange highlights, Arri Alexa cinema look, 4K quality --aspect 16:9 --duration 10s
```

**Sora prompt (więcej detalu):**
```
A cinematic aerial drone shot of a medium-sized Polish city during the blue hour transition from day to night. Camera slowly flies forward over residential rooftops at 80 meters altitude. Polish architecture details are visible: communist-era apartment blocks with satellite dishes, post-war tenement buildings, one church spire with copper cupola reflecting the last sunlight. Street lamps gradually turning on one by one. Soft evening haze reduces contrast. Natural cinematic color grading with muted teal shadows and warm orange highlights. Shot on Arri Alexa Mini LF with 24mm lens, shallow depth of field from altitude. Natural motion, no CGI flicker.
```

---

### Scenariusz #2 „AI Kreator CV" (15s) — wszystko screenrecord

**NIE używaj AI video** dla tego scenariusza — to screenrecord prawdziwej apki. AI zrobi bełkot zamiast prawdziwego UI. Jedyne, co AI może zrobić: **otwarcie/zamknięcie B-roll** (np. ręka na laptopie z frustracją = AI) → przejście → screenrecord.

**Pika prompt dla opening (2s):**
```
Frustrated Polish man in his 30s sitting at a cluttered desk, staring at a blank Microsoft Word document on a laptop screen, hands hovering over keyboard hesitating, soft window light from left, documentary style, shallow depth of field, 2 seconds
```

---

### Scenariusz #3 „Para przed remontem" (15s)

**Potrzebuję nagrać realnie** (para → trudno generować konsystentnie w AI 15s). Ale **dodatki B-roll generuję AI**.

#### B-roll: zbliżenie na fragment remontu (insert shot)

**Runway prompt:**
```
Extreme close-up of a freshly laid ceramic tile on a bathroom wall, grout lines still wet, a gloved hand smoothing the edge with a spatula, soft natural daylight from a window, macro 100mm lens perspective, shallow depth of field, realistic grout texture with slight moisture shine, documentary photography style --aspect 1:1 --duration 4s
```

---

### Scenariusz #4 „Polska mapa fachowców" (30s brand spot)

**AI idealny dla tego spotu** — sekwencja różnych polskich miast, operatorzy pracy, mapa z pinami. Wszystko generowalne.

#### Ujęcie 1 — Warszawa o świcie

**Runway Gen-3 prompt:**
```
Cinematic aerial drone shot of Warsaw skyline at sunrise, Palace of Culture and Science rising above Vistula river mist, warm golden hour light, slow forward dolly, natural color grading, shot on Arri Alexa, 24mm anamorphic lens, cinematic widescreen, 4K --aspect 16:9 --duration 10s
```

#### Ujęcie 3 — Kraków Wawel

**Runway Gen-3 prompt:**
```
Aerial drone shot of Wawel Castle in Kraków at golden hour, Vistula river reflecting warm light, the castle hill with red tile roofs visible, slow orbit movement around the castle, cinematic natural color, 24mm lens, 4K cinema quality --aspect 16:9 --duration 10s
```

#### Ujęcie 5 — Gdańsk port

**Runway Gen-3 prompt:**
```
Drone shot over Gdańsk historic port, tall ship masts silhouetted against late afternoon sun, Green Gate visible in the background, cranes and maritime atmosphere, slow dolly forward, cinematic color grading, 24mm lens --aspect 16:9 --duration 10s
```

#### Ujęcie 9 — Animacja mapy Polski z pinami

**NIE generuj w AI video** — to wymaga precyzyjnej grafiki (mapa Polski z dokładnymi miastami). Zrób w **After Effects** albo **Canva Pro animation**:
- Mapa Polski SVG
- Piny pojawiają się sekwencyjnie (Warszawa → Kraków → Wrocław → ...)
- Animated with keyframes, Lottie export

**Koszt:** 0 zł (Canva Pro trial) albo 300 zł (freelance After Effects na Fiverr)

---

### Scenariusz #5 „Screenrecord klik Google" — NIE AI

**Wszystko screenrecord.** AI zrobi bełkot zamiast Google OAuth UI.

---

### Scenariusz #6 „60s YouTube pre-roll" z realnym fachowcem

**Większość = realne nagranie** (Marek, prawdziwy fachowiec). AI = **B-rolle + transitions**.

#### B-roll: ulotki rozrzucone na bruku (AKT 1)

**Pika prompt:**
```
Scattered handyman flyers on wet concrete pavement outside a Polish apartment building, typical gray morning, some flyers curling from moisture, slight wind movement, shallow depth of field, documentary style, 3 seconds
```

---

## 🎬 Dodatkowe prompty AI-only (koncepty trudne do realnego nagrania)

### Koncept AI-1 — „Mapa ożywa" (alternatywa do #2 Animacja)

**Cel:** 10-sekundowy visual — mapa Polski, piny pulsują, wszystko dynamic.

**Runway Gen-3:**
```
Cinematic top-down shot of a physical topographic map of Poland on a dark wooden table, tiny glowing red pins slowly placed on major cities (Warsaw, Kraków, Wrocław, Gdańsk, Poznań, Katowice), dramatic side lighting casting long shadows, pins subtly pulsing with warm light, macro cinematography, shallow depth of field, film grain, Kodak Vision3 500T emulation --aspect 16:9 --duration 10s
```

---

### Koncept AI-2 — „Poranna apka" (visually driven, 8s)

**Cel:** atmospheric intro do dowolnej reklamy.

**Sora prompt:**
```
A slow cinematic push-in on a smartphone lying on a kitchen counter next to a steaming coffee mug at 6:30 AM in a Polish apartment. The phone screen gradually illuminates with a soft blue notification. Warm morning light streams through a kitchen window, dust particles visible in the light beam. Background is softly blurred — a Polish IKEA-style kitchen with a hanging pot rack. Shot on Alexa Mini LF with 50mm lens. Natural color grading, film grain, slow-motion motion blur.
```

---

### Koncept AI-3 — „Dłonie w pracy, różne zawody" (montage, 15s)

**Cel:** 4-ujęciowa sekwencja dłoni pracujących (elektryk, hydraulik, glazurnik, stolarz). Po 3s każda.

**Runway prompts (× 4):**

Elektryk:
```
Extreme close-up macro shot of calloused hands screwing a wire into an electrical outlet, warm workshop light from the left, visible dust on hands, shot on 100mm macro, shallow DOF, documentary style, natural colors --aspect 9:16 --duration 3s
```

Hydraulik:
```
Close-up of weathered hands tightening a brass compression fitting on copper pipe, under-sink shot, moody cold blue light, one hand holding a wrench, water drop falling in the background, macro perspective, documentary style --aspect 9:16 --duration 3s
```

Glazurnik:
```
Macro close-up of gloved hand smoothing grout between freshly laid white ceramic tiles, natural bathroom light, slight wetness on grout, focused precise movement, documentary style, cinematic --aspect 9:16 --duration 3s
```

Stolarz:
```
Close-up of sawdust-covered hands guiding a piece of pine wood through a table saw, warm workshop lights, fine sawdust particles in the air, slow motion, macro 100mm, shallow DOF, documentary --aspect 9:16 --duration 3s
```

---

### Koncept AI-4 — „Polska panorama — cztery pory roku" (brand asset, 12s)

**Cel:** uniwersalny backdrop pokazujący „polska mapa przez cały rok".

**Runway prompt:**
```
Cinematic time-lapse aerial shot of the same rural Polish village seen through four seasons — spring green fields with storks, summer golden wheat, autumn red and orange trees, winter snow-covered rooftops. Slow dissolves between seasons, drone altitude 100m, natural cinematic color grading, Arri Alexa look, film grain, 4K cinema quality --aspect 16:9 --duration 12s
```

---

### Koncept AI-5 — „Telefon w dłoni — UI focus" (B-roll dla dowolnej reklamy)

**Cel:** uniwersalne ujęcie telefonu — nakładka dla napisów apki.

**Pika prompt:**
```
Close-up shot of a smartphone held in a Polish tradesman's weathered hand, the screen glowing softly but UI content blurred/abstract, warm golden hour light from left, shallow DOF, background out of focus showing a workshop or construction site, documentary style, 3 seconds
```

**Uwaga:** **zawsze UI blurred** — inaczej AI wymyśli fikcyjne UI, które nie pasuje do prawdziwej apki.

---

## 🎨 Prompty style-based (per scenariusz mood)

### Styl A — „Dokumentalny / Sebastião Salgado"

Dodawaj do każdego prompta:
```
in the style of documentary photography, Sebastião Salgado-inspired, black and white with subtle color tinting, harsh directional light, authentic working hands, no glamour
```

**Użycie:** hero shots z fachowcem w pracy (A1, A18)

### Styl B — „Ciepły kinematograficzny / Tangerine Dream"

```
warm amber color grading, cinematic anamorphic flares, shallow DOF, shot on vintage Cooke lenses, dreamy atmosphere, Kodak Vision3 250D
```

**Użycie:** spot brandowy #4, wieczorne ujęcia

### Styl C — „Surowy nordycki / Nordic neo-realism"

```
cold desaturated color palette with touches of ochre, overcast diffused light, handheld documentary camera, shot on Arri Alexa with Zeiss Supreme Primes, realistic uncomfortable atmosphere
```

**Użycie:** reklamy o problemach (A2 „koniec ulotek", A18 „cash flow") — surowy realizm wzmacnia przesłanie

### Styl D — „Dynamiczny social media / TikTok native"

```
handheld vertical phone shot, natural sunlight, quick camera movements, shallow DOF, authentic not-polished, TikTok native feel, 9:16 aspect
```

**Użycie:** dla TikTok ads (patrz [17-tiktok-linkedin.md](17-tiktok-linkedin.md))

---

## 🎯 Workflow produkcji AI video

### Faza 1 — Image-to-video (rekomendacja)

Lepiej niż text-to-video:

1. **Wygeneruj pierwszą klatkę** w Midjourney albo Flux (bardziej kontrolowalne)
2. **Wrzuć obraz do Runway / Luma / Pika** jako input
3. **Opisz pożądany ruch:** „slow dolly in", „subject walks forward", „camera tilts up"
4. AI animuje Twój obraz, nie wymyśla od zera

**Przykład:**
- Image from Midjourney: prompt A1 z [13-prompty-ai-zdjec.md](13-prompty-ai-zdjec.md) — elektryk z telefonem
- Image-to-video w Runway: prompt „electrician slowly raises his phone to check screen, subtle breath, camera holds steady, shallow DOF, 4 seconds"

**Wynik:** consistent face + realistic motion.

---

### Faza 2 — Iteracja

AI rzadko daje idealny wynik za pierwszym razem. Iteruj:

1. **Generuj 4–6 wariantów** tego samego promptu (różne seeds)
2. **Wybierz najlepszy** → upscale do 4K (Topaz Video AI, 100 USD jednorazowo)
3. **Jeśli ruch nienaturalny** — zmień prompt: dodaj „natural motion", „realistic physics", „no cartoon movement"
4. **Jeśli twarze „plastic"** — dodaj „film grain, skin texture, realistic imperfections"

---

### Faza 3 — Post-produkcja

AI video często wymaga:

1. **Denoising** — Topaz Video AI, Resolve FX Denoise
2. **Color match** — DaVinci Resolve, Color Match node (żeby AI clip pasował do realnego footage)
3. **Motion blur correction** — AI czasem ma „digital look", dodaj lekki motion blur w post
4. **Audio** — AI nie generuje audio synchronicznie. Dodaj SFX z Epidemic / Artlist w post

---

## 💰 Koszty — realistic budgeting

**Miesięczny plan AI video (konto podstawowe):**
- Runway Gen-3 Standard: 15 USD
- Pika Standard: 10 USD
- Luma Pro: 30 USD
- **Razem: 55 USD (~220 zł/mies.)**

**Co dostaniesz za to:**
- Runway: ~120 seconds generation per month
- Pika: ~700 generations 5s każda
- Luma: ~150 generations 5s każda

**Dla MapJob realistyczne użycie:** 15 sekund wideo A1 + 15 sekund A3 + 30 sekund brand spot = **60 sekund finalnego wideo/miesiąc**. To = ~180 sekund wygenerowanych clipów (bo iterujesz 3×). Pokryte w podstawowym planie.

---

## ⚠️ Czego AI video NIE zrobi za Ciebie

1. **Dokładne UI apki** — wygląda jak „bełkot UI"
2. **Spójne twarze > 10s** — flicker, zmiana oczu między klatkami
3. **Dłonie skomplikowane** — wciąż artifakty (2026 to jeszcze problem)
4. **Tekst w obrazie** — totalnie nieczytelne (dodaj w post)
5. **Marki / loga** — odmówi albo zrobi nieczytelne plagiaty
6. **Długie ujęcia** > 10s — nic nie zrobi spójnie

---

## 🎓 Pro-tip: łączenie real footage + AI video

**Strategia mieszana** (najlepsza praktyka 2026):

1. **Real footage** — ujęcia z aktorem/fachowcem, screenrecord apki
2. **AI B-rolls** — drony, zbliżenia dłoni, establishment shots
3. **Motion graphics** — animacja mapy, UI mockups (After Effects / Canva)
4. **Stock footage** — darmowe ujęcia (Pexels, Pond5 free) jako fallback

**Proporcje idealne:**
- 50% real footage (core story)
- 30% AI-generated (B-rolls, trudne sceny)
- 15% motion graphics (mapy, logo, tekst)
- 5% stock footage (generic fillers)

Dzięki temu **koszt produkcji 30-sekundowego reklamowego spotu spada z 5 000–8 000 zł (pro crew) do 800–1 500 zł (solo + AI).**

---

## 📝 Checklist przed użyciem AI video

- [ ] **Twarze** — bez flicker (>8s sceny dziel na krótsze)
- [ ] **Dłonie** — bez 6 palców (zoom-in pomaga)
- [ ] **UI apki** — rozmyte albo realnie nagrane, NIE wygenerowane
- [ ] **Tekst** — brak w generacji, dodaj w post
- [ ] **Marki** — brak widocznych obcych logotypów
- [ ] **Polskie detale** — architektura, tablice rejestracyjne rozmyte lub brak
- [ ] **Ruch naturalny** — bez nadmiernego „slow motion" lub „robot movement"
- [ ] **Aspect ratio** — 9:16 Reels/TikTok, 1:1 Feed, 16:9 YouTube
- [ ] **Długość** — 5–10s per clip (łącz w montażu)
- [ ] **Audio** — dodaj w post, AI nie synchronizuje

---

## 🚀 Start pack — pierwsze 3 wideo AI do nakręcenia

**Tydzień 1:**
1. **Koncept AI-3** „Dłonie w pracy" montage (15s) — uniwersalny B-roll
2. **Koncept AI-5** „Telefon w dłoni" (8s × 3 wariacje) — do wielu reklam
3. **Scenariusz #4 brand spot** ujęcia aerial (Warszawa, Kraków, Gdańsk) → składamy z realnymi clip'ami

**Koszt:** ~40 USD w narzędziach + 4–6h pracy w Runway/Pika + 2h montażu w CapCut = **~150 zł + 1 dzień pracy**.

**Output:** 3 gotowe clipy do testowania na Meta Reels, TikTok, YouTube.
