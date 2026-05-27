# -*- coding: utf-8 -*-
# Dane do profilu poglądowego Żabki na MapJob.
# Źródło: praca.zabka.pl (124 unikalne oferty, 14 stron, odczytane przez Chrome 2026-05-25).
import json, re
from collections import Counter

# Współrzędne miast (lat, lng) — wszystkie lokalizacje z ofert.
COORDS = {
 "WARSZAWA": (52.2297, 21.0122), "WROCŁAW": (51.1079, 17.0385),
 "KRAKÓW": (50.0647, 19.9450), "POZNAŃ": (52.4064, 16.9252),
 "GDAŃSK": (54.3520, 18.6466), "GDYNIA": (54.5189, 18.5305),
 "ŁÓDŹ": (51.7592, 19.4560), "SOSNOWIEC": (50.2862, 19.1040),
 "KATOWICE": (50.2649, 19.0238), "CZĘSTOCHOWA": (50.8118, 19.1203),
 "ZABRZE": (50.3249, 18.7857), "BĘDZIN": (50.3260, 19.1280),
 "ŁAZISKA GÓRNE": (50.1530, 18.8460), "BIELAWA": (50.6905, 16.6203),
 "DOPIEWIEC": (52.3760, 16.7510), "TARNOWO PODGÓRNE": (52.4640, 16.7330),
 "ROKIETNICA": (52.5360, 16.7860), "CZEMPIŃ": (52.1540, 16.7660),
 "KALISZ": (51.7611, 18.0910), "PABIANICE": (51.6645, 19.3546),
 "DZIAŁDOWO": (53.2370, 20.1790), "OLSZTYN": (53.7784, 20.4801),
 "OSTROŁĘKA": (53.0860, 21.5660), "RADZYMIN": (52.4150, 21.1930),
 "PIASECZNO": (52.0810, 21.0230), "PRUSZKÓW": (52.1700, 20.8120),
 "BRWINÓW": (52.1430, 20.7180), "MAGDALENKA": (52.0760, 20.9320),
 "PRUSZCZ GDAŃSKI": (54.2620, 18.6360), "ŻUKOWO": (54.3430, 18.3640),
 "DZIERŻĄŻNO": (54.3500, 18.2900), "PSZCZÓŁKI": (54.1660, 18.6940),
 "SOPOT": (54.4418, 18.5601), "SŁUPSK": (54.4641, 17.0287),
 "MALBORK": (54.0360, 19.0260), "BOLSZEWO": (54.6020, 18.1860),
 "KOŁOBRZEG": (54.1758, 15.5830), "MRZEŻYNO": (54.1430, 15.2880),
 "GRYFINO": (53.2540, 14.4890), "KIELCE": (50.8661, 20.6286),
 "OSTROWIEC ŚWIĘTOKRZYSKI": (50.9290, 21.3850), "SANDOMIERZ": (50.6820, 21.7490),
 "PIŃCZÓW": (50.5200, 20.5230), "ŚWIDNIK": (51.2197, 22.6960),
 "KIEŁCZÓW": (51.1290, 17.1730),
}

# Surowe oferty: kod¦MIASTO¦ulica¦etat  (S=Sprzedawca, D=Dokładanie towaru; F=Pełen etat, C=Część etatu)
RAW = """
S¦POZNAŃ¦Forteczna 12/14¦F
S¦BIELAWA¦Słowiańska 19¦C
S¦DOPIEWIEC¦Szkolna 13¦F
S¦WARSZAWA¦Jana Kazimierza 66¦F
S¦ŁAZISKA GÓRNE¦Św. Barbary 4¦C
S¦WROCŁAW¦Przedmieście Oławskie 99¦F
S¦GDAŃSK¦Kiedrowskiego 6¦F
S¦WARSZAWA¦Wilcza 27¦F
S¦DZIAŁDOWO¦Chopina 1¦C
S¦WROCŁAW¦Cynamonowa 13¦F
S¦WARSZAWA¦Teodora Toeplitza 2¦F
S¦WROCŁAW¦Miedziana 12¦F
S¦KRAKÓW¦Wrocławska 48¦F
S¦KRAKÓW¦Grzegórzecka 12/1¦C
S¦WROCŁAW¦Wyszyńskiego 118¦F
S¦WROCŁAW¦Odkrywców 1-3¦F
S¦WROCŁAW¦Stalowa 80¦F
S¦WROCŁAW¦Uczniowska 1¦F
S¦SOSNOWIEC¦Warszawska 10¦F
S¦WARSZAWA¦Garibaldiego 4¦F
S¦PABIANICE¦Wileńska 45a¦C
S¦KRAKÓW¦Grzegórzecka 12/1¦F
S¦PRUSZCZ GDAŃSKI¦Kasprowicza 52¦F
S¦WARSZAWA¦Puławska 22¦F
S¦WROCŁAW¦Ślężna 128A¦C
S¦WARSZAWA¦Rydygiera 13¦F
S¦ŁÓDŹ¦Łanowa 14a¦F
S¦WARSZAWA¦Zgoda 13¦C
S¦WARSZAWA¦Zgoda 13¦F
S¦WARSZAWA¦Wolska 64a¦C
S¦WARSZAWA¦Wolska 64a¦F
S¦ŻUKOWO¦Jabłoniowa 7¦F
S¦DZIERŻĄŻNO¦Kartyska 2¦F
S¦POZNAŃ¦Opolska 94¦F
S¦KRAKÓW¦Krowoderska 23¦C
S¦WARSZAWA¦Chrościckiego 25¦F
S¦MAGDALENKA¦Lipowa 57¦F
D¦WARSZAWA¦Smulikowskiego 4c¦C
S¦WROCŁAW¦Plac Powstańców Śląskich 1¦F
S¦WARSZAWA¦Wita Stwosza 48¦F
S¦WROCŁAW¦Jedności Narodowej 146C¦C
S¦KRAKÓW¦Centrum C 6¦F
S¦PRUSZKÓW¦Pęcicka 13¦F
D¦WARSZAWA¦Begonii 5¦F
D¦WARSZAWA¦Begonii 5¦C
S¦WARSZAWA¦Begonii 5¦C
S¦WARSZAWA¦Begonii 5¦F
S¦WROCŁAW¦Plac Grunwaldzki 23-27¦F
S¦KRAKÓW¦Solskiego 11¦F
S¦OSTROWIEC ŚWIĘTOKRZYSKI¦Ogrody 7¦C
S¦GDYNIA¦Chylońska 26¦F
S¦WROCŁAW¦Partynicka 14¦C
S¦GDYNIA¦Ignacego Krasickiego 45¦F
S¦CZĘSTOCHOWA¦Focha 43/45¦C
S¦CZĘSTOCHOWA¦Wielkoborska 196¦C
S¦WARSZAWA¦Obozowa 57¦F
S¦ŚWIDNIK¦Świdnik Duży Pierwszy 9a¦F
S¦POZNAŃ¦Sianowska 98¦F
S¦WARSZAWA¦Polna 48¦F
S¦SANDOMIERZ¦Rynek 16/17¦F
D¦WROCŁAW¦Partyzantów 35¦C
S¦ŁÓDŹ¦Więckowskiego 10¦C
S¦MALBORK¦Matejki 9-10¦C
S¦KRAKÓW¦Świętego Tomasza 29¦F
S¦BĘDZIN¦Barlickiego 26¦F
S¦TARNOWO PODGÓRNE¦Poznańska 100B¦C
S¦KATOWICE¦Korczaka 41A¦F
S¦KOŁOBRZEG¦Mazowiecka 4B¦F
S¦GDYNIA¦Paderewskiego 46¦C
S¦KIELCE¦Herby 1¦F
S¦CZEMPIŃ¦Rynek 5¦C
D¦GRYFINO¦11 Listopada 66/68¦F
S¦OLSZTYN¦Wilgi 2A¦F
S¦GDAŃSK¦Starowiejska 65C¦C
S¦GDAŃSK¦Letnicka 1G¦C
S¦SŁUPSK¦Wiejska 26¦F
S¦SOPOT¦Kościuszki 5¦F
S¦WARSZAWA¦Emilii Plater 47¦F
S¦SOSNOWIEC¦Grota-Roweckiego 136¦F
S¦ZABRZE¦Jordana 50¦C
S¦ZABRZE¦Jordana 50¦F
D¦GDYNIA¦Legionów 69¦F
D¦GDYNIA¦Łużycka 8A¦F
S¦KALISZ¦Lipowa 15/2¦F
S¦WROCŁAW¦Krzysztofa Komedy 9a¦F
S¦WARSZAWA¦Kąty Grodziskie 19¦F
S¦KRAKÓW¦Armii Krajowej 97¦F
S¦WARSZAWA¦Cybernetyki 17¦C
S¦WARSZAWA¦Boremlowska 48¦F
S¦WARSZAWA¦Grochowska 56¦F
S¦WARSZAWA¦Puławska 116¦C
S¦WARSZAWA¦Gocławska 9B¦F
S¦WARSZAWA¦Łopuszańska 55¦C
S¦PABIANICE¦Wileńska 45A¦C
S¦GDAŃSK¦Śląska 39A¦C
S¦KIEŁCZÓW¦Wrocławska 35¦C
S¦GDAŃSK¦Kaprów 3¦C
S¦WARSZAWA¦Romera 4b¦F
S¦WARSZAWA¦Meander 1¦F
S¦MRZEŻYNO¦Tysiąclecia 60¦F
S¦WARSZAWA¦Tunelowa 6¦C
S¦RADZYMIN¦Juliusza Słowackiego 40¦F
S¦WARSZAWA¦Ogrodowa 31¦F
S¦WARSZAWA¦Goławicka 1A¦F
S¦GDYNIA¦Legionów 92¦F
S¦WROCŁAW¦Poprzeczna 49¦F
S¦PSZCZÓŁKI¦Srebrna 2¦F
S¦WARSZAWA¦Edwarda Habicha 21¦F
S¦WARSZAWA¦Grójecka 72¦C
S¦WARSZAWA¦Generała Zajączka 25¦F
S¦BRWINÓW¦Aladyna 2¦F
S¦OSTROŁĘKA¦Starosty Kosa 4¦F
S¦PIŃCZÓW¦Nowowiejska 41¦C
S¦ROKIETNICA¦Diamentowa 2¦F
S¦BOLSZEWO¦Skoneczna 21¦F
S¦WROCŁAW¦Rodakowskiego 4¦F
D¦WROCŁAW¦Rodakowskiego 4¦C
S¦SOSNOWIEC¦Kępa 1¦F
S¦SOSNOWIEC¦Dobrzańskiego 120¦C
S¦GDAŃSK¦Juliusza Słowackiego 2a¦F
S¦WARSZAWA¦Jana Kazimierza 53a¦F
S¦PIASECZNO¦1 Maja 17/1¦F
"""

POS = {"S": ("Sprzedawca", "sprzedawca"), "D": ("Dokładanie towaru", "towar")}
ETAT = {"F": "Pełny etat", "C": "Część etatu"}

def titlecase_city(c):
    small = {"GÓRNE": "Górne", "GDAŃSKI": "Gdański", "PODGÓRNE": "Podgórne",
             "ŚWIĘTOKRZYSKI": "Świętokrzyski"}
    return " ".join(small.get(w, w.capitalize()) for w in c.split())

offers = []
seen = set()
missing = set()
for line in RAW.strip().splitlines():
    code, city, street, etat = line.split("¦")
    if city not in COORDS:
        missing.add(city); continue
    key = (code, city, re.sub(r"\s+", " ", street).strip().lower(), etat)
    if key in seen:
        continue
    seen.add(key)
    name, cat = POS[code]
    lat, lng = COORDS[city]
    o = {
        "t": name,
        "loc": "%s · ul. %s" % (titlecase_city(city), street),
        "city": titlecase_city(city),
        "lat": lat, "lng": lng,
        "lvl": ETAT[etat],
        "cat": cat,
        "etat": "full" if etat == "F" else "part",
        "date": "Oferta aktualna",
    }
    offers.append(o)

if missing:
    print("BRAK WSPÓŁRZĘDNYCH:", missing)

# piny grupowane po mieście
pin = {}
for o in offers:
    c = o["city"]
    if c not in pin:
        pin[c] = [c, o["lat"], o["lng"], 0]
    pin[c][3] += 1
pins = sorted(pin.values(), key=lambda p: -p[3])

stats = {"offers": len(offers), "cities": len(pin), "pins": len(pins)}

with open("_zabka_data.js", "w", encoding="utf-8") as f:
    f.write("var OFFERS=%s;\n" % json.dumps(offers, ensure_ascii=False))
    f.write("var PINS=%s;\n" % json.dumps(pins, ensure_ascii=False))
    f.write("var STATS=%s;\n" % json.dumps(stats, ensure_ascii=False))

cc = Counter(o["cat"] for o in offers)
print("offers:", len(offers), "cities:", len(pin))
print("by cat:", dict(cc),
      "| full:", sum(1 for o in offers if o["etat"] == "full"),
      "| part:", sum(1 for o in offers if o["etat"] == "part"))
print("top miasta:", sorted(pin.items(), key=lambda kv: -kv[1][3])[:6] and
      [(k, v[3]) for k, v in sorted(pin.items(), key=lambda kv: -kv[1][3])[:6]])
