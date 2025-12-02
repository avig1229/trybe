-- Supabase Storage Setup for Trybe
-- Run this in your Supabase SQL Editor
-- Note: Run this script in your Supabase SQL Editor to set up storage buckets and RLS policies

-- Create storage buckets
-- Note: If buckets already exist, you may need to delete them first or handle conflicts
-- Buckets are created via Supabase Dashboard or API, but we provide the configuration here

-- Avatars bucket (5MB limit for images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Project media bucket (100MB limit - configured in Supabase Dashboard)
-- Used for videos, documents, and images related to projects
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

-- Tribe media bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tribe-media', 'tribe-media', true)
ON CONFLICT (id) DO NOTHING;

-- Post media bucket (100MB limit - configured in Supabase Dashboard)
-- Used for videos and media in Collective Pulse posts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage buckets
-- Note: If policies already exist, you may need to drop them first:
-- DROP POLICY IF EXISTS "policy_name" ON storage.objects;

-- Avatars bucket policies
-- Path structure: {userId}/{filename}
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Project media bucket policies
-- Path structure: {fileType}s/{userId}/{projectId}/{filename}
DROP POLICY IF EXISTS "Project media is publicly accessible" ON storage.objects;
CREATE POLICY "Project media is publicly accessible" ON storage.objects 
  FOR SELECT USING (bucket_id = 'project-media');

DROP POLICY IF EXISTS "Users can upload project media" ON storage.objects;
CREATE POLICY "Users can upload project media" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'project-media' AND 
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

DROP POLICY IF EXISTS "Users can update their own project media" ON storage.objects;
CREATE POLICY "Users can update their own project media" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'project-media' AND 
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

DROP POLICY IF EXISTS "Users can delete their own project media" ON storage.objects;
CREATE POLICY "Users can delete their own project media" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'project-media' AND 
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Tribe media bucket policies
DROP POLICY IF EXISTS "Tribe media is publicly accessible" ON storage.objects;
CREATE POLICY "Tribe media is publicly accessible" ON storage.objects 
  FOR SELECT USING (bucket_id = 'tribe-media');

DROP POLICY IF EXISTS "Tribe creators can upload tribe media" ON storage.objects;
CREATE POLICY "Tribe creators can upload tribe media" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'tribe-media' AND 
    auth.uid()::text IN (
      SELECT creator_id::text FROM tribes WHERE id::text = (string_to_array(name, '/'))[1]
    )
  );

DROP POLICY IF EXISTS "Tribe creators can update tribe media" ON storage.objects;
CREATE POLICY "Tribe creators can update tribe media" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'tribe-media' AND 
    auth.uid()::text IN (
      SELECT creator_id::text FROM tribes WHERE id::text = (string_to_array(name, '/'))[1]
    )
  );

DROP POLICY IF EXISTS "Tribe creators can delete tribe media" ON storage.objects;
CREATE POLICY "Tribe creators can delete tribe media" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'tribe-media' AND 
    auth.uid()::text IN (
      SELECT creator_id::text FROM tribes WHERE id::text = (string_to_array(name, '/'))[1]
    )
  );

-- Post media bucket policies
-- Path structure: posts/{userId}/{postId}/{filename}
DROP POLICY IF EXISTS "Post media is publicly accessible" ON storage.objects;
CREATE POLICY "Post media is publicly accessible" ON storage.objects 
  FOR SELECT USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "Users can upload post media" ON storage.objects;
CREATE POLICY "Users can upload post media" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'post-media' AND 
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

DROP POLICY IF EXISTS "Users can update their own post media" ON storage.objects;
CREATE POLICY "Users can update their own post media" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'post-media' AND 
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;
CREATE POLICY "Users can delete their own post media" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'post-media' AND 
    auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Helper function to generate file paths
-- Format: {fileType}s/{userId}/{projectId?}/{timestamp}_{filename}
CREATE OR REPLACE FUNCTION generate_file_path(
  bucket_name TEXT, 
  user_id UUID, 
  filename TEXT,
  file_type TEXT DEFAULT 'files',
  project_id UUID DEFAULT NULL,
  post_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  timestamp_str TEXT;
  sanitized_filename TEXT;
BEGIN
  timestamp_str := extract(epoch from now())::text;
  sanitized_filename := regexp_replace(filename, '[^a-zA-Z0-9.-]', '_', 'g');
  
  IF project_id IS NOT NULL THEN
    RETURN file_type || 's/' || user_id::text || '/' || project_id::text || '/' || timestamp_str || '_' || sanitized_filename;
  ELSIF post_id IS NOT NULL THEN
    RETURN 'posts/' || user_id::text || '/' || post_id::text || '/' || timestamp_str || '_' || sanitized_filename;
  ELSE
    RETURN file_type || 's/' || user_id::text || '/' || timestamp_str || '_' || sanitized_filename;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get file URL
-- Note: This function uses the public URL format for Supabase Storage
-- The actual URL will be generated by the Supabase client SDK
CREATE OR REPLACE FUNCTION get_file_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - actual URL generation is done client-side via Supabase SDK
  -- Format: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
  RETURN '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate video duration (helper for future server-side validation)
-- Note: This requires video processing capabilities which are typically done client-side
-- This is a placeholder for future server-side validation if needed
CREATE OR REPLACE FUNCTION validate_video_duration(file_path TEXT, max_duration_seconds INTEGER DEFAULT 30)
RETURNS BOOLEAN AS $$
BEGIN
  -- This would require video processing libraries
  -- For now, validation is done client-side
  -- This function is a placeholder for future implementation
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

