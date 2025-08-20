-- Combined migration: base schema + updates
-- Generated from ฐานข้อมูล.txt and ตัวปรับปรุงฐานข้อมูล.txt
-- Safe ordering: drop children -> drop parents -> create extension -> create parents -> create children -> policies/triggers/inserts -> final updates

-- 0) enable extension used by gen_random_uuid
create extension if not exists pgcrypto;

-- 1) Drop dependent tables (safe to re-run)
DROP TABLE IF EXISTS public.found_pet_images CASCADE;
DROP TABLE IF EXISTS public.lost_cat_images CASCADE;
DROP TABLE IF EXISTS public.lost_pet_images CASCADE;

DROP TABLE IF EXISTS public.found_pets CASCADE;
DROP TABLE IF EXISTS public.lost_cats CASCADE;
DROP TABLE IF EXISTS public.lost_pets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2) Create parent tables
CREATE TABLE public.found_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  pet_type text NOT NULL CHECK (pet_type IN ('cat','dog')),
  breed text NOT NULL,
  color text,
  found_date date NOT NULL,
  location text NOT NULL,
  province text NOT NULL,
  latitude numeric,
  longitude numeric,
  details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','claimed','closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  pattern text,
  colors text,
  sex text NOT NULL DEFAULT 'unknown' CHECK (sex IN ('male','female','unknown')),
  has_collar boolean NOT NULL DEFAULT false
);

CREATE TABLE public.lost_cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  cat_name text NOT NULL,
  breed text NOT NULL,
  color text NOT NULL,
  date_of_birth date NOT NULL,
  lost_date date NOT NULL,
  location text NOT NULL,
  province text NOT NULL,
  reward numeric,
  details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','found','closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.lost_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  pet_type text NOT NULL CHECK (pet_type IN ('cat','dog')),
  pet_name text NOT NULL,
  breed text NOT NULL,
  color text,
  date_of_birth date NOT NULL,
  lost_date date NOT NULL,
  location text NOT NULL,
  province text NOT NULL,
  reward numeric,
  details text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','found','closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  age_years integer NOT NULL DEFAULT 0,
  age_months integer NOT NULL DEFAULT 0 CHECK (age_months BETWEEN 0 AND 11),
  latitude real,
  longitude real,
  colors text,
  pattern text,
  sex text NOT NULL DEFAULT 'unknown' CHECK (sex IN ('male','female','unknown')),
  has_collar boolean NOT NULL DEFAULT false
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  updated_at timestamptz,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  terms_accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3) Create child tables
CREATE TABLE public.found_pet_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  found_pet_id uuid REFERENCES public.found_pets(id),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.lost_cat_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_cat_id uuid REFERENCES public.lost_cats(id),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.lost_pet_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_pet_id uuid REFERENCES public.lost_pets(id),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4) Enable RLS on tables
ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_cat_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5) Policies (use conditional creation via DO block where appropriate)
DO $$
BEGIN
  -- profiles policies (select/insert/update/delete)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_all_select') THEN
    CREATE POLICY profiles_all_select ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_all_insert') THEN
    CREATE POLICY profiles_all_insert ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_all_update') THEN
    CREATE POLICY profiles_all_update ON public.profiles FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_all_delete') THEN
    CREATE POLICY profiles_all_delete ON public.profiles FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pets' AND policyname='found_pets_all_select') THEN
    CREATE POLICY found_pets_all_select ON public.found_pets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pets' AND policyname='found_pets_all_insert') THEN
    CREATE POLICY found_pets_all_insert ON public.found_pets FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pets' AND policyname='found_pets_all_update') THEN
    CREATE POLICY found_pets_all_update ON public.found_pets FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pets' AND policyname='found_pets_all_delete') THEN
    CREATE POLICY found_pets_all_delete ON public.found_pets FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cats' AND policyname='lost_cats_all_select') THEN
    CREATE POLICY lost_cats_all_select ON public.lost_cats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cats' AND policyname='lost_cats_all_insert') THEN
    CREATE POLICY lost_cats_all_insert ON public.lost_cats FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cats' AND policyname='lost_cats_all_update') THEN
    CREATE POLICY lost_cats_all_update ON public.lost_cats FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cats' AND policyname='lost_cats_all_delete') THEN
    CREATE POLICY lost_cats_all_delete ON public.lost_cats FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pets' AND policyname='lost_pets_all_select') THEN
    CREATE POLICY lost_pets_all_select ON public.lost_pets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pets' AND policyname='lost_pets_all_insert') THEN
    CREATE POLICY lost_pets_all_insert ON public.lost_pets FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pets' AND policyname='lost_pets_all_update') THEN
    CREATE POLICY lost_pets_all_update ON public.lost_pets FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pets' AND policyname='lost_pets_all_delete') THEN
    CREATE POLICY lost_pets_all_delete ON public.lost_pets FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  -- images policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pet_images' AND policyname='found_pet_images_all_select') THEN
    CREATE POLICY found_pet_images_all_select ON public.found_pet_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pet_images' AND policyname='found_pet_images_all_insert') THEN
    CREATE POLICY found_pet_images_all_insert ON public.found_pet_images FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pet_images' AND policyname='found_pet_images_all_update') THEN
    CREATE POLICY found_pet_images_all_update ON public.found_pet_images FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='found_pet_images' AND policyname='found_pet_images_all_delete') THEN
    CREATE POLICY found_pet_images_all_delete ON public.found_pet_images FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cat_images' AND policyname='lost_cat_images_all_select') THEN
    CREATE POLICY lost_cat_images_all_select ON public.lost_cat_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cat_images' AND policyname='lost_cat_images_all_insert') THEN
    CREATE POLICY lost_cat_images_all_insert ON public.lost_cat_images FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cat_images' AND policyname='lost_cat_images_all_update') THEN
    CREATE POLICY lost_cat_images_all_update ON public.lost_cat_images FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_cat_images' AND policyname='lost_cat_images_all_delete') THEN
    CREATE POLICY lost_cat_images_all_delete ON public.lost_cat_images FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pet_images' AND policyname='lost_pet_images_all_select') THEN
    CREATE POLICY lost_pet_images_all_select ON public.lost_pet_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pet_images' AND policyname='lost_pet_images_all_insert') THEN
    CREATE POLICY lost_pet_images_all_insert ON public.lost_pet_images FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pet_images' AND policyname='lost_pet_images_all_update') THEN
    CREATE POLICY lost_pet_images_all_update ON public.lost_pet_images FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lost_pet_images' AND policyname='lost_pet_images_all_delete') THEN
    CREATE POLICY lost_pet_images_all_delete ON public.lost_pet_images FOR DELETE USING (true);
  END IF;
END $$;

-- Additional explicit own-profile policies (safer RLS for profiles)
DROP POLICY IF EXISTS select_own_profile ON public.profiles;
DROP POLICY IF EXISTS insert_own_profile ON public.profiles;
DROP POLICY IF EXISTS update_own_profile ON public.profiles;

CREATE POLICY select_own_profile
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY insert_own_profile
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY update_own_profile
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='storage.objects' AND policyname='Public read found-pet-images') THEN
    CREATE POLICY "Public read found-pet-images" ON storage.objects FOR SELECT USING (bucket_id = 'found-pet-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='storage.objects' AND policyname='Auth upload found-pet-images') THEN
    CREATE POLICY "Auth upload found-pet-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'found-pet-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='storage.objects' AND policyname='Public read') THEN
    CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id='lost-pet-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='storage.objects' AND policyname='Auth upload') THEN
    CREATE POLICY "Auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='lost-pet-images');
  END IF;
END $$;

-- 6) Backfill: ensure every auth.user has a profile row (username + full_name from email local-part)
-- This is idempotent
INSERT INTO public.profiles (id, username, full_name, created_at)
SELECT au.id,
       split_part(au.email, '@', 1) AS username,
       split_part(au.email, '@', 1) AS full_name,
       now()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);

-- 7) Create trigger/function to populate profiles on new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) Enable RLS again on profiles (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9) Migration: add_terms_tracking_to_profiles (idempotent)
BEGIN;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Set terms_accepted_at and created_at for existing users
UPDATE public.profiles 
SET 
    terms_accepted_at = COALESCE(terms_accepted_at, now()),
    created_at = COALESCE(created_at, now())
WHERE terms_accepted_at IS NULL OR created_at IS NULL;

COMMIT;

-- End of combined migration
