-- Migration: Add parent_id to channels for nested layers
ALTER TABLE channels ADD COLUMN parent_id UUID REFERENCES channels(id) ON DELETE CASCADE;

-- Update RLS policies to handle nested viewing (optional, but good for completeness)
-- Usually the existing project-based policies are enough since parent/child share project_id
