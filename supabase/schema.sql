-- Supabase Schema for Shadow The Great Digital Flagship
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- TRACKS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT,
  audio_url TEXT,
  soundcloud_url TEXT,
  album TEXT,
  price DECIMAL(10,2),
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- VIDEOS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_id TEXT,
  video_url TEXT,
  description TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PAGE VIEWS (Analytics)
-- =====================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  country TEXT,
  country_code TEXT,
  city TEXT,
  region TEXT,
  ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page);

-- =====================
-- USER PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  city TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- FORUM TOPICS
-- =====================
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- FORUM REPLIES
-- =====================
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- STOOP MESSAGES (Chat)
-- =====================
-- Already exists, but ensure proper structure
CREATE TABLE IF NOT EXISTS stoop_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  is_artist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

-- Enable RLS on all tables
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoop_messages ENABLE ROW LEVEL SECURITY;

-- Tracks: Public read, admin write
CREATE POLICY "Tracks are viewable by everyone" ON tracks FOR SELECT USING (true);

-- Videos: Public read, admin write
CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);

-- Page views: Insert only from API, select for analytics
CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Page views readable by authenticated" ON page_views FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Forum topics: Public read, authenticated write
CREATE POLICY "Forum topics are viewable by everyone" ON forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON forum_topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update own topics" ON forum_topics FOR UPDATE USING (auth.uid() = author_id);

-- Forum replies: Public read, authenticated write
CREATE POLICY "Forum replies are viewable by everyone" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Stoop messages: Public read, authenticated write
CREATE POLICY "Stoop messages are viewable by everyone" ON stoop_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON stoop_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- STORAGE BUCKETS
-- =====================
-- Run these separately in Supabase Storage settings or via SQL:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- =====================
-- FUNCTIONS
-- =====================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment track plays
CREATE OR REPLACE FUNCTION increment_track_plays(track_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tracks SET plays = plays + 1 WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views = views + 1 WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;
