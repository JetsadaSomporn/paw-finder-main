/*
  # Add coordinates to lost_pets table
  
  1. Changes
    - Add `latitude` column to store the pet's lost location latitude
    - Add `longitude` column to store the pet's lost location longitude
    - Both columns are numeric and can be null (for existing records)
    - Add index for coordinate-based queries
  
  2. Features
    - Enable map display for lost pets
    - Support for coordinate-based search and filtering
    - Maintain backward compatibility with existing records
*/

-- Add latitude and longitude columns to lost_pets table
DO $$ 
BEGIN
  -- Add latitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lost_pets' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE lost_pets ADD COLUMN latitude numeric(10, 8);
  END IF;

  -- Add longitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lost_pets' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE lost_pets ADD COLUMN longitude numeric(11, 8);
  END IF;
END $$;

-- Create index for coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_lost_pets_coordinates ON lost_pets(latitude, longitude);

-- Add constraint to ensure valid coordinate ranges
DO $$
BEGIN
  -- Add constraint for latitude range (-90 to 90)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'lost_pets' AND constraint_name = 'lost_pets_latitude_check'
  ) THEN
    ALTER TABLE lost_pets 
    ADD CONSTRAINT lost_pets_latitude_check 
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  -- Add constraint for longitude range (-180 to 180)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'lost_pets' AND constraint_name = 'lost_pets_longitude_check'
  ) THEN
    ALTER TABLE lost_pets 
    ADD CONSTRAINT lost_pets_longitude_check 
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$; 