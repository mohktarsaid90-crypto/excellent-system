-- Enable RLS where needed (safe if already enabled)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_load_items ENABLE ROW LEVEL SECURITY;

-- Agents: allow creating (inserting) their own customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'customers'
      AND policyname = 'Agents can create customers'
  ) THEN
    CREATE POLICY "Agents can create customers"
    ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (
      assigned_agent_id IN (
        SELECT a.id
        FROM public.agents a
        WHERE a.auth_user_id = auth.uid()
          AND a.is_active = true
      )
    );
  END IF;
END $$;

-- Agents: allow creating (inserting) their own stock load requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stock_loads'
      AND policyname = 'Agents can create own stock loads'
  ) THEN
    CREATE POLICY "Agents can create own stock loads"
    ON public.stock_loads
    FOR INSERT
    TO authenticated
    WITH CHECK (
      agent_id IN (
        SELECT a.id
        FROM public.agents a
        WHERE a.auth_user_id = auth.uid()
          AND a.is_active = true
      )
    );
  END IF;
END $$;

-- Agents: allow creating (inserting) items for their own stock load requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stock_load_items'
      AND policyname = 'Agents can create own stock load items'
  ) THEN
    CREATE POLICY "Agents can create own stock load items"
    ON public.stock_load_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
      stock_load_id IN (
        SELECT sl.id
        FROM public.stock_loads sl
        WHERE sl.agent_id IN (
          SELECT a.id
          FROM public.agents a
          WHERE a.auth_user_id = auth.uid()
            AND a.is_active = true
        )
      )
    );
  END IF;
END $$;