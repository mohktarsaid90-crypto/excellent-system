-- Add 'agent' to the admin_role enum
ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'agent';

-- Create RLS policy for agents to view their own data
-- Agents can view their own agent record
CREATE POLICY "Agents can view own agent record"
ON public.agents
FOR SELECT
USING (auth.uid() = auth_user_id);

-- Agents can update their own location
CREATE POLICY "Agents can update own location"
ON public.agents
FOR UPDATE
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Agents can view their assigned customers
CREATE POLICY "Agents can view assigned customers"
ON public.customers
FOR SELECT
USING (
  assigned_agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can view products (for creating invoices)
CREATE POLICY "Agents can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

-- Agents can create invoices
CREATE POLICY "Agents can create invoices"
ON public.invoices
FOR INSERT
WITH CHECK (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can view their own invoices
CREATE POLICY "Agents can view own invoices"
ON public.invoices
FOR SELECT
USING (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can create invoice items
CREATE POLICY "Agents can create invoice items"
ON public.invoice_items
FOR INSERT
WITH CHECK (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  )
);

-- Agents can view their invoice items
CREATE POLICY "Agents can view own invoice items"
ON public.invoice_items
FOR SELECT
USING (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  )
);

-- Agents can create visits
CREATE POLICY "Agents can create visits"
ON public.agent_visits
FOR INSERT
WITH CHECK (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can view their own visits
CREATE POLICY "Agents can view own visits"
ON public.agent_visits
FOR SELECT
USING (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can update their own visits (for check-out)
CREATE POLICY "Agents can update own visits"
ON public.agent_visits
FOR UPDATE
USING (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can view their stock loads
CREATE POLICY "Agents can view own stock loads"
ON public.stock_loads
FOR SELECT
USING (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can view their stock load items
CREATE POLICY "Agents can view own stock load items"
ON public.stock_load_items
FOR SELECT
USING (
  stock_load_id IN (
    SELECT id FROM public.stock_loads WHERE agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  )
);

-- Agents can view their journey plans
CREATE POLICY "Agents can view own journey plans"
ON public.journey_plans
FOR SELECT
USING (
  agent_id IN (
    SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
  )
);

-- Agents can view their journey stops
CREATE POLICY "Agents can view own journey stops"
ON public.journey_stops
FOR SELECT
USING (
  journey_plan_id IN (
    SELECT id FROM public.journey_plans WHERE agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  )
);

-- Create helper function for checking if user is an agent
CREATE OR REPLACE FUNCTION public.is_agent(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agents WHERE auth_user_id = _user_id AND is_active = true
  )
$$;

-- Create function to get agent_id from auth user
CREATE OR REPLACE FUNCTION public.get_agent_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.agents WHERE auth_user_id = _user_id LIMIT 1
$$;