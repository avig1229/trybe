-- FORCE FIX for Storage Policies
-- This script will delete ALL existing policies on the storage.objects table
-- and replace them with simple, working policies.

-- 1. Drop ALL existing policies on storage.objects dynamically
-- This handles any policy name, ensuring a clean slate.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 2. Create simplified policies
-- Uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-files' );

-- Views (Public)
CREATE POLICY "Public view"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'project-files' );

-- Updates (Owner only)
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'project-files' AND auth.uid() = owner );

-- Deletes (Owner only)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'project-files' AND auth.uid() = owner );
