-- VIEW publicznego widoku profili.
-- Tabela `profiles` ma RLS policy `user_own` (auth.uid() = id), która blokuje
-- odczyt cudzych profili. To powodowało, że frontend nie mógł załadować
-- nazwy/avatara/planu rozmówców i wyświetlał komunikat "Brak profilu".
--
-- VIEW bez RLS daje publiczny odczyt TYLKO bezpiecznych pól.
-- Pola wrażliwe (email, phone, stripe_customer_id, cv_url, otp_*)
-- pozostają chronione przez RLS na głównej tabeli.

CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, name, avatar_url, plan, portfolio_pro, phone_verified
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

COMMENT ON VIEW public.profiles_public IS
'Publiczny widok pól profilu (id, name, avatar_url, plan, portfolio_pro, phone_verified). '
'Bypassuje RLS na profiles żeby aplikacja mogła ładować cudze profile w mapie/czacie/modalach. '
'Email, phone, stripe_customer_id, cv_url, otp_* zostają chronione w głównej tabeli.';
