import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KPIStats {
  productivity: number; // Invoices per visit
  strikeRate: number; // Successful visits / Total visits (%)
  dropSize: number; // Average sales value per invoice
  totalVisits: number;
  successfulVisits: number;
  totalInvoices: number;
  totalSalesValue: number;
}

interface TargetVsActual {
  volumeTarget: number;
  volumeActual: number;
  volumePercent: number;
  valueTarget: number;
  valueActual: number;
  valuePercent: number;
  weightTarget: number;
  weightActual: number;
  weightPercent: number;
}

export const useKPIStats = (dateRange?: { start: Date; end: Date }) => {
  return useQuery({
    queryKey: ['kpi-stats', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<KPIStats> => {
      // Get current month range if not specified
      const now = new Date();
      const startOfMonth = dateRange?.start || new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = dateRange?.end || new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch visits
      const { data: visits } = await supabase
        .from('agent_visits')
        .select('id, outcome, invoice_id')
        .gte('visit_date', startOfMonth.toISOString().split('T')[0])
        .lte('visit_date', endOfMonth.toISOString().split('T')[0]);

      // Fetch invoices for the period
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      const totalVisits = visits?.length || 0;
      const successfulVisits = visits?.filter(v => v.outcome === 'successful').length || 0;
      const totalInvoices = invoices?.length || 0;
      const totalSalesValue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Calculate KPIs
      const productivity = totalVisits > 0 ? totalInvoices / totalVisits : 0;
      const strikeRate = totalVisits > 0 ? (successfulVisits / totalVisits) * 100 : 0;
      const dropSize = totalInvoices > 0 ? totalSalesValue / totalInvoices : 0;

      return {
        productivity: Math.round(productivity * 100) / 100,
        strikeRate: Math.round(strikeRate * 10) / 10,
        dropSize: Math.round(dropSize),
        totalVisits,
        successfulVisits,
        totalInvoices,
        totalSalesValue,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useTargetVsActual = () => {
  return useQuery({
    queryKey: ['target-vs-actual'],
    queryFn: async (): Promise<TargetVsActual> => {
      // Get current month range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch all agents with their targets
      const { data: agents } = await supabase
        .from('agents')
        .select('monthly_target, current_sales')
        .eq('is_active', true);

      // Fetch invoices for the period with items
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      // Fetch invoice items for quantity calculation
      const { data: invoiceItems } = await supabase
        .from('invoice_items')
        .select('quantity, product_id, invoice_id');

      // Calculate totals
      const totalValueTarget = agents?.reduce((sum, a) => sum + (a.monthly_target || 0), 0) || 0;
      const totalValueActual = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Volume (quantity of items sold)
      const totalVolumeActual = invoiceItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      // Assume volume target is 10% of value target in units (this should be configured per company)
      const totalVolumeTarget = Math.round(totalValueTarget / 100);

      // Weight estimation (assuming 0.5kg per item average - this should be product-specific)
      const totalWeightActual = totalVolumeActual * 0.5 / 1000; // Convert to tons
      const totalWeightTarget = totalVolumeTarget * 0.5 / 1000;

      return {
        volumeTarget: totalVolumeTarget,
        volumeActual: totalVolumeActual,
        volumePercent: totalVolumeTarget > 0 ? (totalVolumeActual / totalVolumeTarget) * 100 : 0,
        valueTarget: totalValueTarget,
        valueActual: totalValueActual,
        valuePercent: totalValueTarget > 0 ? (totalValueActual / totalValueTarget) * 100 : 0,
        weightTarget: Math.round(totalWeightTarget * 100) / 100,
        weightActual: Math.round(totalWeightActual * 100) / 100,
        weightPercent: totalWeightTarget > 0 ? (totalWeightActual / totalWeightTarget) * 100 : 0,
      };
    },
    refetchInterval: 60000,
  });
};
