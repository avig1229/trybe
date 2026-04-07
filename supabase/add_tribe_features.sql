-- Migration: Add Tribe Feature Columns
-- Run this in your Supabase SQL Editor

-- 1. Add status workflow to tribes
ALTER TABLE tribes
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('pending', 'active', 'rejected'))
    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1';

-- 2. Add is_admin to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 3. Update discovery RLS: only show active, public tribes to non-admins
DROP POLICY IF EXISTS "Public tribes are viewable by everyone" ON tribes;
DROP POLICY IF EXISTS "Tribe members can view private tribes" ON tribes;

-- Anyone can see active + public tribes
CREATE POLICY "Active public tribes viewable by everyone" ON tribes
  FOR SELECT USING (is_public = true AND status = 'active');

-- Members can see their own tribes regardless of status (so they see pending/rejected)
CREATE POLICY "Members can view their tribes" ON tribes
  FOR SELECT USING (
    id IN (SELECT tribe_id FROM tribe_memberships WHERE user_id = auth.uid())
  );

-- Admins can see all tribes
CREATE POLICY "Admins can view all tribes" ON tribes
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- Admins can update any tribe (for approve/reject)
CREATE POLICY "Admins can update any tribe" ON tribes
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- 4. Function to compute tribe unlock status for a user
CREATE OR REPLACE FUNCTION get_tribe_unlock_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  streak_count INT := 0;
  media_count  INT := 0;
BEGIN
  -- Count consecutive daily commit streak using a lateral subquery approach
  SELECT COUNT(*)
  INTO streak_count
  FROM (
    SELECT
      post_day,
      LAG(post_day) OVER (ORDER BY post_day DESC) AS prev_day,
      ROW_NUMBER() OVER (ORDER BY post_day DESC) AS rn
    FROM (
      SELECT DISTINCT date_trunc('day', created_at AT TIME ZONE 'Asia/Taipei') AS post_day
      FROM posts
      WHERE user_id = p_user_id
        AND type = 'daily_update'
    ) days
  ) ranked
  WHERE rn = 1
     OR (prev_day - post_day) = INTERVAL '1 day';

  -- Count non-LoCommit media blocks (images + videos in Project Valley)
  SELECT COUNT(*)
  INTO media_count
  FROM blocks b
  JOIN channels c ON b.channel_id = c.id
  JOIN projects p ON c.project_id = p.id
  WHERE p.user_id = p_user_id
    AND b.type IN ('image', 'video');

  RETURN jsonb_build_object(
    'streak_count', streak_count,
    'media_count',  media_count,
    'streak_required', 7,
    'media_required',  10,
    'is_unlocked', (streak_count >= 7 AND media_count >= 10)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── HOW TO SET YOURSELF AS ADMIN ────────────────────────────────────────────
-- After this migration succeeds, run the query below in a SEPARATE SQL Editor
-- tab, replacing YOUR_EMAIL with your Google sign-in email address:
--
--   UPDATE profiles
--   SET is_admin = true
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');
-- ─────────────────────────────────────────────────────────────────────────────
