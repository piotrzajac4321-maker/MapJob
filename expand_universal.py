# -*- coding: utf-8 -*-
"""Dodaje 60 uniwersalnych wpisow (bez persony) do katalogu."""

UNIVERSAL = [
    # ===== PRODUKT - TELEFON STUDIO =====
    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-01", "tytul": "Telefon na bialej cyklorame",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Czysty telefon na bialym cykloramowym tle bez cienia. Light wraparound, soft. Telefon hovers slightly tilted 8 stopni. Pelen MapJob DARK UI.",
     "use_case": "Czysty product shot. Latwo nakladac copy z gory. LinkedIn, display, web banner.",
     "paleta": "Pure white + violet pin glow + cyan CTA accent", "vibe": "Apple Pro product photography",
     "prompt": "Apple Pro product photography. Clean smartphone on pure white seamless cyclorama background, no shadow, light wraparound diffused soft. Phone hovers slightly tilted 8 degrees. 100mm f/4 product lens.\n\nPHONE: MapJob DARK UI - near-black #0A0A14 background, purple #7C3AED briefcase pins across Polska visible into Berlin/Praga, selected pin pulse, cyan #00C8D4 CTA pill 'Otworz pelna mape', blue cluster #3B82F6, emerald top-right.\n\nGrade: pure white + violet glow + cyan as only colors. Composition: phone center, full negative space all sides. NO TEXT. NEGATIVE: no shadow underneath, no environment, no logos beyond MapJob wordmark."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-02", "tytul": "Telefon na czarnym aksamicie",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na ciemnym czarnym aksamicie z subtelnym texture. Single rim light z lewej, deep shadows. Premium product feel.",
     "use_case": "Premium luxury feel, dark mode hero, dla high-end placementow.",
     "paleta": "Black velvet + warm rim + violet glow", "vibe": "Hasselblad luxury product",
     "prompt": "Hasselblad luxury product. Smartphone on dark black velvet with subtle texture. Single warm rim light from left, deep shadows. Premium product feel. 85mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep blacks + warm rim + violet glow. Composition: phone center 60%, velvet texture surround. NO TEXT. NEGATIVE: no environment, no other objects."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-03", "tytul": "Telefon na marmurze",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon na czarnym marble z naturalnymi zylkami. Soft top-down studio light. Premium minimalist.",
     "use_case": "Premium minimalist, B2B-friendly, ekskluzywny vibe.",
     "paleta": "Black marble + white veining + violet phone", "vibe": "minimalist Italian product",
     "prompt": "Minimalist Italian product photography. Smartphone on black marble surface with natural white veining. Soft top-down studio light. 50mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: marble black + cream veining + violet. Composition: phone slightly off-center, marble texture as 70%. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-04", "tytul": "Telefon levitujacy gradient",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon hovering w przestrzeni, soft gradient tlo cream-do-pale-grey. No support visible. Slight tilt for dynamic.",
     "use_case": "Hero shot, brand campaign, klean i nowoczesny.",
     "paleta": "Cream gradient + matte phone + violet pins", "vibe": "Annie Leibovitz x Apple clean",
     "prompt": "Annie Leibovitz x Apple clean editorial. Smartphone alone, floating-suspended, no visible support, against soft cream-to-pale-gray gradient background. Centered, slightly tilted 12 degrees for dynamic composition. 100mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: pale gradient + matte graphite + violet pins + cyan. Composition: phone centered, full negative space. NO TEXT. NEGATIVE: no shadow underneath, no environment."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-05", "tytul": "Telefon w odbiciu lustra",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon na poliszowanej powierzchni odbijajacej go jako mirror duplicate. Both visible in frame. UI legible in both orientations.",
     "use_case": "Poetic duality, dwa swiaty, premium reflection.",
     "paleta": "Polished black + violet phone + cyan rim reflection", "vibe": "Robbie Ryan reflection cinematic",
     "prompt": "Robbie Ryan x Apple reflection cinematic. Phone held over still polished black surface reflecting it upside-down, both visible in frame, screen UI legible in both orientations, hand sleeve a wool dark blue. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: dark polish + violet phone + cyan. Composition: phone upper, reflection lower. Upper-right copy. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-06", "tytul": "Telefon macro screen detail",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Extreme close-up ekranu telefonu wypelnia 85% kadru. Subtle pixel texture. Slight glass perspective. Hero UI shot.",
     "use_case": "UI hero, demo of screen, ekspozycja produktu szczegolowa.",
     "paleta": "Glass black + violet pins + cyan CTA", "vibe": "MKBHD product macro",
     "prompt": "MKBHD x Apple product macro. Ultra close-up of smartphone screen filling 85% of frame, slight perspective tilt. Screen displays MapJob DARK UI in crisp detail - light theme map of Polska/Europa with dense purple pins, selected pin pulse with profile card, cyan CTA pill 'Otworz pelna mape' bottom, wordmark MapJob top, filter chips. Phone edge just barely visible left and bottom, rest pure screen. Thin specular highlight on glass.\n\nGrade: cinematic product, deep blacks, elevated violet. Composition: screen dominant, copy area in upper-left translucent dark bar. NO TEXT in render. NEGATIVE: no hand, no environment."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-07", "tytul": "Telefon z dlugim cieniem",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na jasnej powierzchni, dluga geometric shadow rzucana z hard side-light. Architectural feel.",
     "use_case": "Geometric brand statement, modernistic.",
     "paleta": "Cream surface + violet phone + dark shadow", "vibe": "Andreas Gursky architectural product",
     "prompt": "Andreas Gursky x Apple architectural product. Smartphone on light cream surface, long geometric shadow cast from hard directional side-light. Architectural minimalist feel. 50mm f/8 deep focus.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: cream + crisp violet + dark shadow. Composition: phone left third, shadow extending right two-thirds. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-08", "tytul": "Telefon top-down centered",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon dokladnie z gory na minimalistycznym wood/concrete surface. Symmetric composition. Ring light visible jako subtelny round reflection w corner glass.",
     "use_case": "Magazine-style flat-lay, social-friendly square.",
     "paleta": "Wood/concrete + violet phone + ring light hint", "vibe": "magazine flat-lay editorial",
     "prompt": "Magazine flat-lay editorial. Phone exactly top-down on minimalist wood or concrete surface. Symmetric composition. Ring light visible as subtle round reflection in corner of glass. 50mm f/4 overhead.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm/cool surface + violet phone. Composition: top-down centered, surface texture surrounding. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-09", "tytul": "Telefon z subtle backlight glow",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon w ciemnym tle, subtelny violet glow z tylu phone (rim) tworzacy halo. Minimal product hero z mood.",
     "use_case": "Premium reveal, cinematic product moment.",
     "paleta": "Deep dark + violet rim halo + cyan accent", "vibe": "Apple keynote reveal",
     "prompt": "Apple keynote reveal cinematic. Smartphone in dark space, subtle violet rim-glow from behind phone creating halo. Minimal product hero with mood. 85mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep dark + violet rim + cyan. Composition: phone center, halo radiating, full dark surround. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Telefon studio", "id": "UN-PR-10", "tytul": "Telefon studio chromatic",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Telefon na chromatic gradient tle (violet do cyan), subtle gradient lighting. Modern product editorial.",
     "use_case": "Bold modern hero, social-friendly, brand-aligned palette.",
     "paleta": "Violet-to-cyan gradient + matte phone", "vibe": "modern editorial chromatic",
     "prompt": "Modern editorial chromatic product. Smartphone on chromatic gradient background (violet to cyan transitioning), subtle gradient lighting matching. 85mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: violet-cyan gradient + phone graphite. Composition: phone center, gradient sweep diagonal. NO TEXT."},

    # ===== RECE TYLKO - UNIWERSALNE =====
    {"sekcja": "UNIWERSALNE - Same rece", "id": "UN-RE-01", "tytul": "Reka uniwersalna chwyt z rekawa",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Reka emerging from neutralnego ciemnego rekawa, holding phone at chest height. No skin tone specifics, no rings, no watch. Ungendered, age-neutral.",
     "use_case": "Truly universal grip shot, dla kazdej kampanii.",
     "paleta": "Neutral skin + dark sleeve + violet phone", "vibe": "Apple iPhone reference photography",
     "prompt": "Apple iPhone reference photography. Ungendered adult hand emerging from neutral dark wool sleeve, holding smartphone at chest height. No rings, no watch, neutral skin tone, no specific gender markers, no specific age clue. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: neutral, slight warm. Composition: phone center, hand from below right. NO TEXT. NEGATIVE: no face, no specific skin markers, no jewelry, no watch."},

    {"sekcja": "UNIWERSALNE - Same rece", "id": "UN-RE-02", "tytul": "Dwie rece - jedna trzyma, druga puka",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Jedna reka trzyma telefon, druga reka palce input - tap na ekran. Fingertip mid-tap on selected pin. Both hands neutral, no specific markers.",
     "use_case": "Demonstracja interaction, momentu klikniecia, action.",
     "paleta": "Neutral hands + violet pin pulse + cyan", "vibe": "Apple iPhone interaction demo",
     "prompt": "Apple iPhone interaction demo. One ungendered hand holds smartphone, second hand fingertip mid-tap on screen at the selected pin. Both hands neutral, no specific markers. 100mm macro f/4.\n\nPHONE: MapJob DARK UI - selected pin in pulse animation moment, profile card sliding from bottom.\n\nGrade: neutral + violet pulse + cyan. Composition: phone center, two hands frame. NO TEXT. NEGATIVE: no face, no jewelry."},

    {"sekcja": "UNIWERSALNE - Same rece", "id": "UN-RE-03", "tytul": "Reka siegajaca po telefon na blacie",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon lezy na blacie, neutralna reka siega po niego z gory. Mid-reach moment, palce tuz nad ekranem.",
     "use_case": "Moment podniesienia, decyzji, captured intent.",
     "paleta": "Neutral surface + violet phone glow + cyan", "vibe": "intent moment cinematic",
     "prompt": "Intent moment cinematic. Smartphone lying on neutral wood/concrete surface, ungendered hand reaching down to pick it up from above. Mid-reach moment, fingers just above screen. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec, screen glowing brightly.\n\nGrade: neutral + violet glow + cyan. Composition: phone bottom-center, hand reaching from upper-right. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Same rece", "id": "UN-RE-04", "tytul": "Reka oddajaca telefon (dwa kadry)",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Dwie rece (oba neutralne, ungendered) - jedna podaje telefon, druga przyjmuje. Mid-handoff moment. Suggests sharing, recommendation.",
     "use_case": "Sharing / recommendation moment, social sharing vibe.",
     "paleta": "Neutral hands + violet phone + cyan", "vibe": "shared moment cinematic",
     "prompt": "Shared moment cinematic. Two ungendered hands - one offering smartphone, second receiving. Mid-handoff moment. Both hands neutral skin tone, no specific markers. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: neutral + violet + cyan. Composition: phone center between hands, both hands framing. NO TEXT. NEGATIVE: no faces, no jewelry."},

    {"sekcja": "UNIWERSALNE - Same rece", "id": "UN-RE-05", "tytul": "Top-down rece z telefonem",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down view: dwie rece trzymaja telefon, palce delikatnie obejmujace boki. Ungendered.",
     "use_case": "Universal grip moment, czysty product shot.",
     "paleta": "Neutral hands + violet phone screen + cream surface", "vibe": "Apple top-down product",
     "prompt": "Apple top-down product photography. Top-down view: two ungendered hands hold smartphone, fingers gently around sides. No specific markers on hands. 50mm f/4 overhead.\n\nPHONE: MapJob DARK UI full spec, screen filling phone.\n\nGrade: neutral + violet + cream. Composition: top-down centered, hands frame phone. NO TEXT."},

    # ===== MAPY - WIZUALIZACJE =====
    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-01", "tytul": "Mapa Polski aerial dense pins",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Aerial render mapy Polski o zmierzchu z setkami fioletowych pinezek z teczkami. Niebo deep indigo + warm horizon glow.",
     "use_case": "Brand epic, kraj-szeroki statement, launch creative.",
     "paleta": "Deep navy map + violet pins + cyan rivers + warm horizon", "vibe": "Apple x NASA Earth at Night",
     "prompt": "Apple Designed in California x NASA Earth at Night style. Top-down view of Poland as detailed topographic map at dusk, ~800m altitude. Map base dark navy #0A0A14, rivers as thin cyan #00C8D4 threads, forests dark green, urban graphite. Hundreds of glowing deep-purple #7C3AED briefcase pins scattered across cities, dense Warszawa Krakow Gdansk Wroclaw Poznan Katowice Lublin Szczecin. Several blue cluster circles #3B82F6 with white numbers. Sky deep indigo to warm amber horizon, atmospheric haze, single first-magnitude star upper-right. Edges fade into Berlin/Praga sparse pins. 24mm wide drone-render. NO TEXT in render. NEGATIVE: no city labels, no compass."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-02", "tytul": "Europa zoom-out z polskim glow",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Wide aerial mapy Europy o zmierzchu, Polska visibly illuminated densely, sparser pinezki w Berlinie, Pradze, Wiedniu, Amsterdamie, Paryzu.",
     "use_case": "Europe reach, B2B paneuropejski.",
     "paleta": "Deep navy + dense PL violet + sparser EU + cyan threads", "vibe": "satellite imagery x cinematic",
     "prompt": "Satellite imagery x cinematic brand render. Aerial photorealistic of Europe at twilight, seen from space. Poland visibly illuminated in dense cluster of glowing purple pins extending westward into Berlin, Vienna, Praga, Amsterdam, Paris, Mediolan, Sztokholm, Kopenhaga sparser pins. Blue cluster circles bloom over major metros. Map surface dark earth with country borders glowing cyan. Rivers and coastlines turquoise threads. Subtle day-to-night terminator line cutting through eastern Europe. 24mm wide. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-03", "tytul": "Single pin macro pulse",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Pojedyncza fioletowa pinezka MapJob w extreme close-up, mid-pulse with violet halo radiating. Background blurred dark.",
     "use_case": "Brand mark macro, hero pin moment.",
     "paleta": "Violet halo + dark void + cyan rim", "vibe": "Greig Fraser brand macro",
     "prompt": "Greig Fraser x Apple brand macro. Single deep-purple #7C3AED MapJob pin (rounded square, white briefcase, pointed tail) in extreme close-up, mid-pulse with violet halo radiating outward. Background blurred dark. Subtle dust particles. 100mm macro f/4 focus stacked.\n\nGrade: cinematic dark + violet halo + cyan rim. Composition: pin centered, halo radiating. NO TEXT. NEGATIVE: no other UI."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-04", "tytul": "Mapa z cyan radius circle",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Mapa miasta polskiego z cyan kolem oznaczajacym promien wyszukiwania. Pinezki wewnatrz kola i na zewnatrz.",
     "use_case": "Pokazuje funkcjonalnosc 'praca w okolicy', radius search.",
     "paleta": "Light map + cyan radius + violet pins", "vibe": "infographic clean editorial",
     "prompt": "Infographic clean editorial. Light Google-Maps-style cartography of Polish city neighborhood. Semi-transparent cyan #00C8D4 circle (25% opacity) overlays map showing 5km radius. Inside circle: 12-15 deep purple briefcase pins clustered. Outside: scattered pins. Emerald 'TY' pin at exact center pulsing. 35mm wide overhead. NO TEXT. NEGATIVE: no specific street names, no logos."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-05", "tytul": "Mapa z connection threads",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Mapa Centralnej Europy, dwie pinezki swiecace z luminujacym threadem violet-do-cyan miedzy nimi. Network metaphor.",
     "use_case": "Connection / network statement, Polska-EU relacja.",
     "paleta": "Navy map + violet pins + cyan thread", "vibe": "Apple Network brand visuals",
     "prompt": "Apple Network brand visuals. Aerial map view Central Europe twilight, Poland right, Germany left. Deep-purple pin glows over Warszawa with pulse. Second purple pin glows Berlin. Between them: luminous thread of light gradient violet-to-cyan, arcing gently across landscape, fiber-optic style. Thread passes through Poznan/Frankfurt smaller relay glows. Other pins scattered subtly. Sky upper third deep indigo to warm horizon. 28mm wide. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-06", "tytul": "City mini-map zoom (rotuje per miasto)",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down zoomed mapy polskiego miasta (Warszawa/Krakow/Wroclaw rotacyjnie). Streets visible, 20-30 pinezek wokol centrum.",
     "use_case": "Per-miasto kampania, lokalny target.",
     "paleta": "Light map + violet pins + cyan accent", "vibe": "Reuben Wu city aerial",
     "prompt": "Reuben Wu x Apple city aerial. Top-down map view of Polish city neighborhood (Warszawa/Krakow/Wroclaw - rotates per campaign). Streets and buildings textured. Map dark MapJob style with light street mesh. Glowing emerald TY pin pulses at center, 20-30 deep-purple briefcase pins within ~2km radius. Subtle cyan circle outlines radius. 35mm wide top-down isometric. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-07", "tytul": "Map ribbon connecting cities",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Stylized mapa Polski z luminujacymi nicami laczacymi miasta. Each thread different color (violet, cyan, emerald). Network organism feel.",
     "use_case": "Brand interconnection statement.",
     "paleta": "Dark map + multi-color threads + violet pins", "vibe": "Tron x Apple network brand",
     "prompt": "Tron x Apple network brand. Stylized map of Poland with luminous threads connecting major cities. Each thread different gradient color: violet, cyan, emerald. Network organism feel. Cities glow as nodes with purple pins. 28mm wide. NO TEXT. NEGATIVE: no city labels."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-08", "tytul": "3D isometric mapa Polski",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "3D isometric Polski jako game-board, miasta jako wzniesienia, pinezki wbita w teren jako fizyczne objekty.",
     "use_case": "Conceptual brand, gamified visual.",
     "paleta": "Isometric pastel + violet pins + cyan accent", "vibe": "Pentagram isometric infographic",
     "prompt": "Pentagram x Apple isometric infographic. 3D isometric rendering of Poland as game-board surface, cities as raised relief, deep-purple #7C3AED pins as physical objects stuck into terrain. Cyan rivers thin. 24mm orthographic. NO TEXT. NEGATIVE: no labels."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-09", "tytul": "Mapa z dnia do nocy time-lapse moment",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Mapa Polski w przejsciu dzien-noc, prawa polowa zachodzi w noc, lewa jeszcze w dziennym swietle. Pinezki widoczne caly czas, jasniej swieca w nocy.",
     "use_case": "App always-on metaphor, 24/7 reach.",
     "paleta": "Day/night gradient + violet pins always glowing", "vibe": "Apple environmental brand",
     "prompt": "Apple environmental brand. Stylized aerial Poland in day-to-night transition, right half darkening into evening, left half still daylight. Violet pins visible throughout, brightening into night. Atmospheric terminator line crossing. 24mm wide drone-style. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Mapy i grafika", "id": "UN-MP-10", "tytul": "Pinezki rosnace na mapie time-lapse",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Mapa Polski statyczna, pinezki bloomujace jak kwiaty na poczatku malo, na koncu setki. Mid-bloom moment frozen.",
     "use_case": "Growth narrative, momentum brand.",
     "paleta": "Light map + bloomimg violet pins + warm horizon", "vibe": "Werner Herzog environmental",
     "prompt": "Werner Herzog x Apple environmental. Aerial Poland mid-time-lapse moment - some areas dense purple pins, others sparse, suggesting growth in motion. Pins bloom as visible 'flowers' on map surface. 24mm wide drone. NO TEXT."},

    # ===== MACRO BRAND MARKS =====
    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-01", "tytul": "Pin drop slow-motion frozen",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Pojedyncza pinezka mid-fall, frozen moment, z motion-blur trail za sobą. Niżej mata na ktora ma uderzyc.",
     "use_case": "Action moment macro, hero impact.",
     "paleta": "Violet pin + motion blur trail + dark mat", "vibe": "Greig Fraser frozen action",
     "prompt": "Greig Fraser x Apple frozen action macro. Single deep-purple #7C3AED MapJob pin caught mid-fall in slow motion, frozen moment with motion-blur trail behind. Below: dark matte surface. 100mm macro f/4.\n\nGrade: violet pin + motion trail + crushed dark. Composition: pin upper-center mid-fall, mat lower. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-02", "tytul": "Pin floating in particle dust",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Pinezka levituje w przestrzeni wsrod fioletowych czastek/kurzu, soft glow halo. Zero-gravity feel.",
     "use_case": "Premium brand, abstract product moment.",
     "paleta": "Black void + violet particles + pin glow", "vibe": "particle abstract brand",
     "prompt": "Particle abstract brand cinematic. Single deep-purple MapJob pin levitates in space surrounded by violet particles/dust, soft glow halo, zero-gravity feel. 100mm macro f/4.\n\nGrade: deep void + violet particles + pin glow. Composition: pin centered, particles swirling. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-03", "tytul": "Pin reflected on water surface",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Pinezka nad spokojnej powierzchni czarnej wody, perfect mirror reflection. Subtle ripple just starting.",
     "use_case": "Poetic moment, reflective brand.",
     "paleta": "Black water + violet pin + cyan ripple", "vibe": "Bill Viola water reflection",
     "prompt": "Bill Viola x Apple water reflection. Single deep-purple MapJob pin hovering above still black water surface, perfect mirror reflection. Subtle ripple just starting beneath. 100mm macro f/4.\n\nGrade: black water + violet pin + cyan ripple. Composition: pin upper, reflection lower symmetric. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-04", "tytul": "Pin frozen in ice crystal",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Pinezka w bryle krysztalowego lodu, swieci przez krystaly. Premium winter feel.",
     "use_case": "Seasonal winter campaign, premium preservation.",
     "paleta": "Ice crystal + violet pin glow through + cool rim", "vibe": "Hoyte van Hoytema winter premium",
     "prompt": "Hoyte van Hoytema x Apple winter premium. Single deep-purple MapJob pin frozen inside crystal ice block, glowing through translucent material. Subtle ice texture, cool rim light. 100mm macro f/4.\n\nGrade: ice crystal + violet through + cool. Composition: ice block centered, pin embedded. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-05", "tytul": "Pin in honey amber preservation",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Pinezka half-submerged in pool of golden honey, screen visible through translucent amber.",
     "use_case": "Preservation, lasting value, abstract brand.",
     "paleta": "Amber honey + violet pin + warm gold rim", "vibe": "Storm Thorgerson preservation",
     "prompt": "Storm Thorgerson x Apple preservation surreal. Single MapJob pin halfway sunk into pool of golden Polish honey or solidified amber, glow visible through translucent material. 100mm macro f/4.\n\nGrade: amber honey + violet through + warm. Composition: pin half-in honey, macro detail. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-06", "tytul": "Pin shattered glass effect",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Pinezka jest pelnie ufopmowanazjako glass object, pekajaca/ shattering w jednej polowie do drobnych odlamkow.",
     "use_case": "VFX moment, dramatic brand.",
     "paleta": "Glass clear + violet glow + cyan refractions", "vibe": "VFX cinematic shatter",
     "prompt": "VFX cinematic shatter. Single MapJob pin rendered as glass object, half intact, half shattering into small fragments suspended in slow-motion. Violet glow from within. 100mm macro f/4 frozen.\n\nGrade: glass + violet + cyan refractions. Composition: pin centered, fragments radiating. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-07", "tytul": "Pin in light beam ray",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Pinezka stoi w pojedynczym promieniu swiatla, otoczona ciemnoscia. Spotlight effect, theatrical.",
     "use_case": "Solo product moment, dramatic brand reveal.",
     "paleta": "Black void + violet pin + cool light beam", "vibe": "theatrical spotlight brand",
     "prompt": "Theatrical spotlight cinematic brand. Single MapJob pin standing in single light beam, surrounded by darkness. Spotlight effect, dramatic reveal. 85mm f/2.8.\n\nGrade: black void + violet pin + cool beam. Composition: pin centered in beam, darkness surround. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-08", "tytul": "Multiple pins arranged grid",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down: 9 pinezek MapJob ulozonych w 3x3 grid na cream tle. Pattern, repetition, abundance.",
     "use_case": "Brand pattern, abundance metaphor, social-friendly.",
     "paleta": "Cream + violet pin grid + soft shadow", "vibe": "Pentagram pattern editorial",
     "prompt": "Pentagram pattern editorial. Top-down: 9 deep-purple MapJob pins arranged in symmetric 3x3 grid on cream surface, perfect spacing. Pattern feel. Soft top light, gentle shadows. 50mm f/4 overhead.\n\nGrade: cream + violet pattern + cyan rim. Composition: 3x3 grid centered, equal spacing. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-09", "tytul": "Pin emerging from surface",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Pinezka wynika z surface (concrete/wood/sand) jakby wyrastala. Half-buried, half-emerging.",
     "use_case": "Brand metaphor wzrostu / pojawienia sie.",
     "paleta": "Surface texture + violet pin + warm glow", "vibe": "growth metaphor cinematic",
     "prompt": "Growth metaphor cinematic. Single MapJob pin emerging from surface (concrete/wood/sand interpreted), half-buried half-emerging upward. Violet halo from below. 100mm macro f/4.\n\nGrade: textured surface + violet emergence + warm. Composition: pin upper centered, surface lower 60%. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Macro brand", "id": "UN-MC-10", "tytul": "Pin orbital satellites around phone",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon w centre void, dozen pinezek krazą orbitalnie wokol jak satelity, smug movement trails. Sci-fi.",
     "use_case": "Conceptual hero, sci-fi premium.",
     "paleta": "Deep black + violet pins + cyan trails", "vibe": "Bradford Young x Apple orbital",
     "prompt": "Bradford Young x Apple orbital sci-fi. Phone levitates centered deep void, dozens of glowing purple pins orbit around it like satellites with motion trails forming graceful arcs. Soft cyan lens flares. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep void + violet orbits + cyan trails. Composition: phone center, orbital pattern around. NO TEXT."},

    # ===== STILL-LIFE - PRZEDMIOTY =====
    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-01", "tytul": "Telefon na biurku z akcesoriami",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon centralnie na drewnianym biurku, obok keys, leather notebook closed, brass pen, ceramic mug. No persona implied.",
     "use_case": "Universal lifestyle still-life, dla kazdego.",
     "paleta": "Wood + brass + leather + violet phone glow", "vibe": "Tim Walker minimalist still-life",
     "prompt": "Tim Walker x Apple minimalist still-life. Phone center on dark walnut desk, accessories around: brass keys on leather keychain, hand-bound leather notebook closed, brass pen, single ceramic mug. No persona implied. Daylight from camera-left. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm wood + brass + violet. Composition: phone center, accessories radial. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-02", "tytul": "Telefon na kontuarze z kawa",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na bialym marble kontuarze cafe, single ceramic flat-white mug ring, amber pendant lamp z gory. Bright morning.",
     "use_case": "Cafe ritual moment, universal morning.",
     "paleta": "White marble + amber pendant + violet phone", "vibe": "third-wave cafe editorial",
     "prompt": "Third-wave cafe editorial. Phone on white marble cafe counter, single ceramic flat-white mug ring, amber #FFB700 pendant lamp from above. Bright morning. No persona. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: marble + amber + violet. Composition: phone center, mug nearby. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-03", "tytul": "Telefon na nocnym stoliku z ksiazka",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon na nightstand z otwarta ksiazka, lampe Edison bulb soft warm, glass of water. Bedtime moment.",
     "use_case": "Evening universal moment, decyzja dnia.",
     "paleta": "Warm bedside + paper book + violet phone", "vibe": "intimate bedside cinematic",
     "prompt": "Intimate bedside cinematic. Phone on wooden nightstand next to open paper book (illegible content), small Edison bulb lamp warm, glass of water. Soft late-evening mood. 35mm f/2.0.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm bedside + paper + violet. Composition: phone left, book right open. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-04", "tytul": "Telefon w kuchni przy oknie",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na blat kuchenny przy oknie, golden window light streaming, half-mug coffee with steam, set of keys.",
     "use_case": "Polish kitchen morning, universal home.",
     "paleta": "Warm wood + golden window + cream + violet phone", "vibe": "Pawel Edelman warm Portra",
     "prompt": "Pawel Edelman x Apple warm Kodak Portra still-life. Phone on raw oak kitchen counter at window, half-mug of coffee with steam, set of keys, golden window light streaming diagonally. No hand visible. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: Kodak Portra warm. Composition: phone upper-center, accessories around. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-05", "tytul": "Telefon w sali konferencyjnej",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Telefon na czystym konferencyjnym stole z laptop closed, cup of espresso, blurred plants tropical at edges. Modern corporate.",
     "use_case": "Business setting, B2B meeting context.",
     "paleta": "Cream conference + leather + violet phone", "vibe": "modern corporate editorial",
     "prompt": "Modern corporate editorial. Phone center on clean conference table with closed MacBook, single espresso cup, blurred tropical plants at edges. Soft natural daylight. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: cream + cool natural + violet. Composition: phone center, accessories framing. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-06", "tytul": "Telefon w nowoczesnym wnetrzu",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon na concrete coffee table w lofcie, plant in stoneware pot, blurred minimalist sofa. Industrial modern.",
     "use_case": "Modern interior aspirational, dla mlodszych.",
     "paleta": "Concrete + plant green + violet phone", "vibe": "industrial modern editorial",
     "prompt": "Industrial modern editorial. Phone on concrete coffee table in loft interior, single plant in stoneware pot, blurred minimalist sofa. Soft window light. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: concrete cool + plant + violet. Composition: phone center, coffee table top-down. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-07", "tytul": "Telefon na outdoor cafe table",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na metal outdoor cafe table, espresso cup, sunglasses folded, dappled sunlight through tree leaves.",
     "use_case": "Outdoor cafe moment, summer feel, universal.",
     "paleta": "Metal table + dappled sun + violet phone", "vibe": "outdoor cafe editorial",
     "prompt": "Outdoor cafe editorial. Phone on metal outdoor cafe table, espresso cup nearby, sunglasses folded, dappled sunlight through tree leaves above. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm dappled + metal + violet. Composition: phone center, accessories radial. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-08", "tytul": "Telefon na lawce parkowej (pusta)",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon zostawiony na drewnianej lawce parkowej, autumn leaves drifting around, no person visible.",
     "use_case": "Quiet moment, urban nature, universal.",
     "paleta": "Park wood + autumn ochre + violet phone", "vibe": "Saul Leiter park documentary",
     "prompt": "Saul Leiter x Apple park documentary. Phone resting on wrought-iron and wood park bench, autumn leaves drifting around, no person visible. Soft afternoon golden light. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm autumn + park green + violet. Composition: phone center on bench, leaves blurred motion. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-09", "tytul": "Telefon na siedzeniu tramwaju",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na pustym tram seat, motion blur na zewnatrz przez okno, warm tungsten interior. Empty tram.",
     "use_case": "Commute moment, transit, universal urban.",
     "paleta": "Warm tungsten + motion blur + violet phone", "vibe": "Wong Kar-wai transit cinematic",
     "prompt": "Wong Kar-wai x Apple transit cinematic. Phone resting on empty modern Polish tram seat, motion blur outside through window, warm tungsten interior tram lighting. Empty tram aside. 35mm f/2.0.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm tungsten + cool exterior blur + violet. Composition: phone on seat lower-center, window upper. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Still-life", "id": "UN-SL-10", "tytul": "Telefon na desce rozdzielczej auta",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Telefon mounted on car dashboard mount, sunset visible przez windshield. No driver visible.",
     "use_case": "Driver/commuter moment, journey vibe.",
     "paleta": "Dashboard black + sunset orange + violet phone", "vibe": "automotive editorial",
     "prompt": "Automotive editorial. Phone mounted on car dashboard mount, sunset visible through windshield. No driver visible. Steering wheel partially in frame. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec, screen showing map with route visible.\n\nGrade: dashboard black + sunset + violet phone. Composition: phone center-left, windshield right. NO TEXT."},

    # ===== ATMOSFERYCZNE - WIATR / DESZCZ / SNIEG =====
    {"sekcja": "UNIWERSALNE - Atmosferyczne", "id": "UN-AT-01", "tytul": "Telefon w deszczu makro",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Macro telefonu face-up na zewnetrznej powierzchni, krople deszczu uderzajace ekran i odskakujace, faint violet ripple na UI.",
     "use_case": "Atmospheric moment, weather-friendly.",
     "paleta": "Wet glass + violet pulse + cool ambient", "vibe": "weather macro cinematic",
     "prompt": "Weather macro cinematic. Macro of phone face-up on outdoor surface, raindrops hitting screen and bouncing, each droplet causing faint violet ripple on UI. 100mm macro f/4.\n\nPHONE: MapJob DARK UI showing full map with pin cascade.\n\nGrade: wet glass + violet ripples + cool ambient. Composition: phone fills frame, droplets motion frozen. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Atmosferyczne", "id": "UN-AT-02", "tytul": "Telefon ze sniegiem opadajacym",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na powierzchni outdoor, snow flurries gentle drifting, accumulating around phone. Cold morning.",
     "use_case": "Winter campaign, seasonal.",
     "paleta": "Snow white + cool blue + violet phone", "vibe": "winter editorial",
     "prompt": "Winter editorial cinematic. Phone resting on flat outdoor surface, snow flurries gently drifting and accumulating around. Cold morning, breath-vapor in air. 50mm f/2.0.\n\nPHONE: MapJob DARK UI full spec, screen glowing brighter against cold ambient.\n\nGrade: snow white + cool blue + warm phone counter. Composition: phone center, snowflakes dynamic. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Atmosferyczne", "id": "UN-AT-03", "tytul": "Telefon w golden hour magic",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Telefon outdoor o golden hour, warm sun streaming. Subtle dust particles in beam. Bokeh sun in background.",
     "use_case": "Magic hour universal, optimistic mood.",
     "paleta": "Golden warm + sun bokeh + violet phone", "vibe": "Joel Meyerowitz golden hour",
     "prompt": "Joel Meyerowitz x Apple golden hour. Phone outdoor at magic hour, warm sun streaming directly. Subtle dust particles visible in light beam. Sun as bokeh in upper background. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: golden warm + sun bokeh + violet. Composition: phone center-left, sun upper-right bokeh. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Atmosferyczne", "id": "UN-AT-04", "tytul": "Telefon w blue hour (po zachodzie)",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon outdoor w niebieskiej godzinie zaraz po zachodzie. Cool ambient, urban silhouettes daleko, phone glow dominuje.",
     "use_case": "Sophisticated dusk, premium evening.",
     "paleta": "Blue hour + violet phone + cool ambient", "vibe": "Roger Deakins blue hour",
     "prompt": "Roger Deakins x Apple blue hour cinematic. Phone outdoor at deep blue hour just after sunset. Cool ambient, urban silhouettes far in background, phone glow dominates as warmest source. 50mm f/2.0.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep blue hour + warm phone counter + cool ambient. Composition: phone center, distant city silhouettes. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Atmosferyczne", "id": "UN-AT-05", "tytul": "Telefon o polnocy w glow",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon w deep night, jedyne zrodlo swiatla = ekran. Warm violet halo wokol, full dark tlo.",
     "use_case": "Late night moment, intimate.",
     "paleta": "Deep dark + violet halo + cyan accent", "vibe": "Greig Fraser midnight intimate",
     "prompt": "Greig Fraser x Apple midnight intimate. Phone in deep night setting, only light source is screen itself. Warm violet halo radiating, full dark surrounding. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep void + violet halo + cyan rim. Composition: phone center, halo radiating, full dark. NO TEXT."},

    # ===== BRAND CONCEPTUAL =====
    {"sekcja": "UNIWERSALNE - Conceptual brand", "id": "UN-CN-01", "tytul": "Telefon jako kompas",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon na drewnianym biurku z stara mosadzowa kompas obok, vintage map paper. Telefon ma rolę nowoczesnego kompasu.",
     "use_case": "Tradition meets modernity metaphor.",
     "paleta": "Walnut + brass compass + map cream + violet phone", "vibe": "explorer editorial",
     "prompt": "Explorer editorial cinematic. Phone on dark walnut desk next to vintage brass compass, vintage paper map partially unfolded. Phone as 'modern compass' metaphor. Warm Edison lamp. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec, EU-zoom.\n\nGrade: warm walnut + brass + map paper + violet. Composition: phone left, compass right, map background. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Conceptual brand", "id": "UN-CN-02", "tytul": "Telefon w ksiazce historycznej",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Otwarta vintage ksiazka, telefon umieszczony jak bookmark. Old paper, marbled endpapers, modern device juxtaposed.",
     "use_case": "Old-meets-new conceptual.",
     "paleta": "Old paper + leather book + violet phone glow", "vibe": "Wes Anderson vintage editorial",
     "prompt": "Wes Anderson x Apple vintage editorial. Open vintage hardcover book with marbled endpapers, phone placed like bookmark between pages. Old paper texture, modern phone juxtaposed. 50mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: cream paper + leather + violet phone. Composition: top-down, phone in book center. NO TEXT."},

    {"sekcja": "UNIWERSALNE - Conceptual brand", "id": "UN-CN-03", "tytul": "Telefon w kolekcji pocztowek",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Top-down: telefon centralnie, otoczony 8 generic vintage pocztowkami z roznych miast Polski/Europy. Telefon = mapa wszystkich miast.",
     "use_case": "Collection / abundance metaphor, EU reach.",
     "paleta": "Vintage postcards + violet phone center", "vibe": "vintage collection editorial",
     "prompt": "Vintage collection editorial. Top-down: phone centered, surrounded by 8 generic vintage-style postcards from different Polish and European cities (without specific recognizable landmarks). 35mm f/4 overhead.\n\nPHONE: MapJob DARK UI full spec, EU-zoom map.\n\nGrade: cream postcards + violet phone center. Composition: top-down radial pattern. NO TEXT. NEGATIVE: no recognizable landmarks."},

    {"sekcja": "UNIWERSALNE - Conceptual brand", "id": "UN-CN-04", "tytul": "Telefon na drewnianej grze planszowej",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon umieszczony na vintage drewnianej grze planszowej w polowie. Planszowy elementy w blur. Game-of-life metaphor.",
     "use_case": "Decision metaphor, choice / strategy.",
     "paleta": "Wood game + brass tokens + violet phone", "vibe": "game-of-life editorial",
     "prompt": "Game-of-life editorial. Phone placed on vintage wooden board game mid-play, brass tokens scattered, dice nearby. Game elements partially in blur. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm wood + brass + violet phone. Composition: phone on board center, game pieces around. NO TEXT. NEGATIVE: no recognizable game branding."},

    {"sekcja": "UNIWERSALNE - Conceptual brand", "id": "UN-CN-05", "tytul": "Telefon w roślinach żywych",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon otoczony zywymi tropikalnymi roslinami, monstera leaves, light filtering through. Greenhouse feel.",
     "use_case": "Growth / life metaphor, organic feel.",
     "paleta": "Plant green + warm light + violet phone", "vibe": "tropical greenhouse editorial",
     "prompt": "Tropical greenhouse editorial. Phone surrounded by living tropical plants, monstera deliciosa leaves, light filtering through fronds. Greenhouse feel. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: plant green + warm filtered + violet phone. Composition: phone center embedded in foliage. NO TEXT."},
]

# Wczytaj istniejacy skrypt
with open(r'C:\Users\48721\Desktop\MAPJOB CLAUDE\generate_katalog_word.py', 'r', encoding='utf-8') as f:
    script = f.read()

# Generuj kod nowych wpisow
new_entries_code = ""
for e in UNIVERSAL:
    new_entries_code += "    {\n"
    for key, value in e.items():
        if isinstance(value, str):
            escaped = value.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
            new_entries_code += f'        "{key}": "{escaped}",\n'
    new_entries_code += "    },\n"

# Wstaw nowe wpisy przed "]" konczacym ENTRIES
marker = "# ===== POMOCNICZE ====="
idx = script.find(marker)
end_of_list = script.rfind("]", 0, idx)
new_script = script[:end_of_list] + new_entries_code + script[end_of_list:]

with open(r'C:\Users\48721\Desktop\MAPJOB CLAUDE\generate_katalog_word.py', 'w', encoding='utf-8') as f:
    f.write(new_script)

print(f"OK - dodano {len(UNIVERSAL)} uniwersalnych wpisow")
print(f"Nowy rozmiar skryptu: {len(new_script)} znakow")
