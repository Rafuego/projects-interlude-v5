-- Interlude Handoff Platform - Supabase Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  type TEXT DEFAULT 'brand' CHECK (type IN ('brand', 'website', 'product', 'deck')),
  date TEXT,
  overview TEXT DEFAULT '',
  figma_link TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  password TEXT,
  is_published BOOLEAN DEFAULT false,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- 3. Create an index on is_published for filtering
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public access (adjust as needed for your security requirements)
-- This allows anyone to read published projects
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT
  USING (is_published = true);

-- This allows anyone to create/update/delete projects (for admin)
-- In production, you'd want to add authentication here
CREATE POLICY "Allow all operations for now" ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create storage bucket for project files
-- Note: This needs to be done in the Supabase Dashboard under Storage
-- Create a bucket called "project-files" and make it public

-- After creating the bucket in the Dashboard, run this to set up policies:
-- (Uncomment and run after creating the bucket)

-- CREATE POLICY "Public can view files" ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'project-files');

-- CREATE POLICY "Anyone can upload files" ON storage.objects
--   FOR INSERT
--   WITH CHECK (bucket_id = 'project-files');

-- CREATE POLICY "Anyone can delete files" ON storage.objects
--   FOR DELETE
--   USING (bucket_id = 'project-files');
