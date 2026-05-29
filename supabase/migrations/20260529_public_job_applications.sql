-- Allow anonymous (public, no-login) job applications
CREATE POLICY "public_applications_insert"
ON public.job_applications
FOR INSERT
TO anon
WITH CHECK (applicant_id IS NULL);

-- Create public-cvs storage bucket for anonymous CV uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('public-cvs', 'public-cvs', true, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload CV files
CREATE POLICY "anon_cv_upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'public-cvs');

-- Allow public read of CV files (needed since bucket is public)
CREATE POLICY "public_cv_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-cvs');
