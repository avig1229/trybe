-- Trybe Enhanced Database Schema
-- Comprehensive schema supporting Project Valley, Collective Pulse, and Tribes
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users/Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  skills TEXT[], -- Array of skills/interests
  creative_philosophy TEXT,
  looking_for_collaboration BOOLEAN DEFAULT false,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tribes (specialized micro-communities)
CREATE TABLE tribes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  icon_url TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  tags TEXT[], -- Array of tags for categorization
  rules TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tribe memberships
CREATE TABLE tribe_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tribe_id, user_id)
);

-- Projects table (enhanced for Project Valley)
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-neutral-900',
  status TEXT CHECK (status IN ('active', 'planning', 'completed', 'paused')) DEFAULT 'planning',
  is_public BOOLEAN DEFAULT false,
  tags TEXT[], -- Array of project tags
  cover_image_url TEXT,
  tribe_id UUID REFERENCES tribes(id) ON DELETE SET NULL, -- Optional tribe association
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels (for organizing Blocks within projects)
CREATE TABLE channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-neutral-700',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocks table (resources/content blocks)
CREATE TABLE blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'link', 'text', 'video', 'audio', 'file')) NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  description TEXT,
  metadata JSONB, -- Flexible metadata storage
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collective Pulse Posts (enhanced for community sharing)
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tribe_id UUID REFERENCES tribes(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('progress', 'question', 'showcase', 'collaboration_request')) DEFAULT 'progress',
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced likes system
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'love', 'support', 'inspire')) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Comments system (enhanced)
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration requests
CREATE TABLE collaboration_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  skills_needed TEXT[],
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications system
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'comment', 'collaboration_request', 'tribe_invite', 'project_update')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional notification data
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow system for creators
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Project bookmarks/saves
CREATE TABLE project_saves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_saves ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tribe policies
CREATE POLICY "Public tribes are viewable by everyone" ON tribes FOR SELECT USING (is_public = true);
CREATE POLICY "Tribe members can view private tribes" ON tribes FOR SELECT USING (
  is_public = true OR 
  id IN (SELECT tribe_id FROM tribe_memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create tribes" ON tribes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Tribe creators can update their tribes" ON tribes FOR UPDATE USING (auth.uid() = creator_id);

-- Tribe membership policies
CREATE POLICY "Tribe memberships are viewable by members" ON tribe_memberships FOR SELECT USING (
  user_id = auth.uid() OR 
  tribe_id IN (SELECT tribe_id FROM tribe_memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Users can join tribes" ON tribe_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave tribes" ON tribe_memberships FOR DELETE USING (auth.uid() = user_id);

-- Project policies
CREATE POLICY "Public projects are viewable by everyone" ON projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Channel policies
CREATE POLICY "Channels are viewable with their projects" ON channels FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE is_public = true OR user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage channels for their projects" ON channels FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Block policies
CREATE POLICY "Blocks are viewable with their channels" ON blocks FOR SELECT USING (
  channel_id IN (
    SELECT c.id FROM channels c
    JOIN projects p ON c.project_id = p.id
    WHERE p.is_public = true OR p.user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage blocks for their projects" ON blocks FOR ALL USING (
  channel_id IN (
    SELECT c.id FROM channels c
    JOIN projects p ON c.project_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Post policies
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Like policies
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Comment policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Collaboration request policies
CREATE POLICY "Collaboration requests are viewable by project owners and requesters" ON collaboration_requests FOR SELECT USING (
  auth.uid() = requester_id OR 
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create collaboration requests" ON collaboration_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Project owners can update collaboration requests" ON collaboration_requests FOR UPDATE USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- Project save policies
CREATE POLICY "Project saves are viewable by everyone" ON project_saves FOR SELECT USING (true);
CREATE POLICY "Users can manage own project saves" ON project_saves FOR ALL USING (auth.uid() = user_id);

-- Functions for counts and statistics
CREATE OR REPLACE FUNCTION get_tribe_member_count(tribe_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM tribe_memberships WHERE tribe_id = tribe_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_block_count(project_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM blocks b
    JOIN channels c ON b.channel_id = c.id
    WHERE c.project_id = project_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_post_like_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM likes WHERE post_id = post_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_post_comment_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM comments WHERE post_id = post_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tribes_updated_at BEFORE UPDATE ON tribes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaboration_requests_updated_at BEFORE UPDATE ON collaboration_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for updating counts
CREATE OR REPLACE FUNCTION update_tribe_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tribes SET member_count = member_count + 1 WHERE id = NEW.tribe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tribes SET member_count = member_count - 1 WHERE id = OLD.tribe_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tribe_member_count_trigger
  AFTER INSERT OR DELETE ON tribe_memberships
  FOR EACH ROW EXECUTE FUNCTION update_tribe_member_count();

-- Search function for projects and tribes
CREATE OR REPLACE FUNCTION search_projects(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.user_id,
    p.created_at,
    ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_term)) as rank
  FROM projects p
  WHERE p.is_public = true
    AND (
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_term)
      OR p.tags && string_to_array(lower(search_term), ' ')
    )
  ORDER BY rank DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_tribes(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  slug TEXT,
  member_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.slug,
    t.member_count,
    t.created_at,
    ts_rank(to_tsvector('english', t.name || ' ' || t.description), plainto_tsquery('english', search_term)) as rank
  FROM tribes t
  WHERE t.is_public = true
    AND (
      to_tsvector('english', t.name || ' ' || t.description) @@ plainto_tsquery('english', search_term)
      OR t.tags && string_to_array(lower(search_term), ' ')
    )
  ORDER BY rank DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

