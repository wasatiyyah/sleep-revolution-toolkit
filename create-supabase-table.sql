-- Run this in your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/bvlnzawphkjmrtvjkyyh/sql/new

-- Drop existing table if you want to start fresh (OPTIONAL - removes all data!)
-- DROP TABLE IF EXISTS email_subscribers;

-- Create the email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_email_sent INTEGER DEFAULT 0,
  sequence_active BOOLEAN DEFAULT TRUE,
  purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_subscribers_active 
  ON email_subscribers(sequence_active, signup_date);
  
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email 
  ON email_subscribers(email);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow service role full access
CREATE POLICY "Service role can do everything" 
  ON email_subscribers 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert test data to verify it's working
INSERT INTO email_subscribers (
  email, 
  first_name, 
  signup_date, 
  last_email_sent, 
  sequence_active, 
  purchased
) VALUES 
  ('ibrahimhaleeth@gmail.com', 'Ibrahim', NOW(), 0, true, false),
  ('test@example.com', 'Test User', NOW() - INTERVAL '1 day', 1, true, false)
ON CONFLICT (email) DO NOTHING;

-- Verify the data was inserted
SELECT * FROM email_subscribers ORDER BY created_at DESC;

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'email_subscribers'
ORDER BY ordinal_position;