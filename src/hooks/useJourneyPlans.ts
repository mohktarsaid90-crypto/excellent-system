import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JourneyPlan {
  id: string;
  agent_id: string;
  plan_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  agents?: { name: string } | null;
}

export interface JourneyStop {
  id: string;
  journey_plan_id: string;
  customer_id: string;
  stop_order: number;
  status: 'pending' | 'checked_in' | 'checked_out' | 'skipped';
  check_in_at: string | null;
  check_out_at: string | null;
  check_in_lat: number | null;
  check_in_lng: number | null;
  notes: string | null;
  created_at: string;
  customers?: { name: string; address: string | null } | null;
}

export const useJourneyPlans = () => {
  return useQuery({
    queryKey: ['journey-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_plans')
        .select(`
          *,
          agents (name)
        `)
        .order('plan_date', { ascending: false });

      if (error) throw error;
      return data as JourneyPlan[];
    },
  });
};

export const useJourneyStops = (planId: string | null) => {
  return useQuery({
    queryKey: ['journey-stops', planId],
    queryFn: async () => {
      if (!planId) return [];
      
      const { data, error } = await supabase
        .from('journey_stops')
        .select(`
          *,
          customers (name, address)
        `)
        .eq('journey_plan_id', planId)
        .order('stop_order', { ascending: true });

      if (error) throw error;
      return data as JourneyStop[];
    },
    enabled: !!planId,
  });
};

export const useCreateJourneyPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      agent_id,
      plan_date,
      created_by,
      notes,
    }: {
      agent_id: string;
      plan_date: string;
      created_by: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('journey_plans')
        .insert([{ agent_id, plan_date, created_by, notes }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-plans'] });
      toast({
        title: 'Journey Plan Created',
        description: 'The journey plan has been created successfully',
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

export const useAddJourneyStop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      journey_plan_id,
      customer_id,
      stop_order,
    }: {
      journey_plan_id: string;
      customer_id: string;
      stop_order: number;
    }) => {
      const { data, error } = await supabase
        .from('journey_stops')
        .insert([{ journey_plan_id, customer_id, stop_order }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journey-stops', variables.journey_plan_id] });
      toast({
        title: 'Stop Added',
        description: 'The stop has been added to the journey',
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
