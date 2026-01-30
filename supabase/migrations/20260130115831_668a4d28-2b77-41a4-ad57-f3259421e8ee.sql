-- Add explicit policies to ensure profiles and agent_locations tables 
-- are NOT accessible to anonymous/unauthenticated users

-- For profiles table: ensure only authenticated users with proper roles can access
-- First, check if public policy exists and drop if needed (this prevents anon access)
DO $$
BEGIN
  -- Drop any overly permissive policies that might exist
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
  DROP POLICY IF EXISTS "Public read access" ON public.profiles;
  DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.agent_locations;
  DROP POLICY IF EXISTS "Public read access" ON public.agent_locations;
  DROP POLICY IF EXISTS "Allow public read" ON public.agent_locations;
END $$;

-- Verify RLS is enabled on both tables (should already be, but ensure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_locations ENABLE ROW LEVEL SECURITY;

-- Force tables to deny access by default even to table owners
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.agent_locations FORCE ROW LEVEL SECURITY;