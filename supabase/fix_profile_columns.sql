-- Add missing columns to profiles table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creative_philosophy text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for_collaboration boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills text[];

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
