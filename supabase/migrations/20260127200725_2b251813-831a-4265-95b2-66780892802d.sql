-- Create agent_visits table for KPI tracking (Productivity, Strike Rate)
CREATE TABLE public.agent_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_at TIMESTAMP WITH TIME ZONE,
  check_out_at TIMESTAMP WITH TIME ZONE,
  location_lat NUMERIC,
  location_lng NUMERIC,
  visit_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (visit_type IN ('scheduled', 'unscheduled', 'follow_up')),
  outcome TEXT CHECK (outcome IN ('successful', 'no_sale', 'not_available', 'postponed')),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_visits ENABLE ROW LEVEL SECURITY;

-- Policies for agent_visits
CREATE POLICY "Admins can view agent visits"
ON public.agent_visits FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Sales Manager can manage agent visits"
ON public.agent_visits FOR ALL
USING (has_role(auth.uid(), 'it_admin'::admin_role) OR has_role(auth.uid(), 'sales_manager'::admin_role));

-- Create reconciliation_items table for product-level settlement
CREATE TABLE public.reconciliation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconciliation_id UUID NOT NULL REFERENCES public.reconciliations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  loaded_quantity INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  returned_quantity INTEGER NOT NULL DEFAULT 0,
  damaged_quantity INTEGER NOT NULL DEFAULT 0,
  remaining_quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_value NUMERIC GENERATED ALWAYS AS (sold_quantity * unit_price) STORED,
  damage_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reconciliation_items ENABLE ROW LEVEL SECURITY;

-- Policies for reconciliation_items
CREATE POLICY "Admins can view reconciliation items"
ON public.reconciliation_items FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "IT Admin and Accountant can manage reconciliation items"
ON public.reconciliation_items FOR ALL
USING (has_role(auth.uid(), 'it_admin'::admin_role) OR has_role(auth.uid(), 'accountant'::admin_role));

-- Add indexes for performance
CREATE INDEX idx_agent_visits_agent_date ON public.agent_visits(agent_id, visit_date);
CREATE INDEX idx_agent_visits_outcome ON public.agent_visits(outcome);
CREATE INDEX idx_reconciliation_items_reconciliation ON public.reconciliation_items(reconciliation_id);

-- Add damages and returns fields to reconciliations table
ALTER TABLE public.reconciliations 
ADD COLUMN IF NOT EXISTS total_damaged INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS damage_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS return_value NUMERIC DEFAULT 0;