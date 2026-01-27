-- Create user_permissions table for custom feature access
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  can_access_dashboard BOOLEAN DEFAULT true,
  can_access_inventory BOOLEAN DEFAULT true,
  can_access_products BOOLEAN DEFAULT true,
  can_access_sales BOOLEAN DEFAULT true,
  can_access_customers BOOLEAN DEFAULT true,
  can_access_representatives BOOLEAN DEFAULT true,
  can_access_reports BOOLEAN DEFAULT true,
  can_access_agents BOOLEAN DEFAULT true,
  can_access_load_management BOOLEAN DEFAULT true,
  can_access_live_map BOOLEAN DEFAULT true,
  can_access_reconciliation BOOLEAN DEFAULT true,
  can_access_invoices BOOLEAN DEFAULT true,
  can_access_settings BOOLEAN DEFAULT true,
  can_access_users BOOLEAN DEFAULT true,
  can_edit_products BOOLEAN DEFAULT false,
  can_edit_customers BOOLEAN DEFAULT false,
  can_edit_agents BOOLEAN DEFAULT false,
  can_delete_users BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Only company_owner and it_admin can view all permissions
CREATE POLICY "Owners and IT Admins can view all permissions"
ON public.user_permissions
FOR SELECT
USING (
  has_role(auth.uid(), 'company_owner'::admin_role) OR 
  has_role(auth.uid(), 'it_admin'::admin_role)
);

-- Only company_owner and it_admin can manage permissions
CREATE POLICY "Owners and IT Admins can manage permissions"
ON public.user_permissions
FOR ALL
USING (
  has_role(auth.uid(), 'company_owner'::admin_role) OR 
  has_role(auth.uid(), 'it_admin'::admin_role)
);

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
ON public.user_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Update user_roles RLS to allow company_owner
DROP POLICY IF EXISTS "IT Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "IT Admins can view all roles" ON public.user_roles;

CREATE POLICY "Owners and IT Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'company_owner'::admin_role) OR 
  has_role(auth.uid(), 'it_admin'::admin_role)
);

CREATE POLICY "Owners and IT Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'company_owner'::admin_role) OR 
  has_role(auth.uid(), 'it_admin'::admin_role)
);

-- Update profiles RLS to allow company_owner
DROP POLICY IF EXISTS "IT Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "IT Admins can view all profiles" ON public.profiles;

CREATE POLICY "Owners and IT Admins can manage profiles"
ON public.profiles
FOR ALL
USING (
  has_role(auth.uid(), 'company_owner'::admin_role) OR 
  has_role(auth.uid(), 'it_admin'::admin_role)
);

CREATE POLICY "Owners and IT Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'company_owner'::admin_role) OR 
  has_role(auth.uid(), 'it_admin'::admin_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();