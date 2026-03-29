-- Video Plays Tracking Table
-- Logs each time a visitor clicks to play a video on the site
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS video_plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_id TEXT NOT NULL,
    video_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by youtube_id and time
CREATE INDEX IF NOT EXISTS idx_video_plays_youtube_id ON video_plays(youtube_id);
CREATE INDEX IF NOT EXISTS idx_video_plays_created_at ON video_plays(created_at DESC);

-- Enable RLS
ALTER TABLE video_plays ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (tracking from frontend)
CREATE POLICY "Anyone can insert video plays" ON video_plays FOR INSERT WITH CHECK (true);

-- Only authenticated/admin can read
CREATE POLICY "Video plays readable by authenticated" ON video_plays FOR SELECT USING (auth.role() = 'authenticated');
