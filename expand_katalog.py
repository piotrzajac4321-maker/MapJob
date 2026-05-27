# -*- coding: utf-8 -*-
"""Dodaje wiele wpisow do generate_katalog_word.py i regeneruje docx."""

# Dodatkowe wpisy - bez polskich cudzyslowow w danych aby uniknac konfliktow
ADDITIONAL = [
    # ===== POLSKA METROPOLITARNA NIGHT-NOIR =====
    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-01", "tytul": "Warszawa Marszalkowska 22:30 post-drizzle",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Warszawska Marszalkowska o 22:30 po deszczu. Mokry asfalt jak lustro, magentowy neon sklepu rozmyty w bokeh, smugi czerwonych swiatel tylnych z prawej. Reka chest-height z telefonem MapJob.",
     "use_case": "Warszawa flagship neon-noir. Premium kreatywka stolicy.",
     "paleta": "Master + magenta #E83E8C", "vibe": "Roger Deakins (BR2049) x Apple",
     "prompt": "Photorealistic cinematic low-angle, Deakins/BR2049 style. Wet Marszalkowska 22:30, post-drizzle mirror asphalt, blurred red taillight streaks right. Hand chest-height with smartphone, charcoal wool sleeve, thin watch. Background: out-of-focus kamienica facades + magenta #E83E8C shop neon bokeh. Phone glow dominant.\n\nPHONE: MapJob DARK UI - near-black #0A0A14, purple #7C3AED briefcase pins across Polska into Berlin/Praga, selected Warsaw pin pulse, cyan #00C8D4 'Otworz pelna mape' CTA, blue #3B82F6 cluster '3', emerald top-right.\n\nLens: ARRI Alexa LF + Zeiss Supreme 50mm T2.0 anamorphic. Grade: teal-magenta crushed blacks. Composition: phone left 55%, neon bokeh right, copy space upper-right. NO TEXT in render. NEGATIVE: no light theme, no Google red pins, no extra logos."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-02", "tytul": "Warszawa Praga-Polnoc 23:50 fog",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Postindustrialna ceglana aleja Pragi-Polnoc o 23:50, miekka mgla rozplywa sie. Reka na wysokosci biodra wyjmuje telefon z kieszeni plaszcza. Amber sodium #FFA940 wall-lamp glow.",
     "use_case": "Postindustrial Warszawa, hipsterski persona, niche premium.",
     "paleta": "Master + amber sodium #FFA940", "vibe": "Wong Kar-wai cinematic noir",
     "prompt": "Wong Kar-wai cinematic noir. Hand at hip height pulling phone from coat pocket, factory-renovated brick alley Warszawa Praga-Polnoc 23:50, distant tram bell, S-Bahn rattling, amber sodium #FFA940 Spati-style shop neon bokeh. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa-Praga, all standard UI elements (purple briefcase pins, cyan CTA, emerald avatar, blue cluster).\n\nGrade: deep teal shadows + amber highlights. Composition: phone lower-third, alley vanishing point upper. Copy space upper third. NO TEXT in render. NEGATIVE: no light theme, no logos."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-03", "tytul": "Krakow Wawel blue hour 21:10",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Reka na kamiennym parapecie tarasu Wzgorza Wawelskiego. Wisla zakrzywia sie ponizej, fioletowe niebo zmierzchu, dalekie kamienice jako cieple bursztynowe punkty.",
     "use_case": "Krakow heritage, kulturowy persona, premium lokalny ad.",
     "paleta": "Master + violet #8338EC dusk sky", "vibe": "Lukasz Zal Cold War x Apple",
     "prompt": "Lukasz Zal Cold War style x Apple. Hand on Wawel hill terrace stone parapet, Vistula river curving below, violet #8338EC dusk sky, distant kamienice as warm amber dots. 28mm f/2.8 wide environmental.\n\nPHONE: MapJob DARK full spec, selected pin Krakow.\n\nGrade: cool violet shadows, warm distant amber. Composition: phone lower-left third, Wawel silhouette right. Copy space upper-left. NO TEXT. NEGATIVE: standard."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-04", "tytul": "Krakow Kazimierz alley 23:15",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Waska aleja Kazimierza, jedna zelazna latarnia, distant bar entrance hot pink #FF006E w bokeh. Reka chest-height, czarny golf turtleneck.",
     "use_case": "Bohemian persona, niche cool. Krakow-specific.",
     "paleta": "Master + hot pink #FF006E", "vibe": "Christopher Doyle (Wong Kar-wai)",
     "prompt": "Christopher Doyle style. Narrow tenement alley Krakow Kazimierz 23:15, single iron lantern, distant bar entrance hot pink #FF006E bokeh. Hand at chest, black turtleneck sleeve. 50mm T1.3 deep bokeh.\n\nPHONE: MapJob DARK full spec, selected pin Kazimierz, emerald filter chip 'Zlecenie' active.\n\nGrade: crushed blacks, saturated magenta-pink mid, clean cyan highlights. Composition: phone center-left, alley vanishing right. NO TEXT."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-05", "tytul": "Gdansk Mariacka 22:00 sea fog",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Brukowana ulica Mariacka z gargulcami, mgla od morza, jedna emerald #22C55E latarnia przy drzwiach. Sweter knit, salt-air feel.",
     "use_case": "Gdansk maritime, baltycki vibe, regionalny premium ad.",
     "paleta": "Master + emerald lantern #22C55E", "vibe": "Roger Deakins Baltic fog",
     "prompt": "Roger Deakins Baltic fog cinematic. Cobblestone Mariacka street with gargoyle drainspouts, sea fog drifting, single emerald #22C55E lantern at door. Hand chest-height, knit sweater sleeve, salt-air feel. 40mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Gdansk.\n\nGrade: deep teal sea-fog with emerald accent. Composition: phone center, lantern bokeh right. Copy upper band. NO TEXT."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-06", "tytul": "Wroclaw Rynek 23:40 active rain",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Reka pod markiza nad telefonem chroniaca ekran, gotycki Stary Ratusz amber-lit, padajacy deszcz w foreground catches phone glow as droplet sparkles.",
     "use_case": "Wroclaw atmospheric, dramatic weather, emotional moment.",
     "paleta": "Master + gold amber #FFB700 Hall lights", "vibe": "Cuaron Children of Men x Apple",
     "prompt": "Cuaron Children of Men x Apple. Hand under building awning sheltering phone, gothic Old Town Hall amber #FFB700-lit, falling rain in foreground catches phone glow as droplet sparkles. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin Wroclaw.\n\nGrade: warm amber Hall + cool rain foreground + violet phone. Composition: phone lower-center, awning frame top, rain motion right. NO TEXT."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-07", "tytul": "Lodz Piotrkowska tram rails wet",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Mokre tramwajowe szyny gleam jako rownolegle cyan reflections vanishing point. Art Nouveau tenements, distant acid green #80FF00 'APTEKA' neon w bokeh.",
     "use_case": "Lodz industrial poetry, iconic polish street.",
     "paleta": "Master + acid green #80FF00 APTEKA neon", "vibe": "Wojciech Staron x Apple",
     "prompt": "Wojciech Staron x modern Apple product film. Wet tram rails as parallel cyan reflection lines vanishing point, Art Nouveau facades, distant acid green #80FF00 APTEKA neon bokeh. Hand chest-height, puffer jacket sleeve. 45mm anamorphic T2.6.\n\nPHONE: MapJob DARK full spec, selected pin Lodz.\n\nGrade: teal-amber split + acid green accent. Composition: phone center-left, rails leading right. Upper band sky. NO TEXT."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-08", "tytul": "Lublin Stare Miasto 22:30 mist",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Reka na kamiennej lawce w mglistym Old Town placu Lublin, sodium #FFD60A amber lamps glowing through mist. Trynitarska Tower silhouette.",
     "use_case": "Lublin medieval mood, eastern Polska persona.",
     "paleta": "Master + sodium yellow #FFD60A", "vibe": "Slawomir Idziak medieval cinematic",
     "prompt": "Slawomir Idziak medieval cinematic mood. Hand on stone bench misty Old Town square Lublin, Trynitarska Tower silhouette, sodium #FFD60A amber lamps glowing through mist. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Lublin.\n\nGrade: warm sodium fog + violet phone counter. Composition: phone center, tower silhouette upper-right. NO TEXT."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-09", "tytul": "Poznan Stary Rynek 22:18 (Master ref)",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Patrz NN-MASTER - flagowy promp sekcji. Magentowy ZAKLAD neon, mokry kostka, ARRI 40mm anamorphic.",
     "use_case": "Master reference, premium hero kampanii.",
     "paleta": "Master + magenta #E83E8C", "vibe": "Roger Deakins BR2049 x Apple",
     "prompt": "(Patrz NN-MASTER w sekcji NEON-NOIR dla pelnego prompta - ten wpis to skrocony cross-reference). Photorealistic Roger Deakins (BR2049) cinematic Poznan Stary Rynek 22:18, post-drizzle, magenta #E83E8C ZAKLAD neon bokeh, mirror cobblestone, ARRI Alexa Mini LF + Panavision Ultra Vista 40mm anamorphic T2.0. Phone hand chest-height, MapJob DARK UI. NO TEXT."},

    {"sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR", "id": "PMN-10", "tytul": "Katowice Spodek tunnel 01:20",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Brutalist concrete tunel kolo Spodek, fluorescent vanishing point, single red #E63946 EXIT sign mid-tunnel. Reka chest-height, leather jacket.",
     "use_case": "Katowice industrial after-hours, slaski persona.",
     "paleta": "Master + red #E63946 EXIT", "vibe": "Tarkovsky Stalker x Apple",
     "prompt": "Tarkovsky Stalker x Apple. Brutalist concrete tunnel near Katowice Spodek, fluorescent vanishing point, single red #E63946 EXIT sign mid-tunnel. Hand at chest, leather jacket sleeve. 32mm T2.0 crisp geometric.\n\nPHONE: MapJob DARK full spec, selected pin Katowice.\n\nGrade: cold blue tunnel + clean cyan + red EXIT accent. Composition: phone left third, tunnel one-point center-right. NO TEXT."},

    # ===== EUROPA REACH =====
    {"sekcja": "EUROPA REACH", "id": "EU-01", "tytul": "Berlin Mitte Hackescher Markt 22:00 drizzle",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Berlinski Mitte rejon, Hackescher Markt, lekki deszcz, hot pink #FF006E neon Spati shop bokeh, S-Bahn rattling overhead.",
     "use_case": "Niemcy reach, polski rzemieslnik w Berlinie persona.",
     "paleta": "Master + hot pink #FF006E", "vibe": "Christopher Doyle x Apple Berlin grit",
     "prompt": "Christopher Doyle x Apple Berlin grit cinematic. Hand chest-height, leather jacket, tram bell distant, S-Bahn rattling overhead, hot pink #FF006E Spati shop neon bokeh. Hackescher Markt 22:00 drizzle. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec with EU-zoom map, selected pin Berlin, filter chip 'Zagranica' active.\n\nGrade: Berlin grit teal-magenta. Composition: phone center-left, neon right. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-02", "tytul": "Praga Karlov most 23:30 light snow",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Reka na kamiennym mostu Karola, gotyckie statuy, Hradczany silhouette, amber #FFA940 lantern halos through snowfall.",
     "use_case": "Czechy reach, gothic-Christmas mood.",
     "paleta": "Master + amber #FFA940 lantern", "vibe": "Hoyte van Hoytema gothic-winter",
     "prompt": "Hoyte van Hoytema gothic-Christmas night. Hand on Karluv most stone bridge railing, gothic statues, Prague Castle silhouette, amber #FFA940 lantern halos through snowfall. 40mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Praga.\n\nGrade: warm amber + cool snow + violet phone. Composition: phone left third, bridge vanishing right. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-03", "tytul": "Wieden Stephansplatz 22:00 dry crisp",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Wienski Stephansplatz, gotyckie wieze katedry, deep violet #8338EC blue overlay sky, kashmirowy sweter.",
     "use_case": "Austria reach, imperial elegance, premium target.",
     "paleta": "Master + violet #8338EC sky", "vibe": "Edward Lachman imperial",
     "prompt": "Edward Lachman imperial elegance cinematic. Hand at chest, wool cashmere sleeve, gothic cathedral spires lit, deep violet #8338EC evening-blue overlay sky. Stephansplatz 22:00. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Wieden.\n\nGrade: deep violet sky + warm cathedral + cool phone. Composition: phone center-right, spires upper-left. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-04", "tytul": "Amsterdam Herengracht canal night",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Reka na kierownicy roweru z telefonem, gabled canal houses reflecting in dark water, mint #06D6A0 boat-houseboat string lights.",
     "use_case": "Holandia reach, freelancer-friendly, intimate canal vibe.",
     "paleta": "Master + mint #06D6A0", "vibe": "Robbie Ryan canal-side intimate",
     "prompt": "Robbie Ryan canal-side intimate. Hand on bicycle handlebar with phone, gabled canal houses reflecting in dark water, mint #06D6A0 boat-houseboat string lights. Amsterdam Herengracht 22:00. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Amsterdam.\n\nGrade: dark canal water + warm gable lights + mint accent. Composition: phone left, canal vanishing right. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-05", "tytul": "Paryz Pont des Arts dusk",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Reka na drewnianym moscie pieszym, Sekwana plynaca, distant Tour Eiffel rose-gold #F72585 silhouette twilight.",
     "use_case": "Francja reach, Parisian poetic, aspirational.",
     "paleta": "Master + rose-gold #F72585", "vibe": "Bradford Young Parisian poetic",
     "prompt": "Bradford Young Parisian poetic. Hand on wooden pedestrian bridge railing, Seine flowing, distant Tour Eiffel rose-gold #F72585 silhouette at twilight. Pont des Arts dusk. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Paris.\n\nGrade: dusk rose-gold + warm Parisian + violet phone. Composition: phone left third, Eiffel right far. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-06", "tytul": "Mediolan Galleria Vittorio Emanuele 22:30",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Reka chest-height w szklano-kopulowym pasazu, marble floor reflecting dome arches, cool blue #00B4D8 evening sky through glass roof.",
     "use_case": "Wlochy reach, Milan luxury, designer-style market.",
     "paleta": "Master + cool blue #00B4D8 sky", "vibe": "Linus Sandgren Milan luxury",
     "prompt": "Linus Sandgren Milan luxury cinematic. Hand at chest in glass-domed shopping arcade, marble floor reflecting dome arches, cool blue #00B4D8 evening sky through glass roof. Galleria 22:30. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Milano.\n\nGrade: cool blue glass + warm marble + violet phone. Composition: phone center, vault arches symmetric. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-07", "tytul": "Dublin Temple Bar 23:00 misty",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Reka chest-height w waskim Temple Bar lane, hot pink #FF006E 'TEMPLE BAR' neon at oblique angle, mist softening highlights.",
     "use_case": "Irlandia reach, polish diaspora friendly.",
     "paleta": "Master + hot pink #FF006E Irish neon", "vibe": "Christopher Doyle pub-warmth",
     "prompt": "Christopher Doyle pub-warmth nighttime. Hand chest-height in narrow Temple Bar lane, hot pink #FF006E TEMPLE BAR neon oblique angle, mist softening highlights. Dublin 23:00. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Dublin.\n\nGrade: hot pink Irish + violet phone + misty diffusion. Composition: phone center, neon upper-right oblique. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-08", "tytul": "Kopenhaga Nyhavn night reflection",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Reka na barierze nabrzeza, kolorowe Nyhavn houses reflecting in water, amber #FB8500 waterfront restaurant glow, single sail mast emerald light.",
     "use_case": "Dania reach, Scandi-friendly, premium.",
     "paleta": "Master + amber Scandi #FB8500", "vibe": "Linus Sandgren Scandinavian",
     "prompt": "Linus Sandgren Scandinavian. Hand on quay railing, colorful Nyhavn houses reflecting in water, amber #FB8500 waterfront restaurant glow, single sail mast emerald #22C55E light. Kopenhaga 22:30. 28mm f/2.8 wide.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Kopenhaga.\n\nGrade: amber Scandi + cool water + violet phone. Composition: phone left, canal houses right. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-09", "tytul": "Budapeszt Lanchid bridge night",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Reka chest-height na srodku mostu Lanc, Buda Castle illuminated violet #8338EC, Danube reflecting golden chain bridge bulbs.",
     "use_case": "Wegry reach, Eastern Europe persona.",
     "paleta": "Master + violet #8338EC castle", "vibe": "Lukasz Zal riverside imperial",
     "prompt": "Lukasz Zal riverside imperial cinematic. Hand at chest mid-bridge, Buda Castle illuminated violet #8338EC, Danube reflecting golden chain bridge bulbs. Lanchid Chain Bridge 22:00. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Budapest.\n\nGrade: violet castle + golden bridge + cool water + phone. Composition: phone lower-third, bridge silhouette upper. NO TEXT."},

    {"sekcja": "EUROPA REACH", "id": "EU-10", "tytul": "Sztokholm Gamla Stan 22:00 winter",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Reka chest-height w waskim Gamla Stan ulicy, snieg na bruku, ice-blue #B5E2FA window light z gornego mieszkania.",
     "use_case": "Szwecja reach, Nordic premium, IT-friendly.",
     "paleta": "Master + ice blue #B5E2FA", "vibe": "Hoyte van Hoytema Nordic Old-Town",
     "prompt": "Hoyte van Hoytema Nordic Old-Town. Hand chest-height in narrow ochre-painted Gamla Stan street, snow on cobbles, ice-blue #B5E2FA upper window light. Sztokholm 22:00 winter. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Stockholm.\n\nGrade: cool Nordic + ice blue + warm phone. Composition: phone center, narrow alley vanishing. NO TEXT."},

    # ===== INDOOR / INTYMNE =====
    {"sekcja": "INDOOR / INTYMNE", "id": "IN-01", "tytul": "Polska kuchnia 6:30 morning light",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na surowym debowym blacie, polowiczny kubek kawy z para, klucze, golden window light streaming.",
     "use_case": "Bez postaci - lifestyle still-life. Universal morning ritual.",
     "paleta": "Warm wood + cream + golden window + violet phone", "vibe": "Pawel Edelman warm Kodak Portra",
     "prompt": "Pawel Edelman warm Kodak Portra still-life. Phone resting flat on raw oak counter, half-mug of coffee with steam, set of keys, golden window light streaming. No hand visible. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, default map view.\n\nGrade: Kodak Portra warm. Composition: phone upper-center, accessories around, window light from left. Lower band copy space. NO TEXT."},

    {"sekcja": "INDOOR / INTYMNE", "id": "IN-02", "tytul": "Domowe biurko 23:00 desk lamp",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Telefon na ciemno-walnut biurku, single warm Edison bulb lampa rzucajaca dlugi cien, leather notebook closed, brass keys.",
     "use_case": "Late-night decision making moment. Bez persony.",
     "paleta": "Walnut + cognac leather + warm tungsten + violet phone", "vibe": "Greig Fraser cinematic still-life",
     "prompt": "Greig Fraser cinematic still-life. Phone on dark walnut desk, single warm Edison bulb lamp casting long shadow, leather notebook closed, brass keys. No hand. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm tungsten cinematic. Composition: phone center, lamp pool of light, deep shadow surround. Upper band copy. NO TEXT."},

    {"sekcja": "INDOOR / INTYMNE", "id": "IN-03", "tytul": "Kawiarnia 21:00 minimalna",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon na surowym betonowym stoliku third-wave kawiarni, bialy ceramic flat-white mug ring, amber #FFB700 pendant lamp.",
     "use_case": "Modern coffee culture, post-work decision.",
     "paleta": "Concrete + amber pendant + violet phone", "vibe": "Bradford Young third-wave cafe",
     "prompt": "Bradford Young third-wave cafe. Phone on raw concrete table, ceramic flat-white mug ring, amber #FFB700 pendant lamp. No hand. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm amber pendant + cool concrete. Composition: phone center, mug nearby, pendant top-out. NO TEXT."},

    {"sekcja": "INDOOR / INTYMNE", "id": "IN-04", "tytul": "Hotel lobby 22:30 cosmopolitan",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Telefon na marble lobby low-table, leather chesterfield armchair behind, cool emerald #22C55E ambient ceiling light.",
     "use_case": "Travel persona, business class, premium.",
     "paleta": "Marble + cognac leather + emerald + violet phone", "vibe": "Linus Sandgren luxury-neutral",
     "prompt": "Linus Sandgren luxury-neutral. Phone on marble lobby low-table, leather chesterfield armchair behind, cool emerald #22C55E ambient ceiling light. No hand. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: cool emerald + warm leather + violet. Composition: phone left, chesterfield right blurred. NO TEXT."},

    {"sekcja": "INDOOR / INTYMNE", "id": "IN-05", "tytul": "Sypialnia rano przy oknie",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon na bialej linen poscieli, golden morning sun streaking diagonal, blurred curtain edge.",
     "use_case": "Pierwszy moment dnia, pre-coffee. Universal.",
     "paleta": "White linen + soft gold + violet phone", "vibe": "Newton Thomas Sigel intimate dawn",
     "prompt": "Newton Thomas Sigel intimate dawn. Phone resting on white linen bedsheet, golden morning sun streaking diagonal, blurred curtain edge. No hand. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm dawn linen + violet phone glow. Composition: phone center, sun rays diagonal. NO TEXT."},

    # ===== MACRO / SURREAL / BRAND =====
    {"sekcja": "MACRO / SURREAL / BRAND", "id": "MS-01", "tytul": "Pin drop close-up macro",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Pojedyncza fioletowa pinezka MapJob (rounded square z biala teczka, pointed tail) na ciemnej macie, fioletowe halo swiatla pod spodem.",
     "use_case": "Brand mark, bumper, product hero.",
     "paleta": "Matte black + violet halo + cyan rim", "vibe": "Greig Fraser product hero",
     "prompt": "Greig Fraser product hero macro. Single deep-purple #7C3AED MapJob pin (rounded square, white briefcase glyph, pointed tail) on dark matte surface, faint violet halo radiating below. 100mm macro f/4 focus stacked.\n\nGrade: cinematic dark, crushed blacks, elevated violet. Composition: pin lower-right third, negative space upper-left for copy. NO TEXT. NEGATIVE: no other UI elements, clean abstract."},

    {"sekcja": "MACRO / SURREAL / BRAND", "id": "MS-02", "tytul": "Phone + paper map of Europe flat-lay",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down: telefon zawiesza sie 1cm nad papierowa mapa Europy na orzechowym biurku. Cyfrowe pinezki rzutuja sie na papier.",
     "use_case": "Cyfrowe x analogowe, Europe reach symbol.",
     "paleta": "Walnut + paper cream + violet phone projection", "vibe": "Edward Lachman top-down cinematic",
     "prompt": "Edward Lachman top-down cinematic. Phone hovers slightly above large paper Europe map on walnut desk, screen casts soft violet/cyan glow onto Poland on paper. Brass compass, leather notebook, espresso cup. 35mm f/5.6 overhead.\n\nPHONE: MapJob DARK full spec, EU-zoom.\n\nGrade: warm walnut + violet projection. Composition: top-down centered. Upper band copy. NO TEXT."},

    {"sekcja": "MACRO / SURREAL / BRAND", "id": "MS-03", "tytul": "Portal - phone screen as window to city",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Telefon levituje w black void, ekran to dosłownie miniature 3D Polish cityscape, tall purple pin-monoliths over rooftops, microscopic figures walking.",
     "use_case": "Surreal brand statement, premium.",
     "paleta": "Deep black + violet city glow + cyan accents", "vibe": "Magritte x Pixar x Apple",
     "prompt": "Magritte x Pixar x Apple surreal photoreal. Phone floats in black void, screen IS literal miniature 3D Polish cityscape, glowing purple #7C3AED pin-monoliths over rooftops, microscopic figures walking, soft violet fog beyond phone edges. MapJob dark UI framing remains at top bar and bottom CTA. 50mm f/2.8 centered.\n\nGrade: deep void + violet city glow. Composition: phone centered symmetric. Top-bottom copy bands. NO TEXT."},

    {"sekcja": "MACRO / SURREAL / BRAND", "id": "MS-04", "tytul": "Fireflies - pins over Mazury countryside",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Aerial wide nad Mazury Lake District o zmierzchu, tysiace tiny purple pins floating like fireflies nad lasami i wioskami.",
     "use_case": "Environmental brand, kraj-szeroki zasieg.",
     "paleta": "Lake silver + forest green + violet fireflies + warm horizon", "vibe": "Werner Herzog x Apple",
     "prompt": "Werner Herzog x Apple environmental cinematic. Aerial wide-angle over Masurian Lake District at dusk, thousands of tiny purple #7C3AED glowing pins scattered like fireflies above forests, villages, lakesides. Faint aurora-like violet ribbon. 24mm f/4.\n\nGrade: lake silver + forest dark + violet. Composition: aerial wide, sky upper third copy space. NO TEXT."},

    {"sekcja": "MACRO / SURREAL / BRAND", "id": "MS-05", "tytul": "Diverse hands placing pins overhead",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down na ciemny walnut stol z papierowa mapa Polski, 7 roznych dloni siegajacych z krawedzi placing physical purple pins.",
     "use_case": "Inclusive brand values, no faces.",
     "paleta": "Walnut + cream paper + violet pins + warm overhead", "vibe": "Bradford Young inclusive overhead",
     "prompt": "Bradford Young x Apple inclusive overhead. Top-down dark walnut table with paper Polska map, seven different hands (worn, manicured, older, chef apron, paramedic glove, teenager, scholar) reaching from edges placing physical purple pins. Moody warm key. 50mm f/5.6.\n\nGrade: cinematic deep + warm key. Composition: radial centered. NO TEXT."},

    # ===== NATURE & ELEMENTS =====
    {"sekcja": "NATURA & ZIVIOLY", "id": "NT-01", "tytul": "Phone on moss rock - Bieszczady forest",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Glowny las polski (Bieszczady), mossy granitowa skala jako naturalny pedestal, telefon na mchu, dappled forest light filtering through Carpathian beech canopy.",
     "use_case": "Outdoor / rural Polska, regionalny ad.",
     "paleta": "Forest green + golden dapples + violet phone", "vibe": "Peter Lik nature cinematic",
     "prompt": "Peter Lik nature cinematic x Apple. Deep Polish forest, mossy granite rock as natural pedestal, phone resting on moss, dappled forest light filtering through Carpathian beech canopy. Bieszczady. 50mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: forest green + warm dapples + violet. Composition: phone center on rock, forest deep around. NO TEXT."},

    {"sekcja": "NATURA & ZIVIOLY", "id": "NT-02", "tytul": "Phone on Mazury lakeside dock",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Drewniane molo nad Mazury jezioro o zlocistej godzinie, telefon na krawedzi, jezioro stretching to horizon, sailboats far in distance.",
     "use_case": "Wakacyjny / weekend persona, regionalny.",
     "paleta": "Golden water + warm wood + violet phone", "vibe": "Reuben Wu lakeside cinematic",
     "prompt": "Reuben Wu lakeside cinematic. Wooden lakeside dock at Mazury at golden hour, phone resting at edge with lake stretching to horizon, sailboats far distance. 35mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin Olsztyn region.\n\nGrade: warm gold lake + violet phone. Composition: phone left, lake horizontal mid, sky upper. NO TEXT."},

    {"sekcja": "NATURA & ZIVIOLY", "id": "NT-03", "tytul": "Phone in palm Tatry summit",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Reka na szczycie Rysy/Giewont, telefon w palm na tle panoramy Tatr fading w mgle, alpenglow on snow caps.",
     "use_case": "Ambicja / osiagniecie, regional Tatry.",
     "paleta": "Alpine pink + cool blue shadow + violet phone", "vibe": "Reuben Wu summit cinematic",
     "prompt": "Reuben Wu summit cinematic. Hand on Rysy/Giewont peak, phone in palm against panorama of Tatra mountains receding into haze, alpenglow on snow caps. 35mm f/8 deep wide.\n\nPHONE: MapJob DARK full spec, selected pin Zakopane.\n\nGrade: alpine pink + cool blue + warm phone. Composition: phone lower-center, peaks receding upper. NO TEXT."},

    {"sekcja": "NATURA & ZIVIOLY", "id": "NT-04", "tytul": "Phone on Baltyk beach sunrise",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Telefon w mokrym Baltyckim piasku, dawn pink sky, gentle waves lapping near, single seagull silhouette.",
     "use_case": "Coastal Polska, fresh-start moment.",
     "paleta": "Dawn pink + sand + violet phone", "vibe": "Joel Meyerowitz beach cinematic",
     "prompt": "Joel Meyerowitz beach cinematic. Phone half-buried in damp Baltic sand, dawn pink sky, gentle waves lapping near, single seagull silhouette. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Gdansk/Gdynia.\n\nGrade: dawn pink + cool sand + violet. Composition: phone lower-third, horizon mid, sky upper. NO TEXT."},

    {"sekcja": "NATURA & ZIVIOLY", "id": "NT-05", "tytul": "Phone among lavender field",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Polskie pole lawendy w pelnym kwitnieniu (Lubelszczyzna), telefon na drewnianej lawce na krawedzi pola, late afternoon sun.",
     "use_case": "Idilic Polska, niche premium, Lubelszczyzna.",
     "paleta": "Lavender purple + green + golden + violet phone", "vibe": "Charlie Waite nature cinematic",
     "prompt": "Charlie Waite nature cinematic. Polish lavender farm in bloom (Lubelszczyzna exists), phone resting on wooden bench at edge of field, late afternoon sun. 35mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin Lublin region.\n\nGrade: lavender purple match + golden warm + violet phone (subtle pin matches lavender hue). Composition: phone center-left, field stretching right. NO TEXT."},

    # ===== ARCHITECTURAL & GEOMETRIC =====
    {"sekcja": "ARCHITEKTURA & GEOMETRIA", "id": "AR-01", "tytul": "Brutalist concrete monument",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Massive raw concrete monolit (Soviet-era polski monument feel), telefon w foreground, hard sun-key z prawej cast crisp geometric shadow.",
     "use_case": "Brutalist statement, slaski ad.",
     "paleta": "Cool concrete grey + violet phone + cyan sky", "vibe": "Andreas Gursky monumentalism",
     "prompt": "Andreas Gursky x Apple monumentalism. Massive raw concrete monolith fills right two-thirds (Soviet-era Polish monument feel), phone held foreground left chest-height. Single hard sun-key from camera-right casts crisp geometric shadow. Daylight. 35mm f/8 deep focus.\n\nPHONE: MapJob DARK full spec, selected pin Katowice.\n\nGrade: cool concrete + cyan sky. Composition: phone left, monolith right. NO TEXT."},

    {"sekcja": "ARCHITEKTURA & GEOMETRIA", "id": "AR-02", "tytul": "Glass skyscraper symmetric reflection",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Perfectly symmetric glass facade reflecting sky and second tower opposite, vanishing point center. Telefon hovers low-center.",
     "use_case": "Modern Warsaw business district, premium.",
     "paleta": "Cold blue glass + violet pin glow + emerald", "vibe": "Hiroshi Sugimoto symmetric architectural",
     "prompt": "Hiroshi Sugimoto x Apple symmetric architectural. Perfectly symmetric glass facade reflecting sky and second tower opposite, vanishing point center. Phone hovers low-center, hand grip. 24mm f/5.6 wide architectural. Daylight overcast.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa.\n\nGrade: cold glass + violet phone + emerald accent. Composition: symmetric, phone center. NO TEXT."},

    {"sekcja": "ARCHITEKTURA & GEOMETRIA", "id": "AR-03", "tytul": "Modernist gallery white cube plinth",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "White-cube gallery space, single white plinth center, telefon na top, single overhead spot. Pure white walls, polished concrete floor.",
     "use_case": "Museum-grade, designerska elite, art-class.",
     "paleta": "White-cream + violet phone glow", "vibe": "James Turrell minimalist gallery",
     "prompt": "James Turrell x Apple minimalist gallery. White-cube gallery space, single white plinth center, phone resting on top, single overhead spot. Pure white walls, polished concrete floor. 50mm f/2.8 centered symmetric.\n\nPHONE: MapJob DARK full spec.\n\nGrade: pure white + violet phone as only color. Composition: symmetric centered. Upper-right copy. NO TEXT."},

    # ===== DOCUMENTARY / PHOTOJOURNALISM =====
    {"sekcja": "DOKUMENT / PHOTOJOURNALISM", "id": "DC-01", "tytul": "Magnum-style market vendor Torun",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Polski targ-stoisko w Toruniu o 8 rano, vegetable crates, vendor's weathered hands chest-height holding phone, faded apron.",
     "use_case": "Real Polska, dignified work, regionalny.",
     "paleta": "Muted earth + cream + violet phone as only saturated", "vibe": "Sebastiao Salgado dignified",
     "prompt": "Sebastiao Salgado x Apple dignified documentary. Polish farmers market stall Torun 8am, vegetable crates, vendor weathered hands chest-height holding phone, faded apron. Overcast soft daylight. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Torun.\n\nGrade: muted earth + cream + violet pop. Composition: phone center, crates around. NO TEXT."},

    {"sekcja": "DOKUMENT / PHOTOJOURNALISM", "id": "DC-02", "tytul": "Polish farmer hands wheat field",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Extreme close-up of weathered, dirt-streaked hands holding phone in wheat field at golden hour. Wedding ring visible, deep lifelines.",
     "use_case": "Rural Polska, dignified labor, soil-to-screen narrative.",
     "paleta": "Golden wheat + earth-brown + violet phone", "vibe": "James Nachtwey rural documentary",
     "prompt": "James Nachtwey x Apple rural documentary. Extreme close-up weathered dirt-streaked hands holding phone in wheat field at golden hour. Wedding ring visible, deep lifelines. 100mm macro f/4.\n\nPHONE: MapJob DARK full spec, selected pin rural Polska.\n\nGrade: golden wheat warm + earth + violet. Composition: hands centered, wheat surrounding. Upper band copy. NO TEXT."},

    {"sekcja": "DOKUMENT / PHOTOJOURNALISM", "id": "DC-03", "tytul": "Construction worker break Wroclaw",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Polski plac budowy poza Wroclawiem o przerwie obiadowej, worker sits on cement bag, hard hat beside, holding phone. Half-built building behind softly out of focus.",
     "use_case": "Real budowlanka, polski rzemieslnik core target.",
     "paleta": "Hi-vis yellow + concrete + violet phone", "vibe": "Eugene Smith industrial dignity",
     "prompt": "Eugene Smith x Apple industrial dignity. Construction site outside Wroclaw lunch break, worker sits on cement bag, hard hat beside, holding phone. Half-built building behind softly OOF. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Wroclaw.\n\nGrade: hi-vis + concrete + violet. Composition: phone center, half-build right blurred. NO TEXT."},

    {"sekcja": "DOKUMENT / PHOTOJOURNALISM", "id": "DC-04", "tytul": "Train conductor Warszawa Centralna",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "PKP Intercity konduktor w mundurze, na peronie Warszawa Centralna, phone glance between announcements, train doors closing behind.",
     "use_case": "Public service worker, kolei persona.",
     "paleta": "Navy uniform + amber platform + violet phone", "vibe": "Henri Cartier-Bresson decisive moment",
     "prompt": "Henri Cartier-Bresson x Apple decisive moment. PKP Intercity conductor in uniform, on Warszawa Centralna platform, phone glance between announcements, train doors closing behind. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa.\n\nGrade: navy uniform + amber platform + violet. Composition: conductor center, train side. NO TEXT."},

    {"sekcja": "DOKUMENT / PHOTOJOURNALISM", "id": "DC-05", "tytul": "Hospital break room nurse",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Polska szpital pielegniarka, mid-30s, w scrubs, sitting on plastic break-room chair, phone in hand. Vending machine glow behind.",
     "use_case": "Healthcare worker, sluzba zdrowia persona.",
     "paleta": "Scrub teal + fluorescent + violet phone", "vibe": "Mary Ellen Mark healthcare",
     "prompt": "Mary Ellen Mark x Apple healthcare. Polish hospital nurse mid-30s in scrubs, sitting plastic break-room chair, phone in hand. Vending machine glow behind. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: cool scrub teal + amber vending + violet. Composition: nurse center, vending behind. NO TEXT."},

    # ===== SURREAL & DREAMLIKE =====
    {"sekcja": "SUREALIZM & SEN", "id": "SR-01", "tytul": "Phone floating in wheat field at sunset",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Polskie pole pszenicy do horyzontu, single smartphone levituje 1.5m above ground, golden hour light. No hand, no body, just phone suspended.",
     "use_case": "Surreal brand, abstract opportunity metaphor.",
     "paleta": "Golden wheat + amber sky + violet phone glow", "vibe": "Magritte impossible reality",
     "prompt": "Magritte x Apple impossible reality. Polish wheat field stretching to horizon, single smartphone levitates 1.5m above ground, golden hour light. No hand, no body, just phone suspended. 50mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin rural.\n\nGrade: golden wheat warm + violet phone. Composition: phone centered floating, wheat below, horizon. NO TEXT."},

    {"sekcja": "SUREALIZM & SEN", "id": "SR-02", "tytul": "Hand emerging from water with phone",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Surface of dark still water (Mazury lake), reka rises slowly z spod, holding telefon aloft, woda cascading off, phone screen still glowing dry.",
     "use_case": "Emergence / breakthrough metaphor.",
     "paleta": "Black water + cyan ripples + violet phone", "vibe": "Bill Viola water-emergence",
     "prompt": "Bill Viola x Apple water-emergence. Surface of dark still water (Mazury lake), hand rises slowly from beneath holding phone aloft, water cascading off, phone screen glowing dry untouched. 50mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: black water + cyan ripples + violet. Composition: hand+phone center, water lower. NO TEXT."},

    {"sekcja": "SUREALIZM & SEN", "id": "SR-03", "tytul": "Phone as door-knocker on giant gate",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Massive ancient wooden gate (medieval Polish style), smartphone integrated as door knocker, clearly proportioned correctly, mounted in iron fittings.",
     "use_case": "Surreal threshold metaphor, brand statement.",
     "paleta": "Weathered wood + black iron + violet phone glow", "vibe": "Magritte threshold literalized",
     "prompt": "Magritte x Apple threshold literalized. Massive ancient wooden gate (medieval Polish style) fills frame, smartphone integrated as door knocker, proportioned correctly to be a phone, mounted in iron fittings. 35mm f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: weathered wood + iron + violet. Composition: gate fills, phone center as knocker. NO TEXT."},

    {"sekcja": "SUREALIZM & SEN", "id": "SR-04", "tytul": "Phone projecting starscape constellations",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Dark interior, telefon face-up on black surface, beam of light projects upward into air forming a starscape - but each star is a violet pin.",
     "use_case": "Mythology meets technology, premium brand.",
     "paleta": "Deep black + violet pin-stars + cyan accents", "vibe": "Greig Fraser projection mythology",
     "prompt": "Greig Fraser x Apple projection mythology. Dark interior, phone face-up on black surface, beam of light projects upward into air forming starscape of constellations - but each star is a violet #7C3AED pin. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: deep void + violet pins. Composition: phone bottom, projection upward filling. NO TEXT."},

    {"sekcja": "SUREALIZM & SEN", "id": "SR-05", "tytul": "Phone half-submerged in honey amber",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Telefon halfway sunk into pool of golden Polish honey, screen still visible glowing through translucent material.",
     "use_case": "Preservation, lasting value, abstract brand.",
     "paleta": "Amber honey + violet pin glow + warm gold rim", "vibe": "Storm Thorgerson surreal",
     "prompt": "Storm Thorgerson x Apple surreal preservation. Phone halfway sunk into pool of golden Polish honey (or solidified amber), screen still visible glowing through translucent material. 100mm macro f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: amber honey warm + violet pin. Composition: phone half-in honey, macro detail. NO TEXT."},

    # ===== SPORT & ACTIVE =====
    {"sekcja": "SPORT & ACTIVE", "id": "SP-01", "tytul": "Runner pause Wisla boulevard sunrise",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Polski biegacz na bulwarach Wislanych o wschodzie slonca, pauses na running app moment, phone w opasce na ramieniu visible chest-height through unzipped windbreaker.",
     "use_case": "Active lifestyle, urban runner persona.",
     "paleta": "Dawn pink + cool grey + violet phone", "vibe": "Annie Leibovitz active lifestyle",
     "prompt": "Annie Leibovitz x Apple active lifestyle. Polish runner on Vistula riverside boulevard at sunrise, pauses on running app moment, phone in armband visible chest-height through unzipped windbreaker. Sweat sheen, breath vapor. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa.\n\nGrade: dawn pink + cool atmosphere + violet. Composition: runner center, river behind. NO TEXT."},

    {"sekcja": "SPORT & ACTIVE", "id": "SP-02", "tytul": "Climbing wall belay break",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Indoor bouldering gym, climber chalked up, phone in pocket pulled out at break, holds and ropes blurred behind.",
     "use_case": "Active gen Z, athletic precision.",
     "paleta": "Rubber red + chalk white + violet phone", "vibe": "Jimmy Chin gym athletic",
     "prompt": "Jimmy Chin x Apple gym athletic. Indoor bouldering gym, climber chalked up, phone in pocket pulled out at break, holds and ropes blurred behind. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: rubber red + chalk white + violet. Composition: climber center, holds blurred behind. NO TEXT."},

    {"sekcja": "SPORT & ACTIVE", "id": "SP-03", "tytul": "Cyclist Tatry mountain pass",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Road cyclist stopped at panoramic switchback above Zakopane, helmet off, phone showing route + pin nearby. Tatra peaks behind.",
     "use_case": "Outdoor sport, alpine ambition.",
     "paleta": "Alpine blue + neon jersey orange + violet phone", "vibe": "Jimmy Chin alpine cinematic",
     "prompt": "Jimmy Chin x Apple alpine cinematic. Road cyclist stopped panoramic switchback above Zakopane, helmet off, phone showing route + pin nearby. Tatra peaks behind. 28mm f/4 wide.\n\nPHONE: MapJob DARK full spec, selected pin Tatry.\n\nGrade: alpine blue + neon jersey + violet. Composition: cyclist left, peaks right vista. NO TEXT."},

    {"sekcja": "SPORT & ACTIVE", "id": "SP-04", "tytul": "Yoga studio mat morning sunlit",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Sunlit polski yoga studio, single rolled mat, phone resting on hardwood beside, soft tropical plants.",
     "use_case": "Wellness, mindful weekend persona.",
     "paleta": "Warm wood + sage green + violet phone + golden window", "vibe": "Tim Walker minimal wellness",
     "prompt": "Tim Walker x Apple minimal wellness. Sunlit Polish yoga studio, single rolled mat, phone resting on hardwood beside, soft tropical plants. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm wood + sage + golden + violet. Composition: phone center on floor, mat beside, plant blur. NO TEXT."},

    {"sekcja": "SPORT & ACTIVE", "id": "SP-05", "tytul": "Skate park dusk",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Polski skate park o zmierzchu, ramps in background, skater sits on board edge, phone in hand under last sun. Concrete texture rich.",
     "use_case": "Youth culture, gen Z target, urban edge.",
     "paleta": "Concrete grey + sunset orange + violet phone", "vibe": "Bryan Schutmaat dusk youth",
     "prompt": "Bryan Schutmaat x Apple dusk youth. Polish skate park at dusk, ramps in background, skater sits on board edge, phone in hand under last sun. Concrete texture rich. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: concrete + sunset orange + violet. Composition: skater center on board, ramps behind. NO TEXT."},

    # ===== HIGH-KEY MINIMALIST =====
    {"sekcja": "HIGH-KEY MINIMALIST", "id": "HK-01", "tytul": "White cube studio phone hero",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Pure white cyclorama studio, telefon floating-suspended on invisible stand, soft wraparound bright key, zero shadows.",
     "use_case": "Editorial product purity, biały tle dla overlay copy.",
     "paleta": "Pure white + violet pin glow", "vibe": "Joel Grimes editorial product",
     "prompt": "Joel Grimes x Apple editorial product. Pure white cyclorama studio, phone floating-suspended invisible stand, soft wraparound bright key, zero shadows. 100mm f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: pure white + violet only color. Composition: phone center floating. Corner negative space. NO TEXT."},

    {"sekcja": "HIGH-KEY MINIMALIST", "id": "HK-02", "tytul": "Cream linen flat-lay",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Top-down on cream linen surface, phone alone, bright airy daylight, soft fabric texture.",
     "use_case": "Sunday clarity, slow morning luxury.",
     "paleta": "Cream + white + violet phone", "vibe": "Annie Leibovitz minimal Sunday",
     "prompt": "Annie Leibovitz x Apple minimal Sunday. Top-down cream linen surface, phone alone, bright airy daylight, soft fabric texture. 50mm f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: cream + white + violet. Composition: top-down centered phone, fabric texture surrounding. Upper-right copy. NO TEXT."},

    {"sekcja": "HIGH-KEY MINIMALIST", "id": "HK-03", "tytul": "Beach white sand high-key",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Bright Baltyk beach white sand close-up, telefon half-buried, sun blazing overhead, no horizon visible.",
     "use_case": "Hot bright vacation, summer optimism.",
     "paleta": "White sand + sun gold + violet phone", "vibe": "Slim Aarons sun-drenched",
     "prompt": "Slim Aarons x Apple sun-drenched. Bright Baltic beach white sand close-up, phone half-buried, sun blazing overhead, no horizon visible. 50mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin Sopot/Gdynia.\n\nGrade: white sand + sun gold + violet. Composition: phone center half-buried, sand textural surround. NO TEXT."},

    # ===== POP-ART & STREET CULTURE =====
    {"sekcja": "POP-ART & STREET", "id": "PA-01", "tytul": "Graffiti wall Praga-Polnoc",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Vibrant graffiti wall w Warszawa Praga district, full of street-art tags i murals, phone held against the wall, hand chest-height.",
     "use_case": "Urban culture, gen Z target.",
     "paleta": "Graffiti yellow + magenta + cyan + violet phone", "vibe": "Martha Cooper street culture",
     "prompt": "Martha Cooper x Apple street culture. Vibrant graffiti wall Warszawa Praga district, street-art tags and murals, phone against wall, hand chest-height. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa Praga.\n\nGrade: graffiti rainbow + violet phone (matches palette). Composition: phone center, wall texture. NO TEXT."},

    {"sekcja": "POP-ART & STREET", "id": "PA-02", "tytul": "Neon Tokyo-style alley Lodz",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Lodz aleja stylized like Tokyo Akihabara, multi-colored neon signs in Polish, phone held chest-height, vivid color spillage on hand.",
     "use_case": "Hyper-urban, future-Polska imagined.",
     "paleta": "Rainbow neon + violet phone (blends in)", "vibe": "Liam Wong Tokyo-Polska hybrid",
     "prompt": "Liam Wong x Apple Tokyo-Polska hybrid. Lodz alley styled like Tokyo Akihabara, multi-colored neon signs in Polish, phone held chest-height, vivid color spillage on hand. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin Lodz.\n\nGrade: rainbow neon + violet phone match. Composition: phone center, neon dense surround. NO TEXT."},

    {"sekcja": "POP-ART & STREET", "id": "PA-03", "tytul": "Festival crowd golden hour",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Polski music festival (Open'er / Off-Festival vibe), crowd silhouettes against golden sun, phone held overhead.",
     "use_case": "Collective cultural moment, festival persona.",
     "paleta": "Silhouette black + sun gold + violet phone", "vibe": "Alex Webb collective decisive moment",
     "prompt": "Alex Webb x Apple collective decisive moment. Polish music festival (Open'er/Off feel), crowd silhouettes against golden sun, phone held overhead. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: silhouette + sun gold + violet. Composition: phone overhead foreground, crowd silhouettes mid, sun back. NO TEXT."},

    # ===== AERIAL DRONE =====
    {"sekcja": "AERIAL & DRONE", "id": "AD-01", "tytul": "Aerial Warszawa Palac Kultury sunrise",
     "format": "16:9 (1920x1080)",
     "co_widzimy": "Drone shot directly above PKiN at sunrise, surrounding city radiating geometric patterns, single phone visible far below na balkonie as tiny glowing dot.",
     "use_case": "Vast city, single decision metaphor.",
     "paleta": "Dawn pink + city grey + violet pin-phone tiny", "vibe": "Reuben Wu aerial cinematic",
     "prompt": "Reuben Wu x Apple aerial cinematic. Drone shot directly above PKiN at sunrise, surrounding Warsaw city radiating geometric patterns, single phone visible far below on a balcony as tiny glowing dot. 24mm wide drone.\n\nPHONE: MapJob DARK full spec at tiny scale.\n\nGrade: dawn pink + city grey + violet dot. Composition: PKiN center top-down, geometric radiating. NO TEXT."},

    {"sekcja": "AERIAL & DRONE", "id": "AD-02", "tytul": "Aerial Krakow Rynek pattern",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down drone over Rynek Glowny showing geometric stalls and Sukiennice, phone visible on cafe table in one corner.",
     "use_case": "Heritage x modernity, krakowski regional.",
     "paleta": "Cobblestone grey + market color + violet phone", "vibe": "Reuben Wu top-down geometric",
     "prompt": "Reuben Wu x Apple top-down geometric. Drone over Rynek Glowny showing geometric stalls and Sukiennice, phone visible on cafe table in one corner. 24mm wide.\n\nPHONE: MapJob DARK full spec, selected pin Krakow.\n\nGrade: grey cobble + market warm + violet pop. Composition: top-down centered, phone corner. NO TEXT."},

    {"sekcja": "AERIAL & DRONE", "id": "AD-03", "tytul": "Aerial Tatra peaks vertical",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Vertical aerial of Tatra summits at golden hour, phone in foreground hiker hand at edge of cliff.",
     "use_case": "Epic vista, ambicja, mountain target.",
     "paleta": "Alpine pink + snow white + violet phone", "vibe": "Jimmy Chin alpine vertical",
     "prompt": "Jimmy Chin x Apple alpine vertical. Vertical aerial Tatra summits at golden hour, phone in foreground hiker hand at edge of cliff. 24mm wide vertical.\n\nPHONE: MapJob DARK full spec, selected pin Tatry.\n\nGrade: alpine pink + snow + violet. Composition: hand foreground bottom, peaks receding upward. NO TEXT."},

    {"sekcja": "AERIAL & DRONE", "id": "AD-04", "tytul": "Aerial Mazury lakes archipelago",
     "format": "1:1 (1080x1080)",
     "co_widzimy": "Top-down on Polish Mazury lakes from 800m up, lakes form natural pattern, phone in canoe centered as scale.",
     "use_case": "Serene possibility, lake region.",
     "paleta": "Lake blue + forest green + violet phone tiny", "vibe": "Reuben Wu lake aerial",
     "prompt": "Reuben Wu x Apple lake aerial. Top-down Mazury lakes from 800m, lakes form natural pattern, phone in canoe centered as scale. 24mm wide.\n\nPHONE: MapJob DARK full spec at small scale.\n\nGrade: lake blue + forest + violet. Composition: top-down lakes pattern, canoe center. NO TEXT."},

    # ===== CYBERPUNK / SCI-FI =====
    {"sekcja": "CYBERPUNK & SCI-FI", "id": "CY-01", "tytul": "Neon Warszawa 2099 cyberpunk",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Wyobrażony future Warszawa skyline at night with hovering vehicles, vertical neon Polish-language signs in Cyrillic-Latin hybrid, phone in foreground hand glowing.",
     "use_case": "Future-Polska imagined, sci-fi premium ad.",
     "paleta": "Cyberpunk magenta + cyan + violet phone match", "vibe": "Liam Wong x Greig Fraser Dune",
     "prompt": "Liam Wong x Greig Fraser Dune cyberpunk. Imagined future Warszawa skyline at night with hovering vehicles, vertical neon Polish-language signs in Cyrillic-Latin hybrid, phone in foreground hand glowing. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin 'Warszawa Future'.\n\nGrade: cyberpunk magenta + cyan + violet. Composition: phone foreground, skyline back. NO TEXT."},

    {"sekcja": "CYBERPUNK & SCI-FI", "id": "CY-02", "tytul": "Holographic phone augmented reality",
     "format": "4:5 (1080x1350)",
     "co_widzimy": "Person holds phone, ale zamiast ekran, mapa projects upward as 3D holographic city in air, pinezki floating as suspended dots, AR style.",
     "use_case": "Tech-future product demo, premium.",
     "paleta": "Holographic violet + cyan + ambient grey", "vibe": "Greig Fraser holographic AR",
     "prompt": "Greig Fraser x Apple holographic AR. Person holds phone, but instead of just screen, map projects upward as 3D holographic city in air, pins floating as suspended dots, AR style. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec with AR projection.\n\nGrade: holographic violet + cyan + ambient. Composition: phone bottom, AR city upper. NO TEXT."},

    {"sekcja": "CYBERPUNK & SCI-FI", "id": "CY-03", "tytul": "Underground neon corridor",
     "format": "9:16 (1080x1920)",
     "co_widzimy": "Futuristic Polish metro corridor with violet neon strip lights, person walking phone in hand, motion blur na receding lights.",
     "use_case": "Vector toward opportunity, transit-tech.",
     "paleta": "Corridor violet + chrome + violet phone perfect match", "vibe": "Liam Wong x Greig Fraser metro",
     "prompt": "Liam Wong x Greig Fraser metro. Futuristic Polish metro corridor with violet neon strip lights, person walking phone in hand, motion blur on receding lights. 28mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa metro.\n\nGrade: corridor violet + chrome + perfect match phone. Composition: corridor vanishing point, phone hand foreground. NO TEXT."},
]

# Wczytaj istniejacy skrypt
import re
with open(r'C:\Users\48721\Desktop\MAPJOB CLAUDE\generate_katalog_word.py', 'r', encoding='utf-8') as f:
    script = f.read()

# Generuj kod nowych wpisow jako Python literal
new_entries_code = ""
for e in ADDITIONAL:
    # Escape any double-quotes inside string values
    new_entries_code += "    {\n"
    for key, value in e.items():
        # Use repr for safe escaping but keep readable
        # Replace " with \" for double-quoted Python string
        if isinstance(value, str):
            escaped = value.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
            new_entries_code += f'        "{key}": "{escaped}",\n'
    new_entries_code += "    },\n"

# Znajdz koniec listy ENTRIES
# Wzor: ostatni "]" przed "# ===== POMOCNICZE =====" lub przed "def add_paragraph"
marker = "# ===== POMOCNICZE ====="
idx = script.find(marker)
if idx == -1:
    print("BLAD - nie znaleziono markera POMOCNICZE")
    exit(1)

# Cofnij sie do ostatniego "]" przed markerem
end_of_list = script.rfind("]", 0, idx)
if end_of_list == -1:
    print("BLAD - nie znaleziono konca listy")
    exit(1)

# Wstaw nowe wpisy przed "]"
new_script = script[:end_of_list] + new_entries_code + script[end_of_list:]

with open(r'C:\Users\48721\Desktop\MAPJOB CLAUDE\generate_katalog_word.py', 'w', encoding='utf-8') as f:
    f.write(new_script)

print(f"OK - dodano {len(ADDITIONAL)} nowych wpisow")
print(f"Nowy rozmiar skryptu: {len(new_script)} znakow")
