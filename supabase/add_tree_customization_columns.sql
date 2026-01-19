-- Add missing tree customization columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_tree_color TEXT DEFAULT '#33ff33';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_tree_config JSONB DEFAULT '{"palette": "green-phosphor", "trunkStyle": "solid", "branchAngle": 0, "foliage": "orb", "growthDirection": "up"}'::jsonb;

-- Comment describing the changes
COMMENT ON COLUMN profiles.default_tree_color IS 'Default color for the user''s project trees in the forest';
COMMENT ON COLUMN profiles.default_tree_config IS 'Default visual configuration for the user''s project trees';
