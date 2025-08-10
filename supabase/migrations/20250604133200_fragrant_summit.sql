/*
  # Add age tracking columns to lost_pets table

  1. Changes
    - Add `age_years` column to store the pet's age in years
    - Add `age_months` column to store the pet's age in months (0-11)
    - Both columns are integers and cannot be null
    - Default values set to 0 for both columns

  2. Notes
    - Using DO block to safely add columns if they don't exist
    - Maintaining existing data by setting default values
*/

DO $$ 
BEGIN
  -- Add age_years column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lost_pets' AND column_name = 'age_years'
  ) THEN
    ALTER TABLE lost_pets ADD COLUMN age_years integer NOT NULL DEFAULT 0;
  END IF;

  -- Add age_months column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lost_pets' AND column_name = 'age_months'
  ) THEN
    ALTER TABLE lost_pets ADD COLUMN age_months integer NOT NULL DEFAULT 0;
  END IF;

  -- Add constraint to ensure age_months is between 0 and 11
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'lost_pets' AND constraint_name = 'lost_pets_age_months_check'
  ) THEN
    ALTER TABLE lost_pets 
    ADD CONSTRAINT lost_pets_age_months_check 
    CHECK (age_months >= 0 AND age_months <= 11);
  END IF;
END $$;