-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert agent locations" ON public.agent_locations;

-- Create a more secure policy that requires admin authentication for inserts
CREATE POLICY "Admins can insert agent locations" ON public.agent_locations
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));