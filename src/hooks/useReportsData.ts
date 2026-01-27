import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export type DateRangePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SalesReportData {
  invoiceNumber: string;
  customerName: string;
  agentName: string;
  amount: number;
  vatAmount: number;
  discountAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
}

export interface AgentPerformanceData {
  agentId: string;
  agentName: string;
  email: string;
  monthlyTarget: number;
  currentSales: number;
  achievementPercent: number;
  totalVisits: number;
  successfulVisits: number;
  invoiceCount: number;
  productivity: number; // Invoices per visit
  strikeRate: number; // Successful visits / Total visits
  dropSize: number; // Avg sales per invoice
}

export interface CustomerAnalysisData {
  id: string;
  name: string;
  classification: string;
  city: string;
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  invoiceCount: number;
}

export interface InventoryReportData {
  id: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  unitPrice: number;
  cartonPrice: number;
  piecesPerCarton: number;
  stockValue: number;
  isLowStock: boolean;
  damagedQuantity: number;
  returnedQuantity: number;
}

export const useSalesReport = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['sales-report', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          vat_amount,
          discount_amount,
          payment_status,
          payment_method,
          created_at,
          customers (name),
          agents (name)
        `)
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportData: SalesReportData[] = (data || []).map((inv) => ({
        invoiceNumber: inv.invoice_number,
        customerName: (inv.customers as any)?.name || '-',
        agentName: (inv.agents as any)?.name || '-',
        amount: inv.total_amount,
        vatAmount: inv.vat_amount || 0,
        discountAmount: inv.discount_amount || 0,
        paymentStatus: inv.payment_status || 'pending',
        paymentMethod: inv.payment_method,
        createdAt: inv.created_at,
      }));

      // Calculate totals
      const totals = {
        totalRevenue: reportData.reduce((sum, r) => sum + r.amount, 0),
        totalVat: reportData.reduce((sum, r) => sum + r.vatAmount, 0),
        totalDiscount: reportData.reduce((sum, r) => sum + r.discountAmount, 0),
        invoiceCount: reportData.length,
        paidCount: reportData.filter(r => r.paymentStatus === 'paid').length,
        pendingCount: reportData.filter(r => r.paymentStatus === 'pending').length,
        overdueCount: reportData.filter(r => r.paymentStatus === 'overdue').length,
      };

      return { data: reportData, totals };
    },
  });
};

export const useAgentPerformanceReport = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['agent-performance-report', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      // Fetch all agents
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, email, monthly_target, current_sales, is_active')
        .eq('is_active', true);

      if (agentsError) throw agentsError;

      // Fetch visits for the date range
      const { data: visits, error: visitsError } = await supabase
        .from('agent_visits')
        .select('id, agent_id, outcome, invoice_id')
        .gte('visit_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('visit_date', format(dateRange.to, 'yyyy-MM-dd'));

      if (visitsError) throw visitsError;

      // Fetch invoices for the date range
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, agent_id, total_amount')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString());

      if (invoicesError) throw invoicesError;

      const reportData: AgentPerformanceData[] = (agents || []).map((agent) => {
        const agentVisits = (visits || []).filter(v => v.agent_id === agent.id);
        const agentInvoices = (invoices || []).filter(i => i.agent_id === agent.id);
        const successfulVisits = agentVisits.filter(v => v.outcome === 'sale' || v.invoice_id);
        const totalSales = agentInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

        const totalVisits = agentVisits.length;
        const invoiceCount = agentInvoices.length;
        const productivity = totalVisits > 0 ? invoiceCount / totalVisits : 0;
        const strikeRate = totalVisits > 0 ? (successfulVisits.length / totalVisits) * 100 : 0;
        const dropSize = invoiceCount > 0 ? totalSales / invoiceCount : 0;
        const achievementPercent = agent.monthly_target > 0 
          ? ((agent.current_sales || 0) / agent.monthly_target) * 100 
          : 0;

        return {
          agentId: agent.id,
          agentName: agent.name,
          email: agent.email,
          monthlyTarget: agent.monthly_target || 0,
          currentSales: agent.current_sales || 0,
          achievementPercent,
          totalVisits,
          successfulVisits: successfulVisits.length,
          invoiceCount,
          productivity,
          strikeRate,
          dropSize,
        };
      });

      const totals = {
        totalAgents: reportData.length,
        avgAchievement: reportData.length > 0 
          ? reportData.reduce((sum, r) => sum + r.achievementPercent, 0) / reportData.length 
          : 0,
        avgProductivity: reportData.length > 0 
          ? reportData.reduce((sum, r) => sum + r.productivity, 0) / reportData.length 
          : 0,
        avgStrikeRate: reportData.length > 0 
          ? reportData.reduce((sum, r) => sum + r.strikeRate, 0) / reportData.length 
          : 0,
        totalVisits: reportData.reduce((sum, r) => sum + r.totalVisits, 0),
        totalInvoices: reportData.reduce((sum, r) => sum + r.invoiceCount, 0),
      };

      return { data: reportData, totals };
    },
  });
};

export const useCustomerAnalysisReport = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['customer-analysis-report', dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, classification, city, credit_limit, current_balance');

      if (customersError) throw customersError;

      // Fetch invoices for the date range
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, customer_id, total_amount')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString());

      if (invoicesError) throw invoicesError;

      const reportData: CustomerAnalysisData[] = (customers || []).map((customer) => {
        const customerInvoices = (invoices || []).filter(i => i.customer_id === customer.id);
        const totalPurchases = customerInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

        return {
          id: customer.id,
          name: customer.name,
          classification: customer.classification || 'retail',
          city: customer.city || '-',
          creditLimit: customer.credit_limit || 0,
          currentBalance: customer.current_balance || 0,
          totalPurchases,
          invoiceCount: customerInvoices.length,
        };
      });

      // Group by classification
      const classificationStats = {
        retail: reportData.filter(c => c.classification === 'retail').length,
        key_retail: reportData.filter(c => c.classification === 'key_retail').length,
        modern_trade: reportData.filter(c => c.classification === 'modern_trade').length,
      };

      const totals = {
        totalCustomers: reportData.length,
        totalPurchases: reportData.reduce((sum, r) => sum + r.totalPurchases, 0),
        totalInvoices: reportData.reduce((sum, r) => sum + r.invoiceCount, 0),
        totalCreditLimit: reportData.reduce((sum, r) => sum + r.creditLimit, 0),
        totalBalance: reportData.reduce((sum, r) => sum + r.currentBalance, 0),
        classificationStats,
      };

      return { data: reportData, totals };
    },
  });
};

export const useInventoryReport = () => {
  return useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Fetch reconciliation items for damages and returns
      const { data: reconciliationItems, error: reconciliationError } = await supabase
        .from('reconciliation_items')
        .select('product_id, damaged_quantity, returned_quantity');

      if (reconciliationError) throw reconciliationError;

      const reportData: InventoryReportData[] = (products || []).map((product) => {
        const productRecItems = (reconciliationItems || []).filter(r => r.product_id === product.id);
        const damagedQuantity = productRecItems.reduce((sum, r) => sum + (r.damaged_quantity || 0), 0);
        const returnedQuantity = productRecItems.reduce((sum, r) => sum + (r.returned_quantity || 0), 0);
        const stockValue = (product.stock_quantity || 0) * (product.unit_price || 0);

        return {
          id: product.id,
          sku: product.sku,
          nameEn: product.name_en,
          nameAr: product.name_ar,
          category: product.category || '-',
          stockQuantity: product.stock_quantity || 0,
          minStockLevel: product.min_stock_level || 0,
          unitPrice: product.unit_price,
          cartonPrice: product.carton_price || 0,
          piecesPerCarton: product.pieces_per_carton || 1,
          stockValue,
          isLowStock: (product.stock_quantity || 0) <= (product.min_stock_level || 0),
          damagedQuantity,
          returnedQuantity,
        };
      });

      const totals = {
        totalProducts: reportData.length,
        totalStockValue: reportData.reduce((sum, r) => sum + r.stockValue, 0),
        totalDamaged: reportData.reduce((sum, r) => sum + r.damagedQuantity, 0),
        totalReturned: reportData.reduce((sum, r) => sum + r.returnedQuantity, 0),
        lowStockCount: reportData.filter(r => r.isLowStock).length,
      };

      return { data: reportData, totals };
    },
  });
};
