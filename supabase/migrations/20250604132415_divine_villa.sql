/*
  # Update Schema for Pet Age Format
  
  1. Changes
    - Replace date_of_birth with age_years and age_months
    - Add validation for age fields
    - Update tables and policies with existence checks
  
  2. Security
    - Maintain existing RLS policies
    - Add checks for policy existence
*/

-- Create lost_pets table
CREATE TABLE IF NOT EXISTS lost_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  pet_type text NOT NULL CHECK (pet_type IN ('cat', 'dog')),
  pet_name text NOT NULL,
  breed text NOT NULL,
  color text NOT NULL,
  age_years integer NOT NULL CHECK (age_years >= 0),
  age_months integer NOT NULL CHECK (age_months >= 0 AND age_months < 12),
  lost_date date NOT NULL,
  location text NOT NULL,
  province text NOT NULL,
  reward numeric(10,2),
  details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'found', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lost_pet_images table
CREATE TABLE IF NOT EXISTS lost_pet_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_pet_id uuid REFERENCES lost_pets(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lost_pets_lost_date ON lost_pets(lost_date);
CREATE INDEX IF NOT EXISTS idx_lost_pets_province ON lost_pets(province);
CREATE INDEX IF NOT EXISTS idx_lost_pets_status ON lost_pets(status);
CREATE INDEX IF NOT EXISTS idx_lost_pets_pet_type ON lost_pets(pet_type);

-- Enable Row Level Security
ALTER TABLE lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_pet_images ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ 
BEGIN
  -- Policies for lost_pets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pets' 
    AND policyname = 'Anyone can view lost pets'
  ) THEN
    CREATE POLICY "Anyone can view lost pets"
      ON lost_pets
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pets' 
    AND policyname = 'Anyone can create lost pet reports'
  ) THEN
    CREATE POLICY "Anyone can create lost pet reports"
      ON lost_pets
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pets' 
    AND policyname = 'Users can update their own lost pet reports'
  ) THEN
    CREATE POLICY "Users can update their own lost pet reports"
      ON lost_pets
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pets' 
    AND policyname = 'Users can delete their own lost pet reports'
  ) THEN
    CREATE POLICY "Users can delete their own lost pet reports"
      ON lost_pets
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policies for lost_pet_images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pet_images' 
    AND policyname = 'Anyone can view lost pet images'
  ) THEN
    CREATE POLICY "Anyone can view lost pet images"
      ON lost_pet_images
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pet_images' 
    AND policyname = 'Anyone can insert lost pet images'
  ) THEN
    CREATE POLICY "Anyone can insert lost pet images"
      ON lost_pet_images
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lost_pet_images' 
    AND policyname = 'Users can delete their own lost pet images'
  ) THEN
    CREATE POLICY "Users can delete their own lost pet images"
      ON lost_pet_images
      FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM lost_pets
        WHERE lost_pets.id = lost_pet_images.lost_pet_id
        AND lost_pets.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_lost_pets_updated_at'
  ) THEN
    CREATE TRIGGER update_lost_pets_updated_at
      BEFORE UPDATE ON lost_pets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create storage bucket for pet images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('lost-pet-images', 'lost-pet-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;