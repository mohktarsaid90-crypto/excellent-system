import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reconciliation {
  id: string;
  agent_id: string;
  date: string;
  status: 'pending' | 'submitted' | 'approved' | 'disputed';
  total_loaded: number;
  total_sold: number;
  total_returned: number;
  cash_collected: number;
  expected_cash: number;
  variance: number;
  notes: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  agents?: { name: string } | null;
}

export const useReconciliations = () => {
  return useQuery({
    queryKey: ['reconciliations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliations')
        .select(`
          *,
          agents (name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Reconciliation[];
    },
  });
};

export const useApproveReconciliation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, approved_by }: { id: string; approved_by: string }) => {
      const { data, error } = await supabase
        .from('reconciliations')
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
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      toast({
        title: 'Reconciliation Approved',
        description: 'The reconciliation has been approved',
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

export const useDisputeReconciliation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data, error } = await supabase
        .from('reconciliations')
        .update({
          status: 'disputed',
          notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      toast({
        title: 'Reconciliation Disputed',
        description: 'The reconciliation has been marked as disputed',
        variant: 'destructive',
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
