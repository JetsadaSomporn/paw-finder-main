-- Add sex column to found_pets if it doesn't exist
ALTER TABLE found_pets 
ADD COLUMN IF NOT EXISTS sex text NOT NULL DEFAULT 'unknown' 
CHECK (sex IN ('male', 'female', 'unknown'));

-- Add collar column to found_pets if it doesn't exist  
ALTER TABLE found_pets
ADD COLUMN IF NOT EXISTS has_collar boolean NOT NULL DEFAULT false;

-- Add sex column to lost_pets if it doesn't exist
ALTER TABLE lost_pets
ADD COLUMN IF NOT EXISTS sex text NOT NULL DEFAULT 'unknown'
CHECK (sex IN ('male', 'female', 'unknown'));

-- Add collar column to lost_pets if it doesn't exist
ALTER TABLE lost_pets 
ADD COLUMN IF NOT EXISTS has_collar boolean NOT NULL DEFAULT false;