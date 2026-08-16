# Google Drive — auto-zapis zdjęć (przez Google Apps Script)

Najprostsza droga: mały skrypt na Twoim koncie Google zapisuje zdjęcia z każdego
zamówienia do folderu **„BoboFoto — zamówienia"** na Twoim Dysku. Bez kont
usługowych, bez Google Cloud. Robi się to raz, w przeglądarce (~5 min).

## 1) Utwórz skrypt
1. Wejdź na **https://script.google.com** → **Nowy projekt**.
2. Usuń to, co tam jest, i wklej całą zawartość pliku `google-apps-script.gs`.
3. Zapisz (ikona dyskietki).

## 2) Wdróż jako aplikację internetową
1. Prawy górny róg: **Wdróż → Nowe wdrożenie**.
2. Typ (koło zębate) → **Aplikacja internetowa**.
3. „Wykonaj jako": **Ja**.  „Kto ma dostęp": **Wszyscy**.
4. **Wdróż** → zaakceptuj uprawnienia (Google zapyta o dostęp do Dysku — zezwól).
5. Skopiuj **URL aplikacji internetowej** (kończy się na `/exec`).

## 3) Podłącz do strony
Wyślij mi ten URL — wkleję go na stronie (pole `GDRIVE_WEBAPP_URL`) i opublikuję.
Od tego momentu każde nowe zamówienie z przesłanymi zdjęciami trafia na Twój Dysk.

## Jak to działa / uwagi
- Folder: `BoboFoto — zamówienia / RRRR-MM-DD_GG-MM_Imię/` → `zamowienie.txt` + zdjęcia
  w pełnej jakości.
- Zdjęcia idą prosto z przeglądarki klienta do Twojego Dysku (oryginalna jakość).
- Sekret w kodzie chroni przed przypadkowymi wpisami; skrypt ma też limit
  20 plików / 25 MB na zamówienie.
- Zamówienia bez przesłanych zdjęć (tylko wybór stylizacji z galerii) nie tworzą
  folderu — te dane masz w panelu.
- To NIE zastępuje panelu — zdjęcia nadal są też w Supabase i w panelu (ZIP/CSV).
