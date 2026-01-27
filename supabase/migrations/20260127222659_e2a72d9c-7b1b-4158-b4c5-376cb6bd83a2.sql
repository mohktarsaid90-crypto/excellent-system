-- Fix unrestricted agent location logging vulnerability
-- Remove overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert agent locations" ON public.agent_locations;
DROP POLICY IF EXISTS "Admins can insert agent locations" ON public.agent_locations;

-- Create agent-scoped INSERT policy (agents can only log their own locations)
CREATE POLICY "Agents can insert own locations"
  ON public.agent_locations
  FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  );

-- Create admin INSERT policy for administrative purposes
CREATE POLICY "Admins can insert agent locations"
  ON public.agent_locations  
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));