-- Fix 1: Remove public product exposure - require authenticated agents
DROP POLICY IF EXISTS "Agents can view active products" ON public.products;

CREATE POLICY "Authenticated agents can view active products" 
ON public.products
FOR SELECT
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.agents 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- Fix 2: Allow agents to submit reconciliations
CREATE POLICY "Agents can create own reconciliations" 
ON public.reconciliations
FOR INSERT
WITH CHECK (
  agent_id IN (
    SELECT id FROM public.agents 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Agents can view own reconciliations" 
ON public.reconciliations
FOR SELECT
USING (
  agent_id IN (
    SELECT id FROM public.agents 
    WHERE auth_user_id = auth.uid()
  )
);

-- Fix 3: Allow agents to manage reconciliation items
CREATE POLICY "Agents can create own reconciliation items" 
ON public.reconciliation_items
FOR INSERT
WITH CHECK (
  reconciliation_id IN (
    SELECT id FROM public.reconciliations 
    WHERE agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Agents can view own reconciliation items" 
ON public.reconciliation_items
FOR SELECT
USING (
  reconciliation_id IN (
    SELECT id FROM public.reconciliations 
    WHERE agent_id IN (
      SELECT id FROM public.agents WHERE auth_user_id = auth.uid()
    )
  )
);