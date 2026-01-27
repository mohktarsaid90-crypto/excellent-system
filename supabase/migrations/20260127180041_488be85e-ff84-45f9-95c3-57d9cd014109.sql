-- Add carton pricing fields to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS carton_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pieces_per_carton integer DEFAULT 1;

-- Add classification enum for customers
DO $$ BEGIN
  CREATE TYPE public.customer_classification AS ENUM ('retail', 'key_retail', 'modern_trade');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add classification to customers (location fields already exist)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS classification customer_classification DEFAULT 'retail';

-- Add credit balance and auth user reference to agents
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS credit_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Mano Sales',
  tax_id text,
  phone text,
  address text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on company_settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- All admins can view company settings
CREATE POLICY "Admins can view company settings"
  ON public.company_settings FOR SELECT
  USING (is_admin(auth.uid()));

-- IT Admin can manage company settings
CREATE POLICY "IT Admin can manage company settings"
  ON public.company_settings FOR ALL
  USING (has_role(auth.uid(), 'it_admin'));

-- Insert default company settings if not exists
INSERT INTO public.company_settings (company_name, tax_id, phone, address)
SELECT 'Mano Sales', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- Create trigger for updated_at on company_settings
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();