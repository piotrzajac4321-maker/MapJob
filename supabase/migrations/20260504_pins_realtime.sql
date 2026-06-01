-- Włączenie Supabase Realtime dla tabeli pins,
-- żeby nowe / zmienione / usunięte piny propagowały się
-- do otwartych przeglądarek bez F5.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pins;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN NULL;
END $$;

ALTER TABLE public.pins REPLICA IDENTITY DEFAULT;
