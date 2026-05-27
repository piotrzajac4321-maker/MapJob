-- Track admin grants of extra pins / highlights (separate from package_pro/package_portfolio).
-- Used by admin.html "Pakiety Premium" → "Przyznaj piny / wyróżnienia" form.
ALTER TABLE public.admin_grants
  ADD COLUMN IF NOT EXISTS pins_granted       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highlights_granted integer NOT NULL DEFAULT 0;
