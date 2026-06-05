# STUDIO AI — strona usługi

Szybkie sesje noworodkowe AI. Klient wysyła zdjęcie dziecka, wybiera tło i dostaje
profesjonalną wersję — od **24 zł**, realizacja do **~2 h**.

Strona statyczna (HTML/CSS/JS, bez build-stepu) — hostowalna wszędzie.

## Struktura

```
studio-ai/
├── index.html              # cała strona (Start, Jak to działa, Galeria, Cennik, Kontakt)
├── css/style.css           # style (paleta fine-art: krem / beż / szałwia)
├── js/
│   ├── gallery-data.js     # lista zdjęć + kategorie (edytujesz tu galerię)
│   └── main.js             # galeria, filtry, lightbox, marquee, formularz
├── reklamy/
│   └── facebook-reklamy.md # 5 gotowych reklam na Facebooka/Instagram
├── docs/
│   └── PROMPTY.md          # biblioteka promptów (sekcja A — klient, B — modele)
└── README.md
```

## Uruchomienie lokalne

To zwykłe pliki statyczne. Najprościej:

```bash
cd studio-ai
python3 -m http.server 8080
# otwórz http://localhost:8080
```

## Hosting — Vercel (zalecane, auto-deploy z GitHuba)

Strona jest gotowa do publikacji na Vercel. Vercel podpina się pod repo i wdraża
automatycznie po każdym pushu do GitHuba.

Import (jednorazowo):
1. Wejdź na https://vercel.com → **Add New… → Project** → **Import** repo `piotrzajac4321-maker/MapJob`.
2. **Root Directory:** ustaw na **`studio-ai`** (przycisk *Edit* przy Root Directory).
3. **Framework Preset:** *Other* · **Build Command:** puste · **Output Directory:** puste
   (to czysta strona statyczna — Vercel serwuje pliki bez budowania).
4. **Production Branch:** wybierz gałąź, z której publikujesz (np. `claude/blissful-faraday-8aJHZ`).
5. **Deploy** → dostajesz adres `https://<nazwa>.vercel.app`.

Po imporcie każdy push do tej gałęzi = automatyczny re-deploy. Własną domenę
podpinasz w *Project → Settings → Domains*. Konfiguracja w `vercel.json`
(czyste URL-e, nagłówki bezpieczeństwa).

> Alternatywy: **Netlify** (Import repo, base directory `studio-ai`) albo dowolny
> hosting z FTP — wystarczy wgrać zawartość `studio-ai/`.

Po podpięciu własnej domeny uzupełnij `og:` w `<head>` (tytuł, opis, docelowy adres).

## Płatności (Przelewy24 / Stripe) — do podłączenia

W `js/main.js` (funkcja obsługi formularza) jest miejsce na integrację:

**Najprościej — Payment Links (bez backendu):**
1. W panelu Stripe lub Przelewy24 utwórz 3 linki płatności (Mini 24 zł, Standard 49 zł, Premium 99 zł).
2. Wklej je do mapy i przekieruj po wysłaniu formularza:
   ```js
   const PAYMENT_LINKS = {
     mini:     "https://buy.stripe.com/...",
     standard: "https://buy.stripe.com/...",
     premium:  "https://buy.stripe.com/...",
   };
   window.location.href = PAYMENT_LINKS[data.pakiet];
   ```

**Z backendem (Stripe Checkout):** utwórz endpoint tworzący `Checkout Session`
i przekieruj na zwrócony `session.url`. Formularz wysyła już komplet danych
(imię, e-mail, pakiet, stylizacja, zgoda).

> W repo dostępny jest serwer MCP Stripe — można nim wygenerować produkty, ceny
> i linki płatności (`create_product`, `create_price`, `create_payment_link`).

## Galeria — jak edytować

Wszystkie kadry definiuje `js/gallery-data.js`. Każdy wpis:

```js
{ f: "nazwa_pliku_bez_rozszerzenia", cat: "klasyczne", title: "Etykieta PL" }
```

Kategorie: `klasyczne`, `sezonowe`, `tematyczne` (filtry generują się automatycznie).

### Własny hosting zdjęć (zalecane docelowo)

Obecnie zdjęcia są **hotlinkowane z CDN Higgsfield** (CloudFront). Działa to w przeglądarce
od ręki, ale te adresy mogą z czasem wygasnąć. Docelowo:

1. Pobierz pliki (`_min.webp` do siatki, `.png` do podglądu) i wrzuć do `studio-ai/img/galeria/`.
2. W `gallery-data.js` zmień budowanie URL-i na lokalne:
   ```js
   GALLERY.forEach(g => {
     g.thumb = "img/galeria/" + g.f + ".webp";
     g.full  = "img/galeria/" + g.f + ".png";
   });
   ```

## Zasady projektu (ważne)

- Galeria i reklamy używają **fikcyjnych modeli AI** — nie zdjęć prawdziwych dzieci.
- W usłudze to **klient wgrywa i akceptuje** zdjęcie swojego dziecka; formularz zawiera
  wymaganą **zgodę na przetwarzanie wizerunku**.
- Twarz i rysy dziecka pozostają bez zmian — modyfikowane są tylko stylizacja, tło i światło.
- Strona inspirowana dobrymi wzorami fotografii noworodkowej, ale jako **oryginał**.

## Stos generowania zdjęć

Nano Banana 2 (Higgsfield), format **3:4**, jakość **2K**. Prompty: `docs/PROMPTY.md`.
