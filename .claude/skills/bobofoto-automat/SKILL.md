---
name: bobofoto-automat
description: Półautomat do masowej obróbki zdjęć BoboFoto.pl na Higgsfield MCP. Czyta manifest zlecenia (zdjęcia klientów + wybór stylu/formatów), buduje prompty skillem foto-prompt-pro, generuje warianty, upscale do druku, kadruje do 3:4/1:1/9:16 i zapisuje do folderu "do zatwierdzenia". Używaj, gdy użytkownik chce uruchomić automat, przetworzyć paczkę/zlecenie zdjęć, wygenerować wsadowo galerię/reklamy albo "przerobić zdjęcia klientów".
---

# BoboFoto Automat — półautomat obróbki zdjęć (Higgsfield)

Działasz jako operator pipeline'u produkcyjnego BoboFoto. Bierzesz **manifest zlecenia**, przepuszczasz każdą pozycję przez stały pipeline i oddajesz właścicielowi gotowe pliki **do akceptacji**. Człowiek (właściciel) zawsze zatwierdza przed wysyłką do klienta — to półautomat, nie pełna automatyzacja.

> Prompty budujesz skillem **`foto-prompt-pro`** (12 warstw + checklista realizmu). Parametry/koszty/modele → `foto-prompt-pro/higgsfield.md`. Ten skill opisuje **orkiestrację**.

## Wejście — manifest zlecenia

Manifesty leżą w `studio-ai/automat/zlecenia/<zlecenie_id>.json`. Schema: `studio-ai/automat/zlecenie.schema.json`. Przykład: `studio-ai/automat/zlecenia/przyklad-0001.json`. Struktura:

```json
{
  "zlecenie_id": "2026-0001",
  "klient": "opis/numer zamówienia (bez danych wrażliwych w repo)",
  "tryb": "A",                       // A = na zdjęciu klienta, B = fikcyjny model
  "model": "nano_banana_pro",
  "resolution": "2k",
  "formaty": ["3:4", "1:1", "9:16"],
  "warianty_na_styl": 2,
  "upscale_4k": true,                 // upscale finalnego 3:4 do druku
  "pozycje": [
    {
      "referencja": "automat/zlecenia/2026-0001/foto1.jpg",  // ścieżka lub https URL; pomijana w trybie B
      "etap": "newborn",
      "style": ["Klasyczne studio", "Boho / naturalne"],
      "uwagi": "dziewczynka, paleta róż"
    }
  ]
}
```

## Pipeline — kroki dla KAŻDEJ pozycji × KAŻDEGO stylu

1. **Brief check** — zwaliduj manifest względem schemy. Braki → uzupełnij bezpiecznymi domyślnymi ([ZAŁOŻENIE]) i wypisz je przed startem.
2. **Preflight kosztu** — policz: `pozycje × style × formaty × warianty` generacji. Zrób `get_cost` dla użytego modelu, pomnóż, porównaj z `balance`. Jeśli zabraknie kredytów → zatrzymaj się, pokaż szacunek i `show_plans_and_credits`. **Nie startuj batcha w ciemno.**
3. **Referencja (Tryb A)** — `media_upload` → PUT bajtów → `media_confirm` → `media_id`. (Tryb B: pomiń.)
4. **Prompt** — zbuduj skillem `foto-prompt-pro`: właściwy szablon stylu (`szablony-newborn.md`/`szablony-dziecko.md`) + prefiks/sufiks + 12 warstw. Tryb A: identity-lock.
5. **Podgląd (opcjonalnie, oszczędność)** — przy dużym batchu najpierw `nano_banana_2` 1k, 1 szt. na styl; oceń kompozycję/twarz, dopiero potem produkcja.
6. **Generacja produkcyjna** — `generate_image` modelem z manifestu, `aspect_ratio: "3:4"`, `count = warianty_na_styl`, `medias` z referencją (Tryb A).
7. **Kontrola jakości** — przejdź test z `realizm-checklist.md` (skóra/dłonie/oczy/twarz). Twarz zmieniona → wzmocnij identity-lock i regeneruj. Złe ujęcie nie idzie dalej.
8. **Pozostałe formaty** — dla 1:1 i 9:16 regeneruj z tą samą referencją i promptem, zmieniając tylko `aspect_ratio` (spójna twarz). Alternatywa: `outpaint_image` z zaakceptowanego 3:4.
9. **Upscale druk** — jeśli `upscale_4k`: `upscale_image` 4k na zaakceptowanym 3:4 (podaj width/height źródła).
10. **Zapis** — pobierz wyniki do `studio-ai/automat/output/<zlecenie_id>/<pozycja>/<styl>/` wg konwencji nazw (niżej). ⚠️ W zdalnym środowisku Claude (web) host CDN Higgsfielda bywa poza allowlistą sieci — wtedy `curl` zwróci „Host not in allowlist". W takim wypadku przekaż właścicielowi linki/widget `job_display` (pobierze z panelu Higgsfield); pełny zapis do `output/` rób w środowisku lokalnym z dostępem sieciowym.
11. **Raport** — na końcu wypisz tabelę: pozycja × styl × format → status + job_id + ścieżka, oraz sumę zużytych kredytów.

## Konwencja nazw plików wyjściowych

```
automat/output/<zlecenie_id>/
  poz1/
    klasyczne-studio_3x4_v1.png
    klasyczne-studio_3x4_v2.png
    klasyczne-studio_1x1_v1.png
    klasyczne-studio_9x16_v1.png
    klasyczne-studio_3x4_4k.png        # upscale do druku
  poz1/_raport.md                       # job_id, prompt, parametry, koszt
```

## Bezpieczeństwo wizerunku i danych (twarda zasada)

- Automat działa **wyłącznie** na zdjęciach, które klient sam wgrał i zaakceptował (decyzja o przetwarzaniu wizerunku dziecka należy do klienta).
- **Nie commituj** zdjęć realnych klientów ani danych osobowych do repo. Foldery `automat/zlecenia/<id>/` i `automat/output/<id>/` są w `.gitignore` (oprócz przykładów/schemy). Pracuj na nich lokalnie / w Storage Supabase.
- Testy jakości rób na **Trybie B** (fikcyjny model) — bez wizerunku realnego dziecka.
- Zawsze zostaw krok akceptacji człowieka przed wysyłką do klienta.

## Tryb B — galeria i reklamy (bez klientów)

Do masowego materiału na galerię/reklamy: `tryb: "B"`, pomiń referencję. Trzymaj spójne światło/paletę w obrębie kategorii (pod `studio-ai/js/gallery-data.js`). Reklamy z tekstem → rozważ `gpt_image_2` lub skill `ad-copywriter` na warstwę copy.

## Anty-wzorce

- ❌ Start batcha bez preflightu kosztu (skończą się kredyty w połowie).
- ❌ Generowanie wszystkich formatów × wariantów zanim ocenisz pierwszy podgląd.
- ❌ Oddanie ujęcia, które nie przeszło checklisty realizmu.
- ❌ Commit realnych zdjęć klientów / PII do gita.
- ❌ Pominięcie identity-locka w Trybie A.
