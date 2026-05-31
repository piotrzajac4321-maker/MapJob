# -*- coding: utf-8 -*-
import json, re
from collections import Counter

MONTHS = ["", "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
          "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]

def fmt_date(iso):
    y, m, d = iso.split("-")
    return "%d %s %s" % (int(d), MONTHS[int(m)], y)

# Bad / missing coordinates from the OTTO API -> corrected (city: lat,lng)
COORD_FIX = {
    "Moszna-Wieś":   (52.20, 17.20),
    "Moszna Parcela":(52.20, 17.20),
    "Tuchom":        (54.37, 18.33),
    "Krępice":       (51.13, 16.85),
}

def cat_of(title):
    t = title.lower()
    if "wózka widłowego" in t or "wózek" in t:
        return "operator"
    if any(k in t for k in ["produkcj", "monter", "operator maszyn", "operator linii",
                            "linii produkcyjnej", "autoklaw", "obróbka", "odlewnicz",
                            "suwnic", "spawac"]):
        return "produkcja"
    return "magazyn"

# ---- original 17 (z widełkami / odznakami), city = klucz pinu ----
# t, loc(display), city, lat, lng, sal, cat, dateISO, sup, cv, ua, udt
ORIG = [
 ("Praca na magazynie owoców i warzyw","Ożarów Mazowiecki","Ożarów Mazowiecki",52.21,20.81,"5 500–8 000 zł brutto / mies.","magazyn","2026-05-25",1,1,0,0),
 ("Proste zlecenie na magazynie","Sochaczew","Sochaczew",52.23,20.24,None,"magazyn","2026-05-23",1,1,0,0),
 ("Praca na magazynie z uprawnieniami UDT","Sękocin Stary (pow. pruszkowski)","Sękocin Stary",52.10,20.86,None,"magazyn","2026-05-22",1,1,0,1),
 ("Робота на складі | Praca na magazynie","Radomsko","Radomsko",51.07,19.45,None,"magazyn","2026-05-24",1,1,1,0),
 ("Osoba do realizacji zleceń magazynowych","Gdańsk","Gdańsk",54.35,18.65,"35–38 zł brutto / godz.","magazyn","2026-05-24",1,1,0,0),
 ("Operator/ka wózka widłowego","Kraków","Kraków",50.06,19.94,"5 300–5 500 zł brutto / mies.","operator","2026-05-24",1,1,0,0),
 ("Operator/ka wózka widłowego z UDT","Łódź","Łódź",51.76,19.46,None,"operator","2026-05-24",1,1,0,1),
 ("Praca przy kompletacji zamówień","Gliwice","Gliwice",50.29,18.67,None,"magazyn","2026-05-23",1,1,0,0),
 ("Magazynier/ka z uprawnieniami UDT","Namysłów","Namysłów",51.07,17.72,"5 500–7 500 zł brutto / mies.","magazyn","2026-05-23",1,1,0,1),
 ("Stabilna praca na magazynie","Rawa Mazowiecka","Rawa Mazowiecka",51.77,20.25,None,"magazyn","2026-05-22",1,1,0,0),
 ("Osoba do pracy w magazynie | Odzież","Venlo / Roosendaal, Holandia","Venlo",51.37,6.17,"12 000–17 000 zł brutto / mies.","magazyn","2026-05-24",1,1,0,0),
 ("Pracownik magazynu | Produkty świeże i mrożone","Dordrecht, Holandia","Dordrecht",51.81,4.69,"12 000–17 000 zł brutto / mies.","magazyn","2026-05-24",1,1,0,0),
 ("Operator suwnicy | Dostawca stali","Nieuwegein, Holandia","Nieuwegein",52.03,5.08,"12 000–15 000 zł brutto / mies.","operator","2026-05-24",1,1,0,0),
 ("Praca na produkcji w czekoladowym raju","Holandia","Holandia",52.13,5.29,None,"produkcja","2026-05-23",1,1,0,0),
]

offers = []
seen = set()

def add(t, loc, city, lat, lng, sal, cat, iso, sup, cv, ua, udt):
    key = (re.sub(r"\s+", " ", t).strip().lower(), city.strip().lower())
    if key in seen:
        return
    seen.add(key)
    o = {"t": t, "loc": loc, "city": city, "lat": round(lat, 4), "lng": round(lng, 4),
         "lvl": "Praca stacjonarna", "cat": cat, "date": fmt_date(iso)}
    if sal: o["sal"] = sal
    if sup: o["sup"] = 1
    if cv: o["cv"] = 1
    if ua: o["ua"] = 1
    if udt: o["udt"] = 1
    offers.append(o)

for row in ORIG:
    add(*row)

# ---- 88 z OTTO API ----
for line in open("_otto_pl_raw.txt", encoding="utf-8"):
    line = line.rstrip("\n")
    if not line.strip():
        continue
    t, city, lat, lng, catraw, iso, promo, ua, udt = line.split("§")
    lat, lng = float(lat), float(lng)
    if city in COORD_FIX:
        lat, lng = COORD_FIX[city]
    add(t, city, city, lat, lng, None, cat_of(t), iso,
        int(promo), 1, int(ua), int(udt))

# ---- pins grouped by city ----
pin = {}
for o in offers:
    c = o["city"]
    if c not in pin:
        pin[c] = [c, o["lat"], o["lng"], 0]
    pin[c][3] += 1
pins = sorted(pin.values(), key=lambda p: -p[3])

stats = {"offers": len(offers), "cities": len(pin), "pins": len(pins)}

with open("_otto_data.js", "w", encoding="utf-8") as f:
    f.write("var OFFERS=%s;\n" % json.dumps(offers, ensure_ascii=False))
    f.write("var PINS=%s;\n" % json.dumps(pins, ensure_ascii=False))
    f.write("var STATS=%s;\n" % json.dumps(stats, ensure_ascii=False))

cc = Counter(o["cat"] for o in offers)
print("offers:", len(offers), "cities:", len(pin))
print("by cat:", dict(cc),
      "| udt:", sum(1 for o in offers if o.get("udt")),
      "| sup:", sum(1 for o in offers if o.get("sup")),
      "| abroad:", sum(1 for o in offers if "Holandia" in o["loc"]),
      "| z widełkami:", sum(1 for o in offers if o.get("sal")))
