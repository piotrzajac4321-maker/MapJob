-- =============================================================================
-- Seed dev — demo organization "MapJob Lab" + przykładowe dane
-- Uruchamiane automatycznie przez `supabase db reset`.
-- =============================================================================

-- Demo user: stworzymy go ręcznie przez Supabase Studio (Auth → Add user)
-- lub przez sign-up flow. Tu zostawiamy placeholder — seed nie tworzy auth.users
-- bezpośrednio, bo wymaga klucza service_role.

-- Demo org (dostępna po pierwszym signup — trigger handle_new_organization
-- automatycznie ustawi membership). Tutaj nic nie wstawiamy.

-- TODO: po pierwszym signup w dev, można uruchomić:
--   insert into public.organizations (name, slug) values ('MapJob Lab', 'mapjob-lab');
-- a trigger zrobi owner-a z pierwszego usera.
