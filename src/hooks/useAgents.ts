import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  monthly_target: number;
  current_sales: number;
  can_give_discounts: boolean;
  can_add_clients: boolean;
  can_process_returns: boolean;
  is_active: boolean;
  is_online: boolean;
  last_location_lat: number | null;
  last_location_lng: number | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentData {
  name: string;
  email: string;
  phone?: string;
  monthly_target?: number;
  can_give_discounts?: boolean;
  can_add_clients?: boolean;
  can_process_returns?: boolean;
}

export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Agent[];
    },
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (agentData: CreateAgentData) => {
      const { data, error } = await supabase
        .from('agents')
        .insert([agentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Success',
        description: 'Agent created successfully',
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

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agent> & { id: string }) => {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Success',
        description: 'Agent updated successfully',
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

export const useToggleAgentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('agents')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: data.is_active ? 'Agent Activated' : 'Agent Deactivated',
        description: `${data.name} has been ${data.is_active ? 'activated' : 'deactivated'}`,
        variant: data.is_active ? 'default' : 'destructive',
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

export const useUpdateAgentPermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      can_give_discounts,
      can_add_clients,
      can_process_returns,
    }: {
      id: string;
      can_give_discounts?: boolean;
      can_add_clients?: boolean;
      can_process_returns?: boolean;
    }) => {
      const updates: Partial<Agent> = {};
      if (can_give_discounts !== undefined) updates.can_give_discounts = can_give_discounts;
      if (can_add_clients !== undefined) updates.can_add_clients = can_add_clients;
      if (can_process_returns !== undefined) updates.can_process_returns = can_process_returns;

      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Permissions Updated',
        description: 'Agent permissions have been updated',
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
