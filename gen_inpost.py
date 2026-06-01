# -*- coding: utf-8 -*-
# Dane do profilu poglądowego InPost na MapJob.
# Źródło: pracuj.pl/praca?eid=20310170 (profil pracodawcy InPost + Integer Group Services),
# 27 ogłoszeń / 33 lokalizacje, odczytane z __NEXT_DATA__ przez Chrome 2026-05-25.
import json
from collections import Counter

COORDS = {
 "Kraków": (50.0647, 19.9450),
 "Warszawa": (52.2297, 21.0122),
 "Olsztyn": (53.7784, 20.4801),
 "Rzeszów": (50.0413, 21.9990),
 "Toruń": (53.0138, 18.5984),
 "Łomża": (53.1786, 22.0590),
 "Ostrów Mazowiecka": (52.7986, 21.8950),
 "Szczecin": (53.4285, 14.5528),
 "Zielona Góra": (51.9356, 15.5062),
 "Łódź": (51.7592, 19.4560),
 "Ciemne": (52.3450, 21.2430),
}

# (tytuł, firma, loc_display, kategoria, poziom, tryb, umowa, ozaraz, ua, vac, zast, [miasta])
RAW = [
 ("Osoba do montażu urządzeń Paczkomat", "InPost", "Kraków", "fiz", "Pracownik fizyczny", "Praca mobilna", "Umowa o pracę", 1, 1, "", 0, ["Kraków"]),
 ("Osoba do montażu urządzeń Paczkomat", "InPost", "Olsztyn", "fiz", "Pracownik fizyczny", "Praca mobilna", "Umowa o pracę", 1, 1, "", 0, ["Olsztyn"]),
 ("Technik / Techniczka Serwisu", "InPost", "Rzeszów · Toruń", "fiz", "Pracownik fizyczny", "Praca mobilna", "Umowa o pracę", 1, 0, "", 0, ["Rzeszów", "Toruń"]),
 ("Technik / Techniczka Serwisu", "InPost", "Łomża · Ostrów Mazowiecka", "fiz", "Pracownik fizyczny", "Praca mobilna", "Umowa o pracę", 1, 0, "", 0, ["Łomża", "Ostrów Mazowiecka"]),
 ("Trener wewnętrzny / Trenerka wewnętrzna", "InPost", "Kraków", "biuro", "Senior / Ekspert", "Praca hybrydowa", "Umowa o pracę / B2B", 0, 0, "", 0, ["Kraków"]),
 ("Specjalista / Specjalistka ds. sprzedaży SME", "InPost", "Warszawa (Mokotów) · zdalnie", "sprzedaz", "Specjalista / Senior", "Zdalna / hybrydowa", "Umowa o pracę", 1, 0, "Wielu kandydatów", 0, ["Warszawa"]),
 ("Rewards Expert", "InPost", "Kraków · Warszawa · zdalnie", "mkt", "Ekspert", "Praca zdalna", "Umowa o pracę / B2B", 0, 0, "", 0, ["Kraków", "Warszawa"]),
 ("Accounting Specialist (Accounts Payable / Receivable) m/f/n", "InPost", "Kraków (Podgórze) · zdalnie", "fin", "Specjalista / Senior", "Zdalna / hybrydowa", "Umowa o pracę / B2B", 0, 0, "", 0, ["Kraków"]),
 ("Accounting Specialist (General Ledger & Fixed Assets) m/f/n", "InPost", "Kraków · zdalnie", "fin", "Specjalista / Senior", "Zdalna / hybrydowa", "Umowa o pracę / B2B", 0, 0, "", 0, ["Kraków"]),
 ("Pricing Analyst, AI e-Commerce m/f/n", "Integer Group Services", "Warszawa (Mokotów)", "fin", "Specjalista", "Praca hybrydowa", "Umowa o pracę", 1, 0, "", 0, ["Warszawa"]),
 ("Billing System Solution Development Expert m/f/n", "InPost", "Kraków · Warszawa · zdalnie", "fin", "Ekspert", "Zdalna / hybrydowa", "Kontrakt B2B", 0, 0, "", 0, ["Kraków", "Warszawa"]),
 ("Ekspert / Ekspertka ds. Systemów i Rozliczeń z j. włoskim", "Integer Group Services", "Warszawa (Mokotów)", "fin", "Senior / Ekspert", "Praca hybrydowa", "Umowa o pracę / B2B", 1, 0, "", 0, ["Warszawa"]),
 ("Client Success Manager, InPost Pay, e-Commerce m/f/n", "Integer Group Services", "Warszawa (Mokotów)", "sprzedaz", "Senior / Ekspert", "Praca hybrydowa", "Kontrakt B2B", 1, 0, "", 0, ["Warszawa"]),
 ("Specjalista / Specjalistka ds. Obsługi Klientów Biznesowych", "Integer Group Services", "Warszawa (Mokotów)", "sprzedaz", "Junior / Specjalista", "Praca hybrydowa", "Umowa o pracę", 1, 0, "", 0, ["Warszawa"]),
 ("Specjalista / Specjalistka ds. SEO", "Integer Group Services", "Kraków (Podgórze)", "mkt", "Specjalista / Senior", "Praca hybrydowa", "Umowa o pracę / B2B", 1, 0, "", 0, ["Kraków"]),
 ("Kierownik / Kierowniczka Zespołu Operacji", "InPost", "Szczecin", "mgmt", "Kierownik", "Praca stacjonarna", "Umowa o pracę", 1, 0, "", 0, ["Szczecin"]),
 ("Kierownik / Kierowniczka Oddziału InPost", "Integer Group Services", "Zielona Góra", "mgmt", "Kierownik / Menedżer", "Praca stacjonarna", "Umowa o pracę", 0, 0, "", 0, ["Zielona Góra"]),
 ("Kierownik / Kierowniczka Zespołu Administracji", "InPost", "Łódź", "mgmt", "Kierownik", "Praca stacjonarna", "Umowa o pracę", 0, 0, "", 0, ["Łódź"]),
 ("Starszy Specjalista ds. Customer Experience m/f/n", "InPost", "Kraków · Warszawa", "biuro", "Specjalista / Senior", "Praca hybrydowa", "Umowa na zastępstwo", 0, 0, "", 1, ["Kraków", "Warszawa"]),
 ("Starszy Specjalista ds. Customer Experience m/f/n", "InPost", "Kraków · Warszawa", "biuro", "Specjalista / Senior", "Praca hybrydowa", "Umowa o pracę / B2B", 0, 0, "", 0, ["Kraków", "Warszawa"]),
 ("Accounting Specialist (General Ledger & Fixed Assets) with Spanish m/f/n", "InPost", "Kraków (Podgórze)", "fin", "Specjalista / Senior", "Praca hybrydowa", "Umowa o pracę / B2B", 0, 0, "", 0, ["Kraków"]),
 ("Loyalty Program Project Manager", "InPost", "Warszawa (Mokotów)", "mkt", "Senior / Ekspert", "Praca hybrydowa", "Umowa o pracę", 1, 0, "", 0, ["Warszawa"]),
 ("Koordynator / Koordynatorka Zespołu Operacji", "InPost", "Ciemne (k. Wołomina)", "mgmt", "Koordynator", "Praca stacjonarna", "Umowa o pracę", 1, 0, "2 wakaty", 0, ["Ciemne"]),
 ("Kierownik / Kierowniczka ds. Klientów Strategicznych", "InPost", "Warszawa", "sprzedaz", "Senior", "Praca hybrydowa", "Umowa o pracę", 1, 0, "", 0, ["Warszawa"]),
 ("Senior Performance Marketing Specialist m/f/n", "Integer Group Services", "Kraków (Podgórze) · zdalnie", "mkt", "Senior", "Praca zdalna", "Umowa o pracę", 0, 0, "", 0, ["Kraków"]),
 ("Specjalista / Specjalistka ds. Wdrożeń", "Integer Group Services", "Warszawa", "biuro", "Specjalista", "Praca hybrydowa", "Umowa o pracę", 1, 0, "", 0, ["Warszawa"]),
 ("Analityk Finansowy / Analityczka Finansowa", "Integer Group Services", "Kraków (Podgórze) · zdalnie", "fin", "Specjalista", "Zdalna / hybrydowa", "Umowa o pracę", 1, 0, "", 0, ["Kraków"]),
]

offers = []
missing = set()
for t, co, loc, cat, lvl, mode, umw, oz, ua, vac, zast, cities in RAW:
    for c in cities:
        if c not in COORDS:
            missing.add(c)
    offers.append({
        "t": t, "co": co, "loc": loc, "cat": cat, "lvl": lvl, "mode": mode,
        "umw": umw, "oz": bool(oz), "ua": bool(ua), "vac": vac, "zast": bool(zast),
        "cities": cities, "date": "Oferta aktualna",
    })

if missing:
    print("BRAK WSPÓŁRZĘDNYCH:", missing)

# piny grupowane po mieście (oferta wielomiastowa liczy się w każdym mieście)
pin = {}
for o in offers:
    for c in o["cities"]:
        if c not in pin:
            lat, lng = COORDS[c]
            pin[c] = [c, lat, lng, 0]
        pin[c][3] += 1
pins = sorted(pin.values(), key=lambda p: -p[3])

slots = sum(len(o["cities"]) for o in offers)
stats = {"offers": len(offers), "cities": len(pin), "slots": slots}

with open("_inpost_data.js", "w", encoding="utf-8") as f:
    f.write("var OFFERS=%s;\n" % json.dumps(offers, ensure_ascii=False))
    f.write("var PINS=%s;\n" % json.dumps(pins, ensure_ascii=False))
    f.write("var STATS=%s;\n" % json.dumps(stats, ensure_ascii=False))

cc = Counter(o["cat"] for o in offers)
print("offers:", len(offers), "cities:", len(pin), "slots:", slots)
print("by cat:", dict(cc))
print("top miasta:", [(k, v[3]) for k, v in sorted(pin.items(), key=lambda kv: -kv[1][3])])
