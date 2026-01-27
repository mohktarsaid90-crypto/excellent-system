-- Remove unused password_hash column from agents table
-- Authentication is handled by Supabase Auth via auth_user_id reference
ALTER TABLE public.agents DROP COLUMN IF EXISTS password_hash;

-- Add documentation comment explaining authentication architecture
COMMENT ON COLUMN public.agents.auth_user_id IS 'References auth.users(id). All authentication handled by Supabase Auth - never store passwords in application tables.';