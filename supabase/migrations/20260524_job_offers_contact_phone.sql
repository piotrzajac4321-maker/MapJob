-- Allow employers to publish a contact phone on a job offer so candidates can
-- call directly without applying via CV.
ALTER TABLE public.job_offers ADD COLUMN IF NOT EXISTS contact_phone text;
