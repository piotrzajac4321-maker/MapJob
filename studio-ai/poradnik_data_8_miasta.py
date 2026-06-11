# -*- coding: utf-8 -*-
# BoboFoto.pl — strony lokalne (miasta), część 2.
# Każde miasto = osobna podstrona pod lokalne wyszukiwania
# "sesja noworodkowa online <miasto>".

_CITIES = [
    {
        "miasto": "Łódź", "slug": "lodz", "dop": "Łodzi",
        "dzielnice": "Bałut, Widzewa, Górnej czy Polesia",
        "studio": "łódzkim",
    },
    {
        "miasto": "Szczecin", "slug": "szczecin", "dop": "Szczecina",
        "dzielnice": "Prawobrzeża, Pogodna czy Niebuszewa",
        "studio": "szczecińskim",
    },
    {
        "miasto": "Lublin", "slug": "lublin", "dop": "Lublina",
        "dzielnice": "LSM, Czechowa, Kalinowszczyzny czy Węglina",
        "studio": "lubelskim",
    },
    {
        "miasto": "Bydgoszcz", "slug": "bydgoszcz", "dop": "Bydgoszczy",
        "dzielnice": "Fordonu, Szwederowa czy Wyżyn",
        "studio": "bydgoskim",
    },
    {
        "miasto": "Białystok", "slug": "bialystok", "dop": "Białegostoku",
        "dzielnice": "Antoniuka, Wygody czy Białostoczka",
        "studio": "białostockim",
    },
    {
        "miasto": "Toruń", "slug": "torun", "dop": "Torunia",
        "dzielnice": "Rubinkowa, Bydgoskiego Przedmieścia czy Wrzosów",
        "studio": "toruńskim",
    },
    {
        "miasto": "Rzeszów", "slug": "rzeszow", "dop": "Rzeszowa",
        "dzielnice": "Nowego Miasta, Baranówki czy Krakowskiej-Południe",
        "studio": "rzeszowskim",
    },
    {
        "miasto": "Częstochowa", "slug": "czestochowa", "dop": "Częstochowy",
        "dzielnice": "Tysiąclecia, Rakowa czy Północy",
        "studio": "częstochowskim",
    },
    {
        "miasto": "Kielce", "slug": "kielce", "dop": "Kielc",
        "dzielnice": "Ślichowic, Barwinka czy Uroczyska",
        "studio": "kieleckim",
    },
    {
        "miasto": "Olsztyn", "slug": "olsztyn", "dop": "Olsztyna",
        "dzielnice": "Jarot, Nagórek czy Pieczewa",
        "studio": "olsztyńskim",
    },
    {
        "miasto": "Radom", "slug": "radom", "dop": "Radomia",
        "dzielnice": "Ustronia, Borek czy Gołębiowa",
        "studio": "radomskim",
    },
    {
        "miasto": "Opole", "slug": "opole", "dop": "Opola",
        "dzielnice": "Zaodrza, Chabrów czy Malinki",
        "studio": "opolskim",
    },
]

ITEMS = []
for c in _CITIES:
    ITEMS.append({
        "cat": "miasta",
        "slug": "sesja-noworodkowa-online-" + c["slug"],
        "title": "Sesja noworodkowa online — " + c["miasto"],
        "desc": "Sesja noworodkowa online dla rodziców z " + c["dop"] +
                ". Bez dojazdu do studia, bez wożenia noworodka — profesjonalne zdjęcia od 24 zł, gotowe w ~10 godzin.",
        "card": "Dla rodziców z " + c["dop"] +
                " — bez dojazdu i stresu, profesjonalne zdjęcia noworodka od 24 zł.",
        "lead": "Mieszkasz w " + c["dop"] +
                " i nie chcesz wozić kilkudniowego noworodka do studia? Sesja online BoboFoto.pl powstaje u Ciebie w domu — wystarczy jedno zdjęcie z telefonu.",
        "secs": [
            {"h2": "Bez dojazdu przez całe miasto", "ps": [
                "Z " + c["dzielnice"] + " — nie tracisz czasu w korkach z maluszkiem. "
                "Zdjęcie robisz w domu przy oknie, a my zajmujemy się resztą: tłem, retuszem i kolorami."]},
            {"h2": "Jak to działa", "ps": [
                "Wysyłasz jedno zdjęcie z telefonu, wybierasz tło, płacisz online (BLIK lub karta), "
                "a gotowe kadry odbierasz zwykle w ~10 godzin — bez wychodzenia z domu."]},
            {"h2": "Cena", "ps": [
                "Od 24 zł (Mini), 49 zł (Standard), 99 zł (Premium) — wyraźnie taniej niż tradycyjna sesja "
                "w " + c["studio"] + " studiu (zwykle 400–600 zł), a bez stresu związanego z dojazdem."]},
            {"h2": "Dla kogo", "ps": [
                "Dla zabieganych rodziców z " + c["dop"] + ", którzy chcą piękną pamiątkę z pierwszych dni "
                "dziecka, ale nie chcą narażać noworodka na wyjście z domu."]},
            {"h2": "Bezpiecznie dla noworodka", "ps": [
                "Maluch przez cały czas jest w domu, w cieple i pod Twoją opieką. "
                "Nie ma kontaktu z obcymi ludźmi ani rekwizytami z studia — to szczególnie ważne w pierwszych tygodniach."]},
        ],
    })
