/*
  # Create storage bucket for lost pet images
  
  This migration creates policies for the storage bucket that will be created
  via the edge function. The bucket itself is created through the API to avoid
  permission issues.
  
  1. Security
    - Enable RLS on storage.objects table
    - Add policies for public read access
    - Add policies for authenticated users to upload/manage their images
*/

-- Enable RLS on objects table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'lost-cat-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'lost-cat-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own images'
  ) THEN
    CREATE POLICY "Users can update their own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'lost-cat-images' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own images'
  ) THEN
    CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'lost-cat-images' AND owner = auth.uid());
  END IF;
END $$;