import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DateRange {
  from: Date;
  to: Date;
}

interface AgentKPIs {
  productivity: number; // Invoices per visit
  strikeRate: number; // Successful visits / Total visits (%)
  dropSize: number; // Average sales value per invoice
  totalVisits: number;
  successfulVisits: number;
  totalInvoices: number;
  totalSalesValue: number;
  // Target progress
  targetValue: number;
  actualValue: number;
  targetProgress: number; // percentage
  // Cartons and Tons (estimated from invoice items)
  targetCartons: number;
  actualCartons: number;
  cartonsProgress: number;
  targetTons: number;
  actualTons: number;
  tonsProgress: number;
}

interface AgentVisit {
  id: string;
  visit_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  outcome: string | null;
  visit_type: string;
  notes: string | null;
  customer_id: string | null;
  invoice_id: string | null;
  customer?: {
    name: string;
  };
}

export const useAgentKPIs = (agentId: string, dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['agent-kpis', agentId, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async (): Promise<AgentKPIs> => {
      // Get current month range if not specified
      const now = new Date();
      const startDate = dateRange?.from || new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = dateRange?.to || new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch agent details for target
      const { data: agent } = await supabase
        .from('agents')
        .select('monthly_target, current_sales')
        .eq('id', agentId)
        .maybeSingle();

      // Fetch visits for this agent
      const { data: visits } = await supabase
        .from('agent_visits')
        .select('id, outcome, invoice_id')
        .eq('agent_id', agentId)
        .gte('visit_date', startDate.toISOString().split('T')[0])
        .lte('visit_date', endDate.toISOString().split('T')[0]);

      // Fetch invoices for this agent
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount')
        .eq('agent_id', agentId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch invoice items for quantity calculation
      const invoiceIds = invoices?.map(inv => inv.id) || [];
      let totalQuantity = 0;
      
      if (invoiceIds.length > 0) {
        const { data: invoiceItems } = await supabase
          .from('invoice_items')
          .select('quantity')
          .in('invoice_id', invoiceIds);
        
        totalQuantity = invoiceItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      }

      const totalVisits = visits?.length || 0;
      const successfulVisits = visits?.filter(v => v.outcome === 'successful').length || 0;
      const totalInvoices = invoices?.length || 0;
      const totalSalesValue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Calculate KPIs
      const productivity = totalVisits > 0 ? totalInvoices / totalVisits : 0;
      const strikeRate = totalVisits > 0 ? (successfulVisits / totalVisits) * 100 : 0;
      const dropSize = totalInvoices > 0 ? totalSalesValue / totalInvoices : 0;

      // Target calculations
      const targetValue = agent?.monthly_target || 0;
      const actualValue = totalSalesValue;
      const targetProgress = targetValue > 0 ? (actualValue / targetValue) * 100 : 0;

      // Cartons - estimate based on items sold (assuming pieces_per_carton from products)
      const targetCartons = Math.round(targetValue / 100); // Rough estimate
      const actualCartons = totalQuantity;
      const cartonsProgress = targetCartons > 0 ? (actualCartons / targetCartons) * 100 : 0;

      // Tons - estimate (0.5kg per item average)
      const targetTons = targetCartons * 0.5 / 1000;
      const actualTons = actualCartons * 0.5 / 1000;
      const tonsProgress = targetTons > 0 ? (actualTons / targetTons) * 100 : 0;

      return {
        productivity: Math.round(productivity * 100) / 100,
        strikeRate: Math.round(strikeRate * 10) / 10,
        dropSize: Math.round(dropSize),
        totalVisits,
        successfulVisits,
        totalInvoices,
        totalSalesValue,
        targetValue,
        actualValue,
        targetProgress: Math.min(Math.round(targetProgress * 10) / 10, 150), // Cap at 150%
        targetCartons,
        actualCartons,
        cartonsProgress: Math.min(Math.round(cartonsProgress * 10) / 10, 150),
        targetTons: Math.round(targetTons * 100) / 100,
        actualTons: Math.round(actualTons * 100) / 100,
        tonsProgress: Math.min(Math.round(tonsProgress * 10) / 10, 150),
      };
    },
    enabled: !!agentId,
    refetchInterval: 60000,
  });
};

export const useAgentVisits = (agentId: string, dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['agent-visits', agentId, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async (): Promise<AgentVisit[]> => {
      const now = new Date();
      const startDate = dateRange?.from || new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = dateRange?.to || new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('agent_visits')
        .select(`
          id,
          visit_date,
          check_in_at,
          check_out_at,
          outcome,
          visit_type,
          notes,
          customer_id,
          invoice_id,
          customers(name)
        `)
        .eq('agent_id', agentId)
        .gte('visit_date', startDate.toISOString().split('T')[0])
        .lte('visit_date', endDate.toISOString().split('T')[0])
        .order('visit_date', { ascending: false })
        .order('check_in_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((visit: any) => ({
        ...visit,
        customer: visit.customers,
      }));
    },
    enabled: !!agentId,
  });
};

export const useAgent = (agentId: string) => {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });
};
