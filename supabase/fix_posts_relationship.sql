-- Fix missing relationship between posts and profiles
-- This is required for the select query: user:profiles(*)

-- 1. Ensure user_id column exists and has correct type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Add or Update Foreign Key to profiles
-- We drop it first to be safe
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_user_id_fkey_profiles;

-- Note: Usually profiles.id is the same as auth.users.id
-- We explicitly reference profiles(id) to allow PostgREST to detect the relationship 'profiles'
ALTER TABLE posts
ADD CONSTRAINT posts_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- 3. Reload schema cache to make Supabase API aware of the new relationship
NOTIFY pgrst, 'reload config';
