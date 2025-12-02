-- Fix for "infinite recursion" error in storage policies
-- This error happens when a storage policy queries a table (like tribe_memberships)
-- which in turn might have policies that query other tables, creating a loop.

-- 1. Drop existing policies on storage.objects to start fresh
DROP POLICY IF EXISTS "Anyone can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public view" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 2. Create a simplified policy for uploads
-- This avoids joining other tables for now to break the recursion
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files'
);

-- 3. Create a simplified policy for viewing
CREATE POLICY "Public view"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'project-files'
);

-- 4. Allow updates/deletes for owners
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (auth.uid() = owner)
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (auth.uid() = owner)
);
