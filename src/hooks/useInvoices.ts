import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  invoice_number: string;
  agent_id: string;
  customer_id: string;
  subtotal: number;
  discount_amount: number;
  vat_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_method: 'cash' | 'credit' | 'bank_transfer' | 'cheque' | null;
  is_synced: boolean;
  synced_at: string | null;
  offline_created: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  agents?: { name: string } | null;
  customers?: { name: string } | null;
}

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          agents (name),
          customers (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });
};

export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('total_amount, payment_status, vat_amount, discount_amount');

      if (error) throw error;

      const stats = {
        totalRevenue: 0,
        totalVat: 0,
        totalDiscounts: 0,
        pendingCount: 0,
        paidCount: 0,
        overdueCount: 0,
      };

      data?.forEach((invoice) => {
        stats.totalRevenue += Number(invoice.total_amount);
        stats.totalVat += Number(invoice.vat_amount);
        stats.totalDiscounts += Number(invoice.discount_amount);
        
        if (invoice.payment_status === 'pending') stats.pendingCount++;
        if (invoice.payment_status === 'paid') stats.paidCount++;
        if (invoice.payment_status === 'overdue') stats.overdueCount++;
      });

      return stats;
    },
  });
};
