# BoboFoto — projekt strony (sesje noworodkowe i dziecięce online)

Profesjonalne sesje zdjęciowe dziecka **online**: klient wysyła zwykłe zdjęcie z telefonu,
wybiera stylizację/tło, a my oddajemy zdjęcia „jak ze studia" — od **9,90 zł/szt.** (pakiet Premium),
realizacja do **~10 h**. Strona statyczna (HTML/CSS/JS), hostowana na **Vercel** pod domeną **bobofoto.pl**.

> To jest kompletny, samodzielny katalog projektu BoboFoto — oddzielony od kodu MapJob.
> Wszystko, co potrzebne do dalszego rozwoju strony, jest tutaj.

---

## 1. Struktura katalogu

```
studio-ai/
├── index.html                  # STRONA GŁÓWNA (układ „v2": hero z przykładami przed/po, galeria, cennik, FAQ)
├── v2.html                     # podgląd/wersja robocza (noindex) — można usunąć
├── konkurs.html                # strona konkursu (3 nagrody, kod -40%)
├── regulamin.html              # WZÓR — wymaga uzupełnienia danych sprzedawcy (NIP, adres…)
├── polityka-prywatnosci.html   # RODO
├── cookies.html                # polityka cookies
├── panel.html                  # PANEL ADMINA (zamówienia, zdjęcia, statystyki, zarobki)
│
├── css/
│   ├── style.css               # główne style (paleta: krem/beż/szałwia)  [?v=47]
│   ├── v2.css                   # style układu v2 (hero, kafelki przed/po, dolny pasek)  [?v=14]
│   └── panel.css                # style panelu admina
├── js/
│   ├── gallery-data.js          # lista zdjęć galerii + kategorie (TU edytujesz galerię)  [?v=34]
│   ├── main.js                  # galeria, serduszka, koszyk, personalizacja, płatność  [?v=47]
│   ├── track.js                 # analityka first-party (wizyty, kliknięcia, czas)  [?v=44]
│   ├── pixel.js                 # Meta Pixel (1320762476176589)  [?v=3]
│   └── panel.js                 # logika panelu admina
│
├── poradnik.html               # hub bloga/poradnika
├── poradnik/                   # 144 artykuły SEO (generowane)
├── poradnik_data_*.py          # ŹRÓDŁA artykułów (ITEMS = [...])
├── build_poradnik.py           # GENERATOR: artykuły + hub + sitemap.xml
│
├── api/stripe.js               # Vercel serverless: realne zarobki ze Stripe (dla panelu)
├── supabase/functions/drive-sync/index.ts   # Edge Function: auto-zapis zdjęć na Google Drive
│
├── sitemap.xml, robots.txt, manifest.json, favicon.svg, og-image.png, apple-touch-icon.png
│
├── reklamy/facebook-reklamy.md # gotowe reklamy FB/IG
└── docs/
    ├── PROMPTY.md              # biblioteka promptów AI (klient + modele)
    ├── wizytowka-google.md     # instrukcja: Profil Firmy Google
    ├── panel-setup.sql         # SQL do Supabase (tabele zamówień/analityki)
    ├── google-drive-auto.md / google-apps-script.gs / google-drive-setup.md
    └── ...
```

## 2. Uruchomienie lokalne

```bash
cd studio-ai
python3 -m http.server 8080
# http://localhost:8080
```

## 3. Generator poradnika (SEO)

Artykuły powstają z plików `poradnik_data_*.py` (każdy ma `ITEMS = [...]`).

```bash
cd studio-ai
python3 build_poradnik.py     # tworzy poradnik/*.html, poradnik.html, sitemap.xml
```
- Dodajesz artykuł → dopisujesz wpis do dowolnego `poradnik_data_*.py` i odpalasz generator.
- Uważaj na polskie cudzysłowy: używaj „ ” (U+201E/U+201D), nie ASCII `"` w treści (psuje parser).
- Aktualnie: **144 artykuły**, sitemap ~150 URL.

## 4. Wdrożenie (dwie gałęzie)

- **Dev:** gałąź `claude/blissful-faraday-8aJHZ`, pliki w `studio-ai/`.
- **Produkcja:** gałąź `vercel-deploy`, pliki w `studio/` (Vercel serwuje to jako bobofoto.pl).
- Po zmianie: kopiujesz zmienione pliki ze `studio-ai/` do `studio/` na gałęzi `vercel-deploy` i pushujesz.
- Cache-busting: przy zmianie css/js podbij `?v=NN` w `index.html`.

## 5. Integracje i sekrety (do uzupełnienia po stronie właściciela)

| Co | Gdzie | Status |
|---|---|---|
| **Supabase** (Auth + Storage `zdjecia-klientow` + tabele `zamowienia`, `zdarzenia`) | konto `juqlhorodqvczoqkvkim` | działa; SQL w `docs/panel-setup.sql` |
| **Stripe** Payment Links (Mini/Standard/Premium) | w `js/main.js` (PAYMENT_LINKS) | działa |
| **Stripe** realne zarobki w panelu | `api/stripe.js` | wymaga `STRIPE_SECRET_KEY` w Vercel |
| Kod rabatowy **BOBO40** (-40%) | Stripe Dashboard | do dodania |
| **Meta Pixel** `1320762476176589` | `js/pixel.js` | działa |
| **Google Search Console** | meta w `index.html` | zweryfikowane |
| **Facebook domain verification** | meta w `index.html` | zweryfikowane |
| Auto-zapis na **Google Drive** | `supabase/functions/drive-sync` | wymaga sekretów Google (patrz docs) |

## 6. Co w toku / pomysły na rozwój

- [ ] **Galeria „Starsze dziecko"** — wygenerować zdjęcia (prompty w `docs/PROMPTY.md`) i dodać kategorię w `js/gallery-data.js` + podpiąć pod przełącznik w hero.
- [ ] **Więcej par PRZED→PO** do kafelków w hero (lista `pairs` w inline-script `index.html`).
- [ ] **Uzupełnić `regulamin.html`** (dane sprzedawcy) i włączyć link w stopce + dopisać do sitemap.
- [ ] Zrównać **schema FAQ** (w `<head>` jest 7 pytań, widoczne 4).
- [ ] Ustawić `STRIPE_SECRET_KEY` w Vercel + kod **BOBO40**.
- [ ] **Profil Firmy Google** (instrukcja: `docs/wizytowka-google.md`) — kluczowe dla frazy „bobofoto".

## 7. Ważna uwaga o marce/SEO

Istnieje konkurencyjny fotograf o nazwie „BoboFoto" (Ina Satsiuk, Śląsk) z wizytówką Google.
Na frazy opisowe („sesja noworodkowa online", + miasta) mamy realną szansę; na samo „bobofoto"
kluczowa jest własna **wizytówka Google** + spójna nazwa `BoboFoto.pl` na FB/IG.
