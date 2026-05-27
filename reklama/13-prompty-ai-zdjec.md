# Prompty AI do generowania zdjęć reklamowych

**Narzędzia docelowe:** Midjourney v6.1, Flux 1.1 Pro, DALL-E 3, Leonardo.ai Phoenix, Stable Diffusion XL
**Cel:** fotorealistyczne zdjęcia do kreacji reklamowych MapJob — **bez stockowego klimatu**, z polską tożsamością wizualną, bez clichés.

---

## 🎯 Filozofia wizualna MapJob

**Zasady obowiązkowe w każdym zdjęciu:**

1. **Fotorealizm, nie ilustracja** — `photorealistic`, `documentary photography`, `film grain`, nigdy `3D render`, `illustration`, `cartoon`
2. **Polska estetyka** — polskie tablice rejestracyjne, polskie znaki drogowe, polska architektura (nie amerykańska ani niemiecka), polscy modele (europejska karnacja, nie modelki z Instagrama)
3. **Naturalne oświetlenie** — `natural light`, `overcast`, `golden hour`, unikać `studio strobes`, `dramatic lighting`
4. **Emocje autentyczne** — `tired eyes`, `focused`, `concentrated`, **unikać** `smiling`, `happy`, `cheerful` (wygląda jak stock)
5. **Ubranie realistyczne** — polerowane buty robocze, wytarte kombinezony, kurz na dłoniach — **nie** nowiusieńka kamizelka z logo
6. **Bez tekstu w obrazie** — `no text, no watermark, no logo, no captions`
7. **Kobiety i mężczyźni różnorodni** — nie tylko „pan w kasku", także kobiety-techniczki, pary decyzyjne (remont), seniorzy-inwestorzy

---

## 📸 Format promptu (Midjourney / Flux)

```
[subject with action], [setting detail], [lighting], [camera & lens], [style], [mood], [technical quality] --ar 1:1 --v 6.1 --style raw --no text, watermark, logo, illustration, cartoon, 3D
```

**Składowe:**
- `subject` — KONKRETNY (np. „polish electrician in his 40s", nie „man")
- `action` — co robi (trzyma telefon, skręca kabel, patrzy przez okno)
- `setting` — polskie miejsce (blok z wielkiej płyty, chodnik z płytki chodnikowej, warsztat w garażu)
- `lighting` — naturalne (world porannej, szarość pochmurnego dnia)
- `camera & lens` — konkretne (Canon R5 + 85mm f/1.4, Sony A7 IV + 35mm)
- `style` — fotograficzny (documentary, editorial, lifestyle photography)
- `technical quality` — `sharp focus, 4K, professional photography`
- `--ar` — aspekt (1:1 dla feed, 9:16 dla Stories/Reels, 16:9 dla YouTube)
- `--no` — co **odrzucać** (text, watermark, cartoon, zbyt „stockowe" rzeczy)

---

## 🎨 Prompty dla KAMPANII A — Fachowcy (A1–A14)

---

### 📸 REKLAMA A1 — „Klik Google. Pin na mapie."

**Scena:** polski elektryk na budowie, trzyma telefon, ekran pokazuje przycisk „Kontynuuj z Google"
**Mood:** skupiony, nie pozowany
**Użycie:** Instagram/Facebook feed 1:1

**Midjourney / Flux prompt:**
```
Polish electrician in his 30s wearing worn navy work overalls, holding a smartphone with Google Sign-In button visible on screen, construction site background with rebar and cement bags, soft overcast morning light, shot on Canon R5, 85mm f/1.4 lens, documentary photography style, shallow depth of field, photorealistic, film grain, natural colors, focused expression, realistic Polish construction site, --ar 1:1 --v 6.1 --style raw --no text on screen, watermark, cartoon, illustration, 3D render, glossy skin
```

**DALL-E 3 prompt (natural language):**
```
A photorealistic documentary-style photograph of a Polish electrician in his 30s, wearing slightly worn navy-blue work overalls with visible dust, holding a smartphone in his calloused hand. The phone screen shows a Google Sign-In button. Background: a real Polish construction site with rebar, cement bags, and a block of flats. Soft overcast morning light filters through. Shot at 85mm focal length, shallow depth of field, film grain texture, natural skin tones, serious focused expression (not smiling). The style is editorial, documentary — not stock photography.
```

**Wariacje (dla A/B testów):**
- Zamiana płci: „Polish female electrician in her 30s..."
- Zamiana zawodu: „Polish plumber", „Polish welder", „Polish carpenter"
- Zamiana lokalizacji: „small town construction site", „Warsaw suburb renovation"

---

### 📸 REKLAMA A2 — „Koniec OLX i ulotek"

**Scena:** ulotki reklamowe fachowca rozrzucone na bruku przed blokiem z wielkiej płyty, pośród nich telefon z otwartą mapą MapJob
**Mood:** „koniec rozdawania kartek — czas na apkę"

```
Flatlay top-down photograph of scattered Polish handyman flyers on wet concrete pavement (typical Warsaw block of flats exterior with concrete tiles), between the flyers a smartphone lies screen-up showing a map application with location pins, moody overcast sky reflected in puddles, shot from above at 90 degrees, 35mm lens, editorial documentary photography, photorealistic, natural colors, no Photoshop perfection --ar 1:1 --v 6.1 --style raw --no text, watermark, cartoon, illustration, stock photo, shiny, glossy
```

---

### 📸 REKLAMA A3 — „AI Kreator CV w 30 sekund"

**Scena:** ręka fachowca (widoczne zniszczone palce, drobne skaleczenia) trzyma telefon z ekranem kreatora CV, w tle rozmyty warsztat
**Mood:** nowoczesna technologia w dłoni pracującego człowieka

```
Close-up photograph of a Polish tradesman's weathered hands (visible calluses, small cuts, dust), holding a smartphone at chest level, the phone screen showing a CV builder wizard interface (blurred UI elements), background softly out of focus showing a home workshop with tools on pegboard, warm workshop lighting from a window to the left, shot on Sony A7 IV with 50mm f/1.4, shallow depth of field, photorealistic, natural colors, film grain, documentary style --ar 1:1 --v 6.1 --style raw --no text on phone screen, watermark, cartoon, 3D, illustration
```

---

### 📸 REKLAMA A4 — „Bądź pierwszy w swoim mieście"

**Scena:** panorama polskiego średniego miasta (np. Kielce, Radom, Tarnów) z jednym podświetlonym pinem na mapie w górnej warstwie
**Mood:** „dopiero startujemy — to jest Twoja szansa"

```
Aerial photograph of a mid-sized Polish city at dawn (Kielce/Radom-like architecture — mix of communist blocks, post-war buildings, and church spires), soft morning fog rolling through streets, warm sunrise golden hour lighting, shot from a drone at 200m altitude, 24mm wide lens, Canon R5, photorealistic, documentary photography, high dynamic range, natural colors --ar 1:1 --v 6.1 --style raw --no text, watermark, cartoon, illustration, oversaturated
```

**Dodatkowa wersja (mockup apki):**
```
Smartphone held in a Polish tradesman's hand (visible against blurred Polish city panorama), the phone screen shows a simple map interface with a single glowing pin in the center (no other pins), clean minimal UI, golden hour lighting, shot on 85mm, photorealistic, shallow DOF --ar 1:1 --v 6.1 --style raw --no text visible, watermark, cartoon
```

---

### 📸 REKLAMA A5 — „Zero prowizji. Zero kredytów."

**Scena:** split-screen koncepcyjny — jeden fachowiec patrzy sfrustrowany na ekran z „kup 50 punktów za 199 zł", drugi z ulgą odkłada telefon
**Mood:** kontrast frustracji (OLX/Oferia/Fixly) vs spokoju (MapJob)

```
Split composition photograph: left half shows a tired Polish tradesman in his 40s at a kitchen table, frustrated expression, staring at a laptop with a blurred invoice screen visible, empty coffee cup; right half shows the same style of man in same clothing but relaxed, putting down his phone, looking out a window with soft evening light. Both halves photorealistic, natural lighting, editorial documentary style, shot on 35mm, shallow depth of field, film grain, Polish middle-class apartment interior --ar 1:1 --v 6.1 --style raw --no text, watermark, cartoon, illustration, stock photo
```

---

### 📸 REKLAMA A6 — Carousel 3 karty

**Nie generujesz jednego dużego zdjęcia** — 3 oddzielne ikony/symbole. Każdy prompt osobno:

**Karta 1 — Google login:**
```
Minimalist product photograph of a smartphone (Samsung Galaxy style, not iPhone), screen showing a Google Sign-In button in a clean UI, placed on a dark granite countertop with soft natural light from left, shot on 100mm macro lens, photorealistic, editorial product photography, shallow depth of field --ar 1:1 --v 6.1 --style raw --no text on other parts of screen, watermark, cartoon
```

**Karta 2 — Pin na mapie:**
```
Top-down macro photograph of a smartphone showing a map application with a single red pin in the center, the phone resting on a wooden workshop bench with sawdust and hand tools blurred in background, warm workshop light, shot on Canon R5 100mm macro, shallow DOF, photorealistic --ar 1:1 --v 6.1 --style raw --no text, watermark, cartoon, illustration
```

**Karta 3 — Chat:**
```
Close-up photograph of a smartphone screen showing a chat message notification (green tick indicating read), held in a work-calloused hand, background softly blurred showing tools and a construction site, natural evening light, shot on 85mm, photorealistic, film grain, documentary style --ar 1:1 --v 6.1 --style raw --no text readable, watermark, cartoon
```

---

### 📸 REKLAMA A7 — „Apka, która działa offline"

**Scena:** telefon z ikoną MapJob na ekranie głównym (jak normalna apka), ale zamiast emblematu Google Play — symbolizuje PWA

```
Close-up smartphone photograph (Samsung Galaxy S23 or similar Android), home screen visible with a MapJob-style app icon in the top-left of a 4x5 icon grid (generic icon: blue pin on dark navy background), natural soft morning light through a window, held in a tradesman's hand, shot on 100mm, photorealistic, shallow DOF --ar 1:1 --v 6.1 --style raw --no readable text, Google Play logo, App Store logo, watermark, cartoon
```

---

### 📸 REKLAMA A8 — „Każdy user zweryfikowany"

**Scena:** symbol bezpieczeństwa/weryfikacji — nie „tarcza", bardziej konceptualne: zaufanie między fachowcem a klientem (np. uścisk dłoni, ale autentyczny — widoczne dłonie obu osób)

```
Close-up candid photograph of two hands shaking — one hand of a Polish tradesman (weathered, calloused, slight dust) and one hand of a well-dressed client (cleaner, smartwatch on wrist), against a neutral concrete wall background, natural afternoon light from left, shot on 85mm, photorealistic, documentary style, shallow depth of field, film grain --ar 1:1 --v 6.1 --style raw --no faces visible, text, watermark, cartoon
```

---

### 📸 REKLAMA A9 — „Twój profil. Twoje dane."

**Scena:** screenshot apki otwarty na ekranie telefonu, w tle fachowiec w swojej codziennej scenerii (kuchnia, warsztat, samochód)

```
Photograph of a smartphone held by a Polish plumber in his mid-40s, screen shows a blurred profile page interface (generic UI elements — avatar, name field, stats), background is his service van interior (Volkswagen Caddy or Fiat Ducato style) — tools, coiled hoses, invoice book on dashboard, natural daylight through windshield, shot on Sony A7 IV with 50mm, photorealistic, documentary photography, natural colors, film grain --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon, stock photo
```

---

### 📸 REKLAMA A10 — „Plan Pro — gdy darmowy Ci już mało"

**Scena:** złoty badge / premium wizualizacja w kontekście aplikacji

```
Product photograph of a smartphone displaying an app interface with a gold-colored premium badge (circular with star icon) prominently featured, placed on a dark charcoal leather surface, moody side lighting with warm golden accent, shot on 100mm macro, photorealistic, editorial commercial photography, shallow depth of field --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon, 3D render
```

---

### 📸 REKLAMA A11 — „Instaluj bez sklepu Google"

**Scena:** moment instalacji PWA — użytkownik dodaje ikonę apki do ekranu głównego telefonu

```
Close-up photograph of a smartphone screen in the moment of installing a Progressive Web App — system prompt dialog visible ("Add to Home Screen") with a blue app icon preview, held against a soft blurred background of a Polish urban scene (modern city building), natural daylight, shot on 85mm, photorealistic, shallow depth of field --ar 1:1 --v 6.1 --style raw --no readable brand names, watermark, cartoon
```

---

### 📸 REKLAMA A12 — „Porównanie kosztów"

**Scena:** biurko/stół z rozłożonymi fakturami, kalkulator, laptop z tabelą kosztów

```
Overhead flat-lay photograph of a Polish small business owner's desk: printed invoices from various service portals scattered across the surface, a calculator with a partial sum visible (no specific numbers), a laptop with a comparison spreadsheet blurred in background, a cup of coffee, blue ink pen, natural side lighting from a window to the left, shot straight down at 90 degrees on 35mm, photorealistic, editorial documentary style, natural colors, no Photoshop polish --ar 1:1 --v 6.1 --style raw --no readable text, readable numbers, watermark, cartoon, stock photo
```

---

### 📸 REKLAMA A13 — „Mobilny serwis w terenie"

**Scena:** fachowiec wychodzi z samochodu dostawczego, w ręku skrzynka z narzędziami, telefon z powiadomieniem

```
Photograph of a Polish mobile service technician in his 40s stepping out of a white Fiat Ducato van parked on a residential street (typical Polish suburb with blocks of flats and parked cars with Polish license plates visible but blurred), holding a toolbox in left hand and a smartphone in right hand showing a notification badge, overcast afternoon daylight, shot on Canon R5 with 35mm lens, photorealistic, documentary photography, natural colors, motion — he's walking toward the viewer --ar 1:1 --v 6.1 --style raw --no readable license plates, text, watermark, cartoon, logos on van
```

---

### 📸 REKLAMA A14 — „Wracasz z zagranicy"

**Scena:** otwarta walizka z polskim paszportem, telefon z mapą Polski, dokumenty (certyfikaty zagraniczne)

```
Overhead flat-lay photograph: an open travel suitcase on a wooden floor, inside — neatly folded work clothes (blue overalls), a Polish passport (red cover with eagle emblem) partially tucked in, a smartphone showing a map of Poland with a single highlighted pin, a leather document wallet with paper edges sticking out (implying work certificates), warm afternoon window light, shot from directly above at 90 degrees, 24mm wide-angle, photorealistic, editorial lifestyle photography, natural colors, film grain --ar 1:1 --v 6.1 --style raw --no readable text on documents, watermark, cartoon, stock photo aesthetic
```

---

## 🎨 Prompty dla KAMPANII B — Klienci (B1–B8)

---

### 📸 REKLAMA B1 — „Fachowiec w Twojej okolicy"

**Scena:** klient (dowolny wiek, neutralny) patrzy na telefon z mapą fachowców w swoim mieszkaniu

```
Candid photograph of a Polish woman in her mid-30s sitting on a modern sofa in a well-lit living room (IKEA-style Polish apartment), holding a smartphone showing a map application, focused expression, natural afternoon daylight from a large window, shot on Canon R5 with 50mm f/1.8, photorealistic, lifestyle documentary photography, shallow depth of field, natural colors --ar 1:1 --v 6.1 --style raw --no readable text on phone, watermark, cartoon, stock photo smile
```

**Wariacja — mężczyzna:**
```
...Polish man in his 40s sitting at a kitchen table with a coffee cup, morning light, checking his phone...
```

---

### 📸 REKLAMA B2 — „Zobacz realizacje fachowca"

**Scena:** klient ogląda portfolio fachowca na telefonie, w tle jego kuchnia w remoncie

```
Photograph of a Polish couple (man in his 40s, woman in her 30s) standing together in their partially renovated kitchen (half-finished tile wall visible, plastic sheeting on the floor, drill on countertop), looking at a smartphone screen together — woman holds the phone showing a blurred gallery of renovation photos. Natural overcast daylight through a kitchen window, shot on Sony A7 IV with 35mm lens, photorealistic, candid documentary photography, natural expressions (focused, considering) --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon, fake smiles
```

---

### 📸 REKLAMA B3 — „Opublikuj zlecenie — fachowcy zgłoszą się sami"

**Scena:** formularz na telefonie + widoczne powiadomienia od fachowców odpowiadających na zlecenie

```
Close-up photograph of a smartphone on a wooden dining table, screen showing a form with a pulsating notification dot (indicating new responses), next to the phone a cup of tea and a notebook with handwriting, soft evening light from a lamp off-screen, shot on 85mm, photorealistic, shallow depth of field, editorial lifestyle photography --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon
```

---

### 📸 REKLAMA B4 — „Dla firm — znajdź ekipę"

**Scena:** biurko w biurze firmy budowlanej, laptop z mapą otwartą, plany architektoniczne, kask na półce

```
Photograph of a Polish construction company's office desk: a laptop open with a map application visible (blurred screen), architectural drawings rolled and unrolled, a yellow hard hat on the side, a sample of tiles, an engineering notebook with pencil on top, a coffee cup, natural afternoon window light, shot from 45-degree angle at 35mm, photorealistic, editorial business photography, natural colors --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon, stock photo
```

---

### 📸 REKLAMA B5 — „Remont kuchni — wybierz z portfolio"

**Scena:** kuchnia w trakcie remontu + telefon z galerią fachowca

```
Photograph of a half-finished Polish kitchen renovation: new tiles being laid on the wall (you can see the adhesive layer and the partially completed pattern), workspace dust, a small silicone tube on the counter, a smartphone resting on the countertop showing a photo gallery (blurred thumbnails). Warm afternoon light streams through the window, shot on Canon R5 with 35mm, photorealistic, documentary style, natural colors, realistic imperfections (dust, tape residue) --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon, perfectly clean, stock photo finish
```

---

### 📸 REKLAMA B6 — „Pilna awaria? Otwórz mapę"

**Scena:** wyciek wody pod zlewem + telefon z otwartą mapą i czerwonym pinem

```
Photograph from kneeling eye-level: a water leak under a kitchen sink cabinet (visible drop catching container, a wet rag, a slow drip), a smartphone held in the foreground showing a map application with a prominent red pulsing pin, ambient bathroom light, shot on Sony A7 IV with 35mm, photorealistic, candid documentary photography, slight motion blur on water drops --ar 1:1 --v 6.1 --style raw --no readable text on phone, watermark, cartoon, over-staged
```

---

### 📸 REKLAMA B7 — „Buduję dom. Jedna apka, kompletna ekipa."

**Scena:** plac budowy w stanie surowym + telefon z mapą wypełnioną pinami różnych zawodów

```
Wide-angle photograph of a residential construction site in rural Poland (house in shell state — brick walls up, roof in progress, surrounded by farmland), a person in the foreground (Polish man in his 40s, denim jacket) holds a smartphone showing a map with multiple colored pins. Late afternoon golden-hour lighting, shot on Canon R5 with 24mm, photorealistic, documentary photography, natural colors, film grain --ar 1:1 --v 6.1 --style raw --no readable text on phone, watermark, cartoon, stock photo, HDR overprocessing
```

---

### 📸 REKLAMA B8 — „Dla dewelopera"

**Scena:** profesjonalista B2B w biurze, laptop z mapą, kask, rysunki

```
Photograph of a Polish construction project manager (woman in her 40s, business-casual attire with a neutral blouse) in a modern office, seated at a desk with two monitors — one showing a map application (blurred), the other showing a spreadsheet (blurred). A hard hat sits on the shelf behind her, a roll of architectural drawings leans against the desk. Neutral modern office lighting, shot on 50mm, photorealistic, corporate editorial photography, focused expression --ar 1:1 --v 6.1 --style raw --no readable text, watermark, cartoon, stock photo smile, fake teeth
```

---

## 🎨 Prompty UNIWERSALNE (brand assets, nie per-reklama)

### U1 — Hero shot: polski fachowiec w akcji (do landing page albo OOH)

```
Cinematic photograph of a Polish electrician in his mid-30s on a construction site in late afternoon — he's wiring an outlet, focused, slight beads of sweat on forehead, work-worn hands with visible calluses, navy-blue overalls with faded logo, background: warm late-day sunlight streaming through scaffolding onto a construction site with rebar and concrete, shot on Canon R5 with 85mm f/1.4, cinematic color grading (warm golden tones), shallow depth of field, film grain, documentary photography in the style of Sebastião Salgado — authentic, respectful, unposed --ar 16:9 --v 6.1 --style raw --no smile, watermark, cartoon, stock photo, over-saturated
```

### U2 — Mapa Polski z pinami (concept, nie fotograficzne)

```
Abstract conceptual macro photograph: a topographic paper map of Poland (visible relief, mountains in the south, coast in the north) with tiny physical pins placed at major cities (Warsaw, Kraków, Wrocław, Gdańsk, Poznań, Katowice), dramatic side lighting casting long pin shadows, shot on 100mm macro lens, photorealistic, editorial magazine style, muted color palette (sepia + deep blue accents) --ar 1:1 --v 6.1 --style raw --no text, watermark, cartoon, 3D render
```

### U3 — Avatar placeholder (do mockupów apki w reklamach)

```
Studio-style headshot of a Polish tradesperson against a neutral grey background, soft even lighting, neutral expression (not smiling, not frowning), natural skin texture (no beauty retouching), shot on 85mm portrait lens, photorealistic documentary portrait, shallow depth of field, 4K quality --ar 1:1 --v 6.1 --style raw --no smile, watermark, cartoon, stock photo aesthetic, heavy makeup
```

**Wariacje dla różnych zawodów:**
- `Polish male electrician, 40s, short hair, stubble`
- `Polish female tiler, 30s, hair tied back, tired but calm expression`
- `Polish welder, 50s, heavily worn face, grey stubble, blue cap`
- `Polish young plumber, mid-20s, navy overalls, earnest expression`
- `Polish female painter, 40s, splattered apron, strong hands visible`

---

## 🎨 Prompty dla Stories / Reels (9:16 pionowe)

Wszystkie powyższe prompty — zmień `--ar 1:1` na `--ar 9:16`.

**Wariant wideo (dla Reels — pierwsze klatki animacji):**
```
... [jak wyżej] ... cinematic frame, shallow DOF, natural motion blur suggestion, shot for Instagram Reels vertical format --ar 9:16 --v 6.1 --style raw --no text, watermark, cartoon
```

---

## 📊 Workflow produkcji

### Opcja A — Midjourney (najbardziej fotorealistyczne)

1. Discord → #newbies-XX → `/imagine [prompt]`
2. Midjourney generuje 4 warianty — wybierasz najlepszy → `U1` / `U2` / `U3` / `U4` (upscale)
3. Upscale do 4K — `V6.1` daje natywnie 1024×1024, ale możesz poprosić Magnific/Upscayl do 2048×2048+
4. Export PNG → wklej do Canva / Photoshop → dodaj tekst reklamowy (headline + CTA)
5. Upload do Meta Ads Manager

**Koszt:** Midjourney subskrypcja ~30 USD/mies (Basic) = ok. 120 zł

### Opcja B — Flux 1.1 Pro (lepsze dłonie/twarze)

1. Replicate.com albo Leonardo.ai → Flux 1.1 Pro
2. Ten sam prompt co do Midjourney, ale **bez `--ar` i `--v`** (natywne parametry)
3. Aspekt 1:1 / 9:16 ustawiasz w UI
4. Flux dramatycznie lepiej radzi sobie z polskim typem twarzy, dłońmi (6 palców to już nie problem)

**Koszt:** Replicate ~0,05 USD/zdjęcie = ok. 20 groszy. 50 zdjęć = 10 zł.

### Opcja C — DALL-E 3 (najbardziej posłuszny naturalnemu językowi)

1. ChatGPT Plus / API → DALL-E 3
2. Użyj natural language prompt (ten po angielsku pełny zdaniami)
3. DALL-E mniej fotorealistyczny niż Midjourney i Flux — ale lepszy do reklam „product focus" (telefon, UI, minimalizm)

**Koszt:** ChatGPT Plus 20 USD/mies lub API 0,04 USD/zdjęcie.

### Opcja D — Leonardo.ai (tańszy Midjourney z edycją)

1. leonardo.ai → Phoenix model
2. Podobna jakość do Flux
3. Dodatkowo: Leonardo ma „Canvas" do post-editingu (usuwanie obiektów, dodawanie tekstów)

**Koszt:** 10 USD/mies za 8 500 tokenów (~300 zdjęć).

---

## ⚠️ Czego NIE generować w AI (i dlaczego)

1. **Dłonie bez kalorycznego detailu** — sprawdź palce (czasem 6), paznokcie, proporcje. Flux 1.1 lepszy od Midjourney.
2. **Twarze „idealne"** — jeśli model wygląda jak z katalogu FashionNova, odrzuć. Szukamy „zwykłego Polaka" — nie modelek.
3. **Tekst w obrazie** — AI rysuje tekst jako bełkot. **Tekst dodawaj ZAWSZE osobno w Canva/Photoshop** po wygenerowaniu obrazka.
4. **Loga marek** — unikaj „Samsung", „Bosch", „Castorama" w promptach. Powstanie albo nieczytelne, albo prawie-plagiat. Lepiej: „generic Android phone", „workshop pegboard with tools".
5. **Tablice rejestracyjne** — zawsze dopisuj `--no readable license plates`. Generowane tablice są bełkotem, a jeśli przypadkiem trafią na istniejącą tablicę — problem prawny.
6. **Twarze celebrytów** — nie pisz „like [name]". Nawet gdy działa — ryzyko prawne.
7. **Dzieci** — reklamy MapJob nie potrzebują dzieci. Unikamy (problem prawny: wizerunek nieletnich).
8. **Zbyt piękne światło / HDR** — AI ma tendencję do overbakingu. Dopisuj `natural colors, no HDR overprocessing`.

---

## 🔄 Workflow A/B dla zdjęć

Dla każdej reklamy wygeneruj **3 warianty zdjęcia** z różnymi akcentami:

1. **Wariant A (persona-focused):** bohater patrzy w kamerę, portretowo
2. **Wariant B (product-focused):** telefon / mapa dominuje w kadrze, bohater rozmazany w tle
3. **Wariant C (environment-focused):** setting ma większe znaczenie niż osoba (np. budowa zamiast fachowca)

Po 7 dniach testów Meta sama pokaże, który wariant ma wyższy CTR. Pozostałe wyłączamy, zwycięzcę skalujemy.

---

## 💡 Pro-tipy od fotografa reklamowego

1. **Dodawaj konkretne nazwy marek aparatów/obiektywów** — `Canon R5`, `Sony A7 IV`, `Leica Q3`, `Hasselblad X2D` — AI naśladuje ich charakterystyczne „DNA" (głębia, kolor, szum).

2. **Używaj nazwisk fotografów jako stylowych referencji:**
   - `in the style of Sebastião Salgado` → czarno-białe, dokumentalne, portrety pracujących
   - `in the style of Gregory Crewdson` → kinematograficzne, dramatyczne światło, sceniczne
   - `in the style of Wolfgang Tillmans` → surowe, candid, lifestyle
   - `in the style of Rineke Dijkstra` → portretowe studio, neutralna ekspresja

3. **Dla polskiej estetyki** — wspomnij konkretne elementy:
   - `Polish license plates format (blurred)`
   - `typical Warsaw block of flats`
   - `Orlen gas station blurred in background`
   - `Polish mountain range (Tatra Mountains)`
   - `rural Mazovia fields`

4. **Ubranie** — `faded work overalls`, `dust on sleeves`, `callused hands` → przeciwieństwo „stock smiling worker in pristine uniform"

5. **Po wygenerowaniu — obróbka w Lightroom/Canva:**
   - Lekko zejdź z saturation (AI ma tendencję do pompy)
   - Dodaj film grain (preset „Kodak Portra 400")
   - Vignette łagodny
   - Clarity +10 (dla „dokumentalnego" feel)

---

## 📦 Paczka do użycia — „starter 20 zdjęć"

Sugerowana kolejność generowania (zacznij od najważniejszych):

### Dzień 1 (priority):
1. **A1** — elektryk z telefonem (główna reklama startowa)
2. **A3** — AI Kreator CV (killer feature)
3. **B1** — klientka z telefonem (główna reklama klientów)
4. **B2** — para w kuchni w remoncie (redukcja ryzyka)

### Dzień 2 (rotacja):
5. **A2** — ulotki na bruku (koniec OLX)
6. **A11** — PWA / telefon z ikoną (polska technologia)
7. **B5** — kuchnia w remoncie + telefon
8. **B7** — plac budowy + mapa

### Dzień 3 (niszowe):
9. **A13** — mobilny serwisant z busem
10. **A14** — walizka + paszport (expats)
11. **B6** — pilna awaria
12. **B8** — profesjonalistka B2B

### Dzień 4–5 (rezerwa + universal):
13–16. **A4, A5, A9, A12** — carouseł reklamowy
17–20. **U1, U2, U3** + wariacje avatarów (placeholder dla apki)

**Łącznie:** 20 podstawowych zdjęć + 10 wariacji = **30 plików graficznych**.
Koszt na Midjourney: ~150–200 gen'ów × 4 warianty = ~30 USD subskrypcji = **120 zł**.
Czas: 4–6 godzin pracy (prompt → generacja → wybór → upscale → export).

---

## 🎯 Finałowy checkpoint

Zanim wrzucisz zdjęcie do Ads Managera, sprawdź:

- [ ] **Dłonie**: 5 palców, proporcje OK
- [ ] **Twarz**: nie jest plastikowa („plastic skin"), nie uśmiecha się jak z Pinteresta
- [ ] **Tekst**: brak bełkotu na telefonie / koszulce / tle
- [ ] **Loga**: żadne istniejące brand nie „wyciekło"
- [ ] **Tablice rejestracyjne / twarze nieznajomych**: rozmyte lub brak
- [ ] **Polska tożsamość**: setting wygląda PL (bloki, Orlen, płytka chodnikowa), nie US/DE
- [ ] **Naturalne emocje**: bez „Happy Stock Smile"
- [ ] **Aspekt**: 1:1 dla feed, 9:16 dla Stories, 16:9 dla YouTube

Po pozytywnym checku → Canva → dodajesz tekst kampanii → Ads Manager.
