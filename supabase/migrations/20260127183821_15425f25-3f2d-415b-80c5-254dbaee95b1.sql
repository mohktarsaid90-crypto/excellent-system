-- Add 'company_owner' to the admin_role enum
ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'company_owner';