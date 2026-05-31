# -*- coding: utf-8 -*-
"""
Generate MapJob-Brief-Helpera.pdf — simple visual brief for phone callers.

Design goals: big type, lots of whitespace, numbered circles, comic-strip
style dialogue boxes, minimal prose. Should be readable in 10 minutes.

Run: python -X utf8 reklama/_generate_brief_pdf.py
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ---------------------------------------------------------------------------
# Fonts
# ---------------------------------------------------------------------------

pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', 'C:/Windows/Fonts/ariali.ttf'))
pdfmetrics.registerFont(TTFont('Arial-BoldItalic', 'C:/Windows/Fonts/arialbi.ttf'))
registerFontFamily(
    'Arial',
    normal='Arial',
    bold='Arial-Bold',
    italic='Arial-Italic',
    boldItalic='Arial-BoldItalic',
)

# ---------------------------------------------------------------------------
# Brand
# ---------------------------------------------------------------------------

GREEN = colors.HexColor('#10B981')
GREEN_DARK = colors.HexColor('#047857')
GREEN_SOFT = colors.HexColor('#D1FAE5')
BLUE = colors.HexColor('#3B82F6')
BLUE_DARK = colors.HexColor('#1D4ED8')
BLUE_SOFT = colors.HexColor('#DBEAFE')
AMBER = colors.HexColor('#D97706')
AMBER_SOFT = colors.HexColor('#FEF3C7')
RED = colors.HexColor('#DC2626')
RED_SOFT = colors.HexColor('#FEE2E2')
GREY_DARK = colors.HexColor('#111827')
GREY_MID = colors.HexColor('#4B5563')
GREY_LIGHT = colors.HexColor('#9CA3AF')
GREY_BG = colors.HexColor('#F3F4F6')

LQ = '\u201E'
RQ = '\u201D'


def q(text):
    return LQ + text + RQ

# ---------------------------------------------------------------------------
# Styles — bigger, airier
# ---------------------------------------------------------------------------

styles = getSampleStyleSheet()

BODY = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName='Arial',
    fontSize=12,
    leading=18,
    textColor=GREY_DARK,
    spaceAfter=8,
    alignment=TA_LEFT,
)

BODY_BIG = ParagraphStyle('BodyBig', parent=BODY, fontSize=13, leading=20, spaceAfter=10)

LEAD = ParagraphStyle('Lead', parent=BODY, fontSize=14, leading=22, spaceAfter=14)

H1 = ParagraphStyle(
    'H1',
    parent=BODY,
    fontName='Arial-Bold',
    fontSize=28,
    leading=34,
    textColor=GREEN_DARK,
    spaceBefore=0,
    spaceAfter=16,
)

H2 = ParagraphStyle(
    'H2',
    parent=BODY,
    fontName='Arial-Bold',
    fontSize=17,
    leading=22,
    textColor=GREY_DARK,
    spaceBefore=16,
    spaceAfter=10,
)

H2_BLUE = ParagraphStyle('H2B', parent=H2, textColor=BLUE_DARK)
H2_RED = ParagraphStyle('H2R', parent=H2, textColor=RED)
H2_GREEN = ParagraphStyle('H2G', parent=H2, textColor=GREEN_DARK)

COVER_BRAND = ParagraphStyle(
    'CoverBrand',
    parent=BODY,
    fontName='Arial-Bold',
    fontSize=56,
    leading=66,
    textColor=GREEN_DARK,
    alignment=TA_CENTER,
    spaceAfter=4,
)

COVER_SUB = ParagraphStyle(
    'CoverSub',
    parent=BODY,
    fontName='Arial-Bold',
    fontSize=26,
    leading=32,
    textColor=GREY_DARK,
    alignment=TA_CENTER,
    spaceAfter=10,
)

COVER_MINI = ParagraphStyle(
    'CoverMini',
    parent=BODY,
    fontSize=13,
    leading=18,
    textColor=GREY_MID,
    alignment=TA_CENTER,
)

SIG = ParagraphStyle(
    'Sig',
    parent=BODY,
    alignment=TA_CENTER,
    fontName='Arial-Italic',
    fontSize=13,
    textColor=GREY_MID,
)

DIALOG_LABEL = ParagraphStyle(
    'DL',
    parent=BODY,
    fontName='Arial-Bold',
    fontSize=12,
    leading=15,
    textColor=GREEN_DARK,
    spaceAfter=0,
)

DIALOG_TEXT = ParagraphStyle(
    'DT',
    parent=BODY,
    fontSize=13,
    leading=19,
    textColor=GREY_DARK,
    spaceAfter=0,
)

TH = ParagraphStyle(
    'TH',
    parent=BODY,
    textColor=colors.white,
    fontName='Arial-Bold',
    fontSize=12,
    leading=15,
)

NOTE = ParagraphStyle(
    'Note',
    parent=BODY,
    fontName='Arial-Italic',
    fontSize=11,
    leading=15,
    textColor=GREY_MID,
)

# ---------------------------------------------------------------------------
# Page decoration
# ---------------------------------------------------------------------------


def _decorate(canvas, doc):
    page = doc.page
    if page == 1:
        # Cover — full-bleed green top + bottom bars
        canvas.saveState()
        canvas.setFillColor(GREEN)
        canvas.rect(0, A4[1] - 14 * mm, A4[0], 14 * mm, fill=1, stroke=0)
        canvas.setFillColor(GREEN_DARK)
        canvas.rect(0, 0, A4[0], 14 * mm, fill=1, stroke=0)
        # Footer white text
        canvas.setFillColor(colors.white)
        canvas.setFont('Arial', 11)
        canvas.drawCentredString(A4[0] / 2, 5 * mm, 'mapjob.pl')
        canvas.restoreState()
        return

    canvas.saveState()
    # Top: thin green line
    canvas.setStrokeColor(GREEN)
    canvas.setLineWidth(2)
    canvas.line(20 * mm, A4[1] - 14 * mm, A4[0] - 20 * mm, A4[1] - 14 * mm)

    canvas.setFont('Arial-Bold', 10)
    canvas.setFillColor(GREEN_DARK)
    canvas.drawString(20 * mm, A4[1] - 11 * mm, 'MapJob')
    canvas.setFont('Arial', 10)
    canvas.setFillColor(GREY_MID)
    canvas.drawString(38 * mm, A4[1] - 11 * mm, 'Jak dzwonić do firm')

    # Page number in circle
    canvas.setFillColor(GREEN)
    canvas.circle(A4[0] - 25 * mm, A4[1] - 10 * mm, 5 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont('Arial-Bold', 11)
    canvas.drawCentredString(
        A4[0] - 25 * mm, A4[1] - 11.8 * mm, str(page)
    )

    # Bottom: contact hint
    canvas.setFillColor(GREY_LIGHT)
    canvas.setFont('Arial', 9)
    canvas.drawCentredString(A4[0] / 2, 10 * mm, 'mapjob.pl  ·  kontakt@mapjob.pl')
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Reusable blocks
# ---------------------------------------------------------------------------


def P(text, style=BODY):
    return Paragraph(text, style)


def numbered_circle(n, size=9 * mm, color=GREEN, text_color=colors.white):
    """A colored circle Table cell with a number inside — used as list marker."""
    # Approximate with a colored table cell — round corners are simulated
    # by using a padded square; looks clean enough.
    cell = Table([[P(f'<font color="white" size="16"><b>{n}</b></font>', BODY)]],
                 colWidths=[size], rowHeights=[size])
    cell.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('ROUNDEDCORNERS', [size / 2] * 4),
    ]))
    return cell


def numbered_step(n, text, color=GREEN):
    """[number circle] [big text]"""
    step = Table(
        [[numbered_circle(n, color=color), P(text, BODY_BIG)]],
        colWidths=[15 * mm, 150 * mm],
    )
    step.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (1, 0), (1, 0), 10),
    ]))
    return step


def fact_card(icon_text, title, desc, color=GREEN):
    """A 3-cell row: [icon] [title+desc]"""
    inner = [
        [P(f'<font size="20"><b>{title}</b></font>', BODY)],
        [P(desc, BODY)],
    ]
    inner_t = Table(inner, colWidths=[145 * mm])
    inner_t.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    card = Table([[P(f'<font size="28" color="{color.hexval()[0:9]}"><b>{icon_text}</b></font>', BODY), inner_t]],
                 colWidths=[20 * mm, 145 * mm])
    card.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GREY_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LINEBEFORE', (0, 0), (0, -1), 5, color),
    ]))
    return card


def dialog_box(who, text, who_color=GREEN_DARK, bg=GREY_BG):
    """Comic-strip style dialogue."""
    label = P(who, ParagraphStyle(
        'DL2',
        parent=DIALOG_LABEL,
        textColor=who_color,
    ))
    content = P(text, DIALOG_TEXT)
    inner = Table([[label], [content]], colWidths=[160 * mm])
    inner.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (0, 0), 0),
        ('BOTTOMPADDING', (0, 0), (0, 0), 6),
        ('TOPPADDING', (0, 1), (0, 1), 0),
        ('BOTTOMPADDING', (0, 1), (0, 1), 0),
    ]))
    wrapper = Table([[inner]], colWidths=[165 * mm])
    wrapper.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg),
        ('LINEBEFORE', (0, 0), (0, -1), 4, who_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    return wrapper


def note_box(text):
    t = Table([[P(text, NOTE)]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t


def big_callout(title, body_text, bg=BLUE_SOFT, accent=BLUE_DARK):
    t = Table([
        [P(f'<font size="15" color="{accent.hexval()[:9]}"><b>{title}</b></font>', BODY)],
        [P(body_text, BODY_BIG)],
    ], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg),
        ('BOX', (0, 0), (-1, -1), 1, accent),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (0, 0), 10),
        ('BOTTOMPADDING', (0, 0), (0, 0), 4),
        ('TOPPADDING', (0, 1), (0, 1), 0),
        ('BOTTOMPADDING', (0, 1), (0, 1), 10),
    ]))
    return t


def objection_table(rows):
    data = [[P('<b>Gdy powie</b>', TH), P('<b>Ty odpowiadasz</b>', TH)]]
    for o, a in rows:
        data.append([P(q(o), BODY), P(q(a), BODY)])
    t = Table(data, colWidths=[60 * mm, 105 * mm], repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), GREEN_DARK),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]
    for i in range(1, len(data)):
        if i % 2 == 1:
            style.append(('BACKGROUND', (0, i), (-1, i), GREY_BG))
    t.setStyle(TableStyle(style))
    return t


def question_table(rows):
    data = [[P('<b>Typ firmy</b>', TH), P('<b>Pytanie</b>', TH)]]
    for typ, pyt in rows:
        data.append([P(f'<b>{typ}</b>', BODY), P(q(pyt), BODY)])
    t = Table(data, colWidths=[55 * mm, 110 * mm], repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), BLUE_DARK),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]
    for i in range(1, len(data)):
        if i % 2 == 1:
            style.append(('BACKGROUND', (0, i), (-1, i), GREY_BG))
    t.setStyle(TableStyle(style))
    return t


def checklist_item(text):
    """[ ] Big text"""
    row = Table(
        [[P('<font size="16">☐</font>', BODY), P(text, BODY_BIG)]],
        colWidths=[10 * mm, 155 * mm],
    )
    row.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    return row


def two_column_dos_donts(dos, donts):
    """Left green WOLNO, right red NIE WOLNO."""
    dos_lines = [P(f'<font size="13">✓</font>&nbsp;&nbsp;{x}', BODY) for x in dos]
    donts_lines = [P(f'<font size="13">✗</font>&nbsp;&nbsp;{x}', BODY) for x in donts]

    left = [[P('<font size="15" color="#047857"><b>✓ WOLNO CI</b></font>', BODY)]]
    for line in dos_lines:
        left.append([line])
    right = [[P('<font size="15" color="#DC2626"><b>✗ NIE WOLNO</b></font>', BODY)]]
    for line in donts_lines:
        right.append([line])

    left_t = Table(left, colWidths=[80 * mm])
    left_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GREEN_SOFT),
        ('BACKGROUND', (0, 0), (-1, 0), GREEN_SOFT),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (0, 0), 12),
        ('BOTTOMPADDING', (0, -1), (0, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    right_t = Table(right, colWidths=[80 * mm])
    right_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), RED_SOFT),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (0, 0), 12),
        ('BOTTOMPADDING', (0, -1), (0, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    outer = Table([[left_t, right_t]], colWidths=[80 * mm, 80 * mm])
    outer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LINEAFTER', (0, 0), (0, 0), 5 * mm, colors.white),  # gap between columns
    ]))
    return outer


def pay_table():
    rows = [
        [P('<b>Wariant</b>', TH), P('<b>Stawka</b>', TH), P('<b>Dla kogo</b>', TH)],
        [P('<b>Godzinowy</b>', BODY), P('25 - 35 zł/h + premia', BODY), P('Dopiero się uczysz', BODY)],
        [P('<b>Od wyniku</b>', BODY), P('30 - 50 zł za zarejestrowaną firmę', BODY), P('Masz doświadczenie', BODY)],
    ]
    t = Table(rows, colWidths=[30 * mm, 70 * mm, 65 * mm], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GREEN_DARK),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, 1), GREY_BG),
    ]))
    return t


def bonus_bar(amount, label, color=GREEN_DARK):
    bar = Table(
        [[P(f'<font size="18" color="{color.hexval()[:9]}"><b>{amount}</b></font>', BODY),
          P(label, BODY_BIG)]],
        colWidths=[35 * mm, 130 * mm],
    )
    bar.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, -1), GREEN_SOFT),
        ('LINEBEFORE', (0, 0), (0, -1), 5, GREEN_DARK),
    ]))
    return bar


def contact_card():
    dots = '........................................'
    rows = [
        [P('<b>Imię</b>', BODY_BIG), P(dots, BODY_BIG)],
        [P('<b>Telefon</b>', BODY_BIG), P(dots, BODY_BIG)],
        [P('<b>Email</b>', BODY_BIG), P('kontakt@mapjob.pl', BODY_BIG)],
        [P('<b>WhatsApp</b>', BODY_BIG), P(dots, BODY_BIG)],
    ]
    t = Table(rows, colWidths=[40 * mm, 125 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GREY_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.white),
    ]))
    return t


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------


def build(pdf_path):
    doc = BaseDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title='MapJob — Jak dzwonić do firm',
        author='MapJob',
        subject='Prosty przewodnik dla osoby dzwoniącej',
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='main')
    doc.addPageTemplates([PageTemplate(id='All', frames=frame, onPage=_decorate)])

    story = []

    # ========= COVER =========
    story.append(Spacer(1, 52 * mm))
    story.append(P('MapJob', COVER_BRAND))
    story.append(P('Jak dzwonić do firm', COVER_SUB))
    story.append(Spacer(1, 4 * mm))
    story.append(P('<b>Prosty przewodnik w 10 krokach</b>', COVER_MINI))

    story.append(Spacer(1, 35 * mm))

    dots = '.' * 40
    info = [
        [P('<b>Dla:</b>', BODY_BIG), P(dots, BODY_BIG)],
        [P('<b>Od:</b>', BODY_BIG), P(dots, BODY_BIG)],
        [P('<b>Data:</b>', BODY_BIG), P(dots, BODY_BIG)],
    ]
    info_t = Table(info, colWidths=[30 * mm, 125 * mm])
    info_t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GREY_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(info_t)

    story.append(Spacer(1, 35 * mm))
    story.append(P('Przeczytaj raz. Wydrukuj. Trzymaj przy telefonie.', COVER_MINI))

    story.append(PageBreak())

    # ========= PAGE 1: CO TO MAPJOB =========
    story.append(P('Co to MapJob?', H1))
    story.append(P('<b>Mapa z fachowcami.</b>', LEAD))
    story.append(P(
        'Jak Google Maps — ale tylko elektrycy, hydraulicy, spawacze, malarze. '
        'Firma wchodzi, widzi fachowców w okolicy, pisze do nich.',
        BODY_BIG,
    ))

    story.append(Spacer(1, 8 * mm))

    story.append(fact_card('1', 'Za darmo', 'Dla firm, które korzystają. Bez karty. Bez abonamentu.', color=GREEN))
    story.append(Spacer(1, 5 * mm))
    story.append(fact_card('2', 'Polska apka', 'Polski support. Serwery w UE. Pełna zgodność z RODO.', color=BLUE))
    story.append(Spacer(1, 5 * mm))
    story.append(fact_card('3', 'Logowanie Google', 'Klikasz „Zaloguj kontem Google". 2 sekundy. Bez hasła.', color=AMBER))

    story.append(Spacer(1, 10 * mm))

    story.append(big_callout(
        'Strona internetowa',
        '<b>mapjob.pl</b> — wchodzisz i widzisz mapę.',
        bg=BLUE_SOFT,
        accent=BLUE_DARK,
    ))

    story.append(PageBreak())

    # ========= PAGE 2: CO MASZ ROBIĆ =========
    story.append(P('Co masz robić', H1))
    story.append(P('Prostymi słowami. 7 kroków.', LEAD))
    story.append(Spacer(1, 4 * mm))

    steps = [
        '<b>Dzwonisz</b> do firmy z listy',
        '<b>Pytasz</b>, czy mają minutę',
        '<b>Mówisz</b>, co to MapJob',
        '<b>Słuchasz</b> ich problemów',
        '<b>Wysyłasz SMS</b> z linkiem',
        '<b>Zapisujesz</b> wynik w arkuszu',
        '<b>Dzwonisz znowu</b> za 2 dni',
    ]
    for i, s in enumerate(steps, 1):
        story.append(numbered_step(i, s))
        story.append(Spacer(1, 3 * mm))

    story.append(Spacer(1, 8 * mm))

    story.append(big_callout(
        '🎯 Jedyny cel',
        '<b>Firma klika link i loguje się kontem Google.</b> Tyle. Nic więcej.',
        bg=GREEN_SOFT,
        accent=GREEN_DARK,
    ))

    story.append(PageBreak())

    # ========= PAGE 3: KROK 1+2 =========
    story.append(P('Co mówić (część 1 z 3)', H1))

    story.append(P('Krok 1 — odbiera sekretarka', H2_GREEN))
    story.append(dialog_box(
        'TY:',
        'Dzień dobry, [Twoje imię] z MapJob. '
        'Chciałem rozmawiać z <b>osobą, która szuka fachowców do budynków</b>. '
        'Kto u Państwa tym się zajmuje?',
        who_color=GREEN_DARK,
    ))
    story.append(note_box('Nie mów „prezes" ani „zarząd" — sekretarka zablokuje.'))

    story.append(Spacer(1, 4 * mm))
    story.append(P('Krok 2 — decydent odebrał', H2_GREEN))
    story.append(dialog_box(
        'TY:',
        'Dzień dobry, Panie [imię]. [Twoje imię] z MapJob. '
        '<b>Mam jedno krótkie pytanie — mam minutę?</b>',
        who_color=GREEN_DARK,
    ))
    story.append(Spacer(1, 2 * mm))
    story.append(dialog_box(
        'ON/ONA:',
        '<b>„Tak"</b> → idziesz dalej (krok 3).<br/>'
        '<b>„Nie mam czasu"</b> → TY: „Rozumiem, kiedy oddzwonić, rano czy po południu?"',
        who_color=BLUE_DARK,
        bg=BLUE_SOFT,
    ))

    story.append(PageBreak())

    # ========= PAGE 4: KROK 3 =========
    story.append(P('Co mówić (część 2 z 3)', H1))

    story.append(P('Krok 3 — pytasz o ich problem', H2_GREEN))
    story.append(P('Wybierz pytanie pasujące do typu firmy:', BODY_BIG))
    story.append(Spacer(1, 3 * mm))
    story.append(question_table([
        ('Zarządca / wspólnota',
         'Ile Panu zajmuje znaleźć elektryka, gdy pilnie siądzie w bloku?'),
        ('Firma budowlana',
         'Jak często podwykonawca zawala i musicie go w 48h zastąpić?'),
        ('Agencja nieruchomości',
         'Kto u Państwa szuka fachowca, gdy klient prosi o naprawę przed zakupem?'),
        ('HR / fabryka / hotel',
         'Ile CV z OLX dostajecie — z tego ile ma realne uprawnienia?'),
    ]))

    story.append(Spacer(1, 6 * mm))
    story.append(big_callout(
        '⚡ Zasada złota',
        '<b>TERAZ SŁUCHAJ.</b> Milcz. Nie przerywaj. '
        'On sam sobie opowiada, co go boli. To dla Ciebie złoto.',
        bg=AMBER_SOFT,
        accent=AMBER,
    ))

    story.append(PageBreak())

    # ========= PAGE 5: KROK 4-5 =========
    story.append(P('Co mówić (część 3 z 3)', H1))

    story.append(P('Krok 4 — mówisz o MapJob', H2_GREEN))
    story.append(dialog_box(
        'TY:',
        'Czyli — jak dobrze rozumiem — <b>[powtarzasz ich ból ich słowami]</b>. Tak?',
        who_color=GREEN_DARK,
    ))
    story.append(Spacer(1, 2 * mm))
    story.append(dialog_box(
        'TY (po „tak"):',
        'OK, rozumiem. <b>Zrobiliśmy MapJob właśnie do tego.</b> '
        'Otwiera Pan mapę, widzi 10 fachowców w 3 km, każdy z oceną i zdjęciami. '
        'Pisze Pan jak na Messengerze. '
        '<b>Za darmo</b>, bez karty, bez prowizji. '
        'Logowanie Google — 2 sekundy.',
        who_color=GREEN_DARK,
    ))

    story.append(Spacer(1, 4 * mm))
    story.append(P('Krok 5 — uprzedź „gdzie haczyk"', H2_GREEN))
    story.append(dialog_box(
        'TY:',
        'Wiem, co Pan teraz pomyśli — <b>„za darmo, to gdzie haczyk".</b> '
        'Apka startuje w Polsce. <b>Pana konto zostanie darmowe na zawsze.</b> '
        'Za rok wejdą plany płatne — ale dla Pana nie.',
        who_color=GREEN_DARK,
    ))

    story.append(PageBreak())

    # ========= PAGE 6: KROK 6-7 =========
    story.append(P('Zamknięcie rozmowy', H1))

    story.append(P('Krok 6 — prosisz o zgodę na link', H2_GREEN))
    story.append(dialog_box(
        'TY:',
        'Prześlę link — <b>SMS-em czy mailem, co wygodniej?</b>',
        who_color=GREEN_DARK,
    ))
    story.append(Spacer(1, 2 * mm))
    story.append(dialog_box(
        'TY (po notowaniu):',
        'Super. Proszę kliknąć, zalogować Googlem, zobaczyć mapę. '
        '<b>Oddzwonię w piątek po południu</b>, żeby zapytać, czy przydało się. '
        'Pasuje około 15?',
        who_color=GREEN_DARK,
    ))

    story.append(Spacer(1, 4 * mm))
    story.append(P('Krok 7 — żegnasz się i wysyłasz SMS', H2_GREEN))
    story.append(dialog_box(
        'TY:',
        'Dziękuję Panu, SMS leci teraz. Miłego dnia!',
        who_color=GREEN_DARK,
    ))
    story.append(note_box('<b>Rozłączasz się pierwszy.</b> W ciągu minuty wysyłasz:'))
    story.append(Spacer(1, 2 * mm))

    sms_text = (
        'Cześć Panie [imię], [Twoje imię] z MapJob.<br/>'
        'Link: <b>https://mapjob.pl</b><br/>'
        'Zaloguj kontem Google — 2 sek.<br/>'
        'Oddzwonię [dzień, godzina]. Pozdrawiam!'
    )
    sms_box = Table([[P(sms_text, BODY_BIG)]], colWidths=[165 * mm])
    sms_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BLUE_SOFT),
        ('BOX', (0, 0), (-1, -1), 1, BLUE_DARK),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(sms_box)

    story.append(PageBreak())

    # ========= PAGE 7: OBJECTIONS =========
    story.append(P('Gdy powie X — odpowiadasz Y', H1))
    story.append(P('10 najczęstszych obiekcji. Naucz się na pamięć.', LEAD))
    story.append(Spacer(1, 2 * mm))

    story.append(objection_table([
        ('Nie mam czasu',
         'Kiedy oddzwonić — rano czy po południu?'),
        ('Wyślij maila',
         'Jasne. Ale jedno pytanie, żeby wysłać to, co pasuje...'),
        ('Mamy już OLX / Oferię',
         'Zna Pan temat. MapJob różni się tym, że zero kredytów — pisze Pan klientowi wprost.'),
        ('Za darmo = kiepskie',
         'Jesteśmy w fazie startu. Pana konto zostanie zawsze darmowe.'),
        ('Gdzie haczyk?',
         'Startujemy. Pierwsze firmy mają największą widoczność na mapie.'),
        ('Nie potrzebujemy',
         'Jak za 3 miesiące coś pilnego się wydarzy, fajnie mieć gotową listę. Wyślę link.'),
        ('Nie znam was',
         'Startujemy 2 miesiące temu. Dlatego dzwonię osobiście.'),
        ('Muszę zapytać szefa',
         'Jasne. Wyślę link SMS-em. Kiedy odprawa? Oddzwonię po niej.'),
        ('Sprzedacie moje dane',
         'Zero sprzedaży. Serwery w UE. Prześlę politykę prywatności.'),
        ('Nie jestem decydentem',
         'A kto jest? Mógłby Pan mnie skierować?'),
    ]))

    story.append(PageBreak())

    # ========= PAGE 8: PO ROZMOWIE =========
    story.append(P('Po rozmowie — 3 rzeczy', H1))
    story.append(P('W ciągu minuty po rozłączeniu:', LEAD))
    story.append(Spacer(1, 4 * mm))

    story.append(numbered_step(1, '<b>Wyślij SMS</b> z linkiem (szablon z kroku 7)'))
    story.append(Spacer(1, 4 * mm))
    story.append(numbered_step(
        2,
        '<b>Zapisz w arkuszu</b>: firma, osoba, status, notatka (1-2 zdania), data oddzwonienia',
        color=BLUE,
    ))
    story.append(Spacer(1, 4 * mm))
    story.append(numbered_step(
        3,
        '<b>Za 2 dni oddzwoń</b> i zapytaj: „Jak poszło — zerknął Pan na apkę?"',
        color=AMBER,
    ))

    story.append(Spacer(1, 12 * mm))

    story.append(big_callout(
        '📊 Statusy w arkuszu',
        '<b>ZAREJESTROWANA</b> — firma założyła konto • '
        '<b>DO ODDZWONIENIA</b> — zgodziła się na follow-up • '
        '<b>ODRZUCONA</b> — nie chce, nie dzwonimy więcej',
        bg=GREY_BG,
        accent=GREY_DARK,
    ))

    story.append(PageBreak())

    # ========= PAGE 9: ZASADY =========
    story.append(P('Zasady', H1))
    story.append(Spacer(1, 2 * mm))

    story.append(two_column_dos_donts(
        dos=[
            'Bądź sobą',
            'Mów swoim językiem',
            'Żartuj (kulturalnie)',
            'Dostosuj scenariusz',
            'Pytaj mnie o wszystko',
            'Rób 5 min przerwy co godzinę',
            'Odmawiaj dziwnych firm',
        ],
        donts=[
            'Nigdy nie kłam o produkcie',
            'Nie obiecuj rezultatów',
            'Nie dzwoń po 18:00',
            'Nie dzwoń przed 9:00',
            'Nie dzwoń w weekendy i święta',
            'Nie dzwoń >3× do tej samej firmy',
            'Nie udostępniaj listy nikomu',
        ],
    ))

    story.append(Spacer(1, 8 * mm))
    story.append(big_callout(
        '❗ Najważniejsze',
        '<b>Prawda > piękna historia.</b> '
        'Żadnego „mamy 42 tys. fachowców", „firma X zarobiła 85 tys.", „tylko 50 miejsc". '
        'To nieprawda i rozmówca wyczuje — jesteś spalony/a na zawsze.',
        bg=RED_SOFT,
        accent=RED,
    ))

    story.append(PageBreak())

    # ========= PAGE 10: PIENIĄDZE =========
    story.append(P('Ile pracujesz, ile zarabiasz', H1))
    story.append(P('<b>4 godziny dziennie = 20-25 rozmów.</b> Godziny ustalamy wspólnie.', LEAD))
    story.append(Spacer(1, 4 * mm))

    story.append(P('Dwa warianty płacenia — wybierasz jeden', H2))
    story.append(pay_table())

    story.append(Spacer(1, 8 * mm))
    story.append(P('Bonusy', H2))

    story.append(bonus_bar('+100 zł', 'za 10 zarejestrowanych firm w miesiącu'))
    story.append(Spacer(1, 3 * mm))
    story.append(bonus_bar('+400 zł', 'za 25 zarejestrowanych firm w miesiącu (łącznie)'))
    story.append(Spacer(1, 3 * mm))
    story.append(bonus_bar('+1100 zł', 'za 50 zarejestrowanych firm w miesiącu (łącznie)'))
    story.append(Spacer(1, 3 * mm))
    story.append(bonus_bar('+150 zł', 'za rekord tygodnia (najwięcej rejestracji)'))

    story.append(Spacer(1, 8 * mm))
    story.append(note_box(
        '<b>Wypłata:</b> raz w tygodniu, przelewem. &nbsp;&nbsp;'
        '<b>Umowa:</b> zlecenie. &nbsp;&nbsp;'
        '<b>Sprzęt:</b> Twój telefon i laptop.'
    ))

    story.append(PageBreak())

    # ========= PAGE 11: CONTACT =========
    story.append(P('Kontakt do mnie', H1))
    story.append(P('Pisz kiedy chcesz. Telefon mam zawsze włączony.', LEAD))
    story.append(Spacer(1, 4 * mm))

    story.append(contact_card())

    story.append(Spacer(1, 10 * mm))
    story.append(P('Kiedy pisać do mnie', H2))

    for t in [
        'Nie wiesz, co odpowiedzieć',
        'Rozmowa była dziwna',
        'Ktoś chce płatny plan (ja przejmuję)',
        'Chcesz coś zmienić w scenariuszu',
        'Czujesz się zgubiony/a — nie jesteś sam/a',
    ]:
        story.append(P(f'<font size="14">✓</font>&nbsp;&nbsp;{t}', BODY_BIG))
        story.append(Spacer(1, 2 * mm))

    story.append(Spacer(1, 6 * mm))
    story.append(big_callout(
        'Kiedy odpowiadam',
        '<b>SMS / WhatsApp:</b> w 30 minut w godz. 9-18. &nbsp;&nbsp;'
        '<b>Email:</b> w 24 godziny.',
        bg=BLUE_SOFT,
        accent=BLUE_DARK,
    ))

    story.append(PageBreak())

    # ========= PAGE 12: CHECKLIST =========
    story.append(P('Przed pierwszym telefonem', H1))
    story.append(P('Odhacz wszystko. Potem dzwoń.', LEAD))
    story.append(Spacer(1, 4 * mm))

    checklist = [
        'Przeczytałem/am ten PDF',
        'Podpisałem/am umowę zlecenie',
        'Dostałem/am listę firm (Google Sheets)',
        'Wiem, jakiego wariantu płacenia chcę',
        'Mam telefon naładowany',
        'Mam wodę i notatnik',
        'Mam 4 godziny bez zakłóceń',
        'Stoję lub siedzę wyprostowany/a',
        'Uśmiecham się przed pierwszym telefonem',
    ]
    for item in checklist:
        story.append(checklist_item(item))

    story.append(Spacer(1, 14 * mm))
    story.append(big_callout(
        '🚀 Gotowe',
        '<b>Dzwoń.</b> Pierwsza rozmowa jest najtrudniejsza. '
        'Od 20. rozmowy będzie płynnie.',
        bg=GREEN_SOFT,
        accent=GREEN_DARK,
    ))

    story.append(PageBreak())

    # ========= PAGE 13: PAMIĘTAJ (finał) =========
    story.append(P('Pamiętaj', H1))
    story.append(Spacer(1, 6 * mm))

    remembers = [
        ('1', 'Dzwonisz do ludzi, nie do robotów. Bądź człowiekiem.'),
        ('2', 'Odmowa to nie Twoja porażka. Oni nie odmawiają Tobie.'),
        ('3', 'Pierwsze 10 rozmów = nauka. Od 20. będzie płynnie.'),
        ('4', 'Prawda > piękna historia. Nie kłam nigdy.'),
        ('5', 'Mój telefon jest włączony zawsze. Pytaj.'),
    ]
    for n, txt in remembers:
        story.append(numbered_step(int(n), txt))
        story.append(Spacer(1, 6 * mm))

    story.append(Spacer(1, 10 * mm))
    story.append(P(
        '<font size="20" color="#047857"><b>Powodzenia. Trzymam kciuki.</b></font>',
        ParagraphStyle('FinalCenter', parent=BODY, alignment=TA_CENTER),
    ))
    story.append(Spacer(1, 6 * mm))
    story.append(P('— właściciel MapJob', SIG))

    doc.build(story)


if __name__ == '__main__':
    here = Path(__file__).resolve().parent
    out = here / 'MapJob-Brief-Helpera.pdf'
    build(str(out))
    print(f'Wrote: {out}')
