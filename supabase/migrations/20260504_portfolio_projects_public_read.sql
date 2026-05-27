-- Portfolio realizacji jest z natury publiczne — fachowiec dodaje je,
-- żeby pokazać klientom co potrafi. Bez tego policy zalogowany użytkownik
-- widział wyłącznie WŁASNE realizacje, a anon nie widział nic.
--
-- Skutek przed fixem: w modalu "Profil fachowca" Promise.all sypał się
-- na permission denied (anon) lub zwracał pustą listę (authenticated
-- patrzący na cudzy profil), co w niektórych ścieżkach zostawiało
-- spinner "Ładowanie profilu..." na zawsze.

DO $$
BEGIN
  CREATE POLICY portfolio_projects_public_read
    ON public.portfolio_projects
    FOR SELECT
    TO anon, authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON public.portfolio_projects TO anon;
