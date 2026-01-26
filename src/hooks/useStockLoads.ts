import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StockLoad {
  id: string;
  agent_id: string;
  status: 'requested' | 'approved' | 'released' | 'rejected';
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  released_at: string | null;
  released_by: string | null;
  notes: string | null;
  created_at: string;
  agents?: { name: string } | null;
}

export interface StockLoadItem {
  id: string;
  stock_load_id: string;
  product_id: string;
  requested_quantity: number;
  approved_quantity: number | null;
  released_quantity: number | null;
  products?: { name_en: string; name_ar: string; sku: string } | null;
}

export const useStockLoads = () => {
  return useQuery({
    queryKey: ['stock-loads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_loads')
        .select(`
          *,
          agents (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StockLoad[];
    },
  });
};

export const useStockLoadItems = (stockLoadId: string | null) => {
  return useQuery({
    queryKey: ['stock-load-items', stockLoadId],
    queryFn: async () => {
      if (!stockLoadId) return [];
      
      const { data, error } = await supabase
        .from('stock_load_items')
        .select(`
          *,
          products (name_en, name_ar, sku)
        `)
        .eq('stock_load_id', stockLoadId);

      if (error) throw error;
      return data as StockLoadItem[];
    },
    enabled: !!stockLoadId,
  });
};

export const useApproveStockLoad = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, approved_by }: { id: string; approved_by: string }) => {
      const { data, error } = await supabase
        .from('stock_loads')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-loads'] });
      toast({
        title: 'Stock Load Approved',
        description: 'The stock load request has been approved',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useReleaseStockLoad = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, released_by }: { id: string; released_by: string }) => {
      const { data, error } = await supabase
        .from('stock_loads')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
          released_by,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-loads'] });
      toast({
        title: 'Stock Released',
        description: 'The stock has been released to the agent',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
