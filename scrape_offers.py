# -*- coding: utf-8 -*-
"""Uniwersalny scraper ogłoszeń pracy z dowolnej strony firmy.

Użycie:
    python scrape_offers.py <URL_strony_z_ofertami>

Co robi:
  1. Pobiera stronę (curl, omija blokadę cert. na Windows).
  2. Sam WYKRYWA linki do pojedynczych ofert (powtarzający się wzorzec adresu).
  3. Wchodzi w każdą ofertę i wyciąga czysty tekst (bez skryptów/obrazków/nawigacji).
  4. Zapisuje paczkę _scraped_<host>.json — surowy, pełny tekst każdej oferty.

Potem Claude czyta tę paczkę i składa profesjonalny plik oferty-<firma>.json
(schemat job_offers: tytuł, lokalizacja, opis, wymagania, benefity, widełki...).

Strony renderowane serwerowo: działa od ręki. Renderowane wyłącznie JS-em
(pusty HTML): skrypt to wykryje i napisze, że potrzebny tryb headless.
"""
import re, sys, json, html as ihtml, subprocess, time
from urllib.parse import urljoin, urlparse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
OFFER_HINTS = ("ofert", "oferty", "praca", "prace", "job", "jobs", "kariera", "career",
               "careers", "vacan", "stanowisk", "recruit", "rekrutac", "/view", "position",
               "opening", "wakat", "stelle", "stellen")

def fetch(url, t=25):
    r = subprocess.run(["curl", "-sSL", "--ssl-no-revoke", "--max-time", str(t), "-A", UA, url],
                       capture_output=True)
    return r.stdout.decode("utf-8", "replace")

def declared_charset(raw_bytes_text):
    m = re.search(r'charset=["\']?([\w-]+)', raw_bytes_text[:3000], re.I)
    return m.group(1) if m else "utf-8"

def clean_text(frag):
    h = frag
    h = re.sub(r"<!--.*?-->", " ", h, flags=re.S)
    h = re.sub(r"<script\b.*?</script>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<style\b.*?</style>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<svg\b.*?</svg>", " ", h, flags=re.S | re.I)
    h = re.sub(r'src="data:[^"]+"', "", h)
    h = re.sub(r"<(nav|header|footer)\b.*?</\1>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<img[^>]*>", " ", h, flags=re.I)
    h = re.sub(r"<br\s*/?>", "\n", h, flags=re.I)
    h = re.sub(r"</(p|div|li|h\d|tr|section)>", "\n", h, flags=re.I)
    h = re.sub(r"<li[^>]*>", "- ", h, flags=re.I)
    h = re.sub(r"<[^>]+>", " ", h)
    h = ihtml.unescape(h)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in h.split("\n")]
    return "\n".join(ln for ln in lines if ln)

def main_block(detail_html):
    """Wybiera kontener z największą ilością tekstu spośród typowych miejsc treści."""
    candidates = re.findall(
        r'<(?:article|main|section|div)[^>]*(?:class|id)="[^"]*(?:offer|oferta|content|detail|job|opis|description|vacanc|single)[^"]*"[^>]*>(.*?)</(?:article|main|section|div)>',
        detail_html, flags=re.S | re.I)
    best = ""
    for c in candidates:
        txt = clean_text(c)
        if len(txt) > len(best):
            best = txt
    body = re.search(r"<body[^>]*>(.*?)</body>", detail_html, re.S | re.I)
    whole = clean_text(body.group(1)) if body else clean_text(detail_html)
    # jeśli najlepszy kontener ma sensowną treść użyj go, inaczej całe body
    return best if len(best) > 200 else whole

def title_of(detail_html):
    for pat in (r"<h1[^>]*>(.*?)</h1>", r"<h2[^>]*>(.*?)</h2>",
                r'<h\d[^>]*class="[^"]*(?:title|header|name)[^"]*"[^>]*>(.*?)</h\d>',
                r"<title[^>]*>(.*?)</title>"):
        m = re.search(pat, detail_html, re.S | re.I)
        if m:
            t = ihtml.unescape(re.sub(r"<[^>]+>", "", m.group(1)))
            t = re.sub(r"\s+", " ", t).strip()
            if t:
                return t
    return ""

SKIP_PATH = ("/feed", "/page/", "wp-content", "wp-json", "xmlrpc", ".php",
             ".css", ".js", ".jpg", ".jpeg", ".png", ".webp", ".woff", ".svg", ".ico",
             "/tag/", "/category/", "/author/", "/wp-admin", "mailto:", "tel:")

def url_shape(path):
    segs = [s for s in path.split("/") if s]
    norm = []
    for i, s in enumerate(segs):
        if s.isdigit():
            norm.append("{id}")
        elif i == len(segs) - 1 and (("-" in s) or len(s) > 14):
            norm.append("{slug}")  # slug-owy adres oferty (bez cyfr)
        else:
            norm.append(s)
    return "/" + "/".join(norm)

def discover_offer_links(listing_html, base_url):
    base_host = urlparse(base_url).netloc
    anchors = re.findall(r'<a\b[^>]*href="([^"#]+)"', listing_html, flags=re.I)
    groups = {}
    for href in anchors:
        absu = urljoin(base_url, href).split("#")[0]
        p = urlparse(absu)
        if p.netloc != base_host:
            continue
        path = p.path
        if path in ("/", ""):
            continue
        if any(x in path.lower() for x in SKIP_PATH):
            continue
        tmpl = url_shape(path)
        groups.setdefault(tmpl, set()).add(absu)
    def score(kv):
        tmpl, urls = kv
        has_var = ("{slug}" in tmpl or "{id}" in tmpl)
        hint = any(h in tmpl.lower() for h in OFFER_HINTS)
        return (has_var and hint, has_var, hint, len(urls))
    ranked = sorted(groups.items(), key=score, reverse=True)
    picked = [(t, u) for t, u in ranked if len(u) >= 2 and ("{slug}" in t or "{id}" in t)]
    return picked

def main():
    if len(sys.argv) < 2:
        print("Użycie: python scrape_offers.py <URL>")
        sys.exit(1)
    url = sys.argv[1]
    host = urlparse(url).netloc.replace("www.", "")
    print(f"[1/3] Pobieram listę: {url}", flush=True)
    listing = fetch(url)
    text_len = len(clean_text(listing))
    # paginacja: wykryj maksymalny numer strony
    maxp = 1
    for m in re.finditer(r"/page/(\d+)/", listing):
        maxp = max(maxp, int(m.group(1)))
    for m in re.finditer(r"[?&]paged?=(\d+)", listing):
        maxp = max(maxp, int(m.group(1)))
    maxp = min(maxp, 30)
    base = re.sub(r"/page/\d+/?$", "/", url)
    if not base.endswith("/"):
        base += "/"
    page_urls = [url] + [base + f"page/{p}/" for p in range(2, maxp + 1)]
    if maxp > 1:
        print(f"      Paginacja: {maxp} stron", flush=True)
    # wzorzec z 1. strony, potem zbieraj z każdej strony
    picked = discover_offer_links(listing, url)
    detail_urls = []
    if picked:
        win_tmpl = picked[0][0]
        all_urls = set(picked[0][1])
        for pg in page_urls[1:]:
            h = fetch(pg)
            for href in re.findall(r'<a\b[^>]*href="([^"#]+)"', h, flags=re.I):
                absu = urljoin(pg, href).split("#")[0]
                pp = urlparse(absu)
                if pp.netloc != urlparse(url).netloc:
                    continue
                if any(x in pp.path.lower() for x in SKIP_PATH):
                    continue
                if url_shape(pp.path) == win_tmpl:
                    all_urls.add(absu)
            time.sleep(0.15)
        detail_urls = sorted(all_urls)
        print(f"      Wzorzec ofert: {win_tmpl} → {len(detail_urls)} ofert (ze wszystkich stron)", flush=True)
    else:
        print("      Nie wykryto powtarzalnych linków do ofert.", flush=True)

    offers = []
    if detail_urls:
        print(f"[2/3] Pobieram {len(detail_urls)} podstron ofert...", flush=True)
        for i, du in enumerate(detail_urls, 1):
            dh = fetch(du)
            offers.append({"url": du, "title": title_of(dh), "text": main_block(dh)})
            if i % 5 == 0 or i == len(detail_urls):
                print(f"      {i}/{len(detail_urls)}", flush=True)
            time.sleep(0.15)
    else:
        # brak podstron — spróbuj wyciągnąć z samego listingu
        print("[2/3] Brak podstron — biorę treść z listingu.", flush=True)
        offers.append({"url": url, "title": title_of(listing), "text": clean_text(listing)})

    # diagnoza JS-render
    js_warning = None
    if not detail_urls and text_len < 800:
        js_warning = ("Strona ma bardzo mało tekstu w HTML i brak linków do ofert — "
                      "prawdopodobnie renderowana w całości JS-em. Potrzebny tryb headless (Playwright).")

    out = {
        "_meta": {
            "source": url,
            "host": host,
            "scraped_at": time.strftime("%Y-%m-%d %H:%M"),
            "listing_text_chars": text_len,
            "offers_found": len(offers),
            "detail_pattern": picked[0][0] if picked else None,
            "js_render_warning": js_warning,
        },
        "offers": offers,
    }
    fname = f"_scraped_{host.replace('.', '_')}.json"
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[3/3] ZAPISANO {fname}: {len(offers)} ofert", flush=True)
    if js_warning:
        print("UWAGA:", js_warning, flush=True)

if __name__ == "__main__":
    main()
