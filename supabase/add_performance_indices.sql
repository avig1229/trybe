-- Performance Indices for Trybe
-- Run this in your Supabase SQL Editor to improve query speeds

-- Projects: Faster lookups by user and tribe
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_tribe_id ON projects(tribe_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);

-- Channels: Faster lookups by project
CREATE INDEX IF NOT EXISTS idx_channels_project_id ON channels(project_id);
CREATE INDEX IF NOT EXISTS idx_channels_parent_id ON channels(parent_id);

-- Blocks: Faster loading of channel content
CREATE INDEX IF NOT EXISTS idx_blocks_channel_id ON blocks(channel_id);
CREATE INDEX IF NOT EXISTS idx_blocks_order_index ON blocks(order_index);

-- Posts: Faster feed loading
CREATE INDEX IF NOT EXISTS idx_posts_project_id ON posts(project_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Likes & Comments: Faster count retrieval
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Profiles: Faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
