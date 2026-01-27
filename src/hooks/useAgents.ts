import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  monthly_target: number;
  cartons_target: number;
  tons_target: number;
  current_sales: number;
  credit_balance: number;
  can_give_discounts: boolean;
  can_add_clients: boolean;
  can_process_returns: boolean;
  is_active: boolean;
  is_online: boolean;
  last_location_lat: number | null;
  last_location_lng: number | null;
  last_seen_at: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  monthly_target?: number;
  cartons_target?: number;
  tons_target?: number;
  can_give_discounts?: boolean;
  can_add_clients?: boolean;
  can_process_returns?: boolean;
}

export const useUpdateAgentTargets = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, monthly_target, cartons_target, tons_target }: { 
      id: string; 
      monthly_target: number;
      cartons_target: number;
      tons_target: number;
    }) => {
      const { data, error } = await supabase
        .from('agents')
        .update({ monthly_target, cartons_target, tons_target })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['agent-kpis'] });
      toast({
        title: 'Targets Updated',
        description: 'Agent targets have been saved successfully',
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
      // Get current session token to authenticate edge function call
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        throw new Error('You must be logged in to create agents');
      }

      // Call edge function to create user (uses service role, won't affect admin session)
      const { data: funcData, error: funcError } = await supabase.functions.invoke('create-agent-user', {
        body: {
          email: agentData.email,
          password: agentData.password,
          name: agentData.name,
        },
      });

      if (funcError) {
        throw new Error(funcError.message || 'Failed to create agent user');
      }

      if (!funcData?.userId) {
        throw new Error(funcData?.error || 'Failed to create agent user');
      }

      // Now create the agent record with the auth user ID
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          name: agentData.name,
          email: agentData.email,
          phone: agentData.phone || null,
          monthly_target: agentData.monthly_target || 0,
          can_give_discounts: agentData.can_give_discounts || false,
          can_add_clients: agentData.can_add_clients || false,
          can_process_returns: agentData.can_process_returns || false,
          auth_user_id: funcData.userId,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Success',
        description: 'Agent created with login credentials',
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

export const useUpdateAgentCreditBalance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, credit_balance }: { id: string; credit_balance: number }) => {
      const { data, error } = await supabase
        .from('agents')
        .update({ credit_balance })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: 'Credit Balance Updated',
        description: 'Agent credit balance has been updated',
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
