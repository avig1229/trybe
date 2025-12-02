-- FORCE FIX for Tribe Memberships Policies
-- The recursion error explicitly mentions "tribe_memberships".
-- This script will reset policies on 'tribe_memberships' to break the cycle.

-- 1. Drop ALL existing policies on tribe_memberships dynamically
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'tribe_memberships'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tribe_memberships', pol.policyname);
    END LOOP;
END $$;

-- 2. Create simplified policies for tribe_memberships

-- Allow users to view memberships (Public for now to be safe, or authenticated)
CREATE POLICY "Public view memberships"
ON tribe_memberships FOR SELECT
TO public
USING (true);

-- Allow users to join tribes (create their own membership)
CREATE POLICY "Users can join tribes"
ON tribe_memberships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to leave tribes (delete their own membership)
CREATE POLICY "Users can leave tribes"
ON tribe_memberships FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own membership (e.g. roles if allowed, but usually restricted)
-- Keeping it simple: users can update their own record
CREATE POLICY "Users can update own membership"
ON tribe_memberships FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
