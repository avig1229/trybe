-- FORCE FIX for Projects Policies
-- 1. Drop ALL existing policies on projects dynamically
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', pol.policyname);
    END LOOP;
END $$;

-- 2. Create simplified policies
-- Allow public read access to public projects
CREATE POLICY "Public view projects"
ON projects FOR SELECT TO public
USING (is_public = true);

-- Allow authenticated users to view their own projects (even if private)
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to create projects
CREATE POLICY "Users can create projects"
ON projects FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE TO authenticated
USING (auth.uid() = user_id);
