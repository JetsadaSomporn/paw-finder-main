/*
  # Update RLS policies for lost pets

  1. Changes
    - Update RLS policies to allow public inserts without authentication
    - Keep existing policies for updates and deletes
  
  2. Security
    - Anyone can create lost pet reports
    - Only authenticated users can update/delete their own reports
*/

-- Update policies for lost_cats table
DROP POLICY IF EXISTS "Authenticated users can create lost cat reports" ON lost_cats;

CREATE POLICY "Anyone can create lost cat reports"
  ON lost_cats
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Update policies for lost_cat_images table
DROP POLICY IF EXISTS "Users can insert images for their lost cat reports" ON lost_cat_images;

CREATE POLICY "Anyone can insert lost cat images"
  ON lost_cat_images
  FOR INSERT
  TO public
  WITH CHECK (true);