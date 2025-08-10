-- Migration: Allow insert on lost_pets for all users (development only)
-- TODO: Restrict this policy for production (e.g., to authenticated users only)

-- Enable RLS if not already enabled
ALTER TABLE lost_pets ENABLE ROW LEVEL SECURITY;

-- Policy: allow insert for all
CREATE POLICY "Allow insert for all users (dev only)" ON lost_pets
FOR INSERT
WITH CHECK (true);
