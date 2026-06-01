# -*- coding: utf-8 -*-
import json
from collections import Counter

# City coordinates (approx)
C = {
 "Scinawka Srednia": (50.5847, 16.5469),
 "Sosnowiec": (50.2863, 19.1041),
}
LABEL = {
 "Scinawka Srednia": "Ścinawka Średnia",
 "Sosnowiec": "Sosnowiec",
}

# title, loc_label, citykey, salary(or None), lvl, cat, date, oz, sup, hyb, uop
O = [
 ("Specjalista / Specjalistka ds. Sprzedaży","Ścinawka Średnia (pow. kłodzki)","Scinawka Srednia","5 500 – 7 000 zł brutto / mies.","Specjalista","sales","24 maja",1,1,0,1),
 ("Specjalista ds. Ciągłego Doskonalenia (m/k/n)","Ścinawka Średnia (pow. kłodzki)","Scinawka Srednia","7 000 – 8 500 zł brutto / mies.","Specjalista","prod","20 maja",0,1,0,1),
 ("Specjalista / Specjalistka ds. Rekrutacji i Szkoleń","Ścinawka Średnia (pow. kłodzki)","Scinawka Srednia","6 000 – 8 000 zł brutto / mies.","Specjalista","hr","20 maja",1,0,0,1),
 ("Kierownik ds. Sprzedaży eksportowej (m/k/x)","Ścinawka Średnia (pow. kłodzki)","Scinawka Srednia",None,"Kierownik","sales","12 maja",0,0,1,1),
 ("Specjalista ds. Ofertowania (K/M)","Sosnowiec","Sosnowiec","6 500 – 8 000 zł brutto / mies.","Specjalista","sales","20 maja",1,1,1,1),
]

offers = []
pin_count = {}
for (t, loc, key, sal, lvl, cat, date, oz, sup, hyb, uop) in O:
    pin_count[key] = pin_count.get(key, 0) + 1
    o = {"t": t, "loc": loc, "lvl": lvl, "cat": cat, "date": date}
    if sal: o["sal"] = sal
    if oz: o["oz"] = 1
    if sup: o["sup"] = 1
    if hyb: o["hyb"] = 1
    if uop: o["uop"] = 1
    offers.append(o)

pins = []
for key, cnt in pin_count.items():
    lat, lng = C[key]
    pins.append([LABEL.get(key, key), round(lat, 4), round(lng, 4), cnt])
pins.sort(key=lambda p: -p[3])

stats = {"offers": len(offers), "cities": len(pin_count), "pins": len(pins)}

with open("_zetkama_data.js", "w", encoding="utf-8") as f:
    f.write("var OFFERS=%s;\n" % json.dumps(offers, ensure_ascii=False))
    f.write("var PINS=%s;\n" % json.dumps(pins, ensure_ascii=False))
    f.write("var STATS=%s;\n" % json.dumps(stats, ensure_ascii=False))

cc = Counter(o["cat"] for o in offers)
print("offers:", len(offers), "cities:", len(pin_count), "pins:", len(pins))
print("by cat:", dict(cc), "| od zaraz:", sum(1 for o in offers if o.get("oz")))
