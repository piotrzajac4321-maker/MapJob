"""Build A4 phone-sales cheat sheet PDF for MapJob B2B cold calling."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Znajdź font z polskimi znakami (Windows) ───
FONT_CANDIDATES = [
    ('C:/Windows/Fonts/calibri.ttf',     'C:/Windows/Fonts/calibrib.ttf',  'C:/Windows/Fonts/calibrii.ttf'),
    ('C:/Windows/Fonts/arial.ttf',       'C:/Windows/Fonts/arialbd.ttf',   'C:/Windows/Fonts/ariali.ttf'),
    ('C:/Windows/Fonts/segoeui.ttf',     'C:/Windows/Fonts/segoeuib.ttf',  'C:/Windows/Fonts/segoeuii.ttf'),
]
FONT = 'Helvetica'
FONT_BOLD = 'Helvetica-Bold'
FONT_ITALIC = 'Helvetica-Oblique'
for reg, bold, ital in FONT_CANDIDATES:
    if os.path.exists(reg):
        try:
            pdfmetrics.registerFont(TTFont('PL', reg))
            pdfmetrics.registerFont(TTFont('PL-Bold', bold if os.path.exists(bold) else reg))
            pdfmetrics.registerFont(TTFont('PL-Italic', ital if os.path.exists(ital) else reg))
            FONT = 'PL'
            FONT_BOLD = 'PL-Bold'
            FONT_ITALIC = 'PL-Italic'
            break
        except Exception:
            continue

# ─── Kolory ───
NAVY = HexColor('#1E3A5F')
BLUE = HexColor('#2E6FB4')
GOLD = HexColor('#F5A623')
GREEN = HexColor('#2E7D32')
GREEN_BG = HexColor('#DCEDC8')
YELLOW_BG = HexColor('#FFF9C4')
RED = HexColor('#C62828')
RED_BG = HexColor('#FFCDD2')
COLD_BG = HexColor('#BBDEFB')
HOT_BG = HexColor('#FFE0B2')
GREY = HexColor('#666666')
LIGHT_GREY = HexColor('#EEEEEE')
WHITE = HexColor('#FFFFFF')

# ─── Styles ───
styles = getSampleStyleSheet()
s_title = ParagraphStyle('T', parent=styles['Normal'], fontName=FONT_BOLD, fontSize=18,
                          textColor=NAVY, alignment=TA_LEFT, spaceAfter=2)
s_sub = ParagraphStyle('S', parent=styles['Normal'], fontName=FONT_ITALIC, fontSize=9,
                        textColor=GREY, spaceAfter=10)
s_h2 = ParagraphStyle('H2', parent=styles['Normal'], fontName=FONT_BOLD, fontSize=12,
                       textColor=WHITE, backColor=NAVY, borderPadding=4,
                       spaceAfter=6, spaceBefore=8)
s_h2_gold = ParagraphStyle('H2G', parent=s_h2, textColor=NAVY, backColor=GOLD)
s_h2_green = ParagraphStyle('H2Gr', parent=s_h2, backColor=GREEN)
s_body = ParagraphStyle('B', parent=styles['Normal'], fontName=FONT, fontSize=9,
                         textColor=HexColor('#222222'), leading=11, spaceAfter=3)
s_body_bold = ParagraphStyle('BB', parent=s_body, fontName=FONT_BOLD)
s_quote = ParagraphStyle('Q', parent=s_body, fontName=FONT_ITALIC,
                          textColor=NAVY, leftIndent=6, spaceBefore=2)
s_footer = ParagraphStyle('F', parent=styles['Normal'], fontName=FONT_ITALIC, fontSize=7,
                           textColor=GREY, alignment=TA_CENTER)

OUTPUT = 'MapJob-Cheat-Sheet-Telefon.pdf'

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    topMargin=14*mm, bottomMargin=14*mm,
    leftMargin=14*mm, rightMargin=14*mm,
    title='MapJob — Cheat Sheet Telefon',
    author='MapJob',
)

story = []

# ═══ TITLE ═══
story.append(Paragraph('MapJob — Cheat Sheet Telefon <font color="#F5A623">B2B</font>', s_title))
story.append(Paragraph('1-stronicowy skrót. Trzymaj obok telefonu. Pełny scenariusz: reklama/27-scenariusz-rozmowy-telefonicznej.md', s_sub))

# ═══ PIERWSZE 10 SEKUND ═══
story.append(Paragraph('⚡ PIERWSZE 10 SEKUND', s_h2_gold))
opener_t = [
    [Paragraph('<b>MÓWISZ:</b>', s_body_bold),
     Paragraph('„Dzień dobry, <b>Paweł z MapJob</b> — mam do Pana jedno krótkie pytanie, <b>mam minutę?</b>"', s_quote)],
    [Paragraph('<b>NIE MÓWISZ:</b>', s_body_bold),
     Paragraph('„Dzień dobry, dzwonię z działu marketingu firmy MapJob i chciałbym przedstawić..." ← <b>brzmi jak bot</b>.', s_body)],
    [Paragraph('Na „tak":', s_body_bold),
     Paragraph('Jedziesz DISCOVERY — pytania o ich ból.', s_body)],
    [Paragraph('Na „teraz nie":', s_body_bold),
     Paragraph('„Rozumiem, <b>kiedy</b> mogę oddzwonić — rano czy po południu?" (pytasz KIEDY, nie CZY).', s_body)],
    [Paragraph('Na „o co chodzi?":', s_body_bold),
     Paragraph('Przeskakujesz od razu do HAKA segmentu (patrz niżej).', s_body)],
]
t = Table(opener_t, colWidths=[28*mm, 150*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BACKGROUND', (0,0), (0,-1), LIGHT_GREY),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ('LINEBELOW', (0,0), (-1,-2), 0.3, HexColor('#CCCCCC')),
]))
story.append(t)

# ═══ 6 KROKÓW ═══
story.append(Paragraph('🧭 STRUKTURA ROZMOWY — 6 KROKÓW (3-5 min)', s_h2))
steps_data = [
    ['KROK', 'ZADANIE', 'CO MÓWISZ / CO ROBISZ'],
    ['0', 'Gatekeeper', 'Mów ROLĄ: „Kto zajmuje się konserwacją budynków?" NIE: „połącz z prezesem".'],
    ['1', 'Otwarcie (15s)', '„Dzień dobry Panie [imię], Paweł z MapJob. Mam krótkie pytanie — mam minutę?"'],
    ['2', 'Discovery (30-60s)', '1-3 pytania o ich ból. SŁUCHASZ, NIE MÓWISZ. Notujesz na kartce.'],
    ['3', 'Pitch dopasowany (30s)', 'Powtarzasz JEGO ból → rozwiązanie: „Czyli jak rozumiem... — zrobiliśmy MapJob dlatego..."'],
    ['4', 'Uprzedzanie obiekcji (15s)', 'Sam rzucasz „za darmo, gdzie haczyk" ZANIM on to powie.'],
    ['5', 'Close (20s)', '„Link SMS-em czy mailem, co wygodniej?" + konkretny callback („piątek 15:00").'],
    ['6', 'Przypieczętowanie', '„Dzięki, SMS leci teraz." Rozłącz PIERWSZY. W 60s wyślij SMS.'],
]
steps_para = [
    [Paragraph(f'<b>{row[0]}</b>', s_body_bold) if i == 0 else
     Paragraph(f'<b>{row[0]}</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)),
     Paragraph(f'<b>{row[1]}</b>', s_body_bold),
     Paragraph(row[2], s_body)]
    for i, row in enumerate(steps_data)
]
# Rebuild with header row separately
steps_para = [[Paragraph(f'<b>{h}</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)) for h in steps_data[0]]]
for row in steps_data[1:]:
    steps_para.append([
        Paragraph(f'<b>{row[0]}</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph(f'<b>{row[1]}</b>', s_body_bold),
        Paragraph(row[2], s_body),
    ])
t = Table(steps_para, colWidths=[13*mm, 40*mm, 125*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('BACKGROUND', (0,1), (0,-1), BLUE),
    ('ROWBACKGROUNDS', (1,1), (-1,-1), [WHITE, HexColor('#F5F5F5')]),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BDBDBD')),
    ('LEFTPADDING', (0,0), (-1,-1), 3),
    ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
]))
story.append(t)

# ═══ 4 SEGMENTY - HAKI ═══
story.append(Paragraph('🎯 4 SEGMENTY — HAK OTWIERAJĄCY', s_h2))
segs = [
    ('🏢 Zarządcy nieruchomości',
     '„Ile czasu Panu zajmuje znalezienie elektryka, kiedy coś pilnie siądzie w bloku wieczorem?"',
     GREEN_BG),
    ('🏗️ Firmy budowlane',
     '„Jak często zdarza się, że podwykonawca nie wyrabia terminu i musicie go w 48h zastąpić?"',
     YELLOW_BG),
    ('🏠 Agencje nieruchomości',
     '„Kiedy klient prosi o odmalowanie przed sprzedażą — kto u Państwa szuka fachowca i ile to trwa?"',
     COLD_BG),
    ('👔 HR / duzi pracodawcy',
     '„Ile CV dziennie dostajecie z OLX, z tego ile realnie ma SEP/UDT/uprawnienia?"',
     HOT_BG),
]
seg_rows = []
for name, hook, bg in segs:
    seg_rows.append([Paragraph(f'<b>{name}</b>', s_body_bold),
                      Paragraph(f'<i>{hook}</i>', s_body)])
t = Table(seg_rows, colWidths=[55*mm, 123*mm])
style_list = [
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BDBDBD')),
]
for i, (_, _, bg) in enumerate(segs):
    style_list.append(('BACKGROUND', (0, i), (-1, i), bg))
t.setStyle(TableStyle(style_list))
story.append(t)

# ══════ STRONA 2 ══════
story.append(PageBreak())

# ═══ OBIEKCJE ═══
story.append(Paragraph('🛡️ TOP 8 OBIEKCJI — KRÓTKIE ODPOWIEDZI', s_h2))
obj = [
    ('„Nie mam czasu"', '„Rozumiem. 2 sekundy — kiedy mogę oddzwonić, rano czy po południu?"'),
    ('„Wyślij mi maila"', '„Oczywiście, ale zanim wyślę — jedno pytanie, żebym wysłał to co Panu pasuje: [pytanie discovery]."'),
    ('„Mamy już OLX / Oferia"', '„Super, zna Pan temat. MapJob: ZERO kredytów kontaktowych. Uzupełnienie, nie zamiennik."'),
    ('„Nie potrzebujemy"', '„Za 3 miesiące na pilną awarię byłoby fajnie mieć gotową listę, tak? Link bez zobowiązań."'),
    ('„Za darmo = kiepskie"', '„Apka startuje w Polsce. Pana podstawowe konto zostanie ZAWSZE darmowe — na mailu obiecuję."'),
    ('„Sprzedacie moje dane"', '„Polska baza, serwery UE, zero reklam zewnętrznych, zero sprzedaży brokerom. Polityka z linkiem."'),
    ('„Muszę zapytać wspólnika"', '„Oczywiście. SMS-em: link + wizytówka. Oddzwonię w piątek. Pasuje?"'),
    ('„A jak nie zadziała?"', '„To zabraliśmy sobie 5 minut. Konto usuwa się w 1 kliknięciu. Nie ryzykuje Pan ani grosza."'),
]
obj_rows = [[Paragraph('<b>OBIEKCJA</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)),
             Paragraph('<b>TWOJA ODPOWIEDŹ (1 zdanie)</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER))]]
for q, a in obj:
    obj_rows.append([Paragraph(f'<i>{q}</i>', s_body), Paragraph(a, s_body)])
t = Table(obj_rows, colWidths=[55*mm, 123*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('BACKGROUND', (0,1), (0,-1), RED_BG),
    ('BACKGROUND', (1,1), (1,-1), GREEN_BG),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BDBDBD')),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(t)

# ═══ 3 ZAMKNIĘCIA ═══
story.append(Paragraph('🎁 3 ZAMKNIĘCIA — zawsze kończ Z KLASĄ', s_h2_green))
closes = [
    ('✅ Weszli w temat', '„Super, Panie Andrzeju. Dzięki za czas, SMS leci teraz. Miłego dnia!"'),
    ('🤔 Zastanawiają się', '„Dzięki za rozmowę. Link prześlę, a w piątek zadzwonię sprawdzić czy Pan zerknął."'),
    ('❌ Mówią nie', '„Rozumiem. Gdyby za kilka miesięcy coś się zmieniło — numer ma Pani zapisany. Do usłyszenia!"'),
]
close_rows = []
for k, v in closes:
    close_rows.append([Paragraph(f'<b>{k}</b>', s_body_bold),
                        Paragraph(f'<i>{v}</i>', s_body)])
t = Table(close_rows, colWidths=[50*mm, 128*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (0,0), (0,-1), GREEN_BG),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BDBDBD')),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(t)

# ═══ 7 ZASAD TECHNICZNYCH ═══
story.append(Paragraph('🧠 7 ZASAD TECHNICZNYCH', s_h2))
rules = [
    ('Tempo mowy', '130-150 słów/min. Zwolnij. Pauzuj po każdym zdaniu.'),
    ('Intonacja', 'Opadająca na asercjach, wznosząca na pytaniach („pasuje 15?").'),
    ('Imię rozmówcy', 'Max 3× w rozmowie. Więcej = brzmisz jak bot.'),
    ('Słowa-pasożyty', 'Wyrzuć „uhm", „wiesz", „jakby". Nagraj pierwszą rozmowę — posłuchaj.'),
    ('Stój podczas rozmowy', 'Dosłownie. Głos brzmi pewniej. Test NASA — serio.'),
    ('Uśmiechaj się', 'Ludzie SŁYSZĄ uśmiech. Postaw lustro obok telefonu.'),
    ('NIE KŁAM', 'Nigdy „mamy 5000 firm" jeśli macie 50. Wyczują. Prawda > piękna historia.'),
]
rule_rows = []
for i, (k, v) in enumerate(rules):
    rule_rows.append([Paragraph(f'<b>{i+1}. {k}</b>', s_body_bold),
                       Paragraph(v, s_body)])
t = Table(rule_rows, colWidths=[45*mm, 133*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (0,0), (0,-1), LIGHT_GREY),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BDBDBD')),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
]))
story.append(t)

# ═══ KIEDY DZWONIĆ ═══
story.append(Paragraph('⏰ KIEDY DZWONIĆ', s_h2_gold))
when_rows = [
    [Paragraph('<b>DZIEŃ</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)),
     Paragraph('<b>GODZINA</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)),
     Paragraph('<b>SEGMENT</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER)),
     Paragraph('<b>DLACZEGO</b>', ParagraphStyle('', parent=s_body_bold, textColor=WHITE, alignment=TA_CENTER))],
    ['Poniedziałek', '9:00-10:30', 'Zarządcy nieruchomości', 'Świeża lista awarii z weekendu'],
    ['Poniedziałek', '14:00-16:00', 'Agencje nieruchomości', 'Klienci rano, agent odbierze po obiedzie'],
    ['Wt/Śr/Czw', '10:00-11:30', 'Firmy budowlane', 'Kierownik budowy w biurze'],
    ['Wt/Śr/Czw', '13:00-15:00', 'HR / duzi pracodawcy', 'Po obiedzie rekrutera'],
    ['Piątek', '13:00-15:00', 'Follow-upy', 'Luźniejsza atmosfera'],
]
when_data = [when_rows[0]]
for row in when_rows[1:]:
    when_data.append([Paragraph(row[0], s_body), Paragraph(row[1], s_body),
                       Paragraph(row[2], s_body), Paragraph(row[3], s_body)])
t = Table(when_data, colWidths=[30*mm, 30*mm, 55*mm, 63*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, HexColor('#F5F5F5')]),
    ('GRID', (0,0), (-1,-1), 0.3, HexColor('#BDBDBD')),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
]))
story.append(t)

story.append(Spacer(1, 3*mm))

# ═══ SMS PO ROZMOWIE ═══
sms_title = Paragraph('📱 SMS W 60 SEKUND PO ROZŁĄCZENIU', s_h2_gold)
sms_body = Paragraph(
    'Cześć Panie [imię], tu Paweł z MapJob.<br/>'
    'Link: <b>https://mapjob.pl</b><br/>'
    'Zaloguj kontem Google → 2 sek.<br/>'
    'Oddzwonię w <b>[dzień godzina]</b>. Pozdrawiam!',
    ParagraphStyle('sms', parent=s_body, fontSize=10, backColor=YELLOW_BG,
                   borderPadding=6, leading=14, leftIndent=4),
)
story.append(sms_title)
story.append(sms_body)

story.append(Spacer(1, 4*mm))

# ═══ RED FLAGS ═══
story.append(Paragraph('🛑 RED FLAGS — kiedy grzecznie zakończyć rozmowę', s_h2))
red_flags = [
    'Rozmówca <b>agresywny / poniżający</b> → „Miłego dnia, przepraszam za zakłócenie" + rozłącz.',
    '<b>Pijany / niepoczytalny</b> → to samo.',
    'Oczekuje <b>faktury za rozmowę</b> albo czegoś nielegalnego → rozłącz + „nie dzwonić".',
    '<b>Ponad 10 min i zero progresji</b> → „Oddzwonię w piątek" i kończ. Czas = pieniądz.',
]
rf_rows = [[Paragraph(f'• {t}', s_body)] for t in red_flags]
t = Table(rf_rows, colWidths=[178*mm])
t.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (0,0), (-1,-1), RED_BG),
    ('GRID', (0,0), (-1,-1), 0.3, RED),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 3),
    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
]))
story.append(t)

story.append(Spacer(1, 5*mm))
story.append(Paragraph(
    'MapJob — Polska apka do szukania fachowców. '
    'Darmowa dla firm · Google Login · PWA · Zero prowizji. '
    'Pełny scenariusz: reklama/27-scenariusz-rozmowy-telefonicznej.md',
    s_footer
))

doc.build(story)
print(f'Saved: {OUTPUT}')
