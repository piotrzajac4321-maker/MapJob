-- MapJob: Notification configs — admin-editable list of in-app/OS-push notifications.
-- Replaces the hardcoded setTimeout block in index.html (beta_info_v1, ambasador_v1,
-- pakiet_wspierajacy_v1) with a DB-driven list that admin can edit via admin.html.
--
-- After apply, verify:
--   select key, enabled, frequency, target, os_push from public.notification_configs order by sort_order;

create table if not exists public.notification_configs (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  enabled      boolean not null default true,
  icon         text default '🔔',
  title        text not null,
  body         text not null default '',
  frequency    text not null default 'once'
                 check (frequency in ('once','session','daily','weekly','always')),
  delay_ms     integer not null default 2500
                 check (delay_ms between 0 and 600000),
  start_at     timestamptz,
  end_at       timestamptz,
  target       text not null default 'all'
                 check (target in ('all','logged_in','guest','pro','free')),
  os_push      boolean not null default false,
  sort_order   integer not null default 0,
  click_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists notification_configs_enabled_sort_idx
  on public.notification_configs (enabled, sort_order);

alter table public.notification_configs enable row level security;

-- SELECT: public (frontend loads configs without auth — guest users also need them).
drop policy if exists notif_cfg_select on public.notification_configs;
create policy notif_cfg_select on public.notification_configs
  for select using (true);

-- INSERT/UPDATE/DELETE: only admins (uses public.is_admin() defined in prior migrations).
drop policy if exists notif_cfg_insert on public.notification_configs;
create policy notif_cfg_insert on public.notification_configs
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists notif_cfg_update on public.notification_configs;
create policy notif_cfg_update on public.notification_configs
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists notif_cfg_delete on public.notification_configs;
create policy notif_cfg_delete on public.notification_configs
  for delete to authenticated
  using (public.is_admin());

-- Auto-bump updated_at on every edit.
create or replace function public.notification_configs_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists notification_configs_touch on public.notification_configs;
create trigger notification_configs_touch
  before update on public.notification_configs
  for each row
  execute function public.notification_configs_touch_updated_at();

-- Seed: 3 promo notifications currently hardcoded in index.html line ~6507.
-- Defaults: enabled=true, os_push=false (was the spam source), staggered delays.
insert into public.notification_configs
  (key, icon, title, body, frequency, delay_ms, target, os_push, sort_order)
values
  ('beta_info_v1',
   '🧪',
   'Aplikacja w fazie Beta — Twoja opinia ma znaczenie!',
   'Ciągle coś dodajemy, zmieniamy i ulepszamy. Zauważyłeś błąd lub masz pomysł co dodać / usunąć? Napisz do nas — wynagradzamy pomoc! kontakt@mapjob.pl',
   'once', 2500, 'all', false, 1),
  ('ambasador_v1',
   '🤝',
   'Zostań Ambasadorem MapJob!',
   'Nasi Ambasadorzy jeżdżą codziennie na spotkania promując aplikację. Praca w domu lub w terenie — Ty ustalasz warunki i godziny. Zainteresowany? kontakt@mapjob.pl',
   'once', 3500, 'all', false, 2),
  ('pakiet_wspierajacy_v1',
   '🚀',
   'Pakiet Wspierający — tylko 200 zł!',
   'Wspomóż rozwój MapJob i zyskaj: Plan Pro + Portfolio Pro + Giełda Zleceń na 3 miesiące. Wartość 597 zł — tylko 200 zł dla 500 pierwszych osób!',
   'once', 4500, 'all', false, 3)
on conflict (key) do nothing;
