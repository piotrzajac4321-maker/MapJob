# -*- coding: utf-8 -*-
"""Scraper ofert Pramer (pramer.pl/aktualne-oferty).
Pobiera listę WSZYSTKICH ofert + dociąga każdą podstronę /view po pełny opis,
mapuje na schemat job_offers MapJob i zapisuje oferty-pramer.json (utf-8).
Uruchom: python scrape_pramer.py
"""
import re, json, html as ihtml, subprocess, sys, time

BASE = "https://www.pramer.pl"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

def fetch(url):
    r = subprocess.run(
        ["curl", "-sS", "--ssl-no-revoke", "--max-time", "25", "-A", UA, url],
        capture_output=True)
    return r.stdout.decode("utf-8", "replace")

def clean(s):
    return ihtml.unescape(re.sub(r"\s+", " ", s or "").strip())

def strip_tags_to_text(html_frag):
    h = re.sub(r"src=\"data:image/[^\"]+\"", "", html_frag)
    h = re.sub(r"<img[^>]*>", "", h)
    h = re.sub(r"<br\s*/?>", "\n", h, flags=re.I)
    h = re.sub(r"</p>|</h\d>|</li>", "\n", h, flags=re.I)
    h = re.sub(r"<li[^>]*>", "- ", h, flags=re.I)
    h = re.sub(r"<[^>]+>", "", h)
    h = ihtml.unescape(h)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in h.split("\n")]
    lines = [ln for ln in lines if ln]
    return "\n".join(lines)

# ---- mapowania na enumy MapJob ----
def map_category(sector):
    s = (sector or "").lower()
    if "ogrodnic" in s or "szklarn" in s: return "garden"
    if "budownic" in s: return "construction"
    if "wózki" in s or "wozki" in s: return "driver"
    if "magazyn" in s or "logist" in s or "produkc" in s or "sortown" in s or "montaż" in s or "montaz" in s: return "industry"
    return "other"

def map_employment(contract_len, full_text):
    t = (contract_len or "").lower()
    if "sezon" in t: return "dorywcza"
    if "doryw" in t: return "dorywcza"
    return "etat"  # umowa holenderska / CAO / długoterminowa

def parse_salary(wyn_text):
    """Zwraca (min,max,currency) z tekstu wynagrodzenia."""
    if not wyn_text: return (None, None, None)
    cur = None
    if "€" in wyn_text or "eur" in wyn_text.lower(): cur = "EUR"
    elif "kč" in wyn_text.lower() or "czk" in wyn_text.lower(): cur = "CZK"
    elif "zł" in wyn_text.lower() or "pln" in wyn_text.lower(): cur = "PLN"
    nums = [float(x.replace(",", ".")) for x in re.findall(r"\d+[.,]?\d*", wyn_text)]
    nums = [n for n in nums if 1 <= n <= 100]  # stawki godzinowe/realne, odfiltruj duże (tygodniówki/€600)
    smin = min(nums) if nums else None
    smax = max(nums) if nums else None
    if smin == smax: smax = None
    return (smin, smax, cur)

# ---- 1) lista ----
print("Pobieram listę ofert...", flush=True)
listing = fetch(BASE + "/aktualne-oferty")
blocks = re.split(r'<div class="col mb-5 offer-tile">', listing)[1:]
print("Znaleziono kart:", len(blocks), flush=True)

def grab(p, b, d=""):
    m = re.search(p, b, re.S)
    return clean(m.group(1)) if m else d

offers = []
seen = set()
for b in blocks:
    oid = grab(r"aktualne-oferty/(\d+)/view", b)
    if not oid or oid in seen: continue
    seen.add(oid)
    title = grab(r"<h5[^>]*>(.*?)</h5>", b)
    country = grab(r'country-row">(.*?)</div>', b)
    badge = grab(r'badge position-absolute"[^>]*>(.*?)</div>', b)
    tags_raw = grab(r'<p class="hidden">(.*?)</p>', b)
    tags = [re.sub(r"^[,\s]+", "", t).strip() for t in tags_raw.split("|") if t.strip()]
    # klasyfikacja tagów po słowach kluczowych
    spots = experience = contract_len = driving = language = ""
    sectors = []
    for t in tags:
        tl = t.lower()
        if "miejsc" in tl or "wakat" in tl or " par" in tl: spots = t
        elif tl in ("bez doświadczenia", "wymagane doświadczenie"): experience = t
        elif tl in ("długoterminowa", "sezonowa", "dorywcza", "dodatkowa"): contract_len = t
        elif "prawo jazdy" in tl: driving = t
        elif "język" in tl or "angielski" in tl or "czeski" in tl or "holendersk" in tl or "znajomośc" in tl: language = t
        elif t == country: pass
        else: sectors.append(t)
    sector = ", ".join(sectors)
    # lokalizacja z nawiasu w tytule
    mloc = re.search(r"\(([^)]+)\)", title)
    loc_note = mloc.group(1) if mloc else ""
    city = re.split(r"[\/,]", loc_note)[0].strip() if loc_note else ""
    offers.append(dict(id=oid, title=title, country=country, badge=badge,
                       spots=spots, experience=experience, contract_len=contract_len,
                       driving=driving, language=language, sector=sector,
                       loc_note=loc_note, city=city))

# ---- 2) szczegóły każdej oferty ----
out = []
for i, o in enumerate(offers, 1):
    print(f"[{i}/{len(offers)}] oferta {o['id']} — {o['title'][:50]}", flush=True)
    det = fetch(f"{BASE}/aktualne-oferty/{o['id']}/view")
    m = re.search(r'<div class="offer container">(.*?)</div>\s*</section>', det, re.S)
    full_text = strip_tags_to_text(m.group(1)) if m else ""
    # sekcje
    def section(name, text):
        mm = re.search(name + r"\s*:?\s*\n?(.*?)(?=\n[A-ZŁŚŻ][\wąćęłńóśźż ]{2,40}:|\Z)", text, re.S | re.I)
        return mm.group(1).strip() if mm else ""
    opis = section("Opis pracy", full_text)
    wyn = section("Wynagrodzenie", full_text)
    miejsca = section("Liczba miejsc", full_text)
    wymagania = section("Wymagania", full_text)
    oferujemy = section("Oferujemy", full_text)
    smin, smax, cur = parse_salary(wyn or o["badge"])
    out.append({
        "company_name": "Pramer",
        "title": o["title"],
        "category": map_category(o["sector"]),
        "category_source": o["sector"],
        "location": o["city"] or o["country"],
        "location_country": o["country"],
        "location_note": o["loc_note"],
        "location_street": None, "location_zip": None,
        "location_lat": None, "location_lng": None,
        "employment_type": map_employment(o["contract_len"], full_text),
        "employment_type_source": o["contract_len"],
        "work_mode": "onsite",
        "salary_min": smin, "salary_max": smax,
        "salary_currency": cur or "EUR", "salary_type": "/h",
        "salary_note": clean(wyn),
        "spots": o["spots"],
        "experience": o["experience"],
        "driving_license": o["driving"],
        "language": o["language"],
        "badge": o["badge"],
        "is_urgent": o["badge"].lower() in ("od zaraz", "pilne"),
        "description": opis or full_text,
        "requirements": wymagania,
        "benefits": oferujemy,
        "sector": o["sector"],
        "source_url": f"{BASE}/aktualne-oferty/{o['id']}/view"
    })
    time.sleep(0.2)

result = {
    "_meta": {
        "company": "Pramer (Agencja Pracy)",
        "nip": "6472487018", "kraz": "10850",
        "source": BASE + "/aktualne-oferty",
        "scraped_at": time.strftime("%Y-%m-%d"),
        "scraped_by": "MapJob scraper (curl + parser, JS-render bypass)",
        "offers_found": len(out),
        "note": "Pełna lista ofert z listingu + szczegóły z podstron /view. Wcześniejszy WebFetch widział tylko 1 ofertę (mały model uciął stronę 3.6MB) — naprawione parserem surowego HTML.",
        "review_needed": [
            "category — zmapowane na enumy MapJob (industry/garden/construction/driver/other) z pola sektor; oryginał w category_source",
            "employment_type — agencja/praca tymczasowa; długoterminowa→etat, sezonowa→dorywcza; oryginał w employment_type_source",
            "salary — wyciągane heurystycznie z tekstu (stawka godzinowa); pełny zapis w salary_note; część ofert może nie mieć kwoty",
            "location_lat/lng — puste; do geokodowania przy imporcie"
        ]
    },
    "offers": out
}
with open("oferty-pramer.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print("ZAPISANO oferty-pramer.json:", len(out), "ofert", flush=True)
# podsumowanie krótkie (ascii-safe)
from collections import Counter
print("Kraje:", dict(Counter(o["location_country"] for o in out)))
print("Kategorie:", dict(Counter(o["category"] for o in out)))
print("Z kwotą:", sum(1 for o in out if o["salary_min"]))
