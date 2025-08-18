-- Migration: add_terms_tracking_to_profiles.sql
BEGIN;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Set terms_accepted_at and created_at for existing users
UPDATE profiles 
SET 
    terms_accepted_at = now(),
    created_at = now()
WHERE terms_accepted_at IS NULL;

COMMIT;
