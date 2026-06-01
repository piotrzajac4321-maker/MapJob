# -*- coding: utf-8 -*-
"""
MapJob — Katalog reklamowy
Generator pliku Word z wszystkimi promptami obrazów reklamowych
"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# ===== KOLORY MAPJOB =====
COLOR_PURPLE = RGBColor(0x7C, 0x3A, 0xED)   # pin
COLOR_CYAN = RGBColor(0x00, 0xC8, 0xD4)     # CTA
COLOR_EMERALD = RGBColor(0x22, 0xC5, 0x5E)  # success
COLOR_DARK = RGBColor(0x0A, 0x0A, 0x14)     # UI ground
COLOR_BLUE = RGBColor(0x3B, 0x82, 0xF6)     # cluster
COLOR_GREY_MID = RGBColor(0x66, 0x66, 0x70)
COLOR_GREY_DARK = RGBColor(0x33, 0x33, 0x3A)

# ===== DANE: WSZYSTKIE WPISY =====

ENTRIES = [
    # ====================================================
    # SEKCJA 1: HERO IMAGES (informacyjne, pod scenariusze)
    # ====================================================
    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-01", "tytul": "Pełen tutorial — keyframe",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Telefon w dłoni na tle rozmytej, ciepłej kawiarni. Na ekranie pełna mapa Polski z fioletowymi pinezkami (briefcase icon), jedna podświetlona z kartą profilu od dołu. Filtr 'Zlecenie' aktywny w cyanie.",
     "use_case": "Top-of-funnel hero. Meta feed, LinkedIn, główny display ad. Pokazuje całość aplikacji w jednym kadrze.",
     "paleta": "Graphite + cream café + violet pin + cyan + emerald", "vibe": "Apple product photography × clean editorial (Bridget Pierson)",
     "prompt": """Photorealistic editorial product photograph in the style of Apple iPhone product imagery + clean editorial. Three-quarter angle close-up of a modern flagship smartphone held in an ungendered adult hand with charcoal wool sleeve, no rings, neutral skin tone. Phone occupies center 50% of frame, slightly tilted at 8°.

PHONE SCREEN — fully legible: MapJob app DARK MODE. Background near-black #0A0A14. "MapJob" wordmark top-left (dark navy with orange pin glyph). Filter chips "Firma"/"Zlecenie"/"Etat" — "Zlecenie" filled cyan #00C8D4. Map: light Google-Maps cartography of Poland with cities labeled (Warszawa, Kraków, Gdańsk, Wrocław, Poznań). Pins: deep purple #7C3AED rounded-square with white briefcase icon, dense across Polska, sparser into Berlin/Praga edges. Selected pin Warszawa with violet pulse halo, profile card sliding from bottom. Cluster blue #3B82F6 round circle "3" near Trójmiasto. Bottom CTA pill cyan "Otwórz pełną mapę".

Background: softly out-of-focus modern café, blurred warm pendant, daylight from camera-left. Lighting: soft directional daylight, phone screen as cool counter-light. Lens: 50mm f/2.8 shallow DOF. NO TEXT in render — leave upper-right negative space for post typography. NEGATIVE: no light theme, no red Google teardrop pins, no extra logos, no plastic AI sheen."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-02", "tytul": "5 km od domu — promień",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Osoba w spokojnej polskiej dzielnicy mieszkalnej (kamienica + park) z telefonem na wysokości klatki piersiowej. Na ekranie mapa zoom okolicy + cyan kółko 5 km radius wokół 'TY' pinezki + 12-15 fioletowych pinezek wewnątrz.",
     "use_case": "Use-case explainer — 'znajdź pracę 5 km od domu'. Najsilniejszy persona+phone fit. Reels, story, persona-targeted ad.",
     "paleta": "Warm autumn ochre + kamienica beige + violet pins + cyan radius circle", "vibe": "Annie Leibovitz × Apple lifestyle",
     "prompt": """Photorealistic lifestyle photograph in the style of Annie Leibovitz × Apple. Universal person (no face, only torso and hand) standing on quiet residential Polish street (kamienica + small park visible), holding smartphone at chest height. Charcoal wool coat, neutral sleeve.

PHONE SCREEN — tack sharp: MapJob DARK UI zoomed on user's neighborhood (Polish street names softly readable). Semi-transparent CYAN circle (#00C8D4 at 25% opacity) overlays map with 5km radius centered on glowing emerald "TY" pin. 12-15 deep purple briefcase pins inside. Bottom UI: "Promień: 5 km" with slider. CTA pill: "Pokaż oferty (15)" cyan. Filter chip "Etat" active.

Background: residential Polish street, kamienica facades soft bokeh, distant tram, autumn leaves on cobblestones, late afternoon golden sunlight. Lighting: warm golden side-light from right, phone glow as cool counter-tone. Lens: 35mm f/2.0 slight low angle. NO TEXT — upper third clear for post."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-03", "tytul": "Google login w 15 sekund",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Top-down: telefon na orzechowym biurku, dwa kciuki wchodzące w kadr. Na ekranie powitanie MapJob z głównym CTA 'Kontynuuj z Google' + tekst 'Bezpłatnie. Bez hasła. 15 sekund.'.",
     "use_case": "Onboarding ad — przekonać do rejestracji. Display, retargeting, cold-traffic.",
     "paleta": "Warm walnut + cream + violet phone glow + Google brand colors + cyan", "vibe": "Apple Pay product reveal, top-down macro",
     "prompt": """Photorealistic product photograph in Apple Pay product reveal style. Top-down on clean walnut desk, smartphone flat at center, screen filling 70% of phone display. Two thumbs entering frame from below.

PHONE SCREEN: MapJob welcome screen DARK MODE. Top: large "MapJob" wordmark with orange pin glyph. Center: subtle illustration of Polska map in violet outline (decorative). Below: single primary CTA "Kontynuuj z Google" white text with clean Google "G" multi-color icon, dark pill button with soft cyan glow. Below CTA: small grey text "Bezpłatnie. Bez hasła. 15 sekund." Bottom: tiny grey links "Polityka prywatności" / "Regulamin".

Desk: rolled cable, brass key, leather notebook closed soft right. Warm Edison desk lamp glow off-frame top-left. Lighting: warm tungsten upper-left + cool phone counter-light. Lens: 50mm f/4 overhead. Palette: warm walnut, cream, violet glow, Google G colors, cyan button. NO TEXT overlay."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-04", "tytul": "Polska → Europa: zasięg",
     "format": "16:9 (1920×1080)",
     "co_widzimy": "Wide horizontal. Telefon w lewej 1/3 kadru, ekran pokazuje mapę Europy zoomed-out — Polska i Berlin/Praga/Wiedeń/Amsterdam/Paris z pinezkami. Cienki cyan thread łączy Warszawę z Berlinem.",
     "use_case": "Komunikacja Europa-reach. LinkedIn, B2B, ekspansja zagraniczna. Pokazuje że MapJob wykracza poza PL.",
     "paleta": "Cool blue-grey station + violet pins + cyan thread + emerald", "vibe": "Hoyte van Hoytema × Apple brand film",
     "prompt": """Photorealistic cinematic product photograph in style of Hoyte van Hoytema × Apple brand film. Wide horizontal frame. Smartphone in hand at left third, screen tack sharp. Hand from denim jacket cuff, neutral skin.

PHONE SCREEN: MapJob DARK UI Europe-zoom view. Map zoomed out showing Poland centered + western Europe — Berlin, Praga, Wiedeń, Amsterdam, Paris, München visible with names readable. Polish border faintly highlighted in subtle cyan glow. Pins density: heavy across Polska (~30 pins), moderate Berlin/Praga (~10), light west (~5-8). Berlin pin selected with violet pulse + thin cyan thread connecting to Warsaw pin. Filter chips: "Etat" active, new "Zagranica" chip highlighted. Bottom CTA: "Otwórz pełną mapę" cyan.

Background (right two-thirds): softly blurred train station interior, warm overhead diffused daylight, modern infrastructure ambiguous (Warsaw Centralna or Berlin Hauptbahnhof feel). Lighting: soft top-down daylight, phone screen cool key-light. Lens: 35mm f/2.8 anamorphic feel. NO TEXT — right two-thirds breathing for post copy."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-05", "tytul": "Dodaj firmę za darmo",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Wnętrze małego sklepu / piekarni — telefon w dłoni właściciela. Na ekranie formularz 'Dodaj firmę' w trybie wypełniania, z mini-mapką podglądu pinezki + emerald przycisk 'Opublikuj pinezkę'.",
     "use_case": "B2B onboarding — przekonać małego biznesu do dodania pinezki. Reklama dla zarządców, właścicieli, freelancerów-firm.",
     "paleta": "Warm wood + cream + violet phone + emerald CTA", "vibe": "Bridget Pierson × Apple, small business documentary",
     "prompt": """Photorealistic editorial photograph in style of Bridget Pierson × Apple. Three-quarter view of smartphone resting on small business counter (bakery/salon/workshop generic Polish small business feel). Phone held in hand visible lower frame, owner's perspective.

PHONE SCREEN: MapJob "Dodaj firmę" form DARK MODE. Top header: "Dodaj swoją firmę" subtitle "Bezpłatnie. 30 sekund." Form fields: Nazwa firmy "Piekarnia [generic]", Kategoria dropdown showing "Gastronomia / Piekarnia", Adres with auto-detected pin on mini-map preview, Opis short text "Świeże pieczywo codziennie od 5:00...", Photo upload area with one cream uploaded photo. Bottom: large emerald #22C55E "Opublikuj pinezkę" button (active state). Mini-preview at very bottom shows tiny map with new pin appearing.

Background: blurred small business interior — wooden counter texture, hint of pastries/products, warm overhead pendant. Daylight through shop window out of focus right. Lighting: warm pendant + cool natural daylight mixed. Lens: 50mm f/2.8 three-quarter angle. NO TEXT — clean upper area for post."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-06", "tytul": "Mapa Polski live — brand hero",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Aerial render Polski o zmierzchu. Setki świecących fioletowych pinezek (z teczkami) gęsto w dużych miastach, rzadziej w terenie. Niebieskie clustery z cyframi nad metropoliami. Niebo: indigo + warm horizon glow.",
     "use_case": "Brand hero, launch creative, kampania ogólnopolska. Najmocniejsze brand statement.",
     "paleta": "Deep navy #0A0A14, violet pins, cyan rivers, warm horizon", "vibe": "Apple Designed in California × NASA Earth at Night",
     "prompt": """Photorealistic aerial brand render in style of Apple "Designed in California" × NASA Earth at Night. Top-down view of Poland as stylized but realistic map, ~800m altitude.

Map base dark navy #0A0A14 with subtle topographic texture: rivers as thin cyan #00C8D4 threads, forests as dark green patches, urban areas as graphite clusters with faint warm window-glow. Country borders thin cyan lines.

Hundreds of glowing deep-purple pins #7C3AED scattered — dense over Warszawa, Kraków, Gdańsk, Wrocław, Poznań, Katowice, Lublin, Szczecin, Bydgoszcz, Białystok. Sparser rural. Each pin has white briefcase glyph and violet halo. Several blue cluster circles #3B82F6 with white numbers at densest centers.

Sky: deep indigo twilight to warm amber horizon at southern edge, atmospheric haze, single first-magnitude star upper-right. Map edges fade into Berlin/Praga (sparse pins suggesting European reach).

Lighting: pins self-illuminate, subtle moonlight, warm horizon. Lens: 24mm wide drone-render. NO TEXT — full sky negative space for post. NEGATIVE: no city labels in render, no compass, no logos."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-07", "tytul": "Twoja okolica — zoom local",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Top-down dzielnicy polskiego miasta (Mokotów / Kazimierz feel). Pulsująca emerald 'TY' pinezka centralnie + 20-30 fioletowych pinezek wokół w promieniu 2km, cyan kółko outline.",
     "use_case": "Lokalna kampania per-miasto. Reels z lokalnym claimem ('W Twoim mieście już są pinezki').",
     "paleta": "Deep map navy + emerald TY + violet job pins + cyan radius", "vibe": "Reuben Wu × Apple, city aerial",
     "prompt": """Photorealistic city aerial in style of Reuben Wu × Apple. Zoomed-in top-down map view of Polish city neighborhood (universal: Warszawa Mokotów / Kraków Kazimierz / generic Polish urban district). Streets and small green squares visible, building blocks textured.

Map rendered in dark MapJob style: near-black background, light street mesh, subtle building footprints. Glowing emerald "TY" pin pulses at exact center, with 20-30 deep-purple briefcase pins scattered within ~2km radius. Subtle cyan circle outlines 2km radius.

Each pin has tiny floating mini-card with single icon hint of job type (briefcase=etat, calendar=zlecenie, building=firma). Closest 3 pins slightly enlarged pulse rings. Lighting: dusk render — purple sky overlay subtle at frame edges, pins as primary light source. Lens: 35mm wide top-down slight isometric. NO TEXT — top half clear for post."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-08", "tytul": "3 typy pracy — explainer",
     "format": "16:9 (1920×1080)",
     "co_widzimy": "Horizontal split na 3 sekcje cyan-divider. Lewa: ETAT (niebieski pin, 'Stała praca, urlop, ZUS'). Środek: ZLECENIE (amber pin, 'Jednorazowo, projektowo, dorywczo'). Prawa: FIRMA (emerald pin, 'Reklama Twojej działalności'). Każda z mini-mapką.",
     "use_case": "Explainer ad — wyjaśnia 3 use case'y w jednym kadrze. Najszybsza segmentacja widzów.",
     "paleta": "Dark navy base + blue + amber + emerald sections + cream text", "vibe": "Pentagram studio × Apple, designed editorial",
     "prompt": """Photorealistic infographic photograph in style of Pentagram studio × Apple. Horizontal frame split into three equal vertical sections by thin cyan dividers.

LEFT SECTION (ETAT): Top: large blue rounded-square pin with white briefcase glyph #3B82F6. Bold Polish "ETAT" cream. Subtitle "Stała praca, urlop, ZUS". Mini-map preview bottom showing blue pins clustered in city centers.

CENTER SECTION (ZLECENIE): Top: large amber rounded-square pin #FFA940 with white calendar glyph. Bold "ZLECENIE" cream. Subtitle "Jednorazowo, projektowo, dorywczo". Mini-map preview scattered orange pins.

RIGHT SECTION (FIRMA): Top: large emerald rounded-square pin #22C55E with white building glyph. Bold "FIRMA" cream. Subtitle "Reklama Twojej działalności". Mini-map preview emerald pins at business locations.

Background: deep dark navy gradient #0A0A14 → #1A1A2E with subtle grain. Lighting: each pin self-illuminates with appropriate color glow, cards subtle violet rim-light from below. Rendered as designed editorial info-card, photographic but graphic-aware. Like high-end annual report illustration. NO ADDITIONAL TEXT beyond labels described."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-09", "tytul": "Polska–Berlin connection",
     "format": "16:9 (1920×1080)",
     "co_widzimy": "Aerial map Centralnej Europy o zmierzchu. Fioletowa pulsująca pinezka nad Warszawą + druga nad Berlinem, połączone luminującą nicią violet-to-cyan przebiegającą nad krajobrazem.",
     "use_case": "Pokazuje konkretnie 'polski rzemieślnik → niemiecki klient'. B2B Europa, narracja ekspansji.",
     "paleta": "Navy map + violet pins + cyan thread + warm horizon", "vibe": "Apple Network brand visuals",
     "prompt": """Photorealistic graphic-cinematic in style of Apple "Network" brand visuals. Aerial map view of Central Europe at twilight, Poland on right, Germany on left, Czechia at lower edge. Map base dark navy with subtle topography.

Deep-purple pin glows over Warszawa with slow visible pulse (motion suggested in still — soft halo bloom). Second purple pin glows over Berlin with similar pulse. Between them: luminous animated thread of light, gradient violet-to-cyan, arcing gently from Warsaw to Berlin across landscape — like fiber optic connection between two friends across border.

Thread passes through few smaller "relay" pin glows (Poznań, Frankfurt-an-der-Oder visible faintly). Other pins scattered subtly across Polska and Niemcy as background context.

Sky upper third: deep indigo twilight with soft horizon glow on western edge, single bright star. Lighting: pin halos as primary light, thread as luminous element, atmospheric glow. Lens: 28mm wide drone-style slight tilt-shift. NO TEXT — left and right strips negative space for copy. NEGATIVE: no political symbols, no flags."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-10", "tytul": "Diverse hands working — composite",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "3×3 grid kadrów — w każdym inna para rąk pracujących (klawiatura, ciasto, pędzel, miarka, dziecko, terminal, spawanie, espresso, roślina). Centralny kadr: telefon z mapą MapJob jako spinający element.",
     "use_case": "Brand values, 'cały rynek pracy' komunikat. Inclusive representation bez twarzy.",
     "paleta": "Warm earth tones + violet phone center anchor", "vibe": "Steve McCurry × Apple Designed for everyone",
     "prompt": """Photorealistic editorial photograph in style of Steve McCurry × Apple "Designed for everyone". Composite-style overhead-down composition: 3×3 grid of small square frames, each showing different working pair of hands close-up.

The 9 frames feature: 1) hands typing on clean keyboard (office), 2) hands kneading dough on flour-dusted surface (bakery), 3) hands holding paintbrush mid-stroke (creative), 4) hands measuring wooden plank with tape (construction), 5) hands cradling small infant (childcare), 6) hands operating handheld cash terminal (retail), 7) hands welding sparks dramatic but safe (industrial), 8) hands serving cup of espresso (hospitality), 9) hands tending small plant in greenhouse (agri).

Each frame: consistent warm-natural lighting, no stock-photo cheese, documentary-realism, varied skin tones and ages of hands suggesting diversity without heavy-handed.

Center cell (5th): instead of hands, clean shot of smartphone with MapJob DARK UI showing Polska map with pins, acting as connecting hub. Lighting: each frame contextual light, unifying mild warm overall tone. Lens: 50mm f/4 macro each. NEGATIVE: no faces, no recognizable brand logos."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-11", "tytul": "Firmy na mapie — 5 sklepów",
     "format": "16:9 (1920×1080)",
     "co_widzimy": "Horizontal podzielony na 5 vertikalnych sekcji — 5 różnych witryn małego biznesu (piekarnia, warsztat, salon, kawiarnia, biuro IT). Nad każdym wejściem fioletowa pinezka MapJob jako graficzny overlay.",
     "use_case": "B2B segmentation ad — pokazuje że MapJob to dla każdej branży małego biznesu.",
     "paleta": "Warm storefront ochres + violet pin overlays", "vibe": "Wes Anderson × Apple, symmetric composite",
     "prompt": """Photorealistic editorial composite in style of Wes Anderson × Apple. Horizontal frame divided into 5 vertical sections, each showing different small business storefront with MapJob pin glowing above entrance.

LEFT TO RIGHT: 1) Polish bakery (PIEKARNIA generic) with display window full of bread, purple pin floating above door. 2) Auto repair workshop (WARSZTAT) with garage door rolled up, mechanic silhouette inside. 3) Hair salon (FRYZJER) with window decals and warm interior. 4) Café (KAWIARNIA) with outdoor tables and chalkboard menu. 5) IT/coworking space (BIURO) with modern glass facade and plants.

Each storefront: street-level, slightly elevated angle, late afternoon golden-hour light. Pins as graphic overlays — visibly digital, glowing deep purple #7C3AED, white briefcase glyphs.

Sky: warm magic-hour transitioning to dusk above storefronts. Lighting: warm golden hour as primary, pin self-illumination as overlay accent. Lens: 35mm f/4 each, consistent perspective. NEGATIVE: no specific brand names beyond generic Polish words."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-12", "tytul": "Pinezka tygodnia — featured",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Mapa Polski centralnie z 8 wyróżnionymi miastami (Warszawa/Kraków/Gdańsk/Wrocław/Poznań/Łódź/Katowice/Lublin), każde z mini 'tag-card' pokazującą generyczny typ pracy. Jedna pinezka EMPHASIZED — większa, ze złotym ringiem, podpis 'Pinezka tygodnia'.",
     "use_case": "Recurring weekly content. Engaging dla communityFB groups, social.",
     "paleta": "Navy + cream + violet pins + golden ring on featured", "vibe": "Pentagram × Apple infographic-editorial",
     "prompt": """Photorealistic infographic-editorial in style of Pentagram × Apple. Map of Polska central element (light cartography with cyan rivers), 8 cities highlighted with mid-sized purple briefcase pins: Warszawa, Kraków, Gdańsk, Wrocław, Poznań, Łódź, Katowice, Lublin.

Each pin has small floating "tag-card" beside showing generic job type (e.g., "gastronomia", "montaż mebli", "opieka nad dzieckiem", "kierowca kat. C", "instalator", "kasjer", "zdalny IT", "ogrodnik") — universal Polish job categories without specific company names.

One pin (rotating per campaign — Wrocław this version) EMPHASIZED: 1.5x larger, brighter pulse halo, golden ring around indicating "Pinezka tygodnia". Tag more prominent showing role type.

Map sits on dark navy background with subtle topographic detail, slight grain. Above and below map: clean negative space for copy + small "📍 Pinezka tygodnia" header in cream sans-serif. Lighting: pins self-illuminate, soft top-key on map. Lens: 35mm overhead slight wide. NEGATIVE: no specific business names, no logos."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-13", "tytul": "Szukasz etatu — biuro coworking",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Osoba (od pasa w dół) przy biurku w nowoczesnym polskim coworkingu. Telefon z MapJob 'Etat' filtrem aktywnym, mapa pokazuje niebieskie pinezki etatów.",
     "use_case": "Persona: szuka stałej pracy. White-collar, IT, biuro.",
     "paleta": "Cream coworking + warm wood + violet phone + cyan", "vibe": "Bridget Pierson × Apple",
     "prompt": """Photorealistic editorial documentary in style of Bridget Pierson × Apple. Person at clean modern coworking desk in Polish city (Wrocław/Warszawa feel). View from chest down — torso visible in soft button-down shirt, hands on desk with smartphone in dominant hand showing MapJob.

PHONE SCREEN: MapJob DARK UI with "Etat" filter active (cyan chip). Map shows blue briefcase pins clustered across major Polish cities. Selected pin has profile card sliding up showing "Specjalista IT — Warszawa Centrum — od zaraz".

Desk context: minimalist Polish coworking space, white desktop, plant in corner, MacBook closed at side, ceramic mug with steam, leather notebook open with pen. Window light streaming from camera-left, warm cool mix. Lighting: soft daylight from left, phone glow as cool tone on hand. Lens: 50mm f/2.8 hand and phone tack sharp. NEGATIVE: no recognizable laptop brand, no logo on mug, ambiguous gender/age."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-14", "tytul": "Robisz dorywczo — weekend park",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Osoba w casualu (jeansy, hoodie) na ławce w polskim parku w sobotnie popołudnie. Telefon z MapJob filtrem 'Zlecenie' + sub-opcją 'Weekend' — pomarańczowe pinezki dorywczych.",
     "use_case": "Persona: szukający dorywczego dochodu. Studenci, weekend hustlers, casual workers.",
     "paleta": "Autumn ochre + park green + violet phone + amber filter", "vibe": "Saul Leiter × Apple lifestyle documentary",
     "prompt": """Photorealistic lifestyle documentary in style of Saul Leiter × Apple. Person sitting on park bench in Saturday afternoon Polish park (Łazienki or generic). Frame from torso down: casual wear (jeans, hoodie, sneakers visible at bottom), hands holding smartphone.

PHONE SCREEN: MapJob DARK UI, filter "Zlecenie" active (amber chip). Map shows orange/amber briefcase pins for one-off work. Filter sub-options visible: "Weekend / Wieczory / Krótkoterminowe" with "Weekend" selected. Pin selected showing "Pomoc przy przeprowadzce — sobota — 4h".

Park context: blurred backdrop of autumn park, fallen leaves, distant walkers, one dog blurred passing. Late afternoon golden light filtering through trees creating dappled patterns on bench. Lighting: warm golden hour, dappled light, phone screen as cool key. Lens: 35mm f/2.0 immersive park-bench feel. NEGATIVE: no faces, no recognizable clothing brands."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-15", "tytul": "Masz firmę — mały sklep",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Wnętrze małego polskiego sklepu (delikatesy / księgarnia / butik). Ręka właściciela z telefonem pokazującym panel firmy 'Twoja pinezka świeci od 14 dni' + 3 nowe wiadomości.",
     "use_case": "B2B retention — pokazuje co właściciel widzi w aplikacji jako firma.",
     "paleta": "Warm shop ochre + brass + violet phone + emerald CTA", "vibe": "Tim Walker × Apple editorial",
     "prompt": """Photorealistic editorial in style of Tim Walker × Apple. View inside small Polish shop — could be deli, bookshop, or boutique. Owner's hand visible chest-height holding smartphone, framed against warm shop interior.

PHONE SCREEN: MapJob DARK UI showing OWNER's panel — "Twoja firma" top header, firm's profile card visible with stats: number of profile views (subtle visual indicator no specific number), recent messages count, "Twoja pinezka świeci od 14 dni" small status text. Mini-map preview showing firm's pin location. Bottom CTA: "Zobacz wiadomości (3 nowe)" emerald button.

Shop context: warm shelving with goods softly out of focus, brass scale hanging, chalkboard with handwritten products list (illegible details), small framed certificates on wall. Lighting: warm pendant overhead + cool daylight from shop window. Lens: 50mm f/2.8. NEGATIVE: no specific products labels, no real brand logos."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-16", "tytul": "Fachowiec — warsztat",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Polski rzemieślnik (uniwersalny — elektryk/hydraulik/HVAC) we własnym warsztacie. Od pasa w dół: roboczy strój, pas z narzędziami, telefon z profilem fachowca: 'SEP do 1kV, 30 km dojazd, 47 firm widzi'.",
     "use_case": "Persona: skilled trade. Pokazuje WORKER side of marketplace.",
     "paleta": "Warm workshop ochre + concrete grey + violet phone + emerald", "vibe": "Sebastião Salgado × Apple environmental",
     "prompt": """Photorealistic environmental documentary in style of Sebastião Salgado × Apple. Skilled Polish tradesperson (universal — electrician/plumber/HVAC tech) inside their own workshop. Frame chest down: work-overalls, tool belt around waist, hands holding smartphone. Hands show honest wear but clean, no specific gender markers.

PHONE SCREEN: MapJob DARK UI showing worker's PROFILE editing screen. Visible fields: "Specjalizacja: Instalacje elektryczne", "Uprawnienia: SEP do 1 kV", "Obszar dojazdu: 30 km", list of recent client reviews (without names — just rating stars and very generic text). Bottom: emerald "Zaktualizuj profil" button + stat "Profil widoczny dla 47 firm w okolicy".

Workshop context: organized tool wall, pegboard with hammers, drill, soldering iron. Workbench with small parts. Single overhead work lamp casting warm pool. Concrete floor industrial texture. Lighting: warm overhead work lamp + cool blue ambient skylight + phone glow. Lens: 35mm f/2.8 slight low angle giving worker dignity. NEGATIVE: no recognizable tool brands, ambiguous person."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-17", "tytul": "Mama po macierzyńskim — kuchnia",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Polka 30+ przy drewnianym stole kuchennym o późnym poranku. Tylko od torsu w dół. Telefon z MapJob filtrami 'Zdalna + Pół etatu + Elastyczne'. Krawędź kadru: mała rączka dziecka z klockiem.",
     "use_case": "Persona: powrót na rynek pracy po przerwie macierzyńskiej. Bardzo lojalna grupa target.",
     "paleta": "Warm wood + cream + soft pastel + violet phone + cyan", "vibe": "Rinko Kawauchi × Apple intimate documentary",
     "prompt": """Photorealistic intimate documentary in style of Rinko Kawauchi × Apple. Polish woman (no face — torso to lap angle, soft sweater, relaxed home posture) sitting at wooden kitchen table in late morning. Hands holding smartphone in lap. Child's small hand visible at very edge of frame holding toy block (suggesting toddler nearby playing safely).

PHONE SCREEN: MapJob DARK UI with filters "Zdalna" + "Pół etatu" + "Elastyczne godziny" all active in cyan. Map shows pins matching these filters across city. Selected pin shows card "Asystentka projektu — zdalnie — 20h/tydzień".

Kitchen context: warm wood table, ceramic mug of herbal tea with steam, half-eaten pastry on small plate, children's drawing on table edge (crayon, abstract). Soft late-morning daylight from window camera-right. Toy block softly out of focus near edge. Lighting: warm window daylight + soft kitchen ambient + phone glow. Lens: 35mm f/2.0 intimate close-domestic. NEGATIVE: no child face visible, no specific drawings recognizable, no brand-name foods."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-18", "tytul": "Student — schody uniwersytetu",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Student (20-22) na kamiennych schodach polskiego uniwersytetu (UJ Kraków / UW Warszawa feel). Casualwear, plecak. Telefon z MapJob filtrem 'Dorywcze + Wieczory' — pinezki w okolicy uczelni.",
     "use_case": "Persona: student, dorywcze, between zajęciami. Wysoki potencjał na Reels.",
     "paleta": "Warm stone ochre + autumn leaves + violet phone + cyan", "vibe": "Niall O'Brien × Apple editorial",
     "prompt": """Photorealistic editorial in style of Niall O'Brien × Apple. Student (universal age 21-22, no face) sitting on steps of Polish university building (could suggest UJ in Kraków or UW in Warszawa — generic historical-academic facade). Casual wear: jeans, varsity-style sweatshirt, canvas tote bag with textbooks beside.

PHONE SCREEN: MapJob DARK UI with filter "Dorywcze" + "Wieczory" active. Map zoomed in on city showing cluster of pins around university area within walking distance. Selected pin: "Barista — 200m — wieczorami".

University context: stone steps, scattered fallen leaves (autumn), other students blurred in background carrying backpacks, bicycle leaning on railing. Warm late-afternoon golden light bouncing off ochre university walls. Lighting: warm golden hour as key, soft ambient diffuse on student's side. Lens: 50mm f/2.0 slightly low angle. NEGATIVE: no university logos, no specific bookstore-name books."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-19", "tytul": "Pierwsza praca po szkole",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Młoda osoba (18-19) przed lustrem w sypialni, prosta koszula, 'first day energy'. Telefon z MapJob filtr 'Bez doświadczenia + Praktyki'. Birezka graduacyjna na krześle — callback do niedawnej matury.",
     "use_case": "Persona: pierwsza praca, świeży po szkole, bez doświadczenia. Życiowy moment przejściowy.",
     "paleta": "Cream bedding + soft morning gold + violet phone + cyan", "vibe": "Annie Leibovitz × Apple",
     "prompt": """Photorealistic editorial in style of Annie Leibovitz × Apple. Young person (age 18-19, no face — chest down framing), wearing clean simple button-up shirt and slacks suggesting "first day energy". Standing in front of bedroom mirror at home (mirror visible reflecting torso, phone in hand).

PHONE SCREEN: MapJob DARK UI with filter "Bez doświadczenia" + "Praktyki + pierwsza praca" active. Map shows pins for entry-level positions across city. Selected pin: "Asystent recepcjonisty — Warszawa — szkolenie wliczone".

Bedroom context: soft morning sunlight through gauzy curtains, small desk with laptop closed, graduation cap (matura cap or maturalna sash) visible on chair as callback to recent school finish. Neat backpack ready by door. Lighting: soft morning daylight, warm and optimistic. Lens: 35mm f/2.8 three-quarter angle. NEGATIVE: no school logos, no specific brand backpack."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-20", "tytul": "Mały biznes — piekarnia o świcie",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Wnętrze małej polskiej piekarni o 5:30, prep do otwarcia. Ręce właścicielki (fartuch zaprószony mąką, obrączka) z telefonem przy świeżych bułkach. Ekran: success 'Twoja pinezka jest aktywna! 🎉'.",
     "use_case": "B2B small biz onboarding success moment. Najsilniejszy emotional B2B angle.",
     "paleta": "Warm flour-dusted ochre + bread brown + violet + emerald", "vibe": "Mary Ellen Mark × Apple documentary",
     "prompt": """Photorealistic documentary in style of Mary Ellen Mark × Apple. Inside small Polish neighborhood bakery at 5:30 AM opening prep. Owner's hands (apron-flour-dusted, wedding ring) visible holding smartphone next to tray of fresh rolls.

PHONE SCREEN: MapJob DARK UI showing OWNER's "Dodaj firmę" success screen — "Twoja pinezka jest aktywna! 🎉" header in emerald. Below: mini-map preview showing bakery's pin in neighborhood. Stats: "Profil widoczny" + small dot indicators. Bottom: "Zaproś klientów" emerald button.

Bakery context: warm pre-dawn bakery interior, rows of fresh challah and rolls in display, vintage scale visible, chalkboard with handwritten "Dziś świeże:" text. Steam from oven softly visible. Single overhead warm Edison bulb. Lighting: warm bakery interior amber + cool phone screen counter, mixed cinematic warm. Lens: 35mm f/2.8. NEGATIVE: no specific bakery name beyond generic "PIEKARNIA"."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-21", "tytul": "Praca w Niemczech — warsztat granica",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Polski rzemieślnik przed otwartymi drzwiami garażu warsztatu (zachodnia Polska, blisko granicy). Bus z napisem 'TRANSPORT'. Telefon z MapJob Europe-zoom + selected pin Berlin 'Polska firma poszukuje elektryka'.",
     "use_case": "Persona: ekspansja zagraniczna. Polski fachowiec → niemiecki rynek.",
     "paleta": "Warm workshop + concrete grey + violet phone + cyan filter", "vibe": "Łukasz Żal × Apple cinematic-editorial",
     "prompt": """Photorealistic editorial-cinematic in style of Łukasz Żal × Apple. Polish skilled worker (electrician, mechanic, generic tradesperson — chest down framing only) in front of open workshop garage door somewhere in Western Poland near German border. Work van visible behind, "TRANSPORT" generic decal but no specific company.

PHONE SCREEN: MapJob DARK UI showing EUROPE-zoom map view. Polish-German border visible, pins on both sides. Selected pin in Berlin shows "Polska firma poszukuje elektryka — Berlin — start od 15.05". Filter chip "Zagranica" active in cyan + small "PL ↔ DE" indicator.

Context: workshop garage with morning sun streaming through open door, tools organized on pegboard inside, polish flag sticker small on van bumper, road map of Europe pinned to workshop wall in background. Lighting: warm sun streaming through garage opening + cool ambient inside. Lens: 35mm f/2.8 slight wide for context. NEGATIVE: no political symbolism beyond small flag sticker, no specific company name."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-22", "tytul": "Otwórz mapę — clean hero",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Telefon pionowo na rozmytym tle polskiego miasta o zmierzchu. Phone hero — wypełnia 65% kadru. Mapa Polski w mid-animation — pinezki włączają się falą.",
     "use_case": "Najprostszy hero CTA reel/post. Najszerszy target.",
     "paleta": "Deep navy + violet pins + cyan CTA + warm dusk bokeh", "vibe": "Apple iPhone product film × Greig Fraser",
     "prompt": """Photorealistic cinematic hero in style of Apple iPhone product film + Greig Fraser. Smartphone held vertically in front of soft out-of-focus Polish urban dusk backdrop (any city, ambiguous). Phone is absolute hero — fills central 65% of frame.

PHONE SCREEN: MapJob DARK UI in mid-animation state. Map of Polska visible centered, just-loaded — few pins still illuminating with gentle wave-pattern across country. Selected pin in center has subtle pulsing halo. Map extends visibly into Berlin and Praga edges. Top: "MapJob" wordmark. Filter chips at top neutral state. Bottom: "Otwórz pełną mapę" cyan CTA pill — slightly pulsing.

Hand holding phone barely visible at bottom edge, just fingertips and portion of palm — no skin tone or sleeve specification beyond "neutral, ungendered".

Background: deeply blurred dusk Polish city — could read as any major city. Soft amber window lights as bokeh, deep indigo sky transitioning to warm horizon. Lighting: phone screen as primary key light on hand and surrounding air, ambient warm-cool dusk fill. Lens: 50mm f/2.0 perfectly centered, product-photography precision. NEGATIVE: standard."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-23", "tytul": "Brand hero PL+EU — aerial",
     "format": "16:9 (1920×1080)",
     "co_widzimy": "Wide aerial render Polski i Zachodniej Europy o zmierzchu. Polska centrum ze setkami pinezek, na zachód: Berlin/Praga/Wiedeń/Amsterdam/Paryż w sparser klastrach. Cyan threads łączą PL z EU.",
     "use_case": "Brand statement, kampania paneuropejska, launch flagship.",
     "paleta": "Deep navy + dense violet PL + sparser EU + cyan threads + warm horizon", "vibe": "Apple Designed for Europe × Reuben Wu",
     "prompt": """Photorealistic brand hero in style of Apple "Designed for Europe" + Reuben Wu. Wide horizontal aerial render of Poland and Western Europe at twilight, seen from approximately 1500m. Poland visual center, glowing with hundreds of dense purple briefcase pins. Fading westward: Berlin, Praga, Wiedeń, Amsterdam, Paris with sparser but clear pin clusters. Eastern edge: few pins fade into Lithuania and Ukraine border suggesting "Polish workers everywhere".

Subtle thin cyan threads connect Polish cities to European ones — visualizing network. Sky deep indigo to amber horizon. Single brightest star above Warsaw center. Lighting: pins self-illuminate, atmospheric haze, soft horizon glow. Lens: 24mm anamorphic-feel wide aerial. NEGATIVE: no political flags, no city labels in render, clean atlas feel."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-24", "tytul": "Macro pinezka — bumper-friendly",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Extreme macro pojedyńczej fioletowej pinezki MapJob (rounded square + biała teczka). Świeżo upuszczona na czarnej macie, fioletowe halo światła pod spodem.",
     "use_case": "Bumper, carousel slide 1, brand mark. Najczystszy product-only shot.",
     "paleta": "Matte black + deep violet + cyan rim", "vibe": "Greg Fraser × Apple macro product hero",
     "prompt": """Photorealistic macro product hero in style of Greig Fraser + Apple. Extreme close-up of single deep-purple MapJob pin (rounded square shape, white briefcase glyph, pointed tail) rendered as if real physical object freshly placed on soft matte black surface. Faint violet halo of light emanates from beneath pin, suggesting it has just been "dropped" with power.

Pin's surface has subtle premium material feel — like polished ceramic or anodized metal, not plastic. Slight directional reflection on top surface.

Surrounding atmosphere: subtle dust particles in air, deeply out of focus, suggesting quiet "brand vault" environment. Lighting: single low-angle warm key light camera-right, cool ambient fill camera-left, pin's own halo as bottom up-light. Lens: 100mm macro at f/4 focus stacking. NEGATIVE: no other UI elements, no logos beyond briefcase glyph, clean abstract product feel."""},

    {"sekcja": "HERO IMAGES — informacyjne", "id": "HI-25", "tytul": "Generic clean hero — studio float",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Telefon sam, lewitujący-suspendowany na cream-do-pale-grey gradient tle. Slightly tilted 12° dla dynamic composition. Pełen MapJob DARK UI hero state.",
     "use_case": "Universal-purpose product shot. Można podstawić pod każdy copy. Best dla LinkedIn / display.",
     "paleta": "Pale cream gradient + matte phone graphite + violet pins + cyan", "vibe": "Annie Leibovitz × Apple clean editorial",
     "prompt": """Photorealistic clean editorial product photograph in style of Annie Leibovitz × Apple. Smartphone alone, floating-suspended (no visible support) against soft cream-to-pale-gray gradient background. Phone centered, slightly tilted 12° for dynamic composition.

PHONE SCREEN: full MapJob DARK UI hero state — Polska map centered, purple briefcase pins dense across country, one selected pin pulsing, profile card sliding up from bottom showing universal placeholder content. Filter chips "Firma / Zlecenie / Etat" all visible at top with "Etat" active in cyan. CTA pill "Otwórz pełną mapę" cyan at bottom.

Lighting: clean studio wraparound — soft key from above-right, fill from below-left, perfect product photography setup. Phone's own screen as third light source. Lens: 100mm f/4 product-photography precision. NEGATIVE: no shadow underneath (phone appears to float), no environmental context, pure product hero feel."""},

    # ====================================================
    # SEKCJA 2: NEON-NOIR MASTER + ALTERNATYWY
    # ====================================================
    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-MASTER", "tytul": "Poznań Stary Rynek 22:18 (Master)",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Polski narożnik street'u w Poznaniu o 22:18, czwartek. Mokrazielona kostka po deszczu, magentowy neon 'ZAKŁAD/BAR' w bokeh, czerwone smugi tylnych świateł. Telefon z mapą MapJob jako brightest source.",
     "use_case": "Flagship hero kampanii noir. Najwyższy emotional impact, bezkompromisowe premium ad.",
     "paleta": "#7C3AED / #00C8D4 / #22C55E / #0A0A14 + magenta #E83E8C", "vibe": "Roger Deakins (BR2049) × Apple iPhone product film",
     "prompt": """Photorealistic cinematic low-angle street photograph, Roger Deakins night work on "Blade Runner 2049" combined with Apple iPhone product film. Single-frame film still.

SCENE: Poznań street corner near Stary Rynek at 22:18 Thursday. Light drizzle stopped 20 min ago — cobblestones and asphalt wet mirror-reflective, no rain falling. Air with faint steam from vent. Post-dinner foot traffic thinned.

SUBJECT foreground (tack sharp): ungendered adult hand and forearm chest-height holding modern flagship smartphone (matte graphite). Thin silver watch on wrist. Soft dark-charcoal wool coat sleeve. No rings, neutral skin tone. Phone tilted at 4° handheld cant.

PHONE SCREEN: MapJob DARK MODE near-black #0A0A14 background, graphite #1A1A2E panels. "MapJob" wordmark top-left (dark navy with orange pin glyph). Emerald #22C55E user avatar pill top-right. Filter chips "Firma"/"Zlecenie"/"Etat" — "Zlecenie" active filled cyan #00C8D4. Map: light Google-Maps cartography Poland centered with Poznań/Warszawa/Kraków/Wrocław/Gdańsk readable, extending into Berlin and Praga. Pins: deep purple #7C3AED rounded-square white briefcase, dense Polish, sparser westward. Selected pin Poznań with violet pulse halo. Cluster blue #3B82F6 round circle "2" near Warsaw. Bottom CTA cyan "Otwórz pełną mapę" pill. Bottom tab bar dark with five glyphs.

Midground: wet cobblestone reflecting neon. Parked dark Skoda Octavia at right edge. Iron bollard left.

Background deeply OOF: generic Polish corner shop with magenta #E83E8C neon "ZAKŁAD" or "BAR" cursive, soft bokeh. Warm amber sodium #FFA940 streetlight mid-distance. Blurred red taillights #E63946 streaking right third as motion trails. Distant kamienica facades fading indigo night.

LIGHTING: phone screen as key (violet-cyan on hand). Magenta neon ambient right, sodium midground left. Rim amber from distant streetlight. Color temps: phone 5600K, neon 4200K, sodium 2700K. Lens: ARRI Alexa Mini LF + Panavision Ultra Vista 40mm anamorphic T2.0. Subtle oval bokeh on neon. Anamorphic flare extremely subtle.

GRADE: teal × magenta × cyan, crushed blacks #0A0A14 (non-absolute), elevated violet mids, clean cyan highlight roll-off. Subtle 35mm filmgrain. Reference LUT: Deakins BR2049 night × Apple iPhone 15 Pro product clean.

COMPOSITION: phone+hand left 55% lower-center, right 40% neon bokeh, clear negative space upper band and lower strip for post typography. NO TEXT in render. NEGATIVE: no stock-photo aesthetic, no rain falling, no crowd, no legible brand signage other than generic "ZAKŁAD" neon, no light theme."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-01", "tytul": "Wrocław Rynek — medieval × neon",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Wrocławski Rynek o 23:40, soft drizzle aktywny. Gotycki Stary Ratusz amber-lit w głębi, mokrygranit reflektuje złoty pool. Ręka chest-height z telefonem.",
     "use_case": "Wariant master'a — Wrocław persona. Emotional, historical × tech.",
     "paleta": "Master + amber #FFB700 (Hall lights)", "vibe": "Roger Deakins + Cuarón Children of Men",
     "prompt": """Cinematic low-angle photograph in style of Roger Deakins + Alfonso Cuarón "Children of Men" night work.

SCENE: Wrocław Market Square 23:40, light drizzle actively falling soft. Gothic Old Town Hall silhouette looms deep background, softly lit amber. Gothic spires fade into violet-indigo sky.

Subject: ungendered hand chest-height holding smartphone, soft dark sleeve, thin silver band on wrist. 4° handheld tilt.

PHONE: MapJob DARK UI identical spec — purple briefcase pins across Poland visible into Prague and Berlin, selected pin pulses over Wrocław, cyan #00C8D4 "Otwórz pełną mapę" CTA, blue cluster #3B82F6 with "3", emerald accent top-right, "MapJob" wordmark with orange pin glyph, filter chips "Firma / Zlecenie / Etat".

Midground: wet granite cobblestones mirror-reflect amber Hall lights into soft golden pool. Lone pedestrian in long coat walks away from camera, motion-blurred.

Background: Old Town Hall gothic silhouette warm-lit at #FFA940 sodium, scattered window lights distant kamienice, soft rain haze, one faint green #22C55E emergency/exit light in doorway.

Lighting: phone violet-cyan glow as foreground key. Hall amber as midground ambient. Rain droplets refract mixed temp magic. Camera: ARRI Alexa + Cooke S7/i 50mm T2.0 subtle oval rain bokeh. Grade: warm-amber highlights × cool violet shadows, Kodak Vision3 500T + subtle BR LUT. Composition: phone left 50%, warm Old Town right, upper third sky negative space. NO TEXT."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-02", "tytul": "Warszawa Wieżowce — glass reflection",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Warszawa Śródmieście u podnóża szklanego wieżowca (Varso/Złota 44 silhouette feel). Suchy crisp jesienny wieczór + mgła. Tall glass facade za telefonem reflektuje skyline.",
     "use_case": "Modern Warszawa, business angle. LinkedIn-friendly.",
     "paleta": "Master + cool blue #00B4D8 (architectural)", "vibe": "Denis Villeneuve + Greig Fraser Dune",
     "prompt": """Cinematic photograph in style of Denis Villeneuve + Greig Fraser on "Dune" night sequences.

SCENE: Warsaw Śródmieście 22:55, base of modern glass skyscraper (Varso/Złota 44 silhouette feel, non-specific). Dry crisp autumn night, slight fog. Tall glass facade behind reflects whole city skyline upside-down.

Subject: chest-high phone grip, ungendered hand, charcoal wool sleeve, thin watch. Body positioning suggests pause mid-walk.

PHONE: MapJob DARK full spec — purple briefcase pins with Warsaw at center of zoom, Europe spread visible, cyan CTA, blue cluster "4", selected pin pulse, emerald top-right.

Midground: polished black granite sidewalk reflecting phone and neon. Bicycle messenger streaks past left-to-right as motion blur.

Background: glass tower facade stretches vertically out of frame, reflecting ambient city at cool blue #00B4D8. Single illuminated corporate logo panel (generic, unreadable) glows cool blue far up. Fog diffuses distant streetlights into orbs.

Lighting: cool blue tower reflection as dominant ambient. Phone screen warmer-violet as counter-point. Streetlight amber low-angle subtle rim. Lens: ARRI Alexa LF + Zeiss Supreme Prime 35mm T1.5 anamorphic flare subtle. Crushed blacks, clean cool cyan highlights. Composition: phone left third, glass tower right two-thirds vertical leading line. Copy space upper band. NO TEXT."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-03", "tytul": "Kraków Kazimierz Alley — intimate",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Wąska aleja w krakowskim Kazimierzu o 23:15, single iron lantern, distant bar entrance hot pink #FF006E. Tenement walls close on both sides. Black turtleneck sleeve.",
     "use_case": "Intimate, niche-cool, bohemian persona. Kraków-specific.",
     "paleta": "Master + hot pink #FF006E (bar neon)", "vibe": "Christopher Doyle (Wong Kar-wai) × Apple",
     "prompt": """Cinematic intimate photograph in style of Christopher Doyle (Wong Kar-wai "In the Mood for Love" alley work) × Apple.

SCENE: narrow alley in Kraków's Kazimierz 23:15, single lantern lit, rough painted tenement walls close on both sides. Late diners have left. One small bar entrance glows hot pink #FF006E few doors down.

Subject: hand holding phone chest-height, paused in alley, sleeve of black turtleneck visible.

PHONE: MapJob DARK full spec with selected pin over Kazimierz. Cyan CTA, purple pins density in Krakow region, emerald filter chip "Zlecenie" active.

Midground: textured stucco walls slight water streaks, one moss patch, old iron wall-lantern casting warm amber.

Background: alley narrows deeply to single vanishing point. Distant bar neon glows hot pink as bokeh orb. Silhouetted figure walking away from camera at distance, fully blurred.

Lighting: phone violet-cyan glow brightest. Hot-pink neon bokeh background mid-distance. Lantern amber as rim on opposite wall. Lens: ARRI Alexa Mini + Zeiss Super Speed 50mm T1.3 open for intimate bokeh. Vintage flare soft. Grade: crushed blacks, saturated magenta-pink mid, clean cyan highlights, Kodak Portra 800-push. Composition: phone center-left, alley vanishing right, walls framing. NO TEXT."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-04", "tytul": "Łódź Piotrkowska — tram rails",
     "format": "16:9 (1920×1080)",
     "co_widzimy": "Łódź Piotrkowska street 23:00, mokre tramwajowe szyny gleam w foreground. Art Nouveau facades stretching vista. 1970s industrial-era acid green #80FF00 'APTEKA' neon w bokeh.",
     "use_case": "Polish iconic street vibe. Industrial poetry.",
     "paleta": "Master + acid green #80FF00 (APTEKA neon)", "vibe": "Wojciech Staroń + Apple product film",
     "prompt": """Cinematic street photograph in style of Wojciech Staroń + modern Apple product film.

SCENE: Łódź Piotrkowska street 23:00, tram rails gleaming wet in foreground, facades of Art Nouveau tenements stretching into distance. 1970s industrial-era green neon sign "APTEKA" glows acid green #80FF00 few blocks ahead as soft bokeh.

Subject: hand at chest height with phone, charcoal puffer jacket sleeve, simple watch. Stationary pose, looking down at screen.

PHONE: MapJob DARK full spec. Selected pin over Łódź with pulse, purple briefcase pins dense across central Poland.

Midground: wet tram rails create two parallel cyan reflection lines receding into vanishing point. Smooth granite pavement.

Background: long vista of Piotrkowska with fading gas-style streetlamps mixing warm amber and cool mercury. Distant silhouetted walkers, blurred. Acid-green APTEKA neon as single color pop.

Lighting: phone violet-cyan glow dominant foreground. Streetlights warm-to-cool gradient down block. Single acid-green accent as counter. Lens: ARRI Alexa + Angénieux Optimo 45mm T2.6, gentle anamorphic horizontal flare on APTEKA neon. Grade: teal-amber split-tone + acid green mid-accent. Subtle filmgrain. Composition: phone lower-center-left, rails leading eye to vanishing point right. Upper third sky for copy. NO TEXT."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-05", "tytul": "Gdańsk Motława Marina — maritime",
     "format": "4:5 (1080×1350)",
     "co_widzimy": "Gdański nabrzeże Motławy o północy. Across water silhouettes of Crane ('Żuraw') and Gothic warehouses. Ripples on black water reflect amber lamp-light. Single emerald sailboat mast-light.",
     "use_case": "Maritime + international reach. Gdańsk-specific premium.",
     "paleta": "Master + sodium amber #FFA940 + emerald #22C55E mast", "vibe": "Łukasz Żal Cold War × Apple brand film",
     "prompt": """Cinematic waterfront photograph in style of Łukasz Żal ("Cold War") × Apple brand film.

SCENE: Gdańsk Motława quay at midnight, across water silhouettes of Crane ("Żuraw") and Gothic warehouses. Ripples on black water reflect amber lamp-light. Single sailboat mast-light blinks emerald far across.

Subject: hand holding phone chest-height, leaning slightly on wooden railing. Nautical-feel sleeve of knit sweater.

PHONE: MapJob DARK full spec. Gdańsk pin selected, cluster over Tricity "6", purple pins extending into Stockholm, Copenhagen visible on map (maritime Europe emphasis).

Midground: glossy wooden railing, cobblestone quay, black water surface with amber reflections breaking in gentle ripples.

Background: Crane silhouette warm-amber lit. Warehouse facades muted ochre and brick. Distant emerald mast-light, small and glowing.

Lighting: phone cool violet-cyan vs warm amber sodium lamp + distant emerald blink. Triangulated color. Lens: ARRI Alexa LF + Zeiss CP.3 40mm T2.1 soft flare on amber lamp. Grade: warm-amber highlights × deep-teal shadows, emerald surgical accent. Composition: phone lower-right third, Crane silhouette upper-left. Water horizontal line mid-frame. Right-side sky for copy. NO TEXT."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-06", "tytul": "Katowice Brutalist Underpass",
     "format": "1:1 (1080×1080)",
     "co_widzimy": "Concrete pedestrian underpass koło Spodek arena o 01:20. Brutalist raw-concrete walls + horizontal form-lines, fluorescent tube-lights flicker. Single red EXIT sign mid-tunnel.",
     "use_case": "Industrial noir, after-hours, Silesian persona.",
     "paleta": "Master + red #E63946 (EXIT)", "vibe": "Andrei Tarkovsky Stalker × Apple",
     "prompt": """Cinematic photograph in style of Andrei Tarkovsky "Stalker" + Apple night film.

SCENE: concrete pedestrian underpass near Katowice Spodek arena at 01:20. Brutalist raw-concrete walls with deep horizontal form-lines, fluorescent tube-lights at vanishing end flicker. Lone red EXIT sign #E63946 at midpoint.

Subject: hand at chest height with phone, leather jacket sleeve, simple steel watch. Stationary pause in tunnel mouth.

PHONE: MapJob DARK full spec. Katowice pin selected with pulse, purple pins dense in Silesia.

Midground: wet concrete floor reflecting tube-light cool-white streaks.

Background: tunnel vanishing point fluorescent-lit pale cyan-white. Red EXIT sign offset center. Graffiti tag faintly visible on wall, unreadable.

Lighting: phone violet-cyan warmer than cold fluorescent tunnel behind — separates hero from environment by temperature. Red EXIT sign provides single saturated color pop. Lens: ARRI Alexa + Cooke S4 32mm T2.0, crisp geometric lines. Minimal flare. Grade: cold-blue shadows × clean cyan mid × single red accent. Brutalist contrast crushed blacks. Composition: phone left third, tunnel one-point perspective center-right. Negative space upper band. NO TEXT."""},

    {"sekcja": "NEON-NOIR — Master + alternatywy", "id": "NN-ALT-07", "tytul": "Night Tram — moving interior",
     "format": "9:16 (1080×1920)",
     "co_widzimy": "Wnętrze polskiego trama (Pesa Swing/Solaris) jadącego przez Warszawę 22:40. POV behind seated figure shoulder. Warm yellow tram interior lights; outside streetlights streak past in amber-indigo motion trails.",
     "use_case": "Commuter persona. Decision-on-the-go vibe.",
     "paleta": "Master + warm tungsten #FFB86B interior", "vibe": "Wong Kar-wai trains × Apple iPhone night mode",
     "prompt": """Cinematic interior photograph in style of Wong Kar-wai's train sequences + Apple iPhone night mode film.

SCENE: interior of modern Polish tram (Pesa Swing / Solaris style) moving through Warsaw at 22:40. Passenger-level POV from just behind seated figure's shoulder. Warm yellow tram interior lights; outside streetlights streak past in amber-indigo motion trails.

Subject: ungendered adult hand at chest height holding smartphone close. Coat sleeve, leather watch strap. Fingertip hovering over screen.

PHONE: MapJob DARK full spec. Map centered Warsaw with many purple pins, selected pin pulses 3 stops ahead on tram line. Blue cluster "7" over Śródmieście.

Midground: tram seat-back in front (slightly soft), polished metal handrail, faint reflections of phone light on tram window glass.

Background: through tram window, horizontal streak of city lights — amber sodium, cool white LED, single violet neon — all elongated to motion-blur trails.

Lighting: tram interior warm tungsten #FFB86B as ambient fill. Phone cool violet-cyan as key. Motion trails outside as rim/background accent. Lens: ARRI Alexa Mini + Zeiss Supreme Prime 29mm T1.5, subtle window glass reflection artifact. Grade: warm interior × cool exterior split, Fujifilm Eterna simulation. Composition: phone lower-center, tram seat frame left, window horizontal streak right. Upper band (tram ceiling) clean for copy. NO TEXT."""},
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-01",
        "tytul": "Warszawa Marszalkowska 22:30 post-drizzle",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Warszawska Marszalkowska o 22:30 po deszczu. Mokry asfalt jak lustro, magentowy neon sklepu rozmyty w bokeh, smugi czerwonych swiatel tylnych z prawej. Reka chest-height z telefonem MapJob.",
        "use_case": "Warszawa flagship neon-noir. Premium kreatywka stolicy.",
        "paleta": "Master + magenta #E83E8C",
        "vibe": "Roger Deakins (BR2049) x Apple",
        "prompt": "Photorealistic cinematic low-angle, Deakins/BR2049 style. Wet Marszalkowska 22:30, post-drizzle mirror asphalt, blurred red taillight streaks right. Hand chest-height with smartphone, charcoal wool sleeve, thin watch. Background: out-of-focus kamienica facades + magenta #E83E8C shop neon bokeh. Phone glow dominant.\n\nPHONE: MapJob DARK UI - near-black #0A0A14, purple #7C3AED briefcase pins across Polska into Berlin/Praga, selected Warsaw pin pulse, cyan #00C8D4 'Otworz pelna mape' CTA, blue #3B82F6 cluster '3', emerald top-right.\n\nLens: ARRI Alexa LF + Zeiss Supreme 50mm T2.0 anamorphic. Grade: teal-magenta crushed blacks. Composition: phone left 55%, neon bokeh right, copy space upper-right. NO TEXT in render. NEGATIVE: no light theme, no Google red pins, no extra logos.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-02",
        "tytul": "Warszawa Praga-Polnoc 23:50 fog",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Postindustrialna ceglana aleja Pragi-Polnoc o 23:50, miekka mgla rozplywa sie. Reka na wysokosci biodra wyjmuje telefon z kieszeni plaszcza. Amber sodium #FFA940 wall-lamp glow.",
        "use_case": "Postindustrial Warszawa, hipsterski persona, niche premium.",
        "paleta": "Master + amber sodium #FFA940",
        "vibe": "Wong Kar-wai cinematic noir",
        "prompt": "Wong Kar-wai cinematic noir. Hand at hip height pulling phone from coat pocket, factory-renovated brick alley Warszawa Praga-Polnoc 23:50, distant tram bell, S-Bahn rattling, amber sodium #FFA940 Spati-style shop neon bokeh. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa-Praga, all standard UI elements (purple briefcase pins, cyan CTA, emerald avatar, blue cluster).\n\nGrade: deep teal shadows + amber highlights. Composition: phone lower-third, alley vanishing point upper. Copy space upper third. NO TEXT in render. NEGATIVE: no light theme, no logos.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-03",
        "tytul": "Krakow Wawel blue hour 21:10",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Reka na kamiennym parapecie tarasu Wzgorza Wawelskiego. Wisla zakrzywia sie ponizej, fioletowe niebo zmierzchu, dalekie kamienice jako cieple bursztynowe punkty.",
        "use_case": "Krakow heritage, kulturowy persona, premium lokalny ad.",
        "paleta": "Master + violet #8338EC dusk sky",
        "vibe": "Lukasz Zal Cold War x Apple",
        "prompt": "Lukasz Zal Cold War style x Apple. Hand on Wawel hill terrace stone parapet, Vistula river curving below, violet #8338EC dusk sky, distant kamienice as warm amber dots. 28mm f/2.8 wide environmental.\n\nPHONE: MapJob DARK full spec, selected pin Krakow.\n\nGrade: cool violet shadows, warm distant amber. Composition: phone lower-left third, Wawel silhouette right. Copy space upper-left. NO TEXT. NEGATIVE: standard.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-04",
        "tytul": "Krakow Kazimierz alley 23:15",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Waska aleja Kazimierza, jedna zelazna latarnia, distant bar entrance hot pink #FF006E w bokeh. Reka chest-height, czarny golf turtleneck.",
        "use_case": "Bohemian persona, niche cool. Krakow-specific.",
        "paleta": "Master + hot pink #FF006E",
        "vibe": "Christopher Doyle (Wong Kar-wai)",
        "prompt": "Christopher Doyle style. Narrow tenement alley Krakow Kazimierz 23:15, single iron lantern, distant bar entrance hot pink #FF006E bokeh. Hand at chest, black turtleneck sleeve. 50mm T1.3 deep bokeh.\n\nPHONE: MapJob DARK full spec, selected pin Kazimierz, emerald filter chip 'Zlecenie' active.\n\nGrade: crushed blacks, saturated magenta-pink mid, clean cyan highlights. Composition: phone center-left, alley vanishing right. NO TEXT.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-05",
        "tytul": "Gdansk Mariacka 22:00 sea fog",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Brukowana ulica Mariacka z gargulcami, mgla od morza, jedna emerald #22C55E latarnia przy drzwiach. Sweter knit, salt-air feel.",
        "use_case": "Gdansk maritime, baltycki vibe, regionalny premium ad.",
        "paleta": "Master + emerald lantern #22C55E",
        "vibe": "Roger Deakins Baltic fog",
        "prompt": "Roger Deakins Baltic fog cinematic. Cobblestone Mariacka street with gargoyle drainspouts, sea fog drifting, single emerald #22C55E lantern at door. Hand chest-height, knit sweater sleeve, salt-air feel. 40mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Gdansk.\n\nGrade: deep teal sea-fog with emerald accent. Composition: phone center, lantern bokeh right. Copy upper band. NO TEXT.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-06",
        "tytul": "Wroclaw Rynek 23:40 active rain",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Reka pod markiza nad telefonem chroniaca ekran, gotycki Stary Ratusz amber-lit, padajacy deszcz w foreground catches phone glow as droplet sparkles.",
        "use_case": "Wroclaw atmospheric, dramatic weather, emotional moment.",
        "paleta": "Master + gold amber #FFB700 Hall lights",
        "vibe": "Cuaron Children of Men x Apple",
        "prompt": "Cuaron Children of Men x Apple. Hand under building awning sheltering phone, gothic Old Town Hall amber #FFB700-lit, falling rain in foreground catches phone glow as droplet sparkles. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin Wroclaw.\n\nGrade: warm amber Hall + cool rain foreground + violet phone. Composition: phone lower-center, awning frame top, rain motion right. NO TEXT.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-07",
        "tytul": "Lodz Piotrkowska tram rails wet",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Mokre tramwajowe szyny gleam jako rownolegle cyan reflections vanishing point. Art Nouveau tenements, distant acid green #80FF00 'APTEKA' neon w bokeh.",
        "use_case": "Lodz industrial poetry, iconic polish street.",
        "paleta": "Master + acid green #80FF00 APTEKA neon",
        "vibe": "Wojciech Staron x Apple",
        "prompt": "Wojciech Staron x modern Apple product film. Wet tram rails as parallel cyan reflection lines vanishing point, Art Nouveau facades, distant acid green #80FF00 APTEKA neon bokeh. Hand chest-height, puffer jacket sleeve. 45mm anamorphic T2.6.\n\nPHONE: MapJob DARK full spec, selected pin Lodz.\n\nGrade: teal-amber split + acid green accent. Composition: phone center-left, rails leading right. Upper band sky. NO TEXT.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-08",
        "tytul": "Lublin Stare Miasto 22:30 mist",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Reka na kamiennej lawce w mglistym Old Town placu Lublin, sodium #FFD60A amber lamps glowing through mist. Trynitarska Tower silhouette.",
        "use_case": "Lublin medieval mood, eastern Polska persona.",
        "paleta": "Master + sodium yellow #FFD60A",
        "vibe": "Slawomir Idziak medieval cinematic",
        "prompt": "Slawomir Idziak medieval cinematic mood. Hand on stone bench misty Old Town square Lublin, Trynitarska Tower silhouette, sodium #FFD60A amber lamps glowing through mist. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Lublin.\n\nGrade: warm sodium fog + violet phone counter. Composition: phone center, tower silhouette upper-right. NO TEXT.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-09",
        "tytul": "Poznan Stary Rynek 22:18 (Master ref)",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Patrz NN-MASTER - flagowy promp sekcji. Magentowy ZAKLAD neon, mokry kostka, ARRI 40mm anamorphic.",
        "use_case": "Master reference, premium hero kampanii.",
        "paleta": "Master + magenta #E83E8C",
        "vibe": "Roger Deakins BR2049 x Apple",
        "prompt": "(Patrz NN-MASTER w sekcji NEON-NOIR dla pelnego prompta - ten wpis to skrocony cross-reference). Photorealistic Roger Deakins (BR2049) cinematic Poznan Stary Rynek 22:18, post-drizzle, magenta #E83E8C ZAKLAD neon bokeh, mirror cobblestone, ARRI Alexa Mini LF + Panavision Ultra Vista 40mm anamorphic T2.0. Phone hand chest-height, MapJob DARK UI. NO TEXT.",
    },
    {
        "sekcja": "POLSKA METROPOLITARNA NIGHT-NOIR",
        "id": "PMN-10",
        "tytul": "Katowice Spodek tunnel 01:20",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Brutalist concrete tunel kolo Spodek, fluorescent vanishing point, single red #E63946 EXIT sign mid-tunnel. Reka chest-height, leather jacket.",
        "use_case": "Katowice industrial after-hours, slaski persona.",
        "paleta": "Master + red #E63946 EXIT",
        "vibe": "Tarkovsky Stalker x Apple",
        "prompt": "Tarkovsky Stalker x Apple. Brutalist concrete tunnel near Katowice Spodek, fluorescent vanishing point, single red #E63946 EXIT sign mid-tunnel. Hand at chest, leather jacket sleeve. 32mm T2.0 crisp geometric.\n\nPHONE: MapJob DARK full spec, selected pin Katowice.\n\nGrade: cold blue tunnel + clean cyan + red EXIT accent. Composition: phone left third, tunnel one-point center-right. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-01",
        "tytul": "Berlin Mitte Hackescher Markt 22:00 drizzle",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Berlinski Mitte rejon, Hackescher Markt, lekki deszcz, hot pink #FF006E neon Spati shop bokeh, S-Bahn rattling overhead.",
        "use_case": "Niemcy reach, polski rzemieslnik w Berlinie persona.",
        "paleta": "Master + hot pink #FF006E",
        "vibe": "Christopher Doyle x Apple Berlin grit",
        "prompt": "Christopher Doyle x Apple Berlin grit cinematic. Hand chest-height, leather jacket, tram bell distant, S-Bahn rattling overhead, hot pink #FF006E Spati shop neon bokeh. Hackescher Markt 22:00 drizzle. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec with EU-zoom map, selected pin Berlin, filter chip 'Zagranica' active.\n\nGrade: Berlin grit teal-magenta. Composition: phone center-left, neon right. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-02",
        "tytul": "Praga Karlov most 23:30 light snow",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Reka na kamiennym mostu Karola, gotyckie statuy, Hradczany silhouette, amber #FFA940 lantern halos through snowfall.",
        "use_case": "Czechy reach, gothic-Christmas mood.",
        "paleta": "Master + amber #FFA940 lantern",
        "vibe": "Hoyte van Hoytema gothic-winter",
        "prompt": "Hoyte van Hoytema gothic-Christmas night. Hand on Karluv most stone bridge railing, gothic statues, Prague Castle silhouette, amber #FFA940 lantern halos through snowfall. 40mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Praga.\n\nGrade: warm amber + cool snow + violet phone. Composition: phone left third, bridge vanishing right. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-03",
        "tytul": "Wieden Stephansplatz 22:00 dry crisp",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Wienski Stephansplatz, gotyckie wieze katedry, deep violet #8338EC blue overlay sky, kashmirowy sweter.",
        "use_case": "Austria reach, imperial elegance, premium target.",
        "paleta": "Master + violet #8338EC sky",
        "vibe": "Edward Lachman imperial",
        "prompt": "Edward Lachman imperial elegance cinematic. Hand at chest, wool cashmere sleeve, gothic cathedral spires lit, deep violet #8338EC evening-blue overlay sky. Stephansplatz 22:00. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Wieden.\n\nGrade: deep violet sky + warm cathedral + cool phone. Composition: phone center-right, spires upper-left. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-04",
        "tytul": "Amsterdam Herengracht canal night",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Reka na kierownicy roweru z telefonem, gabled canal houses reflecting in dark water, mint #06D6A0 boat-houseboat string lights.",
        "use_case": "Holandia reach, freelancer-friendly, intimate canal vibe.",
        "paleta": "Master + mint #06D6A0",
        "vibe": "Robbie Ryan canal-side intimate",
        "prompt": "Robbie Ryan canal-side intimate. Hand on bicycle handlebar with phone, gabled canal houses reflecting in dark water, mint #06D6A0 boat-houseboat string lights. Amsterdam Herengracht 22:00. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Amsterdam.\n\nGrade: dark canal water + warm gable lights + mint accent. Composition: phone left, canal vanishing right. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-05",
        "tytul": "Paryz Pont des Arts dusk",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Reka na drewnianym moscie pieszym, Sekwana plynaca, distant Tour Eiffel rose-gold #F72585 silhouette twilight.",
        "use_case": "Francja reach, Parisian poetic, aspirational.",
        "paleta": "Master + rose-gold #F72585",
        "vibe": "Bradford Young Parisian poetic",
        "prompt": "Bradford Young Parisian poetic. Hand on wooden pedestrian bridge railing, Seine flowing, distant Tour Eiffel rose-gold #F72585 silhouette at twilight. Pont des Arts dusk. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Paris.\n\nGrade: dusk rose-gold + warm Parisian + violet phone. Composition: phone left third, Eiffel right far. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-06",
        "tytul": "Mediolan Galleria Vittorio Emanuele 22:30",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Reka chest-height w szklano-kopulowym pasazu, marble floor reflecting dome arches, cool blue #00B4D8 evening sky through glass roof.",
        "use_case": "Wlochy reach, Milan luxury, designer-style market.",
        "paleta": "Master + cool blue #00B4D8 sky",
        "vibe": "Linus Sandgren Milan luxury",
        "prompt": "Linus Sandgren Milan luxury cinematic. Hand at chest in glass-domed shopping arcade, marble floor reflecting dome arches, cool blue #00B4D8 evening sky through glass roof. Galleria 22:30. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Milano.\n\nGrade: cool blue glass + warm marble + violet phone. Composition: phone center, vault arches symmetric. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-07",
        "tytul": "Dublin Temple Bar 23:00 misty",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Reka chest-height w waskim Temple Bar lane, hot pink #FF006E 'TEMPLE BAR' neon at oblique angle, mist softening highlights.",
        "use_case": "Irlandia reach, polish diaspora friendly.",
        "paleta": "Master + hot pink #FF006E Irish neon",
        "vibe": "Christopher Doyle pub-warmth",
        "prompt": "Christopher Doyle pub-warmth nighttime. Hand chest-height in narrow Temple Bar lane, hot pink #FF006E TEMPLE BAR neon oblique angle, mist softening highlights. Dublin 23:00. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Dublin.\n\nGrade: hot pink Irish + violet phone + misty diffusion. Composition: phone center, neon upper-right oblique. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-08",
        "tytul": "Kopenhaga Nyhavn night reflection",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Reka na barierze nabrzeza, kolorowe Nyhavn houses reflecting in water, amber #FB8500 waterfront restaurant glow, single sail mast emerald light.",
        "use_case": "Dania reach, Scandi-friendly, premium.",
        "paleta": "Master + amber Scandi #FB8500",
        "vibe": "Linus Sandgren Scandinavian",
        "prompt": "Linus Sandgren Scandinavian. Hand on quay railing, colorful Nyhavn houses reflecting in water, amber #FB8500 waterfront restaurant glow, single sail mast emerald #22C55E light. Kopenhaga 22:30. 28mm f/2.8 wide.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Kopenhaga.\n\nGrade: amber Scandi + cool water + violet phone. Composition: phone left, canal houses right. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-09",
        "tytul": "Budapeszt Lanchid bridge night",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Reka chest-height na srodku mostu Lanc, Buda Castle illuminated violet #8338EC, Danube reflecting golden chain bridge bulbs.",
        "use_case": "Wegry reach, Eastern Europe persona.",
        "paleta": "Master + violet #8338EC castle",
        "vibe": "Lukasz Zal riverside imperial",
        "prompt": "Lukasz Zal riverside imperial cinematic. Hand at chest mid-bridge, Buda Castle illuminated violet #8338EC, Danube reflecting golden chain bridge bulbs. Lanchid Chain Bridge 22:00. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Budapest.\n\nGrade: violet castle + golden bridge + cool water + phone. Composition: phone lower-third, bridge silhouette upper. NO TEXT.",
    },
    {
        "sekcja": "EUROPA REACH",
        "id": "EU-10",
        "tytul": "Sztokholm Gamla Stan 22:00 winter",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Reka chest-height w waskim Gamla Stan ulicy, snieg na bruku, ice-blue #B5E2FA window light z gornego mieszkania.",
        "use_case": "Szwecja reach, Nordic premium, IT-friendly.",
        "paleta": "Master + ice blue #B5E2FA",
        "vibe": "Hoyte van Hoytema Nordic Old-Town",
        "prompt": "Hoyte van Hoytema Nordic Old-Town. Hand chest-height in narrow ochre-painted Gamla Stan street, snow on cobbles, ice-blue #B5E2FA upper window light. Sztokholm 22:00 winter. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec, EU-zoom, selected pin Stockholm.\n\nGrade: cool Nordic + ice blue + warm phone. Composition: phone center, narrow alley vanishing. NO TEXT.",
    },
    {
        "sekcja": "INDOOR / INTYMNE",
        "id": "IN-01",
        "tytul": "Polska kuchnia 6:30 morning light",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na surowym debowym blacie, polowiczny kubek kawy z para, klucze, golden window light streaming.",
        "use_case": "Bez postaci - lifestyle still-life. Universal morning ritual.",
        "paleta": "Warm wood + cream + golden window + violet phone",
        "vibe": "Pawel Edelman warm Kodak Portra",
        "prompt": "Pawel Edelman warm Kodak Portra still-life. Phone resting flat on raw oak counter, half-mug of coffee with steam, set of keys, golden window light streaming. No hand visible. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, default map view.\n\nGrade: Kodak Portra warm. Composition: phone upper-center, accessories around, window light from left. Lower band copy space. NO TEXT.",
    },
    {
        "sekcja": "INDOOR / INTYMNE",
        "id": "IN-02",
        "tytul": "Domowe biurko 23:00 desk lamp",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon na ciemno-walnut biurku, single warm Edison bulb lampa rzucajaca dlugi cien, leather notebook closed, brass keys.",
        "use_case": "Late-night decision making moment. Bez persony.",
        "paleta": "Walnut + cognac leather + warm tungsten + violet phone",
        "vibe": "Greig Fraser cinematic still-life",
        "prompt": "Greig Fraser cinematic still-life. Phone on dark walnut desk, single warm Edison bulb lamp casting long shadow, leather notebook closed, brass keys. No hand. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm tungsten cinematic. Composition: phone center, lamp pool of light, deep shadow surround. Upper band copy. NO TEXT.",
    },
    {
        "sekcja": "INDOOR / INTYMNE",
        "id": "IN-03",
        "tytul": "Kawiarnia 21:00 minimalna",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na surowym betonowym stoliku third-wave kawiarni, bialy ceramic flat-white mug ring, amber #FFB700 pendant lamp.",
        "use_case": "Modern coffee culture, post-work decision.",
        "paleta": "Concrete + amber pendant + violet phone",
        "vibe": "Bradford Young third-wave cafe",
        "prompt": "Bradford Young third-wave cafe. Phone on raw concrete table, ceramic flat-white mug ring, amber #FFB700 pendant lamp. No hand. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm amber pendant + cool concrete. Composition: phone center, mug nearby, pendant top-out. NO TEXT.",
    },
    {
        "sekcja": "INDOOR / INTYMNE",
        "id": "IN-04",
        "tytul": "Hotel lobby 22:30 cosmopolitan",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Telefon na marble lobby low-table, leather chesterfield armchair behind, cool emerald #22C55E ambient ceiling light.",
        "use_case": "Travel persona, business class, premium.",
        "paleta": "Marble + cognac leather + emerald + violet phone",
        "vibe": "Linus Sandgren luxury-neutral",
        "prompt": "Linus Sandgren luxury-neutral. Phone on marble lobby low-table, leather chesterfield armchair behind, cool emerald #22C55E ambient ceiling light. No hand. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: cool emerald + warm leather + violet. Composition: phone left, chesterfield right blurred. NO TEXT.",
    },
    {
        "sekcja": "INDOOR / INTYMNE",
        "id": "IN-05",
        "tytul": "Sypialnia rano przy oknie",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon na bialej linen poscieli, golden morning sun streaking diagonal, blurred curtain edge.",
        "use_case": "Pierwszy moment dnia, pre-coffee. Universal.",
        "paleta": "White linen + soft gold + violet phone",
        "vibe": "Newton Thomas Sigel intimate dawn",
        "prompt": "Newton Thomas Sigel intimate dawn. Phone resting on white linen bedsheet, golden morning sun streaking diagonal, blurred curtain edge. No hand. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm dawn linen + violet phone glow. Composition: phone center, sun rays diagonal. NO TEXT.",
    },
    {
        "sekcja": "MACRO / SURREAL / BRAND",
        "id": "MS-01",
        "tytul": "Pin drop close-up macro",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Pojedyncza fioletowa pinezka MapJob (rounded square z biala teczka, pointed tail) na ciemnej macie, fioletowe halo swiatla pod spodem.",
        "use_case": "Brand mark, bumper, product hero.",
        "paleta": "Matte black + violet halo + cyan rim",
        "vibe": "Greig Fraser product hero",
        "prompt": "Greig Fraser product hero macro. Single deep-purple #7C3AED MapJob pin (rounded square, white briefcase glyph, pointed tail) on dark matte surface, faint violet halo radiating below. 100mm macro f/4 focus stacked.\n\nGrade: cinematic dark, crushed blacks, elevated violet. Composition: pin lower-right third, negative space upper-left for copy. NO TEXT. NEGATIVE: no other UI elements, clean abstract.",
    },
    {
        "sekcja": "MACRO / SURREAL / BRAND",
        "id": "MS-02",
        "tytul": "Phone + paper map of Europe flat-lay",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down: telefon zawiesza sie 1cm nad papierowa mapa Europy na orzechowym biurku. Cyfrowe pinezki rzutuja sie na papier.",
        "use_case": "Cyfrowe x analogowe, Europe reach symbol.",
        "paleta": "Walnut + paper cream + violet phone projection",
        "vibe": "Edward Lachman top-down cinematic",
        "prompt": "Edward Lachman top-down cinematic. Phone hovers slightly above large paper Europe map on walnut desk, screen casts soft violet/cyan glow onto Poland on paper. Brass compass, leather notebook, espresso cup. 35mm f/5.6 overhead.\n\nPHONE: MapJob DARK full spec, EU-zoom.\n\nGrade: warm walnut + violet projection. Composition: top-down centered. Upper band copy. NO TEXT.",
    },
    {
        "sekcja": "MACRO / SURREAL / BRAND",
        "id": "MS-03",
        "tytul": "Portal - phone screen as window to city",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon levituje w black void, ekran to dosłownie miniature 3D Polish cityscape, tall purple pin-monoliths over rooftops, microscopic figures walking.",
        "use_case": "Surreal brand statement, premium.",
        "paleta": "Deep black + violet city glow + cyan accents",
        "vibe": "Magritte x Pixar x Apple",
        "prompt": "Magritte x Pixar x Apple surreal photoreal. Phone floats in black void, screen IS literal miniature 3D Polish cityscape, glowing purple #7C3AED pin-monoliths over rooftops, microscopic figures walking, soft violet fog beyond phone edges. MapJob dark UI framing remains at top bar and bottom CTA. 50mm f/2.8 centered.\n\nGrade: deep void + violet city glow. Composition: phone centered symmetric. Top-bottom copy bands. NO TEXT.",
    },
    {
        "sekcja": "MACRO / SURREAL / BRAND",
        "id": "MS-04",
        "tytul": "Fireflies - pins over Mazury countryside",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Aerial wide nad Mazury Lake District o zmierzchu, tysiace tiny purple pins floating like fireflies nad lasami i wioskami.",
        "use_case": "Environmental brand, kraj-szeroki zasieg.",
        "paleta": "Lake silver + forest green + violet fireflies + warm horizon",
        "vibe": "Werner Herzog x Apple",
        "prompt": "Werner Herzog x Apple environmental cinematic. Aerial wide-angle over Masurian Lake District at dusk, thousands of tiny purple #7C3AED glowing pins scattered like fireflies above forests, villages, lakesides. Faint aurora-like violet ribbon. 24mm f/4.\n\nGrade: lake silver + forest dark + violet. Composition: aerial wide, sky upper third copy space. NO TEXT.",
    },
    {
        "sekcja": "MACRO / SURREAL / BRAND",
        "id": "MS-05",
        "tytul": "Diverse hands placing pins overhead",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down na ciemny walnut stol z papierowa mapa Polski, 7 roznych dloni siegajacych z krawedzi placing physical purple pins.",
        "use_case": "Inclusive brand values, no faces.",
        "paleta": "Walnut + cream paper + violet pins + warm overhead",
        "vibe": "Bradford Young inclusive overhead",
        "prompt": "Bradford Young x Apple inclusive overhead. Top-down dark walnut table with paper Polska map, seven different hands (worn, manicured, older, chef apron, paramedic glove, teenager, scholar) reaching from edges placing physical purple pins. Moody warm key. 50mm f/5.6.\n\nGrade: cinematic deep + warm key. Composition: radial centered. NO TEXT.",
    },
    {
        "sekcja": "NATURA & ZIVIOLY",
        "id": "NT-01",
        "tytul": "Phone on moss rock - Bieszczady forest",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Glowny las polski (Bieszczady), mossy granitowa skala jako naturalny pedestal, telefon na mchu, dappled forest light filtering through Carpathian beech canopy.",
        "use_case": "Outdoor / rural Polska, regionalny ad.",
        "paleta": "Forest green + golden dapples + violet phone",
        "vibe": "Peter Lik nature cinematic",
        "prompt": "Peter Lik nature cinematic x Apple. Deep Polish forest, mossy granite rock as natural pedestal, phone resting on moss, dappled forest light filtering through Carpathian beech canopy. Bieszczady. 50mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: forest green + warm dapples + violet. Composition: phone center on rock, forest deep around. NO TEXT.",
    },
    {
        "sekcja": "NATURA & ZIVIOLY",
        "id": "NT-02",
        "tytul": "Phone on Mazury lakeside dock",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Drewniane molo nad Mazury jezioro o zlocistej godzinie, telefon na krawedzi, jezioro stretching to horizon, sailboats far in distance.",
        "use_case": "Wakacyjny / weekend persona, regionalny.",
        "paleta": "Golden water + warm wood + violet phone",
        "vibe": "Reuben Wu lakeside cinematic",
        "prompt": "Reuben Wu lakeside cinematic. Wooden lakeside dock at Mazury at golden hour, phone resting at edge with lake stretching to horizon, sailboats far distance. 35mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin Olsztyn region.\n\nGrade: warm gold lake + violet phone. Composition: phone left, lake horizontal mid, sky upper. NO TEXT.",
    },
    {
        "sekcja": "NATURA & ZIVIOLY",
        "id": "NT-03",
        "tytul": "Phone in palm Tatry summit",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Reka na szczycie Rysy/Giewont, telefon w palm na tle panoramy Tatr fading w mgle, alpenglow on snow caps.",
        "use_case": "Ambicja / osiagniecie, regional Tatry.",
        "paleta": "Alpine pink + cool blue shadow + violet phone",
        "vibe": "Reuben Wu summit cinematic",
        "prompt": "Reuben Wu summit cinematic. Hand on Rysy/Giewont peak, phone in palm against panorama of Tatra mountains receding into haze, alpenglow on snow caps. 35mm f/8 deep wide.\n\nPHONE: MapJob DARK full spec, selected pin Zakopane.\n\nGrade: alpine pink + cool blue + warm phone. Composition: phone lower-center, peaks receding upper. NO TEXT.",
    },
    {
        "sekcja": "NATURA & ZIVIOLY",
        "id": "NT-04",
        "tytul": "Phone on Baltyk beach sunrise",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Telefon w mokrym Baltyckim piasku, dawn pink sky, gentle waves lapping near, single seagull silhouette.",
        "use_case": "Coastal Polska, fresh-start moment.",
        "paleta": "Dawn pink + sand + violet phone",
        "vibe": "Joel Meyerowitz beach cinematic",
        "prompt": "Joel Meyerowitz beach cinematic. Phone half-buried in damp Baltic sand, dawn pink sky, gentle waves lapping near, single seagull silhouette. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Gdansk/Gdynia.\n\nGrade: dawn pink + cool sand + violet. Composition: phone lower-third, horizon mid, sky upper. NO TEXT.",
    },
    {
        "sekcja": "NATURA & ZIVIOLY",
        "id": "NT-05",
        "tytul": "Phone among lavender field",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Polskie pole lawendy w pelnym kwitnieniu (Lubelszczyzna), telefon na drewnianej lawce na krawedzi pola, late afternoon sun.",
        "use_case": "Idilic Polska, niche premium, Lubelszczyzna.",
        "paleta": "Lavender purple + green + golden + violet phone",
        "vibe": "Charlie Waite nature cinematic",
        "prompt": "Charlie Waite nature cinematic. Polish lavender farm in bloom (Lubelszczyzna exists), phone resting on wooden bench at edge of field, late afternoon sun. 35mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin Lublin region.\n\nGrade: lavender purple match + golden warm + violet phone (subtle pin matches lavender hue). Composition: phone center-left, field stretching right. NO TEXT.",
    },
    {
        "sekcja": "ARCHITEKTURA & GEOMETRIA",
        "id": "AR-01",
        "tytul": "Brutalist concrete monument",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Massive raw concrete monolit (Soviet-era polski monument feel), telefon w foreground, hard sun-key z prawej cast crisp geometric shadow.",
        "use_case": "Brutalist statement, slaski ad.",
        "paleta": "Cool concrete grey + violet phone + cyan sky",
        "vibe": "Andreas Gursky monumentalism",
        "prompt": "Andreas Gursky x Apple monumentalism. Massive raw concrete monolith fills right two-thirds (Soviet-era Polish monument feel), phone held foreground left chest-height. Single hard sun-key from camera-right casts crisp geometric shadow. Daylight. 35mm f/8 deep focus.\n\nPHONE: MapJob DARK full spec, selected pin Katowice.\n\nGrade: cool concrete + cyan sky. Composition: phone left, monolith right. NO TEXT.",
    },
    {
        "sekcja": "ARCHITEKTURA & GEOMETRIA",
        "id": "AR-02",
        "tytul": "Glass skyscraper symmetric reflection",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Perfectly symmetric glass facade reflecting sky and second tower opposite, vanishing point center. Telefon hovers low-center.",
        "use_case": "Modern Warsaw business district, premium.",
        "paleta": "Cold blue glass + violet pin glow + emerald",
        "vibe": "Hiroshi Sugimoto symmetric architectural",
        "prompt": "Hiroshi Sugimoto x Apple symmetric architectural. Perfectly symmetric glass facade reflecting sky and second tower opposite, vanishing point center. Phone hovers low-center, hand grip. 24mm f/5.6 wide architectural. Daylight overcast.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa.\n\nGrade: cold glass + violet phone + emerald accent. Composition: symmetric, phone center. NO TEXT.",
    },
    {
        "sekcja": "ARCHITEKTURA & GEOMETRIA",
        "id": "AR-03",
        "tytul": "Modernist gallery white cube plinth",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "White-cube gallery space, single white plinth center, telefon na top, single overhead spot. Pure white walls, polished concrete floor.",
        "use_case": "Museum-grade, designerska elite, art-class.",
        "paleta": "White-cream + violet phone glow",
        "vibe": "James Turrell minimalist gallery",
        "prompt": "James Turrell x Apple minimalist gallery. White-cube gallery space, single white plinth center, phone resting on top, single overhead spot. Pure white walls, polished concrete floor. 50mm f/2.8 centered symmetric.\n\nPHONE: MapJob DARK full spec.\n\nGrade: pure white + violet phone as only color. Composition: symmetric centered. Upper-right copy. NO TEXT.",
    },
    {
        "sekcja": "DOKUMENT / PHOTOJOURNALISM",
        "id": "DC-01",
        "tytul": "Magnum-style market vendor Torun",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Polski targ-stoisko w Toruniu o 8 rano, vegetable crates, vendor's weathered hands chest-height holding phone, faded apron.",
        "use_case": "Real Polska, dignified work, regionalny.",
        "paleta": "Muted earth + cream + violet phone as only saturated",
        "vibe": "Sebastiao Salgado dignified",
        "prompt": "Sebastiao Salgado x Apple dignified documentary. Polish farmers market stall Torun 8am, vegetable crates, vendor weathered hands chest-height holding phone, faded apron. Overcast soft daylight. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Torun.\n\nGrade: muted earth + cream + violet pop. Composition: phone center, crates around. NO TEXT.",
    },
    {
        "sekcja": "DOKUMENT / PHOTOJOURNALISM",
        "id": "DC-02",
        "tytul": "Polish farmer hands wheat field",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Extreme close-up of weathered, dirt-streaked hands holding phone in wheat field at golden hour. Wedding ring visible, deep lifelines.",
        "use_case": "Rural Polska, dignified labor, soil-to-screen narrative.",
        "paleta": "Golden wheat + earth-brown + violet phone",
        "vibe": "James Nachtwey rural documentary",
        "prompt": "James Nachtwey x Apple rural documentary. Extreme close-up weathered dirt-streaked hands holding phone in wheat field at golden hour. Wedding ring visible, deep lifelines. 100mm macro f/4.\n\nPHONE: MapJob DARK full spec, selected pin rural Polska.\n\nGrade: golden wheat warm + earth + violet. Composition: hands centered, wheat surrounding. Upper band copy. NO TEXT.",
    },
    {
        "sekcja": "DOKUMENT / PHOTOJOURNALISM",
        "id": "DC-03",
        "tytul": "Construction worker break Wroclaw",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Polski plac budowy poza Wroclawiem o przerwie obiadowej, worker sits on cement bag, hard hat beside, holding phone. Half-built building behind softly out of focus.",
        "use_case": "Real budowlanka, polski rzemieslnik core target.",
        "paleta": "Hi-vis yellow + concrete + violet phone",
        "vibe": "Eugene Smith industrial dignity",
        "prompt": "Eugene Smith x Apple industrial dignity. Construction site outside Wroclaw lunch break, worker sits on cement bag, hard hat beside, holding phone. Half-built building behind softly OOF. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Wroclaw.\n\nGrade: hi-vis + concrete + violet. Composition: phone center, half-build right blurred. NO TEXT.",
    },
    {
        "sekcja": "DOKUMENT / PHOTOJOURNALISM",
        "id": "DC-04",
        "tytul": "Train conductor Warszawa Centralna",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "PKP Intercity konduktor w mundurze, na peronie Warszawa Centralna, phone glance between announcements, train doors closing behind.",
        "use_case": "Public service worker, kolei persona.",
        "paleta": "Navy uniform + amber platform + violet phone",
        "vibe": "Henri Cartier-Bresson decisive moment",
        "prompt": "Henri Cartier-Bresson x Apple decisive moment. PKP Intercity conductor in uniform, on Warszawa Centralna platform, phone glance between announcements, train doors closing behind. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa.\n\nGrade: navy uniform + amber platform + violet. Composition: conductor center, train side. NO TEXT.",
    },
    {
        "sekcja": "DOKUMENT / PHOTOJOURNALISM",
        "id": "DC-05",
        "tytul": "Hospital break room nurse",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Polska szpital pielegniarka, mid-30s, w scrubs, sitting on plastic break-room chair, phone in hand. Vending machine glow behind.",
        "use_case": "Healthcare worker, sluzba zdrowia persona.",
        "paleta": "Scrub teal + fluorescent + violet phone",
        "vibe": "Mary Ellen Mark healthcare",
        "prompt": "Mary Ellen Mark x Apple healthcare. Polish hospital nurse mid-30s in scrubs, sitting plastic break-room chair, phone in hand. Vending machine glow behind. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: cool scrub teal + amber vending + violet. Composition: nurse center, vending behind. NO TEXT.",
    },
    {
        "sekcja": "SUREALIZM & SEN",
        "id": "SR-01",
        "tytul": "Phone floating in wheat field at sunset",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Polskie pole pszenicy do horyzontu, single smartphone levituje 1.5m above ground, golden hour light. No hand, no body, just phone suspended.",
        "use_case": "Surreal brand, abstract opportunity metaphor.",
        "paleta": "Golden wheat + amber sky + violet phone glow",
        "vibe": "Magritte impossible reality",
        "prompt": "Magritte x Apple impossible reality. Polish wheat field stretching to horizon, single smartphone levitates 1.5m above ground, golden hour light. No hand, no body, just phone suspended. 50mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin rural.\n\nGrade: golden wheat warm + violet phone. Composition: phone centered floating, wheat below, horizon. NO TEXT.",
    },
    {
        "sekcja": "SUREALIZM & SEN",
        "id": "SR-02",
        "tytul": "Hand emerging from water with phone",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Surface of dark still water (Mazury lake), reka rises slowly z spod, holding telefon aloft, woda cascading off, phone screen still glowing dry.",
        "use_case": "Emergence / breakthrough metaphor.",
        "paleta": "Black water + cyan ripples + violet phone",
        "vibe": "Bill Viola water-emergence",
        "prompt": "Bill Viola x Apple water-emergence. Surface of dark still water (Mazury lake), hand rises slowly from beneath holding phone aloft, water cascading off, phone screen glowing dry untouched. 50mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: black water + cyan ripples + violet. Composition: hand+phone center, water lower. NO TEXT.",
    },
    {
        "sekcja": "SUREALIZM & SEN",
        "id": "SR-03",
        "tytul": "Phone as door-knocker on giant gate",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Massive ancient wooden gate (medieval Polish style), smartphone integrated as door knocker, clearly proportioned correctly, mounted in iron fittings.",
        "use_case": "Surreal threshold metaphor, brand statement.",
        "paleta": "Weathered wood + black iron + violet phone glow",
        "vibe": "Magritte threshold literalized",
        "prompt": "Magritte x Apple threshold literalized. Massive ancient wooden gate (medieval Polish style) fills frame, smartphone integrated as door knocker, proportioned correctly to be a phone, mounted in iron fittings. 35mm f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: weathered wood + iron + violet. Composition: gate fills, phone center as knocker. NO TEXT.",
    },
    {
        "sekcja": "SUREALIZM & SEN",
        "id": "SR-04",
        "tytul": "Phone projecting starscape constellations",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Dark interior, telefon face-up on black surface, beam of light projects upward into air forming a starscape - but each star is a violet pin.",
        "use_case": "Mythology meets technology, premium brand.",
        "paleta": "Deep black + violet pin-stars + cyan accents",
        "vibe": "Greig Fraser projection mythology",
        "prompt": "Greig Fraser x Apple projection mythology. Dark interior, phone face-up on black surface, beam of light projects upward into air forming starscape of constellations - but each star is a violet #7C3AED pin. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: deep void + violet pins. Composition: phone bottom, projection upward filling. NO TEXT.",
    },
    {
        "sekcja": "SUREALIZM & SEN",
        "id": "SR-05",
        "tytul": "Phone half-submerged in honey amber",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon halfway sunk into pool of golden Polish honey, screen still visible glowing through translucent material.",
        "use_case": "Preservation, lasting value, abstract brand.",
        "paleta": "Amber honey + violet pin glow + warm gold rim",
        "vibe": "Storm Thorgerson surreal",
        "prompt": "Storm Thorgerson x Apple surreal preservation. Phone halfway sunk into pool of golden Polish honey (or solidified amber), screen still visible glowing through translucent material. 100mm macro f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: amber honey warm + violet pin. Composition: phone half-in honey, macro detail. NO TEXT.",
    },
    {
        "sekcja": "SPORT & ACTIVE",
        "id": "SP-01",
        "tytul": "Runner pause Wisla boulevard sunrise",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Polski biegacz na bulwarach Wislanych o wschodzie slonca, pauses na running app moment, phone w opasce na ramieniu visible chest-height through unzipped windbreaker.",
        "use_case": "Active lifestyle, urban runner persona.",
        "paleta": "Dawn pink + cool grey + violet phone",
        "vibe": "Annie Leibovitz active lifestyle",
        "prompt": "Annie Leibovitz x Apple active lifestyle. Polish runner on Vistula riverside boulevard at sunrise, pauses on running app moment, phone in armband visible chest-height through unzipped windbreaker. Sweat sheen, breath vapor. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa.\n\nGrade: dawn pink + cool atmosphere + violet. Composition: runner center, river behind. NO TEXT.",
    },
    {
        "sekcja": "SPORT & ACTIVE",
        "id": "SP-02",
        "tytul": "Climbing wall belay break",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Indoor bouldering gym, climber chalked up, phone in pocket pulled out at break, holds and ropes blurred behind.",
        "use_case": "Active gen Z, athletic precision.",
        "paleta": "Rubber red + chalk white + violet phone",
        "vibe": "Jimmy Chin gym athletic",
        "prompt": "Jimmy Chin x Apple gym athletic. Indoor bouldering gym, climber chalked up, phone in pocket pulled out at break, holds and ropes blurred behind. 50mm f/1.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: rubber red + chalk white + violet. Composition: climber center, holds blurred behind. NO TEXT.",
    },
    {
        "sekcja": "SPORT & ACTIVE",
        "id": "SP-03",
        "tytul": "Cyclist Tatry mountain pass",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Road cyclist stopped at panoramic switchback above Zakopane, helmet off, phone showing route + pin nearby. Tatra peaks behind.",
        "use_case": "Outdoor sport, alpine ambition.",
        "paleta": "Alpine blue + neon jersey orange + violet phone",
        "vibe": "Jimmy Chin alpine cinematic",
        "prompt": "Jimmy Chin x Apple alpine cinematic. Road cyclist stopped panoramic switchback above Zakopane, helmet off, phone showing route + pin nearby. Tatra peaks behind. 28mm f/4 wide.\n\nPHONE: MapJob DARK full spec, selected pin Tatry.\n\nGrade: alpine blue + neon jersey + violet. Composition: cyclist left, peaks right vista. NO TEXT.",
    },
    {
        "sekcja": "SPORT & ACTIVE",
        "id": "SP-04",
        "tytul": "Yoga studio mat morning sunlit",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Sunlit polski yoga studio, single rolled mat, phone resting on hardwood beside, soft tropical plants.",
        "use_case": "Wellness, mindful weekend persona.",
        "paleta": "Warm wood + sage green + violet phone + golden window",
        "vibe": "Tim Walker minimal wellness",
        "prompt": "Tim Walker x Apple minimal wellness. Sunlit Polish yoga studio, single rolled mat, phone resting on hardwood beside, soft tropical plants. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: warm wood + sage + golden + violet. Composition: phone center on floor, mat beside, plant blur. NO TEXT.",
    },
    {
        "sekcja": "SPORT & ACTIVE",
        "id": "SP-05",
        "tytul": "Skate park dusk",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Polski skate park o zmierzchu, ramps in background, skater sits on board edge, phone in hand under last sun. Concrete texture rich.",
        "use_case": "Youth culture, gen Z target, urban edge.",
        "paleta": "Concrete grey + sunset orange + violet phone",
        "vibe": "Bryan Schutmaat dusk youth",
        "prompt": "Bryan Schutmaat x Apple dusk youth. Polish skate park at dusk, ramps in background, skater sits on board edge, phone in hand under last sun. Concrete texture rich. 35mm f/2.0.\n\nPHONE: MapJob DARK full spec.\n\nGrade: concrete + sunset orange + violet. Composition: skater center on board, ramps behind. NO TEXT.",
    },
    {
        "sekcja": "HIGH-KEY MINIMALIST",
        "id": "HK-01",
        "tytul": "White cube studio phone hero",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Pure white cyclorama studio, telefon floating-suspended on invisible stand, soft wraparound bright key, zero shadows.",
        "use_case": "Editorial product purity, biały tle dla overlay copy.",
        "paleta": "Pure white + violet pin glow",
        "vibe": "Joel Grimes editorial product",
        "prompt": "Joel Grimes x Apple editorial product. Pure white cyclorama studio, phone floating-suspended invisible stand, soft wraparound bright key, zero shadows. 100mm f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: pure white + violet only color. Composition: phone center floating. Corner negative space. NO TEXT.",
    },
    {
        "sekcja": "HIGH-KEY MINIMALIST",
        "id": "HK-02",
        "tytul": "Cream linen flat-lay",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Top-down on cream linen surface, phone alone, bright airy daylight, soft fabric texture.",
        "use_case": "Sunday clarity, slow morning luxury.",
        "paleta": "Cream + white + violet phone",
        "vibe": "Annie Leibovitz minimal Sunday",
        "prompt": "Annie Leibovitz x Apple minimal Sunday. Top-down cream linen surface, phone alone, bright airy daylight, soft fabric texture. 50mm f/4.\n\nPHONE: MapJob DARK full spec.\n\nGrade: cream + white + violet. Composition: top-down centered phone, fabric texture surrounding. Upper-right copy. NO TEXT.",
    },
    {
        "sekcja": "HIGH-KEY MINIMALIST",
        "id": "HK-03",
        "tytul": "Beach white sand high-key",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Bright Baltyk beach white sand close-up, telefon half-buried, sun blazing overhead, no horizon visible.",
        "use_case": "Hot bright vacation, summer optimism.",
        "paleta": "White sand + sun gold + violet phone",
        "vibe": "Slim Aarons sun-drenched",
        "prompt": "Slim Aarons x Apple sun-drenched. Bright Baltic beach white sand close-up, phone half-buried, sun blazing overhead, no horizon visible. 50mm f/4.\n\nPHONE: MapJob DARK full spec, selected pin Sopot/Gdynia.\n\nGrade: white sand + sun gold + violet. Composition: phone center half-buried, sand textural surround. NO TEXT.",
    },
    {
        "sekcja": "POP-ART & STREET",
        "id": "PA-01",
        "tytul": "Graffiti wall Praga-Polnoc",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Vibrant graffiti wall w Warszawa Praga district, full of street-art tags i murals, phone held against the wall, hand chest-height.",
        "use_case": "Urban culture, gen Z target.",
        "paleta": "Graffiti yellow + magenta + cyan + violet phone",
        "vibe": "Martha Cooper street culture",
        "prompt": "Martha Cooper x Apple street culture. Vibrant graffiti wall Warszawa Praga district, street-art tags and murals, phone against wall, hand chest-height. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa Praga.\n\nGrade: graffiti rainbow + violet phone (matches palette). Composition: phone center, wall texture. NO TEXT.",
    },
    {
        "sekcja": "POP-ART & STREET",
        "id": "PA-02",
        "tytul": "Neon Tokyo-style alley Lodz",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Lodz aleja stylized like Tokyo Akihabara, multi-colored neon signs in Polish, phone held chest-height, vivid color spillage on hand.",
        "use_case": "Hyper-urban, future-Polska imagined.",
        "paleta": "Rainbow neon + violet phone (blends in)",
        "vibe": "Liam Wong Tokyo-Polska hybrid",
        "prompt": "Liam Wong x Apple Tokyo-Polska hybrid. Lodz alley styled like Tokyo Akihabara, multi-colored neon signs in Polish, phone held chest-height, vivid color spillage on hand. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin Lodz.\n\nGrade: rainbow neon + violet phone match. Composition: phone center, neon dense surround. NO TEXT.",
    },
    {
        "sekcja": "POP-ART & STREET",
        "id": "PA-03",
        "tytul": "Festival crowd golden hour",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Polski music festival (Open'er / Off-Festival vibe), crowd silhouettes against golden sun, phone held overhead.",
        "use_case": "Collective cultural moment, festival persona.",
        "paleta": "Silhouette black + sun gold + violet phone",
        "vibe": "Alex Webb collective decisive moment",
        "prompt": "Alex Webb x Apple collective decisive moment. Polish music festival (Open'er/Off feel), crowd silhouettes against golden sun, phone held overhead. 35mm f/2.8.\n\nPHONE: MapJob DARK full spec.\n\nGrade: silhouette + sun gold + violet. Composition: phone overhead foreground, crowd silhouettes mid, sun back. NO TEXT.",
    },
    {
        "sekcja": "AERIAL & DRONE",
        "id": "AD-01",
        "tytul": "Aerial Warszawa Palac Kultury sunrise",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Drone shot directly above PKiN at sunrise, surrounding city radiating geometric patterns, single phone visible far below na balkonie as tiny glowing dot.",
        "use_case": "Vast city, single decision metaphor.",
        "paleta": "Dawn pink + city grey + violet pin-phone tiny",
        "vibe": "Reuben Wu aerial cinematic",
        "prompt": "Reuben Wu x Apple aerial cinematic. Drone shot directly above PKiN at sunrise, surrounding Warsaw city radiating geometric patterns, single phone visible far below on a balcony as tiny glowing dot. 24mm wide drone.\n\nPHONE: MapJob DARK full spec at tiny scale.\n\nGrade: dawn pink + city grey + violet dot. Composition: PKiN center top-down, geometric radiating. NO TEXT.",
    },
    {
        "sekcja": "AERIAL & DRONE",
        "id": "AD-02",
        "tytul": "Aerial Krakow Rynek pattern",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down drone over Rynek Glowny showing geometric stalls and Sukiennice, phone visible on cafe table in one corner.",
        "use_case": "Heritage x modernity, krakowski regional.",
        "paleta": "Cobblestone grey + market color + violet phone",
        "vibe": "Reuben Wu top-down geometric",
        "prompt": "Reuben Wu x Apple top-down geometric. Drone over Rynek Glowny showing geometric stalls and Sukiennice, phone visible on cafe table in one corner. 24mm wide.\n\nPHONE: MapJob DARK full spec, selected pin Krakow.\n\nGrade: grey cobble + market warm + violet pop. Composition: top-down centered, phone corner. NO TEXT.",
    },
    {
        "sekcja": "AERIAL & DRONE",
        "id": "AD-03",
        "tytul": "Aerial Tatra peaks vertical",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Vertical aerial of Tatra summits at golden hour, phone in foreground hiker hand at edge of cliff.",
        "use_case": "Epic vista, ambicja, mountain target.",
        "paleta": "Alpine pink + snow white + violet phone",
        "vibe": "Jimmy Chin alpine vertical",
        "prompt": "Jimmy Chin x Apple alpine vertical. Vertical aerial Tatra summits at golden hour, phone in foreground hiker hand at edge of cliff. 24mm wide vertical.\n\nPHONE: MapJob DARK full spec, selected pin Tatry.\n\nGrade: alpine pink + snow + violet. Composition: hand foreground bottom, peaks receding upward. NO TEXT.",
    },
    {
        "sekcja": "AERIAL & DRONE",
        "id": "AD-04",
        "tytul": "Aerial Mazury lakes archipelago",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down on Polish Mazury lakes from 800m up, lakes form natural pattern, phone in canoe centered as scale.",
        "use_case": "Serene possibility, lake region.",
        "paleta": "Lake blue + forest green + violet phone tiny",
        "vibe": "Reuben Wu lake aerial",
        "prompt": "Reuben Wu x Apple lake aerial. Top-down Mazury lakes from 800m, lakes form natural pattern, phone in canoe centered as scale. 24mm wide.\n\nPHONE: MapJob DARK full spec at small scale.\n\nGrade: lake blue + forest + violet. Composition: top-down lakes pattern, canoe center. NO TEXT.",
    },
    {
        "sekcja": "CYBERPUNK & SCI-FI",
        "id": "CY-01",
        "tytul": "Neon Warszawa 2099 cyberpunk",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Wyobrażony future Warszawa skyline at night with hovering vehicles, vertical neon Polish-language signs in Cyrillic-Latin hybrid, phone in foreground hand glowing.",
        "use_case": "Future-Polska imagined, sci-fi premium ad.",
        "paleta": "Cyberpunk magenta + cyan + violet phone match",
        "vibe": "Liam Wong x Greig Fraser Dune",
        "prompt": "Liam Wong x Greig Fraser Dune cyberpunk. Imagined future Warszawa skyline at night with hovering vehicles, vertical neon Polish-language signs in Cyrillic-Latin hybrid, phone in foreground hand glowing. 35mm f/1.8.\n\nPHONE: MapJob DARK full spec, selected pin 'Warszawa Future'.\n\nGrade: cyberpunk magenta + cyan + violet. Composition: phone foreground, skyline back. NO TEXT.",
    },
    {
        "sekcja": "CYBERPUNK & SCI-FI",
        "id": "CY-02",
        "tytul": "Holographic phone augmented reality",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Person holds phone, ale zamiast ekran, mapa projects upward as 3D holographic city in air, pinezki floating as suspended dots, AR style.",
        "use_case": "Tech-future product demo, premium.",
        "paleta": "Holographic violet + cyan + ambient grey",
        "vibe": "Greig Fraser holographic AR",
        "prompt": "Greig Fraser x Apple holographic AR. Person holds phone, but instead of just screen, map projects upward as 3D holographic city in air, pins floating as suspended dots, AR style. 50mm f/2.0.\n\nPHONE: MapJob DARK full spec with AR projection.\n\nGrade: holographic violet + cyan + ambient. Composition: phone bottom, AR city upper. NO TEXT.",
    },
    {
        "sekcja": "CYBERPUNK & SCI-FI",
        "id": "CY-03",
        "tytul": "Underground neon corridor",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Futuristic Polish metro corridor with violet neon strip lights, person walking phone in hand, motion blur na receding lights.",
        "use_case": "Vector toward opportunity, transit-tech.",
        "paleta": "Corridor violet + chrome + violet phone perfect match",
        "vibe": "Liam Wong x Greig Fraser metro",
        "prompt": "Liam Wong x Greig Fraser metro. Futuristic Polish metro corridor with violet neon strip lights, person walking phone in hand, motion blur on receding lights. 28mm f/2.0.\n\nPHONE: MapJob DARK full spec, selected pin Warszawa metro.\n\nGrade: corridor violet + chrome + perfect match phone. Composition: corridor vanishing point, phone hand foreground. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-01",
        "tytul": "Telefon na bialej cyklorame",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Czysty telefon na bialym cykloramowym tle bez cienia. Light wraparound, soft. Telefon hovers slightly tilted 8 stopni. Pelen MapJob DARK UI.",
        "use_case": "Czysty product shot. Latwo nakladac copy z gory. LinkedIn, display, web banner.",
        "paleta": "Pure white + violet pin glow + cyan CTA accent",
        "vibe": "Apple Pro product photography",
        "prompt": "Apple Pro product photography. Clean smartphone on pure white seamless cyclorama background, no shadow, light wraparound diffused soft. Phone hovers slightly tilted 8 degrees. 100mm f/4 product lens.\n\nPHONE: MapJob DARK UI - near-black #0A0A14 background, purple #7C3AED briefcase pins across Polska visible into Berlin/Praga, selected pin pulse, cyan #00C8D4 CTA pill 'Otworz pelna mape', blue cluster #3B82F6, emerald top-right.\n\nGrade: pure white + violet glow + cyan as only colors. Composition: phone center, full negative space all sides. NO TEXT. NEGATIVE: no shadow underneath, no environment, no logos beyond MapJob wordmark.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-02",
        "tytul": "Telefon na czarnym aksamicie",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na ciemnym czarnym aksamicie z subtelnym texture. Single rim light z lewej, deep shadows. Premium product feel.",
        "use_case": "Premium luxury feel, dark mode hero, dla high-end placementow.",
        "paleta": "Black velvet + warm rim + violet glow",
        "vibe": "Hasselblad luxury product",
        "prompt": "Hasselblad luxury product. Smartphone on dark black velvet with subtle texture. Single warm rim light from left, deep shadows. Premium product feel. 85mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep blacks + warm rim + violet glow. Composition: phone center 60%, velvet texture surround. NO TEXT. NEGATIVE: no environment, no other objects.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-03",
        "tytul": "Telefon na marmurze",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon na czarnym marble z naturalnymi zylkami. Soft top-down studio light. Premium minimalist.",
        "use_case": "Premium minimalist, B2B-friendly, ekskluzywny vibe.",
        "paleta": "Black marble + white veining + violet phone",
        "vibe": "minimalist Italian product",
        "prompt": "Minimalist Italian product photography. Smartphone on black marble surface with natural white veining. Soft top-down studio light. 50mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: marble black + cream veining + violet. Composition: phone slightly off-center, marble texture as 70%. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-04",
        "tytul": "Telefon levitujacy gradient",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon hovering w przestrzeni, soft gradient tlo cream-do-pale-grey. No support visible. Slight tilt for dynamic.",
        "use_case": "Hero shot, brand campaign, klean i nowoczesny.",
        "paleta": "Cream gradient + matte phone + violet pins",
        "vibe": "Annie Leibovitz x Apple clean",
        "prompt": "Annie Leibovitz x Apple clean editorial. Smartphone alone, floating-suspended, no visible support, against soft cream-to-pale-gray gradient background. Centered, slightly tilted 12 degrees for dynamic composition. 100mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: pale gradient + matte graphite + violet pins + cyan. Composition: phone centered, full negative space. NO TEXT. NEGATIVE: no shadow underneath, no environment.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-05",
        "tytul": "Telefon w odbiciu lustra",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon na poliszowanej powierzchni odbijajacej go jako mirror duplicate. Both visible in frame. UI legible in both orientations.",
        "use_case": "Poetic duality, dwa swiaty, premium reflection.",
        "paleta": "Polished black + violet phone + cyan rim reflection",
        "vibe": "Robbie Ryan reflection cinematic",
        "prompt": "Robbie Ryan x Apple reflection cinematic. Phone held over still polished black surface reflecting it upside-down, both visible in frame, screen UI legible in both orientations, hand sleeve a wool dark blue. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: dark polish + violet phone + cyan. Composition: phone upper, reflection lower. Upper-right copy. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-06",
        "tytul": "Telefon macro screen detail",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Extreme close-up ekranu telefonu wypelnia 85% kadru. Subtle pixel texture. Slight glass perspective. Hero UI shot.",
        "use_case": "UI hero, demo of screen, ekspozycja produktu szczegolowa.",
        "paleta": "Glass black + violet pins + cyan CTA",
        "vibe": "MKBHD product macro",
        "prompt": "MKBHD x Apple product macro. Ultra close-up of smartphone screen filling 85% of frame, slight perspective tilt. Screen displays MapJob DARK UI in crisp detail - light theme map of Polska/Europa with dense purple pins, selected pin pulse with profile card, cyan CTA pill 'Otworz pelna mape' bottom, wordmark MapJob top, filter chips. Phone edge just barely visible left and bottom, rest pure screen. Thin specular highlight on glass.\n\nGrade: cinematic product, deep blacks, elevated violet. Composition: screen dominant, copy area in upper-left translucent dark bar. NO TEXT in render. NEGATIVE: no hand, no environment.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-07",
        "tytul": "Telefon z dlugim cieniem",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na jasnej powierzchni, dluga geometric shadow rzucana z hard side-light. Architectural feel.",
        "use_case": "Geometric brand statement, modernistic.",
        "paleta": "Cream surface + violet phone + dark shadow",
        "vibe": "Andreas Gursky architectural product",
        "prompt": "Andreas Gursky x Apple architectural product. Smartphone on light cream surface, long geometric shadow cast from hard directional side-light. Architectural minimalist feel. 50mm f/8 deep focus.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: cream + crisp violet + dark shadow. Composition: phone left third, shadow extending right two-thirds. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-08",
        "tytul": "Telefon top-down centered",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon dokladnie z gory na minimalistycznym wood/concrete surface. Symmetric composition. Ring light visible jako subtelny round reflection w corner glass.",
        "use_case": "Magazine-style flat-lay, social-friendly square.",
        "paleta": "Wood/concrete + violet phone + ring light hint",
        "vibe": "magazine flat-lay editorial",
        "prompt": "Magazine flat-lay editorial. Phone exactly top-down on minimalist wood or concrete surface. Symmetric composition. Ring light visible as subtle round reflection in corner of glass. 50mm f/4 overhead.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm/cool surface + violet phone. Composition: top-down centered, surface texture surrounding. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-09",
        "tytul": "Telefon z subtle backlight glow",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon w ciemnym tle, subtelny violet glow z tylu phone (rim) tworzacy halo. Minimal product hero z mood.",
        "use_case": "Premium reveal, cinematic product moment.",
        "paleta": "Deep dark + violet rim halo + cyan accent",
        "vibe": "Apple keynote reveal",
        "prompt": "Apple keynote reveal cinematic. Smartphone in dark space, subtle violet rim-glow from behind phone creating halo. Minimal product hero with mood. 85mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep dark + violet rim + cyan. Composition: phone center, halo radiating, full dark surround. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Telefon studio",
        "id": "UN-PR-10",
        "tytul": "Telefon studio chromatic",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Telefon na chromatic gradient tle (violet do cyan), subtle gradient lighting. Modern product editorial.",
        "use_case": "Bold modern hero, social-friendly, brand-aligned palette.",
        "paleta": "Violet-to-cyan gradient + matte phone",
        "vibe": "modern editorial chromatic",
        "prompt": "Modern editorial chromatic product. Smartphone on chromatic gradient background (violet to cyan transitioning), subtle gradient lighting matching. 85mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: violet-cyan gradient + phone graphite. Composition: phone center, gradient sweep diagonal. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Same rece",
        "id": "UN-RE-01",
        "tytul": "Reka uniwersalna chwyt z rekawa",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Reka emerging from neutralnego ciemnego rekawa, holding phone at chest height. No skin tone specifics, no rings, no watch. Ungendered, age-neutral.",
        "use_case": "Truly universal grip shot, dla kazdej kampanii.",
        "paleta": "Neutral skin + dark sleeve + violet phone",
        "vibe": "Apple iPhone reference photography",
        "prompt": "Apple iPhone reference photography. Ungendered adult hand emerging from neutral dark wool sleeve, holding smartphone at chest height. No rings, no watch, neutral skin tone, no specific gender markers, no specific age clue. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: neutral, slight warm. Composition: phone center, hand from below right. NO TEXT. NEGATIVE: no face, no specific skin markers, no jewelry, no watch.",
    },
    {
        "sekcja": "UNIWERSALNE - Same rece",
        "id": "UN-RE-02",
        "tytul": "Dwie rece - jedna trzyma, druga puka",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Jedna reka trzyma telefon, druga reka palce input - tap na ekran. Fingertip mid-tap on selected pin. Both hands neutral, no specific markers.",
        "use_case": "Demonstracja interaction, momentu klikniecia, action.",
        "paleta": "Neutral hands + violet pin pulse + cyan",
        "vibe": "Apple iPhone interaction demo",
        "prompt": "Apple iPhone interaction demo. One ungendered hand holds smartphone, second hand fingertip mid-tap on screen at the selected pin. Both hands neutral, no specific markers. 100mm macro f/4.\n\nPHONE: MapJob DARK UI - selected pin in pulse animation moment, profile card sliding from bottom.\n\nGrade: neutral + violet pulse + cyan. Composition: phone center, two hands frame. NO TEXT. NEGATIVE: no face, no jewelry.",
    },
    {
        "sekcja": "UNIWERSALNE - Same rece",
        "id": "UN-RE-03",
        "tytul": "Reka siegajaca po telefon na blacie",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon lezy na blacie, neutralna reka siega po niego z gory. Mid-reach moment, palce tuz nad ekranem.",
        "use_case": "Moment podniesienia, decyzji, captured intent.",
        "paleta": "Neutral surface + violet phone glow + cyan",
        "vibe": "intent moment cinematic",
        "prompt": "Intent moment cinematic. Smartphone lying on neutral wood/concrete surface, ungendered hand reaching down to pick it up from above. Mid-reach moment, fingers just above screen. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec, screen glowing brightly.\n\nGrade: neutral + violet glow + cyan. Composition: phone bottom-center, hand reaching from upper-right. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Same rece",
        "id": "UN-RE-04",
        "tytul": "Reka oddajaca telefon (dwa kadry)",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Dwie rece (oba neutralne, ungendered) - jedna podaje telefon, druga przyjmuje. Mid-handoff moment. Suggests sharing, recommendation.",
        "use_case": "Sharing / recommendation moment, social sharing vibe.",
        "paleta": "Neutral hands + violet phone + cyan",
        "vibe": "shared moment cinematic",
        "prompt": "Shared moment cinematic. Two ungendered hands - one offering smartphone, second receiving. Mid-handoff moment. Both hands neutral skin tone, no specific markers. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: neutral + violet + cyan. Composition: phone center between hands, both hands framing. NO TEXT. NEGATIVE: no faces, no jewelry.",
    },
    {
        "sekcja": "UNIWERSALNE - Same rece",
        "id": "UN-RE-05",
        "tytul": "Top-down rece z telefonem",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down view: dwie rece trzymaja telefon, palce delikatnie obejmujace boki. Ungendered.",
        "use_case": "Universal grip moment, czysty product shot.",
        "paleta": "Neutral hands + violet phone screen + cream surface",
        "vibe": "Apple top-down product",
        "prompt": "Apple top-down product photography. Top-down view: two ungendered hands hold smartphone, fingers gently around sides. No specific markers on hands. 50mm f/4 overhead.\n\nPHONE: MapJob DARK UI full spec, screen filling phone.\n\nGrade: neutral + violet + cream. Composition: top-down centered, hands frame phone. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-01",
        "tytul": "Mapa Polski aerial dense pins",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Aerial render mapy Polski o zmierzchu z setkami fioletowych pinezek z teczkami. Niebo deep indigo + warm horizon glow.",
        "use_case": "Brand epic, kraj-szeroki statement, launch creative.",
        "paleta": "Deep navy map + violet pins + cyan rivers + warm horizon",
        "vibe": "Apple x NASA Earth at Night",
        "prompt": "Apple Designed in California x NASA Earth at Night style. Top-down view of Poland as detailed topographic map at dusk, ~800m altitude. Map base dark navy #0A0A14, rivers as thin cyan #00C8D4 threads, forests dark green, urban graphite. Hundreds of glowing deep-purple #7C3AED briefcase pins scattered across cities, dense Warszawa Krakow Gdansk Wroclaw Poznan Katowice Lublin Szczecin. Several blue cluster circles #3B82F6 with white numbers. Sky deep indigo to warm amber horizon, atmospheric haze, single first-magnitude star upper-right. Edges fade into Berlin/Praga sparse pins. 24mm wide drone-render. NO TEXT in render. NEGATIVE: no city labels, no compass.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-02",
        "tytul": "Europa zoom-out z polskim glow",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Wide aerial mapy Europy o zmierzchu, Polska visibly illuminated densely, sparser pinezki w Berlinie, Pradze, Wiedniu, Amsterdamie, Paryzu.",
        "use_case": "Europe reach, B2B paneuropejski.",
        "paleta": "Deep navy + dense PL violet + sparser EU + cyan threads",
        "vibe": "satellite imagery x cinematic",
        "prompt": "Satellite imagery x cinematic brand render. Aerial photorealistic of Europe at twilight, seen from space. Poland visibly illuminated in dense cluster of glowing purple pins extending westward into Berlin, Vienna, Praga, Amsterdam, Paris, Mediolan, Sztokholm, Kopenhaga sparser pins. Blue cluster circles bloom over major metros. Map surface dark earth with country borders glowing cyan. Rivers and coastlines turquoise threads. Subtle day-to-night terminator line cutting through eastern Europe. 24mm wide. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-03",
        "tytul": "Single pin macro pulse",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Pojedyncza fioletowa pinezka MapJob w extreme close-up, mid-pulse with violet halo radiating. Background blurred dark.",
        "use_case": "Brand mark macro, hero pin moment.",
        "paleta": "Violet halo + dark void + cyan rim",
        "vibe": "Greig Fraser brand macro",
        "prompt": "Greig Fraser x Apple brand macro. Single deep-purple #7C3AED MapJob pin (rounded square, white briefcase, pointed tail) in extreme close-up, mid-pulse with violet halo radiating outward. Background blurred dark. Subtle dust particles. 100mm macro f/4 focus stacked.\n\nGrade: cinematic dark + violet halo + cyan rim. Composition: pin centered, halo radiating. NO TEXT. NEGATIVE: no other UI.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-04",
        "tytul": "Mapa z cyan radius circle",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Mapa miasta polskiego z cyan kolem oznaczajacym promien wyszukiwania. Pinezki wewnatrz kola i na zewnatrz.",
        "use_case": "Pokazuje funkcjonalnosc 'praca w okolicy', radius search.",
        "paleta": "Light map + cyan radius + violet pins",
        "vibe": "infographic clean editorial",
        "prompt": "Infographic clean editorial. Light Google-Maps-style cartography of Polish city neighborhood. Semi-transparent cyan #00C8D4 circle (25% opacity) overlays map showing 5km radius. Inside circle: 12-15 deep purple briefcase pins clustered. Outside: scattered pins. Emerald 'TY' pin at exact center pulsing. 35mm wide overhead. NO TEXT. NEGATIVE: no specific street names, no logos.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-05",
        "tytul": "Mapa z connection threads",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Mapa Centralnej Europy, dwie pinezki swiecace z luminujacym threadem violet-do-cyan miedzy nimi. Network metaphor.",
        "use_case": "Connection / network statement, Polska-EU relacja.",
        "paleta": "Navy map + violet pins + cyan thread",
        "vibe": "Apple Network brand visuals",
        "prompt": "Apple Network brand visuals. Aerial map view Central Europe twilight, Poland right, Germany left. Deep-purple pin glows over Warszawa with pulse. Second purple pin glows Berlin. Between them: luminous thread of light gradient violet-to-cyan, arcing gently across landscape, fiber-optic style. Thread passes through Poznan/Frankfurt smaller relay glows. Other pins scattered subtly. Sky upper third deep indigo to warm horizon. 28mm wide. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-06",
        "tytul": "City mini-map zoom (rotuje per miasto)",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down zoomed mapy polskiego miasta (Warszawa/Krakow/Wroclaw rotacyjnie). Streets visible, 20-30 pinezek wokol centrum.",
        "use_case": "Per-miasto kampania, lokalny target.",
        "paleta": "Light map + violet pins + cyan accent",
        "vibe": "Reuben Wu city aerial",
        "prompt": "Reuben Wu x Apple city aerial. Top-down map view of Polish city neighborhood (Warszawa/Krakow/Wroclaw - rotates per campaign). Streets and buildings textured. Map dark MapJob style with light street mesh. Glowing emerald TY pin pulses at center, 20-30 deep-purple briefcase pins within ~2km radius. Subtle cyan circle outlines radius. 35mm wide top-down isometric. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-07",
        "tytul": "Map ribbon connecting cities",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Stylized mapa Polski z luminujacymi nicami laczacymi miasta. Each thread different color (violet, cyan, emerald). Network organism feel.",
        "use_case": "Brand interconnection statement.",
        "paleta": "Dark map + multi-color threads + violet pins",
        "vibe": "Tron x Apple network brand",
        "prompt": "Tron x Apple network brand. Stylized map of Poland with luminous threads connecting major cities. Each thread different gradient color: violet, cyan, emerald. Network organism feel. Cities glow as nodes with purple pins. 28mm wide. NO TEXT. NEGATIVE: no city labels.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-08",
        "tytul": "3D isometric mapa Polski",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "3D isometric Polski jako game-board, miasta jako wzniesienia, pinezki wbita w teren jako fizyczne objekty.",
        "use_case": "Conceptual brand, gamified visual.",
        "paleta": "Isometric pastel + violet pins + cyan accent",
        "vibe": "Pentagram isometric infographic",
        "prompt": "Pentagram x Apple isometric infographic. 3D isometric rendering of Poland as game-board surface, cities as raised relief, deep-purple #7C3AED pins as physical objects stuck into terrain. Cyan rivers thin. 24mm orthographic. NO TEXT. NEGATIVE: no labels.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-09",
        "tytul": "Mapa z dnia do nocy time-lapse moment",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Mapa Polski w przejsciu dzien-noc, prawa polowa zachodzi w noc, lewa jeszcze w dziennym swietle. Pinezki widoczne caly czas, jasniej swieca w nocy.",
        "use_case": "App always-on metaphor, 24/7 reach.",
        "paleta": "Day/night gradient + violet pins always glowing",
        "vibe": "Apple environmental brand",
        "prompt": "Apple environmental brand. Stylized aerial Poland in day-to-night transition, right half darkening into evening, left half still daylight. Violet pins visible throughout, brightening into night. Atmospheric terminator line crossing. 24mm wide drone-style. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Mapy i grafika",
        "id": "UN-MP-10",
        "tytul": "Pinezki rosnace na mapie time-lapse",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Mapa Polski statyczna, pinezki bloomujace jak kwiaty na poczatku malo, na koncu setki. Mid-bloom moment frozen.",
        "use_case": "Growth narrative, momentum brand.",
        "paleta": "Light map + bloomimg violet pins + warm horizon",
        "vibe": "Werner Herzog environmental",
        "prompt": "Werner Herzog x Apple environmental. Aerial Poland mid-time-lapse moment - some areas dense purple pins, others sparse, suggesting growth in motion. Pins bloom as visible 'flowers' on map surface. 24mm wide drone. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-01",
        "tytul": "Pin drop slow-motion frozen",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Pojedyncza pinezka mid-fall, frozen moment, z motion-blur trail za sobą. Niżej mata na ktora ma uderzyc.",
        "use_case": "Action moment macro, hero impact.",
        "paleta": "Violet pin + motion blur trail + dark mat",
        "vibe": "Greig Fraser frozen action",
        "prompt": "Greig Fraser x Apple frozen action macro. Single deep-purple #7C3AED MapJob pin caught mid-fall in slow motion, frozen moment with motion-blur trail behind. Below: dark matte surface. 100mm macro f/4.\n\nGrade: violet pin + motion trail + crushed dark. Composition: pin upper-center mid-fall, mat lower. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-02",
        "tytul": "Pin floating in particle dust",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Pinezka levituje w przestrzeni wsrod fioletowych czastek/kurzu, soft glow halo. Zero-gravity feel.",
        "use_case": "Premium brand, abstract product moment.",
        "paleta": "Black void + violet particles + pin glow",
        "vibe": "particle abstract brand",
        "prompt": "Particle abstract brand cinematic. Single deep-purple MapJob pin levitates in space surrounded by violet particles/dust, soft glow halo, zero-gravity feel. 100mm macro f/4.\n\nGrade: deep void + violet particles + pin glow. Composition: pin centered, particles swirling. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-03",
        "tytul": "Pin reflected on water surface",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Pinezka nad spokojnej powierzchni czarnej wody, perfect mirror reflection. Subtle ripple just starting.",
        "use_case": "Poetic moment, reflective brand.",
        "paleta": "Black water + violet pin + cyan ripple",
        "vibe": "Bill Viola water reflection",
        "prompt": "Bill Viola x Apple water reflection. Single deep-purple MapJob pin hovering above still black water surface, perfect mirror reflection. Subtle ripple just starting beneath. 100mm macro f/4.\n\nGrade: black water + violet pin + cyan ripple. Composition: pin upper, reflection lower symmetric. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-04",
        "tytul": "Pin frozen in ice crystal",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Pinezka w bryle krysztalowego lodu, swieci przez krystaly. Premium winter feel.",
        "use_case": "Seasonal winter campaign, premium preservation.",
        "paleta": "Ice crystal + violet pin glow through + cool rim",
        "vibe": "Hoyte van Hoytema winter premium",
        "prompt": "Hoyte van Hoytema x Apple winter premium. Single deep-purple MapJob pin frozen inside crystal ice block, glowing through translucent material. Subtle ice texture, cool rim light. 100mm macro f/4.\n\nGrade: ice crystal + violet through + cool. Composition: ice block centered, pin embedded. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-05",
        "tytul": "Pin in honey amber preservation",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Pinezka half-submerged in pool of golden honey, screen visible through translucent amber.",
        "use_case": "Preservation, lasting value, abstract brand.",
        "paleta": "Amber honey + violet pin + warm gold rim",
        "vibe": "Storm Thorgerson preservation",
        "prompt": "Storm Thorgerson x Apple preservation surreal. Single MapJob pin halfway sunk into pool of golden Polish honey or solidified amber, glow visible through translucent material. 100mm macro f/4.\n\nGrade: amber honey + violet through + warm. Composition: pin half-in honey, macro detail. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-06",
        "tytul": "Pin shattered glass effect",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Pinezka jest pelnie ufopmowanazjako glass object, pekajaca/ shattering w jednej polowie do drobnych odlamkow.",
        "use_case": "VFX moment, dramatic brand.",
        "paleta": "Glass clear + violet glow + cyan refractions",
        "vibe": "VFX cinematic shatter",
        "prompt": "VFX cinematic shatter. Single MapJob pin rendered as glass object, half intact, half shattering into small fragments suspended in slow-motion. Violet glow from within. 100mm macro f/4 frozen.\n\nGrade: glass + violet + cyan refractions. Composition: pin centered, fragments radiating. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-07",
        "tytul": "Pin in light beam ray",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Pinezka stoi w pojedynczym promieniu swiatla, otoczona ciemnoscia. Spotlight effect, theatrical.",
        "use_case": "Solo product moment, dramatic brand reveal.",
        "paleta": "Black void + violet pin + cool light beam",
        "vibe": "theatrical spotlight brand",
        "prompt": "Theatrical spotlight cinematic brand. Single MapJob pin standing in single light beam, surrounded by darkness. Spotlight effect, dramatic reveal. 85mm f/2.8.\n\nGrade: black void + violet pin + cool beam. Composition: pin centered in beam, darkness surround. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-08",
        "tytul": "Multiple pins arranged grid",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Top-down: 9 pinezek MapJob ulozonych w 3x3 grid na cream tle. Pattern, repetition, abundance.",
        "use_case": "Brand pattern, abundance metaphor, social-friendly.",
        "paleta": "Cream + violet pin grid + soft shadow",
        "vibe": "Pentagram pattern editorial",
        "prompt": "Pentagram pattern editorial. Top-down: 9 deep-purple MapJob pins arranged in symmetric 3x3 grid on cream surface, perfect spacing. Pattern feel. Soft top light, gentle shadows. 50mm f/4 overhead.\n\nGrade: cream + violet pattern + cyan rim. Composition: 3x3 grid centered, equal spacing. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-09",
        "tytul": "Pin emerging from surface",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Pinezka wynika z surface (concrete/wood/sand) jakby wyrastala. Half-buried, half-emerging.",
        "use_case": "Brand metaphor wzrostu / pojawienia sie.",
        "paleta": "Surface texture + violet pin + warm glow",
        "vibe": "growth metaphor cinematic",
        "prompt": "Growth metaphor cinematic. Single MapJob pin emerging from surface (concrete/wood/sand interpreted), half-buried half-emerging upward. Violet halo from below. 100mm macro f/4.\n\nGrade: textured surface + violet emergence + warm. Composition: pin upper centered, surface lower 60%. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Macro brand",
        "id": "UN-MC-10",
        "tytul": "Pin orbital satellites around phone",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon w centre void, dozen pinezek krazą orbitalnie wokol jak satelity, smug movement trails. Sci-fi.",
        "use_case": "Conceptual hero, sci-fi premium.",
        "paleta": "Deep black + violet pins + cyan trails",
        "vibe": "Bradford Young x Apple orbital",
        "prompt": "Bradford Young x Apple orbital sci-fi. Phone levitates centered deep void, dozens of glowing purple pins orbit around it like satellites with motion trails forming graceful arcs. Soft cyan lens flares. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep void + violet orbits + cyan trails. Composition: phone center, orbital pattern around. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-01",
        "tytul": "Telefon na biurku z akcesoriami",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon centralnie na drewnianym biurku, obok keys, leather notebook closed, brass pen, ceramic mug. No persona implied.",
        "use_case": "Universal lifestyle still-life, dla kazdego.",
        "paleta": "Wood + brass + leather + violet phone glow",
        "vibe": "Tim Walker minimalist still-life",
        "prompt": "Tim Walker x Apple minimalist still-life. Phone center on dark walnut desk, accessories around: brass keys on leather keychain, hand-bound leather notebook closed, brass pen, single ceramic mug. No persona implied. Daylight from camera-left. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm wood + brass + violet. Composition: phone center, accessories radial. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-02",
        "tytul": "Telefon na kontuarze z kawa",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na bialym marble kontuarze cafe, single ceramic flat-white mug ring, amber pendant lamp z gory. Bright morning.",
        "use_case": "Cafe ritual moment, universal morning.",
        "paleta": "White marble + amber pendant + violet phone",
        "vibe": "third-wave cafe editorial",
        "prompt": "Third-wave cafe editorial. Phone on white marble cafe counter, single ceramic flat-white mug ring, amber #FFB700 pendant lamp from above. Bright morning. No persona. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: marble + amber + violet. Composition: phone center, mug nearby. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-03",
        "tytul": "Telefon na nocnym stoliku z ksiazka",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon na nightstand z otwarta ksiazka, lampe Edison bulb soft warm, glass of water. Bedtime moment.",
        "use_case": "Evening universal moment, decyzja dnia.",
        "paleta": "Warm bedside + paper book + violet phone",
        "vibe": "intimate bedside cinematic",
        "prompt": "Intimate bedside cinematic. Phone on wooden nightstand next to open paper book (illegible content), small Edison bulb lamp warm, glass of water. Soft late-evening mood. 35mm f/2.0.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm bedside + paper + violet. Composition: phone left, book right open. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-04",
        "tytul": "Telefon w kuchni przy oknie",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na blat kuchenny przy oknie, golden window light streaming, half-mug coffee with steam, set of keys.",
        "use_case": "Polish kitchen morning, universal home.",
        "paleta": "Warm wood + golden window + cream + violet phone",
        "vibe": "Pawel Edelman warm Portra",
        "prompt": "Pawel Edelman x Apple warm Kodak Portra still-life. Phone on raw oak kitchen counter at window, half-mug of coffee with steam, set of keys, golden window light streaming diagonally. No hand visible. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: Kodak Portra warm. Composition: phone upper-center, accessories around. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-05",
        "tytul": "Telefon w sali konferencyjnej",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Telefon na czystym konferencyjnym stole z laptop closed, cup of espresso, blurred plants tropical at edges. Modern corporate.",
        "use_case": "Business setting, B2B meeting context.",
        "paleta": "Cream conference + leather + violet phone",
        "vibe": "modern corporate editorial",
        "prompt": "Modern corporate editorial. Phone center on clean conference table with closed MacBook, single espresso cup, blurred tropical plants at edges. Soft natural daylight. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: cream + cool natural + violet. Composition: phone center, accessories framing. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-06",
        "tytul": "Telefon w nowoczesnym wnetrzu",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon na concrete coffee table w lofcie, plant in stoneware pot, blurred minimalist sofa. Industrial modern.",
        "use_case": "Modern interior aspirational, dla mlodszych.",
        "paleta": "Concrete + plant green + violet phone",
        "vibe": "industrial modern editorial",
        "prompt": "Industrial modern editorial. Phone on concrete coffee table in loft interior, single plant in stoneware pot, blurred minimalist sofa. Soft window light. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: concrete cool + plant + violet. Composition: phone center, coffee table top-down. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-07",
        "tytul": "Telefon na outdoor cafe table",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na metal outdoor cafe table, espresso cup, sunglasses folded, dappled sunlight through tree leaves.",
        "use_case": "Outdoor cafe moment, summer feel, universal.",
        "paleta": "Metal table + dappled sun + violet phone",
        "vibe": "outdoor cafe editorial",
        "prompt": "Outdoor cafe editorial. Phone on metal outdoor cafe table, espresso cup nearby, sunglasses folded, dappled sunlight through tree leaves above. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm dappled + metal + violet. Composition: phone center, accessories radial. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-08",
        "tytul": "Telefon na lawce parkowej (pusta)",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon zostawiony na drewnianej lawce parkowej, autumn leaves drifting around, no person visible.",
        "use_case": "Quiet moment, urban nature, universal.",
        "paleta": "Park wood + autumn ochre + violet phone",
        "vibe": "Saul Leiter park documentary",
        "prompt": "Saul Leiter x Apple park documentary. Phone resting on wrought-iron and wood park bench, autumn leaves drifting around, no person visible. Soft afternoon golden light. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm autumn + park green + violet. Composition: phone center on bench, leaves blurred motion. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-09",
        "tytul": "Telefon na siedzeniu tramwaju",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na pustym tram seat, motion blur na zewnatrz przez okno, warm tungsten interior. Empty tram.",
        "use_case": "Commute moment, transit, universal urban.",
        "paleta": "Warm tungsten + motion blur + violet phone",
        "vibe": "Wong Kar-wai transit cinematic",
        "prompt": "Wong Kar-wai x Apple transit cinematic. Phone resting on empty modern Polish tram seat, motion blur outside through window, warm tungsten interior tram lighting. Empty tram aside. 35mm f/2.0.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm tungsten + cool exterior blur + violet. Composition: phone on seat lower-center, window upper. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Still-life",
        "id": "UN-SL-10",
        "tytul": "Telefon na desce rozdzielczej auta",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Telefon mounted on car dashboard mount, sunset visible przez windshield. No driver visible.",
        "use_case": "Driver/commuter moment, journey vibe.",
        "paleta": "Dashboard black + sunset orange + violet phone",
        "vibe": "automotive editorial",
        "prompt": "Automotive editorial. Phone mounted on car dashboard mount, sunset visible through windshield. No driver visible. Steering wheel partially in frame. 35mm f/2.8.\n\nPHONE: MapJob DARK UI full spec, screen showing map with route visible.\n\nGrade: dashboard black + sunset + violet phone. Composition: phone center-left, windshield right. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Atmosferyczne",
        "id": "UN-AT-01",
        "tytul": "Telefon w deszczu makro",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Macro telefonu face-up na zewnetrznej powierzchni, krople deszczu uderzajace ekran i odskakujace, faint violet ripple na UI.",
        "use_case": "Atmospheric moment, weather-friendly.",
        "paleta": "Wet glass + violet pulse + cool ambient",
        "vibe": "weather macro cinematic",
        "prompt": "Weather macro cinematic. Macro of phone face-up on outdoor surface, raindrops hitting screen and bouncing, each droplet causing faint violet ripple on UI. 100mm macro f/4.\n\nPHONE: MapJob DARK UI showing full map with pin cascade.\n\nGrade: wet glass + violet ripples + cool ambient. Composition: phone fills frame, droplets motion frozen. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Atmosferyczne",
        "id": "UN-AT-02",
        "tytul": "Telefon ze sniegiem opadajacym",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon na powierzchni outdoor, snow flurries gentle drifting, accumulating around phone. Cold morning.",
        "use_case": "Winter campaign, seasonal.",
        "paleta": "Snow white + cool blue + violet phone",
        "vibe": "winter editorial",
        "prompt": "Winter editorial cinematic. Phone resting on flat outdoor surface, snow flurries gently drifting and accumulating around. Cold morning, breath-vapor in air. 50mm f/2.0.\n\nPHONE: MapJob DARK UI full spec, screen glowing brighter against cold ambient.\n\nGrade: snow white + cool blue + warm phone counter. Composition: phone center, snowflakes dynamic. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Atmosferyczne",
        "id": "UN-AT-03",
        "tytul": "Telefon w golden hour magic",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Telefon outdoor o golden hour, warm sun streaming. Subtle dust particles in beam. Bokeh sun in background.",
        "use_case": "Magic hour universal, optimistic mood.",
        "paleta": "Golden warm + sun bokeh + violet phone",
        "vibe": "Joel Meyerowitz golden hour",
        "prompt": "Joel Meyerowitz x Apple golden hour. Phone outdoor at magic hour, warm sun streaming directly. Subtle dust particles visible in light beam. Sun as bokeh in upper background. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: golden warm + sun bokeh + violet. Composition: phone center-left, sun upper-right bokeh. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Atmosferyczne",
        "id": "UN-AT-04",
        "tytul": "Telefon w blue hour (po zachodzie)",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Telefon outdoor w niebieskiej godzinie zaraz po zachodzie. Cool ambient, urban silhouettes daleko, phone glow dominuje.",
        "use_case": "Sophisticated dusk, premium evening.",
        "paleta": "Blue hour + violet phone + cool ambient",
        "vibe": "Roger Deakins blue hour",
        "prompt": "Roger Deakins x Apple blue hour cinematic. Phone outdoor at deep blue hour just after sunset. Cool ambient, urban silhouettes far in background, phone glow dominates as warmest source. 50mm f/2.0.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep blue hour + warm phone counter + cool ambient. Composition: phone center, distant city silhouettes. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Atmosferyczne",
        "id": "UN-AT-05",
        "tytul": "Telefon o polnocy w glow",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon w deep night, jedyne zrodlo swiatla = ekran. Warm violet halo wokol, full dark tlo.",
        "use_case": "Late night moment, intimate.",
        "paleta": "Deep dark + violet halo + cyan accent",
        "vibe": "Greig Fraser midnight intimate",
        "prompt": "Greig Fraser x Apple midnight intimate. Phone in deep night setting, only light source is screen itself. Warm violet halo radiating, full dark surrounding. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: deep void + violet halo + cyan rim. Composition: phone center, halo radiating, full dark. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Conceptual brand",
        "id": "UN-CN-01",
        "tytul": "Telefon jako kompas",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon na drewnianym biurku z stara mosadzowa kompas obok, vintage map paper. Telefon ma rolę nowoczesnego kompasu.",
        "use_case": "Tradition meets modernity metaphor.",
        "paleta": "Walnut + brass compass + map cream + violet phone",
        "vibe": "explorer editorial",
        "prompt": "Explorer editorial cinematic. Phone on dark walnut desk next to vintage brass compass, vintage paper map partially unfolded. Phone as 'modern compass' metaphor. Warm Edison lamp. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec, EU-zoom.\n\nGrade: warm walnut + brass + map paper + violet. Composition: phone left, compass right, map background. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Conceptual brand",
        "id": "UN-CN-02",
        "tytul": "Telefon w ksiazce historycznej",
        "format": "4:5 (1080x1350)",
        "co_widzimy": "Otwarta vintage ksiazka, telefon umieszczony jak bookmark. Old paper, marbled endpapers, modern device juxtaposed.",
        "use_case": "Old-meets-new conceptual.",
        "paleta": "Old paper + leather book + violet phone glow",
        "vibe": "Wes Anderson vintage editorial",
        "prompt": "Wes Anderson x Apple vintage editorial. Open vintage hardcover book with marbled endpapers, phone placed like bookmark between pages. Old paper texture, modern phone juxtaposed. 50mm f/4.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: cream paper + leather + violet phone. Composition: top-down, phone in book center. NO TEXT.",
    },
    {
        "sekcja": "UNIWERSALNE - Conceptual brand",
        "id": "UN-CN-03",
        "tytul": "Telefon w kolekcji pocztowek",
        "format": "16:9 (1920x1080)",
        "co_widzimy": "Top-down: telefon centralnie, otoczony 8 generic vintage pocztowkami z roznych miast Polski/Europy. Telefon = mapa wszystkich miast.",
        "use_case": "Collection / abundance metaphor, EU reach.",
        "paleta": "Vintage postcards + violet phone center",
        "vibe": "vintage collection editorial",
        "prompt": "Vintage collection editorial. Top-down: phone centered, surrounded by 8 generic vintage-style postcards from different Polish and European cities (without specific recognizable landmarks). 35mm f/4 overhead.\n\nPHONE: MapJob DARK UI full spec, EU-zoom map.\n\nGrade: cream postcards + violet phone center. Composition: top-down radial pattern. NO TEXT. NEGATIVE: no recognizable landmarks.",
    },
    {
        "sekcja": "UNIWERSALNE - Conceptual brand",
        "id": "UN-CN-04",
        "tytul": "Telefon na drewnianej grze planszowej",
        "format": "1:1 (1080x1080)",
        "co_widzimy": "Telefon umieszczony na vintage drewnianej grze planszowej w polowie. Planszowy elementy w blur. Game-of-life metaphor.",
        "use_case": "Decision metaphor, choice / strategy.",
        "paleta": "Wood game + brass tokens + violet phone",
        "vibe": "game-of-life editorial",
        "prompt": "Game-of-life editorial. Phone placed on vintage wooden board game mid-play, brass tokens scattered, dice nearby. Game elements partially in blur. 50mm f/2.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: warm wood + brass + violet phone. Composition: phone on board center, game pieces around. NO TEXT. NEGATIVE: no recognizable game branding.",
    },
    {
        "sekcja": "UNIWERSALNE - Conceptual brand",
        "id": "UN-CN-05",
        "tytul": "Telefon w roślinach żywych",
        "format": "9:16 (1080x1920)",
        "co_widzimy": "Telefon otoczony zywymi tropikalnymi roslinami, monstera leaves, light filtering through. Greenhouse feel.",
        "use_case": "Growth / life metaphor, organic feel.",
        "paleta": "Plant green + warm light + violet phone",
        "vibe": "tropical greenhouse editorial",
        "prompt": "Tropical greenhouse editorial. Phone surrounded by living tropical plants, monstera deliciosa leaves, light filtering through fronds. Greenhouse feel. 50mm f/1.8.\n\nPHONE: MapJob DARK UI full spec.\n\nGrade: plant green + warm filtered + violet phone. Composition: phone center embedded in foliage. NO TEXT.",
    },
]

# ===== POMOCNICZE =====

def add_paragraph_with_runs(doc, runs_data, alignment=WD_ALIGN_PARAGRAPH.LEFT, space_after=0):
    """Dodaje paragraf z wieloma stylowanymi runami."""
    p = doc.add_paragraph()
    p.alignment = alignment
    if space_after:
        p.paragraph_format.space_after = Pt(space_after)
    for text, font_name, size, bold, color in runs_data:
        run = p.add_run(text)
        run.font.name = font_name
        run.font.size = Pt(size)
        run.bold = bold
        if color:
            run.font.color.rgb = color
    return p

def add_horizontal_line(doc):
    """Dodaje cienki separator."""
    p = doc.add_paragraph()
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), '7C3AED')
    pBdr.append(bottom)
    pPr.append(pBdr)
    return p

def shade_paragraph(p, color_hex):
    """Dodaje shading do paragrafu."""
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    pPr.append(shd)

# ===== BUDOWA DOKUMENTU =====

def build_document(output_path):
    doc = Document()

    # Ustawienia strony
    for section in doc.sections:
        section.top_margin = Cm(2)
        section.bottom_margin = Cm(2)
        section.left_margin = Cm(2)
        section.right_margin = Cm(2)

    # Główny styl
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(10)

    # ===== STRONA TYTUŁOWA =====
    add_paragraph_with_runs(doc, [("\n\n\n\n", 'Calibri', 11, False, None)])
    add_paragraph_with_runs(doc, [
        ("MapJob", 'Calibri', 48, True, COLOR_PURPLE),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph_with_runs(doc, [
        ("KATALOG REKLAMOWY", 'Calibri', 24, True, COLOR_DARK),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    add_paragraph_with_runs(doc, [
        ("Prompty do generacji obrazów reklamowych", 'Calibri', 14, False, COLOR_GREY_MID),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph_with_runs(doc, [
        ("Nano Banana (Gemini 2.5 Flash Image) ready", 'Calibri', 11, False, COLOR_GREY_MID),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)

    add_paragraph_with_runs(doc, [("\n\n\n", 'Calibri', 11, False, None)])

    add_paragraph_with_runs(doc, [
        ("Cały rynek pracy w Twoim zasięgu.", 'Calibri', 16, True, COLOR_DARK),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph_with_runs(doc, [
        ("Firma, zlecenie czy etat — wbij pinezkę i bądź widoczny w Polsce i Europie.", 'Calibri', 11, False, COLOR_GREY_MID),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)

    add_paragraph_with_runs(doc, [("\n\n\n\n\n", 'Calibri', 11, False, None)])

    # Stopka tytułowej
    add_paragraph_with_runs(doc, [
        ("Wersja katalogu: 2026-04-25", 'Calibri', 10, False, COLOR_GREY_MID),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph_with_runs(doc, [
        (f"Liczba wpisów: {len(ENTRIES)}", 'Calibri', 10, False, COLOR_GREY_MID),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)

    doc.add_page_break()

    # ===== JAK UŻYWAĆ =====
    add_paragraph_with_runs(doc, [
        ("Jak używać tego katalogu", 'Calibri', 22, True, COLOR_PURPLE),
    ])
    add_horizontal_line(doc)

    instructions = [
        ("1. Przeglądaj wpisy", "Każdy wpis ma sekcję 'Co widzimy' (opis sceny po polsku) i 'Use case' (do czego się nadaje). Czytaj te dwie sekcje, żeby ocenić czy koncept pasuje do Twojej kampanii."),
        ("2. Kopiuj prompt EN", "Pełny prompt w języku angielskim jest w sekcji 'Prompt EN' — to gotowy tekst do wklejenia do Nano Banana (Gemini 2.5 Flash Image). Po angielsku, bo Nano Banana najlepiej rozumie angielskie prompty."),
        ("3. Renderuj BEZ tekstu", "Zalecane: generuj obraz BEZ wbudowanego tekstu (polskie znaki ą/ę/ł czasem się rozpadają). Tekst 'Cały rynek pracy…' dorzucisz w Figmie/Canvie w 30 sekund."),
        ("4. Standardowy copy", "Stały headline: 'Cały rynek pracy w Twoim zasięgu'. Stały subhead: 'Firma, zlecenie czy etat — wbij pinezkę i bądź widoczny w Polsce i Europie.' Font: Inter / Geist Sans / Söhne. Kolor: cream #F5EBD8 z soft shadow."),
        ("5. Aspect ratio", "Każdy wpis ma format (4:5 / 9:16 / 1:1 / 16:9). Pasuj do placementu: Reels = 9:16, Meta feed = 4:5, LinkedIn = 1:1 lub 16:9, banery = 1200×628."),
        ("6. Iteruj", "Pierwszy render może wymagać poprawki. Najczęstsze problemy: light theme zamiast dark (wzmocnij 'MUST be dark mode'), czerwone Google piny zamiast fioletowych z teczką (dodaj 'NEGATIVE: no red Google teardrop pins, must be deep purple #7C3AED rounded-square with white briefcase icon')."),
    ]

    for title, body in instructions:
        add_paragraph_with_runs(doc, [
            (title, 'Calibri', 12, True, COLOR_DARK),
        ], space_after=4)
        add_paragraph_with_runs(doc, [
            (body, 'Calibri', 10, False, COLOR_GREY_DARK),
        ], space_after=10)

    doc.add_page_break()

    # ===== STAŁE BRAND =====
    add_paragraph_with_runs(doc, [
        ("Stałe brandowe MapJob", 'Calibri', 22, True, COLOR_PURPLE),
    ])
    add_horizontal_line(doc)

    add_paragraph_with_runs(doc, [
        ("UI aplikacji (zawsze trzymaj w prompt)", 'Calibri', 13, True, COLOR_DARK),
    ], space_after=4)

    ui_specs = [
        "Theme: DARK MODE — tło near-black #0A0A14, panele graphite #1A1A2E.",
        "Wordmark: 'MapJob' granatowy korpus z pomarańczową pinezką nad literami.",
        "Filter chips: 'Firma' / 'Zlecenie' / 'Etat' — pill outline, aktywny = cyan fill #00C8D4.",
        "Mapa: light Google-Maps-style cartography, Polska centrum + Europa widoczna.",
        "Pinezki: deep purple #7C3AED rounded-square z białą teczką, pointed tail.",
        "Cluster pinezki: round bright blue #3B82F6 z białą cyfrą.",
        "Selected pin: większy, violet pulse halo, profile card sliding from bottom 1/3.",
        "Bottom CTA: cyan #00C8D4 pill 'Otwórz pełną mapę'.",
        "Bottom tab bar: dark, 5 ikon (Start/Mapa/Zlecenia/Czat/Profil).",
    ]
    for spec in ui_specs:
        add_paragraph_with_runs(doc, [
            ("• ", 'Calibri', 10, False, COLOR_PURPLE),
            (spec, 'Calibri', 10, False, COLOR_GREY_DARK),
        ], space_after=2)

    add_paragraph_with_runs(doc, [("\n", 'Calibri', 10, False, None)])

    add_paragraph_with_runs(doc, [
        ("Paleta", 'Calibri', 13, True, COLOR_DARK),
    ], space_after=4)
    palette_items = [
        ("Purple (pinezki)", "#7C3AED", COLOR_PURPLE),
        ("Cyan (CTA)", "#00C8D4", COLOR_CYAN),
        ("Emerald (success)", "#22C55E", COLOR_EMERALD),
        ("Blue (cluster)", "#3B82F6", COLOR_BLUE),
        ("Near-black (UI ground)", "#0A0A14", COLOR_DARK),
    ]
    for name, hex_code, color in palette_items:
        add_paragraph_with_runs(doc, [
            ("█  ", 'Calibri', 11, True, color),
            (f"{name} — {hex_code}", 'Calibri', 10, False, COLOR_GREY_DARK),
        ], space_after=2)

    add_paragraph_with_runs(doc, [("\n", 'Calibri', 10, False, None)])

    add_paragraph_with_runs(doc, [
        ("Stały copy do nakładania w post-produkcji", 'Calibri', 13, True, COLOR_DARK),
    ], space_after=4)
    add_paragraph_with_runs(doc, [
        ("Headline: ", 'Calibri', 10, True, COLOR_GREY_DARK),
        ("'Cały rynek pracy w Twoim zasięgu'", 'Calibri', 10, False, COLOR_DARK),
    ], space_after=2)
    add_paragraph_with_runs(doc, [
        ("Subhead: ", 'Calibri', 10, True, COLOR_GREY_DARK),
        ("'Firma, zlecenie czy etat — wbij pinezkę i bądź widoczny w Polsce i Europie.'", 'Calibri', 10, False, COLOR_DARK),
    ], space_after=2)
    add_paragraph_with_runs(doc, [
        ("CTA: ", 'Calibri', 10, True, COLOR_GREY_DARK),
        ("'Otwórz mapę →' / 'Wbij pinezkę →' / 'Kontynuuj z Google →'", 'Calibri', 10, False, COLOR_DARK),
    ], space_after=2)

    doc.add_page_break()

    # ===== WPISY =====
    current_section = None
    for entry in ENTRIES:
        # Nowa sekcja?
        if entry["sekcja"] != current_section:
            if current_section is not None:
                doc.add_page_break()
            current_section = entry["sekcja"]
            add_paragraph_with_runs(doc, [
                ("SEKCJA", 'Calibri', 9, False, COLOR_GREY_MID),
            ], space_after=2)
            add_paragraph_with_runs(doc, [
                (entry["sekcja"], 'Calibri', 22, True, COLOR_PURPLE),
            ])
            add_horizontal_line(doc)

        # Header wpisu
        add_paragraph_with_runs(doc, [
            (f"{entry['id']}", 'Calibri', 11, True, COLOR_PURPLE),
            ("  •  ", 'Calibri', 11, False, COLOR_GREY_MID),
            (entry["tytul"], 'Calibri', 14, True, COLOR_DARK),
        ], space_after=2)

        # Format
        add_paragraph_with_runs(doc, [
            ("Format: ", 'Calibri', 9, True, COLOR_GREY_MID),
            (entry["format"], 'Calibri', 9, False, COLOR_GREY_DARK),
            ("    Vibe: ", 'Calibri', 9, True, COLOR_GREY_MID),
            (entry["vibe"], 'Calibri', 9, False, COLOR_GREY_DARK),
        ], space_after=8)

        # Co widzimy
        add_paragraph_with_runs(doc, [
            ("Co widzimy na zdjęciu", 'Calibri', 10, True, COLOR_PURPLE),
        ], space_after=2)
        add_paragraph_with_runs(doc, [
            (entry["co_widzimy"], 'Calibri', 10, False, COLOR_DARK),
        ], space_after=8)

        # Use case
        add_paragraph_with_runs(doc, [
            ("Use case / scenariusz", 'Calibri', 10, True, COLOR_PURPLE),
        ], space_after=2)
        add_paragraph_with_runs(doc, [
            (entry["use_case"], 'Calibri', 10, False, COLOR_DARK),
        ], space_after=8)

        # Paleta
        add_paragraph_with_runs(doc, [
            ("Paleta dominująca: ", 'Calibri', 10, True, COLOR_PURPLE),
            (entry["paleta"], 'Calibri', 10, False, COLOR_GREY_DARK),
        ], space_after=8)

        # Prompt EN header
        add_paragraph_with_runs(doc, [
            ("Prompt EN — wklej do Nano Banana", 'Calibri', 10, True, COLOR_PURPLE),
        ], space_after=2)

        # Prompt body w monospace
        prompt_p = doc.add_paragraph()
        prompt_p.paragraph_format.left_indent = Cm(0.3)
        prompt_p.paragraph_format.space_after = Pt(6)
        run = prompt_p.add_run(entry["prompt"])
        run.font.name = 'Consolas'
        run.font.size = Pt(8.5)
        run.font.color.rgb = COLOR_GREY_DARK
        shade_paragraph(prompt_p, "F5F5F7")

        add_horizontal_line(doc)

    # ===== KOŃCÓWKA =====
    doc.add_page_break()
    add_paragraph_with_runs(doc, [
        ("Workflow Nano Banana → Veo", 'Calibri', 22, True, COLOR_PURPLE),
    ])
    add_horizontal_line(doc)

    workflow_steps = [
        ("Krok 1 — Wybierz koncept", "Przeglądaj katalog, wybierz 5-10 najmocniejszych konceptów pod Twoją kampanię. Notuj numery (HI-XX, NN-XX itp.)."),
        ("Krok 2 — Generuj statyczne hero w Nano Banana", "Wklej Prompt EN do Gemini 2.5 Flash Image. Generuj 2-4 wariacje per koncept. Wybierz najlepsze."),
        ("Krok 3 — Tekst w post (Figma / Canva)", "Otwórz wygenerowany obraz w Figmie. Dorzuć layer 'Cały rynek pracy w Twoim zasięgu' + subhead. Inter Bold 72pt headline / 28pt subhead. Cream #F5EBD8 z soft shadow. Pozycja zgodnie z aspectem (top-third dla Reels, upper-right dla feed)."),
        ("Krok 4 — Eksport per placement", "9:16 dla Reels/Stories/TikTok. 4:5 dla Meta feed. 1:1 dla LinkedIn. 16:9 dla YouTube/display. 1200×628 dla Meta link ad."),
        ("Krok 5 — (Opcjonalnie) Veo image-to-video", "Wgrywasz statyczny hero do Veo 3 jako reference + dopisujesz krótki prompt motion (np. 'pin slowly pulses, cluster ticks up, hand stays static, ambient café audio + ding'). Veo zachowuje estetykę zdjęcia i animuje."),
        ("Krok 6 — Eksport wideo + post text", "Veo wygeneruje 6-15s clip BEZ tekstu. Import do CapCut/Premiere. Dodaj animowany tekst overlay zsynchronizowany z audio cue (ding na 5s, headline fade-in 5.5s)."),
    ]

    for title, body in workflow_steps:
        add_paragraph_with_runs(doc, [
            (title, 'Calibri', 12, True, COLOR_DARK),
        ], space_after=4)
        add_paragraph_with_runs(doc, [
            (body, 'Calibri', 10, False, COLOR_GREY_DARK),
        ], space_after=10)

    add_paragraph_with_runs(doc, [("\n", 'Calibri', 10, False, None)])

    add_paragraph_with_runs(doc, [
        ("Pakiet startowy — TOP 5 do pierwszej fali", 'Calibri', 14, True, COLOR_PURPLE),
    ], space_after=4)
    starter_pack = [
        ("HI-22", "Otwórz mapę — najprostszy uniwersalny hero."),
        ("HI-06", "Mapa Polski live — brand statement."),
        ("HI-02", "5 km od domu — najsilniejszy persona+phone fit."),
        ("HI-08", "3 typy pracy — najszybsza segmentacja widzów."),
        ("NN-MASTER", "Poznań Neon-Noir — premium kreatywka kampanii."),
    ]
    for entry_id, desc in starter_pack:
        add_paragraph_with_runs(doc, [
            (f"  {entry_id}  ", 'Calibri', 10, True, COLOR_PURPLE),
            (desc, 'Calibri', 10, False, COLOR_GREY_DARK),
        ], space_after=4)

    add_paragraph_with_runs(doc, [("\n\n", 'Calibri', 10, False, None)])
    add_paragraph_with_runs(doc, [
        ("MapJob © 2026 — Cały rynek pracy w Twoim zasięgu.", 'Calibri', 9, False, COLOR_GREY_MID),
    ], alignment=WD_ALIGN_PARAGRAPH.CENTER)

    # ===== ZAPIS =====
    doc.save(output_path)
    return output_path


if __name__ == "__main__":
    import os
    output = r"C:\Users\48721\Desktop\MAPJOB CLAUDE\MapJob_Katalog_Reklam.docx"
    result = build_document(output)
    size_kb = os.path.getsize(result) / 1024
    print(f"OK — zapisano: {result}")
    print(f"   Liczba wpisów: {len(ENTRIES)}")
    print(f"   Rozmiar pliku: {size_kb:.1f} KB")
