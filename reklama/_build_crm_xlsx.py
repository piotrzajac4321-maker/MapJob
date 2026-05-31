# -*- coding: utf-8 -*-
from urllib.parse import quote_plus

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

OUT = r"C:\Users\48721\Desktop\MAPJOB CLAUDE\reklama\MapJob-Warszawa-Lista-Firm-CRM.xlsx"
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

ws["B2"] = "MapJob - Warszawa B2B Cold-Calling CRM"
f(ws["B2"], size=22, bold=True, color=HEADER_BG)

ws["B3"] = "Gotowy CRM do telefonowania - nauczysz sie obslugi w 10 min, wypelnisz w 60 min."
f(ws["B3"], size=11, italic=True, color="555555")

ws["B5"] = "Jak uzywac tego pliku (5 krokow, 60 minut)"
section(ws["B5"])

steps = [
    ("1. Wybierz segment (5 min)",
     "Przejdz do arkusza [Segmenty] - zobaczysz 4 segmenty z priorytetem. "
     "W pierwszym tygodniu dzwonisz TYLKO do jednego. Rekomendacja: Zarzadcy nieruchomosci (5 gwiazdek priorytetu)."),
    ("2. Otworz gotowe zapytania Google Maps (20 min)",
     "Arkusz [Google Maps Warszawa] ma 72 klikalne linki (18 dzielnic x 4 segmenty). "
     "Klikasz - Google Maps otwiera wyszukiwanie - kopiujesz dane firmy do arkusza [Lista firm]."),
    ("3. Wpisz firmy do arkusza [Lista firm] (30 min)",
     "Kolumny maja dropdowny (Segment, Priorytet, Status, Zrodlo, Dzielnica). "
     "Nie musisz pamietac opcji - klikasz w komorke, wybierasz z listy. Cel: 50+ firm."),
    ("4. Oznacz priorytet zielony / zolty / czerwony (5 min)",
     "ZIELONY TOP = >20 opinii Google + >4.0 gwiazdki + dzialajaca strona. "
     "ZOLTY Sredni = 5-20 opinii LUB 3.5-4.0 gwiazdki. "
     "CZERWONY Niski = <5 opinii lub brak strony (pomijasz na start)."),
    ("5. Sprawdz [Pre-flight] i zacznij dzwonic",
     "Checklist przed pierwszym telefonem. Gdy wszystko zafajkowane - "
     "dzwonisz TYLKO do ZIELONYCH (10 telefonow dzien 1, nie cala liste naraz)."),
]

row = 6
for title, body in steps:
    ws.row_dimensions[row].height = 22
    ws[f"B{row}"] = title
    f(ws[f"B{row}"], size=12, bold=True, color=HEADER_BG)
    row += 1
    ws.row_dimensions[row].height = 45
    ws[f"B{row}"] = body
    f(ws[f"B{row}"], size=11)
    a(ws[f"B{row}"])
    row += 1

row += 1
ws[f"B{row}"] = "UWAGA - czego w tym pliku NIE ma"
section(ws[f"B{row}"])
row += 1
ws.row_dimensions[row].height = 90
ws[f"B{row}"] = (
    "W tym pliku NIE ma gotowej listy firm z Warszawy z numerami telefonow. "
    "Celowo - numer wziety z halucynacji AI to numer do losowej osoby, "
    "a dzwonienie do losowych osob spali brand MapJob w pierwszym tygodniu. "
    "Zamiast tego masz tu 72 gotowe zapytania Google Maps - kopiujesz dane ze zrodla, "
    "masz pewnosc ze numer jest aktualny, nic nie zmyslone. 50 firm w 30 min."
)
f(ws[f"B{row}"], size=11)
a(ws[f"B{row}"])
bg(ws[f"B{row}"], YELLOW_SOFT)

row += 2
ws[f"B{row}"] = "Cele"
section(ws[f"B{row}"])
row += 1
goals = [
    "Tydzien 1: zebrac 50 firm (segment 1 = Zarzadcy nieruchomosci), zadzwonic do 10 ZIELONYCH",
    "Tydzien 2-4: 100-120 rozmow / tydzien = 5-6 nowych firm na MapJob / tydzien",
    "Miesiac 1: 20-25 zarejestrowanych firm w Warszawie (tylko z telefonow)",
    "Miesiac 3: 60-75 firm = masz sprawdzony skrypt = czas na skalowanie",
]
for g in goals:
    ws[f"B{row}"] = "  -  " + g
    f(ws[f"B{row}"], size=11)
    row += 1


# ============= ARKUSZ 2: LISTA FIRM =============
ws = wb.create_sheet("Lista firm")

headers = [
    ("Lp", 5),
    ("Data dodania", 13),
    ("Nazwa firmy", 32),
    ("Segment", 14),
    ("Priorytet", 14),
    ("Dzielnica", 15),
    ("Telefon", 15),
    ("Email", 26),
    ("Strona www", 28),
    ("Adres", 30),
    ("Osoba kontaktowa", 22),
    ("Stanowisko", 20),
    ("Opinie Google (liczba)", 12),
    ("Gwiazdki Google", 10),
    ("Zrodlo", 14),
    ("Status", 22),
    ("Data ostatniego kontaktu", 14),
    ("Data follow-up", 14),
    ("Notatki z researchu (90 sek)", 40),
    ("Notatki z rozmowy", 40),
]

ws.row_dimensions[1].height = 40

for idx, (title, width) in enumerate(headers, start=1):
    col_letter = get_column_letter(idx)
    ws.column_dimensions[col_letter].width = width
    cell = ws.cell(row=1, column=idx, value=title)
    head(cell)

ws.freeze_panes = "A2"
ws.auto_filter.ref = "A1:" + get_column_letter(len(headers)) + "1"

N_ROWS = 300
for r in range(2, 2 + N_ROWS):
    ws.row_dimensions[r].height = 22
    for c in range(1, len(headers) + 1):
        cell = ws.cell(row=r, column=c)
        cell.border = box
        f(cell, size=11)
        if c == 1:
            cell.value = '=IF(C' + str(r) + '="","",ROW()-1)'
            a(cell, horizontal="center")
        elif c in (4, 5, 6, 15, 16):
            a(cell, horizontal="center")
        elif c in (2, 17, 18):
            a(cell, horizontal="center")
            cell.number_format = "YYYY-MM-DD"
        elif c == 13:
            a(cell, horizontal="center")
            cell.number_format = "0"
        elif c == 14:
            a(cell, horizontal="center")
            cell.number_format = "0.0"
        else:
            a(cell, horizontal="left")

dv_segment = DataValidation(
    type="list",
    formula1='"Zarzadcy nieruchomosci,Firmy budowlane,Agencje nieruchomosci,HR / Duzi pracodawcy"',
    allow_blank=True,
)
dv_segment.add("D2:D" + str(1 + N_ROWS))
ws.add_data_validation(dv_segment)

dv_priorytet = DataValidation(
    type="list",
    formula1='"TOP (zielony),Sredni (zolty),Niski (czerwony)"',
    allow_blank=True,
)
dv_priorytet.add("E2:E" + str(1 + N_ROWS))
ws.add_data_validation(dv_priorytet)

dzielnice = [
    "Bemowo", "Bialoleka", "Bielany", "Mokotow", "Ochota",
    "Praga-Poludnie", "Praga-Polnoc", "Rembertow", "Srodmiescie",
    "Targowek", "Ursus", "Ursynow", "Wawer", "Wesola",
    "Wilanow", "Wlochy", "Wola", "Zoliborz",
]
dv_dzielnica = DataValidation(
    type="list",
    formula1='"' + ",".join(dzielnice) + '"',
    allow_blank=True,
)
dv_dzielnica.add("F2:F" + str(1 + N_ROWS))
ws.add_data_validation(dv_dzielnica)

dv_zrodlo = DataValidation(
    type="list",
    formula1='"Google Maps,CEIDG,KRS,Panorama Firm,LinkedIn,Polecenie,Inne"',
    allow_blank=True,
)
dv_zrodlo.add("O2:O" + str(1 + N_ROWS))
ws.add_data_validation(dv_zrodlo)

dv_status = DataValidation(
    type="list",
    formula1='"Nowa,Zadzwoniono - brak odbioru,Zadzwoniono - rozmowa,W kontakcie,Zarejestrowana,Odrzucona,Callback"',
    allow_blank=True,
)
dv_status.add("P2:P" + str(1 + N_ROWS))
ws.add_data_validation(dv_status)

body_range = "A2:T" + str(1 + N_ROWS)

ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$E2="TOP (zielony)"'],
        fill=PatternFill("solid", start_color=GREEN_SOFT, end_color=GREEN_SOFT),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$E2="Sredni (zolty)"'],
        fill=PatternFill("solid", start_color=YELLOW_SOFT, end_color=YELLOW_SOFT),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$E2="Niski (czerwony)"'],
        fill=PatternFill("solid", start_color=RED_SOFT, end_color=RED_SOFT),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$P2="Zarejestrowana"'],
        font=Font(name=FONT_NAME, size=11, bold=True, color="1B5E20"),
        fill=PatternFill("solid", start_color="A5D6A7", end_color="A5D6A7"),
    ),
)
ws.conditional_formatting.add(
    body_range,
    FormulaRule(
        formula=['$P2="Odrzucona"'],
        font=Font(name=FONT_NAME, size=11, strike=True, color="757575"),
        fill=PatternFill("solid", start_color=GREY_SOFT, end_color=GREY_SOFT),
    ),
)
ws.conditional_formatting.add(
    "R2:R" + str(1 + N_ROWS),
    FormulaRule(
        formula=['AND($R2<>"",$R2<TODAY(),$P2<>"Zarejestrowana",$P2<>"Odrzucona")'],
        font=Font(name=FONT_NAME, size=11, bold=True, color="B71C1C"),
        fill=PatternFill("solid", start_color="FFCDD2", end_color="FFCDD2"),
    ),
)


# ============= ARKUSZ 3: SEGMENTY =============
ws = wb.create_sheet("Segmenty")
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 30
ws.column_dimensions["C"].width = 14
ws.column_dimensions["D"].width = 50
ws.column_dimensions["E"].width = 50

ws["B2"] = "4 segmenty B2B - ktorego dnia, do kogo, po co"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)

ws["B4"] = "Segment"
ws["C4"] = "Priorytet"
ws["D4"] = "Dlaczego ten segment"
ws["E4"] = "Kogo prosisz na linii"
for c in ("B4", "C4", "D4", "E4"):
    head(ws[c])

segments = [
    ("Zarzadcy nieruchomosci", "5 gwiazdek",
     "Ciagly bol (awarie w budynkach). Sami podejmuja decyzje. Malo technofobiczni "
     "(uzywaja juz ERP/CRM). Najwiekszy ROI z telefonu.",
     "Zarzadca ds. technicznych | Inspektor nadzoru | Konserwator | "
     "Prezes (male wspolnoty)"),
    ("Firmy budowlane / deweloperzy", "4 gwiazdki",
     "Kara umowna za opoznienie = ogromny bol. Stale szukaja podwykonawcow. "
     "Ale gatekeeperzy twardsi - trzeba sie przebic przez sekretariat.",
     "Kierownik budowy | Specjalista ds. zaopatrzenia | Dyrektor operacyjny | "
     "Wlasciciel (firmy do 10 osob)"),
    ("Agencje nieruchomosci", "3 gwiazdki",
     "Cykliczny bol (przed kazda sprzedaza cos trzeba naprawic). Nizsza pilnosc - "
     "poczekaja az cie sprawdza. Dobry segment na srodku tygodnia.",
     "Agent nieruchomosci (zwykle decyduje sam) | Manager biura | Dyrektor obslugi klienta"),
    ("HR / Duzi pracodawcy", "3 gwiazdki",
     "Fabryki, hotele, logistyka. Szukaja fachowcow stale. Ale cykl decyzyjny dlugi - "
     "dzialasz na dluzsza mete. Wysoka wartosc pojedynczego leadu.",
     "Specjalista HR (rekrutacja techniczna) | Kierownik utrzymania ruchu | "
     "Dyrektor techniczny | Recruitment Business Partner"),
]

row = 5
for seg, prio, why, who in segments:
    ws.row_dimensions[row].height = 85
    ws[f"B{row}"] = seg
    f(ws[f"B{row}"], size=12, bold=True)
    a(ws[f"B{row}"])
    ws[f"C{row}"] = prio
    a(ws[f"C{row}"], horizontal="center")
    f(ws[f"C{row}"], size=12)
    ws[f"D{row}"] = why
    f(ws[f"D{row}"], size=11)
    a(ws[f"D{row}"])
    ws[f"E{row}"] = who
    f(ws[f"E{row}"], size=11)
    a(ws[f"E{row}"])
    for col in ("B", "C", "D", "E"):
        ws[f"{col}{row}"].border = box
    row += 1

row += 2
ws[f"B{row}"] = "Kiedy dzwonic (per segment)"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":E" + str(row))
row += 1

cal_headers = ["Dzien", "Godzina", "Segment", "Uwaga"]
for i, h in enumerate(cal_headers):
    cell = ws.cell(row=row, column=2 + i, value=h)
    head(cell)
row += 1

calendar = [
    ("Poniedzialek", "9:00 - 10:30", "Zarzadcy nieruchomosci",
     "Po weekendzie maja swieza liste awarii"),
    ("Poniedzialek", "14:00 - 16:00", "Agencje nieruchomosci",
     "Klienci dzwonia rano - agent odbierze po obiedzie"),
    ("Wt / Sr / Czw", "10:00 - 11:30", "Firmy budowlane",
     "Kierownik budowy jest w biurze miedzy 10-12"),
    ("Wt / Sr / Czw", "13:00 - 15:00", "HR / Duzi pracodawcy",
     "Po obiedzie, przed koncem dnia rekrutera"),
    ("Piatek", "13:00 - 15:00", "Follow-upy + callbacki",
     "Nie nowe firmy w piatek po 15:00 (weekend w glowie)"),
]
for d, h_, s, u in calendar:
    ws.row_dimensions[row].height = 28
    ws.cell(row=row, column=2, value=d)
    ws.cell(row=row, column=3, value=h_)
    ws.cell(row=row, column=4, value=s)
    ws.cell(row=row, column=5, value=u)
    for c in range(2, 6):
        cell = ws.cell(row=row, column=c)
        f(cell, size=11)
        a(cell)
        cell.border = box
    row += 1

row += 1
ws[f"B{row}"] = ("NIE dzwonimy: Pon 8:00-9:00 (odprawa) | Pt po 16:00 (weekend) | "
                "Wt 11:45 (glodni) | swieta +/- 1 dzien")
f(ws[f"B{row}"], size=11, italic=True, color="B71C1C")
ws.merge_cells("B" + str(row) + ":E" + str(row))


# ============= ARKUSZ 4: GOOGLE MAPS WARSZAWA =============
ws = wb.create_sheet("Google Maps Warszawa")
ws.sheet_view.showGridLines = False

ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 18
ws.column_dimensions["C"].width = 42
ws.column_dimensions["D"].width = 42
ws.column_dimensions["E"].width = 42
ws.column_dimensions["F"].width = 42

ws["B2"] = "72 gotowe zapytania Google Maps - Warszawa (18 dzielnic x 4 segmenty)"
f(ws["B2"], size=17, bold=True, color=HEADER_BG)
ws["B3"] = ("Kliknij w link - Google Maps otworzy wyszukiwanie - "
            "skopiuj firme do arkusza [Lista firm].")
f(ws["B3"], size=11, italic=True, color="555555")

queries_per_segment = {
    "Zarzadcy nieruchomosci": [
        "zarzadca nieruchomosci {d} Warszawa",
        "spoldzielnia mieszkaniowa {d} Warszawa",
        "wspolnota mieszkaniowa {d} Warszawa",
    ],
    "Firmy budowlane": [
        "firma remontowa {d} Warszawa",
        "deweloper {d} Warszawa",
        "generalny wykonawca {d} Warszawa",
    ],
    "Agencje nieruchomosci": [
        "biuro nieruchomosci {d} Warszawa",
        "agencja nieruchomosci {d} Warszawa",
    ],
    "HR / Duzi pracodawcy": [
        "fabryka {d} Warszawa",
        "centrum logistyczne {d} Warszawa",
        "hotel {d} Warszawa",
    ],
}

row = 5
header_row = ["Dzielnica", "Zarzadcy nieruchomosci", "Firmy budowlane",
              "Agencje nieruchomosci", "HR / Duzi pracodawcy"]
ws.row_dimensions[row].height = 34
for i, h in enumerate(header_row):
    cell = ws.cell(row=row, column=2 + i, value=h)
    head(cell)
row += 1


def gmaps_url(q):
    return "https://www.google.com/maps/search/" + quote_plus(q)


segments_order = ["Zarzadcy nieruchomosci", "Firmy budowlane",
                  "Agencje nieruchomosci", "HR / Duzi pracodawcy"]

for d in dzielnice:
    ws.row_dimensions[row].height = 30
    c = ws.cell(row=row, column=2, value=d)
    f(c, size=12, bold=True, color=HEADER_BG)
    a(c, horizontal="center")
    c.border = box
    bg(c, ROW_ALT)
    for i, seg in enumerate(segments_order):
        qs = queries_per_segment[seg]
        q = qs[0].format(d=d)
        cell = ws.cell(row=row, column=3 + i)
        cell.value = '=HYPERLINK("' + gmaps_url(q) + '","SZUKAJ: ' + q + '")'
        f(cell, size=10, color="0B5394")
        a(cell, wrap=True)
        cell.border = box
    row += 1

row += 2
ws[f"B{row}"] = "Alternatywne zapytania (klikalne) - gdy pierwsza tura da malo wynikow"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":F" + str(row))
row += 1
ws.cell(row=row, column=2, value="Segment")
ws.cell(row=row, column=3, value="Dzielnica")
ws.cell(row=row, column=4, value="Alternatywa 2 / 3")
for col in (2, 3, 4):
    head(ws.cell(row=row, column=col))
ws.merge_cells("D" + str(row) + ":F" + str(row))
row += 1

for d in dzielnice:
    for seg in segments_order:
        qs = queries_per_segment[seg]
        if len(qs) <= 1:
            continue
        for q_template in qs[1:]:
            q = q_template.format(d=d)
            c1 = ws.cell(row=row, column=2, value=seg)
            c1.border = box
            f(c1, size=10)
            a(c1)
            c2 = ws.cell(row=row, column=3, value=d)
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


# ============= ARKUSZ 5: PLAN TYGODNIA =============
ws = wb.create_sheet("Plan tygodnia")
ws.sheet_view.showGridLines = False

ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 18
ws.column_dimensions["C"].width = 32
ws.column_dimensions["D"].width = 75

ws["B2"] = "Rhythm dnia - typowy dzien 8h (Pon-Pt)"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)

ws["B4"] = "Godzina"
ws["C4"] = "Co robisz"
ws["D4"] = "Cel"
for c in ("B4", "C4", "D4"):
    head(ws[c])

day_plan = [
    ("9:00 - 9:15", "Kawa, przeglad CRM-a",
     "Filtruj [Lista firm] po kolumnie [Data follow-up] - najstarsze na gore"),
    ("9:15 - 10:30", "Blok 1: 8-10 rozmow",
     "Rano = Zarzadcy nieruchomosci (najlepiej odbieraja)"),
    ("10:30 - 10:45", "Przerwa - spacer, woda",
     "Zapisz notatki z ostatnich 3 rozmow ZANIM zapomnisz"),
    ("10:45 - 12:00", "Blok 2: 8-10 rozmow",
     "Firmy budowlane (kierownik budowy w biurze)"),
    ("12:00 - 13:00", "Lunch",
     "Nie dzwon w czasie lunchu - inni tez jedza"),
    ("13:00 - 14:30", "Blok 3: 6-8 rozmow",
     "Agencje nieruchomosci LUB HR (wtorek / sroda / czwartek)"),
    ("14:30 - 15:00", "Follow-up",
     "Wyslij SMS-y z szablonow (patrz reklama/29-lista-firm-do-dzwonienia.md)"),
    ("15:00 - 16:00", "Research nowych firm",
     "Arkusz [Google Maps Warszawa] - dodaj 10-20 firm na jutro"),
]

row = 5
for t, co, cel in day_plan:
    ws.row_dimensions[row].height = 36
    ws[f"B{row}"] = t
    f(ws[f"B{row}"], size=11, bold=True, color=HEADER_BG)
    a(ws[f"B{row}"], horizontal="center")
    ws[f"C{row}"] = co
    f(ws[f"C{row}"], size=11, bold=True)
    a(ws[f"C{row}"])
    ws[f"D{row}"] = cel
    f(ws[f"D{row}"], size=11)
    a(ws[f"D{row}"])
    for c in ("B", "C", "D"):
        ws[f"{c}{row}"].border = box
    row += 1

row += 2
ws[f"B{row}"] = "Target tygodniowy (realny)"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

targets = [
    ("100-120", "Rozmow w tygodniu (20-25 / dzien)",
     "Nie wiecej - zmeczenie glosu = zly vibe rozmowy"),
    ("30-36", "Rozmow z decydentem (konwersja 30%)",
     "Reszta: sekretariat, brak odbioru, nieprawidlowy numer"),
    ("15-18", "Osob slucha do konca (50% z decydentow)",
     "To sa twoje realne szanse sprzedazowe"),
    ("5-6", "Nowych firm rejestruje sie (30% z sluchaczy)",
     "Tydzien sukcesu - 20+ / miesiac z telefonow"),
]

for n, co, uwaga in targets:
    ws.row_dimensions[row].height = 28
    ws[f"B{row}"] = n
    f(ws[f"B{row}"], size=16, bold=True, color=ACCENT_GREEN)
    a(ws[f"B{row}"], horizontal="center")
    ws[f"C{row}"] = co
    f(ws[f"C{row}"], size=11, bold=True)
    a(ws[f"C{row}"])
    ws[f"D{row}"] = uwaga
    f(ws[f"D{row}"], size=10, italic=True, color="555555")
    a(ws[f"D{row}"])
    for c in ("B", "C", "D"):
        ws[f"{c}{row}"].border = box
    row += 1


# ============= ARKUSZ 6: PRE-FLIGHT =============
ws = wb.create_sheet("Pre-flight")
ws.sheet_view.showGridLines = False

ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 6
ws.column_dimensions["C"].width = 95

ws["B2"] = "Pre-flight checklist - zanim zadzwonisz pierwszy raz"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)
ws["B3"] = ("Nie dzwonisz dopoki wszystko ponizej nie jest zafajkowane. "
            "Spali sie pierwsza rozmowa.")
f(ws["B3"], size=11, italic=True, color="555555")

checklist = [
    "Mam liste 50+ firm w arkuszu [Lista firm] (segment 1 lub 1+2)",
    "Kazda ZIELONA firma ma telefon, adres, 1-zdaniowa notatke z researchu (kolumna S)",
    "Kazda ZIELONA firma ma - jesli znalazlem - imie osoby kontaktowej (kolumna K)",
    "Mam wydrukowany scenariusz rozmowy (reklama/27-scenariusz-rozmowy-telefonicznej.md)",
    "Mam wydrukowana liste obiekcji (reklama/28-obsluga-obiekcji-telefon.md) OBOK telefonu",
    "Mam gotowe 5 szablonow SMS po rozmowie (reklama/29-lista-firm-do-dzwonienia.md)",
    "Mam gotowy szablon maila po rozmowie (reklama/20-email-onboarding.md)",
    "Wylaczone powiadomienia - telefon, laptop, Slack, cokolwiek co moze brzeknac",
    "Stoje lub siedze wyprostowany (sylwetka = glos = wiarygodnosc)",
    "Obok mam wode i notatnik (papierowy - szybciej niz wpisywanie do Excela w trakcie)",
    "Zrobilem 5 min rozgrzewki glosu (zaspiewac abc, otworzyc szczeke, spacer)",
    "Wiem ze pierwszy telefon bedzie NAJTRUDNIEJSZY - po 5. juz idzie plynnie",
]

row = 5
for item in checklist:
    ws.row_dimensions[row].height = 30
    ws[f"B{row}"] = "[  ]"
    f(ws[f"B{row}"], size=14, bold=True, color=ACCENT_GOLD)
    a(ws[f"B{row}"], horizontal="center")
    ws[f"B{row}"].border = box
    ws[f"C{row}"] = item
    f(ws[f"C{row}"], size=12)
    a(ws[f"C{row}"])
    ws[f"C{row}"].border = box
    row += 1

row += 2
ws[f"B{row}"] = "!"
f(ws[f"B{row}"], size=20, bold=True, color="B71C1C")
a(ws[f"B{row}"], horizontal="center")
ws[f"C{row}"] = ("Zasada: dzien 1 = 10 telefonow z ZIELONYCH. Nie cala lista. "
                 "Nie 50 naraz. 10. Zmierz czas. Zapisz notatki. Jutro 15. "
                 "Piatego dnia masz juz flow.")
f(ws[f"C{row}"], size=12, bold=True, color="B71C1C")
a(ws[f"C{row}"])
bg(ws[f"C{row}"], YELLOW_SOFT)


# ============= ARKUSZ 7: METRYKI =============
ws = wb.create_sheet("Metryki")
ws.sheet_view.showGridLines = False

ws.column_dimensions["A"].width = 4
ws.column_dimensions["B"].width = 45
ws.column_dimensions["C"].width = 18
ws.column_dimensions["D"].width = 52

ws["B2"] = "Metryki - auto-liczone z arkusza [Lista firm]"
f(ws["B2"], size=18, bold=True, color=HEADER_BG)
ws["B3"] = "Formuly zliczaja sie same. Wypelnij Lista firm, wroc tutaj, zobacz progres."
f(ws["B3"], size=11, italic=True, color="555555")

row = 5
ws[f"B{row}"] = "Lejek sprzedazy - aktualny stan"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

LF = "'Lista firm'"

metrics = [
    ("Firmy w bazie (lacznie)",
     '=COUNTA(' + LF + '!C2:C301)',
     "Ile firm w ogole masz w CRM"),
    ("Z czego TOP (zielony)",
     '=COUNTIF(' + LF + '!E2:E301,"TOP (zielony)")',
     "Do tych dzwonisz jako pierwsze"),
    ("Z czego Sredni (zolty)",
     '=COUNTIF(' + LF + '!E2:E301,"Sredni (zolty)")',
     "Druga kolejka"),
    ("Z czego Niski (czerwony)",
     '=COUNTIF(' + LF + '!E2:E301,"Niski (czerwony)")',
     "Pomijasz na start"),
    ("", "", ""),
    ("Zadzwoniono (lacznie)",
     ('=COUNTIF(' + LF + '!P2:P301,"Zadzwoniono - brak odbioru")'
      '+COUNTIF(' + LF + '!P2:P301,"Zadzwoniono - rozmowa")'
      '+COUNTIF(' + LF + '!P2:P301,"W kontakcie")'
      '+COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")'
      '+COUNTIF(' + LF + '!P2:P301,"Odrzucona")'
      '+COUNTIF(' + LF + '!P2:P301,"Callback")'),
     "Liczba firm gdzie podjales probe"),
    ("Rozmowa z decydentem",
     ('=COUNTIF(' + LF + '!P2:P301,"Zadzwoniono - rozmowa")'
      '+COUNTIF(' + LF + '!P2:P301,"W kontakcie")'
      '+COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")'
      '+COUNTIF(' + LF + '!P2:P301,"Odrzucona")'
      '+COUNTIF(' + LF + '!P2:P301,"Callback")'),
     "Gdzie rozmowa faktycznie sie odbyla"),
    ("Zarejestrowane firmy",
     '=COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")',
     "TWOJE WYGRANE - ten numer rosnie"),
    ("Odrzucone",
     '=COUNTIF(' + LF + '!P2:P301,"Odrzucona")',
     "Uczysz sie na bledach - zobacz notatki z rozmowy"),
    ("W kontakcie / callback",
     ('=COUNTIF(' + LF + '!P2:P301,"W kontakcie")'
      '+COUNTIF(' + LF + '!P2:P301,"Callback")'),
     "Pilnuj daty follow-up - sam cie podswietli na czerwono"),
]

for label, formula, note in metrics:
    if not label:
        row += 1
        continue
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

row += 2
ws[f"B{row}"] = "Konwersje (auto)"
section(ws[f"B{row}"])
ws.merge_cells("B" + str(row) + ":D" + str(row))
row += 1

decydent = ('COUNTIF(' + LF + '!P2:P301,"Zadzwoniono - rozmowa")'
            '+COUNTIF(' + LF + '!P2:P301,"W kontakcie")'
            '+COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")'
            '+COUNTIF(' + LF + '!P2:P301,"Odrzucona")'
            '+COUNTIF(' + LF + '!P2:P301,"Callback")')
zadzwoniono = ('COUNTIF(' + LF + '!P2:P301,"Zadzwoniono - brak odbioru")'
               '+COUNTIF(' + LF + '!P2:P301,"Zadzwoniono - rozmowa")'
               '+COUNTIF(' + LF + '!P2:P301,"W kontakcie")'
               '+COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")'
               '+COUNTIF(' + LF + '!P2:P301,"Odrzucona")'
               '+COUNTIF(' + LF + '!P2:P301,"Callback")')

conversions = [
    ("% dodzwanialnosci (decydent / zadzwoniono)",
     '=IFERROR((' + decydent + ')/(' + zadzwoniono + '),0)',
     "Cel: 30%. Jesli <20% - dzwonisz nie w tych godzinach, sprawdz [Plan tygodnia]."),
    ("% rejestracji (zarejestrowana / decydent)",
     '=IFERROR(COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")/(' + decydent + '),0)',
     "Cel: 15-30%. Jesli <10% - skrypt nie dziala, zobacz reklama/28-obsluga-obiekcji."),
    ("% end-to-end (zarejestrowana / firmy w bazie)",
     '=IFERROR(COUNTIF(' + LF + '!P2:P301,"Zarejestrowana")/COUNTA(' + LF + '!C2:C301),0)',
     "Cel: 5%. Mierz na poziomie miesiacznym - pojedynczy dzien ma za malo danych."),
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


wb.active = 0
wb.save(OUT)
print("SAVED:", OUT)
