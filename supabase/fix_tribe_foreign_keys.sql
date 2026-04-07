-- Quick Fix for Foreign Key Join Issues
-- Run this in your Supabase SQL Editor to link `tribes` properly to `profiles`

ALTER TABLE tribes DROP CONSTRAINT IF EXISTS tribes_creator_id_fkey;
ALTER TABLE tribes ADD CONSTRAINT tribes_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tribe_memberships DROP CONSTRAINT IF EXISTS tribe_memberships_user_id_fkey;
ALTER TABLE tribe_memberships ADD CONSTRAINT tribe_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
