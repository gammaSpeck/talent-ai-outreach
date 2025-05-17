
-- Create schema for HireAI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recruiters table that extends the auth.users table
CREATE TABLE recruiters (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_listings table to store recruiter queries
CREATE TABLE search_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  entered_query TEXT NOT NULL,
  parsed_query JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table to store GitHub candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_listing_id UUID NOT NULL REFERENCES search_listings(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  avatar_url TEXT,
  location TEXT,
  bio TEXT,
  profile_url TEXT NOT NULL,
  extra_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outreach_messages table to store messages
CREATE TABLE outreach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

-- Policies for recruiters table
CREATE POLICY "Recruiters can view their own data" 
  ON recruiters FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Recruiters can update their own data" 
  ON recruiters FOR UPDATE 
  USING (auth.uid() = id);

-- Policies for search_listings table
CREATE POLICY "Recruiters can view their own searches" 
  ON search_listings FOR SELECT 
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can create searches" 
  ON search_listings FOR INSERT 
  WITH CHECK (recruiter_id = auth.uid());

-- Policies for candidates table
CREATE POLICY "Recruiters can view candidates from their searches" 
  ON candidates FOR SELECT 
  USING (
    search_listing_id IN (
      SELECT id FROM search_listings 
      WHERE recruiter_id = auth.uid()
    )
  );

-- Policies for outreach_messages table
CREATE POLICY "Recruiters can view their own outreach messages" 
  ON outreach_messages FOR SELECT 
  USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can create outreach messages" 
  ON outreach_messages FOR INSERT 
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update their own outreach messages" 
  ON outreach_messages FOR UPDATE 
  USING (recruiter_id = auth.uid());
