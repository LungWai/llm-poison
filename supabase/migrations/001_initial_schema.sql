-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create entries table
CREATE TABLE entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  type TEXT CHECK (type IN ('page', 'codegen', 'benchmark')) DEFAULT 'page',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, user_id) -- Prevent duplicate votes
);

-- Create indexes for better performance
CREATE INDEX idx_entries_status ON entries(status);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_slug ON entries(slug);
CREATE INDEX idx_votes_entry_id ON votes(entry_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for entries table
-- Public can view published entries
CREATE POLICY "Public can view published entries"
  ON entries FOR SELECT
  USING (status = 'published');

-- Users can view their own draft entries
CREATE POLICY "Users can view their own draft entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert their own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update their own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for votes table
-- Users can manage their own votes (insert, select, delete)
CREATE POLICY "Users can manage their own votes"
  ON votes FOR ALL
  USING (auth.uid() = user_id);

-- Create function to get vote count efficiently
CREATE OR REPLACE FUNCTION get_vote_count(entry_id_param UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INT FROM votes WHERE entry_id = entry_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has voted
CREATE OR REPLACE FUNCTION has_user_voted(entry_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM votes 
    WHERE entry_id = entry_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 