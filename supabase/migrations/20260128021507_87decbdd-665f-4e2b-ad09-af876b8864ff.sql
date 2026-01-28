-- Drop the overly permissive policy that allows any user to insert agent locations
DROP POLICY IF EXISTS "System can insert agent locations" ON public.agent_locations;