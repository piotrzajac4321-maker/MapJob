# -*- coding: utf-8 -*-
import json, math

# City coordinates (approx)
C = {
 "Swiebodzice":(50.858,16.325),"Wroclaw":(51.1079,17.0385),"Kostomloty":(51.013,16.795),
 "Bydgoszcz":(53.1235,18.0084),"Ozimek":(50.673,18.213),"Aleksandrow Lodzki":(51.819,19.305),
 "Lodz":(51.7592,19.4560),"Pabianice":(51.665,19.355),"Biskupice Podgorne":(50.978,16.928),
 "Koszalin":(54.194,16.172),"Szczecin":(53.4285,14.5528),"Gorzow Wielkopolski":(52.7368,15.2288),
 "Zabrze":(50.3249,18.7857),"Katy Wroclawskie":(51.030,16.768),"Olesnica":(51.210,17.380),
 "Walbrzych":(50.7842,16.2845),"Luban":(51.120,15.290),"Niepolomice":(50.039,20.221),
 "Sulecin":(52.444,15.117),"Boleslawiec":(51.264,15.569),"Bielany Wroclawskie":(51.025,17.000),
 "Swidnica":(50.844,16.489),"Dzierzoniow":(50.728,16.652),"Magnice":(51.000,16.965),
 "Glogow":(51.664,16.085),"Swiebodzin":(52.247,15.532),"Miedzyrzecz":(52.446,15.578),
 "Kruszyn":(51.230,15.640),"Jasionka":(50.110,22.020),"Chwaszczyno":(54.434,18.385),
 "Niemcy Koln":(50.938,6.960),"Niemcy":(51.000,10.000),
}
LABEL = {  # display label for pins
 "Niemcy Koln":"Niemcy (okolice Kolonii)","Niemcy":"Niemcy",
}

# title, loc_label, citykey, salary(or None), lvl, cat, date, oz, sup, ua, nodoswiad
O = [
 ("Kontroler / Kontrolerka jakości urządzeń elektrycznych","Świebodzice","Swiebodzice","5 400 – 7 100 zł brutto / mies.","Pracownik fizyczny","prod","24 maja",0,1,0,0),
 ("Pracownik / Pracownica produkcji","Wrocław","Wroclaw","5 980 – 6 200 zł brutto / mies.","Pracownik fizyczny","prod","24 maja",1,1,1,0),
 ("Operator maszyn produkcyjnych (k/m)","Wrocław","Wroclaw",None,"Pracownik fizyczny","prod","24 maja",0,1,0,0),
 ("Automatyk-Elektryk w dziale UR (k/m/n)","Kostomłoty (pow. średzki)","Kostomloty","od 8 000 zł brutto / mies.","Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Monter / Monterka wnętrz","Bydgoszcz","Bydgoszcz","5 500 – 6 200 zł brutto / mies.","Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Customer Service Analyst with English","Cała Polska (zdalna) · Wrocław","Wroclaw",None,"Specjalista","office","23 maja",0,0,0,0),
 ("Specjalista / ka ds. elektryki","Ozimek","Ozimek",None,"Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Młodszy monter / Młodsza monterka","Aleksandrów Łódzki","Aleksandrow Lodzki",None,"Pracownik fizyczny","tech","24 maja",1,1,0,0),
 ("Młodszy monter / Młodsza monterka","Łódź","Lodz",None,"Pracownik fizyczny","tech","24 maja",1,1,0,0),
 ("Pracownik produkcji / Pracownica produkcji","Pabianice","Pabianice",None,"Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Order Management Specialist with Italian (B1+)","Cała Polska (zdalna) · Wrocław","Wroclaw",None,"Specjalista","office","22 maja",0,0,0,0),
 ("Mechanik – utrzymanie ruchu k/m/n","Bydgoszcz","Bydgoszcz",None,"Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Technik Automatyk w dziale Utrzymania Ruchu (k/m)","Biskupice Podgórne (pow. wrocławski)","Biskupice Podgorne",None,"Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Elektryk (k/m)","Koszalin","Koszalin",None,"Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Spawacz / Monter (K/M)","Szczecin","Szczecin",None,"Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Mechanik / Elektromechanik (k/m)","Gorzów Wielkopolski","Gorzow Wielkopolski",None,"Pracownik fizyczny","tech","22 maja",0,1,0,0),
 ("Serwisant / mechanik maszyn k/m","Zabrze","Zabrze",None,"Pracownik fizyczny","tech","22 maja",0,1,0,0),
 ("Operator Produkcji / Operatorka Produkcji","Kąty Wrocławskie","Katy Wroclawskie","5 083 – 7 711 zł brutto / mies.","Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Production Planner","Wrocław","Wroclaw",None,"Specjalista","office","13 maja",0,0,0,0),
 ("Travel & Expense Analyst","Wrocław","Wroclaw",None,"Specjalista","office","13 maja",0,0,0,0),
 ("Operator wózka widłowego bez UDT","Oleśnica","Olesnica","od 34,30 zł brutto / godz.","Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Operator Produkcji / Operatorka Produkcji","Wałbrzych","Walbrzych","5 070 – 5 750 zł brutto / mies.","Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Работник производства / работница производства","Lubań","Luban",None,"Pracownik fizyczny","prod","24 maja",1,1,1,0),
 ("Technik utrzymania ruchu (elektryk / automatyk / mechanik) k/m","Niepołomice","Niepolomice",None,"Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Mechanik / Elektromechanik (k/m)","Sulęcin","Sulecin",None,"Pracownik fizyczny","tech","19 maja",0,1,0,0),
 ("Працівниця / Працівник виробництва","Bolesławiec","Boleslawiec",None,"Pracownik fizyczny","prod","24 maja",1,1,1,0),
 ("Osoba do wsparcia bistra","Bielany Wrocławskie (pow. wrocławski)","Bielany Wroclawskie",None,"Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Operator maszyn (k/m)","Łódź","Lodz",None,"Pracownik fizyczny","prod","24 maja",0,1,0,0),
 ("Pracownik produkcji (k/m)","Pabianice","Pabianice",None,"Pracownik fizyczny","prod","24 maja",0,1,0,0),
 ("Pracownik produkcji / Pracownica produkcji","Bolesławiec","Boleslawiec",None,"Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Pomocnik montera rusztowań przemysłowych","Niemcy (okolice Kolonii)","Niemcy Koln",None,"Pracownik fizyczny","abroad","23 maja",0,1,0,0),
 ("Operator maszyn CNC (k/m) w nowoczesnej firmie","Wałbrzych","Walbrzych","5 000 – 7 300 zł brutto / mies.","Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Operator maszyn CNC (k/m) w nowoczesnej firmie","Świdnica","Swidnica","5 000 – 7 300 zł brutto / mies.","Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Operator maszyn CNC (k/m) w nowoczesnej firmie","Dzierżoniów","Dzierzoniow","5 000 – 7 300 zł brutto / mies.","Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Liderka / Lider Zespołu Magazynowego","Kąty Wrocławskie","Katy Wroclawskie",None,"Starszy specjalista","mgmt","23 maja",0,0,0,0),
 ("Pracownik wspierający k/m/n","Biskupice Podgórne (pow. wrocławski)","Biskupice Podgorne",None,"Pracownik fizyczny","prod","23 maja",1,1,0,0),
 ("Specjalistka / Specjalista ds. Kadr i Płac","Bolesławiec","Boleslawiec",None,"Specjalista","office","23 maja",0,0,0,0),
 ("Pracownik na rusztowaniach","Niemcy","Niemcy",None,"Pracownik fizyczny","abroad","22 maja",1,1,0,1),
 ("Area / Warehouse Supervisor","Magnice (pow. wrocławski)","Magnice",None,"Kierownik","mgmt","22 maja",0,0,0,0),
 ("Kierownik / Kierowniczka ds. księgowości","Głogów","Glogow",None,"Kierownik","mgmt","22 maja",0,0,0,0),
 ("Operator / Operatorka Maszyn","Biskupice Podgórne (pow. wrocławski)","Biskupice Podgorne","6 200 – 7 200 zł brutto / mies.","Pracownik fizyczny","prod","22 maja",1,1,0,0),
 ("Area Manager","Magnice (pow. wrocławski)","Magnice",None,"Menedżer","mgmt","20 maja",0,0,0,0),
 ("Mechanik (k/m)","Świebodzin","Swiebodzin","6 100 – 9 100 zł brutto / mies.","Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Mechanik (k/m)","Gorzów Wielkopolski","Gorzow Wielkopolski","6 100 – 9 100 zł brutto / mies.","Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Mechanik (k/m)","Międzyrzecz","Miedzyrzecz","6 100 – 9 100 zł brutto / mies.","Pracownik fizyczny","tech","23 maja",0,1,0,0),
 ("Pracownik produkcji / Pracownica produkcji","Łódź","Lodz",None,"Pracownik fizyczny","prod","23 maja",1,1,0,0),
 ("Handlowiec z j. angielskim (K/M/X)","Kruszyn (pow. bolesławiecki)","Kruszyn",None,"Specjalista","office","19 maja",0,0,0,0),
 ("Lakiernik (k/m)","Jasionka (pow. rzeszowski)","Jasionka",None,"Pracownik fizyczny","tech","24 maja",0,1,0,0),
 ("Operator procesów produkcyjnych k/m","Jasionka (pow. rzeszowski)","Jasionka",None,"Pracownik fizyczny","prod","24 maja",1,1,0,0),
 ("Automatyk K/M","Chwaszczyno (pow. kartuski)","Chwaszczyno",None,"Specjalista","tech","19 maja",0,0,0,0),
]

seen={}
offers=[]
pin_count={}
for (t,loc,key,sal,lvl,cat,date,oz,sup,ua,nod) in O:
    lat,lng=C[key]
    pin_count[key]=pin_count.get(key,0)+1
    o={"t":t,"loc":loc,"lvl":lvl,"cat":cat,"date":date}
    if sal: o["sal"]=sal
    if oz: o["oz"]=1
    if sup: o["sup"]=1
    if ua: o["ua"]=1
    if nod: o["nodoswiad"]=1
    offers.append(o)

# pins: unique cities
pins=[]
for key,cnt in pin_count.items():
    lat,lng=C[key]
    name=LABEL.get(key, key)
    pins.append([name,round(lat,4),round(lng,4),cnt])
pins.sort(key=lambda p:-p[3])

uniq_pl=len([k for k in pin_count if not k.startswith("Niemcy")])
stats={"offers":len(offers),"cities":uniq_pl,"pins":len(pins)}

with open("_randstad_data.js","w",encoding="utf-8") as f:
    f.write("var OFFERS=%s;\n"%json.dumps(offers,ensure_ascii=False))
    f.write("var PINS=%s;\n"%json.dumps(pins,ensure_ascii=False))
    f.write("var STATS=%s;\n"%json.dumps(stats,ensure_ascii=False))

# counts per filter
from collections import Counter
cc=Counter(o["cat"] for o in offers)
ozc=sum(1 for o in offers if o.get("oz"))
print("offers:",len(offers),"PL cities:",uniq_pl,"pins:",len(pins))
print("by cat:",dict(cc),"| od zaraz:",ozc)
