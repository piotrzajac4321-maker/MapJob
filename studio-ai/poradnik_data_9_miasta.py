# -*- coding: utf-8 -*-
# BoboFoto — strony lokalne (miasta), część 3.
# Kolejne miasta pod lokalne wyszukiwania "sesja noworodkowa online <miasto>".

_CITIES = [
    {"miasto": "Gdynia", "slug": "gdynia", "dop": "Gdyni",
     "dzielnice": "Witomina, Obłuża, Karwin czy Chyloni", "studio": "gdyńskim"},
    {"miasto": "Sosnowiec", "slug": "sosnowiec", "dop": "Sosnowca",
     "dzielnice": "Zagórza, Pogoni czy Środuli", "studio": "sosnowieckim"},
    {"miasto": "Gliwice", "slug": "gliwice", "dop": "Gliwic",
     "dzielnice": "Sośnicy, Trynku czy Sikornika", "studio": "gliwickim"},
    {"miasto": "Zabrze", "slug": "zabrze", "dop": "Zabrza",
     "dzielnice": "Helenki, Rokitnicy czy Mikulczyc", "studio": "zabrzańskim"},
    {"miasto": "Tarnów", "slug": "tarnow", "dop": "Tarnowa",
     "dzielnice": "Mościc, Grabówki czy Klikowej", "studio": "tarnowskim"},
    {"miasto": "Płock", "slug": "plock", "dop": "Płocka",
     "dzielnice": "Podolszyc, Skarpy czy Radziwia", "studio": "płockim"},
    {"miasto": "Elbląg", "slug": "elblag", "dop": "Elbląga",
     "dzielnice": "Zawady, Zatorza czy Próchnika", "studio": "elbląskim"},
    {"miasto": "Wałbrzych", "slug": "walbrzych", "dop": "Wałbrzycha",
     "dzielnice": "Piaskowej Góry, Podzamcza czy Białego Kamienia", "studio": "wałbrzyskim"},
    {"miasto": "Koszalin", "slug": "koszalin", "dop": "Koszalina",
     "dzielnice": "Przylesia, Rokosowa czy Wenedów", "studio": "koszalińskim"},
    {"miasto": "Kalisz", "slug": "kalisz", "dop": "Kalisza",
     "dzielnice": "Dobrzeca, Asnyka czy Majkowa", "studio": "kaliskim"},
    {"miasto": "Legnica", "slug": "legnica", "dop": "Legnicy",
     "dzielnice": "Piekar, Kopernika czy Tarninowa", "studio": "legnickim"},
    {"miasto": "Zielona Góra", "slug": "zielona-gora", "dop": "Zielonej Góry",
     "dzielnice": "Jędrzychowa, Zacisza czy Chynowa", "studio": "zielonogórskim"},
    {"miasto": "Gorzów Wielkopolski", "slug": "gorzow-wielkopolski", "dop": "Gorzowa Wielkopolskiego",
     "dzielnice": "Górczyna, Staszica czy Manhattanu", "studio": "gorzowskim"},
    {"miasto": "Słupsk", "slug": "slupsk", "dop": "Słupska",
     "dzielnice": "Zatorza, Niepodległości czy Westerplatte", "studio": "słupskim"},
    {"miasto": "Nowy Sącz", "slug": "nowy-sacz", "dop": "Nowego Sącza",
     "dzielnice": "Millenium, Gorzkowa czy Zawady", "studio": "nowosądeckim"},
    {"miasto": "Siedlce", "slug": "siedlce", "dop": "Siedlec",
     "dzielnice": "Tysiąclecia, Roskoszy czy Nowych Siedlec", "studio": "siedleckim"},
]

ITEMS = []
for c in _CITIES:
    ITEMS.append({
        "cat": "miasta",
        "slug": "sesja-noworodkowa-online-" + c["slug"],
        "title": "Sesja noworodkowa online — " + c["miasto"],
        "desc": "Sesja noworodkowa online dla rodziców z " + c["dop"] +
                ". Bez dojazdu do studia, bez wożenia noworodka — profesjonalne zdjęcia od 9,90 zł, gotowe w ~10 godzin.",
        "card": "Dla rodziców z " + c["dop"] +
                " — bez dojazdu i stresu, profesjonalne zdjęcia noworodka od 9,90 zł.",
        "lead": "Mieszkasz w " + c["dop"] +
                " i nie chcesz wozić kilkudniowego noworodka do studia? Sesja online BoboFoto powstaje u Ciebie w domu — wystarczy jedno zdjęcie z telefonu.",
        "secs": [
            {"h2": "Bez dojazdu przez całe miasto", "ps": [
                "Z " + c["dzielnice"] + " — nie tracisz czasu w korkach z maluszkiem. "
                "Zdjęcie robisz w domu przy oknie, a my zajmujemy się resztą: tłem, retuszem i kolorami."]},
            {"h2": "Jak to działa", "ps": [
                "Wysyłasz jedno zdjęcie z telefonu, wybierasz tło, płacisz online (BLIK lub karta), "
                "a gotowe kadry odbierasz zwykle w ~10 godzin — bez wychodzenia z domu."]},
            {"h2": "Cena", "ps": [
                "Od 9,90 zł (Mini), 29 zł (Standard), 49 zł (Premium) — wyraźnie taniej niż tradycyjna sesja "
                "w " + c["studio"] + " studiu (zwykle 400–600 zł), a bez stresu związanego z dojazdem."]},
            {"h2": "Dla kogo", "ps": [
                "Dla zabieganych rodziców z " + c["dop"] + ", którzy chcą piękną pamiątkę z pierwszych dni "
                "dziecka, ale nie chcą narażać noworodka na wyjście z domu."]},
            {"h2": "Bezpiecznie dla noworodka", "ps": [
                "Maluch przez cały czas jest w domu, w cieple i pod Twoją opieką. "
                "Nie ma kontaktu z obcymi ludźmi ani rekwizytami z studia — to szczególnie ważne w pierwszych tygodniach."]},
        ],
    })
