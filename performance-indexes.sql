-- Performance Optimization Indexes for Trybe
-- Run this in your Supabase SQL Editor to improve query performance

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Channels table indexes
CREATE INDEX IF NOT EXISTS idx_channels_project_id ON channels(project_id);

-- Blocks table indexes
CREATE INDEX IF NOT EXISTS idx_blocks_channel_id ON blocks(channel_id);
CREATE INDEX IF NOT EXISTS idx_blocks_order_index ON blocks(order_index);

-- Posts table indexes (for future Collective Pulse)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_project_id ON posts(project_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);

-- Likes table indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON likes(user_id, post_id);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Tribes table indexes
CREATE INDEX IF NOT EXISTS idx_tribes_creator_id ON tribes(creator_id);
CREATE INDEX IF NOT EXISTS idx_tribes_is_public ON tribes(is_public);

-- Tribe memberships indexes
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_user_id ON tribe_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_tribe_id ON tribe_memberships(tribe_id);

-- Full-text search indexes (requires pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON projects USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_description_trgm ON projects USING gin(description gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_user_public ON projects(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);

-- These indexes will significantly speed up:
-- 1. Fetching user's projects
-- 2. Searching public projects
-- 3. Filtering by status
-- 4. Loading channels for a project
-- 5. Future Collective Pulse queries

