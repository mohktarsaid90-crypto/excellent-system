-- Add cartons_target and tons_target columns to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS cartons_target integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tons_target numeric DEFAULT 0;