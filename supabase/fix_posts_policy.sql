-- FORCE FIX for Posts Table Policies
-- The "infinite recursion" error is now happening on the 'posts' table.
-- This script will delete ALL existing policies on 'posts' and replace them with simple ones.

-- 1. Drop ALL existing policies on posts dynamically
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'posts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', pol.policyname);
    END LOOP;
END $$;

-- 2. Create simplified policies for posts

-- Allow authenticated users to create posts
-- We check that the user is assigning the post to themselves
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view posts
-- (You can restrict this later, but let's get it working first)
CREATE POLICY "Public view posts"
ON posts FOR SELECT
TO public
USING (true);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
