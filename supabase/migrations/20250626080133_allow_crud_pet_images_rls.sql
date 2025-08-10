-- Migration: Allow storage operations for all users (development only)
-- TODO: Restrict these policies for production (e.g., to authenticated users only)

-- Enable RLS for storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-pet-images', 'lost-pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policies
CREATE POLICY "Allow public bucket select access" ON storage.buckets
FOR SELECT USING (true);

-- Storage object policies for lost-pet-images bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'lost-pet-images');

CREATE POLICY "Allow all users to upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lost-pet-images'
);

CREATE POLICY "Allow all users to update and delete" ON storage.objects
FOR ALL USING (
  bucket_id = 'lost-pet-images'
);
