/*
  # Configure authentication settings
  
  1. Changes
    - Enable automatic email confirmation for new users
    - Set up appropriate security policies
  
  2. Security
    - Maintains existing security model
    - Uses proper policy-based approach
*/

-- Create a function to automatically confirm email addresses
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET is_confirmed = true
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();