# -*- coding: utf-8 -*-
"""
MapJob MEGA CRM - multi-city (10 miast), email + telefon, target 500-1000 firm.

Build:
    python _build_mega_crm_xlsx.py

Output:
    MapJob-MEGA-Lista-Firm-500plus.xlsx (in same folder)
"""
from urllib.parse import quote_plus

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

OUT = r"C:\Users\48721\Desktop\MAPJOB CLAUDE\reklama\MapJob-MEGA-Lista-Firm-500plus.xlsx"
FONT_NAME = "Arial"

HEADER_BG = "1F4E5C"
SUB_BG = "2E7D8A"
ACCENT_GOLD = "F4B400"
ACCENT_GREEN = "34A853"
ROW_ALT = "F5F7FA"
GREEN_SOFT = "D4EDDA"
YELLOW_SOFT = "FFF3CD"
RED_SOFT = "F8D7DA"
GREY_SOFT = "E0E0E0"
BORDER_GREY = "BDBDBD"
BLUE_SOFT = "D1E7FD"

thin = Side(border_style="thin", color=BORDER_GREY)
box = Border(left=thin, right=thin, top=thin, bottom=thin)


def f(cell, size=11, bold=False, color="000000", italic=False, strike=False):
    cell.font = Font(name=FONT_NAME, size=size, bold=bold, color=color,
                     italic=italic, strike=strike)


def bg(cell, color):
    cell.fill = PatternFill("solid", start_color=color, end_color=color)


def a(cell, horizontal="left", wrap=True):
    cell.alignment = Alignment(horizontal=horizontal, vertical="center", wrap_text=wrap)


def head(cell, color=HEADER_BG):
    bg(cell, color)
    f(cell, size=12, bold=True, color="FFFFFF")
    a(cell, horizontal="center")
    cell.border = box


def section(cell):
    bg(cell, SUB_BG)
    f(cell, size=13, bold=True, color="FFFFFF")
    a(cell, horizontal="left")


wb = Workbook()
wb.remove(wb.active)

# ============= ARKUSZ 1: START TUTAJ =============
ws = wb.create_sheet("Start tutaj")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 115

ws["B2"] = "MapJob - MEGA Baza Firm (10 miast, target 500-1000)"
f(ws["B2"], size=22, bold=True, color=HEADER_BG)

ws["B3"] = "Baza do cold outreachu B2B - telefon + email. 10-dniowy plan dojscia do 500 firm."
f(ws["B3"], size=11, italic=True, color="555555")

ws["B5"] = "UWAGA - legalnosc mass emailu (przeczytaj ZANIM wyslesz pierwszy mail)"
section(ws["B5"])

ws.row_dimensions[6].height = 160
ws["B6"] = (
    "1. Do ADRESOW OGOLNYCH firm (biuro@, kontakt@, sekretariat@) publicznie opublikowanych "
    "na stronie firmy - spersonalizowany cold email B2B jest w praktyce tolerowany w Polsce "
    "(art. 10 UoSUDE formalnie wymaga zgody, ale UOKiK scigal tylko masowe, zautomatyzowane spamy).\n\n"
    "2. Do ADRESOW IMIENNYCH (jan.kowalski@firma.pl) - to sa dane osobowe, pelny RODO + UoSUDE. "
    "Tylko przy uzasadnionym interesie + opt-out + transparentnosci.\n\n"
    "3. ZAKAZANE: kupowanie gotowych baz danych (nielegalne + szybka blokada deliverability), "
    "scraping LinkedIn (naruszenie ToS), wysylka powyzej 50 maili/dzien z jednej domeny bez warm-upu.\n\n"
    "4. BEZPIECZNIK: wysylaj z SUBDOMENY (outreach@kontakt.mapjob.pl), nie z glownej (mapjob.pl). "
    "Jesli cold outreach zepsuje sender reputation, reset hasla na mapjob.pl pojdzie do spamu."
)
f(ws["B6"], size=10)
a(ws["B6"])
bg(ws["B6"], YELLOW_SOFT)

ws["B8"] = "10-dniowy plan dojscia do 500 firm"
section(ws["B8"])

plan_10_dni = [
    ("Dzien 1-2 (sobota/niedziela): 150 firm z Google Maps",
     "Arkusz [10 miast Google Maps] - 240 gotowych klikalnych zapytan. Kopiujesz dane z map do [Lista firm]. "
     "Cel per dzien: 75 firm. 15 min per 10 firm."),
    ("Dzien 3-4: 200 firm z CEIDG (bulk export)",
     "Arkusz [Mega-zrodla] - sekcja CEIDG. Filtrujesz po PKD (68.32.Z, 41.20.Z, 68.31.Z, 43.99.Z) "
     "+ miasto = CSV export 500 firm w 15 min. Wrzucasz do [Lista firm], otagowujesz."),
    ("Dzien 5: 100 firm z Panorama Firm + KRS",
     "Arkusz [Mega-zrodla] - sekcja KRS/Panorama. Bierzesz spolki (Sp. z o.o.) - wiekszy budzet niz JDG."),
    ("Dzien 6-7: Enrichment emaili via Hunter.io",
     "Masz 450 firm z domena www. Hunter.io Free = 25 emaili/mies. Pro 49$/mies = 500 emaili. "
     "Wyciagasz biuro@/kontakt@ + pattern emaili. Wolne emaile = tag 'telefon only' w statusie."),
    ("Dzien 8: Deduplikacja + czyszczenie",
     "Usuwasz duplikaty (formula), sprawdzasz Mailtester.com czy domeny zyja, tagujesz segmenty."),
    ("Dzien 9: Setup Woodpeckera / Instantly",
     "Arkusz [Email - Woodpecker] - 3 szablony per segment. Wgrywasz CSV, mapujesz kolumny, "
     "ustawiasz drip (3-4 emaile per firma w ciagu 14 dni)."),
    ("Dzien 10: Warm-up subdomeny + pierwsza fala",
     "NIE odpalasz 500 maili dzien 1 - Gmail wrzuci w spam. Wysylka: 20/dzien przez 7 dni -> 50/dzien -> 100/dzien. "
     "Po 3 tygodniach jestes przy 500 firm/tydzien z jednej subdomeny."),
]

row = 9
for title, body in plan_10_dni:
    ws.row_dimensions[row].height = 22
    ws[f"B{row}"] = title
    f(ws[f"B{row}"], size=12, bold=True, color=HEADER_BG)
    row += 1
    ws.row_dimensions[row].height = 55
    ws[f"B{row}"] = body
    f(ws[f"B{row}"], size=11)
    a(ws[f"B{row}"])
    bg(ws[f"B{row}"], ROW_ALT)
    row += 1

row += 1
ws[f"B{row}"] = "Realistyczne cele"
section(ws[f"B{row}"])
row += 1
goals = [
    "500-1000 firm w bazie po 10 dniach pracy (8h/dzien) - TYLKO legalne zrodla",
    "Z czego ~70% ma email biuro@/kontakt@ znaleziony publicznie lub via Hunter.io",
    "Z czego ~30% ma juz zweryfikowany telefon i mozna dzwonic rownolegle",
    "Email campaign 4 maile/firma w 14 dni = 2000-4000 wyslanych maili lacznie",
    "Realny reply rate cold B2B dla MapJob: 2-5% = 10-25 firm odpowie",
    "Z 25 odpowiedzi: 5-10 zarejestruje sie na MapJob. Koszt narzedzi: ~200 zl/mies.",
]
for g in goals:
    ws[f"B{row}"] = "  -  " + g
    f(ws[f"B{row}"], size=11)
    row += 1

row += 1
ws[f"B{row}"] = "Moja rekomendacja szczera"
section(ws[f"B{row}"])
row += 1
ws.row_dimensions[row].height = 90
ws[f"B{row}"] = (
    "Cold email B2B dla MapJob w Polsce ma reply rate 2-5%. Cold call ma 20-30% dotrze do decydenta, "
    "z czego 15-30% sie rejestruje = efektywnie 5-10x lepsza konwersja niz email.\n\n"
    "Ale email SKALUJE sie duzo taniej - 1 osoba moze obslugiwac 500 firm/tydz mailem, tylko 100 telefonem.\n\n"
    "Polecam HYBRYDE: email #1 poniedzialek rano -> telefon sroda po sledzeniu czy email otwarty "
    "(Woodpecker pokazuje) -> email #2 piatek podsumowanie. To ma najwyzszy ROI w B2B PL."
)
f(ws[f"B{row}"], size=11)
a(ws[f"B{row}"])
bg(ws[f"B{row}"], BLUE_SOFT)


# ============= ARKUSZ 2: LISTA FIRM =============
ws = wb.create_sheet("Lista firm")

headers = [
    ("Lp", 5),
    ("Data dodania", 12),
    ("Nazwa firmy", 30),
    ("Miasto", 13),
    ("Segment", 14),
    ("Priorytet", 13),
    ("Telefon", 14),
    ("Email", 26),
    ("Typ emaila", 14),
    ("Strona www", 26),
    ("Adres", 28),
    ("Osoba kontaktowa", 20),
    ("Stanowisko", 18),
    ("Opinie Google", 10),
    ("Gwiazdki", 9),
    ("Zrodlo", 14),
    ("Status telefon", 20),
    ("Status email", 20),
    ("Data ostatniego kontaktu", 13),
    ("Data follow-up", 13),
    ("Notatki z researchu (90 sek)", 38),
    ("Notatki z rozmowy/maila", 38),
    ("Woodpecker - token 1 (hook)", 30),
    ("Woodpecker - token 2 (ich problem)", 30),
]

ws.row_dimensions[1].height = 42

for idx, (title, width) in enumerate(headers, start=1):
    col_letter = get_column_letter(idx)
    ws.column_dimensions[col_letter].width = width
    cell = ws.cell(row=1, column=idx, value=title)
    head(cell)

ws.freeze_panes = "D2"
ws.auto_filter.ref = "A1:" + get_column_letter(len(headers)) + "1"

N_ROWS = 1000
for r in range(2, 2 + N_ROWS):
    ws.row_dimensions[r].height = 22
    for c in range(1, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        cell.border = box
        f(cell, size=11)
        if c == 1:
            cell.value = '=IF(C' + str(r) + '="","",ROW()-1)'
            a(cell, horizontal="center")
        elif c in (4, 5, 6, 9, 14, 15, 16, 17, 18):
            a(cell, horizontal="center")
        elif c in (2, 19, 20):
            a(cell, horizontal="center")
            cell.number_format = "YYYY-MM-DD"
        elif c == 14:
            a(cell, horizontal="center")
            cell.number_format = "0"
        elif c == 15:
            a(cell, horizontal="center")
            cell.number_format = "0.0"
        else:
            a(cell, horizontal="left")

miasta = [
    "Warszawa", "Krakow", "Lodz", "Wroclaw", "Poznan",
    "Gdansk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice",
    "Bialystok", "Gdynia", "Czestochowa", "Radom", "Sosnowiec",
    "Torun", "Kielce", "Rzeszow", "Olsztyn", "Inne",
]

dv_miasto = DataValidation(
    type="list",
    formula1='"' + ",".join(miasta) + '"',
    allow_blank=True,
)
dv_miasto.add("D2:D" + str(1 + N_ROWS))
ws.add_data_validation(dv_miasto)

dv_segment = DataValidation(
    type="list",
    formula1='"Zarzadcy nieruchomosci,Firmy budowlane,Agencje nieruchomosci,HR / Duzi pracodawcy"',
    allow_blank=True,
)
dv_segment.add("E2:E" + str(1 + N_ROWS))
ws.add_data_validation(dv_segment)

dv_priorytet = DataValidation(
    type="list",
    formula1='"TOP (zielony),Sredni (zolty),Niski (czerwony)"',
    allow_blank=True,
)
dv_priorytet.add("F2:F" + str(1 + N_ROWS))
ws.add_data_validation(dv_priorytet)

dv_typ_email = DataValidation(
    type="list",
    formula1='"biuro@/kontakt@ (OK),imienny (RYZYKO),brak"',
    allow_blank=True,
)
dv_typ_email.add("I2:I" + str(1 + N_ROWS))
ws.add_data_validation(dv_typ_email)

dv_zrodlo = DataValidation(
    type="list",
    formula1='"Google Maps,CEIDG,KRS,Panorama Firm,LinkedIn,Hunter.io,Polecenie,Inne"',
    allow_blank=True,
)
dv_zrodlo.add("P2:P" + str(1 + N_ROWS))
ws.add_data_validation(dv_zrodlo)

dv_status_tel = DataValidation(
    type="list",
    formula1='"Nowa,Zadzwoniono - brak odbioru,Zadzwoniono - rozmowa,W kontakcie,Zarejestrowana,Odrzucona,Callback"',
    allow_blank=True,
)
dv_status_tel.add("Q2:Q" + str(1 + N_ROWS))
ws.add_data_validation(dv_status_tel)

dv_status_email = DataValidation(
    type="list",
    formula1='"Nowa,Mail #1 wyslany,Mail #2 wyslany,Mail #3 wyslany,Otwarte,Odpowiedzial,Konwersja,Bounce,Unsubscribe"',
    allow_blank=True,
)
dv_status_email.add("R2:R" + str(1 + N_ROWS))
ws.add_data_validation(dv_status_email)

body_range = "A2:X" + str(1 + N_ROWS)

ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$F2="TOP (zielony)"'],
        fill=PatternFill("solid", start_color=GREEN_SOFT, end_color=GREEN_SOFT),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$F2="Sredni (zolty)"'],
        fill=PatternFill("solid", start_color=YELLOW_SOFT, end_color=YELLOW_SOFT),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$F2="Niski (czerwony)"'],
        fill=PatternFill("solid", start_color=RED_SOFT, end_color=RED_SOFT),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['OR($Q2="Zarejestrowana",$R2="Konwersja")'],
        font=Font(name=FONT_NAME, size=11, bold=True, color="1B5E20"),
        fill=PatternFill("solid", start_color="A5D6A7", end_color="A5D6A7"),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['OR($Q2="Odrzucona",$R2="Bounce",$R2="Unsubscribe")'],
        font=Font(name=FONT_NAME, size=11, strike=True, color="757575"),
        fill=PatternFill("solid", start_color=GREY_SOFT, end_color=GREY_SOFT),
    ),
)
ws.conditional_formatting.add(
    "T2:T" + str(1 + N_ROWS),
    FormulaRule(
        formula=['AND($T2<>"",$T2<TODAY(),$Q2<>"Zarejestrowana",$Q2<>"Odrzucona")'],
        font=Font(name=FONT_NAME, size=11, bold=True, color="B71C1C"),
        fill=PatternFill("solid", start_color="FFCDD2", end_color="FFCDD2"),
    ),
)
ws.conditional_formatting.add(
    "I2:I" + str(1 + N_ROWS),
    FormulaRule(
        formula=['$I2="imienny (RYZYKO)"'],
        font=Font(name=FONT_NAME, size=11, color="B71C1C"),
        fill=PatternFill("solid", start_color="FFE0E0", end_color="FFE0E0"),
    ),
)


# ============= ARKUSZ 3: 10 MIAST GOOGLE MAPS =============
ws = wb.create_sheet("10 miast Google Maps")
ws.sheet_view.showGridLines = False

ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 16
ws.column_dimensions["C"].width = 40
ws.column_dimensions["D"].width = 40
ws.column_dimensions["E"].width = 40
ws.column_dimensions["F"].width = 40

ws["B2"] = "240 klikalnych zapytan Google Maps - 10 miast x 4 segmenty x 6 wariantow"
f(ws["B2"], size=17, bold=True, color=HEADER_BG)
ws["B3"] = "Kliknij link -> Google Maps otwiera wyszukiwanie -> kopiujesz do [Lista firm]. 15-30 min per miasto."
f(ws["B3"], size=11, italic=True, color="555555")

cities_search = [
    "Warszawa", "Krakow", "Lodz", "Wroclaw", "Poznan",
    "Gdansk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice",
]

queries_per_segment = {
    "Zarzadcy nieruchomosci": [
        "zarzadca nieruchomosci {c}",
        "spoldzielnia mieszkaniowa {c}",
        "wspolnota mieszkaniowa {c}",
        "administracja budynkow {c}",
        "TBS {c}",
        "facility management {c}",
    ],
    "Firmy budowlane": [
        "firma remontowa {c}",
        "deweloper {c}",
        "generalny wykonawca {c}",
        "firma budowlana {c}",
        "firma wykonczeniowa {c}",
        "firma fit-out {c}",
    ],
    "Agencje nieruchomosci": [
        "biuro nieruchomosci {c}",
        "agencja nieruchomosci {c}",
        "posrednik nieruchomosci {c}",
        "zarzadzanie najmem {c}",
        "apartamenty na wynajem {c}",
        "nieruchomosci komercyjne {c}",
    ],
    "HR / Duzi pracodawcy": [
        "fabryka {c}",
        "centrum logistyczne {c}",
        "hotel {c}",
        "szpital prywatny {c}",
        "magazyn {c}",
        "zaklad produkcyjny {c}",
    ],
}


def gmaps_url(q):
    return "https://www.google.com/maps/search/" + quote_plus(q)


row = 5
header_row = ["Miasto", "Zarzadcy nieruchomosci", "Firmy budowlane",
              "Agencje nieruchomosci", "HR / Duzi pracodawcy"]
ws.row_dimensions[row].height = 34
for i, h in enumerate(header_row):
    cell = ws.cell(row=row, column=2 + i, value=h)
    head(cell)
row += 1

segments_order = ["Zarzadcy nieruchomosci", "Firmy budowlane",
                  "Agencje nieruchomosci", "HR / Duzi pracodawcy"]

for city in cities_search:
    ws.row_dimensions[row].height = 28
    c_cell = ws.cell(row=row, column=2, value=city)
    f(c_cell, size=12, bold=True, color=HEADER_BG)
    a(c_cell, horizontal="center")
    c_cell.border = box
    bg(c_cell, ROW_ALT)
    for i, seg in enumerate(segments_order):
        qs = queries_per_segment[seg]
        q = qs[0].format(c=city)
        cell = ws.cell(row=row, column=3 + i)
        cell.value = '=HYPERLINK("' + gmaps_url(q) + '","SZUKAJ: ' + q + '")'
        f(cell, size=10, color="0B5394")
        a(cell, wrap=True)
        cell.border = box
    row += 1

row += 2
ws[f"B{row}"] = "Alternatywne zapytania (gdy pierwsza tura nie dala wynikow)"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":F" + str(row))
row += 1

header_row_alt = ["Miasto", "Segment", "Zapytanie alternatywne", "", ""]
ws.row_dimensions[row].height = 28
for i, h in enumerate(header_row_alt):
    if not h:
        continue
    cell = ws.cell(row=row, column=2 + i, value=h)
    head(cell)
row += 1

for city in cities_search:
    for seg in segments_order:
        qs = queries_per_segment[seg]
        for q_template in qs[1:]:
            q = q_template.format(c=city)
            c1 = ws.cell(row=row, column=2, value=city)
            c1.border = box
            f(c1, size=10, bold=True)
            a(c1, horizontal="center")
            c2 = ws.cell(row=row, column=3, value=seg)
            c2.border = box
            f(c2, size=10)
            a(c2)
            link_cell = ws.cell(row=row, column=4)
            link_cell.value = '=HYPERLINK("' + gmaps_url(q) + '","SZUKAJ: ' + q + '")'
            f(link_cell, size=10, color="0B5394")
            a(link_cell)
            link_cell.border = box
            ws.merge_cells("D" + str(row) + ":F" + str(row))
            row += 1


# ============= ARKUSZ 4: MEGA-ZRODLA =============
ws = wb.create_sheet("Mega-zrodla")
ws.sheet_view.showGridLines = False

ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 28
ws.column_dimensions["C"].width = 42
ws.column_dimensions["D"].width = 55

ws["B2"] = "5 zrodel leadow - gdzie znalezc 500+ firm w 10 dni"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)

row = 4
sources_data = [
    ("1. CEIDG (JDG - firmy jednoosobowe)",
     "https://aplikacja.ceidg.gov.pl/CEIDG.CMS.ENGINE/",
     "Darmowe, 500 firm w 15 min. Filtruj po PKD:\n"
     "- 68.32.Z Zarzadzanie nieruchomosciami\n"
     "- 41.20.Z Roboty budowlane\n"
     "- 68.31.Z Posrednictwo nieruchomosci\n"
     "- 43.99.Z Specjalistyczne roboty budowlane\n"
     "Eksport CSV -> filtruj po miescie w Excelu."),
    ("2. KRS (spolki - wieksze firmy)",
     "https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/",
     "Darmowe, dla Sp. z o.o., S.A., komandytowych. Wyszukaj po PKD i wojewodztwie. "
     "Wyniki: nazwa, adres, zarzad (imienne!), KRS, kapital. Plus: pokazuje czy firma aktywna."),
    ("3. Panorama Firm",
     "https://www.pf.pl/",
     "Darmowe z reklamami. Kategoria + miasto -> lista firm z telefonem. "
     "Lepsze niz Google Maps dla niszowych kategorii (np. 'TBS Rzeszow')."),
    ("4. Hunter.io (email discovery)",
     "https://hunter.io/",
     "Free: 25 emaili/mies. Starter 49$/mies: 500 emaili. "
     "Wkladasz domene firmy (np. firma.pl) -> wyciaga biuro@, kontakt@, imienne z patternu. "
     "ZASADA: wyciagaj tylko biuro@/kontakt@ na start."),
    ("5. Apollo.io (B2B database)",
     "https://www.apollo.io/",
     "Free: 50 emaili/mies. Paid od 49$/mies. "
     "Wieksza baza niz Hunter, ale uwaga - imienne emaile sa DANE OSOBOWE (RODO). "
     "Uzywaj tylko do lookup 'kto jest dyrektorem X w firmie Y', potem dzwon - nie mailuj."),
]

ws.row_dimensions[row].height = 32
ws.cell(row=row, column=2, value="Zrodlo")
ws.cell(row=row, column=3, value="Link")
ws.cell(row=row, column=4, value="Jak uzywac")
for col in (2, 3, 4):
    head(ws.cell(row=row, column=col))
row += 1

for name, url, howto in sources_data:
    lines = howto.count("\n") + 1
    ws.row_dimensions[row].height = max(50, 18 * lines)
    c1 = ws.cell(row=row, column=2, value=name)
    f(c1, size=11, bold=True)
    a(c1)
    c1.border = box
    c2 = ws.cell(row=row, column=3)
    c2.value = '=HYPERLINK("' + url + '","' + url + '")'
    f(c2, size=10, color="0B5394")
    a(c2)
    c2.border = box
    c3 = ws.cell(row=row, column=4, value=howto)
    f(c3, size=10)
    a(c3)
    c3.border = box
    row += 1

row += 2
ws[f"B{row}"] = "CEIDG - gotowy bulk workflow (500 firm w 15 min)"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

ceidg_steps = [
    ("Krok 1", "Otworz https://aplikacja.ceidg.gov.pl -> 'Wyszukiwanie firm'"),
    ("Krok 2", "Pole 'PKD' -> wpisz '68.32.Z' (zarzadca nieruchomosci) -> szukaj"),
    ("Krok 3", "Wyniki: pole 'Wojewodztwo' -> ustaw 'mazowieckie' (Warszawa) -> Apply"),
    ("Krok 4", "Gora strony -> przycisk 'Eksportuj CSV' -> save as CEIDG_zarzadcy_mazowieckie.csv"),
    ("Krok 5", "Otworz w Excelu -> filtruj kolumne 'Miasto' = 'WARSZAWA' -> skopiuj do Lista firm"),
    ("Krok 6", "Powtorz dla innych PKD i innych wojewodztw. 4 PKD x 5 wojewodztw = 20 eksportow = ~1000 firm."),
]

for step, desc in ceidg_steps:
    ws.row_dimensions[row].height = 28
    c1 = ws.cell(row=row, column=2, value=step)
    f(c1, size=11, bold=True, color=HEADER_BG)
    a(c1, horizontal="center")
    c1.border = box
    c2 = ws.cell(row=row, column=3, value=desc)
    f(c2, size=11)
    a(c2)
    c2.border = box
    ws.merge_cells("C" + str(row) + ":D" + str(row))
    row += 1

row += 2
ws[f"B{row}"] = "Hunter.io - jak wyciagnac email firmy w 30 sek"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

hunter_steps = [
    ("Krok 1", "Wchodzisz na hunter.io -> zakladasz konto (free tier 25 emaili/mies)"),
    ("Krok 2", "W pole 'Domain' wpisujesz domene firmy (np. abcbudowa.pl - bez https://)"),
    ("Krok 3", "Wynik: lista emaili z patterns - generyczne (biuro@, kontakt@) + imienne"),
    ("Krok 4", "Bierzesz TYLKO biuro@/kontakt@/info@/sekretariat@ (RODO-safe)"),
    ("Krok 5", "Wklejasz do kolumny H w [Lista firm], kolumna I = 'biuro@/kontakt@ (OK)'"),
    ("Krok 6", "Dla duzych batchy - Hunter ma Bulk feature (upload listy domen CSV)"),
]

for step, desc in hunter_steps:
    ws.row_dimensions[row].height = 28
    c1 = ws.cell(row=row, column=2, value=step)
    f(c1, size=11, bold=True, color=HEADER_BG)
    a(c1, horizontal="center")
    c1.border = box
    c2 = ws.cell(row=row, column=3, value=desc)
    f(c2, size=11)
    a(c2)
    c2.border = box
    ws.merge_cells("C" + str(row) + ":D" + str(row))
    row += 1


# ============= ARKUSZ 5: SEGMENTY =============
ws = wb.create_sheet("Segmenty")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 28
ws.column_dimensions["C"].width = 12
ws.column_dimensions["D"].width = 48
ws.column_dimensions["E"].width = 48

ws["B2"] = "4 segmenty B2B - priorytet + kogo prosisz"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)

ws["B4"] = "Segment"
ws["C4"] = "Priorytet"
ws["D4"] = "Dlaczego ten segment"
ws["E4"] = "Kogo prosisz na linii"
for c in ("B4", "C4", "D4", "E4"):
    head(ws[c])

segments = [
    ("Zarzadcy nieruchomosci", "5 gwiazdek",
     "Ciagly bol (awarie w budynkach). Sami podejmuja decyzje. Malo technofobiczni. Najwyzszy ROI.",
     "Zarzadca ds. technicznych | Inspektor nadzoru | Konserwator | Prezes (male wspolnoty)"),
    ("Firmy budowlane / deweloperzy", "4 gwiazdki",
     "Kara umowna za opoznienie = ogromny bol. Stale szukaja podwykonawcow. Gatekeeperzy twardsi.",
     "Kierownik budowy | Specjalista ds. zaopatrzenia | Dyrektor operacyjny | Wlasciciel (firmy do 10 os)"),
    ("Agencje nieruchomosci", "3 gwiazdki",
     "Cykliczny bol (remont przed sprzedaza). Nizsza pilnosc. Lepszy email niz telefon.",
     "Agent nieruchomosci | Manager biura | Dyrektor obslugi klienta"),
    ("HR / Duzi pracodawcy", "3 gwiazdki",
     "Fabryki, hotele, logistyka. Stale szukaja. Cykl decyzyjny dlugi (2-3 miesiace).",
     "Specjalista HR (rekrutacja techniczna) | Kierownik utrzymania ruchu | Dyrektor techn."),
]

row = 5
for seg, prio, why, who in segments:
    ws.row_dimensions[row].height = 70
    ws[f"B{row}"] = seg
    f(ws[f"B{row}"], size=12, bold=True)
    a(ws[f"B{row}"])
    ws[f"C{row}"] = prio
    a(ws[f"C{row}"], horizontal="center")
    f(ws[f"C{row}"], size=11)
    ws[f"D{row}"] = why
    f(ws[f"D{row}"], size=11)
    a(ws[f"D{row}"])
    ws[f"E{row}"] = who
    f(ws[f"E{row}"], size=11)
    a(ws[f"E{row}"])
    for col in ("B", "C", "D", "E"):
        ws[f"{col}{row}"].border = box
    row += 1


# ============= ARKUSZ 6: EMAIL - WOODPECKER =============
ws = wb.create_sheet("Email - Woodpecker")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 20
ws.column_dimensions["C"].width = 95

ws["B2"] = "Szablony emaili do Woodpeckera (3 segmenty, drip 4 emaile / 14 dni)"
f(ws["B2"], size=17, bold=True, color=HEADER_BG)
ws["B3"] = "Personalizacja tokenami {{FirstName}} {{Company}} {{Token1}} {{Token2}}. Wszystkie z linkiem unsubscribe."
f(ws["B3"], size=11, italic=True, color="555555")

row = 5

def add_email_template(segment_name, emails):
    global row
    ws.row_dimensions[row].height = 30
    ws[f"B{row}"] = segment_name
    section(ws[f"B{row}"])
    ws.merge_cells("B" + str(row) + ":C" + str(row))
    row += 1

    for title, body in emails:
        ws.row_dimensions[row].height = 26
        ws[f"B{row}"] = title
        f(ws[f"B{row}"], size=11, bold=True, color=HEADER_BG)
        a(ws[f"B{row}"])
        ws[f"B{row}"].border = box
        bg(ws[f"B{row}"], ROW_ALT)
        ws.merge_cells("B" + str(row) + ":C" + str(row))
        row += 1

        lines = body.count("\n") + 1
        ws.row_dimensions[row].height = max(150, 16 * lines)
        ws[f"B{row}"] = "Body"
        f(ws[f"B{row}"], size=11, bold=True)
        a(ws[f"B{row}"], horizontal="center")
        ws[f"B{row}"].border = box
        bg(ws[f"B{row}"], ROW_ALT)
        ws[f"C{row}"] = body
        f(ws[f"C{row}"], size=10)
        a(ws[f"C{row}"])
        ws[f"C{row}"].border = box
        row += 1


zn_emails = [
    (
        "Email 1/4 - Dzien 0 (Subject: {{Token1}} - oszczednosc czasu zarzadcy)",
        "Dzien dobry,\n\n"
        "Widze, ze {{Company}} zarzadza nieruchomosciami w {{City}} - {{Token2}}.\n\n"
        "Zbudowalem MapJob.pl - mape fachowcow (elektrykow, hydraulikow, dachowcow) dostepnych "
        "w promieniu X km od Pana biura. Wrzucasz awariye, wybierasz najblizszego, piszesz - bez posrednika.\n\n"
        "3 rzeczy, ktore moga Pana zainteresowac:\n"
        "- Darmowe dla firm zarzadczych (nie sprzedaje subskrypcji firmom - fachowcy placa)\n"
        "- Wszyscy fachowcy zweryfikowani (uprawnienia SEP/UDT widoczne w profilu)\n"
        "- Czas od awarii do fachowca na miejscu: srednio 2h w duzych miastach\n\n"
        "Czy mialby Pan 10 min w tym tygodniu, zebym pokazal jak to dziala na przykladzie Panstwa zasobu?\n\n"
        "Pozdrawiam,\n"
        "[Imie]\n"
        "MapJob.pl\n"
        "tel. [nr]\n\n"
        "PS: Jesli nie jestem we wlasciwej osobie, bylbym wdzieczny za przekierowanie do zarzadcy technicznego.\n\n"
        "---\n"
        "Nie chcesz otrzymywac wiadomosci? Odpisz STOP albo kliknij: {{UnsubscribeLink}}\n"
        "[Nazwa firmy] | NIP: [NIP] | [Adres]"
    ),
    (
        "Email 2/4 - Dzien 4 (Subject: Pytanie o awarie w {{Company}})",
        "Dzien dobry,\n\n"
        "W poniedzialek wyslalem Panu wiadomosc o MapJob - widze, ze nie przeczytana. Zakladam, ze utonela w skrzynce.\n\n"
        "Jedno pytanie: kiedy ostatnio awaria wymagala fachowca na JUZ a nie dalo sie nikogo zlapac przez 3 godziny?\n\n"
        "To klasyczny scenariusz dla ktorego MapJob powstal. Nie musi Pan sie rejestrowac - mozna po prostu wejsc "
        "na mapjob.pl/mapa, zobaczyc czy w Panstwa okolicy sa elektrycy/hydraulicy, sprawdzic jak to wyglada.\n\n"
        "Jak Pan powie 'nie interesuje mnie' - natychmiast wylaczam dalsze maile. Jeden 'nie' wystarczy.\n\n"
        "Pozdrawiam,\n"
        "[Imie]\n\n"
        "---\n"
        "Nie chcesz otrzymywac wiadomosci? Odpisz STOP albo kliknij: {{UnsubscribeLink}}"
    ),
    (
        "Email 3/4 - Dzien 10 (Subject: Ostatni mail ode mnie - {{FirstName}})",
        "Dzien dobry,\n\n"
        "To ostatnia moja wiadomosc - obiecuje.\n\n"
        "Jesli MapJob Panstwa nie interesuje - zrozumiale, nikt nie lubi cold emaili. Ale jesli kiedys potrzebuja Panstwo "
        "szybko fachowca i nie bedzie nikogo pod reka - link jest tutaj: https://mapjob.pl\n\n"
        "Zapisze sobie, ze nie trzeba wracac. Dziekuje za czas w skrzynce.\n\n"
        "Pozdrawiam,\n"
        "[Imie]\n"
        "MapJob.pl\n\n"
        "---\n"
        "Nie chcesz otrzymywac wiadomosci? Odpisz STOP albo kliknij: {{UnsubscribeLink}}"
    ),
]

budo_emails = [
    (
        "Email 1/3 - Dzien 0 (Subject: Podwykonawcy na {{Token1}} - 48h zamiast 2 tygodni)",
        "Dzien dobry,\n\n"
        "Widze, ze {{Company}} prowadzi {{Token2}} - brzmi jak projekt gdzie opoznienia podwykonawcow kosztuja kary umowne.\n\n"
        "Zbudowalem MapJob.pl - mape fachowcow w {{City}}. Wrzucasz zlecenie ('potrzebuje 3 elektrykow na 2 tyg, "
        "osiedle X, 60zl/h'), fachowcy zglaszaja sie SAMI w ciagu 48h. Bez ogloszen na OLX, bez scryningu CV z halucynacjami.\n\n"
        "Zero oplat dla firmy. Fachowcy placa (79 zl/mies za Pro). Wy uzywacie za darmo.\n\n"
        "Czy mozemy zrobic jeden test case? Wrzucilibysmy razem jedno Wasze aktualne zlecenie na Gielde - "
        "zobaczymy ilu fachowcow sie zglosi. Jak 0 - przepraszam za zabrany czas. Jak 5+ - zaoszczedzilem Wam tydzien szukania.\n\n"
        "Jaki termin pasuje? Zabieram max 15 min.\n\n"
        "[Imie]\n"
        "MapJob.pl | tel. [nr]\n\n"
        "---\n"
        "Unsubscribe: {{UnsubscribeLink}}"
    ),
    (
        "Email 2/3 - Dzien 5 (Subject: RE: podwykonawcy {{Token1}})",
        "Dzien dobry,\n\n"
        "Bumping poprzedni mail. Rozumiem ze Tydzien budowy - ale 30 sekund to wszystko czego potrzebuje:\n\n"
        "https://mapjob.pl/gielda - wrzucacie jedno zlecenie (anonimowo jak chcecie), patrzycie ile ofert wpada.\n\n"
        "To nie obietnica, to eksperyment. Albo zadziala - albo nie i wtedy konczymy.\n\n"
        "[Imie]\n\n"
        "---\n"
        "Unsubscribe: {{UnsubscribeLink}}"
    ),
    (
        "Email 3/3 - Dzien 14 (Subject: Ostatni - i nie wracam)",
        "Dzien dobry,\n\n"
        "Ostatnia moja wiadomosc.\n\n"
        "MapJob to nie jest 'next wielkie cudo' - to lokalna mapa fachowcow + gielda zlecen. Istnieje, dziala, jest darmowy dla firm.\n\n"
        "Jak bedzie kiedys kryzys z podwykonawcami - link: https://mapjob.pl. Jak nie - dzieki za cierpliwosc.\n\n"
        "Trzymam kciuki za Wasze projekty.\n\n"
        "[Imie]\n\n"
        "---\n"
        "Unsubscribe: {{UnsubscribeLink}}"
    ),
]

agencje_emails = [
    (
        "Email 1/3 - Dzien 0 (Subject: Dla agencji: fachowiec pod mieszkanie przed sprzedaza)",
        "Dzien dobry,\n\n"
        "Widze, ze {{Company}} prowadzi sprzedaz mieszkan w {{City}}. Typowy scenariusz: klient mowi "
        "'kupie jak naprawicie kafelki w lazience'. Szukacie fachowca, traficie na wolnego dopiero za 2 tygodnie, klient odpada.\n\n"
        "MapJob.pl to mapa fachowcow w {{City}} z widocznym 'dostepnosc: dzis/jutro/ten tydzien'. "
        "Wchodzisz, widzisz, dzwonisz - 15 min i masz fachowca na mieszkaniu.\n\n"
        "Dla agencji darmowe. Fachowcy placa. Plus - mozecie rekomendowac fachowca Waszym kupujacym "
        "(= dodatkowa wartosc dla klienta).\n\n"
        "15 min demo w tym tygodniu?\n\n"
        "[Imie]\n"
        "MapJob.pl\n\n"
        "---\n"
        "Unsubscribe: {{UnsubscribeLink}}"
    ),
    (
        "Email 2/3 - Dzien 7 (Subject: {{FirstName}}, jedno pytanie)",
        "Dzien dobry,\n\n"
        "Jedno pytanie - ile razy w ciagu roku tracicie Panstwo transakcje przez to, ze klient chcial "
        "minor fix a nie bylo fachowca na cito?\n\n"
        "Jak 0 - MapJob nie jest dla Was. Jak 2-5 - warto spojrzec na mapjob.pl.\n\n"
        "[Imie]\n\n"
        "---\n"
        "Unsubscribe: {{UnsubscribeLink}}"
    ),
    (
        "Email 3/3 - Dzien 14 (Subject: Ostatni mail i zostawiam w spokoju)",
        "Dzien dobry,\n\n"
        "Ostatnia wiadomosc. Jak bedzie potrzeba - link: https://mapjob.pl.\n\n"
        "Dzieki za Wasze miejsce w skrzynce.\n\n"
        "[Imie]\n\n"
        "---\n"
        "Unsubscribe: {{UnsubscribeLink}}"
    ),
]

add_email_template("Segment: Zarzadcy nieruchomosci (4 maile w 14 dni)", zn_emails)
add_email_template("Segment: Firmy budowlane / deweloperzy (3 maile w 14 dni)", budo_emails)
add_email_template("Segment: Agencje nieruchomosci (3 maile w 14 dni)", agencje_emails)

row += 1
ws.row_dimensions[row].height = 30
ws[f"B{row}"] = "Personalizacja tokenow - co wpisujesz do {{Token1}} i {{Token2}}"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":C" + str(row))
row += 1

token_examples = [
    ("Segment ZN - Token1",
     "Specyficzna wartosc dla zarzadcy: '15 osiedli w dzielnicy X' | 'TBS w Poznaniu' | 'konserwacja 8 budynkow'"),
    ("Segment ZN - Token2",
     "Ich konkretny kontekst (z Google Maps / strony): 'osiedle Niepodleglosci' | 'opinie o szybkich interwencjach' | '15 lat na rynku'"),
    ("Segment Budowlane - Token1",
     "Typ inwestycji: 'osiedle wielorodzinne' | 'hala logistyczna' | 'biurowiec fit-out'"),
    ("Segment Budowlane - Token2",
     "Konkretny projekt: 'Nowy Targowek' | 'projekt w Wilanowie' | 'fit-out dla Orange'"),
    ("Segment Agencje - Token1",
     "Typ rynku: 'mieszkania z drugiej reki' | 'apartamenty premium' | 'wynajem krotkoterminowy'"),
    ("Segment Agencje - Token2",
     "Lokalizacja: 'Krakow-Podgorze' | 'Warszawa-Wilanow' | 'Wroclaw-Stare Miasto'"),
]

for t, desc in token_examples:
    ws.row_dimensions[row].height = 40
    c1 = ws.cell(row=row, column=2, value=t)
    f(c1, size=11, bold=True, color=HEADER_BG)
    a(c1)
    c1.border = box
    c2 = ws.cell(row=row, column=3, value=desc)
    f(c2, size=11)
    a(c2)
    c2.border = box
    row += 1


# ============= ARKUSZ 7: EMAIL - COMPLIANCE =============
ws = wb.create_sheet("Email - compliance")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 6
ws.column_dimensions["C"].width = 95

ws["B2"] = "Email compliance + deliverability - setup przed 1. maila"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)

ws["B3"] = "Bez tego - Gmail zablokuje Twoje maile i zepsujesz reset hasla na mapjob.pl."
f(ws["B3"], size=11, italic=True, color="B71C1C")

legal_section = [
    "PRAWNE (RODO + UoSUDE):",
    "Wysylam TYLKO na adresy generyczne (biuro@, kontakt@, info@, sekretariat@) publicznie dostepne",
    "NIE wysylam na adresy imienne (jan.kowalski@firma.pl) - to RODO, ryzykowne",
    "NIE kupilem gotowej bazy emaili - wszystkie zrodla moge udowodnic (CEIDG, strona firmy, Hunter.io)",
    "Kazdy email ma link/przycisk 'Unsubscribe' na koncu",
    "Kazdy email ma stopke: nazwa firmy + NIP + adres rejestrowy (art. 5 UoSUDE)",
    "Kazdy email ma subject nie-klikbaitowy (nie 'URGENT!!!', nie 'DARMOWY!!!')",
    "Przetestowalem na sobie i 2 znajomych - nie trafia do Spam/Promotions",
    "",
    "TECHNICZNE (deliverability):",
    "Wysylam z SUBDOMENY outreach@kontakt.mapjob.pl, nie z glownej mapjob.pl",
    "Mam skonfigurowany SPF record dla subdomeny (DNS TXT: v=spf1 include:mail.woodpecker.co ~all)",
    "Mam skonfigurowany DKIM (podpisywanie cyfrowe - Woodpecker generuje)",
    "Mam skonfigurowany DMARC (polityka: p=none;rua=mailto:postmaster@mapjob.pl)",
    "Domena kontakt.mapjob.pl ma whitelisty u mnie i 3 znajomych (testowe maile NIE idq w spam)",
    "Limit wysylki: 20 maili/dzien pierwszy tydzien -> 50/dzien -> 100/dzien (warm-up)",
    "Mailtester.com score: min 8/10 (testuje przed 1. fala)",
    "Odstep miedzy mailami w drip 4-7 dni (nie codziennie - spam signal)",
    "Nie wysylam linkow skracanych (bit.ly, tinyurl) - Gmail flaguje",
    "Nie wysylam obrazkow bez alt text - spam filter nie lubi",
    "",
    "ZAKAZY (od razu unsubscribe + reputacja w dol):",
    "NIE wysylam do tych samych firm po odpowiedzi 'nie' / 'stop' / 'unsubscribe'",
    "NIE wysylam codziennie - minimum 4 dni odstep",
    "NIE wysylam wiecej niz 3-4 maili per firma (potem przestaje, czekam 3 miesiace)",
    "NIE uzywam CAPS LOCK w subject line",
    "NIE mam w subject wykrzyknikow ('Super okazja!!!' = spam score +10)",
    "NIE wysylam przez adres noreply@ - wyglada sztucznie",
    "NIE klonowalem template z internetu bez zmian - spam filtry znaja te szablony",
]

row = 5
for item in legal_section:
    if not item:
        row += 1
        continue
    if item.endswith(":"):
        ws.row_dimensions[row].height = 30
        ws[f"B{row}"] = ""
        ws[f"C{row}"] = item
        f(ws[f"C{row}"], size=12, bold=True, color="FFFFFF")
        a(ws[f"C{row}"])
        bg(ws[f"C{row}"], SUB_BG)
        ws.merge_cells("B" + str(row) + ":C" + str(row))
        row += 1
        continue
    ws.row_dimensions[row].height = 26
    ws[f"B{row}"] = "[  ]"
    f(ws[f"B{row}"], size=14, bold=True, color=ACCENT_GOLD)
    a(ws[f"B{row}"], horizontal="center")
    ws[f"B{row}"].border = box
    ws[f"C{row}"] = item
    f(ws[f"C{row}"], size=11)
    a(ws[f"C{row}"])
    ws[f"C{row}"].border = box
    row += 1


# ============= ARKUSZ 8: METRYKI =============
ws = wb.create_sheet("Metryki")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 48
ws.column_dimensions["C"].width = 16
ws.column_dimensions["D"].width = 52

ws["B2"] = "Metryki - auto-liczone z [Lista firm]"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)
ws["B3"] = "Wszystko po formulach. Wypelnij Lista firm, wroc tutaj, zobacz progres."
f(ws["B3"], size=11, italic=True, color="555555")

row = 5
ws[f"B{row}"] = "Baza firm - stan aktualny"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

LF = "'Lista firm'"
N = str(1 + N_ROWS)

metrics_baza = [
    ("Firmy w bazie (lacznie)",
     '=COUNTA(' + LF + '!C2:C' + N + ')',
     "Cel: 500-1000 po 10 dniach pracy"),
    ("Z czego TOP (zielony)",
     '=COUNTIF(' + LF + '!F2:F' + N + ',"TOP (zielony)")',
     "Najbardziej wartosciowe - dzwonisz + mailujesz jako pierwsze"),
    ("Z czego Sredni (zolty)",
     '=COUNTIF(' + LF + '!F2:F' + N + ',"Sredni (zolty)")',
     "Druga fala - tylko email, bez telefonu"),
    ("Z czego Niski (czerwony)",
     '=COUNTIF(' + LF + '!F2:F' + N + ',"Niski (czerwony)")',
     "Pomijasz na start (mala firma / brak strony)"),
    ("Z emailem (gotowe do Woodpeckera)",
     '=COUNTIF(' + LF + '!I2:I' + N + ',"biuro@/kontakt@ (OK)")',
     "To jest baza do kampanii email"),
    ("Bez emaila (telefon only)",
     '=COUNTIF(' + LF + '!I2:I' + N + ',"brak")',
     "Dzwon nie mailuj"),
]

for label, formula, note in metrics_baza:
    ws.row_dimensions[row].height = 26
    ws[f"B{row}"] = label
    f(ws[f"B{row}"], size=11, bold=True)
    a(ws[f"B{row}"])
    ws[f"C{row}"] = formula
    f(ws[f"C{row}"], size=16, bold=True, color=HEADER_BG)
    a(ws[f"C{row}"], horizontal="center")
    ws[f"C{row}"].number_format = "0"
    ws[f"D{row}"] = note
    f(ws[f"D{row}"], size=10, italic=True, color="555555")
    a(ws[f"D{row}"])
    for c in ("B", "C", "D"):
        ws[f"{c}{row}"].border = box
    row += 1

row += 1
ws[f"B{row}"] = "Lejek sprzedazy - telefon"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

metrics_tel = [
    ("Zadzwoniono (lacznie)",
     ('=COUNTIF(' + LF + '!Q2:Q' + N + ',"Zadzwoniono - brak odbioru")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Zadzwoniono - rozmowa")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"W kontakcie")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Odrzucona")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Callback")'),
     "Liczba firm gdzie podjeto probe telefoniczna"),
    ("Rozmowa z decydentem",
     ('=COUNTIF(' + LF + '!Q2:Q' + N + ',"Zadzwoniono - rozmowa")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"W kontakcie")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Odrzucona")'
      '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Callback")'),
     "Realne rozmowy"),
    ("Zarejestrowane z telefonu",
     '=COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")',
     "WYGRANE Z TELEFONU"),
]

for label, formula, note in metrics_tel:
    ws.row_dimensions[row].height = 26
    ws[f"B{row}"] = label
    f(ws[f"B{row}"], size=11, bold=True)
    a(ws[f"B{row}"])
    ws[f"C{row}"] = formula
    f(ws[f"C{row}"], size=16, bold=True, color=HEADER_BG)
    a(ws[f"C{row}"], horizontal="center")
    ws[f"C{row}"].number_format = "0"
    ws[f"D{row}"] = note
    f(ws[f"D{row}"], size=10, italic=True, color="555555")
    a(ws[f"D{row}"])
    for c in ("B", "C", "D"):
        ws[f"{c}{row}"].border = box
    row += 1

row += 1
ws[f"B{row}"] = "Lejek sprzedazy - email"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

metrics_email = [
    ("Mail #1 wyslany",
     '=COUNTIF(' + LF + '!R2:R' + N + ',"Mail #1 wyslany")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Mail #2 wyslany")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Mail #3 wyslany")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Otwarte")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Odpowiedzial")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja")',
     "Liczba firm ktore dostaly mail #1"),
    ("Otwarte",
     '=COUNTIF(' + LF + '!R2:R' + N + ',"Otwarte")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Odpowiedzial")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja")',
     "Cel: 30%+ (Woodpecker pokazuje w dashboard)"),
    ("Odpowiedzial",
     '=COUNTIF(' + LF + '!R2:R' + N + ',"Odpowiedzial")'
     '+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja")',
     "Cel: 2-5% cold B2B PL"),
    ("Konwersja (zarejestrowane z emaila)",
     '=COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja")',
     "WYGRANE Z EMAILA"),
    ("Bounce",
     '=COUNTIF(' + LF + '!R2:R' + N + ',"Bounce")',
     "Cel <2%. Powyzej = lista zepsuta"),
    ("Unsubscribe",
     '=COUNTIF(' + LF + '!R2:R' + N + ',"Unsubscribe")',
     "Cel <1%. Powyzej = za agresywny copy"),
]

for label, formula, note in metrics_email:
    ws.row_dimensions[row].height = 26
    ws[f"B{row}"] = label
    f(ws[f"B{row}"], size=11, bold=True)
    a(ws[f"B{row}"])
    ws[f"C{row}"] = formula
    f(ws[f"C{row}"], size=16, bold=True, color=HEADER_BG)
    a(ws[f"C{row}"], horizontal="center")
    ws[f"C{row}"].number_format = "0"
    ws[f"D{row}"] = note
    f(ws[f"D{row}"], size=10, italic=True, color="555555")
    a(ws[f"D{row}"])
    for c in ("B", "C", "D"):
        ws[f"{c}{row}"].border = box
    row += 1

row += 1
ws[f"B{row}"] = "Konwersje wieloetapowe (auto)"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

decydent = ('COUNTIF(' + LF + '!Q2:Q' + N + ',"Zadzwoniono - rozmowa")'
            '+COUNTIF(' + LF + '!Q2:Q' + N + ',"W kontakcie")'
            '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")'
            '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Odrzucona")'
            '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Callback")')

zadzwoniono = ('COUNTIF(' + LF + '!Q2:Q' + N + ',"Zadzwoniono - brak odbioru")'
               '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Zadzwoniono - rozmowa")'
               '+COUNTIF(' + LF + '!Q2:Q' + N + ',"W kontakcie")'
               '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")'
               '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Odrzucona")'
               '+COUNTIF(' + LF + '!Q2:Q' + N + ',"Callback")')

email_wyslane = ('COUNTIF(' + LF + '!R2:R' + N + ',"Mail #1 wyslany")'
                 '+COUNTIF(' + LF + '!R2:R' + N + ',"Mail #2 wyslany")'
                 '+COUNTIF(' + LF + '!R2:R' + N + ',"Mail #3 wyslany")'
                 '+COUNTIF(' + LF + '!R2:R' + N + ',"Otwarte")'
                 '+COUNTIF(' + LF + '!R2:R' + N + ',"Odpowiedzial")'
                 '+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja")')

conversions = [
    ("% dodzwanialnosci (decydent / zadzwoniono)",
     '=IFERROR((' + decydent + ')/(' + zadzwoniono + '),0)',
     "Cel: 30%. Jesli <20% - zle godziny dzwonienia."),
    ("% rejestracji z telefonu (zarejestr / decydent)",
     '=IFERROR(COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")/(' + decydent + '),0)',
     "Cel: 15-30%. Jesli <10% - skrypt nie dziala."),
    ("% otwarc emaili (otwarte / wyslane)",
     '=IFERROR((COUNTIF(' + LF + '!R2:R' + N + ',"Otwarte")+COUNTIF(' + LF + '!R2:R' + N + ',"Odpowiedzial")+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja"))/(' + email_wyslane + '),0)',
     "Cel: 30%+ (dobry cold B2B)."),
    ("% odpowiedzi (odpowiedz / wyslane)",
     '=IFERROR((COUNTIF(' + LF + '!R2:R' + N + ',"Odpowiedzial")+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja"))/(' + email_wyslane + '),0)',
     "Cel: 2-5% cold B2B PL."),
    ("% konwersji end-to-end (zareg / firmy w bazie)",
     '=IFERROR((COUNTIF(' + LF + '!Q2:Q' + N + ',"Zarejestrowana")+COUNTIF(' + LF + '!R2:R' + N + ',"Konwersja"))/COUNTA(' + LF + '!C2:C' + N + '),0)',
     "Cel: 3-5% end-to-end. Mierz miesiecznie, nie dziennie."),
]

for label, formula, note in conversions:
    ws.row_dimensions[row].height = 34
    ws[f"B{row}"] = label
    f(ws[f"B{row}"], size=11, bold=True)
    a(ws[f"B{row}"])
    ws[f"C{row}"] = formula
    f(ws[f"C{row}"], size=16, bold=True, color=ACCENT_GREEN)
    a(ws[f"C{row}"], horizontal="center")
    ws[f"C{row}"].number_format = "0.0%"
    ws[f"D{row}"] = note
    f(ws[f"D{row}"], size=10, italic=True, color="555555")
    a(ws[f"D{row}"])
    for c in ("B", "C", "D"):
        ws[f"{c}{row}"].border = box
    row += 1


# ============= SAVE =============
wb.active = 0
wb.save(OUT)
print("SAVED:", OUT)
