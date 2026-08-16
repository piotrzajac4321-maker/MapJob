-- =====================================================================
--  BoboFoto — KONFIGURACJA PANELU ADMINA + STATYSTYKI
--  Wklej CAŁOŚĆ w Supabase → SQL Editor → Run  (jednorazowo).
--  Projekt: juqlhorodqvczoqkvkim
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABELA ZAMÓWIEŃ — uzupełnienie kolumn (jeśli brakuje)
--    (tabela 'zamowienia' już istnieje — formularz do niej pisze)
-- ---------------------------------------------------------------------
alter table public.zamowienia
  add column if not exists created_at timestamptz not null default now();

alter table public.zamowienia
  add column if not exists status text not null default 'nowe';
  -- dozwolone: 'nowe' | 'w_toku' | 'gotowe'

-- ---------------------------------------------------------------------
-- 2) TABELA STATYSTYK (zdarzenia ruchu i klików)
-- ---------------------------------------------------------------------
create table if not exists public.zdarzenia (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  typ         text not null,             -- 'view' | 'click' | 'order'
  nazwa       text,                      -- etykieta, np. 'kafelek_zamow'
  sciezka     text,                      -- ścieżka strony (location.pathname)
  referrer    text,                      -- źródło wejścia (host)
  urzadzenie  text,                      -- 'mobile' | 'desktop'
  sesja       text,                      -- anonimowy id sesji (bez danych osobowych)
  meta        jsonb
);
create index if not exists zdarzenia_created_idx on public.zdarzenia (created_at desc);
create index if not exists zdarzenia_typ_idx     on public.zdarzenia (typ);

-- ---------------------------------------------------------------------
-- 3) RLS — bezpieczeństwo
--    Zasada: ktokolwiek (anon) może ZAPISAĆ (formularz, tracking),
--            ale ODCZYTAĆ dane może TYLKO zalogowany admin.
-- ---------------------------------------------------------------------

-- ZAMÓWIENIA
alter table public.zamowienia enable row level security;

drop policy if exists "anon_insert_zamowienia" on public.zamowienia;
create policy "anon_insert_zamowienia" on public.zamowienia
  for insert to anon, authenticated with check (true);

drop policy if exists "admin_select_zamowienia" on public.zamowienia;
create policy "admin_select_zamowienia" on public.zamowienia
  for select to authenticated using (true);

drop policy if exists "admin_update_zamowienia" on public.zamowienia;
create policy "admin_update_zamowienia" on public.zamowienia
  for update to authenticated using (true) with check (true);

-- ZDARZENIA (statystyki)
alter table public.zdarzenia enable row level security;

drop policy if exists "anon_insert_zdarzenia" on public.zdarzenia;
create policy "anon_insert_zdarzenia" on public.zdarzenia
  for insert to anon, authenticated with check (true);

drop policy if exists "admin_select_zdarzenia" on public.zdarzenia;
create policy "admin_select_zdarzenia" on public.zdarzenia
  for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- 4) STORAGE — zdjęcia klientów (bucket 'zdjecia-klientow')
--    Upload: anon (formularz). Odczyt/pobieranie: tylko admin.
--    Bucket trzymaj jako PRYWATNY (Storage → bucket → Private).
-- ---------------------------------------------------------------------
drop policy if exists "anon_upload_zdjecia" on storage.objects;
create policy "anon_upload_zdjecia" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'zdjecia-klientow');

drop policy if exists "admin_read_zdjecia" on storage.objects;
create policy "admin_read_zdjecia" on storage.objects
  for select to authenticated
  using (bucket_id = 'zdjecia-klientow');

-- ---------------------------------------------------------------------
-- 5) KONTO ADMINA
--    NIE da się założyć przez SQL. Zrób to w panelu Supabase:
--    Authentication → Users → "Add user" →
--       e-mail: (Twój)   hasło: (mocne)   "Auto Confirm User": TAK
--    Tym e-mailem/hasłem logujesz się do panelu na /panel.
-- ---------------------------------------------------------------------

-- GOTOWE. Po uruchomieniu: wejdź na https://bobofoto.pl/panel i zaloguj się.
