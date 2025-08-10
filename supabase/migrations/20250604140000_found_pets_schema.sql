/*
  # Create Found Pets Schema
  
  1. Changes
    - Create found_pets table for reporting found pets
    - Add map coordinates (latitude, longitude) for location tracking
    - Create found_pet_images table for storing images
    - Add appropriate indexes and constraints
    - Enable Row Level Security with policies
  
  2. Features
    - Support for cat/dog types
    - Location tracking with coordinates
    - Image storage
    - Province-based filtering
    - Status tracking (active, claimed, closed)
*/

-- Create found_pets table
CREATE TABLE IF NOT EXISTS found_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  pet_type text NOT NULL CHECK (pet_type IN ('cat', 'dog')),
  breed text NOT NULL,
  color text NOT NULL,
  found_date date NOT NULL,
  location text NOT NULL,
  province text NOT NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create found_pet_images table
CREATE TABLE IF NOT EXISTS found_pet_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  found_pet_id uuid REFERENCES found_pets(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_found_pets_found_date ON found_pets(found_date);
CREATE INDEX IF NOT EXISTS idx_found_pets_province ON found_pets(province);
CREATE INDEX IF NOT EXISTS idx_found_pets_status ON found_pets(status);
CREATE INDEX IF NOT EXISTS idx_found_pets_pet_type ON found_pets(pet_type);
CREATE INDEX IF NOT EXISTS idx_found_pets_coordinates ON found_pets(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE found_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_pet_images ENABLE ROW LEVEL SECURITY;

-- Create policies for found_pets
CREATE POLICY "Anyone can view found pets"
  ON found_pets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create found pet reports"
  ON found_pets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own found pet reports"
  ON found_pets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own found pet reports"
  ON found_pets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for found_pet_images
CREATE POLICY "Anyone can view found pet images"
  ON found_pet_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert found pet images"
  ON found_pet_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can delete their own found pet images"
  ON found_pet_images
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM found_pets
    WHERE found_pets.id = found_pet_images.found_pet_id
    AND found_pets.user_id = auth.uid()
  ));

-- Create trigger for updating updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_found_pets_updated_at'
  ) THEN
    CREATE TRIGGER update_found_pets_updated_at
      BEFORE UPDATE ON found_pets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create storage bucket for found pet images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('found-pet-images', 'found-pet-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$; 