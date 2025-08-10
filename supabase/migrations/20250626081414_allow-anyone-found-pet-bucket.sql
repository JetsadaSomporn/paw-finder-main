INSERT INTO storage.buckets (id, name, public)
VALUES ('found-pet-images', 'found-pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policies
CREATE POLICY "Allow public bucket select access for found-pet-images" ON storage.buckets
FOR SELECT USING (true);

-- Storage object policies for lost-pet-images bucket
CREATE POLICY "Allow public read access for found-pet-images" ON storage.objects
FOR SELECT USING (bucket_id = 'found-pet-images');

CREATE POLICY "Allow all users to upload for found-pet-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'found-pet-images'
);

CREATE POLICY "Allow all users to update and delete for found-pet-images" ON storage.objects
FOR ALL USING (
bucket_id = 'found-pet-images'
);
