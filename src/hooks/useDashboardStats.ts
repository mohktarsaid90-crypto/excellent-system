import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  activeReps: number;
  lowStockItems: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch invoices for revenue
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, vat_amount');

      // Fetch customers count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch products
      const { data: products } = await supabase
        .from('products')
        .select('stock_quantity, min_stock_level, is_active');

      // Fetch active agents (online in last hour)
      const { data: agents } = await supabase
        .from('agents')
        .select('is_online, is_active');

      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const totalSales = invoices?.length || 0;
      const totalCustomers = customerCount || 0;
      const totalProducts = products?.filter(p => p.is_active)?.length || 0;
      const activeReps = agents?.filter(a => a.is_online && a.is_active)?.length || 0;
      const lowStockItems = products?.filter(p => 
        p.is_active && 
        p.stock_quantity !== null && 
        p.min_stock_level !== null && 
        p.stock_quantity < p.min_stock_level
      )?.length || 0;

      return {
        totalRevenue,
        totalSales,
        totalCustomers,
        totalProducts,
        activeReps,
        lowStockItems,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
