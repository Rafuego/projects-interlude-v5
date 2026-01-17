-- =====================================================
-- INTERLUDE HANDOFF PLATFORM - SUPABASE SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- =====================================================

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'brand' CHECK (type IN ('brand', 'website', 'product', 'deck')),
  date TEXT,
  overview TEXT,
  figma_link TEXT,
  
  -- All the nested project data (logos, colors, etc.)
  data JSONB DEFAULT '{
    "research": {"documents": [], "notes": []},
    "logos": [],
    "colors": [],
    "typography": [],
    "webpages": [],
    "animations": [],
    "devNotes": [],
    "helpDocs": []
  }'::jsonb,
  
  -- Settings
  password TEXT,
  is_published BOOLEAN DEFAULT FALSE
);

-- 2. Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public access
-- Allow anyone to read published projects (for client view)
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT
  USING (is_published = true);

-- Allow anyone to read all projects (for admin - you'll want to add auth later)
CREATE POLICY "Allow all reads for now" ON projects
  FOR SELECT
  USING (true);

-- Allow anyone to insert (for admin - you'll want to add auth later)
CREATE POLICY "Allow all inserts for now" ON projects
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update (for admin - you'll want to add auth later)
CREATE POLICY "Allow all updates for now" ON projects
  FOR UPDATE
  USING (true);

-- Allow anyone to delete (for admin - you'll want to add auth later)
CREATE POLICY "Allow all deletes for now" ON projects
  FOR DELETE
  USING (true);

-- =====================================================
-- STORAGE SETUP
-- =====================================================
-- Go to Storage in your Supabase dashboard and:
-- 1. Create a new bucket called "project-files"
-- 2. Make it PUBLIC (toggle "Public bucket" on)
-- 3. Or run this SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy to allow public reads
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-files');

-- Storage policy to allow uploads (you'll want to add auth later)
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'project-files');

-- Storage policy to allow deletes
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'project-files');

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
