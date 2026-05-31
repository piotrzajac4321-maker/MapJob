"""Build prettified Warszawa CRM from v5, adding progress tracking and interest rating."""
from openpyxl import load_workbook, Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, NamedStyle
from openpyxl.formatting.rule import CellIsRule, FormulaRule, ColorScaleRule
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from copy import copy

SRC = 'MapJob-Warszawa-Lista-Firm-CRM-WYPELNIONY-v5.xlsx'
DST = 'MapJob-Warszawa-CRM-LADNY.xlsx'

# ─── Kolory (spójna paleta MapJob) ───
BRAND_DARK = '1E3A5F'       # navy - headery
BRAND_MID = '2E6FB4'        # blue - subheadery
BRAND_ACCENT = 'F5A623'     # gold - ważne akcenty
OK_GREEN = '2E7D32'
OK_BG = 'DCEDC8'
WARN_YELLOW = 'F9A825'
WARN_BG = 'FFF9C4'
BAD_RED = 'C62828'
BAD_BG = 'FFCDD2'
COLD_BLUE = '42A5F5'
COLD_BG = 'BBDEFB'
HOT_ORANGE = 'E65100'
HOT_BG = 'FFE0B2'
FIRE_RED = 'B71C1C'
FIRE_BG = 'FFCDD2'
NEUTRAL_GREY = 'E0E0E0'
SOFT_BG = 'F5F5F5'
WHITE = 'FFFFFF'

FONT_NAME = 'Calibri'

thin = Side(style='thin', color='BDBDBD')
medium = Side(style='medium', color=BRAND_DARK)
box_border = Border(left=thin, right=thin, top=thin, bottom=thin)
header_border = Border(left=medium, right=medium, top=medium, bottom=medium)

def style_header(cell, fill=BRAND_DARK, color=WHITE, size=11, bold=True):
    cell.font = Font(name=FONT_NAME, size=size, bold=bold, color=color)
    cell.fill = PatternFill('solid', start_color=fill)
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = box_border

def style_body(cell, size=10, bold=False, italic=False, color='000000', fill=None, wrap=True, align='left'):
    cell.font = Font(name=FONT_NAME, size=size, bold=bold, italic=italic, color=color)
    if fill:
        cell.fill = PatternFill('solid', start_color=fill)
    cell.alignment = Alignment(horizontal=align, vertical='center', wrap_text=wrap)
    cell.border = box_border

def style_title(cell, size=18):
    cell.font = Font(name=FONT_NAME, size=size, bold=True, color=BRAND_DARK)
    cell.alignment = Alignment(horizontal='left', vertical='center')

# ─── Wczytaj źródło ───
src_wb = load_workbook(SRC, data_only=True)

# Wczytaj pełne dane z „Lista firm"
src_lista = src_wb['Lista firm']
lista_rows = [list(r) for r in src_lista.iter_rows(values_only=True)]
lista_header = lista_rows[0]  # Lp, Data dodania, Nazwa, Segment, Priorytet, Dzielnica, Telefon, Email, WWW, Adres, Osoba, Stanowisko, Opinie#, Gwiazdki, Zrodlo, Status, Data kontaktu, Follow-up, Research, Notatki
lista_data = lista_rows[1:]

# Zachowaj „Google Maps Warszawa"
src_maps = src_wb['Google Maps Warszawa']
maps_rows = [list(r) for r in src_maps.iter_rows(values_only=True)]

# ─── Nowy workbook ───
wb = Workbook()
wb.remove(wb.active)

# ══════════════════════════════════════════════════════════════════
# SHEET 1: START TUTAJ
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('🎯 Start tutaj')
s.sheet_view.showGridLines = False

s.column_dimensions['A'].width = 3
s.column_dimensions['B'].width = 28
s.column_dimensions['C'].width = 80

s['B2'] = 'MapJob — Warszawa B2B CRM'
style_title(s['B2'], size=22)
s.merge_cells('B2:C2')
s.row_dimensions[2].height = 34

s['B3'] = 'Cold-calling CRM: 734 firmy, 4 segmenty, gotowy scenariusz'
s['B3'].font = Font(name=FONT_NAME, size=12, italic=True, color='555555')
s.merge_cells('B3:C3')

s['B5'] = '📋 Jak używać tego pliku'
style_header(s['B5'], fill=BRAND_MID, size=13)
s.merge_cells('B5:C5')
s.row_dimensions[5].height = 26

steps = [
    ('1', 'Idź do arkusza „📞 Lista firm" — to serce CRM-a. 734 firmy już czekają.'),
    ('2', 'Filtruj po kolumnie „Priorytet" = „TOP (zielony)" — to najpierw.'),
    ('3', 'Dzwonisz do firmy → otwierasz arkusz „🎤 Jak rozmawiać" i jedziesz scenariusz.'),
    ('4', 'Po rozmowie: w „Lista firm" zaznacz „✅ Wykonane" i wybierz „🔥 Zainteresowanie" (1-5).'),
    ('5', 'Wpisz krótko notatkę z rozmowy + datę follow-up (jeśli umówiłeś callback).'),
    ('6', 'Wracaj do arkusza „📊 Metryki" — zobacz jak rośnie lejek.'),
]
r = 7
for num, txt in steps:
    s.cell(row=r, column=2, value=f'Krok {num}')
    style_body(s.cell(row=r, column=2), bold=True, fill=BRAND_DARK, color=WHITE, align='center')
    s.cell(row=r, column=3, value=txt)
    style_body(s.cell(row=r, column=3))
    s.row_dimensions[r].height = 22
    r += 1

r += 1
s.cell(row=r, column=2, value='⚡ Zasada nr 1')
style_header(s.cell(row=r, column=2), fill=BRAND_ACCENT, color=BRAND_DARK, size=12)
s.cell(row=r, column=3, value='Dzień 1 = 10 telefonów. Nie 50. Nie 30. DZIESIĘĆ. Zmierz czas, zapisz notatki. Jutro 15. Piątego dnia masz flow.')
style_body(s.cell(row=r, column=3), bold=True, fill=WARN_BG)
s.row_dimensions[r].height = 36
r += 2

s.cell(row=r, column=2, value='🛑 Zasada nr 2')
style_header(s.cell(row=r, column=2), fill=BAD_RED, color=WHITE, size=12)
s.cell(row=r, column=3, value='Nigdy nie kłam o produkcie. Nie mamy 42 tys. fachowców. „Startujemy w Polsce" > fake liczby.')
style_body(s.cell(row=r, column=3), bold=True, fill=BAD_BG)
s.row_dimensions[r].height = 36
r += 2

s.cell(row=r, column=2, value='🎯 Cel tygodnia')
style_header(s.cell(row=r, column=2), fill=OK_GREEN, color=WHITE, size=12)
s.cell(row=r, column=3, value='100-120 rozmów · 30-36 z decydentem · 15-18 słucha do końca · 5-6 nowych rejestracji')
style_body(s.cell(row=r, column=3), bold=True, fill=OK_BG)
s.row_dimensions[r].height = 36

# ══════════════════════════════════════════════════════════════════
# SHEET 2: JAK ROZMAWIAĆ (cheat sheet)
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('🎤 Jak rozmawiać')
s.sheet_view.showGridLines = False
s.column_dimensions['A'].width = 3
s.column_dimensions['B'].width = 22
s.column_dimensions['C'].width = 95

s['B2'] = '🎤 Cheat sheet rozmowy telefonicznej'
style_title(s['B2'], size=20)
s.merge_cells('B2:C2')
s.row_dimensions[2].height = 30

s['B3'] = 'Pełny scenariusz w reklama/27-scenariusz-rozmowy-telefonicznej.md — tutaj najkrótsza wersja do patrzenia podczas dzwonienia.'
s['B3'].font = Font(name=FONT_NAME, size=11, italic=True, color='555555')
s.merge_cells('B3:C3')

# ═ Otwarcie ═
r = 5
s.cell(row=r, column=2, value='⚡ PIERWSZE 10 SEKUND')
style_header(s.cell(row=r, column=2), fill=BRAND_ACCENT, color=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

opener_lines = [
    ('Mówisz tak:', '„Dzień dobry, Paweł z MapJob — mam do Pana jedno krótkie pytanie, mam minutę?"'),
    ('NIE mówisz:', '„Dzień dobry, dzwonię z działu marketingu firmy MapJob i chciałbym przedstawić..." ← brzmi jak bot, odłoży słuchawkę.'),
    ('Jeśli „tak":', 'Jedziesz z DISCOVERY (ich ból → ich rozwiązanie).'),
    ('Jeśli „teraz nie mogę":', '„Rozumiem, kiedy mogę oddzwonić — rano czy po południu?" (pytasz KIEDY, nie CZY).'),
    ('Jeśli „o co chodzi?":', 'Przechodzisz od razu do HAKA segmentu.'),
]
for k, v in opener_lines:
    s.cell(row=r, column=2, value=k)
    style_body(s.cell(row=r, column=2), bold=True, fill=SOFT_BG, align='right')
    s.cell(row=r, column=3, value=v)
    style_body(s.cell(row=r, column=3))
    s.row_dimensions[r].height = 32
    r += 1

# ═ 6 kroków ═
r += 1
s.cell(row=r, column=2, value='🧭 STRUKTURA ROZMOWY — 6 KROKÓW (3-5 min, max 7)')
style_header(s.cell(row=r, column=2), fill=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

steps6 = [
    ('KROK 0 · Gatekeeper', 'Mów ROLĄ nie stanowiskiem: „Kto zajmuje się u Państwa konserwacją budynków?" (NIE: „połącz z prezesem").'),
    ('KROK 1 · Otwarcie (15s)', '„Dzień dobry Panie [imię], Paweł z MapJob. Mam jedno krótkie pytanie — mam minutę?" ↳ czekasz na „tak".'),
    ('KROK 2 · Discovery (30-60s)', 'Zadajesz 1-3 pytania o ich ból. SŁUCHASZ, NIE MÓWISZ. Zapisujesz odpowiedzi na kartce.'),
    ('KROK 3 · Pitch dopasowany (30s)', 'POWTARZASZ jego ból, potem rozwiązanie: „Czyli jak dobrze rozumiem — [ich ból]. Zrobiliśmy MapJob właśnie dlatego..."'),
    ('KROK 4 · Uprzedzanie obiekcji (15s)', 'Sam rzucasz „za darmo, gdzie haczyk" ZANIM on to powie. „Apka startuje w Polsce, Pana pierwszy pin zostanie zawsze darmowy."'),
    ('KROK 5 · Close (20s)', 'NIE: „czy jest Pan zainteresowany". TAK: „Wyślę link SMS-em czy mailem, co wygodniej?" + konkretny callback („piątek 15:00").'),
    ('KROK 6 · Przypieczętowanie', '„Dzięki, SMS leci teraz." Rozłącz pierwszy. W 60s wyślij SMS z linkiem.'),
]
for k, v in steps6:
    s.cell(row=r, column=2, value=k)
    style_body(s.cell(row=r, column=2), bold=True, fill=BRAND_MID, color=WHITE, align='center')
    s.cell(row=r, column=3, value=v)
    style_body(s.cell(row=r, column=3))
    s.row_dimensions[r].height = 40
    r += 1

# ═ 4 segmenty - haki ═
r += 1
s.cell(row=r, column=2, value='🎯 4 SEGMENTY — HAK OTWIERAJĄCY (pytanie DISCOVERY)')
style_header(s.cell(row=r, column=2), fill=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

segs = [
    ('🏢 Zarządcy nieruchomości', '„Ile czasu Panu zajmuje znalezienie elektryka, kiedy coś pilnie siądzie w bloku wieczorem?"', OK_BG),
    ('🏗️ Firmy budowlane', '„Jak często zdarza się, że podwykonawca nie wyrabia terminu i musicie go w 48h zastąpić?"', WARN_BG),
    ('🏠 Agencje nieruchomości', '„Kiedy klient prosi o odmalowanie przed sprzedażą — kto u Państwa szuka fachowca i ile to trwa?"', COLD_BG),
    ('👔 HR / duzi pracodawcy', '„Ile CV dziennie dostajecie z OLX, z tego ile realnie ma SEP/UDT/uprawnienia spawalnicze?"', HOT_BG),
]
for seg, hook, bg in segs:
    s.cell(row=r, column=2, value=seg)
    style_body(s.cell(row=r, column=2), bold=True, fill=bg, align='center')
    s.cell(row=r, column=3, value=hook)
    style_body(s.cell(row=r, column=3), italic=True, fill=bg)
    s.row_dimensions[r].height = 36
    r += 1

# ═ 8 obiekcji ═
r += 1
s.cell(row=r, column=2, value='🛡️ TOP 8 OBIEKCJI — KRÓTKIE ODPOWIEDZI')
style_header(s.cell(row=r, column=2), fill=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

objections = [
    ('„Nie mam czasu"', '„Rozumiem. 2 sekundy — kiedy mogę oddzwonić, rano czy po południu?"'),
    ('„Wyślij mi maila"', '„Oczywiście, ale zanim wyślę — jedno pytanie, żebym wysłał to co Panu pasuje, a nie generyczny mail: [pytanie discovery]."'),
    ('„Mamy już OLX/Oferia"', '„Super, zna Pan temat. MapJob: ZERO kredytów kontaktowych, klient pisze wprost. Uzupełnienie, nie zamiennik."'),
    ('„Nie potrzebujemy"', '„Rozumiem. Ostatnie pytanie — za 3 miesiące na pilną awarię byłoby fajnie mieć gotową listę, tak? Wysyłam link, żadnych zobowiązań."'),
    ('„Za darmo = kiepskie"', '„Uczciwa uwaga. Apka startuje w Polsce, zbieramy użytkowników. Pana podstawowe konto zostanie ZAWSZE darmowe — na mailu obiecuję."'),
    ('„Sprzedacie moje dane"', '„Polska baza, serwery UE, zero reklam na zewnątrz, zero sprzedaży do brokerów. Polityka prywatności leci razem z linkiem."'),
    ('„Muszę zapytać wspólnika"', '„Oczywiście. SMS-em: link do apki + wizytówka. Oddzwonię w piątek, zapytam jaką mieli Państwo rozmowę. Pasuje?"'),
    ('„A jak nie zadziała?"', '„To zabraliśmy sobie 5 minut. Apka za darmo, konto usuwa się w 1 kliknięciu. Nie ryzykuje Pan ani grosza."'),
]
for q, a in objections:
    s.cell(row=r, column=2, value=q)
    style_body(s.cell(row=r, column=2), bold=True, italic=True, fill=BAD_BG)
    s.cell(row=r, column=3, value=a)
    style_body(s.cell(row=r, column=3), fill=OK_BG)
    s.row_dimensions[r].height = 38
    r += 1

# ═ 7 zasad technicznych ═
r += 1
s.cell(row=r, column=2, value='🧠 7 ZASAD TECHNICZNYCH')
style_header(s.cell(row=r, column=2), fill=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

tech_rules = [
    ('1. Tempo mowy', '130-150 słów/min. ZWOLNIJ. Pauzuj po każdym zdaniu.'),
    ('2. Intonacja', 'Opadająca na asercjach („zapisuję Pana kontakt"). Wznosząca na pytaniach („pasuje 15?").'),
    ('3. Imię rozmówcy', 'Max 3× w rozmowie. Więcej = brzmisz jak cold-call bot.'),
    ('4. Słowa-pasożyty', 'Wyrzuć „uhm", „wiesz", „jakby". Nagraj pierwszą rozmowę → posłuchaj → będzie bolało.'),
    ('5. Stój podczas rozmowy', 'Dosłownie. Głos brzmi pewniej. Test NASA — serio.'),
    ('6. Uśmiechaj się', 'Ludzie SŁYSZĄ uśmiech w głosie. Postaw lustro obok telefonu.'),
    ('7. NIE KŁAM', 'Nigdy „mamy 5000 firm" jeśli macie 50. Wyczują. Prawda > piękna historia.'),
]
for k, v in tech_rules:
    s.cell(row=r, column=2, value=k)
    style_body(s.cell(row=r, column=2), bold=True, fill=SOFT_BG, align='right')
    s.cell(row=r, column=3, value=v)
    style_body(s.cell(row=r, column=3))
    s.row_dimensions[r].height = 28
    r += 1

# ═ 3 zamknięcia ═
r += 1
s.cell(row=r, column=2, value='🎁 3 ZAMKNIĘCIA — zawsze kończ Z KLASĄ')
style_header(s.cell(row=r, column=2), fill=OK_GREEN, color=WHITE, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

closes = [
    ('✅ Weszli w temat', '„Super, Panie Andrzeju. Dzięki za czas, SMS leci teraz. Miłego dnia!"'),
    ('🤔 Zastanawiają się', '„Dzięki za rozmowę, Panie Tomaszu. Link prześlę, a w piątek zadzwonię sprawdzić, czy miał Pan chwilę zerknąć."'),
    ('❌ Mówią nie', '„Rozumiem, Pani Magdo. Gdyby za kilka miesięcy coś się zmieniło — numer ma Pani zapisany. Dzięki za czas, do usłyszenia!"'),
]
for k, v in closes:
    s.cell(row=r, column=2, value=k)
    style_body(s.cell(row=r, column=2), bold=True, fill=OK_BG, align='center')
    s.cell(row=r, column=3, value=v)
    style_body(s.cell(row=r, column=3), italic=True)
    s.row_dimensions[r].height = 34
    r += 1

# ═ SMS po rozmowie ═
r += 1
s.cell(row=r, column=2, value='📱 SMS W 60 SEKUND PO ROZŁĄCZENIU')
style_header(s.cell(row=r, column=2), fill=BRAND_ACCENT, color=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:C{r}')
s.row_dimensions[r].height = 26
r += 1

sms_template = '''Cześć Panie [imię], tu Paweł z MapJob.
Link: https://mapjob.pl
Zaloguj kontem Google → 2 sek.
Oddzwonię w [dzień godzina]. Pozdrawiam!'''
s.cell(row=r, column=2, value='Szablon SMS')
style_body(s.cell(row=r, column=2), bold=True, fill=SOFT_BG, align='right')
s.cell(row=r, column=3, value=sms_template)
style_body(s.cell(row=r, column=3), fill=WARN_BG)
s.row_dimensions[r].height = 70

# ══════════════════════════════════════════════════════════════════
# SHEET 3: LISTA FIRM
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('📞 Lista firm')
s.sheet_view.showGridLines = False
s.freeze_panes = 'D2'  # zamroź pierwszy wiersz + kolumny Lp, Data, Nazwa

# Definicja nowych kolumn: 20 starych + 3 nowe (Wykonane, Zainteresowanie, Następny krok)
new_header = [
    'Lp',                       # A
    '✅',                        # B - Wykonane (checkbox)
    '🔥 Zainter.',               # C - Stopień zainteresowania 1-5
    'Data dodania',             # D
    'Nazwa firmy',              # E
    'Segment',                  # F
    'Priorytet',                # G
    'Dzielnica',                # H
    'Telefon',                  # I
    'Email',                    # J
    'Strona www',               # K
    'Adres',                    # L
    'Osoba kontaktowa',         # M
    'Stanowisko',               # N
    'Opinie #',                 # O
    '★ Google',                 # P
    'Źródło',                   # Q
    'Status',                   # R
    '💡 Podpowiedź',            # S - hint per segment
    'Data ostat. kontaktu',     # T
    'Data follow-up',           # U
    'Research (90 sek)',        # V
    'Notatki z rozmowy',        # W
    'Następny krok',            # X
]

col_widths = {
    'A': 5, 'B': 5, 'C': 11, 'D': 11, 'E': 38, 'F': 22, 'G': 16, 'H': 16,
    'I': 16, 'J': 24, 'K': 22, 'L': 28, 'M': 22, 'N': 28, 'O': 8, 'P': 9,
    'Q': 13, 'R': 14, 'S': 40, 'T': 12, 'U': 12, 'V': 42, 'W': 42, 'X': 28,
}
for col, w in col_widths.items():
    s.column_dimensions[col].width = w

# Header
for i, h in enumerate(new_header, start=1):
    c = s.cell(row=1, column=i, value=h)
    style_header(c, fill=BRAND_DARK, size=11)
s.row_dimensions[1].height = 38

# Podpowiedź per segment
segment_hints = {
    'Zarzadcy nieruchomosci': 'HAK: „Ile czasu Panu zajmuje znalezienie elektryka, kiedy coś pilnie siądzie w bloku wieczorem?" · OSOBA: Zarządca techniczny / Inspektor nadzoru / Konserwator · DZWOŃ: Pon 9:00-10:30.',
    'Zarządcy nieruchomości': 'HAK: „Ile czasu Panu zajmuje znalezienie elektryka, kiedy coś pilnie siądzie w bloku wieczorem?" · OSOBA: Zarządca techniczny / Inspektor nadzoru / Konserwator · DZWOŃ: Pon 9:00-10:30.',
    'Firmy budowlane / deweloperzy': 'HAK: „Jak często podwykonawca zawala termin i musicie go w 48h zastąpić?" · OSOBA: Kierownik budowy / Zaopatrzenie / Dyr. operacyjny · DZWOŃ: Wt-Czw 10:00-11:30.',
    'Firmy budowlane': 'HAK: „Jak często podwykonawca zawala termin i musicie go w 48h zastąpić?" · OSOBA: Kierownik budowy / Zaopatrzenie / Dyr. operacyjny · DZWOŃ: Wt-Czw 10:00-11:30.',
    'Agencje nieruchomosci': 'HAK: „Kto u Państwa szuka fachowca, gdy klient prosi o odmalowanie przed zakupem?" · OSOBA: Agent (zwykle sam decyduje) / Manager biura · DZWOŃ: Pon 14:00-16:00.',
    'Agencje nieruchomości': 'HAK: „Kto u Państwa szuka fachowca, gdy klient prosi o odmalowanie przed zakupem?" · OSOBA: Agent (zwykle sam decyduje) / Manager biura · DZWOŃ: Pon 14:00-16:00.',
    'HR / Duzi pracodawcy': 'HAK: „Ile CV dziennie z OLX, ile realnie z SEP/UDT?" · OSOBA: Specjalista HR / Kier. utrzymania ruchu / Dyr. techniczny · DZWOŃ: Wt-Czw 13:00-15:00.',
    'HR / Duzi pracodawcy (fabryki, hotele, logistyka)': 'HAK: „Ile CV dziennie z OLX, ile realnie z SEP/UDT?" · OSOBA: Specjalista HR / Kier. utrzymania ruchu / Dyr. techniczny · DZWOŃ: Wt-Czw 13:00-15:00.',
    'HR / rekruterzy': 'HAK: „Ile CV dziennie z OLX, ile realnie z SEP/UDT?" · OSOBA: Specjalista HR / Kier. utrzymania ruchu / Dyr. techniczny · DZWOŃ: Wt-Czw 13:00-15:00.',
}
default_hint = 'HAK: zapytaj o ich najpilniejszy problem z fachowcami. Słuchaj więcej niż mówisz. Discovery najpierw, pitch potem.'

# Zapisz dane
for idx, row_data in enumerate(lista_data, start=2):
    # row_data ma 20 kolumn w v5
    # Mapping do nowych pozycji:
    # 0:Lp 1:Data 2:Nazwa 3:Segment 4:Priorytet 5:Dzielnica 6:Tel 7:Email 8:WWW 9:Adres
    # 10:Osoba 11:Stanowisko 12:Opinie# 13:Gwiazdki 14:Zrodlo 15:Status 16:Data kontaktu
    # 17:Data follow-up 18:Research 19:Notatki
    lp = idx - 1  # Lp = 1, 2, 3…
    segment = row_data[3] or ''
    hint = segment_hints.get(segment, default_hint)

    s.cell(row=idx, column=1, value=lp)
    s.cell(row=idx, column=2, value='⬜')  # Wykonane
    s.cell(row=idx, column=3, value='')     # Zainteresowanie
    s.cell(row=idx, column=4, value=row_data[1])   # Data dodania
    s.cell(row=idx, column=5, value=row_data[2])   # Nazwa
    s.cell(row=idx, column=6, value=row_data[3])   # Segment
    s.cell(row=idx, column=7, value=row_data[4])   # Priorytet
    s.cell(row=idx, column=8, value=row_data[5])   # Dzielnica
    s.cell(row=idx, column=9, value=row_data[6])   # Telefon
    s.cell(row=idx, column=10, value=row_data[7])  # Email
    s.cell(row=idx, column=11, value=row_data[8])  # WWW
    s.cell(row=idx, column=12, value=row_data[9])  # Adres
    s.cell(row=idx, column=13, value=row_data[10]) # Osoba
    s.cell(row=idx, column=14, value=row_data[11]) # Stanowisko
    s.cell(row=idx, column=15, value=row_data[12]) # Opinie#
    s.cell(row=idx, column=16, value=row_data[13]) # Gwiazdki
    s.cell(row=idx, column=17, value=row_data[14]) # Zrodlo
    s.cell(row=idx, column=18, value=row_data[15] or 'Nowa') # Status
    s.cell(row=idx, column=19, value=hint)         # Podpowiedź
    s.cell(row=idx, column=20, value=row_data[16]) # Data kontaktu
    s.cell(row=idx, column=21, value=row_data[17]) # Follow-up
    s.cell(row=idx, column=22, value=row_data[18]) # Research
    s.cell(row=idx, column=23, value=row_data[19]) # Notatki
    s.cell(row=idx, column=24, value='')           # Następny krok

# Stylowanie wierszy danych
last_row = 1 + len(lista_data)
for row in s.iter_rows(min_row=2, max_row=last_row, min_col=1, max_col=24):
    for c in row:
        col_letter = c.column_letter
        size = 9 if col_letter in ('S', 'V', 'W', 'X') else 10
        align = 'center' if col_letter in ('A', 'B', 'C', 'O', 'P', 'T', 'U') else 'left'
        bold = col_letter in ('E', 'G')
        c.font = Font(name=FONT_NAME, size=size, bold=bold)
        c.alignment = Alignment(horizontal=align, vertical='center', wrap_text=True)
        c.border = box_border

# Zebra-striping bardzo lekkie
for rn in range(2, last_row + 1):
    if rn % 2 == 0:
        for col in range(1, 25):
            c = s.cell(row=rn, column=col)
            if c.fill.patternType is None:
                c.fill = PatternFill('solid', start_color='FAFAFA')

# ─── Dropdowns / Data validation ───
# B: Wykonane (⬜/✅)
dv_done = DataValidation(type='list', formula1='"⬜,✅"', allow_blank=True)
dv_done.add(f'B2:B{last_row}')
s.add_data_validation(dv_done)

# C: Zainteresowanie 1-5
dv_int = DataValidation(
    type='list',
    formula1='"❄️ 1 Zimny,🧊 2 Chłodny,🌡️ 3 Letni,🔥 4 Ciepły,🚀 5 Gorący"',
    allow_blank=True,
)
dv_int.add(f'C2:C{last_row}')
s.add_data_validation(dv_int)

# R: Status
dv_status = DataValidation(
    type='list',
    formula1='"Nowa,W kontakcie,Callback,Link wyslany,Zarejestrowana,Odrzucona,Zly numer,Nie dzwonic"',
    allow_blank=True,
)
dv_status.add(f'R2:R{last_row}')
s.add_data_validation(dv_status)

# G: Priorytet
dv_prio = DataValidation(
    type='list',
    formula1='"TOP (zielony),Sredni (zolty),Niski (czerwony)"',
    allow_blank=True,
)
dv_prio.add(f'G2:G{last_row}')
s.add_data_validation(dv_prio)

# ─── Conditional formatting ───
# Kolumna B: ✅ → zielony
s.conditional_formatting.add(
    f'B2:B{last_row}',
    FormulaRule(formula=[f'$B2="✅"'],
                fill=PatternFill('solid', start_color=OK_GREEN),
                font=Font(name=FONT_NAME, size=12, bold=True, color=WHITE))
)

# Kolumna C: 5 poziomów ciepła
interest_colors = [
    ('❄️ 1 Zimny',   COLD_BLUE, WHITE),
    ('🧊 2 Chłodny', '81C784', '000000'),
    ('🌡️ 3 Letni',   'FFF176', '000000'),
    ('🔥 4 Ciepły',  'FF8A65', WHITE),
    ('🚀 5 Gorący',  FIRE_RED, WHITE),
]
for label, fill, fg in interest_colors:
    s.conditional_formatting.add(
        f'C2:C{last_row}',
        FormulaRule(formula=[f'$C2="{label}"'],
                    fill=PatternFill('solid', start_color=fill),
                    font=Font(name=FONT_NAME, size=10, bold=True, color=fg))
    )

# Kolumna G: priorytet
s.conditional_formatting.add(
    f'G2:G{last_row}',
    FormulaRule(formula=[f'$G2="TOP (zielony)"'],
                fill=PatternFill('solid', start_color=OK_BG),
                font=Font(name=FONT_NAME, size=10, bold=True, color=OK_GREEN))
)
s.conditional_formatting.add(
    f'G2:G{last_row}',
    FormulaRule(formula=[f'$G2="Sredni (zolty)"'],
                fill=PatternFill('solid', start_color=WARN_BG),
                font=Font(name=FONT_NAME, size=10, bold=True, color='8D6E00'))
)
s.conditional_formatting.add(
    f'G2:G{last_row}',
    FormulaRule(formula=[f'$G2="Niski (czerwony)"'],
                fill=PatternFill('solid', start_color=BAD_BG),
                font=Font(name=FONT_NAME, size=10, bold=True, color=BAD_RED))
)

# Kolumna R: status
status_styles = [
    ('Zarejestrowana', OK_GREEN, WHITE, True),
    ('Link wyslany', OK_BG, OK_GREEN, True),
    ('W kontakcie', WARN_BG, '8D6E00', False),
    ('Callback', WARN_BG, '8D6E00', True),
    ('Odrzucona', BAD_BG, BAD_RED, False),
    ('Zly numer', NEUTRAL_GREY, '555555', False),
    ('Nie dzwonic', '424242', WHITE, True),
]
for label, fill, fg, bold in status_styles:
    s.conditional_formatting.add(
        f'R2:R{last_row}',
        FormulaRule(formula=[f'$R2="{label}"'],
                    fill=PatternFill('solid', start_color=fill),
                    font=Font(name=FONT_NAME, size=10, bold=bold, color=fg))
    )

# Autofiltr
s.auto_filter.ref = f'A1:X{last_row}'

# ══════════════════════════════════════════════════════════════════
# SHEET 4: SEGMENTY
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('🎯 Segmenty')
s.sheet_view.showGridLines = False

for col, w in {'A': 3, 'B': 30, 'C': 13, 'D': 55, 'E': 40}.items():
    s.column_dimensions[col].width = w

s['B2'] = '4 segmenty B2B'
style_title(s['B2'], size=20)
s.merge_cells('B2:E2')
s.row_dimensions[2].height = 30

headers_seg = ['Segment', 'Priorytet', 'Dlaczego ten segment', 'Kogo prosisz na linii']
for i, h in enumerate(headers_seg, start=2):
    c = s.cell(row=4, column=i, value=h)
    style_header(c)
s.row_dimensions[4].height = 32

segments_data = [
    ('🏢 Zarządcy nieruchomości', '★★★★★', 'Ciągły ból (awarie w budynkach). Sami podejmują decyzje. Mało technofobiczni (używają ERP/CRM). Najwyższy ROI z telefonu.', 'Zarządca techniczny · Inspektor nadzoru · Konserwator · Prezes (małe wspólnoty)'),
    ('🏗️ Firmy budowlane / deweloperzy', '★★★★', 'Kara umowna za opóźnienie = ogromny ból. Stale szukają podwykonawców. Ale gatekeeperzy twardsi — trzeba się przebić przez sekretariat.', 'Kierownik budowy · Specjalista ds. zaopatrzenia · Dyrektor operacyjny · Właściciel (firmy do 10 osób)'),
    ('🏠 Agencje nieruchomości', '★★★', 'Cykliczny ból (przed każdą sprzedażą coś trzeba naprawić). Niższa pilność — poczekają aż sprawdzą. Dobry segment na środku tygodnia.', 'Agent nieruchomości (zwykle sam decyduje) · Manager biura · Dyrektor obsługi klienta'),
    ('👔 HR / Duzi pracodawcy', '★★★', 'Fabryki, hotele, logistyka. Szukają fachowców stale. Cykl decyzyjny długi — działasz na dłuższą metę. Wysoka wartość pojedynczego leada.', 'Specjalista HR (rekrutacja techniczna) · Kierownik utrzymania ruchu · Dyrektor techniczny · Recruitment Business Partner'),
]
row = 5
seg_fills = [OK_BG, WARN_BG, COLD_BG, HOT_BG]
for i, (seg, prio, why, who) in enumerate(segments_data):
    for j, v in enumerate([seg, prio, why, who]):
        c = s.cell(row=row, column=2+j, value=v)
        style_body(c, fill=seg_fills[i], bold=(j == 0), align='center' if j == 1 else 'left', size=10)
    s.row_dimensions[row].height = 60
    row += 1

# Kiedy dzwonic
row += 2
s.cell(row=row, column=2, value='⏰ Kiedy dzwonić — kalendarz tygodnia')
style_header(s.cell(row=row, column=2), fill=BRAND_MID, size=13)
s.merge_cells(f'B{row}:E{row}')
s.row_dimensions[row].height = 26
row += 1

headers_when = ['Dzień', 'Godzina', 'Segment', 'Dlaczego']
for i, h in enumerate(headers_when, start=2):
    c = s.cell(row=row, column=i, value=h)
    style_header(c)
s.row_dimensions[row].height = 28
row += 1

calendar = [
    ('Poniedziałek', '9:00-10:30', 'Zarządcy nieruchomości', 'Po weekendzie mają świeżą listę awarii'),
    ('Poniedziałek', '14:00-16:00', 'Agencje nieruchomości', 'Klienci dzwonią rano — agent odbierze po obiedzie'),
    ('Wt/Śr/Czw', '10:00-11:30', 'Firmy budowlane', 'Kierownik budowy jest w biurze między 10-12'),
    ('Wt/Śr/Czw', '13:00-15:00', 'HR / Duzi pracodawcy', 'Po obiedzie, przed końcem dnia rekrutera'),
    ('Piątek', '13:00-15:00', 'Follow-upy + callbacki', 'Nie nowe firmy w piątek po 15:00 (weekend w głowie)'),
]
for d, g, seg, w in calendar:
    for j, v in enumerate([d, g, seg, w]):
        c = s.cell(row=row, column=2+j, value=v)
        style_body(c, size=10)
    s.row_dimensions[row].height = 26
    row += 1

row += 1
s.cell(row=row, column=2, value='⚠️ NIE dzwoń')
style_header(s.cell(row=row, column=2), fill=BAD_RED, color=WHITE, size=12)
s.cell(row=row, column=3, value='Pon 8:00-9:00 (odprawa) · Pt po 16:00 (weekend) · Wt 11:45 (głodni) · Święta ±1 dzień')
style_body(s.cell(row=row, column=3), bold=True, fill=BAD_BG)
s.merge_cells(f'C{row}:E{row}')
s.row_dimensions[row].height = 34

# ══════════════════════════════════════════════════════════════════
# SHEET 5: PLAN TYGODNIA
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('📅 Plan dnia')
s.sheet_view.showGridLines = False

for col, w in {'A': 3, 'B': 16, 'C': 38, 'D': 60}.items():
    s.column_dimensions[col].width = w

s['B2'] = 'Rytm dnia — 8h (Pon-Pt)'
style_title(s['B2'], size=20)
s.merge_cells('B2:D2')
s.row_dimensions[2].height = 30

headers_plan = ['Godzina', 'Co robisz', 'Cel']
for i, h in enumerate(headers_plan, start=2):
    c = s.cell(row=4, column=i, value=h)
    style_header(c)
s.row_dimensions[4].height = 30

plan = [
    ('9:00 - 9:15', 'Kawa + przegląd CRM-a', 'Filtruj [Lista firm] po [Data follow-up] — najstarsze na górze'),
    ('9:15 - 10:30', 'Blok 1: 8-10 rozmów', 'Rano = Zarządcy nieruchomości (najlepiej odbierają)'),
    ('10:30 - 10:45', 'Przerwa — spacer, woda', 'Zapisz notatki z ostatnich 3 rozmów ZANIM zapomnisz'),
    ('10:45 - 12:00', 'Blok 2: 8-10 rozmów', 'Firmy budowlane (kierownik budowy w biurze)'),
    ('12:00 - 13:00', 'Lunch', 'Nie dzwoń w czasie lunchu — inni też jedzą'),
    ('13:00 - 14:30', 'Blok 3: 6-8 rozmów', 'Agencje nieruchomości LUB HR (wt-czw)'),
    ('14:30 - 15:00', 'Follow-up', 'Wyślij SMS-y z szablonów'),
    ('15:00 - 16:00', 'Research nowych firm', '[Google Maps Warszawa] — dodaj 10-20 firm na jutro'),
]
r = 5
for g, co, cel in plan:
    s.cell(row=r, column=2, value=g)
    style_body(s.cell(row=r, column=2), bold=True, fill=BRAND_MID, color=WHITE, align='center')
    s.cell(row=r, column=3, value=co)
    style_body(s.cell(row=r, column=3), bold=True, fill=SOFT_BG)
    s.cell(row=r, column=4, value=cel)
    style_body(s.cell(row=r, column=4))
    s.row_dimensions[r].height = 28
    r += 1

r += 1
s.cell(row=r, column=2, value='🎯 Target tygodniowy (realny)')
style_header(s.cell(row=r, column=2), fill=OK_GREEN, color=WHITE, size=13)
s.merge_cells(f'B{r}:D{r}')
s.row_dimensions[r].height = 26
r += 1

headers_t = ['Liczba', 'Co znaczy', 'Uwaga']
for i, h in enumerate(headers_t, start=2):
    c = s.cell(row=r, column=i, value=h)
    style_header(c)
s.row_dimensions[r].height = 28
r += 1

targets = [
    ('100-120', 'Rozmów w tygodniu (20-25/dzień)', 'Nie więcej — zmęczenie głosu = zły vibe rozmowy'),
    ('30-36', 'Rozmów z decydentem (konwersja 30%)', 'Reszta: sekretariat, brak odbioru, zły numer'),
    ('15-18', 'Osób słucha do końca (50% decydentów)', 'To są Twoje realne szanse sprzedażowe'),
    ('5-6', 'Nowych firm się rejestruje (30% słuchaczy)', 'Tydzień sukcesu = 20+/miesiąc z telefonów'),
]
for liczba, co, uw in targets:
    s.cell(row=r, column=2, value=liczba)
    style_body(s.cell(row=r, column=2), bold=True, size=14, fill=OK_GREEN, color=WHITE, align='center')
    s.cell(row=r, column=3, value=co)
    style_body(s.cell(row=r, column=3), bold=True, fill=OK_BG)
    s.cell(row=r, column=4, value=uw)
    style_body(s.cell(row=r, column=4), italic=True)
    s.row_dimensions[r].height = 32
    r += 1

# ══════════════════════════════════════════════════════════════════
# SHEET 6: PRE-FLIGHT
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('✈️ Pre-flight')
s.sheet_view.showGridLines = False

for col, w in {'A': 3, 'B': 6, 'C': 90}.items():
    s.column_dimensions[col].width = w

s['B2'] = '✈️ Pre-flight checklist'
style_title(s['B2'], size=20)
s.merge_cells('B2:C2')
s.row_dimensions[2].height = 30

s['B3'] = 'Nie dzwonisz, dopóki wszystko poniżej nie jest odhaczone. Spali się pierwsza rozmowa.'
s['B3'].font = Font(name=FONT_NAME, size=12, italic=True, color=BAD_RED, bold=True)
s.merge_cells('B3:C3')

checklist = [
    'Mam listę 50+ firm w arkuszu [📞 Lista firm] (segment 1 lub 1+2)',
    'Każda ZIELONA firma ma telefon, adres, 1-zdaniową notatkę z researchu (kol. V)',
    'Każda ZIELONA firma ma — jeśli znalazłem — imię osoby kontaktowej (kol. M)',
    'Mam otwarty arkusz [🎤 Jak rozmawiać] albo wydrukowany PDF',
    'Mam otwarte top 8 obiekcji (arkusz [🎤 Jak rozmawiać] — sekcja obiekcji)',
    'Mam gotowy szablon SMS po rozmowie (arkusz [🎤 Jak rozmawiać] — dół)',
    'Wyłączone powiadomienia — telefon, laptop, Slack, cokolwiek co może brzęknąć',
    'Stoję lub siedzę wyprostowany (sylwetka = głos = wiarygodność)',
    'Obok mam wodę i notatnik (papierowy — szybciej niż wpisywanie do Excela w trakcie)',
    'Zrobiłem 5 min rozgrzewki głosu (zaśpiewać abc, otworzyć szczękę, spacer)',
    'Wiem, że pierwszy telefon będzie NAJTRUDNIEJSZY — po 5. już idzie płynnie',
]
r = 5
for item in checklist:
    cb = s.cell(row=r, column=2, value='⬜')
    style_body(cb, size=14, bold=True, align='center', fill=SOFT_BG)
    s.cell(row=r, column=3, value=item)
    style_body(s.cell(row=r, column=3), size=11)
    s.row_dimensions[r].height = 28
    # dropdown dla checkboxa
    r += 1

dv_check = DataValidation(type='list', formula1='"⬜,✅"', allow_blank=True)
dv_check.add(f'B5:B{r-1}')
s.add_data_validation(dv_check)

# Conditional formatting
s.conditional_formatting.add(
    f'B5:B{r-1}',
    FormulaRule(formula=[f'$B5="✅"'],
                fill=PatternFill('solid', start_color=OK_GREEN),
                font=Font(name=FONT_NAME, size=14, bold=True, color=WHITE))
)

r += 1
s.cell(row=r, column=2, value='💡')
style_body(s.cell(row=r, column=2), size=14, bold=True, align='center', fill=BRAND_ACCENT)
s.cell(row=r, column=3, value='DZIEŃ 1 = 10 telefonów z ZIELONYCH. Nie cała lista. Nie 50 naraz. DZIESIĘĆ. Zmierz czas. Zapisz notatki. Jutro 15. Piątego dnia masz już flow.')
style_body(s.cell(row=r, column=3), bold=True, size=11, fill=WARN_BG)
s.row_dimensions[r].height = 56

# ══════════════════════════════════════════════════════════════════
# SHEET 7: METRYKI (auto-formuły)
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('📊 Metryki')
s.sheet_view.showGridLines = False

for col, w in {'A': 3, 'B': 42, 'C': 12, 'D': 60}.items():
    s.column_dimensions[col].width = w

s['B2'] = '📊 Metryki — auto-liczone z [Lista firm]'
style_title(s['B2'], size=20)
s.merge_cells('B2:D2')
s.row_dimensions[2].height = 30

s['B3'] = 'Formuły przeliczają się same. Wypełnij [Lista firm], wróć tutaj, zobacz progres.'
s['B3'].font = Font(name=FONT_NAME, size=11, italic=True, color='555555')
s.merge_cells('B3:D3')

# Lejek
s['B5'] = '🎯 Lejek sprzedaży — aktualny stan'
style_header(s['B5'], fill=BRAND_MID, size=13)
s.merge_cells('B5:D5')
s.row_dimensions[5].height = 26

headers_m = ['Metryka', 'Wartość', 'Komentarz']
for i, h in enumerate(headers_m, start=2):
    c = s.cell(row=6, column=i, value=h)
    style_header(c)
s.row_dimensions[6].height = 28

lf = "'📞 Lista firm'"
metrics = [
    ('Firmy w bazie (łącznie)', f'=COUNTA({lf}!E2:E9999)', 'Ile firm w ogóle masz w CRM'),
    ('   Z czego TOP (zielony)', f'=COUNTIF({lf}!G:G,"TOP (zielony)")', 'Do tych dzwonisz jako pierwsze'),
    ('   Z czego Średni (żółty)', f'=COUNTIF({lf}!G:G,"Sredni (zolty)")', 'Druga kolejka'),
    ('   Z czego Niski (czerwony)', f'=COUNTIF({lf}!G:G,"Niski (czerwony)")', 'Pomijasz na start'),
    ('Zadzwoniono (✅ odhaczone)', f'=COUNTIF({lf}!B:B,"✅")', 'Liczba firm gdzie podjąłeś próbę'),
    ('Rozmowa z decydentem (status ≠ Nowa / Zły numer)', f'=COUNTA({lf}!R2:R9999)-COUNTIF({lf}!R:R,"Nowa")-COUNTIF({lf}!R:R,"Zly numer")', 'Gdzie rozmowa faktycznie się odbyła'),
    ('🏆 Zarejestrowane firmy', f'=COUNTIF({lf}!R:R,"Zarejestrowana")', 'TWOJE WYGRANE — ten numer rośnie'),
    ('Link wysłany', f'=COUNTIF({lf}!R:R,"Link wyslany")', 'Czekasz na callback'),
    ('W kontakcie / Callback', f'=COUNTIF({lf}!R:R,"W kontakcie")+COUNTIF({lf}!R:R,"Callback")', 'Pilnuj Data follow-up'),
    ('Odrzucone', f'=COUNTIF({lf}!R:R,"Odrzucona")', 'Ucz się na błędach — zobacz notatki z rozmowy'),
]
r = 7
for i, (name, formula, comment) in enumerate(metrics):
    s.cell(row=r, column=2, value=name)
    is_win = 'Zarejestrowane' in name
    style_body(s.cell(row=r, column=2), bold=True, size=11,
               fill=OK_GREEN if is_win else SOFT_BG,
               color=WHITE if is_win else '000000')
    s.cell(row=r, column=3, value=formula)
    style_body(s.cell(row=r, column=3), bold=True, size=14, align='center',
               fill=OK_GREEN if is_win else WHITE,
               color=WHITE if is_win else BRAND_DARK)
    s.cell(row=r, column=4, value=comment)
    style_body(s.cell(row=r, column=4), italic=True, size=10)
    s.row_dimensions[r].height = 30
    r += 1

# Stopień zainteresowania (rozkład)
r += 1
s.cell(row=r, column=2, value='🔥 Rozkład zainteresowania (z odhaczonych)')
style_header(s.cell(row=r, column=2), fill=BRAND_ACCENT, color=BRAND_DARK, size=13)
s.merge_cells(f'B{r}:D{r}')
s.row_dimensions[r].height = 26
r += 1

interest_metrics = [
    ('❄️ Zimny (1)',   f'=COUNTIF({lf}!C:C,"❄️ 1 Zimny")',   COLD_BG),
    ('🧊 Chłodny (2)', f'=COUNTIF({lf}!C:C,"🧊 2 Chłodny")',  'C8E6C9'),
    ('🌡️ Letni (3)',   f'=COUNTIF({lf}!C:C,"🌡️ 3 Letni")',   WARN_BG),
    ('🔥 Ciepły (4)',  f'=COUNTIF({lf}!C:C,"🔥 4 Ciepły")',   HOT_BG),
    ('🚀 Gorący (5)',  f'=COUNTIF({lf}!C:C,"🚀 5 Gorący")',   FIRE_BG),
]
for name, formula, bg in interest_metrics:
    s.cell(row=r, column=2, value=name)
    style_body(s.cell(row=r, column=2), bold=True, size=11, fill=bg, align='center')
    s.cell(row=r, column=3, value=formula)
    style_body(s.cell(row=r, column=3), bold=True, size=14, align='center')
    s.cell(row=r, column=4, value='Gorący (5) = priorytet do callbacku w 24h')
    style_body(s.cell(row=r, column=4), italic=True, size=10)
    s.row_dimensions[r].height = 28
    r += 1

# Konwersje
r += 1
s.cell(row=r, column=2, value='📈 Konwersje (auto-obliczane)')
style_header(s.cell(row=r, column=2), fill=BRAND_MID, size=13)
s.merge_cells(f'B{r}:D{r}')
s.row_dimensions[r].height = 26
r += 1

conv = [
    ('% dzwonień wykonanych (B:✅ / firmy)', '=IFERROR(C11/C7,0)', 'Jak aktywnie dzwonisz'),
    ('% rejestracji (wygrane / zadzwoniono)', '=IFERROR(C13/C11,0)', 'Cel: 15-30%. <10% → skrypt nie działa'),
    ('% end-to-end (wygrane / firmy w bazie)', '=IFERROR(C13/C7,0)', 'Cel: 5%. Mierzysz miesięcznie'),
]
for name, formula, comment in conv:
    s.cell(row=r, column=2, value=name)
    style_body(s.cell(row=r, column=2), bold=True, size=11, fill=SOFT_BG)
    s.cell(row=r, column=3, value=formula)
    s.cell(row=r, column=3).number_format = '0.0%'
    style_body(s.cell(row=r, column=3), bold=True, size=14, align='center', color=BRAND_DARK)
    s.cell(row=r, column=4, value=comment)
    style_body(s.cell(row=r, column=4), italic=True, size=10)
    s.row_dimensions[r].height = 30
    r += 1

# ══════════════════════════════════════════════════════════════════
# SHEET 8: GOOGLE MAPS WARSZAWA (zostaw z v5, tylko ładniej)
# ══════════════════════════════════════════════════════════════════
s = wb.create_sheet('🗺️ Google Maps')
s.sheet_view.showGridLines = False

for col, w in {'A': 3, 'B': 16, 'C': 26, 'D': 24, 'E': 18, 'F': 18, 'G': 80}.items():
    s.column_dimensions[col].width = w

s['B2'] = '🗺️ 72 gotowe zapytania Google Maps — Warszawa'
style_title(s['B2'], size=18)
s.merge_cells('B2:G2')
s.row_dimensions[2].height = 28

s['B3'] = 'Kliknij w link → Google Maps otworzy wyszukiwanie → skopiuj firmę do arkusza [📞 Lista firm].'
s['B3'].font = Font(name=FONT_NAME, size=11, italic=True, color='555555')
s.merge_cells('B3:G3')

# Wpisuję od wiersza 5
if len(maps_rows) > 4:
    src_hdr_row = None
    for i, mr in enumerate(maps_rows):
        if mr and mr[1] and 'Dzielnica' in str(mr[1]):
            src_hdr_row = i
            break
    if src_hdr_row:
        # Kopiujemy header + dane
        hdr = maps_rows[src_hdr_row]
        for col_idx, val in enumerate(hdr[1:], start=2):
            c = s.cell(row=5, column=col_idx, value=val)
            style_header(c)
        s.row_dimensions[5].height = 28

        r = 6
        for data_row in maps_rows[src_hdr_row + 1:]:
            if not any(data_row):
                continue
            for col_idx, val in enumerate(data_row[1:], start=2):
                c = s.cell(row=r, column=col_idx, value=val)
                style_body(c, size=9)
            s.row_dimensions[r].height = 22
            r += 1

# ══════════════════════════════════════════════════════════════════
# Ustaw pierwszy arkusz jako aktywny
wb.active = 0
wb.save(DST)
print(f'✓ Saved: {DST}')
print(f'  - {len(lista_data)} firm w Liście firm')
print(f'  - 8 arkuszy')
