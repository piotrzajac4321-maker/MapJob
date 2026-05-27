# MapJob — wdrożenie krytycznych elementów

Ten dokument opisuje **jak uruchomić pliki dodane w tej iteracji**, żeby aplikacja zaczęła realnie przyjmować płatności i działać jako PWA.

---

## 1. Stripe Webhook (Supabase Edge Function)

**Po co:** dopóki tego nie ma, klient może zapłacić, ale `payments.status` nigdy nie przejdzie na `completed` i pakiet się nie aktywuje. Kod w `index.html` linia 5556 ma tylko fallback po `?payment=success` — zawodny, jeśli user zamknie kartę.

### Kroki

1. Zainstaluj Supabase CLI (jeśli nie masz): https://supabase.com/docs/guides/cli
2. Zaloguj i podepnij projekt:
   ```bash
   supabase login
   supabase link --project-ref ahgzjneegvptudphibdm
   ```
3. Ustaw sekrety (z Dashboard Stripe → Developers → API keys / Webhooks):
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
   `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` Supabase wstrzyknie automatycznie.
4. Deploy:
   ```bash
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
   Flaga `--no-verify-jwt` jest konieczna — Stripe nie wysyła Supabase JWT, autoryzujemy sygnaturą `stripe-signature`.
5. W Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   - **Endpoint URL:** `https://ahgzjneegvptudphibdm.supabase.co/functions/v1/stripe-webhook`
   - **Events to send:**
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded` (BLIK async)
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
     - `charge.refunded`
   - Po utworzeniu skopiuj **Signing secret** (`whsec_...`) i wstaw do `STRIPE_WEBHOOK_SECRET` (pkt 3).
6. Test:
   ```bash
   stripe trigger checkout.session.completed
   supabase functions logs stripe-webhook
   ```

### Wymagane tabele / RPC w Supabase

Webhook zakłada, że istnieje:

- **Tabela `payments`** z kolumnami: `id`, `user_id`, `email`, `product_key`, `product_name`, `amount`, `currency`, `stripe_price_id`, `stripe_product_id`, `stripe_session_id`, `status`, `metadata` (jsonb), `created_at`, `updated_at`.
- **RPC `activate_package(p_user_id uuid, p_product_key text, p_months int)`**
- **RPC `activate_urgent_tender(p_tender_id uuid, p_user_id uuid)`**

Jeśli `stripe_session_id` nie istnieje w tabeli — dodaj:
```sql
alter table public.payments add column if not exists stripe_session_id text;
create index if not exists payments_stripe_session_id_idx on public.payments(stripe_session_id);
```

### RLS — krytyczne dla bezpieczeństwa

Webhook używa `service_role` (omija RLS), ale tabela `payments` **musi mieć RLS włączony**, żeby frontend nie widział cudzych płatności:

```sql
alter table public.payments enable row level security;

create policy "Users see own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users insert own pending"
  on public.payments for insert
  with check (auth.uid() = user_id and status in ('pending','pending_blik'));

-- update tylko przez service_role (webhook) — brak policy dla anon/authenticated
```

---

## 2. PWA (manifest + service worker + ikony)

Pliki: [manifest.json](manifest.json), [sw.js](sw.js), [icons/](icons/)

Ikony już wygenerowane — `python generate_icons.py` (wymaga `pip install Pillow`).

**Nic więcej nie trzeba robić** — `index.html` już ładuje manifest (linia 22) i rejestruje `sw.js` (linia 237). Po wrzuceniu plików na serwer/hosting do root, PWA zacznie działać: instalacja, offline-fallback i push notifications.

Jeśli hostujesz na Vercel/Netlify/Cloudflare Pages — pliki w root zostaną poprawnie podane. Dla nginx/Apache — upewnij się, że `/sw.js` jest serwowany z nagłówkiem `Service-Worker-Allowed: /` (domyślnie OK, bo plik jest w root).

---

## 3. Migracja: CV auto-fill (`profiles` — nowe kolumny)

**Po co:** nowy przycisk „📄 Prześlij CV i uzupełnij automatycznie" w panelu *Mój CV* wyciąga pola z PDF (pdfjs + regex po stronie klienta) i zapisuje je zarówno do `localStorage`, jak i do `public.profiles`. Migracja dodaje potrzebne kolumny (`cv_url`, `phone`, `langs`, `certs`, `specializations`, `countries`, `daily_rate`, `monthly_rate`, `avail_from_text`, `mobility`, `employ_type`). Bez niej frontend rzuci błędami `column … does not exist` przy każdym auto-fillu i aplikacji.

### Kroki

1. Wrzuć migrację przed deployem nowej wersji `index.html`:
   ```bash
   supabase db push
   # lub ręcznie przez SQL editor:
   # skopiuj zawartość supabase/migrations/20260420_profile_cv.sql i wykonaj
   ```
2. Sprawdź, że kolumny istnieją:
   ```sql
   select column_name from information_schema.columns
   where table_schema='public' and table_name='profiles'
     and column_name in ('cv_url','langs','certs','specializations','countries',
                         'daily_rate','monthly_rate','avail_from_text','mobility','employ_type');
   ```
3. CV jest uploadowany do istniejącego, **prywatnego** bucketu `chat-attachments` pod stałym kluczem `cv/<user_id>.pdf`. Nie ma potrzeby tworzenia nowego bucketu, ale upewnij się, że polityka storage pozwala właścicielowi upload/select (standardowa polityka `chat-attachments` już to robi).
4. Smoke test: zaloguj się → *Mój CV* → „Prześlij CV i uzupełnij automatycznie" → wybierz PDF → zaakceptuj dialog → `select cv_url,phone,langs from profiles where id = '<twój uid>';` powinno zwrócić niepuste pola.

> **Uwaga bezpieczeństwa:** CV ląduje w prywatnym buckecie, ale aktualny kod reuse-CV w aplikacji generuje `getPublicUrl` (jak istniejący flow w `submitJobApplication`). Jeżeli RLS audit wymaga pełnej prywatności CV przed rekrutacją, zmień na `createSignedUrl({ expiresIn: 86400 })` — do zrobienia osobnym PR-em.

---

## 3b. Migracja: Panel powiadomień w admin.html (`notification_configs`)

**Po co:** poprzednio w `index.html` były 3 zahardkodowane `addNotification(...)` (beta_info, ambasador, pakiet_wspierajacy) odpalające się co 2.5s po każdym załadowaniu strony. Kiedy user miał włączony OS push, dostawał 3 systemowe powiadomienia przy każdym refresh. Teraz lista powiadomień jest w bazie, edytowalna z panelu admina — admin kontroluje treść, ikonę, częstotliwość, target (zalogowani/goście/pro/free), zakres dat, delay i czy włączyć push OS.

### Kroki

1. Zaaplikuj migrację:
   ```bash
   supabase db push
   # lub ręcznie: SQL Editor → wklej supabase/migrations/20260422_notification_configs.sql → Run
   ```
2. Sprawdź że tabela i seed siedzą w bazie:
   ```sql
   select key, enabled, frequency, target, os_push, sort_order
   from public.notification_configs
   order by sort_order;
   -- powinny być 3 rekordy: beta_info_v1, ambasador_v1, pakiet_wspierajacy_v1
   ```
3. Sprawdź RLS (powinny być 4 policies: select=public, insert/update/delete=admin):
   ```sql
   select polname, polcmd from pg_policy
   where polrelid = 'public.notification_configs'::regclass;
   ```
4. Smoke test:
   - Otwórz `admin.html` jako admin → zakładka **🔔 Powiadomienia** → powinny być 3 wpisy.
   - Kliknij „✏ Edytuj" przy którymś → zmień tytuł → 💾 Zapisz.
   - Otwórz `index.html` w innej karcie → po ~2.5s zobacz zmodyfikowany tytuł na dzwoneczku.
   - „🧪 Testuj push" na liście — strzela OS push do Twojej przeglądarki (tylko Tobie).
   - „🧹 Reset widziane (tu)" — kasuje lokalne `mj_notif_seen_*` w TEJ przeglądarce, powiadomienia z `frequency=once` znów się pokażą przy refreshu.

### Frontend fallback (ochrona przed czarną dziurą)

Jeżeli Supabase jest nieosiągalny albo tabela jeszcze nie istnieje, `index.html` używa zaszytej listy 3 promo z tymi samymi kluczami. Dzięki temu user nigdy nie traci powiadomień nawet podczas awarii DB. Gdy już zdeployujesz migrację + edytujesz rekordy w panelu admina — DB wygrywa.

### Fix buga „3 powiadomienia przy każdym refresh"

`addNotification()` w [index.html](index.html) został poprawiony — od teraz zapisuje `localStorage.mj_notif_seen_<key>` **od razu przy pierwszym wyświetleniu**, nie dopiero przy otwarciu dzwoneczka. Wcześniej user zamykając notyfikację bez otwierania panelu dostawał ją znowu przy następnym załadowaniu. W nowych rekordach domyślnie `os_push=false` — dzwoneczek w aplikacji wciąż pokazuje, ale OS push się nie odpala (admin może włączyć per-rekord).

---

## 4. Co jest już w kodzie, ale wymaga Twojej akcji na zewnątrz

| Element | Gdzie skonfigurować |
|---|---|
| Stripe Payment Links (`STRIPE_LINKS`) | W `index.html` musi być wypełniony prawdziwymi linkami `buy.stripe.com/...` z Dashboardu Stripe |
| VAPID key do push (`_VAPID_PUBLIC_KEY`) | `npx web-push generate-vapid-keys` → wstaw public w index.html, private w Supabase secrets (do edge function wysyłającego push) |
| Resend API key (email) | Trzyma się w Supabase secrets — wywoływany z osobnej edge function (do napisania) |
| SMSAPI.pl | Tak samo — z osobnego edge function |

---

## 5. Co dalej (kolejka)

1. **RLS policies** na wszystkich tabelach (`pins`, `tenders`, `payments`, `push_subscriptions`, `admins`) — ✅ ZROBIONE (LAUNCH_FIXES_2026-04-25).
2. **Edge function dla push** — ✅ JUŻ DZIAŁAŁO od dawna jako `push-notify` (deployed v21) + trigger `push_notify` na `messages` + tabela `user_notifications` + RPC `get_my_notifications`/`mark_notifications_read` + triggery `notify_on_message` (10-min dedup) i `notify_on_review`. Patrz §6 niżej.
3. **Edge function dla email** — ✅ Resend działa od dawna (`chat-notify` v20 dla wiadomości admina, `beta-feedback-notify` v19 dla feedbacku beta). `RESEND_API_KEY` jest skonfigurowany w sekretach. Auth maile (reset hasła) — patrz §7.
4. **Fix XSS** w `innerHTML` — ✅ ZROBIONE (LAUNCH_FIXES_2026-04-25 B7).
5. **Minifikacja + code-split** — wydzielić JS/CSS do osobnych plików, hash busting.
6. **Sentry / error monitoring** — bez tego nie zobaczysz awarii prod.

---

## 6. Push notifications + user_notifications inbox (UDOKUMENTOWANE 2026-04-27)

**Stan:** całe pipeline JEST już zdeployowane od dawna — sesja 2026-04-27 tylko podpięła Stripe payments do tej samej rury.

### Co działa (zdeployowane, NIE w repo)

| Komponent | Co robi | Gdzie |
|---|---|---|
| `public.user_notifications` | Tabela per-user inbox: `id, user_id, type, title, body, icon, is_read, link_data, created_at` | Live DB |
| `get_my_notifications(p_limit)` RPC | Zwraca własne notyfikacje, sort `created_at desc` | Live DB |
| `mark_notifications_read()` RPC | UPDATE `is_read=true` dla własnych | Live DB |
| Trigger `trg_notify_message` | AFTER INSERT na `messages` → fn `notify_on_message` (security definer) → INSERT do `user_notifications` z 10-min deduplikacją (jeśli unread message od tego samego sender'a w 10 min, UPDATE zamiast nowego) | Live DB |
| Trigger `trg_notify_review` | AFTER INSERT na `reviews` → fn `notify_on_review` → INSERT do `user_notifications` (`type='review'`) | Live DB |
| Trigger `push_notify` | AFTER INSERT na `messages` → POST do `/functions/v1/push-notify` (przez `supabase_functions.http_request`) | Live DB |
| Edge fn `push-notify` v21 | Native Web Push przez `crypto.subtle` + ECDSA P-256, VAPID; wymaga `service_role` JWT; przy 410/404 usuwa wygasłą subskrypcję | Deployed |
| Edge fn `chat-notify` v20 | Wysyła email (Resend) do `kontakt@mapjob.pl` gdy admin dostanie wiadomość | Deployed |
| Edge fn `beta-feedback-notify` v19 | Email Resend dla feedback beta | Deployed |
| Sekrety | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `RESEND_API_KEY`, `ADMIN_USER_ID` — skonfigurowane | Supabase secrets |
| Frontend [index.html L6943](index.html) | `loadDbNotifications()` woła RPC, czyta `n.type/title/body/icon/is_read/link_data` | In repo |
| [sw.js L98-114](sw.js) | `push` event handler renderuje OS notification | In repo |
| [index.html L7518](index.html) | upsert do `push_subscriptions` przy `requestPushPermission()` | In repo |

**Kolumny tabeli (ważne dla future producerów):**
- `type text NOT NULL` — `'message' | 'review' | 'payment_succeeded' | 'payment_refunded' | 'urgent_tender_active' | ...`
- `link_data jsonb` — dla nawigacji frontendu (`{conversation_id, sender_id}`, `{pin_id, review_id}`, `{product_key, months}`)
- `icon text DEFAULT '🔔'`
- RLS policy `user_own_notifs` FOR ALL using `auth.uid() = user_id` (frontend SELECT/UPDATE/DELETE własne; INSERT przez SECURITY DEFINER triggery i service_role).

### Co dodano 2026-04-27

[supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts) (v27 deployed) — `PRODUCT_LABELS` map + `notifyUser()` helper, który INSERT-uje do `user_notifications` (z `type/title/body/icon/link_data`):
- Po `activate_package` success → `type='payment_succeeded'`, "Pakiet aktywowany ✓"
- Po `activate_urgent_tender` success → `type='urgent_tender_active'`, "Pilne zlecenie aktywne ✓"
- W `handleRefund` po `deactivate_package` → `type='payment_refunded'`, "Zwrot zrealizowany"

Wszystko best-effort try/catch — nigdy nie aborts the parent flow. Płatności i aktywacja działają nawet gdyby insert do `user_notifications` rzucił.

### Weryfikacja E2E

```bash
# Stripe producer
stripe trigger checkout.session.completed
supabase functions logs stripe-webhook --tail
# SQL — sprawdź czy notification wpadła:
select * from public.user_notifications
 where type='payment_succeeded'
 order by created_at desc limit 1;

# Chat producer (działa od 2026-04-09)
# Wyślij wiadomość przez UI; SQL:
select * from public.user_notifications where type='message' order by created_at desc limit 1;
# OS push trafia automatycznie przez trigger push_notify → push-notify edge fn
```

### Co jeszcze NIE działa (świadomy out-of-scope)

- **OS push przy payment** — trigger `push_notify` istnieje TYLKO na `messages`. Stripe insert do `user_notifications` daje wpis w dzwoneczku ale nie rozsyła OS push. Można dodać generic trigger AFTER INSERT na `user_notifications` jeśli będzie potrzeba; user widzi notyfikację po następnym otwarciu app.
- **Email digest** dla nowych wiadomości do nie-admin userów — `chat-notify` wysyła tylko gdy adminowi piszą.

---

## 7. Resend SMTP w Supabase Auth (TODO — verify only, akcja u user)

**Po co:** auth maile (reset hasła, signup confirm, magic link, change-email) muszą iść przez własny SMTP zamiast shared `noreply@mail.app.supabase.io` (~2/h limit). Memory `project_password_reset_supabase_config_pending` z 2026-04-21 mówi że flow działał na shared SMTP — to wystarczyło na testy ale nie na launch.

**Skoro `RESEND_API_KEY` już jest w sekretach** (chat-notify go używa), do podpięcia Auth zostają tylko 2 kroki:

### Sprawdź czy nie jest już skonfigurowany

```bash
curl -X POST https://ahgzjneegvptudphibdm.supabase.co/auth/v1/recover \
  -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
  -d '{"email":"<twoj_test@gmail.com>"}'
```
Po przyjściu maila spójrz w Gmail "Show original" → linia `From:`:
- Jeśli `From: noreply@mail.app.supabase.io` → wciąż shared SMTP, **konfiguracja TODO**
- Jeśli `From: noreply@mapjob.pl` lub podobne → już Resend, **DONE**

### Jak skonfigurować (jeśli wciąż shared)

1. **Domena `mapjob.pl` w Resend** — DNS records (Resend dashboard pokaże dokładne wartości):
   - `MX send.mapjob.pl` → `feedback-smtp.eu-west-1.amazonses.com` priority 10
   - `TXT @` (SPF) — zmerge z istniejącym SPF jeśli jest: `v=spf1 include:amazonses.com ~all`
   - `TXT resend._domainkey` (DKIM) — wartość per-domain z Resend
   - `TXT _dmarc` → `v=DMARC1; p=none;` (start monitor mode)
2. **Konfiguracja Auth SMTP** — Native Integration w Supabase Dashboard:
   - https://supabase.com/dashboard/project/ahgzjneegvptudphibdm/auth/templates → SMTP Settings → "Set up Custom SMTP" → preset Resend → wklej `re_xxx` (ten sam co już używa chat-notify), sender email `noreply@mapjob.pl`, sender name `MapJob` → Save.
   - **Fallback** (jeśli native UI niedostępny): jeden `PATCH https://api.supabase.com/v1/projects/ahgzjneegvptudphibdm/config/auth` z PAT (memory `feedback_supabase_pat_workflow.md`) + body:
     ```json
     {"smtp_admin_email":"noreply@mapjob.pl","smtp_host":"smtp.resend.com","smtp_port":465,"smtp_user":"resend","smtp_pass":"re_xxx","smtp_sender_name":"MapJob","smtp_max_frequency":60}
     ```
3. Powtórz curl z punktu wyżej — `From:` powinno teraz pokazywać `noreply@mapjob.pl`. Resend Dashboard → Logs → `status=delivered`. Gmail "Show original" → `spf=pass dkim=pass dmarc=pass`.

---

## Pliki dodane w iteracji bazowej

- `supabase/functions/stripe-webhook/index.ts` — webhook Stripe
- `manifest.json` — PWA manifest
- `sw.js` — Service Worker
- `generate_icons.py` — generator ikon
- `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`
- `DEPLOY.md` — ten plik

## Zmiany 2026-04-27

- [supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts) v27 — `PRODUCT_LABELS` + `notifyUser()` insert do `user_notifications` po `activate_package`, `activate_urgent_tender`, `handleRefund`. Deployed via Supabase MCP.
