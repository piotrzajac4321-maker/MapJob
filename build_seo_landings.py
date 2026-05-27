#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MapJob — generator SEO (statyczne HTML).

Buduje 3 typy stron z jednego źródła prawdy (oferty-snapshot.json):

  1. LISTINGI (`/praca-<...>/index.html`)
     8 stron typu „Praca w X" — agreguje pasujące oferty pod fraze long-tail.

  2. OFERTY POJEDYNCZE (`/oferta/<slug>-<short_id>/index.html`)
     Jedna strona = jedna oferta. Pełny JobPosting JSON-LD (rich snippet
     w Google), BreadcrumbList, OG/Twitter meta, 3 podobne oferty.

  3. SITEMAP (`/sitemap.xml`)
     Zbiera wszystkie wygenerowane URL-e + statyczne + home.
     `lastmod` z updated_at oferty (offer pages) lub daty buildu (listingi).

Wszystko statyczne, zero JS-hydration. Każda strona ma unikalny content
z DB — żadnych doorway pages.

Uruchomienie:
    python build_seo_landings.py
"""
import json
import os
import re
import sys
import unicodedata
import html as html_lib
from datetime import date, datetime, timedelta
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://mapjob.pl"
TODAY = date.today()
TODAY_ISO = TODAY.isoformat()
VALID_THROUGH = (TODAY + timedelta(days=180)).isoformat()  # +6 mies. (Google wymaga)

# Tryb pracy:
#   - LOCAL DEV: czyta oferty-snapshot.json (świeży snapshot trzymany w repo dla offline pracy)
#   - CI BUILD (Vercel): pobiera live z Supabase REST gdy ustawione env vars
#     SUPABASE_URL + SUPABASE_ANON_KEY
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
FORCE_REMOTE = os.environ.get("SEO_FETCH_REMOTE") == "1"

# ============================================================
# DANE
# ============================================================

def fetch_from_supabase():
    """Pobiera aktywne oferty z Supabase REST API (do użytku w CI build)."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("Brak SUPABASE_URL / SUPABASE_ANON_KEY w env")
    url = f"{SUPABASE_URL}/rest/v1/job_offers?status=eq.active&select=*&order=short_id.asc"
    print(f"  → fetch {SUPABASE_URL}/rest/v1/job_offers (status=active)")
    req = Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json",
        "Prefer": "count=exact",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (URLError, HTTPError) as e:
        raise RuntimeError(f"Supabase fetch failed: {e}")
    # numeric salary normalize
    for o in data:
        for k in ("salary_min", "salary_max"):
            if o.get(k) is not None:
                try:
                    o[k] = float(o[k])
                except (TypeError, ValueError):
                    pass
    return data


def load_offers():
    """Źródło prawdy:
       1. Vercel/CI build: jeśli SUPABASE_URL+KEY w env → live fetch z REST.
       2. Local dev: czyta oferty-snapshot.json (regenerowany przez _extract_db_snapshot.py).
    """
    snapshot_path = os.path.join(ROOT, "oferty-snapshot.json")
    use_remote = FORCE_REMOTE or (SUPABASE_URL and SUPABASE_KEY)

    if use_remote:
        print("Tryb: LIVE z Supabase REST")
        offers = fetch_from_supabase()
        print(f"  Pobrano: {len(offers)} ofert")
    elif os.path.exists(snapshot_path):
        print(f"Tryb: snapshot lokalny ({snapshot_path})")
        with open(snapshot_path, encoding="utf-8") as f:
            offers = json.load(f)["offers"]
    else:
        raise RuntimeError(
            "Brak oferty-snapshot.json i brak SUPABASE_URL w env. "
            "Ustaw zmienne lub uruchom _extract_db_snapshot.py."
        )

    # Wzbogać o source_url ze scrape'ów (DB nie zapisała) — match po tytule
    scraped_source_urls = {}
    for fn in ("oferty-pramer.json", "oferty-jobwerke.json"):
        path = os.path.join(ROOT, fn)
        if not os.path.exists(path):
            continue
        sj = json.load(open(path, encoding="utf-8"))
        for so in sj.get("offers", []):
            su = so.get("source_url")
            if su and so.get("title"):
                scraped_source_urls[so["title"].strip().lower()] = su

    for o in offers:
        key = (o.get("title") or "").strip().lower()
        if key in scraped_source_urls and not o.get("source_url"):
            o["source_url"] = scraped_source_urls[key]
        # parsing source_url z opisu typu "🔗 Źródło: https://..."
        if not o.get("source_url"):
            desc = o.get("description") or ""
            m = re.search(r"https?://\S+", desc)
            if m:
                # ale tylko jeśli to NIE jest link do mapjob
                url = m.group(0).rstrip(")\".,;")
                if "mapjob.pl" not in url:
                    o["source_url"] = url
        # derive country
        o["location_country"] = derive_country(o)
        # derive employment_type_label
        o["employment_type_label"] = label_employment(o.get("employment_type"))
        # ensure description has content
        if not (o.get("description") or "").strip():
            o["description"] = o.get("title") or ""

    return offers


def derive_country(o):
    """Wywnioskuj kraj z waluty + współrzędnych."""
    cur = (o.get("salary_currency") or "").upper()
    lat = o.get("location_lat")
    lng = o.get("location_lng")
    if cur == "PLN":
        return "Polska"
    if cur == "CZK":
        return "Czechy"
    if cur == "EUR":
        # Holandia: 50.7–53.6 lat, 3.4–7.3 lng
        if lat is not None and lng is not None and 50.7 <= lat <= 53.6 and 3.3 <= lng <= 7.3:
            return "Holandia"
        # Niemcy: szerokie
        if lat is not None and lng is not None and 47.0 <= lat <= 55.1 and 5.8 <= lng <= 15.1:
            return "Niemcy"
    # fallback z lat/lng (bez waluty)
    if lat is not None and lng is not None:
        if 49 <= lat <= 55 and 14 <= lng <= 24:
            return "Polska"
    return ""


EMPLOYMENT_LABELS = {
    "etat": "Umowa o pracę",
    "full_time": "Pełny etat",
    "part_time": "Część etatu",
    "temporary": "Praca tymczasowa",
    "zlecenie": "Umowa zlecenie",
    "b2b": "Kontrakt B2B",
    "internship": "Staż / praktyka",
}

def label_employment(emp):
    if not emp:
        return ""
    return EMPLOYMENT_LABELS.get(emp.lower(), emp)


# ============================================================
# UTILS
# ============================================================

def slugify(txt, maxlen=60):
    txt = unicodedata.normalize("NFKD", txt or "")
    # ASCII transliteration (zachowuje rdzeń słowa)
    txt = txt.encode("ascii", "ignore").decode("ascii")
    txt = re.sub(r"[^a-zA-Z0-9]+", "-", txt).strip("-").lower()
    if len(txt) > maxlen:
        txt = txt[:maxlen].rsplit("-", 1)[0]
    return txt or "x"


def offer_slug(o):
    """Slug strony oferty: <slug-tytułu>-<short_id>."""
    sid = o.get("short_id")
    base = slugify(o.get("title") or "oferta", maxlen=52)
    return f"{base}-{sid}" if sid else base


def offer_url_path(o):
    return f"/oferta/{offer_slug(o)}/"


def offer_canonical(o):
    return SITE + offer_url_path(o)


def fmt_salary(o, short=False):
    smin = o.get("salary_min")
    smax = o.get("salary_max")
    cur = (o.get("salary_currency") or "").strip()
    typ = (o.get("salary_type") or "").strip().lower()
    if typ in ("hourly", "/h", "h"):
        unit = "/h"
    elif typ in ("monthly", "/mc", "/m", "mies.", "mies"):
        unit = "/mc"
    elif typ == "project":
        unit = "/kurs"
    elif typ == "total":
        unit = ""
    else:
        unit = ""
    if smin is None and smax is None:
        return ""
    def f(v):
        return f"{int(v)}" if float(v).is_integer() else f"{v:g}"
    if smin and smax and smin != smax:
        return f"{f(smin)}–{f(smax)} {cur}{unit}".strip()
    if smin and smax and smin == smax:
        return f"{f(smin)} {cur}{unit}".strip()
    if smin:
        return f"od {f(smin)} {cur}{unit}".strip()
    if smax:
        return f"do {f(smax)} {cur}{unit}".strip()
    return ""


def offer_tags(o):
    """Tagi (lowercase) do dopasowania landingów."""
    t = set()
    cat = (o.get("category") or "").lower()
    if cat:
        t.add(cat)
    src = (o.get("category_source") or "").lower()
    for piece in re.split(r"[,/]", src):
        piece = piece.strip()
        if piece:
            t.add(piece)
    title = (o.get("title") or "").lower()
    for kw in ("magazyn", "magazynier", "komisjon", "komisjoner", "produkcja",
              "kierowca", "spawacz", "operator", "monter", "ogrodnictwo",
              "sortown", "logist", "wózk", "wozk", "trener", "fryzjer",
              "florysta", "promotor"):
        if kw in title:
            t.add(kw)
    return t


def trim(text, n):
    text = re.sub(r"\s+", " ", (text or "").strip())
    return text if len(text) <= n else text[:n-1].rstrip() + "…"


# ============================================================
# JSON-LD (schema.org)
# ============================================================

JOB_EMPLOYMENT_MAP = {
    "etat": "FULL_TIME", "full_time": "FULL_TIME",
    "part_time": "PART_TIME", "temporary": "TEMPORARY",
    "zlecenie": "CONTRACTOR", "b2b": "CONTRACTOR",
    "internship": "INTERN",
}

COUNTRY_ISO = {"Polska": "PL", "Niemcy": "DE", "Holandia": "NL", "Czechy": "CZ"}

def jobposting_jsonld(o):
    title = o.get("title") or "Oferta pracy"
    desc_text = (o.get("description") or "").strip()
    # Google: description w HTML, min ~50 zn; usuń linki źródła z końca
    desc_text = re.sub(r"🔗\s*Źródło:.*$", "", desc_text, flags=re.S).strip()
    desc_html = html_lib.escape(desc_text).replace("\n", "<br/>")
    if len(desc_html) < 50:
        desc_html = html_lib.escape(title) + "<br/>" + html_lib.escape(
            (o.get("location") or "") + " · " + (o.get("company_name") or "")
        )

    country = o.get("location_country") or ""
    iso = COUNTRY_ISO.get(country, "")
    locality = o.get("location") or ""
    street = o.get("location_street") or ""
    zip_code = o.get("location_zip") or ""

    emp_raw = (o.get("employment_type") or "").lower()
    emp_enum = JOB_EMPLOYMENT_MAP.get(emp_raw, "OTHER")

    data = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": title,
        "description": desc_html,
        "datePosted": (o.get("created_at") or TODAY_ISO)[:10],
        "validThrough": VALID_THROUGH,
        "employmentType": emp_enum,
        "identifier": {
            "@type": "PropertyValue",
            "name": "MapJob",
            "value": str(o.get("short_id") or o.get("id") or ""),
        },
        "hiringOrganization": {
            "@type": "Organization",
            "name": o.get("company_name") or "Pracodawca",
            "sameAs": o.get("source_url") or SITE,
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": locality,
                "addressRegion": "",
                "addressCountry": iso or country,
                **({"streetAddress": street} if street else {}),
                **({"postalCode": zip_code} if zip_code else {}),
            }
        },
        "directApply": False,
        "url": offer_canonical(o),
    }
    if o.get("company_logo"):
        data["hiringOrganization"]["logo"] = o["company_logo"]

    # baseSalary — tylko jeśli mamy wartość
    smin = o.get("salary_min")
    smax = o.get("salary_max")
    cur = (o.get("salary_currency") or "EUR").upper()
    typ = (o.get("salary_type") or "").lower()
    if smin or smax:
        unit_map = {"hourly": "HOUR", "monthly": "MONTH", "mies.": "MONTH",
                   "project": "HOUR", "total": "MONTH"}
        unit = unit_map.get(typ, "HOUR")
        val = {"@type": "QuantitativeValue", "unitText": unit}
        if smin and smax and smin != smax:
            val["minValue"] = smin
            val["maxValue"] = smax
        elif smin and smax:
            val["value"] = smin
        elif smin:
            val["value"] = smin
        else:
            val["value"] = smax
        data["baseSalary"] = {
            "@type": "MonetaryAmount",
            "currency": cur,
            "value": val,
        }
    return data


def breadcrumb_jsonld(items):
    """items = [(name, url|None), ...]"""
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name,
             **({"item": url} if url else {})}
            for i, (name, url) in enumerate(items)
        ],
    }


def ld_script(data):
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


# ============================================================
# WSPÓLNY CSS (one source of truth)
# ============================================================

COMMON_CSS = """:root{--bg:#0B0D10;--surf:#15181F;--surf2:#1C2029;--border:rgba(255,255,255,.09);--border2:rgba(255,255,255,.14);
--text:#F5F7FA;--text2:#A1A9B8;--text3:#6B7280;--blue:#2D7FF9;--blue2:#60A5FA;--green:#10B981;--gold:#D97706;
--ff:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--ff);background:#070809;color:var(--text);-webkit-font-smoothing:antialiased;line-height:1.55}
a{color:var(--blue2);text-decoration:none}a:hover{text-decoration:underline}
.topbar{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:12px;padding:13px 22px;background:rgba(7,8,9,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.topbar .logo{display:flex;align-items:center;gap:8px;font-weight:900;font-size:18px;letter-spacing:-.5px;color:var(--text)}
.topbar .logo .dot{width:26px;height:26px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:14px}
.topbar .nav{margin-left:auto;display:flex;gap:14px;font-size:13px;font-weight:700}
.crumbs{font-size:12px;color:var(--text3);margin-bottom:14px}
.crumbs a{color:var(--text3)}.crumbs span{margin:0 7px}
.foot{margin-top:38px;padding-top:20px;border-top:1px solid var(--border);font-size:12px;color:var(--text3);line-height:1.6}
.foot a{color:var(--text2)}"""


def common_head(*, title, meta_desc, canonical, og_type="website", extra_ld=()):
    """Wspólne tagi <head> dla wszystkich SEO stron."""
    parts = [
        '<meta charset="UTF-8"/>',
        '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>',
        f'<title>{html_lib.escape(title)}</title>',
        f'<meta name="description" content="{html_lib.escape(meta_desc)}"/>',
        f'<link rel="canonical" href="{canonical}"/>',
        '<meta name="robots" content="index,follow,max-image-preview:large"/>',
        # Open Graph
        f'<meta property="og:title" content="{html_lib.escape(title)}"/>',
        f'<meta property="og:description" content="{html_lib.escape(meta_desc)}"/>',
        f'<meta property="og:url" content="{canonical}"/>',
        f'<meta property="og:type" content="{og_type}"/>',
        '<meta property="og:site_name" content="MapJob"/>',
        '<meta property="og:locale" content="pl_PL"/>',
        f'<meta property="og:image" content="{SITE}/icons/icon-512.png"/>',
        # Twitter
        '<meta name="twitter:card" content="summary_large_image"/>',
        f'<meta name="twitter:title" content="{html_lib.escape(title)}"/>',
        f'<meta name="twitter:description" content="{html_lib.escape(meta_desc)}"/>',
        f'<meta name="twitter:image" content="{SITE}/icons/icon-512.png"/>',
        # Other
        '<meta name="theme-color" content="#0B0D10"/>',
        '<link rel="icon" href="/icons/icon-192.png"/>',
        '<link rel="apple-touch-icon" href="/icons/icon-192.png"/>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"/>',
    ]
    for ld in extra_ld:
        parts.append(ld_script(ld))
    return "\n".join(parts)


# ============================================================
# LISTING PAGES (8 landingów)
# ============================================================

LISTING_CSS = """.wrap{max-width:1080px;margin:0 auto;padding:24px 22px 60px}
h1{font-size:34px;font-weight:900;letter-spacing:-.8px;line-height:1.1;margin:0 0 8px}
.lead{font-size:15px;color:var(--text2);max-width:760px;line-height:1.6;margin-bottom:6px}
.stats{display:flex;gap:18px;flex-wrap:wrap;margin:18px 0 26px;font-size:13px;color:var(--text2)}
.stats b{color:var(--text);font-weight:800}
.cta-hero{display:inline-flex;align-items:center;gap:8px;background:var(--blue);color:#fff;font-weight:800;font-size:14.5px;padding:13px 22px;border-radius:11px;margin-bottom:22px}
.cta-hero:hover{text-decoration:none;background:#1f6ce0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
.offer{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:16px 16px 14px;display:flex;flex-direction:column;gap:8px;text-decoration:none;color:var(--text)}
.offer:hover{border-color:var(--border2);text-decoration:none}
.offer-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.offer-title{font-size:14.5px;font-weight:800;line-height:1.3;color:var(--text);flex:1}
.salary{font-size:13px;font-weight:900;color:var(--green);white-space:nowrap}
.offer-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--text2)}
.offer-comp{color:var(--text3)}
.offer-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
.chip{font-size:10.5px;font-weight:700;color:var(--text2);background:var(--surf2);border:1px solid var(--border);border-radius:999px;padding:4px 9px}
.offer-cta{font-size:12px;font-weight:800;color:var(--blue2);margin-top:6px}
.cross{margin-top:42px;padding:22px;background:var(--surf);border:1px solid var(--border);border-radius:16px}
.cross h2{font-size:18px;font-weight:900;margin-bottom:10px;letter-spacing:-.3px}
.cross .sub{font-size:13px;color:var(--text3);margin-bottom:14px}
.cross-links{display:flex;flex-wrap:wrap;gap:8px}
.cross-links a{font-size:13px;font-weight:700;color:var(--text);background:var(--surf2);border:1px solid var(--border2);border-radius:999px;padding:9px 14px}
.cross-links a:hover{text-decoration:none;border-color:var(--blue);color:var(--blue2)}
@media(max-width:640px){h1{font-size:26px}.wrap{padding:18px 16px 40px}}"""


def listing_offer_card(o):
    title = html_lib.escape(o.get("title") or "")
    company = html_lib.escape(o.get("company_name") or "")
    locality = html_lib.escape(o.get("location") or "")
    country = html_lib.escape(o.get("location_country") or "")
    sal = html_lib.escape(fmt_salary(o))
    loc_full = f"{locality}, {country}" if locality and country else (locality or country)

    chips = []
    emp_label = o.get("employment_type_label")
    if emp_label:
        chips.append(f'<span class="chip">{html_lib.escape(emp_label)}</span>')
    spots = o.get("spots")
    if spots:
        chips.append(f'<span class="chip">{spots} miejsc</span>')
    if o.get("is_urgent"):
        chips.append('<span class="chip" style="color:#fcd34d;background:rgba(245,158,11,.10);border-color:rgba(245,158,11,.35)">⚡ Pilne</span>')
    chips_html = "".join(chips)
    salary_html = f'<div class="salary">{sal}</div>' if sal else ""

    return f"""<a class="offer" href="{offer_url_path(o)}">
  <div class="offer-head">
    <h3 class="offer-title">{title}</h3>
    {salary_html}
  </div>
  <div class="offer-meta">
    <span class="offer-loc">📍 {loc_full}</span>
    <span class="offer-comp">{company}</span>
  </div>
  <div class="offer-chips">{chips_html}</div>
  <div class="offer-cta">Zobacz pełną ofertę →</div>
</a>"""


def render_listing(*, slug, title, meta_desc, h1, lead, offers, extra_stats, cross_links, parent_crumb):
    canonical = f"{SITE}/{slug}/"
    breadcrumbs = [("Strona główna", SITE + "/")]
    if parent_crumb:
        breadcrumbs.append(parent_crumb)
    breadcrumbs.append((h1, canonical))

    extra_ld = [breadcrumb_jsonld(breadcrumbs)]

    head = common_head(
        title=title, meta_desc=meta_desc, canonical=canonical,
        og_type="website", extra_ld=extra_ld,
    )

    crumb_html = ('<a href="/">Strona główna</a>'
                  + (f'<span>›</span><a href="{parent_crumb[1]}">{html_lib.escape(parent_crumb[0])}</a>' if parent_crumb else "")
                  + f'<span>›</span>{html_lib.escape(h1)}')

    offers_html = "".join(listing_offer_card(o) for o in offers) if offers else \
                  '<div class="empty" style="padding:30px;text-align:center;color:var(--text3);background:var(--surf);border:1px dashed var(--border2);border-radius:14px">Brak ofert pasujących do tej kategorii w tej chwili — sprawdź <a href="/">mapę MapJob</a>.</div>'

    cross_html = "".join(f'<a href="/{s}/">{html_lib.escape(l)}</a>' for s, l in cross_links)

    return f"""<!DOCTYPE html>
<html lang="pl">
<head>
{head}
<style>
{COMMON_CSS}
{LISTING_CSS}
</style>
</head>
<body>
<header class="topbar">
  <a href="/" class="logo"><span class="dot">📍</span><span>Map<span style="color:var(--blue2)">Job</span></span></a>
  <nav class="nav">
    <a href="/">Mapa ofert</a>
    <a href="/?action=add-pin">Dodaj ogłoszenie</a>
  </nav>
</header>
<main class="wrap">
  <nav class="crumbs">{crumb_html}</nav>
  <h1>{html_lib.escape(h1)}</h1>
  <p class="lead">{html_lib.escape(lead)}</p>
  <div class="stats">
    <span><b>{len(offers)}</b> aktualnych ofert</span>
    {extra_stats}
  </div>
  <a class="cta-hero" href="/?utm_source=mapjob-seo&amp;utm_medium=landing&amp;utm_campaign={slug}">Otwórz mapę z ofertami →</a>

  <section class="grid">
{offers_html}
  </section>

  <section class="cross">
    <h2>Zobacz też podobne wyszukiwania</h2>
    <p class="sub">Inne kategorie i lokalizacje z aktualnymi ofertami na MapJob:</p>
    <div class="cross-links">
{cross_html}
    </div>
  </section>

  <footer class="foot">
    <p><b>MapJob</b> to mapa ogłoszeń o pracę — pokazujemy oferty pracodawców i agencji pracy w jednym miejscu, geolokalizowane na interaktywnej mapie. Oferty na tej stronie pochodzą od zewnętrznych pracodawców i agencji pracy tymczasowej; aplikujesz bezpośrednio u nich lub przez MapJob.</p>
    <p style="margin-top:10px"><a href="/">Strona główna</a> · <a href="/regulamin.html">Regulamin</a> · <a href="/polityka-prywatnosci.html">Polityka prywatności</a></p>
  </footer>
</main>
</body>
</html>
"""


# ============================================================
# OFFER PAGE (1 strona na ofertę)
# ============================================================

OFFER_CSS = """.wrap{max-width:920px;margin:0 auto;padding:24px 22px 60px}
.head-row{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;margin-bottom:6px}
.logo-tile{width:64px;height:64px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:30px;font-weight:900;color:#0a1228;overflow:hidden}
.logo-tile img{width:100%;height:100%;object-fit:contain}
.head-main{flex:1;min-width:240px}
h1{font-size:28px;font-weight:900;letter-spacing:-.6px;line-height:1.15;margin-bottom:6px}
.subt{font-size:14.5px;color:var(--text2)}
.subt b{color:var(--text);font-weight:800}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:22px 0 26px}
.fact{background:var(--surf);border:1px solid var(--border);border-radius:12px;padding:13px 14px}
.fact .lbl{font-size:10.5px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:var(--text3);margin-bottom:4px}
.fact .val{font-size:14.5px;font-weight:800;color:var(--text)}
.fact .val.salary{color:var(--green)}
.apply{background:linear-gradient(135deg,rgba(45,127,249,.12),rgba(96,165,250,.05));border:1px solid rgba(45,127,249,.35);border-radius:16px;padding:18px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:30px}
.apply .info{flex:1;min-width:200px}
.apply .info b{display:block;font-size:14.5px;font-weight:900;margin-bottom:3px}
.apply .info span{font-size:12.5px;color:var(--text2)}
.apply .btn{background:var(--blue);color:#fff;font-weight:800;font-size:14.5px;padding:13px 24px;border-radius:11px;display:inline-flex;align-items:center;gap:7px;border:0;cursor:pointer;text-decoration:none}
.apply .btn:hover{text-decoration:none;background:#1f6ce0}
.apply .btn-sec{font-size:12.5px;font-weight:700;color:var(--blue2);text-decoration:underline;margin-top:6px;display:inline-block}
.sec{margin-bottom:30px}
.sec h2{font-size:18px;font-weight:900;letter-spacing:-.3px;margin-bottom:12px}
.sec p, .sec li{font-size:14.5px;color:var(--text2);line-height:1.7}
.desc{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:18px 20px;white-space:pre-line;color:var(--text2);font-size:14.5px;line-height:1.7}
.desc b{color:var(--text)}
.req{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:18px 20px;white-space:pre-line;color:var(--text2);font-size:14.5px;line-height:1.7}
.map-ph{height:200px;background:linear-gradient(135deg,#0c1626,#0a1322);border:1px solid var(--border);border-radius:14px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.map-ph::before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 50% 50%,rgba(45,127,249,.18),transparent 60%),repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(255,255,255,.025) 30px,rgba(255,255,255,.025) 31px);}
.map-ph .pin{position:absolute;left:48%;top:38%;font-size:36px;filter:drop-shadow(0 4px 10px rgba(45,127,249,.6));z-index:2}
.map-ph .lbl{position:absolute;left:50%;top:62%;transform:translateX(-50%);font-size:12.5px;color:var(--text2);background:rgba(11,13,16,.85);padding:6px 12px;border-radius:8px;border:1px solid var(--border2);z-index:2;font-weight:700}
.map-ph .lbl-go{display:block;color:var(--blue2);font-size:11px;font-weight:600;margin-top:2px}
.similar{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.simcard{background:var(--surf);border:1px solid var(--border);border-radius:12px;padding:14px;display:block;color:var(--text);text-decoration:none}
.simcard:hover{border-color:var(--border2);text-decoration:none}
.simcard .t{font-size:13.5px;font-weight:800;line-height:1.3;margin-bottom:5px}
.simcard .l{font-size:11.5px;color:var(--text3);margin-bottom:7px}
.simcard .s{font-size:12.5px;font-weight:900;color:var(--green)}
.cross{margin-top:30px;padding:20px;background:var(--surf);border:1px solid var(--border);border-radius:14px}
.cross h2{font-size:15px;font-weight:900;margin-bottom:10px}
.cross .sub{font-size:12.5px;color:var(--text3);margin-bottom:12px}
.cross-links{display:flex;flex-wrap:wrap;gap:7px}
.cross-links a{font-size:12.5px;font-weight:700;color:var(--text);background:var(--surf2);border:1px solid var(--border2);border-radius:999px;padding:7px 13px;text-decoration:none}
.cross-links a:hover{border-color:var(--blue);color:var(--blue2)}
@media(max-width:640px){h1{font-size:22px}.wrap{padding:18px 16px 40px}.head-row{gap:12px}.logo-tile{width:50px;height:50px;font-size:22px}}"""


def find_similar(o, all_offers, n=3):
    """Wybierz n najlepszych podobnych: ta sama kategoria > ten sam kraj > pozostałe."""
    self_id = o.get("id")
    pool = [x for x in all_offers if x.get("id") != self_id]
    cat = (o.get("category") or "").lower()
    country = o.get("location_country") or ""

    same_cat = [x for x in pool if (x.get("category") or "").lower() == cat]
    same_country = [x for x in pool if x.get("location_country") == country and x not in same_cat]
    rest = [x for x in pool if x not in same_cat and x not in same_country]

    out = []
    for src in (same_cat, same_country, rest):
        for x in src:
            if x not in out:
                out.append(x)
            if len(out) >= n:
                break
        if len(out) >= n:
            break
    return out[:n]


def offer_country_landing(country):
    return {"Polska": "praca-w-polsce", "Niemcy": "praca-niemcy",
            "Holandia": "praca-holandia", "Czechy": "praca-za-granica"}.get(country, "praca-za-granica")


def render_offer(o, all_offers):
    title = o.get("title") or "Oferta pracy"
    company = o.get("company_name") or "Pracodawca"
    locality = o.get("location") or ""
    country = o.get("location_country") or ""
    salary = fmt_salary(o)
    desc = re.sub(r"🔗\s*Źródło:.*$", "", (o.get("description") or "").strip(), flags=re.S).strip()
    requirements = (o.get("requirements") or "").strip()
    source_url = o.get("source_url") or ""
    short_id = o.get("short_id")
    canonical = offer_canonical(o)

    # SEO copy
    sal_in_title = f" — {salary}" if salary else ""
    seo_title = trim(f"{title}{sal_in_title} | {company} | MapJob", 65)
    parts = [title]
    if locality:
        parts.append(f"w lokalizacji {locality}")
    if country and country != "Polska":
        parts.append(f"({country})")
    if salary:
        parts.append(f"— {salary}")
    if company:
        parts.append(f"Pracodawca: {company}.")
    parts.append("Sprawdź szczegóły i aplikuj bezpośrednio na MapJob.")
    meta_desc = trim(" ".join(parts), 155)

    # Breadcrumb
    country_slug = offer_country_landing(country)
    country_label = {"Polska": "Praca w Polsce", "Niemcy": "Praca w Niemczech",
                     "Holandia": "Praca w Holandii", "Czechy": "Praca za granicą"}.get(country, "Praca")
    breadcrumbs = [
        ("Strona główna", SITE + "/"),
        (country_label, f"{SITE}/{country_slug}/"),
        (trim(title, 60), canonical),
    ]

    extra_ld = [
        jobposting_jsonld(o),
        breadcrumb_jsonld(breadcrumbs),
    ]

    head = common_head(
        title=seo_title, meta_desc=meta_desc, canonical=canonical,
        og_type="article", extra_ld=extra_ld,
    )

    # Logo tile
    if o.get("company_logo"):
        logo_html = f'<div class="logo-tile"><img src="{html_lib.escape(o["company_logo"])}" alt="{html_lib.escape(company)}"/></div>'
    else:
        initial = (company.strip()[:1] or "?").upper()
        logo_html = f'<div class="logo-tile">{html_lib.escape(initial)}</div>'

    # Facts
    facts = []
    if salary:
        facts.append(f'<div class="fact"><div class="lbl">💶 Wynagrodzenie</div><div class="val salary">{html_lib.escape(salary)}</div></div>')
    emp_label = o.get("employment_type_label")
    if emp_label:
        facts.append(f'<div class="fact"><div class="lbl">📋 Umowa</div><div class="val">{html_lib.escape(emp_label)}</div></div>')
    loc_full = f"{locality}{', ' + country if country and country != 'Polska' else ''}"
    if loc_full.strip():
        facts.append(f'<div class="fact"><div class="lbl">📍 Lokalizacja</div><div class="val">{html_lib.escape(loc_full)}</div></div>')
    if o.get("spots"):
        facts.append(f'<div class="fact"><div class="lbl">👥 Wakaty</div><div class="val">{o["spots"]} miejsc</div></div>')
    if o.get("is_urgent"):
        facts.append('<div class="fact"><div class="lbl">⚡ Status</div><div class="val" style="color:#fcd34d">Pilne</div></div>')

    # Apply card
    apply_href = f"/?o={short_id}" if short_id else "/"
    apply_block = f"""<div class="apply">
  <div class="info">
    <b>Aplikuj na MapJob</b>
    <span>MapJob nie pobiera prowizji. Twoja aplikacja trafia bezpośrednio do {html_lib.escape(company)}.</span>
  </div>
  <a class="btn" href="{apply_href}">📝 Aplikuj teraz →</a>
</div>"""

    # Sections
    desc_html = f'<section class="sec"><h2>Opis stanowiska</h2><div class="desc">{html_lib.escape(desc)}</div></section>' if desc else ""
    req_html = f'<section class="sec"><h2>Wymagania</h2><div class="req">{html_lib.escape(requirements)}</div></section>' if requirements else ""

    # Map placeholder
    map_html = f"""<section class="sec">
  <h2>Lokalizacja</h2>
  <a href="{apply_href}" style="text-decoration:none">
    <div class="map-ph">
      <span class="pin">📍</span>
      <span class="lbl">{html_lib.escape(loc_full or 'Lokalizacja na mapie')}<span class="lbl-go">Otwórz pełną mapę →</span></span>
    </div>
  </a>
</section>""" if loc_full else ""

    # Similar
    sims = find_similar(o, all_offers, 3)
    sim_html = ""
    if sims:
        cards = []
        for s in sims:
            ssal = fmt_salary(s)
            cards.append(f"""<a class="simcard" href="{offer_url_path(s)}">
      <div class="t">{html_lib.escape(s.get('title') or '')}</div>
      <div class="l">📍 {html_lib.escape((s.get('location') or '') + (', ' + s.get('location_country') if s.get('location_country') else ''))} · {html_lib.escape(s.get('company_name') or '')}</div>
      <div class="s">{html_lib.escape(ssal)}</div>
    </a>""")
        sim_html = f'<section class="sec"><h2>Podobne oferty</h2><div class="similar">{"".join(cards)}</div></section>'

    # Source URL (transparency for scraped offers)
    source_block = ""
    if source_url and "mapjob.pl" not in source_url:
        source_block = (f'<a class="btn-sec" href="{html_lib.escape(source_url)}" '
                       f'rel="nofollow noopener" target="_blank">Zobacz oryginalne ogłoszenie u pracodawcy ↗</a>')

    # Cross-links
    cross_targets = [
        (country_slug, country_label),
        ("praca-w-polsce" if country != "Polska" else "praca-za-granica",
         "Praca w Polsce" if country != "Polska" else "Praca za granicą"),
    ]
    cat = (o.get("category") or "").lower()
    if cat == "industry":
        cross_targets.append(("praca-produkcja", "Praca w produkcji"))
        cross_targets.append(("praca-magazynier", "Praca magazynier"))
    if "trener" in (o.get("title") or "").lower():
        cross_targets.append(("praca-trener-personalny", "Trener personalny"))
    if (o.get("location") or "").lower() == "warszawa":
        cross_targets.append(("praca-warszawa", "Praca Warszawa"))
    # dedup
    seen = set(); cross_unique = []
    for s, l in cross_targets:
        if s not in seen:
            seen.add(s); cross_unique.append((s, l))
    cross_html = "".join(f'<a href="/{s}/">{html_lib.escape(l)}</a>' for s, l in cross_unique)

    return f"""<!DOCTYPE html>
<html lang="pl">
<head>
{head}
<style>
{COMMON_CSS}
{OFFER_CSS}
</style>
</head>
<body>
<header class="topbar">
  <a href="/" class="logo"><span class="dot">📍</span><span>Map<span style="color:var(--blue2)">Job</span></span></a>
  <nav class="nav">
    <a href="/">Mapa ofert</a>
    <a href="/?action=add-pin">Dodaj ogłoszenie</a>
  </nav>
</header>

<main class="wrap">
  <nav class="crumbs">
    <a href="/">Strona główna</a><span>›</span>
    <a href="/{country_slug}/">{html_lib.escape(country_label)}</a><span>›</span>
    {html_lib.escape(trim(title, 60))}
  </nav>

  <div class="head-row">
    {logo_html}
    <div class="head-main">
      <h1>{html_lib.escape(title)}</h1>
      <div class="subt"><b>{html_lib.escape(company)}</b>{' · ' + html_lib.escape(loc_full) if loc_full else ''}</div>
    </div>
  </div>

  <section class="facts">
{''.join(facts)}
  </section>

  {apply_block}

  {desc_html}
  {req_html}
  {map_html}
  {sim_html}

  <section class="cross">
    <h2>Zobacz też</h2>
    <p class="sub">Inne kategorie i lokalizacje z aktualnymi ofertami:</p>
    <div class="cross-links">
{cross_html}
    </div>
  </section>

  <footer class="foot">
    {source_block}
    <p style="margin-top:14px">© 2026 <b>MapJob</b> — mapa ogłoszeń o pracę. Oferta pochodzi od {html_lib.escape(company)}. Aplikujesz bezpośrednio, MapJob nie pobiera prowizji.</p>
    <p style="margin-top:6px"><a href="/">Strona główna</a> · <a href="/{country_slug}/">{html_lib.escape(country_label)}</a> · <a href="/regulamin.html">Regulamin</a> · <a href="/polityka-prywatnosci.html">Polityka prywatności</a></p>
  </footer>
</main>
</body>
</html>
"""


# ============================================================
# KONFIGURACJA LANDINGÓW
# ============================================================

LANDINGS = [
    {"slug": "praca-w-polsce",
     "title": "Praca w Polsce 2026 — aktualne oferty na mapie | MapJob",
     "meta_desc": "Oferty pracy w Polsce: Warszawa, Katowice, Radom, Legnica i inne. Trener personalny, produkcja, fryzjer, florysta, kierowca. Geolokalizowane na mapie MapJob.",
     "h1": "Praca w Polsce — aktualne oferty",
     "lead": "Oferty pracy z całej Polski geolokalizowane na interaktywnej mapie. Od Warszawy przez Katowice po Radom i Legnicę — widzisz dokładnie, gdzie jest dany etat. Aplikujesz bezpośrednio u pracodawcy.",
     "filter": lambda o: o.get("location_country") == "Polska",
     "extra_stats": "<span>Miasta: <b>Warszawa, Katowice, Radom, Legnica, Płońsk</b></span>",
     "parent_crumb": None,
     "cross": [("praca-warszawa", "Praca Warszawa"),
               ("praca-trener-personalny", "Trener personalny"),
               ("praca-produkcja", "Praca w produkcji"),
               ("praca-za-granica", "Praca za granicą")]},

    {"slug": "praca-warszawa",
     "title": "Praca Warszawa 2026 — aktualne oferty | MapJob",
     "meta_desc": "Oferty pracy w Warszawie: trener personalny EMS na Bielanach, Mokotowie, Saskiej Kępie i w Ursusie. Stawki, lokalizacja na mapie, kontakt z pracodawcą.",
     "h1": "Praca Warszawa — aktualne oferty",
     "lead": "Oferty pracy w Warszawie geolokalizowane na mapie — widzisz w której dzielnicy jest dany etat. Aktualnie głównie w branży fitness/EMS, z czasem dojdą kolejne.",
     "filter": lambda o: (o.get("location_country") == "Polska"
                         and "warszawa" in (o.get("location") or "").lower()),
     "extra_stats": "<span>Dzielnice: <b>Bielany, Mokotów, Saska Kępa, Ursus</b></span>",
     "parent_crumb": ("Praca w Polsce", f"{SITE}/praca-w-polsce/"),
     "cross": [("praca-trener-personalny", "Trener personalny"),
               ("praca-w-polsce", "Wszystkie oferty w Polsce"),
               ("praca-za-granica", "Praca za granicą")]},

    {"slug": "praca-trener-personalny",
     "title": "Praca trener personalny Warszawa — oferty EMS | MapJob",
     "meta_desc": "Praca dla trenera personalnego w Warszawie — 4 studia EMS (Platinum Active): Bielany, Mokotów, Saska Kępa, Ursus. 5100-6500 zł brutto/mies., umowa zlecenie.",
     "h1": "Praca trener personalny — Warszawa",
     "lead": "Oferty dla trenerów personalnych w Warszawie. Aktualnie 4 wakaty w studiach EMS (elektrostymulacja) sieci Platinum Active. Elastyczny grafik (pn-sb), brak pracy nocą.",
     "filter": lambda o: "trener" in (o.get("title") or "").lower(),
     "extra_stats": "<span>Stawka: <b>5100–6500 PLN/mies.</b></span> <span>Umowa: <b>zlecenie</b></span>",
     "parent_crumb": ("Praca w Polsce", f"{SITE}/praca-w-polsce/"),
     "cross": [("praca-warszawa", "Praca Warszawa"),
               ("praca-w-polsce", "Wszystkie oferty w Polsce")]},

    {"slug": "praca-za-granica",
     "title": "Praca za granicą 2026 — aktualne oferty z agencji pracy | MapJob",
     "meta_desc": "Sprawdzone oferty pracy za granicą: Niemcy, Holandia, Czechy. Agencje pracy z numerem KRAZ, geolokalizowane na mapie. Aplikuj bezpośrednio u pracodawcy.",
     "h1": "Praca za granicą — aktualne oferty",
     "lead": "Oferty od agencji pracy tymczasowej z numerem KRAZ. Każda oferta geolokalizowana na mapie — widzisz dokładnie gdzie pojedziesz pracować. MapJob nie pobiera prowizji.",
     "filter": lambda o: o.get("location_country") in ("Niemcy", "Holandia", "Czechy"),
     "extra_stats": "<span>Kraje: <b>Niemcy, Holandia, Czechy</b></span>",
     "parent_crumb": None,
     "cross": [("praca-niemcy", "Praca w Niemczech"),
               ("praca-holandia", "Praca w Holandii"),
               ("praca-magazynier", "Praca magazynier"),
               ("praca-produkcja", "Praca w produkcji"),
               ("praca-w-polsce", "Praca w Polsce")]},

    {"slug": "praca-niemcy",
     "title": "Praca w Niemczech 2026 — aktualne oferty z agencji pracy | MapJob",
     "meta_desc": "Praca w Niemczech: magazyn, produkcja, kierowca. Oferty od JobWerke (KRAZ 21848) i innych agencji, geolokalizowane na mapie MapJob.",
     "h1": "Praca w Niemczech — aktualne oferty",
     "lead": "Oferty pracy w Niemczech od polskich agencji pracy z numerem KRAZ. Najczęściej magazyn (Kassel, München, Berlin), branża wyposażenia domu, logistyka. Stawki w EUR/h.",
     "filter": lambda o: o.get("location_country") == "Niemcy",
     "extra_stats": "<span>Stawka: <b>EUR/h</b></span> <span>Miasta: <b>Kassel, München, Berlin, Hannover</b></span>",
     "parent_crumb": ("Praca za granicą", f"{SITE}/praca-za-granica/"),
     "cross": [("praca-holandia", "Praca w Holandii"),
               ("praca-magazynier", "Praca magazynier"),
               ("praca-produkcja", "Praca w produkcji"),
               ("praca-za-granica", "Wszystkie oferty za granicą"),
               ("praca-w-polsce", "Praca w Polsce")]},

    {"slug": "praca-holandia",
     "title": "Praca w Holandii 2026 — aktualne oferty z agencji pracy | MapJob",
     "meta_desc": "Praca w Holandii: produkcja, magazyn, ogrodnictwo, kierowca. Oferty od agencji Pramer (KRAZ 10850), geolokalizowane na mapie MapJob.",
     "h1": "Praca w Holandii — aktualne oferty",
     "lead": "Oferty pracy w Holandii od polskich agencji pracy z numerem KRAZ. Produkcja, ogrodnictwo, magazyny. Stawki w EUR/h, dodatek urlopowy (ADV), zakwaterowanie po stronie pracodawcy.",
     "filter": lambda o: o.get("location_country") == "Holandia",
     "extra_stats": "<span>Stawka: <b>EUR/h</b></span> <span>Branże: <b>produkcja, magazyn, ogrodnictwo</b></span>",
     "parent_crumb": ("Praca za granicą", f"{SITE}/praca-za-granica/"),
     "cross": [("praca-niemcy", "Praca w Niemczech"),
               ("praca-magazynier", "Praca magazynier"),
               ("praca-produkcja", "Praca w produkcji"),
               ("praca-za-granica", "Wszystkie oferty za granicą"),
               ("praca-w-polsce", "Praca w Polsce")]},

    {"slug": "praca-magazynier",
     "title": "Praca magazynier (magazyn, komisjoner, logistyka) — oferty | MapJob",
     "meta_desc": "Oferty pracy w magazynie: magazynier, komisjoner, operator wózka — Niemcy, Holandia. Stawki EUR/h, geolokalizowane na mapie MapJob.",
     "h1": "Praca magazynier — magazyn, komisjoner, logistyka",
     "lead": "Oferty pracy w magazynie: magazynier, komisjoner (order picker), operator wózka widłowego, obsługa sortowni. Lokalizacje głównie w Holandii i Niemczech, część bez wymogu doświadczenia.",
     "filter": lambda o: bool(offer_tags(o) & {
         "magazyn", "magazynier", "komisjon", "komisjoner", "logistyka",
         "magazyn / logistyka", "wózk", "wozk", "wózki widłowe", "sortown"}),
     "extra_stats": "<span>Kraje: <b>Niemcy, Holandia</b></span>",
     "parent_crumb": ("Praca za granicą", f"{SITE}/praca-za-granica/"),
     "cross": [("praca-produkcja", "Praca w produkcji"),
               ("praca-niemcy", "Praca w Niemczech"),
               ("praca-holandia", "Praca w Holandii"),
               ("praca-za-granica", "Wszystkie oferty za granicą"),
               ("praca-w-polsce", "Praca w Polsce")]},

    {"slug": "praca-produkcja",
     "title": "Praca w produkcji — aktualne oferty w Niemczech, Holandii i Polsce | MapJob",
     "meta_desc": "Oferty pracy w produkcji: operator linii, pracownik produkcji, sortownia. Niemcy, Holandia, Polska. Stawki w EUR/h lub PLN/h.",
     "h1": "Praca w produkcji — aktualne oferty",
     "lead": "Oferty od agencji pracy tymczasowej i bezpośrednio od pracodawców: operator linii, pracownik produkcji, sortownia. Niemcy, Holandia, Polska. Wiele bez wymogu doświadczenia.",
     "filter": lambda o: ("produkcja" in offer_tags(o)
                         or (o.get("category") == "industry" and "magaz" not in (o.get("category_source") or "").lower())),
     "extra_stats": "<span>Kraje: <b>Holandia, Niemcy, Polska</b></span>",
     "parent_crumb": None,
     "cross": [("praca-magazynier", "Praca magazynier"),
               ("praca-niemcy", "Praca w Niemczech"),
               ("praca-holandia", "Praca w Holandii"),
               ("praca-w-polsce", "Praca w Polsce"),
               ("praca-za-granica", "Wszystkie oferty za granicą")]},
]


# ============================================================
# SITEMAP
# ============================================================

def build_sitemap(landing_slugs, offer_paths):
    items = []
    items.append({"loc": SITE + "/", "changefreq": "daily", "priority": "1.0", "lastmod": TODAY_ISO})
    items.append({"loc": SITE + "/?action=add-pin", "changefreq": "weekly", "priority": "0.7"})
    items.append({"loc": SITE + "/?action=add-tender", "changefreq": "weekly", "priority": "0.7"})

    for slug in landing_slugs:
        items.append({"loc": f"{SITE}/{slug}/", "changefreq": "daily",
                     "priority": "0.9", "lastmod": TODAY_ISO})

    for path, lastmod in offer_paths:
        items.append({"loc": SITE + path, "changefreq": "weekly",
                     "priority": "0.8", "lastmod": lastmod})

    items.append({"loc": SITE + "/podgladowe-profile/", "changefreq": "weekly", "priority": "0.6"})
    items.append({"loc": SITE + "/regulamin.html", "changefreq": "monthly", "priority": "0.4"})
    items.append({"loc": SITE + "/polityka-prywatnosci.html", "changefreq": "monthly", "priority": "0.4"})

    body = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for it in items:
        body.append("  <url>")
        body.append(f'    <loc>{it["loc"]}</loc>')
        if it.get("lastmod"):
            body.append(f'    <lastmod>{it["lastmod"]}</lastmod>')
        if it.get("changefreq"):
            body.append(f'    <changefreq>{it["changefreq"]}</changefreq>')
        if it.get("priority"):
            body.append(f'    <priority>{it["priority"]}</priority>')
        body.append("  </url>")
    body.append("</urlset>\n")
    return "\n".join(body)


# ============================================================
# MAIN
# ============================================================

def write_file(rel_path, content):
    path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)


def main():
    print("Wczytuję snapshot ofert z DB...")
    offers = load_offers()
    print(f"  Wczytano: {len(offers)} ofert\n")

    # 1) LISTINGI
    print("Generuję landingi (listings):")
    for cfg in LANDINGS:
        matched = [o for o in offers if cfg["filter"](o)]
        matched.sort(key=lambda o: (0 if o.get("salary_min") else 1,
                                    -float(o.get("salary_max") or o.get("salary_min") or 0)))
        page = render_listing(
            slug=cfg["slug"], title=cfg["title"], meta_desc=cfg["meta_desc"],
            h1=cfg["h1"], lead=cfg["lead"], offers=matched,
            extra_stats=cfg["extra_stats"], cross_links=cfg["cross"],
            parent_crumb=cfg["parent_crumb"],
        )
        write_file(f"{cfg['slug']}/index.html", page)
        print(f"  + /{cfg['slug']}/  ({len(matched)} ofert, {len(page)//1024} KB)")

    # 2) OFERTY POJEDYNCZE
    print("\nGeneruję strony pojedynczych ofert:")
    offer_paths = []
    for o in offers:
        page = render_offer(o, offers)
        slug = offer_slug(o)
        write_file(f"oferta/{slug}/index.html", page)
        lastmod = (o.get("updated_at") or o.get("created_at") or TODAY_ISO)[:10]
        offer_paths.append((offer_url_path(o), lastmod))
    print(f"  Wygenerowano: {len(offer_paths)} stron ofert")

    # 3) SITEMAP
    print("\nGeneruję sitemap.xml:")
    sitemap_xml = build_sitemap([c["slug"] for c in LANDINGS], offer_paths)
    write_file("sitemap.xml", sitemap_xml)
    total = 3 + len(LANDINGS) + len(offer_paths) + 3  # home+actions + landings + offers + statics
    print(f"  sitemap.xml — {total} URL-i")

    print("\nGotowe.")


if __name__ == "__main__":
    main()
