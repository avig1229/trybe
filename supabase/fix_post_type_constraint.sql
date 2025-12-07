-- Add 'daily_update' to the allowed values for the 'type' column in the 'posts' table

-- First, drop the existing constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check;

-- Then, add the new constraint with 'daily_update' included
ALTER TABLE posts ADD CONSTRAINT posts_type_check 
  CHECK (type IN ('progress', 'question', 'showcase', 'collaboration_request', 'daily_update'));

-- Verify the change
SELECT 
    conname as constraint_name, 
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE conname = 'posts_type_check';
