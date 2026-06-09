# Higgsfield — modele, parametry, koszty, pipeline

Mapowanie promptów na Higgsfield MCP (`generate_image`, `upscale_image`, `outpaint_image`, `remove_background`).

## Wybór modelu

| Model | id | Kiedy | Uwagi |
|---|---|---|---|
| **Nano Banana Pro** | `nano_banana_pro` | **Produkcja** — finalne zdjęcia klienta | Najwyższa jakość, 1k/2k/4k, najlepsza wierność i tekstura. Domyślny. |
| Nano Banana 2 | `nano_banana_2` | Szybki podgląd / próbki / dużo wariantów | To, czego używaliście. Tańszy. 1k/2k/4k. |
| GPT Image 2 | `gpt_image_2` | Gdy potrzebny **tekst/typografia** na grafice (np. kartka, baner) | low/medium/high quality. |
| DTC Ads | `ms_image` | Reklamy produktowe z brand-kit | Wymaga `style_id` + `show_marketing_studio`. |
| Soul 2 | `soul_2` | Powtarzalna postać (digital twin) | Tylko gdy chcesz trenować stałą postać (5–20 zdjęć). Nie dla zwykłej usługi. |

Wszystkie powyższe przyjmują **referencję** (`medias` z `role: "image"`) i obsługują formaty `3:4`, `1:1`, `9:16`.

## Koszty (zweryfikowane przez get_cost)

| Operacja | Koszt (kredyty) |
|---|---|
| nano_banana_pro, 2k | **2** |
| nano_banana_2, 1k | **1,5** |
| nano_banana_pro, 4k | sprawdź `get_cost` przed batchem |
| upscale_image | flat — sprawdź `get_cost` |

> **Zawsze rób `get_cost: true` przed większym batchem.** Plan Plus + top-up kredytów: użyj `show_plans_and_credits`.

## Wywołanie — Tryb A (na zdjęciu klienta)

1. Wgraj referencję: `media_upload` → PUT bajtów → `media_confirm` → dostajesz `media_id` (UUID).
2. `generate_image`:
```json
{
  "model": "nano_banana_pro",
  "prompt": "<pełny prompt z 12 warstw>",
  "aspect_ratio": "3:4",
  "resolution": "2k",
  "count": 1,
  "medias": [{ "role": "image", "value": "<media_id referencji>" }]
}
```
3. Twarz źle? → `realizm-checklist.md` (wzmocnij identity-lock), regeneruj.

## Wywołanie — Tryb B (fikcyjny model, reklama/galeria/test)

Jak wyżej, ale **bez `medias`** i z frazą fikcyjnego modela (warstwa 1B).

## Formaty — jak robić 1:1 i 9:16

⚠️ `reframe` działa **tylko na wideo**. Dla obrazów:

- **Zalecane:** wygeneruj każdy format osobno przez `generate_image` z **tą samą referencją** i tym samym promptem, zmieniając tylko `aspect_ratio`. Daje spójną twarz i poprawną kompozycję.
- **Alternatywa (tańsza):** `outpaint_image` — rozszerza istniejący kadr do nowego `aspect_ratio` (np. 3:4 → 9:16 dorysowując tło). Dobre, gdy chcesz dokładnie to samo ujęcie szersze/wyższe.

## Upscale (finał do druku)

Po akceptacji ujęcia 2k → `upscale_image` do 4k:
```json
{ "image_id": "<job_id lub media_id>", "width": <px>, "height": <px>, "resolution": "4k" }
```
Musisz podać `width`/`height` źródła w pikselach (serwer ich nie zgaduje).

## Inne narzędzia

- `remove_background` — gdy potrzebny wycięty obiekt (np. dziecko na transparentnym tle do kompozycji/produktu).
- `outpaint_image` — rozszerzenie tła / zmiana kształtu kadru.
- `job_display` — podgląd wcześniejszej generacji po job_id.

## Pipeline produkcyjny (rekomendacja)

1. **Podgląd** taniej: `nano_banana_2` 1k, 1 sztuka — oceń kompozycję/twarz.
2. **Produkcja**: `nano_banana_pro` 2k, `count` 2–3 warianty do wyboru.
3. **Formaty**: regeneruj 1:1 i 9:16 z tą samą referencją.
4. **Finał druk**: `upscale_image` 4k na zaakceptowanym ujęciu.
5. Zawsze człowiek (właściciel) akceptuje przed wysyłką do klienta.
