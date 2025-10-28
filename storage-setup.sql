-- Supabase Storage Setup for Trybe
-- Run this in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('project-media', 'project-media', true),
('tribe-media', 'tribe-media', true),
('post-media', 'post-media', true);

-- Set up RLS policies for storage buckets

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Project media bucket policies
CREATE POLICY "Project media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'project-media');
CREATE POLICY "Users can upload project media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own project media" ON storage.objects FOR UPDATE USING (bucket_id = 'project-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own project media" ON storage.objects FOR DELETE USING (bucket_id = 'project-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Tribe media bucket policies
CREATE POLICY "Tribe media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'tribe-media');
CREATE POLICY "Tribe creators can upload tribe media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'tribe-media' AND 
  auth.uid()::text IN (
    SELECT creator_id::text FROM tribes WHERE id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "Tribe creators can update tribe media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'tribe-media' AND 
  auth.uid()::text IN (
    SELECT creator_id::text FROM tribes WHERE id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "Tribe creators can delete tribe media" ON storage.objects FOR DELETE USING (
  bucket_id = 'tribe-media' AND 
  auth.uid()::text IN (
    SELECT creator_id::text FROM tribes WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Post media bucket policies
CREATE POLICY "Post media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');
CREATE POLICY "Users can upload post media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own post media" ON storage.objects FOR UPDATE USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own post media" ON storage.objects FOR DELETE USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Helper function to generate file paths
CREATE OR REPLACE FUNCTION generate_file_path(bucket_name TEXT, user_id UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN user_id::text || '/' || extract(epoch from now())::text || '_' || filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get file URL
CREATE OR REPLACE FUNCTION get_file_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://your-project-ref.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

