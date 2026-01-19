-- Ensure there is a foreign key relationship between projects and profiles
-- This allows Supabase to perform joined queries like .select('*, profiles(*)')

-- First, check if the constraint already exists to avoid errors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'projects_user_id_profiles_fkey' 
        AND table_name = 'projects'
    ) THEN
        ALTER TABLE projects
        ADD CONSTRAINT projects_user_id_profiles_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

COMMENT ON CONSTRAINT projects_user_id_profiles_fkey ON projects IS 'Link projects to user profiles for joined queries';
