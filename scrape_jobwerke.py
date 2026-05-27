# -*- coding: utf-8 -*-
"""Parser ofert JobWerke (jobwerke.pl) — wyciąga właściwe sekcje z podstron /oferta/.
Buduje oferty-jobwerke.json w schemacie job_offers MapJob.
"""
import re, json, html as ihtml, subprocess, time

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

# miasto z tytułu (PL dopełniacz) -> niemieckie miasto do geokodu
CITY = {
    "kassel": "Kassel", "monachium": "München", "drezna": "Dresden",
    "berlina": "Berlin", "düsseldorf": "Düsseldorf", "dusseldorf": "Düsseldorf",
    "erfurtu": "Erfurt", "hanoweru": "Hannover", "magdeburga": "Magdeburg",
}

def fetch(url):
    r = subprocess.run(["curl", "-sSL", "--ssl-no-revoke", "--max-time", "25", "-A", UA, url],
                       capture_output=True)
    return r.stdout.decode("utf-8", "replace")

def clean(html_frag):
    h = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", html_frag, flags=re.S | re.I)
    h = re.sub(r"<br\s*/?>", "\n", h, flags=re.I)
    h = re.sub(r"</(p|div|li|h\d|tr)>", "\n", h, flags=re.I)
    h = re.sub(r"<li[^>]*>", "- ", h, flags=re.I)
    h = re.sub(r"<[^>]+>", " ", h)
    h = ihtml.unescape(h)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in h.split("\n")]
    return "\n".join(ln for ln in lines if ln)

def between(text, start, end):
    i = text.find(start)
    if i < 0: return ""
    i += len(start)
    j = len(text)
    for e in end:
        k = text.find(e, i)
        if k >= 0: j = min(j, k)
    return text[i:j].strip(" :\n-")

def city_from_title(title):
    m = re.search(r"okolic\w*\s+([A-Za-zÄÖÜäöüß]+)", title, re.I)
    cand = m.group(1) if m else ""
    de = CITY.get(cand.lower())
    if de: return de
    for k, v in CITY.items():
        if k in title.lower(): return v
    # spróbuj wprost niemieckiej nazwy w tytule
    for v in set(CITY.values()):
        if v.lower() in title.lower(): return v
    return cand or "Niemcy"

def map_cat(branza, stanowisko, title):
    s = (branza + " " + stanowisko + " " + title).lower()
    if "wózk" in s or "wozk" in s or "widłow" in s or "widlow" in s: return "driver"
    return "industry"  # magazyn/logistyka/komisjoner/sortownia/pracownik fizyczny

def parse_salary(content):
    # stawki godzinowe "14,96 EUR" / "18,70 EUR"
    hrs = [float(x.replace(",", ".")) for x in re.findall(r"(\d{1,2},\d{2})\s*EUR", content)]
    hrs = [h for h in hrs if 8 <= h <= 60]
    if hrs:
        smin, smax = min(hrs), max(hrs)
        return (smin, (smax if smax != smin else None), "hourly")
    m = re.search(r"do\s*(\d{3,4})\s*(?:euro|eur)", content, re.I)
    if m:
        return (None, float(m.group(1)), "monthly")
    return (None, None, "hourly")

bundle = json.load(open("_scraped_jobwerke_pl.json", encoding="utf-8"))
urls = [(o["url"], o["title"]) for o in bundle["offers"]]

offers = []
for i, (url, title) in enumerate(urls, 1):
    doc = fetch(url)
    full = clean(doc)
    # region treści: od "Szczegóły" do "APLIKUJ"/"Aplikuj lub"
    content = between(full, "Szczegóły", ["JOBWERKE SP", "Numer wpisu", "APLIKUJ", "Aplikuj lub"])
    if not content:
        content = full
    wyn = between(content, "Wynagrodzenie", ["Miejsce pracy", "Rodzaj"])
    rodzaj = between(content, "Rodzaj zatrudnienia", ["Branża"])
    branza = between(content, "Branża", ["Stanowisko"])
    stanowisko = between(content, "Stanowisko", ["Nasza oferta", "Oferujemy"])
    opis = between(content, "Nasza oferta", ["Oferujemy", "Aplikuj"])
    oferujemy = between(content, "Oferujemy", ["Aplikuj", "JOBWERKE", "Numer wpisu", "APLIKUJ"])
    smin, smax, stype = parse_salary(content)
    city = city_from_title(title)
    desc = (opis or "").strip()
    if oferujemy: desc += "\n\n✅ Oferujemy:\n" + oferujemy.strip()
    if wyn: desc += "\n\n💰 Wynagrodzenie: " + wyn.strip()
    desc += "\n\n🔗 Źródło: " + url
    offers.append({
        "company_name": "JobWerke",
        "title": title,
        "category": map_cat(branza, stanowisko, title),
        "category_source": branza or stanowisko,
        "location": city,
        "location_country": "Niemcy",
        "location_note": title,
        "location_lat": None, "location_lng": None,
        "employment_type": "full_time",
        "employment_type_source": rodzaj or "Praca Tymczasowa",
        "work_mode": "onsite",
        "salary_min": smin, "salary_max": smax,
        "salary_currency": "EUR", "salary_type": stype,
        "salary_note": wyn.strip() if wyn else "",
        "spots": "1",
        "is_urgent": ("od zaraz" in title.lower()),
        "description": desc,
        "requirements": "",
        "benefits": oferujemy.strip() if oferujemy else "",
        "source_url": url,
    })
    print(f"[{i}/{len(urls)}] {city} | {title[:45]} | sal={smin}-{smax}/{stype}", flush=True)
    time.sleep(0.2)

out = {
    "_meta": {
        "company": "JobWerke Sp. z o.o.", "kraz": "21848",
        "source": "https://jobwerke.pl/oferty-pracy/",
        "scraped_at": time.strftime("%Y-%m-%d"),
        "offers_found": len(offers),
        "note": "Oferty pracy fizycznej/magazynowej w Niemczech (agencja). Lokalizacje = miasta niemieckie z tytułu (do geokodu przy imporcie).",
    },
    "offers": offers,
}
json.dump(out, open("oferty-jobwerke.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
from collections import Counter
print("\nZAPISANO oferty-jobwerke.json:", len(offers), "ofert")
print("Miasta:", dict(Counter(o["location"] for o in offers)))
print("Z opisem:", sum(1 for o in offers if len(o["description"]) > 120), "| Ze stawką:", sum(1 for o in offers if o["salary_min"] or o["salary_max"]))
