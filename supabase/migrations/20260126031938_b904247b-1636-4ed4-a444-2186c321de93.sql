-- Create role enum for admin users
CREATE TYPE public.admin_role AS ENUM ('it_admin', 'sales_manager', 'accountant');

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role admin_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create agents table for field sales representatives
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT, -- For agent app login reference
  monthly_target DECIMAL(12,2) DEFAULT 0,
  current_sales DECIMAL(12,2) DEFAULT 0,
  -- Remote permissions
  can_give_discounts BOOLEAN DEFAULT false,
  can_add_clients BOOLEAN DEFAULT false,
  can_process_returns BOOLEAN DEFAULT false,
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_location_lat DECIMAL(10,8),
  last_location_lng DECIMAL(11,8),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  vat_rate DECIMAL(5,2) DEFAULT 15.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  current_balance DECIMAL(12,2) DEFAULT 0,
  assigned_agent_id UUID REFERENCES public.agents(id),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  agent_id UUID REFERENCES public.agents(id) NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit', 'bank_transfer', 'cheque')),
  is_synced BOOLEAN DEFAULT true,
  synced_at TIMESTAMP WITH TIME ZONE,
  offline_created BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stock_loads table for morning load management
CREATE TABLE public.stock_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'released', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  released_at TIMESTAMP WITH TIME ZONE,
  released_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stock_load_items table
CREATE TABLE public.stock_load_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_load_id UUID REFERENCES public.stock_loads(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  requested_quantity INTEGER NOT NULL,
  approved_quantity INTEGER,
  released_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reconciliations table (Tafreegh)
CREATE TABLE public.reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'disputed')),
  total_loaded INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  total_returned INTEGER DEFAULT 0,
  cash_collected DECIMAL(12,2) DEFAULT 0,
  expected_cash DECIMAL(12,2) DEFAULT 0,
  variance DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create journey_plans table
CREATE TABLE public.journey_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) NOT NULL,
  plan_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create journey_stops table
CREATE TABLE public.journey_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_plan_id UUID REFERENCES public.journey_plans(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  stop_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'checked_out', 'skipped')),
  check_in_at TIMESTAMP WITH TIME ZONE,
  check_out_at TIMESTAMP WITH TIME ZONE,
  check_in_lat DECIMAL(10,8),
  check_in_lng DECIMAL(11,8),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create agent_locations table for tracking history
CREATE TABLE public.agent_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_load_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_locations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role admin_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "IT Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'it_admin'));

CREATE POLICY "IT Admins can manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'it_admin'));

-- User roles policies (only IT Admin can manage)
CREATE POLICY "IT Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'it_admin'));

CREATE POLICY "IT Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'it_admin'));

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Agents policies (IT Admin and Sales Manager)
CREATE POLICY "Admins can view agents" ON public.agents
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Sales Manager can manage agents" ON public.agents
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

-- Products policies (all admins can view, IT Admin can manage)
CREATE POLICY "Admins can view products" ON public.products
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'it_admin'));

-- Customers policies
CREATE POLICY "Admins can view customers" ON public.customers
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Sales Manager can manage customers" ON public.customers
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

-- Invoices policies (all admins can view, accountant focus)
CREATE POLICY "Admins can view invoices" ON public.invoices
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Accountant can manage invoices" ON public.invoices
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

-- Invoice items policies
CREATE POLICY "Admins can view invoice items" ON public.invoice_items
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Accountant can manage invoice items" ON public.invoice_items
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

-- Stock loads policies
CREATE POLICY "Admins can view stock loads" ON public.stock_loads
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Sales Manager can manage stock loads" ON public.stock_loads
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

-- Stock load items policies
CREATE POLICY "Admins can view stock load items" ON public.stock_load_items
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Sales Manager can manage stock load items" ON public.stock_load_items
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

-- Reconciliations policies
CREATE POLICY "Admins can view reconciliations" ON public.reconciliations
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Accountant can manage reconciliations" ON public.reconciliations
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'accountant')
  );

-- Journey plans policies
CREATE POLICY "Admins can view journey plans" ON public.journey_plans
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Sales Manager can manage journey plans" ON public.journey_plans
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

-- Journey stops policies
CREATE POLICY "Admins can view journey stops" ON public.journey_stops
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "IT Admin and Sales Manager can manage journey stops" ON public.journey_stops
  FOR ALL USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

-- Agent locations policies
CREATE POLICY "Sales Manager can view agent locations" ON public.agent_locations
  FOR SELECT USING (
    public.has_role(auth.uid(), 'it_admin') OR 
    public.has_role(auth.uid(), 'sales_manager')
  );

CREATE POLICY "System can insert agent locations" ON public.agent_locations
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_plans_updated_at BEFORE UPDATE ON public.journey_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_loads;