-- Add max_discount_percent column to agents table for discount limit control
ALTER TABLE public.agents 
ADD COLUMN max_discount_percent numeric DEFAULT 10 CHECK (max_discount_percent >= 0 AND max_discount_percent <= 100);

-- Comment for documentation
COMMENT ON COLUMN public.agents.max_discount_percent IS 'Maximum discount percentage the agent can apply (0-100). Only applies when can_give_discounts is true.';