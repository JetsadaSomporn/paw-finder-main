/*
  # Lost Pets Database Schema

  1. New Tables
    - `lost_cats`
      - Core information about lost pets including name, breed, color, etc.
      - Stores location details and reward information
      - Links to contact information and images
    
    - `lost_cat_images`
      - Stores image URLs for lost pet reports
      - Each cat can have multiple images (up to 3)

  2. Security
    - Enable RLS on all tables
    - Policies allow:
      - Anyone to view lost pet reports
      - Authenticated users to create reports
      - Users can only modify their own reports
*/

-- Create lost_cats table
CREATE TABLE IF NOT EXISTS lost_cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  cat_name text NOT NULL,
  breed text NOT NULL,
  color text NOT NULL,
  date_of_birth date NOT NULL,
  lost_date date NOT NULL,
  location text NOT NULL,
  province text NOT NULL,
  reward decimal(10,2),
  details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'found', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lost_cat_images table
CREATE TABLE IF NOT EXISTS lost_cat_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_cat_id uuid REFERENCES lost_cats(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lost_cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_cat_images ENABLE ROW LEVEL SECURITY;

-- Create policies for lost_cats
CREATE POLICY "Anyone can view lost cats"
  ON lost_cats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create lost cat reports"
  ON lost_cats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost cat reports"
  ON lost_cats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost cat reports"
  ON lost_cats
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for lost_cat_images
CREATE POLICY "Anyone can view lost cat images"
  ON lost_cat_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert images for their lost cat reports"
  ON lost_cat_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lost_cats
      WHERE id = lost_cat_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own lost cat images"
  ON lost_cat_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lost_cats
      WHERE id = lost_cat_id
      AND user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for lost_cats
CREATE TRIGGER update_lost_cats_updated_at
  BEFORE UPDATE ON lost_cats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_lost_cats_province ON lost_cats(province);
CREATE INDEX IF NOT EXISTS idx_lost_cats_status ON lost_cats(status);
CREATE INDEX IF NOT EXISTS idx_lost_cats_lost_date ON lost_cats(lost_date);