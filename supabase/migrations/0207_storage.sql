-- 1. Create the 'quarantine' bucket if it doesn't exist
INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'quarantine',
        'quarantine',
        false
    ) ON CONFLICT (id) DO NOTHING;

-- 2. Create the 'project' bucket if it doesn't exist
INSERT INTO
    storage.buckets (id, name, public)
VALUES ('project', 'project', false) ON CONFLICT (id) DO NOTHING;

-- 3. [REMOVED] Enable RLS on storage.objects
-- RLS is already enabled by default on storage.objects.
-- Attempting to run ALTER TABLE here causes ownership errors (SQLSTATE 42501).

-- 4. Policy: Allow Authenticated Users to Upload to Quarantine
CREATE POLICY "Authenticated users can upload to quarantine" ON storage.objects FOR
INSERT
    TO authenticated
WITH
    CHECK (bucket_id = 'quarantine');

-- 5. Policy: Allow Users to Read/Download their own files in Quarantine
CREATE POLICY "Users can read their own quarantine files" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'quarantine'
        AND auth.uid () = owner
    );

-- 6. Policy: Authenticated users can view project files
CREATE POLICY "Authenticated users can view project files" ON storage.objects FOR
SELECT TO authenticated USING (bucket_id = 'project');