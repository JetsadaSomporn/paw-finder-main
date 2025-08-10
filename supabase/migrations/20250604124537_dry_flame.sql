/*
  # Initial Schema Setup for Lost Pets Application

  1. New Tables
    - `lost_pets`: Main table for lost pet reports
      - Basic pet info (type, name, breed, color, etc.)
      - Location details
      - Contact information
      - Status tracking
    - `lost_pet_images`: Store images for lost pets
      - Links to lost_pets table
      - Stores image URLs

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access
      - Authenticated user write access
      - Owner-only update/delete access

  3. Storage
    - Create bucket for pet images
*/

-- Create lost_pets table
CREATE TABLE IF NOT EXISTS lost_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  pet_type text NOT NULL CHECK (pet_type IN ('cat', 'dog')),
  pet_name text NOT NULL,
  breed text NOT NULL,
  color text NOT NULL,
  date_of_birth date NOT NULL,
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

-- Create policies for lost_pets
CREATE POLICY "Anyone can view lost pets"
  ON lost_pets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create lost pet reports"
  ON lost_pets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own lost pet reports"
  ON lost_pets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost pet reports"
  ON lost_pets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for lost_pet_images
CREATE POLICY "Anyone can view lost pet images"
  ON lost_pet_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert lost pet images"
  ON lost_pet_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can delete their own lost pet images"
  ON lost_pet_images
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lost_pets
    WHERE lost_pets.id = lost_pet_images.lost_pet_id
    AND lost_pets.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_lost_pets_updated_at
  BEFORE UPDATE ON lost_pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for pet images
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('lost-pet-images', 'lost-pet-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;