-- ============================================================================
-- Supabase Schema for PromptHub
-- ============================================================================
-- This SQL script creates the prompts table with full-text search support.
-- Execute this in your Supabase SQL Editor to set up the database schema.
-- ============================================================================

-- Drop existing table if you need to recreate (CAUTION: This will delete all data)
-- DROP TABLE IF EXISTS prompts;

-- Create the prompts table
CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GIN index for full-text search on content column
-- This enables fast searching through prompt content using PostgreSQL's full-text search
CREATE INDEX prompts_content_fts ON prompts USING GIN (to_tsvector('english', content));

-- Create additional indexes for common queries
CREATE INDEX prompts_category_idx ON prompts (category);
CREATE INDEX prompts_tags_idx ON prompts USING GIN (tags);
CREATE INDEX prompts_created_at_idx ON prompts (created_at DESC);

-- Optional: Create index on title for faster title searches
CREATE INDEX prompts_title_idx ON prompts (title);

-- Enable Row Level Security (RLS) - Important for Supabase
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
-- Adjust this based on your security requirements
CREATE POLICY "Allow public read access"
  ON prompts
  FOR SELECT
  USING (true);

-- Optional: If you want to allow authenticated users to insert/update
-- CREATE POLICY "Allow authenticated insert"
--   ON prompts
--   FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated update"
--   ON prompts
--   FOR UPDATE
--   USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated delete"
--   ON prompts
--   FOR DELETE
--   USING (auth.role() = 'authenticated');

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries after creating the table to verify setup:

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'prompts';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'prompts';

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================
-- INSERT INTO prompts (title, content, category, tags) VALUES
--   ('Email Writing Template', 'Write a professional email about...', 'Writing', ARRAY['email', 'business']),
--   ('Code Review Prompt', 'Review the following code for...', 'Development', ARRAY['code', 'review']),
--   ('Marketing Copy', 'Create compelling marketing copy for...', 'Marketing', ARRAY['copywriting', 'sales']);

-- ============================================================================
-- BULK IMPORT INSTRUCTIONS
-- ============================================================================
-- After running the Python ingestion script to generate prompts.csv,
-- import the data using one of these methods:
--
-- Method 1: Supabase Dashboard
-- 1. Go to Table Editor in Supabase Dashboard
-- 2. Select the 'prompts' table
-- 3. Click 'Insert' > 'Import data from CSV'
-- 4. Upload prompts.csv
--
-- Method 2: SQL COPY Command (if you have direct database access)
-- COPY prompts (title, content, category, tags, created_at)
-- FROM '/path/to/prompts.csv'
-- WITH (FORMAT csv, HEADER true, DELIMITER ',');
--
-- Method 3: psql command line
-- \copy prompts (title, content, category, tags, created_at) FROM 'prompts.csv' WITH (FORMAT csv, HEADER true);
--
-- ============================================================================
