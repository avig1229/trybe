-- Add join_status to tribe_memberships for approval flow
-- join_status: 'pending' (awaiting mod/admin approval) | 'approved' | 'rejected'
ALTER TABLE tribe_memberships
  ADD COLUMN IF NOT EXISTS join_status TEXT NOT NULL DEFAULT 'approved'
  CHECK (join_status IN ('pending', 'approved', 'rejected'));

-- Existing rows are all considered approved
UPDATE tribe_memberships SET join_status = 'approved' WHERE join_status IS NULL;

-- Index for fast pending lookups by tribe
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_join_status
  ON tribe_memberships (tribe_id, join_status);

-- RLS: members can insert their own pending/approved requests
-- (existing insert policy already covers this — join_status defaults correctly)

-- RLS: allow mods/admins to update join_status
-- Drop + recreate to ensure it covers join_status updates
DROP POLICY IF EXISTS "Admins and mods can update memberships" ON tribe_memberships;
CREATE POLICY "Admins and mods can update memberships"
  ON tribe_memberships FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tribe_memberships
      WHERE tribe_id = tribe_memberships.tribe_id
        AND role IN ('admin', 'moderator')
        AND join_status = 'approved'
    )
  );
