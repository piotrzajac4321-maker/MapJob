#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator poradnika BoboFoto.
Czyta artykuły z plików poradnik_data_*.py (każdy definiuje ITEMS = [...])
i renderuje:
  - poradnik/<slug>.html  (artykuł + Article/Breadcrumb schema)
  - poradnik.html         (hub z listą wg kategorii)
  - sitemap.xml           (strony główne + wszystkie artykuły)
Uruchom:  python3 build_poradnik.py
"""
import glob, json, os, html

BASE = "https://bobofoto.pl"
CSS = "/css/style.css?v=42"

CATS = [
    ("technika", "Jak robić zdjęcia"),
    ("okazje", "Sesje sezonowe i okazje"),
    ("stylizacje", "Stylizacje i pomysły"),
    ("praktyka", "Praktyczne porady dla rodziców"),
    ("poradnik", "O sesji i cenach"),
]
CAT_LABEL = dict(CATS)

DEFAULT_CTA = {
    "title": "Zamień domowe zdjęcie w profesjonalną sesję",
    "sub": "Bez dojazdu i stresu — gotowe w ~10 godzin, od 24 zł.",
    "href": "/#cennik",
    "label": "Zobacz pakiety i zamów →",
}

HEAD_FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com" />'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />'
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />'
)

def esc(s):
    return html.escape(s, quote=True)

def load_articles():
    arts = []
    for f in sorted(glob.glob("poradnik_data_*.py")):
        ns = {}
        with open(f, encoding="utf-8") as fh:
            exec(fh.read(), ns)
        arts += ns.get("ITEMS", [])
    # walidacja unikalnych slugów
    slugs = [a["slug"] for a in arts]
    dups = set(s for s in slugs if slugs.count(s) > 1)
    if dups:
        raise SystemExit("Zduplikowane slugi: " + ", ".join(dups))
    return arts

def render_sections(secs):
    out = []
    for s in secs:
        out.append("    <h2>" + esc(s["h2"]) + "</h2>")
        for p in s.get("ps", []):
            out.append("    <p>" + p + "</p>")  # p może zawierać <strong>/<a> — autor odpowiada
        if s.get("ul"):
            out.append("    <ul>")
            for li in s["ul"]:
                out.append("      <li>" + li + "</li>")
            out.append("    </ul>")
        if s.get("ol"):
            out.append("    <ol>")
            for li in s["ol"]:
                out.append("      <li>" + li + "</li>")
            out.append("    </ol>")
    return "\n".join(out)

def related_links(a, arts):
    same = [x for x in arts if x["cat"] == a["cat"] and x["slug"] != a["slug"]]
    others = [x for x in arts if x["slug"] != a["slug"] and x not in same]
    pick = (same + others)[:3]
    links = ['<a href="/poradnik/%s" style="color:var(--sage-d)">%s</a>' % (x["slug"], esc(x["title"])) for x in pick]
    return " · ".join(links)

def render_article(a, arts):
    url = BASE + "/poradnik/" + a["slug"]
    cta = dict(DEFAULT_CTA); cta.update(a.get("cta", {}))
    article_ld = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": a["title"], "description": a["desc"],
        "image": BASE + "/og-image.png",
        "author": {"@type": "Organization", "name": "BoboFoto"},
        "publisher": {"@type": "Organization", "name": "BoboFoto",
                      "logo": {"@type": "ImageObject", "url": BASE + "/favicon.svg"}},
        "mainEntityOfPage": url, "inLanguage": "pl-PL",
    }
    crumb_ld = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Strona główna", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Poradnik", "item": BASE + "/poradnik"},
            {"@type": "ListItem", "position": 3, "name": a["title"], "item": url},
        ],
    }
    secs_html = render_sections(a["secs"])
    return """<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="facebook-domain-verification" content="dyrtytfse94l6nab1tvz24byua18zn" />
  <script src="/js/pixel.js?v=3"></script>
  <title>%(title)s | BoboFoto</title>
  <meta name="description" content="%(desc)s" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="%(url)s" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="%(title)s" />
  <meta property="og:description" content="%(desc)s" />
  <meta property="og:url" content="%(url)s" />
  <meta property="og:image" content="%(base)s/og-image.png" />
  <meta name="theme-color" content="#8E9C82" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  %(fonts)s
  <link rel="stylesheet" href="%(css)s" />
  <script type="application/ld+json">
%(article_ld)s
  </script>
  <script type="application/ld+json">
%(crumb_ld)s
  </script>
</head>
<body>
  <div class="post-top">
    <div class="container">
      <a href="/" class="brand">Bobo<span style="color:var(--sage)">Foto</span></a>
      <a href="/#cennik" class="btn btn-primary">Zamów sesję →</a>
    </div>
  </div>

  <article class="article">
    <p class="breadcrumbs"><a href="/">Strona główna</a> &rsaquo; <a href="/poradnik">Poradnik</a> &rsaquo; %(h1)s</p>
    <h1 style="font-family:var(--serif);font-size:clamp(30px,5.5vw,46px);font-weight:600;line-height:1.12">%(h1)s</h1>
    <p class="post-meta">Poradnik BoboFoto · %(read)s</p>

    <p class="lead">%(lead)s</p>

%(secs)s

    <div class="cta-box">
      <h3>%(cta_title)s</h3>
      <p>%(cta_sub)s</p>
      <a href="%(cta_href)s" class="btn btn-primary">%(cta_label)s</a>
    </div>

    <p style="color:var(--muted)">Zobacz też: %(related)s</p>
  </article>

  <footer class="footer" style="margin-top:30px">
    <div class="container">
      <div class="footer-bottom" style="border:0">
        <span>&copy; <span id="y"></span> BoboFoto · <a href="/">Strona główna</a> · <a href="/poradnik">Poradnik</a> · <a href="/#cennik">Cennik</a></span>
      </div>
    </div>
  </footer>
  <script>document.getElementById('y').textContent=new Date().getFullYear();</script>
</body>
</html>
""" % {
        "title": esc(a["title"]), "desc": esc(a["desc"]), "url": url, "base": BASE,
        "fonts": HEAD_FONTS, "css": CSS,
        "article_ld": json.dumps(article_ld, ensure_ascii=False, indent=2),
        "crumb_ld": json.dumps(crumb_ld, ensure_ascii=False, indent=2),
        "h1": esc(a.get("h1", a["title"])), "read": a.get("read", "czas czytania ~4 min"),
        "lead": a["lead"], "secs": secs_html,
        "cta_title": esc(cta["title"]), "cta_sub": esc(cta["sub"]),
        "cta_href": cta["href"], "cta_label": esc(cta["label"]),
        "related": related_links(a, arts),
    }

def render_hub(arts):
    cards_by_cat = {c: [] for c, _ in CATS}
    for a in arts:
        cards_by_cat.setdefault(a["cat"], []).append(a)
    blocks = []
    for cat, label in CATS:
        items = cards_by_cat.get(cat, [])
        if not items:
            continue
        cards = []
        for a in items:
            cards.append(
                '<article class="post-card"><h3>%s</h3><p>%s</p>'
                '<a class="more" href="/poradnik/%s">Czytaj poradnik &rarr;</a></article>'
                % (esc(a["title"]), esc(a.get("card", a["desc"])), a["slug"]))
        blocks.append(
            '<h2 style="font-family:var(--serif);font-size:30px;font-weight:600;margin:38px 0 18px">%s</h2>'
            '<div class="post-grid">%s</div>' % (esc(label), "".join(cards)))
    blog_ld = {
        "@context": "https://schema.org", "@type": "Blog",
        "name": "Poradnik BoboFoto", "url": BASE + "/poradnik",
        "publisher": {"@type": "Organization", "name": "BoboFoto", "url": BASE + "/"},
    }
    return """<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="facebook-domain-verification" content="dyrtytfse94l6nab1tvz24byua18zn" />
  <script src="/js/pixel.js?v=3"></script>
  <title>Poradnik BoboFoto — zdjęcia i sesje noworodkowe</title>
  <meta name="description" content="Poradnik BoboFoto: jak zrobić piękne zdjęcia noworodka, ile kosztuje sesja noworodkowa, pomysły na stylizacje i sesje sezonowe. Praktyczne wskazówki dla rodziców." />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="%(base)s/poradnik" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Poradnik BoboFoto — zdjęcia i sesje noworodkowe" />
  <meta property="og:description" content="Praktyczne wskazówki o zdjęciach i sesjach noworodkowych." />
  <meta property="og:url" content="%(base)s/poradnik" />
  <meta property="og:image" content="%(base)s/og-image.png" />
  <meta name="theme-color" content="#8E9C82" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  %(fonts)s
  <link rel="stylesheet" href="%(css)s" />
  <script type="application/ld+json">
%(blog_ld)s
  </script>
</head>
<body>
  <div class="post-top">
    <div class="container">
      <a href="/" class="brand">Bobo<span style="color:var(--sage)">Foto</span></a>
      <a href="/#cennik" class="btn btn-primary">Zamów sesję &rarr;</a>
    </div>
  </div>

  <section class="post-hero">
    <div class="container">
      <p class="breadcrumbs"><a href="/">Strona główna</a> &rsaquo; Poradnik</p>
      <span class="eyebrow">Poradnik</span>
      <h1 style="font-family:var(--serif);font-size:clamp(32px,6vw,52px);font-weight:600;max-width:820px">Wszystko o pięknych zdjęciach noworodka</h1>
      <p style="color:var(--muted);font-size:18px;max-width:680px;margin-top:10px">Ponad %(count)s praktycznych poradników: jak fotografować maluszka, ile kosztuje sesja, pomysły na stylizacje i sesje na każdą porę roku.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      %(blocks)s
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom" style="border:0">
        <span>&copy; <span id="y"></span> BoboFoto · <a href="/">Strona główna</a> · <a href="/#cennik">Cennik</a> · <a href="/#faq">FAQ</a></span>
      </div>
    </div>
  </footer>
  <script>document.getElementById('y').textContent=new Date().getFullYear();</script>
</body>
</html>
""" % {
        "base": BASE, "fonts": HEAD_FONTS, "css": CSS,
        "blog_ld": json.dumps(blog_ld, ensure_ascii=False, indent=2),
        "count": len(arts), "blocks": "\n      ".join(blocks),
    }

def render_sitemap(arts):
    core = ["/", "/poradnik", "/konkurs", "/regulamin", "/polityka-prywatnosci", "/cookies"]
    urls = []
    for u in core:
        pr = "1.0" if u == "/" else ("0.8" if u in ("/poradnik", "/konkurs") else "0.3")
        urls.append("  <url><loc>%s%s</loc><priority>%s</priority></url>" % (BASE, u, pr))
    for a in arts:
        urls.append("  <url><loc>%s/poradnik/%s</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>" % (BASE, a["slug"]))
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n"

def main():
    arts = load_articles()
    os.makedirs("poradnik", exist_ok=True)
    for a in arts:
        with open("poradnik/%s.html" % a["slug"], "w", encoding="utf-8") as f:
            f.write(render_article(a, arts))
    with open("poradnik.html", "w", encoding="utf-8") as f:
        f.write(render_hub(arts))
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(render_sitemap(arts))
    print("Wygenerowano %d artykułów + hub + sitemap." % len(arts))

if __name__ == "__main__":
    main()
