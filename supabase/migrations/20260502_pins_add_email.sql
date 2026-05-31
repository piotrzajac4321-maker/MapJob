-- Adds optional email column to pins so the pin edit form can persist the contact email.
-- Visibility is gated client-side by the existing show_email boolean (admin override bypasses).
ALTER TABLE public.pins ADD COLUMN IF NOT EXISTS email text;
