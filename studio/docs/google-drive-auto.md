# Auto-zapis zdjęć na Google Drive

Każde nowe zamówienie → zdjęcia automatycznie lądują w folderze na Twoim
**Dysku Współdzielonym** (Shared Drive), w podfolderze nazwanym
`data_imię_idZamówienia`. Działa to przez funkcję `supabase/functions/drive-sync`.

> Dlaczego Dysk Współdzielony, a nie zwykły „Mój Dysk"? Konto usługowe Google
> nie ma własnego limitu miejsca, więc pliki muszą trafiać na Shared Drive
> (albo folder na nim). To 5 minut konfiguracji — kroki niżej.

---

## 1) Google Cloud — konto usługowe

1. Wejdź na https://console.cloud.google.com → utwórz projekt (np. „BoboFoto").
2. **APIs & Services → Enable APIs** → włącz **Google Drive API**.
3. **APIs & Services → Credentials → Create credentials → Service account**.
   - Nazwa: `bobofoto-drive`. Utwórz.
4. Wejdź w utworzone konto → zakładka **Keys → Add key → Create new key → JSON**.
   - Pobierze się plik `.json`. Otwórz go — będą potrzebne dwa pola:
     - `client_email`  → to **GOOGLE_SA_EMAIL**
     - `private_key`   → to **GOOGLE_SA_PRIVATE_KEY**

## 2) Dysk Współdzielony

1. Na https://drive.google.com → po lewej **Dyski współdzielone → Nowy** → np. „BoboFoto Zamówienia".
2. Wejdź do niego, utwórz folder np. „Zdjęcia klientów".
3. Udostępnij **cały Dysk Współdzielony** kontu usługowemu:
   - prawym na nazwę dysku → **Zarządzaj członkami** → wklej `client_email`
     z punktu 1.4, rola **Współtwórca** (Content manager).
4. Skopiuj **ID folderu** „Zdjęcia klientów" z adresu URL
   (`https://drive.google.com/drive/folders/<TO_ID>`) → to **GDRIVE_PARENT_ID**.

## 3) Supabase — sekrety i wdrożenie funkcji

W Supabase (projekt bobofoto) → **Edge Functions → Secrets** dodaj:

| Nazwa | Wartość |
|---|---|
| `SB_URL` | `https://juqlhorodqvczoqkvkim.supabase.co` |
| `SB_SERVICE_ROLE_KEY` | Settings → API → **service_role** (tajny!) |
| `GOOGLE_SA_EMAIL` | `client_email` z pliku JSON |
| `GOOGLE_SA_PRIVATE_KEY` | `private_key` z pliku JSON (z `\n` — wklej tak jak jest) |
| `GDRIVE_PARENT_ID` | ID folderu z kroku 2.4 |

Wdróż funkcję (Supabase CLI, w katalogu `studio-ai/`):

```bash
supabase functions deploy drive-sync --project-ref juqlhorodqvczoqkvkim --no-verify-jwt
```

> `--no-verify-jwt`, bo wywołuje ją webhook bazy, nie zalogowany użytkownik.

## 4) Database Webhook (wyzwalacz)

Supabase → **Database → Webhooks → Create a new hook**:
- Table: `public.zamowienia`
- Events: **Insert**
- Type: **Supabase Edge Functions** → wybierz `drive-sync`
- Zapisz.

## 5) Test

Złóż testowe zamówienie z 1 zdjęciem na stronie. W ciągu kilkunastu sekund na
Dysku Współdzielonym pojawi się nowy podfolder ze zdjęciem w pełnej jakości.
Logi: Supabase → Edge Functions → `drive-sync` → Logs.

---

### Najczęstsze błędy
- **403 / „File not found: parent"** → konto usługowe nie jest członkiem
  Dysku Współdzielonego (krok 2.3) albo złe `GDRIVE_PARENT_ID`.
- **„invalid_grant"** → źle wklejony `GOOGLE_SA_PRIVATE_KEY` (musi zawierać `\n`).
- **Brak plików** → webhook odpalił się, ale `pliki` puste (zamówienie tylko ze stylizacji).
