# Deploy mapjob.pl na cyberFolks

`mapjob.pl` jest na cyberFolks (LiteSpeed) za Cloudflare. NIE na Vercel.
Deploy = upload plików na hosting (SFTP/cPanel File Manager).

## 1. PIERWSZY UPLOAD (ręczny, jednorazowy)

### Pliki do wgrania do `public_html` (lub gdzie masz katalog domeny):

**Zmodyfikowane / nowe — MUSI być na produkcji:**
```
index.html                                ← zaktualizowany footer SEO (Polska + zagranica + branże)
sitemap.xml                               ← 85 URL-i z lastmod

praca-w-polsce/index.html                 ← hub Polska (11 ofert)
praca-warszawa/index.html                 ← 4 oferty (Platinum EMS)
praca-trener-personalny/index.html        ← 4 oferty
praca-niemcy/index.html                   ← 14 ofert
praca-holandia/index.html                 ← 44 oferty
praca-czechy/index.html                   ← (nie ma — opcjonalnie kiedyś)
praca-magazynier/index.html               ← 19 ofert (cross)
praca-produkcja/index.html                ← 44 oferty (cross)
praca-za-granica/index.html               ← hub zagranica (60 ofert)

oferta/<slug>-<short_id>/index.html       ← 71 plików, każda oferta z DB
```

### Łączna ilość plików: ~84 (8 landingów + 71 ofert + sitemap + index.html zaktualizowany)

### Jak wgrać:
- **SFTP (FileZilla / WinSCP)** — najszybciej, batch upload katalogu `oferta/` i wszystkich `praca-*/`
- **cPanel → File Manager** — wolniej, klik klik, ale działa

⚠ **Po uploadzie sprawdź pod kątem cache:**
- W cyberFolks i Cloudflare jest cache → możliwe że nowe pliki przyjdą z opóźnieniem 5-15 min
- Wymuś: cyberFolks panel → wyczyść cache LiteSpeed; Cloudflare → Purge cache (jeśli masz dostęp)
- Test: `https://mapjob.pl/praca-niemcy/` powinno pokazać landing (NIE SPA fallback z `index.html` o tytule „Znajdź fachowca")

## 2. AUTOMATYZACJA (cron job na cyberFolks)

cyberFolks supportuje SSH + Python + cron. Najczyściej:

### Krok A: Wgraj na hosting (oprócz plików powyżej):
```
build_seo_landings.py                     ← generator
oferty-pramer.json, oferty-jobwerke.json  ← legacy data (opcjonalnie)
```

### Krok B: SSH na cyberFolks i ustaw cron:
```bash
# Sprawdź python3
which python3       # zazwyczaj /usr/bin/python3

# Sprawdź dostęp do katalogu domeny
cd ~/domains/mapjob.pl/public_html   # lub gdzie masz katalog
ls build_seo_landings.py             # ← powinien być

# Test ręcznego uruchomienia
SUPABASE_URL=https://ahgzjneegvptudphibdm.supabase.co \
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZ3pqbmVlZ3ZwdHVkcGhpYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA3NzcsImV4cCI6MjA4OTY4Njc3N30.KrCBuAzz7fsCHCUSGeTZ5vm7BOo-DIGvI3jZyrk4tL4 \
/usr/bin/python3 build_seo_landings.py

# Jak działa → ustaw cron (cPanel → Cron Jobs lub crontab -e)
*/10 * * * * cd /home/USER/domains/mapjob.pl/public_html && SUPABASE_URL=https://ahgzjneegvptudphibdm.supabase.co SUPABASE_ANON_KEY=eyJhbGc... /usr/bin/python3 build_seo_landings.py >> /tmp/seo-rebuild.log 2>&1
```

Co 10 minut pobiera świeże oferty z Supabase i regeneruje statyczne HTML. Zero ręcznej pracy.

### Czas reakcji: ~10 min od dodania oferty (cron tick).
Jeśli chcesz szybciej → częstszy cron (np. `*/2 * * * *` = co 2 min, ale generator robi 84 plików × ~10ms = ~1 sek, więc bezpieczne).

### Alternatywa: Supabase trigger → webhook do skryptu na cyberFolks
Wymaga publicznego endpointa na cyberFolks (PHP/Python) który po POST uruchamia `build_seo_landings.py`. Bardziej skomplikowane, NIE polecam dopóki nie pojawi się prawdziwa potrzeba real-time.

## 3. CO ZROBIONE / CO ZOSTAJE

- ✅ **Supabase trigger `seo-rebuild`** — usunięty (strzelił w nieaktywny Vercel)
- 🟡 **Vercel Deploy Hook + env vars** — pozostawione w projekcie `map-job` (nieaktywne, mogą się przydać przy ewentualnej migracji)
- ✅ **Lokalne pliki gotowe**: 8 landingów + 71 stron ofert + zaktualizowany index.html + sitemap.xml + generator
- ❌ **Nie ma na produkcji** — wgrywasz ręcznie (instrukcja powyżej)
- ❌ **Cron na cyberFolks** — do ustawienia (instrukcja powyżej)

## 4. PYTANIA do siebie przed deploy

- Czy masz dostęp SSH do cyberFolks? (większość pakietów cyberFolks ma)
- Czy masz Python 3 na hostingu? (`ssh user@host "python3 --version"` → powinno pokazać 3.x)
- Czy używasz Cloudflare proxy (orange cloud) czy DNS only (grey cloud)? Jeśli orange — Cloudflare cache też trzeba purge'ować po deploy

## 5. PO DEPLOYU — co sprawdzić

1. `https://mapjob.pl/praca-niemcy/` → landing (NIE SPA index.html)
2. `https://mapjob.pl/oferta/florysta-florystka-radom-1004/` → strona oferty
3. `https://mapjob.pl/sitemap.xml` → zawiera 85 URL-i z `/praca-*` i `/oferta/*`
4. Google Search Console → zgłoś sitemap, „Request indexing" na top 5 landingów
5. Sprawdź JobPosting JSON-LD w https://search.google.com/test/rich-results (wklej URL oferty)
